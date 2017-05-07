Changelog
=========

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
