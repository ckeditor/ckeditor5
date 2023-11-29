Changelog
=========

All changes in the package are documented in the main repository. See: https://github.com/ckeditor/ckeditor5/blob/master/CHANGELOG.md.

Changes for the past releases are available below.

## [19.0.0](https://github.com/ckeditor/ckeditor5-typing/compare/v18.0.0...v19.0.0) (April 29, 2020)

Internal changes only (updated dependencies, documentation, etc.).


## [18.0.0](https://github.com/ckeditor/ckeditor5-typing/compare/v17.0.0...v18.0.0) (March 19, 2020)

### Other changes

* `DeleteCommand` should pass its direction to `Model#deleteContent()`. Closes [ckeditor/ckeditor5#6355](https://github.com/ckeditor/ckeditor5/issues/6355). See [ckeditor/ckeditor5#6356](https://github.com/ckeditor/ckeditor5/issues/6356). ([cb75e45](https://github.com/ckeditor/ckeditor5-typing/commit/cb75e45))
* Introduced support for multi-range selections. See [ckeditor/ckeditor5#6116](https://github.com/ckeditor/ckeditor5/issues/6116). ([64daf31](https://github.com/ckeditor/ckeditor5-typing/commit/64daf31))
* Run only one instance of the `TextWatcher` for all text transformations. Closes [ckeditor/ckeditor5#6020](https://github.com/ckeditor/ckeditor5/issues/6020). ([550426d](https://github.com/ckeditor/ckeditor5-typing/commit/550426d))


## [17.0.0](https://github.com/ckeditor/ckeditor5-typing/compare/v16.0.0...v17.0.0) (February 19, 2020)

### Features

* Add `TextWatcher#isEnabled` property to allow toggling text watcher on and off. ([fa79d00](https://github.com/ckeditor/ckeditor5-typing/commit/fa79d00))


## [16.0.0](https://github.com/ckeditor/ckeditor5-typing/compare/v15.0.0...v16.0.0) (December 4, 2019)

Internal changes only (updated dependencies, documentation, etc.).


## [15.0.0](https://github.com/ckeditor/ckeditor5-typing/compare/v12.2.0...v15.0.0) (October 23, 2019)

### Bug fixes

* Autoformat transformations in blocks containing inline elements. See [ckeditor/ckeditor5#1955](https://github.com/ckeditor/ckeditor5/issues/1955). ([58abd23](https://github.com/ckeditor/ckeditor5-typing/commit/58abd23))


## [12.2.0](https://github.com/ckeditor/ckeditor5-typing/compare/v12.1.1...v12.2.0) (August 26, 2019)

### Features

* Introduced `Input#isInput()`. Closes [#214](https://github.com/ckeditor/ckeditor5-typing/issues/214). Fixed the `TextTransformation` feature so it will trigger only for typing changes. Closes [#208](https://github.com/ckeditor/ckeditor5-typing/issues/208). ([0e26850](https://github.com/ckeditor/ckeditor5-typing/commit/0e26850))

### Bug fixes

* Allow dashes on the begging of a line. Closes [#200](https://github.com/ckeditor/ckeditor5-typing/issues/200). ([6ef7d47](https://github.com/ckeditor/ckeditor5-typing/commit/6ef7d47))
* Typing on mobile device will not throw after each typed character. ([056b036](https://github.com/ckeditor/ckeditor5-typing/commit/056b036))

### Other changes

* The issue tracker for this package was moved to https://github.com/ckeditor/ckeditor5/issues. See [ckeditor/ckeditor5#1988](https://github.com/ckeditor/ckeditor5/issues/1988). ([6491e8d](https://github.com/ckeditor/ckeditor5-typing/commit/6491e8d))


## [12.1.1](https://github.com/ckeditor/ckeditor5-typing/compare/v12.1.0...v12.1.1) (July 10, 2019)

### Bug fixes

* Text transformations will not remove existing formatting. Closes [#203](https://github.com/ckeditor/ckeditor5-typing/issues/203). Closes [#196](https://github.com/ckeditor/ckeditor5-typing/issues/196). ([2279eee](https://github.com/ckeditor/ckeditor5-typing/commit/2279eee))


## [12.1.0](https://github.com/ckeditor/ckeditor5-typing/compare/v12.0.2...v12.1.0) (July 4, 2019)

### Features

* Introduced the text transformation feature. Additionally, the `TextWatcher` util was moved to this package from `@ckeditor/ckeditor5-mention`. Closes [ckeditor/ckeditor5#1490](https://github.com/ckeditor/ckeditor5/issues/1490). ([dafd16e](https://github.com/ckeditor/ckeditor5-typing/commit/dafd16e))

### Bug fixes

* Improved typing on Android devices by handling `beforeinput` event instead of mutations. Introduced `options.selection` in the `DeleteCommand#execute()` params. Introduced `selectionToRemove` parameter in the `view.Document#event:delete` data. Closes [#167](https://github.com/ckeditor/ckeditor5-typing/issues/167). ([92ab3ff](https://github.com/ckeditor/ckeditor5-typing/commit/92ab3ff))


## [12.0.2](https://github.com/ckeditor/ckeditor5-typing/compare/v12.0.1...v12.0.2) (June 6, 2019)

### Other changes

* Use `Model#insertContent()` instead of `model.Writer#insertText()`. Closes [#191](https://github.com/ckeditor/ckeditor5-typing/issues/191). ([0aeb384](https://github.com/ckeditor/ckeditor5-typing/commit/0aeb384))


## [12.0.1](https://github.com/ckeditor/ckeditor5-typing/compare/v12.0.0...v12.0.1) (April 4, 2019)

### Bug fixes

* The `delete` event will now stop the `keydown` event if it was set with the highest priority. Closes [#186](https://github.com/ckeditor/ckeditor5-typing/issues/186). ([07cca83](https://github.com/ckeditor/ckeditor5-typing/commit/07cca83))


## [12.0.0](https://github.com/ckeditor/ckeditor5-typing/compare/v11.0.2...v12.0.0) (February 28, 2019)

### Bug fixes

* Fixed mutation handling which crashed when the old text was the same as the new text. Closes [#181](https://github.com/ckeditor/ckeditor5-typing/issues/181). ([7175b6c](https://github.com/ckeditor/ckeditor5-typing/commit/7175b6c))

### Other changes

* Exposed `DeleteCommand#buffer`. `InputCommand` uses `Model#deleteContent()` instead of `model.Writer#remove()`. ([5ab39fc](https://github.com/ckeditor/ckeditor5-typing/commit/5ab39fc))

### BREAKING CHANGES

* Upgraded minimal versions of Node to `8.0.0` and npm to `5.7.1`. See: [ckeditor/ckeditor5#1507](https://github.com/ckeditor/ckeditor5/issues/1507). ([612ea3c](https://github.com/ckeditor/ckeditor5-cloud-services/commit/612ea3c))


## [11.0.2](https://github.com/ckeditor/ckeditor5-typing/compare/v11.0.1...v11.0.2) (December 5, 2018)

### Bug fixes

* Non-printable keys like volume up or the win key will not remove the content anymore. Closes [#136](https://github.com/ckeditor/ckeditor5-typing/issues/136). ([0ea9fbd](https://github.com/ckeditor/ckeditor5-typing/commit/0ea9fbd))


## [11.0.1](https://github.com/ckeditor/ckeditor5-typing/compare/v11.0.0...v11.0.1) (October 8, 2018)

### Bug fixes

* `&nbsp;` is now correctly handled in mutations. Closes [#170](https://github.com/ckeditor/ckeditor5-typing/issues/170). ([9badb20](https://github.com/ckeditor/ckeditor5-typing/commit/9badb20))


## [11.0.0](https://github.com/ckeditor/ckeditor5-typing/compare/v10.0.1...v11.0.0) (July 18, 2018)

### Bug fixes

* Handle <kbd>Backspace</kbd> on Android. Closes ckeditor/ckeditor5/issues/1106. Closes https://github.com/ckeditor/ckeditor5/issues/1130. ([9161275](https://github.com/ckeditor/ckeditor5-typing/commit/9161275))
* Remove selection contents on `keydown` before the composition starts. Closes [#83](https://github.com/ckeditor/ckeditor5-typing/issues/83). Closes [#150](https://github.com/ckeditor/ckeditor5-typing/issues/150). ([ab1b46d](https://github.com/ckeditor/ckeditor5-typing/commit/ab1b46d))

### BREAKING CHANGES

* `@ckeditor/ckeditor5-typing/src/changebuffer.js` was moved to `@ckeditor/ckeditor5-typing/src/utils/changebuffer.js`.


## [10.0.1](https://github.com/ckeditor/ckeditor5-typing/compare/v10.0.0...v10.0.1) (June 21, 2018)

### Bug fixes

* Bogus `<br />` element inserted by a browser at the end of an element is now correctly handled. Closes [ckeditor/ckeditor5#1083](https://github.com/ckeditor/ckeditor5/issues/1083). ([22abdff](https://github.com/ckeditor/ckeditor5-typing/commit/22abdff))


## [10.0.0](https://github.com/ckeditor/ckeditor5-typing/compare/v1.0.0-beta.4...v10.0.0) (April 25, 2018)

### Other changes

* Changed the license to GPL2+ only. See [ckeditor/ckeditor5#991](https://github.com/ckeditor/ckeditor5/issues/991). ([d24abd5](https://github.com/ckeditor/ckeditor5-typing/commit/d24abd5))

### BREAKING CHANGES

* The license under which CKEditor&nbsp;5 is released has been changed from a triple GPL, LGPL and MPL license to a GPL2+ only. See [ckeditor/ckeditor5#991](https://github.com/ckeditor/ckeditor5/issues/991) for more information.


## [1.0.0-beta.4](https://github.com/ckeditor/ckeditor5-typing/compare/v1.0.0-beta.2...v1.0.0-beta.4) (April 19, 2018)

Internal changes only (updated dependencies, documentation, etc.).


## [1.0.0-beta.2](https://github.com/ckeditor/ckeditor5-typing/compare/v1.0.0-beta.1...v1.0.0-beta.2) (April 10, 2018)

Internal changes only (updated dependencies, documentation, etc.).


## [1.0.0-beta.1](https://github.com/ckeditor/ckeditor5-typing/compare/v1.0.0-alpha.2...v1.0.0-beta.1) (March 15, 2018)

### Bug fixes

* `DeleteObserver` will stop the `keydown` event when the `delete` event is stopped. Closes: https://github.com/ckeditor/ckeditor5/issues/753. ([479d043](https://github.com/ckeditor/ckeditor5-typing/commit/479d043))
* Editor should not crash in scenarios when mutations' common ancestor could not be mapped to the model. Closes [ckeditor/ckeditor5#718](https://github.com/ckeditor/ckeditor5/issues/718). ([db0fe8f](https://github.com/ckeditor/ckeditor5-typing/commit/db0fe8f))
* Properly discover delete-word keyboard modifier on mac and non-mac computers. Closes [#92](https://github.com/ckeditor/ckeditor5-typing/issues/92). ([81f5b76](https://github.com/ckeditor/ckeditor5-typing/commit/81f5b76))

### Other changes

* Aligned feature class naming to the new scheme. ([9c2cb9d](https://github.com/ckeditor/ckeditor5-typing/commit/9c2cb9d))


## [1.0.0-alpha.2](https://github.com/ckeditor/ckeditor5-typing/compare/v1.0.0-alpha.1...v1.0.0-alpha.2) (November 14, 2017)

Internal changes only (updated dependencies, documentation, etc.).

## [1.0.0-alpha.1](https://github.com/ckeditor/ckeditor5-typing/compare/v0.10.0...v1.0.0-alpha.1) (October 3, 2017)

### Bug fixes

* Fixed a bug where using spellchecker sometimes caused creating incorrect deltas, which caused bugs in undo. Closes [#123](https://github.com/ckeditor/ckeditor5-typing/issues/123). Closes [ckeditor/ckeditor5-engine#1152](https://github.com/ckeditor/ckeditor5-engine/issues/1152). ([9a5e22b](https://github.com/ckeditor/ckeditor5-typing/commit/9a5e22b))
* Fixed an error where using spellchecker on a word with a style applied sometimes resulted in that word being removed. Closes [#117](https://github.com/ckeditor/ckeditor5-typing/issues/117). ([1e8d02b](https://github.com/ckeditor/ckeditor5-typing/commit/1e8d02b))


## [0.10.0](https://github.com/ckeditor/ckeditor5-typing/compare/v0.9.1...v0.10.0) (September 3, 2017)

### Bug fixes

* Fixed a range of issues when typing or using a spellchecker on styled words leads to errors. Closes [#100](https://github.com/ckeditor/ckeditor5-typing/issues/100). Closes ckeditor/ckeditor5[#491](https://github.com/ckeditor/ckeditor5-typing/issues/491). ([c30dbf8](https://github.com/ckeditor/ckeditor5-typing/commit/c30dbf8))
* Prevent from modifying document by `Input` feature when `InputCommand` is disabled. Closes [#107](https://github.com/ckeditor/ckeditor5-typing/issues/107). ([f935d66](https://github.com/ckeditor/ckeditor5-typing/commit/f935d66))

### Features

* Pressing <kbd>Backspace</kbd> or <kbd>Delete</kbd> in an empty content will reset the current block to a paragraph. Closes [#61](https://github.com/ckeditor/ckeditor5-typing/issues/61). ([bb07bc6](https://github.com/ckeditor/ckeditor5-typing/commit/bb07bc6))
* The viewport will be scrolled to the selection upon user input. See ckeditor/ckeditor5-engine#660. ([2cdf02f](https://github.com/ckeditor/ckeditor5-typing/commit/2cdf02f))

### Other changes

* Aligned the implementation to the new Command API (see https://github.com/ckeditor/ckeditor5-core/issues/88). ([b241ac6](https://github.com/ckeditor/ckeditor5-typing/commit/b241ac6))

### BREAKING CHANGES

* The command API has been changed.


## [0.9.1](https://github.com/ckeditor/ckeditor5-typing/compare/v0.9.0...v0.9.1) (May 7, 2017)

Internal changes only (updated dependencies, documentation, etc.).

## [0.9.0](https://github.com/ckeditor/ckeditor5-typing/compare/v0.8.0...v0.9.0) (April 5, 2017)

### Bug fixes

* [Safari] Fixed an issue when inserting a Spanish accent character on a non-collapsed selection would not work. Closes [#82](https://github.com/ckeditor/ckeditor5-typing/issues/82). ([49cfe9c](https://github.com/ckeditor/ckeditor5-typing/commit/49cfe9c))
* `InputCommand` now accepts `Range` instead of `Position` as a parameter. Closes [#86](https://github.com/ckeditor/ckeditor5-typing/issues/86). Closes [#54](https://github.com/ckeditor/ckeditor5-typing/issues/54). ([0766407](https://github.com/ckeditor/ckeditor5-typing/commit/0766407))
* A new undo step should be created on selection change or applying an attribute. Closes [#20](https://github.com/ckeditor/ckeditor5-typing/issues/20). Closes [#21](https://github.com/ckeditor/ckeditor5-typing/issues/21). ([011452b](https://github.com/ckeditor/ckeditor5-typing/commit/011452b))
* Use `typing.undoStep` in both `InputCommand` and `DeleteCommand`. Closes [#79](https://github.com/ckeditor/ckeditor5-typing/issues/79). ([c597467](https://github.com/ckeditor/ckeditor5-typing/commit/c597467))

### Features

* Named existing plugin(s). ([2a2fcae](https://github.com/ckeditor/ckeditor5-typing/commit/2a2fcae))

### BREAKING CHANGES

* `InputCommand` `options.resultPosition` was replaced with `options.resultRange`.
* The `undo.step` configuration option was replaced by `typing.undoStep` in `DeleteCommand`. See [#79](https://github.com/ckeditor/ckeditor5-typing/issues/79).


## [0.8.0](https://github.com/ckeditor/ckeditor5-typing/compare/v0.7.0...v0.8.0) (March 6, 2017)

### Bug fixes

* Replace all `&nbsp;` with spaces in text inserted via mutations. Closes [#68](https://github.com/ckeditor/ckeditor5/issues/68). ([c0fce25](https://github.com/ckeditor/ckeditor5-typing/commit/c0fce25))
* Tab key should not delete selected text. Closes: [#69](https://github.com/ckeditor/ckeditor5/issues/69). ([8447f51](https://github.com/ckeditor/ckeditor5-typing/commit/8447f51))

### Features

* Introduced `InputCommand` which can be used to simulate typing. Closes [#48](https://github.com/ckeditor/ckeditor5/issues/48). ([cdb7fdf](https://github.com/ckeditor/ckeditor5-typing/commit/cdb7fdf))
