// ── utils/editHandler.js ──────────────────────────────────────────────────────
// Owns all edit-mode UI state.
// Imported by popup.js — never used in dashboard.

import { showImagePreview, resetImagePreview } from "./imageHandler.js";
import { fileToBase64, extractPriorityFromText } from "./helpers.js";

// ── DOM refs (resolved once; this module only loads inside index.html) ────────
const taskInputField    = document.getElementById("taskInputField");
const addTaskBtn        = document.getElementById("addTask");
const dashboardBtn      = document.getElementById("dashboardBtn");
const inputImageInput   = document.getElementById("inputImage");

// ── Edit state ────────────────────────────────────────────────────────────────
let isEditing     = false;
let editingNoteId = null;
let existingImage = null;   // base64 string from the saved note (may be null)
let newImageFile  = null;   // File chosen by user during edit (may be null)
let removeImage   = false;  // user explicitly removed image

// ── Public getters ────────────────────────────────────────────────────────────
export const getIsEditing     = () => isEditing;
export const getEditingNoteId = () => editingNoteId;

/**
 * Resolves the final image value to store when saving an edit:
 *   - removeImage === true          → null
 *   - new file picked               → convert to base64 and return
 *   - otherwise                     → keep existingImage (may be null)
 *
 * @returns {Promise<string|null>}
 */
export async function resolveEditImage() {
  if (removeImage)    return null;
  if (newImageFile)   return await fileToBase64(newImageFile);
  return existingImage;
}

/**
 * Call when the user picks a new image during edit mode.
 * Updates newImageFile and refreshes the preview.
 *
 * @param {File} file
 */
export function onEditImageSelected(file) {
  if (!isEditing) return;
  newImageFile  = file;
  removeImage   = false;
  showImagePreview(file);
}

// ── Enter edit mode ───────────────────────────────────────────────────────────

/**
 * Enters edit mode for the given note.
 * Populates the input field and image preview, then flips the button labels.
 *
 * @param {object} note  - full note object from background
 * @param {string} url   - current site URL (for Save Edit to use)
 */
export function enterEditMode(note) {
  isEditing     = true;
  editingNoteId = note.id;
  existingImage = note.img  || null;
  newImageFile  = null;
  removeImage   = false;

  // ── Populate text input ──
  // Re-attach priority tag so the user sees the full original string
  const priorityTag =
    note.priority === "important" ? "#IMP" :
    note.priority === "medium"    ? "#MED" : "";

  taskInputField.value = note.note
    ? note.note + (priorityTag ? priorityTag : "")
    : "";

  // Trigger auto-resize if the textarea uses it
  taskInputField.dispatchEvent(new Event("input"));

  // ── Populate image preview ──
  if (existingImage) {
    // Show the existing image in the preview container without touching
    // the file input (browsers forbid setting its value programmatically).
    _showBase64Preview(existingImage);
  } else {
    resetImagePreview();
  }

  // ── Flip buttons ──
  addTaskBtn.textContent = "Save Edit";
  addTaskBtn.classList.add("edit-active");
  dashboardBtn.classList.add("edit-secondary");

  // Dashboard btn becomes "Remove Image" when there is an image,
  // or "Cancel Edit" when there is none.
  _updateSecondaryBtn();

  taskInputField.focus();
}

// ── Reset (cancel or post-save) ───────────────────────────────────────────────

/**
 * Resets all edit state and restores the UI to Add mode.
 * Does NOT send any message to background — caller decides that.
 */
export function resetEditMode() {
  isEditing     = false;
  editingNoteId = null;
  existingImage = null;
  newImageFile  = null;
  removeImage   = false;

  taskInputField.value = "";
  taskInputField.dispatchEvent(new Event("input"));
  inputImageInput.value = "";
  resetImagePreview();

  addTaskBtn.textContent    = "+ Add Task";
  addTaskBtn.classList.remove("edit-active");
  dashboardBtn.textContent  = "Dashboard";
  dashboardBtn.classList.remove("edit-secondary");

  // Re-attach the original dashboard navigation listener by restoring the
  // button to its default click behaviour (handled in popup.js via the
  // exported flag getIsEditing).
  dashboardBtn.dataset.role = "dashboard";
}

// ── Internal helpers ──────────────────────────────────────────────────────────

/** Show a base64 string in the preview area without involving the file input. */
function _showBase64Preview(base64) {
  const previewImage        = document.getElementById("previewImage");
  const previewImgContainer = document.getElementById("previewImgContainer");

  previewImage.src = base64;
  previewImgContainer.style.setProperty("--preview-bg", `url(${base64})`);
  previewImgContainer.style.height = "300px";
}

/**
 * Updates the dashboard/secondary button label and its role data attribute
 * based on whether an image is currently present in the edit session.
 */
function _updateSecondaryBtn() {
  const hasImage = !!(existingImage || newImageFile) && !removeImage;

  if (hasImage) {
    dashboardBtn.textContent  = "Remove Image";
    dashboardBtn.dataset.role = "removeImage";
  } else {
    dashboardBtn.textContent  = "Cancel Edit";
    dashboardBtn.dataset.role = "cancelEdit";
  }
}

// /**
//  * Handles a click on the secondary (dashboard) button while in edit mode.
//  * - "removeImage" role  → clears image state and toggles button to Cancel Edit
//  * - "cancelEdit"  role  → calls resetEditMode()
//  *
//  * @returns {boolean} true if the click was consumed by edit mode, false otherwise
//  */
export function handleSecondaryBtnClick() {
  if (!isEditing) return false;

  const role = dashboardBtn.dataset.role;

  if (role === "removeImage") {
    existingImage = null;
    newImageFile  = null;
    removeImage   = true;
    inputImageInput.value = "";
    resetImagePreview();
    _updateSecondaryBtn();
    return true;
  }

  if (role === "cancelEdit") {
    resetEditMode();
    return true;
  }

  return false;
}