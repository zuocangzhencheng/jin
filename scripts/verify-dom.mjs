import { readFile } from "node:fs/promises";
import { pathToFileURL } from "node:url";
import { JSDOM } from "jsdom";
import vm from "node:vm";

const html = await readFile("outputs/stock-watch-app/index.html", "utf8");
const appSource = await readFile("outputs/stock-watch-app/app.js", "utf8");
const tradeRulesSource = await readFile("outputs/stock-watch-app/trade-rules.js", "utf8");
const dom = new JSDOM(html, {
  url: "http://127.0.0.1/outputs/stock-watch-app/index.html",
  pretendToBeVisual: true
});

const { window } = dom;
vm.runInNewContext(tradeRulesSource, { window });

globalThis.window = window;
globalThis.document = window.document;
globalThis.localStorage = window.localStorage;
globalThis.sessionStorage = window.sessionStorage;
globalThis.HTMLElement = window.HTMLElement;
globalThis.HTMLDialogElement = window.HTMLDialogElement;
globalThis.Event = window.Event;
globalThis.Blob = window.Blob;
globalThis.FileReader = window.FileReader;
globalThis.URL = window.URL;
globalThis.alert = () => {};
globalThis.confirm = () => true;
globalThis.fetch = async () => {
  throw new Error("Network disabled in DOM verification");
};

Object.defineProperty(globalThis, "navigator", {
  value: window.navigator,
  configurable: true
});

if (!globalThis.structuredClone) {
  globalThis.structuredClone = (value) => JSON.parse(JSON.stringify(value));
}

await import(`${pathToFileURL("outputs/stock-watch-app/app.js").href}?verify=${Date.now()}`);
await new Promise((resolve) => window.setTimeout(resolve, 0));

const bodyText = window.document.body.textContent || "";
const checks = [
  ["version", window.document.querySelector("#versionPill")?.textContent === "v1.8.1 数据/样本加固"],
  ["trade rules loaded before app", html.indexOf("trade-rules.js") < html.indexOf("app.js") && Boolean(window.StockTradeRules)],
  ["app navigation", window.document.querySelector("#appNav") !== null && window.document.querySelectorAll("[data-page-target]").length >= 5 && appSource.includes("setupAppNavigation")],
  ["optional mode switch", !window.document.querySelector("#modeSwitch") || (appSource.includes("setActiveMode") && window.document.body.dataset.workMode)],
  ["data health", window.document.querySelector("#dataHealthRows") !== null && appSource.includes("renderDataHealth") && appSource.includes("renderDataHealthCard")],
  ["today action board", window.document.querySelector("#todayActionRows") !== null && appSource.includes("renderTodayActions") && bodyText.includes("今日行动清单")],
  ["forbidden actions", appSource.includes("getForbiddenActions") && appSource.includes("renderForbiddenColumn") && bodyText.includes("今日禁止操作")],
  ["embedded kline review", window.document.querySelector("#reviewFrame")?.getAttribute("src")?.includes("embed=1") && bodyText.includes("复盘K线")],
  ["watch cards", window.document.querySelectorAll(".watch-card").length > 0],
  ["watch details collapsed", window.document.querySelectorAll(".watch-detail").length > 0 && appSource.includes("watch-quick-row")],
  ["stock positions", window.document.querySelectorAll(".stock-position").length > 0],
  ["trade plan checks", window.document.querySelectorAll(".trade-plan-check").length > 0],
  ["pre buy check", window.document.querySelectorAll(".pre-buy-check").length > 0 && bodyText.includes("买前检查") && appSource.includes("getPreBuyCheck")],
  ["trade plan status", window.document.querySelectorAll(".plan-status-panel").length > 0 && appSource.includes("getPlanStatus") && bodyText.includes("交易计划状态")],
  ["support checks", window.document.querySelectorAll(".support-check").length > 0 && bodyText.includes("承接判断")],
  ["dynamic stop plan", window.document.querySelectorAll(".dynamic-stop-plan").length > 0 && bodyText.includes("计划止损") && appSource.includes("getDynamicStopPlan")],
  ["structure stop plan", window.document.querySelectorAll(".structure-stop-plan").length > 0 && bodyText.includes("结构止损") && appSource.includes("getStructureStopPlan")],
  ["scale in plan", window.document.querySelectorAll(".scale-in-plan").length > 0 && bodyText.includes("分批加仓") && appSource.includes("getScaleInPlan")],
  ["macro liquidity", window.document.querySelector("#macroLiquidityRows") !== null && bodyText.includes("宏观流动性灯") && appSource.includes("getMacroLiquidityState")],
  ["position risk overview", window.document.querySelector("#positionRiskRows") !== null && bodyText.includes("持仓风险总览") && appSource.includes("renderPositionRiskOverview")],
  ["theme rank summary", window.document.querySelector("#themeRankSummary") !== null && appSource.includes("getThemeStage") && bodyText.includes("领涨")],
  ["sell grade", window.document.querySelectorAll(".sell-grade-panel").length > 0 && bodyText.includes("卖点分级") && appSource.includes("getSellGrade")],
  ["livermore discipline", window.document.querySelectorAll(".livermore-key-panel").length > 0 && bodyText.includes("利弗莫尔市场钥匙") && appSource.includes("getLivermoreKey")],
  ["livermore gates", appSource.includes("三点突破确认") && appSource.includes("亏损仓不补") && appSource.includes("自然回撤栏")],
  ["valuation temperature", window.document.querySelectorAll(".valuation-panel").length > 0 && bodyText.includes("估值温度") && appSource.includes("getValuationTemperature")],
  ["valuation source", appSource.includes("fetchValuation") && appSource.includes("f162") && appSource.includes("低PE核周期")],
  ["core valuation", window.document.querySelectorAll(".core-valuation").length > 0 && appSource.includes("core-valuation")],
  ["strength gates", window.document.querySelectorAll(".strength-gate-panel").length > 0 && bodyText.includes("强势三闸门") && appSource.includes("getStrengthGates")],
  ["strength gate hard block", appSource.includes("三闸门未开，六灯仅参考") && appSource.includes("三闸门未开") && appSource.includes("大盘10日线")],
  ["market ma10 gate", appSource.includes("fetchIndexTechnical") && appSource.includes("MARKET_GATE_INDEX") && appSource.includes("大盘在线上")],
  ["review stats", window.document.querySelector("#reviewStatsRows") !== null && bodyText.includes("复盘统计") && appSource.includes("classifyReviewLog")],
  ["exact position", window.document.querySelector(".stock-position.exact") !== null],
  ["position confidence", window.document.querySelectorAll(".position-confidence").length > 0],
  ["forbidden positioning", window.document.querySelectorAll(".position-forbidden").length > 0],
  ["dynamic rotation radar", appSource.includes("dynamicRotationRules") && appSource.includes("getRadarRotationGroup")],
  ["no static innovation theme", !appSource.includes("\"创新药\": { lane") && !appSource.includes("theme: \"创新药\"")],
  ["no gold monitor", window.document.querySelector(".gold-panel") === null && !appSource.includes("ENABLE_GOLD_MONITOR") && !appSource.includes("fetchSinaGoldQuote") && !appSource.includes("goldRefreshBtn")],
  ["radar diagnostics", appSource.includes("radarScanStats") && appSource.includes("getRadarEmptyReason") && appSource.includes("fetchRadarListDirect") && appSource.includes("原始候选都被主板/非科创创业")],
  ["radar last snapshot", appSource.includes("RADAR_LAST_STORAGE_KEY") && appSource.includes("radarUsingLastSnapshot") && appSource.includes("保留最后有效雷达") && appSource.includes("radarLastSnapshot")],
  ["tencent kline fallback", appSource.includes("fetchTencentTechnical") && appSource.includes("web.ifzq.gtimg.cn") && appSource.includes("腾讯备用")],
  ["watch smart sort", appSource.includes("getWatchSortMeta") && appSource.includes("compareWatchItems") && bodyText.includes("智能排序")],
  ["confirmed buy requires close", appSource.includes("evaluateBuySignal") && tradeRulesSource.includes("盘中候选，等收盘确认") && appSource.includes("isCurrentSessionClosed")],
  ["sell timing unified", appSource.includes("resolveSellGate") && appSource.includes("awaitingStopClose") && appSource.includes("reduceAtStop")],
  ["missing theme data waits", appSource.includes("evaluateThemeGate") && appSource.includes("默认强度不放行")],
  ["shared effective stop", appSource.includes("getEffectiveStopLine") && appSource.includes("structureStop?.sellGateAction")],
  ["hard and structure stops separate", appSource.includes("stopTouched: hitHard") && appSource.includes("structureTouched,")],
  ["scale-in hard gates", appSource.includes("evaluateScaleIn") && appSource.includes("freshBuyConfirmed") && appSource.includes("withinRiskBudget")],
  ["score sorting unified", appSource.includes("getWatchRank") && appSource.includes("compareWatchItems(a, b)")],
  ["focus filter", window.document.querySelector("[data-filter='focus']") !== null && appSource.includes("activeFilter === \"focus\"")],
  ["watch layers", window.document.querySelector("[data-filter='core']") !== null && window.document.querySelector("#layerInput") !== null && appSource.includes("normalizeWatchLayer")],
  ["review holding sync", appSource.includes("handleReviewHoldingSync") && appSource.includes("stock-review-holding-sync")],
  ["small metal theme", appSource.includes("\"小金属\"") && window.document.querySelector("option[value='小金属']") !== null],
  ["small metal core", bodyText.includes("锡业股份") && bodyText.includes("华锡有色") && bodyText.includes("小金属")],
  ["overview trimmed", window.document.querySelector(".theme-panel")?.dataset.appPage === "mainline" && appSource.includes("纪律通过候选")],
  ["core quote targets", appSource.includes("getCoreQuoteTargets") && appSource.includes("getQuoteTargets(unique)")],
  ["core add watch", appSource.includes("handleCoreClick") && appSource.includes("addCoreItemToWatch") && window.document.querySelector("[data-action='core-add-watch']") !== null],
  ["watch quote count", appSource.includes("normalized.filter((stock) => quotes[stock.code]).length")],
  ["radar history", window.document.querySelector("#radarHistoryRows") !== null && appSource.includes("captureRadarHistory") && bodyText.includes("资金留痕")],
  ["theme history", window.document.querySelector("#themeHistoryRows") !== null && appSource.includes("captureThemeHistory") && bodyText.includes("主线5日历史")],
  ["position sizing", window.document.querySelector("#sharesInput") !== null && window.document.querySelector("#accountCapitalInput") !== null && appSource.includes("suggestedShares")],
  ["explicit position permission", window.document.querySelector("#riskBudgetConfirmedInput") !== null && appSource.includes("evaluatePositionPermission") && bodyText.includes("单笔最大亏损上限")],
  ["T+1 lot controls", window.document.querySelector("#legacySellableInput") !== null && window.document.querySelector("#todayBuySharesInput") !== null && window.document.querySelector("#todaySellSharesInput") !== null && appSource.includes("consumeSellFromLots") && bodyText.includes("T+1可卖")],
  ["six-light unified structure and funds", appSource.includes('key: "structure"') && appSource.includes('key: "funds"') && bodyText.includes("结构") && bodyText.includes("资金")],
  ["relative strength gates", appSource.includes("evaluateStockGate") && appSource.includes("强于板块") && appSource.includes("强于大盘")],
  ["completed market close gate", appSource.includes("getCompletedDailyClose") && appSource.includes("上证收盘")],
  ["intraday volume pending", appSource.includes("intraday-pending") && appSource.includes("盘中量能待确认") && tradeRulesSource.includes("同时间盘中量能条件通过")],
  ["missing market data waits", tradeRulesSource.includes("getBenchmarkAverageChange") && appSource.includes("indexes.length >= 2 && avgChange !== null") && appSource.includes("marketState?.benchmarkDataAvailable ? marketState.avgChange : null")],
  ["stale kline volume waits", appSource.includes('return { period: "stale" }') && appSource.includes("barCurrent: technical.volumeRatioPeriod !== \"stale\"") && tradeRulesSource.includes("K线日期过期")],
  ["signal sample audit", window.document.querySelector("#signalAuditRows") !== null && window.document.querySelector("#signalAuditBreakdown") !== null && appSource.includes("captureConfirmedSignalSnapshot") && appSource.includes("appendSignalOutcome") && appSource.includes("marketRegime") && bodyText.includes("确认买点信号") && bodyText.includes("不代表仓位许可或实际成交")],
  ["signal snapshots preserve evidence", appSource.includes("marketAverageChange") && appSource.includes("indexMa10") && appSource.includes("volumePeriod")],
  ["filtered stocks still capture signals", appSource.indexOf("const analyzed = stocks") < appSource.indexOf("captureConfirmedSignalSnapshot(normalized") && appSource.indexOf("captureConfirmedSignalSnapshot(normalized") < appSource.indexOf(".filter((item) => watchFilterMatches(item))")],
  ["failed review sells stay unbaselined", appSource.includes("reviewFailedSellIds") && appSource.includes("excludeIds: failedReviewSellIds") && appSource.includes("getEligibleTransactionIds(rows")],
  ["compact row distinguishes permission", appSource.includes("买前 ${escapeHtml(preBuyCheck.label)}") && appSource.includes("形态确认·仓位未放行")],
  ["error templates", window.document.querySelectorAll("[data-error-template]").length >= 4 && appSource.includes("fillErrorReviewTemplate")],
  ["watch migration", appSource.includes("WATCH_MIGRATION_STORAGE_KEY") && appSource.includes("applyWatchMigrations")],
  ["heyuan watch", bodyText.includes("和远气体") && bodyText.includes("六氟化钨映射")],
  ["heyuan positioning", bodyText.includes("禁止当成六氟化钨业绩兑现龙头") && bodyText.includes("小市值高波动")],
  ["taiji storage positioning", bodyText.includes("太极实业") && bodyText.includes("存储产业链") && bodyText.includes("不把它当先进封装补仓标的")],
  ["sanan power positioning", bodyText.includes("三安光电") && bodyText.includes("功率半导体") && bodyText.includes("不是半导体设备")],
  ["radar container", window.document.querySelector("#radarRows") !== null]
];

const failed = checks.filter(([, ok]) => !ok);
if (failed.length) {
  console.error(`DOM verification failed: ${failed.map(([name]) => name).join(", ")}`);
  window.close();
  process.exit(1);
}

console.log(`DOM verification passed: ${checks.map(([name]) => name).join(", ")}`);
window.close();
process.exit(0);
