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

function renderListCategories(categories) {
    const categoriesList = document.getElementById("sptdt-categories-list");
    categoriesList.innerHTML = "";

    // If there are no categories, show a message
    if (categories.length === 0) {
        const emptyLiElement = document.createElement("li");
        emptyLiElement.textContent = "No categories added yet!";
        emptyLiElement.classList.add("spt-empty-item");

        categoriesList.appendChild(emptyLiElement);
        return;
    }

    // Sort and render categories with delete button
    categories
        .sort((a, b) => a.localeCompare(b))
        .forEach((category) => {
            // Create list item for each category
            const newLiElement = document.createElement("li");
            newLiElement.textContent = category;

            // Create delete button for each category
            const deleteButton = document.createElement("button");
            deleteButton.textContent = "delete";
            deleteButton.classList.add("spt-form-delete-category-button");

            deleteButton.addEventListener("click", () => {
                // Remove the associated category from all subscriptions
                chrome.storage.sync.get(["channelCategoryAssigned"], ({ channelCategoryAssigned }) => {
                    Object.keys(channelCategoryAssigned).forEach((channel) => {
                        if (channelCategoryAssigned[channel] === category) {
                            delete channelCategoryAssigned[channel];
                        }
                    });

                    chrome.storage.sync.set({ channelCategoryAssigned });
                });

                // Remove the category from the list
                chrome.storage.sync.get(["categories"], ({ categories }) => {
                    const newCategories = categories.filter((c) => c !== category);

                    chrome.storage.sync.set({ categories: newCategories }, () => {
                        renderAlertMessage(`Category "${category}" deleted successfully!`);
                        renderListCategories(newCategories);
                    });
                });
            });

            // Append elements
            newLiElement.appendChild(deleteButton);
            categoriesList.appendChild(newLiElement);
        });
}

/**
 * Event Click: Save Settings
 */
document.getElementById("sptdt-settings-save").addEventListener("click", () => {
    // Get the value of the hide shorts checkbox
    const hideShorts = document.getElementById("sptdt-do-hide-shorts").checked;

    // Get the value of the hide watched checkbox
    const hideWatched = document.getElementById("sptdt-do-hide-watched").checked;

    // Get the value of the filter by length checkbox
    const fadeByLength = document.getElementById("sptdt-do-fade-by-length").checked;

    // Get the selected video length values from the dropdowns
    const videoLengthMin = parseInt(document.getElementById("sptdt-video-length-min").value, 10);
    const videoLengthMax = parseInt(document.getElementById("sptdt-video-length-max").value, 10);

    // Get the value of the filter  subscription by category checkbox
    const categorizeSubscription = document.getElementById("sptdt-do-categorize-subscription").checked;

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
            doHideShorts: hideShorts,
            doHideWatched: hideWatched,
            doFadeByLength: fadeByLength,
            videoLengthMax: videoLengthMax,
            videoLengthMin: videoLengthMin,
            doCategorizeSubscription: categorizeSubscription,
        },
        () => {
            renderAlertMessage(`Settings updated successfully!`);
        }
    );
});

/**
 * Event Click: Add Category
 */
document.getElementById("sptdt-category-add").addEventListener("click", () => {
    const categoryName = document.getElementById("sptdt-category-name").value.trim();

    if (categoryName) {
        chrome.storage.sync.get(["categories"], ({ categories }) => {
            if (!categories.includes(categoryName)) {
                categories.push(categoryName);
                document.getElementById("sptdt-category-name").value = "";

                chrome.storage.sync.set({ categories }, () => {
                    renderAlertMessage(`Category "${categoryName}" added successfully!`);
                    renderListCategories(categories);
                });
            }
        });
    }
});

/**
 * Event Click: Reset Settings
 */
document.getElementById("sptdt-settings-reset").addEventListener("click", () => {
    // Reset the settings to the default values
    document.getElementById("sptdt-do-hide-watched").checked = false;
    document.getElementById("sptdt-do-hide-shorts").checked = false;

    document.getElementById("sptdt-do-fade-by-length").checked = true;
    document.getElementById("sptdt-video-length-min").value = 0;
    document.getElementById("sptdt-video-length-max").value = 30;

    document.getElementById("sptdt-do-categorize-subscription").checked = true;

    // Save the settings to Chrome's storage
    chrome.storage.sync.set(
        {
            // General Options
            doHideShorts: false,
            doHideWatched: false,
            // Video Length
            doFadeByLength: true,
            videoLengthMin: 0,
            videoLengthMax: 30,
            // Subscriptions Categories
            doCategorizeSubscription: true,
        },
        () => {
            renderAlertMessage(`Settings has been reset to default!`);
        }
    );
});

/**
 * Event OnLoad : Set saved settings
 */
document.addEventListener("DOMContentLoaded", () => {
    chrome.storage.sync.get(
        [
            "doHideShorts",
            "doHideWatched",
            "doFadeByLength",
            "videoLengthMax",
            "videoLengthMin",
            "doCategorizeSubscription",
        ],
        ({ doHideShorts, doHideWatched, doFadeByLength, videoLengthMax, videoLengthMin, doCategorizeSubscription }) => {
            document.getElementById("sptdt-do-hide-watched").checked = doHideWatched;
            document.getElementById("sptdt-do-hide-shorts").checked = doHideShorts;

            document.getElementById("sptdt-do-fade-by-length").checked = doFadeByLength;
            document.getElementById("sptdt-video-length-min").value = videoLengthMin;
            document.getElementById("sptdt-video-length-max").value = videoLengthMax;

            document.getElementById("sptdt-do-categorize-subscription").checked = doCategorizeSubscription;
        }
    );

    chrome.storage.sync.get(["categories"], ({ categories }) => {
        renderListCategories(categories);
    });
});

/**
 * Event OnLoad: Set version from manifest
 */
document.addEventListener("DOMContentLoaded", () => {
    const versionElement = document.getElementById("sptdt-version");
    versionElement.textContent = `v${chrome.runtime.getManifest().version}`;
});
