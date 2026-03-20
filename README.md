# 📝 TheWebNote

A Chrome extension that lets you save notes on any website and automatically shows them the next time you visit. All data stays on your device — no accounts, no servers, no tracking.

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

## 🚀 Installation

### For non-technical users

1. On this GitHub page, click the green **Code** button → **Download ZIP**
2. Once downloaded, locate the ZIP (usually in your Downloads folder) and extract it
3. After extracting, you will see a folder named **TheWebNote** — open it. Inside you will find **another folder also named TheWebNote**. This inner folder is the one that contains `manifest.json` — that is the folder you need to load into Chrome
4. Open Chrome and go to `chrome://extensions`
5. Enable **Developer mode** using the toggle at the top right
6. Click **Load unpacked** and select the **inner TheWebNote folder** (the one that contains `manifest.json`)
7. TheWebNote icon will appear in your Chrome toolbar — you're ready to go!

> ⚠️ **Important:** Make sure you select the inner folder that directly contains `manifest.json`, not the outer wrapper folder. Chrome will show an error if you select the wrong one.

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
        │   └── icon128.png     # Extension icon
        └── svgs/
            ├── darkMode.svg        # Theme toggle icon (shown in light mode)
            ├── lightMode.svg       # Theme toggle icon (shown in dark mode)
            ├── nothingToShow.svg   # Empty state illustration
            └── lookingToShow.svg   # Loading state illustration
```

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

## 🚧 Planned Features

- 📄 **Extract text from web pages** — select text on any page and save it directly as a note
- 📤 **Export notes** — download your note data in JSON, Markdown, plain text, or PDF format
- 📥 **Import notes** — import previously exported data with automatic duplicate detection and conflict resolution
- 🔁 **Sync across devices** — share notes between multiple machines
- 🎨 **Canvas drawing** — sketch and save drawings directly inside a note

---

## 📄 License

Open source and free to use. Enjoy!

---

**Happy note-taking! 📚**