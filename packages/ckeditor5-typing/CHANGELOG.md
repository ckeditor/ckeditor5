Changelog
=========

## [1.0.0-alpha.2](https://github.com/ckeditor/ckeditor5-typing/compare/v1.0.0-alpha.1...v1.0.0-alpha.2) (2017-11-14)

Internal changes only (updated dependencies, documentation, etc.).

## [1.0.0-alpha.1](https://github.com/ckeditor/ckeditor5-typing/compare/v0.10.0...v1.0.0-alpha.1) (2017-10-03)

### Bug fixes

* Fixed a bug where using spellchecker sometimes caused creating incorrect deltas, which caused bugs in undo. Closes [#123](https://github.com/ckeditor/ckeditor5-typing/issues/123). Closes [ckeditor/ckeditor5-engine#1152](https://github.com/ckeditor/ckeditor5-engine/issues/1152). ([9a5e22b](https://github.com/ckeditor/ckeditor5-typing/commit/9a5e22b))
* Fixed an error where using spellchecker on a word with a style applied sometimes resulted in that word being removed. Closes [#117](https://github.com/ckeditor/ckeditor5-typing/issues/117). ([1e8d02b](https://github.com/ckeditor/ckeditor5-typing/commit/1e8d02b))


## [0.10.0](https://github.com/ckeditor/ckeditor5-typing/compare/v0.9.1...v0.10.0) (2017-09-03)

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


## [0.9.1](https://github.com/ckeditor/ckeditor5-typing/compare/v0.9.0...v0.9.1) (2017-05-07)

Internal changes only (updated dependencies, documentation, etc.).

## [0.9.0](https://github.com/ckeditor/ckeditor5-typing/compare/v0.8.0...v0.9.0) (2017-04-05)

### Bug fixes

* [Safari] Fixed an issue when inserting a Spanish accent character on a non-collapsed selection wouldn't work. Closes [#82](https://github.com/ckeditor/ckeditor5-typing/issues/82). ([49cfe9c](https://github.com/ckeditor/ckeditor5-typing/commit/49cfe9c))
* `InputCommand` now accepts `Range` instead of `Position` as a parameter. Closes [#86](https://github.com/ckeditor/ckeditor5-typing/issues/86). Closes [#54](https://github.com/ckeditor/ckeditor5-typing/issues/54). ([0766407](https://github.com/ckeditor/ckeditor5-typing/commit/0766407))
* New undo step should be created on selection change or applying an attribute. Closes [#20](https://github.com/ckeditor/ckeditor5-typing/issues/20). Closes [#21](https://github.com/ckeditor/ckeditor5-typing/issues/21). ([011452b](https://github.com/ckeditor/ckeditor5-typing/commit/011452b))
* Use `typing.undoStep` in both `InputCommand` and `DeleteCommand`. Closes [#79](https://github.com/ckeditor/ckeditor5-typing/issues/79). ([c597467](https://github.com/ckeditor/ckeditor5-typing/commit/c597467))

### Features

* Named existing plugin(s). ([2a2fcae](https://github.com/ckeditor/ckeditor5-typing/commit/2a2fcae))

### BREAKING CHANGES

* `InputCommand` `options.resultPosition` was replaced with `options.resultRange`.
* The `undo.step` configuration option was replaced by `typing.undoStep` in `DeleteCommand`. See [#79](https://github.com/ckeditor/ckeditor5-typing/issues/79).


## [0.8.0](https://github.com/ckeditor/ckeditor5-typing/compare/v0.7.0...v0.8.0) (2017-03-06)

### Bug fixes

* Replace all `&nbsp;` with spaces in text inserted via mutations. Closes [#68](https://github.com/ckeditor/ckeditor5/issues/68). ([c0fce25](https://github.com/ckeditor/ckeditor5-typing/commit/c0fce25))
* Tab key should not delete selected text. Closes: [#69](https://github.com/ckeditor/ckeditor5/issues/69). ([8447f51](https://github.com/ckeditor/ckeditor5-typing/commit/8447f51))

### Features

* Introduced `InputCommand` which can be used to simulate typing. Closes [#48](https://github.com/ckeditor/ckeditor5/issues/48). ([cdb7fdf](https://github.com/ckeditor/ckeditor5-typing/commit/cdb7fdf))
