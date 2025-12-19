# Getting Started with LINE Integration

> Source: https://developers.line.biz/en/docs/messaging-api/getting-started/

## Overview

This guide walks through the complete setup process for integrating LINE OA with your application. You'll create:

1. LINE Official Account (your bot identity)
2. Messaging API Channel (for bot messaging)
3. LINE Login Channel (for LIFF apps and authentication)

## Prerequisites

- LINE account (personal)
- Business email address
- HTTPS server for webhooks

## Part 1: Create LINE Official Account

### Step 1: Register for Business ID

1. Go to [LINE Official Account Manager](https://manager.line.biz/)
2. Click "Create an account"
3. Choose registration method:
   - **LINE account** (recommended)
   - Email address
4. Complete Business ID registration

### Step 2: Create Official Account

1. After registration, fill in the entry form:
   - Account name (your business name)
   - Account category
   - Company information
2. Submit the form
3. Verify account appears in LINE Official Account Manager

## Part 2: Enable Messaging API

### Step 1: Activate Messaging API

1. In LINE Official Account Manager, go to **Settings**
2. Navigate to **Messaging API**
3. Click **Enable Messaging API**

### Step 2: Select or Create Provider

When enabling Messaging API:
- Select existing provider, OR
- Create new provider

> **Critical**: Once assigned, you cannot change or de-assign the provider. Choose carefully!

### Step 3: Access LINE Developers Console

1. Go to [LINE Developers Console](https://developers.line.biz/console/)
2. Log in with same credentials
3. Select your provider
4. Verify Messaging API channel appears

### Step 4: Configure Webhook

1. In LINE Developers Console, select your channel
2. Go to **Messaging API** tab
3. Under **Webhook settings**:
   - Enter your webhook URL (must be HTTPS)
   - Click **Verify** to test
   - Enable **Use webhook**

### Step 5: Get Channel Credentials

From the **Basic settings** tab:
- **Channel ID**: Your unique identifier
- **Channel secret**: Keep this secure!

From the **Messaging API** tab:
- **Channel access token**: Click "Issue" for long-lived token

## Part 3: Create LINE Login Channel (for LIFF)

### Step 1: Create Channel

1. In LINE Developers Console, select your provider
2. Click **Create a new channel**
3. Select **LINE Login**
4. Fill in details:
   - Channel name (cannot include "LINE")
   - Channel description
   - App type: **Web app**
   - Channel icon

### Step 2: Configure Channel

1. Go to **LINE Login** tab
2. Add **Callback URL** for your OAuth flow
3. Configure **Linked OA** (optional - link your bot)

### Step 3: Add LIFF App

1. Go to **LIFF** tab
2. Click **Add**
3. Configure LIFF app:
   - **LIFF app name**
   - **Size**: Full / Tall / Compact
   - **Endpoint URL**: Your web app URL (HTTPS)
   - **Scopes**: openid, profile, email (as needed)
   - **Add friend option**: Normal / Aggressive / Off

4. Save and note your **LIFF ID**

## Part 4: Link Bot with LINE Login

Enable "Add friend" prompt during LINE Login.

### Step 1: Link Official Account

1. In LINE Login channel settings
2. Go to **Linked OA** section
3. Click **Link** and select your LINE Official Account

Requirements:
- Both must be in **same provider**
- You must have admin rights for both

### Step 2: Use bot_prompt Parameter

Add `bot_prompt` to your authorization URL:

```javascript
const authUrl = new URL('https://access.line.me/oauth2/v2.1/authorize');
authUrl.searchParams.set('response_type', 'code');
authUrl.searchParams.set('client_id', LINE_CHANNEL_ID);
authUrl.searchParams.set('redirect_uri', CALLBACK_URL);
authUrl.searchParams.set('state', state);
authUrl.searchParams.set('scope', 'profile openid');
authUrl.searchParams.set('bot_prompt', 'aggressive');  // or 'normal'
```

**bot_prompt values:**
- `normal`: Shows add-friend option on consent screen
- `aggressive`: Shows dedicated screen for adding bot

### Step 3: Check Friendship Status

After login, check if user added your bot:

**Option A: Query Parameter**

```javascript
// In callback URL
const friendshipChanged = req.query.friendship_status_changed;
// "true" or "false"
```

**Option B: API Call**

```javascript
async function checkFriendship(accessToken) {
  const response = await axios.get(
    'https://api.line.me/friendship/v1/status',
    {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    }
  );

  return response.data.friendFlag;  // true or false
}
```

## Part 5: Environment Variables

Create a `.env` file with your credentials:

```bash
# Messaging API Channel
LINE_CHANNEL_ID=1234567890
LINE_CHANNEL_SECRET=abcdef1234567890
LINE_CHANNEL_ACCESS_TOKEN=eyJhbGciOiJIUzI1NiJ9...

# LINE Login Channel
LINE_LOGIN_CHANNEL_ID=1234567891
LINE_LOGIN_CHANNEL_SECRET=fedcba0987654321

# LIFF IDs
LIFF_ID_APPLY=1234567890-AbcdEfgh
LIFF_ID_DASHBOARD=1234567890-IjklMnop
LIFF_ID_PAYMENT=1234567890-QrstUvwx

# Webhook
WEBHOOK_URL=https://yourdomain.com/webhook
```

## Part 6: Disable Default Responses

By default, LINE Official Account sends auto-replies. Disable them:

1. Go to LINE Official Account Manager
2. Navigate to **Response settings**
3. Disable:
   - **Greeting message** (or customize)
   - **Auto-response**

Your bot will now handle all responses via Messaging API.

## Quick Setup Checklist

```
□ Create LINE Official Account
  □ Register Business ID
  □ Complete entry form

□ Set up Messaging API
  □ Enable Messaging API in OA Manager
  □ Select/create provider (cannot change later!)
  □ Configure webhook URL
  □ Verify webhook connection
  □ Issue channel access token
  □ Note Channel ID and Secret

□ Set up LINE Login (for LIFF)
  □ Create LINE Login channel
  □ Configure callback URL
  □ Add LIFF app(s)
  □ Note LIFF ID(s)
  □ Link to Official Account (optional)

□ Configure Environment
  □ Create .env file
  □ Store all credentials securely
  □ Never commit secrets to git!

□ Disable Default Responses
  □ Turn off greeting message
  □ Turn off auto-response
```

## Testing Your Setup

### Test Webhook

```bash
# Your webhook should receive this event when someone adds your bot
{
  "events": [{
    "type": "follow",
    "source": { "type": "user", "userId": "U..." },
    "replyToken": "..."
  }]
}
```

### Test LIFF

```javascript
// In your LIFF app
liff.init({ liffId: 'YOUR_LIFF_ID' })
  .then(() => {
    console.log('LIFF initialized');
    console.log('In LINE app:', liff.isInClient());
    console.log('Logged in:', liff.isLoggedIn());
  });
```

### Test Bot Response

```javascript
// Add your bot as friend and send "hello"
// Your webhook should receive:
{
  "events": [{
    "type": "message",
    "message": { "type": "text", "text": "hello" },
    "replyToken": "...",
    "source": { "type": "user", "userId": "U..." }
  }]
}
```

## Common Issues

| Issue | Solution |
|-------|----------|
| Webhook verification fails | Check URL is HTTPS with valid certificate |
| Can't move channel | Channels cannot be moved between providers (by design) |
| User ID different between channels | Both channels must be in same provider |
| LIFF won't load | Check endpoint URL is HTTPS |
| Bot doesn't respond | Disable auto-response in OA Manager |

## Next Steps

After setup is complete:

1. [Implement webhook handler](./07-webhooks.md)
2. [Set up Rich Menu](./05-rich-menu.md)
3. [Build LIFF apps](./02-liff.md)
4. [Send Flex Messages](./06-flex-messages.md)
