Changelog
=========

All changes in the package are documented in the main repository. See: https://github.com/ckeditor/ckeditor5/blob/master/CHANGELOG.md.

Changes for the past releases are available below.

## [19.0.0](https://github.com/ckeditor/ckeditor5-editor-balloon/compare/v18.0.0...v19.0.0) (April 29, 2020)

Internal changes only (updated dependencies, documentation, etc.).


## [18.0.0](https://github.com/ckeditor/ckeditor5-editor-balloon/compare/v17.0.0...v18.0.0) (March 19, 2020)

Internal changes only (updated dependencies, documentation, etc.).


## [17.0.0](https://github.com/ckeditor/ckeditor5-editor-balloon/compare/v16.0.0...v17.0.0) (February 19, 2020)

Internal changes only (updated dependencies, documentation, etc.).


## [16.0.0](https://github.com/ckeditor/ckeditor5-editor-balloon/compare/v15.0.0...v16.0.0) (December 4, 2019)

Internal changes only (updated dependencies, documentation, etc.).


## [15.0.0](https://github.com/ckeditor/ckeditor5-editor-balloon/compare/v12.2.2...v15.0.0) (October 23, 2019)

Internal changes only (updated dependencies, documentation, etc.).


## [12.2.2](https://github.com/ckeditor/ckeditor5-editor-balloon/compare/v12.2.1...v12.2.2) (August 26, 2019)

### Other changes

* The issue tracker for this package was moved to https://github.com/ckeditor/ckeditor5/issues. See [ckeditor/ckeditor5#1988](https://github.com/ckeditor/ckeditor5/issues/1988). ([36f5ae9](https://github.com/ckeditor/ckeditor5-editor-balloon/commit/36f5ae9))
* Introduced a check that prevents sharing source elements between editor instances. See [ckeditor/ckeditor5#746](https://github.com/ckeditor/ckeditor5/issues/746). ([5159981](https://github.com/ckeditor/ckeditor5-editor-balloon/commit/5159981))


## [12.2.1](https://github.com/ckeditor/ckeditor5-editor-balloon/compare/v12.2.0...v12.2.1) (July 10, 2019)

Internal changes only (updated dependencies, documentation, etc.).


## [12.2.0](https://github.com/ckeditor/ckeditor5-editor-balloon/compare/v12.1.1...v12.2.0) (July 4, 2019)

### Features

* `BalloonEditor.create()` will throw an error, when textarea element is used. ([83552e2](https://github.com/ckeditor/ckeditor5-editor-balloon/commit/83552e2))


## [12.1.1](https://github.com/ckeditor/ckeditor5-editor-balloon/compare/v12.1.0...v12.1.1) (June 6, 2019)

Internal changes only (updated dependencies, documentation, etc.).


## [12.1.0](https://github.com/ckeditor/ckeditor5-editor-balloon/compare/v12.0.0...v12.1.0) (April 4, 2019)

### Features

* Introduced `EditorConfig#initialData`. ([678528f](https://github.com/ckeditor/ckeditor5-editor-balloon/commit/678528f))


## [12.0.0](https://github.com/ckeditor/ckeditor5-editor-balloon/compare/v11.0.2...v12.0.0) (February 28, 2019)

### Features

* Added support for the `config.placeholder` option which allows configuring the empty editor content placeholder (see [ckeditor/ckeditor5#479](https://github.com/ckeditor/ckeditor5/issues/479)). ([7f39e5e](https://github.com/ckeditor/ckeditor5-editor-balloon/commit/7f39e5e))

### Bug fixes

* Fixed memory leaks during editor initialization and destruction (see [ckeditor/ckeditor5#1341](https://github.com/ckeditor/ckeditor5/issues/1341)). ([c959daf](https://github.com/ckeditor/ckeditor5-editor-balloon/commit/c959daf))

### Other changes

* Adjustments to new editor initialization events. See breaking changes. ([1bb0285](https://github.com/ckeditor/ckeditor5-editor-balloon/commit/1bb0285))
* Editor UI classes API refactoring. See breaking changes. ([dd43e7a](https://github.com/ckeditor/ckeditor5-editor-balloon/commit/dd43e7a))

### BREAKING CHANGES

* Upgraded minimal versions of Node to `8.0.0` and npm to `5.7.1`. See: [ckeditor/ckeditor5#1507](https://github.com/ckeditor/ckeditor5/issues/1507). ([612ea3c](https://github.com/ckeditor/ckeditor5-cloud-services/commit/612ea3c))
* The second argument of `BalloonEditorUIView.constructor()` is an editing view instance now.
* The `editor#dataReady` event was removed. The `editor.data#ready` event has been introduced and should be used instead.
* The `editor#pluginsReady` event was removed. Use plugin `afterInit()` method instead.
* Removed `BalloonEditor#element` property. The `BalloonEditorUI#element` property should be used instead.
* Removed `BalloonEditorUIView#editableElement`. Instead `BalloonEditorUI#getEditableElement()` method should be used.


## [11.0.2](https://github.com/ckeditor/ckeditor5-editor-balloon/compare/v11.0.1...v11.0.2) (December 5, 2018)

Internal changes only (updated dependencies, documentation, etc.).


## [11.0.1](https://github.com/ckeditor/ckeditor5-editor-balloon/compare/v11.0.0...v11.0.1) (October 8, 2018)

Internal changes only (updated dependencies, documentation, etc.).


## [11.0.0](https://github.com/ckeditor/ckeditor5-editor-balloon/compare/v10.0.1...v11.0.0) (July 18, 2018)

### Features

* Editor can now be created with initial data passed to the `create()` method. Closes [#18](https://github.com/ckeditor/ckeditor5-editor-balloon/issues/18). ([48c265c](https://github.com/ckeditor/ckeditor5-editor-balloon/commit/48c265c))

### Other changes

* Used the `EditorUI` as a parent class for the `BalloonEditorUI` (see [ckeditor/ckeditor5-core#130](https://github.com/ckeditor/ckeditor5-core/issues/130)). ([03af1c0](https://github.com/ckeditor/ckeditor5-editor-balloon/commit/03af1c0))

### BREAKING CHANGES

* The `BalloonEditor#element` property was renamed to `BalloonEditor#sourceElement` and `BalloonEditor#updateElement()` method to `BalloonEditor#updateSourceElement()`. See [ckeditor/ckeditor5-core#64](https://github.com/ckeditor/ckeditor5-core/issues/64).


## [10.0.1](https://github.com/ckeditor/ckeditor5-editor-balloon/compare/v10.0.0...v10.0.1) (June 21, 2018)

Internal changes only (updated dependencies, documentation, etc.).


## [10.0.0](https://github.com/ckeditor/ckeditor5-editor-balloon/compare/v1.0.0-beta.4...v10.0.0) (April 25, 2018)

### Other changes

* Changed the license to GPL2+ only. See [ckeditor/ckeditor5#991](https://github.com/ckeditor/ckeditor5/issues/991). ([00d20c1](https://github.com/ckeditor/ckeditor5-editor-balloon/commit/00d20c1))

### BREAKING CHANGES

* The license under which CKEditor&nbsp;5 is released has been changed from a triple GPL, LGPL and MPL license to a GPL2+ only. See [ckeditor/ckeditor5#991](https://github.com/ckeditor/ckeditor5/issues/991) for more information.


## [1.0.0-beta.4](https://github.com/ckeditor/ckeditor5-editor-balloon/compare/v1.0.0-beta.2...v1.0.0-beta.4) (April 19, 2018)

Internal changes only (updated dependencies, documentation, etc.).


## [1.0.0-beta.2](https://github.com/ckeditor/ckeditor5-editor-balloon/compare/v1.0.0-beta.1...v1.0.0-beta.2) (April 10, 2018)

Internal changes only (updated dependencies, documentation, etc.).


## [1.0.0-beta.1](https://github.com/ckeditor/ckeditor5-editor-balloon/compare/v1.0.0-alpha.2...v1.0.0-beta.1) (March 15, 2018)

### Other changes

* Migrated the editor styles to PostCSS (see [ckeditor/ckeditor5-ui#144](https://github.com/ckeditor/ckeditor5-ui/issues/144)). ([bd239e9](https://github.com/ckeditor/ckeditor5-editor-balloon/commit/bd239e9))


## [1.0.0-alpha.2](https://github.com/ckeditor/ckeditor5-editor-balloon/compare/v1.0.0-alpha.1...v1.0.0-alpha.2) (November 14, 2017)

### Other changes

* Aligned UI library usage to the [changes in the UI framework](https://github.com/ckeditor/ckeditor5-ui/pull/332).


## [1.0.0-alpha.1](https://github.com/ckeditor/ckeditor5-editor-balloon/compare/v0.1.0...v1.0.0-alpha.1) (October 3, 2017)

### Other changes

* The editor name has been changed from `@ckeditor/ckeditor5-build-balloon-toolbar` to `@ckeditor/ckeditor5-build-balloon` (the class name has been changed to `BalloonEditor`). See [ckeditor/ckeditor5#546](https://github.com/ckeditor/ckeditor5/issues/546) for more information. ([5fc4f60](https://github.com/ckeditor/ckeditor5-editor-balloon/commit/5fc4f60))

### BREAKING CHANGES

* The editor name has been changed. See [ckeditor/ckeditor5#546](https://github.com/ckeditor/ckeditor5/issues/546).


## 0.1.0 (September 3, 2017)

### Features

* The first implementation of the balloon editor. Closes [#1](https://github.com/ckeditor/ckeditor5-editor-balloon/issues/1). ([a4462ac](https://github.com/ckeditor/ckeditor5-editor-balloon/commit/a4462ac))
