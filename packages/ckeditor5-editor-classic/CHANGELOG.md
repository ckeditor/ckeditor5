Changelog
=========

All changes in the package are documented in the main repository. See: https://github.com/ckeditor/ckeditor5/blob/master/CHANGELOG.md.

Changes for the past releases are available below.

## [19.0.0](https://github.com/ckeditor/ckeditor5-editor-classic/compare/v18.0.0...v19.0.0) (2020-04-29)

Internal changes only (updated dependencies, documentation, etc.).


## [18.0.0](https://github.com/ckeditor/ckeditor5-editor-classic/compare/v17.0.0...v18.0.0) (2020-03-19)

Internal changes only (updated dependencies, documentation, etc.).


## [17.0.0](https://github.com/ckeditor/ckeditor5-editor-classic/compare/v16.0.0...v17.0.0) (2020-02-19)

Internal changes only (updated dependencies, documentation, etc.).

## [16.0.0](https://github.com/ckeditor/ckeditor5-editor-classic/compare/v15.0.0...v16.0.0) (2019-12-04)

### Features

* The main editor toolbar should respect the `config.toolbar.shouldNotGroupWhenFull` configuration (see [ckeditor/ckeditor5#5692](https://github.com/ckeditor/ckeditor5/issues/5692)). ([9a57e63](https://github.com/ckeditor/ckeditor5-editor-classic/commit/9a57e63))


## [15.0.0](https://github.com/ckeditor/ckeditor5-editor-classic/compare/v12.1.4...v15.0.0) (2019-10-23)

### Features

* Enabled automatic items grouping in the main editor toolbar when there is not enough space to display them in a single row (see [ckeditor/ckeditor5#416](https://github.com/ckeditor/ckeditor5/issues/416)). ([4d20b70](https://github.com/ckeditor/ckeditor5-editor-classic/commit/4d20b70))


## [12.1.4](https://github.com/ckeditor/ckeditor5-editor-classic/compare/v12.1.3...v12.1.4) (2019-08-26)

### Other changes

* The issue tracker for this package was moved to https://github.com/ckeditor/ckeditor5/issues. See [ckeditor/ckeditor5#1988](https://github.com/ckeditor/ckeditor5/issues/1988). ([84ec68f](https://github.com/ckeditor/ckeditor5-editor-classic/commit/84ec68f))


## [12.1.3](https://github.com/ckeditor/ckeditor5-editor-classic/compare/v12.1.2...v12.1.3) (2019-07-10)

Internal changes only (updated dependencies, documentation, etc.).


## [12.1.2](https://github.com/ckeditor/ckeditor5-editor-classic/compare/v12.1.1...v12.1.2) (2019-07-04)

Internal changes only (updated dependencies, documentation, etc.).


## [12.1.1](https://github.com/ckeditor/ckeditor5-editor-classic/compare/v12.1.0...v12.1.1) (2019-06-05)

Internal changes only (updated dependencies, documentation, etc.).


## [12.1.0](https://github.com/ckeditor/ckeditor5-editor-classic/compare/v12.0.0...v12.1.0) (2019-04-10)

### Features

* Introduced `EditorConfig#initialData`. ([fce3edc](https://github.com/ckeditor/ckeditor5-editor-classic/commit/fce3edc))


## [12.0.0](https://github.com/ckeditor/ckeditor5-editor-classic/compare/v11.0.2...v12.0.0) (2019-02-28)

### Features

* Added support for the `config.placeholder` option which allows configuring the empty editor content placeholder (see [ckeditor/ckeditor5#479](https://github.com/ckeditor/ckeditor5/issues/479)). ([3450c23](https://github.com/ckeditor/ckeditor5-editor-classic/commit/3450c23))

### Bug fixes

* Fixed memory leaks during editor initialization and destruction (see [ckeditor/ckeditor5#1341](https://github.com/ckeditor/ckeditor5/issues/1341)). ([a3c5c82](https://github.com/ckeditor/ckeditor5-editor-classic/commit/a3c5c82))

### Other changes

* Adjustments to new editor initialization events. See breaking changes. ([61ccab0](https://github.com/ckeditor/ckeditor5-editor-classic/commit/61ccab0))
* Editor UI classes API refactoring. See breaking changes. ([74e27ae](https://github.com/ckeditor/ckeditor5-editor-classic/commit/74e27ae))

### BREAKING CHANGES

* Upgraded minimal versions of Node to `8.0.0` and npm to `5.7.1`. See: [ckeditor/ckeditor5#1507](https://github.com/ckeditor/ckeditor5/issues/1507). ([612ea3c](https://github.com/ckeditor/ckeditor5-cloud-services/commit/612ea3c))
* The `editor#dataReady` event was removed. The `editor.data#ready` event has been introduced and should be used instead.
* The `editor#pluginsReady` event was removed. Use plugin `afterInit()` method instead.
* Removed `ClassicEditor#element` property. The `ClassicEditorUI#element` property should be used instead.
* Removed `ClassicEditorUIView#editableElement`. Instead `ClassicEditorUI#getEditableElement()` method should be used.


## [11.0.2](https://github.com/ckeditor/ckeditor5-editor-classic/compare/v11.0.1...v11.0.2) (2018-12-05)

Internal changes only (updated dependencies, documentation, etc.).


## [11.0.1](https://github.com/ckeditor/ckeditor5-editor-classic/compare/v11.0.0...v11.0.1) (2018-10-08)

Internal changes only (updated dependencies, documentation, etc.).


## [11.0.0](https://github.com/ckeditor/ckeditor5-editor-classic/compare/v10.0.1...v11.0.0) (2018-07-18)

### Features

* Editor can now be created with initial data passed to the `create()` method. Closes [#72](https://github.com/ckeditor/ckeditor5-editor-classic/issues/72). ([09cebc6](https://github.com/ckeditor/ckeditor5-editor-classic/commit/09cebc6))

### Other changes

* Used the `EditorUI` as a parent class for the `ClassicEditorUI` (see [ckeditor/ckeditor5-core#130](https://github.com/ckeditor/ckeditor5-core/issues/130)). ([ae98cfd](https://github.com/ckeditor/ckeditor5-editor-classic/commit/ae98cfd))

### BREAKING CHANGES

* The `ClassicEditor#element` property was renamed to `ClassicEditor#sourceElement` and `ClassicEditor#updateElement()` method to `ClassicEditor#updateSourceElement()`. See [ckeditor/ckeditor5-core#64](https://github.com/ckeditor/ckeditor5-core/issues/64).


## [10.0.1](https://github.com/ckeditor/ckeditor5-editor-classic/compare/v10.0.0...v10.0.1) (2018-06-21)

Internal changes only (updated dependencies, documentation, etc.).


## [10.0.0](https://github.com/ckeditor/ckeditor5-editor-classic/compare/v1.0.0-beta.4...v10.0.0) (2018-04-25)

### Other changes

* Changed the license to GPL2+ only. See [ckeditor/ckeditor5#991](https://github.com/ckeditor/ckeditor5/issues/991). ([95fe4c1](https://github.com/ckeditor/ckeditor5-editor-classic/commit/95fe4c1))

### BREAKING CHANGES

* The license under which CKEditor&nbsp;5 is released has been changed from a triple GPL, LGPL and MPL license to a GPL2+ only. See [ckeditor/ckeditor5#991](https://github.com/ckeditor/ckeditor5/issues/991) for more information.


## [1.0.0-beta.4](https://github.com/ckeditor/ckeditor5-editor-classic/compare/v1.0.0-beta.2...v1.0.0-beta.4) (2018-04-19)

Internal changes only (updated dependencies, documentation, etc.).


## [1.0.0-beta.2](https://github.com/ckeditor/ckeditor5-editor-classic/compare/v1.0.0-beta.1...v1.0.0-beta.2) (2018-04-10)

### Other changes

* Increased the specificity of CSS rules. Introduced the `.ck` class for editor UI components (see: [ckeditor/ckeditor5#494](https://github.com/ckeditor/ckeditor5/issues/494)). ([e548bd0](https://github.com/ckeditor/ckeditor5-editor-classic/commit/e548bd0))


## [1.0.0-beta.1](https://github.com/ckeditor/ckeditor5-editor-classic/compare/v1.0.0-alpha.2...v1.0.0-beta.1) (2018-03-15)

### Other changes

* Migrated the editor styles to PostCSS. Moved visual styles to `@ckeditor/ckeditor5-theme-lark` (see [ckeditor/ckeditor5-ui#144](https://github.com/ckeditor/ckeditor5-ui/issues/144)). ([f24f97d](https://github.com/ckeditor/ckeditor5-editor-classic/commit/f24f97d))
* Removed the `.ck-editor-toolbar` class from the toolbar (see [ckeditor/ckeditor5-theme-lark#135](https://github.com/ckeditor/ckeditor5-theme-lark/issues/135)). ([6b4670c](https://github.com/ckeditor/ckeditor5-editor-classic/commit/6b4670c))


## [1.0.0-alpha.2](https://github.com/ckeditor/ckeditor5-editor-classic/compare/v1.0.0-alpha.1...v1.0.0-alpha.2) (2017-11-14)

### Other changes

* Aligned UI library usage to the [changes in the UI framework](https://github.com/ckeditor/ckeditor5-ui/pull/332).


## [1.0.0-alpha.1](https://github.com/ckeditor/ckeditor5-editor-classic/compare/v0.8.0...v1.0.0-alpha.1) (2017-10-03)

### Features

* The `StickyToolbarView` has been replaced by the `StickyPanelView` with a child `ToolbarView` (see [ckeditor/ckeditor5-ui#297](https://github.com/ckeditor/ckeditor5-ui/issues/297)). ([e4f591f](https://github.com/ckeditor/ckeditor5-editor-classic/commit/e4f591f))

### BREAKING CHANGES

* The former attributes controlling the position of the toolbar provided by the `StickyToolbarView` are now available under `ClassicEditorUIView#stickyPanel` (`editor.ui.view.stickyPanel`).


## [0.8.0](https://github.com/ckeditor/ckeditor5-editor-classic/compare/v0.7.3...v0.8.0) (2017-09-03)

### Bug fixes

* The toolbar should never hide underneath the edited content. Closes [#62](https://github.com/ckeditor/ckeditor5-editor-classic/issues/62). Closes ckeditor/ckeditor5-upload[#33](https://github.com/ckeditor/ckeditor5-editor-classic/issues/33). ([511d28f](https://github.com/ckeditor/ckeditor5-editor-classic/commit/511d28f))

### Features

* The toolbar should support a vertical offset from the top of the web page. Closes [#60](https://github.com/ckeditor/ckeditor5-editor-classic/issues/60). ([6739afc](https://github.com/ckeditor/ckeditor5-editor-classic/commit/6739afc))

### Other changes

* Renamed the `classic.js` file to `classiceditor.js` to match the naming convention. Closes [#41](https://github.com/ckeditor/ckeditor5-editor-classic/issues/41). ([c5714ba](https://github.com/ckeditor/ckeditor5-editor-classic/commit/c5714ba))

### BREAKING CHANGES

* The `classic.js` file containing `ClassicEditor` class has been renamed to `classiceditor.js`.


## [0.7.3](https://github.com/ckeditor/ckeditor5-editor-classic/compare/v0.7.2...v0.7.3) (2017-05-07)

Internal changes only (updated dependencies, documentation, etc.).

## [0.7.2](https://github.com/ckeditor/ckeditor5-editor-classic/compare/v0.7.1...v0.7.2) (2017-04-05)

### Bug fixes

* It should be possible to use `ClassicEditor.create()` in its child classes. Closes [#53](https://github.com/ckeditor/ckeditor5-editor-classic/issues/53). ([95798ba](https://github.com/ckeditor/ckeditor5-editor-classic/commit/95798ba))

### Other changes

* Code refactoring to share API with `ckeditor5-editor-inline`. Closes [#48](https://github.com/ckeditor/ckeditor5-editor-classic/issues/48). ([2bb1e4e](https://github.com/ckeditor/ckeditor5-editor-classic/commit/2bb1e4e))


## [0.7.1](https://github.com/ckeditor/ckeditor5-editor-classic/compare/v0.7.0...v0.7.1) (2017-03-06)

### Other changes

* Used `ToolbarView#etItemsFromConfig()` to bootstrap the toolbar in `ClassicEditorUI`. Closes [#51](https://github.com/ckeditor/ckeditor5/issues/51). ([53d58d9](https://github.com/ckeditor/ckeditor5-editor-classic/commit/53d58d9))
