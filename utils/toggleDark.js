// ── Dark mode toggle ──────────────────────────────────────────────────────────

export function initTheme() {
  const themeToggle = document.getElementById("themeToggle");

  const lightIcon = chrome.runtime.getURL("assets/svgs/lightMode.svg");
  const darkIcon  = chrome.runtime.getURL("assets/svgs/darkMode.svg");

  function applyTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    themeToggle.innerHTML = theme === "dark"
      ? `<img src="${lightIcon}" alt="Switch to light mode">`
      : `<img src="${darkIcon}"  alt="Switch to dark mode">`;
  }

  applyTheme(localStorage.getItem("webnote-theme") || "light");

  themeToggle.addEventListener("click", () => {
    const next = document.documentElement.getAttribute("data-theme") === "dark"
      ? "light" : "dark";
    localStorage.setItem("webnote-theme", next);
    applyTheme(next);
  });
}