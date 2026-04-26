import { audioPlayer } from '../services/AudioPlayerService.js';
import { AuthService } from '../services/AuthService.js';
import '../explore.css';

/**
 * BookDetailModal — full-screen overlay showing book info + audio player.
 * Opened by calling BookDetailModal.open(bookId, allBooks, allChapters, allAuthors)
 */
export class BookDetailModal {
  static instance = null;

  static mount() {
    if (document.getElementById('book-detail-overlay')) return;
    const modal = new BookDetailModal();
    modal._createDOM();
    BookDetailModal.instance = modal;
  }

  static open(book, chapters = [], author = null) {
    if (!BookDetailModal.instance) BookDetailModal.mount();
    BookDetailModal.instance._open(book, chapters, author);
  }

  static close() {
    BookDetailModal.instance?._close();
  }

  _createDOM() {
    const overlay = document.createElement('div');
    overlay.id = 'book-detail-overlay';
    overlay.innerHTML = `<div id="book-detail-modal"></div>`;
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) this._close();
    });
    document.body.appendChild(overlay);

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') this._close();
    });

    this.overlay = overlay;
    this.modal = overlay.querySelector('#book-detail-modal');
  }

  _open(book, chapters, author) {
    this.book = book;
    this.chapters = chapters;
    this.author = author;

    this.modal.innerHTML = this._buildHTML();
    this.overlay.classList.add('open');
    document.body.style.overflow = 'hidden';

    // Start audio
    audioPlayer.play(book, chapters);

    this._attachEvents();
    this._subscribeAudio();
  }

  _close() {
    audioPlayer.pause();
    this.overlay.classList.remove('open');
    document.body.style.overflow = '';
    this._unsubscribeAudio();
  }

  _fmt(s) {
    if (!s) return '0:00';
    const m = Math.floor(s / 60), sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, '0')}`;
  }

  _buildHTML() {
    const user = AuthService.getUser();
    const isDemo = !user;
    const b = this.book;
    const auth = this.author;

    return `
      <!-- Header bar -->
      <div style="display:flex;align-items:center;justify-content:space-between;padding:1.5rem 2rem;border-bottom:1px solid var(--glass-border);background:var(--bg-panel-solid);">
        <div style="display:flex;align-items:center;gap:0.75rem;">
          <i class="fa-solid fa-headphones" style="color:var(--color-primary);font-size:1.2rem;"></i>
          <span style="font-weight:700;font-size:1rem;font-family:'Outfit',sans-serif;">Đang phát</span>
        </div>
        ${isDemo ? `
          <div style="display:flex;align-items:center;gap:0.75rem;background:rgba(255,107,53,0.12);border:1px solid rgba(255,107,53,0.3);padding:6px 14px;border-radius:20px;">
            <i class="fa-solid fa-clock" style="color:#ff6b35;font-size:0.85rem;"></i>
            <span style="font-size:0.82rem;color:#ff6b35;font-weight:600;">Demo 30 giây — <a href="#login" style="color:#ff6b35;font-weight:700;text-decoration:underline;" onclick="BookDetailModal.close()">Đăng nhập để nghe full</a></span>
          </div>
        ` : ''}
        <button id="modal-close-btn" style="background:var(--bg-main);border:1px solid var(--glass-border);width:38px;height:38px;border-radius:50%;cursor:pointer;color:var(--text-muted);font-size:1rem;display:flex;align-items:center;justify-content:center;transition:all 0.2s;">
          <i class="fa-solid fa-xmark"></i>
        </button>
      </div>

      <!-- Main body: two columns -->
      <div style="display:grid;grid-template-columns:280px 1fr;overflow:hidden;max-height:calc(90vh - 80px);">

        <!-- LEFT: Book info -->
        <div style="background:var(--bg-main);padding:2rem;overflow-y:auto;border-right:1px solid var(--glass-border);">
          <!-- Cover -->
          <div style="position:relative;margin-bottom:1.5rem;">
            <img src="${b.thumbnailUrl}" alt="${b.name}"
              style="width:100%;aspect-ratio:2/3;object-fit:cover;border-radius:16px;box-shadow:0 20px 40px rgba(0,0,0,0.4);" />
            ${isDemo ? `
              <div style="position:absolute;inset:0;border-radius:16px;background:rgba(0,0,0,0.55);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:0.75rem;">
                <svg class="demo-ring" width="64" height="64" viewBox="0 0 64 64">
                  <circle class="track" cx="32" cy="32" r="30"></circle>
                  <circle class="progress" id="demo-ring-circle" cx="32" cy="32" r="30"></circle>
                </svg>
                <span id="demo-countdown" style="font-size:1.8rem;font-weight:800;color:#fff;"></span>
                <span style="font-size:0.75rem;color:rgba(255,255,255,0.6);">giây còn lại</span>
              </div>
            ` : ''}
          </div>

          <!-- Meta -->
          <h2 style="font-size:1.2rem;font-family:'Outfit',sans-serif;font-weight:700;margin-bottom:0.4rem;line-height:1.3;">${b.name}</h2>
          ${auth ? `<p style="color:var(--color-primary);font-size:0.88rem;font-weight:600;margin-bottom:0.75rem;"><i class="fa-solid fa-pen-nib" style="margin-right:4px;"></i>${auth.firstName} ${auth.lastName}</p>` : ''}

          <div style="display:flex;flex-wrap:wrap;gap:0.5rem;margin-bottom:1rem;">
            ${b.country  ? `<span style="background:var(--bg-panel);border:1px solid var(--glass-border);padding:3px 10px;border-radius:20px;font-size:0.75rem;"><i class="fa-solid fa-globe" style="margin-right:3px;color:var(--color-primary);"></i>${b.country}</span>` : ''}
            ${b.releaseDate ? `<span style="background:var(--bg-panel);border:1px solid var(--glass-border);padding:3px 10px;border-radius:20px;font-size:0.75rem;"><i class="fa-regular fa-calendar" style="margin-right:3px;color:var(--color-secondary);"></i>${b.releaseDate}</span>` : ''}
            ${b.pageNumber ? `<span style="background:var(--bg-panel);border:1px solid var(--glass-border);padding:3px 10px;border-radius:20px;font-size:0.75rem;"><i class="fa-solid fa-file-lines" style="margin-right:3px;color:var(--color-accent);"></i>${b.pageNumber} trang</span>` : ''}
          </div>

          <p style="font-size:0.82rem;color:var(--text-muted);line-height:1.7;margin-bottom:1.5rem;">${b.description || 'Không có mô tả.'}</p>

          ${!user ? `
            <a href="#login" style="display:block;text-align:center;" onclick="BookDetailModal.close()">
              <button class="btn btn-primary" style="width:100%;font-size:0.88rem;">
                <i class="fa-solid fa-right-to-bracket"></i> Đăng nhập nghe full
              </button>
            </a>
          ` : `
            <button class="btn" style="width:100%;background:rgba(255,71,87,0.1);border:1px solid rgba(255,71,87,0.3);color:#ff4757;font-size:0.85rem;" onclick="alert('Đã thêm vào yêu thích!')">
              <i class="fa-regular fa-heart"></i> Yêu thích
            </button>
          `}
        </div>

        <!-- RIGHT: Audio player + chapter list -->
        <div style="display:flex;flex-direction:column;background:var(--bg-panel-solid);overflow-y:auto;">

          <!-- Audio controls -->
          <div style="padding:2rem 2.5rem;border-bottom:1px solid var(--glass-border);">

            <!-- Waveform -->
            <div id="waveform" style="display:flex;align-items:center;justify-content:center;gap:5px;height:48px;margin-bottom:1.5rem;">
              ${Array(18).fill('<div class="waveform-bar paused"></div>').join('')}
            </div>

            <!-- Chapter name -->
            <p id="chapter-name" style="text-align:center;font-size:0.85rem;color:var(--text-muted);margin-bottom:0.25rem;">
              ${this.chapters[0]?.name || ''}
            </p>
            <h3 id="now-playing-title" style="text-align:center;font-size:1.1rem;font-family:'Outfit',sans-serif;font-weight:700;margin-bottom:1.5rem;">${b.name}</h3>

            <!-- Progress bar -->
            <div style="display:flex;align-items:center;gap:1rem;margin-bottom:1.5rem;">
              <span id="time-current" style="font-size:0.78rem;color:var(--text-muted);min-width:36px;">0:00</span>
              <div style="flex:1;position:relative;">
                <input type="range" id="progress-range" value="0" min="0" max="100" step="0.1"
                  style="width:100%;" ${isDemo ? 'disabled' : ''} />
              </div>
              <span id="time-duration" style="font-size:0.78rem;color:var(--text-muted);min-width:36px;">0:00</span>
            </div>

            <!-- Controls -->
            <div style="display:flex;align-items:center;justify-content:center;gap:1.5rem;margin-bottom:1rem;">
              <button id="ctrl-prev" class="btn-icon" style="width:44px;height:44px;font-size:1rem;" title="Chương trước">
                <i class="fa-solid fa-backward-step"></i>
              </button>
              <button id="ctrl-rewind" class="btn-icon" style="width:40px;height:40px;font-size:0.9rem;" title="Tua lại 10s" ${isDemo ? 'disabled' : ''}>
                <i class="fa-solid fa-rotate-left"></i>
              </button>
              <button id="ctrl-play" style="
                width:62px;height:62px;border-radius:50%;border:none;cursor:pointer;
                background:linear-gradient(135deg,var(--color-primary),var(--color-secondary));
                color:#fff;font-size:1.4rem;
                box-shadow:0 8px 20px hsla(260,80%,60%,0.4);
                transition:all 0.2s cubic-bezier(0.34,1.56,0.64,1);
                display:flex;align-items:center;justify-content:center;
              ">
                <i class="fa-solid fa-pause"></i>
              </button>
              <button id="ctrl-forward" class="btn-icon" style="width:40px;height:40px;font-size:0.9rem;" title="Tua tới 10s" ${isDemo ? 'disabled' : ''}>
                <i class="fa-solid fa-rotate-right"></i>
              </button>
              <button id="ctrl-next" class="btn-icon" style="width:44px;height:44px;font-size:1rem;" title="Chương sau">
                <i class="fa-solid fa-forward-step"></i>
              </button>
            </div>

            <!-- Volume -->
            <div style="display:flex;align-items:center;gap:0.75rem;max-width:220px;margin:0 auto;">
              <i class="fa-solid fa-volume-low" style="color:var(--text-muted);font-size:0.85rem;"></i>
              <input type="range" id="volume-range" value="80" min="0" max="100" style="flex:1;" />
              <i class="fa-solid fa-volume-high" style="color:var(--text-muted);font-size:0.85rem;"></i>
            </div>

            ${isDemo ? `
              <div style="margin-top:1rem;background:rgba(255,107,53,0.1);border:1px solid rgba(255,107,53,0.25);border-radius:12px;padding:0.875rem 1rem;text-align:center;">
                <p style="font-size:0.82rem;color:#ff6b35;"><i class="fa-solid fa-lock"></i> Bạn đang nghe bản demo 30 giây.</p>
                <p style="font-size:0.8rem;color:var(--text-muted);margin-top:3px;">Đăng nhập để nghe toàn bộ ${this.chapters.length || ''} chương.</p>
              </div>
            ` : ''}
          </div>

          <!-- Chapter list -->
          ${this.chapters.length > 0 ? `
            <div style="padding:1.5rem 2.5rem;flex:1;">
              <h4 style="font-size:0.9rem;color:var(--text-muted);font-weight:600;text-transform:uppercase;letter-spacing:1px;margin-bottom:1rem;">
                Danh sách chương (${this.chapters.length})
              </h4>
              <div style="display:flex;flex-direction:column;gap:0.5rem;" id="chapter-list">
                ${this.chapters.map((ch, i) => `
                  <div id="ch-item-${i}" data-chapidx="${i}" class="chapter-item" style="
                    display:flex;align-items:center;gap:1rem;padding:0.75rem 1rem;
                    border-radius:12px;cursor:pointer;transition:background 0.2s;
                    ${i === 0 ? 'background:hsla(260,80%,60%,0.12);border:1px solid hsla(260,80%,60%,0.2);' : 'background:transparent;border:1px solid transparent;'}
                    ${!user ? 'opacity:0.5;' : ''}
                  ">
                    <div style="width:28px;height:28px;border-radius:8px;flex-shrink:0;
                      background:${i === 0 ? 'var(--color-primary)' : 'var(--bg-main)'};
                      display:flex;align-items:center;justify-content:center;
                      font-size:0.75rem;font-weight:700;color:${i === 0 ? '#fff' : 'var(--text-muted)'};">
                      ${i === 0 && audioPlayer.isPlaying ? '<i class="fa-solid fa-volume-high" style="font-size:0.65rem;"></i>' : i + 1}
                    </div>
                    <div style="flex:1;overflow:hidden;">
                      <div style="font-size:0.85rem;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${ch.name || `Chương ${i+1}`}</div>
                      <div style="font-size:0.72rem;color:var(--text-muted);">${ch.duration ? Math.floor(ch.duration/60) + ' phút' : ''}</div>
                    </div>
                    ${!user && i > 0 ? '<i class="fa-solid fa-lock" style="color:var(--text-muted);font-size:0.75rem;flex-shrink:0;"></i>' : ''}
                  </div>
                `).join('')}
              </div>
            </div>
          ` : `<div style="padding:2rem;text-align:center;color:var(--text-muted);">Chưa có dữ liệu chương.</div>`}
        </div>
      </div>
    `;
  }

  _attachEvents() {
    // Close
    document.getElementById('modal-close-btn')?.addEventListener('click', () => this._close());

    // Play/Pause
    document.getElementById('ctrl-play')?.addEventListener('click', () => {
      audioPlayer.toggle();
    });

    // Prev/Next chapter
    document.getElementById('ctrl-prev')?.addEventListener('click', () => audioPlayer.prevChapter());
    document.getElementById('ctrl-next')?.addEventListener('click', () => audioPlayer.nextChapter());

    // Rewind/Forward 10s
    document.getElementById('ctrl-rewind')?.addEventListener('click', () => {
      audioPlayer.seek(Math.max(0, audioPlayer.currentTime - 10));
    });
    document.getElementById('ctrl-forward')?.addEventListener('click', () => {
      audioPlayer.seek(Math.min(audioPlayer.duration, audioPlayer.currentTime + 10));
    });

    // Progress range
    document.getElementById('progress-range')?.addEventListener('input', (e) => {
      audioPlayer.seekPercent(e.target.value / 100);
    });

    // Volume
    document.getElementById('volume-range')?.addEventListener('input', (e) => {
      audioPlayer.audio.volume = e.target.value / 100;
    });
    audioPlayer.audio.volume = 0.8;

    // Chapter list items
    document.querySelectorAll('.chapter-item').forEach(item => {
      item.addEventListener('click', () => {
        const idx = parseInt(item.dataset.chapidx);
        audioPlayer.setChapter(idx);
      });
    });

    // Make close accessible globally for inline link
    window.BookDetailModal = { close: () => this._close() };
  }

  _unsubsAudio = [];
  _subscribeAudio() {
    const playBtn = () => document.getElementById('ctrl-play');
    const waveforms = () => document.querySelectorAll('.waveform-bar');

    this._unsubsAudio = [
      audioPlayer.on('play', () => {
        const btn = playBtn();
        if (btn) btn.innerHTML = '<i class="fa-solid fa-pause"></i>';
        waveforms().forEach(b => b.classList.remove('paused'));
      }),
      audioPlayer.on('pause', () => {
        const btn = playBtn();
        if (btn) btn.innerHTML = '<i class="fa-solid fa-play"></i>';
        waveforms().forEach(b => b.classList.add('paused'));
      }),
      audioPlayer.on('timeupdate', ({ current, duration, pct }) => {
        const cur = document.getElementById('time-current');
        const dur = document.getElementById('time-duration');
        const range = document.getElementById('progress-range');
        if (cur) cur.textContent = this._fmt(current);
        if (dur) dur.textContent = this._fmt(duration);
        if (range && !range.matches(':active')) range.value = pct * 100;
        // Color progress
        if (range) {
          range.style.background = `linear-gradient(to right, var(--color-primary) ${pct*100}%, var(--glass-border) ${pct*100}%)`;
        }
      }),
      audioPlayer.on('demotick', (s) => {
        const el = document.getElementById('demo-countdown');
        if (el) el.textContent = s;
        const circle = document.getElementById('demo-ring-circle');
        if (circle) {
          const offset = 188.5 * (1 - s / 30);
          circle.style.strokeDashoffset = offset;
        }
      }),
      audioPlayer.on('demoended', () => {
        const btn = playBtn();
        if (btn) btn.innerHTML = '<i class="fa-solid fa-play"></i>';
        waveforms().forEach(b => b.classList.add('paused'));
      }),
      audioPlayer.on('chapterchange', (idx) => {
        // Update chapter highlight
        document.querySelectorAll('.chapter-item').forEach((el, i) => {
          if (i === idx) {
            el.style.background = 'hsla(260,80%,60%,0.12)';
            el.style.border = '1px solid hsla(260,80%,60%,0.2)';
          } else {
            el.style.background = 'transparent';
            el.style.border = '1px solid transparent';
          }
        });
        // Update chapter name display
        const nameEl = document.getElementById('chapter-name');
        if (nameEl && this.chapters[idx]) nameEl.textContent = this.chapters[idx].name;
      }),
      audioPlayer.on('demoblock', (msg) => {
        alert(msg);
      }),
    ];

    // Set initial countdown display
    const el = document.getElementById('demo-countdown');
    if (el) el.textContent = '30';
  }

  _unsubscribeAudio() {
    this._unsubsAudio.forEach(unsub => unsub?.());
    this._unsubsAudio = [];
  }
}
