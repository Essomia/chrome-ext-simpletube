/**
 * Chrome Extension Content Script.
 * Will run on all YouTube page.
 */

/**
 * Main
 */

chrome.storage.sync.get(
    ['doHideShorts', 'doHideWatched', 'doFadeByLength', 'videoLengthMax', 'videoLengthMin'],
    ({ doHideShorts, doHideWatched, doFadeByLength, videoLengthMax, videoLengthMin }) => {
        /**
         * Filters videos
         */

        // Hide watched videos (if the option is enabled)
        const hideWatchedVideos = () => {
            if (doHideWatched) {
                const videoElements = document.querySelectorAll('ytd-rich-item-renderer');

                videoElements.forEach((video) => {
                    const progressBar = video.querySelector('ytd-thumbnail-overlay-resume-playback-renderer');

                    if (progressBar) {
                        video.style.display = 'none';
                    }
                });
            }
        };

        // Hide shorts sections (if the option is enabled)
        const hideShortsSections = () => {
            if (doHideShorts) {
                const shortsSections = document.querySelectorAll('ytd-rich-shelf-renderer[is-shorts]');

                shortsSections.forEach((shorts) => {
                    shorts.style.display = 'none';
                });
            }
        };

        // Fade videos based on their length (if the option is enabled)
        const fadeVideosByLength = () => {
            if (doFadeByLength) {
                // Select all video elements on the YouTube page
                const videoElements = document.querySelectorAll('ytd-rich-item-renderer');

                videoElements.forEach((video) => {
                    // Find the element that contains the video duration
                    const timeElement = video.querySelector('ytd-thumbnail-overlay-time-status-renderer span');

                    if (timeElement) {
                        // Split the duration text into parts (e.g., "12:34" or "1:02:34")
                        const timeParts = timeElement.textContent.trim().split(':').map(Number);
                        let videoMinutes = 0;

                        // Calculate the video length in minutes
                        if (timeParts.length === 2) {
                            // Format MM:SS
                            videoMinutes = timeParts[0] + timeParts[1] / 60;
                        } else if (timeParts.length === 3) {
                            // Format HH:MM:SS
                            videoMinutes = timeParts[0] * 60 + timeParts[1] + timeParts[2] / 60;
                        }

                        // Set the opacity of the video thumbnail based on the video length
                        if (videoMinutes < videoLengthMin || videoMinutes > videoLengthMax) {
                            video.style.opacity = '0.2'; // Reduce opacity if video is outside the filter range
                        } else {
                            video.style.opacity = '1'; // Set normal opacity otherwise
                        }
                    }
                });
            }
        };

        /**
         * Run
         */

        // Initial run of the filters
        hideWatchedVideos();
        hideShortsSections();
        fadeVideosByLength();

        // Re-apply the filter every x seconds to handle dynamic content loading on YouTube
        setInterval(() => {
            hideWatchedVideos();
            hideShortsSections();
            fadeVideosByLength();
        }, 3000);
    }
);
