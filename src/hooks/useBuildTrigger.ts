import { useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export interface BuildStatus {
  isBuilding: boolean;
  lastBuildTime: string | null;
  deploymentId: string | null;
  status: 'idle' | 'pending' | 'building' | 'ready' | 'error';
  error: string | null;
  triggeredBy?: string;
}

export interface BuildResult {
  success: boolean;
  deploymentId?: string;
  message?: string;
  error?: string;
  timestamp: string;
}

/**
 * Hook for triggering builds and tracking build status
 */
export function useBuildTrigger() {
  const [buildStatus, setBuildStatus] = useState<BuildStatus>({
    isBuilding: false,
    lastBuildTime: null,
    deploymentId: null,
    status: 'idle',
    error: null,
  });

  const triggerBuild = useCallback(async (reason?: string): Promise<BuildResult> => {
    console.log('🔨 Build trigger called with reason:', reason);
    
    setBuildStatus(prev => ({
      ...prev,
      isBuilding: true,
      status: 'pending',
      error: null,
      triggeredBy: reason,
    }));

    try {
      // Get current session for authentication
      console.log('🔐 Getting authentication session...');
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.access_token) {
        throw new Error('No authentication token available');
      }
      
      console.log('🌐 Making request to /api/trigger-build...');
      const response = await fetch('/api/trigger-build', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ 
          type: 'all', // Always trigger full build as requested
          reason 
        }),
      });

      console.log('📡 Response status:', response.status, response.statusText);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Build API error:', errorText);
        throw new Error(`Build failed: ${response.statusText} - ${errorText}`);
      }

      const result = await response.json();
      console.log('✅ Build API response:', result);
      const timestamp = new Date().toISOString();
      
      setBuildStatus(prev => ({
        ...prev,
        isBuilding: true, // Keep building state until webhook confirms completion
        status: 'building',
        lastBuildTime: timestamp,
        deploymentId: result.deploymentId || null,
        error: null,
      }));

      return {
        success: true,
        deploymentId: result.deploymentId,
        message: result.message,
        timestamp,
      };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Build failed';
      console.error('❌ Build trigger failed:', error);
      
      setBuildStatus(prev => ({
        ...prev,
        isBuilding: false,
        status: 'error',
        error: errorMessage,
      }));

      return {
        success: false,
        error: errorMessage,
        timestamp: new Date().toISOString(),
      };
    }
  }, []);

  const updateBuildStatus = useCallback((newStatus: Partial<BuildStatus>) => {
    setBuildStatus(prev => ({ ...prev, ...newStatus }));
  }, []);

  const resetBuildStatus = useCallback(() => {
    setBuildStatus({
      isBuilding: false,
      lastBuildTime: null,
      deploymentId: null,
      status: 'idle',
      error: null,
    });
  }, []);

  return {
    triggerBuild,
    buildStatus,
    updateBuildStatus,
    resetBuildStatus,
  };
}
