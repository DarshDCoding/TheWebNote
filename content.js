import { activeTabUrl, urlExtract } from "./utils/urls.js";
import { getCurrentDateTime } from "./utils/date.js";
import { RenderNotes, RenderNothingToShow, RenderLookingToShow } from "./utils/render.js";
import {
  showImagePreview,
  resetImagePreview,
  getCurrentImageURL,
} from "./utils/imageHandler.js";
import { InputProcessing } from "./utils/inputProcess.js";

//elements
const addTaskbtn = document.getElementById("addTask");
const inputImage = document.getElementById("inputImage");
const taskInputField = document.getElementById("taskInputField");
//preview the Image

let data = {
  important: [],
  medium: [],
  normal: [],
};

inputImage.addEventListener("change", (event) => {
  const file = event.target.files[0];

  if (file) {
    showImagePreview(file);
  }
});

const handeSubmit = () => {
  const inputData = InputProcessing(getCurrentDateTime, getCurrentImageURL());

  if (!inputData) return;

  // data[inputData.priority].push(inputData);

  resetImagePreview();

  chrome.runtime.sendMessage(
    {
      action: "ADD_NOTE",
      url: urlExtract(activeTabUrl),
      note: inputData,
    },
    (response) => {
      if (!response) {
        console.error("No response from background");
        return;
      }

      data = response;
      RenderNotes(data);
    },
  );

  // RenderNotes(data);
};

function loadNotes() {
  RenderLookingToShow();
  
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const site = urlExtract(tabs[0].url);

    chrome.runtime.sendMessage(
      {
        action: "GET_NOTES",
        url: site,
      },
      (response) => {
        if (!response) return;

        data = response;
        RenderNotes(data);
      },
    );
  });
}

//Submit for keyboard Enter
taskInputField.addEventListener("keydown", (e) => {
  if (e.key == "Enter" && !e.shiftKey) {
    e.preventDefault();
    handeSubmit();
  }
});

//Submit for mouse
addTaskbtn.addEventListener("click", handeSubmit);


//for handeling delete

document.addEventListener("click", (e) => {
  const deleteBtn = e.target.closest(".btn-delete");

  if (!deleteBtn) return;

  const noteId = deleteBtn.dataset.id;
  const taskCard = deleteBtn.closest(".task-card");

  taskCard.classList.add ("task-fade-out");

  taskCard.addEventListener("transitionend", ()=>{
    //remove form DOM 
    taskCard.remove()

    //to check if 0 notes are present.
    const remainingNotes = document.querySelectorAll(".task-card");
    remainingNotes.length === 0 && RenderNothingToShow();

    //update DB
    chrome.runtime.sendMessage(
      {
        action: "DELETE_NOTE",
        url: urlExtract(activeTabUrl),
        id: noteId,
      });
  }, {once: true})

});

loadNotes();
