<div align="center">

# 📝 TheWebNote

The web has no memory — until now. Leave notes on any website and find them waiting, right where they belong.

![Version](https://img.shields.io/badge/version-1.0.0-blue)
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
- 🔴🟡⚫ Three priority levels — **Important**, **Medium**, **Normal**
- 🖼️ Attach images to your notes
- 🔔 Floating toggle button appears automatically on sites that have notes
- 📂 Central dashboard to view, manage and delete notes across all sites
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

> TheWebNote uses **Manifest V3** which requires Chrome 88 or higher. If you are on an older version of Chrome, please update before installing.

---

## 📋 Prerequisites

- **Google Chrome** version 88 or higher
- No Node.js, no npm, no build step — the extension runs as plain ES modules

---

## 🚀 Installation

### Step 1 — Download

1. Go to the [**Releases page**](../../releases) of this repository
2. Find the latest release and download the `.rar` file listed under **Assets**

### Step 2 — Extract

Extract the `.rar` file to a folder on your computer (e.g. Desktop).

> 💡 To open `.rar` files you need a tool like [WinRAR](https://www.rarlab.com/) (Windows) or [The Unarchiver](https://theunarchiver.com/) (Mac). Most Linux systems support it natively via `unrar`.

### Step 3 — Load into Chrome

1. Open Chrome and go to `chrome://extensions`
2. Enable **Developer mode** using the toggle at the top right
3. Click **Load unpacked** and select the extracted folder (the one that contains `manifest.json`)
4. TheWebNote icon will appear in your Chrome toolbar — you're ready to go!


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

### Floating toggle pill
When you visit a site that has saved notes, a pill-shaped button appears in the bottom-right corner. It shows the count of notes per priority. Clicking it opens the popup as a floating iframe over the page.

### Dashboard
Click **Dashboard** in the popup to open the full dashboard in a new tab. It shows all notes grouped by website. Each site card displays notes in a horizontal grid (min 300px per card). Up to 5 notes are shown by default with a **Show all** toggle for the rest.

---

## 🗂️ Project Structure

```
TheWebNote/                     # outer folder (created by ZIP extraction)
└── TheWebNote/                 # inner folder — load THIS into Chrome
    │
    ├── manifest.json           # Extension config (MV3)
    ├── background.js           # Service worker — IndexedDB + message router
    ├── content.js              # Injected into every page — floating toggle pill
    │
    ├── index.html              # Popup UI
    ├── popup.js                # Popup logic
    ├── style.css               # Shared base styles (light mode)
    ├── darkMode.css            # All dark mode overrides ([data-theme="dark"])
    │
    ├── dashboard/
    │   ├── dashboard.html      # Dashboard page
    │   ├── dashboard.js        # Dashboard logic
    │   └── dashboard.css       # Dashboard-specific styles
    │
    ├── utils/
    │   ├── date.js             # Date/time formatting
    │   ├── events.js           # Global event delegation helper
    │   ├── imageHandler.js     # Image preview in popup
    │   ├── inputProcess.js     # Parses note input + priority tags
    │   ├── noteService.js      # Delete note handler (popup)
    │   ├── render.js           # renderElement + RenderNotes
    │   ├── toggleDark.js       # Dark mode toggle (shared by popup + dashboard)
    │   └── urls.js             # Active tab URL helpers
    │
    └── assets/
        ├── icons/
        │   └── icon128.png         # Extension icon
        └── svgs/
            ├── darkMode.svg        # Theme toggle icon (shown in light mode)
            ├── lightMode.svg       # Theme toggle icon (shown in dark mode)
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
  img:       string   // base64 image (or null)
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
| `GET_NOTES` | `{ url }` | `siteData` |
| `CHECK_SITE` | `{ url }` | `boolean` |
| `GET_ALL` | — | `[{ url, data }]` |
| `DELETE_SITE` | `{ url }` | — |
| `NOTES_UPDATED` | `{ url }` | forwards to content script |

---

## 🔧 Development Notes

- **Manifest V3** — uses a service worker (`background.js`), not a background page
- **No build step** — plain ES modules, no bundler needed
- **Dark mode** — controlled by `data-theme` attribute on `<html>`, persisted in `localStorage` with key `webnote-theme`
- **Iframe popup** — `index.html` is loaded as an iframe inside `content.js` so the full popup UI appears floating on the page
- **Priority syntax** — parsed in `utils/inputProcess.js` by reading the last 4 characters of the input

---

## ⚠️ Known Issues & Limitations

- **Notes are tied to the browser** — since data is stored in IndexedDB, clearing your browser data or cache will permanently delete all notes. There is no backup mechanism yet
- **Chrome only** — Manifest V3 implementation differs between browsers; Firefox and Safari are not currently supported
- **`autofocus` blocked in iframe** — Chrome blocks autofocus on inputs inside cross-origin iframes, so the popup input is focused manually via `setTimeout` instead
- **Image storage** — images are stored as base64 strings in IndexedDB. Very large images may slow down reads. Compression is not applied currently
- **No edit functionality** — notes can only be created or deleted, not edited after creation

---

## ❓ FAQ

**Q: I installed the extension but I don't see the toggle button on websites.**
A: The floating pill only appears on sites where you have already saved at least one note. Visit a site, open the popup, add a note, then reload the page.

**Q: Chrome shows an error when I click Load unpacked.**
A: Make sure you are selecting the folder that directly contains `manifest.json`. If you see an error, open the extracted folder and check that `manifest.json` is at the root level of the folder you are selecting.

**Q: I can't open the `.rar` file.**
A: You need an extraction tool. Download [WinRAR](https://www.rarlab.com/) on Windows or [The Unarchiver](https://theunarchiver.com/) on Mac. On Linux, run `sudo apt install unrar` then `unrar x filename.rar`.

**Q: Where do I download the latest version?**
A: Always download from the [Releases page](../../releases) of this repository. Do not use the green Code → Download ZIP button as it creates a nested folder structure.

**Q: My notes disappeared after I cleared my browser data.**
A: Notes are stored in Chrome's IndexedDB. Clearing browser data (cookies, cache, site data) will erase them. Until an export feature is added, avoid clearing site data for `chrome-extension://` origins.

**Q: The priority tag isn't working — my note is showing as Normal.**
A: The tag must be the last 4 characters of the input with no space before it. For example `Read this #IMP` — note there is a space before `#IMP` which means the full tag including the space is `#IMP` and the parser reads the last 4 characters as `#IMP`. Make sure there are no trailing spaces after the tag.

**Q: Can I use this on Firefox?**
A: Not currently. TheWebNote uses Chrome's Manifest V3 APIs which behave differently on Firefox. Firefox support is not planned in the near term.

**Q: Does TheWebNote send any data to a server?**
A: No. All notes are stored entirely on your device in IndexedDB. No data is ever sent to any external server. The only network request the extension makes is fetching website favicons from Google's favicon service for display in the dashboard.

---

## 🔒 Privacy

TheWebNote is designed with privacy as a core principle:

- All note data is stored locally in your browser's **IndexedDB** — it never leaves your device
- No analytics, no telemetry, no tracking of any kind
- No account or sign-in required
- The only external request made is to `https://www.google.com/s2/favicons` to fetch website favicons for display in the dashboard — no note content is ever included in this request
- The extension requests only the permissions it needs: `storage`, `activeTab`, `tabs`, and `scripting`

---

## 🚧 Planned Features

- 📄 **Extract text from web pages** — select text on any page and save it directly as a note
- 📤 **Export notes** — download your note data in JSON, Markdown, plain text, or PDF format
- 📥 **Import notes** — import previously exported data with automatic duplicate detection and conflict resolution
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