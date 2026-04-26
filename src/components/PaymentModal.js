import { AuthService } from '../services/AuthService.js';

export class PaymentModal {
  static _overlay = null;

  static mount() {
    if (document.getElementById('payment-modal-overlay')) return;
    const overlay = document.createElement('div');
    overlay.id = 'payment-modal-overlay';
    overlay.style.cssText = `
      position:fixed;inset:0;z-index:9000;display:none;
      align-items:center;justify-content:center;
      background:rgba(0,0,0,0.7);backdrop-filter:blur(6px);
      padding:1rem;
    `;
    overlay.innerHTML = `<div id="payment-modal-box" style="
      background:var(--bg-panel-solid);border:1px solid var(--glass-border);
      border-radius:24px;width:100%;max-width:560px;max-height:95vh;
      overflow-y:auto;overflow-x:hidden;box-shadow:0 24px 64px rgba(0,0,0,0.5);
      margin:auto;
      animation:pmSlideIn 0.4s cubic-bezier(0.16,1,0.3,1) forwards;
    "></div>`;
    const style = document.createElement('style');
    style.textContent = `
      @keyframes pmSlideIn{from{opacity:0;transform:translateY(40px) scale(0.95)}to{opacity:1;transform:none}}
      @keyframes pmSpin{to{transform:rotate(360deg)}}
      @keyframes pmPop{0%{transform:scale(0.5)}70%{transform:scale(1.1)}100%{transform:scale(1)}}
      .pm-card-scene{width:340px;height:200px;perspective:900px;margin:0 auto 1.5rem}
      .pm-card-inner{width:100%;height:100%;position:relative;transform-style:preserve-3d;transition:transform 0.7s cubic-bezier(0.16,1,0.3,1)}
      .pm-card-inner.flipped{transform:rotateY(180deg)}
      .pm-card-face{position:absolute;inset:0;border-radius:18px;backface-visibility:hidden;-webkit-backface-visibility:hidden;padding:1.5rem}
      .pm-card-front{background:linear-gradient(135deg,#1a1a2e,#16213e,#0f3460);color:#fff}
      .pm-card-back{background:linear-gradient(135deg,#0f3460,#16213e,#1a1a2e);color:#fff;transform:rotateY(180deg)}
      .pm-input{width:100%;padding:0.75rem 1rem;border-radius:10px;border:1px solid var(--glass-border);
        background:var(--bg-main);color:var(--text-main);font-family:inherit;font-size:0.95rem;outline:none;
        transition:border-color 0.2s}
      .pm-input:focus{border-color:var(--color-primary)}
      .pm-plan-card{border:2px solid var(--glass-border);border-radius:14px;padding:1.1rem 1.2rem;
        cursor:pointer;transition:all 0.25s;background:var(--bg-main)}
      .pm-plan-card:hover{border-color:var(--color-primary);transform:translateY(-2px)}
      .pm-plan-card.selected{border-color:var(--color-primary);background:hsla(260,80%,60%,0.08)}
      .pm-step{display:none}.pm-step.active{display:block}
      .pm-spinner{width:56px;height:56px;border:4px solid var(--glass-border);
        border-top-color:var(--color-primary);border-radius:50%;
        animation:pmSpin 0.8s linear infinite;margin:0 auto}
      .pm-success-icon{font-size:4rem;animation:pmPop 0.5s ease forwards;text-align:center}
      #payment-modal-box::-webkit-scrollbar { width: 6px; }
      #payment-modal-box::-webkit-scrollbar-track { background: transparent; }
      #payment-modal-box::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.2); border-radius: 4px; }
      #payment-modal-box::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.4); }
    `;
    document.head.appendChild(style);
    document.body.appendChild(overlay);
    overlay.addEventListener('click', (e) => { if (e.target === overlay) PaymentModal.close(); });
    this._overlay = overlay;
  }

  static open(plans, currentPlan, onSuccess) {
    const overlay = document.getElementById('payment-modal-overlay');
    if (!overlay) { this.mount(); }
    this._plans = plans;
    this._currentPlan = currentPlan;
    this._onSuccess = onSuccess;
    this._selectedPlan = null;
    this._cardType = null;

    this._renderStep('select');
    overlay.style.display = 'flex';
    setTimeout(() => overlay.style.opacity = '1', 10);
  }

  static close() {
    const overlay = document.getElementById('payment-modal-overlay');
    if (overlay) overlay.style.display = 'none';
  }

  static _renderStep(step) {
    const box = document.getElementById('payment-modal-box');
    if (!box) return;
    if (step === 'select') box.innerHTML = this._htmlSelect();
    else if (step === 'pay') box.innerHTML = this._htmlPay();
    else if (step === 'processing') box.innerHTML = this._htmlProcessing();
    else if (step === 'success') box.innerHTML = this._htmlSuccess();
    this._attachEvents(step);
  }

  static _htmlSelect() {
    const plans = (this._plans || []).filter(p => p.id !== 'FREE');
    return `
      <div style="padding:2rem">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1.5rem">
          <h2 style="font-size:1.4rem;margin:0">
            <i class="fa-solid fa-crown" style="color:#ffd700;margin-right:0.5rem"></i>Chọn gói thành viên
          </h2>
          <button id="pm-close" style="background:none;border:none;cursor:pointer;color:var(--text-muted);font-size:1.3rem">
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>
        <p style="color:var(--text-muted);margin-bottom:1.5rem;font-size:0.9rem">
          Gói hiện tại: <strong style="color:var(--text-main)">${this._currentPlan || 'FREE'}</strong>
        </p>
        <div style="display:flex;flex-direction:column;gap:1rem;margin-bottom:1.5rem">
          ${plans.map(p => `
            <div class="pm-plan-card${this._selectedPlan?.id === p.id ? ' selected' : ''}" data-plan-id="${p.id}" id="pm-plan-${p.id}">
              <div style="display:flex;justify-content:space-between;align-items:flex-start">
                <div>
                  <div style="font-weight:700;font-size:1rem;margin-bottom:0.25rem">
                    ${p.id === 'PREMIUM' ? '<i class="fa-solid fa-crown" style="color:#ffd700;margin-right:6px"></i>' : '<i class="fa-solid fa-star" style="color:#2ed573;margin-right:6px"></i>'}
                    ${p.name}
                  </div>
                  <div style="font-size:1.4rem;font-weight:800;color:var(--color-primary)">
                    ${p.price.toLocaleString('vi-VN')}đ<span style="font-size:0.85rem;font-weight:400;color:var(--text-muted)">/tháng</span>
                  </div>
                </div>
                <div id="pm-check-${p.id}" style="width:24px;height:24px;border-radius:50%;border:2px solid var(--glass-border);display:flex;align-items:center;justify-content:center;flex-shrink:0;transition:all 0.2s">
                </div>
              </div>
              <ul style="margin-top:0.75rem;list-style:none;display:flex;flex-direction:column;gap:4px">
                ${p.features.map(f => `<li style="font-size:0.82rem;color:var(--text-muted)"><i class="fa-solid fa-check" style="color:var(--color-primary);margin-right:6px"></i>${f}</li>`).join('')}
              </ul>
            </div>
          `).join('')}
        </div>
        <button id="pm-next-pay" class="btn btn-primary" style="width:100%;opacity:0.4;pointer-events:none" disabled>
          Tiếp tục thanh toán <i class="fa-solid fa-arrow-right"></i>
        </button>
      </div>
    `;
  }

  static _htmlPay() {
    const p = this._selectedPlan;
    return `
      <div style="padding:2rem">
        <div style="display:flex;align-items:center;gap:0.75rem;margin-bottom:1.5rem">
          <button id="pm-back" style="background:none;border:none;cursor:pointer;color:var(--text-muted);font-size:1.1rem">
            <i class="fa-solid fa-arrow-left"></i>
          </button>
          <h2 style="font-size:1.3rem;margin:0;flex:1">Thanh toán — ${p?.name}</h2>
          <button id="pm-close" style="background:none;border:none;cursor:pointer;color:var(--text-muted);font-size:1.3rem">
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>

        <!-- Credit Card Visual -->
        <div class="pm-card-scene">
          <div class="pm-card-inner" id="pm-card-inner">
            <div class="pm-card-face pm-card-front">
              <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:1.5rem">
                <div style="font-size:1.1rem;font-weight:800;letter-spacing:2px;opacity:0.9">LISTENARY</div>
                <div id="pm-card-logo" style="font-size:1.6rem"></div>
              </div>
              <div style="font-size:1.25rem;letter-spacing:3px;margin-bottom:1rem;font-family:monospace" id="pm-card-number-display">•••• •••• •••• ••••</div>
              <div style="display:flex;gap:2rem">
                <div>
                  <div style="font-size:0.6rem;opacity:0.7;text-transform:uppercase">Card Holder</div>
                  <div style="font-size:0.85rem;font-weight:600" id="pm-card-name-display">TÊN CHỦ THẺ</div>
                </div>
                <div>
                  <div style="font-size:0.6rem;opacity:0.7;text-transform:uppercase">Expires</div>
                  <div style="font-size:0.85rem;font-weight:600" id="pm-card-exp-display">MM/YY</div>
                </div>
              </div>
            </div>
            <div class="pm-card-face pm-card-back">
              <div style="background:#555;height:40px;margin:-1.5rem -1.5rem 1rem"></div>
              <div style="display:flex;align-items:center;gap:0.5rem">
                <div style="flex:1;height:32px;background:#e0e0e0;border-radius:4px"></div>
                <div style="background:#fff;color:#333;padding:0.3rem 0.75rem;border-radius:6px;font-size:0.9rem;font-family:monospace;font-weight:700" id="pm-cvv-display">•••</div>
              </div>
              <div style="font-size:0.65rem;opacity:0.6;margin-top:1rem;text-align:right">CVV/CVC</div>
            </div>
          </div>
        </div>

        <!-- Card Type -->
        <div style="display:flex;gap:0.75rem;margin-bottom:1.25rem">
          <button class="pm-card-type-btn" data-type="visa" style="flex:1;padding:0.65rem;border-radius:10px;border:2px solid var(--glass-border);background:var(--bg-main);color:var(--text-main);cursor:pointer;font-weight:700;font-size:0.95rem;transition:all 0.2s">
            <i class="fa-brands fa-cc-visa" style="font-size:1.4rem;color:#55acee;margin-right:6px;vertical-align:middle;"></i> <span style="vertical-align:middle;">Visa</span>
          </button>
          <button class="pm-card-type-btn" data-type="mastercard" style="flex:1;padding:0.65rem;border-radius:10px;border:2px solid var(--glass-border);background:var(--bg-main);color:var(--text-main);cursor:pointer;font-weight:700;font-size:0.95rem;transition:all 0.2s">
            <i class="fa-brands fa-cc-mastercard" style="font-size:1.4rem;color:#ff5f00;margin-right:6px;vertical-align:middle;"></i> <span style="vertical-align:middle;">Mastercard</span>
          </button>
        </div>

        <!-- Form -->
        <div style="display:flex;flex-direction:column;gap:1rem;margin-bottom:1.5rem">
          <div>
            <label style="font-size:0.8rem;font-weight:700;color:var(--text-muted);display:block;margin-bottom:0.4rem">Số thẻ</label>
            <input id="pm-input-number" class="pm-input" maxlength="19" placeholder="1234 5678 9012 3456" inputmode="numeric">
          </div>
          <div>
            <label style="font-size:0.8rem;font-weight:700;color:var(--text-muted);display:block;margin-bottom:0.4rem">Tên chủ thẻ</label>
            <input id="pm-input-name" class="pm-input" placeholder="NGUYEN VAN A" style="text-transform:uppercase">
          </div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem">
            <div>
              <label style="font-size:0.8rem;font-weight:700;color:var(--text-muted);display:block;margin-bottom:0.4rem">Ngày hết hạn</label>
              <input id="pm-input-exp" class="pm-input" maxlength="5" placeholder="MM/YY" inputmode="numeric">
            </div>
            <div>
              <label style="font-size:0.8rem;font-weight:700;color:var(--text-muted);display:block;margin-bottom:0.4rem">CVV / CVC</label>
              <input id="pm-input-cvv" class="pm-input" maxlength="4" placeholder="•••" inputmode="numeric" type="password">
            </div>
          </div>
        </div>

        <div style="background:hsla(260,80%,60%,0.08);border:1px solid hsla(260,80%,60%,0.2);border-radius:12px;padding:1rem;margin-bottom:1.5rem;display:flex;justify-content:space-between;align-items:center">
          <span style="color:var(--text-muted);font-size:0.9rem">Tổng thanh toán</span>
          <span style="font-size:1.3rem;font-weight:800;color:var(--color-primary)">${p?.price?.toLocaleString('vi-VN')}đ</span>
        </div>

        <button id="pm-submit-pay" class="btn btn-primary" style="width:100%">
          <i class="fa-solid fa-lock"></i> Thanh toán ngay
        </button>
        <p style="text-align:center;font-size:0.75rem;color:var(--text-muted);margin-top:0.75rem">
          <i class="fa-solid fa-shield-halved"></i> Thông tin thẻ được mã hóa SSL 256-bit
        </p>
      </div>
    `;
  }

  static _htmlProcessing() {
    return `
      <div style="padding:3rem 2rem;text-align:center">
        <div class="pm-spinner" style="margin-bottom:1.5rem"></div>
        <h3 style="margin-bottom:0.5rem">Đang xử lý thanh toán...</h3>
        <p style="color:var(--text-muted);font-size:0.9rem">Vui lòng không đóng cửa sổ này</p>
      </div>
    `;
  }

  static _htmlSuccess() {
    const p = this._selectedPlan;
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + (p?.duration || 30));
    const dateStr = endDate.toLocaleDateString('vi-VN');
    return `
      <div style="padding:2.5rem 2rem;text-align:center">
        <div class="pm-success-icon">🎉</div>
        <h2 style="margin:1rem 0 0.5rem;font-size:1.6rem">Đăng ký thành công!</h2>
        <p style="color:var(--text-muted);margin-bottom:1.5rem">
          Bạn đã kích hoạt gói <strong style="color:var(--color-primary)">${p?.name}</strong>.<br>
          Hạn sử dụng đến: <strong>${dateStr}</strong>
        </p>
        <div style="background:hsla(260,80%,60%,0.08);border:1px solid hsla(260,80%,60%,0.2);border-radius:14px;padding:1.25rem;margin-bottom:1.5rem;text-align:left">
          <ul style="list-style:none;display:flex;flex-direction:column;gap:6px">
            ${(p?.features || []).map(f => `<li style="font-size:0.88rem"><i class="fa-solid fa-check" style="color:var(--color-primary);margin-right:8px"></i>${f}</li>`).join('')}
          </ul>
        </div>
        <button id="pm-done" class="btn btn-primary" style="width:100%;font-size:1rem">
          <i class="fa-solid fa-check"></i> Hoàn tất
        </button>
      </div>
    `;
  }

  static _attachEvents(step) {
    document.getElementById('pm-close')?.addEventListener('click', () => this.close());

    if (step === 'select') {
      const plans = (this._plans || []).filter(p => p.id !== 'FREE');
      plans.forEach(p => {
        document.getElementById(`pm-plan-${p.id}`)?.addEventListener('click', () => {
          this._selectedPlan = p;
          // Update UI
          plans.forEach(pp => {
            const card = document.getElementById(`pm-plan-${pp.id}`);
            const check = document.getElementById(`pm-check-${pp.id}`);
            if (card) card.classList.toggle('selected', pp.id === p.id);
            if (check) {
              if (pp.id === p.id) {
                check.style.background = 'var(--color-primary)';
                check.style.borderColor = 'var(--color-primary)';
                check.innerHTML = '<i class="fa-solid fa-check" style="color:#fff;font-size:0.7rem"></i>';
              } else {
                check.style.background = '';
                check.style.borderColor = 'var(--glass-border)';
                check.innerHTML = '';
              }
            }
          });
          const btn = document.getElementById('pm-next-pay');
          if (btn) { 
            btn.disabled = false; 
            btn.style.opacity = '1'; 
            btn.style.pointerEvents = 'auto'; 
            
            // Đổi text button dựa trên gói hiện tại
            if (this._currentPlan && this._currentPlan !== 'FREE') {
              if (p.id === this._currentPlan) {
                btn.innerHTML = 'Cập nhật thông tin thẻ <i class="fa-solid fa-credit-card"></i>';
              } else {
                btn.innerHTML = `Chuyển sang ${p.name} <i class="fa-solid fa-arrow-right-arrow-left"></i>`;
              }
            } else {
              btn.innerHTML = 'Tiếp tục thanh toán <i class="fa-solid fa-arrow-right"></i>';
            }
          }
        });
      });
      document.getElementById('pm-next-pay')?.addEventListener('click', () => {
        if (this._selectedPlan) this._renderStep('pay');
      });
    }

    if (step === 'pay') {
      document.getElementById('pm-back')?.addEventListener('click', () => this._renderStep('select'));

      // Card type buttons
      document.querySelectorAll('.pm-card-type-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          this._cardType = btn.dataset.type;
          document.querySelectorAll('.pm-card-type-btn').forEach(b => {
            b.style.borderColor = b === btn ? 'var(--color-primary)' : 'var(--glass-border)';
            b.style.background = b === btn ? 'hsla(260,80%,60%,0.1)' : 'var(--bg-main)';
          });
          const logo = document.getElementById('pm-card-logo');
          if (logo) {
            logo.innerHTML = this._cardType === 'visa'
              ? '<i class="fa-brands fa-cc-visa"></i>'
              : '<i class="fa-brands fa-cc-mastercard"></i>';
          }
        });
      });

      // Live card number
      document.getElementById('pm-input-number')?.addEventListener('input', (e) => {
        let val = e.target.value.replace(/\D/g, '').slice(0, 16);
        e.target.value = val.replace(/(.{4})/g, '$1 ').trim();
        const disp = document.getElementById('pm-card-number-display');
        if (disp) disp.textContent = e.target.value || '•••• •••• •••• ••••';
        // Detect card type
        if (!this._cardType) {
          if (val.startsWith('4')) {
            document.querySelector('[data-type="visa"]')?.click();
          } else if (/^5[1-5]/.test(val) || /^2[2-7]/.test(val)) {
            document.querySelector('[data-type="mastercard"]')?.click();
          }
        }
      });

      document.getElementById('pm-input-name')?.addEventListener('input', (e) => {
        const disp = document.getElementById('pm-card-name-display');
        if (disp) disp.textContent = e.target.value.toUpperCase() || 'TÊN CHỦ THẺ';
      });

      document.getElementById('pm-input-exp')?.addEventListener('input', (e) => {
        let val = e.target.value.replace(/\D/g, '').slice(0, 4);
        if (val.length >= 2) val = val.slice(0, 2) + '/' + val.slice(2);
        e.target.value = val;
        const disp = document.getElementById('pm-card-exp-display');
        if (disp) disp.textContent = val || 'MM/YY';
      });

      // Flip card on CVV focus
      document.getElementById('pm-input-cvv')?.addEventListener('focus', () => {
        document.getElementById('pm-card-inner')?.classList.add('flipped');
      });
      document.getElementById('pm-input-cvv')?.addEventListener('blur', () => {
        document.getElementById('pm-card-inner')?.classList.remove('flipped');
      });
      document.getElementById('pm-input-cvv')?.addEventListener('input', (e) => {
        const disp = document.getElementById('pm-cvv-display');
        if (disp) disp.textContent = e.target.value || '•••';
      });

      // Submit
      document.getElementById('pm-submit-pay')?.addEventListener('click', () => {
        const num = document.getElementById('pm-input-number')?.value.replace(/\s/g, '');
        const name = document.getElementById('pm-input-name')?.value.trim();
        const exp = document.getElementById('pm-input-exp')?.value;
        const cvv = document.getElementById('pm-input-cvv')?.value;

        if (!this._cardType) { alert('Vui lòng chọn loại thẻ (Visa hoặc Mastercard).'); return; }
        if (num.length < 16) { alert('Số thẻ không hợp lệ (cần 16 chữ số).'); return; }
        if (!name) { alert('Vui lòng nhập tên chủ thẻ.'); return; }
        if (!/^\d{2}\/\d{2}$/.test(exp)) { alert('Ngày hết hạn không hợp lệ (MM/YY).'); return; }
        if (cvv.length < 3) { alert('CVV không hợp lệ.'); return; }

        // Validate expiry
        const [mm, yy] = exp.split('/').map(Number);
        const now = new Date();
        const expDate = new Date(2000 + yy, mm - 1, 1);
        if (mm < 1 || mm > 12 || expDate < now) { alert('Thẻ đã hết hạn hoặc ngày hết hạn không hợp lệ.'); return; }

        const paymentInfo = {
          cardType: this._cardType,
          last4: num.slice(-4),
          cardNumber: num,
          cardName: name,
          exp: exp,
          cvv: cvv
        };

        this._processPayment(paymentInfo);
      });
    }

    if (step === 'success') {
      document.getElementById('pm-done')?.addEventListener('click', () => {
        this.close();
        if (this._onSuccess) this._onSuccess(this._selectedPlan);
      });
    }
  }

  static _processPayment(paymentInfo) {
    this._renderStep('processing');
    // Simulate payment processing (1.5–2.5s)
    const delay = 1500 + Math.random() * 1000;
    setTimeout(async () => {
      // Update subscription in session
      const plan = this._selectedPlan;
      if (plan) {
        const endDate = new Date();
        endDate.setDate(endDate.getDate() + (plan.duration || 30));
        
        const currentUser = AuthService.getUser();
        if (currentUser) {
          try {
            const res = await fetch('/api/subscription', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                userId: currentUser.id,
                action: 'SUBSCRIBE',
                plan: plan.id,
                endDate: endDate.toISOString(),
                paymentInfo: paymentInfo
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
              throw new Error('API failed');
            }
          } catch (err) {
            console.error(err);
            AuthService.updateUser({
              subscriptionPlan: plan.id,
              subscriptionEndDate: endDate.toISOString(),
              paymentInfo: paymentInfo
            });
          }
        }
      }
      this._renderStep('success');
    }, delay);
  }
}
