Changelog
=========

## 0.1.0 (2018-06-21)

### Features

* Added separators to the table UI drop-downs. Closes [#24](https://github.com/ckeditor/ckeditor5-table/issues/24). ([db1cd82](https://github.com/ckeditor/ckeditor5-table/commit/db1cd82))
* Implemented the basic user interface of the feature (see [#1](https://github.com/ckeditor/ckeditor5-table/issues/1)). ([b8b9799](https://github.com/ckeditor/ckeditor5-table/commit/b8b9799))
* Initial table support. Closes [#4](https://github.com/ckeditor/ckeditor5-table/issues/4). Closes [#7](https://github.com/ckeditor/ckeditor5-table/issues/7). Closes [#9](https://github.com/ckeditor/ckeditor5-table/issues/9). ([bfe335b](https://github.com/ckeditor/ckeditor5-table/commit/bfe335b))
* The MVP of table content styles. Moved styles related to the editing to ckeditor5-theme-lark (see [#2](https://github.com/ckeditor/ckeditor5-table/issues/2)). ([d4dc54d](https://github.com/ckeditor/ckeditor5-table/commit/d4dc54d))

### Bug fixes

* Creating a new table should not fail when the toolbar is sticky (integration with `ClassicEditor`). Closes [#37](https://github.com/ckeditor/ckeditor5-table/issues/37). ([3c147da](https://github.com/ckeditor/ckeditor5-table/commit/3c147da))
* Dropdown button labels must be translatable too. ([b7e14e4](https://github.com/ckeditor/ckeditor5-table/commit/b7e14e4))
* Navigating into the table insertion panel using the keyboard should not throw an error. Closes [#30](https://github.com/ckeditor/ckeditor5-table/issues/30). ([713ac46](https://github.com/ckeditor/ckeditor5-table/commit/713ac46))
* Selected table's outline should be visible when the table is not being hovered. Closes [#50](https://github.com/ckeditor/ckeditor5-table/issues/50). ([a50c89d](https://github.com/ckeditor/ckeditor5-table/commit/a50c89d))
* Selection should be in the first cell of an inserted table. Closes [#61](https://github.com/ckeditor/ckeditor5-table/issues/61). ([901e843](https://github.com/ckeditor/ckeditor5-table/commit/901e843))
* The `BalloonToolbar` should be enabled for a table content. Link editing should be possible in the table. Closes [#28](https://github.com/ckeditor/ckeditor5-table/issues/28). ([037df98](https://github.com/ckeditor/ckeditor5-table/commit/037df98))
* The `SetHeaderRowCommand` should not break the layout when making the first row of the table a header. Closes [#35](https://github.com/ckeditor/ckeditor5-table/issues/35). ([e0855b7](https://github.com/ckeditor/ckeditor5-table/commit/e0855b7))
* The feature should use `<figure>` as a wrapper in the output data. Closes [#51](https://github.com/ckeditor/ckeditor5-table/issues/51). ([b6dc373](https://github.com/ckeditor/ckeditor5-table/commit/b6dc373))
* The table layout should not break when merging a cell with another cell above. Closes [#43](https://github.com/ckeditor/ckeditor5-table/issues/43). ([83a2609](https://github.com/ckeditor/ckeditor5-table/commit/83a2609))
* The table toolbar should not be displayed when the selection contains an entire table. Closes [#36](https://github.com/ckeditor/ckeditor5-table/issues/36). ([8128f9e](https://github.com/ckeditor/ckeditor5-table/commit/8128f9e))

### Other changes

* Reviewed command and UI component names. Closes [#58](https://github.com/ckeditor/ckeditor5-table/issues/58). ([9e36696](https://github.com/ckeditor/ckeditor5-table/commit/9e36696))
* Updated translations. ([be80125](https://github.com/ckeditor/ckeditor5-table/commit/be80125))
* Updated translations. ([21e3da0](https://github.com/ckeditor/ckeditor5-table/commit/21e3da0))
