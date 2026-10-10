/**
 * CodeAlphaSocialMedia — Master API Client
 */

const API_BASE = 'https://codealphasocialmedia.onrender.com/api';

const API = {
  getToken() {
    return localStorage.getItem('codealpha_token');
  },

  setAuth(token, user) {
    localStorage.setItem('codealpha_token', token);
    localStorage.setItem('codealpha_user', JSON.stringify(user));

    if (user && user.preferences) {
      this.applyPreferences(user.preferences);
    }
  },

  clearAuth() {
    localStorage.removeItem('codealpha_token');
    localStorage.removeItem('codealpha_user');
  },

  getCurrentUser() {
    const raw = localStorage.getItem('codealpha_user');

    try {
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },

  async request(endpoint, options = {}) {
    const url = `${API_BASE}${endpoint}`;
    const token = this.getToken();
    const headers = { ...(options.headers || {}) };

    if (!(options.body instanceof FormData)) {
      headers['Content-Type'] = 'application/json';
    }

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        if (
          response.status === 401 &&
          !endpoint.includes('/auth/login')
        ) {
          this.clearAuth();
        }

        throw new Error(
          data.error || `HTTP ${response.status}: Request failed`
        );
      }

      return data;
    } catch (err) {
      console.error(`API Error [${endpoint}]:`, err);
      throw err;
    }
  },

  showToast(message, type = 'info') {
    let wrap = document.getElementById('toast-wrap');

    if (!wrap) {
      wrap = document.createElement('div');
      wrap.id = 'toast-wrap';
      wrap.className = 'toast-wrap';
      document.body.appendChild(wrap);
    }

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;

    const icon =
      type === 'success' ? '✓' :
      type === 'error' ? '✕' : 'ℹ';

    const iconSpan = document.createElement('span');
    iconSpan.style.fontWeight = '700';
    iconSpan.textContent = icon;

    const messageSpan = document.createElement('span');
    messageSpan.textContent = message;

    toast.append(iconSpan, messageSpan);
    wrap.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';

      setTimeout(() => toast.remove(), 300);
    }, 3500);
  },

  applyPreferences(prefs) {
    if (!prefs) return;

    const body = document.body;

    // Theme
    if (prefs.theme === 'light') {
      body.classList.add('light-theme');
    } else {
      body.classList.remove('light-theme');
    }

    // Font family
    if (prefs.font_family) {
      document.documentElement.style.setProperty(
        '--font-family',
        `'${prefs.font_family}', sans-serif`
      );
    }

    // Font size
    if (prefs.font_size) {
      document.documentElement.style.setProperty(
        '--font-size',
        `${prefs.font_size}px`
      );
    }

    // Accent color
    if (prefs.accent_color) {
      document.documentElement.style.setProperty(
        '--primary-blue',
        prefs.accent_color
      );
    }
  }
};

// Apply saved preferences when the page loads
document.addEventListener('DOMContentLoaded', () => {
  const user = API.getCurrentUser();

  if (user && user.preferences) {
    API.applyPreferences(user.preferences);
  }
});