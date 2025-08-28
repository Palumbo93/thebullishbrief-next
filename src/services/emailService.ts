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
  author?: {
    id: string;
    name: string;
    slug: string;
  } | null;
}

export interface EmailsByEntity {
  id: string | null;
  type: 'brief' | 'author' | 'unassigned';
  title: string;
  subtitle?: string; // company name for briefs, author slug for authors
  emails: EmailWithBrief[];
  count: number;
}

// Keep the old interface for backward compatibility
export interface EmailsByBrief extends EmailsByEntity {
  briefId: string | null;
  briefTitle: string;
  companyName?: string;
}

/**
 * Fetch all emails grouped by brief
 */
export async function fetchEmailsGroupedByBrief(): Promise<EmailsByBrief[]> {
  
  // Fetch emails with brief and author information
  const { data: emails, error } = await supabase
    .from('emails')
    .select(`
      *,
      brief:briefs(
        id,
        title,
        company_name
      ),
      author:authors(
        id,
        name,
        slug
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
        count: 0,
        // Required fields from EmailsByEntity
        id: email.brief_id,
        type: email.brief_id ? 'brief' : 'unassigned',
        title: briefTitle,
        subtitle: companyName
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
 * Fetch all emails grouped by both briefs and authors
 */
export async function fetchEmailsGroupedByEntity(): Promise<EmailsByEntity[]> {
  // Fetch emails with brief and author information
  const { data: emails, error } = await supabase
    .from('emails')
    .select(`
      *,
      brief:briefs(
        id,
        title,
        company_name
      ),
      author:authors(
        id,
        name,
        slug
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

  // Group emails by entity (brief or author)
  const emailsByEntity = new Map<string, EmailsByEntity>();

  for (const email of emails) {
    let entityKey: string;
    let entity: EmailsByEntity;

    if (email.brief_id && email.brief) {
      // Brief-associated email
      entityKey = `brief-${email.brief_id}`;
      entity = {
        id: email.brief_id,
        type: 'brief',
        title: email.brief.title,
        subtitle: email.brief.company_name || undefined,
        emails: [],
        count: 0
      };
    } else if (email.author_id && email.author) {
      // Author-associated email
      entityKey = `author-${email.author_id}`;
      entity = {
        id: email.author_id,
        type: 'author',
        title: email.author.name,
        subtitle: `@${email.author.slug}`,
        emails: [],
        count: 0
      };
    } else {
      // Unassigned email
      entityKey = 'unassigned';
      entity = {
        id: null,
        type: 'unassigned',
        title: 'Unassigned',
        subtitle: 'No brief or author associated',
        emails: [],
        count: 0
      };
    }

    if (!emailsByEntity.has(entityKey)) {
      emailsByEntity.set(entityKey, entity);
    }

    const group = emailsByEntity.get(entityKey)!;
    group.emails.push(email as EmailWithBrief);
    group.count++;
  }

  // Convert to array and sort by count (descending)
  return Array.from(emailsByEntity.values()).sort((a, b) => b.count - a.count);
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
