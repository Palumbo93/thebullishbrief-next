"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Calendar, Filter, Download, RefreshCw, ExternalLink, TrendingUp, Users, MousePointer, BarChart3, Activity } from 'lucide-react';
import { ClarityTrafficData } from '../../services/clarityApi';

interface TrafficSourceAnalyticsProps {}

interface ExtendedTrafficData extends ClarityTrafficData {
  brokerageClicks: number;
  mediumIntentVisitors: number;
  highIntentVisitors: number;
  mediumIntentPercentage: number;
  highIntentPercentage: number;
}

export const TrafficSourceAnalytics: React.FC<TrafficSourceAnalyticsProps> = () => {
  const [data, setData] = useState<ExtendedTrafficData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPage, setSelectedPage] = useState<string>('all');
  const [numOfDays, setNumOfDays] = useState<1 | 2 | 3>(3);

  // Generate mock data that varies by page
  const generateMockDataForPage = (page: string): ExtendedTrafficData[] => {
    const baseMultiplier = page === '/' ? 1.5 : page === '/briefs' ? 1.2 : page === '/articles' ? 1.0 : 0.8;
    const intentMultiplier = page === '/briefs' ? 1.4 : page === '/articles' ? 1.2 : 1.0;
    
    return [
      {
        source: 'Google',
        sessions: Math.floor(1250 * baseMultiplier),
        pageViews: Math.floor(1890 * baseMultiplier),
        engagementTime: 180,
        scrollDepth: 75,
        bounceRate: page === '/' ? 45 : page === '/briefs' ? 35 : 50,
        brokerageClicks: Math.floor(1250 * baseMultiplier * 0.12 * intentMultiplier),
        mediumIntentVisitors: Math.floor(1250 * baseMultiplier * 0.25 * intentMultiplier),
        highIntentVisitors: Math.floor(1250 * baseMultiplier * 0.187 * intentMultiplier),
        mediumIntentPercentage: 25.3 * intentMultiplier,
        highIntentPercentage: 18.7 * intentMultiplier,
      },
      {
        source: 'Direct',
        sessions: Math.floor(890 * baseMultiplier),
        pageViews: Math.floor(1120 * baseMultiplier),
        engagementTime: 210,
        scrollDepth: 82,
        bounceRate: page === '/' ? 38 : page === '/briefs' ? 28 : 45,
        brokerageClicks: Math.floor(890 * baseMultiplier * 0.15 * intentMultiplier),
        mediumIntentVisitors: Math.floor(890 * baseMultiplier * 0.321 * intentMultiplier),
        highIntentVisitors: Math.floor(890 * baseMultiplier * 0.224 * intentMultiplier),
        mediumIntentPercentage: 32.1 * intentMultiplier,
        highIntentPercentage: 22.4 * intentMultiplier,
      },
      {
        source: 'Facebook',
        sessions: Math.floor(560 * baseMultiplier),
        pageViews: Math.floor(672 * baseMultiplier),
        engagementTime: 95,
        scrollDepth: 58,
        bounceRate: 62,
        brokerageClicks: Math.floor(560 * baseMultiplier * 0.08 * intentMultiplier),
        mediumIntentVisitors: Math.floor(560 * baseMultiplier * 0.182 * intentMultiplier),
        highIntentVisitors: Math.floor(560 * baseMultiplier * 0.121 * intentMultiplier),
        mediumIntentPercentage: 18.2 * intentMultiplier,
        highIntentPercentage: 12.1 * intentMultiplier,
      },
      {
        source: 'Twitter/X',
        sessions: Math.floor(320 * baseMultiplier),
        pageViews: Math.floor(456 * baseMultiplier),
        engagementTime: 120,
        scrollDepth: 68,
        bounceRate: 55,
        brokerageClicks: Math.floor(320 * baseMultiplier * 0.10 * intentMultiplier),
        mediumIntentVisitors: Math.floor(320 * baseMultiplier * 0.217 * intentMultiplier),
        highIntentVisitors: Math.floor(320 * baseMultiplier * 0.143 * intentMultiplier),
        mediumIntentPercentage: 21.7 * intentMultiplier,
        highIntentPercentage: 14.3 * intentMultiplier,
      },
      {
        source: 'LinkedIn',
        sessions: Math.floor(180 * baseMultiplier),
        pageViews: Math.floor(234 * baseMultiplier),
        engagementTime: 240,
        scrollDepth: 88,
        bounceRate: 35,
        brokerageClicks: Math.floor(180 * baseMultiplier * 0.18 * intentMultiplier),
        mediumIntentVisitors: Math.floor(180 * baseMultiplier * 0.358 * intentMultiplier),
        highIntentVisitors: Math.floor(180 * baseMultiplier * 0.249 * intentMultiplier),
        mediumIntentPercentage: 35.8 * intentMultiplier,
        highIntentPercentage: 24.9 * intentMultiplier,
      }
    ];
  };

  // Fetch traffic source data
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const url = new URL('/api/analytics/traffic-sources', window.location.origin);
      url.searchParams.set('numOfDays', numOfDays.toString());
      if (selectedPage !== 'all') {
        url.searchParams.set('page', selectedPage);
      }

      const response = await fetch(url.toString());
      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch analytics data');
      }

      // Enhance data with additional metrics
      const enhancedData: ExtendedTrafficData[] = result.data.map((item: ClarityTrafficData) => {
        // Mock additional metrics - in production, these would come from your database
        const brokerageClicks = Math.floor(item.sessions * 0.15 * Math.random());
        const mediumIntentVisitors = Math.floor(item.sessions * 0.25);
        const highIntentVisitors = Math.floor(item.sessions * 0.12);
        
        return {
          ...item,
          brokerageClicks,
          mediumIntentVisitors,
          highIntentVisitors,
          mediumIntentPercentage: mediumIntentVisitors / item.sessions * 100,
          highIntentPercentage: highIntentVisitors / item.sessions * 100,
        };
      });

      setData(enhancedData);

    } catch (err) {
      console.error('Error fetching traffic analytics:', err);
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      
      // Check if it's a rate limit error and provide helpful message
      if (errorMessage.includes('429') || errorMessage.includes('rate limit') || errorMessage.includes('daily limit')) {
        setError('Microsoft Clarity API daily limit exceeded. Using sample data for demo purposes.');
        // Use mock data when rate limited - adjust based on page
        const mockData = generateMockDataForPage(selectedPage);
        setData(mockData);
      } else {
        setError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  }, [numOfDays, selectedPage]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Filter data based on selected page (for now we'll show all sources, but in real implementation this would filter by page)
  const filteredData = data; // TODO: Implement page filtering when we have page data from API

  // Calculate totals
  const totals = filteredData.reduce((acc, item) => ({
    sessions: acc.sessions + item.sessions,
    pageViews: acc.pageViews + item.pageViews,
    brokerageClicks: acc.brokerageClicks + item.brokerageClicks,
    mediumIntentVisitors: acc.mediumIntentVisitors + item.mediumIntentVisitors,
    highIntentVisitors: acc.highIntentVisitors + item.highIntentVisitors,
  }), { sessions: 0, pageViews: 0, brokerageClicks: 0, mediumIntentVisitors: 0, highIntentVisitors: 0 });

  const exportData = () => {
    const csv = [
      ['Source', 'Sessions', 'Page Views', 'Brokerage Clicks', 'Medium Intent %', 'High Intent %', 'Bounce Rate %', 'Avg Engagement Time (s)'].join(','),
      ...filteredData.map(item => [
        item.source,
        item.sessions,
        item.pageViews,
        item.brokerageClicks,
        item.mediumIntentPercentage.toFixed(1),
        item.highIntentPercentage.toFixed(1),
        item.bounceRate.toFixed(1),
        (item.engagementTime / 1000).toFixed(1)
      ].join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const pageSlug = selectedPage === 'all' ? 'all-pages' : selectedPage.replace('/', '').replace(/\//g, '-') || 'homepage';
    a.download = `traffic-sources-${pageSlug}-last-${numOfDays}-days.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '400px',
        flexDirection: 'column',
        gap: 'var(--space-4)'
      }}>
        <RefreshCw style={{ width: '32px', height: '32px', color: 'var(--color-brand-primary)' }} className="spin" />
        <p style={{ color: 'var(--color-text-secondary)' }}>Loading traffic source analytics...</p>
      </div>
    );
  }

  // Only show error screen if there's an error AND no data (not rate limited)
  const isRateLimit = error && (error.includes('daily limit') || error.includes('429'));
  if (error && !isRateLimit) {
    return (
      <div style={{
        background: 'var(--color-error-bg)',
        border: '1px solid var(--color-error-border)',
        borderRadius: 'var(--radius-lg)',
        padding: 'var(--space-4)',
        textAlign: 'center'
      }}>
        <p style={{ color: 'var(--color-error)', margin: 0 }}>
          Error loading analytics: {error}
        </p>
        <button 
          onClick={fetchData}
          style={{
            marginTop: 'var(--space-3)',
            padding: 'var(--space-2) var(--space-4)',
            background: 'var(--color-error)',
            color: 'white',
            border: 'none',
            borderRadius: 'var(--radius-md)',
            cursor: 'pointer'
          }}
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 'var(--space-6)'
      }}>
        <div>
          <h2 style={{
            fontSize: 'var(--text-3xl)',
            fontFamily: 'var(--font-editorial)',
            fontWeight: 'var(--font-normal)',
            color: 'var(--color-text-primary)',
            marginBottom: 'var(--space-1)'
          }}>
            Traffic Source Analytics
          </h2>
          <p style={{
            fontFamily: 'var(--font-editorial)',
            color: 'var(--color-text-tertiary)',
            fontSize: 'var(--text-sm)'
          }}>
            Traffic by source • {selectedPage === 'all' ? 'All pages' : selectedPage} • Last {numOfDays} day{numOfDays !== 1 ? 's' : ''}
          </p>
        </div>
        
        <button
          onClick={fetchData}
          className="btn btn-secondary"
        >
          <RefreshCw style={{ width: '16px', height: '16px' }} />
          Refresh
        </button>
      </div>

      {/* Rate Limit Notice */}
      {isRateLimit && (
        <div style={{
          background: 'var(--color-warning-light)',
          border: '0.5px solid var(--color-warning)',
          padding: 'var(--space-4)',
          marginBottom: 'var(--space-6)',
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-3)'
        }}>
          <div style={{
            width: '32px',
            height: '32px',
            background: 'var(--color-warning)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <span style={{ color: 'white', fontSize: 'var(--text-lg)', fontWeight: 'bold' }}>!</span>
          </div>
          <div>
            <p style={{ 
              color: 'var(--color-warning-dark)', 
              margin: 0, 
              fontSize: 'var(--text-sm)',
              fontWeight: 'var(--font-medium)'
            }}>
              Microsoft Clarity API daily limit reached
            </p>
            <p style={{ 
              color: 'var(--color-text-secondary)', 
              margin: 0, 
              fontSize: 'var(--text-xs)',
              marginTop: 'var(--space-1)'
            }}>
              Showing sample data for demonstration. API access will reset tomorrow.
            </p>
          </div>
        </div>
      )}

      {/* Statistics Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: 0,
        marginBottom: 'var(--space-8)',
        border: '0.5px solid var(--color-border-primary)'
      }}>
        <div style={{
          background: 'transparent',
          borderRight: '0.5px solid var(--color-border-primary)',
          borderBottom: '0.5px solid var(--color-border-primary)',
          padding: 'var(--space-6)',
          transition: 'all var(--transition-slow)',
          cursor: 'pointer'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'var(--color-bg-secondary)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'transparent';
        }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 'var(--space-3)', 
            marginBottom: 'var(--space-4)' 
          }}>
            <TrendingUp style={{ width: '20px', height: '20px', color: 'var(--color-brand-primary)' }} />
            <span style={{ 
              fontSize: 'var(--text-sm)', 
              color: 'var(--color-text-secondary)', 
              fontWeight: 'var(--font-medium)' 
            }}>
              Total Sessions
            </span>
          </div>
          <p style={{ 
            fontSize: 'var(--text-3xl)', 
            fontWeight: 'var(--font-bold)', 
            color: 'var(--color-text-primary)',
            lineHeight: 1,
            letterSpacing: '-0.02em'
          }}>
            {filteredData.reduce((sum, item) => sum + item.sessions, 0).toLocaleString()}
          </p>
        </div>

        <div style={{
          background: 'transparent',
          borderRight: '0.5px solid var(--color-border-primary)',
          borderBottom: '0.5px solid var(--color-border-primary)',
          padding: 'var(--space-6)',
          transition: 'all var(--transition-slow)',
          cursor: 'pointer'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'var(--color-bg-secondary)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'transparent';
        }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 'var(--space-3)', 
            marginBottom: 'var(--space-4)' 
          }}>
            <BarChart3 style={{ width: '20px', height: '20px', color: 'var(--color-success)' }} />
            <span style={{ 
              fontSize: 'var(--text-sm)', 
              color: 'var(--color-text-secondary)', 
              fontWeight: 'var(--font-medium)' 
            }}>
              Avg. Engagement
            </span>
          </div>
          <p style={{ 
            fontSize: 'var(--text-3xl)', 
            fontWeight: 'var(--font-bold)', 
            color: 'var(--color-text-primary)',
            lineHeight: 1,
            letterSpacing: '-0.02em'
          }}>
            {filteredData.length > 0 ? Math.round(filteredData.reduce((sum, item) => sum + item.engagementTime, 0) / filteredData.length) : 0}s
          </p>
        </div>

        <div style={{
          background: 'transparent',
          borderRight: '0.5px solid var(--color-border-primary)',
          borderBottom: '0.5px solid var(--color-border-primary)',
          padding: 'var(--space-6)',
          transition: 'all var(--transition-slow)',
          cursor: 'pointer'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'var(--color-bg-secondary)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'transparent';
        }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 'var(--space-3)', 
            marginBottom: 'var(--space-4)' 
          }}>
            <Users style={{ width: '20px', height: '20px', color: 'var(--color-warning)' }} />
            <span style={{ 
              fontSize: 'var(--text-sm)', 
              color: 'var(--color-text-secondary)', 
              fontWeight: 'var(--font-medium)' 
            }}>
              Avg. Bounce Rate
            </span>
          </div>
          <p style={{ 
            fontSize: 'var(--text-3xl)', 
            fontWeight: 'var(--font-bold)', 
            color: 'var(--color-text-primary)',
            lineHeight: 1,
            letterSpacing: '-0.02em'
          }}>
            {filteredData.length > 0 ? Math.round(filteredData.reduce((sum, item) => sum + item.bounceRate, 0) / filteredData.length) : 0}%
          </p>
        </div>

        <div style={{
          background: 'transparent',
          borderRight: '0.5px solid var(--color-border-primary)',
          borderBottom: '0.5px solid var(--color-border-primary)',
          padding: 'var(--space-6)',
          transition: 'all var(--transition-slow)',
          cursor: 'pointer'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'var(--color-bg-secondary)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'transparent';
        }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 'var(--space-3)', 
            marginBottom: 'var(--space-4)' 
          }}>
            <Activity style={{ width: '20px', height: '20px', color: 'var(--color-brand-primary)' }} />
            <span style={{ 
              fontSize: 'var(--text-sm)', 
              color: 'var(--color-text-secondary)', 
              fontWeight: 'var(--font-medium)' 
            }}>
              Top Source
            </span>
          </div>
          <p style={{ 
            fontSize: 'var(--text-lg)', 
            fontWeight: 'var(--font-bold)', 
            color: 'var(--color-text-primary)',
            lineHeight: 1,
            letterSpacing: '-0.02em'
          }}>
            {filteredData.length > 0 ? filteredData.sort((a, b) => b.sessions - a.sessions)[0]?.source || 'None' : 'None'}
          </p>
        </div>
      </div>

      {/* Controls */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 'var(--space-6)',
        flexWrap: 'wrap',
        gap: 'var(--space-4)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
          {/* Page Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <Filter style={{ width: '16px', height: '16px', color: 'var(--color-text-secondary)' }} />
            <select
              value={selectedPage}
              onChange={(e) => setSelectedPage(e.target.value)}
              style={{
                padding: 'var(--space-2) var(--space-3)',
                border: '0.5px solid var(--color-border-primary)',
                borderRadius: 'var(--radius-md)',
                background: 'var(--color-bg-primary)',
                color: 'var(--color-text-primary)',
                fontSize: 'var(--text-sm)'
              }}
            >
              <option value="all">All Pages</option>
              <option value="/">Homepage</option>
              <option value="/briefs">Briefs</option>
              <option value="/articles">Articles</option>
              <option value="/about">About</option>
              <option value="/contact">Contact</option>
              <option value="/bull-room">Bull Room</option>
            </select>
          </div>

          {/* Days Selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <Calendar style={{ width: '16px', height: '16px', color: 'var(--color-text-secondary)' }} />
            <select
              value={numOfDays}
              onChange={(e) => setNumOfDays(parseInt(e.target.value) as 1 | 2 | 3)}
              style={{
                padding: 'var(--space-2) var(--space-3)',
                border: '0.5px solid var(--color-border-primary)',
                borderRadius: 'var(--radius-md)',
                background: 'var(--color-bg-primary)',
                color: 'var(--color-text-primary)',
                fontSize: 'var(--text-sm)'
              }}
            >
              <option value={1}>Last 1 day</option>
              <option value={2}>Last 2 days</option>
              <option value={3}>Last 3 days</option>
            </select>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
          <button
            onClick={exportData}
            className="btn btn-primary"
          >
            <Download style={{ width: '16px', height: '16px' }} />
            Export CSV
          </button>
        </div>
      </div>


      {/* Data Table */}
      <div style={{
        border: '0.5px solid var(--color-border-primary)',
        overflow: 'hidden'
      }}>
        <table style={{
          width: '100%',
          borderCollapse: 'collapse'
        }}>
          <thead style={{ position: 'sticky', top: 0 }}>
            <tr style={{
              background: 'var(--color-bg-secondary)',
              borderBottom: '0.5px solid var(--color-border-primary)'
            }}>
              <th style={{
                padding: 'var(--space-4)',
                textAlign: 'left',
                fontSize: 'var(--text-xs)',
                fontWeight: 'var(--font-semibold)',
                color: 'var(--color-text-secondary)',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                Traffic Source
              </th>
              <th style={{
                padding: 'var(--space-4)',
                textAlign: 'right',
                fontSize: 'var(--text-xs)',
                fontWeight: 'var(--font-semibold)',
                color: 'var(--color-text-secondary)',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                Sessions
              </th>
              <th style={{
                padding: 'var(--space-4)',
                textAlign: 'right',
                fontSize: 'var(--text-xs)',
                fontWeight: 'var(--font-semibold)',
                color: 'var(--color-text-secondary)',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                Page Views
              </th>
              <th style={{
                padding: 'var(--space-4)',
                textAlign: 'right',
                fontSize: 'var(--text-xs)',
                fontWeight: 'var(--font-semibold)',
                color: 'var(--color-text-secondary)',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                Brokerage Clicks
              </th>
              <th style={{
                padding: 'var(--space-4)',
                textAlign: 'right',
                fontSize: 'var(--text-xs)',
                fontWeight: 'var(--font-semibold)',
                color: 'var(--color-text-secondary)',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                Medium Intent %
              </th>
              <th style={{
                padding: 'var(--space-4)',
                textAlign: 'right',
                fontSize: 'var(--text-xs)',
                fontWeight: 'var(--font-semibold)',
                color: 'var(--color-text-secondary)',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                High Intent %
              </th>
              <th style={{
                padding: 'var(--space-4)',
                textAlign: 'right',
                fontSize: 'var(--text-xs)',
                fontWeight: 'var(--font-semibold)',
                color: 'var(--color-text-secondary)',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                Bounce Rate %
              </th>
              <th style={{
                padding: 'var(--space-4)',
                textAlign: 'right',
                fontSize: 'var(--text-xs)',
                fontWeight: 'var(--font-semibold)',
                color: 'var(--color-text-secondary)',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                Avg. Engagement (s)
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map((item, index) => (
              <tr
                key={item.source}
                style={{
                  borderBottom: index < filteredData.length - 1 ? '0.5px solid var(--color-border-primary)' : 'none',
                  transition: 'background var(--transition-base)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'var(--color-bg-secondary)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                }}
              >
                <td style={{ padding: 'var(--space-4)', fontSize: 'var(--text-sm)', color: 'var(--color-text-primary)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                      {item.source}
                      {item.source !== 'Direct' && item.source !== 'Unknown' && (
                        <ExternalLink style={{ width: '12px', height: '12px', color: 'var(--color-text-tertiary)' }} />
                      )}
                    </div>
                  </td>
                <td style={{ padding: 'var(--space-4)', textAlign: 'right', fontSize: 'var(--text-sm)', color: 'var(--color-text-primary)' }}>
                  {item.sessions.toLocaleString()}
                </td>
                <td style={{ padding: 'var(--space-4)', textAlign: 'right', fontSize: 'var(--text-sm)', color: 'var(--color-text-primary)' }}>
                  {item.pageViews.toLocaleString()}
                </td>
                <td style={{ padding: 'var(--space-4)', textAlign: 'right', fontSize: 'var(--text-sm)', color: 'var(--color-success)', fontWeight: 'var(--font-medium)' }}>
                  {item.brokerageClicks.toLocaleString()}
                </td>
                <td style={{ padding: 'var(--space-4)', textAlign: 'right', fontSize: 'var(--text-sm)', color: 'var(--color-text-primary)' }}>
                  <span style={{ 
                    color: item.mediumIntentPercentage > 20 ? 'var(--color-success)' : item.mediumIntentPercentage > 10 ? 'var(--color-warning)' : 'var(--color-text-secondary)'
                  }}>
                    {item.mediumIntentPercentage.toFixed(1)}%
                  </span>
                </td>
                <td style={{ padding: 'var(--space-4)', textAlign: 'right', fontSize: 'var(--text-sm)', color: 'var(--color-text-primary)' }}>
                  <span style={{ 
                    color: item.highIntentPercentage > 15 ? 'var(--color-success)' : item.highIntentPercentage > 8 ? 'var(--color-warning)' : 'var(--color-text-secondary)',
                    fontWeight: item.highIntentPercentage > 15 ? 'var(--font-semibold)' : 'normal'
                  }}>
                    {item.highIntentPercentage.toFixed(1)}%
                  </span>
                </td>
                <td style={{ padding: 'var(--space-4)', textAlign: 'right', fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)' }}>
                  <span style={{ 
                    color: item.bounceRate < 40 ? 'var(--color-success)' : item.bounceRate < 70 ? 'var(--color-warning)' : 'var(--color-error)'
                  }}>
                    {item.bounceRate.toFixed(1)}%
                  </span>
                </td>
                <td style={{ padding: 'var(--space-4)', textAlign: 'right', fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)' }}>
                  {item.engagementTime.toFixed(0)}s
                </td>
                </tr>
              ))}
            </tbody>
        </table>

        {filteredData.length === 0 && (
          <div style={{
            padding: 'var(--space-8)',
            textAlign: 'center',
            color: 'var(--color-text-secondary)'
          }}>
            No traffic source data available for the selected filters.
          </div>
        )}
      </div>
    </div>
  );
};
