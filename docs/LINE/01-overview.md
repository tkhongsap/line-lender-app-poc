# LINE OA Integration Overview

> Source: https://developers.line.biz/en/docs/

## What is LINE Official Account (OA)?

LINE Official Account is a business account platform that enables companies to communicate with LINE users. It provides:

- **Direct messaging** with customers
- **Rich menus** for interactive navigation
- **Push notifications** for proactive engagement
- **Web apps (LIFF)** embedded in LINE

## Architecture Components

```
┌─────────────────────────────────────────────────────────────────┐
│                        LINE Platform                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │  Messaging   │  │    LIFF      │  │  LINE Login  │          │
│  │     API      │  │  (Web Apps)  │  │   (OAuth)    │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
│         │                 │                 │                   │
│         ▼                 ▼                 ▼                   │
│  ┌─────────────────────────────────────────────────────┐       │
│  │              LINE Official Account                   │       │
│  │  ┌─────────┐  ┌─────────┐  ┌─────────┐             │       │
│  │  │  Rich   │  │  Chat   │  │  Push   │             │       │
│  │  │  Menu   │  │  Bot    │  │ Notif.  │             │       │
│  │  └─────────┘  └─────────┘  └─────────┘             │       │
│  └─────────────────────────────────────────────────────┘       │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │   Your Server    │
                    │  (Webhook Bot)   │
                    └──────────────────┘
```

## Key Components

### 1. LIFF (LINE Front-end Framework)
Web applications that run inside LINE app. Provides:
- User profile access without login
- Message sending capabilities
- QR code scanning
- Native LINE integration

**Use Case**: Loan application form, customer dashboard, payment upload

### 2. Messaging API
Send and receive messages programmatically:
- **Reply Messages**: Respond to user messages
- **Push Messages**: Send notifications proactively
- **Flex Messages**: Rich, customizable message layouts
- **Webhooks**: Receive events from LINE

**Use Case**: Loan status notifications, payment reminders

### 3. LINE Login
OAuth 2.0 authentication using LINE account:
- No password required for users
- Access to user profile
- Link LINE account to your system

**Use Case**: Customer authentication in LIFF apps

### 4. Rich Menu
Persistent menu at bottom of chat:
- Customizable tap areas
- Link to LIFF apps or URLs
- Per-user personalization

**Use Case**: Quick access to Apply, Pay, My Info

## Required Credentials

| Credential | Purpose | Location |
|------------|---------|----------|
| `LINE_CHANNEL_ID` | Identify your channel | LINE Developers Console |
| `LINE_CHANNEL_SECRET` | Server-side authentication | LINE Developers Console |
| `LINE_CHANNEL_ACCESS_TOKEN` | API authorization | LINE Developers Console |
| `LIFF_ID` | Identify LIFF app | LIFF tab in console |

## Setup Steps

1. **Create LINE Official Account**
   - Go to LINE Official Account Manager
   - Register business account

2. **Create Messaging API Channel**
   - Access LINE Developers Console
   - Create provider and channel
   - Get channel credentials

3. **Create LINE Login Channel** (for LIFF)
   - Create separate LINE Login channel
   - Register LIFF apps
   - Get LIFF IDs

4. **Configure Webhook**
   - Set webhook URL to your server
   - Enable webhook in console
   - Implement signature verification

5. **Design Rich Menu**
   - Create menu image
   - Define tap areas
   - Link to LIFF apps

## Documentation Files

| File | Content |
|------|---------|
| [02-liff.md](./02-liff.md) | LIFF SDK and development |
| [03-messaging-api.md](./03-messaging-api.md) | Bot messaging and notifications |
| [04-line-login.md](./04-line-login.md) | OAuth authentication |
| [05-rich-menu.md](./05-rich-menu.md) | Menu configuration |
| [06-flex-messages.md](./06-flex-messages.md) | Rich message layouts |
| [07-webhooks.md](./07-webhooks.md) | Event handling |
| [08-url-schemes.md](./08-url-schemes.md) | LINE deep links |
