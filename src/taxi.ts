export interface TaxiOptions {
  night?: boolean;
}

export function calcTaxiFare(km: number, options: TaxiOptions = {}): number {
  if (!Number.isFinite(km) || km < 0) {
    throw new Error('INVALID_DISTANCE');
  }
  if (km <= 3) return 40;
  const extraKm = Math.ceil(km - 3);
  return 40 + extraKm * 12;
}
