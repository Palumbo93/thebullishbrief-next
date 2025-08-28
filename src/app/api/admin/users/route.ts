/**
 * Admin Users API Endpoint
 * 
 * Provides secure server-side access to comprehensive user information
 * for admin portal functionality.
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminAccess } from '../../../../utils/adminSecurity';
import { AdminUserService } from '../../../../services/adminUserService';

/**
 * GET /api/admin/users
 * Get all users with activity stats (admin only)
 */
export async function GET(request: NextRequest) {
  try {
    // Verify admin access
    await verifyAdminAccess();
    
    const users = await AdminUserService.getAllUsersWithStats();
    
    return NextResponse.json({
      success: true,
      data: users
    });
  } catch (error) {
    console.error('Error in admin users API:', error);
    
    if (error instanceof Error) {
      if (error.message === 'Authentication required') {
        return NextResponse.json(
          { success: false, error: 'Authentication required' },
          { status: 401 }
        );
      }
      
      if (error.message === 'Admin access required') {
        return NextResponse.json(
          { success: false, error: 'Admin access required' },
          { status: 403 }
        );
      }
    }
    
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
