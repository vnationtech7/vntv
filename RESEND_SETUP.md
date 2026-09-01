# Resend Email Service Setup

## ✅ Step 1: Install Package (DONE)
```bash
npm install resend
```

## ✅ Step 2: Code Integration (DONE)
- `lib/email/newsletter.ts` updated with Resend integration
- Automatic fallback to console logging if no API key (development mode)

---

## 🔑 Step 3: Get Resend API Key

### Create Resend Account
1. Go to: **https://resend.com/signup**
2. Sign up with your email (free, no credit card required)
3. Verify your email address

### Get API Key
1. After signup, go to: **https://resend.com/api-keys**
2. Click "Create API Key"
3. Name: `VNTV Newsletter`
4. Permission: `Sending access` (default)
5. Copy the API key (starts with `re_`)

---

## 🔧 Step 4: Add API Key to Environment

### Local Development (.env.local)
```bash
# Open: /Users/macbookair/vnation/vntv/.env.local
# Add or update:

RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxx
EMAIL_FROM=newsletter@vntv.tv
```

### Production (Vercel)
```bash
# After deploying to Vercel:
1. Go to: Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add:
   - Name: RESEND_API_KEY
   - Value: re_xxxxxxxxxxxxxxxxxxxxx
   - Environment: Production, Preview, Development
3. Add:
   - Name: EMAIL_FROM
   - Value: newsletter@vntv.tv
4. Redeploy
```

---

## ✉️ Step 5: Verify Sender Domain (Production)

### For Development (localhost)
- ✅ **No verification needed**
- Resend allows sending from `onboarding@resend.dev` in development
- Your FROM address will be: `VNTV <onboarding@resend.dev>`

### For Production (vntv.tv)
1. Go to: **https://resend.com/domains**
2. Click "Add Domain"
3. Enter: `vntv.tv`
4. Resend will provide DNS records:

```
TXT Record:
Name: @
Value: resend=xxxxxxxxxxxxxxxx

MX Records:
Priority 10: feedback-smtp.resend.com

SPF (TXT):
Name: @
Value: v=spf1 include:_spf.resend.com ~all

DKIM (TXT):
Name: resend._domainkey
Value: (provided by Resend)
```

5. Add these records to your DNS provider (where you bought vntv.tv)
6. Wait 5-15 minutes for verification
7. Refresh Resend dashboard to confirm verification
8. Update `EMAIL_FROM` to: `newsletter@vntv.tv`

---

## 🧪 Step 6: Test Email Delivery

### Local Testing (After Adding API Key)
```bash
1. Restart dev server: npm run dev
2. Go to: http://localhost:3000
3. Scroll to footer
4. Subscribe with YOUR REAL EMAIL
5. Check inbox for verification email
6. Should arrive within seconds!
```

### Check Console Logs
```bash
# With API key:
✅ Verification email sent via Resend: { to: 'your@email.com', id: 'xxx' }

# Without API key (development):
📧 Newsletter verification email (DEV MODE - no API key): { to: 'your@email.com', verificationUrl: '...' }
```

---

## 📊 Resend Dashboard Features

### Monitor Emails
- **Dashboard:** https://resend.com/emails
- See all sent emails
- Delivery status (sent, delivered, opened, clicked)
- Bounce/spam reports

### Free Tier Limits
- ✅ **3,000 emails/month**
- ✅ **100 emails/day**
- ✅ No credit card required
- ✅ All features included

### Pricing (When You Grow)
- **Free:** 3,000 emails/month
- **Pro ($20/month):** 50,000 emails/month
- **Scale:** Custom pricing for high volume

---

## 🔒 Security Best Practices

### API Key Security
- ✅ **Never commit API key to Git**
- ✅ Stored in `.env.local` (already in .gitignore)
- ✅ Use Vercel environment variables in production
- ✅ Rotate key if accidentally exposed

### Email Security
- ✅ SPF/DKIM records verify sender (prevents spoofing)
- ✅ DMARC policy (optional but recommended)
- ✅ Double opt-in prevents spam complaints
- ✅ One-click unsubscribe required by law

---

## 🐛 Troubleshooting

### Emails Not Sending
**Check:**
1. API key is correct in `.env.local`
2. Restart dev server after adding key
3. Check console for error messages
4. Verify Resend API key is valid: https://resend.com/api-keys

### Emails Going to Spam
**For Development:**
- Normal when using `onboarding@resend.dev`
- Check spam folder
- Mark as "Not Spam" to whitelist

**For Production:**
- Verify domain in Resend
- Add SPF/DKIM/DMARC records
- Warm up sending (start slow, increase gradually)
- Monitor bounce rate (<2%)

### Domain Verification Pending
- DNS changes can take 5-48 hours
- Use `dig` or `nslookup` to check:
  ```bash
  dig TXT vntv.tv
  dig TXT resend._domainkey.vntv.tv
  ```
- Contact Resend support if stuck: support@resend.com

---

## 📧 Email Templates

### Current Templates
- ✅ **Verification Email** - Beautiful HTML with VNTV branding
- ✅ **Unsubscribe Confirmation** - Simple HTML

### Future Templates (Newsletter Campaigns)
- Daily Digest
- Weekly Roundup
- Breaking News Alerts
- Category Digests

---

## 🚀 What Happens Now

### With API Key (Production Mode)
1. User subscribes → Verification email sent via Resend
2. Email arrives in inbox within seconds
3. User clicks verification link → Subscription confirmed
4. Future newsletters will send via Resend

### Without API Key (Development Mode)
1. User subscribes → Email logged to console
2. Copy verification URL from console logs
3. Paste in browser to test verification flow
4. Perfect for testing without sending real emails

---

## 📝 Quick Reference

| Action | URL |
|--------|-----|
| Sign up | https://resend.com/signup |
| API Keys | https://resend.com/api-keys |
| Domains | https://resend.com/domains |
| Email Logs | https://resend.com/emails |
| Docs | https://resend.com/docs |
| Support | support@resend.com |

---

## ✅ Checklist

- [x] Install Resend package
- [x] Update newsletter email service
- [ ] **Sign up for Resend account**
- [ ] **Get API key**
- [ ] **Add API key to .env.local**
- [ ] **Restart dev server**
- [ ] **Test email delivery**
- [ ] Verify domain (production only)
- [ ] Deploy to Vercel with API key

---

**Status:** Ready for API key integration  
**Time to Complete:** 5 minutes (after you get the API key)  
**Cost:** Free (3,000 emails/month)
