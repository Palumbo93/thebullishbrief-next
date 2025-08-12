"use client";

import React, { useState } from 'react';
import { Button } from '../ui/Button';

interface BuildTriggerProps {
  className?: string;
}

export const BuildTrigger: React.FC<BuildTriggerProps> = ({ className = '' }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [lastTriggered, setLastTriggered] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const triggerBuild = async (type: 'all' | 'articles' | 'briefs') => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/trigger-build', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ type }),
      });

      if (!response.ok) {
        throw new Error(`Build failed: ${response.statusText}`);
      }

      const result = await response.json();
      setLastTriggered(type);
      
      // Clear success message after 5 seconds
      setTimeout(() => setLastTriggered(null), 5000);
      
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
      {lastTriggered && (
        <div className="bg-green-50 border border-green-200 rounded-md p-4">
          <p className="text-green-800 font-medium">
            Build triggered successfully for {lastTriggered === 'all' ? 'all content' : lastTriggered}.
          </p>
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
              Rebuild all articles and briefs
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
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
          </div>
        </div>
      </div>

      {/* Info Section */}
      <div className="bg-gray-50 border border-gray-200 rounded-md p-4">
        <h4 className="text-sm font-medium text-gray-900 mb-2">What happens during a build?</h4>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• Static pages are regenerated with latest content</li>
          <li>• CDN cache is cleared for updated pages</li>
          <li>• SEO metadata and Open Graph tags are updated</li>
          <li>• Build typically takes 30-60 seconds to complete</li>
        </ul>
      </div>
    </div>
  );
};
