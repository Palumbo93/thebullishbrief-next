import React from 'react';
import { notFound } from 'next/navigation';
import { Layout } from '../../../components/Layout';
import { ArticlePageClient } from '../../../page-components/ArticlePageClient';
import { fetchArticleBySlug } from '../../../hooks/useArticles';

// Force dynamic rendering for all article pages
export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function ArticlePageWrapper({ params }: Props) {
  const { slug } = await params;
  
  if (!slug) {
    notFound();
  }
  
  // Fetch article data on the server for the Layout
  let article;
  try {
    article = await fetchArticleBySlug(slug);
  } catch (error) {
    console.error('Error fetching article:', error);
    notFound();
  }
  
  return (
    <Layout 
      articleId={article?.id ? String(article.id) : undefined}
      articleTitle={article?.title}
    >
      <ArticlePageClient slug={slug} />
    </Layout>
  );
}
