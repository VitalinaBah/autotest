export interface TaxiOptions {
  night?: boolean;
}

export function calcTaxiFare(
  distanceKm: number,
  options: TaxiOptions = {},
): number {
  throw new Error('INVALID_DISTANCE');
}
