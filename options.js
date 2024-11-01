/**
 * Chrome Extension Options Page Script
 * Will run on the options page of the Chrome extension.
 */

function renderAlertMessage(message, error = false) {
    const messageElement = document.getElementById("sptdt-alert-message");
    messageElement.classList.remove("spt-error", "spt-success");

    messageElement.textContent = message;
    messageElement.classList.add(error ? "spt-error" : "spt-success");

    window.scrollTo({ top: 0 });

    // Clear any existing timeout to handle quick clicks
    if (renderAlertMessage.timeoutId) {
        clearTimeout(renderAlertMessage.timeoutId);
    }

    // Hide the message after 5 seconds
    renderAlertMessage.timeoutId = setTimeout(() => {
        messageElement.classList.remove("spt-error", "spt-success");
        messageElement.textContent = "";
    }, 5000);
}

/**
 * Event Click: Save Settings
 */
document.getElementById("sptdt-settings-save").addEventListener("click", () => {
    // Get the value of the filter by length checkbox
    const fadeByLength = document.getElementById("sptdt-do-fade-by-length").checked;

    // Get the selected video length values from the dropdowns
    const videoLengthMin = parseInt(document.getElementById("sptdt-video-length-min").value, 10);
    const videoLengthMax = parseInt(document.getElementById("sptdt-video-length-max").value, 10);

    // Check if the input is NOT a valid number or a negative
    if (
        isNaN(videoLengthMin) ||
        isNaN(videoLengthMax) ||
        videoLengthMin < 0 ||
        videoLengthMax < 0 ||
        videoLengthMin >= videoLengthMax
    ) {
        renderAlertMessage(
            "Please select valid options for the video length filter (minimum should be less than maximum)!",
            true
        );

        return;
    }

    // Save the settings to Chrome's storage
    chrome.storage.sync.set(
        {
            doFadeByLength: fadeByLength,
            videoLengthMax: videoLengthMax,
            videoLengthMin: videoLengthMin,
        },
        () => {
            renderAlertMessage(`Settings updated successfully!`);
        }
    );
});

/**
 * Event OnLoad : Set saved settings
 */
document.addEventListener("DOMContentLoaded", () => {
    chrome.storage.sync.get(
        ["doFadeByLength", "videoLengthMax", "videoLengthMin"],
        ({ doFadeByLength, videoLengthMax, videoLengthMin }) => {
            document.getElementById("sptdt-do-fade-by-length").checked = doFadeByLength;
            document.getElementById("sptdt-video-length-min").value = videoLengthMin;
            document.getElementById("sptdt-video-length-max").value = videoLengthMax;
        }
    );
});

/**
 * Event OnLoad: Set version from manifest
 */
document.addEventListener("DOMContentLoaded", () => {
    const versionElement = document.getElementById("sptdt-version");
    versionElement.textContent = `v${chrome.runtime.getManifest().version}`;
});
