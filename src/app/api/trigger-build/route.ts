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
        revalidatedPaths.push('/', '/articles', '/briefs', '/authors', '/explore');
        
        // Revalidate all individual pages (including drafts for articles and briefs)
        try {
          const [articlesRes, briefsRes, authorsRes] = await Promise.all([
            supabase.from('articles').select('slug').in('status', ['published', 'draft']),
            supabase.from('briefs').select('slug').in('status', ['published', 'draft']),
            supabase.from('authors').select('slug')
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
        } catch (err) {
          console.warn('Failed to revalidate some individual pages:', err);
        }

        // If we have a deploy hook, trigger it for full rebuild
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
              console.log('✅ Vercel deployment triggered');
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
