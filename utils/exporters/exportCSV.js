import { downloadFile, getFilename, getImageFilename } from "./exportHelpers.js";
import { PRIORITIES } from "../constants.js";

export function generateCSV(filteredData, selectedSites) {
  const filename = getFilename(selectedSites, "csv");
  const rows     = [["site", "priority", "note", "createdAt", "image_file"]];

  filteredData.forEach(({ url, data }) => {
    PRIORITIES.forEach((priority) => {
      let cardNumber = 1;
      (data[priority] || []).forEach((note) => {
        let imageFile = "N/A";

        if (note.img) {
          imageFile = getImageFilename(url, priority, cardNumber);
          cardNumber++;
        }

        rows.push([
          url,
          priority,
          `"${(note.note?.trim() || "N/A").replace(/"/g, '""')}"`,
          note.createdAt,
          imageFile,
        ]);
      });
    });
  });

  const csv = rows.map((r) => r.join(",")).join("\n");
  downloadFile(filename, csv, "text/csv");
}