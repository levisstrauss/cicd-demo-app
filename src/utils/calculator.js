/**
 * Add two numbers
 * @param {number} a First number
 * @param {number} b Second number
 * @returns {number} Sum of a and b
 */
function add(a, b) {
    return a + b;
  }
  
  /**
   * Subtract b from a
   * @param {number} a First number
   * @param {number} b Second number
   * @returns {number} Difference of a and b
   */
  function subtract(a, b) {
    return a - b;
  }
  
  /**
   * Multiply two numbers
   * @param {number} a First number
   * @param {number} b Second number
   * @returns {number} Product of a and b
   */
  function multiply(a, b) {
    return a * b;
  }
  
  export default {
    add,
    subtract,
    multiply
  };