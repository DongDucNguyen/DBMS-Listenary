import '../pages.css';
import { MockDbService } from '../services/MockDbService.js';

export class TrendingPage {
  constructor() {
    this.books = [];
    this.authors = [];
    this.authorsOfBooks = [];
    this.isLoading = true;
  }

  async fetchData() {
    try {
      const res = await fetch('/database.json?t=' + Date.now());
      const data = await res.json();

      // Gán views từ MockDbService (kết hợp weeklyViewCount + lịch sử nghe thực)
      this.books = data.books.map(b => ({
        ...b,
        views: MockDbService.getViewCount(b)
      }))
        .sort((a, b) => b.views - a.views)
        .slice(0, 20);

      this.authors = data.author;
      this.authorsOfBooks = data.authorsOfBooks || [];
    } catch (e) {
      console.error('TrendingPage fetch error:', e);
    } finally {
      this.isLoading = false;
      this._reRender();
    }
  }

  _getAuthor(bookId) {
    const rel = this.authorsOfBooks.find(r => r.BookId === bookId);
    return rel ? this.authors.find(a => a.id === rel.AuthorId) : null;
  }

  _fmt(n) {
    if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
    if (n >= 1000)    return Math.floor(n / 1000) + 'K';
    return n.toString();
  }

  _medalBg(i) {
    if (i === 0) return 'linear-gradient(135deg,#ffd700,#ffaa00)';
    if (i === 1) return 'linear-gradient(135deg,#b0b8c1,#8a9bb0)';
    if (i === 2) return 'linear-gradient(135deg,#cd873f,#a0621e)';
    return 'var(--bg-main)';
  }

  _safeStr(str) {
    return (str || '').replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/"/g, '&quot;').replace(/\n/g, ' ');
  }

  _reRender() {
    const container = document.getElementById('trending-content');
    if (!container) return;

    if (this.isLoading) {
      container.innerHTML = `
        <div class="skeleton" style="height:340px;border-radius:24px;margin-bottom:2.5rem;"></div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:1.25rem;">
          ${Array(10).fill('<div class="skeleton" style="height:84px;border-radius:16px;"></div>').join('')}
        </div>`;
      return;
    }

    if (!this.books.length) {
      container.innerHTML = `<p style="text-align:center;color:var(--text-muted);padding:5rem;">Không có dữ liệu.</p>`;
      return;
    }

    const [top1, top2, top3, ...rest] = this.books;

    // ── Hero ─────────────────────────────────────────────────────────────
    const a1 = this._getAuthor(top1.id);
    const heroHtml = `
      <div style="
        position:relative;border-radius:24px;overflow:hidden;
        min-height:340px;display:flex;align-items:flex-end;
        margin-bottom:2.5rem;background:var(--bg-main);
      ">
        <div style="position:absolute;inset:0;background:var(--bg-main);"></div>
        <!-- blurred bg -->
        <img src="${top1.thumbnailUrl}" alt=""
          style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;filter:blur(14px) saturate(1.5);opacity:0.25;transform:scale(1.08);" />

        <!-- overlay gradient -->
        <div style="position:absolute;inset:0;background:linear-gradient(to right,var(--bg-main) 20%,var(--bg-panel) 60%,transparent 100%);"></div>
        <div style="position:absolute;inset:0;background:linear-gradient(to top,var(--bg-panel) 0%,transparent 50%);"></div>

        <!-- content -->
        <div style="position:relative;display:flex;align-items:flex-end;gap:2.5rem;padding:2.5rem;width:100%;">
          <!-- Book cover -->
          <img src="${top1.thumbnailUrl}" alt="${this._safeStr(top1.name)}"
            style="width:160px;height:220px;object-fit:cover;border-radius:14px;flex-shrink:0;
                   box-shadow:0 20px 50px rgba(0,0,0,0.6);border:2px solid rgba(255,255,255,0.15);" />

          <!-- Text -->
          <div style="flex:1;">
            <div style="display:flex;align-items:center;gap:0.75rem;margin-bottom:1rem;">
              <span style="background:linear-gradient(135deg,#ffd700,#ffaa00);color:#000;
                           padding:4px 16px;border-radius:20px;font-size:0.75rem;font-weight:800;
                           letter-spacing:1.5px;text-transform:uppercase;">
                #1 Trending
              </span>
              <span style="color:var(--text-muted);font-size:0.82rem;">
                <i class="fa-solid fa-fire" style="color:#ff6b35;"></i>
                ${this._fmt(top1.views)} lượt nghe tuần này
              </span>
            </div>

            <h1 style="font-size:2.4rem;font-family:var(--font-serif);color:var(--text-main);margin-bottom:0.4rem;
                       line-height:1.2;text-shadow:0 2px 20px rgba(0,0,0,0.15);">
              ${top1.name}
            </h1>

            <p style="font-size:0.9rem;color:var(--text-muted);margin-bottom:0.5rem;">
              ${a1 ? `<i class="fa-solid fa-pen-nib" style="margin-right:4px;"></i>${a1.firstName} ${a1.lastName}` : ''}
              ${top1.country ? ` &nbsp;·&nbsp; ${top1.country}` : ''}
              ${top1.releaseDate ? ` &nbsp;·&nbsp; ${top1.releaseDate}` : ''}
            </p>

            <p style="font-size:0.85rem;color:var(--text-muted);max-width:500px;
                      display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;
                      margin-bottom:1.5rem;">
              ${top1.description || ''}
            </p>

            <div style="display:flex;gap:0.75rem;">
              <button id="hero-play-btn" class="btn btn-primary"
                      style="padding:0.75rem 1.75rem;font-size:0.95rem;">
                <i class="fa-solid fa-play"></i> Nghe ngay
              </button>
              <button class="btn" style="background:var(--bg-panel);border:1px solid var(--glass-border);
                                        color:var(--text-main);padding:0.75rem 1.25rem;">
                <i class="fa-solid fa-bookmark"></i> Lưu lại
              </button>
            </div>
          </div>

          <!-- Top 2 & 3 mini -->
          <div style="display:flex;flex-direction:column;gap:1rem;margin-left:auto;flex-shrink:0;">
            ${[top2, top3].filter(Boolean).map((b, idx) => `
              <div id="mini-book-${b.id}" style="
                display:flex;align-items:center;gap:0.875rem;
                background:var(--bg-panel);backdrop-filter:blur(10px);
                border:1px solid var(--glass-border);border-radius:14px;
                padding:0.75rem 1rem;cursor:pointer;min-width:240px;
                transition:all 0.25s ease;
              ">
                <span style="
                  background:${this._medalBg(idx + 1)};
                  color:${idx===0?'#000':'var(--text-muted)'};font-size:0.9rem;font-weight:800;
                  width:30px;height:30px;border-radius:8px;
                  display:flex;align-items:center;justify-content:center;flex-shrink:0;
                ">#${idx + 2}</span>
                <img src="${b.thumbnailUrl}" style="width:40px;height:56px;object-fit:cover;border-radius:7px;flex-shrink:0;" />
                <div style="overflow:hidden;">
                  <div style="font-size:0.85rem;font-weight:700;color:var(--text-main);
                              white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:150px;">
                    ${b.name}
                  </div>
                  <div style="font-size:0.72rem;color:var(--text-muted);">${this._fmt(b.views)} lượt</div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;

    // ── Main chart list ───────────────────────────────────────────────────
    const listHtml = `
      <div class="section-header" style="margin-bottom:1.5rem;">
        <div style="width:4px;height:28px;background:linear-gradient(var(--color-primary),var(--color-secondary));border-radius:2px;flex-shrink:0;"></div>
        <h2 style="font-size:1.5rem;margin:0;">
          <i class="fa-solid fa-fire" style="color:#ff6b35;margin-right:6px;"></i>
          Bảng xếp hạng tuần
        </h2>
        <div style="margin-left:auto;font-size:0.82rem;color:var(--text-muted);">
          <i class="fa-regular fa-clock"></i> Cập nhật hàng tuần
        </div>
      </div>

      <div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem;" id="trending-list">
        ${this.books.map((book, i) => {
          const auth = this._getAuthor(book.id);
          const isTop3 = i < 3;
          const delay = Math.min(i * 50, 500);
          return `
            <div id="trend-row-${book.id}" style="
              display:flex;align-items:center;gap:1rem;
              padding:0.875rem 1rem;border-radius:14px;cursor:pointer;
              background:var(--bg-panel);border:1px solid var(--glass-border);
              animation:fadeInUp 0.45s ease ${delay}ms both;
              transition:background 0.2s,transform 0.2s,box-shadow 0.2s;
            ">
              <!-- Rank badge -->
              <div style="
                width:46px;height:46px;border-radius:12px;flex-shrink:0;
                background:${isTop3 ? this._medalBg(i) : 'var(--bg-main)'};
                display:flex;align-items:center;justify-content:center;
                font-size:${isTop3 ? '1.25rem' : '1rem'};font-weight:900;
                color:${isTop3 ? '#fff' : 'var(--text-muted)'};
              ">${i + 1}</div>

              <!-- Cover -->
              <img src="${book.thumbnailUrl}" alt=""
                style="width:44px;height:62px;object-fit:cover;border-radius:7px;flex-shrink:0;box-shadow:var(--shadow-md);" />

              <!-- Meta -->
              <div style="flex:1;overflow:hidden;">
                <div style="font-weight:700;font-size:0.88rem;
                             white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">
                  ${book.name}
                </div>
                <div style="font-size:0.75rem;color:var(--text-muted);margin-top:2px;
                             white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">
                  ${auth ? `${auth.firstName} ${auth.lastName}` : '–'}
                  ${book.country ? `· ${book.country}` : ''}
                </div>
              </div>

              <!-- Views -->
              <div style="text-align:right;flex-shrink:0;">
                <div style="font-weight:700;font-size:0.88rem;color:${isTop3 ? 'var(--color-primary)' : 'var(--text-main)'};">
                  ${this._fmt(book.views)}
                </div>
                <div style="font-size:0.68rem;color:var(--text-muted);">lượt nghe</div>
              </div>

              <!-- Play -->
              <button id="play-${book.id}" class="btn-icon"
                style="width:34px;height:34px;font-size:0.8rem;flex-shrink:0;">
                <i class="fa-solid fa-play"></i>
              </button>
            </div>
          `;
        }).join('')}
      </div>
    `;

    // ── Build trending authors ────────────────────────────────────────────
    const authorViews = {};
    this.books.forEach(b => {
      const rel = (this.authorsOfBooks||[]).find(r => r.BookId === b.id);
      if (rel) authorViews[rel.AuthorId] = (authorViews[rel.AuthorId]||0) + b.views;
    });
    const trendingAuthors = Object.entries(authorViews)
      .sort((a,b) => b[1]-a[1]).slice(0,6)
      .map(([aid, views]) => ({
        author: this.authors.find(a => a.id === parseInt(aid)),
        views
      })).filter(x => x.author);

    const authorHtml = trendingAuthors.length ? `
      <div style="margin-top:3rem;">
        <div style="display:flex;align-items:center;gap:0.875rem;margin-bottom:1.75rem;">
          <div style="width:4px;height:28px;background:linear-gradient(var(--color-primary),var(--color-secondary));border-radius:2px;"></div>
          <h2 style="font-size:1.35rem;margin:0;">✍️ Tác Giả Đang Nổi</h2>
        </div>
        <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:1.25rem;">
          ${trendingAuthors.map(({author: a, views}, i) => `
            <div style="
              background:var(--bg-panel);border:1px solid var(--glass-border);border-radius:20px;
              padding:1.5rem;display:flex;align-items:center;gap:1.25rem;
              transition:all 0.3s;cursor:pointer;position:relative;overflow:hidden;"
              onmouseover="this.style.transform='translateY(-4px)';this.style.boxShadow='var(--shadow-lg)'"
              onmouseout="this.style.transform='translateY(0)';this.style.boxShadow='none'"
              onclick="window.location.hash='#author-info?id=${a.id}'">
              <!-- Rank badge -->
              <div style="position:absolute;top:12px;right:14px;font-size:1.4rem;color:var(--text-muted);opacity:0.8;font-weight:800;">
                ${i===0?'🥇':i===1?'🥈':i===2?'🥉':'#'+(i+1)}
              </div>
              <div style="position:relative;flex-shrink:0;">
                <img src="${a.thumbnailUrl||`https://ui-avatars.com/api/?name=${a.firstName}+${a.lastName}&background=7c3aed&color=fff&size=80`}"
                  style="width:68px;height:68px;border-radius:50%;object-fit:cover;
                    border:3px solid ${i===0?'#ffd700':i===1?'#b0b8c1':i===2?'#cd873f':'var(--glass-border)'};" />
                <div style="position:absolute;bottom:-2px;right:-2px;
                  width:20px;height:20px;border-radius:50%;
                  background:${i===0?'#ffd700':i===1?'#b0b8c1':i===2?'#cd873f':'var(--bg-panel)'};
                  border:2px solid var(--bg-panel);
                  display:flex;align-items:center;justify-content:center;
                  font-size:0.55rem;font-weight:900;color:${i<3?'#000':'var(--text-muted)'};">
                  ${i+1}
                </div>
              </div>
              <div style="flex:1;overflow:hidden;">
                <div style="font-weight:700;font-size:0.95rem;margin-bottom:2px;">${a.firstName} ${a.lastName}</div>
                <div style="font-size:0.75rem;color:var(--color-primary);margin-bottom:4px;">
                  ${a.expertise || a.nationality || 'Tác giả'}
                </div>
                <div style="font-size:0.72rem;color:var(--text-muted);">
                  <i class="fa-solid fa-headphones" style="font-size:0.62rem;"></i>
                  ${this._fmt(views)} lượt nghe
                </div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    ` : '';

    // ── Build trending keywords (tag cloud) ──────────────────────────────
    const keywordFreq = {};
    const commonTopics = ['Tự truyện','Kinh dị','Trinh thám','Lãnh đạo','Kinh doanh','Tình yêu',
      'Lịch sử','Triết học','Tâm lý học','Khoa học','Phiêu lưu','Cổ điển','Phát triển bản thân',
      'Văn học','Kỹ năng sống','Thiếu nhi','Huyền bí','Chiến tranh','Gia đình','Xã hội'];

    this.books.forEach(b => {
      if (b.country) keywordFreq[b.country] = (keywordFreq[b.country]||0) + Math.floor(b.views / 3000);
      // Extract keywords from description
      commonTopics.forEach(kw => {
        if ((b.description||'').toLowerCase().includes(kw.toLowerCase()) ||
            (b.name||'').toLowerCase().includes(kw.toLowerCase())) {
          keywordFreq[kw] = (keywordFreq[kw]||0) + Math.floor(b.views / 5000);
        }
      });
    });

    const sortedKws = Object.entries(keywordFreq)
      .filter(([,v]) => v > 0)
      .sort((a,b) => b[1]-a[1])
      .slice(0, 20);

    const maxKwVal = sortedKws[0]?.[1] || 1;
    const kwColors = ['var(--color-primary)','var(--color-secondary)','#ff6b35','#ffd700','#10b981','#06b6d4','#8b5cf6','#ec4899'];

    const keywordsHtml = sortedKws.length ? `
      <div style="margin-top:3rem;">
        <div style="display:flex;align-items:center;gap:0.875rem;margin-bottom:1.75rem;">
          <div style="width:4px;height:28px;background:linear-gradient(var(--color-primary),#ff6b35);border-radius:2px;"></div>
          <h2 style="font-size:1.35rem;margin:0;">🔍 Từ Khóa Đang Trending</h2>
        </div>
        <div style="background:var(--bg-panel);border:1px solid var(--glass-border);border-radius:20px;padding:2rem;">
          <div style="display:flex;flex-wrap:wrap;gap:0.875rem;align-items:center;">
            ${sortedKws.map(([kw, val], i) => {
              const size = 0.78 + (val / maxKwVal) * 0.7;
              const weight = val / maxKwVal > 0.6 ? 800 : val / maxKwVal > 0.35 ? 700 : 600;
              const color = kwColors[i % kwColors.length];
              const opacity = 0.15 + (val / maxKwVal) * 0.2;
              const alphaHex = Math.round(opacity * 255).toString(16).padStart(2, '0');
              const bgColor = color.startsWith('#')
                ? `${color}${alphaHex}`
                : color === 'var(--color-primary)'
                  ? `rgba(124,58,237,${opacity})`
                  : `rgba(236,72,153,${opacity})`;
              return `
                <a href="#search?q=${encodeURIComponent(kw)}" style="text-decoration:none;" title="Tìm ${kw}">
                  <span style="
                    display:inline-flex;align-items:center;gap:5px;
                    background:${bgColor};
                    border:1px solid ${color};
                    border-radius:24px;padding:6px 14px;
                    font-size:${size}rem;font-weight:${weight};
                    color:${color};cursor:pointer;
                    transition:all 0.2s;
                    box-shadow:0 2px 8px rgba(0,0,0,0.2);"
                    onmouseover="this.style.transform='scale(1.08)';this.style.boxShadow='0 4px 16px rgba(0,0,0,0.3)'"
                    onmouseout="this.style.transform='scale(1)';this.style.boxShadow='0 2px 8px rgba(0,0,0,0.2)'">
                    ${val/maxKwVal > 0.7 ? '<i class="fa-solid fa-fire" style="font-size:0.7em;"></i>' :
                      val/maxKwVal > 0.4 ? '<i class="fa-solid fa-arrow-trend-up" style="font-size:0.65em;"></i>' : ''}
                    ${kw}
                    <span style="font-size:0.65em;opacity:0.6;">${this._fmt(val * 2800)}</span>
                  </span>
                </a>
              `;
            }).join('')}
          </div>
        </div>
      </div>
    ` : '';

    container.innerHTML = heroHtml + listHtml + authorHtml + keywordsHtml;

    // ── Attach events ────────────────────────────────────────────────────────
    // Hero play button → player
    document.getElementById('hero-play-btn')?.addEventListener('click', () => {
      window.location.hash = `#player?id=${top1.id}`;
    });
    document.getElementById('hero-detail-btn')?.addEventListener('click', () => {
      window.location.hash = `#book?id=${top1.id}`;
    });

    // Mini top 2 & 3
    [top2, top3].filter(Boolean).forEach(b => {
      document.getElementById(`mini-book-${b.id}`)?.addEventListener('click', () => {
        window.location.hash = `#book?id=${b.id}`;
      });
    });

    // Full list rows
    this.books.forEach(book => {
      const row = document.getElementById(`trend-row-${book.id}`);
      const playBtn = document.getElementById(`play-${book.id}`);

      row?.addEventListener('mouseenter', () => {
        row.style.background = 'var(--bg-main)';
        row.style.transform = 'translateX(4px)';
        row.style.boxShadow = 'var(--shadow-md)';
      });
      row?.addEventListener('mouseleave', () => {
        row.style.background = 'var(--bg-panel)';
        row.style.transform = 'translateX(0)';
        row.style.boxShadow = 'none';
      });
      row?.addEventListener('click', () => { window.location.hash = `#book?id=${book.id}`; });

      playBtn?.addEventListener('click', (e) => {
        e.stopPropagation();
        window.location.hash = `#player?id=${book.id}`;
      });
    });
  }

  afterRender() {
    this._reRender();
    this.fetchData();
  }

  render() {
    return `
      <div class="container" style="padding-top:2rem;padding-bottom:5rem;">
        <div id="trending-content">
          <div class="skeleton" style="height:340px;border-radius:24px;margin-bottom:2.5rem;"></div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:1.25rem;">
            ${Array(10).fill('<div class="skeleton" style="height:84px;border-radius:16px;"></div>').join('')}
          </div>
        </div>
      </div>
    `;
  }
}
