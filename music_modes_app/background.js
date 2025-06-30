// This script runs in the background of the extension.

// It listens for a click on the extension's action icon in the toolbar.
chrome.action.onClicked.addListener((tab) => {
  // When the icon is clicked, it opens the index.html page in a new tab.
  chrome.tabs.create({
    url: 'index.html'
  });
});

// --- REVISED: Listen for when the extension is about to be suspended or reloaded ---
chrome.runtime.onSuspend.addListener(() => {
  console.log("background.js: Extension is suspending. Forcing app tabs to close to ensure MIDI port cleanup.");

  // Find all open tabs that are part of our extension
  chrome.tabs.query({ url: chrome.runtime.getURL("index.html") }, (tabs) => {
    if (tabs && tabs.length > 0) {
      const tabIds = tabs.map(tab => tab.id);
      // By removing the tab, we force its 'beforeunload' event to fire,
      // which runs our cleanupMIDI() function. This is more reliable than messaging.
      chrome.tabs.remove(tabIds, () => {
        console.log("background.js: App tabs closed, MIDI port should now be released.");
      });
    }
  });
});
