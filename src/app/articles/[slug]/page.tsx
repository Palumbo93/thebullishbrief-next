"use client";

import React from 'react';
import { useArticleBySlug } from '../../../hooks/useArticles';
import { Layout } from '../../../components/Layout';
import { ArticlePage } from '../../../page-components/ArticlePage';

interface Props {
  params: Promise<{ slug: string }>;
}

export default function ArticlePageWrapper({ params }: Props) {
  const [slug, setSlug] = React.useState<string>('');
  
  React.useEffect(() => {
    params.then(({ slug }) => setSlug(slug));
  }, [params]);
  
  // Fetch article data to get the ID and title for the Layout
  const { data: article, error, isLoading } = useArticleBySlug(slug);
  
  // Debug logging
  React.useEffect(() => {
    console.log('ArticlePageWrapper Debug:', {
      slug,
      article: article ? { id: article.id, title: article.title } : null,
      error: error ? { message: error.message } : null,
      isLoading,
      environment: process.env.NODE_ENV,
      timestamp: new Date().toISOString()
    });
  }, [slug, article, error, isLoading]);
  
  if (!slug) {
    console.log('No slug provided');
    return <div>Loading...</div>;
  }
  
  if (error) {
    console.error('Article error:', error);
    return (
      <Layout>
        <div style={{ padding: '2rem', textAlign: 'center' }}>
          <h1>Article Not Found</h1>
          <p>The article "{slug}" could not be found.</p>
          <p>Error: {error.message}</p>
          <p>Environment: {process.env.NODE_ENV}</p>
          <p>Timestamp: {new Date().toISOString()}</p>
        </div>
      </Layout>
    );
  }
  
  if (isLoading) {
    return (
      <Layout>
        <div style={{ padding: '2rem', textAlign: 'center' }}>
          <p>Loading article...</p>
        </div>
      </Layout>
    );
  }
  
  return (
    <Layout 
      articleId={article?.id ? String(article.id) : undefined}
      articleTitle={article?.title}
    >
      <ArticlePage articleId={slug} />
    </Layout>
  );
}
