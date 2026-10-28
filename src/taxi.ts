export interface TaxiOptions {
  night?: boolean;
}

export function calcTaxiFare(km: number, options: TaxiOptions = {}): number {
  throw new Error('INVALID_DISTANCE');
}
