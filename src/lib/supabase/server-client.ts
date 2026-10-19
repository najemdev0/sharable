import { createClient } from '@supabase/supabase-js';
// The checked-in generated schema is behind the deployed migrations; regenerate it before restoring a strict generic here.
let adminClient: ReturnType<typeof createClient<any>> | null = null;
let publicClient: ReturnType<typeof createClient<any>> | null = null;

export function getSupabaseAdmin() {
  if (!adminClient) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!url || !key) {
      throw new Error('Missing Supabase credentials for admin client');
    }

    adminClient = createClient<any>(url, key, {
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

    publicClient = createClient<any>(url, key, {
      auth: { autoRefreshToken: false, persistSession: false }
    });
  }

  return publicClient;
}
