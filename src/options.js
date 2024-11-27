/**
 * Chrome Extension Options Page Script
 * Will run on the options page of the Chrome extension.
 */

function renderAlertMessage(message, error = false) {
    const messageElement = document.getElementById('sptid-alert-message');
    messageElement.classList.remove('sptcl-error', 'sptcl-success');

    messageElement.textContent = message;
    messageElement.classList.add(error ? 'sptcl-error' : 'sptcl-success');

    window.scrollTo({ top: 0 });

    // Clear any existing timeout to handle quick clicks
    if (renderAlertMessage.timeoutId) {
        clearTimeout(renderAlertMessage.timeoutId);
    }

    // Hide the message after 5 seconds
    renderAlertMessage.timeoutId = setTimeout(() => {
        messageElement.classList.remove('sptcl-error', 'sptcl-success');
        messageElement.textContent = '';
    }, 5000);
}

function renderListCategories(categories) {
    const categoriesList = document.getElementById('sptid-categories-list');
    categoriesList.innerHTML = '';

    // Sort categories alphabetically by name
    categories.sort((a, b) => a.name.localeCompare(b.name));

    // If there are no categories, show a message
    if (categories.length === 0) {
        const emptyLiElement = document.createElement('li');
        emptyLiElement.textContent = 'No categories added yet!';
        emptyLiElement.classList.add('sptcl-empty-item');

        categoriesList.appendChild(emptyLiElement);
        return;
    }

    // Render categories with delete and rename buttons
    categories.forEach(({ id, name }) => {
        // Create list item for each category
        const newLiElement = document.createElement('li');

        // Create span to hold the category name
        const nameSpan = document.createElement('span');
        nameSpan.textContent = name;

        // Create div to hold the action buttons
        const actionsDiv = document.createElement('div');
        actionsDiv.classList.add('sptcl-category-actions');

        // Create delete button for each category
        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'delete';
        deleteButton.classList.add('sptcl-form-category-actions-button');

        deleteButton.addEventListener('click', () => {
            // Remove the associated category from all subscriptions
            chrome.storage.sync.get(['channelCategoryAssigned'], ({ channelCategoryAssigned }) => {
                Object.keys(channelCategoryAssigned).forEach((channel) => {
                    if (channelCategoryAssigned[channel] === id) {
                        delete channelCategoryAssigned[channel];
                    }
                });

                chrome.storage.sync.set({ channelCategoryAssigned });
            });

            // Remove the category from the list
            chrome.storage.sync.get(['categories'], ({ categories }) => {
                const newCategories = categories.filter((c) => c.id !== id);

                chrome.storage.sync.set({ categories: newCategories }, () => {
                    renderAlertMessage(`Category "${name}" deleted successfully!`);
                    renderListCategories(newCategories);
                });
            });
        });

        // Create rename button for each category
        const renameButton = document.createElement('button');
        renameButton.textContent = 'rename';
        renameButton.classList.add('sptcl-form-category-actions-button');

        renameButton.addEventListener('click', () => {
            const newName = prompt('Enter new name for the category:', name);

            if (newName && newName.trim() !== '' && newName.trim() !== name) {
                chrome.storage.sync.get(['categories'], ({ categories }) => {
                    if (categories.some((category) => category.name === newName.trim())) {
                        renderAlertMessage(`Category "${newName.trim()}" already exists!`, true);
                        return;
                    }

                    const updatedCategories = categories.map((category) =>
                        category.id === id ? { ...category, name: newName.trim() } : category
                    );

                    chrome.storage.sync.set({ categories: updatedCategories }, () => {
                        renderAlertMessage(`Category renamed to "${newName.trim()}" successfully!`);
                        renderListCategories(updatedCategories);
                    });
                });
            }
        });

        // Append buttons to actions div
        actionsDiv.appendChild(renameButton);
        actionsDiv.appendChild(deleteButton);

        // Append elements to list item
        newLiElement.appendChild(nameSpan);
        newLiElement.appendChild(actionsDiv);

        // Append list item to categories list
        categoriesList.appendChild(newLiElement);
    });
}

/**
 * Event Click: Save Settings
 */
document.getElementById('sptid-settings-save').addEventListener('click', () => {
    // Get the value of the hide shorts checkbox
    const hideShorts = document.getElementById('sptid-do-hide-shorts').checked;

    // Get the value of the hide watched checkbox
    const hideWatched = document.getElementById('sptid-do-hide-watched').checked;

    // Get the value of the filter by length checkbox
    const fadeByLength = document.getElementById('sptid-do-fade-by-length').checked;

    // Get the selected video length values from the dropdowns
    const videoLengthMin = parseInt(document.getElementById('sptid-video-length-min').value, 10);
    const videoLengthMax = parseInt(document.getElementById('sptid-video-length-max').value, 10);

    // Get the value of the filter  subscription by category checkbox
    const categorizeSubscription = document.getElementById('sptid-do-categorize-subscription').checked;

    // Check if the input is NOT a valid number or a negative
    if (
        isNaN(videoLengthMin) ||
        isNaN(videoLengthMax) ||
        videoLengthMin < 0 ||
        videoLengthMax < 0 ||
        videoLengthMin >= videoLengthMax
    ) {
        renderAlertMessage(
            'Please select valid options for the video length filter (minimum should be less than maximum)!',
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
            renderAlertMessage('Settings updated successfully!');
        }
    );
});

/**
 * Event Click: Add Category
 */
document.getElementById('sptid-category-add').addEventListener('click', () => {
    const categoryName = document.getElementById('sptid-category-name').value.trim();

    if (categoryName) {
        chrome.storage.sync.get(['categories'], ({ categories }) => {
            if (categories.some((category) => category.name === categoryName)) {
                renderAlertMessage(`Category "${categoryName}" already exists!`, true);
                return;
            }

            const newCategory = { id: Date.now().toString(), name: categoryName };
            categories.push(newCategory);
            document.getElementById('sptid-category-name').value = '';

            // Sort categories alphabetically by name
            const sortedCategories = [...categories].sort((a, b) => a.name.localeCompare(b.name));

            chrome.storage.sync.set({ categories: sortedCategories }, () => {
                renderAlertMessage(`Category "${categoryName}" added successfully!`);
                renderListCategories(sortedCategories);
            });
        });
    }
});

/**
 * Event Click: Reset Settings
 */
document.getElementById('sptid-settings-reset').addEventListener('click', () => {
    // Reset the settings to the default values
    document.getElementById('sptid-do-hide-watched').checked = false;
    document.getElementById('sptid-do-hide-shorts').checked = false;

    document.getElementById('sptid-do-fade-by-length').checked = true;
    document.getElementById('sptid-video-length-min').value = 0;
    document.getElementById('sptid-video-length-max').value = 30;

    document.getElementById('sptid-do-categorize-subscription').checked = true;

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
            renderAlertMessage('Settings has been reset to default!');
        }
    );
});

/**
 * Event OnLoad : Set saved settings
 */
document.addEventListener('DOMContentLoaded', () => {
    chrome.storage.sync.get(
        [
            'doHideShorts',
            'doHideWatched',
            'doFadeByLength',
            'videoLengthMax',
            'videoLengthMin',
            'doCategorizeSubscription',
        ],
        ({ doHideShorts, doHideWatched, doFadeByLength, videoLengthMax, videoLengthMin, doCategorizeSubscription }) => {
            document.getElementById('sptid-do-hide-watched').checked = doHideWatched;
            document.getElementById('sptid-do-hide-shorts').checked = doHideShorts;

            document.getElementById('sptid-do-fade-by-length').checked = doFadeByLength;
            document.getElementById('sptid-video-length-min').value = videoLengthMin;
            document.getElementById('sptid-video-length-max').value = videoLengthMax;

            document.getElementById('sptid-do-categorize-subscription').checked = doCategorizeSubscription;
        }
    );

    chrome.storage.sync.get(['categories'], ({ categories }) => {
        renderListCategories(categories);
    });
});

/**
 * Event OnLoad: Set version from manifest
 */
document.addEventListener('DOMContentLoaded', () => {
    const versionElement = document.getElementById('sptid-version');
    versionElement.textContent = `v${chrome.runtime.getManifest().version}`;
});
