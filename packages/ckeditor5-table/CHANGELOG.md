Changelog
=========

## [10.1.0](https://github.com/ckeditor/ckeditor5-table/compare/v10.0.0...v10.1.0) (2018-07-18)

### Features

* Implemented and enabled the table selection handler (see [ckeditor/ckeditor5-widget#40](https://github.com/ckeditor/ckeditor5-widget/issues/40)). ([47295bd](https://github.com/ckeditor/ckeditor5-table/commit/47295bd))
* Used the switch button to toggle table headers  (see [ckeditor/ckeditor5-ui#402](https://github.com/ckeditor/ckeditor5-ui/issues/402)). ([f3b7d0b](https://github.com/ckeditor/ckeditor5-table/commit/f3b7d0b))

  Also:
  * Aligned the `TableUI` to the new API of the `addListToDropdown` helper,
  * Updated the tests to consider the `ListItemView` as simply a container for buttons.

### Bug fixes

* Merge cell horizontally should not be possible on overlapped cells. Closes [#68](https://github.com/ckeditor/ckeditor5-table/issues/68). ([72b6315](https://github.com/ckeditor/ckeditor5-table/commit/72b6315))
* The `MergeCellCommand` should check if merging cells results in an empty row and remove it. Closes [#16](https://github.com/ckeditor/ckeditor5-table/issues/16). ([a01252a](https://github.com/ckeditor/ckeditor5-table/commit/a01252a))

### Other changes

* Updated translations. ([1730b88](https://github.com/ckeditor/ckeditor5-table/commit/1730b88))


## 10.0.0 (2018-06-21)

### Features

* Introduced the table feature. See [#1](https://github.com/ckeditor/ckeditor5-table/issues/1) and [#3](https://github.com/ckeditor/ckeditor5-table/issues/3).
