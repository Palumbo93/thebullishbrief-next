import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { verifyAdminStatus } from '@/utils/adminSecurity';

// Create service role client for admin operations
const createServiceRoleClient = () => {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceRoleKey || !process.env.NEXT_PUBLIC_SUPABASE_URL) {
    throw new Error('Missing required Supabase service role credentials');
  }
  
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    serviceRoleKey,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  );
};

// Verify admin from request
async function verifyAdminFromRequest(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return { isAdmin: false, user: null };
    }
    
    const token = authHeader.replace('Bearer ', '');
    
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        auth: { autoRefreshToken: false, persistSession: false },
        global: { headers: { Authorization: `Bearer ${token}` } }
      }
    );
    
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) {
      return { isAdmin: false, user: null };
    }
    
    // Check JWT app_metadata first (most secure)
    if (user.app_metadata?.is_admin === true) {
      return { isAdmin: true, user };
    }
    
    // Fallback: Check database
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single();
      
    return { 
      isAdmin: profile?.is_admin || false, 
      user 
    };
  } catch (error) {
    console.error('Admin verification error:', error);
    return { isAdmin: false, user: null };
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, targetUserId, reason } = body;
    
    // Validate request
    if (!action || !targetUserId) {
      return NextResponse.json(
        { error: 'Missing required fields: action, targetUserId' },
        { status: 400 }
      );
    }
    
    if (!['grant', 'revoke'].includes(action)) {
      return NextResponse.json(
        { error: 'Invalid action. Must be "grant" or "revoke"' },
        { status: 400 }
      );
    }
    
    // Verify admin status of requesting user
    const { isAdmin, user } = await verifyAdminFromRequest(request);
    
    if (!isAdmin || !user) {
      return NextResponse.json(
        { error: 'Unauthorized. Admin access required.' },
        { status: 403 }
      );
    }
    
    // Create service role client for the actual operation
    const serviceSupabase = createServiceRoleClient();
    
    try {
      let result;
      
      if (action === 'grant') {
        // Use the secure database function
        const { data, error } = await serviceSupabase.rpc('grant_admin_privileges', {
          target_user_id: targetUserId,
          granting_admin_id: user.id,
          reason: reason || 'Admin role granted via admin panel'
        });
        
        if (error) {
          console.error('Error granting admin privileges:', error);
          return NextResponse.json(
            { error: `Failed to grant admin privileges: ${error.message}` },
            { status: 500 }
          );
        }
        
        result = data;
      } else if (action === 'revoke') {
        // Use the secure database function
        const { data, error } = await serviceSupabase.rpc('revoke_admin_privileges', {
          target_user_id: targetUserId,
          revoking_admin_id: user.id,
          reason: reason || 'Admin role revoked via admin panel'
        });
        
        if (error) {
          console.error('Error revoking admin privileges:', error);
          return NextResponse.json(
            { error: `Failed to revoke admin privileges: ${error.message}` },
            { status: 500 }
          );
        }
        
        result = data;
      }
      
      return NextResponse.json({
        success: true,
        result,
        action,
        performedBy: {
          id: user.id,
          email: user.email
        },
        timestamp: new Date().toISOString()
      });
      
    } catch (dbError) {
      console.error('Database operation error:', dbError);
      return NextResponse.json(
        { error: `Database operation failed: ${dbError}` },
        { status: 500 }
      );
    }
    
  } catch (error) {
    console.error('Admin role management error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Get admin audit logs
export async function GET(request: NextRequest) {
  try {
    // Verify admin status
    const { isAdmin, user } = await verifyAdminFromRequest(request);
    
    if (!isAdmin || !user) {
      return NextResponse.json(
        { error: 'Unauthorized. Admin access required.' },
        { status: 403 }
      );
    }
    
    // Get query parameters
    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get('limit') || '50');
    const offset = parseInt(url.searchParams.get('offset') || '0');
    const userId = url.searchParams.get('userId');
    
    const serviceSupabase = createServiceRoleClient();
    
    let query = serviceSupabase
      .from('admin_audit_log')
      .select(`
        *,
        user_profiles!admin_audit_log_user_id_fkey(email, username),
        performed_by_profile:user_profiles!admin_audit_log_performed_by_fkey(email, username)
      `)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);
    
    if (userId) {
      query = query.eq('user_id', userId);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Error fetching audit logs:', error);
      return NextResponse.json(
        { error: 'Failed to fetch audit logs' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data,
      pagination: {
        offset,
        limit,
        count: data?.length || 0
      }
    });
    
  } catch (error) {
    console.error('Audit log fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
