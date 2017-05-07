Changelog
=========

## [0.8.0](https://github.com/ckeditor/ckeditor5-theme/compare/v0.7.0...v0.8.0) (2017-05-07)

### Other changes

* Removed the `contextualtoolbar.scss` sass file. Converted the `ck-editor-toolbar` mixin into a class. Closes [#75](https://github.com/ckeditor/ckeditor5-theme/issues/75). ([9e75920](https://github.com/ckeditor/ckeditor5-theme/commit/9e75920))

  BREAKING CHANGE: The `ck-editor-toolbar` mixin is no longer available. Please use `.ck-editor-toolbar` class instead.
  BREAKING CHANGE: The `ck-toolbar__container` class has been renamed, use `.ck-toolbar-container` instead.
* Updated class names after the refactoring in BalloonPanelView class. Closes [#84](https://github.com/ckeditor/ckeditor5-theme/issues/84). ([bdb2fa6](https://github.com/ckeditor/ckeditor5-theme/commit/bdb2fa6))

### BREAKING CHANGES

* The `ck-editor-toolbar` mixin is no longer available. Please use `.ck-editor-toolbar` class instead.
* The `ck-toolbar__container` class has been renamed, use `.ck-toolbar-container` instead.


## [0.7.0](https://github.com/ckeditor/ckeditor5-theme/compare/v0.6.1...v0.7.0) (2017-04-05)

### Features

* Added styles for active list items. Closes [#80](https://github.com/ckeditor/ckeditor5-theme/issues/80). ([05d3716](https://github.com/ckeditor/ckeditor5-theme/commit/05d3716))
* Provided styles for `FloatingToolbarView`. Closes [#73](https://github.com/ckeditor/ckeditor5-theme/issues/73). ([2c64d41](https://github.com/ckeditor/ckeditor5-theme/commit/2c64d41))

### Other changes

* Extracted "ck-hidden" CSS class to ckeditor5-ui. Closes [#78](https://github.com/ckeditor/ckeditor5-theme/issues/78). ([82b25fa](https://github.com/ckeditor/ckeditor5-theme/commit/82b25fa))
* Removed tick symbol from active list item, used inverted background and text colors instead. Closes [#82](https://github.com/ckeditor/ckeditor5-theme/issues/82). ([a2eb843](https://github.com/ckeditor/ckeditor5-theme/commit/a2eb843))


## [0.6.1](https://github.com/ckeditor/ckeditor5-theme/compare/v0.6.0...v0.6.1) (2017-03-06)

### Bug fixes

* Toolbar separator and new line CSS classes should follow our naming guidelines. Closes [#76](https://github.com/ckeditor/ckeditor5/issues/76). ([a3d9276](https://github.com/ckeditor/ckeditor5-theme/commit/a3d9276))
