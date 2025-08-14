import { NextRequest, NextResponse } from 'next/server';
import { datafastApiService } from '../../../../services/datafastApi';

export async function POST(request: NextRequest) {
  console.log('=== API ROUTE CALLED ===');
  console.log('Request method:', request.method);
  console.log('Request URL:', request.url);
  
  try {
    // Parse request body
    const body = await request.json();
    const { goal, properties = {} } = body;

    // Get visitor ID from server-side cookies
    const datafastVisitorId = request.cookies.get('datafast_visitor_id')?.value;
    
    console.log('Goal tracking request received:', { goal, properties });
    console.log('Environment:', process.env.NODE_ENV);
    console.log('API Key configured:', !!process.env.DATAFAST_API_KEY);
    console.log('Visitor ID from cookies:', datafastVisitorId);
    console.log('All cookies:', request.cookies.getAll().map(c => c.name));

    // Validate required fields
    if (!goal || typeof goal !== 'string') {
      return NextResponse.json(
        { error: 'Goal name is required and must be a string' },
        { status: 400 }
      );
    }

    // Validate goal name format
    if (!datafastApiService.validateGoalName(goal)) {
      return NextResponse.json(
        { 
          error: 'Invalid goal name. Must be lowercase letters, numbers, underscores, or hyphens, max 32 characters' 
        },
        { status: 400 }
      );
    }

    // Validate goal properties
    const propertyValidation = datafastApiService.validateGoalProperties(properties);
    if (!propertyValidation.valid) {
      return NextResponse.json(
        { 
          error: 'Invalid goal properties',
          details: propertyValidation.errors 
        },
        { status: 400 }
      );
    }

    // Check if API key is configured
    if (!process.env.DATAFAST_API_KEY) {
      console.error('DATAFAST_API_KEY not configured');
      console.error('Available env vars:', Object.keys(process.env).filter(key => key.includes('DATAFAST')));
      return NextResponse.json(
        { error: 'Analytics service not configured - DATAFAST_API_KEY missing' },
        { status: 500 }
      );
    }

    // Track goal with Datafa.st API
    console.log('Calling Datafa.st API with:', { goal, properties });
    
    // Use visitor ID from server-side cookies, not from client properties
    const result = await datafastApiService.trackGoal(goal, {
      datafast_visitor_id: datafastVisitorId,
      ...properties
    });
    console.log('Datafa.st API result:', result);

    if (result.status === 'error') {
      console.error('Datafa.st goal tracking failed:', result.error);
      
      // Return appropriate error response
      if (result.error?.code === 401) {
        return NextResponse.json(
          { error: 'Analytics service authentication failed' },
          { status: 500 }
        );
      }
      
      if (result.error?.code === 429) {
        return NextResponse.json(
          { error: 'Analytics service rate limited' },
          { status: 429 }
        );
      }

      return NextResponse.json(
        { error: 'Analytics service error', details: result.error },
        { status: 500 }
      );
    }

    // Log successful goal tracking in development
    if (process.env.NODE_ENV === 'development') {
      console.log('Goal tracked successfully:', { goal, properties });
    }

    return NextResponse.json(
      { status: 'success', message: 'Goal tracked successfully' },
      { status: 200 }
    );

  } catch (error) {
    console.error('Goal tracking API error:', error);
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Handle unsupported methods
export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}

export async function PUT() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}

export async function DELETE() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}
