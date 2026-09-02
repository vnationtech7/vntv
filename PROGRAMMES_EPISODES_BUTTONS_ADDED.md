# Programmes & Episodes Delete/Publish Buttons - Complete ✅

## Feature Added
Added delete and publish/unpublish buttons to both programmes and episodes pages in the admin panel for quick status management.

## Changes Made

### 1. Programme Actions (`app/actions/programme.ts`)

**Added Function:**
```typescript
toggleProgrammeStatus(id: string, currentStatus: boolean)
```
- Toggles `is_active` status between true/false
- Updates `updated_at` timestamp
- Revalidates programmes page cache
- Returns success/error status

**Existing Function Used:**
- `deleteProgramme(id: string)` - Already existed

### 2. Episode Actions (`app/actions/episode.ts`)

**Added Function:**
```typescript
toggleEpisodeStatus(id: string, programmeId: string, currentStatus: string)
```
- Toggles status between "published" and "draft"
- Sets/clears `published_at` timestamp
- Updates `updated_at` timestamp
- Revalidates episodes page cache
- Returns success/error status

**Existing Function Used:**
- `deleteEpisode(id: string, programmeId: string)` - Already existed

### 3. Programmes Page (`app/admin/programmes/page.tsx`)

**Changes:**
- Converted from server component to client component
- Added `RequireVideoEditor` wrapper for auth
- Added state: `deletingId`, `togglingId`
- Added handlers: `handleDelete()`, `handleToggleStatus()`
- Imported actions: `deleteProgramme`, `toggleProgrammeStatus`

**New UI:**
```
┌─────────────────────────────────────┐
│ [Active/Inactive Button] [Delete]   │
│ [Edit] [Episodes]                   │
└─────────────────────────────────────┘
```

**Active/Inactive Button:**
- Green background when active (CheckCircle icon)
- Gray background when inactive (XCircle icon)
- Full-width button showing status
- Click to toggle status

**Delete Button:**
- Red background
- Trash icon
- Confirmation dialog warns about cascading delete (episodes)

### 4. Episodes Page (`app/admin/programmes/[id]/episodes/episodes-client.tsx`)

**Changes:**
- Added imports: `Trash2`, `CheckCircle`, `XCircle`, `useRouter`
- Added imports: `deleteEpisode`, `toggleEpisodeStatus`
- Added state: `deletingId`, `togglingId`
- Added handlers: `handleDelete()`, `handleToggleStatus()`
- Added `status` field to `EpisodeWithVideo` interface

**New UI:**
```
[Publish/Unpublish Icon] [Edit] [Delete Icon]
```

**Publish/Unpublish Button:**
- Green CheckCircle when published
- Gray XCircle when draft
- Icon-only button (compact)

**Delete Button:**
- Red trash icon
- Icon-only button (compact)

## User Flows

### Programme Management

**Activating a Programme:**
1. User sees programme card with gray "Inactive" button
2. User clicks "Inactive" button
3. Confirmation: "Activate '[Programme Name]'?"
4. User confirms
5. Button shows loading state
6. Status changes to active
7. Button turns green, shows "Active"
8. Programme becomes visible on public site

**Deactivating a Programme:**
1. User sees programme card with green "Active" button
2. User clicks "Active" button
3. Confirmation: "Deactivate '[Programme Name]'?"
4. User confirms
5. Button shows loading state
6. Status changes to inactive
7. Button turns gray, shows "Inactive"
8. Programme hidden from public site

**Deleting a Programme:**
1. User clicks red delete button (trash icon)
2. Confirmation: "Delete '[Programme Name]'? This will also delete all episodes. This action cannot be undone."
3. User confirms
4. Button shows loading state
5. Programme and all its episodes deleted
6. Card removed from list

### Episode Management

**Publishing an Episode:**
1. User sees episode with gray XCircle icon and "Draft" badge
2. User clicks XCircle icon
3. Confirmation: "Publish episode '[Episode Title]'?"
4. User confirms
5. Icon shows loading state
6. Status changes to published
7. Icon turns green CheckCircle
8. Badge updates to "Published"
9. Episode visible on public site

**Unpublishing an Episode:**
1. User sees episode with green CheckCircle icon and "Published" badge
2. User clicks CheckCircle icon
3. Confirmation: "Unpublish episode '[Episode Title]'?"
4. User confirms
5. Icon shows loading state
6. Status changes to draft
7. Icon turns gray XCircle
8. Badge updates to "Draft"
9. Episode hidden from public site

**Deleting an Episode:**
1. User clicks red trash icon
2. Confirmation: "Delete episode '[Episode Title]'? This action cannot be undone."
3. User confirms
4. Icon shows loading state
5. Episode deleted
6. Row removed from list

## Database Changes

### Programme Toggle:
```sql
UPDATE programmes 
SET 
  is_active = [new_status],
  updated_at = NOW()
WHERE id = [programme_id]
```

### Episode Toggle:
```sql
UPDATE episodes 
SET 
  status = [new_status],
  published_at = [timestamp_or_null],
  updated_at = NOW()
WHERE id = [episode_id]
```

## Button Icons & Colors

### Programmes:
- **Active** - Green background, CheckCircle icon, "Active" text
- **Inactive** - Gray background, XCircle icon, "Inactive" text
- **Delete** - Red background, Trash2 icon

### Episodes:
- **Published** - Green CheckCircle icon
- **Draft** - Gray XCircle icon
- **Delete** - Red Trash2 icon

## Confirmation Messages

**Programmes:**
- Activate: "Activate '[Programme Name]'?"
- Deactivate: "Deactivate '[Programme Name]'?"
- Delete: "Delete '[Programme Name]'? This will also delete all episodes. This action cannot be undone."

**Episodes:**
- Publish: "Publish episode '[Episode Title]'?"
- Unpublish: "Unpublish episode '[Episode Title]'?"
- Delete: "Delete episode '[Episode Title]'? This action cannot be undone."

## Error Handling

If any operation fails:
- Alert shows: "Failed to [action]: [error message]"
- Button re-enables
- Status remains unchanged
- User can retry

## Benefits

✅ **Quick Status Management** - Toggle active/published without editing
✅ **Visual Feedback** - Colors indicate current status
✅ **Confirmation Dialogs** - Prevent accidental changes
✅ **Loading States** - Clear feedback during processing
✅ **Cascade Warning** - Programme deletion warns about episodes
✅ **Error Handling** - Graceful failures with user messages
✅ **Compact UI** - Icon buttons save space on episodes
✅ **Consistent Design** - Matches video publish button pattern

## Files Modified

1. **app/actions/programme.ts**
   - Added `toggleProgrammeStatus()` function

2. **app/actions/episode.ts**
   - Added `toggleEpisodeStatus()` function

3. **app/admin/programmes/page.tsx**
   - Converted to client component
   - Added delete and toggle handlers
   - Updated UI with new buttons

4. **app/admin/programmes/[id]/episodes/episodes-client.tsx**
   - Added delete and toggle handlers
   - Updated UI with icon buttons
   - Fixed status display to use `status` field

## Testing Checklist

✅ Build passes successfully
✅ Programmes page shows active/inactive toggle button
✅ Programmes page shows delete button
✅ Episodes page shows publish/unpublish icon button
✅ Episodes page shows delete icon button
✅ Confirmation dialogs appear before actions
✅ Buttons disabled during processing
✅ Status updates correctly after toggle
✅ Delete removes items correctly
✅ Error handling works correctly
✅ Page refreshes after actions

## Summary

Admins can now quickly manage programmes and episodes with dedicated delete and publish/unpublish buttons. Programmes show full-width status buttons (Active/Inactive) with delete option. Episodes show compact icon buttons for publish/unpublish and delete. All actions require confirmation and provide clear visual feedback. 🎉
