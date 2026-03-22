// ── utils/exportModal.js ──────────────────────────────────────────────────────
// Owns all export modal UI — open, close, populate, collect selections.
// Calls into exporter.js for actual file generation.

import { runExport } from "./exporter.js";

// ── DOM refs ──────────────────────────────────────────────────────────────────
const exportOverlay     = document.getElementById("exportOverlay");
const exportModalClose  = document.getElementById("exportModalClose");
const exportModalCancel = document.getElementById("exportModalCancel");
const exportSiteList    = document.getElementById("exportSiteList");
const selectAllBtn      = document.getElementById("selectAllBtn");
const exportConfirmBtn  = document.getElementById("exportConfirmBtn");

// ── Helpers ───────────────────────────────────────────────────────────────────

function sendMessage(msg) {
  return new Promise((resolve) => chrome.runtime.sendMessage(msg, resolve));
}

function closeExportModal() {
  exportOverlay.classList.remove("is-open");
}

function populateSiteList(sites) {
  exportSiteList.innerHTML = "";
  sites.forEach(({ url }) => {
    const label = document.createElement("label");
    label.className = "site-checkbox-item";

    const checkbox    = document.createElement("input");
    checkbox.type     = "checkbox";
    checkbox.value    = url;
    checkbox.checked  = true;

    const favicon     = document.createElement("img");
    favicon.src       = `https://www.google.com/s2/favicons?domain=${url}&sz=32`;
    favicon.onerror   = () => favicon.style.display = "none";
    Object.assign(favicon.style, {
      width: "16px", height: "16px", borderRadius: "3px"
    });

    const name        = document.createElement("span");
    name.textContent  = url;

    label.appendChild(checkbox);
    label.appendChild(favicon);
    label.appendChild(name);
    exportSiteList.appendChild(label);
  });
}

// ── Select All toggle ─────────────────────────────────────────────────────────
let allSelected = true;

selectAllBtn.addEventListener("click", () => {
  allSelected = !allSelected;
  exportSiteList
    .querySelectorAll("input[type='checkbox']")
    .forEach(cb => cb.checked = allSelected);
  selectAllBtn.textContent = allSelected ? "Deselect All" : "Select All";
});

// ── Close handlers ────────────────────────────────────────────────────────────
exportModalClose.addEventListener("click", closeExportModal);
exportModalCancel.addEventListener("click", closeExportModal);
exportOverlay.addEventListener("click", (e) => {
  if (e.target === exportOverlay) closeExportModal();
});

// ── Export confirm ────────────────────────────────────────────────────────────
exportConfirmBtn.addEventListener("click", async () => {
  const selectedSites = [...exportSiteList.querySelectorAll("input:checked")]
    .map(cb => cb.value);
  const selectedFormats = [...document.querySelectorAll(".format-checkbox:checked")]
    .map(cb => cb.value);

  if (selectedSites.length === 0) {
    alert("Please select at least one site to export.");
    return;
  }

  closeExportModal();
  await runExport(selectedSites, selectedFormats);
});

// ── Init (called from dashboard.js) ──────────────────────────────────────────
export function initExportModal() {
  document.getElementById("exportBtn").addEventListener("click", async () => {
    allSelected = true;
    selectAllBtn.textContent = "Deselect All";
    const sites = await sendMessage({ action: "GET_ALL" });
    populateSiteList(sites);
    exportOverlay.classList.add("is-open");
  });
}