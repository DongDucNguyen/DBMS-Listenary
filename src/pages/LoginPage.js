import { AuthService } from '../services/AuthService.js';

export class LoginPage {
  constructor() {
    this.isLoading = false;
    this.isSignup = false;
  }

  reRender() {
    const app = document.getElementById('app') || document.body;
    app.innerHTML = this.render();
    this.afterRender();
  }

  render() {
    return `
      <div style="
        min-height: calc(100vh - 80px);
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 2rem;
      ">
        <!-- Left: Branding -->
        <div style="
          flex: 1;
          max-width: 480px;
          padding: 3rem;
          display: flex;
          flex-direction: column;
          justify-content: center;
        " class="animate-slide-up">
          <div style="font-size: 3rem; font-weight: 800; font-family: var(--font-serif); margin-bottom: 1rem;" class="text-gradient">
            <i class="fa-solid fa-headphones"></i> LISTENARY
          </div>
          <h2 style="font-size: 2rem; margin-bottom: 1rem;">Kho sách nói trong tay bạn</h2>
          <p style="color: var(--text-muted); font-size: 1.1rem; line-height: 1.8;">
            Hàng ngàn cuốn sách nói chất lượng cao. Nghe mọi lúc, mọi nơi với trải nghiệm đỉnh cao.
          </p>

          <div style="display: flex; gap: 1.5rem; margin-top: 2.5rem;">
            <div style="text-align: center;">
              <div style="font-size: 1.8rem; font-weight: 800; color: var(--color-primary);">50+</div>
              <div style="font-size: 0.85rem; color: var(--text-muted);">Tựa sách</div>
            </div>
            <div style="width: 1px; background: var(--glass-border);"></div>
            <div style="text-align: center;">
              <div style="font-size: 1.8rem; font-weight: 800; color: var(--color-secondary);">43+</div>
              <div style="font-size: 0.85rem; color: var(--text-muted);">Tác giả</div>
            </div>
            <div style="width: 1px; background: var(--glass-border);"></div>
            <div style="text-align: center;">
              <div style="font-size: 1.8rem; font-weight: 800; color: var(--color-accent);">3</div>
              <div style="font-size: 0.85rem; color: var(--text-muted);">Gói thành viên</div>
            </div>
          </div>
        </div>

        <!-- Divider -->
        <div style="width: 1px; height: 400px; background: var(--glass-border); margin: 0 3rem;"></div>

        <!-- Right: Auth Form -->
        <div class="glass-panel animate-slide-up stagger-2" style="
          flex: 1;
          max-width: 420px;
          padding: 3rem;
        ">
          <h2 style="font-size: 1.8rem; margin-bottom: 0.5rem;">${this.isSignup ? 'Tạo tài khoản' : 'Đăng nhập'}</h2>
          <p style="color: var(--text-muted); margin-bottom: 2rem;">
            ${this.isSignup ? 'Tạo tài khoản mới để bắt đầu nghe sách.' : 'Chào mừng trở lại! Vui lòng đăng nhập để tiếp tục.'}
          </p>

          <div id="auth-error" style="
            display: none;
            background: rgba(255, 71, 87, 0.15);
            border: 1px solid rgba(255, 71, 87, 0.4);
            color: #ff4757;
            padding: 0.75rem 1rem;
            border-radius: 10px;
            margin-bottom: 1rem;
            font-size: 0.9rem;
          ">
            <i class="fa-solid fa-circle-exclamation"></i> <span id="auth-error-text"></span>
          </div>

          <form id="auth-form" style="display: flex; flex-direction: column; gap: 1.25rem;">
            <div>
              <label style="display: block; font-size: 0.9rem; font-weight: 600; margin-bottom: 0.5rem; color: var(--text-muted);">Tên đăng nhập</label>
              <div style="position: relative;">
                <i class="fa-solid fa-user" style="position: absolute; left: 14px; top: 50%; transform: translateY(-50%); color: var(--text-muted);"></i>
                <input
                  id="auth-username"
                  type="text"
                  placeholder="Nhập tên đăng nhập..."
                  autocomplete="username"
                  required
                  style="
                    width: 100%;
                    padding: 0.875rem 1rem 0.875rem 2.75rem;
                    background: var(--bg-main);
                    border: 1px solid var(--glass-border);
                    border-radius: 12px;
                    color: var(--text-main);
                    font-size: 1rem;
                    font-family: var(--font-sans);
                    outline: none;
                    transition: all var(--transition-fast);
                  "
                  onfocus="this.style.borderColor='var(--color-primary)'; this.style.boxShadow='0 0 0 3px hsla(260,80%,60%,0.15)'"
                  onblur="this.style.borderColor='var(--glass-border)'; this.style.boxShadow='none'"
                />
              </div>
            </div>

            ${this.isSignup ? `
            <div>
              <label style="display: block; font-size: 0.9rem; font-weight: 600; margin-bottom: 0.5rem; color: var(--text-muted);">Email</label>
              <div style="position: relative;">
                <i class="fa-solid fa-envelope" style="position: absolute; left: 14px; top: 50%; transform: translateY(-50%); color: var(--text-muted);"></i>
                <input
                  id="auth-email"
                  type="email"
                  placeholder="Nhập email của bạn..."
                  autocomplete="email"
                  required
                  style="
                    width: 100%;
                    padding: 0.875rem 1rem 0.875rem 2.75rem;
                    background: var(--bg-main);
                    border: 1px solid var(--glass-border);
                    border-radius: 12px;
                    color: var(--text-main);
                    font-size: 1rem;
                    font-family: var(--font-sans);
                    outline: none;
                    transition: all var(--transition-fast);
                  "
                  onfocus="this.style.borderColor='var(--color-primary)'; this.style.boxShadow='0 0 0 3px hsla(260,80%,60%,0.15)'"
                  onblur="this.style.borderColor='var(--glass-border)'; this.style.boxShadow='none'"
                />
              </div>
            </div>
            ` : ''}

            <div>
              <label style="display: block; font-size: 0.9rem; font-weight: 600; margin-bottom: 0.5rem; color: var(--text-muted);">Mật khẩu</label>
              <div style="position: relative;">
                <i class="fa-solid fa-lock" style="position: absolute; left: 14px; top: 50%; transform: translateY(-50%); color: var(--text-muted);"></i>
                <input
                  id="auth-password"
                  type="${this.isSignup ? 'password' : 'password'}"
                  placeholder="Nhập mật khẩu..."
                  autocomplete="${this.isSignup ? 'new-password' : 'current-password'}"
                  required
                  style="
                    width: 100%;
                    padding: 0.875rem 2.75rem 0.875rem 2.75rem;
                    background: var(--bg-main);
                    border: 1px solid var(--glass-border);
                    border-radius: 12px;
                    color: var(--text-main);
                    font-size: 1rem;
                    font-family: var(--font-sans);
                    outline: none;
                    transition: all var(--transition-fast);
                  "
                  onfocus="this.style.borderColor='var(--color-primary)'; this.style.boxShadow='0 0 0 3px hsla(260,80%,60%,0.15)'"
                  onblur="this.style.borderColor='var(--glass-border)'; this.style.boxShadow='none'"
                />
                <button type="button" id="toggle-password" style="position: absolute; right: 14px; top: 50%; transform: translateY(-50%); background: none; border: none; cursor: pointer; color: var(--text-muted);">
                  <i class="fa-solid fa-eye"></i>
                </button>
              </div>
            </div>

            ${this.isSignup ? `
            <div>
              <label style="display: block; font-size: 0.9rem; font-weight: 600; margin-bottom: 0.5rem; color: var(--text-muted);">Xác nhận mật khẩu</label>
              <div style="position: relative;">
                <i class="fa-solid fa-lock" style="position: absolute; left: 14px; top: 50%; transform: translateY(-50%); color: var(--text-muted);"></i>
                <input
                  id="auth-confirm-password"
                  type="password"
                  placeholder="Xác nhận mật khẩu..."
                  autocomplete="new-password"
                  required
                  style="
                    width: 100%;
                    padding: 0.875rem 2.75rem 0.875rem 2.75rem;
                    background: var(--bg-main);
                    border: 1px solid var(--glass-border);
                    border-radius: 12px;
                    color: var(--text-main);
                    font-size: 1rem;
                    font-family: var(--font-sans);
                    outline: none;
                    transition: all var(--transition-fast);
                  "
                  onfocus="this.style.borderColor='var(--color-primary)'; this.style.boxShadow='0 0 0 3px hsla(260,80%,60%,0.15)'"
                  onblur="this.style.borderColor='var(--glass-border)'; this.style.boxShadow='none'"
                />
              </div>
            </div>
            ` : ''}

            <!-- Quick Account Hints, only in Login mode -->
            ${!this.isSignup ? `
            <div style="background: var(--bg-main); padding: 0.75rem 1rem; border-radius: 10px; font-size: 0.82rem; color: var(--text-muted);">
              <p style="font-weight: 600; margin-bottom: 0.4rem; color: var(--text-main);">Tài khoản demo:</p>
              <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 0.5rem;">
                <button type="button" class="demo-account-btn" data-user="admin" data-pass="admin123" style="background: var(--bg-panel); border: 1px solid var(--glass-border); border-radius: 8px; padding: 6px 8px; cursor: pointer; color: var(--text-main); font-size: 0.8rem; transition: all 0.2s;">
                  <div style="color: #ffd700; font-size: 0.7rem;">ADMIN</div>
                  <div>admin</div>
                </button>
                <button type="button" class="demo-account-btn" data-user="bob" data-pass="bob123" style="background: var(--bg-panel); border: 1px solid var(--glass-border); border-radius: 8px; padding: 6px 8px; cursor: pointer; color: var(--text-main); font-size: 0.8rem; transition: all 0.2s;">
                  <div style="color: #2ed573; font-size: 0.7rem;">USER</div>
                  <div>bob</div>
                </button>
                <button type="button" class="demo-account-btn" data-user="aristotle_author" data-pass="author123" style="background: var(--bg-panel); border: 1px solid var(--glass-border); border-radius: 8px; padding: 6px 8px; cursor: pointer; color: var(--text-main); font-size: 0.8rem; transition: all 0.2s;">
                  <div style="color: var(--color-accent); font-size: 0.7rem;">AUTHOR</div>
                  <div>aristotle</div>
                </button>
              </div>
            </div>
            ` : ''}

            <button type="submit" id="auth-btn" class="btn btn-primary" style="width: 100%; padding: 1rem; font-size: 1rem; position: relative; overflow: hidden; margin-top: 0.5rem;">
              <span id="auth-btn-text">
                ${this.isSignup ? '<i class="fa-solid fa-user-plus"></i> Đăng ký' : '<i class="fa-solid fa-right-to-bracket"></i> Đăng nhập'}
              </span>
            </button>
          </form>

          <p style="text-align: center; margin-top: 1.5rem; color: var(--text-muted); font-size: 0.9rem;">
            ${this.isSignup 
              ? `Đã có tài khoản? <a href="#" id="toggle-auth-mode" style="color: var(--color-primary); font-weight: 600;">Đăng nhập ngay</a>`
              : `Chưa có tài khoản? <a href="#" id="toggle-auth-mode" style="color: var(--color-primary); font-weight: 600;">Đăng ký ngay</a>`
            }
          </p>
        </div>
      </div>
    `;
  }

  afterRender() {
    const form = document.getElementById('auth-form');
    const errorBox = document.getElementById('auth-error');
    const errorText = document.getElementById('auth-error-text');
    const btn = document.getElementById('auth-btn');
    const btnText = document.getElementById('auth-btn-text');
    const togglePasswordBtn = document.getElementById('toggle-password');
    const passwordInput = document.getElementById('auth-password');
    const toggleModeLinks = document.querySelectorAll('#toggle-auth-mode');

    // Toggle Mode
    toggleModeLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        this.isSignup = !this.isSignup;
        this.reRender();
      });
    });

    // Toggle password visibility
    if (togglePasswordBtn) {
      togglePasswordBtn.addEventListener('click', () => {
        const type = passwordInput.type === 'password' ? 'text' : 'password';
        passwordInput.type = type;
        togglePasswordBtn.innerHTML = type === 'password'
          ? '<i class="fa-solid fa-eye"></i>'
          : '<i class="fa-solid fa-eye-slash"></i>';
      });
    }

    // Demo account quick-fill buttons
    if (!this.isSignup) {
      document.querySelectorAll('.demo-account-btn').forEach(demoBtn => {
        demoBtn.addEventListener('click', () => {
          document.getElementById('auth-username').value = demoBtn.dataset.user;
          document.getElementById('auth-password').value = demoBtn.dataset.pass;
          demoBtn.style.borderColor = 'var(--color-primary)';
          setTimeout(() => demoBtn.style.borderColor = 'var(--glass-border)', 800);
        });
      });
    }

    // Handle form submit
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const username = document.getElementById('auth-username').value.trim();
      const password = document.getElementById('auth-password').value;
      let email = '';
      let confirmPassword = '';

      if (this.isSignup) {
        email = document.getElementById('auth-email').value.trim();
        confirmPassword = document.getElementById('auth-confirm-password').value;
        if (!username || !password || !email || !confirmPassword) {
          this.showError(errorBox, errorText, 'Vui lòng nhập đầy đủ thông tin đăng ký.');
          return;
        }
        if (password !== confirmPassword) {
          this.showError(errorBox, errorText, 'Mật khẩu xác nhận không khớp.');
          return;
        }
      } else {
        if (!username || !password) {
          this.showError(errorBox, errorText, 'Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu.');
          return;
        }
      }

      btn.disabled = true;
      btnText.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> ${this.isSignup ? 'Đang đăng ký...' : 'Đang đăng nhập...'}`;

      try {
        if (this.isSignup) {
          // Register flow
          await AuthService.register(username, email, password);
          alert('Đăng ký thành công! Vui lòng tiến hành đăng nhập.');
          this.isSignup = false;
          this.reRender();
        } else {
          // Login flow
          const user = await AuthService.login(username, password);
          const params = new URLSearchParams(window.location.hash.split('?')[1] || '');
          const redirect = params.get('redirect');
          const safeRedirect = redirect?.startsWith('#') && !redirect.startsWith('#login')
            ? redirect
            : null;
          const targetRoute = safeRedirect || AuthService.defaultRouteForRole(user.roleId);
          window.location.hash = targetRoute;
        }
      } catch (err) {
        this.showError(errorBox, errorText, err.message);
      } finally {
        if (btn) {
          btn.disabled = false;
          btnText.innerHTML = this.isSignup ? '<i class="fa-solid fa-user-plus"></i> Đăng ký' : '<i class="fa-solid fa-right-to-bracket"></i> Đăng nhập';
        }
      }
    });
  }

  showError(box, textEl, msg) {
    textEl.textContent = msg;
    box.style.display = 'block';
    box.animate([{ opacity: 0, transform: 'translateY(-8px)' }, { opacity: 1, transform: 'translateY(0)' }], { duration: 300 });
    setTimeout(() => box.style.display = 'none', 4000);
  }
}
