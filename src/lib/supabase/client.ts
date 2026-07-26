import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/database.types'

let supabaseInstance: ReturnType<typeof createClient<Database>> | null = null

function getSupabaseClient() {
  if (!supabaseInstance) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    // Check if we have valid credentials before attempting to create client
    if (!supabaseUrl || !supabaseKey) {
      // Return a dummy proxy during build time
      return {} as any
    }

    try {
      supabaseInstance = createClient<Database>(supabaseUrl, supabaseKey)
    } catch (error) {
      console.error('[v0] Failed to initialize Supabase client:', error)
      return {} as any
    }
  }

  return supabaseInstance
}

export const supabase = new Proxy({} as ReturnType<typeof createClient<Database>>, {
  get: (target, prop) => {
    return (getSupabaseClient() as any)[prop]
  },
})
