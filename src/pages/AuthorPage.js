import { AuthService } from '../services/AuthService.js';
import { MockDbService } from '../services/MockDbService.js';

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
      this.allData = data;
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

  _statusBadge(status, isHidden = false) {
    if (isHidden) {
      return `<span style="background:rgba(255,255,255,0.1);color:var(--text-muted);border:1px solid rgba(255,255,255,0.2);padding:3px 10px;border-radius:20px;font-size:0.7rem;font-weight:700;display:inline-flex;align-items:center;gap:4px;"><i class="fa-solid fa-eye-slash" style="font-size:0.6rem;"></i>Đã ẩn</span>`;
    }
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
                <div class="upload-zone" id="zone-pdf" style="border:2px dashed var(--glass-border);border-radius:16px;padding:1.5rem 1rem;text-align:center;cursor:pointer;transition:all 0.3s;background:var(--bg-main);">
                  <input type="file" id="file-pdf" accept=".pdf" style="display:none;" />
                  <div style="width:48px;height:48px;border-radius:12px;background:rgba(124,58,237,0.15);display:flex;align-items:center;justify-content:center;margin:0 auto 0.75rem;font-size:1.2rem;color:var(--color-primary);">
                    <i class="fa-solid fa-file-pdf"></i>
                  </div>
                  <p id="pdf-label" style="font-size:0.8rem;font-weight:600;margin:0 0 0.25rem;color:var(--text-main);">Tệp PDF sách</p>
                  <p style="font-size:0.68rem;color:var(--text-muted);margin:0;">Kéo thả hoặc nhấn để chọn</p>
                  <p style="font-size:0.6rem;color:var(--text-muted);margin:0.3rem 0 0;"><i class="fa-solid fa-info-circle"></i> Định dạng: .pdf</p>
                </div>

                <!-- Audio Upload -->
                <div class="upload-zone" id="zone-audio" style="border:2px dashed var(--glass-border);border-radius:16px;padding:1.5rem 1rem;text-align:center;cursor:pointer;transition:all 0.3s;background:var(--bg-main);">
                  <input type="file" id="file-audio" accept="audio/*" style="display:none;" />
                  <div style="width:48px;height:48px;border-radius:12px;background:rgba(236,72,153,0.15);display:flex;align-items:center;justify-content:center;margin:0 auto 0.75rem;font-size:1.2rem;color:var(--color-secondary);">
                    <i class="fa-solid fa-headphones"></i>
                  </div>
                  <p id="audio-label" style="font-size:0.8rem;font-weight:600;margin:0 0 0.25rem;color:var(--text-main);">File Audio sách</p>
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

            <!-- Chapters Section -->
            <div style="margin-bottom:2rem;">
              <h3 style="font-size:1rem;margin:0 0 0.5rem;color:var(--color-secondary);display:flex;align-items:center;gap:8px;">
                <i class="fa-solid fa-layer-group" style="font-size:0.9rem;"></i>
                Phân chương
              </h3>
              <p style="font-size:0.75rem;color:var(--text-muted);margin:0 0 1rem;"><i class="fa-solid fa-scissors"></i> Nếu có nhập chương, hệ thống sẽ tự động cắt audio theo thời lượng và tạo link riêng cho mỗi chương.</p>
              <div id="chapters-container" style="display:flex;flex-direction:column;gap:0.75rem;margin-bottom:1rem;">
              </div>
              <button type="button" id="add-chapter-btn" class="btn" style="background:var(--bg-main);border:1px dashed var(--color-primary);color:var(--color-primary);width:100%;padding:0.75rem;border-radius:12px;">
                <i class="fa-solid fa-plus"></i> Thêm chương mới
              </button>
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
                    <td style="padding:0.875rem;text-align:center;">${this._statusBadge(book.approvalStatus || 'APPROVED', book.isHidden)}</td>
                    <td style="padding:0.875rem;text-align:right;white-space:nowrap;">
                      <a href="#book?id=${book.id}" title="Xem trang sách">
                        <button class="btn-icon" style="width:32px;height:32px;font-size:0.8rem;color:var(--color-accent);" title="Xem chi tiết"><i class="fa-solid fa-eye"></i></button>
                      </a>
                      <button class="btn-icon btn-view-comments" data-bookid="${book.id}" data-bookname="${this._escapeAttr(book.name)}" style="width:32px;height:32px;font-size:0.8rem;color:var(--color-secondary);" title="Quản lý bình luận"><i class="fa-solid fa-comments"></i></button>
                      <button class="btn-icon btn-edit-book" data-bookid="${book.id}" style="width:32px;height:32px;font-size:0.8rem;" title="Chỉnh sửa"><i class="fa-solid fa-pen"></i></button>
                      <button class="btn-icon btn-delete-book" data-bookid="${book.id}" style="width:32px;height:32px;font-size:0.8rem;color:#ff4757;" title="Xóa"><i class="fa-solid fa-trash"></i></button>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>`
          }
        </div>

        <!-- Comments Panel -->
        <div class="glass-panel" style="padding:1.75rem;">
          <h3 style="margin-bottom:1.25rem;"><i class="fa-solid fa-message" style="color:var(--color-secondary);"></i> Bình luận mới nhất
            <span style="font-size:0.75rem;font-weight:400;color:var(--text-muted);margin-left:8px;">(click icon bình luận trên sách để quản lý)</span>
          </h3>
          <div style="display:flex;flex-direction:column;gap:0.75rem;max-height:450px;overflow-y:auto;">
            ${this.allComments.length === 0
              ? `<p style="color:var(--text-muted);text-align:center;padding:2rem;">Chưa có bình luận nào.</p>`
              : this.allComments.slice(0, 10).map(c => {
                  const book = this.allBooks.find(b => b.id === c.bookId);
                  const user = this.allUsers.find(u => u.id === c.userId);
                  const stars = '★'.repeat(Math.floor(c.rating)) + '☆'.repeat(5 - Math.floor(c.rating));
                  return `
                    <div style="background:var(--bg-main);padding:0.875rem;border-radius:10px;border-left:3px solid var(--color-primary);position:relative;">
                      <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:0.3rem;">
                        <div>
                          <span style="font-size:0.82rem;font-weight:600;">@${user?.username || 'user'}</span>
                          <span style="color:#ffd700;font-size:0.75rem;margin-left:8px;">${stars}</span>
                        </div>
                        <button class="btn-icon author-delete-comment" data-cid="${c.id}" data-bookid="${c.bookId}"
                          style="width:26px;height:26px;font-size:0.7rem;color:#ff4757;flex-shrink:0;" title="Xóa bình luận">
                          <i class="fa-solid fa-trash"></i>
                        </button>
                      </div>
                      <p style="font-size:0.82rem;color:var(--text-main);margin-bottom:0.2rem;font-weight:600;">${c.title || ''}</p>
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

    // View comments buttons (icon bình luận trên mỗi sách)
    document.querySelectorAll('.btn-view-comments').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const bookId = parseInt(btn.dataset.bookid);
        const bookName = btn.dataset.bookname || '';
        this._openCommentsModal(bookId, bookName);
      });
    });

    // Xóa comment trực tiếp từ panel tóm tắt
    document.querySelectorAll('.author-delete-comment').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const cid = parseInt(btn.dataset.cid, 10);
        if (!confirm('Xóa bình luận này?')) return;
        this._deleteComment(cid);
      });
    });
  }

  // ─── Quản lý bình luận sách ───────────────────────────────────────
  _deleteComment(cid) {
    this.allComments = this.allComments.filter(c => parseInt(c.id, 10) !== cid);
    MockDbService.deleteComment(cid);

    // Cập nhật modal nếu đang mở
    const modal = document.getElementById('author-comments-modal');
    if (modal) {
      modal.querySelector(`[data-cid="${cid}"]`)?.closest('.author-comment-item')?.remove();
      const countEl = modal.querySelector('#modal-comment-count');
      if (countEl) countEl.textContent = modal.querySelectorAll('.author-comment-item').length + ' bình luận';
    }
    this.reRender();
    this._toast('Đã xóa bình luận!');
  }

  _openCommentsModal(bookId, bookName) {
    document.getElementById('author-comments-modal')?.remove();

    const bookComments = this.allComments.filter(c => c.bookId === bookId);

    const overlay = document.createElement('div');
    overlay.id = 'author-comments-modal';
    overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.75);backdrop-filter:blur(8px);z-index:9999;display:flex;align-items:center;justify-content:center;animation:fadeIn 0.3s ease;';
    overlay.innerHTML = `
      <div style="background:var(--bg-panel);border:1px solid var(--glass-border);border-radius:24px;width:95%;max-width:640px;max-height:85vh;overflow:hidden;display:flex;flex-direction:column;animation:slideUp 0.4s cubic-bezier(0.22,1,0.36,1);">
        <!-- Header -->
        <div style="padding:1.5rem 2rem;border-bottom:1px solid var(--glass-border);display:flex;align-items:center;justify-content:space-between;flex-shrink:0;">
          <div>
            <h3 style="margin:0;font-size:1.15rem;display:flex;align-items:center;gap:8px;">
              <i class="fa-solid fa-comments" style="color:var(--color-secondary);"></i>
              Quản lý bình luận
            </h3>
            <p style="margin:0.25rem 0 0;font-size:0.8rem;color:var(--text-muted);">
              📖 ${bookName} &nbsp;·&nbsp; <span id="modal-comment-count">${bookComments.length} bình luận</span>
            </p>
          </div>
          <button id="close-comments-modal" class="btn-icon" style="width:38px;height:38px;font-size:1.1rem;">
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>

        <!-- Body -->
        <div style="flex:1;overflow-y:auto;padding:1.25rem 2rem;">
          ${bookComments.length === 0 ? `
            <div style="text-align:center;padding:3rem 1rem;color:var(--text-muted);">
              <i class="fa-regular fa-comments" style="font-size:2.5rem;margin-bottom:1rem;display:block;"></i>
              Chưa có bình luận nào cho sách này.
            </div>
          ` : bookComments.map(c => {
            const user = this.allUsers.find(u => u.id === c.userId);
            const stars = '★'.repeat(Math.floor(c.rating || 0)) + '☆'.repeat(5 - Math.floor(c.rating || 0));
            const dateStr = c.createdAt ? new Date(c.createdAt).toLocaleDateString('vi-VN') : '';
            return `
              <div class="author-comment-item" style="background:var(--bg-main);border-radius:14px;padding:1rem 1.25rem;margin-bottom:0.75rem;border:1px solid var(--glass-border);">
                <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:0.75rem;">
                  <div style="display:flex;align-items:center;gap:0.75rem;flex:1;min-width:0;">
                    <div style="width:36px;height:36px;border-radius:50%;background:linear-gradient(135deg,var(--color-primary),var(--color-secondary));display:flex;align-items:center;justify-content:center;font-size:0.85rem;font-weight:700;color:#fff;flex-shrink:0;">
                      ${(user?.username || 'U')[0].toUpperCase()}
                    </div>
                    <div style="min-width:0;">
                      <div style="font-size:0.85rem;font-weight:700;">@${user?.username || 'user'}</div>
                      <div style="display:flex;align-items:center;gap:8px;">
                        <span style="color:#ffd700;font-size:0.75rem;">${stars}</span>
                        ${dateStr ? `<span style="font-size:0.7rem;color:var(--text-muted);">${dateStr}</span>` : ''}
                      </div>
                    </div>
                  </div>
                  <button class="btn-icon author-delete-comment-modal" data-cid="${c.id}"
                    style="width:30px;height:30px;font-size:0.75rem;color:#ff4757;flex-shrink:0;background:rgba(255,71,87,0.1);border-radius:8px;" title="Xóa bình luận">
                    <i class="fa-solid fa-trash"></i>
                  </button>
                </div>
                ${c.title ? `<p style="font-size:0.85rem;font-weight:600;margin:0.75rem 0 0.25rem;">${c.title}</p>` : ''}
                <p style="font-size:0.83rem;color:var(--text-muted);margin:${c.title ? '0' : '0.75rem 0 0'};line-height:1.6;">${c.content}</p>
              </div>
            `;
          }).join('')}
        </div>

        <!-- Footer -->
        <div style="padding:1rem 2rem;border-top:1px solid var(--glass-border);text-align:right;flex-shrink:0;">
          <button id="close-comments-footer" class="btn" style="background:var(--bg-main);border:1px solid var(--glass-border);color:var(--text-muted);padding:0.6rem 1.25rem;">
            <i class="fa-solid fa-xmark"></i> Đóng
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);

    // Close handlers
    overlay.querySelector('#close-comments-modal')?.addEventListener('click', () => overlay.remove());
    overlay.querySelector('#close-comments-footer')?.addEventListener('click', () => overlay.remove());
    overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.remove(); });

    // Delete comment buttons inside modal
    overlay.querySelectorAll('.author-delete-comment-modal').forEach(btn => {
      btn.addEventListener('click', () => {
        const cid = parseInt(btn.dataset.cid, 10);
        if (!confirm('Xóa bình luận này? Hành động không thể hoàn tác.')) return;
        this._deleteComment(cid);
      });
    });
  }

  _toast(msg) {
    const t = document.createElement('div');
    t.style.cssText = 'position:fixed;bottom:2rem;left:50%;transform:translateX(-50%) translateY(20px);background:var(--color-primary);color:#fff;padding:0.75rem 1.5rem;border-radius:12px;font-size:0.88rem;font-weight:600;box-shadow:0 8px 32px rgba(0,0,0,0.4);z-index:99999;transition:all 0.3s;opacity:0;';
    t.textContent = msg;
    document.body.appendChild(t);
    setTimeout(() => { t.style.opacity = '1'; t.style.transform = 'translateX(-50%) translateY(0)'; }, 10);
    setTimeout(() => { t.style.opacity = '0'; setTimeout(() => t.remove(), 300); }, 2500);
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

    // Chapter logic — chi nương cần tên + duration
    const chaptersContainer = document.getElementById('chapters-container');
    const addChapterBtn = document.getElementById('add-chapter-btn');
    let chapCounter = 0;
    const addChapter = () => {
      chapCounter++;
      const n = chapCounter;
      const div = document.createElement('div');
      div.className = 'chapter-item-form';
      div.style = 'display:flex;gap:1rem;align-items:center;background:var(--bg-panel);padding:0.75rem 1rem;border-radius:12px;border:1px solid var(--glass-border);';
      div.innerHTML =
        '<div style="width:32px;height:32px;border-radius:8px;background:var(--bg-main);display:flex;align-items:center;justify-content:center;font-weight:700;font-size:0.85rem;color:var(--text-muted);flex-shrink:0;">' + n + '</div>' +
        '<input type="text" class="chapter-name" placeholder="Tên chương ' + n + '" style="flex:1;padding:0.5rem 0.75rem;border-radius:8px;border:1px solid var(--glass-border);background:var(--bg-main);color:var(--text-main);font-size:0.85rem;outline:none;" />' +
        '<div style="display:flex;align-items:center;gap:6px;flex-shrink:0;">' +
          '<input type="number" class="chapter-duration" placeholder="0" min="0" style="width:90px;padding:0.5rem 0.75rem;border-radius:8px;border:1px solid var(--glass-border);background:var(--bg-main);color:var(--text-main);font-size:0.85rem;outline:none;text-align:right;" />' +
          '<span style="font-size:0.75rem;color:var(--text-muted);white-space:nowrap;">giây</span>' +
        '</div>' +
        '<button type="button" class="btn-icon remove-chap" style="color:#ff4757;width:32px;height:32px;flex-shrink:0;" title="Xóa chương"><i class="fa-solid fa-trash"></i></button>';
      div.querySelector('.remove-chap').onclick = () => div.remove();
      chaptersContainer.appendChild(div);
    };
    addChapter();
    addChapterBtn.onclick = addChapter;

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

  /**
   * Cắt file audio theo danh sách chapters (mỗi chapter có duration tính bằng giây).
   * Trả về mảng chapters với audiobookUrl là Blob URL WAV của từng đoạn.
   * Dùng Web Audio API — hoạt động 100% client-side, không cần backend.
   */
  async _splitAudio(audioFile, chapters) {
    const arrayBuffer = await audioFile.arrayBuffer();
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
    await audioCtx.close();

    const sampleRate = audioBuffer.sampleRate;
    const numChannels = audioBuffer.numberOfChannels;
    const totalSamples = audioBuffer.length;

    const result = [];
    let offsetSamples = 0;

    for (let i = 0; i < chapters.length; i++) {
      const ch = chapters[i];
      const durationSec = ch.duration || 0;
      let frameCount;

      if (i === chapters.length - 1) {
        // Chương cuối: lấy hết phần còn lại
        frameCount = totalSamples - offsetSamples;
      } else {
        frameCount = Math.round(durationSec * sampleRate);
      }

      frameCount = Math.max(1, Math.min(frameCount, totalSamples - offsetSamples));

      // Tạo buffer cho chương này
      const offCtx = new OfflineAudioContext(numChannels, frameCount, sampleRate);
      const segBuffer = offCtx.createBuffer(numChannels, frameCount, sampleRate);
      for (let c = 0; c < numChannels; c++) {
        const srcData = audioBuffer.getChannelData(c);
        const dstData = segBuffer.getChannelData(c);
        for (let s = 0; s < frameCount; s++) {
          dstData[s] = srcData[offsetSamples + s] || 0;
        }
      }

      // Encode sang WAV
      const wavBlob = this._encodeWav(segBuffer);
      const audiobookUrl = URL.createObjectURL(wavBlob);

      result.push({ name: ch.name, duration: durationSec, audiobookUrl });
      offsetSamples += frameCount;
    }

    return result;
  }

  /** Encode AudioBuffer → WAV Blob (PCM 16-bit). */
  _encodeWav(buffer) {
    const numChannels = buffer.numberOfChannels;
    const sampleRate = buffer.sampleRate;
    const numFrames = buffer.length;
    const bytesPerSample = 2; // 16-bit
    const blockAlign = numChannels * bytesPerSample;
    const dataSize = numFrames * blockAlign;
    const ab = new ArrayBuffer(44 + dataSize);
    const view = new DataView(ab);
    const writeStr = (off, s) => { for (let i = 0; i < s.length; i++) view.setUint8(off + i, s.charCodeAt(i)); };
    writeStr(0, 'RIFF');
    view.setUint32(4, 36 + dataSize, true);
    writeStr(8, 'WAVE');
    writeStr(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true); // PCM
    view.setUint16(22, numChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * blockAlign, true);
    view.setUint16(32, blockAlign, true);
    view.setUint16(34, 16, true); // bitDepth
    writeStr(36, 'data');
    view.setUint32(40, dataSize, true);
    let offset = 44;
    for (let i = 0; i < numFrames; i++) {
      for (let c = 0; c < numChannels; c++) {
        const s = buffer.getChannelData(c)[i];
        const clamped = Math.max(-1, Math.min(1, s));
        view.setInt16(offset, clamped < 0 ? clamped * 0x8000 : clamped * 0x7FFF, true);
        offset += 2;
      }
    }
    return new Blob([ab], { type: 'audio/wav' });
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

      const pdfFile = document.getElementById('file-pdf')?.files?.[0];
      const audioFile = document.getElementById('file-audio')?.files?.[0];
      const copyrightFile = document.getElementById('file-copyright')?.files?.[0];

      // Thu thập chapters từ form
      const rawChapters = [];
      document.querySelectorAll('#publish-modal .chapter-item-form').forEach((el, index) => {
        const name = el.querySelector('.chapter-name')?.value?.trim() || '';
        const duration = parseInt(el.querySelector('.chapter-duration')?.value) || 0;
        if (name || duration > 0) {
          rawChapters.push({ name: name || ('Chương ' + (index + 1)), duration });
        }
      });

      // Xử lý file PDF → tạo blob URL
      const ebookFileUrl = pdfFile ? URL.createObjectURL(pdfFile) : '';

      // Xử lý Audio: nếu có phân chương thì cắt, không thì dùng nguyên file
      let audioFileUrl = '';
      let chapters = rawChapters;

      if (audioFile) {
        if (rawChapters.length > 0 && rawChapters.some(c => c.duration > 0)) {
          // Hiển thị trạng thái đang xử lý
          submitBtn.innerHTML = '<i class="fa-solid fa-scissors fa-spin"></i> Đang cắt audio...';
          try {
            chapters = await this._splitAudio(audioFile, rawChapters);
            audioFileUrl = chapters[0]?.audiobookUrl || URL.createObjectURL(audioFile);
          } catch(e) {
            console.warn('Split audio failed, using full file:', e);
            audioFileUrl = URL.createObjectURL(audioFile);
          }
        } else {
          audioFileUrl = URL.createObjectURL(audioFile);
        }
      }
      submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Đang gử...';

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
        ebookFileUrl: ebookFileUrl || document.getElementById('pub-ebook-url')?.value?.trim() || '',
        authorId: currentUser.authorId,
        submittedByUserId: currentUser.id,
        audioFileUrl: audioFileUrl,
        copyrightFileUrl: copyrightFile ? URL.createObjectURL(copyrightFile) : '',
        chapters
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
                <i class="fa-solid fa-cloud-arrow-up" style="font-size:0.9rem;"></i> Cập nhật tệp tin
              </h3>

              <!-- Link PDF -->
              <div style="margin-bottom:1rem;">
                <label style="display:block;font-size:0.82rem;font-weight:600;color:var(--text-muted);margin-bottom:6px;">
                  <i class="fa-solid fa-file-pdf" style="color:var(--color-primary);margin-right:4px;"></i>
                  Tệp PDF sách ${book.ebookFileUrl ? '(đã có)' : ''}
                </label>
                <div class="upload-zone ${book.ebookFileUrl ? 'has-file' : ''}" id="edit-zone-pdf" style="border:2px dashed var(--glass-border);border-radius:12px;padding:1rem;text-align:center;cursor:pointer;background:var(--bg-main);">
                  <input type="file" id="edit-file-pdf" accept=".pdf" style="display:none;" />
                  <div class="upload-icon" style="font-size:1.5rem;color:var(--color-primary);margin-bottom:0.5rem;"><i class="fa-solid fa-file-pdf"></i></div>
                  <p id="edit-pdf-label" style="font-size:0.78rem;margin:0;color:var(--text-main);">${book.ebookFileUrl ? '<i class="fa-solid fa-check-circle" style="color:#2ed573;"></i> Đã có — nhấn để thay thế' : 'Nhấn để chọn'}</p>
                </div>
              </div>

              <!-- Link Audio -->
              <div style="margin-bottom:1rem;">
                <label style="display:block;font-size:0.82rem;font-weight:600;color:var(--text-muted);margin-bottom:6px;">
                  <i class="fa-solid fa-headphones" style="color:var(--color-secondary);margin-right:4px;"></i>
                  File Audio sách ${book.audioFileUrl ? '(đã có)' : ''}
                </label>
                <div class="upload-zone ${book.audioFileUrl ? 'has-file' : ''}" id="edit-zone-audio" style="border:2px dashed var(--glass-border);border-radius:12px;padding:1rem;text-align:center;cursor:pointer;background:var(--bg-main);">
                  <input type="file" id="edit-file-audio" accept="audio/*" style="display:none;" />
                  <div class="upload-icon" style="font-size:1.5rem;color:var(--color-secondary);margin-bottom:0.5rem;"><i class="fa-solid fa-headphones"></i></div>
                  <p id="edit-audio-label" style="font-size:0.78rem;margin:0;color:var(--text-main);">${book.audioFileUrl ? '<i class="fa-solid fa-check-circle" style="color:#2ed573;"></i> Đã có — nhấn để thay thế' : 'Nhấn để chọn'}</p>
                </div>
              </div>

              <!-- Copyright -->
              <div class="upload-zone ${book.copyrightFileUrl ? 'has-file' : ''}" id="edit-zone-copyright" style="border:2px dashed var(--glass-border);border-radius:12px;padding:1rem;text-align:center;cursor:pointer;background:var(--bg-main);">
                <input type="file" id="edit-file-copyright" accept=".zip,.rar,.7z" style="display:none;" />
                <div class="upload-icon" style="font-size:1.5rem;color:#ffa500;margin-bottom:0.5rem;"><i class="fa-solid fa-file-zipper"></i></div>
                <p id="edit-copyright-label" style="font-size:0.78rem;margin:0;color:var(--text-main);">${book.copyrightFileUrl ? '<i class="fa-solid fa-check-circle" style="color:#2ed573;"></i> Đã có — nhấn để thay' : 'Giấy tờ bản quyền'}</p>
              </div>
            </div>

            <!-- Edit Chapters -->
            <div style="margin-bottom:2rem;">
              <h3 style="font-size:1rem;margin:0 0 0.5rem;color:var(--color-secondary);display:flex;align-items:center;gap:8px;">
                <i class="fa-solid fa-layer-group" style="font-size:0.9rem;"></i>
                Chỉnh sửa chương
              </h3>
              <p style="font-size:0.75rem;color:var(--text-muted);margin:0 0 1rem;">Các chương sử dụng chung 1 file audio của sách, phân biệt qua thời điểm bắt đầu tính từ duration của các chương trước.</p>
              <div id="edit-chapters-container" style="display:flex;flex-direction:column;gap:0.75rem;margin-bottom:1rem;">
                <!-- Will be populated dynamically -->
              </div>
              <button type="button" id="edit-add-chapter-btn" class="btn" style="background:var(--bg-main);border:1px dashed var(--color-primary);color:var(--color-primary);width:100%;padding:0.75rem;border-radius:12px;">
                <i class="fa-solid fa-plus"></i> Thêm chương mới
              </button>
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

    // Chapters edit logic — chỉ tên + duration
    const chaptersContainer = document.getElementById('edit-chapters-container');
    const addChapterBtn = document.getElementById('edit-add-chapter-btn');

    const existingChapters = (this.allData?.audioChapter || []).filter(c => c.bookId === book.id).sort((a,b) => a.chapterNumber - b.chapterNumber);
    let chapCounter = 0;

    const addChapter = (chapInfo = null) => {
      chapCounter++;
      const n = chapCounter;
      const defaultName = chapInfo ? chapInfo.name : ('Chương ' + n);
      const div = document.createElement('div');
      div.className = 'chapter-item-form';
      div.style = 'display:flex;gap:1rem;align-items:center;background:var(--bg-panel);padding:0.75rem 1rem;border-radius:12px;border:1px solid var(--glass-border);';
      div.innerHTML =
        '<div style="width:32px;height:32px;border-radius:8px;background:var(--bg-main);display:flex;align-items:center;justify-content:center;font-weight:700;font-size:0.85rem;color:var(--text-muted);flex-shrink:0;">' + n + '</div>' +
        '<input type="text" class="chapter-name" value="' + this._escapeAttr(defaultName) + '" placeholder="Tên chương" style="flex:1;padding:0.5rem 0.75rem;border-radius:8px;border:1px solid var(--glass-border);background:var(--bg-main);color:var(--text-main);font-size:0.85rem;outline:none;" />' +
        '<div style="display:flex;align-items:center;gap:6px;flex-shrink:0;">' +
          '<input type="number" class="chapter-duration" value="' + (chapInfo ? chapInfo.duration || 0 : 0) + '" min="0" style="width:90px;padding:0.5rem 0.75rem;border-radius:8px;border:1px solid var(--glass-border);background:var(--bg-main);color:var(--text-main);font-size:0.85rem;outline:none;text-align:right;" />' +
          '<span style="font-size:0.75rem;color:var(--text-muted);white-space:nowrap;">giây</span>' +
        '</div>' +
        '<button type="button" class="btn-icon remove-chap" style="color:#ff4757;width:32px;height:32px;flex-shrink:0;"><i class="fa-solid fa-trash"></i></button>';
      div.querySelector('.remove-chap').onclick = () => div.remove();
      chaptersContainer.appendChild(div);
    };

    if (existingChapters.length > 0) {
      existingChapters.forEach(c => addChapter(c));
    } else {
      addChapter();
    }
    addChapterBtn.onclick = () => addChapter();

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
    const book = this.authorBooks.find(b => b.id === bookId);
    if (!book) return;

    const submitBtn = document.getElementById('submit-edit');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Đang lưu...';
    submitBtn.disabled = true;

      const pdfFile = document.getElementById('edit-file-pdf')?.files?.[0];
      const audioFile = document.getElementById('edit-file-audio')?.files?.[0];
      const copyrightFile = document.getElementById('edit-file-copyright')?.files?.[0];

      // Thu thập chapters
      const rawChapters = [];
      document.querySelectorAll('#edit-modal .chapter-item-form').forEach((el, index) => {
        const name = el.querySelector('.chapter-name')?.value?.trim() || '';
        const duration = parseInt(el.querySelector('.chapter-duration')?.value) || 0;
        if (name || duration > 0) {
          rawChapters.push({ name: name || ('Chương ' + (index + 1)), duration });
        }
      });

      const ebookFileUrl = pdfFile ? URL.createObjectURL(pdfFile) : (document.getElementById('edit-ebook-url')?.value?.trim() || book.ebookFileUrl || '');

      let audioFileUrl = document.getElementById('edit-audio-url')?.value?.trim() || book.audioFileUrl || '';
      let chapters = rawChapters;

      if (audioFile) {
        if (rawChapters.length > 0 && rawChapters.some(c => c.duration > 0)) {
          submitBtn.innerHTML = '<i class="fa-solid fa-scissors fa-spin"></i> Đang cắt audio...';
          try {
            chapters = await this._splitAudio(audioFile, rawChapters);
            audioFileUrl = chapters[0]?.audiobookUrl || URL.createObjectURL(audioFile);
          } catch(e) {
            console.warn('Split audio failed:', e);
            audioFileUrl = URL.createObjectURL(audioFile);
          }
        } else {
          audioFileUrl = URL.createObjectURL(audioFile);
        }
      }
      submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Đang lưu...';

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
        ebookFileUrl: ebookFileUrl,
        audioFileUrl: audioFileUrl,
        copyrightFileUrl: copyrightFile ? URL.createObjectURL(copyrightFile) : book.copyrightFileUrl || '',
        chapters
      };



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
