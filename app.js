/* ============================================================
   APP.JS — The UI Layer
   This is where we handle the buttons, the grid, and all the 
   visual feedback (like colors and confetti).
   ============================================================ */

(function () {
  'use strict';

  // --- Grabbing our HTML elements ---
  const boardEl   = document.getElementById('sudoku-board');
  const msgBar    = document.getElementById('message-bar');
  const btnSolve  = document.getElementById('btn-solve');
  const btnClear  = document.getElementById('btn-clear');

  // ============================================================
  // 1. GENERATING THE GRID
  // ============================================================
  const cells = []; // We'll keep a flat list of all 81 inputs for easy access

  for (let i = 0; i < 81; i++) {
    const input = document.createElement('input');
    input.type        = 'text'; // 'text' gives us more control over filtering than 'number'
    input.maxLength   = 1;
    input.className   = 'cell';
    input.id          = `cell-${i}`;
    input.setAttribute('aria-label', `Row ${Math.floor(i / 9) + 1}, Column ${(i % 9) + 1}`);
    input.inputMode   = 'numeric'; // Forces a number pad on mobile devices

    // --- Input Filter: Only allow 1-9 ---
    input.addEventListener('input', (e) => {
      const val = e.target.value;
      if (!/^[1-9]$/.test(val)) {
        e.target.value = ''; // If it's not 1-9, just wipe it
      }
      // If the user starts typing, they're "fixing" things, so remove error/success colors
      e.target.classList.remove('error', 'solved');
      hideMessage();
    });

    // --- Quality of Life: Navigate with Arrow Keys ---
    input.addEventListener('keydown', (e) => {
      let target = -1;
      const row = Math.floor(i / 9);
      const col = i % 9;

      switch (e.key) {
        case 'ArrowUp':    if (row > 0) target = i - 9; break;
        case 'ArrowDown':  if (row < 8) target = i + 9; break;
        case 'ArrowLeft':  if (col > 0) target = i - 1; break;
        case 'ArrowRight': if (col < 8) target = i + 1; break;
        case 'Backspace':
        case 'Delete':
          e.target.value = '';
          e.target.classList.remove('error', 'solved');
          hideMessage();
          return;
        default: return; // Ignore other keys
      }

      // If we found a valid neighbor, move focus there
      if (target >= 0) {
        e.preventDefault(); // Stop the cursor from jumping
        cells[target].focus();
      }
    });

    cells.push(input);
    boardEl.appendChild(input);
  }

  // ============================================================
  // 2. DATA CONVERSION (DOM <-> ARRAYS)
  // ============================================================

  /** Grabs the numbers from the screen and puts them into a 2D array for the solver */
  function readBoard() {
    const board = [];
    for (let r = 0; r < 9; r++) {
      const row = [];
      for (let c = 0; c < 9; c++) {
        const val = parseInt(cells[r * 9 + c].value, 10);
        row.push(isNaN(val) ? 0 : val);
      }
      board.push(row);
    }
    return board;
  }

  /** Puts the solved numbers back on the screen with a cool staggered animation */
  function writeSolution(board, originalBoard) {
    let delay = 0;
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        const idx   = r * 9 + c;
        const input = cells[idx];
        input.value = board[r][c];

        // Only animate the numbers the computer actually found
        if (originalBoard[r][c] === 0) {
          input.style.animationDelay = `${delay}ms`;
          input.classList.add('solved');
          delay += 20; // Each cell pops in slightly after the last one
        }
      }
    }
  }

  // ============================================================
  // 3. UI FEEDBACK (MESSAGES & CONFETTI)
  // ============================================================

  function showMessage(text, type) {
    msgBar.textContent = text;
    msgBar.className   = `message-bar ${type}`; // Switch between 'error' and 'success' styles
  }

  function hideMessage() {
    msgBar.className = 'message-bar hidden';
    msgBar.textContent = '';
  }

  /** A little celebration for when the board is solved */
  function launchConfetti() {
    const container = document.createElement('div');
    container.className = 'confetti-container';
    document.body.appendChild(container);

    const colors = ['#34d399', '#818cf8', '#fbbf24', '#f87171', '#f0abfc', '#38bdf8'];
    const count = 80;

    for (let i = 0; i < count; i++) {
      const piece = document.createElement('div');
      piece.className = 'confetti-piece';
      piece.style.left = `${Math.random() * 100}%`;
      piece.style.background = colors[Math.floor(Math.random() * colors.length)];
      piece.style.animationDuration = `${1.5 + Math.random() * 2}s`;
      piece.style.animationDelay = `${Math.random() * 0.8}s`;
      piece.style.width = `${6 + Math.random() * 8}px`;
      piece.style.height = `${6 + Math.random() * 8}px`;
      piece.style.borderRadius = Math.random() > 0.5 ? '50%' : '2px';
      container.appendChild(piece);
    }

    // Clean up the DOM after the confetti falls off screen
    setTimeout(() => container.remove(), 4000);
  }

  function clearErrors() {
    cells.forEach(c => c.classList.remove('error'));
  }

  // ============================================================
  // 4. THE MAIN "SOLVE" EVENT
  // ============================================================

  btnSolve.addEventListener('click', () => {
    clearErrors();
    hideMessage();

    const board = readBoard();

    // ---- Step 1: Make sure the user didn't break Sudoku rules first ----
    const validation = validateBoard(board);

    if (!validation.valid) {
      // Highlight the specific cells that are causing trouble
      validation.conflicts.forEach(key => {
        const [r, c] = key.split('-').map(Number);
        cells[r * 9 + c].classList.add('error');
      });
      showMessage('✗  Duplicate numbers found! Fix the red boxes first.', 'error');
      return;
    }

    // Deep copy the board so we can distinguish original inputs from solved ones
    const original = board.map(row => [...row]);

    // ---- Step 2: Fire up the solver ----
    const solved = solveBoard(board);

    if (!solved) {
      showMessage('✗  Mathematically impossible. Double check your inputs.', 'error');
      return;
    }

    // ---- Step 3: Show the results ----
    writeSolution(board, original);
    showMessage('✓  Puzzle solved!', 'success');
    launchConfetti();
  });

  // ============================================================
  // 5. THE "CLEAR" EVENT
  // ============================================================

  btnClear.addEventListener('click', () => {
    cells.forEach(c => {
      c.value = '';
      c.classList.remove('error', 'solved');
    });
    hideMessage();
    cells[0].focus(); // Reset focus to the top-left cell
  });
})();