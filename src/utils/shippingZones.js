export const shippingZones = {
  domestic: {
    name: 'Domestic',
    zones: [
      { id: 'zone1', name: 'Zone 1', baseRate: 10, ratePerKg: 2 },
      { id: 'zone2', name: 'Zone 2', baseRate: 15, ratePerKg: 2.5 },
      { id: 'zone3', name: 'Zone 3', baseRate: 20, ratePerKg: 3 },
    ],
  },
  international: {
    name: 'International',
    zones: [
      { id: 'intl1', name: 'International Zone 1', baseRate: 30, ratePerKg: 5 },
      { id: 'intl2', name: 'International Zone 2', baseRate: 40, ratePerKg: 6 },
      { id: 'intl3', name: 'International Zone 3', baseRate: 50, ratePerKg: 7 },
    ],
  },
};

export const calculateZoneRate = (zone, weight, dimensions) => {
  const volume = dimensions.length * dimensions.width * dimensions.height;
  const volumetricWeight = volume / 5000;
  const chargeableWeight = Math.max(weight, volumetricWeight);
  
  return zone.baseRate + (chargeableWeight * zone.ratePerKg);
}; 