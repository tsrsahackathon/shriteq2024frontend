chrome.runtime.onInstalled.addListener(() => {
    console.log("Fake News Detector installed.");
    chrome.storage.sync.set({ factCheckEnabled: true });
  });
  
  // Handle extension icon click
  chrome.action.onClicked.addListener((tab) => {
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ['content.js']
    });
  });
  