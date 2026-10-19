import fs from "node:fs";
import path from "node:path";

const outPath = path.resolve("docs/assets/boe-kline-indicators.svg");

const rows = [
  ["2026-04-20", 4.004, 4.134, 4.184, 3.994, 11904594],
  ["2026-04-21", 4.134, 4.164, 4.284, 4.084, 11348024],
  ["2026-04-22", 4.144, 4.214, 4.224, 4.144, 6812882],
  ["2026-04-23", 4.204, 4.134, 4.234, 4.114, 6914901],
  ["2026-04-24", 4.114, 4.074, 4.134, 4.054, 4600998],
  ["2026-04-27", 4.094, 4.154, 4.164, 4.074, 4824066],
  ["2026-04-28", 4.144, 4.094, 4.154, 4.084, 3954386],
  ["2026-04-29", 4.084, 4.114, 4.124, 4.064, 4140091],
  ["2026-04-30", 4.074, 4.024, 4.124, 4.024, 7454049],
  ["2026-05-06", 4.054, 4.124, 4.164, 4.034, 8280385],
  ["2026-05-07", 4.144, 4.154, 4.194, 4.104, 6650426],
  ["2026-05-08", 4.134, 4.114, 4.134, 4.064, 6379057],
  ["2026-05-11", 4.114, 4.134, 4.174, 4.104, 6100840],
  ["2026-05-12", 4.134, 4.114, 4.174, 4.084, 6185213],
  ["2026-05-13", 4.114, 4.174, 4.174, 4.094, 6382206],
  ["2026-05-14", 4.224, 4.164, 4.274, 4.144, 8761121],
  ["2026-05-15", 4.164, 4.084, 4.184, 4.064, 8215945],
  ["2026-05-18", 4.064, 4.154, 4.174, 4.024, 8399587],
  ["2026-05-19", 4.144, 4.254, 4.264, 4.114, 8801051],
  ["2026-05-20", 4.234, 4.204, 4.254, 4.184, 5717787],
  ["2026-05-21", 4.634, 4.634, 4.634, 4.634, 10360100],
  ["2026-05-22", 4.644, 5.104, 5.104, 4.414, 60110592],
  ["2026-05-25", 5.114, 5.214, 5.314, 5.004, 43088758],
  ["2026-05-26", 5.164, 5.714, 5.744, 5.124, 51377251],
  ["2026-05-27", 5.744, 5.664, 6.034, 5.474, 50185216],
  ["2026-05-28", 5.664, 5.624, 5.724, 5.454, 32854869],
  ["2026-05-29", 5.574, 5.054, 5.584, 5.054, 36253859],
  ["2026-06-01", 5.064, 5.304, 5.534, 5.064, 33868876],
  ["2026-06-02", 5.254, 5.414, 5.484, 5.054, 30258455],
  ["2026-06-03", 5.524, 5.534, 5.864, 5.474, 36797584],
  ["2026-06-04", 5.634, 6.094, 6.094, 5.634, 33229988],
  ["2026-06-05", 6.054, 6.374, 6.714, 5.954, 55041155],
  ["2026-06-08", 6.424, 6.234, 6.684, 6.164, 45998759],
  ["2026-06-09", 6.434, 6.464, 6.584, 6.084, 40031647],
  ["2026-06-10", 6.284, 5.974, 6.324, 5.884, 32284804],
  ["2026-06-11", 5.944, 5.774, 6.064, 5.644, 32996829],
  ["2026-06-12", 5.894, 5.514, 5.954, 5.504, 29146434],
  ["2026-06-15", 5.684, 5.864, 5.954, 5.674, 29928307],
  ["2026-06-16", 5.874, 6.044, 6.174, 5.804, 26028372],
  ["2026-06-17", 6.004, 6.654, 6.654, 5.994, 18550206],
  ["2026-06-18", 6.86, 6.55, 6.93, 6.49, 40032427],
  ["2026-06-22", 6.8, 6.93, 7.18, 6.68, 36729053],
  ["2026-06-23", 6.85, 6.77, 7.07, 6.61, 29140578],
  ["2026-06-24", 6.7, 7.07, 7.15, 6.57, 35877142],
  ["2026-06-25", 7.33, 7.52, 7.67, 7.14, 36963548],
  ["2026-06-26", 7.5, 7.79, 8.24, 7.36, 45251769],
  ["2026-06-29", 7.96, 7.95, 8.21, 7.51, 41524576],
  ["2026-06-30", 8.15, 8.68, 8.75, 8.11, 51878997],
  ["2026-07-01", 8.49, 8.77, 8.81, 8.31, 46253150],
  ["2026-07-02", 8.15, 9.1, 9.5, 7.89, 56618589],
  ["2026-07-03", 8.86, 8.38, 9.09, 8.31, 41442067],
  ["2026-07-06", 8.21, 7.76, 8.52, 7.74, 37087421],
  ["2026-07-07", 7.66, 7.58, 7.84, 7.45, 28186977],
  ["2026-07-08", 7.69, 7.63, 7.9, 7.26, 33222878],
  ["2026-07-09", 7.71, 8.15, 8.18, 7.71, 37939905],
  ["2026-07-10", 8.16, 7.59, 8.34, 7.59, 38046199],
  ["2026-07-13", 7.35, 6.83, 7.41, 6.83, 31758704],
  ["2026-07-14", 6.9, 7.02, 7.17, 6.66, 29367326],
  ["2026-07-15", 6.97, 6.38, 6.97, 6.35, 30112728],
  ["2026-07-16", 6.25, 6.05, 6.39, 5.99, 26076559],
  ["2026-07-17", 6.09, 6.07, 6.22, 5.88, 29568189],
  ["2026-07-20", 6.15, 5.79, 6.2, 5.62, 26813210],
  ["2026-07-21", 5.83, 6.31, 6.36, 5.62, 32003979],
].map(([date, open, close, high, low, volume]) => ({ date, open, close, high, low, volume }));

function ema(values, period) {
  const alpha = 2 / (period + 1);
  const out = [];
  values.forEach((value, index) => {
    out.push(index === 0 ? value : out[index - 1] * (1 - alpha) + value * alpha);
  });
  return out;
}

function pathLine(points) {
  return points
    .filter((point) => Number.isFinite(point[0]) && Number.isFinite(point[1]))
    .map((point, index) => `${index === 0 ? "M" : "L"}${point[0].toFixed(1)} ${point[1].toFixed(1)}`)
    .join(" ");
}

function text(x, y, content, className = "muted", anchor = "start") {
  return `<text x="${x}" y="${y}" class="${className}" text-anchor="${anchor}">${content}</text>`;
}

const closes = rows.map((row) => row.close);
const ema12 = ema(closes, 12);
const ema26 = ema(closes, 26);
const dif = closes.map((_, index) => ema12[index] - ema26[index]);
const dea = ema(dif, 9);
const macd = dif.map((value, index) => (value - dea[index]) * 2);

const boll = rows.map((_, index) => {
  if (index < 19) return { mid: null, upper: null, lower: null };
  const part = closes.slice(index - 19, index + 1);
  const mid = part.reduce((sum, value) => sum + value, 0) / 20;
  const variance = part.reduce((sum, value) => sum + (value - mid) ** 2, 0) / 20;
  const sd = Math.sqrt(variance);
  return { mid, upper: mid + 2 * sd, lower: mid - 2 * sd };
});

const k = [];
const d = [];
const j = [];
rows.forEach((row, index) => {
  const part = rows.slice(Math.max(0, index - 8), index + 1);
  const low = Math.min(...part.map((item) => item.low));
  const high = Math.max(...part.map((item) => item.high));
  const rsv = high === low ? 50 : ((row.close - low) / (high - low)) * 100;
  k[index] = index === 0 ? 50 : (k[index - 1] * 2) / 3 + rsv / 3;
  d[index] = index === 0 ? 50 : (d[index - 1] * 2) / 3 + k[index] / 3;
  j[index] = 3 * k[index] - 2 * d[index];
});

const W = 1280;
const H = 900;
const left = 82;
const right = 58;
const plotW = W - left - right;
const priceTop = 96;
const priceBottom = 440;
const volumeTop = 460;
const volumeBottom = 535;
const macdTop = 585;
const macdBottom = 705;
const kdjTop = 760;
const kdjBottom = 865;
const candleW = Math.max(5, Math.min(12, (plotW / rows.length) * 0.58));

const priceMin = Math.min(...rows.map((row, index) => Math.min(row.low, boll[index].lower || row.low))) * 0.97;
const priceMax = Math.max(...rows.map((row, index) => Math.max(row.high, boll[index].upper || row.high))) * 1.025;
const volumeMax = Math.max(...rows.map((row) => row.volume));
const macdMin = Math.min(...dif, ...dea, ...macd, 0);
const macdMax = Math.max(...dif, ...dea, ...macd, 0);
const kdjMin = Math.min(0, ...k, ...d, ...j);
const kdjMax = Math.max(100, ...k, ...d, ...j);

const x = (index) => left + (index + 0.5) * (plotW / rows.length);
const scale = (value, min, max, top, bottom) => top + ((max - value) / (max - min || 1)) * (bottom - top);
const yPrice = (value) => scale(value, priceMin, priceMax, priceTop, priceBottom);
const yVolume = (value) => volumeBottom - (value / volumeMax) * (volumeBottom - volumeTop);
const yMacd = (value) => scale(value, macdMin, macdMax, macdTop, macdBottom);
const yKdj = (value) => scale(value, kdjMin, kdjMax, kdjTop, kdjBottom);

let svg = "";

svg += `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-labelledby="title desc">`;
svg += `<title id="title">京东方A K线、BOLL、MACD、KDJ复盘图</title>`;
svg += `<desc id="desc">图中展示京东方A从2026年4月20日至2026年7月21日的日K线、布林线、成交量、MACD和KDJ，并标注关键阶段。</desc>`;
svg += `<style>
  :root { color-scheme: light dark; }
  svg { background: #f8fafc; font-family: "Microsoft YaHei", "PingFang SC", Arial, sans-serif; }
  .panel { fill: #ffffff; stroke: #d8e0ea; stroke-width: 1; }
  .grid { stroke: #e5eaf1; stroke-width: 1; }
  .axis { stroke: #cbd5e1; stroke-width: 1; }
  .muted { fill: #64748b; font-size: 18px; }
  .small { fill: #64748b; font-size: 15px; }
  .title { fill: #0f172a; font-size: 30px; font-weight: 700; }
  .subtitle { fill: #475569; font-size: 17px; }
  .label { fill: #0f172a; font-size: 18px; font-weight: 700; }
  .up { fill: #ef4444; stroke: #b91c1c; stroke-width: 1.5; }
  .down { fill: #22c55e; stroke: #15803d; stroke-width: 1.5; }
  .wick-up { stroke: #b91c1c; stroke-width: 1.6; }
  .wick-down { stroke: #15803d; stroke-width: 1.6; }
  .vol-up { fill: rgba(239, 68, 68, 0.42); }
  .vol-down { fill: rgba(34, 197, 94, 0.42); }
  .boll-band { fill: rgba(37, 99, 235, 0.12); }
  .boll-edge { fill: none; stroke: #2563eb; stroke-width: 2; stroke-dasharray: 8 6; }
  .boll-mid { fill: none; stroke: #1d4ed8; stroke-width: 2.8; }
  .dif { fill: none; stroke: #7c3aed; stroke-width: 2.4; }
  .dea { fill: none; stroke: #f59e0b; stroke-width: 2.4; }
  .macd-up { fill: rgba(239, 68, 68, 0.58); }
  .macd-down { fill: rgba(34, 197, 94, 0.58); }
  .k-line { fill: none; stroke: #7c3aed; stroke-width: 2.2; }
  .d-line { fill: none; stroke: #f59e0b; stroke-width: 2.2; }
  .j-line { fill: none; stroke: #0891b2; stroke-width: 2.1; }
  .event { stroke: #111827; stroke-width: 2; stroke-dasharray: 7 6; }
  .event-dot { fill: #111827; stroke: #ffffff; stroke-width: 3; }
  .tag { fill: #111827; }
  .tag-text { fill: #ffffff; font-size: 15px; font-weight: 700; }
  @media (prefers-color-scheme: dark) {
    svg { background: #0b1020; }
    .panel { fill: #111827; stroke: #334155; }
    .grid { stroke: #1f2937; }
    .axis { stroke: #475569; }
    .muted, .small, .subtitle { fill: #94a3b8; }
    .label, .title { fill: #e5e7eb; }
    .event { stroke: #e5e7eb; }
    .event-dot { fill: #e5e7eb; stroke: #111827; }
    .tag { fill: #e5e7eb; }
    .tag-text { fill: #111827; }
  }
</style>`;

svg += `<rect x="0" y="0" width="${W}" height="${H}" fill="transparent"/>`;
svg += text(52, 46, "京东方A 000725：K线 + BOLL + MACD + KDJ", "title");
svg += text(52, 75, "日K前复权数据 · 2026-04-20 至 2026-07-21 · 红涨绿跌 · 教学复盘图，不构成买卖建议", "subtitle");

for (const [top, bottom, label] of [
  [priceTop, priceBottom, "K线 + BOLL"],
  [volumeTop, volumeBottom, "成交量"],
  [macdTop, macdBottom, "MACD"],
  [kdjTop, kdjBottom, "KDJ"],
]) {
  svg += `<rect class="panel" x="${left - 14}" y="${top - 18}" width="${plotW + 28}" height="${bottom - top + 32}" rx="14"/>`;
  svg += text(left, top - 28, label, "label");
}

for (const tick of [4, 5, 6, 7, 8, 9]) {
  const yy = yPrice(tick);
  svg += `<line class="grid" x1="${left}" y1="${yy}" x2="${W - right}" y2="${yy}"/>`;
  svg += text(18, yy + 6, tick.toFixed(1), "small");
}
for (const tick of [0, Math.round(volumeMax / 2), volumeMax]) {
  const yy = yVolume(tick);
  svg += `<line class="grid" x1="${left}" y1="${yy}" x2="${W - right}" y2="${yy}"/>`;
  svg += text(14, yy + 6, tick === 0 ? "0" : `${Math.round(tick / 10000)}万`, "small");
}
for (const tick of [macdMin, 0, macdMax]) {
  const yy = yMacd(tick);
  svg += `<line class="${tick === 0 ? "axis" : "grid"}" x1="${left}" y1="${yy}" x2="${W - right}" y2="${yy}"/>`;
  svg += text(18, yy + 6, tick.toFixed(2), "small");
}
for (const tick of [20, 50, 80]) {
  const yy = yKdj(tick);
  svg += `<line class="grid" x1="${left}" y1="${yy}" x2="${W - right}" y2="${yy}"/>`;
  svg += text(25, yy + 6, String(tick), "small");
}

const upperPoints = [];
const lowerPoints = [];
const midPoints = [];
rows.forEach((_, index) => {
  const item = boll[index];
  if (item.upper === null) return;
  upperPoints.push([x(index), yPrice(item.upper)]);
  lowerPoints.push([x(index), yPrice(item.lower)]);
  midPoints.push([x(index), yPrice(item.mid)]);
});
if (upperPoints.length) {
  const band = `${pathLine(upperPoints)} L ${[...lowerPoints].reverse().map((point) => `${point[0].toFixed(1)} ${point[1].toFixed(1)}`).join(" L ")} Z`;
  svg += `<path class="boll-band" d="${band}"/>`;
  svg += `<path class="boll-edge" d="${pathLine(upperPoints)}"/>`;
  svg += `<path class="boll-mid" d="${pathLine(midPoints)}"/>`;
  svg += `<path class="boll-edge" d="${pathLine(lowerPoints)}"/>`;
}

rows.forEach((row, index) => {
  const cx = x(index);
  const up = row.close >= row.open;
  const bodyTop = yPrice(Math.max(row.open, row.close));
  const bodyBottom = yPrice(Math.min(row.open, row.close));
  svg += `<line class="${up ? "wick-up" : "wick-down"}" x1="${cx}" y1="${yPrice(row.high)}" x2="${cx}" y2="${yPrice(row.low)}"/>`;
  svg += `<rect class="${up ? "up" : "down"}" x="${cx - candleW / 2}" y="${bodyTop}" width="${candleW}" height="${Math.max(2, bodyBottom - bodyTop)}" rx="2"/>`;
  svg += `<rect class="${up ? "vol-up" : "vol-down"}" x="${cx - candleW / 2}" y="${yVolume(row.volume)}" width="${candleW}" height="${Math.max(1, volumeBottom - yVolume(row.volume))}" rx="1"/>`;
});

rows.forEach((_, index) => {
  const cx = x(index);
  const top = yMacd(Math.max(0, macd[index]));
  const bottom = yMacd(Math.min(0, macd[index]));
  svg += `<rect class="${macd[index] >= 0 ? "macd-up" : "macd-down"}" x="${cx - candleW / 2}" y="${top}" width="${candleW}" height="${Math.max(1, bottom - top)}" rx="1"/>`;
});
svg += `<path class="dif" d="${pathLine(dif.map((value, index) => [x(index), yMacd(value)]))}"/>`;
svg += `<path class="dea" d="${pathLine(dea.map((value, index) => [x(index), yMacd(value)]))}"/>`;
svg += `<path class="k-line" d="${pathLine(k.map((value, index) => [x(index), yKdj(value)]))}"/>`;
svg += `<path class="d-line" d="${pathLine(d.map((value, index) => [x(index), yKdj(value)]))}"/>`;
svg += `<path class="j-line" d="${pathLine(j.map((value, index) => [x(index), yKdj(value)]))}"/>`;

for (let index = 0; index < rows.length; index += 8) {
  svg += text(x(index), 893, rows[index].date.slice(5), "small", "middle");
}
svg += text(x(rows.length - 1), 893, rows[rows.length - 1].date.slice(5), "small", "middle");

const events = [
  { date: "2026-05-22", label: "突破启动", y: 122 },
  { date: "2026-06-17", label: "趋势内弱转强", y: 162 },
  { date: "2026-07-02", label: "高位分歧", y: 122 },
  { date: "2026-07-21", label: "反抽修复", y: 162 },
];

for (const event of events) {
  const index = rows.findIndex((row) => row.date === event.date);
  if (index < 0) continue;
  const cx = x(index);
  const row = rows[index];
  svg += `<line class="event" x1="${cx}" y1="${priceTop - 8}" x2="${cx}" y2="${kdjBottom}"/>`;
  svg += `<circle class="event-dot" cx="${cx}" cy="${yPrice(row.close)}" r="6"/>`;
  const tagW = event.label.length > 4 ? 122 : 82;
  const tagX = Math.min(W - right - tagW, Math.max(left, cx - tagW / 2));
  svg += `<rect class="tag" x="${tagX}" y="${event.y}" width="${tagW}" height="28" rx="14"/>`;
  svg += text(tagX + tagW / 2, event.y + 19, event.label, "tag-text", "middle");
}

svg += text(W - 424, 113, "BOLL：蓝色通道 / 中轨", "small");
svg += text(W - 424, 136, "MACD：紫DIF / 黄DEA / 红绿柱", "small");
svg += text(W - 424, 159, "KDJ：紫K / 黄D / 青J", "small");

svg += `</svg>\n`;

fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, svg, "utf8");
console.log(`generated ${outPath}`);
