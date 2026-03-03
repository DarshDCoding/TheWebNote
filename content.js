//elements
const taskInputField = document.getElementById("taskInputField");
const addTaskbtn = document.getElementById ("addTask");
const darshboardBtn = document.getElementById ("dashboardBtn");

//taking input
const InputProcessing = () =>{
    let trimmedValue;
    let noteValue;
    let notePriority;

    if (taskInputField.value){

        trimmedValue = String(taskInputField.value).trim()
        noteValue = trimmedValue.slice(0,-4)
        notePriority = trimmedValue.slice(-4, )
        // console.log(noteValue)
        // console.log (notePriority)
        taskInputField.value =""
    }
    
    if (notePriority === "#imp"){
        return {value:noteValue, priority:"important", status:"pending"};
    }else if (notePriority === "#neu"){
        return {value: noteValue, priority:"neutral", status:"pending"};
    }else{
        return {value: noteValue, priority:"normal", status:"pending"};
    }
}

//for keyboard Enter
taskInputField.addEventListener("keypress", e => {
    if (e.key == "Enter" && !e.shiftKey){
        e.preventDefault()
        console.log(InputProcessing().priority)
    }
});

//for mouse
addTaskbtn.addEventListener("click", ()=>InputProcessing())


// to get the url of active tab (hostname only)
async function getCurrentTabUrl() {
  let queryOptions = { active: true, currentWindow: true };
  let [tab] = await chrome.tabs.query(queryOptions); 

  let url = new URL(tab.url)
  return url.hostname;
}