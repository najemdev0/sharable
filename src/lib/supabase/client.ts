import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/database.types'

let supabaseInstance: ReturnType<typeof createClient<Database>> | null = null

function getSupabaseClient() {
  if (!supabaseInstance) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key'

    try {
      supabaseInstance = createClient<Database>(supabaseUrl, supabaseKey)
    } catch (error) {
      // During build, these values might be placeholders
      // Return a dummy object that won't cause errors
      supabaseInstance = {} as any
    }
  }

  return supabaseInstance
}

export const supabase = new Proxy({} as ReturnType<typeof createClient<Database>>, {
  get: (target, prop) => {
    return (getSupabaseClient() as any)[prop]
  },
})
