const renderElement = (note) => `
    <div class="task-card priority-${note.priority}">

        ${note.img ? `<img src="${note.img}" alt="Task Image" class="task-image">` : ""}
        <div class="task-content">
            <p class="task-desc">${note.note}</p>
            <div class="task-footer">
                <p class="btn-action date">${note.createdAt}</p>
                <button class="btn-action btn-edit" data-id="${note.id}">Edit</button>
                <button class="btn-action btn-delete" data-id="${note.id}">Delete</button>
            </div>
        </div>
    </div>
`;

// rendering all elements.
export const RenderNotes = (data) =>{
  let renderNotes = Object.values(data)
  .flat()
  .sort((a,b)=> new Date(b.createdAt) - new Date(a.createdAt))
  .map(renderElement)
  .join("")
  document.getElementById("task-container").innerHTML = renderNotes;
}
