/**
 * Date utilities for consistent formatting across the application
 */

/**
 * Current application standard date format:
 * "4:37 pm Thursday, 10 April 2025 (IST)"
 */

/**
 * Format a date in the application's standard format
 * @param {Date} date - The date to format (defaults to current date/time)
 * @returns {string} Formatted date string
 */
export const formatDate = (date = new Date()) => {
  // Options for time formatting
  const timeOptions = { 
    hour: 'numeric', 
    minute: '2-digit', 
    hour12: true 
  };
  
  // Options for date formatting
  const dateOptions = { 
    weekday: 'long', 
    day: 'numeric', 
    month: 'long', 
    year: 'numeric',
    timeZone: 'Asia/Kolkata' 
  };
  
  // Format the time and date parts
  const timeString = date.toLocaleTimeString('en-US', timeOptions).toLowerCase();
  const dateString = date.toLocaleDateString('en-US', dateOptions);
  
  // Combine into the standard format: "4:37 pm Thursday, 10 April 2025 (IST)"
  return `${timeString} ${dateString} (IST)`;
};

/**
 * Get the current date/time in the application's standard format
 * @returns {string} Current date/time in standard format
 */
export const getCurrentDate = () => {
  return formatDate(new Date());
};

/**
 * Parse a date string in our standard format back to a Date object
 * @param {string} dateString - Date string in our standard format
 * @returns {Date|null} Parsed Date object or null if invalid
 */
export const parseFormattedDate = (dateString) => {
  try {
    // Remove the time and timezone parts to simplify parsing
    const dateWithoutTime = dateString.replace(/^\d+:\d+ [ap]m /, '').replace(/ \(IST\)$/, '');
    return new Date(dateWithoutTime);
  } catch (error) {
    console.error('Error parsing date:', error);
    return null;
  }
};

export default {
  formatDate,
  getCurrentDate,
  parseFormattedDate
};
