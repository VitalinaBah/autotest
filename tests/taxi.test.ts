import { describe, it, expect } from 'vitest';
import { calcBaseFare, calcTaxiFare } from '../src/taxi';

describe('calcTaxiFare', () => {
  it.each([-1, -0.1, NaN, Infinity])('відхиляє відстань %s', (km) => {
    expect(() => calcTaxiFare(km)).toThrow('INVALID_DISTANCE');
  });

  it.each([0, 1, 2.5, 3])(
    'посадка 40 грн, перші 3 км включено: %s км',
    (km) => {
      expect(calcBaseFare(km)).toBe(40);
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
      expect(calcBaseFare(km)).toBe(expected);
    },
  );

  it.each([
    { km: 6, night: true, expected: 95 },
    { km: 7, night: true, expected: 110 },
    { km: 10, night: true, expected: 155 },
    { km: 10, night: false, expected: 124 },
  ])(
    'нічна надбавка 25 %: $km км, night=$night → $expected',
    ({ km, night, expected }) => {
      expect(calcTaxiFare(km, { night })).toBe(expected);
    },
  );

  it.each([
    { km: 0, night: false, expected: 80 },
    { km: 3, night: false, expected: 80 },
    { km: 6, night: false, expected: 80 },
    { km: 6.01, night: false, expected: 88 },
    { km: 7, night: false, expected: 88 },
    { km: 3, night: true, expected: 80 },
    { km: 5, night: true, expected: 80 },
    { km: 5.01, night: true, expected: 95 },
  ])(
    'мінімальна поїздка 80 грн: $km км, night=$night → $expected',
    ({ km, night, expected }) => {
      expect(calcTaxiFare(km, { night })).toBe(expected);
    },
  );
});
