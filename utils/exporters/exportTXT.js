import { downloadFile, getFilename, getImageFilename } from "./exportHelpers.js";

export function generateTXT(filteredData, selectedSites) {
  const filename = getFilename(selectedSites, "txt");
  let txt        = `TheWebNote Export\n${"=".repeat(40)}\n\n`;

  filteredData.forEach(({ url, data }) => {
    txt += `${url}\n${"-".repeat(40)}\n\n`;
    ["important", "medium", "normal"].forEach((priority) => {
      let cardNumber = 1;
      (data[priority] || []).forEach((note) => {
        txt += `[${priority.toUpperCase()}]\n`;
        txt += `Note:  ${note.note?.trim() || "N/A"}\n`;

        if (note.img) {
          const imgFilename = getImageFilename(url, priority, cardNumber);
          txt += `Image: ${imgFilename}\n`;
          cardNumber++;
        } else {
          txt += `Image: N/A\n`;
        }

        txt += `Date:  ${note.createdAt}\n\n`;
      });
    });
    txt += "\n";
  });

  downloadFile(filename, txt, "text/plain");
}