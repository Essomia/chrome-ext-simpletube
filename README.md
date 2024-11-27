# SimpleTube - YouTube Filters & Subscriptions Manager

This Chrome extension allows users to filter YouTube content by video length, manage the visibility of watched videos, hide the Shorts section, and organize channel subscriptions into categories for easier navigation and filtering.

## Features

- **Hide Shorts Section**: Remove the "Shorts" section from YouTube to declutter your homepage.
- **Hide Watched Videos**: Hide videos that you have already watched, helping you focus on new content.
- **Video Length Filter**: Adjust the visibility of videos based on their length. You can specify a minimum and maximum duration, and videos that fall outside this range will have their opacity reduced.
- **Subscription Categories**: Organize your channel subscriptions into categories and filter videos on your subscriptions page based on these categories. Filtering persists even when new content is dynamically loaded by YouTube, but not on page reload.
    - **Channel Page Dropdown for Category Assignment**: Assign categories to each subscribed channel directly on the channel management page.
    - **Category Filters on Subscriptions and Channel Pages**: Easily filter your subscription videos or channels by category, including categories like "All" or "Not Assigned".
    - **Persistent Filters on Dynamic Content**: The filter applied on the subscription page remains active as new videos are loaded dynamically by YouTube, providing a seamless browsing experience.

## Installation

> Go to Chrome's extension website and search for 'SimpleTube' extension.

### Usage

Once installed and configured, the extension automatically applies your selected filters on YouTube.

- Videos outside the specified length range will have reduced opacity.
- Watched videos can be hidden entirely.
- The "Shorts" section can be hidden for a more focused YouTube experience.
- Filter your subscriptions page by categories for easier content discovery.
    - Assign categories to your channels subscriptions on the channel page and filter based on these assignments for better management.

## Directory Structure

```bash
- chrome-ext-simpletube/src/
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
    cd chrome-ext-simpletube
    ```

2. Load the extension in Chrome:

    - Open Chrome and navigate to `chrome://extensions/`.
    - Enable **Developer mode** in the top right corner.
    - Click **Load unpacked** and select the `chrome-ext-simpletube/src` folder.

3. Make changes to the appropriate files (`manifest.json`, `background.js`, `options.html`, `options.js`, `content.js`, `contentCategorize.js`).
4. Reload the extension on the Chrome Extensions page to apply the changes.
5. (Re)configure the extension _(on reload, some settings are reinitialized)_:

    - Click on the extension icon in the Chrome toolbar.
    - Select **Options** to open the settings page.
    - Configure your preferences for video length, Shorts, watched videos, and subscription categories.

## License

This project is licensed under the MIT License.
