Changelog
=========

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
