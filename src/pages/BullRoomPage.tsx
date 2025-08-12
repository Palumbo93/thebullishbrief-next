"use client";

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { MessageSquare, Hash, Users, TrendingUp, TrendingDown, Minus, Brain, Paperclip, Image, File, X, Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Header } from '../components/Header';
import { RoomSelector } from '../components/BullRoom/RoomSelector';
import { RoomBanner } from '../components/BullRoom/RoomBanner';
import { ChatArea } from '../components/BullRoom/ChatArea';
import { MessageInput } from '../components/BullRoom/MessageInput';
import { RoomMembersSidebar } from '../components/BullRoom/RoomMembersSidebar';
import { AuthOverlay } from '../components/BullRoom/AuthOverlay';
import { TypingIndicator } from '../components/BullRoom/TypingIndicator';
import { useBullRooms, useBullRoom } from '../hooks/useBullRooms';
import { useBullRoomMessages, useCreateMessage, useToggleReaction } from '../hooks/useBullRoomMessages';
import { useBullRoomRealtime } from '../hooks/useBullRoomRealtime';
import { useTypingIndicator } from '../hooks/useTypingIndicator';
import { BullRoomMessage } from '../types/bullRoom.types';
import { useConfirm } from '../hooks/useConfirm';
import { useDeleteMessage } from '../hooks/useBullRoomMessages';

// Remove old Message interface - now using BullRoomMessage from types

// File upload types
interface FileUpload {
  file: File;
  preview?: string;
  progress: number;
}

// Room context data
interface RoomContext {
  summary: string;
  topTweets: Array<{
    id: string;
    author: string;
    handle: string;
    content: string;
    timestamp: string;
    likes: number;
    retweets: number;
  }>;
  lastUpdated: string;
}

interface BullRoomPageProps {
  roomSlug?: string;
  onCreateAccountClick?: () => void;
}

export const BullRoomPage: React.FC<BullRoomPageProps> = ({ roomSlug, onCreateAccountClick }) => {
  const { user } = useAuth();
  const confirm = useConfirm();
  const deleteMessage = useDeleteMessage();
  const router = useRouter();
  const selectedRoomSlug = roomSlug || 'general';

  // Fetch rooms from database
  const { 
    data: rooms = [], 
    isLoading: roomsLoading, 
    error: roomsError 
  } = useBullRooms();

  // Fetch current room details
  const { 
    data: currentRoom, 
    isLoading: roomLoading, 
    error: roomError 
  } = useBullRoom(selectedRoomSlug);

  // Remove mock messages - now using real data from hooks
  const [newMessage, setNewMessage] = useState<string>('');
  const [fileUploads, setFileUploads] = useState<FileUpload[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Fetch messages for current room
  const { 
    data: messages = [], 
    isLoading: messagesLoading, 
    error: messagesError 
  } = useBullRoomMessages(currentRoom?.id || '');

  // Create message mutation
  const createMessageMutation = useCreateMessage();

  // Reaction mutations
  const toggleReactionMutation = useToggleReaction();

  // Message action handlers
  const handleReply = (messageId: string, username: string) => {
    console.log('Reply to message:', messageId, 'from user:', username);
    // TODO: Implement reply functionality
  };

  const handleEdit = (messageId: string, content: string) => {
    console.log('Edit message:', messageId, 'content:', content);
    // TODO: Implement edit functionality
  };

  const handleDelete = (messageId: string) => {
    confirm.danger(
      'Delete Message',
      'Are you sure you want to delete this message? This action cannot be undone.',
      async () => {
        deleteMessage.mutate(messageId);
      }
    );
  };

  // Enable real-time messaging only for authenticated users
  useBullRoomRealtime(currentRoom?.id || '');

  // Enable typing indicators only for authenticated users
  const { typingUsers, startTyping, stopTyping } = useTypingIndicator(currentRoom?.id || '');

  // Auto-resize textarea function
  const adjustTextareaHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + 'px';
    }
  };

  const handleSelectRoom = (roomSlug: string) => {
    router.push(`/bull-room/${roomSlug}`);
  };

  // Room context data removed - backlogged

  const handleSendMessage = () => {
    if (!newMessage.trim() || !user || !currentRoom) return;

    createMessageMutation.mutate({
      room_id: currentRoom.id,
      content: newMessage.trim(),
      message_type: 'text'
    });

    setNewMessage('');

    // Reset textarea height after sending
    if (textareaRef.current) {
      textareaRef.current.style.height = '48px';
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    
    files.forEach(file => {
      const upload: FileUpload = {
        file,
        progress: 0,
        preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined
      };
      
      setFileUploads(prev => [...prev, upload]);
      
      // Simulate upload progress
      const interval = setInterval(() => {
        setFileUploads(prev => prev.map(u => 
          u.file === file 
            ? { ...u, progress: Math.min(u.progress + 10, 100) }
            : u
        ));
        
        if (upload.progress >= 100) {
          clearInterval(interval);
          
          // TODO: Implement file upload to Supabase storage
          // For now, just remove the upload
          setFileUploads(prev => prev.filter(u => u.file !== file));
        }
      }, 100);
    });
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeFileUpload = (file: File) => {
    setFileUploads(prev => prev.filter(u => u.file !== file));
  };

  // Handle loading and error states
  if (roomsLoading || roomLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        height: '100vh' 
      }}>
        <Loader2 style={{ 
          width: '32px', 
          height: '32px', 
          color: 'var(--color-brand-primary)',
          animation: 'spin 1s linear infinite'
        }} />
        <span style={{ 
          marginLeft: 'var(--space-3)', 
          fontSize: 'var(--text-lg)' 
        }}>Loading Bull Room...</span>
      </div>
    );
  }

  if (roomsError || roomError) {
    return (
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        height: '100vh' 
      }}>
        <div style={{ textAlign: 'center' }}>
          <p style={{ 
            fontSize: 'var(--text-lg)', 
            color: 'var(--color-error)', 
            marginBottom: 'var(--space-2)' 
          }}>Failed to load Bull Room</p>
          <p style={{ 
            color: 'var(--color-text-muted)' 
          }}>Please try refreshing the page or contact support.</p>
        </div>
      </div>
    );
  }

  if (!currentRoom) {
    return (
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        height: '100vh' 
      }}>
        <div style={{ textAlign: 'center' }}>
          <p style={{ 
            fontSize: 'var(--text-lg)', 
            color: 'var(--color-error)', 
            marginBottom: 'var(--space-2)' 
          }}>Room not found</p>
          <p style={{ 
            color: 'var(--color-text-muted)' 
          }}>The room "{selectedRoomSlug}" does not exist.</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>       
      {/* Room Banner */}
      <RoomBanner room={currentRoom} />
        
      {/* Main Content Area */}
      <div style={{ 
        flex: 1,
        overflow: 'hidden',
        position: 'relative'
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '200px 1fr 300px',
          gap: 0,
          height: '100%'
        }}>
          {/* Room Selector - Left Sidebar */}
          <div style={{ 
            padding: 'var(--space-4)', 
            borderRight: '0.5px solid var(--color-border-primary)' 
          }}>
            <RoomSelector
              rooms={rooms}
              selectedRoomId={selectedRoomSlug}
              onSelectRoom={handleSelectRoom}
              isLoading={roomsLoading}
              error={roomsError ? 'Failed to load rooms' : null}
            />
          </div>

          {/* Chat Interface - Center */}
          <div style={{ 
            position: 'relative', 
            height: '100%' 
          }}>
            <ChatArea 
              messages={messages} 
              userId={user?.id} 
              onAddReaction={(messageId, emoji) => toggleReactionMutation.mutate({ messageId, emoji })}
              onRemoveReaction={(messageId, emoji) => toggleReactionMutation.mutate({ messageId, emoji })}
              onReply={handleReply}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          </div>

          {/* Room Members Sidebar - Right */}
          <div style={{ 
            height: '100%', 
            display: 'flex', 
            flexDirection: 'column' 
          }}>
            <RoomMembersSidebar 
              messages={messages}
              currentUserId={user?.id}
            />
          </div>
        </div>
                    
        {/* Floating Message Input - Positioned over the chat area */}
        <div 
          style={{
            position: 'absolute',
            bottom: 0,
            left: '200px', // Width of left sidebar
            right: '300px', // Width of right sidebar
            background: 'rgba(0, 0, 0, 0.95)',
            backdropFilter: 'blur(4px)'
          }}
        >
          <MessageInput
            value={newMessage}
            onChange={(e) => {
              setNewMessage(e.target.value);
              if (e.target.value.trim() === '') {
                // Reset to default height when empty
                if (textareaRef.current) {
                  textareaRef.current.style.height = '48px';
                }
                stopTyping();
              } else {
                adjustTextareaHeight();
                startTyping();
              }
            }}
            onSend={handleSendMessage}
            onFileSelect={handleFileSelect}
            fileUploads={fileUploads}
            onRemoveFile={removeFileUpload}
            disabled={!user}
            textareaRef={textareaRef}
            fileInputRef={fileInputRef}
          />
        </div>
        
        {/* Typing indicator positioned absolutely under the input */}
        <div 
          style={{
            position: 'absolute',
            left: '200px', // Width of left sidebar
            bottom: '0',
            paddingLeft: 'var(--space-6)', // Match chat area padding
            paddingBottom: 'var(--space-1)'
          }}
        >
          <TypingIndicator isVisible={typingUsers.length > 0} typingUsers={typingUsers} />
        </div>

        {/* Authentication Overlay for unauthenticated users */}
        {!user && (
          <AuthOverlay onCreateAccountClick={onCreateAccountClick} />
        )}
      </div>
    </div>
  );
};

export default BullRoomPage;