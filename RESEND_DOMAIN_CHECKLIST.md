# Resend Domain Configuration Checklist

## ✅ Prerequisites
- [ ] Domain registered and active (kanomsoft.com)
- [ ] Access to DNS management for the domain
- [ ] Resend account with API key

## ✅ Step 1: Add Domain to Resend
1. Go to [Resend Domains](https://resend.com/domains)
2. Click "Add Domain"
3. Enter: `kanomsoft.com`
4. Click "Add"

## ✅ Step 2: Configure DNS Records

You need to add these DNS records for `kanomsoft.com`:

### SPF Record (TXT)
- **Type**: TXT
- **Name**: @ (or blank)
- **Value**: `v=spf1 include:amazonses.com ~all`

### DKIM Records (CNAME)
Resend will provide 3 CNAME records like:
- **resend._domainkey** → resend.XXXX.dkim.amazonses.com
- **resend2._domainkey** → resend.XXXX.dkim.amazonses.com  
- **resend3._domainkey** → resend.XXXX.dkim.amazonses.com

### Optional but Recommended: DMARC Record
- **Type**: TXT
- **Name**: _dmarc
- **Value**: `v=DMARC1; p=none; rua=mailto:dmarc@kanomsoft.com`

## ✅ Step 3: Verify Domain Status

1. After adding DNS records, go back to [Resend Domains](https://resend.com/domains)
2. Look for `kanomsoft.com`
3. Status should show:
   - **Pending** → DNS propagating (wait 15-60 minutes)
   - **Verified** ✅ → Ready to send emails

## ✅ Step 4: Update Environment Variables

### Local (.env.local)
```env
EMAIL_FROM_ADDRESS=noreply@kanomsoft.com
# or
EMAIL_FROM_ADDRESS=contact@kanomsoft.com
# or
EMAIL_FROM_ADDRESS=hello@kanomsoft.com
```

### Vercel Dashboard
1. Go to [Vercel Project Settings](https://vercel.com/dashboard)
2. Select your project
3. Go to Settings → Environment Variables
4. Update `EMAIL_FROM_ADDRESS` to `noreply@kanomsoft.com`
5. Redeploy

## ✅ Step 5: Test Email Sending

Use the debug endpoint:
```bash
curl -X POST https://easy-landing-omega.vercel.app/api/debug-resend \
  -H "Content-Type: application/json" \
  -d '{"recipientEmail": "test@example.com"}'
```

## Common Issues & Solutions

### Issue: "Invalid sender domain"
**Solution**: Domain not verified. Check DNS records and wait for propagation.

### Issue: "From address doesn't match verified domain"
**Solution**: Ensure `EMAIL_FROM_ADDRESS` uses the verified domain (e.g., `noreply@kanomsoft.com`)

### Issue: Emails sent but not received
**Possible causes**:
1. DNS not fully propagated (wait 24-48 hours)
2. Emails in spam/junk folder
3. Recipient server blocking new domains
4. Missing or incorrect DMARC/SPF records

### Issue: "API key not authorized for this domain"
**Solution**: Ensure you're using the correct API key for the account that owns the domain.

## Testing Checklist
- [ ] Domain shows as "Verified" in Resend dashboard
- [ ] EMAIL_FROM_ADDRESS updated to full email format
- [ ] Environment variable updated in Vercel
- [ ] Application redeployed
- [ ] Test email sent to personal address
- [ ] Test email sent to different domain
- [ ] Check spam folders

## Debug Information

Check current configuration:
```bash
curl https://easy-landing-omega.vercel.app/api/debug-resend
```

View Resend logs:
- [Resend Email Logs](https://resend.com/emails)
- Check for bounces, failures, or delivery issues

## Support Resources
- [Resend Domain Setup Guide](https://resend.com/docs/dashboard/domains/introduction)
- [DNS Configuration Help](https://resend.com/docs/dashboard/domains/dns-configuration)
- [Troubleshooting Guide](https://resend.com/docs/troubleshooting)