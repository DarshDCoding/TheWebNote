// ── utils/helpers.js ──────────────────────────────────────────────────────────
// Shared pure helpers used by inputProcess, editHandler, and noteService.

// /**
//  * Extracts priority and clean note text from a raw input string.
//  *
//  * Rules (same as original inputProcess logic):
//  *   last 4 chars === "#IMP"  →  priority: "important", text = input minus last 4 chars
//  *   last 4 chars === "#MED"  →  priority: "medium",    text = input minus last 4 chars
//  *   anything else            →  priority: "normal",    text = full input
//  *
//  * @param {string} raw - trimmed input string
//  * @returns {{ noteText: string, priority: "important"|"medium"|"normal" }}
//  */
export function extractPriorityFromText(raw) {
  if (!raw) return { noteText: "", priority: "normal" };

  const tag = raw.slice(-4).toUpperCase();

  if (tag === "#IMP") {
    return { noteText: raw.slice(0, -4), priority: "important" };
  }
  if (tag === "#MED") {
    return { noteText: raw.slice(0, -4), priority: "medium" };
  }

  return { noteText: raw, priority: "normal" };
}



const MAX_DIMENSION = 1200;

export function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onerror = () => reject(new Error("Failed to read file"));

    reader.onload = () => {
      const img = new Image();

      img.onerror = () => reject(new Error("Failed to load image"));

      img.onload = () => {
        // ── Calculate new dimensions ──
        let { width, height } = img;

        if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
          if (width > height) {
            height = Math.round((height / width) * MAX_DIMENSION);
            width  = MAX_DIMENSION;
          } else {
            width  = Math.round((width / height) * MAX_DIMENSION);
            height = MAX_DIMENSION;
          }
        }

        // ── Draw onto canvas ──
        const canvas    = document.createElement("canvas");
        canvas.width    = width;
        canvas.height   = height;
        const ctx       = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);

        // ── Export: JPEG at 0.75, PNG as-is ──
        const isPNG    = file.type === "image/png";
        const mimeType = isPNG ? "image/png" : "image/jpeg";
        const quality  = isPNG ? undefined : 0.75;

        resolve(canvas.toDataURL(mimeType, quality));
      };

      img.src = reader.result;
    };

    reader.readAsDataURL(file);
  });
}