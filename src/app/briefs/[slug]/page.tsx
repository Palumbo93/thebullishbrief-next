"use client";

import React from 'react';
import { BriefPage } from '../../../page-components/BriefPage';
import { Layout } from '../../../components/Layout';

interface Props {
  params: Promise<{ slug: string }>;
}

export default function BriefPageWrapper({ params }: Props) {
  const [slug, setSlug] = React.useState<string>('');
  
  React.useEffect(() => {
    params.then(({ slug }) => setSlug(slug));
  }, [params]);
  
  if (!slug) return null;
  
  return (
    <Layout>
      <BriefPage briefSlug={slug} />
    </Layout>
  );
}
