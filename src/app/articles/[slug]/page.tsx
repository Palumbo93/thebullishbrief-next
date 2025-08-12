import React from 'react';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import Script from 'next/script';
import { Layout } from '../../../components/Layout';
import { ArticlePageClient } from '../../../page-components/ArticlePageClient';
import { fetchArticleBySlug, fetchAllArticleSlugs, fetchArticleBySlugForMetadata } from '../../../hooks/useArticles';

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

// Generate metadata for each article
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  
  try {
    const article = await fetchArticleBySlugForMetadata(slug);
    
    if (!article) {
      return {
        title: 'Article Not Found - The Bullish Brief',
        description: 'The requested article could not be found.',
      };
    }

    const articleUrl = `https://thebullishbrief.com/articles/${slug}`;
    const articleImage = article.featured_image_url || 'https://potsdvyvpwuycgocpivf.supabase.co/storage/v1/object/public/websiteassets/websiteimages/BullishBrief.png';
    const description = article.subtitle || article.title;
    
    return {
      title: `${article.title} - The Bullish Brief`,
      description: description,
      openGraph: {
        title: article.title,
        description: description,
        url: articleUrl,
        siteName: 'The Bullish Brief',
        images: [
          {
            url: articleImage,
            width: 1200,
            height: 630,
            alt: article.featured_image_alt || article.title,
          },
        ],
        locale: 'en_US',
        type: 'article',
        publishedTime: article.published_at || undefined,
        authors: article.author ? [article.author.name] : undefined,
      },
      twitter: {
        card: 'summary_large_image',
        title: article.title,
        description: description,
        images: [articleImage],
      },
    };
  } catch (error) {
    console.error('Error generating metadata for article:', error);
    return {
      title: 'Article - The Bullish Brief',
      description: 'Your daily dose of bullish market insights and financial analysis',
    };
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
  
  // Fetch article data on the server for the Layout and schema
  let article;
  let rawArticle;
  try {
    article = await fetchArticleBySlug(slug);
    rawArticle = await fetchArticleBySlugForMetadata(slug);
  } catch (error) {
    console.error('Error fetching article:', error);
    notFound();
  }

  // Generate JSON-LD schema for NewsArticle
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: rawArticle.title,
    description: rawArticle.subtitle || rawArticle.title,
    image: rawArticle.featured_image_url || 'https://potsdvyvpwuycgocpivf.supabase.co/storage/v1/object/public/websiteassets/websiteimages/BullishBrief.png',
    datePublished: rawArticle.published_at,
    dateModified: rawArticle.updated_at || rawArticle.published_at,
    author: rawArticle.author ? {
      '@type': 'Person',
      name: rawArticle.author.name,
      url: rawArticle.author.website_url || undefined,
    } : undefined,
    publisher: {
      '@type': 'Organization',
      name: 'The Bullish Brief',
      logo: {
        '@type': 'ImageObject',
        url: 'https://potsdvyvpwuycgocpivf.supabase.co/storage/v1/object/public/websiteassets/websiteimages/BullishBrief.png',
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://thebullishbrief.com/articles/${slug}`,
    },
    url: `https://thebullishbrief.com/articles/${slug}`,
    articleSection: rawArticle.category?.name || 'Finance',
    keywords: rawArticle.tags?.map((tag: any) => tag.tag.name).join(', ') || 'finance, markets, investing',
  };
  
  return (
    <>
      <Script
        id="article-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Layout 
        articleId={article?.id ? String(article.id) : undefined}
        articleTitle={article?.title}
      >
        <ArticlePageClient slug={slug} />
      </Layout>
    </>
  );
}
