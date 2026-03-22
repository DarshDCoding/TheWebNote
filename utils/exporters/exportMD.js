// ── utils/exporters/exportMD.js ───────────────────────────────────────────────
import { downloadZip, getFilename, getImageFilename, base64ToBlob } from "./exportHelpers.js";

export async function generateMD(filteredData, selectedSites) {
  const zip       = new JSZip();
  const imgFolder = zip.folder("images");
  const filename  = getFilename(selectedSites, "md");
  let md          = `# TheWebNote Export\n\n`;

  filteredData.forEach(({ url, data }) => {
    md += `## ${url}\n\n`;
    ["important", "medium", "normal"].forEach((priority) => {
      let cardNumber = 1;
      (data[priority] || []).forEach((note) => {
        const noteText = note.note || "N/A";
        md += `- **[${priority.toUpperCase()}]** ${noteText}`;

        if (note.img) {
          const imgFilename = getImageFilename(url, priority, cardNumber);
          md += ` *(image: ${imgFilename})*`;
          imgFolder.file(imgFilename, base64ToBlob(note.img));
          cardNumber++;
        }

        md += ` — ${note.createdAt}\n`;
      });
    });
    md += "\n";
  });

  const prefix = selectedSites.length === 1 ? selectedSites[0] : new Date().toISOString().slice(0, 10);
  zip.file(`export-${prefix}.md`, md);
  await downloadZip(filename, zip);
}