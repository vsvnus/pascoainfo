# Project Plan: Performance Fine-Tuning (The Road to 90+)

## 📉 Context
- Current Score: 70-75 (Plateaued).
- Partytown installed but possibly not sufficient or misconfigured.
- **Goal**: Break the 90+ barrier.

## 🕵️‍♂️ Phase 1: Deep Diagnosis (Findings) ✅
- **CRITICAL**: `quiz.js` instantiates on `DOMContentLoaded`, running logic for hidden modals unnecessarily. This burns CPU during load.
- **BLOCKING**: `assets/js/pixel-events.js` is loaded synchronously (no defer/async), blocking rendering at line 1544.
- **LCP Latency**: Google Fonts overhead + LCP Image fighting with Main Thread JS.

## 🛠️ Phase 2: Action Plan (Validated)
### 1. Fix Sync Blocking Script
- [ ] Add `defer` attribute to `assets/js/pixel-events.js` in `index.html`.

### 2. Lazy Hydrate Quiz (Major Win)
- [ ] Modify `quiz.js`: Remove `DOMContentLoaded` auto-init.
- [ ] Create `window.loadQuiz()` function.
- [ ] Init Quiz only on first interaction (scroll, mousemove, touch) or button click.

### 3. Fonts Optimization
- [ ] Download Google Fonts (Inter/Outfit) as WOFF2.
- [ ] Serve locally from `/assets/fonts/`.
- [ ] Update CSS to use local fonts.

## ⚡ Phase 3: Verification
- [ ] Check Network tab: No blocking scripts.
- [ ] Check Performance tab: Zero "Long Tasks" during load.
- [ ] Score Target: 90+ Mobile.

## 🧪 Phase 4: Extreme Measures (If needed)
- [ ] **No-JS First Paint**: Ensure the hero renders 100% fine without ANY JS.
- [ ] **Aggressive Caching**: Review Service Worker Cache (Partytown uses one, maybe tweak it).

## Success Metric
- LCP < 2.5s (Mobile)
- TBT < 200ms
- Score > 90
