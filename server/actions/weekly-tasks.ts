"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

/**
 * Generate intelligent weekly tasks based on location data
 */
export async function generateWeeklyTasks(locationId?: string) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return {
        success: false,
        error: "Not authenticated",
        data: [],
      }
    }

    // Get analytics data to generate intelligent tasks
    let reviewsQuery = supabase
      .from("gmb_reviews")
      .select("id, has_reply, rating")
      .eq("user_id", user.id)
      .eq("has_reply", false)

    let questionsQuery = supabase
      .from("gmb_questions")
      .select("id")
      .eq("user_id", user.id)
      .eq("answer_status", "pending")

    let postsQuery = supabase
      .from("gmb_posts")
      .select("id, published_at")
      .eq("user_id", user.id)
      .order("published_at", { ascending: false })
      .limit(1)

    if (locationId && locationId !== "all") {
      reviewsQuery = reviewsQuery.eq("location_id", locationId)
      questionsQuery = questionsQuery.eq("location_id", locationId)
      postsQuery = postsQuery.eq("location_id", locationId)
    }

    const [
      { data: pendingReviews },
      { data: unansweredQuestions },
      { data: recentPosts },
    ] = await Promise.all([
      reviewsQuery,
      questionsQuery,
      postsQuery,
    ])

    // Calculate week start date (Monday)
    const now = new Date()
    const dayOfWeek = now.getDay()
    const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek // Monday
    const weekStart = new Date(now)
    weekStart.setDate(now.getDate() + diff)
    weekStart.setHours(0, 0, 0, 0)

    const weekStartDate = weekStart.toISOString().split("T")[0]

    // Check if tasks already exist for this week
    const { data: existingTasks } = await supabase
      .from("weekly_task_recommendations")
      .select("id")
      .eq("user_id", user.id)
      .eq("week_start_date", weekStartDate)
      .limit(1)

    if (existingTasks && existingTasks.length > 0) {
      return {
        success: false,
        error: "Tasks for this week already exist",
        data: [],
      }
    }

    // Generate intelligent tasks based on actual data
    const tasks: any[] = []

    // Task 1: Reply to pending reviews (if any)
    if (pendingReviews && pendingReviews.length > 0) {
      const urgentCount = pendingReviews.filter((r) => r.rating <= 3).length
      const totalCount = Math.min(pendingReviews.length, 10)

      tasks.push({
        user_id: user.id,
        week_start_date: weekStartDate,
        title: urgentCount > 0 
          ? `⚠️ Reply to ${urgentCount} low-rating review${urgentCount > 1 ? 's' : ''} (${totalCount} total pending)`
          : `Reply to ${totalCount} pending review${totalCount > 1 ? 's' : ''}`,
        description:
          urgentCount > 0
            ? "Low-rating reviews need immediate attention to show you care about customer feedback."
            : "Respond to customer feedback to improve engagement and show you value their opinions.",
        category: "reviews",
        priority: urgentCount > 0 ? "high" : pendingReviews.length > 5 ? "medium" : "low",
        effort_level: pendingReviews.length > 5 ? "moderate" : "quick",
        estimated_minutes: Math.min(pendingReviews.length * 3, 30),
        status: "pending",
        reasoning: `You have ${pendingReviews.length} unanswered reviews${urgentCount > 0 ? `, including ${urgentCount} with 3 stars or lower` : ""}.`,
        expected_impact:
          "Replying to reviews improves customer relationships and signals to Google that you're an active business.",
      })
    }

    // Task 2: Answer customer questions (if any)
    if (unansweredQuestions && unansweredQuestions.length > 0) {
      const count = Math.min(unansweredQuestions.length, 10)

      tasks.push({
        user_id: user.id,
        week_start_date: weekStartDate,
        title: `Answer ${count} customer question${count > 1 ? "s" : ""}`,
        description:
          "Help potential customers by answering their questions about your business.",
        category: "questions",
        priority: "medium",
        effort_level: count > 3 ? "moderate" : "quick",
        estimated_minutes: count * 2,
        status: "pending",
        reasoning: `${unansweredQuestions.length} unanswered customer questions are waiting.`,
        expected_impact:
          "Answering questions helps convert browsers into customers and improves your Q&A visibility.",
      })
    }

    // Task 3: Create content (always recommended)
    const daysSinceLastPost = recentPosts?.[0]?.published_at
      ? Math.floor(
          (Date.now() - new Date(recentPosts[0].published_at).getTime()) /
            (1000 * 60 * 60 * 24)
        )
      : 30

    tasks.push({
      user_id: user.id,
      week_start_date: weekStartDate,
      title:
        daysSinceLastPost > 14
          ? "🚨 Create a Google Business post (overdue)"
          : "Create a new post to engage customers",
      description:
        "Share updates, offers, or news to keep your profile active and visible in search results.",
      category: "content",
      priority: daysSinceLastPost > 14 ? "high" : "medium",
      effort_level: "quick",
      estimated_minutes: 5,
      status: "pending",
      reasoning:
        daysSinceLastPost > 14
          ? `It's been ${daysSinceLastPost} days since your last post. Regular posting improves visibility.`
          : "Regular posting (2-3x per week) keeps your business profile fresh and engaging.",
      expected_impact:
        "Posts appear in Google Search and Maps, attracting more potential customers to your business.",
    })

    // Task 4: Upload fresh photos (if no recent activity)
    tasks.push({
      user_id: user.id,
      week_start_date: weekStartDate,
      title: "Upload 3-5 new photos",
      description:
        "Fresh, high-quality photos attract more customers and improve your profile's appeal.",
      category: "media",
      priority: "low",
      effort_level: "quick",
      estimated_minutes: 10,
      status: "pending",
      reasoning:
        "Businesses with recent photos get 42% more requests for directions and 35% more clicks to their website.",
      expected_impact:
        "Updated photos increase engagement and help customers visualize your business.",
    })

    // Task 5: Review and update business information
    tasks.push({
      user_id: user.id,
      week_start_date: weekStartDate,
      title: "Verify business hours and contact info",
      description:
        "Ensure all business information is accurate, especially for holidays or special events.",
      category: "info_management",
      priority: "low",
      effort_level: "quick",
      estimated_minutes: 5,
      status: "pending",
      reasoning:
        "Accurate business information prevents customer frustration and improves trust.",
      expected_impact:
        "Correct information reduces customer complaints and improves your business reputation.",
    })

    // Insert tasks (limit to top 5 by priority)
    const tasksToInsert = tasks
      .sort((a, b) => {
        const priorityOrder: Record<string, number> = { high: 0, medium: 1, low: 2 }
        return priorityOrder[a.priority] - priorityOrder[b.priority]
      })
      .slice(0, 5)

    const { data, error } = await supabase
      .from("weekly_task_recommendations")
      .insert(tasksToInsert)
      .select()

    if (error) {
      console.error("[Weekly Tasks] Insert error:", error)
      return {
        success: false,
        error: "Failed to generate tasks",
        data: [],
      }
    }

    revalidatePath("/dashboard")

    return {
      success: true,
      data: data || [],
    }
  } catch (error: any) {
    console.error("[Weekly Tasks] Error generating tasks:", error)
    return {
      success: false,
      error: error.message || "Failed to generate weekly tasks",
      data: [],
    }
  }
}

/**
 * Toggle task completion status
 */
export async function toggleTask(taskId: string, completed: boolean) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return {
        success: false,
        error: "Not authenticated",
      }
    }

    const { error } = await supabase
      .from("weekly_task_recommendations")
      .update({
        status: completed ? "completed" : "pending",
        updated_at: new Date().toISOString(),
      })
      .eq("id", taskId)
      .eq("user_id", user.id)

    if (error) {
      console.error("[Weekly Tasks] Toggle error:", error)
      return {
        success: false,
        error: "Failed to update task",
      }
    }

    revalidatePath("/dashboard")

    return {
      success: true,
    }
  } catch (error: any) {
    console.error("[Weekly Tasks] Error toggling task:", error)
    return {
      success: false,
      error: error.message || "Failed to update task",
    }
  }
}

/**
 * Get weekly tasks for current week
 */
export async function getWeeklyTasks(locationId?: string) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return {
        success: false,
        error: "Not authenticated",
        data: [],
      }
    }

    // Calculate week start date (Monday)
    const now = new Date()
    const dayOfWeek = now.getDay()
    const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek
    const weekStart = new Date(now)
    weekStart.setDate(now.getDate() + diff)
    weekStart.setHours(0, 0, 0, 0)

    const weekStartDate = weekStart.toISOString().split("T")[0]

    const { data, error } = await supabase
      .from("weekly_task_recommendations")
      .select("*")
      .eq("user_id", user.id)
      .eq("week_start_date", weekStartDate)
      .order("priority", { ascending: true })
      .order("created_at", { ascending: true })

    if (error) {
      console.error("[Weekly Tasks] Fetch error:", error)
      return {
        success: false,
        error: error.message,
        data: [],
      }
    }

    return {
      success: true,
      data: data || [],
    }
  } catch (error: any) {
    console.error("[Weekly Tasks] Error fetching tasks:", error)
    return {
      success: false,
      error: error.message || "Failed to fetch weekly tasks",
      data: [],
    }
  }
}

/**
 * Delete a task
 */
export async function deleteTask(taskId: string) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return {
        success: false,
        error: "Not authenticated",
      }
    }

    const { error } = await supabase
      .from("weekly_task_recommendations")
      .delete()
      .eq("id", taskId)
      .eq("user_id", user.id)

    if (error) {
      console.error("[Weekly Tasks] Delete error:", error)
      return {
        success: false,
        error: "Failed to delete task",
      }
    }

    revalidatePath("/dashboard")

    return {
      success: true,
    }
  } catch (error: any) {
    console.error("[Weekly Tasks] Error deleting task:", error)
    return {
      success: false,
      error: error.message || "Failed to delete task",
    }
  }
}

