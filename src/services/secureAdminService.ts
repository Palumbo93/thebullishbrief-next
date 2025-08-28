/**
 * Secure Admin Service
 * 
 * This service provides airtight admin management functions that:
 * 1. Always use server-side verification
 * 2. Include complete audit logging
 * 3. Prevent client-side privilege escalation
 * 4. Provide secure role management
 */

import { supabase } from '@/lib/supabase';

export interface AdminAuditLog {
  id: string;
  user_id: string;
  action: 'granted' | 'revoked' | 'attempted_escalation';
  performed_by: string | null;
  performed_by_email: string | null;
  reason: string | null;
  client_info: any;
  created_at: string;
  user_profiles?: {
    email: string;
    username: string;
  };
  performed_by_profile?: {
    email: string;
    username: string;
  };
}

export interface AdminRoleResult {
  success: boolean;
  result?: any;
  action: 'grant' | 'revoke';
  performedBy: {
    id: string;
    email: string;
  };
  timestamp: string;
  error?: string;
}

class SecureAdminService {
  
  /**
   * Grant admin privileges to a user
   * Uses secure server-side API endpoint
   */
  async grantAdminRole(targetUserId: string, reason?: string): Promise<AdminRoleResult> {
    try {
      // Get current session for authentication
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.access_token) {
        throw new Error('No authentication token available');
      }
      
      const response = await fetch('/api/admin/manage-role', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          action: 'grant',
          targetUserId,
          reason: reason || 'Admin role granted via admin panel'
        })
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to grant admin role');
      }
      
      return result;
    } catch (error) {
      console.error('Error granting admin role:', error);
      throw error;
    }
  }
  
  /**
   * Revoke admin privileges from a user
   * Uses secure server-side API endpoint
   */
  async revokeAdminRole(targetUserId: string, reason?: string): Promise<AdminRoleResult> {
    try {
      // Get current session for authentication
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.access_token) {
        throw new Error('No authentication token available');
      }
      
      const response = await fetch('/api/admin/manage-role', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          action: 'revoke',
          targetUserId,
          reason: reason || 'Admin role revoked via admin panel'
        })
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to revoke admin role');
      }
      
      return result;
    } catch (error) {
      console.error('Error revoking admin role:', error);
      throw error;
    }
  }
  
  /**
   * Get admin audit logs
   * Shows complete history of admin privilege changes
   */
  async getAdminAuditLogs(options: {
    limit?: number;
    offset?: number;
    userId?: string;
  } = {}): Promise<{
    success: boolean;
    data: AdminAuditLog[];
    pagination: {
      offset: number;
      limit: number;
      count: number;
    };
    error?: string;
  }> {
    try {
      // Get current session for authentication
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.access_token) {
        throw new Error('No authentication token available');
      }
      
      const params = new URLSearchParams();
      if (options.limit) params.append('limit', options.limit.toString());
      if (options.offset) params.append('offset', options.offset.toString());
      if (options.userId) params.append('userId', options.userId);
      
      const response = await fetch(`/api/admin/manage-role?${params.toString()}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch audit logs');
      }
      
      return result;
    } catch (error) {
      console.error('Error fetching audit logs:', error);
      return {
        success: false,
        data: [],
        pagination: { offset: 0, limit: 0, count: 0 },
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
  
  /**
   * Validate that a user can perform admin operations
   * This is a client-side check for UI purposes only
   * Server-side verification is always required for actual operations
   */
  async validateAdminAccess(): Promise<boolean> {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) {
        return false;
      }
      
      // Check JWT metadata first
      if (session.user.app_metadata?.is_admin === true) {
        return true;
      }
      
      // Fallback database check
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('is_admin')
        .eq('id', session.user.id)
        .single();
      
      return profile?.is_admin || false;
    } catch (error) {
      console.error('Error validating admin access:', error);
      return false;
    }
  }
}

// Export singleton instance
export const secureAdminService = new SecureAdminService();

// Types are exported above as interfaces
