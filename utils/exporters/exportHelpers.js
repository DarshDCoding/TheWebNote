// ── utils/exporters/exportHelpers.js ─────────────────────────────────────────
// Shared helpers used by all format generators.

export const ZIP_README = `TheWebNote Export — README
==========================

Images are stored in the images/ folder and referenced by name in the data file.

TO RESTORE YOUR NOTES:
Use the JSON export file (.json) — it contains everything including images.
ZIP files are for reading and archiving only, not for import.

Image filename format: {hostname}-{priority}-{cardNumber}.jpg
`;

export function getFilename(selectedSites, format) {
  const prefix = selectedSites.length === 1
    ? selectedSites[0]
    : new Date().toISOString().slice(0, 10);
  const ext = ["md", "csv", "txt"].includes(format) ? "zip" : format;
  return `export-${prefix}-${format}.${ext}`;
}

export function getJSONFilename(selectedSites) {
  const prefix = selectedSites.length === 1
    ? selectedSites[0]
    : new Date().toISOString().slice(0, 10);
  return `export-${prefix}.json`;
}

export function getImageFilename(url, priority, cardNumber) {
  return `${url}-${priority}-${cardNumber}.jpg`;
}

export function base64ToBlob(base64) {
  const parts   = base64.split(",");
  const byteStr = atob(parts[1]);
  const mime    = parts[0].split(":")[1].split(";")[0];
  const ab      = new ArrayBuffer(byteStr.length);
  const ia      = new Uint8Array(ab);
  for (let i = 0; i < byteStr.length; i++) ia[i] = byteStr.charCodeAt(i);
  return new Blob([ab], { type: mime });
}

export function downloadFile(filename, content, mimeType) {
  const blob = new Blob([content], { type: mimeType });
  const url  = URL.createObjectURL(blob);
  chrome.downloads.download({
    url,
    filename: `TheWebNote-Exports/${filename}`,
    saveAs:   false,
  }, () => URL.revokeObjectURL(url));
}

export async function downloadZip(filename, zip) {
  const blob = await zip.generateAsync({ type: "blob" });
  const url  = URL.createObjectURL(blob);
  chrome.downloads.download({
    url,
    filename: `TheWebNote-Exports/${filename}`,
    saveAs:   false,
  }, () => URL.revokeObjectURL(url));
}