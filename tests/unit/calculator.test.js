const { add, subtract, multiply } = require('../../src/utils/calculator');

describe('Calculator Functions', () => {
  describe('add function', () => {
    test('adds two positive numbers correctly', () => {
      expect(add(2, 3)).toBe(5);
    });
    
    test('handles negative numbers', () => {
      expect(add(-1, -2)).toBe(-3);
      expect(add(-1, 5)).toBe(4);
    });
  });
  
  describe('subtract function', () => {
    test('subtracts two positive numbers correctly', () => {
      expect(subtract(5, 3)).toBe(2);
    });
    
    test('handles negative numbers', () => {
      expect(subtract(-1, -2)).toBe(1);
      expect(subtract(-1, 5)).toBe(-6);
    });
  });
  
  describe('multiply function', () => {
    test('multiplies two positive numbers correctly', () => {
      expect(multiply(2, 3)).toBe(6);
    });
    
    test('handles negative numbers', () => {
      expect(multiply(-1, -2)).toBe(2);
      expect(multiply(-1, 5)).toBe(-5);
    });
    
    test('handles zeros', () => {
      expect(multiply(0, 5)).toBe(0);
      expect(multiply(5, 0)).toBe(0);
    });
  });
});
