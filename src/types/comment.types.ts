export interface Comment {
  id: string;
  article_id: string;
  user_id: string;
  username: string;
  parent_id?: string;
  content: string;
  is_edited: boolean;
  edited_at?: string;
  created_at: string;
  updated_at: string;
  // Joined fields
  user?: {
    username: string;
    avatar_url?: string;
  };
  reactions?: CommentReaction[];
  replies?: Comment[];
  reaction_counts?: Record<string, number>;
  user_reactions?: string[];
}

export interface CommentReaction {
  id: string;
  comment_id: string;
  user_id: string;
  reaction_type: 'like' | 'dislike';
  created_at: string;
}

export interface CreateCommentData {
  article_id: string;
  content: string;
  parent_id?: string;
}

export interface UpdateCommentData {
  id: string;
  content: string;
}

export interface CommentFormData {
  content: string;
  parent_id?: string;
}

export interface CommentsState {
  comments: Comment[];
  isLoading: boolean;
  hasMore: boolean;
  replyingTo: string | null;
  editingComment: string | null;
  expandedThreads: Set<string>;
} 