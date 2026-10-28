export interface TaxiOptions {
  night?: boolean;
}

const BOARDING_FEE = 40;
const INCLUDED_KM = 3;
const PRICE_PER_KM = 12;

export function calcTaxiFare(km: number, options: TaxiOptions = {}): number {
  if (!Number.isFinite(km) || km < 0) {
    throw new Error('INVALID_DISTANCE');
  }
  let fare = BOARDING_FEE;
  if (km > INCLUDED_KM) {
    const extraKm = Math.ceil(km - INCLUDED_KM);
    fare = BOARDING_FEE + extraKm * PRICE_PER_KM;
  }
  if (options.night) fare = fare * 1.25;
  return fare;
}
