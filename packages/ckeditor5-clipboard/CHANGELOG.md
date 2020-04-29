Changelog
=========

## [19.0.0](https://github.com/ckeditor/ckeditor5-clipboard/compare/v18.0.0...v19.0.0) (2020-04-29)

### Other changes

* Handled `paste` and `drop` events no longer propagate up the DOM tree. Closes [ckeditor/ckeditor5#6464](https://github.com/ckeditor/ckeditor5/issues/6464). ([70aa7ba](https://github.com/ckeditor/ckeditor5-clipboard/commit/70aa7ba))


## [18.0.0](https://github.com/ckeditor/ckeditor5-clipboard/compare/v17.0.0...v18.0.0) (2020-03-19)

Internal changes only (updated dependencies, documentation, etc.).


## [17.0.0](https://github.com/ckeditor/ckeditor5-clipboard/compare/v16.0.0...v17.0.0) (2020-02-19)

Internal changes only (updated dependencies, documentation, etc.).


## [16.0.0](https://github.com/ckeditor/ckeditor5-clipboard/compare/v15.0.0...v16.0.0) (2019-12-04)

Internal changes only (updated dependencies, documentation, etc.).


## [15.0.0](https://github.com/ckeditor/ckeditor5-clipboard/compare/v12.0.2...v15.0.0) (2019-10-23)

Internal changes only (updated dependencies, documentation, etc.).


## [12.0.2](https://github.com/ckeditor/ckeditor5-clipboard/compare/v12.0.1...v12.0.2) (2019-08-26)

### Other changes

* The issue tracker for this package was moved to https://github.com/ckeditor/ckeditor5/issues. See [ckeditor/ckeditor5#1988](https://github.com/ckeditor/ckeditor5/issues/1988). ([b1782bb](https://github.com/ckeditor/ckeditor5-clipboard/commit/b1782bb))


## [12.0.1](https://github.com/ckeditor/ckeditor5-clipboard/compare/v12.0.0...v12.0.1) (2019-07-10)

Internal changes only (updated dependencies, documentation, etc.).


## [12.0.0](https://github.com/ckeditor/ckeditor5-clipboard/compare/v11.0.2...v12.0.0) (2019-07-04)

### Other changes

* New lines pasted as a plain text will always create a new paragraph. Closes [ckeditor/ckeditor5#1727](https://github.com/ckeditor/ckeditor5/issues/1727). ([f0eb3a0](https://github.com/ckeditor/ckeditor5-clipboard/commit/f0eb3a0))

### BREAKING CHANGES

* From now on, every new line pasted in the editor as a plain text, will create a new paragraph. Read more at [ckeditor/ckeditor5#1727](https://github.com/ckeditor/ckeditor5/issues/1727).


## [11.0.2](https://github.com/ckeditor/ckeditor5-clipboard/compare/v11.0.1...v11.0.2) (2019-06-05)

Internal changes only (updated dependencies, documentation, etc.).


## [11.0.1](https://github.com/ckeditor/ckeditor5-clipboard/compare/v11.0.0...v11.0.1) (2019-04-10)

### Bug fixes

* The DOM `drop` event will not bubble up if the `clipboardInput` event was handled. Closes [ckeditor/ckeditor5-upload#92](https://github.com/ckeditor/ckeditor5-upload/issues/92). ([5d14697](https://github.com/ckeditor/ckeditor5-clipboard/commit/5d14697))


## [11.0.0](https://github.com/ckeditor/ckeditor5-clipboard/compare/v10.0.4...v11.0.0) (2019-02-28)

### BREAKING CHANGES

* Upgraded minimal versions of Node to `8.0.0` and npm to `5.7.1`. See: [ckeditor/ckeditor5#1507](https://github.com/ckeditor/ckeditor5/issues/1507). ([612ea3c](https://github.com/ckeditor/ckeditor5-cloud-services/commit/612ea3c))


## [10.0.4](https://github.com/ckeditor/ckeditor5-clipboard/compare/v10.0.3...v10.0.4) (2018-12-05)

Internal changes only (updated dependencies, documentation, etc.).


## [10.0.3](https://github.com/ckeditor/ckeditor5-clipboard/compare/v10.0.2...v10.0.3) (2018-10-08)

### Other changes

* The `Clipboard#inputTransformation` event is now emitted with an additional `dataTransfer` object. Closes [#54](https://github.com/ckeditor/ckeditor5-clipboard/issues/54) . ([f3589b4](https://github.com/ckeditor/ckeditor5-clipboard/commit/f3589b4))


## [10.0.2](https://github.com/ckeditor/ckeditor5-clipboard/compare/v10.0.1...v10.0.2) (2018-07-18)

Internal changes only (updated dependencies, documentation, etc.).


## [10.0.1](https://github.com/ckeditor/ckeditor5-clipboard/compare/v10.0.0...v10.0.1) (2018-06-21)

### Bug fixes

* Disabled the entire clipboard input pipeline when the editor is read-only. Closes [#48](https://github.com/ckeditor/ckeditor5-clipboard/issues/48). ([b40ec4b](https://github.com/ckeditor/ckeditor5-clipboard/commit/b40ec4b))
* When pasting a plain text, single new line characters should be converted to `<br>`s. Closes [ckeditor/ckeditor5#766](https://github.com/ckeditor/ckeditor5/issues/766). ([be21676](https://github.com/ckeditor/ckeditor5-clipboard/commit/be21676))


## [10.0.0](https://github.com/ckeditor/ckeditor5-clipboard/compare/v1.0.0-beta.4...v10.0.0) (2018-04-25)

### Other changes

* Changed the license to GPL2+ only. See [ckeditor/ckeditor5#991](https://github.com/ckeditor/ckeditor5/issues/991). ([8c092af](https://github.com/ckeditor/ckeditor5-clipboard/commit/8c092af))

### BREAKING CHANGES

* The license under which CKEditor 5 is released has been changed from a triple GPL, LGPL and MPL license to a GPL2+ only. See [ckeditor/ckeditor5#991](https://github.com/ckeditor/ckeditor5/issues/991) for more information.


## [1.0.0-beta.4](https://github.com/ckeditor/ckeditor5-clipboard/compare/v1.0.0-beta.2...v1.0.0-beta.4) (2018-04-19)

Internal changes only (updated dependencies, documentation, etc.).


## [1.0.0-beta.2](https://github.com/ckeditor/ckeditor5-clipboard/compare/v1.0.0-beta.1...v1.0.0-beta.2) (2018-04-10)

Internal changes only (updated dependencies, documentation, etc.).


## [1.0.0-beta.1](https://github.com/ckeditor/ckeditor5-clipboard/compare/v1.0.0-alpha.2...v1.0.0-beta.1) (2018-03-15)

Internal changes only (updated dependencies, documentation, etc.).


## [1.0.0-alpha.2](https://github.com/ckeditor/ckeditor5-clipboard/compare/v1.0.0-alpha.1...v1.0.0-alpha.2) (2017-11-14)

Internal changes only (updated dependencies, documentation, etc.).


## [1.0.0-alpha.1](https://github.com/ckeditor/ckeditor5-clipboard/compare/v0.7.0...v1.0.0-alpha.1) (2017-10-03)

Internal changes only (updated dependencies, documentation, etc.).


## [0.7.0](https://github.com/ckeditor/ckeditor5-clipboard/compare/v0.6.0...v0.7.0) (2017-09-03)

### Bug fixes

* Whitespaces around inline elements will not be lost upon pasting. Closes [#24](https://github.com/ckeditor/ckeditor5-clipboard/issues/24). ([5888743](https://github.com/ckeditor/ckeditor5-clipboard/commit/5888743))

### Features

* Added the `'dragover'` event to ClipboardObserver. ([00c7567](https://github.com/ckeditor/ckeditor5-clipboard/commit/00c7567))
* Added `dropRange` to the `drop` event and `targetRanges` to the `clipboardInput` event. Closes [#29](https://github.com/ckeditor/ckeditor5-clipboard/issues/29). ([86daed9](https://github.com/ckeditor/ckeditor5-clipboard/commit/86daed9))
* Disable pasting and cutting when the editor is read-only. Closes [#26](https://github.com/ckeditor/ckeditor5-clipboard/issues/26). ([0ba74d5](https://github.com/ckeditor/ckeditor5-clipboard/commit/0ba74d5))
* The viewport will be scrolled to the selection on paste. See ckeditor/ckeditor5-engine#660. ([9a0e20f](https://github.com/ckeditor/ckeditor5-clipboard/commit/9a0e20f))


## [0.6.0](https://github.com/ckeditor/ckeditor5-clipboard/compare/v0.5.0...v0.6.0) (2017-05-07)

### Bug fixes

* Plain text data is now available in the clipboard when copying or cutting the editor contents. Closes [#11](https://github.com/ckeditor/ckeditor5-clipboard/issues/11). ([8a01e0f](https://github.com/ckeditor/ckeditor5-clipboard/commit/8a01e0f))

### Features

* Introduced `DataTransfer#files` property. Change the clipboard input pipeline. Closes [#16](https://github.com/ckeditor/ckeditor5-clipboard/issues/16). ([e4e7e10](https://github.com/ckeditor/ckeditor5-clipboard/commit/e4e7e10))

### BREAKING CHANGES

* The `clipboardInput` event now contains only the `dataTransfer` property (`content` was removed). The separate `inputTransformation` event was introduced for the content transformations.


## [0.5.0](https://github.com/ckeditor/ckeditor5-clipboard/compare/v0.4.1...v0.5.0) (2017-04-05)

### Other changes

* Aligned use of the `DataController` to the latest API. Closes [#14](https://github.com/ckeditor/ckeditor5-clipboard/issues/14). ([8f98e2b](https://github.com/ckeditor/ckeditor5-clipboard/commit/8f98e2b))

### Features

* Named existing plugin(s). ([3d37f53](https://github.com/ckeditor/ckeditor5-clipboard/commit/3d37f53))


## [0.4.1](https://github.com/ckeditor/ckeditor5-clipboard/compare/v0.4.0...v0.4.1) (2017-03-06)

Internal changes only (updated dependencies, documentation, etc.).
