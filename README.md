<div align="center">

# 📝 TheWebNote

The web has no memory — until now. Leave notes on any website and find them waiting, right where they belong.

![Version](https://img.shields.io/badge/version-1.2.1-blue)
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
- 🌙 Dark mode with persistent preference
- 📤 **Export notes** — download your notes as JSON, HTML, PDF, Markdown, CSV, TXT, or XLSX
- 📥 **Import notes** — restore from a JSON backup with duplicate detection and per-note conflict resolution
- 🔁 **Auto-backup** — schedule automatic JSON backups at a chosen interval (3 h, 6 h, 9 h, 12 h, or 24 h), saved directly to your Downloads folder
- 🔒 100% local — your data never leaves your device

---

## 🖥️ Browser Compatibility

| Browser | Support |
|---------|---------|
| Chrome 88+ | ✅ Fully supported |
| Edge 88+ (Chromium) | ✅ Should work |
| Firefox | ❌ Not supported (MV3 differences) |
| Safari | ❌ Not supported |

> TheWebNote uses **Manifest V3** which requires Chrome 88 or higher. If you are on an older version of Chrome, please update before installing.

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

Extract the `.zip` file and move the resulting `TheWebNote` folder to a **permanent location** on your computer — somewhere you won't accidentally delete it, such as:

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

When a new version is released, updating takes less than a minute and your notes are completely safe throughout.

### Step 1 — Download the new release

Go to the [**Releases page**](../../releases) and download the latest `.zip` file.

### Step 2 — Extract it anywhere

Extract the zip to any temporary location — Desktop or Downloads is fine since you won't need it after the update.

### Step 3 — Run the update script

Inside the extracted folder you will find two update scripts — run the one for your operating system:

**Windows**
1. Open the extracted folder
2. Double-click `update.bat`
3. The script will automatically find your installed TheWebNote folder and copy the new files in
4. If it finds more than one TheWebNote folder, it will ask you to pick the correct one
5. Confirm when prompted

**Mac / Linux**
1. Open Terminal
2. Drag `update.sh` from the extracted folder into the Terminal window (this fills in the path automatically)
3. Press **Enter** to run it
4. The script will automatically find your installed TheWebNote folder and copy the new files in
5. Confirm when prompted

> 💡 On Mac you may need to allow the script to run first. If you see a permission error, run this in Terminal: `chmod +x /path/to/update.sh`

### Step 4 — Reload the extension in Chrome

1. Open Chrome and go to `chrome://extensions`
2. Find **The Web Note** in the list
3. Click the **reload icon** (the circular arrow ↻ on the extension card)
4. Done — the new version is active and all your notes are intact

> 💡 You can now delete the temporary folder you extracted in Step 2. Your permanent TheWebNote folder has already been updated.

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

### Editing a note
Click the **Edit** button on any note card in the popup to enter edit mode.

- The note's existing text is loaded into the input field, including its priority tag
- If the note has an image, it is shown in the preview area
- Make your changes — you can update the text, change the priority tag, attach a new image, or remove the existing one
- The **Add Task** button becomes **Save Edit** (highlighted in purple) — click it or press **Enter** to save
- The **Dashboard** button becomes **Remove Image** if the note has an image, or **Cancel Edit** if it does not — click it to remove the image or discard all changes respectively
- If you change the priority tag, the note is automatically moved to the correct priority bucket on save
- Clicking **Save Edit** with no text and no image discards the edit and returns to normal mode without saving

> **Note:** The Edit button is only available in the popup. It does not appear on note cards in the Dashboard view.

### Viewing a note image
Click on any image attached to a note — in either the popup or the dashboard — to open it full size in a new tab.

### Floating toggle pill
When you visit a site that has saved notes, a pill-shaped button appears in the bottom-right corner. It shows the count of notes per priority. Clicking it opens the popup as a floating iframe over the page. The pill automatically hides when the page enters fullscreen mode and reappears when fullscreen exits.

### Dashboard
Click **Dashboard** in the popup to open the full dashboard in a new tab. It shows all notes grouped by website. Each site card displays notes in a horizontal grid (min 300px per card). Up to 5 notes are shown by default with a **Show all** toggle for the rest.

### Exporting notes
Click **Export** in the dashboard to open the export modal. Select which sites to include and which additional formats to generate. **JSON is always exported** — it is the only format that supports import. Additional formats are optional:

| Format | Best for |
|--------|----------|
| JSON | Import / full backup (always included) |
| HTML | Self-contained archive, opens in any browser |
| PDF | Printable archive |
| Markdown | Obsidian, Notion, or readable archive |
| CSV | Excel or Google Sheets |
| TXT | Plain text archive |

When Markdown, CSV, or TXT is selected, a separate `images.zip` is also downloaded containing all note images referenced by those files.

### Importing notes
Click **Import** in the dashboard to open the 3-step import modal:

1. **File selection** — drag and drop a `.json` backup file or click to browse. The file is validated before proceeding.
2. **Loading** — the file is parsed and each note is checked against your existing data to detect duplicates.
3. **Results** — a summary shows how many notes will be imported, how many are duplicates, and how many failed. For each duplicate you can choose to skip or overwrite it individually, or apply a blanket decision per site.

Only JSON files exported by TheWebNote are accepted. The import format is validated against a strict schema before any data is written.

### Auto-backup
Open the **Auto-backup** panel in the dashboard header to schedule automatic JSON backups. Choose an interval (every 3, 6, 9, 12, or 24 hours). When a backup fires, the file is downloaded automatically to your `TheWebNote-Backup` folder inside Downloads. The alarm is managed by Chrome's `alarms` API and survives browser restarts.

---

## 🗂️ Project Structure

```
TheWebNote/                       #load THIS into Chrome
  │
  ├── manifest.json               # Extension config (MV3)
  ├── background.js               # Service worker — IndexedDB, message router, auto-backup alarm
  ├── content.js                  # Injected into every page — floating toggle pill
  ├── update.bat                  # Windows update script (run to update safely)
  ├── update.sh                   # Mac/Linux update script (run to update safely)
  │
  ├── index.html                  # Popup UI
  ├── popup.js                    # Popup logic
  ├── style.css                   # Shared base styles (light mode)
  ├── darkMode.css                # All dark mode overrides ([data-theme="dark"])
  │
  ├── dashboard/
  │   ├── dashboard.html          # Dashboard page
  │   ├── dashboard.js            # Dashboard logic (export, import, auto-backup UI)
  │   └── dashboard.css          # Dashboard-specific styles
  │
  ├── utils/
  │   ├── date.js                 # Date/time formatting
  │   ├── events.js               # Global event delegation helper + image viewer init
  │   ├── helpers.js              # Shared pure helpers (priority parsing, image compression)
  │   ├── imageHandler.js         # Image preview in popup
  │   ├── inputProcess.js         # Parses note input + priority tags
  │   ├── editHandler.js          # Edit mode UI state (enter, reset, image removal)
  │   ├── noteService.js          # Delete + update note handlers (popup)
  │   ├── render.js               # renderElement + RenderNotes
  │   ├── toggleDark.js           # Dark mode toggle (shared by popup + dashboard)
  │   ├── urls.js                 # Active tab URL helpers (Promise-based)
  │   │
  │   ├── exportModal.js          # Export modal UI — site/format selection
  │   ├── exporter.js             # Export runner — orchestrates all format generators
  │   ├── importModal.js          # 3-step import modal — file ingestion, duplicate handling
  │   ├── buildPayload.js         # Shared JSON envelope builder (used by export + auto-backup)
  │   ├── autoBackupExporter.js   # Auto-backup scheduler — alarm setup, prefs, download trigger
  │   │
  │   └── exporters/
  │       ├── exportHelpers.js    # Shared helpers (filename, zip, blob, README text)
  │       ├── exportJSON.js       # JSON export
  │       ├── exportMD.js         # Markdown export
  │       ├── exportHTML.js       # Self-contained HTML export
  │       ├── exportCSV.js        # CSV export
  │       ├── exportTXT.js        # Plain text export
  │       ├── exportPDF.js        # PDF export (via jsPDF)
  │       └── exportXLSX.js       # XLSX export (via ExcelJS)
  │
  ├── libs/
  │   ├── jspdf.min.js            # jsPDF library (PDF generation)
  │   └── jszip.min.js            # JSZip library (ZIP generation)
  │
  └── assets/
      ├── icons/
      │   └── icon128.png         # Extension icon
      └── svgs/
          ├── darkMode.svg        # Theme toggle icon (shown in light mode)
          ├── lightMode.svg       # Theme toggle icon (shown in dark mode)
          ├── deleteCard.svg      # Delete site button icon (dashboard)
          ├── drag-image.svg      # Drag-and-drop image hint icon
          ├── nothingToShow.svg   # Empty state illustration
          └── lookingToShow.svg   # Loading state illustration
```

---

## 🗃️ Data Storage

All notes are stored in **IndexedDB** (`TheWebNoteDB`) via the background service worker. The database schema is:

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
  note:      string   // note text
  img:       string   // base64 image, compressed and resized to max 1200px (or null)
  priority:  string   // "important" | "medium" | "normal"
  createdAt: string   // formatted date string
  status:    string   // "pending"
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
| `NOTES_UPDATED` | `{ url }` | forwards to content script |
| `BACKUP_COMPLETED` | `{ filename, timestamp }` | broadcasts to open dashboard tabs |

The `updates` payload for `UPDATE_NOTE` accepts any subset of `{ note, img, priority }`. Fields not included are preserved from the stored note. If `priority` changes, the note is automatically moved between priority buckets in the database.

---

## 🔧 Development Notes

- **Manifest V3** — uses a service worker (`background.js`), not a background page
- **No build step** — plain ES modules, no bundler needed
- **Dark mode** — controlled by `data-theme` attribute on `<html>`, persisted in `localStorage` with key `webnote-theme`
- **Iframe popup** — `index.html` is loaded as an iframe inside `content.js` so the full popup UI appears floating on the page
- **Priority syntax** — parsed in `utils/inputProcess.js` (add) and `utils/helpers.js` (edit) by reading the last 4 characters of the input
- **Edit state** — all edit UI state lives in `utils/editHandler.js`; `popup.js` delegates to it entirely, keeping concerns separated
- **No extra fetch on edit** — the note to edit is looked up directly from the local in-memory cache in `popup.js`, so edit mode is instant with no network round-trip
- **Active tab URL** — `utils/urls.js` exports a Promise (`activeTabUrlPromise`) instead of a plain string to eliminate a race condition where the URL could be empty when the first note is saved
- **Image compression** — images are resized to a max of 1200px and compressed via canvas before storing: JPEG at 0.75 quality, PNG lossless resize only
- **Image viewer** — clicking a note image opens it full size in a new tab via a temporary blob URL; direct data URLs are blocked by Chrome's CSP
- **Fullscreen hide** — the toggle pill listens for `fullscreenchange` on `document` and sets `display: none` on enter, `display: flex` on exit
- **Export pipeline** — `utils/exporter.js` orchestrates all format generators; JSON is always emitted first, then each selected format runs in sequence with a 400 ms stagger to avoid download manager collisions; a shared `images.zip` is appended when MD, CSV, or TXT is included
- **JSON envelope** — the standard backup format is built by `utils/buildPayload.js`, which is shared by both manual export and auto-backup so the output schema is always identical; only the `backupType` field differs (`"export"` vs `"auto"`)
- **Auto-backup alarm** — `utils/autoBackupExporter.js` manages alarm scheduling via `chrome.alarms`; preferences are mirrored to both `localStorage` (for instant dashboard reads) and `chrome.storage.local` (so the background service worker can access them when the alarm fires)
- **Import deduplication** — `utils/importModal.js` compares incoming notes against existing IndexedDB data by note `id`; duplicates are surfaced in step 3 with per-note and per-site overwrite controls before any data is written

---

## ⚠️ Known Issues & Limitations

- **Notes are tied to the browser** — since data is stored in IndexedDB, clearing your browser data or cache will permanently delete all notes. Use the Export or Auto-backup feature to keep a copy safe
- **Uninstalling the extension deletes all data** — Chrome wipes all IndexedDB data scoped to the extension when it is uninstalled. Reinstalling will not recover your notes. Export your data before uninstalling
- **Chrome only** — Manifest V3 implementation differs between browsers; Firefox and Safari are not currently supported
- **`autofocus` blocked in iframe** — Chrome blocks autofocus on inputs inside cross-origin iframes, so the popup input is focused manually via `setTimeout` instead
- **Legacy uncompressed images** — images attached to notes before v1.1.1 are stored at full base64 size in IndexedDB. They will not be retroactively compressed. Re-attaching the image on an edit will compress it going forward

---

## ❓ FAQ

**Q: I installed the extension but I don't see the toggle button on websites.**
A: The floating pill only appears on sites where you have already saved at least one note. Visit a site, open the popup, add a note, then reload the page.

**Q: How do I update to a new version without losing my notes?**
A: Use the `update.bat` (Windows) or `update.sh` (Mac/Linux) script included in every release. Never uninstall the extension to update — that will permanently delete all your notes. Full instructions are in the [Installing Updates](#-installing-updates) section above.

**Q: Can I just uninstall and reinstall the new version?**
A: No — uninstalling the extension permanently deletes all your notes from Chrome's IndexedDB. There is currently no way to recover them after uninstalling. Always use the update script instead.

**Q: Chrome shows an error when I click Load unpacked.**
A: Make sure you are selecting the folder that directly contains `manifest.json`. If you see an error, open the extracted folder and check that `manifest.json` is at the root level of the folder you are selecting.

**Q: Where do I download the latest version?**
A: Always download from the [Releases page](../../releases) of this repository. Do not use the green Code → Download ZIP button as it creates a nested folder structure.

**Q: My notes disappeared after I cleared my browser data.**
A: Notes are stored in Chrome's IndexedDB. Clearing browser data (cookies, cache, site data) will erase them. Use the Export feature or enable Auto-backup to keep a JSON copy of your notes safe.

**Q: The priority tag isn't working — my note is showing as Normal.**
A: The tag must be the last 4 characters of the input with no space before it. For example `Read this #IMP` — note there is a space before `#IMP` which means the full tag including the space is `#IMP` and the parser reads the last 4 characters as `#IMP`. Make sure there are no trailing spaces after the tag. This applies to both adding and editing notes.

**Q: Can I change the priority of a note when editing it?**
A: Yes. While in edit mode, simply update the tag at the end of the text (e.g. change `#IMP` to `#MED`, or remove it entirely for Normal). The note will be moved to the correct priority bucket when you save.

**Q: Can I edit a note in the Dashboard?**
A: Not currently. The Edit button only appears in the popup. To edit a note, open the popup on the relevant site and click Edit there.

**Q: Can I use this on Firefox?**
A: Not currently. TheWebNote uses Chrome's Manifest V3 APIs which behave differently on Firefox. Firefox support is not planned in the near term.

**Q: Does TheWebNote send any data to a server?**
A: No. All notes are stored entirely on your device in IndexedDB. No data is ever sent to any external server. The only network request the extension makes is fetching website favicons from Google's favicon service for display in the dashboard.

**Q: The toggle pill disappeared and isn't coming back.**
A: If the page is in fullscreen mode, the pill hides automatically. Exit fullscreen and it will reappear immediately.

**Q: I added a note but it never appeared anywhere.**
A: This was a rare race condition in versions before v1.1.1 where the active tab URL hadn't resolved yet when the note was saved. This is fixed in v1.1.1 — update to the latest version using the update script.

**Q: How do I back up my notes automatically?**
A: Open the Dashboard, click the **Auto-backup** panel in the header, toggle it on, and choose an interval. The backup fires automatically in the background and saves a JSON file to your Downloads folder inside a `TheWebNote-Backup` subfolder. You can also do a one-time manual export at any time via the **Export** button.

**Q: Which export format should I use if I want to restore my notes later?**
A: Use **JSON** — it is the only format that the Import feature can read. All other formats (HTML, PDF, Markdown, etc.) are for archiving and reading only. JSON is always included in every export automatically.

**Q: I imported a backup but some notes show as duplicates. What does that mean?**
A: A duplicate is a note whose `id` already exists in your current data — it was previously imported or is the same note you already have. In the import results screen you can choose to skip duplicates, overwrite them all, or decide per note.

---

## 🛡️ Trust & Security

TheWebNote is a manually loaded extension, which means Chrome will show it as "unverified." Here is exactly what the extension does and does not do so you can make an informed decision before installing.

### What the extension can access
| Permission | Why it is needed |
|------------|-----------------|
| `activeTab` | To read the current tab's URL so notes are saved and loaded for the right website |
| `tabs` | To open the Dashboard in a new tab and to forward note-update events to the content script |
| `scripting` | To inject the floating toggle pill into web pages |
| `storage` | To persist auto-backup preferences so the background service worker can read them when an alarm fires |
| `downloads` | To save exported and auto-backup files directly to your Downloads folder |
| `alarms` | To schedule and fire periodic auto-backup events that survive browser restarts |
| `host_permissions` (`<all_urls>`) | Required for the content script to run on every website so the floating pill can appear wherever you have notes |

### What the extension does NOT do
- ❌ It does not read page content, form inputs, passwords, or any text on the pages you visit
- ❌ It does not make any network requests except fetching favicons from `https://www.google.com/s2/favicons` for display in the Dashboard — and no note data is included in that request
- ❌ It does not communicate with any external server, API, or database
- ❌ It does not use any analytics, crash reporting, or telemetry
- ❌ It does not track your browsing history or the sites you visit
- ❌ It does not inject ads or modify page content in any way

### Your data never leaves your device
All notes are stored entirely in your browser's **IndexedDB**, scoped to the extension's own origin (`chrome-extension://...`). No other website, extension, or external party can access this data.

### Verify it yourself
TheWebNote is fully open source. Every line of code is readable in this repository — there are no compiled bundles, no minified files, and no obfuscated logic. If you are technically inclined, you can audit the entire codebase before installing. The files loaded into Chrome are exactly the files you see here.

### The update scripts
`update.bat` and `update.sh` only copy files from the new release folder into your existing installation folder. They do not connect to the internet, do not run silently in the background, and stop executing the moment they finish copying. You can open either file in any text editor to read exactly what they do before running them.

---

TheWebNote is designed with privacy as a core principle:

- All note data is stored locally in your browser's **IndexedDB** — it never leaves your device
- No analytics, no telemetry, no tracking of any kind
- No account or sign-in required
- The only external request made is to `https://www.google.com/s2/favicons` to fetch website favicons for display in the dashboard — no note content is ever included in this request
- The extension requests only the permissions it needs: `storage`, `activeTab`, `tabs`, `scripting`, `downloads`, and `alarms`

---

## 🚧 Planned Features

- 📄 **Extract text from web pages** — select text on any page and save it directly as a note
- 🖼️ **Drag and drop images** — drag an image directly into the input field to attach it to a note
- 📸 **Screenshot webpage** — capture the current page and insert it directly as a note image
- 🖱️ **Draggable toggle pill** — drag the pill to any corner of the screen with position saved across sessions
- 🔁 **Sync across devices** — share notes between multiple machines
- 🎨 **Canvas drawing** — sketch and save drawings directly inside a note

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