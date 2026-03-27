// ── utils/exportModal.js ──────────────────────────────────────────────────────
import { runExport } from "./exporter.js";
import { sendMessage } from "./messaging.js";

// ── Formats config ────────────────────────────────────────────────────────────
const FORMATS = [
  {
    value:  "json-info",
    label:  "JSON",
    desc:   "Complete backup with images. Only format that supports import.",
    badge:  { text: "Always included — required for import", cls: "badge-recommended" },
    static: true,  // not a checkbox — just info
  },
  {
    value: "html",
    label: "HTML",
    desc:  "Self contained file, opens in any browser",
    badge: { text: "Best for archiving", cls: "badge-archive" },
  },
  {
    value: "pdf",
    label: "PDF",
    desc:  "Printable archive",
    badge: { text: "Best for reading", cls: "badge-reading" },
  },
  {
    value: "md",
    label: "Markdown",
    desc:  "For Obsidian, Notion, or readable archive",
    badge: null,
  },
  {
    value: "csv",
    label: "CSV",
    desc:  "Opens in Excel or Google Sheets",
    badge: null,
  },
  {
    value: "txt",
    label: "TXT",
    desc:  "Plain text readable archive",
    badge: null,
  },
];

// ── Render a single format option ─────────────────────────────────────────────
function renderFormatOption(format) {
  const badge = format.badge
    ? `<span class="format-badge ${format.badge.cls}">${format.badge.text}</span>`
    : "";

  if (format.static) {
    return `
      <div class="format-option format-json-info">
        <div class="format-info">
          <span class="format-name">${format.label} ${badge}</span>
          <span class="format-desc">${format.desc}</span>
        </div>
      </div>
    `;
  }

  return `
    <label class="format-option">
      <input type="checkbox" value="${format.value}" class="format-checkbox">
      <div class="format-info">
        <span class="format-name">${format.label} ${badge}</span>
        <span class="format-desc">${format.desc}</span>
      </div>
    </label>
  `;
}

// ── Populate format list ──────────────────────────────────────────────────────
function populateFormatList() {
  const formatList = document.getElementById("exportFormatList");
  formatList.innerHTML = FORMATS.map(renderFormatOption).join("");
}

// ── DOM refs ──────────────────────────────────────────────────────────────────
const exportOverlay     = document.getElementById("exportOverlay");
const exportModalClose  = document.getElementById("exportModalClose");
const exportModalCancel = document.getElementById("exportModalCancel");
const exportSiteList    = document.getElementById("exportSiteList");
const selectAllBtn      = document.getElementById("selectAllBtn");
const exportConfirmBtn  = document.getElementById("exportConfirmBtn");

// ── Helpers ───────────────────────────────────────────────────────────────────
function closeExportModal() {
  exportOverlay.classList.remove("is-open");
}

function populateSiteList(sites) {
  exportSiteList.innerHTML = "";
  sites.forEach(({ url }) => {
    const label = document.createElement("label");
    label.className = "site-checkbox-item";

    const checkbox   = document.createElement("input");
    checkbox.type    = "checkbox";
    checkbox.value   = url;
    checkbox.checked = true;

    const favicon     = document.createElement("img");
    favicon.src       = `https://www.google.com/s2/favicons?domain=${url}&sz=32`;
    favicon.onerror   = () => favicon.style.display = "none";
    Object.assign(favicon.style, {
      width: "16px", height: "16px", borderRadius: "3px"
    });

    const name       = document.createElement("span");
    name.textContent = url;

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

// ── Init ──────────────────────────────────────────────────────────────────────
export function initExportModal() {
  populateFormatList();

  document.getElementById("exportBtn").addEventListener("click", async () => {
    allSelected = true;
    selectAllBtn.textContent = "Deselect All";
    const sites = await sendMessage({ action: "GET_ALL" });
    populateSiteList(sites);
    exportOverlay.classList.add("is-open");
  });
}