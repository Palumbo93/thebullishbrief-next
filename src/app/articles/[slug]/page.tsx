import React from 'react';
import type { Metadata } from 'next';
import { Layout } from '../../../components/Layout';
import { ArticlePage } from '../../../pages/ArticlePage';
import { supabase } from '../../../lib/supabase';

interface Props {
  params: Promise<{ slug: string }>;
}

async function getArticle(slug: string) {
  const { data: article, error } = await supabase
    .from('articles')
    .select(`
      *,
      category:categories(*),
      author:authors(*),
      tags:article_tags(
        tag:tags(*)
      )
    `)
    .eq('slug', slug)
    .eq('status', 'published')
    .single();

  if (error || !article) {
    return null;
  }

  // Transform the data to include tags properly
  const transformedArticle = {
    ...article,
    tags: article.tags?.map((tagRelation: { tag?: { name: string } }) => tagRelation.tag?.name).filter(Boolean) || []
  };

  return transformedArticle;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticle(slug);
  
  if (!article) {
    return {
      title: 'Article Not Found | The Bullish Brief',
      description: 'The article you are looking for could not be found.'
    };
  }

  const title = `${article.title} | The Bullish Brief`;
  const description = article.subtitle || '';
  const url = `${process.env.NEXT_PUBLIC_SITE_URL || 'https://thebullishbrief.com'}/articles/${article.slug}`;

  return {
    title,
    description,
    authors: [{ name: article.author }],
    openGraph: {
      title,
      description,
      url,
      siteName: 'The Bullish Brief',
      images: article.featured_image_url ? [
        {
          url: article.featured_image_url,
          width: 1200,
          height: 630,
          alt: article.title,
        }
      ] : [],
      locale: 'en_US',
      type: 'article',
      publishedTime: article.created_at,
      modifiedTime: article.updated_at,
      authors: [article.author],
      section: article.category?.name || 'Finance',
      tags: article.tags,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: article.featured_image_url ? [article.featured_image_url] : [],
      creator: '@thebullishbrief',
      site: '@thebullishbrief',
    },
    alternates: {
      canonical: url,
    },
  };
}

export default async function ArticlePageWrapper({ params }: Props) {
  const { slug } = await params;
  const article = await getArticle(slug);
  
  return (
    <ArticlePageClient 
      slug={slug} 
      articleId={article?.id ? String(article.id) : undefined}
      articleTitle={article?.title}
    />
  );
}

// Client component to handle the interactive parts
function ArticlePageClient({ 
  slug, 
  articleId, 
  articleTitle 
}: { 
  slug: string;
  articleId?: string;
  articleTitle?: string;
}) {
  'use client';
  
  return (
    <Layout 
      articleId={articleId}
      articleTitle={articleTitle}
    >
      <ArticlePage articleId={slug} />
    </Layout>
  );
}
