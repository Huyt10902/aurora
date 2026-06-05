# Admin Rick Roll Mode Setup Guide

## Tổng quan thay đổi
Rick Roll Mode giờ được **quản lý tập trung bởi Admin** thay vì mỗi user tự bật/tắt.

## Database Migration

### 1. Chạy SQL tạo bảng app_settings

Kết nối vào PostgreSQL của bạn và chạy:

```sql
-- Create app_settings table for global app configuration
CREATE TABLE IF NOT EXISTS app_settings (
	key VARCHAR(100) PRIMARY KEY,
	value TEXT NOT NULL,
	description TEXT,
	updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
	updated_by UUID REFERENCES users(id) ON DELETE SET NULL
);

-- Insert default settings
INSERT INTO app_settings (key, value, description)
VALUES ('rick_roll_mode', 'false', 'Enable Rick Roll easter egg for non-subscribers')
ON CONFLICT (key) DO NOTHING;
```

**Hoặc sử dụng file có sẵn:**
```bash
psql $DATABASE_URL -f backend/src/db/init-settings.sql
```

### 2. Kiểm tra table đã tạo thành công

```sql
SELECT * FROM app_settings;
```

Kết quả mong đợi:
```
      key       | value |                description                
----------------+-------+------------------------------------------
 rick_roll_mode | false | Enable Rick Roll easter egg for non-subscribers
```

## Backend Changes

### New Files Created:
1. `backend/src/repositories/settings.repository.js` - Database queries
2. `backend/src/db/init-settings.sql` - Migration script

### Modified Files:
1. `backend/src/routes/admin.route.js` - Added settings endpoints
2. `backend/src/controller/admin.controller.js` - Added settings controllers
3. `backend/src/services/admin.service.js` - Added settings service methods

### New API Endpoints:

**Get Settings** (Admin only)
```
GET /api/admin/settings
Authorization: Bearer <admin_token>

Response:
{
  "rick_roll_mode": false
}
```

**Update Settings** (Admin only)
```
PUT /api/admin/settings
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "rick_roll_mode": true
}

Response:
{
  "rick_roll_mode": true
}
```

## Frontend Changes

### New Files:
1. `frontend/src/pages/admin/components/SettingsTabContent.tsx` - Settings UI tab

### Modified Files:
1. `frontend/src/pages/admin/AdminPage.tsx` - Added Settings tab
2. `frontend/src/stores/useSettingsStore.ts` - Changed from localStorage to API
3. `frontend/src/pages/profile/ProfilePage.tsx` - Removed Rick Roll toggle
4. `frontend/src/components/SubscriptionDialog.tsx` - Fetch settings on mount

### Store Changes:

**Before** (localStorage):
```typescript
{
  rickRollMode: boolean;
  toggleRickRollMode: () => void;
}
```

**After** (API):
```typescript
{
  rickRollMode: boolean;
  isLoading: boolean;
  fetchSettings: () => Promise<void>;
  updateRickRollMode: (value: boolean) => Promise<void>;
}
```

## Admin Dashboard

### Accessing Rick Roll Settings:

1. Đăng nhập với tài khoản **Admin**
2. Vào **Admin Dashboard** (`/admin`)
3. Click tab **"Settings"** (icon ⚙️)
4. Toggle **"Rick Roll Mode 🎵"** switch

### UI Features:

- 💗 Pink theme cho easter egg section
- 😄 Laugh icon 
- 🎵 Easter Egg badge
- ℹ️ Detailed description
- ✨ Confirmation message khi bật
- 📚 About section giải thích easter eggs

## User Experience

### Normal Users:
- **Không thấy** settings toggle nữa trong Profile
- Không thể tự bật/tắt Rick Roll Mode
- Chỉ bị ảnh hưởng bởi quyết định của Admin

### Admins:
- **Kiểm soát toàn bộ** Rick Roll Mode cho tất cả users
- Bật/tắt dễ dàng trong Admin Dashboard
- Thấy trạng thái real-time

### Anonymous/Free Users (khi Rick Roll ON):
```
Click play → Wait 0.5s → BAM! 🎵
→ Rick Astley autoplay
→ "You've been Rick Roll'd! 😄"
→ Button "Get Premium"
```

## Testing Flow

### 1. Test Admin Panel
```bash
# Admin login
# Go to /admin
# Click Settings tab
# Toggle Rick Roll Mode ON
# Should see: "Rick Roll Mode activated! 🎵"
```

### 2. Test User Experience
```bash
# Open incognito/private window
# Browse music (should work)
# Click play button
# → If Rick Roll ON: See video
# → If Rick Roll OFF: See normal dialog
```

### 3. Test API
```bash
# Get current settings
curl http://localhost:5000/api/admin/settings \
  -H "Authorization: Bearer <admin_token>"

# Update settings
curl -X PUT http://localhost:5000/api/admin/settings \
  -H "Authorization: Bearer <admin_token>" \
  -H "Content-Type: application/json" \
  -d '{"rick_roll_mode": true}'
```

## Deployment Steps

### Local Development:
```bash
# 1. Chạy SQL migration
npm run db:schema --prefix backend
# Hoặc: psql $DATABASE_URL -f backend/src/db/init-settings.sql

# 2. Restart backend
npm run dev:backend

# 3. Build frontend
npm run build --prefix frontend

# 4. Test admin dashboard
```

### Production (Render + Supabase):
```bash
# 1. Connect to Supabase PostgreSQL
psql <SUPABASE_DATABASE_URL>

# 2. Run migration
\i backend/src/db/init-settings.sql
# Hoặc copy-paste SQL từ file

# 3. Push code lên GitHub
git add .
git commit -m "feat: move Rick Roll mode to admin control"
git push origin main

# 4. Render auto-deploy
# Wait 3-5 minutes

# 5. Test production admin panel
```

## Security Notes

✅ **Only Admins** có thể:
- Xem settings (`GET /api/admin/settings`)
- Cập nhật settings (`PUT /api/admin/settings`)

✅ **Protected by middleware**:
- `protectRoute` - Must be logged in
- `requireAdmin` - Must be admin role

✅ **Settings tracked**:
- `updated_by` - User ID của admin đã update
- `updated_at` - Timestamp của update cuối

## Rollback

Nếu cần rollback về localStorage version:
```bash
git revert HEAD
# Hoặc checkout commit trước đó
```

## Future Enhancements

Có thể thêm settings khác:
- `maintenance_mode` - Bật/tắt maintenance
- `max_upload_size` - Giới hạn upload
- `enable_chat` - Bật/tắt chat feature
- `featured_rotation_hours` - Tần suất đổi featured songs

## Summary

| Feature | Before | After |
|---------|--------|-------|
| Control | User cá nhân | Admin tập trung |
| Storage | localStorage | PostgreSQL |
| Scope | Per-user | Global |
| Management | Profile page | Admin dashboard |
| API | None | REST endpoints |
| Database | None | `app_settings` table |

---

**Never gonna give you up! But now only Admin decides when! 🎵😄**
