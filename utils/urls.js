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

export {activeTabUrl, getActiveTabUrl, urlExtract};