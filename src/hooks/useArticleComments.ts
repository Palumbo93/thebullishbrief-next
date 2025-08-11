import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { Comment, CreateCommentData, UpdateCommentData } from '../types/comment.types';

/**
 * Hook for fetching comments for a specific article
 */
export const useArticleComments = (articleId: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: ['article-comments', articleId],
    queryFn: async (): Promise<Comment[]> => {
      // First, get all comments for this article
      const { data: allComments, error } = await supabase
        .from('article_comments')
        .select(`
          *,
          reactions:comment_reactions(*)
        `)
        .eq('article_id', articleId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching comments:', error);
        throw new Error(`Failed to fetch comments: ${error.message}`);
      }

      // Process all comments to add reaction counts and user reactions
      const processedAllComments = (allComments || []).map(comment => {
        const reactions = comment.reactions || [];
        const reactionCounts: Record<string, number> = {};
        const userReactions: string[] = [];

        reactions.forEach((reaction: any) => {
          reactionCounts[reaction.reaction_type] = (reactionCounts[reaction.reaction_type] || 0) + 1;
          // Add to user reactions if it's the current user
          // Note: This async check might not work properly, we'll handle user reactions separately
        });

        return {
          ...comment,
          user: {
            id: comment.user_id,
            username: comment.username || 'Anonymous'
          },
          reaction_counts: reactionCounts,
          user_reactions: userReactions,
          replies: []
        };
      });

      // Build the comment tree structure
      const commentMap = new Map<string, Comment>();
      const topLevelComments: Comment[] = [];

      // First pass: create a map of all comments
      processedAllComments.forEach(comment => {
        commentMap.set(comment.id, comment);
      });

      // Second pass: build the tree structure
      processedAllComments.forEach(comment => {
        if (comment.parent_id) {
          // This is a reply
          const parentComment = commentMap.get(comment.parent_id);
          if (parentComment) {
            if (!parentComment.replies) {
              parentComment.replies = [];
            }
            parentComment.replies.push(comment);
          }
        } else {
          // This is a top-level comment
          topLevelComments.push(comment);
        }
      });

      return topLevelComments;
    },
    enabled: !!articleId && enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

/**
 * Hook for fetching replies to a specific comment
 */
export const useCommentReplies = (commentId: string) => {
  return useQuery({
    queryKey: ['comment-replies', commentId],
    queryFn: async (): Promise<Comment[]> => {
      const { data, error } = await supabase
        .from('article_comments')
        .select(`
          *,
          user:user_profiles(username),
          reactions:comment_reactions(*)
        `)
        .eq('parent_id', commentId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching replies:', error);
        throw new Error(`Failed to fetch replies: ${error.message}`);
      }

      return data || [];
    },
    enabled: !!commentId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

/**
 * Hook for creating a new comment
 */
export const useCreateComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateCommentData): Promise<Comment> => {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Get user's username
      const { data: userProfile, error: userError } = await supabase
        .from('user_profiles')
        .select('username')
        .eq('id', user.id)
        .single();

      if (userError) {
        console.error('Error fetching user profile:', userError);
        throw new Error('Failed to get user profile');
      }

      const { data: comment, error } = await supabase
        .from('article_comments')
        .insert({
          article_id: data.article_id,
          content: data.content,
          parent_id: data.parent_id,
          user_id: user.id,
          username: userProfile.username,
        })
        .select('*')
        .single();

      if (error) {
        console.error('Error creating comment:', error);
        throw new Error(`Failed to create comment: ${error.message}`);
      }

      return comment;
    },
    onMutate: async (data) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['article-comments', data.article_id] });
      
      // Snapshot the previous value
      const previousComments = queryClient.getQueryData(['article-comments', data.article_id]);
      
      return { previousComments };
    },
    onError: (err, data, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousComments !== undefined) {
        queryClient.setQueryData(['article-comments', data.article_id], context.previousComments);
      }
    },
    onSuccess: (newComment) => {
      // Invalidate and refetch comments for this article
      queryClient.invalidateQueries({
        queryKey: ['article-comments', newComment.article_id]
      });
      
      // If it's a reply, also invalidate the parent comment's replies
      if (newComment.parent_id) {
        queryClient.invalidateQueries({
          queryKey: ['comment-replies', newComment.parent_id]
        });
      }

      // Optimistically update article comment counts
      queryClient.setQueryData(['articles'], (oldData: any) => {
        if (!oldData) return oldData;
        
        // Update comment counts in all article lists
        const updateArticleCommentCount = (articles: any[]) => {
          return articles.map(article => {
            if (String(article.id) === String(newComment.article_id)) {
              return {
                ...article,
                comment_count: (article.comment_count || 0) + 1
              };
            }
            return article;
          });
        };

        return {
          ...oldData,
          articles: updateArticleCommentCount(oldData.articles || []),
          featuredArticles: updateArticleCommentCount(oldData.featuredArticles || [])
        };
      });

      // Also update individual article queries
      queryClient.setQueryData(['article-by-slug', newComment.article_id], (oldData: any) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          comment_count: (oldData.comment_count || 0) + 1
        };
      });
    },
  });
};

/**
 * Hook for updating a comment
 */
export const useUpdateComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdateCommentData): Promise<Comment> => {
      const { data: comment, error } = await supabase
        .from('article_comments')
        .update({
          content: data.content,
          is_edited: true,
          edited_at: new Date().toISOString(),
        })
        .eq('id', data.id)
        .select('*')
        .single();

      if (error) {
        console.error('Error updating comment:', error);
        throw new Error(`Failed to update comment: ${error.message}`);
      }

      return comment;
    },
    onSuccess: (updatedComment) => {
      // Invalidate and refetch comments for this article
      queryClient.invalidateQueries({
        queryKey: ['article-comments', updatedComment.article_id]
      });
      
      // If it's a reply, also invalidate the parent comment's replies
      if (updatedComment.parent_id) {
        queryClient.invalidateQueries({
          queryKey: ['comment-replies', updatedComment.parent_id]
        });
      }
    },
  });
};

/**
 * Hook for deleting a comment
 */
export const useDeleteComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (commentId: string): Promise<{ article_id: string }> => {
      // First get the comment to know which article it belongs to
      const { data: comment, error: fetchError } = await supabase
        .from('article_comments')
        .select('article_id')
        .eq('id', commentId)
        .single();

      if (fetchError) {
        console.error('Error fetching comment for deletion:', fetchError);
        throw new Error(`Failed to fetch comment: ${fetchError.message}`);
      }

      const { error } = await supabase
        .from('article_comments')
        .delete()
        .eq('id', commentId);

      if (error) {
        console.error('Error deleting comment:', error);
        throw new Error(`Failed to delete comment: ${error.message}`);
      }

      return { article_id: comment.article_id };
    },
    onSuccess: (data) => {
      // Invalidate all comment queries to refetch
      queryClient.invalidateQueries({
        queryKey: ['article-comments']
      });
      queryClient.invalidateQueries({
        queryKey: ['comment-replies']
      });

      // Optimistically update article comment counts
      queryClient.setQueryData(['articles'], (oldData: any) => {
        if (!oldData) return oldData;
        
        // Update comment counts in all article lists
        const updateArticleCommentCount = (articles: any[]) => {
          return articles.map(article => {
            if (String(article.id) === String(data.article_id)) {
              return {
                ...article,
                comment_count: Math.max((article.comment_count || 0) - 1, 0)
              };
            }
            return article;
          });
        };

        return {
          ...oldData,
          articles: updateArticleCommentCount(oldData.articles || []),
          featuredArticles: updateArticleCommentCount(oldData.featuredArticles || [])
        };
      });

      // Also update individual article queries
      queryClient.setQueryData(['article-by-slug', data.article_id], (oldData: any) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          comment_count: Math.max((oldData.comment_count || 0) - 1, 0)
        };
      });
    },
  });
};

/**
 * Hook for adding a reaction to a comment
 */
export const useAddReaction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ commentId, reactionType }: { commentId: string; reactionType: string }): Promise<void> => {
      const { error } = await supabase
        .from('comment_reactions')
        .insert({
          comment_id: commentId,
          reaction_type: reactionType,
          user_id: (await supabase.auth.getUser()).data.user?.id,
        });

      if (error) {
        console.error('Error adding reaction:', error);
        throw new Error(`Failed to add reaction: ${error.message}`);
      }
    },
    onSuccess: () => {
      // Invalidate all comment queries to refetch
      queryClient.invalidateQueries({
        queryKey: ['article-comments']
      });
      queryClient.invalidateQueries({
        queryKey: ['comment-replies']
      });
    },
  });
};

/**
 * Hook for removing a reaction from a comment
 */
export const useRemoveReaction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ commentId, reactionType }: { commentId: string; reactionType: string }): Promise<void> => {
      const { error } = await supabase
        .from('comment_reactions')
        .delete()
        .eq('comment_id', commentId)
        .eq('reaction_type', reactionType)
        .eq('user_id', (await supabase.auth.getUser()).data.user?.id);

      if (error) {
        console.error('Error removing reaction:', error);
        throw new Error(`Failed to remove reaction: ${error.message}`);
      }
    },
    onSuccess: () => {
      // Invalidate all comment queries to refetch
      queryClient.invalidateQueries({
        queryKey: ['article-comments']
      });
      queryClient.invalidateQueries({
        queryKey: ['comment-replies']
      });
    },
  });
}; 