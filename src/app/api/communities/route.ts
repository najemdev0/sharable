import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/server-client';
import { getAuthenticatedUserId } from '@/lib/auth-utils';


export async function GET(req: NextRequest) {
  const supabaseAdmin = getSupabaseAdmin();
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    let query = supabaseAdmin
      .from('communities')
      .select(`
        *,
        creator:profiles!communities_created_by_fkey(id, full_name, username, avatar_url),
        members:community_members(count)
      `, { count: 'exact' });

    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
    }

    const { data, error, count } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    return NextResponse.json({ communities: data || [], total: count || 0 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const supabaseAdmin = getSupabaseAdmin();
  try {
    const creator_id = await getAuthenticatedUserId(req);
    if (!creator_id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { name, description, avatar_url, cover_url, is_private } = await req.json();

    if (!name || !creator_id) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from('communities')
      .insert({
        name,
        slug: `${name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}-${Date.now().toString(36)}`,
        description,
        avatar_url,
        cover_url,
        created_by: creator_id,
        is_private,
      })
      .select()
      .single();

    if (error) throw error;

    // Add creator as admin member
    await supabaseAdmin
      .from('community_members')
      .insert({
        community_id: data.id,
        profile_id: creator_id,
        role: 'admin',
      });

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
