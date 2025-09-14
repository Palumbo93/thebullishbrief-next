"use client";

import React, { useState, useMemo } from 'react';
import { Plus, MessageSquare, Search, Filter, X, ChevronDown } from 'lucide-react';
import { useAdminBullRooms, useCreateBullRoom, useUpdateBullRoom, useDeleteBullRoom } from '../../hooks/useAdminBullRooms';
import { BullRoomCreateModal } from './BullRoomCreateModal';
import { BullRoomEditModal } from './BullRoomEditModal';
import { BullRoomDeleteModal } from './BullRoomDeleteModal';
import { ManagerHeader } from './ManagerHeader';
import { BullRoom } from '../../lib/database.aliases';

interface BullRoomManagerProps {}

export const BullRoomManager: React.FC<BullRoomManagerProps> = () => {
  const { data: bullRooms = [], isLoading: loading } = useAdminBullRooms();
  const createBullRoom = useCreateBullRoom();
  const updateBullRoom = useUpdateBullRoom();
  const deleteBullRoom = useDeleteBullRoom();

  // Generate slug from name
  const generateSlug = (name: string): string => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()
      .replace(/^-+|-+$/g, '');
  };

  const [selectedRoom, setSelectedRoom] = useState<BullRoom | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Search and filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [featuredFilter, setFeaturedFilter] = useState<'all' | 'featured' | 'not-featured'>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState<'created_at' | 'updated_at' | 'name' | 'message_count' | 'sort_order'>('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Filter and search rooms
  const filteredRooms = useMemo(() => {
    let filtered = [...bullRooms];

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(room =>
        room.name.toLowerCase().includes(query) ||
        room.topic.toLowerCase().includes(query) ||
        room.slug.toLowerCase().includes(query) ||
        room.description?.toLowerCase().includes(query)
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(room => 
        statusFilter === 'active' ? room.is_active : !room.is_active
      );
    }

    // Featured filter
    if (featuredFilter !== 'all') {
      filtered = filtered.filter(room => 
        featuredFilter === 'featured' ? room.is_featured : !room.is_featured
      );
    }

    // Sort rooms
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
  }, [bullRooms, searchQuery, statusFilter, featuredFilter, sortBy, sortOrder]);

  const hasActiveFilters = Boolean(searchQuery || statusFilter !== 'all' || featuredFilter !== 'all');

  const clearFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
    setFeaturedFilter('all');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusColor = (isActive: boolean) => {
    return isActive ? 'var(--color-success)' : 'var(--color-error)';
  };

  // Handle CRUD operations
  const handleCreateRoom = async (roomData: Omit<BullRoom, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      await createBullRoom.mutateAsync(roomData);
      setShowCreateModal(false);
    } catch (error) {
      console.error('Failed to create bull room:', error);
    }
  };

  const handleUpdateRoom = async (roomData: Partial<BullRoom> & { id: string }) => {
    try {
      await updateBullRoom.mutateAsync(roomData);
      setShowEditModal(false);
      setSelectedRoom(null);
    } catch (error) {
      console.error('Failed to update bull room:', error);
    }
  };

  const handleDeleteRoom = async (id: string) => {
    try {
      await deleteBullRoom.mutateAsync(id);
      setShowDeleteModal(false);
      setSelectedRoom(null);
    } catch (error) {
      console.error('Failed to delete bull room:', error);
    }
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'var(--space-8)',
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
          <p style={{ color: 'var(--color-text-tertiary)' }}>Loading bull rooms...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header with Create Button */}
      <ManagerHeader
        title="Bull Rooms"
        itemCount={filteredRooms.length}
        totalCount={bullRooms.length}
        hasActiveFilters={hasActiveFilters}
        createButtonText="Create Bull Room"
        onCreateClick={() => setShowCreateModal(true)}
      />

      {/* Search and Filter Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--space-3)',
        marginBottom: 'var(--space-4)'
      }}>
        {/* Search Bar */}
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
            placeholder="Search bull rooms..."
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
          borderTop: '0.5px solid var(--color-border-primary)',
          paddingTop: 'var(--space-4)',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 'var(--space-4)',
          marginBottom: 'var(--space-6)'
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
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          {/* Featured Filter */}
          <div>
            <label style={{
              display: 'block',
              fontSize: 'var(--text-sm)',
              fontWeight: 'var(--font-medium)',
              color: 'var(--color-text-primary)',
              marginBottom: 'var(--space-2)'
            }}>
              Featured
            </label>
            <select
              value={featuredFilter}
              onChange={(e) => setFeaturedFilter(e.target.value as any)}
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
              <option value="all">All Rooms</option>
              <option value="featured">Featured Only</option>
              <option value="not-featured">Not Featured</option>
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
                <option value="name">Name</option>
                <option value="message_count">Messages</option>
                <option value="sort_order">Sort Order</option>
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

      {/* Bull Rooms Table */}
      <div style={{
        background: 'var(--color-bg-card)',
        border: '0.5px solid var(--color-border-primary)',
        borderRadius: 'var(--radius-xl)',
        overflow: 'hidden'
      }}>
        {filteredRooms.length === 0 ? (
          <div style={{
            padding: 'var(--space-8)',
            textAlign: 'center'
          }}>
            <MessageSquare style={{
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
              {bullRooms.length === 0 ? 'No bull rooms yet' : 'No bull rooms found'}
            </h3>
            <p style={{
              color: 'var(--color-text-tertiary)',
              marginBottom: 'var(--space-4)'
            }}>
              {bullRooms.length === 0 
                ? 'Create your first bull room to get started.'
                : 'Try adjusting your search or filter criteria.'
              }
            </p>
            {bullRooms.length === 0 && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="btn btn-primary"
                style={{ fontSize: 'var(--text-sm)' }}
              >
                <Plus style={{ width: '16px', height: '16px' }} />
                <span>Create Bull Room</span>
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
                    width: '30%'
                  }}>
                    Room
                  </th>
                  <th style={{
                    padding: 'var(--space-4)',
                    textAlign: 'left',
                    fontSize: 'var(--text-sm)',
                    fontWeight: 'var(--font-semibold)',
                    color: 'var(--color-text-primary)',
                    borderBottom: '0.5px solid var(--color-border-primary)'
                  }}>
                    Topic
                  </th>
                  <th style={{
                    padding: 'var(--space-4)',
                    textAlign: 'left',
                    fontSize: 'var(--text-sm)',
                    fontWeight: 'var(--font-semibold)',
                    color: 'var(--color-text-primary)',
                    borderBottom: '0.5px solid var(--color-border-primary)'
                  }}>
                    Messages
                  </th>
                  <th style={{
                    padding: 'var(--space-4)',
                    textAlign: 'left',
                    fontSize: 'var(--text-sm)',
                    fontWeight: 'var(--font-semibold)',
                    color: 'var(--color-text-primary)',
                    borderBottom: '0.5px solid var(--color-border-primary)'
                  }}>
                    Rules
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
                    Created
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredRooms.map((room) => (
                  <tr
                    key={room.id}
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
                      setSelectedRoom(room);
                      setShowEditModal(true);
                    }}
                  >
                    <td style={{
                      padding: 'var(--space-4)',
                      fontSize: 'var(--text-base)',
                      color: 'var(--color-text-primary)',
                      fontWeight: 'var(--font-medium)'
                    }}>
                      <div>
                        <div>{room.name}</div>
                        <div style={{
                          fontSize: 'var(--text-sm)',
                          color: 'var(--color-text-tertiary)',
                          marginTop: 'var(--space-1)'
                        }}>
                          /{room.slug}
                        </div>
                      </div>
                    </td>
                    <td style={{
                      padding: 'var(--space-4)',
                      fontSize: 'var(--text-sm)',
                      color: 'var(--color-text-primary)'
                    }}>
                      {room.topic}
                    </td>
                                         <td style={{
                       padding: 'var(--space-4)',
                       fontSize: 'var(--text-sm)',
                       color: 'var(--color-text-primary)'
                     }}>
                       <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)' }}>
                         <MessageSquare style={{ width: '14px', height: '14px', color: 'var(--color-text-tertiary)' }} />
                         <span>{room.message_count || 0}</span>
                       </div>
                     </td>
                     <td style={{
                       padding: 'var(--space-4)',
                       fontSize: 'var(--text-sm)',
                       color: 'var(--color-text-primary)'
                     }}>
                       <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)' }}>
                         <span style={{
                           fontSize: 'var(--text-xs)',
                           color: 'var(--color-text-tertiary)'
                         }}>
                           {Array.isArray(room.rules) ? room.rules.length : 0} rules
                         </span>
                       </div>
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
                         color: getStatusColor(room.is_active || true),
                         fontWeight: 'var(--font-medium)',
                         textTransform: 'uppercase'
                       }}>
                         {room.is_active ? 'Active' : 'Inactive'}
                       </span>
                     </td>
                    <td style={{
                      padding: 'var(--space-4)',
                      fontSize: 'var(--text-sm)',
                      color: 'var(--color-text-tertiary)'
                    }}>
                      {formatDate(room.created_at || '')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modals */}
      {showCreateModal && (
        <BullRoomCreateModal
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreateRoom}
          loading={createBullRoom.isPending}
          generateSlug={generateSlug}
        />
      )}

      {showEditModal && selectedRoom && (
        <BullRoomEditModal
          room={selectedRoom}
          onClose={() => {
            setShowEditModal(false);
            setSelectedRoom(null);
          }}
          onSubmit={handleUpdateRoom}
          loading={updateBullRoom.isPending}
          generateSlug={generateSlug}
        />
      )}

      {showDeleteModal && selectedRoom && (
        <BullRoomDeleteModal
          room={selectedRoom}
          onClose={() => {
            setShowDeleteModal(false);
            setSelectedRoom(null);
          }}
          onConfirm={() => handleDeleteRoom(selectedRoom.id)}
          loading={deleteBullRoom.isPending}
        />
      )}
    </div>
  );
};
