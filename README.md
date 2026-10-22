<div align="center">

<a href="https://www.amazon.co.jp/dp/4297145308"><img src="assets/cover.jpg" width="200" alt="書影"></a>

# LangChain と LangGraph による RAG・AI エージェント［実践］入門

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](./LICENSE)
[![LangChain](https://img.shields.io/badge/LangChain-1C3C3C?style=for-the-badge&logo=langchain&logoColor=white)](https://github.com/langchain-ai/langchain)
[![LangGraph](https://img.shields.io/badge/LangGraph-FF6F00?style=for-the-badge&logoColor=white)](https://github.com/langchain-ai/langgraph)
[![Python](https://img.shields.io/badge/Python-3.10-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://www.python.org/)

</div>

## 各章のソースコード

| 章                                                                  | ソースコード                                                                                                                                                                          |
| ------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 第 1 章 LLM アプリケーション開発の基礎                              | -                                                                                                                                                                                     |
| 第 2 章 OpenAI の チャット API の基礎                               | [![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/GenerativeAgents/agent-book/blob/main/chapter02/notebook.ipynb) |
| 第 3 章 プロンプトエンジニアリング                                  | [![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/GenerativeAgents/agent-book/blob/main/chapter03/notebook.ipynb) |
| 第 4 章 LangChain の基礎                                            | [![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/GenerativeAgents/agent-book/blob/main/chapter04/notebook.ipynb) |
| 第 5 章 LangChain Expression Language（LCEL）徹底解説               | [![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/GenerativeAgents/agent-book/blob/main/chapter05/notebook.ipynb) |
| 第 6 章 Advanced RAG                                                | [![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/GenerativeAgents/agent-book/blob/main/chapter06/notebook.ipynb) |
| 第 7 章 LangSmith を使った RAG アプリケーションの評価               | [![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/GenerativeAgents/agent-book/blob/main/chapter07/notebook.ipynb) |
| 第 8 章 AI エージェントとは                                         | -                                                                                                                                                                                     |
| 第 9 章 LangGraph で作る AI エージェント実践入門                    | [![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/GenerativeAgents/agent-book/blob/main/chapter09/notebook.ipynb) |
| 第 10 章 要件定義書生成 AI エージェントの開発                       | [![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/GenerativeAgents/agent-book/blob/main/chapter10/notebook.ipynb) |
| 第 11 章 エージェントデザインパターン                               | -                                                                                                                                                                                     |
| 第 12 章 LangChain/LangGraph で実装するエージェントデザインパターン | [![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/GenerativeAgents/agent-book/blob/main/chapter12/notebook.ipynb) |

## 動作確認環境

本書のソースコードは以下の環境・バージョンで動作確認しました。

- Google Colab
- Python 3.10.12

Python パッケージの動作確認済みバージョンは、各章のディレクトリの requirements.txt を参照してください。

### 新しく環境を作る際のCA証明書の更新

2026年10月の [eMudhra / emSign CA証明書の問題に関するPython公式告知](https://discuss.python.org/t/information-for-python-users-regarding-emudhra-emsign-ca-certificate-security-incident/109576) に対応し、各章の certifi を `2026.10.19` に更新しています。pip 自身もCA証明書を内蔵するため、アプリケーションの certifi とは別に更新します。

各ノートブックを上から実行すると、インストールセルで指定したバージョンのパッケージが導入されます。これらに合わせ、Google Colab では Python 3.12 のランタイムを選んでください。2026年10月22日に確認した標準ランタイムは Python 3.13 であり、第6・7・12章のセルで指定している numpy `1.26.4` や faiss-cpu `1.8.0.post1` の対応wheelがありません。「ランタイム」→「ランタイムのタイプを変更」→「ランタイムのバージョン」で、Python 3.12 を含む過去の版（例: `2026.07`）を選択してください。利用できる版は [Colab公式の一覧](https://research.google.com/colaboratory/runtime-version-faq.html) を確認してください。過去の版の提供期間は公開から1年間です。

新しいランタイムで各ノートブック冒頭の「パッケージ導入前の準備」を実行してから、章のコードを順に実行してください。このセルは、公式告知のSHA-256付きURLから pip `26.2.2` を導入し、certifi `2026.10.19` をインストールします。途中から再開する場合は、ランタイムを再起動して準備セルから実行してください。

ローカルでは、OSのCA証明書を本問題の対応版に更新したうえで、Python 3.10〜3.12 の新しい仮想環境内で次を実行してください。

```bash
python -m pip --disable-pip-version-check install --upgrade --no-deps "pip @ https://files.pythonhosted.org/packages/3f/06/3e4420302363fbb71be3c7f35ce042f54bfca330e3e66b3a2e3c4cca579f/pip-26.2.2-py3-none-any.whl#sha256=fd7f4dfa8190e014013b9f08f3e973f4e4c26ffd179a204895533a7254813a70"
python -m pip install --upgrade --no-deps certifi==2026.10.19
```

続いて、実行する章のノートブックの `pip install` セルに示すパッケージを同じバージョンで導入してください。requirements.txt はColab環境全体の記録であり、Colab内にしかない `file:///colabtools/...` やPython・GPU固有のwheelを含むため、任意のローカル環境での一括導入には使えません。第10章・第12章をPoetryで導入する場合は、更新済みの `pyproject.toml` と `poetry.lock` を一緒に使用し、各章のディレクトリで `poetry install --no-root` を実行してください。

certifi 以外の既存依存バージョンは変更していません。上記の動作確認環境は刊行時の記録です。

### Colab上での追加検証（2026年10月22日）

Colab CLI `0.7.5` で新しいCPUランタイムを作成し、その中の独立した Python `3.12.15` 仮想環境で、各章の個別インストールを記載順に実行しました。第10・12章のPoetry lockは、ハッシュ付きrequirementsに書き出して別環境へ導入しました。全11環境で、pip `26.2.2` / certifi `2026.10.19` の導入と、certifiを使ったPyPIへのHTTPS接続が成功しています。

| 環境 | pip check | 読み込み・ローカル処理 | 明示した版の保持 |
| --- | --- | --- | --- |
| 第2章 | 成功 | 成功 | 成功 |
| 第3章 | 成功 | 成功 | 成功 |
| 第4章 | 不整合あり | 成功 | 変更あり |
| 第5章 | 成功 | エラーあり | 成功 |
| 第6章 | 成功 | 成功 | 変更あり |
| 第7章 | 成功 | エラーあり | 成功 |
| 第9章 | 成功 | 成功 | 成功 |
| 第10章・ノートブック | 不整合あり | 成功 | 成功 |
| 第12章・ノートブック | 成功 | 成功 | 成功 |
| 第10章・Poetry lock | 成功 | 成功 | lockのハッシュを検証 |
| 第12章・Poetry lock | 成功 | 成功 | lockのハッシュを検証 |

検出した既存の依存問題は以下のとおりです。今回のCA対応では、これらを解消するための依存変更は行っていません。

- 第4章: 後続インストールにより `langchain-core` と `pydantic` の版が変わり、`langchain` と `langchain-text-splitters` の依存条件が不一致になります。
- 第5章: SQLChatMessageHistoryの読み込みに必要な `greenlet` が不足します。
- 第6章: Cohere関連のインストールにより `langchain-core` が指定版から変わります。
- 第7章: 新しいpyarrowが要求するNumPyの版と、固定した `numpy==1.26.4` が合わず、Ragasの読み込みに失敗します。
- 第10章・ノートブック: `langchain==0.3.23` の `--no-deps` 導入により、依存の不足と版の不一致が残ります。

実行したのはライブラリの読み込み、クライアントの生成、APIを呼ばないLCEL・LangGraph処理、グラフ描画、FAISS検索などです。外部AI API、Colabのシークレット・Drive・ウィジェット、ノートブック全体の実行、過去ランタイム `2026.07` のイメージ自体は未検証です。OS側のCAストアによる事故対応の判定も含みません。

[詳細結果](docs/20261022-colab-validation/results.json) と [各環境で生成したrequirements](docs/20261022-colab-validation/requirements) を保存しています。requirementsは不整合を含む観測記録であり、配布用の依存定義として置き換えたものではありません。

## 既知のエラー

### Python パッケージのバージョンに起因するエラー

- httpx
  - openai パッケージが依存する httpx のアップデートにより、`openai==1.40.6` を使用する箇所で `TypeError: Client.__init__() got an unexpected keyword argument 'proxies'` というエラーが発生するようになりました。
  - このエラーは、`!pip install httpx==0.27.2` のように、httpx の特定バージョンをインストールすることで回避できます。
- pydantic
  - pydantic のアップデートにより、明示的に pydantic のバージョンを指定していない箇所で ChatOpenAI などを使用すると、`PydanticUserError: 'ChatOpenAI' is not fully defined; you should define 'BaseCache', then call 'ChatOpenAI.model_rebuild()'.` というエラーが発生するようになりました。
  - このエラーは、`!pip install pydantic==2.10.6` のように、pydantic の特定バージョンをインストールすることで回避できます。
- numpy
  - Google Colab にデフォルトでインストールされている numpy のバージョンが更新されたことにより、6 章の「Cohere のリランクモデルの導入」箇所などで `ValueError: numpy.dtype size changed, may indicate binary incompatibility. Expected 96 from C header, got 88 from PyObject` というエラーが発生するようになりました。
  - このエラーは、`!pip install numpy==1.26.4` のように、numpy の特定バージョンをインストールして、Google Colab の「ランタイム」から「セッションを再起動する」を実行することで回避できます。

> [!WARNING]
> Google Colab で一度上記のエラーに遭遇したあとで `!pip install httpx==0.27.2` のようにパッケージをインストールし直した場合、以下のどちらかの操作を実施する必要があります。
>
> - Google Colab の「ランタイム」から「セッションを再起動する」を実行する
> - 「ランタイムを接続解除して削除」を実行してパッケージのインストールからやり直す

### 「7.4 Ragas による合成テストデータの生成」における RateLimitError

「7.4 Ragas による合成テストデータの生成」において、gpt-4o を使用すると OpenAI API の Usage tier 次第で RateLimitError が発生することが報告されています。

OpenAI API の Usage tier については公式ドキュメントの以下のページを参照してください。

https://platform.openai.com/docs/guides/rate-limits/usage-tiers

このエラーが発生した場合は、以下のどちらかの対応を実施してください。

1. 同じ Tier でも gpt-4o よりレートリミットの高い gpt-4o-mini を使用する
   - この場合、生成される合成テストデータの品質は低くなることが想定されます
2. 課金などにより Tier を上げる
   - Tier 2 で RateLimitError が発生しないことを確認済みです (2024 年 10 月 31 日時点)

#### 2025/3/15 追記

LangChain のドキュメントの増加により、gpt-4o-mini を使用しても Tier 1 ではエラーが発生することが報告されています。

その場合、GitHub からドキュメントをロードする箇所で、以下のように `langchain==0.2.13` という動作確認済みのバージョンを指定するようにしてください。

```python
loader = GitLoader(
    clone_url="https://github.com/langchain-ai/langchain",
    repo_path="./langchain",
    branch="langchain==0.2.13",
    file_filter=file_filter,
)
```

## 書籍の誤り・エラーについて

書籍の誤り（誤字など）や、発生したエラーについては、GitHub の Issue からご連絡ください。

https://github.com/GenerativeAgents/agent-book/issues

## 書籍刊行後のアップデート・正誤表

- [書籍刊行後のアップデート](./updates.md)
- [正誤表](./errata.md)

## リンク

- [技術評論社](https://gihyo.jp/book/2024/978-4-297-14530-9)
- [Amazon](https://www.amazon.co.jp/dp/4297145308)
