# Bull Room Completion - Design Document

## Problem Statement

The Bull Room is a sophisticated chat interface with beautiful UI components, but it lacks the core messaging functionality. Users can see the interface, select rooms, and type messages, but messages don't persist, there's no real-time updates, and file uploads are simulated. We need to implement the complete messaging system to make it a fully functional chat application.

## Current State Analysis

### ✅ What's Already Implemented
- **Database**: `bull_rooms` table with proper schema
- **UI Components**: Complete set of React components
  - `RoomSelector` - Left sidebar for room selection
  - `RoomBanner` - Top banner with room info  
  - `ChatArea` - Main message display area
  - `MessageInput` - Message input with file upload
  - `RoomContextSidebar` - Right sidebar with market context (BACKLOGGED)
- **Routing**: Routes configured (`/bull-room/:roomId`)
- **Data Fetching**: Hooks for fetching rooms (`useBullRooms`, `useBullRoom`)
- **Navigation**: Integrated into sidebar and layout

### ❌ What's Missing (Core Functionality)
1. **Message Storage**: No `bull_room_messages` table
2. **Real-time Messaging**: No WebSocket/real-time functionality
3. **Message Persistence**: Messages are hardcoded/mock data
4. **Message CRUD Operations**: No hooks for creating/fetching messages
5. **File Upload Integration**: File uploads are simulated, not persisted
6. **User Authentication Integration**: Messages don't persist user data properly
7. **Authentication Overlay**: No blur overlay for unauthenticated users

## Solution Design

### Phase 1: Database Schema & Core Services

#### 1.1 Database Schema
Create `bull_room_messages` table with the following structure:

```sql
CREATE TABLE "public"."bull_room_messages" (
    "id" uuid NOT NULL DEFAULT gen_random_uuid(),
    "room_id" uuid NOT NULL REFERENCES bull_rooms(id) ON DELETE CASCADE,
    "user_id" uuid NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    "content" text NOT NULL,
    "message_type" text DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'file', 'system')),
    "file_data" jsonb,
    "reply_to_id" uuid REFERENCES bull_room_messages(id),
    "reactions" jsonb DEFAULT '{}',
    "is_edited" boolean DEFAULT false,
    "edited_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT now(),
    "updated_at" timestamp with time zone DEFAULT now()
);
```

#### 1.2 Database Indexes & Policies
```sql
-- Indexes for performance
CREATE INDEX idx_bull_room_messages_room_id ON bull_room_messages(room_id);
CREATE INDEX idx_bull_room_messages_user_id ON bull_room_messages(user_id);
CREATE INDEX idx_bull_room_messages_created_at ON bull_room_messages(created_at DESC);
CREATE INDEX idx_bull_room_messages_reply_to_id ON bull_room_messages(reply_to_id);

-- RLS Policies
ALTER TABLE bull_room_messages ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read messages
CREATE POLICY "Users can read messages in active rooms" ON bull_room_messages
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM bull_rooms 
            WHERE id = room_id AND is_active = true
        )
    );

-- Allow authenticated users to create messages
CREATE POLICY "Users can create messages in active rooms" ON bull_room_messages
    FOR INSERT WITH CHECK (
        auth.uid() = user_id AND
        EXISTS (
            SELECT 1 FROM bull_rooms 
            WHERE id = room_id AND is_active = true
        )
    );

-- Allow users to update their own messages
CREATE POLICY "Users can update their own messages" ON bull_room_messages
    FOR UPDATE USING (auth.uid() = user_id);

-- Allow users to delete their own messages
CREATE POLICY "Users can delete their own messages" ON bull_room_messages
    FOR DELETE USING (auth.uid() = user_id);
```

#### 1.3 Message Types & Interfaces
```typescript
// Message types
export interface BullRoomMessage {
  id: string;
  room_id: string;
  user_id: string;
  content: string;
  message_type: 'text' | 'image' | 'file' | 'system';
  file_data?: {
    name: string;
    url: string;
    size: number;
    type: string;
    preview_url?: string;
  };
  reply_to_id?: string;
     reactions: Record<string, string[]>; // emoji -> user_ids (themed: 🚀📈📉💎💚🔥💪📊)
  is_edited: boolean;
  edited_at?: string;
  created_at: string;
  updated_at: string;
  user?: {
    id: string;
    username: string;
    avatar_url?: string;
  };
  reply_to?: BullRoomMessage;
}

// File upload types
export interface FileUpload {
  file: File;
  preview?: string;
  progress: number;
  upload_id: string;
}
```

### Phase 2: Message Services & Hooks

#### 2.1 Message Service
Create `src/services/bullRoomMessages.ts`:

```typescript
export class BullRoomMessageService {
  async getMessages(roomId: string, limit = 50, offset = 0): Promise<BullRoomMessage[]> {
    const { data, error } = await supabase
      .from('bull_room_messages')
      .select(`
        *,
        user:user_profiles(id, username, avatar_url),
        reply_to:bull_room_messages!reply_to_id(*)
      `)
      .eq('room_id', roomId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw new Error(`Failed to fetch messages: ${error.message}`);
    return data || [];
  }

  async createMessage(messageData: Partial<BullRoomMessage>): Promise<BullRoomMessage> {
    const { data, error } = await supabase
      .from('bull_room_messages')
      .insert(messageData)
      .select(`
        *,
        user:user_profiles(id, username, avatar_url)
      `)
      .single();

    if (error) throw new Error(`Failed to create message: ${error.message}`);
    return data;
  }

  async updateMessage(messageId: string, updates: Partial<BullRoomMessage>): Promise<BullRoomMessage> {
    const { data, error } = await supabase
      .from('bull_room_messages')
      .update({ ...updates, is_edited: true, edited_at: new Date().toISOString() })
      .eq('id', messageId)
      .select(`
        *,
        user:user_profiles(id, username, avatar_url)
      `)
      .single();

    if (error) throw new Error(`Failed to update message: ${error.message}`);
    return data;
  }

  async deleteMessage(messageId: string): Promise<void> {
    const { error } = await supabase
      .from('bull_room_messages')
      .delete()
      .eq('id', messageId);

    if (error) throw new Error(`Failed to delete message: ${error.message}`);
  }

  async addReaction(messageId: string, emoji: string, userId: string): Promise<void> {
    const { data: message } = await supabase
      .from('bull_room_messages')
      .select('reactions')
      .eq('id', messageId)
      .single();

    const reactions = message?.reactions || {};
    if (!reactions[emoji]) reactions[emoji] = [];
    if (!reactions[emoji].includes(userId)) {
      reactions[emoji].push(userId);
    }

    const { error } = await supabase
      .from('bull_room_messages')
      .update({ reactions })
      .eq('id', messageId);

    if (error) throw new Error(`Failed to add reaction: ${error.message}`);
  }

  async removeReaction(messageId: string, emoji: string, userId: string): Promise<void> {
    const { data: message } = await supabase
      .from('bull_room_messages')
      .select('reactions')
      .eq('id', messageId)
      .single();

    const reactions = message?.reactions || {};
    if (reactions[emoji]) {
      reactions[emoji] = reactions[emoji].filter(id => id !== userId);
      if (reactions[emoji].length === 0) {
        delete reactions[emoji];
      }
    }

    const { error } = await supabase
      .from('bull_room_messages')
      .update({ reactions })
      .eq('id', messageId);

    if (error) throw new Error(`Failed to remove reaction: ${error.message}`);
  }
}
```

#### 2.2 Message Hooks
Create `src/hooks/useBullRoomMessages.ts`:

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../contexts/AuthContext';
import { BullRoomMessageService } from '../services/bullRoomMessages';

const messageService = new BullRoomMessageService();

export const useBullRoomMessages = (roomId: string) => {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: ['bull-room-messages', roomId],
    queryFn: () => messageService.getMessages(roomId),
    enabled: !!roomId,
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useCreateMessage = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: (messageData: Partial<BullRoomMessage>) => 
      messageService.createMessage({
        ...messageData,
        user_id: user?.id!,
      }),
    onSuccess: (newMessage, variables) => {
      // Optimistically update the cache
      queryClient.setQueryData(
        ['bull-room-messages', variables.room_id],
        (oldData: BullRoomMessage[] = []) => [newMessage, ...oldData]
      );
      
      // Update room stats
      queryClient.invalidateQueries({ queryKey: ['bull-rooms'] });
      queryClient.invalidateQueries({ queryKey: ['bull-room', variables.room_id] });
    },
  });
};

export const useUpdateMessage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ messageId, updates }: { messageId: string; updates: Partial<BullRoomMessage> }) =>
      messageService.updateMessage(messageId, updates),
    onSuccess: (updatedMessage) => {
      // Update the message in cache
      queryClient.setQueryData(
        ['bull-room-messages', updatedMessage.room_id],
        (oldData: BullRoomMessage[] = []) =>
          oldData.map(msg => msg.id === updatedMessage.id ? updatedMessage : msg)
      );
    },
  });
};

export const useDeleteMessage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (messageId: string) => messageService.deleteMessage(messageId),
    onSuccess: (_, messageId) => {
      // Remove message from cache
      queryClient.setQueryData(
        ['bull-room-messages'],
        (oldData: BullRoomMessage[] = []) =>
          oldData.filter(msg => msg.id !== messageId)
      );
    },
  });
};

export const useAddReaction = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: ({ messageId, emoji }: { messageId: string; emoji: string }) =>
      messageService.addReaction(messageId, emoji, user?.id!),
    onSuccess: (_, { messageId, emoji }) => {
      // Optimistically update reactions
      queryClient.setQueryData(
        ['bull-room-messages'],
        (oldData: BullRoomMessage[] = []) =>
          oldData.map(msg => {
            if (msg.id === messageId) {
              const reactions = { ...msg.reactions };
              if (!reactions[emoji]) reactions[emoji] = [];
              if (!reactions[emoji].includes(user?.id!)) {
                reactions[emoji].push(user?.id!);
              }
              return { ...msg, reactions };
            }
            return msg;
          })
      );
    },
  });
};
```

### Phase 3: Real-time Messaging

#### 3.1 Supabase Realtime Integration
Create `src/hooks/useBullRoomRealtime.ts`:

```typescript
import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { BullRoomMessage } from '../types/bullRoom.types';

export const useBullRoomRealtime = (roomId: string) => {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!roomId) return;

    const channel = supabase
      .channel(`bull-room-${roomId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'bull_room_messages',
          filter: `room_id=eq.${roomId}`,
        },
        (payload) => {
          const newMessage = payload.new as BullRoomMessage;
          
          // Add new message to cache
          queryClient.setQueryData(
            ['bull-room-messages', roomId],
            (oldData: BullRoomMessage[] = []) => [newMessage, ...oldData]
          );
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'bull_room_messages',
          filter: `room_id=eq.${roomId}`,
        },
        (payload) => {
          const updatedMessage = payload.new as BullRoomMessage;
          
          // Update message in cache
          queryClient.setQueryData(
            ['bull-room-messages', roomId],
            (oldData: BullRoomMessage[] = []) =>
              oldData.map(msg => msg.id === updatedMessage.id ? updatedMessage : msg)
          );
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'bull_room_messages',
          filter: `room_id=eq.${roomId}`,
        },
        (payload) => {
          const deletedMessageId = payload.old.id;
          
          // Remove message from cache
          queryClient.setQueryData(
            ['bull-room-messages', roomId],
            (oldData: BullRoomMessage[] = []) =>
              oldData.filter(msg => msg.id !== deletedMessageId)
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [roomId, queryClient]);
};
```

### Phase 4: File Upload Integration

#### 4.1 File Upload Service
Create `src/services/fileUpload.ts`:

```typescript
import { supabase } from '../lib/supabase';

export class FileUploadService {
  async uploadFile(file: File, roomId: string): Promise<{
    url: string;
    name: string;
    size: number;
    type: string;
    preview_url?: string;
  }> {
    const fileExt = file.name.split('.').pop();
    const fileName = `${roomId}/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    
    const { data, error } = await supabase.storage
      .from('bull-room-files')
      .upload(fileName, file);

    if (error) throw new Error(`Failed to upload file: ${error.message}`);

    const { data: { publicUrl } } = supabase.storage
      .from('bull-room-files')
      .getPublicUrl(fileName);

    let previewUrl: string | undefined;
    if (file.type.startsWith('image/')) {
      previewUrl = publicUrl;
    }

    return {
      url: publicUrl,
      name: file.name,
      size: file.size,
      type: file.type,
      preview_url: previewUrl,
    };
  }

  async deleteFile(fileUrl: string): Promise<void> {
    const path = fileUrl.split('/').pop();
    if (!path) return;

    const { error } = await supabase.storage
      .from('bull-room-files')
      .remove([path]);

    if (error) throw new Error(`Failed to delete file: ${error.message}`);
  }
}
```

### Phase 5: Enhanced UI Components

#### 5.1 Authentication Overlay
Create `src/components/BullRoom/AuthOverlay.tsx`:
- Blur overlay for unauthenticated users
- Call-to-action to create account
- Preview of chat functionality
- Smooth transition animations

#### 5.2 Message Component Enhancements
Update `ChatArea.tsx` to support:
- Message reactions (themed emojis: 🐂📉💨🫃)
- Reply functionality
- Message editing
- Message deletion
- File previews
- User avatars
- Typing indicators

#### 5.3 Message Input Enhancements
Update `MessageInput.tsx` to support:
- File upload progress
- Reply to messages
- Themed emoji picker (🐂📉💨🫃)
- Message formatting
- Typing indicators

### Phase 6: Advanced Features

#### 6.1 Message Search
- Full-text search through messages
- Search by user, content, date range
- Search results highlighting

#### 6.2 Message Moderation
- Admin tools for message moderation
- Message reporting system
- Auto-moderation rules
- User blocking functionality

#### 6.3 Room Management
- Room creation/editing for admins
- Room permissions
- Room statistics
- Room archiving

#### 6.4 Room Context Sidebar (BACKLOGGED)
- Market summary integration
- Top tweets display
- Real-time market data
- Sentiment analysis

## Implementation Plan

### Phase 1: Core Infrastructure (Week 1)
1. Create database migration for `bull_room_messages` table
2. Implement message service and hooks
3. Update existing components to use real data
4. Test basic CRUD operations

### Phase 2: Real-time Messaging (Week 2)
1. Implement Supabase realtime subscriptions
2. Add typing indicators
3. Add message reactions
4. Test real-time functionality

### Phase 3: File Uploads (Week 3)
1. Set up Supabase storage bucket
2. Implement file upload service
3. Add file preview functionality
4. Test file uploads

### Phase 4: Enhanced UI (Week 4)
1. Add authentication overlay for unauthenticated users
2. Add message editing/deletion
3. Implement reply functionality
4. Add themed emoji picker
5. Improve message display

### Phase 5: Advanced Features (Week 5)
1. Implement message search
2. Add moderation tools
3. Add room management
4. Performance optimizations

## Testing Strategy

### Unit Tests
- Message service functions
- Hook functionality
- File upload service
- Database operations

### Integration Tests
- Real-time messaging
- File upload flow
- Message reactions
- User interactions

### E2E Tests
- Complete message flow
- File upload process
- Real-time updates
- Cross-browser compatibility

## Performance Considerations

1. **Message Pagination**: Implement infinite scroll for message history
2. **Image Optimization**: Compress and optimize uploaded images
3. **Caching Strategy**: Implement smart caching for messages and files
4. **Real-time Optimization**: Limit real-time subscriptions to active rooms
5. **File Size Limits**: Implement reasonable file size restrictions

## Security Considerations

1. **File Upload Security**: Validate file types and scan for malware
2. **Message Sanitization**: Sanitize user input to prevent XSS
3. **Rate Limiting**: Implement rate limiting for message creation
4. **User Permissions**: Ensure proper RLS policies
5. **Content Moderation**: Implement automated content filtering

## Success Metrics

1. **Functionality**: All core messaging features work correctly
2. **Performance**: Messages load within 2 seconds
3. **Real-time**: Messages appear within 500ms of sending
4. **File Uploads**: Files upload successfully 99% of the time
5. **User Experience**: Smooth, intuitive chat experience

This design document provides a comprehensive roadmap for completing the Bull Room functionality, transforming it from a beautiful UI mockup into a fully functional real-time chat application. 