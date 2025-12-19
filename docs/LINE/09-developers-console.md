# LINE Developers Console

> Source: https://developers.line.biz/en/docs/line-developers-console/

## Overview

The LINE Developers Console is a management tool for accessing LINE Platform features. It allows you to:
- Create and manage providers
- Create and manage channels
- Configure channel settings
- Assign roles to team members
- Access credentials (Channel ID, Secret, Access Tokens)

**Console URL**: https://developers.line.biz/console/

## Key Concepts

### Developer
Anyone who accesses the LINE Developers Console. You can control what each developer can view or edit by assigning roles.

### Provider
A provider represents an **individual developer, company, or organization** that provides services and acquires user information.

```
Provider (Your Company)
├── Channel 1 (Messaging API - Bot)
├── Channel 2 (LINE Login - Web App)
└── Channel 3 (LINE Login - LIFF)
```

### Channel
A channel enables providers to use LINE Platform features. Each channel represents a service or application.

## Providers

### Creating a Provider

1. Go to LINE Developers Console
2. Click **Create** on the Providers page
3. Enter provider name

**Important**: The provider name is displayed on user consent screens. Use your actual business name, not internal project names.

### Provider Limits

| Limit | Value |
|-------|-------|
| Max providers per developer | 10 |
| Max channels per provider | 100 |

### Certified Providers

Certified providers display a verification badge on consent screens, indicating:
- LY Corporation has verified the organization
- The applicant's legitimacy is confirmed
- A privacy policy is established

This is primarily for corporate users and requires a formal application process.

## Channels

### Channel Types

| Type | Purpose | Features |
|------|---------|----------|
| **Messaging API** | Build bots | Webhooks, messages, rich menus |
| **LINE Login** | User authentication | OAuth, LIFF apps |
| **LINE MINI App** | Mini applications | Future LIFF integration |
| **Blockchain Service** | Blockchain apps | NFT, wallet integration |

### Creating a Channel

1. Select your provider
2. Click **Create a new channel**
3. Choose channel type
4. Fill in channel details:
   - Channel name (cannot include "LINE")
   - Channel description
   - Channel icon
   - App type (for LINE Login)

### Channel States (LINE Login)

| State | Description |
|-------|-------------|
| **Developing** | Only Admin/Tester roles can access |
| **Published** | Available to all users |

## Critical Rules

### Cannot Move Channels Between Providers

> **Once you create a channel, you can't move the channel to another provider later.**

Plan your provider structure carefully before creating channels.

### User IDs Are Provider-Specific

> **Users receive different IDs across different providers.**

You cannot identify the same user across providers. If you need to link Messaging API with LINE Login for a single service, **both channels must be in the same provider**.

```
❌ Wrong Setup:
Provider A → Messaging API Channel
Provider B → LINE Login Channel
(Cannot identify same user!)

✅ Correct Setup:
Provider A → Messaging API Channel
          → LINE Login Channel
(Same userId across both channels)
```

### One Bot Per LINE Login Channel

When linking a LINE Official Account (bot) with LINE Login:
- Both must belong to the **same provider**
- Only **one bot** can be linked per LINE Login channel
- You need administrator rights for both

## Roles and Permissions

### Role Types

| Role | Permissions |
|------|-------------|
| **Admin** | Full access, manage members, delete channel |
| **Member** | View and edit channel settings |
| **Tester** | Test developing channels (LINE Login) |

### Managing Roles

1. Go to channel or provider settings
2. Navigate to "Roles" tab
3. Add members by email or LINE account
4. Assign appropriate role

## Getting Channel Credentials

### Channel ID and Secret

1. Go to your channel in the console
2. Navigate to "Basic settings" tab
3. Find:
   - **Channel ID**: Public identifier
   - **Channel secret**: Private key (keep secure!)

### Channel Access Token (Messaging API)

1. Go to Messaging API channel
2. Navigate to "Messaging API" tab
3. Issue channel access token:
   - Click "Issue" for long-lived token
   - Or use API for v2.1 tokens

## Webhook Configuration

### Setting Up Webhook URL

1. Go to Messaging API channel
2. Navigate to "Messaging API" tab
3. Under "Webhook settings":
   - Enter your HTTPS URL
   - Click "Verify" to test
   - Toggle "Use webhook" ON

### Requirements

- Must be HTTPS (no HTTP)
- Valid SSL certificate (not self-signed)
- Must respond with 200 OK

## LIFF App Management

### Adding LIFF Apps

1. Go to LINE Login channel
2. Navigate to "LIFF" tab
3. Click "Add"
4. Configure:
   - LIFF app name
   - Size (Full/Tall/Compact)
   - Endpoint URL
   - Scopes

### LIFF Limits

| Limit | Value |
|-------|-------|
| Max LIFF apps per channel | 30 |

## Rich Menu Management

Rich menus can be managed via:
1. **LINE Official Account Manager** (GUI)
2. **Messaging API** (programmatic)

## Best Practices

### Provider Naming
- Use your company/organization name
- This appears on user consent screens
- Don't use internal project codenames

### Channel Organization
- Group related services under one provider
- Plan ahead - channels can't be moved
- Use descriptive channel names

### Security
- Keep channel secret secure
- Rotate access tokens periodically
- Use appropriate token types for use case
- Revoke compromised tokens immediately

### Team Management
- Assign minimum required permissions
- Regularly audit member access
- Remove access when team members leave

## Console URLs

| Resource | URL |
|----------|-----|
| Console Home | https://developers.line.biz/console/ |
| Create Provider | https://developers.line.biz/console/register/provider/ |
| Documentation | https://developers.line.biz/en/docs/ |
| API Status | https://status.line.me/ |
