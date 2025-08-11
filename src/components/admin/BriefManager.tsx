"use client";

import React, { useState, useMemo } from 'react';
import { Plus, Edit, Eye, Trash2, Star, StarOff, Search, Filter, X, ChevronDown, Briefcase } from 'lucide-react';
import { useAllBriefs } from '../../hooks/useBriefs';
import { BriefCreateModal } from './BriefCreateModal';
import { BriefEditModal } from './BriefEditModal';
import { Brief } from '../../hooks/useBriefs';
import { supabase } from '../../lib/supabase';
import { useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../../lib/queryClient';
import { ManagerHeader } from './ManagerHeader';

interface BriefManagerProps {}

export const BriefManager: React.FC<BriefManagerProps> = () => {
  const { data: briefs, isLoading, error } = useAllBriefs();
  const queryClient = useQueryClient();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedBrief, setSelectedBrief] = useState<Brief | null>(null);
  

  
  // Search and filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'draft' | 'published'>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState<'created_at' | 'updated_at' | 'title' | 'view_count'>('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const handleEdit = (brief: Brief) => {
    setSelectedBrief(brief);
    setIsEditModalOpen(true);
  };

  const handleDelete = async (brief: Brief) => {
    if (!confirm(`Are you sure you want to delete "${brief.title}"?`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('briefs')
        .delete()
        .eq('id', brief.id);

      if (error) {
        console.error('Error deleting brief:', error);
        alert('Error deleting brief: ' + error.message);
      } else {
        // Invalidate and refetch briefs
        queryClient.invalidateQueries({ queryKey: queryKeys.briefs.all });
        queryClient.invalidateQueries({ queryKey: queryKeys.briefs.featured() });
      }
    } catch (error) {
      console.error('Error deleting brief:', error);
      alert('Error deleting brief');
    }
  };

  const handleToggleFeatured = async (brief: Brief) => {
    try {
      // If this brief is being featured, unfeature all others first
      if (!brief.featured) {
        await supabase
          .from('briefs')
          .update({ featured: false })
          .eq('featured', true);
      }

      // Toggle the featured status
      const { error } = await supabase
        .from('briefs')
        .update({ featured: !brief.featured })
        .eq('id', brief.id);

      if (error) {
        console.error('Error updating brief:', error);
        alert('Error updating brief: ' + error.message);
      } else {
        // Invalidate and refetch briefs
        queryClient.invalidateQueries({ queryKey: queryKeys.briefs.all });
        queryClient.invalidateQueries({ queryKey: queryKeys.briefs.featured() });
      }
    } catch (error) {
      console.error('Error updating brief:', error);
      alert('Error updating brief');
    }
  };

  // Filter and search briefs
  const filteredBriefs = useMemo(() => {
    let filtered = [...(briefs || [])];

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(brief =>
        brief.title.toLowerCase().includes(query) ||
        brief.subtitle?.toLowerCase().includes(query) ||
        brief.slug.toLowerCase().includes(query) ||
        brief.company_name?.toLowerCase().includes(query)
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(brief => brief.status === statusFilter);
    }

    // Sort briefs
    filtered.sort((a, b) => {
      let aValue: any = a[sortBy];
      let bValue: any = b[sortBy];

      if (sortBy === 'created_at' || sortBy === 'updated_at') {
        aValue = new Date(aValue).getTime();
        bValue = new Date(bValue).getTime();
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [briefs, searchQuery, statusFilter, sortBy, sortOrder]);

  const hasActiveFilters = Boolean(searchQuery || statusFilter !== 'all');

  const clearFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published':
        return 'var(--color-success)';
      case 'draft':
        return 'var(--color-warning)';
      default:
        return 'var(--color-text-tertiary)';
    }
  };

  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '400px'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '3px solid var(--color-border-primary)',
            borderTop: '3px solid var(--color-brand-primary)',
            borderRadius: 'var(--radius-full)',
            margin: '0 auto var(--space-4)'
          }} className="animate-spin"></div>
          <p style={{ color: 'var(--color-text-tertiary)' }}>Loading briefs...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        padding: 'var(--space-8)',
        textAlign: 'center'
      }}>
        <p style={{ color: 'var(--color-error)' }}>Error loading briefs: {error.message}</p>
      </div>
    );
  }

  return (
    <div>
      {/* Header with Create Button */}
      <ManagerHeader
        title="Briefs"
        itemCount={filteredBriefs.length}
        totalCount={briefs?.length || 0}
        hasActiveFilters={hasActiveFilters}
        createButtonText="Create Brief"
        onCreateClick={() => setIsCreateModalOpen(true)}
      />

      {/* Search and Filter Bar */}
      <div style={{
      }}>
        {/* Search Bar */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-3)',
          marginBottom: 'var(--space-4)'
        }}>
          <div style={{
            position: 'relative',
            flex: 1
          }}>
            <Search style={{
              position: 'absolute',
              left: 'var(--space-3)',
              top: '50%',
              transform: 'translateY(-50%)',
              width: '16px',
              height: '16px',
              color: 'var(--color-text-tertiary)'
            }} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search briefs..."
              style={{
                width: '100%',
                height: 'var(--input-height)',
                padding: '0 var(--space-3) 0 calc(var(--space-3) + 16px + var(--space-2))',
                background: 'var(--color-bg-tertiary)',
                border: '0.5px solid var(--color-border-primary)',
                borderRadius: 'var(--radius-lg)',
                color: 'var(--color-text-primary)',
                fontSize: 'var(--text-base)',
                transition: 'all var(--transition-base)'
              }}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                style={{
                  position: 'absolute',
                  right: 'var(--space-3)',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--color-text-tertiary)'
                }}
              >
                <X style={{ width: '16px', height: '16px' }} />
              </button>
            )}
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`btn ${showFilters ? 'btn-primary' : 'btn-secondary'}`}
            style={{ fontSize: 'var(--text-sm)' }}
          >
            <Filter style={{ width: '16px', height: '16px' }} />
            <span>Filters</span>
          </button>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="btn btn-ghost"
              style={{ fontSize: 'var(--text-sm)' }}
            >
              Clear All
            </button>
          )}
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: 'var(--space-4)',
            padding: 'var(--space-4)',
            background: 'var(--color-bg-tertiary)',
            border: '0.5px solid var(--color-border-primary)',
            borderRadius: 'var(--radius-lg)',
            marginBottom: 'var(--space-4)'
          }}>
            {/* Status Filter */}
            <div>
              <label style={{
                display: 'block',
                fontSize: 'var(--text-sm)',
                fontWeight: 'var(--font-medium)',
                color: 'var(--color-text-primary)',
                marginBottom: 'var(--space-2)'
              }}>
                Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                style={{
                  width: '100%',
                  height: 'var(--input-height)',
                  padding: '0 var(--space-3)',
                  background: 'var(--color-bg-tertiary)',
                  border: '0.5px solid var(--color-border-primary)',
                  borderRadius: 'var(--radius-lg)',
                  color: 'var(--color-text-primary)',
                  fontSize: 'var(--text-base)'
                }}
              >
                <option value="all">All Statuses</option>
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </div>

            {/* Sort Options */}
            <div>
              <label style={{
                display: 'block',
                fontSize: 'var(--text-sm)',
                fontWeight: 'var(--font-medium)',
                color: 'var(--color-text-primary)',
                marginBottom: 'var(--space-2)'
              }}>
                Sort By
              </label>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-2)'
              }}>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  style={{
                    flex: 1,
                    height: 'var(--input-height)',
                    padding: '0 var(--space-3)',
                    background: 'var(--color-bg-tertiary)',
                    border: '0.5px solid var(--color-border-primary)',
                    borderRadius: 'var(--radius-lg)',
                    color: 'var(--color-text-primary)',
                    fontSize: 'var(--text-base)'
                  }}
                >
                  <option value="created_at">Created Date</option>
                  <option value="updated_at">Updated Date</option>
                  <option value="title">Title</option>
                  <option value="view_count">Views</option>
                </select>
                <button
                  onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                  className="btn btn-ghost"
                  style={{
                    padding: 'var(--space-2)',
                    fontSize: 'var(--text-sm)'
                  }}
                >
                  <ChevronDown style={{
                    width: '16px',
                    height: '16px',
                    transform: sortOrder === 'asc' ? 'rotate(180deg)' : 'none',
                    transition: 'transform var(--transition-base)'
                  }} />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Briefs Table */}
      <div style={{
        background: 'var(--color-bg-card)',
        border: '0.5px solid var(--color-border-primary)',
        borderRadius: 'var(--radius-xl)',
        overflow: 'hidden'
      }}>
        {filteredBriefs.length === 0 ? (
          <div style={{
            padding: 'var(--space-8)',
            textAlign: 'center'
          }}>
            <Briefcase style={{
              width: '48px',
              height: '48px',
              color: 'var(--color-text-muted)',
              margin: '0 auto var(--space-4)'
            }} />
            <h3 style={{
              fontSize: 'var(--text-lg)',
              fontWeight: 'var(--font-semibold)',
              color: 'var(--color-text-primary)',
              marginBottom: 'var(--space-2)'
            }}>
              {briefs?.length === 0 ? 'No briefs yet' : 'No briefs found'}
            </h3>
            <p style={{
              color: 'var(--color-text-tertiary)',
              marginBottom: 'var(--space-4)'
            }}>
              {briefs?.length === 0 
                ? 'Create your first brief to get started.'
                : 'Try adjusting your search or filter criteria.'
              }
            </p>
            {briefs?.length === 0 && (
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="btn btn-primary"
                style={{ fontSize: 'var(--text-sm)' }}
              >
                <Plus style={{ width: '16px', height: '16px' }} />
                <span>Create Brief</span>
              </button>
            )}
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{
              width: '100%',
              borderCollapse: 'collapse'
            }}>
              <thead>
                <tr style={{
                  background: 'var(--color-bg-secondary)',
                  borderBottom: '0.5px solid var(--color-border-primary)'
                }}>
                  <th style={{
                    padding: 'var(--space-4)',
                    textAlign: 'left',
                    fontSize: 'var(--text-sm)',
                    fontWeight: 'var(--font-semibold)',
                    color: 'var(--color-text-primary)',
                    borderBottom: '0.5px solid var(--color-border-primary)',
                    width: '40%'
                  }}>
                    Title
                  </th>
                  <th style={{
                    padding: 'var(--space-4)',
                    textAlign: 'left',
                    fontSize: 'var(--text-sm)',
                    fontWeight: 'var(--font-semibold)',
                    color: 'var(--color-text-primary)',
                    borderBottom: '0.5px solid var(--color-border-primary)'
                  }}>
                    Status
                  </th>
                  <th style={{
                    padding: 'var(--space-4)',
                    textAlign: 'left',
                    fontSize: 'var(--text-sm)',
                    fontWeight: 'var(--font-semibold)',
                    color: 'var(--color-text-primary)',
                    borderBottom: '0.5px solid var(--color-border-primary)'
                  }}>
                    Featured
                  </th>
                  <th style={{
                    padding: 'var(--space-4)',
                    textAlign: 'left',
                    fontSize: 'var(--text-sm)',
                    fontWeight: 'var(--font-semibold)',
                    color: 'var(--color-text-primary)',
                    borderBottom: '0.5px solid var(--color-border-primary)'
                  }}>
                    Views
                  </th>
                  <th style={{
                    padding: 'var(--space-4)',
                    textAlign: 'left',
                    fontSize: 'var(--text-sm)',
                    fontWeight: 'var(--font-semibold)',
                    color: 'var(--color-text-primary)',
                    borderBottom: '0.5px solid var(--color-border-primary)'
                  }}>
                    Created
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredBriefs.map((brief) => (
                  <tr
                    key={brief.id}
                    style={{
                      borderBottom: '0.5px solid var(--color-border-primary)',
                      transition: 'all var(--transition-base)',
                      cursor: 'pointer'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'var(--color-bg-card-hover)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'transparent';
                    }}
                    onClick={() => {
                      setSelectedBrief(brief);
                      setIsEditModalOpen(true);
                    }}
                  >
                    <td style={{
                      padding: 'var(--space-4)',
                      fontSize: 'var(--text-base)',
                      color: 'var(--color-text-primary)',
                      fontWeight: 'var(--font-medium)'
                    }}>
                      {brief.title}
                    </td>
                    <td style={{
                      padding: 'var(--space-4)',
                      fontSize: 'var(--text-sm)'
                    }}>
                      <span style={{
                        padding: 'var(--space-1) var(--space-2)',
                        background: 'var(--color-bg-tertiary)',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: 'var(--text-xs)',
                        color: getStatusColor(brief.status || 'draft'),
                        fontWeight: 'var(--font-medium)',
                        textTransform: 'uppercase'
                      }}>
                        {brief.status || 'draft'}
                      </span>
                    </td>
                    <td style={{
                      padding: 'var(--space-4)',
                      fontSize: 'var(--text-sm)',
                      color: 'var(--color-text-primary)'
                    }}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleFeatured(brief);
                        }}
                        style={{
                          padding: 'var(--space-1)',
                          borderRadius: 'var(--radius-full)',
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          color: brief.featured ? 'var(--color-warning)' : 'var(--color-text-tertiary)',
                          transition: 'color var(--transition-base)'
                        }}
                        title={brief.featured ? 'Unfeature' : 'Make Featured'}
                      >
                        {brief.featured ? <Star size={16} /> : <StarOff size={16} />}
                      </button>
                    </td>
                    <td style={{
                      padding: 'var(--space-4)',
                      fontSize: 'var(--text-sm)',
                      color: 'var(--color-text-primary)'
                    }}>
                      {brief.view_count || 0}
                    </td>
                    <td style={{
                      padding: 'var(--space-4)',
                      fontSize: 'var(--text-sm)',
                      color: 'var(--color-text-tertiary)'
                    }}>
                      {formatDate(brief.created_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modals */}
      {isCreateModalOpen && (
        <BriefCreateModal
          onClose={() => setIsCreateModalOpen(false)}
        />
      )}

      {isEditModalOpen && selectedBrief && (
        <BriefEditModal
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedBrief(null);
          }}
          brief={selectedBrief}
        />
      )}
    </div>
  );
}; 