# SimpleTube - YouTube Filters & Subscriptions Manager

This Chrome extension allows users to filter YouTube content by video length, manage the visibility of watched videos, and hide the Shorts section. It enhances the YouTube experience by giving users more control over the content they see on their homepage and subscriptions page.

## Features

-   **Hide Shorts Section**: Remove the "Shorts" section from YouTube to declutter your homepage.
-   **Hide Watched Videos**: Hide videos that you have already watched, helping you focus on new content.
-   **Video Length Filter**: Adjust the visibility of videos based on their length. You can specify a minimum and maximum duration, and videos that fall outside this range will have their opacity reduced.

## Installation

> Go to Chrome's extension website and search for 'SimpleTube' extension.

### Usage

Once installed and configured, the extension automatically applies your selected filters on YouTube.

-   Videos outside the specified length range will have reduced opacity.
-   Watched videos can be hidden entirely.
-   The "Shorts" section can be hidden for a more focused YouTube experience.

## Directory Structure

```bash
- chrome-ext-youtube-manager-and-filters/
  - manifest.json   # Defines the configuration for the Chrome extension, including permissions and entry points.
  - background.js   # Sets default settings when the extension is installed.
  - options.html    # The user interface for configuring the extension settings.
  - options.js      # Handles saving and loading settings from the options page.
  - content.js      # Applies the filters on YouTube pages.
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

3. Make changes to the appropriate files (`manifest.json`, `background.js`, `options.html`, `options.js`, `content.js`).
4. Reload the extension on the Chrome Extensions page to apply the changes.
5. (Re)configure the extension _(on reload, settings are reinitialized)_:

    - Click on the extension icon in the Chrome toolbar.
    - Select **Options** to open the settings page.
    - Configure your preferences for video length, Shorts, and watched videos.

## License

This project is licensed under the MIT License.
