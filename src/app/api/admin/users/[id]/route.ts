/**
 * Admin User Details API Endpoint
 * 
 * Provides secure server-side access to detailed user information
 * for individual users in the admin portal.
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminAccess } from '../../../../../utils/adminSecurity';
import { AdminUserService } from '../../../../../services/adminUserService';

/**
 * GET /api/admin/users/[id]
 * Get comprehensive user information by ID (admin only)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verify admin access
    await verifyAdminAccess();
    
    const { id: userId } = await params;
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      );
    }
    
    const userInfo = await AdminUserService.getUserInfo(userId);
    
    return NextResponse.json({
      success: true,
      data: userInfo
    });
  } catch (error) {
    console.error('Error in admin user details API:', error);
    
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
      
      if (error.message === 'User not found') {
        return NextResponse.json(
          { success: false, error: 'User not found' },
          { status: 404 }
        );
      }
    }
    
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
