import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { ensureStorageBuckets, deleteImage } from '../lib/storage';

interface UploadSession {
  sessionId: string;
  uploadedFiles: Array<{
    bucket: string;
    path: string;
  }>;
}

export function useUploadSession() {
  const [session, setSession] = useState<UploadSession | null>(null);

  // Initialize session when hook is first used
  useEffect(() => {
    if (!session) {
      const sessionId = uuidv4();
      setSession({
        sessionId,
        uploadedFiles: []
      });
      
      // Ensure storage buckets exist
      ensureStorageBuckets();
    }
  }, [session]);

  // Track uploaded files
  const trackUpload = (bucket: string, path: string) => {
    if (session) {
      setSession(prev => prev ? {
        ...prev,
        uploadedFiles: [...prev.uploadedFiles, { bucket, path }]
      } : null);
    }
  };

  // Clean up uploaded files if session is cancelled
  const cleanupSession = async () => {
    if (session && session.uploadedFiles.length > 0) {
      try {
        // Delete all uploaded files
        for (const file of session.uploadedFiles) {
          await deleteImage(file.bucket, file.path);
        }
      } catch (error) {
        console.error('Failed to cleanup upload session:', error);
      }
    }
    
    // Reset session
    setSession(null);
  };

  // Commit session (don't cleanup, files are now permanent)
  const commitSession = () => {
    setSession(null);
  };

  return {
    sessionId: session?.sessionId,
    trackUpload,
    cleanupSession,
    commitSession,
    isActive: !!session
  };
} 