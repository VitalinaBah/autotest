export interface TaxiOptions {
  night?: boolean;
}

export function calcTaxiFare(
  distanceKm: number,
  options: TaxiOptions = {},
): number {
  if (!Number.isFinite(distanceKm) || distanceKm < 0) {
    throw new Error('INVALID_DISTANCE');
  }
  if (distanceKm <= 3) return 40;
  return 40 + (distanceKm - 3) * 12;
}
