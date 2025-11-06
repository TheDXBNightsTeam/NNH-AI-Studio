# Dashboard Production Integration Guide

This guide shows how to integrate the new production-ready components and server actions into your existing dashboard page.

## Quick Start: Update Your Dashboard Page

### File: `app/[locale]/(dashboard)/page.tsx`

Replace your existing dashboard page with this production-ready implementation:

```typescript
import { createClient } from '@/lib/supabase/server'
import { getPendingReviews } from '@/server/actions/gmb-reviews'
import { getUnansweredQuestions } from '@/server/actions/gmb-questions'
import { getWeeklyTasks } from '@/server/actions/weekly-tasks'
import { DashboardClient } from '@/components/dashboard/DashboardClient'
import { redirect } from 'next/navigation'

export default async function DashboardPage() {
  const supabase = await createClient()
  
  // Check authentication
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
    redirect('/login')
  }

  // Get user's first location (or implement location selector)
  const { data: locations } = await supabase
    .from('gmb_locations')
    .select('*')
    .eq('user_id', user.id)
    .eq('is_active', true)
    .limit(1)
    .single()

  if (!locations) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-2xl font-bold mb-4">No Locations Found</h2>
        <p className="text-zinc-400 mb-4">
          Connect your Google Business Profile to get started.
        </p>
        <a href="/settings" className="text-orange-500 hover:underline">
          Go to Settings →
        </a>
      </div>
    )
  }

  // Fetch real data for dashboard
  const [reviewsResult, questionsResult, tasksResult] = await Promise.all([
    getPendingReviews(locations.id),
    getUnansweredQuestions(locations.id),
    getWeeklyTasks(locations.id),
  ])

  return (
    <DashboardClient
      location={locations}
      pendingReviews={reviewsResult.data || []}
      unansweredQuestions={questionsResult.data || []}
      weeklyTasks={tasksResult.data || []}
    />
  )
}
```

## Component Usage Examples

### 1. Reviews Quick Action Modal

```typescript
'use client'

import { ReviewsQuickActionModal } from '@/components/dashboard/ReviewsQuickActionModal'
import { useState } from 'react'

export function ReviewsSection({ pendingReviews }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <button onClick={() => setIsOpen(true)}>
        Reply to {pendingReviews.length} Reviews
      </button>

      <ReviewsQuickActionModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        pendingReviews={pendingReviews}
        onSuccess={() => {
          // Refresh data or show success message
          console.log('Review replied!')
        }}
      />
    </>
  )
}
```

### 2. Questions Quick Action Modal

```typescript
'use client'

import { QuestionsQuickActionModal } from '@/components/dashboard/QuestionsQuickActionModal'
import { useState } from 'react'

export function QuestionsSection({ unansweredQuestions }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <button onClick={() => setIsOpen(true)}>
        Answer {unansweredQuestions.length} Questions
      </button>

      <QuestionsQuickActionModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        unansweredQuestions={unansweredQuestions}
        onSuccess={() => {
          console.log('Question answered!')
        }}
      />
    </>
  )
}
```

### 3. Create Post Modal

```typescript
'use client'

import { CreatePostModal } from '@/components/dashboard/CreatePostModal'
import { useState } from 'react'

export function PostsSection({ locationId }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <button onClick={() => setIsOpen(true)}>
        Create New Post
      </button>

      <CreatePostModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        locationId={locationId} // REQUIRED: Pass the actual location UUID
        onSuccess={() => {
          console.log('Post created!')
        }}
      />
    </>
  )
}
```

### 4. Weekly Tasks List

```typescript
'use client'

import { WeeklyTasksList } from '@/components/dashboard/WeeklyTasksList'

export function TasksSection({ locationId, initialTasks }) {
  return (
    <WeeklyTasksList
      locationId={locationId}
      initialTasks={initialTasks}
    />
  )
}
```

### 5. Sync Button

```typescript
'use client'

import { syncLocation } from '@/server/actions/gmb-sync'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

export function SyncButton({ locationId }) {
  const [isSyncing, setIsSyncing] = useState(false)
  const router = useRouter()

  const handleSync = async () => {
    setIsSyncing(true)

    try {
      const result = await syncLocation(locationId)

      if (result.success) {
        toast.success('Location synced successfully!', {
          description: result.message,
        })
        router.refresh()
      } else {
        toast.error('Sync failed', {
          description: result.error || 'Please try again',
        })
      }
    } catch (error) {
      toast.error('An unexpected error occurred')
    } finally {
      setIsSyncing(false)
    }
  }

  return (
    <button
      onClick={handleSync}
      disabled={isSyncing}
      className="..."
    >
      {isSyncing ? '⏳ Syncing...' : '🔄 Sync Now'}
    </button>
  )
}
```

## Full Dashboard Client Example

```typescript
'use client'

import { useState } from 'react'
import { ReviewsQuickActionModal } from '@/components/dashboard/ReviewsQuickActionModal'
import { QuestionsQuickActionModal } from '@/components/dashboard/QuestionsQuickActionModal'
import { CreatePostModal } from '@/components/dashboard/CreatePostModal'
import { WeeklyTasksList } from '@/components/dashboard/WeeklyTasksList'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { syncLocation } from '@/server/actions/gmb-sync'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

interface DashboardClientProps {
  location: any
  pendingReviews: any[]
  unansweredQuestions: any[]
  weeklyTasks: any[]
}

export function DashboardClient({
  location,
  pendingReviews,
  unansweredQuestions,
  weeklyTasks,
}: DashboardClientProps) {
  const [reviewsModalOpen, setReviewsModalOpen] = useState(false)
  const [questionsModalOpen, setQuestionsModalOpen] = useState(false)
  const [postsModalOpen, setPostsModalOpen] = useState(false)
  const [isSyncing, setIsSyncing] = useState(false)
  const router = useRouter()

  const handleSync = async () => {
    setIsSyncing(true)
    const result = await syncLocation(location.id)
    setIsSyncing(false)

    if (result.success) {
      toast.success('Synced successfully!')
      router.refresh()
    } else {
      toast.error(result.error || 'Sync failed')
    }
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-zinc-100">Dashboard</h1>
          <p className="text-zinc-400">{location.location_name}</p>
        </div>
        <Button onClick={handleSync} disabled={isSyncing}>
          {isSyncing ? 'Syncing...' : 'Sync Now'}
        </Button>
      </div>

      {/* Quick Actions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6 bg-zinc-900 border-zinc-800">
          <h3 className="text-lg font-semibold mb-2">Pending Reviews</h3>
          <p className="text-3xl font-bold text-orange-500 mb-4">
            {pendingReviews.length}
          </p>
          <Button
            onClick={() => setReviewsModalOpen(true)}
            disabled={pendingReviews.length === 0}
            className="w-full"
          >
            Reply to Reviews
          </Button>
        </Card>

        <Card className="p-6 bg-zinc-900 border-zinc-800">
          <h3 className="text-lg font-semibold mb-2">Unanswered Questions</h3>
          <p className="text-3xl font-bold text-blue-500 mb-4">
            {unansweredQuestions.length}
          </p>
          <Button
            onClick={() => setQuestionsModalOpen(true)}
            disabled={unansweredQuestions.length === 0}
            className="w-full"
          >
            Answer Questions
          </Button>
        </Card>

        <Card className="p-6 bg-zinc-900 border-zinc-800">
          <h3 className="text-lg font-semibold mb-2">Create Content</h3>
          <p className="text-sm text-zinc-400 mb-4">
            Share updates with customers
          </p>
          <Button
            onClick={() => setPostsModalOpen(true)}
            className="w-full"
          >
            Create Post
          </Button>
        </Card>
      </div>

      {/* Weekly Tasks */}
      <Card className="p-6 bg-zinc-900 border-zinc-800">
        <h2 className="text-xl font-semibold mb-4">Weekly Tasks</h2>
        <WeeklyTasksList
          locationId={location.id}
          initialTasks={weeklyTasks}
        />
      </Card>

      {/* Modals */}
      <ReviewsQuickActionModal
        isOpen={reviewsModalOpen}
        onClose={() => setReviewsModalOpen(false)}
        pendingReviews={pendingReviews}
        onSuccess={() => router.refresh()}
      />

      <QuestionsQuickActionModal
        isOpen={questionsModalOpen}
        onClose={() => setQuestionsModalOpen(false)}
        unansweredQuestions={unansweredQuestions}
        onSuccess={() => router.refresh()}
      />

      <CreatePostModal
        isOpen={postsModalOpen}
        onClose={() => setPostsModalOpen(false)}
        locationId={location.id}
        onSuccess={() => router.refresh()}
      />
    </div>
  )
}
```

## Data Flow

```
┌─────────────────────────┐
│  Dashboard Page (RSC)   │ ← Server Component
│  - Fetch initial data   │
│  - getPendingReviews()  │
│  - getWeeklyTasks()     │
└────────────┬────────────┘
             │ Props
             ↓
┌─────────────────────────┐
│  DashboardClient        │ ← Client Component
│  - Manages UI state     │
│  - Opens modals         │
│  - Handles user clicks  │
└────────────┬────────────┘
             │
    ┌────────┴────────┐
    ↓                 ↓
┌─────────┐      ┌─────────┐
│ Modal   │      │ Server  │
│ Opens   │──────│ Action  │
└─────────┘      │ Calls   │
                 └────┬────┘
                      │
                 ┌────┴─────┐
                 ↓          ↓
            ┌────────┐  ┌────────┐
            │ Google │  │Supabase│
            │  API   │  │   DB   │
            └────────┘  └────────┘
```

## Testing Your Integration

### 1. Check Database Connection
```typescript
// In your dashboard page
const { data, error } = await supabase
  .from('gmb_locations')
  .select('*')
  .limit(1)

console.log('Locations:', data)
console.log('Error:', error)
```

### 2. Test Server Actions
```typescript
// In a client component
const testReviewAction = async () => {
  const result = await getPendingReviews()
  console.log('Pending reviews:', result)
}
```

### 3. Verify OAuth Tokens
```sql
-- Check in Supabase SQL Editor
SELECT id, account_id, email, expires_at 
FROM gmb_accounts 
WHERE user_id = 'your-user-id';
```

### 4. Test Error Scenarios
- Try replying to a review without auth
- Try posting with empty description
- Try exceeding character limits
- Check error toast messages appear

## Common Pitfalls

### ❌ Don't Do This
```typescript
// Missing locationId prop
<CreatePostModal isOpen={true} onClose={() => {}} />

// Forgot to pass onSuccess
<ReviewsQuickActionModal isOpen={true} onClose={() => {}} />

// Using old mock data
const mockReviews = [{ id: '1', text: 'test' }]
```

### ✅ Do This Instead
```typescript
// Pass required locationId
<CreatePostModal 
  isOpen={true} 
  onClose={() => {}} 
  locationId={location.id} 
/>

// Include onSuccess for UI refresh
<ReviewsQuickActionModal 
  isOpen={true} 
  onClose={() => {}} 
  pendingReviews={realData}
  onSuccess={() => router.refresh()}
/>

// Use real data from server actions
const { data: reviews } = await getPendingReviews(locationId)
```

## Next Steps

1. ✅ Replace your dashboard page with the production version
2. ✅ Test each modal with real Google data
3. ✅ Verify OAuth token refresh works
4. ✅ Monitor Supabase logs for errors
5. ✅ Add analytics tracking (optional)
6. ✅ Implement AI-generated responses (Phase 8)

---

**Need Help?**
- Check `PRODUCTION_DASHBOARD_IMPLEMENTATION_REPORT.md` for full details
- Review server actions in `server/actions/` for API documentation
- Test in development before deploying to production

