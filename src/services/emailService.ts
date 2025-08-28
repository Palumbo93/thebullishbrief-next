import { supabase } from '../lib/supabase';
import type { Database } from '../lib/database.types';

type EmailRow = Database['public']['Tables']['emails']['Row'];
type BriefRow = Database['public']['Tables']['briefs']['Row'];

export interface EmailWithBrief extends EmailRow {
  brief?: {
    id: string;
    title: string;
    company_name: string;
  } | null;
}

export interface EmailsByBrief {
  briefId: string | null;
  briefTitle: string;
  companyName?: string;
  emails: EmailWithBrief[];
  count: number;
}

/**
 * Fetch all emails grouped by brief
 */
export async function fetchEmailsGroupedByBrief(): Promise<EmailsByBrief[]> {
  
  // Fetch emails with brief information
  const { data: emails, error } = await supabase
    .from('emails')
    .select(`
      *,
      brief:briefs(
        id,
        title,
        company_name
      )
    `)
    .order('created_date', { ascending: false });

  if (error) {
    console.error('Error fetching emails:', error);
    throw new Error('Failed to fetch emails');
  }

  if (!emails) {
    return [];
  }

  // Group emails by brief
  const emailsByBrief = new Map<string, EmailsByBrief>();

  for (const email of emails) {
    const briefId = email.brief_id || 'no-brief';
    const briefTitle = email.brief?.title || 'No Brief Associated';
    const companyName = email.brief?.company_name;

    if (!emailsByBrief.has(briefId)) {
      emailsByBrief.set(briefId, {
        briefId: email.brief_id,
        briefTitle,
        companyName,
        emails: [],
        count: 0
      });
    }

    const group = emailsByBrief.get(briefId)!;
    group.emails.push(email as EmailWithBrief);
    group.count++;
  }

  // Convert to array and sort by count (descending)
  return Array.from(emailsByBrief.values()).sort((a, b) => b.count - a.count);
}

/**
 * Get email statistics
 */
export async function getEmailStats() {
  
  const { data: emails, error } = await supabase
    .from('emails')
    .select('id, source, created_date');

  if (error) {
    console.error('Error fetching email stats:', error);
    throw new Error('Failed to fetch email statistics');
  }

  if (!emails) {
    return {
      total: 0,
      bySource: {},
      byStatus: {},
      recentCount: 0
    };
  }

  // Calculate stats
  const bySource: Record<string, number> = {};
  const byStatus: Record<string, number> = {};
  const now = new Date();
  const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  let recentCount = 0;

  for (const email of emails) {
    // Count by source
    const source = email.source || 'unknown';
    bySource[source] = (bySource[source] || 0) + 1;

    // Note: mailchimp_status field removed - no longer tracking status

    // Count recent emails
    if (email.created_date && new Date(email.created_date) > last7Days) {
      recentCount++;
    }
  }

  return {
    total: emails.length,
    bySource,
    byStatus,
    recentCount
  };
}
