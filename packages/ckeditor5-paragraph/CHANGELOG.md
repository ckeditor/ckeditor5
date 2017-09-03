Changelog
=========

## [0.9.0](https://github.com/ckeditor/ckeditor5-paragraph/compare/v0.8.0...v0.9.0) (2017-09-03)

### Bug fixes

* `ParagraphCommand` should check whether it can be applied to the selection. Closes [#24](https://github.com/ckeditor/ckeditor5-paragraph/issues/24). ([07b37af](https://github.com/ckeditor/ckeditor5-paragraph/commit/07b37af))
* Autoparagraphing empty roots will not be triggered if the change-to-fix was in a `transparent` batch. Closes [#26](https://github.com/ckeditor/ckeditor5-paragraph/issues/26). ([a171de3](https://github.com/ckeditor/ckeditor5-paragraph/commit/a171de3))

### Other changes

* Aligned the implementation to the new Command API (see https://github.com/ckeditor/ckeditor5-core/issues/88). ([c2a1559](https://github.com/ckeditor/ckeditor5-paragraph/commit/c2a1559))

### BREAKING CHANGES

* The command API has been changed.


## [0.8.0](https://github.com/ckeditor/ckeditor5-paragraph/compare/v0.7.0...v0.8.0) (2017-05-07)

### Bug fixes

* Content autoparagraphing has been improved. "Inline" view elements (converted to attributes or elements) will be now correctly handled and autoparagraphed. Closes [#10](https://github.com/ckeditor/ckeditor5-paragraph/issues/10). Closes [#11](https://github.com/ckeditor/ckeditor5-paragraph/issues/11). ([22d387c](https://github.com/ckeditor/ckeditor5-paragraph/commit/22d387c))

### Features

* Paragraph will be automatically created if loaded empty data or if programmatically emptied the root element. Closes [#19](https://github.com/ckeditor/ckeditor5-paragraph/issues/19). ([c42d33e](https://github.com/ckeditor/ckeditor5-paragraph/commit/c42d33e))


## [0.7.0](https://github.com/ckeditor/ckeditor5-paragraph/compare/v0.6.1...v0.7.0) (2017-04-05)

### Bug fixes

* Paragraph command should correctly update its `value` and `isEnabled` properties. Closes [#16](https://github.com/ckeditor/ckeditor5-paragraph/issues/16). ([931e02f](https://github.com/ckeditor/ckeditor5-paragraph/commit/931e02f))

### Features

* Implemented `ParagraphCommand`, previously part of the `HeadingCommand`. Closes [#14](https://github.com/ckeditor/ckeditor5-paragraph/issues/14). ([876877d](https://github.com/ckeditor/ckeditor5-paragraph/commit/876877d))
* Named existing plugin(s). ([46dc9b8](https://github.com/ckeditor/ckeditor5-paragraph/commit/46dc9b8))


## [0.6.1](https://github.com/ckeditor/ckeditor5-paragraph/compare/v0.6.0...v0.6.1) (2017-03-06)

Internal changes only (updated dependencies, documentation, etc.).
