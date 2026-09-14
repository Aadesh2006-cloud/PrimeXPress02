import { BookingRecord } from '../types';

/**
 * Calculates or retrieves the accurate CAD amount for a cleaning booking.
 * Reflects transparent, fixed-pricing Winnipeg rates based on service type and property size.
 */
export const calculateBookingAmount = (
  serviceType?: string,
  propertyType?: string,
  existingPrice?: number
): number => {
  if (typeof existingPrice === 'number' && existingPrice > 0) {
    return existingPrice;
  }

  const s = (serviceType || '').toLowerCase();
  const p = (propertyType || '').toLowerCase();
  const isCommercial = p.includes('commercial') || s.includes('commercial');

  // Multi-service packages / Combos
  if (
    s.includes('multiple') ||
    (s.includes(',') && s.split(',').length > 1) ||
    s.includes('combo') ||
    s.includes('bundle')
  ) {
    return isCommercial ? 599 : 399;
  }

  // Air Duct Cleaning
  if (s.includes('duct') || s.includes('vent') || s.includes('hvac') || s.includes('furnace')) {
    return isCommercial ? 449 : 279;
  }

  // Carpet Cleaning
  if (s.includes('carpet') || s.includes('rug') || s.includes('steam') || s.includes('upholstery')) {
    return isCommercial ? 249 : 169;
  }

  // Window Cleaning
  if (s.includes('window') || s.includes('glass') || s.includes('pane')) {
    return isCommercial ? 229 : 169;
  }

  // Residential / Move-in / Deep Cleaning
  if (s.includes('residential') || s.includes('deep') || s.includes('move')) {
    return isCommercial ? 349 : 199;
  }

  return isCommercial ? 299 : 199;
};

/**
 * Ensures a booking record always returns a valid numerical amount.
 */
export const getBookingAmount = (booking: Partial<BookingRecord>): number => {
  return calculateBookingAmount(
    booking.serviceType,
    booking.propertyType,
    booking.estimatedPriceCAD
  );
};
