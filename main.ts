import { ChatOpenAI } from "@langchain/openai";
import { TavilySearchResults } from "@langchain/community/tools/tavily_search";
import { ChatPromptTemplate, SystemMessagePromptTemplate, HumanMessagePromptTemplate } from "@langchain/core/prompts";
import { StructuredOutputParser, StringOutputParser } from "@langchain/core/output_parsers";
import { StateGraph, END } from "langgraph/graph";
import { createReactAgent } from "langgraph/prebuilt";
import { z } from "zod";

// Role type definition
const RoleSchema = z.object({
  name: z.string().describe("役割の名前"),
  description: z.string().describe("役割の詳細な説明"),
  keySkills: z.array(z.string()).describe("この役割に必要な主要なスキルや属性"),
});
type Role = z.infer<typeof RoleSchema>;

// Task type definition
const TaskSchema = z.object({
  description: z.string().describe("タスクの説明"),
  role: RoleSchema.optional().describe("タスクに割り当てられた役割"),
});
type Task = z.infer<typeof TaskSchema>;

// TasksWithRoles type definition
const TasksWithRolesSchema = z.object({
  tasks: z.array(TaskSchema).describe("役割が割り当てられたタスクのリスト"),
});
type TasksWithRoles = z.infer<typeof TasksWithRolesSchema>;

// AgentState type definition
const AgentStateSchema = z.object({
  query: z.string().describe("ユーザーが入力したクエリ"),
  tasks: z.array(TaskSchema).describe("実行するタスクのリスト").default([]),
  currentTaskIndex: z.number().describe("現在実行中のタスクの番号").default(0),
  results: z.array(z.string()).describe("実行済みタスクの結果リスト").default([]),
  finalReport: z.string().describe("最終的な出力結果").default(""),
});
type AgentState = z.infer<typeof AgentStateSchema>;

class Planner {
  private queryDecomposer: QueryDecomposer;

  constructor(llm: ChatOpenAI) {
    this.queryDecomposer = new QueryDecomposer(llm);
  }

  async run(query: string): Promise<Task[]> {
    const decomposedTasks = await this.queryDecomposer.run(query);
    return decomposedTasks.values.map(task => ({ description: task }));
  }
}

class RoleAssigner {
  private llm: ChatOpenAI;

  constructor(llm: ChatOpenAI) {
    this.llm = llm;
  }

  async run(tasks: Task[]): Promise<Task[]> {
    const prompt = ChatPromptTemplate.fromMessages([
      SystemMessagePromptTemplate.fromTemplate(
        "あなたは創造的な役割設計の専門家です。与えられたタスクに対して、ユニークで適切な役割を生成してください。"
      ),
      HumanMessagePromptTemplate.fromTemplate(
        "タスク:\n{tasks}\n\n" +
        "これらのタスクに対して、以下の指示に従って役割を割り当ててください：\n" +
        "1. 各タスクに対して、独自の創造的な役割を考案してください。既存の職業名や一般的な役割名にとらわれる必要はありません。\n" +
        "2. 役割名は、そのタスクの本質を反映した魅力的で記憶に残るものにしてください。\n" +
        "3. 各役割に対して、その役割がなぜそのタスクに最適なのかを説明する詳細な説明を提供してください。\n" +
        "4. その役割が効果的にタスクを遂行するために必要な主要なスキルやアトリビュートを3つ挙げてください。\n\n" +
        "創造性を発揮し、タスクの本質を捉えた革新的な役割を生成してください。"
      ),
    ]);

    const chain = prompt.pipe(this.llm).pipe(StructuredOutputParser.fromZodSchema(TasksWithRolesSchema));
    const tasksWithRoles = await chain.invoke({
      tasks: tasks.map(task => task.description).join("\n"),
    });

    return tasksWithRoles.tasks;
  }
}

class Executor {
  private llm: ChatOpenAI;
  private tools: TavilySearchResults[];
  private baseAgent: ReturnType<typeof createReactAgent>;

  constructor(llm: ChatOpenAI) {
    this.llm = llm;
    this.tools = [new TavilySearchResults({ maxResults: 3 })];
    this.baseAgent = createReactAgent(this.llm, this.tools);
  }

  async run(task: Task): Promise<string> {
    const result = await this.baseAgent.invoke({
      messages: [
        {
          role: "system",
          content: 
            `あなたは${task.role!.name}です。\n` +
            `説明: ${task.role!.description}\n` +
            `主要なスキル: ${task.role!.keySkills.join(", ")}\n` +
            "あなたの役割に基づいて、与えられたタスクを最高の能力で遂行してください。",
        },
        {
          role: "human",
          content: `以下のタスクを実行してください：\n\n${task.description}`,
        },
      ],
    });

    return result.messages[result.messages.length - 1].content;
  }
}

class Reporter {
  private llm: ChatOpenAI;

  constructor(llm: ChatOpenAI) {
    this.llm = llm;
  }

  async run(query: string, results: string[]): Promise<string> {
    const prompt = ChatPromptTemplate.fromMessages([
      SystemMessagePromptTemplate.fromTemplate(
        "あなたは総合的なレポート作成の専門家です。複数の情報源からの結果を統合し、洞察力に富んだ包括的なレポートを作成する能力があります。"
      ),
      HumanMessagePromptTemplate.fromTemplate(
        "タスク: 以下の情報に基づいて、包括的で一貫性のある回答を作成してください。\n" +
        "要件:\n" +
        "1. 提供されたすべての情報を統合し、よく構成された回答にしてください。\n" +
        "2. 回答は元のクエリに直接応える形にしてください。\n" +
        "3. 各情報の重要なポイントや発見を含めてください。\n" +
        "4. 最後に結論や要約を提供してください。\n" +
        "5. 回答は詳細でありながら簡潔にし、250〜300語程度を目指してください。\n" +
        "6. 回答は日本語で行ってください。\n\n" +
        "ユーザーの依頼: {query}\n\n" +
        "収集した情報:\n{results}"
      ),
    ]);

    const chain = prompt.pipe(this.llm).pipe(new StringOutputParser());
    return await chain.invoke({
      query,
      results: results.map((result, i) => `Info ${i + 1}:\n${result}`).join("\n\n"),
    });
  }
}

export class RoleBasedCooperation {
  private llm: ChatOpenAI;
  private planner: Planner;
  private roleAssigner: RoleAssigner;
  private executor: Executor;
  private reporter: Reporter;
  private graph: StateGraph<typeof AgentStateSchema>;

  constructor(llm: ChatOpenAI) {
    this.llm = llm;
    this.planner = new Planner(llm);
    this.roleAssigner = new RoleAssigner(llm);
    this.executor = new Executor(llm);
    this.reporter = new Reporter(llm);
    this.graph = this.createGraph();
  }

  private createGraph(): StateGraph<typeof AgentStateSchema> {
    const workflow = new StateGraph(AgentStateSchema);

    workflow.addNode("planner", this.planTasks.bind(this));
    workflow.addNode("roleAssigner", this.assignRoles.bind(this));
    workflow.addNode("executor", this.executeTask.bind(this));
    workflow.addNode("reporter", this.generateReport.bind(this));

    workflow.setEntryPoint("planner");

    workflow.addEdge("planner", "roleAssigner");
    workflow.addEdge("roleAssigner", "executor");
    workflow.addConditionalEdges(
      "executor",
      (state: AgentState) => state.currentTaskIndex < state.tasks.length,
      { true: "executor", false: "reporter" }
    );

    workflow.addEdge("reporter", END);

    return workflow.compile();
  }

  private async planTasks(state: AgentState): Promise<Partial<AgentState>> {
    const tasks = await this.planner.run(state.query);
    return { tasks };
  }

  private async assignRoles(state: AgentState): Promise<Partial<AgentState>> {
    const tasksWithRoles = await this.roleAssigner.run(state.tasks);
    return { tasks: tasksWithRoles };
  }

  private async executeTask(state: AgentState): Promise<Partial<AgentState>> {
    const currentTask = state.tasks[state.currentTaskIndex];
    const result = await this.executor.run(currentTask);
    return {
      results: [result],
      currentTaskIndex: state.currentTaskIndex + 1,
    };
  }

  private async generateReport(state: AgentState): Promise<Partial<AgentState>> {
    const report = await this.reporter.run(state.query, state.results);
    return { finalReport: report };
  }

  async run(query: string): Promise<string> {
    const initialState: AgentState = {
      query,
      tasks: [],
      currentTaskIndex: 0,
      results: [],
      finalReport: "",
    };
    const finalState = await this.graph.invoke(initialState, { recursionLimit: 1000 });
    return finalState.finalReport;
  }
}

// Main execution
if (require.main === module) {
  const main = async () => {
    const settings = await import("./settings");
    const llm = new ChatOpenAI({
      modelName: settings.openaiSmartModel,
      temperature: settings.temperature,
    });
    
    const agent = new RoleBasedCooperation(llm);
    const result = await agent.run(process.argv[2]);
    console.log(result);
  };

  main().catch(console.error);
} 