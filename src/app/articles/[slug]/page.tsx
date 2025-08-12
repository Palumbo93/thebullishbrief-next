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
