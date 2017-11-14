Changelog
=========

## [1.0.0-alpha.2](https://github.com/ckeditor/ckeditor5-widget/compare/v1.0.0-alpha.1...v1.0.0-alpha.2) (2017-11-14)

### Bug fixes

* The <kbd>Ctrl</kbd>+<kbd>A</kbd> keystroke will be now correctly handled when a widget is selected. Closes [#23](https://github.com/ckeditor/ckeditor5-widget/issues/23). ([3e8f91f](https://github.com/ckeditor/ckeditor5-widget/commit/3e8f91f))
* View element's `setAttribute()` method should be used with string values of the `contenteditable` attribute. Closes [#26](https://github.com/ckeditor/ckeditor5-widget/issues/26). ([d2a6cf5](https://github.com/ckeditor/ckeditor5-widget/commit/d2a6cf5))

### Other changes

* Widgets highlight remove handler will now use only descriptor id, instead of the full descriptor. ([1dfdc83](https://github.com/ckeditor/ckeditor5-widget/commit/1dfdc83))


## [1.0.0-alpha.1](https://github.com/ckeditor/ckeditor5-widget/compare/v0.2.0...v1.0.0-alpha.1) (2017-10-03)

### Bug fixes

* <kbd>Backspace</kbd> and <kbd>Delete</kbd> should not delete a widget when the editor is in the read-only mode. Closes [#6](https://github.com/ckeditor/ckeditor5-widget/issues/6). ([5f64125](https://github.com/ckeditor/ckeditor5-widget/commit/5f64125))
* Nested element structures next to widgets will be correctly removed when pressing <kbd>Backspace</kbd> or <kbd>Delete</kbd>. Closes [#19](https://github.com/ckeditor/ckeditor5-widget/issues/19). ([27ee848](https://github.com/ckeditor/ckeditor5-widget/commit/27ee848))


## [0.2.0](https://github.com/ckeditor/ckeditor5-widget/compare/v0.1.1...v0.2.0) (2017-09-03)

### Bug fixes

* Added initial contenteditable state for editable widget. Closes [#9](https://github.com/ckeditor/ckeditor5-widget/issues/9). ([c6321ff](https://github.com/ckeditor/ckeditor5-widget/commit/c6321ff))

### Features

* <kbd>Ctrl</kbd>+<kbd>A</kbd> in a nested editable should select nested editable's content. Closes [#13](https://github.com/ckeditor/ckeditor5-widget/issues/13). ([35a8aff](https://github.com/ckeditor/ckeditor5-widget/commit/35a8aff))

### Other changes

* Adjusted widget to the editor read-only mode. Closes [#7](https://github.com/ckeditor/ckeditor5-widget/issues/7). ([2726873](https://github.com/ckeditor/ckeditor5-widget/commit/2726873))
* Introduced highlights support for widgets. Closes [#11](https://github.com/ckeditor/ckeditor5-widget/issues/11). ([0bd3d66](https://github.com/ckeditor/ckeditor5-widget/commit/0bd3d66))


## [0.1.1](https://github.com/ckeditor/ckeditor5-widget/compare/v0.1.0...v0.1.1) (2017-05-07)

Internal changes only (updated dependencies, documentation, etc.).

## 0.1.0 (2017-04-05)

### Features

* Initial implementation (the code was moved from the `ckeditor5-image` package). Closes [#1](https://github.com/ckeditor/ckeditor5-widget/issues/1). ([564dd97](https://github.com/ckeditor/ckeditor5-widget/commit/564dd97))
