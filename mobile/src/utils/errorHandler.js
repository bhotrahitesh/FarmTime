/**
 * Extract user-friendly error message from API error response
 * @param {Error} error - The error object from axios
 * @param {string} defaultMessage - Default message if no specific error found
 * @returns {string} User-friendly error message
 */
export const getErrorMessage = (error, defaultMessage = 'An unexpected error occurred') => {
  // Check if it's an axios error with response
  if (error.response) {
    const { data, status } = error.response;
    
    // If backend sent a message field
    if (data?.message) {
      return data.message;
    }
    
    // If backend sent an error field
    if (data?.error) {
      return data.error;
    }
    
    // Handle specific HTTP status codes
    switch (status) {
      case 400:
        return 'Invalid request. Please check your input.';
      case 401:
        return 'Your session has expired. Please login again.';
      case 403:
        return 'You do not have permission to perform this action.';
      case 404:
        return 'Resource not found.';
      case 409:
        return 'This record already exists or conflicts with existing data.';
      case 500:
        return 'Server error. Please try again later.';
      default:
        return defaultMessage;
    }
  }
  
  // Network error
  if (error.request) {
    return 'Network error. Please check your internet connection.';
  }
  
  // Other errors
  return error.message || defaultMessage;
};

/**
 * Show alert with formatted error message
 * @param {string} title - Alert title
 * @param {Error} error - The error object
 * @param {string} defaultMessage - Default message
 */
export const showErrorAlert = (Alert, title, error, defaultMessage) => {
  const message = getErrorMessage(error, defaultMessage);
  Alert.alert(title, message);
};
