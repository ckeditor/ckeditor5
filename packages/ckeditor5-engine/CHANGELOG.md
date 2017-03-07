Changelog
=========

## [0.8.0](https://github.com/ckeditor/ckeditor5-engine/compare/v0.7.0...v0.8.0) (2017-03-06)

### Bug fixes

* `view.Matcher#getElementName()` now returns proper value when named function is used as a pattern. Closes [#850](https://github.com/ckeditor/ckeditor5/issues/850). ([93f41c5](https://github.com/ckeditor/ckeditor5-engine/commit/93f41c5))
* Collapsed `model.Range` no longer sticks to its neighbour node when that node is moved. Closes [#852](https://github.com/ckeditor/ckeditor5/issues/852). ([ccd23d1](https://github.com/ckeditor/ckeditor5-engine/commit/ccd23d1))
* Default `remove()` converter no longer removes `view.UIElements` that are next to removed nodes. Closes [#854](https://github.com/ckeditor/ckeditor5/issues/854). ([c054ded](https://github.com/ckeditor/ckeditor5-engine/commit/c054ded))
* `dev-utils/model#setData()` should work with custom roots. Closes [#815](https://github.com/ckeditor/ckeditor5/issues/815). ([0ad3074](https://github.com/ckeditor/ckeditor5-engine/commit/0ad3074))
* You can now return `null` from the element creators in converters for selection attributes and markers. It does not crash the conversion anymore. Closes [#833](https://github.com/ckeditor/ckeditor5/issues/833). ([8ffa038](https://github.com/ckeditor/ckeditor5-engine/commit/8ffa038))

### Features

* Integrated `Schema#limits` with `DataController`'s methods. Closes [#818](https://github.com/ckeditor/ckeditor5/issues/818). ([e3c3e33](https://github.com/ckeditor/ckeditor5-engine/commit/e3c3e33))
* Introduced `is()` method in model and view tree nodes and document fragments. Closes [#809](https://github.com/ckeditor/ckeditor5/issues/809). ([1525bde](https://github.com/ckeditor/ckeditor5-engine/commit/1525bde))
* Introduced `model.Selection#getSelectedBlocks()`. Closes [#811](https://github.com/ckeditor/ckeditor5/issues/811). ([9f3f35f](https://github.com/ckeditor/ckeditor5-engine/commit/9f3f35f))
* Introduced `Schema#limits` map. See [#818](https://github.com/ckeditor/ckeditor5/issues/818). ([a66bcdd](https://github.com/ckeditor/ckeditor5-engine/commit/a66bcdd))
* Introduced `view.Document#selectionChangeDone` event. Closes [#791](https://github.com/ckeditor/ckeditor5/issues/791). ([3a15236](https://github.com/ckeditor/ckeditor5-engine/commit/3a15236))
* Introduced `view.Range#getEnlarged()`, `view.Range#getTrimmed()`, `view.Position#getLastMatchingPosition()`, `model.Position#getLastMatchingPosition()`, `view.TreeWalker#skip()`, `model.TreeWalker#skip()`. Closes [#789](https://github.com/ckeditor/ckeditor5/issues/789). ([973f2ba](https://github.com/ckeditor/ckeditor5-engine/commit/973f2ba))
* Introduced `view.UIElement` class and `view.writer.clear()` method. Closes [#788](https://github.com/ckeditor/ckeditor5/issues/788). ([64be1f6](https://github.com/ckeditor/ckeditor5-engine/commit/64be1f6))
* Introduced debugging tools for the engine. Closes [#808](https://github.com/ckeditor/ckeditor5/issues/808). ([7b56e4a](https://github.com/ckeditor/ckeditor5-engine/commit/7b56e4a))
* Introduced converters from model markers to `view.UIElement`. Closes [#792](https://github.com/ckeditor/ckeditor5/issues/792). ([1731e69](https://github.com/ckeditor/ckeditor5-engine/commit/1731e69))

### Other changes

* `ModelConversionDispatcher` now uses `remove` + `insert` events to convert `move` and `rename` changes, instead of dedicated `move` and `rename` events. Closes [#837](https://github.com/ckeditor/ckeditor5/issues/837). ([f63657c](https://github.com/ckeditor/ckeditor5-engine/commit/f63657c))
* `view.Range.enlarge()` and `view.Range.shrink()` should not pass the container limit because the `view.Writer` expects that the whole range is in the same container. Closes [#830](https://github.com/ckeditor/ckeditor5/issues/830). ([8d4a1ca](https://github.com/ckeditor/ckeditor5-engine/commit/8d4a1ca))


### BREAKING CHANGES

* `ModelConversionDispatcher` no longer fires `move` and `rename` events. This means that feature converters added as callbacks to those should be replaced by `remove` and `insert` converters.
* Removed `view.DocumentFragment#getAncestors()`. Closes [#803](https://github.com/ckeditor/ckeditor5/issues/803). Closes [#805](https://github.com/ckeditor/ckeditor5/issues/805).
* `Position.getAncestors()` should return elements in the same order as `Node.getAncestors()`.

### NOTE

* It is advised to use either `Range#getTrimmed()` or `Range#getEnlarged()` before operating on a range returned from `Mapper`.
