import { getFilename, getImageFilename } from "./exportHelpers.js";

// ── Priority styles ───────────────────────────────────────────────────────────
function getPriorityStyle(priority) {
  if (priority === "important") return {
    cellBg:    "FEF2F2",
    fontColor: "991B1B",
    badgeBg:   "EF4444",
  };
  if (priority === "medium") return {
    cellBg:    "FEFCE8",
    fontColor: "854D0E",
    badgeBg:   "EAB308",
  };
  return {
    cellBg:    "FFFFFF",
    fontColor: "475569",
    badgeBg:   "64748B",
  };
}

// ── Border helper ─────────────────────────────────────────────────────────────
const thinBorder = {
  top:    { style: "thin", color: { argb: "FFE2E8F0" } },
  bottom: { style: "thin", color: { argb: "FFE2E8F0" } },
  left:   { style: "thin", color: { argb: "FFE2E8F0" } },
  right:  { style: "thin", color: { argb: "FFE2E8F0" } },
};

export async function generateXLSX(filteredData, selectedSites) {
  const wb = new ExcelJS.Workbook();

  wb.creator  = "TheWebNote";
  wb.created  = new Date();

  filteredData.forEach(({ url, data }) => {
    // Sheet name max 31 chars
    const sheetName = url.length > 31 ? url.slice(0, 31) : url;
    const ws        = wb.addWorksheet(sheetName);

    // ── Column definitions ──────────────────────────────────────────────────
    ws.columns = [
      { header: "Priority",   key: "priority",  width: 14 },
      { header: "Note",       key: "note",       width: 52 },
      { header: "Date",       key: "date",       width: 24 },
      { header: "Image File", key: "image_file", width: 36 },
    ];

    // ── Style header row ────────────────────────────────────────────────────
    const headerRow = ws.getRow(1);
    headerRow.height = 22;
    headerRow.eachCell((cell) => {
      cell.fill = {
        type:    "pattern",
        pattern: "solid",
        fgColor: { argb: "FF3B82F6" },
      };
      cell.font = {
        color: { argb: "FFFFFFFF" },
        bold:  true,
        size:  12,
        name:  "Segoe UI",
      };
      cell.alignment = {
        vertical:   "middle",
        horizontal: "center",
        wrapText:   false,
      };
      cell.border = thinBorder;
    });

    // ── Add note rows ───────────────────────────────────────────────────────
    ["important", "medium", "normal"].forEach((priority) => {
      let cardNumber  = 1;
      const styles    = getPriorityStyle(priority);

      (data[priority] || []).forEach((note) => {
        let imageFile = "N/A";
        if (note.img) {
          imageFile = getImageFilename(url, priority, cardNumber);
          cardNumber++;
        }

        const row = ws.addRow({
          priority:   priority.toUpperCase(),
          note:       note.note?.trim() || "N/A",
          date:       note.createdAt,
          image_file: imageFile,
        });

        row.height = 30;

        // Priority cell — badge style
        const priorityCell = row.getCell("priority");
        priorityCell.fill = {
          type:    "pattern",
          pattern: "solid",
          fgColor: { argb: `FF${styles.badgeBg}` },
        };
        priorityCell.font = {
          color: { argb: "FFFFFFFF" },
          bold:  true,
          size:  11,
          name:  "Segoe UI",
        };
        priorityCell.alignment = {
          vertical:   "middle",
          horizontal: "center",
        };
        priorityCell.border = thinBorder;

        // Note cell
        const noteCell = row.getCell("note");
        noteCell.fill = {
          type:    "pattern",
          pattern: "solid",
          fgColor: { argb: `FF${styles.cellBg}` },
        };
        noteCell.font = {
          color: { argb: `FF${styles.fontColor}` },
          size:  11,
          name:  "Segoe UI",
        };
        noteCell.alignment = {
          vertical: "middle",
          wrapText: true,
        };
        noteCell.border = thinBorder;

        // Date cell
        const dateCell = row.getCell("date");
        dateCell.fill = {
          type:    "pattern",
          pattern: "solid",
          fgColor: { argb: `FF${styles.cellBg}` },
        };
        dateCell.font = {
          color: { argb: "FF94A3B8" },
          size:  10,
          name:  "Segoe UI",
        };
        dateCell.alignment = {
          vertical:   "middle",
          horizontal: "center",
        };
        dateCell.border = thinBorder;

        // Image file cell
        const imageCell = row.getCell("image_file");
        imageCell.fill = {
          type:    "pattern",
          pattern: "solid",
          fgColor: { argb: `FF${styles.cellBg}` },
        };
        imageCell.font = {
          color: { argb: imageFile === "N/A" ? "FF94A3B8" : "FF3B82F6" },
          size:  10,
          name:  "Segoe UI",
        };
        imageCell.alignment = {
          vertical:   "middle",
          horizontal: "center",
        };
        imageCell.border = thinBorder;
      });
    });

    // ── Freeze header row ───────────────────────────────────────────────────
    ws.views = [{ state: "frozen", ySplit: 1 }];
  });

  // ── Download ──────────────────────────────────────────────────────────────
  const filename = getFilename(selectedSites, "xlsx");
  const buffer   = await wb.xlsx.writeBuffer();
  const blob     = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const url = URL.createObjectURL(blob);

  chrome.downloads.download({
    url,
    filename: `TheWebNote-Exports/${filename}`,
    saveAs:   false,
  }, () => URL.revokeObjectURL(url));
}