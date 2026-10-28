import { describe, it, expect } from 'vitest';
import { calcTaxiFare } from '../src/taxi';

describe('некоректна відстань', () => {
  it.each([-1, -0.1, NaN, Infinity])('відхиляє відстань %s', (km) => {
    expect(() => calcTaxiFare(km)).toThrow('INVALID_DISTANCE');
  });
});

describe('посадка', () => {
  it.each([0, 1, 3])('поїздка на %s км коштує лише посадку 40 грн', (km) => {
    expect(calcTaxiFare(km)).toBe(40);
  });
});

describe('кілометраж понад 3 км', () => {
  it.each([
    { km: 2.9, expected: 40 },
    { km: 3, expected: 40 },
    { km: 3.1, expected: 41.2 },
  ])('межа включених 3 км: $km км → $expected грн', ({ km, expected }) => {
    expect(calcTaxiFare(km)).toBeCloseTo(expected, 2);
  });

  it.each([
    { km: 4, expected: 52 },
    { km: 10, expected: 124 },
  ])(
    'кожен км понад 3 коштує 12 грн: $km км → $expected грн',
    ({ km, expected }) => {
      expect(calcTaxiFare(km)).toBe(expected);
    },
  );
});

describe('заокруглення', () => {
  it('заокруглює вартість до копійок', () => {
    // 40 + 12 × 0,3 = 43,60
    expect(calcTaxiFare(3.3)).toBe(43.6);
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
