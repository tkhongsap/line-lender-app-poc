# Flex Messages

> Source: https://developers.line.biz/en/docs/messaging-api/flex-message-elements/

## Overview

Flex Messages are highly customizable message layouts built with a component-based structure. They support rich layouts for notifications, cards, receipts, and more.

## Structure Hierarchy

```
Flex Message
└── Container (Bubble or Carousel)
    └── Block (Header, Hero, Body, Footer)
        └── Component (Box, Text, Button, Image, etc.)
```

## Container Types

### Bubble (Single Card)

```javascript
{
  type: "flex",
  altText: "Loan Application Status",
  contents: {
    type: "bubble",
    header: { ... },
    hero: { ... },
    body: { ... },
    footer: { ... }
  }
}
```

### Carousel (Multiple Cards)

```javascript
{
  type: "flex",
  altText: "Loan Options",
  contents: {
    type: "carousel",
    contents: [
      { type: "bubble", ... },
      { type: "bubble", ... },
      { type: "bubble", ... }
    ]
  }
}
```

## Bubble Blocks

| Block | Purpose | Required |
|-------|---------|----------|
| `header` | Title area | No |
| `hero` | Main image | No |
| `body` | Main content | No |
| `footer` | Buttons/actions | No |

## Component Types

### Box (Layout Container)

```javascript
{
  type: "box",
  layout: "vertical",  // "horizontal" | "vertical" | "baseline"
  contents: [
    { type: "text", text: "Item 1" },
    { type: "text", text: "Item 2" }
  ],
  spacing: "md",       // "none" | "xs" | "sm" | "md" | "lg" | "xl" | "xxl"
  margin: "lg",
  paddingAll: "20px",
  backgroundColor: "#FFFFFF"
}
```

### Text

```javascript
{
  type: "text",
  text: "Hello World",
  size: "xl",          // "xxs" | "xs" | "sm" | "md" | "lg" | "xl" | "xxl" | "3xl" | "4xl" | "5xl"
  weight: "bold",      // "regular" | "bold"
  color: "#000000",
  align: "center",     // "start" | "center" | "end"
  wrap: true,          // Allow text wrapping
  maxLines: 2          // Max lines before truncation
}
```

### Button

```javascript
{
  type: "button",
  action: {
    type: "uri",
    label: "Apply Now",
    uri: "https://liff.line.me/YOUR_LIFF_ID/apply"
  },
  style: "primary",    // "primary" | "secondary" | "link"
  color: "#1DB446",
  height: "sm"         // "sm" | "md"
}
```

### Image

```javascript
{
  type: "image",
  url: "https://example.com/image.jpg",
  size: "full",        // "xxs" | "xs" | "sm" | "md" | "lg" | "xl" | "xxl" | "3xl" | "4xl" | "5xl" | "full"
  aspectRatio: "16:9",
  aspectMode: "cover", // "cover" | "fit"
  action: {
    type: "uri",
    uri: "https://example.com"
  }
}
```

### Icon

```javascript
{
  type: "icon",
  url: "https://example.com/icon.png",
  size: "sm"
}
```

### Separator

```javascript
{
  type: "separator",
  margin: "lg",
  color: "#CCCCCC"
}
```

### Span (Mixed Text Styling)

```javascript
{
  type: "text",
  contents: [
    {
      type: "span",
      text: "Price: ",
      color: "#666666"
    },
    {
      type: "span",
      text: "฿50,000",
      color: "#1DB446",
      weight: "bold"
    }
  ]
}
```

## Loan Status Notification Example

```javascript
const loanStatusMessage = {
  type: "flex",
  altText: "สถานะสินเชื่อของคุณ",
  contents: {
    type: "bubble",
    header: {
      type: "box",
      layout: "vertical",
      contents: [
        {
          type: "text",
          text: "สถานะสินเชื่อ",
          weight: "bold",
          size: "xl",
          color: "#FFFFFF"
        }
      ],
      backgroundColor: "#1DB446",
      paddingAll: "20px"
    },
    body: {
      type: "box",
      layout: "vertical",
      contents: [
        {
          type: "text",
          text: "อนุมัติแล้ว",
          weight: "bold",
          size: "xxl",
          color: "#1DB446",
          align: "center"
        },
        {
          type: "separator",
          margin: "lg"
        },
        {
          type: "box",
          layout: "horizontal",
          margin: "lg",
          contents: [
            {
              type: "text",
              text: "วงเงิน",
              color: "#666666",
              flex: 1
            },
            {
              type: "text",
              text: "฿100,000",
              weight: "bold",
              align: "end",
              flex: 2
            }
          ]
        },
        {
          type: "box",
          layout: "horizontal",
          margin: "md",
          contents: [
            {
              type: "text",
              text: "ดอกเบี้ย",
              color: "#666666",
              flex: 1
            },
            {
              type: "text",
              text: "12% ต่อปี",
              align: "end",
              flex: 2
            }
          ]
        },
        {
          type: "box",
          layout: "horizontal",
          margin: "md",
          contents: [
            {
              type: "text",
              text: "ผ่อนต่อเดือน",
              color: "#666666",
              flex: 1
            },
            {
              type: "text",
              text: "฿8,884",
              weight: "bold",
              align: "end",
              flex: 2
            }
          ]
        }
      ],
      paddingAll: "20px"
    },
    footer: {
      type: "box",
      layout: "vertical",
      contents: [
        {
          type: "button",
          action: {
            type: "uri",
            label: "ดูรายละเอียด",
            uri: "https://liff.line.me/YOUR_LIFF_ID/dashboard"
          },
          style: "primary",
          color: "#1DB446"
        }
      ],
      paddingAll: "20px"
    }
  }
};
```

## Payment Reminder Example

```javascript
const paymentReminderMessage = {
  type: "flex",
  altText: "แจ้งเตือนการชำระ",
  contents: {
    type: "bubble",
    body: {
      type: "box",
      layout: "vertical",
      contents: [
        {
          type: "text",
          text: "แจ้งเตือนการชำระ",
          weight: "bold",
          size: "lg"
        },
        {
          type: "text",
          text: "งวดที่ 3/12",
          color: "#666666",
          margin: "sm"
        },
        {
          type: "separator",
          margin: "lg"
        },
        {
          type: "box",
          layout: "horizontal",
          margin: "lg",
          contents: [
            {
              type: "text",
              text: "ยอดชำระ",
              color: "#666666"
            },
            {
              type: "text",
              text: "฿8,884",
              weight: "bold",
              size: "xl",
              align: "end",
              color: "#FF5551"
            }
          ]
        },
        {
          type: "text",
          text: "กำหนดชำระ: 15 ม.ค. 2567",
          size: "sm",
          color: "#FF5551",
          margin: "lg"
        }
      ],
      paddingAll: "20px"
    },
    footer: {
      type: "box",
      layout: "vertical",
      contents: [
        {
          type: "button",
          action: {
            type: "uri",
            label: "ชำระเงิน",
            uri: "https://liff.line.me/YOUR_LIFF_ID/payment"
          },
          style: "primary"
        }
      ],
      paddingAll: "20px"
    }
  }
};
```

## Carousel Example (Loan Products)

```javascript
const loanProductsCarousel = {
  type: "flex",
  altText: "ผลิตภัณฑ์สินเชื่อ",
  contents: {
    type: "carousel",
    contents: [
      {
        type: "bubble",
        hero: {
          type: "image",
          url: "https://example.com/personal-loan.jpg",
          size: "full",
          aspectRatio: "20:13",
          aspectMode: "cover"
        },
        body: {
          type: "box",
          layout: "vertical",
          contents: [
            {
              type: "text",
              text: "สินเชื่อส่วนบุคคล",
              weight: "bold",
              size: "lg"
            },
            {
              type: "text",
              text: "วงเงินสูงสุด 500,000 บาท",
              color: "#666666",
              size: "sm",
              margin: "md"
            }
          ]
        },
        footer: {
          type: "box",
          layout: "vertical",
          contents: [
            {
              type: "button",
              action: {
                type: "uri",
                label: "สมัครเลย",
                uri: "https://liff.line.me/YOUR_LIFF_ID/apply?type=personal"
              },
              style: "primary"
            }
          ]
        }
      },
      {
        type: "bubble",
        hero: {
          type: "image",
          url: "https://example.com/home-loan.jpg",
          size: "full",
          aspectRatio: "20:13",
          aspectMode: "cover"
        },
        body: {
          type: "box",
          layout: "vertical",
          contents: [
            {
              type: "text",
              text: "สินเชื่อบ้าน",
              weight: "bold",
              size: "lg"
            },
            {
              type: "text",
              text: "วงเงินสูงสุด 5,000,000 บาท",
              color: "#666666",
              size: "sm",
              margin: "md"
            }
          ]
        },
        footer: {
          type: "box",
          layout: "vertical",
          contents: [
            {
              type: "button",
              action: {
                type: "uri",
                label: "สมัครเลย",
                uri: "https://liff.line.me/YOUR_LIFF_ID/apply?type=home"
              },
              style: "primary"
            }
          ]
        }
      }
    ]
  }
};
```

## Styling Properties

### Colors
- Use hex codes: `#FFFFFF`, `#1DB446`
- Supports transparency: `#1DB44680`

### Spacing/Margin
- `none`, `xs`, `sm`, `md`, `lg`, `xl`, `xxl`
- Or pixel values: `10px`, `20px`

### Size (Text/Image)
- `xxs`, `xs`, `sm`, `md`, `lg`, `xl`, `xxl`, `3xl`, `4xl`, `5xl`
- Images also support `full`

## Flex Message Simulator

Test your Flex Messages visually:
- https://developers.line.biz/flex-simulator/

## Limits

| Property | Limit |
|----------|-------|
| Bubbles in carousel | 12 |
| Components in bubble | 300 total |
| JSON size | 50 KB |
| Action objects | 50 per message |
