/**
 * CodeAlphaSocialMedia — Notifications Controller
 */

const Notifications = {
  async loadNotifications() {
    const list = document.getElementById('notifications-stream');
    if (!list) return;

    try {
      const res = await API.request('/notifications');
      const notifs = res.notifications || [];

      if (notifs.length === 0) {
        list.innerHTML = `<p style="padding: 30px; text-align: center; color: var(--text-muted); font-size: 13px;">No new notifications right now.</p>`;
        return;
      }

      list.innerHTML = notifs.map(n => `
        <div style="display: flex; align-items: center; gap: 12px; padding: 12px 14px; background: ${n.is_read ? 'var(--bg-secondary)' : 'var(--bg-card)'}; border: 1px solid var(--border-color); border-radius: var(--radius-md); border-left: 3px solid ${n.is_read ? 'var(--border-color)' : 'var(--primary-blue)'};">
          <img src="${n.sender?.profile_image || '/src/assets/images/avatar_tech_dev_1791536907315.jpg'}" class="avatar avatar-sm" />
          <div style="flex: 1;">
            <p style="font-size: 13.5px; color: var(--text-primary);">${n.message}</p>
            <span style="font-size: 11px; color: var(--text-muted);">${new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
        </div>
      `).join('');
    } catch (e) {
      console.error(e);
    }
  },

  async markAllRead() {
    try {
      await API.request('/notifications/read', { method: 'POST' });
      API.showToast('All notifications marked as read', 'info');
      this.loadNotifications();
    } catch (e) {
      console.error(e);
    }
  }
};
