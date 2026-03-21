// ── utils/helpers.js ──────────────────────────────────────────────────────────
// Shared pure helpers used by inputProcess, editHandler, and noteService.

// /**
//  * Extracts priority and clean note text from a raw input string.
//  *
//  * Rules (same as original inputProcess logic):
//  *   last 4 chars === "#IMP"  →  priority: "important", text = input minus last 4 chars
//  *   last 4 chars === "#MED"  →  priority: "medium",    text = input minus last 4 chars
//  *   anything else            →  priority: "normal",    text = full input
//  *
//  * @param {string} raw - trimmed input string
//  * @returns {{ noteText: string, priority: "important"|"medium"|"normal" }}
//  */
export function extractPriorityFromText(raw) {
  if (!raw) return { noteText: "", priority: "normal" };

  const tag = raw.slice(-4).toUpperCase();

  if (tag === "#IMP") {
    return { noteText: raw.slice(0, -4), priority: "important" };
  }
  if (tag === "#MED") {
    return { noteText: raw.slice(0, -4), priority: "medium" };
  }

  return { noteText: raw, priority: "normal" };
}

// /**
//  * Converts a File object to a base64 data-URL string.
//  *
//  * @param {File} file
//  * @returns {Promise<string>} base64 data-URL
//  */
export function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload  = () => resolve(reader.result);
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
}