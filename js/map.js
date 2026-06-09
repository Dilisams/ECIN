const areaPositions = {
  Nsukka: [66, 26],
  Uwani: [48, 58],
  "Oji River": [31, 61],
  Abakpa: [58, 50],
  "Enugu North": [52, 44],
  Awgu: [36, 76]
};

export function initMap() {
  const root = document.querySelector("[data-live-map]");
  const filter = document.querySelector("[data-map-filter]");
  const search = document.querySelector("[data-map-search]");
  const state = { root, filter, search, reports: [] };
  filter.addEventListener("change", () => renderMap(state, state.reports));
  search.addEventListener("input", () => renderMap(state, state.reports));
  root.addEventListener("click", event => {
    const pin = event.target.closest("[data-report-id]");
    if (!pin) return;
    const report = state.reports.find(item => item.id === pin.dataset.reportId);
    if (report) showDetail(report);
  });
  return state;
}

export function renderMap(state, reports) {
  if (!state?.root) return;
  state.reports = reports;
  state.root.querySelectorAll(".live-pin").forEach(pin => pin.remove());
  const filter = state.filter.value;
  const query = state.search.value.trim().toLowerCase();
  reports
    .filter(report => filter === "all" || report.type === filter)
    .filter(report => !query || report.area.toLowerCase().includes(query))
    .forEach((report, index) => {
      const position = areaPositions[report.area] || [40 + index * 7, 42 + index * 5];
      const pin = document.createElement("button");
      pin.className = `live-pin ${severityClass(report.severity)}`;
      pin.style.setProperty("--x", `${position[0] + jitter(index)}%`);
      pin.style.setProperty("--y", `${position[1] + jitter(index + 2)}%`);
      pin.dataset.reportId = report.id;
      pin.type = "button";
      pin.setAttribute("aria-label", `${report.severity} ${report.type} in ${report.area}`);
      state.root.append(pin);
    });
}

function showDetail(report) {
  const detail = document.querySelector("[data-marker-detail]");
  detail.innerHTML = `
    <strong>${report.type} · ${report.area}</strong><br>
    ${report.description}<br>
    <span>${report.severity} · ${report.status} · ${new Date(report.createdAt).toLocaleTimeString()}</span>
  `;
}

function severityClass(severity) {
  if (severity === "Critical") return "critical";
  if (severity === "Safe") return "safe";
  return "moderate";
}

function jitter(seed) {
  return ((seed * 13) % 9) - 4;
}
