"use client";

import React, { Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { Layout } from '../components/Layout';
import { LegalFooter } from '../components/LegalFooter';
import { CTABanner } from '../components/CTABanner';
import { useArticles, useFeaturedArticles, Article } from '../hooks/useArticles';
import { useFeaturedBrief } from '../hooks/useBriefs';
import { Brief } from '../lib/database.aliases';
import { useAuthModal } from '../contexts/AuthModalContext';
import { useAuth } from '../contexts/AuthContext';
import { ArticleSkeleton } from '@/components/ArticleSkeleton';
import { HeroSection, FeaturedStoriesGrid, LatestNewsGrid } from '../components/home';
import { SignUpBanner } from '../components/SignUpBanner';

function HomePageContent() {
  const router = useRouter();
  const { handleSignUpClick } = useAuthModal();
  const { user } = useAuth();
  
  // Fetch data for the publication grid
  const { data: allArticlesData, isLoading: articlesLoading } = useArticles();
  const { data: featuredArticles = [], isLoading: featuredLoading } = useFeaturedArticles();
  const { data: featuredBrief, isLoading: briefLoading } = useFeaturedBrief();

  const handleArticleClick = (articleId: number | string, articleTitle: string, slug?: string) => {
    const routeId = slug || articleId;
    router.push(`/articles/${routeId}`);
  };

  const handleBriefClick = (briefId: number | string, briefTitle: string, slug?: string) => {
    const routeId = slug || briefId;
    router.push(`/briefs/${routeId}`);
  };

  // Get regular articles (non-featured)
  const regularArticles = allArticlesData?.articles || [];
  
  if (articlesLoading || featuredLoading || briefLoading) {
    return (
      <Layout>
        <div style={{ minHeight: '80vh' }}>
          <ArticleSkeleton />
        </div>
      </Layout>
    );
  }

  // Implement the new content distribution logic
  let heroContent;
  let featuredSectionArticles;
  let latestSectionArticles;
  
  if (featuredBrief) {
    // If Featured Brief > 0: show the latest brief in hero
    heroContent = featuredBrief;
    // Show articles 1-4 in featured stories
    featuredSectionArticles = regularArticles.slice(0, 4);
    // Show articles 5-rest in latest stories
    latestSectionArticles = regularArticles.slice(4);
  } else {
    // Else: show the latest article in hero
    heroContent = regularArticles.length > 0 ? regularArticles[0] : null;
    // Show articles 2-5 in featured stories
    featuredSectionArticles = regularArticles.slice(1, 5);
    // Show articles 6-rest in latest stories
    latestSectionArticles = regularArticles.slice(5);
  }

  const featuredSectionTitle = featuredBrief ? 'Latest Stories' : 'Featured Stories';

  return (
    <Layout>
      {/* Newsletter Signup Banner (Disabled for now) */}
      <SignUpBanner variant="home" />
      
      <div style={{ minHeight: '80vh' }}>
        {/* Hero Section */}
        <HeroSection
          heroContent={heroContent}
          onArticleClick={handleArticleClick}
          onBriefClick={handleBriefClick}
        />

        {/* Featured/Latest Stories Grid */}
        {featuredSectionArticles && featuredSectionArticles.length > 0 && (
          <FeaturedStoriesGrid
            articles={featuredSectionArticles}
            title={featuredSectionTitle}
            onArticleClick={handleArticleClick}
          />
        )}

        {/* CTA Banner */}
        {!user && (
          <CTABanner
            variant="primary"
            position="top"
            onCreateAccountClick={handleSignUpClick}
          />
        )}

        {/* More Stories Grid */}
        {latestSectionArticles && latestSectionArticles.length > 0 && (
          <LatestNewsGrid
            articles={latestSectionArticles}
            title="More Stories"
            maxItems={9}
            onArticleClick={handleArticleClick}
          />
        )}
      </div>
      
      <LegalFooter />
    </Layout>
  );
}

export default function HomePage() {
  return (
    <Suspense fallback={<div><ArticleSkeleton /></div>}>
      <HomePageContent />
    </Suspense>
  );
}
