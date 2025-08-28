"use client";

import React, { useState } from 'react';
import { Button } from '../ui/Button';
import { supabase } from '@/lib/supabase';

interface BuildTriggerProps {
  className?: string;
}

interface BuildResult {
  type: string;
  revalidatedPaths: string[];
  triggeredDeploy: boolean;
  timestamp: string;
}

export const BuildTrigger: React.FC<BuildTriggerProps> = ({ className = '' }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [lastResult, setLastResult] = useState<BuildResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const triggerBuild = async (type: 'all' | 'articles' | 'briefs' | 'authors') => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Get current session for authentication
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.access_token) {
        throw new Error('No authentication token available');
      }
      
      const response = await fetch('/api/trigger-build', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ type }),
      });

      if (!response.ok) {
        throw new Error(`Build failed: ${response.statusText}`);
      }

      const result = await response.json();
      setLastResult({
        type,
        revalidatedPaths: result.revalidatedPaths || [],
        triggeredDeploy: result.triggeredDeploy || false,
        timestamp: result.timestamp
      });
      
      // Clear success message after 10 seconds
      setTimeout(() => setLastResult(null), 10000);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Build failed');
      
      // Clear error after 10 seconds
      setTimeout(() => setError(null), 10000);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold text-gray-900">Build Manager</h2>
        <p className="text-gray-600">
          Trigger rebuilds to update your site content with the latest database changes.
        </p>
      </div>

      {/* Status Messages */}
      {lastResult && (
        <div className="bg-green-50 border border-green-200 rounded-md p-4">
          <p className="text-green-800 font-medium">
            Build triggered successfully for {lastResult.type === 'all' ? 'all content' : lastResult.type}
          </p>
          <div className="mt-2 text-sm text-green-700">
            <p>• Revalidated {lastResult.revalidatedPaths.length} path{lastResult.revalidatedPaths.length !== 1 ? 's' : ''}</p>
            {lastResult.triggeredDeploy && (
              <p>• Full deployment triggered</p>
            )}
            <p className="text-xs mt-1 text-green-600">
              Completed at {new Date(lastResult.timestamp).toLocaleTimeString()}
            </p>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-800 font-medium">Build failed</p>
          <p className="text-red-700 text-sm mt-1">{error}</p>
        </div>
      )}

      {/* Build Options */}
      <div className="bg-white border border-gray-200 rounded-md p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Build Options</h3>
        
        <div className="space-y-4">
          <div>
            <Button
              onClick={() => triggerBuild('all')}
              disabled={isLoading}
              className="w-full justify-center"
              variant="primary"
            >
              {isLoading ? 'Building...' : 'Build All Content'}
            </Button>
            <p className="text-sm text-gray-500 mt-1">
              Rebuild all articles, briefs, and authors
            </p>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Button
                onClick={() => triggerBuild('articles')}
                disabled={isLoading}
                className="w-full justify-center"
                variant="secondary"
              >
                {isLoading ? 'Building...' : 'Build Articles'}
              </Button>
              <p className="text-sm text-gray-500 mt-1">
                Rebuild article pages only
              </p>
            </div>

            <div>
              <Button
                onClick={() => triggerBuild('briefs')}
                disabled={isLoading}
                className="w-full justify-center"
                variant="secondary"
              >
                {isLoading ? 'Building...' : 'Build Briefs'}
              </Button>
              <p className="text-sm text-gray-500 mt-1">
                Rebuild brief pages only
              </p>
            </div>

            <div>
              <Button
                onClick={() => triggerBuild('authors')}
                disabled={isLoading}
                className="w-full justify-center"
                variant="secondary"
              >
                {isLoading ? 'Building...' : 'Build Authors'}
              </Button>
              <p className="text-sm text-gray-500 mt-1">
                Rebuild author pages only
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Info Section */}
      <div className="bg-gray-50 border border-gray-200 rounded-md p-4">
        <h4 className="text-sm font-medium text-gray-900 mb-2">What happens during a build?</h4>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• All existing pages are revalidated with latest content</li>
          <li>• Individual article/brief/author pages are refreshed</li>
          <li>• CDN cache is cleared for updated pages</li>
          <li>• New content becomes immediately accessible</li>
          <li>• "Build All" triggers a full deployment for new pages</li>
          <li>• Process typically completes in 10-30 seconds</li>
        </ul>
        <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded">
          <p className="text-xs text-blue-800">
            <strong>For new articles/authors:</strong> Use "Build All" to ensure new pages are generated and accessible.
            Individual builds only refresh existing content.
          </p>
        </div>
      </div>
    </div>
  );
};
