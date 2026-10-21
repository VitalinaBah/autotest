/**
 * Варіант 4. Обчислення площі та периметра прямокутника.
 * Сторони мають бути скінченними додатними числами.
 */

export const INVALID_SIDE = 'INVALID_SIDE';

function assertPositiveSide(value: number): void {
  if (!Number.isFinite(value) || value <= 0) {
    throw new Error(INVALID_SIDE);
  }
}

export function rectangleArea(width: number, height: number): number {
  assertPositiveSide(width);
  assertPositiveSide(height);
  return width * height;
}

export function rectanglePerimeter(width: number, height: number): number {
  assertPositiveSide(width);
  assertPositiveSide(height);
  return 2 * (width + height);
}
