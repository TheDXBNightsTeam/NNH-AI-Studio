"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function getLocations() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { locations: [], error: "Not authenticated" }
  }

  const { data, error } = await supabase
    .from("gmb_locations")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  if (error) {
    return { locations: [], error: error.message }
  }

  return { locations: data || [], error: null }
}

export async function addLocation(locationData: {
  location_name: string
  address?: string
  category?: string
  phone?: string
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { success: false, error: "Not authenticated" }
  }

  const { error } = await supabase
    .from("gmb_locations")
    .insert({
      ...locationData,
      user_id: user.id,
      is_active: true,
      rating: 0,
    })

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath('/locations')
  return { success: true, error: null }
}

export async function updateLocation(locationId: string, updates: Record<string, any>) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { success: false, error: "Not authenticated" }
  }

  const { error } = await supabase
    .from("gmb_locations")
    .update(updates)
    .eq("id", locationId)
    .eq("user_id", user.id)

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath('/locations')
  return { success: true, error: null }
}

export async function deleteLocation(locationId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { success: false, error: "Not authenticated" }
  }

  const { error } = await supabase
    .from("gmb_locations")
    .delete()
    .eq("id", locationId)
    .eq("user_id", user.id)

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath('/locations')
  return { success: true, error: null }
}
