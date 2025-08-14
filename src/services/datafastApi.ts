/**
 * Datafa.st API Client Service
 * Handles server-side goal tracking and visitor data retrieval
 */

export interface DatafastGoal {
  goal: string;
  properties?: Record<string, any>;
}

export interface DatafastApiResponse {
  status: 'success' | 'error';
  data?: any;
  error?: {
    code: number;
    message: string;
  };
}

export class DatafastApiService {
  private apiKey: string;
  private baseUrl: string = 'https://datafa.st/api/v1';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  /**
   * Track a custom goal
   */
  async trackGoal(goal: string, properties?: Record<string, any>): Promise<DatafastApiResponse> {
    try {
      // Get visitor ID from properties
      const visitorId = properties?.datafast_visitor_id;
      
      if (!visitorId) {
        return {
          status: 'error',
          error: {
            code: 400,
            message: 'datafast_visitor_id is required - visitor may not have any pageviews yet',
          },
        };
      }

      // Remove visitor ID from metadata to avoid duplication
      const { datafast_visitor_id, ...metadata } = properties || {};

      const response = await fetch(`${this.baseUrl}/goals`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          datafast_visitor_id: visitorId,
          name: goal,
          metadata: metadata,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('Datafa.st API error:', data);
        return {
          status: 'error',
          error: {
            code: response.status,
            message: data.error?.message || `HTTP ${response.status}`,
          },
        };
      }

      return {
        status: 'success',
        data,
      };
    } catch (error) {
      console.error('Datafa.st API request failed:', error);
      return {
        status: 'error',
        error: {
          code: 500,
          message: error instanceof Error ? error.message : 'Unknown error',
        },
      };
    }
  }

  /**
   * Get visitor data
   */
  async getVisitor(visitorId: string): Promise<DatafastApiResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/visitor/${visitorId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('Datafa.st API error:', data);
        return {
          status: 'error',
          error: {
            code: response.status,
            message: data.error?.message || `HTTP ${response.status}`,
          },
        };
      }

      return {
        status: 'success',
        data,
      };
    } catch (error) {
      console.error('Datafa.st API request failed:', error);
      return {
        status: 'error',
        error: {
          code: 500,
          message: error instanceof Error ? error.message : 'Unknown error',
        },
      };
    }
  }

  /**
   * Validate goal name according to Datafa.st rules
   */
  validateGoalName(goal: string): boolean {
    // Rules: lowercase letters, numbers, underscores, hyphens, max 32 characters
    const goalRegex = /^[a-z0-9_-]{1,32}$/;
    return goalRegex.test(goal);
  }

  /**
   * Validate goal properties according to Datafa.st rules
   */
  validateGoalProperties(properties: Record<string, any>): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Check number of properties (max 10)
    const propertyKeys = Object.keys(properties);
    if (propertyKeys.length > 10) {
      errors.push('Maximum 10 custom parameters allowed');
    }

    // Validate each property
    for (const [key, value] of Object.entries(properties)) {
      // Property name validation: lowercase, numbers, underscores, hyphens, max 32 chars
      if (!/^[a-z0-9_-]{1,32}$/.test(key)) {
        errors.push(`Invalid property name: ${key}`);
      }

      // Property value validation: any string, max 255 chars
      if (typeof value !== 'string') {
        errors.push(`Property value must be string: ${key}`);
      } else if (value.length > 255) {
        errors.push(`Property value too long (max 255 chars): ${key}`);
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}

// Export singleton instance
export const datafastApiService = new DatafastApiService(
  process.env.DATAFAST_API_KEY || ''
);
