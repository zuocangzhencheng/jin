(function attachStockTradeRules(root) {
  function isSnapshotCoherent(times, maxSkewMs = 60000, now = null, maxAgeMs = 120000) {
    if (!Array.isArray(times) || times.length < 3 || times.some((time) => !Number.isFinite(time) || time <= 0)) return false;
    const oldest = Math.min(...times);
    const newest = Math.max(...times);
    if (newest - oldest > maxSkewMs) return false;
    return now === null || (now >= newest && now - oldest <= maxAgeMs);
  }

  function evaluateBuySignal({ dataReady, snapshotCoherent, gates = [], lights = [], structureSignal, closeConfirmed }) {
    if (!dataReady) return { state: "blocked", reason: "数据不可靠" };
    if (!snapshotCoherent) return { state: "wait", reason: "数据时间未对齐" };
    if (gates.length !== 3 || gates.some((state) => state !== "pass")) {
      return { state: gates.includes("block") ? "blocked" : "wait", reason: "三闸门未全开" };
    }
    if (lights.length !== 6 || lights.some((state) => state !== "pass")) {
      return { state: "wait", reason: "六灯未全亮" };
    }
    if (!structureSignal) return { state: "wait", reason: "缺少结构触发" };
    if (!closeConfirmed) return { state: "candidate", reason: "盘中候选，等收盘确认" };
    return { state: "confirmed", reason: "三闸门、六灯和结构均收盘确认" };
  }

  function evaluateThemeGate({ source, change, marketAvg, strength }) {
    if (source !== "动态" || !Number.isFinite(change) || !Number.isFinite(marketAvg)) {
      return { state: "wait", relative: null };
    }
    const relative = change - marketAvg;
    const pass = strength >= 4 && relative >= 0.6;
    return { state: pass ? "pass" : "block", relative };
  }

  function evaluateStockGate({ stockChange, themeChange, marketChange, marketEdge = 0.6, themeEdge = 0.3 }) {
    if (![stockChange, themeChange, marketChange].every(Number.isFinite)) {
      return { state: "wait", relativeToTheme: null, relativeToMarket: null };
    }
    const relativeToTheme = stockChange - themeChange;
    const relativeToMarket = stockChange - marketChange;
    const state = relativeToTheme >= themeEdge && relativeToMarket >= marketEdge ? "pass" : "block";
    return { state, relativeToTheme, relativeToMarket };
  }

  function getBenchmarkAverageChange(indexes) {
    const changes = (Array.isArray(indexes) ? indexes : [])
      .map((item) => Number(item?.changePercent))
      .filter(Number.isFinite);
    return changes.length ? changes.reduce((sum, value) => sum + value, 0) / changes.length : null;
  }

  function isTransactionDateAllowed(dateKey, todayKey) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(String(dateKey || "")) || !/^\d{4}-\d{2}-\d{2}$/.test(String(todayKey || ""))) return false;
    const parsed = new Date(`${dateKey}T00:00:00Z`);
    return Number.isFinite(parsed.getTime()) && parsed.toISOString().slice(0, 10) === dateKey && dateKey <= todayKey;
  }

  function getEligibleTransactionIds(rows, { excludeIds = [], todayKey } = {}) {
    const excluded = new Set([...excludeIds].map(String));
    return (Array.isArray(rows) ? rows : [])
      .filter((item) => item?.id && !excluded.has(String(item.id)) && isTransactionDateAllowed(String(item.date || ""), todayKey))
      .map((item) => String(item.id));
  }

  function evaluatePositionPermission({ setupConfirmed, entryPrice, stopPrice, maxLoss, lotSize = 100 }) {
    if (!setupConfirmed) return { allowed: false, reason: "买点尚未确认", suggestedShares: 0, suggestedLots: 0 };
    if (![entryPrice, stopPrice, maxLoss, lotSize].every(Number.isFinite) || entryPrice <= 0 || stopPrice <= 0 || stopPrice >= entryPrice || maxLoss <= 0 || lotSize <= 0) {
      return { allowed: false, reason: "买入价、结构止损或最大亏损无效", suggestedShares: 0, suggestedLots: 0 };
    }
    const rawShares = Math.floor(maxLoss / (entryPrice - stopPrice));
    const suggestedShares = Math.floor(rawShares / lotSize) * lotSize;
    if (!suggestedShares) return { allowed: false, reason: "风险预算不足一手", suggestedShares: 0, suggestedLots: 0 };
    return {
      allowed: true,
      reason: "按风险预算可试错",
      suggestedShares,
      suggestedLots: suggestedShares / lotSize
    };
  }

  function getLotAvailability(lots, dateKey, legacyAvailableShares, totalPositionShares = null) {
    const datedLots = Array.isArray(lots) ? lots : [];
    const hasLegacy = legacyAvailableShares !== null && legacyAvailableShares !== undefined && legacyAvailableShares !== "" && Number.isFinite(Number(legacyAvailableShares)) && Number(legacyAvailableShares) >= 0;
    const hasTotal = totalPositionShares !== null && totalPositionShares !== undefined && totalPositionShares !== "" && Number.isFinite(Number(totalPositionShares));
    const legacyAvailable = hasLegacy ? Math.floor(Number(legacyAvailableShares)) : 0;
    if (!datedLots.length) {
      if (hasLegacy) {
        const total = hasTotal ? Math.floor(Number(totalPositionShares)) : null;
        const inconsistent = total !== null && legacyAvailable > total;
        return { totalShares: total, availableShares: total === null ? legacyAvailable : Math.min(legacyAvailable, total), lockedShares: null, unknown: inconsistent, legacy: true };
      }
      return { totalShares: null, availableShares: null, lockedShares: null, unknown: true, legacy: true };
    }

    let totalShares = legacyAvailable;
    let availableShares = legacyAvailable;
    let lockedShares = 0;
    let unknown = false;
    datedLots.forEach((lot) => {
      const shares = Math.max(0, Math.floor(Number(lot.shares) || 0));
      if (!shares) return;
      totalShares += shares;
      if (!/^\d{4}-\d{2}-\d{2}$/.test(String(lot.buyDate || ""))) {
        unknown = true;
      } else if (lot.buyDate === dateKey) {
        lockedShares += shares;
      } else if (lot.buyDate < dateKey) {
        availableShares += shares;
      } else {
        unknown = true;
      }
    });
    if (hasTotal && Math.floor(Number(totalPositionShares)) !== totalShares) unknown = true;
    return { totalShares, availableShares, lockedShares, unknown, legacy: hasLegacy };
  }

  function checkSellAgainstLots(lots, requestedShares, dateKey, legacyAvailableShares = null, totalPositionShares = null) {
    const availability = getLotAvailability(lots, dateKey, legacyAvailableShares, totalPositionShares);
    const requested = Math.max(0, Math.floor(Number(requestedShares) || 0));
    if (availability.unknown || availability.availableShares === null) {
      return { allowed: false, availableShares: availability.availableShares, shortfallShares: null };
    }
    const shortfallShares = Math.max(0, requested - availability.availableShares);
    return {
      allowed: requested > 0 && shortfallShares === 0,
      availableShares: availability.availableShares,
      shortfallShares
    };
  }

  function consumeSellFromLots(lots, requestedShares, dateKey, legacyAvailableShares = null, totalPositionShares = null) {
    const requested = Math.max(0, Math.floor(Number(requestedShares) || 0));
    const check = checkSellAgainstLots(lots, requested, dateKey, legacyAvailableShares, totalPositionShares);
    const sourceLots = Array.isArray(lots) ? lots : [];
    if (!check.allowed) return { allowed: false, lots: sourceLots.map((lot) => ({ ...lot })), legacyAvailableShares };

    let remaining = requested;
    const hasLegacy = legacyAvailableShares !== null && legacyAvailableShares !== undefined && legacyAvailableShares !== "" && Number.isFinite(Number(legacyAvailableShares));
    let legacy = hasLegacy ? Math.floor(Number(legacyAvailableShares)) : null;
    if (legacy !== null) {
      const fromLegacy = Math.min(legacy, remaining);
      legacy -= fromLegacy;
      remaining -= fromLegacy;
    }

    const nextLots = sourceLots.map((lot) => ({ ...lot }));
    const availableLots = nextLots
      .map((lot, index) => ({ lot, index }))
      .filter(({ lot }) => String(lot.buyDate || "") < dateKey)
      .sort((a, b) => String(a.lot.buyDate).localeCompare(String(b.lot.buyDate)));
    for (const { lot, index } of availableLots) {
      if (!remaining) break;
      const take = Math.min(Math.max(0, Math.floor(Number(lot.shares) || 0)), remaining);
      nextLots[index].shares = Math.max(0, Math.floor(Number(lot.shares) || 0) - take);
      remaining -= take;
    }
    return {
      allowed: remaining === 0,
      lots: nextLots.filter((lot) => Number(lot.shares) > 0),
      legacyAvailableShares: legacy
    };
  }

  function resolveVolumeLight({ volumeRatio, sessionClosed, sameTimeComparable, changePercent = 0, trendStrong = false, fresh = true, barCurrent = true }) {
    const source = sessionClosed ? "completed-daily" : sameTimeComparable ? "intraday-comparable" : "intraday-pending";
    if (!fresh || !barCurrent || !Number.isFinite(volumeRatio) || (!sessionClosed && !sameTimeComparable)) {
      const stale = !fresh || !barCurrent;
      return { state: "wait", source: stale ? "stale" : source, reason: stale ? "K线日期过期" : "等待收盘量或同时间量能对比" };
    }
    if (volumeRatio >= 2 && changePercent <= 0) {
      return { state: "block", source, reason: "放量下跌/分歧" };
    }
    if ((volumeRatio >= 1.2 && changePercent > 0) || (volumeRatio < 0.8 && trendStrong && changePercent >= -1.5)) {
      return { state: "pass", source, reason: source === "completed-daily" ? "日量能条件通过" : "同时间盘中量能条件通过" };
    }
    return { state: "wait", source, reason: "量价条件未确认" };
  }

  function appendSignalSnapshot(records, snapshot) {
    const list = Array.isArray(records) ? records : [];
    if (!snapshot || snapshot.state !== "confirmed" || !snapshot.id || list.some((item) => item.id === snapshot.id)) return list.slice();
    return [...list, JSON.parse(JSON.stringify(snapshot))];
  }

  function appendSignalOutcome(outcomes, observation) {
    const list = Array.isArray(outcomes) ? outcomes : [];
    if (!observation || !observation.signalId) return list.slice();
    if (observation.result !== "target" && observation.result !== "invalidated" && observation.result !== "unknown") return list.slice();
    if (observation.id && list.some((item) => item.id === observation.id)) return list.slice();
    return [...list, JSON.parse(JSON.stringify(observation))];
  }

  function getEffectiveStopLine(plannedLine, dynamicLine) {
    const candidates = [plannedLine, dynamicLine].map(Number).filter((line) => Number.isFinite(line) && line > 0);
    return candidates.length ? Math.max(...candidates) : 0;
  }

  function resolveSellGate({ holding, sellTiming, stopTouched, structureTouched = false, closeConfirmed, reduceSignal = false }) {
    if (!holding) return { action: "none", reason: "非持仓" };
    const anyLineTouched = stopTouched || structureTouched;
    if (stopTouched && sellTiming === "hard-stop") {
      return { action: "clear", reason: "止损触发" };
    }
    if (anyLineTouched && closeConfirmed) {
      return { action: "clear", reason: "收盘破位确认" };
    }
    if (anyLineTouched && sellTiming === "reduce-first") {
      return { action: "reduce-half", reason: "盘中触线先减半" };
    }
    if (anyLineTouched) return { action: "wait-close", reason: "盘中触线，等收盘确认" };
    if (reduceSignal) return { action: "reduce", reason: "风险信号减仓" };
    return { action: "hold", reason: "未触发卖出条件" };
  }

  function evaluateScaleIn(input) {
    const required = [
      "holding",
      "profitable",
      "freshBuyConfirmed",
      "gatesOpen",
      "sixLightsPass",
      "structureIntact",
      "supportOk",
      "withinRiskBudget"
    ];
    const blockedBy = required.filter((key) => !input[key]);
    if (input.volumeDanger) blockedBy.push("volumeDanger");
    return { allowed: blockedBy.length === 0, blockedBy };
  }

  function getWatchRank(item) {
    if (item.urgentSell) return 0;
    if (item.retired) return 5;
    if (item.confirmedBuy) return 1;
    if (item.holding) return 3;
    return item.score >= 70 ? 2 : 4;
  }

  function compareWatchItems(a, b) {
    const aRank = a.sortMeta?.rank ?? getWatchRank(a.sortMeta || a);
    const bRank = b.sortMeta?.rank ?? getWatchRank(b.sortMeta || b);
    if (aRank !== bRank) return aRank - bRank;
    if (b.analysis?.score !== a.analysis?.score) return (b.analysis?.score || 0) - (a.analysis?.score || 0);
    return (a.sortMeta?.index || 0) - (b.sortMeta?.index || 0);
  }

  root.StockTradeRules = Object.freeze({
    isSnapshotCoherent,
    evaluateBuySignal,
    evaluateThemeGate,
    evaluateStockGate,
    getBenchmarkAverageChange,
    isTransactionDateAllowed,
    getEligibleTransactionIds,
    evaluatePositionPermission,
    getLotAvailability,
    checkSellAgainstLots,
    consumeSellFromLots,
    resolveVolumeLight,
    appendSignalSnapshot,
    appendSignalOutcome,
    getEffectiveStopLine,
    resolveSellGate,
    evaluateScaleIn,
    getWatchRank,
    compareWatchItems
  });
})(window);
