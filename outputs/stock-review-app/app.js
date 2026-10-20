const APP_VERSION = "v0.6.2 现价轴范围修正";
const STOCKS_KEY = "stock-review-stocks-v1";
const HIDDEN_STOCKS_KEY = "stock-review-hidden-stocks-v1";
const NOTES_KEY = "stock-review-notes-v1";
const TRADES_KEY = "stock-review-trades-v1";
const SELLS_KEY = "stock-review-sells-v1";
const REVIEW_SHEET_KEY = "stock-review-sheet-v1";
const WATCH_STOCKS_KEY = "stock-watch-v1";
const FEE_SETTINGS_KEY = "stock-review-fees-v1";
const tradeRules = window.StockTradeRules;
const JSONP_TIMEOUT = 9000;
const EMBEDDED_MODE = new URLSearchParams(window.location.search).get("embed") === "1";

if (EMBEDDED_MODE) document.body.classList.add("embedded");

const commonStocks = [
  { code: "000021", name: "深科技", aliases: ["深科技"], theme: "HBM/存储" },
  { code: "600667", name: "太极实业", aliases: ["太极", "太极实业"], theme: "HBM/存储" },
  { code: "601138", name: "工业富联", aliases: ["工业富联", "富联", "FII"], theme: "AI算力/服务器" },
  { code: "000725", name: "京东方A", aliases: ["京东方", "京东方A", "BOE"], theme: "面板/玻璃基板" },
  { code: "000100", name: "TCL科技", aliases: ["TCL", "TCL科技"], theme: "面板/玻璃基板" },
  { code: "600378", name: "昊华科技", aliases: ["昊华", "昊华科技"], theme: "电子特气" },
  { code: "002971", name: "和远气体", aliases: ["和远", "和远气体"], theme: "电子特气" },
  { code: "600703", name: "三安光电", aliases: ["三安", "三安光电"], theme: "功率半导体" },
  { code: "600522", name: "中天科技", aliases: ["中天", "中天科技"], theme: "光通信/海缆" },
  { code: "002281", name: "光迅科技", aliases: ["光迅", "光迅科技"], theme: "光模块/CPO" },
  { code: "002371", name: "北方华创", aliases: ["北方", "北方华创"], theme: "半导体设备" },
  { code: "605358", name: "立昂微", aliases: ["立昂", "立昂微", "立微昂"], theme: "半导体材料" },
  { code: "300398", name: "飞凯材料", aliases: ["飞凯", "飞凯材料"], theme: "半导体材料" },
  { code: "300054", name: "鼎龙股份", aliases: ["鼎龙", "鼎龙股份"], theme: "半导体材料" },
  { code: "000960", name: "锡业股份", aliases: ["锡业", "锡业股份"], theme: "小金属" },
  { code: "600301", name: "华锡有色", aliases: ["华锡", "华锡有色"], theme: "小金属" },
  { code: "600549", name: "厦门钨业", aliases: ["厦钨", "厦门钨业"], theme: "小金属" }
];

const seedStocks = [
  commonStocks.find((item) => item.code === "000021"),
  commonStocks.find((item) => item.code === "600667"),
  commonStocks.find((item) => item.code === "601138"),
  commonStocks.find((item) => item.code === "000725")
].filter(Boolean);

let hiddenReviewCodes = loadHiddenReviewCodes();
let stocks = mergeWatchStocks(loadStocks());
let notes = loadNotes();
let trades = loadTrades();
let sells = loadSells();
let reviewSheetRows = loadReviewSheetRows();
let feeSettings = loadFeeSettings();
let watchDecisionContext = {};
let quotes = {};
let klines = {};
let klineStatus = {};
let selectedCode = stocks[0]?.code || "";
let rangeDays = 120;
let isRefreshing = false;
let lastTradeFormCode = "";

const versionPill = document.getElementById("versionPill");
const stockInput = document.getElementById("stockInput");
const addBtn = document.getElementById("addBtn");
const addHint = document.getElementById("addHint");
const refreshBtn = document.getElementById("refreshBtn");
const listPulse = document.getElementById("listPulse");
const stockList = document.getElementById("stockList");
const chartTitle = document.getElementById("chartTitle");
const chartSub = document.getElementById("chartSub");
const currentPrice = document.getElementById("currentPrice");
const currentChange = document.getElementById("currentChange");
const maStrip = document.getElementById("maStrip");
const canvas = document.getElementById("klineCanvas");
const chartEmpty = document.getElementById("chartEmpty");
const costAreaSummary = document.getElementById("costAreaSummary");
const tradeLegend = document.getElementById("tradeLegend");
const tradePulse = document.getElementById("tradePulse");
const tradeDateInput = document.getElementById("tradeDateInput");
const tradePriceInput = document.getElementById("tradePriceInput");
const tradeSharesInput = document.getElementById("tradeSharesInput");
const addTradeBtn = document.getElementById("addTradeBtn");
const costSummary = document.getElementById("costSummary");
const feeSettingsPanel = document.getElementById("feeSettingsPanel");
const commissionRateInput = document.getElementById("commissionRateInput");
const commissionMinInput = document.getElementById("commissionMinInput");
const stampDutyRateInput = document.getElementById("stampDutyRateInput");
const transferFeeRateInput = document.getElementById("transferFeeRateInput");
const slippageRateInput = document.getElementById("slippageRateInput");
const tradeList = document.getElementById("tradeList");
const sellPulse = document.getElementById("sellPulse");
const sellDateInput = document.getElementById("sellDateInput");
const sellPriceInput = document.getElementById("sellPriceInput");
const sellSharesInput = document.getElementById("sellSharesInput");
const sellReasonInput = document.getElementById("sellReasonInput");
const sellPlannedInput = document.getElementById("sellPlannedInput");
const addSellBtn = document.getElementById("addSellBtn");
const sellList = document.getElementById("sellList");
const scorePulse = document.getElementById("scorePulse");
const executionScoreRows = document.getElementById("executionScoreRows");
const sheetPulse = document.getElementById("sheetPulse");
const exportSheetBtn = document.getElementById("exportSheetBtn");
const sheetDateInput = document.getElementById("sheetDateInput");
const sheetActionInput = document.getElementById("sheetActionInput");
const sheetPlannedInput = document.getElementById("sheetPlannedInput");
const sheetMistakeInput = document.getElementById("sheetMistakeInput");
const sheetPlanInput = document.getElementById("sheetPlanInput");
const addSheetRowBtn = document.getElementById("addSheetRowBtn");
const reviewSheetTable = document.getElementById("reviewSheetTable");
const noteInput = document.getElementById("noteInput");
const saveNoteBtn = document.getElementById("saveNoteBtn");
const notePulse = document.getElementById("notePulse");
const noteList = document.getElementById("noteList");
const rangeButtons = [...document.querySelectorAll("[data-range]")];
const tagButtons = [...document.querySelectorAll("[data-note-tag]")];

versionPill.textContent = APP_VERSION;
syncFeeSettingsForm();
saveStocks();

addBtn.addEventListener("click", addStockFromInput);
stockInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") addStockFromInput();
});
refreshBtn.addEventListener("click", () => refreshAll(true));
addTradeBtn.addEventListener("click", addTradeMarker);
addSellBtn.addEventListener("click", addSellMarker);
addSheetRowBtn.addEventListener("click", addReviewSheetRow);
exportSheetBtn.addEventListener("click", exportReviewSheetCsv);
saveNoteBtn.addEventListener("click", saveNote);
rangeButtons.forEach((button) => {
  button.addEventListener("click", () => {
    rangeDays = Number(button.dataset.range) || 120;
    rangeButtons.forEach((item) => item.classList.toggle("active", item === button));
    renderSelected();
  });
});
tagButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const tag = button.dataset.noteTag;
    noteInput.value = noteInput.value ? `${noteInput.value}\n#${tag} ` : `#${tag} `;
    noteInput.focus();
  });
});

window.addEventListener("resize", () => drawSelectedChart());
window.addEventListener("message", handleWatchContextSync);
feeSettingsPanel?.querySelectorAll("input").forEach((input) => input.addEventListener("change", saveFeeSettingsFromForm));
if (EMBEDDED_MODE) window.parent.postMessage({ type: "stock-review-ready" }, "*");

render();
refreshAll(true);

function loadStocks() {
  try {
    const saved = JSON.parse(localStorage.getItem(STOCKS_KEY) || "[]");
    if (Array.isArray(saved) && saved.length) return saved.map(normalizeStock).filter(Boolean);
  } catch {
    // Use seed stocks below.
  }
  return seedStocks.map(normalizeStock).filter(Boolean);
}

function mergeWatchStocks(currentStocks) {
  const merged = new Map();
  loadWatchStocksForReview().forEach((stock) => {
    if (stock?.code) merged.set(stock.code, stock);
  });
  currentStocks.forEach((stock) => {
    if (stock?.code && !merged.has(stock.code)) merged.set(stock.code, stock);
  });
  const rows = [...merged.values()].map(normalizeStock).filter(Boolean);
  return rows.length ? rows.slice(0, 50) : seedStocks.map(normalizeStock).filter(Boolean);
}

function loadWatchStocksForReview() {
  try {
    const saved = JSON.parse(localStorage.getItem(WATCH_STOCKS_KEY) || "[]");
    if (!Array.isArray(saved)) return [];
    return saved.map((stock) => normalizeStock({
      code: stock.code,
      name: stock.name,
      theme: stock.theme || stock.note || "未分类"
    })).filter((stock) => stock && !hiddenReviewCodes.has(stock.code));
  } catch {
    return [];
  }
}

function saveStocks() {
  localStorage.setItem(STOCKS_KEY, JSON.stringify(stocks));
}

function loadHiddenReviewCodes() {
  try {
    const saved = JSON.parse(localStorage.getItem(HIDDEN_STOCKS_KEY) || "[]");
    return new Set(Array.isArray(saved) ? saved.map((code) => String(code).padStart(6, "0").slice(-6)) : []);
  } catch {
    return new Set();
  }
}

function saveHiddenReviewCodes() {
  localStorage.setItem(HIDDEN_STOCKS_KEY, JSON.stringify([...hiddenReviewCodes]));
}

function loadNotes() {
  try {
    const saved = JSON.parse(localStorage.getItem(NOTES_KEY) || "{}");
    return saved && typeof saved === "object" ? saved : {};
  } catch {
    return {};
  }
}

function loadTrades() {
  try {
    const saved = JSON.parse(localStorage.getItem(TRADES_KEY) || "{}");
    return saved && typeof saved === "object" ? saved : {};
  } catch {
    return {};
  }
}

function saveTrades() {
  localStorage.setItem(TRADES_KEY, JSON.stringify(trades));
}

function loadSells() {
  try {
    const saved = JSON.parse(localStorage.getItem(SELLS_KEY) || "{}");
    return saved && typeof saved === "object" ? saved : {};
  } catch {
    return {};
  }
}

function saveSells() {
  localStorage.setItem(SELLS_KEY, JSON.stringify(sells));
}

function loadReviewSheetRows() {
  try {
    const saved = JSON.parse(localStorage.getItem(REVIEW_SHEET_KEY) || "[]");
    return Array.isArray(saved) ? saved : [];
  } catch {
    return [];
  }
}

function saveReviewSheetRows() {
  localStorage.setItem(REVIEW_SHEET_KEY, JSON.stringify(reviewSheetRows));
}

function loadFeeSettings() {
  try {
    return tradeRules.normalizeFeeSettings(JSON.parse(localStorage.getItem(FEE_SETTINGS_KEY) || "{}"));
  } catch {
    return tradeRules.normalizeFeeSettings();
  }
}

function saveFeeSettings() {
  localStorage.setItem(FEE_SETTINGS_KEY, JSON.stringify(feeSettings));
}

function syncFeeSettingsForm() {
  if (!commissionRateInput) return;
  commissionRateInput.value = (feeSettings.commissionRate * 100).toString();
  commissionMinInput.value = feeSettings.commissionMin.toString();
  stampDutyRateInput.value = (feeSettings.stampDutyRate * 100).toString();
  transferFeeRateInput.value = (feeSettings.transferFeeRate * 100).toString();
  slippageRateInput.value = (feeSettings.slippageRate * 100).toString();
}

function saveFeeSettingsFromForm() {
  feeSettings = tradeRules.normalizeFeeSettings({
    commissionRate: Number(commissionRateInput.value) / 100,
    commissionMin: Number(commissionMinInput.value),
    stampDutyRate: Number(stampDutyRateInput.value) / 100,
    transferFeeRate: Number(transferFeeRateInput.value) / 100,
    slippageRate: Number(slippageRateInput.value) / 100
  });
  saveFeeSettings();
  syncFeeSettingsForm();
  notifyWatchAppFeeSettings();
  renderSelected();
}

function handleWatchContextSync(event) {
  const data = event?.data;
  if (event.source !== window.parent || !data || data.type !== "stock-watch-context-sync") return;
  if (data.fees) {
    feeSettings = tradeRules.normalizeFeeSettings(data.fees);
    saveFeeSettings();
    syncFeeSettingsForm();
  }
  watchDecisionContext = data.decisions && typeof data.decisions === "object" ? data.decisions : {};
  renderSelected();
}

function notifyWatchAppFeeSettings() {
  if (!EMBEDDED_MODE) return;
  window.parent.postMessage({ type: "stock-review-fees-sync", fees: feeSettings }, "*");
}

function saveNotes() {
  localStorage.setItem(NOTES_KEY, JSON.stringify(notes));
}

function normalizeStock(stock) {
  if (!stock?.code) return null;
  const code = String(stock.code).replace(/\D/g, "").padStart(6, "0").slice(-6);
  const known = commonStocks.find((item) => item.code === code);
  return {
    code,
    name: stock.name || known?.name || code,
    theme: stock.theme || known?.theme || "未分类"
  };
}

function findStock(input) {
  const text = String(input || "").trim();
  if (!text) return null;
  const codeMatch = text.match(/\d{6}/);
  if (codeMatch) {
    const code = codeMatch[0];
    const known = commonStocks.find((item) => item.code === code);
    return normalizeStock({ code, name: known?.name || code, theme: known?.theme || "未分类" });
  }
  const normalized = text.toLowerCase();
  const known = commonStocks.find((item) => {
    const names = [item.name, item.code, ...(item.aliases || [])].map((value) => String(value).toLowerCase());
    return names.some((name) => name === normalized || name.includes(normalized) || normalized.includes(name));
  });
  return known ? normalizeStock(known) : null;
}

async function addStockFromInput() {
  const stock = findStock(stockInput.value);
  if (!stock) {
    addHint.textContent = "暂未识别。先输入6位股票代码，或用常见名称如深科技、工业富联。";
    stockInput.focus();
    return;
  }

  if (!stocks.some((item) => item.code === stock.code)) {
    hiddenReviewCodes.delete(stock.code);
    saveHiddenReviewCodes();
    stocks = [stock, ...stocks].slice(0, 30);
    saveStocks();
  }
  selectedCode = stock.code;
  stockInput.value = "";
  addHint.textContent = `${stock.name} 已加入，正在取当前价格和K线。`;
  render();
  await refreshStock(stock, true);
  render();
}

async function refreshAll(force = false) {
  if (isRefreshing) return;
  isRefreshing = true;
  refreshBtn.disabled = true;
  listPulse.textContent = "刷新中";
  await Promise.allSettled(stocks.map((stock) => refreshStock(stock, force)));
  isRefreshing = false;
  refreshBtn.disabled = false;
  listPulse.textContent = `已刷新 ${Object.keys(quotes).length}/${stocks.length}`;
  render();
}

async function refreshStock(stock, force = false) {
  if (!force && quotes[stock.code] && klines[stock.code]) return;
  const [quote, kline] = await Promise.all([fetchQuote(stock), fetchKline(stock)]);
  if (quote) {
    quotes[stock.code] = quote;
    const current = stocks.find((item) => item.code === stock.code);
    if (current && quote.name && current.name === current.code) current.name = quote.name;
  }
  if (kline?.items?.length) {
    klines[stock.code] = kline;
    klineStatus[stock.code] = {
      level: kline.source === "腾讯备用" ? "warn" : "ok",
      label: kline.source || "K线成功",
      detail: kline.detail || "日K已刷新"
    };
  } else {
    klineStatus[stock.code] = {
      level: "bad",
      label: "K线失败",
      detail: "东方财富无返回，腾讯备用也未取到"
    };
  }
}

function render() {
  renderList();
  renderSelected();
}

function renderList() {
  if (!stocks.length) {
    stockList.innerHTML = `<div class="empty">先加入一只股票</div>`;
    return;
  }

  stockList.innerHTML = stocks.map((stock) => {
    const quote = quotes[stock.code];
    const active = stock.code === selectedCode;
    const changeClass = quote ? getChangeClass(quote.changePercent) : "flat";
    return `
      <article class="stock-card ${active ? "active" : ""}">
        <button class="stock-card-main" data-select-stock="${stock.code}" type="button">
          <div class="stock-card-head">
            <strong>${escapeHtml(stock.name)}</strong>
            <span>${stock.code}</span>
          </div>
          <div class="stock-card-price">
            <b>${quote?.price ? formatMoney(quote.price) : "--"}</b>
            <small class="${changeClass}">${quote ? `${signed(quote.changePercent)}%` : "待取价"}</small>
          </div>
          <span>${escapeHtml(stock.theme)}</span>
        </button>
        <button class="stock-delete-button" data-delete-stock="${stock.code}" type="button" title="从复盘K线删除">删除</button>
      </article>
    `;
  }).join("");

  [...stockList.querySelectorAll("[data-select-stock]")].forEach((button) => {
    button.addEventListener("click", () => {
      selectedCode = button.dataset.selectStock;
      render();
    });
  });
  [...stockList.querySelectorAll("[data-delete-stock]")].forEach((button) => {
    button.addEventListener("click", () => deleteReviewStock(button.dataset.deleteStock));
  });
}

function deleteReviewStock(code) {
  const stock = stocks.find((item) => item.code === code);
  if (!stock) return;
  const message = `确认从复盘K线删除 ${stock.name} ${stock.code}？\n买卖标记、笔记和Excel复盘记录会保留，后续手动重新加入可继续查看。`;
  if (!window.confirm(message)) return;

  hiddenReviewCodes.add(stock.code);
  saveHiddenReviewCodes();
  stocks = stocks.filter((item) => item.code !== stock.code);
  delete quotes[stock.code];
  delete klines[stock.code];
  delete klineStatus[stock.code];
  selectedCode = selectedCode === stock.code ? stocks[0]?.code || "" : selectedCode;
  saveStocks();
  listPulse.textContent = `${stock.name} 已从复盘K线删除`;
  render();
}

function renderSelected() {
  const stock = stocks.find((item) => item.code === selectedCode) || stocks[0];
  if (!stock) {
    chartTitle.textContent = "选择一只股票";
    chartSub.textContent = "加入股票后显示K线";
    currentPrice.textContent = "--";
    currentChange.textContent = "--";
    maStrip.innerHTML = "";
    renderTradeList("");
    renderSellList("");
    renderTradeLegend([]);
    renderExecutionScore("");
    renderReviewSheet();
    renderNotes("");
    renderCostAreaSummary(null);
    drawEmptyChart("先加入一只股票");
    return;
  }
  selectedCode = stock.code;
  const quote = quotes[stock.code];
  const kline = klines[stock.code];
  const latest = getLatestKline(stock.code);
  const changeClass = quote ? getChangeClass(quote.changePercent) : "flat";

  chartTitle.textContent = `${stock.name} ${stock.code}`;
  const status = klineStatus[stock.code];
  const decision = watchDecisionContext[stock.code];
  chartSub.textContent = `${stock.theme} · ${kline?.items?.length ? `${kline.items.length}根日K · ${kline.source || "K线"}` : status?.detail || "等待日K"} · ${quote?.time ? formatQuoteTime(quote.time) : "待行情"} · 统一结论 ${decision?.label || "等待监控台同步"}`;
  currentPrice.textContent = quote?.price ? formatMoney(quote.price) : latest ? formatMoney(latest.close) : "--";
  currentChange.textContent = quote ? `${signed(quote.changePercent)}%` : "--";
  currentChange.className = changeClass;

  const ma = latest || {};
  maStrip.innerHTML = `
    <article class="ma-item">
      <span>当前价</span>
      <strong>${quote?.price ? formatMoney(quote.price) : "--"}</strong>
    </article>
    <article class="ma-item ma5">
      <span>MA5</span>
      <strong>${ma.ma5 ? formatMoney(ma.ma5) : "--"}</strong>
    </article>
    <article class="ma-item ma10">
      <span>MA10</span>
      <strong>${ma.ma10 ? formatMoney(ma.ma10) : "--"}</strong>
    </article>
    <article class="ma-item ma20">
      <span>MA20</span>
      <strong>${ma.ma20 ? formatMoney(ma.ma20) : "--"}</strong>
    </article>
  `;

  syncTradeForm(stock, quote, latest);
  renderTradeList(stock.code);
  renderSellList(stock.code);
  renderExecutionScore(stock.code);
  renderReviewSheet();
  renderNotes(stock.code);
  drawSelectedChart();
}

function renderNotes(code) {
  if (!code) {
    noteList.innerHTML = `<div class="empty">选择股票后写复盘</div>`;
    return;
  }
  const stockNotes = notes[code] || [];
  notePulse.textContent = `${stockNotes.length}条笔记`;
  noteList.innerHTML = stockNotes.length
    ? stockNotes.slice(0, 8).map((note) => `
      <article class="note-card">
        <span>${formatShortDateTime(new Date(note.at))}</span>
        <p>${escapeHtml(note.text)}</p>
      </article>
    `).join("")
    : `<div class="empty">还没有这只股票的复盘笔记</div>`;
}

function syncTradeForm(stock, quote, latest) {
  if (!stock || lastTradeFormCode === stock.code) return;
  lastTradeFormCode = stock.code;
  tradeDateInput.value = latest?.date || getTodayKey();
  tradePriceInput.value = quote?.price ? formatMoney(quote.price) : latest?.close ? formatMoney(latest.close) : "";
  tradeSharesInput.value = "";
  sellDateInput.value = latest?.date || getTodayKey();
  sellPriceInput.value = quote?.price ? formatMoney(quote.price) : latest?.close ? formatMoney(latest.close) : "";
  sellSharesInput.value = "";
  sheetDateInput.value = getTodayKey();
  sheetPlanInput.value = "";
}

function addTradeMarker() {
  const stock = stocks.find((item) => item.code === selectedCode);
  if (!stock) return;
  const latest = getLatestKline(stock.code);
  const date = tradeDateInput.value || latest?.date || getTodayKey();
  const price = Number(tradePriceInput.value);
  const shares = Number(tradeSharesInput.value);

  if (!tradeRules.isTransactionDateAllowed(date, getTodayKey())) {
    tradePulse.textContent = "买入日期无效或在未来，不能计入当前持仓";
    tradeDateInput.focus();
    return;
  }

  if (!Number.isFinite(price) || price <= 0) {
    tradePulse.textContent = "先填写有效买入价";
    tradePriceInput.focus();
    return;
  }
  if (!Number.isFinite(shares) || shares <= 0) {
    tradePulse.textContent = "先填写买入股数";
    tradeSharesInput.focus();
    return;
  }

  const item = {
    id: makeId(),
    date,
    price,
    shares,
    at: new Date().toISOString()
  };
  trades[stock.code] = [item, ...(trades[stock.code] || [])].slice(0, 80);
  saveTrades();
  syncTradeToWatchStock(stock.code, { kind: "buy", item });
  tradeSharesInput.value = "";
  tradePulse.textContent = `${stock.name} 买入标记已加到K线，并同步到主自选`;
  renderSelected();
}

function renderTradeList(code) {
  if (!tradeList) return;
  if (!code) {
    tradePulse.textContent = "选择股票后添加买入标记";
    renderCostSummary("", null);
    tradeList.innerHTML = `<div class="empty">选择股票后添加买入价和股数</div>`;
    return;
  }
  const rows = trades[code] || [];
  const quote = quotes[code];
  const summary = getCostSummary(code, quote);
  renderCostSummary(code, summary);
  tradePulse.textContent = rows.length ? `${rows.length}笔买入标记` : "还没有买入标记";
  if (!rows.length) {
    tradeList.innerHTML = `<div class="empty">输入买入价和股数后，会在K线上显示真实买点。</div>`;
    return;
  }
  tradeList.innerHTML = rows.slice(0, 8).map((trade) => `
    <article class="trade-card">
      <div>
        <strong>${escapeHtml(trade.date)} · ${formatMoney(trade.price)}</strong>
        <span>${formatShares(trade.shares)} · 买入金额 ${formatMoney(trade.price * trade.shares)}元</span>
        <small class="${getChangeClass(getTradePnl(trade, quote).pnlAmount)}">${formatTradePnlText(trade, quote)}</small>
      </div>
      <button class="mini-button danger" data-delete-trade="${trade.id}" type="button">删除</button>
    </article>
  `).join("");
  [...tradeList.querySelectorAll("[data-delete-trade]")].forEach((button) => {
    button.addEventListener("click", () => deleteTrade(code, button.dataset.deleteTrade));
  });
}

function addSellMarker() {
  const stock = stocks.find((item) => item.code === selectedCode);
  if (!stock) return;
  const latest = getLatestKline(stock.code);
  const date = sellDateInput.value || latest?.date || getTodayKey();
  const price = Number(sellPriceInput.value);
  const shares = Number(sellSharesInput.value);

  if (!tradeRules.isTransactionDateAllowed(date, getTodayKey())) {
    sellPulse.textContent = "卖出日期无效或在未来，不能计入当前持仓";
    sellDateInput.focus();
    return;
  }

  if (!Number.isFinite(price) || price <= 0) {
    sellPulse.textContent = "先填写有效卖出价";
    sellPriceInput.focus();
    return;
  }
  if (!Number.isFinite(shares) || shares <= 0) {
    sellPulse.textContent = "先填写卖出股数";
    sellSharesInput.focus();
    return;
  }

  const availability = getWatchSellAvailability(stock.code, date);
  if (!availability.historicalMarker && availability.unknown) {
    sellPulse.textContent = "可卖股数未知。先在主自选批次与T+1记录中核对历史可卖股数。";
    return;
  }
  if (!availability.historicalMarker && shares > availability.availableShares) {
    sellPulse.textContent = `T+1可卖上限 ${availability.availableShares} 股，不能标记卖出 ${shares} 股。`;
    return;
  }

  const item = {
    id: makeId(),
    date,
    price,
    shares,
    reason: sellReasonInput.value || "卖出",
    planned: sellPlannedInput.value || "待复盘",
    at: new Date().toISOString()
  };
  sells[stock.code] = [item, ...(sells[stock.code] || [])].slice(0, 80);
  saveSells();
  const syncResult = syncTradeToWatchStock(stock.code, { kind: "sell", item });
  sellSharesInput.value = "";
  sellPulse.textContent = syncResult?.ok === false
    ? `${stock.name} 卖出标记已加到K线，但持仓未扣减：批次/T+1记录需先核对`
    : `${stock.name} 卖出标记已加到K线，并同步剩余持仓`;
  renderSelected();
}

function renderSellList(code) {
  if (!sellList) return;
  if (!code) {
    if (sellPulse) sellPulse.textContent = "选择股票后添加卖出标记";
    sellList.innerHTML = `<div class="empty">选择股票后添加卖出价、股数和原因</div>`;
    return;
  }
  const rows = sells[code] || [];
  const summary = getCostSummary(code, quotes[code]);
  if (sellPulse) sellPulse.textContent = rows.length ? `${rows.length}笔卖出标记` : "还没有卖出标记";
  if (!rows.length) {
    sellList.innerHTML = `<div class="empty">卖出后记录原因，才能复盘是止盈、止损还是情绪卖。</div>`;
    return;
  }
  sellList.innerHTML = rows.slice(0, 8).map((sell) => {
    const pnl = getSellPnl(sell, summary);
    return `
      <article class="trade-card sell">
        <div>
          <strong>${escapeHtml(sell.date)} · ${formatMoney(sell.price)}</strong>
          <span>${formatShares(sell.shares)} · ${escapeHtml(sell.reason || "卖出")} · ${escapeHtml(sell.planned || "待复盘")}</span>
          <small class="${getChangeClass(pnl.pnlAmount)}">${formatSellPnlText(sell, summary)}</small>
        </div>
        <button class="mini-button danger" data-delete-sell="${sell.id}" type="button">删除</button>
      </article>
    `;
  }).join("");
  [...sellList.querySelectorAll("[data-delete-sell]")].forEach((button) => {
    button.addEventListener("click", () => deleteSell(code, button.dataset.deleteSell));
  });
}

function getCostSummary(code, quote) {
  const rows = trades[code] || [];
  const sellRows = sells[code] || [];
  const validRows = rows.filter((trade) => tradeRules.isTransactionDateAllowed(String(trade.date || ""), getTodayKey()) && Number(trade.price) > 0 && Number(trade.shares) > 0);
  const validSells = sellRows.filter((sell) => tradeRules.isTransactionDateAllowed(String(sell.date || ""), getTodayKey()) && Number(sell.price) > 0 && Number(sell.shares) > 0);
  const net = tradeRules.calculateNetPosition({ buys: validRows, sells: validSells, currentPrice: quote?.price, feeSettings });
  const totalShares = validRows.reduce((sum, trade) => sum + Number(trade.shares), 0);
  const totalCost = validRows.reduce((sum, trade) => sum + Number(trade.price) * Number(trade.shares), 0);
  const avgCost = totalShares ? totalCost / totalShares : 0;
  const soldShares = net.soldShares;
  const soldAmount = net.grossSoldAmount;
  const realizedPnl = net.realizedPnl;
  const remainingShares = net.remainingShares;
  const remainingCost = net.remainingCost;
  const currentPrice = net.currentPrice;
  const currentValue = net.currentValue;
  const priceDiff = currentPrice && avgCost ? currentPrice - avgCost : 0;
  const unrealizedPnl = net.unrealizedPnl;
  const pnlAmount = net.netPnl;
  const pnlPct = net.pnlPct;
  return {
    count: validRows.length,
    sellCount: validSells.length,
    totalShares,
    totalCost,
    avgCost,
    soldShares,
    soldAmount,
    realizedPnl,
    remainingShares,
    remainingCost,
    currentPrice,
    currentValue,
    priceDiff,
    unrealizedPnl,
    ...net,
    pnlAmount,
    pnlPct
  };
}

function renderCostSummary(code, summary) {
  if (!costSummary) return;
  if (!code || !summary?.count) {
    costSummary.innerHTML = `
      <article class="cost-card wait">
        <span>成本盈亏</span>
        <strong>等待买入记录</strong>
        <small>输入买入价和股数后自动计算</small>
      </article>
    `;
    return;
  }
  const pnlClass = getChangeClass(summary.pnlAmount);
  costSummary.innerHTML = `
    <article class="cost-card">
      <span>费用后均价</span>
      <strong>${formatMoney(summary.averageNetCost)}</strong>
      <small>${formatShares(summary.totalShares)} · 买入净成本${formatMoney(summary.acquisitionCost)}元</small>
    </article>
    <article class="cost-card">
      <span>剩余持仓</span>
      <strong>${formatShares(summary.remainingShares)}</strong>
      <small>${summary.currentPrice ? `市值${formatMoney(summary.currentValue)}元` : "等待当前价"}</small>
    </article>
    <article class="cost-card">
      <span>当前价格</span>
      <strong>${summary.currentPrice ? formatMoney(summary.currentPrice) : "--"}</strong>
      <small>已卖${formatShares(summary.soldShares)} · ${summary.sellCount}笔</small>
    </article>
    <article class="cost-card ${pnlClass}">
      <span>已实现盈亏</span>
      <strong>${summary.sellCount ? `${signed(summary.realizedPnl)}元` : "--"}</strong>
      <small>${summary.sellCount ? `扣卖出费用 · 卖出${formatMoney(summary.soldAmount)}元` : "卖出后扣费计算"}</small>
    </article>
    <article class="cost-card ${pnlClass}">
      <span>总盈亏</span>
      <strong>${summary.currentPrice ? `${signed(summary.pnlAmount)}元` : "--"}</strong>
      <small>${summary.currentPrice ? `${signed(summary.pnlPct)}% · 清仓费${formatMoney(summary.estimatedExitFees)}元` : "等待当前价"}</small>
    </article>
    <article class="cost-card">
      <span>净保本价</span>
      <strong>${summary.remainingShares ? summary.breakEvenCovered ? "已实现覆盖" : formatMoney(summary.breakEvenPrice) : "--"}</strong>
      <small>${summary.remainingShares ? summary.breakEvenCovered ? "已实现收益覆盖剩余成本" : `预计卖出费${formatMoney(summary.estimatedExitFees)}元` : "无剩余持仓"}</small>
    </article>
    ${summary.unmatchedSoldShares ? `<small class="cost-position-warning">卖出记录超出可追溯持仓 ${formatShares(summary.unmatchedSoldShares)}，该部分盈亏无法核算</small>` : ""}
  `;
}

function getSavedWatchStock(code) {
  try {
    const saved = JSON.parse(localStorage.getItem(WATCH_STOCKS_KEY) || "[]");
    return Array.isArray(saved) ? saved.find((item) => String(item.code).padStart(6, "0") === code) || null : null;
  } catch {
    return null;
  }
}

function getWatchSellAvailability(code, date) {
  if (date < getTodayKey()) return { availableShares: null, unknown: false, historicalMarker: true };
  const saved = getSavedWatchStock(code);
  if (!saved) return { availableShares: null, unknown: true };
  if (saved.reviewSyncError) return { availableShares: null, unknown: true };
  return tradeRules.getLotAvailability(saved.lots, date, saved.legacySellableShares, Number(saved.shares) || 0);
}

function syncTradeToWatchStock(code, transaction = null) {
  const stock = stocks.find((item) => item.code === code) || commonStocks.find((item) => item.code === code);
  if (!stock) return false;

  let saved = [];
  try {
    const raw = JSON.parse(localStorage.getItem(WATCH_STOCKS_KEY) || "[]");
    saved = Array.isArray(raw) ? raw : [];
  } catch {
    saved = [];
  }

  const rows = trades[code] || [];
  const sellRows = sells[code] || [];
  const existing = saved.find((item) => String(item.code).padStart(6, "0") === code);
  if (!existing && !rows.length && !sellRows.length) return false;
  const entryDate = rows
    .map((trade) => trade.date)
    .filter((date) => tradeRules.isTransactionDateAllowed(String(date || ""), getTodayKey()))
    .sort()[0] || "";
  let base = existing?.reviewSyncBase;
  let baselineTradeIds = new Set(Array.isArray(existing?.reviewBaselineTradeIds) ? existing.reviewBaselineTradeIds : []);
  let baselineSellIds = new Set(Array.isArray(existing?.reviewBaselineSellIds) ? existing.reviewBaselineSellIds : []);
  if (!base) {
    base = {
      shares: Math.max(0, Math.floor(Number(existing?.shares) || 0)),
      cost: Number(existing?.cost) || 0,
      lots: Array.isArray(existing?.lots) ? existing.lots.map((lot) => ({ ...lot })) : [],
      legacyAvailableShares: existing?.legacySellableShares ?? ""
    };
    if (Number(existing?.shares) > 0) {
      const knownFailedSells = new Set(existing?.reviewFailedSellIds || []);
      const excludedTradeIds = transaction?.kind === "buy" ? [transaction.item.id] : [];
      const excludedSellIds = [...knownFailedSells, ...(transaction?.kind === "sell" ? [transaction.item.id] : [])];
      tradeRules.getEligibleTransactionIds(rows, { excludeIds: excludedTradeIds, todayKey: getTodayKey() }).forEach((id) => baselineTradeIds.add(id));
      tradeRules.getEligibleTransactionIds(sellRows, { excludeIds: excludedSellIds, todayKey: getTodayKey() }).forEach((id) => baselineSellIds.add(id));
      base.lots.filter((lot) => lot.source === "review" && lot.tradeId).forEach((lot) => baselineTradeIds.add(lot.tradeId));
    }
  }

  const deferredTransactions = [
    ...rows.filter((item) => !tradeRules.isTransactionDateAllowed(String(item.date || ""), getTodayKey())),
    ...sellRows.filter((item) => !tradeRules.isTransactionDateAllowed(String(item.date || ""), getTodayKey()))
  ];
  const pending = [
    ...rows.filter((item) => !baselineTradeIds.has(item.id) && tradeRules.isTransactionDateAllowed(String(item.date || ""), getTodayKey())).map((item) => ({ ...item, kind: "buy" })),
    ...sellRows.filter((item) => !baselineSellIds.has(item.id) && tradeRules.isTransactionDateAllowed(String(item.date || ""), getTodayKey())).map((item) => ({ ...item, kind: "sell" }))
  ].sort((a, b) => String(a.date).localeCompare(String(b.date)) || String(a.at || "").localeCompare(String(b.at || "")));

  let lots = Array.isArray(base.lots) ? base.lots.map((lot) => ({ ...lot })) : [];
  let legacyAvailable = base.legacyAvailableShares ?? "";
  let shares = Math.max(0, Math.floor(Number(base.shares) || 0));
  let cost = Number(base.cost) || 0;
  const failedSells = [];
  const syncedTradeIds = [...baselineTradeIds];
  const syncedSellIds = [...baselineSellIds];
  pending.forEach((item) => {
    if (item.kind === "buy") {
      const boughtShares = Math.max(0, Math.floor(Number(item.shares) || 0));
      const buyPrice = Number(item.price) || 0;
      if (!boughtShares || !buyPrice) return;
      cost = shares && cost ? (shares * cost + boughtShares * buyPrice) / (shares + boughtShares) : buyPrice;
      shares += boughtShares;
      lots.push({ buyDate: item.date, shares: boughtShares, price: buyPrice, source: "review", tradeId: item.id });
      syncedTradeIds.push(item.id);
      return;
    }
    const soldShares = Math.max(0, Math.floor(Number(item.shares) || 0));
    const sale = tradeRules.consumeSellFromLots(lots, soldShares, item.date, legacyAvailable, shares);
    if (!sale.allowed) {
      failedSells.push(item.id);
      return;
    }
    lots = sale.lots;
    legacyAvailable = sale.legacyAvailableShares ?? "";
    shares = Math.max(0, shares - soldShares);
    syncedSellIds.push(item.id);
  });

  const syncNote = shares > 0 ? "复盘买卖同步" : "复盘卖出同步";
  const nextItem = {
    ...(existing || {}),
    code,
    name: existing?.name || stock.name || code,
    theme: existing?.theme || stock.theme || "未分类",
    group: shares > 0 ? "holding" : "watch",
    layer: "normal",
    cost: shares > 0 ? Number(cost.toFixed(4)) : "",
    shares: shares > 0 ? shares : "",
    lots,
    legacySellableShares: legacyAvailable,
    reviewSyncInitialized: true,
    reviewSyncBase: base,
    reviewBaselineTradeIds: [...baselineTradeIds],
    reviewBaselineSellIds: [...baselineSellIds],
    reviewSyncedTradeIds: [...new Set(syncedTradeIds)],
    reviewSyncedSellIds: [...new Set(syncedSellIds)],
    reviewFailedSellIds: [...new Set(failedSells)],
    reviewDeferredTransactionIds: deferredTransactions.map((item) => String(item.id || "")).filter(Boolean),
    reviewSyncError: failedSells.length
      ? "有历史卖出记录未通过T+1批次校验"
      : deferredTransactions.length
        ? "存在未来日期交易，未计入当前持仓；请先修正交易日期"
        : "",
    entryDate: existing?.entryDate || entryDate,
    note: existing?.note
      ? existing.note.includes(syncNote) ? existing.note : `${existing.note} / ${syncNote}`
      : syncNote
  };

  const next = existing
    ? saved.map((item) => (String(item.code).padStart(6, "0") === code ? nextItem : item))
    : [nextItem, ...saved];
  localStorage.setItem(WATCH_STOCKS_KEY, JSON.stringify(next));
  notifyWatchAppHoldingSync(code, nextItem);
  return { ok: failedSells.length === 0, failedSells };
}

function notifyWatchAppHoldingSync(code, stock) {
  try {
    window.parent?.postMessage({
      type: "stock-review-holding-sync",
      code,
      cost: stock.cost,
      shares: stock.shares
    }, "*");
  } catch {
    // Standalone mode can ignore parent sync.
  }
}

function renderExecutionScore(code) {
  if (!executionScoreRows) return;
  if (!code) {
    if (scorePulse) scorePulse.textContent = "选择股票后评分";
    executionScoreRows.innerHTML = `<div class="empty">选择股票后查看执行评分</div>`;
    return;
  }

  const result = getExecutionScore(code);
  if (scorePulse) scorePulse.textContent = `${result.label} · ${result.score}分`;
  executionScoreRows.innerHTML = `
    <article class="score-focus ${result.level}">
      <div>
        <span>复盘执行分</span>
        <strong>${result.score}</strong>
      </div>
      <p>${escapeHtml(result.summary)}</p>
    </article>
    <div class="score-checks">
      ${result.checks.map((check) => `
        <article class="score-check ${check.level}">
          <strong>${escapeHtml(check.title)}</strong>
          <span>${escapeHtml(check.label)}</span>
          <small>${escapeHtml(check.detail)}</small>
        </article>
      `).join("")}
    </div>
  `;
}

function getExecutionScore(code) {
  const stock = stocks.find((item) => item.code === code);
  const quote = quotes[code];
  const summary = getCostSummary(code, quote);
  const rows = (trades[code] || []).filter((trade) => Number(trade.price) > 0 && Number(trade.shares) > 0);
  const sellRows = (sells[code] || []).filter((sell) => Number(sell.price) > 0 && Number(sell.shares) > 0);
  const stockNotes = notes[code] || [];
  const noteText = stockNotes.map((note) => note.text || "").join(" ");

  if (!rows.length) {
    return {
      score: 0,
      level: "wait",
      label: "等待记录",
      summary: "还没有真实买入记录，先不要凭记忆复盘。",
      checks: [
        { level: "wait", title: "买入记录", label: "未记录", detail: "输入买入价和股数后自动生成成本和买点。" }
      ]
    };
  }

  const chaseContext = getWorstTradeChaseContext(code, rows);
  const sellContext = getSellDisciplineContext(sellRows);
  const capitalBase = 40000;
  const positionPct = summary.remainingCost ? (summary.remainingCost / capitalBase) * 100 : 0;
  const hasPlanNote = /计划|止损|卖|承接|量能|均线|MA|分批/.test(noteText);
  const pnlPct = summary.currentPrice && summary.avgCost ? summary.pnlPct : null;
  const checks = [
    {
      level: "pass",
      title: "买入记录",
      label: `${rows.length}笔`,
      detail: `费用后均价${formatMoney(summary.averageNetCost)}，共${formatShares(summary.totalShares)}。`
    },
    {
      level: chaseContext.level,
      title: "追高检查",
      label: chaseContext.label,
      detail: chaseContext.detail
    },
    {
      level: positionPct <= 30 ? "pass" : positionPct <= 50 ? "warn" : "danger",
      title: "仓位纪律",
      label: `${positionPct.toFixed(1)}%`,
      detail: positionPct <= 30 ? "按4万账户估算，剩余单票仓位克制。" : positionPct <= 50 ? "剩余仓位偏高，后续只允许按计划加减。" : "剩余单票仓位过重，先守本金。"
    },
    {
      level: sellContext.level,
      title: "卖出纪律",
      label: sellContext.label,
      detail: sellContext.detail
    },
    {
      level: hasPlanNote ? "pass" : "warn",
      title: "复盘计划",
      label: hasPlanNote ? "已记录" : "缺计划",
      detail: hasPlanNote ? "笔记里有承接、量能、止损或卖出计划。" : "建议补一条复盘：为什么买、错了哪里卖。"
    },
    {
      level: pnlPct === null ? "wait" : pnlPct <= -8 ? "danger" : pnlPct <= -5 ? "warn" : "pass",
      title: "成本反馈",
      label: pnlPct === null ? "待现价" : `${signed(pnlPct)}%`,
      detail: pnlPct === null ? "等待当前价格后计算总盈亏。" : pnlPct <= -8 ? "总盈亏压力较大，要回到止损计划。" : pnlPct <= -5 ? "亏损扩大，禁止情绪补仓。" : "当前没有触发亏损纪律。"
    }
  ];

  const penalty = checks.reduce((sum, check) => {
    if (check.level === "danger") return sum + 26;
    if (check.level === "warn") return sum + 14;
    if (check.level === "wait") return sum + 6;
    return sum;
  }, 0);
  const score = Math.max(0, Math.min(100, 100 - penalty));
  const level = score >= 82 ? "pass" : score >= 68 ? "warn" : "danger";
  const label = score >= 82 ? "计划内" : score >= 68 ? "有瑕疵" : "需纠偏";
  const summaryText = stock
    ? `${stock.name} 本次执行${label}，重点看买入追高、卖出纪律、仓位和复盘计划。`
    : `本次执行${label}，重点看买入追高、卖出纪律、仓位和复盘计划。`;
  return { score, level, label, summary: summaryText, checks };
}

function getWorstTradeChaseContext(code, rows) {
  const items = klines[code]?.items || [];
  let worst = { ratio: 0.5, trade: rows[0], day: null };
  rows.forEach((trade) => {
    const day = items.find((item) => item.date === trade.date);
    if (!day || day.high <= day.low) return;
    const ratio = (Number(trade.price) - day.low) / (day.high - day.low);
    if (ratio > worst.ratio) worst = { ratio, trade, day };
  });

  if (!worst.day) {
    return {
      level: "wait",
      label: "待K线",
      detail: "买入日K线未匹配，等K线数据回来后判断是否追在高位。"
    };
  }
  if (worst.ratio >= 0.78) {
    return {
      level: "danger",
      label: "偏追高",
      detail: `${worst.trade.date} 买在当日振幅上沿，后续不能再情绪加仓。`
    };
  }
  if (worst.ratio >= 0.62) {
    return {
      level: "warn",
      label: "略偏高",
      detail: `${worst.trade.date} 买点不算低，明天只看承接和量能。`
    };
  }
  return {
    level: "pass",
    label: "未追高",
    detail: "买入价不在当日振幅高位，执行相对克制。"
  };
}

function getSellDisciplineContext(rows) {
  if (!rows.length) {
    return {
      level: "wait",
      label: "未卖出",
      detail: "还没有卖出记录，后续卖出要写清楚原因。"
    };
  }
  const bad = rows.find((sell) => /情绪|手滑|计划外/.test(`${sell.reason || ""} ${sell.planned || ""}`));
  if (bad) {
    return {
      level: "danger",
      label: bad.reason || bad.planned || "计划外",
      detail: `${bad.date} 卖出需要重点复盘：这是系统卖点，还是情绪动作。`
    };
  }
  const unclear = rows.find((sell) => (sell.planned || "待复盘") === "待复盘");
  if (unclear) {
    return {
      level: "warn",
      label: "待复盘",
      detail: `${unclear.date} 卖出原因还没定性，盘后补上是否按计划。`
    };
  }
  return {
    level: "pass",
    label: `${rows.length}笔计划卖`,
    detail: "卖出记录已写原因，暂未发现情绪割肉或手滑误卖标签。"
  };
}

function getTradePnl(trade, quote) {
  const currentPrice = quote?.price || 0;
  const net = tradeRules.calculateNetPosition({ buys: [trade], currentPrice, feeSettings });
  return { pnlAmount: net.netPnl, pnlPct: net.pnlPct };
}

function formatTradePnlText(trade, quote) {
  if (!quote?.price) return "等待当前价计算盈亏";
  const pnl = getTradePnl(trade, quote);
  return `现价${formatMoney(quote.price)} · ${signed(pnl.pnlAmount)}元 · ${signed(pnl.pnlPct)}%`;
}

function getSellPnl(sell, summary) {
  const matchedSale = summary?.sellResults?.find((item) => item.id && item.id === String(sell.id || ""));
  if (matchedSale) return { pnlAmount: matchedSale.realizedPnl, pnlPct: matchedSale.pnlPct };
  const shares = Number(sell.shares) || 0;
  const price = Number(sell.price) || 0;
  const avgCost = Number(summary?.averageNetCost || summary?.avgCost) || 0;
  const fees = tradeRules.estimateTradeFees(price, shares, "sell", feeSettings, { includeSlippage: false }).total;
  const pnlAmount = avgCost && shares ? (price * shares - fees) - avgCost * shares : 0;
  const pnlPct = avgCost && shares ? pnlAmount / (avgCost * shares) * 100 : 0;
  return { pnlAmount, pnlPct };
}

function formatSellPnlText(sell, summary) {
  if (!summary?.averageNetCost && !summary?.avgCost) return "等待买入成本计算卖出盈亏";
  const pnl = getSellPnl(sell, summary);
  return `费用后成本${formatMoney(summary.averageNetCost || summary.avgCost)} · 扣卖出费用 · ${signed(pnl.pnlAmount)}元 · ${signed(pnl.pnlPct)}%`;
}

function deleteTrade(code, id) {
  trades[code] = (trades[code] || []).filter((trade) => trade.id !== id);
  saveTrades();
  syncTradeToWatchStock(code);
  tradePulse.textContent = "买入标记已删除";
  renderSelected();
}

function deleteSell(code, id) {
  sells[code] = (sells[code] || []).filter((sell) => sell.id !== id);
  saveSells();
  syncTradeToWatchStock(code);
  if (sellPulse) sellPulse.textContent = "卖出标记已删除";
  renderSelected();
}

function saveNote() {
  const stock = stocks.find((item) => item.code === selectedCode);
  const text = noteInput.value.trim();
  if (!stock || !text) {
    noteInput.focus();
    return;
  }
  notes[stock.code] = [{ at: new Date().toISOString(), text }, ...(notes[stock.code] || [])].slice(0, 80);
  saveNotes();
  noteInput.value = "";
  notePulse.textContent = "笔记已保存";
  renderNotes(stock.code);
  renderExecutionScore(stock.code);
}

function addReviewSheetRow() {
  const stock = stocks.find((item) => item.code === selectedCode);
  if (!stock) {
    if (sheetPulse) sheetPulse.textContent = "先选择一只股票";
    return;
  }
  const snapshot = getReviewSheetSnapshot(stock);
  const row = {
    id: makeId(),
    at: new Date().toISOString(),
    date: sheetDateInput.value || getTodayKey(),
    code: stock.code,
    name: stock.name,
    theme: stock.theme,
    action: sheetActionInput.value || "持仓观察",
    price: snapshot.price,
    shares: snapshot.shares,
    pnlAmount: snapshot.pnlAmount,
    pnlPct: snapshot.pnlPct,
    planned: sheetPlannedInput.value || "待复盘",
    mistake: sheetMistakeInput.value || "无",
    plan: sheetPlanInput.value.trim() || "明日按计划观察"
  };
  reviewSheetRows = [row, ...reviewSheetRows].slice(0, 300);
  saveReviewSheetRows();
  sheetPlanInput.value = "";
  if (sheetPulse) sheetPulse.textContent = `${stock.name} 已写入复盘表`;
  renderReviewSheet();
}

function getReviewSheetSnapshot(stock) {
  const action = sheetActionInput.value || "持仓观察";
  const summary = getCostSummary(stock.code, quotes[stock.code]);
  const latestBuy = (trades[stock.code] || [])[0];
  const latestSell = (sells[stock.code] || [])[0];
  const latestKline = getLatestKline(stock.code);
  if (action === "买入" && latestBuy) {
    return {
      price: Number(latestBuy.price) || 0,
      shares: Number(latestBuy.shares) || 0,
      pnlAmount: getTradePnl(latestBuy, quotes[stock.code]).pnlAmount,
      pnlPct: getTradePnl(latestBuy, quotes[stock.code]).pnlPct
    };
  }
  if (action === "卖出" && latestSell) {
    const pnl = getSellPnl(latestSell, summary);
    return {
      price: Number(latestSell.price) || 0,
      shares: Number(latestSell.shares) || 0,
      pnlAmount: pnl.pnlAmount,
      pnlPct: pnl.pnlPct
    };
  }
  return {
    price: quotes[stock.code]?.price || latestKline?.close || 0,
    shares: summary.remainingShares || summary.totalShares || 0,
    pnlAmount: summary.pnlAmount || 0,
    pnlPct: summary.pnlPct || 0
  };
}

function renderReviewSheet() {
  if (!reviewSheetTable) return;
  if (sheetPulse) sheetPulse.textContent = reviewSheetRows.length ? `${reviewSheetRows.length}条表格复盘` : "像表格一样记录交易事实";
  if (!reviewSheetRows.length) {
    reviewSheetTable.innerHTML = `
      <tbody>
        <tr><td class="sheet-empty">还没有表格复盘。选择股票后，写入今天的动作、计划内外和明日计划。</td></tr>
      </tbody>
    `;
    return;
  }
  reviewSheetTable.innerHTML = `
    <thead>
      <tr>
        <th>日期</th>
        <th>股票</th>
        <th>动作</th>
        <th>价格</th>
        <th>股数</th>
        <th>板块</th>
        <th>盈亏</th>
        <th>计划</th>
        <th>错误</th>
        <th>明日计划</th>
        <th></th>
      </tr>
    </thead>
    <tbody>
      ${reviewSheetRows.slice(0, 80).map((row) => `
        <tr>
          <td>${escapeHtml(row.date)}</td>
          <td><strong>${escapeHtml(row.name)}</strong><small>${escapeHtml(row.code)}</small></td>
          <td>${escapeHtml(row.action)}</td>
          <td>${formatMoney(row.price)}</td>
          <td>${formatShares(row.shares)}</td>
          <td>${escapeHtml(row.theme)}</td>
          <td class="${getChangeClass(row.pnlAmount)}">${signed(row.pnlAmount)}元<br><small>${signed(row.pnlPct)}%</small></td>
          <td>${escapeHtml(row.planned)}</td>
          <td>${escapeHtml(row.mistake)}</td>
          <td>${escapeHtml(row.plan)}</td>
          <td><button class="mini-button danger" data-delete-sheet="${row.id}" type="button">删</button></td>
        </tr>
      `).join("")}
    </tbody>
  `;
  [...reviewSheetTable.querySelectorAll("[data-delete-sheet]")].forEach((button) => {
    button.addEventListener("click", () => deleteReviewSheetRow(button.dataset.deleteSheet));
  });
}

function deleteReviewSheetRow(id) {
  reviewSheetRows = reviewSheetRows.filter((row) => row.id !== id);
  saveReviewSheetRows();
  renderReviewSheet();
}

function exportReviewSheetCsv() {
  if (!reviewSheetRows.length) {
    if (sheetPulse) sheetPulse.textContent = "暂无表格复盘可导出";
    return;
  }
  const headers = ["日期", "股票", "代码", "动作", "价格", "股数", "板块", "盈亏金额", "盈亏比例", "计划内外", "错误类型", "明日计划"];
  const rows = reviewSheetRows.map((row) => [
    row.date,
    row.name,
    row.code,
    row.action,
    formatMoney(row.price),
    Math.round(Number(row.shares) || 0),
    row.theme,
    signed(row.pnlAmount),
    `${signed(row.pnlPct)}%`,
    row.planned,
    row.mistake,
    row.plan
  ]);
  const csv = [headers, ...rows].map((row) => row.map(csvCell).join(",")).join("\r\n");
  const blob = new Blob([`\ufeff${csv}`], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `复盘表-${getTodayKey()}.csv`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
  if (sheetPulse) sheetPulse.textContent = "CSV已导出，可用Excel打开";
}

function csvCell(value) {
  const text = String(value ?? "");
  return `"${text.replaceAll('"', '""')}"`;
}

function drawSelectedChart() {
  const stock = stocks.find((item) => item.code === selectedCode);
  if (!stock || !klines[stock.code]?.items?.length) {
    renderCostAreaSummary(null, 0);
    drawEmptyChart(klineStatus[stock?.code]?.detail || "等待K线数据");
    renderTradeLegend([]);
    return;
  }
  const items = klines[stock.code].items.slice(-rangeDays);
  const visibleMarkers = getVisibleTradeMarkers(stock.code, items);
  const completedItems = items.filter((item) => item.date && item.date < getTodayKey());
  const profile = tradeRules.calculateVolumeProfile(completedItems);
  renderCostAreaSummary(profile);
  drawKlineChart(items, quotes[stock.code], visibleMarkers, profile);
}

function drawEmptyChart(text) {
  const ctx = canvas.getContext("2d");
  resizeCanvas(ctx);
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  chartEmpty.textContent = text;
  chartEmpty.classList.remove("hidden");
}

function drawKlineChart(items, quote, visibleTrades = [], volumeProfile = null) {
  const ctx = canvas.getContext("2d");
  const { width, height } = resizeCanvas(ctx);
  renderTradeLegend(visibleTrades);
  chartEmpty.classList.add("hidden");
  ctx.clearRect(0, 0, width, height);

  const margin = { left: 54, right: 56, top: 20, bottom: 34 };
  const volumeHeight = Math.max(74, Math.round(height * 0.18));
  const priceBottom = height - margin.bottom - volumeHeight - 18;
  const chartWidth = width - margin.left - margin.right;
  const priceHeight = priceBottom - margin.top;
  const volumeTop = priceBottom + 18;

  const maValues = items.flatMap((item) => [item.ma5, item.ma10, item.ma20]).filter(Number.isFinite);
  const tradePrices = visibleTrades.map((trade) => trade.price).filter(Number.isFinite);
  const profilePrices = volumeProfile ? [volumeProfile.upper, volumeProfile.lower] : [];
  const quotePrice = Number(quote?.price);
  const quotePrices = Number.isFinite(quotePrice) && quotePrice > 0 ? [quotePrice] : [];
  const high = Math.max(...items.map((item) => item.high), ...maValues, ...tradePrices, ...profilePrices, ...quotePrices);
  const low = Math.min(...items.map((item) => item.low), ...maValues, ...tradePrices, ...profilePrices, ...quotePrices);
  const padding = Math.max((high - low) * 0.08, high * 0.005);
  const maxPrice = high + padding;
  const minPrice = Math.max(0, low - padding);
  const maxVolume = Math.max(...items.map((item) => item.volume), 1);
  const step = chartWidth / items.length;
  const candleWidth = Math.max(3, Math.min(13, step * 0.62));

  const xOf = (index) => margin.left + index * step + step / 2;
  const yOf = (price) => margin.top + (maxPrice - price) / (maxPrice - minPrice || 1) * priceHeight;

  drawGrid(ctx, margin, chartWidth, priceHeight, priceBottom, minPrice, maxPrice, items);
  drawCostArea(ctx, volumeProfile, margin, chartWidth, yOf);

  items.forEach((item, index) => {
    const x = xOf(index);
    const up = item.close >= item.open;
    ctx.strokeStyle = up ? "#c52727" : "#087443";
    ctx.fillStyle = up ? "#fff0f0" : "#087443";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x, yOf(item.high));
    ctx.lineTo(x, yOf(item.low));
    ctx.stroke();
    const openY = yOf(item.open);
    const closeY = yOf(item.close);
    const bodyTop = Math.min(openY, closeY);
    const bodyHeight = Math.max(1, Math.abs(closeY - openY));
    ctx.fillRect(x - candleWidth / 2, bodyTop, candleWidth, bodyHeight);
    ctx.strokeRect(x - candleWidth / 2, bodyTop, candleWidth, bodyHeight);

    const volumeH = item.volume / maxVolume * volumeHeight;
    ctx.fillStyle = up ? "rgba(197,39,39,0.42)" : "rgba(8,116,67,0.42)";
    ctx.fillRect(x - candleWidth / 2, volumeTop + volumeHeight - volumeH, candleWidth, volumeH);
  });

  drawMaLine(ctx, items, "ma5", xOf, yOf, "#d97706");
  drawMaLine(ctx, items, "ma10", xOf, yOf, "#c026d3");
  drawMaLine(ctx, items, "ma20", xOf, yOf, "#1d4ed8");
  drawTradeMarkers(ctx, visibleTrades, xOf, yOf, priceBottom);

  if (quotePrices.length) {
    const y = yOf(quotePrice);
    ctx.setLineDash([4, 4]);
    ctx.strokeStyle = "#c52727";
    ctx.beginPath();
    ctx.moveTo(margin.left, y);
    ctx.lineTo(width - margin.right, y);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = "#c52727";
    ctx.fillText(formatMoney(quotePrice), width - margin.right + 6, y + 4);
  }
}

function renderCostAreaSummary(profile) {
  if (!costAreaSummary) return;
  costAreaSummary.innerHTML = profile
    ? `<strong>成交密集区</strong><span>日K估算 · ${Math.round(profile.valueAreaPercent * 100)}%区间 ${formatMoney(profile.lower)}–${formatMoney(profile.upper)} · 中枢 ${formatMoney(profile.volumeWeightedCenter)} · POC ${formatMoney(profile.poc)} · ${profile.barCount}根完整日K</span>`
    : `<strong>成交密集区</strong><span>日K估算 · 暂无有效成交量数据</span>`;
}

function drawCostArea(ctx, profile, margin, chartWidth, yOf) {
  if (!profile) return;
  const upperY = yOf(profile.upper);
  const lowerY = yOf(profile.lower);
  const top = Math.min(upperY, lowerY);
  const height = Math.max(2, Math.abs(lowerY - upperY));
  ctx.fillStyle = "rgba(15, 118, 110, 0.10)";
  ctx.fillRect(margin.left, top, chartWidth, height);
  ctx.strokeStyle = "rgba(15, 118, 110, 0.62)";
  ctx.lineWidth = 1;
  ctx.setLineDash([3, 3]);
  [upperY, lowerY].forEach((y) => {
    ctx.beginPath();
    ctx.moveTo(margin.left, y);
    ctx.lineTo(margin.left + chartWidth, y);
    ctx.stroke();
  });
  const centerY = yOf(profile.volumeWeightedCenter);
  ctx.setLineDash([]);
  ctx.strokeStyle = "#0f766e";
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.moveTo(margin.left, centerY);
  ctx.lineTo(margin.left + chartWidth, centerY);
  ctx.stroke();
}

function drawGrid(ctx, margin, chartWidth, priceHeight, priceBottom, minPrice, maxPrice, items) {
  ctx.strokeStyle = "#e7ebf2";
  ctx.fillStyle = "#667085";
  ctx.lineWidth = 1;
  ctx.font = "12px Microsoft YaHei, Arial";
  for (let i = 0; i <= 4; i += 1) {
    const y = margin.top + priceHeight * i / 4;
    const price = maxPrice - (maxPrice - minPrice) * i / 4;
    ctx.beginPath();
    ctx.moveTo(margin.left, y);
    ctx.lineTo(margin.left + chartWidth, y);
    ctx.stroke();
    ctx.fillText(formatMoney(price), margin.left + chartWidth + 8, y + 4);
  }
  const labels = [0, Math.floor(items.length / 2), items.length - 1];
  labels.forEach((index) => {
    const item = items[index];
    if (!item) return;
    const x = margin.left + index * (chartWidth / items.length) + chartWidth / items.length / 2;
    ctx.fillText(item.date.slice(5), Math.max(4, x - 16), priceBottom + 116);
  });
}

function drawMaLine(ctx, items, key, xOf, yOf, color) {
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  let started = false;
  items.forEach((item, index) => {
    const value = item[key];
    if (!Number.isFinite(value)) return;
    const x = xOf(index);
    const y = yOf(value);
    if (!started) {
      ctx.moveTo(x, y);
      started = true;
    } else {
      ctx.lineTo(x, y);
    }
  });
  if (started) ctx.stroke();
}

function getVisibleTradeMarkers(code, items) {
  if (!items.length) return [];
  const buyRows = (trades[code] || []).map((trade) => ({ ...trade, side: "buy" }));
  const sellRows = (sells[code] || []).map((sell) => ({ ...sell, side: "sell" }));
  return [...buyRows, ...sellRows].map((trade) => {
    const index = findTradeIndex(items, trade.date);
    return index < 0 ? null : { ...trade, index };
  }).filter(Boolean).sort((a, b) => a.index - b.index || String(a.side).localeCompare(String(b.side)));
}

function findTradeIndex(items, date) {
  if (!date) return items.length - 1;
  const exact = items.findIndex((item) => item.date === date);
  if (exact >= 0) return exact;
  const next = items.findIndex((item) => item.date > date);
  if (next >= 0) return next;
  return items.length - 1;
}

function drawTradeMarkers(ctx, visibleTrades, xOf, yOf, priceBottom) {
  if (!visibleTrades.length) return;
  ctx.font = "12px Microsoft YaHei, Arial";
  visibleTrades.forEach((trade, order) => {
    const x = xOf(trade.index);
    const y = yOf(trade.price);
    const labelY = Math.max(18, y - 12 - (order % 2) * 15);
    const isSell = trade.side === "sell";
    const color = isSell ? "#c52727" : "#1c64f2";
    const lineColor = isSell ? "rgba(197,39,39,0.42)" : "rgba(28,100,242,0.42)";
    ctx.strokeStyle = lineColor;
    ctx.fillStyle = color;
    ctx.lineWidth = 1;
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    ctx.moveTo(x, Math.max(8, y - 36));
    ctx.lineTo(x, Math.min(priceBottom, y + 36));
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillRect(x - 5, y - 5, 10, 10);
    ctx.fillStyle = "#ffffff";
    ctx.fillText(isSell ? "S" : "B", x - 4, y + 4);
    ctx.fillStyle = color;
    ctx.fillText(`${isSell ? "卖" : "买"} ${formatMoney(trade.price)} / ${formatShares(trade.shares)}`, Math.min(x + 8, canvas.width - 170), labelY);
  });
}

function renderTradeLegend(visibleTrades) {
  if (!tradeLegend) return;
  const stockTrades = trades[selectedCode] || [];
  const stockSells = sells[selectedCode] || [];
  if (!stockTrades.length && !stockSells.length) {
    tradeLegend.innerHTML = `
      <span>买卖标记：暂无</span>
      <small>输入买入或卖出价后，会显示在K线上。</small>
    `;
    return;
  }
  const visibleBuys = visibleTrades.filter((trade) => trade.side === "buy").length;
  const visibleSells = visibleTrades.filter((trade) => trade.side === "sell").length;
  tradeLegend.innerHTML = `
    <span>买入 ${stockTrades.length} 笔 · 卖出 ${stockSells.length} 笔</span>
    <b>图中 B${visibleBuys} / S${visibleSells}</b>
    <small>${formatLegendPnl(selectedCode)} · 蓝色 B 为买入，红色 S 为卖出。</small>
  `;
}

function formatLegendPnl(code) {
  const summary = getCostSummary(code, quotes[code]);
  if (!summary?.count || !summary.currentPrice) return "等待成本和现价";
  return `费用后均价${formatMoney(summary.averageNetCost)}，剩余${formatShares(summary.remainingShares)}，净盈亏${signed(summary.pnlAmount)}元`;
}

function resizeCanvas(ctx) {
  const rect = canvas.getBoundingClientRect();
  const ratio = window.devicePixelRatio || 1;
  const width = Math.max(640, Math.round(rect.width || 960));
  const height = Math.max(420, Math.round(rect.height || 420));
  canvas.width = Math.round(width * ratio);
  canvas.height = Math.round(height * ratio);
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  return { width, height };
}

function fetchQuote(stock) {
  const symbol = `${marketPrefix(stock.code)}${stock.code}`;
  const varName = `v_${symbol}`;
  return new Promise((resolve) => {
    const oldScript = document.getElementById(`quote-${symbol}`);
    if (oldScript) oldScript.remove();
    window[varName] = undefined;
    const script = document.createElement("script");
    script.id = `quote-${symbol}`;
    script.charset = "gbk";
    script.src = `https://qt.gtimg.cn/q=${symbol}&_=${Date.now()}`;
    script.async = true;
    const timer = window.setTimeout(() => finish(null), JSONP_TIMEOUT);
    script.onload = () => finish(parseTencentQuote(stock, window[varName]));
    script.onerror = () => finish(null);

    function finish(value) {
      window.clearTimeout(timer);
      script.remove();
      resolve(value);
    }

    document.head.appendChild(script);
  });
}

async function fetchKline(stock) {
  const primary = await fetchEastmoneyKline(stock);
  if (primary?.items?.length) return { ...primary, source: "东方财富", detail: "主K线源" };
  const fallback = await fetchTencentKline(stock);
  if (fallback?.items?.length) return { ...fallback, source: "腾讯备用", detail: "东方财富失败，已用腾讯日K" };
  return { code: stock.code, items: [], source: "", detail: "东方财富和腾讯备用都未返回" };
}

function fetchEastmoneyKline(stock) {
  const callbackName = `reviewKline_${stock.code}_${Date.now()}_${Math.floor(Math.random() * 100000)}`;
  const secid = `${marketPrefix(stock.code) === "sh" ? "1" : "0"}.${stock.code}`;
  const url = [
    "https://push2his.eastmoney.com/api/qt/stock/kline/get",
    `?cb=${callbackName}`,
    `&secid=${secid}`,
    "&fields1=f1,f2,f3,f4,f5,f6",
    "&fields2=f51,f52,f53,f54,f55,f56,f57,f58,f59,f60,f61",
    "&klt=101",
    "&fqt=1",
    "&end=20500101",
    "&lmt=260",
    `&_=${Date.now()}`
  ].join("");

  return new Promise((resolve) => {
    const script = document.createElement("script");
    let settled = false;
    const timer = window.setTimeout(() => finish(null), JSONP_TIMEOUT);
    window[callbackName] = (payload) => finish(parseKlinePayload(stock, payload));
    script.id = `kline-${stock.code}`;
    script.src = url;
    script.async = true;
    script.onerror = () => finish(null);

    function finish(value) {
      if (settled) return;
      settled = true;
      window.clearTimeout(timer);
      delete window[callbackName];
      script.remove();
      resolve(value);
    }

    document.head.appendChild(script);
  });
}

async function fetchTencentKline(stock) {
  try {
    const symbol = `${marketPrefix(stock.code)}${stock.code}`;
    const url = `https://web.ifzq.gtimg.cn/appstock/app/fqkline/get?param=${symbol},day,,,260,qfq&_=${Date.now()}`;
    const response = await fetch(url, { cache: "no-store" });
    if (!response.ok) return null;
    const payload = await response.json();
    return parseTencentKlinePayload(stock, payload);
  } catch {
    return null;
  }
}

function parseTencentQuote(stock, raw) {
  if (!raw) return null;
  const parts = String(raw).split("~");
  const price = Number(parts[3]);
  if (!Number.isFinite(price) || price <= 0) return null;
  return {
    code: stock.code,
    name: parts[1] || stock.name,
    price,
    previousClose: Number(parts[4]) || null,
    open: Number(parts[5]) || null,
    high: Number(parts[33]) || null,
    low: Number(parts[34]) || null,
    change: Number(parts[31]) || 0,
    changePercent: Number(parts[32]) || 0,
    time: parts[30] || ""
  };
}

function parseKlinePayload(stock, payload) {
  const lines = payload?.data?.klines;
  if (!Array.isArray(lines) || lines.length < 5) return null;
  const rawItems = lines.map((line) => {
    const parts = String(line).split(",");
    return {
      date: parts[0],
      open: Number(parts[1]),
      close: Number(parts[2]),
      high: Number(parts[3]),
      low: Number(parts[4]),
      volume: Number(parts[5]),
      amount: Number(parts[6]),
      changePercent: Number(parts[8])
    };
  }).filter((item) => Number.isFinite(item.close) && Number.isFinite(item.high) && Number.isFinite(item.low));

  const items = rawItems.map((item, index) => ({
    ...item,
    ma5: movingAverage(rawItems, index, 5),
    ma10: movingAverage(rawItems, index, 10),
    ma20: movingAverage(rawItems, index, 20)
  }));

  return { code: stock.code, items };
}

function parseTencentKlinePayload(stock, payload) {
  const symbol = `${marketPrefix(stock.code)}${stock.code}`;
  const container = payload?.data?.[symbol];
  const lines = container?.qfqday || container?.day || container?.hfqday;
  if (!Array.isArray(lines) || lines.length < 5) return null;
  const rawItems = lines.map((line) => ({
    date: line[0],
    open: Number(line[1]),
    close: Number(line[2]),
    high: Number(line[3]),
    low: Number(line[4]),
    volume: Number(line[5]),
    amount: Number(line[8]) || 0,
    changePercent: Number(line[7]) || 0
  })).filter((item) => Number.isFinite(item.close) && Number.isFinite(item.high) && Number.isFinite(item.low));

  const items = rawItems.map((item, index) => ({
    ...item,
    ma5: movingAverage(rawItems, index, 5),
    ma10: movingAverage(rawItems, index, 10),
    ma20: movingAverage(rawItems, index, 20)
  }));

  return { code: stock.code, items };
}

function movingAverage(items, index, days) {
  if (index + 1 < days) return null;
  const slice = items.slice(index + 1 - days, index + 1);
  return slice.reduce((sum, item) => sum + item.close, 0) / days;
}

function getLatestKline(code) {
  const items = klines[code]?.items || [];
  return items[items.length - 1] || null;
}

function marketPrefix(code) {
  return code.startsWith("6") ? "sh" : "sz";
}

function getChangeClass(value) {
  if (value > 0) return "up";
  if (value < 0) return "down";
  return "flat";
}

function signed(value) {
  const num = Number(value) || 0;
  return `${num > 0 ? "+" : ""}${num.toFixed(2)}`;
}

function makeId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function getTodayKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatShares(value) {
  const num = Number(value);
  if (!Number.isFinite(num)) return "--股";
  return `${Math.round(num)}股`;
}

function formatMoney(value) {
  const num = Number(value);
  if (!Number.isFinite(num)) return "--";
  return num >= 100 ? num.toFixed(2) : num.toFixed(3).replace(/0$/, "");
}

function formatQuoteTime(value) {
  const text = String(value || "");
  if (text.length < 12) return "时间未知";
  return `${text.slice(4, 6)}-${text.slice(6, 8)} ${text.slice(8, 10)}:${text.slice(10, 12)}`;
}

function formatShortDateTime(date) {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) return "--";
  return date.toLocaleString("zh-CN", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  });
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
