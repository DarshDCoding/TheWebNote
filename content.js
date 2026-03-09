import { activeTabUrl, getActiveTabUrl, urlExtract } from "./utils/urls.js";
import { getCurrentDateTime } from "./utils/date.js";
import { dummyData } from "./utils/dummyData.js";
import { RenderNotes } from "./utils/render.js";
import {showImagePreview, resetImagePreview, getCurrentImageURL } from "./utils/imageHandler.js";
import { InputProcessing } from "./utils/inputProcess.js";

//elements
const addTaskbtn = document.getElementById("addTask");
const inputImage = document.getElementById("inputImage");


//preview the Image

let data = {
  important:[],
  medium:[],
  normal:[]
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

      data[inputData.priority].push(inputData);

      resetImagePreview();
      RenderNotes(data);
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