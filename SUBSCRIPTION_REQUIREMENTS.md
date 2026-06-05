# Cập nhật: Bắt buộc đăng nhập và subscription để nghe nhạc

## Tổng quan
Dự án Aurora đã được cập nhật để yêu cầu người dùng **phải đăng nhập** và **có gói subscription trả phí** mới có thể nghe nhạc.

## Các thay đổi Backend

### 1. Middleware mới: `requireSubscription`
**File**: `backend/src/middleware/auth.middleware.js`

Thêm middleware kiểm tra:
- User đã đăng nhập
- User có subscription đang hoạt động
- Subscription không phải là gói "free"
- Subscription chưa hết hạn

Trả về lỗi 403 với `requiresSubscription: true` nếu không đáp ứng điều kiện.

### 2. Routes được bảo vệ
Các route sau đã được thêm middleware `requireSubscription`:

**Songs** (`backend/src/routes/song.route.js`):
- `GET /api/songs` - Tất cả bài hát
- `GET /api/songs/featured` - Bài hát nổi bật
- `GET /api/songs/made-for-you` - Bài hát đề xuất
- `GET /api/songs/trending` - Bài hát thịnh hành
- `GET /api/songs/:songId` - Chi tiết bài hát
- `PUT /api/songs/:songId/rating` - Đánh giá
- `DELETE /api/songs/:songId/rating` - Xóa đánh giá
- `POST /api/songs/:songId/comments` - Bình luận
- `DELETE /api/songs/:songId/comments/:commentId` - Xóa bình luận

**Albums** (`backend/src/routes/album.route.js`):
- `GET /api/albums` - Tất cả albums
- `GET /api/albums/:albumId` - Chi tiết album

**Artists** (`backend/src/routes/artist.route.js`):
- `GET /api/artists/:artistId` - Chi tiết artist

**Playlists** (`backend/src/routes/playlist.route.js`):
- Tất cả playlist routes

**Library** (`backend/src/routes/library.route.js`):
- `GET /api/library/liked` - Bài hát yêu thích
- `GET /api/library/liked/ids` - IDs bài hát yêu thích
- `PUT /api/library/liked/:songId` - Like bài hát
- `DELETE /api/library/liked/:songId` - Unlike bài hát

**Listening** (`backend/src/routes/listening.route.js`):
- `POST /api/listening/plays/:songId` - Ghi nhận lượt nghe
- `GET /api/listening/recent` - Lịch sử nghe
- `GET /api/listening/recommendations` - Đề xuất

## Các thay đổi Frontend

### 1. Axios Interceptor
**File**: `frontend/src/lib/axios.ts`

Thêm xử lý lỗi subscription (403):
- Hiển thị toast error
- Tự động redirect về `/subscription` sau 1.5 giây

### 2. Player Store
**File**: `frontend/src/stores/usePlayerStore.ts`

Các hàm được cập nhật kiểm tra `isPremium`:
- `setCurrentSong()` - Chặn phát nhạc nếu không premium
- `togglePlay()` - Chặn play/pause
- `playNext()` - Chặn next song
- `playPrevious()` - Chặn previous song

### 3. Play Button Component
**File**: `frontend/src/pages/home/components/PlayButton.tsx`

Thêm kiểm tra subscription trước khi phát nhạc:
- Hiển thị toast error nếu không có subscription
- Redirect về trang subscription

### 4. Album Page
**File**: `frontend/src/pages/album/AlbumPage.tsx`

Cập nhật các handler:
- `handlePlayAlbum()` - Kiểm tra subscription
- `handlePlaySong()` - Kiểm tra subscription

### 5. Home Page Banner
**File**: `frontend/src/pages/home/HomePage.tsx`

Thêm banner cảnh báo cho user chưa có subscription:
- Icon Crown màu vàng
- Thông báo rõ ràng
- Nút "Subscribe Now"

## Trải nghiệm người dùng

### User chưa đăng nhập
- Không thể truy cập bất kỳ API nào liên quan đến music
- Nhận lỗi 401: "You must be logged in to play music"

### User đã đăng nhập nhưng không có subscription / đang dùng Free plan
- Thấy banner cảnh báo trên trang chủ
- Click phát nhạc → Hiển thị toast error
- Tự động redirect về `/subscription` để đăng ký

### User có Premium subscription
- Sử dụng app như bình thường
- Không có hạn chế

## Các gói subscription hiện có

Theo database schema (`backend/src/db/schema.sql`):

1. **Free** (0 VND)
   - Không thể nghe nhạc
   
2. **Premium Monthly** (59,000 VND/tháng)
   - Nghe nhạc không giới hạn
   - Playlists không giới hạn
   - Chất lượng audio cao
   - Đề xuất nâng cao
   - Premium badge

3. **Premium Yearly** (590,000 VND/năm)
   - Tất cả tính năng như Monthly
   - Tiết kiệm chi phí dài hạn

## Testing

### Test subscription middleware
```bash
# Đảm bảo backend đang chạy
npm run dev:backend

# Test với user không có subscription
curl -H "Authorization: Bearer <access_token>" \
  http://localhost:5000/api/songs/featured

# Kết quả mong đợi: 403 với message về subscription
```

### Test frontend flow
1. Đăng nhập với tài khoản free
2. Vào trang home → Thấy banner cảnh báo
3. Click play button → Thấy toast error + redirect
4. Subscribe một gói premium
5. Click play lại → Nhạc phát bình thường

## Migration notes

**Không cần migration database** - Schema subscription đã có sẵn.

Chỉ cần:
1. Restart backend server
2. Rebuild frontend
3. Test với users hiện có

## Lưu ý quan trọng

⚠️ **Admin vẫn cần subscription** - Admin role không bypass yêu cầu subscription.

⚠️ **Subscription expiry** - Hệ thống tự động check và expire subscription hết hạn khi gọi API.

⚠️ **Mock payment** - Hiện tại dùng mock payment provider, dễ dàng test subscription flow.
