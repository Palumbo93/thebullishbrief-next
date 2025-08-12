import { Tables } from './database.types';

// Type aliases for commonly used table types
export type BullRoom = Tables<'bull_rooms'>
export type Article = Tables<'articles'>
export type Author = Tables<'authors'>
export type Brief = Tables<'briefs'>
export type Category = Tables<'categories'>
export type Tag = Tables<'tags'>
export type UserProfile = Tables<'user_profiles'>
export type ArticleComment = Tables<'article_comments'>
export type ArticleView = Tables<'article_views'>
export type BriefView = Tables<'brief_views'>
export type Bookmark = Tables<'bookmarks'>
export type BullRoomMessage = Tables<'bull_room_messages'>
export type BullRoomReaction = Tables<'bull_room_reactions'>
export type CommentReaction = Tables<'comment_reactions'>
export type ArticleTag = Tables<'article_tags'>
export type AIPrompt = Tables<'ai_prompts'>
export type AIPromptCategory = Tables<'ai_prompt_categories'>
export type PromptField = Tables<'prompt_fields'>
export type Role = Tables<'roles'>
export type UserRole = Tables<'user_roles'>
export type ProfileOperationLog = Tables<'profile_operation_logs'>
export type BullRoomsStats = Tables<'bull_rooms_stats'>
