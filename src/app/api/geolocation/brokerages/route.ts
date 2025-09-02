/**
 * Geolocation API Route for Brokerage Widget
 * 
 * Uses IPinfo Lite to detect user's country and return appropriate brokerage configuration
 * Caches results to minimize API calls and improve performance
 */

import { NextRequest, NextResponse } from 'next/server';

// Simple in-memory cache for country detection results
// In production, consider using Redis for better scalability
const countryCache = new Map<string, { country: string; timestamp: number }>();
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

/**
 * Get client IP address from request headers
 */
function getClientIP(request: NextRequest): string {
  // Check various headers for the real IP
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  const cfConnectingIP = request.headers.get('cf-connecting-ip');
  
  if (forwarded) {
    // x-forwarded-for can contain multiple IPs, take the first one
    return forwarded.split(',')[0].trim();
  }
  
  if (realIP) {
    return realIP;
  }
  
  if (cfConnectingIP) {
    return cfConnectingIP;
  }
  
  // Fallback to localhost for development
  return '127.0.0.1';
}

/**
 * Fetch country from IPinfo Lite API
 */
async function fetchCountryFromIP(ip: string): Promise<string> {
  try {
    const token = process.env.IPINFO_TOKEN || 'cb6e27f2e4a175';
    const response = await fetch(`https://ipinfo.io/${ip}?token=${token}`, {
      headers: {
        'User-Agent': 'TheBullishBrief/1.0',
      },
      // Add timeout to prevent hanging requests
      signal: AbortSignal.timeout(3000),
    });

    if (!response.ok) {
      throw new Error(`IPinfo API error: ${response.status}`);
    }

    const data = await response.json();
    
    // IPinfo returns country field
    return data.country || 'CA'; // Default to Canada if no country code
  } catch (error) {
    console.error('Error fetching country from IPinfo:', error);
    return 'CA'; // Default to Canada on error
  }
}

/**
 * Get cached country or fetch from API
 */
async function getCountryForIP(ip: string): Promise<string> {
  // Check cache first
  const cached = countryCache.get(ip);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.country;
  }

  // Fetch from API
  const country = await fetchCountryFromIP(ip);
  
  // Cache the result
  countryCache.set(ip, {
    country,
    timestamp: Date.now(),
  });

  return country;
}

/**
 * GET /api/geolocation/brokerages
 * Returns the user's country code for brokerage filtering
 */
export async function GET(request: NextRequest) {
  try {
    const ip = getClientIP(request);
    
    // Skip geolocation for localhost/development
    if (ip === '127.0.0.1' || ip === '::1' || ip.startsWith('192.168.') || ip.startsWith('10.')) {
      return NextResponse.json({ 
        country: 'CA', // Default to Canada for development
        source: 'development'
      });
    }

    const country = await getCountryForIP(ip);
    
    return NextResponse.json({ 
      country,
      source: 'ipinfo'
    });
  } catch (error) {
    console.error('Error in geolocation API:', error);
    
    // Return fallback response
    return NextResponse.json({ 
      country: 'CA', // Default to Canada
      source: 'fallback'
    });
  }
}

/**
 * POST /api/geolocation/brokerages
 * Allows manual country override (for testing or user preference)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { country, ip } = body;
    
    if (!country || !ip) {
      return NextResponse.json(
        { error: 'Country and IP are required' },
        { status: 400 }
      );
    }

    // Validate country code (basic validation)
    if (!/^[A-Z]{2}$/.test(country)) {
      return NextResponse.json(
        { error: 'Invalid country code format' },
        { status: 400 }
      );
    }

    // Cache the manual override
    countryCache.set(ip, {
      country,
      timestamp: Date.now(),
    });

    return NextResponse.json({ 
      country,
      source: 'manual'
    });
  } catch (error) {
    console.error('Error in manual geolocation override:', error);
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
