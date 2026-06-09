const palette = {
  blue: "#4169E1",
  red: "#4A0404",
  yellow: "#F5B700",
  green: "#16A34A",
  ink: "#0F0F0F"
};

export function initCharts() {
  return {
    trend: document.getElementById("trendChart"),
    issues: document.getElementById("issueChart"),
    started: false
  };
}

export function updateCharts(charts, reports) {
  if (!charts) return;
  drawLineChart(charts.trend, [18, 24, 31, 29, 42, 47, reports.length + 38], "Reports");
  const issueCounts = countBy(reports, "type");
  drawBarChart(charts.issues, Object.entries(issueCounts).slice(0, 6));
}

function drawLineChart(canvas, values, label) {
  const ctx = setupCanvas(canvas);
  const { width, height } = canvas.getBoundingClientRect();
  const pad = 34;
  const max = Math.max(...values) + 8;
  ctx.clearRect(0, 0, width, height);
  drawGrid(ctx, width, height, pad);
  ctx.strokeStyle = palette.blue;
  ctx.lineWidth = 4;
  ctx.beginPath();
  values.forEach((value, index) => {
    const x = pad + index * ((width - pad * 2) / (values.length - 1));
    const y = height - pad - (value / max) * (height - pad * 2);
    if (index === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.stroke();
  values.forEach((value, index) => {
    const x = pad + index * ((width - pad * 2) / (values.length - 1));
    const y = height - pad - (value / max) * (height - pad * 2);
    ctx.fillStyle = palette.blue;
    ctx.beginPath();
    ctx.arc(x, y, 5, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.fillStyle = getTextColor();
  ctx.font = "700 13px Inter";
  ctx.fillText(label, pad, 22);
}

function drawBarChart(canvas, entries) {
  const ctx = setupCanvas(canvas);
  const { width, height } = canvas.getBoundingClientRect();
  const pad = 34;
  const max = Math.max(...entries.map(entry => entry[1]), 1);
  ctx.clearRect(0, 0, width, height);
  drawGrid(ctx, width, height, pad);
  const barArea = width - pad * 2;
  const barWidth = Math.max(18, barArea / entries.length - 16);
  entries.forEach(([name, value], index) => {
    const x = pad + index * (barArea / entries.length) + 8;
    const barHeight = (value / max) * (height - pad * 2);
    const y = height - pad - barHeight;
    ctx.fillStyle = [palette.blue, palette.red, palette.yellow, palette.green, "#6C5CE7", "#00A6A6"][index % 6];
    roundRect(ctx, x, y, barWidth, barHeight, 6);
    ctx.fill();
    ctx.fillStyle = getTextColor();
    ctx.font = "700 11px Inter";
    ctx.fillText(shorten(name), x, height - 10);
  });
}

function setupCanvas(canvas) {
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;
  const ctx = canvas.getContext("2d");
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  return ctx;
}

function drawGrid(ctx, width, height, pad) {
  ctx.strokeStyle = "rgba(102, 112, 133, 0.18)";
  ctx.lineWidth = 1;
  for (let i = 0; i < 4; i++) {
    const y = pad + i * ((height - pad * 2) / 3);
    ctx.beginPath();
    ctx.moveTo(pad, y);
    ctx.lineTo(width - pad, y);
    ctx.stroke();
  }
}

function roundRect(ctx, x, y, width, height, radius) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height);
  ctx.lineTo(x, y + height);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
}

function countBy(items, key) {
  return items.reduce((acc, item) => {
    acc[item[key]] = (acc[item[key]] || 0) + 1;
    return acc;
  }, {});
}

function getTextColor() {
  return document.documentElement.dataset.theme === "dark" ? "#F5F7FB" : palette.ink;
}

function shorten(value) {
  return value.length > 14 ? `${value.slice(0, 12)}...` : value;
}
