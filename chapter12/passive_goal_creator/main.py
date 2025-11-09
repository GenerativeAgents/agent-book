from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain_openai import ChatOpenAI
from pydantic import BaseModel, Field
from dotenv import load_dotenv
import argparse
import json
import re

from ..settings import Settings

class Goal(BaseModel):
    description: str = Field(..., description="目標の説明")

    @property
    def text(self) -> str:
        return f"{self.description}"


class PassiveGoalCreator:
    def __init__(
        self,
        llm: ChatOpenAI,
    ):
        self.llm = llm

    def run(self, query: str) -> Goal:
        prompt = ChatPromptTemplate.from_template(
            """
        あなたは与えられたユーザーの入力を分析し、明確で実行可能な目標を生成するAIアシスタントです。

        # 出力フォーマットに関する重要な指示
        - **必ず次のJSON形式のみ**で出力してください。
        - 一切の説明文や装飾、Markdown、自然文は含めないでください。
        - JSONのキーは必ず "description" にしてください。
        - JSONの構造例:
        {{
          "description": "ここに目標の説明文を入れる"
        }}

        # 目標生成の要件
        1. 目標は具体的かつ明確であり、実行可能なレベルで詳細化されている必要があります。
        2. あなたが実行可能な行動は以下の二つだけです:
           - インターネットを利用して、目標を達成するための調査を行う。
           - ユーザーのためのレポートを生成する。
        3. 決して2以外の行動を取ってはいけません。
        4. 出力は日本語で行ってください。

        # ユーザー入力
        {query}
        """
        )
        chain = prompt | self.llm | StrOutputParser()
        raw_output = chain.invoke({"query": query})
        # `<|...|>` のメタタグを前方だけ除去し、JSON本体を保持
        cleaned = re.sub(r"^<\|[^>]+>\s*", "", raw_output).strip()

        # 念のため JSON 部分のみ抽出（最初の { から最後の } まで）
        match = re.search(r"\{.*\}", cleaned, re.DOTALL)
        if match:
            cleaned_json = match.group(0)
            parsed = json.loads(cleaned_json)
            return Goal(description=parsed.get("description", cleaned_json))
        else:
            # JSON部分が見つからない場合はテキスト出力として処理
            return Goal(description=cleaned)


def main():

    load_dotenv()  # .env を自動読み込み

    # 確認用（削除してOK）
    import os
    print("LangChain project:", os.getenv("LANGCHAIN_PROJECT"))

    settings = Settings()

    parser = argparse.ArgumentParser(
        description="PassiveGoalCreatorを利用して目標を生成します"
    )
    parser.add_argument("--task", type=str, required=True, help="実行するタスク")
    args = parser.parse_args()

    llm = ChatOpenAI(
        base_url=settings.LMSTUDIO_BASE_URL,
        api_key="lm-studio",
        model=settings.LMSTUDIO_MODEL,
        temperature=settings.temperature
    )
    goal_creator = PassiveGoalCreator(llm=llm)
    result: Goal = goal_creator.run(query=args.task)

    print(f"{result.text}")


if __name__ == "__main__":

    main()
