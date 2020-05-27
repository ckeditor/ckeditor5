Changelog
=========

All changes in the package are documented in the main repository. See: https://github.com/ckeditor/ckeditor5/blob/master/CHANGELOG.md.

Changes for the past releases are available below.

## [19.0.0](https://github.com/ckeditor/ckeditor5-media-embed/compare/v18.0.0...v19.0.0) (2020-04-29)

### Other changes

* Replaced `LabeledInputView` with `LabeledFieldView`. See [ckeditor/ckeditor5#6110](https://github.com/ckeditor/ckeditor5/issues/6110). ([bc00c8b](https://github.com/ckeditor/ckeditor5-media-embed/commit/bc00c8b))
* Updated translations. ([8ac4d13](https://github.com/ckeditor/ckeditor5-media-embed/commit/8ac4d13))


## [18.0.0](https://github.com/ckeditor/ckeditor5-media-embed/compare/v17.0.0...v18.0.0) (2020-03-19)

Internal changes only (updated dependencies, documentation, etc.).


## [17.0.0](https://github.com/ckeditor/ckeditor5-media-embed/compare/v16.0.0...v17.0.0) (2020-02-19)

### Other changes

* Updated translations. ([7c9dca4](https://github.com/ckeditor/ckeditor5-media-embed/commit/7c9dca4))


## [16.0.0](https://github.com/ckeditor/ckeditor5-media-embed/compare/v15.0.0...v16.0.0) (2019-12-04)

### Other changes

* Updated translations. ([47b693f](https://github.com/ckeditor/ckeditor5-media-embed/commit/47b693f))


## [15.0.0](https://github.com/ckeditor/ckeditor5-media-embed/compare/v11.1.4...v15.0.0) (2019-10-23)

### Other changes

* Updated translations. ([dd2b7aa](https://github.com/ckeditor/ckeditor5-media-embed/commit/dd2b7aa)) ([f3ef359](https://github.com/ckeditor/ckeditor5-media-embed/commit/f3ef359))


## [11.1.4](https://github.com/ckeditor/ckeditor5-media-embed/compare/v11.1.3...v11.1.4) (2019-08-26)

### Other changes

* The issue tracker for this package was moved to https://github.com/ckeditor/ckeditor5/issues. See [ckeditor/ckeditor5#1988](https://github.com/ckeditor/ckeditor5/issues/1988). ([c139f62](https://github.com/ckeditor/ckeditor5-media-embed/commit/c139f62))
* The media widget toolbar should have a proper `aria-label` attribute (see [ckeditor/ckeditor5#1404](https://github.com/ckeditor/ckeditor5/issues/1404)). ([7a95064](https://github.com/ckeditor/ckeditor5-media-embed/commit/7a95064))
* Updated translations. ([bc7f4eb](https://github.com/ckeditor/ckeditor5-media-embed/commit/bc7f4eb))


## [11.1.3](https://github.com/ckeditor/ckeditor5-media-embed/compare/v11.1.2...v11.1.3) (2019-07-10)

Internal changes only (updated dependencies, documentation, etc.).


## [11.1.2](https://github.com/ckeditor/ckeditor5-media-embed/compare/v11.1.1...v11.1.2) (2019-07-04)

### Bug fixes

* Clicking a media preview link should not open a new browser tab unless the media is already selected. Closes [#18](https://github.com/ckeditor/ckeditor5-media-embed/issues/18). ([12bd564](https://github.com/ckeditor/ckeditor5-media-embed/commit/12bd564)

### Other changes

* Updated translations. ([dee6c82](https://github.com/ckeditor/ckeditor5-media-embed/commit/dee6c82)) ([404ae2f](https://github.com/ckeditor/ckeditor5-media-embed/commit/404ae2f))


## [11.1.1](https://github.com/ckeditor/ckeditor5-media-embed/compare/v11.1.0...v11.1.1) (2019-06-05)

### Other changes

* Updated translations. ([075d13f](https://github.com/ckeditor/ckeditor5-media-embed/commit/075d13f))


## [11.1.0](https://github.com/ckeditor/ckeditor5-media-embed/compare/v11.0.0...v11.1.0) (2019-04-10)

### Features

* Added support for mobile YouTube URLs in the default providers configuration. Closes [#82](https://github.com/ckeditor/ckeditor5-media-embed/issues/82). ([9e5cf21](https://github.com/ckeditor/ckeditor5-media-embed/commit/9e5cf21))

### Other changes

* Optimized icons. ([05c3ba0](https://github.com/ckeditor/ckeditor5-media-embed/commit/05c3ba0))
* Updated translations. ([53e6137](https://github.com/ckeditor/ckeditor5-media-embed/commit/53e6137))


## [11.0.0](https://github.com/ckeditor/ckeditor5-media-embed/compare/v10.1.0...v11.0.0) (2019-02-28)

### Bug fixes

* Added `min-width` to `.ck-content .media` to allow integration with tables. Closes [#44](https://github.com/ckeditor/ckeditor5-media-embed/issues/44). ([01129fe](https://github.com/ckeditor/ckeditor5-media-embed/commit/01129fe))
* Media embed figures should have `display: block` in the content styles to prevent Bootstrap from changing their appearance. Closes [ckeditor/ckeditor5#1373](https://github.com/ckeditor/ckeditor5/issues/1373). ([71b2933](https://github.com/ckeditor/ckeditor5-media-embed/commit/71b2933))
* The `AutoMediaEmbed` feature should insert media in place of a pasted link. Closes [#36](https://github.com/ckeditor/ckeditor5-media-embed/issues/36). Closes [#49](https://github.com/ckeditor/ckeditor5-media-embed/issues/49). ([5f79878](https://github.com/ckeditor/ckeditor5-media-embed/commit/5f79878))

### Other changes

* Aligned to the new `WidgetToolbarRepository` API. Replaced the `isMediaWidgetSelected()` utility with `getSelectedMediaViewWidget()`. Renamed `getSelectedMediaElement()` to `getSelectedMediaModelWidget()`. (see [ckeditor/ckeditor5-widget#60](https://github.com/ckeditor/ckeditor5-widget/issues/60)). ([dc89e45](https://github.com/ckeditor/ckeditor5-media-embed/commit/dc89e45))
* The help text under the media URL input should be displayed when it's empty. The quick insertion tip should pop out when the user started typing in the input (see [#5](https://github.com/ckeditor/ckeditor5-media-embed/issues/5)). ([55396b5](https://github.com/ckeditor/ckeditor5-media-embed/commit/55396b5))
* Updated translations. ([a07783b](https://github.com/ckeditor/ckeditor5-media-embed/commit/a07783b)) ([f7942b5](https://github.com/ckeditor/ckeditor5-media-embed/commit/f7942b5)) ([5315b1a](https://github.com/ckeditor/ckeditor5-media-embed/commit/5315b1a))

### BREAKING CHANGES

* Upgraded minimal versions of Node to `8.0.0` and npm to `5.7.1`. See: [ckeditor/ckeditor5#1507](https://github.com/ckeditor/ckeditor5/issues/1507). ([612ea3c](https://github.com/ckeditor/ckeditor5-cloud-services/commit/612ea3c))
* The `isMediaWidgetSelected()` utility has been replaced by `getSelectedMediaViewWidget()` and returns an editing `View` element instead of a `Boolean`.
* The `getSelectedMediaElement()` utility has been renamed to `getSelectedMediaModelWidget()`.


## [10.1.0](https://github.com/ckeditor/ckeditor5-media-embed/compare/v10.0.0...v10.1.0) (2018-12-05)

### Features

* Implemented a tip in the form that helps users discover the auto embedding. Closes [#35](https://github.com/ckeditor/ckeditor5-media-embed/issues/35). ([ebdec7e](https://github.com/ckeditor/ckeditor5-media-embed/commit/ebdec7e))
* Improved responsiveness of the media form view in narrow viewports (see [ckeditor/ckeditor5#416](https://github.com/ckeditor/ckeditor5/issues/416)). ([c753463](https://github.com/ckeditor/ckeditor5-media-embed/commit/c753463))

### Bug fixes

* Floated content and media widgets should not overlap. Closes [#53](https://github.com/ckeditor/ckeditor5-media-embed/issues/53). ([d3aa6e8](https://github.com/ckeditor/ckeditor5-media-embed/commit/d3aa6e8))
* Made the media interactive when the editor is in the read-only mode (just like links). Closes [#58](https://github.com/ckeditor/ckeditor5-media-embed/issues/58). ([09c387a](https://github.com/ckeditor/ckeditor5-media-embed/commit/09c387a))
* The `AutoMediaEmbed` should not upcast the pasted URL if a media element is disallowed at the current selection. Closes [#47](https://github.com/ckeditor/ckeditor5-media-embed/issues/47). ([47092c6](https://github.com/ckeditor/ckeditor5-media-embed/commit/47092c6))

### Other changes

* Improved SVG icons size. See [ckeditor/ckeditor5-theme-lark#206](https://github.com/ckeditor/ckeditor5-theme-lark/issues/206). ([b95fc42](https://github.com/ckeditor/ckeditor5-media-embed/commit/b95fc42))
* Moved widget spacing styles from `@ckeditor/ckeditor5-theme-lark` to the feature content styles sheet (see [ckeditor/ckeditor5-theme-lark#209](https://github.com/ckeditor/ckeditor5-theme-lark/issues/209)). ([501a567](https://github.com/ckeditor/ckeditor5-media-embed/commit/501a567))
* Updated translations. ([58614b0](https://github.com/ckeditor/ckeditor5-media-embed/commit/58614b0)) ([120912c](https://github.com/ckeditor/ckeditor5-media-embed/commit/120912c)) ([e1b4206](https://github.com/ckeditor/ckeditor5-media-embed/commit/e1b4206)) ([c376e7f](https://github.com/ckeditor/ckeditor5-media-embed/commit/c376e7f))


## [10.0.0](https://github.com/ckeditor/ckeditor5-media-embed/tree/v10.0.0) (2018-10-08)

Initial implementation of the media embed feature.
