//elements
const taskInputField = document.getElementById("taskInputField");
const addTaskbtn = document.getElementById ("addTask");
const darshboardBtn = document.getElementById ("dashboardBtn");

//getting current date
function getCurrentDateTime() {
  const now = new Date();
  return now.toLocaleString(); 
}

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

    let formatedNote = {value:noteValue, createdAt: getCurrentDateTime(), status:"pending"}
    
    if (notePriority === "#imp"){
        formatedNote.priority = "important"
    }else if (notePriority === "#neu"){
        formatedNote.priority = "neutral"
    }else{
        formatedNote.priority = "normal"
    }

    return formatedNote
}

//Submit for keyboard Enter
taskInputField.addEventListener("keypress", e => {
    if (e.key == "Enter" && !e.shiftKey){
        e.preventDefault()
        console.log(InputProcessing())
    }
});

//Submit for mouse
addTaskbtn.addEventListener("click", ()=>InputProcessing())


// to get the url of active tab (hostname only)
async function getCurrentTabUrl() {
  let queryOptions = { active: true, currentWindow: true };
  let [tab] = await chrome.tabs.query(queryOptions); 

  let url = new URL(tab.url)
  return url.hostname;
}