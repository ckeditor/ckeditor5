Changelog
=========

## [17.0.0](https://github.com/ckeditor/ckeditor5-widget/compare/v16.0.0...v17.0.0) (2020-02-19)

### MINOR BREAKING CHANGES

* Resizer options object now also takes an editor instance.

### Features

* Introduced API to temporarily disable the `WidgetToolbarRepository` plugin (prevent the toolbar from showing up). Closes [ckeditor/ckeditor5#5964](https://github.com/ckeditor/ckeditor5/issues/5964). ([b9cf062](https://github.com/ckeditor/ckeditor5-widget/commit/b9cf062))

### Bug fixes

* Fixed image resize behavior upon short clicking a handle without dragging. Image will no longer became full width, nor will it briefly flash an unexpected size. Closes [ckeditor/ckeditor5#5189](https://github.com/ckeditor/ckeditor5/issues/5189). Closes [ckeditor/ckeditor5#5195](https://github.com/ckeditor/ckeditor5/issues/5195). ([d6a5c93](https://github.com/ckeditor/ckeditor5-widget/commit/d6a5c93))

### Other changes

* Align code to changes in `Plugin` API. ([81bb636](https://github.com/ckeditor/ckeditor5-widget/commit/81bb636))
* Reverted year 2020 in .po files license header. ([b9d3e61](https://github.com/ckeditor/ckeditor5-widget/commit/b9d3e61))
* Updated translations. ([75b8c83](https://github.com/ckeditor/ckeditor5-widget/commit/75b8c83)) 


## [16.0.0](https://github.com/ckeditor/ckeditor5-widget/compare/v15.0.0...v16.0.0) (2019-12-04)

### Other changes

* Updated translations. ([b3bf5f0](https://github.com/ckeditor/ckeditor5-widget/commit/b3bf5f0)) 


## [15.0.0](https://github.com/ckeditor/ckeditor5-widget/compare/v11.1.0...v15.0.0) (2019-10-23)

### MAJOR BREAKING CHANGES

* The `drag-handler.svg` icon is now `drag-handle.svg`. If you use it in your integration, please update the path.
* The `hasSelectionHandler` option of the [`toWidget()`](https://ckeditor.com/docs/ckeditor5/latest/api/module_widget_utils.html#static-function-toWidget) utility has been renamed to `hasSelectionHandle`. Consider this change if you create your own widgets using this helper.
* `.ck-widget__selection-handler` and `.ck-widget_with-selection-handler` CSS classes set on widgets have been renamed to `.ck-widget__selection-handle` and `.ck-widget_with-selection-handle`. This change may affect styling in your integration.

### Bug fixes

* Initial resize of a side image with no width predefined now gives correct percentage values. ([6c2c52e](https://github.com/ckeditor/ckeditor5-widget/commit/6c2c52e))
* Keyboard navigation should work around widgets in RTL content. Closes [#97](https://github.com/ckeditor/ckeditor5-widget/issues/97). ([dfbf88d](https://github.com/ckeditor/ckeditor5-widget/commit/dfbf88d))

### Other changes

* Improved the resizer performance. Closes [ckeditor/ckeditor5#5191](https://github.com/ckeditor/ckeditor5/issues/5191). ([1d1de77](https://github.com/ckeditor/ckeditor5-widget/commit/1d1de77))
* Renamed "handler" to "handle" in the entire package. Closes [#99](https://github.com/ckeditor/ckeditor5-widget/issues/99). ([1d35884](https://github.com/ckeditor/ckeditor5-widget/commit/1d35884))
* Updated translations. ([b9cb673](https://github.com/ckeditor/ckeditor5-widget/commit/b9cb673)) ([daea4f5](https://github.com/ckeditor/ckeditor5-widget/commit/daea4f5))


## [11.1.0](https://github.com/ckeditor/ckeditor5-widget/compare/v11.0.4...v11.1.0) (2019-08-26)

### Features

* Introduced image widget resizer. See [ckeditor/ckeditor5-image#241](https://github.com/ckeditor/ckeditor5-image/issues/241). ([c84cd73](https://github.com/ckeditor/ckeditor5-widget/commit/c84cd73))

### Bug fixes

* Improved balloon positioning when there is more than one stack in the rotator. ([763c9ba](https://github.com/ckeditor/ckeditor5-widget/commit/763c9ba))
* Reposition visible toolbar when it is in a not visible stack of rotator. Closes [ckeditor/ckeditor5#1957](https://github.com/ckeditor/ckeditor5/issues/1957). ([a438c8b](https://github.com/ckeditor/ckeditor5-widget/commit/a438c8b))

### Other changes

* The issue tracker for this package was moved to https://github.com/ckeditor/ckeditor5/issues. See [ckeditor/ckeditor5#1988](https://github.com/ckeditor/ckeditor5/issues/1988). ([cfd41c1](https://github.com/ckeditor/ckeditor5-widget/commit/cfd41c1))
* The widget toolbar should have a proper `aria-label` attribute (see [ckeditor/ckeditor5#1404](https://github.com/ckeditor/ckeditor5/issues/1404)). ([aec5888](https://github.com/ckeditor/ckeditor5-widget/commit/aec5888))


## [11.0.4](https://github.com/ckeditor/ckeditor5-widget/compare/v11.0.3...v11.0.4) (2019-07-10)

Internal changes only (updated dependencies, documentation, etc.).


## [11.0.3](https://github.com/ckeditor/ckeditor5-widget/compare/v11.0.2...v11.0.3) (2019-07-04)

### Bug fixes

* A proper `DomConverter` method should be used to map a view to DOM when getting balloon position data. Closes [#87](https://github.com/ckeditor/ckeditor5-widget/issues/87). ([160333a](https://github.com/ckeditor/ckeditor5-widget/commit/160333a))


## [11.0.2](https://github.com/ckeditor/ckeditor5-widget/compare/v11.0.1...v11.0.2) (2019-06-05)

Internal changes only (updated dependencies, documentation, etc.).


## [11.0.1](https://github.com/ckeditor/ckeditor5-widget/compare/v11.0.0...v11.0.1) (2019-04-10)

### Bug fixes

* Triple clicking inside a nested editable should not select the entire widget in Safari. Closes [ckeditor/ckeditor5#1463](https://github.com/ckeditor/ckeditor5/issues/1463). ([b7c4765](https://github.com/ckeditor/ckeditor5-widget/commit/b7c4765))


## [11.0.0](https://github.com/ckeditor/ckeditor5-widget/compare/v10.3.1...v11.0.0) (2019-02-28)

### Bug fixes

* Editor crashes after <kbd>Enter</kbd> key on an image that is inside a blockquote. Closes [ckeditor/ckeditor5#1555](https://github.com/ckeditor/ckeditor5/issues/1555). ([8a8842b](https://github.com/ckeditor/ckeditor5-widget/commit/8a8842b))
* Ensured only the widget toolbar attached to the view element which is deepest in the view tree will show up. Code and documentation refactoring in the `WidgetToolbarRepository`. Closes [#60](https://github.com/ckeditor/ckeditor5-widget/issues/60). ([7e11a24](https://github.com/ckeditor/ckeditor5-widget/commit/7e11a24))
* Make widget in editable clickable. Closes [ckeditor/ckeditor5-table#98](https://github.com/ckeditor/ckeditor5-table/issues/98). ([8226829](https://github.com/ckeditor/ckeditor5-widget/commit/8226829))
* Pressing <kbd>Enter</kbd> should split parent element when the inline widget is inside a `$block`. Closes [ckeditor/ckeditor5#1529](https://github.com/ckeditor/ckeditor5/issues/1529). ([847d2ab](https://github.com/ckeditor/ckeditor5-widget/commit/847d2ab))
* Fixed memory leaks during editor initialization and destruction (see [ckeditor/ckeditor5#1341](https://github.com/ckeditor/ckeditor5/issues/1341)). ([2e8f20d](https://github.com/ckeditor/ckeditor5-widget/commit/2e8f20d))

### Other changes

* Introduce support and utils for creating inline widgets. Closes [[ckeditor/ckeditor5#1096](https://github.com/ckeditor/ckeditor5/issues/1096)](https://github.com/ckeditor/ckeditor5/issues/1096). ([38fa159](https://github.com/ckeditor/ckeditor5-widget/commit/38fa159))
* Renamed the `.ck-widget_selectable` class to `.ck-widget_with-selection-handler` for better semantics. Closes [#66](https://github.com/ckeditor/ckeditor5-widget/issues/66). ([178ad5f](https://github.com/ckeditor/ckeditor5-widget/commit/178ad5f))

### BREAKING CHANGES

* Upgraded minimal versions of Node to `8.0.0` and npm to `5.7.1`. See: [ckeditor/ckeditor5#1507](https://github.com/ckeditor/ckeditor5/issues/1507). ([612ea3c](https://github.com/ckeditor/ckeditor5-cloud-services/commit/612ea3c))
* The `.ck-widget_selectable` class has been renamed to `.ck-widget_with-selection-handler` for better semantics.
* The `visibleWhen()` function, a property of an object passed into `WidgetToolbarRepository.register()`, has been renamed to `getRelatedElement()` and must return an editing `View` element the toolbar should be attached to (instead of `Boolean`).


## [10.3.1](https://github.com/ckeditor/ckeditor5-widget/compare/v10.3.0...v10.3.1) (2018-12-05)

### Bug fixes

* Selection converter will mark only the topmost widget in case of selecting a widget with another widget nested inside it. Closes [#57](https://github.com/ckeditor/ckeditor5-widget/issues/57). ([a78efec](https://github.com/ckeditor/ckeditor5-widget/commit/a78efec))

### Other changes

* Improved SVG icons size. See [ckeditor/ckeditor5-theme-lark#206](https://github.com/ckeditor/ckeditor5-theme-lark/issues/206). ([5b7a457](https://github.com/ckeditor/ckeditor5-widget/commit/5b7a457))


## [10.3.0](https://github.com/ckeditor/ckeditor5-widget/compare/v10.2.0...v10.3.0) (2018-10-08)

### Features

* Introduced the `findOptimalInsertionPostion()` utility function. ([9c0d4ce](https://github.com/ckeditor/ckeditor5-widget/commit/9c0d4ce))
* Introduced the widget toolbar repository. Closes [ckeditor/ckeditor5-ui#442](https://github.com/ckeditor/ckeditor5-ui/issues/442). ([bc45176](https://github.com/ckeditor/ckeditor5-widget/commit/bc45176))


## [10.2.0](https://github.com/ckeditor/ckeditor5-widget/compare/v10.1.0...v10.2.0) (2018-07-18)

### Features

* Implemented the widget selection handle. Closes [#40](https://github.com/ckeditor/ckeditor5-widget/issues/40). ([bbf9298](https://github.com/ckeditor/ckeditor5-widget/commit/bbf9298))

### Other changes

* Do not set the `contenteditable` property for widgets and their nested editables on Edge due to an awful instability which it causes in this browser. Closes [ckeditor/ckeditor5#1079](https://github.com/ckeditor/ckeditor5/issues/1079). Closes [ckeditor/ckeditor5#1067](https://github.com/ckeditor/ckeditor5/issues/1067). ([ee530b1](https://github.com/ckeditor/ckeditor5-widget/commit/ee530b1))


## [10.1.0](https://github.com/ckeditor/ckeditor5-widget/compare/v10.0.0...v10.1.0) (2018-06-21)

### Features

* Creating a paragraph next to the selected widget is possible using the (<kbd>Shift</kbd>+)<kbd>Enter</kbd> key (see [ckeditor/ckeditor5#407](https://github.com/ckeditor/ckeditor5/issues/407)). ([d68b7d0](https://github.com/ckeditor/ckeditor5-widget/commit/d68b7d0))


## [10.0.0](https://github.com/ckeditor/ckeditor5-widget/compare/v1.0.0-beta.4...v10.0.0) (2018-04-25)

### Other changes

* Changed the license to GPL2+ only. See [ckeditor/ckeditor5#991](https://github.com/ckeditor/ckeditor5/issues/991). ([88ef879](https://github.com/ckeditor/ckeditor5-widget/commit/88ef879))

### BREAKING CHANGES

* The license under which CKEditor 5 is released has been changed from a triple GPL, LGPL and MPL license to a GPL2+ only. See [ckeditor/ckeditor5#991](https://github.com/ckeditor/ckeditor5/issues/991) for more information.


## [1.0.0-beta.4](https://github.com/ckeditor/ckeditor5-widget/compare/v1.0.0-beta.2...v1.0.0-beta.4) (2018-04-19)

Internal changes only (updated dependencies, documentation, etc.).


## [1.0.0-beta.2](https://github.com/ckeditor/ckeditor5-widget/compare/v1.0.0-beta.1...v1.0.0-beta.2) (2018-04-10)

### Bug fixes

* Replaced nested editable's `.ck-editable` class with `.ck-editor__editable` + `.ck-editor__nested-editable` to stop Grammarly throwing errors. Closes [ckeditor/ckeditor5#578](https://github.com/ckeditor/ckeditor5/issues/578). ([051b326](https://github.com/ckeditor/ckeditor5-widget/commit/051b326))

### Other changes

* Increased the specificity of CSS rules. Introduced the .ck class for editor UI components (see: [ckeditor/ckeditor5#494](https://github.com/ckeditor/ckeditor5/issues/494)). ([abc7def](https://github.com/ckeditor/ckeditor5-widget/commit/abc7def))

### BREAKING CHANGES

* The `.ck-editable` class is no longer available. Use the `.ck-editor__nested-editable` class instead.


## [1.0.0-beta.1](https://github.com/ckeditor/ckeditor5-widget/compare/v1.0.0-alpha.2...v1.0.0-beta.1) (2018-03-15)

### Other changes

* Aligned feature class naming to the new scheme. ([23991a4](https://github.com/ckeditor/ckeditor5-widget/commit/23991a4))
* Migrated package styles to PostCSS. Moved visual styles to `@ckeditor/ckeditor5-theme-lark` (see [ckeditor/ckeditor5-ui#144](https://github.com/ckeditor/ckeditor5-ui/issues/144)). ([857d6d4](https://github.com/ckeditor/ckeditor5-widget/commit/857d6d4))
* Switched to handling deletion around widgets by using the `delete` event instead of listening directly on key events. Closes [#29](https://github.com/ckeditor/ckeditor5-widget/issues/29). ([ee6cc95](https://github.com/ckeditor/ckeditor5-widget/commit/ee6cc95))


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
