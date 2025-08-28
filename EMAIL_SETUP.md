# Email Setup Guide

## Issue: Emails Only Sent to Specific Addresses

If emails are only being delivered to `bombezzang100@gmail.com` but not to other recipients, this is due to **Resend's sandbox domain restrictions**.

## Root Cause

The current configuration uses `onboarding@resend.dev` as the sender address, which is Resend's sandbox domain. **Sandbox domains only deliver emails to verified email addresses** for security reasons.

## Solutions

### Option 1: Add Custom Domain (Recommended)

1. **Purchase a Domain** (if you don't have one)
   - Any domain registrar (Namecheap, GoDaddy, Google Domains, etc.)

2. **Add Domain to Resend**
   - Go to [Resend Dashboard](https://resend.com/domains)
   - Click "Add Domain"
   - Enter your domain (e.g., `yourdomain.com`)

3. **Verify Domain**
   - Add the required DNS records provided by Resend
   - Wait for verification (usually takes a few minutes to hours)

4. **Update Environment Variables**
   ```env
   EMAIL_FROM_ADDRESS=noreply@yourdomain.com
   # or
   EMAIL_FROM_ADDRESS=contact@yourdomain.com
   ```

5. **Redeploy** your application

### Option 2: Verify Individual Email Addresses (Limited)

1. Go to [Resend Dashboard](https://resend.com/emails)
2. Add individual email addresses you want to send to
3. Each recipient must verify their email

**Note**: This is not practical for a landing page builder where recipients are dynamic.

### Option 3: Alternative Email Services

If setting up a custom domain is not feasible, consider:

1. **EmailJS** - Frontend-only email service
2. **Formspree** - Form submission service with email forwarding
3. **Netlify Forms** - If deployed on Netlify

## Current Configuration

- **Resend API Key**: Configured ✅
- **From Address**: `onboarding@resend.dev` (sandbox domain) ⚠️
- **Limitation**: Only delivers to verified addresses

## Testing

Use the test endpoint to verify email delivery:

```bash
curl -X POST https://easy-landing-omega.vercel.app/api/test-resend \
  -H "Content-Type: application/json" \
  -d '{"recipientEmail": "test@example.com", "testMessage": "Testing email delivery"}'
```

## Recommended Next Steps

1. **Immediate**: Set up a custom domain in Resend
2. **Update**: Change `EMAIL_FROM_ADDRESS` to use your custom domain
3. **Test**: Verify emails are delivered to any recipient
4. **Deploy**: Push changes to production

## Support

- [Resend Documentation](https://resend.com/docs)
- [Resend Domain Setup](https://resend.com/docs/send-with-domains)
- [DNS Configuration Help](https://resend.com/docs/dashboard/domains/introduction)