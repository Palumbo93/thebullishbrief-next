import { useState, useEffect, useCallback, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { EntityImageStorageService, ENTITY_UPLOAD_CONFIGS } from '../lib/storage';

/**
 * Represents an uploaded file in the session
 */
interface UploadedFile {
  bucket: string;
  finalPath: string;       // Direct upload path, no moving needed
  fileType: 'primary' | 'secondary' | 'tertiary';
  originalName: string;
  url: string;
  uploadedAt: Date;
}

/**
 * Entity upload session state
 */
interface EntityUploadSession {
  entityId: string;          // Pre-generated UUID for creates, existing ID for edits
  entityType: string;
  modalType: 'create' | 'edit';
  uploadedFiles: UploadedFile[];
  createdAt: Date;
  isActive: boolean;
}

/**
 * Return type for the useEntityUploadSession hook
 */
interface UseEntityUploadSessionReturn {
  /** The entity ID being used (pre-generated for creates, existing for edits) */
  entityId: string | null;
  
  /** Current session state */
  session: EntityUploadSession | null;
  
  /** List of uploaded files in this session */
  uploadedFiles: UploadedFile[];
  
  /** Whether the session is currently active */
  isActive: boolean;
  
  /** Initialize the upload session */
  initializeSession: () => string;
  
  /** Upload a file directly to the organized entity location */
  uploadDirect: (file: File, fileType: 'primary' | 'secondary' | 'tertiary') => Promise<UploadedFile>;
  
  /** Remove a specific uploaded file */
  removeUpload: (fileUrl: string) => Promise<void>;
  
  /** Complete entity creation (no file operations needed - files already in place) */
  commitCreate: () => void;
  
  /** Clean up session (delete entity folder for creates, do nothing for edits) */
  cleanup: () => Promise<void>;
  
  /** Reset the session to initial state */
  reset: () => void;
}

/**
 * Enhanced upload session hook for entity-based image management
 * 
 * Key features:
 * - Direct upload to final organized locations (no temp files or moving)
 * - CREATE modals: Generate UUID → Upload to organized folder → Create entity with UUID
 * - EDIT modals: Use existing ID → Upload to existing folder → Do nothing on cancel
 * - Automatic cleanup of entity folders when CREATE operations are cancelled
 * 
 * @param entityType - The type of entity (article, author, brief, company)
 * @param modalType - Whether this is a create or edit modal
 * @param existingEntityId - Required for edit modals, ignored for create modals
 */
export function useEntityUploadSession(
  entityType: string, 
  modalType: 'create' | 'edit',
  existingEntityId?: string
): UseEntityUploadSessionReturn {
  const [session, setSession] = useState<EntityUploadSession | null>(null);
  const initializationRef = useRef(false);

  // Validate entity type
  useEffect(() => {
    if (!ENTITY_UPLOAD_CONFIGS[entityType]) {
      console.error(`Invalid entity type: ${entityType}`);
    }
  }, [entityType]);

  // Validate required parameters
  useEffect(() => {
    if (modalType === 'edit' && !existingEntityId) {
      console.error('existingEntityId is required for edit modals');
    }
  }, [modalType, existingEntityId]);

  // Auto-initialize edit sessions since we have the entity ID
  useEffect(() => {
    if (modalType === 'edit' && existingEntityId && !session?.isActive && !initializationRef.current) {
      // Initialize session directly without depending on the callback
      initializationRef.current = true;
      const entityId = existingEntityId;
      
      const newSession: EntityUploadSession = {
        entityId,
        entityType,
        modalType,
        uploadedFiles: [],
        createdAt: new Date(),
        isActive: true
      };

      setSession(newSession);
    }
  }, [modalType, existingEntityId, session?.isActive, entityType]);

  /**
   * Initialize the upload session
   * Returns the entity ID that will be used for uploads
   */
  const initializeSession = useCallback(() => {
    if (session?.isActive) {
      console.warn('Upload session already active, returning existing entityId:', session.entityId);
      return session.entityId;
    }

    if (initializationRef.current) {
      console.warn('Session initialization already in progress');
      return session?.entityId || '';
    }

    initializationRef.current = true;
    const entityId = modalType === 'create' ? uuidv4() : existingEntityId!;
    
    const newSession: EntityUploadSession = {
      entityId,
      entityType,
      modalType,
      uploadedFiles: [],
      createdAt: new Date(),
      isActive: true
    };

    setSession(newSession);
    return entityId;
  }, [entityType, modalType, existingEntityId, session]); // Removed session from dependencies to prevent recreation

  /**
   * Upload file directly to organized entity location
   */
  const uploadDirect = useCallback(async (
    file: File, 
    fileType: 'primary' | 'secondary' | 'tertiary'
  ): Promise<UploadedFile> => {
    if (!session?.isActive) {
      throw new Error('No active upload session. Call initializeSession() first.');
    }

    try {
      // Upload directly to final organized location
      const result = await EntityImageStorageService.uploadDirectToEntity(
        file,
        entityType,
        session.entityId,
        fileType
      );

      const uploadedFile: UploadedFile = {
        bucket: ENTITY_UPLOAD_CONFIGS[entityType].buckets[
          fileType === 'primary' ? 'primary' : 
          fileType === 'secondary' ? 'secondary' : 
          'tertiary'
        ]!,
        finalPath: result.path,
        fileType,
        originalName: file.name,
        url: result.url,
        uploadedAt: new Date()
      };

      // Track the upload in session
      setSession(prev => prev ? {
        ...prev,
        uploadedFiles: [...prev.uploadedFiles, uploadedFile]
      } : null);

      return uploadedFile;
      
    } catch (error) {
      console.error(`Failed to upload ${fileType} image for ${entityType}:`, error);
      throw error;
    }
  }, [session, entityType]);

  /**
   * Remove a specific uploaded file
   */
  const removeUpload = useCallback(async (fileUrl: string): Promise<void> => {
    if (!session?.isActive) {
      console.warn('No active session for file removal');
      return;
    }

    const fileToRemove = session.uploadedFiles.find(f => f.url === fileUrl);
    if (!fileToRemove) {
      console.warn('File not found in session:', fileUrl);
      return;
    }

    try {
      // Delete the file from storage
      await EntityImageStorageService.deleteSpecificImage(
        fileToRemove.bucket,
        fileToRemove.finalPath
      );

      // Remove from session tracking
      setSession(prev => prev ? {
        ...prev,
        uploadedFiles: prev.uploadedFiles.filter(f => f.url !== fileUrl)
      } : null);

      
    } catch (error) {
      console.error('Failed to remove uploaded file:', error);
      throw error;
    }
  }, [session]);

  /**
   * Complete entity creation - files already in final location
   */
  const commitCreate = useCallback(() => {
    if (!session?.isActive) {
      console.warn('No active session to commit');
      return;
    }

    if (session.modalType !== 'create') {
      console.warn('commitCreate should only be used with create modals');
    }

    
    // Mark session as inactive but don't cleanup files (they're now permanent)
    setSession(prev => prev ? { ...prev, isActive: false } : null);
  }, [session, entityType]);

  /**
   * Clean up session
   * - CREATE modals: Delete entire entity folder (cleanup orphaned files)
   * - EDIT modals: Do nothing (files belong to existing entity)
   */
  const cleanup = useCallback(async (): Promise<void> => {
    if (!session) {
      return; // Nothing to cleanup
    }

    try {
      if (session.modalType === 'create' && session.uploadedFiles.length > 0) {
        // For CREATE modals: delete entire entity folder since creation was cancelled
        console.log(`Cleaning up cancelled ${entityType} creation:`, session.entityId);
        await EntityImageStorageService.cleanupEntityFolder(
          entityType,
          session.entityId
        );
        console.log(`Cleanup completed for ${entityType}:`, session.entityId);
      } else if (session.modalType === 'edit') {
        // For EDIT modals: do nothing (files belong to existing entity)
        console.log(`Edit modal cancelled - no cleanup needed for existing ${entityType}`);
      }
    } catch (error) {
      console.error(`Failed to cleanup ${entityType} session:`, error);
      // Don't throw - cleanup failures shouldn't prevent modal from closing
    } finally {
      // Always reset session state
      setSession(null);
    }
  }, [session, entityType]);

  /**
   * Reset session to initial state
   */
  const reset = useCallback(() => {
    setSession(null);
  }, []);

  // Enterprise-safe: No automatic cleanup on unmount
  // Files remain in organized folders for scheduled cleanup job
  // useEffect(() => {
  //   return () => {
  //     if (session?.isActive) {
  //       cleanup().catch(console.error);
  //     }
  //   };
  // }, [session?.isActive, cleanup]);

  return {
    entityId: session?.entityId || null,
    session,
    uploadedFiles: session?.uploadedFiles || [],
    isActive: session?.isActive || false,
    initializeSession,
    uploadDirect,
    removeUpload,
    commitCreate,
    cleanup,
    reset
  };
}

/**
 * Convenience hook for CREATE modals
 */
export function useCreateUploadSession(entityType: string) {
  return useEntityUploadSession(entityType, 'create');
}

/**
 * Convenience hook for EDIT modals  
 */
export function useEditUploadSession(entityType: string, entityId: string) {
  return useEntityUploadSession(entityType, 'edit', entityId);
}
