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
