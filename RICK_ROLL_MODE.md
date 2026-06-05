# 🎵 Rick Roll Mode - Easter Egg Feature

## Tổng quan
Thêm tính năng "troll" vui vẻ cho app! Khi bật Rick Roll Mode, người dùng chưa có subscription sẽ được... Rick Roll'd khi cố phát nhạc 😄

## Cách hoạt động

### 1. Toggle Switch ở Profile Page
User có thể bật/tắt Rick Roll Mode trong **Profile → Fun Settings**

**Path**: `frontend/src/pages/profile/ProfilePage.tsx`

Features:
- Switch component với màu pink
- Badge "Easter Egg" 
- Mô tả rõ ràng
- Confirmation message khi bật

### 2. Settings Store
**Path**: `frontend/src/stores/useSettingsStore.ts`

Sử dụng Zustand + Persist để lưu setting:
```typescript
{
  rickRollMode: boolean;
  toggleRickRollMode: () => void;
}
```

Setting được lưu vào localStorage với key: `aurora-settings`

### 3. SubscriptionDialog Component (Updated)
**Path**: `frontend/src/components/SubscriptionDialog.tsx`

2 modes:
- **Normal Mode**: Dialog subscription thông thường
- **Rick Roll Mode**: Full YouTube video "Never Gonna Give You Up" 🎵

## Rick Roll Mode Features

### Video
- YouTube embed autoplay
- Full width responsive
- Rick Astley - Never Gonna Give You Up
- Video ID: `dQw4w9WgXcQ`

### UI Elements
- Laugh icon với animation bounce
- Màu green theme thay vì yellow
- Text "You've been Rick Roll'd! 😄"
- Message vui: "Hope you enjoyed that! Now let's get you premium access..."

### Buttons
- 😅 Nice Try (Close dialog)
- 🎵 Get Premium / Sign In (Navigate to subscription/login)

### Animation
- Delay 500ms trước khi hiển thị video (surprise effect)
- Smooth transition

## User Flow

### Scenario 1: Rick Roll Mode OFF (Default)
```
User chưa subscribe → Click play → Normal subscription dialog
```

### Scenario 2: Rick Roll Mode ON
```
User chưa subscribe → Click play → 
Wait 0.5s → BAM! Rick Roll video autoplay → 
User laughs → Click "Get Premium" → Subscribe
```

## Technical Details

### Dependencies Added
```bash
npm install @radix-ui/react-switch
```

### New Components
1. `frontend/src/components/ui/switch.tsx` - Switch UI component
2. `frontend/src/stores/useSettingsStore.ts` - Settings store

### Modified Files
1. `frontend/src/components/SubscriptionDialog.tsx` - Rick Roll logic
2. `frontend/src/pages/profile/ProfilePage.tsx` - Settings UI

## Easter Egg Details

### Why Rick Roll?
- Classic internet meme
- Universal recognition
- Actually a good song! 😄
- Adds humor to subscription prompt

### Respect User Choice
- **Default OFF** - User must opt-in
- Easy to toggle on/off
- Clear description
- Not annoying (only shows once per dialog open)

### Premium Users
Rick Roll Mode **không ảnh hưởng** premium users vì họ không thấy subscription dialog.

## Code Snippets

### Check Rick Roll Mode
```typescript
const { rickRollMode } = useSettingsStore();

if (showRickRoll && rickRollMode) {
  // Show Rick Roll version
} else {
  // Show normal version
}
```

### Toggle Rick Roll
```typescript
const { toggleRickRollMode } = useSettingsStore();

<Switch
  checked={rickRollMode}
  onCheckedChange={toggleRickRollMode}
/>
```

## Testing

### Test Rick Roll Mode ON
1. Đăng nhập
2. Vào Profile → Fun Settings
3. Bật "Rick Roll Mode" switch
4. Đăng xuất (hoặc dùng incognito)
5. Click play bất kỳ bài hát nào
6. → BOOM! Rick Roll 🎵

### Test Rick Roll Mode OFF
1. Tắt switch
2. Click play
3. → Normal subscription dialog

## UI/UX Considerations

### Không spam
- Chỉ hiện 1 lần khi open dialog
- User có thể đóng ngay
- Không loop video
- Không force fullscreen

### Professional Balance
- Fun feature nhưng không làm mất tính chuyên nghiệp
- Hidden trong settings (not in-your-face)
- Easter egg style (cho người biết)

## Deployment

✅ Build thành công
✅ Commit: `27a354b`
✅ Push lên GitHub
⏳ Render auto-deploy

## Fun Stats

- Rick Astley views: 1.4+ billion
- Year released: 1987
- Meme started: ~2007
- Still relevant: 2025 🎵

---

Never gonna give you up,
Never gonna let you down,
Never gonna run around and desert you! 🎵😄
