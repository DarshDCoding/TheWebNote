// ── utils/exporters/exportCSV.js ──────────────────────────────────────────────
import { downloadZip, getFilename, getImageFilename, base64ToBlob } from "./exportHelpers.js";

export async function generateCSV(filteredData, selectedSites) {
  const zip       = new JSZip();
  const imgFolder = zip.folder("images");
  const filename  = getFilename(selectedSites, "csv");
  const rows      = [["site", "priority", "note", "createdAt", "image_file"]];

  filteredData.forEach(({ url, data }) => {
    ["important", "medium", "normal"].forEach((priority) => {
      let cardNumber = 1;
      (data[priority] || []).forEach((note) => {
        let imageFile = "N/A";

        if (note.img) {
          imageFile = getImageFilename(url, priority, cardNumber);
          imgFolder.file(imageFile, base64ToBlob(note.img));
          cardNumber++;
        }

        rows.push([
          url,
          priority,
          `"${(note.note || "N/A").replace(/"/g, '""')}"`,
          note.createdAt,
          imageFile,
        ]);
      });
    });
  });

  const csv    = rows.map((r) => r.join(",")).join("\n");
  const prefix = selectedSites.length === 1 ? selectedSites[0] : new Date().toISOString().slice(0, 10);
  zip.file(`export-${prefix}.csv`, csv);
  await downloadZip(filename, zip);
}