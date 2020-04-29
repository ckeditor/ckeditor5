Changelog
=========

## [19.0.0](https://github.com/ckeditor/ckeditor5-enter/compare/v18.0.0...v19.0.0) (2020-04-29)

Internal changes only (updated dependencies, documentation, etc.).


## [18.0.0](https://github.com/ckeditor/ckeditor5-enter/compare/v17.0.0...v18.0.0) (2020-03-19)

Internal changes only (updated dependencies, documentation, etc.).


## [17.0.0](https://github.com/ckeditor/ckeditor5-enter/compare/v16.0.0...v17.0.0) (2020-02-19)

### Other changes

* Fixed a case in track changes. Closes [ckeditor/ckeditor5#6072](https://github.com/ckeditor/ckeditor5/issues/6072). ([4848bcb](https://github.com/ckeditor/ckeditor5-enter/commit/4848bcb))


## [16.0.0](https://github.com/ckeditor/ckeditor5-enter/compare/v15.0.0...v16.0.0) (2019-12-04)

Internal changes only (updated dependencies, documentation, etc.).


## [15.0.0](https://github.com/ckeditor/ckeditor5-enter/compare/v11.1.0...v15.0.0) (2019-10-23)

Internal changes only (updated dependencies, documentation, etc.).


## [11.1.0](https://github.com/ckeditor/ckeditor5-enter/compare/v11.0.4...v11.1.0) (2019-08-26)

### Features

* Attributes (of the text and element) will be copied to the next line on <kbd>Enter</kbd>. This functionality needs to be turned on by setting `copyOnEnter` in the schema for each attribute that you register. Closes [#40](https://github.com/ckeditor/ckeditor5-enter/issues/40). ([36bdcd8](https://github.com/ckeditor/ckeditor5-enter/commit/36bdcd8))

### Other changes

* The issue tracker for this package was moved to https://github.com/ckeditor/ckeditor5/issues. See [ckeditor/ckeditor5#1988](https://github.com/ckeditor/ckeditor5/issues/1988). ([036217a](https://github.com/ckeditor/ckeditor5-enter/commit/036217a))


## [11.0.4](https://github.com/ckeditor/ckeditor5-enter/compare/v11.0.3...v11.0.4) (2019-07-10)

Internal changes only (updated dependencies, documentation, etc.).


## [11.0.3](https://github.com/ckeditor/ckeditor5-enter/compare/v11.0.2...v11.0.3) (2019-07-04)

Internal changes only (updated dependencies, documentation, etc.).


## [11.0.2](https://github.com/ckeditor/ckeditor5-enter/compare/v11.0.1...v11.0.2) (2019-06-05)

Internal changes only (updated dependencies, documentation, etc.).


## [11.0.1](https://github.com/ckeditor/ckeditor5-enter/compare/v11.0.0...v11.0.1) (2019-04-10)

Internal changes only (updated dependencies, documentation, etc.).


## [11.0.0](https://github.com/ckeditor/ckeditor5-enter/compare/v10.1.3...v11.0.0) (2019-02-28)

### BREAKING CHANGES

* Upgraded minimal versions of Node to `8.0.0` and npm to `5.7.1`. See: [ckeditor/ckeditor5#1507](https://github.com/ckeditor/ckeditor5/issues/1507). ([612ea3c](https://github.com/ckeditor/ckeditor5-cloud-services/commit/612ea3c))


## [10.1.3](https://github.com/ckeditor/ckeditor5-enter/compare/v10.1.2...v10.1.3) (2018-12-05)

### Bug fixes

* `EnterCommand` will use `writer.split()` also at the beginning and at the end of a block. ([c159958](https://github.com/ckeditor/ckeditor5-enter/commit/c159958))


## [10.1.2](https://github.com/ckeditor/ckeditor5-enter/compare/v10.1.1...v10.1.2) (2018-10-08)

### Bug fixes

* The default action of <kbd>Enter</kbd> should be always prevented. Closes [ckeditor/ckeditor5#1120](https://github.com/ckeditor/ckeditor5/issues/1120). ([8d7c75f](https://github.com/ckeditor/ckeditor5-enter/commit/8d7c75f))


## [10.1.1](https://github.com/ckeditor/ckeditor5-enter/compare/v10.1.0...v10.1.1) (2018-07-18)

Internal changes only (updated dependencies, documentation, etc.).


## [10.1.0](https://github.com/ckeditor/ckeditor5-enter/compare/v10.0.0...v10.1.0) (2018-06-21)

### Features

* Introduced the `ShiftEnter` plugin (support for inserting soft breaks by pressing <kbd>Shift</kbd>+<kbd>Enter</kbd>). This plugin will also be added to the `Essentials` plugin which is available in all official builds, so soft break support will automatically be present in all builds now. Closes [#2](https://github.com/ckeditor/ckeditor5-enter/issues/2). ([0181bbf](https://github.com/ckeditor/ckeditor5-enter/commit/0181bbf))

  Huge thanks to [Alex Eckermann](https://github.com/alexeckermann) for this contribution!


## [10.0.0](https://github.com/ckeditor/ckeditor5-enter/compare/v1.0.0-beta.4...v10.0.0) (2018-04-25)

### Other changes

* Changed the license to GPL2+ only. See [ckeditor/ckeditor5#991](https://github.com/ckeditor/ckeditor5/issues/991). ([9f003b6](https://github.com/ckeditor/ckeditor5-enter/commit/9f003b6))

### BREAKING CHANGES

* The license under which CKEditor 5 is released has been changed from a triple GPL, LGPL and MPL license to a GPL2+ only. See [ckeditor/ckeditor5#991](https://github.com/ckeditor/ckeditor5/issues/991) for more information.


## [1.0.0-beta.4](https://github.com/ckeditor/ckeditor5-enter/compare/v1.0.0-beta.2...v1.0.0-beta.4) (2018-04-19)

Internal changes only (updated dependencies, documentation, etc.).


## [1.0.0-beta.2](https://github.com/ckeditor/ckeditor5-enter/compare/v1.0.0-beta.1...v1.0.0-beta.2) (2018-04-10)

Internal changes only (updated dependencies, documentation, etc.).


## [1.0.0-beta.1](https://github.com/ckeditor/ckeditor5-enter/compare/v1.0.0-alpha.2...v1.0.0-beta.1) (2018-03-15)

### Bug fixes

* `EnterObserver` will stop the `keydown` event when the `enter` event is stopped. Closes: https://github.com/ckeditor/ckeditor5/issues/753. ([b9a7a1e](https://github.com/ckeditor/ckeditor5-enter/commit/b9a7a1e))

### Other changes

* Aligned code to the changes in the engine. ([39e4b4c](https://github.com/ckeditor/ckeditor5-enter/commit/39e4b4c))


## [1.0.0-alpha.2](https://github.com/ckeditor/ckeditor5-enter/compare/v1.0.0-alpha.1...v1.0.0-alpha.2) (2017-11-14)

Internal changes only (updated dependencies, documentation, etc.).

## [1.0.0-alpha.1](https://github.com/ckeditor/ckeditor5-enter/compare/v0.10.0...v1.0.0-alpha.1) (2017-10-03)

Internal changes only (updated dependencies, documentation, etc.).


## [0.10.0](https://github.com/ckeditor/ckeditor5-enter/compare/v0.9.1...v0.10.0) (2017-09-03)

### Features

* The viewport will be scrolled to the selection when <kbd>Enter</kbd> is pressed. See ckeditor/ckeditor5-engine#660. ([17f815e](https://github.com/ckeditor/ckeditor5-enter/commit/17f815e))

### Other changes

* Aligned the implementation to the new Command API (see https://github.com/ckeditor/ckeditor5-core/issues/88). ([d75b448](https://github.com/ckeditor/ckeditor5-enter/commit/d75b448))

### BREAKING CHANGES

* The command API has been changed.


## [0.9.1](https://github.com/ckeditor/ckeditor5-enter/compare/v0.9.0...v0.9.1) (2017-05-07)

Internal changes only (updated dependencies, documentation, etc.).

## [0.9.0](https://github.com/ckeditor/ckeditor5-enter/compare/v0.8.0...v0.9.0) (2017-04-05)

### Features

* Named existing plugin(s). ([7d1582b](https://github.com/ckeditor/ckeditor5-enter/commit/7d1582b))


## [0.8.0](https://github.com/ckeditor/ckeditor5-enter/compare/v0.7.0...v0.8.0) (2017-03-06)

### Features

* Integrated the command with `Schema#limits`. Closes [#38](https://github.com/ckeditor/ckeditor5/issues/38). ([36dac9b](https://github.com/ckeditor/ckeditor5-enter/commit/36dac9b))
