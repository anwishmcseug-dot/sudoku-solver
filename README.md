# 🧩 Sudoku Solver

A sleek, modern Sudoku Solver featuring a glassmorphism UI and an optimized backtracking algorithm. Enter your puzzle, hit "Solve," and watch the magic happen with delightful, staggered animations.
**[🚀 Play the Live Demo Here!](https://anwishmcseug-dot.github.io/sudoku-solver/)**

## ✨ Features

* **Lightning-Fast Solver:** Powered by a highly optimized backtracking algorithm that uses bitmasking to track row, column, and 3x3 box usage, making it significantly faster than traditional lookups.
* **Modern Glassmorphism UI:** A beautiful, responsive design featuring frosted glass panels, animated gradient text, and gently floating background blobs.
* **Smart Navigation & Input:** Fully supports keyboard navigation (Arrow keys, Backspace, Delete) for seamless puzzle entry. Inputs are strictly filtered to only accept numbers 1–9.
* **Real-time Pre-validation:** Detects duplicate inputs and mathematically impossible boards before attempting to solve, highlighting the exact conflicting cells with a shake animation.
* **Delightful Feedback:** Features staggered pop-in animations for the solved numbers and a custom confetti drop celebration upon completing a puzzle.

## 🛠️ Tech Stack

This project is built using pure, vanilla web technologies. No build steps, bundlers, or frameworks are required.

* **HTML5:** Semantic markup and accessibility attributes.
* **CSS3:** CSS Grid, Flexbox, custom variables, backdrop-filters (glassmorphism), and keyframe animations.
* **Vanilla JavaScript (ES6+):** DOM manipulation, event handling, and algorithmic logic.

## 📂 Project Structure

* `index.html` — The entry point. Contains the layout, SVG icons, and semantic structure of the application.
* `style.css` — The "vibe." Houses all the styling, including the frosted glass effects, gradient shifts, media queries for mobile responsiveness, and CSS keyframe animations.
* `app.js` — The UI layer. Dynamically generates the 81-cell grid, handles DOM manipulation, captures user inputs, manages keyboard navigation, and orchestrates the visual feedback (errors, confetti).
* `solver.js` — The brains of the operation. Contains pure mathematical logic decoupled from the DOM. Features `validateBoard()` to check for rule breaks and `solveBoard()` which executes the backtracking/bitmasking algorithm.

## 🚀 How to Run

Because this project uses vanilla web technologies, getting it running is incredibly simple:

1. **Download or Clone** this repository to your local machine.
2. Navigate to the project folder.
3. Double-click `index.html` to open it in your default web browser.
4. Enter your Sudoku puzzle numbers and click **Solve**!

---
**👨‍💻 Author**
Built with ❤️ by **Anwish**