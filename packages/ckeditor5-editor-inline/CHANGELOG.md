Changelog
=========

## [19.0.0](https://github.com/ckeditor/ckeditor5-editor-inline/compare/v18.0.0...v19.0.0) (2020-04-29)

Internal changes only (updated dependencies, documentation, etc.).


## [18.0.0](https://github.com/ckeditor/ckeditor5-editor-inline/compare/v17.0.0...v18.0.0) (2020-03-19)

### MAJOR BREAKING CHANGES

* From now on, the inline toolbar groups overflowing items by default. This behavior can be disabled by setting the [`config.toolbar.shouldNotGroupWhenFull`](https://ckeditor.com/docs/ckeditor5/latest/api/module_ui_toolbar_toolbarview-ToolbarOptions.html#member-shouldGroupWhenFull) configuration option to `true`.

### Features

* The inline editor toolbar should group items when its width exceeds the editable’s width (see [ckeditor/ckeditor5#5597](https://github.com/ckeditor/ckeditor5/issues/5597)). ([1c5746c](https://github.com/ckeditor/ckeditor5-editor-inline/commit/1c5746c))


## [17.0.0](https://github.com/ckeditor/ckeditor5-editor-inline/compare/v16.0.0...v17.0.0) (2020-02-19)

Internal changes only (updated dependencies, documentation, etc.).


## [16.0.0](https://github.com/ckeditor/ckeditor5-editor-inline/compare/v15.0.0...v16.0.0) (2019-12-04)

Internal changes only (updated dependencies, documentation, etc.).


## [15.0.0](https://github.com/ckeditor/ckeditor5-editor-inline/compare/v12.3.0...v15.0.0) (2019-10-23)

Internal changes only (updated dependencies, documentation, etc.).


## [12.3.0](https://github.com/ckeditor/ckeditor5-editor-inline/compare/v12.2.1...v12.3.0) (2019-08-26)

### Features

* The `InlineEditorUIView` should display on different sides of editable depending on the direction of the UI language. See [ckeditor/ckeditor5#1151](https://github.com/ckeditor/ckeditor5/issues/1151). ([c387059](https://github.com/ckeditor/ckeditor5-editor-inline/commit/c387059))

### Other changes

* The issue tracker for this package was moved to https://github.com/ckeditor/ckeditor5/issues. See [ckeditor/ckeditor5#1988](https://github.com/ckeditor/ckeditor5/issues/1988). ([1d21b8e](https://github.com/ckeditor/ckeditor5-editor-inline/commit/1d21b8e))
* Introduced a check that prevents sharing source elements between editor instances. See [ckeditor/ckeditor5#746](https://github.com/ckeditor/ckeditor5/issues/746). ([5e42fcf](https://github.com/ckeditor/ckeditor5-editor-inline/commit/5e42fcf))


## [12.2.1](https://github.com/ckeditor/ckeditor5-editor-inline/compare/v12.2.0...v12.2.1) (2019-07-10)

Internal changes only (updated dependencies, documentation, etc.).


## [12.2.0](https://github.com/ckeditor/ckeditor5-editor-inline/compare/v12.1.1...v12.2.0) (2019-07-04)

### Features

* `InlineEditor.create()` will throw an error, when a `<textarea>` element is used. ([56c9f40](https://github.com/ckeditor/ckeditor5-editor-inline/commit/56c9f40))


## [12.1.1](https://github.com/ckeditor/ckeditor5-editor-inline/compare/v12.1.0...v12.1.1) (2019-06-05)

Internal changes only (updated dependencies, documentation, etc.).


## [12.1.0](https://github.com/ckeditor/ckeditor5-editor-inline/compare/v12.0.0...v12.1.0) (2019-04-10)

### Features

* Introduced `EditorConfig#initialData`. ([59e97b5](https://github.com/ckeditor/ckeditor5-editor-inline/commit/59e97b5))


## [12.0.0](https://github.com/ckeditor/ckeditor5-editor-inline/compare/v11.0.2...v12.0.0) (2019-02-28)

### Features

* Added support for the `config.placeholder` option which allows configuring the empty editor content placeholder (see [ckeditor/ckeditor5#479](https://github.com/ckeditor/ckeditor5/issues/479)). ([24016bd](https://github.com/ckeditor/ckeditor5-editor-inline/commit/24016bd))

### Bug fixes

* Fixed memory leaks during editor initialization and destruction (see [ckeditor/ckeditor5#1341](https://github.com/ckeditor/ckeditor5/issues/1341)). ([dd2bb90](https://github.com/ckeditor/ckeditor5-editor-inline/commit/dd2bb90))

### Other changes

* Adjustments to new editor initialization events. See breaking changes. ([9536767](https://github.com/ckeditor/ckeditor5-editor-inline/commit/9536767))
* Editor UI classes API refactoring. See breaking changes. ([f8195da](https://github.com/ckeditor/ckeditor5-editor-inline/commit/f8195da))

### BREAKING CHANGES

* Upgraded minimal versions of Node to `8.0.0` and npm to `5.7.1`. See: [ckeditor/ckeditor5#1507](https://github.com/ckeditor/ckeditor5/issues/1507). ([612ea3c](https://github.com/ckeditor/ckeditor5-cloud-services/commit/612ea3c))
* The second argument of `InlineEditorUIView.constructor()` is an editing view instance now.
* The `editor#dataReady` event was removed. The `editor.data#ready` event has been introduced and should be used instead.
* The `editor#pluginsReady` event was removed. Use plugin `afterInit()` method instead.
* Removed `InlineEditor#element` property. The `InlineEditorUI#element` property should be used instead.
* Removed `InlineEditorUIView#editableElement`. Instead `InlineEditorUI#getEditableElement()` method should be used.


## [11.0.2](https://github.com/ckeditor/ckeditor5-editor-inline/compare/v11.0.1...v11.0.2) (2018-12-05)

Internal changes only (updated dependencies, documentation, etc.).


## [11.0.1](https://github.com/ckeditor/ckeditor5-editor-inline/compare/v11.0.0...v11.0.1) (2018-10-08)

### Bug fixes

* Child views should be added in `InlineEditorUIView#render()` instead of `#constructor()` to allow early template manipulation. Closes [ckeditor/ckeditor5#1150](https://github.com/ckeditor/ckeditor5/issues/1150). ([b0be713](https://github.com/ckeditor/ckeditor5-editor-inline/commit/b0be713))

  Huge thanks to [Alex Eckermann](https://github.com/alexeckermann) for this contribution!


## [11.0.0](https://github.com/ckeditor/ckeditor5-editor-inline/compare/v10.0.1...v11.0.0) (2018-07-18)

### Features

* Editor can now be created with initial data passed to the constructor. Closes [#37](https://github.com/ckeditor/ckeditor5-editor-inline/issues/37). ([cfd8c53](https://github.com/ckeditor/ckeditor5-editor-inline/commit/cfd8c53))

### Other changes

* Used the `EditorUI` as a parent class for the `InlineEditorUI` (see [ckeditor/ckeditor5-core#130](https://github.com/ckeditor/ckeditor5-core/issues/130)). ([c148346](https://github.com/ckeditor/ckeditor5-editor-inline/commit/c148346))

### BREAKING CHANGES

* The `InlineEditor#element` property was renamed to `InlineEditor#sourceElement` and `InlineEditor#updateElement()` method to `InlineEditor#updateSourceElement()`. See [ckeditor/ckeditor5-core#64](https://github.com/ckeditor/ckeditor5-core/issues/64).


## [10.0.1](https://github.com/ckeditor/ckeditor5-editor-inline/compare/v10.0.0...v10.0.1) (2018-06-21)

Internal changes only (updated dependencies, documentation, etc.).


## [10.0.0](https://github.com/ckeditor/ckeditor5-editor-inline/compare/v1.0.0-beta.4...v10.0.0) (2018-04-25)

### Other changes

* Changed the license to GPL2+ only. See [ckeditor/ckeditor5#991](https://github.com/ckeditor/ckeditor5/issues/991). ([4a6d43a](https://github.com/ckeditor/ckeditor5-editor-inline/commit/4a6d43a))

### BREAKING CHANGES

* The license under which CKEditor 5 is released has been changed from a triple GPL, LGPL and MPL license to a GPL2+ only. See [ckeditor/ckeditor5#991](https://github.com/ckeditor/ckeditor5/issues/991) for more information.


## [1.0.0-beta.4](https://github.com/ckeditor/ckeditor5-editor-inline/compare/v1.0.0-beta.2...v1.0.0-beta.4) (2018-04-19)

Internal changes only (updated dependencies, documentation, etc.).


## [1.0.0-beta.2](https://github.com/ckeditor/ckeditor5-editor-inline/compare/v1.0.0-beta.1...v1.0.0-beta.2) (2018-04-10)

Internal changes only (updated dependencies, documentation, etc.).


## [1.0.0-beta.1](https://github.com/ckeditor/ckeditor5-editor-inline/compare/v1.0.0-alpha.2...v1.0.0-beta.1) (2018-03-15)

### Other changes

* Migrated the editor styles to PostCSS (see [ckeditor/ckeditor5-ui#144](https://github.com/ckeditor/ckeditor5-ui/issues/144)). ([9fbecae](https://github.com/ckeditor/ckeditor5-editor-inline/commit/9fbecae))
* Removed the `.ck-editor-toolbar` class from the toolbar (see [ckeditor/ckeditor5-theme-lark#135](https://github.com/ckeditor/ckeditor5-theme-lark/issues/135)). ([213ddfd](https://github.com/ckeditor/ckeditor5-editor-inline/commit/213ddfd))


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
