Changelog
=========

## [0.5.0](https://github.com/ckeditor/ckeditor5-image/compare/v0.4.0...v0.5.0) (2017-04-05)

### Bug fixes

* Caption will not be automatically added second time if it was already added before "caption fixer" got fired. Closes [#78](https://github.com/ckeditor/ckeditor5-image/issues/78). ([e651b01](https://github.com/ckeditor/ckeditor5-image/commit/e651b01))
* Image captions in the view are hidden instead of being removed. Closes [#77](https://github.com/ckeditor/ckeditor5-image/issues/77). ([aae2957](https://github.com/ckeditor/ckeditor5-image/commit/aae2957))
* The editor no longer crashes when undoing or redoing changes should reshow temporarily invisible image caption. Closes [#58](https://github.com/ckeditor/ckeditor5-image/issues/58). ([8e36645](https://github.com/ckeditor/ckeditor5-image/commit/8e36645))
* The image goes beyond the boundaries of the parent block. Closes [#67](https://github.com/ckeditor/ckeditor5-image/issues/67). ([d1ee92d](https://github.com/ckeditor/ckeditor5-image/commit/d1ee92d))

### Features

* Added "Enter caption here" placeholders to empty image captions. Closes [#71](https://github.com/ckeditor/ckeditor5-image/issues/71). ([3818544](https://github.com/ckeditor/ckeditor5-image/commit/3818544))
* Introduced `toWidgetEditable()`. Closes [#57](https://github.com/ckeditor/ckeditor5-image/issues/57). ([ecbe435](https://github.com/ckeditor/ckeditor5-image/commit/ecbe435))

  The styling and behavior of image's caption will now be reusable in other widgets.

  BREAKING CHANGE: Widget utility function `widgetize()` was renamed to `toWidget()`.
* Named existing plugin(s). ([de96d07](https://github.com/ckeditor/ckeditor5-image/commit/de96d07))

### Other changes

* Aligned the use of the `Widget` plugin by the `Image`. Closes [#89](https://github.com/ckeditor/ckeditor5-image/issues/89). ([16f285d](https://github.com/ckeditor/ckeditor5-image/commit/16f285d))
* Extracted widget API to a separate package. Closes [#35](https://github.com/ckeditor/ckeditor5-image/issues/35). ([016b68e](https://github.com/ckeditor/ckeditor5-image/commit/016b68e))

  BREAKING CHANGE: The widget API is now available in the `ckeditor5-widget` package. See #35.
* Fixed import paths after [refactoring in ckeditor5-ui](https://github.com/ckeditor/ckeditor5-ui/pull/156). Closes [#52](https://github.com/ckeditor/ckeditor5-image/issues/52). ([cc8f671](https://github.com/ckeditor/ckeditor5-image/commit/cc8f671))
* Imported captioned image styles from ckeditor5.github.io. Closes [#68](https://github.com/ckeditor/ckeditor5-image/issues/68). ([2f993bc](https://github.com/ckeditor/ckeditor5-image/commit/2f993bc))
* Improved visual styles of the image widget. Closes [#12](https://github.com/ckeditor/ckeditor5-image/issues/12). ([8fa3746](https://github.com/ckeditor/ckeditor5-image/commit/8fa3746))
* Updated translations. ([966d911](https://github.com/ckeditor/ckeditor5-image/commit/966d911))

### BREAKING CHANGES

* The widget API is now available in the `ckeditor5-widget` package. See [#35](https://github.com/ckeditor/ckeditor5-image/issues/35).
* Widget utility function `widgetize()` was renamed to `toWidget()`.


## [0.4.0](https://github.com/ckeditor/ckeditor5-image/compare/v0.3.0...v0.4.0) (2017-03-06)

### Bug fixes

* Moved focus tracking setup to `ImageBalloonPanelView#init()` method to prevent too early access to the view element. Closes [#42](https://github.com/ckeditor/ckeditor5/issues/42). ([985e509](https://github.com/ckeditor/ckeditor5-image/commit/985e509))
* Used "low-vision" icon instead of "input" for text alternative button. Closes [#59](https://github.com/ckeditor/ckeditor5/issues/59). ([6edd823](https://github.com/ckeditor/ckeditor5-image/commit/6edd823))

### Features

* Added a separator between image styles and text alternative buttons in the image toolbar. Closes [#64](https://github.com/ckeditor/ckeditor5/issues/64). ([925a538](https://github.com/ckeditor/ckeditor5-image/commit/925a538))
* Introduced image captions support. Closes [#28](https://github.com/ckeditor/ckeditor5/issues/28). ([6bb4069](https://github.com/ckeditor/ckeditor5-image/commit/6bb4069))

### Other changes

* Enhanced how selection label for widgets is defined. Closes [#9](https://github.com/ckeditor/ckeditor5/issues/9). ([5c1897d](https://github.com/ckeditor/ckeditor5-image/commit/5c1897d))
* Renamed "Image alternate text" to "Image text alternative" all across the code. Improved directory structure to have most important features in the top level of `src/`. Closes [#37](https://github.com/ckeditor/ckeditor5/issues/37). ([e38675f](https://github.com/ckeditor/ckeditor5-image/commit/e38675f))
* Uploaded translations. ([d619f1d](https://github.com/ckeditor/ckeditor5-image/commit/d619f1d))


### BREAKING CHANGES

* The `src/imagealternatetext/imagealternatetext` module is now `src/imagetextalternative`. All other related classes and directories were renamed too.
* All the base image's util modules are now inside `src/image/`. The same applies to all other features. The main features are now directly in `src/`. Closes [#33](https://github.com/ckeditor/ckeditor5/issues/33). Closes [#26](https://github.com/ckeditor/ckeditor5/issues/26).
