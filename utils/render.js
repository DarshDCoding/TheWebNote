export const renderElement = (note) => `
    <div class="task-card priority-${note.priority}">

        ${note.img ? `<img src="${note.img}" alt="Task Image" class="task-image">` : ""}
        <div class="task-content">
            <p class="task-desc">${note.note}</p>
            <div class="task-footer">
                <p class="btn-action date">${note.createdAt}</p>
                <div class= "btn-actions">
                  <!-- <button class="btn-action btn-edit" data-id="${note.id}">Edit</button> -->
                  <button class="btn-action btn-delete" data-id="${note.id}" data-url="${note._url || ''}">Delete</button>
                </div>
            </div>
        </div>
    </div>
`;

//version 2.0

export const RenderNotes = (
  data = { important: [], medium: [], normal: [] },
) => {

  //normalizing data...
  data = {
    important:[],
    medium:[],
    normal:[],
    ...(data || {})
  }

  const order = ["important", "medium", "normal"];

  const notes = order.flatMap((priority) => data[priority]);

  //adding placeholder for empty list.
  if (notes.length === 0) {
    RenderNothingToShow();
    return;
  }

  const html = order
    .map((priority) =>
      [...data[priority]] //not mutating the actual data.
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .map(renderElement)
        .join(""),
    )
    .join("");

  document.getElementById("task-container").innerHTML = html;
};

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
  taskContainer.innerHTML = `<img src="/assets/svgs/lookingToShow.svg" alt="looking to show image" id="placeholderImg">`
}