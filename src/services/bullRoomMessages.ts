import { supabase } from '../lib/supabase';
import { BullRoomMessage } from '../types/bullRoom.types';

/**
 * Service for managing Bull Room messages
 */
export class BullRoomMessageService {
  /**
   * Get messages for a specific room
   */
  async getMessages(roomId: string, limit = 50, offset = 0): Promise<BullRoomMessage[]> {
    const { data, error } = await supabase
      .from('bull_room_messages')
      .select(`
        *,
        reply_to:bull_room_messages!reply_to_id(*)
      `)
      .eq('room_id', roomId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Error fetching messages:', error);
      throw new Error(`Failed to fetch messages: ${error.message}`);
    }

    // Messages already include username field, no need to fetch user profiles
    const messages = data || [];

    // Fetch reactions for all messages
    const messageIds = messages.map(msg => msg.id);
    const reactionsMap = new Map<string, Record<string, string[]>>();
    
    if (messageIds.length > 0) {
      const { data: reactionsData, error: reactionsError } = await supabase
        .from('bull_room_reactions')
        .select('message_id, emoji, user_id')
        .in('message_id', messageIds);

      if (reactionsError) {
        console.error('Error fetching reactions:', reactionsError);
      } else {
        // Group reactions by message_id
        reactionsData?.forEach(reaction => {
          if (!reactionsMap.has(reaction.message_id)) {
            reactionsMap.set(reaction.message_id, {});
          }
          const messageReactions = reactionsMap.get(reaction.message_id)!;
          if (!messageReactions[reaction.emoji]) {
            messageReactions[reaction.emoji] = [];
          }
          messageReactions[reaction.emoji].push(reaction.user_id);
        });
      }
    }

    // Attach reactions to messages
    const messagesWithReactions = messages.map(message => {
      const reactions = reactionsMap.get(message.id) || {};
      return {
        ...message,
        reactions
      };
    });

    return messagesWithReactions;
  }

  /**
   * Create a new message
   */
  async createMessage(messageData: Partial<BullRoomMessage>): Promise<BullRoomMessage> {
    // Ensure username is included
    const messageWithUsername = {
      ...messageData,
      username: messageData.username || 'Anonymous',
      message_type: messageData.message_type || 'text',
      is_edited: false,
    };

    const { data, error } = await supabase
      .from('bull_room_messages')
      .insert(messageWithUsername)
      .select(`
        *,
        user:user_profiles(id, username)
      `)
      .single();

    if (error) {
      console.error('Error creating message:', error);
      throw new Error(`Failed to create message: ${error.message}`);
    }

    return data;
  }

  /**
   * Update an existing message
   */
  async updateMessage(messageId: string, updates: Partial<BullRoomMessage>): Promise<BullRoomMessage> {
    const { data, error } = await supabase
      .from('bull_room_messages')
      .update({ 
        ...updates, 
        is_edited: true, 
        edited_at: new Date().toISOString() 
      })
      .eq('id', messageId)
      .select(`
        *,
        user:user_profiles(id, username)
      `)
      .single();

    if (error) {
      console.error('Error updating message:', error);
      throw new Error(`Failed to update message: ${error.message}`);
    }

    return data;
  }

  /**
   * Delete a message
   */
  async deleteMessage(messageId: string): Promise<void> {
    const { error } = await supabase
      .from('bull_room_messages')
      .delete()
      .eq('id', messageId);

    if (error) {
      console.error('Error deleting message:', error);
      throw new Error(`Failed to delete message: ${error.message}`);
    }
  }

  /**
   * Add a reaction to a message
   */
  async addReaction(messageId: string, emoji: string, userId: string): Promise<void> {
    // First check if the reaction already exists
    const { data: existingReactions, error: checkError } = await supabase
      .from('bull_room_reactions')
      .select('id, emoji')
      .eq('message_id', messageId)
      .eq('user_id', userId);

    if (checkError) {
      console.error('Error checking existing reactions:', checkError);
      throw new Error(`Failed to check reactions: ${checkError.message}`);
    }

    // Check if this specific emoji reaction exists
    const existingReaction = existingReactions?.find(r => r.emoji === emoji);

    // If reaction exists, remove it (toggle behavior)
    if (existingReaction) {
      const { error: deleteError } = await supabase
        .from('bull_room_reactions')
        .delete()
        .eq('id', existingReaction.id);

      if (deleteError) {
        console.error('Error removing reaction:', deleteError);
        throw new Error(`Failed to remove reaction: ${deleteError.message}`);
      }
    } else {
      // If reaction doesn't exist, add it
      const { error: insertError } = await supabase
        .from('bull_room_reactions')
        .insert({
          message_id: messageId,
          user_id: userId,
          emoji: emoji
        });

      if (insertError) {
        console.error('Error adding reaction:', insertError);
        throw new Error(`Failed to add reaction: ${insertError.message}`);
      }
    }
  }

  /**
   * Remove a reaction from a message (kept for backward compatibility)
   */
  async removeReaction(messageId: string, emoji: string, userId: string): Promise<void> {
    // This is now handled by addReaction which toggles
    await this.addReaction(messageId, emoji, userId);
  }

  /**
   * Get reactions for a message
   */
  async getMessageReactions(messageId: string): Promise<Record<string, string[]>> {
    const { data, error } = await supabase
      .from('bull_room_reactions')
      .select('emoji, user_id')
      .eq('message_id', messageId);

    if (error) {
      console.error('Error fetching reactions:', error);
      throw new Error(`Failed to fetch reactions: ${error.message}`);
    }

    // Group reactions by emoji
    const reactions: Record<string, string[]> = {};
    data?.forEach(reaction => {
      if (!reactions[reaction.emoji]) {
        reactions[reaction.emoji] = [];
      }
      reactions[reaction.emoji].push(reaction.user_id);
    });

    return reactions;
  }

  /**
   * Get message count for a room
   */
  async getMessageCount(roomId: string): Promise<number> {
    const { count, error } = await supabase
      .from('bull_room_messages')
      .select('*', { count: 'exact', head: true })
      .eq('room_id', roomId);

    if (error) {
      console.error('Error getting message count:', error);
      throw new Error(`Failed to get message count: ${error.message}`);
    }

    return count || 0;
  }

  /**
   * Search messages in a room
   */
  async searchMessages(roomId: string, query: string, limit = 20): Promise<BullRoomMessage[]> {
    const { data, error } = await supabase
      .from('bull_room_messages')
      .select(`
        *,
        user:user_profiles(id, username)
      `)
      .eq('room_id', roomId)
      .ilike('content', `%${query}%`)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error searching messages:', error);
      throw new Error(`Failed to search messages: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Clean up old messages (older than 48 hours)
   */
  async cleanupOldMessages(): Promise<void> {
    const cutoffTime = new Date(Date.now() - 48 * 60 * 60 * 1000);
    
    const { error } = await supabase
      .from('bull_room_messages')
      .delete()
      .lt('created_at', cutoffTime.toISOString());

    if (error) {
      console.error('Error cleaning up old messages:', error);
      throw new Error(`Failed to cleanup old messages: ${error.message}`);
    }
  }
} 