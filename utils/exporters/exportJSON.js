// ── utils/exporters/exportJSON.js ─────────────────────────────────────────────
import { downloadFile, getJSONFilename } from "./exportHelpers.js";

export function generateJSON(filteredData, selectedSites) {
  const filename = getJSONFilename(selectedSites);
  const content  = JSON.stringify(filteredData, null, 2);
  downloadFile(filename, content, "application/json");
}