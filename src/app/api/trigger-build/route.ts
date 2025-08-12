import { revalidatePath, revalidateTag } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // Get the request body
    const body = await request.json();
    const { type = 'all' } = body;

    console.log(`🔄 Triggering build for type: ${type}`);

    // Revalidate based on type
    switch (type) {
      case 'articles':
        revalidatePath('/articles');
        revalidateTag('articles');
        console.log('✅ Revalidated articles');
        break;
        
      case 'briefs':
        revalidatePath('/briefs');
        revalidateTag('briefs');
        console.log('✅ Revalidated briefs');
        break;
        
      case 'all':
      default:
        revalidatePath('/articles');
        revalidatePath('/briefs');
        revalidateTag('articles');
        revalidateTag('briefs');
        console.log('✅ Revalidated all content');
        break;
    }

    return NextResponse.json({ 
      success: true,
      message: `Build triggered for ${type}`,
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
