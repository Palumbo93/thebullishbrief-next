import { useState, useEffect, useCallback, useRef } from 'react';
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
  PromptCategory,
  PromptField
} from '../services/database';

// Generic hook for database operations
export function useDatabaseService<T>(
  service: {
    getAll: () => Promise<T[]>;
    getById: (id: string) => Promise<T | null>;
    create: (item: Partial<T>) => Promise<T>;
    update: (id: string, updates: Partial<T>) => Promise<T>;
    delete: (id: string) => Promise<void>;
  }
) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const hasInitializedRef = useRef(false);
  
  // Add a static flag to track initialization across re-renders
  const staticInitializedKey = `useDatabase_${service.constructor.name}_initialized`;
  const staticInitialized = (globalThis as any)[staticInitializedKey];

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await service.getAll();
      setData(result);
    } catch (err) {
      console.error(`[${service.constructor.name}] Database fetch error:`, err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, []); // Remove service dependency since it's a singleton

  const createItem = useCallback(async (item: Partial<T>) => {
    try {
      setError(null);
      const newItem = await service.create(item);
      setData(prev => [newItem, ...prev]);
      return newItem;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create item');
      console.error('Database create error:', err);
      throw err;
    }
  }, []); // Remove service dependency since it's a singleton

  const updateItem = useCallback(async (id: string, updates: Partial<T>) => {
    try {
      setError(null);
      const updatedItem = await service.update(id, updates);
      setData(prev => prev.map(item => 
        (item as any).id === id ? updatedItem : item
      ));
      return updatedItem;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update item');
      console.error('Database update error:', err);
      throw err;
    }
  }, []); // Remove service dependency since it's a singleton

  const deleteItem = useCallback(async (id: string) => {
    try {
      setError(null);
      await service.delete(id);
      setData(prev => prev.filter(item => (item as any).id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete item');
      console.error('Database delete error:', err);
      throw err;
    }
  }, []); // Remove service dependency since it's a singleton

  const getById = useCallback(async (id: string) => {
    try {
      setError(null);
      return await service.getById(id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch item');
      console.error('Database getById error:', err);
      throw err;
    }
  }, []); // Remove service dependency since it's a singleton

  useEffect(() => {
    // Always fetch data when component mounts
    fetchData();
    hasInitializedRef.current = true;
  }, []); // Empty dependency array - only run once

  return {
    data,
    loading,
    error,
    refetch: fetchData,
    create: createItem,
    update: updateItem,
    delete: deleteItem,
    getById
  };
}

// Category hooks
export function useCategories() {
  return useDatabaseService(categoryService);
}

export function useCategoryActions() {
  return {
    create: categoryService.create.bind(categoryService),
    update: categoryService.update.bind(categoryService),
    delete: categoryService.delete.bind(categoryService),
    getById: categoryService.getById.bind(categoryService)
  };
}

// Author hooks
export function useAuthors() {
  return useDatabaseService(authorService);
}

export function useAuthorActions() {
  return {
    create: authorService.create.bind(authorService),
    update: authorService.update.bind(authorService),
    delete: authorService.delete.bind(authorService),
    getById: authorService.getById.bind(authorService)
  };
}

// Tag hooks
export function useTags() {
  return useDatabaseService(tagService);
}

export function useTagActions() {
  return {
    create: tagService.create.bind(tagService),
    update: tagService.update.bind(tagService),
    delete: tagService.delete.bind(tagService),
    getById: tagService.getById.bind(tagService)
  };
}

// Article hooks
export function useArticles() {
  return useDatabaseService(articleService);
}

export function useArticleActions() {
  return {
    create: articleService.create.bind(articleService),
    update: articleService.update.bind(articleService),
    delete: articleService.delete.bind(articleService),
    getById: articleService.getById.bind(articleService)
  };
}

// User hooks
export function useUsers() {
  return useDatabaseService(userService);
}

export function useUserActions() {
  return {
    create: userService.create.bind(userService),
    update: userService.update.bind(userService),
    delete: userService.delete.bind(userService),
    getById: userService.getById.bind(userService)
  };
}

// Article-Tag hooks
export function useArticleTags(articleId?: string) {
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTags = useCallback(async () => {
    if (!articleId) return;
    try {
      setLoading(true);
      setError(null);
      const result = await articleTagService.getTagsForArticle(articleId);
      setTags(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch article tags');
      console.error('Article tags fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [articleId]);

  const setTagsForArticle = useCallback(async (tagIds: string[]) => {
    if (!articleId) return;
    try {
      setError(null);
      await articleTagService.setTagsForArticle(articleId, tagIds);
      // Refresh tags after setting
      await fetchTags();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to set article tags');
      console.error('Article tags set error:', err);
      throw err;
    }
  }, [articleId, fetchTags]);

  useEffect(() => {
    fetchTags();
  }, [fetchTags]);

  return {
    tags,
    loading,
    error,
    setTags: setTagsForArticle,
    refetch: fetchTags
  };
}

export function useAllTags() {
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTags = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await articleTagService.getAllTags();
      setTags(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch tags');
      console.error('Tags fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTags();
  }, [fetchTags]);

  const createTag = useCallback(async (tagData: Partial<Tag>) => {
    try {
      const newTag = await tagService.create(tagData);
      // Refresh the tags list after creating
      await fetchTags();
      return newTag;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create tag');
      console.error('Tag create error:', err);
      throw err;
    }
  }, [fetchTags]);

  return {
    tags,
    loading,
    error,
    refetch: fetchTags,
    create: createTag
  };
}

// Prompt hooks
export function usePrompts() {
  return useDatabaseService(promptService);
}

export function usePromptActions() {
  return useDatabaseService(promptService);
}

export function usePromptCategories() {
  return useDatabaseService(promptCategoryService);
}

export function usePromptCategoryActions() {
  return useDatabaseService(promptCategoryService);
}

export function usePromptFields(promptId?: string) {
  const [fields, setFields] = useState<PromptField[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchFields = useCallback(async () => {
    if (!promptId) return;
    try {
      setLoading(true);
      setError(null);
      const result = await promptFieldService.getFieldsForPrompt(promptId);
      setFields(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch prompt fields');
      console.error('Prompt fields fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [promptId]);

  const setFieldsForPrompt = useCallback(async (fieldsData: Partial<PromptField>[]) => {
    if (!promptId) return;
    try {
      setError(null);
      await promptFieldService.setFieldsForPrompt(promptId, fieldsData);
      // Refresh fields after setting
      await fetchFields();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to set prompt fields');
      console.error('Prompt fields set error:', err);
      throw err;
    }
  }, [promptId, fetchFields]);

  useEffect(() => {
    fetchFields();
  }, [fetchFields]);

  return {
    fields,
    loading,
    error,
    setFields: setFieldsForPrompt,
    refetch: fetchFields
  };
} 