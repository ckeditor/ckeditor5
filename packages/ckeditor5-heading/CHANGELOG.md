Changelog
=========

## [0.10.0](https://github.com/ckeditor/ckeditor5-heading/compare/v0.9.1...v0.10.0) (2017-09-03)

### Bug fixes

* It should not be possible to apply a heading to an image. Closes [#73](https://github.com/ckeditor/ckeditor5-heading/issues/73). ([02f66a0](https://github.com/ckeditor/ckeditor5-heading/commit/02f66a0))

### Other changes

* Aligned the implementation to the new Command API (see https://github.com/ckeditor/ckeditor5-core/issues/88). ([63b6c1c](https://github.com/ckeditor/ckeditor5-heading/commit/63b6c1c))
* Heading dropdown items should never revert the state, apply only. Closes [#83](https://github.com/ckeditor/ckeditor5-heading/issues/83). ([3f25a21](https://github.com/ckeditor/ckeditor5-heading/commit/3f25a21))
* Removed `HeadingCommand`'s properties which were exposed unnecessarily. Closes [#78](https://github.com/ckeditor/ckeditor5-heading/issues/78). ([c80e691](https://github.com/ckeditor/ckeditor5-heading/commit/c80e691))

### BREAKING CHANGES

* The command API has been changed.
* The `HeadingCommand` constructor's second parameter was changed from the `options` object to the `modelElement` alone.

### NOTE

* The `HeadingOption` interface was moved to the `heading/heading` module.


## [0.9.1](https://github.com/ckeditor/ckeditor5-heading/compare/v0.9.0...v0.9.1) (2017-05-07)

### Other changes

* Updated translations. ([eaff2b3](https://github.com/ckeditor/ckeditor5-heading/commit/eaff2b3))


## [0.9.0](https://github.com/ckeditor/ckeditor5-heading/compare/v0.8.0...v0.9.0) (2017-04-05)

### Bug fixes

* Changed the default heading drop-down title to a more meaningful one. Closes [#68](https://github.com/ckeditor/ckeditor5-heading/issues/68). Closes [#62](https://github.com/ckeditor/ckeditor5-heading/issues/62). ([1c16e96](https://github.com/ckeditor/ckeditor5-heading/commit/1c16e96)) and ([e58dadc](https://github.com/ckeditor/ckeditor5-heading/commit/e58dadc))
* Drop-down should be inactive when none of the commands can be applied to the current selection. Closes [#66](https://github.com/ckeditor/ckeditor5-heading/issues/66). ([0ebd5cd](https://github.com/ckeditor/ckeditor5-heading/commit/0ebd5cd))

### Features

* Active heading is marked in the drop-down list. Closes [#26](https://github.com/ckeditor/ckeditor5-heading/issues/26). ([39ba14b](https://github.com/ckeditor/ckeditor5-heading/commit/39ba14b))
* Enabled the tooltip for the 'headings' component in editor.ui#componentFactory. Closes [#55](https://github.com/ckeditor/ckeditor5-heading/issues/55). ([794e6df](https://github.com/ckeditor/ckeditor5-heading/commit/794e6df))
* Named existing plugin(s). ([7d512cd](https://github.com/ckeditor/ckeditor5-heading/commit/7d512cd))
* Split "heading" command into independent commands. Closes [#53](https://github.com/ckeditor/ckeditor5-heading/issues/53). Closes [#56](https://github.com/ckeditor/ckeditor5-heading/issues/56). Closes [#52](https://github.com/ckeditor/ckeditor5-heading/issues/52). ([7a8f6f0](https://github.com/ckeditor/ckeditor5-heading/commit/7a8f6f0))
* Styled items in the headings toolbar dropdown. Closes [#38](https://github.com/ckeditor/ckeditor5-heading/issues/38). ([0365333](https://github.com/ckeditor/ckeditor5-heading/commit/0365333))

### Other changes

* Introduced consistent height and spacing among headings dropdown items. Closes [#63](https://github.com/ckeditor/ckeditor5-heading/issues/63). ([68d93ff](https://github.com/ckeditor/ckeditor5-heading/commit/68d93ff))
* Updated translations. ([fc95eee](https://github.com/ckeditor/ckeditor5-heading/commit/fc95eee))

### BREAKING CHANGES

* The "heading" command is no longer available. Replaced by "heading1", "heading2", "heading3" and "paragraph".
* `Heading` plugin requires `Paragraph` to work properly (`ParagraphCommand` registered as "paragraph" in `editor.commands`).
* `config.heading.options` format has changed. The valid `HeadingOption` syntax is now `{ modelElement: 'heading1', viewElement: 'h1', title: 'Heading 1' }`.


## [0.8.0](https://github.com/ckeditor/ckeditor5-heading/compare/v0.7.0...v0.8.0) (2017-03-06)

### Features

* Enabled configuration and localization of available headings (see `config.heading.options`). Closes [#33](https://github.com/ckeditor/ckeditor5/issues/33). ([de07a0c](https://github.com/ckeditor/ckeditor5-heading/commit/de07a0c))

### Other changes

* Updated translations. ([50583b4](https://github.com/ckeditor/ckeditor5-heading/commit/50583b4))


### BREAKING CHANGES

* The `heading` command now accepts `id` option, not `formatId`.
