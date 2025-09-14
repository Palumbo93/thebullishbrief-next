"use client";

import React, { useEffect, useState } from 'react';
import { X, CheckCircle, AlertCircle, Clock, ExternalLink } from 'lucide-react';
import { createPortal } from 'react-dom';
import { BuildStatus } from '../../hooks/useBuildTrigger';

interface BuildStatusPopupProps {
  buildStatus: BuildStatus;
  onDismiss: () => void;
}

export const BuildStatusPopup: React.FC<BuildStatusPopupProps> = ({ 
  buildStatus, 
  onDismiss 
}) => {
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    // Show popup when build starts or completes
    if (buildStatus.status === 'building' || buildStatus.status === 'ready' || buildStatus.status === 'error') {
      setVisible(true);
    }

    // Auto-dismiss successful builds after 5 seconds
    if (buildStatus.status === 'ready') {
      const timer = setTimeout(() => {
        setVisible(false);
        setTimeout(onDismiss, 300); // Wait for fade-out animation
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [buildStatus.status, onDismiss]);

  const handleDismiss = () => {
    setVisible(false);
    setTimeout(onDismiss, 300); // Wait for fade-out animation
  };

  if (!mounted || buildStatus.status === 'idle') {
    return null;
  }

  const getStatusConfig = () => {
    switch (buildStatus.status) {
      case 'building':
        return {
          icon: <Clock className="w-5 h-5 text-blue-600 animate-spin" />,
          title: 'Build in Progress',
          message: 'Your changes are being deployed...',
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
          textColor: 'text-blue-800'
        };
      case 'ready':
        return {
          icon: <CheckCircle className="w-5 h-5 text-green-600" />,
          title: 'Build Complete',
          message: 'Your changes are now live! 🎉',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          textColor: 'text-green-800'
        };
      case 'error':
        return {
          icon: <AlertCircle className="w-5 h-5 text-red-600" />,
          title: 'Build Failed',
          message: buildStatus.error || 'Build failed with unknown error',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          textColor: 'text-red-800'
        };
      default:
        return null;
    }
  };

  const statusConfig = getStatusConfig();
  if (!statusConfig) return null;

  const popup = (
    <div 
      className={`fixed top-4 right-4 z-50 max-w-sm w-full transform transition-all duration-300 ease-in-out ${
        visible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
      }`}
    >
      <div 
        className={`
          ${statusConfig.bgColor} ${statusConfig.borderColor} ${statusConfig.textColor}
          border rounded-lg shadow-lg p-4 backdrop-blur-sm
        `}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 mt-0.5">
              {statusConfig.icon}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium">
                {statusConfig.title}
              </p>
              <p className="text-sm mt-1 opacity-90">
                {statusConfig.message}
              </p>
              {buildStatus.triggeredBy && (
                <p className="text-xs mt-1 opacity-75">
                  Reason: {buildStatus.triggeredBy}
                </p>
              )}
              {buildStatus.lastBuildTime && buildStatus.status === 'ready' && (
                <p className="text-xs mt-1 opacity-75">
                  Completed at {new Date(buildStatus.lastBuildTime).toLocaleTimeString()}
                </p>
              )}
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="flex-shrink-0 ml-2 opacity-60 hover:opacity-100 transition-opacity"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        
        {buildStatus.deploymentId && (
          <div className="mt-3 pt-3 border-t border-current opacity-30">
            <div className="flex items-center justify-between text-xs">
              <span>Deployment ID: {buildStatus.deploymentId.slice(0, 8)}...</span>
              <button 
                className="flex items-center space-x-1 hover:underline"
                onClick={() => {
                  // In a real implementation, this would link to Vercel dashboard
                  console.log('View deployment:', buildStatus.deploymentId);
                }}
              >
                <ExternalLink className="w-3 h-3" />
                <span>View</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return createPortal(popup, document.body);
};
