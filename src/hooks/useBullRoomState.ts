import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useBullRooms, useBullRoom } from './useBullRooms';
import { useBullRoomMessages, useCreateMessage } from './useBullRoomMessages';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from './useToast';
import { BullRoomFileUploadService, FileUploadResult } from '../services/bullRoomFileUpload';

// File upload types
interface FileUpload {
  file: File;
  preview?: string;
  progress: number;
  uploadResult?: FileUploadResult;
  error?: string;
}

export const useBullRoomState = (roomSlug?: string) => {
  const router = useRouter();
  const selectedRoomSlug = roomSlug || 'general';
  const { user } = useAuth();
  const toast = useToast();
  
  // File upload refs
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Room state
  const { 
    data: rooms = [], 
    isLoading: roomsLoading, 
    error: roomsError 
  } = useBullRooms();

  const { 
    data: currentRoom, 
    isLoading: roomLoading, 
    error: roomError 
  } = useBullRoom(selectedRoomSlug);

  // Message state
  const [newMessage, setNewMessage] = useState<string>('');
  const [fileUploads, setFileUploads] = useState<FileUpload[]>([]);

  const { 
    data: messages = [], 
    isLoading: messagesLoading, 
    error: messagesError 
  } = useBullRoomMessages(currentRoom?.id || '');

  // Message creation mutation
  const createMessageMutation = useCreateMessage();

  // Auto-redirect to general room if no specific room is provided
  const handleRoomRedirect = () => {
    if (!roomSlug) {
      router.replace('/bull-room/general');
    }
  };

  // Room selection handler
  const handleSelectRoom = (roomSlug: string) => {
    router.push(`/bull-room/${roomSlug}`);
  };

  // File upload handlers
  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    
    for (const file of files) {
      // Validate file
      const validation = BullRoomFileUploadService.validateFile(file);
      if (!validation.isValid) {
        toast.error(validation.error || 'Invalid file');
        continue;
      }

      const upload: FileUpload = {
        file,
        progress: 0,
        preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined
      };
      
      setFileUploads(prev => [...prev, upload]);
      
      try {
        // Upload file with real progress tracking
        const result = await BullRoomFileUploadService.uploadFile(
          file, 
          currentRoom?.id || '', 
          user?.id || ''
        );
        
        // Update upload progress to 100% and store result
        setFileUploads(prev => prev.map(u => 
          u.file === file 
            ? { ...u, progress: 100, uploadResult: result }
            : u
        ));
        
        toast.success('File uploaded successfully');
        
      } catch (error) {
        // Update upload with error
        setFileUploads(prev => prev.map(u => 
          u.file === file 
            ? { ...u, progress: 0, error: error instanceof Error ? error.message : 'Upload failed' }
            : u
        ));
        
        toast.error(error instanceof Error ? error.message : 'Upload failed');
        
        // Remove failed upload after 3 seconds
        setTimeout(() => {
          setFileUploads(prev => prev.filter(u => u.file !== file));
        }, 3000);
      }
    }
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeFileUpload = (file: File) => {
    setFileUploads(prev => prev.filter(u => u.file !== file));
  };

  // Textarea auto-resize handler
  const adjustTextareaHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const newHeight = Math.min(textareaRef.current.scrollHeight, 120);
      textareaRef.current.style.height = newHeight + 'px';
    }
  };

  const resetTextareaHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = '48px';
    }
  };

  // Message state handlers
  const updateNewMessage = (value: string) => {
    setNewMessage(value);
    if (value.trim() === '') {
      resetTextareaHeight();
    } else {
      adjustTextareaHeight();
    }
  };

  const clearNewMessage = () => {
    setNewMessage('');
    resetTextareaHeight();
    
    // Refocus the textarea after clearing to maintain focus
    requestAnimationFrame(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
      }
    });
  };

  // Enhanced send message handler with file support
  const handleSendMessageWithCleanup = async () => {
    if (!newMessage.trim() && fileUploads.length === 0) return;
    
    try {
      // Handle file uploads first
      const fileData = fileUploads.length > 0 
        ? fileUploads[0].uploadResult // Use the uploaded file data
        : undefined;
      
      // Send message with file data
      await createMessageMutation.mutateAsync({
        room_id: currentRoom?.id || '',
        content: newMessage.trim(),
        message_type: fileData ? 'image' : 'text',
        file_data: fileData
      });
      
      // Clear state
      setNewMessage('');
      setFileUploads([]);
      resetTextareaHeight();
      
      toast.success('Message sent successfully');
      
    } catch (error) {
      toast.error('Failed to send message');
      console.error('Failed to send message:', error);
    }
  };

  return {
    // Room state
    rooms,
    roomsLoading,
    roomsError,
    currentRoom,
    roomLoading,
    roomError,
    selectedRoomSlug,
    
    // Message state
    messages,
    messagesLoading,
    messagesError,
    newMessage,
    fileUploads,
    
    // Refs
    fileInputRef,
    textareaRef,
    
    // Handlers
    handleRoomRedirect,
    handleSelectRoom,
    handleFileSelect,
    removeFileUpload,
    updateNewMessage,
    clearNewMessage,
    handleSendMessageWithCleanup,
    adjustTextareaHeight,
    resetTextareaHeight
  };
};
