import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import vm from "node:vm";

const source = await readFile("outputs/stock-watch-app/trade-rules.js", "utf8");
const context = { window: {} };
vm.runInNewContext(source, context);
const rules = context.window.StockTradeRules;

assert.ok(rules, "trade rules are exposed for the app and tests");

assert.equal(rules.getRefreshDelay(60000, { tradingWindow: true, hidden: false }), 60000);
assert.equal(rules.getRefreshDelay(60000, { tradingWindow: false, hidden: false }), 300000);
assert.equal(rules.getRefreshDelay(60000, { tradingWindow: true, hidden: true }), 300000);
assert.equal(rules.getRefreshDelay(360000, { tradingWindow: false, hidden: false }), 360000);

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

const feeSettings = rules.normalizeFeeSettings({
  commissionRate: 0.001,
  commissionMin: 5,
  stampDutyRate: 0.0005,
  transferFeeRate: 0.00001,
  slippageRate: 0.0002
});
assert.equal(rules.normalizeFeeSettings({ commissionRate: 5 }).commissionRate, 0.01, "fee inputs are clamped to a sane maximum");
assert.equal(rules.estimateTradeFees(10, 100, "buy", feeSettings).total, 5.21);
assert.equal(rules.estimateTradeFees(10, 100, "sell", feeSettings).total, 5.71);
const netPosition = rules.calculateNetPosition({
  buys: [{ price: 10, shares: 100 }],
  sells: [{ price: 12, shares: 40 }],
  currentPrice: 11,
  feeSettings: { commissionRate: 0.001, commissionMin: 0, stampDutyRate: 0, transferFeeRate: 0, slippageRate: 0 }
});
assert.equal(netPosition.realizedPnl, 79.12);
assert.equal(netPosition.unrealizedPnl, 58.74);
assert.equal(netPosition.netPnl, 137.86);
assert.equal(netPosition.pnlPct, 13.77);
assert.equal(rules.calculateNetPosition({ buys: [{ price: 10, shares: 100 }], feeSettings: { commissionRate: 0, commissionMin: 0, stampDutyRate: 0, transferFeeRate: 0, slippageRate: 0 } }).netPnl, 0, "missing quotes must not be treated as a zero liquidation price");
assert.ok(netPosition.breakEvenPrice > 8.6 && netPosition.breakEvenPrice < 8.8, "net break-even must include realized gains from earlier sells");
const alreadyCovered = rules.calculateNetPosition({
  buys: [{ date: "2026-10-01", price: 10, shares: 20 }],
  sells: [{ date: "2026-10-02", price: 40, shares: 10 }],
  feeSettings: { commissionRate: 0, commissionMin: 0, stampDutyRate: 0, transferFeeRate: 0, slippageRate: 0 }
});
assert.equal(alreadyCovered.breakEvenCovered, true);
const datedNetPosition = rules.calculateNetPosition({
  buys: [{ date: "2026-10-01", price: 10, shares: 100 }, { date: "2026-10-03", price: 20, shares: 100 }],
  sells: [{ date: "2026-10-02", price: 15, shares: 100 }],
  currentPrice: 20,
  feeSettings: { commissionRate: 0, commissionMin: 0, stampDutyRate: 0, transferFeeRate: 0, slippageRate: 0 }
});
assert.equal(datedNetPosition.realizedPnl, 500, "realized cost basis must follow transaction order");
assert.equal(datedNetPosition.remainingCost, 2000);
assert.equal(datedNetPosition.sellResults[0].realizedPnl, 500);
const unmatchedSale = rules.calculateNetPosition({
  buys: [{ date: "2026-10-03", price: 20, shares: 100 }],
  sells: [{ date: "2026-10-02", price: 15, shares: 100 }],
  feeSettings: { commissionRate: 0, commissionMin: 0, stampDutyRate: 0, transferFeeRate: 0, slippageRate: 0 }
});
assert.equal(unmatchedSale.unmatchedSoldShares, 100, "sales without an earlier recorded position must be flagged");
assert.equal(rules.calculateNetPosition({
  buys: [{ date: "2026-10-02", price: 20, shares: 100 }],
  sells: [{ date: "2026-10-02", price: 21, shares: 100 }],
  feeSettings: { commissionRate: 0, commissionMin: 0, stampDutyRate: 0, transferFeeRate: 0, slippageRate: 0 }
}).unmatchedSoldShares, 100, "same-day buys must not fund a T+1 sale");
const projectedSlippage = rules.calculateNetPosition({
  buys: [{ price: 10, shares: 100 }],
  currentPrice: 10.5,
  feeSettings: { commissionRate: 0, commissionMin: 0, stampDutyRate: 0, transferFeeRate: 0, slippageRate: 0.001 }
});
assert.equal(projectedSlippage.acquisitionCost, 1000, "actual fill prices must not receive a second slippage charge");
assert.equal(projectedSlippage.estimatedExitFees, 1.05, "slippage should apply to projected liquidation");
assert.ok(rules.evaluatePositionPermission({
  setupConfirmed: true,
  entryPrice: 20,
  stopPrice: 19,
  maxLoss: 500,
  feeSettings: { commissionRate: 0.001, commissionMin: 5, stampDutyRate: 0.0005, transferFeeRate: 0.00001, slippageRate: 0.0005 }
}).suggestedShares < 500, "position sizing reserves room for estimated round-trip costs");

const forwardMetrics = rules.getForwardSignalMetrics({ sessionDate: "2026-10-01", entryReference: 10, invalidationLine: 9.6 }, [
  { date: "2026-10-01", high: 10.3, low: 9.8, close: 10.1 },
  { date: "2026-10-03", high: 11.2, low: 9.8, close: 10.8 },
  { date: "2026-10-02", high: 10.8, low: 9.9, close: 10.5 },
  { date: "2026-10-06", high: 10.7, low: 9.4, close: 9.8 },
  { date: "2026-10-07", high: 11, low: 9.7, close: 10.7 },
  { date: "2026-10-08", high: 11.4, low: 10.2, close: 11.1 },
  { date: "2026-10-09", high: 12, low: 10.5, close: 11.8 }
], { asOfDate: "2026-10-09" });
assert.equal(forwardMetrics[0].horizon, 1);
assert.equal(forwardMetrics[0].complete, true);
assert.equal(forwardMetrics[0].maxFavorablePct, 8);
assert.equal(forwardMetrics[0].maxAdversePct, -1);
assert.equal(forwardMetrics[0].invalidationHit, false);
assert.equal(forwardMetrics[1].invalidationHit, true);
assert.equal(forwardMetrics[3].complete, false, "incomplete forward horizons must not enter statistics");
assert.equal(rules.summarizeForwardMetrics([forwardMetrics], [1, 3])[0].sampleCount, 1);
assert.equal(rules.summarizeForwardMetrics([forwardMetrics], [5])[0].sampleCount, 1);
assert.equal(rules.summarizeForwardMetrics([forwardMetrics], [10])[0].sampleCount, 0);
assert.equal(rules.getForwardSignalMetrics({ sessionDate: "2026-10-01", entryReference: 10 }, [
  { date: "2026-10-04", high: 11, low: 9, close: 10.5 }
])[0].complete, false, "missing anchor bars must not be counted as a forward sample");

const volumeProfile = rules.calculateVolumeProfile([
  { low: 10, high: 10.4, close: 10.2, volume: 100 },
  { low: 10.2, high: 10.6, close: 10.5, volume: 300 },
  { low: 10.6, high: 11, close: 10.8, volume: 100 }
], { priceStep: 0.2, valueAreaPercent: 0.7 });
assert.equal(volumeProfile.totalVolume, 500);
assert.equal(volumeProfile.poc, 10.3);
assert.equal(volumeProfile.lower, 10.2);
assert.equal(volumeProfile.upper, 10.6);
assert.equal(volumeProfile.valueAreaPercent, 0.7);
assert.equal(volumeProfile.volumeWeightedCenter, 10.386);
const separatedProfile = rules.calculateVolumeProfile([
  { low: 10, high: 10.2, volume: 100 },
  { low: 11, high: 11.2, volume: 100 }
], { priceStep: 0.2, valueAreaPercent: 0.75 });
assert.equal(separatedProfile.areaVolume, 200, "the value area must cross empty price bins when needed to reach its target volume");
assert.equal(separatedProfile.lower, 10);
assert.equal(separatedProfile.upper, 11.2);
assert.equal(rules.calculateVolumeProfile([]), null, "no bars must not fabricate a cost zone");
assert.equal(rules.calculateVolumeProfile([{ low: 11, high: 10, close: 10.5, volume: 100 }]), null, "invalid bars must be ignored");

assert.equal(rules.evaluateDecisionDataGate({ ready: true, timestamps: [1000, 1100, 1200, 1300], now: 1400 }).state, "pass");
assert.equal(rules.evaluateDecisionDataGate({ ready: false, timestamps: [1000, 1100, 1200, 1300], now: 1400 }).state, "wait");
assert.equal(rules.evaluateDecisionDataGate({ ready: true, timestamps: [1000, 1100, 1200, null], now: 1400 }).state, "wait");
assert.equal(rules.evaluateDecisionDataGate({ ready: true, timestamps: [1000, 1100, 1200, 1300], now: 300000 }).state, "wait");
assert.equal(rules.resolveCanonicalDecision({ dataState: "wait", buyState: "confirmed" }).state, "wait");
assert.equal(rules.resolveCanonicalDecision({ dataState: "pass", buyState: "confirmed" }).state, "confirmed");
assert.equal(rules.resolveCanonicalDecision({ dataState: "pass", holding: true, sellAction: "clear", buyState: "confirmed" }).state, "sell");

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
