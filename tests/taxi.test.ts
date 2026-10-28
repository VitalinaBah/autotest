import { describe, it, expect } from 'vitest';
import { calcTaxiFare } from '../src/taxi';

describe('calcTaxiFare', () => {
  it.each([-1, -0.1, NaN, Infinity])('відхиляє відстань %s', (km) => {
    expect(() => calcTaxiFare(km)).toThrow('INVALID_DISTANCE');
  });

  it.each([0, 1, 2.5, 3])(
    'посадка 40 грн, перші 3 км включено: %s км',
    (km) => {
      expect(calcTaxiFare(km)).toBe(40);
    },
  );

  it.each([
    { km: 3, expected: 40 },
    { km: 3.1, expected: 52 },
    { km: 4, expected: 52 },
    { km: 4.01, expected: 64 },
    { km: 5, expected: 64 },
    { km: 10, expected: 124 },
  ])(
    'понад 3 км – 12 грн за кожен розпочатий км: $km → $expected',
    ({ km, expected }) => {
      expect(calcTaxiFare(km)).toBe(expected);
    },
  );
});
