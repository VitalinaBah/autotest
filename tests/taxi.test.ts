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
});
