/**
 * Bull Room Message Types
 */

export interface BullRoomMessage {
  id: string;
  room_id: string;
  user_id: string;
  username: string; // Direct username storage for fast display
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
  };
  reply_to?: BullRoomMessage;
}

export interface FileUpload {
  file: File;
  preview?: string;
  progress: number;
  upload_id: string;
}

export interface MessageReaction {
  emoji: string;
  user_ids: string[];
  count: number;
}

export interface TypingUser {
  user_id: string;
  username: string;
  started_at: string;
}

export interface RoomContext {
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

// Themed emoji reactions for the Bull Room
export const THEMED_EMOJIS = {
  BULL: '🐂',        // Bull market sentiment
  CHART_DOWN: '📉',  // Bearish sentiment, losses
  PUFF_OF_SMOKE: '💨', // Hot takes, trending
  PREGNANT_MAN: '🫃', // Diamond hands, holding strong
} as const;

export type ThemedEmoji = typeof THEMED_EMOJIS[keyof typeof THEMED_EMOJIS];

export const THEMED_EMOJI_LIST: ThemedEmoji[] = Object.values(THEMED_EMOJIS); 