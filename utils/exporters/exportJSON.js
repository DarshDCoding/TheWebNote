import { downloadFile, getJSONFilename } from "./exportHelpers.js";
import { buildPayload } from "../buildPayload.js";

export function generateJSON(filteredData, selectedSites) {
  const filename = getJSONFilename(selectedSites);
  downloadFile(filename, buildPayload(filteredData, "export"), "application/json");
}