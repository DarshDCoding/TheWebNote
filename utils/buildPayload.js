// Single source of truth for the TheWebNote JSON envelope.
// Used by both the auto-backup runner and the manual export flow so that
// the output format is always identical — only `backupType` differs.
//
// Schema:
// {
//   _meta: {
//     backup_id        — unique ID for this file (UUID)
//     generatedAt      — ISO timestamp
//     extensionName    — from manifest
//     extensionVersion — from manifest
//     totalSites       — number of sites in this file
//     totalNotes       — total note count across all sites
//     backupType       — "auto" | "export"
//   },
//   sites: [ { url, data: { important[], medium[], normal[] } }, … ]
// }

// /**
//  * Build the standard TheWebNote JSON payload.
//  *
//  * @param {Array}  sites      - Array of { url, data } objects
//  * @param {"auto"|"export"} backupType
//  * @returns {string}          - JSON string ready to write to a file
//  */

export function buildPayload(sites, backupType) {
  const manifest = chrome.runtime.getManifest();

  const totalNotes = sites.reduce(
    (acc, { data }) =>
      acc +
      (data.important?.length || 0) +
      (data.medium?.length    || 0) +
      (data.normal?.length    || 0),
    0,
  );

  return JSON.stringify(
    {
      _meta: {
        backup_id:        crypto.randomUUID(),
        generatedAt:      new Date().toISOString(),
        extensionName:    manifest.name,
        extensionVersion: manifest.version,
        totalSites:       sites.length,
        totalNotes,
        backupType,
      },
      sites,
    },
    null,
    2,
  );
}