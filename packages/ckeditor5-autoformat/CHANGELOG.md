Changelog
=========

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
