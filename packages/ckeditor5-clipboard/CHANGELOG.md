Changelog
=========

## [0.7.0](https://github.com/ckeditor/ckeditor5-clipboard/compare/v0.6.0...v0.7.0) (2017-09-03)

### Bug fixes

* Whitespaces around inline elements will not be lost upon pasting. Closes [#24](https://github.com/ckeditor/ckeditor5-clipboard/issues/24). ([5888743](https://github.com/ckeditor/ckeditor5-clipboard/commit/5888743))

### Features

* Added the `'dragover'` event to ClipboardObserver. ([00c7567](https://github.com/ckeditor/ckeditor5-clipboard/commit/00c7567))
* Added `dropRange` to the `drop` event and `targetRanges` to the `clipboardInput` event. Closes [#29](https://github.com/ckeditor/ckeditor5-clipboard/issues/29). ([86daed9](https://github.com/ckeditor/ckeditor5-clipboard/commit/86daed9))
* Disable pasting and cutting when the editor is read-only. Closes [#26](https://github.com/ckeditor/ckeditor5-clipboard/issues/26). ([0ba74d5](https://github.com/ckeditor/ckeditor5-clipboard/commit/0ba74d5))
* The viewport will be scrolled to the selection on paste. See ckeditor/ckeditor5-engine#660. ([9a0e20f](https://github.com/ckeditor/ckeditor5-clipboard/commit/9a0e20f))


## [0.6.0](https://github.com/ckeditor/ckeditor5-clipboard/compare/v0.5.0...v0.6.0) (2017-05-07)

### Bug fixes

* Plain text data is now available in the clipboard when copying or cutting the editor contents. Closes [#11](https://github.com/ckeditor/ckeditor5-clipboard/issues/11). ([8a01e0f](https://github.com/ckeditor/ckeditor5-clipboard/commit/8a01e0f))

### Features

* Introduced `DataTransfer#files` property. Change the clipboard input pipeline. Closes [#16](https://github.com/ckeditor/ckeditor5-clipboard/issues/16). ([e4e7e10](https://github.com/ckeditor/ckeditor5-clipboard/commit/e4e7e10))

### BREAKING CHANGES

* The `clipboardInput` event now contains only the `dataTransfer` property (`content` was removed). The separate `inputTransformation` event was introduced for the content transformations.


## [0.5.0](https://github.com/ckeditor/ckeditor5-clipboard/compare/v0.4.1...v0.5.0) (2017-04-05)

### Other changes

* Aligned use of the `DataController` to the latest API. Closes [#14](https://github.com/ckeditor/ckeditor5-clipboard/issues/14). ([8f98e2b](https://github.com/ckeditor/ckeditor5-clipboard/commit/8f98e2b))

### Features

* Named existing plugin(s). ([3d37f53](https://github.com/ckeditor/ckeditor5-clipboard/commit/3d37f53))


## [0.4.1](https://github.com/ckeditor/ckeditor5-clipboard/compare/v0.4.0...v0.4.1) (2017-03-06)

Internal changes only (updated dependencies, documentation, etc.).
