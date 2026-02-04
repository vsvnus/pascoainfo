# Project Plan: Performance Fine-Tuning (The Road to 90+)

## 📉 Context
- Current Score: 70-75 (Plateaued).
- Partytown installed but possibly not sufficient or misconfigured.
- **Goal**: Break the 90+ barrier.

## 🕵️‍♂️ Phase 1: Deep Diagnosis (Identify the *Real* Bottleneck)
- [ ] **Verify Partytown**: Is it actually preventing main-thread blocking? (Check Network tab for tracking calls).
- [ ] **Analyze LCP Element**: Is it the Hero Image (`hero_egg.webp`) or the H1 Text?
- [ ] **Check Fonts**: Are Google Fonts causing layout shifts (FOUT) or connection delays?

## 🛠️ Phase 2: LCP & Visual Stability (Critical)
- [ ] **Self-Host Fonts**: Download Google Fonts locally to remove connection latency.
- [ ] **Preload Hardening**: Ensure Hero Image is preloaded *perfectly* (fetchpriority="high").
- [ ] **Layout Stability**: Reserve explicit space for Hero Image to kill any remaining CLS.

## ⚡ Phase 3: JavaScript Execution (Main Thread)
- [ ] **Audit `quiz.js`**: Does it run expensive logic on `DOMContentLoaded`?
- [ ] **Defer Quiz Logic**: Delay quiz initialization until *user interaction* (e.g., first scroll or click), not just page load.
- [ ] **CSS Extraction**: Minimize the "Critical Inline CSS" block if it's too large.

## 🧪 Phase 4: Extreme Measures (If needed)
- [ ] **No-JS First Paint**: Ensure the hero renders 100% fine without ANY JS.
- [ ] **Aggressive Caching**: Review Service Worker Cache (Partytown uses one, maybe tweak it).

## Success Metric
- LCP < 2.5s (Mobile)
- TBT < 200ms
- Score > 90
