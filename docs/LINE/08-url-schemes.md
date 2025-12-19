# LINE URL Schemes

> Source: https://developers.line.biz/en/docs/messaging-api/using-line-url-scheme/

## Overview

LINE URL schemes allow you to deep link into LINE app features. These work on iOS and Android (not LINE for PC).

## URL Scheme Types

| Prefix | Purpose |
|--------|---------|
| `https://line.me/R/` | LINE app features |
| `https://liff.line.me/` | LIFF apps |
| `https://miniapp.line.me/` | LINE MINI Apps |

**Note**: The old `line://` scheme is deprecated for security reasons.

## LIFF App URLs

Open LIFF apps directly:

```
https://liff.line.me/{LIFF_ID}
```

With path and query:
```
https://liff.line.me/{LIFF_ID}/path?query=value
```

### Examples

```javascript
// Loan application
const applyUrl = 'https://liff.line.me/1234567890-AbcdEfgh/apply';

// Dashboard
const dashboardUrl = 'https://liff.line.me/1234567890-AbcdEfgh/dashboard';

// Payment with loan ID
const paymentUrl = 'https://liff.line.me/1234567890-AbcdEfgh/payment?loanId=12345';
```

## Official Account URLs

### View Profile

```
https://line.me/R/ti/p/{LINE_ID}
```

`{LINE_ID}` must be percent-encoded (replace `@` with `%40`):

```javascript
const lineId = '@loanservice';
const encodedId = encodeURIComponent(lineId);
const profileUrl = `https://line.me/R/ti/p/${encodedId}`;
// https://line.me/R/ti/p/%40loanservice
```

### Add Friend

Same as profile URL - opens with "Add Friend" button.

### Open Chat

```
https://line.me/R/oaMessage/{LINE_ID}
```

With pre-filled message:
```
https://line.me/R/oaMessage/{LINE_ID}/?{MESSAGE}
```

```javascript
const lineId = '@loanservice';
const message = 'ต้องการสอบถามเรื่องสินเชื่อ';
const chatUrl = `https://line.me/R/oaMessage/${encodeURIComponent(lineId)}/?${encodeURIComponent(message)}`;
```

### Share Official Account

```
https://line.me/R/nv/recommendOA/{LINE_ID}
```

## LINE App Navigation

### Open Specific Screens

| URL | Opens |
|-----|-------|
| `https://line.me/R/nv/chat` | Chats tab |
| `https://line.me/R/nv/timeline` | Timeline |
| `https://line.me/R/nv/wallet` | Wallet |
| `https://line.me/R/nv/addFriends` | Add friends screen |
| `https://line.me/R/nv/settings` | Settings |
| `https://line.me/R/nv/profile` | My profile |
| `https://line.me/R/nv/QRCodeReader` | QR scanner |

### Camera

```
https://line.me/R/nv/camera/
```

**Note**: Only works within LINE chats.

### Camera Roll

```
https://line.me/R/nv/cameraRoll/single  // Select single image
https://line.me/R/nv/cameraRoll/multi   // Select multiple
```

### Location

```
https://line.me/R/nv/location/
```

## Share Content

### Share Text

```
https://line.me/R/share?text={MESSAGE}
```

```javascript
const message = 'Check out this loan calculator!';
const shareUrl = `https://line.me/R/share?text=${encodeURIComponent(message)}`;
```

### Share Message

Opens share target picker:

```
https://line.me/R/msg/text/?{MESSAGE}
```

## Sticker/Theme Shop

```
https://line.me/R/nv/stickerShop
https://line.me/R/shop/theme/detail?id={PRODUCT_ID}
```

## Usage in Rich Menu Actions

```javascript
{
  type: "uri",
  uri: "https://liff.line.me/1234567890-AbcdEfgh/apply",
  altUri: {
    desktop: "https://example.com/apply"  // Fallback for desktop
  }
}
```

## Usage in Flex Messages

```javascript
{
  type: "button",
  action: {
    type: "uri",
    label: "Open Dashboard",
    uri: "https://liff.line.me/1234567890-AbcdEfgh/dashboard"
  }
}
```

## Usage in LIFF Apps

```javascript
// Open in LINE in-app browser
liff.openWindow({
  url: 'https://line.me/R/nv/wallet',
  external: false
});

// Open in external browser
liff.openWindow({
  url: 'https://example.com/terms',
  external: true
});
```

## QR Codes

Generate QR codes for these URLs to let users:
- Add your Official Account as friend
- Open specific LIFF apps
- Start a chat with pre-filled message

```javascript
// Using qrcode library
const QRCode = require('qrcode');

async function generateAddFriendQR(lineId) {
  const url = `https://line.me/R/ti/p/${encodeURIComponent(lineId)}`;
  return await QRCode.toDataURL(url);
}
```

## Platform Availability

| Feature | iOS | Android | PC |
|---------|-----|---------|-----|
| LIFF URLs | ✅ | ✅ | ✅ (browser) |
| LINE app URLs | ✅ | ✅ | ❌ |
| Camera/Location | ✅ (in chat) | ✅ (in chat) | ❌ |

## Best Practices

1. **Always percent-encode** special characters in URLs
2. **Use HTTPS** - never use deprecated `line://`
3. **Provide fallbacks** - use `altUri` for desktop users
4. **Test on devices** - some URLs only work on mobile
5. **Use LIFF URLs** for your web apps - they integrate seamlessly
