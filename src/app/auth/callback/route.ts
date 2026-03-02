import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/';

  if (code) {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
    
    console.error('Auth callback error:', error);
    return NextResponse.redirect(`${origin}/auth/login?error=auth_callback_error&message=${encodeURIComponent(error.message)}`);
  }

  // If no code, redirect to login
  return NextResponse.redirect(`${origin}/auth/login?error=no_code&message=Authentication failed. Please try again.`);
}