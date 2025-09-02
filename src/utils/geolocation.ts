/**
 * Geolocation utility for fetching user country information
 */

export interface GeolocationResponse {
  country: string;
  source: string;
}

/**
 * Fetch user's country from the geolocation API
 * @returns Promise resolving to country code (default: 'CA')
 */
export const fetchUserCountry = async (): Promise<string> => {
  try {
    const response = await fetch('/api/geolocation/brokerages');
    if (!response.ok) {
      throw new Error('Failed to fetch geolocation data');
    }
    
    const data: GeolocationResponse = await response.json();
    return data.country || 'CA';
  } catch (error) {
    console.error('Error fetching user country:', error);
    throw error;
  }
};
