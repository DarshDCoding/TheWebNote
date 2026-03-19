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

// DELETE NOTE (O(n)) will think in future for o

function deleteNote (url, noteId) {
  return new Promise(async (resolve, reject) => {

    try {

      const siteData = await getSiteNotes(url);

      const priorities = ["important", "medium", "normal"];

      for (const priority of priorities) {

        const index = siteData[priority].findIndex(
          note => note.id === noteId
        );

        if (index !== -1){

          siteData[priority].splice(index, 1);

          // check if all arrays are empty
          const isEmpty = 
          !siteData.important.length &&
          !siteData.medium.length &&
          !siteData.normal.length;

          const tx = db.transaction("notes", "readwrite");
          const store = tx.objectStore("notes");

          const req = isEmpty
          ? store.delete(url)
          : store.put(siteData, url);

          req.onsuccess = () => resolve(siteData);
          req.onerror = () => reject(req.error);

          return;
        }
      }
      resolve (siteData);

    } catch (err){
      reject(err)
    }
  })
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
        (data.important?.length || 0) +
        (data.medium?.length || 0) +
        (data.normal?.length || 0);

      resolve(!!hasNotes);
    };

    req.onerror = () => reject(req.error);
  });
}

 
// MESSAGE ROUTER
 
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {

  const actions = {
    ADD_NOTE: () => addNote(request.url, request.note),
    DELETE_NOTE: () => deleteNote(request.url, request.id),
    GET_NOTES: () => getSiteNotes(request.url),
    CHECK_SITE: () => siteHasNotes(request.url),
  };

  const action = actions[request.action];

  if (!action) {
    sendResponse({ error: "Unknown action" });
    return;
  }

  action()
    .then(sendResponse)
    .catch(err => sendResponse({ error: err.message }));

  return true; // keep message channel open for async response

});