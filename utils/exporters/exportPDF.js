import { getFilename } from "./exportHelpers.js";
import { PRIORITIES } from "../constants.js";

// ── Fetch extension logo as base64 ───────────────────────────────────────────
async function getLogoBase64() {
  const url      = chrome.runtime.getURL("assets/icons/icon128.png");
  const response = await fetch(url);
  const blob     = await response.blob();
  return new Promise((resolve) => {
    const reader  = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.readAsDataURL(blob);
  });
}

// ── Normalize image orientation via canvas (fixes EXIF rotation) ──────────────
function normalizeImage(base64) {
  return new Promise((resolve) => {
    const img  = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width  = img.naturalWidth;
      canvas.height = img.naturalHeight;
      canvas.getContext("2d").drawImage(img, 0, 0);
      resolve(canvas.toDataURL("image/jpeg", 0.92));
    };
    img.src = base64;
  });
}

// ── Get image natural dimensions ──────────────────────────────────────────────
function getImageDimensions(base64) {
  return new Promise((resolve) => {
    const img  = new Image();
    img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
    img.src    = base64;
  });
}

// ── Priority colors ───────────────────────────────────────────────────────────
function getPriorityColors(priority) {
  if (priority === "important") return {
    border: [239, 68, 68], bg: [254, 242, 242], badge: [239, 68, 68], text: [153, 27, 27],
  };
  if (priority === "medium") return {
    border: [234, 179, 8], bg: [254, 252, 232], badge: [234, 179, 8], text: [133, 77, 14],
  };
  return {
    border: [226, 232, 240], bg: [255, 255, 255], badge: [100, 116, 139], text: [71, 85, 105],
  };
}

// ── Page constants ────────────────────────────────────────────────────────────
const PAGE_W       = 210;
const PAGE_H       = 297;
const MARGIN       = 10;
const CONTENT_W    = PAGE_W - MARGIN * 2;
const HEADER_H     = 24;
const FOOTER_H     = 14;
const CARD_PADDING = 5;
const BADGE_H      = 7;
const COL_GAP      = 4;
const COL_W        = (CONTENT_W - COL_GAP) / 2;
const LINE_H       = 6;
const IMG_MAX_H    = 60;

// ── Draw header ───────────────────────────────────────────────────────────────
function drawHeader(doc, logoBase64) {
  doc.setFillColor(59, 130, 246);
  doc.rect(0, 0, PAGE_W, HEADER_H, "F");
  doc.addImage(logoBase64, "PNG", MARGIN, 4, 16, 16);
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text("TheWebNote", MARGIN + 20, 16);
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text("Notes Export", PAGE_W - MARGIN, 16, { align: "right" });
  doc.setTextColor(30, 41, 59);
}

// ── Draw footer ───────────────────────────────────────────────────────────────
function drawFooter(doc, pageNum, totalPages) {
  const y = PAGE_H - FOOTER_H;
  doc.setFillColor(248, 250, 252);
  doc.rect(0, y, PAGE_W, FOOTER_H, "F");
  doc.setDrawColor(226, 232, 240);
  doc.line(0, y, PAGE_W, y);

  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184);
  doc.setFont("helvetica", "normal");
  doc.text(
    `Exported on ${new Date().toLocaleDateString()}`,
    MARGIN, PAGE_H - 5
  );
  doc.text(
    `Page ${pageNum} of ${totalPages}`,
    PAGE_W / 2, PAGE_H - 5,
    { align: "center" }
  );

  doc.setFontSize(12);
  doc.setTextColor(59, 130, 246);
  const powered = "Powered by DarshDCoding";
  const pw      = doc.getTextWidth(powered);
  doc.text(powered, PAGE_W - MARGIN, PAGE_H - 5, { align: "right" });
  doc.link(PAGE_W - MARGIN - pw, PAGE_H - 10, pw, 6, {
    url: "https://github.com/darshdcoding",
  });
}

// ── Draw site heading ─────────────────────────────────────────────────────────
function drawSiteHeading(doc, url, y) {
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(59, 130, 246);
  doc.text(url, MARGIN, y + 6);

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(148, 163, 184);
  doc.text(`https://${url}`, MARGIN, y + 12);

  doc.link(MARGIN, y, CONTENT_W, 14, { url: `https://${url}` });

  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.5);
  doc.line(MARGIN, y + 15, PAGE_W - MARGIN, y + 15);

  return y + 19;
}

// ── Measure card height ───────────────────────────────────────────────────────
async function measureCard(doc, note) {
  let h = CARD_PADDING * 2 + BADGE_H + 3;

  if (note.img) {
    const { width, height } = await getImageDimensions(note.img);
    const ratio = height / width;
    const imgH  = Math.min(COL_W * ratio, IMG_MAX_H);
    h += imgH + 4;
  }

  if (note.note && note.note.trim()) {
    const lines = doc.splitTextToSize(note.note.trim(), COL_W - CARD_PADDING * 2);
    h += lines.length * LINE_H + 4;
  }

  h += LINE_H;
  return h;
}

// ── Draw a single note card ───────────────────────────────────────────────────
async function drawCard(doc, note, priority, x, y, cardH) {
  const colors = getPriorityColors(priority);

  // Card background + border
  doc.setFillColor(...colors.bg);
  doc.setDrawColor(...colors.border);
  doc.setLineWidth(0.4);
  doc.roundedRect(x, y, COL_W, cardH, 3, 3, "FD");

  let curY = y + CARD_PADDING;

  // Priority badge
  const badgeText = priority.toUpperCase();
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  const badgeW = doc.getTextWidth(badgeText) + 6;
  doc.setFillColor(...colors.badge);
  doc.setDrawColor(...colors.badge);
  doc.roundedRect(x + CARD_PADDING, curY, badgeW, BADGE_H, 1.5, 1.5, "F");
  doc.setTextColor(255, 255, 255);
  doc.text(badgeText, x + CARD_PADDING + 3, curY + 5);
  curY += BADGE_H + 3;

  // Image — normalized to fix EXIF rotation
  if (note.img) {
    const normalized        = await normalizeImage(note.img);
    const { width, height } = await getImageDimensions(note.img);
    const ratio  = height / width;
    const imgW   = COL_W - CARD_PADDING * 2;
    const imgH   = Math.min(imgW * ratio, IMG_MAX_H);
    doc.addImage(normalized, "JPEG", x + CARD_PADDING, curY, imgW, imgH);
    curY += imgH + 4;
  }

  // Note text
  if (note.note && note.note.trim()) {
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...colors.text);
    const lines = doc.splitTextToSize(note.note.trim(), COL_W - CARD_PADDING * 2);
    doc.text(lines, x + CARD_PADDING, curY + 4);
    curY += lines.length * LINE_H + 4;
  }

  // Date
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(148, 163, 184);
  doc.text(note.createdAt, x + CARD_PADDING, curY + 4);
}

// ── Main export function ──────────────────────────────────────────────────────
export async function generatePDF(filteredData, selectedSites) {
  const { jsPDF } = window.jspdf;
  const doc        = new jsPDF({ unit: "mm", format: "a4" });
  const logoBase64 = await getLogoBase64();

  // ── Collect all notes ─────────────────────────────────────────────────────
  const allSections = [];
  for (const { url, data } of filteredData) {
    const notes = [];
    for (const priority of PRIORITIES) {
      for (const note of (data[priority] || [])) {
        notes.push({ note, priority });
      }
    }
    allSections.push({ url, notes });
  }

  // ── Pre-measure all card heights ──────────────────────────────────────────
  for (const section of allSections) {
    for (const item of section.notes) {
      item.height = await measureCard(doc, item.note);
    }
  }

  // ── Pass 1: Layout ────────────────────────────────────────────────────────
  const drawCalls = [];
  let page  = 0;
  let curY  = HEADER_H + 4;

  const remainingY = () => PAGE_H - FOOTER_H - curY;

  const newPage = () => {
    page++;
    curY = HEADER_H + 4;
  };

  for (const { url, notes } of allSections) {
    if (remainingY() < 20) newPage();

    drawCalls.push({ type: "heading", page, url, y: curY });
    curY += 19;

    for (let i = 0; i < notes.length; i += 2) {
      const left  = notes[i];
      const right = notes[i + 1] || null;
      const rowH  = right
        ? Math.max(left.height, right.height)
        : left.height;

      if (remainingY() < rowH + 4) newPage();

      drawCalls.push({ type: "row", page, left, right, y: curY, rowH });
      curY += rowH + 4;
    }

    curY += 8;
  }

  const totalPages = page + 1;

  // ── Pass 2: Draw ──────────────────────────────────────────────────────────
  let currentPage = 0;
  drawHeader(doc, logoBase64);

  for (const call of drawCalls) {
    while (currentPage < call.page) {
      drawFooter(doc, currentPage + 1, totalPages);
      doc.addPage();
      currentPage++;
      drawHeader(doc, logoBase64);
    }

    if (call.type === "heading") {
      drawSiteHeading(doc, call.url, call.y);
    }

    if (call.type === "row") {
      const leftX  = MARGIN;
      const rightX = MARGIN + COL_W + COL_GAP;

      await drawCard(doc, call.left.note, call.left.priority, leftX, call.y, call.rowH);
      if (call.right) {
        await drawCard(doc, call.right.note, call.right.priority, rightX, call.y, call.rowH);
      }
    }
  }

  // Draw footer on last page
  drawFooter(doc, totalPages, totalPages);

  // ── Download ──────────────────────────────────────────────────────────────
  const pdfBlob  = doc.output("blob");
  const blobUrl  = URL.createObjectURL(pdfBlob);
  const filename = getFilename(selectedSites, "pdf");

  chrome.downloads.download({
    url:      blobUrl,
    filename: `TheWebNote-Exports/${filename}`,
    saveAs:   false,
  }, () => URL.revokeObjectURL(blobUrl));
}