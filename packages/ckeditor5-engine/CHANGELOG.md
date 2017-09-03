Changelog
=========

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
