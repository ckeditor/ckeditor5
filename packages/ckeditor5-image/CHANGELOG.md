Changelog
=========

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
