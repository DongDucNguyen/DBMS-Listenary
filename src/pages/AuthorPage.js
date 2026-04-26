import { AuthService } from '../services/AuthService.js';

export class AuthorPage {
  constructor() {
    this.authorData = null;
    this.authorBooks = [];
    this.allComments = [];
    this.isLoading = true;
    this.categories = [];
    this.publishingHouses = [];
    this.allBooks = [];
    this.allUsers = [];
    this.showPublishModal = false;
    this.editingBook = null;
    this.deletingBook = null;
  }

  async fetchData() {
    try {
      const currentUser = AuthService.getUser();
      const res = await fetch('/database.json?t=' + Date.now());
      const data = await res.json();

      // Lấy thông tin tác giả tương ứng với user đang đăng nhập
      this.authorData = data.author.find(a => a.id === currentUser.authorId);
      // Lấy sách của tác giả qua bảng authorsOfBooks + trường authorId trực tiếp
      const authorBookIdsFromJoin = (data.authorsOfBooks || [])
        .filter(r => r.AuthorId === currentUser.authorId)
        .map(r => r.BookId);
      this.authorBooks = data.books.filter(b => 
        authorBookIdsFromJoin.includes(b.id) || b.authorId === currentUser.authorId
      );
      // Lấy comment cho sách của tác giả
      const authorBookIds = this.authorBooks.map(b => b.id);
      this.allComments = (data.comments || []).filter(c => authorBookIds.includes(c.bookId));
      this.allBooks = data.books;
      this.allUsers = data.user;
      this.categories = data.category || [];
      this.publishingHouses = data.publishingHouse || [];
    } catch (err) {
      console.error(err);
    } finally {
      this.isLoading = false;
      this.reRender();
    }
  }

  _totalListens() {
    return this.authorBooks.reduce((sum, b) => sum + (b.weeklyViewCount || Math.floor(Math.random() * 50000) + 500), 0);
  }

  _avgRating() {
    if (this.allComments.length === 0) return 'N/A';
    const avg = this.allComments.reduce((s, c) => s + c.rating, 0) / this.allComments.length;
    return avg.toFixed(1);
  }

  _statusBadge(status) {
    const configs = {
      'APPROVED': { bg: 'rgba(46,213,115,0.15)', color: '#2ed573', border: 'rgba(46,213,115,0.4)', icon: 'fa-check-circle', label: 'Đã duyệt' },
      'PENDING': { bg: 'rgba(255,165,0,0.15)', color: '#ffa500', border: 'rgba(255,165,0,0.4)', icon: 'fa-clock', label: 'Chờ duyệt' },
      'REJECTED': { bg: 'rgba(255,71,87,0.15)', color: '#ff4757', border: 'rgba(255,71,87,0.4)', icon: 'fa-times-circle', label: 'Từ chối' },
    };
    const c = configs[status] || configs['PENDING'];
    return `<span style="background:${c.bg};color:${c.color};border:1px solid ${c.border};padding:3px 10px;border-radius:20px;font-size:0.7rem;font-weight:700;display:inline-flex;align-items:center;gap:4px;"><i class="fa-solid ${c.icon}" style="font-size:0.6rem;"></i>${c.label}</span>`;
  }

  _publishModalHTML() {
    return `
      <div id="publish-modal-overlay" style="position:fixed;inset:0;background:rgba(0,0,0,0.7);backdrop-filter:blur(8px);z-index:9999;display:flex;align-items:center;justify-content:center;animation:fadeIn 0.3s ease;">
        <div id="publish-modal" style="background:var(--bg-panel);border:1px solid var(--glass-border);border-radius:24px;width:95%;max-width:800px;max-height:90vh;overflow-y:auto;box-shadow:0 40px 80px rgba(0,0,0,0.5);animation:slideUp 0.4s cubic-bezier(0.22,1,0.36,1);">
          
          <!-- Header -->
          <div style="padding:2rem 2.5rem 1.5rem;border-bottom:1px solid var(--glass-border);display:flex;align-items:center;justify-content:space-between;position:sticky;top:0;background:var(--bg-panel);z-index:10;border-radius:24px 24px 0 0;">
            <div>
              <h2 style="margin:0;font-size:1.4rem;font-family:'Playfair Display',serif;">
                <i class="fa-solid fa-book-medical" style="color:var(--color-primary);margin-right:8px;"></i>
                Xuất bản sách mới
              </h2>
              <p style="color:var(--text-muted);font-size:0.82rem;margin:0.3rem 0 0;">Điền thông tin sách và tải lên các tệp cần thiết</p>
            </div>
            <button id="close-publish-modal" class="btn-icon" style="width:40px;height:40px;font-size:1.1rem;flex-shrink:0;">
              <i class="fa-solid fa-xmark"></i>
            </button>
          </div>

          <!-- Form Body -->
          <form id="publish-book-form" style="padding:2rem 2.5rem;">
            
            <!-- Section: Thông tin cơ bản -->
            <div style="margin-bottom:2rem;">
              <h3 style="font-size:1rem;margin:0 0 1.25rem;color:var(--color-primary);display:flex;align-items:center;gap:8px;">
                <i class="fa-solid fa-info-circle" style="font-size:0.9rem;"></i>
                Thông tin cơ bản
              </h3>
              <div style="display:grid;grid-template-columns:1fr;gap:1.25rem;">
                
                <!-- Tên sách -->
                <div>
                  <label style="display:block;font-size:0.82rem;font-weight:600;color:var(--text-muted);margin-bottom:6px;">
                    Tên sách <span style="color:#ff4757;">*</span>
                  </label>
                  <input type="text" id="pub-name" required placeholder="Nhập tên tác phẩm..." 
                    style="width:100%;padding:0.75rem 1rem;border-radius:12px;border:1px solid var(--glass-border);background:var(--bg-main);color:var(--text-main);font-family:var(--font-sans);font-size:0.9rem;outline:none;transition:border-color 0.2s;box-sizing:border-box;"
                    onfocus="this.style.borderColor='var(--color-primary)'" onblur="this.style.borderColor='var(--glass-border)'" />
                </div>

                <!-- Mô tả -->
                <div>
                  <label style="display:block;font-size:0.82rem;font-weight:600;color:var(--text-muted);margin-bottom:6px;">
                    Mô tả sách <span style="color:#ff4757;">*</span>
                  </label>
                  <textarea id="pub-desc" required placeholder="Giới thiệu về nội dung tác phẩm..." rows="4"
                    style="width:100%;padding:0.75rem 1rem;border-radius:12px;border:1px solid var(--glass-border);background:var(--bg-main);color:var(--text-main);font-family:var(--font-sans);font-size:0.9rem;outline:none;resize:vertical;transition:border-color 0.2s;box-sizing:border-box;"
                    onfocus="this.style.borderColor='var(--color-primary)'" onblur="this.style.borderColor='var(--glass-border)'"></textarea>
                </div>

                <!-- Grid 2 cột -->
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem;">
                  <div>
                    <label style="display:block;font-size:0.82rem;font-weight:600;color:var(--text-muted);margin-bottom:6px;">Quốc gia</label>
                    <input type="text" id="pub-country" placeholder="Việt Nam" 
                      style="width:100%;padding:0.75rem 1rem;border-radius:12px;border:1px solid var(--glass-border);background:var(--bg-main);color:var(--text-main);font-family:var(--font-sans);font-size:0.9rem;outline:none;box-sizing:border-box;" />
                  </div>
                  <div>
                    <label style="display:block;font-size:0.82rem;font-weight:600;color:var(--text-muted);margin-bottom:6px;">Ngôn ngữ</label>
                    <select id="pub-language" style="width:100%;padding:0.75rem 1rem;border-radius:12px;border:1px solid var(--glass-border);background:var(--bg-main);color:var(--text-main);font-family:var(--font-sans);font-size:0.9rem;cursor:pointer;box-sizing:border-box;">
                      <option value="VN">Tiếng Việt</option>
                      <option value="EN">Tiếng Anh</option>
                      <option value="FR">Tiếng Pháp</option>
                      <option value="JP">Tiếng Nhật</option>
                      <option value="KR">Tiếng Hàn</option>
                      <option value="OTHER">Khác</option>
                    </select>
                  </div>
                </div>

                <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:1rem;">
                  <div>
                    <label style="display:block;font-size:0.82rem;font-weight:600;color:var(--text-muted);margin-bottom:6px;">Số trang</label>
                    <input type="number" id="pub-pages" placeholder="0" min="1"
                      style="width:100%;padding:0.75rem 1rem;border-radius:12px;border:1px solid var(--glass-border);background:var(--bg-main);color:var(--text-main);font-family:var(--font-sans);font-size:0.9rem;outline:none;box-sizing:border-box;" />
                  </div>
                  <div>
                    <label style="display:block;font-size:0.82rem;font-weight:600;color:var(--text-muted);margin-bottom:6px;">Năm xuất bản</label>
                    <input type="number" id="pub-year" placeholder="2025"
                      style="width:100%;padding:0.75rem 1rem;border-radius:12px;border:1px solid var(--glass-border);background:var(--bg-main);color:var(--text-main);font-family:var(--font-sans);font-size:0.9rem;outline:none;box-sizing:border-box;" />
                  </div>
                  <div>
                    <label style="display:block;font-size:0.82rem;font-weight:600;color:var(--text-muted);margin-bottom:6px;">Thể loại</label>
                    <select id="pub-category" style="width:100%;padding:0.75rem 1rem;border-radius:12px;border:1px solid var(--glass-border);background:var(--bg-main);color:var(--text-main);font-family:var(--font-sans);font-size:0.9rem;cursor:pointer;box-sizing:border-box;">
                      <option value="">-- Chọn --</option>
                      ${this.categories.map(c => `<option value="${c.id}">${c.name}</option>`).join('')}
                    </select>
                  </div>
                </div>

                <!-- Nhà xuất bản + Thumbnail URL -->
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem;">
                  <div>
                    <label style="display:block;font-size:0.82rem;font-weight:600;color:var(--text-muted);margin-bottom:6px;">Nhà xuất bản</label>
                    <select id="pub-publisher" style="width:100%;padding:0.75rem 1rem;border-radius:12px;border:1px solid var(--glass-border);background:var(--bg-main);color:var(--text-main);font-family:var(--font-sans);font-size:0.9rem;cursor:pointer;box-sizing:border-box;">
                      <option value="">-- Không chọn --</option>
                      ${this.publishingHouses.map(p => `<option value="${p.id}">${p.name}</option>`).join('')}
                    </select>
                  </div>
                  <div>
                    <label style="display:block;font-size:0.82rem;font-weight:600;color:var(--text-muted);margin-bottom:6px;">URL ảnh bìa</label>
                    <input type="url" id="pub-thumb" placeholder="https://example.com/cover.jpg"
                      style="width:100%;padding:0.75rem 1rem;border-radius:12px;border:1px solid var(--glass-border);background:var(--bg-main);color:var(--text-main);font-family:var(--font-sans);font-size:0.9rem;outline:none;box-sizing:border-box;" />
                  </div>
                </div>
              </div>
            </div>

            <!-- Section: Upload Files -->
            <div style="margin-bottom:2rem;">
              <h3 style="font-size:1rem;margin:0 0 1.25rem;color:var(--color-secondary);display:flex;align-items:center;gap:8px;">
                <i class="fa-solid fa-cloud-arrow-up" style="font-size:0.9rem;"></i>
                Tải lên tệp tin
              </h3>
              
              <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:1rem;">
                <!-- PDF Upload -->
                <div class="upload-zone" id="zone-pdf" style="border:2px dashed var(--glass-border);border-radius:16px;padding:1.5rem 1rem;text-align:center;cursor:pointer;transition:all 0.3s;background:var(--bg-main);position:relative;">
                  <input type="file" id="file-pdf" accept=".pdf" style="display:none;" />
                  <div style="width:48px;height:48px;border-radius:12px;background:rgba(124,58,237,0.15);display:flex;align-items:center;justify-content:center;margin:0 auto 0.75rem;font-size:1.2rem;color:var(--color-primary);">
                    <i class="fa-solid fa-file-pdf"></i>
                  </div>
                  <p id="pdf-label" style="font-size:0.8rem;font-weight:600;margin:0 0 0.25rem;color:var(--text-main);">Tệp PDF sách</p>
                  <p style="font-size:0.68rem;color:var(--text-muted);margin:0;">Kéo thả hoặc nhấn để chọn</p>
                  <p style="font-size:0.6rem;color:var(--text-muted);margin:0.3rem 0 0;"><i class="fa-solid fa-info-circle"></i> Định dạng: .pdf</p>
                </div>

                <!-- Audio Upload -->
                <div class="upload-zone" id="zone-audio" style="border:2px dashed var(--glass-border);border-radius:16px;padding:1.5rem 1rem;text-align:center;cursor:pointer;transition:all 0.3s;background:var(--bg-main);position:relative;">
                  <input type="file" id="file-audio" accept=".mp3,.wav,.ogg,.m4a,.flac" style="display:none;" />
                  <div style="width:48px;height:48px;border-radius:12px;background:rgba(236,72,153,0.15);display:flex;align-items:center;justify-content:center;margin:0 auto 0.75rem;font-size:1.2rem;color:var(--color-secondary);">
                    <i class="fa-solid fa-headphones"></i>
                  </div>
                  <p id="audio-label" style="font-size:0.8rem;font-weight:600;margin:0 0 0.25rem;color:var(--text-main);">Tệp Audio</p>
                  <p style="font-size:0.68rem;color:var(--text-muted);margin:0;">Kéo thả hoặc nhấn để chọn</p>
                  <p style="font-size:0.6rem;color:var(--text-muted);margin:0.3rem 0 0;"><i class="fa-solid fa-info-circle"></i> .mp3, .wav, .ogg, .m4a</p>
                </div>

                <!-- Copyright ZIP Upload -->
                <div class="upload-zone" id="zone-copyright" style="border:2px dashed var(--glass-border);border-radius:16px;padding:1.5rem 1rem;text-align:center;cursor:pointer;transition:all 0.3s;background:var(--bg-main);position:relative;">
                  <input type="file" id="file-copyright" accept=".zip,.rar,.7z" style="display:none;" />
                  <div style="width:48px;height:48px;border-radius:12px;background:rgba(255,165,0,0.15);display:flex;align-items:center;justify-content:center;margin:0 auto 0.75rem;font-size:1.2rem;color:#ffa500;">
                    <i class="fa-solid fa-file-zipper"></i>
                  </div>
                  <p id="copyright-label" style="font-size:0.8rem;font-weight:600;margin:0 0 0.25rem;color:var(--text-main);">Giấy tờ bản quyền</p>
                  <p style="font-size:0.68rem;color:var(--text-muted);margin:0;">Kéo thả hoặc nhấn để chọn</p>
                  <p style="font-size:0.6rem;color:var(--text-muted);margin:0.3rem 0 0;"><i class="fa-solid fa-info-circle"></i> .zip, .rar, .7z</p>
                </div>
              </div>
            </div>

            <!-- eBook URL (optional fallback) -->
            <div style="margin-bottom:2rem;">
              <label style="display:block;font-size:0.82rem;font-weight:600;color:var(--text-muted);margin-bottom:6px;">
                <i class="fa-solid fa-link" style="margin-right:4px;"></i> URL tệp eBook (nếu hosted online)
              </label>
              <input type="url" id="pub-ebook-url" placeholder="https://example.com/book.pdf"
                style="width:100%;padding:0.75rem 1rem;border-radius:12px;border:1px solid var(--glass-border);background:var(--bg-main);color:var(--text-main);font-family:var(--font-sans);font-size:0.9rem;outline:none;box-sizing:border-box;" />
            </div>

            <!-- Notice -->
            <div style="background:linear-gradient(135deg,rgba(255,165,0,0.08),rgba(255,107,53,0.08));border:1px solid rgba(255,165,0,0.25);border-radius:14px;padding:1rem 1.25rem;margin-bottom:2rem;display:flex;gap:0.75rem;align-items:flex-start;">
              <i class="fa-solid fa-triangle-exclamation" style="color:#ffa500;font-size:1.1rem;margin-top:2px;flex-shrink:0;"></i>
              <div>
                <p style="font-size:0.82rem;font-weight:600;margin:0 0 0.25rem;color:var(--text-main);">Lưu ý quan trọng</p>
                <p style="font-size:0.75rem;color:var(--text-muted);margin:0;line-height:1.6;">
                  Sau khi gửi, sách sẽ ở trạng thái <strong style="color:#ffa500;">Chờ duyệt (PENDING)</strong>. 
                  Quản trị viên sẽ xem xét nội dung và giấy tờ bản quyền trước khi phê duyệt hiển thị. 
                  Bạn sẽ nhận được thông báo khi sách được duyệt.
                </p>
              </div>
            </div>

            <!-- Submit -->
            <div style="display:flex;gap:1rem;justify-content:flex-end;">
              <button type="button" id="cancel-publish" class="btn" style="background:var(--bg-main);border:1px solid var(--glass-border);color:var(--text-muted);padding:0.75rem 1.5rem;">
                <i class="fa-solid fa-xmark"></i> Hủy bỏ
              </button>
              <button type="submit" id="submit-publish" class="btn btn-primary" style="padding:0.75rem 2rem;display:flex;align-items:center;gap:8px;">
                <i class="fa-solid fa-paper-plane"></i> Gửi duyệt
              </button>
            </div>
          </form>
        </div>
      </div>
    `;
  }

  reRender() {
    const container = document.getElementById('author-dashboard');
    if (!container || this.isLoading) return;

    if (!this.authorData) {
      container.innerHTML = `<div class="glass-panel" style="padding:3rem;text-align:center;"><p style="color:#ff4757;"><i class="fa-solid fa-circle-exclamation fa-2x"></i></p><p style="margin-top:1rem;">Không tìm thấy thông tin tác giả cho tài khoản này.</p></div>`;
      return;
    }

    const a = this.authorData;
    const avatarUrl = a.imagineUrl || `https://ui-avatars.com/api/?name=${a.firstName}+${a.lastName}&background=7c3aed&color=fff`;

    const approvedBooks = this.authorBooks.filter(b => b.approvalStatus === 'APPROVED');
    const pendingBooks = this.authorBooks.filter(b => b.approvalStatus === 'PENDING');
    const rejectedBooks = this.authorBooks.filter(b => b.approvalStatus === 'REJECTED');

    container.innerHTML = `
      <!-- Author Profile Header -->
      <div class="glass-panel" style="padding:2rem;display:flex;gap:2rem;align-items:center;margin-bottom:2rem;background:linear-gradient(135deg,hsla(260,50%,15%,0.7),hsla(320,50%,15%,0.7));">
        <img src="${avatarUrl}" style="width:100px;height:100px;border-radius:50%;object-fit:cover;border:3px solid var(--color-primary);box-shadow:var(--shadow-glow);" />
        <div style="flex:1;">
          <h2 style="margin-bottom:0.25rem;">${a.firstName} ${a.lastName}</h2>
          <p style="color:var(--text-muted);font-size:0.9rem;margin-bottom:0.75rem;">${a.description ? a.description.substring(0,140) + '...' : ''}</p>
          <span style="background:var(--color-accent);color:#000;padding:3px 10px;border-radius:20px;font-size:0.75rem;font-weight:700;"><i class="fa-solid fa-pen-nib"></i> TÁC GIẢ</span>
        </div>
        <button class="btn btn-primary" id="btn-open-publish" style="display:flex;align-items:center;gap:8px;white-space:nowrap;">
          <i class="fa-solid fa-plus"></i> Đăng sách mới
        </button>
      </div>

      <!-- Stats Row -->
      <div style="display:grid;grid-template-columns:repeat(5,1fr);gap:1.25rem;margin-bottom:2rem;">
        <div class="glass-card" style="padding:1.5rem;display:flex;align-items:center;gap:1rem;">
          <div style="width:52px;height:52px;border-radius:14px;background:hsla(260,80%,60%,0.15);display:flex;align-items:center;justify-content:center;font-size:1.4rem;color:var(--color-primary);flex-shrink:0;">
            <i class="fa-solid fa-book"></i>
          </div>
          <div><p style="color:var(--text-muted);font-size:0.8rem;margin-bottom:2px;">Tổng tác phẩm</p><h3 style="margin:0;font-size:1.6rem;">${this.authorBooks.length}</h3></div>
        </div>
        <div class="glass-card" style="padding:1.5rem;display:flex;align-items:center;gap:1rem;">
          <div style="width:52px;height:52px;border-radius:14px;background:hsla(120,70%,45%,0.15);display:flex;align-items:center;justify-content:center;font-size:1.4rem;color:#2ed573;flex-shrink:0;">
            <i class="fa-solid fa-circle-check"></i>
          </div>
          <div><p style="color:var(--text-muted);font-size:0.8rem;margin-bottom:2px;">Đã duyệt</p><h3 style="margin:0;font-size:1.6rem;">${approvedBooks.length}</h3></div>
        </div>
        <div class="glass-card" style="padding:1.5rem;display:flex;align-items:center;gap:1rem;">
          <div style="width:52px;height:52px;border-radius:14px;background:hsla(38,100%,50%,0.15);display:flex;align-items:center;justify-content:center;font-size:1.4rem;color:#ffa500;flex-shrink:0;">
            <i class="fa-solid fa-clock"></i>
          </div>
          <div><p style="color:var(--text-muted);font-size:0.8rem;margin-bottom:2px;">Chờ duyệt</p><h3 style="margin:0;font-size:1.6rem;">${pendingBooks.length}</h3></div>
        </div>
        <div class="glass-card" style="padding:1.5rem;display:flex;align-items:center;gap:1rem;">
          <div style="width:52px;height:52px;border-radius:14px;background:hsla(190,90%,50%,0.15);display:flex;align-items:center;justify-content:center;font-size:1.4rem;color:var(--color-accent);flex-shrink:0;">
            <i class="fa-solid fa-star"></i>
          </div>
          <div><p style="color:var(--text-muted);font-size:0.8rem;margin-bottom:2px;">Đánh giá TB</p><h3 style="margin:0;font-size:1.6rem;">${this._avgRating()} <span style="font-size:0.85rem;color:#ffd700;">★</span></h3></div>
        </div>
        <div class="glass-card" style="padding:1.5rem;display:flex;align-items:center;gap:1rem;">
          <div style="width:52px;height:52px;border-radius:14px;background:hsla(50,100%,50%,0.1);display:flex;align-items:center;justify-content:center;font-size:1.4rem;color:#ffd700;flex-shrink:0;">
            <i class="fa-solid fa-comments"></i>
          </div>
          <div><p style="color:var(--text-muted);font-size:0.8rem;margin-bottom:2px;">Bình luận</p><h3 style="margin:0;font-size:1.6rem;">${this.allComments.length}</h3></div>
        </div>
      </div>

      <!-- Books Table + Comments -->
      <div style="display:grid;grid-template-columns:3fr 2fr;gap:2rem;">

        <!-- Books table -->
        <div class="glass-panel" style="padding:1.75rem;">
          <h3 style="margin-bottom:1.25rem;"><i class="fa-solid fa-book-open" style="color:var(--color-primary);"></i> Sách của tôi</h3>
          ${this.authorBooks.length === 0
            ? `<p style="color:var(--text-muted);text-align:center;padding:2rem;">Bạn chưa đăng tải sách nào. <br/><button class="btn btn-primary" style="margin-top:1rem;" id="btn-open-publish-2">Đăng ngay</button></p>`
            : `<table style="width:100%;border-collapse:collapse;">
              <thead>
                <tr style="border-bottom:1px solid var(--glass-border);">
                  <th style="padding:0.75rem;color:var(--text-muted);font-weight:500;text-align:left;font-size:0.85rem;">Tác phẩm</th>
                  <th style="padding:0.75rem;color:var(--text-muted);font-weight:500;text-align:center;font-size:0.85rem;">Năm</th>
                  <th style="padding:0.75rem;color:var(--text-muted);font-weight:500;text-align:center;font-size:0.85rem;">Trạng thái</th>
                  <th style="padding:0.75rem;color:var(--text-muted);font-weight:500;text-align:right;font-size:0.85rem;">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                ${this.authorBooks.map(book => `
                  <tr style="border-bottom:1px solid rgba(255,255,255,0.04);transition:background 0.2s;"
                    onmouseover="this.style.background='var(--bg-main)'" onmouseout="this.style.background='transparent'">
                    <td style="padding:0.875rem;display:flex;align-items:center;gap:0.75rem;">
                      <img src="${book.thumbnailUrl || 'https://ui-avatars.com/api/?name=Book&background=333&color=fff'}" style="width:38px;height:56px;object-fit:cover;border-radius:5px;flex-shrink:0;" />
                      <div>
                        <div style="font-weight:600;font-size:0.9rem;">${book.name}</div>
                        <div style="font-size:0.75rem;color:var(--text-muted);">${book.country || ''}</div>
                      </div>
                    </td>
                    <td style="padding:0.875rem;text-align:center;font-size:0.85rem;">${book.releaseDate || '–'}</td>
                    <td style="padding:0.875rem;text-align:center;">${this._statusBadge(book.approvalStatus || 'APPROVED')}</td>
                    <td style="padding:0.875rem;text-align:right;white-space:nowrap;">
                      <button class="btn-icon btn-edit-book" data-bookid="${book.id}" style="width:32px;height:32px;font-size:0.8rem;" title="Chỉnh sửa"><i class="fa-solid fa-pen"></i></button>
                      <button class="btn-icon btn-delete-book" data-bookid="${book.id}" style="width:32px;height:32px;font-size:0.8rem;color:#ff4757;" title="Xóa"><i class="fa-solid fa-trash"></i></button>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>`
          }
        </div>

        <!-- Comments -->
        <div class="glass-panel" style="padding:1.75rem;">
          <h3 style="margin-bottom:1.25rem;"><i class="fa-solid fa-message" style="color:var(--color-secondary);"></i> Bình luận mới nhất</h3>
          <div style="display:flex;flex-direction:column;gap:0.75rem;max-height:450px;overflow-y:auto;">
            ${this.allComments.length === 0
              ? `<p style="color:var(--text-muted);text-align:center;padding:2rem;">Chưa có bình luận nào.</p>`
              : this.allComments.map(c => {
                  const book = this.allBooks.find(b => b.id === c.bookId);
                  const user = this.allUsers.find(u => u.id === c.userId);
                  const stars = '★'.repeat(Math.floor(c.rating));
                  return `
                    <div style="background:var(--bg-main);padding:0.875rem;border-radius:10px;border-left:3px solid var(--color-primary);">
                      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:0.3rem;">
                        <span style="font-size:0.82rem;font-weight:600;">@${user?.username || 'user'}</span>
                        <span style="color:#ffd700;font-size:0.8rem;">${stars} ${c.rating}</span>
                      </div>
                      <p style="font-size:0.82rem;color:var(--text-main);margin-bottom:0.25rem;font-weight:600;">${c.title}</p>
                      <p style="font-size:0.8rem;color:var(--text-muted);margin-bottom:0.3rem;">${c.content}</p>
                      <p style="font-size:0.72rem;color:var(--color-primary);">📖 ${book?.name || ''}</p>
                    </div>
                  `;
                }).join('')
            }
          </div>
        </div>
      </div>
    `;

    // Attach events
    this._attachEvents();
  }

  _attachEvents() {
    // Open publish modal
    const openBtn = document.getElementById('btn-open-publish');
    const openBtn2 = document.getElementById('btn-open-publish-2');
    [openBtn, openBtn2].forEach(btn => {
      btn?.addEventListener('click', () => this._openPublishModal());
    });

    // Edit book buttons
    document.querySelectorAll('.btn-edit-book').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const bookId = parseInt(btn.dataset.bookid);
        const book = this.authorBooks.find(b => b.id === bookId);
        if (book) this._openEditModal(book);
      });
    });

    // Delete book buttons
    document.querySelectorAll('.btn-delete-book').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const bookId = parseInt(btn.dataset.bookid);
        const book = this.authorBooks.find(b => b.id === bookId);
        if (book) this._openDeleteModal(book);
      });
    });
  }

  _openPublishModal() {
    // Remove existing modal if any
    document.getElementById('publish-modal-overlay')?.remove();
    
    // Inject modal styles
    if (!document.getElementById('publish-modal-style')) {
      const st = document.createElement('style');
      st.id = 'publish-modal-style';
      st.textContent = `
        @keyframes fadeIn { from { opacity:0; } to { opacity:1; } }
        @keyframes slideUp { from { opacity:0; transform:translateY(30px) scale(0.97); } to { opacity:1; transform:translateY(0) scale(1); } }
        @keyframes successPulse { 0%,100% { transform:scale(1); } 50% { transform:scale(1.05); } }
        .upload-zone:hover { border-color: var(--color-primary) !important; background: rgba(124,58,237,0.05) !important; }
        .upload-zone.drag-over { border-color: var(--color-primary) !important; background: rgba(124,58,237,0.1) !important; transform:scale(1.02); }
        .upload-zone.has-file { border-color: #2ed573 !important; border-style: solid !important; }
        .upload-zone.has-file .upload-icon { color: #2ed573 !important; background: rgba(46,213,115,0.15) !important; }
        #publish-modal::-webkit-scrollbar { width: 6px; }
        #publish-modal::-webkit-scrollbar-thumb { background: var(--glass-border); border-radius: 3px; }
      `;
      document.head.appendChild(st);
    }

    // Insert modal
    const modalDiv = document.createElement('div');
    modalDiv.innerHTML = this._publishModalHTML();
    document.body.appendChild(modalDiv.firstElementChild);

    // Close modal handlers
    document.getElementById('close-publish-modal')?.addEventListener('click', () => this._closePublishModal());
    document.getElementById('cancel-publish')?.addEventListener('click', () => this._closePublishModal());
    document.getElementById('publish-modal-overlay')?.addEventListener('click', (e) => {
      if (e.target.id === 'publish-modal-overlay') this._closePublishModal();
    });

    // File upload zones
    this._setupUploadZone('zone-pdf', 'file-pdf', 'pdf-label');
    this._setupUploadZone('zone-audio', 'file-audio', 'audio-label');
    this._setupUploadZone('zone-copyright', 'file-copyright', 'copyright-label');

    // Form submission
    document.getElementById('publish-book-form')?.addEventListener('submit', (e) => {
      e.preventDefault();
      this._submitBook();
    });
  }

  _setupUploadZone(zoneId, inputId, labelId) {
    const zone = document.getElementById(zoneId);
    const input = document.getElementById(inputId);
    const label = document.getElementById(labelId);
    if (!zone || !input) return;

    // Click to upload
    zone.addEventListener('click', () => input.click());

    // Drag & drop
    zone.addEventListener('dragover', (e) => { e.preventDefault(); zone.classList.add('drag-over'); });
    zone.addEventListener('dragleave', () => zone.classList.remove('drag-over'));
    zone.addEventListener('drop', (e) => {
      e.preventDefault();
      zone.classList.remove('drag-over');
      if (e.dataTransfer.files.length > 0) {
        input.files = e.dataTransfer.files;
        this._updateFileLabel(zone, label, e.dataTransfer.files[0]);
      }
    });

    // File selected
    input.addEventListener('change', () => {
      if (input.files.length > 0) {
        this._updateFileLabel(zone, label, input.files[0]);
      }
    });
  }

  _updateFileLabel(zone, label, file) {
    if (!label || !file) return;
    const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
    label.innerHTML = `<i class="fa-solid fa-check-circle" style="color:#2ed573;margin-right:4px;"></i> ${file.name.length > 20 ? file.name.substring(0,17) + '...' : file.name} <span style="color:var(--text-muted);font-size:0.65rem;">(${sizeMB}MB)</span>`;
    zone.classList.add('has-file');
  }

  async _submitBook() {
    const currentUser = AuthService.getUser();
    if (!currentUser) return;

    const submitBtn = document.getElementById('submit-publish');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Đang gửi...';
    submitBtn.disabled = true;

    const payload = {
      name: document.getElementById('pub-name')?.value?.trim(),
      description: document.getElementById('pub-desc')?.value?.trim(),
      country: document.getElementById('pub-country')?.value?.trim() || '',
      language: document.getElementById('pub-language')?.value || 'VN',
      pageNumber: document.getElementById('pub-pages')?.value || 0,
      releaseDate: document.getElementById('pub-year')?.value ? parseInt(document.getElementById('pub-year').value) : null,
      categoryId: document.getElementById('pub-category')?.value || null,
      PublishingHouseId: document.getElementById('pub-publisher')?.value || null,
      thumbnailUrl: document.getElementById('pub-thumb')?.value?.trim() || '',
      ebookFileUrl: document.getElementById('pub-ebook-url')?.value?.trim() || '',
      authorId: currentUser.authorId,
      submittedByUserId: currentUser.id,
      // Files would be uploaded to a real server; here we store filenames as references
      audioFileUrl: document.getElementById('file-audio')?.files?.[0]?.name || '',
      copyrightFileUrl: document.getElementById('file-copyright')?.files?.[0]?.name || '',
    };

    if (!payload.name) {
      alert('Vui lòng nhập tên sách!');
      submitBtn.innerHTML = originalText;
      submitBtn.disabled = false;
      return;
    }

    try {
      const res = await fetch('/api/books/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const result = await res.json();

      if (result.success) {
        // Show success state
        const modal = document.getElementById('publish-modal');
        if (modal) {
          modal.innerHTML = `
            <div style="padding:4rem 3rem;text-align:center;animation:successPulse 0.6s ease;">
              <div style="width:80px;height:80px;border-radius:50%;background:linear-gradient(135deg,rgba(46,213,115,0.2),rgba(20,184,166,0.2));display:flex;align-items:center;justify-content:center;margin:0 auto 1.5rem;font-size:2.5rem;">
                <i class="fa-solid fa-check-circle" style="color:#2ed573;"></i>
              </div>
              <h2 style="margin:0 0 0.5rem;font-family:'Playfair Display',serif;">Gửi duyệt thành công!</h2>
              <p style="color:var(--text-muted);font-size:0.9rem;margin:0 0 0.5rem;">
                Sách <strong style="color:var(--text-main);">"${payload.name}"</strong> đã được gửi đi.
              </p>
              <div style="display:inline-flex;align-items:center;gap:6px;background:rgba(255,165,0,0.12);border:1px solid rgba(255,165,0,0.3);padding:6px 16px;border-radius:20px;margin:1rem 0 2rem;">
                <i class="fa-solid fa-clock" style="color:#ffa500;font-size:0.8rem;"></i>
                <span style="font-size:0.82rem;color:#ffa500;font-weight:600;">Trạng thái: Chờ duyệt (PENDING)</span>
              </div>
              <br/>
              <button class="btn btn-primary" id="close-success-modal" style="padding:0.75rem 2rem;">
                <i class="fa-solid fa-check"></i> Đóng
              </button>
            </div>
          `;
          document.getElementById('close-success-modal')?.addEventListener('click', () => {
            this._closePublishModal();
            this.fetchData(); // Reload data
          });
        }
      } else {
        alert('Có lỗi xảy ra khi gửi sách. Vui lòng thử lại.');
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
      }
    } catch (err) {
      console.error('Submit book error:', err);
      alert('Có lỗi kết nối. Vui lòng thử lại.');
      submitBtn.innerHTML = originalText;
      submitBtn.disabled = false;
    }
  }

  _closePublishModal() {
    const overlay = document.getElementById('publish-modal-overlay');
    if (overlay) {
      overlay.style.animation = 'fadeIn 0.2s ease reverse';
      setTimeout(() => overlay.remove(), 200);
    }
  }

  _escapeAttr(str) {
    return String(str || '').replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/'/g, '&#39;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  // ═══════════════════════════════════════════════════
  // ── EDIT MODAL HTML ────────────────────────────────
  // ═══════════════════════════════════════════════════
  _editModalHTML(book) {
    const currentCatId = book.categoryId || '';
    return `
      <div id="edit-modal-overlay" style="position:fixed;inset:0;background:rgba(0,0,0,0.7);backdrop-filter:blur(8px);z-index:9999;display:flex;align-items:center;justify-content:center;animation:fadeIn 0.3s ease;">
        <div id="edit-modal" style="background:var(--bg-panel);border:1px solid var(--glass-border);border-radius:24px;width:95%;max-width:800px;max-height:90vh;overflow-y:auto;box-shadow:0 40px 80px rgba(0,0,0,0.5);animation:slideUp 0.4s cubic-bezier(0.22,1,0.36,1);">
          <div style="padding:2rem 2.5rem 1.5rem;border-bottom:1px solid var(--glass-border);display:flex;align-items:center;justify-content:space-between;position:sticky;top:0;background:var(--bg-panel);z-index:10;border-radius:24px 24px 0 0;">
            <div>
              <h2 style="margin:0;font-size:1.4rem;font-family:'Playfair Display',serif;">
                <i class="fa-solid fa-pen-to-square" style="color:var(--color-accent);margin-right:8px;"></i>
                Chỉnh sửa sách
              </h2>
              <p style="color:var(--text-muted);font-size:0.82rem;margin:0.3rem 0 0;">Cập nhật thông tin và gửi lại duyệt</p>
            </div>
            <button id="close-edit-modal" class="btn-icon" style="width:40px;height:40px;font-size:1.1rem;flex-shrink:0;">
              <i class="fa-solid fa-xmark"></i>
            </button>
          </div>
          <form id="edit-book-form" style="padding:2rem 2.5rem;">
            <input type="hidden" id="edit-book-id" value="${book.id}" />
            <div style="margin-bottom:2rem;">
              <h3 style="font-size:1rem;margin:0 0 1.25rem;color:var(--color-primary);display:flex;align-items:center;gap:8px;">
                <i class="fa-solid fa-info-circle" style="font-size:0.9rem;"></i> Thông tin cơ bản
              </h3>
              <div style="display:grid;grid-template-columns:1fr;gap:1.25rem;">
                <div>
                  <label style="display:block;font-size:0.82rem;font-weight:600;color:var(--text-muted);margin-bottom:6px;">Tên sách <span style="color:#ff4757;">*</span></label>
                  <input type="text" id="edit-name" required value="${this._escapeAttr(book.name)}"
                    style="width:100%;padding:0.75rem 1rem;border-radius:12px;border:1px solid var(--glass-border);background:var(--bg-main);color:var(--text-main);font-family:var(--font-sans);font-size:0.9rem;outline:none;transition:border-color 0.2s;box-sizing:border-box;"
                    onfocus="this.style.borderColor='var(--color-primary)'" onblur="this.style.borderColor='var(--glass-border)'" />
                </div>
                <div>
                  <label style="display:block;font-size:0.82rem;font-weight:600;color:var(--text-muted);margin-bottom:6px;">Mô tả sách <span style="color:#ff4757;">*</span></label>
                  <textarea id="edit-desc" required rows="4"
                    style="width:100%;padding:0.75rem 1rem;border-radius:12px;border:1px solid var(--glass-border);background:var(--bg-main);color:var(--text-main);font-family:var(--font-sans);font-size:0.9rem;outline:none;resize:vertical;transition:border-color 0.2s;box-sizing:border-box;"
                    onfocus="this.style.borderColor='var(--color-primary)'" onblur="this.style.borderColor='var(--glass-border)'">${this._escapeAttr(book.description)}</textarea>
                </div>
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem;">
                  <div>
                    <label style="display:block;font-size:0.82rem;font-weight:600;color:var(--text-muted);margin-bottom:6px;">Quốc gia</label>
                    <input type="text" id="edit-country" value="${this._escapeAttr(book.country)}"
                      style="width:100%;padding:0.75rem 1rem;border-radius:12px;border:1px solid var(--glass-border);background:var(--bg-main);color:var(--text-main);font-family:var(--font-sans);font-size:0.9rem;outline:none;box-sizing:border-box;" />
                  </div>
                  <div>
                    <label style="display:block;font-size:0.82rem;font-weight:600;color:var(--text-muted);margin-bottom:6px;">Ngôn ngữ</label>
                    <select id="edit-language" style="width:100%;padding:0.75rem 1rem;border-radius:12px;border:1px solid var(--glass-border);background:var(--bg-main);color:var(--text-main);font-family:var(--font-sans);font-size:0.9rem;cursor:pointer;box-sizing:border-box;">
                      <option value="VN" ${book.language === 'VN' ? 'selected' : ''}>Tiếng Việt</option>
                      <option value="EN" ${book.language === 'EN' ? 'selected' : ''}>Tiếng Anh</option>
                      <option value="FR" ${book.language === 'FR' ? 'selected' : ''}>Tiếng Pháp</option>
                      <option value="JP" ${book.language === 'JP' ? 'selected' : ''}>Tiếng Nhật</option>
                      <option value="KR" ${book.language === 'KR' ? 'selected' : ''}>Tiếng Hàn</option>
                      <option value="OTHER" ${book.language === 'OTHER' ? 'selected' : ''}>Khác</option>
                    </select>
                  </div>
                </div>
                <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:1rem;">
                  <div>
                    <label style="display:block;font-size:0.82rem;font-weight:600;color:var(--text-muted);margin-bottom:6px;">Số trang</label>
                    <input type="number" id="edit-pages" value="${book.pageNumber || ''}" min="1"
                      style="width:100%;padding:0.75rem 1rem;border-radius:12px;border:1px solid var(--glass-border);background:var(--bg-main);color:var(--text-main);font-family:var(--font-sans);font-size:0.9rem;outline:none;box-sizing:border-box;" />
                  </div>
                  <div>
                    <label style="display:block;font-size:0.82rem;font-weight:600;color:var(--text-muted);margin-bottom:6px;">Năm xuất bản</label>
                    <input type="number" id="edit-year" value="${book.releaseDate || ''}"
                      style="width:100%;padding:0.75rem 1rem;border-radius:12px;border:1px solid var(--glass-border);background:var(--bg-main);color:var(--text-main);font-family:var(--font-sans);font-size:0.9rem;outline:none;box-sizing:border-box;" />
                  </div>
                  <div>
                    <label style="display:block;font-size:0.82rem;font-weight:600;color:var(--text-muted);margin-bottom:6px;">Thể loại</label>
                    <select id="edit-category" style="width:100%;padding:0.75rem 1rem;border-radius:12px;border:1px solid var(--glass-border);background:var(--bg-main);color:var(--text-main);font-family:var(--font-sans);font-size:0.9rem;cursor:pointer;box-sizing:border-box;">
                      <option value="">-- Chọn --</option>
                      ${this.categories.map(c => `<option value="${c.id}" ${String(currentCatId) === String(c.id) ? 'selected' : ''}>${c.name}</option>`).join('')}
                    </select>
                  </div>
                </div>
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem;">
                  <div>
                    <label style="display:block;font-size:0.82rem;font-weight:600;color:var(--text-muted);margin-bottom:6px;">Nhà xuất bản</label>
                    <select id="edit-publisher" style="width:100%;padding:0.75rem 1rem;border-radius:12px;border:1px solid var(--glass-border);background:var(--bg-main);color:var(--text-main);font-family:var(--font-sans);font-size:0.9rem;cursor:pointer;box-sizing:border-box;">
                      <option value="">-- Không chọn --</option>
                      ${this.publishingHouses.map(p => `<option value="${p.id}" ${book.PublishingHouseId === p.id ? 'selected' : ''}>${p.name}</option>`).join('')}
                    </select>
                  </div>
                  <div>
                    <label style="display:block;font-size:0.82rem;font-weight:600;color:var(--text-muted);margin-bottom:6px;">URL ảnh bìa</label>
                    <input type="url" id="edit-thumb" value="${this._escapeAttr(book.thumbnailUrl)}"
                      style="width:100%;padding:0.75rem 1rem;border-radius:12px;border:1px solid var(--glass-border);background:var(--bg-main);color:var(--text-main);font-family:var(--font-sans);font-size:0.9rem;outline:none;box-sizing:border-box;" />
                  </div>
                </div>
              </div>
            </div>

            <div style="margin-bottom:2rem;">
              <h3 style="font-size:1rem;margin:0 0 1.25rem;color:var(--color-secondary);display:flex;align-items:center;gap:8px;">
                <i class="fa-solid fa-cloud-arrow-up" style="font-size:0.9rem;"></i> Tải lên tệp tin (thay thế)
              </h3>
              <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:1rem;">
                <div class="upload-zone ${book.ebookFileUrl ? 'has-file' : ''}" id="edit-zone-pdf" style="border:2px dashed var(--glass-border);border-radius:16px;padding:1.5rem 1rem;text-align:center;cursor:pointer;transition:all 0.3s;background:var(--bg-main);">
                  <input type="file" id="edit-file-pdf" accept=".pdf" style="display:none;" />
                  <div class="upload-icon" style="width:48px;height:48px;border-radius:12px;background:rgba(124,58,237,0.15);display:flex;align-items:center;justify-content:center;margin:0 auto 0.75rem;font-size:1.2rem;color:var(--color-primary);"><i class="fa-solid fa-file-pdf"></i></div>
                  <p id="edit-pdf-label" style="font-size:0.8rem;font-weight:600;margin:0 0 0.25rem;color:var(--text-main);">${book.ebookFileUrl ? '<i class="fa-solid fa-check-circle" style="color:#2ed573;"></i> Đã có tệp' : 'Tệp PDF sách'}</p>
                  <p style="font-size:0.68rem;color:var(--text-muted);margin:0;">Nhấn để thay thế</p>
                </div>
                <div class="upload-zone ${book.audioFileUrl ? 'has-file' : ''}" id="edit-zone-audio" style="border:2px dashed var(--glass-border);border-radius:16px;padding:1.5rem 1rem;text-align:center;cursor:pointer;transition:all 0.3s;background:var(--bg-main);">
                  <input type="file" id="edit-file-audio" accept=".mp3,.wav,.ogg,.m4a,.flac" style="display:none;" />
                  <div class="upload-icon" style="width:48px;height:48px;border-radius:12px;background:rgba(236,72,153,0.15);display:flex;align-items:center;justify-content:center;margin:0 auto 0.75rem;font-size:1.2rem;color:var(--color-secondary);"><i class="fa-solid fa-headphones"></i></div>
                  <p id="edit-audio-label" style="font-size:0.8rem;font-weight:600;margin:0 0 0.25rem;color:var(--text-main);">${book.audioFileUrl ? '<i class="fa-solid fa-check-circle" style="color:#2ed573;"></i> Đã có tệp' : 'Tệp Audio'}</p>
                  <p style="font-size:0.68rem;color:var(--text-muted);margin:0;">Nhấn để thay thế</p>
                </div>
                <div class="upload-zone ${book.copyrightFileUrl ? 'has-file' : ''}" id="edit-zone-copyright" style="border:2px dashed var(--glass-border);border-radius:16px;padding:1.5rem 1rem;text-align:center;cursor:pointer;transition:all 0.3s;background:var(--bg-main);">
                  <input type="file" id="edit-file-copyright" accept=".zip,.rar,.7z" style="display:none;" />
                  <div class="upload-icon" style="width:48px;height:48px;border-radius:12px;background:rgba(255,165,0,0.15);display:flex;align-items:center;justify-content:center;margin:0 auto 0.75rem;font-size:1.2rem;color:#ffa500;"><i class="fa-solid fa-file-zipper"></i></div>
                  <p id="edit-copyright-label" style="font-size:0.8rem;font-weight:600;margin:0 0 0.25rem;color:var(--text-main);">${book.copyrightFileUrl ? '<i class="fa-solid fa-check-circle" style="color:#2ed573;"></i> Đã có tệp' : 'Giấy tờ bản quyền'}</p>
                  <p style="font-size:0.68rem;color:var(--text-muted);margin:0;">Nhấn để thay thế</p>
                </div>
              </div>
            </div>

            <div style="margin-bottom:2rem;">
              <label style="display:block;font-size:0.82rem;font-weight:600;color:var(--text-muted);margin-bottom:6px;">
                <i class="fa-solid fa-link" style="margin-right:4px;"></i> URL tệp eBook (nếu hosted online)
              </label>
              <input type="url" id="edit-ebook-url" value="${this._escapeAttr(book.ebookFileUrl)}" placeholder="https://example.com/book.pdf"
                style="width:100%;padding:0.75rem 1rem;border-radius:12px;border:1px solid var(--glass-border);background:var(--bg-main);color:var(--text-main);font-family:var(--font-sans);font-size:0.9rem;outline:none;box-sizing:border-box;" />
            </div>

            <div style="background:linear-gradient(135deg,rgba(6,182,212,0.08),rgba(124,58,237,0.08));border:1px solid rgba(6,182,212,0.25);border-radius:14px;padding:1rem 1.25rem;margin-bottom:2rem;display:flex;gap:0.75rem;align-items:flex-start;">
              <i class="fa-solid fa-circle-info" style="color:var(--color-accent);font-size:1.1rem;margin-top:2px;flex-shrink:0;"></i>
              <div>
                <p style="font-size:0.82rem;font-weight:600;margin:0 0 0.25rem;color:var(--text-main);">Lưu ý khi chỉnh sửa</p>
                <p style="font-size:0.75rem;color:var(--text-muted);margin:0;line-height:1.6;">
                  Sau khi lưu thay đổi, sách sẽ được đưa về trạng thái <strong style="color:#ffa500;">Chờ duyệt (PENDING)</strong>
                  và cần quản trị viên phê duyệt lại trước khi hiển thị cho độc giả.
                </p>
              </div>
            </div>

            <div style="display:flex;gap:1rem;justify-content:flex-end;">
              <button type="button" id="cancel-edit" class="btn" style="background:var(--bg-main);border:1px solid var(--glass-border);color:var(--text-muted);padding:0.75rem 1.5rem;">
                <i class="fa-solid fa-xmark"></i> Hủy bỏ
              </button>
              <button type="submit" id="submit-edit" class="btn btn-primary" style="padding:0.75rem 2rem;display:flex;align-items:center;gap:8px;">
                <i class="fa-solid fa-floppy-disk"></i> Lưu & Gửi duyệt lại
              </button>
            </div>
          </form>
        </div>
      </div>
    `;
  }

  // ═══════════════════════════════════════════════════
  // ── DELETE MODAL HTML (xác nhận bằng mật khẩu) ────
  // ═══════════════════════════════════════════════════
  _deleteModalHTML(book) {
    return `
      <div id="delete-modal-overlay" style="position:fixed;inset:0;background:rgba(0,0,0,0.75);backdrop-filter:blur(8px);z-index:9999;display:flex;align-items:center;justify-content:center;animation:fadeIn 0.3s ease;">
        <div style="background:var(--bg-panel);border:1px solid var(--glass-border);border-radius:24px;width:95%;max-width:460px;box-shadow:0 40px 80px rgba(0,0,0,0.6);animation:slideUp 0.4s cubic-bezier(0.22,1,0.36,1);overflow:hidden;">
          <div style="background:linear-gradient(135deg,rgba(255,71,87,0.15),rgba(255,107,53,0.08));padding:2rem;text-align:center;border-bottom:1px solid var(--glass-border);">
            <div style="width:70px;height:70px;border-radius:50%;background:rgba(255,71,87,0.15);border:2px solid rgba(255,71,87,0.3);display:flex;align-items:center;justify-content:center;margin:0 auto 1rem;">
              <i class="fa-solid fa-trash-can" style="font-size:1.8rem;color:#ff4757;"></i>
            </div>
            <h2 style="margin:0 0 0.5rem;font-size:1.3rem;color:#ff4757;">Xóa sách vĩnh viễn</h2>
            <p style="margin:0;color:var(--text-muted);font-size:0.85rem;line-height:1.5;">
              Bạn đang xóa <strong style="color:var(--text-main);">"${this._escapeAttr(book.name)}"</strong>.<br/>
              Thao tác này <strong style="color:#ff4757;">KHÔNG THỂ HOÀN TÁC</strong>.
            </p>
          </div>
          <div style="padding:2rem;">
            <div style="background:var(--bg-main);border:1px solid var(--glass-border);border-radius:14px;padding:1.25rem;margin-bottom:1.5rem;">
              <label style="display:flex;align-items:center;gap:8px;font-size:0.85rem;font-weight:600;color:var(--text-muted);margin-bottom:0.75rem;">
                <i class="fa-solid fa-lock" style="color:var(--color-primary);"></i>
                Nhập mật khẩu để xác nhận
              </label>
              <input type="password" id="delete-password" placeholder="Mật khẩu tài khoản của bạn" autocomplete="current-password"
                style="width:100%;padding:0.85rem 1rem;border-radius:12px;border:1px solid var(--glass-border);background:var(--bg-panel);color:var(--text-main);font-family:var(--font-sans);font-size:0.9rem;outline:none;box-sizing:border-box;transition:border-color 0.2s;"
                onfocus="this.style.borderColor='#ff4757'" onblur="this.style.borderColor='var(--glass-border)'" />
              <p id="delete-error" style="font-size:0.78rem;color:#ff4757;margin:0.5rem 0 0;display:none;"><i class="fa-solid fa-circle-exclamation"></i> Mật khẩu không đúng</p>
            </div>
            <input type="hidden" id="delete-book-id" value="${book.id}" />
            <div style="display:flex;gap:0.75rem;">
              <button id="cancel-delete" class="btn" style="flex:1;background:var(--bg-main);border:1px solid var(--glass-border);color:var(--text-main);padding:0.75rem;">
                <i class="fa-solid fa-arrow-left"></i> Hủy
              </button>
              <button id="confirm-delete" class="btn" style="flex:1;background:#ff4757;border:none;color:#fff;padding:0.75rem;font-weight:700;display:flex;align-items:center;justify-content:center;gap:6px;">
                <i class="fa-solid fa-trash"></i> Xóa sách
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  // ═══════════════════════════════════════════════════
  // ── EDIT WORKFLOW ──────────────────────────────────
  // ═══════════════════════════════════════════════════
  _openEditModal(book) {
    document.getElementById('edit-modal-overlay')?.remove();

    if (!document.getElementById('publish-modal-style')) {
      const st = document.createElement('style');
      st.id = 'publish-modal-style';
      st.textContent = `
        @keyframes fadeIn { from { opacity:0; } to { opacity:1; } }
        @keyframes slideUp { from { opacity:0; transform:translateY(30px) scale(0.97); } to { opacity:1; transform:translateY(0) scale(1); } }
        @keyframes successPulse { 0%,100% { transform:scale(1); } 50% { transform:scale(1.05); } }
        .upload-zone:hover { border-color: var(--color-primary) !important; background: rgba(124,58,237,0.05) !important; }
        .upload-zone.drag-over { border-color: var(--color-primary) !important; background: rgba(124,58,237,0.1) !important; transform:scale(1.02); }
        .upload-zone.has-file { border-color: #2ed573 !important; border-style: solid !important; }
        .upload-zone.has-file .upload-icon { color: #2ed573 !important; background: rgba(46,213,115,0.15) !important; }
      `;
      document.head.appendChild(st);
    }

    // Inject shake animation for wrong password
    if (!document.getElementById('shake-style')) {
      const st2 = document.createElement('style');
      st2.id = 'shake-style';
      st2.textContent = `@keyframes shake { 0%,100% { transform:translateX(0); } 20%,60% { transform:translateX(-8px); } 40%,80% { transform:translateX(8px); } }`;
      document.head.appendChild(st2);
    }

    const modalDiv = document.createElement('div');
    modalDiv.innerHTML = this._editModalHTML(book);
    document.body.appendChild(modalDiv.firstElementChild);

    // Close handlers
    document.getElementById('close-edit-modal')?.addEventListener('click', () => this._closeEditModal());
    document.getElementById('cancel-edit')?.addEventListener('click', () => this._closeEditModal());
    document.getElementById('edit-modal-overlay')?.addEventListener('click', (e) => {
      if (e.target.id === 'edit-modal-overlay') this._closeEditModal();
    });

    // File upload zones
    this._setupUploadZone('edit-zone-pdf', 'edit-file-pdf', 'edit-pdf-label');
    this._setupUploadZone('edit-zone-audio', 'edit-file-audio', 'edit-audio-label');
    this._setupUploadZone('edit-zone-copyright', 'edit-file-copyright', 'edit-copyright-label');

    // Form submission
    document.getElementById('edit-book-form')?.addEventListener('submit', (e) => {
      e.preventDefault();
      this._submitEdit();
    });
  }

  _closeEditModal() {
    const overlay = document.getElementById('edit-modal-overlay');
    if (overlay) {
      overlay.style.animation = 'fadeIn 0.2s ease reverse';
      setTimeout(() => overlay.remove(), 200);
    }
  }

  async _submitEdit() {
    const bookId = parseInt(document.getElementById('edit-book-id')?.value);
    if (!bookId) return;

    const submitBtn = document.getElementById('submit-edit');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Đang lưu...';
    submitBtn.disabled = true;

    const payload = {
      name: document.getElementById('edit-name')?.value?.trim(),
      description: document.getElementById('edit-desc')?.value?.trim(),
      country: document.getElementById('edit-country')?.value?.trim() || '',
      language: document.getElementById('edit-language')?.value || 'VN',
      pageNumber: document.getElementById('edit-pages')?.value || 0,
      releaseDate: document.getElementById('edit-year')?.value ? parseInt(document.getElementById('edit-year').value) : null,
      categoryId: document.getElementById('edit-category')?.value || null,
      PublishingHouseId: document.getElementById('edit-publisher')?.value || null,
      thumbnailUrl: document.getElementById('edit-thumb')?.value?.trim() || '',
      ebookFileUrl: document.getElementById('edit-ebook-url')?.value?.trim() || '',
    };

    // Handle new file uploads
    const newAudio = document.getElementById('edit-file-audio')?.files?.[0];
    const newCopyright = document.getElementById('edit-file-copyright')?.files?.[0];
    if (newAudio) payload.audioFileUrl = newAudio.name;
    if (newCopyright) payload.copyrightFileUrl = newCopyright.name;

    if (!payload.name) {
      alert('Vui lòng nhập tên sách!');
      submitBtn.innerHTML = originalText;
      submitBtn.disabled = false;
      return;
    }

    try {
      const res = await fetch(`/api/books/${bookId}/edit`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const result = await res.json();

      if (result.success) {
        const modal = document.getElementById('edit-modal');
        if (modal) {
          modal.innerHTML = `
            <div style="padding:4rem 3rem;text-align:center;animation:successPulse 0.6s ease;">
              <div style="width:80px;height:80px;border-radius:50%;background:linear-gradient(135deg,rgba(46,213,115,0.2),rgba(20,184,166,0.2));display:flex;align-items:center;justify-content:center;margin:0 auto 1.5rem;font-size:2.5rem;">
                <i class="fa-solid fa-check-circle" style="color:#2ed573;"></i>
              </div>
              <h2 style="margin:0 0 0.5rem;font-family:'Playfair Display',serif;">Cập nhật thành công!</h2>
              <p style="color:var(--text-muted);font-size:0.9rem;margin:0 0 0.5rem;">
                Sách <strong style="color:var(--text-main);">"${payload.name}"</strong> đã được cập nhật.
              </p>
              <div style="display:inline-flex;align-items:center;gap:6px;background:rgba(255,165,0,0.12);border:1px solid rgba(255,165,0,0.3);padding:6px 16px;border-radius:20px;margin:1rem 0 2rem;">
                <i class="fa-solid fa-clock" style="color:#ffa500;font-size:0.8rem;"></i>
                <span style="font-size:0.82rem;color:#ffa500;font-weight:600;">Đang chờ admin duyệt lại</span>
              </div>
              <br/>
              <button class="btn btn-primary" id="close-edit-success" style="padding:0.75rem 2rem;">
                <i class="fa-solid fa-check"></i> Đóng
              </button>
            </div>
          `;
          document.getElementById('close-edit-success')?.addEventListener('click', () => {
            this._closeEditModal();
            this.fetchData();
          });
        }
      } else {
        alert('Có lỗi xảy ra. Vui lòng thử lại.');
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
      }
    } catch (err) {
      console.error('Edit book error:', err);
      alert('Có lỗi kết nối. Vui lòng thử lại.');
      submitBtn.innerHTML = originalText;
      submitBtn.disabled = false;
    }
  }

  // ═══════════════════════════════════════════════════
  // ── DELETE WORKFLOW (xác thực mật khẩu) ────────────
  // ═══════════════════════════════════════════════════
  _openDeleteModal(book) {
    document.getElementById('delete-modal-overlay')?.remove();

    if (!document.getElementById('publish-modal-style')) {
      const st = document.createElement('style');
      st.id = 'publish-modal-style';
      st.textContent = `
        @keyframes fadeIn { from { opacity:0; } to { opacity:1; } }
        @keyframes slideUp { from { opacity:0; transform:translateY(30px) scale(0.97); } to { opacity:1; transform:translateY(0) scale(1); } }
      `;
      document.head.appendChild(st);
    }
    if (!document.getElementById('shake-style')) {
      const st2 = document.createElement('style');
      st2.id = 'shake-style';
      st2.textContent = `@keyframes shake { 0%,100% { transform:translateX(0); } 20%,60% { transform:translateX(-8px); } 40%,80% { transform:translateX(8px); } }`;
      document.head.appendChild(st2);
    }

    const modalDiv = document.createElement('div');
    modalDiv.innerHTML = this._deleteModalHTML(book);
    document.body.appendChild(modalDiv.firstElementChild);

    // Close handlers
    document.getElementById('cancel-delete')?.addEventListener('click', () => this._closeDeleteModal());
    document.getElementById('delete-modal-overlay')?.addEventListener('click', (e) => {
      if (e.target.id === 'delete-modal-overlay') this._closeDeleteModal();
    });

    // Focus password
    setTimeout(() => document.getElementById('delete-password')?.focus(), 300);

    // Enter key
    document.getElementById('delete-password')?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') { e.preventDefault(); this._submitDelete(); }
    });

    // Confirm
    document.getElementById('confirm-delete')?.addEventListener('click', () => this._submitDelete());
  }

  _closeDeleteModal() {
    const overlay = document.getElementById('delete-modal-overlay');
    if (overlay) {
      overlay.style.animation = 'fadeIn 0.2s ease reverse';
      setTimeout(() => overlay.remove(), 200);
    }
  }

  async _submitDelete() {
    const bookId = parseInt(document.getElementById('delete-book-id')?.value);
    const password = document.getElementById('delete-password')?.value;
    const currentUser = AuthService.getUser();
    const errorEl = document.getElementById('delete-error');
    const confirmBtn = document.getElementById('confirm-delete');

    if (!password) {
      if (errorEl) {
        errorEl.innerHTML = '<i class="fa-solid fa-circle-exclamation"></i> Vui lòng nhập mật khẩu';
        errorEl.style.display = 'block';
      }
      return;
    }

    if (confirmBtn) {
      confirmBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Đang xóa...';
      confirmBtn.disabled = true;
    }
    if (errorEl) errorEl.style.display = 'none';

    try {
      const res = await fetch(`/api/books/${bookId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUser.id, password }),
      });
      const result = await res.json();

      if (result.success) {
        // Success animation
        const overlay = document.getElementById('delete-modal-overlay');
        if (overlay) {
          const inner = overlay.querySelector('div > div');
          if (inner) {
            inner.innerHTML = `
              <div style="padding:3rem;text-align:center;">
                <div style="width:70px;height:70px;border-radius:50%;background:rgba(46,213,115,0.15);border:2px solid rgba(46,213,115,0.3);display:flex;align-items:center;justify-content:center;margin:0 auto 1.25rem;">
                  <i class="fa-solid fa-check" style="font-size:1.8rem;color:#2ed573;"></i>
                </div>
                <h3 style="margin:0 0 0.5rem;color:#2ed573;">Đã xóa thành công</h3>
                <p style="color:var(--text-muted);font-size:0.85rem;margin:0;">Sách đã được xóa vĩnh viễn khỏi hệ thống.</p>
              </div>
            `;
          }
        }
        setTimeout(() => {
          this._closeDeleteModal();
          this.fetchData();
        }, 1500);
      } else {
        // Wrong password
        if (errorEl) {
          errorEl.innerHTML = '<i class="fa-solid fa-circle-exclamation"></i> ' + (result.error || 'Mật khẩu không đúng');
          errorEl.style.display = 'block';
        }
        if (confirmBtn) {
          confirmBtn.innerHTML = '<i class="fa-solid fa-trash"></i> Xóa sách';
          confirmBtn.disabled = false;
        }
        const pwInput = document.getElementById('delete-password');
        if (pwInput) {
          pwInput.style.animation = 'none';
          pwInput.offsetHeight;
          pwInput.style.animation = 'shake 0.4s ease';
          pwInput.style.borderColor = '#ff4757';
          pwInput.value = '';
          pwInput.focus();
        }
      }
    } catch (err) {
      console.error('Delete book error:', err);
      if (errorEl) {
        errorEl.innerHTML = '<i class="fa-solid fa-circle-exclamation"></i> Có lỗi kết nối. Vui lòng thử lại.';
        errorEl.style.display = 'block';
      }
      if (confirmBtn) {
        confirmBtn.innerHTML = '<i class="fa-solid fa-trash"></i> Xóa sách';
        confirmBtn.disabled = false;
      }
    }
  }

  afterRender() {
    this.fetchData();
  }

  render() {
    const user = AuthService.getUser();
    return `
      <div class="container" style="padding-top:2rem;padding-bottom:4rem;">
        <div style="margin-bottom:2rem;" class="animate-slide-up">
          <h1 class="text-gradient">Author Dashboard</h1>
          <p style="color:var(--text-muted);">Quản lý tác phẩm, xem thống kê và tương tác với độc giả của bạn.</p>
        </div>
        <div id="author-dashboard" class="animate-slide-up stagger-1">
          <div style="text-align:center;padding:5rem;"><i class="fa-solid fa-spinner fa-spin fa-3x" style="color:var(--color-primary);"></i></div>
        </div>
      </div>
    `;
  }
}
