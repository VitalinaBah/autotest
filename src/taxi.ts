export interface TaxiOptions {
  night?: boolean;
}

const BOARDING_FEE = 40;
const INCLUDED_KM = 3;
const PRICE_PER_KM = 12;
const NIGHT_SURCHARGE = 1.25;

const round2 = (n: number): number => Math.round(n * 100) / 100;

export function calcDistanceFare(distanceKm: number): number {
  if (!Number.isFinite(distanceKm) || distanceKm < 0) {
    throw new Error('INVALID_DISTANCE');
  }
  if (distanceKm <= INCLUDED_KM) return BOARDING_FEE;
  return round2(BOARDING_FEE + (distanceKm - INCLUDED_KM) * PRICE_PER_KM);
}

export function calcTaxiFare(
  distanceKm: number,
  options: TaxiOptions = {},
): number {
  let fare = calcDistanceFare(distanceKm);
  if (options.night) fare = fare * NIGHT_SURCHARGE;
  return round2(Math.max(fare, 80));
}
