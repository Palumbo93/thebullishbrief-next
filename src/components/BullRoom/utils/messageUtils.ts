import { BullRoomMessage } from '../../../types/bullRoom.types';

/**
 * Utility functions for message logic in Bull Room components
 */

/**
 * Determine if username should be shown for a message
 * @param message - Current message
 * @param previousMessage - Previous message in the list
 * @returns True if username should be displayed
 */
export const shouldShowUsername = (
  message: BullRoomMessage, 
  previousMessage?: BullRoomMessage
): boolean => {
  // Always show username if no previous message
  if (!previousMessage) return true;
  
  // Show username if different user
  if (message.user_id !== previousMessage.user_id) return true;
  
  // Show username if message is edited
  if (message.is_edited) return true;
  
  // Show username if there's a significant time gap (more than 5 minutes)
  const currentTime = new Date(message.created_at || '').getTime();
  const previousTime = new Date(previousMessage.created_at || '').getTime();
  const timeDiff = currentTime - previousTime;
  const fiveMinutes = 5 * 60 * 1000;
  
  return timeDiff > fiveMinutes;
};

/**
 * Check if a message belongs to the current user
 * @param message - Message to check
 * @param userId - Current user's ID
 * @returns True if message belongs to current user
 */
export const isOwnMessage = (
  message: BullRoomMessage, 
  userId?: string
): boolean => {
  return message.user_id === userId;
};

/**
 * Get the message type from a message
 * @param message - Message to check
 * @returns Message type string
 */
export const getMessageType = (message: BullRoomMessage): 'text' | 'image' | 'file' | 'system' => {
  const type = message.message_type;
  if (type === 'image' || type === 'file' || type === 'system') {
    return type;
  }
  return 'text';
};

/**
 * Check if a message has file data
 * @param message - Message to check
 * @returns True if message has file data
 */
export const hasFileData = (message: BullRoomMessage): boolean => {
  return !!(message.file_data && typeof message.file_data === 'object');
};

/**
 * Check if a message is an image
 * @param message - Message to check
 * @returns True if message is an image
 */
export const isImageMessage = (message: BullRoomMessage): boolean => {
  return message.message_type === 'image' || 
         (hasFileData(message) && (message.file_data as any)?.type?.startsWith('image/'));
};

/**
 * Check if a message is a file (non-image)
 * @param message - Message to check
 * @returns True if message is a file
 */
export const isFileMessage = (message: BullRoomMessage): boolean => {
  return message.message_type === 'file' || 
         (hasFileData(message) && !(message.file_data as any)?.type?.startsWith('image/'));
};

/**
 * Check if a message has reactions
 * @param message - Message to check
 * @returns True if message has reactions
 */
export const hasReactions = (message: BullRoomMessage): boolean => {
  return !!(message.reactions && 
           typeof message.reactions === 'object' && 
           Object.keys(message.reactions).length > 0);
};

/**
 * Get the display name for a message
 * @param message - Message to get display name for
 * @returns Display name string
 */
export const getMessageDisplayName = (message: BullRoomMessage): string => {
  return message.username || 'Anonymous';
};
