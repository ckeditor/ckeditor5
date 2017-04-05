Changelog
=========

## [0.8.0](https://github.com/ckeditor/ckeditor5-ui/compare/v0.7.1...v0.8.0) (2017-04-05)

### Features

* Allowed marking ListItemView active using the #isActive attribute. Closes [#166](https://github.com/ckeditor/ckeditor5-ui/issues/166). ([a19d6c4](https://github.com/ckeditor/ckeditor5-ui/commit/a19d6c4))
* Enabled styling via "class" attribute in ListItemView. Closes [#162](https://github.com/ckeditor/ckeditor5-ui/issues/162). ([672bf82](https://github.com/ckeditor/ckeditor5-ui/commit/672bf82))
* Implemented features necessary for creating inline editors UI – `FloatingPanelView` class, `Template.revert()` method and `enableToolbarKeyboardFocus()` util. Closes [#152](https://github.com/ckeditor/ckeditor5-ui/issues/152). ([cb606d7](https://github.com/ckeditor/ckeditor5-ui/commit/cb606d7))

  BREAKING CHANGE: The `ui/balloonpanel/balloonpanelview` module was renamed to `ui/panel/balloon/balloonpanelview`. See #152.

### Other changes

* `ComponentFactory` will throw an error when attempting to create a non-existent component. Closes [#174](https://github.com/ckeditor/ckeditor5-ui/issues/174). ([ef0a7f8](https://github.com/ckeditor/ckeditor5-ui/commit/ef0a7f8))
* Imported "ck-hidden" CSS class from ckeditor5-theme-lark. Closes [#164](https://github.com/ckeditor/ckeditor5-ui/issues/164). ([486bb22](https://github.com/ckeditor/ckeditor5-ui/commit/486bb22))
* Moved `ViewCollection#bindTo` method to `Collection` class in `ckeditor5-utils`. Closes [#168](https://github.com/ckeditor/ckeditor5-ui/issues/168). ([5b55987](https://github.com/ckeditor/ckeditor5-ui/commit/5b55987))

  BREAKING CHANGE: `ViewCollection#bindTo.as` is renamed to `Collection#bindTo.using` when mapping function is a parameter. See`Collection#bindTo` docs.
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
