const STORAGE_KEY = "stock-watch-v1";
const CONFIG_STORAGE_KEY = "stock-watch-config-v1";
const AUCTION_STORAGE_KEY = "stock-watch-auction-v1";
const IGNORED_RADAR_STORAGE_KEY = "stock-watch-ignored-radar-v1";
const REVIEW_LOG_STORAGE_KEY = "stock-watch-review-log-v1";
const FLOW_SNAPSHOT_STORAGE_KEY = "stock-watch-flow-snapshots-v1";
const SIGNAL_SNAPSHOT_STORAGE_KEY = "stock-watch-signal-snapshots-v1";
const SIGNAL_OUTCOME_STORAGE_KEY = "stock-watch-signal-outcomes-v1";
const SIGNAL_ACTIVE_STORAGE_KEY = "stock-watch-signal-active-v1";
const RADAR_HISTORY_STORAGE_KEY = "stock-watch-radar-history-v1";
const RADAR_LAST_STORAGE_KEY = "stock-watch-radar-last-v1";
const THEME_HISTORY_STORAGE_KEY = "stock-watch-theme-history-v1";
const COLLAPSE_STORAGE_KEY = "stock-watch-collapsed-panels-v1";
const WATCH_MIGRATION_STORAGE_KEY = "stock-watch-watch-migrations-v1";
const UI_STORAGE_KEY = "stock-watch-ui-v1";
const APP_VERSION = "v1.9.0 净值/前瞻统一";
const tradeRules = window.StockTradeRules;
const JSONP_TIMEOUT = 9000;
const RADAR_PAGE_SIZE = 80;
const RADAR_SORT_FIELDS = ["f62", "f6", "f3"];
const RADAR_FIELDS = "f12,f14,f2,f3,f6,f8,f10,f20,f21,f62,f100,f102,f184";
const RADAR_FS = "m:0+t:6,m:0+t:80,m:1+t:2,m:1+t:23";
const TECH_REFRESH_MS = 60000;
const VALUATION_REFRESH_MS = 60000;
const MARKET_REFRESH_MS = 60000;
const THEME_REFRESH_MS = 60000;
const DEFAULT_MAX_LOSS_YUAN = 600;
const AUCTION_START_MINUTES = 9 * 60 + 15;
const AUCTION_LOCK_MINUTES = 9 * 60 + 20;
const AUCTION_END_MINUTES = 9 * 60 + 25;
const AUCTION_VERIFY_MINUTES = 9 * 60 + 35;
const FLOW_TIMELINE_SLOTS = [
  { key: "open", label: "9:35", note: "开盘确认", target: 9 * 60 + 35, start: 9 * 60 + 30, end: 10 * 60 + 5 },
  { key: "mid", label: "10:30", note: "上午持续", target: 10 * 60 + 30, start: 10 * 60 + 5, end: 11 * 60 + 30 },
  { key: "pm", label: "13:30", note: "午后回流", target: 13 * 60 + 30, start: 13 * 60, end: 14 * 60 + 5 },
  { key: "late", label: "14:30", note: "尾盘确认", target: 14 * 60 + 30, start: 14 * 60 + 5, end: 15 * 60 }
];

const defaultSettings = {
  refreshSeconds: 60,
  minMarketCapYi: 300,
  radarPages: 4,
  radarLimit: 24,
  strongScore: 80,
  requireMarketConfirm: true,
  accountCapital: 40000,
  fees: tradeRules.DEFAULT_FEE_SETTINGS
};

const tradePlanProfiles = {
  short: {
    label: "短线试错",
    hold: "1-5日",
    minDays: 1,
    maxDays: 5,
    defaultStopPct: 4,
    sellRule: "错了快走，硬止损可盘中执行"
  },
  swing: {
    label: "趋势波段",
    hold: "1-8周",
    minDays: 5,
    maxDays: 40,
    defaultStopPct: 8,
    sellRule: "优先收盘确认，盘中只减不清"
  },
  long: {
    label: "长线配置",
    hold: "3个月+",
    minDays: 60,
    maxDays: 250,
    defaultStopPct: 15,
    sellRule: "看逻辑失效和仓位，不因盘中波动清仓"
  }
};

const sellTimingProfiles = {
  "close-confirm": { label: "收盘确认卖", gate: "盘中不全卖，等收盘确认破位" },
  "reduce-first": { label: "先减半再确认", gate: "盘中不确定先减半，剩余等收盘" },
  "hard-stop": { label: "硬止损盘中可卖", gate: "触发硬止损可直接执行" }
};

const valuationProfiles = {
  growth: {
    label: "成长估值",
    lowPe: 25,
    highPe: 60,
    extremePe: 90,
    highPb: 8,
    extremePb: 12,
    note: "成长股看PE/PEG和业绩增速，高估值最怕增速下修"
  },
  platform: {
    label: "平台估值",
    lowPe: 18,
    highPe: 45,
    extremePe: 70,
    highPb: 6,
    extremePb: 9,
    note: "容量平台股估值要看订单兑现和机构仓位拥挤度"
  },
  cycle: {
    label: "周期估值",
    lowPe: 8,
    highPe: 25,
    extremePe: 40,
    highPb: 2.5,
    extremePb: 4,
    note: "周期股低PE可能是景气顶，高PE也可能是景气底"
  }
};

const valuationProfileByTheme = {
  "AI算力/服务器": "platform",
  "光模块/CPO": "growth",
  "HBM/存储": "growth",
  "半导体设备": "growth",
  "半导体材料": "growth",
  "先进封装": "growth",
  "电子特气": "growth",
  "面板/玻璃基板": "cycle",
  "功率半导体": "cycle",
  "光通信/海缆": "platform",
  "风电设备": "cycle",
  "有色金属": "cycle",
  "小金属": "cycle",
  "稀土永磁": "cycle",
  "煤炭能源": "cycle"
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
  "风电设备": 3,
  "有色金属": 3,
  "小金属": 3,
  "稀土永磁": 3,
  "煤炭能源": 3,
  "其他": 2
};

const themeKeywords = {
  "AI算力/服务器": ["算力", "服务器", "数据中心", "液冷", "云计算", "AI"],
  "光模块/CPO": ["光模块", "CPO", "光通信", "通信设备", "光器件", "硅光"],
  "HBM/存储": ["存储", "HBM", "DRAM", "NAND", "存储芯片"],
  "半导体设备": ["半导体设备", "刻蚀", "光刻机", "清洗", "先进封装设备"],
  "半导体材料": ["半导体材料", "CMP", "靶材", "硅片", "光刻胶", "电子化学品"],
  "先进封装": ["先进封装", "Chiplet", "IC载板", "封装基板"],
  "电子特气": ["电子特气", "特气", "稀有气体", "氟化工"],
  "面板/玻璃基板": ["面板", "OLED", "MiniLED", "玻璃基板", "显示"],
  "功率半导体": ["功率半导体", "SiC", "IGBT", "MOSFET", "第三代半导体"],
  "光通信/海缆": ["光通信", "海缆", "海底电缆", "通信设备", "光纤光缆"],
  "风电设备": ["风电", "风电设备", "风机", "风塔", "叶片", "海上风电"],
  "有色金属": ["有色", "铜", "铝", "锌", "镍", "工业金属"],
  "小金属": ["小金属", "锡", "锑", "钨", "钼", "铟", "锗", "镓", "铋", "钽", "铌"],
  "稀土永磁": ["稀土", "永磁", "钕铁硼", "镨钕"],
  "煤炭能源": ["煤炭", "能源", "动力煤", "焦煤", "石油", "天然气"]
};

const themeProfiles = {
  "AI算力/服务器": { lane: "主攻科技", className: "primary", priority: 12, minBuyStrength: 4 },
  "光模块/CPO": { lane: "主攻科技", className: "primary", priority: 12, minBuyStrength: 4 },
  "HBM/存储": { lane: "主攻科技", className: "primary", priority: 12, minBuyStrength: 4 },
  "半导体设备": { lane: "主攻科技", className: "primary", priority: 14, minBuyStrength: 4 },
  "半导体材料": { lane: "主攻科技", className: "primary", priority: 12, minBuyStrength: 4 },
  "先进封装": { lane: "主攻科技", className: "primary", priority: 12, minBuyStrength: 4 },
  "电子特气": { lane: "主攻科技", className: "primary", priority: 10, minBuyStrength: 4 },
  "面板/玻璃基板": { lane: "科技观察", className: "tech-watch", priority: 4, minBuyStrength: 4 },
  "功率半导体": { lane: "科技观察", className: "tech-watch", priority: 6, minBuyStrength: 4 },
  "光通信/海缆": { lane: "科技观察", className: "tech-watch", priority: 5, minBuyStrength: 4 },
  "风电设备": { lane: "轮动观察", className: "rotation", priority: -12, minBuyStrength: 5 },
  "有色金属": { lane: "轮动观察", className: "rotation", priority: -12, minBuyStrength: 5 },
  "小金属": { lane: "轮动观察", className: "rotation", priority: -9, minBuyStrength: 5 },
  "稀土永磁": { lane: "轮动观察", className: "rotation", priority: -10, minBuyStrength: 5 },
  "煤炭能源": { lane: "轮动观察", className: "rotation", priority: -14, minBuyStrength: 5 }
};

const dynamicRotationRules = [
  { name: "医药/创新药", pattern: /医药|创新药|化学制药|化学制剂|生物制品|医疗服务|医疗器械|医疗研发外包|CRO|CXO|CDMO|单抗|减肥药|ADC/ },
  { name: "大金融", pattern: /证券|银行|保险|多元金融|金融|互联金融/ },
  { name: "大消费", pattern: /食品饮料|白酒|啤酒|家电|旅游|酒店|零售|免税|消费/ },
  { name: "军工", pattern: /军工|国防军工|航天|航空装备|船舶/ },
  { name: "地产链", pattern: /房地产|地产|建筑|建材|水泥|家居|装修/ },
  { name: "机器人/自动化", pattern: /机器人|自动化设备|通用设备|工业母机|机床/ },
  { name: "新能源", pattern: /电力设备|新能源|光伏|储能|锂电|电池|逆变器|充电桩/ },
  { name: "小金属", pattern: /小金属|锡|锑|钨|钼|铟|锗|镓|铋|钽|铌|锡业|华锡|厦门钨业|中钨|金钼|洛阳钼业|云南锗业|东方钽业/ },
  { name: "化工材料", pattern: /基础化工|化学制品|化工|氟化工|PVDF|农化制品/ },
  { name: "泛科技", pattern: /电子|计算机|通信|半导体|芯片|软件|数据安全|人工智能/ }
];

const stockPositionMap = {
  "600703": { primary: "功率半导体", segment: "化合物半导体 / SiC-GaN / LED", chain: "器件与制造", confidence: "确定定位", confidenceClass: "sure", forbidden: "禁止误入半导体设备/材料", logic: "看第三代半导体扩产、功率器件景气和 MiniLED 修复", caution: "不是半导体设备；当前按情绪单警示监控，只看资金修复，不做气不过追单" },
  "000021": { primary: "存储产业链", segment: "存储封测 / 模组 / HBM映射", chain: "封测与模组", confidence: "映射定位", confidenceClass: "mapped", forbidden: "禁止当成HBM原厂", logic: "看存储景气、HBM 扩产和封测订单映射", caution: "不是纯存储芯片设计龙头，不等同于兆易创新" },
  "600378": { primary: "半导体材料", segment: "电子特气 / 六氟化钨", chain: "上游材料", confidence: "确定定位", confidenceClass: "sure", forbidden: "禁止当成终端主线龙头", logic: "看电子特气国产替代、六氟化钨供给和半导体材料景气", caution: "细分材料属性强，不能当终端主线龙头追" },
  "600522": { primary: "光通信/海缆", segment: "光通信 / 海底电缆", chain: "通信基础设施", confidence: "确定定位", confidenceClass: "sure", forbidden: "禁止当成纯CPO", logic: "看海缆订单、光通信需求和能源通信建设", caution: "不是纯 CPO 光模块，海缆属性更重" },
  "000725": { primary: "面板显示", segment: "LCD/OLED / 玻璃基板映射", chain: "显示面板", confidence: "确定定位", confidenceClass: "sure", forbidden: "禁止当成先进封装", logic: "看面板价格周期、产能格局和玻璃基板叙事", caution: "偏周期和容量中军，弹性未必强于 TCL 科技" },
  "601138": { primary: "AI算力", segment: "AI服务器整机 / 整柜", chain: "算力硬件中游", confidence: "确定定位", confidenceClass: "sure", forbidden: "禁止当成光模块/CPO", logic: "看 AI 服务器订单、云厂资本开支和业绩兑现", caution: "容量核心，买点仍看趋势和资金承接" },
  "002371": { primary: "半导体设备", segment: "刻蚀/PVD/CVD/清洗等平台设备", chain: "晶圆制造设备", confidence: "确定定位", confidenceClass: "sure", forbidden: "禁止当成材料股", logic: "看国产替代、晶圆厂扩产和设备订单", caution: "设备总龙头，估值和机构仓位变化影响大" },
  "002409": { primary: "半导体材料", segment: "电子材料 / 特气 / 前驱体", chain: "上游材料平台", confidence: "确定定位", confidenceClass: "sure", forbidden: "禁止当成设备股", logic: "看材料国产替代、存储扩产和电子特气需求", caution: "材料平台票，弹性通常看细分产品催化" },
  "605358": { primary: "半导体材料", segment: "硅片 / 功率半导体衬底", chain: "上游材料", logic: "看硅片周期、功率半导体和国产替代", caution: "不是设备，且有功率半导体周期属性" },
  "603690": { primary: "半导体设备", segment: "清洗设备 / 高纯工艺系统", chain: "晶圆制造设备", logic: "看清洗设备订单和高纯工艺系统国产替代", caution: "比设备总龙头弹性更强，也更看订单兑现" },
  "600584": { primary: "先进封装", segment: "封测 / Chiplet 映射", chain: "封装测试", logic: "看先进封装需求、国产封测景气和客户结构", caution: "封测中军，不是存储芯片本体" },
  "002156": { primary: "先进封装", segment: "封测 / AMD链映射", chain: "封装测试", logic: "看先进封装订单和海外大客户映射", caution: "弹性强但波动也大，不能只看概念" },
  "603986": { primary: "存储芯片", segment: "NOR Flash / MCU / DRAM映射", chain: "芯片设计", logic: "看存储价格周期、国产替代和 MCU 修复", caution: "更接近存储芯片中军，不是 HBM 原厂" },
  "600667": { primary: "存储产业链", segment: "存储封测 / HBM映射 / 晶圆厂配套", chain: "封测与工程服务", confidence: "映射定位", confidenceClass: "mapped", forbidden: "禁止当成先进封装补仓", logic: "看存储扩产、封测订单和太极实业自身资产逻辑", caution: "不把它当先进封装补仓标的；先进封装属性未确认前只按存储映射监控" },
  "002281": { primary: "光模块/CPO", segment: "光器件 / 光模块", chain: "光通信硬件", logic: "看高速光模块需求、国产光器件和 CPO 预期", caution: "非创业板替代核心，但仍需看海外算力链强弱" },
  "603083": { primary: "光模块/CPO", segment: "光模块 / 通信设备", chain: "光通信硬件", logic: "看光模块弹性、订单预期和情绪强度", caution: "弹性强，追高风险也高" },
  "000988": { primary: "光通信/CPO", segment: "光模块 / 激光设备", chain: "光通信与激光设备", logic: "看光模块、激光设备和制造升级双属性", caution: "不是纯 CPO，双属性会影响市场定价" },
  "600460": { primary: "功率半导体", segment: "IDM / 功率器件", chain: "器件制造", logic: "看功率器件周期、国产替代和 IDM 产能利用", caution: "周期属性明显，不是设备股" },
  "603290": { primary: "功率半导体", segment: "IGBT / 功率模块", chain: "功率器件", logic: "看新能源、工控和 IGBT 国产替代", caution: "不是第三代半导体设备" },
  "000100": { primary: "面板显示", segment: "LCD/OLED / 面板周期", chain: "显示面板", logic: "看面板价格、产能效率和行业格局", caution: "更偏周期弹性，不是玻璃基板纯概念" },
  "601899": { primary: "有色金属", segment: "铜 / 金 / 矿产资源", chain: "资源上游", logic: "看铜金价格、矿产扩张和资源股风险偏好", caution: "轮动观察方向，不替代科技主攻仓位" },
  "600111": { primary: "稀土永磁", segment: "稀土资源 / 定价核心", chain: "资源上游", logic: "看稀土价格、政策和下游永磁需求", caution: "轮动观察，必须有资金共振才提高优先级" },
  "002202": { primary: "风电设备", segment: "风机整机", chain: "新能源设备", logic: "看风电招标、海风建设和整机盈利修复", caution: "不是半导体设备" },
  "000063": { primary: "AI算力网络", segment: "通信主设备 / 算力网络", chain: "网络设备", logic: "看算力网络建设、运营商资本开支和通信设备订单", caution: "不是 AI 服务器整机，和工业富联、浪潮信息不是同一定位" },
  "000938": { primary: "AI算力", segment: "服务器 / 交换机 / 云网设备", chain: "算力基础设施", logic: "看云网设备、服务器需求和算力基础设施订单", caution: "偏 ICT 平台，不是纯 GPU 或纯服务器制造" },
  "000977": { primary: "AI算力", segment: "AI服务器 / 通用服务器", chain: "算力硬件中游", logic: "看 AI 服务器订单、国产算力需求和机构承接", caution: "服务器中军，弹性和节奏不等同于光模块" },
  "002130": { primary: "高速连接", segment: "高速铜缆 / 通信材料", chain: "算力互连材料", logic: "看高速铜缆、液冷与服务器连接材料需求", caution: "不是光模块，属于算力互连材料映射" },
  "002185": { primary: "先进封装", segment: "封测 / 先进封装", chain: "封装测试", logic: "看封测景气、先进封装扩散和国产替代", caution: "封测核心，不是芯片设计本体" },
  "002436": { primary: "先进封装", segment: "IC载板 / 封装基板", chain: "封装材料与基板", logic: "看 IC 载板、封装基板和先进封装扩产", caution: "更偏封装基板，不是封测厂本身" },
  "002463": { primary: "AI算力", segment: "AI服务器 PCB / 高速板", chain: "算力硬件材料", logic: "看 AI 服务器 PCB、交换机板和高频高速需求", caution: "不是服务器整机，属于算力链上游材料环节" },
  "002549": { primary: "电子特气", segment: "稀有气体 / 电子特气", chain: "上游材料", logic: "看稀有气体价格、电子特气国产替代和下游认证", caution: "弹性分支，不等同于六氟化钨主逻辑" },
  "002971": { primary: "电子特气", segment: "六氟化钨映射 / 电子特气试生产", chain: "上游材料", confidence: "概念高波动", confidenceClass: "pending", forbidden: "禁止当成六氟化钨业绩兑现龙头", logic: "看电子特气试生产进展、六氟化钨预期、定增进程和资金承接", caution: "公司公告提示电子级六氟化钨尚未取得下游认证、未签实质订单、短期不贡献业绩；小市值高波动，只能轻仓观察" },
  "002654": { primary: "存储产业链", segment: "存储相关 / LED显示照明", chain: "混合映射", logic: "看存储映射和自身业务改善是否共振", caution: "属性混合，不是纯存储芯片龙头" },
  "300054": { primary: "半导体材料", segment: "CMP抛光材料 / 半导体耗材", chain: "上游材料", logic: "看 CMP 材料国产替代、晶圆厂验证和订单兑现", caution: "材料细分龙头，不能按设备股逻辑估值" },
  "300346": { primary: "半导体材料", segment: "光刻胶 / 电子特气 / MO源", chain: "上游材料", logic: "看光刻胶、电子特气国产替代和先进制程材料验证", caution: "多材料平台，单一产品催化需要分清" },
  "300398": { primary: "半导体材料", segment: "电子化学品 / 光刻胶材料", chain: "上游材料", logic: "看电子化学品、显示材料和半导体材料国产替代", caution: "飞凯材料偏材料平台，不是设备，也不是存储本体" },
  "300475": { primary: "存储产业链", segment: "存储模组 / HBM映射", chain: "模组与分销", logic: "看存储价格、模组需求和 HBM 情绪映射", caution: "不是 HBM 原厂，更多是存储景气与交易映射" },
  "300666": { primary: "半导体材料", segment: "溅射靶材 / 高纯金属材料", chain: "上游材料", logic: "看靶材国产替代、晶圆厂验证和订单放量", caution: "靶材细分材料，不是终端主线龙头" },
  "301308": { primary: "存储产业链", segment: "存储模组 / 企业级存储", chain: "模组与品牌存储", logic: "看存储价格周期、企业级需求和国产替代", caution: "不是 HBM 原厂，波动更受存储周期和情绪影响" },
  "600183": { primary: "AI算力", segment: "覆铜板 / 高频高速材料", chain: "PCB上游材料", logic: "看 AI PCB 高速材料、覆铜板价格和服务器需求", caution: "不是 PCB 板厂，也不是服务器整机" },
  "600487": { primary: "光通信/海缆", segment: "光纤光缆 / 海缆", chain: "通信基础设施", logic: "看海缆订单、光通信需求和电网通信建设", caution: "不是纯 CPO 光模块" },
  "600498": { primary: "光通信/海缆", segment: "光通信设备 / 网络设备", chain: "通信设备", logic: "看运营商投资、光通信建设和设备订单", caution: "偏通信设备，不是光模块弹性龙头" },
  "600641": { primary: "半导体设备", segment: "离子注入设备 / 半导体设备平台", chain: "晶圆制造设备", logic: "看离子注入设备国产替代和设备订单兑现", caution: "设备分支核心，不是材料股" },
  "600707": { primary: "面板/玻璃基板", segment: "显示面板 / 玻璃基板映射", chain: "显示材料与面板", logic: "看玻璃基板叙事、面板周期和产能变化", caution: "玻璃基板弹性分支，需确认是否有业绩兑现" },
  "600745": { primary: "功率半导体", segment: "半导体IDM / 消费电子ODM", chain: "器件制造与整机", logic: "看功率半导体周期、安世半导体和消费电子修复", caution: "双主业属性明显，不能只按功率半导体单线看" },
  "603019": { primary: "AI算力", segment: "服务器 / 算力基础设施", chain: "算力硬件中游", logic: "看国产算力、服务器订单和算力基础设施建设", caution: "容量核心，追高需要看趋势和资金承接" },
  "000657": { primary: "小金属", segment: "钨 / 硬质合金 / 刀具材料", chain: "资源与高端制造材料", logic: "看钨价、硬质合金需求和高端制造材料景气", caution: "不是半导体材料，属于资源与制造材料轮动" },
  "000960": { primary: "小金属", segment: "锡 / 铟 / 有色资源", chain: "资源上游", confidence: "确定定位", confidenceClass: "sure", forbidden: "禁止误入贵金属/黄金", logic: "看锡价、矿端供给、半导体焊料与电子制造需求", caution: "小金属弹性强，必须等资源板块资金共振和趋势确认" },
  "000962": { primary: "小金属", segment: "钽 / 铌 / 电子材料", chain: "资源与电子材料", logic: "看钽铌材料、高端电容和军工电子材料需求", caution: "细分较窄，流动性和题材强度要单独确认" },
  "002155": { primary: "小金属", segment: "锑 / 黄金伴生", chain: "资源上游", confidence: "映射定位", confidenceClass: "mapped", forbidden: "禁止按纯黄金股处理", logic: "看锑供给约束、阻燃/光伏/军工材料需求和资源品轮动", caution: "名字带黄金，但这里按锑的小金属逻辑观察" },
  "002428": { primary: "小金属", segment: "锗 / 红外与半导体材料映射", chain: "资源与电子材料", logic: "看锗价、红外光学、光伏和半导体材料映射", caution: "弹性强但容量较小，不能替代大票中军" },
  "600301": { primary: "小金属", segment: "锡 / 锑 / 有色资源", chain: "资源上游", logic: "看锡锑价格、资源整合和小金属风险偏好", caution: "弹性票属性更强，必须严控追高和仓位" },
  "600549": { primary: "小金属", segment: "钨 / 稀土 / 硬质合金", chain: "资源与材料", logic: "看钨价、硬质合金、稀土材料和制造业需求", caution: "钨和稀土复合属性，主线归属要看当日资金打的是哪条线" },
  "600961": { primary: "小金属", segment: "铟 / 锌冶炼 / 稀散金属", chain: "资源与冶炼", logic: "看铟价、锌冶炼和稀散金属供需", caution: "偏稀散金属映射，持续性要看板块共振" },
  "601958": { primary: "小金属", segment: "钼 / 钼化工 / 钼金属", chain: "资源上游", logic: "看钼价、钢铁合金需求和资源品轮动", caution: "更偏钼资源，中军属性取决于资金是否打小金属分支" },
  "603993": { primary: "小金属", segment: "钼 / 钴 / 铜 / 资源平台", chain: "资源上游", logic: "看钼钴铜价格、海外矿山和资源品风险偏好", caution: "有色平台属性强，若资金主打铜则按有色，主打钼钴则按小金属" },
  "605111": { primary: "功率半导体", segment: "MOSFET / 功率器件", chain: "功率器件", logic: "看新能源、工控和功率器件周期修复", caution: "不是设备股，弹性受功率周期影响更大" }
};

const marketIndexes = [
  { symbol: "sh000001", name: "上证" },
  { symbol: "sz399001", name: "深成" },
  { symbol: "sz399006", name: "创业板" },
  { symbol: "sh000688", name: "科创50" }
];
const MARKET_GATE_INDEX = { symbol: "sh000001", name: "上证指数", secid: "1.000001" };

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
    code: "002971",
    name: "和远气体",
    cost: "",
    target: "",
    stop: "",
    group: "watch",
    theme: "电子特气",
    note: "小市值高波动：六氟化钨映射 / 电子特气试生产 / 定增进行中"
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
  },
  {
    code: "600667",
    name: "太极实业",
    cost: "",
    target: "",
    stop: "",
    group: "watch",
    theme: "HBM/存储",
    note: "重点监控：存储封测 / HBM映射 / 存储扩产"
  }
];

const focusMonitorStocks = [
  {
    code: "002971",
    name: "和远气体",
    group: "watch",
    theme: "电子特气",
    note: "小市值高波动：六氟化钨映射 / 电子特气试生产 / 定增进行中",
    plan: { type: "short", maxLoss: DEFAULT_MAX_LOSS_YUAN, sellTiming: "hard-stop", coreOnly: false }
  },
  {
    code: "600667",
    name: "太极实业",
    group: "watch",
    theme: "HBM/存储",
    note: "重点监控：存储封测 / HBM映射 / 存储扩产",
    plan: { type: "swing", maxLoss: DEFAULT_MAX_LOSS_YUAN, sellTiming: "close-confirm", coreOnly: true }
  },
  {
    code: "600703",
    name: "三安光电",
    group: "watch",
    theme: "功率半导体",
    note: "重点监控：情绪单警示，只看资金修复，不做气不过追单",
    plan: { type: "swing", maxLoss: DEFAULT_MAX_LOSS_YUAN, sellTiming: "close-confirm", coreOnly: true }
  }
];

const watchMigrationStocks = focusMonitorStocks.filter((stock) => stock.code === "002971");

const commonStocks = [
  { code: "000100", name: "TCL科技", theme: "面板/玻璃基板", note: "面板 / 玻璃基板", aliases: ["TCL", "TCL科技"] },
  { code: "000021", name: "深科技", theme: "HBM/存储", note: "存储封测 / 先进封装", aliases: ["深科技"] },
  { code: "000063", name: "中兴通讯", theme: "AI算力/服务器", note: "通信设备 / 算力网络", aliases: ["中兴"] },
  { code: "000725", name: "京东方A", theme: "面板/玻璃基板", note: "面板 / 玻璃基板", aliases: ["京东方", "BOE", "京东方A"] },
  { code: "000938", name: "紫光股份", theme: "AI算力/服务器", note: "服务器 / 网络设备", aliases: ["紫光"] },
  { code: "000977", name: "浪潮信息", theme: "AI算力/服务器", note: "AI服务器", aliases: ["浪潮"] },
  { code: "000988", name: "华工科技", theme: "光模块/CPO", note: "光模块 / 激光设备", aliases: ["华工"] },
  { code: "002130", name: "沃尔核材", theme: "光通信/海缆", note: "高速铜缆 / 通信材料", aliases: ["沃尔"] },
  { code: "002156", name: "通富微电", theme: "先进封装", note: "封测 / 先进封装", aliases: ["通富"] },
  { code: "002185", name: "华天科技", theme: "先进封装", note: "封测 / 先进封装", aliases: ["华天"] },
  { code: "002202", name: "金风科技", theme: "风电设备", note: "风机 / 风电设备", aliases: ["金风"] },
  { code: "002281", name: "光迅科技", theme: "光模块/CPO", note: "光器件 / 光模块", aliases: ["光迅"] },
  { code: "002371", name: "北方华创", theme: "半导体设备", note: "半导体设备", aliases: ["北方"] },
  { code: "002409", name: "雅克科技", theme: "半导体材料", note: "半导体材料 / 电子特气", aliases: ["雅克"] },
  { code: "002436", name: "兴森科技", theme: "先进封装", note: "IC载板 / 封装基板", aliases: ["兴森"] },
  { code: "002463", name: "沪电股份", theme: "AI算力/服务器", note: "AI服务器PCB", aliases: ["沪电"] },
  { code: "002487", name: "大金重工", theme: "风电设备", note: "风塔 / 海上风电", aliases: ["大金"] },
  { code: "002531", name: "天顺风能", theme: "风电设备", note: "风塔 / 风电设备", aliases: ["天顺"] },
  { code: "002549", name: "凯美特气", theme: "电子特气", note: "稀有气体 / 电子特气", aliases: ["凯美特"] },
  { code: "002654", name: "万润科技", theme: "HBM/存储", note: "存储相关 / LED", aliases: ["万润"] },
  { code: "002971", name: "和远气体", theme: "电子特气", note: "六氟化钨映射 / 电子特气试生产 / 定增进行中", aliases: ["和远", "和远气体"] },
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
  { code: "600667", name: "太极实业", theme: "HBM/存储", note: "存储封测 / HBM映射 / 存储扩产", aliases: ["太极"] },
  { code: "600703", name: "三安光电", theme: "功率半导体", note: "化合物半导体 / MiniLED", aliases: ["三安"] },
  { code: "600707", name: "彩虹股份", theme: "面板/玻璃基板", note: "面板 / 玻璃基板", aliases: ["彩虹"] },
  { code: "600745", name: "闻泰科技", theme: "功率半导体", note: "功率半导体 / 半导体IDM", aliases: ["闻泰"] },
  { code: "600875", name: "东方电气", theme: "风电设备", note: "电力设备 / 风电", aliases: ["东方电气"] },
  { code: "601138", name: "工业富联", theme: "AI算力/服务器", note: "AI服务器整柜", aliases: ["工业富联", "富联", "FII"] },
  { code: "601615", name: "明阳智能", theme: "风电设备", note: "风机 / 海上风电", aliases: ["明阳"] },
  { code: "601869", name: "长飞光纤", theme: "光通信/海缆", note: "光纤光缆", aliases: ["长飞"] },
  { code: "603019", name: "中科曙光", theme: "AI算力/服务器", note: "AI服务器 / 算力", aliases: ["曙光", "中科曙光"] },
  { code: "603083", name: "剑桥科技", theme: "光模块/CPO", note: "光模块 / 通信设备", aliases: ["剑桥"] },
  { code: "603218", name: "日月股份", theme: "风电设备", note: "风电铸件", aliases: ["日月"] },
  { code: "603606", name: "东方电缆", theme: "风电设备", note: "海缆 / 海上风电", aliases: ["东缆", "东方电缆"] },
  { code: "603290", name: "斯达半导", theme: "功率半导体", note: "IGBT / 功率半导体", aliases: ["斯达"] },
  { code: "603690", name: "至纯科技", theme: "半导体设备", note: "清洗设备 / 高纯工艺", aliases: ["至纯"] },
  { code: "603986", name: "兆易创新", theme: "HBM/存储", note: "存储芯片 / MCU", aliases: ["兆易"] },
  { code: "605111", name: "新洁能", theme: "功率半导体", note: "功率器件", aliases: ["新洁能"] },
  { code: "605358", name: "立昂微", theme: "半导体材料", note: "硅片 / 功率半导体", aliases: ["立昂", "立微昂"] },
  { code: "000630", name: "铜陵有色", theme: "有色金属", note: "铜 / 工业金属", aliases: ["铜陵"] },
  { code: "000807", name: "云铝股份", theme: "有色金属", note: "铝 / 工业金属", aliases: ["云铝"] },
  { code: "000831", name: "中国稀土", theme: "稀土永磁", note: "稀土资源", aliases: ["中国稀土"] },
  { code: "000933", name: "神火股份", theme: "有色金属", note: "铝 / 煤炭", aliases: ["神火"] },
  { code: "000970", name: "中科三环", theme: "稀土永磁", note: "稀土永磁材料", aliases: ["中科三环"] },
  { code: "000657", name: "中钨高新", theme: "小金属", note: "钨 / 硬质合金", aliases: ["中钨", "中钨高新"] },
  { code: "000960", name: "锡业股份", theme: "小金属", note: "锡 / 铟 / 小金属", aliases: ["锡业", "锡业股份"] },
  { code: "000962", name: "东方钽业", theme: "小金属", note: "钽 / 铌 / 电子材料", aliases: ["东方钽业", "钽业"] },
  { code: "002056", name: "横店东磁", theme: "稀土永磁", note: "永磁材料 / 光伏", aliases: ["横店东磁"] },
  { code: "002155", name: "湖南黄金", theme: "小金属", note: "锑 / 黄金伴生", aliases: ["湖南黄金", "湖南锑"] },
  { code: "002428", name: "云南锗业", theme: "小金属", note: "锗 / 红外 / 半导体材料映射", aliases: ["云南锗业", "锗业"] },
  { code: "600028", name: "中国石化", theme: "煤炭能源", note: "石化能源", aliases: ["中石化", "中国石化"] },
  { code: "600111", name: "北方稀土", theme: "稀土永磁", note: "稀土资源", aliases: ["北方稀土"] },
  { code: "600188", name: "兖矿能源", theme: "煤炭能源", note: "煤炭能源", aliases: ["兖矿"] },
  { code: "600301", name: "华锡有色", theme: "小金属", note: "锡 / 锑 / 小金属", aliases: ["华锡", "华锡有色"] },
  { code: "600362", name: "江西铜业", theme: "有色金属", note: "铜 / 工业金属", aliases: ["江铜", "江西铜业"] },
  { code: "600392", name: "盛和资源", theme: "稀土永磁", note: "稀土资源", aliases: ["盛和"] },
  { code: "600549", name: "厦门钨业", theme: "小金属", note: "钨 / 稀土 / 硬质合金", aliases: ["厦钨", "厦门钨业"] },
  { code: "600961", name: "株冶集团", theme: "小金属", note: "铟 / 锌冶炼 / 稀散金属", aliases: ["株冶", "株冶集团"] },
  { code: "600938", name: "中国海油", theme: "煤炭能源", note: "油气能源", aliases: ["中海油", "中国海油"] },
  { code: "601088", name: "中国神华", theme: "煤炭能源", note: "煤炭 / 高股息", aliases: ["神华", "中国神华"] },
  { code: "601225", name: "陕西煤业", theme: "煤炭能源", note: "煤炭 / 高股息", aliases: ["陕煤", "陕西煤业"] },
  { code: "601600", name: "中国铝业", theme: "有色金属", note: "铝 / 工业金属", aliases: ["中铝", "中国铝业"] },
  { code: "601857", name: "中国石油", theme: "煤炭能源", note: "油气能源", aliases: ["中石油", "中国石油"] },
  { code: "601898", name: "中煤能源", theme: "煤炭能源", note: "煤炭能源", aliases: ["中煤"] },
  { code: "601958", name: "金钼股份", theme: "小金属", note: "钼 / 小金属", aliases: ["金钼", "金钼股份"] },
  { code: "601899", name: "紫金矿业", theme: "有色金属", note: "铜 / 黄金 / 资源", aliases: ["紫金", "紫金矿业"] },
  { code: "603993", name: "洛阳钼业", theme: "小金属", note: "钼 / 钴 / 铜", aliases: ["洛钼", "洛阳钼业"] }
];

const themeCoreMap = {
  "AI算力/服务器": [
    { code: "601138", name: "工业富联", role: "中军/龙头", type: "both", reason: "AI服务器整柜，容量和趋势代表板块持续性" },
    { code: "000977", name: "浪潮信息", role: "中军", type: "middle", reason: "服务器核心容量票，观察机构承接" },
    { code: "603019", name: "中科曙光", role: "核心", type: "core", reason: "算力基础设施核心观察" },
    { code: "002463", name: "沪电股份", role: "分支龙头", type: "leader", reason: "AI PCB 分支弹性核心" }
  ],
  "光模块/CPO": [
    { code: "002281", name: "光迅科技", role: "中军/龙头", type: "both", reason: "非创业板光器件/光模块核心" },
    { code: "603083", name: "剑桥科技", role: "弹性龙头", type: "leader", reason: "光模块弹性强，适合观察强弱切换" },
    { code: "000988", name: "华工科技", role: "核心", type: "core", reason: "光通信与激光设备双属性" }
  ],
  "HBM/存储": [
    { code: "603986", name: "兆易创新", role: "中军", type: "middle", reason: "存储芯片容量核心，观察周期和国产替代" },
    { code: "000021", name: "深科技", role: "核心", type: "core", reason: "存储封测和先进封装映射" },
    { code: "600667", name: "太极实业", role: "弹性龙头", type: "leader", reason: "封测和存储扩产分支弹性" }
  ],
  "半导体设备": [
    { code: "002371", name: "北方华创", role: "中军/龙头", type: "both", reason: "主板设备总龙头，决定设备线持续性" },
    { code: "603690", name: "至纯科技", role: "弹性龙头", type: "leader", reason: "清洗设备和高纯工艺系统" },
    { code: "600641", name: "万业企业", role: "分支核心", type: "core", reason: "离子注入设备分支观察" }
  ],
  "半导体材料": [
    { code: "002409", name: "雅克科技", role: "中军", type: "middle", reason: "半导体材料平台型容量票" },
    { code: "605358", name: "立昂微", role: "龙头", type: "leader", reason: "硅片和功率半导体弹性核心" },
    { code: "600378", name: "昊华科技", role: "分支核心", type: "core", reason: "电子特气和六氟化钨分支核心" }
  ],
  "先进封装": [
    { code: "600584", name: "长电科技", role: "中军", type: "middle", reason: "封测容量核心，观察先进封装持续性" },
    { code: "002156", name: "通富微电", role: "龙头", type: "leader", reason: "先进封装弹性核心" },
    { code: "002185", name: "华天科技", role: "核心", type: "core", reason: "封测分支跟踪" },
    { code: "002436", name: "兴森科技", role: "分支核心", type: "core", reason: "IC载板和封装基板观察" }
  ],
  "电子特气": [
    { code: "600378", name: "昊华科技", role: "中军/分支龙头", type: "both", reason: "电子特气和六氟化钨稀缺性核心" },
    { code: "002409", name: "雅克科技", role: "中军", type: "middle", reason: "电子材料和特气平台型核心" },
    { code: "002549", name: "凯美特气", role: "弹性龙头", type: "leader", reason: "稀有气体分支弹性观察" },
    { code: "002971", name: "和远气体", role: "高波动观察", type: "core", reason: "六氟化钨映射和定增博弈，必须按小市值高波动处理" }
  ],
  "面板/玻璃基板": [
    { code: "000725", name: "京东方A", role: "中军", type: "middle", reason: "面板容量核心，决定显示线持续性" },
    { code: "000100", name: "TCL科技", role: "龙头", type: "leader", reason: "面板弹性和效率核心" },
    { code: "600707", name: "彩虹股份", role: "分支核心", type: "core", reason: "玻璃基板分支弹性观察" }
  ],
  "功率半导体": [
    { code: "600703", name: "三安光电", role: "中军", type: "middle", reason: "化合物半导体和功率方向容量核心" },
    { code: "603290", name: "斯达半导", role: "龙头", type: "leader", reason: "IGBT 功率半导体核心" },
    { code: "600460", name: "士兰微", role: "核心", type: "core", reason: "IDM 和功率器件观察" },
    { code: "605111", name: "新洁能", role: "弹性核心", type: "core", reason: "功率器件弹性观察" }
  ],
  "光通信/海缆": [
    { code: "600522", name: "中天科技", role: "中军", type: "middle", reason: "海缆和光通信容量核心" },
    { code: "600487", name: "亨通光电", role: "龙头", type: "leader", reason: "光通信和海缆核心弹性" },
    { code: "601869", name: "长飞光纤", role: "分支核心", type: "core", reason: "光纤光缆核心观察" },
    { code: "600498", name: "烽火通信", role: "核心", type: "core", reason: "通信设备分支观察" }
  ],
  "风电设备": [
    { code: "002202", name: "金风科技", role: "中军/龙头", type: "both", reason: "风机整机容量核心，观察风电设备线持续性" },
    { code: "601615", name: "明阳智能", role: "整机核心", type: "core", reason: "风机整机和海上风电核心观察" },
    { code: "002487", name: "大金重工", role: "风塔龙头", type: "leader", reason: "风塔和海上风电弹性核心" },
    { code: "603606", name: "东方电缆", role: "海缆核心", type: "core", reason: "海上风电海缆分支核心" }
  ],
  "有色金属": [
    { code: "601899", name: "紫金矿业", role: "中军/龙头", type: "both", reason: "铜金矿资源龙头，容量和趋势代表资源线持续性" },
    { code: "600362", name: "江西铜业", role: "铜中军", type: "middle", reason: "铜资源和冶炼核心，观察铜价映射" },
    { code: "601600", name: "中国铝业", role: "铝中军", type: "middle", reason: "铝产业链容量核心，观察工业金属扩散" }
  ],
  "小金属": [
    { code: "000960", name: "锡业股份", role: "锡中军", type: "middle", reason: "锡资源容量核心，观察锡价、库存和电子制造需求" },
    { code: "600301", name: "华锡有色", role: "锡锑弹性", type: "leader", reason: "锡锑小金属弹性核心，适合观察资金进攻强度" },
    { code: "600549", name: "厦门钨业", role: "钨核心", type: "core", reason: "钨和硬质合金核心，观察制造业材料需求" },
    { code: "603993", name: "洛阳钼业", role: "钼钴平台", type: "core", reason: "钼钴铜资源平台，观察小金属与有色资源共振" },
    { code: "002155", name: "湖南黄金", role: "锑弹性", type: "leader", reason: "锑资源映射，名字带黄金但按小金属观察" },
    { code: "601958", name: "金钼股份", role: "钼核心", type: "core", reason: "钼资源核心，观察钼价和钢铁合金需求" },
    { code: "002428", name: "云南锗业", role: "锗弹性", type: "core", reason: "锗资源和红外/半导体材料映射" }
  ],
  "稀土永磁": [
    { code: "600111", name: "北方稀土", role: "中军/龙头", type: "both", reason: "稀土资源定价和容量核心" },
    { code: "000831", name: "中国稀土", role: "核心", type: "core", reason: "稀土资源整合核心，观察政策和供需映射" },
    { code: "600392", name: "盛和资源", role: "弹性龙头", type: "leader", reason: "稀土资源弹性观察" },
    { code: "000970", name: "中科三环", role: "永磁核心", type: "core", reason: "稀土永磁材料核心，观察下游扩散" }
  ],
  "煤炭能源": [
    { code: "601088", name: "中国神华", role: "中军", type: "middle", reason: "煤炭高股息容量核心，观察防御和资源偏好" },
    { code: "601225", name: "陕西煤业", role: "龙头", type: "leader", reason: "煤炭趋势弹性和分红核心" },
    { code: "600188", name: "兖矿能源", role: "弹性核心", type: "core", reason: "煤炭弹性观察，判断周期线强弱" },
    { code: "600028", name: "中国石化", role: "能源中军", type: "middle", reason: "石化能源容量核心，观察能源线扩散" }
  ]
};

let stocks = loadStocks();
let quotes = {};
let quoteFetchedAt = {};
let technicals = {};
let technicalFetchedAt = {};
let technicalStatus = {};
let valuations = {};
let valuationFetchedAt = {};
let valuationStatus = {};
let radarLastSnapshot = loadLastRadarSnapshot();
let radarItems = [];
let radarFetchedAt = radarLastSnapshot?.scanAt || radarLastSnapshot?.at || 0;
let radarUsingLastSnapshot = false;
let radarScanStats = null;
let marketState = null;
let marketFetchedAt = 0;
let themeState = {};
let themeFetchedAt = 0;
let settings = loadSettings();
let auctionSnapshots = loadAuctionSnapshots();
let ignoredRadarCodes = loadIgnoredRadarCodes();
let reviewLogs = loadReviewLogs();
let flowSnapshots = loadFlowSnapshots();
let signalSnapshots = loadSignalSnapshots();
let signalOutcomes = loadSignalOutcomes();
let signalActiveSetups = loadSignalActiveSetups();
let canonicalDecisionByCode = {};
let radarHistory = loadRadarHistory();
let themeHistory = loadThemeHistory();
let collapsedPanelIds = loadCollapsedPanels();
const uiState = loadUiState();
let activePage = uiState.activePage || "overview";
let activeMode = uiState.activeMode || "intraday";
let activeFilter = "all";
let editingCode = null;
let autoRefresh = true;
let autoTimer = null;
let countdownTimer = null;
let nextRefreshAt = null;
let isRefreshing = false;

radarItems = getStoredRadarItemsForDisplay();
radarUsingLastSnapshot = Boolean(radarItems.length);

const rowsEl = document.getElementById("stockRows");
const appNav = document.getElementById("appNav");
const modeSwitch = document.getElementById("modeSwitch");
const modeHint = document.getElementById("modeHint");
const dataHealthRows = document.getElementById("dataHealthRows");
const todayActionRows = document.getElementById("todayActionRows");
const todayActionPulse = document.getElementById("todayActionPulse");
const refreshBtn = document.getElementById("refreshBtn");
const autoToggleBtn = document.getElementById("autoToggleBtn");
const addOpenBtn = document.getElementById("addOpenBtn");
const settingsOpenBtn = document.getElementById("settingsOpenBtn");
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
const positionRiskRows = document.getElementById("positionRiskRows");
const positionRiskPulse = document.getElementById("positionRiskPulse");
const marketPulse = document.getElementById("marketPulse");
const versionPill = document.getElementById("versionPill");
const marketEnvPulse = document.getElementById("marketEnvPulse");
const marketStatePill = document.getElementById("marketStatePill");
const marketRows = document.getElementById("marketRows");
const macroLiquidityRows = document.getElementById("macroLiquidityRows");
const macroLiquidityPulse = document.getElementById("macroLiquidityPulse");
const flowPulse = document.getElementById("flowPulse");
const flowRows = document.getElementById("flowRows");
const flowTimelineRows = document.getElementById("flowTimelineRows");
const themePulse = document.getElementById("themePulse");
const themeRows = document.getElementById("themeRows");
const themeRankSummary = document.getElementById("themeRankSummary");
const themeHistoryRows = document.getElementById("themeHistoryRows");
const corePulse = document.getElementById("corePulse");
const coreRows = document.getElementById("coreRows");
const radarRows = document.getElementById("radarRows");
const radarHistoryRows = document.getElementById("radarHistoryRows");
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
const reviewStatsRows = document.getElementById("reviewStatsRows");
const reviewLogRows = document.getElementById("reviewLogRows");
const reviewLogHint = document.getElementById("reviewLogHint");
const signalAuditRows = document.getElementById("signalAuditRows");
const signalAuditPulse = document.getElementById("signalAuditPulse");
const signalAuditBreakdown = document.getElementById("signalAuditBreakdown");
const signalAuditForwardSummary = document.getElementById("signalAuditForwardSummary");
const reviewFrame = document.getElementById("reviewFrame");
const refreshSecondsInput = document.getElementById("refreshSecondsInput");
const marketCapInput = document.getElementById("marketCapInput");
const radarPagesInput = document.getElementById("radarPagesInput");
const radarLimitInput = document.getElementById("radarLimitInput");
const strongScoreInput = document.getElementById("strongScoreInput");
const accountCapitalInput = document.getElementById("accountCapitalInput");
const requireMarketInput = document.getElementById("requireMarketInput");
const saveSettingsBtn = document.getElementById("saveSettingsBtn");
const resetSettingsBtn = document.getElementById("resetSettingsBtn");

const fields = {
  code: document.getElementById("codeInput"),
  name: document.getElementById("nameInput"),
  cost: document.getElementById("costInput"),
  shares: document.getElementById("sharesInput"),
  legacySellableShares: document.getElementById("legacySellableInput"),
  todayBuyShares: document.getElementById("todayBuySharesInput"),
  todayBuyPrice: document.getElementById("todayBuyPriceInput"),
  todaySellShares: document.getElementById("todaySellSharesInput"),
  target: document.getElementById("targetInput"),
  stop: document.getElementById("stopInput"),
  group: document.getElementById("groupInput"),
  layer: document.getElementById("layerInput"),
  theme: document.getElementById("themeInput"),
  note: document.getElementById("noteInput"),
  planType: document.getElementById("planTypeInput"),
  entryDate: document.getElementById("entryDateInput"),
  maxLoss: document.getElementById("maxLossInput"),
  sellTiming: document.getElementById("sellTimingInput"),
  coreOnly: document.getElementById("coreOnlyInput"),
  riskBudgetConfirmed: document.getElementById("riskBudgetConfirmedInput")
};

versionPill.textContent = APP_VERSION;
syncSettingsForm();
setupModeSwitch();
setupAppNavigation();
setupCollapsiblePanels();
render();
refreshQuotes();
refreshMarket(true);
refreshThemes(true);
refreshRadar(true);
startAutoRefresh();

refreshBtn.addEventListener("click", () => refreshQuotes());
radarRefreshBtn.addEventListener("click", () => refreshRadar(true));
radarResetIgnoredBtn.addEventListener("click", resetIgnoredRadar);
radarRows.addEventListener("click", handleRadarClick);
coreRows.addEventListener("click", handleCoreClick);
document.addEventListener("click", (event) => {
  const shortcut = event.target.closest("[data-page-shortcut]");
  if (shortcut) setActivePage(shortcut.dataset.pageShortcut);
});
auctionClearBtn.addEventListener("click", clearTodayAuction);
syncCopyBtn.addEventListener("click", copySyncText);
syncExportBtn.addEventListener("click", exportSyncFile);
syncImportInput.addEventListener("change", importSyncFile);
manualLogBtn.addEventListener("click", addManualReviewLog);
clearLogBtn.addEventListener("click", clearReviewLogs);
signalAuditRows.addEventListener("click", handleSignalAuditClick);
document.querySelectorAll("[data-error-template]").forEach((button) => {
  button.addEventListener("click", () => fillErrorReviewTemplate(button.dataset.errorTemplate));
});
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
settingsOpenBtn.addEventListener("click", () => setActivePage("settings"));
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
fields.group.addEventListener("change", () => {
  if (fields.group.value === "holding") fields.layer.value = "normal";
});
window.addEventListener("message", handleReviewHoldingSync);
reviewFrame?.addEventListener("load", syncReviewContext);
resetSeedBtn.addEventListener("click", () => {
  stocks = structuredClone(seedStocks);
  quotes = {};
  technicals = {};
  technicalFetchedAt = {};
  technicalStatus = {};
  valuations = {};
  valuationFetchedAt = {};
  valuationStatus = {};
  radarItems = [];
  radarFetchedAt = 0;
  signalActiveSetups = {};
  saveSignalActiveSetups();
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

  const todayBuyShares = Math.floor(Number(fields.todayBuyShares.value) || 0);
  const todayBuyPrice = Number(fields.todayBuyPrice.value);
  const todaySellShares = Math.floor(Number(fields.todaySellShares.value) || 0);
  if (todayBuyShares && (todayBuyShares % 100 !== 0 || !Number.isFinite(todayBuyPrice) || todayBuyPrice <= 0)) {
    setLookupHint("今日买入批次需要填写有效买价，股数按100股整数倍录入。", "warn");
    fields.todayBuyShares.focus();
    return;
  }
  if (submitButton) submitButton.disabled = true;
  try {
    setLookupHint("正在拉取行情名称...", "");

    const code = resolved.code;
    const previous = stocks.find((stock) => stock.code === (editingCode || code));
    let lots = Array.isArray(previous?.lots) ? previous.lots.map((lot) => ({ ...lot })) : [];
    let shares = Math.max(0, Math.floor(Number(fields.shares.value) || 0));
    let cost = toNumberOrBlank(fields.cost.value);
    let legacySellableShares = toNumberOrBlank(fields.legacySellableShares.value);

    if (todayBuyShares) {
      const baseShares = shares;
      const previousCost = Number(cost) || 0;
      shares += todayBuyShares;
      cost = baseShares && previousCost
        ? Number(((baseShares * previousCost + todayBuyShares * todayBuyPrice) / shares).toFixed(4))
        : todayBuyPrice;
      lots.push({ buyDate: getLocalDateKey(), shares: todayBuyShares, price: todayBuyPrice });
    }

    if (todaySellShares) {
      const sale = tradeRules.consumeSellFromLots(lots, todaySellShares, getLocalDateKey(), legacySellableShares, shares);
      if (!sale.allowed) {
        const available = tradeRules.getLotAvailability(lots, getLocalDateKey(), legacySellableShares, shares);
        setLookupHint(available.unknown
          ? "旧仓批次仍有未核对部分。先填写历史仓位可卖股数，保存后再登记卖出。"
          : `T+1可卖上限为${available.availableShares || 0}股，不能登记卖出${todaySellShares}股。`, "warn");
        return;
      }
      lots = sale.lots;
      legacySellableShares = sale.legacyAvailableShares ?? "";
      shares = Math.max(0, shares - todaySellShares);
    }

    const item = {
      code,
      name: fields.name.value.trim() || resolved.name || code,
      cost,
      shares: shares || "",
      lots,
      legacySellableShares,
      target: toNumberOrBlank(fields.target.value),
      stop: toNumberOrBlank(fields.stop.value),
      group: fields.group.value,
      layer: fields.group.value === "holding" ? "normal" : fields.layer.value,
      theme: fields.theme.value || resolved.theme || "其他",
      note: fields.note.value.trim() || resolved.note || "",
      entryDate: fields.entryDate.value || "",
      plan: normalizeTradePlan({
        type: fields.planType.value,
        maxLoss: fields.maxLoss.value,
        sellTiming: fields.sellTiming.value,
        coreOnly: fields.coreOnly.checked,
        riskBudgetConfirmed: fields.riskBudgetConfirmed.checked
      })
    };
    item.reviewSyncInitialized = true;
    item.reviewSyncBase = {
      shares: Number(item.shares) || 0,
      cost: Number(item.cost) || 0,
      lots: item.lots.map((lot) => ({ ...lot })),
      legacyAvailableShares: item.legacySellableShares
    };
    item.reviewBaselineTradeIds = getStoredReviewIds("stock-review-trades-v1", code);
    const failedReviewSellIds = new Set(previous?.reviewFailedSellIds || []);
    item.reviewBaselineSellIds = getStoredReviewIds("stock-review-sells-v1", code, { excludeIds: failedReviewSellIds });
    item.reviewFailedSellIds = [...failedReviewSellIds];
    item.reviewSyncError = previous?.reviewSyncError || "";
    item.theme = normalizeTheme(item.theme, item.name, item.note);

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
        delete technicalStatus[editingCode];
        delete valuations[editingCode];
        delete valuationFetchedAt[editingCode];
        delete valuationStatus[editingCode];
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
    delete signalActiveSetups[code];
    saveSignalActiveSetups();
    delete quotes[code];
    delete technicals[code];
    delete technicalFetchedAt[code];
    delete technicalStatus[code];
    delete valuations[code];
    delete valuationFetchedAt[code];
    delete valuationStatus[code];
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
    renderCapitalFlows();
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
    layer: group === "holding" ? "normal" : "core",
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
          layer: group === "holding" ? "normal" : normalizeWatchLayer(normalized.layer || "core", normalized.group),
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

function handleCoreClick(event) {
  const button = event.target.closest("button[data-action='core-add-watch']");
  if (!button || button.disabled) return;

  const code = button.dataset.code;
  const theme = button.dataset.theme || "";
  const item = getThemeCoreCandidates(theme).find((candidate) => candidate.code === code) || getStockCoreRole(code, theme);
  if (!item) return;
  addCoreItemToWatch(item, theme || item.theme || "其他");
}

function addCoreItemToWatch(item, theme = "其他") {
  const exists = stocks.some((stock) => stock.code === item.code);
  const next = normalizeStock({
    code: item.code,
    name: item.name,
    cost: "",
    target: "",
    stop: "",
    group: "watch",
    layer: "core",
    theme,
    note: `${item.role || "核心池"} / ${item.reason || "中军龙头观察"}`
  });

  stocks = exists
    ? stocks.map((stock) => {
        if (stock.code !== item.code) return stock;
        const normalized = normalizeStock(stock);
        return {
          ...normalized,
          name: normalized.name || item.name,
          layer: normalizeWatchLayer(normalized.layer || "core", normalized.group),
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
  if (!autoRefresh) return;
  restartAutoRefresh();
  if (!document.hidden) refreshQuotes();
});

function handleReviewHoldingSync(event) {
  const data = event?.data;
  if (reviewFrame?.contentWindow && event.source !== reviewFrame.contentWindow) return;
  if (!data) return;
  if (data.type === "stock-review-ready") {
    syncReviewContext();
    return;
  }
  if (data.type === "stock-review-fees-sync") {
    settings = { ...settings, fees: tradeRules.normalizeFeeSettings(data.fees) };
    saveSettings();
    render();
    return;
  }
  if (data.type !== "stock-review-holding-sync") return;
  stocks = loadStocks();
  saveStocks();
  render();
  const changed = stocks.find((stock) => stock.code === data.code);
  if (changed) refreshQuotes([changed], true);
}

function loadStocks() {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY));
    const loaded = Array.isArray(stored) && stored.length ? stored.map(normalizeStock) : structuredClone(seedStocks);
    return applyWatchMigrations(loaded);
  } catch {
    return applyWatchMigrations(structuredClone(seedStocks));
  }
}

function applyWatchMigrations(list) {
  const normalized = list.map(normalizeStock);
  let migrated = [];
  try {
    const stored = JSON.parse(localStorage.getItem(WATCH_MIGRATION_STORAGE_KEY));
    migrated = Array.isArray(stored) ? stored.map(String) : [];
  } catch {
    migrated = [];
  }

  const done = new Set(migrated);
  const next = [...normalized];
  let changed = false;

  watchMigrationStocks.forEach((stock) => {
    const key = `add-${stock.code}`;
    if (done.has(key)) return;
    if (!next.some((item) => item.code === stock.code)) {
      next.push(normalizeStock(stock));
      changed = true;
    }
    done.add(key);
  });

  if (changed) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }
  if (done.size !== migrated.length) {
    localStorage.setItem(WATCH_MIGRATION_STORAGE_KEY, JSON.stringify([...done]));
  }

  return next;
}

function loadSettings() {
  try {
    const stored = JSON.parse(localStorage.getItem(CONFIG_STORAGE_KEY));
    return { ...defaultSettings, ...(stored || {}), fees: tradeRules.normalizeFeeSettings(stored?.fees) };
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

function loadFlowSnapshots() {
  try {
    const stored = JSON.parse(localStorage.getItem(FLOW_SNAPSHOT_STORAGE_KEY));
    return stored && typeof stored === "object" ? stored : {};
  } catch {
    return {};
  }
}

function loadSignalSnapshots() {
  try {
    const stored = JSON.parse(localStorage.getItem(SIGNAL_SNAPSHOT_STORAGE_KEY));
    return Array.isArray(stored) ? stored.slice(-500) : [];
  } catch {
    return [];
  }
}

function loadSignalOutcomes() {
  try {
    const stored = JSON.parse(localStorage.getItem(SIGNAL_OUTCOME_STORAGE_KEY));
    return Array.isArray(stored) ? stored.slice(-1200) : [];
  } catch {
    return [];
  }
}

function loadSignalActiveSetups() {
  try {
    const stored = JSON.parse(localStorage.getItem(SIGNAL_ACTIVE_STORAGE_KEY));
    return stored && typeof stored === "object" ? stored : {};
  } catch {
    return {};
  }
}

function loadRadarHistory() {
  try {
    const stored = JSON.parse(localStorage.getItem(RADAR_HISTORY_STORAGE_KEY));
    return stored && typeof stored === "object" ? stored : {};
  } catch {
    return {};
  }
}

function loadLastRadarSnapshot() {
  try {
    const stored = JSON.parse(localStorage.getItem(RADAR_LAST_STORAGE_KEY));
    if (!stored || typeof stored !== "object" || !Array.isArray(stored.items)) return null;
    return {
      at: Number(stored.at) || 0,
      scanAt: Number(stored.scanAt) || Number(stored.at) || 0,
      reason: stored.reason || "",
      stats: stored.stats && typeof stored.stats === "object" ? stored.stats : null,
      items: stored.items.map(normalizeCachedRadarItem).filter(Boolean).slice(0, 60)
    };
  } catch {
    return null;
  }
}

function loadThemeHistory() {
  try {
    const stored = JSON.parse(localStorage.getItem(THEME_HISTORY_STORAGE_KEY));
    return stored && typeof stored === "object" ? stored : {};
  } catch {
    return {};
  }
}

function loadCollapsedPanels() {
  try {
    const stored = JSON.parse(localStorage.getItem(COLLAPSE_STORAGE_KEY));
    return new Set(Array.isArray(stored) ? stored.map(String) : []);
  } catch {
    return new Set();
  }
}

function loadUiState() {
  try {
    const stored = JSON.parse(localStorage.getItem(UI_STORAGE_KEY));
    return stored && typeof stored === "object" ? stored : {};
  } catch {
    return {};
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

function saveFlowSnapshots() {
  localStorage.setItem(FLOW_SNAPSHOT_STORAGE_KEY, JSON.stringify(flowSnapshots));
}

function saveSignalSnapshots() {
  localStorage.setItem(SIGNAL_SNAPSHOT_STORAGE_KEY, JSON.stringify(signalSnapshots.slice(-500)));
}

function saveSignalOutcomes() {
  localStorage.setItem(SIGNAL_OUTCOME_STORAGE_KEY, JSON.stringify(signalOutcomes.slice(-1200)));
}

function saveSignalActiveSetups() {
  localStorage.setItem(SIGNAL_ACTIVE_STORAGE_KEY, JSON.stringify(signalActiveSetups));
}

function saveRadarHistory() {
  localStorage.setItem(RADAR_HISTORY_STORAGE_KEY, JSON.stringify(radarHistory));
}

function saveLastRadarSnapshot() {
  if (!radarLastSnapshot?.items?.length) return;
  localStorage.setItem(RADAR_LAST_STORAGE_KEY, JSON.stringify(radarLastSnapshot));
}

function saveThemeHistory() {
  localStorage.setItem(THEME_HISTORY_STORAGE_KEY, JSON.stringify(themeHistory));
}

function saveCollapsedPanels() {
  localStorage.setItem(COLLAPSE_STORAGE_KEY, JSON.stringify([...collapsedPanelIds]));
}

function saveUiState() {
  localStorage.setItem(UI_STORAGE_KEY, JSON.stringify({ activePage, activeMode }));
}

function setupAppNavigation() {
  if (!appNav) return;
  const buttons = [...appNav.querySelectorAll("[data-page-target]")];
  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      setActivePage(button.dataset.pageTarget || "overview");
    });
  });
  applyActivePage();
}

function setupModeSwitch() {
  if (!modeSwitch) return;
  modeSwitch.querySelectorAll("[data-mode-target]").forEach((button) => {
    button.addEventListener("click", () => setActiveMode(button.dataset.modeTarget || "intraday", true));
  });
  applyActiveMode();
}

function setActiveMode(mode, jumpToModePage = false) {
  activeMode = ["intraday", "afterclose", "full"].includes(mode) ? mode : "intraday";
  if (jumpToModePage) {
    if (activeMode === "intraday") activePage = "overview";
    if (activeMode === "afterclose") activePage = "review";
    if (activeMode === "full") activePage = "watch";
  }
  saveUiState();
  applyActiveMode();
  applyActivePage();
  render();
}

function applyActiveMode() {
  document.body.dataset.workMode = activeMode;
  if (modeSwitch) {
    modeSwitch.querySelectorAll("[data-mode-target]").forEach((button) => {
      button.classList.toggle("active", button.dataset.modeTarget === activeMode);
    });
  }
  if (modeHint) {
    const hints = {
      intraday: "盘中优先看市场、资金和今日行动。",
      afterclose: "盘后优先看K线、买卖标记和复盘笔记。",
      full: "完整模式保留全部细节，适合调整规则和检查自选。"
    };
    modeHint.textContent = hints[activeMode] || hints.intraday;
  }
}

function setActivePage(page) {
  activePage = page || "overview";
  saveUiState();
  applyActivePage();
  render();
}

function applyActivePage() {
  if (activePage === "logs") activePage = "review";
  const allowedPages = new Set(["overview", "watch", "mainline", "radar", "review", "logs", "settings"]);
  if (!allowedPages.has(activePage)) activePage = "overview";
  document.body.dataset.activePage = activePage;

  if (appNav) {
    appNav.querySelectorAll("[data-page-target]").forEach((button) => {
      button.classList.toggle("active", button.dataset.pageTarget === activePage);
    });
  }

  document.querySelectorAll("[data-app-page]").forEach((element) => {
    const pages = String(element.dataset.appPage || "").split(/\s+/).filter(Boolean);
    element.hidden = !pages.includes(activePage);
  });

  document.querySelectorAll(".page-cluster").forEach((cluster) => {
    const visibleChild = [...cluster.querySelectorAll("[data-app-page]")].some((child) => !child.hidden);
    cluster.classList.toggle("page-cluster-empty", !visibleChild);
  });
}

function setupCollapsiblePanels() {
  getCollapsiblePanels().forEach((panel) => {
    const id = panel.dataset.collapseId;
    const head = [...panel.children].find((child) => child.classList?.contains("panel-head"));
    if (!id || !head || head.querySelector(".panel-collapse-button")) return;

    const button = document.createElement("button");
    button.type = "button";
    button.className = "panel-collapse-button";
    button.dataset.collapseTarget = id;
    button.addEventListener("click", () => setPanelCollapsed(id, !collapsedPanelIds.has(id)));
    head.appendChild(button);
    applyPanelCollapsedState(panel, collapsedPanelIds.has(id));
  });
}

function getCollapsiblePanels() {
  return [...document.querySelectorAll("[data-collapse-id]")];
}

function setPanelCollapsed(id, collapsed) {
  const panel = document.querySelector(`[data-collapse-id="${id}"]`);
  if (!panel) return;
  if (collapsed) collapsedPanelIds.add(id);
  else collapsedPanelIds.delete(id);
  applyPanelCollapsedState(panel, collapsed);
  saveCollapsedPanels();
}

function setAllPanelsCollapsed(collapsed) {
  const panels = getCollapsiblePanels();
  collapsedPanelIds = new Set(collapsed ? panels.map((panel) => panel.dataset.collapseId).filter(Boolean) : []);
  panels.forEach((panel) => applyPanelCollapsedState(panel, collapsed));
  saveCollapsedPanels();
}

function applyPanelCollapsedState(panel, collapsed) {
  panel.classList.toggle("collapsed", collapsed);
  const button = panel.querySelector(".panel-collapse-button");
  if (!button) return;
  button.textContent = collapsed ? "展开" : "收起";
  button.title = collapsed ? "展开模块" : "收起模块";
  button.setAttribute("aria-expanded", String(!collapsed));
}

function syncSettingsForm() {
  refreshSecondsInput.value = settings.refreshSeconds;
  marketCapInput.value = settings.minMarketCapYi;
  radarPagesInput.value = settings.radarPages;
  radarLimitInput.value = settings.radarLimit;
  strongScoreInput.value = settings.strongScore;
  if (accountCapitalInput) accountCapitalInput.value = settings.accountCapital;
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
    accountCapital: clamp(Number(accountCapitalInput?.value) || defaultSettings.accountCapital, 10000, 10000000),
    fees: tradeRules.normalizeFeeSettings(settings.fees),
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
    const theme = normalizeTheme(stock.theme, name, note, current?.theme);
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
  const plan = normalizeTradePlan(normalized?.plan);
  editingCode = normalized?.code || null;
  dialogTitle.textContent = editingCode ? "编辑自选" : "新增自选";
  fields.code.value = normalized?.code || "";
  fields.name.value = normalized?.name || "";
  fields.cost.value = normalized?.cost || "";
  fields.shares.value = normalized?.shares || "";
  fields.legacySellableShares.value = normalized?.legacySellableShares ?? "";
  fields.todayBuyShares.value = "";
  fields.todayBuyPrice.value = "";
  fields.todaySellShares.value = "";
  fields.target.value = normalized?.target || "";
  fields.stop.value = normalized?.stop || "";
  fields.group.value = normalized?.group || "holding";
  fields.layer.value = normalizeWatchLayer(normalized?.layer, normalized?.group);
  fields.theme.value = normalized?.theme || "其他";
  fields.note.value = normalized?.note || "";
  fields.entryDate.value = normalized?.entryDate || "";
  fields.planType.value = plan.type;
  fields.maxLoss.value = plan.maxLoss || "";
  fields.sellTiming.value = plan.sellTiming;
  fields.coreOnly.checked = plan.coreOnly;
  fields.riskBudgetConfirmed.checked = plan.riskBudgetConfirmed;
  setLookupHint();
  dialog.showModal();
  fields.code.focus();
}

function render() {
  canonicalDecisionByCode = {};
  const analyzed = stocks
    .map((stock, index) => {
      const normalized = normalizeStock(stock);
      const quote = quotes[normalized.code];
      const technical = technicals[normalized.code];
      const analysis = analyzeStock(normalized, quote, technical);
      const strengthGates = getStrengthGates(normalized, quote, analysis);
      const buyLights = getBuyLights(normalized, quote, technical, analysis);
      const support = getSupportCheck(normalized, quote, technical, analysis);
      const dynamicStop = getDynamicStopPlan(normalized, quote, technical, analysis, support);
      const structureStop = getStructureStopPlan(normalized, quote, technical, analysis, support, dynamicStop);
      const sellGrade = getSellGrade(normalized, quote, technical, analysis, support, dynamicStop, structureStop);
      const decision = getCanonicalDecision(normalized, quote, technical, analysis, strengthGates, buyLights, sellGrade, structureStop);
      canonicalDecisionByCode[normalized.code] = decision;
      captureConfirmedSignalSnapshot(normalized, quote, technical, analysis, strengthGates, buyLights, decision);
      return { stock: normalized, analysis, decision, sortMeta: getWatchSortMeta(normalized, analysis, index, sellGrade, decision) };
    });
  const visible = analyzed
    .filter((item) => watchFilterMatches(item))
    .sort(compareWatchItems)
    .map((item) => item.stock);

  if (!visible.length) {
    rowsEl.innerHTML = `<div class="empty">暂无自选</div>`;
  } else {
    rowsEl.innerHTML = visible.map(renderRow).join("");
  }

  updateMetrics();
  renderDataHealth();
  renderTodayActions();
  renderPositionRiskOverview();
  renderMarket();
  renderMacroLiquidity();
  renderThemes();
  renderThemeHistory();
  renderCoreRoles();
  renderRadar();
  renderRadarHistory();
  renderThemeRadar();
  renderCapitalFlows();
  renderAuction();
  renderReviewModule();
  syncReviewContext();
}

function watchFilterMatches(item) {
  const { stock, analysis, sortMeta } = item;
  if (activeFilter === "all") return true;
  if (activeFilter === "focus") return sortMeta.bucket <= 3;
  if (activeFilter === "alert") return isWatchAlert(analysis);
  if (activeFilter === "core") return stock.group !== "holding" && stock.layer === "core";
  if (activeFilter === "temp") return stock.group !== "holding" && stock.layer === "temp";
  if (activeFilter === "retired") return stock.group !== "holding" && stock.layer === "retired";
  return stock.group === activeFilter;
}

function getWatchSortMeta(stock, analysis, index, sellGrade = null, decision = null) {
  const holding = stock.group === "holding";
  const urgentSell = holding && (
    sellGrade?.grade === "clear" ||
    sellGrade?.grade === "reduce" ||
    sellGrade?.action === "等收盘确认"
  );
  const confirmedBuy = decision?.state === "confirmed";
  const rank = tradeRules.getWatchRank({
    retired: stock.layer === "retired",
    urgentSell,
    confirmedBuy,
    holding,
    score: analysis.score
  });
  const labels = ["风险处置", "确认买点", "高分观察", "持仓", "低分观察", "已淘汰"];
  return { rank, bucket: rank, label: labels[rank], index };
}

function compareWatchItems(a, b) {
  return tradeRules.compareWatchItems(a, b);
}

function isWatchAlert(analysis) {
  return analysis.risk.level !== "ok" || analysis.action.level === "warn" || analysis.point.side === "卖点";
}

function renderTodayActions() {
  if (!todayActionRows) return;
  const items = stocks
    .map(normalizeStock)
    .map((stock, index) => getTodayActionItem(stock, index))
    .sort(compareTodayActionItems);

  const must = items.filter((item) => item.bucket === "must").slice(0, 6);
  const focus = items.filter((item) => item.bucket === "focus").slice(0, 6);
  const wait = items.filter((item) => item.bucket === "wait").slice(0, 6);
  const forbidden = getForbiddenActions(items).slice(0, 6);
  const buyCount = focus.filter((item) => item.buyGate.level === "buy").length;

  if (todayActionPulse) {
    todayActionPulse.textContent = `${must.length}个必须处理 · ${focus.length}个重点盯 · ${buyCount}个纪律通过候选 · ${forbidden.length}条禁令`;
  }

  todayActionRows.innerHTML = [
    renderActionColumn("必须处理", "先守本金", must, "danger", "没有卖点/硬止损提醒"),
    renderActionColumn("重点盯", "等买点确认", focus, "hot", "暂无严格买点候选"),
    renderActionColumn("少动等待", "别乱切换", wait, "wait", "其他自选都已隐藏在自选页"),
    renderForbiddenColumn("今日禁止操作", "纪律优先", forbidden, "暂时没有硬性禁令")
  ].join("");
}

function getTodayActionItem(stock, index) {
  const quote = quotes[stock.code];
  const technical = technicals[stock.code];
  const valuation = getValuationTemperature(stock, valuations[stock.code]);
  const analysis = analyzeStock(stock, quote, technical);
  const strengthGates = getStrengthGates(stock, quote, analysis);
  const buyGate = getBuyGate(stock, quote, technical, analysis);
  const support = getSupportCheck(stock, quote, technical, analysis);
  const dynamicStop = getDynamicStopPlan(stock, quote, technical, analysis, support);
  const structureStop = getStructureStopPlan(stock, quote, technical, analysis, support, dynamicStop);
  const sellGrade = getSellGrade(stock, quote, technical, analysis, support, dynamicStop, structureStop);
  const buyLights = getBuyLights(stock, quote, technical, analysis);
  const decision = getCanonicalDecision(stock, quote, technical, analysis, strengthGates, buyLights, sellGrade, structureStop);
  const livermore = getLivermoreKey(stock, quote, technical, analysis, support, sellGrade, buyGate);
  const planCheck = getTradePlanCheck(stock, quote, analysis, getStockCoreRole(stock.code, stock.theme), dynamicStop, structureStop);
  const brief = getTradeBrief(stock, quote, technical, analysis, buyGate);
  const klineStatus = getKlineStatus(quote, technical);
  const position = getStockPosition(stock);
  const bucket = getTodayActionBucket(stock, analysis, buyGate, sellGrade, dynamicStop, support, livermore);
  const priority = getTodayActionPriority(bucket, stock, analysis, buyGate, sellGrade, dynamicStop, livermore);
  return { stock, quote, technical, valuation, strengthGates, analysis, buyGate, decision, support, dynamicStop, sellGrade, livermore, planCheck, brief, klineStatus, position, bucket, priority, index };
}

function getTodayActionBucket(stock, analysis, buyGate, sellGrade, dynamicStop, support, livermore) {
  const holding = stock.group === "holding";
  if (stock.group !== "holding" && stock.layer === "retired") return "wait";
  if (
    holding &&
    (sellGrade.grade === "clear" ||
      sellGrade.grade === "reduce" ||
      dynamicStop.level === "danger" ||
      support.level === "danger" ||
      livermore?.level === "danger" ||
      analysis.point.side === "卖点")
  ) {
    return "must";
  }
  if (
    livermore?.level === "buy" ||
    buyGate.level === "buy" ||
    analysis.point.side === "买点" ||
    analysis.score >= settings.strongScore ||
    (analysis.score >= 70 && analysis.themeStrength >= 4)
  ) {
    return "focus";
  }
  return "wait";
}

function getForbiddenActions(items) {
  return items.map((item) => {
    const { stock, analysis, buyGate, sellGrade, dynamicStop, livermore, strengthGates } = item;
    const planStatus = getPlanStatus(stock, item.quote, analysis, item.planCheck, dynamicStop, sellGrade);

    if (stock.group !== "holding" && stock.layer === "retired") {
      return {
        stock,
        level: "danger",
        title: "禁止追回",
        detail: "已淘汰只保留复盘，不再因为盘中拉升临时买回。"
      };
    }

    if (analysis.dataQuality?.blockBuy || item.decision?.dataGate?.state !== "pass") {
      return {
        stock,
        level: "warn",
        title: "禁止确认买点",
        detail: item.decision?.dataGate?.reason || "行情或K线不完整，任何买点都只能算观察。"
      };
    }

    if (planStatus.label === "无计划") {
      return {
        stock,
        level: "danger",
        title: stock.group === "holding" ? "禁止加仓" : "禁止开仓",
        detail: "缺成本、止损或交易计划，先补计划再谈动作。"
      };
    }

    if (sellGrade.grade === "forbid") {
      return {
        stock,
        level: "warn",
        title: "禁止低位情绪卖",
        detail: sellGrade.action || "没有破计划时，不因为盘中急跌一键清仓。"
      };
    }

    if (buyGate.label === "三闸门未开") {
      return {
        stock,
        level: "warn",
        title: stock.group === "holding" ? "禁止随手补仓" : "禁止开仓",
        detail: `${strengthGates?.failedLabels?.slice(0, 3).join("、") || "三闸门未开"}；三闸门不开，六灯只作观察。`
      };
    }

    if (livermore?.level === "danger") {
      return {
        stock,
        level: "danger",
        title: stock.group === "holding" ? "禁止故事硬扛" : "禁止接飞刀",
        detail: livermore.action || "已经落入下降趋势/破位状态，先等重新站回关键线。"
      };
    }

    if (livermore?.forbidAdd) {
      return {
        stock,
        level: "warn",
        title: stock.group === "holding" ? "禁止亏损加仓" : "禁止追反弹",
        detail: livermore.action || "亏损仓不补，反弹也要等三点突破确认。"
      };
    }

    if (buyGate.level !== "buy" && analysis.score < settings.strongScore && stock.layer !== "retired") {
      return {
        stock,
        level: "warn",
        title: stock.group === "holding" ? "禁止随手补仓" : "禁止追买",
        detail: "六灯和得分没有同时过线，等主线、K线、量能、风控重新确认。"
      };
    }

    return null;
  }).filter(Boolean);
}

function getTodayActionPriority(bucket, stock, analysis, buyGate, sellGrade, dynamicStop, livermore) {
  const bucketScore = bucket === "must" ? 0 : bucket === "focus" ? 1 : 2;
  let urgency = 0;
  if (sellGrade.grade === "clear") urgency += 80;
  if (sellGrade.grade === "reduce") urgency += 50;
  if (dynamicStop.level === "danger") urgency += 45;
  if (livermore?.level === "danger") urgency += 58;
  if (livermore?.level === "buy") urgency += 36;
  if (livermore?.label === "自然回撤") urgency += 12;
  if (buyGate.level === "buy") urgency += 38;
  if (stock.group === "holding") urgency += 12;
  urgency += Math.min(analysis.score, 100) / 4;
  return { bucketScore, urgency };
}

function compareTodayActionItems(a, b) {
  if (a.priority.bucketScore !== b.priority.bucketScore) return a.priority.bucketScore - b.priority.bucketScore;
  if (b.priority.urgency !== a.priority.urgency) return b.priority.urgency - a.priority.urgency;
  return a.index - b.index;
}

function renderActionColumn(title, subtitle, items, tone, emptyText) {
  return `
    <section class="action-column ${tone}">
      <div class="action-column-head">
        <div>
          <strong>${escapeHtml(title)}</strong>
          <span>${escapeHtml(subtitle)}</span>
        </div>
        <b>${items.length}</b>
      </div>
      <div class="action-list">
        ${items.length ? items.map(renderActionCard).join("") : `<div class="empty compact">${escapeHtml(emptyText)}</div>`}
      </div>
    </section>
  `;
}

function renderForbiddenColumn(title, subtitle, items, emptyText) {
  return `
    <section class="action-column forbid">
      <div class="action-column-head">
        <div>
          <strong>${escapeHtml(title)}</strong>
          <span>${escapeHtml(subtitle)}</span>
        </div>
        <b>${items.length}</b>
      </div>
      <div class="action-list">
        ${items.length ? items.map(renderForbiddenCard).join("") : `<div class="empty compact">${escapeHtml(emptyText)}</div>`}
      </div>
    </section>
  `;
}

function renderForbiddenCard(item) {
  return `
    <article class="action-card forbid ${item.level}">
      <div class="action-card-head">
        <div>
          <strong>${escapeHtml(item.stock.name)}</strong>
          <span>${item.stock.code} · ${escapeHtml(getWatchLayerLabel(item.stock))}</span>
        </div>
        <b>${escapeHtml(item.title)}</b>
      </div>
      <p>${escapeHtml(item.detail)}</p>
    </article>
  `;
}

function renderActionCard(item) {
  const { stock, quote, analysis, buyGate, sellGrade, livermore, valuation, strengthGates, brief, klineStatus, position } = item;
  const changeClass = quote ? getChangeClass(quote.changePercent) : "flat";
  const priceText = quote?.price ? `${formatMoney(quote.price)} · ${signed(quote.changePercent)}%` : "待行情";
  const mainLine = item.decision?.label || "数据待齐";
  const actionText = item.bucket === "must" ? brief.sell : item.bucket === "focus" ? brief.buy : brief.watch;
  return `
    <article class="action-card ${item.bucket}">
      <div class="action-card-head">
        <div>
          <strong>${escapeHtml(stock.name)}</strong>
          <span>${stock.code} · ${escapeHtml(position.primary || stock.theme)}</span>
        </div>
        <b class="${changeClass}">${priceText}</b>
      </div>
      <div class="action-tags">
        <span class="score-pill ${analysis.scoreClass}">${analysis.score}</span>
        <span>${escapeHtml(mainLine)}</span>
        <span>${escapeHtml(strengthGates?.label || "三闸门待算")}</span>
        <span>K线 ${escapeHtml(klineStatus.label)}</span>
        <span>纪律 ${escapeHtml(livermore?.label || "待确认")}</span>
        <span>估值 ${escapeHtml(valuation?.label || "待取")}</span>
      </div>
      <p>${escapeHtml(actionText)}</p>
    </article>
  `;
}

function renderRow(stock) {
  const quote = quotes[stock.code];
  const technical = technicals[stock.code];
  const valuationTemp = getValuationTemperature(stock, valuations[stock.code]);
  const analysis = analyzeStock(stock, quote, technical);
  const strengthGates = getStrengthGates(stock, quote, analysis);
  const price = quote?.price;
  const changeClass = quote ? getChangeClass(quote.changePercent) : "flat";
  const cost = Number(stock.cost);
  const netPnl = price && cost ? getStockNetPnl(stock, price) : null;
  const pnl = netPnl ? netPnl.pnlPct : null;
  const pnlClass = pnl === null ? "flat" : getChangeClass(pnl);
  const costText = cost ? `成本 ${formatMoney(cost)}` : "未设成本";
  const targetText = stock.target ? `目标 ${formatMoney(stock.target)}` : "未设目标";
  const stopText = stock.stop ? `止损 ${formatMoney(stock.stop)}` : "未设止损";
  const discipline = getDiscipline(analysis);
  const klineStatus = getKlineStatus(quote, technical);
  const buyGate = getBuyGate(stock, quote, technical, analysis);
  const buyLights = getBuyLights(stock, quote, technical, analysis);
  const dataQuality = analysis.dataQuality;
  const tradeBrief = getTradeBrief(stock, quote, technical, analysis, buyGate);
  const coreRole = getStockCoreRole(stock.code, stock.theme);
  const leadingTheme = getLeadingThemes(1)[0];
  const isLeadingCore = coreRole && leadingTheme?.theme === coreRole.theme && leadingTheme?.rankLabel !== "静态核心";
  const position = getStockPosition(stock);
  const supportCheck = getSupportCheck(stock, quote, technical, analysis);
  const dynamicStop = getDynamicStopPlan(stock, quote, technical, analysis, supportCheck);
  const structureStop = getStructureStopPlan(stock, quote, technical, analysis, supportCheck, dynamicStop);
  const planCheck = getTradePlanCheck(stock, quote, analysis, coreRole, dynamicStop, structureStop);
  const scaleInPlan = getScaleInPlan(stock, quote, technical, analysis, buyGate, buyLights, structureStop, planCheck, supportCheck);
  const sellGrade = getSellGrade(stock, quote, technical, analysis, supportCheck, dynamicStop, structureStop);
  const decision = getCanonicalDecision(stock, quote, technical, analysis, strengthGates, buyLights, sellGrade, structureStop);
  const livermoreKey = getLivermoreKey(stock, quote, technical, analysis, supportCheck, sellGrade, buyGate);
  const planStatus = getPlanStatus(stock, quote, analysis, planCheck, dynamicStop, sellGrade);
  const preBuyCheck = getPreBuyCheck(stock, quote, technical, analysis, buyGate, strengthGates, buyLights, planCheck);

  return `
    <article class="watch-card">
      <div class="watch-card-main">
        <div class="watch-title">
          <div>
            <strong>${escapeHtml(stock.name)}</strong>
            <span>${marketPrefix(stock.code).toUpperCase()}${stock.code} · ${getWatchLayerLabel(stock)}</span>
          </div>
          <div class="watch-price">
            <strong>${price ? formatMoney(price) : "--"}</strong>
            <span class="${changeClass}">${quote ? `${signed(quote.changePercent)}%` : "--"}</span>
          </div>
        </div>

        <div class="watch-meta-row">
          <span class="badge info">${escapeHtml(stock.theme)}</span>
          ${coreRole ? `<span class="core-badge ${coreRole.type}">${escapeHtml(coreRole.role)}</span>` : ""}
          ${isLeadingCore ? `<span class="core-badge leading">领涨主线</span>` : ""}
          <span>${analysis.themeDetail}</span>
        </div>

        <div class="watch-quick-row">
          <span class="score-pill ${analysis.scoreClass}">${analysis.score}分</span>
          <span class="badge ${decision.state === "confirmed" ? "buy" : decision.state === "sell" ? "sell" : decision.state === "candidate" ? "warn" : "info"}">${escapeHtml(decision.label)}</span>
          <span class="strength-gate-pill ${strengthGates.level}">闸门 ${escapeHtml(strengthGates.label)}</span>
          ${stock.group === "holding" || Number(stock.shares) > 0
            ? `<span class="sell-summary-pill ${sellGrade.level}">卖出 ${escapeHtml(sellGrade.label)}</span>`
            : `<span class="buy-gate ${preBuyCheck.level}">买前 ${escapeHtml(preBuyCheck.label)}</span>`}
        </div>

        <details class="watch-detail">
          <summary>查看K线、六灯与交易计划</summary>

          ${renderStockPosition(position)}
          ${stock.note ? `<p class="watch-note-detail">${escapeHtml(stock.note)}</p>` : ""}

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
              <span>纪律信号</span>
              <strong>${analysis.point.label}</strong>
              <small>${analysis.point.side}</small>
            </div>
            <div>
              <span>风控</span>
              <strong>${analysis.risk.label}</strong>
              <small>${analysis.risk.detail}</small>
            </div>
            <div>
              <span>估值</span>
              <strong class="valuation-text ${valuationTemp.level}">${valuationTemp.label}</strong>
              <small>${escapeHtml(valuationTemp.summary)}</small>
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

          ${renderBuyLights(buyLights)}

          ${renderStrengthGates(strengthGates)}

          ${renderPreBuyCheck(preBuyCheck)}

          ${renderValuationPanel(valuationTemp)}

          ${renderLivermoreKey(livermoreKey)}

          ${renderSupportCheck(supportCheck)}

          ${renderStructureStopPlan(structureStop)}

          ${renderDynamicStopPlan(dynamicStop)}

          ${renderScaleInPlan(scaleInPlan)}

          ${renderSellGrade(sellGrade)}

          ${renderPlanStatus(planStatus)}

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

          ${renderTradePlanCheck(planCheck)}
        </details>

        <div class="watch-foot">
          <span>${targetText} · ${stopText}${stock.shares ? ` · ${stock.shares}股` : ""}</span>
          <div class="watch-foot-tags">
            <span class="discipline-tag ${discipline.level}">${discipline.label}</span>
            <span class="badge ${analysis.point.level}">${analysis.point.side}</span>
          </div>
        </div>
      </div>

      <div class="watch-card-side">
        <div class="row-actions">
          <button class="mini-button" data-action="edit" data-code="${stock.code}">编辑</button>
          <button class="mini-button" data-action="delete" data-code="${stock.code}">删除</button>
        </div>
      </div>
    </article>
  `;
}

function captureConfirmedSignalSnapshot(stock, quote, technical, analysis, strengthGates, buyLights, decision) {
  if (!quote || !technical || analysis.dataQuality?.blockBuy || !strengthGates.snapshotCoherent || decision?.state !== "confirmed") return;
  const active = signalActiveSetups[stock.code];
  if (!buyLights.setupConfirmed) {
    if (strengthGates.gates.every((gate) => gate.state !== "wait") && active) {
      delete signalActiveSetups[stock.code];
      saveSignalActiveSetups();
    }
    return;
  }

  const structure = getStructureTrigger(quote, technical, analysis.trend, analysis.volume);
  const invalidationLine = Number(structure.line) || Number(stock.stop) || 0;
  const setupType = structure.mode === "breakout" ? "放量突破" : "缩量回踩";
  const signature = `${setupType}:${invalidationLine.toFixed(2)}`;
  if (active?.signature === signature) return;

  const capturedAt = Date.now();
  const record = {
    id: `${stock.code}:${capturedAt}`,
    state: "confirmed",
    code: stock.code,
    name: stock.name,
    theme: stock.theme,
    setupType,
    sessionDate: String(technical.latest?.date || "").slice(0, 10),
    capturedAt,
    entryReference: Number(technical.latest?.close) || quote.price,
    invalidationLine,
    marketRegime: marketState?.level || "unknown",
    evidence: {
      stockChange: Number.isFinite(quote.changePercent) ? quote.changePercent : null,
      themeChange: Number.isFinite(themeState[stock.theme]?.change) ? themeState[stock.theme].change : null,
      marketAverageChange: marketState?.benchmarkDataAvailable ? marketState.avgChange : null,
      stockVsTheme: Number.isFinite(quote.changePercent) && Number.isFinite(themeState[stock.theme]?.change)
        ? quote.changePercent - themeState[stock.theme].change
        : null,
      stockVsMarket: marketState?.benchmarkDataAvailable && Number.isFinite(quote.changePercent)
        ? quote.changePercent - marketState.avgChange
        : null,
      indexClose: marketState?.tenDayGate?.price || null,
      indexMa10: marketState?.tenDayGate?.ma10 || null,
      stockClose: Number(technical.latest?.close) || null,
      stockMa10: Number(technical.ma10) || null,
      volumeRatio: Number.isFinite(technical.volumeRatio) ? technical.volumeRatio : null,
      volumePeriod: technical.volumeRatioPeriod || "unknown"
    },
    gates: strengthGates.gates.map((gate) => ({ key: gate.key, state: gate.state })),
    lights: buyLights.lights.map((light) => ({ key: light.key, state: light.state })),
    dataTimes: {
      quote: quoteFetchedAt[stock.code] || 0,
      kline: technicalFetchedAt[stock.code] || 0,
      market: marketFetchedAt || 0,
      theme: themeFetchedAt || 0,
      funds: radarFetchedAt || 0
    },
    dataGate: { state: decision.dataGate.state, reason: decision.dataGate.reason },
    dataSources: {
      quote: quote.source || "行情接口",
      kline: technical.source || "日K接口"
    }
  };
  signalSnapshots = tradeRules.appendSignalSnapshot(signalSnapshots, record).slice(-500);
  signalActiveSetups[stock.code] = { signature, invalidationLine, id: record.id };
  saveSignalSnapshots();
  saveSignalActiveSetups();
}

function renderReviewModule() {
  if (!syncPulse || !disciplineRows || !reviewLogRows) return;
  const latest = reviewLogs[0]?.at ? ` · 最近 ${formatShortDateTime(new Date(reviewLogs[0].at))}` : "";
  syncPulse.textContent = `${stocks.length}只自选 · ${reviewLogs.length}条复盘日志${latest}`;
  if (reviewLogHint) reviewLogHint.textContent = reviewLogs.length ? "最新日志在前，最多保留160条" : "自动记录强信号、卖点和数据异常";
  renderReviewStats();
  renderSignalAudit();

  const disciplineItems = stocks
    .map(normalizeStock)
    .map((stock) => {
      const quote = quotes[stock.code];
      const technical = technicals[stock.code];
      const analysis = analyzeStock(stock, quote, technical);
      const strengthGates = getStrengthGates(stock, quote, analysis);
      const buyGate = getBuyGate(stock, quote, technical, analysis);
      const buyLights = getBuyLights(stock, quote, technical, analysis);
      const support = getSupportCheck(stock, quote, technical, analysis);
      const dynamicStop = getDynamicStopPlan(stock, quote, technical, analysis, support);
      const structureStop = getStructureStopPlan(stock, quote, technical, analysis, support, dynamicStop);
      const sellGrade = getSellGrade(stock, quote, technical, analysis, support, dynamicStop, structureStop);
      const decision = getCanonicalDecision(stock, quote, technical, analysis, strengthGates, buyLights, sellGrade, structureStop);
      const brief = getTradeBrief(stock, quote, technical, analysis, buyGate);
      return { stock, analysis, brief, decision };
    })
    .sort((a, b) => getDisciplinePriority(b.analysis) - getDisciplinePriority(a.analysis))
    .slice(0, 6);

  disciplineRows.innerHTML = disciplineItems.length
    ? disciplineItems.map(({ stock, analysis, brief, decision }) => `
        <article class="discipline-row ${decision.state === "confirmed" ? "buy" : decision.state === "sell" ? "sell" : brief.level}">
          <div>
            <strong>${escapeHtml(stock.name)}</strong>
            <span>${stock.code} · ${escapeHtml(decision.label)} · ${analysis.score}分</span>
          </div>
          <p>${escapeHtml(decision.reason)} · ${escapeHtml(brief.buy)}</p>
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

function getCompletedDailyBars(technical) {
  const today = getLocalDateKey();
  return (technical?.items || []).filter((item) => {
    const date = String(item.date || "").slice(0, 10);
    return date < today || (date === today && isCurrentSessionClosed(technical));
  });
}

function renderSignalAudit() {
  if (!signalAuditRows || !signalAuditPulse) return;
  const latest = signalSnapshots.slice(-8).reverse();
  const stateBySignal = new Map();
  signalOutcomes.forEach((outcome) => {
    const previous = stateBySignal.get(outcome.signalId);
    if (!previous || Number(outcome.observedAt) > Number(previous.observedAt)) stateBySignal.set(outcome.signalId, outcome);
  });
  const counts = { target: 0, invalidated: 0, unknown: 0 };
  signalSnapshots.forEach((snapshot) => {
    const result = stateBySignal.get(snapshot.id)?.result || "unknown";
    if (counts[result] !== undefined) counts[result] += 1;
  });
  const groups = new Map();
  const forwardBySignal = new Map();
  signalSnapshots.forEach((snapshot) => {
    const key = `${snapshot.setupType || "未知形态"} · ${snapshot.marketRegime || "环境未知"}`;
    const group = groups.get(key) || { count: 0, target: 0, invalidated: 0, unknown: 0 };
    group.count += 1;
    const result = stateBySignal.get(snapshot.id)?.result || "unknown";
    if (group[result] !== undefined) group[result] += 1;
    groups.set(key, group);
    const bars = getCompletedDailyBars(technicals[snapshot.code]);
    forwardBySignal.set(snapshot.id, tradeRules.getForwardSignalMetrics(snapshot, bars, { asOfDate: bars.at(-1)?.date || null }));
  });
  signalAuditPulse.textContent = `${signalSnapshots.length}个样本 · 预案完成 ${counts.target} · 结构失效 ${counts.invalidated} · 待观察 ${counts.unknown} · 手动复核，非回测`;
  if (signalAuditBreakdown) {
    signalAuditBreakdown.innerHTML = [...groups.entries()].slice(-6).reverse().map(([label, group]) => `
      <span>${escapeHtml(label)} · n=${group.count} · 预案${group.target}/失效${group.invalidated}/待观察${group.unknown}</span>
    `).join("") || `<span>确认样本形成后，按形态与市场阶段汇总</span>`;
  }
  const forwardSummary = tradeRules.summarizeForwardMetrics([...forwardBySignal.values()]);
  if (signalAuditForwardSummary) {
    signalAuditForwardSummary.innerHTML = `T+1/3/5/10 自动前瞻（完整样本） · ${forwardSummary.map((item) =>
      `T+${item.horizon} n=${item.sampleCount}${item.sampleCount ? ` · 收涨${item.positiveRatePct}% · 均值${signed(item.averageCloseReturnPct)}% · 失效${item.invalidationHits}` : " · 样本未走满"}`
    ).join("　")}`;
  }
  signalAuditRows.innerHTML = latest.length
    ? latest.map((snapshot) => {
        const outcome = stateBySignal.get(snapshot.id);
        const resultLabel = outcome?.result === "target" ? "按预案完成" : outcome?.result === "invalidated" ? "结构失效" : "待观察";
        const forward = forwardBySignal.get(snapshot.id) || [];
        const forwardText = forward.map((item) => `T+${item.horizon} ${item.complete ? `${signed(item.closeReturnPct)}%${item.invalidationHit ? "·失效线触及" : ""}` : `${item.observedSessions}/${item.horizon}日进行中`}`).join(" · ");
        return `
          <article class="signal-audit-row">
            <div>
              <strong>${escapeHtml(snapshot.name)} · ${escapeHtml(snapshot.setupType)}</strong>
              <span>${escapeHtml(snapshot.sessionDate || "日期未知")} · ${formatMoney(snapshot.entryReference)} · 失效线 ${formatMoney(snapshot.invalidationLine)}</span>
              <small>环境 ${escapeHtml(snapshot.marketRegime)} · 人工：${resultLabel}</small>
              <small>自动：${escapeHtml(forwardText)}</small>
            </div>
            <div class="signal-audit-actions">
              <button class="mini-button" data-signal-id="${escapeHtml(snapshot.id)}" data-signal-result="target" type="button">按预案完成</button>
              <button class="mini-button danger" data-signal-id="${escapeHtml(snapshot.id)}" data-signal-result="invalidated" type="button">结构失效</button>
              <button class="mini-button" data-signal-id="${escapeHtml(snapshot.id)}" data-signal-result="unknown" type="button">仍观察</button>
            </div>
          </article>
        `;
      }).join("")
    : `<div class="empty compact">三闸门、六灯和收盘结构首次同时确认后，样本会自动留存。</div>`;
}

function handleSignalAuditClick(event) {
  const button = event.target.closest("button[data-signal-id][data-signal-result]");
  if (!button) return;
  const snapshot = signalSnapshots.find((item) => item.id === button.dataset.signalId);
  if (!snapshot) return;
  const result = button.dataset.signalResult;
  const quote = quotes[snapshot.code];
  const observedAt = Date.now();
  signalOutcomes = tradeRules.appendSignalOutcome(signalOutcomes, {
    id: `${snapshot.id}:${observedAt}`,
    signalId: snapshot.id,
    result,
    observedAt,
    price: Number(quote?.price) || null,
    note: "用户手动标记；不是自动回测结果"
  }).slice(-1200);
  saveSignalOutcomes();
  renderSignalAudit();
}

function classifyReviewLog(log) {
  const text = `${log.title || ""} ${log.message || ""} ${log.type || ""}`;
  if (/低位割肉/.test(text)) return { key: "panic", label: "低位割肉", level: "danger" };
  if (/追高/.test(text)) return { key: "chase", label: "追高", level: "warn" };
  if (/未按计划|偏离点|提前卖|临时加仓/.test(text)) return { key: "plan", label: "未按计划", level: "warn" };
  if (/仓位过重|实际仓位/.test(text)) return { key: "oversize", label: "仓位过重", level: "warn" };
  if (log.type === "stop" || /动态止损|计划止损|硬止损/.test(text)) return { key: "stop", label: "止损执行", level: "sell" };
  if (log.type === "reduce" || /减仓卖点/.test(text)) return { key: "reduce", label: "减仓提醒", level: "warn" };
  if (log.type === "sell" || /卖点|风控/.test(text)) return { key: "sell", label: "卖点风控", level: "sell" };
  if (log.type === "buy" || /买点/.test(text)) return { key: "buy", label: "买点记录", level: "buy" };
  if (log.type === "data" || /数据/.test(text)) return { key: "data", label: "数据异常", level: "watch" };
  return { key: "other", label: "其他复盘", level: "note" };
}

function renderReviewStats() {
  if (!reviewStatsRows) return;
  if (!reviewLogs.length) {
    reviewStatsRows.innerHTML = `<div class="empty compact">暂无日志，先从一次错误交易开始记录。</div>`;
    return;
  }

  const stats = reviewLogs.reduce((map, log) => {
    const item = classifyReviewLog(log);
    if (!map[item.key]) map[item.key] = { ...item, count: 0, latest: null };
    map[item.key].count += 1;
    if (!map[item.key].latest || new Date(log.at) > new Date(map[item.key].latest.at)) map[item.key].latest = log;
    return map;
  }, {});
  const rows = Object.values(stats).sort((a, b) => b.count - a.count).slice(0, 6);
  const mistakeRows = rows.filter((item) => ["panic", "chase", "plan", "oversize"].includes(item.key));
  const topMistake = mistakeRows[0];

  reviewStatsRows.innerHTML = `
    <div class="review-stat-focus ${topMistake ? topMistake.level : "ok"}">
      <span>最大问题</span>
      <strong>${topMistake ? topMistake.label : "暂无错误模板"}</strong>
      <small>${topMistake ? `${topMistake.count}次，先修这个动作` : "继续记录，别凭记忆复盘"}</small>
    </div>
    <div class="review-stat-grid">
      ${rows.map((item) => `
        <article class="${item.level}">
          <strong>${item.count}</strong>
          <span>${item.label}</span>
        </article>
      `).join("")}
    </div>
  `;
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
    const support = getSupportCheck(stock, quote, technical, analysis);
    const dynamicStop = getDynamicStopPlan(stock, quote, technical, analysis, support);
    const sellGrade = getSellGrade(stock, quote, technical, analysis, support, dynamicStop);
    const priceText = quote?.price ? `现价${formatMoney(quote.price)}，涨跌${signed(quote.changePercent)}%` : "价格待更新";
    let log = null;

    if (analysis.point.side === "卖点" || analysis.risk.label === "到止损" || analysis.volume.danger) {
      log = {
        level: "sell",
        type: "sell",
        title: `${stock.name} 触发卖点/风控`,
        message: `${priceText}。卖点分级：${sellGrade.label}/${sellGrade.action}。${brief.sell}`,
        key: `${localDateKey()}-${stock.code}-sell-${analysis.point.label}-${analysis.risk.label}-${analysis.volume.label}`
      };
    } else if (stock.group === "holding" && dynamicStop.level === "danger") {
      log = {
        level: "sell",
        type: "stop",
        title: `${stock.name} 触发动态止损`,
        message: `${priceText}。计划止损：${dynamicStop.label}/${dynamicStop.action}，硬线${dynamicStop.hardLine ? formatMoney(dynamicStop.hardLine) : "--"}。${dynamicStop.detail}`,
        key: `${localDateKey()}-${stock.code}-dynamic-stop-${dynamicStop.label}-${dynamicStop.action}`
      };
    } else if (stock.group === "holding" && sellGrade.grade === "reduce") {
      log = {
        level: "warn",
        type: "reduce",
        title: `${stock.name} 出现减仓卖点`,
        message: `${priceText}。${sellGrade.detail}。依据：${sellGrade.points.join("、")}`,
        key: `${localDateKey()}-${stock.code}-sell-grade-${sellGrade.label}-${sellGrade.action}`
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
        message: `${priceText}。为什么盯：${brief.watch}。纪律缺口：${buyGate.gaps.join("、")}`,
        key: `${localDateKey()}-${stock.code}-strong-watch-${analysis.action.label}`
      };
    } else if (stock.group === "holding" && support.level === "danger") {
      log = {
        level: "warn",
        type: "support",
        title: `${stock.name} 承接转差`,
        message: `${priceText}。${support.label}：${support.detail}。动作：${support.action}`,
        key: `${localDateKey()}-${stock.code}-support-${support.label}`
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

function fillErrorReviewTemplate(type) {
  const templates = {
    "panic-sell": [
      "【错误交易复盘：低位割肉】",
      "股票：",
      "当时卖出原因：",
      "是否触发计划止损：否 / 是",
      "承接观察：是否放量下杀、是否收回低点、是否跑赢大盘、板块是否还在",
      "错在哪里：仓位过大 / 没等收盘 / 没看承接 / 情绪保本金",
      "下次规则：未触发硬止损时，先减半或等收盘确认"
    ],
    chase: [
      "【错误交易复盘：追高】",
      "股票：",
      "买入位置：突破 / 冲高 / 跟风",
      "买入时六灯是否全亮：否 / 是",
      "缺口：差趋势 / 差量能 / 差主线 / 差环境 / 差风控 / 差突破",
      "错在哪里：把新闻/异动当买点，还是怕错过",
      "下次规则：只买确认买点，冲高超过计划价不追"
    ],
    "plan-break": [
      "【错误交易复盘：未按计划】",
      "股票：",
      "原计划：买点、止损、仓位、卖出闸门",
      "实际操作：",
      "偏离点：提前卖 / 没止损 / 临时加仓 / 忘记分批",
      "结果：",
      "下次规则：交易前先看计划检查，不在盘中临时改规则"
    ],
    oversize: [
      "【错误交易复盘：仓位过重】",
      "股票：",
      "账户资金：",
      "实际仓位：",
      "计划最大亏损：",
      "实际可承受亏损：",
      "错在哪里：仓位导致心态变形，不是逻辑一定错",
      "下次规则：先按最大亏损反推手数，再谈买点"
    ]
  };
  manualLogInput.value = templates[type]?.join("\n") || "";
  manualLogInput.focus();
  syncPulse.textContent = "已填入错误复盘模板，补完细节后写入日志";
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
  if (snapshot.radarHistory && typeof snapshot.radarHistory === "object") {
    radarHistory = snapshot.radarHistory;
    pruneObjectHistory(radarHistory, 5);
    saveRadarHistory();
  }
  if (snapshot.radarLastSnapshot && typeof snapshot.radarLastSnapshot === "object") {
    radarLastSnapshot = {
      ...snapshot.radarLastSnapshot,
      items: Array.isArray(snapshot.radarLastSnapshot.items)
        ? snapshot.radarLastSnapshot.items.map(normalizeCachedRadarItem).filter(Boolean)
        : []
    };
    saveLastRadarSnapshot();
    radarItems = getStoredRadarItemsForDisplay();
    radarUsingLastSnapshot = Boolean(radarItems.length);
  }
  if (snapshot.themeHistory && typeof snapshot.themeHistory === "object") {
    themeHistory = snapshot.themeHistory;
    pruneObjectHistory(themeHistory, 5);
    saveThemeHistory();
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
    reviewLogs: reviewLogs.slice(0, 80),
    radarHistory,
    radarLastSnapshot,
    themeHistory
  };
}

function buildSyncText() {
  const rows = stocks.map(normalizeStock).map((stock) => {
    const quote = quotes[stock.code];
    const technical = technicals[stock.code];
    const analysis = analyzeStock(stock, quote, technical);
    const buyGate = getBuyGate(stock, quote, technical, analysis);
    const buyLights = getBuyLights(stock, quote, technical, analysis);
    const brief = getTradeBrief(stock, quote, technical, analysis, buyGate);
    const support = getSupportCheck(stock, quote, technical, analysis);
    const dynamicStop = getDynamicStopPlan(stock, quote, technical, analysis, support);
    const structureStop = getStructureStopPlan(stock, quote, technical, analysis, support, dynamicStop);
    const planCheck = getTradePlanCheck(stock, quote, analysis, getStockCoreRole(stock.code, stock.theme), dynamicStop, structureStop);
    const scaleInPlan = getScaleInPlan(stock, quote, technical, analysis, buyGate, buyLights, structureStop, planCheck, support);
    const sellGrade = getSellGrade(stock, quote, technical, analysis, support, dynamicStop, structureStop);
    const price = quote?.price ? `${formatMoney(quote.price)} ${signed(quote.changePercent)}%` : "待行情";
    const stopLine = dynamicStop.hardLine ? formatMoney(dynamicStop.hardLine) : "--";
    const structureLine = structureStop.mainLine ? formatMoney(structureStop.mainLine) : "--";
    return `${stock.name} ${stock.code}｜${getWatchLayerLabel(stock)}｜${stock.theme}｜${price}｜${analysis.action.label}/${analysis.score}分｜承接:${support.label}/${support.action}｜结构:${structureStop.label}/${structureStop.action}/${structureLine}｜止损:${dynamicStop.label}/${dynamicStop.action}/${stopLine}｜加仓:${scaleInPlan.label}/${scaleInPlan.action}｜卖点:${sellGrade.label}/${sellGrade.action}｜盯:${brief.watch}｜买:${brief.buy}｜卖:${brief.sell}`;
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

  const loaded = normalized.filter((stock) => quotes[stock.code]).length;
  const techLoaded = normalized.filter((stock) => technicals[stock.code]).length;
  const valuationLoaded = normalized.filter((stock) => valuations[stock.code]).length;
  const autoText = getAutoText();
  marketPulse.textContent = loaded
    ? `行情 ${loaded}/${stocks.length} · K线 ${techLoaded}/${stocks.length} · 估值 ${valuationLoaded}/${stocks.length} · 智能排序 · ${autoText}`
    : `等待行情刷新 · 智能排序 · ${autoText}`;
}

function renderDataHealth() {
  if (!dataHealthRows) return;
  const normalized = stocks.map(normalizeStock);
  const quoteLoaded = normalized.filter((stock) => quotes[stock.code]).length;
  const techLoaded = normalized.filter((stock) => technicals[stock.code]).length;
  const valuationLoaded = normalized.filter((stock) => valuations[stock.code]).length;
  const fallbackCount = normalized.filter((stock) => technicalStatus[stock.code]?.source === "腾讯备用").length;
  const techFailed = normalized.filter((stock) => technicalStatus[stock.code]?.level === "bad").length;
  const valuationFailed = normalized.filter((stock) => valuationStatus[stock.code]?.level === "bad").length;
  const radarText = radarScanStats
    ? radarUsingLastSnapshot && radarItems.length
      ? `保留 ${radarItems.length} · 新信号 ${radarScanStats.signalRows || 0}`
      : `候选 ${radarScanStats.candidates || 0} · 信号 ${radarScanStats.signalRows || 0}`
    : radarItems.length ? `信号 ${radarItems.length}` : "等待扫描";
  const themeText = themeFetchedAt
    ? `已刷新 ${new Date(themeFetchedAt).toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" })}`
    : "等待板块";

  dataHealthRows.innerHTML = [
    renderDataHealthCard("行情", quoteLoaded === normalized.length && normalized.length ? "ok" : quoteLoaded ? "warn" : "bad", `${quoteLoaded}/${normalized.length}`, quoteLoaded ? "腾讯实时行情" : "实时行情未返回"),
    renderDataHealthCard("K线", techLoaded === normalized.length && normalized.length ? "ok" : techLoaded ? "warn" : "bad", `${techLoaded}/${normalized.length}`, fallbackCount ? `备用源 ${fallbackCount} 只 · 失败 ${techFailed} 只` : techFailed ? `失败 ${techFailed} 只` : "日K/均线状态"),
    renderDataHealthCard("估值", valuationLoaded === normalized.length && normalized.length ? "ok" : valuationLoaded ? "warn" : "bad", `${valuationLoaded}/${normalized.length}`, valuationFailed ? `失败 ${valuationFailed} 只 · PE/PB仅参考` : "PE/PB/市值温度"),
    renderDataHealthCard("雷达", radarItems.length ? (radarUsingLastSnapshot ? "warn" : "ok") : "warn", radarText, getRadarHealthDetail()),
    renderDataHealthCard("主线", themeFetchedAt ? "ok" : "warn", themeText, "板块强度和核心同步")
  ].join("");
}

function renderDataHealthCard(label, level, value, detail) {
  return `
    <article class="data-health-card ${level}">
      <span>${escapeHtml(label)}</span>
      <strong>${escapeHtml(value)}</strong>
      <small>${escapeHtml(detail)}</small>
    </article>
  `;
}

function getRadarHealthDetail() {
  if (radarUsingLastSnapshot && radarLastSnapshot?.at) {
    return `本轮无新信号，保留 ${formatShortDateTime(new Date(radarLastSnapshot.at))}`;
  }
  return getRadarEmptyReason?.() || "盘中扫描更有效";
}

async function refreshQuotes(list = stocks, forceTechnical = false) {
  if (isRefreshing) return;
  isRefreshing = true;
  refreshBtn.disabled = true;
  refreshBtn.textContent = "…";
  const unique = [...new Map(list.map((stock) => [stock.code, normalizeStock(stock)])).values()];
  const quoteTargets = getQuoteTargets(unique);

  const quoteResults = await Promise.allSettled(quoteTargets.map(fetchQuote));
  quoteResults.forEach((result) => {
    if (result.status === "fulfilled" && result.value) {
      quotes[result.value.code] = result.value;
      quoteFetchedAt[result.value.code] = Date.now();
    }
  });
  captureAuctionSnapshots(unique);

  const valuationList = quoteTargets.filter((stock) => shouldFetchValuation(stock.code));
  const valuationResults = await Promise.allSettled(valuationList.map(fetchValuation));
  valuationResults.forEach((result, index) => {
    const code = valuationList[index]?.code;
    if (result.status === "fulfilled" && result.value) {
      valuations[result.value.code] = result.value;
      valuationStatus[result.value.code] = {
        level: "ok",
        label: "估值成功",
        detail: result.value.source || "东方财富估值"
      };
      valuationFetchedAt[result.value.code] = Date.now();
    } else if (code) {
      valuationStatus[code] = { level: "bad", label: "估值失败", detail: "PE/PB接口未返回" };
    }
  });

  const techList = unique.filter((stock) => forceTechnical || shouldFetchTechnical(stock.code));
  const techResults = await Promise.allSettled(techList.map(fetchTechnical));
  techResults.forEach((result, index) => {
    const code = techList[index]?.code;
    if (result.status === "fulfilled" && result.value?.latest) {
      technicals[result.value.code] = result.value;
      technicalStatus[result.value.code] = {
        level: result.value.source === "腾讯备用" ? "warn" : "ok",
        label: result.value.source || "K线成功",
        detail: result.value.detail || "K线已刷新",
        source: result.value.source || "东方财富"
      };
      technicalFetchedAt[result.value.code] = Date.now();
    } else if (code) {
      technicalStatus[code] = { level: "bad", label: "K线失败", detail: "东方财富和腾讯备用都未返回", source: "" };
    }
  });

  const now = new Date();
  metricTime.textContent = now.toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" });
  if (shouldFetchMarket()) {
    await refreshMarket();
  }
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

function shouldFetchValuation(code) {
  return !valuationFetchedAt[code] || Date.now() - valuationFetchedAt[code] > VALUATION_REFRESH_MS;
}

function getQuoteTargets(list = stocks) {
  return uniqueStocksByCode([...list, ...getCoreQuoteTargets()]);
}

function getCoreQuoteTargets() {
  return getLeadingThemes()
    .flatMap((themeItem) => getThemeCoreCandidates(themeItem.theme)
      .slice(0, 4)
      .map((item) => normalizeStock({
        code: item.code,
        name: item.name,
        group: "core",
        theme: themeItem.theme,
        note: item.reason
      })));
}

function uniqueStocksByCode(list) {
  return [...new Map(list
    .filter((stock) => stock?.code)
    .map((stock) => {
      const normalized = normalizeStock(stock);
      return [normalized.code, normalized];
    })).values()];
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
  const [quoteResults, gateTechnicalResult] = await Promise.all([
    Promise.allSettled(marketIndexes.map(fetchIndexQuote)),
    fetchIndexTechnical(MARKET_GATE_INDEX).catch(() => null)
  ]);
  const indexes = quoteResults
    .filter((result) => result.status === "fulfilled" && result.value)
    .map((result) => result.value);

  const avgChange = tradeRules.getBenchmarkAverageChange(indexes);
  const upCount = indexes.filter((item) => item.changePercent > 0).length;
  const benchmarkDataAvailable = indexes.length >= 2 && avgChange !== null;
  let level = benchmarkDataAvailable ? "neutral" : "unknown";
  let label = benchmarkDataAvailable ? "震荡" : "数据不足";
  const breadthNeed = Math.max(2, Math.ceil(indexes.length * 0.55));
  if (benchmarkDataAvailable && avgChange >= 0.8 && upCount >= breadthNeed) {
    level = "hot";
    label = "顺风";
  } else if (benchmarkDataAvailable && avgChange <= -0.8 && upCount <= 1) {
    level = "weak";
    label = "逆风";
  } else if (benchmarkDataAvailable && avgChange >= 0 && upCount >= breadthNeed) {
    level = "ok";
    label = "可做";
  }

  const tenDayGate = getMarketTenDayGate(indexes, gateTechnicalResult);
  marketState = { indexes, avgChange, upCount, level, label, tenDayGate, benchmarkDataAvailable, updatedAt: Date.now() };
  marketFetchedAt = Date.now();
  renderMarket();
  renderMacroLiquidity();
}

function renderMarket() {
  if (!marketRows || !marketState) {
    marketRows.innerHTML = `<div class="empty">等待指数刷新</div>`;
    return;
  }

  marketStatePill.textContent = marketState.label;
  marketStatePill.className = `state-pill ${marketState.level === "hot" ? "hot" : marketState.level === "weak" || !marketState.benchmarkDataAvailable ? "warn" : "ok"}`;
  const tenDayGate = marketState.tenDayGate || getMarketTenDayGate(marketState.indexes, null);
  marketEnvPulse.textContent = marketState.benchmarkDataAvailable
    ? `平均涨跌 ${signed(marketState.avgChange)}% · ${marketState.upCount}/${marketState.indexes.length} 指数上涨 · ${tenDayGate.label}`
    : `指数数据不足 · ${marketState.indexes.length}/${marketIndexes.length} 指数可用 · ${tenDayGate.label}`;
  marketRows.innerHTML = [
    ...marketState.indexes.map((item) => `
    <div class="market-tile">
      <span>${item.name}</span>
      <strong>${formatMoney(item.price)}</strong>
      <span class="${getChangeClass(item.changePercent)}">${signed(item.changePercent)}%</span>
    </div>
  `),
    `<div class="market-tile ${tenDayGate.level}">
      <span>大盘10日线</span>
      <strong>${escapeHtml(tenDayGate.label)}</strong>
      <span>${escapeHtml(tenDayGate.detail)}</span>
    </div>`
  ].join("");
}

function getMarketTenDayGate(indexes = [], technical = null) {
  const indexQuote = indexes.find((item) => item.symbol === MARKET_GATE_INDEX.symbol);
  const ma10 = getCompletedMovingAverage(technical, 10);
  const completedClose = getCompletedDailyClose(technical);
  if (!ma10 || !completedClose) {
    return {
      key: "market",
      state: "wait",
      level: "warn",
      label: "等上证MA10",
      detail: indexQuote?.price ? `盘中 ${formatMoney(indexQuote.price)} · 等完整日K` : "等待已完成指数日K"
    };
  }

  const price = completedClose;
  const pass = Boolean(price && ma10 && price >= ma10);
  const gapPct = price && ma10 ? (price / ma10 - 1) * 100 : null;
  return {
    key: "market",
    state: pass ? "pass" : "block",
    level: pass ? "ok" : "danger",
    label: pass ? "大盘在线上" : "大盘在线下",
    detail: `上证收盘 ${formatMoney(price)} / MA10 ${formatMoney(ma10)}${gapPct === null ? "" : ` · ${signed(gapPct)}%`}`,
    price,
    ma10,
    gapPct
  };
}

function getCompletedMovingAverage(technical, period) {
  const completed = getCompletedDailyItems(technical);
  const closes = completed.map((item) => Number(item.close)).filter((value) => Number.isFinite(value) && value > 0);
  return closes.length >= period ? avg(closes.slice(-period)) : 0;
}

function getCompletedDailyItems(technical) {
  const items = technical?.items || [];
  if (!items.length) return [];
  const latestDate = String(technical.latest?.date || "").slice(0, 10);
  const phase = getAuctionPhase().label;
  const currentBarIncomplete = latestDate === getLocalDateKey() && phase !== "已收盘" && phase !== "非交易日";
  return currentBarIncomplete ? items.slice(0, -1) : items;
}

function getCompletedDailyClose(technical) {
  const completed = getCompletedDailyItems(technical);
  const latest = completed[completed.length - 1];
  return Number.isFinite(Number(latest?.close)) ? Number(latest.close) : 0;
}

function formatYi(value) {
  if (!Number.isFinite(value) || value <= 0) return "--";
  return value >= 10000 ? `${(value / 10000).toFixed(2)}万亿` : `${value.toFixed(0)}亿`;
}

function getTwoMarketAmountYi() {
  if (!marketState?.indexes?.length) return 0;
  const sh = marketState.indexes.find((item) => item.symbol === "sh000001")?.amountYi || 0;
  const sz = marketState.indexes.find((item) => item.symbol === "sz399001")?.amountYi || 0;
  return sh + sz;
}

function getMacroLiquidityState() {
  const groups = getCapitalFlowGroups();
  const totalAmountYi = getTwoMarketAmountYi();
  const growthIndexes = (marketState?.indexes || []).filter((item) => ["sz399006", "sh000688"].includes(item.symbol));
  const growthAvg = growthIndexes.length ? avg(growthIndexes.map((item) => item.changePercent || 0)) : null;
  const topFlow = groups[0] || null;

  let score = 0;
  if (marketState?.level === "hot") score += 2;
  else if (marketState?.level === "ok") score += 1;
  else if (marketState?.level === "weak") score -= 2;

  if (totalAmountYi >= 15000) score += 2;
  else if (totalAmountYi >= 10000) score += 1;
  else if (totalAmountYi && totalAmountYi < 8000) score -= 2;

  if (growthAvg !== null && growthAvg >= 0.6) score += 1;
  else if (growthAvg !== null && growthAvg <= -0.8) score -= 1;

  if (topFlow?.level === "强共振" && topFlow.mainInflowYi > 0) score += 1;
  else if (topFlow && topFlow.mainInflowYi < 0) score -= 1;

  const level = score >= 4 ? "hot" : score >= 2 ? "ok" : score <= -2 ? "danger" : "warn";
  const label = level === "hot" ? "进攻顺风" : level === "ok" ? "可试错" : level === "danger" ? "收缩" : "谨慎";
  const action = level === "hot"
    ? "可提高核心观察优先级"
    : level === "ok"
      ? "只做核心确认买点"
      : level === "danger"
        ? "降仓防守，不做后排"
        : "少动，等主线共振";

  return {
    level,
    label,
    action,
    score,
    totalAmountYi,
    growthAvg,
    topFlow,
    groups
  };
}

function renderMacroLiquidity() {
  if (!macroLiquidityRows || !macroLiquidityPulse) return;
  if (!marketState) {
    macroLiquidityPulse.textContent = "等待指数刷新";
    macroLiquidityRows.innerHTML = `<div class="empty compact">等待市场成交额和指数广度</div>`;
    return;
  }

  const state = getMacroLiquidityState();
  const breadthText = `${marketState.upCount}/${marketState.indexes.length}`;
  const flowText = state.topFlow ? `${state.topFlow.name} ${signed(state.topFlow.mainInflowYi)}亿` : "无明确方向";
  macroLiquidityPulse.textContent = `${state.label} · ${state.action}`;
  macroLiquidityRows.innerHTML = `
    <article class="liquidity-card ${state.level}">
      <span>两市成交</span>
      <strong>${formatYi(state.totalAmountYi)}</strong>
      <small>${state.totalAmountYi >= 10000 ? "成交额够支撑主线" : "成交不足时只做核心"}</small>
    </article>
    <article class="liquidity-card ${marketState.level === "weak" ? "danger" : marketState.benchmarkDataAvailable ? "ok" : "warn"}">
      <span>指数广度</span>
      <strong>${breadthText}</strong>
      <small>${marketState.benchmarkDataAvailable ? `${marketState.label} · 平均 ${signed(marketState.avgChange)}%` : "指数报价缺失，强弱闸门等待"}</small>
    </article>
    <article class="liquidity-card ${state.growthAvg !== null && state.growthAvg >= 0 ? "ok" : "warn"}">
      <span>成长环境</span>
      <strong>${state.growthAvg === null ? "--" : `${signed(state.growthAvg)}%`}</strong>
      <small>创业板/科创50代理</small>
    </article>
    <article class="liquidity-card ${state.topFlow?.level === "强共振" ? "hot" : state.topFlow ? "watch" : "warn"}">
      <span>资金方向</span>
      <strong>${escapeHtml(flowText)}</strong>
      <small>${state.topFlow ? state.topFlow.level : "等雷达共振"}</small>
    </article>
  `;
}

function getPositionRiskRows() {
  return stocks
    .map(normalizeStock)
    .filter((stock) => stock.group === "holding")
    .map((stock) => {
      const quote = quotes[stock.code];
      const technical = technicals[stock.code];
      const analysis = analyzeStock(stock, quote, technical);
      const support = getSupportCheck(stock, quote, technical, analysis);
      const dynamicStop = getDynamicStopPlan(stock, quote, technical, analysis, support);
      const sellGrade = getSellGrade(stock, quote, technical, analysis, support, dynamicStop);
      const shares = Number(stock.shares) || 0;
      const cost = Number(stock.cost) || 0;
      const price = quote?.price || cost || 0;
      const positionValue = shares && price ? shares * price : 0;
      const plannedLoss = shares && cost && dynamicStop.hardLine
        ? Math.max((cost - dynamicStop.hardLine) * shares, 0)
          + tradeRules.estimateTradeFees(cost, shares, "buy", settings.fees).total
          + tradeRules.estimateTradeFees(dynamicStop.hardLine, shares, "sell", settings.fees).total
        : 0;
      const lockedProfit = shares && cost && dynamicStop.hardLine
        ? Math.max((dynamicStop.hardLine - cost) * shares
          - tradeRules.estimateTradeFees(cost, shares, "buy", settings.fees).total
          - tradeRules.estimateTradeFees(dynamicStop.hardLine, shares, "sell", settings.fees).total, 0)
        : 0;
      const missing = [];
      if (!shares) missing.push("股数");
      if (!cost) missing.push("成本");
      if (!quote) missing.push("行情");
      if (!dynamicStop.hardLine) missing.push("止损线");
      const level = missing.length
        ? "warn"
        : sellGrade.grade === "clear"
          ? "danger"
          : sellGrade.grade === "reduce"
            ? "watch"
            : "ok";
      return {
        stock,
        quote,
        analysis,
        support,
        dynamicStop,
        sellGrade,
        shares,
        cost,
        price,
        positionValue,
        plannedLoss,
        lockedProfit,
        missing,
        level
      };
    });
}

function renderPositionRiskOverview() {
  if (!positionRiskRows || !positionRiskPulse) return;
  const rows = getPositionRiskRows();
  if (!rows.length) {
    positionRiskPulse.textContent = "暂无持仓";
    positionRiskRows.innerHTML = `<div class="empty compact">没有持仓分组，风险总览暂不计算。</div>`;
    return;
  }

  const accountCapital = Number(settings.accountCapital) || defaultSettings.accountCapital;
  const totalPosition = rows.reduce((sum, row) => sum + row.positionValue, 0);
  const plannedLoss = rows.reduce((sum, row) => sum + row.plannedLoss, 0);
  const lockedProfit = rows.reduce((sum, row) => sum + row.lockedProfit, 0);
  const missingCount = rows.filter((row) => row.missing.length).length;
  const themeExposure = rows.reduce((map, row) => {
    map[row.stock.theme] = (map[row.stock.theme] || 0) + row.positionValue;
    return map;
  }, {});
  const topTheme = Object.entries(themeExposure).sort((a, b) => b[1] - a[1])[0];
  const positionPct = accountCapital && totalPosition ? (totalPosition / accountCapital) * 100 : 0;
  const topRiskRows = rows
    .slice()
    .sort((a, b) => (b.plannedLoss - a.plannedLoss) || (b.positionValue - a.positionValue))
    .slice(0, 4);

  positionRiskPulse.textContent = `持仓 ${rows.length} 只 · 已核算 ${rows.length - missingCount}/${rows.length} · 总仓位 ${positionPct ? positionPct.toFixed(1) : "--"}%`;
  positionRiskRows.innerHTML = `
    <div class="risk-summary-cards">
      <article>
        <span>当前仓位</span>
        <strong>${totalPosition ? `${formatMoney(totalPosition)}元` : "--"}</strong>
        <small>${positionPct ? `约账户 ${positionPct.toFixed(1)}%` : "填股数后计算"}</small>
      </article>
      <article>
        <span>计划最大亏损</span>
        <strong>${plannedLoss ? `${formatMoney(plannedLoss)}元` : "--"}</strong>
        <small>${lockedProfit ? `已锁利润 ${formatMoney(lockedProfit)}元` : "按动态硬止损线估算"}</small>
      </article>
      <article>
        <span>板块集中</span>
        <strong>${topTheme?.[0] ? escapeHtml(topTheme[0]) : "--"}</strong>
        <small>${topTheme?.[1] ? `${formatMoney(topTheme[1])}元` : "填股数后显示暴露"}</small>
      </article>
      <article class="${missingCount ? "warn" : "ok"}">
        <span>数据缺口</span>
        <strong>${missingCount}</strong>
        <small>${missingCount ? "补成本/股数/止损更准" : "风险字段完整"}</small>
      </article>
    </div>
    <div class="risk-row-list">
      ${topRiskRows.map((row) => `
        <article class="${row.level}">
          <strong>${escapeHtml(row.stock.name)}</strong>
          <span>${escapeHtml(row.sellGrade.label)} · 硬线 ${row.dynamicStop.hardLine ? formatMoney(row.dynamicStop.hardLine) : "--"} · ${row.missing.length ? `缺${row.missing.join("/")}` : `风险 ${formatMoney(row.plannedLoss)}元`}</span>
        </article>
      `).join("")}
    </div>
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
  captureThemeHistory();
  renderThemes();
  renderThemeHistory();
  renderCoreRoles();
}

function renderThemes() {
  if (!themeRows) return;
  const displayLimit = activePage === "overview" ? 3 : 8;
  const entries = getThemeDisplayEntries(themeState, displayLimit);

  if (!entries.length) {
    themeRows.innerHTML = `<div class="empty">等待主线刷新</div>`;
    return;
  }

  const updated = themeFetchedAt ? new Date(themeFetchedAt).toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" }) : "--";
  const leader = entries[0];
  const fadeCount = entries.filter((item) => getThemeStage(item).key === "fade").length;
  themePulse.textContent = leader ? `领涨 ${leader.theme} · 退潮 ${fadeCount} 条 · ${updated}` : `动态主线强度 · ${updated}`;
  themeRows.innerHTML = entries.map((item) => {
    const cls = item.strength >= 5 ? "hot" : item.strength >= 4 ? "ok" : "wait";
    const width = clamp(item.strength * 20, 12, 100);
    const profile = getThemeProfile(item.theme);
    const stage = getThemeStage(item);
    const coreSync = getThemeCoreSync(item.theme);
    return `
      <div class="theme-row ${cls} ${profile.className} ${stage.key}">
        <div class="theme-title">
          <strong>${escapeHtml(item.theme)}</strong>
          <div class="theme-tags">
            <em>${escapeHtml(profile.lane)}</em>
            <em class="theme-stage ${stage.key}">${escapeHtml(stage.label)}</em>
          </div>
        </div>
        <div class="theme-power">
          <div class="strength-bar"><i style="width:${width}%"></i></div>
          <span>强度 ${item.strength}/5</span>
        </div>
        <div class="theme-sync">
          <strong class="${getChangeClass(item.change)}">${signed(item.change)}%</strong>
          <span>${escapeHtml(coreSync.label)}</span>
        </div>
      </div>
    `;
  }).join("");
  renderThemeRankSummary(entries);
}

function getThemeDisplayEntries(stateMap = themeState, limit = 8) {
  const radarGroups = buildThemeRadarGroups();
  const radarMap = new Map(radarGroups.map((group) => [group.name, group]));
  return Object.keys(themeStrength)
    .filter((theme) => theme !== "其他")
    .map((theme) => {
      const state = stateMap[theme] || { strength: themeStrength[theme], change: 0, board: "等待刷新", source: "默认" };
      const profile = getThemeProfile(theme);
      const gate = getThemeGate(theme, state, radarMap.get(theme));
      return {
        theme,
        ...state,
        laneLabel: profile.lane,
        gate,
        radar: radarMap.get(theme) || null,
        displayScore: state.strength * 20 + Math.max(state.change || 0, 0) * 2 + profile.priority + gate.scoreAdjust
      };
    })
    .sort((a, b) => b.displayScore - a.displayScore || b.strength - a.strength || b.change - a.change)
    .slice(0, limit);
}

function getThemeStage(item) {
  if (!item) return { key: "wait", label: "等待" };
  if (item.gate?.label === "轮动确认") return { key: "rotation", label: "轮动确认" };
  if (item.radar?.level === "分歧" || (item.change <= -1.5 && item.strength >= 4)) return { key: "split", label: "强分歧" };
  if (item.strength >= 5 && item.change >= 1) return { key: "leader", label: "领涨" };
  if (item.strength >= 4 && item.change >= 0) return { key: "trend", label: "延续" };
  if (item.change <= -1 || item.strength <= 2) return { key: "fade", label: "退潮" };
  return { key: "watch", label: "观察" };
}

function getThemeCoreSync(theme) {
  const candidates = getThemeCoreCandidates(theme).slice(0, 4);
  if (!candidates.length) return { level: "wait", label: "核心待配" };
  const quoted = candidates
    .map((item) => quotes[item.code])
    .filter(Boolean);
  if (!quoted.length) return { level: "wait", label: "核心待价" };

  const avgChange = avg(quoted.map((quote) => quote.changePercent || 0));
  const strongCount = quoted.filter((quote) => quote.changePercent > Math.max(0, marketState?.avgChange || 0)).length;
  const weakCount = quoted.filter((quote) => quote.changePercent < -2).length;
  if (strongCount >= Math.ceil(quoted.length / 2) && avgChange > 0.5) return { level: "hot", label: "核心同步" };
  if (weakCount >= Math.ceil(quoted.length / 2) || avgChange < -2) return { level: "danger", label: "核心转弱" };
  if (avgChange >= 0) return { level: "watch", label: "核心分化" };
  return { level: "warn", label: "核心偏弱" };
}

function renderThemeRankSummary(entries = getThemeDisplayEntries(themeState, 8)) {
  if (!themeRankSummary) return;
  if (!entries.length) {
    themeRankSummary.innerHTML = `<div class="empty compact">等待主线刷新</div>`;
    return;
  }

  const buckets = [
    { label: "当前领涨", items: entries.filter((item) => ["leader", "trend"].includes(getThemeStage(item).key)).slice(0, 3), tone: "hot" },
    { label: "正在轮动", items: entries.filter((item) => getThemeStage(item).key === "rotation").slice(0, 3), tone: "watch" },
    { label: "退潮", items: entries.filter((item) => getThemeStage(item).key === "fade").slice(0, 3), tone: "warn" }
  ];

  themeRankSummary.innerHTML = `
    <div class="theme-rank-compact">
      ${buckets.map((bucket) => `
        <article class="${bucket.tone}">
          <strong>${bucket.label}</strong>
          <span>${bucket.items.length ? bucket.items.map((item) => item.theme).join(" / ") : "暂无"}</span>
        </article>
      `).join("")}
    </div>
    ${activePage === "overview" ? `<button class="theme-open-all" type="button" data-page-shortcut="mainline">查看全部主线</button>` : ""}
  `;
}

function captureThemeHistory(at = Date.now()) {
  const entries = getThemeDisplayEntries(themeState, 8);
  if (!entries.length) return;
  const dayKey = getLocalDateKey(new Date(at));
  const list = Array.isArray(themeHistory[dayKey]) ? themeHistory[dayKey] : [];
  const snapshot = {
    at,
    minute: getMinutesOfDay(new Date(at)),
    time: getLocalMinute(new Date(at)),
    leaders: entries.slice(0, 6).map((item) => ({
      theme: item.theme,
      strength: item.strength,
      change: Number((item.change || 0).toFixed(2)),
      laneLabel: item.laneLabel,
      board: item.board || "未匹配",
      source: item.source || "默认",
      score: Number((item.displayScore || 0).toFixed(1))
    }))
  };

  const last = list[list.length - 1];
  if (last && at - last.at < 20 * 60 * 1000) {
    list[list.length - 1] = snapshot;
  } else {
    list.push(snapshot);
  }
  themeHistory[dayKey] = list.slice(-24);
  pruneObjectHistory(themeHistory, 5);
  saveThemeHistory();
}

function renderThemeHistory() {
  if (!themeHistoryRows) return;
  const keys = Object.keys(themeHistory).sort().slice(-5);
  if (!keys.length) {
    themeHistoryRows.innerHTML = `
      <div class="theme-history-head">
        <strong>主线5日历史</strong>
        <span>等待板块刷新后记录</span>
      </div>
    `;
    return;
  }

  const cards = keys.map((key, index) => {
    const list = Array.isArray(themeHistory[key]) ? themeHistory[key] : [];
    const snapshot = list[list.length - 1];
    const top = snapshot?.leaders?.[0];
    const previousKey = keys[index - 1];
    const previousList = previousKey ? themeHistory[previousKey] || [] : [];
    const previousTop = previousList[previousList.length - 1]?.leaders?.[0];
    const status = !top
      ? "无主线"
      : previousTop?.theme === top.theme
        ? "延续"
        : previousTop
          ? "切换"
          : "记录";
    const statusClass = status === "延续" && top?.strength >= 4 ? "hot" : status === "切换" ? "switch" : "watch";
    const topText = top ? `${top.theme} ${top.strength}/5 ${signed(top.change)}%` : "等待";
    const others = (snapshot?.leaders || []).slice(1, 3).map((item) => item.theme).join(" / ");
    return `
      <article class="theme-history-card ${statusClass}">
        <div>
          <strong>${key.slice(5)}</strong>
          <span>${snapshot?.time || "--"} · ${status}</span>
        </div>
        <b>${escapeHtml(topText)}</b>
        <small>${escapeHtml(others || "暂无次强方向")}</small>
      </article>
    `;
  }).join("");

  themeHistoryRows.innerHTML = `
    <div class="theme-history-head">
      <strong>主线5日历史</strong>
      <span>看延续，不看单日热闹</span>
    </div>
    <div class="theme-history-list">${cards}</div>
  `;
}

function renderCoreRoles() {
  if (!coreRows) return;
  const themes = getLeadingThemes();
  if (!themes.length) {
    coreRows.innerHTML = `<div class="empty">等待主线刷新。中军看持续性，龙头看弹性，后排只做跟踪。</div>`;
    return;
  }

  const updated = themeFetchedAt ? new Date(themeFetchedAt).toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" }) : "--";
  const top = themes[0];
  corePulse.textContent = `${top.laneLabel} · ${top.rankLabel}：${top.theme} · ${top.strength}/5 · ${updated}`;

  coreRows.innerHTML = themes.map((themeItem) => {
    const cls = themeItem.rankLabel === "当前领涨" ? "hot" : themeItem.rankLabel === "强观察" ? "watch" : "wait";
    const candidates = getThemeCoreCandidates(themeItem.theme).slice(0, 4);
    return `
      <article class="core-card ${cls}">
        <div class="core-card-head">
          <div>
            <strong>${escapeHtml(themeItem.theme)}</strong>
            <span>${themeItem.laneLabel} · ${themeItem.rankLabel} · 强度 ${themeItem.strength}/5 · 板块 ${signed(themeItem.change)}%</span>
          </div>
          <span class="core-rank ${cls}">${themeItem.gateLabel || themeItem.radarLevel || themeItem.source}</span>
        </div>
        <div class="core-stock-list">
          ${candidates.map((item) => renderCoreStock(item, themeItem.theme)).join("")}
        </div>
        <p>${escapeHtml(getCoreThemeAdvice(themeItem))}</p>
      </article>
    `;
  }).join("");
}

function renderCoreStock(item, theme) {
  const quote = quotes[item.code];
  const valuation = getValuationTemperature({ ...item, theme }, valuations[item.code]);
  const changeClass = quote ? getChangeClass(quote.changePercent) : "flat";
  const inWatch = stocks.some((stock) => stock.code === item.code);
  const priceText = quote?.price ? formatMoney(quote.price) : "取价中";
  const changeText = quote ? `${signed(quote.changePercent)}%` : "待刷新";
  const watchButtonLabel = inWatch ? "已在自选" : "加自选";
  return `
    <div class="core-stock ${item.type}">
      <div>
        <span class="core-badge ${item.type}">${escapeHtml(item.role)}</span>
        ${inWatch ? `<span class="core-badge in-watch">自选</span>` : ""}
      </div>
      <strong>${escapeHtml(item.name)}</strong>
      <span>${item.code} · ${escapeHtml(theme)}</span>
      <small class="core-price ${quote ? "" : "missing"}">${priceText} <b class="${changeClass}">${changeText}</b></small>
      <small class="core-valuation ${valuation.level}">${escapeHtml(valuation.label)} · ${escapeHtml(valuation.summary)}</small>
      <p>${escapeHtml(item.reason)}</p>
      <div class="core-actions">
        <button class="mini-button core-watch-button ${inWatch ? "in-watch" : ""}" data-action="core-add-watch" data-code="${item.code}" data-theme="${escapeHtml(theme)}" ${inWatch ? "disabled" : ""}>${watchButtonLabel}</button>
      </div>
    </div>
  `;
}

function getLeadingThemes(limit = Object.keys(themeCoreMap).length) {
  const radarGroups = buildThemeRadarGroups();
  const radarMap = new Map(radarGroups.map((group) => [group.name, group]));
  return Object.keys(themeCoreMap)
    .map((theme) => {
      const state = themeState[theme] || { strength: themeStrength[theme] || 2, change: 0, board: "等待刷新", source: "默认" };
      const radar = radarMap.get(theme);
      const profile = getThemeProfile(theme);
      const gate = getThemeGate(theme, state, radar);
      const radarBoost = radar
        ? radar.count * 8 + Math.max(radar.mainInflowYi, 0) * 2 + Math.max(radar.avgChange, 0) * 1.5 + (radar.level === "强共振" ? 14 : 0)
        : 0;
      const dynamicScore = state.strength * 20 + Math.max(state.change || 0, 0) * 2 + radarBoost + profile.priority + gate.scoreAdjust;
      const hasDynamicSignal = state.source === "动态" || Boolean(radar);
      let rankLabel = "静态核心";
      if (gate.rotation && !gate.ok) rankLabel = "轮动观察";
      else if (hasDynamicSignal && dynamicScore >= 92) rankLabel = "当前领涨";
      else if (hasDynamicSignal && dynamicScore >= 74) rankLabel = "强观察";
      else if (hasDynamicSignal) rankLabel = "观察";
      return {
        theme,
        laneLabel: profile.lane,
        gateLabel: gate.label,
        rotationGateOk: gate.ok,
        strength: state.strength,
        change: state.change || 0,
        source: state.source || "默认",
        board: state.board || "等待刷新",
        radarLevel: radar?.level || "",
        radarCount: radar?.count || 0,
        mainInflowYi: radar?.mainInflowYi || 0,
        score: dynamicScore,
        rankLabel
      };
    })
    .sort((a, b) => b.score - a.score || b.strength - a.strength || b.change - a.change)
    .slice(0, limit);
}

function getThemeCoreCandidates(theme) {
  return (themeCoreMap[theme] || []).filter((item) => isMainBoardTradable(item.code));
}

function getStockCoreRole(code, theme = "") {
  const exactTheme = getThemeCoreCandidates(theme).find((item) => item.code === code);
  if (exactTheme) return { ...exactTheme, theme };

  for (const [coreTheme, items] of Object.entries(themeCoreMap)) {
    const matched = items.find((item) => item.code === code && isMainBoardTradable(item.code));
    if (matched) return { ...matched, theme: coreTheme };
  }
  return null;
}

function getStockPosition(stock) {
  const exact = stockPositionMap[stock.code];
  const profile = getThemeProfile(stock.theme);
  if (exact) {
    return {
      ...exact,
      confidence: exact.confidence || "确定定位",
      confidenceClass: exact.confidenceClass || "sure",
      forbidden: exact.forbidden || "按主营和产业链定位，不按临时概念漂移",
      lane: profile.lane,
      source: "精确定位",
      sourceClass: "exact"
    };
  }

  const fallback = getThemePositionFallback(stock.theme, stock.note);
  return {
    ...fallback,
    confidence: "概念待核验",
    confidenceClass: "pending",
    forbidden: "未进精确定位表前禁止重仓试错",
    lane: profile.lane,
    source: "推断定位",
    sourceClass: "inferred"
  };
}

function getThemePositionFallback(theme = "", note = "") {
  const defaults = {
    "AI算力/服务器": {
      primary: "AI算力",
      segment: "服务器 / 算力硬件 / 算力网络",
      chain: "算力基础设施",
      logic: "看 AI 资本开支、服务器订单、PCB/互连/网络设备是否共振",
      caution: "先分清整机、PCB、网络设备和材料，不要混成一个买点"
    },
    "光模块/CPO": {
      primary: "光模块/CPO",
      segment: "高速光模块 / 光器件 / CPO映射",
      chain: "光通信硬件",
      logic: "看海外算力链、光模块订单、速率升级和 CPO 预期",
      caution: "需要分清光模块、光器件、通信设备和铜缆"
    },
    "HBM/存储": {
      primary: "存储产业链",
      segment: "存储芯片 / 模组 / 封测 / HBM映射",
      chain: "存储产业链",
      logic: "看存储价格周期、HBM 扩产、海外存储厂财报和国产替代",
      caution: "先确认是存储芯片本体、模组、封测还是映射票"
    },
    "半导体设备": {
      primary: "半导体设备",
      segment: "晶圆制造设备 / 检测设备 / 工艺设备",
      chain: "晶圆制造设备",
      logic: "看晶圆厂扩产、国产替代、订单和验收节奏",
      caution: "设备股看订单兑现，不等同于材料或芯片设计"
    },
    "半导体材料": {
      primary: "半导体材料",
      segment: "硅片 / 靶材 / CMP / 光刻胶 / 电子化学品",
      chain: "上游材料",
      logic: "看国产替代、晶圆厂验证、材料价格和细分产品催化",
      caution: "材料多为细分逻辑，不能直接当终端主线龙头"
    },
    "先进封装": {
      primary: "先进封装",
      segment: "封测 / IC载板 / 封装基板 / Chiplet映射",
      chain: "封装测试",
      logic: "看先进封装扩产、AI 芯片封测需求和客户订单",
      caution: "先分清封测厂、封装基板和设备材料"
    },
    "电子特气": {
      primary: "电子特气",
      segment: "特种气体 / 稀有气体 / 前驱体",
      chain: "上游材料",
      logic: "看供给扰动、国产替代、晶圆厂认证和价格弹性",
      caution: "特气是材料分支，不是半导体终端主线"
    },
    "面板/玻璃基板": {
      primary: "面板显示",
      segment: "LCD/OLED / 玻璃基板映射",
      chain: "显示面板",
      logic: "看面板价格周期、产能格局、玻璃基板叙事和盈利修复",
      caution: "偏周期，玻璃基板故事要和业绩兑现分开看"
    },
    "功率半导体": {
      primary: "功率半导体",
      segment: "IGBT / MOSFET / SiC / GaN / IDM",
      chain: "功率器件",
      logic: "看新能源、工控、汽车电子和功率器件周期修复",
      caution: "功率半导体不是半导体设备，周期属性更强"
    },
    "光通信/海缆": {
      primary: "光通信/海缆",
      segment: "光纤光缆 / 海缆 / 通信基础设施",
      chain: "通信基础设施",
      logic: "看海缆订单、运营商投资、光通信需求和电力通信建设",
      caution: "海缆和 CPO 不是同一条细分逻辑"
    },
    "风电设备": {
      primary: "风电设备",
      segment: "风机 / 塔筒 / 海缆 / 零部件",
      chain: "新能源设备",
      logic: "看风电招标、海风建设、盈利修复和原材料成本",
      caution: "风电设备不是半导体设备"
    },
    "有色金属": {
      primary: "有色金属",
      segment: "铜 / 铝 / 锌镍 / 工业金属",
      chain: "资源上游",
      logic: "看商品价格、库存、美元利率和资源股风险偏好",
      caution: "轮动方向，只有资金共振才提高优先级"
    },
    "小金属": {
      primary: "小金属",
      segment: "锡 / 锑 / 钨 / 钼 / 铟 / 锗",
      chain: "资源与高端制造材料",
      logic: "看供给约束、库存变化、制造业需求和资源品资金轮动",
      caution: "细分弹性强，只有资金和板块共振才提高优先级"
    },
    "稀土永磁": {
      primary: "稀土永磁",
      segment: "稀土资源 / 永磁材料",
      chain: "资源与材料",
      logic: "看稀土价格、政策供给、永磁需求和出口预期",
      caution: "资源和永磁材料不是同一弹性，需分清"
    },
    "煤炭能源": {
      primary: "煤炭能源",
      segment: "煤炭 / 油气 / 高股息能源",
      chain: "能源资源",
      logic: "看能源价格、供需、分红预期和防御资金",
      caution: "防御和周期属性更重，不替代科技主线仓位"
    }
  };
  const base = defaults[theme] || {
    primary: theme || "待确认",
    segment: "主营待确认",
    chain: "待确认",
    logic: "先确认主营业务、收入占比、产业链位置和资金是否认可",
    caution: "未进入精确定位表前，只能作为观察，不能当成确定分类"
  };

  return {
    ...base,
    segment: note || base.segment,
    caution: `${base.caution}；当前为系统推断，后续可加入精确定位表。`
  };
}

function renderStockPosition(position) {
  return `
    <div class="stock-position ${position.sourceClass}">
      <div class="position-head">
        <strong>个股定位</strong>
        <span class="position-source ${position.sourceClass}">${position.source}</span>
        <span class="position-confidence ${position.confidenceClass}">${escapeHtml(position.confidence)}</span>
        <span>${escapeHtml(position.lane)}</span>
      </div>
      <div class="position-grid">
        <div>
          <span>主定位</span>
          <strong>${escapeHtml(position.primary)}</strong>
        </div>
        <div>
          <span>细分</span>
          <strong>${escapeHtml(position.segment)}</strong>
        </div>
        <div>
          <span>产业链</span>
          <strong>${escapeHtml(position.chain)}</strong>
        </div>
        <div>
          <span>逻辑</span>
          <strong>${escapeHtml(position.logic)}</strong>
        </div>
      </div>
      <div class="position-caution">
        <span>易误区</span>
        <strong>${escapeHtml(position.caution)}</strong>
      </div>
      <div class="position-forbidden">
        <span>禁止误入</span>
        <strong>${escapeHtml(position.forbidden)}</strong>
      </div>
    </div>
  `;
}

function getStockNetPnl(stock, currentPrice) {
  const cost = Number(stock?.cost);
  const shares = Number(stock?.shares) > 0 ? Number(stock.shares) : 100;
  if (!cost || !Number.isFinite(Number(currentPrice)) || Number(currentPrice) <= 0) return null;
  return tradeRules.calculateNetPosition({
    buys: [{ price: cost, shares }],
    currentPrice: Number(currentPrice),
    feeSettings: settings.fees
  });
}

function getTradePlanCheck(stock, quote, analysis, coreRole, dynamicStop = null, structureStop = null) {
  const plan = normalizeTradePlan(stock.plan);
  const profile = tradePlanProfiles[plan.type] || tradePlanProfiles.swing;
  const sellProfile = sellTimingProfiles[plan.sellTiming] || sellTimingProfiles["close-confirm"];
  const cost = Number(stock.cost);
  const stop = Number(stock.stop);
  const shares = Number(stock.shares);
  const maxLoss = Number(plan.maxLoss);
  const price = quote?.price || 0;
  const netPnl = price && cost ? getStockNetPnl(stock, price) : null;
  const pnl = netPnl ? netPnl.pnlPct : null;
  const stopRiskPct = cost && stop && stop < cost ? (1 - stop / cost) * 100 : profile.defaultStopPct;
  const plannedStopLine = cost ? (stop && stop < cost ? stop : cost * (1 - profile.defaultStopPct / 100)) : 0;
  const positionPermission = tradeRules.evaluatePositionPermission({
    setupConfirmed: true,
    entryPrice: cost,
    stopPrice: stop,
    maxLoss: plan.riskBudgetConfirmed ? maxLoss : 0,
    feeSettings: settings.fees
  });
  const suggestedShares = positionPermission.suggestedShares;
  const suggestedPosition = suggestedShares && cost ? suggestedShares * cost : 0;
  const suggestedLots = suggestedShares ? suggestedShares / 100 : 0;
  const currentPosition = shares && price ? shares * price : shares && cost ? shares * cost : 0;
  const plannedLoss = shares && cost && plannedStopLine
    ? shares * Math.max(cost - plannedStopLine, 0)
      + tradeRules.estimateTradeFees(cost, shares, "buy", settings.fees).total
      + tradeRules.estimateTradeFees(plannedStopLine, shares, "sell", settings.fees).total
    : 0;
  const effectiveStopLine = tradeRules.getEffectiveStopLine(plannedStopLine, dynamicStop?.hardLine);
  const stopTouched = Boolean(price && effectiveStopLine && price <= effectiveStopLine);
  const currentTechnical = technicals[stock.code];
  const stopCloseConfirmed = isCurrentSessionClosed(currentTechnical) && Boolean(effectiveStopLine && currentTechnical.latest.close <= effectiveStopLine);
  const sellDecision = structureStop?.sellGateAction
    ? { action: structureStop.sellGateAction }
    : tradeRules.resolveSellGate({
      holding: stock.group === "holding",
      sellTiming: plan.sellTiming,
      stopTouched,
      closeConfirmed: stopCloseConfirmed
    });
  const accountCapital = Number(settings.accountCapital) || defaultSettings.accountCapital;
  const positionPct = accountCapital && currentPosition ? (currentPosition / accountCapital) * 100 : null;
  const suggestedPct = accountCapital && suggestedPosition ? (suggestedPosition / accountCapital) * 100 : null;
  const entryDate = parseTradeDate(stock.entryDate);
  const heldDays = entryDate ? dayDiff(entryDate, new Date()) : null;
  const hitHardStop = stock.group === "holding" ? sellDecision.action === "clear" : stopTouched;
  const awaitingStopClose = stock.group === "holding" && sellDecision.action === "wait-close";
  const reduceAtStop = stock.group === "holding" && sellDecision.action === "reduce-half";
  const nearStop = Boolean(price && effectiveStopLine && price > effectiveStopLine && price <= effectiveStopLine * 1.015) || awaitingStopClose || reduceAtStop;
  const isTechLane = getThemeProfile(stock.theme).lane !== "轮动观察";
  const isCore = Boolean(coreRole);

  const warnings = [];
  if (!cost) warnings.push("未填成本，无法判断真实盈亏");
  if (!stock.stop) warnings.push("未填止损，容易盘中凭感觉卖");
  if (!maxLoss || !plan.riskBudgetConfirmed) warnings.push("单笔风险上限未确认，暂不放行仓位");
  if (!shares && stock.group === "holding") warnings.push("持仓未填股数，无法核算真实风险");
  const lotAvailability = stock.group === "holding"
    ? tradeRules.getLotAvailability(stock.lots, getLocalDateKey(), stock.legacySellableShares, shares)
    : null;
  if (lotAvailability?.unknown) warnings.push("T+1可卖股数待核对");
  if (stock.reviewSyncError) warnings.push(stock.reviewSyncError);
  if (plannedLoss && maxLoss && plannedLoss > maxLoss) warnings.push(`当前计划亏损${formatMoney(plannedLoss)}元，超过单笔上限`);
  if (heldDays !== null && heldDays < profile.minDays && plan.sellTiming !== "hard-stop") {
    warnings.push(`持有${heldDays}天，未到${profile.label}最小观察期`);
  }
  if (isTechLane && plan.coreOnly && !isCore) warnings.push("科技分歧期非核心，自动降级轻仓观察");
  if (pnl !== null && pnl < -Math.max(stopRiskPct * 0.65, 4) && !hitHardStop) warnings.push("亏损接近风控，禁止情绪化全卖");

  let level = "ok";
  let action = "按计划持有";
  if (hitHardStop) {
    level = "danger";
    action = "触发硬止损";
  } else if (awaitingStopClose) {
    level = "warn";
    action = "盘中触线，等收盘确认";
  } else if (reduceAtStop) {
    level = "warn";
    action = "先减半，余仓等收盘";
  } else if (nearStop || warnings.length >= 3) {
    level = "warn";
    action = "先减仓/等确认";
  } else if (warnings.length) {
    level = "watch";
    action = "补齐计划";
  }

  const sellGateText = hitHardStop
    ? `已触发有效止损线 ${formatMoney(effectiveStopLine)}`
    : awaitingStopClose
      ? `盘中触及有效止损线 ${formatMoney(effectiveStopLine)}，等收盘确认`
      : reduceAtStop
        ? "先减半，余仓收盘确认"
    : plan.sellTiming === "hard-stop"
      ? sellProfile.gate
      : `${sellProfile.gate}；午盘急跌不做一键清仓`;

  const coreGate = isTechLane
    ? plan.coreOnly
      ? isCore
        ? `科技分歧只做核心：${coreRole.role}`
        : "科技分歧只做核心：非核心不加仓"
      : "科技分歧仍需降低后排仓位"
    : "轮动方向只等资金共振确认";

  return {
    level,
    action,
    type: profile.label,
    hold: profile.hold,
    heldDays,
    maxLoss,
    stopRiskPct,
    plannedStopLine,
    effectiveStopLine,
    suggestedPosition,
    suggestedShares,
    suggestedLots,
    positionPermission,
    riskBudgetConfirmed: plan.riskBudgetConfirmed,
    lotAvailability,
    reviewSyncError: stock.reviewSyncError,
    currentPosition,
    plannedLoss,
    positionPct,
    suggestedPct,
    sellGate: sellGateText,
    coreGate,
    warnings,
    sellRule: profile.sellRule
  };
}

function getValuationProfile(theme) {
  const key = valuationProfileByTheme[theme] || "growth";
  return { key, ...(valuationProfiles[key] || valuationProfiles.growth) };
}

function getValuationTemperature(stock, valuation) {
  const profile = getValuationProfile(stock.theme);
  const base = {
    profile,
    peText: "--",
    pbText: "--",
    capText: "--",
    roeText: "--",
    points: ["估值只作参考", "不等于买点", profile.note]
  };

  if (!valuation) {
    return {
      ...base,
      level: "wait",
      label: "估值待取",
      action: "等PE/PB",
      summary: "等待估值接口",
      detail: "估值接口未返回时，不用估值做判断；继续看行情、K线、资金和风控。"
    };
  }

  const pe = valuation.peDynamic;
  const pb = valuation.pb;
  const roe = valuation.roe;
  const totalCap = valuation.totalMarketCapYi;
  const peText = pe === null ? "--" : formatRatio(pe, "x");
  const pbText = pb === null ? "--" : formatRatio(pb, "x");
  const capText = totalCap ? formatYi(totalCap) : "--";
  const roeText = roe === null ? "--" : formatRatio(roe, "%");
  const points = [
    `PE(动) ${peText}`,
    `PB ${pbText}`,
    `总市值 ${capText}`,
    roe !== null ? `ROE ${roeText}` : profile.label,
    profile.note
  ];

  if ((pe !== null && pe <= 0) || (pe === null && pb === null)) {
    return {
      ...base,
      level: "danger",
      label: pe !== null && pe <= 0 ? "负PE/亏损" : "估值缺口",
      action: "先核业绩",
      summary: `PE ${peText} · PB ${pbText}`,
      detail: pe !== null && pe <= 0
        ? "动态PE为负或无意义，说明利润口径可能亏损或波动过大，先看财报质量和业绩趋势。"
        : "PE/PB没有同时返回，估值参考不足，不能用便宜或昂贵做结论。",
      peText,
      pbText,
      capText,
      roeText,
      points
    };
  }

  const peExtreme = pe !== null && pe >= profile.extremePe;
  const peHigh = pe !== null && pe >= profile.highPe;
  const peLow = pe !== null && pe <= profile.lowPe;
  const pbExtreme = pb !== null && pb >= profile.extremePb;
  const pbHigh = pb !== null && pb >= profile.highPb;

  if (peExtreme || pbExtreme) {
    return {
      ...base,
      level: "danger",
      label: "估值极热",
      action: "防杀估值",
      summary: `PE ${peText} · PB ${pbText}`,
      detail: "估值已经进入高温区，故事如果兑现变慢，股价容易从讲成长切换成杀估值。",
      peText,
      pbText,
      capText,
      roeText,
      points
    };
  }

  if (peHigh || pbHigh) {
    return {
      ...base,
      level: "warn",
      label: "估值偏热",
      action: "不追后排",
      summary: `PE ${peText} · PB ${pbText}`,
      detail: "估值不便宜，只有主线强、业绩兑现和趋势确认同时满足，才值得继续看。",
      peText,
      pbText,
      capText,
      roeText,
      points
    };
  }

  if (profile.key === "cycle" && peLow) {
    return {
      ...base,
      level: "watch",
      label: "低PE核周期",
      action: "看景气位置",
      summary: `PE ${peText} · PB ${pbText}`,
      detail: "周期股低PE不能直接当低估，可能是盈利处在高点；要结合商品价格、库存和行业景气。",
      peText,
      pbText,
      capText,
      roeText,
      points
    };
  }

  if (peLow && (!pb || pb < profile.highPb)) {
    return {
      ...base,
      level: "watch",
      label: "估值低温",
      action: "加入观察",
      summary: `PE ${peText} · PB ${pbText}`,
      detail: "当前估值偏低，但低估不是买点；要等叙事边际改善、资金回流和K线确认。",
      peText,
      pbText,
      capText,
      roeText,
      points
    };
  }

  return {
    ...base,
    level: "ok",
    label: "估值中性",
    action: "正常参考",
    summary: `PE ${peText} · PB ${pbText}`,
    detail: "估值没有明显极端，优先看主线、业绩兑现、资金和买卖纪律。",
    peText,
    pbText,
    capText,
    roeText,
    points
  };
}

function renderValuationPanel(valuation) {
  return `
    <section class="valuation-panel ${valuation.level}">
      <div class="valuation-head">
        <div>
          <strong>估值温度</strong>
          <span>${escapeHtml(valuation.profile.label)} · ${escapeHtml(valuation.action)}</span>
        </div>
        <span class="valuation-badge ${valuation.level}">${escapeHtml(valuation.label)}</span>
      </div>
      <div class="valuation-grid">
        <div>
          <span>PE(动)</span>
          <strong>${escapeHtml(valuation.peText)}</strong>
          <small>高PE怕增速下修</small>
        </div>
        <div>
          <span>PB</span>
          <strong>${escapeHtml(valuation.pbText)}</strong>
          <small>资产重行业更要看PB</small>
        </div>
        <div>
          <span>总市值</span>
          <strong>${escapeHtml(valuation.capText)}</strong>
          <small>容量越大越看机构承接</small>
        </div>
        <div>
          <span>ROE</span>
          <strong>${escapeHtml(valuation.roeText)}</strong>
          <small>利润质量要回到财报确认</small>
        </div>
      </div>
      <p>${escapeHtml(valuation.detail)}</p>
      <div class="valuation-points">
        ${valuation.points.slice(0, 5).map((point) => `<span>${escapeHtml(point)}</span>`).join("")}
      </div>
    </section>
  `;
}

function getLivermoreKey(stock, quote, technical, analysis, support, sellGrade, buyGate) {
  const basePoints = ["亏损仓不补", "突破才进攻", "跌破计划先降风险"];
  const make = (level, label, column, action, detail, points = [], extra = {}) => ({
    level,
    label,
    column,
    action,
    detail,
    points: [...points, ...basePoints].slice(0, 5),
    allowAdd: false,
    forbidAdd: level === "danger",
    ...extra
  });

  if (analysis?.dataQuality?.blockBuy) {
    return make(
      "wait",
      "等数据",
      "等待栏",
      "不确认买点",
      "行情或K线数据不完整，不能把盘中波动当成趋势确认。",
      [analysis.dataQuality.detail || "数据待核验"],
      { forbidAdd: true }
    );
  }

  if (!quote || !technical) {
    return make(
      "wait",
      "等K线",
      "等待栏",
      "只观察",
      "需要现价、MA5/10/20、20日高低点和量能一起确认。",
      ["等行情/K线刷新"]
    );
  }

  const price = quote.price || technical.latest?.close || 0;
  const cost = Number(stock.cost);
  const netPnl = price && cost ? getStockNetPnl(stock, price) : null;
  const pnlPct = netPnl ? netPnl.pnlPct : null;
  const volumeRatio = Number.isFinite(technical.volumeRatio) ? technical.volumeRatio : null;
  const aboveMa10 = Boolean(technical.ma10 && price >= technical.ma10);
  const aboveMa20 = Boolean(technical.ma20 && price >= technical.ma20);
  const maBull = Boolean(technical.ma5 && technical.ma10 && technical.ma20 && technical.ma5 > technical.ma10 && technical.ma10 > technical.ma20 && price > technical.ma5);
  const previousHigh = technical.previous20High || technical.recent20High || 0;
  const previousLow = technical.previous20Low || technical.recent20Low || 0;
  const highBreakPct = previousHigh ? (price / previousHigh - 1) * 100 : null;
  const lowBreakPct = previousLow ? (price / previousLow - 1) * 100 : null;
  const peakDropPct = previousHigh ? (1 - price / previousHigh) * 100 : null;
  const troughRisePct = previousLow ? (price / previousLow - 1) * 100 : null;
  const marketWeak = marketState?.level === "weak";
  const marketContext = getMarketContext(stock.theme, quote);
  const volumeHot = analysis.volume.hot || (volumeRatio !== null && volumeRatio >= 1.5 && quote.changePercent > 0);
  const volumeDanger = analysis.volume.danger || (volumeRatio !== null && volumeRatio >= 2 && quote.changePercent <= 0);
  const threePointBreak = highBreakPct !== null && highBreakPct >= 3 && volumeHot && analysis.trend.strong && analysis.themeStrength >= 4;
  const naturalPullback = peakDropPct !== null && peakDropPct >= 6 && aboveMa20 && !volumeDanger;
  const naturalRally = troughRisePct !== null && troughRisePct >= 6 && !aboveMa20;
  const hardBreak = sellGrade?.grade === "clear" ||
    support?.level === "danger" ||
    analysis.risk.label === "到止损" ||
    Boolean(technical.ma20 && price < technical.ma20 * 0.985 && (volumeDanger || quote.changePercent <= -2.5));
  const sixPointText = peakDropPct === null ? "6点回撤待算" : `距20日高点回撤 ${peakDropPct.toFixed(1)}%`;
  const threePointText = highBreakPct === null ? "三点突破待算" : `越过20日高点 ${signed(highBreakPct)}%`;
  const volumeText = volumeRatio === null ? "量比待算" : `量比 ${volumeRatio.toFixed(2)}x`;
  const pnlText = pnlPct === null ? "未设成本" : `浮动 ${signed(pnlPct)}%`;

  if (hardBreak) {
    return make(
      "danger",
      "趋势破坏",
      "下降趋势栏",
      "禁止补仓，按计划减风险",
      "价格跌破关键均线/承接或止损规则，先处理风险，再等重新进入上升趋势栏。",
      [sixPointText, technical.ma20 ? `MA20 ${formatMoney(technical.ma20)}` : "MA20待算", support?.label || "承接待确认"],
      { forbidAdd: true }
    );
  }

  if (stock.group === "holding" && pnlPct !== null && pnlPct < 0 && buyGate?.level !== "buy") {
    return make(
      "warn",
      "亏损不加仓",
      aboveMa20 ? "自然回撤栏" : "下降趋势栏",
      "只等修复或止损，不摊平",
      "持仓处在浮亏状态，哪怕板块很强，也先等成本修复、买点确认或执行止损。",
      [pnlText, sixPointText, marketWeak ? "大盘逆风" : marketContext.label],
      { forbidAdd: true }
    );
  }

  if (threePointBreak && marketContext.allowsBuy && analysis.risk.level === "ok" && buyGate?.level === "buy") {
    return make(
      "buy",
      "三点突破确认",
      "上升趋势栏",
      stock.group === "holding" && pnlPct !== null && pnlPct > 0 ? "可按计划浮盈加仓" : "只适合小仓试错",
      "价格有效越过20日高点3%以上，叠加强主线、趋势和放量，才算严格进攻信号。",
      [threePointText, volumeText, marketContext.label],
      { allowAdd: true, forbidAdd: false }
    );
  }

  if (naturalPullback) {
    return make(
      "watch",
      "自然回撤",
      "自然回撤栏",
      "只观察，等三点突破",
      "从阶段高点回撤超过约6%，但仍守在MA20附近，属于可能的正常调整，不等于买点。",
      [sixPointText, aboveMa10 ? "守MA10" : "看MA20", volumeText],
      { forbidAdd: true }
    );
  }

  if (naturalRally) {
    return make(
      "warn",
      "自然反弹",
      "自然反弹栏",
      "反弹不是反转",
      "从低位弹起幅度够大，但没有站回MA20或趋势结构未确认，不能当主升浪追。",
      [troughRisePct === null ? "反弹幅度待算" : `距20日低点反弹 ${troughRisePct.toFixed(1)}%`, technical.ma20 ? `MA20 ${formatMoney(technical.ma20)}` : "MA20待算", volumeText],
      { forbidAdd: true }
    );
  }

  if (maBull || (analysis.trend.strong && aboveMa10 && aboveMa20)) {
    const weakEnvText = marketWeak && marketContext.relativeStrong ? "逆势抗跌" : marketContext.label;
    return make(
      "ok",
      "上升趋势",
      "上升趋势栏",
      "持仓守纪律，开仓等突破",
      "趋势结构仍在，但还没有达到三点突破级别；强势股可以盯，不能因为想回血而提前重仓。",
      [threePointText, weakEnvText, pnlText],
      { forbidAdd: stock.group === "holding" && pnlPct !== null && pnlPct < 0 }
    );
  }

  return make(
    "wait",
    "等待确认",
    "等待栏",
    "少动，等趋势选方向",
    "还没有进入清晰的上升趋势栏，也没有形成可执行的三点突破。",
    [threePointText, sixPointText, volumeText]
  );
}

function renderLivermoreKey(key) {
  return `
    <section class="livermore-key-panel ${key.level}">
      <div class="livermore-key-head">
        <div>
          <strong>利弗莫尔市场钥匙</strong>
          <span>${escapeHtml(key.column)} · ${escapeHtml(key.action)}</span>
        </div>
        <span class="livermore-key-badge ${key.level}">${escapeHtml(key.label)}</span>
      </div>
      <p>${escapeHtml(key.detail)}</p>
      <div class="livermore-key-points">
        ${key.points.slice(0, 5).map((point) => `<span>${escapeHtml(point)}</span>`).join("")}
      </div>
    </section>
  `;
}

function getPlanStatus(stock, quote, analysis, planCheck, dynamicStop, sellGrade) {
  const plan = normalizeTradePlan(stock.plan);
  const cost = Number(stock.cost);
  const stop = Number(stock.stop);
  const shares = Number(stock.shares);
  const price = quote?.price || 0;
  const missing = [];
  if (stock.group === "holding" && !shares) missing.push("股数");
  if (!cost) missing.push("成本");
  if (!stop) missing.push("止损");
  if (!plan.maxLoss) missing.push("最大亏损");

  if (missing.length) {
    return {
      level: "missing",
      label: "无计划",
      action: "先补计划",
      detail: `缺少${missing.join("、")}，不能把盘中感觉当成交易计划。`,
      points: ["补成本/股数/止损", "确认单笔最大亏损", "写清楚卖出闸门"]
    };
  }

  const netPnl = price && cost ? getStockNetPnl(stock, price) : null;
  const pnl = netPnl ? netPnl.pnlPct : null;
  const plannedLoss = shares && cost && stop && stop < cost
    ? shares * (cost - stop)
      + tradeRules.estimateTradeFees(cost, shares, "buy", settings.fees).total
      + tradeRules.estimateTradeFees(stop, shares, "sell", settings.fees).total
    : 0;
  const overLossBudget = Boolean(plan.maxLoss && plannedLoss > plan.maxLoss);
  const hardBreak = dynamicStop?.level === "danger" || sellGrade?.grade === "clear" || (price && stop && price <= stop);
  const nearBreak = dynamicStop?.level === "warn" || sellGrade?.grade === "reduce" || (price && stop && price > stop && price <= stop * 1.02);

  if (hardBreak) {
    return {
      level: "danger",
      label: "破计划",
      action: "执行预案",
      detail: "已经触发硬止损、清仓级卖点或动态风控危险，先按计划处理风险。",
      points: [sellGrade?.action || "看卖点分级", dynamicStop?.action || "看动态止损", planCheck?.sellGate || "按卖出闸门执行"]
    };
  }

  if (nearBreak || overLossBudget || (pnl !== null && pnl < -6)) {
    return {
      level: "warn",
      label: "接近止损",
      action: "降风险",
      detail: overLossBudget ? "当前计划亏损超过单笔上限，仓位和止损需要重新校准。" : "价格接近止损或卖点分级转弱，禁止补仓摊平。",
      points: [sellGrade?.label || "卖点未确认", dynamicStop?.label || "动态止损待确认", "只减风险，不加情绪仓"]
    };
  }

  return {
    level: "ok",
    label: "计划内",
    action: analysis?.point?.side === "买点" ? "只按六灯确认执行" : "按计划观察",
    detail: "成本、止损和最大亏损已成体系，后续只按K线、量能、资金和卖出闸门执行。",
    points: [planCheck?.sellGate || "收盘确认", planCheck?.coreGate || "主线确认", "不临盘改计划"]
  };
}

function renderPlanStatus(status) {
  return `
    <section class="plan-status-panel ${status.level}">
      <div class="plan-status-head">
        <div>
          <strong>交易计划状态</strong>
          <span>${escapeHtml(status.action)}</span>
        </div>
        <b>${escapeHtml(status.label)}</b>
      </div>
      <p>${escapeHtml(status.detail)}</p>
      <div class="plan-status-points">
        ${status.points.slice(0, 3).map((point) => `<span>${escapeHtml(point)}</span>`).join("")}
      </div>
    </section>
  `;
}

function renderTradePlanCheck(planCheck) {
  const heldText = planCheck.heldDays === null ? "未填买入日期" : `已持有${planCheck.heldDays}天`;
  const riskText = planCheck.riskBudgetConfirmed && planCheck.maxLoss
    ? `最多亏 ${formatMoney(planCheck.maxLoss)} 元`
    : "先确认单笔上限";
  const positionText = planCheck.suggestedPosition
    ? `止损空间 ${planCheck.stopRiskPct.toFixed(1)}%，建议≤${formatMoney(planCheck.suggestedPosition)}元${planCheck.suggestedPct !== null ? `，占账户${planCheck.suggestedPct.toFixed(1)}%` : ""}`
    : `参考止损空间 ${planCheck.stopRiskPct.toFixed(1)}%`;
  const lotText = planCheck.suggestedLots
    ? `约 ${planCheck.suggestedLots} 手 / ${planCheck.suggestedShares} 股`
    : "先等价格、止损和最大亏损完整";
  const currentRiskText = planCheck.currentPosition
    ? `当前仓位 ${formatMoney(planCheck.currentPosition)}元${planCheck.positionPct !== null ? `，占账户${planCheck.positionPct.toFixed(1)}%` : ""}`
    : "未填股数，无法算当前仓位";
  const currentLossText = planCheck.plannedLoss
    ? `计划最大亏损 ${formatMoney(planCheck.plannedLoss)}元`
    : "填股数+止损后显示当前风险";
  const availability = planCheck.lotAvailability;
  const sellableText = !availability
    ? "--"
    : availability.unknown
      ? "待核对"
      : availability.availableShares === null
      ? "历史可卖股数需核对"
      : `${availability.availableShares}股`;
  const lockedText = planCheck.reviewSyncError
    ? planCheck.reviewSyncError
    : !availability || availability.lockedShares === null || availability.lockedShares === undefined
    ? "历史批次未完整记录"
    : `今日锁定 ${availability.lockedShares}股`;
  const warningText = planCheck.warnings.length
    ? planCheck.warnings.slice(0, 3).join("；")
    : "计划完整，按预案执行，不被盘中波动带走";

  return `
    <section class="trade-plan-check ${planCheck.level}">
      <div class="trade-plan-head">
        <div>
          <strong>交易计划检查</strong>
          <span>${escapeHtml(planCheck.action)}</span>
        </div>
        <span class="plan-level ${planCheck.level}">${escapeHtml(planCheck.type)}</span>
      </div>
      <div class="trade-plan-grid">
        <div>
          <span>打法</span>
          <strong>${escapeHtml(planCheck.type)} · ${escapeHtml(planCheck.hold)}</strong>
          <small>${escapeHtml(heldText)}</small>
        </div>
        <div>
          <span>风险</span>
          <strong>${riskText}</strong>
          <small>${positionText} · ${lotText}</small>
        </div>
        <div>
          <span>仓位</span>
          <strong>${currentRiskText}</strong>
          <small>${currentLossText}</small>
        </div>
        <div>
          <span>卖出闸门</span>
          <strong>${escapeHtml(planCheck.sellGate)}</strong>
          <small>${escapeHtml(planCheck.sellRule)}</small>
        </div>
        ${planCheck.lotAvailability ? `
        <div>
          <span>T+1可卖</span>
          <strong>${escapeHtml(sellableText)}</strong>
          <small>${escapeHtml(lockedText)}</small>
        </div>` : ""}
        <div>
          <span>主线取舍</span>
          <strong>${escapeHtml(planCheck.coreGate)}</strong>
          <small>分歧期抓中军、龙头、分支核心</small>
        </div>
      </div>
      <p>${escapeHtml(warningText)}</p>
    </section>
  `;
}

function getThemeProfile(theme) {
  return themeProfiles[theme] || { lane: "观察", className: "neutral", priority: 0, minBuyStrength: 4 };
}

function isRotationTheme(theme) {
  return getThemeProfile(theme).lane === "轮动观察";
}

function getThemeRadarGroup(theme) {
  return buildThemeRadarGroups().find((group) => group.name === theme) || null;
}

function getThemeGate(theme, state = null, radar = null) {
  const profile = getThemeProfile(theme);
  const currentState = state || themeState[theme] || { strength: themeStrength[theme] || 2, change: 0, source: "默认" };
  const currentRadar = radar || getThemeRadarGroup(theme);
  if (currentRadar?.dynamicRotation) {
    const confirmed = currentRadar.level === "强共振" || (
      currentRadar.count >= 2 &&
      currentRadar.mainInflowYi >= 3 &&
      currentRadar.avgChange > 0
    );
    return {
      ok: confirmed,
      rotation: true,
      label: confirmed ? "轮动确认" : "动态轮动",
      scoreAdjust: confirmed ? -4 : -18
    };
  }

  if (!isRotationTheme(theme)) {
    return { ok: true, rotation: false, label: profile.lane, scoreAdjust: 0 };
  }

  const boardStrong = currentState.source === "动态" && currentState.strength >= 4 && (currentState.change || 0) >= 1.5;
  const radarStrong = Boolean(currentRadar && (
    currentRadar.level === "强共振" ||
    currentRadar.count >= 3 ||
    currentRadar.mainInflowYi >= 5
  ));
  const confirmed = currentState.strength >= profile.minBuyStrength || (currentState.strength >= 4 && (boardStrong || radarStrong));

  return {
    ok: confirmed,
    rotation: true,
    label: confirmed ? "轮动确认" : "轮动观察",
    scoreAdjust: confirmed ? 0 : -24
  };
}

function getCoreThemeAdvice(themeItem) {
  if (themeItem.laneLabel === "轮动观察" && !themeItem.rotationGateOk) {
    return "非主攻方向只做观察，至少等板块强度、资金共振和核心股趋势同时确认。";
  }
  if (themeItem.laneLabel === "轮动观察") {
    return "轮动已确认也先看中军承接，不用它替代科技主线仓位，错了快速降级。";
  }
  if (themeItem.rankLabel === "当前领涨") {
    return "先看中军是否放量站稳，再看龙头弹性；中军破位则降级，不追后排。";
  }
  if (themeItem.rankLabel === "强观察") {
    return "已接近领涨状态，等中军确认突破或缩量回踩不破。";
  }
  return "只维护核心观察名单，等资金和板块共振再提高优先级。";
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
    script.src = `https://qt.gtimg.cn/q=${index.symbol}&_=${Date.now()}`;
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
        changePercent: Number(parts[32]) || 0,
        amountWan: Number(parts[37]) || 0,
        amountYi: (Number(parts[37]) || 0) / 10000
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

function fetchIndexTechnical(index) {
  const callbackName = `emIndexKline_${index.symbol}_${Date.now()}_${Math.floor(Math.random() * 100000)}`;
  const url = [
    "https://push2his.eastmoney.com/api/qt/stock/kline/get",
    `?cb=${callbackName}`,
    `&secid=${index.secid}`,
    "&fields1=f1,f2,f3,f4,f5,f6",
    "&fields2=f51,f52,f53,f54,f55,f56,f57,f58,f59,f60,f61",
    "&klt=101",
    "&fqt=0",
    "&end=20500101",
    "&lmt=40",
    `&_=${Date.now()}`
  ].join("");

  return new Promise((resolve) => {
    const script = document.createElement("script");
    let settled = false;
    const timer = window.setTimeout(() => finish(null), JSONP_TIMEOUT);

    window[callbackName] = (payload) => finish(parseKlinePayload({ code: index.symbol, name: index.name }, payload));
    script.src = url;
    script.async = true;
    script.onerror = () => finish(null);

    function finish(value) {
      if (settled) return;
      settled = true;
      window.clearTimeout(timer);
      delete window[callbackName];
      script.remove();
      resolve(value ? { ...value, symbol: index.symbol, name: index.name, source: "东方财富指数K线" } : null);
    }

    document.head.appendChild(script);
  });
}

function fetchThemeBoards() {
  const callbackName = `emTheme_${Date.now()}_${Math.floor(Math.random() * 100000)}`;
  const url = [
    "https://push2.eastmoney.com/api/qt/clist/get",
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

function marketAllowsBuy(theme, quote = null) {
  return getMarketContext(theme, quote).allowsBuy;
}

function getMarketContext(theme, quote = null) {
  if (!settings.requireMarketConfirm) {
    return {
      allowsBuy: true,
      level: "ok",
      label: "环境关闭",
      detail: "设置未要求市场确认",
      gap: "",
      relativeStrength: null,
      scoreAdjust: 0,
      relativeStrong: false
    };
  }

  if (!marketState) {
    return {
      allowsBuy: false,
      level: "wait",
      label: "等环境",
      detail: "等待指数刷新",
      gap: "差环境",
      relativeStrength: null,
      scoreAdjust: -4,
      relativeStrong: false
    };
  }

  if (!marketState.benchmarkDataAvailable) {
    return {
      allowsBuy: false,
      level: "wait",
      label: "等指数行情",
      detail: "指数报价缺失，不能计算个股相对强弱",
      gap: "等指数行情",
      relativeStrength: null,
      scoreAdjust: -4,
      relativeStrong: false
    };
  }

  const rotationGate = isRotationTheme(theme) ? getThemeGate(theme) : null;
  const marketOk = marketState.level !== "weak";
  const hasQuote = Boolean(quote && Number.isFinite(quote.changePercent));
  const relativeStrength = hasQuote && marketState.benchmarkDataAvailable ? quote.changePercent - marketState.avgChange : null;
  const redAgainstGreen = hasQuote && quote.changePercent > 0 && relativeStrength >= 1.2;
  const veryStrong = hasQuote && quote.changePercent >= 1.5 && relativeStrength >= 2;
  const antiWeak = marketState.level === "weak" && redAgainstGreen;
  const rotationOk = rotationGate ? rotationGate.ok : true;
  const allowsBuy = rotationOk && (marketOk || antiWeak);

  let level = "ok";
  let label = marketState.label;
  let detail = `${marketState.label} · ${marketState.upCount}/${marketState.indexes.length}指数上涨`;
  let gap = "";
  let scoreAdjust = marketState.level === "hot" ? 2 : marketState.level === "weak" ? -5 : 0;

  if (!hasQuote) {
    detail = `${detail} · 等个股强弱`;
  } else if (antiWeak && veryStrong) {
    level = "relative-hot";
    label = "逆势强";
    detail = `大盘${marketState.label}，个股跑赢${signed(relativeStrength)}pct`;
    scoreAdjust = 6;
  } else if (antiWeak) {
    level = "relative";
    label = "逆势抗跌";
    detail = `大盘${marketState.label}，个股红盘且跑赢${signed(relativeStrength)}pct`;
    scoreAdjust = 4;
  } else if (marketState.level === "weak" && relativeStrength !== null && relativeStrength > 0) {
    level = "watch";
    label = "相对抗跌";
    detail = `大盘逆风，个股跑赢${signed(relativeStrength)}pct但未红盘确认`;
    gap = "差环境";
    scoreAdjust = -1;
  } else if (marketState.level === "weak") {
    level = "weak";
    label = "逆风";
    detail = `大盘逆风，个股未体现相对强度`;
    gap = "差环境";
  } else if (redAgainstGreen) {
    level = "relative";
    label = "顺风强";
    detail = `市场${marketState.label}，个股跑赢${signed(relativeStrength)}pct`;
    scoreAdjust = 3;
  }

  if (rotationGate && !rotationGate.ok) {
    return {
      allowsBuy: false,
      level: "wait",
      label: "等轮动",
      detail: `${detail} · ${rotationGate.label}`,
      gap: "等轮动确认",
      relativeStrength,
      scoreAdjust: Math.min(scoreAdjust, -2),
      relativeStrong: redAgainstGreen
    };
  }

  return {
    allowsBuy,
    level,
    label,
    detail,
    gap: allowsBuy ? "" : gap || "差环境",
    relativeStrength,
    scoreAdjust,
    relativeStrong: redAgainstGreen
  };
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
  RADAR_SORT_FIELDS.forEach((fid) => {
    for (let page = 1; page <= settings.radarPages; page += 1) {
      jobs.push({ fid, page, request: fetchRadarList(fid, page) });
    }
  });
  const results = await Promise.allSettled(jobs.map((job) => job.request));
  const merged = new Map();

  let successfulJobs = 0;
  let failedJobs = 0;
  let parsedRows = 0;
  let rawRows = 0;
  let filteredRows = 0;
  let fetchFallbackJobs = 0;
  results.forEach((result) => {
    if (result.status !== "fulfilled" || !result.value) {
      failedJobs += 1;
      return;
    }
    const rows = Array.isArray(result.value.rows) ? result.value.rows : [];
    if (!result.value.responded) {
      failedJobs += 1;
      return;
    }
    successfulJobs += 1;
    if (result.value.source === "fetch") fetchFallbackJobs += 1;
    rawRows += result.value.rawRows || rows.length;
    filteredRows += result.value.filteredRows || 0;
    parsedRows += rows.length;
    rows.forEach((item) => {
      if (!merged.has(item.code)) merged.set(item.code, item);
    });
  });

  const enriched = [...merged.values()]
    .map(enrichRadarItem)
    .filter((item) => item.reasons.length);
  const ignoredCount = enriched.filter((item) => ignoredRadarCodes.has(item.code)).length;
  const freshItems = enriched
    .filter((item) => !ignoredRadarCodes.has(item.code))
    .sort((a, b) => b.score - a.score)
    .slice(0, settings.radarLimit);

  const scanAt = Date.now();
  radarFetchedAt = scanAt;
  radarScanStats = {
    jobs: jobs.length,
    successfulJobs,
    failedJobs,
    rawRows,
    parsedRows,
    filteredRows,
    candidates: merged.size,
    signalRows: enriched.length,
    ignoredCount,
    finalRows: freshItems.length,
    minMarketCapYi: settings.minMarketCapYi,
    pages: settings.radarPages,
    fetchFallbackJobs
  };

  if (freshItems.length) {
    radarItems = freshItems;
    radarUsingLastSnapshot = false;
    radarLastSnapshot = buildLastRadarSnapshot(freshItems, radarScanStats, scanAt);
    saveLastRadarSnapshot();
    captureRadarHistory(radarItems, scanAt);
  } else {
    radarItems = getStoredRadarItemsForDisplay();
    radarUsingLastSnapshot = Boolean(radarItems.length);
  }

  radarRefreshBtn.disabled = false;
  radarRefreshBtn.textContent = "扫描";
  const time = new Date(scanAt).toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" });
  const lastText = radarUsingLastSnapshot && radarLastSnapshot?.at
    ? ` · 保留最后有效 ${formatShortDateTime(new Date(radarLastSnapshot.at))}`
    : "";
  radarPulse.textContent = freshItems.length
    ? `已筛出 ${freshItems.length} 只 · 候选 ${merged.size} 只 · 忽略 ${ignoredRadarCodes.size} 只 · ${time}`
    : `${getRadarEmptyReason()} · 候选 ${merged.size} 只 · 信号 ${enriched.length} 只 · ${time}${lastText}`;
  const flowGroups = getCapitalFlowGroups();
  captureCapitalFlowSnapshot(flowGroups);
  renderRadar();
  renderRadarHistory();
  renderThemeRadar();
  renderCapitalFlows(flowGroups);
  renderCoreRoles();
  updateMetrics();
}

function renderRadar() {
  if (!radarRows) return;
  if (!radarItems.length) {
    radarRows.innerHTML = `<div class="empty">${escapeHtml(getRadarEmptyReason())}。${escapeHtml(getRadarDiagnosticText())}</div>`;
    renderRadarHistory();
    return;
  }

  const staleNotice = radarUsingLastSnapshot && radarLastSnapshot?.at
    ? `
      <div class="radar-stale-note">
        <strong>保留最后有效雷达</strong>
        <span>本轮扫描未产生新信号，以下为 ${escapeHtml(formatShortDateTime(new Date(radarLastSnapshot.at)))} 的最后一次有效结果。休市复盘时只看方向和强弱，不把旧异动当买点。</span>
      </div>
    `
    : "";

  radarRows.innerHTML = staleNotice + radarItems.map((item) => {
    const pctClass = getChangeClass(item.changePercent);
    const tagClass = item.tag === "风险异动" ? "risk" : item.tag === "资金流入" ? "flow" : "amount";
    const inWatch = stocks.some((stock) => stock.code === item.code);
    const fitClass = item.radarFit?.level || "plain";
    const watchLabel = inWatch ? "已在自选" : item.radarFit?.label || "加观察";
    const rotationGroup = getRadarRotationGroup(item);
    const displayTheme = rotationGroup.name;
    const radarPosition = getStockPosition({
      code: item.code,
      name: item.name,
      theme: item.radarTheme && item.radarTheme !== "其他" ? item.radarTheme : displayTheme,
      note: item.sector || item.tag
    });
    const trace = getRadarTrace(item.code);
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
          <span>${escapeHtml(rotationGroup.dynamicRotation ? `当前轮动：${displayTheme}` : displayTheme)}</span>
        </div>
        <div class="radar-position-row">
          <span>定位：${escapeHtml(radarPosition.primary)}</span>
          <span>${escapeHtml(radarPosition.segment)}</span>
          <span class="${radarPosition.sourceClass}">${escapeHtml(radarPosition.source)}</span>
        </div>
        <p>市值 ${item.marketCapYi.toFixed(0)}亿 · 成交 ${item.amountYi.toFixed(1)}亿 · 主力 ${signed(item.mainInflowYi)}亿</p>
        <p>${item.reasons.map(escapeHtml).join(" / ")}</p>
        <div class="radar-trace ${trace.level}">
          <strong>${escapeHtml(trace.label)}</strong>
          <span>${escapeHtml(trace.detail)}</span>
        </div>
        <div class="radar-actions">
          <button class="mini-button radar-watch-button ${inWatch ? "in-watch" : fitClass}" data-action="radar-add-watch" data-code="${item.code}">${watchLabel}</button>
          <button class="mini-button" data-action="radar-add-holding" data-code="${item.code}">设持仓</button>
          <button class="mini-button" data-action="radar-ignore" data-code="${item.code}">忽略</button>
        </div>
      </article>
    `;
  }).join("");
  renderRadarHistory();
}

function getStoredRadarItemsForDisplay() {
  if (!radarLastSnapshot?.items?.length) return [];
  return radarLastSnapshot.items
    .map(normalizeCachedRadarItem)
    .filter((item) => item && !ignoredRadarCodes.has(item.code))
    .slice(0, settings.radarLimit);
}

function buildLastRadarSnapshot(items, stats, at = Date.now()) {
  return {
    at,
    scanAt: at,
    reason: "fresh-signal",
    stats: {
      jobs: stats.jobs,
      successfulJobs: stats.successfulJobs,
      failedJobs: stats.failedJobs || 0,
      rawRows: stats.rawRows || 0,
      parsedRows: stats.parsedRows || 0,
      filteredRows: stats.filteredRows || 0,
      candidates: stats.candidates || 0,
      signalRows: stats.signalRows || 0,
      ignoredCount: stats.ignoredCount || 0,
      finalRows: stats.finalRows || 0,
      minMarketCapYi: stats.minMarketCapYi,
      pages: stats.pages,
      fetchFallbackJobs: stats.fetchFallbackJobs || 0
    },
    items: items.slice(0, settings.radarLimit).map(serializeRadarItem)
  };
}

function serializeRadarItem(item) {
  return {
    code: item.code,
    name: item.name,
    price: item.price,
    changePercent: item.changePercent,
    amountYi: item.amountYi,
    turnoverRate: item.turnoverRate,
    volumeRatio: item.volumeRatio,
    marketCapYi: item.marketCapYi,
    floatCapYi: item.floatCapYi,
    mainInflowYi: item.mainInflowYi,
    sector: item.sector,
    area: item.area,
    mainInflowPercent: item.mainInflowPercent,
    reasons: Array.isArray(item.reasons) ? item.reasons.slice(0, 6) : [],
    score: item.score,
    tag: item.tag,
    radarTheme: item.radarTheme,
    radarFit: item.radarFit || null
  };
}

function normalizeCachedRadarItem(item) {
  if (!item?.code) return null;
  const code = String(item.code).replace(/\D/g, "").padStart(6, "0").slice(-6);
  if (!/^\d{6}$/.test(code)) return null;
  const normalized = {
    code,
    name: item.name || code,
    price: toNumber(item.price),
    changePercent: toNumber(item.changePercent),
    amountYi: toNumber(item.amountYi),
    turnoverRate: toNumber(item.turnoverRate),
    volumeRatio: toNumber(item.volumeRatio),
    marketCapYi: toNumber(item.marketCapYi),
    floatCapYi: toNumber(item.floatCapYi),
    mainInflowYi: toNumber(item.mainInflowYi),
    sector: normalizeBoardName(item.sector),
    area: normalizeBoardName(item.area),
    mainInflowPercent: toNumber(item.mainInflowPercent),
    reasons: Array.isArray(item.reasons) && item.reasons.length ? item.reasons.map(String).slice(0, 6) : ["最后有效雷达保留"],
    score: toNumber(item.score),
    tag: item.tag || "成交异动",
    radarTheme: item.radarTheme || inferThemeFromText(`${item.name || code} ${item.sector || ""} ${item.area || ""}`)
  };
  normalized.radarFit = item.radarFit && typeof item.radarFit === "object"
    ? { level: item.radarFit.level || "plain", label: item.radarFit.label || "加观察" }
    : { level: "plain", label: "加观察" };
  return normalized;
}

function captureRadarHistory(items = radarItems, at = Date.now()) {
  if (!radarScanStats || (!radarScanStats.successfulJobs && !items.length)) return;
  const dayKey = getLocalDateKey(new Date(at));
  const list = Array.isArray(radarHistory[dayKey]) ? radarHistory[dayKey] : [];
  const previous = list[list.length - 1] || null;
  const snapshot = {
    at,
    minute: getMinutesOfDay(new Date(at)),
    time: getLocalMinute(new Date(at)),
    items: items.slice(0, settings.radarLimit).map((item) => ({
      code: item.code,
      name: item.name,
      theme: getRadarRotationGroup(item).name,
      tag: item.tag,
      score: Number((item.score || 0).toFixed(1)),
      changePercent: Number((item.changePercent || 0).toFixed(2)),
      mainInflowYi: Number((item.mainInflowYi || 0).toFixed(2))
    }))
  };

  const last = list[list.length - 1];
  const sameCodes = last && last.items.map((item) => item.code).join(",") === snapshot.items.map((item) => item.code).join(",");
  if (last && at - last.at < 45 * 1000 && sameCodes) {
    list[list.length - 1] = snapshot;
  } else {
    list.push(snapshot);
  }

  radarHistory[dayKey] = list.slice(-180);
  logRadarDropEvents(previous, snapshot);
  pruneObjectHistory(radarHistory, 5);
  saveRadarHistory();
}

function logRadarDropEvents(previous, current) {
  if (!previous?.items?.length) return;
  const currentCodes = new Set((current.items || []).map((item) => item.code));
  const watched = new Map(stocks.map((stock) => [stock.code, normalizeStock(stock)]));
  previous.items.forEach((item) => {
    if (currentCodes.has(item.code) || !watched.has(item.code)) return;
    const stock = watched.get(item.code);
    addReviewLog({
      level: "warn",
      type: "radar-drop",
      source: "资金留痕",
      code: item.code,
      title: `${stock.name} 掉出资金雷达`,
      message: `上一轮${item.tag || "异动"}，本轮未继续上榜。先看承接和板块是否延续，不能把旧异动当买点。`,
      key: `${localDateKey()}-${item.code}-radar-drop`
    });
  });
}

function getRadarTrace(code) {
  const snapshots = getTodayRadarSnapshots();
  if (!snapshots.length) {
    return { level: "wait", label: "未留痕", detail: "等待雷达快照" };
  }

  const hits = snapshots.filter((snapshot) => snapshot.items.some((item) => item.code === code));
  if (!hits.length) {
    return { level: "wait", label: "未上榜", detail: "今日暂无雷达记录" };
  }

  let streak = 0;
  for (let i = snapshots.length - 1; i >= 0; i -= 1) {
    if (snapshots[i].items.some((item) => item.code === code)) streak += 1;
    else break;
  }

  const first = hits[0];
  const last = hits[hits.length - 1];
  if (streak >= 3) {
    return { level: "hot", label: `连续${streak}次上榜`, detail: `今日${hits.length}次 · 首次${first.time} · 最近${last.time}` };
  }
  if (streak >= 2) {
    return { level: "watch", label: `连续${streak}次上榜`, detail: `今日${hits.length}次 · 首次${first.time}` };
  }
  if (hits.length >= 2) {
    return { level: "switch", label: "回到雷达", detail: `今日${hits.length}次 · 最近${last.time}` };
  }
  return { level: "new", label: "首次上榜", detail: `今日首次 ${first.time}` };
}

function renderRadarHistory() {
  if (!radarHistoryRows) return;
  const snapshots = getTodayRadarSnapshots();
  if (!snapshots.length) {
    radarHistoryRows.innerHTML = `
      <div class="radar-history-head">
        <strong>资金留痕</strong>
        <span>等待雷达扫描后记录首次、连续和掉出</span>
      </div>
    `;
    return;
  }

  const latest = snapshots[snapshots.length - 1];
  const previous = snapshots[snapshots.length - 2] || null;
  const latestCodes = new Set(latest.items.map((item) => item.code));
  const dropped = previous ? previous.items.filter((item) => !latestCodes.has(item.code)).slice(0, 6) : [];
  const hotItems = latest.items
    .map((item) => ({ item, trace: getRadarTrace(item.code) }))
    .sort((a, b) => {
      const rank = { hot: 4, watch: 3, switch: 2, new: 1, wait: 0 };
      return (rank[b.trace.level] || 0) - (rank[a.trace.level] || 0) || b.item.score - a.item.score;
    })
    .slice(0, 6);

  radarHistoryRows.innerHTML = `
    <div class="radar-history-head">
      <strong>资金留痕</strong>
      <span>今日 ${snapshots.length} 次快照 · 最近 ${latest.time}</span>
    </div>
    <div class="radar-history-list">
      ${hotItems.map(({ item, trace }) => `
        <article class="radar-history-card ${trace.level}">
          <strong>${escapeHtml(item.name)}</strong>
          <span>${escapeHtml(trace.label)}</span>
          <small>${escapeHtml(item.theme)} · 主力 ${signed(item.mainInflowYi)}亿 · ${escapeHtml(trace.detail)}</small>
        </article>
      `).join("")}
    </div>
    ${dropped.length ? `<p class="radar-dropped">上一轮掉出：${dropped.map((item) => `${escapeHtml(item.name)} ${item.code}`).join(" / ")}</p>` : ""}
  `;
}

function getTodayRadarSnapshots() {
  const rows = radarHistory[getLocalDateKey()] || [];
  return Array.isArray(rows) ? rows.slice().sort((a, b) => a.at - b.at) : [];
}

function getRadarEmptyReason() {
  if (!radarScanStats) return "等待资金雷达扫描";
  if (!radarScanStats.successfulJobs && !radarScanStats.rawRows) return "行情接口连接失败或被浏览器拦截";
  if (!radarScanStats.rawRows) return "行情接口返回为空";
  if (!radarScanStats.candidates) return `原始候选都被主板/非科创创业/市值>${radarScanStats.minMarketCapYi}亿规则过滤`;
  if (!radarScanStats.signalRows) return "候选股票未达到资金/成交/涨跌异动阈值";
  if (radarScanStats.ignoredCount >= radarScanStats.signalRows) return "异动候选都在忽略列表里";
  return "暂无资金异动入选";
}

function getRadarDiagnosticText() {
  if (!radarScanStats) return "上午没打开网页只会影响盘中时间轴，不影响现在手动扫描。";
  const fallbackText = radarScanStats.fetchFallbackJobs ? `备用${radarScanStats.fetchFallbackJobs}路` : "备用0路";
  return [
    `响应 ${radarScanStats.successfulJobs}/${radarScanStats.jobs}`,
    `失败 ${radarScanStats.failedJobs || 0}`,
    fallbackText,
    `原始 ${radarScanStats.rawRows || 0}`,
    `过滤 ${radarScanStats.filteredRows || 0}`,
    `候选 ${radarScanStats.candidates}`,
    `信号 ${radarScanStats.signalRows}`,
    `忽略 ${radarScanStats.ignoredCount}`,
    `阈值 市值>${radarScanStats.minMarketCapYi}亿`
  ].join(" · ");
}

function renderThemeRadar() {
  if (!themeRadarRows) return;
  const groups = buildThemeRadarGroups();
  const ignoredText = ignoredRadarCodes.size ? ` · 已忽略 ${ignoredRadarCodes.size} 只` : "";
  const staleText = radarUsingLastSnapshot ? " · 保留最后有效" : "";
  themeRadarPulse.textContent = groups.length
    ? `发现 ${groups.length} 条异动主线${ignoredText}${staleText}`
    : `等待资金雷达形成主线共振${ignoredText}`;

  if (!groups.length) {
    themeRadarRows.innerHTML = `<div class="empty">暂无聚合信号。单只异动不等于主线，至少要看同方向多只大票是否共振。</div>`;
    return;
  }

  themeRadarRows.innerHTML = groups.map((group) => {
    const levelClass = group.level === "强共振" ? "hot" : group.level === "分歧" ? "warn" : "info";
    const gate = getThemeGate(group.name, themeState[group.name], group);
    const laneLabel = group.dynamicRotation ? gate.label : getThemeProfile(group.name).lane;
    return `
      <article class="theme-radar-card">
        <div class="theme-radar-head">
          <div>
            <strong>${escapeHtml(group.name)}</strong>
            <span>${escapeHtml(laneLabel)} · ${group.count}只异动 · ${group.sectors.join(" / ")}</span>
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

function getCapitalFlowGroups() {
  return buildThemeRadarGroups()
    .sort((a, b) => (
      (b.mainInflowYi - a.mainInflowYi) ||
      (b.amountYi - a.amountYi) ||
      (b.avgChange - a.avgChange) ||
      (b.count - a.count)
    ))
    .slice(0, 6);
}

function renderCapitalFlows(groups = getCapitalFlowGroups()) {
  if (!flowRows || !flowPulse) return;
  const effectiveAt = radarUsingLastSnapshot && radarLastSnapshot?.at ? radarLastSnapshot.at : radarFetchedAt;
  const time = effectiveAt ? new Date(effectiveAt).toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" }) : "--";
  const staleText = radarUsingLastSnapshot ? " · 保留" : "";

  if (!groups.length) {
    flowPulse.textContent = radarFetchedAt ? `暂无明确方向 · ${time}${staleText}` : "等待资金雷达扫描";
    flowRows.innerHTML = `<div class="empty flow-empty">暂无资金方向。先看市场环境，等大市值资金异动出现。</div>`;
    renderCapitalFlowTimeline();
    return;
  }

  const inflowCount = groups.filter((group) => group.mainInflowYi > 0).length;
  const top = groups[0];
  flowPulse.textContent = `流向 ${inflowCount}/${groups.length} 条 · 最强 ${top.name} · ${time}${staleText}`;
  flowRows.innerHTML = groups.map((group) => {
    const profile = getThemeProfile(group.name);
    const gate = getThemeGate(group.name, themeState[group.name], group);
    const lane = gate.rotation ? gate.label : profile.lane;
    const profileClass = group.dynamicRotation ? "rotation" : profile.className;
    const flowClass = group.level === "强共振" || gate.label === "轮动确认"
      ? "hot"
      : group.level === "分歧" || group.mainInflowYi < 0
        ? "warn"
        : "watch";
    const width = clamp(Math.min(Math.abs(group.mainInflowYi) * 8 + group.count * 8, 100), 10, 100);
    return `
      <article class="flow-card ${flowClass} ${profileClass}">
        <div class="flow-card-head">
          <div>
            <strong>${escapeHtml(group.name)}</strong>
            <span>${escapeHtml(lane)} · ${group.count}只异动</span>
          </div>
          <b class="${getChangeClass(group.mainInflowYi)}">${signed(group.mainInflowYi)}亿</b>
        </div>
        <div class="flow-bar"><i style="width:${width}%"></i></div>
        <div class="flow-meta">
          <span>成交 ${group.amountYi.toFixed(1)}亿</span>
          <span class="${getChangeClass(group.avgChange)}">均涨 ${signed(group.avgChange)}%</span>
          <span>${escapeHtml(group.level)}</span>
        </div>
        <p>${group.names.map(escapeHtml).join(" / ")}</p>
      </article>
    `;
  }).join("");
  renderCapitalFlowTimeline();
}

function captureCapitalFlowSnapshot(groups = getCapitalFlowGroups(), at = Date.now()) {
  const dayKey = getLocalDateKey(new Date(at));
  const rows = groups.slice(0, 6).map((group) => ({
    name: group.name,
    count: group.count,
    mainInflowYi: Number((group.mainInflowYi || 0).toFixed(2)),
    amountYi: Number((group.amountYi || 0).toFixed(1)),
    avgChange: Number((group.avgChange || 0).toFixed(2)),
    level: group.level,
    names: group.names.slice(0, 4)
  }));

  const snapshot = {
    at,
    minute: getMinutesOfDay(new Date(at)),
    time: getLocalMinute(new Date(at)),
    topName: rows[0]?.name || "无明确方向",
    groups: rows
  };

  const list = Array.isArray(flowSnapshots[dayKey]) ? flowSnapshots[dayKey] : [];
  const last = list[list.length - 1];
  if (last && at - last.at < 4 * 60 * 1000 && last.topName === snapshot.topName) {
    list[list.length - 1] = snapshot;
  } else {
    list.push(snapshot);
  }

  flowSnapshots[dayKey] = list.slice(-80);
  pruneFlowSnapshots();
  saveFlowSnapshots();
}

function renderCapitalFlowTimeline() {
  if (!flowTimelineRows) return;
  const snapshots = getTodayFlowSnapshots();
  const latest = snapshots[snapshots.length - 1] || null;
  const slotSnapshots = FLOW_TIMELINE_SLOTS.map((slot) => ({
    slot,
    snapshot: getFlowSnapshotForSlot(snapshots, slot)
  }));
  const latestEntry = latest
    ? { slot: { key: "latest", label: "最新", note: latest.time }, snapshot: latest, latest: true }
    : null;
  const entries = latestEntry ? [...slotSnapshots, latestEntry] : slotSnapshots;

  if (!snapshots.length) {
    flowTimelineRows.innerHTML = `
      <div class="flow-timeline-head">
        <strong>资金时间轴</strong>
        <span>等待雷达刷新后自动记录</span>
      </div>
      <div class="flow-timeline-list">
        ${entries.map((entry) => renderFlowTimelineCard(entry, null)).join("")}
      </div>
    `;
    return;
  }

  flowTimelineRows.innerHTML = `
    <div class="flow-timeline-head">
      <strong>资金时间轴</strong>
      <span>${snapshots.length} 个快照 · 最近 ${latest?.time || "--"}</span>
    </div>
    <div class="flow-timeline-list">
      ${entries.map((entry, index) => renderFlowTimelineCard(entry, getPreviousTimelineSnapshot(entries, index))).join("")}
    </div>
  `;
}

function renderFlowTimelineCard(entry, previousSnapshot) {
  const { slot, snapshot, latest = false } = entry;
  if (!snapshot) {
    return `
      <article class="flow-time-card empty-slot">
        <div class="flow-time-head">
          <strong>${slot.label}</strong>
          <span>${slot.note}</span>
        </div>
        <p>待快照</p>
        <small>雷达刷新后记录</small>
      </article>
    `;
  }

  const top = snapshot.groups[0];
  const status = getFlowSnapshotStatus(snapshot, previousSnapshot);
  const statusClass = getFlowStatusClass(status);
  return `
    <article class="flow-time-card ${statusClass} ${latest ? "latest" : ""}">
      <div class="flow-time-head">
        <strong>${slot.label}</strong>
        <span>${slot.note}</span>
      </div>
      <div class="flow-time-main">
        <b>${escapeHtml(top?.name || "无明确方向")}</b>
        <span class="flow-time-status">${status}</span>
      </div>
      <div class="flow-time-stats">
        <span>主力 ${signed(top?.mainInflowYi)}亿</span>
        <span>均涨 ${signed(top?.avgChange)}%</span>
      </div>
      <small>${escapeHtml((top?.names || []).join(" / ") || "暂无代表股")}</small>
    </article>
  `;
}

function getFlowSnapshotStatus(snapshot, previousSnapshot) {
  const top = snapshot.groups[0];
  const previousTop = previousSnapshot?.groups?.[0];
  if (!top) return "无方向";
  if (top.mainInflowYi < 0 || top.avgChange < -0.5 || top.level === "分歧") return "资金分歧";
  if (!previousTop) return top.level === "强共振" ? "强共振" : "初始流入";
  if (top.name !== previousTop.name) return "方向切换";
  if (top.mainInflowYi >= previousTop.mainInflowYi + 1 && top.avgChange >= previousTop.avgChange - 0.4) return "持续流入";
  if (top.avgChange <= previousTop.avgChange - 1 && top.mainInflowYi <= previousTop.mainInflowYi + 0.5) return "冲高回落";
  if (snapshot.minute >= 14 * 60 + 20 && top.mainInflowYi > previousTop.mainInflowYi) return "尾盘抢筹";
  return top.level === "强共振" ? "强共振" : "观察延续";
}

function getFlowStatusClass(status) {
  if (["持续流入", "强共振", "尾盘抢筹"].includes(status)) return "hot";
  if (["资金分歧", "冲高回落"].includes(status)) return "warn";
  if (status === "方向切换") return "switch";
  return "watch";
}

function getFlowSnapshotForSlot(snapshots, slot) {
  const matched = snapshots
    .filter((snapshot) => snapshot.minute >= slot.start && snapshot.minute <= slot.end)
    .sort((a, b) => Math.abs(a.minute - slot.target) - Math.abs(b.minute - slot.target));
  return matched[0] || null;
}

function getPreviousTimelineSnapshot(entries, index) {
  for (let i = index - 1; i >= 0; i -= 1) {
    if (entries[i].snapshot) return entries[i].snapshot;
  }
  return null;
}

function getTodayFlowSnapshots() {
  const rows = flowSnapshots[getLocalDateKey()] || [];
  return Array.isArray(rows) ? rows.slice().sort((a, b) => a.at - b.at) : [];
}

function pruneFlowSnapshots() {
  pruneObjectHistory(flowSnapshots, 5);
}

function pruneObjectHistory(store, keepDays = 5) {
  const keys = Object.keys(store).sort();
  while (keys.length > keepDays) {
    const oldest = keys.shift();
    delete store[oldest];
  }
}

function getMinutesOfDay(date = new Date()) {
  return date.getHours() * 60 + date.getMinutes();
}

function buildThemeRadarGroups() {
  const map = new Map();
  radarItems.forEach((item) => {
    const rotation = getRadarRotationGroup(item);
    const key = rotation.name;
    if (!map.has(key)) {
      map.set(key, {
        name: key,
        dynamicRotation: rotation.dynamicRotation,
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
    group.dynamicRotation = group.dynamicRotation || rotation.dynamicRotation;
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

function getRadarRotationGroup(item) {
  if (item.radarTheme && item.radarTheme !== "其他") {
    return { name: item.radarTheme, dynamicRotation: false };
  }

  const text = `${item.name || ""} ${item.sector || ""} ${item.area || ""}`;
  const matched = dynamicRotationRules.find((rule) => rule.pattern.test(text));
  if (matched) return { name: matched.name, dynamicRotation: true };
  return { name: item.sector || item.area || "其他轮动", dynamicRotation: true };
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

async function fetchRadarList(fid, page = 1) {
  const jsonpResult = await fetchRadarListJsonp(fid, page);
  if (jsonpResult.responded) return jsonpResult;
  const fetchResult = await fetchRadarListDirect(fid, page);
  return fetchResult.responded ? { ...fetchResult, source: "fetch" } : jsonpResult;
}

function buildRadarUrl(fid, page = 1, callbackName = "") {
  const url = [
    "https://push2.eastmoney.com/api/qt/clist/get",
    callbackName ? `?cb=${callbackName}` : "?",
    `&pn=${page}`,
    `&pz=${RADAR_PAGE_SIZE}`,
    "&po=1",
    "&np=1",
    "&fltt=2",
    "&invt=2",
    `&fid=${fid}`,
    `&fs=${RADAR_FS}`,
    `&fields=${RADAR_FIELDS}`,
    `&_=${Date.now()}`
  ].join("");
  return url;
}

function fetchRadarListJsonp(fid, page = 1) {
  const callbackName = `emRadar_${fid}_${Date.now()}_${Math.floor(Math.random() * 100000)}`;
  const url = buildRadarUrl(fid, page, callbackName);

  return new Promise((resolve) => {
    const script = document.createElement("script");
    let settled = false;
    const timer = window.setTimeout(() => finish(emptyRadarResult("jsonp", false)), JSONP_TIMEOUT);

    window[callbackName] = (payload) => finish({ ...parseRadarPayload(payload), source: "jsonp", responded: true });
    script.src = url;
    script.async = true;
    script.onerror = () => finish(emptyRadarResult("jsonp", false));

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

async function fetchRadarListDirect(fid, page = 1) {
  try {
    const response = await fetch(buildRadarUrl(fid, page), { cache: "no-store" });
    if (!response.ok) return emptyRadarResult("fetch", false);
    const payload = await response.json();
    return { ...parseRadarPayload(payload), source: "fetch", responded: true };
  } catch {
    return emptyRadarResult("fetch", false);
  }
}

function emptyRadarResult(source = "jsonp", responded = false) {
  return {
    rows: [],
    rawRows: 0,
    filteredRows: 0,
    source,
    responded
  };
}

function parseRadarPayload(payload) {
  const rows = payload?.data?.diff;
  if (!Array.isArray(rows)) return emptyRadarResult("parse", true);
  const parsedRows = rows
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
    });
  const filteredRows = parsedRows.filter((item) => isMainBoardTradable(item.code) && item.marketCapYi >= settings.minMarketCapYi);
  return {
    rows: filteredRows,
    rawRows: parsedRows.length,
    filteredRows: parsedRows.length - filteredRows.length,
    source: "parse",
    responded: true
  };
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

  const rotationGroup = getRadarRotationGroup(item);
  const themeOk = rotationGroup.name && rotationGroup.name !== "其他轮动";
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
  return window.StockTradeRules.getRefreshDelay(settings.refreshSeconds * 1000, {
    tradingWindow: isTradingWindow(),
    hidden: document.hidden
  });
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
    script.src = `https://qt.gtimg.cn/q=${symbol}&_=${Date.now()}`;
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

function fetchValuation(stock) {
  const callbackName = `emValuation_${stock.code}_${Date.now()}_${Math.floor(Math.random() * 100000)}`;
  const secid = `${marketPrefix(stock.code) === "sh" ? "1" : "0"}.${stock.code}`;
  const url = [
    "https://push2.eastmoney.com/api/qt/stock/get",
    `?cb=${callbackName}`,
    `&secid=${secid}`,
    "&fields=f57,f58,f43,f116,f117,f162,f167,f173",
    `&_=${Date.now()}`
  ].join("");

  return new Promise((resolve) => {
    const script = document.createElement("script");
    let settled = false;
    const timer = window.setTimeout(() => finish(null), JSONP_TIMEOUT);

    window[callbackName] = (payload) => finish(parseValuationPayload(stock, payload));
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

async function fetchTechnical(stock) {
  const primary = await fetchEastmoneyTechnical(stock);
  if (primary?.latest) return { ...primary, source: "东方财富", detail: "主K线源" };
  const fallback = await fetchTencentTechnical(stock);
  if (fallback?.latest) return { ...fallback, source: "腾讯备用", detail: "东方财富失败，已用腾讯日K" };
  return null;
}

function fetchEastmoneyTechnical(stock) {
  const callbackName = `emKline_${stock.code}_${Date.now()}_${Math.floor(Math.random() * 100000)}`;
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

async function fetchTencentTechnical(stock) {
  try {
    const symbol = `${marketPrefix(stock.code)}${stock.code}`;
    const url = `https://web.ifzq.gtimg.cn/appstock/app/fqkline/get?param=${symbol},day,,,80,qfq&_=${Date.now()}`;
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

function parseValuationPayload(stock, payload) {
  const data = payload?.data;
  if (!data || String(data.f57 || stock.code) !== stock.code) return null;
  const peDynamic = parseEastmoneyHundredRatio(data.f162);
  const pb = parseEastmoneyHundredRatio(data.f167);
  const roe = parseEastmoneyDirectRatio(data.f173);
  const totalMarketCapYi = toNumber(data.f116) / 100000000;
  const floatMarketCapYi = toNumber(data.f117) / 100000000;

  if (!Number.isFinite(totalMarketCapYi) || totalMarketCapYi <= 0) return null;

  return {
    code: stock.code,
    name: data.f58 || stock.name,
    peDynamic,
    pb,
    roe,
    totalMarketCapYi,
    floatMarketCapYi,
    source: "东方财富PE/PB",
    updatedAt: Date.now()
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
  const volumeBarState = getVolumeBarState(latest);
  const previousVolumes = volumes.slice(Math.max(0, volumes.length - 21), -1);
  const avgVolume20 = avg(previousVolumes.length ? previousVolumes : volumes.slice(-20));
  const recent20 = items.slice(-20);
  const previous20 = items.slice(Math.max(0, items.length - 21), -1);
  const recent20High = Math.max(...recent20.map((item) => item.high));
  const recent20Low = Math.min(...recent20.map((item) => item.low));
  const previous20High = previous20.length ? Math.max(...previous20.map((item) => item.high)) : recent20High;
  const previous20Low = previous20.length ? Math.min(...previous20.map((item) => item.low)) : recent20Low;

  return {
    code: stock.code,
    items,
    latest,
    ma5: avg(closes.slice(-5)),
    ma10: avg(closes.slice(-10)),
    ma20: avg(closes.slice(-20)),
    volumeRatio: avgVolume20 ? latest.volume / avgVolume20 : null,
    volumeRatioPeriod: volumeBarState.period,
    sameTimeVolumeRatio: null,
    recent20High,
    recent20Low,
    previous20High,
    previous20Low,
    return20: closes.length >= 21 ? (latest.close / closes[closes.length - 21] - 1) * 100 : null
  };
}

function parseTencentKlinePayload(stock, payload) {
  const symbol = `${marketPrefix(stock.code)}${stock.code}`;
  const container = payload?.data?.[symbol];
  const lines = container?.qfqday || container?.day || container?.hfqday;
  if (!Array.isArray(lines) || lines.length < 20) return null;
  const items = lines.map((line) => ({
    date: line[0],
    open: Number(line[1]),
    close: Number(line[2]),
    high: Number(line[3]),
    low: Number(line[4]),
    volume: Number(line[5])
  })).filter((item) => Number.isFinite(item.close) && Number.isFinite(item.volume));
  if (items.length < 20) return null;

  const closes = items.map((item) => item.close);
  const volumes = items.map((item) => item.volume);
  const latest = items[items.length - 1];
  const volumeBarState = getVolumeBarState(latest);
  const previousVolumes = volumes.slice(Math.max(0, volumes.length - 21), -1);
  const avgVolume20 = avg(previousVolumes.length ? previousVolumes : volumes.slice(-20));
  const recent20 = items.slice(-20);
  const previous20 = items.slice(Math.max(0, items.length - 21), -1);
  const recent20High = Math.max(...recent20.map((item) => item.high));
  const recent20Low = Math.min(...recent20.map((item) => item.low));
  const previous20High = previous20.length ? Math.max(...previous20.map((item) => item.high)) : recent20High;
  const previous20Low = previous20.length ? Math.min(...previous20.map((item) => item.low)) : recent20Low;

  return {
    code: stock.code,
    items,
    latest,
    ma5: avg(closes.slice(-5)),
    ma10: avg(closes.slice(-10)),
    ma20: avg(closes.slice(-20)),
    volumeRatio: avgVolume20 ? latest.volume / avgVolume20 : null,
    volumeRatioPeriod: volumeBarState.period,
    sameTimeVolumeRatio: null,
    recent20High,
    recent20Low,
    previous20High,
    previous20Low,
    return20: closes.length >= 21 ? (latest.close / closes[closes.length - 21] - 1) * 100 : null
  };
}

function getVolumeBarState(latest) {
  const latestDate = String(latest?.date || "").slice(0, 10);
  const phase = getAuctionPhase().label;
  const sessionUnfinished = phase !== "已收盘" && phase !== "非交易日";
  if (sessionUnfinished && latestDate !== getLocalDateKey()) return { period: "stale" };
  if (sessionUnfinished && latestDate === getLocalDateKey()) return { period: "intraday-pending" };
  return { period: "completed-daily" };
}

function analyzeStock(stock, quote, technical) {
  const normalized = normalizeStock(stock);
  const theme = normalized.theme;
  const strength = getThemeStrength(theme);
  const dataQuality = getDataQuality(quote, technical);
  const mainScore = strength * 6;
  const trend = analyzeTrend(quote, technical);
  const volume = analyzeVolume(quote, technical, trend, normalized.code);
  const risk = analyzeRisk(normalized, quote);
  const riskScore = risk.score;
  const marketContext = getMarketContext(theme, quote);
  const point = analyzeTradePoint(normalized, quote, technical, trend, volume, risk, strength, dataQuality);
  const score = clamp(Math.round(mainScore + trend.score + volume.score + riskScore + point.scoreAdjust + marketContext.scoreAdjust), 0, 100);
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
    marketContext,
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
  const sourceText = technical.source ? ` · ${technical.source}` : "";
  return {
    level,
    label,
    detail: `${technical.latest.date}${sourceText} · 站上${aboveCount}/3条均线 · ${highText} · MA5 ${formatMoney(technical.ma5)}`
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
  const strengthGates = getStrengthGates(stock, quote, analysis);
  if (!strengthGates.allPass) {
    return {
      level: strengthGates.level === "wait" ? "wait" : "warn",
      label: "三闸门未开",
      gaps: strengthGates.failedLabels.length ? strengthGates.failedLabels : ["等三闸门"]
    };
  }

  if (analysis.point.label === "盘中候选") {
    return { level: "wait", label: "盘中候选", gaps: ["等收盘结构确认"] };
  }

  if (analysis.point.side === "买点") {
    return { level: "buy", label: "纪律通过", gaps: [analysis.point.label] };
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
    const marketContext = getMarketContext(stock.theme, quote);
    if (!marketContext.allowsBuy) gaps.push(marketContext.gap || "差环境");
    if (analysis.risk.level !== "ok") gaps.push("差风控");
    if (analysis.volume.hot && !nearHigh && quote.changePercent <= 2) gaps.push("差突破");
    if (analysis.volume.label === "缩量强势" && !nearMa10 && !nearMa20) gaps.push("差回踩位");
    if (!gaps.length) gaps.push("差确认");
  }

  const uniqueGaps = [...new Set(gaps)].slice(0, 5);
  const hardGap = uniqueGaps.some((gap) => ["差K线", "差风控", "差环境"].includes(gap));
  return {
    level: hardGap ? "warn" : uniqueGaps.length <= 2 ? "watch" : "wait",
    label: "纪律缺口",
    gaps: uniqueGaps.length ? uniqueGaps : ["差确认"]
  };
}

function getBuyLights(stock, quote, technical, analysis) {
  const strengthGates = getStrengthGates(stock, quote, analysis);
  const decisionDataGate = getDecisionSnapshotStatus(stock.code, stock, analysis);
  const dataOk = !analysis.dataQuality?.blockBuy && decisionDataGate.state === "pass";
  const structure = quote && technical ? getStructureTrigger(quote, technical, analysis.trend, analysis.volume) : null;
  const structureOk = Boolean(analysis.trend.strong && structure?.signal);
  const funds = getFundsConvergenceLight(stock);
  const envState = !marketState || !marketState.benchmarkDataAvailable ? "wait" : marketState.level === "weak" ? "block" : "pass";
  const themeStateNow = themeState[stock.theme];
  const themeLightState = !themeStateNow || themeStateNow.source !== "动态" ? "wait" : analysis.themeStrength >= 4 ? "pass" : "block";
  const riskOk = analysis.risk.level === "ok";

  const lights = [
    {
      key: "theme",
      label: "主线",
      state: themeLightState,
      detail: `${stock.theme} · ${themeStateNow?.source === "动态" ? `强度 ${analysis.themeStrength}/5` : "等动态板块数据"}`
    },
    {
      key: "market",
      label: "环境",
      state: envState,
      detail: marketState ? `${marketState.label} · ${marketState.tenDayGate?.label || "等上证MA10"}` : "等待市场环境数据"
    },
    {
      key: "structure",
      label: "结构",
      state: structureOk ? "pass" : "wait",
      detail: quote && technical
        ? `${analysis.trend.label} · ${structure?.signal ? structure.mode === "breakout" ? "突破结构待收盘" : `回踩${structure.lineLabel}待收盘` : "等趋势与形态同向"}`
        : "等行情/K线"
    },
    {
      key: "volume",
      label: "量能",
      state: analysis.volume.danger ? "block" : analysis.volume.confirmed ? "pass" : "wait",
      detail: `${analysis.volume.label} · ${analysis.volume.detail}`
    },
    {
      key: "funds",
      label: "资金",
      state: funds.state,
      detail: funds.detail
    },
    {
      key: "risk",
      label: "风控",
      state: riskOk ? "pass" : "block",
      detail: `${analysis.risk.label} · ${analysis.risk.detail}`
    }
  ];

  const passCount = lights.filter((item) => item.state === "pass").length;
  const signalState = !dataOk ? "wait" : analysis.point.label === "盘中候选" ? "candidate" : analysis.point.side === "买点" ? "confirmed" : "wait";
  return {
    dataGate: {
      label: "数据闸门",
      state: dataOk ? "pass" : "wait",
      detail: dataOk ? analysis.dataQuality?.detail || decisionDataGate.reason : decisionDataGate.reason,
      status: dataOk ? "通过" : "等待"
    },
    lights,
    passCount,
    total: lights.length,
    signalState,
    strengthGates,
    setupConfirmed: dataOk && strengthGates.allPass && passCount === lights.length && signalState === "confirmed",
    allPass: dataOk && strengthGates.allPass && passCount === lights.length && signalState === "confirmed"
  };
}

function getFundsConvergenceLight(stock) {
  const age = radarFetchedAt ? Date.now() - radarFetchedAt : Infinity;
  if (age > 180000) return { state: "wait", detail: "资金雷达数据过期/未刷新" };
  const item = radarItems.find((candidate) => candidate.code === stock.code);
  if (!item) return { state: "wait", detail: "未进资金异动候选，不判资金通过" };
  const radarTheme = normalizeTheme(item.radarTheme || item.sector, item.name, "");
  if (radarTheme !== normalizeTheme(stock.theme, stock.name, stock.note)) {
    return { state: "wait", detail: `资金候选归属${radarTheme}，与自选定位不一致` };
  }
  if (item.mainInflowYi <= -1.5) return { state: "block", detail: `主力净流出 ${signed(item.mainInflowYi)}亿` };
  if (item.mainInflowYi >= 1.5 || (item.mainInflowPercent >= 5 && item.mainInflowYi > 0)) {
    return { state: "pass", detail: `主力净流入 ${signed(item.mainInflowYi)}亿 · ${radarFetchedAt ? new Date(radarFetchedAt).toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" }) : ""}` };
  }
  return { state: "wait", detail: `主力净流入 ${signed(item.mainInflowYi)}亿，强度未达确认条件` };
}

function getStrengthGates(stock, quote, analysisLike = {}) {
  const normalized = normalizeStock(stock);
  const theme = normalized.theme;
  const themeInfo = themeState[theme];
  const dynamicThemeStrength = analysisLike.themeStrength || getThemeStrength(theme);
  const marketGate = marketState?.tenDayGate || getMarketTenDayGate(marketState?.indexes || [], null);
  const snapshot = getDecisionSnapshotStatus(normalized.code, normalized, analysisLike);
  const marketAvg = marketState?.benchmarkDataAvailable ? marketState.avgChange : null;
  const themeChange = Number.isFinite(themeInfo?.change) ? themeInfo.change : null;
  const themeGate = tradeRules.evaluateThemeGate({
    source: themeInfo?.source,
    change: themeChange,
    marketAvg,
    strength: dynamicThemeStrength
  });
  const themeRelative = themeGate.relative;
  const stockGate = tradeRules.evaluateStockGate({
    stockChange: Number.isFinite(quote?.changePercent) ? quote.changePercent : null,
    themeChange,
    marketChange: marketAvg
  });
  const stockRelative = stockGate.relativeToMarket;

  const marketPass = marketGate.state === "pass";
  const themePass = themeGate.state === "pass";
  const stockPass = stockGate.state === "pass";

  const gates = [
    {
      key: "market",
      label: "大盘10日线",
      state: marketPass ? "pass" : marketGate.state === "wait" ? "wait" : "block",
      status: marketPass ? "开" : marketGate.state === "wait" ? "等" : "关",
      detail: marketGate.detail || "等待上证MA10"
    },
    {
      key: "theme",
      label: "板块相对强",
      state: themeGate.state,
      status: themePass ? "开" : themeGate.state === "wait" ? "等" : "关",
      detail: themeGate.state !== "wait"
        ? `${theme} ${signed(themeChange)}% · 跑赢大盘 ${signed(themeRelative)}pct · 强度 ${dynamicThemeStrength}/5`
        : `${theme} 等板块刷新，默认强度不放行`
    },
    {
      key: "stock",
      label: "个股强于板块/大盘",
      state: stockGate.state,
      status: stockPass ? "开" : stockGate.state === "wait" ? "等" : "关",
      detail: quote
        ? `${normalized.name} ${signed(quote.changePercent)}% · 强于板块 ${stockGate.relativeToTheme === null ? "待算" : `${signed(stockGate.relativeToTheme)}pct`} · 强于大盘 ${stockRelative === null ? "待算" : `${signed(stockRelative)}pct`}`
        : "等待个股行情"
    }
  ];

  if (!snapshot.coherent) {
    gates.forEach((gate) => {
      gate.state = "wait";
      gate.status = "等";
      gate.detail = snapshot.reason;
    });
  }

  const passCount = gates.filter((gate) => gate.state === "pass").length;
  const waitCount = gates.filter((gate) => gate.state === "wait").length;
  const allPass = passCount === gates.length;
  const level = allPass ? "pass" : waitCount ? "wait" : "block";
  const failedLabels = gates
    .filter((gate) => gate.state !== "pass")
    .map((gate) => gate.state === "wait" ? `等${gate.label}` : `差${gate.label}`);

  return {
    level,
    label: allPass ? "三闸门已开" : "三闸门未开",
    action: allPass ? "允许看六灯买点" : "不确认买点",
    detail: allPass
      ? "上证收盘站在MA10上，板块跑赢大盘，个股同时跑赢板块与大盘，才进入六灯筛选。"
      : !snapshot.coherent
        ? `${snapshot.reason}；未通过时不确认买点。`
        : "三闸门没开时，六灯只能作为观察参考，不触发确认买点。",
    gates,
    failedLabels,
    passCount,
    total: gates.length,
    snapshotCoherent: snapshot.coherent,
    dataGate: snapshot,
    allPass
  };
}

function getDecisionSnapshotStatus(code, stock = null, analysis = null) {
  const timestamps = [quoteFetchedAt[code], technicalFetchedAt[code], marketFetchedAt, themeFetchedAt, radarFetchedAt];
  const quote = quotes[code];
  const technical = technicals[code];
  const theme = stock ? themeState[stock.theme] : null;
  const ready = Boolean(
    quote?.price && quote?.time && technical?.latest && technical?.items?.length &&
    marketState?.benchmarkDataAvailable && theme?.source === "动态" &&
    radarFetchedAt && !analysis?.dataQuality?.blockBuy
  );
  const dataGate = tradeRules.evaluateDecisionDataGate({
    ready,
    timestamps,
    now: Date.now(),
    maxSkewMs: 180000,
    maxAgeMs: 180000
  });
  return { ...dataGate, timestamps };
}

function getCanonicalDecision(stock, quote, technical, analysis, strengthGates, buyLights, sellGrade, structureStop) {
  const dataGate = getDecisionSnapshotStatus(stock.code, stock, analysis);
  const buyState = buyLights?.setupConfirmed
    ? "confirmed"
    : analysis.point.label === "盘中候选" ? "candidate" : "wait";
  const sellAction = sellGrade?.grade === "clear" ? "clear"
    : sellGrade?.grade === "reduce" ? "reduce"
      : sellGrade?.action === "等收盘确认" ? "wait-close"
        : structureStop?.sellGateAction || "hold";
  return {
    ...tradeRules.resolveCanonicalDecision({
      dataState: dataGate.state,
      holding: stock.group === "holding",
      sellAction,
      buyState
    }),
    dataGate,
    strengthGates,
    buyLights
  };
}

function syncReviewContext() {
  if (!reviewFrame?.contentWindow) return;
  const decisions = Object.fromEntries(Object.entries(canonicalDecisionByCode).map(([code, item]) => [code, {
    state: item.state,
    label: item.label,
    reason: item.reason
  }]));
  reviewFrame.contentWindow.postMessage({
    type: "stock-watch-context-sync",
    fees: settings.fees || tradeRules.DEFAULT_FEE_SETTINGS,
    decisions
  }, "*");
}

function renderStrengthGates(strengthGates) {
  return `
    <section class="strength-gate-panel ${strengthGates.level}">
      <div class="strength-gate-head">
        <div>
          <strong>强势三闸门</strong>
          <span>${escapeHtml(strengthGates.action)} · ${strengthGates.passCount}/${strengthGates.total}</span>
        </div>
        <span class="strength-gate-badge ${strengthGates.level}">${escapeHtml(strengthGates.label)}</span>
      </div>
      <p>${escapeHtml(strengthGates.detail)}</p>
      <div class="strength-gate-grid">
        ${strengthGates.gates.map((gate) => `
          <div class="strength-gate ${gate.state}">
            <b>${escapeHtml(gate.label)}</b>
            <span>${escapeHtml(gate.status)}</span>
            <small>${escapeHtml(gate.detail)}</small>
          </div>
        `).join("")}
      </div>
    </section>
  `;
}

function getShapeLight(quote, technical, analysis) {
  if (!quote || !technical) {
    return { key: "shape", label: "形态", state: "wait", detail: "等行情/K线" };
  }

  const structure = getStructureTrigger(quote, technical, analysis.trend, analysis.volume);
  if (structure.signal) {
    const detail = structure.mode === "breakout"
      ? "越过前20日压力，待收盘确认"
      : `缩量回踩${structure.lineLabel}，待收盘确认`;
    return { key: "shape", label: "形态", state: "pass", detail };
  }
  return { key: "shape", label: "形态", state: "wait", detail: "等放量突破或缩量回踩" };
}

function getStructureTrigger(quote, technical, trend, volume) {
  if (!quote || !technical) return { signal: false, closeConfirmed: false, mode: "", line: 0, lineLabel: "" };
  const price = quote.price || technical.latest?.close || 0;
  const breakoutLine = Number(technical.previous20High) || 0;
  const breakout = Boolean(breakoutLine && price >= breakoutLine * 1.002 && volume.hot);
  if (breakout) {
    const closeConfirmed = isCurrentSessionClosed(technical) && technical.latest.close >= breakoutLine * 1.002 && volume.hot;
    return { signal: true, closeConfirmed, mode: "breakout", line: breakoutLine, lineLabel: "前20日高点" };
  }

  const supportLines = [
    { label: "MA10", value: getCompletedMovingAverage(technical, 10) },
    { label: "MA20", value: getCompletedMovingAverage(technical, 20) }
  ].filter((item) => item.value > 0 && price >= item.value && price <= item.value * 1.015);
  const pullbackLine = supportLines.sort((a, b) => Math.abs(price / a.value - 1) - Math.abs(price / b.value - 1))[0];
  const pullback = Boolean(trend.strong && volume.label === "缩量强势" && pullbackLine);
  if (!pullback) return { signal: false, closeConfirmed: false, mode: "", line: 0, lineLabel: "" };

  const closeConfirmed = isCurrentSessionClosed(technical) &&
    technical.latest.low <= pullbackLine.value * 1.015 &&
    technical.latest.close >= pullbackLine.value &&
    volume.label === "缩量强势";
  return { signal: true, closeConfirmed, mode: "pullback", line: pullbackLine.value, lineLabel: pullbackLine.label };
}

function isCurrentSessionClosed(technical) {
  return getAuctionPhase().label === "已收盘" && String(technical?.latest?.date || "").slice(0, 10) === getLocalDateKey();
}

function getLightState(pass, waiting = false) {
  if (pass) return "pass";
  return waiting ? "wait" : "wait";
}

function renderBuyLights(buyLights) {
  const status = buyLights.dataGate.state !== "pass"
    ? `数据待齐 · ${buyLights.dataGate.detail}`
    : buyLights.allPass
    ? "三闸门+六灯+结构收盘确认"
    : buyLights.signalState === "candidate"
      ? "盘中候选·等收盘确认"
    : !buyLights.strengthGates?.allPass
      ? "三闸门未开，六灯仅参考"
      : `${buyLights.passCount}/${buyLights.total} 通过`;
  return `
    <section class="buy-light-panel ${buyLights.allPass ? "all-pass" : buyLights.dataGate.state === "block" ? "blocked" : "partial"}">
      <div class="buy-light-head">
        <div>
          <strong>六灯纪律</strong>
          <span>${status}</span>
        </div>
        <span class="data-gate ${buyLights.dataGate.state !== "pass" ? "wait" : buyLights.strengthGates?.allPass ? "pass" : "block"}">${buyLights.strengthGates?.label || buyLights.dataGate.label}</span>
      </div>
      <div class="buy-light-grid">
        ${buyLights.lights.map((item) => `
          <div class="buy-light ${item.state}">
            <b>${escapeHtml(item.label)}</b>
            <span>${item.state === "pass" ? "亮" : item.state === "block" ? "阻断" : "待补"}</span>
            <small>${escapeHtml(item.detail)}</small>
          </div>
        `).join("")}
      </div>
    </section>
  `;
}

function getPreBuyCheck(stock, quote, technical, analysis, buyGate, strengthGates, buyLights, planCheck) {
  const plan = normalizeTradePlan(stock.plan);
  const cost = Number(stock.cost);
  const stop = Number(stock.stop);
  const maxLoss = Number(plan.maxLoss);
  const setupConfirmed = buyLights.setupConfirmed === true;
  const positionPermission = tradeRules.evaluatePositionPermission({
    setupConfirmed,
    entryPrice: cost,
    stopPrice: stop,
    maxLoss: plan.riskBudgetConfirmed ? maxLoss : 0,
    feeSettings: settings.fees
  });
  const blockers = [];
  const waits = [];
  const buyPointText = analysis.point.side === "买点"
    ? analysis.point.label
    : buyGate.gaps.slice(0, 3).join("、") || "等突破/回踩确认";

  if (!quote) blockers.push("没有实时价");
  if (!technical) blockers.push("没有K线");
  if (analysis.dataQuality?.blockBuy || buyLights.dataGate.state !== "pass") blockers.push("统一数据闸门未通过");
  if (!cost) blockers.push("未填计划买价");
  if (!stop) blockers.push("未填止损");
  if (!maxLoss || !plan.riskBudgetConfirmed) blockers.push("未确认单笔最大亏损");
  if (stop && cost && stop >= cost) blockers.push("止损必须低于买入价");
  if (setupConfirmed && plan.riskBudgetConfirmed && cost && stop && stop < cost && !positionPermission.allowed) blockers.push(positionPermission.reason);
  if (!strengthGates?.allPass) waits.push(...(strengthGates?.failedLabels || ["三闸门未开"]));
  if (buyGate.level !== "buy") waits.push(...buyGate.gaps);
  if (analysis.risk?.level !== "ok") blockers.push("风控不过");

  const uniqueBlockers = [...new Set(blockers)].slice(0, 5);
  const uniqueWaits = [...new Set(waits)].filter(Boolean).slice(0, 5);
  const canBuy = stock.group !== "holding" && !uniqueBlockers.length && buyLights.allPass && buyGate.level === "buy" && positionPermission.allowed;
  const level = uniqueBlockers.length ? "danger" : canBuy ? "ok" : uniqueWaits.length <= 2 ? "watch" : "warn";
  const label = uniqueBlockers.length
    ? setupConfirmed ? "形态确认·仓位未放行" : "计划未完成"
    : canBuy ? "允许小仓" : stock.group === "holding" && setupConfirmed ? "持仓另看加仓闸门" : "等确认";
  const action = uniqueBlockers.length
    ? "先补计划"
    : canBuy
      ? "按手数试错"
      : "只盯不下单";
  const positionDetail = planCheck.suggestedShares
    ? `建议≤${planCheck.suggestedLots}手 / ${planCheck.suggestedShares}股，单笔最多亏${formatMoney(planCheck.maxLoss)}元`
    : planCheck.maxLoss
      ? "等价格、止损和买入计划完整后再算手数"
      : "先填单笔最大亏损，再反推仓位";
  const sellDetail = stop
    ? `错了看${formatMoney(stop)}；${planCheck.sellGate || "按卖出闸门执行"}`
    : "没有止损不下单";
  const detail = uniqueBlockers.length
    ? `买前先处理：${uniqueBlockers.join("、")}。`
    : canBuy
      ? "三闸门和六灯通过，也只能按计划手数试错；买后马上记录买入价、股数和错了哪里卖。"
    : stock.group === "holding" && setupConfirmed
      ? "形态已确认；持仓加仓仍需独立通过分批加仓闸门。"
      : `还差：${uniqueWaits.join("、") || "买点确认"}；没补齐前不把冲动当机会。`;

  return {
    level,
    label,
    action,
    detail,
    setupConfirmed,
    points: uniqueBlockers.length ? uniqueBlockers : uniqueWaits.length ? uniqueWaits : ["写买入价", "写止损", "买后复盘"],
    steps: [
      {
        label: "1 三闸门",
        state: strengthGates?.allPass ? "pass" : strengthGates?.level === "wait" ? "wait" : "block",
        status: strengthGates?.allPass ? "通过" : strengthGates?.level === "wait" ? "待补" : "阻断",
        detail: strengthGates?.detail || "等大盘、板块、个股相对强"
      },
      {
        label: "2 买点",
        state: canBuy || buyGate.level === "buy" ? "pass" : buyGate.level === "wait" ? "wait" : "block",
        status: buyGate.level === "buy" ? "通过" : buyGate.level === "wait" ? "待补" : "阻断",
        detail: buyPointText
      },
      {
        label: "3 仓位",
        state: planCheck.suggestedShares ? "pass" : maxLoss ? "wait" : "block",
        status: planCheck.suggestedShares ? "通过" : maxLoss ? "待补" : "阻断",
        detail: positionDetail
      },
      {
        label: "4 卖出预案",
        state: stop && planCheck.sellGate ? "pass" : "block",
        status: stop && planCheck.sellGate ? "通过" : "阻断",
        detail: sellDetail
      }
    ]
  };
}

function renderPreBuyCheck(check) {
  return `
    <section class="pre-buy-check ${check.level}">
      <div class="pre-buy-head">
        <div>
          <strong>买前检查</strong>
          <span>${check.setupConfirmed ? "形态已确认" : "形态未确认"} · ${escapeHtml(check.action)}</span>
        </div>
        <b>${escapeHtml(check.label)}</b>
      </div>
      <p>${escapeHtml(check.detail)}</p>
      <div class="pre-buy-grid">
        ${check.steps.map((step) => `
          <div class="pre-buy-step ${step.state}">
            <strong>${escapeHtml(step.label)}</strong>
            <span>${escapeHtml(step.status)}</span>
            <small>${escapeHtml(step.detail)}</small>
          </div>
        `).join("")}
      </div>
      <div class="pre-buy-points">
        ${check.points.slice(0, 5).map((point) => `<span>${escapeHtml(point)}</span>`).join("")}
      </div>
    </section>
  `;
}

function getSupportCheck(stock, quote, technical, analysis) {
  if (!quote) {
    return {
      level: "wait",
      label: "待承接",
      action: "等行情",
      detail: "实时行情未加载，不能判断承接",
      points: ["等现价、涨跌幅、日内高低点"]
    };
  }

  const price = quote.price || 0;
  const open = quote.open || quote.previousClose || 0;
  const low = quote.low || price;
  const high = quote.high || price;
  const stop = Number(stock.stop);
  const relativeStrength = marketState?.benchmarkDataAvailable ? quote.changePercent - marketState.avgChange : null;
  const lowRecoveryPct = low && price ? (price / low - 1) * 100 : 0;
  const highPullbackPct = high && price ? (price / high - 1) * 100 : 0;
  const holdsOpen = open ? price >= open * 0.995 : quote.changePercent >= 0;
  const redAndRelative = quote.changePercent > 0 && relativeStrength !== null && relativeStrength >= 0.8;
  const nearLow = high && low && high > low ? (price - low) / (high - low) <= 0.25 : false;
  const aboveMa10 = Boolean(technical?.ma10 && price >= technical.ma10);
  const aboveMa20 = Boolean(technical?.ma20 && price >= technical.ma20);
  const hardStop = Boolean(stop && price <= stop);
  const noSupport = hardStop || (analysis.volume.danger && nearLow && quote.changePercent < 0) || (!holdsOpen && lowRecoveryPct < 0.8 && quote.changePercent < -2);
  const strongSupport = !noSupport && redAndRelative && lowRecoveryPct >= 1.2 && (aboveMa10 || aboveMa20 || analysis.trend.strong);
  const normalSupport = !noSupport && (holdsOpen || lowRecoveryPct >= 1.5 || relativeStrength >= 1.2) && !analysis.volume.danger;

  const points = [];
  points.push(`低点收回 ${lowRecoveryPct.toFixed(1)}%`);
  if (highPullbackPct < -0.5) points.push(`距高点 ${signed(highPullbackPct)}%`);
  if (relativeStrength !== null) points.push(`跑赢大盘 ${signed(relativeStrength)}pct`);
  points.push(holdsOpen ? "现价守住开盘附近" : "现价低于开盘");
  if (analysis.volume.danger) points.push("放量分歧");
  if (aboveMa10 || aboveMa20) points.push(aboveMa10 ? "站上MA10" : "站上MA20");

  if (hardStop) {
    return {
      level: "danger",
      label: "无承接",
      action: "按计划止损",
      detail: `现价已触及止损 ${formatMoney(stop)}`,
      points
    };
  }
  if (strongSupport) {
    return {
      level: "hot",
      label: marketState?.level === "weak" ? "逆势承接" : "承接好",
      action: "别急着卖",
      detail: "红盘、低点收回、相对强度和均线状态同时较好",
      points
    };
  }
  if (normalSupport) {
    return {
      level: "watch",
      label: "有承接",
      action: "等确认",
      detail: "没有明显闷杀，先看下一次回踩是否破位",
      points
    };
  }
  if (noSupport) {
    return {
      level: "danger",
      label: "承接差",
      action: "反抽减仓",
      detail: "低位附近放量分歧或跌破计划位置，禁止硬扛幻想",
      points
    };
  }
  return {
    level: "warn",
    label: "承接一般",
    action: "只观察",
    detail: "暂未形成强承接，等红盘、缩量回踩或资金回流确认",
    points
  };
}

function renderSupportCheck(support) {
  return `
    <section class="support-check ${support.level}">
      <div class="support-head">
        <div>
          <strong>承接判断</strong>
          <span>${escapeHtml(support.label)} · ${escapeHtml(support.action)}</span>
        </div>
        <span class="support-level ${support.level}">${escapeHtml(support.action)}</span>
      </div>
      <p>${escapeHtml(support.detail)}</p>
      <div class="support-points">
        ${support.points.slice(0, 5).map((point) => `<span>${escapeHtml(point)}</span>`).join("")}
      </div>
    </section>
  `;
}

function getProfitLockRatio(pnlPct) {
  if (pnlPct >= 35) return 0.55;
  if (pnlPct >= 20) return 0.45;
  if (pnlPct >= 10) return 0.35;
  if (pnlPct >= 5) return 0.25;
  return 0.1;
}

function getDynamicStopPlan(stock, quote, technical, analysis, support) {
  const plan = normalizeTradePlan(stock.plan);
  const profile = tradePlanProfiles[plan.type] || tradePlanProfiles.swing;
  const sellProfile = sellTimingProfiles[plan.sellTiming] || sellTimingProfiles["close-confirm"];
  const cost = Number(stock.cost);
  const manualStop = Number(stock.stop);
  const price = quote?.price || 0;
  const netPnl = price && cost ? getStockNetPnl(stock, price) : null;
  const pnlPct = netPnl ? netPnl.pnlPct : null;
  const defaultStopLine = cost ? cost * (1 - profile.defaultStopPct / 100) : 0;
  const plannedStopLine = cost && manualStop && manualStop < cost ? manualStop : defaultStopLine;
  const points = [];

  if (!cost) {
    return {
      level: "wait",
      label: "未生成",
      action: "先填成本",
      detail: "动态止损必须先知道成本价，否则无法区分保护本金和保护利润。",
      cost,
      price,
      pnlPct: null,
      protectLine: 0,
      hardLine: 0,
      riskText: "无法计算",
      ruleText: "编辑自选，补成本价、止损价和股数",
      points: ["成本价是止损计划的锚", "没有成本就不能判断卖出是否合理"]
    };
  }

  if (!price) {
    return {
      level: "wait",
      label: "等行情",
      action: "只生成预案",
      detail: "实时价未加载，先按成本和交易类型生成静态止损线，等行情回来后再动态上移。",
      cost,
      price,
      pnlPct: null,
      protectLine: plannedStopLine,
      hardLine: plannedStopLine,
      riskText: `预案亏损 ${profile.defaultStopPct.toFixed(1)}%`,
      ruleText: `${sellProfile.gate}；没有实时价不做临场判断`,
      points: [`成本 ${formatMoney(cost)}`, `预案止损 ${formatMoney(plannedStopLine)}`, "等现价、涨跌幅和承接状态"]
    };
  }

  let protectLine = plannedStopLine;
  let hardLine = plannedStopLine;
  let label = "按计划";
  let action = "继续持有";
  let detail = "现价仍在计划止损线之上，先按预案执行。";
  let riskText = `最大亏损 ${(plannedStopLine && plannedStopLine < cost ? (1 - plannedStopLine / cost) * 100 : profile.defaultStopPct).toFixed(1)}%`;
  let ruleText = sellProfile.gate;

  if (pnlPct !== null && pnlPct > 0) {
    const lockRatio = getProfitLockRatio(pnlPct);
    const profitProtectLine = cost * (1 + (pnlPct / 100) * lockRatio);
    const maProtectLines = [
      technical?.ma20 ? technical.ma20 * 0.985 : 0,
      plan.type === "short" && technical?.ma10 ? technical.ma10 * 0.985 : 0
    ].filter(Boolean);
    const manualProtectLine = manualStop && manualStop > cost && manualStop < price ? manualStop : 0;
    const rawProtectLine = Math.max(plannedStopLine, profitProtectLine, manualProtectLine, ...maProtectLines);
    protectLine = Math.min(price * 0.985, rawProtectLine);
    if (pnlPct >= 8) protectLine = Math.max(cost * 1.005, protectLine);
    hardLine = pnlPct >= 5
      ? Math.max(plannedStopLine, cost, protectLine * 0.985)
      : Math.max(plannedStopLine, protectLine * 0.985);
    const protectedProfitPct = (protectLine / cost - 1) * 100;
    label = "保护利润";
    action = "盯保护线";
    detail = `已有盈利垫 ${signed(pnlPct)}%，动态止损从保本金转为保护利润。`;
    riskText = protectedProfitPct > 0
      ? `已保护约 ${protectedProfitPct.toFixed(1)}pct 盈利`
      : "先保护本金，不让小盈变大亏";
    ruleText = plan.sellTiming === "hard-stop"
      ? "盘中跌破硬线可执行，跌破保护线先减仓"
      : `${sellProfile.gate}；跌破保护线先减仓，硬线不讲故事`;
    points.push(`盈利垫 ${signed(pnlPct)}%`);
    points.push(`锁利系数 ${(lockRatio * 100).toFixed(0)}%`);
    if (technical?.ma20) points.push(`MA20参考 ${formatMoney(technical.ma20)}`);
  } else if (pnlPct !== null) {
    points.push(`浮亏 ${signed(pnlPct)}%`);
    points.push(`成本止损 ${formatMoney(plannedStopLine)}`);
    if (manualStop && manualStop < cost) points.push("使用手动止损价");
  }

  const nearProtect = Boolean(price > hardLine && price <= protectLine * 1.01);
  const hitHardStop = Boolean(price <= hardLine);
  const weakSupport = support?.level === "danger";
  const holding = stock.group === "holding";
  const closeConfirmed = isCurrentSessionClosed(technical) &&
    (technical.latest.close <= hardLine || support?.action === "按计划止损");
  const sellGate = tradeRules.resolveSellGate({
    holding,
    sellTiming: plan.sellTiming,
    stopTouched: hitHardStop,
    structureTouched: support?.action === "按计划止损",
    closeConfirmed
  });
  const stopTriggered = holding ? sellGate.action === "clear" : hitHardStop;

  if (stopTriggered) {
    label = "触发止损";
    action = "执行预案";
    detail = "现价已到硬止损或承接判断要求按计划止损，先守纪律。";
  } else if (holding && sellGate.action === "reduce-half") {
    label = "盘中触线";
    action = "先减半";
    detail = "已触发先减半规则；余仓等收盘确认，不临时改成全清。";
  } else if (holding && sellGate.action === "wait-close") {
    label = "盘中触线待确认";
    action = "等收盘确认";
    detail = "盘中触及止损线但收盘闸门未确认；按所选计划执行，不把盘中触线写成已清仓。";
  } else if (nearProtect || weakSupport) {
    label = weakSupport ? "承接转弱" : "接近保护线";
    action = weakSupport ? "反抽处理" : "先减/等确认";
    detail = weakSupport
      ? "承接变差时，不等成本价被动防守；反抽不能收回就执行计划。"
      : "现价接近动态保护线，先准备分批，不在急跌最低点情绪清仓。";
  } else if (pnlPct !== null && pnlPct >= 10) {
    label = "盈利保护";
    action = "守强去弱";
    detail = "盈利垫较厚，核心是保护利润并让强趋势继续奔跑。";
  } else if (pnlPct !== null && pnlPct >= 3) {
    label = "小盈保护";
    action = "别让盈利变亏";
    detail = "已有小幅盈利，止损线开始向上靠近成本区。";
  }

  const level = stopTriggered
    ? "danger"
    : holding && (sellGate.action === "reduce-half" || sellGate.action === "wait-close") || nearProtect || weakSupport
      ? "warn"
      : pnlPct !== null && pnlPct >= 10
        ? "hot"
        : pnlPct !== null && pnlPct >= 3
          ? "watch"
          : "ok";

  if (weakSupport) points.push(`承接：${support.label}`);
  points.push(`硬线 ${formatMoney(hardLine)}`);

  return {
    level,
    label,
    action,
    detail,
    cost,
    price,
    pnlPct,
    protectLine,
    hardLine,
    riskText,
    ruleText,
    points
  };
}

function renderDynamicStopPlan(stopPlan) {
  const pnlClass = stopPlan.pnlPct === null ? "flat" : getChangeClass(stopPlan.pnlPct);
  const pnlText = stopPlan.pnlPct === null ? "--" : `${signed(stopPlan.pnlPct)}%`;
  const priceText = stopPlan.price ? formatMoney(stopPlan.price) : "--";
  const protectText = stopPlan.protectLine ? formatMoney(stopPlan.protectLine) : "--";
  const hardText = stopPlan.hardLine ? formatMoney(stopPlan.hardLine) : "--";

  return `
    <section class="dynamic-stop-plan ${stopPlan.level}">
      <div class="dynamic-stop-head">
        <div>
          <strong>计划止损</strong>
          <span>${escapeHtml(stopPlan.label)} · ${escapeHtml(stopPlan.action)}</span>
        </div>
        <span class="stop-level ${stopPlan.level}">${escapeHtml(stopPlan.action)}</span>
      </div>
      <div class="dynamic-stop-grid">
        <div>
          <span>成本 / 现价</span>
          <strong>${formatMoney(stopPlan.cost)} / ${priceText}</strong>
          <small class="${pnlClass}">盈亏 ${pnlText}</small>
        </div>
        <div>
          <span>保护线</span>
          <strong>${protectText}</strong>
          <small>跌破先减仓或等收盘确认</small>
        </div>
        <div>
          <span>硬止损</span>
          <strong>${hardText}</strong>
          <small>${escapeHtml(stopPlan.riskText)}</small>
        </div>
        <div>
          <span>执行规则</span>
          <strong>${escapeHtml(stopPlan.ruleText)}</strong>
          <small>${escapeHtml(stopPlan.detail)}</small>
        </div>
      </div>
      <div class="dynamic-stop-points">
        ${stopPlan.points.slice(0, 5).map((point) => `<span>${escapeHtml(point)}</span>`).join("")}
      </div>
    </section>
  `;
}

function formatPlanLine(value) {
  return value ? formatMoney(value) : "--";
}

function getLineState(price, line) {
  if (!price || !line) return "wait";
  if (price < line) return "block";
  if (price <= line * 1.015) return "wait";
  return "pass";
}

function getLineDistance(price, line) {
  if (!price || !line) return "待算";
  return `距离 ${signed((price / line - 1) * 100)}%`;
}

function getStructureStopPlan(stock, quote, technical, analysis, support, dynamicStop) {
  if (!quote || !technical) {
    return {
      level: "wait",
      label: "待生成",
      action: "等行情/K线",
      detail: "结构止损需要实时价和日K，数据不完整时只看手动止损。",
      mainLine: Number(stock.stop) || 0,
      points: ["等现价", "等K线", "先别把分数当止损"],
      lines: [
        { label: "手动硬线", value: Number(stock.stop) || 0, state: Number(stock.stop) ? "wait" : "block", rule: stock.stop ? "你填的计划止损，优先执行" : "未填止损，先补计划" }
      ]
    };
  }

  const items = technical.items || [];
  const latest = technical.latest || {};
  const previous = items.length >= 2 ? items[items.length - 2] : null;
  const price = quote.price || latest.close || 0;
  const manualStop = Number(stock.stop) || 0;
  const previousLow = previous?.low || 0;
  const previousHigh = previous?.high || 0;
  const breakoutLine = technical.previous20High || previousHigh || 0;
  const recentLow10 = items.length >= 3
    ? Math.min(...items.slice(Math.max(0, items.length - 11), -1).map((item) => item.low).filter(Number.isFinite))
    : 0;
  const majorLine = technical.ma20 || technical.previous20Low || recentLow10 || 0;
  const trendLine = technical.ma10 || technical.ma20 || 0;
  const breakoutInPlay = Boolean(breakoutLine && (latest.high >= breakoutLine || price >= breakoutLine));
  const activeBreakout = Boolean(breakoutInPlay && isCurrentSessionClosed(technical) && latest.close >= breakoutLine * 1.002);
  const structureLine = breakoutInPlay ? breakoutLine : previousLow || trendLine || manualStop;
  const shortLine = breakoutInPlay ? breakoutLine : previousLow || latest.low || manualStop;
  const hardLine = tradeRules.getEffectiveStopLine(manualStop, dynamicStop?.hardLine) || structureLine || majorLine;

  const brokeShort = Boolean(shortLine && price < shortLine);
  const brokeStructure = Boolean(structureLine && price < structureLine);
  const brokeMajor = Boolean(majorLine && price < majorLine && quote.changePercent < -1);
  const hitHard = Boolean(hardLine && price <= hardLine);
  const nearStructure = Boolean(structureLine && price > structureLine && price <= structureLine * 1.015);
  const volumeBreak = Boolean(analysis.volume.danger || quote.changePercent <= -4);
  const holding = stock.group === "holding";
  const structureTouched = brokeShort || brokeStructure || brokeMajor || support?.action === "按计划止损";
  const closeConfirmed = isCurrentSessionClosed(technical) && Boolean(
    latest.close <= hardLine ||
    (shortLine && latest.close < shortLine) ||
    (structureLine && latest.close < structureLine) ||
    support?.action === "按计划止损"
  );
  const sellGate = tradeRules.resolveSellGate({
    holding,
    sellTiming: normalizeTradePlan(stock.plan).sellTiming,
    stopTouched: hitHard,
    structureTouched,
    closeConfirmed
  });
  const structureStopConfirmed = holding
    ? sellGate.action === "clear"
    : hitHard || (brokeStructure && volumeBreak) || support?.action === "按计划止损";

  let level = "watch";
  let label = activeBreakout ? "突破收盘确认" : breakoutInPlay ? "突破盘中候选" : "结构观察";
  let action = breakoutInPlay && !activeBreakout ? "等收盘" : "按线持有";
  let detail = activeBreakout
    ? "收盘站上突破线，后续观察前压力能否转成支撑。"
    : breakoutInPlay
      ? "盘中越过突破线，未收盘确认前仍是候选，不据此加仓。"
      : "还不是突破结构，先按前低、均线和手动止损分层管理。";

  if (structureStopConfirmed) {
    level = "danger";
    label = "结构破坏";
    action = holding ? "执行风控" : "买点失效";
    detail = holding ? "收盘结构或硬止损已确认破坏，按所选卖出闸门执行。" : "结构位失守，原有买点逻辑失效，不做买入。";
  } else if (holding && sellGate.action === "wait-close") {
    level = "warn";
    label = "盘中破结构";
    action = "等收盘确认";
    detail = "盘中跌破结构线但尚未收盘确认；按计划观察，不把盘中下探直接等同清仓。";
  } else if (holding && sellGate.action === "reduce-half") {
    level = "warn";
    label = "先减半";
    action = "余仓等收盘";
    detail = "触发先减半闸门；剩余仓位只按收盘结构确认处理。";
  } else if (brokeShort || brokeMajor || support?.level === "danger") {
    level = "warn";
    label = "短线破坏";
    action = "降级/减仓";
    detail = "短线支撑已经失守，先降级观察；反抽收不回关键线就按计划处理。";
  } else if (nearStructure) {
    level = "warn";
    label = "回踩验线";
    action = "等收回";
    detail = "价格贴近结构线，不能加仓；只看缩量回踩后能否重新拉回。";
  } else if (activeBreakout && support?.level === "hot") {
    level = "hot";
    label = "突破承接";
    action = "可持有";
    detail = "突破线之上且承接较好，先让市场验证趋势，不急着情绪卖。";
  }

  const lines = [
    {
      label: "短线止损",
      value: shortLine,
      state: getLineState(price, shortLine),
      rule: activeBreakout
        ? `跌破突破线 ${formatPlanLine(shortLine)} 且收不回，突破买点失败`
        : `跌破前低 ${formatPlanLine(shortLine)} 且收不回，短线修复失败`
    },
    {
      label: "结构止损",
      value: structureLine,
      state: getLineState(price, structureLine),
      rule: activeBreakout
        ? "前压力不能变支撑，就不算真突破"
        : "前低/趋势线失守，先从买点候选降级"
    },
    {
      label: "大结构止损",
      value: majorLine,
      state: getLineState(price, majorLine),
      rule: "趋势仓最后防线，跌破后不再用故事硬扛"
    },
    {
      label: "手动硬线",
      value: manualStop,
      state: manualStop ? getLineState(price, manualStop) : "block",
      rule: manualStop ? "你填的计划止损，触发就优先执行" : "未填止损，买前检查会阻断"
    }
  ];

  const points = [
    activeBreakout ? `突破线 ${formatPlanLine(breakoutLine)}` : `前低 ${formatPlanLine(previousLow)}`,
    `现价 ${formatMoney(price)}`,
    `短线 ${getLineDistance(price, shortLine)}`,
    `结构 ${getLineDistance(price, structureLine)}`,
    analysis.volume.danger ? "放量分歧" : "量能未触发危险"
  ];

  return {
    level,
    label,
    action,
    detail,
    mainLine: structureLine,
    shortLine,
    majorLine,
    hardLine,
    hardTouched: hitHard,
    structureTouched,
    closeConfirmed,
    sellGateAction: sellGate.action,
    activeBreakout,
    points,
    lines
  };
}

function renderStructureStopPlan(plan) {
  return `
    <section class="structure-stop-plan ${plan.level}">
      <div class="structure-stop-head">
        <div>
          <strong>结构止损</strong>
          <span>${escapeHtml(plan.label)} · ${escapeHtml(plan.action)}</span>
        </div>
        <span class="structure-stop-badge ${plan.level}">${escapeHtml(plan.action)}</span>
      </div>
      <p>${escapeHtml(plan.detail)}</p>
      <div class="structure-stop-grid">
        ${plan.lines.map((line) => `
          <div class="structure-stop-line ${line.state}">
            <span>${escapeHtml(line.label)}</span>
            <strong>${formatPlanLine(line.value)}</strong>
            <small>${escapeHtml(line.rule)}</small>
          </div>
        `).join("")}
      </div>
      <div class="structure-stop-points">
        ${plan.points.slice(0, 5).map((point) => `<span>${escapeHtml(point)}</span>`).join("")}
      </div>
    </section>
  `;
}

function getScaleLotPlan(planCheck, price) {
  const totalShares = planCheck.suggestedShares || 0;
  if (!totalShares) {
    return {
      total: 0,
      first: price ? 100 : 0,
      second: 0,
      third: 0,
      text: "先补成本/止损/最大亏损"
    };
  }
  const first = Math.max(100, Math.floor(totalShares * 0.34 / 100) * 100);
  const second = Math.max(0, Math.floor(totalShares * 0.33 / 100) * 100);
  const third = Math.max(0, totalShares - first - second);
  return {
    total: totalShares,
    first,
    second,
    third,
    text: `计划≤${planCheck.suggestedLots}手 / ${totalShares}股`
  };
}

function getScaleInPlan(stock, quote, technical, analysis, buyGate, buyLights, structureStop, planCheck, support) {
  const price = quote?.price || technical?.latest?.close || 0;
  const cost = Number(stock.cost) || 0;
  const shares = Number(stock.shares) || 0;
  const netPnl = price && cost ? getStockNetPnl(stock, price) : null;
  const pnlPct = netPnl ? netPnl.pnlPct : null;
  const lotPlan = getScaleLotPlan(planCheck, price);
  const blockers = [];
  const waits = [];
  const confirmedBuy = analysis.point.side === "买点" && buyGate.level === "buy" && buyLights.allPass;

  if (analysis.dataQuality?.blockBuy || buyLights.dataGate.state !== "pass") blockers.push("统一数据闸门未通过");
  if (!planCheck.maxLoss || !planCheck.riskBudgetConfirmed) blockers.push("未确认单笔最大亏损");
  if (!stock.stop) blockers.push("未设手动结构止损线");
  if (structureStop?.level === "danger") blockers.push("结构破坏");
  if (structureStop?.hardLine && price <= structureStop.hardLine) blockers.push("已触及硬止损线");
  if (support?.level === "danger") blockers.push("承接转弱");
  if (analysis.volume.danger) blockers.push("放量分歧");
  if (stock.group === "holding" && pnlPct !== null && pnlPct <= 0) blockers.push("亏损仓不补");
  if (!buyLights.strengthGates?.allPass) waits.push("三闸门未开");
  if (!confirmedBuy) waits.push(analysis.point.label === "盘中候选" ? "等收盘确认" : "等新确认买点");
  if (!shares && stock.group === "holding") waits.push("持仓未填股数");

  const withinRiskBudget = (addShares) => {
    const maxLoss = planCheck.riskBudgetConfirmed ? Number(planCheck.maxLoss) || 0 : 0;
    const stopLine = Number(stock.stop) || 0;
    const entryCost = cost || price;
    if (!maxLoss || !stopLine || !entryCost || !price || !addShares) return false;
    const newShares = shares + addShares;
    const plannedExposure = shares * entryCost + addShares * price;
    const riskAtStop = Math.max(0, plannedExposure - newShares * stopLine)
      + tradeRules.estimateTradeFees(entryCost, shares, "buy", settings.fees).total
      + tradeRules.estimateTradeFees(price, addShares, "buy", settings.fees).total
      + tradeRules.estimateTradeFees(stopLine, newShares, "sell", settings.fees).total;
    return riskAtStop <= maxLoss;
  };

  const structureIntact = structureStop?.level !== "danger" &&
    (!structureStop?.mainLine || price >= structureStop.mainLine);
  const commonAdd = {
    holding: stock.group === "holding",
    profitable: pnlPct !== null && pnlPct > 0,
    gatesOpen: buyLights.strengthGates?.allPass === true,
    sixLightsPass: buyLights.allPass === true,
    structureIntact,
    supportOk: ["hot", "watch"].includes(support?.level),
    volumeDanger: analysis.volume.danger
  };
  const secondAllowed = tradeRules.evaluateScaleIn({
    ...commonAdd,
    freshBuyConfirmed: confirmedBuy && analysis.point.label === "缩量回踩",
    withinRiskBudget: withinRiskBudget(lotPlan.second)
  }).allowed;
  const thirdAllowed = tradeRules.evaluateScaleIn({
    ...commonAdd,
    freshBuyConfirmed: confirmedBuy && analysis.point.label === "放量突破" && pnlPct >= 3,
    withinRiskBudget: withinRiskBudget(lotPlan.third)
  }).allowed;

  const canFirst = !blockers.length && stock.group !== "holding" && confirmedBuy && withinRiskBudget(lotPlan.first);
  const canSecond = !blockers.length && secondAllowed && shares > 0;
  const canThird = !blockers.length && thirdAllowed && shares > 0;
  if (stock.group === "holding" && confirmedBuy && !withinRiskBudget(lotPlan.second) && analysis.point.label === "缩量回踩") {
    blockers.push("加仓后超单笔亏损上限");
  }
  if (stock.group === "holding" && confirmedBuy && !withinRiskBudget(lotPlan.third) && analysis.point.label === "放量突破") {
    blockers.push("加仓后超单笔亏损上限");
  }

  let level = "wait";
  let label = "等确认";
  let action = "不加仓";
  let detail = "没有同时满足买点、承接和风控前，分批计划只作为预案。";

  if (blockers.length) {
    level = "danger";
    label = "禁止加仓";
    action = "先控风险";
    detail = `${blockers.slice(0, 3).join("、")}，不能用加仓解决不确定。`;
  } else if (canThird) {
    level = "hot";
    label = "第三笔候选";
    action = "只加盈利仓";
    detail = "已有浮盈且接近/突破阶段高点，第三笔只做顺势加速，不追情绪尖峰。";
  } else if (canSecond) {
    level = "watch";
    label = "第二笔候选";
    action = "等回踩不破";
    detail = "已有底仓盈利，只有回踩结构线不破、承接好，才考虑第二笔。";
  } else if (canFirst) {
    level = "watch";
    label = "第一笔试错";
    action = "小仓试错";
    detail = "信号通过也先拿门票，失败只亏计划内的小错。";
  } else if (waits.length) {
    label = "只做预案";
    detail = `还差：${[...new Set(waits)].slice(0, 3).join("、")}。`;
  }

  const steps = [
    {
      label: "第一笔 试错",
      qty: lotPlan.first ? `≤${lotPlan.first}股` : "待算",
      state: blockers.length ? "block" : canFirst ? "pass" : "wait",
      detail: "三闸门开、六灯买点或突破确认，只拿小仓门票"
    },
    {
      label: "第二笔 回踩",
      qty: lotPlan.second ? `≤${lotPlan.second}股` : "待算",
      state: blockers.length ? "block" : canSecond ? "pass" : "wait",
      detail: "已有盈利，回踩结构线不破、缩量或承接好再加"
    },
    {
      label: "第三笔 加速",
      qty: lotPlan.third ? `≤${lotPlan.third}股` : "待算",
      state: blockers.length ? "block" : canThird ? "pass" : "wait",
      detail: "突破新高并站稳，只用浮盈推仓，不追最后一口"
    },
    {
      label: "禁止条件",
      qty: blockers.length ? "触发" : "未触发",
      state: blockers.length ? "block" : "pass",
      detail: blockers.length ? blockers.slice(0, 3).join("、") : "亏损仓不补、破结构不加、放量分歧不加"
    }
  ];

  const points = [
    lotPlan.text,
    shares ? `当前${shares}股` : "当前未填股数",
    pnlPct === null ? "盈亏待算" : `盈亏 ${signed(pnlPct)}%`,
    structureStop?.mainLine ? `结构线 ${formatMoney(structureStop.mainLine)}` : "结构线待算",
    blockers.length ? `阻断：${blockers[0]}` : "只加走对的仓"
  ];

  return {
    level,
    label,
    action,
    detail,
    steps,
    points,
    blockers,
    waits
  };
}

function renderScaleInPlan(plan) {
  return `
    <section class="scale-in-plan ${plan.level}">
      <div class="scale-in-head">
        <div>
          <strong>分批加仓</strong>
          <span>${escapeHtml(plan.label)} · ${escapeHtml(plan.action)}</span>
        </div>
        <span class="scale-in-badge ${plan.level}">${escapeHtml(plan.action)}</span>
      </div>
      <p>${escapeHtml(plan.detail)}</p>
      <div class="scale-in-grid">
        ${plan.steps.map((step) => `
          <div class="scale-in-step ${step.state}">
            <strong>${escapeHtml(step.label)}</strong>
            <span>${escapeHtml(step.qty)}</span>
            <small>${escapeHtml(step.detail)}</small>
          </div>
        `).join("")}
      </div>
      <div class="scale-in-points">
        ${plan.points.slice(0, 5).map((point) => `<span>${escapeHtml(point)}</span>`).join("")}
      </div>
    </section>
  `;
}

function getSellGrade(stock, quote, technical, analysis, support, dynamicStop, structureStop = null) {
  if (stock.group !== "holding") {
    return {
      grade: "none",
      level: "wait",
      label: "观察票",
      action: "不谈卖点",
      detail: "未设为持仓，不做卖出动作，只跟踪买点和主线。",
      points: ["观察票先等确认买点", "不要因为异动临时追入"]
    };
  }

  if (!quote) {
    return {
      grade: "wait",
      level: "wait",
      label: "等行情",
      action: "不操作",
      detail: "实时行情未加载，不能判断卖点。",
      points: ["等现价、K线和承接刷新"]
    };
  }

  const price = quote.price || 0;
  const plan = normalizeTradePlan(stock.plan);
  structureStop ||= getStructureStopPlan(stock, quote, technical, analysis, support, dynamicStop);
  const hardLine = Number(structureStop.hardLine) || Number(dynamicStop.hardLine) || Number(stock.stop) || 0;
  const structureLine = Number(structureStop.mainLine) || 0;
  const hardTouched = Boolean(hardLine && price <= hardLine) || analysis.risk.label === "到止损";
  const structureTouched = structureStop.structureTouched ?? (Boolean(structureLine && price < structureLine) || support?.action === "按计划止损");
  const closeConfirmed = structureStop.closeConfirmed ?? (isCurrentSessionClosed(technical) && Boolean(
    (hardTouched && hardLine && technical.latest.close <= hardLine) ||
    (structureTouched && structureLine && technical.latest.close < structureLine) ||
    support?.action === "按计划止损"
  ));
  const sellGate = tradeRules.resolveSellGate({
    holding: true,
    sellTiming: plan.sellTiming,
    stopTouched: hardTouched,
    structureTouched,
    closeConfirmed
  });
  const brokeMa20 = Boolean(technical?.ma20 && price < technical.ma20);
  const brokeMa10 = Boolean(technical?.ma10 && price < technical.ma10 && quote.changePercent < -1);
  const hardStop = sellGate.action === "clear";
  const trendBreak = brokeMa20 && (analysis.volume.danger || quote.changePercent < -2.5);
  const targetHit = analysis.risk.label === "到目标";
  const reduceSignal = targetHit || analysis.volume.danger || dynamicStop.level === "warn" || support?.level === "danger" || brokeMa10 || trendBreak;
  const planOk = ["hot", "watch", "ok"].includes(dynamicStop.level) && ["hot", "watch"].includes(support?.level);
  const intradayWeakOnly = quote.changePercent < 0 && planOk && analysis.point.side !== "卖点";

  if (hardStop) {
    const points = [];
    if (hardStop) points.push("触发硬止损/计划止损");
    if (trendBreak) points.push("跌破MA20且放量/跌幅扩大");
    if (support?.label) points.push(`承接：${support.label}`);
    return {
      grade: "clear",
      level: "danger",
      label: "清仓卖点",
      action: "执行预案",
      detail: "破位或硬止损优先于主观判断，不再用故事对抗纪律。",
      points
    };
  }

  if (sellGate.action === "wait-close") {
    return {
      grade: "wait",
      level: "warn",
      label: "盘中破线待确认",
      action: "等收盘确认",
      detail: "盘中触及结构/止损线，但收盘卖出闸门尚未确认；不要把盘中波动写成已清仓。",
      points: [`结构线 ${structureLine ? formatMoney(structureLine) : "--"}`, `硬线 ${hardLine ? formatMoney(hardLine) : "--"}`, "收盘失守再按计划执行"]
    };
  }

  if (sellGate.action === "reduce-half") {
    return {
      grade: "reduce",
      level: "warn",
      label: "先减半",
      action: "余仓等收盘",
      detail: "按先减半闸门处理触线风险；余仓只有收盘确认破位才清，不临时改规则。",
      points: [`结构线 ${structureLine ? formatMoney(structureLine) : "--"}`, `硬线 ${hardLine ? formatMoney(hardLine) : "--"}`, "余仓按收盘确认"]
    };
  }

  if (reduceSignal) {
    const points = [];
    if (targetHit) points.push("到目标先分批");
    if (analysis.volume.danger) points.push("放量分歧");
    if (dynamicStop.level === "warn") points.push("接近保护线");
    if (support?.level === "danger") points.push("承接转弱");
    if (brokeMa10) points.push("跌破MA10");
    return {
      grade: "reduce",
      level: "warn",
      label: "减仓卖点",
      action: "先减/等确认",
      detail: "趋势未必彻底坏，但已经不适合满仓硬扛；先把风险降下来。",
      points: points.length ? points : ["卖点信号需要收盘确认"]
    };
  }

  if (intradayWeakOnly) {
    return {
      grade: "forbid",
      level: "ok",
      label: "禁止卖点",
      action: "别低位乱卖",
      detail: "价格还在计划内且承接未坏，盘中急跌不等于清仓理由。",
      points: [`硬线 ${dynamicStop.hardLine ? formatMoney(dynamicStop.hardLine) : "--"}`, `承接：${support.label}`, "等收盘或反抽确认"]
    };
  }

  return {
    grade: "watch",
    level: "watch",
    label: "等确认",
    action: "按计划持有",
    detail: "没有清仓卖点，也没有明确减仓卖点；继续看主线、K线和承接。",
    points: [`硬线 ${dynamicStop.hardLine ? formatMoney(dynamicStop.hardLine) : "--"}`, `承接：${support.label}`]
  };
}

function renderSellGrade(sellGrade) {
  return `
    <section class="sell-grade-panel ${sellGrade.level} ${sellGrade.grade}">
      <div class="sell-grade-head">
        <div>
          <strong>卖点分级</strong>
          <span>${escapeHtml(sellGrade.label)} · ${escapeHtml(sellGrade.action)}</span>
        </div>
        <span class="sell-grade-badge ${sellGrade.level}">${escapeHtml(sellGrade.label)}</span>
      </div>
      <p>${escapeHtml(sellGrade.detail)}</p>
      <div class="sell-grade-points">
        ${sellGrade.points.slice(0, 4).map((point) => `<span>${escapeHtml(point)}</span>`).join("")}
      </div>
    </section>
  `;
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
  if (analysis.marketContext?.label === "逆势强" || analysis.marketContext?.label === "逆势抗跌") watchReasons.push(analysis.marketContext.label);
  else if (analysis.marketContext?.label === "顺风强") watchReasons.push("跑赢大盘");
  if (radarHit) watchReasons.push(`雷达${radarHit.tag}`);
  if (analysis.dataQuality?.blockBuy) watchReasons.push(`先核验数据：${analysis.dataQuality.detail}`);
  if (!watchReasons.length) watchReasons.push("暂不主动进攻，等主线、K线、量能重新确认");

  let buy = "";
  if (analysis.point.side === "买点") {
    buy = `${analysis.point.label}已满足，仍只能按计划小仓/分批，不把信号当指令`;
  } else if (buyGate.gaps.length) {
    buy = `现在不买，等${buyGate.gaps.join("、")}补齐后再看纪律是否通过`;
  } else {
    buy = "等放量突破或缩量回踩MA10/20，再叠加三闸门和六灯确认";
  }

  const sellRules = [];
  if (analysis.point.side === "卖点") sellRules.push(`当前已触发${analysis.point.label}`);
  if (stock.stop) sellRules.push(`跌破止损${formatMoney(stock.stop)}`);
  if (technical?.ma20) sellRules.push(`收盘跌破MA20 ${formatMoney(technical.ma20)}`);
  else sellRules.push("跌破关键均线且次日不修复");
  if (analysis.volume.danger) sellRules.push("放量分歧");
  if (stock.target) sellRules.push(`到目标${formatMoney(stock.target)}先分批，剩余看趋势`);

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

function analyzeVolume(quote, technical, trend, code = "") {
  if (!quote) return { score: 5, label: "待行情", detail: "等待成交", hot: false, danger: false };
  if (!technical) {
    return { score: 8, label: "量能数据缺失", detail: "日K未返回，量能灯不放行", hot: false, danger: false, confirmed: false, source: "missing" };
  }
  if (!Number.isFinite(technical.volumeRatio)) {
    return {
      score: 8,
      label: "量能数据缺失",
      detail: quote.turnoverRate ? `日量比缺失 · 换手 ${quote.turnoverRate.toFixed(2)}%` : "等待成交量数据",
      hot: false,
      danger: false,
      confirmed: false,
      source: "missing"
    };
  }

  const ratio = technical.volumeRatio;
  const change = quote.changePercent;
  const volumeDecision = tradeRules.resolveVolumeLight({
    volumeRatio: technical.volumeRatioPeriod === "intraday-pending" ? technical.sameTimeVolumeRatio : ratio,
    sessionClosed: technical.volumeRatioPeriod === "completed-daily",
    sameTimeComparable: Number.isFinite(technical.sameTimeVolumeRatio),
    changePercent: change,
    trendStrong: trend.strong,
    fresh: Boolean(technicalFetchedAt[code] && Date.now() - technicalFetchedAt[code] <= 120000),
    barCurrent: technical.volumeRatioPeriod !== "stale"
  });
  const updateTime = technicalFetchedAt[code]
    ? formatShortDateTime(new Date(technicalFetchedAt[code]))
    : "时间未知";
  const sourceText = `${technical.source || "日K源"} · ${updateTime}`;

  if (volumeDecision.state === "wait" && volumeDecision.source === "intraday-pending") {
    return { score: 10, label: "盘中量能待确认", detail: `日K未完成，无同时间历史量基准 · ${sourceText}`, hot: false, danger: false, confirmed: false, source: volumeDecision.source };
  }
  if (volumeDecision.source === "stale" || volumeDecision.source === "missing") {
    return { score: 8, label: volumeDecision.source === "stale" ? "量能数据过期" : "量能数据缺失", detail: `${volumeDecision.reason} · ${sourceText}`, hot: false, danger: false, confirmed: false, source: volumeDecision.source };
  }
  if (volumeDecision.state === "block") {
    return { score: 5, label: "放量分歧", detail: `日量比 ${ratio.toFixed(2)}x · ${sourceText}`, hot: false, danger: true, confirmed: true, source: volumeDecision.source };
  }
  if (volumeDecision.state === "pass") {
    if (ratio >= 1.5) return { score: 20, label: "放量进攻", detail: `${volumeDecision.source === "completed-daily" ? "日量比" : "同时间量比"} ${ratio.toFixed(2)}x · ${sourceText}`, hot: true, danger: false, confirmed: true, source: volumeDecision.source };
    if (ratio >= 1.2) return { score: 16, label: "温和放量", detail: `${volumeDecision.source === "completed-daily" ? "日量比" : "同时间量比"} ${ratio.toFixed(2)}x · ${sourceText}`, hot: true, danger: false, confirmed: true, source: volumeDecision.source };
    return { score: 14, label: "缩量强势", detail: `日量比 ${ratio.toFixed(2)}x · ${sourceText}`, hot: false, danger: false, confirmed: true, source: volumeDecision.source };
  }

  if (ratio >= 1.5 && change > 0) {
    return { score: 10, label: "量价未确认", detail: "完成日K后再判断", hot: false, danger: false, confirmed: false, source: volumeDecision.source };
  }
  if (ratio >= 2 && change <= 0) {
    return { score: 10, label: "量价未确认", detail: "完成日K后再判断", hot: false, danger: false, confirmed: false, source: volumeDecision.source };
  }
  if (ratio < 0.75 && change < 0) {
    return { score: 8, label: "缩量调整", detail: `日量比 ${ratio.toFixed(2)}x`, hot: false, danger: false, confirmed: true, source: volumeDecision.source };
  }
  return { score: 10, label: "量能普通", detail: `日量比 ${ratio.toFixed(2)}x`, hot: false, danger: false, confirmed: true, source: volumeDecision.source };
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
  if (risk.label === "到止损") {
    const plan = normalizeTradePlan(stock.plan);
    const profile = tradePlanProfiles[plan.type] || tradePlanProfiles.swing;
    const cost = Number(stock.cost) || 0;
    const manualStop = Number(stock.stop) || 0;
    const stopLine = manualStop || (cost ? cost * (1 - profile.defaultStopPct / 100) : 0);
    const stopTouched = Boolean(stopLine && quote.price <= stopLine);
    const closeConfirmed = isCurrentSessionClosed(technical) && Boolean(stopLine && technical.latest.close <= stopLine);
    const sellGate = tradeRules.resolveSellGate({
      holding: stock.group === "holding",
      sellTiming: plan.sellTiming,
      stopTouched,
      closeConfirmed
    });
    if (stock.group !== "holding") return { side: "等待", level: "warn", label: "止损预案失效", scoreAdjust: -18 };
    if (sellGate.action === "clear") return { side: "卖点", level: "sell", label: "止损卖点", scoreAdjust: -18 };
    if (sellGate.action === "reduce-half") return { side: "观察", level: "warn", label: "触线先减半", scoreAdjust: -14 };
    return { side: "观察", level: "warn", label: "盘中止损待确认", scoreAdjust: -12 };
  }
  if (volume.danger) return { side: "观察", level: "warn", label: "放量分歧", scoreAdjust: -12 };
  if (risk.label === "到目标") return { side: "卖点", level: "sell", label: "目标分批", scoreAdjust: -4 };

  if (technical) {
    const price = quote.price;
    const brokeMa10 = technical.ma10 && price < technical.ma10 && quote.changePercent < -1;
    const brokeMa20 = technical.ma20 && price < technical.ma20;
    const strengthGates = getStrengthGates(stock, quote, { themeStrength: strength, dataQuality });
    const structure = getStructureTrigger(quote, technical, trend, volume);
    const currentThemeState = themeState[stock.theme];
    const funds = getFundsConvergenceLight(stock);
    const lightStates = [
      currentThemeState?.source === "动态" ? strength >= 4 ? "pass" : "block" : "wait",
      !marketState ? "wait" : marketState.level === "weak" ? "block" : "pass",
      trend.strong && structure.signal ? "pass" : "wait",
      volume.danger ? "block" : volume.confirmed ? "pass" : "wait",
      funds.state,
      risk.level === "ok" ? "pass" : "block",
    ];
    const buySignal = tradeRules.evaluateBuySignal({
      dataReady: !dataQuality?.blockBuy,
      snapshotCoherent: strengthGates.snapshotCoherent,
      gates: strengthGates.gates.map((gate) => gate.state),
      lights: lightStates,
      structureSignal: structure.signal,
      closeConfirmed: structure.closeConfirmed
    });

    if (brokeMa20) return { side: "观察", level: "warn", label: "结构转弱", scoreAdjust: -14 };
    if (brokeMa10 && volume.label !== "缩量调整") return { side: "观察", level: "warn", label: "跌破10日观察", scoreAdjust: -9 };
    if (buySignal.state === "confirmed") {
      return { side: "买点", level: "buy", label: structure.mode === "breakout" ? "放量突破" : "缩量回踩", scoreAdjust: structure.mode === "breakout" ? 8 : 6 };
    }
    if (buySignal.state === "candidate") {
      return { side: "观察", level: "info", label: "盘中候选", scoreAdjust: 2 };
    }
    if (trend.strong && structure.signal && !strengthGates.allPass) {
      return { side: "观察", level: "warn", label: "等三闸门", scoreAdjust: -3 };
    }
    if (structure.signal && buySignal.reason === "六灯未全亮") {
      return { side: "观察", level: "warn", label: "等六灯", scoreAdjust: -2 };
    }
    if (trend.strong && !volume.danger) {
      return { side: "观察", level: "ok", label: "等回踩", scoreAdjust: 1 };
    }
    if (quote.changePercent > 2 && technical.ma5 && price > technical.ma5 && volume.hot) {
      return { side: "观察", level: "info", label: "弱转强观察", scoreAdjust: 1 };
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
  if (point.label === "盘中止损待确认") return { level: "warn", label: "等收盘" };
  if (point.label === "触线先减半") return { level: "warn", label: "先减半" };
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
  if (analysis.point.label === "盘中止损待确认") return { level: "watch", label: "等收盘" };
  if (analysis.point.label === "触线先减半") return { level: "reduce", label: "先减半" };
  if (analysis.risk.label === "到止损") return { level: "sell", label: "止损" };
  if (analysis.point.side === "卖点" && analysis.point.label.includes("目标")) return { level: "reduce", label: "分批" };
  if (analysis.point.side === "卖点") return { level: "sell", label: "卖" };
  if (analysis.point.side === "买点" && analysis.score >= settings.strongScore) return { level: "buy", label: "按计划" };
  if (analysis.score >= 70 || analysis.point.side === "观察") return { level: "watch", label: "只看" };
  return { level: "wait", label: "等" };
}

function getStoredReviewIds(storageKey, code, { excludeIds = [] } = {}) {
  try {
    const stored = JSON.parse(localStorage.getItem(storageKey) || "{}");
    const rows = Array.isArray(stored?.[code]) ? stored[code] : [];
    return tradeRules.getEligibleTransactionIds(rows, { excludeIds, todayKey: getLocalDateKey() });
  } catch {
    return [];
  }
}

function normalizeStock(stock) {
  const note = stock.note || "";
  const name = stock.name || stock.code;
  return {
    code: stock.code,
    name,
    cost: stock.cost ?? "",
    shares: stock.shares ?? "",
    lots: Array.isArray(stock.lots) ? stock.lots.filter((lot) => lot && Number(lot.shares) > 0).map((lot) => ({
      buyDate: String(lot.buyDate || ""),
      shares: Math.floor(Number(lot.shares) || 0),
      price: toNumberOrBlank(lot.price),
      source: lot.source === "review" ? "review" : "manual",
      tradeId: String(lot.tradeId || "")
    })) : [],
    legacySellableShares: stock.legacySellableShares ?? "",
    reviewSyncInitialized: stock.reviewSyncInitialized === true,
    reviewSyncBase: stock.reviewSyncBase && typeof stock.reviewSyncBase === "object" ? JSON.parse(JSON.stringify(stock.reviewSyncBase)) : null,
    reviewBaselineTradeIds: Array.isArray(stock.reviewBaselineTradeIds) ? stock.reviewBaselineTradeIds.map(String) : [],
    reviewBaselineSellIds: Array.isArray(stock.reviewBaselineSellIds) ? stock.reviewBaselineSellIds.map(String) : [],
    reviewSyncedTradeIds: Array.isArray(stock.reviewSyncedTradeIds) ? stock.reviewSyncedTradeIds.map(String) : [],
    reviewSyncedSellIds: Array.isArray(stock.reviewSyncedSellIds) ? stock.reviewSyncedSellIds.map(String) : [],
    reviewFailedSellIds: Array.isArray(stock.reviewFailedSellIds) ? stock.reviewFailedSellIds.map(String) : [],
    reviewDeferredTransactionIds: Array.isArray(stock.reviewDeferredTransactionIds) ? stock.reviewDeferredTransactionIds.map(String) : [],
    reviewSyncError: String(stock.reviewSyncError || ""),
    target: stock.target ?? "",
    stop: stock.stop ?? "",
    group: stock.group || "watch",
    layer: normalizeWatchLayer(stock.layer, stock.group),
    theme: normalizeTheme(stock.theme, name, note),
    note,
    entryDate: stock.entryDate || "",
    plan: normalizeTradePlan(stock.plan)
  };
}

function normalizeWatchLayer(layer, group = "watch") {
  if (group === "holding") return "normal";
  const value = String(layer || "normal");
  return ["normal", "core", "temp", "retired"].includes(value) ? value : "normal";
}

function getWatchLayerLabel(stock) {
  if (stock.group === "holding") return "持仓";
  if (stock.layer === "core") return "核心观察";
  if (stock.layer === "temp") return "临时观察";
  if (stock.layer === "retired") return "已淘汰";
  return "观察";
}

function normalizeTradePlan(plan = {}) {
  const type = tradePlanProfiles[plan.type] ? plan.type : "swing";
  const sellTiming = sellTimingProfiles[plan.sellTiming] ? plan.sellTiming : "close-confirm";
  return {
    type,
    maxLoss: toNumberOrBlank(plan.maxLoss),
    sellTiming,
    coreOnly: plan.coreOnly !== false,
    riskBudgetConfirmed: plan.riskBudgetConfirmed === true
  };
}

function parseTradeDate(value) {
  const text = String(value || "");
  const match = text.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return null;
  const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]), 9, 30, 0);
  return Number.isNaN(date.getTime()) ? null : date;
}

function normalizeTheme(theme, name = "", note = "", fallbackTheme = "其他") {
  const current = theme && theme !== "其他" ? theme : fallbackTheme;
  const inferred = inferTheme(name, note);
  if (current === "贵金属/黄金") return inferred === "其他" ? "有色金属" : inferred;

  if (inferred === "风电设备" && (!current || current === "其他" || current === "半导体设备")) {
    return inferred;
  }
  if (!current || current === "其他") return inferred;
  return current;
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
  if (/金风科技|明阳智能|大金重工|天顺风能|东方电气|日月股份|东方电缆|风电|风机|风塔|叶片|海上风电/.test(text)) return "风电设备";
  if (/北方华创|至纯科技|万业企业|长川科技|半导体设备|刻蚀|光刻|清洗设备|离子注入|薄膜沉积|测试设备|CVD|PVD/.test(text)) return "半导体设备";
  if (/锡业股份|华锡有色|中钨高新|厦门钨业|湖南黄金|金钼股份|洛阳钼业|云南锗业|东方钽业|株冶集团|小金属|锡|锑|钨|钼|铟|锗|镓|铋|钽|铌/.test(text)) return "小金属";
  if (/北方稀土|中国稀土|盛和资源|横店东磁|中科三环|稀土|永磁|钕铁硼|镨钕/.test(text)) return "稀土永磁";
  if (/紫金矿业|江西铜业|中国铝业|云铝|铜陵有色|神火|有色|工业金属|铜|铝|锌|镍|钴/.test(text)) return "有色金属";
  if (/山东黄金|中金黄金|赤峰黄金|银泰黄金|黄金|贵金属|白银|金矿/.test(text)) return "有色金属";
  if (/中国神华|陕西煤业|兖矿能源|中煤能源|中国石油|中国石化|中国海油|煤炭|能源|石油|天然气|油气/.test(text)) return "煤炭能源";
  if (/鼎龙|CMP|材料|靶材|硅片|飞凯|雅克|立昂/.test(text)) return "半导体材料";
  if (/长电|通富|华天|兴森|先进封装|Chiplet|IC载板|封装基板/.test(text)) return "先进封装";
  if (/特气|六氟化钨|氦|气/.test(text)) return "电子特气";
  if (/京东方|TCL|面板|显示|玻璃基板/.test(text)) return "面板/玻璃基板";
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

function parseEastmoneyHundredRatio(value) {
  if (value === "" || value === "-" || value === null || value === undefined) return null;
  const number = Number(value);
  if (!Number.isFinite(number)) return null;
  if (typeof value === "string" && value.includes(".")) return number;
  return number / 100;
}

function parseEastmoneyDirectRatio(value) {
  if (value === "" || value === "-" || value === null || value === undefined) return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function formatRatio(value, suffix = "") {
  const number = Number(value);
  if (!Number.isFinite(number)) return "--";
  return `${number.toFixed(2)}${suffix}`;
}

function formatMoney(value) {
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
