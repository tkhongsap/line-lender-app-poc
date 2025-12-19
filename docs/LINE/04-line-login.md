# LINE Login

> Source: https://developers.line.biz/en/docs/line-login/

## Overview

LINE Login implements OpenID Connect (OAuth 2.0) for web and mobile authentication. Users can log in using their LINE account without creating a new password.

## OAuth 2.0 Flow

```
┌─────────┐                              ┌─────────────┐
│  User   │                              │ Your Server │
└────┬────┘                              └──────┬──────┘
     │                                          │
     │  1. Click "Login with LINE"              │
     │ ─────────────────────────────────────────►
     │                                          │
     │  2. Redirect to LINE authorization URL   │
     │ ◄─────────────────────────────────────────
     │                                          │
     │         ┌──────────────────┐             │
     │ ───────►│  LINE Platform   │             │
     │         │  (Login Screen)  │             │
     │ ◄───────└──────────────────┘             │
     │                                          │
     │  3. Redirect with authorization code     │
     │ ─────────────────────────────────────────►
     │                                          │
     │         4. Exchange code for tokens      │
     │         (server-to-server)               │
     │                                          │
     │  5. Return user session                  │
     │ ◄─────────────────────────────────────────
```

## Step 1: Authorization Request

Redirect users to LINE's authorization URL:

```
https://access.line.me/oauth2/v2.1/authorize?
  response_type=code&
  client_id={CHANNEL_ID}&
  redirect_uri={CALLBACK_URL}&
  state={RANDOM_STATE}&
  scope=profile%20openid%20email
```

### Required Parameters

| Parameter | Description |
|-----------|-------------|
| `response_type` | Always `code` |
| `client_id` | Your LINE Login Channel ID |
| `redirect_uri` | URL-encoded callback URL |
| `state` | Random string for CSRF protection |
| `scope` | Permissions requested |

### Optional Parameters

| Parameter | Description |
|-----------|-------------|
| `nonce` | Random string for replay attack prevention |
| `prompt` | `consent` / `none` / `login` |
| `max_age` | Max auth age in seconds |
| `bot_prompt` | Add friend prompt: `normal` / `aggressive` |
| `code_challenge` | PKCE challenge |
| `disable_auto_login` | `true` to disable auto-login |

### Available Scopes

| Scope | Access |
|-------|--------|
| `profile` | User profile via API |
| `openid` | ID token with user ID |
| `email` | User's email in ID token |

## Step 2: Handle Callback

LINE redirects to your callback URL with:
- `code`: Authorization code (valid 10 minutes)
- `state`: Same state you sent (verify this!)

### Express.js Example

```javascript
const express = require('express');
const axios = require('axios');
const app = express();

// Generate random state
function generateState() {
  return require('crypto').randomBytes(16).toString('hex');
}

// Login route
app.get('/login', (req, res) => {
  const state = generateState();
  req.session.lineState = state;  // Store in session

  const authUrl = new URL('https://access.line.me/oauth2/v2.1/authorize');
  authUrl.searchParams.set('response_type', 'code');
  authUrl.searchParams.set('client_id', process.env.LINE_CHANNEL_ID);
  authUrl.searchParams.set('redirect_uri', process.env.LINE_CALLBACK_URL);
  authUrl.searchParams.set('state', state);
  authUrl.searchParams.set('scope', 'profile openid email');

  res.redirect(authUrl.toString());
});

// Callback route
app.get('/callback', async (req, res) => {
  const { code, state } = req.query;

  // Verify state
  if (state !== req.session.lineState) {
    return res.status(400).send('Invalid state');
  }

  try {
    // Exchange code for tokens
    const tokens = await getTokens(code);

    // Get user profile
    const profile = await getUserProfile(tokens.access_token);

    // Create session
    req.session.user = {
      lineUserId: profile.userId,
      displayName: profile.displayName,
      pictureUrl: profile.pictureUrl
    };

    res.redirect('/dashboard');
  } catch (error) {
    console.error('Login failed:', error);
    res.status(500).send('Login failed');
  }
});
```

## Step 3: Exchange Code for Tokens

```javascript
async function getTokens(code) {
  const response = await axios.post(
    'https://api.line.me/oauth2/v2.1/token',
    new URLSearchParams({
      grant_type: 'authorization_code',
      code: code,
      redirect_uri: process.env.LINE_CALLBACK_URL,
      client_id: process.env.LINE_CHANNEL_ID,
      client_secret: process.env.LINE_CHANNEL_SECRET
    }),
    {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    }
  );

  return response.data;
}
```

### Token Response

```json
{
  "access_token": "bNl4YEFPI...",
  "token_type": "Bearer",
  "refresh_token": "Aa1FdeggR...",
  "expires_in": 2592000,
  "scope": "profile openid email",
  "id_token": "eyJhbGciOiJIUzI1NiJ9..."
}
```

| Field | Description |
|-------|-------------|
| `access_token` | Use for API calls (valid 30 days) |
| `refresh_token` | Use to get new access token (valid 90 days) |
| `id_token` | JWT with user info |
| `expires_in` | Seconds until access token expires |

## Step 4: Get User Profile

### Option A: From ID Token (Recommended)

```javascript
const jwt = require('jsonwebtoken');

function decodeIdToken(idToken) {
  // For production, verify signature with channel secret
  const decoded = jwt.verify(idToken, process.env.LINE_CHANNEL_SECRET, {
    algorithms: ['HS256'],
    audience: process.env.LINE_CHANNEL_ID,
    issuer: 'https://access.line.me'
  });

  return {
    userId: decoded.sub,
    displayName: decoded.name,
    pictureUrl: decoded.picture,
    email: decoded.email  // If email scope granted
  };
}
```

### Option B: From Profile API

```javascript
async function getUserProfile(accessToken) {
  const response = await axios.get(
    'https://api.line.me/v2/profile',
    {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    }
  );

  return response.data;
  // { userId, displayName, pictureUrl, statusMessage }
}
```

## Verify Access Token

```javascript
async function verifyToken(accessToken) {
  const response = await axios.get(
    `https://api.line.me/oauth2/v2.1/verify?access_token=${accessToken}`
  );

  return response.data;
  // { scope, client_id, expires_in }
}
```

## Refresh Token

```javascript
async function refreshToken(refreshToken) {
  const response = await axios.post(
    'https://api.line.me/oauth2/v2.1/token',
    new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
      client_id: process.env.LINE_CHANNEL_ID,
      client_secret: process.env.LINE_CHANNEL_SECRET
    })
  );

  return response.data;
}
```

## Revoke Token

```javascript
async function revokeToken(accessToken) {
  await axios.post(
    'https://api.line.me/oauth2/v2.1/revoke',
    new URLSearchParams({
      access_token: accessToken,
      client_id: process.env.LINE_CHANNEL_ID,
      client_secret: process.env.LINE_CHANNEL_SECRET
    })
  );
}
```

## PKCE Support

For public clients (mobile apps), use PKCE:

```javascript
const crypto = require('crypto');

// Generate code verifier
const codeVerifier = crypto.randomBytes(32).toString('base64url');

// Generate code challenge
const codeChallenge = crypto
  .createHash('sha256')
  .update(codeVerifier)
  .digest('base64url');

// Add to authorization URL
authUrl.searchParams.set('code_challenge', codeChallenge);
authUrl.searchParams.set('code_challenge_method', 'S256');

// Add to token exchange
tokenParams.set('code_verifier', codeVerifier);
```

## Security Best Practices

1. **Always verify state** - Prevents CSRF attacks
2. **Use HTTPS** - All endpoints must be HTTPS
3. **Store tokens securely** - Never expose in frontend
4. **Verify ID token signature** - Use channel secret
5. **Check token expiration** - Refresh before expiry
6. **Use PKCE for public clients** - Mobile/SPA apps

## Error Handling

| Error | Description |
|-------|-------------|
| `access_denied` | User cancelled or denied |
| `invalid_request` | Missing/invalid parameters |
| `invalid_scope` | Invalid scope requested |
| `server_error` | LINE server error |

```javascript
app.get('/callback', (req, res) => {
  const { error, error_description } = req.query;

  if (error) {
    console.error('LINE Login error:', error, error_description);
    return res.redirect('/login?error=' + error);
  }

  // Continue with normal flow...
});
```
