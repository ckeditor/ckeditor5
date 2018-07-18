Changelog
=========

## [11.0.0](https://github.com/ckeditor/ckeditor5-editor-decoupled/compare/v10.0.2...v11.0.0) (2018-07-18)

### Other changes

* Aligned `DecoupledEditor` to changes in the `EditorWithUI` and `ElementApi` interfaces. ([8c7414b](https://github.com/ckeditor/ckeditor5-editor-decoupled/commit/8c7414b))
* Used the `EditorUI` as a parent class for the `DecoupledEditorUI` (see [ckeditor/ckeditor5-core#130](https://github.com/ckeditor/ckeditor5-core/issues/130)). ([d92da9f](https://github.com/ckeditor/ckeditor5-editor-decoupled/commit/d92da9f))

### BREAKING CHANGES

* `DecoupledEditor#element` was renamed to `DecoupledEditor#sourceElement`. See [ckeditor/ckeditor5-core#64](https://github.com/ckeditor/ckeditor5-core/issues/64).


## [10.0.2](https://github.com/ckeditor/ckeditor5-editor-decoupled/compare/v10.0.1...v10.0.2) (2018-06-21)

Internal changes only (updated dependencies, documentation, etc.).


## [10.0.1](https://github.com/ckeditor/ckeditor5-editor-decoupled/compare/v10.0.0...v10.0.1) (2018-05-22)

### Bug fixes

* Added missing `return` to the data initialization step (fixes asynchrounous data initialization, important for real-time collaboration features). Closes [#13](https://github.com/ckeditor/ckeditor5-editor-decoupled/issues/13). ([f4e496d](https://github.com/ckeditor/ckeditor5-editor-decoupled/commit/f4e496d))


## [10.0.0](https://github.com/ckeditor/ckeditor5-editor-decoupled/compare/v1.0.0-beta.4...v10.0.0) (2018-04-25)

### Other changes

* Changed the license to GPL2+ only. See [ckeditor/ckeditor5#991](https://github.com/ckeditor/ckeditor5/issues/991). ([843896b](https://github.com/ckeditor/ckeditor5-editor-decoupled/commit/843896b))

### BREAKING CHANGES

* The license under which CKEditor 5 is released has been changed from a triple GPL, LGPL and MPL license to a GPL2+ only. See [ckeditor/ckeditor5#991](https://github.com/ckeditor/ckeditor5/issues/991) for more information.


## [1.0.0-beta.4](https://github.com/ckeditor/ckeditor5-editor-decoupled/compare/v1.0.0-beta.2...v1.0.0-beta.4) (2018-04-19)

Internal changes only (updated dependencies, documentation, etc.).


## [1.0.0-beta.2](https://github.com/ckeditor/ckeditor5-editor-decoupled/compare/v1.0.0-beta.1...v1.0.0-beta.2) (2018-04-10)

### Other changes

* Allowed the editable element to be passed into `DecoupledEditor.create()`. Removed `config.toolbarContainer` and `config.editableContainer`. Closes [#10](https://github.com/ckeditor/ckeditor5-editor-decoupled/issues/10). Closes [ckeditor/ckeditor5#912](https://github.com/ckeditor/ckeditor5/issues/912). ([327b2ed](https://github.com/ckeditor/ckeditor5-editor-decoupled/commit/327b2ed))

### BREAKING CHANGES

* The config options `config.toolbarContainer` and `config.editableContainer` have been removed. Please refer to the `DecoupledEditor` class API documentation to learn about possible methods of bootstrapping the UI.


## 1.0.0-beta.1 (2018-03-15)

### Features

* The first implementation of the decoupled editor. Closes [#1](https://github.com/ckeditor/ckeditor5-editor-decoupled/issues/1). Closes [ckeditor/ckeditor5#873](https://github.com/ckeditor/ckeditor5/issues/873). ([a1950e8](https://github.com/ckeditor/ckeditor5-editor-decoupled/commit/a1950e8))
