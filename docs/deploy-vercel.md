# Deploying to Vercel

This guide walks you through deploying the LINE Lender App to Vercel.

## Prerequisites

1. A Vercel account (sign up at https://vercel.com)
2. Vercel CLI installed: `npm i -g vercel`
3. Completed setup for:
   - LINE Official Account & LIFF apps (see `docs/setup-line.md`)
   - Google Service Account & Sheets (see `docs/setup-google.md`)
   - Slip2Go API key (if using OCR)

## Step 1: Login to Vercel

```bash
vercel login
```

## Step 2: Deploy the Project

From the project root directory:

```bash
vercel
```

Follow the prompts:
- Set up and deploy? **Yes**
- Which scope? Select your account
- Link to existing project? **No** (first time) or **Yes** (subsequent)
- Project name: `line-lender-app-poc` (or your choice)
- Directory: `.` (current directory)
- Override settings? **No**

## Step 3: Configure Environment Variables

Go to your project in the Vercel Dashboard:
1. Navigate to **Settings** → **Environment Variables**
2. Add the following variables:

### LINE Configuration
| Variable | Description |
|----------|-------------|
| `LINE_CHANNEL_ID` | LINE Login Channel ID |
| `LINE_CHANNEL_SECRET` | LINE Login Channel Secret |
| `LINE_CHANNEL_ACCESS_TOKEN` | Messaging API Channel Access Token |
| `LIFF_ID_CUSTOMER` | LIFF ID for customer app |
| `LIFF_ID_ADMIN` | LIFF ID for admin app |
| `NEXT_PUBLIC_LIFF_ID_CUSTOMER` | Same as LIFF_ID_CUSTOMER (for client-side) |
| `NEXT_PUBLIC_LIFF_ID_ADMIN` | Same as LIFF_ID_ADMIN (for client-side) |

### Google Configuration
| Variable | Description |
|----------|-------------|
| `GOOGLE_SERVICE_ACCOUNT_EMAIL` | Service account email |
| `GOOGLE_PRIVATE_KEY` | Private key (replace `\n` with actual newlines) |
| `GOOGLE_SPREADSHEET_ID` | ID of your Google Sheet |
| `GOOGLE_DRIVE_FOLDER_ID` | ID of your Google Drive folder |

### Slip2Go OCR
| Variable | Description |
|----------|-------------|
| `SLIP2GO_API_KEY` | API key from Slip2Go |

### App Configuration
| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_BASE_URL` | Your Vercel deployment URL (e.g., `https://your-app.vercel.app`) |
| `CRON_SECRET` | A random secret string for securing cron endpoints |

## Step 4: Verify Cron Jobs

Vercel automatically detects cron jobs from `vercel.json`. After deployment:

1. Go to **Settings** → **Cron Jobs** in Vercel Dashboard
2. Verify these cron jobs are listed:
   - `/api/cron/daily` - Runs at 1:00 AM UTC daily
   - `/api/cron/reminders` - Runs at 1:00 AM UTC daily
   - `/api/cron/daily-report` - Runs at 11:00 AM UTC daily

> **Note**: Cron jobs are only available on Vercel Pro or Enterprise plans. On the Hobby plan, you'll need to use an external scheduler (like GitHub Actions or cron-job.org).

## Step 5: Update LINE LIFF URLs

After deployment, update your LIFF apps in LINE Developers Console:

1. Go to https://developers.line.biz/console/
2. Select your LINE Login channel
3. For each LIFF app, update the **Endpoint URL**:
   - Customer LIFF: `https://your-app.vercel.app/apply`
   - Admin LIFF: `https://your-app.vercel.app/dashboard`

## Step 6: Production Deployment

For production deployments:

```bash
vercel --prod
```

## Troubleshooting

### Cron Jobs Not Running
- Ensure you're on Vercel Pro plan
- Check the cron job logs in Vercel Dashboard → **Logs**
- Verify `CRON_SECRET` is set and matches the header check

### LIFF Not Initializing
- Verify `NEXT_PUBLIC_LIFF_ID_*` variables are set correctly
- Ensure LIFF endpoints match your Vercel URL
- Check browser console for specific LIFF errors

### Google API Errors
- Ensure the private key is properly formatted (newlines preserved)
- Verify the service account has access to the Sheet and Drive folder
- Check that APIs are enabled in Google Cloud Console

### LINE Webhook Errors
- Verify webhook URL is set to `https://your-app.vercel.app/api/line/webhook`
- Ensure `LINE_CHANNEL_SECRET` is correct for signature verification
- Check Vercel function logs for detailed errors

