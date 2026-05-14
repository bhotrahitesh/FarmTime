/**
 * Format date as dd-MMM-yyyy (e.g., 14-May-2026)
 * Uses Indian Standard Time (IST)
 * @param {string|Date} dateString - Date string or Date object
 * @returns {string} Formatted date string
 */
export const formatDate = (dateString) => {
  const date = new Date(dateString);
  // Format using IST timezone
  const day = String(date.getDate()).padStart(2, '0');
  const month = date.toLocaleString('en-IN', { month: 'short', timeZone: 'Asia/Kolkata' });
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
};

/**
 * Format date for display in date pickers (e.g., 14-May-2026)
 * Uses Indian Standard Time (IST)
 * @param {Date} date - Date object
 * @returns {string} Formatted date string
 */
export const formatDateForDisplay = (date) => {
  const day = String(date.getDate()).padStart(2, '0');
  const month = date.toLocaleString('en-IN', { month: 'short', timeZone: 'Asia/Kolkata' });
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
};

/**
 * Get month name from index
 * @param {number} monthIndex - Month index (0-11)
 * @returns {string} Month name
 */
export const getMonthName = (monthIndex) => {
  const months = ['January', 'February', 'March', 'April', 'May', 'June',
                  'July', 'August', 'September', 'October', 'November', 'December'];
  return months[monthIndex];
};

/**
 * Get all month names
 * @returns {string[]} Array of month names
 */
export const getAllMonths = () => {
  return ['January', 'February', 'March', 'April', 'May', 'June',
          'July', 'August', 'September', 'October', 'November', 'December'];
};

/**
 * Get current date in IST timezone
 * @returns {Date} Current date in IST
 */
export const getCurrentISTDate = () => {
  // Get current time in IST
  const now = new Date();
  const istOffset = 5.5 * 60 * 60 * 1000; // IST is UTC+5:30
  const utcTime = now.getTime() + (now.getTimezoneOffset() * 60000);
  return new Date(utcTime + istOffset);
};

/**
 * Format time in 12-hour format with AM/PM (IST)
 * @param {Date} date - Date object
 * @returns {string} Formatted time string (e.g., "02:30 PM")
 */
export const formatTime12Hour = (date) => {
  return date.toLocaleString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
    timeZone: 'Asia/Kolkata'
  });
};

/**
 * Format time in 24-hour format (IST)
 * @param {Date} date - Date object
 * @returns {string} Formatted time string (e.g., "14:30")
 */
export const formatTime24Hour = (date) => {
  return date.toLocaleString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: 'Asia/Kolkata'
  });
};
