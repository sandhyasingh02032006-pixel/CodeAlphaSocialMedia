/**
 * CodeAlphaSocialMedia — Profile Controller
 */

const Profile = {
  userId: null,
  activeTab: 'posts',

  async init() {
    const urlParams = new URLSearchParams(window.location.search);
    const currentUser = API.getCurrentUser();
    this.userId = urlParams.get('id') ? parseInt(urlParams.get('id'), 10) : (currentUser ? currentUser.id : 1);

    await this.loadProfileData();
    await this.loadProfilePosts();
  },

  async loadProfileData() {
    const headerEl = document.getElementById('profile-header');
    if (!headerEl) return;

    try {
      const res = await API.request(`/users/${this.userId}`);
      const user = res.user;
      const currentUser = API.getCurrentUser();
      const isSelf = currentUser && currentUser.id === user.id;

      headerEl.innerHTML = `
        <div style="position: relative; margin-bottom: 50px;">
          <img src="${user.cover_image || '/src/assets/images/post_skyline_night_1791536884567.jpg'}" style="width: 100%; height: 180px; object-fit: cover; border-radius: var(--radius-lg); border: 1px solid var(--border-color);" />
          <img src="${user.profile_image || '/src/assets/images/avatar_tech_dev_1791536907315.jpg'}" class="avatar avatar-lg" style="position: absolute; bottom: -40px; left: 24px; background: var(--bg-main);" />
        </div>

        <div style="padding: 0 10px; display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 14px;">
          <div>
            <h2 style="font-size: 22px; font-weight: 800; display: flex; align-items: center; gap: 6px;">
              ${user.display_name || user.username}
              ${user.is_verified ? '<span style="color: var(--primary-blue); font-size: 16px;">✓</span>' : ''}
            </h2>
            <div style="font-size: 13px; color: var(--text-muted);">@${user.username}</div>
            <p style="font-size: 14px; margin-top: 10px; max-width: 500px; color: #E2E8F0;">${user.bio || 'No biography written.'}</p>
            ${user.website ? `
              <a href="${user.website}" target="_blank" style="font-size: 13px; color: var(--primary-blue); display: inline-block; margin-top: 6px;">🔗 ${user.website}</a>
            ` : ''}
          </div>

          <div style="display: flex; gap: 10px;">
            ${isSelf ? `
              <button class="btn btn-secondary btn-sm" onclick="Profile.openEditModal()">
                ✏️ Edit Profile
              </button>
            ` : `
              <button class="btn ${user.is_following ? 'btn-secondary' : 'btn-primary'} btn-sm" onclick="Profile.toggleFollow(${user.id}, ${user.is_following})">
                ${user.is_following ? 'Following' : (user.is_requested ? 'Requested' : 'Follow')}
              </button>
              <a href="messages.html?with=${user.id}" class="btn btn-secondary btn-sm">
                💬 Message
              </a>
            `}
          </div>
        </div>

        <div style="display: flex; gap: 24px; padding: 18px 10px; border-bottom: 1px solid var(--border-color); font-size: 14px; margin-top: 10px;">
          <div><strong style="color: white;" class="tabular-nums">${user.posts_count}</strong> Posts</div>
          <div><strong style="color: white;" class="tabular-nums">${user.followers_count}</strong> Followers</div>
          <div><strong style="color: white;" class="tabular-nums">${user.following_count}</strong> Following</div>
        </div>
      `;
    } catch (err) {
      headerEl.innerHTML = `<p style="color: var(--danger);">Failed to load profile: ${err.message}</p>`;
    }
  },

  async loadProfilePosts() {
    const stream = document.getElementById('profile-posts-stream');
    if (!stream) return;

    const currentUser = API.getCurrentUser();
    const isSelf = currentUser && currentUser.id === this.userId;

    let endpoint = `/posts?userId=${this.userId}`;
    if (this.activeTab === 'saved') {
      if (!isSelf) {
        stream.innerHTML = `<p style="font-size: 13px; color: var(--text-muted); padding: 20px;">Saved posts are private to the account owner.</p>`;
        return;
      }
      endpoint = `/posts?saved=true`;
    }

    try {
      const res = await API.request(endpoint);
      if (res.posts.length === 0) {
        stream.innerHTML = `<p style="font-size: 13px; color: var(--text-muted); padding: 30px; text-align: center;">No ${this.activeTab} yet.</p>`;
        return;
      }
      stream.innerHTML = res.posts.map(p => Posts.renderCard(p)).join('');
    } catch (e) {
      console.error(e);
    }
  },

  setTab(tab) {
    this.activeTab = tab;
    document.querySelectorAll('.profile-tab').forEach(t => t.classList.remove('active'));
    const btn = document.getElementById(`tab-${tab}`);
    if (btn) btn.classList.add('active');
    this.loadProfilePosts();
  },

  async toggleFollow(userId, isFollowing) {
    if (!API.getToken()) {
      Auth.openModal();
      return;
    }
    try {
      const method = isFollowing ? 'DELETE' : 'POST';
      const res = await API.request(`/users/${userId}/follow`, { method });
      API.showToast(res.isFollowing ? 'Followed user' : 'Unfollowed user', 'info');
      this.loadProfileData();
    } catch (err) {
      API.showToast(err.message, 'error');
    }
  },

  openEditModal() {
    const user = API.getCurrentUser();
    let modal = document.getElementById('edit-profile-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'edit-profile-modal';
      modal.className = 'modal-mask';
      modal.innerHTML = `
        <div class="modal-body">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
            <h3 style="font-size: 18px; font-weight: 700;">Edit Profile</h3>
            <button onclick="document.getElementById('edit-profile-modal').style.display='none'" style="background:none; border:none; color: var(--text-muted); font-size: 16px; cursor:pointer;">✕</button>
          </div>
          <form onsubmit="event.preventDefault(); Profile.submitEditProfile(this);">
            <div class="form-group">
              <label class="form-label">Display Name</label>
              <input type="text" name="display_name" class="form-input" value="${user?.display_name || ''}" required />
            </div>
            <div class="form-group">
              <label class="form-label">Bio</label>
              <textarea name="bio" class="form-textarea" rows="2">${user?.bio || ''}</textarea>
            </div>
            <div class="form-group">
              <label class="form-label">Website</label>
              <input type="url" name="website" class="form-input" value="${user?.website || ''}" placeholder="https://..." />
            </div>
            <div style="display: flex; justify-content: flex-end; gap: 8px; margin-top: 16px;">
              <button type="button" class="btn btn-secondary" onclick="document.getElementById('edit-profile-modal').style.display='none'">Cancel</button>
              <button type="submit" class="btn btn-primary">Save Changes</button>
            </div>
          </form>
        </div>
      `;
      document.body.appendChild(modal);
    }
    modal.style.display = 'flex';
  },

  async submitEditProfile(form) {
    try {
      const res = await API.request('/users/profile', {
        method: 'PUT',
        body: JSON.stringify({
          display_name: form.display_name.value.trim(),
          bio: form.bio.value.trim(),
          website: form.website.value.trim()
        })
      });
      if (res.success) {
        API.setAuth(API.getToken(), res.user);
        API.showToast('Profile updated!', 'success');
        document.getElementById('edit-profile-modal').style.display = 'none';
        this.loadProfileData();
      }
    } catch (err) {
      API.showToast(err.message, 'error');
    }
  }
};
