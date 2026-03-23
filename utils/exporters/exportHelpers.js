export const ZIP_README = `TheWebNote Export — README
==========================
Exported on: ${new Date().toLocaleDateString()}

FILES IN THIS EXPORT
--------------------
- export-{name}.json        → Complete backup. Use this to import your notes back.
- export-{name}.md          → Human readable Markdown. For Obsidian, Notion, etc.
- export-{name}.html        → Self contained file. Opens in any browser.
- export-{name}.csv         → Opens in Excel or Google Sheets.
- export-{name}.txt         → Plain text archive.
- export-{name}-images.zip  → All images referenced in the above files. Only present if your notes contain images.
- export-{name}.pdf         → Printable archive.

Note: Only the files you selected during export will be present.

IMPORTING YOUR NOTES
--------------------
Only the JSON file supports import back into TheWebNote.

To import:
1. Open TheWebNote dashboard
2. Click the Import button
3. Select your .json export file
4. Choose how to handle duplicates if prompted

The JSON file contains everything — note text, images, priority,
and dates. All other formats are for reading and archiving only.

IMAGE REFERENCES
----------------
If your notes contain images, they are saved in export-{name}-images.zip.
The image filename format is: {hostname}-{priority}-{cardNumber}.jpg
These filenames are referenced inside the .md, .csv, and .txt files.

ABOUT THEWEBNOTE
----------------
TheWebNote is a Chrome extension that lets you save notes on any website.
All data is stored locally on your device — nothing is sent to any server.
GitHub: https://github.com/darshdcoding
`;

export function getFilename(selectedSites, format) {
  const prefix = selectedSites.length === 1
    ? selectedSites[0]
    : new Date().toISOString().slice(0, 10);
  return `export-${prefix}.${format}`;
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

export function getPrefix(selectedSites) {
  return selectedSites.length === 1
    ? selectedSites[0]
    : new Date().toISOString().slice(0, 10);
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