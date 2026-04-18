// Single source of truth for values shared across the entire extension.

// Ordered priority levels — important first, normal last.

// background.js (service worker) cannot import ES modules so it maintains
// its own inline copy; any change here must be mirrored there.

export const PRIORITIES = ["important", "medium", "normal"];

// Priority display colors — used by content.js toggle pill.
export const PRIORITY_COLORS = [
  { key: "important", color: "#ef4444" },
  { key: "medium",    color: "#eab308" },
  { key: "normal",    color: "#64748b" },
];

// Blank per-site data shape — use as a default / fallback value.
// Spread or clone before mutating: { ...EMPTY_SITE_DATA } or structuredClone().
export const EMPTY_SITE_DATA = { important: [], medium: [], normal: [] };

// Maximum number of notes allowed in a single backup file.
export const MAX_NOTES = 1000;