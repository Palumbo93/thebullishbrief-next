"use client";

import React, { useState, useMemo } from 'react';
import { Plus, Edit, Trash2, Eye, FileText, Calendar, User, Search, Filter, X, ChevronDown, Copy } from 'lucide-react';
import { useArticles, useCategories, useAuthors } from '../../hooks/useDatabase';
import { moveFeaturedImageToArticle } from '../../lib/storage';
import { articleTagService } from '../../services/database';
import { ArticleCreateModal } from './ArticleCreateModal';
import { ArticleEditModal } from './ArticleEditModal';
import { ArticleDeleteModal } from './ArticleDeleteModal';
import { ManagerHeader } from './ManagerHeader';
import { SearchBar } from './SearchBar';
import { Article } from '../../services/database';

interface ArticleManagerProps {}

export const ArticleManager: React.FC<ArticleManagerProps> = () => {
  const { data: articles, loading, create, update, delete: deleteArticle } = useArticles();
  const { data: categories } = useCategories();
  const { data: authors } = useAuthors();

  // Generate slug from title
  const generateSlug = (title: string): string => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single
      .trim()
      .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
  };
  
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  
  // Search and filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'draft' | 'published' | 'archived'>('all');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [authorFilter, setAuthorFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState<'created_at' | 'updated_at' | 'title' | 'view_count'>('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Filter and search articles
  const filteredArticles = useMemo(() => {
    let filtered = [...articles];

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(article =>
        article.title.toLowerCase().includes(query) ||
        article.subtitle?.toLowerCase().includes(query) ||
        article.slug.toLowerCase().includes(query) ||
        article.content.toLowerCase().includes(query)
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(article => article.status === statusFilter);
    }

    // Category filter (using category_id for now - would need to join with categories table)
    if (categoryFilter) {
      filtered = filtered.filter(article => 
        article.category_id && article.category_id.toLowerCase().includes(categoryFilter.toLowerCase())
      );
    }

    // Author filter (using author_id for now - would need to join with authors table)
    if (authorFilter) {
      filtered = filtered.filter(article => 
        article.author_id && article.author_id.toLowerCase().includes(authorFilter.toLowerCase())
      );
    }

    // Sort articles
    filtered.sort((a, b) => {
      let aValue: any = a[sortBy];
      let bValue: any = b[sortBy];

      if (sortBy === 'created_at' || sortBy === 'updated_at') {
        aValue = new Date(aValue).getTime();
        bValue = new Date(bValue).getTime();
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [articles, searchQuery, statusFilter, categoryFilter, authorFilter, sortBy, sortOrder]);

  const hasActiveFilters = Boolean(searchQuery || statusFilter !== 'all' || categoryFilter || authorFilter);

  // Helper functions to get names from IDs
  const getAuthorName = (authorId?: string) => {
    if (!authorId) return 'No Author';
    const author = authors?.find(a => a.id === authorId);
    return author?.name || 'Unknown Author';
  };

  const getCategoryName = (categoryId?: string) => {
    if (!categoryId) return 'No Category';
    const category = categories?.find(c => c.id === categoryId);
    return category?.name || 'Unknown Category';
  };



  // Adapter interfaces for modals
      interface ModalArticle {
    id: string;
    title: string;
    subtitle: string;
    content: string;
    author: string;
    category: string;
    status: 'draft' | 'published' | 'archived';
    published_at?: string;
    created_at: string;
    updated_at: string;
    view_count: number;
    slug?: string;
    featured_image_url?: string;
    featured_image_alt?: string;
    tempPath?: string;
    tags?: string[];
    reading_time_minutes?: number;
  }

  // Convert service layer Article to modal Article
  const convertToModalArticle = (article: Article): ModalArticle => ({
    id: article.id,
    title: article.title,
    subtitle: article.subtitle || '',
    content: article.content,
    author: article.author_id || '',
    category: article.category_id || '',
    status: (article.status as 'draft' | 'published' | 'archived') || 'draft',
    published_at: article.published_at,
    created_at: article.created_at,
    updated_at: article.updated_at,
    view_count: article.view_count || 0,
    slug: article.slug,
    featured_image_url: article.featured_image_url,
    featured_image_alt: article.featured_image_alt,
    reading_time_minutes: article.reading_time_minutes
  });

  // Convert modal Article to service layer Article
  const convertToServiceArticle = (modalArticle: Partial<ModalArticle>): Partial<Article> => ({
    title: modalArticle.title,
    subtitle: modalArticle.subtitle,
    content: modalArticle.content,
    author_id: modalArticle.author, // This is already the UUID from the dropdown
    category_id: modalArticle.category, // This is already the UUID from the dropdown
    status: modalArticle.status,
    published_at: modalArticle.published_at,
    slug: modalArticle.slug || generateSlug(modalArticle.title || ''),
    featured_image_url: modalArticle.featured_image_url,
    featured_image_alt: modalArticle.featured_image_alt,
    reading_time_minutes: modalArticle.reading_time_minutes
  });

  const handleCreateArticle = async (modalArticleData: Partial<ModalArticle>) => {
    try {
      const serviceArticleData = convertToServiceArticle(modalArticleData);
      const createdArticle = await create(serviceArticleData);
      
      // Handle tag creation if tags are provided
      if (modalArticleData.tags && modalArticleData.tags.length > 0) {
        try {
          await articleTagService.setTagsForArticle(createdArticle.id, modalArticleData.tags);
        } catch (error) {
          console.error('Failed to create article tags:', error);
        }
      }
      
      // If there's a temporary featured image, move it to the permanent location
      if (modalArticleData.featured_image_url && modalArticleData.tempPath) {
        try {
          await moveFeaturedImageToArticle(modalArticleData.tempPath, createdArticle.id);
          // Update the article with the new image URL
          await update(createdArticle.id, {
            featured_image_url: modalArticleData.featured_image_url,
            featured_image_alt: modalArticleData.featured_image_alt
          });
        } catch (error) {
          console.error('Failed to move featured image:', error);
        }
      }
      
      setShowCreateModal(false);
    } catch (error) {
      console.error('Error creating article:', error);
    }
  };

  const handleUpdateArticle = async (id: string, modalArticleData: Partial<ModalArticle>) => {
    try {
      const serviceArticleData = convertToServiceArticle(modalArticleData);
      await update(id, serviceArticleData);
      
      // Handle tag updates if tags are provided
      if (modalArticleData.tags) {
        try {
          await articleTagService.setTagsForArticle(id, modalArticleData.tags);
        } catch (error) {
          console.error('Failed to update article tags:', error);
        }
      }
      
        setShowEditModal(false);
        setSelectedArticle(null);
    } catch (error) {
      console.error('Error updating article:', error);
    }
  };

  const handleDeleteArticle = async (id: string) => {
    try {
      await deleteArticle(id);
      setShowDeleteModal(false);
      setSelectedArticle(null);
    } catch (error) {
      console.error('Error deleting article:', error);
    }
  };

  const handleDuplicateArticle = async (article: Article) => {
    try {
      // Calculate reading time for the duplicated article
      const { calculateReadingTime } = await import('../../utils/readingTime');
      const readingTimeMinutes = calculateReadingTime(article.content);
      
      await create({
        title: `${article.title} (Copy)`,
        subtitle: article.subtitle,
        content: article.content,
        author_id: article.author_id,
        category_id: article.category_id,
        status: 'draft',
        featured: false,
        premium: false,
        reading_time_minutes: readingTimeMinutes
      });
      setShowEditModal(false);
      setSelectedArticle(null);
    } catch (error) {
      console.error('Error duplicating article:', error);
    }
  };

  const clearFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
    setCategoryFilter('');
    setAuthorFilter('');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published':
        return 'var(--color-success)';
      case 'draft':
        return 'var(--color-warning)';
      case 'archived':
        return 'var(--color-text-muted)';
      default:
        return 'var(--color-text-tertiary)';
    }
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '400px'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '3px solid var(--color-border-primary)',
            borderTop: '3px solid var(--color-brand-primary)',
            borderRadius: 'var(--radius-full)',
            margin: '0 auto var(--space-4)'
          }} className="animate-spin"></div>
          <p style={{ color: 'var(--color-text-tertiary)' }}>Loading articles...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header with Create Button */}
      <ManagerHeader
        title="Articles"
        itemCount={filteredArticles.length}
        totalCount={articles.length}
        hasActiveFilters={hasActiveFilters}
        createButtonText="Create Article"
        onCreateClick={() => setShowCreateModal(true)}
      />

      {/* Search and Filter Bar */}
      <div style={{
      }}>
        {/* Search Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
          gap: 'var(--space-3)',
          marginBottom: 'var(--space-4)'
        }}>
          <div style={{
            position: 'relative',
            flex: 1
          }}>
            <Search style={{
              position: 'absolute',
              left: 'var(--space-3)',
              top: '50%',
              transform: 'translateY(-50%)',
              width: '16px',
              height: '16px',
              color: 'var(--color-text-tertiary)'
            }} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search articles..."
              style={{
                width: '100%',
                height: 'var(--input-height)',
                padding: '0 var(--space-3) 0 calc(var(--space-3) + 16px + var(--space-2))',
                background: 'var(--color-bg-tertiary)',
                border: '0.5px solid var(--color-border-primary)',
                borderRadius: 'var(--radius-lg)',
                color: 'var(--color-text-primary)',
                fontSize: 'var(--text-base)',
                transition: 'all var(--transition-base)'
              }}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                style={{
                  position: 'absolute',
                  right: 'var(--space-3)',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--color-text-tertiary)'
                }}
              >
                <X style={{ width: '16px', height: '16px' }} />
              </button>
            )}
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`btn ${showFilters ? 'btn-primary' : 'btn-secondary'}`}
            style={{ fontSize: 'var(--text-sm)' }}
          >
            <Filter style={{ width: '16px', height: '16px' }} />
            <span>Filters</span>
          </button>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="btn btn-ghost"
              style={{ fontSize: 'var(--text-sm)' }}
            >
              Clear All
            </button>
          )}
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <div style={{
            borderTop: '0.5px solid var(--color-border-primary)',
            paddingTop: 'var(--space-4)',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: 'var(--space-4)',
            marginBottom: 'var(--space-6)'
          }}>
            {/* Status Filter */}
            <div>
              <label style={{
                display: 'block',
                fontSize: 'var(--text-sm)',
                fontWeight: 'var(--font-medium)',
                color: 'var(--color-text-primary)',
                marginBottom: 'var(--space-2)'
              }}>
                Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                style={{
                  width: '100%',
                  height: 'var(--input-height)',
                  padding: '0 var(--space-3)',
                  background: 'var(--color-bg-tertiary)',
                  border: '0.5px solid var(--color-border-primary)',
                  borderRadius: 'var(--radius-lg)',
                  color: 'var(--color-text-primary)',
                  fontSize: 'var(--text-base)'
                }}
              >
                <option value="all">All Status</option>
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="archived">Archived</option>
              </select>
            </div>

            {/* Category Filter */}
            <div>
              <label style={{
                display: 'block',
                fontSize: 'var(--text-sm)',
                fontWeight: 'var(--font-medium)',
                color: 'var(--color-text-primary)',
                marginBottom: 'var(--space-2)'
              }}>
                Category
              </label>
              <input
                type="text"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                placeholder="Filter by category..."
                style={{
                  width: '100%',
                  height: 'var(--input-height)',
                  padding: '0 var(--space-3)',
                  background: 'var(--color-bg-tertiary)',
                  border: '0.5px solid var(--color-border-primary)',
                  borderRadius: 'var(--radius-lg)',
                  color: 'var(--color-text-primary)',
                  fontSize: 'var(--text-base)'
                }}
              />
            </div>

            {/* Author Filter */}
            <div>
              <label style={{
                display: 'block',
                fontSize: 'var(--text-sm)',
                fontWeight: 'var(--font-medium)',
                color: 'var(--color-text-primary)',
                marginBottom: 'var(--space-2)'
              }}>
                Author
              </label>
              <input
                type="text"
                value={authorFilter}
                onChange={(e) => setAuthorFilter(e.target.value)}
                placeholder="Filter by author..."
                style={{
                  width: '100%',
                  height: 'var(--input-height)',
                  padding: '0 var(--space-3)',
                  background: 'var(--color-bg-tertiary)',
                  border: '0.5px solid var(--color-border-primary)',
                  borderRadius: 'var(--radius-lg)',
                  color: 'var(--color-text-primary)',
                  fontSize: 'var(--text-base)'
                }}
              />
        </div>

            {/* Sort Options */}
            <div>
              <label style={{
                display: 'block',
                fontSize: 'var(--text-sm)',
                fontWeight: 'var(--font-medium)',
                color: 'var(--color-text-primary)',
                marginBottom: 'var(--space-2)'
              }}>
                Sort By
              </label>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-2)'
              }}>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  style={{
                    flex: 1,
                    height: 'var(--input-height)',
                    padding: '0 var(--space-3)',
                    background: 'var(--color-bg-tertiary)',
                    border: '0.5px solid var(--color-border-primary)',
                    borderRadius: 'var(--radius-lg)',
                    color: 'var(--color-text-primary)',
                    fontSize: 'var(--text-base)'
                  }}
                >
                  <option value="created_at">Created Date</option>
                  <option value="updated_at">Updated Date</option>
                  <option value="title">Title</option>
                  <option value="view_count">Views</option>
                </select>
        <button
                  onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                  className="btn btn-ghost"
                  style={{
                    padding: 'var(--space-2)',
                    fontSize: 'var(--text-sm)'
                  }}
                >
                  <ChevronDown style={{
                    width: '16px',
                    height: '16px',
                    transform: sortOrder === 'asc' ? 'rotate(180deg)' : 'none',
                    transition: 'transform var(--transition-base)'
                  }} />
        </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Articles Table */}
      <div style={{
        background: 'var(--color-bg-card)',
        border: '0.5px solid var(--color-border-primary)',
        borderRadius: 'var(--radius-xl)',
        overflow: 'hidden'
      }}>
        {filteredArticles.length === 0 ? (
          <div style={{
            padding: 'var(--space-8)',
            textAlign: 'center'
          }}>
            <FileText style={{
              width: '48px',
              height: '48px',
              color: 'var(--color-text-muted)',
              margin: '0 auto var(--space-4)'
            }} />
            <h3 style={{
              fontSize: 'var(--text-lg)',
              fontWeight: 'var(--font-semibold)',
              color: 'var(--color-text-primary)',
              marginBottom: 'var(--space-2)'
            }}>
              {articles.length === 0 ? 'No articles yet' : 'No articles found'}
            </h3>
            <p style={{
              color: 'var(--color-text-tertiary)',
              marginBottom: 'var(--space-4)'
            }}>
              {articles.length === 0 
                ? 'Create your first article to get started.'
                : 'Try adjusting your search or filter criteria.'
              }
            </p>
            {articles.length === 0 && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="btn btn-primary"
              style={{ fontSize: 'var(--text-sm)' }}
            >
              <Plus style={{ width: '16px', height: '16px' }} />
              <span>Create Article</span>
            </button>
            )}
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{
              width: '100%',
              borderCollapse: 'collapse'
            }}>
              <thead>
                <tr style={{
                  background: 'var(--color-bg-secondary)',
                  borderBottom: '0.5px solid var(--color-border-primary)'
                }}>
                  <th style={{
                    padding: 'var(--space-4)',
                    textAlign: 'left',
                    fontSize: 'var(--text-sm)',
                    fontWeight: 'var(--font-semibold)',
                    color: 'var(--color-text-primary)',
                    borderBottom: '0.5px solid var(--color-border-primary)',
                    width: '40%'
                  }}>
                    Title
                  </th>
                  <th style={{
                    padding: 'var(--space-4)',
                    textAlign: 'left',
                    fontSize: 'var(--text-sm)',
                    fontWeight: 'var(--font-semibold)',
                    color: 'var(--color-text-primary)',
                    borderBottom: '0.5px solid var(--color-border-primary)'
                  }}>
                    Author
                  </th>
                  <th style={{
                    padding: 'var(--space-4)',
                    textAlign: 'left',
                    fontSize: 'var(--text-sm)',
                    fontWeight: 'var(--font-semibold)',
                    color: 'var(--color-text-primary)',
                    borderBottom: '0.5px solid var(--color-border-primary)'
                  }}>
                    Category
                  </th>
                  <th style={{
                    padding: 'var(--space-4)',
                    textAlign: 'left',
                    fontSize: 'var(--text-sm)',
                    fontWeight: 'var(--font-semibold)',
                    color: 'var(--color-text-primary)',
                    borderBottom: '0.5px solid var(--color-border-primary)'
                  }}>
                    Status
                  </th>
                  <th style={{
                    padding: 'var(--space-4)',
                    textAlign: 'left',
                    fontSize: 'var(--text-sm)',
                    fontWeight: 'var(--font-semibold)',
                    color: 'var(--color-text-primary)',
                    borderBottom: '0.5px solid var(--color-border-primary)'
                  }}>
                    Views
                  </th>
                  <th style={{
                    padding: 'var(--space-4)',
                    textAlign: 'left',
                    fontSize: 'var(--text-sm)',
                    fontWeight: 'var(--font-semibold)',
                    color: 'var(--color-text-primary)',
                    borderBottom: '0.5px solid var(--color-border-primary)'
                  }}>
                    Created
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredArticles.map((article) => (
                  <tr
                key={article.id}
                style={{
                      borderBottom: '0.5px solid var(--color-border-primary)',
                      transition: 'all var(--transition-base)',
                      cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'var(--color-bg-card-hover)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                }}
                    onClick={() => {
                      setSelectedArticle(article);
                      setShowEditModal(true);
                    }}
                  >
                    <td style={{
                      padding: 'var(--space-4)',
                      fontSize: 'var(--text-base)',
                      color: 'var(--color-text-primary)',
                      fontWeight: 'var(--font-medium)'
                    }}>
                      {article.title}
                    </td>
                    <td style={{
                      padding: 'var(--space-4)',
                      fontSize: 'var(--text-sm)',
                      color: 'var(--color-text-primary)'
                    }}>
                      {getAuthorName(article.author_id)}
                    </td>
                                        <td style={{
                      padding: 'var(--space-4)',
                      fontSize: 'var(--text-sm)',
                      color: 'var(--color-text-primary)'
                    }}>
                      {getCategoryName(article.category_id)}
                    </td>
                    <td style={{
                      padding: 'var(--space-4)',
                      fontSize: 'var(--text-sm)'
                    }}>
                      <span style={{
                      padding: 'var(--space-1) var(--space-2)',
                      background: 'var(--color-bg-tertiary)',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: 'var(--text-xs)',
                      color: getStatusColor(article.status),
                      fontWeight: 'var(--font-medium)',
                      textTransform: 'uppercase'
                    }}>
                      {article.status}
                      </span>
                    </td>
                    <td style={{
                      padding: 'var(--space-4)',
                    fontSize: 'var(--text-sm)',
                      color: 'var(--color-text-primary)'
                    }}>
                      {article.view_count || 0}
                    </td>
                    <td style={{
                      padding: 'var(--space-4)',
                      fontSize: 'var(--text-sm)',
                      color: 'var(--color-text-tertiary)'
                    }}>
                      {formatDate(article.created_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modals */}
      {showCreateModal && (
        <ArticleCreateModal
          onClose={() => setShowCreateModal(false)}
          onCreate={handleCreateArticle}
        />
      )}
      
      {showEditModal && selectedArticle && (
        <ArticleEditModal
          article={convertToModalArticle(selectedArticle)}
          onClose={() => {
            setShowEditModal(false);
            setSelectedArticle(null);
          }}
          onUpdate={handleUpdateArticle}
          onDelete={handleDeleteArticle}
          onDuplicate={handleDuplicateArticle}
        />
      )}
      
      {showDeleteModal && selectedArticle && (
        <ArticleDeleteModal
          article={convertToModalArticle(selectedArticle)}
          onClose={() => {
            setShowDeleteModal(false);
            setSelectedArticle(null);
          }}
          onDelete={handleDeleteArticle}
        />
      )}
    </div>
  );
};