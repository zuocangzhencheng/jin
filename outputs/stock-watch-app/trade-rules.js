(function attachStockTradeRules(root) {
  const DEFAULT_FEE_SETTINGS = Object.freeze({
    commissionRate: 0.00025,
    commissionMin: 5,
    stampDutyRate: 0.0005,
    transferFeeRate: 0.00001,
    slippageRate: 0
  });

  function roundMoney(value) {
    return Math.round((Number(value) + Number.EPSILON) * 100) / 100;
  }

  function normalizeFeeSettings(settings = {}) {
    const limits = { commissionRate: 0.01, commissionMin: 100, stampDutyRate: 0.01, transferFeeRate: 0.01, slippageRate: 0.01 };
    const next = {};
    Object.keys(DEFAULT_FEE_SETTINGS).forEach((key) => {
      const value = Number(settings[key]);
      next[key] = Number.isFinite(value) && value >= 0 ? Math.min(value, limits[key]) : DEFAULT_FEE_SETTINGS[key];
    });
    return next;
  }

  function estimateTradeFees(price, shares, side = "buy", settings = {}, { includeSlippage = true } = {}) {
    const normalized = normalizeFeeSettings(settings);
    const amount = Math.max(0, Number(price) || 0) * Math.max(0, Number(shares) || 0);
    if (!amount) return { amount: 0, commission: 0, stampDuty: 0, transferFee: 0, slippage: 0, total: 0 };
    const sell = side === "sell";
    const commission = Math.max(amount * normalized.commissionRate, normalized.commissionMin);
    const stampDuty = sell ? amount * normalized.stampDutyRate : 0;
    const transferFee = amount * normalized.transferFeeRate;
    const slippage = includeSlippage ? amount * normalized.slippageRate : 0;
    return {
      amount: roundMoney(amount),
      commission: roundMoney(commission),
      stampDuty: roundMoney(stampDuty),
      transferFee: roundMoney(transferFee),
      slippage: roundMoney(slippage),
      total: roundMoney(commission + stampDuty + transferFee + slippage)
    };
  }

  function calculateNetPosition({ buys = [], sells = [], currentPrice = 0, feeSettings = {} } = {}) {
    const validBuys = (Array.isArray(buys) ? buys : []).filter((item) => Number(item?.price) > 0 && Number(item?.shares) > 0);
    const validSells = (Array.isArray(sells) ? sells : []).filter((item) => Number(item?.price) > 0 && Number(item?.shares) > 0);
    const totalShares = validBuys.reduce((sum, item) => sum + Number(item.shares), 0);
    const grossBuyCost = validBuys.reduce((sum, item) => sum + Number(item.price) * Number(item.shares), 0);
    const buyFees = validBuys.reduce((sum, item) => sum + estimateTradeFees(item.price, item.shares, "buy", feeSettings, { includeSlippage: false }).total, 0);
    const acquisitionCost = roundMoney(grossBuyCost + buyFees);
    const events = [
      ...validBuys.map((item) => ({ ...item, kind: "buy" })),
      ...validSells.map((item) => ({ ...item, kind: "sell" }))
    ].sort((a, b) => {
      const dateDiff = String(a.date || "").localeCompare(String(b.date || ""));
      if (dateDiff) return dateDiff;
      if (a.date && b.date && a.kind !== b.kind) return a.kind === "sell" ? -1 : 1;
      const timeDiff = String(a.at || "").localeCompare(String(b.at || ""));
      return timeDiff || (a.kind === b.kind ? 0 : a.kind === "buy" ? -1 : 1);
    });
    let remainingShares = 0;
    let remainingCost = 0;
    let realizedPnl = 0;
    let soldShares = 0;
    let grossSoldAmount = 0;
    let sellFees = 0;
    let unmatchedSoldShares = 0;
    const sellResults = [];

    events.forEach((item) => {
      const shares = Number(item.shares);
      if (item.kind === "buy") {
        remainingShares += shares;
        remainingCost += Number(item.price) * shares + estimateTradeFees(item.price, shares, "buy", feeSettings, { includeSlippage: false }).total;
        return;
      }
      const matchedShares = Math.min(shares, remainingShares);
      const fees = estimateTradeFees(item.price, shares, "sell", feeSettings, { includeSlippage: false }).total;
      const matchedFees = shares ? fees * matchedShares / shares : 0;
      const matchedProceeds = Number(item.price) * matchedShares - matchedFees;
      const matchedCost = remainingShares ? remainingCost * matchedShares / remainingShares : 0;
      const sellPnl = matchedProceeds - matchedCost;
      realizedPnl += sellPnl;
      sellResults.push({
        id: String(item.id || ""),
        date: String(item.date || ""),
        shares,
        matchedShares,
        grossAmount: roundMoney(Number(item.price) * shares),
        fees: roundMoney(fees),
        realizedPnl: roundMoney(sellPnl),
        pnlPct: matchedCost ? roundMoney(sellPnl / matchedCost * 100) : 0
      });
      remainingCost -= matchedCost;
      sellFees += fees;
      grossSoldAmount += Number(item.price) * shares;
      soldShares += matchedShares;
      remainingShares -= matchedShares;
      unmatchedSoldShares += shares - matchedShares;
    });

    const averageNetCost = remainingShares ? remainingCost / remainingShares : totalShares ? acquisitionCost / totalShares : 0;
    const price = Number(currentPrice) > 0 ? Number(currentPrice) : 0;
    const currentValue = price * remainingShares;
    const estimatedExitFees = price && remainingShares ? estimateTradeFees(price, remainingShares, "sell", feeSettings).total : 0;
    const netLiquidationValue = roundMoney(currentValue - estimatedExitFees);
    const unrealizedPnl = price ? roundMoney(netLiquidationValue - remainingCost) : 0;
    const netPnl = roundMoney(realizedPnl + unrealizedPnl);
    const pnlPct = acquisitionCost ? netPnl / acquisitionCost * 100 : 0;
    let breakEvenPrice = null;
    const breakEvenCovered = Boolean(remainingShares && realizedPnl >= remainingCost);
    const breakEvenTarget = remainingCost - realizedPnl;
    if (remainingShares && breakEvenTarget > 0) {
      let low = 0;
      let high = Math.max(breakEvenTarget / remainingShares * 2, price * 2, 1);
      for (let index = 0; index < 60; index += 1) {
        const middle = (low + high) / 2;
        const netProceeds = middle * remainingShares - estimateTradeFees(middle, remainingShares, "sell", feeSettings).total;
        if (netProceeds >= breakEvenTarget) high = middle;
        else low = middle;
      }
      breakEvenPrice = Math.round(high * 1000) / 1000;
    }

    return {
      totalShares,
      grossBuyCost: roundMoney(grossBuyCost),
      buyFees: roundMoney(buyFees),
      acquisitionCost,
      averageNetCost: totalShares ? roundMoney(averageNetCost * 1000) / 1000 : 0,
      soldShares,
      grossSoldAmount: roundMoney(grossSoldAmount),
      sellFees: roundMoney(sellFees),
      realizedPnl: roundMoney(realizedPnl),
      remainingShares,
      remainingCost: roundMoney(remainingCost),
      currentPrice: price,
      currentValue: roundMoney(currentValue),
      estimatedExitFees,
      netLiquidationValue,
      unrealizedPnl,
      netPnl,
      pnlPct: roundMoney(pnlPct),
      breakEvenPrice,
      breakEvenCovered,
      unmatchedSoldShares,
      sellResults
    };
  }

  function getForwardSignalMetrics(snapshot, bars, { horizons = [1, 3, 5, 10], asOfDate = null } = {}) {
    const sessionDate = String(snapshot?.sessionDate || "").slice(0, 10);
    const entry = Number(snapshot?.entryReference);
    const invalidationLine = Number(snapshot?.invalidationLine);
    const orderedBars = (Array.isArray(bars) ? bars : [])
      .filter((bar) => {
        const date = String(bar?.date || "").slice(0, 10);
        return /^\d{4}-\d{2}-\d{2}$/.test(date) && (!asOfDate || date <= asOfDate) && bar.complete !== false
          && [bar.high, bar.low, bar.close].every((value) => Number.isFinite(Number(value)));
      })
      .slice()
      .sort((a, b) => String(a.date).localeCompare(String(b.date)));
    const hasAnchor = orderedBars.some((bar) => String(bar.date).slice(0, 10) === sessionDate);
    const forwardBars = orderedBars.filter((bar) => String(bar.date).slice(0, 10) > sessionDate);

    return horizons.map((horizon) => {
      const count = Math.max(1, Math.floor(Number(horizon) || 1));
      const complete = hasAnchor && forwardBars.length >= count && entry > 0;
      const windowBars = complete ? forwardBars.slice(0, count) : [];
      if (!complete) return { horizon: count, complete: false, observedSessions: Math.min(forwardBars.length, count), closeReturnPct: null, maxFavorablePct: null, maxAdversePct: null, invalidationHit: null, throughDate: forwardBars.at(-1)?.date || null };
      const highs = windowBars.map((bar) => Number(bar.high));
      const lows = windowBars.map((bar) => Number(bar.low));
      const close = Number(windowBars.at(-1).close);
      return {
        horizon: count,
        complete: true,
        observedSessions: count,
        closeReturnPct: roundMoney((close / entry - 1) * 100),
        maxFavorablePct: roundMoney((Math.max(...highs) / entry - 1) * 100),
        maxAdversePct: roundMoney((Math.min(...lows) / entry - 1) * 100),
        invalidationHit: invalidationLine > 0 ? lows.some((low) => low <= invalidationLine) : null,
        throughDate: windowBars.at(-1).date
      };
    });
  }

  function summarizeForwardMetrics(records, horizons = [1, 3, 5, 10]) {
    const rows = (Array.isArray(records) ? records : []).flat();
    return horizons.map((horizon) => {
      const metrics = rows.map((record) => Array.isArray(record) ? record.find((item) => item.horizon === horizon) : record?.horizon === horizon ? record : null)
        .filter((item) => item?.complete);
      const average = (key) => metrics.length ? roundMoney(metrics.reduce((sum, item) => sum + Number(item[key] || 0), 0) / metrics.length) : null;
      return {
        horizon,
        sampleCount: metrics.length,
        positiveRatePct: metrics.length ? roundMoney(metrics.filter((item) => item.closeReturnPct > 0).length / metrics.length * 100) : null,
        averageCloseReturnPct: average("closeReturnPct"),
        averageMaxFavorablePct: average("maxFavorablePct"),
        averageMaxAdversePct: average("maxAdversePct"),
        invalidationHits: metrics.filter((item) => item.invalidationHit === true).length
      };
    });
  }

  function calculateVolumeProfile(bars, { valueAreaPercent = 0.7, priceStep = null } = {}) {
    const validBars = (Array.isArray(bars) ? bars : []).map((bar) => ({
      low: Number(bar?.low),
      high: Number(bar?.high),
      volume: Number(bar?.volume)
    })).filter((bar) => [bar.low, bar.high, bar.volume].every(Number.isFinite)
      && bar.low > 0 && bar.high >= bar.low && bar.volume > 0);
    if (!validBars.length) return null;

    const middlePrices = validBars.map((bar) => (bar.low + bar.high) / 2).sort((a, b) => a - b);
    const medianPrice = middlePrices[Math.floor(middlePrices.length / 2)];
    const step = Math.max(0.01, Number(priceStep) > 0 ? Number(priceStep) : Math.round(medianPrice * 0.005 * 100) / 100);
    const bins = new Map();
    const addVolume = (index, volume) => bins.set(index, (bins.get(index) || 0) + volume);

    validBars.forEach(({ low, high, volume }) => {
      if (high === low) {
        addVolume(Math.floor(low / step + 1e-9), volume);
        return;
      }
      const firstIndex = Math.floor(low / step + 1e-9);
      const lastIndex = Math.max(firstIndex, Math.ceil(high / step - 1e-9) - 1);
      let distributed = 0;
      const parts = [];
      for (let index = firstIndex; index <= lastIndex; index += 1) {
        const overlap = Math.max(0, Math.min(high, (index + 1) * step) - Math.max(low, index * step));
        if (overlap > 0) parts.push([index, volume * overlap / (high - low)]);
      }
      parts.forEach(([, part]) => { distributed += part; });
      if (parts.length) parts[parts.length - 1][1] += volume - distributed;
      parts.forEach(([index, part]) => addVolume(index, part));
    });

    const indices = [...bins.keys()].sort((a, b) => a - b);
    if (!indices.length) return null;
    const minIndex = indices[0];
    const maxIndex = indices[indices.length - 1];
    const totalVolume = [...bins.values()].reduce((sum, volume) => sum + volume, 0);
    const pocIndex = indices.reduce((best, index) => bins.get(index) > bins.get(best) ? index : best, indices[0]);
    const targetPercent = Math.min(1, Math.max(0.01, Number(valueAreaPercent) || 0.7));
    let lowerIndex = pocIndex;
    let upperIndex = pocIndex;
    let areaVolume = bins.get(pocIndex);
    const targetVolume = totalVolume * targetPercent;
    while (areaVolume + totalVolume * 1e-10 < targetVolume) {
      const lowerVolume = lowerIndex > minIndex ? bins.get(lowerIndex - 1) || 0 : -1;
      const upperVolume = upperIndex < maxIndex ? bins.get(upperIndex + 1) || 0 : -1;
      if (lowerVolume < 0 && upperVolume < 0) break;
      if (lowerVolume >= upperVolume) {
        lowerIndex -= 1;
        areaVolume += Math.max(0, lowerVolume);
      } else {
        upperIndex += 1;
        areaVolume += Math.max(0, upperVolume);
      }
    }
    const centerVolume = [...bins.entries()].reduce((sum, [index, volume]) => index >= lowerIndex && index <= upperIndex ? sum + volume : sum, 0);
    const weightedCenter = [...bins.entries()].reduce((sum, [index, volume]) => index >= lowerIndex && index <= upperIndex
      ? sum + (index + 0.5) * step * volume : sum, 0) / centerVolume;
    const roundPrice = (price) => Math.round(price * 1000) / 1000;
    return {
      lower: roundPrice(lowerIndex * step),
      upper: roundPrice((upperIndex + 1) * step),
      poc: roundPrice((pocIndex + 0.5) * step),
      volumeWeightedCenter: roundPrice(weightedCenter),
      totalVolume,
      areaVolume,
      valueAreaPercent: targetPercent,
      priceStep: step,
      barCount: validBars.length
    };
  }

  function evaluateDecisionDataGate({ ready, timestamps, now = Date.now(), maxSkewMs = 90000, maxAgeMs = 120000 } = {}) {
    const coherent = Boolean(ready) && isSnapshotCoherent(timestamps, maxSkewMs, now, maxAgeMs);
    return {
      state: coherent ? "pass" : "wait",
      coherent,
      reason: coherent ? "数据齐全且时间对齐" : !ready ? "行情、K线或环境数据缺失/待核验" : "数据过期或刷新时间未对齐"
    };
  }

  function resolveCanonicalDecision({ dataState, holding = false, sellAction = "hold", buyState = "wait" } = {}) {
    if (dataState !== "pass") return { state: "wait", label: "数据待齐", reason: "数据闸门未通过" };
    if (holding && ["clear", "reduce", "reduce-half", "wait-close"].includes(sellAction)) {
      return { state: "sell", label: sellAction === "wait-close" ? "等收盘确认" : "卖出/减仓", reason: sellAction };
    }
    if (buyState === "confirmed") return { state: "confirmed", label: "确认买点", reason: "三闸门、六灯和结构确认" };
    if (buyState === "candidate") return { state: "candidate", label: "盘中候选", reason: "等待收盘确认" };
    return { state: holding ? "holding" : "observe", label: holding ? "持仓观察" : "观察等待", reason: "尚无完整买卖触发" };
  }

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

  function getRefreshDelay(baseDelayMs, { tradingWindow = false, hidden = false, idleDelayMs = 300000 } = {}) {
    const baseDelay = Number.isFinite(baseDelayMs) && baseDelayMs > 0 ? baseDelayMs : 60000;
    const idleDelay = Number.isFinite(idleDelayMs) && idleDelayMs > 0 ? Math.max(baseDelay, idleDelayMs) : Math.max(baseDelay, 300000);
    return hidden || !tradingWindow ? idleDelay : baseDelay;
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

  function evaluatePositionPermission({ setupConfirmed, entryPrice, stopPrice, maxLoss, lotSize = 100, feeSettings = null }) {
    if (!setupConfirmed) return { allowed: false, reason: "买点尚未确认", suggestedShares: 0, suggestedLots: 0 };
    if (![entryPrice, stopPrice, maxLoss, lotSize].every(Number.isFinite) || entryPrice <= 0 || stopPrice <= 0 || stopPrice >= entryPrice || maxLoss <= 0 || lotSize <= 0) {
      return { allowed: false, reason: "买入价、结构止损或最大亏损无效", suggestedShares: 0, suggestedLots: 0 };
    }
    let suggestedShares;
    if (feeSettings && typeof feeSettings === "object") {
      let lowLots = 0;
      let highLots = Math.floor(maxLoss / ((entryPrice - stopPrice) * lotSize));
      while (lowLots < highLots) {
        const middle = Math.ceil((lowLots + highLots) / 2);
        const shares = middle * lotSize;
        const risk = (entryPrice - stopPrice) * shares
          + estimateTradeFees(entryPrice, shares, "buy", feeSettings).total
          + estimateTradeFees(stopPrice, shares, "sell", feeSettings).total;
        if (risk <= maxLoss) lowLots = middle;
        else highLots = middle - 1;
      }
      suggestedShares = lowLots * lotSize;
    } else {
      const rawShares = Math.floor(maxLoss / (entryPrice - stopPrice));
      suggestedShares = Math.floor(rawShares / lotSize) * lotSize;
    }
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
    DEFAULT_FEE_SETTINGS,
    normalizeFeeSettings,
    estimateTradeFees,
    calculateNetPosition,
    getForwardSignalMetrics,
    summarizeForwardMetrics,
    calculateVolumeProfile,
    evaluateDecisionDataGate,
    resolveCanonicalDecision,
    isSnapshotCoherent,
    evaluateBuySignal,
    evaluateThemeGate,
    evaluateStockGate,
    getBenchmarkAverageChange,
    getRefreshDelay,
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
