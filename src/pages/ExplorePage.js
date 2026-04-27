import '../explore.css';
import '../pages.css';
import { AuthService } from '../services/AuthService.js';
import { MockDbService } from '../services/MockDbService.js';
import { ApiService } from '../services/ApiService.js';

export class ExplorePage {
  constructor() {
    this.books = [];
    this.authors = [];
    this.authorsOfBooks = [];
    this.audioChapters = [];
    this.isLoading = true;
    this._openBook = this._openBook.bind(this);
    this._currentSlide = 0;
    this._heroProgress = 0;
    this._heroInterval = null;
  }

  async fetchData() {
    try {
      // Lấy tất cả sách đã duyệt từ MySQL qua vw_BookDetails
      const books = await ApiService.getAllBooks();
      this.books = Array.isArray(books) ? books.map(b => ({
        ...b,
        id: b.bookId || b.id,
        name: b.bookName || b.name,
        createdAt: b.bookCreatedAt || b.createdAt,
      })) : [];

      // Lấy lịch sử nghe của user hiện tại
      const currentUser = AuthService.getUser();
      if (currentUser) {
        try {
          const history = await ApiService.getHistory(currentUser.id);
          this.readingHistory = Array.isArray(history) ? history.map(h => ({
            bookId: h.bookId,
            progress: h.audioTimeline || 0,
            lastListened: h.lastListenedAt,
          })) : [];
        } catch (_) { this.readingHistory = []; }
      } else {
        this.readingHistory = [];
      }

      // authorsOfBooks dùng inline từ book data (vw_BookDetails đã JOIN)
      this.authorsOfBooks = [];
      this.authors = [];
    } catch (e) {
      console.error('ExplorePage fetch error:', e);
    } finally {
      this.isLoading = false;
      this._reRender();
    }
  }


  _getAuthor(bookId) {
    const rel = this.authorsOfBooks.find(r => r.BookId === bookId);
    return rel ? this.authors.find(a => a.id === rel.AuthorId) : null;
  }

  _getChapters(bookId) {
    return this.audioChapters.filter(c => c.bookId === bookId)
      .sort((a, b) => a.chapterNumber - b.chapterNumber);
  }

  _views(book) {
    return MockDbService.getViewCount(book);
  }

  _fmtViews(n) {
    return n >= 1000000 ? (n/1000000).toFixed(1)+'M' : n >= 1000 ? Math.floor(n/1000)+'K' : n;
  }

  _openBook(bookId) { window.location.hash = `#book?id=${bookId}`; }
  _playBook(bookId) { window.location.hash = `#player?id=${bookId}`; }

  // ── Standard compact card ─────────────────────────────────────
  _card(book) {
    const authorName = book.authorFullName || `${book.authorFirstName || ''} ${book.authorLastName || ''}`.trim();
    return `
      <div class="book-card-sm" style="min-width:155px;flex-shrink:0;" data-bookid="${book.id}">
        <div class="cover-wrap">
          <img src="${book.thumbnailUrl||''}" alt="${book.name||''}" loading="lazy" />
          <div class="cover-overlay">
            <button class="play-book-btn" data-bookid="${book.id}" style="
              background:var(--color-primary);border:none;color:#fff;
              width:40px;height:40px;border-radius:50%;cursor:pointer;
              display:flex;align-items:center;justify-content:center;
              font-size:0.9rem;box-shadow:0 4px 12px rgba(0,0,0,0.4);transition:transform .2s;">
              <i class="fa-solid fa-play"></i>
            </button>
          </div>
        </div>
        <div style="padding:.75rem 1rem 1rem;">
          <h4 style="font-size:.85rem;font-weight:700;margin:0 0 .2rem;
            display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;
            line-height:1.35;font-family:'Outfit',sans-serif;">${book.name||''}</h4>
          <p style="font-size:.7rem;color:var(--text-muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">
            ${authorName || (book.country||'')}
          </p>
        </div>
      </div>`;
  }

  // ── HERO (rotating top-5) ─────────────────────────────────────
  _hero() {
    const top5 = [...this.books].sort((a,b) => this._views(b)-this._views(a)).slice(0,5);
    if (!top5.length) return '';
    const ranks   = ['⭐ NỔI BẬT #1','🥈 #2','🥉 #3','#4','#5'];
    const rankBgs = ['linear-gradient(135deg,#ffd700,#ffaa00)','linear-gradient(135deg,#b0b8c1,#8a9bb0)',
                     'linear-gradient(135deg,#cd873f,#a0621e)','rgba(255,255,255,.15)','rgba(255,255,255,.1)'];
    const rankTxt = ['#000','#000','#fff','#fff','#fff'];
    const b0 = top5[0];
    const a0Name = b0.authorFullName || `${b0.authorFirstName||''} ${b0.authorLastName||''}`.trim();
    const heroData = JSON.stringify(top5.map((b,i) => ({
      id:b.id, name:b.name, thumb:b.thumbnailUrl,
      author: b.authorFullName || `${b.authorFirstName||''} ${b.authorLastName||''}`.trim(),
      desc:(b.description||'').slice(0,240), views:this._fmtViews(this._views(b)),
      country:b.country||'', rank:ranks[i], rankBg:rankBgs[i], rankTxt:rankTxt[i],
    })));
    return `
      <div id="hero-banner" style="position:relative;border-radius:28px;overflow:hidden;
        min-height:460px;margin-bottom:3rem;box-shadow:0 30px 80px rgba(0,0,0,.15);background:var(--bg-main);">
        <div style="position:absolute;inset:0;background:var(--bg-main);"></div>
        <img id="hero-bg-img" src="${b0.thumbnailUrl}"
          style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;
            filter:blur(22px) saturate(1.6);opacity:0.25;transform:scale(1.08);
            transform-origin:center;transition:opacity .6s ease;"/>
        <div style="position:absolute;inset:0;background:linear-gradient(105deg,var(--bg-main) 30%,var(--bg-panel) 60%,transparent 100%);"></div>
        <div style="position:relative;z-index:2;display:flex;align-items:center;gap:2.5rem;padding:3rem;min-height:460px;">
          <div id="hero-cover-wrap" style="flex-shrink:0;">
            <img id="hero-cover-img" src="${b0.thumbnailUrl}" data-bookid="${b0.id}"
              class="hero-book-cover-btn"
              style="width:195px;height:275px;object-fit:cover;border-radius:18px;
                box-shadow:0 32px 64px rgba(0,0,0,.35);border:2px solid rgba(255,255,255,.2);
                cursor:pointer;transition:transform .35s,opacity .45s;"/>
          </div>
          <div id="hero-text-wrap" style="flex:1;">
            <div style="display:flex;gap:.6rem;align-items:center;margin-bottom:1rem;flex-wrap:wrap;">
              <span id="hero-rank-badge" style="background:${rankBgs[0]};color:${rankTxt[0]};
                padding:3px 14px;border-radius:20px;font-size:.7rem;font-weight:800;letter-spacing:1.2px;">${ranks[0]}</span>
              <span id="hero-views" style="color:var(--text-muted);font-size:.8rem;">
                <i class="fa-solid fa-fire" style="color:#ff6b35;"></i> ${this._fmtViews(this._views(b0))} lượt nghe
              </span>
              <span id="hero-country" style="color:var(--text-muted);font-size:.78rem;">${b0.country||''}</span>
            </div>
            <h1 id="hero-title" style="font-size:2.55rem;color:var(--text-main);font-family:'Playfair Display',serif;
              line-height:1.15;margin-bottom:.4rem;text-shadow:0 2px 24px rgba(0,0,0,.15);">${b0.name}</h1>
            <p id="hero-author" style="color:var(--color-secondary);font-size:.9rem;margin-bottom:.75rem;">
              <i class="fa-solid fa-pen-nib" style="margin-right:5px;"></i>${a0Name}
            </p>
            <p id="hero-desc" style="color:var(--text-muted);font-size:.87rem;line-height:1.75;
              max-width:500px;margin-bottom:1.6rem;
              display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden;">${b0.description||''}</p>
            <div style="display:flex;gap:.875rem;">
              <button id="hero-play-btn" class="btn btn-primary hero-play-btn" data-bookid="${b0.id}"
                style="padding:.85rem 2rem;font-size:.93rem;">
                <i class="fa-solid fa-play"></i> Nghe ngay
              </button>
              <button id="hero-detail-btn" class="btn hero-detail-btn" data-bookid="${b0.id}"
                style="background:var(--bg-panel);border:1px solid var(--glass-border);color:var(--text-main);padding:.85rem 1.5rem;">
                <i class="fa-solid fa-circle-info"></i> Chi tiết
              </button>
            </div>
          </div>
          <div style="display:flex;flex-direction:column;gap:.5rem;margin-left:auto;flex-shrink:0;">
            <p style="font-size:.66rem;color:var(--text-muted);text-transform:uppercase;letter-spacing:1.2px;margin-bottom:.25rem;">Top 5 nổi bật</p>
            ${top5.map((b,i)=>{const authorN=b.authorFullName||`${b.authorFirstName||''} ${b.authorLastName||''}`.trim();return`
              <div id="hero-thumb-${i}" data-hi="${i}" class="hero-thumb-item"
                style="display:flex;align-items:center;gap:.7rem;
                  background:${i===0?'var(--bg-main)':'var(--bg-panel)'};backdrop-filter:blur(12px);
                  border:1px solid ${i===0?'var(--color-primary)':'var(--glass-border)'};
                  border-radius:14px;padding:.5rem .85rem;cursor:pointer;min-width:205px;max-width:230px;transition:all .3s;">
                <img src="${b.thumbnailUrl}" style="width:36px;height:50px;object-fit:cover;border-radius:7px;flex-shrink:0;"/>
                <div style="overflow:hidden;flex:1;">
                  <div style="font-size:.76rem;font-weight:700;color:var(--text-main);
                    white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:120px;">${b.name}</div>
                  <div style="font-size:.64rem;color:var(--text-muted);margin-top:1px;">${authorN}</div>
                  <div style="margin-top:5px;height:2px;border-radius:1px;background:var(--glass-border);overflow:hidden;">
                    <div id="hero-bar-${i}" style="height:100%;border-radius:1px;background:var(--color-primary);width:0%;transition:width .12s linear;"></div>
                  </div>
                </div>
                <span style="font-size:.68rem;color:var(--text-muted);font-weight:700;flex-shrink:0;">#${i+1}</span>
              </div>`}).join('')}
          </div>
        </div>
        <div id="hero-progress-bar" style="position:absolute;bottom:0;left:0;height:3px;width:0%;
          background:linear-gradient(90deg,var(--color-primary),var(--color-secondary));
          transition:width .12s linear;z-index:10;"></div>
        <script id="hero-data" type="application/json">${heroData}</script>
      </div>`;
  }

  // ── Hero rotator ──────────────────────────────────────────────
  _startHeroCarousel() {
    if (window.__exploreHeroInterval) clearInterval(window.__exploreHeroInterval);
    if (!document.getElementById('hero-banner')) return;
    const dataEl = document.getElementById('hero-data');
    if (!dataEl) return;
    const books = JSON.parse(dataEl.textContent); const N = books.length;
    
    window.__exploreHeroInterval = setInterval(() => {
      this._heroProgress += 1;
      const bar = document.getElementById('hero-progress-bar');
      const aBar = document.getElementById(`hero-bar-${this._currentSlide}`);
      if (bar) bar.style.width = this._heroProgress + '%';
      if (aBar) aBar.style.width = this._heroProgress + '%';
      
      if (this._heroProgress >= 100) { 
        this._heroProgress = 0; 
        this._currentSlide = (this._currentSlide + 1) % N; 
        this._updateHeroBook(books, this._currentSlide); 
      }
    }, 60);
  }

  _updateHeroBook(books, idx) {
    const b = books[idx]; if (!b) return;

    // Ensure keyframe CSS exists
    if (!document.getElementById('hero-fade-style')) {
      const st = document.createElement('style');
      st.id = 'hero-fade-style';
      st.textContent = `
        @keyframes heroItemIn {
          from { opacity:0; transform:translateY(14px); }
          to   { opacity:1; transform:translateY(0); }
        }
        .hero-anim-in { animation: heroItemIn 0.5s cubic-bezier(0.22,1,0.36,1) both; }
      `;
      document.head.appendChild(st);
    }

    // Update thumbnail strip highlight + mini-bars
    books.forEach((_,i) => {
      const bar = document.getElementById(`hero-bar-${i}`);
      if (bar) bar.style.width = '0%';
      const th = document.getElementById(`hero-thumb-${i}`);
      if (th) {
        th.style.background   = i===idx ? 'var(--bg-main)' : 'var(--bg-panel)';
        th.style.borderColor  = i===idx ? 'var(--color-primary)' : 'var(--glass-border)';
      }
    });

    // Crossfade background image (opacity only, no wrapper fade)
    const bg = document.getElementById('hero-bg-img');
    if (bg) {
      bg.style.transition = 'opacity 0.5s ease';
      bg.style.opacity = '0';
      setTimeout(() => { bg.src = b.thumb; bg.style.opacity = '1'; }, 400);
    }

    // Directly update all content fields — no opacity trick on wrappers
    const img = document.getElementById('hero-cover-img');
    if (img) { img.src = b.thumb; img.dataset.bookid = b.id; }

    const setEl = (id, html, asText) => {
      const el = document.getElementById(id); if (!el) return;
      if (asText) el.textContent = html; else el.innerHTML = html;
    };
    setEl('hero-title',   b.name,  true);
    setEl('hero-desc',    b.desc,  true);
    setEl('hero-country', b.country, true);
    setEl('hero-author',  `<i class="fa-solid fa-pen-nib" style="margin-right:5px;"></i>${b.author}`, false);
    setEl('hero-views',   `<i class="fa-solid fa-fire" style="color:#ff6b35;"></i> ${b.views} lượt nghe`, false);

    const rb = document.getElementById('hero-rank-badge');
    if (rb) { rb.textContent = b.rank; rb.style.background = b.rankBg; rb.style.color = b.rankTxt; }

    const pb = document.getElementById('hero-play-btn');
    const db = document.getElementById('hero-detail-btn');
    if (pb) pb.dataset.bookid = b.id;
    if (db) db.dataset.bookid = b.id;

    // Trigger fade-in animation on cover + text block
    ['hero-cover-wrap','hero-text-wrap'].forEach(id => {
      const el = document.getElementById(id);
      if (!el) return;
      el.classList.remove('hero-anim-in');
      void el.offsetWidth; // reflow to restart animation
      el.classList.add('hero-anim-in');
    });
  }

  // ══════════════════════════════════════════════════════════════
  // ── SECTION 1: Nổi Bật Nhất — Asymmetric featured grid ───────
  // ══════════════════════════════════════════════════════════════
  _sectionFeatured(books) {
    if (!books.length) return '';
    const [big, ...small] = books.slice(0,5);
    const ba = this._getAuthor(big.id);
    const chapters = this._getChapters(big.id);

    return `
      <div style="margin-bottom:4rem;">
        <!-- Section header -->
        <div style="display:flex;align-items:center;gap:.875rem;margin-bottom:1.75rem;">
          <div style="width:4px;height:32px;background:linear-gradient(#ff6b35,#ff9f5b);border-radius:2px;"></div>
          <h2 style="font-size:1.4rem;margin:0;">🔥 Nổi Bật Nhất</h2>
          <div style="flex:1;height:1px;background:linear-gradient(90deg,rgba(255,107,53,.3),transparent);margin-left:.5rem;"></div>
          <a href="#trending" style="font-size:.8rem;color:#ff6b35;font-weight:600;text-decoration:none;
            display:flex;align-items:center;gap:4px;">Xem thêm <i class="fa-solid fa-arrow-right" style="font-size:.7rem;"></i></a>
        </div>

        <!-- Asymmetric grid -->
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:1.25rem;">
          <!-- Big feature card (left) -->
          <div data-bookid="${big.id}" style="
            position:relative;border-radius:20px;overflow:hidden;
            min-height:380px;cursor:pointer;
            box-shadow:0 20px 50px rgba(0,0,0,.45);
            group;">
            <img src="${big.thumbnailUrl}" style="position:absolute;inset:0;width:100%;height:100%;
              object-fit:cover;filter:brightness(.45);transition:transform .5s;"/>
            <div style="position:absolute;inset:0;
              background:linear-gradient(180deg,transparent 30%,rgba(4,3,18,.95) 100%);"></div>
            <!-- Live badge -->
            <div style="position:absolute;top:16px;left:16px;display:flex;align-items:center;gap:6px;
              background:rgba(255,59,48,.9);backdrop-filter:blur(8px);
              padding:4px 10px;border-radius:20px;">
              <div style="width:7px;height:7px;border-radius:50%;background:#fff;animation:pulse 1.4s infinite;"></div>
              <span style="font-size:.65rem;color:#fff;font-weight:800;letter-spacing:.5px;">ĐANG TRENDING</span>
            </div>
            <div style="position:absolute;bottom:0;left:0;right:0;padding:1.5rem;">
              <div style="display:flex;align-items:center;gap:.5rem;margin-bottom:.6rem;">
                <span style="background:linear-gradient(135deg,#ffd700,#ffaa00);color:#000;
                  padding:2px 10px;border-radius:12px;font-size:.65rem;font-weight:800;">⭐ #1</span>
                <span style="font-size:.72rem;color:rgba(255,255,255,.55);">
                  <i class="fa-solid fa-headphones" style="font-size:.62rem;"></i>
                  ${this._fmtViews(this._views(big))} lượt nghe
                </span>
              </div>
              <h3 style="font-size:1.45rem;font-family:'Playfair Display',serif;color:#fff;
                margin:0 0 .4rem;text-shadow:0 2px 12px rgba(0,0,0,.5);line-height:1.2;">${big.name}</h3>
              <p style="font-size:.78rem;color:rgba(255,255,255,.55);margin:0 0 1rem;">
                ${ba?`<i class="fa-solid fa-pen-nib" style="font-size:.68rem;margin-right:4px;color:var(--color-secondary);"></i>${ba.firstName} ${ba.lastName}`:''}
                ${chapters.length?`<span style="margin-left:.75rem;"><i class="fa-solid fa-list-ol" style="font-size:.62rem;"></i> ${chapters.length} chương</span>`:''}
              </p>
              <div style="display:flex;gap:.625rem;">
                <button class="btn btn-primary hero-play-btn" data-bookid="${big.id}"
                  style="padding:.6rem 1.25rem;font-size:.82rem;flex:1;">
                  <i class="fa-solid fa-play"></i> Nghe ngay
                </button>
                <button class="btn hero-detail-btn" data-bookid="${big.id}"
                  style="background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.2);
                  color:#fff;padding:.6rem 1rem;font-size:.82rem;">
                  <i class="fa-solid fa-circle-info"></i>
                </button>
              </div>
            </div>
          </div>

          <!-- 2×2 small cards (right) -->
          <div style="display:grid;grid-template-columns:1fr 1fr;grid-template-rows:1fr 1fr;gap:1rem;">
            ${small.slice(0,4).map((b,i)=>{
              const a=this._getAuthor(b.id);
              const medals=['🥈','🥉','#4','#5'];
              return `
                <div data-bookid="${b.id}" class="hover-lift" style="
                  position:relative;border-radius:16px;overflow:hidden;
                  background:var(--bg-panel);border:1px solid var(--glass-border);
                  cursor:pointer;transition:all .3s;">
                  <div style="display:flex;gap:.75rem;padding:.875rem;">
                    <div style="position:relative;flex-shrink:0;">
                      <img src="${b.thumbnailUrl}" style="width:56px;height:78px;
                        object-fit:cover;border-radius:10px;box-shadow:0 6px 16px rgba(0,0,0,.35);"/>
                      <div style="position:absolute;top:-6px;left:-4px;font-size:.9rem;">${medals[i]}</div>
                    </div>
                    <div style="overflow:hidden;flex:1;">
                      <div style="font-size:.82rem;font-weight:700;color:var(--text-main);
                        display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;
                        overflow:hidden;line-height:1.3;margin-bottom:.3rem;">${b.name}</div>
                      <div style="font-size:.68rem;color:var(--text-muted);margin-bottom:.4rem;">
                        ${a?`${a.firstName} ${a.lastName}`:''}</div>
                      <div style="font-size:.65rem;color:#ffd700;">
                        <i class="fa-solid fa-headphones" style="font-size:.58rem;"></i>
                        ${this._fmtViews(this._views(b))}
                      </div>
                    </div>
                  </div>
                  <!-- Hover overlay -->
                  <div class="card-hover-overlay" style="
                    position:absolute;inset:0;background:rgba(124,58,237,.15);
                    display:flex;align-items:center;justify-content:center;
                    opacity:0;transition:opacity .2s;border-radius:16px;">
                    <button class="play-book-btn" data-bookid="${b.id}"
                      style="background:var(--color-primary);border:none;color:#fff;
                      width:38px;height:38px;border-radius:50%;cursor:pointer;
                      display:flex;align-items:center;justify-content:center;font-size:.85rem;">
                      <i class="fa-solid fa-play"></i>
                    </button>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      </div>
    `;
  }


  // ══════════════════════════════════════════════════════════════
  // ── Genre Quick-Filter Pills ──────────────────────────────────
  // ══════════════════════════════════════════════════════════════
  _genrePills() {
    const genres = [
      {label:'Tất cả', icon:'fa-layer-group', color:'var(--color-primary)'},
      {label:'Phát triển bản thân', icon:'fa-brain', color:'#10b981'},
      {label:'Kinh doanh', icon:'fa-chart-line', color:'#06b6d4'},
      {label:'Tiểu thuyết', icon:'fa-scroll', color:'var(--color-secondary)'},
      {label:'Triết học', icon:'fa-yin-yang', color:'#8b5cf6'},
      {label:'Lịch sử', icon:'fa-landmark', color:'#f59e0b'},
      {label:'Khoa học', icon:'fa-flask', color:'#3b82f6'},
      {label:'Văn học Việt', icon:'🇻🇳', color:'#da3349'},
    ];
    return `
      <div style="display:flex;gap:.75rem;flex-wrap:wrap;margin-bottom:3rem;align-items:center;">
        <span style="font-size:.78rem;color:var(--text-muted);font-weight:600;flex-shrink:0;">Thể loại:</span>
        ${genres.map((g,i)=>`
          <button onclick="window.location.hash='#genres'" style="
            display:inline-flex;align-items:center;gap:6px;
            background:${i===0?g.color:'var(--bg-panel)'};
            border:1px solid ${i===0?g.color:'var(--glass-border)'};
            color:${i===0?'#fff':'var(--text-muted)'};
            padding:6px 14px;border-radius:24px;cursor:pointer;
            font-size:.78rem;font-weight:600;
            transition:all .2s;white-space:nowrap;"
            onmouseover="this.style.borderColor='${g.color}';this.style.color='${g.color}'"
            onmouseout="this.style.borderColor=${i===0?`'${g.color}'`:"'var(--glass-border)'"};this.style.color=${i===0?`'#fff'`:"'var(--text-muted)'"}"
          >${g.icon.startsWith('fa')?`<i class="fa-solid ${g.icon}" style="font-size:.7rem;"></i>`:g.icon} ${g.label}</button>
        `).join('')}
      </div>`;
  }

  // ══════════════════════════════════════════════════════════════
  // ── SECTION 2: Mới Phát Hành — 3D tilt horizontal strip ──────
  // ══════════════════════════════════════════════════════════════
  _sectionNew(books) {
    if (!books.length) return '';
    return `
      <div style="margin-bottom:4rem;">
        <div style="display:flex;align-items:center;gap:.875rem;margin-bottom:1.75rem;">
          <div style="width:4px;height:32px;background:linear-gradient(var(--color-secondary),#c026d3);border-radius:2px;"></div>
          <h2 style="font-size:1.4rem;margin:0;">🆕 Mới Phát Hành</h2>
          <div style="flex:1;height:1px;background:linear-gradient(90deg,rgba(236,72,153,.3),transparent);"></div>
          <div style="display:flex;align-items:center;gap:6px;background:rgba(236,72,153,.1);
            border:1px solid rgba(236,72,153,.25);padding:4px 12px;border-radius:20px;">
            <div style="width:6px;height:6px;border-radius:50%;background:var(--color-secondary);animation:pulse 1.5s infinite;"></div>
            <span style="font-size:.68rem;color:var(--color-secondary);font-weight:700;">JUST ADDED</span>
          </div>
        </div>
        <div style="display:flex;gap:1.25rem;overflow-x:auto;padding-bottom:1rem;
          scrollbar-width:thin;scrollbar-color:var(--glass-border) transparent;">
          ${books.map((b,i)=>{
            const a=this._getAuthor(b.id);
            return `
              <div data-bookid="${b.id}" style="
                flex-shrink:0;width:180px;cursor:pointer;
                transition:transform .3s;"
                onmouseover="this.style.transform='translateY(-8px) rotate(-1deg)'"
                onmouseout="this.style.transform='translateY(0) rotate(0)'">
                <div style="position:relative;">
                  <img src="${b.thumbnailUrl}" style="width:100%;height:250px;object-fit:cover;
                    border-radius:16px;box-shadow:0 20px 40px rgba(0,0,0,.5);
                    border:1px solid rgba(255,255,255,.15);"/>
                  ${i===0?`<div style="position:absolute;top:10px;left:10px;
                    background:linear-gradient(135deg,var(--color-secondary),#c026d3);
                    color:#fff;padding:3px 10px;border-radius:8px;font-size:.62rem;font-weight:800;">NEWEST</div>`:''}
                  <div style="position:absolute;inset:0;border-radius:16px;
                    background:linear-gradient(180deg,transparent 60%,rgba(4,3,18,.9) 100%);"></div>
                  <div style="position:absolute;bottom:10px;left:10px;right:10px;">
                    ${b.releaseDate?`<div style="font-size:.6rem;color:var(--color-secondary);font-weight:700;margin-bottom:3px;">
                      <i class="fa-regular fa-calendar" style="font-size:.55rem;"></i> ${b.releaseDate}</div>`:''}
                  </div>
                </div>
                <div style="margin-top:.875rem;">
                  <div style="font-size:.82rem;font-weight:700;color:var(--text-main);
                    display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;">${b.name}</div>
                  <div style="font-size:.68rem;color:var(--text-muted);margin-top:2px;">${a?`${a.firstName} ${a.lastName}`:''}</div>
                </div>
              </div>`;
          }).join('')}
        </div>
      </div>`;
  }

  // ══════════════════════════════════════════════════════════════
  // ── SECTION 3: Dành riêng cho bạn ────────────────────────────
  // ══════════════════════════════════════════════════════════════
  _recommendedSection() {
    const user = AuthService.getUser();
    if (!user) return `
      <div style="
        position:relative;border-radius:24px;overflow:hidden;
        padding:3rem;margin-bottom:4rem;text-align:center;
        background:linear-gradient(135deg,rgba(124,58,237,.15) 0%,rgba(236,72,153,.1) 100%);
        border:1px solid rgba(124,58,237,.2);">
        <div style="position:absolute;inset:0;opacity:.05;background:radial-gradient(circle at 70% 50%,var(--color-primary),transparent 60%);"></div>
        <i class="fa-solid fa-headphones-simple" style="font-size:3rem;color:var(--color-primary);margin-bottom:1rem;display:block;"></i>
        <h3 style="margin-bottom:.5rem;font-size:1.2rem;">Đăng nhập để nghe không giới hạn</h3>
        <p style="color:var(--text-muted);font-size:.9rem;margin-bottom:1.5rem;max-width:400px;margin-left:auto;margin-right:auto;">
          Hơn ${this.books.length}+ tác phẩm đang chờ bạn. Tạo danh sách yêu thích, nghe lại lịch sử.
        </p>
        <div style="display:flex;gap:.75rem;justify-content:center;">
          <a href="#login"><button class="btn btn-primary" style="padding:.75rem 2rem;">
            <i class="fa-solid fa-right-to-bracket"></i> Đăng nhập
          </button></a>
          <a href="#explore"><button class="btn" style="background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.2);color:#fff;padding:.75rem 2rem;">
            <i class="fa-solid fa-compass"></i> Khám phá miễn phí
          </button></a>
        </div>
      </div>`;

    const history = this.readingHistory || [];
    let recommended = [];
    if (history.length > 0) {
      const unfinished = history.filter(h=>h.progress<100).map(h=>this.books.find(b=>b.id===h.bookId)).filter(Boolean);
      const readIds = new Set(history.map(h=>h.bookId));
      const readBooks = history.map(h=>this.books.find(b=>b.id===h.bookId)).filter(Boolean);
      const countries = new Set(readBooks.map(b=>b.country).filter(Boolean));
      const similar = this.books.filter(b=>!readIds.has(b.id)&&countries.has(b.country)).slice(0,5-unfinished.slice(0,3).length);
      recommended = [...unfinished.slice(0,3),...similar].slice(0,5);
    }
    if (!recommended.length) recommended = [...this.books].sort((a,b)=>this._views(b)-this._views(a)).slice(5,10);

    return `
      <div style="margin-bottom:4rem;">
        <div style="display:flex;align-items:center;gap:.875rem;margin-bottom:1.75rem;">
          <div style="width:4px;height:32px;background:linear-gradient(var(--color-accent),#06b6d4);border-radius:2px;"></div>
          <h2 style="font-size:1.4rem;margin:0;">✨ Dành riêng cho ${user.firstName||'bạn'}</h2>
          <div style="flex:1;height:1px;background:linear-gradient(90deg,rgba(20,184,166,.3),transparent);"></div>
          <span style="font-size:.75rem;color:var(--text-muted);font-style:italic;">Dựa trên lịch sử của bạn</span>
        </div>
        <div style="display:flex;gap:1.25rem;overflow-x:auto;padding-bottom:1rem;scrollbar-width:thin;scrollbar-color:var(--glass-border) transparent;">
          ${recommended.map(b=>{
            const a=this._getAuthor(b.id);
            const prog=((this.readingHistory||[]).find(h=>h.bookId===b.id)||{}).progress||0;
            return `
              <div data-bookid="${b.id}" style="flex-shrink:0;width:160px;cursor:pointer;position:relative;">
                <div style="position:relative;transition:transform .3s;"
                  onmouseover="this.style.transform='translateY(-6px)'" onmouseout="this.style.transform='translateY(0)'">
                  <img src="${b.thumbnailUrl}" style="width:100%;height:220px;object-fit:cover;
                    border-radius:16px;box-shadow:0 16px 32px rgba(0,0,0,.45);border:1px solid rgba(255,255,255,.12);"/>
                  ${prog>0?`
                    <div style="position:absolute;bottom:0;left:0;right:0;height:4px;
                      background:rgba(0,0,0,.4);border-radius:0 0 16px 16px;overflow:hidden;">
                      <div style="width:${prog}%;height:100%;background:linear-gradient(90deg,var(--color-accent),var(--color-primary));transition:width .5s;"></div>
                    </div>
                    <div style="position:absolute;top:8px;right:8px;background:rgba(0,0,0,.7);
                      backdrop-filter:blur(4px);padding:2px 7px;border-radius:8px;font-size:.6rem;color:var(--color-accent);font-weight:700;">
                      ${prog}%
                    </div>
                  `:''}
                  <div style="position:absolute;inset:0;border-radius:16px;overflow:hidden;">
                    <div style="position:absolute;inset:0;background:rgba(124,58,237,0);
                      display:flex;align-items:center;justify-content:center;
                      transition:background .2s;" class="rec-overlay">
                      <button class="play-book-btn" data-bookid="${b.id}" style="
                        background:var(--color-primary);border:none;color:#fff;
                        width:40px;height:40px;border-radius:50%;cursor:pointer;
                        display:flex;align-items:center;justify-content:center;
                        opacity:0;transform:scale(.8);transition:all .2s;" class="rec-play">
                        <i class="fa-solid fa-play"></i>
                      </button>
                    </div>
                  </div>
                </div>
                <div style="margin-top:.75rem;">
                  <div style="font-size:.82rem;font-weight:700;color:var(--text-main);
                    display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;">${b.name}</div>
                  <div style="font-size:.68rem;color:var(--text-muted);margin-top:2px;">${a?`${a.firstName} ${a.lastName}`:''}</div>
                </div>
              </div>`;
          }).join('')}
        </div>
      </div>`;
  }

  // ══════════════════════════════════════════════════════════════
  // ── SECTION 4: Văn học Việt Nam — Magazine layout ─────────────
  // ══════════════════════════════════════════════════════════════
  _sectionViet(books) {
    if (!books.length) return '';
    const [main, ...rest] = books.slice(0,5);
    const ma = this._getAuthor(main.id);
    return `
      <div style="margin-bottom:4rem;">
        <div style="display:flex;align-items:center;gap:.875rem;margin-bottom:1.75rem;">
          <div style="width:4px;height:32px;background:linear-gradient(#da3349,#ff6b35);border-radius:2px;"></div>
          <h2 style="font-size:1.4rem;margin:0;">🇻🇳 Văn học Việt Nam</h2>
          <div style="flex:1;height:1px;background:linear-gradient(90deg,rgba(218,51,73,.3),transparent);"></div>
        </div>
        <div style="display:grid;grid-template-columns:2fr 3fr;gap:1.25rem;align-items:stretch;">
          <!-- Left: large editorial card -->
          <div data-bookid="${main.id}" style="
            position:relative;border-radius:20px;overflow:hidden;min-height:320px;cursor:pointer;
            box-shadow:0 20px 40px rgba(0,0,0,.4);">
            <img src="${main.thumbnailUrl}" style="position:absolute;inset:0;width:100%;height:100%;
              object-fit:cover;filter:brightness(.4);transition:filter .4s;"/>
            <div style="position:absolute;inset:0;background:linear-gradient(135deg,rgba(218,51,73,.3),rgba(4,3,18,.85));"></div>
            <div style="position:absolute;bottom:0;left:0;right:0;padding:1.5rem;">
              <div style="display:inline-block;background:rgba(218,51,73,.85);
                padding:2px 10px;border-radius:12px;font-size:.65rem;font-weight:700;color:#fff;margin-bottom:.6rem;">
                🇻🇳 NỔI BẬT
              </div>
              <h3 style="font-size:1.3rem;font-family:'Playfair Display',serif;color:#fff;
                margin:0 0 .4rem;line-height:1.25;">${main.name}</h3>
              <p style="font-size:.75rem;color:rgba(255,255,255,.55);margin:0 0 .875rem;
                display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;">
                ${main.description||''}
              </p>
              <p style="font-size:.72rem;color:rgba(255,255,255,.45);margin:0;">
                ${ma?`<i class="fa-solid fa-pen-nib" style="font-size:.62rem;margin-right:4px;color:#da3349;"></i>${ma.firstName} ${ma.lastName}`:''}
              </p>
            </div>
          </div>

          <!-- Right: 2-column grid of smaller cards -->
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem;">
            ${rest.slice(0,4).map(b=>{
              const a=this._getAuthor(b.id);
              return `
                <div data-bookid="${b.id}" style="
                  background:var(--bg-panel);border:1px solid var(--glass-border);
                  border-radius:16px;overflow:hidden;cursor:pointer;
                  display:flex;gap:.75rem;padding:.875rem;
                  transition:all .3s;"
                  onmouseover="this.style.borderColor='rgba(218,51,73,.4)';this.style.transform='translateY(-3px)'"
                  onmouseout="this.style.borderColor='var(--glass-border)';this.style.transform='translateY(0)'">
                  <img src="${b.thumbnailUrl}" style="width:52px;height:72px;object-fit:cover;
                    border-radius:9px;flex-shrink:0;box-shadow:0 6px 14px rgba(0,0,0,.3);"/>
                  <div style="overflow:hidden;">
                    <div style="font-size:.8rem;font-weight:700;color:var(--text-main);
                      display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;line-height:1.3;">${b.name}</div>
                    <div style="font-size:.68rem;color:var(--text-muted);margin-top:3px;">${a?`${a.firstName} ${a.lastName}`:''}</div>
                    <div style="font-size:.65rem;color:#da3349;margin-top:5px;font-weight:600;">
                      <i class="fa-solid fa-headphones" style="font-size:.55rem;"></i> ${this._fmtViews(this._views(b))}
                    </div>
                  </div>
                </div>`;
            }).join('')}
          </div>
        </div>
      </div>`;
  }

  // ══════════════════════════════════════════════════════════════
  // ── SECTION 5: Văn học Thế Giới — Staggered poster grid ──────
  // ══════════════════════════════════════════════════════════════
  _sectionIntl(books) {
    if (!books.length) return '';
    return `
      <div style="margin-bottom:4rem;">
        <div style="display:flex;align-items:center;gap:.875rem;margin-bottom:1.75rem;">
          <div style="width:4px;height:32px;background:linear-gradient(var(--color-primary),#06b6d4);border-radius:2px;"></div>
          <h2 style="font-size:1.4rem;margin:0;">🌍 Văn học Thế Giới</h2>
          <div style="flex:1;height:1px;background:linear-gradient(90deg,rgba(124,58,237,.3),transparent);"></div>
        </div>
        <div style="display:grid;grid-template-columns:repeat(5,1fr);gap:1rem;align-items:end;">
          ${books.slice(0,5).map((b,i)=>{
            const a=this._getAuthor(b.id);
            const heights=['260px','200px','240px','200px','250px'];
            // Extra offset so they look staggered
            const tops=['0','30px','10px','25px','0'];
            return `
              <div data-bookid="${b.id}" style="
                margin-top:${tops[i]};cursor:pointer;
                transition:transform .35s;"
                onmouseover="this.style.transform='translateY(-10px)'"
                onmouseout="this.style.transform='translateY(0)'">
                <div style="position:relative;border-radius:14px;overflow:hidden;">
                  <img src="${b.thumbnailUrl}" style="width:100%;height:${heights[i]};
                    object-fit:cover;border-radius:14px;
                    box-shadow:0 16px 32px rgba(0,0,0,.5);border:1px solid rgba(255,255,255,.12);"/>
                  ${b.country?`<div style="position:absolute;top:8px;right:8px;
                    background:rgba(0,0,0,.65);backdrop-filter:blur(4px);
                    padding:2px 7px;border-radius:8px;font-size:.6rem;color:rgba(255,255,255,.8);">${b.country}</div>`:''}
                  <div style="position:absolute;inset:0;background:linear-gradient(180deg,transparent 50%,rgba(4,3,18,.85) 100%);border-radius:14px;"></div>
                  <div style="position:absolute;bottom:0;left:0;right:0;padding:.75rem .875rem;">
                    <button class="play-book-btn" data-bookid="${b.id}" style="
                      background:var(--color-primary);border:none;color:#fff;
                      width:32px;height:32px;border-radius:50%;cursor:pointer;
                      display:flex;align-items:center;justify-content:center;
                      font-size:.75rem;box-shadow:0 4px 12px rgba(124,58,237,.5);
                      margin-bottom:.5rem;opacity:.85;transition:opacity .2s;">
                      <i class="fa-solid fa-play"></i>
                    </button>
                  </div>
                </div>
                <div style="margin-top:.75rem;padding:0 .25rem;">
                  <div style="font-size:.8rem;font-weight:700;color:var(--text-main);
                    display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;line-height:1.3;">${b.name}</div>
                  <div style="font-size:.67rem;color:var(--text-muted);margin-top:2px;">${a?`${a.firstName} ${a.lastName}`:''}</div>
                </div>
              </div>`;
          }).join('')}
        </div>
      </div>`;
  }

  // ══════════════════════════════════════════════════════════════
  // ── SECTION 6: Kinh Điển — Numbered cinematic strip ──────────
  // ══════════════════════════════════════════════════════════════
  _sectionClassic(books) {
    if (!books.length) return '';
    return `
      <div style="margin-bottom:4rem;">
        <div style="display:flex;align-items:center;gap:.875rem;margin-bottom:1.75rem;">
          <div style="width:4px;height:32px;background:linear-gradient(var(--color-accent),#ffd700);border-radius:2px;"></div>
          <h2 style="font-size:1.4rem;margin:0;">📚 Kinh Điển Mọi Thời Đại</h2>
          <div style="flex:1;height:1px;background:linear-gradient(90deg,rgba(20,184,166,.3),transparent);"></div>
        </div>
        <div style="display:flex;flex-direction:column;gap:.75rem;">
          ${books.slice(0,5).map((b,i)=>{
            const a=this._getAuthor(b.id);
            const chaps=this._getChapters(b.id);
            const numBgs=['linear-gradient(135deg,#ffd700,#ffaa00)','linear-gradient(135deg,#b0b8c1,#8a9bb0)',
                          'linear-gradient(135deg,#cd873f,#a0621e)','var(--glass-border)','var(--glass-border)'];
            return `
              <div data-bookid="${b.id}" style="
                display:flex;align-items:center;gap:1.25rem;
                background:var(--bg-panel);border:1px solid var(--glass-border);
                border-radius:18px;padding:1rem 1.25rem;cursor:pointer;
                transition:all .3s;position:relative;overflow:hidden;"
                onmouseover="this.style.background='var(--bg-main)';this.style.transform='translateX(6px)';this.style.borderColor='rgba(20,184,166,.3)'"
                onmouseout="this.style.background='var(--bg-panel)';this.style.transform='translateX(0)';this.style.borderColor='var(--glass-border)'">
                <!-- Rank number -->
                <div style="
                  width:44px;height:44px;border-radius:12px;flex-shrink:0;
                  background:${numBgs[i]};
                  display:flex;align-items:center;justify-content:center;
                  font-size:1.2rem;font-weight:900;color:${i<3?'#000':'var(--text-muted)'};
                  font-family:'Outfit',sans-serif;">${i+1}</div>
                <!-- Cover -->
                <img src="${b.thumbnailUrl}" style="width:52px;height:72px;
                  object-fit:cover;border-radius:10px;flex-shrink:0;
                  box-shadow:0 8px 20px rgba(0,0,0,.4);border:1px solid rgba(255,255,255,.1);"/>
                <!-- Info -->
                <div style="flex:1;overflow:hidden;">
                  <h4 style="font-size:.95rem;font-weight:700;color:var(--text-main);
                    margin:0 0 .25rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${b.name}</h4>
                  <p style="font-size:.75rem;color:var(--text-muted);margin:0 0 .4rem;">
                    ${a?`<i class="fa-solid fa-pen-nib" style="font-size:.65rem;margin-right:4px;color:var(--color-accent);"></i>${a.firstName} ${a.lastName}`:''}
                    ${b.country?`<span style="margin-left:.625rem;color:var(--text-muted);">· ${b.country}</span>`:''}
                  </p>
                  <div style="display:flex;gap:.875rem;align-items:center;">
                    <span style="font-size:.68rem;color:var(--text-muted);">
                      <i class="fa-solid fa-headphones" style="font-size:.6rem;"></i> ${this._fmtViews(this._views(b))} lượt
                    </span>
                    ${chaps.length?`<span style="font-size:.68rem;color:var(--text-muted);">· ${chaps.length} chương</span>`:''}
                  </div>
                </div>
                <!-- Play button -->
                <button class="play-book-btn" data-bookid="${b.id}" style="
                  background:rgba(20,184,166,.15);border:1px solid rgba(20,184,166,.3);color:var(--color-accent);
                  width:40px;height:40px;border-radius:50%;cursor:pointer;flex-shrink:0;
                  display:flex;align-items:center;justify-content:center;
                  font-size:.8rem;transition:all .2s;"
                  onmouseover="this.style.background='var(--color-accent)';this.style.color='#fff'"
                  onmouseout="this.style.background='rgba(20,184,166,.15)';this.style.color='var(--color-accent)'">
                  <i class="fa-solid fa-play"></i>
                </button>
              </div>`;
          }).join('')}
        </div>
      </div>`;
  }

  // ══════════════════════════════════════════════════════════════
  // ── CTA Banner ───────────────────────────────────────────────
  // ══════════════════════════════════════════════════════════════
  _ctaBanner() {
    const user = AuthService.getUser();
    if (user && user.subscriptionPlan === 'PREMIUM') {
      return ''; // Hide for Premium users
    }

    const isFree = user && user.subscriptionPlan === 'FREE';
    const link = isFree ? '#user' : '#login';
    const btnText = isFree ? 'Nâng cấp Premium →' : 'Đăng ký miễn phí →';
    const subText = isFree ? 'Nâng cấp để nghe thả ga không giới hạn số sách mỗi tháng' : `Hơn ${this.books.length} tác phẩm · ${this.authors.length} tác giả · Miễn phí 30 giây mỗi chương`;

    return `
      <div style="
        position:relative;border-radius:24px;overflow:hidden;
        padding:3rem 4rem;margin-bottom:2rem;
        background:linear-gradient(135deg,var(--color-primary) 0%,#c026d3 50%,var(--color-secondary) 100%);">
        <!-- Decorative orbs -->
        <div style="position:absolute;width:300px;height:300px;border-radius:50%;
          top:-100px;right:-50px;background:rgba(255,255,255,.08);pointer-events:none;"></div>
        <div style="position:absolute;width:200px;height:200px;border-radius:50%;
          bottom:-60px;left:20%;background:rgba(255,255,255,.06);pointer-events:none;"></div>
        <div style="position:relative;z-index:1;display:flex;align-items:center;justify-content:space-between;gap:2rem;">
          <div>
            <h2 style="font-size:1.75rem;color:#fff;margin:0 0 .5rem;font-family:'Playfair Display',serif;">
              🎧 Bắt đầu hành trình nghe sách hôm nay
            </h2>
            <p style="color:rgba(255,255,255,.75);font-size:.95rem;margin:0;">
              ${subText}
            </p>
          </div>
          <div style="display:flex;gap:.875rem;flex-shrink:0;">
            <a href="${link}"><button style="
              background:#fff;border:none;color:var(--color-primary);
              padding:.875rem 2rem;border-radius:12px;font-weight:700;
              font-size:.95rem;cursor:pointer;font-family:'Outfit',sans-serif;
              transition:all .2s;box-shadow:0 8px 24px rgba(0,0,0,.2);"
              onmouseover="this.style.transform='scale(1.03)'" onmouseout="this.style.transform='scale(1)'">
              ${btnText}
            </button></a>
          </div>
        </div>
      </div>`;
  }

  // ── Main render ───────────────────────────────────────────────
  _reRender() {
    const container = document.getElementById('explore-root');
    if (!container) return;

    if (this.isLoading) {
      container.innerHTML = `
        <div class="skeleton" style="height:460px;border-radius:28px;margin-bottom:3rem;"></div>
        <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:1rem;margin-bottom:3rem;">
          ${Array(4).fill('<div class="skeleton" style="height:100px;border-radius:20px;"></div>').join('')}
        </div>
        <div class="skeleton" style="height:380px;border-radius:24px;margin-bottom:3rem;"></div>`;
      return;
    }

    const byViews  = [...this.books].sort((a,b) => this._views(b)-this._views(a));
    const featured = byViews.slice(0,5);
    const byDate   = [...this.books].sort((a,b) => {
      const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      if (bTime !== aTime && !isNaN(bTime) && !isNaN(aTime)) {
        return bTime - aTime;
      }
      return (parseInt(b.releaseDate)||0) - (parseInt(a.releaseDate)||0);
    });
    const newest   = byDate.slice(0,6);
    const classics = byViews.slice(15,20);
    const viet     = this.books.filter(b => b.country==='Việt Nam').slice(0,5);
    const intl     = this.books.filter(b => b.country!=='Việt Nam' && b.country).slice(0,5);

    container.innerHTML = `
      ${this._hero()}
      ${this._genrePills()}
      ${this._sectionFeatured(featured)}
      ${this._sectionNew(newest)}
      ${this._recommendedSection()}
      ${this._sectionViet(viet)}
      ${this._sectionIntl(intl)}
      ${this._sectionClassic(classics)}
      ${this._ctaBanner()}
    `;

    // Global CSS for hover effects
    if (!document.getElementById('explore-extra-style')) {
      const st = document.createElement('style');
      st.id = 'explore-extra-style';
      st.textContent = `
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.4} }
        .hover-lift { transition: transform .3s, box-shadow .3s !important; }
        .hover-lift:hover { transform: translateY(-5px); box-shadow: var(--shadow-lg); }
        [data-bookid] { cursor: pointer; }
        .card-hover-overlay { pointer-events: none; }
        [data-bookid]:hover .card-hover-overlay { opacity: 1 !important; pointer-events: auto; }
      `;
      document.head.appendChild(st);
    }

    this._attachEvents();
    this._startHeroCarousel();
  }

  _attachEvents() {
    // Generic: any [data-bookid] click → book detail, unless it's a play button
    document.querySelectorAll('[data-bookid]').forEach(el => {
      if (el.tagName === 'BUTTON' || el.tagName === 'IMG') return;
      el.addEventListener('click', (e) => {
        if (e.target.closest('.play-book-btn,.hero-play-btn,.hero-detail-btn,.hero-book-cover-btn,.hero-thumb-item')) return;
        const id = parseInt(el.dataset.bookid);
        if (id) this._openBook(id);
      });
    });

    // Play buttons → player
    document.querySelectorAll('.play-book-btn,.hero-play-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = parseInt(btn.dataset.bookid);
        if (id) this._playBook(id);
      });
    });

    // Detail buttons → book page
    document.querySelectorAll('.hero-detail-btn,.hero-book-cover-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = parseInt(btn.dataset.bookid);
        if (id) this._openBook(id);
      });
    });

    // Thumbnail strip
    const dataEl = document.getElementById('hero-data');
    if (dataEl) {
      const books = JSON.parse(dataEl.textContent);
      document.querySelectorAll('.hero-thumb-item').forEach(el => {
        el.addEventListener('click', () => {
          if (window.__exploreHeroInterval) clearInterval(window.__exploreHeroInterval);
          const idx = parseInt(el.dataset.hi);
          this._currentSlide = idx;
          this._heroProgress = 0;
          document.getElementById('hero-progress-bar').style.width = '0%';
          this._updateHeroBook(books, idx);
          this._startHeroCarousel();
        });
        el.addEventListener('mouseenter', () => el.style.background='rgba(255,255,255,.17)');
        el.addEventListener('mouseleave', () => {
          const isActive = parseInt(el.dataset.hi) === this._currentSlide;
          el.style.background = isActive ? 'rgba(255,255,255,.12)' : 'rgba(255,255,255,.05)';
        });
      });
    }

    // Pause on hover
    const banner = document.getElementById('hero-banner');
    banner?.addEventListener('mouseenter', () => {
      if (window.__exploreHeroInterval) clearInterval(window.__exploreHeroInterval);
    });
    banner?.addEventListener('mouseleave', () => this._startHeroCarousel());
  }

  afterRender() {
    this._currentSlide = 0;
    this._heroProgress = 0;
    if (window.__exploreHeroInterval) clearInterval(window.__exploreHeroInterval);
    this.fetchData();
  }

  render() {
    return `
      <div class="container" style="padding-top:2rem;padding-bottom:5rem;">
        <div id="explore-root">
          <div class="skeleton" style="height:460px;border-radius:28px;margin-bottom:3rem;"></div>
          <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:1rem;margin-bottom:3rem;">
            ${Array(4).fill('<div class="skeleton" style="height:100px;border-radius:20px;"></div>').join('')}
          </div>
          <div class="skeleton" style="height:380px;border-radius:24px;"></div>
        </div>
      </div>`;
  }
}
