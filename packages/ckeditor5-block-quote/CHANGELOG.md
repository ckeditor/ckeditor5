Changelog
=========

## [11.0.0](https://github.com/ckeditor/ckeditor5-block-quote/compare/v10.1.1...v11.0.0) (2019-02-28)

### Other changes

* Make `BlockQuoteCommand` wrap only top-most blocks. ([17c9d3b](https://github.com/ckeditor/ckeditor5-block-quote/commit/17c9d3b))
* Updated translations. ([f452b45](https://github.com/ckeditor/ckeditor5-block-quote/commit/f452b45)) ([8d8fde2](https://github.com/ckeditor/ckeditor5-block-quote/commit/8d8fde2)) ([cb7ec44](https://github.com/ckeditor/ckeditor5-block-quote/commit/cb7ec44))

### BREAKING CHANGES

* Upgraded minimal versions of Node to `8.0.0` and npm to `5.7.1`. See: [ckeditor/ckeditor5#1507](https://github.com/ckeditor/ckeditor5/issues/1507). ([612ea3c](https://github.com/ckeditor/ckeditor5-cloud-services/commit/612ea3c))


## [10.1.1](https://github.com/ckeditor/ckeditor5-block-quote/compare/v10.1.0...v10.1.1) (2018-12-05)

Internal changes only (updated dependencies, documentation, etc.).


## [10.1.0](https://github.com/ckeditor/ckeditor5-block-quote/compare/v10.0.2...v10.1.0) (2018-10-08)

### Features

* Implemented a post-fixer for cleaning incorrect blockquotes. ([fcb00c0](https://github.com/ckeditor/ckeditor5-block-quote/commit/fcb00c0))

### Other changes

* Updated translations. ([a0078f3](https://github.com/ckeditor/ckeditor5-block-quote/commit/a0078f3))


## [10.0.2](https://github.com/ckeditor/ckeditor5-block-quote/compare/v10.0.1...v10.0.2) (2018-07-18)

### Other changes

* Updated translations. ([170a8fd](https://github.com/ckeditor/ckeditor5-block-quote/commit/170a8fd))


## [10.0.1](https://github.com/ckeditor/ckeditor5-block-quote/compare/v10.0.0...v10.0.1) (2018-06-21)

### Other changes

* Updated translations. ([4a51fd8](https://github.com/ckeditor/ckeditor5-block-quote/commit/4a51fd8))


## [10.0.0](https://github.com/ckeditor/ckeditor5-block-quote/compare/v1.0.0-beta.4...v10.0.0) (2018-04-25)

### Other changes

* Changed the license to GPL2+ only. See [ckeditor/ckeditor5#991](https://github.com/ckeditor/ckeditor5/issues/991). ([a4fa6e7](https://github.com/ckeditor/ckeditor5-block-quote/commit/a4fa6e7))

### BREAKING CHANGES

* The license under which CKEditor 5 is released has been changed from a triple GPL, LGPL and MPL license to a GPL2+ only. See [ckeditor/ckeditor5#991](https://github.com/ckeditor/ckeditor5/issues/991) for more information.


## [1.0.0-beta.4](https://github.com/ckeditor/ckeditor5-block-quote/compare/v1.0.0-beta.2...v1.0.0-beta.4) (2018-04-19)

Internal changes only (updated dependencies, documentation, etc.).


## [1.0.0-beta.2](https://github.com/ckeditor/ckeditor5-block-quote/compare/v1.0.0-beta.1...v1.0.0-beta.2) (2018-04-10)

### Bug fixes

* The outline of a quoted image should not be cropped. Closes [#15](https://github.com/ckeditor/ckeditor5-block-quote/issues/15). ([1512135](https://github.com/ckeditor/ckeditor5-block-quote/commit/1512135))


## [1.0.0-beta.1](https://github.com/ckeditor/ckeditor5-block-quote/compare/v1.0.0-alpha.2...v1.0.0-beta.1) (2018-03-15)

### Other changes

* Aligned feature class naming to the new scheme. ([cc723c3](https://github.com/ckeditor/ckeditor5-block-quote/commit/cc723c3))
* Migrated package styles to PostCSS. Moved the visual styles to `@ckeditor/ckeditor5-theme-lark` (see [ckeditor/ckeditor5-ui#144](https://github.com/ckeditor/ckeditor5-ui/issues/144)). ([c973931](https://github.com/ckeditor/ckeditor5-block-quote/commit/c973931))


## [1.0.0-alpha.2](https://github.com/ckeditor/ckeditor5-block-quote/compare/v1.0.0-alpha.1...v1.0.0-alpha.2) (2017-11-14)

### Other changes

* Updated translations. ([e150fe2](https://github.com/ckeditor/ckeditor5-block-quote/commit/e150fe2))


## [1.0.0-alpha.1](https://github.com/ckeditor/ckeditor5-block-quote/compare/v0.2.0...v1.0.0-alpha.1) (2017-10-03)

### Other changes

* Improved default blockquote styling so it does not overlap with floated images. Closes [#12](https://github.com/ckeditor/ckeditor5-block-quote/issues/12). ([fb09418](https://github.com/ckeditor/ckeditor5-block-quote/commit/fb09418))


## [0.2.0](https://github.com/ckeditor/ckeditor5-block-quote/compare/v0.1.1...v0.2.0) (2017-09-03)

### Features

* <kbd>Enter</kbd> in the block quote will scroll the viewport to the selection. See ckeditor/ckeditor5-engine#660. ([09dc740](https://github.com/ckeditor/ckeditor5-block-quote/commit/09dc740))

### Other changes

* Aligned the implementation to the new Command API (see https://github.com/ckeditor/ckeditor5-core/issues/88). ([627510a](https://github.com/ckeditor/ckeditor5-block-quote/commit/627510a))

### BREAKING CHANGES

* The command API has been changed.


## [0.1.1](https://github.com/ckeditor/ckeditor5-block-quote/compare/v0.1.0...v0.1.1) (2017-05-07)

### Bug fixes

* Block quote should not be applied to image's caption. Closes: [#10](https://github.com/ckeditor/ckeditor5-block-quote/issues/10). ([06de874](https://github.com/ckeditor/ckeditor5-block-quote/commit/06de874))

### Other changes

* Updated translations. ([5e23f86](https://github.com/ckeditor/ckeditor5-block-quote/commit/5e23f86))


## 0.1.0 (2017-04-05)

### Features

* Introduced the block quote feature. Closes [#1](https://github.com/ckeditor/ckeditor5-block-quote/issues/1). ([239015b](https://github.com/ckeditor/ckeditor5-block-quote/commit/239015b))
