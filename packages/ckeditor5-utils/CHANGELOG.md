Changelog
=========

## [1.0.0-alpha.2](https://github.com/ckeditor/ckeditor5-utils/compare/v1.0.0-alpha.1...v1.0.0-alpha.2) (2017-11-14)

### Bug fixes

* Removed a period at the end of an error message because some browsers included the period in links to errors. Closes [#193](https://github.com/ckeditor/ckeditor5-utils/issues/193). ([fdebc2f](https://github.com/ckeditor/ckeditor5-utils/commit/fdebc2f))


## [1.0.0-alpha.1](https://github.com/ckeditor/ckeditor5-utils/compare/v0.10.0...v1.0.0-alpha.1) (2017-10-03)

### Features

* Scrolling DOM utilities should support multi-window scenarios. Closes [#175](https://github.com/ckeditor/ckeditor5-utils/issues/175). ([a5c27ea](https://github.com/ckeditor/ckeditor5-utils/commit/a5c27ea))

### Other changes

* `CKEditorError#message`, `log.error()` and `log.warn()` will contain a link to the error documentation. Closes [#185](https://github.com/ckeditor/ckeditor5-utils/issues/185). ([b7a00c9](https://github.com/ckeditor/ckeditor5-utils/commit/b7a00c9))


## [0.10.0](https://github.com/ckeditor/ckeditor5-utils/compare/v0.9.1...v0.10.0) (2017-09-03)

### Bug fixes

* `FocusTracker` should remain in sync when multiple `blur` events are followed by the `focus` event. Closes [#159](https://github.com/ckeditor/ckeditor5-utils/issues/159). ([0ff1b34](https://github.com/ckeditor/ckeditor5-utils/commit/0ff1b34))

### Features

* `KeystrokeHandler` should support priorities and proper keystroke cancelling. Closes [#180](https://github.com/ckeditor/ckeditor5-utils/issues/180). ([14af24c](https://github.com/ckeditor/ckeditor5-utils/commit/14af24c))
* Added support for `'space'` key code in the `parseKeystroke()` helper. Closes [#169](https://github.com/ckeditor/ckeditor5-utils/issues/169). ([f86b1ad](https://github.com/ckeditor/ckeditor5-utils/commit/f86b1ad))
* Introduced `ObservableMixin#decorate()` and support for setting `EmitterMixin#fire()`'s return value by listeners. Closes [#162](https://github.com/ckeditor/ckeditor5-utils/issues/162). ([377c875](https://github.com/ckeditor/ckeditor5-utils/commit/377c875))
* Introduced a static `Rect.getDomRangeRects()` method for external usage. Closes [#168](https://github.com/ckeditor/ckeditor5-utils/issues/168). ([f67aea1](https://github.com/ckeditor/ckeditor5-utils/commit/f67aea1))

### Other changes

* The `getOptimalPosition()` utility should accept the target option defined as a function. Closes [#157](https://github.com/ckeditor/ckeditor5-utils/issues/157). ([d63abae](https://github.com/ckeditor/ckeditor5-utils/commit/d63abae))


## [0.9.1](https://github.com/ckeditor/ckeditor5-utils/compare/v0.9.0...v0.9.1) (2017-05-07)

### Bug fixes

* The `Rect` utility should work for collapsed DOM Ranges. Closes [#153](https://github.com/ckeditor/ckeditor5-utils/issues/153). ([92aff35](https://github.com/ckeditor/ckeditor5-utils/commit/92aff35))
* The `getOptimalPosition()` utility should consider limiter ancestors with CSS overflow. Closes [#148](https://github.com/ckeditor/ckeditor5-utils/issues/148). ([6bf1741](https://github.com/ckeditor/ckeditor5-utils/commit/6bf1741))


## [0.9.0](https://github.com/ckeditor/ckeditor5-utils/compare/v0.8.0...v0.9.0) (2017-04-05)

### Bug fixes

* The `getOptimalPosition()` utility should work fine when the parent element has a scroll. Closes [#139](https://github.com/ckeditor/ckeditor5-utils/issues/139). ([b878949](https://github.com/ckeditor/ckeditor5-utils/commit/b878949))

### Features

* `Collection.bindTo()` method now is not only available in the `ViewCollection` but in all `Collection`s. Closes [#125](https://github.com/ckeditor/ckeditor5-utils/issues/125). ([4e299be](https://github.com/ckeditor/ckeditor5-utils/commit/4e299be))
* Added the `first()` function. Closes [#130](https://github.com/ckeditor/ckeditor5-utils/issues/130). ([8ab07d2](https://github.com/ckeditor/ckeditor5-utils/commit/8ab07d2))
* Two–way data binding between `Collection` instances. Closes [#132](https://github.com/ckeditor/ckeditor5-utils/issues/132). ([6b79624](https://github.com/ckeditor/ckeditor5-utils/commit/6b79624))


## [0.8.0](https://github.com/ckeditor/ckeditor5-utils/compare/v0.7.0...v0.8.0) (2017-03-06)

### Features

* Added ability to provide default configurations to `Config` constructor. Closes [#126](https://github.com/ckeditor/ckeditor5/issues/126). ([16a2a31](https://github.com/ckeditor/ckeditor5-utils/commit/16a2a31))
