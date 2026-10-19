import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import vm from "node:vm";

const source = await readFile("outputs/stock-watch-app/trade-rules.js", "utf8");
const context = { window: {} };
vm.runInNewContext(source, context);
const rules = context.window.StockTradeRules;

assert.ok(rules, "trade rules are exposed for the app and tests");

const allGates = ["pass", "pass", "pass"];
const allLights = Array(6).fill("pass");

assert.equal(rules.evaluateBuySignal({
  dataReady: true,
  snapshotCoherent: true,
  gates: allGates,
  lights: allLights,
  structureSignal: true,
  closeConfirmed: true
}).state, "confirmed");

assert.equal(rules.evaluateBuySignal({
  dataReady: true,
  snapshotCoherent: true,
  gates: allGates,
  lights: allLights,
  structureSignal: false,
  closeConfirmed: true
}).state, "wait");

assert.equal(rules.evaluateThemeGate({ source: "默认", change: 0, marketAvg: -0.8, strength: 5 }).state, "wait");
assert.equal(rules.evaluateThemeGate({ source: "动态", change: 0.5, marketAvg: -0.8, strength: 4 }).state, "pass");
assert.equal(rules.evaluateThemeGate({ source: "动态", change: 0.5, marketAvg: -0.8, strength: 3 }).state, "block");
assert.equal(rules.evaluateThemeGate({ source: "动态", change: 1.2, marketAvg: 1.4, strength: 5 }).state, "block", "absolute rise must not bypass relative weakness");
assert.equal(rules.evaluateThemeGate({ source: "动态", change: null, marketAvg: -0.8, strength: 5 }).state, "wait");
assert.equal(JSON.stringify(rules.evaluateStockGate({ stockChange: 3, themeChange: 2, marketChange: 1 })), JSON.stringify({ state: "pass", relativeToTheme: 1, relativeToMarket: 2 }));
assert.equal(rules.evaluateStockGate({ stockChange: 2, themeChange: 3, marketChange: 0 }).state, "block");
assert.equal(rules.evaluateStockGate({ stockChange: 3, themeChange: null, marketChange: 0 }).state, "wait");
assert.equal(rules.getBenchmarkAverageChange([]), null, "missing benchmark data must not become a flat 0% market");
assert.equal(rules.getBenchmarkAverageChange([{ changePercent: 1 }, { changePercent: -1 }]), 0);
assert.equal(rules.isTransactionDateAllowed("2026-10-20", "2026-10-19"), false);
assert.equal(rules.isTransactionDateAllowed("2026-10-19", "2026-10-19"), true);
assert.equal(rules.isTransactionDateAllowed("not-a-date", "2026-10-19"), false);
assert.deepEqual(rules.getEligibleTransactionIds([
  { id: "baseline", date: "2026-10-18" },
  { id: "failed", date: "2026-10-18" },
  { id: "future", date: "2026-10-20" }
], { excludeIds: ["failed"], todayKey: "2026-10-19" }), ["baseline"], "failed and future trades must not be rebased as applied");
assert.equal(rules.getEffectiveStopLine(10, 12), 12);
assert.equal(rules.getEffectiveStopLine(10, 9), 10);

assert.equal(JSON.stringify(rules.evaluatePositionPermission({ setupConfirmed: true, entryPrice: 20, stopPrice: 19, maxLoss: 500 })), JSON.stringify({
  allowed: true, reason: "按风险预算可试错", suggestedShares: 500, suggestedLots: 5
}));
assert.equal(rules.evaluatePositionPermission({ setupConfirmed: false, entryPrice: 20, stopPrice: 19, maxLoss: 500 }).allowed, false);
assert.equal(rules.evaluatePositionPermission({ setupConfirmed: true, entryPrice: 20, stopPrice: 19, maxLoss: 50 }).reason, "风险预算不足一手");
assert.equal(rules.evaluatePositionPermission({ setupConfirmed: true, entryPrice: 20, stopPrice: 20, maxLoss: 500 }).allowed, false);

assert.equal(JSON.stringify(rules.getLotAvailability([
  { buyDate: "2026-10-18", shares: 300 },
  { buyDate: "2026-10-19", shares: 200 }
], "2026-10-19")), JSON.stringify({ totalShares: 500, availableShares: 300, lockedShares: 200, unknown: false, legacy: false }));
assert.equal(JSON.stringify(rules.getLotAvailability([], "2026-10-19", 400)), JSON.stringify({ totalShares: null, availableShares: 400, lockedShares: null, unknown: false, legacy: true }));
assert.equal(rules.getLotAvailability([], "2026-10-19", 400, 300).unknown, true);
assert.equal(rules.getLotAvailability([], "2026-10-19").unknown, true);
assert.equal(JSON.stringify(rules.consumeSellFromLots([
  { buyDate: "2026-10-18", shares: 300 },
  { buyDate: "2026-10-19", shares: 200 }
], 200, "2026-10-19", null, 500)), JSON.stringify({ allowed: true, lots: [{ buyDate: "2026-10-18", shares: 100 }, { buyDate: "2026-10-19", shares: 200 }], legacyAvailableShares: null }));
assert.equal(JSON.stringify(rules.checkSellAgainstLots([
  { buyDate: "2026-10-18", shares: 300 },
  { buyDate: "2026-10-19", shares: 200 }
], 400, "2026-10-19")), JSON.stringify({ allowed: false, availableShares: 300, shortfallShares: 100 }));

assert.equal(rules.resolveVolumeLight({ volumeRatio: 1.8, sessionClosed: false, sameTimeComparable: false }).state, "wait");
assert.equal(rules.resolveVolumeLight({ volumeRatio: 1.8, changePercent: 1, sessionClosed: true, sameTimeComparable: false }).state, "pass");
assert.equal(rules.resolveVolumeLight({ volumeRatio: 1.8, changePercent: 1, sessionClosed: false, sameTimeComparable: true }).state, "pass");
assert.equal(rules.resolveVolumeLight({ volumeRatio: null, sessionClosed: false, sameTimeComparable: false }).state, "wait");
assert.equal(rules.resolveVolumeLight({ volumeRatio: 1.8, sessionClosed: true, sameTimeComparable: false, barCurrent: false }).source, "stale", "stale daily bars must not confirm volume");

const signalRecords = rules.appendSignalSnapshot([], { id: "s1", state: "confirmed", code: "002156", capturedAt: 1, gates: ["pass"] });
assert.equal(signalRecords.length, 1);
assert.equal(rules.appendSignalSnapshot(signalRecords, { id: "s1", state: "confirmed", code: "002156", capturedAt: 2 }).length, 1, "signal-time snapshot is immutable");
assert.equal(rules.appendSignalSnapshot(signalRecords, { id: "s2", state: "candidate", code: "002156" }).length, 1);
assert.equal(rules.appendSignalOutcome([], { signalId: "s1", result: "unknown" })[0].result, "unknown");

assert.equal(rules.evaluateBuySignal({
  dataReady: true,
  snapshotCoherent: true,
  gates: allGates,
  lights: allLights,
  structureSignal: true,
  closeConfirmed: false
}).state, "candidate");

assert.equal(rules.evaluateBuySignal({
  dataReady: true,
  snapshotCoherent: true,
  gates: ["pass", "block", "pass"],
  lights: allLights,
  structureSignal: true,
  closeConfirmed: true
}).state, "blocked");

assert.equal(rules.evaluateBuySignal({
  dataReady: true,
  snapshotCoherent: true,
  gates: allGates,
  lights: ["pass", "pass", "wait", "pass", "pass", "pass"],
  structureSignal: true,
  closeConfirmed: true
}).state, "wait");

assert.equal(rules.isSnapshotCoherent([1000, 1400, 1800, 2000], 1200), true);
assert.equal(rules.isSnapshotCoherent([1000, 1400, 1800, 2401], 1200), false);
assert.equal(rules.isSnapshotCoherent([1000, null, 1800], 1200), false);
assert.equal(rules.isSnapshotCoherent([1000, 1100, 1200], 1200, 2000, 1200), true);
assert.equal(rules.isSnapshotCoherent([1000, 1100, 1200], 1200, 3000, 1200), false);

assert.equal(rules.resolveSellGate({ holding: true, sellTiming: "hard-stop", stopTouched: true }).action, "clear");
assert.equal(rules.resolveSellGate({ holding: true, sellTiming: "hard-stop", stopTouched: false, structureTouched: true, closeConfirmed: false }).action, "wait-close");
assert.equal(rules.resolveSellGate({ holding: true, sellTiming: "hard-stop", stopTouched: false, structureTouched: true, closeConfirmed: true }).action, "clear");
assert.equal(rules.resolveSellGate({ holding: true, sellTiming: "close-confirm", stopTouched: true, closeConfirmed: false }).action, "wait-close");
assert.equal(rules.resolveSellGate({ holding: true, sellTiming: "close-confirm", stopTouched: true, closeConfirmed: true }).action, "clear");
assert.equal(rules.resolveSellGate({ holding: true, sellTiming: "reduce-first", stopTouched: true, closeConfirmed: false }).action, "reduce-half");
assert.equal(rules.resolveSellGate({ holding: true, sellTiming: "reduce-first", stopTouched: true, closeConfirmed: true }).action, "clear");
assert.equal(rules.resolveSellGate({ holding: false, sellTiming: "hard-stop", stopTouched: true }).action, "none");

const validAdd = {
  holding: true,
  profitable: true,
  freshBuyConfirmed: true,
  gatesOpen: true,
  sixLightsPass: true,
  structureIntact: true,
  supportOk: true,
  volumeDanger: false,
  withinRiskBudget: true
};
assert.equal(rules.evaluateScaleIn(validAdd).allowed, true);
assert.equal(rules.evaluateScaleIn({ ...validAdd, profitable: false }).allowed, false);
assert.equal(rules.evaluateScaleIn({ ...validAdd, gatesOpen: false }).allowed, false);
assert.equal(rules.evaluateScaleIn({ ...validAdd, freshBuyConfirmed: false }).allowed, false);
assert.equal(rules.evaluateScaleIn({ ...validAdd, withinRiskBudget: false }).allowed, false);
assert.equal(rules.evaluateScaleIn({ ...validAdd, structureIntact: false }).allowed, false);
assert.equal(rules.evaluateScaleIn({ ...validAdd, supportOk: false }).allowed, false);
assert.equal(rules.evaluateScaleIn({ ...validAdd, volumeDanger: true }).allowed, false);

const sorted = [
  { id: "low", score: 42, holding: false },
  { id: "holding", score: 62, holding: true },
  { id: "high", score: 86, holding: false },
  { id: "buy", score: 70, confirmedBuy: true, holding: false },
  { id: "sell", score: 35, urgentSell: true, holding: true, retired: true }
].sort(rules.compareWatchItems);
assert.deepEqual(sorted.map((item) => item.id), ["sell", "buy", "high", "holding", "low"]);

console.log("Trade-rule verification passed");
