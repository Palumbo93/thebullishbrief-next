"use client";

import React from 'react';
import { BookmarksPage } from '../../page-components/BookmarksPage';
import { Layout } from '../../components/Layout';

export default function BookmarksPageWrapper() {
  return (
    <Layout>
      <BookmarksPage />
    </Layout>
  );
}
