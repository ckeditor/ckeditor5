Changelog
=========

## [19.0.0](https://github.com/ckeditor/ckeditor5-table/compare/v18.0.0...v19.0.0) (2020-04-28)

### Features

* Added a "Select entire column/row" option to the table column and row dropdowns. Closes [ckeditor/ckeditor5#6500](https://github.com/ckeditor/ckeditor5/issues/6500). ([729cc00](https://github.com/ckeditor/ckeditor5-table/commit/729cc00))
* Implemented a button that merges the table cells directly from the table toolbar. Closes [ckeditor/ckeditor5#6486](https://github.com/ckeditor/ckeditor5/issues/6486). ([4fd49a9](https://github.com/ckeditor/ckeditor5-table/commit/4fd49a9))
* Introduced a custom keyboard navigation for tables. Closes [ckeditor/ckeditor5#3267](https://github.com/ckeditor/ckeditor5/issues/3267). Closes [ckeditor/ckeditor5#3286](https://github.com/ckeditor/ckeditor5/issues/3286). ([d480c6d](https://github.com/ckeditor/ckeditor5-table/commit/d480c6d))
* Introduced the `MergeCellsCommand`. Closes [ckeditor/ckeditor5#6123](https://github.com/ckeditor/ckeditor5/issues/6123). ([a5a7d3e](https://github.com/ckeditor/ckeditor5-table/commit/a5a7d3e))
* Introduced the `TableUtils.removeRows()` method. Closes [ckeditor/ckeditor5#6545](https://github.com/ckeditor/ckeditor5/issues/6545). ([c6770ba](https://github.com/ckeditor/ckeditor5-table/commit/c6770ba))
* Introduced the `TableUtils.removeColumns()` method. Closes [ckeditor/ckeditor5#6546](https://github.com/ckeditor/ckeditor5/issues/6546). Closes [ckeditor/ckeditor5#6439](https://github.com/ckeditor/ckeditor5/issues/6439). ([396c6e9](https://github.com/ckeditor/ckeditor5-table/commit/396c6e9))

### Bug fixes

* The `TableSelection` plugin should collapse a multi-cell selection when it gets disabled. Closes [ckeditor/ckeditor5#6430](https://github.com/ckeditor/ckeditor5/issues/6430). ([ba852e3](https://github.com/ckeditor/ckeditor5-table/commit/ba852e3))
* Added missing tooltips for the table and table cell properties buttons. Closes [ckeditor/ckeditor5#6497](https://github.com/ckeditor/ckeditor5/issues/6497). ([a031c9b](https://github.com/ckeditor/ckeditor5-table/commit/a031c9b))
* Improved spanned cells handling for row and column removals. Closes [ckeditor/ckeditor5#6406](https://github.com/ckeditor/ckeditor5/issues/6406). ([725a861](https://github.com/ckeditor/ckeditor5-table/commit/725a861))
* Inserting a table column at the first column or row spanned cell should work properly. Closes [ckeditor/ckeditor5#5882](https://github.com/ckeditor/ckeditor5/issues/5882). ([d239f69](https://github.com/ckeditor/ckeditor5-table/commit/d239f69))
* The remove table row command no longer breaks a table heading downcast conversion. Closes [ckeditor/ckeditor5#6391](https://github.com/ckeditor/ckeditor5/issues/6391). ([afdbc2d](https://github.com/ckeditor/ckeditor5-table/commit/afdbc2d))
* Removing rows in complex tables should properly move cells from the removed rows. Closes [ckeditor/ckeditor5#6502](https://github.com/ckeditor/ckeditor5/issues/6502). ([c8d8d32](https://github.com/ckeditor/ckeditor5-table/commit/c8d8d32))
* Removing the last header row no longer breaks a table in the editing view. Closes [ckeditor/ckeditor5#6437](https://github.com/ckeditor/ckeditor5/issues/6437). ([5e1fd28](https://github.com/ckeditor/ckeditor5-table/commit/5e1fd28))
* Resolved various issues with handling bigger tables, caused by issues with sorting indexes. Closes [ckeditor/ckeditor5#6569](https://github.com/ckeditor/ckeditor5/issues/6569). Closes [ckeditor/ckeditor5#6544](https://github.com/ckeditor/ckeditor5/issues/6544). ([99242fb](https://github.com/ckeditor/ckeditor5-table/commit/99242fb))
* The table border should be present in the content styles (should use `.ck-content`). Closes [ckeditor/ckeditor5#6314](https://github.com/ckeditor/ckeditor5/issues/6314). ([0e0e6fe](https://github.com/ckeditor/ckeditor5-table/commit/0e0e6fe))
* Table feature should specify the header text alignment styles for different language directions in the content styles sheet. Closes [ckeditor/ckeditor5#6638](https://github.com/ckeditor/ckeditor5/issues/6638). ([0e25d38](https://github.com/ckeditor/ckeditor5-table/commit/0e25d38))

  Until now, the text alignment was inherited from `EditorUI` styles but they are unavailable outside the editor when the content lives in a `.ck-content` container.
* The horizontal alignment of the table cell content should work properly with right–to–left languages. Closes [ckeditor/ckeditor5#6371](https://github.com/ckeditor/ckeditor5/issues/6371). ([b6ca42e](https://github.com/ckeditor/ckeditor5-table/commit/b6ca42e))

### Other changes

* Replaced `LabeledInputView` with `LabeledFieldView`. See [ckeditor/ckeditor5#6110](https://github.com/ckeditor/ckeditor5/issues/6110). ([b905aa5](https://github.com/ckeditor/ckeditor5-table/commit/b905aa5))
* Replaced custom `FormHeaderView` with the new reusable `FormHeaderView` UI. See [ckeditor/ckeditor5#6109](https://github.com/ckeditor/ckeditor5/issues/6109). ([f5b2faf](https://github.com/ckeditor/ckeditor5-table/commit/f5b2faf))
* Reduced the table insertion grid rendering time. Closes [ckeditor/ckeditor5#6341](https://github.com/ckeditor/ckeditor5/issues/6341). ([fd1d5da](https://github.com/ckeditor/ckeditor5-table/commit/fd1d5da))
* Removed temporary fixes for `model-selection-range-intersects` errors. See [ckeditor/ckeditor5#6501](https://github.com/ckeditor/ckeditor5/issues/6501). See [ckeditor/ckeditor5#6382](https://github.com/ckeditor/ckeditor5/issues/6382). ([01d23cb](https://github.com/ckeditor/ckeditor5-table/commit/01d23cb))
* The position of table cell properties balloon should be in relation to multiple selected cells. Closes [ckeditor/ckeditor5#6357](https://github.com/ckeditor/ckeditor5/issues/6357). ([e2dff56](https://github.com/ckeditor/ckeditor5-table/commit/e2dff56))
* Updated translations. ([1e691d9](https://github.com/ckeditor/ckeditor5-table/commit/1e691d9)) ([5e98a03](https://github.com/ckeditor/ckeditor5-table/commit/5e98a03))


## [18.0.0](https://github.com/ckeditor/ckeditor5-table/compare/v17.0.0...v18.0.0) (2020-03-19)

### Features

* Introduced the `TableSelection` plugin. Closes [ckeditor/ckeditor5#3202](https://github.com/ckeditor/ckeditor5/issues/3202). ([281dba5](https://github.com/ckeditor/ckeditor5-table/commit/281dba5))
* Introduced RTL support to the table and table cell property forms. Closes [ckeditor/ckeditor5#6107](https://github.com/ckeditor/ckeditor5/issues/6107). ([3a92fc4](https://github.com/ckeditor/ckeditor5-table/commit/3a92fc4))

### Bug fixes

* Merge left and right commands should be always enabled if the execution does not cross the heading column boundary. Closes [ckeditor/ckeditor5#6368](https://github.com/ckeditor/ckeditor5/issues/6368). ([c088814](https://github.com/ckeditor/ckeditor5-table/commit/c088814))
* Table border styles conversion handler should not throw when it approaches a nested table. Closes [ckeditor/ckeditor5#6177](https://github.com/ckeditor/ckeditor5/issues/6177). ([a754898](https://github.com/ckeditor/ckeditor5-table/commit/a754898))

### Other changes

* The default background color for the table headers should blend with the background of the entire table instead of overriding it. Closes [ckeditor/ckeditor5#6228](https://github.com/ckeditor/ckeditor5/issues/6228). ([b53032d](https://github.com/ckeditor/ckeditor5-table/commit/b53032d))
* Updated translations. ([70b8af5](https://github.com/ckeditor/ckeditor5-table/commit/70b8af5))


## [17.0.0](https://github.com/ckeditor/ckeditor5-table/compare/v16.0.0...v17.0.0) (2020-02-19)

### Features

* Implemented the table and table cell properties forms. Closes [ckeditor/ckeditor5#3287](https://github.com/ckeditor/ckeditor5/issues/3287).

### Bug fixes

* Fixed a bug with spellchecking or pasting via the context menu into a table cell crashing the editor. Closes [ckeditor/ckeditor5#6062](https://github.com/ckeditor/ckeditor5/issues/6062). ([be0d759](https://github.com/ckeditor/ckeditor5-table/commit/be0d759))

### Other changes

* Implemented lazy loading for the table dropdown. This will reduce editor initialization time. Closes [ckeditor/ckeditor5#6193](https://github.com/ckeditor/ckeditor5/issues/6193). ([5daa487](https://github.com/ckeditor/ckeditor5-table/commit/5daa487))


## [16.0.0](https://github.com/ckeditor/ckeditor5-table/compare/v15.0.0...v16.0.0) (2019-12-04)

### Bug fixes

* The `MergeCellCommand` will not merge column header cells with body cells. ([c9c6954](https://github.com/ckeditor/ckeditor5-table/commit/c9c6954))

### Other changes

* Updated translations. ([7b2df5c](https://github.com/ckeditor/ckeditor5-table/commit/7b2df5c))


## [15.0.0](https://github.com/ckeditor/ckeditor5-table/compare/v14.0.0...v15.0.0) (2019-10-23)

### Bug fixes

* Column insertion and cell merging buttons should work correctly when the editor content is right–to–left (RTL). Closes [#200](https://github.com/ckeditor/ckeditor5-table/issues/200). ([ac7be7b](https://github.com/ckeditor/ckeditor5-table/commit/ac7be7b))

### Other changes

* Added `pluginName` to editing plugin. ([1f76c1e](https://github.com/ckeditor/ckeditor5-table/commit/1f76c1e))
* Updated translations. ([ba00c09](https://github.com/ckeditor/ckeditor5-table/commit/ba00c09)) ([b1ff792](https://github.com/ckeditor/ckeditor5-table/commit/b1ff792))


## [14.0.0](https://github.com/ckeditor/ckeditor5-table/compare/v13.0.2...v14.0.0) (2019-08-26)

### Features

* `TableWalker` will now return `cell` value also for spanned cells when traversing a table with `includeSpanned` option set to `true`. Additionally, `isSpanned` property was introduced in returned values. ([07e8736](https://github.com/ckeditor/ckeditor5-table/commit/07e8736))

### Bug fixes

* Table cell post-fixer will refresh a cell only when it is needed. Closes [#209](https://github.com/ckeditor/ckeditor5-table/issues/209). ([b29a042](https://github.com/ckeditor/ckeditor5-table/commit/b29a042))

### Other changes

* Adjusted `InsertTableView` for better compatibility with right–to–left (RTL) languages. See [ckeditor/ckeditor5#1151](https://github.com/ckeditor/ckeditor5/issues/1151). ([524586b](https://github.com/ckeditor/ckeditor5-table/commit/524586b))
* The issue tracker for this package was moved to https://github.com/ckeditor/ckeditor5/issues. See [ckeditor/ckeditor5#1988](https://github.com/ckeditor/ckeditor5/issues/1988). ([3d35af2](https://github.com/ckeditor/ckeditor5-table/commit/3d35af2))
* The table widget toolbar should have a proper `aria-label` attribute (see [ckeditor/ckeditor5#1404](https://github.com/ckeditor/ckeditor5/issues/1404)). ([b47a94f](https://github.com/ckeditor/ckeditor5-table/commit/b47a94f))
* Updated translations. ([2ddc9f4](https://github.com/ckeditor/ckeditor5-table/commit/2ddc9f4))

### BREAKING CHANGES

* `TableWalker` will not return `undefined` as `cell` value for spanned cells anymore. Use `isSpanned` instead.


## [13.0.2](https://github.com/ckeditor/ckeditor5-table/compare/v13.0.1...v13.0.2) (2019-07-10)

Internal changes only (updated dependencies, documentation, etc.).


## [13.0.1](https://github.com/ckeditor/ckeditor5-table/compare/v13.0.0...v13.0.1) (2019-07-04)

Internal changes only (updated dependencies, documentation, etc.).


## [13.0.0](https://github.com/ckeditor/ckeditor5-table/compare/v12.0.1...v13.0.0) (2019-06-05)

### Bug fixes

* Table cell view post-fixer should not fix valid view selection. Closes [ckeditor/ckeditor5#1554](https://github.com/ckeditor/ckeditor5/issues/1554). ([fa46cdc](https://github.com/ckeditor/ckeditor5-table/commit/fa46cdc))
* Table cell view post-fixer will not crash if an element inside a cell got attribute and was removed at the same time. Closes [#191](https://github.com/ckeditor/ckeditor5-table/issues/191). ([900c178](https://github.com/ckeditor/ckeditor5-table/commit/900c178))
* Table rows will not be added on tab key press if the associated command is disabled. Closes [#185](https://github.com/ckeditor/ckeditor5-table/issues/185). ([00848a8](https://github.com/ckeditor/ckeditor5-table/commit/00848a8))

### Other changes

* Removed deprecated `config.table.toolbar` configuration option. Closes [#167](https://github.com/ckeditor/ckeditor5-table/issues/167). ([5d024ce](https://github.com/ckeditor/ckeditor5-table/commit/5d024ce))
* Updated translations. ([60ccc61](https://github.com/ckeditor/ckeditor5-table/commit/60ccc61))

### BREAKING CHANGES

* `config.table.toolbar` is now removed from code. Use `config.table.contentToolbar` instead.


## [12.0.1](https://github.com/ckeditor/ckeditor5-table/compare/v12.0.0...v12.0.1) (2019-04-10)

### Bug fixes

* Single paragraphs with attributes inside `<tableCell>` will be properly converted in the data pipeline. Closes [ckeditor/ckeditor5#1620](https://github.com/ckeditor/ckeditor5/issues/1620). ([67ec89f](https://github.com/ckeditor/ckeditor5-table/commit/67ec89f))

### Other changes

* Optimized icons. ([c042369](https://github.com/ckeditor/ckeditor5-table/commit/c042369))
* Updated translations. ([cd204c3](https://github.com/ckeditor/ckeditor5-table/commit/cd204c3))


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
