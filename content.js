import { activeTabUrl, getActiveTabUrl, urlExtract } from "./utils/urls.js";
import { getCurrentDateTime } from "./utils/date.js";
import { dummyData } from "./utils/dummyData.js";
import { RenderNotes } from "./utils/render.js";
import {showImagePreview, resetImagePreview } from "./utils/helper.js";

//elements
const taskInputField = document.getElementById("taskInputField");
const addTaskbtn = document.getElementById("addTask");
const inputImage = document.getElementById("inputImage");

RenderNotes(dummyData)

//taking input
const InputProcessing = () => {
  let trimmedValue;
  let noteValue;
  let notePriority;

  if (taskInputField.value) {
    trimmedValue = String(taskInputField.value).trim();
    noteValue = trimmedValue.slice(0, -4);
    notePriority = trimmedValue.slice(-4).toUpperCase();
    taskInputField.value = "";
  }

  let formatedNote = {
    note: noteValue,
    createdAt: getCurrentDateTime(),
    status: "pending",
  };

  if (notePriority === "#IMP") {
    formatedNote.priority = "important";
  } else if (notePriority === "#MID") {
    formatedNote.priority = "medium";
  } else {
    formatedNote.note = trimmedValue;
    formatedNote.priority = "normal";
  }

  return formatedNote;
};

//preview the Image

inputImage.addEventListener("change", (event) => {

  const file = event.target.files[0];

  if (file) {
    showImagePreview(file);
  }
});


//Submit for keyboard Enter
taskInputField.addEventListener("keydown", (e) => {
  if (e.key == "Enter" && !e.shiftKey) {
    e.preventDefault();
    console.log(InputProcessing());
  }
});

//Submit for mouse
addTaskbtn.addEventListener("click", () => {
  InputProcessing();
  resetImagePreview();
});