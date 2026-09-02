# Social Media Links - Dynamic Site Settings Integration

**Date:** September 1, 2026  
**Status:** Complete ✅

---

## Summary

Updated the footer to dynamically load social media URLs from the `site_settings` table instead of using hardcoded values.

---

## What Changed

### Before
- Social links were hardcoded as `"#"` placeholders
- Static array of links

### After
- Social links loaded from database via `getSocialLinks()` function
- Admin can update URLs in `/admin/settings` (Global Settings tab)
- Links only display if configured
- Dynamic loading on component mount

---

## Implementation Details

### File Modified
**`components/layout/public-footer.tsx`**

### Changes Made

1. **Import Added:**
```typescript
import { getSocialLinks } from "@/app/actions/site-settings";
```

2. **State Added:**
```typescript
const [socialLinks, setSocialLinks] = useState<{
  facebook?: string;
  twitter?: string;
  instagram?: string;
  youtube?: string;
  tiktok?: string;
}>({});
```

3. **Effect Hook Added:**
```typescript
useEffect(() => {
  getSocialLinks().then((links) => {
    setSocialLinks(links);
  });
}, []);
```

4. **Rendering Updated:**
- Changed from mapping over static array
- Now conditionally renders each social icon
- Only shows icons for configured URLs
- Each link checks: `{socialLinks.facebook && <a>...</a>}`

---

## Site Settings Integration

### Database Fields
The following settings in `site_settings` table are used:

| Setting Key | Description | Default Value |
|-------------|-------------|---------------|
| `social_facebook` | Facebook page URL | `"https://facebook.com/vntv"` |
| `social_twitter` | Twitter/X profile URL | `"https://twitter.com/vntv"` |
| `social_instagram` | Instagram profile URL | `"https://instagram.com/vntv"` |
| `social_youtube` | YouTube channel URL | `"https://youtube.com/@vntv"` |
| `social_tiktok` | TikTok profile URL | `"https://tiktok.com/@vntv"` |
| `social_linkedin` | LinkedIn page URL (optional) | `""` |

### How to Update

**Admin Path:** `/admin/settings` → Global Settings tab

1. Navigate to Admin Settings
2. Click "Global Settings" tab
3. Scroll to "Social Media Links" section
4. Enter full URLs for each platform
5. Click "Save Changes"
6. Footer updates automatically for all users

---

## Benefits

### For Admins
✅ No code changes needed to update social links  
✅ Centralized management in admin panel  
✅ Consistent URLs across entire site  
✅ Easy to add/remove social platforms  

### For Users
✅ Always up-to-date social links  
✅ Only shows active social platforms  
✅ Direct links to official VNTV profiles  

### For Developers
✅ Single source of truth  
✅ Reusable across components  
✅ Easy to extend with new platforms  
✅ Type-safe implementation  

---

## Technical Details

### Function Used
**`getSocialLinks()`** from `app/actions/site-settings.ts`

**Returns:**
```typescript
{
  facebook?: string;
  twitter?: string;
  instagram?: string;
  youtube?: string;
  tiktok?: string;
  linkedin?: string;
}
```

**Features:**
- Server-side function (runs on server)
- Fetches from `site_settings` table
- Returns empty object if settings not found
- Type-safe return value

---

## Icon Mapping

| Platform | Icon Component | Default URL |
|----------|---------------|-------------|
| Facebook | `FaFacebook` | facebook.com/vntv |
| Twitter/X | `FaXTwitter` | twitter.com/vntv |
| YouTube | `FaYoutube` | youtube.com/@vntv |
| Instagram | `FaInstagram` | instagram.com/vntv |
| TikTok | `FaTiktok` | tiktok.com/@vntv |

*LinkedIn icon not currently shown but supported in backend*

---

## Behavior

### Initial Load
- Component mounts with empty social links
- `useEffect` runs and fetches links from database
- State updates with fetched links
- Icons render for configured platforms only

### If No URLs Configured
- Icons simply don't display
- No errors or broken links
- Clean, minimal footer

### If Some URLs Configured
- Only configured icons display
- Missing platforms are hidden
- Responsive layout adjusts

---

## Future Enhancements

### Potential Additions
1. **LinkedIn Icon** - Add to footer if needed
2. **WhatsApp** - Business number link
3. **Telegram** - Channel/group link
4. **Discord** - Community server
5. **Reddit** - Subreddit link

### Implementation
All handled via:
1. Add new field to `site_settings` migration
2. Update `getSocialLinks()` return type
3. Add icon to footer component
4. Add field to admin settings form

No other changes needed! ✅

---

## Testing

### Manual Tests Performed
- ✅ Footer loads correctly
- ✅ Social links fetch from database
- ✅ Icons display when URLs configured
- ✅ Icons hidden when URLs empty
- ✅ Links open in new tab
- ✅ Hover effects work
- ✅ Responsive on mobile
- ✅ Dark/light mode compatible

### Browser Compatibility
- ✅ Chrome
- ✅ Firefox
- ✅ Safari
- ✅ Edge

---

## Rollback Plan

If issues arise, revert to static links:

```typescript
const socialLinks = [
  { name: "Facebook", href: "https://facebook.com/vntv", icon: FaFacebook },
  { name: "X (Twitter)", href: "https://twitter.com/vntv", icon: FaXTwitter },
  { name: "YouTube", href: "https://youtube.com/@vntv", icon: FaYoutube },
  { name: "Instagram", href: "https://instagram.com/vntv", icon: FaInstagram },
  { name: "TikTok", href: "https://tiktok.com/@vntv", icon: FaTiktok },
];
```

---

## Related Files

- `components/layout/public-footer.tsx` - Footer component (MODIFIED)
- `app/actions/site-settings.ts` - Settings functions
- `supabase/migrations/20260901000004_comprehensive_site_settings.sql` - Settings migration

---

## Documentation

### For Content Editors
See: Admin Guide → Settings → Social Media Links

### For Developers
See: `app/actions/site-settings.ts` - `getSocialLinks()` function

---

**Status:** ✅ Complete and Production Ready  
**TypeScript:** ✅ No errors  
**Build:** ✅ Passing  
**Tests:** ✅ Manual tests passed
