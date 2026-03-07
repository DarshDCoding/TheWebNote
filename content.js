import { activeTabUrl, getActiveTabUrl, urlExtract } from "./utils/urls.js";
import { getCurrentDateTime } from "./utils/date.js";
import { dummyData } from "./utils/dummyData.js";
import { RenderNotes } from "./utils/render.js";
//elements
const taskInputField = document.getElementById("taskInputField");
const addTaskbtn = document.getElementById("addTask");
const inputImage = document.getElementById("inputImage");
const previewImage = document.getElementById("previewImage");
const previewImgContainer = document.getElementById("previewImgContainer");

RenderNotes(dummyData)

//taking input
const InputProcessing = () => {
  let trimmedValue;
  let noteValue;
  let notePriority;

  if (taskInputField.value) {
    trimmedValue = String(taskInputField.value).trim();
    noteValue = trimmedValue.slice(0, -4);
    notePriority = trimmedValue.slice(-4);
    taskInputField.value = "";
  }

  let formatedNote = {
    note: noteValue,
    createdAt: getCurrentDateTime(),
    status: "pending",
  };

  if (notePriority === "#imp") {
    formatedNote.priority = "important";
  } else if (notePriority === "#neu") {
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

  console.log(file)


  if (file) {
    const imageUrl = URL.createObjectURL(file);
    previewImage.src = imageUrl;
    previewImgContainer.style.setProperty("--preview-bg", `url(${imageUrl})`);
    previewImgContainer.style.height = "300px";
  }
});

//Submit for keyboard Enter
taskInputField.addEventListener("keypress", (e) => {
  if (e.key == "Enter" && !e.shiftKey) {
    e.preventDefault();
    console.log(InputProcessing());
  }
});

//Submit for mouse
addTaskbtn.addEventListener("click", () => {
  InputProcessing();
  previewImage.src = "";
  previewImgContainer.style.height = "0px";
});

