Changelog
=========

## [10.0.2](https://github.com/ckeditor/ckeditor5-heading/compare/v10.0.1...v10.0.2) (2018-07-18)

### Other changes

* Refreshed the heading icons (see [ckeditor/ckeditor5-ui#394](https://github.com/ckeditor/ckeditor5-ui/issues/394)). ([fb3f144](https://github.com/ckeditor/ckeditor5-heading/commit/fb3f144))
* Updated translations. ([0867c51](https://github.com/ckeditor/ckeditor5-heading/commit/0867c51))


## [10.0.1](https://github.com/ckeditor/ckeditor5-heading/compare/v10.0.0...v10.0.1) (2018-06-21)

### Other changes

* Updated translations.


## [10.0.0](https://github.com/ckeditor/ckeditor5-heading/compare/v1.0.0-beta.4...v10.0.0) (2018-04-25)

### Other changes

* Changed the license to GPL2+ only. See [ckeditor/ckeditor5#991](https://github.com/ckeditor/ckeditor5/issues/991). ([5e02366](https://github.com/ckeditor/ckeditor5-heading/commit/5e02366))
* Updated translations. ([d6a56d6](https://github.com/ckeditor/ckeditor5-heading/commit/d6a56d6))

### BREAKING CHANGES

* The license under which CKEditor 5 is released has been changed from a triple GPL, LGPL and MPL license to a GPL2+ only. See [ckeditor/ckeditor5#991](https://github.com/ckeditor/ckeditor5/issues/991) for more information.


## [1.0.0-beta.4](https://github.com/ckeditor/ckeditor5-heading/compare/v1.0.0-beta.2...v1.0.0-beta.4) (2018-04-19)

### Features

* Introduced `HeadingButtonsUI` plugin. Closes [#104](https://github.com/ckeditor/ckeditor5-heading/issues/104). ([a39bac2](https://github.com/ckeditor/ckeditor5-heading/commit/a39bac2))


## [1.0.0-beta.2](https://github.com/ckeditor/ckeditor5-heading/compare/v1.0.0-beta.1...v1.0.0-beta.2) (2018-04-10)

### Other changes

* Aligned `ElementDefinition` usage to the changes in the engine. See [ckeditor/ckeditor5#742](https://github.com/ckeditor/ckeditor5/issues/742). ([96d24f4](https://github.com/ckeditor/ckeditor5-heading/commit/96d24f4))
* Increased the specificity of CSS rules. Introduced the `.ck` class for editor UI components (see: [ckeditor/ckeditor5#494](https://github.com/ckeditor/ckeditor5/issues/494)). ([915ec69](https://github.com/ckeditor/ckeditor5-heading/commit/915ec69))

### BREAKING CHANGES

* In the custom format of the heading feature configuration the `view.style`, `view.class` and `view.attribute` properties are now called `view.styles`, `view.classes` and `view.attributes`.


## [1.0.0-beta.1](https://github.com/ckeditor/ckeditor5-heading/compare/v1.0.0-alpha.2...v1.0.0-beta.1) (2018-03-15)

### Other changes

* Aligned feature class naming to the new scheme. ([511a9d8](https://github.com/ckeditor/ckeditor5-heading/commit/511a9d8))
* Migrated package styles to PostCSS. Moved visual styles to `@ckeditor/ckeditor5-theme-lark` (see [ckeditor/ckeditor5-ui#144](https://github.com/ckeditor/ckeditor5-ui/issues/144)). ([965179e](https://github.com/ckeditor/ckeditor5-heading/commit/965179e))
* Updated naming of UI components & commands. ([72ee3d6](https://github.com/ckeditor/ckeditor5-heading/commit/72ee3d6))

### BREAKING CHANGES

* Renamed the `'headings'` dropdown UI component to `'heading'`.
* The `'heading1'`, `'heading2'` and `'heading3'` commands are no longer available. They were replaced by the `'heading'` command that accepts heading model element name as a value.
* The `HeadingCommand#value` is no longer a boolean only. Now it stores a name of the heading model element when selection is inside a heading.
* The `HeadingCommand` constructor's second parameter is now an array of supported model elements.


## [1.0.0-alpha.2](https://github.com/ckeditor/ckeditor5-heading/compare/v1.0.0-alpha.1...v1.0.0-alpha.2) (2017-11-14)

### Other changes

* Updated translations. ([c3ad925](https://github.com/ckeditor/ckeditor5-heading/commit/c3ad925))
* Aligned UI library usage to the [changes in the UI framework](https://github.com/ckeditor/ckeditor5-ui/pull/332).


## [1.0.0-alpha.1](https://github.com/ckeditor/ckeditor5-heading/compare/v0.10.0...v1.0.0-alpha.1) (2017-10-03)

Internal changes only (updated dependencies, documentation, etc.).


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

* Changed the default heading dropdown title to a more meaningful one. Closes [#68](https://github.com/ckeditor/ckeditor5-heading/issues/68). Closes [#62](https://github.com/ckeditor/ckeditor5-heading/issues/62). ([1c16e96](https://github.com/ckeditor/ckeditor5-heading/commit/1c16e96)) and ([e58dadc](https://github.com/ckeditor/ckeditor5-heading/commit/e58dadc))
* Dropdown should be inactive when none of the commands can be applied to the current selection. Closes [#66](https://github.com/ckeditor/ckeditor5-heading/issues/66). ([0ebd5cd](https://github.com/ckeditor/ckeditor5-heading/commit/0ebd5cd))

### Features

* Active heading is marked in the dropdown list. Closes [#26](https://github.com/ckeditor/ckeditor5-heading/issues/26). ([39ba14b](https://github.com/ckeditor/ckeditor5-heading/commit/39ba14b))
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
