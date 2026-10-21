import { describe, it, expect } from 'vitest';
import { calcBulkDiscount } from '../src/order';

describe('calcBulkDiscount', () => {
  it('не надає знижки на одну одиницю товару', () => {
    // Arrange
    const qty = 1;
    // Act
    const rate = calcBulkDiscount(qty);
    // Assert
    expect(rate).toBe(0);
  });

  it.each([
    { qty: 5, expected: 0 },
    { qty: 25, expected: 0.03 },
    { qty: 100, expected: 0.07 },
  ])(
    'для типової кількості $qty повертає ставку $expected',
    ({ qty, expected }) => {
      expect(calcBulkDiscount(qty)).toBeCloseTo(expected, 4);
    },
  );

  it.each([
    { qty: 9, expected: 0 },
    { qty: 10, expected: 0.03 },
    { qty: 11, expected: 0.03 },
  ])(
    'межа 10 одиниць: кількість $qty дає ставку $expected',
    ({ qty, expected }) => {
      expect(calcBulkDiscount(qty)).toBeCloseTo(expected, 4);
    },
  );

  it.each([
    { qty: 49, expected: 0.03 },
    { qty: 50, expected: 0.07 },
    { qty: 51, expected: 0.07 },
  ])(
    'межа 50 одиниць: кількість $qty дає ставку $expected',
    ({ qty, expected }) => {
      expect(calcBulkDiscount(qty)).toBeCloseTo(expected, 4);
    },
  );

  it.each([0, -1, 2.5, NaN, Infinity])(
    'відхиляє некоректну кількість %s',
    (qty) => {
      expect(() => calcBulkDiscount(qty)).toThrow('INVALID_BULK_QTY');
    },
  );
});
