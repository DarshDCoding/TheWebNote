export const activeTabUrlPromise = new Promise((resolve) => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    resolve(tabs[0]?.url || "");
  });
});

export const urlExtract = (url) => {
  const urlArray = url.split("/");
  return urlArray[2];
};