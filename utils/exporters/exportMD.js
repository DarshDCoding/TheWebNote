import { downloadFile, getFilename, getImageFilename } from "./exportHelpers.js";
import { PRIORITIES } from "../constants.js";

export function generateMD(filteredData, selectedSites) {
  const filename = getFilename(selectedSites, "md");
  let md         = `# TheWebNote Export\n\n`;

  filteredData.forEach(({ url, data }) => {
    md += `## ${url}\n\n`;
    PRIORITIES.forEach((priority) => {
      let cardNumber = 1;
      (data[priority] || []).forEach((note) => {
        const noteText = note.note?.trim() || "N/A";
        md += `- **[${priority.toUpperCase()}]** ${noteText}`;

        if (note.img) {
          const imgFilename = getImageFilename(url, priority, cardNumber);
          md += ` *(image: ${imgFilename})*`;
          cardNumber++;
        }

        md += ` — ${note.createdAt}\n`;
      });
    });
    md += "\n";
  });

  downloadFile(filename, md, "text/markdown");
}