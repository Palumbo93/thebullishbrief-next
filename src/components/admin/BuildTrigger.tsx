"use client";

import React from 'react';
import { Button } from '../ui/Button';
import { useBuildTrigger } from '../../hooks/useBuildTrigger';

interface BuildTriggerProps {
  className?: string;
}

export const BuildTrigger: React.FC<BuildTriggerProps> = ({ className = '' }) => {
  const { triggerBuild, buildStatus } = useBuildTrigger();

  const handleBuildClick = async () => {
    console.log('🖱️ Manual build button clicked');
    try {
      const result = await triggerBuild('Manual build trigger from admin');
      console.log('🏗️ Manual build result:', result);
    } catch (error) {
      console.error('❌ Manual build failed:', error);
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
      {buildStatus.status === 'ready' && buildStatus.lastBuildTime && (
        <div className="bg-green-50 border border-green-200 rounded-md p-4">
          <p className="text-green-800 font-medium">
            Build completed successfully ✅
          </p>
          <div className="mt-2 text-sm text-green-700">
            <p>• Full deployment triggered</p>
            <p className="text-xs mt-1 text-green-600">
              Completed at {new Date(buildStatus.lastBuildTime).toLocaleTimeString()}
            </p>
            {buildStatus.triggeredBy && (
              <p className="text-xs text-green-600">Reason: {buildStatus.triggeredBy}</p>
            )}
          </div>
        </div>
      )}

      {buildStatus.status === 'building' && (
        <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
          <p className="text-blue-800 font-medium">
            Build in progress... 🔄
          </p>
          <div className="mt-2 text-sm text-blue-700">
            <p>• Deployment triggered and building</p>
            {buildStatus.deploymentId && (
              <p className="text-xs text-blue-600">Deployment ID: {buildStatus.deploymentId}</p>
            )}
          </div>
        </div>
      )}

      {buildStatus.status === 'error' && buildStatus.error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-800 font-medium">Build failed ❌</p>
          <p className="text-red-700 text-sm mt-1">{buildStatus.error}</p>
        </div>
      )}

      {/* Build Options */}
      <div className="bg-white border border-gray-200 rounded-md p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Manual Build</h3>
        
        <div className="space-y-4">
          <div>
            <Button
              onClick={handleBuildClick}
              disabled={buildStatus.isBuilding}
              className="w-full justify-center"
              variant="primary"
            >
              {buildStatus.isBuilding ? 'Building...' : 'Build All Content'}
            </Button>
            <p className="text-sm text-gray-500 mt-1">
              Manually trigger a full site rebuild (includes published content and drafts)
            </p>
          </div>
        </div>
      </div>

      {/* Info Section */}
      <div className="bg-gray-50 border border-gray-200 rounded-md p-4">
        <h4 className="text-sm font-medium text-gray-900 mb-2">Automatic Build System</h4>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• Builds are automatically triggered when you create or edit content</li>
          <li>• All pages are revalidated and new pages are generated (includes draft content)</li>
          <li>• You'll see a notification popup when builds start and complete</li>
          <li>• Manual builds are useful for debugging or force-refreshing</li>
          <li>• Process typically completes in 10-30 seconds</li>
        </ul>
        <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded">
          <p className="text-xs text-blue-800">
            <strong>Note:</strong> Content operations complete immediately. Builds happen in the background and you'll be notified when your changes go live.
          </p>
        </div>
      </div>
    </div>
  );
};
