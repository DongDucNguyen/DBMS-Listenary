import '../pages.css';
import '../search.css';
import { MockDbService } from '../services/MockDbService.js';

const SEARCH_MODES = [
  { id: 'all', label: 'Tất cả', icon: 'fa-border-all' },
  { id: 'book', label: 'Tên sách', icon: 'fa-book-open' },
  { id: 'author', label: 'Tác giả', icon: 'fa-pen-nib' },
  { id: 'genre', label: 'Thể loại', icon: 'fa-layer-group' },
  { id: 'meta', label: 'Thuộc tính', icon: 'fa-sliders' },
];

const RESULT_TYPES = [
  { id: 'all', label: 'Tất cả' },
  { id: 'book', label: 'Sách' },
  { id: 'author', label: 'Tác giả' },
];

const EXTRA_GENRES = {
  philo: { label: 'Triết học', ids: [1, 2, 3, 4, 5] },
  self: { label: 'Phát triển bản thân', ids: [6, 7, 8, 9, 10, 46] },
  sci: { label: 'Khoa học', ids: [41, 42, 43, 44] },
  biz: { label: 'Kinh doanh', ids: [39, 40] },
  hist: { label: 'Lịch sử', ids: [33, 34, 35, 36, 37, 38] },
};

const MATCH_LABELS = {
  book: 'Tên sách',
  author: 'Tác giả',
  genre: 'Thể loại',
  meta: 'Thuộc tính',
};

export class SearchPage {
  constructor() {
    const params = this._hashParams();

    this.query = params.get('q') || '';
    this.mode = params.get('mode') || 'all';
    this.resultType = params.get('type') || 'all';
    this.genre = params.get('genre') || 'all';

    this.books = [];
    this.authors = [];
    this.authorsOfBooks = [];
    this.categories = [];
    this.categoriesOfBooks = [];
    this.publishingHouses = [];
    this.isLoading = true;
  }

  async fetchData() {
    try {
      const res = await fetch('/database.json?t=' + Date.now());
      const data = await res.json();

      this.books = (data.books || []).filter(b => !b.approvalStatus || b.approvalStatus === 'APPROVED');
      this.authors = data.author || [];
      this.authorsOfBooks = data.authorsOfBooks || [];
      this.categories = data.category || [];
      this.categoriesOfBooks = data.categoriesOfBooks || [];
      this.publishingHouses = data.publishingHouse || [];
    } catch (e) {
      console.error('SearchPage fetch error:', e);
    } finally {
      this.isLoading = false;
      this._reRender();
    }
  }

  _hashParams() {
    const queryString = window.location.hash.split('?')[1] || '';
    return new URLSearchParams(queryString);
  }

  _escape(value) {
    return String(value ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  _normalize(value) {
    return String(value ?? '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd')
      .replace(/Đ/g, 'D')
      .toLowerCase()
      .trim();
  }

  _primitiveValues(obj) {
    return Object.entries(obj || {})
      .filter(([, value]) => ['string', 'number', 'boolean'].includes(typeof value) && value !== '')
      .map(([key, value]) => `${key}: ${value}`);
  }

  _views(book) {
    return MockDbService.getViewCount(book);
  }

  _fmtViews(n) {
    if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
    if (n >= 1000) return `${Math.floor(n / 1000)}K`;
    return String(n || 0);
  }

  _authorName(author) {
    return `${author?.firstName || ''} ${author?.lastName || ''}`.trim();
  }

  _authorsForBook(bookId) {
    const ids = this.authorsOfBooks
      .filter(rel => rel.BookId === bookId)
      .map(rel => rel.AuthorId);

    return ids.map(id => this.authors.find(author => author.id === id)).filter(Boolean);
  }

  _booksForAuthor(authorId) {
    const ids = this.authorsOfBooks
      .filter(rel => rel.AuthorId === authorId)
      .map(rel => rel.BookId);

    return this.books.filter(book => ids.includes(book.id));
  }

  _publisherForBook(book) {
    return this.publishingHouses.find(p => p.id === book?.PublishingHouseId) || null;
  }

  _bookCategories(bookId) {
    const base = this.categoriesOfBooks
      .filter(rel => rel.BookId === bookId)
      .map(rel => {
        const category = this.categories.find(cat => String(cat.id) === String(rel.CategoryId));
        return category ? { id: String(category.id), name: category.name } : null;
      })
      .filter(Boolean);

    const extra = Object.entries(EXTRA_GENRES)
      .filter(([, config]) => config.ids.includes(bookId))
      .map(([id, config]) => ({ id, name: config.label }));

    return [...base, ...extra];
  }

  _allGenres() {
    const baseGenres = this.categories.map(cat => ({
      id: String(cat.id),
      name: cat.name,
      count: this.categoriesOfBooks.filter(rel => String(rel.CategoryId) === String(cat.id)).length,
    }));

    const extraGenres = Object.entries(EXTRA_GENRES).map(([id, config]) => ({
      id,
      name: config.label,
      count: config.ids.filter(bookId => this.books.some(book => book.id === bookId)).length,
    }));

    return [...baseGenres, ...extraGenres].filter(genre => genre.count > 0);
  }

  _bookHasGenre(book, genreId = this.genre) {
    if (!genreId || genreId === 'all') return true;
    return this._bookCategories(book.id).some(category => String(category.id) === String(genreId));
  }

  _bookFieldGroups(book) {
    const authors = this._authorsForBook(book.id);
    const categories = this._bookCategories(book.id);
    const publisher = this._publisherForBook(book);

    return {
      book: [book.name],
      author: authors.map(author => this._authorName(author)),
      genre: categories.flatMap(category => [category.name, category.id]),
      meta: [
        book.description,
        book.country,
        book.language,
        book.pageNumber,
        book.releaseDate,
        book.createdAt,
        book.updatedAt,
        publisher?.name,
        publisher?.description,
        ...this._primitiveValues(book),
      ],
    };
  }

  _authorFieldGroups(author) {
    const books = this._booksForAuthor(author.id);
    const bookCategories = books.flatMap(book => this._bookCategories(book.id));
    const publishers = books.map(book => this._publisherForBook(book)).filter(Boolean);

    return {
      book: books.map(book => book.name),
      author: [
        this._authorName(author),
        author.firstName,
        author.lastName,
        author.description,
        author.birthday,
        ...this._primitiveValues(author),
      ],
      genre: bookCategories.flatMap(category => [category.name, category.id]),
      meta: [
        ...books.flatMap(book => [
          book.description,
          book.country,
          book.language,
          book.releaseDate,
          book.pageNumber,
        ]),
        ...publishers.flatMap(publisher => [publisher.name, publisher.description]),
      ],
    };
  }

  _matchGroups(groups) {
    const query = this._normalize(this.query);
    if (!query) return { matched: true, labels: [] };

    const modes = this.mode === 'all' ? ['book', 'author', 'genre', 'meta'] : [this.mode];
    const labels = [];
    let score = 0;

    modes.forEach(mode => {
      const values = groups[mode] || [];
      const matched = values.some(value => this._normalize(value).includes(query));

      if (matched) {
        labels.push(MATCH_LABELS[mode]);
        score += mode === 'book' || mode === 'author' ? 3 : 1;
      }
    });

    return { matched: labels.length > 0, labels, score };
  }

  _buildBookResult(book) {
    if (!this._bookHasGenre(book)) return null;

    const groups = this._bookFieldGroups(book);
    const match = this._matchGroups(groups);
    if (!match.matched) return null;

    const authors = this._authorsForBook(book.id);
    const categories = this._bookCategories(book.id);
    const publisher = this._publisherForBook(book);

    return {
      kind: 'book',
      id: book.id,
      title: book.name || 'Không tên',
      subtitle: authors.map(author => this._authorName(author)).join(', ') || book.country || 'Sách nói',
      image: book.thumbnailUrl || '',
      description: book.description || '',
      popularity: this._views(book),
      labels: match.labels,
      score: match.score,
      meta: [
        book.country,
        book.releaseDate,
        book.pageNumber ? `${book.pageNumber} trang` : '',
        publisher?.name,
      ].filter(Boolean),
      genres: categories.map(category => category.name),
    };
  }

  _buildAuthorResult(author) {
    const books = this._booksForAuthor(author.id);
    if (this.genre !== 'all' && !books.some(book => this._bookHasGenre(book))) return null;

    const groups = this._authorFieldGroups(author);
    const match = this._matchGroups(groups);
    if (!match.matched) return null;

    const popularity = books.reduce((sum, book) => sum + this._views(book), 0);

    return {
      kind: 'author',
      id: author.id,
      title: this._authorName(author) || 'Tác giả',
      subtitle: `${books.length} tác phẩm`,
      image: author.imagineUrl || author.thumbnailUrl || '',
      description: author.description || '',
      popularity,
      labels: match.labels,
      score: match.score,
      books,
      meta: [
        author.birthday,
        `${books.length} sách`,
      ].filter(Boolean),
      genres: [...new Set(books.flatMap(book => this._bookCategories(book.id).map(category => category.name)))],
    };
  }

  _results() {
    const bookResults = this.resultType === 'author'
      ? []
      : this.books.map(book => this._buildBookResult(book)).filter(Boolean);

    const authorResults = this.resultType === 'book'
      ? []
      : this.authors.map(author => this._buildAuthorResult(author)).filter(Boolean);

    return [...bookResults, ...authorResults].sort((a, b) => {
      if (b.popularity !== a.popularity) return b.popularity - a.popularity;
      if (b.score !== a.score) return b.score - a.score;
      return a.title.localeCompare(b.title, 'vi');
    });
  }

  _stats(results) {
    const books = results.filter(result => result.kind === 'book').length;
    const authors = results.filter(result => result.kind === 'author').length;
    return { books, authors, total: results.length };
  }

  _activeButtonStyle(active) {
    return active
      ? 'background:linear-gradient(135deg,var(--color-primary),var(--color-secondary));border-color:transparent;color:#fff;box-shadow:var(--shadow-md);'
      : 'background:var(--bg-panel);border-color:var(--glass-border);color:var(--text-main);';
  }

  _searchToolbar(results) {
    const stats = this._stats(results);
    const genres = this._allGenres();

    return `
      <section class="search-toolbar">
        <form id="search-form" class="search-form">
          <div class="search-input-wrap">
            <i class="fa-solid fa-magnifying-glass"></i>
            <input id="search-query" type="search" value="${this._escape(this.query)}"
              placeholder="Tên sách, tác giả, thể loại, quốc gia, năm..."
              autocomplete="off" />
            ${this.query ? `
              <button type="button" id="clear-query-btn" class="search-clear-btn" title="Xóa tìm kiếm">
                <i class="fa-solid fa-xmark"></i>
              </button>
            ` : ''}
          </div>
          <button class="btn btn-primary search-submit" type="submit">
            <i class="fa-solid fa-arrow-right"></i>
            Tìm kiếm
          </button>
        </form>

        <div class="search-controls">
          <div class="search-control-group" aria-label="Trường tìm kiếm">
            ${SEARCH_MODES.map(mode => `
              <button type="button" class="search-mode-btn" data-mode="${mode.id}"
                style="${this._activeButtonStyle(this.mode === mode.id)}">
                <i class="fa-solid ${mode.icon}"></i>
                ${mode.label}
              </button>
            `).join('')}
          </div>

          <div class="search-control-group compact" aria-label="Loại kết quả">
            ${RESULT_TYPES.map(type => `
              <button type="button" class="result-type-btn" data-type="${type.id}"
                style="${this._activeButtonStyle(this.resultType === type.id)}">
                ${type.label}
              </button>
            `).join('')}
          </div>

          <label class="genre-select-wrap">
            <i class="fa-solid fa-layer-group"></i>
            <select id="genre-filter">
              <option value="all">Mọi thể loại</option>
              ${genres.map(genre => `
                <option value="${this._escape(genre.id)}" ${this.genre === String(genre.id) ? 'selected' : ''}>
                  ${this._escape(genre.name)} (${genre.count})
                </option>
              `).join('')}
            </select>
          </label>
        </div>

        <div class="search-summary">
          <div>
            <strong>${stats.total}</strong>
            <span>kết quả</span>
          </div>
          <div>
            <strong>${stats.books}</strong>
            <span>sách</span>
          </div>
          <div>
            <strong>${stats.authors}</strong>
            <span>tác giả</span>
          </div>
          <div>
            <strong><i class="fa-solid fa-fire"></i></strong>
            <span>sắp theo phổ biến</span>
          </div>
        </div>
      </section>
    `;
  }

  _resultCard(result, index) {
    const rank = index + 1;
    const isBook = result.kind === 'book';
    const target = isBook ? `#book?id=${result.id}` : `#author-info?id=${result.id}`;
    const icon = isBook ? 'fa-book-open' : 'fa-user-pen';
    const typeLabel = isBook ? 'Sách' : 'Tác giả';
    const description = result.description
      ? result.description.slice(0, 220)
      : (isBook ? 'Chưa có mô tả cho sách này.' : 'Chưa có mô tả cho tác giả này.');

    return `
      <article class="search-result-card" data-target="${target}" style="animation-delay:${Math.min(index * 35, 500)}ms;">
        <div class="search-rank ${rank <= 3 ? 'top' : ''}">${rank}</div>
        <div class="search-result-media ${isBook ? 'book' : 'author'}">
          ${result.image ? `
            <img src="${this._escape(result.image)}" alt="${this._escape(result.title)}" loading="lazy" />
          ` : `
            <div class="search-result-placeholder"><i class="fa-solid ${icon}"></i></div>
          `}
        </div>

        <div class="search-result-body">
          <div class="search-result-kicker">
            <span><i class="fa-solid ${icon}"></i> ${typeLabel}</span>
            <span><i class="fa-solid fa-headphones"></i> ${this._fmtViews(result.popularity)} lượt nghe</span>
          </div>

          <h2>${this._escape(result.title)}</h2>
          <p class="search-result-subtitle">${this._escape(result.subtitle)}</p>
          <p class="search-result-description">${this._escape(description)}</p>

          <div class="search-result-tags">
            ${result.labels.slice(0, 3).map(label => `<span>${this._escape(label)}</span>`).join('')}
            ${result.genres.slice(0, 2).map(genre => `<span>${this._escape(genre)}</span>`).join('')}
            ${result.meta.slice(0, 2).map(meta => `<span>${this._escape(meta)}</span>`).join('')}
          </div>
        </div>

        <div class="search-result-actions">
          ${isBook ? `
            <button type="button" class="btn-icon search-play-btn" data-bookid="${result.id}" title="Nghe ngay">
              <i class="fa-solid fa-play"></i>
            </button>
          ` : `
            <div class="author-book-stack" title="Tác phẩm tiêu biểu">
              ${(result.books || []).slice(0, 3).map(book => `
                <img src="${this._escape(book.thumbnailUrl || '')}" alt="${this._escape(book.name || '')}" loading="lazy" />
              `).join('')}
            </div>
          `}
          <button type="button" class="btn search-open-btn">
            <i class="fa-solid fa-arrow-up-right-from-square"></i>
            Mở
          </button>
        </div>
      </article>
    `;
  }

  _emptyState() {
    return `
      <div class="search-empty">
        <i class="fa-regular fa-face-meh"></i>
        <h2>Không tìm thấy kết quả</h2>
        <p>Thử bỏ bớt bộ lọc hoặc tìm bằng từ khóa khác.</p>
        <button id="reset-search-btn" class="btn btn-primary" type="button">
          <i class="fa-solid fa-rotate-left"></i>
          Đặt lại
        </button>
      </div>
    `;
  }

  _syncHash() {
    const params = new URLSearchParams();
    const q = this.query.trim();

    if (q) params.set('q', q);
    if (this.mode !== 'all') params.set('mode', this.mode);
    if (this.resultType !== 'all') params.set('type', this.resultType);
    if (this.genre !== 'all') params.set('genre', this.genre);

    const next = `#search${params.toString() ? `?${params.toString()}` : ''}`;
    if (window.location.hash !== next) {
      history.replaceState(null, '', next);
    }
  }

  _resetSearch() {
    this.query = '';
    this.mode = 'all';
    this.resultType = 'all';
    this.genre = 'all';
    this._syncHash();
    this._reRender();
  }

  _reRender() {
    const root = document.getElementById('search-root');
    if (!root) return;

    if (this.isLoading) {
      root.innerHTML = `
        <div class="search-shell">
          <div class="skeleton" style="height:170px;border-radius:18px;margin-bottom:1.5rem;"></div>
          <div class="skeleton" style="height:118px;border-radius:18px;margin-bottom:1.5rem;"></div>
          <div style="display:flex;flex-direction:column;gap:1rem;">
            ${Array(5).fill('<div class="skeleton" style="height:160px;border-radius:18px;"></div>').join('')}
          </div>
        </div>
      `;
      return;
    }

    const results = this._results();

    root.innerHTML = `
      <div class="search-shell">
        <header class="search-header">
          <div>
            <p><i class="fa-solid fa-compass"></i> LISTENARY SEARCH</p>
            <h1>Tìm kiếm</h1>
          </div>
          <a href="#trending" class="search-trending-link">
            <i class="fa-solid fa-fire"></i>
            Trending
          </a>
        </header>

        ${this._searchToolbar(results)}

        ${results.length === 0 ? this._emptyState() : `
          <section class="search-results">
            ${results.map((result, index) => this._resultCard(result, index)).join('')}
          </section>
        `}
      </div>
    `;

    this._attachEvents();
  }

  _attachEvents() {
    const input = document.getElementById('search-query');
    const form = document.getElementById('search-form');

    form?.addEventListener('submit', (e) => {
      e.preventDefault();
      this.query = input?.value || '';
      this._syncHash();
      this._reRender();
    });

    input?.addEventListener('input', (e) => {
      const cursor = e.target.selectionStart ?? e.target.value.length;
      this.query = e.target.value;
      this._syncHash();
      this._reRender();

      const nextInput = document.getElementById('search-query');
      if (nextInput) {
        nextInput.focus();
        nextInput.setSelectionRange(cursor, cursor);
      }
    });

    document.getElementById('clear-query-btn')?.addEventListener('click', () => {
      this.query = '';
      this._syncHash();
      this._reRender();
      document.getElementById('search-query')?.focus();
    });

    document.getElementById('reset-search-btn')?.addEventListener('click', () => this._resetSearch());

    document.querySelectorAll('.search-mode-btn').forEach(button => {
      button.addEventListener('click', () => {
        this.mode = button.dataset.mode || 'all';
        this._syncHash();
        this._reRender();
      });
    });

    document.querySelectorAll('.result-type-btn').forEach(button => {
      button.addEventListener('click', () => {
        this.resultType = button.dataset.type || 'all';
        this._syncHash();
        this._reRender();
      });
    });

    document.getElementById('genre-filter')?.addEventListener('change', (e) => {
      this.genre = e.target.value;
      this._syncHash();
      this._reRender();
    });

    document.querySelectorAll('.search-result-card').forEach(card => {
      card.addEventListener('click', (e) => {
        if (e.target.closest('.search-play-btn')) return;
        const target = card.dataset.target;
        if (target) window.location.hash = target;
      });
    });

    document.querySelectorAll('.search-play-btn').forEach(button => {
      button.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = parseInt(button.dataset.bookid);
        if (id) window.location.hash = `#player?id=${id}`;
      });
    });
  }

  afterRender() {
    this._reRender();
    this.fetchData();
  }

  render() {
    return `
      <div class="container" style="padding-top:2rem;padding-bottom:6rem;">
        <div id="search-root"></div>
      </div>
    `;
  }
}
