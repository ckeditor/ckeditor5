Changelog
=========

## [19.0.0](https://github.com/ckeditor/ckeditor5-restricted-editing/compare/v18.0.0...v19.0.0) (2020-04-28)

### Other changes

* Updated translations. ([4d7336d](https://github.com/ckeditor/ckeditor5-restricted-editing/commit/4d7336d)) 


## [18.0.0](https://github.com/ckeditor/ckeditor5-restricted-editing/compare/v17.0.0...v18.0.0) (2020-03-19)

### Other changes

* Updated translations. ([e2a6a7d](https://github.com/ckeditor/ckeditor5-restricted-editing/commit/e2a6a7d)) 


## [17.0.0](https://github.com/ckeditor/ckeditor5-restricted-editing/compare/v16.0.0...v17.0.0) (2020-02-19)

### MAJOR BREAKING CHANGES

* Changed the class denoting the exception spans from `ck-restricted-editing-exception` to `restricted-editing-exception`. See [ckeditor/ckeditor5-restricted-editing#6](https://github.com/ckeditor/ckeditor5-restricted-editing/pull/6).

	The data produced by version 16.0.0 of this package will not be recognized by the new version of this package. The easiest migration method is to replace all occurrences of `class="ck-restricted-editing-exception"` with `class="restricted-editing-exception"` prior to loading the data into the editor.

### Features

* Add `enableCommand()` method to `RestrictedEditingModeEditing`. Closes [ckeditor/ckeditor5#6041](https://github.com/ckeditor/ckeditor5/issues/6041). Closes [ckeditor/ckeditor5#6011](https://github.com/ckeditor/ckeditor5/issues/6011). ([e617559](https://github.com/ckeditor/ckeditor5-restricted-editing/commit/e617559))
* Allow pasting content into exception areas in the restricted editing mode. Closes [ckeditor/ckeditor5#5802](https://github.com/ckeditor/ckeditor5/issues/5802). ([6704d21](https://github.com/ckeditor/ckeditor5-restricted-editing/commit/6704d21))
* Pressing Ctrl+A when the selection range is inside an exception selects text only within an exception in restricted editing. Second Ctrl+A selects the entire text in the editor. Closes [ckeditor/ckeditor5#5826](https://github.com/ckeditor/ckeditor5/issues/5826). ([569d588](https://github.com/ckeditor/ckeditor5-restricted-editing/commit/569d588))
* Remove the entire exception when collapsed selection is inside text with restricted attribute. Closes [#5828](https://github.com/ckeditor/ckeditor5-restricted-editing/issues/5828). ([44f443e](https://github.com/ckeditor/ckeditor5-restricted-editing/commit/44f443e))

### Bug fixes

* Fix non-flat exception markers. Closes [ckeditor/ckeditor5#6003](https://github.com/ckeditor/ckeditor5/issues/6003). ([70e3e12](https://github.com/ckeditor/ckeditor5-restricted-editing/commit/70e3e12))
* Focus the editor before executing toolbar buttons' command. See [ckeditor/ckeditor5#353](https://github.com/ckeditor/ckeditor5/issues/353). ([e7f9d23](https://github.com/ckeditor/ckeditor5-restricted-editing/commit/e7f9d23))
* Pressing "Tab" or "Shift+Tab" should move focus outside the editor in restricted mode if the selection is anchored in the last (or first) exception. Closes [ckeditor/ckeditor5#5834](https://github.com/ckeditor/ckeditor5/issues/5834). ([dc26f4c](https://github.com/ckeditor/ckeditor5-restricted-editing/commit/dc26f4c))
* Restricted editing boundaries should not be crossed by delete content and input command. Closes [ckeditor/ckeditor5#5840](https://github.com/ckeditor/ckeditor5/issues/5840). ([3ae681a](https://github.com/ckeditor/ckeditor5-restricted-editing/commit/3ae681a))

### Other changes

* Added CSS classes to the editable elements to differentiate between the restricted and standard modes. See [ckeditor/ckeditor5#5829](https://github.com/ckeditor/ckeditor5/issues/5829). ([de38be8](https://github.com/ckeditor/ckeditor5-restricted-editing/commit/de38be8))
* Align CSS class names to the changes in the restricted editing feature. See [ckeditor/ckeditor5#5899](https://github.com/ckeditor/ckeditor5/issues/5899). ([3ba00b0](https://github.com/ckeditor/ckeditor5-restricted-editing/commit/3ba00b0))
* Updated translations. ([c076842](https://github.com/ckeditor/ckeditor5-restricted-editing/commit/c076842))


## [16.0.0](https://github.com/ckeditor/ckeditor5-restricted-editing/tree/v16.0.0) (2019-12-04)

The initial release.
