export interface TaxiOptions {
  night?: boolean;
}

const BOARDING_FEE = 40;
const INCLUDED_KM = 3;
const PRICE_PER_KM = 12;

export function calcTaxiFare(
  distanceKm: number,
  options: TaxiOptions = {},
): number {
  if (!Number.isFinite(distanceKm) || distanceKm < 0) {
    throw new Error('INVALID_DISTANCE');
  }
  let fare =
    distanceKm <= INCLUDED_KM
      ? BOARDING_FEE
      : BOARDING_FEE + (distanceKm - INCLUDED_KM) * PRICE_PER_KM;
  if (options.night) fare = fare * 1.25;
  return Math.round(fare * 100) / 100;
}
