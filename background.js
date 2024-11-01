/**
 * Chrome Extension Background Script
 * Will run in the background of the Chrome extension.
 */

chrome.runtime.onInstalled.addListener(({ reason, previousVersion }) => {
    // Set the default upon installation
    chrome.storage.sync.set({
        // Video Length
        doFadeByLength: true, // Default: enable filter by video length
        videoLengthMin: 0, // Default: minimum length 0 minutes
        videoLengthMax: 30, // Default: maximum length 30 minutes
    });
});
