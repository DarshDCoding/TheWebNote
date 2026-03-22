import { initTheme } from "./utils/toggleDark.js";
import { activeTabUrlPromise, urlExtract } from "./utils/urls.js";
import { getCurrentDateTime } from "./utils/date.js";
import { InputProcessing } from "./utils/inputProcess.js";
import {
  showImagePreview,
  resetImagePreview,
  getCurrentImageURL,
} from "./utils/imageHandler.js";
import { deleteNote, updateNote } from "./utils/noteService.js";
import {
  RenderNotes,
  RenderLookingToShow,
  RenderNothingToShow,
} from "./utils/render.js";
import { addGlobalEventListner, initImageViewer } from "./utils/events.js";
import { extractPriorityFromText } from "./utils/helpers.js";
import {
  getIsEditing,
  getEditingNoteId,
  resolveEditImage,
  onEditImageSelected,
  enterEditMode,
  resetEditMode,
  handleSecondaryBtnClick,
} from "./utils/editHandler.js";

// ── DOM refs ──────────────────────────────────────────────────────────────────
const addTaskBtn = document.getElementById("addTask");
const inputImage = document.getElementById("inputImage");
const taskInputField = document.getElementById("taskInputField");
const dashboardBtn = document.getElementById("dashboardBtn");

// ── Shared note data cache ────────────────────────────────────────────────────
let data = { important: [], medium: [], normal: [] };

// ── Image input ───────────────────────────────────────────────────────────────
inputImage.addEventListener("change", (event) => {
  const file = event.target.files[0];
  if (!file) return;

  if (getIsEditing()) {
    // In edit mode, delegate to editHandler so state is tracked correctly
    onEditImageSelected(file);
  } else {
    showImagePreview(file);
  }
});

// ── Dashboard / secondary button ──────────────────────────────────────────────
dashboardBtn.addEventListener("click", () => {
  // In edit mode this button is "Remove Image" or "Cancel Edit"
  if (handleSecondaryBtnClick()) return;

  // Normal mode → open dashboard tab
  chrome.tabs.create({
    url: chrome.runtime.getURL("dashboard/dashboard.html"),
  });
});

// ── Primary button: Add Note OR Save Edit ─────────────────────────────────────
const handleSubmit = async () => {
  if (getIsEditing()) {
    await handleSaveEdit();
  } else {
    handleAddNote();
  }
};

// ── Add note (original flow, unchanged) ──────────────────────────────────────
async function handleAddNote() {
  const activeTabUrl = await activeTabUrlPromise;
  const inputData = InputProcessing(getCurrentDateTime, getCurrentImageURL());
  if (!inputData) return;

  resetImagePreview();

  chrome.runtime.sendMessage(
    { action: "ADD_NOTE", url: urlExtract(activeTabUrl), note: inputData },
    (response) => {
      if (!response) {
        console.error("No response from background");
        return;
      }
      data = response;
      RenderNotes(data);
      chrome.runtime.sendMessage({
        action: "NOTES_UPDATED",
        url: urlExtract(activeTabUrl),
      });
    },
  );
}

// ── Save edit ─────────────────────────────────────────────────────────────────
async function handleSaveEdit() {
  const activeTabUrl = await activeTabUrlPromise;
  const url = urlExtract(activeTabUrl);
  const noteId = getEditingNoteId();
  const raw = taskInputField.value.trim();

  // Resolve text + priority (priority tag in text overrides stored one)
  let noteText = null;
  let priority = null;

  if (raw) {
    const parsed = extractPriorityFromText(raw);
    noteText = parsed.noteText || null;
    priority = parsed.priority;
  } else {
    // No text — keep existing priority; we need it from stored data
    // Find the note in the local cache to retrieve its current priority
    const allNotes = [...data.important, ...data.medium, ...data.normal];
    const existing = allNotes.find((n) => n.id === noteId);
    priority = existing?.priority || "normal";
  }

  // Resolve final image
  const img = await resolveEditImage();

  // Nothing to save if both text and image are gone
  if (!noteText && !img) {
    resetEditMode();
    return;
  }

  const updates = { note: noteText, img, priority };

  try {
    const updatedData = await updateNote(url, noteId, updates);
    data = updatedData;
    resetEditMode();
    RenderNotes(data);
    chrome.runtime.sendMessage({ action: "NOTES_UPDATED", url });
  } catch (err) {
    console.error("Save edit failed:", err.message);
    // Stay in edit mode — do not reset so the user doesn't lose their work
  }
}

// ── Load notes on popup open ──────────────────────────────────────────────────
function loadNotes() {
  RenderLookingToShow();

  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const site = urlExtract(tabs[0].url);

    chrome.runtime.sendMessage(
      { action: "GET_NOTES", url: site },
      (response) => {
        if (!response) return;
        data = response;
        RenderNotes(data);
      },
    );
  });
}

// ── Keyboard submit ───────────────────────────────────────────────────────────
taskInputField.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    handleSubmit();
  }
});

// ── Mouse submit ──────────────────────────────────────────────────────────────
addTaskBtn.addEventListener("click", handleSubmit);

// ── Delete handler ────────────────────────────────────────────────────────────
addGlobalEventListner("click", ".btn-delete", async (e) => {
  const activeTabUrl = await activeTabUrlPromise;
  deleteNote(e, urlExtract(activeTabUrl), RenderNothingToShow);
});

// ── Edit button handler ───────────────────────────────────────────────────────
addGlobalEventListner("click", ".btn-edit", (e) => {
  const btn = e.target.closest(".btn-edit");
  const noteId = btn.dataset.id;

  // Find the note in the local cache — no extra network call needed
  const allNotes = [...data.important, ...data.medium, ...data.normal];
  const note = allNotes.find((n) => n.id === noteId);

  if (!note) {
    console.warn("TheWebNote: note not found for edit, id =", noteId);
    // Do not enter edit mode — stay in Add mode as per spec
    return;
  }

  enterEditMode(note);
});

addGlobalEventListner("click", ".note-image-view", (e) => {
  window.open(e.target.dataset.src, "_blank");
});

// ── Init ──────────────────────────────────────────────────────────────────────
loadNotes();
initImageViewer();
setTimeout(() => taskInputField.focus(), 100);
initTheme();
