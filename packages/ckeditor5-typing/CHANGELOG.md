Changelog
=========

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
