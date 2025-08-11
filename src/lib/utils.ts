import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Generates a URL-friendly slug from a given string
 * @param text - The text to convert to a slug
 * @returns A URL-friendly slug
 */
export const generateSlug = (text: string): string => {
  if (!text) return '';
  
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters except spaces and hyphens
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
};

/**
 * Checks if a slug is unique in a given table
 * @param table - The table name to check
 * @param slug - The slug to check
 * @param excludeId - Optional ID to exclude from the check (for updates)
 * @returns Promise<boolean> - True if slug is unique
 */
export const isSlugUnique = async (
  table: string, 
  slug: string, 
  excludeId?: string
): Promise<boolean> => {
  try {
    const { supabase } = await import('./supabase');
    
    const { data, error } = await supabase
      .from(table)
      .select('id')
      .eq('slug', slug)
      .neq('id', excludeId || '')
      .limit(1);

    if (error) {
      console.error(`Error checking slug uniqueness in ${table}:`, error);
      return false;
    }

    return !data || data.length === 0;
  } catch (error) {
    console.error(`Error checking slug uniqueness in ${table}:`, error);
    return false;
  }
};

/**
 * Generates a unique slug by appending numbers if needed
 * @param table - The table name to check
 * @param baseSlug - The base slug to make unique
 * @param excludeId - Optional ID to exclude from the check (for updates)
 * @returns Promise<string> - A unique slug
 */
export const generateUniqueSlug = async (
  table: string,
  baseSlug: string,
  excludeId?: string
): Promise<string> => {
  if (!baseSlug) return '';
  
  let uniqueSlug = baseSlug;
  let counter = 1;
  
  while (!(await isSlugUnique(table, uniqueSlug, excludeId))) {
    uniqueSlug = `${baseSlug}-${counter}`;
    counter++;
  }
  
  return uniqueSlug;
}; 