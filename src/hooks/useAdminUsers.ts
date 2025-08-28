/**
 * Admin Users Hook
 * 
 * Custom hook for managing user data in the admin portal
 * with comprehensive user information and activity stats.
 */

import { useState, useEffect } from 'react';
import { AdminUserService, ComprehensiveUserInfo } from '../services/adminUserService';
import { UserService } from '../services/database';

interface UseAdminUsersReturn {
  users: Array<{
    id: string;
    email: string;
    username: string;
    is_admin: boolean | null;
    newsletter_subscribed: boolean | null;
    subscription_tier: string | null;
    created_at: string;
    updated_at: string | null;
    total_views: number;
    total_bookmarks: number;
    total_messages: number;
    last_activity_at: string | null;
  }>;
  loading: boolean;
  error: string | null;
  getUserInfo: (userId: string) => Promise<ComprehensiveUserInfo>;
  refreshUsers: () => Promise<void>;
  updateUser: (id: string, userData: any) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;
  createUser: (userData: any) => Promise<void>;
}

export const useAdminUsers = (): UseAdminUsersReturn => {
  const [users, setUsers] = useState<UseAdminUsersReturn['users']>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const userService = new UserService();

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const usersWithStats = await AdminUserService.getAllUsersWithStats();
      setUsers(usersWithStats);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch users');
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  const getUserInfo = async (userId: string): Promise<ComprehensiveUserInfo> => {
    try {
      return await AdminUserService.getUserInfo(userId);
    } catch (err) {
      const error = err instanceof Error ? err.message : 'Failed to fetch user info';
      throw new Error(error);
    }
  };

  const refreshUsers = async () => {
    await fetchUsers();
  };

  const updateUser = async (id: string, userData: any) => {
    try {
      await userService.update(id, userData);
      await refreshUsers(); // Refresh the list to show updated data
    } catch (err) {
      const error = err instanceof Error ? err.message : 'Failed to update user';
      throw new Error(error);
    }
  };

  const deleteUser = async (id: string) => {
    try {
      await userService.delete(id);
      await refreshUsers(); // Refresh the list to remove deleted user
    } catch (err) {
      const error = err instanceof Error ? err.message : 'Failed to delete user';
      throw new Error(error);
    }
  };

  const createUser = async (userData: any) => {
    try {
      await userService.create(userData);
      await refreshUsers(); // Refresh the list to show new user
    } catch (err) {
      const error = err instanceof Error ? err.message : 'Failed to create user';
      throw new Error(error);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return {
    users,
    loading,
    error,
    getUserInfo,
    refreshUsers,
    updateUser,
    deleteUser,
    createUser
  };
};
