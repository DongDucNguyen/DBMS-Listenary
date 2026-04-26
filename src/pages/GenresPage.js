import '../pages.css';
import { MockDbService } from '../services/MockDbService.js';

// Map category → visual config (icon, gradient base colors)
const CATEGORY_CONFIG = {
  '1': { icon: 'fa-dragon',      label: 'Văn học Việt Nam',    colorA: '#da3349', colorB: '#c0392b' },
  '2': { icon: 'fa-globe-asia',   label: 'Văn học Nước ngoài',  colorA: '#2980b9', colorB: '#1a5276' },
  '3': { icon: 'fa-users',        label: 'Đời sống & Xã hội',   colorA: '#27ae60', colorB: '#1e8449' },
  '4': { icon: 'fa-graduation-cap', label: 'Giáo dục',          colorA: '#8e44ad', colorB: '#6c3483' },
  '5': { icon: 'fa-star',         label: 'Khác',                colorA: '#e67e22', colorB: '#ca6f1e' },
  'philo': { icon: 'fa-brain',    label: 'Triết học',           colorA: '#0f3460', colorB: '#533483' },
  'self':  { icon: 'fa-seedling', label: 'Phát triển bản thân', colorA: '#2ecc71', colorB: '#16a085' },
  'sci':   { icon: 'fa-atom',     label: 'Khoa học',            colorA: '#00b4d8', colorB: '#0077b6' },
  'biz':   { icon: 'fa-chart-line', label: 'Kinh doanh',        colorA: '#f39c12', colorB: '#d68910' },
  'hist':  { icon: 'fa-landmark', label: 'Lịch sử',             colorA: '#795548', colorB: '#5d4037' },
};

// Map bookId → extra genre tag based on keywords in name/description
const EXTRA_GENRES = {
  'philo': [1,2,3,4,5],
  'self':  [6,7,8,9,10,46],
  'sci':   [41,42,43,44],
  'biz':   [39,40],
  'hist':  [33,34,35,36,37,38],
};

export class GenresPage {
  constructor() {
    this.books = [];
    this.categories = [];
    this.categoriesOfBooks = [];
    this.selectedCatId = null;
    this.isLoading = true;
  }

  async fetchData() {
    const res = await fetch('/database.json?t=' + Date.now());
    const data = await res.json();
    this.books = (data.books || []).filter(b => !b.approvalStatus || b.approvalStatus === 'APPROVED');
    this.categories = data.category || [];
    this.categoriesOfBooks = data.categoriesOfBooks || [];
    
    // Reverse lookup for extra genres
    this.extraGenreBooks = {};
    Object.entries(EXTRA_GENRES).forEach(([key, ids]) => {
      this.extraGenreBooks[key] = ids;
    });
    
    this.isLoading = false;
    this._reRender();
  }

  _getBooksForCategory(catId) {
    if (this.extraGenreBooks[catId]) {
      return this.books.filter(b => this.extraGenreBooks[catId].includes(b.id));
    }
    const bookIds = this.categoriesOfBooks
      .filter(r => String(r.CategoryId) === String(catId))
      .map(r => r.BookId);
    return this.books.filter(b => bookIds.includes(b.id));
  }

  _allGenres() {
    const base = this.categories.map(c => ({ id: String(c.id), name: c.name }));
    const extras = ['philo','self','biz','hist','sci'].map(k => ({ id: k, name: CATEGORY_CONFIG[k].label }));
    return [...base, ...extras];
  }

  _fmtViews(b) {
    const n = MockDbService.getViewCount(b);
    return n >= 1000 ? (n/1000).toFixed(n>=10000?0:1)+'K' : n;
  }

  // ══════════════════════════════════════════════════════════════
  // ── 1) ALL GENRES GRID ────────────────────────────────────────
  // ══════════════════════════════════════════════════════════════
  _renderAllGenresView() {
    const genres = this._allGenres();
    return `
      <!-- Hero Header for All Genres -->
      <div class="animate-slide-up" style="
        position:relative;margin-bottom:3rem;padding:4rem 3rem;border-radius:28px;
        background:linear-gradient(135deg, var(--bg-panel), var(--bg-main));
        border:1px solid var(--glass-border);overflow:hidden;
        display:flex;flex-direction:column;align-items:center;text-align:center;">
        
        <!-- Animated Background Blur Orbs -->
        <div style="position:absolute;top:-50%;left:-10%;width:50%;height:150%;background:rgba(236,72,153,0.15);border-radius:50%;filter:blur(80px);pointer-events:none;"></div>
        <div style="position:absolute;bottom:-50%;right:-10%;width:50%;height:150%;background:rgba(56,189,248,0.15);border-radius:50%;filter:blur(80px);pointer-events:none;"></div>

        <h1 style="font-size:3.5rem;font-family:'Playfair Display',serif;margin:0 0 1rem;color:var(--text-main);text-shadow:0 10px 30px rgba(0,0,0,0.15);">
          Khám Phá Vô Tận
        </h1>
        <p style="font-size:1.1rem;color:var(--text-muted);max-width:600px;line-height:1.6;margin:0;">
          Lựa chọn một chủ đề tĩnh lặng cho buổi tối muộn, hay một bí ẩn rùng rợn cho chuyến đi dài. Hàng ngàn câu chuyện đang chờ bạn mở ra.
        </p>
      </div>

      <!-- Categories Masonry Grid -->
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:1.5rem;">
        ${genres.map((g, i) => {
          const cfg = CATEGORY_CONFIG[g.id] || CATEGORY_CONFIG['5'];
          const books = this._getBooksForCategory(g.id);
          const delay = Math.min(i * 60, 600);
          
          // Generate a collage background from book covers
          const coverImages = books.slice(0, 3).map(b => b.thumbnailUrl);
          let bgCollage = '';
          if (coverImages.length >= 1) {
            bgCollage = `
              <div style="position:absolute;inset:0;display:flex;opacity:0.35;filter:blur(3px);">
                ${coverImages.map(url => `<img src="${url}" style="flex:1;height:100%;object-fit:cover;"/>`).join('')}
              </div>
            `;
          }

          return `
            <div class="hover-lift genre-grid-card" data-catid="${g.id}" style="
              position:relative;height:240px;border-radius:24px;overflow:hidden;
              cursor:pointer;animation:fadeInUp 0.5s ease ${delay}ms both;
              box-shadow:0 15px 35px rgba(0,0,0,0.4);border:1px solid rgba(255,255,255,0.08);">
              
              <!-- Background Collage & Gradient Tint -->
              ${bgCollage}
              <div style="position:absolute;inset:0;background:linear-gradient(135deg, ${cfg.colorA}E6, ${cfg.colorB}E6);"></div>
              <div style="position:absolute;inset:0;background:linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 100%);"></div>

              <!-- Content -->
              <div style="position:absolute;inset:0;padding:2rem;display:flex;flex-direction:column;justify-content:space-between;z-index:2;">
                <div style="display:flex;align-items:flex-start;justify-content:space-between;">
                  <div style="width:48px;height:48px;background:rgba(255,255,255,0.15);backdrop-filter:blur(10px);border-radius:14px;
                    display:flex;align-items:center;justify-content:center;">
                    <i class="fa-solid ${cfg.icon}" style="font-size:1.6rem;color:#fff;"></i>
                  </div>
                  <div style="background:rgba(0,0,0,0.3);padding:4px 12px;border-radius:20px;font-size:0.75rem;font-weight:700;color:rgba(255,255,255,0.9);backdrop-filter:blur(5px);">
                    ${books.length} sách
                  </div>
                </div>

                <div>
                  <h3 style="font-size:1.5rem;color:#fff;margin:0 0 0.5rem;font-weight:800;letter-spacing:-0.5px;">${cfg.label || g.name}</h3>
                  <div style="display:flex;gap:6px;">
                    ${books.slice(0,5).map(b => `<img src="${b.thumbnailUrl}" style="width:28px;height:42px;object-fit:cover;border-radius:4px;box-shadow:0 4px 10px rgba(0,0,0,0.5);border:1px solid rgba(255,255,255,0.2);"/>`).join('')}
                    ${books.length > 5 ? `<div style="width:28px;height:42px;background:rgba(255,255,255,0.2);backdrop-filter:blur(5px);border-radius:4px;display:flex;align-items:center;justify-content:center;font-size:0.6rem;color:#fff;font-weight:700;">+${books.length-5}</div>` : ''}
                  </div>
                </div>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;
  }

  // ══════════════════════════════════════════════════════════════
  // ── 2) SINGLE GENRE VIEW ──────────────────────────────────────
  // ══════════════════════════════════════════════════════════════
  _renderSingleGenreView(genre) {
    const cfg = CATEGORY_CONFIG[genre.id] || CATEGORY_CONFIG['5'];
    const books = this._getBooksForCategory(genre.id);

    return `
      <div class="animate-fade-in">
        <!-- Navigation Back -->
        <button id="back-genres-btn" class="btn hover-lift" style="
          background:var(--bg-panel);border:1px solid var(--glass-border);color:var(--text-main);
          padding:0.6rem 1.25rem;border-radius:20px;font-size:0.9rem;margin-bottom:1.5rem;
          display:inline-flex;align-items:center;gap:8px;">
          <i class="fa-solid fa-arrow-left"></i> Danh mục
        </button>

        <!-- Cinematic Hero for Genre -->
        <div style="
          position:relative;border-radius:32px;overflow:hidden;padding:4rem 3rem;margin-bottom:3rem;
          background:linear-gradient(135deg, ${cfg.colorA}, ${cfg.colorB});
          box-shadow:0 25px 50px rgba(0,0,0,0.5);
          display:flex;align-items:center;justify-content:space-between;gap:3rem;">
          
          <div style="position:absolute;inset:0;background:url('data:image/svg+xml,%3Csvg width=\\'60\\' height=\\'60\\' viewBox=\\'0 0 60 60\\' xmlns=\\'http://www.w3.org/2000/svg\\'%3E%3Cg fill=\\'none\\' fill-rule=\\'evenodd\\'%3E%3Cg fill=\\'%23ffffff\\' fill-opacity=\\'0.05\\'%3E%3Cpath d=\\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E');"></div>
          <div style="position:absolute;bottom:0;left:0;right:0;height:70%;background:linear-gradient(to top, rgba(0,0,0,0.5) 0%, transparent 100%);"></div>

          <!-- Title Block -->
          <div style="position:relative;z-index:2;flex:1;">
            <div style="display:inline-flex;align-items:center;justify-content:center;width:60px;height:60px;background:rgba(255,255,255,0.2);backdrop-filter:blur(10px);border-radius:18px;margin-bottom:1.5rem;">
              <i class="fa-solid ${cfg.icon}" style="font-size:1.8rem;color:#fff;"></i>
            </div>
            <h1 style="font-size:3.5rem;font-family:'Playfair Display',serif;color:#fff;margin:0 0 1rem;line-height:1.1;">
              ${cfg.label || genre.name}
            </h1>
            <p style="font-size:1.1rem;color:rgba(255,255,255,0.8);line-height:1.6;margin-bottom:2rem;max-width:500px;">
              Khám phá bộ sưu tập gồm ${books.length} tác phẩm chọn lọc kỹ lưỡng, đưa bạn đắm chìm vào thế giới của ${cfg.label || genre.name}.
            </p>
            <button class="btn btn-primary shadow-glow hover-lift" style="
              background:#fff;color:${cfg.colorA};border-radius:24px;padding:0.875rem 2.5rem;
              font-size:1rem;font-weight:800;border:none;">
              <i class="fa-solid fa-shuffle" style="margin-right:8px;"></i> Phát ngẫu nhiên
            </button>
          </div>

          <!-- Staggered Book Covers (Fanned out) -->
          <div style="position:relative;z-index:2;width:300px;height:400px;display:flex;align-items:center;justify-content:center;margin-right:2rem;perspective:1000px;">
            ${books.slice(0, 3).map((b, i) => {
              const rot = (i - 1) * 15;   // -15, 0, +15
              const tx = (i - 1) * 40;    // -40, 0, +40
              const ty = Math.abs(i - 1) * 20; // 20, 0, 20
              const z = 100 - Math.abs(i - 1)*50;
              return `
                <img src="${b.thumbnailUrl}" style="
                  position:absolute;width:180px;height:270px;object-fit:cover;border-radius:12px;
                  box-shadow:0 20px 40px rgba(0,0,0,0.6);border:2px solid rgba(255,255,255,0.15);
                  transform:translateX(${tx}px) translateY(${ty}px) translateZ(${z}px) rotateZ(${rot}deg);
                  transition:all 0.5s cubic-bezier(0.22,1,0.36,1);"
                  onmouseover="this.style.transform='translateX(${tx}px) translateY(${ty-30}px) translateZ(${z+50}px) rotateZ(${rot}deg)'"
                  onmouseout="this.style.transform='translateX(${tx}px) translateY(${ty}px) translateZ(${z}px) rotateZ(${rot}deg)'"
                />
              `;
            }).join('')}
          </div>
        </div>

        <!-- Books Grid -->
        <div style="display:flex;align-items:center;gap:1.5rem;margin-bottom:2rem;">
          <h2 style="font-size:1.6rem;margin:0;">Tất cả sách (${books.length})</h2>
          <div style="flex:1;height:1px;background:linear-gradient(90deg, rgba(236,72,153,.3), transparent);"></div>
          
          <!-- Filters (Cosmetic) -->
          <div style="display:flex;gap:0.5rem;">
            <button class="btn" style="background:var(--bg-panel);border:1px solid var(--glass-border);border-radius:20px;padding:0.4rem 1rem;font-size:0.8rem;color:var(--text-main);">Mới nhất</button>
            <button class="btn" style="background:var(--bg-panel);border:1px solid var(--color-primary);border-radius:20px;padding:0.4rem 1rem;font-size:0.8rem;color:var(--color-primary);">Lượt nghe</button>
          </div>
        </div>

        ${books.length === 0 ? `
          <div style="padding:5rem;text-align:center;background:var(--bg-panel);border-radius:24px;border:1px dashed var(--glass-border);">
            <i class="fa-solid fa-folder-open" style="font-size:3.5rem;color:var(--text-muted);margin-bottom:1.5rem;"></i>
            <p style="color:var(--text-muted);font-size:1.05rem;">Chưa có tác phẩm nào trong thư mục này.</p>
          </div>
        ` : `
          <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:1.5rem;margin-bottom:4rem;">
            ${books.sort((a,b)=>MockDbService.getViewCount(b)-MockDbService.getViewCount(a)).map((b, i) => {
              const delay = Math.min(i * 40, 600);
              return `
                <div class="hover-lift" data-bookid="${b.id}" style="
                  background:var(--bg-panel);border:1px solid var(--glass-border);
                  border-radius:16px;overflow:hidden;cursor:pointer;
                  display:flex;flex-direction:column;
                  animation:fadeInScale 0.5s cubic-bezier(0.22,1,0.36,1) ${delay}ms both;">
                  
                  <div style="position:relative;height:260px;overflow:hidden;">
                    <img src="${b.thumbnailUrl}" style="width:100%;height:100%;object-fit:cover;transition:transform 0.4s ease;"
                      onmouseover="this.style.transform='scale(1.08)'" onmouseout="this.style.transform='scale(1)'"/>
                    
                    <button class="play-book-btn" data-bookid="${b.id}" style="
                      position:absolute;bottom:15px;right:15px;
                      background:var(--color-primary);border:none;color:#fff;
                      width:42px;height:42px;border-radius:50%;cursor:pointer;
                      display:flex;align-items:center;justify-content:center;
                      font-size:1rem;box-shadow:0 8px 16px rgba(0,0,0,0.5);
                      transition:transform 0.2s;opacity:0.9;"
                      onmouseover="this.style.transform='scale(1.1)';this.style.opacity='1'" 
                      onmouseout="this.style.transform='scale(1)';this.style.opacity='0.9'">
                      <i class="fa-solid fa-play"></i>
                    </button>
                    <!-- Country badge -->
                    ${b.country ? `
                      <div style="position:absolute;top:10px;left:10px;background:rgba(0,0,0,0.6);backdrop-filter:blur(4px);
                        padding:4px 8px;border-radius:8px;font-size:0.65rem;font-weight:700;color:#fff;">
                        ${b.country}
                      </div>
                    ` : ''}
                  </div>
                  
                  <div style="padding:1rem;flex:1;display:flex;flex-direction:column;">
                    <h4 style="font-size:0.95rem;font-weight:700;margin:0 0 0.4rem;color:var(--text-main);
                      display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;line-height:1.3;">
                      ${b.name}
                    </h4>
                    <div style="margin-top:auto;display:flex;align-items:center;justify-content:space-between;font-size:0.75rem;color:var(--text-muted);">
                      <span><i class="fa-solid fa-headphones" style="color:var(--color-secondary);"></i> ${this._fmtViews(b)}</span>
                    </div>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        `}
      </div>
    `;
  }

  // ══════════════════════════════════════════════════════════════
  // ── CORE LOGIC ────────────────────────────────────────────────
  // ══════════════════════════════════════════════════════════════
  _reRender() {
    const container = document.getElementById('genres-content');
    if (!container) return;

    if (this.isLoading) {
      container.innerHTML = `
        <div class="skeleton" style="height:350px;border-radius:28px;margin-bottom:3rem;"></div>
        <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:1.5rem;">
          ${Array(8).fill(`<div class="skeleton" style="height:240px;border-radius:24px;"></div>`).join('')}
        </div>
      `;
      return;
    }

    if (this.selectedCatId) {
      const genre = this._allGenres().find(g => g.id === this.selectedCatId);
      container.innerHTML = this._renderSingleGenreView(genre);
      
      // Bind back button
      const backBtn = document.getElementById('back-genres-btn');
      if (backBtn) {
        backBtn.addEventListener('click', () => {
          this.selectedCatId = null;
          this._reRender(); // Re-render to show all genres grid
        });
      }
    } else {
      container.innerHTML = this._renderAllGenresView();
    }

    // Add extra CSS
    if (!document.getElementById('genres-extra-style')) {
      const st = document.createElement('style');
      st.id = 'genres-extra-style';
      st.textContent = `
        .hover-lift { transition: transform 0.3s cubic-bezier(0.22,1,0.36,1), box-shadow 0.3s cubic-bezier(0.22,1,0.36,1), border-color 0.3s; }
        .hover-lift:hover { transform: translateY(-8px); box-shadow: 0 20px 40px rgba(0,0,0,0.5); }
        .shadow-glow { box-shadow: 0 0 20px rgba(255,255,255,0.2); transition: box-shadow 0.3s; }
        .shadow-glow:hover { box-shadow: 0 0 30px rgba(255,255,255,0.4); }
      `;
      document.head.appendChild(st);
    }

    this._attachEvents();
  }

  _attachEvents() {
    // Top Level Grid Clicks
    document.querySelectorAll('.genre-grid-card').forEach(el => {
      el.addEventListener('click', () => {
        this.selectedCatId = el.dataset.catid;
        this._reRender();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    });

    // Book Card Clicks (inside detail view)
    document.querySelectorAll('[data-bookid]').forEach(el => {
      el.addEventListener('click', (e) => {
        if (el.classList.contains('genre-grid-card')) return;
        
        // Prevent trigger if they click the actual run button (handled separately if needed, 
        // but here play button delegates to same player logic)
        const id = parseInt(el.dataset.bookid);
        if (id) {
          if (el.classList.contains('play-book-btn') || e.target.closest('.play-book-btn')) {
            window.location.hash = `#player?id=${id}`;
          } else {
            window.location.hash = `#book?id=${id}`;
          }
        }
      });
    });
  }

  afterRender() {
    this._reRender();
    this.fetchData();
  }

  render() {
    return `
      <div class="container" style="padding-top:2.5rem;padding-bottom:6rem;">
        <div id="genres-content">
          <!-- Skeletons injected here during load -->
        </div>
      </div>
    `;
  }
}
