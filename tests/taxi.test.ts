import { describe, it, expect } from 'vitest';
import { calcTaxiFare } from '../src/taxi';

describe('некоректна відстань', () => {
  it.each([-1, -0.1, NaN, Infinity])('відхиляє відстань %s', (km) => {
    expect(() => calcTaxiFare(km)).toThrow('INVALID_DISTANCE');
  });
});
