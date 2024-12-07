/**
 * Chrome Extension Content Script.
 * Will run on subscriptions page and channel page only.
 */

/**
 * Constants
 */

// Youtube page and blocks selectors
const YTB_SELECTOR_CHANNEL_PAGE = '.ytd-page-manager[page-subtype="subscriptions-channels"]';
const YTB_SELECTOR_CHANNEL_RENDERER = 'ytd-channel-renderer';

const YTB_SELECTOR_SUBSCRIPTION_PAGE = '.ytd-page-manager[page-subtype="subscriptions"]';
const YTB_SELECTOR_SUBSCRIPTION_RENDERER = 'ytd-rich-item-renderer';

// Youtube channel name selectors
const SELECTOR_CHANNEL_LINK = '#main-link.channel-link';
const SELECTOR_CHANNEL_NAME_LINK = '.ytd-channel-name > a.yt-formatted-string';

// SimpleTube Dropdown category
const CATEGORY_DD_DEFAULT = 'Category';
const CLASS_CATEGORY_SELECT = 'sptcl-category-select';
const CLASS_CATEGORY_OPTION = 'sptcl-category-option';

// SimpleTube Filter
const CATEGORY_ALL = 'All';
const CATEGORY_NOT_ASSIGNED = 'Not Assigned';

const CLASS_FILTER_CONTAINER_CHANNEL = 'sptcl-channel-filter-container';
const CLASS_FILTER_CONTAINER_SUBSCRIPTION = 'sptcl-subscription-filter-container';
const CLASS_FILTER_BUTTON = 'sptcl-filter-button';

const SELECTOR_FILTER_BUTTON = '.sptcl-filter-button';

/**
 * Helper Functions
 */

// Get the channel name from the channel block
function getChannelName(block, isChannelPage = false) {
    const channelLink = isChannelPage
        ? block.querySelector(SELECTOR_CHANNEL_LINK)
        : block.querySelector(SELECTOR_CHANNEL_NAME_LINK);

    // get the channel name from the link href, remove the leasding slash, and trim the whitespace, and lowercase the channel name for consistency
    const channelNameArr = channelLink?.href?.split('/') || [];
    const channelName = channelNameArr[channelNameArr.length - 1]?.trim()?.toLowerCase() || '';

    return channelName;
}

// Render filter buttons for each categories
function renderButtonsFilters(filterContainer, categoriesList) {
    categoriesList.forEach(({ id, name }) => {
        const filterButton = document.createElement('span');
        filterButton.textContent = name;
        filterButton.setAttribute('data-category-id', id);
        filterButton.classList.add(CLASS_FILTER_BUTTON);

        // Set the default filter to "All" when the page is loaded
        if (name === CATEGORY_ALL) {
            filterButton.setAttribute('data-active', 'true');
        }

        filterButton.addEventListener('click', () => {
            // Add an attribute data-active="true" to the selected filter
            filterContainer.querySelectorAll(SELECTOR_FILTER_BUTTON).forEach((btn) => {
                btn.removeAttribute('data-active');
            });

            filterButton.setAttribute('data-active', 'true');
        });

        filterContainer.appendChild(filterButton);
    });
}

// Apply the selected filter to the content
function applyFilterToContent(contentList, selectedCategoryId, channelCategoryAssignTable, forChannelPage) {
    // Apply the selected filter to the channels
    contentList.forEach((block) => {
        const channelName = getChannelName(block, forChannelPage);

        // If the category is "Not Assigned"
        if (selectedCategoryId === CATEGORY_NOT_ASSIGNED) {
            // Show the content only if the channel is not assigned to any category
            if (!channelCategoryAssignTable[channelName]) {
                block.style.display = '';
            } else {
                block.style.display = 'none';
            }
        } else {
            // If the category is assigned to the channel, show the content
            if (channelCategoryAssignTable[channelName] === selectedCategoryId) {
                block.style.display = '';
            } else {
                block.style.display = 'none';
            }
        }
    });
}

// Apply the default "All" filter to the content
function applyDefaultFilter(contentList) {
    contentList.forEach((block) => {
        block.style.display = '';
    });
}

// Observe changes in the subscriptions page and reapply filters
function observeSubscriptionsPage(subscriptionsPageContainer, channelCategoryAssignTable) {
    const observer = new MutationObserver(() => {
        const activeFilterButton = subscriptionsPageContainer.querySelector(
            `${SELECTOR_FILTER_BUTTON}[data-active="true"]`
        );

        if (activeFilterButton) {
            const contentList = subscriptionsPageContainer.querySelectorAll(YTB_SELECTOR_SUBSCRIPTION_RENDERER);
            const category = activeFilterButton.getAttribute('data-category-id');
            const forChannelPage = false;

            if (category === CATEGORY_ALL) {
                applyDefaultFilter(contentList);
            } else {
                applyFilterToContent(contentList, category, channelCategoryAssignTable, forChannelPage);
            }
        }
    });

    observer.observe(subscriptionsPageContainer, { childList: true, subtree: true });
}

/**
 * Main
 */

chrome.storage.sync.get(
    ['doCategorizeSubscription', 'categories', 'channelCategoryAssigned'],
    ({ doCategorizeSubscription, categories, channelCategoryAssigned }) => {
        // Sort categories alphabetically by name
        categories.sort((a, b) => a.name.localeCompare(b.name));

        /**
         * Channel Page
         */

        // Dropdown for Category Assignment
        const renderChannelsPageCategoryDropdown = () => {
            // Get all channel blocks
            const channelBlocks = document.querySelectorAll(YTB_SELECTOR_CHANNEL_RENDERER);

            // If the page doesn't have any channel, skip
            if (!channelBlocks.length) return;

            // Add a dropdown for each channel to select categories
            channelBlocks.forEach((channelBlockEl) => {
                // Get DOM elements
                const actionsContainer = channelBlockEl.querySelector('#buttons');

                // If the dropdown already exists, skip
                if (actionsContainer.querySelectorAll(`.${CLASS_CATEGORY_SELECT}`).length > 0) return;

                // Get channel name
                const channelName = getChannelName(channelBlockEl, true);

                // Create the category dropdown
                const dropdown = document.createElement('select');
                dropdown.classList.add(CLASS_CATEGORY_SELECT);

                // Create a default option
                const defaultOption = document.createElement('option');
                defaultOption.text = CATEGORY_DD_DEFAULT;
                defaultOption.classList.add(CLASS_CATEGORY_OPTION);

                dropdown.appendChild(defaultOption);

                // Create each categories as an option
                categories.forEach(({ id, name }) => {
                    const option = document.createElement('option');
                    option.text = name;
                    option.value = id;
                    option.classList.add(CLASS_CATEGORY_OPTION);

                    // Set the selected option if the category is already assigned
                    if (channelCategoryAssigned[channelName] === id) {
                        option.selected = true;
                    }

                    dropdown.appendChild(option);
                });

                // Add event listener to save the selected category
                dropdown.addEventListener('change', () => {
                    if (dropdown.value === CATEGORY_DD_DEFAULT) {
                        // Remove the category from the assigned list if the default option is selected
                        delete channelCategoryAssigned[channelName];
                    } else {
                        // Save the selected category
                        channelCategoryAssigned[channelName] = dropdown.value;
                    }

                    // Save the updated assigned list to storage
                    chrome.storage.sync.set({ channelCategoryAssigned });
                });

                // Append the dropdown to the channel actions container
                actionsContainer.appendChild(dropdown);
            });
        };

        // Filter Channels by Category Buttons
        const renderChannelsPageFilters = () => {
            // Get DOM elements
            const channelPageContainer = document.querySelector(YTB_SELECTOR_CHANNEL_PAGE);

            // If filters do not exist, do create them...
            if (!channelPageContainer.querySelectorAll(`.${CLASS_FILTER_CONTAINER_CHANNEL}`).length) {
                // Create the filters container
                const filterContainer = document.createElement('div');
                filterContainer.classList.add(CLASS_FILTER_CONTAINER_CHANNEL);

                // Create filter buttons
                renderButtonsFilters(filterContainer, [
                    { id: CATEGORY_ALL, name: CATEGORY_ALL },
                    ...categories,
                    { id: CATEGORY_NOT_ASSIGNED, name: CATEGORY_NOT_ASSIGNED },
                ]);

                // Append the filters to the primary container
                channelPageContainer.prepend(filterContainer);
            }

            // Attach filter onclick event
            const filterButtons = channelPageContainer.querySelectorAll(SELECTOR_FILTER_BUTTON);

            filterButtons.forEach((filterButton) => {
                filterButton.addEventListener('click', () => {
                    const contentList = channelPageContainer.querySelectorAll(YTB_SELECTOR_CHANNEL_RENDERER);
                    const categoryId = filterButton.getAttribute('data-category-id');
                    const forChannelPage = true;

                    if (categoryId === CATEGORY_ALL) {
                        applyDefaultFilter(contentList);
                    } else {
                        applyFilterToContent(contentList, categoryId, channelCategoryAssigned, forChannelPage);
                    }
                });
            });
        };

        /**
         * Subscriptions Page
         */

        // Filter Subscriptions by Category Buttons
        const renderSubscriptionsPageFilters = () => {
            // Get DOM elements
            const subscriptionsPageContainer = document.querySelector(YTB_SELECTOR_SUBSCRIPTION_PAGE);

            // If filters do not exist, do create them...
            if (!subscriptionsPageContainer.querySelectorAll(`.${CLASS_FILTER_CONTAINER_SUBSCRIPTION}`).length) {
                // Create the filters container
                const filterContainer = document.createElement('div');
                filterContainer.classList.add(CLASS_FILTER_CONTAINER_SUBSCRIPTION);

                // Create filter buttons
                renderButtonsFilters(filterContainer, [{ id: CATEGORY_ALL, name: CATEGORY_ALL }, ...categories]);

                // Append the filters to the primary container
                subscriptionsPageContainer.prepend(filterContainer);
            }

            // Attach filter onclick event
            const filterButtons = subscriptionsPageContainer.querySelectorAll(SELECTOR_FILTER_BUTTON);

            filterButtons.forEach((filterButton) => {
                filterButton.addEventListener('click', () => {
                    const contentList = subscriptionsPageContainer.querySelectorAll(YTB_SELECTOR_SUBSCRIPTION_RENDERER);
                    const categoryId = filterButton.getAttribute('data-category-id');
                    const forChannelPage = false;

                    if (categoryId === CATEGORY_ALL) {
                        applyDefaultFilter(contentList);
                    } else {
                        applyFilterToContent(contentList, categoryId, channelCategoryAssigned, forChannelPage);
                    }
                });
            });

            // Observe changes in the subscriptions page
            observeSubscriptionsPage(subscriptionsPageContainer, channelCategoryAssigned);
        };

        /**
         * Run
         */

        // Initial run of the filters
        if (doCategorizeSubscription) {
            // Re-apply the filter every x seconds to handle dynamic content loading on YouTube
            setInterval(() => {
                if (window.location.pathname === '/feed/channels') {
                    renderChannelsPageCategoryDropdown();
                    renderChannelsPageFilters();
                }

                if (window.location.pathname === '/feed/subscriptions') {
                    renderSubscriptionsPageFilters();
                }
            }, 3000);
        }
    }
);
