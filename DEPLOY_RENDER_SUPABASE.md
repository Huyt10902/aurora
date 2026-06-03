# Deploy Aurora on Render + Supabase

This deployment runs the full app from one Render Web Service:

- Express serves `/api/*`
- Express serves the built Vite frontend from `frontend/dist`
- PostgreSQL is hosted by Supabase
- Uploaded audio and images are stored in Supabase Storage through its S3-compatible API

## 1. Prepare Supabase

1. Create a Supabase project.
2. Open SQL Editor and run `backend/src/db/schema.sql`.
3. Create a public Storage bucket named `aurora`.
4. In Storage S3 settings, create/copy:
   - S3 endpoint
   - region
   - access key
   - secret key
5. Copy the Supabase database connection string for `DATABASE_URL`.

## 2. Create Render Web Service

Use this repository as a Render Web Service. You can either use `render.yaml` or set the same values manually.

Build command:

```bash
npm ci --prefix backend && npm ci --prefix frontend && npm run build --prefix frontend
```

Start command:

```bash
npm start --prefix backend
```

## 3. Render environment variables

Set these in Render:

```env
NODE_ENV=production
PGSSL=true
DATABASE_URL=postgresql://...
CLIENT_URL=https://YOUR_RENDER_SERVICE.onrender.com
ADMIN_EMAIL=your-admin-email@example.com

JWT_ACCESS_SECRET=generate-a-long-random-secret
JWT_REFRESH_SECRET=generate-another-long-random-secret
ACCESS_TOKEN_EXPIRES_IN=15m
REFRESH_TOKEN_EXPIRES_IN_DAYS=30

STORAGE_PROVIDER=supabase
STORAGE_ENDPOINT=https://PROJECT_REF.storage.supabase.co/storage/v1/s3
STORAGE_PUBLIC_URL=https://PROJECT_REF.supabase.co/storage/v1/object/public
STORAGE_ACCESS_KEY=...
STORAGE_SECRET_KEY=...
STORAGE_BUCKET=aurora
STORAGE_REGION=copy-from-supabase-s3-settings
STORAGE_ENSURE_BUCKET=false
STORAGE_PUBLIC_READ=false
UPLOAD_MAX_FILE_MB=50
```

Do not set `CLIENT_URL` to the frontend dev URL in production. It must be the Render service URL.

## 4. Optional seed data

After the schema is applied, you can run seed scripts locally against the Supabase database by setting `backend/.env` to the Supabase connection and running:

```bash
npm run seed:albums --prefix backend
```

Use this only if you want demo songs/albums.

## 5. Verify after deploy

Open these URLs:

- `/`
- `/api/search`
- `/api/search/filters`
- `/api/subscriptions/plans`

Then sign in as the email in `ADMIN_EMAIL`, upload a test song, and confirm the media URL points to Supabase Storage.
