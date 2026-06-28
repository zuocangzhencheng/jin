const STORAGE_KEY = "stock-watch-v1";
const CONFIG_STORAGE_KEY = "stock-watch-config-v1";
const AUCTION_STORAGE_KEY = "stock-watch-auction-v1";
const IGNORED_RADAR_STORAGE_KEY = "stock-watch-ignored-radar-v1";
const REVIEW_LOG_STORAGE_KEY = "stock-watch-review-log-v1";
const APP_VERSION = "v1.3 交易复盘";
const JSONP_TIMEOUT = 9000;
const RADAR_PAGE_SIZE = 80;
const TECH_REFRESH_MS = 60000;
const MARKET_REFRESH_MS = 60000;
const THEME_REFRESH_MS = 60000;
const AUCTION_START_MINUTES = 9 * 60 + 15;
const AUCTION_LOCK_MINUTES = 9 * 60 + 20;
const AUCTION_END_MINUTES = 9 * 60 + 25;
const AUCTION_VERIFY_MINUTES = 9 * 60 + 35;

const defaultSettings = {
  refreshSeconds: 60,
  minMarketCapYi: 300,
  radarPages: 4,
  radarLimit: 24,
  strongScore: 80,
  requireMarketConfirm: true
};

const themeStrength = {
  "AI算力/服务器": 5,
  "光模块/CPO": 5,
  "HBM/存储": 5,
  "半导体设备": 4,
  "半导体材料": 4,
  "先进封装": 4,
  "电子特气": 4,
  "面板/玻璃基板": 3,
  "功率半导体": 3,
  "光通信/海缆": 3,
  "其他": 2
};

const themeKeywords = {
  "AI算力/服务器": ["算力", "服务器", "数据中心", "液冷", "云计算", "AI"],
  "光模块/CPO": ["光模块", "CPO", "光通信", "通信设备", "光器件", "硅光"],
  "HBM/存储": ["存储", "HBM", "DRAM", "NAND", "存储芯片"],
  "半导体设备": ["半导体设备", "刻蚀", "光刻机", "清洗", "先进封装设备"],
  "半导体材料": ["半导体材料", "CMP", "靶材", "硅片", "光刻胶", "电子化学品"],
  "先进封装": ["先进封装", "Chiplet", "封装", "玻璃基板"],
  "电子特气": ["电子特气", "特气", "稀有气体", "氟化工"],
  "面板/玻璃基板": ["面板", "OLED", "MiniLED", "玻璃基板", "显示"],
  "功率半导体": ["功率半导体", "SiC", "IGBT", "MOSFET", "第三代半导体"],
  "光通信/海缆": ["光通信", "海缆", "海底电缆", "通信设备", "光纤光缆"]
};

const marketIndexes = [
  { symbol: "sh000001", name: "上证" },
  { symbol: "sz399001", name: "深成" },
  { symbol: "sz399006", name: "创业板" }
];

const seedStocks = [
  {
    code: "600703",
    name: "三安光电",
    cost: 22.1,
    target: 24.6,
    stop: 20.8,
    group: "holding",
    theme: "功率半导体",
    note: "化合物半导体 / MiniLED"
  },
  {
    code: "600378",
    name: "昊华科技",
    cost: 49.6,
    target: 55,
    stop: 46,
    group: "holding",
    theme: "电子特气",
    note: "电子特气 / 六氟化钨"
  },
  {
    code: "600522",
    name: "中天科技",
    cost: 60.4,
    target: 66,
    stop: 56,
    group: "holding",
    theme: "光通信/海缆",
    note: "光通信 / 海缆"
  },
  {
    code: "000725",
    name: "京东方A",
    cost: 6.77,
    target: 7.4,
    stop: 6.25,
    group: "holding",
    theme: "面板/玻璃基板",
    note: "面板 / 玻璃基板"
  },
  {
    code: "601138",
    name: "工业富联",
    cost: "",
    target: "",
    stop: "",
    group: "watch",
    theme: "AI算力/服务器",
    note: "AI服务器整柜"
  },
  {
    code: "002371",
    name: "北方华创",
    cost: "",
    target: "",
    stop: "",
    group: "watch",
    theme: "半导体设备",
    note: "半导体设备"
  },
  {
    code: "300054",
    name: "鼎龙股份",
    cost: "",
    target: "",
    stop: "",
    group: "watch",
    theme: "半导体材料",
    note: "CMP材料"
  }
];

const commonStocks = [
  { code: "000100", name: "TCL科技", theme: "面板/玻璃基板", note: "面板 / 玻璃基板", aliases: ["TCL", "TCL科技"] },
  { code: "000021", name: "深科技", theme: "HBM/存储", note: "存储封测 / 先进封装", aliases: ["深科技"] },
  { code: "000063", name: "中兴通讯", theme: "AI算力/服务器", note: "通信设备 / 算力网络", aliases: ["中兴"] },
  { code: "000725", name: "京东方A", theme: "面板/玻璃基板", note: "面板 / 玻璃基板", aliases: ["京东方", "BOE", "京东方A"] },
  { code: "000938", name: "紫光股份", theme: "AI算力/服务器", note: "服务器 / 网络设备", aliases: ["紫光"] },
  { code: "000977", name: "浪潮信息", theme: "AI算力/服务器", note: "AI服务器", aliases: ["浪潮"] },
  { code: "002130", name: "沃尔核材", theme: "光通信/海缆", note: "高速铜缆 / 通信材料", aliases: ["沃尔"] },
  { code: "002156", name: "通富微电", theme: "先进封装", note: "封测 / 先进封装", aliases: ["通富"] },
  { code: "002185", name: "华天科技", theme: "先进封装", note: "封测 / 先进封装", aliases: ["华天"] },
  { code: "002281", name: "光迅科技", theme: "光模块/CPO", note: "光器件 / 光模块", aliases: ["光迅"] },
  { code: "002371", name: "北方华创", theme: "半导体设备", note: "半导体设备", aliases: ["北方"] },
  { code: "002409", name: "雅克科技", theme: "半导体材料", note: "半导体材料 / 电子特气", aliases: ["雅克"] },
  { code: "002436", name: "兴森科技", theme: "先进封装", note: "IC载板 / 封装基板", aliases: ["兴森"] },
  { code: "002463", name: "沪电股份", theme: "AI算力/服务器", note: "AI服务器PCB", aliases: ["沪电"] },
  { code: "002549", name: "凯美特气", theme: "电子特气", note: "稀有气体 / 电子特气", aliases: ["凯美特"] },
  { code: "002654", name: "万润科技", theme: "HBM/存储", note: "存储相关 / LED", aliases: ["万润"] },
  { code: "300054", name: "鼎龙股份", theme: "半导体材料", note: "CMP材料", aliases: ["鼎龙"] },
  { code: "300308", name: "中际旭创", theme: "光模块/CPO", note: "高速光模块", aliases: ["中际", "旭创", "中际旭创"] },
  { code: "300346", name: "南大光电", theme: "半导体材料", note: "光刻胶 / 电子特气", aliases: ["南大"] },
  { code: "300373", name: "扬杰科技", theme: "功率半导体", note: "功率器件", aliases: ["扬杰"] },
  { code: "300394", name: "天孚通信", theme: "光模块/CPO", note: "光器件", aliases: ["天孚"] },
  { code: "300398", name: "飞凯材料", theme: "半导体材料", note: "电子化学品 / 光刻胶材料", aliases: ["飞凯"] },
  { code: "300475", name: "香农芯创", theme: "HBM/存储", note: "存储模组 / HBM", aliases: ["香农"] },
  { code: "300502", name: "新易盛", theme: "光模块/CPO", note: "高速光模块", aliases: ["新易盛"] },
  { code: "300570", name: "太辰光", theme: "光模块/CPO", note: "光器件", aliases: ["太辰光"] },
  { code: "300604", name: "长川科技", theme: "半导体设备", note: "测试设备", aliases: ["长川"] },
  { code: "300666", name: "江丰电子", theme: "半导体材料", note: "靶材", aliases: ["江丰"] },
  { code: "301308", name: "江波龙", theme: "HBM/存储", note: "存储模组", aliases: ["江波龙"] },
  { code: "600183", name: "生益科技", theme: "AI算力/服务器", note: "覆铜板 / AI PCB", aliases: ["生益"] },
  { code: "600378", name: "昊华科技", theme: "电子特气", note: "电子特气 / 六氟化钨", aliases: ["昊华"] },
  { code: "600460", name: "士兰微", theme: "功率半导体", note: "功率半导体 / IDM", aliases: ["士兰"] },
  { code: "600487", name: "亨通光电", theme: "光通信/海缆", note: "光通信 / 海缆", aliases: ["亨通"] },
  { code: "600498", name: "烽火通信", theme: "光通信/海缆", note: "光通信设备", aliases: ["烽火"] },
  { code: "600522", name: "中天科技", theme: "光通信/海缆", note: "光通信 / 海缆", aliases: ["中天"] },
  { code: "600584", name: "长电科技", theme: "先进封装", note: "封测 / 先进封装", aliases: ["长电"] },
  { code: "600641", name: "万业企业", theme: "半导体设备", note: "离子注入设备", aliases: ["万业"] },
  { code: "600667", name: "太极实业", theme: "HBM/存储", note: "封测 / 存储扩产", aliases: ["太极"] },
  { code: "600703", name: "三安光电", theme: "功率半导体", note: "化合物半导体 / MiniLED", aliases: ["三安"] },
  { code: "600707", name: "彩虹股份", theme: "面板/玻璃基板", note: "面板 / 玻璃基板", aliases: ["彩虹"] },
  { code: "600745", name: "闻泰科技", theme: "功率半导体", note: "功率半导体 / 半导体IDM", aliases: ["闻泰"] },
  { code: "601138", name: "工业富联", theme: "AI算力/服务器", note: "AI服务器整柜", aliases: ["工业富联", "富联", "FII"] },
  { code: "601869", name: "长飞光纤", theme: "光通信/海缆", note: "光纤光缆", aliases: ["长飞"] },
  { code: "603019", name: "中科曙光", theme: "AI算力/服务器", note: "AI服务器 / 算力", aliases: ["曙光", "中科曙光"] },
  { code: "603083", name: "剑桥科技", theme: "光模块/CPO", note: "光模块 / 通信设备", aliases: ["剑桥"] },
  { code: "603290", name: "斯达半导", theme: "功率半导体", note: "IGBT / 功率半导体", aliases: ["斯达"] },
  { code: "603690", name: "至纯科技", theme: "半导体设备", note: "清洗设备 / 高纯工艺", aliases: ["至纯"] },
  { code: "603986", name: "兆易创新", theme: "HBM/存储", note: "存储芯片 / MCU", aliases: ["兆易"] },
  { code: "605111", name: "新洁能", theme: "功率半导体", note: "功率器件", aliases: ["新洁能"] },
  { code: "605358", name: "立昂微", theme: "半导体材料", note: "硅片 / 功率半导体", aliases: ["立昂", "立微昂"] }
];

let stocks = loadStocks();
let quotes = {};
let technicals = {};
let technicalFetchedAt = {};
let radarItems = [];
let radarFetchedAt = 0;
let goldQuote = null;
let goldFetchedAt = 0;
let marketState = null;
let marketFetchedAt = 0;
let themeState = {};
let themeFetchedAt = 0;
let settings = loadSettings();
let auctionSnapshots = loadAuctionSnapshots();
let ignoredRadarCodes = loadIgnoredRadarCodes();
let reviewLogs = loadReviewLogs();
let activeFilter = "all";
let editingCode = null;
let autoRefresh = true;
let autoTimer = null;
let countdownTimer = null;
let nextRefreshAt = null;
let isRefreshing = false;

const rowsEl = document.getElementById("stockRows");
const refreshBtn = document.getElementById("refreshBtn");
const autoToggleBtn = document.getElementById("autoToggleBtn");
const addOpenBtn = document.getElementById("addOpenBtn");
const dialog = document.getElementById("stockDialog");
const closeDialogBtn = document.getElementById("closeDialogBtn");
const form = document.getElementById("stockForm");
const dialogTitle = document.getElementById("dialogTitle");
const resetSeedBtn = document.getElementById("resetSeedBtn");
const lookupHint = document.getElementById("lookupHint");
const saveStockBtn = document.getElementById("saveStockBtn");
const metricCount = document.getElementById("metricCount");
const metricAlerts = document.getElementById("metricAlerts");
const metricStrong = document.getElementById("metricStrong");
const metricRadar = document.getElementById("metricRadar");
const metricPnl = document.getElementById("metricPnl");
const metricTime = document.getElementById("metricTime");
const marketPulse = document.getElementById("marketPulse");
const versionPill = document.getElementById("versionPill");
const marketEnvPulse = document.getElementById("marketEnvPulse");
const marketStatePill = document.getElementById("marketStatePill");
const marketRows = document.getElementById("marketRows");
const goldRows = document.getElementById("goldRows");
const goldPulse = document.getElementById("goldPulse");
const goldRefreshBtn = document.getElementById("goldRefreshBtn");
const themePulse = document.getElementById("themePulse");
const themeRows = document.getElementById("themeRows");
const radarRows = document.getElementById("radarRows");
const radarPulse = document.getElementById("radarPulse");
const radarRefreshBtn = document.getElementById("radarRefreshBtn");
const radarResetIgnoredBtn = document.getElementById("radarResetIgnoredBtn");
const radarDepthHint = document.getElementById("radarDepthHint");
const themeRadarRows = document.getElementById("themeRadarRows");
const themeRadarPulse = document.getElementById("themeRadarPulse");
const auctionRows = document.getElementById("auctionRows");
const auctionPulse = document.getElementById("auctionPulse");
const auctionClearBtn = document.getElementById("auctionClearBtn");
const syncPulse = document.getElementById("syncPulse");
const syncCopyBtn = document.getElementById("syncCopyBtn");
const syncExportBtn = document.getElementById("syncExportBtn");
const syncImportInput = document.getElementById("syncImportInput");
const manualLogInput = document.getElementById("manualLogInput");
const manualLogBtn = document.getElementById("manualLogBtn");
const clearLogBtn = document.getElementById("clearLogBtn");
const disciplineRows = document.getElementById("disciplineRows");
const reviewLogRows = document.getElementById("reviewLogRows");
const reviewLogHint = document.getElementById("reviewLogHint");
const refreshSecondsInput = document.getElementById("refreshSecondsInput");
const marketCapInput = document.getElementById("marketCapInput");
const radarPagesInput = document.getElementById("radarPagesInput");
const radarLimitInput = document.getElementById("radarLimitInput");
const strongScoreInput = document.getElementById("strongScoreInput");
const requireMarketInput = document.getElementById("requireMarketInput");
const saveSettingsBtn = document.getElementById("saveSettingsBtn");
const resetSettingsBtn = document.getElementById("resetSettingsBtn");

const fields = {
  code: document.getElementById("codeInput"),
  name: document.getElementById("nameInput"),
  cost: document.getElementById("costInput"),
  target: document.getElementById("targetInput"),
  stop: document.getElementById("stopInput"),
  group: document.getElementById("groupInput"),
  theme: document.getElementById("themeInput"),
  note: document.getElementById("noteInput")
};

versionPill.textContent = APP_VERSION;
syncSettingsForm();
render();
refreshQuotes();
refreshGold(true);
refreshMarket(true);
refreshThemes(true);
refreshRadar(true);
startAutoRefresh();

refreshBtn.addEventListener("click", () => refreshQuotes());
goldRefreshBtn.addEventListener("click", () => refreshGold(true));
radarRefreshBtn.addEventListener("click", () => refreshRadar(true));
radarResetIgnoredBtn.addEventListener("click", resetIgnoredRadar);
radarRows.addEventListener("click", handleRadarClick);
auctionClearBtn.addEventListener("click", clearTodayAuction);
syncCopyBtn.addEventListener("click", copySyncText);
syncExportBtn.addEventListener("click", exportSyncFile);
syncImportInput.addEventListener("change", importSyncFile);
manualLogBtn.addEventListener("click", addManualReviewLog);
clearLogBtn.addEventListener("click", clearReviewLogs);
saveSettingsBtn.addEventListener("click", saveSettingsFromForm);
resetSettingsBtn.addEventListener("click", () => {
  settings = structuredClone(defaultSettings);
  saveSettings();
  syncSettingsForm();
  radarFetchedAt = 0;
  marketFetchedAt = 0;
  themeFetchedAt = 0;
  refreshQuotes(stocks, true);
  refreshMarket(true);
  refreshThemes(true);
  refreshRadar(true);
  restartAutoRefresh();
});
autoToggleBtn.addEventListener("click", () => {
  autoRefresh = !autoRefresh;
  autoToggleBtn.classList.toggle("auto-on", autoRefresh);
  autoToggleBtn.textContent = autoRefresh ? "自动中" : "已暂停";
  if (autoRefresh) {
    startAutoRefresh();
  } else {
    stopAutoRefresh();
    updateMetrics();
  }
});
addOpenBtn.addEventListener("click", () => openEditor());
closeDialogBtn.addEventListener("click", () => dialog.close());
fields.code.addEventListener("blur", () => fillKnownStockFromInput(fields.code.value));
fields.name.addEventListener("blur", () => {
  if (!fields.code.value.trim()) fillKnownStockFromInput(fields.name.value);
});
fields.code.addEventListener("input", () => {
  if (!fields.code.value.trim() && !fields.name.value.trim()) setLookupHint();
});
fields.name.addEventListener("input", () => {
  if (!fields.code.value.trim() && !fields.name.value.trim()) setLookupHint();
});
resetSeedBtn.addEventListener("click", () => {
  stocks = structuredClone(seedStocks);
  quotes = {};
  technicals = {};
  technicalFetchedAt = {};
  radarItems = [];
  radarFetchedAt = 0;
  ignoredRadarCodes = new Set();
  saveIgnoredRadarCodes();
  saveStocks();
  dialog.close();
  render();
  refreshQuotes();
  restartAutoRefresh();
});

document.querySelectorAll(".tab").forEach((tab) => {
  tab.addEventListener("click", () => {
    activeFilter = tab.dataset.filter;
    document.querySelectorAll(".tab").forEach((item) => item.classList.toggle("active", item === tab));
    render();
  });
});

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const submitButton = event.submitter || saveStockBtn;
  const resolved = fillKnownStockFromInput(fields.code.value || fields.name.value);

  if (!resolved || !/^\d{6}$/.test(resolved.code)) {
    setLookupHint("没有识别到股票。请输入 6 位代码，或输入常用股票名称。", "warn");
    fields.code.focus();
    return;
  }

  if (submitButton) submitButton.disabled = true;
  try {
    setLookupHint("正在拉取行情名称...", "");

    const code = resolved.code;
    const item = {
      code,
      name: fields.name.value.trim() || resolved.name || code,
      cost: toNumberOrBlank(fields.cost.value),
      target: toNumberOrBlank(fields.target.value),
      stop: toNumberOrBlank(fields.stop.value),
      group: fields.group.value,
      theme: fields.theme.value || resolved.theme || "其他",
      note: fields.note.value.trim() || resolved.note || ""
    };
    item.theme = item.theme === "其他" ? inferTheme(item.name, item.note) : item.theme;

    let quote = null;
    try {
      quote = await fetchQuote(item);
    } catch {
      quote = null;
    }
    if (quote) {
      item.name = quote.name || item.name;
      quotes[code] = quote;
    }

    if (editingCode) {
      stocks = stocks.map((stock) => (stock.code === editingCode ? item : stock));
      if (editingCode !== code) {
        delete quotes[editingCode];
        delete technicals[editingCode];
        delete technicalFetchedAt[editingCode];
      }
    } else {
      stocks = stocks.filter((stock) => stock.code !== code);
      stocks.unshift(item);
    }

    saveStocks();
    dialog.close();
    render();
    refreshQuotes([item], true);
    restartAutoRefresh();
  } finally {
    if (submitButton) submitButton.disabled = false;
  }
});

rowsEl.addEventListener("click", (event) => {
  const button = event.target.closest("button");
  if (!button) return;
  const code = button.dataset.code;
  if (button.dataset.action === "edit") {
    const item = stocks.find((stock) => stock.code === code);
    if (item) openEditor(normalizeStock(item));
  }
  if (button.dataset.action === "delete") {
    stocks = stocks.filter((stock) => stock.code !== code);
    delete quotes[code];
    delete technicals[code];
    delete technicalFetchedAt[code];
    saveStocks();
    render();
    restartAutoRefresh();
  }
});

function handleRadarClick(event) {
  const button = event.target.closest("button");
  if (!button) return;

  const code = button.dataset.code;
  const action = button.dataset.action;
  const item = radarItems.find((radarItem) => radarItem.code === code);
  if (!item) return;

  if (action === "radar-add-watch" || action === "radar-add-holding") {
    addRadarItemToWatch(item, action === "radar-add-holding" ? "holding" : "watch");
  }
  if (action === "radar-ignore") {
    ignoredRadarCodes.add(code);
    saveIgnoredRadarCodes();
    radarItems = radarItems.filter((radarItem) => radarItem.code !== code);
    renderRadar();
    renderThemeRadar();
    updateMetrics();
  }
}

function addRadarItemToWatch(item, group = "watch") {
  const exists = stocks.some((stock) => stock.code === item.code);
  const next = {
    code: item.code,
    name: item.name,
    cost: "",
    target: "",
    stop: "",
    group,
    theme: item.radarTheme || inferThemeFromText(`${item.name} ${item.sector}`),
    note: `${item.sector || "雷达异动"} / ${item.tag}`
  };

  stocks = exists
    ? stocks.map((stock) => {
        if (stock.code !== item.code) return stock;
        const normalized = normalizeStock(stock);
        return {
          ...normalized,
          name: normalized.name || item.name,
          group: group === "holding" ? "holding" : normalized.group,
          theme: normalized.theme === "其他" ? next.theme : normalized.theme,
          note: normalized.note || next.note
        };
      })
    : [next, ...stocks];

  saveStocks();
  render();
  refreshQuotes([next], true);
  restartAutoRefresh();
}

function resetIgnoredRadar() {
  ignoredRadarCodes = new Set();
  saveIgnoredRadarCodes();
  radarFetchedAt = 0;
  refreshRadar(true);
}

document.addEventListener("visibilitychange", () => {
  if (autoRefresh) restartAutoRefresh();
});

function loadStocks() {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return Array.isArray(stored) && stored.length ? stored : structuredClone(seedStocks);
  } catch {
    return structuredClone(seedStocks);
  }
}

function loadSettings() {
  try {
    const stored = JSON.parse(localStorage.getItem(CONFIG_STORAGE_KEY));
    return { ...defaultSettings, ...(stored || {}) };
  } catch {
    return structuredClone(defaultSettings);
  }
}

function loadAuctionSnapshots() {
  try {
    const stored = JSON.parse(localStorage.getItem(AUCTION_STORAGE_KEY));
    return stored && typeof stored === "object" ? stored : {};
  } catch {
    return {};
  }
}

function loadIgnoredRadarCodes() {
  try {
    const stored = JSON.parse(localStorage.getItem(IGNORED_RADAR_STORAGE_KEY));
    return new Set(Array.isArray(stored) ? stored.map(String) : []);
  } catch {
    return new Set();
  }
}

function loadReviewLogs() {
  try {
    const stored = JSON.parse(localStorage.getItem(REVIEW_LOG_STORAGE_KEY));
    return Array.isArray(stored) ? stored.slice(0, 160) : [];
  } catch {
    return [];
  }
}

function saveStocks() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(stocks));
}

function saveSettings() {
  localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(settings));
}

function saveAuctionSnapshots() {
  localStorage.setItem(AUCTION_STORAGE_KEY, JSON.stringify(auctionSnapshots));
}

function saveIgnoredRadarCodes() {
  localStorage.setItem(IGNORED_RADAR_STORAGE_KEY, JSON.stringify([...ignoredRadarCodes]));
}

function saveReviewLogs() {
  localStorage.setItem(REVIEW_LOG_STORAGE_KEY, JSON.stringify(reviewLogs.slice(0, 160)));
}

function syncSettingsForm() {
  refreshSecondsInput.value = settings.refreshSeconds;
  marketCapInput.value = settings.minMarketCapYi;
  radarPagesInput.value = settings.radarPages;
  radarLimitInput.value = settings.radarLimit;
  strongScoreInput.value = settings.strongScore;
  requireMarketInput.checked = Boolean(settings.requireMarketConfirm);
  updateRadarDepthHint();
}

function saveSettingsFromForm() {
  settings = {
    refreshSeconds: clamp(Number(refreshSecondsInput.value) || defaultSettings.refreshSeconds, 30, 300),
    minMarketCapYi: clamp(Number(marketCapInput.value) || defaultSettings.minMarketCapYi, 100, 2000),
    radarPages: clamp(Number(radarPagesInput.value) || defaultSettings.radarPages, 1, 8),
    radarLimit: clamp(Number(radarLimitInput.value) || defaultSettings.radarLimit, 9, 60),
    strongScore: clamp(Number(strongScoreInput.value) || defaultSettings.strongScore, 50, 95),
    requireMarketConfirm: Boolean(requireMarketInput.checked)
  };
  saveSettings();
  syncSettingsForm();
  radarFetchedAt = 0;
  marketFetchedAt = 0;
  themeFetchedAt = 0;
  refreshQuotes(stocks, true);
  refreshMarket(true);
  refreshThemes(true);
  refreshRadar(true);
  restartAutoRefresh();
}

function setLookupHint(message = "输入代码会自动补名称；输入名称会先匹配常用股票。", tone = "") {
  if (!lookupHint) return;
  lookupHint.textContent = message;
  lookupHint.classList.toggle("ok", tone === "ok");
  lookupHint.classList.toggle("warn", tone === "warn");
}

function fillKnownStockFromInput(value) {
  const raw = String(value || fields.code.value || fields.name.value || "").trim();
  if (!raw) {
    setLookupHint();
    return null;
  }

  const resolved = resolveStockInput(raw, fields.name.value);
  if (!resolved) {
    setLookupHint("没有匹配到。可以直接输入 6 位代码，保存时会自动拉行情名称。", "warn");
    return null;
  }

  const previousName = fields.name.value.trim();
  const inputWasName = previousName && normalizeLookupText(previousName) === normalizeLookupText(raw);
  fields.code.value = resolved.code;
  if (!previousName || inputWasName || previousName === raw) fields.name.value = resolved.name || "";
  if ((!fields.theme.value || fields.theme.value === "其他") && resolved.theme) fields.theme.value = resolved.theme;
  if (!fields.note.value.trim() && resolved.note) fields.note.value = resolved.note;

  const boardNotice = getBoardNotice(resolved.code);
  const label = resolved.name ? `${resolved.name} ${resolved.code}` : resolved.code;
  const baseMessage = resolved.name ? `已识别 ${label}` : `已识别代码 ${label}，保存时会尝试补名称`;
  setLookupHint(boardNotice ? `${baseMessage}。${boardNotice}` : baseMessage, boardNotice ? "warn" : "ok");
  return resolved;
}

function resolveStockInput(primary, fallback = "") {
  const raw = String(primary || fallback || "").trim();
  if (!raw) return null;

  const digits = raw.replace(/\D/g, "");
  const directory = getStockDirectory();
  if (digits.length === 6) {
    return directory.find((item) => item.code === digits) || {
      code: digits,
      name: "",
      theme: "其他",
      note: "",
      aliases: []
    };
  }

  const key = normalizeLookupText(raw);
  if (!key) return null;

  const exact = directory.find((item) =>
    getLookupTerms(item).some((term) => normalizeLookupText(term) === key)
  );
  if (exact) return exact;

  if (key.length < 2) return null;
  return directory.find((item) =>
    getLookupTerms(item).some((term) => {
      const normalized = normalizeLookupText(term);
      return normalized && (normalized.includes(key) || key.includes(normalized));
    })
  ) || null;
}

function getStockDirectory() {
  const directory = new Map();
  [...seedStocks, ...commonStocks, ...stocks].forEach((stock) => {
    const code = String(stock.code || "").trim();
    if (!/^\d{6}$/.test(code)) return;

    const current = directory.get(code);
    const name = stock.name || current?.name || code;
    const note = stock.note || current?.note || "";
    const theme = stock.theme && stock.theme !== "其他"
      ? stock.theme
      : current?.theme || inferTheme(name, note);
    const aliases = [...new Set([...(current?.aliases || []), name, ...(stock.aliases || [])].filter(Boolean))];
    directory.set(code, { code, name, theme, note, aliases });
  });
  return [...directory.values()];
}

function getLookupTerms(item) {
  return [item.code, item.name, ...(item.aliases || [])].filter(Boolean);
}

function normalizeLookupText(value) {
  return String(value || "")
    .normalize("NFKC")
    .trim()
    .toUpperCase()
    .replace(/\s+/g, "")
    .replace(/[()（）]/g, "");
}

function getBoardNotice(code) {
  if (code.startsWith("688") || code.startsWith("689")) return "这是科创板，账户不能买时只做观察。";
  if (code.startsWith("300") || code.startsWith("301")) return "这是创业板，买入前确认权限和波动风险。";
  if (code.startsWith("4") || code.startsWith("8")) return "这可能是北交所，流动性和权限都要单独确认。";
  return "";
}

function openEditor(item) {
  const normalized = item ? normalizeStock(item) : null;
  editingCode = normalized?.code || null;
  dialogTitle.textContent = editingCode ? "编辑自选" : "新增自选";
  fields.code.value = normalized?.code || "";
  fields.name.value = normalized?.name || "";
  fields.cost.value = normalized?.cost || "";
  fields.target.value = normalized?.target || "";
  fields.stop.value = normalized?.stop || "";
  fields.group.value = normalized?.group || "holding";
  fields.theme.value = normalized?.theme || "其他";
  fields.note.value = normalized?.note || "";
  setLookupHint();
  dialog.showModal();
  fields.code.focus();
}

function render() {
  const visible = stocks.map(normalizeStock).filter((stock) => {
    const analysis = analyzeStock(stock, quotes[stock.code], technicals[stock.code]);
    if (activeFilter === "all") return true;
    if (activeFilter === "alert") return analysis.risk.level !== "ok" || analysis.action.level === "warn" || analysis.point.side === "卖点";
    return stock.group === activeFilter;
  });

  if (!visible.length) {
    rowsEl.innerHTML = `<div class="empty">暂无自选</div>`;
  } else {
    rowsEl.innerHTML = visible.map(renderRow).join("");
  }

  updateMetrics();
  renderMarket();
  renderGold();
  renderThemes();
  renderRadar();
  renderThemeRadar();
  renderAuction();
  renderReviewModule();
}

function renderRow(stock) {
  const quote = quotes[stock.code];
  const technical = technicals[stock.code];
  const analysis = analyzeStock(stock, quote, technical);
  const price = quote?.price;
  const changeClass = quote ? getChangeClass(quote.changePercent) : "flat";
  const cost = Number(stock.cost);
  const pnl = price && cost ? (price / cost - 1) * 100 : null;
  const pnlClass = pnl === null ? "flat" : getChangeClass(pnl);
  const costText = cost ? `成本 ${formatMoney(cost)}` : "未设成本";
  const targetText = stock.target ? `目标 ${formatMoney(stock.target)}` : "未设目标";
  const stopText = stock.stop ? `止损 ${formatMoney(stock.stop)}` : "未设止损";
  const discipline = getDiscipline(analysis);
  const klineStatus = getKlineStatus(quote, technical);
  const buyGate = getBuyGate(stock, quote, technical, analysis);
  const dataQuality = analysis.dataQuality;
  const tradeBrief = getTradeBrief(stock, quote, technical, analysis, buyGate);

  return `
    <article class="watch-card">
      <div class="watch-card-main">
        <div class="watch-title">
          <div>
            <strong>${escapeHtml(stock.name)}</strong>
            <span>${marketPrefix(stock.code).toUpperCase()}${stock.code} · ${groupName(stock.group)}</span>
          </div>
          <div class="watch-price">
            <strong>${price ? formatMoney(price) : "--"}</strong>
            <span class="${changeClass}">${quote ? `${signed(quote.changePercent)}%` : "--"}</span>
          </div>
        </div>

        <div class="watch-meta-row">
          <span class="badge info">${escapeHtml(stock.theme)}</span>
          <span>${analysis.themeDetail}</span>
          ${stock.note ? `<span class="watch-note">${escapeHtml(stock.note)}</span>` : ""}
        </div>

        <div class="watch-kpis">
          <div>
            <span>成本盈亏</span>
            <strong class="${pnlClass}">${pnl === null ? "--" : `${signed(pnl)}%`}</strong>
            <small>${costText}</small>
          </div>
          <div>
            <span>趋势</span>
            <strong>${analysis.trend.label}</strong>
            <small>${analysis.trend.detail}</small>
          </div>
          <div>
            <span>量能</span>
            <strong>${analysis.volume.label}</strong>
            <small>${analysis.volume.detail}</small>
          </div>
          <div>
            <span>买卖点</span>
            <strong>${analysis.point.label}</strong>
            <small>${analysis.point.side}</small>
          </div>
          <div>
            <span>风控</span>
            <strong>${analysis.risk.label}</strong>
            <small>${analysis.risk.detail}</small>
          </div>
          <div>
            <span>数据可信</span>
            <strong class="data-quality-text ${dataQuality.level}">${dataQuality.label}</strong>
            <small>${dataQuality.detail}</small>
          </div>
        </div>

        <div class="kline-diagnostic ${klineStatus.level}">
          <div>
            <strong>K线 ${klineStatus.label}</strong>
            <span>${klineStatus.detail}</span>
          </div>
          <div class="buy-gap-list">
            <span class="buy-gate ${buyGate.level}">${buyGate.label}</span>
            ${buyGate.gaps.map((gap) => `<span>${escapeHtml(gap)}</span>`).join("")}
          </div>
        </div>

        <div class="trade-brief ${tradeBrief.level}">
          <div>
            <strong>为什么盯</strong>
            <span>${escapeHtml(tradeBrief.watch)}</span>
          </div>
          <div>
            <strong>什么条件买</strong>
            <span>${escapeHtml(tradeBrief.buy)}</span>
          </div>
          <div>
            <strong>错了哪里卖</strong>
            <span>${escapeHtml(tradeBrief.sell)}</span>
          </div>
        </div>

        <div class="watch-foot">
          <span>${targetText} · ${stopText}</span>
          <div class="watch-foot-tags">
            <span class="discipline-tag ${discipline.level}">${discipline.label}</span>
            <span class="badge ${analysis.point.level}">${analysis.point.side}</span>
          </div>
        </div>
      </div>

      <div class="watch-card-side">
        <div class="watch-score">
          <span class="score-pill ${analysis.scoreClass}">${analysis.score}</span>
          <span class="badge ${analysis.action.level}">${analysis.action.label}</span>
        </div>
        <div class="row-actions">
          <button class="mini-button" data-action="edit" data-code="${stock.code}">编辑</button>
          <button class="mini-button" data-action="delete" data-code="${stock.code}">删除</button>
        </div>
      </div>
    </article>
  `;
}

function renderReviewModule() {
  if (!syncPulse || !disciplineRows || !reviewLogRows) return;
  const latest = reviewLogs[0]?.at ? ` · 最近 ${formatShortDateTime(new Date(reviewLogs[0].at))}` : "";
  syncPulse.textContent = `${stocks.length}只自选 · ${reviewLogs.length}条复盘日志${latest}`;
  if (reviewLogHint) reviewLogHint.textContent = reviewLogs.length ? "最新日志在前，最多保留160条" : "自动记录强信号、卖点和数据异常";

  const disciplineItems = stocks
    .map(normalizeStock)
    .map((stock) => {
      const analysis = analyzeStock(stock, quotes[stock.code], technicals[stock.code]);
      const buyGate = getBuyGate(stock, quotes[stock.code], technicals[stock.code], analysis);
      const brief = getTradeBrief(stock, quotes[stock.code], technicals[stock.code], analysis, buyGate);
      return { stock, analysis, brief };
    })
    .sort((a, b) => getDisciplinePriority(b.analysis) - getDisciplinePriority(a.analysis))
    .slice(0, 6);

  disciplineRows.innerHTML = disciplineItems.length
    ? disciplineItems.map(({ stock, analysis, brief }) => `
        <article class="discipline-row ${brief.level}">
          <div>
            <strong>${escapeHtml(stock.name)}</strong>
            <span>${stock.code} · ${escapeHtml(analysis.action.label)} · ${analysis.score}分</span>
          </div>
          <p>${escapeHtml(brief.buy)}</p>
        </article>
      `).join("")
    : `<div class="empty compact">暂无自选纪律</div>`;

  reviewLogRows.innerHTML = reviewLogs.length
    ? reviewLogs.slice(0, 12).map((log) => `
        <article class="review-log-item ${log.level || "note"}">
          <div class="review-log-head">
            <strong>${escapeHtml(log.title || "复盘记录")}</strong>
            <span>${formatShortDateTime(new Date(log.at))} · ${escapeHtml(log.source || "系统")}</span>
          </div>
          <p>${escapeHtml(log.message || "")}</p>
        </article>
      `).join("")
    : `<div class="empty compact">还没有复盘日志。行情刷新后出现强信号、卖点、数据异常会自动记录；也可以手动写入。</div>`;
}

function getDisciplinePriority(analysis) {
  if (analysis.point.side === "卖点" || analysis.risk.label === "到止损") return 6;
  if (analysis.point.side === "买点") return 5;
  if (analysis.score >= settings.strongScore) return 4;
  if (analysis.score >= 70 || analysis.point.side === "观察") return 3;
  if (analysis.dataQuality?.blockBuy) return 2;
  return 1;
}

function captureAutoReviewEvents(list = stocks) {
  list.map(normalizeStock).forEach((stock) => {
    const quote = quotes[stock.code];
    const technical = technicals[stock.code];
    const analysis = analyzeStock(stock, quote, technical);
    const buyGate = getBuyGate(stock, quote, technical, analysis);
    const brief = getTradeBrief(stock, quote, technical, analysis, buyGate);
    const priceText = quote?.price ? `现价${formatMoney(quote.price)}，涨跌${signed(quote.changePercent)}%` : "价格待更新";
    let log = null;

    if (analysis.point.side === "卖点" || analysis.risk.label === "到止损" || analysis.volume.danger) {
      log = {
        level: "sell",
        type: "sell",
        title: `${stock.name} 触发卖点/风控`,
        message: `${priceText}。${brief.sell}`,
        key: `${localDateKey()}-${stock.code}-sell-${analysis.point.label}-${analysis.risk.label}-${analysis.volume.label}`
      };
    } else if (analysis.point.side === "买点") {
      log = {
        level: "buy",
        type: "buy",
        title: `${stock.name} 出现严格买点`,
        message: `${priceText}。${brief.buy}。为什么盯：${brief.watch}`,
        key: `${localDateKey()}-${stock.code}-buy-${analysis.point.label}`
      };
    } else if (analysis.score >= settings.strongScore && analysis.action.level === "hot") {
      log = {
        level: "watch",
        type: "watch",
        title: `${stock.name} 强观察`,
        message: `${priceText}。为什么盯：${brief.watch}。买点缺口：${buyGate.gaps.join("、")}`,
        key: `${localDateKey()}-${stock.code}-strong-watch-${analysis.action.label}`
      };
    } else if (analysis.dataQuality?.blockBuy && quote) {
      log = {
        level: "warn",
        type: "data",
        title: `${stock.name} 数据需核验`,
        message: `${analysis.dataQuality.detail}。暂不把信号当买点。`,
        key: `${localDateKey()}-${stock.code}-data-${analysis.dataQuality.detail}`
      };
    }

    if (log) addReviewLog({ ...log, code: stock.code, source: "系统" });
  });
}

function addReviewLog(entry, options = {}) {
  const at = entry.at || new Date().toISOString();
  const key = entry.key || `${localDateKey(new Date(at))}-${entry.type || "note"}-${entry.code || "all"}-${entry.title || entry.message}`;
  if (options.dedupe !== false && reviewLogs.some((log) => log.key === key)) return false;

  reviewLogs = [{
    id: entry.id || makeId(),
    at,
    key,
    code: entry.code || "",
    level: entry.level || "note",
    type: entry.type || "note",
    source: entry.source || "系统",
    title: entry.title || "复盘记录",
    message: entry.message || ""
  }, ...reviewLogs].slice(0, 160);
  saveReviewLogs();
  renderReviewModule();
  return true;
}

function addManualReviewLog() {
  const message = manualLogInput.value.trim();
  if (!message) {
    manualLogInput.focus();
    return;
  }
  addReviewLog({
    level: "note",
    type: "manual",
    source: "手动",
    title: "手动复盘",
    message
  }, { dedupe: false });
  manualLogInput.value = "";
  syncPulse.textContent = "手动复盘已写入";
}

function clearReviewLogs() {
  if (!window.confirm("确认清空所有复盘日志？自选股不会删除。")) return;
  reviewLogs = [];
  saveReviewLogs();
  renderReviewModule();
  syncPulse.textContent = "复盘日志已清空";
}

async function copySyncText() {
  const text = buildSyncText();
  const copied = await writeTextToClipboard(text);
  addReviewLog({
    level: "note",
    type: "sync",
    source: "同步",
    title: "复制自选同步文本",
    message: `已生成${stocks.length}只自选和${reviewLogs.length}条日志摘要`
  }, { dedupe: false });
  syncPulse.textContent = copied ? "自选同步文本已复制，可以直接发给 Codex 做早晚总结" : "复制失败，浏览器不允许写剪贴板";
}

function exportSyncFile() {
  const snapshot = buildSyncSnapshot();
  const blob = new Blob([JSON.stringify(snapshot, null, 2)], { type: "application/json;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `stock-watch-sync-${localDateKey()}.json`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  addReviewLog({
    level: "note",
    type: "sync",
    source: "同步",
    title: "下载自选备份",
    message: `导出${stocks.length}只自选、${reviewLogs.length}条复盘日志`
  }, { dedupe: false });
  syncPulse.textContent = "备份文件已下载";
}

function importSyncFile(event) {
  const file = event.target.files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const snapshot = JSON.parse(String(reader.result || "{}"));
      applySyncSnapshot(snapshot);
      syncPulse.textContent = `已导入备份：${stocks.length}只自选 · ${reviewLogs.length}条日志`;
    } catch {
      syncPulse.textContent = "导入失败：文件格式不对";
    } finally {
      event.target.value = "";
    }
  };
  reader.readAsText(file, "utf-8");
}

function applySyncSnapshot(snapshot) {
  const nextStocks = Array.isArray(snapshot.stocks) ? snapshot.stocks.map(normalizeStock).filter((stock) => /^\d{6}$/.test(stock.code)) : [];
  if (nextStocks.length) {
    stocks = nextStocks;
    saveStocks();
  }
  if (snapshot.settings && typeof snapshot.settings === "object") {
    settings = { ...defaultSettings, ...snapshot.settings };
    saveSettings();
    syncSettingsForm();
  }
  if (Array.isArray(snapshot.reviewLogs)) {
    reviewLogs = snapshot.reviewLogs.slice(0, 160);
    saveReviewLogs();
  }
  addReviewLog({
    level: "note",
    type: "sync",
    source: "同步",
    title: "导入自选备份",
    message: `导入后当前自选${stocks.length}只，日志${reviewLogs.length}条`
  }, { dedupe: false });
  render();
  refreshQuotes(stocks, true);
  restartAutoRefresh();
}

function buildSyncSnapshot() {
  return {
    app: "stock-watch-app",
    version: APP_VERSION,
    exportedAt: new Date().toISOString(),
    stocks: stocks.map(normalizeStock),
    settings,
    reviewLogs: reviewLogs.slice(0, 80)
  };
}

function buildSyncText() {
  const rows = stocks.map(normalizeStock).map((stock) => {
    const quote = quotes[stock.code];
    const analysis = analyzeStock(stock, quote, technicals[stock.code]);
    const buyGate = getBuyGate(stock, quote, technicals[stock.code], analysis);
    const brief = getTradeBrief(stock, quote, technicals[stock.code], analysis, buyGate);
    const price = quote?.price ? `${formatMoney(quote.price)} ${signed(quote.changePercent)}%` : "待行情";
    return `${stock.name} ${stock.code}｜${groupName(stock.group)}｜${stock.theme}｜${price}｜${analysis.action.label}/${analysis.score}分｜盯:${brief.watch}｜买:${brief.buy}｜卖:${brief.sell}`;
  });
  const logs = reviewLogs.slice(0, 8).map((log) => `${formatShortDateTime(new Date(log.at))}｜${log.title}｜${log.message}`);
  return [
    `自选同步 ${APP_VERSION} ${formatShortDateTime(new Date())}`,
    "【自选】",
    rows.join("\n") || "暂无自选",
    "【最近复盘】",
    logs.join("\n") || "暂无日志"
  ].join("\n");
}

async function writeTextToClipboard(text) {
  try {
    if (globalThis.navigator?.clipboard?.writeText) {
      await globalThis.navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // Fall through to the legacy clipboard path.
  }

  try {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.setAttribute("readonly", "");
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.select();
    const copied = document.execCommand("copy");
    textarea.remove();
    return copied;
  } catch {
    return false;
  }
}

function updateMetrics() {
  const normalized = stocks.map(normalizeStock);
  const analyses = normalized.map((stock) => analyzeStock(stock, quotes[stock.code], technicals[stock.code]));
  const riskCount = analyses.filter((item) => item.risk.level !== "ok" || item.action.level === "warn" || item.point.side === "卖点").length;
  const strongCount = analyses.filter((item) => item.point.side === "买点" || (item.score >= settings.strongScore && item.action.level !== "warn")).length;
  const pnls = normalized
    .map((stock) => {
      const quote = quotes[stock.code];
      return quote?.price && Number(stock.cost) ? (quote.price / Number(stock.cost) - 1) * 100 : null;
    })
    .filter((value) => value !== null);

  metricCount.textContent = String(stocks.length);
  metricAlerts.textContent = String(riskCount);
  metricStrong.textContent = String(strongCount);
  metricRadar.textContent = String(radarItems.length);
  metricPnl.textContent = pnls.length ? `${signed(avg(pnls))}%` : "--";

  const loaded = Object.keys(quotes).length;
  const techLoaded = Object.keys(technicals).length;
  const autoText = getAutoText();
  marketPulse.textContent = loaded
    ? `行情 ${loaded}/${stocks.length} · K线 ${techLoaded}/${stocks.length} · ${autoText}`
    : `等待行情刷新 · ${autoText}`;
}

async function refreshQuotes(list = stocks, forceTechnical = false) {
  if (isRefreshing) return;
  isRefreshing = true;
  refreshBtn.disabled = true;
  refreshBtn.textContent = "…";
  const unique = [...new Map(list.map((stock) => [stock.code, normalizeStock(stock)])).values()];

  const quoteResults = await Promise.allSettled(unique.map(fetchQuote));
  quoteResults.forEach((result) => {
    if (result.status === "fulfilled" && result.value) {
      quotes[result.value.code] = result.value;
    }
  });
  captureAuctionSnapshots(unique);

  const techList = unique.filter((stock) => forceTechnical || shouldFetchTechnical(stock.code));
  const techResults = await Promise.allSettled(techList.map(fetchTechnical));
  techResults.forEach((result) => {
    if (result.status === "fulfilled" && result.value) {
      technicals[result.value.code] = result.value;
      technicalFetchedAt[result.value.code] = Date.now();
    }
  });

  const now = new Date();
  metricTime.textContent = now.toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" });
  if (shouldFetchMarket()) {
    await refreshMarket();
  }
  await refreshGold();
  if (shouldFetchThemes()) {
    await refreshThemes();
  }
  if (shouldFetchRadar()) {
    await refreshRadar();
  }
  captureAutoReviewEvents(unique);
  refreshBtn.disabled = false;
  refreshBtn.textContent = "↻";
  isRefreshing = false;
  render();
}

function shouldFetchTechnical(code) {
  return !technicalFetchedAt[code] || Date.now() - technicalFetchedAt[code] > TECH_REFRESH_MS;
}

function shouldFetchRadar() {
  return !radarFetchedAt || Date.now() - radarFetchedAt > settings.refreshSeconds * 1000;
}

function shouldFetchMarket() {
  return !marketFetchedAt || Date.now() - marketFetchedAt > MARKET_REFRESH_MS;
}

function shouldFetchThemes() {
  return !themeFetchedAt || Date.now() - themeFetchedAt > THEME_REFRESH_MS;
}

async function refreshMarket(force = false) {
  if (!force && !shouldFetchMarket()) return;
  const results = await Promise.allSettled(marketIndexes.map(fetchIndexQuote));
  const indexes = results
    .filter((result) => result.status === "fulfilled" && result.value)
    .map((result) => result.value);

  const avgChange = indexes.length ? avg(indexes.map((item) => item.changePercent)) : 0;
  const upCount = indexes.filter((item) => item.changePercent > 0).length;
  let level = "neutral";
  let label = "震荡";
  if (avgChange >= 0.8 && upCount >= 2) {
    level = "hot";
    label = "顺风";
  } else if (avgChange <= -0.8 && upCount === 0) {
    level = "weak";
    label = "逆风";
  } else if (avgChange >= 0 && upCount >= 2) {
    level = "ok";
    label = "可做";
  }

  marketState = { indexes, avgChange, upCount, level, label, updatedAt: Date.now() };
  marketFetchedAt = Date.now();
  renderMarket();
}

function renderMarket() {
  if (!marketRows || !marketState) {
    marketRows.innerHTML = `<div class="empty">等待指数刷新</div>`;
    return;
  }

  marketStatePill.textContent = marketState.label;
  marketStatePill.className = `state-pill ${marketState.level === "hot" ? "hot" : marketState.level === "weak" ? "warn" : "ok"}`;
  marketEnvPulse.textContent = `平均涨跌 ${signed(marketState.avgChange)}% · ${marketState.upCount}/3 指数上涨`;
  marketRows.innerHTML = marketState.indexes.map((item) => `
    <div class="market-tile">
      <span>${item.name}</span>
      <strong>${formatMoney(item.price)}</strong>
      <span class="${getChangeClass(item.changePercent)}">${signed(item.changePercent)}%</span>
    </div>
  `).join("");
}

async function refreshGold(force = false) {
  if (!force && goldFetchedAt && Date.now() - goldFetchedAt < settings.refreshSeconds * 1000) return;
  if (goldRefreshBtn) {
    goldRefreshBtn.disabled = true;
    goldRefreshBtn.textContent = "刷新中";
  }
  if (goldPulse) goldPulse.textContent = "正在刷新伦敦金现货";

  const quote = await fetchGoldQuote();

  goldQuote = quote || {
    name: "黄金",
    source: "行情源",
    price: null,
    quality: { level: "bad", label: "数据不足", detail: "金价接口未返回" }
  };
  goldFetchedAt = Date.now();

  if (goldRefreshBtn) {
    goldRefreshBtn.disabled = false;
    goldRefreshBtn.textContent = "刷新金价";
  }
  renderGold();
}

function renderGold() {
  if (!goldRows) return;
  if (!goldQuote) {
    goldRows.innerHTML = `<div class="empty">等待金价刷新</div>`;
    return;
  }

  const quality = goldQuote.quality || { level: "warn", label: "需核验", detail: "等待数据" };
  const changeClass = getChangeClass(goldQuote.changePercent || 0);
  const updatedText = goldQuote.marketTime ? formatShortDateTime(goldQuote.marketTime) : "--";
  goldPulse.textContent = goldQuote.price
    ? `${goldQuote.name} · ${quality.label} · ${updatedText}`
    : `金价数据不足 · ${quality.detail}`;

  goldRows.innerHTML = `
    <article class="gold-card">
      <div class="gold-main">
        <div>
          <strong>${goldQuote.price ? formatGoldPrice(goldQuote.price) : "--"}</strong>
          <span>美元/盎司</span>
        </div>
        <div class="gold-change ${changeClass}">
          <strong>${Number.isFinite(goldQuote.change) ? signed(goldQuote.change) : "--"}</strong>
          <span>${Number.isFinite(goldQuote.changePercent) ? `${signed(goldQuote.changePercent)}%` : "--"}</span>
        </div>
      </div>
      <div class="gold-meta">
        <span>${goldQuote.name || "黄金"}</span>
        <span>高 ${formatGoldPrice(goldQuote.high)} / 低 ${formatGoldPrice(goldQuote.low)}</span>
        <span>${goldQuote.source || "行情源"} · ${updatedText}</span>
        <span class="gold-quality ${quality.level}">${quality.label}：${quality.detail}</span>
      </div>
    </article>
  `;
}

async function refreshThemes(force = false) {
  if (!force && !shouldFetchThemes()) return;
  const boards = await fetchThemeBoards();
  const nextState = {};

  Object.keys(themeStrength).forEach((theme) => {
    if (theme === "其他") {
      nextState[theme] = { strength: 2, change: 0, board: "其他", source: "默认" };
      return;
    }
    const keywords = themeKeywords[theme] || [];
    const matched = boards.filter((board) => keywords.some((keyword) => board.name.includes(keyword)));
    const best = matched.sort((a, b) => b.score - a.score)[0];
    const base = themeStrength[theme] || 2;
    if (!best) {
      nextState[theme] = { strength: base, change: 0, board: "未匹配", source: "默认" };
      return;
    }
    nextState[theme] = {
      strength: boardToStrength(best, base),
      change: best.changePercent,
      board: best.name,
      source: "动态",
      amountYi: best.amountYi,
      mainInflowYi: best.mainInflowYi
    };
  });

  themeState = nextState;
  themeFetchedAt = Date.now();
  renderThemes();
}

function renderThemes() {
  if (!themeRows) return;
  const entries = Object.keys(themeStrength)
    .filter((theme) => theme !== "其他")
    .map((theme) => ({ theme, ...(themeState[theme] || { strength: themeStrength[theme], change: 0, board: "等待刷新", source: "默认" }) }))
    .sort((a, b) => b.strength - a.strength || b.change - a.change)
    .slice(0, 8);

  if (!entries.length) {
    themeRows.innerHTML = `<div class="empty">等待主线刷新</div>`;
    return;
  }

  const updated = themeFetchedAt ? new Date(themeFetchedAt).toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" }) : "--";
  themePulse.textContent = `动态主线强度 · ${updated}`;
  themeRows.innerHTML = entries.map((item) => {
    const cls = item.strength >= 5 ? "hot" : item.strength >= 4 ? "ok" : "wait";
    const width = clamp(item.strength * 20, 12, 100);
    return `
      <div class="theme-row ${cls}">
        <strong>${escapeHtml(item.theme)}</strong>
        <div class="strength-bar"><i style="width:${width}%"></i></div>
        <span>${item.strength}/5 · ${signed(item.change)}%</span>
      </div>
    `;
  }).join("");
}

function fetchIndexQuote(index) {
  const varName = `v_${index.symbol}`;
  return new Promise((resolve) => {
    const oldScript = document.getElementById(`jsonp-${index.symbol}`);
    if (oldScript) oldScript.remove();
    window[varName] = undefined;

    const script = document.createElement("script");
    let settled = false;
    const timer = window.setTimeout(() => finish(null), JSONP_TIMEOUT);
    script.id = `jsonp-${index.symbol}`;
    script.charset = "gbk";
    script.src = `http://qt.gtimg.cn/q=${index.symbol}&_=${Date.now()}`;
    script.async = true;
    script.onload = () => {
      const raw = window[varName];
      if (!raw) return finish(null);
      const parts = String(raw).split("~");
      finish({
        name: index.name,
        symbol: index.symbol,
        price: Number(parts[3]) || 0,
        change: Number(parts[31]) || 0,
        changePercent: Number(parts[32]) || 0
      });
    };
    script.onerror = () => finish(null);

    function finish(value) {
      if (settled) return;
      settled = true;
      window.clearTimeout(timer);
      script.remove();
      resolve(value);
    }

    document.head.appendChild(script);
  });
}

function fetchSinaGoldQuote(source) {
  const varName = `hq_str_${source.symbol}`;

  return new Promise((resolve) => {
    const oldScript = document.getElementById(`jsonp-gold-${source.symbol}`);
    if (oldScript) oldScript.remove();
    window[varName] = undefined;

    const script = document.createElement("script");
    script.id = `jsonp-gold-${source.symbol}`;
    script.charset = "gbk";
    script.src = `http://hq.sinajs.cn/list=${source.symbol}&_=${Date.now()}`;
    script.async = true;

    const timer = window.setTimeout(() => {
      cleanup();
      resolve(null);
    }, JSONP_TIMEOUT);

    script.onload = () => {
      const raw = window[varName];
      cleanup();
      resolve(parseSinaGoldQuote(source, raw));
    };

    script.onerror = () => {
      cleanup();
      resolve(null);
    };

    function cleanup() {
      window.clearTimeout(timer);
      script.remove();
    }

    document.head.appendChild(script);
  });
}

function parseSinaGoldQuote(source, raw) {
  if (!raw) return null;
  const parts = String(raw).split(",");
  const price = Number(parts[0]);
  const previousClose = Number(parts[1]) || Number(parts[7]) || null;
  if (!Number.isFinite(price) || price <= 0) return null;

  const change = previousClose ? price - previousClose : null;
  const changePercent = previousClose ? (change / previousClose) * 100 : null;
  const date = parts[12] || "";
  const time = parts[6] || "";
  const marketTime = parseSinaGoldTime(date, time);

  const quote = {
    symbol: source.symbol,
    source: source.source,
    name: parts[13] || source.name,
    price,
    previousClose,
    change,
    changePercent,
    high: Number(parts[4]) || null,
    low: Number(parts[5]) || null,
    open: Number(parts[8]) || null,
    marketTime,
    rawTime: `${date} ${time}`.trim()
  };
  quote.quality = getGoldQuality(quote);
  return quote;
}

function getGoldQuality(quote) {
  if (!quote?.price) return { level: "bad", label: "数据不足", detail: "金价缺失" };
  if (quote.price < 500 || quote.price > 10000) {
    return { level: "bad", label: "数据异常", detail: "价格超出常见区间" };
  }
  if (!quote.marketTime) {
    return { level: "warn", label: "需核验", detail: "时间缺失" };
  }

  const ageDays = dayDiff(quote.marketTime, new Date());
  if (ageDays > 7) return { level: "bad", label: "数据过旧", detail: `行情日期 ${quote.rawTime}` };
  if (ageDays > 3) return { level: "warn", label: "休市价", detail: `行情日期 ${quote.rawTime}` };
  return { level: "ok", label: "可信", detail: `行情 ${quote.rawTime}` };
}

function parseSinaGoldTime(dateText, timeText) {
  const dateMatch = String(dateText || "").match(/^(\d{4})-(\d{2})-(\d{2})$/);
  const timeMatch = String(timeText || "").match(/^(\d{2}):(\d{2})(?::(\d{2}))?$/);
  if (!dateMatch || !timeMatch) return null;
  const date = new Date(
    Number(dateMatch[1]),
    Number(dateMatch[2]) - 1,
    Number(dateMatch[3]),
    Number(timeMatch[1]),
    Number(timeMatch[2]),
    Number(timeMatch[3] || 0)
  );
  return Number.isNaN(date.getTime()) ? null : date;
}

async function fetchGoldQuote() {
  const fetchers = [fetchGoldApiQuote, fetchStooqGoldQuote];
  for (const fetcher of fetchers) {
    try {
      const quote = await fetcher();
      if (quote?.price) return quote;
    } catch {
      // Try the next public source.
    }
  }
  return null;
}

async function fetchGoldApiQuote() {
  const url = `https://api.gold-api.com/price/XAU?_=${Date.now()}`;
  const text = await fetchTextWithFallback(url);
  const payload = JSON.parse(text);
  const price = Number(payload.price || payload.rate || payload.value);
  if (!Number.isFinite(price) || price <= 0) return null;
  const marketTime = parseFlexibleDate(payload.updatedAt || payload.updated_at || payload.timestamp || payload.time);
  const quote = {
    symbol: "XAU",
    source: "Gold API",
    name: payload.name || "现货黄金",
    price,
    previousClose: null,
    change: null,
    changePercent: null,
    high: Number(payload.high) || null,
    low: Number(payload.low) || null,
    open: Number(payload.open) || null,
    marketTime,
    rawTime: marketTime ? formatShortDateTime(marketTime) : "时间未知"
  };
  quote.quality = getGoldQuality(quote);
  return quote;
}

async function fetchStooqGoldQuote() {
  const url = `https://stooq.com/q/l/?s=xauusd&f=sd2t2ohlc&h&e=csv&_=${Date.now()}`;
  const text = await fetchTextWithFallback(url);
  const lines = text.trim().split(/\r?\n/);
  if (lines.length < 2) return null;
  const headers = splitCsvLine(lines[0]);
  const values = splitCsvLine(lines[1]);
  const row = Object.fromEntries(headers.map((header, index) => [header, values[index]]));
  const price = Number(row.Close);
  if (!Number.isFinite(price) || price <= 0) return null;
  const marketTime = parseFlexibleDate(`${row.Date || ""}T${row.Time || "00:00:00"}`);
  const quote = {
    symbol: "XAUUSD",
    source: "Stooq",
    name: "现货黄金",
    price,
    previousClose: null,
    change: null,
    changePercent: null,
    high: Number(row.High) || null,
    low: Number(row.Low) || null,
    open: Number(row.Open) || null,
    marketTime,
    rawTime: `${row.Date || ""} ${row.Time || ""}`.trim()
  };
  quote.quality = getGoldQuality(quote);
  return quote;
}

async function fetchTextWithFallback(url) {
  try {
    return await fetchText(url);
  } catch {
    const proxied = `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`;
    return fetchText(proxied);
  }
}

async function fetchText(url) {
  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.text();
}

function splitCsvLine(line) {
  return String(line || "").split(",").map((value) => value.trim().replace(/^"|"$/g, ""));
}

function parseFlexibleDate(value) {
  if (!value) return null;
  const numeric = Number(value);
  const date = Number.isFinite(numeric)
    ? new Date(numeric < 1000000000000 ? numeric * 1000 : numeric)
    : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function fetchThemeBoards() {
  const callbackName = `emTheme_${Date.now()}_${Math.floor(Math.random() * 100000)}`;
  const url = [
    "http://push2.eastmoney.com/api/qt/clist/get",
    `?cb=${callbackName}`,
    "&pn=1",
    "&pz=500",
    "&po=1",
    "&np=1",
    "&fltt=2",
    "&invt=2",
    "&fid=f3",
    "&fs=m:90+t:2,m:90+t:3",
    "&fields=f12,f14,f3,f6,f62",
    `&_=${Date.now()}`
  ].join("");

  return new Promise((resolve) => {
    const script = document.createElement("script");
    let settled = false;
    const timer = window.setTimeout(() => finish([]), JSONP_TIMEOUT);
    window[callbackName] = (payload) => {
      const rows = payload?.data?.diff;
      if (!Array.isArray(rows)) return finish([]);
      finish(rows.map((row) => {
        const amountYi = toNumber(row.f6) / 100000000;
        const mainInflowYi = toNumber(row.f62) / 100000000;
        const changePercent = toNumber(row.f3);
        return {
          code: row.f12,
          name: row.f14 || "",
          changePercent,
          amountYi,
          mainInflowYi,
          score: changePercent * 8 + Math.log10(Math.max(amountYi, 1)) * 2 + Math.max(mainInflowYi, 0)
        };
      }));
    };
    script.src = url;
    script.async = true;
    script.onerror = () => finish([]);

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

function boardToStrength(board, base) {
  let strength = base;
  if (board.changePercent >= 4) strength = 5;
  else if (board.changePercent >= 2) strength = Math.max(strength, 4);
  else if (board.changePercent >= 0.5) strength = Math.max(strength, 3);
  else if (board.changePercent <= -2) strength = Math.min(strength, 2);
  if (board.mainInflowYi > 5 && board.changePercent > 0) strength = Math.min(5, strength + 1);
  return clamp(Math.round(strength), 1, 5);
}

function getThemeStrength(theme) {
  return themeState[theme]?.strength || themeStrength[theme] || 2;
}

function getThemeDetail(theme) {
  const state = themeState[theme];
  if (!state) return `强度 ${themeStrength[theme] || 2}/5 · 等待动态`;
  return `强度 ${state.strength}/5 · ${state.source}`;
}

function marketAllowsBuy(theme) {
  if (!settings.requireMarketConfirm) return true;
  const themeOk = getThemeStrength(theme) >= 3;
  const marketOk = !marketState || marketState.level !== "weak";
  return themeOk && marketOk;
}

function getRadarScanStats() {
  const perDimension = settings.radarPages * RADAR_PAGE_SIZE;
  return {
    perDimension,
    total: perDimension * 3
  };
}

function getRadarDepthText() {
  const stats = getRadarScanStats();
  return `${settings.radarPages}页/维度，约${stats.total}条候选，展示前${settings.radarLimit}只`;
}

function updateRadarDepthHint() {
  if (!radarDepthHint) return;
  const stats = getRadarScanStats();
  radarDepthHint.textContent = `各扫 ${settings.radarPages} 页，约 ${stats.total} 条候选，按评分展示前 ${settings.radarLimit} 只`;
}

async function refreshRadar(force = false) {
  if (!force && !shouldFetchRadar()) return;
  radarRefreshBtn.disabled = true;
  radarRefreshBtn.textContent = "扫描中";
  radarPulse.textContent = `扫描深度 ${getRadarDepthText()} · 非创业/科创 · 市值>${settings.minMarketCapYi}亿`;

  const jobs = [];
  ["f62", "f6", "f3"].forEach((fid) => {
    for (let page = 1; page <= settings.radarPages; page += 1) {
      jobs.push(fetchRadarList(fid, page));
    }
  });
  const results = await Promise.allSettled(jobs);
  const merged = new Map();

  results.forEach((result) => {
    if (result.status !== "fulfilled" || !Array.isArray(result.value)) return;
    result.value.forEach((item) => {
      if (!merged.has(item.code)) merged.set(item.code, item);
    });
  });

  radarItems = [...merged.values()]
    .map(enrichRadarItem)
    .filter((item) => item.reasons.length)
    .filter((item) => !ignoredRadarCodes.has(item.code))
    .sort((a, b) => b.score - a.score)
    .slice(0, settings.radarLimit);

  radarFetchedAt = Date.now();
  radarRefreshBtn.disabled = false;
  radarRefreshBtn.textContent = "扫描";
  const time = new Date(radarFetchedAt).toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" });
  radarPulse.textContent = radarItems.length
    ? `已筛出 ${radarItems.length} 只 · 忽略 ${ignoredRadarCodes.size} 只 · 深度 ${getRadarDepthText()} · ${time}`
    : `暂无主板大市值异动 · 忽略 ${ignoredRadarCodes.size} 只 · 深度 ${getRadarDepthText()} · ${time}`;
  renderRadar();
  renderThemeRadar();
  updateMetrics();
}

function renderRadar() {
  if (!radarRows) return;
  if (!radarItems.length) {
    radarRows.innerHTML = `<div class="empty">暂无资金异动。这个结果反而挺好，说明没有主板大票明显异常冲击。</div>`;
    return;
  }

  radarRows.innerHTML = radarItems.map((item) => {
    const pctClass = getChangeClass(item.changePercent);
    const tagClass = item.tag === "风险异动" ? "risk" : item.tag === "资金流入" ? "flow" : "amount";
    const inWatch = stocks.some((stock) => stock.code === item.code);
    const fitClass = item.radarFit?.level || "plain";
    const watchLabel = inWatch ? "已在自选" : item.radarFit?.label || "加观察";
    return `
      <article class="radar-card ${fitClass === "hot" ? "radar-card-fit" : ""}">
        <div class="radar-card-head">
          <div>
            <strong>${escapeHtml(item.name)}</strong>
            <span>${item.code}</span>
          </div>
          <span class="radar-tag ${tagClass}">${item.tag}</span>
        </div>
        <div class="radar-card-stats">
          <strong>${formatMoney(item.price)}</strong>
          <span class="${pctClass}">${signed(item.changePercent)}%</span>
        </div>
        <div class="radar-board-row">
          <span>${escapeHtml(item.sector || "板块待更新")}</span>
          <span>${escapeHtml(item.radarTheme || "其他")}</span>
        </div>
        <p>市值 ${item.marketCapYi.toFixed(0)}亿 · 成交 ${item.amountYi.toFixed(1)}亿 · 主力 ${signed(item.mainInflowYi)}亿</p>
        <p>${item.reasons.map(escapeHtml).join(" / ")}</p>
        <div class="radar-actions">
          <button class="mini-button radar-watch-button ${inWatch ? "in-watch" : fitClass}" data-action="radar-add-watch" data-code="${item.code}">${watchLabel}</button>
          <button class="mini-button" data-action="radar-add-holding" data-code="${item.code}">设持仓</button>
          <button class="mini-button" data-action="radar-ignore" data-code="${item.code}">忽略</button>
        </div>
      </article>
    `;
  }).join("");
}

function renderThemeRadar() {
  if (!themeRadarRows) return;
  const groups = buildThemeRadarGroups();
  const ignoredText = ignoredRadarCodes.size ? ` · 已忽略 ${ignoredRadarCodes.size} 只` : "";
  themeRadarPulse.textContent = groups.length
    ? `发现 ${groups.length} 条异动主线${ignoredText}`
    : `等待资金雷达形成主线共振${ignoredText}`;

  if (!groups.length) {
    themeRadarRows.innerHTML = `<div class="empty">暂无聚合信号。单只异动不等于主线，至少要看同方向多只大票是否共振。</div>`;
    return;
  }

  themeRadarRows.innerHTML = groups.map((group) => {
    const levelClass = group.level === "强共振" ? "hot" : group.level === "分歧" ? "warn" : "info";
    return `
      <article class="theme-radar-card">
        <div class="theme-radar-head">
          <div>
            <strong>${escapeHtml(group.name)}</strong>
            <span>${group.count}只异动 · ${group.sectors.join(" / ")}</span>
          </div>
          <span class="radar-tag ${levelClass}">${group.level}</span>
        </div>
        <div class="theme-radar-stats">
          <div>
            <span>主力净流入</span>
            <strong>${signed(group.mainInflowYi)}亿</strong>
          </div>
          <div>
            <span>成交额</span>
            <strong>${group.amountYi.toFixed(1)}亿</strong>
          </div>
          <div>
            <span>平均涨幅</span>
            <strong class="${getChangeClass(group.avgChange)}">${signed(group.avgChange)}%</strong>
          </div>
        </div>
        <p>${group.names.join(" / ")}</p>
      </article>
    `;
  }).join("");
}

function buildThemeRadarGroups() {
  const map = new Map();
  radarItems.forEach((item) => {
    const key = item.radarTheme && item.radarTheme !== "其他" ? item.radarTheme : item.sector || "其他";
    if (!map.has(key)) {
      map.set(key, {
        name: key,
        count: 0,
        mainInflowYi: 0,
        amountYi: 0,
        changeSum: 0,
        score: 0,
        names: [],
        sectors: new Set()
      });
    }
    const group = map.get(key);
    group.count += 1;
    group.mainInflowYi += item.mainInflowYi || 0;
    group.amountYi += item.amountYi || 0;
    group.changeSum += item.changePercent || 0;
    group.score += item.score || 0;
    group.names.push(item.name);
    if (item.sector) group.sectors.add(item.sector);
  });

  return [...map.values()]
    .map((group) => {
      const avgChange = group.count ? group.changeSum / group.count : 0;
      let level = "观察";
      if (group.count >= 3 && group.mainInflowYi > 3 && avgChange > 0) level = "强共振";
      else if (avgChange < 0 || group.mainInflowYi < 0) level = "分歧";
      return {
        ...group,
        avgChange,
        level,
        names: group.names.slice(0, 5),
        sectors: [...group.sectors].slice(0, 3)
      };
    })
    .sort((a, b) => (b.count - a.count) || (b.mainInflowYi - a.mainInflowYi) || (b.score - a.score))
    .slice(0, 6);
}

function captureAuctionSnapshots(list) {
  const phase = getAuctionPhase();
  if (!phase.canRecord) return;

  const dateKey = getLocalDateKey();
  if (!auctionSnapshots[dateKey]) auctionSnapshots[dateKey] = {};

  let changed = false;
  list.forEach((stock) => {
    const quote = quotes[stock.code];
    if (!quote?.price) return;

    const rows = auctionSnapshots[dateKey][stock.code] || [];
    const snapshot = {
      time: Date.now(),
      minute: getLocalMinute(),
      phase: phase.label,
      price: quote.price,
      changePercent: quote.changePercent || 0,
      volume: quote.volume || 0,
      amountWan: quote.amountWan || 0
    };

    const last = rows[rows.length - 1];
    if (last?.minute === snapshot.minute && last?.phase === snapshot.phase) {
      rows[rows.length - 1] = snapshot;
    } else {
      rows.push(snapshot);
    }

    auctionSnapshots[dateKey][stock.code] = rows.slice(-20);
    changed = true;
  });

  if (changed) {
    pruneAuctionSnapshots();
    saveAuctionSnapshots();
  }
}

function renderAuction() {
  if (!auctionRows) return;
  const phase = getAuctionPhase();
  const dateKey = getLocalDateKey();
  const todayRows = auctionSnapshots[dateKey] || {};
  const snapshotCount = Object.values(todayRows).reduce((sum, rows) => sum + (Array.isArray(rows) ? rows.length : 0), 0);

  auctionPulse.textContent = phase.canRecord
    ? `${phase.label}阶段 · 已记录 ${snapshotCount} 条快照 · 每${settings.refreshSeconds}秒刷新`
    : `${phase.label} · 开盘日 9:15-9:25 自动记录，9:20后重点看不可撤单资金`;

  const items = stocks
    .map(normalizeStock)
    .map((stock) => ({
      stock,
      analysis: analyzeAuction(stock, quotes[stock.code])
    }))
    .sort((a, b) => b.analysis.rank - a.analysis.rank)
    .slice(0, 12);

  if (!items.length) {
    auctionRows.innerHTML = `<div class="empty">暂无自选，添加股票后会自动进入竞价观察。</div>`;
    return;
  }

  auctionRows.innerHTML = items.map(({ stock, analysis }) => {
    const pctClass = analysis.changePercent === null ? "flat" : getChangeClass(analysis.changePercent);
    const pctText = analysis.changePercent === null ? "--" : `${signed(analysis.changePercent)}%`;
    const priceText = analysis.price ? formatMoney(analysis.price) : "--";
    const verification = analyzeAuctionVerification(stock, quotes[stock.code]);
    return `
      <article class="auction-card">
        <div class="auction-card-head">
          <div>
            <strong>${escapeHtml(stock.name)}</strong>
            <span>${stock.code}</span>
          </div>
          <span class="auction-tag ${analysis.level}">${analysis.label}</span>
        </div>
        <div class="auction-stats">
          <strong class="auction-price">${priceText}</strong>
          <span class="${pctClass}">${pctText}</span>
        </div>
        <p>${analysis.detail}</p>
        <p><span class="verify-tag ${verification.level}">9:35 ${verification.label}</span> ${verification.detail}</p>
        <div class="auction-foot">
          <span>${analysis.phase}</span>
          <span>${analysis.snapshots}条快照</span>
        </div>
      </article>
    `;
  }).join("");
}

function analyzeAuction(stock, quote) {
  const rows = getTodayAuctionRows(stock.code);
  const phase = getAuctionPhase();
  const lockedRows = rows.filter((item) => item.phase === "不可撤单");
  const baseRows = lockedRows.length ? lockedRows : rows;
  const latestSnapshot = baseRows[baseRows.length - 1] || rows[rows.length - 1] || null;
  const fallback = quote?.price
    ? {
        phase: phase.label,
        price: quote.price,
        changePercent: quote.changePercent || 0,
        amountWan: quote.amountWan || 0,
        volume: quote.volume || 0
      }
    : null;
  const latest = latestSnapshot || fallback;

  if (!latest) {
    return {
      label: "待记录",
      level: "weak",
      rank: 0,
      phase: phase.label,
      snapshots: rows.length,
      price: null,
      changePercent: null,
      detail: "竞价窗口会自动记录价格、涨幅和成交额"
    };
  }

  const first = baseRows[0] || rows[0] || latest;
  const pct = Number(latest.changePercent) || 0;
  const amountYi = (Number(latest.amountWan) || 0) / 10000;
  const volumeGrowth = Number(first.volume) > 0 && Number(latest.volume) > 0 ? Number(latest.volume) / Number(first.volume) : 1;
  const hasLocked = lockedRows.length > 0;
  const amountText = amountYi > 0 ? `${amountYi.toFixed(2)}亿` : "暂无";
  const growthText = volumeGrowth > 1 ? `量增${volumeGrowth.toFixed(2)}x` : "量未明显放大";

  if (!rows.length && !phase.canRecord) {
    return {
      label: "待记录",
      level: "weak",
      rank: 1,
      phase: phase.label,
      snapshots: rows.length,
      price: latest.price,
      changePercent: pct,
      detail: "暂无今日竞价快照 · 等开盘日 9:15 自动记录"
    };
  }

  if (!hasLocked && phase.label === "可撤单" && pct >= 3) {
    return {
      label: "等9:20",
      level: "warn",
      rank: 45 + pct,
      phase: phase.label,
      snapshots: rows.length,
      price: latest.price,
      changePercent: pct,
      detail: `可撤单高开 ${signed(pct)}% · 先等不可撤单确认`
    };
  }

  if (hasLocked && pct >= 2 && pct <= 6 && volumeGrowth >= 1.03) {
    return {
      label: "强竞价",
      level: "hot",
      rank: 100 + pct + volumeGrowth,
      phase: latest.phase || phase.label,
      snapshots: rows.length,
      price: latest.price,
      changePercent: pct,
      detail: `不可撤单阶段 ${signed(pct)}% · 竞价额 ${amountText} · ${growthText}`
    };
  }

  if (hasLocked && pct > 6) {
    return {
      label: "高开过热",
      level: "warn",
      rank: 75 + pct,
      phase: latest.phase || phase.label,
      snapshots: rows.length,
      price: latest.price,
      changePercent: pct,
      detail: `高开 ${signed(pct)}% · 容易冲高回落，等开盘承接`
    };
  }

  if (hasLocked && pct <= -1) {
    return {
      label: "弱竞价",
      level: "warn",
      rank: 30 - pct,
      phase: latest.phase || phase.label,
      snapshots: rows.length,
      price: latest.price,
      changePercent: pct,
      detail: `不可撤单偏弱 ${signed(pct)}% · 不做左侧猜底`
    };
  }

  if (hasLocked && pct >= 0.5 && volumeGrowth >= 1.02) {
    return {
      label: "偏强",
      level: "info",
      rank: 68 + pct,
      phase: latest.phase || phase.label,
      snapshots: rows.length,
      price: latest.price,
      changePercent: pct,
      detail: `温和高开 ${signed(pct)}% · 竞价额 ${amountText} · 看开盘承接`
    };
  }

  return {
    label: rows.length ? "普通竞价" : "待确认",
    level: rows.length ? "ok" : "weak",
    rank: rows.length ? 40 + Math.max(pct, 0) : 5,
    phase: latest.phase || phase.label,
    snapshots: rows.length,
    price: latest.price,
    changePercent: pct,
    detail: `竞价额 ${amountText} · ${rows.length ? "无明显异动" : "等待竞价窗口"}`
  };
}

function analyzeAuctionVerification(stock, quote) {
  const rows = getTodayAuctionRows(stock.code);
  const lockedRows = rows.filter((item) => item.phase === "不可撤单");
  const locked = lockedRows[lockedRows.length - 1];
  const phase = getAuctionPhase();

  if (!locked) {
    return {
      label: "无样本",
      level: "weak",
      detail: "缺少9:20后不可撤单快照"
    };
  }

  const now = new Date();
  const minutes = now.getHours() * 60 + now.getMinutes();
  if (minutes < AUCTION_VERIFY_MINUTES) {
    return {
      label: "待验证",
      level: "warn",
      detail: `竞价价 ${formatMoney(locked.price)}，9:35后看承接`
    };
  }

  if (!quote?.price) {
    return {
      label: "等行情",
      level: "weak",
      detail: "需要盘中行情确认承接"
    };
  }

  const holdPrice = quote.price >= locked.price * 0.995;
  const holdChange = quote.changePercent >= (locked.changePercent || 0) - 0.8;
  const failPrice = quote.price < locked.price * 0.98;
  const failChange = quote.changePercent < (locked.changePercent || 0) - 2;

  if (holdPrice && holdChange && quote.changePercent >= 0) {
    return {
      label: "通过",
      level: "hot",
      detail: `现价守住竞价价 ${formatMoney(locked.price)}`
    };
  }
  if (failPrice || failChange) {
    return {
      label: "失败",
      level: "warn",
      detail: `现价弱于竞价价 ${formatMoney(locked.price)}，防冲高回落`
    };
  }
  return {
    label: "一般",
    level: phase.label === "盘中" ? "info" : "weak",
    detail: `未明显跌破竞价价 ${formatMoney(locked.price)}，继续看量能`
  };
}

function getTodayAuctionRows(code) {
  const rows = auctionSnapshots[getLocalDateKey()]?.[code];
  return Array.isArray(rows) ? rows : [];
}

function clearTodayAuction() {
  delete auctionSnapshots[getLocalDateKey()];
  saveAuctionSnapshots();
  renderAuction();
}

function pruneAuctionSnapshots() {
  const keys = Object.keys(auctionSnapshots).sort();
  while (keys.length > 5) {
    const oldest = keys.shift();
    delete auctionSnapshots[oldest];
  }
}

function getAuctionPhase(date = new Date()) {
  const day = date.getDay();
  if (day === 0 || day === 6) return { label: "非交易日", canRecord: false };

  const minutes = date.getHours() * 60 + date.getMinutes();
  if (minutes < AUCTION_START_MINUTES) return { label: "未到竞价", canRecord: false };
  if (minutes < AUCTION_LOCK_MINUTES) return { label: "可撤单", canRecord: true };
  if (minutes <= AUCTION_END_MINUTES) return { label: "不可撤单", canRecord: true };
  if (minutes < 15 * 60) return { label: "盘中", canRecord: false };
  return { label: "已收盘", canRecord: false };
}

function getLocalDateKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getLocalMinute(date = new Date()) {
  const hour = String(date.getHours()).padStart(2, "0");
  const minute = String(date.getMinutes()).padStart(2, "0");
  return `${hour}:${minute}`;
}

function fetchRadarList(fid, page = 1) {
  const callbackName = `emRadar_${fid}_${Date.now()}_${Math.floor(Math.random() * 100000)}`;
  const url = [
    "http://push2.eastmoney.com/api/qt/clist/get",
    `?cb=${callbackName}`,
    `&pn=${page}`,
    `&pz=${RADAR_PAGE_SIZE}`,
    "&po=1",
    "&np=1",
    "&fltt=2",
    "&invt=2",
    `&fid=${fid}`,
    "&fs=m:0+t:6,m:0+t:80,m:1+t:2,m:1+t:23",
    "&fields=f12,f14,f2,f3,f6,f8,f10,f20,f21,f62,f100,f102,f184",
    `&_=${Date.now()}`
  ].join("");

  return new Promise((resolve) => {
    const script = document.createElement("script");
    let settled = false;
    const timer = window.setTimeout(() => finish([]), JSONP_TIMEOUT);

    window[callbackName] = (payload) => finish(parseRadarPayload(payload));
    script.src = url;
    script.async = true;
    script.onerror = () => finish([]);

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

function parseRadarPayload(payload) {
  const rows = payload?.data?.diff;
  if (!Array.isArray(rows)) return [];
  return rows
    .map((row) => {
      const code = String(row.f12 || "");
      return {
        code,
        name: row.f14 || code,
        price: toNumber(row.f2),
        changePercent: toNumber(row.f3),
        amountYi: toNumber(row.f6) / 100000000,
        turnoverRate: toNumber(row.f8),
        volumeRatio: toNumber(row.f10),
        marketCapYi: toNumber(row.f20) / 100000000,
        floatCapYi: toNumber(row.f21) / 100000000,
        mainInflowYi: toNumber(row.f62) / 100000000,
        sector: normalizeBoardName(row.f100),
        area: normalizeBoardName(row.f102),
        mainInflowPercent: toNumber(row.f184)
      };
    })
    .filter((item) => isMainBoardTradable(item.code) && item.marketCapYi >= settings.minMarketCapYi);
}

function enrichRadarItem(item) {
  const reasons = [];
  let score = 0;

  if (item.mainInflowYi >= 2) {
    reasons.push(`主力净流入 ${item.mainInflowYi.toFixed(1)}亿`);
    score += item.mainInflowYi * 4;
  }
  if (item.mainInflowPercent >= 5 && item.mainInflowYi >= 0.8) {
    reasons.push(`主力占比 ${item.mainInflowPercent.toFixed(1)}%`);
    score += item.mainInflowPercent;
  }
  if (item.amountYi >= 20 && item.changePercent > 0) {
    reasons.push(`成交额放大 ${item.amountYi.toFixed(1)}亿`);
    score += item.amountYi / 2;
  }
  if (item.volumeRatio >= 1.8 && Math.abs(item.changePercent) >= 1.5) {
    reasons.push(`量比 ${item.volumeRatio.toFixed(2)}x`);
    score += item.volumeRatio * 10;
  }
  if (item.changePercent >= 4) {
    reasons.push(`大票拉升 ${item.changePercent.toFixed(2)}%`);
    score += item.changePercent * 4;
  }
  if (item.changePercent <= -4 && item.amountYi >= 20) {
    reasons.push(`大票放量下跌 ${item.changePercent.toFixed(2)}%`);
    score += Math.abs(item.changePercent) * 3;
  }

  const tag = item.changePercent < 0 ? "风险异动" : item.mainInflowYi > 0 ? "资金流入" : "成交异动";
  const radarTheme = inferThemeFromText(`${item.name} ${item.sector} ${item.area}`);
  const radarFit = getRadarFit({ ...item, score, tag, radarTheme });
  return { ...item, reasons, score, tag, radarTheme, radarFit };
}

function getRadarFit(item) {
  if (item.tag === "风险异动" || item.changePercent <= 0) {
    return { level: "plain", label: "加观察" };
  }

  const themeOk = item.radarTheme && item.radarTheme !== "其他";
  const flowOk = item.mainInflowYi >= 1.5 || item.mainInflowPercent >= 5;
  const amountOk = item.amountYi >= 20;
  const volumeOk = item.volumeRatio >= 1.5;
  const priceOk = item.changePercent >= 1 && item.changePercent <= 7;

  if (themeOk && flowOk && amountOk && volumeOk && priceOk && item.score >= 60) {
    return { level: "hot", label: "强观察" };
  }
  if (themeOk && flowOk && amountOk && item.changePercent > 0 && item.score >= 40) {
    return { level: "watch", label: "优先观察" };
  }
  return { level: "plain", label: "加观察" };
}

function isMainBoardTradable(code) {
  if (/^(300|301|688|689|8|4)/.test(code)) return false;
  return /^(000|001|002|600|601|603|605)/.test(code);
}

function startAutoRefresh() {
  stopAutoRefresh();
  if (!autoRefresh) return;

  const delay = getRefreshDelay();
  nextRefreshAt = Date.now() + delay;
  autoTimer = window.setTimeout(async () => {
    await refreshQuotes();
    startAutoRefresh();
  }, delay);

  countdownTimer = window.setInterval(updateMetrics, 1000);
  updateMetrics();
}

function stopAutoRefresh() {
  if (autoTimer) window.clearTimeout(autoTimer);
  if (countdownTimer) window.clearInterval(countdownTimer);
  autoTimer = null;
  countdownTimer = null;
  nextRefreshAt = null;
}

function restartAutoRefresh() {
  if (autoRefresh) startAutoRefresh();
}

function getRefreshDelay() {
  const delay = settings.refreshSeconds * 1000;
  if (document.hidden) return delay;
  return isTradingWindow() ? delay : delay;
}

function isTradingWindow() {
  const now = new Date();
  const day = now.getDay();
  if (day === 0 || day === 6) return false;

  const minutes = now.getHours() * 60 + now.getMinutes();
  const morningOpen = 9 * 60 + 25;
  const morningClose = 11 * 60 + 35;
  const afternoonOpen = 12 * 60 + 55;
  const afternoonClose = 15 * 60 + 5;
  return (minutes >= morningOpen && minutes <= morningClose) || (minutes >= afternoonOpen && minutes <= afternoonClose);
}

function getAutoText() {
  if (!autoRefresh) return "自动刷新已暂停";
  if (!nextRefreshAt) return "自动刷新准备中";

  const seconds = Math.max(0, Math.ceil((nextRefreshAt - Date.now()) / 1000));
  return `${settings.refreshSeconds}秒自动刷新，${seconds}秒后更新`;
}

function fetchQuote(stock) {
  const symbol = `${marketPrefix(stock.code)}${stock.code}`;
  const varName = `v_${symbol}`;

  return new Promise((resolve) => {
    const oldScript = document.getElementById(`jsonp-${symbol}`);
    if (oldScript) oldScript.remove();
    window[varName] = undefined;

    const script = document.createElement("script");
    script.id = `jsonp-${symbol}`;
    script.charset = "gbk";
    script.src = `http://qt.gtimg.cn/q=${symbol}&_=${Date.now()}`;
    script.async = true;

    const timer = setTimeout(() => {
      cleanup();
      resolve(null);
    }, JSONP_TIMEOUT);

    script.onload = () => {
      const raw = window[varName];
      cleanup();
      resolve(parseTencentQuote(stock, raw));
    };

    script.onerror = () => {
      cleanup();
      resolve(null);
    };

    function cleanup() {
      clearTimeout(timer);
      script.remove();
    }

    document.head.appendChild(script);
  });
}

function fetchTechnical(stock) {
  const callbackName = `emKline_${stock.code}_${Date.now()}_${Math.floor(Math.random() * 100000)}`;
  const secid = `${marketPrefix(stock.code) === "sh" ? "1" : "0"}.${stock.code}`;
  const url = [
    "http://push2his.eastmoney.com/api/qt/stock/kline/get",
    `?cb=${callbackName}`,
    `&secid=${secid}`,
    "&fields1=f1,f2,f3,f4,f5,f6",
    "&fields2=f51,f52,f53,f54,f55,f56,f57,f58,f59,f60,f61",
    "&klt=101",
    "&fqt=1",
    "&end=20500101",
    "&lmt=80",
    `&_=${Date.now()}`
  ].join("");

  return new Promise((resolve) => {
    const script = document.createElement("script");
    let settled = false;
    const timer = window.setTimeout(() => finish(null), JSONP_TIMEOUT);

    window[callbackName] = (payload) => finish(parseKlinePayload(stock, payload));
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

function parseTencentQuote(stock, raw) {
  if (!raw) return null;
  const parts = String(raw).split("~");
  const price = Number(parts[3]);
  if (!Number.isFinite(price)) return null;

  return {
    code: stock.code,
    name: parts[1] || stock.name,
    price,
    previousClose: Number(parts[4]) || null,
    open: Number(parts[5]) || null,
    volume: Number(parts[36]) || Number(parts[6]) || null,
    amountWan: Number(parts[37]) || null,
    turnoverRate: Number(parts[38]) || null,
    high: Number(parts[33]) || null,
    low: Number(parts[34]) || null,
    change: Number(parts[31]) || 0,
    changePercent: Number(parts[32]) || 0,
    time: parts[30] || ""
  };
}

function parseKlinePayload(stock, payload) {
  const lines = payload?.data?.klines;
  if (!Array.isArray(lines) || lines.length < 20) return null;

  const items = lines
    .map((line) => {
      const parts = String(line).split(",");
      return {
        date: parts[0],
        open: Number(parts[1]),
        close: Number(parts[2]),
        high: Number(parts[3]),
        low: Number(parts[4]),
        volume: Number(parts[5]),
        amount: Number(parts[6]),
        amplitude: Number(parts[7]),
        changePercent: Number(parts[8]),
        change: Number(parts[9]),
        turnoverRate: Number(parts[10])
      };
    })
    .filter((item) => Number.isFinite(item.close) && Number.isFinite(item.volume));

  if (items.length < 20) return null;
  const closes = items.map((item) => item.close);
  const volumes = items.map((item) => item.volume);
  const latest = items[items.length - 1];
  const previousVolumes = volumes.slice(Math.max(0, volumes.length - 21), -1);
  const avgVolume20 = avg(previousVolumes.length ? previousVolumes : volumes.slice(-20));
  const recent20High = Math.max(...items.slice(-20).map((item) => item.high));

  return {
    code: stock.code,
    latest,
    ma5: avg(closes.slice(-5)),
    ma10: avg(closes.slice(-10)),
    ma20: avg(closes.slice(-20)),
    volumeRatio: avgVolume20 ? latest.volume / avgVolume20 : null,
    recent20High,
    return20: closes.length >= 21 ? (latest.close / closes[closes.length - 21] - 1) * 100 : null
  };
}

function analyzeStock(stock, quote, technical) {
  const normalized = normalizeStock(stock);
  const theme = normalized.theme;
  const strength = getThemeStrength(theme);
  const dataQuality = getDataQuality(quote, technical);
  const mainScore = strength * 6;
  const trend = analyzeTrend(quote, technical);
  const volume = analyzeVolume(quote, technical, trend);
  const risk = analyzeRisk(normalized, quote);
  const riskScore = risk.score;
  const point = analyzeTradePoint(normalized, quote, technical, trend, volume, risk, strength, dataQuality);
  const score = clamp(Math.round(mainScore + trend.score + volume.score + riskScore + point.scoreAdjust), 0, 100);
  const action = getAction(score, trend, volume, risk, point);

  return {
    themeStrength: strength,
    themeDetail: getThemeDetail(theme),
    dataQuality,
    score,
    scoreClass: getScoreClass(score),
    trend,
    volume,
    risk,
    point,
    action
  };
}

function getKlineStatus(quote, technical) {
  if (!quote) {
    return { level: "warn", label: "待行情", detail: "实时价格未加载，无法对照均线" };
  }
  if (!technical) {
    return { level: "warn", label: "未加载", detail: "等待日K数据，暂不能判断MA5/10/20" };
  }

  const price = quote.price || technical.latest.close;
  const aboveCount = [technical.ma5, technical.ma10, technical.ma20].filter((ma) => price > ma).length;
  const maUp = technical.ma5 > technical.ma10 && technical.ma10 > technical.ma20;
  const highGap = technical.recent20High ? (price / technical.recent20High - 1) * 100 : null;

  let level = "weak";
  let label = "弱";
  if (aboveCount === 3 && maUp) {
    level = "hot";
    label = "多头";
  } else if (aboveCount >= 2) {
    level = "ok";
    label = "修复";
  } else if (aboveCount === 1) {
    level = "warn";
    label = "反抽";
  }

  const highText = highGap === null ? "20日高点待算" : `距20日高点 ${signed(highGap)}%`;
  return {
    level,
    label,
    detail: `${technical.latest.date} · 站上${aboveCount}/3条均线 · ${highText} · MA5 ${formatMoney(technical.ma5)}`
  };
}

function getDataQuality(quote, technical) {
  const issues = [];
  const warns = [];
  const notes = [];
  const now = new Date();

  if (!quote) {
    issues.push("行情失败");
  } else {
    const quoteTime = parseMarketTime(quote.time);
    if (!quoteTime) {
      warns.push("行情时间未知");
    } else {
      const quoteAgeMinutes = (now - quoteTime) / 60000;
      const quoteAgeDays = dayDiff(quoteTime, now);
      notes.push(`行情${formatShortDateTime(quoteTime)}`);

      if (isTradingWindow() && quoteAgeMinutes > 20) {
        issues.push("行情过期");
      } else if (quoteAgeDays > 7) {
        issues.push("行情过旧");
      } else if (quoteAgeDays > 3) {
        warns.push("行情偏旧");
      }
    }
  }

  if (!technical) {
    issues.push("K线失败");
  } else {
    const klineDate = parseKlineDate(technical.latest?.date);
    if (!klineDate) {
      issues.push("K线日期缺失");
    } else {
      const klineAgeDays = dayDiff(klineDate, now);
      notes.push(`K线${technical.latest.date}`);
      if (klineAgeDays > 10) {
        issues.push("K线过旧");
      } else if (klineAgeDays > 5) {
        warns.push("K线偏旧");
      }
    }
  }

  if (quote?.price && technical?.latest?.close) {
    const drift = Math.abs(quote.price / technical.latest.close - 1) * 100;
    if (drift > 12.5) {
      warns.push("价K偏离异常");
    }
  }

  if (issues.length) {
    return {
      level: "bad",
      label: "数据不足",
      detail: issues.slice(0, 2).join(" / "),
      issues,
      warnings: warns,
      blockBuy: true
    };
  }

  if (warns.length) {
    return {
      level: "warn",
      label: "需核验",
      detail: warns.slice(0, 2).join(" / "),
      issues: warns,
      warnings: warns,
      blockBuy: true
    };
  }

  return {
    level: "ok",
    label: "可信",
    detail: notes.slice(0, 2).join(" / ") || "数据正常",
    issues: [],
    warnings: [],
    blockBuy: false
  };
}

function getBuyGate(stock, quote, technical, analysis) {
  if (analysis.point.side === "买点") {
    return { level: "buy", label: "买点通过", gaps: [analysis.point.label] };
  }

  const gaps = [];
  if (analysis.dataQuality?.blockBuy) {
    gaps.push(...analysis.dataQuality.issues.slice(0, 3));
  }
  if (!quote) gaps.push("差行情");
  if (!technical) gaps.push("差K线");
  if (quote && technical) {
    const price = quote.price || technical.latest.close;
    const strength = analysis.themeStrength;
    const nearHigh = technical.recent20High && price >= technical.recent20High * 0.985;
    const nearMa10 = technical.ma10 && Math.abs(price / technical.ma10 - 1) <= 0.025;
    const nearMa20 = technical.ma20 && Math.abs(price / technical.ma20 - 1) <= 0.025;
    const volumeOk = analysis.volume.hot || analysis.volume.label === "缩量强势";

    if (!analysis.trend.strong) gaps.push("差趋势");
    if (!volumeOk) gaps.push("差量能");
    if (strength < 4) gaps.push("差主线");
    if (!marketAllowsBuy(stock.theme)) gaps.push("差环境");
    if (analysis.risk.level !== "ok") gaps.push("差风控");
    if (analysis.volume.hot && !nearHigh && quote.changePercent <= 2) gaps.push("差突破");
    if (analysis.volume.label === "缩量强势" && !nearMa10 && !nearMa20) gaps.push("差回踩位");
    if (!gaps.length) gaps.push("差确认");
  }

  const uniqueGaps = [...new Set(gaps)].slice(0, 5);
  const hardGap = uniqueGaps.some((gap) => ["差K线", "差风控", "差环境"].includes(gap));
  return {
    level: hardGap ? "warn" : uniqueGaps.length <= 2 ? "watch" : "wait",
    label: "买点缺口",
    gaps: uniqueGaps.length ? uniqueGaps : ["差确认"]
  };
}

function getTradeBrief(stock, quote, technical, analysis, buyGate) {
  const watchReasons = [];
  const radarHit = radarItems.find((item) => item.code === stock.code);

  if (analysis.themeStrength >= 4) watchReasons.push(`${stock.theme}主线强`);
  if (analysis.score >= settings.strongScore) watchReasons.push(`评分${analysis.score}`);
  else if (analysis.score >= 70) watchReasons.push(`评分${analysis.score}，值得跟踪`);
  if (analysis.trend.strong) watchReasons.push(analysis.trend.label);
  if (analysis.volume.hot) watchReasons.push(analysis.volume.label);
  if (analysis.volume.label === "缩量强势") watchReasons.push("强趋势缩量回踩");
  if (radarHit) watchReasons.push(`雷达${radarHit.tag}`);
  if (analysis.dataQuality?.blockBuy) watchReasons.push(`先核验数据：${analysis.dataQuality.detail}`);
  if (!watchReasons.length) watchReasons.push("暂不主动进攻，等主线、K线、量能重新确认");

  let buy = "";
  if (analysis.point.side === "买点") {
    buy = `${analysis.point.label}已满足，只适合按计划分批，不能追情绪加仓`;
  } else if (buyGate.gaps.length) {
    buy = `现在不买，等${buyGate.gaps.join("、")}补齐后再看确认买点`;
  } else {
    buy = "等放量突破或缩量回踩MA10/20，再叠加市场和主线确认";
  }

  const sellRules = [];
  if (analysis.point.side === "卖点") sellRules.push(`当前已触发${analysis.point.label}`);
  if (stock.stop) sellRules.push(`跌破止损${formatMoney(stock.stop)}`);
  if (technical?.ma20) sellRules.push(`收盘跌破MA20 ${formatMoney(technical.ma20)}`);
  else sellRules.push("跌破关键均线且次日不修复");
  if (analysis.volume.danger) sellRules.push("放量分歧");
  if (stock.target) sellRules.push(`到目标${formatMoney(stock.target)}先分批`);

  return {
    level: analysis.point.side === "买点" ? "buy" : analysis.point.side === "卖点" ? "sell" : analysis.score >= 70 ? "watch" : "wait",
    watch: watchReasons.slice(0, 4).join(" / "),
    buy,
    sell: sellRules.slice(0, 4).join("；")
  };
}

function analyzeTrend(quote, technical) {
  if (!quote) return { score: 8, label: "待行情", detail: "等待现价", strong: false, weak: false };
  if (!technical) {
    const score = quote.changePercent > 0 ? 16 : 10;
    return {
      score,
      label: quote.changePercent > 0 ? "短线偏强" : "待确认",
      detail: "等待K线",
      strong: quote.changePercent > 0,
      weak: quote.changePercent < 0
    };
  }

  const price = quote.price || technical.latest.close;
  let score = 0;
  if (price > technical.ma5) score += 7;
  if (price > technical.ma10) score += 7;
  if (price > technical.ma20) score += 7;
  if (technical.ma5 > technical.ma10) score += 5;
  if (technical.ma10 > technical.ma20) score += 4;

  if (score >= 25) {
    return { score, label: "趋势强", detail: "站上5/10/20日", strong: true, weak: false };
  }
  if (score >= 17) {
    return { score, label: "趋势可看", detail: `MA20 ${formatMoney(technical.ma20)}`, strong: false, weak: false };
  }
  if (score >= 10) {
    return { score, label: "趋势一般", detail: "等重新站线", strong: false, weak: false };
  }
  return { score, label: "趋势弱", detail: "均线下方", strong: false, weak: true };
}

function analyzeVolume(quote, technical, trend) {
  if (!quote) return { score: 5, label: "待行情", detail: "等待成交", hot: false, danger: false };
  if (!technical || !Number.isFinite(technical.volumeRatio)) {
    return {
      score: quote.changePercent > 0 ? 10 : 7,
      label: quote.changePercent > 0 ? "有承接" : "待观察",
      detail: quote.turnoverRate ? `换手 ${quote.turnoverRate.toFixed(2)}%` : "等待量比",
      hot: false,
      danger: false
    };
  }

  const ratio = technical.volumeRatio;
  const change = quote.changePercent;
  if (ratio >= 1.5 && change > 0) {
    return { score: 20, label: "放量进攻", detail: `量比 ${ratio.toFixed(2)}x`, hot: true, danger: false };
  }
  if (ratio >= 2 && change <= 0) {
    return { score: 5, label: "放量分歧", detail: `量比 ${ratio.toFixed(2)}x`, hot: false, danger: true };
  }
  if (ratio >= 1.2 && change > 0) {
    return { score: 16, label: "温和放量", detail: `量比 ${ratio.toFixed(2)}x`, hot: true, danger: false };
  }
  if (ratio < 0.8 && trend.strong && change >= -1.5) {
    return { score: 14, label: "缩量强势", detail: `量比 ${ratio.toFixed(2)}x`, hot: false, danger: false };
  }
  if (ratio < 0.75 && change < 0) {
    return { score: 8, label: "缩量调整", detail: `量比 ${ratio.toFixed(2)}x`, hot: false, danger: false };
  }
  return { score: 10, label: "量能普通", detail: `量比 ${ratio.toFixed(2)}x`, hot: false, danger: false };
}

function analyzeRisk(stock, quote) {
  if (!quote) return { score: 8, level: "warn", label: "待更新", detail: "等待行情" };
  const price = quote.price;
  const target = Number(stock.target);
  const stop = Number(stock.stop);
  const cost = Number(stock.cost);

  if (stop && price <= stop) {
    return { score: 0, level: "warn", label: "到止损", detail: `止损 ${formatMoney(stop)}` };
  }
  if (target && price >= target) {
    return { score: 18, level: "hot", label: "到目标", detail: `目标 ${formatMoney(target)}` };
  }
  if (cost && price < cost) {
    return { score: 6, level: "warn", label: "低于成本", detail: `成本 ${formatMoney(cost)}` };
  }
  if (stop && price <= stop * 1.04) {
    return { score: 10, level: "warn", label: "接近止损", detail: `距止损 ${((price / stop - 1) * 100).toFixed(1)}%` };
  }
  if (cost) {
    return { score: 16, level: "ok", label: "成本上方", detail: `浮动 ${signed((price / cost - 1) * 100)}%` };
  }
  return { score: 14, level: "ok", label: "观察中", detail: "未设成本" };
}

function analyzeTradePoint(stock, quote, technical, trend, volume, risk, strength, dataQuality) {
  if (dataQuality?.blockBuy) return { side: "等待", level: "warn", label: "数据不足", scoreAdjust: -12 };
  if (!quote) return { side: "等待", level: "warn", label: "待行情", scoreAdjust: 0 };
  if (risk.label === "到止损") return { side: "卖点", level: "sell", label: "止损卖点", scoreAdjust: -18 };
  if (volume.danger) return { side: "卖点", level: "sell", label: "放量分歧", scoreAdjust: -12 };
  if (risk.label === "到目标") return { side: "卖点", level: "sell", label: "目标分批", scoreAdjust: -4 };

  if (technical) {
    const price = quote.price;
    const nearMa10 = technical.ma10 && Math.abs(price / technical.ma10 - 1) <= 0.025;
    const nearMa20 = technical.ma20 && Math.abs(price / technical.ma20 - 1) <= 0.025;
    const brokeMa10 = technical.ma10 && price < technical.ma10 && quote.changePercent < -1;
    const brokeMa20 = technical.ma20 && price < technical.ma20;
    const nearHigh = technical.recent20High && price >= technical.recent20High * 0.985;
    const riskOk = risk.level === "ok";

    if (brokeMa20) return { side: "卖点", level: "sell", label: "跌破20日", scoreAdjust: -14 };
    if (brokeMa10 && volume.label !== "缩量调整") return { side: "卖点", level: "sell", label: "跌破10日", scoreAdjust: -9 };
    if (trend.strong && volume.hot && nearHigh && strength >= 4 && riskOk && marketAllowsBuy(stock.theme)) {
      return { side: "买点", level: "buy", label: "放量突破", scoreAdjust: 8 };
    }
    if (trend.strong && volume.label === "缩量强势" && (nearMa10 || nearMa20) && strength >= 4 && riskOk && marketAllowsBuy(stock.theme)) {
      return { side: "买点", level: "buy", label: "缩量回踩", scoreAdjust: 6 };
    }
    if (quote.changePercent > 2 && price > technical.ma5 && volume.hot && strength >= 4 && riskOk && marketAllowsBuy(stock.theme)) {
      return { side: "买点", level: "buy", label: "弱转强", scoreAdjust: 5 };
    }
    if (trend.strong && volume.hot && strength >= 4 && riskOk && marketAllowsBuy(stock.theme)) {
      return { side: "买点", level: "buy", label: "确认买点", scoreAdjust: 6 };
    }
    if (trend.strong && volume.hot && strength >= 4 && !marketAllowsBuy(stock.theme)) {
      return { side: "观察", level: "warn", label: "等环境", scoreAdjust: -2 };
    }
    if (trend.strong && volume.hot) {
      return { side: "观察", level: "info", label: "进攻确认", scoreAdjust: 3 };
    }
    if (trend.strong && !volume.danger) {
      return { side: "观察", level: "ok", label: "等回踩", scoreAdjust: 1 };
    }
  }

  if (risk.label === "低于成本" || risk.label === "接近止损") {
    return { side: "观察", level: "warn", label: "等修复", scoreAdjust: -5 };
  }
  if (trend.weak) return { side: "等待", level: "warn", label: "无买点", scoreAdjust: -6 };
  return { side: "等待", level: "ok", label: "等确认", scoreAdjust: 0 };
}

function getAction(score, trend, volume, risk, point) {
  if (point.label === "数据不足") return { level: "warn", label: "等数据" };
  if (point.side === "卖点") return { level: "warn", label: point.label.includes("目标") ? "分批" : "卖点" };
  if (risk.label === "到止损" || volume.danger) return { level: "warn", label: volume.danger ? "分歧" : "风控" };
  if (point.side === "买点") return { level: "hot", label: point.label };
  if (score >= settings.strongScore && trend.strong && (volume.hot || volume.label === "缩量强势")) return { level: "hot", label: "强" };
  if (score >= 70) return { level: "info", label: "盯" };
  if (score >= 55) return { level: "ok", label: "等" };
  return { level: "warn", label: "弱" };
}

function getDiscipline(analysis) {
  if (analysis.dataQuality?.blockBuy) return { level: "wait", label: "等数据" };
  if (analysis.risk.label === "到止损") return { level: "sell", label: "止损" };
  if (analysis.point.side === "卖点" && analysis.point.label.includes("目标")) return { level: "reduce", label: "分批" };
  if (analysis.point.side === "卖点") return { level: "sell", label: "卖" };
  if (analysis.point.side === "买点" && analysis.score >= settings.strongScore) return { level: "buy", label: "可买" };
  if (analysis.score >= 70 || analysis.point.side === "观察") return { level: "watch", label: "只看" };
  return { level: "wait", label: "等" };
}

function normalizeStock(stock) {
  const note = stock.note || "";
  return {
    code: stock.code,
    name: stock.name || stock.code,
    cost: stock.cost ?? "",
    target: stock.target ?? "",
    stop: stock.stop ?? "",
    group: stock.group || "watch",
    theme: stock.theme || inferTheme(stock.name, note),
    note
  };
}

function normalizeBoardName(value) {
  const text = String(value || "").trim();
  return text && text !== "-" ? text : "";
}

function inferThemeFromText(text = "") {
  const normalized = String(text);
  const direct = inferTheme(normalized, "");
  if (direct !== "其他") return direct;

  for (const [theme, keywords] of Object.entries(themeKeywords)) {
    if (keywords.some((keyword) => normalized.includes(keyword))) return theme;
  }
  return "其他";
}

function inferTheme(name = "", note = "") {
  const text = `${name} ${note}`;
  if (/工业富联|服务器|算力|AI/.test(text)) return "AI算力/服务器";
  if (/中际|新易盛|天孚|CPO|光模块|光互联/.test(text)) return "光模块/CPO";
  if (/存储|HBM|DRAM|NAND|香农|深科技|江波龙/.test(text)) return "HBM/存储";
  if (/北方华创|设备|刻蚀|清洗|CVD|PVD/.test(text)) return "半导体设备";
  if (/鼎龙|CMP|材料|靶材|硅片|飞凯|雅克|立昂/.test(text)) return "半导体材料";
  if (/封装|Chiplet|玻璃基板/.test(text)) return "先进封装";
  if (/特气|六氟化钨|氦|气/.test(text)) return "电子特气";
  if (/京东方|TCL|面板|显示/.test(text)) return "面板/玻璃基板";
  if (/三安|士兰|扬杰|新洁能|功率|SiC|GaN/.test(text)) return "功率半导体";
  if (/中天|海缆|光通信|烽火/.test(text)) return "光通信/海缆";
  return "其他";
}

function getScoreClass(score) {
  if (score >= settings.strongScore) return "strong";
  if (score >= 70) return "watch";
  if (score >= 55) return "wait";
  return "weak";
}

function marketPrefix(code) {
  if (code.startsWith("6") || code.startsWith("9")) return "sh";
  return "sz";
}

function groupName(group) {
  return group === "holding" ? "持仓" : "观察";
}

function getChangeClass(value) {
  if (value > 0) return "up";
  if (value < 0) return "down";
  return "flat";
}

function formatMoney(value) {
  const number = Number(value);
  return Number.isFinite(number) && number > 0 ? number.toFixed(2) : "--";
}

function formatGoldPrice(value) {
  const number = Number(value);
  return Number.isFinite(number) && number > 0 ? number.toFixed(2) : "--";
}

function toNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
}

function signed(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) return "--";
  return `${number > 0 ? "+" : ""}${number.toFixed(2)}`;
}

function avg(values) {
  if (!values.length) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function localDateKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function makeId() {
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function toNumberOrBlank(value) {
  const number = Number(value);
  return Number.isFinite(number) && number > 0 ? Number(number.toFixed(3)) : "";
}

function parseMarketTime(value) {
  const text = String(value || "").replace(/\D/g, "");
  if (text.length < 8) return null;
  const year = Number(text.slice(0, 4));
  const month = Number(text.slice(4, 6));
  const day = Number(text.slice(6, 8));
  const hour = Number(text.slice(8, 10)) || 15;
  const minute = Number(text.slice(10, 12)) || 0;
  const second = Number(text.slice(12, 14)) || 0;
  const date = new Date(year, month - 1, day, hour, minute, second);
  return Number.isNaN(date.getTime()) ? null : date;
}

function parseKlineDate(value) {
  const text = String(value || "");
  const match = text.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return null;
  const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]), 15, 0, 0);
  return Number.isNaN(date.getTime()) ? null : date;
}

function dayDiff(start, end) {
  const startDate = new Date(start.getFullYear(), start.getMonth(), start.getDate());
  const endDate = new Date(end.getFullYear(), end.getMonth(), end.getDate());
  return Math.floor((endDate - startDate) / 86400000);
}

function formatShortDateTime(date) {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hour = String(date.getHours()).padStart(2, "0");
  const minute = String(date.getMinutes()).padStart(2, "0");
  return `${month}-${day} ${hour}:${minute}`;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
