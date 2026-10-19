# Trading System Hardening Implementation Plan

This plan implements the reviewed design in `docs/superpowers/specs/2026-10-19-trading-system-hardening-design.md`.

## 1. Rule-layer tests and helpers

- [x] Extend `scripts/verify-trade-rules.mjs` first with failing tests for setup-vs-position permission, relative theme and stock strength, T+1 lot availability, intraday volume state, and immutable signal snapshots.
- [x] Implement pure helpers in `outputs/stock-watch-app/trade-rules.js` for those decisions, preserving current public behavior where the design does not change it.
- [x] Run the rule verification script and confirm all new boundary cases pass.

## 2. Gate, light, and volume integration

- [x] Make the market gate use the completed benchmark daily close versus MA10 and preserve `unknown` when unavailable/stale.
- [x] Remove the absolute theme-rise bypass; compare the mapped theme and stock with the market and each other using aligned timestamps.
- [x] Replace overlapping trend/shape lights with one structure light and add a funds-convergence light based only on a fresh mapped-stock flow observation.
- [x] Classify volume as completed daily, valid same-time intraday comparison, pending close, stale, or missing; prevent unsupported partial-day volume from passing the light.
- [x] Keep the result hierarchy compact and ensure blockers remain visible.

## 3. Position permission and T+1

- [x] Make setup confirmation independent from risk-plan permission; require entry, stop, max-loss budget, and a calculable lot size before showing `允许小仓`.
- [x] Track newly recorded buys as dated lots and calculate locked-today versus available-to-sell shares.
- [x] Add an explicit available-share field for legacy aggregate holdings without lot history; persist it and label the source as user-verified.
- [x] Cap planned sale quantities at available shares, while preserving the rest of the existing sell-plan workflow.

## 4. Signal/replay evidence and compatibility

- [x] Record a signal-time snapshot once when a setup first confirms, with inputs, source/timestamp, setup kind, and invalidation level.
- [x] Record later outcomes separately and preserve unknown outcomes; use the existing replay surface instead of adding a large dashboard.
- [x] Add migration/default handling so existing watchlist, cost basis, review charts, and plans still load.
- [x] Extend DOM verification for the visible states and compatibility requirements.

## 5. Verification and GitHub delivery

- [x] Run trade-rule, DOM, review-DOM, syntax, and whitespace checks available in the repository.
- [x] Inspect desktop/mobile browser states and verify there is no horizontal overflow; expose setup-versus-position blockers in the compact row.
- [ ] Review the final diff and stage only the reviewed app, test, and documentation files for this change; do not include PDFs, Sites artifacts, or unrelated user files.
- [ ] Commit the scoped change and push it to the configured GitHub remote without force-pushing.

## Progress

- Spec reviewed and approved by user.
- Rule-layer, gate/light, T+1, and replay evidence changes implemented; independent review findings were resolved and all automated/browser checks pass.
- Scoped Git staging, commit, and push remain.
