export interface TaxiOptions {
  night?: boolean;
}

const BOARDING_FEE = 40;
const INCLUDED_KM = 3;
const PRICE_PER_KM = 12;
const NIGHT_SURCHARGE = 1.25;
const MIN_FARE = 80;

const round2 = (n: number): number => Math.round(n * 100) / 100;

function assertValidDistance(distanceKm: number): void {
  if (!Number.isFinite(distanceKm) || distanceKm < 0) {
    throw new Error('INVALID_DISTANCE');
  }
}

export function calcDistanceFare(distanceKm: number): number {
  assertValidDistance(distanceKm);
  const extraKm = Math.max(distanceKm - INCLUDED_KM, 0);
  return round2(BOARDING_FEE + extraKm * PRICE_PER_KM);
}

export function applyNightSurcharge(
  fare: number,
  options: TaxiOptions,
): number {
  return options.night ? fare * NIGHT_SURCHARGE : fare;
}

export function calcTaxiFare(
  distanceKm: number,
  options: TaxiOptions = {},
): number {
  const fare = applyNightSurcharge(calcDistanceFare(distanceKm), options);
  return round2(Math.max(fare, MIN_FARE));
}
