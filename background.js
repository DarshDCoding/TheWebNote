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

// DELETE NOTE (O(n))

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


 
// UPDATE NOTE
// Finds the note by id (across all priority buckets), merges the updated
// fields, and moves it to a different priority bucket if priority changed.
 

function updateNote(url, noteId, updates) {
  return new Promise(async (resolve, reject) => {
    try {
      const siteData   = await getSiteNotes(url);
      const priorities = ["important", "medium", "normal"];

      let foundNote     = null;
      let oldPriority   = null;
      let foundIndex    = -1;

      // ── Find the note ──
      for (const priority of priorities) {
        const idx = siteData[priority].findIndex(n => n.id === noteId);
        if (idx !== -1) {
          foundNote   = siteData[priority][idx];
          oldPriority = priority;
          foundIndex  = idx;
          break;
        }
      }

      if (!foundNote) {
        // Note not found — reject so the caller can handle gracefully
        return reject(new Error(`Note ${noteId} not found`));
      }

      // ── Merge: keep existing fields, overwrite only what changed ──
      const updatedNote = {
        ...foundNote,
        note:     updates.note     !== undefined ? updates.note     : foundNote.note,
        img:      updates.img      !== undefined ? updates.img      : foundNote.img,
        priority: updates.priority !== undefined ? updates.priority : foundNote.priority,
        // id, createdAt, status are intentionally preserved unchanged
      };

      const newPriority = updatedNote.priority;

      // ── Remove from old bucket ──
      siteData[oldPriority].splice(foundIndex, 1);

      // ── Insert into (possibly new) bucket ──
      siteData[newPriority].push(updatedNote);

      // ── Persist ──
      const tx    = db.transaction("notes", "readwrite");
      const store = tx.objectStore("notes");
      const req   = store.put(siteData, url);

      req.onsuccess = () => resolve(siteData);
      req.onerror   = () => reject(req.error);

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
        (data.important?.length || 0) +
        (data.medium?.length || 0) +
        (data.normal?.length || 0);

      resolve(!!hasNotes);
    };

    req.onerror = () => reject(req.error);
  });
}

// GET ALL SITES (dashboard)

function getAllSites() {
  return new Promise((resolve, reject) => {
    const store = db.transaction("notes", "readonly").objectStore("notes");
    const sites = [];
    store.openCursor().onsuccess = (e) => {
      const cursor = e.target.result;
      if (cursor) {
        sites.push({ url: cursor.key, data: cursor.value });
        cursor.continue();
      } else {
        resolve(sites);
      }
    };
    store.openCursor().onerror = () => reject();
  });
}

// DELETE SITE (all notes for a url)

function deleteSite(url) {
  return new Promise((resolve, reject) => {
    const tx  = db.transaction("notes", "readwrite");
    const req = tx.objectStore("notes").delete(url);
    req.onsuccess = () => resolve();
    req.onerror   = () => reject(req.error);
  });
}

 
// MESSAGE ROUTER
 
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {

  // Forward NOTES_UPDATED to the active tab's content script
  if (request.action === "NOTES_UPDATED") {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]?.id) {
        chrome.tabs.sendMessage(tabs[0].id, {
          action: "NOTES_UPDATED",
          url: request.url,
        });
      }
    });
    sendResponse({ ok: true });
    return;
  }

  const actions = {
    ADD_NOTE:    () => addNote(request.url, request.note),
    DELETE_NOTE: () => deleteNote(request.url, request.id),
    GET_NOTES:   () => getSiteNotes(request.url),
    CHECK_SITE:  () => siteHasNotes(request.url),
    GET_ALL:     () => getAllSites(),
    DELETE_SITE: () => deleteSite(request.url),
    UPDATE_NOTE: () => updateNote(request.url, request.id, request.updates),
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