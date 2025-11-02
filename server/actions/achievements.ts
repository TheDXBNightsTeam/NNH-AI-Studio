"use server"

import { createClient } from "@/lib/supabase/server"

export interface Achievement {
  id: string
  title: string
  description: string
  icon: string
  unlocked: boolean
  progress?: number
  maxProgress?: number
}

export async function getUserAchievements(): Promise<{
  achievements: Achievement[]
  streak: number
}> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { achievements: [], streak: 0 }
  }

  const { data: activeAccounts } = await supabase
    .from("gmb_accounts")
    .select("id")
    .eq("user_id", user.id)
    .eq("is_active", true)

  const activeAccountIds = activeAccounts?.map(acc => acc.id) || []

  let reviews: any[] = []
  let posts: any[] = []
  let locations: any[] = []

  if (activeAccountIds.length > 0) {
    const [reviewsRes, postsRes, locationsRes] = await Promise.all([
      supabase
        .from("gmb_reviews")
        .select("id, review_reply, created_at")
        .eq("user_id", user.id),
      supabase
        .from("gmb_posts")
        .select("id, created_at")
        .eq("user_id", user.id),
      supabase
        .from("gmb_locations")
        .select("id")
        .eq("user_id", user.id)
        .in("gmb_account_id", activeAccountIds)
    ])

    reviews = reviewsRes.data || []
    posts = postsRes.data || []
    locations = locationsRes.data || []
  }

  const repliedReviews = reviews.filter(r => r.review_reply && r.review_reply.trim().length > 0)
  
  const calculateStreak = () => {
    const now = new Date()
    const recentActivities = [
      ...reviews.map(r => new Date(r.created_at)),
      ...posts.map(p => new Date(p.created_at))
    ].sort((a, b) => b.getTime() - a.getTime())

    if (recentActivities.length === 0) return 0

    let streak = 0
    let currentDate = new Date(now)
    currentDate.setHours(0, 0, 0, 0)

    for (const activity of recentActivities) {
      const activityDate = new Date(activity)
      activityDate.setHours(0, 0, 0, 0)

      const diffDays = Math.floor((currentDate.getTime() - activityDate.getTime()) / (1000 * 60 * 60 * 24))

      if (diffDays === streak) {
        streak++
      } else if (diffDays > streak) {
        break
      }
    }

    return streak
  }

  const streak = calculateStreak()

  const achievements: Achievement[] = [
    {
      id: "first-reply",
      title: "First Reply",
      description: "Replied to your first review",
      icon: "star",
      unlocked: repliedReviews.length > 0,
      progress: Math.min(repliedReviews.length, 1),
      maxProgress: 1,
    },
    {
      id: "reply-master",
      title: "Reply Master",
      description: "Replied to 50 reviews",
      icon: "trophy",
      unlocked: repliedReviews.length >= 50,
      progress: repliedReviews.length,
      maxProgress: 50,
    },
    {
      id: "week-streak",
      title: "7-Day Streak",
      description: "Active for 7 consecutive days",
      icon: "flame",
      unlocked: streak >= 7,
      progress: streak,
      maxProgress: 7,
    },
    {
      id: "content-creator",
      title: "Content Creator",
      description: "Published 10 posts",
      icon: "star",
      unlocked: posts.length >= 10,
      progress: posts.length,
      maxProgress: 10,
    },
    {
      id: "power-user",
      title: "Power User",
      description: "Complete 100% profile setup",
      icon: "target",
      unlocked: false,
      progress: 0,
      maxProgress: 100,
    },
  ]

  return {
    achievements,
    streak
  }
}
