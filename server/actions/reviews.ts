"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function getReviews(locationId?: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { reviews: [], error: "Not authenticated" }
  }

  let query = supabase
    .from("gmb_reviews")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  if (locationId && locationId !== "all") {
    query = query.eq("location_id", locationId)
  }

  const { data, error } = await query

  if (error) {
    return { reviews: [], error: error.message }
  }

  return { reviews: data || [], error: null }
}

export async function updateReviewStatus(reviewId: string, status: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { success: false, error: "Not authenticated" }
  }

  const { error } = await supabase
    .from("gmb_reviews")
    .update({ status })
    .eq("id", reviewId)
    .eq("user_id", user.id)

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath('/reviews')
  return { success: true, error: null }
}

export async function addReviewReply(reviewId: string, reply: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { success: false, error: "Not authenticated" }
  }

  const { error } = await supabase
    .from("gmb_reviews")
    .update({ 
      response: reply,
      status: "responded",
      responded_at: new Date().toISOString()
    })
    .eq("id", reviewId)
    .eq("user_id", user.id)

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath('/reviews')
  return { success: true, error: null }
}
