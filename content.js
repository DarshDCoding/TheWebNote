//elements
const taskInputField = document.getElementById("taskInputField");
const addTaskbtn = document.getElementById ("addTask");
const darshboardBtn = document.getElementById ("dashboardBtn");
const inputImage = document.getElementById("inputImage");
const previewImage = document.getElementById("previewImage");
const previewImgContainer = document.getElementById("previewImgContainer");
const imageInputIcon = document.getElementById("imageInputIcon");

//getting current date
function getCurrentDateTime() {
  const now = new Date();

  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  let hours = now.getHours();
  const minutes = String(now.getMinutes()).padStart(2, "0");
  const seconds = String(now.getSeconds()).padStart(2, "0");

  const ampm = hours >= 12 ? "PM" : "AM";

  hours = hours % 12;
  hours = hours ? hours : 12; // 0 becomes 12
  hours = String(hours).padStart(2, "0");

  return `${day}-${month}-${year} ${hours}:${minutes}:${seconds} ${ampm}`;
}

// to get the url of active tab (hostname only)
let activeTabUrl = "";

const getActiveTabUrl = (callback) => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const activeTab = tabs[0];
    const activeTabUrl = activeTab.url;
    callback(activeTabUrl);
  });
};

getActiveTabUrl((url) => {
  activeTabUrl = url;
});

const urlExtract = (url) => {
  const urlArray = url.split("/");
  return urlArray[2];
};


//taking input
const InputProcessing = () =>{
    let trimmedValue;
    let noteValue;
    let notePriority;

    if (taskInputField.value){
        trimmedValue = String(taskInputField.value).trim()
        noteValue = trimmedValue.slice(0,-4)
        notePriority = trimmedValue.slice(-4, )
        taskInputField.value =""
    }

    let formatedNote = {note:noteValue, createdAt: getCurrentDateTime(), status:"pending"}
    
    if (notePriority === "#imp"){
        formatedNote.priority = "important"
    }else if (notePriority === "#neu"){
        formatedNote.priority = "neutral"
    }else{
        formatedNote.note = trimmedValue
        formatedNote.priority = "normal"
    }

    return formatedNote
}

//preview the Image
inputImage.addEventListener('change',()=>{
    const file = inputImage.files[0];

    if (file) {
        const imageUrl = URL.createObjectURL(file);
        previewImage.src = imageUrl;
        previewImgContainer.style.setProperty('--preview-bg', `url(${imageUrl})`);
        previewImgContainer.style.height= "300px";
    }
});

//Submit for keyboard Enter
taskInputField.addEventListener("keypress", e => {
    if (e.key == "Enter" && !e.shiftKey){
        e.preventDefault()
        console.log(InputProcessing())
    }
});

//Submit for mouse
addTaskbtn.addEventListener("click", ()=>{
    InputProcessing()
    previewImage.src = ""
    previewImgContainer.style.height="0px";
}
)



// opeining database
let db;

const request = indexedDB.open("TheWebNoteDB", 1)

request.onupgradeneeded = event =>{
    db = event.target.result;

  if (!db.objectStoreNames.contains("notes")) {
    const store = db.createObjectStore("notes", { keyPath: "url" });
  }
    console.log ("DB Setup complete.")
}

request.onsuccess = event =>{
    db = event.target.result;
    console.log ("Database Created...");
}

request.onerror = e => console.error(`Database Error: ${e.target.error?.message}`)




