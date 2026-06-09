const STORAGE_KEY = "safeflow-reports";

const baseReports = [
  ["Broken borehole", "Critical", "Nsukka", "Main borehole has been offline for four days near the market.", "Approved"],
  ["No water supply", "Critical", "Uwani", "Households report no supply since Monday morning.", "Pending"],
  ["Dirty water", "Moderate", "Oji River", "Water from public tap has visible particles.", "Approved"],
  ["Flooding", "Critical", "Abakpa", "Roadside flooding after repeated drainage overflow.", "Pending"],
  ["Blocked drainage", "Moderate", "Enugu North", "Drainage blocked by waste near school entrance.", "Approved"],
  ["Open defecation", "Moderate", "Awgu", "Public toilet closed, residents using nearby bush path.", "Pending"],
  ["Waste contamination", "Critical", "Uwani", "Waste dump is contaminating shallow water source.", "Approved"],
  ["No water supply", "Moderate", "Nsukka", "Water refill center has been closed for two days.", "Resolved"]
];

export function initState() {
  if (!localStorage.getItem(STORAGE_KEY)) {
    const seeded = baseReports.map((report, index) => makeReport({
      type: report[0],
      severity: report[1],
      area: report[2],
      description: report[3],
      status: report[4],
      createdAt: Date.now() - (index + 1) * 3600 * 1000
    }));
    saveReports(seeded);
  }
}

export function getReports() {
  return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
}

export function addReport(report) {
  const reports = getReports();
  reports.push(makeReport(report));
  saveReports(reports);
}

export function updateReport(id, patch) {
  saveReports(getReports().map(report => report.id === id ? { ...report, ...patch } : report));
}

export function deleteReport(id) {
  saveReports(getReports().filter(report => report.id !== id));
}

export function seedReport() {
  const options = [
    ["Flooding", "Critical", "Abakpa", "Drainage line overflow is moving toward residential buildings."],
    ["Dirty water", "Critical", "Oji River", "Multiple households report brown water after morning supply."],
    ["Broken borehole", "Moderate", "Enugu North", "Pump handle damaged at community borehole."]
  ];
  const picked = options[Math.floor(Math.random() * options.length)];
  addReport({ type: picked[0], severity: picked[1], area: picked[2], description: picked[3] });
}

function makeReport(report) {
  return {
    id: report.id || crypto.randomUUID(),
    type: report.type,
    severity: report.severity || "Moderate",
    area: report.area || "Uwani",
    description: report.description || "Citizen-submitted field report.",
    status: report.status || "Pending",
    trust: report.trust || Math.floor(62 + Math.random() * 35),
    createdAt: report.createdAt || Date.now(),
    lat: report.lat || null,
    lng: report.lng || null
  };
}

function saveReports(reports) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(reports));
}
