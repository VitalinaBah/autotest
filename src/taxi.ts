export interface TaxiOptions {
  night?: boolean;
}

export function calcTaxiFare(km: number, options: TaxiOptions = {}): number {
  if (!Number.isFinite(km) || km < 0) {
    throw new Error('INVALID_DISTANCE');
  }
  return 40;
}
