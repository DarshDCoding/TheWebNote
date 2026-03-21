// ── utils/noteService.js ──────────────────────────────────────────────────────

// ── Delete note (unchanged) ───────────────────────────────────────────────────

export const deleteNote = (e, url, fallbackFunction) => {
  const deleteBtn = e.target.closest(".btn-delete");
  const RenderNothingToShow = fallbackFunction;

  const noteId   = deleteBtn.dataset.id;
  const taskCard = deleteBtn.closest(".task-card");

  taskCard.classList.add("task-fade-out");

  taskCard.addEventListener(
    "transitionend",
    () => {
      taskCard.remove();

      const remainingNotes = document.querySelectorAll(".task-card");
      remainingNotes.length === 0 && RenderNothingToShow;

      chrome.runtime.sendMessage(
        { action: "DELETE_NOTE", url: url, id: noteId },
        () => chrome.runtime.sendMessage({ action: "NOTES_UPDATED", url })
      );
    },
    { once: true },
  );
};

// ── Update (edit) note ────────────────────────────────────────────────────────

// /**
//  * Merges the edited fields into the stored note and sends UPDATE_NOTE to
//  * background.js. Returns a Promise that resolves with the updated siteData.
//  *
//  * @param {string} url          - site hostname key
//  * @param {string} noteId       - id of the note to update
//  * @param {object} updatedFields  - { note, img, priority }  (only changed fields)
//  * @returns {Promise<object>}   - resolves with full siteData from background
//  */
export function updateNote(url, noteId, updatedFields) {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage(
      {
        action:   "UPDATE_NOTE",
        url,
        id:       noteId,
        updates:  updatedFields,   // { note, img, priority }
      },
      (response) => {
        if (chrome.runtime.lastError) {
          return reject(new Error(chrome.runtime.lastError.message));
        }
        if (!response || response.error) {
          return reject(new Error(response?.error || "UPDATE_NOTE failed"));
        }
        resolve(response);
      }
    );
  });
}