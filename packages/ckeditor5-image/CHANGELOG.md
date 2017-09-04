Changelog
=========

## [0.7.0](https://github.com/ckeditor/ckeditor5-image/compare/v0.6.0...v0.7.0) (2017-09-03)

### Bug fixes

* `ImageStyleCommand` should switch properly between any two non-null styles. Closes [#132](https://github.com/ckeditor/ckeditor5-image/issues/132). ([d6c847d](https://github.com/ckeditor/ckeditor5-image/commit/d6c847d))
* Text alternative input should synchronize its value when the balloon shows up. Closes [#114](https://github.com/ckeditor/ckeditor5-image/issues/114). ([9b105ed](https://github.com/ckeditor/ckeditor5-image/commit/9b105ed))
* The arrow of the toolbar's balloon should inherit the background color. Closes [#109](https://github.com/ckeditor/ckeditor5-image/issues/109). ([4322b04](https://github.com/ckeditor/ckeditor5-image/commit/4322b04))
* The image toolbar should not be doubled when the `ContextualToolbar` plugin is in use. Closes [#110](https://github.com/ckeditor/ckeditor5-image/issues/110). ([5ace9a0](https://github.com/ckeditor/ckeditor5-image/commit/5ace9a0))

### Features

* Introduced support for responsive image's `srcset` attribute. Closes [#2](https://github.com/ckeditor/ckeditor5-image/issues/2). ([5b433d2](https://github.com/ckeditor/ckeditor5-image/commit/5b433d2))

### Other changes

* Aligned the implementation to the new Command API (see https://github.com/ckeditor/ckeditor5-core/issues/88). ([2c0044c](https://github.com/ckeditor/ckeditor5-image/commit/2c0044c))

### BREAKING CHANGES

* The command API has been changed.


## [0.6.0](https://github.com/ckeditor/ckeditor5-image/compare/v0.5.0...v0.6.0) (2017-05-07)

### Bug fixes

* Bare `<img>` (not wrapped with `<figure class="image">`) can now be pasted into the editor. Closes [#8](https://github.com/ckeditor/ckeditor5-image/issues/8). ([fb6ab1a](https://github.com/ckeditor/ckeditor5-image/commit/fb6ab1a))
* Fixed toolbar positioning in MS Edge. Closes [#101](https://github.com/ckeditor/ckeditor5-image/issues/101). ([19941e9](https://github.com/ckeditor/ckeditor5-image/commit/19941e9))
* The `caption` item should inherit from `$block` to automatically allow the same content. Closes [#94](https://github.com/ckeditor/ckeditor5-image/issues/94). ([02869eb](https://github.com/ckeditor/ckeditor5-image/commit/02869eb))

### Features

* Introduced support for pasting and loading images in context in which they cannot appear in the editor. For example, if `<p>foo<img>bar</p>` is pasted, the pasted paragraph will be split (because an image in the editor cannot be contained in a paragraph). Closes [#98](https://github.com/ckeditor/ckeditor5-image/issues/98). ([e2104b1](https://github.com/ckeditor/ckeditor5-image/commit/e2104b1))

### Other changes

* Removed automatically filled `config.image.defaultToolbar`. Now, when initializing the editor one must always define `config.image.toolbar`. Closes [#60](https://github.com/ckeditor/ckeditor5-image/issues/60). ([4db7b34](https://github.com/ckeditor/ckeditor5-image/commit/4db7b34))
* Updated translations. ([22b5dbc](https://github.com/ckeditor/ckeditor5-image/commit/22b5dbc))

### BREAKING CHANGES

* The `config.image.defaultToolbar` is no longer available. All editor instances must have `config.image.toolbar` configured instead.


## [0.5.0](https://github.com/ckeditor/ckeditor5-image/compare/v0.4.0...v0.5.0) (2017-04-05)

### Bug fixes

* Caption will not be automatically added for the second time if it was already added before "caption fixer" was fired. Closes [#78](https://github.com/ckeditor/ckeditor5-image/issues/78). ([e651b01](https://github.com/ckeditor/ckeditor5-image/commit/e651b01))
* Image captions in the view are hidden instead of being removed (from the view and the DOM). Closes [#77](https://github.com/ckeditor/ckeditor5-image/issues/77). ([aae2957](https://github.com/ckeditor/ckeditor5-image/commit/aae2957))
* The editor no longer crashes when undoing or redoing changes reshow temporarily invisible image caption. Closes [#58](https://github.com/ckeditor/ckeditor5-image/issues/58). ([8e36645](https://github.com/ckeditor/ckeditor5-image/commit/8e36645))
* The image should not go (visually) beyond the boundaries of the parent container. Closes [#67](https://github.com/ckeditor/ckeditor5-image/issues/67). ([d1ee92d](https://github.com/ckeditor/ckeditor5-image/commit/d1ee92d))

### Features

* Added "Enter caption here" placeholders to empty image captions. Closes [#71](https://github.com/ckeditor/ckeditor5-image/issues/71). ([3818544](https://github.com/ckeditor/ckeditor5-image/commit/3818544))
* Introduced `toWidgetEditable()`. Closes [#57](https://github.com/ckeditor/ckeditor5-image/issues/57). ([ecbe435](https://github.com/ckeditor/ckeditor5-image/commit/ecbe435))

  The styling and behavior of image's caption will now be reusable in other widgets.
* Named existing plugin(s). ([de96d07](https://github.com/ckeditor/ckeditor5-image/commit/de96d07))

### Other changes

* Aligned the use of the `Widget` plugin. Closes [#89](https://github.com/ckeditor/ckeditor5-image/issues/89). ([16f285d](https://github.com/ckeditor/ckeditor5-image/commit/16f285d))
* Extracted widget API to a separate package. Closes [#35](https://github.com/ckeditor/ckeditor5-image/issues/35). ([016b68e](https://github.com/ckeditor/ckeditor5-image/commit/016b68e))
* Fixed import paths after [refactoring in ckeditor5-ui](https://github.com/ckeditor/ckeditor5-ui/pull/156). Closes [#52](https://github.com/ckeditor/ckeditor5-image/issues/52). ([cc8f671](https://github.com/ckeditor/ckeditor5-image/commit/cc8f671))
* Imported captioned image styles from ckeditor5.github.io. Closes [#68](https://github.com/ckeditor/ckeditor5-image/issues/68). ([2f993bc](https://github.com/ckeditor/ckeditor5-image/commit/2f993bc))
* Improved visual styles of the image widget. Closes [#12](https://github.com/ckeditor/ckeditor5-image/issues/12). ([8fa3746](https://github.com/ckeditor/ckeditor5-image/commit/8fa3746))
* Updated translations. ([966d911](https://github.com/ckeditor/ckeditor5-image/commit/966d911))

### BREAKING CHANGES

* The widget API is now available in the `ckeditor5-widget` package. See [#35](https://github.com/ckeditor/ckeditor5-image/issues/35).


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
