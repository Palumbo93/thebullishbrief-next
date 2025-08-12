import React from 'react';
import { notFound } from 'next/navigation';
import { Layout } from '../../../components/Layout';
import { ArticlePageClient } from '../../../page-components/ArticlePageClient';
import { fetchArticleBySlug, fetchAllArticleSlugs } from '../../../hooks/useArticles';

// Generate static params for all known articles
export async function generateStaticParams() {
  try {
    const slugs = await fetchAllArticleSlugs();
    return slugs.map((slug) => ({
      slug: slug,
    }));
  } catch (error) {
    console.error('Error generating static params for articles:', error);
    return [];
  }
}

// Enable static generation with revalidation
export const revalidate = 3600; // Revalidate every hour

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
