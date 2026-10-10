/**
 * CodeAlphaSocialMedia — Authentication Module
 */

const Auth = {
  init() {
    this.renderAuthModalIfNeeded();
  },

  async login(identifier, password) {
    try {
      const res = await API.request('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ identifier, password })
      });
      if (res.success) {
        API.setAuth(res.token, res.user);
        API.showToast(`Welcome back, @${res.user.username}!`, 'success');
        this.closeModal();
        window.location.reload();
      }
    } catch (err) {
      API.showToast(err.message, 'error');
    }
  },

  async register(username, email, password, displayName) {
    try {
      const res = await API.request('/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          username,
          email,
          password,
          display_name: displayName || username
        })
      });
      if (res.success) {
        API.setAuth(res.token, res.user);
        API.showToast('Account created successfully!', 'success');
        this.closeModal();
        window.location.reload();
      }
    } catch (err) {
      API.showToast(err.message, 'error');
    }
  },

  logout() {
    API.clearAuth();
    API.showToast('Signed out', 'info');
    setTimeout(() => {
      window.location.href = 'index.html';
    }, 500);
  },

  async quickDemoLogin(username) {
    await this.login(username, 'password123');
  },

  openModal(mode = 'login') {
    let modal = document.getElementById('auth-modal');
    if (!modal) {
      this.renderAuthModal();
      modal = document.getElementById('auth-modal');
    }
    this.setMode(mode);
    modal.style.display = 'flex';
  },

  closeModal() {
    const modal = document.getElementById('auth-modal');
    if (modal) modal.style.display = 'none';
  },

  setMode(mode) {
    const loginView = document.getElementById('auth-login-view');
    const registerView = document.getElementById('auth-register-view');
    if (loginView && registerView) {
      loginView.style.display = mode === 'login' ? 'block' : 'none';
      registerView.style.display = mode === 'register' ? 'block' : 'none';
    }
  },

  renderAuthModal() {
    const div = document.createElement('div');
    div.id = 'auth-modal';
    div.className = 'modal-mask';
    div.style.display = 'none';
    div.innerHTML = `
      <div class="modal-body" style="position: relative;">
        <button onclick="Auth.closeModal()" style="position: absolute; top: 16px; right: 16px; background: none; border: none; color: var(--text-muted); font-size: 18px; cursor: pointer;">✕</button>

        <!-- Login Form -->
        <div id="auth-login-view">
          <div style="text-align: center; margin-bottom: 20px;">
            <div style="width: 44px; height: 44px; margin: 0 auto 12px; border-radius: 12px; background: linear-gradient(135deg, #38BDF8, #0284C7); display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 22px; color: #080B10;">C</div>
            <h3 style="font-size: 22px; font-weight: 800;">Sign in to CodeAlpha</h3>
            <p style="font-size: 13px; color: var(--text-secondary);">Connect with engineers and designers</p>
          </div>

          <form id="login-form-inner" onsubmit="event.preventDefault(); Auth.login(this.idInput.value, this.pwdInput.value);">
            <div class="form-group">
              <label class="form-label">Email or Username</label>
              <input type="text" name="idInput" class="form-input" placeholder="e.g. alex_codealpha" required />
            </div>
            <div class="form-group">
              <label class="form-label">Password</label>
              <input type="password" name="pwdInput" class="form-input" placeholder="••••••••" required />
            </div>
            <button type="submit" class="btn btn-primary" style="width: 100%; margin-top: 8px;">Sign In</button>
          </form>

          <div style="margin-top: 20px; padding-top: 16px; border-top: 1px solid var(--border-color); text-align: center;">
            <p style="font-size: 11px; color: var(--text-muted); text-transform: uppercase; font-weight: 700; margin-bottom: 8px;">1-Click Demo Accounts</p>
            <div style="display: flex; flex-wrap: wrap; gap: 6px; justify-content: center;">
              <button class="btn btn-secondary btn-sm" onclick="Auth.quickDemoLogin('alex_codealpha')">@alex_codealpha</button>
              <button class="btn btn-secondary btn-sm" onclick="Auth.quickDemoLogin('sarah_designer')">@sarah_designer</button>
              <button class="btn btn-secondary btn-sm" onclick="Auth.quickDemoLogin('david_ml')">@david_ml</button>
              <button class="btn btn-secondary btn-sm" onclick="Auth.quickDemoLogin('elena_art')">@elena_art</button>
            </div>
          </div>

          <div style="text-align: center; margin-top: 16px; font-size: 13px; color: var(--text-secondary);">
            Don't have an account? <a href="#" onclick="Auth.setMode('register')" style="color: var(--primary-blue); font-weight: 600;">Create one</a>
          </div>
        </div>

        <!-- Register Form -->
        <div id="auth-register-view" style="display: none;">
          <div style="text-align: center; margin-bottom: 20px;">
            <h3 style="font-size: 22px; font-weight: 800;">Create Account</h3>
            <p style="font-size: 13px; color: var(--text-secondary);">Join CodeAlphaSocialMedia</p>
          </div>

          <form id="register-form-inner" onsubmit="event.preventDefault(); Auth.register(this.uInput.value, this.eInput.value, this.pInput.value, this.dInput.value);">
            <div class="form-group">
              <label class="form-label">Username</label>
              <input type="text" name="uInput" class="form-input" placeholder="username" required />
            </div>
            <div class="form-group">
              <label class="form-label">Display Name</label>
              <input type="text" name="dInput" class="form-input" placeholder="Full Name" required />
            </div>
            <div class="form-group">
              <label class="form-label">Email</label>
              <input type="email" name="eInput" class="form-input" placeholder="name@domain.com" required />
            </div>
            <div class="form-group">
              <label class="form-label">Password</label>
              <input type="password" name="pInput" class="form-input" placeholder="••••••••" required />
            </div>
            <button type="submit" class="btn btn-primary" style="width: 100%; margin-top: 8px;">Create Account</button>
          </form>

          <div style="text-align: center; margin-top: 16px; font-size: 13px; color: var(--text-secondary);">
            Already have an account? <a href="#" onclick="Auth.setMode('login')" style="color: var(--primary-blue); font-weight: 600;">Sign in</a>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(div);
  },

  renderAuthModalIfNeeded() {
    if (!document.getElementById('auth-modal')) {
      this.renderAuthModal();
    }
  }
};

document.addEventListener('DOMContentLoaded', () => {
  Auth.init();
});
