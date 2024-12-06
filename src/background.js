/**
 * Chrome Extension Background Script
 * Will run in the background of the Chrome extension.
 */

chrome.runtime.onInstalled.addListener(({ reason, previousVersion }) => {
    /**
     * If the extension is installed
     */

    if (reason === 'install') {
        // Set the default upon installation
        chrome.storage.sync.set({
            // General Options
            doHideShorts: false, // Default: do not hide shorts section
            doHideWatched: false, // Default: do not fade watched videos

            // Video Length
            doFadeByLength: true, // Default: enable filter by video length
            videoLengthMin: 0, // Default: minimum length 0 minutes
            videoLengthMax: 30, // Default: maximum length 30 minutes

            // Subscriptions Categories
            doCategorizeSubscription: true, // Default: enable categorize subscriptions
            categories: [], // Default: set default categories
            channelCategoryAssigned: {}, // Default: no categories assigned
        });

        // Open the options page
        chrome.runtime.openOptionsPage();
    }

    /**
     * If the extension is updated
     */

    if (reason === 'update') {
        // Get the current version
        const currentVersion = chrome.runtime.getManifest().version;

        if (previousVersion === currentVersion) {
            return;
        }

        // Log the update
        console.log(`[SimpleTube] Updated from ${previousVersion} to ${currentVersion}`);

        // Open the options page
        chrome.runtime.openOptionsPage();
    }
});
