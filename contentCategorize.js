// Get the channel name from the video element
function getChannelName(containerEl, isChannelPage = false) {
    const channelLink = isChannelPage
        ? containerEl.querySelector("#main-link.channel-link")
        : containerEl.querySelector(".ytd-channel-name > a.yt-formatted-string");

    // get the channel name from the link href, remove the leasding slash, and trim the whitespace, and lowercase the channel name for consistency
    const channelNameArr = channelLink?.href?.split("/") || [];
    const channelName = channelNameArr[channelNameArr.length - 1]?.trim()?.toLowerCase() || "";

    return channelName;
}

// Add an attribute data-active="true" to the selected filter
function clearButtonActiveOnClick(buttonEl) {
    document.querySelectorAll(".sptcl-filter-button").forEach((btn) => {
        btn.removeAttribute("data-active");
    });

    buttonEl.setAttribute("data-active", "true");
}

// Render a button to show all videos
function renderButtonAll(filterContainerEl, contentArray) {
    const clearFilterButtonEl = document.createElement("span");
    clearFilterButtonEl.textContent = "All";
    clearFilterButtonEl.classList.add("sptcl-filter-button");

    clearFilterButtonEl.addEventListener("click", () => {
        // Show all videos
        const doFilterContent = () => {
            contentArray.forEach((video) => {
                video.style.display = "";
            });
        };

        // Initial filtering
        doFilterContent();

        // Remove the data-active attribute from all buttons
        clearButtonActiveOnClick(clearFilterButtonEl);
    });

    filterContainerEl.appendChild(clearFilterButtonEl);
}

// Render a button to filter videos for specific category
function renderButtonCategory(
    filterContainerEl,
    contentArray,
    category,
    channelCategoryAssigned,
    isChannelPage = false,
    isNotAssigned = false
) {
    const buttonEl = document.createElement("span");
    buttonEl.textContent = category;
    buttonEl.classList.add("sptcl-filter-button");

    buttonEl.addEventListener("click", () => {
        // Filter videos by selected category
        const doFilterContent = () => {
            contentArray.forEach((video) => {
                const channelName = getChannelName(video, isChannelPage);

                // If the category is "Not Assigned", show the video if the channel is not assigned to any category
                if (isNotAssigned) {
                    if (!channelCategoryAssigned[channelName]) {
                        video.style.display = "";
                    } else {
                        video.style.display = "none";
                    }
                } else {
                    // If the category is assigned to the channel, show the video
                    if (channelCategoryAssigned[channelName] === category) {
                        video.style.display = "";
                    } else {
                        video.style.display = "none";
                    }
                }
            });
        };

        // Initial filtering
        doFilterContent();

        // Add an attribute data-active="true" to the selected filter
        clearButtonActiveOnClick(buttonEl);
    });

    filterContainerEl.appendChild(buttonEl);
}

chrome.storage.sync.get(
    ["doCategorizeSubscription", "categories", "channelCategoryAssigned"],
    ({ doCategorizeSubscription, categories, channelCategoryAssigned }) => {
        /**
         * Channel Page: Dropdown for Category Assignment
         */

        const renderChannelsPageCategoryDropdown = () => {
            // Add a dropdown for each channel to select categories
            document.querySelectorAll("ytd-channel-renderer").forEach((chRenderer) => {
                // Get DOM elements
                const chActionsContainerEl = chRenderer.querySelector("#buttons");

                // If the dropdown already exists, skip
                if (chActionsContainerEl.querySelectorAll(".sptcl-category-select").length > 0) return;

                // Get channel name
                const channelName = getChannelName(chRenderer, true);

                // Create the category dropdown
                const selectEl = document.createElement("select");
                selectEl.classList.add("sptcl-category-select");

                // Create a default option
                const defaultOptionEl = document.createElement("option");
                defaultOptionEl.text = "Category";
                defaultOptionEl.classList.add("sptcl-category-option");

                selectEl.appendChild(defaultOptionEl);

                // Create each categories as an option
                categories.forEach((category) => {
                    const optionEl = document.createElement("option");
                    optionEl.text = category;
                    optionEl.value = category;
                    optionEl.classList.add("sptcl-category-option");

                    // Set the selected option if the category is already assigned
                    if (channelCategoryAssigned[channelName] === category) {
                        optionEl.selected = true;
                    }

                    // If we don't have any category assigned
                    if (!channelCategoryAssigned[channelName]) {
                        selectEl.classList.add("sptcl-category-no-selected");
                    }

                    selectEl.appendChild(optionEl);
                });

                // Add event listener to save the selected category
                selectEl.addEventListener("change", () => {
                    if (selectEl.value === "Category") {
                        // Remove the category from the assigned list if the default option is selected
                        delete channelCategoryAssigned[channelName];
                        selectEl.classList.add("sptcl-category-no-selected");
                    } else {
                        // Save the selected category
                        channelCategoryAssigned[channelName] = selectEl.value;
                        selectEl.classList.remove("sptcl-category-no-selected");
                    }

                    // Save the updated assigned list to storage
                    chrome.storage.sync.set({ channelCategoryAssigned });
                });

                // Append the dropdown to the channel actions container
                chActionsContainerEl.appendChild(selectEl);
            });
        };

        /**
         * Subscriptions Page: Videos Filtered by Category Buttons
         */

        const renderSubscriptionsPageFilters = () => {
            // Get DOM elements
            const subscriptionsPageContainer = document.querySelector(
                ".ytd-page-manager[page-subtype='subscriptions']"
            );

            // If filters already exist, skip
            if (subscriptionsPageContainer.querySelectorAll(".sptcl-category-filter-container").length > 0) return;

            // Create the filters container
            const filterContainerEl = document.createElement("div");
            filterContainerEl.classList.add("sptcl-category-filter-container");

            // Create a 'All' button (to show all videos)
            renderButtonAll(filterContainerEl, document.querySelectorAll("ytd-rich-item-renderer"));

            // Create each category as a filter button
            categories.forEach((category) => {
                renderButtonCategory(
                    filterContainerEl,
                    document.querySelectorAll("ytd-rich-item-renderer"),
                    category,
                    channelCategoryAssigned,
                    false,
                    false
                );
            });

            renderButtonCategory(
                filterContainerEl,
                document.querySelectorAll("ytd-rich-item-renderer"),
                "Not Assigned",
                channelCategoryAssigned,
                false,
                true
            );

            // Append the filters to the primary container
            subscriptionsPageContainer.prepend(filterContainerEl);
        };

        /**
         * Initialize filters
         */

        if (doCategorizeSubscription) {
            setInterval(() => {
                if (window.location.pathname === "/feed/channels") {
                    renderChannelsPageCategoryDropdown();
                }

                if (window.location.pathname === "/feed/subscriptions") {
                    renderSubscriptionsPageFilters();
                }
            }, 3000);
        }
    }
);
