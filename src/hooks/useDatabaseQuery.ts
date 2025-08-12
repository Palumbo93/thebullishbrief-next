"use client";

import { useQuery,  useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  categoryService, 
  authorService, 
  tagService, 
  articleService, 
  userService,
  articleTagService,
  promptService,
  promptCategoryService,
  promptFieldService,
  Category,
  Author,
  Tag,
  Article,
  User,
  Prompt,
} from '../services/database';
import { queryKeys } from '../lib/queryClient';

/**
 * Generic hook for database operations using React Query
 * This provides optimistic updates, caching, and background refetching
 */
export function useDatabaseQuery<T>(
  service: {
    getAll: () => Promise<T[]>;
    getById: (id: string) => Promise<T | null>;
    create: (item: Partial<T>) => Promise<T>;
    update: (id: string, updates: Partial<T>) => Promise<T>;
    delete: (id: string) => Promise<void>;
  },
  queryKey: readonly unknown[]
) {
  const queryClient = useQueryClient();

  // Query for all items
  const query = useQuery({
    queryKey,
    queryFn: () => service.getAll(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (item: Partial<T>) => service.create(item),
    onSuccess: (newItem) => {
      queryClient.setQueryData(queryKey, (old: T[] = []) => [newItem, ...old]);
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<T> }) => 
      service.update(id, updates),
    onSuccess: (updatedItem) => {
      queryClient.setQueryData(queryKey, (old: T[] = []) => 
        old.map(item => 
          (item as any).id === (updatedItem as any).id ? updatedItem : item
        )
      );
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => service.delete(id),
    onSuccess: (_, deletedId) => {
      queryClient.setQueryData(queryKey, (old: T[] = []) => 
        old.filter(item => (item as any).id !== deletedId)
      );
    },
  });

  // Get by ID function
  const getById = async (id: string) => {
    return service.getById(id);
  };

  return {
    data: query.data || [],
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
    create: createMutation.mutateAsync,
    update: (id: string, updates: Partial<T>) => updateMutation.mutateAsync({ id, updates }),
    delete: deleteMutation.mutateAsync,
    getById,
    // Mutation states
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}

// Category hooks with React Query
export function useCategoriesQuery() {
  return useDatabaseQuery(categoryService, queryKeys.categories.list());
}

export function useCategoryActions() {
  const queryClient = useQueryClient();
  
  return {
    create: useMutation({
      mutationFn: (category: Partial<Category>) => categoryService.create(category),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: queryKeys.categories.all });
      },
    }),
    update: useMutation({
      mutationFn: ({ id, updates }: { id: string; updates: Partial<Category> }) => 
        categoryService.update(id, updates),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: queryKeys.categories.all });
      },
    }),
    delete: useMutation({
      mutationFn: (id: string) => categoryService.delete(id),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: queryKeys.categories.all });
      },
    }),
    getById: categoryService.getById.bind(categoryService)
  };
}

// Author hooks with React Query
export function useAuthorsQuery() {
  return useDatabaseQuery(authorService, ['authors', 'list']);
}

export function useAuthorActions() {
  const queryClient = useQueryClient();
  
  return {
    create: useMutation({
      mutationFn: (author: Partial<Author>) => authorService.create(author),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['authors'] });
      },
    }),
    update: useMutation({
      mutationFn: ({ id, updates }: { id: string; updates: Partial<Author> }) => 
        authorService.update(id, updates),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['authors'] });
      },
    }),
    delete: useMutation({
      mutationFn: (id: string) => authorService.delete(id),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['authors'] });
      },
    }),
    getById: authorService.getById.bind(authorService)
  };
}

// Tag hooks with React Query
export function useTagsQuery() {
  return useDatabaseQuery(tagService, queryKeys.tags.list());
}

export function useTagActions() {
  const queryClient = useQueryClient();
  
  return {
    create: useMutation({
      mutationFn: (tag: Partial<Tag>) => tagService.create(tag),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: queryKeys.tags.all });
      },
    }),
    update: useMutation({
      mutationFn: ({ id, updates }: { id: string; updates: Partial<Tag> }) => 
        tagService.update(id, updates),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: queryKeys.tags.all });
      },
    }),
    delete: useMutation({
      mutationFn: (id: string) => tagService.delete(id),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: queryKeys.tags.all });
      },
    }),
    getById: tagService.getById.bind(tagService)
  };
}

// Article hooks with React Query  
export function useArticlesQuery() {
  return useDatabaseQuery(articleService, queryKeys.articles.lists());
}

export function useArticleActions() {
  const queryClient = useQueryClient();
  
  return {
    create: useMutation({
      mutationFn: (article: Partial<Article>) => articleService.create(article),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: queryKeys.articles.all });
      },
    }),
    update: useMutation({
      mutationFn: ({ id, updates }: { id: string; updates: Partial<Article> }) => 
        articleService.update(id, updates),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: queryKeys.articles.all });
      },
    }),
    delete: useMutation({
      mutationFn: (id: string) => articleService.delete(id),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: queryKeys.articles.all });
      },
    }),
    getById: articleService.getById.bind(articleService)
  };
}

// User hooks with React Query
export function useUsersQuery() {
  return useDatabaseQuery(userService, ['users', 'list']);
}

export function useUserActions() {
  const queryClient = useQueryClient();
  
  return {
    create: useMutation({
      mutationFn: (user: Partial<User>) => userService.create(user),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['users'] });
      },
    }),
    update: useMutation({
      mutationFn: ({ id, updates }: { id: string; updates: Partial<User> }) => 
        userService.update(id, updates),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['users'] });
      },
    }),
    delete: useMutation({
      mutationFn: (id: string) => userService.delete(id),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['users'] });
      },
    }),
    getById: userService.getById.bind(userService)
  };
}

// Prompt hooks with React Query
export function usePromptsQuery() {
  return useDatabaseQuery(promptService, ['prompts', 'list']);
}

export function usePromptActions() {
  const queryClient = useQueryClient();
  
  return {
    create: useMutation({
      mutationFn: (prompt: Partial<Prompt>) => promptService.create(prompt),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['prompts'] });
      },
    }),
    update: useMutation({
      mutationFn: ({ id, updates }: { id: string; updates: Partial<Prompt> }) => 
        promptService.update(id, updates),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['prompts'] });
      },
    }),
    delete: useMutation({
      mutationFn: (id: string) => promptService.delete(id),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['prompts'] });
      },
    }),
    getById: promptService.getById.bind(promptService)
  };
}

/**
 * Backward compatibility exports
 * These maintain the same interface as the old useDatabase hooks
 */
export const useCategories = useCategoriesQuery;
export const useAuthors = useAuthorsQuery;
export const useTags = useTagsQuery;
export const useArticles = useArticlesQuery;
export const useUsers = useUsersQuery;
export const usePrompts = usePromptsQuery;
