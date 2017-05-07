Changelog
=========

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
