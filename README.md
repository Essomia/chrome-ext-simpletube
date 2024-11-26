# SimpleTube - YouTube Filters & Subscriptions Manager

This Chrome extension allows users to filter YouTube content by video length, manage the visibility of watched videos, hide the Shorts section, and organize channel subscriptions into categories for easier navigation and filtering.

## Features

-   **Hide Shorts Section**: Remove the "Shorts" section from YouTube to declutter your homepage.
-   **Hide Watched Videos**: Hide videos that you have already watched, helping you focus on new content.
-   **Video Length Filter**: Adjust the visibility of videos based on their length. You can specify a minimum and maximum duration, and videos that fall outside this range will have their opacity reduced.
-   **Subscription Categories**: Organize your channel subscriptions into categories and filter videos on your subscriptions page based on these categories. Filtering persists even when new content is dynamically loaded by YouTube, but not on page reload.

## Installation

> Go to Chrome's extension website and search for 'SimpleTube' extension.

### Usage

Once installed and configured, the extension automatically applies your selected filters on YouTube.

-   Videos outside the specified length range will have reduced opacity.
-   Watched videos can be hidden entirely.
-   The "Shorts" section can be hidden for a more focused YouTube experience.
-   Filter your subscriptions page by categories for easier content discovery.

## Directory Structure

```bash
- chrome-ext-youtube-manager-and-filters/
  - manifest.json         # Defines the configuration for the Chrome extension, including permissions and entry points.
  - background.js         # Sets default settings when the extension is installed.
  - options.html          # The user interface for configuring the extension settings.
  - options.js            # Handles saving and loading settings from the options page.
  - content.js            # Applies the filters on YouTube pages.
  - contentCategorize.js  # Handles categorizing channels and filtering subscriptions.
  ...
```

## Local Development

If you want to modify or contribute to this extension:

1. Clone the repository:

    ```bash
    git clone <repository-url>
    cd chrome-ext-youtube-manager-and-filters
    ```

2. Load the extension in Chrome:

    - Open Chrome and navigate to `chrome://extensions/`.
    - Enable **Developer mode** in the top right corner.
    - Click **Load unpacked** and select the `chrome-ext-youtube-manager-and-filters` folder.

3. Make changes to the appropriate files (`manifest.json`, `background.js`, `options.html`, `options.js`, `content.js`, `contentCategorize.js`).
4. Reload the extension on the Chrome Extensions page to apply the changes.
5. (Re)configure the extension _(on reload, somes settings are reinitialized)_:

    - Click on the extension icon in the Chrome toolbar.
    - Select **Options** to open the settings page.
    - Configure your preferences for video length, Shorts, watched videos, and subscription categories.

## History Log

### Versions

v0.4.0:

    - fix: options - optimize options page display
    - fix: options - sort category on save action to ensure consistency
    - fix: rename DOM class and ID to have a extension prefix

v0.3.0:

    - feat: contentCategorize - add handlers to filter videos on the subscription page based on the category filter button clicked
    - feat: contentCategorize - add filter container and buttons without handlers to subscriptions page
    - fix: options - limit length for category name
    - feat: contentCategorize - add dropdown to assign category to subscriptions management page
    - feat: options - allow user to remove category
    - feat: options - add option to create categories for subscriptions and emable these categories as filters
    - chore: add extensions icons

v0.2.0:

    - feat: options - allow reset settings to default
    - feat: content - hide shorts section and watched videos when option is checked
    - feat: options - add option to hide shorts section and watched videos

v0.1.0:

    - chore: update background to avoid overriding options on update
    - feat: options - add styles to the options page
    - feat: content - fade video based on video length filter
    - feat: options - create video length filter

### Future Enhancements

-   Publish extension to chrome store
-   Remove subscription from category on unsubscribe click
-   Add filter on management subscription page
-   Enhance performance by optimizing the way dynamic content is managed on YouTube

## License

This project is licensed under the MIT License.
