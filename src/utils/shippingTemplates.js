export const shippingTemplates = {
  standard: {
    name: 'Standard Shipping',
    baseRate: 10,
    ratePerKg: 2,
    handlingFee: 5,
    rules: {
      maxWeight: 20,
      maxDimensions: {
        length: 100,
        width: 50,
        height: 50,
      },
      restrictions: ['flammable', 'fragile'],
    },
  },
  express: {
    name: 'Express Shipping',
    baseRate: 20,
    ratePerKg: 4,
    handlingFee: 10,
    rules: {
      maxWeight: 10,
      maxDimensions: {
        length: 80,
        width: 40,
        height: 40,
      },
      restrictions: ['flammable'],
    },
  },
  bulk: {
    name: 'Bulk Shipping',
    baseRate: 30,
    ratePerKg: 1.5,
    handlingFee: 15,
    rules: {
      minWeight: 20,
      maxWeight: 100,
      maxDimensions: {
        length: 200,
        width: 100,
        height: 100,
      },
      restrictions: ['perishable'],
    },
  },
};

export const applyShippingTemplate = (template, weight, dimensions) => {
  const { baseRate, ratePerKg, handlingFee, rules } = shippingTemplates[template];
  
  // Validate weight and dimensions
  if (weight > rules.maxWeight || (rules.minWeight && weight < rules.minWeight)) {
    throw new Error('Weight outside allowed range');
  }
  
  if (dimensions.length > rules.maxDimensions.length ||
      dimensions.width > rules.maxDimensions.width ||
      dimensions.height > rules.maxDimensions.height) {
    throw new Error('Dimensions exceed maximum allowed');
  }
  
  return baseRate + (weight * ratePerKg) + handlingFee;
}; 