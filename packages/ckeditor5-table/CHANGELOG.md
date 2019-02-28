Changelog
=========

## [12.0.0](https://github.com/ckeditor/ckeditor5-table/compare/v11.0.1...v12.0.0) (2019-02-28)

### Features

* Enabled media embeds in table cells. Closes [#161](https://github.com/ckeditor/ckeditor5-table/issues/161). ([9ace3ba](https://github.com/ckeditor/ckeditor5-table/commit/9ace3ba))
* Enabled images in table cells. Closes [#99](https://github.com/ckeditor/ckeditor5-table/issues/99). ([39c09e6](https://github.com/ckeditor/ckeditor5-table/commit/39c09e6))

### Bug fixes

* Autoparagraph text nodes in table cells. Closes [#134](https://github.com/ckeditor/ckeditor5-table/issues/134). ([5863307](https://github.com/ckeditor/ckeditor5-table/commit/5863307))
* Make `<table>` a block element in the schema. Closes [#126](https://github.com/ckeditor/ckeditor5-table/issues/126). ([85719af](https://github.com/ckeditor/ckeditor5-table/commit/85719af))

### Other changes

* Aligned to the new `WidgetToolbarRepository` API. Replaced the `isTableWidgetSelected()` utility with `getSelectedTableWidget()`. Replaced `isTableContentSelected()` with `getTableWidgetAncestor()` (see [ckeditor/ckeditor5-widget#60](https://github.com/ckeditor/ckeditor5-widget/issues/60)). ([e3a5c09](https://github.com/ckeditor/ckeditor5-table/commit/e3a5c09))
* Use `TableUtils` by a string when using `editor.plugins.get()`. ([ce09c39](https://github.com/ckeditor/ckeditor5-table/commit/ce09c39))
* Updated translations. ([370d494](https://github.com/ckeditor/ckeditor5-table/commit/370d494)) ([5a47b95](https://github.com/ckeditor/ckeditor5-table/commit/5a47b95)) ([5e20d54](https://github.com/ckeditor/ckeditor5-table/commit/5e20d54))

### BREAKING CHANGES

* Upgraded minimal versions of Node to `8.0.0` and npm to `5.7.1`. See: [ckeditor/ckeditor5#1507](https://github.com/ckeditor/ckeditor5/issues/1507). ([612ea3c](https://github.com/ckeditor/ckeditor5-cloud-services/commit/612ea3c))
* The `isTableWidgetSelected()` utility has been replaced by `getSelectedTableWidget()` and returns an editing `View` element instead of a `Boolean`.
* The `isTableContentSelected()` utility has been replaced by `getTableWidgetAncestor()` and returns an editing `View` element instead of a `Boolean`.


## [11.0.1](https://github.com/ckeditor/ckeditor5-table/compare/v11.0.0...v11.0.1) (2018-12-05)

### Bug fixes

* Skip text nodes between `<tr>` elements during table upcast. Closes [#145](https://github.com/ckeditor/ckeditor5-table/issues/145). ([2ecf448](https://github.com/ckeditor/ckeditor5-table/commit/2ecf448))

### Other changes

* Changed labels and command names for the insert column functionality for better UX and translatability. Closes [#138](https://github.com/ckeditor/ckeditor5-table/issues/138). ([fd2221f](https://github.com/ckeditor/ckeditor5-table/commit/fd2221f))
* Improved SVG icons size. See [ckeditor/ckeditor5-theme-lark#206](https://github.com/ckeditor/ckeditor5-theme-lark/issues/206). ([23d6803](https://github.com/ckeditor/ckeditor5-table/commit/23d6803))
* Updated translations. ([47475b2](https://github.com/ckeditor/ckeditor5-table/commit/47475b2)) ([5d39d35](https://github.com/ckeditor/ckeditor5-table/commit/5d39d35)) ([7ce6d5b](https://github.com/ckeditor/ckeditor5-table/commit/7ce6d5b)) ([268f607](https://github.com/ckeditor/ckeditor5-table/commit/268f607))


## [11.0.0](https://github.com/ckeditor/ckeditor5-table/compare/v10.1.0...v11.0.0) (2018-10-08)

### Features

* Implemented the table post–fixer which bulletproofs the feature in various complex use–cases (e.g. pasting and real-time collaborative editing). Closes [#13](https://github.com/ckeditor/ckeditor5-table/issues/13). ([01f9a3b](https://github.com/ckeditor/ckeditor5-table/commit/01f9a3b))
* Introduced the toolbar for the table widget (previously it was available only for single cells). Changed the toolbar configuration option from `table.toolbar` to `table.contentToolbar`. Closes [#113](https://github.com/ckeditor/ckeditor5-table/issues/113). Closes [#106](https://github.com/ckeditor/ckeditor5-table/issues/106). ([9f9486d](https://github.com/ckeditor/ckeditor5-table/commit/9f9486d))

  Other: `config.table.toolbar` is marked as depracted. Use `config.table.contentToolbar` instead.
* Introduced a support for block content inside tables. Closes [#56](https://github.com/ckeditor/ckeditor5-table/issues/56). ([cdf718e](https://github.com/ckeditor/ckeditor5-table/commit/cdf718e))

### Bug fixes

* A table cell should always have a `<paragraph>` in the model. Closes [#125](https://github.com/ckeditor/ckeditor5-table/issues/125). ([1eb5d6d](https://github.com/ckeditor/ckeditor5-table/commit/1eb5d6d))
* Downcast converter for table attributes should work with not converted child elements. Closes [#92](https://github.com/ckeditor/ckeditor5-table/issues/92). ([a3ea18d](https://github.com/ckeditor/ckeditor5-table/commit/a3ea18d))
* Merging down rowspanned cell from the head with a cell in the body is now disabled. Closes [#86](https://github.com/ckeditor/ckeditor5-table/issues/86). ([cb77e38](https://github.com/ckeditor/ckeditor5-table/commit/cb77e38))
* The upcast conversion will now properly parse inline content in table cell into single paragraph. Closes [ckeditor/ckeditor5#1246](https://github.com/ckeditor/ckeditor5/issues/1246). ([ea1e16d](https://github.com/ckeditor/ckeditor5-table/commit/ea1e16d))
* Toggling headers should always include the column or row the selection is anchored to. Closes [#34](https://github.com/ckeditor/ckeditor5-table/issues/34). ([bce6766](https://github.com/ckeditor/ckeditor5-table/commit/bce6766))

### Other changes

* Aligned `TableToolbar` to the widget toolbar repository. Closes [#107](https://github.com/ckeditor/ckeditor5-table/issues/107). ([e276e66](https://github.com/ckeditor/ckeditor5-table/commit/e276e66))
* Media should not be allowed inside table cells for now. Closes [#124](https://github.com/ckeditor/ckeditor5-table/issues/124). ([2f2fe4a](https://github.com/ckeditor/ckeditor5-table/commit/2f2fe4a))
* Table feature should insert table the same way as other widget features do. Closes [#27](https://github.com/ckeditor/ckeditor5-table/issues/27). ([77d96a4](https://github.com/ckeditor/ckeditor5-table/commit/77d96a4))
* The table cell view post-fixer should use changed elements from the view to make fixes. Closes [#130](https://github.com/ckeditor/ckeditor5-table/issues/130). ([efc53c9](https://github.com/ckeditor/ckeditor5-table/commit/efc53c9))
* Updated the table icon which used to feel bulky with a lighter design. Closes [#117](https://github.com/ckeditor/ckeditor5-table/issues/117). ([cd6f5ff](https://github.com/ckeditor/ckeditor5-table/commit/cd6f5ff))
* Updated translations. ([de47767](https://github.com/ckeditor/ckeditor5-table/commit/de47767))

### BREAKING CHANGES

* The `config.table.toolbar` was renamed to `config.table.contentToolbar`.
* The `injectTablePostFixer()` function from  `table/converters/table-post-fixer` is now `injectTableLayoutPostFixer()`and is moved to `table/converters/table-layout-post-fixer` module.
* The `TableUtils#createTable()` method now accepts model `Writer` instance instead of `Position`. The method no longer inserts created table to the model - use returned value instead.
* Removed `table/commands/utils~getParentTable()` method. Use `table/commands/utils~findAncestor()` instead.


## [10.1.0](https://github.com/ckeditor/ckeditor5-table/compare/v10.0.0...v10.1.0) (2018-07-18)

### Features

* Implemented the table selection handle (see [ckeditor/ckeditor5-widget#40](https://github.com/ckeditor/ckeditor5-widget/issues/40)). ([47295bd](https://github.com/ckeditor/ckeditor5-table/commit/47295bd))
* Used the switch button to toggle table headers (see [ckeditor/ckeditor5-ui#402](https://github.com/ckeditor/ckeditor5-ui/issues/402)). ([f3b7d0b](https://github.com/ckeditor/ckeditor5-table/commit/f3b7d0b))

  Also:
  * Aligned the `TableUI` to the new API of the `addListToDropdown()` helper,
  * Updated the tests to consider the `ListItemView` as simply a container for buttons.

### Bug fixes

* Merge cell horizontally should not be possible on overlapped cells. Closes [#68](https://github.com/ckeditor/ckeditor5-table/issues/68). ([72b6315](https://github.com/ckeditor/ckeditor5-table/commit/72b6315))
* The `MergeCellCommand` should check if merging cells results in an empty row and remove it. Closes [#16](https://github.com/ckeditor/ckeditor5-table/issues/16). ([a01252a](https://github.com/ckeditor/ckeditor5-table/commit/a01252a))

### Other changes

* Updated translations. ([1730b88](https://github.com/ckeditor/ckeditor5-table/commit/1730b88))


## 10.0.0 (2018-06-21)

### Features

* Introduced the table feature. See [#1](https://github.com/ckeditor/ckeditor5-table/issues/1) and [#3](https://github.com/ckeditor/ckeditor5-table/issues/3).
