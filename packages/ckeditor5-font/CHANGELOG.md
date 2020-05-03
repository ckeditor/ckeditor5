Changelog
=========

## [19.0.0](https://github.com/ckeditor/ckeditor5-font/compare/v18.0.0...v19.0.0) (2020-04-29)

### Features

* Introduced the `supportAllValues` configuration for both `FontSize` and `FontFamily` plugins that allow preserving any `font-family` and `font-size` values when pasting or loading content. Closes [ckeditor/ckeditor5#6165](https://github.com/ckeditor/ckeditor5/issues/6165). Closes [ckeditor/ckeditor5#2278](https://github.com/ckeditor/ckeditor5/issues/2278). ([b22efec](https://github.com/ckeditor/ckeditor5-font/commit/b22efec))

### Bug fixes

* Font size styles should be prefixed by the `.ck-content` class. Closes [ckeditor/ckeditor5#6636](https://github.com/ckeditor/ckeditor5/issues/6636). ([b0b06db](https://github.com/ckeditor/ckeditor5-font/commit/b0b06db))


## [18.0.0](https://github.com/ckeditor/ckeditor5-font/compare/v17.0.0...v18.0.0) (2020-03-19)

### Other changes

* Updated translations. ([b0d7c53](https://github.com/ckeditor/ckeditor5-font/commit/b0d7c53))


## [17.0.0](https://github.com/ckeditor/ckeditor5-font/compare/v16.0.0...v17.0.0) (2020-02-19)

### MINOR BREAKING CHANGES

* `normalizeColorOptions()` and `getLocalizedColorOptions()` are no longer available in this package. You can import them from `@ckeditor/ckeditor5-ui/src/colorgrid/utils` instead.

### Other changes

* Implemented lazy loading for the font color and background color dropdowns. This will reduce editor initialization time. Closes [ckeditor/ckeditor5#6192](https://github.com/ckeditor/ckeditor5/issues/6192). ([165417c](https://github.com/ckeditor/ckeditor5-font/commit/165417c))
* Moved `normalizeColorOptions()` and `getLocalizedColorOptions()` to `ckeditor5-ui` (see ckeditor/ckeditor5/issues/6106). ([c3e7673](https://github.com/ckeditor/ckeditor5-font/commit/c3e7673))
* Updated translations. ([db84e7a](https://github.com/ckeditor/ckeditor5-font/commit/db84e7a))


## [16.0.0](https://github.com/ckeditor/ckeditor5-font/compare/v15.0.0...v16.0.0) (2019-12-04)

### Other changes

* Updated translations. ([5203e87](https://github.com/ckeditor/ckeditor5-font/commit/5203e87))


## [15.0.0](https://github.com/ckeditor/ckeditor5-font/compare/v11.2.2...v15.0.0) (2019-10-23)

### Other changes

* Added `pluginName` property. ([1e8c2c6](https://github.com/ckeditor/ckeditor5-font/commit/1e8c2c6))
* Updated translations. ([19fda83](https://github.com/ckeditor/ckeditor5-font/commit/19fda83)) ([8dd48c4](https://github.com/ckeditor/ckeditor5-font/commit/8dd48c4))


## [11.2.2](https://github.com/ckeditor/ckeditor5-font/compare/v11.2.1...v11.2.2) (2019-08-26)

### Other changes

* The issue tracker for this package was moved to https://github.com/ckeditor/ckeditor5/issues. See [ckeditor/ckeditor5#1988](https://github.com/ckeditor/ckeditor5/issues/1988). ([edf39d2](https://github.com/ckeditor/ckeditor5-font/commit/edf39d2))
* Mark fonts' attributes with 'copyOnEnter' property. ([552f742](https://github.com/ckeditor/ckeditor5-font/commit/552f742))
* The active color should be marked both in the document colors and all colors. Closes [#51](https://github.com/ckeditor/ckeditor5-font/issues/51). ([295f6d5](https://github.com/ckeditor/ckeditor5-font/commit/295f6d5))
* Updated translations. ([1691b00](https://github.com/ckeditor/ckeditor5-font/commit/1691b00))


## [11.2.1](https://github.com/ckeditor/ckeditor5-font/compare/v11.2.0...v11.2.1) (2019-07-10)

### Other changes

* Updated translations. ([7babe33](https://github.com/ckeditor/ckeditor5-font/commit/7babe33))


## [11.2.0](https://github.com/ckeditor/ckeditor5-font/compare/v11.1.1...v11.2.0) (2019-07-04)

### Features

* Introduced the "document colors" section in the color picker dropdowns. Closes [#28](https://github.com/ckeditor/ckeditor5-font/issues/28)

### Other changes

* Updated translations. ([1ec1436](https://github.com/ckeditor/ckeditor5-font/commit/1ec1436)) ([6c85212](https://github.com/ckeditor/ckeditor5-font/commit/6c85212))
* Updated view attribute elements priorities to ensure proper order in which attribute elements are applied. Closes [#35](https://github.com/ckeditor/ckeditor5-font/issues/35). ([54467b4](https://github.com/ckeditor/ckeditor5-font/commit/54467b4))


## [11.1.1](https://github.com/ckeditor/ckeditor5-font/compare/v11.1.0...v11.1.1) (2019-06-05)

### Other changes

* Updated translations. ([cca7b24](https://github.com/ckeditor/ckeditor5-font/commit/cca7b24))


## [11.1.0](https://github.com/ckeditor/ckeditor5-font/compare/v11.0.0...v11.1.0) (2019-04-10)

### Features

* Introduced font color and font background color features. Closes [ckeditor/ckeditor5#1457](https://github.com/ckeditor/ckeditor5/issues/1457). ([c456b2a](https://github.com/ckeditor/ckeditor5-font/commit/c456b2a))
* Marked font size and font family as a formatting attribute using the `AttributeProperties#isFormatting` property. Closes [ckeditor/ckeditor5#1664](https://github.com/ckeditor/ckeditor5/issues/1664). ([d9f0a51](https://github.com/ckeditor/ckeditor5-font/commit/d9f0a51))

### Other changes

* Optimized icons. ([47ca23f](https://github.com/ckeditor/ckeditor5-font/commit/47ca23f))
* Updated translations. ([6f3332f](https://github.com/ckeditor/ckeditor5-font/commit/6f3332f)) ([f756b70](https://github.com/ckeditor/ckeditor5-font/commit/f756b70))


## [11.0.0](https://github.com/ckeditor/ckeditor5-font/compare/v10.0.4...v11.0.0) (2019-02-28)

### Other changes

* Updated translations. ([1c5bf6d](https://github.com/ckeditor/ckeditor5-font/commit/1c5bf6d)) ([2aca096](https://github.com/ckeditor/ckeditor5-font/commit/2aca096)) ([394952f](https://github.com/ckeditor/ckeditor5-font/commit/394952f))

### BREAKING CHANGES

* Upgraded minimal versions of Node to `8.0.0` and npm to `5.7.1`. See: [ckeditor/ckeditor5#1507](https://github.com/ckeditor/ckeditor5/issues/1507). ([612ea3c](https://github.com/ckeditor/ckeditor5-cloud-services/commit/612ea3c))


## [10.0.4](https://github.com/ckeditor/ckeditor5-font/compare/v10.0.3...v10.0.4) (2018-12-05)

### Other changes

* Improved SVG icons size. See [ckeditor/ckeditor5-theme-lark#206](https://github.com/ckeditor/ckeditor5-theme-lark/issues/206). ([e253314](https://github.com/ckeditor/ckeditor5-font/commit/e253314))


## [10.0.3](https://github.com/ckeditor/ckeditor5-font/compare/v10.0.2...v10.0.3) (2018-10-08)

### Other changes

* Updated translations. ([92d00ee](https://github.com/ckeditor/ckeditor5-font/commit/92d00ee))


## [10.0.2](https://github.com/ckeditor/ckeditor5-font/compare/v10.0.1...v10.0.2) (2018-07-18)

### Other changes

* Updated translations. ([63122d1](https://github.com/ckeditor/ckeditor5-font/commit/63122d1))


## [10.0.1](https://github.com/ckeditor/ckeditor5-font/compare/v10.0.0...v10.0.1) (2018-06-21)

### Bug fixes

* Ensured that font size's and font family's markup is always "outside" markup of other typical inline features, especially those changing background color. Thanks to that, the entire area of styled text will be correctly colored. Closes [ckeditor/ckeditor5-highlight#17](https://github.com/ckeditor/ckeditor5-highlight/issues/17). ([3b8b6dc](https://github.com/ckeditor/ckeditor5-font/commit/3b8b6dc))

### Other changes

* Updated translations.


## [10.0.0](https://github.com/ckeditor/ckeditor5-font/compare/v1.0.0-beta.4...v10.0.0) (2018-04-25)

### Other changes

* Changed the license to GPL2+ only. See [ckeditor/ckeditor5#991](https://github.com/ckeditor/ckeditor5/issues/991). ([99a4f33](https://github.com/ckeditor/ckeditor5-font/commit/99a4f33))
* Updated translations. ([b36205c](https://github.com/ckeditor/ckeditor5-font/commit/b36205c))

### BREAKING CHANGES

* The license under which CKEditor 5 is released has been changed from a triple GPL, LGPL and MPL license to a GPL2+ only. See [ckeditor/ckeditor5#991](https://github.com/ckeditor/ckeditor5/issues/991) for more information.


## [1.0.0-beta.4](https://github.com/ckeditor/ckeditor5-font/compare/v1.0.0-beta.2...v1.0.0-beta.4) (2018-04-19)

### Other changes

* Updated translations. ([e750c16](https://github.com/ckeditor/ckeditor5-font/commit/e750c16))


## [1.0.0-beta.2](https://github.com/ckeditor/ckeditor5-font/compare/v1.0.0-beta.1...v1.0.0-beta.2) (2018-04-10)

### Other changes

* Aligned `ElementDefinition` usage to the changes in the engine. See [ckeditor/ckeditor5#742](https://github.com/ckeditor/ckeditor5/issues/742). ([5705b42](https://github.com/ckeditor/ckeditor5-font/commit/5705b42))

### BREAKING CHANGES

* In the custom format of the font size configuration the `view.style`, `view.class` and `view.attribute` properties are now called `view.styles`, `view.classes` and `view.attributes`.


## 1.0.0-beta.1 (2018-03-15)

### Features

* The initial font feature implementation. Closes [#2](https://github.com/ckeditor/ckeditor5-font/issues/2). Closes [#3](https://github.com/ckeditor/ckeditor5-font/issues/3). Closes [#4](https://github.com/ckeditor/ckeditor5-font/issues/4). ([a527fe7](https://github.com/ckeditor/ckeditor5-font/commit/a527fe7))
