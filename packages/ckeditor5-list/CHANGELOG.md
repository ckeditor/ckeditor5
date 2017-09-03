Changelog
=========

## [0.7.0](https://github.com/ckeditor/ckeditor5-list/compare/v0.6.1...v0.7.0) (2017-09-03)

### Bug fixes

* `ListCommand` should check whether it can be applied to the selection. Closes [#62](https://github.com/ckeditor/ckeditor5-list/issues/62). ([12b77ae](https://github.com/ckeditor/ckeditor5-list/commit/12b77ae))
* `view.UIElement` will no longer be incorrectly removed instead of `<li>` element if it was before `<li>` element to remove. Closes [#74](https://github.com/ckeditor/ckeditor5-list/issues/74). ([aa7855c](https://github.com/ckeditor/ckeditor5-list/commit/aa7855c))
* Fixed a bug when editor sometimes crashed when list item was moved outside and before a container in which it was. Closes [#78](https://github.com/ckeditor/ckeditor5-list/issues/78). ([3d8814e](https://github.com/ckeditor/ckeditor5-list/commit/3d8814e))
* List model fixer will not be triggered if a change-to-fix is in a `transparent` batch. ([0779f35](https://github.com/ckeditor/ckeditor5-list/commit/0779f35))
* `<ul>` and `<ol>` view elements will now be inserted after view UI elements. Closes [#71](https://github.com/ckeditor/ckeditor5-list/issues/71). ([0e85b2f](https://github.com/ckeditor/ckeditor5-list/commit/0e85b2f))
* The `ListEngine` plugin will not crash editor when using `DataController#insertContent()` with model items (it worked with data fragments only). Closes [#69](https://github.com/ckeditor/ckeditor5-list/issues/69). ([e0216a8](https://github.com/ckeditor/ckeditor5-list/commit/e0216a8))

### Features

* List feature should use `EditingKeystrokeHandler` instead of direct event listeners. Closes [#76](https://github.com/ckeditor/ckeditor5-list/issues/76). ([aaf362c](https://github.com/ckeditor/ckeditor5-list/commit/aaf362c))

### Other changes

* Aligned the implementation to the new Command API (see https://github.com/ckeditor/ckeditor5-core/issues/88). ([9a7d596](https://github.com/ckeditor/ckeditor5-list/commit/9a7d596))
* Cleaning up svg icons. ([2d423db](https://github.com/ckeditor/ckeditor5-list/commit/2d423db))

### BREAKING CHANGES

* The command API has been changed.


## [0.6.1](https://github.com/ckeditor/ckeditor5-list/compare/v0.6.0...v0.6.1) (2017-05-07)

### Bug fixes

* List's view-to-model converter now returns `model.DocumentFragment` containing `listItem` model elements, instead of an array. Closes [#60](https://github.com/ckeditor/ckeditor5/issues/60). ([331242d](https://github.com/ckeditor/ckeditor5-list/commit/331242d))
* Pasted list items' indentation will now be correctly adjusted if they are pasted into a nested list. Closes [#56](https://github.com/ckeditor/ckeditor5-list/issues/56). ([e91c3d1](https://github.com/ckeditor/ckeditor5-list/commit/e91c3d1))

### Other changes

* Updated translations. ([bd83eed](https://github.com/ckeditor/ckeditor5-list/commit/bd83eed))


## [0.6.0](https://github.com/ckeditor/ckeditor5-list/compare/v0.5.1...v0.6.0) (2017-04-05)

### Features

* Added support for nested lists. ([237b06e](https://github.com/ckeditor/ckeditor5-list/commit/237b06e)), closes [#8](https://github.com/ckeditor/ckeditor5-list/issues/8) [#9](https://github.com/ckeditor/ckeditor5-list/issues/9) [#30](https://github.com/ckeditor/ckeditor5-list/issues/30) [#36](https://github.com/ckeditor/ckeditor5-list/issues/36) [#37](https://github.com/ckeditor/ckeditor5-list/issues/37) [#38](https://github.com/ckeditor/ckeditor5-list/issues/38) [#39](https://github.com/ckeditor/ckeditor5-list/issues/39) [#40](https://github.com/ckeditor/ckeditor5-list/issues/40) [#41](https://github.com/ckeditor/ckeditor5-list/issues/41) [#44](https://github.com/ckeditor/ckeditor5-list/issues/44) [#45](https://github.com/ckeditor/ckeditor5-list/issues/45).
* Named existing plugin(s). ([09e5c27](https://github.com/ckeditor/ckeditor5-list/commit/09e5c27))

### Other changes

* Updated translations. ([cabcd67](https://github.com/ckeditor/ckeditor5-list/commit/cabcd67))


## [0.5.1](https://github.com/ckeditor/ckeditor5-list/compare/v0.5.0...v0.5.1) (2017-03-06)

### Other changes

* Made the list feature use the `model.Selection#getSelectedBlocks()` instead of implementing the same logic itself. Closes [#32](https://github.com/ckeditor/ckeditor5/issues/32). Closes [#31](https://github.com/ckeditor/ckeditor5/issues/31). ([d04eab5](https://github.com/ckeditor/ckeditor5-list/commit/d04eab5))
* Stop using `ModelConversionDispatcher#event:move` for list conversion. ([04e9e56](https://github.com/ckeditor/ckeditor5-list/commit/04e9e56))
* Updated translations. ([8b92825](https://github.com/ckeditor/ckeditor5-list/commit/8b92825))
