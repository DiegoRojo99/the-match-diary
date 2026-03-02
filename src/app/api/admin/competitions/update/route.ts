import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function PATCH(request: NextRequest) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    
    // For now, skip auth check - we'll handle this at the component level
    // TODO: Add proper server-side auth check if needed

    const body = await request.json();
    const { competitionId, visible } = body;

    if (typeof competitionId !== 'number' || typeof visible !== 'boolean') {
      return NextResponse.json({ error: 'Invalid parameters' }, { status: 400 });
    }

    // Update competition visibility
    const { error } = await supabase
      .from('competitions')
      .update({ visible })
      .eq('id', competitionId);

    if (error) {
      console.error('Error updating competition visibility:', error);
      return NextResponse.json({ error: 'Failed to update competition' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
    
  } catch (error) {
    console.error('Error in update competition API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}