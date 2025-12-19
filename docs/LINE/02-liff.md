# LIFF (LINE Front-end Framework)

> Source: https://developers.line.biz/en/docs/liff/

## What is LIFF?

LIFF is LINE's front-end framework for building web applications that run inside the LINE app. LIFF apps can:

- Get user data from LINE Platform (user ID, profile)
- Send messages on the user's behalf
- Access device features (camera, QR scanner)
- Run in LINE's embedded browser with native integrations

## LIFF Browser

LIFF apps run in a specialized browser embedded in LINE:
- **iOS**: WKWebView
- **Android**: Android WebView

### View Sizes

| Size | Description |
|------|-------------|
| **Full** | Full screen with action button |
| **Tall** | 3/4 screen height |
| **Compact** | 1/2 screen height |

## SDK Installation

### Option 1: CDN (Recommended for Quick Start)

**Edge Path** (auto-updates with new features):
```html
<script charset="utf-8" src="https://static.line-scdn.net/liff/edge/2/sdk.js"></script>
```

**Fixed Version** (specific version, manual updates):
```html
<script charset="utf-8" src="https://static.line-scdn.net/liff/edge/versions/2.22.3/sdk.js"></script>
```

### Option 2: NPM

```bash
npm install --save @line/liff
# or
yarn add @line/liff
```

```javascript
import liff from "@line/liff";
```

## Initialization

### Basic Setup

```javascript
liff
  .init({
    liffId: "1234567890-AbcdEfgh"
  })
  .then(() => {
    // LIFF initialized, start using APIs
    console.log("LIFF initialized");
  })
  .catch((err) => {
    console.error("LIFF initialization failed", err);
  });
```

### Auto-Login for External Browsers

```javascript
liff.init({
  liffId: "1234567890-AbcdEfgh",
  withLoginOnExternalBrowser: true  // Auto-trigger login
})
.then(() => {
  // User automatically logged in if in external browser
});
```

### Important Notes

- Execute `liff.init()` only **once** per page load
- Only call after page is at endpoint URL or subdirectory
- Don't change URLs until Promise resolves
- Don't send redirect URL (contains `access_token`) to analytics

## Environment Detection

```javascript
// Available BEFORE init()
console.log(liff.getOS());           // "ios" | "android" | "web"
console.log(liff.getVersion());      // LIFF SDK version
console.log(liff.isInClient());      // true if running in LINE app
console.log(liff.getAppLanguage());  // App language setting

// Available AFTER init()
console.log(liff.isLoggedIn());      // true if user authenticated
console.log(liff.getLineVersion());  // LINE app version
```

## User Authentication

### Login / Logout

```javascript
// Check login status and login if needed
if (!liff.isLoggedIn()) {
  liff.login();  // Redirects to LINE Login
}

// Logout
if (liff.isLoggedIn()) {
  liff.logout();
  window.location.reload();
}
```

## User Profile & Data

### Get Access Token

```javascript
if (liff.isLoggedIn() || liff.isInClient()) {
  const accessToken = liff.getAccessToken();
  console.log(accessToken);
  // Send to your server for API calls
}
```

### Get ID Token (JWT)

```javascript
// Raw JWT token
const idToken = liff.getIDToken();

// Decoded token (for display only, verify on server)
const decoded = liff.getDecodedIDToken();
console.log(decoded.name);    // Display name
console.log(decoded.picture); // Profile picture URL
console.log(decoded.email);   // Email (if scope granted)
```

### Get User Profile

```javascript
liff.getProfile()
  .then((profile) => {
    console.log(profile.userId);        // LINE user ID
    console.log(profile.displayName);   // Display name
    console.log(profile.pictureUrl);    // Profile picture
    console.log(profile.statusMessage); // Status message
  })
  .catch((err) => {
    console.error("Error getting profile", err);
  });
```

### Check Friendship Status

```javascript
liff.getFriendship()
  .then((data) => {
    if (data.friendFlag) {
      console.log("User is friend with Official Account");
    } else {
      console.log("User is NOT friend");
    }
  });
```

**Requirement**: Select `profile` scope when registering LIFF app.

## Messaging APIs

### Send Message to Current Chat

```javascript
liff
  .sendMessages([
    {
      type: "text",
      text: "Hello, World!"
    }
  ])
  .then(() => {
    console.log("Message sent!");
  })
  .catch((err) => {
    console.error("Failed to send message", err);
  });
```

**Limit**: Maximum 5 message objects per request.

### Share Target Picker (Send to Friends/Groups)

```javascript
if (liff.isApiAvailable("shareTargetPicker")) {
  liff.shareTargetPicker([
    {
      type: "text",
      text: "Check out this loan application!"
    }
  ])
  .then((res) => {
    if (res) {
      console.log("Message shared");
    } else {
      console.log("Share cancelled");
    }
  });
}
```

**Setup**: Enable "shareTargetPicker" in LINE Developers Console > LIFF tab.

## QR Code Scanning

```javascript
liff
  .scanCodeV2()
  .then((result) => {
    console.log(result.value);  // Scanned string
  })
  .catch((err) => {
    console.error("Scan failed", err);
  });
```

**Compatibility**:
- iOS 14.3+ (LIFF browser), iOS 11+ (external)
- Android: All versions
- External browser: WebRTC-supported browsers

**Setup**: Enable "Scan QR" in LIFF settings.

## Navigation

### Open URL

```javascript
liff.openWindow({
  url: "https://example.com",
  external: true  // true = external browser, false = LINE in-app
});
```

### Close LIFF App

```javascript
if (liff.isInClient()) {
  liff.closeWindow();
} else {
  window.alert("Cannot close - not in LINE app");
}
```

### Get Context

```javascript
const context = liff.getContext();
console.log(context.type);      // "utou" | "room" | "group" | "none"
console.log(context.userId);    // User ID
console.log(context.viewType);  // "full" | "tall" | "compact"
```

### Create Permanent Link

```javascript
liff.permanentLink
  .createUrlBy("https://example.com/path?query=value")
  .then((permanentLink) => {
    console.log(permanentLink);
    // https://liff.line.me/1234567890-AbcdEfgh/path?query=value
  });
```

## LIFF App Registration

### Steps

1. Go to LINE Developers Console
2. Select LINE Login channel
3. Navigate to LIFF tab
4. Click "Add"
5. Configure:
   - **Name**: App name (cannot contain "LINE")
   - **Size**: Full, Tall, or Compact
   - **Endpoint URL**: HTTPS URL of your web app
   - **Scopes**: openid, profile, email, chat_message.write

### Scopes

| Scope | Enables |
|-------|---------|
| `openid` | ID token retrieval |
| `profile` | Profile and friendship access |
| `email` | Email address access |
| `chat_message.write` | Sending messages |

### Output

After registration:
- **LIFF ID**: `1234567890-AbcdEfgh`
- **LIFF URL**: `https://liff.line.me/1234567890-AbcdEfgh`

## Complete Example

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>My LIFF App</title>
  <script charset="utf-8" src="https://static.line-scdn.net/liff/edge/2/sdk.js"></script>
</head>
<body>
  <div id="app">
    <h1>Welcome</h1>
    <p id="user-name">Loading...</p>
    <button id="send-btn">Send Message</button>
  </div>

  <script>
    liff.init({ liffId: "YOUR_LIFF_ID" })
      .then(() => {
        if (!liff.isLoggedIn()) {
          liff.login();
          return;
        }

        // Get user profile
        liff.getProfile().then((profile) => {
          document.getElementById("user-name").textContent =
            `Hello, ${profile.displayName}!`;
        });

        // Send message button
        document.getElementById("send-btn").onclick = () => {
          liff.sendMessages([
            { type: "text", text: "Hello from LIFF!" }
          ]).then(() => {
            alert("Message sent!");
            liff.closeWindow();
          });
        };
      })
      .catch((err) => {
        console.error("LIFF init error", err);
      });
  </script>
</body>
</html>
```

## Development Tools

| Tool | Purpose |
|------|---------|
| **LIFF Starter App** | Demo app for beginners |
| **Create LIFF App** | CLI scaffolding tool |
| **LIFF CLI** | Advanced debugging |
| **LIFF Playground** | Browser-based testing |
