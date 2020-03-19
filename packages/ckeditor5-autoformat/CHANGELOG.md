Changelog
=========

## [18.0.0](https://github.com/ckeditor/ckeditor5-autoformat/compare/v17.0.0...v18.0.0) (2020-03-19)

Internal changes only (updated dependencies, documentation, etc.).


## [17.0.0](https://github.com/ckeditor/ckeditor5-autoformat/compare/v16.0.0...v17.0.0) (2020-02-18)

Internal changes only (updated dependencies, documentation, etc.).


## [16.0.0](https://github.com/ckeditor/ckeditor5-autoformat/compare/v15.0.0...v16.0.0) (2019-12-04)

### Features

* Enabled code block autoformatting with the `` ``` `` sequence. Closes [ckeditor/ckeditor5#5672](https://github.com/ckeditor/ckeditor5/issues/5672). ([fb2d1b5](https://github.com/ckeditor/ckeditor5-autoformat/commit/fb2d1b5))

### Bug fixes

* `BlockAutoformat` should not react to text typed after inline element. Closes [ckeditor/ckeditor5#5671](https://github.com/ckeditor/ckeditor5/issues/5671). ([241c294](https://github.com/ckeditor/ckeditor5-autoformat/commit/241c294))


## [15.0.0](https://github.com/ckeditor/ckeditor5-autoformat/compare/v11.0.5...v15.0.0) (2019-10-23)

### Bug fixes

* Autoformat transformations in blocks containing inline elements. Closes [ckeditor/ckeditor5#1955](https://github.com/ckeditor/ckeditor5/issues/1955). ([133c647](https://github.com/ckeditor/ckeditor5-autoformat/commit/133c647))

### Other changes

* Add `pluginName` property to editing plugins. ([44fcbc7](https://github.com/ckeditor/ckeditor5-autoformat/commit/44fcbc7))


## [11.0.5](https://github.com/ckeditor/ckeditor5-autoformat/compare/v11.0.4...v11.0.5) (2019-08-26)

### Other changes

* The issue tracker for this package was moved to https://github.com/ckeditor/ckeditor5/issues. See [ckeditor/ckeditor5#1988](https://github.com/ckeditor/ckeditor5/issues/1988). ([65f5d11](https://github.com/ckeditor/ckeditor5-autoformat/commit/65f5d11))


## [11.0.4](https://github.com/ckeditor/ckeditor5-autoformat/compare/v11.0.3...v11.0.4) (2019-07-10)

Internal changes only (updated dependencies, documentation, etc.).


## [11.0.3](https://github.com/ckeditor/ckeditor5-autoformat/compare/v11.0.2...v11.0.3) (2019-07-04)

Internal changes only (updated dependencies, documentation, etc.).


## [11.0.2](https://github.com/ckeditor/ckeditor5-autoformat/compare/v11.0.1...v11.0.2) (2019-06-05)

Internal changes only (updated dependencies, documentation, etc.).


## [11.0.1](https://github.com/ckeditor/ckeditor5-autoformat/compare/v11.0.0...v11.0.1) (2019-04-10)

### Other changes

* Any digit followed by a dot won't trigger the numbered list. Now, only `1` is supported by the `Autoformat` plugin. Closes [#60](https://github.com/ckeditor/ckeditor5-autoformat/issues/60). ([c7c4662](https://github.com/ckeditor/ckeditor5-autoformat/commit/c7c4662))


## [11.0.0](https://github.com/ckeditor/ckeditor5-autoformat/compare/v10.0.4...v11.0.0) (2019-02-28)

### Features

* `BlockAutoformatEditing` will not format the text if the command is disabled. `InlineAutoformatEditing` will not format the text if the callback returned `false`. Closes [#64](https://github.com/ckeditor/ckeditor5-autoformat/issues/64). ([cc7f454](https://github.com/ckeditor/ckeditor5-autoformat/commit/cc7f454))
* Cancel `BlockAutoformatEditing` autoformatting if given callback returned `false`. Closes [#66](https://github.com/ckeditor/ckeditor5-autoformat/issues/66). ([9b066f1](https://github.com/ckeditor/ckeditor5-autoformat/commit/9b066f1))

### BREAKING CHANGES

* Upgraded minimal versions of Node to `8.0.0` and npm to `5.7.1`. See: [ckeditor/ckeditor5#1507](https://github.com/ckeditor/ckeditor5/issues/1507). ([612ea3c](https://github.com/ckeditor/ckeditor5-cloud-services/commit/612ea3c))


## [10.0.4](https://github.com/ckeditor/ckeditor5-autoformat/compare/v10.0.3...v10.0.4) (2018-12-05)

Internal changes only (updated dependencies, documentation, etc.).


## [10.0.3](https://github.com/ckeditor/ckeditor5-autoformat/compare/v10.0.2...v10.0.3) (2018-10-08)

Internal changes only (updated dependencies, documentation, etc.).


## [10.0.2](https://github.com/ckeditor/ckeditor5-autoformat/compare/v10.0.1...v10.0.2) (2018-07-18)

Internal changes only (updated dependencies, documentation, etc.).


## [10.0.1](https://github.com/ckeditor/ckeditor5-autoformat/compare/v10.0.0...v10.0.1) (2018-06-21)

Internal changes only (updated dependencies, documentation, etc.).


## [10.0.0](https://github.com/ckeditor/ckeditor5-autoformat/compare/v1.0.0-beta.4...v10.0.0) (2018-04-25)

### Other changes

* Changed the license to GPL2+ only. See [ckeditor/ckeditor5#991](https://github.com/ckeditor/ckeditor5/issues/991). ([a9a514a](https://github.com/ckeditor/ckeditor5-autoformat/commit/a9a514a))

### BREAKING CHANGES

* The license under which CKEditor 5 is released has been changed from a triple GPL, LGPL and MPL license to a GPL2+ only. See [ckeditor/ckeditor5#991](https://github.com/ckeditor/ckeditor5/issues/991) for more information.


## [1.0.0-beta.4](https://github.com/ckeditor/ckeditor5-autoformat/compare/v1.0.0-beta.2...v1.0.0-beta.4) (2018-04-19)

Internal changes only (updated dependencies, documentation, etc.).


## [1.0.0-beta.2](https://github.com/ckeditor/ckeditor5-autoformat/compare/v1.0.0-beta.1...v1.0.0-beta.2) (2018-04-10)

### Bug fixes

* Autoformat should ignore transparent batches. Closes [#56](https://github.com/ckeditor/ckeditor5-autoformat/issues/56). ([e42f987](https://github.com/ckeditor/ckeditor5-autoformat/commit/e42f987))


## [1.0.0-beta.1](https://github.com/ckeditor/ckeditor5-autoformat/compare/v1.0.0-alpha.2...v1.0.0-beta.1) (2018-03-15)

### Bug fixes

* Fixed integration with undo. Closes [#53](https://github.com/ckeditor/ckeditor5-autoformat/issues/53). ([f5d68f4](https://github.com/ckeditor/ckeditor5-autoformat/commit/f5d68f4))
* Ordered list will now be triggered by a numer and `.` or `)`. Closes [#42](https://github.com/ckeditor/ckeditor5-autoformat/issues/42). ([bcc4e3b](https://github.com/ckeditor/ckeditor5-autoformat/commit/bcc4e3b))

  Thanks to [@vladikoff](https://github.com/vladikoff)!

### Other changes

* Aligned feature class naming to the new scheme. ([5f5b4a9](https://github.com/ckeditor/ckeditor5-autoformat/commit/5f5b4a9))


## 0.0.1 (2017-10-27)

Internal changes only (updated dependencies, documentation, etc.).


## [1.0.0-alpha.2](https://github.com/ckeditor/ckeditor5-autoformat/compare/v1.0.0-alpha.1...v1.0.0-alpha.2) (2017-11-14)

### Bug fixes

* `LiveRanges` used by `InlineAutoFormatEngine` are now properly detached. Closes [#39](https://github.com/ckeditor/ckeditor5-autoformat/issues/39). ([5f24ae8](https://github.com/ckeditor/ckeditor5-autoformat/commit/5f24ae8))


## [1.0.0-alpha.1](https://github.com/ckeditor/ckeditor5-autoformat/compare/v0.6.0...v1.0.0-alpha.1) (2017-10-03)

### Features

* Added support for backticks which apply `<code>` to the wrapped fragment of text. Closes [#35](https://github.com/ckeditor/ckeditor5-autoformat/issues/35). ([3e93bf6](https://github.com/ckeditor/ckeditor5-autoformat/commit/3e93bf6))


## [0.6.0](https://github.com/ckeditor/ckeditor5-autoformat/compare/v0.5.1...v0.6.0) (2017-09-03)

### Bug fixes

* The `Autoformat` plugin should not require other features. Closes [#5](https://github.com/ckeditor/ckeditor5-autoformat/issues/5) and [#17](https://github.com/ckeditor/ckeditor5-autoformat/issues/17). ([d22c5b6](https://github.com/ckeditor/ckeditor5-autoformat/commit/d22c5b6))
* Autoformatting will not be triggered if the batch with changes is `transparent` (e.g. it represents other user's changes). ([f1131bc](https://github.com/ckeditor/ckeditor5-autoformat/commit/f1131bc))

### Features

* Added support for block quotes. Closes [#26](https://github.com/ckeditor/ckeditor5-autoformat/issues/26). ([4c1e83e](https://github.com/ckeditor/ckeditor5-autoformat/commit/4c1e83e))

### Other changes

* Aligned the implementation to the new Command API (see https://github.com/ckeditor/ckeditor5-core/issues/88). ([f20ef7d](https://github.com/ckeditor/ckeditor5-autoformat/commit/f20ef7d))
* The autoformat feature will not depend on the configuration of the heading feature but it will use the available `heading*` commands. Closes [#29](https://github.com/ckeditor/ckeditor5-autoformat/issues/29). ([d0cee1f](https://github.com/ckeditor/ckeditor5-autoformat/commit/d0cee1f))

### BREAKING CHANGES

* The command API has been changed.

### NOTE

* The Autoformat feature doesn't require Bold, Italic, Heading, etc. any longer. In order to make the most of the plugin, please make sure that relevant features are loaded in your editor.


## [0.5.1](https://github.com/ckeditor/ckeditor5-autoformat/compare/v0.5.0...v0.5.1) (2017-05-07)

Internal changes only (updated dependencies, documentation, etc.).

## [0.5.0](https://github.com/ckeditor/ckeditor5-autoformat/compare/v0.4.1...v0.5.0) (2017-04-05)

### Features

* Named existing plugin(s). ([e043947](https://github.com/ckeditor/ckeditor5-autoformat/commit/e043947))

### Other changes

* Updated command names to match the latest API of the Heading feature. Closes [#22](https://github.com/ckeditor/ckeditor5-autoformat/issues/22). ([10b5561](https://github.com/ckeditor/ckeditor5-autoformat/commit/10b5561))


## [0.4.1](https://github.com/ckeditor/ckeditor5-autoformat/compare/v0.4.0...v0.4.1) (2017-03-06)

### Other changes

* Aligned the use of the `heading` command to the changes in the `ckeditor5-heading` package. Closes [#20](https://github.com/ckeditor/ckeditor5/issues/20). ([6b8b759](https://github.com/ckeditor/ckeditor5-autoformat/commit/6b8b759))
