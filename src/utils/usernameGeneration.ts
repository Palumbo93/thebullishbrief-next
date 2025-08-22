import { supabase } from '../lib/supabase';

/**
 * Sanitizes an email prefix to create a valid username
 * - Removes special characters except underscores
 * - Converts to lowercase
 * - Ensures minimum 3 character length
 * - Respects maximum 20 character length
 */
export const sanitizeUsername = (input: string): string => {
  if (!input || input.trim() === '') {
    return 'user';
  }

  let sanitized = input
    .toLowerCase()
    .replace(/[^a-zA-Z0-9_]/g, '') // Remove special characters except underscores
    .substring(0, 20); // Respect max length from validation

  // Ensure minimum length of 3 characters
  if (sanitized.length < 3) {
    sanitized = sanitized.padEnd(3, '0');
  }

  // If still empty after sanitization, use default
  if (sanitized === '') {
    return 'user';
  }

  return sanitized;
};

/**
 * Checks if a username is already taken in the database
 */
export const isUsernameTaken = async (username: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('id')
      .eq('username', username)
      .single();

    if (error && error.code === 'PGRST116') {
      // No rows returned - username is available
      return false;
    }

    if (error) {
      console.error('Error checking username availability:', error);
      // In case of error, assume username is taken to be safe
      return true;
    }

    // If we got data, username is taken
    return !!data;
  } catch (error) {
    console.error('Error checking username availability:', error);
    // In case of error, assume username is taken to be safe
    return true;
  }
};

/**
 * Generates a unique username from an email address
 * Uses incremental numbering for conflict resolution (john, john2, john3, etc.)
 */
export const generateUsername = async (email: string): Promise<string> => {
  if (!email || !email.includes('@')) {
    throw new Error('Invalid email address provided');
  }

  const emailPrefix = email.split('@')[0];
  const baseUsername = sanitizeUsername(emailPrefix);
  
  // Start with the base username
  let username = baseUsername;
  let counter = 1;
  
  // Check if base username is available
  let isTaken = await isUsernameTaken(username);
  
  // If taken, try with incremental numbers
  while (isTaken) {
    counter++;
    username = `${baseUsername}${counter}`;
    isTaken = await isUsernameTaken(username);
    
    // Safety check to prevent infinite loops
    if (counter > 999) {
      // Fall back to a random suffix if we can't find an available username
      const randomSuffix = Math.floor(Math.random() * 10000);
      username = `${baseUsername}_${randomSuffix}`;
      break;
    }
  }
  
  return username;
};

/**
 * Validates that a generated username meets our requirements
 * This is a safety check before using the username
 */
export const validateGeneratedUsername = (username: string): boolean => {
  // Must be at least 3 characters
  if (username.length < 3) {
    return false;
  }
  
  // Must be at most 20 characters (from existing validation rules)
  if (username.length > 20) {
    return false;
  }
  
  // Must contain only letters, numbers, and underscores
  if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    return false;
  }
  
  return true;
};

/**
 * Main function to generate a username from email with all safety checks
 * This is the primary function to use in the sign-up flow
 */
export const generateUsernameFromEmail = async (email: string): Promise<string> => {
  try {
    const username = await generateUsername(email);
    
    // Validate the generated username
    if (!validateGeneratedUsername(username)) {
      throw new Error('Generated username does not meet validation requirements');
    }
    
    return username;
  } catch (error) {
    console.error('Error generating username from email:', error);
    
    // Fallback: return sanitized email prefix, let database handle conflicts
    const fallbackUsername = sanitizeUsername(email.split('@')[0]);
    
    if (validateGeneratedUsername(fallbackUsername)) {
      return fallbackUsername;
    }
    
    // Final fallback
    return 'user';
  }
};
