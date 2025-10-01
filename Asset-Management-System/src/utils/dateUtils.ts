import { format } from "date-fns";

/**
 * Safely formats a date string, returning the original string if invalid
 * @param dateString - The date string to format
 * @param formatString - The format string (default: "MMM dd, yyyy")
 * @returns Formatted date string or original string if invalid
 */
export const safeFormatDate = (
  dateString: string,
  formatString: string = "MMM dd, yyyy"
): string => {
  try {
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? dateString : format(date, formatString);
  } catch {
    return dateString;
  }
};

/**
 * Checks if a date string is valid
 * @param dateString - The date string to validate
 * @returns true if valid, false otherwise
 */
export const isValidDate = (dateString: string): boolean => {
  try {
    const date = new Date(dateString);
    return !isNaN(date.getTime());
  } catch {
    return false;
  }
};

/**
 * Safely creates a Date object from a string
 * @param dateString - The date string
 * @returns Date object or null if invalid
 */
export const safeCreateDate = (dateString: string): Date | null => {
  try {
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? null : date;
  } catch {
    return null;
  }
};
