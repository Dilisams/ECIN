const facilities = [
  { name: "Uwani Solar Borehole", area: "Uwani", type: "borehole", distance: "0.8 km", status: "Working", score: 94 },
  { name: "Nsukka Market Public Tap", area: "Nsukka", type: "tap", distance: "1.7 km", status: "Low pressure", score: 71 },
  { name: "Abakpa Hygiene Toilet Hub", area: "Abakpa", type: "toilet", distance: "2.2 km", status: "Open", score: 88 },
  { name: "Oji River Refill Centre", area: "Oji River", type: "tap", distance: "3.4 km", status: "Verified", score: 91 },
  { name: "Awgu Community Borehole", area: "Awgu", type: "borehole", distance: "4.1 km", status: "Working", score: 82 },
  { name: "Enugu North Public Toilet", area: "Enugu North", type: "toilet", distance: "1.1 km", status: "Maintenance due", score: 67 }
];

export function initFinder() {
  const root = document.querySelector("[data-facilities]");
  const search = document.querySelector("[data-finder-search]");
  const buttons = [...document.querySelectorAll("[data-finder-filter] button")];
  let active = "all";
  const render = () => {
    const query = search.value.trim().toLowerCase();
    root.innerHTML = facilities
      .filter(facility => active === "all" || facility.type === active)
      .filter(facility => !query || `${facility.name} ${facility.area}`.toLowerCase().includes(query))
      .map(facility => `
        <article class="facility-card reveal visible">
          <strong>${facility.name}</strong>
          <div class="facility-meta"><span>${facility.area}</span><span>${facility.distance}</span></div>
          <div class="facility-meta"><span>${facility.status}</span><span>${facility.score}% verified</span></div>
          <div class="score-bar"><span style="width:${facility.score}%"></span></div>
        </article>
      `).join("");
  };
  search.addEventListener("input", render);
  buttons.forEach(button => button.addEventListener("click", () => {
    active = button.dataset.filter;
    buttons.forEach(item => item.classList.toggle("active", item === button));
    render();
  }));
  render();
}
