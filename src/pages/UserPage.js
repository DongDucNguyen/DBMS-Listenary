import { AuthService } from '../services/AuthService.js';
import { PaymentModal } from '../components/PaymentModal.js';
import { MockDbService } from '../services/MockDbService.js';

export class UserPage {
  constructor() {
    this.userData = null;
    this.books = [];
    this.comments = [];
    this.plans = [];
    this.isLoading = true;
    this.isEditing = false;
  }

  async fetchData() {
    try {
      const currentUser = AuthService.getUser();
      const res = await fetch('/database.json?t=' + Date.now());
      const data = await res.json();
      const dbUser = data.user.find(u => u.id === currentUser.id) || {};

      const userSubs = (data.userSubscriptions || [])
        .filter(s => s.userId === this.userData?.id || s.userId === currentUser.id)
        .sort((a, b) => new Date(b.startDate) - new Date(a.startDate));

      const activeSub = userSubs[0];

      if (activeSub) {
        dbUser.subscriptionPlan = activeSub.planId;
        dbUser.subscriptionEndDate = activeSub.endDate;
        dbUser.paymentInfo = activeSub.paymentInfo;
      } else {
        dbUser.subscriptionPlan = 'FREE';
        dbUser.subscriptionEndDate = null;
        dbUser.paymentInfo = null;
      }

      dbUser.subscriptionHistory = userSubs;

      this.userData = this._normalizeUser({ ...currentUser, ...dbUser });
      this.books = data.books;

      // Gộp comments từ database + localStorage, lọc theo userId và sắp xếp mới nhất trước
      const allComments = MockDbService.mergeComments(data.comments || []);
      this.comments = allComments.filter(c => c.userId === this.userData.id);

      // Lấy lịch sử nghe từ bảng listeningAudioBook
      const allHistory = data.listeningAudioBook || [];
      this.readingHistory = allHistory
        .filter(h => h.userId === this.userData.id)
        .sort((a, b) => new Date(b.lastListenedAt) - new Date(a.lastListenedAt))
        .map(h => ({
          bookId: h.bookId,
          progress: h.audioTimeline || 0,
          lastListened: h.lastListenedAt
        }));

      // Lấy danh sách yêu thích
      this.favoriteIds = (data.userFavorites || []).filter(f => f.userId === this.userData.id).map(f => f.bookId);

      this.plans = data.subscriptionPlans || [];
    } catch (err) {
      console.error(err);
    } finally {
      this.isLoading = false;
      this.reRender();
    }
  }

  _escape(value) {
    return String(value ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  _normalizeUser(user) {
    if (!user) return user;
    if (user.roleId === 1 || user.roleId === 3) {
      return { ...user, subscriptionPlan: 'PREMIUM' };
    }
    return { ...user, subscriptionPlan: user.subscriptionPlan || 'FREE' };
  }

  _roleLabel(roleId) {
    if (roleId === 1) return 'ADMIN';
    if (roleId === 3) return 'AUTHOR';
    return 'USER';
  }

  _roleColor(roleId) {
    if (roleId === 1) return '#ffd700';
    if (roleId === 3) return 'var(--color-accent)';
    return 'var(--color-primary)';
  }

  _buildReadingHistory() {
    const history = this.readingHistory || [];
    if (history.length === 0) {
      return `<p style="color:var(--text-muted);text-align:center;padding:2rem;">Bạn chưa nghe cuốn sách nào. <a href="#explore" style="color:var(--color-primary);">Khám phá ngay!</a></p>`;
    }
    return history.map(h => {
      const book = this.books.find(b => b.id === h.bookId && (!b.approvalStatus || b.approvalStatus === 'APPROVED'));
      if (!book) return '';
      const date = h.lastListened ? new Date(h.lastListened).toLocaleDateString('vi-VN') : 'N/A';
      const prog = h.progress || 0;
      return `
        <div data-history-bookid="${book.id}" style="display:flex;gap:1rem;align-items:center;background:var(--bg-main);padding:1rem;border-radius:12px;transition:transform 0.2s;cursor:pointer;"
          onmouseover="this.style.transform='translateX(8px)'" onmouseout="this.style.transform='translateX(0)'">
          <img src="${book.thumbnailUrl}" style="width:55px;height:80px;border-radius:8px;object-fit:cover;flex-shrink:0;" />
          <div style="flex:1;overflow:hidden;">
            <h4 style="margin-bottom:0.2rem;font-size:0.95rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${book.name}</h4>
            <p style="font-size:0.8rem;color:var(--text-muted);margin-bottom:0.4rem;">Đã nghe ${prog}% &bull; ${date}</p>
            <div style="width:100%;height:5px;background:var(--glass-border);border-radius:3px;overflow:hidden;">
              <div style="width:${prog}%;height:100%;background:linear-gradient(90deg,var(--color-primary),var(--color-secondary));border-radius:3px;"></div>
            </div>
          </div>
          <button class="btn-icon play-history-btn" data-bookid="${book.id}" style="width:36px;height:36px;font-size:0.85rem;flex-shrink:0;" title="Nghe tiếp"><i class="fa-solid fa-play"></i></button>
        </div>
      `;
    }).filter(Boolean).join('');
  }

  _buildSubscription() {
    if (this.userData.roleId === 1 || this.userData.roleId === 3) return '';

    const plan = this.userData.subscriptionPlan || 'FREE';
    const endDate = this.userData.subscriptionEndDate
      ? new Date(this.userData.subscriptionEndDate).toLocaleDateString('vi-VN')
      : null;
    const isPremium = plan === 'PREMIUM';
    const isBasic = plan === 'BASIC';
    const isPaid = isPremium || isBasic;
    const paymentInfo = this.userData.paymentInfo;
    const cardIcon = paymentInfo?.cardType === 'visa' ? 'fa-cc-visa' : 'fa-cc-mastercard';

    return `
      <div class="glass-panel" style="padding:1.75rem;background:${isPaid
        ? 'linear-gradient(135deg,hsla(var(--hue-primary),80%,60%,0.1),hsla(var(--hue-secondary),80%,60%,0.1))'
        : 'var(--bg-panel)'};border:1px solid ${isPaid ? 'var(--color-primary)' : 'var(--glass-border)'};">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:1rem;margin-bottom:1.5rem;">
          <div>
            <h3 style="margin-bottom:0.4rem;">
              ${isPremium
        ? '<i class="fa-solid fa-crown" style="color:#ffd700;"></i> Gói Premium'
        : isBasic
          ? '<i class="fa-solid fa-star" style="color:#2ed573;"></i> Gói Cơ bản'
          : '<i class="fa-solid fa-circle" style="color:var(--text-muted);"></i> Gói Miễn phí'}
            </h3>
            ${endDate
        ? `<p style="color:var(--text-muted);font-size:0.88rem;">Hạn sử dụng: <strong style="color:var(--text-main);">${endDate}</strong></p>`
        : `<p style="color:var(--text-muted);font-size:0.88rem;">Nâng cấp để mở khóa toàn bộ tính năng.</p>`}
            
            ${paymentInfo ? `
              <div style="margin-top:0.75rem;display:flex;align-items:center;gap:0.5rem;background:rgba(255,255,255,0.05);padding:0.4rem 0.75rem;border-radius:8px;border:1px solid var(--glass-border);display:inline-flex;">
                <i class="fa-brands ${cardIcon}" style="font-size:1.2rem;color:var(--text-main);"></i>
                <span style="font-size:0.85rem;color:var(--text-muted);">•••• ${paymentInfo.last4}</span>
                <span style="font-size:0.85rem;color:var(--text-muted);margin-left:0.5rem;">(Hết hạn: ${paymentInfo.exp})</span>
              </div>
            ` : ''}
          </div>
          <div style="display:flex;gap:0.75rem;flex-wrap:wrap;align-items:center;">
            <button id="btn-upgrade-plan" class="btn btn-primary" style="background:linear-gradient(135deg,#ffd700,#ff8c00);color:#000;font-weight:700;">
              <i class="fa-solid fa-crown"></i> ${isPremium ? 'Gia hạn' : isBasic ? 'Đổi / Nâng cấp' : 'Nâng cấp Premium'}
            </button>
            ${isPaid ? `<button id="btn-cancel-plan" class="btn" style="background:rgba(255,71,87,0.1);border:1px solid rgba(255,71,87,0.35);color:#ff4757;font-size:0.85rem;">
              <i class="fa-solid fa-ban"></i> Hủy gói
            </button>` : ''}
          </div>
        </div>

        <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:1rem;">
          ${this.plans.map(p => `
            <div style="background:var(--bg-main);padding:1rem;border-radius:12px;border:2px solid ${p.id === plan ? 'var(--color-primary)' : 'transparent'};position:relative;">
              ${p.id === plan ? '<div style="position:absolute;top:-10px;right:10px;background:var(--color-primary);color:#fff;font-size:0.65rem;font-weight:800;padding:2px 8px;border-radius:20px;">HIỆN TẠI</div>' : ''}
              <div style="font-weight:700;margin-bottom:0.3rem;">${p.name}</div>
              <div style="font-size:1.2rem;font-weight:800;color:var(--color-primary);margin-bottom:0.75rem;">${p.price === 0 ? 'Miễn phí' : p.price.toLocaleString('vi-VN') + 'đ/tháng'}</div>
              <ul style="list-style:none;font-size:0.8rem;color:var(--text-muted);display:flex;flex-direction:column;gap:4px;">
                ${p.features.map(f => `<li><i class="fa-solid fa-check" style="color:var(--color-primary);margin-right:4px;"></i>${f}</li>`).join('')}
              </ul>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  _buildFavorites() {
    const favIds = this.favoriteIds || [];
    if (favIds.length === 0) {
      return `
        <div style="text-align:center;padding:2.5rem;color:var(--text-muted);">
          <i class="fa-regular fa-heart" style="font-size:2.5rem;margin-bottom:0.75rem;display:block;"></i>
          <p>Bạn chưa yêu thích cuốn sách nào. <a href="#explore" style="color:var(--color-primary);">Khám phá ngay!</a></p>
        </div>`;
    }
    const favBooks = favIds.map(id => this.books.find(b => b.id === id && (!b.approvalStatus || b.approvalStatus === 'APPROVED'))).filter(Boolean);
    return `
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(130px,1fr));gap:1rem;">
        ${favBooks.map(book => `
          <div data-fav-bookid="${book.id}" style="cursor:pointer;border-radius:14px;overflow:hidden;
            background:var(--bg-main);border:1px solid var(--glass-border);
            transition:all 0.2s;position:relative;"
            onmouseover="this.style.transform='translateY(-4px)';this.style.boxShadow='var(--shadow-lg)'" 
            onmouseout="this.style.transform='';this.style.boxShadow=''">
            <img src="${book.thumbnailUrl}" alt="${book.name}"
              style="width:100%;aspect-ratio:2/3;object-fit:cover;display:block;" />
            <div style="padding:0.6rem 0.7rem;">
              <p style="font-size:0.78rem;font-weight:600;line-height:1.4;
                display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;
                color:var(--text-main);">${book.name}</p>
            </div>
            <button class="remove-fav-btn" data-fav-id="${book.id}" title="Bỏ yêu thích"
              style="position:absolute;top:6px;right:6px;background:rgba(0,0,0,0.55);
              border:none;color:#ff4757;border-radius:50%;width:28px;height:28px;
              display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:0.8rem;
              opacity:0;transition:opacity 0.2s;"
              onmouseover="this.style.background='rgba(255,71,87,0.9)';this.style.color='#fff'"
              onmouseout="this.style.background='rgba(0,0,0,0.55)';this.style.color='#ff4757'">
              <i class="fa-solid fa-xmark"></i>
            </button>
          </div>
        `).join('')}
      </div>`;
  }

  _buildComments() {
    if (this.comments.length === 0) {
      return `<p style="color:var(--text-muted);text-align:center;padding:1.5rem;">Bạn chưa có đánh giá nào.</p>`;
    }
    return this.comments.map(c => {
      const book = this.books.find(b => b.id === c.bookId);
      const stars = '★'.repeat(Math.floor(c.rating || 0));
      const dateStr = c.createdAt ? new Date(c.createdAt).toLocaleDateString('vi-VN') : '';
      return `
        <div style="background:var(--bg-main);padding:1rem;border-radius:12px;display:flex;gap:1rem;align-items:flex-start;">
          <img src="${book?.thumbnailUrl || ''}" style="width:45px;height:65px;border-radius:6px;object-fit:cover;flex-shrink:0;"/>
          <div style="flex:1;">
            <div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:0.5rem;">
              <div>
                <a href="#book?id=${book?.id}" style="font-weight:600;color:var(--text-main);text-decoration:none;
                  transition:color 0.2s;" onmouseover="this.style.color='var(--color-primary)'" onmouseout="this.style.color='var(--text-main)'">${book?.name || 'Sách'}</a>
                <span style="margin-left:0.75rem;color:#ffd700;font-size:0.88rem;">${stars} <span style="color:var(--text-muted);">(${c.rating})</span></span>
              </div>
              <div style="display:flex;align-items:center;gap:0.75rem;">
                <span style="font-size:0.78rem;color:var(--text-muted);">${dateStr}</span>
                <button class="edit-comment-btn" data-cid="${c.id}" style="background:none;border:none;color:var(--text-muted);cursor:pointer;padding:0;transition:color 0.2s;" onmouseover="this.style.color='var(--color-primary)'" onmouseout="this.style.color='var(--text-muted)'" title="Sửa đánh giá"><i class="fa-solid fa-pen"></i></button>
                <button class="delete-comment-btn" data-cid="${c.id}" style="background:none;border:none;color:var(--text-muted);cursor:pointer;padding:0;transition:color 0.2s;" onmouseover="this.style.color='#ff4757'" onmouseout="this.style.color='var(--text-muted)'" title="Xóa đánh giá"><i class="fa-solid fa-trash"></i></button>
              </div>
            </div>
            ${c.title ? `<p style="font-weight:600;margin-top:0.4rem;font-size:0.9rem;">${c.title}</p>` : ''}
            <p style="color:var(--text-muted);font-size:0.85rem;margin-top:0.25rem;line-height:1.6;">${c.content || ''}</p>
          </div>
        </div>
      `;
    }).join('');
  }


  _buildProfileEditor(u) {
    if (!this.isEditing) return '';
    return `
      <div class="glass-panel" style="padding:1.75rem;">
        <h3 style="margin-bottom:1.25rem;">
          <i class="fa-solid fa-user-pen" style="color:var(--color-primary);"></i>
          Chỉnh sửa thông tin cá nhân
        </h3>
        <form id="profile-edit-form" style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:1rem;">
          <label style="display:flex;flex-direction:column;gap:0.4rem;font-size:0.82rem;color:var(--text-muted);font-weight:700;">
            Họ / tên đệm
            <input name="firstName" value="${this._escape(u.firstName)}" style="padding:0.75rem 0.9rem;border-radius:10px;border:1px solid var(--glass-border);background:var(--bg-main);color:var(--text-main);outline:none;" />
          </label>
          <label style="display:flex;flex-direction:column;gap:0.4rem;font-size:0.82rem;color:var(--text-muted);font-weight:700;">
            Tên
            <input name="lastName" value="${this._escape(u.lastName)}" style="padding:0.75rem 0.9rem;border-radius:10px;border:1px solid var(--glass-border);background:var(--bg-main);color:var(--text-main);outline:none;" />
          </label>
          <label style="display:flex;flex-direction:column;gap:0.4rem;font-size:0.82rem;color:var(--text-muted);font-weight:700;">
            Email
            <input name="email" type="email" value="${this._escape(u.email)}" style="padding:0.75rem 0.9rem;border-radius:10px;border:1px solid var(--glass-border);background:var(--bg-main);color:var(--text-main);outline:none;" />
          </label>
          <label style="display:flex;flex-direction:column;gap:0.4rem;font-size:0.82rem;color:var(--text-muted);font-weight:700;">
            Số điện thoại
            <input name="phoneNumber" value="${this._escape(u.phoneNumber)}" style="padding:0.75rem 0.9rem;border-radius:10px;border:1px solid var(--glass-border);background:var(--bg-main);color:var(--text-main);outline:none;" />
          </label>
          <label style="display:flex;flex-direction:column;gap:0.4rem;font-size:0.82rem;color:var(--text-muted);font-weight:700;">
            Ngày sinh
            <input name="birthday" value="${this._escape(u.birthday)}" style="padding:0.75rem 0.9rem;border-radius:10px;border:1px solid var(--glass-border);background:var(--bg-main);color:var(--text-main);outline:none;" />
          </label>
          <label style="display:flex;flex-direction:column;gap:0.4rem;font-size:0.82rem;color:var(--text-muted);font-weight:700;">
            Ảnh đại diện URL
            <input name="thumbnailUrl" value="${this._escape(u.thumbnailUrl)}" style="padding:0.75rem 0.9rem;border-radius:10px;border:1px solid var(--glass-border);background:var(--bg-main);color:var(--text-main);outline:none;" />
          </label>
          <label style="grid-column:1/-1;display:flex;flex-direction:column;gap:0.4rem;font-size:0.82rem;color:var(--text-muted);font-weight:700;">
            Địa chỉ
            <input name="addresses" value="${this._escape(u.addresses)}" style="padding:0.75rem 0.9rem;border-radius:10px;border:1px solid var(--glass-border);background:var(--bg-main);color:var(--text-main);outline:none;" />
          </label>
          <div style="grid-column:1/-1;display:flex;justify-content:flex-end;gap:0.75rem;margin-top:0.5rem;">
            <button id="cancel-profile-edit" type="button" class="btn" style="background:var(--bg-main);border:1px solid var(--glass-border);color:var(--text-main);">
              Hủy
            </button>
            <button type="submit" class="btn btn-primary">
              <i class="fa-solid fa-floppy-disk"></i> Lưu thay đổi
            </button>
          </div>
        </form>
      </div>
    `;
  }

  reRender() {
    const container = document.getElementById('user-dashboard');
    if (!container) return;

    if (this.isLoading) {
      container.innerHTML = `<div style="text-align:center;padding:5rem;"><i class="fa-solid fa-spinner fa-spin fa-3x" style="color:var(--color-primary);"></i></div>`;
      return;
    }

    const u = this.userData;
    const avatarUrl = u.thumbnailUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent((u.firstName || '') + '+' + (u.lastName || ''))}&background=7c3aed&color=fff&size=128`;
    const plan = u.roleId === 1 || u.roleId === 3 ? 'PREMIUM' : (u.subscriptionPlan || 'FREE');
    const roleLabel = this._roleLabel(u.roleId);
    const roleColor = this._roleColor(u.roleId);

    let planBadgeColor = '#ffd700';
    let planBadgeIcon = 'fa-crown';
    let planBadgeBg = 'rgba(255,215,0,0.13)';
    let planBadgeBorder = 'rgba(255,215,0,0.35)';
    if (plan === 'FREE') {
      planBadgeColor = 'var(--text-muted)';
      planBadgeIcon = 'fa-user';
      planBadgeBg = 'rgba(255,255,255,0.05)';
      planBadgeBorder = 'rgba(255,255,255,0.2)';
    } else if (plan === 'BASIC') {
      planBadgeColor = '#2ed573';
      planBadgeIcon = 'fa-star';
      planBadgeBg = 'rgba(46,213,115,0.13)';
      planBadgeBorder = 'rgba(46,213,115,0.35)';
    }

    container.innerHTML = `
      <div style="display:grid;grid-template-columns:280px 1fr;gap:2rem;">

        <!-- LEFT: Profile card -->
        <div style="display:flex;flex-direction:column;gap:1.5rem;">
          <div class="glass-panel" style="padding:2rem;text-align:center;position:relative;overflow:hidden;">
            <div style="position:absolute;top:0;left:0;width:100%;height:90px;background:linear-gradient(135deg,var(--color-primary),var(--color-secondary));opacity:0.15;"></div>
            <div style="position:relative;z-index:1;">
              <img src="${avatarUrl}" alt="${u.username}" style="width:100px;height:100px;border-radius:50%;object-fit:cover;margin:0 auto 1rem auto;display:block;border:3px solid var(--color-primary);box-shadow:var(--shadow-glow);" />
              <h2 style="font-size:1.3rem;margin-bottom:0.2rem;">${u.firstName} ${u.lastName}</h2>
              <p style="color:var(--text-muted);font-size:0.85rem;margin-bottom:1.25rem;">@${u.username}</p>
              <div style="display:flex;justify-content:center;gap:0.5rem;flex-wrap:wrap;margin-bottom:1rem;">
                <span style="background:${roleColor}22;color:${roleColor};border:1px solid ${roleColor}55;padding:3px 10px;border-radius:20px;font-size:0.72rem;font-weight:800;">${roleLabel}</span>
                <span style="background:${planBadgeBg};color:${planBadgeColor};border:1px solid ${planBadgeBorder};padding:3px 10px;border-radius:20px;font-size:0.72rem;font-weight:800;">
                  <i class="fa-solid ${planBadgeIcon}"></i> ${plan}
                </span>
              </div>
              <div style="display:flex;flex-direction:column;gap:0.6rem;text-align:left;background:var(--bg-main);padding:1rem;border-radius:12px;font-size:0.85rem;">
                <p><i class="fa-solid fa-envelope" style="color:var(--color-primary);width:18px;"></i> ${u.email}</p>
                <p><i class="fa-solid fa-phone" style="color:var(--color-primary);width:18px;"></i> ${u.phoneNumber || 'Chưa cập nhật'}</p>
                <p><i class="fa-solid fa-location-dot" style="color:var(--color-primary);width:18px;"></i> ${u.addresses || 'Chưa cập nhật'}</p>
                <p><i class="fa-solid fa-cake-candles" style="color:var(--color-primary);width:18px;"></i> ${u.birthday || 'Chưa cập nhật'}</p>
              </div>
              <button id="edit-profile-btn" class="btn btn-primary" style="width:100%;margin-top:1rem;font-size:0.9rem;">
                <i class="fa-solid fa-pen"></i> Chỉnh sửa hồ sơ
              </button>
              <button id="profile-logout-btn" class="btn" style="width:100%;margin-top:0.5rem;font-size:0.9rem;background:rgba(255,71,87,0.1);border:1px solid rgba(255,71,87,0.3);color:#ff4757;">
                <i class="fa-solid fa-right-from-bracket"></i> Đăng xuất
              </button>
            </div>
          </div>

          <!-- Stats mini -->
          <div class="glass-panel" style="padding:1.25rem;">
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem;text-align:center;">
              <div><div style="font-size:1.6rem;font-weight:800;color:var(--color-primary);">${(this.readingHistory || []).length}</div><div style="font-size:0.78rem;color:var(--text-muted);">Đang nghe</div></div>
              <div><div style="font-size:1.6rem;font-weight:800;color:var(--color-secondary);">${this.comments.length}</div><div style="font-size:0.78rem;color:var(--text-muted);">Đánh giá</div></div>
              <div><div style="font-size:1.6rem;font-weight:800;color:var(--color-accent);">${(this.favoriteIds || []).length}</div><div style="font-size:0.78rem;color:var(--text-muted);">Yêu thích</div></div>
              <div><div style="font-size:1.1rem;font-weight:800;color:#ffd700;">${plan}</div><div style="font-size:0.78rem;color:var(--text-muted);">Gói hiện tại</div></div>
            </div>
          </div>
        </div>

        <!-- RIGHT: Main content -->
        <div style="display:flex;flex-direction:column;gap:2rem;">

          ${this._buildProfileEditor(u)}

          <!-- Subscription -->
          ${this._buildSubscription()}

          <!-- Favorites -->
          <div class="glass-panel" style="padding:1.75rem;">
            <div style="display:flex;align-items:center;gap:0.75rem;margin-bottom:1.25rem;">
              <i class="fa-solid fa-heart" style="color:#ff4757;"></i>
              <h3 style="margin:0;">Yêu thích</h3>
              <span style="background:var(--bg-main);border:1px solid var(--glass-border);border-radius:20px;padding:2px 10px;font-size:0.78rem;color:var(--text-muted);">${(this.favoriteIds || []).length}</span>
            </div>
            <div id="favorites-grid">
              ${this._buildFavorites()}
            </div>
          </div>

          <!-- Reading History -->
          <div class="glass-panel" style="padding:1.75rem;">
            <h3 style="margin-bottom:1.25rem;"><i class="fa-solid fa-clock-rotate-left" style="color:var(--color-primary);"></i> Lịch sử nghe</h3>
            <div style="display:flex;flex-direction:column;gap:0.75rem;">
              ${this._buildReadingHistory()}
            </div>
          </div>

          <!-- My Reviews -->
          <div class="glass-panel" style="padding:1.75rem;">
            <div style="display:flex;align-items:center;gap:0.75rem;margin-bottom:1.25rem;">
              <i class="fa-solid fa-star" style="color:#ffd700;"></i>
              <h3 style="margin:0;">Đánh giá của tôi</h3>
              <span style="background:var(--bg-main);border:1px solid var(--glass-border);border-radius:20px;padding:2px 10px;font-size:0.78rem;color:var(--text-muted);">${this.comments.length}</span>
            </div>
            <div id="user-comments-list" style="display:flex;flex-direction:column;gap:0.75rem;">
              ${this._buildComments()}
            </div>
          </div>
        </div>
      </div>
    `;

    this._attachProfileEvents();
    this._attachFavoriteEvents();
  }



  _attachFavoriteEvents() {
    // Hover to show remove btn
    document.querySelectorAll('[data-fav-bookid]').forEach(card => {
      const removeBtn = card.querySelector('.remove-fav-btn');
      card.addEventListener('mouseenter', () => { if (removeBtn) removeBtn.style.opacity = '1'; });
      card.addEventListener('mouseleave', () => { if (removeBtn) removeBtn.style.opacity = '0'; });
    });

    // Click card → navigate to book
    document.querySelectorAll('[data-fav-bookid]').forEach(card => {
      card.addEventListener('click', (e) => {
        if (e.target.closest('.remove-fav-btn')) return; // don't navigate when clicking remove
        window.location.hash = `#book?id=${card.dataset.favBookid}`;
      });
    });

    // Remove favorite
    document.querySelectorAll('.remove-fav-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const bookId = parseInt(btn.dataset.favId);
        const currentUser = AuthService.getUser();
        if (!currentUser) return;
        MockDbService.removeFavorite(currentUser.id, bookId);
        this.favoriteIds = [...this.favoriteIds].filter(id => id !== bookId);
        document.getElementById('favorites-grid').innerHTML = this._buildFavorites();
        this._attachFavoriteEvents();
      });
    });
  }

  _confirm(msg, onConfirm) {
    const ov = document.createElement('div');
    ov.style.cssText = 'position:fixed;top:0;left:0;width:100vw;height:100vh;background:rgba(0,0,0,0.6);z-index:99999;display:flex;align-items:center;justify-content:center;backdrop-filter:blur(4px);';
    ov.innerHTML = `
      <div style="background:var(--bg-panel);border:1px solid var(--glass-border);border-radius:16px;padding:2rem;max-width:350px;text-align:center;box-shadow:var(--shadow-lg);transform:scale(0.9);opacity:0;transition:all 0.2s;">
        <i class="fa-solid fa-triangle-exclamation" style="font-size:2.5rem;color:#ff4757;margin-bottom:1rem;"></i>
        <h3 style="margin-bottom:0.75rem;font-size:1.15rem;">Xác nhận xóa</h3>
        <p style="color:var(--text-muted);font-size:0.9rem;line-height:1.5;margin-bottom:1.5rem;">${msg}</p>
        <div style="display:flex;gap:0.75rem;justify-content:center;">
          <button id="cf-cancel" class="btn" style="flex:1;background:var(--bg-main);border:1px solid var(--glass-border);color:var(--text-main);padding:0.6rem;">Hủy</button>
          <button id="cf-ok" class="btn" style="flex:1;background:#ff4757;border:none;color:#fff;padding:0.6rem;">Xóa</button>
        </div>
      </div>
    `;
    document.body.appendChild(ov);
    const box = ov.firstElementChild;
    setTimeout(() => { box.style.transform = 'scale(1)'; box.style.opacity = '1'; }, 10);

    const close = () => {
      box.style.transform = 'scale(0.9)'; box.style.opacity = '0';
      setTimeout(() => ov.remove(), 200);
    };

    ov.querySelector('#cf-cancel').onclick = close;
    ov.querySelector('#cf-ok').onclick = () => { close(); onConfirm(); };
  }

  _attachProfileEvents() {
    // History row click → go to book detail; Play button → go to player
    document.querySelectorAll('[data-history-bookid]').forEach(row => {
      row.addEventListener('click', (e) => {
        if (e.target.closest('.play-history-btn')) return;
        window.location.hash = `#book?id=${row.dataset.historyBookid}`;
      });
    });
    document.querySelectorAll('.play-history-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        window.location.hash = `#player?id=${btn.dataset.bookid}`;
      });
    });

    // Delete comment from User Dashboard
    document.querySelectorAll('.delete-comment-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        this._confirm('Bạn có chắc muốn xóa đánh giá này?', () => {
          const cid = parseInt(btn.dataset.cid, 10);
          MockDbService.deleteComment(cid);
          this.comments = this.comments.filter(c => parseInt(c.id, 10) !== cid);
          this.reRender();
        });
      });
    });

    // Edit comment from User Dashboard
    document.querySelectorAll('.edit-comment-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const cid = parseInt(btn.dataset.cid, 10);
        const comment = this.comments.find(c => parseInt(c.id, 10) === cid);
        if (comment) {
          const newText = prompt('Nhập nội dung đánh giá mới:', comment.content || '');
          if (newText !== null) {
            const newRatingStr = prompt('Nhập số sao (1-5):', comment.rating || 5);
            let newRating = parseInt(newRatingStr, 10);
            if (isNaN(newRating) || newRating < 1 || newRating > 5) newRating = comment.rating;

            comment.content = newText.trim();
            comment.rating = newRating;
            MockDbService.editComment(cid, { content: comment.content, rating: comment.rating });
            this.reRender();
          }
        }
      });
    });

    document.getElementById('edit-profile-btn')?.addEventListener('click', () => {
      this.isEditing = true;
      this.reRender();
      document.getElementById('profile-edit-form')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });

    document.getElementById('profile-logout-btn')?.addEventListener('click', () => {
      this._showConfirm('Đăng xuất', 'Bạn có chắc chắn muốn đăng xuất khỏi tài khoản?', () => {
        AuthService.logout();
      });
    });

    document.getElementById('cancel-profile-edit')?.addEventListener('click', () => {
      this.isEditing = false;
      this.reRender();
    });

    document.getElementById('profile-edit-form')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const form = e.currentTarget;
      const data = new FormData(form);
      const updates = {
        firstName: data.get('firstName')?.toString().trim() || '',
        lastName: data.get('lastName')?.toString().trim() || '',
        email: data.get('email')?.toString().trim() || '',
        phoneNumber: data.get('phoneNumber')?.toString().trim() || '',
        birthday: data.get('birthday')?.toString().trim() || '',
        thumbnailUrl: data.get('thumbnailUrl')?.toString().trim() || '',
        addresses: data.get('addresses')?.toString().trim() || '',
      };
      const updatedUser = AuthService.updateUser(updates);
      this.userData = this._normalizeUser({ ...this.userData, ...updatedUser });
      this.isEditing = false;
      this.reRender();
    });

    // --- Subscription buttons ---
    document.getElementById('btn-upgrade-plan')?.addEventListener('click', () => {
      PaymentModal.open(
        this.plans,
        this.userData.subscriptionPlan || 'FREE',
        () => {
          this.userData = this._normalizeUser(AuthService.getUser());
          this.reRender();
        }
      );
    });

    document.getElementById('btn-cancel-plan')?.addEventListener('click', () => {
      const planName = this.userData.subscriptionPlan;
      this._showConfirm(
        'Xác nhận hủy gói',
        `Bạn có chắc muốn hủy gói <strong>${planName}</strong>?<br><br>Bạn sẽ trở về gói Miễn phí và thông tin thanh toán sẽ bị xóa ngay lập tức.`,
        async () => {
          const currentUser = AuthService.getUser();
          if (currentUser) {
            try {
              const res = await fetch('/api/subscription', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  userId: currentUser.id,
                  action: 'CANCEL'
                })
              });
              const data = await res.json();
              if (data.success && data.data) {
                AuthService.updateUser({
                  subscriptionPlan: data.data.subscriptionPlan,
                  subscriptionEndDate: data.data.subscriptionEndDate,
                  paymentInfo: data.data.paymentInfo,
                  subscriptionHistory: data.data.subscriptionHistory
                });
              } else {
                AuthService.cancelSubscription();
              }
            } catch (err) {
              console.error(err);
              AuthService.cancelSubscription();
            }
          } else {
            AuthService.cancelSubscription();
          }

          this.userData = this._normalizeUser(AuthService.getUser());
          this.reRender();
          // Toast notification
          const toast = document.createElement('div');
          toast.style.cssText = `
            position:fixed;bottom:100px;right:24px;z-index:9999;
            background:#ff4757;color:#fff;padding:0.8rem 1.4rem;
            border-radius:12px;font-weight:600;
            box-shadow:0 8px 24px rgba(0,0,0,0.3);
            animation:pmSlideIn 0.3s ease;
          `;
          toast.innerHTML = '<i class="fa-solid fa-ban" style="margin-right:8px;"></i>Đã hủy gói thành công';
          document.body.appendChild(toast);
          setTimeout(() => toast.remove(), 3000);
        }
      );
    });
  }

  _showConfirm(title, message, onConfirm) {
    const overlay = document.createElement('div');
    overlay.style.cssText = `
      position:fixed;inset:0;background:rgba(0,0,0,0.7);backdrop-filter:blur(5px);
      display:flex;align-items:center;justify-content:center;z-index:9999;
      animation: pmSlideIn 0.2s ease;
    `;
    overlay.innerHTML = `
      <div style="background:var(--bg-panel-solid);padding:2.5rem 2rem;border-radius:20px;border:1px solid var(--glass-border);max-width:400px;text-align:center;box-shadow:0 24px 64px rgba(0,0,0,0.5);">
        <div style="font-size:3rem;color:#ff4757;margin-bottom:1rem;"><i class="fa-solid fa-circle-exclamation"></i></div>
        <h3 style="margin-bottom:1rem;color:var(--text-main);font-size:1.4rem;">${title}</h3>
        <p style="color:var(--text-muted);margin-bottom:2rem;font-size:0.95rem;line-height:1.6;">${message}</p>
        <div style="display:flex;gap:1rem;justify-content:center;">
          <button id="confirm-no" class="btn" style="flex:1;background:var(--bg-main);border:1px solid var(--glass-border);color:var(--text-main);">Hủy</button>
          <button id="confirm-yes" class="btn btn-primary" style="flex:1;background:#ff4757;color:#fff;">Đồng ý</button>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);

    document.getElementById('confirm-no').onclick = () => overlay.remove();
    document.getElementById('confirm-yes').onclick = () => {
      overlay.remove();
      if (onConfirm) onConfirm();
    };
  }

  afterRender() {
    PaymentModal.mount();
    this.fetchData();
  }

  render() {
    const user = AuthService.getUser();
    return `
      <div class="container" style="padding-top:2rem;padding-bottom:4rem;">
        <div style="margin-bottom:2rem;" class="animate-slide-up">
          <h1 class="text-gradient">Trang cá nhân</h1>
          <p style="color:var(--text-muted);">Xin chào, <strong>${user?.firstName || user?.username}!</strong> Quản lý hồ sơ, lịch sử nghe và gói thành viên.</p>
        </div>
        <div id="user-dashboard" class="animate-slide-up stagger-1">
          <div style="text-align:center;padding:5rem;"><i class="fa-solid fa-spinner fa-spin fa-3x" style="color:var(--color-primary);"></i></div>
        </div>
      </div>
    `;
  }
}
