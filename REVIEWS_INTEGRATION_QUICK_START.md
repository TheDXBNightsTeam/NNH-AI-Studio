# Reviews Integration Quick Start Guide

This guide shows you how to integrate the new production-ready reviews system with your existing UI components.

## Step 1: Run the Migration

```bash
# Apply the database migration in your Supabase project
# Option A: Via Supabase Dashboard
# Go to SQL Editor → paste migration content from:
# supabase/migrations/20251106_comprehensive_gmb_reviews_schema.sql

# Option B: Via Supabase CLI
supabase db reset  # if in development
# or
supabase db push   # to apply new migrations
```

## Step 2: Update Your Reviews Page

**File: `app/[locale]/(dashboard)/reviews/page.tsx`**

Transform from client component to server component:

```typescript
// Remove 'use client' directive

import { createClient } from '@/lib/supabase/server'
import { ReviewsClient } from '@/components/reviews/ReviewsClient'
import { getReviews, getReviewStats } from '@/server/actions/reviews-management'
import { redirect } from 'next/navigation'

export default async function ReviewsPage({
  searchParams
}: {
  searchParams: { 
    location?: string
    rating?: string
    status?: string
    page?: string
  }
}) {
  const supabase = await createClient()
  
  // Authentication check
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    redirect('/login')
  }

  // Parse filters from URL
  const locationId = searchParams.location
  const rating = searchParams.rating ? parseInt(searchParams.rating) : undefined
  const status = searchParams.status as 'pending' | 'replied' | 'flagged' | 'archived' | undefined
  const page = searchParams.page ? parseInt(searchParams.page) : 1
  const limit = 50
  const offset = (page - 1) * limit

  // Fetch data in parallel
  const [reviewsResult, statsResult, locations] = await Promise.all([
    getReviews({
      locationId,
      rating,
      status,
      limit,
      offset,
      sortBy: 'newest'
    }),
    getReviewStats(locationId),
    supabase
      .from('gmb_locations')
      .select('id, location_name')
      .eq('user_id', user.id)
      .eq('is_active', true)
  ])

  return (
    <ReviewsClient
      initialReviews={reviewsResult.data || []}
      stats={statsResult.data}
      totalCount={reviewsResult.count}
      locations={locations.data || []}
      currentFilters={{
        locationId,
        rating,
        status,
        page
      }}
    />
  )
}
```

## Step 3: Update Stats Cards Component

**File: `components/reviews/stats-cards.tsx`**

Keep your existing UI, just use real data:

```typescript
'use client'

interface StatsCardsProps {
  stats: {
    total: number
    pending: number
    replied: number
    averageRating: number
    responseRate: number
    byRating: {
      5: number
      4: number
      3: number
      2: number
      1: number
    }
  } | null
}

export function StatsCards({ stats }: StatsCardsProps) {
  if (!stats) {
    return <StatsCardsSkeleton />
  }

  return (
    <div className="grid grid-cols-4 gap-4">
      <StatCard
        title="Total Reviews"
        value={stats.total}
        icon="📊"
      />
      <StatCard
        title="Pending Replies"
        value={stats.pending}
        icon="⏳"
        color="orange"
      />
      <StatCard
        title="Replied"
        value={stats.replied}
        icon="✅"
        color="green"
      />
      <StatCard
        title="Avg Rating"
        value={stats.averageRating.toFixed(1)}
        icon="⭐"
      />
    </div>
  )
}
```

## Step 4: Update Reply Dialog

**File: `components/reviews/reply-dialog.tsx`**

Replace mock submission with real API call:

```typescript
'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { replyToReview } from '@/server/actions/reviews-management'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

interface ReplyDialogProps {
  review: any
  isOpen: boolean
  onClose: () => void
}

export function ReplyDialog({ review, isOpen, onClose }: ReplyDialogProps) {
  const [replyText, setReplyText] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()

  const handleSubmit = async () => {
    if (!replyText.trim()) {
      toast.error('Please enter a reply')
      return
    }

    if (replyText.length > 4096) {
      toast.error('Reply is too long (max 4096 characters)')
      return
    }

    setIsSubmitting(true)

    try {
      const result = await replyToReview(review.id, replyText.trim())

      if (result.success) {
        toast.success('Reply posted successfully!', {
          description: 'Your reply is now visible on Google'
        })
        setReplyText('')
        onClose()
        router.refresh()
      } else {
        toast.error('Failed to post reply', {
          description: result.error,
          action: result.error?.includes('reconnect') ? {
            label: 'Settings',
            onClick: () => router.push('/settings')
          } : undefined
        })
      }
    } catch (error: any) {
      toast.error('An unexpected error occurred', {
        description: error.message
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Reply to Review</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Show the review */}
          <div className="bg-zinc-900 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-yellow-500">{'⭐'.repeat(review.rating)}</span>
              <span className="text-zinc-400">{review.reviewer_name}</span>
            </div>
            <p className="text-zinc-300">{review.review_text || 'No review text'}</p>
          </div>

          {/* Reply input */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Your Reply</label>
              <span className={`text-xs ${replyText.length > 4096 ? 'text-red-400' : 'text-zinc-500'}`}>
                {replyText.length} / 4096
              </span>
            </div>
            <Textarea
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="Type your reply..."
              className="min-h-[150px]"
              maxLength={4200}
            />
            {replyText.length > 4096 && (
              <p className="text-xs text-red-400">Reply exceeds maximum length</p>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2">
            <Button
              variant="ghost"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || replyText.length > 4096}
            >
              {isSubmitting ? 'Posting...' : 'Post Reply'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
```

## Step 5: Add Sync Button

**File: `components/reviews/reviews-feed.tsx`** (or your header component)

```typescript
'use client'

import { useState } from 'react'
import { syncReviewsFromGoogle } from '@/server/actions/reviews-management'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { RefreshCw } from 'lucide-react'

export function SyncButton({ locationId }: { locationId: string }) {
  const [isSyncing, setIsSyncing] = useState(false)
  const router = useRouter()

  const handleSync = async () => {
    if (!locationId) {
      toast.error('Please select a location first')
      return
    }

    setIsSyncing(true)

    try {
      const result = await syncReviewsFromGoogle(locationId)

      if (result.success) {
        toast.success('Reviews synced!', {
          description: result.message
        })
        router.refresh()
      } else {
        toast.error('Sync failed', {
          description: result.error
        })
      }
    } catch (error: any) {
      toast.error('An unexpected error occurred')
    } finally {
      setIsSyncing(false)
    }
  }

  return (
    <button
      onClick={handleSync}
      disabled={isSyncing}
      className="flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-colors disabled:opacity-50"
    >
      <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
      {isSyncing ? 'Syncing...' : 'Sync Reviews'}
    </button>
  )
}
```

## Step 6: Add Filter Controls

**File: `components/reviews/review-filters.tsx`**

Update to use URL params for state management:

```typescript
'use client'

import { useRouter, useSearchParams } from 'next/navigation'

interface ReviewFiltersProps {
  locations: Array<{ id: string; location_name: string }>
}

export function ReviewFilters({ locations }: ReviewFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const updateFilter = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString())
    
    if (value) {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    
    // Reset to page 1 when filters change
    params.set('page', '1')
    
    router.push(`/reviews?${params.toString()}`)
  }

  const currentLocation = searchParams.get('location')
  const currentRating = searchParams.get('rating')
  const currentStatus = searchParams.get('status')

  return (
    <div className="flex items-center gap-4">
      {/* Location Filter */}
      <select
        value={currentLocation || ''}
        onChange={(e) => updateFilter('location', e.target.value || null)}
        className="px-3 py-2 bg-zinc-800 rounded-lg"
      >
        <option value="">All Locations</option>
        {locations.map((loc) => (
          <option key={loc.id} value={loc.id}>
            {loc.location_name}
          </option>
        ))}
      </select>

      {/* Rating Filter */}
      <select
        value={currentRating || ''}
        onChange={(e) => updateFilter('rating', e.target.value || null)}
        className="px-3 py-2 bg-zinc-800 rounded-lg"
      >
        <option value="">All Ratings</option>
        <option value="5">⭐⭐⭐⭐⭐ (5)</option>
        <option value="4">⭐⭐⭐⭐ (4)</option>
        <option value="3">⭐⭐⭐ (3)</option>
        <option value="2">⭐⭐ (2)</option>
        <option value="1">⭐ (1)</option>
      </select>

      {/* Status Filter */}
      <select
        value={currentStatus || ''}
        onChange={(e) => updateFilter('status', e.target.value || null)}
        className="px-3 py-2 bg-zinc-800 rounded-lg"
      >
        <option value="">All Statuses</option>
        <option value="pending">Pending Reply</option>
        <option value="replied">Replied</option>
        <option value="flagged">Flagged</option>
        <option value="archived">Archived</option>
      </select>

      {/* Clear Filters */}
      {(currentLocation || currentRating || currentStatus) && (
        <button
          onClick={() => router.push('/reviews')}
          className="text-sm text-zinc-400 hover:text-zinc-200"
        >
          Clear Filters
        </button>
      )}
    </div>
  )
}
```

## Step 7: Test Everything

### Manual Testing Checklist

1. **Load Reviews Page**
   - [ ] Reviews load from database
   - [ ] Stats show correct numbers
   - [ ] No errors in console

2. **Filter Reviews**
   - [ ] Location filter works
   - [ ] Rating filter works
   - [ ] Status filter works
   - [ ] Multiple filters work together

3. **Reply to Review**
   - [ ] Click "Reply" opens modal
   - [ ] Can type reply (4096 char limit)
   - [ ] Character counter updates
   - [ ] Submit button disabled when empty
   - [ ] Posts to Google successfully
   - [ ] Database updates with reply
   - [ ] UI refreshes showing reply

4. **Sync Reviews**
   - [ ] Click "Sync" button
   - [ ] Fetches from Google API
   - [ ] New reviews appear
   - [ ] Updated replies sync
   - [ ] Shows success message

5. **Error Scenarios**
   - [ ] Token expired → Shows reconnect message
   - [ ] No location selected → Error message
   - [ ] Reply too long → Validation error
   - [ ] Network error → Retry option

## Common Issues & Solutions

### Issue: "Not authenticated" error
**Solution:** User needs to log in. Redirect to `/login` is already handled.

### Issue: "GMB account not found"
**Solution:** User needs to connect Google account in Settings.

### Issue: Reviews not loading
**Solution:** Check:
1. Migration was applied (`gmb_reviews` table exists)
2. User has connected Google account
3. Locations are properly linked to user
4. Check Supabase logs for errors

### Issue: Reply not posting to Google
**Solution:** Check:
1. OAuth token is valid (check `gmb_accounts.expires_at`)
2. User has permission to reply (owner/manager role)
3. Review ID is correct (`external_review_id`)
4. Check browser console for API errors

### Issue: Character counter not working
**Solution:** Ensure `maxLength` prop is set on Textarea:
```typescript
<Textarea maxLength={4200} />
```

## Next Steps

1. ✅ Test in development environment
2. ✅ Fix any UI issues
3. ✅ Deploy to production
4. ✅ Monitor error logs
5. ✅ Implement Phase 3 (AI features) when ready

## Support

If you encounter issues:
1. Check `PRODUCTION_REVIEWS_IMPLEMENTATION_REPORT.md` for full details
2. Review server action code in `server/actions/reviews-management.ts`
3. Check Supabase logs for database errors
4. Verify Google API credentials in environment variables

---

**Quick Start Complete!** 🎉

Your reviews system is now connected to real Google My Business API with:
- ✅ Real reply posting
- ✅ Live data syncing
- ✅ Advanced filtering
- ✅ Professional error handling

