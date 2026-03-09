const taskInputField = document.getElementById("taskInputField");

export const InputProcessing = (getCurrentDateTime, currentImageURL) => {
  const trimmedValue = taskInputField.value.trim();
  let noteValue = null;
  let notePriority = null;

  if (!trimmedValue && !currentImageURL) return null;
  taskInputField.value = "";

  if (trimmedValue) {
    noteValue = trimmedValue.slice(0, -4);
    notePriority = trimmedValue.slice(-4).toUpperCase();
  }

  const formattedNote = {
    id: crypto.randomUUID(),
    note: noteValue,
    img: currentImageURL,
    createdAt: getCurrentDateTime(),
    status: "pending",
  };

  if (notePriority === "#IMP") {
    formattedNote.priority = "important";
  } else if (notePriority === "#MED") {
    formattedNote.priority = "medium";
  } else {
    formattedNote.note = trimmedValue;
    formattedNote.priority = "normal";
  }

  return formattedNote;
};
