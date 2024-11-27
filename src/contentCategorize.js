/**
 * Constants
 */
const YTB_SELECTOR_CHANNEL_PAGE = '.ytd-page-manager[page-subtype="subscriptions-channels"]';
const YTB_SELECTOR_CHANNEL_RENDERER = 'ytd-channel-renderer';
const YTB_SELECTOR_SUBSCRIPTION_PAGE = '.ytd-page-manager[page-subtype="subscriptions"]';
const YTB_SELECTOR_SUBSCRIPTION_RENDERER = 'ytd-rich-item-renderer';

const CATEGORY_DD_DEFAULT = 'Category';
const CLASS_CATEGORY_SELECT = 'sptcl-category-select';
const CLASS_CATEGORY_OPTION = 'sptcl-category-option';

const SELECTOR_CHANNEL_LINK = '#main-link.channel-link';
const SELECTOR_CHANNEL_NAME_LINK = '.ytd-channel-name > a.yt-formatted-string';

const CATEGORY_ALL = 'All';
const CATEGORY_NOT_ASSIGNED = 'Not Assigned';
const CLASS_FILTER_CONTAINER_CHANNEL = 'sptcl-channel-filter-container';
const CLASS_FILTER_CONTAINER_SUBSCRIPTION = 'sptcl-subscription-filter-container';
const CLASS_FILTER_BUTTON = 'sptcl-filter-button';
const SELECTOR_FILTER_BUTTON = '.sptcl-filter-button';

/**
 * Get the channel name from the channel block
 * @param {HTMLElement} contentEl - The channel block element
 * @param {boolean} isChannelPage - If the page is a channel page
 * @returns {string} - The channel name
 */
function getChannelName(contentEl, isChannelPage = false) {
    const channelLink = isChannelPage
        ? contentEl.querySelector(SELECTOR_CHANNEL_LINK)
        : contentEl.querySelector(SELECTOR_CHANNEL_NAME_LINK);

    // get the channel name from the link href, remove the leasding slash, and trim the whitespace, and lowercase the channel name for consistency
    const channelNameArr = channelLink?.href?.split('/') || [];
    const channelName = channelNameArr[channelNameArr.length - 1]?.trim()?.toLowerCase() || '';

    return channelName;
}

/**
 * Render the filter buttons for each category
 * @param {HTMLElement} filterContainerEl - The container element to append the buttons
 * @param {string[]} categories - The list of categories
 * @returns {void}
 */
function renderButtonsFilters(filterContainerEl, categories) {
    categories.forEach(({ id, name }) => {
        const filterButtonEl = document.createElement('span');
        filterButtonEl.textContent = name;
        filterButtonEl.setAttribute('data-category-id', id);
        filterButtonEl.classList.add(CLASS_FILTER_BUTTON);

        // Set the default filter to "All" when the page is loaded
        if (name === CATEGORY_ALL) {
            filterButtonEl.setAttribute('data-active', 'true');
        }

        filterButtonEl.addEventListener('click', () => {
            // Add an attribute data-active="true" to the selected filter
            filterContainerEl.querySelectorAll(SELECTOR_FILTER_BUTTON).forEach((btn) => {
                btn.removeAttribute('data-active');
            });

            filterButtonEl.setAttribute('data-active', 'true');
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
function applyFilterToContent(contentArr, categoryId, channelCategoryAssigned, forChannelPage) {
    // Apply the selected filter to the channels
    contentArr.forEach((contentEl) => {
        const channelName = getChannelName(contentEl, forChannelPage);

        // If the category is "Not Assigned"
        if (categoryId === CATEGORY_NOT_ASSIGNED) {
            // Show the content only if the channel is not assigned to any category
            if (!channelCategoryAssigned[channelName]) {
                contentEl.style.display = '';
            } else {
                contentEl.style.display = 'none';
            }
        } else {
            // If the category is assigned to the channel, show the content
            if (channelCategoryAssigned[channelName] === categoryId) {
                contentEl.style.display = '';
            } else {
                contentEl.style.display = 'none';
            }
        }
    });
}

/**
 * Apply the default "All" filter
 * @param {HTMLElement[]} contentArr - The list of contents to filter
 * @returns {void}
 */
function applyDefaultFilter(contentArr) {
    contentArr.forEach((contentEl) => {
        contentEl.style.display = '';
    });
}

/**
 * Observe changes in the subscriptions page and reapply filters
 * @param {HTMLElement} subscriptionsPageContainer - The container element of the subscriptions page
 * @param {Object} channelCategoryAssigned - The list of channels assigned to each category
 * @returns {void}
 */
function observeSubscriptionsPage(subscriptionsPageContainer, channelCategoryAssigned) {
    const observer = new MutationObserver(() => {
        const activeFilterButtonEl = subscriptionsPageContainer.querySelector(
            `${SELECTOR_FILTER_BUTTON}[data-active="true"]`
        );

        if (activeFilterButtonEl) {
            const contentArr = subscriptionsPageContainer.querySelectorAll(YTB_SELECTOR_SUBSCRIPTION_RENDERER);
            const category = activeFilterButtonEl.getAttribute('data-category-id');
            const forChannelPage = false;

            if (category === CATEGORY_ALL) {
                applyDefaultFilter(contentArr);
            } else {
                applyFilterToContent(contentArr, category, channelCategoryAssigned, forChannelPage);
            }
        }
    });

    observer.observe(subscriptionsPageContainer, { childList: true, subtree: true });
}

chrome.storage.sync.get(
    ['doCategorizeSubscription', 'categories', 'channelCategoryAssigned'],
    ({ doCategorizeSubscription, categories, channelCategoryAssigned }) => {
        // Sort categories alphabetically by name
        categories.sort((a, b) => a.name.localeCompare(b.name));

        /**
         * Channel Page: Dropdown for Category Assignment
         */

        const renderChannelsPageCategoryDropdown = () => {
            // Get all channel blocks
            const channelBlockElArray = document.querySelectorAll(YTB_SELECTOR_CHANNEL_RENDERER);

            // If the page doesn't have any channel, skip
            if (!channelBlockElArray.length) return;

            // Add a dropdown for each channel to select categories
            channelBlockElArray.forEach((channelBlockEl) => {
                // Get DOM elements
                const actionsContainerEl = channelBlockEl.querySelector('#buttons');

                // If the dropdown already exists, skip
                if (actionsContainerEl.querySelectorAll(`.${CLASS_CATEGORY_SELECT}`).length > 0) return;

                // Get channel name
                const channelName = getChannelName(channelBlockEl, true);

                // Create the category dropdown
                const selectEl = document.createElement('select');
                selectEl.classList.add(CLASS_CATEGORY_SELECT);

                // Create a default option
                const defaultOptionEl = document.createElement('option');
                defaultOptionEl.text = CATEGORY_DD_DEFAULT;
                defaultOptionEl.classList.add(CLASS_CATEGORY_OPTION);

                selectEl.appendChild(defaultOptionEl);

                // Create each categories as an option
                categories.forEach(({ id, name }) => {
                    const optionEl = document.createElement('option');
                    optionEl.text = name;
                    optionEl.value = id;
                    optionEl.classList.add(CLASS_CATEGORY_OPTION);

                    // Set the selected option if the category is already assigned
                    if (channelCategoryAssigned[channelName] === id) {
                        optionEl.selected = true;
                    }

                    selectEl.appendChild(optionEl);
                });

                // Add event listener to save the selected category
                selectEl.addEventListener('change', () => {
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
            const channelPageContainer = document.querySelector(YTB_SELECTOR_CHANNEL_PAGE);

            // If filters do not exist, do create them...
            if (!channelPageContainer.querySelectorAll(`.${CLASS_FILTER_CONTAINER_CHANNEL}`).length) {
                // Create the filters container
                const filterContainerEl = document.createElement('div');
                filterContainerEl.classList.add(CLASS_FILTER_CONTAINER_CHANNEL);

                // Create filter buttons
                renderButtonsFilters(filterContainerEl, [
                    { id: CATEGORY_ALL, name: CATEGORY_ALL },
                    ...categories,
                    { id: CATEGORY_NOT_ASSIGNED, name: CATEGORY_NOT_ASSIGNED },
                ]);

                // Append the filters to the primary container
                channelPageContainer.prepend(filterContainerEl);
            }

            // Attach filter onclick event
            const filterButtonsArr = channelPageContainer.querySelectorAll(SELECTOR_FILTER_BUTTON);

            filterButtonsArr.forEach((filterButtonEl) => {
                filterButtonEl.addEventListener('click', () => {
                    const contentArr = channelPageContainer.querySelectorAll(YTB_SELECTOR_CHANNEL_RENDERER);
                    const category = filterButtonEl.getAttribute('data-category-id');
                    const forChannelPage = true;

                    if (category === CATEGORY_ALL) {
                        applyDefaultFilter(contentArr);
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
            const subscriptionsPageContainer = document.querySelector(YTB_SELECTOR_SUBSCRIPTION_PAGE);

            // If filters do not exist, do create them...
            if (!subscriptionsPageContainer.querySelectorAll(`.${CLASS_FILTER_CONTAINER_SUBSCRIPTION}`).length) {
                // Create the filters container
                const filterContainerEl = document.createElement('div');
                filterContainerEl.classList.add(CLASS_FILTER_CONTAINER_SUBSCRIPTION);

                // Create filter buttons
                renderButtonsFilters(filterContainerEl, [{ id: CATEGORY_ALL, name: CATEGORY_ALL }, ...categories]);

                // Append the filters to the primary container
                subscriptionsPageContainer.prepend(filterContainerEl);
            }

            // Attach filter onclick event
            const filterButtonsArr = subscriptionsPageContainer.querySelectorAll(SELECTOR_FILTER_BUTTON);

            filterButtonsArr.forEach((filterButtonEl) => {
                filterButtonEl.addEventListener('click', () => {
                    const contentArr = subscriptionsPageContainer.querySelectorAll(YTB_SELECTOR_SUBSCRIPTION_RENDERER);
                    const category = filterButtonEl.getAttribute('data-category-id');
                    const forChannelPage = false;

                    if (category === CATEGORY_ALL) {
                        applyDefaultFilter(contentArr);
                    } else {
                        applyFilterToContent(contentArr, category, channelCategoryAssigned, forChannelPage);
                    }
                });
            });

            // Observe changes in the subscriptions page
            observeSubscriptionsPage(subscriptionsPageContainer, channelCategoryAssigned);
        };

        /**
         * Initialize filters
         */

        if (doCategorizeSubscription) {
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
