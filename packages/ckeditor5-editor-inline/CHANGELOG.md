Changelog
=========

## [1.0.0-alpha.2](https://github.com/ckeditor/ckeditor5-editor-inline/compare/v1.0.0-alpha.1...v1.0.0-alpha.2) (2017-11-14)

### Other changes

* Aligned UI library usage to the [changes in the UI framework](https://github.com/ckeditor/ckeditor5-ui/pull/332).


## [1.0.0-alpha.1](https://github.com/ckeditor/ckeditor5-editor-inline/compare/v0.2.0...v1.0.0-alpha.1) (2017-10-03)

Internal changes only (updated dependencies, documentation, etc.).


## [0.2.0](https://github.com/ckeditor/ckeditor5-editor-inline/compare/v0.1.1...v0.2.0) (2017-09-03)

### Bug fixes

* `InlineEditor.create()` should be able to create an instance of its subclass. Closes [#25](https://github.com/ckeditor/ckeditor5-editor-inline/issues/25). ([1da0563](https://github.com/ckeditor/ckeditor5-editor-inline/commit/1da0563))
* Editor element should be filled up with data once the editor is destroyed. Closes [#19](https://github.com/ckeditor/ckeditor5-editor-inline/issues/19). ([fe7d27b](https://github.com/ckeditor/ckeditor5-editor-inline/commit/fe7d27b))
* The toolbar should not collapse when the window is narrow. Closes [#11](https://github.com/ckeditor/ckeditor5-editor-inline/issues/11). ([705dbe5](https://github.com/ckeditor/ckeditor5-editor-inline/commit/705dbe5))

### Features

* The toolbar should support a vertical offset from the top of the web page. Closes [#23](https://github.com/ckeditor/ckeditor5-editor-inline/issues/23). ([01e29d5](https://github.com/ckeditor/ckeditor5-editor-inline/commit/01e29d5))

### Other changes

* Renamed the InlineEditor file to "inlineeditor.js" to match the naming convention. Closes [#6](https://github.com/ckeditor/ckeditor5-editor-inline/issues/6). ([dac7551](https://github.com/ckeditor/ckeditor5-editor-inline/commit/dac7551))

### BREAKING CHANGES

* The `inline.js` file containing `InlineEditor` class has been renamed to `inlineeditor.js`.


## [0.1.1](https://github.com/ckeditor/ckeditor5-editor-inline/compare/v0.1.0...v0.1.1) (2017-05-07)

### Bug fixes

* The position of the floating toolbar should be updated after the editable has grown. Closes [#4](https://github.com/ckeditor/ckeditor5-editor-inline/issues/4). ([ae578b3](https://github.com/ckeditor/ckeditor5-editor-inline/commit/ae578b3))


## 0.1.0 (2017-04-05)

### Features

* Introduced the inline editor. Closes: [#1](https://github.com/ckeditor/ckeditor5-editor-inline/issues/1). ([30c999f](https://github.com/ckeditor/ckeditor5-editor-inline/commit/30c999f))
