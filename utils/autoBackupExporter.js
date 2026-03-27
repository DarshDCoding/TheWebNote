// ── utils/autoBackupExporter.js ───────────────────────────────────────────────

import { buildPayload } from "./buildPayload.js";
import { sendMessage } from "./messaging.js";

const ALARM_NAME = "webnote-auto-backup";
const FOLDER_NAME = "TheWebNote-Backup";
const LS_KEY = "webnote-auto-backup-prefs"; // localStorage key
const CS_KEY = "webnoteAutoBackup"; // chrome.storage.local key

// ── Intervals ─────────────────────────────────────────────────────────────────

export const BACKUP_INTERVALS = [
  { label: "Every 3 hours", hours: 3 },
  { label: "Every 6 hours", hours: 6 },
  { label: "Every 9 hours", hours: 9 },
  { label: "Every 12 hours", hours: 12 },
  { label: "Every 24 hours", hours: 24 },
];

// ── Storage ───────────────────────────────────────────────────────────────────

export function getBackupPrefs() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveBackupPrefs(prefs) {
  // 1. localStorage — instant, synchronous, used by dashboard UI
  localStorage.setItem(LS_KEY, JSON.stringify(prefs));
  // 2. chrome.storage.local — async mirror for background service worker
  chrome.storage.local.set({ [CS_KEY]: prefs });
}

export function clearBackupPrefs() {
  localStorage.removeItem(LS_KEY);
  chrome.storage.local.remove(CS_KEY);
}

// ── Alarm helpers ─────────────────────────────────────────────────────────────

export function scheduleAlarm(intervalHours) {
  return new Promise((resolve) => {
    chrome.alarms.clear(ALARM_NAME, () => {
      chrome.alarms.create(ALARM_NAME, {
        delayInMinutes: intervalHours * 60,
        periodInMinutes: intervalHours * 60,
      });
      resolve();
    });
  });
}

export function clearAlarm() {
  return new Promise((resolve) => chrome.alarms.clear(ALARM_NAME, resolve));
}

// ── Backup helpers ────────────────────────────────────────────────────────────

function buildTimestamp(date = new Date()) {
  const pad = (n) => String(n).padStart(2, "0");

  let hours = date.getHours();
  const minutes = pad(date.getMinutes());

  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12 || 12;

  return [
    date.getFullYear(),
    pad(date.getMonth() + 1),
    pad(date.getDate()),
    `${pad(hours)}-${minutes}-${ampm}`,
  ].join("-");
}

function downloadBackupFile(jsonContent) {
  return new Promise((resolve, reject) => {
    let objectUrl;
    try {
      const blob = new Blob([jsonContent], { type: "application/json" });
      objectUrl = URL.createObjectURL(blob);
    } catch (err) {
      return reject(new Error("Blob creation failed: " + err.message));
    }

    const filename = `TheWebNote-backup-${buildTimestamp()}.json`;

    chrome.downloads.download(
      {
        url: objectUrl,
        filename: `${FOLDER_NAME}/${filename}`,
        saveAs: false,
      },
      (downloadId) => {
        // Delay revoke — Chrome needs time to read the blob URL before it's gone
        setTimeout(() => URL.revokeObjectURL(objectUrl), 10000);

        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
        } else if (downloadId === undefined) {
          reject(new Error("Download failed — no downloadId returned"));
        } else {
          resolve(downloadId);
        }
      },
    );
  });
}

// ── Main backup runner ────────────────────────────────────────────────────────

export async function runAutoBackup() {
  const allSites = await sendMessage({ action: "GET_ALL" });
  const jsonContent = buildPayload(allSites, "auto");

  await downloadBackupFile(jsonContent);

  // from chrome.storage.local before calling runAutoBackup().
  const prefs = getBackupPrefs();
  if (!prefs)
    return { enabled: false, intervalHours: 6, lastBackupAt: Date.now() };
  const updatedPrefs = { ...prefs, lastBackupAt: Date.now() };
  saveBackupPrefs(updatedPrefs);

  // Persist both timestamps independently so they survive toggle on/off
  saveLastBackupTime(updatedPrefs.lastBackupAt);
  saveNextBackupTime(
    calcNextBackupTime(updatedPrefs.lastBackupAt, updatedPrefs.intervalHours),
  );

  return updatedPrefs;
}

// ── Formatting ────────────────────────────────────────────────────────────────

export function formatDateTime(ts) {
  if (!ts) return "Never";
  return new Date(ts).toLocaleString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

// ── Persistent timestamps (chrome.storage.local, survive toggle on/off) ───────
const CS_LAST_BACKUP_KEY = "webnoteLastBackupAt";
const CS_NEXT_BACKUP_KEY = "webnoteNextBackupAt";

export function saveLastBackupTime(ts) {
  chrome.storage.local.set({ [CS_LAST_BACKUP_KEY]: ts });
}

export function getLastBackupTime() {
  return new Promise((resolve) => {
    chrome.storage.local.get(CS_LAST_BACKUP_KEY, (result) => {
      resolve(result[CS_LAST_BACKUP_KEY] ?? null);
    });
  });
}

export function saveNextBackupTime(ts) {
  chrome.storage.local.set({ [CS_NEXT_BACKUP_KEY]: ts });
}

export function getNextBackupTime() {
  return new Promise((resolve) => {
    chrome.storage.local.get(CS_NEXT_BACKUP_KEY, (result) => {
      resolve(result[CS_NEXT_BACKUP_KEY] ?? null);
    });
  });
}

// Compute nextBackupAt from lastBackupAt + selected interval
export function calcNextBackupTime(lastBackupAt, intervalHours) {
  return lastBackupAt + intervalHours * 60 * 60 * 1000;
}