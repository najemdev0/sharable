import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/server-client';
import { getAuthenticatedUserId } from '@/lib/auth-utils';


// Called once on app init to ensure required storage buckets exist
async function setupStorage(request: Request) {
  const userId = await getAuthenticatedUserId(request);
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const supabaseAdmin = getSupabaseAdmin();
  return createStoriesBucket(supabaseAdmin);
}

async function createStoriesBucket(supabaseAdmin: ReturnType<typeof getSupabaseAdmin>) {
  try {
    const { data: buckets, error: listError } = await supabaseAdmin.storage.listBuckets();
    if (listError) throw listError;

    const exists = buckets?.some((b) => b.name === 'stories');

    if (exists) {
      return NextResponse.json({ ok: true, message: 'stories bucket already exists' });
    }

    const { error } = await supabaseAdmin.storage.createBucket('stories', {
      public: true,
      allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
      fileSizeLimit: 10485760, // 10 MB
    });

    if (error) throw error;

    return NextResponse.json({ ok: true, message: 'stories bucket created' });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}

export async function GET(request: Request) {
  return setupStorage(request);
}

export async function POST(request: Request) {
  return setupStorage(request);
}
