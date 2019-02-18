Changelog
=========

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
