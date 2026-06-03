<h1 align="center">Aurora</h1>

![Demo App](/frontend/public/screenshot-for-readme.png)

Aurora is a full-stack music app with local username/password authentication, PostgreSQL persistence, JWT access tokens, long-lived refresh tokens, admin music management, playback, chat, and realtime activity.

### Install

```bash
npm run install:all
```

### Backend environment

Copy `backend/.env.example` to `backend/.env`, then update the local values:

```bash
PORT=5000
DATABASE_URL=postgres://USER:PASSWORD@localhost:5432/aurora
# Or use PGHOST/PGPORT/PGDATABASE/PGUSER/PGPASSWORD instead of DATABASE_URL
PGSSL=false
CLIENT_URL=http://localhost:3000
ADMIN_EMAIL=admin@example.com
NODE_ENV=development

JWT_ACCESS_SECRET=replace-with-a-long-random-secret
JWT_REFRESH_SECRET=replace-with-another-long-random-secret
ACCESS_TOKEN_EXPIRES_IN=15m
REFRESH_TOKEN_EXPIRES_IN_DAYS=30

MINIO_ENDPOINT=http://localhost:9000
MINIO_PUBLIC_URL=http://localhost:9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
MINIO_BUCKET=aurora
MINIO_REGION=us-east-1
MINIO_PUBLIC_READ=true
UPLOAD_MAX_FILE_MB=50
```

Uploaded song audio and cover images are stored in local MinIO for development. PostgreSQL only stores the public URL, object key, file type, and metadata in `media_assets`.

Start local MinIO before testing uploads:

```bash
npm run storage:up
```

MinIO console: `http://localhost:9001` with `minioadmin` / `minioadmin`.

If uploaded covers or audio show as broken on `localhost:3000`, check that MinIO is running on `http://localhost:9000`. Existing uploaded media URLs point to that local storage service.

For production deployment on Render with Supabase Postgres and Supabase Storage, see `DEPLOY_RENDER_SUPABASE.md`.

### Database setup

```bash
npm run db:schema --prefix backend
npm run seed:albums --prefix backend
```

The database is modeled with independent entities and relationship tables:

- Basic entities: `roles`, `users`, `artists`, `genres`, `categories`, `subscription_plans`, `subscription_features`
- External object entities: `media_assets`, `payment_providers`
- Business entities: `songs`, `albums`, `playlists`, `messages`, `refresh_tokens`, `user_song_plays`, `song_ratings`, `song_comments`, `user_subscriptions`, `subscription_orders`, `payment_events`
- Relationship tables: `friendships`, `user_blocks`, `song_artists`, `album_artists`, `album_songs`, `song_genres`, `song_categories`, `playlist_songs`, `user_liked_songs`, `plan_features`, `payment_provider_customers`, `payment_provider_subscriptions`

If you already created the older Mongo-style PostgreSQL schema, use a fresh database before applying this schema.

### Backend architecture

Backend code follows a controller/service/repository split:

- `controller`: HTTP request and response only
- `service`: business rules and orchestration
- `repository`: PostgreSQL queries and persistence
- `lib`: shared infrastructure such as JWT, password hashing, cookies, DB pool, and serializers

### Admin classification

Admin users can manage genres and classify songs:

- `GET /api/admin/genres`
- `POST /api/admin/genres`
- `DELETE /api/admin/genres/:id`
- `PUT /api/admin/songs/:id`
- `PUT /api/admin/songs/:id/classification`
- `GET /api/admin/categories`
- `POST /api/admin/categories`
- `DELETE /api/admin/categories/:id`
- `PUT /api/admin/albums/:id`

### Friends and chat

Users must become friends before they can read message history or send realtime chat messages. Chat supports unread counts, seen status, typing indicators, friend request notifications, and blocking.

- `GET /api/friends`
- `POST /api/friends/requests/:userId`
- `PUT /api/friends/requests/:userId/accept`
- `PUT /api/friends/requests/:userId/reject`
- `DELETE /api/friends/:userId`
- `GET /api/users/messages/unread-counts`
- `PUT /api/users/messages/:userId/read`
- `PUT /api/users/blocks/:userId`
- `DELETE /api/users/blocks/:userId`

### Profile

- `PUT /api/users/me/profile`
- `PUT /api/users/me/password`

### Library, playlists, and search

- `GET /api/library/liked`
- `GET /api/library/liked/ids`
- `PUT /api/library/liked/:songId`
- `DELETE /api/library/liked/:songId`
- `GET /api/playlists`
- `POST /api/playlists`
- `GET /api/playlists/:playlistId`
- `PUT /api/playlists/:playlistId`
- `DELETE /api/playlists/:playlistId`
- `PUT /api/playlists/:playlistId/songs/:songId`
- `DELETE /api/playlists/:playlistId/songs/:songId`
- `PUT /api/playlists/:playlistId/songs`
- `GET /api/search?q=&genreId=&categoryId=`
- `GET /api/search/filters`
- `GET /api/artists/:artistId`

### Listening history and recommendations

- `POST /api/listening/plays/:songId`
- `GET /api/listening/recent`
- `GET /api/listening/recommendations`

Song responses include `playCount`, calculated from listening history. Plays are counted for both signed-in users and anonymous listeners, while recently played and recommendations remain user-specific. The Trending section uses this count.

### Song details, ratings, and comments

- `GET /api/songs/:songId`
- `PUT /api/songs/:songId/rating`
- `DELETE /api/songs/:songId/rating`
- `POST /api/songs/:songId/comments`
- `DELETE /api/songs/:songId/comments/:commentId`

Song detail responses include rating summary, the current user's rating when authenticated, and the latest comments.

### Subscriptions

- `GET /api/subscriptions/plans`
- `GET /api/subscriptions/me`
- `POST /api/subscriptions/checkout`
- `POST /api/subscriptions/orders/:orderId/mock-confirm`
- `POST /api/subscriptions/cancel`

The current implementation uses a local mock payment provider so the subscription business flow can be tested before connecting Stripe, MoMo, or another provider.

### Run

```bash
npm run dev:backend
npm run dev:frontend
```
