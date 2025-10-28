import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function RootPage() {
  const supabase = await createClient()
  
  // Check session instead of just user to ensure valid authentication
  const { data: { session } } = await supabase.auth.getSession()

  // If user has valid session, redirect to home
  if (session?.user) {
    redirect('/home')
  }
  // If not logged in, go to login
  redirect('/auth/login')
}
