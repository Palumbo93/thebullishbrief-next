import { useState, useCallback } from 'react';

/**
 * Hook for managing message reply state and functionality
 */
export const useMessageReply = () => {
  const [replyingTo, setReplyingTo] = useState<{
    messageId: string;
    username: string;
    content: string;
  } | null>(null);

  const startReply = useCallback((messageId: string, username: string, content: string) => {
    setReplyingTo({ messageId, username, content });
  }, []);

  const cancelReply = useCallback(() => {
    setReplyingTo(null);
  }, []);

  const isReplying = replyingTo !== null;

  return {
    replyingTo,
    startReply,
    cancelReply,
    isReplying,
  };
};
