// ── utils/exporter.js ─────────────────────────────────────────────────────────
import { generateJSON } from "./exporters/exportJSON.js";
import { generateMD }   from "./exporters/exportMD.js";
import { generateHTML } from "./exporters/exportHTML.js";
import { generateCSV }  from "./exporters/exportCSV.js";
import { generateTXT }  from "./exporters/exportTXT.js";
import { generatePDF }  from "./exporters/exportPDF.js";
import {
  downloadFile,
  downloadZip,
  getPrefix,
  getImageFilename,
  base64ToBlob,
  ZIP_README,
} from "./exporters/exportHelpers.js";
import { sendMessage } from "./messaging.js";

// ── Generate shared images ZIP ────────────────────────────────────────────────
async function generateImages(filteredData, selectedSites) {
  const zip       = new JSZip();
  let   hasImages = false;

  filteredData.forEach(({ url, data }) => {
    ["important", "medium", "normal"].forEach((priority) => {
      let cardNumber = 1;
      (data[priority] || []).forEach((note) => {
        if (note.img) {
          const imgFilename = getImageFilename(url, priority, cardNumber);
          zip.file(imgFilename, base64ToBlob(note.img));
          hasImages = true;
          cardNumber++;
        }
      });
    });
  });

  if (!hasImages) return;

  const prefix = getPrefix(selectedSites);
  await downloadZip(`export-${prefix}-images.zip`, zip);
}

// ── Main export runner ────────────────────────────────────────────────────────
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

  // Shared images ZIP — only if any format that references images was selected
  const imageFormats = ["md", "csv", "txt"];
  const needsImages  = selectedFormats.some(f => imageFormats.includes(f));
  if (needsImages) {
    await new Promise((resolve) => setTimeout(resolve, 400));
    await generateImages(filteredData, selectedSites);
  }

  // Shared README
  await new Promise((resolve) => setTimeout(resolve, 400));
  downloadFile("Instructions.txt", ZIP_README, "text/plain");
}