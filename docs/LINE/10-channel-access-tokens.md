# Channel Access Tokens

> Source: https://developers.line.biz/en/docs/basics/channel-access-token/

## Overview

Channel access tokens are credentials used to authenticate API requests to the LINE Platform. They are required for all Messaging API calls.

## Token Types

| Type | Validity | Max per Channel | Use Case |
|------|----------|-----------------|----------|
| **v2.1** | Up to 30 days | 30 | Production (recommended) |
| **Stateless** | 15 minutes | Unlimited | Serverless functions |
| **Short-lived** | 30 days | 30 | Development/Testing |
| **Long-lived** | Never expires | 1 | Simple integrations |

## Channel Access Token v2.1 (Recommended)

The recommended token type for production. Uses JWT (JSON Web Token) for enhanced security.

### Features
- Custom validity period (up to 30 days)
- Up to 30 tokens per channel
- JWT-based issuance
- Can be revoked

### Issuing v2.1 Token

```javascript
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const axios = require('axios');

async function issueChannelAccessToken() {
  const now = Math.floor(Date.now() / 1000);

  // Create JWT assertion
  const assertion = jwt.sign(
    {
      iss: process.env.LINE_CHANNEL_ID,
      sub: process.env.LINE_CHANNEL_ID,
      aud: 'https://api.line.me/',
      exp: now + (60 * 30),  // JWT expires in 30 minutes
      token_exp: 60 * 60 * 24 * 30  // Token valid for 30 days
    },
    process.env.LINE_CHANNEL_SECRET,
    { algorithm: 'HS256' }
  );

  const response = await axios.post(
    'https://api.line.me/oauth2/v2.1/token',
    new URLSearchParams({
      grant_type: 'client_credentials',
      client_assertion_type: 'urn:ietf:params:oauth:client-assertion-type:jwt-bearer',
      client_assertion: assertion
    }),
    {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    }
  );

  return response.data.access_token;
}
```

### Response

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiJ9...",
  "token_type": "Bearer",
  "expires_in": 2592000,
  "key_id": "sDTOzw5wIfxxxxPEzcmeQA"
}
```

## Stateless Channel Access Token

For single-use scenarios where you need tokens on-demand.

### Features
- 15-minute validity
- Unlimited issuance
- **Cannot be revoked** once issued
- No state stored on LINE servers

### Issuing Stateless Token

```javascript
async function issueStatelessToken() {
  const response = await axios.post(
    'https://api.line.me/oauth2/v3/token',
    new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: process.env.LINE_CHANNEL_ID,
      client_secret: process.env.LINE_CHANNEL_SECRET
    }),
    {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    }
  );

  return response.data.access_token;
}
```

## Short-lived Channel Access Token

Standard token with 30-day validity.

### Features
- Valid for 30 days
- Up to 30 tokens per channel
- Oldest token auto-revoked when limit exceeded

### Issuing Short-lived Token

```javascript
async function issueShortLivedToken() {
  const response = await axios.post(
    'https://api.line.me/v2/oauth/accessToken',
    new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: process.env.LINE_CHANNEL_ID,
      client_secret: process.env.LINE_CHANNEL_SECRET
    }),
    {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    }
  );

  return response.data.access_token;
}
```

## Long-lived Channel Access Token

Token that never expires, issued via LINE Developers Console.

### Features
- No expiration
- Only 1 per channel
- Reissuance invalidates previous token
- Can restrict by IP address

### Issuing Long-lived Token

1. Go to LINE Developers Console
2. Select your Messaging API channel
3. Navigate to "Messaging API" tab
4. Click "Issue" under Channel access token

**Note**: Reissuing extends validity by up to 24 hours before old token expires.

### IP Restriction (Optional)

1. Go to channel settings
2. Navigate to "Security" tab
3. Add allowed IP addresses
4. Only these IPs can use the token

## Verifying Tokens

Check if a token is valid:

```javascript
async function verifyToken(accessToken) {
  try {
    const response = await axios.get(
      'https://api.line.me/v2/oauth/verify',
      {
        params: { access_token: accessToken }
      }
    );

    return {
      valid: true,
      expiresIn: response.data.expires_in,
      channelId: response.data.client_id
    };
  } catch (error) {
    return { valid: false };
  }
}
```

### Response

```json
{
  "client_id": "1234567890",
  "expires_in": 2591659,
  "scope": "P CM"
}
```

## Revoking Tokens

Immediately invalidate a compromised token:

```javascript
async function revokeToken(accessToken) {
  await axios.post(
    'https://api.line.me/v2/oauth/revoke',
    new URLSearchParams({
      access_token: accessToken
    }),
    {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    }
  );
}
```

## Best Practices

### Token Reuse

> **The same channel access token can be used multiple times within its validity period.**

Don't issue new tokens for every request. Cache and reuse tokens until they expire.

```javascript
class TokenManager {
  constructor() {
    this.token = null;
    this.expiresAt = 0;
  }

  async getToken() {
    const now = Date.now();

    // Refresh if expired or expiring soon (5 min buffer)
    if (!this.token || now >= this.expiresAt - 300000) {
      const result = await issueChannelAccessToken();
      this.token = result.access_token;
      this.expiresAt = now + (result.expires_in * 1000);
    }

    return this.token;
  }
}

const tokenManager = new TokenManager();
```

### Security

1. **Never expose tokens in client-side code**
2. **Store tokens securely** (environment variables, secrets manager)
3. **Revoke immediately** if compromised
4. **Use IP restriction** for long-lived tokens
5. **Rotate regularly** even if not compromised

### Choosing Token Type

| Scenario | Recommended Token |
|----------|-------------------|
| Production server | v2.1 (30-day) |
| AWS Lambda / Cloud Functions | Stateless (15-min) |
| Development / Testing | Short-lived (30-day) |
| Simple scripts | Long-lived |

### Rate Limiting

Excessive token issuance may trigger platform restrictions. Reuse tokens instead of issuing new ones for every request.

## Token Usage in API Calls

```javascript
const axios = require('axios');

async function sendMessage(userId, message) {
  const token = await tokenManager.getToken();

  await axios.post(
    'https://api.line.me/v2/bot/message/push',
    {
      to: userId,
      messages: [message]
    },
    {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    }
  );
}
```

## API Endpoints Summary

| Operation | Endpoint | Method |
|-----------|----------|--------|
| Issue v2.1 token | `/oauth2/v2.1/token` | POST |
| Issue stateless token | `/oauth2/v3/token` | POST |
| Issue short-lived token | `/v2/oauth/accessToken` | POST |
| Verify token | `/v2/oauth/verify` | GET |
| Revoke token | `/v2/oauth/revoke` | POST |
