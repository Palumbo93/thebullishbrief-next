# Bull Room Chat Images - Design Document

## Problem Statement

The Bull Room chat system currently has a simulated file upload system that doesn't actually persist files or display images properly. Users can select files, see upload progress, but the files are not actually uploaded to storage and images are not rendered in the chat. We need to implement a complete file upload and display system, starting with images but designed to expand to other document types in the future.

**Current Issues:**
- File uploads are simulated (no actual storage)
- No bull-room-files storage bucket exists
- Images don't render in chat messages
- No file preview modal functionality
- File selector allows all file types, not just images
- No proper error handling for upload failures

**Value:** Adding proper file support will significantly enhance user engagement in Bull Room discussions, allowing users to share charts, screenshots, documents, and other content relevant to trading discussions. The system will start with images but be designed to support PDFs, documents, and other file types in the future.

## Current State Analysis

### ✅ What's Already Implemented
- **UI Components**: Complete file upload UI in `MessageInput.tsx`
- **File Preview Component**: `FilePreview.tsx` exists but not properly integrated
- **Message Types**: Database schema supports `image` and `file` message types
- **File Upload State**: `FileUpload` interface and state management in `useBullRoomState.ts`
- **Message Display**: `MessageContent.tsx` has logic for image messages

### ❌ What's Missing (Core Functionality)
1. **Storage Bucket**: No `bull-room-files` storage bucket
2. **File Upload Service**: No actual file upload to Supabase storage
3. **File Preview Modal**: No clickable file preview functionality
4. **File Type Validation**: File selector allows all file types
5. **Error Handling**: No proper error handling for upload failures
6. **File Optimization**: No file compression/optimization
7. **Extensible File Type System**: No framework for supporting multiple file types

## Solution Design

### Phase 1: Storage Infrastructure

#### 1.1 Create Bull Room Files Storage Bucket
Create a new migration to set up the `bull-room-files` storage bucket with extensible file type support:

```sql
-- Create bull-room-files storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'bull-room-files',
  'bull-room-files',
  true,
  10485760, -- 10MB
  ARRAY[
    -- Images (Phase 1)
    'image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif',
    -- Documents (Future phases)
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain',
    'text/csv'
  ]
);

-- RLS policies for bull-room-files bucket
CREATE POLICY "Anyone can view bull room files" ON storage.objects
  FOR SELECT USING (bucket_id = 'bull-room-files');

CREATE POLICY "Authenticated users can upload bull room files" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'bull-room-files' AND auth.role() = 'authenticated');

CREATE POLICY "Users can update their own bull room files" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'bull-room-files' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete their own bull room files" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'bull-room-files' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );
```

### Phase 2: File Upload Service

#### 2.1 Create File Upload Service
Create `src/services/bullRoomFileUpload.ts`:

```typescript
import { supabase } from '../lib/supabase';

export interface FileUploadResult {
  url: string;
  name: string;
  size: number;
  type: string;
  preview_url?: string;
  preview_type: 'thumbnail' | 'icon';
}

export class BullRoomFileUploadService {
  private static readonly BUCKET_NAME = 'bull-room-files';
  private static readonly MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
  
  // File type configurations for extensibility
  private static readonly FILE_TYPE_CONFIGS = {
    // Images (Phase 1)
    images: {
      mimeTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'],
      maxSize: 10 * 1024 * 1024, // 10MB
      previewType: 'thumbnail' as const,
      allowedInPhase: 1
    },
    // Documents (Future phases)
    documents: {
      mimeTypes: [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'text/plain',
        'text/csv'
      ],
      maxSize: 5 * 1024 * 1024, // 5MB
      previewType: 'icon' as const,
      allowedInPhase: 2
    }
  };

  // Current implementation phase (can be increased to enable more file types)
  private static readonly CURRENT_PHASE = 1;

  /**
   * Get allowed file types for current phase
   */
  private static getAllowedMimeTypes(): string[] {
    return Object.values(this.FILE_TYPE_CONFIGS)
      .filter(config => config.allowedInPhase <= this.CURRENT_PHASE)
      .flatMap(config => config.mimeTypes);
  }

  /**
   * Get file type configuration
   */
  private static getFileTypeConfig(file: File) {
    return Object.entries(this.FILE_TYPE_CONFIGS).find(([_, config]) =>
      config.mimeTypes.includes(file.type)
    )?.[1];
  }

  /**
   * Validate file for upload
   */
  static validateFile(file: File): { isValid: boolean; error?: string } {
    // Check file size
    if (file.size > this.MAX_FILE_SIZE) {
      return { 
        isValid: false, 
        error: `File size must be less than ${Math.round(this.MAX_FILE_SIZE / 1024 / 1024)}MB` 
      };
    }

    // Check if file type is allowed in current phase
    const fileTypeConfig = this.getFileTypeConfig(file);
    if (!fileTypeConfig) {
      return { 
        isValid: false, 
        error: 'File type not supported in current phase' 
      };
    }

    // Check phase-specific file size limits
    if (file.size > fileTypeConfig.maxSize) {
      return { 
        isValid: false, 
        error: `File size must be less than ${Math.round(fileTypeConfig.maxSize / 1024 / 1024)}MB for this file type` 
      };
    }

    return { isValid: true };
  }

  /**
   * Upload file to bull-room-files bucket
   */
  static async uploadFile(
    file: File, 
    roomId: string, 
    userId: string
  ): Promise<FileUploadResult> {
    // Validate file
    const validation = this.validateFile(file);
    if (!validation.isValid) {
      throw new Error(validation.error);
    }

    // Get file type configuration
    const fileTypeConfig = this.getFileTypeConfig(file);
    if (!fileTypeConfig) {
      throw new Error('File type not supported');
    }

    // Generate unique filename
    const fileExt = file.name.split('.').pop() || 'jpg';
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const fileName = `${userId}/${roomId}/${timestamp}-${randomString}.${fileExt}`;

    // Upload file
    const { data, error } = await supabase.storage
      .from(this.BUCKET_NAME)
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      throw new Error(`Failed to upload file: ${error.message}`);
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from(this.BUCKET_NAME)
      .getPublicUrl(fileName);

    // Generate preview URL based on file type
    let previewUrl: string | undefined;
    if (fileTypeConfig.previewType === 'thumbnail' && file.type.startsWith('image/')) {
      previewUrl = publicUrl; // For images, preview URL is the same as the file URL
    }

    return {
      url: publicUrl,
      name: file.name,
      size: file.size,
      type: file.type,
      preview_url: previewUrl,
      preview_type: fileTypeConfig.previewType
    };
  }

  /**
   * Delete file from storage
   */
  static async deleteFile(fileUrl: string): Promise<void> {
    const path = fileUrl.split('/').pop();
    if (!path) return;

    const { error } = await supabase.storage
      .from(this.BUCKET_NAME)
      .remove([path]);

    if (error) {
      throw new Error(`Failed to delete file: ${error.message}`);
    }
  }
}
```

### Phase 3: Enhanced File Upload Hook

#### 3.1 Update useBullRoomState Hook
Enhance the existing hook to handle real file uploads:

```typescript
// In useBullRoomState.ts
import { BullRoomFileUploadService } from '../services/bullRoomFileUpload';

// Update handleFileSelect function
const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
  const files = Array.from(event.target.files || []);
  
  for (const file of files) {
    // Validate file
    const validation = BullRoomFileUploadService.validateFile(file);
    if (!validation.isValid) {
      // Show error toast
      showToast('error', validation.error || 'Invalid file');
      continue;
    }

    const upload: FileUpload = {
      file,
      progress: 0,
      preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined
    };
    
    setFileUploads(prev => [...prev, upload]);
    
    try {
      // Upload file
      const result = await BullRoomFileUploadService.uploadFile(
        file, 
        currentRoom?.id || '', 
        user?.id || ''
      );
      
      // Update upload progress to 100%
      setFileUploads(prev => prev.map(u => 
        u.file === file 
          ? { ...u, progress: 100, uploadResult: result }
          : u
      ));
      
    } catch (error) {
      // Remove failed upload
      setFileUploads(prev => prev.filter(u => u.file !== file));
      showToast('error', error instanceof Error ? error.message : 'Upload failed');
    }
  }
  
  // Reset file input
  if (fileInputRef.current) {
    fileInputRef.current.value = '';
  }
};
```

### Phase 4: File Preview Modal

#### 4.1 Create File Preview Modal Component
Create `src/components/BullRoom/FilePreviewModal.tsx`:

```typescript
import React from 'react';
import { X, Download, ExternalLink } from 'lucide-react';

interface FilePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  fileUrl: string;
  fileName: string;
  fileSize?: number;
  fileType: string;
  previewType: 'thumbnail' | 'icon';
}

export const FilePreviewModal: React.FC<FilePreviewModalProps> = ({
  isOpen,
  onClose,
  fileUrl,
  fileName,
  fileSize,
  fileType,
  previewType
}) => {
  if (!isOpen) return null;

  const isImage = fileType.startsWith('image/');

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = fileUrl;
    link.download = fileName;
    link.click();
  };

  const handleOpenInNewTab = () => {
    window.open(fileUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.8)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: 'var(--space-4)'
    }}>
      <div style={{
        position: 'relative',
        maxWidth: '90vw',
        maxHeight: '90vh',
        background: 'var(--color-bg-primary)',
        borderRadius: 'var(--radius-xl)',
        overflow: 'hidden',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)'
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: 'var(--space-4)',
          borderBottom: '1px solid var(--color-border-primary)',
          background: 'var(--color-bg-secondary)'
        }}>
          <div>
                         <h3 style={{
               fontSize: 'var(--text-lg)',
               fontWeight: 'var(--font-semibold)',
               color: 'var(--color-text-primary)',
               margin: 0
             }}>
               {fileName}
             </h3>
             {fileSize && (
               <p style={{
                 fontSize: 'var(--text-sm)',
                 color: 'var(--color-text-muted)',
                 margin: 'var(--space-1) 0 0 0'
               }}>
                 {formatFileSize(fileSize)}
               </p>
             )}
          </div>
          
          <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
            <button
              onClick={handleDownload}
              style={{
                width: '40px',
                height: '40px',
                background: 'rgba(20, 20, 20, 0.6)',
                color: 'var(--color-text-primary)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 200ms'
              }}
              title="Download image"
            >
              <Download style={{ width: '16px', height: '16px' }} />
            </button>
            
            <button
              onClick={handleOpenInNewTab}
              style={{
                width: '40px',
                height: '40px',
                background: 'rgba(20, 20, 20, 0.6)',
                color: 'var(--color-text-primary)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 200ms'
              }}
              title="Open in new tab"
            >
              <ExternalLink style={{ width: '16px', height: '16px' }} />
            </button>
            
            <button
              onClick={onClose}
              style={{
                width: '40px',
                height: '40px',
                background: 'rgba(20, 20, 20, 0.6)',
                color: 'var(--color-text-primary)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 200ms'
              }}
              title="Close"
            >
              <X style={{ width: '16px', height: '16px' }} />
            </button>
          </div>
        </div>
        
                 {/* File Preview */}
         <div style={{
           display: 'flex',
           alignItems: 'center',
           justifyContent: 'center',
           padding: 'var(--space-4)',
           maxHeight: 'calc(90vh - 120px)',
           overflow: 'auto'
         }}>
           {isImage ? (
             <img
               src={fileUrl}
               alt={fileName}
               style={{
                 maxWidth: '100%',
                 maxHeight: '100%',
                 objectFit: 'contain',
                 borderRadius: 'var(--radius-lg)'
               }}
             />
           ) : (
             <div style={{
               display: 'flex',
               flexDirection: 'column',
               alignItems: 'center',
               gap: 'var(--space-4)',
               padding: 'var(--space-8)'
             }}>
               <div style={{
                 width: '120px',
                 height: '120px',
                 background: 'rgba(20, 20, 20, 0.3)',
                 borderRadius: 'var(--radius-xl)',
                 display: 'flex',
                 alignItems: 'center',
                 justifyContent: 'center',
                 border: '1px solid rgba(31, 31, 31, 0.3)'
               }}>
                 <FileIcon style={{ 
                   width: '48px', 
                   height: '48px', 
                   color: 'var(--color-brand-primary)' 
                 }} />
               </div>
               <p style={{
                 fontSize: 'var(--text-lg)',
                 color: 'var(--color-text-muted)',
                 textAlign: 'center'
               }}>
                 Preview not available for this file type
               </p>
               <button
                 onClick={handleOpenInNewTab}
                 style={{
                   padding: 'var(--space-3) var(--space-6)',
                   background: 'var(--color-brand-primary)',
                   color: '#000000',
                   border: 'none',
                   borderRadius: 'var(--radius-lg)',
                   fontSize: 'var(--text-sm)',
                   fontWeight: 'var(--font-semibold)',
                   cursor: 'pointer',
                   transition: 'all 200ms'
                 }}
               >
                 Open File
               </button>
             </div>
           )}
         </div>
      </div>
    </div>
  );
};
```

### Phase 5: Enhanced File Preview Component

#### 5.1 Update FilePreview Component
Enhance the existing `FilePreview.tsx` to support extensible file types:

```typescript
// In FilePreview.tsx
import React, { useState } from 'react';
import { File as FileIcon, Eye, FileText, FileSpreadsheet, FileImage } from 'lucide-react';
import { FilePreviewModal } from './FilePreviewModal';
import { formatFileSize } from './utils/formatters';

export const FilePreview: React.FC<FilePreviewProps> = ({ 
  fileData, 
  content, 
  className = '' 
}) => {
  const [showFileModal, setShowFileModal] = useState(false);
  const isImage = fileData.type.startsWith('image/');
  const isDocument = fileData.type.includes('pdf') || fileData.type.includes('word') || fileData.type.includes('excel');
  
  // Get appropriate icon for file type
  const getFileIcon = () => {
    if (isImage) return <FileImage style={{ width: '24px', height: '24px', color: 'var(--color-brand-primary)' }} />;
    if (fileData.type.includes('pdf')) return <FileText style={{ width: '24px', height: '24px', color: 'var(--color-brand-primary)' }} />;
    if (fileData.type.includes('excel') || fileData.type.includes('spreadsheet')) return <FileSpreadsheet style={{ width: '24px', height: '24px', color: 'var(--color-brand-primary)' }} />;
    return <FileIcon style={{ width: '24px', height: '24px', color: 'var(--color-brand-primary)' }} />;
  };
  
  if (isImage) {
    return (
      <>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }} className={className}>
          <div style={{ position: 'relative' }}>
            <img 
              src={fileData.url} 
              alt={content || fileData.name}
              style={{
                width: '120px',
                height: '120px',
                borderRadius: 'var(--radius-lg)',
                objectFit: 'cover',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                cursor: 'pointer',
                transition: 'transform 200ms',
                border: '1px solid rgba(31, 31, 31, 0.2)'
              }}
              onClick={() => setShowFileModal(true)}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.05)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.2)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.1)';
              }}
            />
            
            {/* Image overlay with view icon */}
            <div style={{
              position: 'absolute',
              top: 'var(--space-2)',
              right: 'var(--space-2)',
              background: 'rgba(0, 0, 0, 0.7)',
              color: 'white',
              borderRadius: '50%',
              width: '28px',
              height: '28px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              opacity: 0,
              transition: 'opacity 200ms'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.opacity = '1';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.opacity = '0';
            }}
            >
              <Eye style={{ width: '14px', height: '14px' }} />
            </div>
          </div>
          
          {content && (
            <p style={{
              fontSize: 'var(--text-sm)',
              lineHeight: 'var(--leading-relaxed)',
              opacity: 0.9,
              marginTop: 'var(--space-2)'
            }}>
              {content}
            </p>
          )}
        </div>
        
        <FilePreviewModal
          isOpen={showFileModal}
          onClose={() => setShowFileModal(false)}
          fileUrl={fileData.url}
          fileName={fileData.name}
          fileSize={fileData.size}
          fileType={fileData.type}
          previewType="thumbnail"
        />
      </>
    );
  }
  
  // Document/file preview (non-image)
  return (
    <>
      <div 
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-3)',
          padding: 'var(--space-3)',
          background: 'rgba(20, 20, 20, 0.2)',
          borderRadius: 'var(--radius-xl)',
          border: '1px solid rgba(31, 31, 31, 0.2)',
          cursor: 'pointer',
          transition: 'all var(--transition-base)',
          width: 'fit-content',
          maxWidth: '300px'
        }}
        className={className}
        onClick={() => setShowFileModal(true)}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'rgba(20, 20, 20, 0.3)';
          e.currentTarget.style.borderColor = 'rgba(31, 31, 31, 0.4)';
          e.currentTarget.style.transform = 'scale(1.02)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'rgba(20, 20, 20, 0.2)';
          e.currentTarget.style.borderColor = 'rgba(31, 31, 31, 0.2)';
          e.currentTarget.style.transform = 'scale(1)';
        }}
      >
        <div style={{
          width: '40px',
          height: '40px',
          background: 'rgba(255, 255, 255, 0.2)',
          borderRadius: 'var(--radius-lg)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          {getFileIcon()}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{
            fontSize: 'var(--text-sm)',
            fontWeight: 'var(--font-medium)',
            color: 'var(--color-text-primary)',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            marginBottom: 'var(--space-1)'
          }}>
            {content || fileData.name}
          </p>
          <p style={{
            fontSize: 'var(--text-xs)',
            color: 'rgba(153, 153, 153, 0.7)',
            fontWeight: 'var(--font-medium)'
          }}>
            {formatFileSize(fileData.size)}
          </p>
        </div>
      </div>
      
      <FilePreviewModal
        isOpen={showFileModal}
        onClose={() => setShowFileModal(false)}
        fileUrl={fileData.url}
        fileName={fileData.name}
        fileSize={fileData.size}
        fileType={fileData.type}
        previewType="icon"
      />
    </>
  );
};
```

### Phase 6: Update Message Input

#### 6.1 Update MessageInput Component
Update the file input to accept current phase file types:

```typescript
// In MessageInput.tsx - update the hidden file input
// This will be dynamically generated based on current phase
const getAcceptedFileTypes = () => {
  const currentPhase = 1; // This can be increased to enable more file types
  const allowedTypes = {
    1: 'image/*', // Phase 1: Images only
    2: 'image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt,.csv' // Phase 2: Images + Documents
  };
  return allowedTypes[currentPhase] || 'image/*';
};

// In the component
<input
  ref={fileInputRef}
  type="file"
  multiple
  accept={getAcceptedFileTypes()}
  onChange={onFileSelect}
  style={{ display: 'none' }}
/>
```

### Phase 7: Message Sending Integration

#### 7.1 Update Message Sending Logic
Update the message sending logic in `useBullRoomState.ts` to handle file uploads:

```typescript
// In useBullRoomState.ts
const handleSendMessageWithCleanup = async () => {
  if (!newMessage.trim() && fileUploads.length === 0) return;
  
  try {
    setIsCreatingMessage(true);
    
    // Handle file uploads first
    const fileData = fileUploads.length > 0 
      ? fileUploads[0].uploadResult // Use the uploaded file data
      : undefined;
    
    // Send message with file data
    await createMessage({
      roomId: currentRoom?.id || '',
      content: newMessage.trim(),
      messageType: fileData ? 'image' : 'text',
      fileData: fileData
    });
    
    // Clear state
    setNewMessage('');
    setFileUploads([]);
    resetTextareaHeight();
    
  } catch (error) {
    showToast('error', 'Failed to send message');
  } finally {
    setIsCreatingMessage(false);
  }
};
```

## Implementation Plan

### Phase 1: Storage Infrastructure (Day 1)
1. Create migration for `bull-room-files` storage bucket with extensible file types
2. Test bucket creation and policies
3. Update storage constants

### Phase 2: File Upload Service (Day 2)
1. Create `BullRoomFileUploadService` with phase-based file type support
2. Add extensible file validation logic
3. Implement upload and delete methods
4. Add error handling and phase management

### Phase 3: Enhanced File Upload Hook (Day 3)
1. Update `useBullRoomState` hook
2. Integrate real file uploads with phase validation
3. Add progress tracking
4. Add error handling and toasts

### Phase 4: File Preview Modal (Day 4)
1. Create `FilePreviewModal` component with support for different file types
2. Add download and open functionality
3. Style modal with proper animations for both images and documents
4. Test modal interactions

### Phase 5: Enhanced File Preview (Day 5)
1. Update `FilePreview` component with extensible file type support
2. Add clickable thumbnail squares for images
3. Add document icons and preview for non-image files
4. Integrate with file preview modal

### Phase 6: Message Input Updates (Day 6)
1. Update file input to accept current phase file types
2. Test file type validation
3. Update message sending logic
4. Test complete flow

### Phase 7: Testing and Polish (Day 7)
1. End-to-end testing
2. Error handling improvements
3. Performance optimizations
4. UI/UX refinements
5. Future extensibility testing

## Testing Strategy

### Unit Tests
- File validation logic
- Upload service methods
- File size and type validation
- Error handling

### Integration Tests
- File upload flow
- Image preview modal
- Message sending with files
- File deletion

### E2E Tests
- Complete image upload and display flow
- Image preview modal functionality
- File type validation
- Error scenarios

## Performance Considerations

1. **Image Optimization**: Consider adding image compression for large files
2. **Lazy Loading**: Implement lazy loading for images in chat
3. **Caching**: Leverage browser caching for uploaded images
4. **File Size Limits**: Enforce reasonable file size limits (10MB max)

## Security Considerations

1. **File Type Validation**: Strict validation of allowed image types
2. **File Size Limits**: Prevent abuse with large file uploads
3. **User Permissions**: Only authenticated users can upload files
4. **File Ownership**: Users can only delete their own files
5. **Content Scanning**: Consider malware scanning for uploaded files

## Success Metrics

1. **Functionality**: Users can successfully upload and view images (Phase 1)
2. **Performance**: File uploads complete within 5 seconds
3. **User Experience**: Smooth file preview and modal interactions
4. **Error Handling**: Clear error messages for failed uploads
5. **Security**: No unauthorized file uploads or access
6. **Extensibility**: System can easily support additional file types in future phases

## Future Extensibility

### Phase 2: Document Support
- Enable PDF, Word, Excel, and text file uploads
- Add document-specific icons and previews
- Implement document-specific validation rules
- Add document preview capabilities (if possible)

### Phase 3: Advanced Features
- File compression and optimization
- Batch file uploads
- File versioning
- Advanced preview capabilities
- File sharing and permissions

### Phase 4: Integration Features
- Integration with external document viewers
- File conversion capabilities
- Advanced search and filtering
- File analytics and usage tracking
