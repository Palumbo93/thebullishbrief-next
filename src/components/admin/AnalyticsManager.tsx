"use client";

import React, { useState } from 'react';
import { TrendingUp } from 'lucide-react';
import { TrafficSourceAnalytics } from './TrafficSourceAnalytics';

type AnalyticsTab = 'traffic-sources';

export const AnalyticsManager: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AnalyticsTab>('traffic-sources');

  const renderTabContent = () => {
    switch (activeTab) {
      case 'traffic-sources':
        return <TrafficSourceAnalytics />;
      default:
        return <TrafficSourceAnalytics />;
    }
  };

  return (
    <div style={{ animation: 'fadeIn 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards' }}>
      {/* Sub-tabs for Analytics */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--space-1)',
        marginBottom: 'var(--space-6)',
        borderBottom: '0.5px solid var(--color-border-primary)'
      }}>
        <button
          onClick={() => setActiveTab('traffic-sources')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-2)',
            padding: 'var(--space-3) var(--space-4)',
            background: 'transparent',
            color: activeTab === 'traffic-sources' ? 'var(--color-brand-primary)' : 'var(--color-text-secondary)',
            border: 'none',
            borderRadius: 'var(--radius-lg) var(--radius-lg) 0 0',
            cursor: 'pointer',
            transition: 'all var(--transition-base)',
            fontSize: 'var(--text-sm)',
            fontWeight: activeTab === 'traffic-sources' ? 'var(--font-semibold)' : 'var(--font-medium)',
            position: 'relative'
          }}
        >
          <TrendingUp style={{ width: '16px', height: '16px' }} />
          <span>Traffic Sources</span>
          {activeTab === 'traffic-sources' && (
            <div style={{
              position: 'absolute',
              bottom: '-1px',
              left: 0,
              right: 0,
              height: '2px',
              background: 'var(--color-brand-primary)',
              borderRadius: 'var(--radius-full)'
            }} />
          )}
        </button>
      </div>

      {/* Tab Content */}
      <div>
        {renderTabContent()}
      </div>
    </div>
  );
};
