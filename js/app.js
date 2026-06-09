import { initState, addReport, updateReport, deleteReport, getReports, seedReport } from "./state.js";
import { initCharts, updateCharts } from "./charts.js";
import { initMap, renderMap } from "./map.js";
import { initFinder } from "./finder.js";
import { i18n, toggleLanguage } from "./i18n.js";

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

const app = {
  charts: null,
  map: null,
  lang: "en"
};

initState();

document.addEventListener("DOMContentLoaded", () => {
  setTimeout(() => $("[data-loader]")?.classList.add("hidden"), 420);
  initReveal();
  initCounters();
  initNavigation();
  initTheme();
  initRipples();
  initReporting();
  initAuth();
  initAdmin();
  initOffline();
  initLanguage();
  app.charts = initCharts();
  app.map = initMap();
  initFinder();
  refresh();
  notify("SafeFlow demo intelligence is live.");
});

function refresh() {
  const reports = getReports();
  updateDashboardNumbers(reports);
  updateCharts(app.charts, reports);
  renderMap(app.map, reports);
  renderIntelligence(reports);
  renderAdmin(reports);
}

function initReveal() {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.14 });
  $$(".reveal").forEach(element => observer.observe(element));
}

function initCounters() {
  const animateCounter = element => {
    const target = Number(element.dataset.counter);
    const start = performance.now();
    const duration = 1400;
    const tick = now => {
      const progress = Math.min((now - start) / duration, 1);
      const value = Math.floor(target * easeOutQuart(progress));
      element.textContent = value.toLocaleString();
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        observer.unobserve(entry.target);
      }
    });
  });
  $$("[data-counter]").forEach(counter => observer.observe(counter));
}

function initNavigation() {
  const toggle = $("[data-nav-toggle]");
  const mobileQuery = window.matchMedia("(max-width: 980px)");
  const syncMenuMode = () => {
    if (!toggle) return;
    toggle.hidden = !mobileQuery.matches;
    if (!mobileQuery.matches) $("[data-nav]")?.classList.remove("open");
  };
  syncMenuMode();
  mobileQuery.addEventListener("change", syncMenuMode);
  toggle?.addEventListener("click", () => $("[data-nav]")?.classList.toggle("open"));
  $$("[data-nav] a").forEach(link => link.addEventListener("click", () => $("[data-nav]")?.classList.remove("open")));
}

function initTheme() {
  const saved = localStorage.getItem("safeflow-theme");
  if (saved) document.documentElement.dataset.theme = saved;
  $("[data-theme-toggle]")?.addEventListener("click", () => {
    const next = document.documentElement.dataset.theme === "dark" ? "" : "dark";
    if (next) document.documentElement.dataset.theme = next;
    else document.documentElement.removeAttribute("data-theme");
    localStorage.setItem("safeflow-theme", next);
  });
}

function initRipples() {
  $$("[data-ripple]").forEach(button => {
    button.addEventListener("click", event => {
      const rect = button.getBoundingClientRect();
      const ripple = document.createElement("span");
      ripple.className = "ripple";
      ripple.style.left = `${event.clientX - rect.left}px`;
      ripple.style.top = `${event.clientY - rect.top}px`;
      button.append(ripple);
      setTimeout(() => ripple.remove(), 700);
    });
  });
}

function initReporting() {
  const form = $("[data-report-form]");
  $("[data-gps]")?.addEventListener("click", () => {
    const status = $("[data-gps-status]");
    if (!navigator.geolocation) {
      status.textContent = "GPS unavailable, using selected community";
      return;
    }
    status.textContent = "Acquiring GPS...";
    navigator.geolocation.getCurrentPosition(
      position => {
        status.textContent = `GPS locked: ${position.coords.latitude.toFixed(3)}, ${position.coords.longitude.toFixed(3)}`;
        form.dataset.lat = position.coords.latitude;
        form.dataset.lng = position.coords.longitude;
      },
      () => {
        status.textContent = "GPS permission skipped, using selected community";
      },
      { timeout: 6000 }
    );
  });

  form?.addEventListener("submit", event => {
    event.preventDefault();
    const data = new FormData(form);
    addReport({
      type: data.get("type"),
      severity: data.get("severity"),
      area: data.get("area"),
      description: data.get("description"),
      lat: form.dataset.lat,
      lng: form.dataset.lng
    });
    form.reset();
    $("[data-gps-status]").textContent = "Manual area selected";
    showModal();
    notify("New report added to live dashboard.");
    refresh();
  });
}

function initAuth() {
  $("[data-auth-form]")?.addEventListener("submit", event => {
    event.preventDefault();
    const email = new FormData(event.currentTarget).get("email");
    localStorage.setItem("safeflow-user", String(email));
    $("[data-auth-status]").textContent = `Signed in as ${email}`;
    notify("Role-based demo session started.");
  });
  const user = localStorage.getItem("safeflow-user");
  if (user) $("[data-auth-status]").textContent = `Signed in as ${user}`;
}

function initAdmin() {
  $("[data-seed-report]")?.addEventListener("click", () => {
    seedReport();
    notify("Demo alert injected into the response queue.");
    refresh();
  });
  document.addEventListener("click", event => {
    const action = event.target.closest("[data-admin-action]");
    if (!action) return;
    const id = action.dataset.id;
    const type = action.dataset.adminAction;
    if (type === "approve") updateReport(id, { status: "Approved" });
    if (type === "solve") updateReport(id, { status: "Resolved", severity: "Safe" });
    if (type === "spam") deleteReport(id);
    notify(`Report ${type === "spam" ? "removed" : "updated"}.`);
    refresh();
  });
}

function initOffline() {
  const syncStatus = () => {
    if (!navigator.onLine) notify("Offline mode active. Reports will queue locally.");
  };
  window.addEventListener("offline", syncStatus);
  window.addEventListener("online", () => notify("Connection restored. Local reports are synced for demo."));
  syncStatus();
}

function initLanguage() {
  $("[data-lang-toggle]")?.addEventListener("click", event => {
    app.lang = app.lang === "en" ? "ig" : "en";
    event.currentTarget.textContent = app.lang === "en" ? "Igbo" : "English";
    toggleLanguage(app.lang);
    notify(app.lang === "ig" ? "Igbo interface enabled." : "English interface enabled.");
  });
  toggleLanguage(app.lang);
}

function updateDashboardNumbers(reports) {
  const active = reports.filter(report => report.status !== "Resolved").length;
  const resolved = reports.filter(report => report.status === "Resolved").length;
  const risk = new Set(reports.filter(report => report.severity === "Critical").map(report => report.area)).size;
  $("[data-live-total]").textContent = reports.length;
  $("[data-live-active]").textContent = active;
  $("[data-live-resolved]").textContent = resolved;
  $("[data-live-risk]").textContent = risk;
}

function renderIntelligence(reports) {
  const byArea = groupCount(reports, "area");
  const byType = groupCount(reports, "type");
  const topArea = Object.entries(byArea).sort((a, b) => b[1] - a[1])[0] || ["Uwani", 0];
  const topType = Object.entries(byType).sort((a, b) => b[1] - a[1])[0] || ["No water supply", 0];
  const critical = reports.filter(report => report.severity === "Critical").length;
  const lines = [
    `${topArea[0]} has seen a ${Math.min(68, 28 + topArea[1] * 7)}% increase in water and sanitation complaints.`,
    `${topType[0]} is the highest-frequency issue in the current report stream.`,
    `${critical} critical signals require field validation within the next response cycle.`
  ];
  $("[data-intelligence-list]").innerHTML = lines.map(line => `<li>${line}</li>`).join("");
}

function renderAdmin(reports) {
  const list = $("[data-admin-list]");
  list.innerHTML = reports.slice().reverse().map(report => `
    <article class="admin-item">
      <header>
        <strong>${report.type}</strong>
        <span class="status-badge">${report.status}</span>
      </header>
      <span>${report.area} · ${report.severity} · ${new Date(report.createdAt).toLocaleString()}</span>
      <p>${report.description}</p>
      <div class="admin-actions">
        <button type="button" data-admin-action="approve" data-id="${report.id}">Approve</button>
        <button type="button" data-admin-action="solve" data-id="${report.id}">Mark solved</button>
        <button type="button" data-admin-action="spam" data-id="${report.id}">Remove spam</button>
      </div>
    </article>
  `).join("");
}

function showModal() {
  const modal = $("[data-success-modal]");
  if (modal?.showModal) modal.showModal();
  $$("[data-close-modal]").forEach(button => button.onclick = () => modal.close());
}

export function notify(message) {
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.textContent = message;
  $("[data-toasts]").append(toast);
  setTimeout(() => toast.remove(), 4200);
}

function groupCount(items, key) {
  return items.reduce((acc, item) => {
    acc[item[key]] = (acc[item[key]] || 0) + 1;
    return acc;
  }, {});
}

function easeOutQuart(value) {
  return 1 - Math.pow(1 - value, 4);
}

window.SafeFlow = { refresh, i18n };
