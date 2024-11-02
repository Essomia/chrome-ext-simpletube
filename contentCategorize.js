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
         * Initialize filters
         */

        if (doCategorizeSubscription) {
            setInterval(() => {
                if (window.location.pathname === "/feed/channels") {
                    renderCategoryDropdown();
                }
            }, 3000);
        }
    }
);
