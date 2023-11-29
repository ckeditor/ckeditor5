Changelog
=========

All changes in the package are documented in the main repository. See: https://github.com/ckeditor/ckeditor5/blob/master/CHANGELOG.md.

Changes for the past releases are available below.

## [19.0.0](https://github.com/ckeditor/ckeditor5-editor-decoupled/compare/v18.0.0...v19.0.0) (April 29, 2020)

Internal changes only (updated dependencies, documentation, etc.).


## [18.0.0](https://github.com/ckeditor/ckeditor5-editor-decoupled/compare/v17.0.0...v18.0.0) (March 19, 2020)

Internal changes only (updated dependencies, documentation, etc.).


## [17.0.0](https://github.com/ckeditor/ckeditor5-editor-decoupled/compare/v16.0.0...v17.0.0) (February 19, 2020)

Internal changes only (updated dependencies, documentation, etc.).


## [16.0.0](https://github.com/ckeditor/ckeditor5-editor-decoupled/compare/v15.0.0...v16.0.0) (December 4, 2019)

### Features

* The main editor toolbar should respect the `config.toolbar.shouldNotGroupWhenFull` configuration (see [ckeditor/ckeditor5#5692](https://github.com/ckeditor/ckeditor5/issues/5692)). ([35b3cbf](https://github.com/ckeditor/ckeditor5-editor-decoupled/commit/35b3cbf))


## [15.0.0](https://github.com/ckeditor/ckeditor5-editor-decoupled/compare/v12.2.2...v15.0.0) (October 23, 2019)

### Features

* Enabled automatic items grouping in the main editor toolbar when there is not enough space to display them in a single row (see [ckeditor/ckeditor5#416](https://github.com/ckeditor/ckeditor5/issues/416)). ([eb52505](https://github.com/ckeditor/ckeditor5-editor-decoupled/commit/eb52505))


## [12.2.2](https://github.com/ckeditor/ckeditor5-editor-decoupled/compare/v12.2.1...v12.2.2) (August 26, 2019)

### Other changes

* The issue tracker for this package was moved to https://github.com/ckeditor/ckeditor5/issues. See [ckeditor/ckeditor5#1988](https://github.com/ckeditor/ckeditor5/issues/1988). ([2e45069](https://github.com/ckeditor/ckeditor5-editor-decoupled/commit/2e45069))
* Introduced a check that prevents sharing source elements between editor instances. See [ckeditor/ckeditor5#746](https://github.com/ckeditor/ckeditor5/issues/746). ([c73b045](https://github.com/ckeditor/ckeditor5-editor-decoupled/commit/c73b045))


## [12.2.1](https://github.com/ckeditor/ckeditor5-editor-decoupled/compare/v12.2.0...v12.2.1) (July 10, 2019)

Internal changes only (updated dependencies, documentation, etc.).


## [12.2.0](https://github.com/ckeditor/ckeditor5-editor-decoupled/compare/v12.1.1...v12.2.0) (July 4, 2019)

### Features

* `DecoupledEditor.create()` will throw an error, when a `<textarea>` element is used. ([af4daea](https://github.com/ckeditor/ckeditor5-editor-decoupled/commit/af4daea))


## [12.1.1](https://github.com/ckeditor/ckeditor5-editor-decoupled/compare/v12.1.0...v12.1.1) (June 6, 2019)

Internal changes only (updated dependencies, documentation, etc.).


## [12.1.0](https://github.com/ckeditor/ckeditor5-editor-decoupled/compare/v12.0.0...v12.1.0) (April 4, 2019)

### Features

* Introduced `EditorConfig#initialData`. ([7e01ca7](https://github.com/ckeditor/ckeditor5-editor-decoupled/commit/7e01ca7))


## [12.0.0](https://github.com/ckeditor/ckeditor5-editor-decoupled/compare/v11.0.2...v12.0.0) (February 28, 2019)

### Features

* Added support for the `config.placeholder` option which allows configuring the empty editor content placeholder (see [ckeditor/ckeditor5#479](https://github.com/ckeditor/ckeditor5/issues/479)). ([edd400f](https://github.com/ckeditor/ckeditor5-editor-decoupled/commit/edd400f))

### Bug fixes

* Fixed memory leaks during editor initialization and destruction (see [ckeditor/ckeditor5#1341](https://github.com/ckeditor/ckeditor5/issues/1341)). ([1e2f912](https://github.com/ckeditor/ckeditor5-editor-decoupled/commit/1e2f912))

### Other changes

* Adjustments to new editor initialisation events. See breaking changes. ([3bb0e40](https://github.com/ckeditor/ckeditor5-editor-decoupled/commit/3bb0e40))
* Editor UI classes API refactoring. See breaking changes. ([844ef9a](https://github.com/ckeditor/ckeditor5-editor-decoupled/commit/844ef9a))

### BREAKING CHANGES

* Upgraded minimal versions of Node to `8.0.0` and npm to `5.7.1`. See: [ckeditor/ckeditor5#1507](https://github.com/ckeditor/ckeditor5/issues/1507). ([612ea3c](https://github.com/ckeditor/ckeditor5-cloud-services/commit/612ea3c))
* The second argument of `DecoupledEditorUIView.constructor()` is an editing view instance now.
* The `editor#dataReady` event was removed. The `editor.data#ready` event has been introduced and should be used instead.
* The `editor#pluginsReady` event was removed. Use plugin `afterInit()` method instead.
* Removed `DecoupledEditor#element` property. The `DecoupledEditorUI#element` property should be used instead.
* Removed `DecoupledEditorUIView#editableElement`. Instead `DecoupledEditorUI#getEditableElement()` method should be used.


## [11.0.2](https://github.com/ckeditor/ckeditor5-editor-decoupled/compare/v11.0.1...v11.0.2) (December 5, 2018)

Internal changes only (updated dependencies, documentation, etc.).


## [11.0.1](https://github.com/ckeditor/ckeditor5-editor-decoupled/compare/v11.0.0...v11.0.1) (October 8, 2018)

Internal changes only (updated dependencies, documentation, etc.).


## [11.0.0](https://github.com/ckeditor/ckeditor5-editor-decoupled/compare/v10.0.2...v11.0.0) (July 18, 2018)

### Other changes

* Aligned `DecoupledEditor` to changes in the `EditorWithUI` and `ElementApi` interfaces. ([8c7414b](https://github.com/ckeditor/ckeditor5-editor-decoupled/commit/8c7414b))
* Used the `EditorUI` as a parent class for the `DecoupledEditorUI` (see [ckeditor/ckeditor5-core#130](https://github.com/ckeditor/ckeditor5-core/issues/130)). ([d92da9f](https://github.com/ckeditor/ckeditor5-editor-decoupled/commit/d92da9f))

### BREAKING CHANGES

* The `DecoupledEditor#element` property was renamed to `DecoupledEditor#sourceElement`. See [ckeditor/ckeditor5-core#64](https://github.com/ckeditor/ckeditor5-core/issues/64).


## [10.0.2](https://github.com/ckeditor/ckeditor5-editor-decoupled/compare/v10.0.1...v10.0.2) (June 21, 2018)

Internal changes only (updated dependencies, documentation, etc.).


## [10.0.1](https://github.com/ckeditor/ckeditor5-editor-decoupled/compare/v10.0.0...v10.0.1) (May 22, 2018)

### Bug fixes

* Added missing `return` to the data initialization step (fixes asynchronous data initialization, important for real-time collaboration features). Closes [#13](https://github.com/ckeditor/ckeditor5-editor-decoupled/issues/13). ([f4e496d](https://github.com/ckeditor/ckeditor5-editor-decoupled/commit/f4e496d))


## [10.0.0](https://github.com/ckeditor/ckeditor5-editor-decoupled/compare/v1.0.0-beta.4...v10.0.0) (April 25, 2018)

### Other changes

* Changed the license to GPL2+ only. See [ckeditor/ckeditor5#991](https://github.com/ckeditor/ckeditor5/issues/991). ([843896b](https://github.com/ckeditor/ckeditor5-editor-decoupled/commit/843896b))

### BREAKING CHANGES

* The license under which CKEditor&nbsp;5 is released has been changed from a triple GPL, LGPL and MPL license to a GPL2+ only. See [ckeditor/ckeditor5#991](https://github.com/ckeditor/ckeditor5/issues/991) for more information.


## [1.0.0-beta.4](https://github.com/ckeditor/ckeditor5-editor-decoupled/compare/v1.0.0-beta.2...v1.0.0-beta.4) (April 19, 2018)

Internal changes only (updated dependencies, documentation, etc.).


## [1.0.0-beta.2](https://github.com/ckeditor/ckeditor5-editor-decoupled/compare/v1.0.0-beta.1...v1.0.0-beta.2) (April 10, 2018)

### Other changes

* Allowed the editable element to be passed into `DecoupledEditor.create()`. Removed `config.toolbarContainer` and `config.editableContainer`. Closes [#10](https://github.com/ckeditor/ckeditor5-editor-decoupled/issues/10). Closes [ckeditor/ckeditor5#912](https://github.com/ckeditor/ckeditor5/issues/912). ([327b2ed](https://github.com/ckeditor/ckeditor5-editor-decoupled/commit/327b2ed))

### BREAKING CHANGES

* The config options `config.toolbarContainer` and `config.editableContainer` have been removed. Please refer to the `DecoupledEditor` class API documentation to learn about possible methods of bootstrapping the UI.


## 1.0.0-beta.1 (March 15, 2018)

### Features

* The first implementation of the decoupled editor. Closes [#1](https://github.com/ckeditor/ckeditor5-editor-decoupled/issues/1). Closes [ckeditor/ckeditor5#873](https://github.com/ckeditor/ckeditor5/issues/873). ([a1950e8](https://github.com/ckeditor/ckeditor5-editor-decoupled/commit/a1950e8))
