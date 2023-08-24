Changelog
=========

All changes in the package are documented in the main repository. See: https://github.com/ckeditor/ckeditor5/blob/master/CHANGELOG.md.

Changes for the past releases are available below.

## [19.0.0](https://github.com/ckeditor/ckeditor5-engine/compare/v18.0.0...v19.0.0) (2020-04-29)

### Features

* Introduced the `View#hasDomSelection` property. Closes [ckeditor/ckeditor5#6485](https://github.com/ckeditor/ckeditor5/issues/6485). ([152bdab](https://github.com/ckeditor/ckeditor5-engine/commit/152bdab))

### Bug fixes

* Fixed a crash that was happening in some scenarios when undoing table background change. Closes [ckeditor/ckeditor5#6265](https://github.com/ckeditor/ckeditor5/issues/6265). ([f0902fb](https://github.com/ckeditor/ckeditor5-engine/commit/f0902fb))
* Graveyard selection fix no longer breaks the editor in case of intersecting ranges. Closes [ckeditor/ckeditor5#6501](https://github.com/ckeditor/ckeditor5/issues/6501). Closes [ckeditor/ckeditor5#6382](https://github.com/ckeditor/ckeditor5/issues/6382). ([c208ce1](https://github.com/ckeditor/ckeditor5-engine/commit/c208ce1))

### Other changes

* Improved performance of `Position` getters (~60% gain). Reduced time of some common tasks (like loading complex content) by up to 30%. Closes [ckeditor/ckeditor5#6579](https://github.com/ckeditor/ckeditor5/issues/6579). ([670cd7b](https://github.com/ckeditor/ckeditor5-engine/commit/670cd7b))
* Improved performance of `TreeWalker` by up to 40%. This optimization affects common tasks such as loading the editor data. Closes [ckeditor/ckeditor5#6582](https://github.com/ckeditor/ckeditor5/issues/6582). ([08e8294](https://github.com/ckeditor/ckeditor5-engine/commit/08e8294))
* Improved the performance of the `Position` constructor by optimizing the code path where an element is passed as the position `root` parameter. Closes [ckeditor/ckeditor5#6528](https://github.com/ckeditor/ckeditor5/issues/6528). ([bfc6c88](https://github.com/ckeditor/ckeditor5-engine/commit/bfc6c88))
* Inlined parent `is()` calls in model and view classes to improve the editor performance. Closes [ckeditor/ckeditor5#6529](https://github.com/ckeditor/ckeditor5/issues/6529). ([ff04509](https://github.com/ckeditor/ckeditor5-engine/commit/ff04509))


## [18.0.0](https://github.com/ckeditor/ckeditor5-engine/compare/v17.0.0...v18.0.0) (2020-03-19)

### MAJOR BREAKING CHANGES

* `EditingController` requires an instance of `StylesProcessor` in its constructor.
* `DataController` requires an instance of `StylesProcessor` in its constructor.
* `DomConverter`, `HtmlDataProcessor` and `XmlDataProcessor` require an instance of the view document in their constructors.
* The `View` class requires an instance of `StylesProcessor` as its first argument.
* The `createViewElementFromHighlightDescriptor()` function that is exported by `src/conversion/downcasthelpers.js` file requires an instance of the view document as its first argument.
* Method `view.Document#addStyleProcessorRules()` has been moved to the `DataController` class.
* The `#document` getter was removed from model nodes. Only the root element holds the reference to the model document. For attached nodes, use `node.root.document` to access it.

### MINOR BREAKING CHANGES

* `DataController` does not accept the data processor instance any more.

### Features

* Implemented the model and view `Range#getContainedElement()` methods. Closes [ckeditor/ckeditor5#6364](https://github.com/ckeditor/ckeditor5/issues/6364). ([8fb1efa](https://github.com/ckeditor/ckeditor5-engine/commit/8fb1efa))

### Bug fixes

* Fixed renderer bug causing editor crash in a range of scenarios involving reusing DOM elements. Closes [ckeditor/ckeditor5#6092](https://github.com/ckeditor/ckeditor5/issues/6092). ([67884da](https://github.com/ckeditor/ckeditor5-engine/commit/67884da))

### Other changes

* `DataController` will now use a single instance of the view document for all its operations (`DataController#viewDocument`). Closes [ckeditor/ckeditor5#6381](https://github.com/ckeditor/ckeditor5/issues/6381). ([851bac6](https://github.com/ckeditor/ckeditor5-engine/commit/851bac6))
* `Document#version` is no longer read-only. ([968b193](https://github.com/ckeditor/ckeditor5-engine/commit/968b193))
* `StylesProcessor` rules will not be stored in a singleton, which made them shared between editor instances. In order to allow binding a styles processor instance to a specific view document, we had to replace a dynamic `#document` property in view nodes with a static one, set upon node creation. Closes [ckeditor/ckeditor5#6091](https://github.com/ckeditor/ckeditor5/issues/6091). ([0e2f02e](https://github.com/ckeditor/ckeditor5-engine/commit/0e2f02e))
* Introduced support for multi-range selections. Closes [ckeditor/ckeditor5#6116](https://github.com/ckeditor/ckeditor5/issues/6116). ([ffce577](https://github.com/ckeditor/ckeditor5-engine/commit/ffce577))


## [17.0.0](https://github.com/ckeditor/ckeditor5-engine/compare/v16.0.0...v17.0.0) (2020-02-19)

### Features

* Introduced CSS style normalization for conversion. Closes [ckeditor/ckeditor5#6047](https://github.com/ckeditor/ckeditor5/issues/6047). ([b2a8189](https://github.com/ckeditor/ckeditor5-engine/commit/b2a8189))
* Added a `startsWith()` method to `SchemaContext`. ([11fa53a](https://github.com/ckeditor/ckeditor5-engine/commit/11fa53a))
* Introduced `DocumentSelection#event:change:marker`. Closes [ckeditor/ckeditor5#6133](https://github.com/ckeditor/ckeditor5/issues/6133). ([5106014](https://github.com/ckeditor/ckeditor5-engine/commit/5106014))
* Introduced `Model#createOperationFromJSON()` which is an alias for `OperationFactory.fromJSON()`. Closes [ckeditor/ckeditor5#6094](https://github.com/ckeditor/ckeditor5/issues/6094). ([ebaa2cc](https://github.com/ckeditor/ckeditor5-engine/commit/ebaa2cc))

### Bug fixes

* Changes irrelevant to the view (e.g. inside UIElements) will no longer force a view render nor will they trigger mutation event on the document. Closes [ckeditor/ckeditor5#5600](https://github.com/ckeditor/ckeditor5/issues/5600). ([b7e2bfe](https://github.com/ckeditor/ckeditor5-engine/commit/b7e2bfe))
* DOM selection change will not be converted if the selection was placed outside of the editable element. Closes [ckeditor/ckeditor5#4199](https://github.com/ckeditor/ckeditor5/issues/4199). ([1c3749e](https://github.com/ckeditor/ckeditor5-engine/commit/1c3749e))

### Other changes

* Allow selection on object elements. Closes [ckeditor/ckeditor5#6154](https://github.com/ckeditor/ckeditor5/issues/6154). ([0dec72d](https://github.com/ckeditor/ckeditor5-engine/commit/0dec72d))
* Improved `parseAttributes()` function performance. This results in improved editor data processing speed. Closes [ckeditor/ckeditor5#5854](https://github.com/ckeditor/ckeditor5/issues/5854). ([ecaf056](https://github.com/ckeditor/ckeditor5-engine/commit/ecaf056))


## [16.0.0](https://github.com/ckeditor/ckeditor5-engine/compare/v15.0.0...v16.0.0) (2019-12-04)

### Other changes

* Split debug tools between the engine files. You do not need to add debug plugin to the editor if you want to use `--debug engine` building flag anymore. Closes [ckeditor/ckeditor5#5649](https://github.com/ckeditor/ckeditor5/issues/5649). ([353f091](https://github.com/ckeditor/ckeditor5-engine/commit/353f091))


## [15.0.0](https://github.com/ckeditor/ckeditor5-engine/compare/v14.0.0...v15.0.0) (2019-10-23)

### MAJOR BREAKING CHANGES

* The behavior of block filler detection on DOM to view conversion was changed. Now, it specifically checks the parent of a text node to check whether it is a block. Which means that a list of block element names has to be used. If you use custom elements or use one of the HTML elements which CKEditor&nbsp;5 does not recognize as a block element, see [#404](https://github.com/ckeditor/ckeditor5-engine/issues/404) and `DomConverter.blockElements` documentation.
* The `Selection#getTopMostBlocks()` was removed from the public API. Use `Selection#getSelectedBlocks()` instead.
* The `Selection#getSelectedBlocks()` does not return blocks nested in other blocks now.

### Features

* Added support for creating elements from other XML namespaces. See [ckeditor/ckeditor5#2088](https://github.com/ckeditor/ckeditor5/issues/2088). ([a9190c9](https://github.com/ckeditor/ckeditor5-engine/commit/a9190c9))

### Bug fixes

* Added a proper check for name-only view matcher in attribute upcast converters. Closes [#1786](https://github.com/ckeditor/ckeditor5-engine/issues/1786). ([2210696](https://github.com/ckeditor/ckeditor5-engine/commit/2210696))
* Improved filtering out disallowed attributes on child elements. [#1789](https://github.com/ckeditor/ckeditor5-engine/issues/1789). ([c5033b6](https://github.com/ckeditor/ckeditor5-engine/commit/c5033b6))
* Improved performance when working with fake selections. Closes [#1791](https://github.com/ckeditor/ckeditor5-engine/issues/1791). ([f073ad5](https://github.com/ckeditor/ckeditor5-engine/commit/f073ad5))
* Placeholder should not be visible in the read-only mode. Closes [ckeditor/ckeditor5#1987](https://github.com/ckeditor/ckeditor5/issues/1987). ([730c417](https://github.com/ckeditor/ckeditor5-engine/commit/730c417))
* Remove only real block fillers on DOM to view conversion. Closes [#404](https://github.com/ckeditor/ckeditor5-engine/issues/404). ([6d2810b](https://github.com/ckeditor/ckeditor5-engine/commit/6d2810b))
* The renderer should not update DOM selection when document has active composition. Closes [#1782](https://github.com/ckeditor/ckeditor5-engine/issues/1782). Closes [ckeditor/ckeditor5#1333](https://github.com/ckeditor/ckeditor5/issues/1333). ([c698683](https://github.com/ckeditor/ckeditor5-engine/commit/c698683))

### Other changes

* Added error handling to the common code execution paths. Part of [ckeditor/ckeditor5#1304](https://github.com/ckeditor/ckeditor5/issues/1304). ([220b52f](https://github.com/ckeditor/ckeditor5-engine/commit/220b52f))
* Removed the `Selection#getTopMostBlocks()` method. Closes [ckeditor/ckeditor5-widget#95](https://github.com/ckeditor/ckeditor5-widget/issues/95). Closes [ckeditor/ckeditor5-table#199](https://github.com/ckeditor/ckeditor5-table/issues/199). ([7970f17](https://github.com/ckeditor/ckeditor5-engine/commit/7970f17))


## [14.0.0](https://github.com/ckeditor/ckeditor5-engine/compare/v13.2.1...v14.0.0) (2019-08-26)

### Features

* `transformSets()` will now return a `Map` instance linking transformed operations to the original operations. ([61da3ec](https://github.com/ckeditor/ckeditor5-engine/commit/61da3ec))
* Brought support for RTL content in the `bindTwoStepCaretToAttribute()` helper. See [ckeditor/ckeditor5#1151](https://github.com/ckeditor/ckeditor5/issues/1151). ([d57ff5a](https://github.com/ckeditor/ckeditor5-engine/commit/d57ff5a))
* Introduced `model.Differ#refreshItem()`. ([7dc8710](https://github.com/ckeditor/ckeditor5-engine/commit/7dc8710))
* Introduced the `is()` method to additional objects from the model and view realms. Closes [#1667](https://github.com/ckeditor/ckeditor5-engine/issues/1667). ([89dbe43](https://github.com/ckeditor/ckeditor5-engine/commit/89dbe43))

### Bug fixes

* Fixed problem with handling very large text nodes. ([a7ae813](https://github.com/ckeditor/ckeditor5-engine/commit/a7ae813))
* Prevented `Differ` crashing in some scenarios involving attribute changes on elements. Closes [#1764](https://github.com/ckeditor/ckeditor5-engine/issues/1764). ([482e55e](https://github.com/ckeditor/ckeditor5-engine/commit/482e55e))

### Other changes

* Add `unwrapElement()` method to UpcastWriter. ([9e97196](https://github.com/ckeditor/ckeditor5-engine/commit/9e97196))
* Allowed for unbinding single elements from a marker name in `Mapper`. Closes [#1758](https://github.com/ckeditor/ckeditor5-engine/issues/1758). ([52e701d](https://github.com/ckeditor/ckeditor5-engine/commit/52e701d))
* The issue tracker for this package was moved to https://github.com/ckeditor/ckeditor5/issues. See [ckeditor/ckeditor5#1988](https://github.com/ckeditor/ckeditor5/issues/1988). ([6ed94c6](https://github.com/ckeditor/ckeditor5-engine/commit/6ed94c6))
* Introduced automatic marker re-rendering during conversion for markers which view element was unbound. Closes [#1780](https://github.com/ckeditor/ckeditor5-engine/issues/1780). ([5661fb6](https://github.com/ckeditor/ckeditor5-engine/commit/5661fb6))
* Position getters (such as `#parent` or `#index`) will throw when position points at an incorrect place in its root. Closes [#1776](https://github.com/ckeditor/ckeditor5-engine/issues/1776). ([a359866](https://github.com/ckeditor/ckeditor5-engine/commit/a359866))

### BREAKING CHANGES

* New parameter introduced in `DowncastDispatcher#convertChanges()`. Now it is `convertChanges( differ, markers, writer )`.
* Although it was rather impossible to use `DowncastDispatcher` without specifying any conversion API in the constructor, now it is a required parameter.
* The `bindTwoStepCaretToAttribute()` helper arguments syntax has changed (replaced by an object). Please refer to the helper documentation to learn more.
* `Mapper#unbindElementsFromMarkerName( markerName )` was replaced by `Mapper#unbindElementFromMarkerName( element, markerName )`.


## [13.2.1](https://github.com/ckeditor/ckeditor5-engine/compare/v13.2.0...v13.2.1) (2019-07-10)

Internal changes only (updated dependencies, documentation, etc.).


## [13.2.0](https://github.com/ckeditor/ckeditor5-engine/compare/v13.1.1...v13.2.0) (2019-07-04)

### Features

* Added `view.Document#event:beforeinput`. ([c74c3d6](https://github.com/ckeditor/ckeditor5-engine/commit/c74c3d6))
* Introduced the `type` parameter to the `model.createBatch()` method. ([389b72e](https://github.com/ckeditor/ckeditor5-engine/commit/389b72e))

### Bug fixes

* `model.Writer#insert()` will no longer crash when the data to set contains markers that are already in the editor content. Closes [#1721](https://github.com/ckeditor/ckeditor5-engine/issues/1721). ([4ff0656](https://github.com/ckeditor/ckeditor5-engine/commit/4ff0656))
* Selection will not change during forbidden copy-paste operation inside table cell. Closes [ckeditor/ckeditor5#1380](https://github.com/ckeditor/ckeditor5/issues/1380). ([ab15b17](https://github.com/ckeditor/ckeditor5-engine/commit/ab15b17))

### Other changes

* Changed how `&nbsp;`s are generated on the view->DOM rendering. Closes [#1747](https://github.com/ckeditor/ckeditor5-engine/issues/1747). ([da5670a](https://github.com/ckeditor/ckeditor5-engine/commit/da5670a))


## [13.1.1](https://github.com/ckeditor/ckeditor5-engine/compare/v13.1.0...v13.1.1) (2019-06-05)

### Bug fixes

* Prevented from losing selection attributes between operations (fixes a bug with text composition). Closes https://github.com/ckeditor/ckeditor5-typing/issues/188. ([42dcb25](https://github.com/ckeditor/ckeditor5-engine/commit/42dcb25))

### Other changes

* Added more cases of affected markers on merging in `model.Writer`. Closes [#1738](https://github.com/ckeditor/ckeditor5-engine/issues/1738). ([01ff6e6](https://github.com/ckeditor/ckeditor5-engine/commit/01ff6e6))


## [13.1.0](https://github.com/ckeditor/ckeditor5-engine/compare/v13.0.0...v13.1.0) (2019-04-10)

### Features

* `Model#insertContent()` will return a range affected by the insertion. ([f4e4644](https://github.com/ckeditor/ckeditor5-engine/commit/f4e4644))

  In `Model#deleteContent()`, added `doNotAutoparagraph` flag to `options`.
  `Position` and `LivePosition` static creators should handle `stickiness` param.
* Added possibility to refresh the marker with no changes through `Writer#updateMarker()` method. Closes [#1649](https://github.com/ckeditor/ckeditor5-engine/issues/1649). ([cf56d90](https://github.com/ckeditor/ckeditor5-engine/commit/cf56d90))
* Introduced `Schema#setAttributeProperties()` and `Schema#getAttributeProperties()` methods. Closes [ckeditor/ckeditor5#1659](https://github.com/ckeditor/ckeditor5/issues/1659). ([1c6f83a](https://github.com/ckeditor/ckeditor5-engine/commit/1c6f83a))
* Introduced `UpcastConversionApi#getSplitParts()`. Also, provided a way to set upcast conversion helper fired for every view element. Closes https://github.com/ckeditor/ckeditor5/issues/1580. Closes https://github.com/ckeditor/ckeditor5/issues/1581. ([d0ee3f4](https://github.com/ckeditor/ckeditor5-engine/commit/d0ee3f4))

### Bug fixes

* `view.DowncastWriter` will now correctly wrap and unwrap nested attribute elements. Closes [#1716](https://github.com/ckeditor/ckeditor5-engine/issues/1716). Closes [ckeditor/ckeditor5-font#30](https://github.com/ckeditor/ckeditor5-font/issues/30). ([4126359](https://github.com/ckeditor/ckeditor5-engine/commit/4126359))
* Attribute and remove change on intersecting ranges done in the same change block will be correctly saved in `Differ` and downcasted. Closes [ckeditor/ckeditor5#1645](https://github.com/ckeditor/ckeditor5/issues/1645). ([b2a9d86](https://github.com/ckeditor/ckeditor5-engine/commit/b2a9d86))
* Editor will no longer crash during undo in some pasting+remove scenarios. Closes [#1701](https://github.com/ckeditor/ckeditor5-engine/issues/1701). ([ca619e7](https://github.com/ckeditor/ckeditor5-engine/commit/ca619e7))
* Made sure that `Schema#getAttributeProperties()` always returns an object. Closes [#1717](https://github.com/ckeditor/ckeditor5-engine/issues/1717). ([b3f5da3](https://github.com/ckeditor/ckeditor5-engine/commit/b3f5da3))
* Markers should be now correctly upcasted inside any element. Closes [#1697](https://github.com/ckeditor/ckeditor5-engine/issues/1697). ([3706324](https://github.com/ckeditor/ckeditor5-engine/commit/3706324))
* `Model#deleteContent()` will not throw anymore if the passed selection is in the graveyard root. Closes [#1706](https://github.com/ckeditor/ckeditor5-engine/issues/1706). ([bd875c7](https://github.com/ckeditor/ckeditor5-engine/commit/bd875c7))
* The editor will not throw an error when updating an empty fake selection container. Closes [#1714](https://github.com/ckeditor/ckeditor5-engine/issues/1714). ([c48f5a4](https://github.com/ckeditor/ckeditor5-engine/commit/c48f5a4))


## [13.0.0](https://github.com/ckeditor/ckeditor5-engine/compare/v12.0.0...v13.0.0) (2019-02-28)

### Features

* Added an additional event in markers conversion. Improved how `MarkerOperation` is transformed during undo. Closes [#1604](https://github.com/ckeditor/ckeditor5-engine/issues/1604). ([da5a390](https://github.com/ckeditor/ckeditor5-engine/commit/da5a390))
* Implemented `Selection#is()` and `DocumentSelection#is()` methods in both the model and the view. Closes [#1663](https://github.com/ckeditor/ckeditor5-engine/issues/1663). ([aac4948](https://github.com/ckeditor/ckeditor5-engine/commit/aac4948))
* Introduce the `selection.getTopMostBlocks()` method. ([a9c41c8](https://github.com/ckeditor/ckeditor5-engine/commit/a9c41c8))
* Introduce the read-only `View#isRenderingInProgress` flag to check if the document is in the rendering phase. Closes https://github.com/ckeditor/ckeditor5/issues/1530. ([6577d04](https://github.com/ckeditor/ckeditor5-engine/commit/6577d04))
* Introduced `Differ#getChangedMarkers`. Closes [#1658](https://github.com/ckeditor/ckeditor5-engine/issues/1658). ([2e04af7](https://github.com/ckeditor/ckeditor5-engine/commit/2e04af7))
* Introduced `DocumentSelection#markers` collection. Closes [#1615](https://github.com/ckeditor/ckeditor5-engine/issues/1615). ([b2c1d72](https://github.com/ckeditor/ckeditor5-engine/commit/b2c1d72))
* Introduced support for inline objects (enables support for inline widgets). Introduced `Schema#isInline()`. Closes [[ckeditor/ckeditor5#1049](https://github.com/ckeditor/ckeditor5/issues/1049)](https://github.com/ckeditor/ckeditor5/issues/1049). Closes [[ckeditor/ckeditor5#1426](https://github.com/ckeditor/ckeditor5/issues/1426)](https://github.com/ckeditor/ckeditor5/issues/1426). ([6b36bf1](https://github.com/ckeditor/ckeditor5-engine/commit/6b36bf1))
* Introduced whitespace trimming to `Model#hasContent()`. `DataController#get()` method can now trim empty data (so it returns empty string instead of `<p>&nbsp;</p>`). Closes [[ckeditor/ckeditor5#401](https://github.com/ckeditor/ckeditor5/issues/401)](https://github.com/ckeditor/ckeditor5/issues/401). ([2b95dc3](https://github.com/ckeditor/ckeditor5-engine/commit/2b95dc3))
* Moved the root element DOM attributes management from the UI to the engine. Made it possible to use `addPlaceholder()` (now `enablePlaceholder()`) on the root editable. Introduced the `View.detachDomRoot()` method. Implemented additional placeholder helpers (`showPlaceholder()`, `hidePlaceholder()`, `needsPlaceholder()`) (see [ckeditor/ckeditor5#479](https://github.com/ckeditor/ckeditor5/issues/479)). Closes [#899](https://github.com/ckeditor/ckeditor5-engine/issues/899). ([21dee6b](https://github.com/ckeditor/ckeditor5-engine/commit/21dee6b))

### Bug fixes

* `MarkerOperation` OT cases for undo. Closes [#1650](https://github.com/ckeditor/ckeditor5-engine/issues/1650). ([649cae0](https://github.com/ckeditor/ckeditor5-engine/commit/649cae0))
* `MarkerOperation` transformation in undo. Closes [#1668](https://github.com/ckeditor/ckeditor5-engine/issues/1668). ([c9932b8](https://github.com/ckeditor/ckeditor5-engine/commit/c9932b8))
* `Selection#getTopMostBlocks()` should not leak from limit elements. Closes [ckeditor/ckeditor5-table#163](https://github.com/ckeditor/ckeditor5-table/issues/163). ([7bc0338](https://github.com/ckeditor/ckeditor5-engine/commit/7bc0338))
* All content is properly removed after undoing paste in some scenarios. Closes [[ckeditor/ckeditor5#1540](https://github.com/ckeditor/ckeditor5/issues/1540)](https://github.com/ckeditor/ckeditor5/issues/1540). ([08855d3](https://github.com/ckeditor/ckeditor5-engine/commit/08855d3))
* Converter priority passing in `conversion.attributeToElement()`. Closes [#1617](https://github.com/ckeditor/ckeditor5-engine/issues/1617). ([fe6d17d](https://github.com/ckeditor/ckeditor5-engine/commit/fe6d17d))
* Fake selection container should be correctly appended to the new editable element when creating a new fake selection in a different editable element than the one which was focused before. Closes [[ckeditor/ckeditor5#1523](https://github.com/ckeditor/ckeditor5/issues/1523)](https://github.com/ckeditor/ckeditor5/issues/1523). ([3b53d5a](https://github.com/ckeditor/ckeditor5-engine/commit/3b53d5a))
* Filter out fake selection container before comparing DOM view root children in view renderer. Closes [ckeditor/ckeditor5#1578](https://github.com/ckeditor/ckeditor5/issues/1578). ([6591f87](https://github.com/ckeditor/ckeditor5-engine/commit/6591f87))
* Moving to the same position is not handled by the `Differ` as a change. ([7dfaae6](https://github.com/ckeditor/ckeditor5-engine/commit/7dfaae6))
* Prevented `model.Writer` from inserting empty text nodes. Closes [#1320](https://github.com/ckeditor/ckeditor5-engine/issues/1320). ([47070b5](https://github.com/ckeditor/ckeditor5-engine/commit/47070b5))
* Prevented `View` from firing the `render` event if there were no changes since the last rendering. Closes [#1653](https://github.com/ckeditor/ckeditor5-engine/issues/1653). Closes [#1660](https://github.com/ckeditor/ckeditor5-engine/issues/1660). ([558638c](https://github.com/ckeditor/ckeditor5-engine/commit/558638c))
* Renamed the event during selection attributes conversion. `attribute:key` becomes to `attribute:key:$text`. Closes [#1597](https://github.com/ckeditor/ckeditor5-engine/issues/1597). ([fd7734e](https://github.com/ckeditor/ckeditor5-engine/commit/fd7734e))
* Stopped invoking `view.render()` by `EditingController` when the model document isn't changed. Closes [#1653](https://github.com/ckeditor/ckeditor5-engine/issues/1653). ([5d97fd6](https://github.com/ckeditor/ckeditor5-engine/commit/5d97fd6))
* Fixed memory leaks during editor initialization and destruction (see [ckeditor/ckeditor5#1341](https://github.com/ckeditor/ckeditor5/issues/1341)). ([bf86ffa](https://github.com/ckeditor/ckeditor5-engine/commit/bf86ffa))
* Undo and redo no longer crashes in scenarios featuring pasting content into earlier pasted content. Closes [[ckeditor/ckeditor5#1385](https://github.com/ckeditor/ckeditor5/issues/1385)](https://github.com/ckeditor/ckeditor5/issues/1385). ([551ab50](https://github.com/ckeditor/ckeditor5-engine/commit/551ab50))
* Update model selection attributes and markers after each change that affects the selection. Closes [#1673](https://github.com/ckeditor/ckeditor5-engine/issues/1673). ([4f9ac0e](https://github.com/ckeditor/ckeditor5-engine/commit/4f9ac0e))

* Add selection post-fixer improvements. Closes [#1593](https://github.com/ckeditor/ckeditor5-engine/issues/1593). ([7f40831](https://github.com/ckeditor/ckeditor5-engine/commit/7f40831))

### Other changes

* Added support for handling data in multiple roots in `DataController`. Closes [#1626](https://github.com/ckeditor/ckeditor5-engine/issues/1626). ([0fb4295](https://github.com/ckeditor/ckeditor5-engine/commit/0fb4295))
* Change `Conversion` class API. Closes [#1640](https://github.com/ckeditor/ckeditor5-engine/issues/1640). ([e7d09cd](https://github.com/ckeditor/ckeditor5-engine/commit/e7d09cd))
* Introduced `editor.data#ready` event. ([46d9243](https://github.com/ckeditor/ckeditor5-engine/commit/46d9243))
* Removed `wrap()` from public API. Closes [#1616](https://github.com/ckeditor/ckeditor5-engine/issues/1616). ([1c7ef68](https://github.com/ckeditor/ckeditor5-engine/commit/1c7ef68))
* Swapped the order of parameters in `Schema#findAllowedParent()`. Now those parameters match to parameters in other methods of the `Schema` class. Closes [#1636](https://github.com/ckeditor/ckeditor5-engine/issues/1636). ([6515558](https://github.com/ckeditor/ckeditor5-engine/commit/6515558))
* Upcast element to attribute defaults to `low` priority instead of `normal`. Closes [ckeditor/ckeditor5#1399](https://github.com/ckeditor/ckeditor5/issues/1399). ([c33c49c](https://github.com/ckeditor/ckeditor5-engine/commit/c33c49c))
* Expose conversion utilities. Closes [#1556](https://github.com/ckeditor/ckeditor5-engine/issues/1556). ([9306c22](https://github.com/ckeditor/ckeditor5-engine/commit/9306c22))

### BREAKING CHANGES

* Upgraded minimal versions of Node to `8.0.0` and npm to `5.7.1`. See: [ckeditor/ckeditor5#1507](https://github.com/ckeditor/ckeditor5/issues/1507). ([612ea3c](https://github.com/ckeditor/ckeditor5-cloud-services/commit/612ea3c))
* `DataController#get()` method now returns an empty string when the editor content is empty (instead of returning e.g. `<p>&nbsp;</p>`).
* The wrap() conversion helper was removed from public API.
* The `attachPlaceholder()` has been renamed to `enablePlaceholder()`.
* `enablePlaceholder()` accepts a configuration object instead of separate parameters.
* The `detachPlaceholder()` has been renamed to `disablePlaceholder()`.
* The `Conversion#register()` method was removed from the public API. Use constructor parameters to pass dispatchers and `Conversion#addAlias()` to register an alternative conversion group for registered upcast or downcast dispatchers.
* The `editor#dataReady` event was removed. The `editor.data#ready` event has been introduced and should be used instead.
* Swapped the order of parameters in `Schema#findAllowedParent()`.
* The second parameter (`rootName`) from `DataController#init()` method has been removed. To initialize data on a root different than default one an object with `rootName` - `data` pair should be passed.
* The second parameter (`rootName`) from `DataController#set()` method has been removed. To set data on a root different than default one an object with `rootName` - `data` pair should be passed.
* The `editing.view.render()` method was renamed to `editing.view.forceRender()`. It should be used with caution as it will re-render editing view and repaint the UI.
* The `conversion.register()` method now accepts single options object as a parameter.
* The `downcastElementToElement()` helper was removed from public API. Use `conversion.for( 'downcast' ).elementToElement()` instead.
* The `downcastAttributeToElement()` helper was removed from public API. Use `conversion.for( 'downcast' ).attributeToElement()` instead.
* The `downcastAttributeToAttribute()` helper was removed from public API. Use `conversion.for( 'downcast' ).attributeToAttribute()` instead.
* The `downcastMarkerToElement()` helper was removed from public API. Use `conversion.for( 'downcast' ).markerToElement()` instead.
* The `downcastMarkerToHighlight()` helper was removed from public API. Use `conversion.for( 'downcast' ).markerToHighlight()` instead.
* The `upcastElementToElement()` helper was removed from public API. Use `conversion.for( 'upcast' ).elementToElement()` instead.
* The `upcastElementToAttribute()` helper was removed from public API. Use `conversion.for( 'upcast' ).elementToAttribute()` instead.
* The `upcastAttributeToAttribute()` helper was removed from public API. Use `conversion.for( 'upcast' ).attributeToAttribute()` instead.
* The `upcastElementToMarker()` helper was removed from public API. Use `conversion.for( 'upcast' ).elementToMarker()` instead.
* The `insertUIElement()` and `removeUIElement()` downcast converters were removed from public API. Use `conversion.for( 'downcast' ).markerToElement()` instead.
* The `highlightText()`, `highlightElement()` and `removeHighlight()` downcast converters were removed from public API. Use `conversion.for( 'downcast' ).markerToHighlight()` instead.
* The `insertElement()` downcast converter was removed from public API. Use `conversion.for( 'downcast' ).elementToElement()` instead.
* The `changeAttribute()` downcast converter was removed from public API. Use `conversion.for( 'downcast' ).attributeToAttribute()` instead.


## [12.0.0](https://github.com/ckeditor/ckeditor5-engine/compare/v11.0.0...v12.0.0) (2018-12-05)

### Features

* Introduced `createDocumentFragment()`, `createElement()` and `createText()` methods in `UpcastWriter`. Additionally, the `View#change()` method now returns the return value of its callback. Closes [#1549](https://github.com/ckeditor/ckeditor5-engine/issues/1549). ([ec13c85](https://github.com/ckeditor/ckeditor5-engine/commit/ec13c85))
* The `Model#insertContent()` method will accept offset parameter. ([00dd70c](https://github.com/ckeditor/ckeditor5-engine/commit/00dd70c))
* Made `Position.createAt()` require the `offset` when the first parameter is a model/view item. This change affected the following methods too. Closes [#1554](https://github.com/ckeditor/ckeditor5-engine/issues/1554). ([00dd70c](https://github.com/ckeditor/ckeditor5-engine/commit/00dd70c))

  * `model.Position.createAt()`
  * `model.Range.createCollapsedAt()`
  * `model.Selection#setFocus()`
  * `model.Writer#insert()`
  * `model.Writer#insertText()`
  * `model.Writer#insertElement()`
  * `model.Writer#move()`
  * `model.Writer#setSelectionFocus()`
  * `view.Writer#setSelectionFocus()`
  * `view.Position.createAt()`
  * `view.Range.createCollapsedAt()`
  * `view.Selection#setFocus()`

  See breaking changes.

### Bug fixes

* `Model#deleteContent()` will properly merge elements inside a limit element. Closes [ckeditor/ckeditor5#1265](https://github.com/ckeditor/ckeditor5/issues/1265). ([5d26bc3](https://github.com/ckeditor/ckeditor5-engine/commit/5d26bc3))
* Added `MoveOperation` x `SplitOperation` transformation for a case when graveyard element is moved. Closes [#1580](https://github.com/ckeditor/ckeditor5-engine/issues/1580). ([f88c918](https://github.com/ckeditor/ckeditor5-engine/commit/f88c918))
* Better handling for `MoveOperation` x `SplitOperation` transformation special case. Closes [ckeditor/ckeditor5#1288](https://github.com/ckeditor/ckeditor5/issues/1288). ([b92a800](https://github.com/ckeditor/ckeditor5-engine/commit/b92a800))
* Corrected transformations for pasting and undo scenarios. Closes [ckeditor/ckeditor5#1287](https://github.com/ckeditor/ckeditor5/issues/1287). ([b1e8975](https://github.com/ckeditor/ckeditor5-engine/commit/b1e8975))
* Do not run attribute-to-attribute downcast conversion on text node attributes. Closes [#1587](https://github.com/ckeditor/ckeditor5-engine/issues/1587). ([6659582](https://github.com/ckeditor/ckeditor5-engine/commit/6659582))
* Firefox should visually move the caret to a new line after a soft break. Closes [#1439](https://github.com/ckeditor/ckeditor5-engine/issues/1439). ([80392ad](https://github.com/ckeditor/ckeditor5-engine/commit/80392ad))
* Made markers created by `Writer#insert()` affect the data. Closes [#1583](https://github.com/ckeditor/ckeditor5-engine/issues/1583). ([72aaaf0](https://github.com/ckeditor/ckeditor5-engine/commit/72aaaf0))

### Other changes

* `ContainerElement#getFillerOffset()` can now be re-used in other places in the code (it is now exported by the module). See [ckeditor/ckeditor5-list#117](https://github.com/ckeditor/ckeditor5-list/issues/117). ([12f28bb](https://github.com/ckeditor/ckeditor5-engine/commit/12f28bb))
* Moved `Position`, `Range` and `Selection` static factories from those classes to the model/view writers and `Model`/`View` instances. Previously, those factories were available as static methods of the `Position`, `Range` and `Selection` classes which meant that you needed to import those classes to your plugin's code to create new instances. That required your package to depend on `@ckeditor/ckeditor5-engine` and was not very useful in general. After this change, you can create instances of those classes without importing anything. See the "Breaking changes" section for more details. Closes [#1555](https://github.com/ckeditor/ckeditor5-engine/issues/1555). ([e7f8467](https://github.com/ckeditor/ckeditor5-engine/commit/e7f8467))
* Various fixes in the API docs. Thanks to [@denisname](https://github.com/denisname)!

### BREAKING CHANGES

* The model `Position.createAt()` method was removed from the public API. Use `writer.createPositionAt()` instead. This method is also available on the `Model` instance.
* The `offset` parameter of the following methods does not default to `0` and hence is no longer optional when `itemOrPosition` is a model/view item:
  - `model.Position.createAt()`
  - `model.Range.createCollapsedAt()`
  - `model.Selection#setFocus()`
  - `model.Writer#insert()`
  - `model.Writer#insertText()`
  - `model.Writer#insertElement()`
  - `model.Writer#move()`
  - `model.Writer#setSelectionFocus()`
  - `view.Writer#setSelectionFocus()`
  - `view.Position.createAt()`
  - `view.Range.createCollapsedAt()`
  - `view.Selection#setFocus()`
* The model `Position.createBefore()` method was removed from the public API. Use `writer.createPositionBefore()` instead. This method is also available on the `Model` instance.
* The model `Position.createFromPosition()` method was removed. Use `writer.createPositionAt( position )` to create a new position instance. This method is also available on the `Model` instance.
* The model `Position.createFromParentAndOffset()` method was removed. Use `writer.createPositionAt( parent, offset )` instead. This method is also available on the `Model` instance.
* The model `Range.createIn()` method was removed from the public API. Use `writer.createRangeIn()` instead. This method is also available on the `Model` instance.
* The model `Range.createOn()` method was removed from the public API. Use `writer.createRangeOn()` instead. This method is also available on the `Model` instance.
* The model `Range.createFromRange()` method was removed from the public API.
* The model `Range.createFromParentsAndOffsets()` method was removed from the public API.
* The model `Range.createFromPositionAndShift()` method was removed from the public API.
* The model `Range.createCollapsedAt()` method removed method was removed. Use `writer.createRange( position )` to create collapsed range. This method is also available on the `Model` instance.
* The model `Position.createAfter()` method was removed from the public API. Use `writer.createPositionAfter()` instead. This method is also available on the `Model` instance.
* The view `Position.createAt()` method was removed from the public API. Use `writer.createPositionAt()` instead. This method is also available on the `View` instance.
* The view `Position.createAfter()` method was removed from the public API. Use `writer.createPositionAfter()` instead. This method is also available on the `View` instance.
* The view `Position.createBefore()` method was removed from the public API. Use `writer.createPositionBefore()` instead. This method is also available on the `View` instance.
* The view `Position.createFromPosition()` method was removed. Use `writer.createPositionAt( position )` to create a new position instance. This method is also available on the `View` instance.
* The view `Range.createIn()` method was removed from the public API. Use `writer.createRangeIn()` instead. This method is also available on the `View` instance.
* The view `Range.createOn()` method was removed from the public API. Use `writer.createRangeOn()` instead. This method is also available on the `View` instance.
* The view `Range.createFromRange()` method was removed from the public API.
* The view `Range.createFromPositionAndShift()` method was removed from the public API.
* The view `Range.createFromParentsAndOffsets()` method was removed from the public API.
* The view `Range.createCollapsedAt()` method removed method was removed. Use `writer.createRange( position )` to create a collapsed range. This method is also available on the `View` instance.
* The model `Range.createFromRanges()` method was removed from the public API.


## [11.0.0](https://github.com/ckeditor/ckeditor5-engine/compare/v10.2.0...v11.0.0) (2018-10-08)

### Bug fixes

* Range transformation by the split operation will expand it if `insertionPosition` is equal to the range end. Modified transformations to align with that change. Closes https://github.com/ckeditor/ckeditor5/issues/1278. ([e0e961f](https://github.com/ckeditor/ckeditor5-engine/commit/e0e961f))
* `Schema#checkAttributeInSelection()` will include selection's attributes in the context of the check. Closes [#1546](https://github.com/ckeditor/ckeditor5-engine/issues/1546). ([8fa632c](https://github.com/ckeditor/ckeditor5-engine/commit/8fa632c))
* `startsWithFiller` should correctly work with DOM `Text` nodes that are inside of an iframe. ([16b0280](https://github.com/ckeditor/ckeditor5-engine/commit/16b0280))

  Huge thanks to [Dmitri Pisarev](https://github.com/dimaip) for this contribution!
* Marked reused element attributes to be rendered if the element being replaced was also marked. Closes [#1560](https://github.com/ckeditor/ckeditor5-engine/issues/1560). Closes [#1561](https://github.com/ckeditor/ckeditor5-engine/issues/1561). ([6619a1f](https://github.com/ckeditor/ckeditor5-engine/commit/6619a1f))
* Remove clone groups in `view.DowncastWriter` manually. Closes [#1571](https://github.com/ckeditor/ckeditor5-engine/issues/1571). ([420166a](https://github.com/ckeditor/ckeditor5-engine/commit/420166a))
* Use numbers instead of booleans in `Array.sort()`. ([00fbf7f](https://github.com/ckeditor/ckeditor5-engine/commit/00fbf7f))

### Other changes

* Removed the concept of deltas. Added new operations (replacing removed deltas). Rewritten OT algorithms. Simple. 10k LOC added, 12.5k LOC removed. Closes [#1162](https://github.com/ckeditor/ckeditor5-engine/issues/1162). ([a5cf8b1](https://github.com/ckeditor/ckeditor5-engine/commit/a5cf8b1))
* Added logging for new operations. Closes [#1491](https://github.com/ckeditor/ckeditor5-engine/issues/1491). ([5c0a34d](https://github.com/ckeditor/ckeditor5-engine/commit/5c0a34d))
* Added new OT tests, reached 100% code coverage again, fixed multiple OT scenarios, removed unreachable code. Closes [#1474](https://github.com/ckeditor/ckeditor5-engine/issues/1474). ([6c2151a](https://github.com/ckeditor/ckeditor5-engine/commit/6c2151a))
* Allowed using `Mapper` outside the conversion scope. Closes [#1415](https://github.com/ckeditor/ckeditor5-engine/issues/1415). ([6de6a00](https://github.com/ckeditor/ckeditor5-engine/commit/6de6a00))

  Huge thanks to [Mate Bartus](https://github.com/CHItA) for this contribution!
* Always update attributes of reused elements while rendering. Closes [#1560](https://github.com/ckeditor/ckeditor5-engine/issues/1560). ([9b95a8a](https://github.com/ckeditor/ckeditor5-engine/commit/9b95a8a))
* Changed long name returned by `Operation.className` property to a short one. Closes [#1513](https://github.com/ckeditor/ckeditor5-engine/issues/1513). ([7765953](https://github.com/ckeditor/ckeditor5-engine/commit/7765953))
* Made the view's `stringify()` dev util output the content of the `UIElement` (see [ckeditor/ckeditor5-media-embed#1](https://github.com/ckeditor/ckeditor5-media-embed/issues/1)). ([49cd795](https://github.com/ckeditor/ckeditor5-engine/commit/49cd795))
* Made `toJSON()` methods serialize nested objects. Closes [#1477](https://github.com/ckeditor/ckeditor5-engine/issues/1477). ([27ab310](https://github.com/ckeditor/ckeditor5-engine/commit/27ab310))

  Aligned `Schema#getValidRanges()` results to changes in `AttributeOperation`.

  Unified `RemoveOperation` and `ReinsertOperation` to have just one `MoveOperation`.

  Simplified `LiveRange#event:change` second parameter which is now an object containing `Position` not an `Operation`.
* Prevent rendering when in the `model.change()` or `model.enqueueChange()` block. Closes [#1528](https://github.com/ckeditor/ckeditor5-engine/issues/1528). ([2ef33b1](https://github.com/ckeditor/ckeditor5-engine/commit/2ef33b1))
* Renamed view `Writer` to `DowncastWriter`. Closes [#1515](https://github.com/ckeditor/ckeditor5-engine/issues/1515). ([5fd1ea5](https://github.com/ckeditor/ckeditor5-engine/commit/5fd1ea5))
* Swapped parameters order in the `DowncastWriter#rename()` method. The `DowncastWriter#remove()` method now accepts range or item. Closes [#1521](https://github.com/ckeditor/ckeditor5-engine/issues/1521). ([d289b74](https://github.com/ckeditor/ckeditor5-engine/commit/d289b74))
* The `model.insertContent()` accepts range and position. Closes [ckeditor/ckeditor5#1243](https://github.com/ckeditor/ckeditor5/issues/1243). ([bcdaaa9](https://github.com/ckeditor/ckeditor5-engine/commit/bcdaaa9))
* View post-fixer should be called once while rendering model changes. Closes [#1564](https://github.com/ckeditor/ckeditor5-engine/issues/1564). ([2f5af98](https://github.com/ckeditor/ckeditor5-engine/commit/2f5af98))

### BREAKING CHANGES

* View post-fixers are now called only a single once when rendering model changes.
* Swapped parameters order in the `DowncastWriter#rename()` method. See [#1521](https://github.com/ckeditor/ckeditor5-engine/issues/1521).
* The `src/view/writer` module was renamed to `src//view/downcastwriter`.
* `LiveRange#event:change` second parameter is now an object containing property `deletionPosition`. It can be `model.Position` instance, if the range was moved to the graveyard root. The position is equal to the position from which nodes were removed. Otherwise, it is set to `null`.
* `Schema#getValidRanges()` will now return only flat ranges. If an attribute is allowed on some nodes and in those nodes children, multiple "nested" ranges will be returned.
* `Schema#getValidRanges()` is now a generator.
* The concept of deltas (sets of operations) was removed from the engine. They were replaced by opertations matching the types of removed deltas.
* `model.Writer#setAttribute()` (and `AttributeOperation`) now applies attribute only to the top-level nodes in the `range` (instead of all the nodes in the range).


## [10.2.0](https://github.com/ckeditor/ckeditor5-engine/compare/v10.1.0...v10.2.0) (2018-07-18)

### Features

* Introduced `ViewDocument#layoutChanged` event. Closes [#1445](https://github.com/ckeditor/ckeditor5-engine/issues/1445). ([dab70e6](https://github.com/ckeditor/ckeditor5-engine/commit/dab70e6))

### Bug fixes

* Attributes were incorrectly set on an element's children during upcast. Closes [#1443](https://github.com/ckeditor/ckeditor5-engine/issues/1443). ([dfa0b39](https://github.com/ckeditor/ckeditor5-engine/commit/dfa0b39))
* Element to attribute upcast should set an attribute on all the elements inside the converted element. See [#1443](https://github.com/ckeditor/ckeditor5-engine/issues/1443). ([26673a0](https://github.com/ckeditor/ckeditor5-engine/commit/26673a0))
* Expand selection mechanism will work correctly with the inline elements. Closes [ckeditor/ckeditor5#1064](https://github.com/ckeditor/ckeditor5/issues/1064). ([e23742c](https://github.com/ckeditor/ckeditor5-engine/commit/e23742c))
* Improved selection post-fixing mechanism for selections which cross limit element boundaries. Closes [#1436](https://github.com/ckeditor/ckeditor5-engine/issues/1436). ([e0a5a0b](https://github.com/ckeditor/ckeditor5-engine/commit/e0a5a0b))

  Feature: The `schema.getLimitElement()` method now accepts also `Range` and `Position` as a parameter.


## [10.1.0](https://github.com/ckeditor/ckeditor5-engine/compare/v10.0.0...v10.1.0) (2018-06-21)

### Features

* Introduce `ElementDefinition#priority` property which allows specifying the priority of created element during the downcast conversion. Closes [#1408](https://github.com/ckeditor/ckeditor5-engine/issues/1408). ([e20e133](https://github.com/ckeditor/ckeditor5-engine/commit/e20e133))
* Introduced `ModelDocument#change:data` event. Closes [#1418](https://github.com/ckeditor/ckeditor5-engine/issues/1418). ([872f4ff](https://github.com/ckeditor/ckeditor5-engine/commit/872f4ff))
* Introduced a selection post-fixer. Its role is to ensure that after all changes are applied the selection is placed in a correct position. Closes [#1156](https://github.com/ckeditor/ckeditor5-engine/issues/1156). Closes [#1176](https://github.com/ckeditor/ckeditor5-engine/issues/1176). Closes [#1182](https://github.com/ckeditor/ckeditor5-engine/issues/1182). Closes [ckeditor/ckeditor5-table#11](https://github.com/ckeditor/ckeditor5-table/issues/11). Closes [ckeditor/ckeditor5-table#12](https://github.com/ckeditor/ckeditor5-table/issues/12). Closes [ckeditor/ckeditor5-table#15](https://github.com/ckeditor/ckeditor5-table/issues/15). Closes [ckeditor/ckeditor5#562](https://github.com/ckeditor/ckeditor5/issues/562). Closes [ckeditor/ckeditor5#611](https://github.com/ckeditor/ckeditor5/issues/611). ([6cf91a1](https://github.com/ckeditor/ckeditor5-engine/commit/6cf91a1))

### Bug fixes

* Block filler will be inserted into the container if its last child is a `<br>` element. Closes [#1422](https://github.com/ckeditor/ckeditor5-engine/issues/1422). ([ba3d641](https://github.com/ckeditor/ckeditor5-engine/commit/ba3d641))
* Fixed view <-> DOM conversion of whitespaces around `<br>` elements. Closes [ckeditor/ckeditor5#1024](https://github.com/ckeditor/ckeditor5/issues/1024). ([3e74554](https://github.com/ckeditor/ckeditor5-engine/commit/3e74554))
* Renderer should avoid doing unnecessary DOM structure changes. Ensuring that the DOM gets updated less frequently fixes many issues with text composition. Closes [#1417](https://github.com/ckeditor/ckeditor5-engine/issues/1417). Closes [#1409](https://github.com/ckeditor/ckeditor5-engine/issues/1409). Closes [#1349](https://github.com/ckeditor/ckeditor5-engine/issues/1349). Closes [#1334](https://github.com/ckeditor/ckeditor5-engine/issues/1334). Closes [#898](https://github.com/ckeditor/ckeditor5-engine/issues/898). Closes [ckeditor/ckeditor5-typing#129](https://github.com/ckeditor/ckeditor5-typing/issues/129). Closes [ckeditor/ckeditor5-typing#89](https://github.com/ckeditor/ckeditor5-typing/issues/89). Closes [#1427](https://github.com/ckeditor/ckeditor5-engine/issues/1427). ([457afde](https://github.com/ckeditor/ckeditor5-engine/commit/457afde))

### Other changes

* Renderer now uses partial text replacing when updating text nodes instead of replacing entire nodes. Closes [#403](https://github.com/ckeditor/ckeditor5-engine/issues/403). ([797cd97](https://github.com/ckeditor/ckeditor5-engine/commit/797cd97))


## [10.0.0](https://github.com/ckeditor/ckeditor5-engine/compare/v1.0.0-beta.4...v10.0.0) (2018-04-25)

### Other changes

* Changed the license to GPL2+ only. See [ckeditor/ckeditor5#991](https://github.com/ckeditor/ckeditor5/issues/991). ([af46d16](https://github.com/ckeditor/ckeditor5-engine/commit/af46d16))

### BREAKING CHANGES

* The license under which CKEditor&nbsp;5 is released has been changed from a triple GPL, LGPL and MPL license to a GPL2+ only. See [ckeditor/ckeditor5#991](https://github.com/ckeditor/ckeditor5/issues/991) for more information.


## [1.0.0-beta.4](https://github.com/ckeditor/ckeditor5-engine/compare/v1.0.0-beta.2...v1.0.0-beta.4) (2018-04-19)

### Bug fixes

* `model.Differ` should handle attribute change transformation correctly. Closes [#1404](https://github.com/ckeditor/ckeditor5-engine/issues/1404). ([3769a02](https://github.com/ckeditor/ckeditor5-engine/commit/3769a02))
* `view.Writer` should deeply add and remove `view.AttributeElement`s to/from their clone groups. Closes [#1401](https://github.com/ckeditor/ckeditor5-engine/issues/1401). ([e6bb59b](https://github.com/ckeditor/ckeditor5-engine/commit/e6bb59b))
* The `bindTwoStepCaretToAttribute()` behavioral helper should not fail in more complex cases. Closes [#1301](https://github.com/ckeditor/ckeditor5-engine/issues/1301). Closes [#1346](https://github.com/ckeditor/ckeditor5-engine/issues/1346). Closes [ckeditor/ckeditor5#937](https://github.com/ckeditor/ckeditor5/issues/937).  Closes [ckeditor/ckeditor5#922](https://github.com/ckeditor/ckeditor5/issues/922).  Closes [ckeditor/ckeditor5#946](https://github.com/ckeditor/ckeditor5/issues/946). ([f0fd2d8](https://github.com/ckeditor/ckeditor5-engine/commit/f0fd2d8))


## [1.0.0-beta.2](https://github.com/ckeditor/ckeditor5-engine/compare/v1.0.0-beta.1...v1.0.0-beta.2) (2018-04-10)

### Features

* Introduced `writer#updateMarker()` method. Closes [#1299](https://github.com/ckeditor/ckeditor5-engine/issues/1299). ([bed647f](https://github.com/ckeditor/ckeditor5-engine/commit/bed647f))
* Introduced `#isBefore` and `#isAfter` in `model.Node` and `view.Node`. Additionally, `model.Node#is()` and `view.Node#is()` and `view.Node#getPath()` were added. Closes [#1365](https://github.com/ckeditor/ckeditor5-engine/issues/1365). ([4c38683](https://github.com/ckeditor/ckeditor5-engine/commit/4c38683))

### Bug fixes

* `model.Differ` should not throw when multiple, intersecting remove changes were buffered. Closes [#1392](https://github.com/ckeditor/ckeditor5-engine/issues/1392). ([3a348fd](https://github.com/ckeditor/ckeditor5-engine/commit/3a348fd))
* `model.Range#getTransformedByDelta` should not crash for `MoveDelta` which moves no nodes. Closes [#1358](https://github.com/ckeditor/ckeditor5-engine/issues/1358). ([ff8ba9e](https://github.com/ckeditor/ckeditor5-engine/commit/ff8ba9e))
* `conversion.downcast-converters.changeAttribute` should not consume if element creators returned null. Closes [#1369](https://github.com/ckeditor/ckeditor5-engine/issues/1369). ([6866256](https://github.com/ckeditor/ckeditor5-engine/commit/6866256))
* `conversion.downcast-converters.downcastAttributeToElement` should let specify from what element the model attribute will be converted. Closes [#1370](https://github.com/ckeditor/ckeditor5-engine/issues/1370). ([f8dec1e](https://github.com/ckeditor/ckeditor5-engine/commit/f8dec1e))

### Other changes

* Increased the specificity of CSS rules. Introduced the `.ck` class for editor UI components (see: [ckeditor/ckeditor5#494](https://github.com/ckeditor/ckeditor5/issues/494)). ([6bf32c0](https://github.com/ckeditor/ckeditor5-engine/commit/6bf32c0))
* Refactored how markers removal is converted from the model to the view. Closes [#1226](https://github.com/ckeditor/ckeditor5-engine/issues/1226). ([f6de5f5](https://github.com/ckeditor/ckeditor5-engine/commit/f6de5f5))
* Removed the unnecessary `model.Writer#setTextData()` method. Closes [#1363](https://github.com/ckeditor/ckeditor5-engine/issues/1363). ([b484822](https://github.com/ckeditor/ckeditor5-engine/commit/b484822))
* Renamed plural method names to singular and singular attribute names to plural. See [ckeditor/ckeditor5#742](https://github.com/ckeditor/ckeditor5/issues/742). ([9465c82](https://github.com/ckeditor/ckeditor5-engine/commit/9465c82))
* View selection is now split onto Selection and DocumentSelection. Closes [#1304](https://github.com/ckeditor/ckeditor5-engine/issues/1304) . ([b466e3f](https://github.com/ckeditor/ckeditor5-engine/commit/b466e3f))

### BREAKING CHANGES

* The `writer#setMarker()` method is used only to create a new marker and it does not accept a `marker` instance as a parameter. To update existing marker use `writer#updateMarker()` method.
* The `options.usingOperation` option in `writer#setMarker()` is now a required one.
* The `range` parameter was removed. Use `options.range` instead.
* Properties in `MatcherPattern`, view `ElementDefinition` and options for conversion utils have been renamed: `class` to `classes`, `style` to `styles`, `attribute` to `attributes`.
* Introduced `view.DocumentSelection`. It has protected API and can be modified only by the view writer. Observers creating instance of selection (like `SelectionObserver`, `MutationObserver`) use the `view.Selection` class now.


## [1.0.0-beta.1](https://github.com/ckeditor/ckeditor5-engine/compare/v1.0.0-alpha.2...v1.0.0-beta.1) (2018-03-15)

### Major refactoring

In 1.0.0-beta.1 the engine's API has underwent a thorough review which resulted in a deep refactoring. Most of the underlying concepts and architecture remained untouched. The API, though, is brand new. The changes are huge and, in this package exclusively, resulted in changing 40.000 LOC. Therefore, the list of changes below is neither complete nor will explain you how the engine is structured now and how to should migrate to this version.

Instead, we recommend reading https://ckeditor.com/docs/ckeditor5/latest/framework/guides/architecture/editing-engine.html once more (it will be updated in a couple of days after the release).

The good news is that the our focus when designing the new API was on developer experience. APIs which were dangerous or confusing were removed or hidden and new APIs were added in their place. The engine is now safer and more useful library and we hope you'll enjoy it :).

### Features

* Add support for the `'word'` unit in the `modifySelection()` helper. ([f37a97a](https://github.com/ckeditor/ckeditor5-engine/commit/f37a97a))
* Allowed passing `true` as `view.Matcher`'s attribute match to check if that attribute is set. Closes [#1239](https://github.com/ckeditor/ckeditor5-engine/issues/1239). ([bc1c3e5](https://github.com/ckeditor/ckeditor5-engine/commit/bc1c3e5))
* Consumable type name is now normalized inside `conversion.ModelConsumable` methods. Closes [#1214](https://github.com/ckeditor/ckeditor5-engine/issues/1214). ([131e9c8](https://github.com/ckeditor/ckeditor5-engine/commit/131e9c8))
* Convert view to model using position. Closes [#1213](https://github.com/ckeditor/ckeditor5-engine/issues/1213). Closes [#1250](https://github.com/ckeditor/ckeditor5-engine/issues/1250). ([1961395](https://github.com/ckeditor/ckeditor5-engine/commit/1961395))

  Feature: `Schema#findAllowedParent()` has been introduced.
  Feature: `SchemaContext#concat()` has been introduced.
* Engine debug tools can be easily disabled using disableEngineDebug() function. Closes [#1193](https://github.com/ckeditor/ckeditor5-engine/issues/1193). ([0934496](https://github.com/ckeditor/ckeditor5-engine/commit/0934496))
* Introduced `ViewElementDefinition` and `definition-based-converters` module with a set of utils allowing to turn element definitions to converters. Closes [#1198](https://github.com/ckeditor/ckeditor5-engine/issues/1198). ([d2e9f06](https://github.com/ckeditor/ckeditor5-engine/commit/d2e9f06))
* Introduced composition observer. Closes [#1329](https://github.com/ckeditor/ckeditor5-engine/issues/1329). ([a0ad8fe](https://github.com/ckeditor/ckeditor5-engine/commit/a0ad8fe))
* Introduced decorable DataController#init metohd. Closes [ckeditor/ckeditor5-core#120](https://github.com/ckeditor/ckeditor5-core/issues/120). ([d20d660](https://github.com/ckeditor/ckeditor5-engine/commit/d20d660))
* Introduced two-step caret movement mechanism. Closes [#1289](https://github.com/ckeditor/ckeditor5-engine/issues/1289). ([88bb94c](https://github.com/ckeditor/ckeditor5-engine/commit/88bb94c))

### Bug fixes

* [Firefox] Added fix for typing space on the edge of inline elements. Closes [ckeditor/ckeditor5#692](https://github.com/ckeditor/ckeditor5/issues/692). ([3ea70f3](https://github.com/ckeditor/ckeditor5-engine/commit/3ea70f3))
* `DocumenSelection#change:range` event will be fired only once after multiple selection live ranges have changed. Closes [#1281](https://github.com/ckeditor/ckeditor5-engine/issues/1281). ([b26935c](https://github.com/ckeditor/ckeditor5-engine/commit/b26935c))
* `model.DocumentSelection` should update it's attributes after each change, including external changes. Closes [#1267](https://github.com/ckeditor/ckeditor5-engine/issues/1267). ([b91d967](https://github.com/ckeditor/ckeditor5-engine/commit/b91d967))
* `Model#insertContent()` will not merge nodes if the model after the merge would violate schema rules. Closes [ckeditor/ckeditor5#730](https://github.com/ckeditor/ckeditor5/issues/730). ([2a73830](https://github.com/ckeditor/ckeditor5-engine/commit/2a73830))
* `Schema#getLimitElement()` will return a proper limit element (the root element) if one of the selection's ranges have the root element as the limit element. Closes [#1275](https://github.com/ckeditor/ckeditor5-engine/issues/1275). ([050a415](https://github.com/ckeditor/ckeditor5-engine/commit/050a415))
* Added a 50ms timeout after `Document#focus` event before rendering to be sure that selection changes are processed on Firefox and Safari. Closes [ckeditor/ckeditor5#676](https://github.com/ckeditor/ckeditor5/issues/676). Closes [#1157](https://github.com/ckeditor/ckeditor5-engine/issues/1157). Closes [#1155](https://github.com/ckeditor/ckeditor5-engine/issues/1155). Closes [#1153](https://github.com/ckeditor/ckeditor5-engine/issues/1153). ([aba8e68](https://github.com/ckeditor/ckeditor5-engine/commit/aba8e68))
* Added missing parse context in `DataController#set()`. Closes [#1278](https://github.com/ckeditor/ckeditor5-engine/issues/1278). ([8c56dce](https://github.com/ckeditor/ckeditor5-engine/commit/8c56dce))
* Corrected how change items in `model.Differ` are dismissed if they are in inserted/removed parent. Closes https://github.com/ckeditor/ckeditor5/issues/733. ([e70ab96](https://github.com/ckeditor/ckeditor5-engine/commit/e70ab96))
* Corrected offsets transformation in `model.Differ` when multiple change items interfere with each other. Closes [#1309](https://github.com/ckeditor/ckeditor5-engine/issues/1309). Closes https://github.com/ckeditor/ckeditor5/issues/849. ([30dcf6c](https://github.com/ckeditor/ckeditor5-engine/commit/30dcf6c))
* Fixed a bug where Firefox would throw an `NS_ERROR_FAILURE` error when moving selection from a nested editable to the root editable. Closes [ckeditor/ckeditor5#721](https://github.com/ckeditor/ckeditor5/issues/721). ([4b7d435](https://github.com/ckeditor/ckeditor5-engine/commit/4b7d435))
* Fixed memory leak in `DocumentSelection`. Closes [#903](https://github.com/ckeditor/ckeditor5-engine/issues/903). ([7e352e3](https://github.com/ckeditor/ckeditor5-engine/commit/7e352e3))
* Improved how `model.Differ` checks whether the operation should be buffered or not. Closes [#1326](https://github.com/ckeditor/ckeditor5-engine/issues/1326). ([3e9f81b](https://github.com/ckeditor/ckeditor5-engine/commit/3e9f81b))
* It should not be possible to move a `model.Node` from a `model.Document` to a `model.DocumentFragment`. Closes [#1337](https://github.com/ckeditor/ckeditor5-engine/issues/1337). ([24b97f5](https://github.com/ckeditor/ckeditor5-engine/commit/24b97f5))
* Registered $marker element in Schema. Closes [#1317](https://github.com/ckeditor/ckeditor5-engine/issues/1317). ([2d1d62f](https://github.com/ckeditor/ckeditor5-engine/commit/2d1d62f))
* The fake selection container will not leak into the viewport. Closes [ckeditor/ckeditor5#752](https://github.com/ckeditor/ckeditor5/issues/752). ([3f059a7](https://github.com/ckeditor/ckeditor5-engine/commit/3f059a7))
* View stringify utility now sorts CSS classes and values in `style` attribute. Closes [#1179](https://github.com/ckeditor/ckeditor5-engine/issues/1179). ([fc7da80](https://github.com/ckeditor/ckeditor5-engine/commit/fc7da80))

### Other changes

* Cleaned up the model, document and controllers API. Closes [#1208](https://github.com/ckeditor/ckeditor5-engine/issues/1208). ([aea6119](https://github.com/ckeditor/ckeditor5-engine/commit/aea6119))
* Conversion utilities refactor. Closes [#1236](https://github.com/ckeditor/ckeditor5-engine/issues/1236). ([fd128a1](https://github.com/ckeditor/ckeditor5-engine/commit/fd128a1))
* Fixed `render()` and `change()` methods flow. Introduced post-fixers in the view. Closes [#1312](https://github.com/ckeditor/ckeditor5-engine/issues/1312). ([63b9d14](https://github.com/ckeditor/ckeditor5-engine/commit/63b9d14))
* Introduced several improvements to conversion helpers. Closes [#1295](https://github.com/ckeditor/ckeditor5-engine/issues/1295). Closes [#1293](https://github.com/ckeditor/ckeditor5-engine/issues/1293). Closes [#1292](https://github.com/ckeditor/ckeditor5-engine/issues/1292). Closes [#1291](https://github.com/ckeditor/ckeditor5-engine/issues/1291). Closes [#1290](https://github.com/ckeditor/ckeditor5-engine/issues/1290). Closes [#1305](https://github.com/ckeditor/ckeditor5-engine/issues/1305). ([809ea24](https://github.com/ckeditor/ckeditor5-engine/commit/809ea24))
* Keep the same marker instance when marker is updated. ([8eba5e9](https://github.com/ckeditor/ckeditor5-engine/commit/8eba5e9))
* Make `Position` and `Range` immutable in model and view. Closes [#897](https://github.com/ckeditor/ckeditor5-engine/issues/897). ([836dfd8](https://github.com/ckeditor/ckeditor5-engine/commit/836dfd8))
* Manual test for [#475](https://github.com/ckeditor/ckeditor5-engine/issues/475) now works correctly. Closes [#1271](https://github.com/ckeditor/ckeditor5-engine/issues/1271). ([c2d4cec](https://github.com/ckeditor/ckeditor5-engine/commit/c2d4cec))
* Methods which modify the model's and view's tree are now protected and shouldn't be used directly in the code. Iinstance of `Writer` should be used instead. Closes [#738](https://github.com/ckeditor/ckeditor5-engine/issues/738). ([a4f3dad](https://github.com/ckeditor/ckeditor5-engine/commit/a4f3dad))
* Migrated package styles to PostCSS. Moved visual styles to ckeditor5-theme-lark (see [ckeditor/ckeditor5-ui#144](https://github.com/ckeditor/ckeditor5-ui/issues/144)). ([5f65823](https://github.com/ckeditor/ckeditor5-engine/commit/5f65823))
* Moved `consumable` parameter to `conversionApi` parameter in downcast. Closes [#1294](https://github.com/ckeditor/ckeditor5-engine/issues/1294). Closes [#1261](https://github.com/ckeditor/ckeditor5-engine/issues/1261). ([731db37](https://github.com/ckeditor/ckeditor5-engine/commit/731db37))
* Moved `Document#getNearesetSelectionRange` to `Schema`. Closes [#1227](https://github.com/ckeditor/ckeditor5-engine/issues/1227). ([d1838a4](https://github.com/ckeditor/ckeditor5-engine/commit/d1838a4))
* Moved selection methods to `Writer`, introduced `LiveSelection`. Closes [#1209](https://github.com/ckeditor/ckeditor5-engine/issues/1209). ([7db1fee](https://github.com/ckeditor/ckeditor5-engine/commit/7db1fee))
* Operations that do not operate on a document should have `baseVersion` set to `null`. Closes [#1211](https://github.com/ckeditor/ckeditor5-engine/issues/1211). ([b527d7f](https://github.com/ckeditor/ckeditor5-engine/commit/b527d7f))

  Fixed: Markers again are properly converted in `engine.controller.DataController`.
  Fixed: Markers are cleared now before an operation is applied to `model.Document` tree to fix scenarios where marker range could not be converted to the view after the model changed.
* Prevented `Writer` from usage outside of the `change` block. Closes [#1212](https://github.com/ckeditor/ckeditor5-engine/issues/1212). ([2592bf1](https://github.com/ckeditor/ckeditor5-engine/commit/2592bf1))
* Provided one API for two types of markers, improved docs. Closes [#1086](https://github.com/ckeditor/ckeditor5-engine/issues/1086). ([bfe23c9](https://github.com/ckeditor/ckeditor5-engine/commit/bfe23c9))
* Refactor: engine/model reorganization, introducing new change and enqueueChange block, split batch/writer. Related: [#1186](https://github.com/ckeditor/ckeditor5-engine/issues/1186). ([5be1ad6](https://github.com/ckeditor/ckeditor5-engine/commit/5be1ad6))
* Refactored events fired by model classes. Closes [#1207](https://github.com/ckeditor/ckeditor5-engine/issues/1207). ([f56bddf](https://github.com/ckeditor/ckeditor5-engine/commit/f56bddf))
* Refactoring of the view API. Closes [#1210](https://github.com/ckeditor/ckeditor5-engine/issues/1210). ([dd9ae51](https://github.com/ckeditor/ckeditor5-engine/commit/dd9ae51))
* Refactoring: Conversion refactoring. Introduced `model.Differ`. Changes now will be converted after all changes in a change block are done. Closes [#1172](https://github.com/ckeditor/ckeditor5-engine/issues/1172). ([6479bfd](https://github.com/ckeditor/ckeditor5-engine/commit/6479bfd))
* Refactoring: make writer a protected operations util. ([440dfc7](https://github.com/ckeditor/ckeditor5-engine/commit/440dfc7))
* Rewritten the Schema API. Closes [#532](https://github.com/ckeditor/ckeditor5-engine/issues/532). ([4e4f5c3](https://github.com/ckeditor/ckeditor5-engine/commit/4e4f5c3))
* Simplified model to view selection conversion. Closes [#1238](https://github.com/ckeditor/ckeditor5-engine/issues/1238). ([9a53251](https://github.com/ckeditor/ckeditor5-engine/commit/9a53251))
* UIElement custom `render()` method can be now provided without using inheritance. Closes [#1254](https://github.com/ckeditor/ckeditor5-engine/issues/1254). ([e05b8b1](https://github.com/ckeditor/ckeditor5-engine/commit/e05b8b1))

### BREAKING CHANGES

* **Note:** See the "Major refactoring" section above.
* `view.Writer` is no longer an object literal with functions but a class.
* Introduced new method of creating custom UIElements.
* View document is now separated from the DOM. `view.Renderer`, `view.DomConverter` and observers are moved to `view.View`.
* `view#event:render` is introduced to indicate a moment when all changes are applied and document may be rendered to the DOM.
* Downcast converter helpers no longer accepts view elements instances as constructors are now protected. Callbacks using view writer should be used.
* Writer should be now used to set or remove markers, instead of MarkerCollection.
* View controller `view.View` is introduced. Changes to the view document tree structure should be done by using writer provided to callback in `view.change()` method.
* `ViewConversionApi#splitToAllowedParent` has been introduced.
* `ViewConversionApi#storage` has been introduced.
* `ViewConsumable` has been merged to `ViewConversionApi`.
* Format od data object passed across conversion callback has been changed.
Feature: `Schema#findAllowedParent` has been introduced.
Feature: `SchemaContext#concat` has been introduced.
* `DataController#parse`, `DataController#toModel`, `ViewConversionDispatcher#convert` gets `SchemaContextDefinition` as a context instead of `String`.


## [1.0.0-alpha.2](https://github.com/ckeditor/ckeditor5-engine/compare/v1.0.0-alpha.1...v1.0.0-alpha.2) (2017-11-14)

### Bug fixes

* `model.Range` will now be extended if it was collapsed and it was transformed by insertion. Closes [#1159](https://github.com/ckeditor/ckeditor5-engine/issues/1159). ([5f020b0](https://github.com/ckeditor/ckeditor5-engine/commit/5f020b0))
* Prevent adding inline filler to non-editable content. Closes [#1170](https://github.com/ckeditor/ckeditor5-engine/issues/1170). ([07a01b1](https://github.com/ckeditor/ckeditor5-engine/commit/07a01b1))
* The `deleteContent()` algorithm will use merging to "remove" empty element which will ensure a better conflict resolution on collaborative editing. Closes [#1161](https://github.com/ckeditor/ckeditor5-engine/issues/1161). ([0dd29d4](https://github.com/ckeditor/ckeditor5-engine/commit/0dd29d4))

### Other changes

* Removed the `renderer-skipped-selection-rendering` warning since it doesn't bring any value. Closes [#1158](https://github.com/ckeditor/ckeditor5-engine/issues/1158). ([4a5a5d1](https://github.com/ckeditor/ckeditor5-engine/commit/4a5a5d1))
* The `removeHighlight()` function now accepts descriptor id instead of a `HighlightDescriptor` object. Closes [#1164](https://github.com/ckeditor/ckeditor5-engine/issues/1164). ([7bde6f7](https://github.com/ckeditor/ckeditor5-engine/commit/7bde6f7))


## [1.0.0-alpha.1](https://github.com/ckeditor/ckeditor5-engine/compare/v0.11.0...v1.0.0-alpha.1) (2017-10-03)

### Bug fixes

* `model.Range` will now be correctly transformed if it was at the end of a split element. Instead of sticking to the old element, it will be moved to the end of the new element. Closes [#1142](https://github.com/ckeditor/ckeditor5-engine/issues/1142). ([1be7ed1](https://github.com/ckeditor/ckeditor5-engine/commit/1be7ed1))
* Fixed a bug in `Range#getTransformedByDelta()` that caused editor to crash after some `MergeDelta`s were transformed. Closes [#1132](https://github.com/ckeditor/ckeditor5-engine/issues/1132). ([97a4f4b](https://github.com/ckeditor/ckeditor5-engine/commit/97a4f4b))
* Fixed a bug when a block quote could not be applied to an empty paragraph with a basic style (bold, etc.) active in it. Closes [#1127](https://github.com/ckeditor/ckeditor5-engine/issues/1127). ([6d33b9f](https://github.com/ckeditor/ckeditor5-engine/commit/6d33b9f))
* Fixed a bug when editor crashed during `MergeDelta` transformation in a specific case. Closes [#1103](https://github.com/ckeditor/ckeditor5-engine/issues/1103). ([ef1b07e](https://github.com/ckeditor/ckeditor5-engine/commit/ef1b07e))
* Spaces inside `<code>` will be rendered in a normal way (previously `DomConverter` tried to treat `<code>` like a preformatted block which is not what HTML needs). Closes [#1126](https://github.com/ckeditor/ckeditor5-engine/issues/1126). ([88630b7](https://github.com/ckeditor/ckeditor5-engine/commit/88630b7))
* Fixed a bug when undo did no changes instead of merging elements, in a scenario when an element was split and then the "new" element was removed. See https://github.com/ckeditor/ckeditor5-undo/issues/65#issuecomment-323682195. ([60024c0](https://github.com/ckeditor/ckeditor5-engine/commit/60024c0))
* View and model nodes will now be removed from their old parents when they are added to a new parent to prevent having same node on multiple elements' children lists. Closes [#1139](https://github.com/ckeditor/ckeditor5-engine/issues/1139). ([dec9c28](https://github.com/ckeditor/ckeditor5-engine/commit/dec9c28))

### Features

* Introduced `model.DocumentSelection#hasOwnRange` property. Closes [#1137](https://github.com/ckeditor/ckeditor5-engine/issues/1137). ([4feb678](https://github.com/ckeditor/ckeditor5-engine/commit/4feb678))
* Introduced `Schema#removeDisallowedAttributes()` method to filter out disallowed attributes from given nodes. Closes [#1120](https://github.com/ckeditor/ckeditor5-engine/issues/1120). ([d776c71](https://github.com/ckeditor/ckeditor5-engine/commit/d776c71))

### BREAKING CHANGES

* View and model nodes are now automatically removed from their old parents when they are inserted into new elements. This is important e.g. if you iterate through element's children and they are moved during that iteration. In that case, it's safest to cache the element's children in an array.


## [0.11.0](https://github.com/ckeditor/ckeditor5-engine/compare/v0.10.0...v0.11.0) (2017-09-03)

### Bug fixes

* [Firefox] Prevented setting incorrect initial selection when placeholder was clicked. See ckeditor/ckeditor5#469. ([34498a8](https://github.com/ckeditor/ckeditor5-engine/commit/34498a8))
* `AttributeElement`s created by selection conversion were not merged with `AttributeElement`s created by markers conversion. Closes [#1117](https://github.com/ckeditor/ckeditor5-engine/issues/1117). ([e6c5bcf](https://github.com/ckeditor/ckeditor5-engine/commit/e6c5bcf))
* `DataController#insertContent()` and `DataController#deleteContent()` should strip disallowed attributes from text nodes. Closes [#1088](https://github.com/ckeditor/ckeditor5-engine/issues/1088). ([df83343](https://github.com/ckeditor/ckeditor5-engine/commit/df83343))
* `DomConverter` should actively prevent unwanted scrolling on focus. Closes [#951](https://github.com/ckeditor/ckeditor5-engine/issues/951). Closes [#707](https://github.com/ckeditor/ckeditor5-engine/issues/707). Closes [#706](https://github.com/ckeditor/ckeditor5-engine/issues/706). ([cb18a95](https://github.com/ckeditor/ckeditor5-engine/commit/cb18a95))
* `LiveSelection` will correctly set its properties in case of a non-collapsed default range. This will fix loading data which starts with an object element. Closes [#699](https://github.com/ckeditor/ckeditor5-engine/issues/699). ([e6e92e9](https://github.com/ckeditor/ckeditor5-engine/commit/e6e92e9))
* `LiveSelection` will not read attributes from object element's children. Closes [#986](https://github.com/ckeditor/ckeditor5-engine/issues/986). ([93639d0](https://github.com/ckeditor/ckeditor5-engine/commit/93639d0))
* `MarkerDelta` transformation should no longer cause editor to crash, if a `MarkerOperation` had `null` as it's `oldRange` or `newRange`. Closes [#943](https://github.com/ckeditor/ckeditor5-engine/issues/943). ([d328811](https://github.com/ckeditor/ckeditor5-engine/commit/d328811))
* `model.Element#getNodeByPath()` and `model.DocumentFragment#getNodeByPath()` should work with offsets not indexes (because path is an array of offsets). Closes [#1009](https://github.com/ckeditor/ckeditor5-engine/issues/1009). ([331d2f4](https://github.com/ckeditor/ckeditor5-engine/commit/331d2f4))
* `Schema.checkAttributeInSelection` should use element's existing attributes when querying schema. Closes [#1110](https://github.com/ckeditor/ckeditor5-engine/issues/1110). ([25ef1a8](https://github.com/ckeditor/ckeditor5-engine/commit/25ef1a8))
* `view.Range#getTrimmed()` was returning incorrect ranges in some cases. Fixes [#1058](https://github.com/ckeditor/ckeditor5-engine/issues/1058). ([d99c568](https://github.com/ckeditor/ckeditor5-engine/commit/d99c568))
* `AttributeElement` with bogus `<br />` will now be placed after all UI elements which will fix how those elements are rendered. Closes [#1072](https://github.com/ckeditor/ckeditor5-engine/issues/1072). ([43b6ea9](https://github.com/ckeditor/ckeditor5-engine/commit/43b6ea9))
* Editor will no longer crash when `ReinsertOperation` is transformed by a specific `RemoveOperation`. Closes [#946](https://github.com/ckeditor/ckeditor5-engine/issues/946). ([6875eff](https://github.com/ckeditor/ckeditor5-engine/commit/6875eff))
* Fixed a bug when `SplitDelta` transformation might cause undo to throw an error in some cases. Closes [#1084](https://github.com/ckeditor/ckeditor5-engine/issues/1084). ([cb9d409](https://github.com/ckeditor/ckeditor5-engine/commit/cb9d409))
* Fixed incorrect markers transformations and conversions. Closes [#1112](https://github.com/ckeditor/ckeditor5-engine/issues/1112). Closes [#1080](https://github.com/ckeditor/ckeditor5-engine/issues/1080). Closes [#1079](https://github.com/ckeditor/ckeditor5-engine/issues/1079). ([b71adfb](https://github.com/ckeditor/ckeditor5-engine/commit/b71adfb))
* Multiple spaces in an empty paragraph are now allowed. Closes ckeditor/ckeditor5-typing[#101](https://github.com/ckeditor/ckeditor5-engine/issues/101). ([9ca61d5](https://github.com/ckeditor/ckeditor5-engine/commit/9ca61d5))
* Mutation observer will ignore children mutations if as a result of several native mutations the element's children haven't changed. Closes [#1031](https://github.com/ckeditor/ckeditor5-engine/issues/1031). ([552198e](https://github.com/ckeditor/ckeditor5-engine/commit/552198e))
* None of the editable's ancestors should scroll when the `DomConverter` focuses an editable. Closes [#957](https://github.com/ckeditor/ckeditor5-engine/issues/957). ([e3bc4d1](https://github.com/ckeditor/ckeditor5-engine/commit/e3bc4d1))
* Placeholder text now will not be hidden if the element has only ui elements. Closes [#1018](https://github.com/ckeditor/ckeditor5-engine/issues/1018). ([299628b](https://github.com/ckeditor/ckeditor5-engine/commit/299628b))
* Prevent unbinding elements that are reused during rendering. Closes [#922](https://github.com/ckeditor/ckeditor5-engine/issues/922). ([88fcdcb](https://github.com/ckeditor/ckeditor5-engine/commit/88fcdcb))
* Prevented editor throwing during `SplitDelta` x `RemoveDelta` transformation when SplitDelta's first operation was neither InsertOperation nor ReinsertOperation. Closes [#1065](https://github.com/ckeditor/ckeditor5-engine/issues/1065). ([85e38e1](https://github.com/ckeditor/ckeditor5-engine/commit/85e38e1))

* Fixed remove model-to-view converter for some edge cases. Closes [#1068](https://github.com/ckeditor/ckeditor5-engine/issues/1068).
* Singular white spaces (new lines, tabs and carriage returns) will be ignored when loading data when used outside/between block elements. Closes [#822](https://github.com/ckeditor/ckeditor5-engine/issues/822). ([4c9a0af](https://github.com/ckeditor/ckeditor5-engine/commit/4c9a0af))

  Also, the range of characters which are being normalized during DOM to view conversion was reduced to `[ \n\t\r]` to avoid losing space characters (which matches `/\s/`) that could be significant.
* Splitting paragraph twice in the same position will now be undoable. Also fixed SplitDelta x SplitDelta transformation. Closes [#1096](https://github.com/ckeditor/ckeditor5-engine/issues/1096). Closes [#1097](https://github.com/ckeditor/ckeditor5-engine/issues/1097). ([b7cc243](https://github.com/ckeditor/ckeditor5-engine/commit/b7cc243))
* Writer will create a consistent hierarchy for attribute elements with same priorities. Introduced viewElement.getIdentity() method. Closes [#1060](https://github.com/ckeditor/ckeditor5-engine/issues/1060). ([85c96ef](https://github.com/ckeditor/ckeditor5-engine/commit/85c96ef))
* Selection attributes should be cleared in an `enqueueChanges()` block. Fixed also a bug concerning `AttributeDelta` x `SplitDelta` transformation. Closes [#1055](https://github.com/ckeditor/ckeditor5-engine/issues/1055). ([ed1b7e7](https://github.com/ckeditor/ckeditor5-engine/commit/ed1b7e7))
* Fixed a bug when additional list item has been created when undoing applying block quote to a list followed by splitting list item in that list. Closes [#1053](https://github.com/ckeditor/ckeditor5-engine/issues/1053). ([a6c6167](https://github.com/ckeditor/ckeditor5-engine/commit/a6c6167))
* Fixed a bug when renaming followed by merge or split resulted in multiple elements being incorrectly renamed during undo. Closes [#1051](https://github.com/ckeditor/ckeditor5-engine/issues/#1051). ([033e850](https://github.com/ckeditor/ckeditor5-engine/commit/033e850))
* If a new position of `DocumentSelection` cannot be calculated after the content in which the selection was located was removed from the document, the position of the selection should use the "default selection" so it does not end up in disallowed places. Closes [#1046](https://github.com/ckeditor/ckeditor5-engine/issues/#1046). ([9f7e0a2](https://github.com/ckeditor/ckeditor5-engine/commit/9f7e0a2))
* Block filler was rendered before UI elements, interfering with their positioning. Now it will be properly rendered at the end of an element. Closes [#1021](https://github.com/ckeditor/ckeditor5-engine/issues/#1021). ([7c014f7](https://github.com/ckeditor/ckeditor5-engine/commit/7c014f7))
* Live ranges and markers, that are at the end of an element, are now correctly transformed when they are split. Closes [#1006](https://github.com/ckeditor/ckeditor5-engine/issues/#1006). ([690f32c](https://github.com/ckeditor/ckeditor5-engine/commit/690f32c))

### Features

* `DataController#deleteContent()` will leave a paragraph if the entire content was selected. Closes [#1012](https://github.com/ckeditor/ckeditor5-engine/issues/1012). ([17e70c3](https://github.com/ckeditor/ckeditor5-engine/commit/17e70c3))

  On the occasion `$root` element has been marked as a limit element in `Schema` in order to simplify the checks.
* `model.LiveRange#event:change` got renamed to `change:range`. Introduced `model.LiveRange#event:change:content`. Closes [#1089](https://github.com/ckeditor/ckeditor5-engine/issues/1089). ([ec22a29](https://github.com/ckeditor/ckeditor5-engine/commit/ec22a29))
* `model.LiveRange#event:change` now contains `data.batch` instance which changed the range. Closes [#1076](https://github.com/ckeditor/ckeditor5-engine/issues/1076). ([c6f5e9f](https://github.com/ckeditor/ckeditor5-engine/commit/c6f5e9f))
* Enhanced `Selection#setTo()`, introduced `Selection#setIn()`, `Selection#setOn()`, `Range.createCollapsedAt()` and renamed few existing `Selection` methods for both model and view. Closes [#1074](https://github.com/ckeditor/ckeditor5-engine/issues/1074). ([070c313](https://github.com/ckeditor/ckeditor5-engine/commit/070c313))
* Hide the caret when the editor is read-only. `EditingControler` is observable from now. Observable property `isReadOnly` was added to the `ViewDocument` and `EditingController`. Closes [#1024](https://github.com/ckeditor/ckeditor5-engine/issues/1024). Closes ckeditor/ckeditor5[#503](https://github.com/ckeditor/ckeditor5-engine/issues/503). ([e8fd17d](https://github.com/ckeditor/ckeditor5-engine/commit/e8fd17d))
* Highlights on text nodes will be now unwrapped basing on descriptor id (which by default is marker name). Closes [#1108](https://github.com/ckeditor/ckeditor5-engine/issues/1108). ([885901f](https://github.com/ckeditor/ckeditor5-engine/commit/885901f))
* Implemented `view.Document#scrollToTheSelection()` method. Closes [#660](https://github.com/ckeditor/ckeditor5-engine/issues/660). ([4479c40](https://github.com/ckeditor/ckeditor5-engine/commit/4479c40))
* Introduced the highlights feature. ([af34f31](https://github.com/ckeditor/ckeditor5-engine/commit/af34f31))
* Introduced `DataController#hasContent()`. Closes [#1114](https://github.com/ckeditor/ckeditor5-engine/issues/1114). ([712ccfc](https://github.com/ckeditor/ckeditor5-engine/commit/712ccfc))
* Introduced `model.Node#getCommonAncestor()` and `view.Node#getCommonAncestor()`. Closes [#1033](https://github.com/ckeditor/ckeditor5-engine/issues/1033). ([f913aee](https://github.com/ckeditor/ckeditor5-engine/commit/f913aee))
* Introduced `Position#getCommonAncestor( position )` and `Range#getCommonAncestor()` methods for the view and model. Closes [#1002](https://github.com/ckeditor/ckeditor5-engine/issues/1002). ([0e29844](https://github.com/ckeditor/ckeditor5-engine/commit/0e29844))
* Introduced `Schema#getLimitElement()`. Closes [#1042](https://github.com/ckeditor/ckeditor5-engine/issues/1042). ([691e53e](https://github.com/ckeditor/ckeditor5-engine/commit/691e53e))
* Introduced `view.Document#keyup` event (fired by the `KeyObserver`). Closes [#1026](https://github.com/ckeditor/ckeditor5-engine/issues/1026). ([cc766ab](https://github.com/ckeditor/ckeditor5-engine/commit/cc766ab))
* Introduced the `Selection#isEntireContentSelected( element )` method. Closes [#1063](https://github.com/ckeditor/ckeditor5-engine/issues/1063). ([1902d7a](https://github.com/ckeditor/ckeditor5-engine/commit/1902d7a))
* OT will use context information to achieve better conflict resolution. ([481eb9b](https://github.com/ckeditor/ckeditor5-engine/commit/481eb9b))

  This change includes refactoring of: `History`, `RemoveOperation`, operational transformation algorithms, delta transformation algorithms and more.

  Context information will be used instead of removing deltas from history, which caused bugs in more complicated scenarios. This mostly affects undo algorithms.
* `UIElement` has its own render method used by DomConverter and can create DOM children. Improved integration with observers and other view elements. Closes [#799](https://github.com/ckeditor/ckeditor5-engine/issues/799). ([7fc52ea](https://github.com/ckeditor/ckeditor5-engine/commit/7fc52ea))
* When engine debugging is on, additional logs will be provided when delta transformation causes editor to throw an error. ([2ae80ca](https://github.com/ckeditor/ckeditor5-engine/commit/2ae80ca))
* When engine debugging is on, deltas that are results of transformation will keep their history of changes in `#history` property. Closes [#940](https://github.com/ckeditor/ckeditor5-engine/issues/940). ([7d8db49](https://github.com/ckeditor/ckeditor5-engine/commit/7d8db49))
* Introduced two `Schema` helpers – `#checkAttributeInSelection()` and `#getValidRanges()`. Closes [#969](https://github.com/ckeditor/ckeditor5-engine/issues/969). ([34a7a06](https://github.com/ckeditor/ckeditor5-engine/commit/34a7a06))

### Other changes

* Changed the `merge` option of `DataController.deleteContent()` to `leaveUnmerged`. The default value stayed `false`, so the default behavior of the function was changed to merge blocks. Closes [#982](https://github.com/ckeditor/ckeditor5-engine/issues/982). ([56347d1](https://github.com/ckeditor/ckeditor5-engine/commit/56347d1))
* From now, every operation execution will fire `model.Document#event:change`, even if the operation does nothing (for example, if operation changes attribute to the same value). Closes [#1099](https://github.com/ckeditor/ckeditor5-engine/issues/1099). ([6502bbb](https://github.com/ckeditor/ckeditor5-engine/commit/6502bbb))
* Introduced `options.includeSelf` to `getCommonAncestor()`. Closes [#1036](https://github.com/ckeditor/ckeditor5-engine/issues/1036). ([4a4a89a](https://github.com/ckeditor/ckeditor5-engine/commit/4a4a89a))
* The `Selection#getSelectedBlocks()` method will not return a block in which selection ends if no content of that block is selected. Closes [#984](https://github.com/ckeditor/ckeditor5-engine/issues/984). ([d3e7afa](https://github.com/ckeditor/ckeditor5-engine/commit/d3e7afa))

  For example, in the following case only the first two paragraphs will be returned:

  ```html
  <paragraph>[Foo</paragraph>
  <paragraph>Bar</paragraph>
  <paragraph>]Baz</paragraph>
  ```

  The reasoning behind this change is that the user doesn't consider the last block as selected in such a case (as its selection isn't even visible).

### BREAKING CHANGES

* `ModelConverterBuilder#toStamp()` functionality is renamed to `ModelConverterBuilder#toElement()`. Introduced `ModelConverterBuilder#toVirtualSelection()` which replaces current marker to element conversion.
* The `DataController#deleteContent()` option was renamed from `merge` to `leaveUnmerged` and the default behavior of the function was changed to merge blocks.
* Removed `wrapRange()` and `unwrapRange()` functions from `model-to-view-converters.js` as they're no longer used.
* Renamed marker stamps to marker elements in code and docs.
* Renamed `Selection#collapse()` to `Selection#setCollapsedAt()`.
* Renamed `Selection#setFocus()` to `Selection#moveFocusTo()`.
* The `includeNode` option of `Node#getAncestors()` methods (model and view) was renamed to `includeSelf`. See [#1036](https://github.com/ckeditor/ckeditor5-engine/issues/1036).
* Parameter change for `convertSelectionMarker()` function from `model-selection-to-view-converters.js`.
* `deltaTransform#transformDeltaSets()` is now an internal method. Use `Document#transformDeltas()` instead.
* Removed `Renderer#getCorrespondingDom()` and `Renderer#getCorrespondingView()` methods.
* Renamed `Renderer#getCorrespondingDomText()` method to  `Renderer#findCorrespondingDomText()` and `Renderer#getCorrespondingViewText()` to  `Renderer#findCorrespondingViewText()`.
* Merged `Renderer#getCorrespondingDomElement()` and `Renderer#getCorrespondingDomDocumentFragment()` into one method `Renderer#mapViewToDom()`.
* Merged `Renderer#getCorrespondingViewElement()` and `Renderer#getCorrespondingViewDocumentFragment()` into `Renderer#mapDomToView()`.
* `History` API for deleting undone deltas has been removed.


## [0.10.0](https://github.com/ckeditor/ckeditor5-engine/compare/v0.9.0...v0.10.0) (2017-05-07)

### Bug fixes

* `DomConverter#domToView()` will not throw when converting a comment. Closes [#647](https://github.com/ckeditor/ckeditor5-engine/issues/647). ([ffc41d4](https://github.com/ckeditor/ckeditor5-engine/commit/ffc41d4))
* `ViewConverterBuilder#fromAttribute()` should not create incorrect matcher object for `Matcher` if passed attribute was other than `class` or `style`. Closes [#919](https://github.com/ckeditor/ckeditor5-engine/issues/919). ([6701c4b](https://github.com/ckeditor/ckeditor5-engine/commit/6701c4b))

  Minor upgrades to `ViewConversionBuilder`:

  * converters from `ViewConversionBuilder` will not convert if "creator function" returned `null`.
  * simplified view converters building by making `ViewConversionBuilder#toAttribute()` `value` param optional. If not set, the attribute value is taken from converted view element.
* Improved compatibility with MS Edge. See [#923](https://github.com/ckeditor/ckeditor5-engine/issues/923). Closes [#925](https://github.com/ckeditor/ckeditor5-engine/issues/925). ([1af4a50](https://github.com/ckeditor/ckeditor5-engine/commit/1af4a50))
* Improved performance of the `view.Element`'s inline styles parser. Big property values (like base64 encoded images) should not crash the editor anymore. Closes [#881](https://github.com/ckeditor/ckeditor5-engine/issues/881). ([3d494a3](https://github.com/ckeditor/ckeditor5-engine/commit/3d494a3))
* Removed invalid promise catches from `dev-utils.DeltaReplayer`. Closes [#906](https://github.com/ckeditor/ckeditor5-engine/issues/906). ([69cfdd1](https://github.com/ckeditor/ckeditor5-engine/commit/69cfdd1))
* Unified values returned in `data.output` during view-to-model conversion. See breaking changes. Closes [#932](https://github.com/ckeditor/ckeditor5-engine/issues/932). ([16ae05a](https://github.com/ckeditor/ckeditor5-engine/commit/16ae05a))

### Features

* Allow passing ranges to the selection constructors (in the model and in the view). Closes [#600](https://github.com/ckeditor/ckeditor5-engine/issues/600). ([da8a609](https://github.com/ckeditor/ckeditor5-engine/commit/da8a609))
* Events fired by `model.MarkerCollection` will now include marker name after semicolon. Closes [#911](https://github.com/ckeditor/ckeditor5-engine/issues/911). ([3a8ebed](https://github.com/ckeditor/ckeditor5-engine/commit/3a8ebed))

### Other changes

* `model.Element#clone()` now does not clone children when passed `false` and recursively clones children when passed `true`. Closes [#689](https://github.com/ckeditor/ckeditor5-engine/issues/689). ([ccb0659](https://github.com/ckeditor/ckeditor5-engine/commit/ccb0659))

### BREAKING CHANGES

* `ViewConversionDispatcher#convert()` will always return `model.DocumentFragment` (which may be empty in various cases). `conversionApi#convertItem()` will log a warning if `data.output` contains a different value than `model.Node` or `model.DocumentFragment` or `null`. `conversionApi#convertChildren()` will always return `model.DocumentFragment`.
* `model.Element#clone()` does not clone children when not in the `deep` mode. See [#689](https://github.com/ckeditor/ckeditor5-engine/issues/689).


## [0.9.0](https://github.com/ckeditor/ckeditor5-engine/compare/v0.8.0...v0.9.0) (2017-04-05)

### Bug fixes

* Changed `DataController#insertContent()` behavior, so it doesn't clone given nodes. Closes [#869](https://github.com/ckeditor/ckeditor5-engine/issues/869). ([45f0f33](https://github.com/ckeditor/ckeditor5-engine/commit/45f0f33))
* Empty `AttributeDelta` should not be added to batch. Closes [#875](https://github.com/ckeditor/ckeditor5-engine/issues/875). ([425399b](https://github.com/ckeditor/ckeditor5-engine/commit/425399b))
* Fixed a bug where `LiveRange` position would be lost when using wrap and unwrap deltas. Closes [#841](https://github.com/ckeditor/ckeditor5-engine/issues/841). ([efe3987](https://github.com/ckeditor/ckeditor5-engine/commit/efe3987))
* Fixed various issues with the move and unwrap deltas conversion. Closes [#847](https://github.com/ckeditor/ckeditor5-engine/issues/847). ([39c34a5](https://github.com/ckeditor/ckeditor5-engine/commit/39c34a5))
* Live ranges, selections and markers no longer lose content when using the move delta. Closes [#877](https://github.com/ckeditor/ckeditor5-engine/issues/877). ([e08b019](https://github.com/ckeditor/ckeditor5-engine/commit/e08b019))

  The base algorithm implemented in `Range#_getTransformedByDocumentChange()` will now include all model items between the old and new range boundary. See https://github.com/ckeditor/ckeditor5-engine/issues/877#issuecomment-287740021 for more details.
* Mutations inserting bogus `<br>` at the end of the block element are filtered out by the mutation observer. Closes [#882](https://github.com/ckeditor/ckeditor5-engine/issues/882). ([3583cae](https://github.com/ckeditor/ckeditor5-engine/commit/3583cae))
* Renderer should not change the native selection if the one it's about to render is visually similar to the current one. Closes [#887](https://github.com/ckeditor/ckeditor5-engine/issues/887). Closes [#880](https://github.com/ckeditor/ckeditor5-engine/issues/880). ([d8ee5fa](https://github.com/ckeditor/ckeditor5-engine/commit/d8ee5fa))
* Renderer will unbind DOM elements from view elements when removing them from DOM. Closes [#888](https://github.com/ckeditor/ckeditor5-engine/issues/888). ([86ea5b5](https://github.com/ckeditor/ckeditor5-engine/commit/86ea5b5))
* Reversed `ReinsertOperation` targets back to same graveyard holder from which the nodes were re-inserted. Closes [#891](https://github.com/ckeditor/ckeditor5-engine/issues/891). ([ea6c881](https://github.com/ckeditor/ckeditor5-engine/commit/ea6c881))
* View document is now re-rendered after focusing. Closes [#795](https://github.com/ckeditor/ckeditor5-engine/issues/795). ([115a91b](https://github.com/ckeditor/ckeditor5-engine/commit/115a91b))
* Renderer will deeply unbind DOM elements when they are removed from DOM. Closes [#888](https://github.com/ckeditor/ckeditor5-engine/issues/888). ([0aec182](https://github.com/ckeditor/ckeditor5-engine/commit/0aec182))

### Features

* `DataController#insertContent()` now accepts also model items. Closes [#870](https://github.com/ckeditor/ckeditor5-engine/issues/870). ([d00c973](https://github.com/ckeditor/ckeditor5-engine/commit/d00c973))
* Added placeholder utility that can be applied to view elements. Closes [#857](https://github.com/ckeditor/ckeditor5-engine/issues/857). ([79b42da](https://github.com/ckeditor/ckeditor5-engine/commit/79b42da))
* Introduced `dev-utils.DeltaReplayer`. Introduced new logging methods in `dev-utils.enableEngineDebug()`. Closes [#828](https://github.com/ckeditor/ckeditor5-engine/issues/828). ([eb855d9](https://github.com/ckeditor/ckeditor5-engine/commit/eb855d9))
* Introduced markers serialization. Closes [#787](https://github.com/ckeditor/ckeditor5-engine/issues/787). Closes [#846](https://github.com/ckeditor/ckeditor5-engine/issues/846). ([2e7f75d](https://github.com/ckeditor/ckeditor5-engine/commit/2e7f75d))

### Other changes

* Changed the behavior of `DataController#deleteContent()` in a case of nested elements to better match situations like using <kbd>Backspace</kbd> after a block quotation. Closes [#710](https://github.com/ckeditor/ckeditor5-engine/issues/710). ([42a4429](https://github.com/ckeditor/ckeditor5-engine/commit/42a4429))
* Default conversion.Mapper position mapping algorithms are now added as callbacks with low priority and are fired only if earlier callbacks did not provide a result. Closes [#884](https://github.com/ckeditor/ckeditor5-engine/issues/884). ([5627993](https://github.com/ckeditor/ckeditor5-engine/commit/5627993))
* Simplified `SelectionObserver`'s infinite loop check which should improve its stability. Closes [#889](https://github.com/ckeditor/ckeditor5-engine/issues/889). ([8b859fb](https://github.com/ckeditor/ckeditor5-engine/commit/8b859fb))

### BREAKING CHANGES

* Since the default position mapping algorithms are attached with low priority, custom position mapping callbacks added with higher priority won't receive position calculated by default algorithms in data. To execute default position mapping algorithms and use their value, hook custom callback with lower priority.
* `BuildModelConverter#fromMarkerCollapsed()` is removed. Use `BuildModelConverter#fromMarker()` instead.

### NOTE

* The `insertUIElement()` model to view converter now supports collapsed and non-collapsed ranges.


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
