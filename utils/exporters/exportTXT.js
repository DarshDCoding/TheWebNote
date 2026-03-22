// ── utils/exporters/exportTXT.js ──────────────────────────────────────────────
import { downloadZip, getFilename, getImageFilename, base64ToBlob } from "./exportHelpers.js";

export async function generateTXT(filteredData, selectedSites) {
  const zip       = new JSZip();
  const imgFolder = zip.folder("images");
  const filename  = getFilename(selectedSites, "txt");
  let txt         = `TheWebNote Export\n${"=".repeat(40)}\n\n`;

  filteredData.forEach(({ url, data }) => {
    txt += `${url}\n${"-".repeat(40)}\n`;
    ["important", "medium", "normal"].forEach((priority) => {
      let cardNumber = 1;
      (data[priority] || []).forEach((note) => {
        const noteText = note.note || "N/A";
        txt += `[${priority.toUpperCase()}] ${noteText}`;

        if (note.img) {
          const imgFilename = getImageFilename(url, priority, cardNumber);
          txt += ` (image: ${imgFilename})`;
          imgFolder.file(imgFilename, base64ToBlob(note.img));
          cardNumber++;
        }

        txt += `\n${note.createdAt}\n\n`;
      });
    });
  });

  const prefix = selectedSites.length === 1 ? selectedSites[0] : new Date().toISOString().slice(0, 10);
  zip.file(`export-${prefix}.txt`, txt);
  await downloadZip(filename, zip);
}