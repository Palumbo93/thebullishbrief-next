import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useBullRooms, useBullRoom } from './useBullRooms';
import { useBullRoomMessages } from './useBullRoomMessages';

// File upload types
interface FileUpload {
  file: File;
  preview?: string;
  progress: number;
}

export const useBullRoomState = (roomSlug?: string) => {
  const router = useRouter();
  const selectedRoomSlug = roomSlug || 'general';
  
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
    adjustTextareaHeight,
    resetTextareaHeight
  };
};
