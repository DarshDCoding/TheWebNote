// ── utils/importModal.js ──────────────────────────────────────────────────────
// 3-step import modal: File Selection → Loading → Results with duplicate handling

// ── Validation ────────────────────────────────────────────────────────────────

function validateBackup(parsed) {
  if (typeof parsed !== "object" || parsed === null) return false;
  if (!parsed._meta || !Array.isArray(parsed.sites)) return false;

  const meta = parsed._meta;
  if (!meta.extensionName || !meta.generatedAt) return false;

  for (const site of parsed.sites) {
    if (typeof site.url !== "string") return false;
    if (!site.data || typeof site.data !== "object") return false;
    for (const priority of ["important", "medium", "normal"]) {
      if (!Array.isArray(site.data[priority])) return false;
    }
  }

  return true;
}

function countNotesByPriority(sites) {
  const counts = { important: 0, medium: 0, normal: 0 };
  for (const site of sites) {
    for (const priority of ["important", "medium", "normal"]) {
      counts[priority] += (site.data[priority] || []).length;
    }
  }
  return counts;
}

function sendMessage(msg) {
  return new Promise((resolve) => chrome.runtime.sendMessage(msg, resolve));
}

// ── State ─────────────────────────────────────────────────────────────────────

let importState = {
  parsedBackup: null,
  results: [],          // [{ url, imported, duplicates, failed, notes }]
  overwriteAll: {},     // { [url]: boolean }
  overwriteNote: {},    // { [noteId]: boolean }
};

function resetState() {
  importState = {
    parsedBackup: null,
    results: [],
    overwriteAll: {},
    overwriteNote: {},
  };
}

// ── DOM helpers ───────────────────────────────────────────────────────────────

const overlay   = () => document.getElementById("importOverlay");
const stepEl    = (n) => document.getElementById(`importStep${n}`);

function showStep(n) {
  [1, 2, 3].forEach((i) => {
    stepEl(i).style.display = i === n ? "flex" : "none";
  });
}

function closeModal() {
  overlay().classList.remove("is-open");
  resetState();
  // Reset step 1 UI
  document.getElementById("importFileInfo").style.display   = "none";
  document.getElementById("importFileInput").value          = "";
  document.getElementById("importDropZone").style.borderColor = "";
  document.getElementById("importValidationMsg").textContent = "";
  document.getElementById("importNextBtn").disabled         = true;
}

// ── Step 1: File ingestion ────────────────────────────────────────────────────

function processFileText(text, source = "file") {
  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch {
    showValidation("&#10006 Invalid JSON — could not parse file.", "error");
    importState.parsedBackup = null;
    document.getElementById("importNextBtn").disabled = true;
    return;
  }

  if (!validateBackup(parsed)) {
    showValidation("&#10006 Not a valid TheWebNote backup file.", "error");
    importState.parsedBackup = null;
    document.getElementById("importNextBtn").disabled = true;
    return;
  }

  importState.parsedBackup = parsed;

  const counts = countNotesByPriority(parsed.sites);
  const total  = counts.important + counts.medium + counts.normal;
  const parts  = [];
  if (counts.important) parts.push(`<span class="iv-badge iv-badge-imp">${counts.important} Important</span>`);
  if (counts.medium)    parts.push(`<span class="iv-badge iv-badge-med">${counts.medium} Medium</span>`);
  if (counts.normal)    parts.push(`<span class="iv-badge iv-badge-nor">${counts.normal} Normal</span>`);

  showValidation(
    `&#10003 Valid backup — ${parsed.sites.length} site${parsed.sites.length !== 1 ? "s" : ""}, ${total} note${total !== 1 ? "s" : ""}. ${parts.join(" ")}`,
    "success"
  );

  if (source === "file") {
    document.getElementById("importFileInfo").style.display = "flex";
    document.getElementById("importFileName").textContent   = parsed._meta?.extensionVersion
      ? `Backup v${parsed._meta.extensionVersion} · ${new Date(parsed._meta.generatedAt).toLocaleString()}`
      : "Backup file";
  }

  document.getElementById("importNextBtn").disabled = false;
}

function showValidation(html, type) {
  const el = document.getElementById("importValidationMsg");
  el.innerHTML   = html;
  el.className   = "import-validation-msg " + (type === "success" ? "iv-success" : "iv-error");
}

// ── Step 2: Load & process ────────────────────────────────────────────────────

async function runImport() {
  showStep(2);
  document.getElementById("importLoadingMsg").textContent = "Loading existing notes…";

  const backup = importState.parsedBackup;
  const results = [];
  const seenInBatch = new Set(); // ── guard against duplicates within the backup itself

  for (const site of backup.sites) {
    const url       = site.url;
    const existing  = await sendMessage({ action: "GET_NOTES", url });
    const existingIds = new Set([
      ...(existing.important || []),
      ...(existing.medium    || []),
      ...(existing.normal    || []),
    ].map(n => n.id));

    const siteResult = {
      url,
      imported:   [],
      duplicates: [],
      failed:     [],
    };

    for (const priority of ["important", "medium", "normal"]) {
      for (const note of (site.data[priority] || [])) {
        if (existingIds.has(note.id) || seenInBatch.has(note.id)) {
          siteResult.duplicates.push({ ...note, _priority: priority });
        } else {
          siteResult.imported.push({ ...note, _priority: priority });
          seenInBatch.add(note.id); // mark so it can't pass again in this batch
        }
      }
    }

    results.push(siteResult);
    document.getElementById("importLoadingMsg").textContent =
      `Processing ${results.length} / ${backup.sites.length} sites…`;
  }

  importState.results = results;
  await new Promise(r => setTimeout(r, 300));
  renderStep3();
  showStep(3);
}

// ── Step 3: Results ───────────────────────────────────────────────────────────

function renderStep3() {
  const container = document.getElementById("importResultsList");
  container.innerHTML = "";

  importState.results.forEach((site) => {
    const hasDups      = site.duplicates.length > 0;
    const url          = site.url;
    const overwriteAll = importState.overwriteAll[url] ?? false;

    const siteBlock = document.createElement("div");
    siteBlock.className   = "ir-site-block";
    siteBlock.dataset.url = url;

    // ── Site header ──
    const siteHeader = document.createElement("div");
    siteHeader.className = "ir-site-header";

    const favicon   = document.createElement("img");
    favicon.src     = `https://www.google.com/s2/favicons?domain=${url}&sz=32`;
    favicon.onerror = () => (favicon.style.display = "none");
    favicon.className = "ir-favicon";

    const siteName = document.createElement("span");
    siteName.className   = "ir-site-name";
    siteName.textContent = url;

    const badges = document.createElement("div");
    badges.className = "ir-badges";

    if (site.imported.length) {
      const b = makeBadge(`${site.imported.length} Imported`, "imported");
      b.addEventListener("click", () => toggleNotesList(siteBlock, "imported"));
      badges.appendChild(b);
    }
    if (site.duplicates.length) {
      const b = makeBadge(`${site.duplicates.length} Duplicate${site.duplicates.length > 1 ? "s" : ""}`, "duplicate");
      b.addEventListener("click", () => toggleNotesList(siteBlock, "duplicate"));
      badges.appendChild(b);
    }
    if (site.failed.length) {
      const b = makeBadge(`${site.failed.length} Failed`, "failed");
      b.addEventListener("click", () => toggleNotesList(siteBlock, "failed"));
      badges.appendChild(b);
    }

    siteHeader.appendChild(favicon);
    siteHeader.appendChild(siteName);
    siteHeader.appendChild(badges);
    siteBlock.appendChild(siteHeader);

    // ── Duplicate controls ──
    if (hasDups) {
      const dupControls = document.createElement("div");
      dupControls.className = "ir-dup-controls";

      const overwriteAllLabel = document.createElement("label");
      overwriteAllLabel.className = "ir-overwrite-all-label";

      const overwriteAllCb    = document.createElement("input");
      overwriteAllCb.type     = "checkbox";
      overwriteAllCb.checked  = overwriteAll;
      overwriteAllCb.addEventListener("change", () => {
        importState.overwriteAll[url] = overwriteAllCb.checked;
        // Sync all per-note checkboxes for this site
        siteBlock.querySelectorAll(".ir-note-overwrite-cb").forEach(cb => {
          cb.checked = overwriteAllCb.checked;
          importState.overwriteNote[cb.dataset.id] = overwriteAllCb.checked;
        });
      });

      overwriteAllLabel.appendChild(overwriteAllCb);
      overwriteAllLabel.appendChild(document.createTextNode(" Overwrite all duplicates for this site"));
      dupControls.appendChild(overwriteAllLabel);
      siteBlock.appendChild(dupControls);
    }

    // ── Notes list panel (hidden by default) ──
    const notesPanel = document.createElement("div");
    notesPanel.className = "ir-notes-panel";
    notesPanel.style.display = "none";
    siteBlock.appendChild(notesPanel);

    container.appendChild(siteBlock);
  });
}

function makeBadge(text, type) {
  const b = document.createElement("span");
  b.className   = `ir-badge ir-badge-${type}`;
  b.textContent = text;
  return b;
}

function toggleNotesList(siteBlock, type) {
  const url    = siteBlock.dataset.url;
  const site   = importState.results.find(s => s.url === url);
  const panel  = siteBlock.querySelector(".ir-notes-panel");

  // If same type already showing, toggle off
  if (panel.dataset.activeType === type && panel.style.display !== "none") {
    panel.style.display = "none";
    panel.dataset.activeType = "";
    return;
  }

  panel.dataset.activeType = type;
  panel.style.display      = "block";
  panel.innerHTML          = "";

  let notes = [];
  if (type === "imported")  notes = site.imported;
  if (type === "duplicate") notes = site.duplicates;
  if (type === "failed")    notes = site.failed;

  if (!notes.length) {
    panel.innerHTML = `<p class="ir-empty-panel">No notes in this category.</p>`;
    return;
  }

  notes.forEach((note) => {
    const row = document.createElement("div");
    row.className = "ir-note-row";

    const noteText = document.createElement("span");
    noteText.className   = "ir-note-text";
    noteText.textContent = note.note
      ? (note.note.length > 60 ? note.note.slice(0, 60) + "…" : note.note)
      : (note.img ? "📷 Image note" : "(empty)");

    const priorityTag = document.createElement("span");
    priorityTag.className   = `ir-priority-tag ir-priority-${note._priority || note.priority}`;
    priorityTag.textContent = (note._priority || note.priority || "normal");

    row.appendChild(noteText);
    row.appendChild(priorityTag);

    // Per-note overwrite checkbox for duplicates
    if (type === "duplicate") {
      const overwriteLabel = document.createElement("label");
      overwriteLabel.className = "ir-note-overwrite-label";

      const cb          = document.createElement("input");
      cb.type           = "checkbox";
      cb.className      = "ir-note-overwrite-cb";
      cb.dataset.id     = note.id;
      cb.checked        = importState.overwriteNote[note.id] ?? importState.overwriteAll[url] ?? false;
      cb.addEventListener("change", () => {
        importState.overwriteNote[note.id] = cb.checked;
      });

      overwriteLabel.appendChild(cb);
      overwriteLabel.appendChild(document.createTextNode(" Overwrite"));
      row.appendChild(overwriteLabel);
    }

    panel.appendChild(row);
  });
}

// ── Final commit ──────────────────────────────────────────────────────────────

async function commitImport() {
  const confirmBtn = document.getElementById("importCommitBtn");
  confirmBtn.disabled   = true;
  confirmBtn.textContent = "Importing…";

  for (const site of importState.results) {
    const url = site.url;

    // Write all non-duplicate notes
    for (const note of site.imported) {
      const { _priority, ...cleanNote } = note;
      const noteToSave = { ...cleanNote, priority: _priority || cleanNote.priority };
      await sendMessage({ action: "ADD_NOTE", url, note: noteToSave });
    }

    // Write duplicates that user opted to overwrite
    for (const note of site.duplicates) {
      const shouldOverwrite =
        importState.overwriteNote[note.id] ??
        importState.overwriteAll[url] ??
        false;

      if (shouldOverwrite) {
        await sendMessage({
          action: "UPDATE_NOTE",
          url,
          id:      note.id,
          updates: { note: note.note, img: note.img, priority: note._priority || note.priority },
        });
      }
    }
  }

  confirmBtn.textContent = "Done!";
  setTimeout(() => {
    closeModal();
    // Reload the dashboard to reflect newly imported notes
    window.location.reload();
  }, 800);
}

// ── Init ──────────────────────────────────────────────────────────────────────

export function initImportModal() {
  // ── Open button ──
  document.getElementById("importBtn").addEventListener("click", () => {
    resetState();
    showStep(1);
    document.getElementById("importNextBtn").disabled         = true;
    document.getElementById("importValidationMsg").textContent = "";
    document.getElementById("importFileInfo").style.display   = "none";
    document.getElementById("importPasteArea").value          = "";
    overlay().classList.add("is-open");
  });

  // ── Close / cancel ──
  document.getElementById("importModalClose").addEventListener("click", closeModal);
  document.getElementById("importStep3Close").addEventListener("click", closeModal);
  document.getElementById("importCancelBtn").addEventListener("click", closeModal);
  overlay().addEventListener("click", (e) => { if (e.target === overlay()) closeModal(); });

  // ── File input ──
  document.getElementById("importFileInput").addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => processFileText(ev.target.result, "file");
    reader.readAsText(file);
  });

  // ── Drag & Drop ──
  const dropZone = document.getElementById("importDropZone");

  dropZone.addEventListener("dragover", (e) => {
    e.preventDefault();
    dropZone.style.borderColor = "var(--primary-blue)";
  });
  dropZone.addEventListener("dragleave", () => {
    dropZone.style.borderColor = "";
  });
  dropZone.addEventListener("drop", (e) => {
    e.preventDefault();
    dropZone.style.borderColor = "";
    const file = e.dataTransfer.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => processFileText(ev.target.result, "drop");
    reader.readAsText(file);
  });

  // ── Browse File button ──
  document.getElementById("importBrowseBtn").addEventListener("click", (e) => {
    e.stopPropagation();
    document.getElementById("importFileInput").click();
  });

  // ── Ctrl+V / Cmd+V paste anywhere in the modal ──
  document.addEventListener("paste", (e) => {
    if (!overlay().classList.contains("is-open")) return;
    const stepEl1 = document.getElementById("importStep1");
    if (stepEl1.style.display === "none") return;

    // Try pasted files first
    const files = e.clipboardData?.files;
    if (files && files.length > 0) {
      const file = files[0];
      const reader = new FileReader();
      reader.onload = (ev) => processFileText(ev.target.result, "file");
      reader.readAsText(file);
      return;
    }

    // Otherwise try pasted text
    const text = e.clipboardData?.getData("text")?.trim();
    if (text) processFileText(text, "paste");
  });

  // ── Step 1 → Step 2 ──
  document.getElementById("importNextBtn").addEventListener("click", () => {
    if (!importState.parsedBackup) return;
    runImport();
  });

  // ── Step 3 commit ──
  document.getElementById("importCommitBtn").addEventListener("click", commitImport);

  // ── Step 3 back ──
  document.getElementById("importBackBtn").addEventListener("click", () => {
    importState.results       = [];
    importState.overwriteAll  = {};
    importState.overwriteNote = {};
    showStep(1);
  });
}