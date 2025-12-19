# LINE Messaging API

> Source: https://developers.line.biz/en/docs/messaging-api/

## Overview

The Messaging API enables bots to send and receive messages with LINE users. Communication flows:

```
User ──message──► LINE Platform ──webhook──► Your Server
                                                  │
User ◄──message── LINE Platform ◄──API call───────┘
```

## Message Sending Methods

| Method | Description | Use Case |
|--------|-------------|----------|
| **Reply** | Respond to user action | Answer user questions |
| **Push** | Send anytime to one user | Loan status notification |
| **Multicast** | Send to multiple users | Notify selected customers |
| **Broadcast** | Send to all followers | Announcements |
| **Narrowcast** | Send to filtered audience | Target by demographics |

### Reply Messages

Respond to user messages using `replyToken` from webhook:

```javascript
const axios = require('axios');

async function replyMessage(replyToken, messages) {
  await axios.post('https://api.line.me/v2/bot/message/reply', {
    replyToken: replyToken,
    messages: messages  // Max 5 messages
  }, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${CHANNEL_ACCESS_TOKEN}`
    }
  });
}

// Example usage
replyMessage(event.replyToken, [
  { type: 'text', text: 'Hello! How can I help you?' }
]);
```

### Push Messages

Send messages proactively to a user:

```javascript
async function pushMessage(userId, messages) {
  await axios.post('https://api.line.me/v2/bot/message/push', {
    to: userId,
    messages: messages
  }, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${CHANNEL_ACCESS_TOKEN}`
    }
  });
}

// Example: Loan approval notification
pushMessage('U1234567890abcdef', [
  { type: 'text', text: 'Your loan has been approved!' }
]);
```

### Multicast Messages

Send to multiple users (up to 500):

```javascript
async function multicastMessage(userIds, messages) {
  await axios.post('https://api.line.me/v2/bot/message/multicast', {
    to: userIds,  // Array of user IDs
    messages: messages
  }, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${CHANNEL_ACCESS_TOKEN}`
    }
  });
}
```

### Broadcast Messages

Send to all followers:

```javascript
async function broadcastMessage(messages) {
  await axios.post('https://api.line.me/v2/bot/message/broadcast', {
    messages: messages
  }, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${CHANNEL_ACCESS_TOKEN}`
    }
  });
}
```

## Message Types

### Text Message

```javascript
{
  type: "text",
  text: "Hello, World!"
}
```

### Sticker Message

```javascript
{
  type: "sticker",
  packageId: "446",
  stickerId: "1988"
}
```

### Image Message

```javascript
{
  type: "image",
  originalContentUrl: "https://example.com/image.jpg",
  previewImageUrl: "https://example.com/preview.jpg"
}
```

### Video Message

```javascript
{
  type: "video",
  originalContentUrl: "https://example.com/video.mp4",
  previewImageUrl: "https://example.com/preview.jpg"
}
```

### Location Message

```javascript
{
  type: "location",
  title: "My Location",
  address: "123 Main St, Bangkok",
  latitude: 13.7563,
  longitude: 100.5018
}
```

### Template Message (Buttons)

```javascript
{
  type: "template",
  altText: "Loan Application Options",
  template: {
    type: "buttons",
    title: "Loan Application",
    text: "What would you like to do?",
    actions: [
      {
        type: "uri",
        label: "Apply Now",
        uri: "https://liff.line.me/YOUR_LIFF_ID/apply"
      },
      {
        type: "postback",
        label: "Check Status",
        data: "action=check_status"
      }
    ]
  }
}
```

### Template Message (Carousel)

```javascript
{
  type: "template",
  altText: "Loan Options",
  template: {
    type: "carousel",
    columns: [
      {
        thumbnailImageUrl: "https://example.com/loan1.jpg",
        title: "Personal Loan",
        text: "Up to 500,000 THB",
        actions: [
          { type: "uri", label: "Apply", uri: "https://example.com/apply/personal" }
        ]
      },
      {
        thumbnailImageUrl: "https://example.com/loan2.jpg",
        title: "Home Loan",
        text: "Up to 5,000,000 THB",
        actions: [
          { type: "uri", label: "Apply", uri: "https://example.com/apply/home" }
        ]
      }
    ]
  }
}
```

## Channel Access Token

### Token Types

| Type | Expiration | Use Case |
|------|------------|----------|
| **v2.1** | User-specified | Production (recommended) |
| **Short-lived** | 30 days | Development |
| **Long-lived** | Never | Simple integrations |
| **Stateless** | 15 minutes | Serverless functions |

### Get Token v2.1

```javascript
const axios = require('axios');
const jwt = require('jsonwebtoken');

async function getChannelAccessToken() {
  // Create JWT assertion
  const assertion = jwt.sign({
    iss: CHANNEL_ID,
    sub: CHANNEL_ID,
    aud: 'https://api.line.me/',
    exp: Math.floor(Date.now() / 1000) + 60 * 30,
    token_exp: 60 * 60 * 24 * 30  // 30 days
  }, CHANNEL_SECRET, { algorithm: 'HS256' });

  const response = await axios.post(
    'https://api.line.me/oauth2/v2.1/token',
    new URLSearchParams({
      grant_type: 'client_credentials',
      client_assertion_type: 'urn:ietf:params:oauth:client-assertion-type:jwt-bearer',
      client_assertion: assertion
    })
  );

  return response.data.access_token;
}
```

## Get User Profile

```javascript
async function getUserProfile(userId) {
  const response = await axios.get(
    `https://api.line.me/v2/bot/profile/${userId}`,
    {
      headers: {
        'Authorization': `Bearer ${CHANNEL_ACCESS_TOKEN}`
      }
    }
  );

  return response.data;
  // { userId, displayName, pictureUrl, statusMessage, language }
}
```

## Get Message Content

Retrieve images, videos, audio sent by users:

```javascript
async function getMessageContent(messageId) {
  const response = await axios.get(
    `https://api-data.line.me/v2/bot/message/${messageId}/content`,
    {
      headers: {
        'Authorization': `Bearer ${CHANNEL_ACCESS_TOKEN}`
      },
      responseType: 'arraybuffer'
    }
  );

  return response.data;  // Binary content
}
```

## API Endpoints Summary

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/v2/bot/message/reply` | POST | Reply to user |
| `/v2/bot/message/push` | POST | Push to user |
| `/v2/bot/message/multicast` | POST | Send to multiple |
| `/v2/bot/message/broadcast` | POST | Send to all |
| `/v2/bot/message/narrowcast` | POST | Send to filtered |
| `/v2/bot/profile/{userId}` | GET | Get user profile |
| `/v2/bot/message/{messageId}/content` | GET | Get media content |
| `/v2/bot/richmenu` | POST | Create rich menu |
| `/v2/bot/user/{userId}/richmenu/{richMenuId}` | POST | Link menu to user |

## Rate Limits

- **Push/Multicast/Broadcast**: Limited by monthly message quota
- **Reply**: No limit (doesn't count toward quota)
- **API calls**: Rate limited per endpoint

## Pricing

- Free tier includes monthly message allowance
- Overage charged per message
- Reply messages are always free
