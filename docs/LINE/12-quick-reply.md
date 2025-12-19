# Quick Reply

> Source: https://developers.line.biz/en/docs/messaging-api/using-quick-reply/

## Overview

Quick Reply displays buttons at the bottom of the chat screen, allowing users to respond with a single tap. This provides a streamlined interaction experience.

```
┌─────────────────────────────────────────┐
│                                         │
│  Bot: What would you like to do?        │
│                                         │
├─────────────────────────────────────────┤
│ [Apply] [Check Status] [Contact Us] ... │
│         (Quick Reply Buttons)           │
└─────────────────────────────────────────┘
```

## Key Features

| Feature | Value |
|---------|-------|
| Max buttons per message | 13 |
| Available on | LINE iOS and Android only |
| Works in | One-on-one, group, multi-person chats |

## Quick Reply Structure

```javascript
{
  type: "text",
  text: "What would you like to do?",
  quickReply: {
    items: [
      {
        type: "action",
        imageUrl: "https://example.com/icon.png",  // Optional
        action: {
          type: "message",
          label: "Apply for Loan",
          text: "สมัครสินเชื่อ"
        }
      },
      // More items...
    ]
  }
}
```

## Action Types

### Message Action

User sends a text message when tapped:

```javascript
{
  type: "action",
  action: {
    type: "message",
    label: "Check Status",
    text: "ตรวจสอบสถานะ"
  }
}
```

### Postback Action

Sends data to your server (can be invisible to user):

```javascript
{
  type: "action",
  action: {
    type: "postback",
    label: "View Loans",
    data: "action=view_loans&category=active",
    displayText: "ดูสินเชื่อของฉัน"  // Optional: shown in chat
  }
}
```

### URI Action

Opens a URL:

```javascript
{
  type: "action",
  action: {
    type: "uri",
    label: "Apply Now",
    uri: "https://liff.line.me/YOUR_LIFF_ID/apply"
  }
}
```

### Datetime Picker Action

Shows date/time picker:

```javascript
{
  type: "action",
  action: {
    type: "datetimepicker",
    label: "Set Reminder",
    data: "action=set_reminder",
    mode: "datetime",        // "date" | "time" | "datetime"
    initial: "2024-01-15T10:00",
    min: "2024-01-01T00:00",
    max: "2024-12-31T23:59"
  }
}
```

### Camera Action

Opens camera:

```javascript
{
  type: "action",
  action: {
    type: "camera",
    label: "Take Photo"
  }
}
```

### Camera Roll Action

Opens photo library:

```javascript
{
  type: "action",
  action: {
    type: "cameraRoll",
    label: "Choose Photo"
  }
}
```

### Location Action

Opens location picker:

```javascript
{
  type: "action",
  action: {
    type: "location",
    label: "Share Location"
  }
}
```

### Clipboard Action

Copies text to clipboard:

```javascript
{
  type: "action",
  action: {
    type: "clipboard",
    label: "Copy Account Number",
    clipboardText: "123-456-7890"
  }
}
```

## Icon Configuration

### Default Icons

These actions show default icons automatically:
- Camera action
- Camera roll action
- Location action

### Custom Icons

For other actions, you can specify custom icons:

```javascript
{
  type: "action",
  imageUrl: "https://example.com/loan-icon.png",
  action: {
    type: "message",
    label: "Apply",
    text: "สมัครสินเชื่อ"
  }
}
```

**Icon Requirements:**
- Format: PNG or JPEG
- Max size: 1 MB
- Recommended: 108x108 pixels
- Must be HTTPS URL

## Button Behavior

### Disappearance Rules

Buttons disappear when:
- User taps a button (except camera, camera roll, datetime, location)
- New message arrives in chat

### Persistence

These actions keep buttons visible after tap:
- Camera action
- Camera roll action
- Datetime picker action
- Location action

## Complete Example: Loan Bot

```javascript
async function sendLoanOptions(replyToken) {
  await axios.post(
    'https://api.line.me/v2/bot/message/reply',
    {
      replyToken: replyToken,
      messages: [{
        type: 'text',
        text: 'สวัสดีค่ะ! คุณต้องการทำอะไรวันนี้?',
        quickReply: {
          items: [
            {
              type: 'action',
              imageUrl: 'https://example.com/icons/apply.png',
              action: {
                type: 'uri',
                label: 'สมัครสินเชื่อ',
                uri: 'https://liff.line.me/YOUR_LIFF_ID/apply'
              }
            },
            {
              type: 'action',
              imageUrl: 'https://example.com/icons/status.png',
              action: {
                type: 'postback',
                label: 'ตรวจสอบสถานะ',
                data: 'action=check_status'
              }
            },
            {
              type: 'action',
              imageUrl: 'https://example.com/icons/payment.png',
              action: {
                type: 'uri',
                label: 'ชำระเงิน',
                uri: 'https://liff.line.me/YOUR_LIFF_ID/payment'
              }
            },
            {
              type: 'action',
              imageUrl: 'https://example.com/icons/history.png',
              action: {
                type: 'postback',
                label: 'ประวัติการชำระ',
                data: 'action=payment_history'
              }
            },
            {
              type: 'action',
              imageUrl: 'https://example.com/icons/contact.png',
              action: {
                type: 'message',
                label: 'ติดต่อเจ้าหน้าที่',
                text: 'ต้องการติดต่อเจ้าหน้าที่'
              }
            }
          ]
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

## Payment Upload Example

```javascript
const paymentUploadMessage = {
  type: 'text',
  text: 'กรุณาส่งหลักฐานการชำระเงิน',
  quickReply: {
    items: [
      {
        type: 'action',
        action: {
          type: 'camera',
          label: 'ถ่ายภาพสลิป'
        }
      },
      {
        type: 'action',
        action: {
          type: 'cameraRoll',
          label: 'เลือกจากอัลบั้ม'
        }
      },
      {
        type: 'action',
        action: {
          type: 'postback',
          label: 'ยกเลิก',
          data: 'action=cancel_payment'
        }
      }
    ]
  }
};
```

## Handling Quick Reply Responses

### Message Action Response

```javascript
// User tapped "สมัครสินเชื่อ" which sends text
if (event.type === 'message' && event.message.type === 'text') {
  if (event.message.text === 'สมัครสินเชื่อ') {
    // Handle loan application
  }
}
```

### Postback Action Response

```javascript
if (event.type === 'postback') {
  const data = new URLSearchParams(event.postback.data);
  const action = data.get('action');

  switch (action) {
    case 'check_status':
      await sendLoanStatus(event);
      break;
    case 'payment_history':
      await sendPaymentHistory(event);
      break;
  }
}
```

### Datetime Picker Response

```javascript
if (event.type === 'postback' && event.postback.params) {
  const { date, time, datetime } = event.postback.params;

  if (datetime) {
    // User selected a datetime
    await setPaymentReminder(event.source.userId, datetime);
  }
}
```

## Best Practices

1. **Keep labels short** - Max ~20 characters for best display
2. **Use clear action labels** - "สมัครสินเชื่อ" not "สมัคร"
3. **Limit buttons** - 3-5 most common actions, not all 13
4. **Use icons** - Improves visual recognition
5. **Group related actions** - Put similar actions near each other
6. **Provide escape route** - Include "ยกเลิก" or "กลับ" option

## Limitations

- **Not on PC**: Quick reply only works on LINE iOS/Android
- **No rich menu switch**: Cannot use rich menu switch action
- **Single-use**: Buttons disappear after tap (for most actions)
- **No styling**: Cannot customize button colors or shapes
