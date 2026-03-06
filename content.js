import { activeTabUrl, getActiveTabUrl, urlExtract } from "./utils/urls.js";
import { getCurrentDateTime } from "./utils/date.js";
import { dummyData } from "./utils/dummyData.js";
//elements
const taskInputField = document.getElementById("taskInputField");
const addTaskbtn = document.getElementById("addTask");
const inputImage = document.getElementById("inputImage");
const previewImage = document.getElementById("previewImage");
const previewImgContainer = document.getElementById("previewImgContainer");

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

let renderNotes = "";

if (dummyData) {
  renderNotes += dummyData.important.map(note => renderElement(note)).join("");
  renderNotes += dummyData.medium.map(note =>renderElement(note)).join("");
  renderNotes += dummyData.normal.map(note => renderElement(note)).join("");
}

document.getElementById("task-container").innerHTML = renderNotes;