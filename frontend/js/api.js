/**
 * CodeAlphaSocialMedia - Master API Client
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
    try {
      const user = localStorage.getItem('codealpha_user');
      return user ? JSON.parse(user) : null;
    } catch (error) {
      console.error('Unable to read user:', error);
      return null;
    }
  },

  async request(endpoint, options = {}) {
    const url = `${API_BASE}${endpoint}`;
    const token = this.getToken();

    const headers = {
      ...(options.headers || {})
    };

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
        if (response.status === 401) {
          this.clearAuth();
        }

        throw new Error(
          data.error || `HTTP ${response.status}: Request failed`
        );
      }

      return data;
    } catch (error) {
      console.error(`API Error [${endpoint}]:`, error);
      throw error;
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

    const icon = document.createElement('span');
    icon.style.fontWeight = '700';
    icon.textContent =
      type === 'success' ? '✓' :
      type === 'error' ? '✕' : 'ℹ';

    const text = document.createElement('span');
    text.textContent = message;

    toast.append(icon, text);
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
    const root = document.documentElement;

    if (prefs.theme === 'light') {
      body.classList.add('light-theme');
    } else {
      body.classList.remove('light-theme');
    }

    if (prefs.font_family) {
      root.style.setProperty(
        '--font-family',
        `'${prefs.font_family}', sans-serif`
      );
    }

    if (prefs.font_size) {
      root.style.setProperty(
        '--font-size',
        `${prefs.font_size}px`
      );
    }

    if (prefs.accent_color) {
      root.style.setProperty(
        '--primary-blue',
        prefs.accent_color
      );
    }
  }
};

document.addEventListener('DOMContentLoaded', () => {
  const user = API.getCurrentUser();

  if (user && user.preferences) {
    API.applyPreferences(user.preferences);
  }
});