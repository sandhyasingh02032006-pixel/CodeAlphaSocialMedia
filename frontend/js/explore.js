/**
 * CodeAlphaSocialMedia — Explore & Discover Controller
 */

const Explore = {
  activeSearch: '',
  activeTag: '',

  async init() {
    const urlParams = new URLSearchParams(window.location.search);
    const tag = urlParams.get('tag');
    if (tag) {
      this.activeTag = tag;
      const input = document.getElementById('explore-search-input');
      if (input) input.value = `#${tag}`;
    }

    await this.searchUsers();
    await this.loadExploreFeed();
  },

  async searchUsers() {
    const input = document.getElementById('explore-search-input');
    const query = input ? input.value.trim() : '';
    const userContainer = document.getElementById('users-search-container');
    if (!userContainer) return;

    try {
      const res = await API.request(`/users/search?q=${encodeURIComponent(query)}`);
      const users = res.users || [];

      if (users.length === 0) {
        userContainer.innerHTML = `<p style="font-size: 13px; color: var(--text-muted); padding: 10px;">No accounts found matching "${query}"</p>`;
        return;
      }

      const currentUser = API.getCurrentUser();

      userContainer.innerHTML = users.map(u => `
        <div style="display: flex; align-items: center; justify-content: space-between; padding: 10px 14px; background: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: var(--radius-md);">
          <a href="profile.html?id=${u.id}" style="display: flex; align-items: center; gap: 12px;">
            <img src="${u.profile_image || '/src/assets/images/avatar_tech_dev_1791536907315.jpg'}" class="avatar" />
            <div>
              <div style="font-weight: 700; font-size: 14px;">${u.display_name || u.username}</div>
              <div style="font-size: 12px; color: var(--text-muted);">@${u.username} · ${u.followers_count || 0} followers</div>
            </div>
          </a>

          ${currentUser && currentUser.id !== u.id ? `
            <button class="btn ${u.is_following ? 'btn-secondary' : 'btn-primary'} btn-sm" onclick="Explore.toggleFollow(${u.id}, ${u.is_following})">
              ${u.is_following ? 'Following' : (u.is_requested ? 'Requested' : 'Follow')}
            </button>
          ` : ''}
        </div>
      `).join('');
    } catch (e) {
      console.error(e);
    }
  },

  async loadExploreFeed() {
    const gridContainer = document.getElementById('explore-grid-container');
    if (!gridContainer) return;

    try {
      let endpoint = `/posts?feed=trending`;
      if (this.activeTag) endpoint += `&hashtag=${encodeURIComponent(this.activeTag)}`;

      const res = await API.request(endpoint);
      const posts = res.posts || [];

      if (posts.length === 0) {
        gridContainer.innerHTML = `<p style="font-size: 13px; color: var(--text-muted); padding: 20px;">No public posts in this category yet.</p>`;
        return;
      }

      // Render media grid + post cards
      gridContainer.innerHTML = posts.map(p => Posts.renderCard(p)).join('');
    } catch (e) {
      console.error(e);
    }
  },

  async toggleFollow(userId, isCurrentlyFollowing) {
    if (!API.getToken()) {
      Auth.openModal();
      return;
    }
    try {
      const method = isCurrentlyFollowing ? 'DELETE' : 'POST';
      const res = await API.request(`/users/${userId}/follow`, { method });
      API.showToast(res.isFollowing ? 'Followed user' : 'Unfollowed user', 'info');
      this.searchUsers();
    } catch (err) {
      API.showToast(err.message, 'error');
    }
  }
};
