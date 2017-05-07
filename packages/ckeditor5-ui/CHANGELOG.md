Changelog
=========

## [0.9.0](https://github.com/ckeditor/ckeditor5-ui/compare/v0.8.0...v0.9.0) (2017-05-07)

### Bug fixes

* `BalloonPanelView` should not be focusable. Closes [#206](https://github.com/ckeditor/ckeditor5-ui/issues/206). ([f9e3bb7](https://github.com/ckeditor/ckeditor5-ui/commit/f9e3bb7))

  T/206a: BalloonPanelView should not be focusable
* ContextualBalloon plugin should use BalloonPanelView#pin instead of #attachTo. Closes [#192](https://github.com/ckeditor/ckeditor5-ui/issues/192). ([28dd457](https://github.com/ckeditor/ckeditor5-ui/commit/28dd457))
* ContextualBalloon.view#element should be registered in editor's focus tracker. Closes [#193](https://github.com/ckeditor/ckeditor5-ui/issues/193). ([cfbe329](https://github.com/ckeditor/ckeditor5-ui/commit/cfbe329))
* FocusCycler should ignore invisible views. Closes [#209](https://github.com/ckeditor/ckeditor5-ui/issues/209). ([b8fbaf1](https://github.com/ckeditor/ckeditor5-ui/commit/b8fbaf1))

  T/209: FocusCycler should not consider invisible views.
* ViewCollection#destroy should wait for all ViewCollection#add promises to resolve to avoid errors. Closes [#203](https://github.com/ckeditor/ckeditor5-ui/issues/203). ([a7e7c94](https://github.com/ckeditor/ckeditor5-ui/commit/a7e7c94))

### Features

* Added keepAttachedTo() method to the BalloonPanelView. Closes [#170](https://github.com/ckeditor/ckeditor5-ui/issues/170). ([101b465](https://github.com/ckeditor/ckeditor5-ui/commit/101b465))
* Introduced `ContextualToolbar` plugin. Closes [#182](https://github.com/ckeditor/ckeditor5-ui/issues/182). Closes [#187](https://github.com/ckeditor/ckeditor5-ui/issues/187). ([66a30b1](https://github.com/ckeditor/ckeditor5-ui/commit/66a30b1))

  Introduced several new positions in `BalloonPanelView#defaultPositions`. Added `className` attribute to the `BalloonPanelView` interface.

  BREAKING CHANGE: Default positions of the `BalloonPanelView` have been renamed.

  BREAKING CHANGE: Class names controlling the arrow of the panel have been renamed.
* Introduced ContextualBalloon plugin for managing contextual balloons. Closes [#134](https://github.com/ckeditor/ckeditor5-ui/issues/134). ([3ceb6a6](https://github.com/ckeditor/ckeditor5-ui/commit/3ceb6a6))
* Introduced notification plugin. Closes [#189](https://github.com/ckeditor/ckeditor5-ui/issues/189). ([f2dd63f](https://github.com/ckeditor/ckeditor5-ui/commit/f2dd63f))

### Other changes

* Improved ContextualBalloon so it supports asynchronous Views. Closes [#200](https://github.com/ckeditor/ckeditor5-ui/issues/200). ([09067aa](https://github.com/ckeditor/ckeditor5-ui/commit/09067aa))
* Merged `FloatingPanelView` into `BalloonPanelView`. Closes [#191](https://github.com/ckeditor/ckeditor5-ui/issues/191). ([4b90faa](https://github.com/ckeditor/ckeditor5-ui/commit/4b90faa))

  BREAKING CHANGE: `FloatingPanelView` is no longer available.
  BREAKING CHANGE: `BalloonPanelView#keepAttachedTo()` has been replaced by `pin()`.
  BREAKING CHANGE: Default position names in `BalloonPanelView.defaultPositions` have changed. Now prefixed with `arrow_`.
* Updated translations. ([3455fe7](https://github.com/ckeditor/ckeditor5-ui/commit/3455fe7))

### BREAKING CHANGES

* Default positions of the `BalloonPanelView` have been renamed.
* Class names controlling the arrow of the panel have been renamed.
* `FloatingPanelView` is no longer available.
* `BalloonPanelView#keepAttachedTo()` has been replaced by `pin()`.
* Default position names in `BalloonPanelView.defaultPositions` have changed. Now prefixed with `arrow_`.


## [0.8.0](https://github.com/ckeditor/ckeditor5-ui/compare/v0.7.1...v0.8.0) (2017-04-05)

### Features

* Allowed marking ListItemView active using the #isActive attribute. Closes [#166](https://github.com/ckeditor/ckeditor5-ui/issues/166). ([a19d6c4](https://github.com/ckeditor/ckeditor5-ui/commit/a19d6c4))
* Enabled styling via "class" attribute in ListItemView. Closes [#162](https://github.com/ckeditor/ckeditor5-ui/issues/162). ([672bf82](https://github.com/ckeditor/ckeditor5-ui/commit/672bf82))
* Implemented features necessary for creating inline editors UI – `FloatingPanelView` class, `Template.revert()` method and `enableToolbarKeyboardFocus()` util. Closes [#152](https://github.com/ckeditor/ckeditor5-ui/issues/152). ([cb606d7](https://github.com/ckeditor/ckeditor5-ui/commit/cb606d7))

### Other changes

* `ComponentFactory` will throw an error when attempting to create a non-existent component. Closes [#174](https://github.com/ckeditor/ckeditor5-ui/issues/174). ([ef0a7f8](https://github.com/ckeditor/ckeditor5-ui/commit/ef0a7f8))
* Imported "ck-hidden" CSS class from ckeditor5-theme-lark. Closes [#164](https://github.com/ckeditor/ckeditor5-ui/issues/164). ([486bb22](https://github.com/ckeditor/ckeditor5-ui/commit/486bb22))
* Moved `ViewCollection#bindTo` method to `Collection` class in `ckeditor5-utils`. Closes [#168](https://github.com/ckeditor/ckeditor5-ui/issues/168). ([5b55987](https://github.com/ckeditor/ckeditor5-ui/commit/5b55987))
* Updated translations. ([3b27e51](https://github.com/ckeditor/ckeditor5-ui/commit/3b27e51))

### BREAKING CHANGES

* `ViewCollection#bindTo.as` is renamed to `Collection#bindTo.using` when mapping function is a parameter. See`Collection#bindTo` docs.
* The `ui/balloonpanel/balloonpanelview` module was renamed to `ui/panel/balloon/balloonpanelview`. See [#152](https://github.com/ckeditor/ckeditor5-ui/issues/152).


## [0.7.1](https://github.com/ckeditor/ckeditor5-ui/compare/v0.7.0...v0.8.0) (2017-03-06)

### Bug fixes

* Removed title from the editable element. Fixes [#121](https://github.com/ckeditor/ckeditor5/issues/121). ([71fb3eb](https://github.com/ckeditor/ckeditor5-ui/commit/71fb3eb))

### Features

* Added support for toolbar item separators. Closes [#154](https://github.com/ckeditor/ckeditor5/issues/154). ([f3cb75d](https://github.com/ckeditor/ckeditor5-ui/commit/f3cb75d))

### Other changes

* Uploaded translations. ([67ba32b](https://github.com/ckeditor/ckeditor5-ui/commit/67ba32b))
