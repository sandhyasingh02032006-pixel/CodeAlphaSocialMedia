# CodeAlphaSocialMedia — Master Full Stack Web Application

**CodeAlphaSocialMedia** is a production-grade full-stack social media web application featuring **exactly six main frontend pages**, a connected Node.js/Express REST backend, Socket.IO real-time chat, in-browser camera capture, a canvas photo editor, user customization, and a comprehensive MySQL relational database with **23 tables**.

Built with the **Sky Blue (`#38BDF8`) & Deep Black (`#080B10`)** modern theme for the **CodeAlpha Internship** submission.

---

## 🎨 Color Palette & Design Identity

- **Primary Sky Blue**: `#38BDF8`
- **Blue Hover**: `#0EA5E9`
- **Main Canvas Background**: `#080B10`
- **Secondary Background**: `#10151D`
- **Cards & Surfaces**: `#151C26`
- **Borders & Dividers**: `#283548`
- **Primary Text**: `#FFFFFF`
- **Secondary Text**: `#A7B2C2`

---

## 📱 Exactly Six Primary Frontend Pages

| # | Page File | Core Features |
|---|---|---|
| **1** | `index.html` (HOME FEED) | Stories carousel, inline composer, dynamic feed, text/image/video posts, like/unlike, comments, save/unsave, share post link, follow suggestions, search entry point, notifications badge, camera shortcut. |
| **2** | `explore.html` (SEARCH & DISCOVER) | Live user search by username and display name, public posts and hashtag search, suggested accounts, explore image/video grid, follow/unfollow toggle, recent searches. |
| **3** | `create-post.html` (CREATE & EDIT MEDIA) | Caption authoring, image/video upload, live device camera capture via HTML5 `getUserMedia`, front/rear camera switch, live preview, crop/rotate, brightness/contrast/saturation sliders, grayscale/sepia/cinematic filter presets, text overlays with custom font/size/color/style, hashtags/mentions, real canvas blob export for persistent upload. |
| **4** | `profile.html` (USER PROFILE) | Profile avatar & cover image, display name & handle, bio, website, followers/following/posts counts, follow/unfollow, private account follow requests, edit profile modal, user posts grid, saved posts tab visible only to owner. |
| **5** | `messages.html` (CHAT & NOTIFICATIONS) | Real-time 1-on-1 messaging with Socket.IO, conversation list, send/receive text & image attachments, emoji picker, read receipts, unread badges, typing indicators, online status, notification stream (likes, comments, follows, messages), mark all as read. |
| **6** | `settings.html` (SETTINGS & CUSTOMIZATION) | Account info, password change, account privacy, Font Customization (Poppins, Inter, Roboto, Lato, Playfair Display with size slider & live preview), Theme Customization (Sky-Blue & Black default, Light, Dark, Accent color palette), saved to MySQL `user_preferences`. |

*Note: Login and registration are seamlessly accessible through the interactive authentication modal or embedded views within the application shell.*

---

## 🗄️ MySQL Database Architecture (`codealpha_social_media`)

The database contains **23 relational tables** with foreign keys, indexes, and unique constraints:

1. `users` — id, username, email, password_hash, display_name, bio, website, profile_image, cover_image, is_private, is_verified, created_at, updated_at
2. `user_preferences` — user_id, theme, accent_color, bg_color, font_family, font_size, letter_spacing, line_height, layout_density, notify_likes, notify_comments, notify_follows, notify_messages
3. `posts` — id, user_id, caption, location, is_pinned, is_video, created_at, updated_at
4. `post_media` — id, post_id, media_type, media_url, alt_text, filter_applied
5. `likes` — id, post_id, user_id, created_at (Unique constraint `unique_post_user_like`)
6. `comments` — id, post_id, user_id, comment_text, created_at
7. `comment_replies` — id, comment_id, user_id, reply_text, created_at
8. `follows` — id, follower_id, followed_id, created_at (Unique constraint `unique_follow`)
9. `follow_requests` — id, requester_id, target_id, status ('pending', 'accepted', 'rejected')
10. `saved_posts` — id, user_id, post_id, created_at (Unique constraint `unique_saved_post`)
11. `stories` — id, user_id, media_url, caption, created_at, expires_at (24h expiry)
12. `story_views` — id, story_id, viewer_id, created_at (Unique constraint `unique_story_view`)
13. `conversations` — id, created_at, updated_at
14. `conversation_participants` — id, conversation_id, user_id, last_read_at
15. `messages` — id, conversation_id, sender_id, message_text, is_read, created_at
16. `message_attachments` — id, message_id, attachment_url, attachment_type
17. `notifications` — id, recipient_id, sender_id, type, entity_id, message, is_read, created_at
18. `hashtags` — id, tag_name, created_at
19. `post_hashtags` — id, post_id, hashtag_id (Unique constraint `unique_post_tag`)
20. `blocks` — id, blocker_id, blocked_id, created_at (Unique constraint `unique_block`)
21. `reports` — id, reporter_id, reported_user_id, reported_post_id, reason, status
22. `drafts` — id, user_id, caption, media_url, created_at, updated_at
23. `password_reset_tokens` — id, user_id, token, expires_at, used

Database scripts:
- `database/schema.sql` — Complete DDL table definitions and indexes
- `database/seed.sql` — Seed records with pre-hashed demo accounts

---

## 📡 REST API Specifications

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `POST` | `/api/auth/register` | Register account with bcrypt password hashing | No |
| `POST` | `/api/auth/login` | Login with username/email & password (returns JWT) | No |
| `GET` | `/api/auth/me` | Fetch authenticated session user | Yes |
| `POST` | `/api/auth/logout` | Terminate session | No |
| `GET` | `/api/posts` | Get posts feed (`feed=all\|following\|trending`, search, hashtag) | Optional |
| `POST` | `/api/posts` | Create new post with caption, location, media | Yes |
| `GET` | `/api/posts/:id` | Get post details | Optional |
| `DELETE` | `/api/posts/:id` | Delete user's own post | Yes |
| `POST` | `/api/posts/:id/like` | Toggle like/unlike | Yes |
| `POST` | `/api/posts/:id/save` | Toggle save/bookmark post | Yes |
| `GET` | `/api/posts/:id/comments` | Fetch threaded comments and replies | No |
| `POST` | `/api/posts/:id/comments` | Add comment | Yes |
| `DELETE` | `/api/comments/:id` | Delete comment | Yes |
| `GET` | `/api/stories` | Get active 24-hour stories grouped by user | Optional |
| `POST` | `/api/stories` | Post a 24-hour story | Yes |
| `GET` | `/api/conversations` | List user chat conversations | Yes |
| `GET` | `/api/conversations/:id/messages` | Get chat messages for conversation | Yes |
| `POST` | `/api/conversations/:id/messages` | Send message (broadcasted via Socket.IO) | Yes |
| `GET` | `/api/notifications` | Fetch notification history | Yes |
| `POST` | `/api/notifications/read` | Mark all notifications read | Yes |
| `GET` | `/api/users/preferences` | Retrieve font & theme preferences | Yes |
| `PUT` | `/api/users/preferences` | Update font family, size, theme in MySQL | Yes |
| `PUT` | `/api/users/profile` | Update profile bio, display name, website | Yes |
| `POST` | `/api/users/:id/follow` | Follow user / create follow request | Yes |
| `DELETE` | `/api/users/:id/follow` | Unfollow user | Yes |
| `GET` | `/api/users/search?q=` | Search users by username or display name | Optional |
| `POST` | `/api/upload` | Upload media via Multer | Yes |
| `POST` | `/api/upload/base64` | Upload canvas edited photo output | Yes |

---

## 📷 In-Browser Camera & Canvas Media Editor

1. **Camera Permission & Streaming**:
   - Access is requested strictly when the user clicks **"Open Camera"**.
   - Streams video via `navigator.mediaDevices.getUserMedia`.
   - Offers front/rear lens switching on compatible mobile/desktop webcams.
   - When snapshot is captured or camera is closed, camera hardware tracks are cleanly stopped.
2. **Canvas Photo Filters & Overlays**:
   - Brightness, contrast, and saturation adjustments.
   - Presets: *Normal*, *Cinematic*, *B&W Mono*, *Vintage Sepia*.
   - Rotation: 90° clockwise increments.
   - Text Overlays: User-specified headline, font family (Poppins, Inter, Roboto, Playfair Display), color picker, and position.
   - **True Edit Guarantee**: Canvas generates an actual JPEG blob exported to `/api/upload/base64` so the uploaded file in MySQL stores the edited image, not just CSS styles.

---

## ⚙️ Typography & Theme Customization

- **Supported Font Families**:
  - `Poppins` (Geometric & Modern Sans)
  - `Inter` (High-Legibility UI Sans)
  - `Roboto` (Clean Modern Sans)
  - `Lato` (Humanist Sans)
  - `Playfair Display` (Luxury Editorial Serif)
- **Controls**:
  - Live base font size slider (13px – 18px)
  - Letter spacing selector (`normal`, `0.02em`, `0.05em`)
  - Accent Color picker (`#38BDF8`, `#10B981`, `#F59E0B`, `#EC4899`, or custom hex)
  - Theme mode: `sky-black`, `dark`, `light`
  - Real-time preview box
  - Saved to the `user_preferences` MySQL table so settings persist across reloads.

---

## 🚀 Local Installation & Execution (Windows / VS Code)

### Prerequisites
- Node.js (v18+)
- MySQL Server (v8.0+)
- Visual Studio Code

### Step 1: Clone Repository
```bash
git clone https://github.com/your-username/CodeAlphaSocialMedia.git
cd CodeAlphaSocialMedia
```

### Step 2: Set Up MySQL Database
Open your MySQL terminal:
```bash
mysql -u root -p < database/schema.sql
mysql -u root -p < database/seed.sql
```

### Step 3: Configure Environment
Copy `CodeAlphaSocialMedia/backend/.env.example` to `CodeAlphaSocialMedia/backend/.env`:
```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=codealpha_social_media
JWT_SECRET=your_secret_key
```

### Step 4: Run Application
```bash
# In project root:
npm install
npm run dev
```
Open **`http://localhost:3000`** in your browser.

You can also run the standalone static backend:
```bash
cd CodeAlphaSocialMedia/backend
npm install
npm start
```
And view the six primary pages directly in `CodeAlphaSocialMedia/frontend/`.

---

## 👥 Seed Demo Test Accounts

Default password for all demo accounts: `password123`

| Handle | Name | Role |
|---|---|---|
| `@alex_codealpha` | Alex Rivers | Lead Full Stack Engineer |
| `@sarah_designer` | Sarah Chen | Product & UI/UX Technologist |
| `@david_ml` | David Vance | AI/ML Systems Researcher |
| `@elena_art` | Elena Rostova | Visual Storyteller & Photographer |

---

## ✅ CodeAlpha Internship Deliverables Checklist

- [x] Application name: **CodeAlphaSocialMedia**.
- [x] Exactly **six main frontend pages** (`index.html`, `explore.html`, `create-post.html`, `profile.html`, `messages.html`, `settings.html`).
- [x] Sky-Blue (`#38BDF8`) & Deep-Black (`#080B10`) design system throughout.
- [x] Node.js, Express.js REST API with Socket.IO real-time chat.
- [x] MySQL database `codealpha_social_media` with all **23 tables**.
- [x] Camera access using HTML5 MediaDevices API with live preview, lens toggle, and track cleanup.
- [x] Canvas photo editor with brightness/contrast/saturation, filter presets, text overlays, and export.
- [x] Font Customization: Poppins, Inter, Roboto, Lato, Playfair Display with size slider and live preview.
- [x] Theme Customization with persistent MySQL storage in `user_preferences`.
- [x] Stories carousel with 24-hour expiration.
- [x] Real-time 1-on-1 chat, typing indicators, read receipts, and notification stream.
- [x] Complete installation commands, SQL scripts, and documentation.
