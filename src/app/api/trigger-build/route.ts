import { revalidatePath, revalidateTag } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

async function verifyAdminFromRequest(request: NextRequest): Promise<boolean> {
  try {
    // Get the authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return false;
    }
    
    const token = authHeader.replace('Bearer ', '');
    
    // Create Supabase client with the token
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        auth: { autoRefreshToken: false, persistSession: false },
        global: { headers: { Authorization: `Bearer ${token}` } }
      }
    );
    
    // Get the user
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) {
      return false;
    }
    
    // Check JWT app_metadata first
    if (user.app_metadata?.is_admin === true) {
      return true;
    }
    
    // Fallback: Check database
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single();
      
    return profile?.is_admin || false;
  } catch (error) {
    console.error('Admin verification error:', error);
    return false;
  }
}

export async function POST(request: NextRequest) {
  try {
    // Verify admin access before allowing build trigger
    const isAdmin = await verifyAdminFromRequest(request);
    if (!isAdmin) {
      return NextResponse.json(
        { success: false, error: 'Admin access required' },
        { status: 403 }
      );
    }
    
    console.log('🔐 Admin verification passed for build trigger');
        
    // Get the request body
    const body = await request.json();
    const { type = 'all' } = body;


    // Revalidate based on type
    switch (type) {
      case 'articles':
        revalidatePath('/articles');
        revalidateTag('articles');
        break;
        
      case 'briefs':
        revalidatePath('/briefs');
        revalidateTag('briefs');
        break;
        
      case 'authors':
        revalidatePath('/authors');
        revalidateTag('authors');
        break;
        
      case 'all':
      default:
        revalidatePath('/articles');
        revalidatePath('/briefs');
        revalidatePath('/authors');
        revalidateTag('articles');
        revalidateTag('briefs');
        revalidateTag('authors');
        break;
    }

    return NextResponse.json({ 
      success: true,
      message: `Build triggered for ${type}`,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Error triggering build:', error);
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}
