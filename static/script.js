document.addEventListener('DOMContentLoaded', () => {
    const booksContainer = document.getElementById('booksContainer');
    const addBookBtn = document.getElementById('addBookBtn');
    const updateBookBtn = document.getElementById('updateBookBtn');
    const clearFormBtn = document.getElementById('clearFormBtn');
    const searchBookBtn = document.getElementById('searchBookBtn');
    const resetSearchBtn = document.getElementById('resetSearchBtn');

    const bookTitleInput = document.getElementById('bookTitle');
    const bookSubtitleInput = document.getElementById('bookSubtitle');
    const bookAuthorInput = document.getElementById('bookAuthor');
    const bookPublisherInput = document.getElementById('bookPublisher');
    const bookPublicationDateInput = document.getElementById('bookPublicationDate');
    const bookReadDateInput = document.getElementById('bookReadDate');
    const bookReviewInput = document.getElementById('bookReview');
    const searchQueryInput = document.getElementById('searchBookQuery');

    let currentEditingBookId = null; // 編集中書籍のIDを保持

    // フォームをクリアする関数
    function clearForm() {
        bookTitleInput.value = '';
        bookSubtitleInput.value = '';
        bookAuthorInput.value = '';
        bookPublisherInput.value = '';
        bookPublicationDateInput.value = '';
        bookReadDateInput.value = '';
        bookReviewInput.value = '';
        addBookBtn.style.display = 'inline-block'; // 登録ボタンを表示
        updateBookBtn.style.display = 'none';      // 更新ボタンを非表示
        currentEditingBookId = null;
    }

    // 全書籍を表示する関数
    async function fetchAndDisplayBooks(query = '') {
        let url = '/api/books';
        if (query) {
            url = `/api/search_books?q=${encodeURIComponent(query)}`;
        }

        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const books = await response.json();
            booksContainer.innerHTML = ''; // 一旦クリア

            if (books.length === 0) {
                booksContainer.innerHTML = '<p>書籍が見つかりませんでした。</p>';
                return;
            }

            books.forEach(book => {
                const bookDiv = document.createElement('div');
                bookDiv.classList.add('book-item');
                bookDiv.dataset.bookId = book.id; // データIDをHTML要素に付与

                bookDiv.innerHTML = `
                    <h3>${book.title}</h3>
                    ${book.subtitle ? `<p class="subtitle">副題: ${book.subtitle}</p>` : ''}
                    <p>著者: ${book.author}</p>
                    ${book.publisher ? `<p>出版社: ${book.publisher}</p>` : ''}
                    ${book.publication_date ? `<p>発行年月日: ${book.publication_date}</p>` : ''}
                    ${book.read_date ? `<p>読んだ日: ${book.read_date}</p>` : ''}
                    ${book.review ? `<p class="review-text">感想:<br>${book.review.replace(/\n/g, '<br>')}</p>` : ''}
                    <div class="actions">
                        <button class="edit-btn" data-id="${book.id}">編集</button>
                        <button class="delete-btn" data-id="${book.id}">削除</button>
                    </div>
                `;
                booksContainer.appendChild(bookDiv);
            });
            // 編集・削除ボタンにイベントリスナーを付与
            document.querySelectorAll('.edit-btn').forEach(button => {
                button.addEventListener('click', handleEdit);
            });
            document.querySelectorAll('.delete-btn').forEach(button => {
                button.addEventListener('click', handleDelete);
            });

        } catch (error) {
            console.error("書籍の取得または表示に失敗しました:", error);
            booksContainer.innerHTML = '<p>書籍の読み込み中にエラーが発生しました。</p>';
        }
    }

    // 書籍追加ボタンのイベントリスナー
    addBookBtn.addEventListener('click', async () => {
        const title = bookTitleInput.value.trim();
        const subtitle = bookSubtitleInput.value.trim();
        const author = bookAuthorInput.value.trim();
        const publisher = bookPublisherInput.value.trim();
        const publication_date = bookPublicationDateInput.value;
        const read_date = bookReadDateInput.value;
        const review = bookReviewInput.value.trim();

        if (!title || !author) {
            alert('タイトルと著者は必須です！');
            return;
        }

        try {
            const response = await fetch('/api/books', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title, subtitle, author, publisher, publication_date, read_date, review }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`HTTP error! status: ${response.status}, message: ${errorData.error || '不明なエラー'}`);
            }

            const result = await response.json();
            alert('書籍を登録しました！');
            clearForm(); // フォームをクリア
            fetchAndDisplayBooks(); // 最新の書籍リストを再表示
        } catch (error) {
            console.error("書籍の追加に失敗しました:", error);
            alert(`書籍の追加に失敗しました: ${error.message}`);
        }
    });

    // 書籍更新ボタンのイベントリスナー
    updateBookBtn.addEventListener('click', async () => {
        if (!currentEditingBookId) return; // 編集中IDがない場合は何もしない

        const title = bookTitleInput.value.trim();
        const subtitle = bookSubtitleInput.value.trim();
        const author = bookAuthorInput.value.trim();
        const publisher = bookPublisherInput.value.trim();
        const publication_date = bookPublicationDateInput.value;
        const read_date = bookReadDateInput.value;
        const review = bookReviewInput.value.trim();

        if (!title || !author) {
            alert('タイトルと著者は必須です！');
            return;
        }

        try {
            const response = await fetch(`/api/books/${currentEditingBookId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title, subtitle, author, publisher, publication_date, read_date, review }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`HTTP error! status: ${response.status}, message: ${errorData.error || '不明なエラー'}`);
            }

            const result = await response.json();
            alert('書籍を更新しました！');
            clearForm(); // フォームをクリア
            fetchAndDisplayBooks(); // 最新の書籍リストを再表示
        } catch (error) {
            console.error("書籍の更新に失敗しました:", error);
            alert(`書籍の更新に失敗しました: ${error.message}`);
        }
    });


    // 編集ボタンクリック時の処理
    async function handleEdit(event) {
        const bookIdToEdit = event.target.dataset.id;
        const response = await fetch(`/api/books`); // 全件取得して該当IDを探す（本来はIDで個別取得APIが望ましい）
        const books = await response.json();
        const bookToEdit = books.find(book => book.id == bookIdToEdit); // == で型変換

        if (bookToEdit) {
            bookTitleInput.value = bookToEdit.title;
            bookSubtitleInput.value = bookToEdit.subtitle || '';
            bookAuthorInput.value = bookToEdit.author;
            bookPublisherInput.value = bookToEdit.publisher || '';
            bookPublicationDateInput.value = bookToEdit.publication_date || '';
            bookReadDateInput.value = bookToEdit.read_date || '';
            bookReviewInput.value = bookToEdit.review || '';

            addBookBtn.style.display = 'none'; // 登録ボタンを非表示
            updateBookBtn.style.display = 'inline-block'; // 更新ボタンを表示
            currentEditingBookId = bookToEdit.id;
        } else {
            alert('編集対象の書籍が見つかりませんでした。');
        }
    }

    // 削除ボタンクリック時の処理
    async function handleDelete(event) {
        const bookIdToDelete = event.target.dataset.id;
        if (confirm('本当にこの書籍を削除しますか？')) {
            try {
                const response = await fetch(`/api/books/${bookIdToDelete}`, {
                    method: 'DELETE',
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(`HTTP error! status: ${response.status}, message: ${errorData.error || '不明なエラー'}`);
                }

                alert('書籍を削除しました！');
                fetchAndDisplayBooks(); // 削除後に最新の書籍リストを再表示
            } catch (error) {
                console.error("書籍の削除に失敗しました:", error);
                alert(`書籍の削除に失敗しました: ${error.message}`);
            }
        }
    }

    // 検索ボタンのイベントリスナー
    searchBookBtn.addEventListener('click', () => {
        const query = searchQueryInput.value.trim();
        fetchAndDisplayBooks(query);
    });

    // 検索リセット（全件表示）ボタンのイベントリスナー
    resetSearchBtn.addEventListener('click', () => {
        searchQueryInput.value = ''; // 検索クエリをクリア
        fetchAndDisplayBooks();      // 全件表示
    });

    // フォームクリアボタンのイベントリスナー
    clearFormBtn.addEventListener('click', clearForm);

    // 初期表示
    fetchAndDisplayBooks();
});
