/**
 * CodeAlphaSocialMedia — Home Feed Controller
 */

const Feed = {
  feedType: 'all',

  async init() {
    this.setupUserInfo();
    await this.loadStories();
    await this.loadPosts();
  },

  setupUserInfo() {
    const user = API.getCurrentUser();
    if (user) {
      const nameEl = document.getElementById('sidebar-user-name');
      const handleEl = document.getElementById('sidebar-user-handle');
      const avatarEl = document.getElementById('sidebar-user-avatar');
      const composerAvatar = document.getElementById('composer-avatar');

      if (nameEl) nameEl.textContent = user.display_name || user.username;
      if (handleEl) handleEl.textContent = `@${user.username}`;
      if (avatarEl && user.profile_image) avatarEl.src = user.profile_image;
      if (composerAvatar && user.profile_image) composerAvatar.src = user.profile_image;
    }
  },

  async loadStories() {
    const strip = document.getElementById('stories-strip');
    if (!strip) return;

    try {
      const res = await API.request('/stories');
      const user = API.getCurrentUser();

      let html = `
        <div class="story-bubble" onclick="window.location.href='create-post.html'">
          <div class="story-ring" style="background: var(--border-color);">
            <img src="${user?.profile_image || '/src/assets/images/avatar_tech_dev_1791536907315.jpg'}" />
          </div>
          <span class="story-name">+ Your Story</span>
        </div>
      `;

      if (res.stories && res.stories.length > 0) {
        html += res.stories.map(s => `
          <div class="story-bubble" onclick="Feed.viewStory('${s.user?.username}', '${s.stories[0]?.media_url}', '${s.stories[0]?.caption || ''}')">
            <div class="story-ring">
              <img src="${s.user?.profile_image || '/src/assets/images/avatar_tech_dev_1791536907315.jpg'}" />
            </div>
            <span class="story-name">@${s.user?.username}</span>
          </div>
        `).join('');
      }

      strip.innerHTML = html;
    } catch (e) {
      console.error(e);
    }
  },

  viewStory(username, mediaUrl, caption) {
    let modal = document.getElementById('story-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'story-modal';
      modal.className = 'modal-mask';
      modal.innerHTML = `
        <div style="position: relative; max-width: 420px; width: 90%; background: #000; border-radius: 16px; overflow: hidden; border: 1px solid var(--border-color); text-align: center;">
          <button onclick="document.getElementById('story-modal').style.display='none'" style="position: absolute; top: 12px; right: 12px; background: rgba(0,0,0,0.6); color: white; border: none; border-radius: 50%; width: 32px; height: 32px; cursor: pointer; z-index: 10;">✕</button>
          <div id="story-modal-user" style="position: absolute; top: 12px; left: 16px; font-weight: 700; color: white; font-size: 14px; text-shadow: 0 1px 4px black; z-index: 10;"></div>
          <img id="story-modal-img" src="" style="width: 100%; max-height: 580px; object-fit: cover; display: block;" />
          <div id="story-modal-caption" style="position: absolute; bottom: 16px; left: 16px; right: 16px; color: white; font-size: 14px; text-shadow: 0 1px 4px black;"></div>
        </div>
      `;
      document.body.appendChild(modal);
    }
    document.getElementById('story-modal-user').textContent = `@${username}`;
    document.getElementById('story-modal-img').src = mediaUrl;
    document.getElementById('story-modal-caption').textContent = caption;
    modal.style.display = 'flex';
  },

  async loadPosts() {
    const container = document.getElementById('feed-container');
    if (!container) return;

    container.innerHTML = `
      <div style="text-align: center; padding: 40px; color: var(--text-secondary);">
        <p>Loading news feed...</p>
      </div>
    `;

    try {
      const res = await API.request(`/posts?feed=${this.feedType}`);
      if (res.posts.length === 0) {
        container.innerHTML = `
          <div class="card" style="text-align: center; padding: 40px;">
            <h4>No posts found</h4>
            <p style="color: var(--text-secondary); font-size: 13px; margin-top: 6px;">Follow more accounts or share your own thoughts!</p>
          </div>
        `;
        return;
      }

      container.innerHTML = res.posts.map(p => Posts.renderCard(p)).join('');
    } catch (err) {
      container.innerHTML = `<div style="color: var(--danger); padding: 20px;">Failed to load feed: ${err.message}</div>`;
    }
  },

  setFilter(type) {
    this.feedType = type;
    document.querySelectorAll('.filter-tab').forEach(t => t.classList.remove('active'));
    const activeBtn = document.getElementById(`filter-tab-${type}`);
    if (activeBtn) activeBtn.classList.add('active');
    this.loadPosts();
  }
};
