import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/server-client';
import { getAuthenticatedUserId } from '@/lib/auth-utils';

function cleanSlug(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80) || 'post';
}

export async function POST(request: Request) {
  try {
    const profileId = await getAuthenticatedUserId(request);
    if (!profileId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const content = typeof body.content === 'string' ? body.content.trim() : '';
    const heading = typeof body.heading === 'string' ? body.heading.trim() : '';
    const mediaUrls = Array.isArray(body.mediaUrls) ? body.mediaUrls.filter((url: unknown): url is string => typeof url === 'string') : [];
    const mediaTypes = Array.isArray(body.mediaTypes) ? body.mediaTypes.filter((type: unknown): type is string => typeof type === 'string') : [];

    if (!content && mediaUrls.length === 0) {
      return NextResponse.json({ error: 'Add some content or media' }, { status: 400 });
    }

    const supabaseAdmin = getSupabaseAdmin();
    const baseSlug = cleanSlug(heading || content);
    const { data: existingPosts, error: existingError } = await supabaseAdmin
      .from('posts')
      .select('slug')
      .eq('user_id', profileId)
      .limit(1000);

    if (existingError) throw existingError;

    const existingSlugs = new Set((existingPosts || []).map((post) => post.slug).filter(Boolean));
    let slug = baseSlug;
    let suffix = 2;
    while (existingSlugs.has(slug)) {
      slug = `${baseSlug}-${suffix++}`;
    }

    const title = (heading || content || 'Untitled post').slice(0, 200);
    const { data, error } = await supabaseAdmin
      .from('posts')
      .insert({
        author_id: profileId,
        user_id: profileId,
        title,
        content,
        image_url: mediaUrls[0] || null,
        media_url: mediaUrls[0] || null,
        media_type: mediaTypes[0] || null,
        media_urls: mediaUrls.length ? mediaUrls : null,
        media_types: mediaTypes.length ? mediaTypes : null,
        location_name: typeof body.location === 'string' ? body.location || null : null,
        location_latitude: typeof body.latitude === 'number' ? body.latitude : null,
        location_longitude: typeof body.longitude === 'number' ? body.longitude : null,
        slug,
      })
      .select('id, post_number, slug')
      .single();

    if (error) throw error;
    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error('[posts/create] error:', error);
    return NextResponse.json({ error: error?.message || 'Failed to create post' }, { status: 500 });
  }
}
