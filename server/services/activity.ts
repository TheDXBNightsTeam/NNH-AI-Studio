"use server"

import { createClient } from '@/lib/supabase/server'

type LogParams = {
  userId: string
  type: string
  message: string
  metadata?: Record<string, any>
  actionable?: boolean
}

export async function logServerActivity({ userId, type, message, metadata = {}, actionable = false }: LogParams) {
  try {
    const supabase = await createClient()
    const { error } = await supabase.from('activity_logs').insert({
      user_id: userId,
      activity_type: type,
      activity_message: message,
      metadata,
      actionable,
    })
    if (error) {
      console.error('logServerActivity insert error:', error)
    }
  } catch (err) {
    console.error('logServerActivity failed:', err)
  }
}
