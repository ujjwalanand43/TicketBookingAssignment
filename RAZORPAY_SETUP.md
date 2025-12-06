# Razorpay Integration Setup

## Required Credentials

To enable Razorpay payment gateway, you need the following credentials:

### 1. Razorpay Key ID
- This is your public key that will be used in the frontend
- Format: `rzp_test_XXXXXXXXXXXX` (for test mode) or `rzp_live_XXXXXXXXXXXX` (for live mode)

### 2. Razorpay Key Secret
- This is your private key (keep it secure, only use on backend)
- Format: A long alphanumeric string

## How to Get Razorpay Credentials

1. **Sign up for Razorpay Account**
   - Go to https://razorpay.com/
   - Click "Sign Up" and create an account
   - Complete the verification process

2. **Get Test Credentials**
   - Login to Razorpay Dashboard
   - Go to Settings → API Keys
   - Click "Generate Test Key"
   - You'll see:
     - Key ID (starts with `rzp_test_`)
     - Key Secret (click to reveal)

3. **For Production (Live Mode)**
   - Complete KYC verification
   - Activate your account
   - Generate Live Keys from the same API Keys section

## Configuration Steps

### Step 1: Update Frontend (public/app.js)

Find this line in `public/app.js`:
```javascript
key: 'rzp_test_YOUR_KEY_ID', // Replace with your Razorpay key
```

Replace `rzp_test_YOUR_KEY_ID` with your actual Razorpay Key ID.

### Step 2: Add to Environment Variables (Optional for Backend)

If you want to verify payments on the backend, add to `.env`:
```
RAZORPAY_KEY_ID=rzp_test_XXXXXXXXXXXX
RAZORPAY_KEY_SECRET=your_secret_key_here
```

## Test Mode

Razorpay provides test cards for testing:

### Test Card Details:
- **Card Number**: 4111 1111 1111 1111
- **CVV**: Any 3 digits
- **Expiry**: Any future date
- **Name**: Any name

### Test UPI:
- **UPI ID**: success@razorpay

### Test Netbanking:
- Select any bank and use the test credentials provided

## Important Notes

1. **Test Mode**: Always use test keys during development
2. **Security**: Never commit your Key Secret to version control
3. **Webhook**: For production, set up webhooks to verify payments
4. **Amount**: Razorpay accepts amount in paise (multiply by 100)

## Current Implementation

The payment flow:
1. User selects seats
2. Clicks "Pay with Razorpay"
3. Razorpay popup opens with payment options
4. User completes payment
5. On success, booking is created in database
6. Ticket is displayed to user

## Need Help?

- Razorpay Documentation: https://razorpay.com/docs/
- Test Credentials: https://razorpay.com/docs/payments/payments/test-card-details/
- Support: https://razorpay.com/support/
