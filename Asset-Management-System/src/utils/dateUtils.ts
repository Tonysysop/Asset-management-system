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

/**
 * Parses a date string that might be in "October 15th, 2025" format or other formats
 * @param dateString - The date string to parse
 * @returns Date object or null if invalid
 */
export const parseDateString = (dateString: string): Date | null => {
  if (!dateString) return null;

  try {
    // First try standard Date parsing
    let date = new Date(dateString);
    if (!isNaN(date.getTime())) {
      return date;
    }

    // Try parsing "October 15th, 2025" format
    const formattedDateRegex =
      /^([A-Za-z]+)\s+(\d+)(?:st|nd|rd|th),\s+(\d{4})$/;
    const match = dateString.match(formattedDateRegex);

    if (match) {
      const [, monthName, day, year] = match;
      const months = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
      ];

      const monthIndex = months.findIndex(
        (m) => m.toLowerCase() === monthName.toLowerCase()
      );

      if (monthIndex !== -1) {
        date = new Date(parseInt(year), monthIndex, parseInt(day));
        if (!isNaN(date.getTime())) {
          return date;
        }
      }
    }

    return null;
  } catch {
    return null;
  }
};
