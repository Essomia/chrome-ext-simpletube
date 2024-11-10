chrome.storage.sync.get(
    ["doCategorizeSubscription", "categories", "channelCategoryAssigned"],
    ({ doCategorizeSubscription, categories, channelCategoryAssigned }) => {
        /**
         * Category Assignment on Channel Listing Page
         */

        const renderCategoryDropdown = () => {
            // Add a dropdown for each channel to select categories
            document.querySelectorAll("ytd-channel-renderer").forEach((chRenderer) => {
                // Get DOM elements
                const chActionsContainerEl = chRenderer.querySelector("#buttons");

                // If the dropdown already exists, skip
                if (chActionsContainerEl.querySelectorAll(".spt-category-select").length > 0) return;

                // Get channel name
                const chNameEl = chRenderer.querySelector(".ytd-channel-name[title]");
                const chName = chNameEl.innerHTML.trim();

                // Create the category dropdown
                const selectEl = document.createElement("select");
                selectEl.classList.add("spt-category-select");

                // Create a default option
                const defaultOptionEl = document.createElement("option");
                defaultOptionEl.text = "Category";
                defaultOptionEl.classList.add("spt-category-option");

                selectEl.appendChild(defaultOptionEl);

                // Create each categories as an option
                categories.forEach((category) => {
                    const optionEl = document.createElement("option");
                    optionEl.text = category;
                    optionEl.value = category;
                    optionEl.classList.add("spt-category-option");

                    // Set the selected option if the category is already assigned
                    if (channelCategoryAssigned[chName] === category) {
                        optionEl.selected = true;
                    }

                    // If we don't have any category assigned
                    if (!channelCategoryAssigned[chName]) {
                        selectEl.classList.add("spt-category-no-selected");
                    }

                    selectEl.appendChild(optionEl);
                });

                // Add event listener to save the selected category
                selectEl.addEventListener("change", () => {
                    if (selectEl.value === "Category") {
                        // Remove the category from the assigned list if the default option is selected
                        delete channelCategoryAssigned[chName];
                        selectEl.classList.add("spt-category-no-selected");
                    } else {
                        // Save the selected category
                        channelCategoryAssigned[chName] = selectEl.value;
                        selectEl.classList.remove("spt-category-no-selected");
                    }

                    // Save the updated assigned list to storage
                    chrome.storage.sync.set({ channelCategoryAssigned });
                });

                // Append the dropdown to the channel actions container
                chActionsContainerEl.appendChild(selectEl);
            });
        };

        /**
         * Category Filter on Subscriptions Page
         */

        const renderSubscriptionsFilter = () => {
            // Get DOM elements
            const primaryContainerEl = document.querySelectorAll("#primary")[0];

            // If filters already exist, skip
            if (primaryContainerEl.querySelectorAll(".spt-category-filter-container").length > 0) return;

            // Create the filters container
            const filterContainerEl = document.createElement("div");
            filterContainerEl.classList.add("spt-category-filter-container");

            // Create a clear filter button (to show all videos)
            const clearFilterButtonEl = document.createElement("span");
            clearFilterButtonEl.textContent = "Clear Filter";
            clearFilterButtonEl.classList.add("spt-category-filter-button");

            clearFilterButtonEl.addEventListener("click", () => {
                // Show all videos
                document.querySelectorAll("ytd-rich-item-renderer").forEach((video) => {
                    video.style.display = "";
                });

                // Remove the data-active attribute from all buttons
                document.querySelectorAll(".spt-category-filter-button").forEach((btn) => {
                    btn.removeAttribute("data-active");
                });
            });

            filterContainerEl.appendChild(clearFilterButtonEl);

            // Create each category as a filter button
            categories.forEach((category) => {
                const buttonEl = document.createElement("span");
                buttonEl.textContent = category;
                buttonEl.classList.add("spt-category-filter-button");

                buttonEl.addEventListener("click", () => {
                    // Filter videos by selected category
                    const filterVideos = () => {
                        document.querySelectorAll("ytd-rich-item-renderer").forEach((video) => {
                            const channelNameEl = video.querySelector("#channel-name .ytd-channel-name a");
                            const channelName = channelNameEl ? channelNameEl.textContent.trim() : "";

                            if (channelCategoryAssigned[channelName] === category) {
                                video.style.display = "";
                            } else {
                                video.style.display = "none";
                            }
                        });
                    };

                    // Initial filtering
                    filterVideos();

                    // Add an attribute data-active="true" to the selected filter
                    document.querySelectorAll(".spt-category-filter-button").forEach((btn) => {
                        btn.removeAttribute("data-active");
                    });

                    buttonEl.setAttribute("data-active", "true");

                    // Set up a mutation observer to handle dynamically loaded content
                    const observer = new MutationObserver(() => {
                        filterVideos();
                    });

                    observer.observe(document.querySelector("#contents"), { childList: true, subtree: true });
                });

                filterContainerEl.appendChild(buttonEl);
            });

            // Append the filters to the primary container
            primaryContainerEl.prepend(filterContainerEl);
        };

        /**
         * Initialize filters
         */

        if (doCategorizeSubscription) {
            setInterval(() => {
                if (window.location.pathname === "/feed/channels") {
                    renderCategoryDropdown();
                }

                if (window.location.pathname === "/feed/subscriptions") {
                    renderSubscriptionsFilter();
                }
            }, 3000);
        }
    }
);
