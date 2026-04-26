import { AuthService } from './AuthService.js';
import { MockDbService } from './MockDbService.js';

/**
 * AudioPlayerService — quản lý audio element toàn cục.
 * Giới hạn theo gói:
 *   FREE  → demo 30s, không tua, không chọn chương
 *   BASIC → nghe full nhưng không tua/chọn chương, tối đa 10 sách/tháng
 *   PREMIUM → toàn quyền
 */
class AudioPlayerService {
  constructor() {
    this.audio = new Audio();
    this.currentBook = null;
    this.currentChapters = [];
    this.currentChapterIdx = 0;
    this.isPlaying = false;
    this.isDemoMode = false;
    this.demoTimer = null;
    this.demoSecondsLeft = 30;
    this.listeners = {};
    this.totalDuration = 0;     // Tổng thời lượng toàn bộ audiobook (giây)
    this._chapterStarts = [];   // Mảng startOffset tích lũy của từng chương

    this.audio.addEventListener('timeupdate', () => this._onTimeUpdate());
    this.audio.addEventListener('ended',      () => this._onEnded());
    this.audio.addEventListener('loadedmetadata', () => this._emit('durationchange', this.audio.duration));
    this.audio.addEventListener('error', (e) => console.warn('Audio error', e));
    window.addEventListener('listenary:logout', () => this.stop());
    this._lastSavedProgress = -1; // throttle progress saves
  }

  // ── Event system ───────────────────────────────────────────────
  on(event, cb) {
    if (!this.listeners[event]) this.listeners[event] = [];
    this.listeners[event].push(cb);
    return () => this.off(event, cb);
  }
  off(event, cb) {
    this.listeners[event] = (this.listeners[event] || []).filter(f => f !== cb);
  }
  _emit(event, data) {
    (this.listeners[event] || []).forEach(cb => cb(data));
  }

  // ── Core controls ───────────────────────────────────────────────
  play(book, chapters = []) {
    const check = AuthService.checkCanListen(book.id);

    // Sách đã bị chặn do giới hạn BASIC
    if (!check.allowed && check.reason === 'limit') {
      this._emit('planlimit', {
        reason: 'limit',
        count: check.count,
        limit: check.limit,
      });
      return;
    }

    const canFull = AuthService.canListenFull();
    this.isDemoMode = !canFull; // FREE hoặc khách

    if (this.currentBook?.id !== book.id) {
      this.currentBook = book;
      this.currentChapters = chapters;
      this.currentChapterIdx = 0;

      // Tính cumulative startOffset và totalDuration từ chapter.duration
      this._chapterStarts = [];
      let acc = 0;
      for (const ch of chapters) {
        this._chapterStarts.push(acc);
        acc += (ch.duration || 0);
      }
      this.totalDuration = acc;

      this._loadChapter(0);
      AuthService.recordListen(book.id);
      MockDbService.incrementView(book.id);
      this._lastSavedProgress = -1;
      const user = AuthService.getUser();
      if (user) MockDbService.updateReadingProgress(user.id, book.id, 0);
    }

    this.audio.play().catch(() => {});
    this.isPlaying = true;
    this._emit('play', this.currentBook);

    if (this.isDemoMode) {
      this._startDemoTimer();
    }
  }

  pause() {
    this.audio.pause();
    this.isPlaying = false;
    this._clearDemoTimer();
    this._emit('pause');
  }

  stop() {
    this.audio.pause();
    this.audio.removeAttribute('src');
    this.audio.load();
    this.currentBook = null;
    this.currentChapters = [];
    this.currentChapterIdx = 0;
    this.isPlaying = false;
    this.isDemoMode = false;
    this.demoSecondsLeft = 30;
    this.totalDuration = 0;
    this._chapterStarts = [];
    this._clearDemoTimer();
    this._emit('stop');
    this._emit('pause');
    this._emit('timeupdate', { current: 0, duration: 1, pct: 0 });
  }

  toggle() {
    if (this.isPlaying) this.pause();
    else {
      this.audio.play().catch(() => {});
      this.isPlaying = true;
      this._emit('play', this.currentBook);
      if (this.isDemoMode) this._startDemoTimer();
    }
  }

  /**
   * Seek đến vị trí tuyệt đối (giây) trên toàn audiobook.
   * Tự tìm đúng chương và seek local trong file đó.
   */
  seek(absoluteSeconds) {
    if (!AuthService.canSeek()) {
      if (AuthService.canListenFull()) this._emit('planblock', { reason: 'seek', plan: 'BASIC' });
      return;
    }
    const s = Math.max(0, Math.min(absoluteSeconds, this.totalDuration));
    // Tìm chapter chứa vị trí này
    let targetIdx = 0;
    for (let i = this._chapterStarts.length - 1; i >= 0; i--) {
      if (s >= this._chapterStarts[i]) { targetIdx = i; break; }
    }
    const localTime = s - this._chapterStarts[targetIdx];
    if (targetIdx !== this.currentChapterIdx) {
      this.currentChapterIdx = targetIdx;
      this._loadChapter(targetIdx);
      // Sau khi load, seek local
      const doSeek = () => { this.audio.currentTime = localTime; };
      if (this.audio.readyState >= 1) doSeek();
      else this.audio.addEventListener('loadedmetadata', doSeek, { once: true });
    } else {
      this.audio.currentTime = localTime;
    }
  }

  seekPercent(pct) {
    const total = this.totalDuration || this.audio.duration || 1;
    this.seek(pct * total);
  }

  nextChapter() {
    if (this.currentChapterIdx < this.currentChapters.length - 1) {
      this.currentChapterIdx++;
      this._loadChapter(this.currentChapterIdx);
      this.audio.play();
      this.isPlaying = true;
      this._emit('chapterchange', this.currentChapterIdx);
    }
  }

  prevChapter() {
    if (this.currentChapterIdx > 0) {
      this.currentChapterIdx--;
      this._loadChapter(this.currentChapterIdx);
      this.audio.play();
      this.isPlaying = true;
      this._emit('chapterchange', this.currentChapterIdx);
    }
  }

  setChapter(idx) {
    if (!AuthService.canSeek()) {
      const plan = AuthService.getPlan();
      if (plan === 'FREE' || !AuthService.isLoggedIn()) {
        this._emit('demoblock', 'Cần đăng nhập và nâng cấp gói để chọn chương');
      } else {
        // BASIC
        this._emit('planblock', { reason: 'chapter', plan: 'BASIC' });
      }
      return;
    }
    this.currentChapterIdx = idx;
    this._loadChapter(idx);
    this.audio.play();
    this.isPlaying = true;
    this._emit('chapterchange', idx);
  }

  // ── Internal helpers ─────────────────────────────────────────
  _loadChapter(idx) {
    const chapter = this.currentChapters[idx];
    if (!chapter) return;

    if (chapter.audiobookUrl) {
      // Mỗi chương có URL riêng (bị cắt sẵn)
      if (this.audio.src !== chapter.audiobookUrl) {
        this.audio.src = chapter.audiobookUrl;
      }
      this.audio.currentTime = 0;
    } else {
      // Fallback: 1 file audio chung, seek theo startOffset
      const audioUrl = this.currentBook?.audioFileUrl || '';
      if (!audioUrl) return;
      if (this.audio.src !== audioUrl) {
        this.audio.src = audioUrl;
      }
      const offset = chapter.startOffset || 0;
      const doSeek = () => { this.audio.currentTime = offset; };
      if (this.audio.readyState >= 1) doSeek();
      else this.audio.addEventListener('loadedmetadata', doSeek, { once: true });
    }
    this._emit('chaptername', chapter.name);
    this._emit('chapterchange', this.currentChapterIdx);
  }

  _onTimeUpdate() {
    // Thời gian tuyệt đối = startOffset của chapter hiện tại + audio.currentTime
    const chapterStart = this._chapterStarts[this.currentChapterIdx] || 0;
    const localCur = this.audio.currentTime;
    const absoluteCur = chapterStart + localCur;
    const total = this.totalDuration > 0 ? this.totalDuration : (this.audio.duration || 1);
    this._emit('timeupdate', {
      current: absoluteCur,
      duration: total,
      pct: absoluteCur / total,
      localCurrent: localCur,
      chapterIdx: this.currentChapterIdx
    });

    // Kiểm tra kết thúc chương trong fallback mode (1 file + startOffset)
    const chapter = this.currentChapters[this.currentChapterIdx];
    if (chapter && !chapter.audiobookUrl && chapter.duration > 0) {
      const chapEnd = (chapter.startOffset || 0) + chapter.duration;
      if (localCur >= chapEnd - 0.2) {
        if (this.currentChapterIdx < this.currentChapters.length - 1) {
          this.nextChapter();
        }
      }
    }

    // Lưu tiến độ vào localStorage
    const user = AuthService.getUser();
    if (user && this.currentBook && total > 1) {
      const pct = Math.round((absoluteCur / total) * 100);
      if (Math.abs(pct - this._lastSavedProgress) >= 5) {
        this._lastSavedProgress = pct;
        MockDbService.updateReadingProgress(user.id, this.currentBook.id, pct, total);
      }
    }

    // Demo 30s cap (FREE / khách)
    if (this.isDemoMode && absoluteCur >= 30) {
      this.pause();
      this.audio.currentTime = 0;
      this._emit('demoended');
    }
  }

  _onEnded() {
    this._emit('ended');
    if (!this.isDemoMode && this.currentChapterIdx < this.currentChapters.length - 1) {
      this.nextChapter();
    } else {
      this.isPlaying = false;
      this._emit('pause');
      // Đánh dấu đã nghe xong (100%)
      const user = AuthService.getUser();
      if (user && this.currentBook) {
        const dur = this.audio.duration || 0;
        MockDbService.updateReadingProgress(user.id, this.currentBook.id, 100, dur);
      }
    }
  }

  _startDemoTimer() {
    this._clearDemoTimer();
    this.demoSecondsLeft = 30 - Math.floor(this.audio.currentTime);
    this.demoTimer = setInterval(() => {
      this.demoSecondsLeft = Math.max(0, 30 - Math.floor(this.audio.currentTime));
      this._emit('demotick', this.demoSecondsLeft);
    }, 1000);
  }

  _clearDemoTimer() {
    if (this.demoTimer) { clearInterval(this.demoTimer); this.demoTimer = null; }
  }

  get currentTime() { return this._chapterStarts[this.currentChapterIdx] + (this.audio.currentTime || 0); }
  get duration() { return this.totalDuration || this.audio.duration || 0; }
  get buffered() { return this.audio.buffered; }
}

export const audioPlayer = new AudioPlayerService();
