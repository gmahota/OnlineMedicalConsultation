import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, formatDistance, parseISO } from "date-fns";

/**
 * Merges class names using clsx and tailwind-merge
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formats a date as a string with the given format
 * @param date The date to format
 * @param formatStr The format to use (default: 'MMMM dd, yyyy')
 * @returns The formatted date string
 */
export function formatDate(date: Date | string | null | undefined, formatStr = 'MMMM dd, yyyy'): string {
  if (!date) return '';
  
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return format(dateObj, formatStr);
  } catch (error) {
    console.error('Error formatting date:', error);
    return '';
  }
}

/**
 * Returns a relative time string (e.g., "5 minutes ago")
 * @param date The date to format
 * @param baseDate The base date to compare against (default: now)
 * @returns The relative time string
 */
export function formatRelativeTime(date: Date | string | null | undefined, baseDate = new Date()): string {
  if (!date) return '';
  
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return formatDistance(dateObj, baseDate, { addSuffix: true });
  } catch (error) {
    console.error('Error formatting relative time:', error);
    return '';
  }
}

/**
 * Truncates a string to the given length
 * @param str The string to truncate
 * @param length The maximum length of the string
 * @returns The truncated string
 */
export function truncateString(str: string, length: number): string {
  if (!str) return '';
  return str.length > length ? `${str.substring(0, length)}...` : str;
}

/**
 * Calculates age from birth date
 * @param birthDate Birth date
 * @returns Age in years
 */
export function calculateAge(birthDate: Date | string | null | undefined): number {
  if (!birthDate) return 0;
  
  try {
    const birthDateObj = typeof birthDate === 'string' ? parseISO(birthDate) : birthDate;
    const today = new Date();
    let age = today.getFullYear() - birthDateObj.getFullYear();
    const m = today.getMonth() - birthDateObj.getMonth();
    
    if (m < 0 || (m === 0 && today.getDate() < birthDateObj.getDate())) {
      age--;
    }
    
    return age;
  } catch (error) {
    console.error('Error calculating age:', error);
    return 0;
  }
}

/**
 * Formats a duration in minutes as hours and minutes
 * @param minutes Total minutes
 * @returns Formatted duration string (e.g., '1h 30m')
 */
export function formatDuration(minutes: number): string {
  if (!minutes || minutes <= 0) return '0m';
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  if (hours === 0) return `${remainingMinutes}m`;
  if (remainingMinutes === 0) return `${hours}h`;
  
  return `${hours}h ${remainingMinutes}m`;
}

/**
 * Formats a phone number to a standard format
 * @param phone Phone number string
 * @returns Formatted phone number
 */
export function formatPhoneNumber(phone: string | null | undefined): string {
  if (!phone) return '';
  
  // Remove all non-numeric characters
  const cleaned = phone.replace(/\D/g, '');
  
  // Format based on length
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6, 10)}`;
  } else if (cleaned.length === 11) {
    return `+${cleaned.slice(0, 1)} (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7, 11)}`;
  }
  
  // If it doesn't match expected formats, return as is
  return phone;
}