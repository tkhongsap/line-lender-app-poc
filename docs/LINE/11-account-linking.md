# Account Linking

> Source: https://developers.line.biz/en/docs/messaging-api/linking-accounts/

## Overview

Account linking allows you to securely connect a LINE user's account with their account in your service. This enables:

- Personalized bot interactions based on service data
- Purchase notifications when users buy on your site
- Order placement directly in LINE chat
- Seamless user experience across platforms

**Key Benefit**: No separate LINE Login channel required - uses Messaging API only.

## Account Linking Flow

```
┌────────────────────────────────────────────────────────────────────────────┐
│                          Account Linking Sequence                          │
├────────────────────────────────────────────────────────────────────────────┤
│                                                                            │
│  User          LINE App         LINE Platform       Your Server            │
│   │                │                  │                  │                 │
│   │                │   1. Request link token            │                 │
│   │                │                  │◄─────────────────│                 │
│   │                │                  │                  │                 │
│   │                │   2. Return link token             │                 │
│   │                │                  │─────────────────►│                 │
│   │                │                  │                  │                 │
│   │  3. Send linking URL (via message)│                  │                 │
│   │◄───────────────│◄─────────────────│◄─────────────────│                 │
│   │                │                  │                  │                 │
│   │  4. User taps URL                 │                  │                 │
│   │────────────────────────────────────────────────────►│                 │
│   │                │                  │                  │                 │
│   │  5. Login to your service         │                  │                 │
│   │────────────────────────────────────────────────────►│                 │
│   │                │                  │                  │                 │
│   │                │                  │   6. Generate nonce, store mapping │
│   │                │                  │                  │                 │
│   │  7. Redirect to LINE endpoint     │                  │                 │
│   │◄───────────────────────────────────────────────────│                 │
│   │                │                  │                  │                 │
│   │  8. Complete linking              │                  │                 │
│   │───────────────►│─────────────────►│                  │                 │
│   │                │                  │                  │                 │
│   │                │   9. Webhook: accountLink event    │                 │
│   │                │                  │─────────────────►│                 │
│   │                │                  │                  │                 │
│   │                │                  │  10. Use nonce to get service ID   │
│   │                │                  │                  │                 │
│   │                │                  │  11. Link LINE userId + serviceId  │
│   │                │                  │                  │                 │
└────────────────────────────────────────────────────────────────────────────┘
```

## Implementation Steps

### Step 1: Issue Link Token

Request a one-time link token for a specific user:

```javascript
async function issueLinkToken(userId) {
  const response = await axios.post(
    `https://api.line.me/v2/bot/user/${userId}/linkToken`,
    {},
    {
      headers: {
        'Authorization': `Bearer ${CHANNEL_ACCESS_TOKEN}`
      }
    }
  );

  return response.data.linkToken;
}
```

**Response:**
```json
{
  "linkToken": "NMZTNuVrPTqlr2IF8Bnymkb7rXfYv5EY"
}
```

**Token Validity**: 10 minutes

### Step 2: Send Linking URL to User

Send a message with a button that opens your login page:

```javascript
async function sendLinkingMessage(userId, linkToken) {
  const linkingUrl = `https://yourservice.com/link?linkToken=${linkToken}`;

  await axios.post(
    'https://api.line.me/v2/bot/message/push',
    {
      to: userId,
      messages: [{
        type: 'template',
        altText: 'เชื่อมต่อบัญชี',
        template: {
          type: 'buttons',
          title: 'เชื่อมต่อบัญชี',
          text: 'กรุณาเชื่อมต่อบัญชีเพื่อรับบริการเต็มรูปแบบ',
          actions: [{
            type: 'uri',
            label: 'เชื่อมต่อเลย',
            uri: linkingUrl
          }]
        }
      }]
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

### Step 3: Authenticate User on Your Service

When user clicks the link, show your login page:

```javascript
// Express route for linking page
app.get('/link', (req, res) => {
  const { linkToken } = req.query;

  if (!linkToken) {
    return res.status(400).send('Missing link token');
  }

  // Store linkToken in session for later use
  req.session.linkToken = linkToken;

  // Show login form
  res.render('login', { message: 'เข้าสู่ระบบเพื่อเชื่อมต่อบัญชี LINE' });
});
```

### Step 4: Generate Nonce and Redirect

After user logs in, generate a nonce and redirect to LINE:

```javascript
const crypto = require('crypto');

app.post('/link/complete', async (req, res) => {
  const { username, password } = req.body;
  const linkToken = req.session.linkToken;

  // Authenticate user in your system
  const user = await authenticateUser(username, password);
  if (!user) {
    return res.status(401).send('Invalid credentials');
  }

  // Generate secure nonce (minimum 128 bits / 16 bytes)
  const nonce = crypto.randomBytes(16).toString('base64url');

  // Store nonce -> serviceUserId mapping (with expiration)
  await storeNonceMapping(nonce, user.id, { expiresIn: '10m' });

  // Redirect to LINE account linking endpoint
  const redirectUrl = new URL('https://access.line.me/dialog/bot/accountLink');
  redirectUrl.searchParams.set('linkToken', linkToken);
  redirectUrl.searchParams.set('nonce', nonce);

  res.redirect(redirectUrl.toString());
});
```

### Nonce Requirements

| Requirement | Value |
|-------------|-------|
| Length | 10-255 characters |
| Minimum entropy | 128 bits (16 bytes) |
| Format | Base64 encoded recommended |
| Usage | Single-use only |
| Generation | Cryptographically secure RNG |

```javascript
// Good: Cryptographically secure
const nonce = crypto.randomBytes(16).toString('base64url');

// Bad: Not cryptographically secure
const nonce = Math.random().toString(36);  // DON'T USE
```

### Step 5: Handle Account Link Webhook

Receive the webhook event when linking completes:

```javascript
app.post('/webhook', async (req, res) => {
  const events = req.body.events;

  for (const event of events) {
    if (event.type === 'accountLink') {
      await handleAccountLink(event);
    }
  }

  res.sendStatus(200);
});

async function handleAccountLink(event) {
  const { userId } = event.source;
  const { result, nonce } = event.link;

  if (result === 'ok') {
    // Retrieve service user ID using nonce
    const serviceUserId = await getNonceMapping(nonce);

    if (serviceUserId) {
      // Link the accounts in your database
      await linkAccounts(userId, serviceUserId);

      // Delete used nonce
      await deleteNonceMapping(nonce);

      // Send success message
      await replyMessage(event.replyToken, [{
        type: 'text',
        text: 'เชื่อมต่อบัญชีสำเร็จแล้ว! 🎉'
      }]);
    }
  } else {
    // Linking failed
    await replyMessage(event.replyToken, [{
      type: 'text',
      text: 'การเชื่อมต่อบัญชีล้มเหลว กรุณาลองใหม่อีกครั้ง'
    }]);
  }
}
```

### Webhook Event Structure

```json
{
  "type": "accountLink",
  "replyToken": "nHuyWiB7yP5Zw52FIkcQobQuGDXCTA",
  "source": {
    "type": "user",
    "userId": "U1234567890abcdef..."
  },
  "timestamp": 1704067200000,
  "link": {
    "result": "ok",
    "nonce": "NMZTNuVrPTqlr2IF8Bnymkb7rXfYv5EY"
  }
}
```

## Unlinking Accounts

Users must be able to unlink at any time:

```javascript
async function unlinkAccount(lineUserId) {
  // Remove link from your database
  await db.userLinks.delete({ lineUserId });

  // Notify user
  await pushMessage(lineUserId, [{
    type: 'text',
    text: 'ยกเลิกการเชื่อมต่อบัญชีแล้ว'
  }]);
}
```

### Rich Menu for Unlink Option

Show different rich menus based on link status:

```javascript
async function updateUserRichMenu(lineUserId) {
  const isLinked = await isAccountLinked(lineUserId);

  const richMenuId = isLinked
    ? RICH_MENU_LINKED      // Shows "Unlink" option
    : RICH_MENU_UNLINKED;   // Shows "Link" option

  await linkRichMenuToUser(lineUserId, richMenuId);
}
```

## Security Considerations

### Attack Prevention

The account linking flow protects against attacks where:
> An attacker sends a URL to a user to link the attacker's LINE account to the user's service account.

LINE verifies that the user completing the linking is the same user who received the link token.

### Best Practices

1. **Validate link tokens server-side** - Never trust client-side validation
2. **Use secure nonce generation** - crypto.randomBytes() in Node.js
3. **Set short expiration** - Link tokens valid 10 minutes, nonces similar
4. **Single-use nonces** - Delete after use
5. **HTTPS everywhere** - All endpoints must be HTTPS
6. **Inform users** - Tell them they can unlink anytime

## Complete Example

```javascript
const express = require('express');
const crypto = require('crypto');
const axios = require('axios');

const app = express();

// In-memory nonce storage (use Redis in production)
const nonceStore = new Map();

// Initiate linking (called from bot command)
app.post('/api/initiate-link', async (req, res) => {
  const { lineUserId } = req.body;

  // Check if already linked
  if (await isAccountLinked(lineUserId)) {
    return res.json({ error: 'Already linked' });
  }

  // Issue link token
  const linkToken = await issueLinkToken(lineUserId);

  // Send message with link
  await sendLinkingMessage(lineUserId, linkToken);

  res.json({ success: true });
});

// Login page
app.get('/link', (req, res) => {
  const { linkToken } = req.query;
  req.session.linkToken = linkToken;
  res.render('login');
});

// Process login and complete linking
app.post('/link/complete', async (req, res) => {
  const { email, password } = req.body;
  const linkToken = req.session.linkToken;

  // Authenticate
  const user = await authenticate(email, password);
  if (!user) {
    return res.render('login', { error: 'Invalid credentials' });
  }

  // Generate nonce
  const nonce = crypto.randomBytes(16).toString('base64url');

  // Store mapping with 10-minute expiry
  nonceStore.set(nonce, {
    serviceUserId: user.id,
    expiresAt: Date.now() + 10 * 60 * 1000
  });

  // Redirect to LINE
  const url = `https://access.line.me/dialog/bot/accountLink?linkToken=${linkToken}&nonce=${nonce}`;
  res.redirect(url);
});

// Webhook handler
app.post('/webhook', async (req, res) => {
  res.sendStatus(200);

  for (const event of req.body.events) {
    if (event.type === 'accountLink' && event.link.result === 'ok') {
      const mapping = nonceStore.get(event.link.nonce);

      if (mapping && mapping.expiresAt > Date.now()) {
        // Link accounts
        await db.links.create({
          lineUserId: event.source.userId,
          serviceUserId: mapping.serviceUserId
        });

        // Clean up
        nonceStore.delete(event.link.nonce);

        // Notify user
        await reply(event.replyToken, 'บัญชีเชื่อมต่อสำเร็จ!');
      }
    }
  }
});
```

## Use Cases for Loan System

1. **Link customer LINE to loan account**
   - Send personalized loan status updates
   - Push payment reminders to specific customers

2. **View loan history in chat**
   - "Check my loans" shows their actual loans
   - No need to re-authenticate

3. **Payment notifications**
   - Auto-notify when payment is due
   - Confirm when payment is received
