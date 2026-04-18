import { PRIORITIES, EMPTY_SITE_DATA } from "./constants.js";
import { sendMessage }                 from "./messaging.js";

const MAX_NOTES = 1000;

export function validateBackup(parsed) {
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed))
    return { valid: false, reason: "File is not a valid JSON object." };

  if (parsed._meta?.extensionName !== "The Web Note")
    return { valid: false, reason: "This file was not created by The Web Note." };

  if (!Array.isArray(parsed.sites))
    return { valid: false, reason: "Backup file is missing the sites array." };

  let totalNotes = 0;

  for (const site of parsed.sites) {
    if (typeof site.url !== "string" || !site.url.trim())
      return { valid: false, reason: "One or more sites are missing a valid URL." };

    if (!site.data || typeof site.data !== "object")
      return { valid: false, reason: `Site "${site.url}" is missing its data object.` };

    for (const priority of PRIORITIES) {
      if (!Array.isArray(site.data[priority]))
        return { valid: false, reason: `Site "${site.url}" is missing the "${priority}" notes array.` };
      totalNotes += site.data[priority].length;
    }
  }

  if (totalNotes > MAX_NOTES)
    return { valid: false, reason: `Backup contains ${totalNotes} notes, exceeding the limit of ${MAX_NOTES}. The file may be corrupt.` };

  return { valid: true };
}

function isValidNote(note) {
  if (!note || typeof note !== "object") return false;
  if (typeof note.id       !== "string" || !note.id.trim())                   return false;
  if (typeof note.priority !== "string" || !PRIORITIES.includes(note.priority)) return false;

  const hasText = typeof note.note === "string" && note.note.trim() !== "";
  const hasImg  = typeof note.img  === "string" && note.img.trim()  !== "";
  return hasText || hasImg;
}

export async function mergeAndImport(sites) {
  const results = [];

  for (const { url, data } of sites) {
    const result = { url, imported: 0, duplicates: [], failed: 0, error: null };

    try {
      const existing   = await sendMessage({ action: "GET_NOTES", url });
      const mergedData = {
        ...structuredClone(EMPTY_SITE_DATA),
        ...( existing && typeof existing === "object" ? structuredClone(existing) : {} ),
      };
      // Ensure every priority array exists even if the stored object is partial
      for (const p of PRIORITIES) {
        if (!Array.isArray(mergedData[p])) mergedData[p] = [];
      }

      // O(1) duplicate detection
      const existingIds = new Set(
        PRIORITIES.flatMap(p => (mergedData[p] || []).map(n => n.id))
      );

      for (const priority of PRIORITIES) {
        for (const note of (data[priority] || [])) {
          if (!isValidNote(note))        { result.failed++;               continue; }
          if (existingIds.has(note.id))  { result.duplicates.push(note); continue; }

          mergedData[note.priority].push(note);
          existingIds.add(note.id); // guard against dupes within the same file
          result.imported++;
        }
      }

      if (result.imported > 0)
        await sendMessage({ action: "IMPORT_SITES", sites: [{ url, data: mergedData }] });

    } catch (err) {
      result.error = err.message;
    }

    results.push(result);
  }

  return results;
}

export async function overwriteSingleNote(url, note) {
  try {
    const existing   = await sendMessage({ action: "GET_NOTES", url });
    const mergedData = structuredClone(existing) || structuredClone(EMPTY_SITE_DATA);

    for (const priority of PRIORITIES) {
      const idx = mergedData[priority].findIndex(n => n.id === note.id);
      if (idx !== -1) { mergedData[priority].splice(idx, 1); break; }
    }
    mergedData[note.priority].push(note);

    await sendMessage({ action: "IMPORT_SITES", sites: [{ url, data: mergedData }] });
    return { error: null };

  } catch (err) {
    return { error: err.message };
  }
}

export async function overwriteDuplicates(url, notes) {
  try {
    const existing   = await sendMessage({ action: "GET_NOTES", url });
    const mergedData = structuredClone(existing) || structuredClone(EMPTY_SITE_DATA);

    for (const note of notes) {
      for (const priority of PRIORITIES) {
        const idx = mergedData[priority].findIndex(n => n.id === note.id);
        if (idx !== -1) { mergedData[priority].splice(idx, 1); break; }
      }
      mergedData[note.priority].push(note);
    }

    await sendMessage({ action: "IMPORT_SITES", sites: [{ url, data: mergedData }] });
    return { overwritten: notes.length, error: null };

  } catch (err) {
    return { overwritten: 0, error: err.message };
  }
}