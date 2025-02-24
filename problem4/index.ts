/**
 * Implementation A: Iterative Loop
 * ---------------------------------
 * Input: n - a positive integer representing the number of natural numbers to sum.
 * Output: Returns the summation of all natural numbers from 1 to n.
 * 
 * Complexity: O(n) time, O(1) space.
 * This function uses a for loop to accumulate the sum of natural numbers.
 */
function sumNaturalNumbersIterative(n: number): number {
  let sum = 0;
  for (let i = 1; i <= n; i++) {
      sum += i;
  }
  return sum;
}

/**
* Implementation B: Mathematical Formula
* -----------------------------------------
* Input: n - a positive integer representing the number of natural numbers to sum.
* Output: Returns the summation of all natural numbers from 1 to n using the formula n*(n+1)/2.
*
* Complexity: O(1) time, O(1) space.
* This implementation is the most efficient, leveraging a direct mathematical formula.
*/
function sumNaturalNumbersFormula(n: number): number {
  return n * (n + 1) / 2;
}

/**
* Implementation C: Recursion
* ----------------------------
* Input: n - a positive integer representing the number of natural numbers to sum.
* Output: Returns the summation of all natural numbers from 1 to n.
*
* Complexity: O(n) time, O(n) space (due to the recursive call stack).
* This function uses recursion to compute the sum.
*/
function sumNaturalNumbersRecursive(n: number): number {
  if (n <= 0) {
      return 0; // Base case: For n <= 0, the sum is 0.
  }
  return n + sumNaturalNumbersRecursive(n - 1);
}

// Example usage:
const n = 5;

console.log(`Iterative: The sum of the first ${n} natural numbers is ${sumNaturalNumbersIterative(n)}`);
// Expected output: Iterative: The sum of the first 5 natural numbers is 15

console.log(`Formula: The sum of the first ${n} natural numbers is ${sumNaturalNumbersFormula(n)}`);
// Expected output: Formula: The sum of the first 5 natural numbers is 15

console.log(`Recursive: The sum of the first ${n} natural numbers is ${sumNaturalNumbersRecursive(n)}`);
// Expected output: Recursive: The sum of the first 5 natural numbers is 15