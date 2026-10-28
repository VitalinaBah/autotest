export interface TaxiOptions {
  night?: boolean;
}

const BOARDING_FEE = 40;
const INCLUDED_KM = 3;
const PRICE_PER_KM = 12;
const NIGHT_SURCHARGE_RATE = 1.25;
const MIN_FARE = 80;
const METRES_PER_KM = 1000;

function assertValidDistance(km: number): void {
  if (!Number.isFinite(km) || km < 0) {
    throw new Error('INVALID_DISTANCE');
  }
}

const roundToMetres = (km: number): number =>
  Math.round(km * METRES_PER_KM) / METRES_PER_KM;

export function calcBaseFare(km: number): number {
  const distance = roundToMetres(km);
  if (distance <= INCLUDED_KM) return BOARDING_FEE;
  const extraKm = Math.ceil(distance - INCLUDED_KM);
  return BOARDING_FEE + extraKm * PRICE_PER_KM;
}

export function applyNightSurcharge(
  fare: number,
  options: TaxiOptions,
): number {
  return options.night ? fare * NIGHT_SURCHARGE_RATE : fare;
}

const applyMinFare = (fare: number): number => Math.max(fare, MIN_FARE);

export function calcTaxiFare(km: number, options: TaxiOptions = {}): number {
  assertValidDistance(km);
  return applyMinFare(applyNightSurcharge(calcBaseFare(km), options));
}
