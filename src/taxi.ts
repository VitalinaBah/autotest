export interface TaxiOptions {
  night?: boolean;
}

const BOARDING_FEE = 40;
const INCLUDED_KM = 3;
const PRICE_PER_KM = 12;
const NIGHT_SURCHARGE_RATE = 1.25;
const MIN_FARE = 80;

export function calcBaseFare(km: number): number {
  km = Math.round(km * 1000) / 1000;
  if (km <= INCLUDED_KM) return BOARDING_FEE;
  const extraKm = Math.ceil(km - INCLUDED_KM);
  return BOARDING_FEE + extraKm * PRICE_PER_KM;
}

export function applyNightSurcharge(
  fare: number,
  options: TaxiOptions,
): number {
  return options.night ? fare * NIGHT_SURCHARGE_RATE : fare;
}

export function calcTaxiFare(km: number, options: TaxiOptions = {}): number {
  if (!Number.isFinite(km) || km < 0) {
    throw new Error('INVALID_DISTANCE');
  }
  const fare = applyNightSurcharge(calcBaseFare(km), options);
  return Math.max(fare, MIN_FARE);
}
