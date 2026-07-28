import { NextResponse } from 'next/server';
import { getSupabaseAdmin, getSupabasePublic } from '@/lib/supabase/server-client';
import { createToken } from '@/lib/auth-utils';

export async function POST(request: Request) {
  const supabaseAdmin = getSupabaseAdmin();
  const supabasePublic = getSupabasePublic();
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json({ error: 'Username and password required' }, { status: 400 });
    }

    // Get the profile to find the associated user and their email
    const { data: profileData, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('id, user_id, username')
      .eq('username', username.toLowerCase())
      .single();

    if (profileError || !profileData) {
      return NextResponse.json({ error: 'Invalid username or password' }, { status: 401 });
    }

    // Sign in with Supabase Auth using the email we created during registration
    const email = `${profileData.username}@sharable.com`;
    const { data, error } = await supabasePublic.auth.signInWithPassword({
      email: email,
      password: password
    });

    if (error || !data.session) {
      return NextResponse.json({ error: 'Invalid username or password' }, { status: 401 });
    }

    // Create a custom JWT token (matching registration flow)
    const token = await createToken({
      userId: profileData.id,
      username: profileData.username
    });

    const response = NextResponse.json({ 
      success: true, 
      userId: profileData.id,
      message: 'Logged in successfully'
    });

    // Set the session cookie with the custom JWT token
    response.cookies.set('sb-auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: '/'
    });

    return response;
  } catch (error: any) {
    console.error('[v0] Login error:', error.message);
    return NextResponse.json({ error: 'Login failed. Please try again.' }, { status: 500 });
  }
}
