<div align="center">

# 📝 TheWebNote

The web has no memory — until now. Leave notes on any website and find them waiting, right where they belong.

![Version](https://img.shields.io/badge/version-1.2.0-blue)
![License](https://img.shields.io/badge/license-GPL--v3-blue)
![Chrome](https://img.shields.io/badge/browser-Chrome%2088+-orange)
![Manifest](https://img.shields.io/badge/manifest-V3-purple)
![Build](https://img.shields.io/badge/build-no%20bundler-lightgrey)

<!-- Add a demo GIF here once recorded -->
<!-- ![Demo](assets/demo.gif) -->

</div>

---

## ✨ Features

- 📌 Add notes to any website while browsing
- ✏️ Edit existing notes — update text, image, or priority at any time
- 🔴🟡⚫ Three priority levels — **Important**, **Medium**, **Normal**
- 🖼️ Attach images to your notes — click any image to view it full size in a new tab
- 🔔 Floating toggle button appears automatically on sites that have notes
- 🙈 Toggle pill hides automatically during fullscreen (videos, games, etc.) and restores on exit
- 📂 Central dashboard to view, manage and delete notes across all sites
- 📤 **Export** notes in JSON, HTML, PDF, Markdown, CSV, or TXT format
- 📥 **Import** a JSON backup with duplicate detection and per-note conflict resolution
- 🔁 **Auto-backup** — scheduled automatic JSON backups saved directly to your Downloads folder
- 🌙 Dark mode with persistent preference
- 🔒 100% local — your data never leaves your device

---

## 🖥️ Browser Compatibility

| Browser | Support |
|---------|---------|
| Chrome 88+ | ✅ Fully supported |
| Edge 88+ (Chromium) | ✅ Should work |
| Firefox | ❌ Not supported (MV3 differences) |
| Safari | ❌ Not supported |

> TheWebNote uses **Manifest V3** which requires Chrome 88 or higher. Please update Chrome before installing if you are on an older version.

---

## 📋 Prerequisites

- **Google Chrome** version 88 or higher
- No Node.js, no npm, no build step — the extension runs as plain ES modules

---

## 🚀 Installation

> ⚠️ **Important — keep your TheWebNote folder safe.**
> TheWebNote is a manually loaded extension (not from the Chrome Web Store), so all your notes are tied to the folder you load it from. **Do not delete or move this folder** after installation or you will lose your notes. A good permanent home is `Documents` or a dedicated `Extensions` folder.

### Step 1 — Download

1. Go to the [**Releases page**](../../releases) of this repository
2. Find the latest release and download the `.zip` file listed under **Assets**

### Step 2 — Extract

Extract the `.zip` file and move the resulting `TheWebNote` folder to a **permanent location** on your computer:

| OS | Suggested location |
|----|--------------------|
| Windows | `C:\Users\YourName\Documents\TheWebNote` |
| Mac | `/Users/YourName/Documents/TheWebNote` |
| Linux | `/home/yourname/Documents/TheWebNote` |

> ⚠️ **Do not leave it in Downloads.** Many users periodically clean their Downloads folder. If the folder is deleted, Chrome will disable the extension and all notes will be lost.

### Step 3 — Load into Chrome

1. Open Chrome and go to `chrome://extensions`
2. Enable **Developer mode** using the toggle at the top right
3. Click **Load unpacked**
4. Navigate to and select your `TheWebNote` folder (the one that contains `manifest.json`)
5. TheWebNote icon will appear in your Chrome toolbar — you're ready to go!

> 💡 Chrome will show a warning saying the extension is unverified. This is normal for manually loaded extensions. Click **Keep** to dismiss it.

---

## 🔄 Installing Updates

> ⚠️ **Never uninstall and reinstall to update.** Uninstalling the extension deletes all your notes permanently. Always use the update script below instead.

### Step 1 — Download the new release

Go to the [**Releases page**](../../releases) and download the latest `.zip` file.

### Step 2 — Extract it anywhere

Extract the zip to any temporary location — Desktop or Downloads is fine since you won't need it after the update.

### Step 3 — Run the update script

**Windows**
1. Open the extracted folder and double-click `update.bat`
2. The script will automatically find your installed TheWebNote folder and copy the new files in
3. If it finds more than one TheWebNote folder, it will ask you to pick the correct one
4. Confirm when prompted

**Mac / Linux**
1. Open Terminal
2. Drag `update.sh` from the extracted folder into the Terminal window
3. Press **Enter** to run it
4. Confirm when prompted

> 💡 On Mac you may need to allow the script to run first. If you see a permission error, run: `chmod +x /path/to/update.sh`

### Step 4 — Reload the extension in Chrome

1. Open Chrome and go to `chrome://extensions`
2. Find **The Web Note** in the list
3. Click the **reload icon** (the circular arrow ↻ on the extension card)
4. Done — the new version is active and all your notes are intact

---

## 🧠 How It Works

### Adding a note

Type your note in the popup input and hit **Enter** or **Add Task**.

To set priority, add a tag at the end of your note:

| Tag | Priority |
|-----|----------|
| `#IMP` | 🔴 Important |
| `#MED` | 🟡 Medium |
| *(none)* | ⚫ Normal |

Example: `Read this article later #IMP`

> Notes can contain text, an image, or both. A note with only an image and no text is valid.

### Editing a note

Click the **Edit** button on any note card in the popup to enter edit mode.

- The note's existing text is loaded into the input field, including its priority tag
- If the note has an image, it is shown in the preview area
- Make your changes — you can update the text, change the priority tag, attach a new image, or remove the existing one
- The **Add Task** button becomes **Save Edit** (highlighted in purple) — click it or press **Enter** to save
- The **Dashboard** button becomes **Remove Image** if the note has an image, or **Cancel Edit** if it does not
- If you change the priority tag, the note is automatically moved to the correct priority bucket on save

> **Note:** The Edit button is only available in the popup. It does not appear in the Dashboard.

### Viewing a note image

Click on any image attached to a note — in either the popup or the dashboard — to open it full size in a new tab.

### Floating toggle pill

When you visit a site that has saved notes, a pill-shaped button appears in the bottom-right corner showing the note count per priority. Clicking it opens the popup as a floating iframe over the page. The pill automatically hides when the page enters fullscreen mode and reappears on exit.

### Dashboard

Click **Dashboard** in the popup to open the full dashboard in a new tab. It shows all notes grouped by website. Each site card displays notes in a horizontal grid (min 300px per card). Up to 5 notes are shown by default with a **Show all** toggle for the rest.

---

## 📤 Exporting Notes

The Export feature lets you download your notes from the Dashboard in multiple formats.

### How to export

1. Open the **Dashboard**
2. Click the **Export** button in the top bar
3. Select which **sites** to include — all sites are selected by default. Use **Deselect All** / **Select All** to toggle
4. Choose which **additional formats** to export alongside JSON (HTML, PDF, Markdown, CSV, TXT)
5. Click **Export** — a `.zip` file is downloaded containing one file per selected format

### Export formats

| Format | Description | Best for |
|--------|-------------|----------|
| **JSON** | Complete backup including images | Always included — required for Import |
| **HTML** | Self-contained file, opens in any browser | Archiving and sharing |
| **PDF** | Printable document | Reading and printing |
| **Markdown** | Plain-text with formatting | Obsidian, Notion, or text editors |
| **CSV** | Spreadsheet-compatible | Excel or Google Sheets |
| **TXT** | Plain readable text | Simple archiving |

> JSON is always included in every export. It is the only format that retains image data and can be re-imported.

---

## 📥 Importing Notes

The Import feature lets you restore a previously exported JSON backup into the extension.

### How to import

1. Open the **Dashboard**
2. Click the **Import** button in the top bar
3. Load your backup JSON file using one of three methods:
   - **Drag and drop** the file into the drop zone
   - Click **Browse** to pick the file from your file system
   - Press **Ctrl+V** (or **⌘V** on Mac) to paste — works if the file is copied from your file manager, or if you've copied the raw JSON text
4. The file is validated immediately — you will see a summary of sites and note counts
5. Click **Import** to proceed

### Import results

After import, a results screen shows the outcome for each site:

| Badge | Meaning |
|-------|---------|
| ✓ N imported | Notes that were new and successfully saved |
| ⚠ N duplicates | Notes already present in storage (same ID) — skipped by default |
| ✗ N invalid | Notes that failed validation (no content, missing ID, etc.) |

### Handling duplicates

Duplicate notes are not imported automatically — they are shown for review instead. Click the **⚠ duplicates** badge on any site row to expand a panel showing the duplicate note cards.

From there you have two options:

- **Overwrite** (per note) — click the **Overwrite** button below an individual card to replace just that one note in storage with the imported version
- **Overwrite all** — click the button in the panel header to replace all duplicates for that site at once

Once every duplicate for a site is overwritten (individually or via Overwrite all), the badge turns green automatically.

### Validation rules

A backup file is rejected at the file level if:
- It is not valid JSON
- It was not created by The Web Note (`extensionName` check)
- It is missing the `sites` array
- Any site is missing its URL or note data
- The total note count exceeds 1,000 (corrupt file guard)

Individual notes within a valid file are skipped (counted as invalid) if:
- They have no `id`
- Their `priority` is not one of `important`, `medium`, or `normal`
- They have neither note text nor an image (completely empty content)

---

## 🔁 Auto-Backup

Auto-backup automatically saves a JSON backup of all your notes to your Downloads folder on a recurring schedule — no manual action required.

### How to enable

1. Open the **Dashboard**
2. Find the **Auto-Backup** panel (below the main note list)
3. Choose a backup interval: every 3, 6, 9, 12, or 24 hours
4. Toggle **Enable** — the panel will show the last backup time and the next scheduled backup time

### How it works

- Backups are saved to a `TheWebNote-Backup/` subfolder inside your Chrome Downloads folder
- Each backup file is named with a timestamp: `TheWebNote-backup-YYYY-MM-DD-HH-MM-AM/PM.json`
- The schedule is maintained by a Chrome alarm (`chrome.alarms`) in the background service worker, which persists across browser restarts
- If the Dashboard is not open when a backup is due, Chrome still triggers it silently in the background
- Preferences (enabled state, interval, last/next backup times) are stored in both `localStorage` (for the dashboard UI) and `chrome.storage.local` (for the service worker)

### Disabling auto-backup

Toggle **Enable** off in the Auto-Backup panel. The alarm is cleared immediately and no further backups will run until you re-enable it. Your last/next backup timestamps are preserved so they reappear correctly if you re-enable later.

> Auto-backup produces JSON only. To export in other formats (PDF, Markdown, etc.), use the manual Export feature.

---

## 🗂️ Project Structure

```
TheWebNote/
│
├── manifest.json               # Extension config (MV3)
├── background.js               # Service worker — IndexedDB + message router + alarm handler
├── content.js                  # Injected into every page — floating toggle pill
├── update.bat                  # Windows update script
├── update.sh                   # Mac/Linux update script
│
├── index.html                  # Popup UI
├── popup.js                    # Popup logic
├── style.css                   # Shared base styles (light mode)
├── darkMode.css                # All dark mode overrides ([data-theme="dark"])
│
├── dashboard/
│   ├── dashboard.html          # Dashboard page
│   ├── dashboard.js            # Dashboard logic (notes, delete, init)
│   ├── dashboard.css           # Dashboard-specific styles
│   ├── exportModal.css         # Export modal styles
│   └── importModal.css         # Import modal styles
│
├── utils/
│   ├── constants.js            # Shared constants: PRIORITIES, EMPTY_SITE_DATA, MAX_NOTES
│   ├── date.js                 # Date/time formatting
│   ├── events.js               # Global event delegation + image viewer init
│   ├── helpers.js              # Pure helpers (priority parsing, image compression)
│   ├── imageHandler.js         # Image preview in popup
│   ├── inputProcess.js         # Parses note input + priority tags
│   ├── editHandler.js          # Edit mode UI state (enter, reset, image removal)
│   ├── noteService.js          # Delete + update note handlers (popup)
│   ├── render.js               # renderElement + RenderNotes
│   ├── toggleDark.js           # Dark mode toggle (shared by popup + dashboard)
│   ├── urls.js                 # Active tab URL helpers (Promise-based)
│   ├── messaging.js            # chrome.runtime.sendMessage wrapper
│   ├── buildPayload.js         # Builds the standard JSON backup envelope
│   │
│   ├── exportModal.js          # Export modal UI logic
│   ├── exporter.js             # Export orchestrator — calls per-format exporters
│   │
│   ├── importModal.js          # Import modal UI logic (file load, results, overwrite)
│   ├── importer.js             # Import logic — validation, merging, duplicate detection
│   │
│   ├── autoBackupExporter.js   # Auto-backup scheduler, alarm helpers, prefs storage
│   │
│   └── exporters/
│       ├── exportJSON.js       # JSON export
│       ├── exportHTML.js       # HTML export
│       ├── exportPDF.js        # PDF export
│       ├── exportMD.js         # Markdown export
│       ├── exportCSV.js        # CSV export
│       ├── exportTXT.js        # TXT export
│       └── exportHelpers.js    # Shared helpers across exporters
│
├── libs/
│   ├── jszip.min.js            # ZIP file generation (bundled)
│   └── jspdf.min.js            # PDF generation (bundled)
│
└── assets/
    ├── icons/
    │   └── icon128.png         # Extension icon
    └── svgs/
        ├── darkMode.svg        # Theme toggle icon (shown in light mode)
        ├── lightMode.svg       # Theme toggle icon (shown in dark mode)
        ├── deleteCard.svg      # Delete site button icon
        ├── drag-image.svg      # Drag indicator icon
        ├── nothingToShow.svg   # Empty state illustration
        └── lookingToShow.svg   # Loading state illustration
```

---

## 🗃️ Data Storage

All notes are stored in **IndexedDB** (`TheWebNoteDB`) via the background service worker.

```
Store: "notes"
Key:   hostname (e.g. "github.com")
Value: {
  important: [ ...notes ],
  medium:    [ ...notes ],
  normal:    [ ...notes ]
}
```

Each note object:

```js
{
  id:        string   // crypto.randomUUID()
  note:      string   // note text (may be null/empty if note is image-only)
  img:       string   // base64 image, compressed to max 1200px (or null)
  priority:  string   // "important" | "medium" | "normal"
  createdAt: string   // formatted date string
  status:    string   // "pending"
}
```

A note is valid as long as it has at least one of `note` (non-empty text) or `img` (non-empty base64 string). Both fields being absent makes the note invalid.

### Backup file format

JSON backups produced by Export and Auto-Backup follow this envelope:

```js
{
  _meta: {
    backup_id:        string   // UUID unique to this file
    generatedAt:      string   // ISO timestamp
    extensionName:    string   // "The Web Note"
    extensionVersion: string   // e.g. "1.1.1"
    totalSites:       number
    totalNotes:       number
    backupType:       string   // "auto" | "export"
  },
  sites: [
    {
      url:  string             // hostname key
      data: {
        important: [ ...notes ],
        medium:    [ ...notes ],
        normal:    [ ...notes ]
      }
    }
  ]
}
```

---

## 📡 Message API

All data operations go through `background.js` via `chrome.runtime.sendMessage`:

| Action | Payload | Returns |
|--------|---------|---------|
| `ADD_NOTE` | `{ url, note }` | updated `siteData` |
| `DELETE_NOTE` | `{ url, id }` | updated `siteData` |
| `UPDATE_NOTE` | `{ url, id, updates }` | updated `siteData` |
| `GET_NOTES` | `{ url }` | `siteData` |
| `CHECK_SITE` | `{ url }` | `boolean` |
| `GET_ALL` | — | `[{ url, data }]` |
| `DELETE_SITE` | `{ url }` | — |
| `IMPORT_SITES` | `{ sites }` | — |
| `NOTES_UPDATED` | `{ url }` | forwards to content script |

The `updates` payload for `UPDATE_NOTE` accepts any subset of `{ note, img, priority }`. Fields not included are preserved. If `priority` changes, the note is automatically moved between priority buckets in the database.

---

## 🔧 Development Notes

- **Manifest V3** — uses a service worker (`background.js`), not a background page
- **No build step** — plain ES modules, no bundler needed
- **Dark mode** — controlled by `data-theme` attribute on `<html>`, persisted in `localStorage` with key `webnote-theme`
- **Iframe popup** — `index.html` is loaded as an iframe inside `content.js` so the full popup UI appears floating on the page
- **Priority syntax** — parsed in `utils/inputProcess.js` (add) and `utils/helpers.js` (edit) by reading the last 4 characters of the input
- **Edit state** — all edit UI state lives in `utils/editHandler.js`; `popup.js` delegates to it entirely
- **Active tab URL** — `utils/urls.js` exports a Promise (`activeTabUrlPromise`) instead of a plain string to eliminate a race condition where the URL could be empty when the first note is saved
- **Image compression** — images are resized to a max of 1200px and compressed via canvas before storing: JPEG at 0.75 quality, PNG lossless resize only
- **Image viewer** — clicking a note image opens it full size in a new tab via a temporary blob URL; direct data URLs are blocked by Chrome's CSP
- **Fullscreen hide** — the toggle pill listens for `fullscreenchange` on `document` and sets `display: none` on enter, `display: flex` on exit
- **Export bundling** — all selected formats are packed into a single `.zip` using JSZip and downloaded in one shot; PDF uses jsPDF
- **Import paste** — Ctrl+V / ⌘V works in the import modal in two ways: if a file is copied from the OS file manager it arrives as a `file` clipboard item; if raw JSON text is copied it arrives as a `string/text` item and is wrapped into a synthetic `File` object before being fed into the same `loadFile()` pipeline
- **Auto-backup scheduling** — uses `chrome.alarms` which survives service worker restarts; preferences are mirrored in both `localStorage` (instant, synchronous, for the dashboard UI) and `chrome.storage.local` (for the service worker to read when the dashboard is not open)
- **Dashboard refresh on import** — after clicking Done in the import modal, the dashboard automatically re-fetches all notes via `GET_ALL` and re-renders, so imported notes are visible immediately without a page reload
- **Constants** — `PRIORITIES`, `EMPTY_SITE_DATA`, and `MAX_NOTES` all live in `utils/constants.js` as the single source of truth; `background.js` maintains its own inline copy of `PRIORITIES` since service workers cannot use ES module imports

---

## ⚠️ Known Issues & Limitations

- **Notes are tied to the browser** — notes live in IndexedDB. Clearing your browser data will permanently delete them. Use Export or Auto-Backup regularly to protect your data
- **Uninstalling the extension deletes all data** — Chrome wipes all IndexedDB data scoped to the extension on uninstall. Reinstalling will not recover your notes. Export before uninstalling
- **Chrome only** — Manifest V3 implementation differs between browsers; Firefox and Safari are not currently supported
- **`autofocus` blocked in iframe** — Chrome blocks autofocus on inputs inside cross-origin iframes, so the popup input is focused manually via `setTimeout`
- **Legacy uncompressed images** — images attached to notes before v1.1.1 are stored at full base64 size. They will not be retroactively compressed. Re-attaching the image on an edit will compress it going forward

---

## ❓ FAQ

**Q: I installed the extension but I don't see the toggle button on websites.**
A: The floating pill only appears on sites where you have already saved at least one note. Visit a site, open the popup, add a note, then reload the page.

**Q: How do I update to a new version without losing my notes?**
A: Use the `update.bat` (Windows) or `update.sh` (Mac/Linux) script included in every release. Never uninstall the extension to update. Full instructions are in the [Installing Updates](#-installing-updates) section.

**Q: Can I just uninstall and reinstall the new version?**
A: No — uninstalling permanently deletes all your notes from Chrome's IndexedDB. Always use the update script instead.

**Q: Chrome shows an error when I click Load unpacked.**
A: Make sure you are selecting the folder that directly contains `manifest.json`.

**Q: Where are auto-backup files saved?**
A: Inside a `TheWebNote-Backup/` subfolder in your Chrome Downloads directory. The filename includes a timestamp so files never overwrite each other.

**Q: Why did my auto-backup not run?**
A: Chrome's alarm system requires the browser to be open. If Chrome was closed at the scheduled time, the backup will not fire until the next scheduled interval after Chrome reopens. The Dashboard will show the last successful backup time so you can see when it last ran.

**Q: Can I import a backup from a different computer?**
A: Yes. Export a JSON backup on one machine, copy the file to the other, and use the Import feature. Duplicate detection compares note IDs, so notes that already exist on the destination machine will be flagged as duplicates rather than imported twice.

**Q: What happens to notes that are flagged as duplicates on import?**
A: They are skipped by default. Click the ⚠ duplicates badge on a site row to expand the panel and review them. You can overwrite individual notes or all duplicates at once.

**Q: Ctrl+V isn't pasting my backup file in the import modal.**
A: Make sure the import modal is open and on the first step (file selection). Two paste methods are supported: copying the file itself from your file manager (Ctrl+C on the file), or opening the JSON in a text editor, selecting all (Ctrl+A), copying (Ctrl+C), and then pasting into the modal.

**Q: My notes disappeared after I cleared my browser data.**
A: Notes are stored in Chrome's IndexedDB. Clearing browser data erases them. Enable Auto-Backup and export regularly to avoid data loss.

**Q: The priority tag isn't working — my note is showing as Normal.**
A: The tag must be the very last characters of the input with no trailing space. For example `Read this #IMP` — make sure there are no spaces after `#IMP`.

**Q: Can I edit a note in the Dashboard?**
A: Not currently. The Edit button only appears in the popup. To edit a note, open the popup on the relevant site and click Edit there.

**Q: Can I use this on Firefox?**
A: Not currently. TheWebNote uses Chrome's Manifest V3 APIs which behave differently on Firefox.

**Q: Does TheWebNote send any data to a server?**
A: No. All notes are stored entirely on your device. The only network request made is fetching website favicons from Google's favicon service for display in the dashboard — no note data is ever included.

**Q: The toggle pill disappeared and isn't coming back.**
A: If the page is in fullscreen mode, the pill hides automatically. Exit fullscreen and it will reappear immediately.

---

## 🛡️ Trust & Security

TheWebNote is a manually loaded extension, which means Chrome will show it as "unverified." Here is exactly what the extension does and does not do.

### What the extension can access

| Permission | Why it is needed |
|------------|-----------------|
| `activeTab` | To read the current tab's URL so notes are saved and loaded for the right website |
| `tabs` | To open the Dashboard in a new tab and forward note-update events to the content script |
| `scripting` | To inject the floating toggle pill into web pages |
| `storage` | To persist auto-backup preferences and timestamps for the service worker |
| `downloads` | To save auto-backup JSON files to the Downloads folder |
| `alarms` | To schedule recurring auto-backups via `chrome.alarms` |
| `host_permissions` (`<all_urls>`) | Required for the content script to run on every website |

### What the extension does NOT do

- ❌ It does not read page content, form inputs, passwords, or any text on the pages you visit
- ❌ It does not make any network requests except fetching favicons from `https://www.google.com/s2/favicons` — no note data is included
- ❌ It does not communicate with any external server, API, or database
- ❌ It does not use any analytics, crash reporting, or telemetry
- ❌ It does not track your browsing history or the sites you visit
- ❌ It does not inject ads or modify page content in any way

### Your data never leaves your device

All notes are stored entirely in your browser's **IndexedDB**, scoped to the extension's own origin. No other website, extension, or external party can access this data. Exported and auto-backup files are saved locally to your file system — they are never uploaded anywhere.

### Verify it yourself

TheWebNote is fully open source. Every line of code is readable in this repository — there are no compiled bundles, no minified files (except the two bundled libraries JSZip and jsPDF which are standard open source libraries), and no obfuscated logic. The files loaded into Chrome are exactly the files you see here.

---

## 🚧 Planned Features

- 📄 **Extract text from web pages** — select text on any page and save it directly as a note
- 🖱️ **Draggable toggle pill** — drag the pill to any corner of the screen with position saved across sessions
- 🔁 **Sync across devices** — share notes between multiple machines
- 🎨 **Canvas drawing** — sketch and save drawings directly inside a note
- 📸 **Screenshot webpage** — capture the current page and insert it directly as a note image

---

## 📄 License

This project is licensed under the **GNU General Public License v3.0 (GPL-3.0)**.

This means you are free to:
- ✅ Use it personally or commercially
- ✅ Fork and modify it
- ✅ Distribute it

Under the condition that:
- 📋 Any modified version you distribute must also be open source under GPL-3.0
- 📋 The original copyright and license notice must be kept

See the [LICENSE](./LICENSE) file for the full license text.

---

**Happy note-taking! 📚**