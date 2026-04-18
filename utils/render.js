// // ── utils/render.js ───────────────────────────────────────────────────────────

import { PRIORITIES, EMPTY_SITE_DATA } from "./constants.js";

/**
 * Renders a single note card.
 *
 * The Edit button carries `data-id` only; it is hidden automatically when the
 * card is rendered inside the dashboard by the `.dashboard-note` class added
 * via the `context` parameter.
 *
 * @param {object}  note
 * @param {string}  [context="popup"]  - pass "dashboard" to suppress Edit btn
//  */
export const renderElement = (note, context = "popup") => {
  const isDashboard = context === "dashboard";

  return `
    <div class="task-card priority-${note.priority}${isDashboard ? " dashboard-note" : ""}">

${note.img ? `<img src="${note.img}" alt="Task Image" class="task-image note-image-view" data-src="${note.img}">` : ""}
        <div class="task-content">
${note.note != null && note.note !== "" ? `            <p class="task-desc">${note.note}</p>` : ""}
            <div class="task-footer">
                <p class="btn-action date">${note.createdAt}</p>
                <div class="btn-actions">
                  ${
                    !isDashboard
                      ? `<button class="btn-action btn-edit" data-id="${note.id}">Edit</button>`
                      : ""
                  }
                  <button class="btn-action btn-delete" data-id="${note.id}" data-url="${note._url || ""}">Delete</button>
                </div>
            </div>
        </div>
    </div>
  `;
};

// ── RenderNotes (popup) ───────────────────────────────────────────────────────

export const RenderNotes = (
  data = { ...EMPTY_SITE_DATA },
) => {
  // Normalise data
  data = {
    ...EMPTY_SITE_DATA,
    ...(data || {}),
  };

  const notes = PRIORITIES.flatMap((priority) => data[priority]);

  if (notes.length === 0) {
    RenderNothingToShow();
    return;
  }

  const html = PRIORITIES
    .map((priority) =>
      [...data[priority]]
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .map((note) => renderElement(note, "popup")) // explicit context
        .join(""),
    )
    .join("");

  document.getElementById("task-container").innerHTML = html;
};

// ── Shared container styling helper ──────────────────────────────────────────

const StylingTaskContainer = () => {
  const taskContainer = document.getElementById("task-container");
  taskContainer.style.display = "flex";
  taskContainer.style.justifyContent = "center";
  taskContainer.style.alignItems = "center";
  taskContainer.style.flexDirection = "column";
  return taskContainer;
};

export const RenderNothingToShow = () => {
  const taskContainer = StylingTaskContainer();
  taskContainer.innerHTML = `<img src="/assets/svgs/nothingToShow.svg" alt="nothing to show image" id="placeholderImg">`;
};

export const RenderLookingToShow = () => {
  const taskContainer = StylingTaskContainer();
  taskContainer.innerHTML = `<img src="/assets/svgs/lookingToShow.svg" alt="looking to show image" id="placeholderImg">`;
};