import { ClientType, PricingTier } from '@envios-ya/shared';

export interface PricingCalculationResult {
  basePrice: number;
  distancePrice: number;
  weightPrice: number;
  surcharges: number;
  subtotal: number;
  discount: number;
  totalDeliveryPrice: number; // Final price billed to client
  driverCommission: number; // Amount driver earns
}

/**
 * Calculates delivery costs and driver commissions.
 * Pricing defaults in Quetzales (GTQ).
 */
export function calculateDeliveryPricing(params: {
  distanceKm: number;
  weightKg?: number;
  requiresRefrigeration?: boolean;
  clientType?: ClientType;
  pricingTier?: PricingTier;
}): PricingCalculationResult {
  const {
    distanceKm,
    weightKg = 0,
    requiresRefrigeration = false,
    pricingTier = 'standard',
  } = params;

  // Base parameters
  const BASE_FARE = 15.0; // Q15 base fare
  const COST_PER_KM = 3.5; // Q3.5 per kilometer
  const OVERWEIGHT_LIMIT = 5.0; // Over 5kg is extra
  const COST_PER_EXTRA_KG = 2.0; // Q2 per extra kg
  const REFRIGERATION_SURCHARGE = 10.0; // Q10 extra for cold packages

  // Basic calculation
  const basePrice = BASE_FARE;
  const distancePrice = distanceKm * COST_PER_KM;
  
  const excessWeight = Math.max(0, weightKg - OVERWEIGHT_LIMIT);
  const weightPrice = excessWeight * COST_PER_EXTRA_KG;

  const surcharges = requiresRefrigeration ? REFRIGERATION_SURCHARGE : 0;
  
  const subtotal = basePrice + distancePrice + weightPrice + surcharges;

  // Client tier discount
  let discount = 0;
  if (pricingTier === 'premium_partner') {
    discount = subtotal * 0.15; // 15% discount for premium corporate contracts (hotels, major restaurants)
  }

  const totalDeliveryPrice = Math.round((subtotal - discount) * 100) / 100;

  // Driver Commission splits: drivers receive 75% of delivery cost
  const DRIVER_SPLIT_PCT = 0.75;
  const driverCommission = Math.round(totalDeliveryPrice * DRIVER_SPLIT_PCT * 100) / 100;

  return {
    basePrice,
    distancePrice,
    weightPrice,
    surcharges,
    subtotal,
    discount,
    totalDeliveryPrice,
    driverCommission,
  };
}
