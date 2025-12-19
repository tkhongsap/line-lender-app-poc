# LINE Services Setup Guide

## 1. Create LINE Official Account

1. Go to [LINE Official Account Manager](https://manager.line.biz/)
2. Click **Create** to create a new account
3. Fill in account information:
   - Account name: `สินเชื่อดี` (or your company name)
   - Category: Financial Services
   - Region: Thailand
4. Click **Create account**

## 2. Enable Messaging API

1. Go to **Settings** > **Messaging API**
2. Click **Enable Messaging API**
3. Select or create a LINE Developers provider
4. Complete the setup

## 3. Get Channel Credentials

1. Go to [LINE Developers Console](https://developers.line.biz/)
2. Select your provider and Messaging API channel
3. Note down:
   - **Channel ID** → `LINE_CHANNEL_ID`
   - **Channel Secret** → `LINE_CHANNEL_SECRET`
4. Issue a **Channel Access Token** (Long-lived):
   - Go to **Messaging API** tab
   - Click **Issue** next to Channel Access Token
   - Copy the token → `LINE_CHANNEL_ACCESS_TOKEN`

## 4. Create LIFF Apps

You need to create 2 LIFF apps: one for customers and one for admins.

### 4.1 Create Customer LIFF App

1. In LINE Developers Console, go to your channel
2. Click **LIFF** tab
3. Click **Add**
4. Configure:
   - **LIFF app name**: Customer App
   - **Size**: Full
   - **Endpoint URL**: `https://your-domain.vercel.app/customer/apply`
   - **Scopes**: Check `openid`, `profile`
   - **Bot link feature**: Aggressive
5. Click **Add**
6. Copy the **LIFF ID** → `LIFF_ID_CUSTOMER` and `NEXT_PUBLIC_LIFF_ID_CUSTOMER`

### 4.2 Create Admin LIFF App

1. Click **Add** again
2. Configure:
   - **LIFF app name**: Admin App
   - **Size**: Full
   - **Endpoint URL**: `https://your-domain.vercel.app/admin/dashboard`
   - **Scopes**: Check `openid`, `profile`, `email`
   - **Bot link feature**: Aggressive
3. Click **Add**
4. Copy the **LIFF ID** → `LIFF_ID_ADMIN` and `NEXT_PUBLIC_LIFF_ID_ADMIN`

## 5. Configure Webhook

1. Go to **Messaging API** tab
2. Set **Webhook URL**: `https://your-domain.vercel.app/api/line/webhook`
3. Click **Verify** (after deployment)
4. Enable **Use webhook**

## 6. Configure Response Settings

1. In LINE Official Account Manager:
2. Go to **Response settings**
3. Set:
   - Auto-response: **Off**
   - Greeting message: **On** (customize your welcome message)
   - Webhook: **On**

## 7. Rich Menu (Optional)

Create a rich menu for easy navigation:

1. Go to LINE Official Account Manager
2. Click **Rich menu**
3. Create a menu with buttons:
   - สมัครสินเชื่อ → `https://liff.line.me/{LIFF_ID_CUSTOMER}`
   - ดูยอดค้าง → `https://liff.line.me/{LIFF_ID_CUSTOMER}/payment`
   - ส่งสลิป → `https://liff.line.me/{LIFF_ID_CUSTOMER}/slip`

## 8. Add Admin Users

To give admin access, you need to:

1. Have admins add your LINE Official Account as friend
2. Get their LINE User ID (from webhook follow event)
3. Add them to the Users sheet with appropriate role:
   - `SUPER_ADMIN`
   - `APPROVER`
   - `COLLECTOR`
   - `VIEWER`

## 9. Environment Variables

Add these to your `.env.local`:

```env
# LINE Configuration
LINE_CHANNEL_ID=your-channel-id
LINE_CHANNEL_SECRET=your-channel-secret
LINE_CHANNEL_ACCESS_TOKEN=your-long-lived-access-token
LIFF_ID_CUSTOMER=your-customer-liff-id
LIFF_ID_ADMIN=your-admin-liff-id

# Public (accessible in client)
NEXT_PUBLIC_LIFF_ID_CUSTOMER=your-customer-liff-id
NEXT_PUBLIC_LIFF_ID_ADMIN=your-admin-liff-id
```

## 10. Testing

1. Add your LINE Official Account as friend
2. Open LIFF URL: `https://liff.line.me/{LIFF_ID_CUSTOMER}`
3. Verify that:
   - LIFF opens in LINE app
   - You can see the application form
   - After submission, you receive a LINE notification

## Troubleshooting

### LIFF not opening in LINE app
- Check that the endpoint URL is correct and accessible
- Ensure HTTPS is used
- Verify the LIFF ID is correct

### Webhook not receiving events
- Check webhook URL is correct
- Verify webhook is enabled
- Check Vercel logs for errors

### Messages not sending
- Verify Channel Access Token is valid
- Check that the user has added your LINE OA as friend
- Users can block messages; check if they've blocked your account

