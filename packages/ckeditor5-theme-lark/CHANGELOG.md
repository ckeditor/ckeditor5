Changelog
=========

## [0.9.0](https://github.com/ckeditor/ckeditor5-theme/compare/v0.8.0...v0.9.0) (2017-09-03)

### Bug fixes

* Disabled buttons should have a different look. Closes [#98](https://github.com/ckeditor/ckeditor5-theme/issues/98). ([afe111d](https://github.com/ckeditor/ckeditor5-theme/commit/afe111d))
* The `.ck-reset` class should set `word-wrap` to `break-word` to make sure long words do not overflow. Closes [#105](https://github.com/ckeditor/ckeditor5-theme/issues/105). Closes ckeditor/ckeditor5[#462](https://github.com/ckeditor/ckeditor5-theme/issues/462). ([327c188](https://github.com/ckeditor/ckeditor5-theme/commit/327c188))
* Toolbar items should not collapse when the toolbar is floating. Closes [#93](https://github.com/ckeditor/ckeditor5-theme/issues/93). ([b263d5f](https://github.com/ckeditor/ckeditor5-theme/commit/b263d5f))
* Tooltips for disabled buttons should not be dimmed. Closes [#70](https://github.com/ckeditor/ckeditor5-theme/issues/70). ([d36bbe7](https://github.com/ckeditor/ckeditor5-theme/commit/d36bbe7))

### Features

* Added styles for UI components in read–only state. Closes [#100](https://github.com/ckeditor/ckeditor5-theme/issues/100). ([ddf3102](https://github.com/ckeditor/ckeditor5-theme/commit/ddf3102))

### Other changes

* Implemented `.ck-editor-toolbar-container` class to control balloon panels containing editor toolbars. Closes [#89](https://github.com/ckeditor/ckeditor5-theme/issues/89). ([cd7442b](https://github.com/ckeditor/ckeditor5-theme/commit/cd7442b))
* Refactored tooltip styles to allow tooltips which are no longer pseudo-elements. Closes [#103](https://github.com/ckeditor/ckeditor5-theme/issues/103). ([c29246a](https://github.com/ckeditor/ckeditor5-theme/commit/c29246a))
* The `.ck-balloon-panel` arrow styles need an update after recent `BalloonPanelView` refactoring. Closes [#95](https://github.com/ckeditor/ckeditor5-theme/issues/95). ([f95af00](https://github.com/ckeditor/ckeditor5-theme/commit/f95af00))

### BREAKING CHANGES

* The (`.ck-balloon-panel_arrow_nw`–`.ck-balloon-panel_arrow_ne`) and (`.ck-balloon-panel_arrow_sw`–`.ck-balloon-panel_arrow_se`) class pairs have been swapped to reflect the actual placement of the arrow with respect to the balloon.
* `.ck-disabled` is no longer available as a standalone class due to differences in the implementation of the disabled state among the UI components. Use a mixin instead `.your-class.ck-disabled { [@include](https://github.com/include) ck-disabled; }` to keep the previous functionality (reduced `opacity`) or provide a custom implementation of the state.


## [0.8.0](https://github.com/ckeditor/ckeditor5-theme/compare/v0.7.0...v0.8.0) (2017-05-07)

### Other changes

* Removed the `contextualtoolbar.scss` sass file. Converted the `ck-editor-toolbar` mixin into a class. Closes [#75](https://github.com/ckeditor/ckeditor5-theme/issues/75). ([9e75920](https://github.com/ckeditor/ckeditor5-theme/commit/9e75920))

  BREAKING CHANGE: The `ck-editor-toolbar` mixin is no longer available. Please use `.ck-editor-toolbar` class instead.
  BREAKING CHANGE: The `ck-toolbar__container` class has been renamed, use `.ck-toolbar-container` instead.
* Updated class names after the refactoring in BalloonPanelView class. Closes [#84](https://github.com/ckeditor/ckeditor5-theme/issues/84). ([bdb2fa6](https://github.com/ckeditor/ckeditor5-theme/commit/bdb2fa6))

### BREAKING CHANGES

* The `ck-editor-toolbar` mixin is no longer available. Please use `.ck-editor-toolbar` class instead.
* The `ck-toolbar__container` class has been renamed, use `.ck-toolbar-container` instead.


## [0.7.0](https://github.com/ckeditor/ckeditor5-theme/compare/v0.6.1...v0.7.0) (2017-04-05)

### Features

* Added styles for active list items. Closes [#80](https://github.com/ckeditor/ckeditor5-theme/issues/80). ([05d3716](https://github.com/ckeditor/ckeditor5-theme/commit/05d3716))
* Provided styles for `FloatingToolbarView`. Closes [#73](https://github.com/ckeditor/ckeditor5-theme/issues/73). ([2c64d41](https://github.com/ckeditor/ckeditor5-theme/commit/2c64d41))

### Other changes

* Extracted "ck-hidden" CSS class to ckeditor5-ui. Closes [#78](https://github.com/ckeditor/ckeditor5-theme/issues/78). ([82b25fa](https://github.com/ckeditor/ckeditor5-theme/commit/82b25fa))
* Removed tick symbol from active list item, used inverted background and text colors instead. Closes [#82](https://github.com/ckeditor/ckeditor5-theme/issues/82). ([a2eb843](https://github.com/ckeditor/ckeditor5-theme/commit/a2eb843))


## [0.6.1](https://github.com/ckeditor/ckeditor5-theme/compare/v0.6.0...v0.6.1) (2017-03-06)

### Bug fixes

* Toolbar separator and new line CSS classes should follow our naming guidelines. Closes [#76](https://github.com/ckeditor/ckeditor5/issues/76). ([a3d9276](https://github.com/ckeditor/ckeditor5-theme/commit/a3d9276))
