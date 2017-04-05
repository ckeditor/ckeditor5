Changelog
=========

## [0.9.0](https://github.com/ckeditor/ckeditor5-engine/compare/v0.8.0...v0.9.0) (2017-04-05)

### Bug fixes

* Changed insertContent behaviour, so it doesn't clone given nodes. Closes [#869](https://github.com/ckeditor/ckeditor5-engine/issues/869). ([45f0f33](https://github.com/ckeditor/ckeditor5-engine/commit/45f0f33))
* Empty `AttributeDelta` should not be added to batch. Closes [#875](https://github.com/ckeditor/ckeditor5-engine/issues/875). ([425399b](https://github.com/ckeditor/ckeditor5-engine/commit/425399b))
* Fixed a bug where `LiveRange` position would be lost when using wrap and unwrap deltas. Closes [#841](https://github.com/ckeditor/ckeditor5-engine/issues/841). ([efe3987](https://github.com/ckeditor/ckeditor5-engine/commit/efe3987))
* Fixed various issues with the move and unwrap deltas conversion. Closes [#847](https://github.com/ckeditor/ckeditor5-engine/issues/847). ([39c34a5](https://github.com/ckeditor/ckeditor5-engine/commit/39c34a5))
* Live ranges, selections and markers no longer lose content when using the move delta. Closes [#877](https://github.com/ckeditor/ckeditor5-engine/issues/877). ([e08b019](https://github.com/ckeditor/ckeditor5-engine/commit/e08b019))

  The base algorithm implemented in `Range#_getTransformedByDocumentChange()` will now include all model items between the old and new range boundary. See https://github.com/ckeditor/ckeditor5-engine/issues/877#issuecomment-287740021 for more details.
* Mutations inserting bogus BR on the end of the block element are filtered out by mutation observer. Closes [#882](https://github.com/ckeditor/ckeditor5-engine/issues/882). ([3583cae](https://github.com/ckeditor/ckeditor5-engine/commit/3583cae))
* Renderer should not change the native selection if the one it's about to render is visually similar to the current one. Closes [#887](https://github.com/ckeditor/ckeditor5-engine/issues/887). Closes [#880](https://github.com/ckeditor/ckeditor5-engine/issues/880). ([d8ee5fa](https://github.com/ckeditor/ckeditor5-engine/commit/d8ee5fa))
* Renderer will unbind DOM elements from view elements when removing them from DOM. Closes [#888](https://github.com/ckeditor/ckeditor5-engine/issues/888). ([86ea5b5](https://github.com/ckeditor/ckeditor5-engine/commit/86ea5b5))
* Reversed `ReinsertOperation` targets back to same graveyard holder from which the nodes were re-inserted. Closes [#891](https://github.com/ckeditor/ckeditor5-engine/issues/891). ([ea6c881](https://github.com/ckeditor/ckeditor5-engine/commit/ea6c881))
* View document is now re-rendered after focusing. Closes [#795](https://github.com/ckeditor/ckeditor5-engine/issues/795). ([115a91b](https://github.com/ckeditor/ckeditor5-engine/commit/115a91b))
* view.Renderer will deeply unbind DOM elements when they are removed from DOM. Closes [#888](https://github.com/ckeditor/ckeditor5-engine/issues/888). ([0aec182](https://github.com/ckeditor/ckeditor5-engine/commit/0aec182))

### Features

* `DataController#insertContent()` now accepts also model items. Closes [#870](https://github.com/ckeditor/ckeditor5-engine/issues/870). ([d00c973](https://github.com/ckeditor/ckeditor5-engine/commit/d00c973))
* Added placeholder utility that can be applied to view elements. Closes [#857](https://github.com/ckeditor/ckeditor5-engine/issues/857). ([79b42da](https://github.com/ckeditor/ckeditor5-engine/commit/79b42da))
* Introduced `dev-utils.DeltaReplayer`. Introduced new logging methods in `dev-utils.enableEngineDebug`. Closes [#828](https://github.com/ckeditor/ckeditor5-engine/issues/828). ([eb855d9](https://github.com/ckeditor/ckeditor5-engine/commit/eb855d9))
* Introduced markers serialization. Closes [#787](https://github.com/ckeditor/ckeditor5-engine/issues/787). Closes [#846](https://github.com/ckeditor/ckeditor5-engine/issues/846). ([2e7f75d](https://github.com/ckeditor/ckeditor5-engine/commit/2e7f75d))

  BREAKING CHANGES: `BuildModelConverter#fromMarkerCollapsed` is removed. Use `BuildModelConverter#fromMarker` instead.

  NOTE: `insertUIElement` model to view converter now supports collapsed and non-collapsed ranges.

### Other changes

* Changed the behavior of `DataController.deleteContent()` in a case of nested elements to better match situations like using <kbd>Backspace</kbd> after a block quotation. Closes [#710](https://github.com/ckeditor/ckeditor5-engine/issues/710). ([42a4429](https://github.com/ckeditor/ckeditor5-engine/commit/42a4429))
* Default conversion.Mapper position mapping algorithms are now added as callbacks with low priority and are fired only if earlier callbacks did not provide a result. Closes [#884](https://github.com/ckeditor/ckeditor5-engine/issues/884). ([5627993](https://github.com/ckeditor/ckeditor5-engine/commit/5627993))

  BREAKING CHANGES: Since default position mapping algorithms are attached with low priority, custom position mapping callbacks added with higher priority won't receive position calculated by default algorithms in data. To execute default position mapping algorithms and use their value, hook custom callback with lower priority.
* Simplified `SelectionObserver`'s infinite loop check which should improve its stability. Closes [#889](https://github.com/ckeditor/ckeditor5-engine/issues/889). ([8b859fb](https://github.com/ckeditor/ckeditor5-engine/commit/8b859fb))

### BREAKING CHANGES

* Since default position mapping algorithms are attached with low priority, custom position mapping callbacks added with higher priority won't receive position calculated by default algorithms in data. To execute default position mapping algorithms and use their value, hook custom callback with lower priority.
* `BuildModelConverter#fromMarkerCollapsed` is removed. Use `BuildModelConverter#fromMarker` instead.
### NOTE

* `insertUIElement` model to view converter now supports collapsed and non-collapsed ranges. 


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
