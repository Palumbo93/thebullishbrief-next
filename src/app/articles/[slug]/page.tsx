"use client";

import React from 'react';
import dynamic from 'next/dynamic';
import { useArticleBySlug } from '../../../hooks/useArticles';

const Layout = dynamic(() => import('../../../components/Layout').then(mod => ({ default: mod.Layout })), {
  ssr: false,
});

const ArticlePage = dynamic(() => import('../../../page-components/ArticlePage').then(mod => ({ default: mod.ArticlePage })), {
  ssr: false,
});

interface Props {
  params: Promise<{ slug: string }>;
}

export default function ArticlePageWrapper({ params }: Props) {
  const [slug, setSlug] = React.useState<string>('');
  
  React.useEffect(() => {
    params.then(({ slug }) => setSlug(slug));
  }, [params]);
  
  // Fetch article data to get the ID and title for the Layout
  const { data: article } = useArticleBySlug(slug);
  
  if (!slug) return null;
  
  return (
    <Layout 
      articleId={article?.id ? String(article.id) : undefined}
      articleTitle={article?.title}
    >
      <ArticlePage articleId={slug} />
    </Layout>
  );
}
