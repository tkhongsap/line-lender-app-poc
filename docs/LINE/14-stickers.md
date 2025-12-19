# LINE Stickers

> Source: https://developers.line.biz/en/docs/messaging-api/sticker-list/

## Overview

The Messaging API allows bots to send stickers from a curated list of available packages. Stickers add personality and emotional expression to bot messages.

## Sending Stickers

### Sticker Message Structure

```javascript
{
  type: "sticker",
  packageId: "446",
  stickerId: "1988"
}
```

### Example: Send Sticker

```javascript
async function sendSticker(replyToken, packageId, stickerId) {
  await axios.post(
    'https://api.line.me/v2/bot/message/reply',
    {
      replyToken: replyToken,
      messages: [{
        type: 'sticker',
        packageId: packageId,
        stickerId: stickerId
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

// Usage
await sendSticker(event.replyToken, '446', '1988');
```

## Available Sticker Packages

### Moon: Special Edition (Package 446)

Popular Moon character stickers.

| Sticker ID | Description |
|------------|-------------|
| 1988 | Moon thumbs up |
| 1989 | Moon happy |
| 1990 | Moon excited |
| 1991 | Moon sad |
| 1992 | Moon crying |

```javascript
// Happy Moon
{ type: 'sticker', packageId: '446', stickerId: '1988' }
```

### Sally: Special Edition (Package 789)

Cute Sally (chick) character stickers.

| Sticker ID | Description |
|------------|-------------|
| 10855 | Sally happy |
| 10856 | Sally excited |
| 10857 | Sally sad |
| 10858 | Sally crying |
| 10859 | Sally love |

### Brown & Cony (Package 1070)

Classic LINE bear and rabbit characters.

| Sticker ID | Description |
|------------|-------------|
| 17839 | Brown happy |
| 17840 | Cony excited |
| 17841 | Brown & Cony together |
| 17842 | Brown thumbs up |
| 17843 | Cony heart |

### LINE Characters: Making Amends (Package 6136)

Apologetic and grateful expressions.

| Sticker ID | Description |
|------------|-------------|
| 10551376 | Sorry |
| 10551377 | Thank you |
| 10551378 | Please |
| 10551379 | Grateful |
| 10551380 | Apologizing |

### LINE Characters: Pretty Phrases (Packages 8515, 8522)

Common conversational expressions.

**Package 8515:**
| Sticker ID | Description |
|------------|-------------|
| 16581242 | "Got it!" |
| 16581243 | "OK!" |
| 16581244 | "Thank you!" |
| 16581245 | "Please!" |

**Package 8522:**
| Sticker ID | Description |
|------------|-------------|
| 16581266 | "Congrats!" |
| 16581267 | "Good job!" |
| 16581268 | "Fighting!" |

### Animated Sticker Packs

**Brown & Cony & Sally: Animated (Package 11537)**
- Animated versions of classic characters

**CHOCO & Friends: Animated (Package 11538)**
- Animated CHOCO (Brown's sister) stickers

**UNIVERSTAR BT21: Animated (Package 11539)**
- BT21 character stickers (LINE FRIENDS x BTS)

## Using Stickers Contextually

### Loan Approval

```javascript
async function sendApprovalMessage(userId, loanAmount) {
  await pushMessage(userId, [
    {
      type: 'sticker',
      packageId: '11537',
      stickerId: '52002734'  // Celebration sticker
    },
    {
      type: 'text',
      text: `ยินดีด้วย! สินเชื่อของคุณได้รับการอนุมัติแล้ว\nวงเงิน: ฿${loanAmount.toLocaleString()}`
    }
  ]);
}
```

### Payment Received

```javascript
async function sendPaymentConfirmation(userId, amount) {
  await pushMessage(userId, [
    {
      type: 'sticker',
      packageId: '6136',
      stickerId: '10551377'  // Thank you sticker
    },
    {
      type: 'text',
      text: `ได้รับการชำระเงินแล้ว ฿${amount.toLocaleString()}\nขอบคุณค่ะ!`
    }
  ]);
}
```

### Payment Reminder

```javascript
async function sendPaymentReminder(userId, dueDate, amount) {
  await pushMessage(userId, [
    {
      type: 'sticker',
      packageId: '789',
      stickerId: '10856'  // Sally waving
    },
    {
      type: 'text',
      text: `แจ้งเตือน: ถึงกำหนดชำระเงินวันที่ ${dueDate}\nยอด: ฿${amount.toLocaleString()}`
    }
  ]);
}
```

### Error/Apology

```javascript
async function sendErrorMessage(userId) {
  await pushMessage(userId, [
    {
      type: 'sticker',
      packageId: '6136',
      stickerId: '10551376'  // Sorry sticker
    },
    {
      type: 'text',
      text: 'ขออภัยค่ะ เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง'
    }
  ]);
}
```

## Receiving Sticker Messages

When users send stickers, you receive:

```javascript
{
  "type": "message",
  "message": {
    "type": "sticker",
    "id": "1234567890",
    "packageId": "446",
    "stickerId": "1988",
    "stickerResourceType": "STATIC"  // or "ANIMATION", "SOUND", etc.
  }
}
```

### Handle Sticker Messages

```javascript
async function handleSticker(event) {
  const { packageId, stickerId } = event.message;

  // Log for analytics
  console.log(`User sent sticker: ${packageId}/${stickerId}`);

  // Respond with a sticker
  await reply(event.replyToken, [{
    type: 'sticker',
    packageId: '446',
    stickerId: '1988'  // Respond with Moon thumbs up
  }]);
}
```

## Sticker Keywords Reference

For common use cases:

| Emotion | Package | Sticker ID |
|---------|---------|------------|
| Happy/Success | 446 | 1988 |
| Excited | 789 | 10856 |
| Thank you | 6136 | 10551377 |
| Sorry | 6136 | 10551376 |
| Congratulations | 8522 | 16581266 |
| OK/Got it | 8515 | 16581243 |

## Limitations

1. **Limited packages**: Only stickers from the approved list can be sent
2. **No custom stickers**: Cannot send creator or sponsored stickers via API
3. **No sticker search**: Must know package/sticker IDs in advance
4. **Corporate users**: Can request additional packages through LINE sales

## Best Practices

1. **Use sparingly**: Don't overuse stickers - they should enhance, not replace text
2. **Match tone**: Choose stickers that match the message context
3. **Consistency**: Use the same character/style for brand consistency
4. **Fallback**: Include text message with sticker for accessibility
5. **Test rendering**: Some stickers may look different on iOS vs Android

## Complete Sticker Package List

For the full list of available stickers with images:
https://developers.line.biz/en/docs/messaging-api/sticker-list/

The page shows:
- All available packages
- Preview images of each sticker
- Package ID and Sticker ID for each
