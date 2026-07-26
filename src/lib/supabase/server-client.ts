import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/lib/database.types';

let adminClient: ReturnType<typeof createClient<Database>> | null = null;
let publicClient: ReturnType<typeof createClient<Database>> | null = null;

export function getSupabaseAdmin() {
  if (!adminClient) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!url || !key) {
      throw new Error('Missing Supabase credentials for admin client');
    }

    adminClient = createClient<Database>(url, key, {
      auth: { autoRefreshToken: false, persistSession: false }
    });
  }

  return adminClient;
}

export function getSupabasePublic() {
  if (!publicClient) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!url || !key) {
      throw new Error('Missing Supabase credentials for public client');
    }

    publicClient = createClient<Database>(url, key, {
      auth: { autoRefreshToken: false, persistSession: false }
    });
  }

  return publicClient;
}
