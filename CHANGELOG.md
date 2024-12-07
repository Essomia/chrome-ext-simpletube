# Changelog

## Unreleased

- Publish extension to Chrome store.
- Remove subscription from category on unsubscribe click.
- Add filter on management subscription page.
- Enhance performance by optimizing the way dynamic content is managed on YouTube.

## Versions

v0.7.0:

- **feat**: options/contentCategories - set and use an id for category filtering instead of the name
- **feat**: options - allow user to rename category name and update all references
- **feat**: options - update save to be on change and not on save button click
- **fix**: options - ensure alert message is now fixed to the top right corner
- **fix**: contentCategories - update channel/subscription page selector to correct DOM container
- **fix**: contentCategories - update constant naming
- **chore**: refactor comments and functions name

v0.6.0:

- **chore**: adding linting and code formating rules
- **chore**: setup files for github (CONTRIBUTING, issue templates, etc)
- **chore**: move extension files into src folder

v0.5.0:

- **feat**: contentcategorize - add observer to reapply filter on new video loaded for subscriptions.
- **feat**: contentcategorize - reduce repetition on filtering logic.
- **feat**: contentcategorize - add filters on channel page.
- **feat**: contentcategorize - create function for reusable features.

v0.4.0:

- **fix**: options - optimize options page display.
- **fix**: options - sort category on save action to ensure consistency.
- **fix**: rename DOM class and ID to have an extension prefix.

v0.3.0:

- **feat**: contentcategorize - add handlers to filter videos on the subscription page based on clicked filter.
- **feat**: contentcategorize - add filter container and buttons without handlers to subscriptions page.
- **fix**: options - limit length for category name.
- **feat**: contentcategorize - add dropdown to assign category to subscriptions management page.
- **feat**: options - allow user to remove category.
- **feat**: options - add option to create categories for subscriptions and enable these categories as filters.
- **chore**: add extension icons.

v0.2.0:

- **feat**: options - allow reset settings to default.
- **feat**: content - hide shorts section and watched videos when option is checked.
- **feat**: options - add option to hide shorts section and watched videos.

v0.1.0:

- **chore**: update background to avoid overriding options on update.
- **feat**: options - add styles to the options page.
- **feat**: content - fade video based on video length filter.
- **feat**: options - create video length filter.
