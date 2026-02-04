# Project Plan: Performance Recovery

## 🚨 Critical Issue
Performance score dropped heavily (40-50/C).
**Root Cause**: Switched to `styles.min.css` and `quiz.min.js` which were likely **outdated or broken**, causing:
1.  **CLS (Layout Shifts)**: Missing styles caused elements to jump.
2.  **Render Delay**: Broken JS/CSS blocking critical path.

## Phase 1: Immediate Stabilization (Stop the Bleeding) ✅
- [x] Revert `index.html` to use original `styles.css`
- [x] Revert `index.html` to use original `quiz.js`
- [x] Verify if site visuals return to normal.

## Phase 2: Safe Optimization (Do it Right) ✅
- [x] Generate **NEW** `styles.min.css` from current `styles.css`.
- [x] Generate **NEW** `quiz.min.js` from current `quiz.js`.
- [x] Verify new minified files function exactly like originals.

## Phase 3: Re-Integration ✅
- [x] Switch `index.html` to use the **NEW** minified files.
- [x] Keep the "No Timeout" analytics fix (this is good).

## Verification Checklist
- [ ] Visual Stability (No jumping elements)
- [ ] Console Clean (No JS errors)
- [ ] Lighthouse Score > 80
