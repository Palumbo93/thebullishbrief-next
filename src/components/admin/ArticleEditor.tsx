"use client";

import React, { useState, useEffect } from 'react';
import { Save, X, Upload, Eye, Calendar, Globe, Lock, Star, Tag, Folder, User } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface Category {
  id: string;
  name: string;
}

interface Author {
  id: string;
  name: string;
}

interface TagOption {
  id: string;
  name: string;
}

interface Article {
  id: string;
  title: string;
  slug: string;
  subtitle: string | null;
  content: string;
  featured_image_url: string | null;
  category_id: string | null;
  author_id: string | null;
  status: 'draft' | 'published' | 'archived';
  featured: boolean;
  premium: boolean;
  seo_title: string | null;
  seo_description: string | null;
}

interface ArticleEditorProps {
  article: Article | null;
  onSave: () => void;
  onCancel: () => void;
}

export const ArticleEditor: React.FC<ArticleEditorProps> = ({ article, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    subtitle: '',
    content: '',
    featured_image_url: '',
    category_id: '',
    author_id: '',
    status: 'draft' as 'draft' | 'published' | 'archived',
    featured: false,
    premium: false,
    seo_title: '',
    seo_description: ''
  });

  const [categories, setCategories] = useState<Category[]>([]);
  const [authors, setAuthors] = useState<Author[]>([]);
  const [tags, setTags] = useState<TagOption[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchOptions();
    if (article) {
      setFormData({
        title: article.title,
        slug: article.slug,
        subtitle: article.subtitle || '',
        content: article.content,
        featured_image_url: article.featured_image_url || '',
        category_id: article.category_id || '',
        author_id: article.author_id || '',
        status: article.status,
        featured: article.featured,
        premium: article.premium,
        seo_title: article.seo_title || '',
        seo_description: article.seo_description || ''
      });
      fetchArticleTags(article.id);
    }
  }, [article]);

  const fetchOptions = async () => {
    try {
      const [categoriesRes, authorsRes, tagsRes] = await Promise.all([
        supabase.from('categories').select('id, name').order('name'),
        supabase.from('authors').select('id, name').order('name'),
        supabase.from('tags').select('id, name').order('name')
      ]);

      setCategories(categoriesRes.data || []);
      setAuthors(authorsRes.data || []);
      setTags(tagsRes.data || []);
    } catch (error) {
      console.error('Error fetching options:', error);
    }
  };

  const fetchArticleTags = async (articleId: string) => {
    try {
      const { data } = await supabase
        .from('article_tags')
        .select('tag_id')
        .eq('article_id', articleId);

      setSelectedTags(data?.map(item => item.tag_id) || []);
    } catch (error) {
      console.error('Error fetching article tags:', error);
    }
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const handleTitleChange = (title: string) => {
    setFormData(prev => ({
      ...prev,
      title,
      slug: prev.slug || generateSlug(title)
    }));
  };

  const handleSave = async () => {
    try {
      setLoading(true);

      const articleData = {
        ...formData,
        published_at: formData.status === 'published' ? new Date().toISOString() : null
      };

      let result;
      if (article) {
        // Update existing article
        result = await supabase
          .from('articles')
          .update(articleData)
          .eq('id', article.id)
          .select()
          .single();
      } else {
        // Create new article
        result = await supabase
          .from('articles')
          .insert(articleData)
          .select()
          .single();
      }

      if (result.error) throw result.error;

      // Update article tags
      const articleId = result.data.id;
      
      // Remove existing tags
      await supabase
        .from('article_tags')
        .delete()
        .eq('article_id', articleId);

      // Add new tags
      if (selectedTags.length > 0) {
        const tagInserts = selectedTags.map(tagId => ({
          article_id: articleId,
          tag_id: tagId
        }));

        await supabase
          .from('article_tags')
          .insert(tagInserts);
      }

      onSave();
    } catch (error) {
      console.error('Error saving article:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Header */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: 'var(--space-6)'
      }}>
        <div>
          <h2 style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--font-bold)', marginBottom: 'var(--space-2)' }}>
            {article ? 'Edit Article' : 'Create New Article'}
          </h2>
          <p style={{ color: 'var(--color-text-tertiary)' }}>
            {article ? 'Update your article content and settings' : 'Create a new article for your publication'}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
          <button onClick={onCancel} className="btn btn-secondary">
            <X style={{ width: '16px', height: '16px' }} />
            <span>Cancel</span>
          </button>
          <button onClick={handleSave} disabled={loading} className="btn btn-primary">
            <Save style={{ width: '16px', height: '16px' }} />
            <span>{loading ? 'Saving...' : 'Save Article'}</span>
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 'var(--space-8)' }}>
        {/* Main Content */}
        <div>
          {/* Basic Info */}
          <div className="card" style={{ marginBottom: 'var(--space-6)' }}>
            <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--font-semibold)', marginBottom: 'var(--space-4)' }}>
              Article Content
            </h3>
            
            <div style={{ marginBottom: 'var(--space-4)' }}>
              <label style={{ display: 'block', fontSize: 'var(--text-sm)', fontWeight: 'var(--font-medium)', marginBottom: 'var(--space-2)' }}>
                Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleTitleChange(e.target.value)}
                className="input"
                placeholder="Enter article title..."
                required
              />
            </div>

            <div style={{ marginBottom: 'var(--space-4)' }}>
              <label style={{ display: 'block', fontSize: 'var(--text-sm)', fontWeight: 'var(--font-medium)', marginBottom: 'var(--space-2)' }}>
                Slug
              </label>
              <input
                type="text"
                value={formData.slug}
                onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                className="input"
                placeholder="article-url-slug"
              />
            </div>

            <div style={{ marginBottom: 'var(--space-4)' }}>
              <label style={{ display: 'block', fontSize: 'var(--text-sm)', fontWeight: 'var(--font-medium)', marginBottom: 'var(--space-2)' }}>
                Subtitle
              </label>
              <input
                type="text"
                value={formData.subtitle}
                onChange={(e) => setFormData(prev => ({ ...prev, subtitle: e.target.value }))}
                className="input"
                placeholder="Brief description or subtitle..."
              />
            </div>

            <div style={{ marginBottom: 'var(--space-4)' }}>
              <label style={{ display: 'block', fontSize: 'var(--text-sm)', fontWeight: 'var(--font-medium)', marginBottom: 'var(--space-2)' }}>
                Content *
              </label>
              <textarea
                value={formData.content}
                onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                rows={20}
                style={{
                  width: '100%',
                  padding: 'var(--space-4)',
                  background: 'var(--color-bg-tertiary)',
                  border: '0.5px solid var(--color-border-primary)',
                  borderRadius: 'var(--radius-lg)',
                  color: 'var(--color-text-primary)',
                  fontSize: 'var(--text-sm)',
                  fontFamily: 'var(--font-mono)',
                  resize: 'vertical',
                  minHeight: '400px'
                }}
                placeholder="Write your article content here... (Markdown supported)"
                required
              />
            </div>


          </div>
        </div>

        {/* Sidebar */}
        <div>
          {/* Publishing Options */}
          <div className="card" style={{ marginBottom: 'var(--space-6)' }}>
            <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--font-semibold)', marginBottom: 'var(--space-4)' }}>
              Publishing
            </h3>
            
            <div style={{ marginBottom: 'var(--space-4)' }}>
              <label style={{ display: 'block', fontSize: 'var(--text-sm)', fontWeight: 'var(--font-medium)', marginBottom: 'var(--space-2)' }}>
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as any }))}
                className="input"
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="archived">Archived</option>
              </select>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={formData.featured}
                  onChange={(e) => setFormData(prev => ({ ...prev, featured: e.target.checked }))}
                />
                <Star style={{ width: '16px', height: '16px', color: 'var(--color-warning)' }} />
                <span style={{ fontSize: 'var(--text-sm)' }}>Featured Article</span>
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={formData.premium}
                  onChange={(e) => setFormData(prev => ({ ...prev, premium: e.target.checked }))}
                />
                <Lock style={{ width: '16px', height: '16px', color: 'var(--color-warning)' }} />
                <span style={{ fontSize: 'var(--text-sm)' }}>Premium Content</span>
              </label>
            </div>
          </div>

          {/* Organization */}
          <div className="card" style={{ marginBottom: 'var(--space-6)' }}>
            <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--font-semibold)', marginBottom: 'var(--space-4)' }}>
              Organization
            </h3>
            
            <div style={{ marginBottom: 'var(--space-4)' }}>
              <label style={{ display: 'block', fontSize: 'var(--text-sm)', fontWeight: 'var(--font-medium)', marginBottom: 'var(--space-2)' }}>
                Category
              </label>
              <select
                value={formData.category_id}
                onChange={(e) => setFormData(prev => ({ ...prev, category_id: e.target.value }))}
                className="input"
              >
                <option value="">Select Category</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>{category.name}</option>
                ))}
              </select>
            </div>

            <div style={{ marginBottom: 'var(--space-4)' }}>
              <label style={{ display: 'block', fontSize: 'var(--text-sm)', fontWeight: 'var(--font-medium)', marginBottom: 'var(--space-2)' }}>
                Author
              </label>
              <select
                value={formData.author_id}
                onChange={(e) => setFormData(prev => ({ ...prev, author_id: e.target.value }))}
                className="input"
              >
                <option value="">Select Author</option>
                {authors.map(author => (
                  <option key={author.id} value={author.id}>{author.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 'var(--text-sm)', fontWeight: 'var(--font-medium)', marginBottom: 'var(--space-2)' }}>
                Tags
              </label>
              <div style={{ 
                maxHeight: '150px', 
                overflowY: 'auto',
                border: '0.5px solid var(--color-border-primary)',
                borderRadius: 'var(--radius-lg)',
                padding: 'var(--space-2)'
              }}>
                {tags.map(tag => (
                  <label key={tag.id} style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 'var(--space-2)', 
                    padding: 'var(--space-1)',
                    cursor: 'pointer'
                  }}>
                    <input
                      type="checkbox"
                      checked={selectedTags.includes(tag.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedTags(prev => [...prev, tag.id]);
                        } else {
                          setSelectedTags(prev => prev.filter(id => id !== tag.id));
                        }
                      }}
                    />
                    <span style={{ fontSize: 'var(--text-sm)' }}>{tag.name}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Featured Image */}
          <div className="card" style={{ marginBottom: 'var(--space-6)' }}>
            <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--font-semibold)', marginBottom: 'var(--space-4)' }}>
              Featured Image
            </h3>
            
            <div>
              <label style={{ display: 'block', fontSize: 'var(--text-sm)', fontWeight: 'var(--font-medium)', marginBottom: 'var(--space-2)' }}>
                Image URL
              </label>
              <input
                type="url"
                value={formData.featured_image_url}
                onChange={(e) => setFormData(prev => ({ ...prev, featured_image_url: e.target.value }))}
                className="input"
                placeholder="https://example.com/image.jpg"
              />
            </div>

            {formData.featured_image_url && (
              <div style={{ marginTop: 'var(--space-3)' }}>
                <img
                  src={formData.featured_image_url}
                  alt="Featured image preview"
                  style={{
                    width: '100%',
                    height: '120px',
                    objectFit: 'cover',
                    borderRadius: 'var(--radius-lg)'
                  }}
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </div>
            )}
          </div>

          {/* SEO */}
          <div className="card">
            <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--font-semibold)', marginBottom: 'var(--space-4)' }}>
              SEO Settings
            </h3>
            
            <div style={{ marginBottom: 'var(--space-4)' }}>
              <label style={{ display: 'block', fontSize: 'var(--text-sm)', fontWeight: 'var(--font-medium)', marginBottom: 'var(--space-2)' }}>
                SEO Title
              </label>
              <input
                type="text"
                value={formData.seo_title}
                onChange={(e) => setFormData(prev => ({ ...prev, seo_title: e.target.value }))}
                className="input"
                placeholder="SEO optimized title..."
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 'var(--text-sm)', fontWeight: 'var(--font-medium)', marginBottom: 'var(--space-2)' }}>
                SEO Description
              </label>
              <textarea
                value={formData.seo_description}
                onChange={(e) => setFormData(prev => ({ ...prev, seo_description: e.target.value }))}
                rows={3}
                className="input"
                style={{ resize: 'vertical' }}
                placeholder="SEO meta description..."
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};