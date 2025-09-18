import { revalidatePath, revalidateTag } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

async function verifyAdminFromRequest(request: NextRequest): Promise<boolean> {
  try {
    // Get the authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return false;
    }
    
    const token = authHeader.replace('Bearer ', '');
    
    // Create Supabase client with the token
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        auth: { autoRefreshToken: false, persistSession: false },
        global: { headers: { Authorization: `Bearer ${token}` } }
      }
    );
    
    // Get the user
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) {
      return false;
    }
    
    // Check JWT app_metadata first
    if (user.app_metadata?.is_admin === true) {
      return true;
    }
    
    // Fallback: Check database
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single();
      
    return profile?.is_admin || false;
  } catch (error) {
    console.error('Admin verification error:', error);
    return false;
  }
}

export async function POST(request: NextRequest) {
  try {
    // Verify admin access before allowing build trigger
    const isAdmin = await verifyAdminFromRequest(request);
    if (!isAdmin) {
      return NextResponse.json(
        { success: false, error: 'Admin access required' },
        { status: 403 }
      );
    }
    
    console.log('🔐 Admin verification passed for build trigger');
        
    // Get the request body
    const body = await request.json();
    const { type = 'all' } = body;

    // Create supabase client for fetching current data
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const revalidatedPaths: string[] = [];
    let triggeredDeploy = false;

    // Revalidate based on type
    switch (type) {
      case 'articles':
        // Revalidate existing paths
        revalidatePath('/articles');
        revalidateTag('articles');
        revalidatedPaths.push('/articles');
        
        // Get all article slugs and revalidate individual pages (including drafts)
        try {
          const { data: articles } = await supabase
            .from('articles')
            .select('slug')
            .in('status', ['published', 'draft']);
          
          if (articles) {
            for (const article of articles) {
              const path = `/articles/${article.slug}`;
              revalidatePath(path);
              revalidatedPaths.push(path);
            }
          }
        } catch (err) {
          console.warn('Failed to revalidate individual article pages:', err);
        }
        break;
        
      case 'briefs':
        revalidatePath('/briefs');
        revalidateTag('briefs');
        revalidatedPaths.push('/briefs');
        
        // Get all brief slugs and revalidate individual pages (including drafts)
        try {
          const { data: briefs } = await supabase
            .from('briefs')
            .select('slug')
            .in('status', ['published', 'draft']);
          
          if (briefs) {
            for (const brief of briefs) {
              const path = `/briefs/${brief.slug}`;
              revalidatePath(path);
              revalidatedPaths.push(path);
            }
          }
        } catch (err) {
          console.warn('Failed to revalidate individual brief pages:', err);
        }
        break;
        
      case 'authors':
        revalidatePath('/authors');
        revalidateTag('authors');
        revalidatedPaths.push('/authors');
        
        // Get all author slugs and revalidate individual pages (both /authors/slug and /slug)
        try {
          const { data: authors } = await supabase
            .from('authors')
            .select('slug');
          
          if (authors) {
            for (const author of authors) {
              // Revalidate both the /authors/slug and root /slug paths
              const authorPath = `/authors/${author.slug}`;
              const rootPath = `/${author.slug}`;
              revalidatePath(authorPath);
              revalidatePath(rootPath);
              revalidatedPaths.push(authorPath, rootPath);
            }
          }
        } catch (err) {
          console.warn('Failed to revalidate individual author pages:', err);
        }
        break;
        
      case 'categories':
        revalidateTag('categories');
        revalidatedPaths.push('categories');
        
        // Get all category slugs and revalidate individual pages
        try {
          const { data: categories } = await supabase
            .from('categories')
            .select('slug');
          
          if (categories) {
            for (const category of categories) {
              const path = `/category/${category.slug}`;
              revalidatePath(path);
              revalidatedPaths.push(path);
            }
          }
        } catch (err) {
          console.warn('Failed to revalidate individual category pages:', err);
        }
        break;
        
      case 'all':
      default:
        // Revalidate all main paths
        revalidatePath('/');
        revalidatePath('/articles');
        revalidatePath('/briefs');
        revalidatePath('/authors');
        revalidatePath('/explore');
        revalidateTag('articles');
        revalidateTag('briefs');
        revalidateTag('authors');
        revalidateTag('categories');
        revalidatedPaths.push('/', '/articles', '/briefs', '/authors', '/explore');
        
        // Revalidate all individual pages (including drafts for articles and briefs)
        try {
          const [articlesRes, briefsRes, authorsRes, categoriesRes] = await Promise.all([
            supabase.from('articles').select('slug').in('status', ['published', 'draft']),
            supabase.from('briefs').select('slug').in('status', ['published', 'draft']),
            supabase.from('authors').select('slug'),
            supabase.from('categories').select('slug')
          ]);
          
          // Revalidate all article pages
          if (articlesRes.data) {
            for (const article of articlesRes.data) {
              const path = `/articles/${article.slug}`;
              revalidatePath(path);
              revalidatedPaths.push(path);
            }
          }
          
          // Revalidate all brief pages
          if (briefsRes.data) {
            for (const brief of briefsRes.data) {
              const path = `/briefs/${brief.slug}`;
              revalidatePath(path);
              revalidatedPaths.push(path);
            }
          }
          
          // Revalidate all author pages (both /authors/slug and /slug)
          if (authorsRes.data) {
            for (const author of authorsRes.data) {
              const authorPath = `/authors/${author.slug}`;
              const rootPath = `/${author.slug}`;
              revalidatePath(authorPath);
              revalidatePath(rootPath);
              revalidatedPaths.push(authorPath, rootPath);
            }
          }
          
          // Revalidate all category pages
          if (categoriesRes.data) {
            for (const category of categoriesRes.data) {
              const path = `/category/${category.slug}`;
              revalidatePath(path);
              revalidatedPaths.push(path);
            }
          }
        } catch (err) {
          console.warn('Failed to revalidate some individual pages:', err);
        }

        // Force generation of new pages by making HEAD requests to them
        try {
          const baseUrl = process.env.VERCEL_URL ? 
            `https://${process.env.VERCEL_URL}` : 
            process.env.NEXT_PUBLIC_SITE_URL || 'https://bullishbrief.com';
          
          console.log('🔧 Forcing page generation for ALL content...');
          
          // Get ALL content and force generation for any pages that might need updating
          const [articlesRes, briefsRes, authorsRes, categoriesRes] = await Promise.all([
            supabase.from('articles').select('slug').eq('status', 'published'),
            supabase.from('briefs').select('slug').eq('status', 'published'),
            supabase.from('authors').select('slug'),
            supabase.from('categories').select('slug')
          ]);
          
          // Debug: Log the specific articles we're looking for
          console.log('🔍 Articles fetched from database:', articlesRes.data?.length || 0);
          const hasTestArticles = {
            tesla: articlesRes.data?.some(a => a.slug === 'tesla-a-stock-reborn'),
            stockGuide: articlesRes.data?.some(a => a.slug === 'basic-stock-analysis-guide-for-beginners')
          };
          console.log('🎯 Target articles in DB results:', hasTestArticles);
          
          const pagesToGenerate: string[] = [];
          
          // Add all published articles
          if (articlesRes.data) {
            for (const article of articlesRes.data) {
              const url = `${baseUrl}/articles/${article.slug}`;
              pagesToGenerate.push(url);
              
              // Debug: Log our specific target articles
              if (article.slug === 'tesla-a-stock-reborn' || article.slug === 'basic-stock-analysis-guide-for-beginners') {
                console.log(`🎯 Target article URL added: ${url}`);
              }
            }
          }
          
          // Add all published briefs
          if (briefsRes.data) {
            for (const brief of briefsRes.data) {
              pagesToGenerate.push(`${baseUrl}/briefs/${brief.slug}`);
            }
          }
          
          // Add all authors
          if (authorsRes.data) {
            for (const author of authorsRes.data) {
              pagesToGenerate.push(`${baseUrl}/authors/${author.slug}`);
              pagesToGenerate.push(`${baseUrl}/${author.slug}`); // Root level author pages
            }
          }
          
          // Add all categories
          if (categoriesRes.data) {
            for (const category of categoriesRes.data) {
              pagesToGenerate.push(`${baseUrl}/category/${category.slug}`);
            }
          }
          
          // Force generation by making HEAD requests (doesn't transfer body, just triggers generation)
          const generationPromises = pagesToGenerate.map(async (url) => {
            try {
              const response = await fetch(url, { 
                method: 'HEAD',
                headers: { 'User-Agent': 'BuildTrigger/1.0' }
              });
              console.log(`📄 Generated: ${url} (${response.status})`);
              return { url, status: response.status, success: response.ok };
            } catch (error) {
              console.warn(`⚠️ Failed to generate: ${url}`, error);
              return { url, status: 0, success: false, error };
            }
          });
          
          const results = await Promise.allSettled(generationPromises);
          const successCount = results.filter(r => r.status === 'fulfilled' && r.value.success).length;
          const failedResults = results.filter(r => r.status === 'fulfilled' && !r.value.success);
          
          console.log(`✅ Generated ${successCount}/${pagesToGenerate.length} pages`);
          
          // Log summary of what was generated
          const articleCount = pagesToGenerate.filter(url => url.includes('/articles/')).length;
          const briefCount = pagesToGenerate.filter(url => url.includes('/briefs/')).length;
          const authorCount = pagesToGenerate.filter(url => url.includes('/authors/') || (!url.includes('/articles/') && !url.includes('/briefs/') && !url.includes('/category/') && url.split('/').length === 4)).length;
          const categoryCount = pagesToGenerate.filter(url => url.includes('/category/')).length;
          
          console.log(`📊 Generation summary: ${articleCount} articles, ${briefCount} briefs, ${authorCount} authors, ${categoryCount} categories`);
          
          // Log failed pages for debugging
          if (failedResults.length > 0) {
            console.log('❌ Failed pages:');
            failedResults.forEach((result: any) => {
              if (result.status === 'fulfilled' && result.value.url) {
                console.log(`  - ${result.value.url} (${result.value.status})`);
              }
            });
          }
          
          // Log specific articles we're looking for
          const teslaArticle = pagesToGenerate.find(url => url.includes('tesla-a-stock-reborn'));
          const stockGuideArticle = pagesToGenerate.find(url => url.includes('basic-stock-analysis-guide-for-beginners'));
          
          if (teslaArticle) {
            console.log(`🔍 Tesla article will be generated: ${teslaArticle}`);
          } else {
            console.log('❌ Tesla article NOT found in generation list');
          }
          
          if (stockGuideArticle) {
            console.log(`🔍 Stock guide article will be generated: ${stockGuideArticle}`);
          } else {
            console.log('❌ Stock guide article NOT found in generation list');
          }
          
        } catch (generationErr) {
          console.warn('⚠️ Error during page generation:', generationErr);
        }

        // If we have a deploy hook, trigger it for full rebuild as backup
        if (process.env.VERCEL_DEPLOY_HOOK_URL) {
          try {
            const deployResponse = await fetch(process.env.VERCEL_DEPLOY_HOOK_URL, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
            });
            
            if (deployResponse.ok) {
              triggeredDeploy = true;
              console.log('✅ Vercel deployment triggered as backup');
            } else {
              console.warn('⚠️ Failed to trigger Vercel deployment:', deployResponse.statusText);
            }
          } catch (deployErr) {
            console.warn('⚠️ Error triggering Vercel deployment:', deployErr);
          }
        }
        break;
    }

    return NextResponse.json({ 
      success: true,
      message: `Build triggered for ${type}`,
      revalidatedPaths,
      triggeredDeploy,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Error triggering build:', error);
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}
