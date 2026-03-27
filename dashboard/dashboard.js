import { initTheme } from "../utils/toggleDark.js";
import { renderElement }         from "../utils/render.js";
import { addGlobalEventListner, initImageViewer } from "../utils/events.js";
import { initExportModal } from "../utils/exportModal.js";

const container = document.getElementById("dashboard-container");
document.getElementById("backBtn").addEventListener("click", () => window.close());

// ── All DB operations go through background.js via sendMessage ────────────────

function sendMessage(msg) {
  return new Promise((resolve) => chrome.runtime.sendMessage(msg, resolve));
}

// ── Build one site card ───────────────────────────────────────────────────────

const MAX_VISIBLE = 5;

function buildSiteCard(url, data) {
  const order = ["important", "medium", "normal"];

  // Stamp _url on each note so the global delete handler knows which site
  const allNotes = order.flatMap(p =>
    [...(data[p] || [])]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .map(note => ({ ...note, _url: url }))
  );

  // ── Card shell ──
  const card = document.createElement("div");
  card.className   = "site-card";
  card.dataset.url = url;

  // ── Header: favicon + link + delete-site ──
  const header = document.createElement("div");
  header.className = "site-card-header";

  const link = document.createElement("a");
  link.className = "site-title-link";
  link.href      = `https://${url}`;
  link.target    = "_blank";
  link.rel       = "noopener noreferrer";

  const favicon = document.createElement("img");
  favicon.className = "site-favicon";
  favicon.src       = `https://www.google.com/s2/favicons?domain=${url}&sz=32`;
  favicon.onerror   = () => favicon.style.display = "none";

  const siteName = document.createElement("span");
  siteName.textContent = url;

  link.appendChild(favicon);
  link.appendChild(siteName);

  const delSiteBtn = document.createElement("button");
  delSiteBtn.className = "site-delete-btn";
  delSiteBtn.title     = "Delete all notes for this site";
  delSiteBtn.innerHTML = `<img src="${chrome.runtime.getURL("assets/svgs/deleteCard.svg")}" style="height:50px;width:50px">`;
  delSiteBtn.addEventListener("click", async () => {
    await sendMessage({ action: "DELETE_SITE", url });
    card.classList.add("site-card-fade-out");
    setTimeout(() => { card.remove(); checkEmpty(); }, 260);
  });

  header.appendChild(link);
  header.appendChild(delSiteBtn);
  card.appendChild(header);

  // ── Notes wrap ──
  const notesWrap = document.createElement("div");
  notesWrap.className = "site-notes-wrap";

  // First MAX_VISIBLE — pass "dashboard" context so Edit button is suppressed
  const visibleWrap = document.createElement("div");
  visibleWrap.className = "notes-visible";
  visibleWrap.innerHTML = allNotes
    .slice(0, MAX_VISIBLE)
    .map(note => renderElement(note, "dashboard"))
    .join("");
  notesWrap.appendChild(visibleWrap);

  // Remaining notes in a smooth collapsible
  const hidden = allNotes.slice(MAX_VISIBLE);
  if (hidden.length > 0) {
    const collapser      = document.createElement("div");
    collapser.className  = "notes-collapser";

    const collapserInner = document.createElement("div");
    collapserInner.className = "notes-collapser-inner";
    collapserInner.innerHTML = hidden
      .map(note => renderElement(note, "dashboard"))
      .join("");

    collapser.appendChild(collapserInner);
    notesWrap.appendChild(collapser);

    const toggleBtn = document.createElement("button");
    toggleBtn.className   = "btn-show-all";
    toggleBtn.textContent = `Show all ${allNotes.length} notes ↓`;

    let expanded = false;
    toggleBtn.addEventListener("click", () => {
      expanded = !expanded;
      collapser.classList.toggle("is-expanded", expanded);
      toggleBtn.textContent = expanded
        ? "Show less ↑"
        : `Show all ${allNotes.length} notes ↓`;
      if (!expanded) card.scrollIntoView({ behavior: "smooth", block: "nearest" });
    });

    notesWrap.appendChild(toggleBtn);
  }

  card.appendChild(notesWrap);
  return card;
}

// ── Global delete handler — mirrors popup.js pattern ─────────────────────────

function setupDeleteHandler() {
  addGlobalEventListner("click", ".btn-delete", (e) => {
    const btn      = e.target.closest(".btn-delete");
    const noteId   = btn.dataset.id;
    const url      = btn.dataset.url;
    const taskCard = btn.closest(".task-card");
    const siteCard = btn.closest(".site-card");
    const notesWrap = siteCard?.querySelector(".site-notes-wrap");

    // Freeze height, then animate to 0 so cards below slide up
    const cardHeight = taskCard.offsetHeight;
    taskCard.style.height     = cardHeight + "px";
    taskCard.style.overflow   = "hidden";
    taskCard.style.transition =
      "height 0.35s ease, opacity 0.25s ease, margin 0.35s ease, padding 0.35s ease";

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        taskCard.style.height        = "0";
        taskCard.style.opacity       = "0";
        taskCard.style.marginTop     = "0";
        taskCard.style.marginBottom  = "0";
        taskCard.style.paddingTop    = "0";
        taskCard.style.paddingBottom = "0";
      });
    });

    setTimeout(() => {
      taskCard.remove();

      sendMessage({ action: "DELETE_NOTE", url, id: noteId }).then((siteData) => {
        const siteEmpty =
          !siteData?.important?.length &&
          !siteData?.medium?.length    &&
          !siteData?.normal?.length;

        if (siteEmpty || !notesWrap?.querySelector(".task-card")) {
          siteCard.classList.add("site-card-fade-out");
          setTimeout(() => { siteCard.remove(); checkEmpty(); }, 260);
        }
      });
    }, 380);
  });
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function checkEmpty() {
  if (!container.querySelector(".site-card")) {
    container.innerHTML =
      `<p class="empty-state">No notes saved yet. Start browsing and add some!</p>`;
  }
}

function renderDashboard(sites) {
  container.innerHTML = "";
  if (!sites.length) {
    container.innerHTML =
      `<p class="empty-state">No notes saved yet. Start browsing and add some!</p>`;
    return;
  }
  sites.forEach(({ url, data }) => container.appendChild(buildSiteCard(url, data)));
}

// ── Auto Backup Logic ─────────────────────────────────────────────────────────

import {
  BACKUP_INTERVALS,
  getBackupPrefs,
  saveBackupPrefs,
  clearBackupPrefs,
  scheduleAlarm,
  clearAlarm,
  runAutoBackup,
  formatDateTime,
  saveLastBackupTime,
  getLastBackupTime,
  saveNextBackupTime,
  getNextBackupTime,
  calcNextBackupTime,
} from "../utils/autoBackupExporter.js";

// ── DOM refs ──────────────────────────────────────────────────────────────────

const autoBackupContainer  = document.getElementById("autoBackupContainer");
const autoBackupToggle     = document.getElementById("autoBackupToggle");
const autoBackupHeader     = document.getElementById("autoBackupHeader");
const lastBackupPreview    = document.getElementById("lastBackupPreview");
const backupIntervalValue  = document.getElementById("backupIntervalValue");
const changeIntervalBtn    = document.getElementById("changeIntervalBtn");
const openDownloadSettings = document.getElementById("openDownloadSettings");
const lastBackupValue      = document.getElementById("lastBackupValue");
const nextBackupCountdown  = document.getElementById("nextBackupCountdown");

// ── Countdown timer ───────────────────────────────────────────────────────────
// Keeps a live hh:mm display ticking every second.
// nextBackupTarget is the absolute ms timestamp for the next backup.

let countdownInterval = null;
let nextBackupTarget  = null;   // ms — set by startCountdown() / resetCountdown()

function formatCountdown(msRemaining) {
  if (msRemaining <= 0) return "00:00:00";

  const totalSec = Math.floor(msRemaining / 1000);
  const hh       = Math.floor(totalSec / 3600);
  const mm        = Math.floor((totalSec % 3600) / 60);
  const ss = Math.floor(totalSec % 60);

  const pad = (n) => String(n).padStart(2, "0");

  return `${pad(hh)}:${pad(mm)}:${pad(ss)}`;
}

function tickCountdown() {
  if (nextBackupTarget === null) return;
  const remaining = nextBackupTarget - Date.now();
  nextBackupCountdown.textContent = formatCountdown(remaining);
}

function startCountdown(targetMs) {
  nextBackupTarget = targetMs;
  clearInterval(countdownInterval);
  tickCountdown();   // paint immediately — no 1-second blank
  countdownInterval = setInterval(tickCountdown, 1000);
}

function stopCountdown() {
  clearInterval(countdownInterval);
  countdownInterval          = null;
  nextBackupTarget           = null;
  nextBackupCountdown.textContent = "--:--:--";
}

// Called whenever lastBackupAt or intervalHours changes so the target
// is always recomputed from real data, not from a running offset.
function resetCountdown(lastBackupAt, intervalHours) {
  if (!lastBackupAt || !intervalHours) { stopCountdown(); return; }
  const target = calcNextBackupTime(lastBackupAt, intervalHours);
  saveNextBackupTime(target);
  startCountdown(target);
}

// ── Interval dropdown ─────────────────────────────────────────────────────────

let intervalDropdown = null;

function buildIntervalDropdown(currentHours, onSelect) {
  // Toggle: second click closes it
  if (intervalDropdown) {
    intervalDropdown.remove();
    intervalDropdown = null;
    return;
  }

  intervalDropdown = document.createElement("div");
  intervalDropdown.className = "interval-dropdown";

  BACKUP_INTERVALS.forEach(({ label, hours }) => {
    const option       = document.createElement("div");
    option.className   = "interval-option" + (hours === currentHours ? " selected" : "");
    option.textContent = label;
    option.addEventListener("click", (e) => {
      e.stopPropagation();
      onSelect(hours);
      intervalDropdown.remove();
      intervalDropdown = null;
    });
    intervalDropdown.appendChild(option);
  });

  // Attach to body with fixed positioning — escapes overflow:hidden on panel
  const rect = changeIntervalBtn.getBoundingClientRect();
  intervalDropdown.style.position = "fixed";
  intervalDropdown.style.top      = `${rect.bottom + 6}px`;
  intervalDropdown.style.left     = `${rect.left}px`;
  intervalDropdown.style.minWidth = `${rect.width + 80}px`;
  document.body.appendChild(intervalDropdown);

  // Close on any outside click
  const closeDropdown = (e) => {
    if (!intervalDropdown) return;
    if (!intervalDropdown.contains(e.target) && e.target !== changeIntervalBtn) {
      intervalDropdown.remove();
      intervalDropdown = null;
      document.removeEventListener("click", closeDropdown);
    }
  };
  setTimeout(() => document.addEventListener("click", closeDropdown), 0);
}

// ── UI helpers ────────────────────────────────────────────────────────────────

function getLabelForHours(hours) {
  return BACKUP_INTERVALS.find(i => i.hours === hours)?.label ?? `Every ${hours} hours`;
}

function updateStatusUI(prefs, lastBackupAt) {
  // lastBackupAt can come from prefs or from the standalone persistent key
  const ts      = prefs?.lastBackupAt ?? lastBackupAt ?? null;
  const timeStr = formatDateTime(ts);

  if (prefs) {
    backupIntervalValue.textContent = getLabelForHours(prefs.intervalHours);
  }
  lastBackupValue.textContent   = timeStr;
  lastBackupPreview.textContent = ts ? `Last: ${timeStr}` : "";
}

function expandPanel() {
  autoBackupContainer.classList.add("active");
}

function collapsePanel() {
  autoBackupContainer.classList.remove("active");
}

// ── Toggle ON ─────────────────────────────────────────────────────────────────

async function handleToggleOn() {
  // Build prefs — preserve existing intervalHours/lastBackupAt if present
  const existing = getBackupPrefs();
  const prefs = {
    enabled:       true,
    intervalHours: existing?.intervalHours ?? 6,
    lastBackupAt:  existing?.lastBackupAt  ?? null,
  };
  saveBackupPrefs(prefs);

  expandPanel();
  updateStatusUI(prefs);

  // Schedule recurring alarm
  try {
    await scheduleAlarm(prefs.intervalHours);
  } catch (err) {
    console.error("TheWebNote: alarm scheduling failed", err);
  }

  // Run first backup immediately, then start countdown from the fresh timestamp
  try {
    const updated = await runAutoBackup();
    updateStatusUI(updated);
    resetCountdown(updated.lastBackupAt, updated.intervalHours);
  } catch (err) {
    console.error("TheWebNote: first backup failed", err);
  }
}

// ── Toggle OFF ────────────────────────────────────────────────────────────────

async function handleToggleOff() {
  await clearAlarm();
  stopCountdown();
  // Persist enabled:false — NOT clearBackupPrefs() — so refresh knows it's off
  const existing = getBackupPrefs();
  saveBackupPrefs({
    ...(existing || { intervalHours: 6, lastBackupAt: null }),
    enabled: false,
  });
  collapsePanel();
}

// ── Interval change ───────────────────────────────────────────────────────────

async function handleIntervalChange(newHours) {
  const prefs = getBackupPrefs();
  if (!prefs) return;

  prefs.intervalHours = newHours;
  saveBackupPrefs(prefs);

  backupIntervalValue.textContent = getLabelForHours(newHours);

  // Recompute countdown from last backup + new interval
  const lastTs = prefs.lastBackupAt ?? (await getLastBackupTime());
  resetCountdown(lastTs, newHours);

  try {
    await scheduleAlarm(newHours);
  } catch (err) {
    console.error("TheWebNote: reschedule failed", err);
  }
}

// ── Event wiring ──────────────────────────────────────────────────────────────

// Stop toggle clicks bubbling to the header click handler
autoBackupToggle.addEventListener("click", (e) => e.stopPropagation());

// Whole header row is clickable to expand/collapse
autoBackupHeader.addEventListener("click", () => {
  if (autoBackupContainer.classList.contains("active")) {
    collapsePanel();
  } else {
    expandPanel();
  }
});

// Toggle change fires handleToggleOn / handleToggleOff
autoBackupToggle.addEventListener("change", async () => {
  if (autoBackupToggle.checked) {
    await handleToggleOn();
  } else {
    await handleToggleOff();
  }
});

// Change button — stop propagation so it doesn't trigger header collapse
changeIntervalBtn.addEventListener("click", (e) => {
  e.stopPropagation();
  const prefs   = getBackupPrefs();
  const current = prefs?.intervalHours ?? 6;
  buildIntervalDropdown(current, handleIntervalChange);
});

openDownloadSettings.addEventListener("click", () => {
  chrome.tabs.create({ url: "chrome://settings/downloads" });
});

// ── Init ──────────────────────────────────────────────────────────────────────

function initAutoBackupPanel() {
  const prefs = getBackupPrefs();   // sync localStorage read

  if (prefs?.enabled === true) {
    autoBackupToggle.checked = true;
    updateStatusUI(prefs);
  } else {
    autoBackupToggle.checked = false;
    getLastBackupTime().then((ts) => updateStatusUI(null, ts));
  }
  collapsePanel();   // always start collapsed

  // Async: restore countdown + check for overdue backup
  if (prefs?.enabled === true) {
    (async () => {
      const lastTs = await getLastBackupTime();
      const nextTs = await getNextBackupTime();
      const now    = Date.now();

      // Refresh last-backup display with most accurate timestamp
      if (lastTs && (!prefs.lastBackupAt || lastTs > prefs.lastBackupAt)) {
        updateStatusUI(prefs, lastTs);
      }

      const effectiveLast     = lastTs ?? prefs.lastBackupAt ?? null;
      const intervalMs        = prefs.intervalHours * 60 * 60 * 1000;
      const overdueThresholdMs = effectiveLast ? effectiveLast + intervalMs : null;

      if (overdueThresholdMs && now >= overdueThresholdMs) {
        // Chrome was closed and missed a scheduled backup — run immediately
        console.info("TheWebNote: overdue backup detected, running now.");
        try {
          const updated = await runAutoBackup();
          updateStatusUI(updated);
          resetCountdown(updated.lastBackupAt, updated.intervalHours);
          await scheduleAlarm(updated.intervalHours);
        } catch (err) {
          console.error("TheWebNote: overdue backup failed", err);
          // Even if it failed, restore countdown from stored nextTs so UI isn't blank
          if (nextTs) startCountdown(nextTs);
        }
      } else {
        // Not overdue — restore countdown from stored nextBackupAt, or recompute
        const target = nextTs ?? (effectiveLast ? calcNextBackupTime(effectiveLast, prefs.intervalHours) : null);
        if (target) startCountdown(target);
      }
    })();
  }
}

// ── Collapse panel on outside click (Fix 2) ───────────────────────────────────

document.addEventListener("click", (e) => {
  if (
    autoBackupContainer.classList.contains("active") &&
    !autoBackupContainer.contains(e.target)
  ) {
    collapsePanel();
    // Also close the interval dropdown if open
    if (intervalDropdown) {
      intervalDropdown.remove();
      intervalDropdown = null;
    }
  }
});

// ── Listen for backup completion broadcast from background ────────────────────
// When a silent alarm-tab finishes a backup, background.js sends this message
// to all open dashboard tabs so the countdown and last-backup row update live
// without the user needing to reload.

chrome.runtime.onMessage.addListener((msg) => {
  if (msg.action !== "BACKUP_COMPLETED") return;
  const prefs = getBackupPrefs();
  // Update stored lastBackupAt so next resetCountdown() call is accurate
  if (prefs) {
    const updated = { ...prefs, lastBackupAt: msg.lastBackupAt };
    saveBackupPrefs(updated);
    updateStatusUI(updated);
  } else {
    updateStatusUI(null, msg.lastBackupAt);
  }
  // Reset the live countdown to the new next-backup target
  startCountdown(msg.nextBackupAt);
});

// ── Silent run (?autobackup=1 from alarm) ─────────────────────────────────────

async function handleSilentAutoBackup() {
  try {
    // Seed localStorage from chrome.storage.local — fresh tab has empty localStorage.
    await new Promise((resolve) => {
      chrome.storage.local.get("webnoteAutoBackup", (result) => {
        const prefs = result["webnoteAutoBackup"];
        if (prefs) {
          localStorage.setItem("webnote-auto-backup-prefs", JSON.stringify(prefs));
        }
        resolve();
      });
    });

    const prefs = getBackupPrefs();
    if (!prefs?.enabled) return;

    // Run the backup — this also saves timestamps and broadcasts BACKUP_COMPLETED
    const updated = await runAutoBackup();

    // Re-schedule the alarm so the loop continues reliably.
    // Chrome's periodic alarm should already do this, but re-creating it here
    // ensures the interval is always fresh from the latest saved prefs and
    // recovers from any edge case where the alarm was cleared.
    await scheduleAlarm(updated.intervalHours);

  } catch (err) {
    console.error("TheWebNote: silent backup failed", err);
  } finally {
    setTimeout(() => window.close(), 5000);
  }
}

// ── Init ──────────────────────────────────────────────────────────────────────

initTheme();
initImageViewer();
initExportModal();

const isSilentBackup = new URLSearchParams(window.location.search).has("autobackup");

if (isSilentBackup) {
  handleSilentAutoBackup();
} else {
  initAutoBackupPanel();   // sync — runs immediately, no race conditions

  (async () => {
    try {
      setupDeleteHandler();
      const sites = await sendMessage({ action: "GET_ALL" });
      renderDashboard(sites);
    } catch (err) {
      console.error("Dashboard error:", err);
      container.innerHTML = `<p class="empty-state">Failed to load notes.</p>`;
    }
  })();
}