# VNTV Newsletter Content Plan

## Current Status (Milestone 14)

**✅ Completed:** Newsletter subscription infrastructure
- User signup with auto-opt-in
- Double opt-in verification flow
- Unsubscribe/resubscribe system
- CMS management dashboard
- User settings to manage preferences

**⏳ Not Yet Implemented:** Newsletter campaigns/sending
- Email templates
- Content curation
- Scheduled sends
- Campaign analytics

---

## What Emails Do Subscribers Get NOW?

Currently, subscribers receive **ONLY**:
1. **Verification email** (when subscribing via footer)
2. **No regular newsletters yet** - infrastructure only

---

## Future Newsletter Content (Post-M14)

### 1. VNTV Daily Digest
**Frequency:** Daily (morning)  
**Content:**
- Top 5 most-read articles from last 24 hours
- Featured video of the day
- Breaking news summary
- Quick links to category highlights (Ghana, Nigeria, Africa)

**Template Structure:**
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        VNTV DAILY DIGEST
   Africa. Our Stories. Our Way.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📰 TOP STORIES

1. [Article Title]
   Category | 5 min read
   [Brief excerpt...]
   → Read more

2. [Article Title]
   ...

🎥 VIDEO OF THE DAY
[Video thumbnail]
[Video title]
→ Watch now

⚡ BREAKING NEWS
• [Breaking headline 1]
• [Breaking headline 2]

📂 BY CATEGORY
🇬🇭 Ghana | 🇳🇬 Nigeria | 🌍 Africa | 🌐 World

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[Unsubscribe] | [Preferences] | [View Online]
```

---

### 2. VNTV Weekly Roundup
**Frequency:** Weekly (Sunday evening)  
**Content:**
- Top 10 articles of the week
- Most-watched videos
- Editor's picks
- What's trending
- Upcoming VNTV Originals previews

**Why Weekly?**
- Deeper curation than daily
- Catches weekend readers
- Highlights missed during busy week

---

### 3. Breaking News Alerts
**Frequency:** Immediate (as needed)  
**Content:**
- Single major story
- Short, urgent format
- Link to full article
- "Read in 2 minutes" summary

**Trigger Criteria:**
- Article marked as "Breaking"
- Editor manually triggers alert
- High-priority news events

**Example:**
```
🚨 BREAKING NEWS ALERT

[Headline]

[2-3 sentence summary]

→ Read the full story on VNTV

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
You're receiving this as a VNTV subscriber.
Manage alert preferences | Unsubscribe
```

---

### 4. Category-Specific Digests
**Frequency:** Weekly (staggered)  
**Options:**
- **Ghana News Weekly** (Mondays)
- **Nigeria News Weekly** (Tuesdays)
- **Africa Update** (Wednesdays)
- **World News Digest** (Thursdays)
- **Politics & Business Brief** (Fridays)

**User Preference:**
Subscribers can choose which categories they want (future Task #7 implementation)

---

### 5. VNTV Originals Newsletter
**Frequency:** Bi-weekly  
**Content:**
- New episode releases
- Behind-the-scenes content
- Exclusive interviews
- Programme announcements
- Watch party events

---

### 6. Exclusive Content for Subscribers
**Content Ideas:**
- Early access to articles (1 hour before public)
- Subscriber-only editorials
- In-depth analysis pieces
- Monthly editor's letter
- Journalist Q&A sessions

---

## Newsletter Content Automation Strategy

### Data Sources
All content pulled from existing database:

1. **Top Articles:**
   ```sql
   SELECT * FROM articles 
   WHERE published_at > NOW() - INTERVAL '24 hours'
   ORDER BY view_count DESC 
   LIMIT 5;
   ```

2. **Most-Watched Videos:**
   ```sql
   SELECT v.*, COUNT(ve.id) as plays
   FROM videos v
   LEFT JOIN video_events ve ON v.id = ve.video_id 
   WHERE ve.event_type = 'complete'
   GROUP BY v.id
   ORDER BY plays DESC
   LIMIT 3;
   ```

3. **Breaking News:**
   ```sql
   SELECT * FROM breaking_news 
   WHERE is_active = true
   AND NOW() BETWEEN starts_at AND expires_at
   ORDER BY priority DESC;
   ```

4. **Category Content:**
   ```sql
   SELECT * FROM articles 
   WHERE category_id = '<category_id>'
   AND published_at > NOW() - INTERVAL '7 days'
   ORDER BY published_at DESC
   LIMIT 10;
   ```

---

## Email Templates

### Template Requirements
- **Responsive:** Mobile-first design
- **Accessible:** WCAG AA compliant
- **Fast:** Inline CSS, minimal images
- **Brand:** VNTV colors (red #DC2626, black/white)
- **Safe:** Works in Gmail, Outlook, Apple Mail

### Template Components
```typescript
// Email template structure
interface EmailTemplate {
  header: {
    logo: string;
    tagline: string;
    date: string;
  };
  hero?: {
    image: string;
    headline: string;
    link: string;
  };
  sections: Section[];
  footer: {
    unsubscribeLink: string;
    preferencesLink: string;
    socialLinks: SocialLink[];
  };
}
```

---

## Sending Infrastructure

### Option 1: Resend (Recommended for MVP)
**Pros:**
- Built for developers
- React Email templates
- Good deliverability
- Generous free tier

**Implementation:**
```typescript
import { Resend } from "resend";
import { NewsletterDailyDigest } from "@/emails/daily-digest";

const resend = new Resend(process.env.RESEND_API_KEY);

await resend.emails.send({
  from: "VNTV <newsletter@vntv.tv>",
  to: subscribers.map(s => s.email),
  subject: "VNTV Daily Digest | Top Stories from Africa",
  react: NewsletterDailyDigest({ articles, videos }),
});
```

### Option 2: SendGrid (Enterprise)
**Pros:**
- Powerful segmentation
- A/B testing
- Advanced analytics
- Marketing automation

**Use When:**
- >10k subscribers
- Need detailed analytics
- Want marketing automation

### Option 3: AWS SES (Cost-effective)
**Pros:**
- Very cheap at scale
- High deliverability
- Integrated with AWS

**Use When:**
- High volume (>100k emails/month)
- Already using AWS
- Need programmatic control

---

## Personalization

### Level 1: Basic (MVP)
- First name in greeting
- Unsubscribe link with token
- User preferences link

### Level 2: Advanced (Future)
- Content based on reading history
- Category preferences
- Time zone optimization
- Send time optimization

### Example Personalization:
```typescript
const emailContent = {
  greeting: `Hi ${subscriber.name || 'there'},`,
  recommendedArticles: getRecommendations(subscriber.history),
  categories: subscriber.preferences.categories || ['Ghana', 'Nigeria', 'Africa'],
};
```

---

## Subscriber Segmentation

### Segments to Consider:
1. **By Geography:**
   - Ghana readers
   - Nigeria readers
   - Diaspora (US, UK, EU)
   - Africa (other countries)

2. **By Engagement:**
   - Active (opens >50% of emails)
   - Moderate (opens 20-50%)
   - Inactive (opens <20%)
   - Never opened

3. **By Interests:**
   - Politics focus
   - Business focus
   - Entertainment focus
   - Sports focus
   - All categories

4. **By Account Type:**
   - Authenticated users
   - Anonymous subscribers
   - Premium (future)

---

## Campaign Schedule (Proposed)

| Day | Time (GMT) | Newsletter | Audience |
|-----|-----------|-----------|----------|
| Mon-Fri | 7:00 AM | Daily Digest | All active |
| Monday | 6:00 PM | Ghana Weekly | Ghana preference |
| Tuesday | 6:00 PM | Nigeria Weekly | Nigeria preference |
| Wednesday | 6:00 PM | Africa Update | Africa preference |
| Thursday | 6:00 PM | World News | World preference |
| Friday | 6:00 PM | Politics & Business | Politics/Business pref |
| Sunday | 6:00 PM | Weekly Roundup | All active |
| Bi-weekly | 5:00 PM | VNTV Originals | Originals fans |
| As needed | Immediate | Breaking News | Breaking alerts enabled |

---

## Metrics to Track

### Email Performance
- **Open rate** (target: >25%)
- **Click-through rate** (target: >3%)
- **Unsubscribe rate** (target: <0.5%)
- **Bounce rate** (target: <2%)
- **Spam complaints** (target: <0.1%)

### Content Performance
- **Top clicked articles**
- **Top clicked videos**
- **Category engagement**
- **Send time optimization data**

### Subscriber Health
- **Growth rate**
- **Active subscribers %**
- **Re-engagement success**
- **Lifetime value**

---

## Implementation Roadmap

### Phase 1: Basic Sending (Post-M14)
- [ ] Set up email service (Resend)
- [ ] Create daily digest template
- [ ] Manual send process (admin trigger)
- [ ] Basic personalization (name)

### Phase 2: Automation (M17-18)
- [ ] Scheduled daily digest (cron job)
- [ ] Weekly roundup automation
- [ ] Content selection algorithm
- [ ] Subscriber segmentation

### Phase 3: Advanced Features (M19+)
- [ ] Breaking news alerts (real-time)
- [ ] Category-specific digests
- [ ] User preference controls
- [ ] A/B testing framework
- [ ] Send time optimization
- [ ] Recommendation engine

### Phase 4: Optimization (Ongoing)
- [ ] Template improvements
- [ ] Deliverability optimization
- [ ] Re-engagement campaigns
- [ ] Advanced personalization
- [ ] Predictive sending

---

## Legal Requirements

### CAN-SPAM Compliance (US)
- ✅ Clear "From" name (VNTV)
- ✅ Accurate subject lines
- ✅ Physical address in footer
- ✅ One-click unsubscribe link
- ✅ Honor unsubscribe within 10 days
- ✅ Monitor third-party sending

### GDPR Compliance (EU)
- ✅ Explicit consent (double opt-in)
- ✅ Clear privacy policy
- ✅ Data processing agreement
- ✅ Right to access data
- ✅ Right to deletion
- ✅ Data portability

### Best Practices
- Never buy email lists
- Always include unsubscribe link
- Respect user preferences
- Send from verified domain
- Monitor spam complaints
- Provide value in every email

---

## Content Quality Guidelines

### Do's:
✅ Lead with most important story  
✅ Keep subject lines under 50 characters  
✅ Use clear, action-oriented CTAs  
✅ Include images (but not only images)  
✅ Test across email clients  
✅ Preview text optimization  
✅ Mobile-first design  
✅ Clear hierarchy  
✅ Scannable content  

### Don'ts:
❌ All caps in subject lines  
❌ Excessive exclamation marks!!!  
❌ Spam trigger words ("Free!", "Click now!")  
❌ Image-only emails  
❌ Broken links  
❌ Too many CTAs (limit 3-5)  
❌ Tiny fonts (<14px body text)  
❌ Poor contrast  

---

## Quick Start: First Newsletter

### To Send Your First Daily Digest:

1. **Set up email service:**
   ```bash
   npm install resend
   # Add RESEND_API_KEY to .env
   ```

2. **Create email template:**
   ```typescript
   // emails/daily-digest.tsx
   export default function DailyDigest({ articles }) {
     return (
       <Html>
         <Head />
         <Body>
           <Container>
             <Heading>VNTV Daily Digest</Heading>
             {articles.map(article => (
               <Section key={article.id}>
                 <Heading>{article.title}</Heading>
                 <Text>{article.excerpt}</Text>
                 <Button href={article.url}>Read more</Button>
               </Section>
             ))}
           </Container>
         </Body>
       </Html>
     );
   }
   ```

3. **Create send function:**
   ```typescript
   // app/actions/send-newsletter.ts
   export async function sendDailyDigest() {
     const topArticles = await getTopArticles();
     const subscribers = await getActiveSubscribers();
     
     await resend.emails.send({
       from: "VNTV <newsletter@vntv.tv>",
       to: subscribers.map(s => s.email),
       subject: `VNTV Daily | ${format(new Date(), 'MMMM d, yyyy')}`,
       react: DailyDigest({ articles: topArticles }),
     });
   }
   ```

4. **Manual trigger (for testing):**
   - Create admin page: `/admin/newsletter/send`
   - Button: "Send Daily Digest Now"
   - Preview before send
   - Confirm send

---

## FAQ

**Q: When should we start sending newsletters?**  
A: After production email service is integrated and at least 100 verified subscribers.

**Q: How often should we send?**  
A: Start with weekly roundup only. Add daily digest after content volume stabilizes.

**Q: What if subscribers complain?**  
A: Provide easy unsubscribe, offer frequency reduction before unsubscribe, survey why leaving.

**Q: How do we avoid spam filters?**  
A: Verified sender domain, double opt-in, clean list, good engagement rates, avoid spam triggers.

**Q: Can we re-engage inactive subscribers?**  
A: Yes, with win-back campaigns after 90 days. Offer to update preferences or unsubscribe.

---

**Status:** Infrastructure ready, campaigns pending implementation  
**Priority:** Medium (after production launch stabilizes)  
**Owner:** Editorial team + Engineering  
**Timeline:** Q2 2025 (estimated)
