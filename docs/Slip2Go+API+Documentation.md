

# Slip2Go API Documentation

Version 1.2 (latest update at 07-05-2025)

## Overview

Slip2Go provides various API to serve our client about slip verification. We've provided a full set of data that the client can use to check the condition by themself. In the other hand the client has the option to just send information such as bank account or transfer amount and the API will check the condition for you.

## Disclaimer

* We're a service provider that provides omni channels for the clients to verify their slips.
* We're not associated with any banks transfer protocol or payment gateway. So we can't guarantee that the transaction was made or not. It's just a slip verification service that verifies with "Official Bank API".

## Slip2GO Base API Url

connect.slip2go.com/api

## List of contents

* Authentication
    - API Secret
    - IP Whitelist
* API Endpoint
    - Get slip information by QR-Code
    - Get slip information by QR Image
    - Get slip information by refId (checked slip)
    - Get account and package information
* Request Example
* Response Example
* Data Description

---



# Authentication

You need to get through the authentication step to use the Slip2Go API more safely.

## IP Whitelist

1. Slip2Go provide IP Whitelist feature that each shop can specify which IP that allowed to use "API Secret"
2. IP Whitelist was set as "*" by default, Which means any IP Addresses was allowed.
3. You can add or remove IP Address at any time, But the cap is at 10 IPs per shop.

## API Secret

1. To use Slip2GO API you need to attach an API secret in the header of every request.
   1.1. Header Key = "Authorization"
   1.2. Header Value = "Bearer {apiSecret}"
2. The "API Secret" can be found in the "API Connect" menu after you logged in to the system.
3. Each shop has only one API Secret at a time. And there is an option to regenerate new API Secret for any purposes.
4. You have to aware that when the "New API Secret" was regenerated, The previous API Secret will no longer be usable anymore.

## Description

<table>
    <tr>
        <td>Method</td>
<td>GET / POST *Depends on your endpoint you want to use.</td>
    </tr>
<tr>
        <td>Url</td>
<td>Depends on your endpoint you want to use.</td>
    </tr>
<tr>
        <td>Header</td>
<td>Authorization: Bearer {apiSecret}</td>
    </tr>
<tr>
        <td>Body</td>
<td>Depends on your endpoint you want to use.</td>
    </tr>
</table>



---


## Example (JavaScript)

```javascript
const axios = require('axios')
  let config = {
    method: 'GET',
    url: 'http://{apiUrl}/api/account/info',
    headers: {
      'Authorization': 'Bearer {secretKey}',
      'Content-Type': 'application/json'
    }
  };
  axios.request(config).then((response) => }
    console.log(JSON.stringify(response.data))
  }).catch((error) => {
    console.log(error)
  }
)
```

---



# API Endpoint

All API endpoints required authorization header. More information can be found at the "Authentication" section.

## Verify slip by QR-Code

<table>
    <tr>
        <td>Endpoint</td>
<td>/verify-slip/qr-code/info</td>
    </tr>
<tr>
        <td>Method</td>
<td>POST</td>
    </tr>
<tr>
        <td>Authorization</td>
<td>*required</td>
    </tr>
<tr>
        <td>Request Data</td>
<td>JSON Body</td>
    </tr>
<tr>
        <td>Description</td>
<td>This API needs QR-Code and condition as a request object. The
API will check QR Code is valid or not then check any condition as
you requested and send the final result as a response.</td>
    </tr>
</table>

## Request Information

<table>
    <thead>
    <tr>
        <th colspan="4">Key</th>
        <th>Type</th>
        <th>Description</th>
        <th>Example</th>
        <th>Required</th>
    </tr>
    </thead>
    <tr>
        <td colspan="4">payload</td>
<td>Object</td>
<td>Payload of data</td>
<td>{ payload: { … }}</td>
<td>✔</td>
    </tr>
<tr>
        <td></td>
        <td colspan="3">qrCode</td>
<td>String</td>
<td>Code that decoded from
QR Code</td>
<td>0123456789xxx</td>
<td>✔</td>
    </tr>
<tr>
        <td></td>
        <td colspan="3">checkCondition</td>
<td>Object</td>
<td>Condition information
*Set to check condition</td>
<td>{ ... }</td>
<td>𐄂</td>
    </tr>
<tr>
        <td></td>
<td></td>
        <td colspan="2">checkDuplicate</td>
<td>Boolean</td>
<td>Flag to check duplicate
*Set to check duplicate slip</td>
<td>true | false</td>
<td>𐄂</td>
    </tr>
<tr>
        <td></td>
<td></td>
        <td colspan="2">checkReceiver</td>
<td>Array</td>
<td>Array for check receiver
account
*Can set more than 1
condition
*matched only 1 condition the
result will be valid</td>
<td>[{ receiver1 }, {
receiever2 }, ...]</td>
<td>𐄂</td>
    </tr>
<tr>
        <td></td>
<td></td>
<td></td>
<td>accountType</td>
<td>String</td>
<td>Account type to check</td>
<td>“01004” = ธนาคาร
กสิกร</td>
<td>𐄂</td>
    </tr>
<tr>
        <td></td>
<td></td>
<td></td>
<td>accountNameTH</td>
<td>String</td>
<td>Receiver name in Thai to
check
*Partial check</td>
<td>"สมชาย สลิปทูโก"
*Don't set any prefix</td>
<td>𐄂</td>
    </tr>
</table>



---



<table>
    <thead>
    <tr>
        <th></th>
        <th></th>
        <th></th>
        <th>accountNameEN</th>
        <th>String</th>
        <th>Receiver name in English
to check
*Partial check</th>
        <th>"Somchay Slip2go"
*Don't set any prefix</th>
        <th>𐄂</th>
    </tr>
    </thead>
    <tr>
        <td></td>
<td></td>
<td></td>
<td>accountNumber</td>
<td>String</td>
<td>Account number to check
including merchantId,
phoneNumber and
citizenID in all others
account type.
*Partial check</td>
<td>"Xxxxxx1234
*Don't set any space or
special charactors</td>
<td>𐄂</td>
    </tr>
<tr>
        <td></td>
<td></td>
        <td colspan="2">checkAmount</td>
<td>Object</td>
<td>Check amount condition
*Set to check transfer
amount</td>
<td>{ ... }</td>
<td>𐄂</td>
    </tr>
<tr>
        <td></td>
<td></td>
<td></td>
<td>type</td>
<td>String</td>
<td>Condition type to check</td>
<td>"lte" = lesser than or
equal
"eq" = only equal
"gte" = greater than
or equal
*default is “eq”</td>
<td>𐄂</td>
    </tr>
<tr>
        <td></td>
<td></td>
<td></td>
<td>amount</td>
<td>String</td>
<td>Transfer amount</td>
<td>"10000"
*dont set 0 and ,</td>
<td>𐄂</td>
    </tr>
<tr>
        <td></td>
<td></td>
        <td colspan="2">checkDate</td>
<td>Object</td>
<td>Check date information
*Set to check transfer date</td>
<td>{ ... }</td>
<td>𐄂</td>
    </tr>
<tr>
        <td></td>
<td></td>
<td></td>
<td>type</td>
<td>String</td>
<td>Condition type to check</td>
<td>"lte" = lesser than or
equal
"eq" = only equal
"gte" = greater than
or equal
*default is “eq”</td>
<td>𐄂</td>
    </tr>
<tr>
        <td></td>
<td></td>
<td></td>
<td>date</td>
<td>DateISO</td>
<td>Transfer date in DateISO
format</td>
<td>"2025-10-05T14:48:
00.000Z"
*GMT time only</td>
<td>𐄂</td>
    </tr>
</table>



---


## Example Request (JSON)

### Without condition

```
Unset
{
    "payload": {
        "qrCode": "xxx-xxxx-xxxxxx"
    }
}
```

### With condition

```
Unset
{
    "payload": {
        "qrCode": "xxx-xxxx-xxxxxx",
        "checkCondition": {
            "checkDuplicate": true, // check duplicate *optional
            "checkReceiver": [ // check receiver info *optional
                { // check all info about receiver bank account
                    "accountType": "01004",
                    "accountNameTH": "สมชาย สลิปทูโก",
                    "accountNameEN": "Somchay Slip2go",
                    "accountNumber": "xxxxxx1234"
                },
                { // check only bank number
                    "accountNumber": "xxxxxx1234"
                },
                { // check only bank owner name
                    "accountNameTH": "สมชาย สลิปทูโก",
                    "accountNameEN": "Somchay Slip2go",
                }
            ],
            "checkAmount": { // check transfer amount *optional
                "type": "eq", // eq, gte, lte
                "amount": 10000
```

---


```json
    },
    "checkDate": { // check transfer date *optional
        "type": "eq" // eq, gte, lte
        "date": "2025-10-05T14:48:00.000Z" // GMT time
    }
}
```

---


# Response Information

<table>
    <thead>
    <tr>
        <th colspan="5">Key</th>
        <th>Type</th>
        <th>Description</th>
        <th>Example</th>
    </tr>
    </thead>
    <tr>
        <td colspan="5">code</td>
<td>String</td>
<td>The code represents the result.</td>
<td>“200000”</td>
    </tr>
<tr>
        <td colspan="5">message</td>
<td>String</td>
<td>The message represents the result.</td>
<td>“Slip found”</td>
    </tr>
<tr>
        <td colspan="5">data</td>
<td>Object</td>
<td>Slip information</td>
<td>{ ... }</td>
    </tr>
<tr>
        <td></td>
        <td colspan="4">referenceId</td>
<td>UUID</td>
<td>Slip2Go reference ID of slip</td>
<td>"92887bd5-60d3-4744-9a98-
b8574eaxxxxx-xx"</td>
    </tr>
<tr>
        <td></td>
        <td colspan="4">decode</td>
<td>String</td>
<td>Decoded qr code from slip</td>
<td>123456789xxx</td>
    </tr>
<tr>
        <td></td>
        <td colspan="4">transRef</td>
<td>String</td>
<td>Transfer reference from Bank.</td>
<td>“015073xxx5xxx12245”</td>
    </tr>
<tr>
        <td></td>
        <td colspan="4">dateTime</td>
<td>String</td>
<td>Transfer date</td>
<td>“2025-10-05T14:48:00.000Z”</td>
    </tr>
<tr>
        <td></td>
        <td colspan="4">amount</td>
<td>Number</td>
<td>Transfer amount</td>
<td>100</td>
    </tr>
<tr>
        <td></td>
        <td colspan="4">ref1</td>
<td>String</td>
<td>Reference data 1 from Bank.</td>
<td>“xxxxx” | null</td>
    </tr>
<tr>
        <td></td>
        <td colspan="4">ref2</td>
<td>String</td>
<td>Reference data 2 from Bank.</td>
<td>“xxxxx” | null</td>
    </tr>
<tr>
        <td></td>
        <td colspan="4">ref3</td>
<td>String</td>
<td>Reference data 3 from Bank.</td>
<td>“xxxxx” | null</td>
    </tr>
<tr>
        <td></td>
        <td colspan="4">receiver</td>
<td>Object</td>
<td>Receiver information</td>
<td>{ … }</td>
    </tr>
<tr>
        <td></td>
<td></td>
        <td colspan="3">account</td>
<td>Object</td>
<td>Receiver account information</td>
<td>{ … }</td>
    </tr>
<tr>
        <td></td>
<td></td>
<td></td>
        <td colspan="2">name</td>
<td>String</td>
<td>Receiver account name
*partial information</td>
<td></td>
    </tr>
<tr>
        <td></td>
<td></td>
<td></td>
        <td colspan="2">bank</td>
<td>Object</td>
<td>Receiver bank account information</td>
<td>{ … }</td>
    </tr>
<tr>
        <td></td>
<td></td>
<td></td>
<td></td>
<td>account</td>
<td>String</td>
<td>Receiver bank account number
*partial information</td>
<td>"Somchay Slip2go"</td>
    </tr>
<tr>
        <td></td>
<td></td>
<td></td>
        <td colspan="2">proxy</td>
<td>Object</td>
<td>Proxy information such as
PromptPay.</td>
<td>{ … }</td>
    </tr>
<tr>
        <td></td>
<td></td>
<td></td>
<td></td>
<td>type</td>
<td>String</td>
<td>Proxy account type including
NATID - CitizenID
MSISDN - Phone Number
EWALLTID - E Wallet
EMAIL - Email
BILLERID - Bill from biller such as
mobile banking
ORFT - Wallet from GSB (เป๋าตัง)</td>
<td>"NATID"</td>
    </tr>
<tr>
        <td></td>
<td></td>
<td></td>
<td></td>
<td>account</td>
<td>String</td>
<td>Proxy account number</td>
<td>"12850X500"</td>
    </tr>
<tr>
        <td></td>
<td></td>
        <td colspan="3">bank</td>
<td>Object</td>
<td>Receiver bank information</td>
<td>{ … }</td>
    </tr>
</table>



---



<table>
    <thead>
    <tr>
        <th></th>
        <th></th>
        <th></th>
        <th colspan="2">id</th>
        <th>String</th>
        <th>Receiver bank id</th>
        <th>“004”</th>
    </tr>
    </thead>
    <tr>
        <td></td>
<td></td>
<td></td>
        <td colspan="2">name</td>
<td>String</td>
<td>Receiver bank name</td>
<td>“ธนาคารกสิกรไทย”</td>
    </tr>
<tr>
        <td></td>
        <td colspan="4">sender</td>
<td>Object</td>
<td>Sender information</td>
<td>{ … }</td>
    </tr>
<tr>
        <td></td>
<td></td>
        <td colspan="3">account</td>
<td>Object</td>
<td>Sender account information</td>
<td>{ … }</td>
    </tr>
<tr>
        <td></td>
<td></td>
<td></td>
        <td colspan="2">name</td>
<td>String</td>
<td>Sender account name
*partial information</td>
<td>“xxx2Go xxVerifyxx”</td>
    </tr>
<tr>
        <td></td>
<td></td>
<td></td>
        <td colspan="2">bank</td>
<td>Object</td>
<td>Sender bank account information</td>
<td>{ … }</td>
    </tr>
<tr>
        <td></td>
<td></td>
<td></td>
<td></td>
<td>account</td>
<td>String</td>
<td>Sender bank account number
*partial information</td>
<td>“xxx-x-45xx-5”</td>
    </tr>
<tr>
        <td></td>
<td></td>
        <td colspan="3">bank</td>
<td>Object</td>
<td>Sender bank information</td>
<td>{ … }</td>
    </tr>
<tr>
        <td></td>
<td></td>
<td></td>
        <td colspan="2">id</td>
<td>String</td>
<td>Sender bank id</td>
<td>“025”</td>
    </tr>
<tr>
        <td></td>
<td></td>
<td></td>
        <td colspan="2">name</td>
<td>String</td>
<td>Sender bank name</td>
<td>“ธนาคารกรุงศรีอยุธยา”</td>
    </tr>
</table>

## Example Response (JSON)

Unset
```
{
     "code": "200000",
     "message": "Slip found",
     "data": {
          "referenceId": "92887bd5-60d3-4744-9a98-b8574eaxxxxx-xx",
          "decode": "20014242082547BPM049885102TH9104xxxx",
          "transRef": "015073144041ATF00999",
          "dateTime": "2025-10-05T14:48:00.000Z",
          "amount": 1,
          "ref1": null,
          "ref2": null,
          "ref3": null,
          "receiver": {
               "account": {
                    "name": "บริษัท สลิปทูโก จํากัด",
                    "bank": {
                         "account": "xxx-x-x5366-x"
                    },
```

---


```
"proxy": {
    "type": "NATID",
    "account": "xxx-x-x5366-x"
}
},
"bank": {
"id": "004",
"name": "ธนาคารกสิกรไทย"
}
},
"sender": {
"account": {
    "name": "บริษัท สลิปทูโก จำกัด",
    "bank": {
        "account": "xxx-x-x9866-x"
    }
},
"bank": {
    "id": "004",
    "name": "ธนาคารกสิกรไทย"
}
}
}
}
```

---


## Example Usage

### JavaScript

```javascript
const axios = require('axios')
let config = {
  method: 'POST',
  maxBodyLength: Infinity,
  url: '{apiUrl}/api/verify-slip/qr-code/info',
  headers: {
    'Authorization': 'Bearer {secretKey}'
  },
  data: {
    "payload": {
      "qrCode": "0123456789xxx" // decode from QR
    }
  }
}
axios.request(config).then((response) => {
  console.log(JSON.stringify(response.data))
}).catch((error) => {
  console.log(error)
})
```

### Curl

Unset

```
curl --location '{apiUrl}/api/verify-slip/qr-code/info' \

  --header 'Content-Type: application/json' \

  --header 'Authorization: Bearer {secretKey}' \

  --data '{

    "payload":{

      "qrCode":"xxxxxxxxxxxxxxxxxxxxx"

    }

  }'
```

---



# Verify slip by QR Image

<table>
    <tr>
        <td>Endpoint</td>
<td>/verify-slip/qr-image/info</td>
    </tr>
<tr>
        <td>Method</td>
<td>POST</td>
    </tr>
<tr>
        <td>Authorization</td>
<td>*required</td>
    </tr>
<tr>
        <td>Request Data</td>
<td>Multipart/Form-Data</td>
    </tr>
<tr>
        <td>Description</td>
<td>This API needs QR-Image as a file and condition object in
form data. The API will check the QR Code from the image
that is valid or not, then check any condition as you requested
and send the final result as a response.</td>
    </tr>
</table>

## Request Information

<table>
    <tr>
        <td>Key</td>
<td>Type</td>
<td>Description</td>
<td>Example</td>
<td>Required</td>
    </tr>
<tr>
        <td>file</td>
<td>File</td>
<td>Slip image file that want to
verify.</td>
<td>xxx.png</td>
<td>✔</td>
    </tr>
<tr>
        <td>payload</td>
<td>JSON</td>
<td>Condition information to
check slip.</td>
<td>{ …info below…}</td>
<td>𐄂</td>
    </tr>
</table>

## Payload (Set only when want to check condition for the slip)

<table>
    <thead>
    <tr>
        <th colspan="4">Key</th>
        <th>Type</th>
        <th>Description</th>
        <th>Example</th>
        <th>Required</th>
    </tr>
    </thead>
    <tr>
        <td></td>
<td></td>
        <td colspan="2">checkDuplicate</td>
<td>Boolean</td>
<td>Flag to check duplicate
*Set to check duplicate slip</td>
<td>true | false</td>
<td>𐄂</td>
    </tr>
<tr>
        <td></td>
<td></td>
        <td colspan="2">checkReceiver</td>
<td>Array</td>
<td>Array for check receiver
account
*Can set more than 1
condition
*matched only 1 condition the
result will be valid</td>
<td>[{ receiver1 }, {
receiever2 }, ...]</td>
<td>𐄂</td>
    </tr>
<tr>
        <td></td>
<td></td>
<td></td>
<td>accountType</td>
<td>String</td>
<td>Account type to check</td>
<td>“01004” = ธนาคาร
กสิกร</td>
<td>𐄂</td>
    </tr>
<tr>
        <td></td>
<td></td>
<td></td>
<td>accountNameTH</td>
<td>String</td>
<td>Receiver name in Thai to
check
*Partial check</td>
<td>"สมชาย สลิปทูโก"
*Don't set any prefix</td>
<td>𐄂</td>
    </tr>
<tr>
        <td></td>
<td></td>
<td></td>
<td>accountNameEN</td>
<td>String</td>
<td>Receiver name in English</td>
<td>"Somchay Slip2go"</td>
<td>𐄂</td>
    </tr>
</table>



---



<table>
    <thead>
    <tr>
        <th></th>
        <th></th>
        <th></th>
        <th></th>
        <th></th>
        <th>to check
*Partial check</th>
        <th>*Don't set any prefix</th>
        <th></th>
    </tr>
    </thead>
    <tr>
        <td></td>
<td></td>
<td></td>
<td>accountNumber</td>
<td>String</td>
<td>Account number to check
including merchantId,
phoneNumber and
citizenID in all others
account type.
*Partial check</td>
<td>"Xxxxxx1234
*Don't set any space or
special charactors</td>
<td>𐄂</td>
    </tr>
<tr>
        <td></td>
<td></td>
        <td colspan="2">checkAmount</td>
<td>Object</td>
<td>Check amount condition
*Set to check transfer
amount</td>
<td>{ ... }</td>
<td>𐄂</td>
    </tr>
<tr>
        <td></td>
<td></td>
<td></td>
<td>type</td>
<td>String</td>
<td>Condition type to check</td>
<td>"lte" = lesser than or
equal
"eq" = only equal
"gte" = greater than
or equal
*default is “eq”</td>
<td>𐄂</td>
    </tr>
<tr>
        <td></td>
<td></td>
<td></td>
<td>amount</td>
<td>String</td>
<td>Transfer amount</td>
<td>"10000"
*dont set 0 and ,</td>
<td>𐄂</td>
    </tr>
<tr>
        <td></td>
<td></td>
        <td colspan="2">checkDate</td>
<td>Object</td>
<td>Check date information
*Set to check transfer date</td>
<td>{ ... }</td>
<td>𐄂</td>
    </tr>
<tr>
        <td></td>
<td></td>
<td></td>
<td>type</td>
<td>String</td>
<td>Condition type to check</td>
<td>"lte" = lesser than or
equal
"eq" = only equal
"gte" = greater than
or equal
*default is “eq”</td>
<td>𐄂</td>
    </tr>
<tr>
        <td></td>
<td></td>
<td></td>
<td>date</td>
<td>DateISO</td>
<td>Transfer date in DateISO
format</td>
<td>"2025-10-05T14:48:
00.000Z"
*GMT time only</td>
<td>𐄂</td>
    </tr>
</table>



---


# Example Payload

Unset

```
{
    "checkDuplicate": true, // set to check duplicate
    "checkReceiver": [{ // set to check receiver account
        "accountType": "01004",
        "accountNameTH": "สมชาย สลิปทูโก",
        "accountNameEN": "Somchay Slip2go",
        "accountNumber": "xxxxxx1234"
    }],
    "checkAmount": { // set to check transfer amount
        "type": "eq", // eq, gte, lte
        "amount": 10000
    }
}
```

---


# Response Information

<table>
    <thead>
    <tr>
        <th colspan="5">Key</th>
        <th>Type</th>
        <th>Description</th>
        <th>Example</th>
    </tr>
    </thead>
    <tr>
        <td colspan="5">code</td>
<td>String</td>
<td>The code represents the result.</td>
<td>“200000”</td>
    </tr>
<tr>
        <td colspan="5">message</td>
<td>String</td>
<td>The message represents the result.</td>
<td>“Slip found”</td>
    </tr>
<tr>
        <td colspan="5">data</td>
<td>Object</td>
<td>Slip information</td>
<td>{ ... }</td>
    </tr>
<tr>
        <td></td>
        <td colspan="4">referenceId</td>
<td>UUID</td>
<td>Slip2Go reference ID of slip</td>
<td>"92887bd5-60d3-4744-9a98-
b8574eaxxxxx-xx"</td>
    </tr>
<tr>
        <td></td>
        <td colspan="4">decode</td>
<td>String</td>
<td>Decoded qr code from slip</td>
<td>123456789xxx</td>
    </tr>
<tr>
        <td></td>
        <td colspan="4">transRef</td>
<td>String</td>
<td>Transfer reference from Bank.</td>
<td>“015073xxx5xxx12245”</td>
    </tr>
<tr>
        <td></td>
        <td colspan="4">dateTime</td>
<td>String</td>
<td>Transfer date</td>
<td>“2025-10-05T14:48:00.000Z”</td>
    </tr>
<tr>
        <td></td>
        <td colspan="4">amount</td>
<td>Number</td>
<td>Transfer amount</td>
<td>100</td>
    </tr>
<tr>
        <td></td>
        <td colspan="4">ref1</td>
<td>String</td>
<td>Reference data 1 from Bank.</td>
<td>“xxxxx” | null</td>
    </tr>
<tr>
        <td></td>
        <td colspan="4">ref2</td>
<td>String</td>
<td>Reference data 2 from Bank.</td>
<td>“xxxxx” | null</td>
    </tr>
<tr>
        <td></td>
        <td colspan="4">ref3</td>
<td>String</td>
<td>Reference data 3 from Bank.</td>
<td>“xxxxx” | null</td>
    </tr>
<tr>
        <td></td>
        <td colspan="4">receiver</td>
<td>Object</td>
<td>Receiver information</td>
<td>{ … }</td>
    </tr>
<tr>
        <td></td>
<td></td>
        <td colspan="3">account</td>
<td>Object</td>
<td>Receiver account information</td>
<td>{ … }</td>
    </tr>
<tr>
        <td></td>
<td></td>
<td></td>
        <td colspan="2">name</td>
<td>String</td>
<td>Receiver account name
*partial information</td>
<td></td>
    </tr>
<tr>
        <td></td>
<td></td>
<td></td>
        <td colspan="2">bank</td>
<td>Object</td>
<td>Receiver bank account information</td>
<td>{ … }</td>
    </tr>
<tr>
        <td></td>
<td></td>
<td></td>
<td></td>
<td>account</td>
<td>String</td>
<td>Receiver bank account number
*partial information</td>
<td>"Somchay Slip2go"</td>
    </tr>
<tr>
        <td></td>
<td></td>
<td></td>
        <td colspan="2">proxy</td>
<td>Object</td>
<td>Proxy information such as
PromptPay.</td>
<td>{ … }</td>
    </tr>
<tr>
        <td></td>
<td></td>
<td></td>
<td></td>
<td>type</td>
<td>String</td>
<td>Proxy account type including
NATID - CitizenID
MSISDN - Phone Number
EWALLTID - E Wallet
EMAIL - Email
BILLERID - Bill from biller such as
mobile banking
ORFT - Wallet from GSB (เป๋าตัง)</td>
<td>"NATID"</td>
    </tr>
<tr>
        <td></td>
<td></td>
<td></td>
<td></td>
<td>account</td>
<td>String</td>
<td>Proxy account number</td>
<td>"12850X500"</td>
    </tr>
<tr>
        <td></td>
<td></td>
        <td colspan="3">bank</td>
<td>Object</td>
<td>Receiver bank information</td>
<td>{ … }</td>
    </tr>
</table>



---



<table>
    <thead>
    <tr>
        <th></th>
        <th></th>
        <th></th>
        <th colspan="2">id</th>
        <th>String</th>
        <th>Receiver bank id</th>
        <th>“004”</th>
    </tr>
    </thead>
    <tr>
        <td></td>
<td></td>
<td></td>
        <td colspan="2">name</td>
<td>String</td>
<td>Receiver bank name</td>
<td>“ธนาคารกสิกรไทย”</td>
    </tr>
<tr>
        <td></td>
        <td colspan="4">sender</td>
<td>Object</td>
<td>Sender information</td>
<td>{ … }</td>
    </tr>
<tr>
        <td></td>
<td></td>
        <td colspan="3">account</td>
<td>Object</td>
<td>Sender account information</td>
<td>{ … }</td>
    </tr>
<tr>
        <td></td>
<td></td>
<td></td>
        <td colspan="2">name</td>
<td>String</td>
<td>Sender account name
*partial information</td>
<td>“xxx2Go xxVerifyxx”</td>
    </tr>
<tr>
        <td></td>
<td></td>
<td></td>
        <td colspan="2">bank</td>
<td>Object</td>
<td>Sender bank account information</td>
<td>{ … }</td>
    </tr>
<tr>
        <td></td>
<td></td>
<td></td>
<td></td>
<td>account</td>
<td>String</td>
<td>Sender bank account number
*partial information</td>
<td>“xxx-x-45xx-5”</td>
    </tr>
<tr>
        <td></td>
<td></td>
        <td colspan="3">bank</td>
<td>Object</td>
<td>Sender bank information</td>
<td>{ … }</td>
    </tr>
<tr>
        <td></td>
<td></td>
<td></td>
        <td colspan="2">id</td>
<td>String</td>
<td>Sender bank id</td>
<td>“025”</td>
    </tr>
<tr>
        <td></td>
<td></td>
<td></td>
        <td colspan="2">name</td>
<td>String</td>
<td>Sender bank name</td>
<td>“ธนาคารกรุงศรีอยุธยา”</td>
    </tr>
</table>

## Example Response (JSON)

Unset
```
{
    "code": "200000",
    "message": "Slip found",
    "data": {
        "referenceId": "92887bd5-60d3-4744-9a98-b8574eaxxxxx-xx",
        "decode": "20014242082547BPM049885102TH9104xxxx",
        "transRef": "015073144041ATF00999",
        "dateTime": "2025-10-05T14:48:00.000Z",
        "amount": 1,
        "ref1": null,
        "ref2": null,
        "ref3": null,
        "receiver": {
            "account": {
                "name": "บริษัท สลิปทูโก จํากัด",
                "bank": {
                    "account": "xxx-x-x5366-x"
```

---


```json
    },
    "proxy": {
        "type": "NATID",
        "account": "xxx-x-x5366-x"
    }
  },
  "bank": {
    "id": "004",
    "name": "ธนาคารกสิกรไทย"
  }
},
"sender": {
  "account": {
    "name": "บริษัท สลิปทูโก จำกัด",
    "bank": {
        "account": "xxx-x-x9866-x"
    }
  },
  "bank": {
    "id": "004",
    "name": "ธนาคารกสิกรไทย"
  }
}
}
}
```

---


## Example Usage

### JavaScript

```javascript
const axios = require('axios');
const data = new FormData();
const payload = {
    checkDuplicate: true,
    checkReceiver: [{
        accountType: '01004',
        accountNameTH: 'สมชาย สายไหม',
        accountNameEN 'Somchay Saimai',
        accountNumber: 'xxxxxxx1234'
    }],
    checkAmount: {
        type: 'eq',
        amount: 200.31
    }
}

data.append('file',
fs.createReadStream('/Users/Desktop/slip.jpg'));
data.append('payload', JSON.stringify(payload))

let config = {
    method: 'post',
    maxBodyLength: Infinity,
    url: '{apiUrl}/api/verify-slip/qr-image/info',
    headers: {
        'Authorization': 'Bearer {apiSecret}'
    },
    data : data
};

axios.request(config).then((response) => {
    console.log(JSON.stringify(response.data));
})
.catch((error) => {
    console.log(error);
});
```

---



# Curl

Unset

```
curl --location '{apiUrl}/api/verify-slip/qr-image/info' \

  --header 'Authorization: Bearer {secretKey}' \

  --form 'file=@"/Users/Chay/Desktop/slip.jpg"' \

  --form 'payload="{

    checkDuplicate: true,

    checkReceiver: [{

      accountType: '01004',

      accountNameTH: 'สมชาย สายไหม',

      accountNameEN 'Somchay Saimai',

      accountNumber: 'xxxxxxx1234'

    }],

    checkAmount: {

      type: 'eq',

      amount: 200.31

    }

  }"'
```

---



# Get slip by referenceId (Get verified slip)

<table>
    <tr>
        <td>Endpoint</td>
<td>/verify-slip/{referenceId}</td>
    </tr>
<tr>
        <td>Method</td>
<td>GET</td>
    </tr>
<tr>
        <td>Authorization</td>
<td>*required</td>
    </tr>
<tr>
        <td>Request Data</td>
<td>Request Params</td>
    </tr>
<tr>
        <td>Description</td>
<td>This API is to get the information of a verified slip without
paying any quota. Just send a reference ID and you will get
the whole slip information.</td>
    </tr>
</table>

## Request Information

<table>
    <thead>
    <tr>
        <th>Key</th>
        <th>Type</th>
        <th>Description</th>
        <th>Example</th>
        <th>Required</th>
    </tr>
    </thead>
    <tr>
        <td>referenceId</td>
<td>UUID</td>
<td>Slip reference ID from slip
that already scanned.</td>
<td>"92887bd5-60d3-47
44-9a98-b8574eaxx
xxx-xx"</td>
<td>✔</td>
    </tr>
</table>

## Response Information

<table>
    <thead>
    <tr>
        <th colspan="2">Key</th>
        <th>Type</th>
        <th>Description</th>
        <th>Example</th>
    </tr>
    </thead>
    <tr>
        <td colspan="2">code</td>
<td>String</td>
<td>The code represents the result.</td>
<td>“200000”</td>
    </tr>
<tr>
        <td colspan="2">message</td>
<td>String</td>
<td>The message represents the result.</td>
<td>“Slip found”</td>
    </tr>
<tr>
        <td colspan="2">data</td>
<td>Object</td>
<td>Slip information</td>
<td>{ ... }</td>
    </tr>
<tr>
        <td></td>
<td>referenceId</td>
<td>UUID</td>
<td>Slip2Go reference ID of slip</td>
<td>"92887bd5-60d3-4744-9a98-
b8574eaxxxxx-xx"</td>
    </tr>
<tr>
        <td></td>
<td>decode</td>
<td>String</td>
<td>Decoded qr code from slip</td>
<td>123456789xxx</td>
    </tr>
<tr>
        <td></td>
<td>transRef</td>
<td>String</td>
<td>Transfer reference from Bank.</td>
<td>“015073xxx5xxx12245”</td>
    </tr>
<tr>
        <td></td>
<td>dateTime</td>
<td>String</td>
<td>Transfer date</td>
<td>“2025-10-05T14:48:00.000Z”</td>
    </tr>
<tr>
        <td></td>
<td>verifyDate</td>
<td>String</td>
<td>First verify date time of the slip.</td>
<td>“2025-10-05T14:48:00.000Z”</td>
    </tr>
<tr>
        <td></td>
<td>amount</td>
<td>Number</td>
<td>Transfer amount</td>
<td>100</td>
    </tr>
<tr>
        <td></td>
<td>ref1</td>
<td>String</td>
<td>Reference data 1 from Bank.</td>
<td>“xxxxx” | null</td>
    </tr>
</table>



---



<table>
    <thead>
    <tr>
        <th></th>
        <th colspan="4">ref2</th>
        <th>String</th>
        <th>Reference data 2 from Bank.</th>
        <th>“xxxxx” | null</th>
    </tr>
    </thead>
    <tr>
        <td></td>
        <td colspan="4">ref3</td>
<td>String</td>
<td>Reference data 3 from Bank.</td>
<td>“xxxxx” | null</td>
    </tr>
<tr>
        <td></td>
        <td colspan="4">receiver</td>
<td>Object</td>
<td>Receiver information</td>
<td>{ … }</td>
    </tr>
<tr>
        <td></td>
<td></td>
        <td colspan="3">account</td>
<td>Object</td>
<td>Receiver account information</td>
<td>{ … }</td>
    </tr>
<tr>
        <td></td>
<td></td>
<td></td>
        <td colspan="2">name</td>
<td>String</td>
<td>Receiver account name
*partial information</td>
<td></td>
    </tr>
<tr>
        <td></td>
<td></td>
<td></td>
        <td colspan="2">bank</td>
<td>Object</td>
<td>Receiver bank account information</td>
<td>{ … }</td>
    </tr>
<tr>
        <td></td>
<td></td>
<td></td>
<td></td>
<td>account</td>
<td>String</td>
<td>Receiver bank account number
*partial information</td>
<td>"Somchay Slip2go"</td>
    </tr>
<tr>
        <td></td>
<td></td>
<td></td>
        <td colspan="2">proxy</td>
<td>Object</td>
<td>Proxy information such as
PromptPay.</td>
<td>{ … }</td>
    </tr>
<tr>
        <td></td>
<td></td>
<td></td>
<td></td>
<td>type</td>
<td>String</td>
<td>Proxy account type including
NATID - CitizenID
MSISDN - Phone Number
EWALLTID - E Wallet
EMAIL - Email
BILLERID - Bill from biller such as
mobile banking
ORFT - Wallet from GSB (เป๋าตัง)</td>
<td>"NATID"</td>
    </tr>
<tr>
        <td></td>
<td></td>
<td></td>
<td></td>
<td>account</td>
<td>String</td>
<td>Proxy account number</td>
<td>"12850X500"</td>
    </tr>
<tr>
        <td></td>
<td></td>
        <td colspan="3">bank</td>
<td>Object</td>
<td>Receiver bank information</td>
<td>{ … }</td>
    </tr>
<tr>
        <td></td>
<td></td>
<td></td>
        <td colspan="2">id</td>
<td>String</td>
<td>Receiver bank id</td>
<td>“004”</td>
    </tr>
<tr>
        <td></td>
<td></td>
<td></td>
        <td colspan="2">name</td>
<td>String</td>
<td>Receiver bank name</td>
<td>“ธนาคารกสิกรไทย”</td>
    </tr>
<tr>
        <td></td>
        <td colspan="4">sender</td>
<td>Object</td>
<td>Sender information</td>
<td>{ … }</td>
    </tr>
<tr>
        <td></td>
<td></td>
        <td colspan="3">account</td>
<td>Object</td>
<td>Sender account information</td>
<td>{ … }</td>
    </tr>
<tr>
        <td></td>
<td></td>
<td></td>
        <td colspan="2">name</td>
<td>String</td>
<td>Sender account name
*partial information</td>
<td>“xxx2Go xxVerifyxx”</td>
    </tr>
<tr>
        <td></td>
<td></td>
<td></td>
        <td colspan="2">bank</td>
<td>Object</td>
<td>Sender bank account information</td>
<td>{ … }</td>
    </tr>
<tr>
        <td></td>
<td></td>
<td></td>
<td></td>
<td>account</td>
<td>String</td>
<td>Sender bank account number
*partial information</td>
<td>“xxx-x-45xx-5”</td>
    </tr>
<tr>
        <td></td>
<td></td>
        <td colspan="3">bank</td>
<td>Object</td>
<td>Sender bank information</td>
<td>{ … }</td>
    </tr>
<tr>
        <td></td>
<td></td>
<td></td>
        <td colspan="2">id</td>
<td>String</td>
<td>Sender bank id</td>
<td>“025”</td>
    </tr>
<tr>
        <td></td>
<td></td>
<td></td>
        <td colspan="2">name</td>
<td>String</td>
<td>Sender bank name</td>
<td>“ธนาคารกรุงศรีอยุธยา”</td>
    </tr>
</table>



---


## Example Response (JSON)

Unset
```json
{
    "code": "200000",
    "message": "Slip found",
    "data": {
        "referenceId": "92887bd5-60d3-4744-9a98-b8574eaxxxxx-xx",
        "decode": "20014242082547BPM049885102TH9104xxxx",
        "transRef": "015073144041ATF00999",
        "dateTime": "2025-10-05T14:48:00.000Z",
        "verifyDate": "2025-10-05T14:48:00.000Z",
        "amount": 1,
        "ref1": null,
        "ref2": null,
        "ref3": null,
        "receiver": {
            "account": {
                "name": "บริษัท สลิปทูโก จำกัด",
                "bank": {
                    "account": "xxx-x-x5366-x"
                },
                "proxy": {
                    "type": "NATID",
                    "account": "xxx-x-x5366-x"
                }
            },
            "bank": {
                "id": "004",
                "name": "ธนาคารกสิกรไทย"
            }
        },
        "sender": {
            "account": {
                "name": "บริษัท สลิปทูโก จำกัด",
                "bank": {
                    "account": "xxx-x-x9866-x"
```

---



```
        }
      },
      "bank": {
        "id": "004",
        "name": "ธนาคารกสิกรไทย"
      }
    }
  }
}
```

## Example Usage

### JavaScript

JavaScript
```
const axios = require('axios')
let config = {
  method: 'GET',
  url: '{apiUrl}/api/verify-slip/{referenceId}',
  headers: {
    'Authorization': 'Bearer {secretKey}',
  },
}
axios.request(config).then((response) => {
  console.log(JSON.stringify(response.data))
}).catch((error) => {
  console.log(error)
})
```

### Curl

Unset
```
curl --location '{apiUrl}/api/verify-slip/{referenceId}' \
     --header "Authorization: Bearer {secretKey}"
```

---



# Get account information

<table>
    <tr>
        <td>Endpoint</td>
<td>/account/info</td>
    </tr>
<tr>
        <td>Method</td>
<td>GET</td>
    </tr>
<tr>
        <td>Authorization</td>
<td>*required</td>
    </tr>
<tr>
        <td>Request Data</td>
<td>No</td>
    </tr>
<tr>
        <td>Description</td>
<td>This API is for anyone want the information of a checked slip
without paying any quota. Just send a referenceId and you
will get the whole same slip information as last time.</td>
    </tr>
</table>

## Request Information

* Only auth is required for this endpoint.

## Response Information

<table>
    <thead>
    <tr>
        <th colspan="2">Key</th>
        <th>Type</th>
        <th>Description</th>
        <th>Example</th>
    </tr>
    </thead>
    <tr>
        <td colspan="2">code</td>
<td>String</td>
<td>The code represents the result.</td>
<td>“200001”</td>
    </tr>
<tr>
        <td colspan="2">message</td>
<td>String</td>
<td>The message represents the
result.</td>
<td>“Get Info Success”</td>
    </tr>
<tr>
        <td colspan="2">data</td>
<td>Object</td>
<td>Account information</td>
<td>{ ... }</td>
    </tr>
<tr>
        <td></td>
<td>shopName</td>
<td>String</td>
<td>Shop name</td>
<td>“Slip2Go Shop”</td>
    </tr>
<tr>
        <td></td>
<td>package</td>
<td>String</td>
<td>Current package name</td>
<td>“BASIC-1”</td>
    </tr>
<tr>
        <td></td>
<td>packageExpiredDate</td>
<td>DateISO</td>
<td>Current package expire date</td>
<td>“2025-10-05T14:48:00.000Z”</td>
    </tr>
<tr>
        <td></td>
<td>quotaLimit</td>
<td>Number</td>
<td>Maximum quota of current
package</td>
<td>400</td>
    </tr>
<tr>
        <td></td>
<td>quotaRemaining</td>
<td>Number</td>
<td>Quota available</td>
<td>100</td>
    </tr>
<tr>
        <td></td>
<td>creditRemaining</td>
<td>Number</td>
<td>Credit available</td>
<td>100</td>
    </tr>
<tr>
        <td></td>
<td>autoRenewalPackage</td>
<td>Boolean</td>
<td>Package renewal setting</td>
<td>true | false</td>
    </tr>
<tr>
        <td></td>
<td>checkSlipByCredit</td>
<td>Boolean</td>
<td>Scan by credit setting</td>
<td>true | false</td>
    </tr>
</table>



---


## Example Response Object (JSON)

```
Unset
{

    "code": "200001",

    "message": "Get Info Success",

    "data": {

        "shopName": "Slip2Go Shop",

        "package": "BASIC-1",

        "packageExpiredDate": "2025-04-23T08:32:45.123Z"

        "quotaLimit": 400,

        "quotaRemaining": 100,

        "creditRemaining": 0,

        "autoRenewalPackage": false,

        "checkSlipByCredit": false

    }

}
```