import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { isValidEmail } from '../../../../services/mailchimp';

interface SubmitEmailRequest {
  email: string;
  briefId: string;
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
    const { email, briefId, source = 'popup', userId } = body;

    // Validate required fields
    if (!email || !briefId) {
      return NextResponse.json(
        { success: false, error: 'Email and briefId are required' },
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

    // Check if email already exists for this brief
    const { data: existingEmails, error: checkError } = await supabase
      .from('emails')
      .select('id')
      .eq('email', email)
      .eq('brief_id', briefId);

    if (checkError) {
      console.error('Database check error:', checkError);
      return NextResponse.json(
        { success: false, error: 'Database error' },
        { status: 500 }
      );
    }

    if (existingEmails && existingEmails.length > 0) {
      return NextResponse.json(
        { success: false, error: 'You\'re already subscribed to updates for this brief' },
        { status: 409 }
      );
    }

    // Insert email into database
    const { data: insertedEmail, error: insertError } = await supabase
      .from('emails')
      .insert({
        email,
        brief_id: briefId,
        source,
        user_id: userId || null
      })
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