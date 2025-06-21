````markdown
#  マイ読書記録アプリ

Python + Flask + SQLite + HTML/CSS/JavaScript で構成された、ブラウザ上で読書記録を登録・管理できるシンプルなWebアプリです。

趣味プログラミングのステップアップとして、初中級者が実践を通じて学べる構成になっています。

---

##  機能概要

- 書籍の登録（タイトル、著者など）
- 書籍一覧の表示、検索、更新、削除
- API通信による動的表示
- SQLiteによるデータ永続化
- Python Flaskによるバックエンド実装
- JavaScriptによる動的UI

---

##  動作確認環境

- Python 3.8以上
- Windows / macOS / Linux
- VS Code推奨

---

##  セットアップ手順

### 1. このリポジトリをクローン


### 2. Python仮想環境の作成（任意だが推奨）

```bash
python -m venv venv
```

#### Windows

```bash
venv\Scripts\activate
```

#### macOS / Linux

```bash
source venv/bin/activate
```

### 3. 必要なパッケージのインストール

```bash
pip install Flask
```

（必要に応じて `requirements.txt` を作成してください）

### 4. アプリを起動

```bash
python app.py
```

以下のような表示が出れば成功です：

```
 * Running on http://127.0.0.1:5000/ (Press CTRL+C to quit)
```

ブラウザで `http://127.0.0.1:5000/` にアクセスして、アプリを確認できます。

---

##  ディレクトリ構成(参考）

```
book-record-app/
├── app.py
├── database.db  # 自動生成されます
├── static/
│   ├── style.css
│   └── script.js
├── templates/
│   └── index.html
└── README.md
```

---

##  環境変数とAPI KEY管理（拡張用）

今後外部APIなどを利用する際は、`.env` ファイルでキー等を管理し、`.gitignore` に追加しましょう。

```env
# .env の例
API_KEY=your_secret_key_here
```

```gitignore
# .gitignore の例
.env
```

Pythonでの読み込みには `python-dotenv` パッケージが便利です：

```bash
pip install python-dotenv
```

---

##  今後の拡張アイデア

* ログイン認証（Flask-Loginなど）
* CSV形式のデータエクスポート/インポート機能
* タグ分類やジャンルフィルタ
* デプロイ（Render / Vercel / Firebase Hosting など）
* モバイル対応（レスポンシブレイアウトやPWA化）

---

##  著者

**[tugaa](https://tugaa.net/)**

**[tugaa\_dev](https://note.com/tugaa_dev)**

趣味のプログラミングとLLM応用が好きな技術好き。
記事やコードに関するご指摘・改善提案は大歓迎です。

---

## ライセンス

[MIT License](LICENSE)
