import { describe, it, expect } from 'vitest';
import {
  rectangleArea,
  rectanglePerimeter,
  INVALID_SIDE,
} from '../src/rectangle';

describe('rectangleArea', () => {
  it('повертає 12 для прямокутника 3 на 4', () => {
    // Arrange
    const width = 3;
    const height = 4;
    // Act
    const result = rectangleArea(width, height);
    // Assert
    expect(result).toBe(12);
  });

  it('коректно обчислює площу для дробових сторін', () => {
    expect(rectangleArea(2.5, 1.2)).toBeCloseTo(3);
  });

  it('повертає квадрат сторони для квадрата', () => {
    expect(rectangleArea(5, 5)).toBe(25);
  });

  it('приймає найменшу додатну сторону як межове значення', () => {
    expect(rectangleArea(Number.MIN_VALUE, 1)).toBeGreaterThan(0);
  });

  it('відхиляє нульову сторону', () => {
    expect(() => rectangleArea(0, 4)).toThrow(INVALID_SIDE);
  });

  it('відхиляє від’ємну сторону', () => {
    expect(() => rectangleArea(3, -1)).toThrow(INVALID_SIDE);
  });

  it('відхиляє нечислову сторону', () => {
    expect(() => rectangleArea(NaN, 2)).toThrow(INVALID_SIDE);
    expect(() => rectangleArea(Infinity, 2)).toThrow(INVALID_SIDE);
  });
});

describe('rectanglePerimeter', () => {
  it('повертає 14 для прямокутника 3 на 4', () => {
    // Arrange
    const width = 3;
    const height = 4;
    // Act
    const result = rectanglePerimeter(width, height);
    // Assert
    expect(result).toBe(14);
  });

  it('коректно обчислює периметр для дробових сторін', () => {
    expect(rectanglePerimeter(0.5, 1.5)).toBe(4);
  });

  it('повертає 4 для одиничного квадрата як межового випадку', () => {
    expect(rectanglePerimeter(1, 1)).toBe(4);
  });

  it('відхиляє нульову сторону', () => {
    expect(() => rectanglePerimeter(4, 0)).toThrow(INVALID_SIDE);
  });

  it('відхиляє від’ємну сторону', () => {
    expect(() => rectanglePerimeter(-2, 5)).toThrow(INVALID_SIDE);
  });
});
