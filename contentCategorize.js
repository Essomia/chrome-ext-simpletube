/**
 * Constants
 */
const YTB_CHANNEL_PAGE_SELECTOR = ".ytd-page-manager[page-subtype='subscriptions-channels']";
const YTB_CHANNEL_BLOCK_SELECTOR = "ytd-channel-renderer";
const YTB_SUBSCRIPTIONS_PAGE_SELECTOR = ".ytd-page-manager[page-subtype='subscriptions']";
const YTB_SUBSCRIPTIONS_VIDEO_SELECTOR = "ytd-rich-item-renderer";

const CATEGORY_DD_DEFAULT = "Category";
const CLASS_CATEGORY_SELECT = "sptcl-category-select";
const CLASS_CATEGORY_OPTION = "sptcl-category-option";

const CATEGORY_ALL = "All";
const CATEGORY_NOT_ASSIGNED = "Not Assigned";
const CLASS_FILTER_CONTAINER_CHANNEL = "sptcl-channel-filter-container";
const CLASS_FILTER_CONTAINER_SUBSCRIPTION = "sptcl-subscription-filter-container";
const CLASS_FILTER_BUTTON = "sptcl-filter-button";

/**
 * Get the channel name from the channel block
 * @param {HTMLElement} contentEl - The channel block element
 * @param {boolean} isChannelPage - If the page is a channel page
 * @returns {string} - The channel name
 */
function getChannelName(contentEl, isChannelPage = false) {
    const channelLink = isChannelPage
        ? contentEl.querySelector("#main-link.channel-link")
        : contentEl.querySelector(".ytd-channel-name > a.yt-formatted-string");

    // get the channel name from the link href, remove the leasding slash, and trim the whitespace, and lowercase the channel name for consistency
    const channelNameArr = channelLink?.href?.split("/") || [];
    const channelName = channelNameArr[channelNameArr.length - 1]?.trim()?.toLowerCase() || "";

    return channelName;
}

/**
 * Render the filter buttons for each category
 * @param {HTMLElement} filterContainerEl - The container element to append the buttons
 * @param {string[]} categories - The list of categories
 * @returns {void}
 */
function renderButtonsFilters(filterContainerEl, categories) {
    categories.forEach((category) => {
        const filterButtonEl = document.createElement("span");
        filterButtonEl.textContent = category;
        filterButtonEl.classList.add(CLASS_FILTER_BUTTON);

        // Set the default filter to "All" when the page is loaded
        if (category === CATEGORY_ALL) {
            filterButtonEl.setAttribute("data-active", "true");
        }

        filterButtonEl.addEventListener("click", () => {
            // Add an attribute data-active="true" to the selected filter
            document.querySelectorAll(`.${CLASS_FILTER_BUTTON}`).forEach((btn) => {
                btn.removeAttribute("data-active");
            });

            filterButtonEl.setAttribute("data-active", "true");
        });

        filterContainerEl.appendChild(filterButtonEl);
    });
}

/**
 * Apply the selected filter to the content
 * @param {HTMLElement[]} contentArr - The list of contents to filter
 * @param {string} category - The selected category
 * @param {Object} channelCategoryAssigned - The list of channels assigned to each category
 * @param {boolean} forChannelPage - If the page is a channel page
 * @returns {void}
 */
function applyFilterToContent(contentArr, category, channelCategoryAssigned, forChannelPage) {
    // Apply the selected filter to the channels
    contentArr.forEach((contentEl) => {
        const channelName = getChannelName(contentEl, forChannelPage);

        // If the category is "Not Assigned"
        if (category === CATEGORY_NOT_ASSIGNED) {
            // Show the content only if the channel is not assigned to any category
            if (!channelCategoryAssigned[channelName]) {
                contentEl.style.display = "";
            } else {
                contentEl.style.display = "none";
            }
        } else {
            // If the category is assigned to the channel, show the content
            if (channelCategoryAssigned[channelName] === category) {
                contentEl.style.display = "";
            } else {
                contentEl.style.display = "none";
            }
        }
    });
}

chrome.storage.sync.get(
    ["doCategorizeSubscription", "categories", "channelCategoryAssigned"],
    ({ doCategorizeSubscription, categories, channelCategoryAssigned }) => {
        /**
         * Channel Page: Dropdown for Category Assignment
         */

        const renderChannelsPageCategoryDropdown = () => {
            // Get all channel blocks
            const channelBlockElArray = document.querySelectorAll(YTB_CHANNEL_BLOCK_SELECTOR);

            // If the page doesn't have any channel, skip
            if (!channelBlockElArray.length) return;

            // Add a dropdown for each channel to select categories
            channelBlockElArray.forEach((channelBlockEl) => {
                // Get DOM elements
                const actionsContainerEl = channelBlockEl.querySelector("#buttons");

                // If the dropdown already exists, skip
                if (actionsContainerEl.querySelectorAll(`.${CLASS_CATEGORY_SELECT}`).length > 0) return;

                // Get channel name
                const channelName = getChannelName(channelBlockEl, true);

                // Create the category dropdown
                const selectEl = document.createElement("select");
                selectEl.classList.add(CLASS_CATEGORY_SELECT);

                // Create a default option
                const defaultOptionEl = document.createElement("option");
                defaultOptionEl.text = CATEGORY_DD_DEFAULT;
                defaultOptionEl.classList.add(CLASS_CATEGORY_OPTION);

                selectEl.appendChild(defaultOptionEl);

                // Create each categories as an option
                categories.forEach((category) => {
                    const optionEl = document.createElement("option");
                    optionEl.text = category;
                    optionEl.value = category;
                    optionEl.classList.add(CLASS_CATEGORY_OPTION);

                    // Set the selected option if the category is already assigned
                    if (channelCategoryAssigned[channelName] === category) {
                        optionEl.selected = true;
                    }

                    selectEl.appendChild(optionEl);
                });

                // Add event listener to save the selected category
                selectEl.addEventListener("change", () => {
                    if (selectEl.value === CATEGORY_DD_DEFAULT) {
                        // Remove the category from the assigned list if the default option is selected
                        delete channelCategoryAssigned[channelName];
                    } else {
                        // Save the selected category
                        channelCategoryAssigned[channelName] = selectEl.value;
                    }

                    // Save the updated assigned list to storage
                    chrome.storage.sync.set({ channelCategoryAssigned });
                });

                // Append the dropdown to the channel actions container
                actionsContainerEl.appendChild(selectEl);
            });
        };

        /**
         * Channel Page: Channel Filtered by Category Buttons
         */

        const renderChannelsPageFilters = () => {
            // Get DOM elements
            const channelPageEl = document.querySelector(YTB_CHANNEL_PAGE_SELECTOR);

            // If filters do not exist, do create them...
            if (!channelPageEl.querySelectorAll(`.${CLASS_FILTER_CONTAINER_CHANNEL}`).length) {
                // Create the filters container
                const filterContainerEl = document.createElement("div");
                filterContainerEl.classList.add(CLASS_FILTER_CONTAINER_CHANNEL);

                // Create filter buttons
                renderButtonsFilters(filterContainerEl, [CATEGORY_ALL, ...categories, CATEGORY_NOT_ASSIGNED]);

                // Append the filters to the primary container
                channelPageEl.prepend(filterContainerEl);
            }

            // Attach filter onclick event
            const filterButtonsArr = channelPageEl.querySelectorAll(`.${CLASS_FILTER_BUTTON}`);

            filterButtonsArr.forEach((filterButtonEl) => {
                filterButtonEl.addEventListener("click", () => {
                    const contentArr = document.querySelectorAll(YTB_CHANNEL_BLOCK_SELECTOR);
                    const category = filterButtonEl.textContent;
                    const forChannelPage = true;

                    if (category === CATEGORY_ALL) {
                        contentArr.forEach((channel) => {
                            channel.style.display = "";
                        });
                    } else {
                        applyFilterToContent(contentArr, category, channelCategoryAssigned, forChannelPage);
                    }
                });
            });
        };

        /**
         * Subscriptions Page: Videos Filtered by Category Buttons
         */

        const renderSubscriptionsPageFilters = () => {
            // Get DOM elements
            const subscriptionsPageContainer = document.querySelector(YTB_SUBSCRIPTIONS_PAGE_SELECTOR);

            // If filters do not exist, do create them...
            if (!subscriptionsPageContainer.querySelectorAll(`.${CLASS_FILTER_CONTAINER_SUBSCRIPTION}`).length) {
                // Create the filters container
                const filterContainerEl = document.createElement("div");
                filterContainerEl.classList.add(CLASS_FILTER_CONTAINER_SUBSCRIPTION);

                // Create filter buttons
                renderButtonsFilters(filterContainerEl, [CATEGORY_ALL, ...categories]);

                // Append the filters to the primary container
                subscriptionsPageContainer.prepend(filterContainerEl);
            }

            // Attach filter onclick event
            const filterButtonsArr = subscriptionsPageContainer.querySelectorAll(`.${CLASS_FILTER_BUTTON}`);

            filterButtonsArr.forEach((filterButtonEl) => {
                filterButtonEl.addEventListener("click", () => {
                    const contentArr = document.querySelectorAll(YTB_SUBSCRIPTIONS_VIDEO_SELECTOR);
                    const category = filterButtonEl.textContent;
                    const forChannelPage = false;

                    if (category === CATEGORY_ALL) {
                        contentArr.forEach((video) => {
                            video.style.display = "";
                        });
                    } else {
                        applyFilterToContent(contentArr, category, channelCategoryAssigned, forChannelPage);
                    }
                });
            });
        };

        /**
         * Initialize filters
         */

        if (doCategorizeSubscription) {
            setInterval(() => {
                if (window.location.pathname === "/feed/channels") {
                    renderChannelsPageCategoryDropdown();
                    renderChannelsPageFilters();
                }

                if (window.location.pathname === "/feed/subscriptions") {
                    renderSubscriptionsPageFilters();
                }
            }, 3000);
        }
    }
);
