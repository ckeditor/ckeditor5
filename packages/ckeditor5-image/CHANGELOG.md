Changelog
=========

## [19.0.0](https://github.com/ckeditor/ckeditor5-image/compare/v18.0.0...v19.0.0) (2020-04-29)

### Other changes

* Replaced `LabeledInputView` with `LabeledFieldView`. See [ckeditor/ckeditor5#6110](https://github.com/ckeditor/ckeditor5/issues/6110). ([3416fb2](https://github.com/ckeditor/ckeditor5-image/commit/3416fb2))
* Updated translations. ([88300ff](https://github.com/ckeditor/ckeditor5-image/commit/88300ff))


## [18.0.0](https://github.com/ckeditor/ckeditor5-image/compare/v17.0.0...v18.0.0) (2020-03-19)

### Bug fixes

* The image converters should not assume that <img> is a first child of a <figure>. Closes [ckeditor/ckeditor5#6294](https://github.com/ckeditor/ckeditor5/issues/6294). ([97450b7](https://github.com/ckeditor/ckeditor5-image/commit/97450b7))

### Other changes

* Updated translations. ([79db6f5](https://github.com/ckeditor/ckeditor5-image/commit/79db6f5))


## [17.0.0](https://github.com/ckeditor/ckeditor5-image/compare/v16.0.0...v17.0.0) (2020-02-19)

### MINOR BREAKING CHANGES

* Resizer options object now also takes the editor instance.
* Removed the `downcastWriter` property from the [`ResizerOptions` interface](https://ckeditor.com/docs/ckeditor5/latest/api/module_widget_widgetresize-ResizerOptions.html).

### Bug fixes

* Fixed image resize behavior upon short clicking a handle without dragging. Image will no longer became full width, nor will it briefly flash an unexpected size. Closes [ckeditor/ckeditor5#5189](https://github.com/ckeditor/ckeditor5/issues/5189) and closes [ckeditor/ckeditor5#5195](https://github.com/ckeditor/ckeditor5/issues/5195). ([9148013](https://github.com/ckeditor/ckeditor5-image/commit/9148013))
* Focus the editor before executing toolbar buttons' command. See [ckeditor/ckeditor5#353](https://github.com/ckeditor/ckeditor5/issues/353). ([5a700a2](https://github.com/ckeditor/ckeditor5-image/commit/5a700a2))

### Other changes

* Updated translations. ([b81e08c](https://github.com/ckeditor/ckeditor5-image/commit/b81e08c))


## [16.0.0](https://github.com/ckeditor/ckeditor5-image/compare/v15.0.0...v16.0.0) (2019-12-04)

### Bug fixes

* Improved markup operation performance of the editor with the image plugin enabled. See [ckeditor/ckeditor5#4504](https://github.com/ckeditor/ckeditor5/issues/4504). ([6c7fc94](https://github.com/ckeditor/ckeditor5-image/commit/6c7fc94))

### Other changes

* Updated translations. ([01cdb59](https://github.com/ckeditor/ckeditor5-image/commit/01cdb59))


## [15.0.0](https://github.com/ckeditor/ckeditor5-image/compare/v14.0.0...v15.0.0) (2019-10-23)

### MAJOR BREAKING CHANGES

* Removed `isImageType()` util.

### Features

* Introduced `config.image.upload.types` configuration option for setting allowed image mime-types. Closes [#295](https://github.com/ckeditor/ckeditor5-image/issues/295). Closes [ckeditor/ckeditor5#674](https://github.com/ckeditor/ckeditor5/issues/674). ([8c36aee](https://github.com/ckeditor/ckeditor5-image/commit/8c36aee))

### Bug fixes

* Initial resize of a side image with no width predefined now gives correct percentage values. Closes [#306](https://github.com/ckeditor/ckeditor5-image/issues/306). ([b084de5](https://github.com/ckeditor/ckeditor5-image/commit/b084de5))

### Other changes

* Added `pluginName` property to editing plugins. ([71adead](https://github.com/ckeditor/ckeditor5-image/commit/71adead))
* Improved the resizer performance. Closes [ckeditor/ckeditor5#5191](https://github.com/ckeditor/ckeditor5/issues/5191). ([c46072b](https://github.com/ckeditor/ckeditor5-image/commit/c46072b))
* Make the `Clipboard` plugin a required dependency of `ImageUploadEditing`. Closes [ckeditor/ckeditor5-core#193](https://github.com/ckeditor/ckeditor5-core/issues/193). ([311c48c](https://github.com/ckeditor/ckeditor5-image/commit/311c48c))
* Updated translations. ([27effa2](https://github.com/ckeditor/ckeditor5-image/commit/27effa2)) ([93aa0bb](https://github.com/ckeditor/ckeditor5-image/commit/93aa0bb))


## [14.0.0](https://github.com/ckeditor/ckeditor5-image/compare/v13.1.2...v14.0.0) (2019-08-26)

### Features

* Introduced widget resizer. Closes [#241](https://github.com/ckeditor/ckeditor5-image/issues/241). ([ddcb1b3](https://github.com/ckeditor/ckeditor5-image/commit/ddcb1b3))

### Bug fixes

* Image upload should handle images that are deeply nested in other blocks. Closes [ckeditor/ckeditor5#1985](https://github.com/ckeditor/ckeditor5/issues/1985). ([5a729d3](https://github.com/ckeditor/ckeditor5-image/commit/5a729d3))
* Image widgets should not span the entire width of the editor. Closes [ckeditor/ckeditor5#1870](https://github.com/ckeditor/ckeditor5/issues/1870). ([b82ea85](https://github.com/ckeditor/ckeditor5-image/commit/b82ea85))
* Improved stability of `ImageTextAlternative` balloon used in rotator. ([2e979cd](https://github.com/ckeditor/ckeditor5-image/commit/2e979cd))
* The UI buttons should be marked as toggleable for better assistive technologies support (see [ckeditor/ckeditor5#1403](https://github.com/ckeditor/ckeditor5/issues/1403)). ([6c74d59](https://github.com/ckeditor/ckeditor5-image/commit/6c74d59))
* Worked around Safari's image size bug. Closes [ckeditor/ckeditor5#1975](https://github.com/ckeditor/ckeditor5/issues/1975). ([8e14b03](https://github.com/ckeditor/ckeditor5-image/commit/8e14b03))

### Other changes

* The issue tracker for this package was moved to https://github.com/ckeditor/ckeditor5/issues. See [ckeditor/ckeditor5#1988](https://github.com/ckeditor/ckeditor5/issues/1988). ([a5451d6](https://github.com/ckeditor/ckeditor5-image/commit/a5451d6))
* Removed the obsolete `--ck-color-upload-infinite-background` CSS custom property. See https://github.com/ckeditor/ckeditor5-theme-lark/pull/240. ([65c07cd](https://github.com/ckeditor/ckeditor5-image/commit/65c07cd))
* The image widget toolbar should have a proper `aria-label` attribute (see [ckeditor/ckeditor5#1404](https://github.com/ckeditor/ckeditor5/issues/1404)). ([13af143](https://github.com/ckeditor/ckeditor5-image/commit/13af143))
* Updated translations. ([f2a760d](https://github.com/ckeditor/ckeditor5-image/commit/f2a760d))

### BREAKING CHANGES

* From now on, all images in the editor use CSS `display: table` by default (`.ck-content .image { display: table }`). It can affect integrations and we recommend checking if images render correctly in your project after this update. There is a possibility you might need to adjust the CSS to adapt to this change.


## [13.1.2](https://github.com/ckeditor/ckeditor5-image/compare/v13.1.1...v13.1.2) (2019-07-10)

Internal changes only (updated dependencies, documentation, etc.).


## [13.1.1](https://github.com/ckeditor/ckeditor5-image/compare/v13.1.0...v13.1.1) (2019-07-04)

Internal changes only (updated dependencies, documentation, etc.).


## [13.1.0](https://github.com/ckeditor/ckeditor5-image/compare/v13.0.1...v13.1.0) (2019-06-05)

### Bug fixes

* Fixed the scope of the "click outside handler" in `ImageTextAlternative`. Closes [#292](https://github.com/ckeditor/ckeditor5-image/issues/292). ([78e619e](https://github.com/ckeditor/ckeditor5-image/commit/78e619e))

### Other changes

* Changed `ImageStyleCommand#defaultStyle` from private to public readonly property. Closes [#289](https://github.com/ckeditor/ckeditor5-image/issues/289). ([fb35177](https://github.com/ckeditor/ckeditor5-image/commit/fb35177))
* Updated translations. ([01125b7](https://github.com/ckeditor/ckeditor5-image/commit/01125b7))


## [13.0.1](https://github.com/ckeditor/ckeditor5-image/compare/v13.0.0...v13.0.1) (2019-04-10)

### Other changes

* Updated translations. ([e674e9c](https://github.com/ckeditor/ckeditor5-image/commit/e674e9c))


## [13.0.0](https://github.com/ckeditor/ckeditor5-image/compare/v12.0.0...v13.0.0) (2019-02-28)

### Features

* Enable images in table cells. ([3a4d2ca](https://github.com/ckeditor/ckeditor5-image/commit/3a4d2ca))

### Bug fixes

* Insert missing caption for images that are nested in other elements. Closes https://github.com/ckeditor/ckeditor5/issues/1524. ([0e3a7c5](https://github.com/ckeditor/ckeditor5-image/commit/0e3a7c5))
* The text alternative input should be blurred before the form is removed from the DOM. Closes ckeditor/ckeditor5/issues#1501. ([f89fe04](https://github.com/ckeditor/ckeditor5-image/commit/f89fe04))
* Fixed memory leaks during editor initialization and destruction (see [ckeditor/ckeditor5#1341](https://github.com/ckeditor/ckeditor5/issues/1341)). ([205f119](https://github.com/ckeditor/ckeditor5-image/commit/205f119))

### Other changes

* Aligned to the new `WidgetToolbarRepository` API. Replaced the `isImageWidgetSelected()` utility with `getSelectedImageWidget()` (see [ckeditor/ckeditor5-widget#60](https://github.com/ckeditor/ckeditor5-widget/issues/60)). ([699d586](https://github.com/ckeditor/ckeditor5-image/commit/699d586))
* Remove `ImageEditing` plugin from requires method of `ImageStyleEditing`. Closes [#261](https://github.com/ckeditor/ckeditor5-image/issues/261). ([5dea054](https://github.com/ckeditor/ckeditor5-image/commit/5dea054))
* The image uploading listener for handling `base64/blob` images no longer stops `inputTransformation` event. Closes [#263](https://github.com/ckeditor/ckeditor5-image/issues/263). Closes [ckeditor/ckeditor5-paste-from-office#44](https://github.com/ckeditor/ckeditor5-paste-from-office/issues/44). ([8c5b4fc](https://github.com/ckeditor/ckeditor5-image/commit/8c5b4fc))
* Updated translations. ([1f4e70d](https://github.com/ckeditor/ckeditor5-image/commit/1f4e70d)) ([6c9e15c](https://github.com/ckeditor/ckeditor5-image/commit/6c9e15c)) ([a1b03b9](https://github.com/ckeditor/ckeditor5-image/commit/a1b03b9))

### BREAKING CHANGES

* Upgraded minimal versions of Node to `8.0.0` and npm to `5.7.1`. See: [ckeditor/ckeditor5#1507](https://github.com/ckeditor/ckeditor5/issues/1507). ([612ea3c](https://github.com/ckeditor/ckeditor5-cloud-services/commit/612ea3c))
* The `isImageWidgetSelected()` utility has been replaced by `getSelectedImageWidget()` and returns an editing `View` element instead of `Boolean`.


## [12.0.0](https://github.com/ckeditor/ckeditor5-image/compare/v11.0.0...v12.0.0) (2018-12-05)

### Features

* Improved responsiveness of the text alternative view in narrow viewports (see [ckeditor/ckeditor5#416](https://github.com/ckeditor/ckeditor5/issues/416)). ([ff5394a](https://github.com/ckeditor/ckeditor5-image/commit/ff5394a))
* Introduced the `'imageInsert'` command. Closes [#245](https://github.com/ckeditor/ckeditor5-image/issues/245). Closes [#251](https://github.com/ckeditor/ckeditor5-image/issues/251). ([cc1e7a3](https://github.com/ckeditor/ckeditor5-image/commit/cc1e7a3))
* Support for uploading images pasted with a base64 source. Closes [#246](https://github.com/ckeditor/ckeditor5-image/issues/246). Closes [ckeditor/ckeditor5-paste-from-office#24](https://github.com/ckeditor/ckeditor5-paste-from-office/issues/24). ([89ab27e](https://github.com/ckeditor/ckeditor5-image/commit/89ab27e))

### Bug fixes

* Prevent errors when (for unclear reasons) the native `DataTransfer#files` contains `null` values when drag&dropping files into the editor in Chrome. ([2a45481](https://github.com/ckeditor/ckeditor5-image/commit/2a45481))

  Thanks to [@code-chris](https://github.com/code-chris)!

### Other changes

* Moved widget spacing styles from `@ckeditor/ckeditor5-theme-lark` to the feature content styles sheet (see [ckeditor/ckeditor5-theme-lark#209](https://github.com/ckeditor/ckeditor5-theme-lark/issues/209)). ([671e1b8](https://github.com/ckeditor/ckeditor5-image/commit/671e1b8))
* Removed obsolete fill attributes in SVG icons. ([0f9dad3](https://github.com/ckeditor/ckeditor5-image/commit/0f9dad3))  ([57bd34c](https://github.com/ckeditor/ckeditor5-image/commit/57bd34c)) ([ebc27e6](https://github.com/ckeditor/ckeditor5-image/commit/ebc27e6)) ([6192cf3](https://github.com/ckeditor/ckeditor5-image/commit/6192cf3))
* Updated translations. ([3c85c37](https://github.com/ckeditor/ckeditor5-image/commit/3c85c37))

### BREAKING CHANGES

* The `ImageUploadCommand#execute()`'s `files` parameter was renamed to `file`. It can still accept an array of files.


## [11.0.0](https://github.com/ckeditor/ckeditor5-image/compare/v10.2.0...v11.0.0) (2018-10-08)

### Other changes

* Aligned `ImageToolbar` to use the new widget toolbar repository. ([980681d](https://github.com/ckeditor/ckeditor5-image/commit/980681d))
* Image feature should insert image the same way as other widget features do. ([26638f5](https://github.com/ckeditor/ckeditor5-image/commit/26638f5))
* The `ImageUploadCommand` should check whether it can be executed in the context of the current document selection. Closes [#225](https://github.com/ckeditor/ckeditor5-image/issues/225). Closes [#227](https://github.com/ckeditor/ckeditor5-image/issues/227). Closes [#235](https://github.com/ckeditor/ckeditor5-image/issues/235). ([4c1f27f](https://github.com/ckeditor/ckeditor5-image/commit/4c1f27f))
* Updated translations. ([59f3604](https://github.com/ckeditor/ckeditor5-image/commit/59f3604))

### BREAKING CHANGES

* The `options.file` property was renamed to `options.files`  in `ImageUploadCommand#execute()`.
* The `options.insertAt` property of `ImageUploadCommand#execute()` was removed. The command will now use model's selection.
* Removed `findOptimalInsertionPosition()` from utils. This method can now be found in the `@ckeditor/ckeditor5-widget/src/utils` module.


## [10.2.0](https://github.com/ckeditor/ckeditor5-image/compare/v10.1.0...v10.2.0) (2018-07-18)

### Features

* Implemented a CSS–styled image upload loader. Closes [#207](https://github.com/ckeditor/ckeditor5-image/issues/207). ([997d39b](https://github.com/ckeditor/ckeditor5-image/commit/997d39b))
* Introduced `ImageLoadObserver`. Closes [#213](https://github.com/ckeditor/ckeditor5-image/issues/213). ([1128cb8](https://github.com/ckeditor/ckeditor5-image/commit/1128cb8))

### Bug fixes

* Complete upload icon should not be rendered in Edge due to an [Edge's bug](https://developer.microsoft.com/en-us/microsoft-edge/platform/issues/105834/). Closes https://github.com/ckeditor/ckeditor5/issues/1066. ([9a62cf1](https://github.com/ckeditor/ckeditor5-image/commit/9a62cf1))
* The UI should update once the image is loaded. Closes [#142](https://github.com/ckeditor/ckeditor5-image/issues/142). ([dee20c0](https://github.com/ckeditor/ckeditor5-image/commit/dee20c0))

  Used the `EditorUI#update` event instead of `View#render` to attach the UI components (see [ckeditor/ckeditor5-core#130](https://github.com/ckeditor/ckeditor5-core/issues/130)).

### Other changes

* Updated translations. ([e6f77fe](https://github.com/ckeditor/ckeditor5-image/commit/e6f77fe))


## [10.1.0](https://github.com/ckeditor/ckeditor5-image/compare/v10.0.0...v10.1.0) (2018-06-21)

### Features

* Added "upload completed" icon. Closes [#204](https://github.com/ckeditor/ckeditor5-image/issues/204). ([004eda7](https://github.com/ckeditor/ckeditor5-image/commit/004eda7))

### Bug fixes

* Made image upload by drag&drop work when the `ImageUploadCommand` is disabled. Closes [#208](https://github.com/ckeditor/ckeditor5-image/issues/208). ([6908ec6](https://github.com/ckeditor/ckeditor5-image/commit/6908ec6))

### Other changes

* Updated translations. ([bfc9456](https://github.com/ckeditor/ckeditor5-image/commit/bfc9456))


## [10.0.0](https://github.com/ckeditor/ckeditor5-image/compare/v1.0.0-beta.4...v10.0.0) (2018-04-25)

### Other changes

* Changed the license to GPL2+ only. See [ckeditor/ckeditor5#991](https://github.com/ckeditor/ckeditor5/issues/991). ([7b11bc5](https://github.com/ckeditor/ckeditor5-image/commit/7b11bc5))

### BREAKING CHANGES

* The license under which CKEditor 5 is released has been changed from a triple GPL, LGPL and MPL license to a GPL2+ only. See [ckeditor/ckeditor5#991](https://github.com/ckeditor/ckeditor5/issues/991) for more information.


## [1.0.0-beta.4](https://github.com/ckeditor/ckeditor5-image/compare/v1.0.0-beta.2...v1.0.0-beta.4) (2018-04-19)

### Other changes

* Updated translations. ([de6b58e](https://github.com/ckeditor/ckeditor5-image/commit/de6b58e))


## [1.0.0-beta.2](https://github.com/ckeditor/ckeditor5-image/compare/v1.0.0-beta.1...v1.0.0-beta.2) (2018-04-10)

### Bug fixes

* Fixed image upload progress updates. Now each upload status is treated separately. Closes [#191](https://github.com/ckeditor/ckeditor5-image/issues/191). ([66d67c0](https://github.com/ckeditor/ckeditor5-image/commit/66d67c0))
* Image element will be cleared from upload progress classes if `uploadId` attribute changed to `null`. Closes [#200](https://github.com/ckeditor/ckeditor5-image/issues/200). ([5fadcf0](https://github.com/ckeditor/ckeditor5-image/commit/5fadcf0))
* `ImageUploadEditing` should not throw unhandled async errors. Closes [#186](https://github.com/ckeditor/ckeditor5-image/issues/186). ([4357336](https://github.com/ckeditor/ckeditor5-image/commit/4357336))

### Other changes

* Made the image text alternative form buttons thicker with a fill color and no background. Closes [#187](https://github.com/ckeditor/ckeditor5-image/issues/187). ([25c17ad](https://github.com/ckeditor/ckeditor5-image/commit/25c17ad))


## [1.0.0-beta.1](https://github.com/ckeditor/ckeditor5-image/compare/v1.0.0-alpha.2...v1.0.0-beta.1) (2018-03-15)

### Features

* Intorduced the `ImageUpload` feature. It was moved from the `@ckeditor/ckeditor5-upload` package. See [ckeditor/ckeditor5-upload#22](https://github.com/ckeditor/ckeditor5-upload/issues/22). ([b974bb0](https://github.com/ckeditor/ckeditor5-image/commit/b974bb0))
* Simplified the text alternative UI, aligning the image package to the redesigned Lark theme (see [ckeditor/ckeditor5#645](https://github.com/ckeditor/ckeditor5/issues/645)). ([9a069b0](https://github.com/ckeditor/ckeditor5-image/commit/9a069b0))

### Other changes

* Aligned feature class naming to the new scheme. ([8690765](https://github.com/ckeditor/ckeditor5-image/commit/8690765))
* Migrated package styles to PostCSS. Moved visual styles to `@ckeditor/ckeditor5-theme-lark` (see [ckeditor/ckeditor5-ui#144](https://github.com/ckeditor/ckeditor5-ui/issues/144)). ([ed6e1cf](https://github.com/ckeditor/ckeditor5-image/commit/ed6e1cf))
* Removed the `.ck-editor-toolbar` and `.ck-editor-toolbar-container` classes from the UI (see [ckeditor/ckeditor5-theme-lark#135](https://github.com/ckeditor/ckeditor5-theme-lark/issues/135)). ([1c08fdd](https://github.com/ckeditor/ckeditor5-image/commit/1c08fdd))
* Renamed `uploadImage` command and button to `imageUpload`. Closes [#184](https://github.com/ckeditor/ckeditor5-image/issues/184). ([6f891b8](https://github.com/ckeditor/ckeditor5-image/commit/6f891b8))
* Updated naming of UI components & commands. ([2e7fbee](https://github.com/ckeditor/ckeditor5-image/commit/2e7fbee))
* Updated translations. ([02f9cf5](https://github.com/ckeditor/ckeditor5-image/commit/02f9cf5))

### BREAKING CHANGES

* `uploadImage` command and button are now called `imageUpload`.
* Renamed the `'imageUpload'` command to `'uploadImage'`.
* The `'imageStyleFull'`, `'imageStyleSide'`, `'imageStyleAlignLeft'`, `'imageStyleAlignRight'` and `'imageStyleAlignCenter'` commands are no longer available. They were replaced by the `'imageStyle'` command that accepts name of an image style as a value.
* The `'imageStyleFull'`, `'imageStyleSide'`, `'imageStyleAlignLeft'`, `'imageStyleAlignRight'` and `'imageStyleAlignCenter'` UI components are no longer available. Replaced by `'imageStyle:full'`, `'imageStyle:side'`, `'imageStyle:alignLeft'`, `'imageStyle:alignRight'` and `'imageStyle:alignCenter'`.
* The `ImageStyleCommand#value` property is no longer a boolean only. Now it represents a name of an image style of the currently selected image element.
* The `ImageStyleCommand` constructor's second parameter is now an array of supported image styles.
* The DOM structure of the text alternative form has changed.


## 0.0.1 (2017-11-06)

Internal changes only (updated dependencies, documentation, etc.).


## [1.0.0-alpha.2](https://github.com/ckeditor/ckeditor5-image/compare/v1.0.0-alpha.1...v1.0.0-alpha.2) (2017-11-14)

### Bug fixes

* Default style's command will properly remove model element's attribute. Closes [#147](https://github.com/ckeditor/ckeditor5-image/issues/147). ([c96fb19](https://github.com/ckeditor/ckeditor5-image/commit/c96fb19))

### Other changes

* Updated translations. ([eb4ba5b](https://github.com/ckeditor/ckeditor5-image/commit/eb4ba5b))
* Aligned UI library usage to the [changes in the UI framework](https://github.com/ckeditor/ckeditor5-ui/pull/332).


## [1.0.0-alpha.1](https://github.com/ckeditor/ckeditor5-image/compare/v0.7.0...v1.0.0-alpha.1) (2017-10-03)

### Bug fixes

* Fixed a bug causing the editor with `ImageCaption` plugin enabled to throw an error after the view got rendered. Closes [#127](https://github.com/ckeditor/ckeditor5-image/issues/127). ([6147fee](https://github.com/ckeditor/ckeditor5-image/commit/6147fee))
* The `ImageTextAlternative`'s UI should be hidden when the edited image element has been removed by an external change. Closes [#137](https://github.com/ckeditor/ckeditor5-image/issues/137). ([6ab8c40](https://github.com/ckeditor/ckeditor5-image/commit/6ab8c40))

### Features

* Allowed customization of the default image styles. Defined formatting–oriented styles. Simplified `config.image.styles` syntax. Closes [#134](https://github.com/ckeditor/ckeditor5-image/issues/134). Closes [#135](https://github.com/ckeditor/ckeditor5-image/issues/135). ([eab98ef](https://github.com/ckeditor/ckeditor5-image/commit/eab98ef))
* Keyboard navigation will now work in the `TextAlternativeFormView`. Closes [#40](https://github.com/ckeditor/ckeditor5-image/issues/40). Closes [ckeditor/ckeditor5#490](https://github.com/ckeditor/ckeditor5/issues/490). ([fa92de6](https://github.com/ckeditor/ckeditor5-image/commit/fa92de6))
* The `srcset` attribute in the model will now be converted to three attributes in the view: `srcset`, `sizes` and `width`. Closes [#145](https://github.com/ckeditor/ckeditor5-image/issues/145). Closes [ckeditor/ckeditor5-easy-image#4](https://github.com/ckeditor/ckeditor5-easy-image/issues/4). ([9ca651e](https://github.com/ckeditor/ckeditor5-image/commit/9ca651e))

### BREAKING CHANGES

* The format of the `srcset` attribute has been changed.
* From now on, the `imageStyleFull` uses `object-full-width.svg` icon.


## [0.7.0](https://github.com/ckeditor/ckeditor5-image/compare/v0.6.0...v0.7.0) (2017-09-03)

### Bug fixes

* `ImageStyleCommand` should switch properly between any two non-null styles. Closes [#132](https://github.com/ckeditor/ckeditor5-image/issues/132). ([d6c847d](https://github.com/ckeditor/ckeditor5-image/commit/d6c847d))
* Text alternative input should synchronize its value when the balloon shows up. Closes [#114](https://github.com/ckeditor/ckeditor5-image/issues/114). ([9b105ed](https://github.com/ckeditor/ckeditor5-image/commit/9b105ed))
* The arrow of the toolbar's balloon should inherit the background color. Closes [#109](https://github.com/ckeditor/ckeditor5-image/issues/109). ([4322b04](https://github.com/ckeditor/ckeditor5-image/commit/4322b04))
* The image toolbar should not be doubled when the `ContextualToolbar` plugin is in use. Closes [#110](https://github.com/ckeditor/ckeditor5-image/issues/110). ([5ace9a0](https://github.com/ckeditor/ckeditor5-image/commit/5ace9a0))

### Features

* Introduced support for responsive image's `srcset` attribute. Closes [#2](https://github.com/ckeditor/ckeditor5-image/issues/2). ([5b433d2](https://github.com/ckeditor/ckeditor5-image/commit/5b433d2))

### Other changes

* Aligned the implementation to the new Command API (see https://github.com/ckeditor/ckeditor5-core/issues/88). ([2c0044c](https://github.com/ckeditor/ckeditor5-image/commit/2c0044c))

### BREAKING CHANGES

* The command API has been changed.


## [0.6.0](https://github.com/ckeditor/ckeditor5-image/compare/v0.5.0...v0.6.0) (2017-05-07)

### Bug fixes

* Bare `<img>` (not wrapped with `<figure class="image">`) can now be pasted into the editor. Closes [#8](https://github.com/ckeditor/ckeditor5-image/issues/8). ([fb6ab1a](https://github.com/ckeditor/ckeditor5-image/commit/fb6ab1a))
* Fixed toolbar positioning in MS Edge. Closes [#101](https://github.com/ckeditor/ckeditor5-image/issues/101). ([19941e9](https://github.com/ckeditor/ckeditor5-image/commit/19941e9))
* The `caption` item should inherit from `$block` to automatically allow the same content. Closes [#94](https://github.com/ckeditor/ckeditor5-image/issues/94). ([02869eb](https://github.com/ckeditor/ckeditor5-image/commit/02869eb))

### Features

* Introduced support for pasting and loading images in context in which they cannot appear in the editor. For example, if `<p>foo<img>bar</p>` is pasted, the pasted paragraph will be split (because an image in the editor cannot be contained in a paragraph). Closes [#98](https://github.com/ckeditor/ckeditor5-image/issues/98). ([e2104b1](https://github.com/ckeditor/ckeditor5-image/commit/e2104b1))

### Other changes

* Removed automatically filled `config.image.defaultToolbar`. Now, when initializing the editor one must always define `config.image.toolbar`. Closes [#60](https://github.com/ckeditor/ckeditor5-image/issues/60). ([4db7b34](https://github.com/ckeditor/ckeditor5-image/commit/4db7b34))
* Updated translations. ([22b5dbc](https://github.com/ckeditor/ckeditor5-image/commit/22b5dbc))

### BREAKING CHANGES

* The `config.image.defaultToolbar` is no longer available. All editor instances must have `config.image.toolbar` configured instead.


## [0.5.0](https://github.com/ckeditor/ckeditor5-image/compare/v0.4.0...v0.5.0) (2017-04-05)

### Bug fixes

* Caption will not be automatically added for the second time if it was already added before "caption fixer" was fired. Closes [#78](https://github.com/ckeditor/ckeditor5-image/issues/78). ([e651b01](https://github.com/ckeditor/ckeditor5-image/commit/e651b01))
* Image captions in the view are hidden instead of being removed (from the view and the DOM). Closes [#77](https://github.com/ckeditor/ckeditor5-image/issues/77). ([aae2957](https://github.com/ckeditor/ckeditor5-image/commit/aae2957))
* The editor no longer crashes when undoing or redoing changes reshow temporarily invisible image caption. Closes [#58](https://github.com/ckeditor/ckeditor5-image/issues/58). ([8e36645](https://github.com/ckeditor/ckeditor5-image/commit/8e36645))
* The image should not go (visually) beyond the boundaries of the parent container. Closes [#67](https://github.com/ckeditor/ckeditor5-image/issues/67). ([d1ee92d](https://github.com/ckeditor/ckeditor5-image/commit/d1ee92d))

### Features

* Added "Enter caption here" placeholders to empty image captions. Closes [#71](https://github.com/ckeditor/ckeditor5-image/issues/71). ([3818544](https://github.com/ckeditor/ckeditor5-image/commit/3818544))
* Introduced `toWidgetEditable()`. Closes [#57](https://github.com/ckeditor/ckeditor5-image/issues/57). ([ecbe435](https://github.com/ckeditor/ckeditor5-image/commit/ecbe435))

  The styling and behavior of image's caption will now be reusable in other widgets.
* Named existing plugin(s). ([de96d07](https://github.com/ckeditor/ckeditor5-image/commit/de96d07))

### Other changes

* Aligned the use of the `Widget` plugin. Closes [#89](https://github.com/ckeditor/ckeditor5-image/issues/89). ([16f285d](https://github.com/ckeditor/ckeditor5-image/commit/16f285d))
* Extracted widget API to a separate package. Closes [#35](https://github.com/ckeditor/ckeditor5-image/issues/35). ([016b68e](https://github.com/ckeditor/ckeditor5-image/commit/016b68e))
* Fixed import paths after [refactoring in ckeditor5-ui](https://github.com/ckeditor/ckeditor5-ui/pull/156). Closes [#52](https://github.com/ckeditor/ckeditor5-image/issues/52). ([cc8f671](https://github.com/ckeditor/ckeditor5-image/commit/cc8f671))
* Imported captioned image styles from ckeditor5.github.io. Closes [#68](https://github.com/ckeditor/ckeditor5-image/issues/68). ([2f993bc](https://github.com/ckeditor/ckeditor5-image/commit/2f993bc))
* Improved visual styles of the image widget. Closes [#12](https://github.com/ckeditor/ckeditor5-image/issues/12). ([8fa3746](https://github.com/ckeditor/ckeditor5-image/commit/8fa3746))
* Updated translations. ([966d911](https://github.com/ckeditor/ckeditor5-image/commit/966d911))

### BREAKING CHANGES

* The widget API is now available in the `ckeditor5-widget` package. See [#35](https://github.com/ckeditor/ckeditor5-image/issues/35).


## [0.4.0](https://github.com/ckeditor/ckeditor5-image/compare/v0.3.0...v0.4.0) (2017-03-06)

### Bug fixes

* Moved focus tracking setup to `ImageBalloonPanelView#init()` method to prevent too early access to the view element. Closes [#42](https://github.com/ckeditor/ckeditor5/issues/42). ([985e509](https://github.com/ckeditor/ckeditor5-image/commit/985e509))
* Used "low-vision" icon instead of "input" for text alternative button. Closes [#59](https://github.com/ckeditor/ckeditor5/issues/59). ([6edd823](https://github.com/ckeditor/ckeditor5-image/commit/6edd823))

### Features

* Added a separator between image styles and text alternative buttons in the image toolbar. Closes [#64](https://github.com/ckeditor/ckeditor5/issues/64). ([925a538](https://github.com/ckeditor/ckeditor5-image/commit/925a538))
* Introduced image captions support. Closes [#28](https://github.com/ckeditor/ckeditor5/issues/28). ([6bb4069](https://github.com/ckeditor/ckeditor5-image/commit/6bb4069))

### Other changes

* Enhanced how selection label for widgets is defined. Closes [#9](https://github.com/ckeditor/ckeditor5/issues/9). ([5c1897d](https://github.com/ckeditor/ckeditor5-image/commit/5c1897d))
* Renamed "Image alternate text" to "Image text alternative" all across the code. Improved directory structure to have most important features in the top level of `src/`. Closes [#37](https://github.com/ckeditor/ckeditor5/issues/37). ([e38675f](https://github.com/ckeditor/ckeditor5-image/commit/e38675f))
* Uploaded translations. ([d619f1d](https://github.com/ckeditor/ckeditor5-image/commit/d619f1d))


### BREAKING CHANGES

* The `src/imagealternatetext/imagealternatetext` module is now `src/imagetextalternative`. All other related classes and directories were renamed too.
* All the base image's util modules are now inside `src/image/`. The same applies to all other features. The main features are now directly in `src/`. Closes [#33](https://github.com/ckeditor/ckeditor5/issues/33). Closes [#26](https://github.com/ckeditor/ckeditor5/issues/26).
