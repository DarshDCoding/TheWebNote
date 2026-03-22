export const addGlobalEventListner = (type, selector, callback) =>{
    document.addEventListener(type, e =>{
        if (e.target.closest(selector)){
            callback(e)
        }
    })
}

export function initImageViewer() {
  addGlobalEventListner("click", ".note-image-view", (e) => {
    const dataUrl  = e.target.dataset.src;
    const byteString = atob(dataUrl.split(",")[1]);
    const mimeType   = dataUrl.split(",")[0].split(":")[1].split(";")[0];
    const ab         = new ArrayBuffer(byteString.length);
    const ia         = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    const blob    = new Blob([ab], { type: mimeType });
    const blobUrl = URL.createObjectURL(blob);
    window.open(blobUrl, "_blank");
  });
}