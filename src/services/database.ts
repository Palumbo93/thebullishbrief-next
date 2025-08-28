import { supabase } from '../lib/supabase';
import { generateSlug, generateUniqueSlug } from '../lib/utils';

// Types for database entities
export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  featured: boolean;
  sort_order: number;
  article_count: number;
  created_at: string;
  updated_at: string;
}

export interface Author {
  id: string;
  name: string;
  slug: string;
  email: string | null;
  bio: string | null;
  avatar_url: string | null;
  banner_url: string | null;
  featured: boolean | null;
  article_count: number | null;
  total_views: number | null;
  linkedin_url: string | null;
  twitter_handle: string | null;
  website_url: string | null;
  audience_tag: string | null; // Mailchimp audience tag for author-specific signups
  created_at: string | null;
  updated_at: string | null;
}

export interface Tag {
  id: string;
  name: string;
  slug: string;
  article_count: number;
  created_at: string;
  updated_at: string;
}

export interface Article {
  id: string;
  title: string;
  slug: string;
  content: string;
  subtitle?: string;
  author_id?: string;
  category_id?: string;
  featured: boolean;
  premium: boolean;
  status?: string;
  featured_image_url?: string;
  featured_image_alt?: string;
  reading_time_minutes?: number;
  view_count?: number;
  bookmark_count?: number;
  published_at?: string;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: string;
  email: string;
  username: string;
  is_admin?: boolean;
  newsletter_subscribed?: boolean;
  subscription_tier?: string;
  preferences?: any;
  created_at: string;
  updated_at: string;
}

export interface PromptField {
  id: string;
  prompt_id: string;
  label: string;
  placeholder: string;
  field_type: 'text' | 'textarea' | 'select';
  options?: string[];
  sort_order: number;
  created_at: string;
}

export interface PromptCategory {
  id: string;
  name: string;
  description?: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface Prompt {
  id: string;
  title: string;
  description: string;
  content: string;
  category_id: string;
  intended_llm: string;
  original_credit: string;
  created_at: string;
  updated_at: string;
  ai_prompt_categories?: PromptCategory;
  fields?: PromptField[];
}

// Generic error handling
class DatabaseError extends Error {
  constructor(message: string, public originalError?: any) {
    super(message);
    this.name = 'DatabaseError';
  }
}

// Generic CRUD operations
export class DatabaseService<T> {
  constructor(private tableName: string) {}

  async getAll(): Promise<T[]> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      throw new DatabaseError(`Failed to fetch ${this.tableName}`, error);
    }
  }

  async getById(id: string): Promise<T | null> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      throw new DatabaseError(`Failed to fetch ${this.tableName} by id`, error);
    }
  }

  async create(item: Partial<T>): Promise<T> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .insert([item])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      throw new DatabaseError(`Failed to create ${this.tableName}`, error);
    }
  }

  async update(id: string, updates: Partial<T>): Promise<T> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      throw new DatabaseError(`Failed to update ${this.tableName}`, error);
    }
  }

  async delete(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from(this.tableName)
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      throw new DatabaseError(`Failed to delete ${this.tableName}`, error);
    }
  }
}

// Category Service
export class CategoryService extends DatabaseService<Category> {
  constructor() {
    super('categories');
  }

  async getAll(): Promise<Category[]> {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('sort_order', { ascending: true })
        .order('name', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      throw new DatabaseError('Failed to fetch categories', error);
    }
  }

  async create(categoryData: Partial<Category>): Promise<Category> {
    try {
      // Convert string featured value to boolean
      const featured = typeof categoryData.featured === 'string' 
        ? categoryData.featured === 'true' 
        : Boolean(categoryData.featured);

      const { data, error } = await supabase
        .from('categories')
        .insert([{
          ...categoryData,
          featured,
          sort_order: categoryData.sort_order || 0,
          article_count: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      throw new DatabaseError('Failed to create category', error);
    }
  }

  async update(id: string, categoryData: Partial<Category>): Promise<Category> {
    try {
      // Convert string featured value to boolean if present
      const updateData = { ...categoryData };
      if (typeof categoryData.featured === 'string') {
        updateData.featured = categoryData.featured === 'true';
      }

      const { data, error } = await supabase
        .from('categories')
        .update({
          ...updateData,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      throw new DatabaseError('Failed to update category', error);
    }
  }
}

// Author Service
export class AuthorService extends DatabaseService<Author> {
  constructor() {
    super('authors');
  }

  async getAll(): Promise<Author[]> {
    try {
      const { data, error } = await supabase
        .from('authors')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      throw new DatabaseError('Failed to fetch authors', error);
    }
  }

  async create(authorData: Partial<Author>): Promise<Author> {
    try {
      // Convert string featured value to boolean
      const featured = typeof authorData.featured === 'string' 
        ? authorData.featured === 'true' 
        : Boolean(authorData.featured);

      const { data, error } = await supabase
        .from('authors')
        .insert([{
          ...authorData,
          featured,
          article_count: 0,
          total_views: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      throw new DatabaseError('Failed to create author', error);
    }
  }

  async update(id: string, authorData: Partial<Author>): Promise<Author> {
    try {
      // Convert string featured value to boolean if present
      const updateData = { ...authorData };
      if (typeof authorData.featured === 'string') {
        updateData.featured = authorData.featured === 'true';
      }

      const { data, error } = await supabase
        .from('authors')
        .update({
          ...updateData,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      throw new DatabaseError('Failed to update author', error);
    }
  }
}

// Tag Service
export class TagService extends DatabaseService<Tag> {
  constructor() {
    super('tags');
  }

  async getAll(): Promise<Tag[]> {
    try {
      const { data, error } = await supabase
        .from('tags')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      throw new DatabaseError('Failed to fetch tags', error);
    }
  }

  async create(tagData: Partial<Tag>): Promise<Tag> {
    try {
      const { data, error } = await supabase
        .from('tags')
        .insert([{
          ...tagData,
          article_count: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      throw new DatabaseError('Failed to create tag', error);
    }
  }

  async update(id: string, tagData: Partial<Tag>): Promise<Tag> {
    try {
      const { data, error } = await supabase
        .from('tags')
        .update({
          ...tagData,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      throw new DatabaseError('Failed to update tag', error);
    }
  }
}

// Article Service
export class ArticleService extends DatabaseService<Article> {
  constructor() {
    super('articles');
  }

  async getAll(): Promise<Article[]> {
    try {
      const { data, error } = await supabase
        .from('articles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      throw new DatabaseError('Failed to fetch articles', error);
    }
  }

  async create(articleData: Partial<Article>): Promise<Article> {
    try {
      // Convert string featured and premium values to boolean
      const featured = typeof articleData.featured === 'string' 
        ? articleData.featured === 'true' 
        : Boolean(articleData.featured);
      const premium = typeof articleData.premium === 'string' 
        ? articleData.premium === 'true' 
        : Boolean(articleData.premium);

      const { data, error } = await supabase
        .from('articles')
        .insert([{
          ...articleData,
          featured,
          premium,
          view_count: 0,
          bookmark_count: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      throw new DatabaseError('Failed to create article', error);
    }
  }

  async update(id: string, articleData: Partial<Article>): Promise<Article> {
    try {
      // Convert string featured and premium values to boolean if present
      const updateData = { ...articleData };
      if (typeof articleData.featured === 'string') {
        updateData.featured = articleData.featured === 'true';
      }
      if (typeof articleData.premium === 'string') {
        updateData.premium = articleData.premium === 'true';
      }

      const { data, error } = await supabase
        .from('articles')
        .update({
          ...updateData,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      throw new DatabaseError('Failed to update article', error);
    }
  }
}

// User Service
export class UserService extends DatabaseService<User> {
  constructor() {
    super('user_profiles');
  }

  async getAll(): Promise<User[]> {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      throw new DatabaseError('Failed to fetch users', error);
    }
  }
}

// Article-Tag Relationship Service
export interface ArticleTag {
  id: string;
  article_id: string;
  tag_id: string;
  created_at: string;
}

export class ArticleTagService {
  async getTagsForArticle(articleId: string): Promise<Tag[]> {
    try {
      const { data, error } = await supabase
        .from('article_tags')
        .select(`
          tag_id,
          tags (
            id,
            name,
            slug,
            article_count,
            created_at,
            updated_at
          )
        `)
        .eq('article_id', articleId);

      if (error) throw error;
      return data?.map((item: any) => item.tags).filter(Boolean) || [];
    } catch (error) {
      throw new DatabaseError('Failed to fetch article tags', error);
    }
  }

  async setTagsForArticle(articleId: string, tagIds: string[]): Promise<void> {
    try {
      // First, delete existing tags for this article
      const { error: deleteError } = await supabase
        .from('article_tags')
        .delete()
        .eq('article_id', articleId);

      if (deleteError) throw deleteError;

      // Then insert new tags
      if (tagIds.length > 0) {
        const articleTags = tagIds.map(tagId => ({
          article_id: articleId,
          tag_id: tagId,
          created_at: new Date().toISOString()
        }));

        const { error: insertError } = await supabase
          .from('article_tags')
          .insert(articleTags);

        if (insertError) throw insertError;
      }
    } catch (error) {
      throw new DatabaseError('Failed to set article tags', error);
    }
  }

  async getAllTags(): Promise<Tag[]> {
    try {
      const { data, error } = await supabase
        .from('tags')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      throw new DatabaseError('Failed to fetch tags', error);
    }
  }
}

// Prompt Category Service
export class PromptCategoryService extends DatabaseService<PromptCategory> {
  constructor() {
    super('ai_prompt_categories');
  }

  async getAll(): Promise<PromptCategory[]> {
    try {
      const { data, error } = await supabase
        .from('ai_prompt_categories')
        .select('*')
        .order('sort_order', { ascending: true })
        .order('name', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      throw new DatabaseError('Failed to fetch prompt categories', error);
    }
  }

  async create(categoryData: Partial<PromptCategory>): Promise<PromptCategory> {
    try {
      const { data, error } = await supabase
        .from('ai_prompt_categories')
        .insert([{
          ...categoryData,
          sort_order: categoryData.sort_order || 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      throw new DatabaseError('Failed to create prompt category', error);
    }
  }

  async update(id: string, categoryData: Partial<PromptCategory>): Promise<PromptCategory> {
    try {
      const { data, error } = await supabase
        .from('ai_prompt_categories')
        .update({
          ...categoryData,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      throw new DatabaseError('Failed to update prompt category', error);
    }
  }
}

// Prompt Service
export class PromptService extends DatabaseService<Prompt> {
  constructor() {
    super('ai_prompts');
  }

  async getAll(): Promise<Prompt[]> {
    try {
      const { data, error } = await supabase
        .from('ai_prompts')
        .select(`
          *,
          ai_prompt_categories!ai_prompts_category_id_fkey (
            id,
            name,
            description,
            sort_order
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      throw new DatabaseError('Failed to fetch prompts', error);
    }
  }

  async getByCategory(categoryId: string): Promise<Prompt[]> {
    try {
      const { data, error } = await supabase
        .from('ai_prompts')
        .select(`
          *,
          ai_prompt_categories!ai_prompts_category_id_fkey (
            id,
            name,
            description,
            sort_order
          )
        `)
        .eq('category_id', categoryId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      throw new DatabaseError('Failed to fetch prompts by category', error);
    }
  }

  async search(query: string): Promise<Prompt[]> {
    try {
      const { data, error } = await supabase
        .from('ai_prompts')
        .select(`
          *,
          ai_prompt_categories!ai_prompts_category_id_fkey (
            id,
            name,
            description,
            sort_order
          )
        `)
        .or(`title.ilike.%${query}%,description.ilike.%${query}%,content.ilike.%${query}%`)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      throw new DatabaseError('Failed to search prompts', error);
    }
  }

  async create(promptData: Partial<Prompt>): Promise<Prompt> {
    try {
      const { data, error } = await supabase
        .from('ai_prompts')
        .insert([{
          ...promptData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      throw new DatabaseError('Failed to create prompt', error);
    }
  }

  async update(id: string, promptData: Partial<Prompt>): Promise<Prompt> {
    try {
      const { data, error } = await supabase
        .from('ai_prompts')
        .update({
          ...promptData,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      throw new DatabaseError('Failed to update prompt', error);
    }
  }
}

// Prompt Fields Service
export class PromptFieldService {
  async getFieldsForPrompt(promptId: string): Promise<PromptField[]> {
    try {
      const { data, error } = await supabase
        .from('prompt_fields')
        .select('*')
        .eq('prompt_id', promptId)
        .order('sort_order', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      throw new DatabaseError('Failed to fetch prompt fields', error);
    }
  }

  async setFieldsForPrompt(promptId: string, fields: Partial<PromptField>[]): Promise<void> {
    try {
      // First, delete existing fields for this prompt
      const { error: deleteError } = await supabase
        .from('prompt_fields')
        .delete()
        .eq('prompt_id', promptId);

      if (deleteError) throw deleteError;

      // Then insert new fields
      if (fields.length > 0) {
        const promptFields = fields.map((field, index) => {
          // Remove id if it's a temporary one (starts with 'field-')
          const { id, ...fieldWithoutId } = field;
          const isNewField = id && id.startsWith('field-');
          
          return {
            ...fieldWithoutId,
            prompt_id: promptId,
            sort_order: field.sort_order || index,
            created_at: new Date().toISOString()
          };
        });

        const { error: insertError } = await supabase
          .from('prompt_fields')
          .insert(promptFields);

        if (insertError) throw insertError;
      }
    } catch (error) {
      throw new DatabaseError('Failed to set prompt fields', error);
    }
  }
}

// Export service instances
export const categoryService = new CategoryService();
export const authorService = new AuthorService();
export const tagService = new TagService();
export const articleService = new ArticleService();
export const userService = new UserService();
export const articleTagService = new ArticleTagService();
export const promptCategoryService = new PromptCategoryService();
export const promptService = new PromptService();
export const promptFieldService = new PromptFieldService(); 