# 📝 TheWebNote

A powerful browser extension that brings note-taking capabilities directly to your web browsing experience.

## ✨ Features

- 📌 Create and save notes while browsing  
- 📝 Add notes specific to individual websites  
- 🔔 See notes pop up automatically when you revisit a site  
- 🖼️ Store images and screenshots alongside your notes  
- 📂 View notes from all websites in one central dashboard  
- 🔒 **Complete data privacy** — the extension runs locally and your data never leaves your device

---

## 🚀 Installation (quick and simple)

### Download from GitHub (for non-technical users)
If you're not used to GitHub, don't worry – this is just like downloading any other file. Since you're already on the project page, follow these simple steps:

1. On the repository page, click the green **Code** button at the top right.
2. Choose **Download ZIP** from the dropdown menu.
3. Once the ZIP file finishes downloading, locate it (usually in your Downloads folder) and extract its contents to a folder on your computer (for example, your Desktop).

> 📌 Remember the location of the folder you just created – you'll need to select it in the next section.

### Load into Chrome
1. Open Chrome and go to `chrome://extensions`.
2. Turn on **Developer mode** using the toggle at the top right.
3. Click **Load unpacked**, choose the folder where you extracted the files (it should contain `manifest.json`), and click **Open**.
4. Once it appears in the list, the extension is installed; its icon will show in the toolbar.

![Installation Screenshot](screenshot-install.png)

That's it – TheWebNote is ready to use!


---

## 🚧 Future Plans

We’re constantly working to make TheWebNote even better. Upcoming features include:

- 🔁 Share note data between devices or with other people
- 🎨 Use a canvas tool to draw and save sketches directly in your notes

---

## 📁 Project Structure

```
TheWebNote/
├── manifest.json      # Extension configuration
├── background.js      # Background service worker
├── content.js         # Content script for web pages
├── dashboard.html     # Main dashboard interface
├── index.html         # Entry point
├── style.css          # Styling
├── icons/             # Extension icons
└── README.md          # This file
```

---

## � Future Plans

We’re constantly working to make TheWebNote even better. Upcoming features include:

- 🔁 Share note data between devices or with other people
- 🎨 Use a canvas tool to draw and save sketches directly in your notes

---

## �💡 How It Works

1. **Content Script** - Integrates with web pages you visit
2. **Dashboard** - Your central hub for managing notes
3. **Background Service** - Handles data persistence and extension logic

---

## 🎨 Customization

Feel free to customize the styles in `style.css` and extend functionality in `background.js` and `content.js`.

---

## 📄 License

Open source and free to use. Enjoy!

---

**Happy note-taking! 📚**