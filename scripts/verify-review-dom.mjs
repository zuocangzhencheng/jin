import { readFile } from "node:fs/promises";
import { pathToFileURL } from "node:url";
import { JSDOM } from "jsdom";
import vm from "node:vm";

const html = await readFile("outputs/stock-review-app/index.html", "utf8");
const appSource = await readFile("outputs/stock-review-app/app.js", "utf8");
const tradeRulesSource = await readFile("outputs/stock-watch-app/trade-rules.js", "utf8");
const styles = await readFile("outputs/stock-review-app/styles.css", "utf8");
const dom = new JSDOM(html, {
  url: "http://127.0.0.1/outputs/stock-review-app/index.html",
  pretendToBeVisual: true
});

const { window } = dom;
const chartDrawings = { dashedLines: [], currentLabels: [] };
vm.runInNewContext(tradeRulesSource, { window });
const styleElement = window.document.createElement("style");
styleElement.textContent = styles;
window.document.head.append(styleElement);

const now = new Date();
const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
window.localStorage.setItem("stock-watch-v1", JSON.stringify([{
  code: "000021",
  name: "深科技",
  theme: "HBM/存储",
  group: "holding",
  shares: 100,
  lots: [{ buyDate: today, shares: 100, price: 20, source: "manual" }]
}]));

globalThis.window = window;
globalThis.document = window.document;
globalThis.localStorage = window.localStorage;
globalThis.HTMLElement = window.HTMLElement;
globalThis.Event = window.Event;
globalThis.fetch = async () => { throw new Error("Network disabled in DOM verification"); };

Object.defineProperty(globalThis, "navigator", {
  value: window.navigator,
  configurable: true
});

Object.defineProperty(window.HTMLCanvasElement.prototype, "getContext", {
  value: () => {
    let strokeStyle = "";
    let fillStyle = "";
    let lineDash = [];
    let pathStart = null;
    let pathEnd = null;
    return {
    clearRect() {},
    fillRect() {},
    strokeRect() {},
    beginPath() { pathStart = null; pathEnd = null; },
    moveTo(x, y) { pathStart = { x, y }; },
    lineTo(x, y) { pathEnd = { x, y }; },
    stroke() {
      if (strokeStyle === "#c52727" && lineDash.length && pathStart && pathEnd) {
        chartDrawings.dashedLines.push({ start: pathStart, end: pathEnd });
      }
    },
    fill() {},
    fillText(text, x, y) {
      if (fillStyle === "#c52727" && String(text).startsWith("60")) chartDrawings.currentLabels.push({ text: String(text), x, y });
    },
    setLineDash(value) { lineDash = value; },
    setTransform() {},
    measureText: (text) => ({ width: String(text).length * 8 }),
    set strokeStyle(value) { strokeStyle = value; },
    set fillStyle(value) { fillStyle = value; },
    set lineWidth(value) {},
    set font(value) {}
    };
  },
  configurable: true
});

Object.defineProperty(window.HTMLCanvasElement.prototype, "getBoundingClientRect", {
  value: () => ({ width: 960, height: 420, top: 0, left: 0, right: 960, bottom: 420 }),
  configurable: true
});

const nativeAppendChild = window.document.head.appendChild.bind(window.document.head);
window.document.head.appendChild = (node) => {
  if (node.tagName === "SCRIPT" && node.src.includes("qt.gtimg.cn")) {
    window.setTimeout(() => {
      const parts = Array(35).fill("0");
      parts[1] = "深科技";
      parts[3] = "60";
      parts[4] = "18";
      parts[5] = "18";
      window.v_sz000021 = parts.join("~");
      node.onload?.();
    }, 0);
    return node;
  }
  if (node.tagName === "SCRIPT" && node.src.includes("push2his.eastmoney.com")) {
    window.setTimeout(() => {
      const callbackName = new URL(node.src).searchParams.get("cb");
      const bars = ["2026-10-14", "2026-10-15", "2026-10-16", "2026-10-19", "2026-10-20"]
        .map((date) => `${date},17,18,20,15,1000,18000,0,0,0,0`);
      window[callbackName]?.({ data: { klines: bars } });
    }, 0);
    return node;
  }
  return nativeAppendChild(node);
};

await import(`${pathToFileURL("outputs/stock-review-app/app.js").href}?verify=${Date.now()}`);
await new Promise((resolve) => window.setTimeout(resolve, 10));

const future = new Date(now.getTime() + 86400000);
const futureDate = `${future.getFullYear()}-${String(future.getMonth() + 1).padStart(2, "0")}-${String(future.getDate()).padStart(2, "0")}`;
window.document.querySelector("#tradeDateInput").value = futureDate;
window.document.querySelector("#tradePriceInput").value = "20";
window.document.querySelector("#tradeSharesInput").value = "100";
window.document.querySelector("#addTradeBtn").click();
const futureBuyBlocked = window.document.querySelector("#tradePulse")?.textContent.includes("在未来")
  && !window.localStorage.getItem("stock-review-trades-v1");

window.document.querySelector("#sellDateInput").value = futureDate;
window.document.querySelector("#sellPriceInput").value = "20";
window.document.querySelector("#sellSharesInput").value = "100";
window.document.querySelector("#addSellBtn").click();
const futureSellBlocked = window.document.querySelector("#sellPulse")?.textContent.includes("在未来")
  && !window.localStorage.getItem("stock-review-sells-v1");

window.document.querySelector("#sellDateInput").value = today;
window.document.querySelector("#sellPriceInput").value = "20";
window.document.querySelector("#sellSharesInput").value = "100";
window.document.querySelector("#addSellBtn").click();
const sameDaySellBlocked = window.document.querySelector("#sellPulse")?.textContent.includes("T+1可卖上限 0 股")
  && !window.localStorage.getItem("stock-review-sells-v1");

window.document.querySelector("#tradeDateInput").value = today;
window.document.querySelector("#tradePriceInput").value = "20";
window.document.querySelector("#tradeSharesInput").value = "100";
window.document.querySelector("#addTradeBtn").click();
const feeAwareCostRendered = window.document.querySelector("#costSummary")?.textContent.includes("费用后均价")
  && window.document.querySelector("#costSummary")?.textContent.includes("净保本价");
window.document.querySelector("#commissionRateInput").value = "0.1";
window.document.querySelector("#commissionRateInput").dispatchEvent(new window.Event("change", { bubbles: true }));
const feeSettingsSaved = JSON.parse(window.localStorage.getItem("stock-review-fees-v1") || "{}").commissionRate === 0.001;

const bodyText = window.document.body.textContent || "";
const ma10Value = window.document.querySelector(".ma10 strong");
const ma20Value = window.document.querySelector(".ma20 strong");
const ma10LegendLine = window.document.querySelector(".chart-key-line.ma10");
const ma20LegendLine = window.document.querySelector(".chart-key-line.ma20");
const checks = [
  ["version", window.document.querySelector("#versionPill")?.textContent === "v0.6.2 现价轴范围修正"],
  ["embedded support", appSource.includes("EMBEDDED_MODE") && appSource.includes("mergeWatchStocks") && appSource.includes("WATCH_STOCKS_KEY")],
  ["stock list", window.document.querySelectorAll(".stock-card").length > 0],
  ["stock delete", window.document.querySelector("[data-delete-stock]") !== null && appSource.includes("deleteReviewStock") && appSource.includes("HIDDEN_STOCKS_KEY")],
  ["chart canvas", window.document.querySelector("#klineCanvas") !== null],
  ["current quote jump stays inside chart price axis", chartDrawings.dashedLines.some(({ start, end }) => start.y >= 20 && end.y >= 20 && start.y <= 292 && end.y <= 292) && chartDrawings.currentLabels.some(({ y }) => y >= 20 && y <= 292)],
  ["estimated cost area legend", window.document.querySelector("#costAreaSummary") !== null && bodyText.includes("日K估算")],
  ["chart legend explains moving averages and price profile marks", ["MA5", "MA10", "MA20", "成交密集区（估算70%）", "成交量加权中枢", "当前价"].every((label) => window.document.querySelector("#chartLegend")?.textContent.includes(label))],
  ["MA10 and MA20 are visually distinct", Boolean(ma10Value && ma20Value && ma10LegendLine && ma20LegendLine) && window.getComputedStyle(ma10Value).color !== window.getComputedStyle(ma20Value).color && window.getComputedStyle(ma10LegendLine).borderTopColor !== window.getComputedStyle(ma20LegendLine).borderTopColor],
  ["chart MA lines use the legend colors", appSource.includes('drawMaLine(ctx, items, "ma10", xOf, yOf, "#c026d3")') && appSource.includes('drawMaLine(ctx, items, "ma20", xOf, yOf, "#1d4ed8")')],
  ["cost profile uses completed daily bars", appSource.includes("item.date < getTodayKey()") && appSource.includes("calculateVolumeProfile(completedItems)")],
  ["ma strip", window.document.querySelector("#maStrip") !== null && bodyText.includes("MA5")],
  ["add stock input", window.document.querySelector("#stockInput") !== null],
  ["notes", window.document.querySelector("#noteInput") !== null && window.document.querySelector("#noteList") !== null],
  ["trade marker form", window.document.querySelector("#tradeDateInput") !== null && window.document.querySelector("#tradePriceInput") !== null && window.document.querySelector("#tradeSharesInput") !== null],
  ["trade marker legend", window.document.querySelector("#tradeLegend") !== null && bodyText.includes("买入标记")],
  ["sell marker form", window.document.querySelector("#sellDateInput") !== null && window.document.querySelector("#sellPriceInput") !== null && window.document.querySelector("#sellReasonInput") !== null && appSource.includes("addSellMarker")],
  ["excel review sheet", window.document.querySelector("#reviewSheetTable") !== null && window.document.querySelector("#exportSheetBtn") !== null && appSource.includes("REVIEW_SHEET_KEY") && bodyText.includes("Excel式复盘表")],
  ["cost summary", window.document.querySelector("#costSummary") !== null && appSource.includes("getCostSummary") && appSource.includes("已实现盈亏") && appSource.includes("总盈亏")],
  ["editable fee assumptions", window.document.querySelector("#feeSettingsPanel") !== null && window.document.querySelector("#commissionRateInput") !== null && window.document.querySelector("#slippageRateInput") !== null && bodyText.includes("估算费率")],
  ["net liquidation and break-even", appSource.includes("calculateNetPosition") && tradeRulesSource.includes("netLiquidationValue") && appSource.includes("保本价")],
  ["fee-aware cost recalculates and persists", feeAwareCostRendered && feeSettingsSaved],
  ["execution score", window.document.querySelector("#executionScoreRows") !== null && appSource.includes("getExecutionScore") && bodyText.includes("执行评分")],
  ["watch holding sync", appSource.includes("syncTradeToWatchStock") && appSource.includes("stock-review-holding-sync") && appSource.includes("WATCH_STOCKS_KEY")],
  ["T+1 sell gate", html.includes("../stock-watch-app/trade-rules.js") && appSource.includes("getWatchSellAvailability") && appSource.includes("T+1可卖上限") && appSource.includes("consumeSellFromLots") && sameDaySellBlocked],
  ["future review transactions blocked", futureBuyBlocked && appSource.includes("isTransactionDateAllowed(date, getTodayKey())") && appSource.includes("未计入当前持仓")],
  ["future review sells blocked", futureSellBlocked],
  ["quote fetch", appSource.includes("fetchQuote") && appSource.includes("qt.gtimg.cn")],
  ["kline fetch", appSource.includes("fetchKline") && appSource.includes("push2his.eastmoney.com")],
  ["kline fallback", appSource.includes("fetchTencentKline") && appSource.includes("web.ifzq.gtimg.cn") && appSource.includes("腾讯备用")],
  ["moving averages", appSource.includes("movingAverage") && appSource.includes("ma5") && appSource.includes("ma10") && appSource.includes("ma20")],
  ["canvas drawing", appSource.includes("drawKlineChart") && appSource.includes("drawMaLine") && appSource.includes("drawCostArea")],
  ["trade marker drawing", appSource.includes("TRADES_KEY") && appSource.includes("drawTradeMarkers") && appSource.includes("addTradeMarker") && appSource.includes("getVisibleTradeMarkers")]
];

const failed = checks.filter(([, ok]) => !ok);
if (failed.length) {
  console.error(`Review DOM verification failed: ${failed.map(([name]) => name).join(", ")}`);
  window.close();
  process.exit(1);
}

console.log(`Review DOM verification passed: ${checks.map(([name]) => name).join(", ")}`);
window.close();
process.exit(0);
