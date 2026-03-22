// ── utils/exporter.js ─────────────────────────────────────────────────────────
import { generateJSON } from "./exporters/exportJSON.js";
import { generateMD }   from "./exporters/exportMD.js";
import { generateHTML } from "./exporters/exportHTML.js";
import { generateCSV }  from "./exporters/exportCSV.js";
import { generateTXT }  from "./exporters/exportTXT.js";
import { generatePDF }  from "./exporters/exportPDF.js";
import { downloadFile, getJSONFilename, ZIP_README } from "./exporters/exportHelpers.js";

function sendMessage(msg) {
  return new Promise((resolve) => chrome.runtime.sendMessage(msg, resolve));
}

export async function runExport(selectedSites, selectedFormats) {
  const allSites     = await sendMessage({ action: "GET_ALL" });
  const filteredData = allSites.filter(({ url }) => selectedSites.includes(url));

  // JSON always first
  generateJSON(filteredData, selectedSites);

  const generators = {
    md:   (data) => generateMD(data, selectedSites),
    html: (data) => generateHTML(data, selectedSites),
    csv:  (data) => generateCSV(data, selectedSites),
    txt:  (data) => generateTXT(data, selectedSites),
    pdf:  (data) => generatePDF(data, selectedSites),
  };

  for (const format of selectedFormats) {
    await new Promise((resolve) => setTimeout(resolve, 400));
    await generators[format]?.(filteredData);
  }

  // Single shared README for all exports
  await new Promise((resolve) => setTimeout(resolve, 400));
  downloadFile("README.txt", ZIP_README, "text/plain");
}