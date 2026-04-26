import { AuthService } from '../services/AuthService.js';
import { audioPlayer } from '../services/AudioPlayerService.js';
import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import '../explore.css';
import '../player.css';

let pdfjsLibPromise = null;

async function loadPdfJs() {
  if (!pdfjsLibPromise) {
    pdfjsLibPromise = import('pdfjs-dist').then((pdfjsLib) => {
      pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;
      return pdfjsLib;
    });
  }
  return pdfjsLibPromise;
}

/**
 * AudioPlayerPage — Full-screen immersive audio + PDF experience.
 * Route: #player?id=N  or  #player?id=N&mode=pdf
 */
export class AudioPlayerPage {
  constructor() {
    this.bookId = null;
    this.book = null;
    this.author = null;
    this.chapters = [];
    this.isLoading = true;
    this.currentChapter = 0;
    this.isPlaying = false;
    this.pdfMode = false;
    this.autoScroll = false;
    this.scrollSpeed = 1.5;
    this.scrollTimer = null;
    this.playbackRate = 1.0;
    this.pdfDoc = null;
    this.pdfRenderToken = 0;
    this.pdfObserver = null;
    this.pdfFullscreen = false;
    this.pdfPageCount = 0;
    this.pdfZoom = 1;
    this._handleKeydown = (e) => {
      if (e.key === 'Escape' && this.pdfFullscreen) this._setPdfFullscreen(false);
    };
    this._unsubs = [];
  }

  destroy() {
    this._unsubs.forEach(u => u?.());
    this._unsubs = [];
    clearInterval(this.scrollTimer);
    this.pdfRenderToken++;
    this.pdfObserver?.disconnect();
    this.pdfObserver = null;
    this.pdfDoc?.destroy?.();
    this.pdfDoc = null;
    document.getElementById('pdf-fullscreen-backdrop')?.remove();
    document.body.classList.remove('pdf-reader-lock');
    document.removeEventListener('keydown', this._handleKeydown);
  }

  async fetchData(bookId, mode) {
    this.bookId = parseInt(bookId);
    this.pdfMode = mode === 'pdf';

    try {
      const res = await fetch('/database.json?t=' + Date.now());
      const data = await res.json();

      this.book = data.books.find(b => b.id === this.bookId);
      if (!this.book) throw new Error('Not found');

      const user = AuthService.getUser();
      const isApproved = !this.book.approvalStatus || this.book.approvalStatus === 'APPROVED';
      const isOwner = user && user.roleId === 3 && this.book.authorId === user.authorId;
      const isAdmin = user && user.roleId === 1;

      if ((!isApproved || this.book.isHidden) && !isOwner && !isAdmin) {
        this.book = null;
        throw new Error('Access denied: Book is pending approval or hidden.');
      }

      const rel = (data.authorsOfBooks || []).find(r => r.BookId === this.bookId);
      this.author = rel ? (data.author || []).find(a => a.id === rel.AuthorId) : null;

      this.chapters = (data.audioChapter || [])
        .filter(c => c.bookId === this.bookId)
        .sort((a, b) => a.chapterNumber - b.chapterNumber);
    } catch (e) {
      console.error('PlayerPage fetch error:', e);
    }

    this.isLoading = false;
    this._reRender();
  }

  _fmt(s) {
    if (!s) return '0:00';
    const m = Math.floor(s / 60), sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, '0')}`;
  }

  _reRender() {
    const root = document.getElementById('player-root');
    if (!root) return;

    if (this.isLoading) {
      root.innerHTML = `<div class="skeleton" style="height:80vh;border-radius:24px;"></div>`;
      return;
    }

    if (!this.book) {
      root.innerHTML = `<div style="text-align:center;padding:5rem;color:var(--text-muted);">
        <p>Không tìm thấy sách.</p>
        <a href="#explore"><button class="btn btn-primary" style="margin-top:1rem;">Quay lại</button></a>
      </div>`;
      return;
    }

    const b = this.book;
    const user = AuthService.getUser();
    const plan = user?.subscriptionPlan || 'FREE';
    const isDemo = !AuthService.canListenFull();     // FREE hoặc khách
    const canSeek = AuthService.canSeek();           // chỉ PREMIUM
    const isBasic = plan === 'BASIC';
    const isPremium = plan === 'PREMIUM';
    const monthlyCount = AuthService.getMonthlyListenCount();
    const hasPdf = !!b.ebookFileUrl;

    root.innerHTML = `
      <!-- ── Top bar ── -->
      <div style="
        display:flex;align-items:center;gap:1rem;
        padding:1rem 1.5rem;
        background:var(--bg-panel-solid);
        border:1px solid var(--glass-border);
        border-radius:20px;
        margin-bottom:1.5rem;
      ">
        <!-- Back -->
        <a href="#book?id=${b.id}" style="text-decoration:none;">
          <button class="btn-icon" style="width:40px;height:40px;" title="Quay lại chi tiết sách">
            <i class="fa-solid fa-arrow-left"></i>
          </button>
        </a>

        <!-- Book info -->
        <img src="${b.thumbnailUrl}" style="width:48px;height:64px;object-fit:cover;border-radius:10px;flex-shrink:0;" />
        <div style="flex:1;overflow:hidden;">
          <div style="font-size:1rem;font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${b.name}</div>
          <div style="font-size:0.78rem;color:var(--text-muted);">${this.author ? this.author.firstName + ' ' + this.author.lastName : ''}</div>
        </div>

        <!-- View mode toggles -->
        <div style="display:flex;gap:0.5rem;background:var(--bg-main);border:1px solid var(--glass-border);border-radius:12px;padding:4px;">
          <button id="mode-audio" class="mode-btn ${!this.pdfMode ? 'active' : ''}" title="Chế độ âm thanh">
            <i class="fa-solid fa-headphones"></i> Âm thanh
          </button>
          ${hasPdf ? `
            <button id="mode-split" class="mode-btn ${this.pdfMode ? 'active' : ''}" title="Nghe + Đọc PDF">
              <i class="fa-solid fa-book-open-reader"></i> Nghe & Đọc
            </button>
          ` : ''}
        </div>

        ${isDemo ? `
          <div style="display:flex;align-items:center;gap:0.5rem;background:rgba(255,107,53,0.1);border:1px solid rgba(255,107,53,0.3);padding:6px 14px;border-radius:12px;flex-shrink:0;">
            <i class="fa-solid fa-clock" style="color:#ff6b35;font-size:0.8rem;"></i>
            <span style="font-size:0.78rem;color:#ff6b35;font-weight:600;">Demo 30s</span>
          </div>
        ` : isBasic ? `
          <div style="display:flex;align-items:center;gap:0.5rem;background:rgba(46,213,115,0.1);border:1px solid rgba(46,213,115,0.3);padding:6px 14px;border-radius:12px;flex-shrink:0;">
            <i class="fa-solid fa-star" style="color:#2ed573;font-size:0.8rem;"></i>
            <span style="font-size:0.78rem;color:#2ed573;font-weight:600;">Cơ bản · ${monthlyCount}/10 sách tháng này</span>
          </div>
        ` : `
          <div style="display:flex;align-items:center;gap:0.5rem;background:rgba(255,215,0,0.1);border:1px solid rgba(255,215,0,0.3);padding:6px 14px;border-radius:12px;flex-shrink:0;">
            <i class="fa-solid fa-crown" style="color:#ffd700;font-size:0.8rem;"></i>
            <span style="font-size:0.78rem;color:#ffd700;font-weight:600;">Premium · Không giới hạn</span>
          </div>
        `}
      </div>

      <!-- ── Main layout ── -->
      <div id="player-main-layout" class="${hasPdf && this.pdfMode ? 'player-wide-shell' : ''}" style="display:grid;grid-template-columns:${hasPdf && this.pdfMode ? 'minmax(0,1fr) 360px' : '1fr'};gap:1.25rem;align-items:start;">

        <!-- PDF Viewer (left, shown in split mode) -->
        ${hasPdf && this.pdfMode ? `
          <div id="pdf-reader-panel" class="pdf-reader-panel ${this.pdfFullscreen ? 'is-fullscreen' : ''}">
            <div class="pdf-toolbar">
              <div class="pdf-title">
                <i class="fa-regular fa-file-pdf" style="color:#e74c3c;"></i>
                <span>${b.name}</span>
                <small id="pdf-page-count" style="color:var(--text-muted);font-weight:700;"></small>
              </div>
              <div class="pdf-toolbar-actions">
                <button id="auto-scroll-btn" class="pdf-pill-button ${this.autoScroll ? 'active' : ''}" title="Tự động cuộn" type="button">
                  <i class="fa-solid fa-scroll"></i> Tự cuộn
                </button>
                <div class="pdf-speed-control">
                  <span>Tốc độ cuộn</span>
                  <input type="range" id="scroll-speed" min="0.5" max="5" step="0.5" value="${this.scrollSpeed}" />
                  <strong id="scroll-speed-val">${this.scrollSpeed}x</strong>
                </div>
                <div class="pdf-zoom-control" title="Thu phóng PDF">
                  <button id="pdf-zoom-out" type="button" aria-label="Thu nhỏ PDF">
                    <i class="fa-solid fa-minus"></i>
                  </button>
                  <input type="range" id="pdf-zoom-range" min="0.6" max="1.8" step="0.1" value="${this.pdfZoom}" />
                  <button id="pdf-zoom-in" type="button" aria-label="Phóng to PDF">
                    <i class="fa-solid fa-plus"></i>
                  </button>
                  <strong id="pdf-zoom-val">${Math.round(this.pdfZoom * 100)}%</strong>
                </div>
                <button id="pdf-fullscreen-btn" class="pdf-pill-button" title="Chế độ toàn màn hình" type="button">
                  <i class="fa-solid ${this.pdfFullscreen ? 'fa-compress' : 'fa-expand'}"></i>
                  <span id="pdf-fullscreen-label">${this.pdfFullscreen ? 'Thu nhỏ' : 'Toàn màn hình'}</span>
                </button>
                <a href="${b.ebookFileUrl}" target="_blank" rel="noopener" style="display:inline-flex;">
                  <button class="pdf-pill-button" title="Mở file PDF gốc" type="button">
                    <i class="fa-solid fa-arrow-up-right-from-square"></i>
                  </button>
                </a>
              </div>
            </div>
            <div id="pdf-scroll-wrapper" class="pdf-scroll-wrapper">
              <div id="pdf-pages" class="pdf-pages">
                <div class="pdf-loading">
                  <i class="fa-solid fa-spinner fa-spin"></i>
                  <span>Đang tải sách...</span>
                </div>
              </div>
            </div>
          </div>
        ` : ''}

        <!-- Audio panel (right in split, center in audio-only) -->
        <div style="
          background:var(--bg-panel-solid);
          border:1px solid var(--glass-border);
          border-radius:20px;
          overflow:hidden;
          display:flex;flex-direction:column;
          ${!this.pdfMode ? 'max-width:560px;margin:0 auto;width:100%;' : ''}
        ">
          <!-- Cover art + waveform -->
          <div style="position:relative;padding:2rem 2rem 1rem;background:linear-gradient(180deg,rgba(124,58,237,0.12) 0%,transparent 100%);">
            <div style="display:flex;align-items:center;gap:1.5rem;">
              <div style="position:relative;flex-shrink:0;">
                <img src="${b.thumbnailUrl}" id="player-cover"
                  style="width:100px;height:140px;object-fit:cover;border-radius:14px;
                         box-shadow:0 16px 32px rgba(0,0,0,0.4);
                         transition:transform 0.3s;${this.isPlaying ? '' : 'filter:brightness(0.85);'}" />
              </div>
              <div style="flex:1;overflow:hidden;">
                <h2 id="player-book-name" style="font-size:1.1rem;font-weight:700;margin-bottom:0.25rem;line-height:1.3;">
                  ${b.name}
                </h2>
                <p style="color:var(--color-primary);font-size:0.82rem;margin-bottom:0.75rem;">
                  ${this.author ? this.author.firstName + ' ' + this.author.lastName : ''}
                </p>
                <!-- Chapter indicator -->
                <p id="chapter-label" style="font-size:0.78rem;color:var(--text-muted);display:flex;align-items:center;gap:0.375rem;">
                  <i class="fa-solid fa-list-ol" style="font-size:0.65rem;"></i>
                  <span id="chapter-label-text">
                    ${this.chapters.length > 0
                      ? (this.chapters.length > 1 ? `Chương 1/${this.chapters.length}: ` : '') + (this.chapters[0]?.name || 'Chương 1')
                      : 'Chương 1'}
                  </span>
                </p>
                <!-- Waveform -->
                <div id="player-waveform" style="display:flex;align-items:center;gap:3px;height:36px;margin-top:0.75rem;">
                  ${Array(20).fill('<div class="waveform-bar paused"></div>').join('')}
                </div>
              </div>
            </div>
          </div>

          <!-- Progress -->
          <div style="padding:0.75rem 2rem;">
            <div style="display:flex;align-items:center;gap:0.875rem;">
              <span id="p-current" style="font-size:0.75rem;color:var(--text-muted);min-width:36px;">0:00</span>
              <div style="flex:1;position:relative;">
                <input type="range" id="p-range" value="0" min="0" max="100" step="0.1"
                  style="width:100%;" ${!canSeek ? 'disabled' : ''}
                  title="${!canSeek && !isDemo ? 'Gói Premium mới được tua' : ''}" />
                <!-- Chapter bookmark markers -->
                ${this.chapters.length > 1 ? `
                <div id="chapter-markers" style="position:absolute;top:0;left:0;right:0;height:100%;pointer-events:none;">
                  ${(() => {
                    const total = this.chapters.reduce((s, c) => s + (c.duration || 0), 0);
                    if (total <= 0) return '';
                    let acc = 0;
                    return this.chapters.slice(0, -1).map(ch => {
                      acc += ch.duration || 0;
                      const pct = (acc / total) * 100;
                      return `<div style="position:absolute;top:50%;left:${pct}%;transform:translate(-50%,-50%);
                        width:3px;height:10px;border-radius:2px;
                        background:rgba(255,255,255,0.35);pointer-events:none;"></div>`;
                    }).join('');
                  })()}
                </div>` : ''}
              </div>
              <span id="p-duration" style="font-size:0.75rem;color:var(--text-muted);min-width:36px;">0:00</span>
            </div>
          </div>

          <!-- Controls -->
          <div style="padding:0.5rem 2rem 1.25rem;">
            <!-- Main controls row -->
            <div style="display:flex;align-items:center;justify-content:center;gap:1.25rem;margin-bottom:1.25rem;">
              <button id="pc-prev" class="btn-icon" style="width:42px;height:42px;" title="Chương trước">
                <i class="fa-solid fa-backward-step"></i>
              </button>
              <button id="pc-rewind" class="btn-icon" style="width:38px;height:38px;font-size:0.85rem;${!canSeek ? 'opacity:0.4;' : ''}" title="${canSeek ? 'Tua lại 10s' : 'Cần gói Premium'}">
                <i class="fa-solid fa-rotate-left"></i><sup style="font-size:0.55rem;position:relative;top:2px;">10</sup>
              </button>
              <button id="pc-play" style="
                width:64px;height:64px;border-radius:50%;border:none;cursor:pointer;
                background:linear-gradient(135deg,var(--color-primary),var(--color-secondary));
                color:#fff;font-size:1.4rem;
                box-shadow:0 8px 24px hsla(260,80%,60%,0.45);
                display:flex;align-items:center;justify-content:center;
                transition:all 0.2s cubic-bezier(0.34,1.56,0.64,1);">
                <i class="fa-solid fa-play"></i>
              </button>
              <button id="pc-forward" class="btn-icon" style="width:38px;height:38px;font-size:0.85rem;${!canSeek ? 'opacity:0.4;' : ''}" title="${canSeek ? 'Tua tới 10s' : 'Cần gói Premium'}">
                <sup style="font-size:0.55rem;position:relative;top:2px;">10</sup><i class="fa-solid fa-rotate-right"></i>
              </button>
              <button id="pc-next" class="btn-icon" style="width:42px;height:42px;" title="Chương tiếp">
                <i class="fa-solid fa-forward-step"></i>
              </button>
            </div>

            <!-- Secondary controls row: speed, volume -->
            <div style="display:flex;align-items:center;gap:1.25rem;">
              <!-- Playback speed -->
              <div style="display:flex;align-items:center;gap:0.5rem;">
                <i class="fa-solid fa-gauge" style="color:var(--text-muted);font-size:0.82rem;"></i>
                <select id="speed-select" style="
                  background:var(--bg-main);border:1px solid var(--glass-border);
                  border-radius:8px;padding:4px 8px;font-size:0.78rem;color:var(--text-main);
                  font-family:'Outfit',sans-serif;cursor:pointer;outline:none;">
                  <option value="0.5">0.5×</option>
                  <option value="0.75">0.75×</option>
                  <option value="1" selected>1×</option>
                  <option value="1.25">1.25×</option>
                  <option value="1.5">1.5×</option>
                  <option value="2">2×</option>
                </select>
              </div>

              <!-- Volume -->
              <div style="display:flex;align-items:center;gap:0.5rem;flex:1;">
                <i class="fa-solid fa-volume-low" style="color:var(--text-muted);font-size:0.8rem;flex-shrink:0;"></i>
                <input type="range" id="p-volume" value="80" min="0" max="100" style="flex:1;" />
                <i class="fa-solid fa-volume-high" style="color:var(--text-muted);font-size:0.8rem;flex-shrink:0;"></i>
              </div>
            </div>

            ${isDemo ? `
              <div style="margin-top:1rem;background:rgba(255,107,53,0.1);border:1px solid rgba(255,107,53,0.25);
                border-radius:12px;padding:0.875rem;text-align:center;">
                <div style="display:flex;align-items:center;justify-content:center;gap:0.5rem;margin-bottom:0.5rem;">
                  <svg style="width:48px;height:48px;" viewBox="0 0 64 64">
                    <circle fill="none" stroke="rgba(255,107,53,0.2)" stroke-width="4" cx="32" cy="32" r="28"></circle>
                    <circle id="demo-ring" fill="none" stroke="#ff6b35" stroke-width="4" cx="32" cy="32" r="28"
                      stroke-dasharray="175.9" stroke-dashoffset="0" stroke-linecap="round"
                      transform="rotate(-90 32 32)"></circle>
                  </svg>
                  <span id="demo-secs" style="font-size:1.75rem;font-weight:800;color:#ff6b35;">30</span>
                </div>
                <p style="font-size:0.78rem;color:#ff6b35;font-weight:600;">Bản demo 30 giây — Đăng nhập và nâng cấp để nghe full</p>
                <div style="display:flex;gap:0.5rem;justify-content:center;margin-top:0.5rem;flex-wrap:wrap;">
                  ${!user ? `<a href="#login"><button class="btn" style="background:rgba(255,107,53,0.2);border:1px solid rgba(255,107,53,0.4);color:#ff6b35;font-size:0.8rem;padding:5px 16px;">
                    <i class="fa-solid fa-right-to-bracket"></i> Đăng nhập
                  </button></a>` : ''}
                  <a href="#user"><button class="btn" style="background:rgba(255,107,53,0.2);border:1px solid rgba(255,107,53,0.4);color:#ff6b35;font-size:0.8rem;padding:5px 16px;">
                    <i class="fa-solid fa-crown"></i> Nâng cấp gói
                  </button></a>
                </div>
              </div>
            ` : isBasic ? `
              <div style="margin-top:1rem;background:rgba(46,213,115,0.07);border:1px solid rgba(46,213,115,0.2);
                border-radius:12px;padding:0.875rem;">
                <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:0.75rem;">
                  <div>
                    <p style="font-size:0.82rem;font-weight:700;color:#2ed573;margin-bottom:0.2rem;">
                      <i class="fa-solid fa-star"></i> Gói Cơ bản
                    </p>
                    <p style="font-size:0.75rem;color:var(--text-muted);">Đã nghe <strong style="color:var(--text-main);">${monthlyCount}/10 sách</strong> tháng này · Tua &amp; chọn chương cần gói Premium</p>
                  </div>
                  <a href="#user"><button class="btn" style="background:linear-gradient(135deg,#ffd700,#ff8c00);color:#000;font-size:0.78rem;padding:5px 14px;font-weight:700;">
                    <i class="fa-solid fa-crown"></i> Lên Premium
                  </button></a>
                </div>
              </div>
            ` : ''}
          </div>

          <!-- Chapter list -->
          <div style="border-top:1px solid var(--glass-border);padding:1.25rem 2rem;overflow-y:auto;max-height:300px;">
            <div style="font-size:0.78rem;color:var(--text-muted);font-weight:700;text-transform:uppercase;letter-spacing:1px;margin-bottom:0.875rem;">
              Danh sách chương (${this.chapters.length})
            </div>
            ${this.chapters.length === 0 ? `
              <p style="font-size:0.85rem;color:var(--text-muted);text-align:center;padding:1rem 0;">Chưa có dữ liệu chương.</p>
            ` : this.chapters.map((ch, i) => {
              const locked = !canSeek && i > 0;
              const isActive = i === this.currentChapter;
              return `
              <div id="ch-${i}" data-chapidx="${i}" class="chapter-item" style="
                display:flex;align-items:center;gap:0.875rem;padding:0.6rem 0.75rem;
                border-radius:10px;cursor:${locked ? 'not-allowed' : 'pointer'};transition:background 0.2s;
                ${isActive ? 'background:hsla(260,80%,60%,0.12);' : ''}
                ${locked ? 'opacity:0.5;' : ''}">
                <div style="width:28px;height:28px;border-radius:8px;flex-shrink:0;font-size:0.72rem;font-weight:700;
                  display:flex;align-items:center;justify-content:center;
                  background:${isActive ? 'var(--color-primary)' : 'var(--bg-main)'};
                  color:${isActive ? '#fff' : 'var(--text-muted)'};"
                >
                  ${isActive ? '<i class="fa-solid fa-volume-high" style="font-size:0.6rem;"></i>' : (i + 1)}
                </div>
                <div style="flex:1;overflow:hidden;">
                  <div style="font-size:0.82rem;font-weight:${isActive ? '700' : '600'};white-space:nowrap;overflow:hidden;text-overflow:ellipsis;color:${isActive ? 'var(--text-main)' : 'inherit'}">${ch.name}</div>
                  <div style="font-size:0.7rem;color:var(--text-muted);">${ch.duration ? this._fmt(ch.duration) : ''}</div>
                </div>
                ${isActive ? '<i class="fa-solid fa-headphones" style="color:var(--color-primary);font-size:0.72rem;flex-shrink:0;"></i>' : ''}
                ${locked && !isActive ? '<i class="fa-solid fa-lock" style="color:var(--text-muted);font-size:0.72rem;flex-shrink:0;"></i>' : ''}
              </div>
            `}).join('')}
          </div>
        </div>
      </div>

      <!-- Inline styles for mode buttons -->
      <style>
        .mode-btn {
          padding: 6px 14px; border: none; border-radius: 8px; cursor: pointer;
          font-family: 'Outfit', sans-serif; font-size: 0.78rem; font-weight: 600;
          background: transparent; color: var(--text-muted);
          display: flex; align-items: center; gap: 5px;
          transition: all 0.2s;
        }
        .mode-btn.active {
          background: var(--color-primary); color: #fff;
          box-shadow: 0 4px 12px hsla(260,80%,60%,0.3);
        }
        .mode-btn:hover:not(.active) { background: var(--bg-panel); color: var(--text-main); }
      </style>
    `;

    this._attachEvents();
    this._subscribeAudio();
    if (hasPdf && this.pdfMode) {
      this._renderPdfPages();
    }

    // Auto-start audio
    if (this.chapters.length > 0) {
      audioPlayer.play(this.book, this.chapters);
    }
  }

  _attachEvents() {
    // Mode switches
    document.getElementById('mode-audio')?.addEventListener('click', () => {
      this.pdfMode = false;
      this.pdfFullscreen = false;
      this.autoScroll = false;
      clearInterval(this.scrollTimer);
      document.body.classList.remove('pdf-reader-lock');
      this._reRender();
    });
    document.getElementById('mode-split')?.addEventListener('click', () => {
      this.pdfMode = true;
      this._reRender();
    });
    document.getElementById('pdf-fullscreen-btn')?.addEventListener('click', () => {
      this._setPdfFullscreen(!this.pdfFullscreen);
    });
    document.removeEventListener('keydown', this._handleKeydown);
    document.addEventListener('keydown', this._handleKeydown);

    // Play / controls
    document.getElementById('pc-play')?.addEventListener('click', () => audioPlayer.toggle());
    document.getElementById('pc-prev')?.addEventListener('click', () => audioPlayer.prevChapter());
    document.getElementById('pc-next')?.addEventListener('click', () => audioPlayer.nextChapter());
    document.getElementById('pc-rewind')?.addEventListener('click', () =>
      audioPlayer.seek(Math.max(0, audioPlayer.currentTime - 10)));
    document.getElementById('pc-forward')?.addEventListener('click', () =>
      audioPlayer.seek(Math.min(audioPlayer.duration, audioPlayer.currentTime + 10)));

    // Progress seek
    document.getElementById('p-range')?.addEventListener('input', (e) =>
      audioPlayer.seekPercent(e.target.value / 100));

    // Volume
    const vol = document.getElementById('p-volume');
    if (vol) {
      vol.addEventListener('input', (e) => { audioPlayer.audio.volume = e.target.value / 100; });
      audioPlayer.audio.volume = 0.8;
    }

    // Playback speed
    document.getElementById('speed-select')?.addEventListener('change', (e) => {
      this.playbackRate = parseFloat(e.target.value);
      audioPlayer.audio.playbackRate = this.playbackRate;
    });

    // Chapter list
    document.querySelectorAll('.chapter-item').forEach(item => {
      item.addEventListener('click', () => {
        const idx = parseInt(item.dataset.chapidx);
        audioPlayer.setChapter(idx);
      });
    });

    // Auto scroll
    document.getElementById('auto-scroll-btn')?.addEventListener('click', () => {
      this.autoScroll = !this.autoScroll;
      const btn = document.getElementById('auto-scroll-btn');
      btn?.classList.toggle('active', this.autoScroll);
      this._restartAutoScroll();
    });

    // Scroll speed
    document.getElementById('scroll-speed')?.addEventListener('input', (e) => {
      this.scrollSpeed = parseFloat(e.target.value);
      const el = document.getElementById('scroll-speed-val');
      if (el) el.textContent = this.scrollSpeed + 'x';
      if (this.autoScroll) this._restartAutoScroll();
    });

    const setPdfZoom = (value) => {
      const next = Math.min(1.8, Math.max(0.6, Math.round(value * 10) / 10));
      if (next === this.pdfZoom) return;
      this.pdfZoom = next;
      const range = document.getElementById('pdf-zoom-range');
      const label = document.getElementById('pdf-zoom-val');
      if (range) range.value = String(this.pdfZoom);
      if (label) label.textContent = `${Math.round(this.pdfZoom * 100)}%`;
      this._renderPdfPages(true);
    };

    document.getElementById('pdf-zoom-range')?.addEventListener('input', (e) => {
      setPdfZoom(parseFloat(e.target.value));
    });
    document.getElementById('pdf-zoom-out')?.addEventListener('click', () => {
      setPdfZoom(this.pdfZoom - 0.1);
    });
    document.getElementById('pdf-zoom-in')?.addEventListener('click', () => {
      setPdfZoom(this.pdfZoom + 0.1);
    });
  }

  _restartAutoScroll() {
    clearInterval(this.scrollTimer);
    if (!this.autoScroll) return;

    this.scrollTimer = setInterval(() => {
      const wrapper = document.getElementById('pdf-scroll-wrapper');
      if (!wrapper) return;
      const maxScroll = Math.max(0, wrapper.scrollHeight - wrapper.clientHeight);
      if (wrapper.scrollTop < maxScroll) {
        wrapper.scrollTop += this.scrollSpeed;
      }
    }, 50);
  }

  _setPdfFullscreen(value) {
    if (this.pdfFullscreen === value) return;
    this.pdfFullscreen = value;
    this._syncPdfFullscreen();
    this._renderPdfPages(true);
  }

  _syncPdfFullscreen() {
    const panel = document.getElementById('pdf-reader-panel');
    const btn = document.getElementById('pdf-fullscreen-btn');
    const label = document.getElementById('pdf-fullscreen-label');

    panel?.classList.toggle('is-fullscreen', this.pdfFullscreen);
    document.body.classList.toggle('pdf-reader-lock', this.pdfFullscreen);

    let backdrop = document.getElementById('pdf-fullscreen-backdrop');
    if (this.pdfFullscreen && !backdrop) {
      backdrop = document.createElement('div');
      backdrop.id = 'pdf-fullscreen-backdrop';
      backdrop.className = 'pdf-fullscreen-backdrop';
      backdrop.addEventListener('click', () => this._setPdfFullscreen(false));
      document.body.appendChild(backdrop);
    } else if (!this.pdfFullscreen && backdrop) {
      backdrop.remove();
    }

    if (btn) {
      btn.innerHTML = `
        <i class="fa-solid ${this.pdfFullscreen ? 'fa-compress' : 'fa-expand'}"></i>
        <span id="pdf-fullscreen-label">${this.pdfFullscreen ? 'Thu nhỏ' : 'Toàn màn hình'}</span>
      `;
    }
    if (label) label.textContent = this.pdfFullscreen ? 'Thu nhỏ' : 'Toàn màn hình';
  }

  _updatePdfPageCount() {
    const el = document.getElementById('pdf-page-count');
    if (el) el.textContent = this.pdfPageCount ? `/${this.pdfPageCount} trang` : '';
  }

  async _renderPdfPages(preservePosition = false) {
    const wrapper = document.getElementById('pdf-scroll-wrapper');
    const pagesEl = document.getElementById('pdf-pages');
    if (!wrapper || !pagesEl || !this.book?.ebookFileUrl) return;

    const previousRatio = preservePosition && wrapper.scrollHeight > wrapper.clientHeight
      ? wrapper.scrollTop / (wrapper.scrollHeight - wrapper.clientHeight)
      : 0;
    const previousXRatio = preservePosition && wrapper.scrollWidth > wrapper.clientWidth
      ? wrapper.scrollLeft / (wrapper.scrollWidth - wrapper.clientWidth)
      : 0;
    const token = ++this.pdfRenderToken;

    this.pdfObserver?.disconnect();
    this.pdfObserver = null;

    pagesEl.innerHTML = `
      <div class="pdf-loading">
        <i class="fa-solid fa-spinner fa-spin"></i>
        <span>Đang tải sách...</span>
      </div>
    `;

    try {
      if (!this.pdfDoc) {
        const pdfjsLib = await loadPdfJs();
        const loadingTask = pdfjsLib.getDocument({ url: this.book.ebookFileUrl });
        this.pdfDoc = await loadingTask.promise;
      }
      if (token !== this.pdfRenderToken) return;

      this.pdfPageCount = this.pdfDoc.numPages;
      this._updatePdfPageCount();

      const firstPage = await this.pdfDoc.getPage(1);
      if (token !== this.pdfRenderToken) return;

      const baseViewport = firstPage.getViewport({ scale: 1 });
      const maxFitWidth = this.pdfFullscreen ? 1060 : 1040;
      const fitWidth = Math.floor(Math.min(maxFitWidth, Math.max(320, wrapper.clientWidth - 42)));
      const pageWidth = Math.floor(fitWidth * this.pdfZoom);
      const defaultHeight = Math.floor(baseViewport.height * (pageWidth / baseViewport.width));

      pagesEl.innerHTML = '';

      const pageEls = [];
      for (let pageNum = 1; pageNum <= this.pdfPageCount; pageNum++) {
        const pageEl = document.createElement('section');
        pageEl.className = 'pdf-page';
        pageEl.dataset.pageNumber = String(pageNum);
        pageEl.style.width = `${pageWidth}px`;
        pageEl.style.height = `${defaultHeight}px`;
        pageEl.innerHTML = `<span class="pdf-page-number">${pageNum}</span>`;
        pagesEl.appendChild(pageEl);
        pageEls.push(pageEl);
      }

      this.pdfObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) return;
          const pageEl = entry.target;
          const pageNum = parseInt(pageEl.dataset.pageNumber);
          this._renderVisiblePdfPage(pageEl, pageNum, pageWidth, token);
          this.pdfObserver?.unobserve(pageEl);
        });
      }, { root: wrapper, rootMargin: '1200px 0px', threshold: 0.01 });

      pageEls.forEach(pageEl => this.pdfObserver.observe(pageEl));
      await this._renderVisiblePdfPage(pageEls[0], 1, pageWidth, token);

      requestAnimationFrame(() => {
        if (preservePosition) {
          wrapper.scrollTop = previousRatio * Math.max(0, wrapper.scrollHeight - wrapper.clientHeight);
          wrapper.scrollLeft = previousXRatio * Math.max(0, wrapper.scrollWidth - wrapper.clientWidth);
        }
        if (this.autoScroll) this._restartAutoScroll();
      });
    } catch (e) {
      console.error('PDF render error:', e);
      pagesEl.innerHTML = `
        <div class="pdf-error">
          <i class="fa-solid fa-triangle-exclamation"></i>
          <strong>Không thể hiển thị PDF trong trình đọc.</strong>
          <span>Hãy thử mở file gốc trong tab mới.</span>
          <a href="${this.book.ebookFileUrl}" target="_blank" rel="noopener" class="btn btn-primary">
            <i class="fa-solid fa-arrow-up-right-from-square"></i> Mở PDF
          </a>
        </div>
      `;
    }
  }

  async _renderVisiblePdfPage(pageEl, pageNum, pageWidth, token) {
    if (!this.pdfDoc || !pageEl || pageEl.dataset.rendered || pageEl.dataset.rendering) return;

    pageEl.dataset.rendering = 'true';
    try {
      const page = await this.pdfDoc.getPage(pageNum);
      if (token !== this.pdfRenderToken) return;

      const baseViewport = page.getViewport({ scale: 1 });
      const viewport = page.getViewport({ scale: pageWidth / baseViewport.width });
      const outputScale = Math.min(window.devicePixelRatio || 1, 1.5);

      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      canvas.width = Math.floor(viewport.width * outputScale);
      canvas.height = Math.floor(viewport.height * outputScale);
      canvas.style.width = `${Math.floor(viewport.width)}px`;
      canvas.style.height = `${Math.floor(viewport.height)}px`;

      context.setTransform(outputScale, 0, 0, outputScale, 0, 0);
      await page.render({ canvasContext: context, viewport }).promise;
      if (token !== this.pdfRenderToken) return;

      pageEl.style.width = `${Math.floor(viewport.width)}px`;
      pageEl.style.height = `${Math.floor(viewport.height)}px`;
      pageEl.innerHTML = '';
      pageEl.appendChild(canvas);

      const badge = document.createElement('span');
      badge.className = 'pdf-page-number';
      badge.textContent = pageNum;
      pageEl.appendChild(badge);
      pageEl.dataset.rendered = 'true';
    } catch (e) {
      console.error(`PDF page ${pageNum} render error:`, e);
      pageEl.innerHTML = `<span class="pdf-page-number">${pageNum}</span>`;
    } finally {
      delete pageEl.dataset.rendering;
    }
  }

  _subscribeAudio() {
    this._unsubs.forEach(u => u?.());
    this._unsubs = [];

    const playBtn = () => document.getElementById('pc-play');
    const waves = () => document.querySelectorAll('#player-waveform .waveform-bar');
    const cover = () => document.getElementById('player-cover');

    this._unsubs = [
      audioPlayer.on('play', () => {
        const btn = playBtn();
        if (btn) btn.innerHTML = '<i class="fa-solid fa-pause"></i>';
        waves().forEach(b => b.classList.remove('paused'));
        const c = cover();
        if (c) { c.style.filter = 'brightness(1)'; c.style.transform = 'scale(1.02)'; }
        this.isPlaying = true;
      }),
      audioPlayer.on('pause', () => {
        const btn = playBtn();
        if (btn) btn.innerHTML = '<i class="fa-solid fa-play"></i>';
        waves().forEach(b => b.classList.add('paused'));
        const c = cover();
        if (c) { c.style.filter = 'brightness(0.85)'; c.style.transform = 'scale(1)'; }
        this.isPlaying = false;
      }),
      audioPlayer.on('timeupdate', ({ current, duration, pct }) => {
        const cur = document.getElementById('p-current');
        const dur = document.getElementById('p-duration');
        const range = document.getElementById('p-range');
        if (cur) cur.textContent = this._fmt(current);
        if (dur) dur.textContent = this._fmt(duration);
        if (range && !range.matches(':active')) {
          range.value = pct * 100;
          range.style.background = `linear-gradient(to right, var(--color-primary) ${pct*100}%, var(--glass-border) ${pct*100}%)`;
        }
      }),
      audioPlayer.on('demotick', (s) => {
        const el = document.getElementById('demo-secs');
        if (el) el.textContent = s;
        const ring = document.getElementById('demo-ring');
        if (ring) ring.style.strokeDashoffset = 175.9 * (1 - s / 30);
      }),
      audioPlayer.on('demoended', () => {
        const btn = playBtn();
        if (btn) btn.innerHTML = '<i class="fa-solid fa-play"></i>';
        waves().forEach(b => b.classList.add('paused'));
      }),
      audioPlayer.on('planlimit', ({ count, limit }) => {
        this._showPlanToast(
          `<i class="fa-solid fa-ban"></i> Bạn đã nghe <strong>${count}/${limit}</strong> sách tháng này. Nâng cấp Premium để nghe không giới hạn.`,
          '#ff4757', true
        );
      }),
      audioPlayer.on('planblock', ({ reason }) => {
        const msg = reason === 'seek'
          ? '<i class="fa-solid fa-lock"></i> Tua audio cần gói <strong>Premium</strong>.'
          : '<i class="fa-solid fa-lock"></i> Chọn chương cần gói <strong>Premium</strong>.';
        this._showPlanToast(msg, '#ffd700', false);
      }),
      audioPlayer.on('chapterchange', (idx) => {
        this.currentChapter = idx;
        const total = audioPlayer.currentChapters.length;
        const chapName = audioPlayer.currentChapters[idx]?.name || '';

        // Cập nhật label
        const labelText = document.getElementById('chapter-label-text');
        if (labelText) {
          labelText.textContent = (total > 1 ? `Chương ${idx + 1}/${total}: ` : '') + chapName;
        }

        // Cập nhật chapter list highlight
        document.querySelectorAll('.chapter-item').forEach((el, i) => {
          const isActive = i === idx;
          el.style.background = isActive ? 'hsla(260,80%,60%,0.12)' : 'transparent';
          const numEl = el.querySelector('div:first-child');
          if (numEl) {
            numEl.style.background = isActive ? 'var(--color-primary)' : 'var(--bg-main)';
            numEl.style.color = isActive ? '#fff' : 'var(--text-muted)';
            numEl.innerHTML = isActive ? '<i class="fa-solid fa-volume-high" style="font-size:0.6rem;"></i>' : String(i + 1);
          }
          // Icon headphone
          const icons = el.querySelectorAll('i.fa-headphones, i.fa-lock');
          icons.forEach(ic => { if (ic.classList.contains('fa-headphones')) ic.style.display = isActive ? '' : 'none'; });
        });

        // Scroll chapter vào view
        const activeEl = document.getElementById('ch-' + idx);
        activeEl?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }),
      audioPlayer.on('chaptername', (name) => {
        const labelText = document.getElementById('chapter-label-text');
        if (labelText && name) {
          const idx = audioPlayer.currentChapterIdx;
          const total = audioPlayer.currentChapters.length;
          labelText.textContent = (total > 1 ? `Chương ${idx + 1}/${total}: ` : '') + name;
        }
      }),
    ];
  }

  /** Hiển thị toast thông báo giới hạn gói */
  _showPlanToast(html, color = '#ffd700', withUpgradeBtn = false) {
    const existing = document.getElementById('plan-toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.id = 'plan-toast';
    toast.style.cssText = `
      position:fixed;bottom:110px;left:50%;transform:translateX(-50%);
      z-index:9999;background:var(--bg-panel-solid);
      border:1px solid ${color}55;border-radius:14px;
      padding:0.85rem 1.25rem;
      box-shadow:0 8px 32px rgba(0,0,0,0.4);
      display:flex;align-items:center;gap:1rem;
      max-width:420px;width:90%;
      animation:pmSlideIn 0.3s ease;
      font-size:0.85rem;
    `;
    toast.innerHTML = `
      <span style="color:${color};flex:1;">${html}</span>
      ${withUpgradeBtn ? `<a href="#user" style="flex-shrink:0;">
        <button style="background:linear-gradient(135deg,#ffd700,#ff8c00);color:#000;border:none;border-radius:8px;padding:5px 12px;font-weight:700;cursor:pointer;font-size:0.78rem;">
          Nâng cấp
        </button>
      </a>` : ''}
      <button onclick="this.closest('#plan-toast').remove()" style="background:none;border:none;cursor:pointer;color:var(--text-muted);font-size:1rem;flex-shrink:0;">✕</button>
    `;
    document.body.appendChild(toast);
    setTimeout(() => toast?.remove(), 5000);
  }


  afterRender() {
    const hash = window.location.hash;
    const idMatch = hash.match(/[?&]id=(\d+)/);
    const modeMatch = hash.match(/[?&]mode=([^&]+)/);
    if (idMatch) this.fetchData(idMatch[1], modeMatch?.[1]);

    // Destroy on route change
    const onHashChange = () => {
      this.destroy();
      window.removeEventListener('hashchange', onHashChange);
    };
    window.addEventListener('hashchange', onHashChange);
  }

  render() {
    return `
      <div class="container" style="padding-top:2rem;padding-bottom:3rem;">
        <div id="player-root">
          <div class="skeleton" style="height:70vh;border-radius:24px;"></div>
        </div>
      </div>
    `;
  }
}
