"use client";

import React, { useState, useEffect } from 'react';
import { Mail, Users, TrendingUp, Calendar, RefreshCw, X, Download } from 'lucide-react';
import { fetchEmailsGroupedByEntity, getEmailStats, type EmailsByEntity } from '../../services/emailService';

interface EmailStats {
  total: number;
  bySource: Record<string, number>;
  byStatus: Record<string, number>;
  recentCount: number;
}

export const EmailManager: React.FC = () => {
  const [emailGroups, setEmailGroups] = useState<EmailsByEntity[]>([]);
  const [stats, setStats] = useState<EmailStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedGroup, setSelectedGroup] = useState<EmailsByEntity | null>(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    loadEmailData();
  }, []);

  const loadEmailData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [groups, statistics] = await Promise.all([
        fetchEmailsGroupedByEntity(),
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

  const handleGroupClick = (group: EmailsByEntity) => {
    setSelectedGroup(group);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedGroup(null);
  };

  const parseSource = (source: string | null) => {
    if (!source) return { device: 'Unknown', type: 'Unknown' };
    
    const parts = source.toLowerCase().split('_');
    if (parts.length >= 2) {
      const device = parts[0] === 'mobile' ? 'Mobile' : parts[0] === 'desktop' ? 'Desktop' : 'Unknown';
      const type = parts[1] === 'widget' ? 'Widget' : parts[1] === 'popup' ? 'Popup' : parts[1] === 'author' ? 'Author' : parts[1] || 'Unknown';
      return { device, type };
    }
    
    // Handle legacy sources
    switch (source.toLowerCase()) {
      case 'popup':
        return { device: 'Desktop', type: 'Popup' };
      case 'widget':
        return { device: 'Desktop', type: 'Widget' };
      case 'newsletter':
        return { device: 'Unknown', type: 'Newsletter' };
      case 'manual':
        return { device: 'Unknown', type: 'Manual' };
      default:
        return { device: 'Unknown', type: source };
    }
  };

  const handleExportEmails = () => {
    if (!selectedGroup) return;
    
    const csvContent = [
      ['Email', 'Device', 'Type', 'Date'],
      ...selectedGroup.emails.map(email => {
        const { device, type } = parseSource(email.source);
        return [
          email.email,
          device,
          type,
          email.created_date ? formatDate(email.created_date) : 'Unknown'
        ];
      })
    ].map(row => row.join(',')).join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${selectedGroup.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_emails.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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





  if (loading) {
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
              Email Collection
            </h2>
            <p style={{
              fontFamily: 'var(--font-editorial)',
              color: 'var(--color-text-tertiary)',
              fontSize: 'var(--text-sm)'
            }}>
              Loading...
            </p>
          </div>
        </div>

        {/* Loading Skeleton Grid */}
        <div style={{ 
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 0,
          marginBottom: 'var(--space-8)',
          border: '0.5px solid var(--color-border-primary)'
        }}>
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={`stat-skeleton-${index}`} style={{
              background: 'transparent',
              borderRight: '0.5px solid var(--color-border-primary)',
              borderBottom: '0.5px solid var(--color-border-primary)',
              padding: 'var(--space-6)',
              height: '120px'
            }}>
              <div style={{
                width: '60%',
                height: '16px',
                background: 'var(--color-bg-tertiary)',
                marginBottom: 'var(--space-4)',
                animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
              }} />
              <div style={{
                width: '40%',
                height: '32px',
                background: 'var(--color-bg-tertiary)',
                animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
              }} />
            </div>
          ))}
        </div>

        {/* Loading Grid for Email Groups */}
        <div style={{ 
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))',
          gap: 0,
          border: '0.5px solid var(--color-border-primary)'
        }}>
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={`skeleton-${index}`} style={{ 
              background: 'transparent',
              borderBottom: '0.5px solid var(--color-border-primary)',
              borderRight: '0.5px solid var(--color-border-primary)',
              padding: 'var(--space-6)',
              height: '200px'
            }}>
              {/* Title Skeleton */}
              <div style={{
                width: '80%',
                height: '20px',
                background: 'var(--color-bg-tertiary)',
                marginBottom: 'var(--space-3)',
                animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
              }} />
              
              {/* Badge Skeleton */}
              <div style={{
                width: '60px',
                height: '16px',
                background: 'var(--color-bg-tertiary)',
                marginBottom: 'var(--space-4)',
                animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
              }} />

              {/* Email List Skeleton */}
              {Array.from({ length: 3 }).map((_, emailIndex) => (
                <div key={emailIndex} style={{
                  width: '100%',
                  height: '14px',
                  background: 'var(--color-bg-tertiary)',
                  marginBottom: 'var(--space-2)',
                  animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
                }} />
              ))}
            </div>
          ))}
        </div>

        <style>{`
          @keyframes pulse {
            0%, 100% {
              opacity: 1;
            }
            50% {
              opacity: .5;
            }
          }
        `}</style>
      </div>
    );
  }

  if (error) {
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
              Email Collection
            </h2>
            <p style={{
              fontFamily: 'var(--font-editorial)',
              color: 'var(--color-text-tertiary)',
              fontSize: 'var(--text-sm)'
            }}>
              Error loading data
            </p>
          </div>
        </div>

        {/* Error State */}
        <div style={{ 
          textAlign: 'center', 
          padding: 'var(--space-16)',
          border: '0.5px solid var(--color-border-primary)'
        }}>
          <div style={{
            width: '64px',
            height: '64px',
            background: 'var(--color-bg-tertiary)',
            border: '0.5px solid var(--color-border-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto var(--space-4)'
          }}>
            <Mail style={{ width: '32px', height: '32px', color: 'var(--color-error)' }} />
          </div>
          <h3 style={{ 
            fontSize: 'var(--text-xl)', 
            fontFamily: 'var(--font-editorial)',
            fontWeight: 'var(--font-normal)',
            marginBottom: 'var(--space-2)',
            color: 'var(--color-text-primary)',
            letterSpacing: '-0.02em'
          }}>
            Error loading email data
          </h3>
          <p style={{ 
            color: 'var(--color-text-tertiary)',
            fontSize: 'var(--text-sm)',
            marginBottom: 'var(--space-4)'
          }}>
            {error}
          </p>
          <button
            onClick={loadEmailData}
            className="btn btn-primary"
          >
            <RefreshCw style={{ width: '16px', height: '16px' }} />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const totalEmails = stats?.total || 0;
  const displayedEmails = emailGroups.reduce((sum, group) => sum + group.count, 0);

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
            Email Collection
          </h2>
          <p style={{
            fontFamily: 'var(--font-editorial)',
            color: 'var(--color-text-tertiary)',
            fontSize: 'var(--text-sm)'
          }}>
            {displayedEmails} of {totalEmails} emails
          </p>
        </div>
        
        <button
          onClick={loadEmailData}
          className="btn btn-secondary"
        >
          <RefreshCw style={{ width: '16px', height: '16px' }} />
          Refresh
        </button>
      </div>

      {/* Statistics Cards */}
      {stats && (
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
              <Users style={{ width: '20px', height: '20px', color: 'var(--color-brand-primary)' }} />
              <span style={{ 
                fontSize: 'var(--text-sm)', 
                color: 'var(--color-text-secondary)', 
                fontWeight: 'var(--font-medium)' 
              }}>
                Total Emails
              </span>
            </div>
            <p style={{ 
              fontSize: 'var(--text-3xl)', 
              fontWeight: 'var(--font-bold)', 
              color: 'var(--color-text-primary)',
              lineHeight: 1,
              letterSpacing: '-0.02em'
            }}>
              {stats.total.toLocaleString()}
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
              <TrendingUp style={{ width: '20px', height: '20px', color: 'var(--color-success)' }} />
              <span style={{ 
                fontSize: 'var(--text-sm)', 
                color: 'var(--color-text-secondary)', 
                fontWeight: 'var(--font-medium)' 
              }}>
                Last 7 Days
              </span>
            </div>
            <p style={{ 
             fontSize: 'var(--text-3xl)', 
             fontWeight: 'var(--font-bold)', 
             color: 'var(--color-text-primary)',
             lineHeight: 1,
             letterSpacing: '-0.02em'
            }}>
              {stats.recentCount.toLocaleString()}
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
              <Calendar style={{ width: '20px', height: '20px', color: 'var(--color-brand-primary)' }} />
              <span style={{ 
                fontSize: 'var(--text-sm)', 
                color: 'var(--color-text-secondary)', 
                fontWeight: 'var(--font-medium)' 
              }}>
                Device Split
              </span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
              {(() => {
                const deviceCounts = { desktop: 0, mobile: 0 };
                emailGroups.forEach(group => {
                  group.emails.forEach(email => {
                    const { device } = parseSource(email.source);
                    if (device.toLowerCase() === 'desktop') deviceCounts.desktop++;
                    else if (device.toLowerCase() === 'mobile') deviceCounts.mobile++;
                  });
                });
                const total = deviceCounts.desktop + deviceCounts.mobile;
                const desktopPct = total > 0 ? Math.round((deviceCounts.desktop / total) * 100) : 0;
                const mobilePct = total > 0 ? Math.round((deviceCounts.mobile / total) * 100) : 0;
                
                return (
                  <>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)' }}>Desktop</span>
                      <span style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--font-bold)', color: 'var(--color-text-primary)' }}>{desktopPct}%</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)' }}>Mobile</span>
                      <span style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--font-bold)', color: 'var(--color-text-primary)' }}>{mobilePct}%</span>
                    </div>
                  </>
                );
              })()}
            </div>
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
              <Calendar style={{ width: '20px', height: '20px', color: 'var(--color-warning)' }} />
              <span style={{ 
                fontSize: 'var(--text-sm)', 
                color: 'var(--color-text-secondary)', 
                fontWeight: 'var(--font-medium)' 
              }}>
                Type Split
              </span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
              {(() => {
                const typeCounts = { popup: 0, widget: 0, author: 0 };
                emailGroups.forEach(group => {
                  group.emails.forEach(email => {
                    const { type } = parseSource(email.source);
                    if (type.toLowerCase() === 'popup') typeCounts.popup++;
                    else if (type.toLowerCase() === 'widget') typeCounts.widget++;
                    else if (type.toLowerCase() === 'author') typeCounts.author++;
                  });
                });
                const total = typeCounts.popup + typeCounts.widget + typeCounts.author;
                const popupPct = total > 0 ? Math.round((typeCounts.popup / total) * 100) : 0;
                const widgetPct = total > 0 ? Math.round((typeCounts.widget / total) * 100) : 0;
                const authorPct = total > 0 ? Math.round((typeCounts.author / total) * 100) : 0;
                
                return (
                  <>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)' }}>Popup</span>
                      <span style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--font-bold)', color: 'var(--color-text-primary)' }}>{popupPct}%</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)' }}>Widget</span>
                      <span style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--font-bold)', color: 'var(--color-text-primary)' }}>{widgetPct}%</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)' }}>Author</span>
                      <span style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--font-bold)', color: 'var(--color-text-primary)' }}>{authorPct}%</span>
                    </div>
                  </>
                );
              })()}
            </div>
          </div>
        </div>
      )}

      {/* Email Groups */}
      <div>
        {emailGroups.length === 0 ? (
          <div style={{
            padding: 'var(--space-16)',
            textAlign: 'center',
            border: '0.5px solid var(--color-border-primary)'
          }}>
            <div style={{
              width: '64px',
              height: '64px',
              background: 'var(--color-bg-tertiary)',
              border: '0.5px solid var(--color-border-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto var(--space-4)'
            }}>
              <Mail style={{ width: '32px', height: '32px', color: 'var(--color-text-tertiary)' }} />
            </div>
            <h3 style={{
              fontSize: 'var(--text-xl)',
              fontFamily: 'var(--font-editorial)',
              fontWeight: 'var(--font-normal)',
              color: 'var(--color-text-primary)',
              marginBottom: 'var(--space-2)',
              letterSpacing: '-0.02em'
            }}>
              No Emails Collected Yet
            </h3>
            <p style={{
              color: 'var(--color-text-secondary)',
              fontSize: 'var(--text-sm)',
              lineHeight: 'var(--leading-relaxed)'
            }}>
              Email addresses will appear here once users start submitting through your lead generation forms.
            </p>
          </div>
        ) : (
          <div style={{ 
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))',
            gap: 0,
            border: '0.5px solid var(--color-border-primary)'
          }}>
            {emailGroups.map((group, index) => {
              const entityKey = group.id ? `${group.type}-${group.id}` : `${group.type}-unassigned`;
              
              return (
                <div key={entityKey} style={{
                  background: 'transparent',
                  borderBottom: '0.5px solid var(--color-border-primary)',
                  borderRight: '0.5px solid var(--color-border-primary)',
                  padding: 'var(--space-6)',
                  cursor: 'pointer',
                  transition: 'all var(--transition-slow)',
                  display: 'flex',
                  flexDirection: 'column',
                  minHeight: '200px'
                }}
                onClick={() => handleGroupClick(group)}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'var(--color-bg-secondary)';
                  e.currentTarget.style.borderColor = 'var(--color-border-secondary)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.borderColor = 'var(--color-border-primary)';
                }}>
                  
                  {/* Header */}
                  <div style={{ marginBottom: 'var(--space-4)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-3)' }}>
                      <h3 style={{
                        fontSize: 'var(--text-lg)',
                        fontFamily: 'var(--font-editorial)',
                        fontWeight: 'var(--font-normal)',
                        color: 'var(--color-text-primary)',
                        lineHeight: 'var(--leading-tight)',
                        letterSpacing: '-0.02em',
                        flex: 1,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}>
                        {group.title}
                      </h3>
                      
                      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', flexShrink: 0 }}>
                        <span style={{
                          fontSize: 'var(--text-xs)',
                          backgroundColor: group.type === 'brief' ? 'var(--color-bg-tertiary)' : group.type === 'author' ? 'var(--color-success-light)' : 'var(--color-warning-light)',
                          color: group.type === 'brief' ? 'var(--color-brand-primary)' : group.type === 'author' ? 'var(--color-success)' : 'var(--color-warning)',
                          padding: 'var(--space-1) var(--space-2)',
                          border: '0.5px solid var(--color-border-primary)',
                          whiteSpace: 'nowrap',
                          fontWeight: 'var(--font-medium)',
                          textTransform: 'capitalize'
                        }}>
                          {group.type}
                        </span>
                        <span style={{
                          fontSize: 'var(--text-xs)',
                          backgroundColor: 'var(--color-bg-tertiary)',
                          color: 'var(--color-brand-primary)',
                          padding: 'var(--space-1) var(--space-2)',
                          border: '0.5px solid var(--color-border-primary)',
                          whiteSpace: 'nowrap',
                          fontWeight: 'var(--font-medium)'
                        }}>
                          {group.count} email{group.count !== 1 ? 's' : ''}
                        </span>
                      </div>
                    </div>

                    {group.subtitle && (
                      <p style={{
                        color: 'var(--color-text-secondary)',
                        fontSize: 'var(--text-sm)',
                        marginBottom: 'var(--space-3)'
                      }}>
                        {group.subtitle}
                      </p>
                    )}
                  </div>

                  {/* Email Preview */}
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                    {group.emails.slice(0, 3).map((email, emailIndex) => (
                      <div key={email.id} style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: 'var(--space-2) 0',
                        borderBottom: emailIndex < Math.min(group.emails.length, 3) - 1 ? '0.5px solid var(--color-border-primary)' : 'none',
                        fontSize: 'var(--text-sm)'
                      }}>
                        <span style={{ 
                          color: 'var(--color-text-primary)',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          flex: 1,
                          marginRight: 'var(--space-2)'
                        }}>
                          {email.email}
                        </span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', flexShrink: 0 }}>
                          {email.created_date && (
                            <span style={{
                              color: 'var(--color-text-tertiary)',
                              fontSize: 'var(--text-xs)'
                            }}>
                              {new Date(email.created_date).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                    
                    {group.count > 3 && (
                      <div style={{
                        marginTop: 'auto',
                        paddingTop: 'var(--space-3)',
                        textAlign: 'center'
                      }}>
                        <span style={{
                          fontSize: 'var(--text-xs)',
                          color: 'var(--color-text-muted)',
                        }}>
                          Click to view all {group.count} emails
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Email List Modal */}
      {showModal && selectedGroup && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 50,
          padding: 'var(--space-4)'
        }}
        onClick={handleCloseModal}>
          <div style={{
            background: 'var(--color-bg-primary)',
            border: '0.5px solid var(--color-border-primary)',
            width: '90%',
            maxWidth: '850px',
            maxHeight: '80vh',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
          }}
          onClick={(e) => e.stopPropagation()}>
            
            {/* Modal Header */}
            <div style={{
              padding: 'var(--space-6)',
              borderBottom: '0.5px solid var(--color-border-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div>
                <h3 style={{
                  fontSize: 'var(--text-xl)',
                  fontFamily: 'var(--font-editorial)',
                  fontWeight: 'var(--font-normal)',
                  color: 'var(--color-text-primary)',
                  marginBottom: 'var(--space-1)',
                  letterSpacing: '-0.02em'
                }}>
                  {selectedGroup.title}
                </h3>
                {selectedGroup.subtitle && (
                  <p style={{
                    color: 'var(--color-text-secondary)',
                    fontSize: 'var(--text-sm)',
                  }}>
                    {selectedGroup.subtitle}
                  </p>
                )}
                <p style={{
                  color: 'var(--color-text-tertiary)',
                  fontSize: 'var(--text-sm)',
                  marginTop: 'var(--space-1)'
                }}>
                  {selectedGroup.count} email{selectedGroup.count !== 1 ? 's' : ''}
                </p>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                <button
                  onClick={handleExportEmails}
                  className="btn btn-secondary"
                >
                  <Download style={{ width: '16px', height: '16px' }} />
                  Export CSV
                </button>
                <button
                  onClick={handleCloseModal}
                  className="btn btn-ghost"
                  style={{ padding: 'var(--space-2)' }}
                >
                  <X style={{ width: '20px', height: '20px' }} />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div style={{
              flex: 1,
              overflow: 'auto'
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
                      letterSpacing: '0.5px',
                      width: '50px'
                    }}>
                      #
                    </th>
                    <th style={{
                      padding: 'var(--space-4)',
                      textAlign: 'left',
                      fontSize: 'var(--text-xs)',
                      fontWeight: 'var(--font-semibold)',
                      color: 'var(--color-text-secondary)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}>
                      Email Address
                    </th>
                    <th style={{
                      padding: 'var(--space-4)',
                      textAlign: 'left',
                      fontSize: 'var(--text-xs)',
                      fontWeight: 'var(--font-semibold)',
                      color: 'var(--color-text-secondary)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      width: '100px'
                    }}>
                      Device
                    </th>
                    <th style={{
                      padding: 'var(--space-4)',
                      textAlign: 'left',
                      fontSize: 'var(--text-xs)',
                      fontWeight: 'var(--font-semibold)',
                      color: 'var(--color-text-secondary)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      width: '100px'
                    }}>
                      Type
                    </th>
                    <th style={{
                      padding: 'var(--space-4)',
                      textAlign: 'left',
                      fontSize: 'var(--text-xs)',
                      fontWeight: 'var(--font-semibold)',
                      color: 'var(--color-text-secondary)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      width: '180px'
                    }}>
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {selectedGroup.emails.map((email, emailIndex) => (
                    <tr
                      key={email.id}
                      style={{
                        borderBottom: emailIndex < selectedGroup.emails.length - 1 ? '0.5px solid var(--color-border-primary)' : 'none',
                        transition: 'background var(--transition-base)'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'var(--color-bg-secondary)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'transparent';
                      }}
                    >
                      <td style={{
                        padding: 'var(--space-4)',
                        fontSize: 'var(--text-sm)',
                        color: 'var(--color-text-tertiary)'
                      }}>
                        {emailIndex + 1}
                      </td>
                      <td style={{
                        padding: 'var(--space-4)',
                        fontSize: 'var(--text-sm)',
                        color: 'var(--color-text-primary)'
                      }}>
                        {email.email}
                      </td>
                      <td style={{
                        padding: 'var(--space-4)',
                        fontSize: 'var(--text-sm)',
                        color: 'var(--color-text-secondary)'
                      }}>
                        {parseSource(email.source).device}
                      </td>
                      <td style={{
                        padding: 'var(--space-4)',
                        fontSize: 'var(--text-sm)',
                        color: 'var(--color-text-secondary)'
                      }}>
                        {parseSource(email.source).type}
                      </td>
                      <td style={{
                        padding: 'var(--space-4)',
                        fontSize: 'var(--text-xs)',
                        color: 'var(--color-text-tertiary)'
                      }}>
                        {email.created_date ? formatDate(email.created_date) : 'Unknown'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
