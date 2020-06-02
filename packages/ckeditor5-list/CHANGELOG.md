Changelog
=========

All changes in the package are documented in the main repository. See: https://github.com/ckeditor/ckeditor5/blob/master/CHANGELOG.md.

Changes for the past releases are available below.

## [19.0.0](https://github.com/ckeditor/ckeditor5-list/compare/v18.0.0...v19.0.0) (2020-04-29)

### Other changes

* Improved performance of processing (loading) long lists. Closes [ckeditor/ckeditor5#6581](https://github.com/ckeditor/ckeditor5/issues/6581). ([b52db48](https://github.com/ckeditor/ckeditor5-list/commit/b52db48))


## [18.0.0](https://github.com/ckeditor/ckeditor5-list/compare/v17.0.0...v18.0.0) (2020-03-19)

### Other changes

* Updated translations. ([92c4ec0](https://github.com/ckeditor/ckeditor5-list/commit/92c4ec0))


## [17.0.0](https://github.com/ckeditor/ckeditor5-list/compare/v16.0.0...v17.0.0) (2020-02-19)

### Bug fixes

* Focus the editor before executing toolbar buttons' command. See [ckeditor/ckeditor5#353](https://github.com/ckeditor/ckeditor5/issues/353). ([4af8783](https://github.com/ckeditor/ckeditor5-list/commit/4af8783))

### Other changes

* Updated translations. ([f87974b](https://github.com/ckeditor/ckeditor5-list/commit/f87974b))


## [16.0.0](https://github.com/ckeditor/ckeditor5-list/compare/v15.0.0...v16.0.0) (2019-12-04)

### Other changes

* Updated translations. ([53e1503](https://github.com/ckeditor/ckeditor5-list/commit/53e1503))


## [15.0.0](https://github.com/ckeditor/ckeditor5-list/compare/v12.1.0...v15.0.0) (2019-10-23)

### MAJOR BREAKING CHANGES

* The structure of the to–do list has changed (both in the editing and in the data). Please refer to the documentation for the information about used class names as it can impact the existing styles of your application.

### Features

* Introduces content styles for to–do lists. Unified to–do list representation in the editing and data. Extracted feature styles to a todolist.css file. Closes [#147](https://github.com/ckeditor/ckeditor5-list/issues/147). Closes [ckeditor/ckeditor5#2063](https://github.com/ckeditor/ckeditor5/issues/2063). ([5605663](https://github.com/ckeditor/ckeditor5-list/commit/5605663))

### Bug fixes

* Improved conversion of invalid nested lists. Closes [#115](https://github.com/ckeditor/ckeditor5-list/issues/115). ([ea55a54](https://github.com/ckeditor/ckeditor5-list/commit/ea55a54))
* Keyboard navigation should work inside to-do lists in RTL content (see [ckeditor/ckeditor5-list#134](https://github.com/ckeditor/ckeditor5-list/issues/134)). ([63deb51](https://github.com/ckeditor/ckeditor5-list/commit/63deb51))
* To-do list item styles should not be interactive when applied to editor data (content). Closes [ckeditor/ckeditor5#2090](https://github.com/ckeditor/ckeditor5/issues/2090). ([5662d4e](https://github.com/ckeditor/ckeditor5-list/commit/5662d4e))
* Use model-to-view position mapping in todo lists. Closes [ckeditor/ckeditor5#2009](https://github.com/ckeditor/ckeditor5/issues/2009). Closed [ckeditor/ckeditor5#1980](https://github.com/ckeditor/ckeditor5/issues/1980). ([ff460f8](https://github.com/ckeditor/ckeditor5-list/commit/ff460f8))

### Other changes

* Added `pluginName` property to editing plugin. ([48be07f](https://github.com/ckeditor/ckeditor5-list/commit/48be07f))
* Added `pluginName` property to todo editing plugin. ([3fd6758](https://github.com/ckeditor/ckeditor5-list/commit/3fd6758))
* Updated translations. ([a6cf5dd](https://github.com/ckeditor/ckeditor5-list/commit/a6cf5dd)) ([4f67d34](https://github.com/ckeditor/ckeditor5-list/commit/4f67d34))


## [12.1.0](https://github.com/ckeditor/ckeditor5-list/compare/v12.0.4...v12.1.0) (2019-08-26)

### Features

* Introduced to-do lists. Closes [ckeditor/ckeditor5#1434](https://github.com/ckeditor/ckeditor5/issues/1434). ([56a7a7a](https://github.com/ckeditor/ckeditor5-list/commit/56a7a7a))

### Bug fixes

* The UI buttons should be marked as toggleable for better assistive technologies support (see [ckeditor/ckeditor5#1403](https://github.com/ckeditor/ckeditor5/issues/1403)). ([bb12325](https://github.com/ckeditor/ckeditor5-list/commit/bb12325))

### Other changes

* The issue tracker for this package was moved to https://github.com/ckeditor/ckeditor5/issues. See [ckeditor/ckeditor5#1988](https://github.com/ckeditor/ckeditor5/issues/1988). ([5507ac6](https://github.com/ckeditor/ckeditor5-list/commit/5507ac6))
* Updated translations. ([10e296d](https://github.com/ckeditor/ckeditor5-list/commit/10e296d))


## [12.0.4](https://github.com/ckeditor/ckeditor5-list/compare/v12.0.3...v12.0.4) (2019-07-10)

Internal changes only (updated dependencies, documentation, etc.).


## [12.0.3](https://github.com/ckeditor/ckeditor5-list/compare/v12.0.2...v12.0.3) (2019-07-04)

### Other changes

* Attach `'indentList'` and `'outdentList'` commands to `'indent'` and `'outdent'` commands. ([3a67531](https://github.com/ckeditor/ckeditor5-list/commit/3a67531))

  The `@ckeditor/ckeditor5-indent` feature introduces the "indent" and "outdent" buttons which can be used to manipulate lists and other blocks.
* Updated translations. ([6c4b520](https://github.com/ckeditor/ckeditor5-list/commit/6c4b520))


## [12.0.2](https://github.com/ckeditor/ckeditor5-list/compare/v12.0.1...v12.0.2) (2019-06-05)

### Other changes

* Updated translations. ([b7f3abc](https://github.com/ckeditor/ckeditor5-list/commit/b7f3abc))


## [12.0.1](https://github.com/ckeditor/ckeditor5-list/compare/v12.0.0...v12.0.1) (2019-04-10)

### Other changes

* Updated translations. ([d595449](https://github.com/ckeditor/ckeditor5-list/commit/d595449))


## [12.0.0](https://github.com/ckeditor/ckeditor5-list/compare/v11.0.3...v12.0.0) (2019-02-28)

### Bug fixes

* Editor was crashing if multiple, specific block elements were inside list item in loaded/pasted data. Closes [[ckeditor/ckeditor5#1572](https://github.com/ckeditor/ckeditor5/issues/1572)](https://github.com/ckeditor/ckeditor5/issues/1572). ([788eea3](https://github.com/ckeditor/ckeditor5-list/commit/788eea3))
* Some specific content resulted in creating additional, incorrect list items when loaded. Closes [#121](https://github.com/ckeditor/ckeditor5-list/issues/121). ([50ec81d](https://github.com/ckeditor/ckeditor5-list/commit/50ec81d))

### Other changes

* Updated translations. ([c61b7fc](https://github.com/ckeditor/ckeditor5-list/commit/c61b7fc)) ([e38333a](https://github.com/ckeditor/ckeditor5-list/commit/e38333a)) ([f26a79c](https://github.com/ckeditor/ckeditor5-list/commit/f26a79c))

### BREAKING CHANGES

* Upgraded minimal versions of Node to `8.0.0` and npm to `5.7.1`. See: [ckeditor/ckeditor5#1507](https://github.com/ckeditor/ckeditor5/issues/1507). ([612ea3c](https://github.com/ckeditor/ckeditor5-cloud-services/commit/612ea3c))


## [11.0.3](https://github.com/ckeditor/ckeditor5-list/compare/v11.0.2...v11.0.3) (2018-12-05)

### Bug fixes

* Block filler will be inserted into the list item if its last child is a `<br>` element. Closes [ckeditor/ckeditor5#1312](https://github.com/ckeditor/ckeditor5/issues/1312). ([cb6708e](https://github.com/ckeditor/ckeditor5-list/commit/cb6708e))
* Preserve the correct order of block elements inside list items during the view to model conversion. Closes [ckeditor/ckeditor5#1263](https://github.com/ckeditor/ckeditor5/issues/1263). ([abccef4](https://github.com/ckeditor/ckeditor5-list/commit/abccef4))

### Other changes

* Optimized SVG icons size. See [ckeditor/ckeditor5-theme-lark#206](https://github.com/ckeditor/ckeditor5-theme-lark/issues/206). ([d424329](https://github.com/ckeditor/ckeditor5-list/commit/d424329))


## [11.0.2](https://github.com/ckeditor/ckeditor5-list/compare/v11.0.1...v11.0.2) (2018-10-08)

### Other changes

* Updated translations. ([00fed4b](https://github.com/ckeditor/ckeditor5-list/commit/00fed4b))


## [11.0.1](https://github.com/ckeditor/ckeditor5-list/compare/v11.0.0...v11.0.1) (2018-07-18)

### Other changes

* Updated translations. ([f2d8f6c](https://github.com/ckeditor/ckeditor5-list/commit/f2d8f6c))


## [11.0.0](https://github.com/ckeditor/ckeditor5-list/compare/v10.0.0...v11.0.0) (2018-06-21)

### Other changes

* Rename list attributes `indent` and `type` to `listIndent` and `listType` to avoid collisions with possible generic `type` attribute which could be used on other elements. Closes [#103](https://github.com/ckeditor/ckeditor5-list/issues/103). ([7a1ece6](https://github.com/ckeditor/ckeditor5-list/commit/7a1ece6))
* Updated translations. ([340ee3d](https://github.com/ckeditor/ckeditor5-list/commit/340ee3d))

### BREAKING CHANGES

* The `indent` attribute is now called `listIndent`. See [#103](https://github.com/ckeditor/ckeditor5-list/issues/103) for more information.
* The `type` attribute is now called `listType`. See [#103](https://github.com/ckeditor/ckeditor5-list/issues/103) for more information.


## [10.0.0](https://github.com/ckeditor/ckeditor5-list/compare/v1.0.0-beta.4...v10.0.0) (2018-04-25)

### Other changes

* Changed the license to GPL2+ only. See [ckeditor/ckeditor5#991](https://github.com/ckeditor/ckeditor5/issues/991). ([e93f96c](https://github.com/ckeditor/ckeditor5-list/commit/e93f96c))

### BREAKING CHANGES

* The license under which CKEditor 5 is released has been changed from a triple GPL, LGPL and MPL license to a GPL2+ only. See [ckeditor/ckeditor5#991](https://github.com/ckeditor/ckeditor5/issues/991) for more information.


## [1.0.0-beta.4](https://github.com/ckeditor/ckeditor5-list/compare/v1.0.0-beta.2...v1.0.0-beta.4) (2018-04-19)

Internal changes only (updated dependencies, documentation, etc.).


## [1.0.0-beta.2](https://github.com/ckeditor/ckeditor5-list/compare/v1.0.0-beta.1...v1.0.0-beta.2) (2018-04-10)

Internal changes only (updated dependencies, documentation, etc.).


## [1.0.0-beta.1](https://github.com/ckeditor/ckeditor5-list/compare/v1.0.0-alpha.2...v1.0.0-beta.1) (2018-03-15)

### Features

* Updated icons for compatibility with the refreshed Lark theme. Minor adjustments in toolbar configurations (see [ckeditor/ckeditor5#645](https://github.com/ckeditor/ckeditor5/issues/645)). ([d1fae4b](https://github.com/ckeditor/ckeditor5-list/commit/d1fae4b))

### Other changes

* Aligned feature class naming to the new scheme. ([d677fb6](https://github.com/ckeditor/ckeditor5-list/commit/d677fb6))
* Removed `ViewListItemElement` class and introduced `createViewListItemElement()` utility method. Closes [#89](https://github.com/ckeditor/ckeditor5-list/issues/89). ([e4ac704](https://github.com/ckeditor/ckeditor5-list/commit/e4ac704))
* Updated translations. ([762a9ed](https://github.com/ckeditor/ckeditor5-list/commit/762a9ed))


## [1.0.0-alpha.2](https://github.com/ckeditor/ckeditor5-list/compare/v1.0.0-alpha.1...v1.0.0-alpha.2) (2017-11-14)

### Bug fixes

* Pressing <kbd>Backspace</kbd> at the beginning of a first list item will turn it into a paragraph instead of merging with the previous block. Closes [#68](https://github.com/ckeditor/ckeditor5-list/issues/68). ([5160277](https://github.com/ckeditor/ckeditor5-list/commit/5160277))

### Other changes

* Updated translations. ([a1c4477](https://github.com/ckeditor/ckeditor5-list/commit/a1c4477))


## [1.0.0-alpha.1](https://github.com/ckeditor/ckeditor5-list/compare/v0.7.0...v1.0.0-alpha.1) (2017-10-03)

### Bug fixes

* Editor will no longer crash in certain cases during pasting when pasted content could not be converted at all. Closes [#80](https://github.com/ckeditor/ckeditor5-list/issues/80). ([40d0bf5](https://github.com/ckeditor/ckeditor5-list/commit/40d0bf5))
* Editor will no longer crash when spellchecker corrects a word inside list item in a certain scenario. Closes [#70](https://github.com/ckeditor/ckeditor5-list/issues/70). ([f0b8b44](https://github.com/ckeditor/ckeditor5-list/commit/f0b8b44))


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
