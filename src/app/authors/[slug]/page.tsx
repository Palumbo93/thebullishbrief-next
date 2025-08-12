"use client";

import React from 'react';
import { AuthorPage } from '../../../page-components/AuthorPage';
import { Layout } from '../../../components/Layout';

interface Props {
  params: Promise<{ slug: string }>;
}

export default function AuthorPageWrapper({ params }: Props) {
  const [slug, setSlug] = React.useState<string>('');
  
  React.useEffect(() => {
    params.then(({ slug }) => setSlug(slug));
  }, [params]);
  
  if (!slug) return null;
  
  return (
    <Layout>
      <AuthorPage authorSlug={slug} />
    </Layout>
  );
}
