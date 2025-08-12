# Bull Room Admin Management - Design Document

## Problem Statement

The Admin page currently manages articles, categories, authors, tags, briefs, users, prompts, and prompt categories, but lacks the ability to manage Bull Rooms. Administrators need to be able to create, edit, delete, and configure Bull Rooms from the admin interface to maintain the chat system effectively.

## Current State Analysis

### ✅ What's Already Available
- **Database Schema**: `bull_rooms` table with complete structure
- **Existing Hooks**: `useBullRooms` and `useBullRoom` hooks for data fetching
- **Admin Infrastructure**: Complete admin component system with patterns established
- **Type Definitions**: `BullRoom` type from database aliases
- **Tab System**: Extensible `AdminTabs` component

### ❌ What's Missing
1. **Bull Room Manager Component**: No admin component for managing Bull Rooms
2. **CRUD Operations**: No create, edit, delete functionality for Bull Rooms
3. **Admin Tab**: No "Bull Rooms" tab in the admin interface
4. **Form Components**: No create/edit modals for Bull Room management
5. **Database Hooks**: No admin-specific hooks for Bull Room CRUD operations

## Solution Design

### Phase 1: Database Hooks & Services

#### 1.1 Admin Bull Room Hooks
Create `src/hooks/useAdminBullRooms.ts`:

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { BullRoom } from '../lib/database.aliases';

// Fetch all Bull Rooms (including inactive ones for admin)
export const useAdminBullRooms = () => {
  return useQuery({
    queryKey: ['admin-bull-rooms'],
    queryFn: async (): Promise<BullRoom[]> => {
      const { data, error } = await supabase
        .from('bull_rooms')
        .select('*')
        .order('sort_order', { ascending: true })
        .order('created_at', { ascending: false });

      if (error) throw new Error(`Failed to fetch bull rooms: ${error.message}`);
      return data || [];
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

// Create Bull Room
export const useCreateBullRoom = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (room: Omit<BullRoom, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('bull_rooms')
        .insert(room)
        .select()
        .single();

      if (error) throw new Error(`Failed to create bull room: ${error.message}`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-bull-rooms'] });
      queryClient.invalidateQueries({ queryKey: ['bull-rooms'] });
    },
  });
};

// Update Bull Room
export const useUpdateBullRoom = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<BullRoom> & { id: string }) => {
      const { data, error } = await supabase
        .from('bull_rooms')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw new Error(`Failed to update bull room: ${error.message}`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-bull-rooms'] });
      queryClient.invalidateQueries({ queryKey: ['bull-rooms'] });
    },
  });
};

// Delete Bull Room
export const useDeleteBullRoom = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('bull_rooms')
        .delete()
        .eq('id', id);

      if (error) throw new Error(`Failed to delete bull room: ${error.message}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-bull-rooms'] });
      queryClient.invalidateQueries({ queryKey: ['bull-rooms'] });
    },
  });
};
```

### Phase 2: Admin Components

#### 2.1 Bull Room Manager Component
Create `src/components/admin/BullRoomManager.tsx`:

```typescript
"use client";

import React, { useState, useMemo } from 'react';
import { Plus, Edit, Trash2, MessageSquare, Users, Hash, Search, Filter, X, ChevronDown } from 'lucide-react';
import { useAdminBullRooms, useCreateBullRoom, useUpdateBullRoom, useDeleteBullRoom } from '../../hooks/useAdminBullRooms';
import { BullRoomCreateModal } from './BullRoomCreateModal';
import { BullRoomEditModal } from './BullRoomEditModal';
import { BullRoomDeleteModal } from './BullRoomDeleteModal';
import { ManagerHeader } from './ManagerHeader';
import { SearchBar } from './SearchBar';
import { BullRoom } from '../../lib/database.aliases';

export const BullRoomManager: React.FC = () => {
  const { data: bullRooms = [], loading } = useAdminBullRooms();
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

  return (
    <div>
      <ManagerHeader
        title="Bull Rooms"
        description="Manage chat rooms and their settings"
        onCreateClick={() => setShowCreateModal(true)}
        loading={loading}
        itemCount={filteredRooms.length}
        totalCount={bullRooms.length}
      />

      {/* Search and Filters */}
      <SearchBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        placeholder="Search rooms by name, topic, or description..."
        showFilters={showFilters}
        onToggleFilters={() => setShowFilters(!showFilters)}
      />

      {showFilters && (
        <div style={{
          display: 'flex',
          gap: 'var(--space-4)',
          padding: 'var(--space-4)',
          borderBottom: '0.5px solid var(--color-border-primary)',
          flexWrap: 'wrap'
        }}>
          {/* Status Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-tertiary)' }}>Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              style={{
                padding: 'var(--space-2) var(--space-3)',
                border: '0.5px solid var(--color-border-primary)',
                borderRadius: 'var(--radius-md)',
                fontSize: 'var(--text-sm)',
                background: 'var(--color-bg-primary)',
                color: 'var(--color-text-primary)'
              }}
            >
              <option value="all">All</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          {/* Featured Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-tertiary)' }}>Featured:</span>
            <select
              value={featuredFilter}
              onChange={(e) => setFeaturedFilter(e.target.value as any)}
              style={{
                padding: 'var(--space-2) var(--space-3)',
                border: '0.5px solid var(--color-border-primary)',
                borderRadius: 'var(--radius-md)',
                fontSize: 'var(--text-sm)',
                background: 'var(--color-bg-primary)',
                color: 'var(--color-text-primary)'
              }}
            >
              <option value="all">All</option>
              <option value="featured">Featured</option>
              <option value="not-featured">Not Featured</option>
            </select>
          </div>

          {/* Sort Options */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-tertiary)' }}>Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              style={{
                padding: 'var(--space-2) var(--space-3)',
                border: '0.5px solid var(--color-border-primary)',
                borderRadius: 'var(--radius-md)',
                fontSize: 'var(--text-sm)',
                background: 'var(--color-bg-primary)',
                color: 'var(--color-text-primary)'
              }}
            >
              <option value="created_at">Created</option>
              <option value="updated_at">Updated</option>
              <option value="name">Name</option>
              <option value="message_count">Messages</option>
              <option value="sort_order">Sort Order</option>
            </select>
            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              style={{
                padding: 'var(--space-2)',
                border: '0.5px solid var(--color-border-primary)',
                borderRadius: 'var(--radius-md)',
                background: 'var(--color-bg-primary)',
                color: 'var(--color-text-primary)',
                cursor: 'pointer'
              }}
            >
              {sortOrder === 'asc' ? '↑' : '↓'}
            </button>
          </div>
        </div>
      )}

      {/* Rooms Table */}
      <div style={{
        overflowX: 'auto',
        border: '0.5px solid var(--color-border-primary)',
        borderRadius: 'var(--radius-lg)',
        background: 'var(--color-bg-primary)'
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{
              borderBottom: '0.5px solid var(--color-border-primary)',
              background: 'var(--color-bg-secondary)'
            }}>
              <th style={{ padding: 'var(--space-4)', textAlign: 'left', fontSize: 'var(--text-sm)', fontWeight: 'var(--font-semibold)' }}>Room</th>
              <th style={{ padding: 'var(--space-4)', textAlign: 'left', fontSize: 'var(--text-sm)', fontWeight: 'var(--font-semibold)' }}>Topic</th>
              <th style={{ padding: 'var(--space-4)', textAlign: 'center', fontSize: 'var(--text-sm)', fontWeight: 'var(--font-semibold)' }}>Messages</th>
              <th style={{ padding: 'var(--space-4)', textAlign: 'center', fontSize: 'var(--text-sm)', fontWeight: 'var(--font-semibold)' }}>Status</th>
              <th style={{ padding: 'var(--space-4)', textAlign: 'center', fontSize: 'var(--text-sm)', fontWeight: 'var(--font-semibold)' }}>Featured</th>
              <th style={{ padding: 'var(--space-4)', textAlign: 'center', fontSize: 'var(--text-sm)', fontWeight: 'var(--font-semibold)' }}>Sort Order</th>
              <th style={{ padding: 'var(--space-4)', textAlign: 'center', fontSize: 'var(--text-sm)', fontWeight: 'var(--font-semibold)' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredRooms.map((room) => (
              <tr key={room.id} style={{
                borderBottom: '0.5px solid var(--color-border-primary)',
                '&:hover': { background: 'var(--color-bg-secondary)' }
              }}>
                <td style={{ padding: 'var(--space-4)' }}>
                  <div>
                    <div style={{ fontWeight: 'var(--font-medium)', color: 'var(--color-text-primary)' }}>
                      {room.name}
                    </div>
                    <div style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-tertiary)' }}>
                      /{room.slug}
                    </div>
                  </div>
                </td>
                <td style={{ padding: 'var(--space-4)', maxWidth: '200px' }}>
                  <div style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)' }}>
                    {room.topic}
                  </div>
                </td>
                <td style={{ padding: 'var(--space-4)', textAlign: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 'var(--space-1)' }}>
                    <MessageSquare style={{ width: '14px', height: '14px', color: 'var(--color-text-tertiary)' }} />
                    <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)' }}>
                      {room.message_count || 0}
                    </span>
                  </div>
                </td>
                <td style={{ padding: 'var(--space-4)', textAlign: 'center' }}>
                  <span style={{
                    padding: 'var(--space-1) var(--space-2)',
                    borderRadius: 'var(--radius-full)',
                    fontSize: 'var(--text-xs)',
                    fontWeight: 'var(--font-medium)',
                    background: room.is_active ? 'var(--color-success-bg)' : 'var(--color-error-bg)',
                    color: room.is_active ? 'var(--color-success)' : 'var(--color-error)'
                  }}>
                    {room.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td style={{ padding: 'var(--space-4)', textAlign: 'center' }}>
                  {room.is_featured && (
                    <span style={{
                      padding: 'var(--space-1) var(--space-2)',
                      borderRadius: 'var(--radius-full)',
                      fontSize: 'var(--text-xs)',
                      fontWeight: 'var(--font-medium)',
                      background: 'var(--color-warning-bg)',
                      color: 'var(--color-warning)'
                    }}>
                      Featured
                    </span>
                  )}
                </td>
                <td style={{ padding: 'var(--space-4)', textAlign: 'center' }}>
                  <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)' }}>
                    {room.sort_order || 0}
                  </span>
                </td>
                <td style={{ padding: 'var(--space-4)', textAlign: 'center' }}>
                  <div style={{ display: 'flex', gap: 'var(--space-2)', justifyContent: 'center' }}>
                    <button
                      onClick={() => {
                        setSelectedRoom(room);
                        setShowEditModal(true);
                      }}
                      style={{
                        padding: 'var(--space-2)',
                        border: '0.5px solid var(--color-border-primary)',
                        borderRadius: 'var(--radius-md)',
                        background: 'var(--color-bg-primary)',
                        color: 'var(--color-text-primary)',
                        cursor: 'pointer'
                      }}
                    >
                      <Edit style={{ width: '14px', height: '14px' }} />
                    </button>
                    <button
                      onClick={() => {
                        setSelectedRoom(room);
                        setShowDeleteModal(true);
                      }}
                      style={{
                        padding: 'var(--space-2)',
                        border: '0.5px solid var(--color-border-primary)',
                        borderRadius: 'var(--radius-md)',
                        background: 'var(--color-bg-primary)',
                        color: 'var(--color-error)',
                        cursor: 'pointer'
                      }}
                    >
                      <Trash2 style={{ width: '14px', height: '14px' }} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modals */}
      {showCreateModal && (
        <BullRoomCreateModal
          onClose={() => setShowCreateModal(false)}
          onSubmit={createBullRoom.mutate}
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
          onSubmit={updateBullRoom.mutate}
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
          onConfirm={() => {
            deleteBullRoom.mutate(selectedRoom.id);
            setShowDeleteModal(false);
            setSelectedRoom(null);
          }}
          loading={deleteBullRoom.isPending}
        />
      )}
    </div>
  );
};
```

### Phase 3: Modal Components

#### 3.1 Create Modal
Create `src/components/admin/BullRoomCreateModal.tsx`:

```typescript
"use client";

import React, { useState } from 'react';
import { X, Hash, MessageSquare, Users, Settings } from 'lucide-react';
import { BullRoom } from '../../lib/database.aliases';

interface BullRoomCreateModalProps {
  onClose: () => void;
  onSubmit: (room: Omit<BullRoom, 'id' | 'created_at' | 'updated_at'>) => void;
  loading: boolean;
  generateSlug: (name: string) => string;
}

export const BullRoomCreateModal: React.FC<BullRoomCreateModalProps> = ({
  onClose,
  onSubmit,
  loading,
  generateSlug
}) => {
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    topic: '',
    description: '',
    is_active: true,
    is_featured: false,
    sort_order: 0,
    rules: []
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleNameChange = (name: string) => {
    setFormData(prev => ({
      ...prev,
      name,
      slug: generateSlug(name)
    }));
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        background: 'var(--color-bg-primary)',
        borderRadius: 'var(--radius-xl)',
        padding: 'var(--space-6)',
        width: '90%',
        maxWidth: '600px',
        maxHeight: '90vh',
        overflowY: 'auto',
        border: '0.5px solid var(--color-border-primary)'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 'var(--space-6)'
        }}>
          <h2 style={{
            fontSize: 'var(--text-xl)',
            fontWeight: 'var(--font-bold)',
            color: 'var(--color-text-primary)'
          }}>
            Create Bull Room
          </h2>
          <button
            onClick={onClose}
            style={{
              padding: 'var(--space-2)',
              border: 'none',
              background: 'none',
              color: 'var(--color-text-tertiary)',
              cursor: 'pointer'
            }}
          >
            <X style={{ width: '20px', height: '20px' }} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            {/* Name */}
            <div>
              <label style={{
                display: 'block',
                marginBottom: 'var(--space-2)',
                fontSize: 'var(--text-sm)',
                fontWeight: 'var(--font-medium)',
                color: 'var(--color-text-primary)'
              }}>
                Room Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleNameChange(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: 'var(--space-3)',
                  border: '0.5px solid var(--color-border-primary)',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--color-bg-primary)',
                  color: 'var(--color-text-primary)',
                  fontSize: 'var(--text-sm)'
                }}
                placeholder="Enter room name"
              />
            </div>

            {/* Slug */}
            <div>
              <label style={{
                display: 'block',
                marginBottom: 'var(--space-2)',
                fontSize: 'var(--text-sm)',
                fontWeight: 'var(--font-medium)',
                color: 'var(--color-text-primary)'
              }}>
                Slug *
              </label>
              <input
                type="text"
                value={formData.slug}
                onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                required
                style={{
                  width: '100%',
                  padding: 'var(--space-3)',
                  border: '0.5px solid var(--color-border-primary)',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--color-bg-primary)',
                  color: 'var(--color-text-primary)',
                  fontSize: 'var(--text-sm)'
                }}
                placeholder="room-slug"
              />
            </div>

            {/* Topic */}
            <div>
              <label style={{
                display: 'block',
                marginBottom: 'var(--space-2)',
                fontSize: 'var(--text-sm)',
                fontWeight: 'var(--font-medium)',
                color: 'var(--color-text-primary)'
              }}>
                Topic *
              </label>
              <input
                type="text"
                value={formData.topic}
                onChange={(e) => setFormData(prev => ({ ...prev, topic: e.target.value }))}
                required
                style={{
                  width: '100%',
                  padding: 'var(--space-3)',
                  border: '0.5px solid var(--color-border-primary)',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--color-bg-primary)',
                  color: 'var(--color-text-primary)',
                  fontSize: 'var(--text-sm)'
                }}
                placeholder="Brief description of the room topic"
              />
            </div>

            {/* Description */}
            <div>
              <label style={{
                display: 'block',
                marginBottom: 'var(--space-2)',
                fontSize: 'var(--text-sm)',
                fontWeight: 'var(--font-medium)',
                color: 'var(--color-text-primary)'
              }}>
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
                style={{
                  width: '100%',
                  padding: 'var(--space-3)',
                  border: '0.5px solid var(--color-border-primary)',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--color-bg-primary)',
                  color: 'var(--color-text-primary)',
                  fontSize: 'var(--text-sm)',
                  resize: 'vertical'
                }}
                placeholder="Detailed description of the room"
              />
            </div>

            {/* Sort Order */}
            <div>
              <label style={{
                display: 'block',
                marginBottom: 'var(--space-2)',
                fontSize: 'var(--text-sm)',
                fontWeight: 'var(--font-medium)',
                color: 'var(--color-text-primary)'
              }}>
                Sort Order
              </label>
              <input
                type="number"
                value={formData.sort_order}
                onChange={(e) => setFormData(prev => ({ ...prev, sort_order: parseInt(e.target.value) || 0 }))}
                style={{
                  width: '100%',
                  padding: 'var(--space-3)',
                  border: '0.5px solid var(--color-border-primary)',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--color-bg-primary)',
                  color: 'var(--color-text-primary)',
                  fontSize: 'var(--text-sm)'
                }}
                placeholder="0"
              />
            </div>

            {/* Checkboxes */}
            <div style={{ display: 'flex', gap: 'var(--space-4)' }}>
              <label style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-2)',
                cursor: 'pointer'
              }}>
                <input
                  type="checkbox"
                  checked={formData.is_active}
                  onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
                  style={{ cursor: 'pointer' }}
                />
                <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-primary)' }}>
                  Active
                </span>
              </label>

              <label style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-2)',
                cursor: 'pointer'
              }}>
                <input
                  type="checkbox"
                  checked={formData.is_featured}
                  onChange={(e) => setFormData(prev => ({ ...prev, is_featured: e.target.checked }))}
                  style={{ cursor: 'pointer' }}
                />
                <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-primary)' }}>
                  Featured
                </span>
              </label>
            </div>
          </div>

          {/* Actions */}
          <div style={{
            display: 'flex',
            gap: 'var(--space-3)',
            marginTop: 'var(--space-6)',
            justifyContent: 'flex-end'
          }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: 'var(--space-3) var(--space-4)',
                border: '0.5px solid var(--color-border-primary)',
                borderRadius: 'var(--radius-md)',
                background: 'var(--color-bg-primary)',
                color: 'var(--color-text-primary)',
                fontSize: 'var(--text-sm)',
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              style={{
                padding: 'var(--space-3) var(--space-4)',
                border: 'none',
                borderRadius: 'var(--radius-md)',
                background: 'var(--color-primary)',
                color: 'white',
                fontSize: 'var(--text-sm)',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.6 : 1
              }}
            >
              {loading ? 'Creating...' : 'Create Room'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
```

### Phase 4: Integration

#### 4.1 Update AdminTabs
Add Bull Rooms tab to `src/components/admin/AdminTabs.tsx`:

```typescript
// Add to AdminTab type
export type AdminTab = 'articles' | 'categories' | 'authors' | 'tags' | 'users' | 'prompts' | 'prompt-categories' | 'briefs' | 'bull-rooms' | 'build';

// Add to tabConfigs array
{
  id: 'bull-rooms',
  label: 'Bull Rooms',
  icon: <MessageSquare style={{ width: '16px', height: '16px' }} />,
  description: 'Manage chat rooms'
},
```

#### 4.2 Update AdminPage
Add Bull Room Manager to `src/page-components/AdminPage.tsx`:

```typescript
// Add import
import { BullRoomManager } from '../components/admin/BullRoomManager';

// Add to renderTabContent switch
case 'bull-rooms':
  return <BullRoomManager />;

// Add to getTabDescription switch
case 'bull-rooms':
  return 'Manage chat rooms and their settings';
```

## Implementation Plan

### Phase 1: Core Infrastructure (Day 1)
1. Create `useAdminBullRooms.ts` hooks
2. Update `AdminTabs.tsx` with Bull Rooms tab
3. Update `AdminPage.tsx` to include Bull Room Manager

### Phase 2: Manager Component (Day 2)
1. Create `BullRoomManager.tsx` component
2. Implement table view with search and filters
3. Add basic CRUD operations

### Phase 3: Modal Components (Day 3)
1. Create `BullRoomCreateModal.tsx`
2. Create `BullRoomEditModal.tsx`
3. Create `BullRoomDeleteModal.tsx`

### Phase 4: Testing & Polish (Day 4)
1. Test all CRUD operations
2. Verify real-time updates
3. Test error handling
4. Polish UI/UX

## Success Criteria

1. ✅ Administrators can view all Bull Rooms in a table format
2. ✅ Administrators can create new Bull Rooms with all required fields
3. ✅ Administrators can edit existing Bull Rooms
4. ✅ Administrators can delete Bull Rooms
5. ✅ Search and filter functionality works correctly
6. ✅ Real-time updates when rooms are modified
7. ✅ Proper error handling and loading states
8. ✅ Consistent UI/UX with existing admin components

## Technical Considerations

- **Type Safety**: All components use proper TypeScript types
- **Error Handling**: Comprehensive error handling with user feedback
- **Performance**: Efficient queries with proper caching
- **Accessibility**: Proper ARIA labels and keyboard navigation
- **Responsive Design**: Works on all screen sizes
- **Consistency**: Follows existing admin component patterns
