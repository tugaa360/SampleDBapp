from flask import Flask, render_template, request, jsonify
import sqlite3
import os

app = Flask(__name__)
# データベースファイルのパス
DATABASE = os.path.join(app.root_path, 'database.db')

# データベースの初期化（テーブル作成）
def init_db():
    with sqlite3.connect(DATABASE) as conn:
        cursor = conn.cursor()
        # booksテーブルが存在しない場合のみ作成
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS books (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT NOT NULL,
                subtitle TEXT,
                author TEXT NOT NULL,
                publisher TEXT,
                publication_date TEXT, -- 発行年月日 (YYYY-MM-DD形式)
                read_date TEXT,       -- 読んだ日 (YYYY-MM-DD形式)
                review TEXT
            )
        ''')
        conn.commit()

# アプリケーション起動時にデータベースを初期化
init_db()

# --- ルート（HTMLページの提供）---
@app.route('/')
def index():
    return render_template('index.html')

# --- APIエンドポイント ---

# API: 全ての書籍を取得
@app.route('/api/books', methods=['GET'])
def get_books():
    with sqlite3.connect(DATABASE) as conn:
        conn.row_factory = sqlite3.Row # カラム名でアクセスできるように設定
        cursor = conn.cursor()
        cursor.execute('SELECT * FROM books ORDER BY read_date DESC, title ASC') # 読んだ日の降順、タイトル名の昇順でソート
        books = [dict(row) for row in cursor.fetchall()]
    return jsonify(books)

# API: 新しい書籍を追加
@app.route('/api/books', methods=['POST'])
def add_book():
    data = request.json
    title = data.get('title')
    subtitle = data.get('subtitle')
    author = data.get('author')
    publisher = data.get('publisher')
    publication_date = data.get('publication_date')
    read_date = data.get('read_date')
    review = data.get('review')

    # タイトルと著者は必須項目とする
    if not all([title, author]):
        return jsonify({"error": "タイトルと著者は必須です。"}), 400

    try:
        with sqlite3.connect(DATABASE) as conn:
            cursor = conn.cursor()
            cursor.execute(
                'INSERT INTO books (title, subtitle, author, publisher, publication_date, read_date, review) VALUES (?, ?, ?, ?, ?, ?, ?)',
                (title, subtitle, author, publisher, publication_date, read_date, review)
            )
            conn.commit()
            new_book_id = cursor.lastrowid
            return jsonify({"message": "書籍が正常に追加されました。", "id": new_book_id}), 201
    except sqlite3.Error as e:
        return jsonify({"error": f"データベースエラー: {e}"}), 500

# API: 書籍をIDで更新
@app.route('/api/books/<int:book_id>', methods=['PUT'])
def update_book(book_id):
    data = request.json
    title = data.get('title')
    subtitle = data.get('subtitle')
    author = data.get('author')
    publisher = data.get('publisher')
    publication_date = data.get('publication_date')
    read_date = data.get('read_date')
    review = data.get('review')

    if not all([title, author]):
        return jsonify({"error": "タイトルと著者は必須です。"}), 400

    try:
        with sqlite3.connect(DATABASE) as conn:
            cursor = conn.cursor()
            cursor.execute(
                '''UPDATE books SET title=?, subtitle=?, author=?, publisher=?, publication_date=?, read_date=?, review=? WHERE id=?''',
                (title, subtitle, author, publisher, publication_date, read_date, review, book_id)
            )
            conn.commit()
            if cursor.rowcount == 0:
                return jsonify({"error": "指定されたIDの書籍が見つかりません。"}), 404
            return jsonify({"message": "書籍が正常に更新されました。"}), 200
    except sqlite3.Error as e:
        return jsonify({"error": f"データベースエラー: {e}"}), 500

# API: 書籍をIDで削除
@app.route('/api/books/<int:book_id>', methods=['DELETE'])
def delete_book(book_id):
    try:
        with sqlite3.connect(DATABASE) as conn:
            cursor = conn.cursor()
            cursor.execute('DELETE FROM books WHERE id=?', (book_id,))
            conn.commit()
            if cursor.rowcount == 0:
                return jsonify({"error": "指定されたIDの書籍が見つかりません。"}), 404
            return jsonify({"message": "書籍が正常に削除されました。"}), 200
    except sqlite3.Error as e:
        return jsonify({"error": f"データベースエラー: {e}"}), 500

# API: 書籍を検索 (タイトル、著者、感想などで)
@app.route('/api/search_books', methods=['GET'])
def search_books():
    query = request.args.get('q', '').lower()
    if not query:
        return get_books() # クエリがない場合は全件返す

    with sqlite3.connect(DATABASE) as conn:
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        cursor.execute(
            'SELECT * FROM books WHERE LOWER(title) LIKE ? OR LOWER(author) LIKE ? OR LOWER(review) LIKE ? ORDER BY read_date DESC, title ASC',
            (f'%{query}%', f'%{query}%', f'%{query}%')
        )
        results = [dict(row) for row in cursor.fetchall()]
    return jsonify(results)

if __name__ == '__main__':
    app.run(debug=True) # 開発中はdebug=Trueで変更が自動反映