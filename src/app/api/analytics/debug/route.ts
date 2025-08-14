import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const debugInfo = {
      environment: process.env.NODE_ENV,
      datafastApiKeyConfigured: !!process.env.DATAFAST_API_KEY,
      datafastApiKeyLength: process.env.DATAFAST_API_KEY ? process.env.DATAFAST_API_KEY.length : 0,
      datafastApiKeyPrefix: process.env.DATAFAST_API_KEY ? process.env.DATAFAST_API_KEY.substring(0, 10) + '...' : 'not set',
      availableEnvVars: Object.keys(process.env).filter(key => key.includes('DATAFAST')),
      timestamp: new Date().toISOString()
    };

    return NextResponse.json(debugInfo);
  } catch (error) {
    console.error('Debug API error:', error);
    return NextResponse.json(
      { error: 'Debug API error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
