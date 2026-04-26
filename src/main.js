import './style.css';
import { Navbar } from './components/Navbar.js';
import { ExplorePage } from './pages/ExplorePage.js';
import { UserPage } from './pages/UserPage.js';
import { AuthorPage } from './pages/AuthorPage.js';
import { AdminPage } from './pages/AdminPage.js';
import { LoginPage } from './pages/LoginPage.js';
import { TrendingPage } from './pages/TrendingPage.js';
import { AuthorsPage } from './pages/AuthorsPage.js';
import { GenresPage } from './pages/GenresPage.js';
import { SearchPage } from './pages/SearchPage.js';
import { BookDetailPage } from './pages/BookDetailPage.js';
import { AudioPlayerPage } from './pages/AudioPlayerPage.js';
import { AuthorInfoPage } from './pages/AuthorInfoPage.js';
import { AuthService } from './services/AuthService.js';
import { BookDetailModal } from './components/BookDetailModal.js';
import { audioPlayer } from './services/AudioPlayerService.js';

// Route Guard: Define which roles can access which route
const AUTHENTICATED_ROLES = [1, 2, 3];

const ROUTE_PERMISSIONS = {
  '#explore': null,
  '#login': null,
  '#trending': null,
  '#authors': null,
  '#genres': null,
  '#search': null,
  '#author-info': AUTHENTICATED_ROLES,
  '#book': AUTHENTICATED_ROLES,
  '#player': AUTHENTICATED_ROLES,
  '#user': AUTHENTICATED_ROLES,
  '#author': [3],
  '#admin': [1],
};

const ROUTE_MAP = {
  '#explore': ExplorePage,
  '#login': LoginPage,
  '#trending': TrendingPage,
  '#authors': AuthorsPage,
  '#genres': GenresPage,
  '#search': SearchPage,
  '#author-info': AuthorInfoPage,
  '#book': BookDetailPage,
  '#player': AudioPlayerPage,
  '#user': UserPage,
  '#author': AuthorPage,
  '#admin': AdminPage,
};

class App {
  constructor() {
    this.appElement = document.querySelector('#app');
    this.theme = localStorage.getItem('theme') || 'dark';
    document.documentElement.setAttribute('data-theme', this.theme);

    // Mount BookDetailModal overlay once (into body, not #app)
    BookDetailModal.mount();

    window.addEventListener('hashchange', () => this.render());
  }

  toggleTheme = () => {
    this.theme = this.theme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', this.theme);
    localStorage.setItem('theme', this.theme);
    this.render();
  }

  checkAccess(hash) {
    const allowed = ROUTE_PERMISSIONS[hash];
    const user = AuthService.getUser();

    // Unknown route or public route: always allowed
    if (allowed === undefined || allowed === null) return true;
    // Protected route: must be logged in and have correct role
    if (!user) return false;
    return allowed.includes(user.roleId);
  }

  render() {
    const fullHash = window.location.hash || '#explore';
    // Strip query string from hash for route lookup: '#book?id=5' → '#book'
    const hash = fullHash.split('?')[0] || '#explore';

    // Route Guard check
    if (!this.checkAccess(hash)) {
      // Not allowed: redirect to login or explore
      const user = AuthService.getUser();
      if (!user) {
        window.location.hash = `#login?redirect=${encodeURIComponent(fullHash)}`;
        return;
      }
      // Logged in but wrong role — go to their home
      window.location.hash = AuthService.defaultRouteForRole(user.roleId);
      return;
    }

    this.appElement.innerHTML = '';

    // 1. Navbar  
    const currentUser = AuthService.getUser();
    const navbar = new Navbar(hash, this.toggleTheme, this.theme, currentUser);
    this.appElement.appendChild(navbar.render());

    // 2. Page content
    const mainContent = document.createElement('main');
    mainContent.style.flex = '1';
    mainContent.style.paddingTop = '80px';

    const PageClass = ROUTE_MAP[hash] || ExplorePage;
    const pageInstance = new PageClass();

    const pageHTML = pageInstance.render();
    if (pageHTML instanceof Promise) {
      pageHTML.then(html => {
        mainContent.innerHTML = html;
        if (pageInstance.afterRender) setTimeout(() => pageInstance.afterRender(), 0);
      });
    } else {
      mainContent.innerHTML = pageHTML;
      if (pageInstance.afterRender) setTimeout(() => pageInstance.afterRender(), 0);
    }

    this.appElement.appendChild(mainContent);

    // 3. Mini player (persistent on body)
    if (!document.getElementById('global-player')) {
      this._mountAudioPlayer();
    }
    this._syncMiniPlayerVisibility(hash);
  }

  _isPlayerRoute() {
    return (window.location.hash || '').split('?')[0] === '#player';
  }

  _syncMiniPlayerVisibility(hash) {
    const player = document.getElementById('global-player');
    if (!player) return;

    const isPlayerRoute = hash === '#player';
    if (isPlayerRoute) {
      player.style.display = 'none';
      player.style.transform = 'translateY(150%)';
      return;
    }

    player.style.display = 'flex';
    const book = audioPlayer.currentBook;
    if (!book) {
      player.style.transform = 'translateY(150%)';
      return;
    }

    player.dataset.bookid = book.id || '';
    const title = document.getElementById('player-title');
    const thumb = document.getElementById('player-thumb');
    const playBtn = document.getElementById('player-play-btn');

    if (title) title.innerText = book.name || 'Đang phát';
    if (thumb) thumb.src = book.thumbnailUrl || '';
    if (playBtn) {
      playBtn.innerHTML = audioPlayer.isPlaying
        ? '<i class="fa-solid fa-pause"></i>'
        : '<i class="fa-solid fa-play"></i>';
    }

    player.style.transform = 'translateY(0)';
  }

  _mountAudioPlayer() {
    const player = document.createElement('div');
    player.id = 'global-player';
    player.className = 'glass-panel';
    Object.assign(player.style, {
      position: 'fixed', bottom: '20px', right: '20px', width: '360px',
      padding: '15px 20px', display: 'flex', alignItems: 'center',
      gap: '15px', zIndex: '1000',
      transform: 'translateY(150%)',
      transition: 'transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
    });

    player.innerHTML = `
      <button id="player-read-link" class="mini-player-read-area" type="button" title="Mở trang đọc sách">
        <img id="player-thumb" src="" alt="" />
        <span class="mini-player-read-overlay">
          <i class="fa-solid fa-up-right-and-down-left-from-center"></i>
          <span>Đọc sách</span>
        </span>
      </button>
      <div id="player-info-link" style="flex:1;overflow:hidden;cursor:pointer;" title="Mở trang đọc sách">
        <strong id="player-title" style="display:block;font-size:0.9rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">Audio Track</strong>
        <span style="font-size:0.75rem;color:var(--text-muted);">Đang phát</span>
        <div style="width:100%;height:4px;background:var(--glass-border);border-radius:2px;margin-top:6px;cursor:pointer;" id="player-bar">
          <div id="player-progress" style="width:0%;height:100%;background:linear-gradient(90deg,var(--color-primary),var(--color-secondary));border-radius:2px;transition:width 0.3s;"></div>
        </div>
      </div>
      <div style="display:flex;gap:8px;flex-shrink:0;">
        <button id="player-play-btn" class="btn-icon" style="width:38px;height:38px;font-size:0.9rem;"><i class="fa-solid fa-play"></i></button>
        <button id="player-close-btn" class="btn-icon" style="width:38px;height:38px;font-size:0.9rem;"><i class="fa-solid fa-xmark"></i></button>
      </div>
    `;

    document.body.appendChild(player);

    if (!document.getElementById('mini-player-extra-style')) {
      const st = document.createElement('style');
      st.id = 'mini-player-extra-style';
      st.textContent = `
        .mini-player-read-area {
          position: relative;
          width: 56px;
          height: 56px;
          padding: 0;
          border: 0;
          border-radius: 10px;
          overflow: hidden;
          background: var(--bg-main);
          cursor: pointer;
          flex-shrink: 0;
        }
        .mini-player-read-area img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
          transition: transform 0.22s ease, filter 0.22s ease;
        }
        .mini-player-read-overlay {
          position: absolute;
          inset: 0;
          display: flex;
          flex-direction: column;
          gap: 3px;
          align-items: center;
          justify-content: center;
          background: rgba(0,0,0,0.5);
          color: #fff;
          font-size: 1rem;
          opacity: 0;
          transform: scale(0.82);
          transition: opacity 0.22s ease, transform 0.22s ease;
        }
        .mini-player-read-overlay span {
          font-size: 0.58rem;
          font-weight: 800;
          line-height: 1;
          white-space: nowrap;
        }
        .mini-player-read-area:hover img {
          transform: scale(1.12);
          filter: brightness(0.72);
        }
        .mini-player-read-area:hover .mini-player-read-overlay {
          opacity: 1;
          transform: scale(1);
        }
      `;
      document.head.appendChild(st);
    }

    // Sync mini player with AudioPlayerService
    audioPlayer.on('play', (book) => {
      if (book) {
        document.getElementById('global-player').dataset.bookid = book.id || '';
        document.getElementById('player-title').innerText = book.name || 'Đang phát';
        document.getElementById('player-thumb').src = book.thumbnailUrl || '';
      }
      if (this._isPlayerRoute()) {
        document.getElementById('global-player').style.display = 'none';
        document.getElementById('global-player').style.transform = 'translateY(150%)';
      } else {
        document.getElementById('global-player').style.display = 'flex';
        document.getElementById('global-player').style.transform = 'translateY(0)';
      }
      document.getElementById('player-play-btn').innerHTML = '<i class="fa-solid fa-pause"></i>';
    });
    audioPlayer.on('pause', () => {
      document.getElementById('player-play-btn').innerHTML = '<i class="fa-solid fa-play"></i>';
    });
    audioPlayer.on('stop', () => {
      player.dataset.bookid = '';
      document.getElementById('player-title').innerText = 'Audio Track';
      document.getElementById('player-thumb').src = '';
      document.getElementById('player-progress').style.width = '0%';
      player.style.transform = 'translateY(150%)';
    });
    audioPlayer.on('timeupdate', ({ pct }) => {
      document.getElementById('player-progress').style.width = (pct * 100) + '%';
    });

    const playBtn = player.querySelector('#player-play-btn');
    playBtn.addEventListener('click', () => audioPlayer.toggle());

    const openReader = (e) => {
      e?.preventDefault();
      e?.stopPropagation();
      const id = parseInt(player.dataset.bookid || audioPlayer.currentBook?.id);
      if (id) window.location.hash = `#player?id=${id}&mode=pdf`;
    };

    player.querySelector('#player-read-link')?.addEventListener('click', (e) => openReader(e));
    player.querySelector('#player-info-link')?.addEventListener('click', (e) => {
      if (e.target.closest('#player-bar')) return;
      openReader(e);
    });
    player.addEventListener('click', (e) => {
      if (e.target.closest('#player-play-btn,#player-close-btn,#player-bar')) return;
      openReader(e);
    });
    player.querySelector('#player-close-btn')?.addEventListener('click', (e) => {
      e.stopPropagation();
      audioPlayer.pause();
      player.style.transform = 'translateY(150%)';
    });

    // Legacy global for TrendingPage etc (opens modal if possible)
    window.playAudio = (title, thumb) => {
      // Find book by name and open modal
      const book = { name: title, thumbnailUrl: thumb, id: -1 };
      BookDetailModal.open(book, [], null);
    };
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const app = new App();
  app.render();
});
