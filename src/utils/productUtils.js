export const calculateShippingCost = (weight, dimensions) => {
  // Placeholder shipping cost calculation
  return 10;
};

export const generateSKU = (productName, variantName) => {
  return `${productName}-${variantName}`.toLowerCase().replace(/\s+/g, '-');
};

export const generateBulkSKUs = (productName, count) => {
  return Array(count).fill().map((_, i) => {
    const variantNumber = (i + 1).toString().padStart(3, '0');
    return `${productName}-VAR${variantNumber}`.toLowerCase().replace(/\s+/g, '-');
  });
}; 