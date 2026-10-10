/**
 * CodeAlphaSocialMedia — Messages and Real-Time Chat
 */

const Messages = {
  socket: null,
  activeConversationId: null,
  activeOtherUser: null,
  typingTimer: null,

  async init() {
    this.setupSocket();
    await this.loadConversations();

    const urlParams = new URLSearchParams(window.location.search);
    const withUserId = urlParams.get('with');
    if (withUserId) {
      await this.openDirectConversation(parseInt(withUserId, 10));
    }
  },

  setupSocket() {
    if (typeof io !== 'undefined') {
      this.socket = io();
      const token = API.getToken();
      if (token) {
        this.socket.emit('authenticate', token);
      }

      this.socket.on('new_message', (msg) => {
        if (msg.conversation_id === this.activeConversationId) {
          this.appendMessage(msg);
        }
        this.loadConversations();
      });

      this.socket.on('user_typing', ({ convId, userId }) => {
        if (convId === this.activeConversationId) {
          const typingEl = document.getElementById('chat-typing-indicator');
          if (typingEl) typingEl.style.display = 'block';
        }
      });

      this.socket.on('user_stop_typing', ({ convId }) => {
        if (convId === this.activeConversationId) {
          const typingEl = document.getElementById('chat-typing-indicator');
          if (typingEl) typingEl.style.display = 'none';
        }
      });
    }
  },

  async loadConversations() {
    const list = document.getElementById('conversations-list');
    if (!list) return;

    try {
      const res = await API.request('/conversations');
      const convs = res.conversations || [];

      if (convs.length === 0) {
        list.innerHTML = `<p style="padding: 20px; font-size: 13px; color: var(--text-muted); text-align: center;">No active chats yet. Start one from Explore or Profile!</p>`;
        return;
      }

      list.innerHTML = convs.map(c => `
        <div class="thread-item ${c.conversation_id === this.activeConversationId ? 'active' : ''}" onclick="Messages.selectConversation(${c.conversation_id}, ${JSON.stringify(c.other_user).replace(/"/g, '&quot;')})">
          <img src="${c.other_user?.profile_image || '/src/assets/images/avatar_tech_dev_1791536907315.jpg'}" class="avatar" />
          <div style="flex: 1; overflow: hidden;">
            <div style="display: flex; justify-content: space-between;">
              <span style="font-weight: 700; font-size: 13.5px; color: var(--text-primary);">${c.other_user?.display_name || c.other_user?.username || 'User'}</span>
              ${c.unread_count > 0 ? `<span class="badge">${c.unread_count}</span>` : ''}
            </div>
            <p style="font-size: 12px; color: var(--text-muted); text-overflow: ellipsis; overflow: hidden; white-space: nowrap; margin-top: 2px;">
              ${c.last_message?.message_text || 'Sent an attachment'}
            </p>
          </div>
        </div>
      `).join('');
    } catch (e) {
      console.error(e);
    }
  },

  async openDirectConversation(targetUserId) {
    try {
      const res = await API.request(`/conversations/with/${targetUserId}`, { method: 'POST' });
      if (res.conversation_id) {
        const userRes = await API.request(`/users/${targetUserId}`);
        this.selectConversation(res.conversation_id, userRes.user);
      }
    } catch (e) {
      console.error(e);
    }
  },

  async selectConversation(convId, otherUser) {
    this.activeConversationId = convId;
    this.activeOtherUser = otherUser;

    if (this.socket) {
      this.socket.emit('join_conversation', convId);
    }

    const header = document.getElementById('chat-active-header');
    if (header) {
      header.innerHTML = `
        <div style="display: flex; align-items: center; gap: 10px;">
          <img src="${otherUser?.profile_image || '/src/assets/images/avatar_tech_dev_1791536907315.jpg'}" class="avatar avatar-sm" />
          <div>
            <div style="font-weight: 700; font-size: 14px;">${otherUser?.display_name || otherUser?.username}</div>
            <div style="font-size: 11px; color: var(--primary-blue);">@${otherUser?.username} · Active</div>
          </div>
        </div>
      `;
    }

    const stream = document.getElementById('messages-stream');
    if (!stream) return;

    stream.innerHTML = `<p style="text-align: center; font-size: 13px; color: var(--text-muted);">Loading messages...</p>`;

    try {
      const res = await API.request(`/conversations/${convId}/messages`);
      const msgs = res.messages || [];

      stream.innerHTML = msgs.map(m => this.renderMessageBubble(m)).join('');
      stream.scrollTop = stream.scrollHeight;
    } catch (e) {
      console.error(e);
    }
  },

  renderMessageBubble(m) {
    const currentUser = API.getCurrentUser();
    const isOutgoing = currentUser && m.sender_id === currentUser.id;

    return `
      <div class="msg-bubble ${isOutgoing ? 'msg-outgoing' : 'msg-incoming'}">
        <div>${m.message_text}</div>
        ${m.attachment_url ? `
          <img src="${m.attachment_url}" style="max-width: 200px; border-radius: 8px; margin-top: 6px; display: block;" />
        ` : ''}
        <div style="font-size: 10px; opacity: 0.7; text-align: right; margin-top: 2px;">
          ${new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
    `;
  },

  appendMessage(msg) {
    const stream = document.getElementById('messages-stream');
    if (!stream) return;
    stream.innerHTML += this.renderMessageBubble(msg);
    stream.scrollTop = stream.scrollHeight;
  },

  async sendMessage(text, attachmentUrl) {
    if (!this.activeConversationId) return;
    if (!text?.trim() && !attachmentUrl) return;

    try {
      const res = await API.request(`/conversations/${this.activeConversationId}/messages`, {
        method: 'POST',
        body: JSON.stringify({ message_text: text, attachment_url: attachmentUrl })
      });

      if (res.success) {
        this.appendMessage(res.message);
        this.loadConversations();
      }
    } catch (err) {
      API.showToast(err.message, 'error');
    }
  },

  handleTyping() {
    if (this.socket && this.activeConversationId) {
      const user = API.getCurrentUser();
      this.socket.emit('typing', { convId: this.activeConversationId, userId: user?.id });
      clearTimeout(this.typingTimer);
      this.typingTimer = setTimeout(() => {
        this.socket.emit('stop_typing', { convId: this.activeConversationId, userId: user?.id });
      }, 1500);
    }
  }
};
