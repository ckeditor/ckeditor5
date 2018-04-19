Changelog
=========

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
