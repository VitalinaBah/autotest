import { describe, it, expect } from 'vitest';
import { calcDistanceFare, calcTaxiFare } from '../src/taxi';

describe('некоректна відстань', () => {
  it.each([-1, -0.1, NaN, Infinity])('відхиляє відстань %s', (km) => {
    expect(() => calcTaxiFare(km)).toThrow('INVALID_DISTANCE');
  });
});

describe('calcDistanceFare: посадка', () => {
  it.each([0, 1, 3])('поїздка на %s км коштує лише посадку 40 грн', (km) => {
    expect(calcDistanceFare(km)).toBe(40);
  });
});

describe('calcDistanceFare: кілометраж понад 3 км', () => {
  it.each([
    { km: 2.9, expected: 40 },
    { km: 3, expected: 40 },
    { km: 3.1, expected: 41.2 },
  ])('межа включених 3 км: $km км → $expected грн', ({ km, expected }) => {
    expect(calcDistanceFare(km)).toBeCloseTo(expected, 2);
  });

  it.each([
    { km: 4, expected: 52 },
    { km: 10, expected: 124 },
  ])(
    'кожен км понад 3 коштує 12 грн: $km км → $expected грн',
    ({ km, expected }) => {
      expect(calcDistanceFare(km)).toBe(expected);
    },
  );
});

describe('calcDistanceFare: заокруглення', () => {
  it('заокруглює вартість до копійок', () => {
    // 40 + 12 × 0,3 = 43,60
    expect(calcDistanceFare(3.3)).toBe(43.6);
  });
});

describe('нічна надбавка', () => {
  it.each([
    { km: 7.5, expected: 117.5 },
    { km: 10, expected: 155 },
    { km: 15, expected: 230 },
  ])('вночі $km км коштує $expected грн', ({ km, expected }) => {
    expect(calcTaxiFare(km, { night: true })).toBe(expected);
  });

  it('без прапорця night надбавка не застосовується', () => {
    expect(calcTaxiFare(10, { night: false })).toBe(124);
  });
});

describe('мінімальна вартість поїздки', () => {
  it.each([
    { km: 0, expected: 80 },
    { km: 3, expected: 80 },
    { km: 5, expected: 80 },
  ])(
    'коротка поїздка $km км коштує мінімум $expected грн',
    ({ km, expected }) => {
      expect(calcTaxiFare(km)).toBe(expected);
    },
  );

  it.each([
    { km: 6.33, expected: 80 },
    { km: 6.34, expected: 80.08 },
    { km: 7, expected: 88 },
  ])(
    'межа мінімальної вартості вдень: $km км → $expected грн',
    ({ km, expected }) => {
      expect(calcTaxiFare(km)).toBe(expected);
    },
  );

  it.each([
    { km: 4.9, expected: 80 },
    { km: 5, expected: 80 },
    { km: 5.1, expected: 81.5 },
  ])(
    'межа мінімальної вартості вночі: $km км → $expected грн',
    ({ km, expected }) => {
      expect(calcTaxiFare(km, { night: true })).toBe(expected);
    },
  );
});
