# Trading System Hardening Design

Date: 2026-10-19
Status: Draft for user review

## Goal

Make the stock-watch app's three-gate/six-light workflow internally consistent, honest about incomplete or intraday data, and executable as a risk-bounded plan. Keep the interface compact and preserve the app's existing watchlist, replay, and trade-plan workflows.

## User-Approved Direction

### 1. Separate setup confirmation from position permission

- **Setup confirmed** means the three gates are open, the six-light score meets the existing strict confirmation threshold, and the required price structure has confirmed at the intended time scale.
- **Small position allowed** additionally requires an explicit entry plan, structural stop, maximum loss per trade, and a position size derived from that loss limit and the entry-to-stop distance.
- If any required risk input is absent or invalid, the app must not describe the stock as buyable. It may still show that the chart setup is confirmed.
- The app remains an analysis/planning tool. It does not promise execution, profit, or certainty.

### 2. Make the three gates and six lights use one definition

Three gates:

1. **Market**: benchmark index is above its 10-day moving average, using a completed daily bar.
2. **Theme**: the correctly classified theme is showing relative strength versus the market. An absolute theme rise must not bypass a failed relative-strength condition.
3. **Stock**: the stock is strong relative to both its theme and the market, using comparable quote periods and timestamps.

Six lights:

1. Theme
2. Market environment
3. Structure (trend and price pattern are one light, not two overlapping votes)
4. Volume
5. Funds
6. Risk

Theme classification should be based on the app's existing explicit mapping. A stock must not receive duplicate theme strength from overlapping keyword matches. Missing or stale data is **unknown**, not a pass.

### 3. Respect A-share T+1 availability in position plans

- Track buy lots by date and quantity so same-day purchases are visibly locked from ordinary sale planning.
- Prior-day available lots remain separately sellable; a plan must not treat the whole position as either locked or available when only part is locked.
- For existing aggregate holdings without lot history, expose an editable available-to-sell quantity and label it as user-provided/unknown history. Do not silently invent lot dates.
- This is a planning constraint, not broker connectivity or order routing.

### 4. Do not treat partial intraday volume as a completed-volume signal

- Intraday cumulative volume must not be compared directly with a full-day average and presented as a confirmed volume-ratio light.
- If same-time historical intraday volume is available and sufficiently complete, show it as an explicitly intraday comparison.
- Otherwise mark volume as **pending close confirmation** until the daily bar completes; it cannot independently turn the volume light green or create a confirmed buy signal.
- Show the volume source/time and distinguish stale, missing, intraday, and completed-daily data.

### 5. Validate outcomes before claiming the system works

- Record a setup when it first reaches confirmed status, including signal date/time, gate/light states, setup type, entry reference, structural invalidation, and the data timestamp/source.
- Keep later outcome observations distinct from the original signal; do not rewrite historical signal state using future data.
- Summarize outcomes by setup type and market regime using the existing replay/log surface where practical.
- Do not auto-tune thresholds or imply predictive edge from a small sample. Show sample count and missing-data limitations with any performance summary.

## Compact UI Intent

- Keep existing main views and present the critical result as a short hierarchy: gate state, setup state, risk permission, then actionable missing requirements.
- Put lot availability beside position quantity and make the locked-today amount explicit.
- Put the volume data state beside the volume light.
- Reuse the existing replay/log view for outcome tracking rather than adding a permanently expanded dashboard section.
- Details may be collapsed, but no blocking risk/data state may be hidden behind a collapsed section when the app says a position is allowed.

## Acceptance Criteria

1. A setup can be shown as confirmed while position permission remains blocked by missing stop, max-loss limit, or size; the UI explains the exact blocker.
2. A theme that rises in absolute terms but fails the configured relative-strength comparison does not pass the theme gate.
3. Stock strength is evaluated against both market and mapped theme with aligned timestamps; missing/stale inputs do not pass.
4. Trend and shape cannot add two separate votes to the six-light score; funds convergence has an explicit light.
5. Same-day lots are unavailable in ordinary sell planning while prior-day lots remain available.
6. A legacy aggregate holding requires explicit available-share input or remains marked unknown; no inferred T+1 availability is presented as fact.
7. Partial intraday volume is not treated as a confirmed daily volume-ratio pass. The UI states whether the reading is intraday, completed, stale, or unavailable.
8. Setup/outcome records preserve the signal-time snapshot and distinguish unknown outcomes from losses/wins.
9. Existing watchlist, cost basis, review charts, and trade-plan data continue to load without migration loss.
10. Automated rule checks cover each changed decision boundary; the browser-facing app is checked for the updated labels/states before release.

## Out of Scope

- Automated orders, broker integration, or guaranteed stop execution.
- Claims that a signal prevents losses or guarantees profit.
- Automatically recommending a specific stock or forcing a full/empty position.
- Replacing the existing theme taxonomy or expanding every industry category in this change.
- Rebuilding all historical signals without a reliable timestamped data source.
- Automatic strategy optimization or parameter fitting.

## Open Implementation Constraint

The current app is a static local-first web app, and market-data sources may not provide aligned historical intraday volume or complete historical quote snapshots. Where trustworthy data is unavailable, the product must expose an unknown/pending state rather than fabricate certainty. Historical performance reporting must disclose that limitation.
