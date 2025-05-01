import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merges class names using clsx and tailwind-merge
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formats a date as a string with the given format
 * @param date The date to format
 * @param format The format to use (default: 'MMMM dd, yyyy')
 * @returns The formatted date string
 */
export function formatDate(date: Date | string | null | undefined, format = 'MMMM dd, yyyy'): string {
  if (!date) return '';
  
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    if (!(dateObj instanceof Date) || isNaN(dateObj.getTime())) {
      return '';
    }
    
    const options: Intl.DateTimeFormatOptions = {};
    
    if (format.includes('MMMM')) {
      options.month = 'long';
    } else if (format.includes('MMM')) {
      options.month = 'short';
    } else if (format.includes('MM')) {
      options.month = '2-digit';
    }
    
    if (format.includes('dd')) {
      options.day = '2-digit';
    } else if (format.includes('d')) {
      options.day = 'numeric';
    }
    
    if (format.includes('yyyy')) {
      options.year = 'numeric';
    } else if (format.includes('yy')) {
      options.year = '2-digit';
    }
    
    if (format.includes('HH') || format.includes('hh')) {
      options.hour = '2-digit';
      options.minute = '2-digit';
      options.hour12 = format.includes('hh');
    }
    
    return new Intl.DateTimeFormat('en-US', options).format(dateObj);
  } catch (error) {
    console.error('Error formatting date:', error);
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
  if (str.length <= length) return str;
  return str.slice(0, length) + '...';
}

/**
 * Calculates age from birth date
 * @param birthDate Birth date
 * @returns Age in years
 */
export function calculateAge(birthDate: Date | string | null | undefined): number {
  if (!birthDate) return 0;
  
  try {
    const birth = typeof birthDate === 'string' ? new Date(birthDate) : birthDate;
    
    if (!(birth instanceof Date) || isNaN(birth.getTime())) {
      return 0;
    }
    
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
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
  const mins = minutes % 60;
  
  if (hours > 0 && mins > 0) {
    return `${hours}h ${mins}m`;
  } else if (hours > 0) {
    return `${hours}h`;
  } else {
    return `${mins}m`;
  }
}

/**
 * Formats a phone number to a standard format
 * @param phone Phone number string
 * @returns Formatted phone number
 */
export function formatPhoneNumber(phone: string | null | undefined): string {
  if (!phone) return '';
  
  // Remove non-digit characters
  const digits = phone.replace(/\D/g, '');
  
  // Format based on length
  if (digits.length === 10) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  } else if (digits.length === 11 && digits[0] === '1') {
    return `+1 (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`;
  }
  
  return phone;
}
