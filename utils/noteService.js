export const deleteNote = (e, url, fallbackFunction) => {
  const deleteBtn = e.target.closest(".btn-delete");
  const RenderNothingToShow = fallbackFunction

  const noteId = deleteBtn.dataset.id;
  const taskCard = deleteBtn.closest(".task-card");

  taskCard.classList.add("task-fade-out");

  taskCard.addEventListener(
    "transitionend",
    () => {
      taskCard.remove();

      const remainingNotes = document.querySelectorAll(".task-card");
      remainingNotes.length === 0 && RenderNothingToShow;

      chrome.runtime.sendMessage({
        action: "DELETE_NOTE",
        url: url,
        id: noteId,
      });
    },
    { once: true },
  );
};