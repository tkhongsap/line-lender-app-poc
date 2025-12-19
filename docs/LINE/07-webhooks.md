# Webhooks

> Source: https://developers.line.biz/en/docs/messaging-api/receiving-messages/

## Overview

Webhooks allow your server to receive events from LINE when users interact with your Official Account. LINE sends HTTP POST requests to your webhook URL.

## Setup

### Configure Webhook URL

1. Go to LINE Developers Console
2. Select your Messaging API channel
3. Go to "Messaging API" tab
4. Under "Webhook settings":
   - Enter your HTTPS URL
   - Click "Verify" to test connection
   - Enable "Use webhook"

### Requirements

- **HTTPS only** (HTTP not allowed)
- **Valid SSL certificate** (not self-signed)
- **Returns 200 OK** within reasonable time

## Webhook Event Structure

```javascript
{
  destination: "U1234567890abcdef...",  // Your bot's user ID
  events: [
    {
      type: "message",
      timestamp: 1704067200000,
      source: {
        type: "user",
        userId: "U0987654321fedcba..."
      },
      replyToken: "nHuyWiB7yP5Zw52FIkcQobQuGDXCTA",
      message: {
        type: "text",
        id: "12345678901234",
        text: "Hello!"
      },
      webhookEventId: "01HKQR...",
      deliveryContext: {
        isRedelivery: false
      }
    }
  ]
}
```

## Signature Verification

**CRITICAL**: Always verify the signature before processing events.

```javascript
const crypto = require('crypto');

function verifySignature(body, signature, channelSecret) {
  const hash = crypto
    .createHmac('SHA256', channelSecret)
    .update(body)
    .digest('base64');

  return hash === signature;
}

// Express middleware
function lineWebhookMiddleware(req, res, next) {
  const signature = req.headers['x-line-signature'];
  const body = JSON.stringify(req.body);

  if (!verifySignature(body, signature, process.env.LINE_CHANNEL_SECRET)) {
    return res.status(401).send('Invalid signature');
  }

  next();
}

// Usage
app.post('/webhook', express.json(), lineWebhookMiddleware, (req, res) => {
  const events = req.body.events;
  // Process events...
  res.sendStatus(200);
});
```

## Event Types

### Message Event

Triggered when user sends a message.

```javascript
{
  type: "message",
  replyToken: "...",
  source: { type: "user", userId: "U..." },
  message: {
    type: "text",        // text | image | video | audio | file | location | sticker
    id: "12345678901234",
    text: "Hello!"
  }
}
```

**Message Types**:

| Type | Properties |
|------|------------|
| `text` | `text`, `emojis`, `mention` |
| `image` | `id`, `contentProvider` |
| `video` | `id`, `duration`, `contentProvider` |
| `audio` | `id`, `duration`, `contentProvider` |
| `file` | `id`, `fileName`, `fileSize` |
| `location` | `title`, `address`, `latitude`, `longitude` |
| `sticker` | `packageId`, `stickerId`, `stickerResourceType` |

### Follow Event

Triggered when user adds bot as friend.

```javascript
{
  type: "follow",
  replyToken: "...",
  source: { type: "user", userId: "U..." }
}
```

### Unfollow Event

Triggered when user blocks bot.

```javascript
{
  type: "unfollow",
  source: { type: "user", userId: "U..." }
}
```

**Note**: No `replyToken` - cannot reply to this event.

### Postback Event

Triggered when user taps button with postback action.

```javascript
{
  type: "postback",
  replyToken: "...",
  source: { type: "user", userId: "U..." },
  postback: {
    data: "action=apply&type=personal",
    params: {
      date: "2024-01-15",     // If datetimepicker
      time: "10:00",
      datetime: "2024-01-15T10:00"
    }
  }
}
```

### Join Event

Triggered when bot joins a group or room.

```javascript
{
  type: "join",
  replyToken: "...",
  source: { type: "group", groupId: "C..." }
}
```

### Leave Event

Triggered when bot is removed from group.

```javascript
{
  type: "leave",
  source: { type: "group", groupId: "C..." }
}
```

### Member Join Event

Triggered when users join a group containing the bot.

```javascript
{
  type: "memberJoined",
  replyToken: "...",
  source: { type: "group", groupId: "C..." },
  joined: {
    members: [
      { type: "user", userId: "U..." }
    ]
  }
}
```

### Member Leave Event

Triggered when users leave a group.

```javascript
{
  type: "memberLeft",
  source: { type: "group", groupId: "C..." },
  left: {
    members: [
      { type: "user", userId: "U..." }
    ]
  }
}
```

### Account Link Event

Triggered during account linking flow.

```javascript
{
  type: "accountLink",
  replyToken: "...",
  source: { type: "user", userId: "U..." },
  link: {
    result: "ok",      // "ok" | "failed"
    nonce: "abc123"    // Your nonce from link token
  }
}
```

## Complete Webhook Handler

```javascript
const express = require('express');
const crypto = require('crypto');
const axios = require('axios');

const app = express();

// Verify LINE signature
function verifySignature(body, signature) {
  const hash = crypto
    .createHmac('SHA256', process.env.LINE_CHANNEL_SECRET)
    .update(body)
    .digest('base64');
  return hash === signature;
}

// Reply helper
async function reply(replyToken, messages) {
  await axios.post(
    'https://api.line.me/v2/bot/message/reply',
    { replyToken, messages },
    {
      headers: {
        'Authorization': `Bearer ${process.env.LINE_CHANNEL_ACCESS_TOKEN}`,
        'Content-Type': 'application/json'
      }
    }
  );
}

// Webhook endpoint
app.post('/webhook',
  express.raw({ type: 'application/json' }),
  async (req, res) => {
    // Verify signature
    const signature = req.headers['x-line-signature'];
    if (!verifySignature(req.body, signature)) {
      return res.status(401).send('Invalid signature');
    }

    // Parse body
    const body = JSON.parse(req.body);
    const events = body.events;

    // Return 200 immediately
    res.sendStatus(200);

    // Process events asynchronously
    for (const event of events) {
      try {
        await handleEvent(event);
      } catch (error) {
        console.error('Error handling event:', error);
      }
    }
  }
);

// Event handler
async function handleEvent(event) {
  const userId = event.source.userId;

  switch (event.type) {
    case 'follow':
      // Welcome new follower
      await reply(event.replyToken, [
        {
          type: 'text',
          text: 'ยินดีต้อนรับสู่บริการสินเชื่อของเรา! 🏦'
        }
      ]);
      break;

    case 'message':
      if (event.message.type === 'text') {
        const text = event.message.text.toLowerCase();

        if (text.includes('สมัคร') || text.includes('apply')) {
          await reply(event.replyToken, [
            {
              type: 'text',
              text: 'คุณสามารถสมัครสินเชื่อได้ที่นี่:'
            },
            {
              type: 'template',
              altText: 'สมัครสินเชื่อ',
              template: {
                type: 'buttons',
                text: 'เลือกประเภทสินเชื่อ',
                actions: [
                  {
                    type: 'uri',
                    label: 'สินเชื่อส่วนบุคคล',
                    uri: 'https://liff.line.me/YOUR_LIFF_ID/apply'
                  }
                ]
              }
            }
          ]);
        }
      }
      break;

    case 'postback':
      const data = new URLSearchParams(event.postback.data);
      const action = data.get('action');

      if (action === 'check_status') {
        // Fetch user's loan status from database
        // const status = await getLoanStatus(userId);
        await reply(event.replyToken, [
          { type: 'text', text: 'กำลังตรวจสอบสถานะ...' }
        ]);
      }
      break;

    case 'unfollow':
      // Log that user blocked the bot
      console.log(`User ${userId} unfollowed`);
      break;
  }
}

app.listen(3000);
```

## Best Practices

1. **Return 200 immediately** - Process events asynchronously
2. **Verify signature always** - Never skip signature verification
3. **Handle redeliveries** - Use `webhookEventId` to detect duplicates
4. **Respect unsend** - Delete messages when user unsends
5. **Log errors** - Don't let exceptions crash webhook handler

## Webhook Redelivery

If your server doesn't return 2xx:
- LINE may redeliver the event
- Enable in LINE Developers Console
- Check `deliveryContext.isRedelivery`
- Use `webhookEventId` to deduplicate

```javascript
const processedEvents = new Set();

async function handleEvent(event) {
  if (processedEvents.has(event.webhookEventId)) {
    console.log('Duplicate event, skipping');
    return;
  }

  processedEvents.add(event.webhookEventId);
  // Process event...
}
```

## Testing Webhooks

Use ngrok for local development:

```bash
ngrok http 3000
```

Then use the ngrok HTTPS URL as your webhook URL in LINE Developers Console.
