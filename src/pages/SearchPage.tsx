"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { Search, X } from 'lucide-react';
import { useArticles, useTags } from '../hooks/useArticles';
import { useTrackSearch } from '../hooks/useAnalytics';
import { ArticleCard } from '../components/articles/ArticleCard';
import { AuthorAvatar } from '../components/articles/AuthorAvatar';
import { FeaturedBriefCard } from '../components/briefs/FeaturedBriefCard';
import { LegalFooter } from '../components/LegalFooter';

interface SearchPageProps {
  onCreateAccountClick?: () => void;
  onArticleSelect?: (articleId: number | string, articleTitle: string) => void;
}

export const SearchPage: React.FC<SearchPageProps> = ({
  onCreateAccountClick,
  onArticleSelect
}) => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  
  // Get search query and selected tags from URL
  const searchQuery = searchParams.get('q') || '';
  const selectedTags = searchParams.get('tags')?.split(',').filter(Boolean) || [];
  const shouldFocus = searchParams.get('focus') === 'true';
  
  // Local state for search input
  const [searchInput, setSearchInput] = useState(searchQuery);
  
  // Ref for the search input to focus it
  const searchInputRef = React.useRef<HTMLInputElement>(null);
  
  // Fetch data
  const { data: articlesData, isLoading: articlesLoading } = useArticles();
  const { data: tagsData, isLoading: tagsLoading } = useTags();
  const { trackSearch } = useTrackSearch();
  
  // Update search params helper
  const updateSearchParams = (updates: Record<string, string | null>) => {
    const newParams = new URLSearchParams(searchParams.toString());
    
    Object.entries(updates).forEach(([key, value]) => {
      if (value === null) {
        newParams.delete(key);
      } else {
        newParams.set(key, value);
      }
    });
    
    router.push(`${pathname}?${newParams.toString()}`);
  };
  
  // Debounced search effect
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchInput !== searchQuery) {
        updateSearchParams({
          q: searchInput.trim() || null
        });
      }
    }, 300);
    
    return () => clearTimeout(timer);
  }, [searchInput, searchQuery, searchParams, pathname]);
  
  // Filter articles based on search query and selected tags
  const filteredArticles = useMemo(() => {
    if (!articlesData) return [];
    
    const allArticles = [...articlesData.featuredArticles, ...articlesData.articles];
    let filtered = allArticles;
    
    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(article =>
        article.title.toLowerCase().includes(query) ||
        article.subtitle?.toLowerCase().includes(query) ||
        article.content?.toLowerCase().includes(query) ||
        article.tags?.some(tag => tag.toLowerCase().includes(query))
      );
    }
    
    // Filter by selected tags
    if (selectedTags.length > 0) {
      filtered = filtered.filter(article =>
        article.tags?.some(tag => selectedTags.includes(tag))
      );
    }
    
    return filtered;
  }, [articlesData, searchQuery, selectedTags]);
  
  // Track search analytics when query changes
  useEffect(() => {
    if (searchQuery.trim()) {
      trackSearch(searchQuery.trim(), filteredArticles.length);
    }
  }, [searchQuery, filteredArticles.length, trackSearch]);
  
  // Auto-focus search input when focus parameter is present
  useEffect(() => {
    if (shouldFocus && searchInputRef.current) {
      // Try multiple approaches for mobile keyboard triggering
      const input = searchInputRef.current;
      
      // Approach 1: Immediate focus
      input.focus();
      
      // Approach 2: Delayed focus with multiple attempts
      const timer1 = setTimeout(() => {
        input.focus();
        input.click();
      }, 100);
      
      const timer2 = setTimeout(() => {
        input.focus();
        input.click();
        input.select();
      }, 300);
      
      const timer3 = setTimeout(() => {
        input.focus();
        input.click();
        // Try to trigger a user gesture
        input.dispatchEvent(new Event('touchstart', { bubbles: true }));
      }, 500);
      
      // Remove the focus parameter from URL after all attempts
      const cleanupTimer = setTimeout(() => {
        updateSearchParams({ focus: null });
      }, 600);
      
      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
        clearTimeout(timer3);
        clearTimeout(cleanupTimer);
      };
    }
  }, [shouldFocus, searchParams, pathname]);
  
  // Get unique authors from articles
  const authors = useMemo(() => {
    if (!articlesData) return [];
    const allArticles = [...articlesData.featuredArticles, ...articlesData.articles];
    const authorMap = new Map<string, { count: number; avatar?: string; slug?: string }>();
    
    allArticles.forEach(article => {
      const author = article.author;
      const existing = authorMap.get(author);
      if (existing) {
        existing.count += 1;
        // Keep the first avatar URL found for this author
        if (!existing.avatar && article.authorAvatar) {
          existing.avatar = article.authorAvatar;
        }
        // Keep the first slug found for this author
        if (!existing.slug && article.authorSlug) {
          existing.slug = article.authorSlug;
        }
      } else {
        authorMap.set(author, { 
          count: 1, 
          avatar: article.authorAvatar,
          slug: article.authorSlug
        });
      }
    });
    
    return Array.from(authorMap.entries())
      .map(([name, data]) => ({ 
        name, 
        count: data.count,
        avatar: data.avatar,
        slug: data.slug
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6); // Top 6 authors
  }, [articlesData]);
  
  // Handle tag selection
  const handleTagClick = (tagName: string) => {
    const newSelectedTags = selectedTags.includes(tagName)
      ? selectedTags.filter(tag => tag !== tagName)
      : [...selectedTags, tagName];
    
    updateSearchParams({
      tags: newSelectedTags.length > 0 ? newSelectedTags.join(',') : null
    });
  };
  
  // Handle author selection
  const handleAuthorClick = (authorName: string, authorSlug?: string) => {
    if (authorSlug) {
      router.push(`/authors/${authorSlug}`);
    } else {
      setSearchInput(authorName);
    }
  };
  
  // Handle article click
  const handleArticleClick = (articleId: number | string, articleTitle: string) => {
    onArticleSelect?.(articleId, articleTitle);
    // Find the article to get its slug
    const article = filteredArticles.find(a => a.id === articleId);
    const routeId = article?.slug || articleId;
    router.push(`/articles/${routeId}`);
  };
  
  // Check if we should show the explore interface or search results
  const hasSearchOrTags = searchQuery.trim() || selectedTags.length > 0;
  
  // Redirect to appropriate route based on search state
  useEffect(() => {
    if (hasSearchOrTags && pathname === '/explore') {
      // If we have search parameters but we're on /explore, redirect to /search
      const newParams = new URLSearchParams(searchParams.toString());
      router.replace(`/search?${newParams.toString()}`);
    } else if (!hasSearchOrTags && pathname === '/search') {
      // If we have no search parameters but we're on /search, redirect to /explore
      // But preserve the focus parameter if it exists
      const newParams = new URLSearchParams(searchParams.toString());
      const focusParam = newParams.get('focus');
      newParams.delete('focus'); // Remove focus from search params
      
      const exploreUrl = focusParam ? `/explore?focus=${focusParam}` : '/explore';
      router.replace(exploreUrl);
    }
  }, [hasSearchOrTags, pathname, searchParams, router]);
  
  return (
    <>
      <div style={{ minHeight: '100vh' }}>
        {/* Search Bar - Sticky Header */}
        <div style={{ 
          position: 'sticky', 
          top: 0, 
          background: 'var(--color-bg-primary)', 
          borderBottom: '0.5px solid var(--color-border-primary)',
          padding: 'var(--space-3) var(--content-padding)',
          zIndex: 10
        }}>
        <form onSubmit={(e) => e.preventDefault()}>
          <div style={{
            position: 'relative',
            width: '100%'
          }}>
            <Search style={{
              position: 'absolute',
              left: 'var(--space-3)',
              top: '50%',
              transform: 'translateY(-50%)',
              width: '18px',
              height: '18px',
              color: 'var(--color-text-tertiary)'
            }} />
            <input
              ref={searchInputRef}
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search"
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck="false"
              inputMode="search"
              enterKeyHint="search"
              style={{
                width: '100%',
                height: 'var(--input-height)',
                padding: '0 var(--space-3) 0 calc(var(--space-3) + 18px + var(--space-2))',
                background: 'var(--color-bg-tertiary)',
                border: '0.5px solid var(--color-border-primary)',
                borderRadius: 'var(--radius-full)',
                color: 'var(--color-text-primary)',
                fontSize: 'var(--text-base)',
                transition: 'all var(--transition-base)',
                outline: 'none'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = 'var(--color-border-focus)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'var(--color-border-primary)';
              }}
            />
                      {searchInput && (
              <button
                onClick={() => setSearchInput('')}
                style={{
                  position: 'absolute',
                  right: 'var(--space-3)',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--color-text-tertiary)',
                  padding: 'var(--space-1)',
                  borderRadius: 'var(--radius-sm)',
                  transition: 'all var(--transition-base)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'var(--color-bg-tertiary)';
                  e.currentTarget.style.color = 'var(--color-text-primary)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = 'var(--color-text-tertiary)';
                }}
              >
                <X style={{ width: '16px', height: '16px' }} />
              </button>
            )}
          </div>
        </form>
      </div>
      
      {hasSearchOrTags ? (
        // Show search results
        <>
          {/* Tags List - Horizontal Scrollable */}
          {!tagsLoading && tagsData && tagsData.length > 0 && (
            <div style={{ 
              padding: 'var(--space-4) var(--content-padding)'
            }}>
              <div className="hide-scrollbar-horizontal" style={{ 
                display: 'flex', 
                gap: 'var(--space-2)', 
                overflowX: 'auto'
              }}>
                {tagsData.map((tag) => (
                  <button
                    key={tag.id}
                    onClick={() => handleTagClick(tag.name)}
                    className={`btn ${selectedTags.includes(tag.name) ? 'btn-primary' : 'btn-ghost'}`}
                    style={{ 
                      fontSize: 'var(--text-sm)',
                      whiteSpace: 'nowrap',
                      borderRadius: 'var(--radius-full)',
                      padding: 'var(--space-2) var(--space-4)',
                      minHeight: '32px'
                    }}
                  >
                    {tag.name}
                  </button>
                ))}
              </div>
            </div>
          )}
          
          {/* Results Header */}
          <div style={{ 
            padding: 'var(--space-4) var(--content-padding)',
            borderBottom: '0.5px solid var(--color-border-primary)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <h2 style={{
              fontSize: 'var(--text-lg)',
              fontWeight: 'var(--font-semibold)',
              color: 'var(--color-text-primary)'
            }}>
              Explore Results
            </h2>
            <span style={{
              fontSize: 'var(--text-sm)',
              color: 'var(--color-text-tertiary)'
            }}>
              {filteredArticles.length} article{filteredArticles.length !== 1 ? 's' : ''}
            </span>
          </div>
          
          {/* Articles List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {articlesLoading ? (
              // Show skeleton loading states
              Array.from({ length: 5 }).map((_, index) => (
                <div
                  key={index}
                  style={{
                    position: 'relative',
                    padding: 'var(--space-8) var(--content-padding)',
                    borderBottom: '0.5px solid var(--color-border-primary)',
                    background: 'transparent'
                  }}
                >
                  {/* Top line skeleton */}
                  <div style={{
                    marginBottom: 'var(--space-4)',
                    fontSize: 'var(--text-sm)',
                    color: 'var(--color-text-muted)'
                  }}>
                    <div style={{
                      width: '200px',
                      height: '16px',
                      background: 'var(--color-bg-tertiary)',
                      borderRadius: 'var(--radius-sm)',
                      animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
                    }} />
                  </div>

                  {/* Main content skeleton */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr auto',
                    gap: 'var(--space-8)',
                    alignItems: 'center',
                    marginBottom: 'var(--space-4)'
                  }}>
                    {/* Text content skeleton */}
                    <div style={{ minWidth: 0 }}>
                      {/* Headline skeleton */}
                      <div style={{
                        width: '100%',
                        height: '24px',
                        background: 'var(--color-bg-tertiary)',
                        borderRadius: 'var(--radius-sm)',
                        marginBottom: 'var(--space-3)',
                        animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
                      }} />
                      
                      {/* Subheadline skeleton */}
                      <div style={{
                        width: '80%',
                        height: '16px',
                        background: 'var(--color-bg-tertiary)',
                        borderRadius: 'var(--radius-sm)',
                        marginBottom: 'var(--space-2)',
                        animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
                      }} />
                      <div style={{
                        width: '60%',
                        height: '16px',
                        background: 'var(--color-bg-tertiary)',
                        borderRadius: 'var(--radius-sm)',
                        animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
                      }} />
                    </div>
                    
                    {/* Image skeleton */}
                    <div style={{
                      width: '150px',
                      height: '150px',
                      borderRadius: 'var(--radius-lg)',
                      background: 'var(--color-bg-tertiary)',
                      flexShrink: 0,
                      animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
                    }} />
                  </div>
                </div>
              ))
            ) : filteredArticles.length > 0 ? (
              // Show actual articles
              filteredArticles.map((article) => (
                <ArticleCard
                  key={article.id}
                  article={article}
                  onArticleClick={handleArticleClick}
                />
              ))
            ) : (
              // Empty state
              <div style={{ 
                textAlign: 'center', 
                padding: 'var(--space-16) var(--content-padding)',
                color: 'var(--color-text-tertiary)'
              }}>
                <h3 style={{
                  fontSize: 'var(--text-xl)',
                  marginBottom: 'var(--space-2)',
                  color: 'var(--color-text-secondary)'
                }}>
                  No articles found
                </h3>
                <p style={{
                  fontSize: 'var(--text-base)',
                  color: 'var(--color-text-tertiary)'
                }}>
                  Try adjusting your search terms or selected tags.
                </p>
              </div>
            )}
          </div>
        </>
      ) : (
        // Show explore interface - more visually interesting like Twitter
        <div>
          {/* Featured Brief - Dynamic Card */}
          <FeaturedBriefCard />

          {/* Trending Topics - Visual Grid */}
          <div style={{ 
            borderBottom: '0.5px solid var(--color-border-primary)',
            paddingBottom: 'var(--space-6)',
            marginBottom: 'var(--space-6)'
          }}>
            <div style={{ padding: '0 var(--content-padding)' }}>
              <h3 style={{
                fontSize: 'var(--text-xl)',
                fontWeight: 'var(--font-semibold)',
                color: 'var(--color-text-primary)',
                marginBottom: 'var(--space-4)'
              }}>
                Trending Topics
              </h3>
              {tagsLoading ? (
                // Tags skeleton loading
                <div style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: 'var(--space-2)'
                }}>
                  {Array.from({ length: 8 }).map((_, index) => (
                    <div
                      key={index}
                      style={{
                        width: `${Math.random() * 60 + 60}px`,
                        height: '32px',
                        borderRadius: 'var(--radius-full)',
                        background: 'var(--color-bg-tertiary)',
                        animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
                      }}
                    />
                  ))}
                </div>
              ) : tagsData && tagsData.length > 0 ? (
                <div style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: 'var(--space-2)'
                }}>
                  {tagsData.map((tag) => (
                    <button
                      key={tag.id}
                      onClick={() => handleTagClick(tag.name)}
                      className="btn btn-ghost"
                      style={{ 
                        fontSize: 'var(--text-sm)',
                        borderRadius: 'var(--radius-full)',
                        padding: 'var(--space-2) var(--space-4)',
                        height: 'auto',
                        minHeight: '32px',
                        whiteSpace: 'nowrap',
                        background: 'var(--color-bg-card)',
                        border: '0.5px solid var(--color-border-primary)',
                        transition: 'all var(--transition-base)'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'var(--color-bg-tertiary)';
                        e.currentTarget.style.transform = 'translateY(-1px)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'var(--color-bg-card)';
                        e.currentTarget.style.transform = 'translateY(0)';
                      }}
                    >
                      {tag.name}
                    </button>
                  ))}
                </div>
              ) : null}
            </div>
          </div>

          {/* Popular Authors - Card Layout */}
          <div style={{ 
            borderBottom: '0.5px solid var(--color-border-primary)',
            marginBottom: 'var(--space-6)',
            paddingBottom: 'var(--space-6)'
          }}>
            <div style={{ padding: '0 var(--content-padding)' }}>
              <h3 style={{
                fontSize: 'var(--text-xl)',
                fontWeight: 'var(--font-semibold)',
                color: 'var(--color-text-primary)',
                marginBottom: 'var(--space-4)'
              }}>
                Popular Authors
              </h3>
              {articlesLoading ? (
                // Authors skeleton loading
                <div style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: 'var(--space-2)'
                }}>
                  {Array.from({ length: 6 }).map((_, index) => (
                    <div
                      key={index}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 'var(--space-2)',
                        padding: 'var(--space-2) var(--space-4)',
                        height: 'auto',
                        minHeight: '32px',
                        whiteSpace: 'nowrap',
                        background: 'var(--color-bg-card)',
                        border: '0.5px solid var(--color-border-primary)',
                        borderRadius: 'var(--radius-full)',
                        animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
                      }}
                    >
                      {/* Avatar skeleton */}
                      <div style={{
                        width: '20px',
                        height: '20px',
                        borderRadius: '50%',
                        background: 'var(--color-bg-tertiary)',
                        flexShrink: 0
                      }} />
                      {/* Name skeleton */}
                      <div style={{
                        width: `${Math.random() * 80 + 60}px`,
                        height: '16px',
                        borderRadius: 'var(--radius-sm)',
                        background: 'var(--color-bg-tertiary)'
                      }} />
                    </div>
                  ))}
                </div>
              ) : authors.length > 0 ? (
                <div style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: 'var(--space-2)'
                }}>
                  {authors.map((author) => (
                    <button
                      key={author.name}
                      onClick={() => handleAuthorClick(author.name, author.slug)}
                      className="btn btn-ghost"
                      style={{ 
                        fontSize: 'var(--text-sm)',
                        borderRadius: 'var(--radius-full)',
                        padding: 'var(--space-2) var(--space-4)',
                        height: 'auto',
                        minHeight: '32px',
                        whiteSpace: 'nowrap',
                        background: 'var(--color-bg-card)',
                        border: '0.5px solid var(--color-border-primary)',
                        transition: 'all var(--transition-base)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 'var(--space-2)'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'var(--color-bg-tertiary)';
                        e.currentTarget.style.transform = 'translateY(-1px)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'var(--color-bg-card)';
                        e.currentTarget.style.transform = 'translateY(0)';
                      }}
                    >
                      <AuthorAvatar author={author.name} image={author.avatar} size="sm" />
                      <span>{author.name}</span>
                    </button>
                  ))}
                </div>
              ) : null}
            </div>
          </div>
        </div>
      )}
      </div>
      
      <LegalFooter />
    </>
  );
};
