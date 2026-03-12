// OPEN DATABASE
let db;

const request = indexedDB.open("TheWebNoteDB", 1);

request.onupgradeneeded = (event) => {
  db = event.target.result;

  if (!db.objectStoreNames.contains("notes")) {
    db.createObjectStore("notes"); // url will be the key
  }

  console.log("DB setup complete");
};

request.onsuccess = (event) => {
  db = event.target.result;
  console.log("Database ready");
};

request.onerror = (e) => {
  console.error("DB error:", e.target.error);
};



 
// GET NOTES (O(1))
 

function getSiteNotes(url) {
  return new Promise((resolve, reject) => {

    const tx = db.transaction("notes", "readonly");
    const store = tx.objectStore("notes");

    const req = store.get(url);   // O(1) lookup

    req.onsuccess = () => {
      resolve(req.result || {
        important: [],
        medium: [],
        normal: []
      });
    };

    req.onerror = () => reject(req.error);
  });
}



 
// ADD NOTE
 

function addNote(url, note) {
  return new Promise(async (resolve, reject) => {

    try {

      const siteData = await getSiteNotes(url);

      siteData[note.priority].push(note);

      const tx = db.transaction("notes", "readwrite");
      const store = tx.objectStore("notes");

      const req = store.put(siteData, url);

      req.onsuccess = () => resolve(siteData);
      req.onerror = () => reject(req.error);

    } catch (err) {
      reject(err);
    }

  });
}



 
// CHECK IF SITE HAS NOTES (O(1))
 

function siteHasNotes(url) {
  return new Promise((resolve, reject) => {

    const tx = db.transaction("notes", "readonly");
    const store = tx.objectStore("notes");

    const req = store.get(url);   // O(1)

    req.onsuccess = () => {

      const data = req.result;

      if (!data) {
        resolve(false);
        return;
      }

      const hasNotes =
        data.important.length ||
        data.medium.length ||
        data.normal.length;

      resolve(!!hasNotes);
    };

    req.onerror = () => reject(req.error);
  });
}



 
// MESSAGE ROUTER
 

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {

  if (request.action === "ADD_NOTE") {

    addNote(request.url, request.note)
      .then(data => sendResponse(data));

  }

  if (request.action === "GET_NOTES") {
    console.log ("GET_NOTES request:", request.url);
    getSiteNotes(request.url)
      .then(data => sendResponse(data));

      return true;

  }

  if (request.action === "CHECK_SITE") {

    siteHasNotes(request.url)
      .then(result => sendResponse(result));

  }

  return true; // required for async response
});