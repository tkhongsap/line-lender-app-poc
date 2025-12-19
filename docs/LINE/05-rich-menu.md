# Rich Menu

> Source: https://developers.line.biz/en/docs/messaging-api/using-rich-menus/

## Overview

Rich menus are customizable menu interfaces displayed at the bottom of LINE chats. They provide visual buttons that trigger actions when tapped.

```
┌─────────────────────────────────────────┐
│                                         │
│              Chat Area                  │
│                                         │
├─────────────────────────────────────────┤
│  ┌───────────┬───────────┬───────────┐ │
│  │           │           │           │ │
│  │   Apply   │    Pay    │  My Info  │ │
│  │           │           │           │ │
│  └───────────┴───────────┴───────────┘ │
│           (Rich Menu)                   │
└─────────────────────────────────────────┘
```

## Setup Steps

1. **Create menu image** (design with tap areas)
2. **Create rich menu object** (define structure via API)
3. **Upload image** to rich menu
4. **Set as default** or link to specific users

## Image Requirements

| Property | Requirement |
|----------|-------------|
| **Format** | JPEG or PNG |
| **Max size** | 1 MB |
| **Dimensions** | 2500×1686 or 2500×843 pixels |
| **Aspect ratio** | Full: 16:9, Compact: 16:4.5 |

## Create Rich Menu

### API Request

```javascript
const axios = require('axios');

async function createRichMenu() {
  const richMenu = {
    size: {
      width: 2500,
      height: 843
    },
    selected: true,  // Show menu by default
    name: "Loan Menu",
    chatBarText: "Menu",
    areas: [
      {
        bounds: { x: 0, y: 0, width: 833, height: 843 },
        action: {
          type: "uri",
          uri: "https://liff.line.me/YOUR_LIFF_ID/apply"
        }
      },
      {
        bounds: { x: 833, y: 0, width: 834, height: 843 },
        action: {
          type: "uri",
          uri: "https://liff.line.me/YOUR_LIFF_ID/payment"
        }
      },
      {
        bounds: { x: 1667, y: 0, width: 833, height: 843 },
        action: {
          type: "uri",
          uri: "https://liff.line.me/YOUR_LIFF_ID/dashboard"
        }
      }
    ]
  };

  const response = await axios.post(
    'https://api.line.me/v2/bot/richmenu',
    richMenu,
    {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${CHANNEL_ACCESS_TOKEN}`
      }
    }
  );

  return response.data.richMenuId;
}
```

### Rich Menu Object

```javascript
{
  size: {
    width: 2500,           // Always 2500
    height: 1686 | 843     // Full or compact
  },
  selected: true,          // Default open state
  name: "Menu Name",       // Internal name
  chatBarText: "Menu",     // Text on chat bar
  areas: [                 // Tap areas (max 20)
    {
      bounds: {
        x: 0,              // Left position
        y: 0,              // Top position
        width: 833,        // Area width
        height: 843        // Area height
      },
      action: { ... }      // Action on tap
    }
  ]
}
```

## Upload Image

```javascript
const fs = require('fs');
const FormData = require('form-data');

async function uploadRichMenuImage(richMenuId, imagePath) {
  const image = fs.readFileSync(imagePath);

  await axios.post(
    `https://api-data.line.me/v2/bot/richmenu/${richMenuId}/content`,
    image,
    {
      headers: {
        'Content-Type': 'image/png',
        'Authorization': `Bearer ${CHANNEL_ACCESS_TOKEN}`
      }
    }
  );
}
```

## Set Default Rich Menu

Make this menu show for all users by default:

```javascript
async function setDefaultRichMenu(richMenuId) {
  await axios.post(
    `https://api.line.me/v2/bot/user/all/richmenu/${richMenuId}`,
    {},
    {
      headers: {
        'Authorization': `Bearer ${CHANNEL_ACCESS_TOKEN}`
      }
    }
  );
}
```

## Per-User Rich Menu

Link specific menu to specific user:

```javascript
async function linkRichMenuToUser(userId, richMenuId) {
  await axios.post(
    `https://api.line.me/v2/bot/user/${userId}/richmenu/${richMenuId}`,
    {},
    {
      headers: {
        'Authorization': `Bearer ${CHANNEL_ACCESS_TOKEN}`
      }
    }
  );
}

// Unlink
async function unlinkRichMenuFromUser(userId) {
  await axios.delete(
    `https://api.line.me/v2/bot/user/${userId}/richmenu`,
    {
      headers: {
        'Authorization': `Bearer ${CHANNEL_ACCESS_TOKEN}`
      }
    }
  );
}
```

## Action Types

### URI Action
```javascript
{
  type: "uri",
  uri: "https://example.com",
  altUri: {
    desktop: "https://example.com/desktop"  // Optional
  }
}
```

### Postback Action
```javascript
{
  type: "postback",
  data: "action=apply&type=personal",
  displayText: "Apply for loan"  // Optional: show in chat
}
```

### Message Action
```javascript
{
  type: "message",
  text: "I want to apply for a loan"
}
```

### Datetime Picker Action
```javascript
{
  type: "datetimepicker",
  data: "action=set_reminder",
  mode: "datetime",  // "date" | "time" | "datetime"
  initial: "2024-01-15T10:00",
  min: "2024-01-01T00:00",
  max: "2024-12-31T23:59"
}
```

### Rich Menu Switch Action
```javascript
{
  type: "richmenuswitch",
  richMenuAliasId: "alias-menu-b",
  data: "switched=menu-b"
}
```

## Rich Menu Alias

Create aliases for easier menu switching:

```javascript
async function createRichMenuAlias(richMenuId, aliasId) {
  await axios.post(
    'https://api.line.me/v2/bot/richmenu/alias',
    {
      richMenuAliasId: aliasId,
      richMenuId: richMenuId
    },
    {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${CHANNEL_ACCESS_TOKEN}`
      }
    }
  );
}
```

## Get Rich Menu List

```javascript
async function getRichMenuList() {
  const response = await axios.get(
    'https://api.line.me/v2/bot/richmenu/list',
    {
      headers: {
        'Authorization': `Bearer ${CHANNEL_ACCESS_TOKEN}`
      }
    }
  );

  return response.data.richmenus;
}
```

## Delete Rich Menu

```javascript
async function deleteRichMenu(richMenuId) {
  await axios.delete(
    `https://api.line.me/v2/bot/richmenu/${richMenuId}`,
    {
      headers: {
        'Authorization': `Bearer ${CHANNEL_ACCESS_TOKEN}`
      }
    }
  );
}
```

## Complete Example

```javascript
async function setupLoanRichMenu() {
  // 1. Create rich menu
  const richMenuId = await createRichMenu();
  console.log('Created rich menu:', richMenuId);

  // 2. Upload image
  await uploadRichMenuImage(richMenuId, './rich-menu-image.png');
  console.log('Uploaded image');

  // 3. Set as default
  await setDefaultRichMenu(richMenuId);
  console.log('Set as default menu');

  return richMenuId;
}
```

## API Endpoints Summary

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/v2/bot/richmenu` | POST | Create rich menu |
| `/v2/bot/richmenu/list` | GET | List all rich menus |
| `/v2/bot/richmenu/{id}` | GET | Get rich menu |
| `/v2/bot/richmenu/{id}` | DELETE | Delete rich menu |
| `/v2/bot/richmenu/{id}/content` | POST | Upload image |
| `/v2/bot/user/all/richmenu/{id}` | POST | Set default menu |
| `/v2/bot/user/{userId}/richmenu/{id}` | POST | Link to user |
| `/v2/bot/user/{userId}/richmenu` | DELETE | Unlink from user |
| `/v2/bot/richmenu/alias` | POST | Create alias |
