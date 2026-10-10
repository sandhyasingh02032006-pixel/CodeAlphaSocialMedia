/**
 * CodeAlphaSocialMedia — Posts and Engagement Logic
 */

const Posts = {
  renderCard(post) {
    const user = API.getCurrentUser();
    const isOwner = user && user.id === post.user_id;

    return `
      <article class="post-box" id="post-${post.id}" data-post-id="${post.id}">
        <!-- Header -->
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px;">
          <a href="profile.html?id=${post.user_id}" style="display: flex; align-items: center; gap: 12px;">
            <img src="${post.author?.profile_image || '/src/assets/images/avatar_tech_dev_1791536907315.jpg'}" class="avatar" alt="${post.author?.username}" />
            <div>
              <div style="font-weight: 700; font-size: 14px; display: flex; align-items: center; gap: 4px;">
                ${post.author?.display_name || post.author?.username}
                ${post.author?.is_verified ? '<span style="color: var(--primary-blue); font-size: 12px;">✓</span>' : ''}
              </div>
              <div style="font-size: 12px; color: var(--text-muted);">
                @${post.author?.username} ${post.location ? `· ${post.location}` : ''}
              </div>
            </div>
          </a>

          ${isOwner ? `
            <button class="btn-ghost btn-sm" onclick="Posts.deletePost(${post.id})" title="Delete Post" style="color: var(--text-muted);">
              🗑️
            </button>
          ` : ''}
        </div>

        <!-- Caption -->
        <p style="font-size: 14.5px; line-height: 1.6; color: #F1F5F9; margin-bottom: 12px; white-space: pre-wrap;">${this.formatCaption(post.caption)}</p>

        <!-- Media Attachment -->
        ${post.media_url ? `
          <div class="post-media-frame">
            ${post.is_video ? `
              <video src="${post.media_url}" controls style="width: 100%; max-height: 480px;"></video>
            ` : `
              <img src="${post.media_url}" alt="Attachment" loading="lazy" />
            `}
          </div>
        ` : ''}

        <!-- Actions -->
        <div style="display: flex; align-items: center; gap: 20px; padding-top: 8px; border-top: 1px solid var(--border-color); font-size: 13px;">
          <button class="btn-ghost btn-sm like-btn ${post.is_liked ? 'liked' : ''}" onclick="Posts.toggleLike(${post.id})" style="gap: 6px; color: ${post.is_liked ? '#F43F5E' : 'var(--text-secondary)'};">
            ${post.is_liked ? '❤️' : '🤍'} <span class="like-count tabular-nums">${post.likes_count}</span>
          </button>

          <button class="btn-ghost btn-sm" onclick="Posts.toggleComments(${post.id})" style="gap: 6px;">
            💬 <span class="comment-count tabular-nums">${post.comments_count}</span>
          </button>

          <button class="btn-ghost btn-sm" onclick="Posts.toggleSave(${post.id})" style="gap: 6px; color: ${post.is_saved ? 'var(--primary-blue)' : 'var(--text-secondary)'};">
            ${post.is_saved ? '🔖 Saved' : '🏷️ Save'}
          </button>

          <button class="btn-ghost btn-sm" onclick="Posts.share(${post.id})" style="margin-left: auto;">
            ↗️ Share
          </button>
        </div>

        <!-- Comments Container -->
        <div id="comments-box-${post.id}" style="display: none; margin-top: 14px; padding-top: 12px; border-top: 1px solid var(--border-color);">
          <form onsubmit="event.preventDefault(); Posts.submitComment(${post.id}, this.commentText.value); this.commentText.value='';" style="display: flex; gap: 8px; margin-bottom: 12px;">
            <input type="text" name="commentText" class="form-input" placeholder="Add a comment..." style="padding: 8px 12px; font-size: 13px;" required />
            <button type="submit" class="btn btn-primary btn-sm">Post</button>
          </form>
          <div id="comments-list-${post.id}" style="display: flex; flex-direction: column; gap: 8px;"></div>
        </div>
      </article>
    `;
  },

  formatCaption(str) {
    if (!str) return '';
    // Format hashtags in primary-blue
    return str.replace(/#(\w+)/g, '<a href="explore.html?tag=$1" style="color: var(--primary-blue); font-weight: 600;">#$1</a>');
  },

  async toggleLike(postId) {
    if (!API.getToken()) {
      API.showToast('Please sign in to like posts', 'info');
      Auth.openModal();
      return;
    }
    try {
      const res = await API.request(`/posts/${postId}/like`, { method: 'POST' });
      if (res.success) {
        const card = document.getElementById(`post-${postId}`);
        if (card) {
          const btn = card.querySelector('.like-btn');
          const count = card.querySelector('.like-count');
          if (btn) {
            btn.innerHTML = `${res.liked ? '❤️' : '🤍'} <span class="like-count tabular-nums">${res.count}</span>`;
            btn.style.color = res.liked ? '#F43F5E' : 'var(--text-secondary)';
          }
        }
      }
    } catch (err) {
      API.showToast(err.message, 'error');
    }
  },

  async toggleSave(postId) {
    if (!API.getToken()) {
      Auth.openModal();
      return;
    }
    try {
      const res = await API.request(`/posts/${postId}/save`, { method: 'POST' });
      API.showToast(res.saved ? 'Post saved to your profile' : 'Post unsaved', 'info');
    } catch (err) {
      API.showToast(err.message, 'error');
    }
  },

  async toggleComments(postId) {
    const box = document.getElementById(`comments-box-${postId}`);
    if (!box) return;
    const isShown = box.style.display !== 'none';
    box.style.display = isShown ? 'none' : 'block';
    if (!isShown) {
      this.loadComments(postId);
    }
  },

  async loadComments(postId) {
    const list = document.getElementById(`comments-list-${postId}`);
    if (!list) return;

    try {
      const res = await API.request(`/posts/${postId}/comments`);
      const user = API.getCurrentUser();

      if (res.comments.length === 0) {
        list.innerHTML = `<p style="font-size: 12px; color: var(--text-muted);">No comments yet.</p>`;
        return;
      }

      list.innerHTML = res.comments.map(c => `
        <div style="display: flex; gap: 8px; font-size: 13px; background: var(--bg-secondary); padding: 8px 12px; border-radius: var(--radius-sm); border: 1px solid var(--border-color);">
          <img src="${c.author?.profile_image || '/src/assets/images/avatar_tech_dev_1791536907315.jpg'}" class="avatar avatar-sm" />
          <div style="flex: 1;">
            <div style="display: flex; justify-content: space-between;">
              <span style="font-weight: 700; color: var(--text-primary);">@${c.author?.username || 'user'}</span>
              ${user && user.id === c.user_id ? `
                <button onclick="Posts.deleteComment(${c.id}, ${postId})" style="background:none; border:none; color: var(--danger); cursor:pointer; font-size: 11px;">Delete</button>
              ` : ''}
            </div>
            <p style="color: var(--text-secondary); margin-top: 2px;">${c.comment_text}</p>
          </div>
        </div>
      `).join('');
    } catch (err) {
      console.error(err);
    }
  },

  async submitComment(postId, text) {
    if (!API.getToken()) {
      Auth.openModal();
      return;
    }
    try {
      const res = await API.request(`/posts/${postId}/comments`, {
        method: 'POST',
        body: JSON.stringify({ comment_text: text })
      });
      if (res.success) {
        this.loadComments(postId);
        API.showToast('Comment added', 'success');
      }
    } catch (err) {
      API.showToast(err.message, 'error');
    }
  },

  async deleteComment(commentId, postId) {
    try {
      await API.request(`/comments/${commentId}`, { method: 'DELETE' });
      this.loadComments(postId);
      API.showToast('Comment deleted', 'info');
    } catch (err) {
      API.showToast(err.message, 'error');
    }
  },

  async deletePost(postId) {
    if (!confirm('Are you sure you want to delete this post?')) return;
    try {
      const res = await API.request(`/posts/${postId}`, { method: 'DELETE' });
      if (res.success) {
        const card = document.getElementById(`post-${postId}`);
        if (card) card.remove();
        API.showToast('Post deleted', 'success');
      }
    } catch (err) {
      API.showToast(err.message, 'error');
    }
  },

  share(postId) {
    const url = `${window.location.origin}/profile.html#post-${postId}`;
    navigator.clipboard.writeText(url);
    API.showToast('Link copied to clipboard', 'info');
  }
};
