export const i18n = {
  en: {
    navReport: "Report",
    navDashboard: "Dashboard",
    navMap: "Live Map",
    navFinder: "Finder",
    navAdmin: "Admin",
    heroTitle: "Real-Time Water & Sanitation Intelligence for Enugu State",
    heroSubtitle: "Track, report, and solve water and sanitation issues through community-powered data.",
    reportIssue: "Report an Issue",
    exploreDashboard: "Explore Live Dashboard",
    reportTitle: "Turn a field observation into live intelligence."
  },
  ig: {
    navReport: "Kọọ Nsogbu",
    navDashboard: "Dashboard",
    navMap: "Maapụ Ndụ",
    navFinder: "Chọta Mmiri",
    navAdmin: "Nlekọta",
    heroTitle: "Ozi Mmiri na Idebe Ọcha Ozugbo maka Steeti Enugu",
    heroSubtitle: "Soro, kọọrọ, ma dozie nsogbu mmiri na idebe ọcha site na data obodo.",
    reportIssue: "Kọọ Nsogbu",
    exploreDashboard: "Lee Dashboard",
    reportTitle: "Gbanwee ihe a hụrụ n'ọhịa ka ọ bụrụ ozi bara uru."
  }
};

export function toggleLanguage(language) {
  const dictionary = i18n[language] || i18n.en;
  document.querySelectorAll("[data-i18n]").forEach(element => {
    const key = element.dataset.i18n;
    if (dictionary[key]) element.textContent = dictionary[key];
  });
}
