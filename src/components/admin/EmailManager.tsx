"use client";

import React, { useState, useEffect } from 'react';
import { Mail, Users, TrendingUp, Calendar, ExternalLink, Download } from 'lucide-react';
import { fetchEmailsGroupedByBrief, getEmailStats, type EmailsByBrief } from '../../services/emailService';

interface EmailStats {
  total: number;
  bySource: Record<string, number>;
  byStatus: Record<string, number>;
  recentCount: number;
}

export const EmailManager: React.FC = () => {
  const [emailGroups, setEmailGroups] = useState<EmailsByBrief[]>([]);
  const [stats, setStats] = useState<EmailStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadEmailData();
  }, []);

  const loadEmailData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [groups, statistics] = await Promise.all([
        fetchEmailsGroupedByBrief(),
        getEmailStats()
      ]);
      
      setEmailGroups(groups);
      setStats(statistics);
    } catch (err) {
      console.error('Error loading email data:', err);
      setError('Failed to load email data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const toggleGroupExpanded = (briefId: string) => {
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(briefId)) {
      newExpanded.delete(briefId);
    } else {
      newExpanded.add(briefId);
    }
    setExpandedGroups(newExpanded);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getSourceIcon = (source: string) => {
    switch (source) {
      case 'popup': return '🔔';
      case 'widget': return '📱';
      case 'newsletter': return '📧';
      case 'manual': return '✏️';
      default: return '❓';
    }
  };



  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '400px',
        color: 'var(--color-text-secondary)'
      }}>
        <div style={{ textAlign: 'center' }}>
          <Mail style={{ width: '48px', height: '48px', marginBottom: 'var(--space-4)' }} />
          <p>Loading email data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '400px',
        textAlign: 'center',
        color: 'var(--color-error)'
      }}>
        <Mail style={{ width: '48px', height: '48px', marginBottom: 'var(--space-4)' }} />
        <p style={{ marginBottom: 'var(--space-4)' }}>{error}</p>
        <button
          onClick={loadEmailData}
          className="btn btn-primary"
          style={{ fontSize: 'var(--text-sm)' }}
        >
          Try Again
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
          <h1 style={{
            fontSize: 'var(--text-2xl)',
            fontWeight: 'var(--font-bold)',
            color: 'var(--color-text-primary)',
            marginBottom: 'var(--space-2)'
          }}>
            Email Collection
          </h1>
          <p style={{
            color: 'var(--color-text-secondary)',
            fontSize: 'var(--text-base)'
          }}>
            Monitor and manage collected email addresses grouped by brief
          </p>
        </div>
        
        <button
          onClick={loadEmailData}
          className="btn btn-secondary"
          style={{ fontSize: 'var(--text-sm)' }}
        >
          <Download style={{ width: '16px', height: '16px' }} />
          Refresh
        </button>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: 'var(--space-4)',
          marginBottom: 'var(--space-8)'
        }}>
          <div style={{
            background: 'var(--color-bg-secondary)',
            border: '0.5px solid var(--color-border-primary)',
            borderRadius: 'var(--radius-lg)',
            padding: 'var(--space-4)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-2)' }}>
              <Users style={{ width: '20px', height: '20px', color: 'var(--color-brand-primary)' }} />
              <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)' }}>Total Emails</span>
            </div>
            <p style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--font-bold)', color: 'var(--color-text-primary)' }}>
              {stats.total}
            </p>
          </div>

          <div style={{
            background: 'var(--color-bg-secondary)',
            border: '0.5px solid var(--color-border-primary)',
            borderRadius: 'var(--radius-lg)',
            padding: 'var(--space-4)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-2)' }}>
              <TrendingUp style={{ width: '20px', height: '20px', color: 'var(--color-success)' }} />
              <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)' }}>Last 7 Days</span>
            </div>
            <p style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--font-bold)', color: 'var(--color-text-primary)' }}>
              {stats.recentCount}
            </p>
          </div>

          <div style={{
            background: 'var(--color-bg-secondary)',
            border: '0.5px solid var(--color-border-primary)',
            borderRadius: 'var(--radius-lg)',
            padding: 'var(--space-4)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-2)' }}>
              <Calendar style={{ width: '20px', height: '20px', color: 'var(--color-warning)' }} />
              <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)' }}>Top Source</span>
            </div>
            <p style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--font-semibold)', color: 'var(--color-text-primary)' }}>
              {Object.entries(stats.bySource).sort(([,a], [,b]) => b - a)[0]?.[0] || 'N/A'}
            </p>
          </div>
        </div>
      )}

      {/* Email Groups */}
      <div style={{
        background: 'var(--color-bg-secondary)',
        border: '0.5px solid var(--color-border-primary)',
        borderRadius: 'var(--radius-lg)',
        overflow: 'hidden'
      }}>
        {emailGroups.length === 0 ? (
          <div style={{
            padding: 'var(--space-8)',
            textAlign: 'center',
            color: 'var(--color-text-secondary)'
          }}>
            <Mail style={{ width: '48px', height: '48px', marginBottom: 'var(--space-4)', margin: '0 auto' }} />
            <p>No emails collected yet</p>
          </div>
        ) : (
          emailGroups.map((group, index) => {
            const briefId = group.briefId || 'no-brief';
            const isExpanded = expandedGroups.has(briefId);
            
            return (
              <div key={briefId}>
                {index > 0 && (
                  <div style={{ height: '0.5px', background: 'var(--color-border-primary)' }} />
                )}
                
                {/* Group Header */}
                <div
                  style={{
                    padding: 'var(--space-4)',
                    cursor: 'pointer',
                    transition: 'background var(--transition-base)',
                    background: isExpanded ? 'var(--color-bg-tertiary)' : 'transparent'
                  }}
                  onClick={() => toggleGroupExpanded(briefId)}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                      <h3 style={{
                        fontSize: 'var(--text-lg)',
                        fontWeight: 'var(--font-semibold)',
                        color: 'var(--color-text-primary)',
                        marginBottom: 'var(--space-1)'
                      }}>
                        {group.briefTitle}
                      </h3>
                      {group.companyName && (
                        <p style={{
                          fontSize: 'var(--text-sm)',
                          color: 'var(--color-text-secondary)'
                        }}>
                          {group.companyName}
                        </p>
                      )}
                    </div>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                      <span style={{
                        background: 'var(--color-brand-primary)',
                        color: 'var(--color-text-inverse)',
                        padding: 'var(--space-1) var(--space-3)',
                        borderRadius: 'var(--radius-full)',
                        fontSize: 'var(--text-sm)',
                        fontWeight: 'var(--font-medium)'
                      }}>
                        {group.count} emails
                      </span>
                      
                      <ExternalLink
                        style={{
                          width: '16px',
                          height: '16px',
                          color: 'var(--color-text-tertiary)',
                          transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                          transition: 'transform var(--transition-base)'
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Group Content */}
                {isExpanded && (
                  <div style={{
                    padding: '0 var(--space-4) var(--space-4)',
                    background: 'var(--color-bg-primary)'
                  }}>
                    <div style={{ display: 'grid', gap: 'var(--space-2)' }}>
                      {group.emails.map((email, emailIndex) => (
                        <div
                          key={email.id}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: 'var(--space-3)',
                            background: 'var(--color-bg-secondary)',
                            border: '0.5px solid var(--color-border-primary)',
                            borderRadius: 'var(--radius-md)',
                            fontSize: 'var(--text-sm)'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-tertiary)' }}>
                              #{emailIndex + 1}
                            </span>
                            <span style={{ fontWeight: 'var(--font-medium)', color: 'var(--color-text-primary)' }}>
                              {email.email}
                            </span>
                          </div>
                          
                          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                            <span title={`Source: ${email.source || 'unknown'}`}>
                              {getSourceIcon(email.source || 'unknown')}
                            </span>
                            

                            {email.created_date && (
                              <span style={{
                                color: 'var(--color-text-tertiary)',
                                fontSize: 'var(--text-xs)'
                              }}>
                                {formatDate(email.created_date)}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
