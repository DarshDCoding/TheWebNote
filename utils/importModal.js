// ── utils/importModal.js ──────────────────────────────────────────────────────
import { validateBackup, mergeAndImport, overwriteDuplicates, overwriteSingleNote } from "./importer.js";

// ── DOM refs ──────────────────────────────────────────────────────────────────

const importOverlay       = document.getElementById("importOverlay");
const importModalClose    = document.getElementById("importModalClose");
const importModalCancel   = document.getElementById("importModalCancel");

const importStateSelect   = document.getElementById("importStateSelect");
const importStateProgress = document.getElementById("importStateProgress");
const importStateResults  = document.getElementById("importStateResults");

const importDropzone      = document.getElementById("importDropzone");
const importBrowseBtn     = document.getElementById("importBrowseBtn");
const importFilePreview   = document.getElementById("importFilePreview");
const importConfirmBtn    = document.getElementById("importConfirmBtn");
const importProgressLabel = document.getElementById("importProgressLabel");
const importSummary       = document.getElementById("importSummary");
const importResultsList   = document.getElementById("importResultsList");
const importDoneBtn       = document.getElementById("importDoneBtn");
const importFileInput     = document.getElementById("importFileInput");

// ── Module state ──────────────────────────────────────────────────────────────

let _parsedBackup  = null;
let _importResults = null;

// ── State helpers ─────────────────────────────────────────────────────────────

function showState(stateEl) {
  for (const el of [importStateSelect, importStateProgress, importStateResults]) {
    el.hidden = el !== stateEl;
  }
}

function resetToSelect() {
  _parsedBackup  = null;
  _importResults = null;
  importFilePreview.textContent = "";
  importFilePreview.className   = "import-file-preview";
  importConfirmBtn.disabled     = true;
  importFileInput.value         = "";
  showState(importStateSelect);
}

function openModal() {
  resetToSelect();
  importOverlay.classList.add("is-open");
}

function closeModal() {
  importOverlay.classList.remove("is-open");
}

// ── File validation & preview ─────────────────────────────────────────────────

function loadFile(file) {
  if (!file.name.endsWith(".json")) {
    setPreviewError("Only .json backup files are supported.");
    return;
  }

  const reader = new FileReader();
  reader.onload = (e) => {
    let parsed;
    try {
      parsed = JSON.parse(e.target.result);
    } catch {
      setPreviewError("File is not valid JSON.");
      return;
    }

    const { valid, reason } = validateBackup(parsed);
    if (!valid) {
      setPreviewError(reason);
      return;
    }

    _parsedBackup = parsed;
    const { totalSites, totalNotes, generatedAt, extensionVersion } = parsed._meta;
    const date = new Date(generatedAt).toLocaleString();
    importFilePreview.textContent =
      `✓ ${file.name} — ${totalSites} site${totalSites !== 1 ? "s" : ""}, ` +
      `${totalNotes} note${totalNotes !== 1 ? "s" : ""} (v${extensionVersion}, ${date})`;
    importFilePreview.className = "import-file-preview";
    importConfirmBtn.disabled   = false;
  };

  reader.onerror = () => setPreviewError("Could not read the file.");
  reader.readAsText(file);
}

function setPreviewError(msg) {
  _parsedBackup             = null;
  importConfirmBtn.disabled = true;
  importFilePreview.textContent = `✗ ${msg}`;
  importFilePreview.className   = "import-file-preview has-error";
}

// ── Drag-and-drop ─────────────────────────────────────────────────────────────

importDropzone.addEventListener("dragover", (e) => {
  e.preventDefault();
  importDropzone.classList.add("drag-over");
});
importDropzone.addEventListener("dragleave", () => {
  importDropzone.classList.remove("drag-over");
});
importDropzone.addEventListener("drop", (e) => {
  e.preventDefault();
  importDropzone.classList.remove("drag-over");
  const file = e.dataTransfer.files[0];
  if (file) loadFile(file);
});

// ── Browse ────────────────────────────────────────────────────────────────────

importBrowseBtn.addEventListener("click", () => importFileInput.click());
importFileInput.addEventListener("change", () => {
  const file = importFileInput.files[0];
  if (file) loadFile(file);
});

// ── Paste ─────────────────────────────────────────────────────────────────────

document.addEventListener("paste", (e) => {
  if (!importOverlay.classList.contains("is-open")) return;
  if (importStateSelect.hidden) return;
  const fileItem = Array.from(e.clipboardData.items || [])
    .find(i => i.kind === "file" && i.type === "application/json");
  if (fileItem) {
    const file = fileItem.getAsFile();
    if (file) loadFile(file);
  }
});

// ── Spinner ───────────────────────────────────────────────────────────────────

const SPINNER_SVG = `
<svg viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg" width="80" height="80">
  <circle cx="40" cy="40" r="32" fill="none"
    stroke="var(--primary-blue, #2563eb)" stroke-width="6"
    stroke-linecap="round" stroke-dasharray="100 101"
    transform="rotate(-90 40 40)">
    <animateTransform attributeName="transform" type="rotate"
      from="0 40 40" to="360 40 40" dur="0.9s" repeatCount="indefinite"/>
  </circle>
</svg>`;

// ── Import confirm ────────────────────────────────────────────────────────────

importConfirmBtn.addEventListener("click", async () => {
  if (!_parsedBackup) return;

  importProgressLabel.textContent = "Importing…";
  importStateProgress.querySelector(".import-progress-svg-slot").innerHTML = SPINNER_SVG;
  showState(importStateProgress);

  try {
    _importResults = await mergeAndImport(_parsedBackup.sites);
    renderResults(_importResults);
  } catch (err) {
    importSummary.textContent   = `Import failed: ${err.message}`;
    importResultsList.innerHTML = "";
    showState(importStateResults);
  }
});

// ── Results renderer ──────────────────────────────────────────────────────────

function renderResults(results) {
  const totalImported   = results.reduce((s, r) => s + r.imported,          0);
  const totalDuplicates = results.reduce((s, r) => s + r.duplicates.length, 0);
  const totalFailed     = results.reduce((s, r) => s + r.failed,            0);
  const totalErrors     = results.filter(r => r.error).length;

  importSummary.textContent =
    `Imported ${totalImported} note${totalImported !== 1 ? "s" : ""} ` +
    `across ${results.length} site${results.length !== 1 ? "s" : ""}` +
    (totalDuplicates ? ` · ${totalDuplicates} duplicate${totalDuplicates !== 1 ? "s" : ""} skipped` : "") +
    (totalFailed     ? ` · ${totalFailed} invalid note${totalFailed !== 1 ? "s" : ""} skipped`     : "") +
    (totalErrors     ? ` · ${totalErrors} site${totalErrors !== 1 ? "s" : ""} had errors`           : "");

  importResultsList.innerHTML = "";

  for (const result of results) {
    const row = document.createElement("div");
    row.className = "import-site-row";

    // Header
    const header      = document.createElement("div");
    header.className  = "import-site-header";

    const favicon     = document.createElement("img");
    favicon.className = "import-site-favicon";
    favicon.src       = `https://www.google.com/s2/favicons?domain=${result.url}&sz=32`;
    favicon.onerror   = () => (favicon.style.display = "none");

    const urlSpan       = document.createElement("span");
    urlSpan.textContent = result.url;

    header.appendChild(favicon);
    header.appendChild(urlSpan);
    row.appendChild(header);

    // Badges
    const counts     = document.createElement("div");
    counts.className = "import-site-counts";

    counts.appendChild(makeBadge(`✓ ${result.imported} imported`, "import-badge-imported"));

    if (result.duplicates.length > 0) {
      const dupBadge    = makeBadge(
        `⚠ ${result.duplicates.length} duplicate${result.duplicates.length !== 1 ? "s" : ""}`,
        "import-badge-duplicate import-badge-clickable"
      );
      dupBadge.title = "Click to view duplicate notes";

      // ── Inline collapsible duplicate panel ───────────────────────────────
      const dupPanel     = document.createElement("div");
      dupPanel.className = "import-dup-panel";

      // Inner wrapper required for grid-template-rows collapse transition
      const panelInner     = document.createElement("div");
      panelInner.className = "import-dup-panel-inner";

      // Panel header: label + overwrite-all button
      const panelHeader     = document.createElement("div");
      panelHeader.className = "import-dup-panel-header";

      const panelLabel       = document.createElement("span");
      panelLabel.className   = "import-dup-panel-label";
      panelLabel.textContent = `${result.duplicates.length} duplicate note${result.duplicates.length !== 1 ? "s" : ""} skipped`;

      const overwriteAllBtn       = document.createElement("button");
      overwriteAllBtn.className   = "btn-overwrite";
      overwriteAllBtn.textContent = "Overwrite all";
      overwriteAllBtn.title       = "Replace all existing notes with the imported versions";

      panelHeader.appendChild(panelLabel);
      panelHeader.appendChild(overwriteAllBtn);
      panelInner.appendChild(panelHeader);

      // Note cards — one per duplicate, each with its own overwrite button
      const cardsList     = document.createElement("div");
      cardsList.className = "import-dup-cards";

      // Track per-note overwrite state so "Overwrite all" can stay in sync
      const noteOverwritten = new Array(result.duplicates.length).fill(false);

      function updateOverwriteAllBtn() {
        const allDone = noteOverwritten.every(Boolean);
        if (allDone) {
          overwriteAllBtn.textContent = `\u2713 All overwritten`;
          overwriteAllBtn.disabled    = true;
          dupBadge.textContent        = `\u2713 ${result.duplicates.length} overwritten`;
          dupBadge.className          = "import-badge import-badge-imported";
        }
      }

      result.duplicates.forEach((note, noteIdx) => {
        const wrapper     = document.createElement("div");
        wrapper.className = "import-dup-card-wrap";

        // Card preview HTML
        const previewDiv       = document.createElement("div");
        previewDiv.innerHTML   = renderNotePreview(note);

        // Per-note overwrite button — sits below the card
        const noteBtn       = document.createElement("button");
        noteBtn.className   = "btn-overwrite btn-overwrite-note";
        noteBtn.textContent = "Overwrite";
        noteBtn.title       = "Replace this existing note with the imported version";

        noteBtn.addEventListener("click", async (e) => {
          e.stopPropagation();
          noteBtn.disabled    = true;
          noteBtn.textContent = "Overwriting\u2026";

          const { error } = await overwriteSingleNote(result.url, note);

          if (error) {
            noteBtn.textContent = "Error \u2014 retry";
            noteBtn.disabled    = false;
          } else {
            noteBtn.textContent         = "\u2713 Overwritten";
            noteOverwritten[noteIdx]    = true;
            wrapper.classList.add("import-dup-card-done");
            updateOverwriteAllBtn();
          }
        });

        wrapper.appendChild(previewDiv);
        wrapper.appendChild(noteBtn);
        cardsList.appendChild(wrapper);
      });

      // Wire up "Overwrite all" to fire all pending single overwrites
      overwriteAllBtn.addEventListener("click", async (e) => {
        e.stopPropagation();
        overwriteAllBtn.disabled    = true;
        overwriteAllBtn.textContent = "Overwriting\u2026";

        const { overwritten, error } = await overwriteDuplicates(result.url, result.duplicates);

        if (error) {
          overwriteAllBtn.textContent = "Error \u2014 try again";
          overwriteAllBtn.disabled    = false;
        } else {
          overwriteAllBtn.textContent = `\u2713 All overwritten`;
          dupBadge.textContent        = `\u2713 ${overwritten} overwritten`;
          dupBadge.className          = "import-badge import-badge-imported";
          // Mark all individual buttons as done
          cardsList.querySelectorAll(".btn-overwrite-note").forEach((btn, i) => {
            btn.textContent         = "\u2713 Overwritten";
            btn.disabled            = true;
            noteOverwritten[i]      = true;
            btn.closest(".import-dup-card-wrap").classList.add("import-dup-card-done");
          });
        }
      });

      panelInner.appendChild(cardsList);
      dupPanel.appendChild(panelInner);

      // Toggle on badge click
      let open = false;
      dupBadge.addEventListener("click", () => {
        open = !open;
        if (open) {
          dupPanel.classList.add("is-open");
          dupBadge.textContent = `⚠ ${result.duplicates.length} duplicate${result.duplicates.length !== 1 ? "s" : ""} ▲`;
        } else {
          dupPanel.classList.remove("is-open");
          dupBadge.textContent = `⚠ ${result.duplicates.length} duplicate${result.duplicates.length !== 1 ? "s" : ""}`;
        }
      });

      counts.appendChild(dupBadge);
      row.appendChild(counts);
      row.appendChild(dupPanel);
    } else {
      row.appendChild(counts);
    }

    if (result.failed > 0)
      counts.appendChild(makeBadge(`✗ ${result.failed} invalid`, "import-badge-failed"));
    if (result.error)
      counts.appendChild(makeBadge(`✗ ${result.error}`, "import-badge-error"));

    importResultsList.appendChild(row);
  }

  showState(importStateResults);
}

function makeBadge(text, cls) {
  const span       = document.createElement("span");
  span.className   = `import-badge ${cls}`;
  span.textContent = text;
  return span;
}

function renderNotePreview(note) {
  const img = note.img
    ? `<img src="${note.img}" alt="Note image" class="import-dup-card-img">`
    : "";
  return `
    <div class="task-card priority-${note.priority} import-dup-card">
      ${img}
      <div class="task-content">
        <p class="task-desc">${note.note}</p>
        <div class="task-footer">
          <p class="btn-action date">${note.createdAt ?? ""}</p>
          <span class="import-badge import-badge-duplicate"
                style="font-size:10px;padding:2px 7px;">${note.priority}</span>
        </div>
      </div>
    </div>
  `;
}

// ── Close / done handlers ─────────────────────────────────────────────────────

importDoneBtn.addEventListener("click", closeModal);
importModalClose.addEventListener("click", closeModal);
importModalCancel.addEventListener("click", closeModal);
importOverlay.addEventListener("click", (e) => {
  if (e.target === importOverlay) closeModal();
});

// ── Init ──────────────────────────────────────────────────────────────────────

export function initImportModal({ onDone } = {}) {
  document.getElementById("importBtn").addEventListener("click", openModal);
  if (onDone) {
    importDoneBtn.addEventListener("click", onDone);
  }
}