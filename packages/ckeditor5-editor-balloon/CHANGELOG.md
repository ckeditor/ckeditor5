Changelog
=========

## [11.0.2](https://github.com/ckeditor/ckeditor5-editor-balloon/compare/v11.0.1...v11.0.2) (2018-12-05)

Internal changes only (updated dependencies, documentation, etc.).


## [11.0.1](https://github.com/ckeditor/ckeditor5-editor-balloon/compare/v11.0.0...v11.0.1) (2018-10-08)

Internal changes only (updated dependencies, documentation, etc.).


## [11.0.0](https://github.com/ckeditor/ckeditor5-editor-balloon/compare/v10.0.1...v11.0.0) (2018-07-18)

### Features

* Editor can now be created with initial data passed to the `create()` method. Closes [#18](https://github.com/ckeditor/ckeditor5-editor-balloon/issues/18). ([48c265c](https://github.com/ckeditor/ckeditor5-editor-balloon/commit/48c265c))

### Other changes

* Used the `EditorUI` as a parent class for the `BalloonEditorUI` (see [ckeditor/ckeditor5-core#130](https://github.com/ckeditor/ckeditor5-core/issues/130)). ([03af1c0](https://github.com/ckeditor/ckeditor5-editor-balloon/commit/03af1c0))

### BREAKING CHANGES

* The `BalloonEditor#element` property was renamed to `BalloonEditor#sourceElement` and `BalloonEditor#updateElement()` method to `BalloonEditor#updateSourceElement()`. See [ckeditor/ckeditor5-core#64](https://github.com/ckeditor/ckeditor5-core/issues/64).


## [10.0.1](https://github.com/ckeditor/ckeditor5-editor-balloon/compare/v10.0.0...v10.0.1) (2018-06-21)

Internal changes only (updated dependencies, documentation, etc.).


## [10.0.0](https://github.com/ckeditor/ckeditor5-editor-balloon/compare/v1.0.0-beta.4...v10.0.0) (2018-04-25)

### Other changes

* Changed the license to GPL2+ only. See [ckeditor/ckeditor5#991](https://github.com/ckeditor/ckeditor5/issues/991). ([00d20c1](https://github.com/ckeditor/ckeditor5-editor-balloon/commit/00d20c1))

### BREAKING CHANGES

* The license under which CKEditor 5 is released has been changed from a triple GPL, LGPL and MPL license to a GPL2+ only. See [ckeditor/ckeditor5#991](https://github.com/ckeditor/ckeditor5/issues/991) for more information.


## [1.0.0-beta.4](https://github.com/ckeditor/ckeditor5-editor-balloon/compare/v1.0.0-beta.2...v1.0.0-beta.4) (2018-04-19)

Internal changes only (updated dependencies, documentation, etc.).


## [1.0.0-beta.2](https://github.com/ckeditor/ckeditor5-editor-balloon/compare/v1.0.0-beta.1...v1.0.0-beta.2) (2018-04-10)

Internal changes only (updated dependencies, documentation, etc.).


## [1.0.0-beta.1](https://github.com/ckeditor/ckeditor5-editor-balloon/compare/v1.0.0-alpha.2...v1.0.0-beta.1) (2018-03-15)

### Other changes

* Migrated the editor styles to PostCSS (see [ckeditor/ckeditor5-ui#144](https://github.com/ckeditor/ckeditor5-ui/issues/144)). ([bd239e9](https://github.com/ckeditor/ckeditor5-editor-balloon/commit/bd239e9))


## [1.0.0-alpha.2](https://github.com/ckeditor/ckeditor5-editor-balloon/compare/v1.0.0-alpha.1...v1.0.0-alpha.2) (2017-11-14)

### Other changes

* Aligned UI library usage to the [changes in the UI framework](https://github.com/ckeditor/ckeditor5-ui/pull/332).


## [1.0.0-alpha.1](https://github.com/ckeditor/ckeditor5-editor-balloon/compare/v0.1.0...v1.0.0-alpha.1) (2017-10-03)

### Other changes

* The editor name has been changed from `@ckeditor/ckeditor5-build-balloon-toolbar` to `@ckeditor/ckeditor5-build-balloon` (the class name has been changed to `BalloonEditor`). See [ckeditor/ckeditor5#546](https://github.com/ckeditor/ckeditor5/issues/546) for more information. ([5fc4f60](https://github.com/ckeditor/ckeditor5-editor-balloon/commit/5fc4f60))

### BREAKING CHANGES

* The editor name has been changed. See [ckeditor/ckeditor5#546](https://github.com/ckeditor/ckeditor5/issues/546).


## 0.1.0 (2017-09-03)

### Features

* The first implementation of the balloon editor. Closes [#1](https://github.com/ckeditor/ckeditor5-editor-balloon/issues/1). ([a4462ac](https://github.com/ckeditor/ckeditor5-editor-balloon/commit/a4462ac))
