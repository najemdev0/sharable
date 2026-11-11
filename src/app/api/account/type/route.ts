import { NextResponse } from 'next/server';
import { comparePassword, getAuthenticatedUserId } from '@/lib/auth-utils';
import { getSupabaseAdmin } from '@/lib/supabase/server-client';

export async function GET(request: Request) {
  const profileId = await getAuthenticatedUserId(request);
  if (!profileId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const supabaseAdmin = getSupabaseAdmin();
  const { data, error } = await supabaseAdmin
    .from('profiles')
    .select('id, username, account_type, brand_converted_at')
    .eq('id', profileId)
    .maybeSingle();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!data) return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
  return NextResponse.json({ accountType: data.account_type || 'personal', convertedAt: data.brand_converted_at || null });
}

export async function POST(request: Request) {
  const profileId = await getAuthenticatedUserId(request);
  if (!profileId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { password } = await request.json();
    if (typeof password !== 'string' || password.length === 0) {
      return NextResponse.json({ error: 'Password is required' }, { status: 400 });
    }

    const supabaseAdmin = getSupabaseAdmin();
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('id, username, account_type, password_hash')
      .eq('id', profileId)
      .maybeSingle();

    if (profileError) throw profileError;
    if (!profile) return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    if (profile.account_type === 'brand') {
      return NextResponse.json({ error: 'Brand accounts cannot be changed back to Personal accounts' }, { status: 409 });
    }

    const passwordMatches = profile.password_hash
      ? await comparePassword(password, profile.password_hash)
      : false;
    if (!passwordMatches) {
      return NextResponse.json({ error: 'Incorrect password' }, { status: 401 });
    }

    const { error: updateError } = await supabaseAdmin
      .from('profiles')
      .update({ account_type: 'brand', brand_converted_at: new Date().toISOString() })
      .eq('id', profileId)
      .eq('account_type', 'personal');

    if (updateError) throw updateError;
    return NextResponse.json({ success: true, accountType: 'brand' });
  } catch (error: any) {
    console.error('[account/type] conversion error:', error);
    return NextResponse.json({ error: error?.message || 'Failed to change account type' }, { status: 500 });
  }
}
