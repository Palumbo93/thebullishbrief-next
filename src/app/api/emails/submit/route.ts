import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { isValidEmail } from '../../../../services/mailchimp';

interface SubmitEmailRequest {
  email: string;
  briefId?: string;
  authorId?: string;
  source?: string;
  userId?: string;
}

/**
 * API Route: POST /api/emails/submit
 * Handles email submissions for lead generation with proper authentication bypass
 */
export async function POST(request: NextRequest) {
  try {
    const body: SubmitEmailRequest = await request.json();
    const { email, briefId, authorId, source = 'popup', userId } = body;

    // Validate required fields
    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Email is required' },
        { status: 400 }
      );
    }

    // Validate email format
    if (!isValidEmail(email)) {
      return NextResponse.json(
        { success: false, error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Create Supabase client with service role (bypasses RLS)
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    // Check if email already exists for this brief, author, or general newsletter
    let existingEmailsQuery = supabase
      .from('emails')
      .select('id')
      .eq('email', email);
    
    // If it's a specific brief or author signup, check for duplicates in that context
    if (briefId) {
      existingEmailsQuery = existingEmailsQuery.eq('brief_id', briefId);
    } else if (authorId) {
      existingEmailsQuery = existingEmailsQuery.eq('author_id', authorId);
    } else {
      // For general newsletter, check if email already exists without brief/author association
      existingEmailsQuery = existingEmailsQuery
        .is('brief_id', null)
        .is('author_id', null);
    }

    const { data: existingEmails, error: checkError } = await existingEmailsQuery;

    if (checkError) {
      console.error('Database check error:', checkError);
      return NextResponse.json(
        { success: false, error: 'Database error' },
        { status: 500 }
      );
    }

    if (existingEmails && existingEmails.length > 0) {
      let entityType = 'newsletter';
      if (briefId) entityType = 'brief';
      else if (authorId) entityType = 'author';
      
      return NextResponse.json(
        { success: false, error: `You're already subscribed to updates for this ${entityType}` },
        { status: 409 }
      );
    }

    // Insert email into database
    const insertData: any = {
      email,
      source,
      user_id: userId || null
    };
    
    if (briefId) {
      insertData.brief_id = briefId;
    } else if (authorId) {
      insertData.author_id = authorId;
    }

    const { data: insertedEmail, error: insertError } = await supabase
      .from('emails')
      .insert(insertData)
      .select('id')
      .single();

    if (insertError) {
      console.error('Database insert error:', insertError);
      return NextResponse.json(
        { success: false, error: 'Failed to save email' },
        { status: 500 }
      );
    }

    // Get brief information for Mailchimp sync
    const { data: brief, error: briefError } = await supabase
      .from('briefs')
      .select('mailchimp_audience_tag')
      .eq('id', briefId)
      .single();

    // Note: Mailchimp submission will be handled client-side in useEmailSubmission hook
    // Server-side submission to Mailchimp doesn't work reliably due to CORS and form requirements

    return NextResponse.json({
      success: true,
      emailId: insertedEmail.id
    });

  } catch (error) {
    console.error('Email submission API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}