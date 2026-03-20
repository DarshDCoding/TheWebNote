import { initTheme } from "./utils/toggleDark.js";
import { activeTabUrl, urlExtract } from "./utils/urls.js";
import { getCurrentDateTime } from "./utils/date.js";
import { InputProcessing } from "./utils/inputProcess.js";

import {
  showImagePreview,
  resetImagePreview,
  getCurrentImageURL,
} from "./utils/imageHandler.js";
import { deleteNote } from "./utils/noteService.js";

import {
  RenderNotes,
  RenderLookingToShow,
  RenderNothingToShow,
} from "./utils/render.js";

import { addGlobalEventListner } from "./utils/events.js";

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

document.getElementById("dashboardBtn").addEventListener("click", () => {
  chrome.tabs.create({ url: chrome.runtime.getURL("dashboard/dashboard.html") });
});

const handeSubmit = () => {
  const inputData = InputProcessing(getCurrentDateTime, getCurrentImageURL());

  if (!inputData) return;

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
      chrome.runtime.sendMessage({ action: "NOTES_UPDATED", url: urlExtract(activeTabUrl) });
    },
  );
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

addGlobalEventListner("click", ".btn-delete", (e) =>
  deleteNote(e, urlExtract(activeTabUrl), RenderNothingToShow),
);
loadNotes();

// Focus input manually (autofocus blocked in iframes)
setTimeout(() => taskInputField.focus(), 100);

initTheme();