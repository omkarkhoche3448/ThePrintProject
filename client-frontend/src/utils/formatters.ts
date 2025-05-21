// Utility function to format order IDs consistently across the application
// This ensures that all order IDs are displayed in the same format: "Order #fc35ab"

/**
 * Formats an order ID to a user-friendly display format
 * @param {string} orderId - The raw order ID from the database
 * @returns {string} Formatted order ID for display
 */
export const formatOrderId = (orderId: string): string => {
  // If orderId is undefined or null, return a placeholder
  if (!orderId) return 'Order #------';
  
  // If it's already in the short format, just return it with the prefix
  if (orderId.length <= 8) {
    return `Order #${orderId}`;
  }
  
  // If it's in the old format (ORDER-timestamp-random), extract the last 6 characters
  if (orderId.startsWith('ORDER-')) {
    const parts = orderId.split('-');
    // Get last part or the last 6 characters if there's only one part
    const shortId = parts.length > 1 
      ? parts[parts.length - 1].substring(0, 6)
      : orderId.substring(Math.max(0, orderId.length - 6));
    
    return `Order #${shortId}`;
  }
  
  // For any other format, use the last 6 characters
  return `Order #${orderId.substring(Math.max(0, orderId.length - 6))}`;
};

/**
 * Calculates and formats the total number of pages in a print job
 * @param {Array} files - An array of file objects from the print job
 * @param {Object} order - Optional order object containing pricing information
 * @returns {string} Formatted page count for display
 */
export const formatPageCount = (files: any[], order?: any): string => {
  // If order has pricing.totalPages, use that value directly
  if (order && order.pricing && typeof order.pricing.totalPages === 'number') {
    return `Pages: ${order.pricing.totalPages}`;
  }
  
  if (!files || !Array.isArray(files)) return 'Pages: Unknown';
  
  // Calculate the total pages from all files in the job
  let totalPages = 0;
  
  files.forEach((file: any) => {
    // Check various locations for page count
    if (file.printConfig && typeof file.printConfig.pageCount === 'number') {
      totalPages += file.printConfig.pageCount;
    } else if (typeof file.pageCount === 'number') {
      totalPages += file.pageCount;
    }
  });
  
  return `Pages: ${totalPages > 0 ? totalPages : 'Unknown'}`;
};

/**
 * Formats the priority status of a print job
 * @param {any} printJob - The print job object
 * @returns {string} Formatted priority status for display
 */
export const formatPriorityStatus = (printJob: any): string => {
  if (!printJob) return 'Priority: No';
  
  // Check if the job has pricing with priorityFee
  if (printJob.pricing && printJob.pricing.priorityFee && printJob.pricing.priorityFee > 0) {
    return 'Priority: Yes';
  }
  
  // Check if the job has shopkeeper priority
  if (printJob.pricing && printJob.pricing.isShopkeeperPriority) {
    return 'Priority: Yes (Shopkeeper)';
  }
  
  // Check if the job has priority information directly
  if (typeof printJob.isPriority === 'boolean') {
    return `Priority: ${printJob.isPriority ? 'Yes' : 'No'}`;
  }
  
  // Check if the priority is in printConfig
  if (printJob.printConfig && typeof printJob.printConfig.isPriority === 'boolean') {
    return `Priority: ${printJob.printConfig.isPriority ? 'Yes' : 'No'}`;
  }
    
  // Check if there are files with priority config
  if (printJob.files && Array.isArray(printJob.files)) {
    const hasPriorityFile = printJob.files.some((file: any) => 
      file.printConfig && file.printConfig.isPriority === true
    );
    if (hasPriorityFile) {
      return 'Priority: Yes';
    }
  }
  
  // Check if there's a numeric priority value (lower values indicate higher priority)
  if (printJob.printConfig && typeof printJob.printConfig.priority === 'number') {
    return `Priority: ${printJob.printConfig.priority < 90 ? 'Yes' : 'No'}`;
  }
  
  return 'Priority: No';
};
