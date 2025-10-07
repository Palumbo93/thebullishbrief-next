/**
 * Static Sitemap Generator
 * 
 * Generates a sitemap.xml at build time for SEO with all static and dynamic pages.
 * Sitemap is static and updates only when builds are triggered.
 * 
 * @see https://nextjs.org/docs/app/api-reference/file-conventions/metadata/sitemap
 */

import { MetadataRoute } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://www.readplaza.com';
  const currentDate = new Date();

  console.log('🗺️ Starting sitemap generation at build time');

  // Initialize Supabase client with service role for server-side access
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  let articles: Array<{ slug: string; updated_at: string; published_at: string }> | null = null;
  let publishers: Array<{ slug: string; updated_at: string }> | null = null;
  let authors: Array<{ slug: string; updated_at: string; created_at: string }> | null = null;
  let briefs: Array<{ slug: string; updated_at: string; published_at: string }> | null = null;

  // Fetch all published articles with error handling
  try {
    const { data, error } = await supabase
      .from('articles')
      .select('slug, updated_at, published_at')
      .eq('status', 'published')
      .order('published_at', { ascending: false });

    if (error) {
      console.error('Failed to fetch articles for sitemap', error.message);
    } else {
      articles = data;
      console.log(`Fetched ${articles?.length || 0} articles for sitemap`);
    }
  } catch (err) {
    console.error('Exception while fetching articles for sitemap', { 
      error: err instanceof Error ? err.message : 'Unknown error' 
    });
  }

  // Fetch all active publishers with error handling
  try {
    const { data, error } = await supabase
      .from('publishers')
      .select('slug, updated_at')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Failed to fetch publishers for sitemap', error.message);
    } else {
      publishers = data;
      console.log(`Fetched ${publishers?.length || 0} publishers for sitemap`);
    }
  } catch (err) {
    console.error('Exception while fetching publishers for sitemap', { 
      error: err instanceof Error ? err.message : 'Unknown error' 
    });
  }

  // Fetch all authors with error handling
  try {
    const { data, error } = await supabase
      .from('authors')
      .select('slug, updated_at, created_at')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Failed to fetch authors for sitemap', error.message);
    } else {
      authors = data;
      console.log(`Fetched ${authors?.length || 0} authors for sitemap`);
    }
  } catch (err) {
    console.error('Exception while fetching authors for sitemap', { 
      error: err instanceof Error ? err.message : 'Unknown error' 
    });
  }

  // Fetch all published briefs with error handling
  try {
    const { data, error } = await supabase
      .from('briefs')
      .select('slug, updated_at, published_at')
      .eq('status', 'published')
      .order('published_at', { ascending: false });

    if (error) {
      console.error('Failed to fetch briefs for sitemap', error.message);
    } else {
      briefs = data;
      console.log(`Fetched ${briefs?.length || 0} briefs for sitemap`);
    }
  } catch (err) {
    console.error('Exception while fetching briefs for sitemap', { 
      error: err instanceof Error ? err.message : 'Unknown error' 
    });
  }

  // Static pages with their priorities and change frequencies
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/explore`,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: currentDate,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: currentDate,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/cookies`,
      lastModified: currentDate,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/disclaimer`,
      lastModified: currentDate,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
  ];

  // Dynamic article pages
  const articlePages: MetadataRoute.Sitemap = articles?.map((article) => ({
    url: `${baseUrl}/articles/${article.slug}`,
    lastModified: new Date(article.updated_at || article.published_at),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  })) || [];

  // Root-level publisher pages (e.g., /GTAD)
  // Note: We only include root-level URLs because /publishers/:slug redirects to /:slug
  const rootPublisherPages: MetadataRoute.Sitemap = publishers?.map((publisher) => ({
    url: `${baseUrl}/${publisher.slug}`,
    lastModified: new Date(publisher.updated_at || currentDate),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  })) || [];

  // Author pages at /authors/:slug
  const authorPages: MetadataRoute.Sitemap = authors?.map((author) => ({
    url: `${baseUrl}/authors/${author.slug}`,
    lastModified: new Date(author.updated_at || author.created_at),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  })) || [];

  // Brief pages at /briefs/:slug
  const briefPages: MetadataRoute.Sitemap = briefs?.map((brief) => ({
    url: `${baseUrl}/briefs/${brief.slug}`,
    lastModified: new Date(brief.updated_at || brief.published_at),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  })) || [];

  const totalUrls = 
    staticPages.length + 
    articlePages.length + 
    rootPublisherPages.length + 
    authorPages.length + 
    briefPages.length;
  
  console.log('✅ Sitemap generation complete:', {
    staticPages: staticPages.length,
    articlePages: articlePages.length,
    publisherPages: rootPublisherPages.length,
    authorPages: authorPages.length,
    briefPages: briefPages.length,
    totalUrls,
  });

  return [
    ...staticPages,
    ...articlePages,
    ...rootPublisherPages,
    ...authorPages,
    ...briefPages,
  ];
}

// No revalidation = static build-time generation
// Sitemap updates only when builds are triggered via the build trigger system

