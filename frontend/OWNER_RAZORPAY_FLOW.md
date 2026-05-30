# Owner Razorpay Account Flow

This project uses the direct merchant model:

1. Every shop owner connects their own Razorpay account.
2. The backend stores that owner's Razorpay `key_id` and encrypted `key_secret`.
3. When that owner creates a mandate/payment link, the backend uses that owner's Razorpay credentials.
4. Razorpay debits the customer and settles the money to the bank account attached to that owner's Razorpay KYC.
5. The RecurPay website only manages agreements, payment status, reminders, and records.

## Frontend Contract

The frontend now expects these backend endpoints:

### `GET /api/auth/razorpay-account`

Return the logged-in owner's Razorpay setup without exposing the secret.

```json
{
  "success": true,
  "razorpayAccount": {
    "keyId": "rzp_test_xxxxx",
    "mode": "test",
    "isConfigured": true
  }
}
```

### `PUT /api/auth/razorpay-account`

Save or update the logged-in owner's Razorpay credentials.

Request:

```json
{
  "keyId": "rzp_test_xxxxx",
  "keySecret": "secret_from_razorpay_dashboard",
  "mode": "test"
}
```

Backend requirements:

- Validate that `keyId` starts with `rzp_test_` when mode is `test`.
- Validate that `keyId` starts with `rzp_live_` when mode is `live`.
- Encrypt `keySecret` before saving it.
- Never return `keySecret` to the browser.
- Return the updated user with `razorpayAccount.isConfigured = true` so mandate creation unlocks.

Suggested user shape:

```json
{
  "razorpayAccount": {
    "keyId": "rzp_test_xxxxx",
    "keySecretEncrypted": "...",
    "mode": "test",
    "isConfigured": true,
    "updatedAt": "2026-05-06T00:00:00.000Z"
  }
}
```

### `POST /api/razorpay/initiate`

This endpoint must create the Razorpay payment link/subscription using the logged-in owner's stored Razorpay credentials, not global developer credentials.

Request from frontend:

```json
{
  "mandateId": "MANDATE-123",
  "customerEmail": "customer@example.com",
  "customerPhone": "9876543210",
  "ownerPaymentAccount": "connected-razorpay"
}
```

Backend behavior:

1. Authenticate the owner from the bearer token.
2. Find the mandate and verify it belongs to that owner.
3. Load the owner's Razorpay account credentials.
4. Decrypt `keySecretEncrypted` only in memory.
5. Create the Razorpay client with that owner's `keyId` and `keySecret`.
6. Create the payment link/subscription.
7. Save Razorpay ids and `short_url` against the mandate.
8. Return:

```json
{
  "success": true,
  "data": {
    "shortUrl": "https://rzp.io/i/xxxxx"
  }
}
```

## Professor Explanation

In live mode, the customer is debited by Razorpay under the selected shop owner's Razorpay account. Because the payment is created with the shop owner's own Razorpay credentials, Razorpay settles the collected amount to that shop owner's KYC bank account. The website developer's bank account is not used for settlement.
