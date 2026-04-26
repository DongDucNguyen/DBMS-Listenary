import '../pages.css';
import { MockDbService } from '../services/MockDbService.js';

export class AuthorsPage {
  constructor() {
    this.authors = [];
    this.books = [];
    this.authorsOfBooks = [];
    this.searchQuery = '';
    this.isLoading = true;
  }

  async fetchData() {
    const res = await fetch('/database.json?t=' + Date.now());
    const data = await res.json();
    this.authors = data.author;
    this.books = (data.books || []).filter(b => (!b.approvalStatus || b.approvalStatus === 'APPROVED') && !b.isHidden);
    this.authorsOfBooks = data.authorsOfBooks || [];
    this.isLoading = false;
    this._reRender();
    this._attachEvents();
  }

  _getBooksForAuthor(authorId) {
    const bookIds = this.authorsOfBooks.filter(r => r.AuthorId === authorId).map(r => r.BookId);
    return this.books.filter(b => bookIds.includes(b.id));
  }

  _fmtViews(n) {
    return n >= 1000000 ? (n/1000000).toFixed(1)+'M' : n >= 1000 ? Math.floor(n/1000)+'K' : n;
  }

  _getAuthorStats() {
    return this.authors.map(a => {
      const bks = this._getBooksForAuthor(a.id);
      const views = bks.reduce((s, b) => s + MockDbService.getViewCount(b), 0);
      return { ...a, _bks: bks, _views: views };
    });
  }

  // ══════════════════════════════════════════════════════════════
  // ── Hero Section (Top #1 Author) ──────────────────────────────
  // ══════════════════════════════════════════════════════════════
  _heroTopAuthor(author) {
    if (!author) return '';
    const name = `${author.firstName} ${author.lastName}`;
    const avatar = author.imagineUrl || `https://ui-avatars.com/api/?name=${author.firstName}+${author.lastName}&background=7c3aed&color=fff&size=512`;
    // Get their top 4 books by views
    const topBooks = [...author._bks].sort((a,b) => MockDbService.getViewCount(b) - MockDbService.getViewCount(a)).slice(0, 4);

    return `
      <div style="
        position:relative;border-radius:32px;overflow:hidden;
        min-height:500px;margin-bottom:4rem;
        box-shadow:0 30px 60px rgba(0,0,0,.6);
        display:flex;align-items:center;padding:3.5rem;">
        
        <!-- Background Blur & Gradient -->
        <div style="position:absolute;inset:0;background:var(--bg-main);"></div>
        <img src="${avatar}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;
          filter:blur(40px) saturate(1.8);opacity:0.3;transform:scale(1.2);"/>
        <div style="position:absolute;inset:0;background:linear-gradient(110deg, var(--bg-main) 20%, var(--bg-panel) 50%, transparent 100%);"></div>

        <!-- Content -->
        <div style="position:relative;z-index:2;display:flex;gap:4rem;align-items:center;width:100%;">
          
          <!-- Large Avatar -->
          <div style="position:relative;flex-shrink:0;">
            <div style="position:absolute;inset:-10px;border-radius:50%;background:conic-gradient(var(--color-primary),var(--color-accent),var(--color-secondary),var(--color-primary));
              animation:spin 4s linear infinite;filter:blur(15px);opacity:.6;"></div>
            <img src="${avatar}" style="width:280px;height:280px;border-radius:50%;object-fit:cover;
              position:relative;z-index:2;box-shadow:0 20px 40px rgba(0,0,0,.8);border:4px solid rgba(255,255,255,.15);"/>
            <div style="position:absolute;bottom:10px;right:-10px;z-index:3;
              background:linear-gradient(135deg,#ffd700,#ffaa00);color:#000;
              padding:5px 18px;border-radius:20px;font-weight:900;font-size:.85rem;
              box-shadow:0 10px 20px rgba(0,0,0,.5);transform:rotate(-5deg);font-family:'Outfit',sans-serif;">
              ⭐ AUTHOR OF THE MONTH
            </div>
          </div>

          <!-- Info -->
          <div style="flex:1;">
            <div style="display:flex;gap:1.5rem;margin-bottom:1rem;color:var(--text-muted);font-size:.9rem;font-weight:600;">
              <span><i class="fa-solid fa-book-open" style="color:var(--color-primary);"></i> ${author._bks.length} tác phẩm</span>
              <span><i class="fa-solid fa-headphones" style="color:#ff6b35;"></i> ${this._fmtViews(author._views)} lượt nghe</span>
            </div>
            
            <h1 style="font-size:3.5rem;line-height:1.1;margin:0 0 1rem;font-family:'Playfair Display',serif;color:var(--text-main);
              text-shadow:0 4px 20px rgba(0,0,0,.15);">${name}</h1>
            
            <p style="font-size:.95rem;color:var(--text-muted);line-height:1.7;max-width:600px;
              display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden;margin-bottom:2rem;">
              ${author.description || 'Chưa có thông tin mô tả chi tiết về tác giả này. Khám phá những tác phẩm nổi tiếng nhất bên dưới.'}
            </p>

            <!-- Featured Works Strip -->
            <div>
              <p style="font-size:.7rem;color:var(--text-muted);text-transform:uppercase;letter-spacing:1.5px;margin-bottom:.75rem;font-weight:700;">Tác phẩm tiêu biểu</p>
              <div style="display:flex;gap:1rem;">
                ${topBooks.map(b => `
                  <a href="#book?id=${b.id}" style="text-decoration:none;">
                    <img src="${b.thumbnailUrl}" style="width:70px;height:105px;object-fit:cover;
                      border-radius:8px;box-shadow:0 8px 16px rgba(0,0,0,.5);border:1px solid rgba(255,255,255,.1);
                      transition:transform .3s;"
                      onmouseover="this.style.transform='translateY(-6px)'" onmouseout="this.style.transform='translateY(0)'" title="${b.name}"/>
                  </a>
                `).join('')}
                <button class="btn btn-primary" style="margin-left:auto;align-self:flex-end;padding:.85rem 2rem;border-radius:24px;"
                  onclick="window.location.hash='#author-info?id=${author.id}'">
                  Tìm hiểu thêm <i class="fa-solid fa-arrow-right" style="margin-left:6px;"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  // ══════════════════════════════════════════════════════════════
  // ── Trending Authors Strip (Top 2-5) ──────────────────────────
  // ══════════════════════════════════════════════════════════════
  _trendingAuthors(authors) {
    if (!authors || !authors.length) return '';
    return `
      <div style="margin-bottom:4rem;">
        <div style="display:flex;align-items:center;gap:.875rem;margin-bottom:1.75rem;">
          <div style="width:4px;height:32px;background:linear-gradient(#f43f5e,#fb923c);border-radius:2px;"></div>
          <h2 style="font-size:1.4rem;margin:0;">🔥 Top Tác Giả Nổi Bật</h2>
          <div style="flex:1;height:1px;background:linear-gradient(90deg,rgba(244,63,94,.3),transparent);"></div>
        </div>
        
        <div style="display:flex;gap:1.5rem;overflow-x:auto;padding-bottom:1rem;scrollbar-width:thin;scrollbar-color:var(--glass-border) transparent;">
          ${authors.map((a, idx) => {
            const avatar = a.imagineUrl || `https://ui-avatars.com/api/?name=${a.firstName}+${a.lastName}&background=3b82f6&color=fff&size=200`;
            const bookImages = a._bks.slice(0, 3).map(b => `<img src="${b.thumbnailUrl}" style="width:40px;height:60px;object-fit:cover;border-radius:6px;box-shadow: -10px 0 10px rgba(0,0,0,0.4);border:1px solid rgba(255,255,255,.1);margin-left:-25px;position:relative;z-index:${10-idx};"/>`).join('');
            return `
              <div style="
                flex-shrink:0;width:300px;
                background:var(--bg-panel);border:1px solid var(--glass-border);
                border-radius:20px;padding:1.5rem;position:relative;overflow:hidden;
                transition:all .3s;cursor:pointer;display:flex;flex-direction:column;gap:1rem;"
                onmouseover="this.style.transform='translateY(-6px)';this.style.borderColor='rgba(244,63,94,.4)';this.style.boxShadow='0 12px 30px rgba(0,0,0,.4)'"
                onmouseout="this.style.transform='translateY(0)';this.style.borderColor='var(--glass-border)';this.style.boxShadow='none'"
                onclick="window.location.hash='#author-info?id=${a.id}'">
                <div style="position:absolute;top:-40px;right:-40px;width:120px;height:120px;
                  background:rgba(244,63,94,.05);border-radius:50%;pointer-events:none;"></div>
                
                <div style="display:flex;align-items:center;gap:1rem;">
                  <div style="position:relative;">
                    <img src="${avatar}" style="width:70px;height:70px;border-radius:50%;object-fit:cover;border:2px solid var(--glass-border);"/>
                    <div style="position:absolute;bottom:-4px;right:-4px;background:var(--bg-main);border-radius:50%;">
                      <div style="background:linear-gradient(135deg,#f43f5e,#fb923c);width:22px;height:22px;border-radius:50%;
                        display:flex;align-items:center;justify-content:center;font-size:.65rem;font-weight:900;color:#fff;">#${idx+2}</div>
                    </div>
                  </div>
                  <div>
                    <h3 style="margin:0 0 .25rem;font-size:1.1rem;font-weight:800;color:var(--text-main);">${a.firstName} ${a.lastName}</h3>
                    <div style="font-size:.7rem;color:var(--text-muted);">
                      <i class="fa-solid fa-headphones" style="color:var(--color-primary);"></i> ${this._fmtViews(a._views)} lượt
                    </div>
                  </div>
                </div>

                <div style="margin-top:auto;display:flex;align-items:center;justify-content:space-between;">
                  <span style="font-size:.78rem;color:var(--text-muted);font-weight:600;">${a._bks.length} Tác phẩm</span>
                  <div style="display:flex;padding-left:25px;">
                    ${bookImages}
                  </div>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
  }

  // ══════════════════════════════════════════════════════════════
  // ── Standard Author Card (For Grid) ───────────────────────────
  // ══════════════════════════════════════════════════════════════
  _renderAuthorCard(a, index) {
    const totalViews = a._views || 0;
    const books = a._bks || [];
    const fmtViews = this._fmtViews(totalViews);
    const delay = Math.min(index * 40, 500);
    const coverBook = books[0];
    const avatar = a.imagineUrl || `https://ui-avatars.com/api/?name=${a.firstName}+${a.lastName}&background=7c3aed&color=fff&size=128`;

    return `
      <div class="hover-lift stagger-appear" style="
        position:relative;background:var(--bg-panel);border:1px solid var(--glass-border);
        border-radius:18px;overflow:hidden;cursor:pointer;
        animation:fadeInScale 0.5s cubic-bezier(0.22,1,0.36,1) ${delay}ms both;
        display:flex;flex-direction:column;"
        onclick="window.location.hash='#author-info?id=${a.id}'">
        
        <!-- Cover Art Backdrop -->
        <div style="height:85px;position:relative;overflow:hidden;flex-shrink:0;">
          ${coverBook
            ? `<img src="${coverBook.thumbnailUrl}" style="width:100%;height:100%;object-fit:cover;filter:blur(8px) brightness(0.6);transform:scale(1.2);" />`
            : `<div style="width:100%;height:100%;background:linear-gradient(135deg,rgba(124,58,237,.3),rgba(6,182,212,.3));"></div>`}
        </div>

        <!-- Meta Content -->
        <div style="position:relative;padding:0 1.25rem 1.25rem;display:flex;flex-direction:column;flex:1;">
          <img src="${avatar}" style="
            width:72px;height:72px;border-radius:50%;object-fit:cover;
            border:3px solid var(--bg-panel);margin-top:-36px;margin-bottom:.75rem;
            align-self:center;box-shadow:0 8px 16px rgba(0,0,0,.4);" />
          
          <h3 style="font-size:1.05rem;margin:0 0 .2rem;text-align:center;font-weight:800;">${a.firstName} ${a.lastName}</h3>
          
          <!-- Miniature Stats -->
          <div style="display:flex;justify-content:center;gap:1.25rem;margin-bottom:1rem;">
            <div style="text-align:center;">
              <div style="font-size:.9rem;font-weight:800;color:var(--color-primary);">${books.length}</div>
              <div style="font-size:.6rem;color:var(--text-muted);text-transform:uppercase;">Sách</div>
            </div>
            <div style="width:1px;background:var(--glass-border);"></div>
            <div style="text-align:center;">
              <div style="font-size:.9rem;font-weight:800;color:var(--color-secondary);">${fmtViews}</div>
              <div style="font-size:.6rem;color:var(--text-muted);text-transform:uppercase;">Views</div>
            </div>
          </div>

          <!-- Description -->
          <p style="font-size:.78rem;color:var(--text-muted);text-align:center;
            display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;
            line-height:1.5;margin:0 0 1rem;flex:1;">
            ${a.description || 'Hàng loạt sách nói chất lượng đang chờ đón bạn.'}
          </p>

          <!-- Book covers mini strip inside card -->
          ${books.length > 0 ? `
          <div style="display:flex;gap:.4rem;justify-content:center;margin-top:auto;">
            ${books.slice(0,5).map(b => `<img src="${b.thumbnailUrl}" style="width:32px;height:46px;object-fit:cover;border-radius:4px;box-shadow:var(--shadow-sm);"/>`).join('')}
          </div>` : ''}
        </div>
      </div>
    `;
  }

  // ══════════════════════════════════════════════════════════════
  // ── Render Processing ─────────────────────────────────────────
  // ══════════════════════════════════════════════════════════════
  _filtered(authorStats) {
    if (!this.searchQuery) return authorStats;
    const q = this.searchQuery.toLowerCase();
    return authorStats.filter(a =>
      `${a.firstName} ${a.lastName}`.toLowerCase().includes(q) ||
      (a.description || '').toLowerCase().includes(q)
    );
  }

  _reRender() {
    const container = document.getElementById('authors-root');
    if (!container) return;

    if (this.isLoading) {
      container.innerHTML = `
        <div class="skeleton" style="height:500px;border-radius:32px;margin-bottom:4rem;"></div>
        <div class="skeleton" style="height:40px;width:300px;border-radius:8px;margin-bottom:2rem;"></div>
        <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:1.5rem;">
          ${Array(8).fill(`<div class="skeleton" style="height:280px;border-radius:18px;"></div>`).join('')}
        </div>`;
      return;
    }

    // Prepare data
    const allStats = this._getAuthorStats().sort((a,b) => b._views - a._views); // Pre-sorted by view descending
    const filteredList = this._filtered(allStats);
    
    // Only show Hero and Trending if NOT searching
    const isSearching = this.searchQuery.trim().length > 0;
    
    const top1 = allStats[0];
    const trending = allStats.slice(1, 5); // 4 authors for trending
    const gridAuthors = isSearching ? filteredList : allStats.slice(5); // The rest

    container.innerHTML = `
      ${!isSearching ? this._heroTopAuthor(top1) : ''}
      ${!isSearching ? this._trendingAuthors(trending) : ''}
      
      <div style="margin-bottom:4rem;">
        <div style="display:flex;align-items:center;gap:.875rem;margin-bottom:1.75rem;justify-content:space-between;flex-wrap:wrap;">
          <div style="display:flex;align-items:center;gap:.875rem;">
            <div style="width:4px;height:32px;background:linear-gradient(var(--color-secondary),#10b981);border-radius:2px;"></div>
            <h2 style="font-size:1.4rem;margin:0;">${isSearching ? 'Kết Quả Tìm Kiếm' : 'Tất Cả Tác Giả'}</h2>
            <span style="background:var(--bg-panel);border:1px solid var(--glass-border);padding:2px 10px;border-radius:12px;font-size:.7rem;color:var(--text-muted);">${filteredList.length}</span>
          </div>

          <!-- Search input placed alongside the section header -->
          <div style="position:relative;width:280px;">
            <i class="fa-solid fa-magnifying-glass" style="position:absolute;left:14px;top:50%;transform:translateY(-50%);color:var(--text-muted);"></i>
            <input id="author-search" type="text" value="${this.searchQuery}" placeholder="Tìm theo tên hoặc mô tả..." style="
              width:100%;padding:0.6rem 1rem 0.6rem 2.5rem;
              background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.15);
              border-radius:20px;color:#fff;font-size:.85rem;outline:none;transition:all .3s;
            " onfocus="this.style.borderColor='var(--color-primary)'" onblur="this.style.borderColor='rgba(255,255,255,.15)'">
          </div>
        </div>

        ${gridAuthors.length === 0 ? `
          <div style="text-align:center;padding:4rem;background:var(--bg-panel);border-radius:20px;border:1px dashed var(--glass-border);">
            <i class="fa-solid fa-user-xmark" style="font-size:3rem;color:var(--text-muted);margin-bottom:1rem;"></i>
            <h3 style="margin-bottom:.5rem;">Không tìm thấy tác giả</h3>
            <p style="color:var(--text-muted);font-size:.85rem;">Thử tìm với tên hoặc từ khóa khác.</p>
          </div>
        ` : `
          <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:1.5rem;">
            ${gridAuthors.map((a, i) => this._renderAuthorCard(a, i)).join('')}
          </div>
        `}
      </div>
    `;

    // Global CSS for spin and hover
    if (!document.getElementById('authors-extra-style')) {
      const st = document.createElement('style');
      st.id = 'authors-extra-style';
      st.textContent = `
        @keyframes spin { 100% { transform:rotate(360deg); } }
        .hover-lift { transition: transform .3s, box-shadow .3s, border-color .3s; }
        .hover-lift:hover { transform: translateY(-5px); box-shadow: var(--shadow-lg); border-color:rgba(124,58,237,.4); }
      `;
      document.head.appendChild(st);
    }

    this._attachEvents();
  }

  _attachEvents() {
    const searchInput = document.getElementById('author-search');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.searchQuery = e.target.value;
        this._reRender(); // Re-render live
        const newSearch = document.getElementById('author-search');
        if (newSearch) {
           newSearch.focus();
           const len = newSearch.value.length;
           newSearch.setSelectionRange(len, len); // Keep cursor at end
        }
      });
    }
  }

  afterRender() {
    this._reRender();
    this.fetchData();
  }

  render() {
    return `
      <div class="container" style="padding-top:2rem;padding-bottom:5rem;">
        <div id="authors-root">
          <div class="skeleton" style="height:500px;border-radius:32px;margin-bottom:4rem;"></div>
          <div class="skeleton" style="height:40px;width:300px;border-radius:8px;margin-bottom:2rem;"></div>
          <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:1.5rem;">
            ${Array(8).fill(`<div class="skeleton" style="height:280px;border-radius:18px;"></div>`).join('')}
          </div>
        </div>
      </div>
    `;
  }
}
