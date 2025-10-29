"use server"

import { createClient } from "@/lib/supabase/server"

export async function getDashboardStats() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return {
      totalLocations: 0,
      totalReviews: 0,
      averageRating: "0.0",
      responseRate: 0,
      error: "Not authenticated"
    }
  }

  // Fetch locations
  const { data: locations } = await supabase
    .from("gmb_locations")
    .select("*")
    .eq("user_id", user.id)

  // Fetch reviews
  const { data: reviews } = await supabase
    .from("gmb_reviews")
    .select("*")
    .eq("user_id", user.id)

  const totalLocations = locations?.length || 0
  const totalReviews = reviews?.length || 0
  const averageRating =
    reviews && reviews.length > 0 
      ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
      : "0.0"

  const respondedReviews = reviews?.filter((r) => r.status === "responded").length || 0
  const responseRate = totalReviews > 0 ? Math.round((respondedReviews / totalReviews) * 100) : 0

  return {
    totalLocations,
    totalReviews,
    averageRating,
    responseRate,
    error: null
  }
}

export async function getActivityLogs(limit: number = 10) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { activities: [], error: "Not authenticated" }
  }

  const { data, error } = await supabase
    .from("activity_logs")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(limit)

  if (error) {
    return { activities: [], error: error.message }
  }

  return { activities: data || [], error: null }
}
