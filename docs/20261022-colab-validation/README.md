# 2026年10月の環境更新とColab検証

[トップREADMEに戻る](../../README.md)

本ページは、2026年10月のCA証明書対応、環境設定手順、Colab上での追加検証をまとめたものです。刊行時の動作確認環境はPython 3.10.12であり、今回の限定検証はPython 3.12.15で実施しています。

各章の requirements.txt はColab環境で採取したパッケージ一覧です。現在のColabの標準環境を示すものではありません。

## 環境設定とCA証明書の更新

2026年10月の [eMudhra / emSign CA証明書の問題に関するPython公式告知](https://discuss.python.org/t/information-for-python-users-regarding-emudhra-emsign-ca-certificate-security-incident/109576) に対応し、各章の certifi を `2026.10.19` に更新しています。pip 自身もCA証明書を内蔵するため、アプリケーションの certifi とは別に更新します。

各ノートブックを上から実行すると、インストールセルで指定したバージョンのパッケージが導入されます。これらに合わせ、Google Colab では Python 3.12 のランタイムを選んでください。2026年10月22日に確認した標準ランタイムは Python 3.13 であり、第6・7・12章のセルで指定している numpy `1.26.4` や faiss-cpu `1.8.0.post1` の対応wheelがありません。「ランタイム」→「ランタイムのタイプを変更」→「ランタイムのバージョン」で、Python 3.12 を含む過去の版（例: `2026.07`）を選択してください。利用できる版は [Colab公式の一覧](https://research.google.com/colaboratory/runtime-version-faq.html) を確認してください。過去の版の提供期間は公開から1年間です。

新しいランタイムで各ノートブック冒頭の「パッケージ導入前の準備」を実行してから、章のコードを順に実行してください。このセルは、公式告知のSHA-256付きURLから pip `26.2.2` を導入し、certifi `2026.10.19` をインストールします。途中から再開する場合は、ランタイムを再起動して準備セルから実行してください。

ローカルでは、OSのCA証明書を本問題の対応版に更新したうえで、Python 3.10〜3.12 の新しい仮想環境内で次を実行してください。

```bash
python -m pip --disable-pip-version-check install --upgrade --no-deps "pip @ https://files.pythonhosted.org/packages/3f/06/3e4420302363fbb71be3c7f35ce042f54bfca330e3e66b3a2e3c4cca579f/pip-26.2.2-py3-none-any.whl#sha256=fd7f4dfa8190e014013b9f08f3e973f4e4c26ffd179a204895533a7254813a70"
python -m pip install --upgrade --no-deps certifi==2026.10.19
```

続いて、実行する章のノートブックの `pip install` セルに示すパッケージを同じバージョンで導入してください。requirements.txt はColab環境全体の記録であり、Colab内にしかない `file:///colabtools/...` やPython・GPU固有のwheelを含むため、任意のローカル環境での一括導入には使えません。第10章・第12章をPoetryで導入する場合は、更新済みの `pyproject.toml` と `poetry.lock` を一緒に使用し、各章のディレクトリで `poetry install --no-root` を実行してください。

certifi 以外の既存依存バージョンは変更していません。

## Colab上での追加検証（2026年10月22日）

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

[詳細結果](results.json) と [各環境で生成したrequirements](requirements/) を保存しています。requirementsは不整合を含む観測記録であり、配布用の依存定義として置き換えたものではありません。

