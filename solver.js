/* ============================================================
   SOLVER.JS — The Brains of the Operation
   This file handles all the math and logic. No DOM stuff here, 
   just pure Sudoku solving and rule-checking.
   ============================================================ */

/**
 * We need to make sure the board isn't already broken before we start.
 * If the user put two 5s in a row, this will catch it and tell us 
 * exactly where the mistakes are.
 */
function validateBoard(board) {
  const conflicts = new Set();

  /**
   * Helper function: checks a group of 9 cells (row, col, or box) 
   * to see if any numbers repeat.
   */
  function checkGroup(cells) {
    const seen = {}; // Stores the first place we saw a number: { value: "row-col" }
    
    for (const { val, r, c } of cells) {
      if (val === 0) continue; // Ignore empty spots
      
      const key = `${r}-${c}`;
      if (seen[val] !== undefined) {
        // If we've seen this number before, both are now "conflicts"
        conflicts.add(seen[val]); 
        conflicts.add(key);
      } else {
        seen[val] = key;
      }
    }
  }

  // Look through every row
  for (let r = 0; r < 9; r++) {
    const cells = [];
    for (let c = 0; c < 9; c++) cells.push({ val: board[r][c], r, c });
    checkGroup(cells);
  }

  // Look through every column
  for (let c = 0; c < 9; c++) {
    const cells = [];
    for (let r = 0; r < 9; r++) cells.push({ val: board[r][c], r, c });
    checkGroup(cells);
  }

  // Look through each of the nine 3x3 sub-grids
  for (let boxRow = 0; boxRow < 3; boxRow++) {
    for (let boxCol = 0; boxCol < 3; boxCol++) {
      const cells = [];
      for (let r = boxRow * 3; r < boxRow * 3 + 3; r++) {
        for (let c = boxCol * 3; c < boxCol * 3 + 3; c++) {
          cells.push({ val: board[r][c], r, c });
        }
      }
      checkGroup(cells);
    }
  }

  // If the conflicts set is empty, we're good to go!
  return conflicts.size === 0
    ? { valid: true }
    : { valid: false, conflicts };
}


/* ============================================================
   THE SOLVER (Backtracking + Bitmasking)
   ============================================================ */

/**
 * This is the main solver. It uses a bitmask trick to keep track 
 * of which numbers are used in each row/column/box. This is way 
 * faster than traditional lookups.
 */
function solveBoard(board) {
  // These keep track of which numbers (1-9) are "taken" in each section.
  // We use bits (00000010, etc.) to store this in one number.
  const rowUsed = new Uint16Array(9);
  const colUsed = new Uint16Array(9);
  const boxUsed = new Uint16Array(9);

  // Quick way to figure out which 3x3 box a cell belongs to
  const boxIdx = (r, c) => Math.floor(r / 3) * 3 + Math.floor(c / 3);

  // Step 1: Scan the starting board and fill in our "already used" masks
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      const v = board[r][c];
      if (v !== 0) {
        const bit = 1 << v;
        rowUsed[r] |= bit;
        colUsed[c] |= bit;
        boxUsed[boxIdx(r, c)] |= bit;
      }
    }
  }

  // Step 2: Find all the empty spots so we aren't scanning the whole board constantly
  const emptyCells = [];
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      if (board[r][c] === 0) emptyCells.push([r, c]);
    }
  }

  /**
   * The actual recursive function. It tries a number, moves to the 
   * next cell, and if it hits a dead end, it "backtracks" and tries again.
   */
  function backtrack(idx) {
    // If we've reached the end of our emptyCells list, we won!
    if (idx === emptyCells.length) return true; 

    const [r, c] = emptyCells[idx];
    const b = boxIdx(r, c);

    // Combine row, column, and box masks to see what's left for this cell
    const used = rowUsed[r] | colUsed[c] | boxUsed[b];

    // Let's try numbers 1 through 9
    for (let d = 1; d <= 9; d++) {
      const bit = 1 << d;
      
      // If the bit is already flipped, this number is taken. Skip it.
      if (used & bit) continue; 

      // Place the number and update our "used" records
      board[r][c] = d;
      rowUsed[r] |= bit;
      colUsed[c] |= bit;
      boxUsed[b] |= bit;

      // Move to the next empty cell
      if (backtrack(idx + 1)) return true; 

      // If that didn't work, reset everything and try the next number (backtrack)
      board[r][c] = 0;
      rowUsed[r] ^= bit;
      colUsed[c] ^= bit;
      boxUsed[b] ^= bit;
    }

    // If we tried 1-9 and nothing worked, this branch is a failure.
    return false; 
  }

  return backtrack(0);
}
