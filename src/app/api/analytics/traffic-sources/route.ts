import { NextRequest, NextResponse } from 'next/server';
import { ClarityApiService } from '../../../../services/clarityApi';

// Initialize service with secure token
const clarityService = new ClarityApiService(
  'eyJhbGciOiJSUzI1NiIsImtpZCI6IjQ4M0FCMDhFNUYwRDMxNjdEOTRFMTQ3M0FEQTk2RTcyRDkwRUYwRkYiLCJ0eXAiOiJKV1QifQ.eyJqdGkiOiJlYzAwMWViYi05ODg0LTQwNmYtYWNkYy1lZmViYjdjYWFmYTciLCJzdWIiOiIyOTQ2NTkyNDg1NDA3MTIxIiwic2NvcGUiOiJEYXRhLkV4cG9ydCIsIm5iZiI6MTc1NzQyNDg2MSwiZXhwIjo0OTExMDI0ODYxLCJpYXQiOjE3NTc0MjQ4NjEsImlzcyI6ImNsYXJpdHkiLCJhdWQiOiJjbGFyaXR5LmRhdGEtZXhwb3J0ZXIifQ.H-4xyGuUBzEqzwkTzAVuikRef3qiBCNpdas1OgheKlHIH-4yAfjx33X16weq4Xi-Nw2yEGWbYn-k3_JvDCgbxJ8BnGU8UYT_2HzAvvJHNg3xZ28i0Vn_ksIPMcWICOs5nZLwRCjgFIdeNVGpAf8p-e5YaaI4ZwGL0F_UYYCH7jog0Ufcl3RirjZBGblbsbkxgsHWQcPN_rj1D5btiwUajRuazkdokdrLKVcRlnQlWDj5mmZYW301MkQ3yVv2SjuLNSR5zJhsDT5iVoQ1wqSZMJxICRhr5-8gMDhP2OD8ATV4MmRCZniCKNFzMIkgFeuzMppv2eivXJJFXDqRK47Drg'
);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const numOfDaysParam = searchParams.get('numOfDays');
    const pageParam = searchParams.get('page');
    
    // Parse and validate numOfDays parameter
    let numOfDays: 1 | 2 | 3 = 3; // Default to 3 days
    if (numOfDaysParam) {
      const parsed = parseInt(numOfDaysParam);
      if ([1, 2, 3].includes(parsed)) {
        numOfDays = parsed as 1 | 2 | 3;
      }
    }

    console.log('API Route: Fetching data for', numOfDays, 'days', pageParam ? `for page: ${pageParam}` : '');

    const data = await clarityService.getTrafficSourceData(numOfDays, pageParam || undefined);
    
    return NextResponse.json({ 
      success: true, 
      data,
      numOfDays
    });

  } catch (error) {
    console.error('Traffic source API error:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}

// Optional: Add POST method for more complex queries
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { numOfDays = 3, page } = body;

    // Validate numOfDays
    if (![1, 2, 3].includes(numOfDays)) {
      return NextResponse.json(
        { success: false, error: 'numOfDays must be 1, 2, or 3' },
        { status: 400 }
      );
    }

    const data = await clarityService.getTrafficSourceData(numOfDays as 1 | 2 | 3, page);
    
    return NextResponse.json({ 
      success: true, 
      data,
      numOfDays
    });

  } catch (error) {
    console.error('Traffic source API error:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}
