Changelog
=========

## [17.0.0](https://github.com/ckeditor/ckeditor5-upload/compare/v16.0.0...v17.0.0) (2020-02-19)

### Other changes

* Updated translations. ([5be630b](https://github.com/ckeditor/ckeditor5-upload/commit/5be630b))


## [16.0.0](https://github.com/ckeditor/ckeditor5-upload/compare/v15.0.0...v16.0.0) (2019-12-04)

### Other changes

* Updated translations. ([188255c](https://github.com/ckeditor/ckeditor5-upload/commit/188255c))


## [15.0.0](https://github.com/ckeditor/ckeditor5-upload/compare/v12.0.0...v15.0.0) (2019-10-23)

### Bug fixes

* Add missing `catch()` clauses to file loader promises. ([40906d4](https://github.com/ckeditor/ckeditor5-upload/commit/40906d4))

### Other changes

* Updated translations. ([290db0f](https://github.com/ckeditor/ckeditor5-upload/commit/290db0f)) ([1d7e907](https://github.com/ckeditor/ckeditor5-upload/commit/1d7e907))


## [12.0.0](https://github.com/ckeditor/ckeditor5-upload/compare/v11.1.1...v12.0.0) (2019-08-26)

### Features

* Implemented the `SimpleUploadAdapter` plugin which enables file uploads in CKEditor 5 using configurable `XMLHttpRequests` to a server. Closes [ckeditor/ckeditor5#1791](https://github.com/ckeditor/ckeditor5/issues/1791). ([441c597](https://github.com/ckeditor/ckeditor5-upload/commit/441c597))

  ```js
  import Base64UploadAdapter from '@ckeditor/ckeditor5-upload/src/adapters/base64uploadadapter'
  ```
* Implemented the responsive image support in the `SimpleUploadAdapter`. Closes [#97](https://github.com/ckeditor/ckeditor5-upload/issues/97). ([b5092a4](https://github.com/ckeditor/ckeditor5-upload/commit/b5092a4))

### Other changes

* Add `ImageLoader.data` property for already read file to allow synchronous access to file data. ([ec56ab8](https://github.com/ckeditor/ckeditor5-upload/commit/ec56ab8))
* The issue tracker for this package was moved to https://github.com/ckeditor/ckeditor5/issues. See [ckeditor/ckeditor5#1988](https://github.com/ckeditor/ckeditor5/issues/1988). ([1893794](https://github.com/ckeditor/ckeditor5-upload/commit/1893794))
* Updated translations. ([594b6c1](https://github.com/ckeditor/ckeditor5-upload/commit/594b6c1))

### BREAKING CHANGES

* Moved the `Base64UploadAdapter` plugin file to `ckeditor5-upload/src/adapters/base64uploadadapter.js`. Make sure import paths your project are up–to–date:

```js
import Base64UploadAdapter from '@ckeditor/ckeditor5-upload/src/adapters/base64uploadadapter'
```


## [11.1.1](https://github.com/ckeditor/ckeditor5-upload/compare/v11.1.0...v11.1.1) (2019-07-10)

Internal changes only (updated dependencies, documentation, etc.).


## [11.1.0](https://github.com/ckeditor/ckeditor5-upload/compare/v11.0.2...v11.1.0) (2019-07-04)

### Features

* Introduced the Base64 image upload adapter. Closes [ckeditor/ckeditor5#1378](https://github.com/ckeditor/ckeditor5/issues/1378). ([938f0f7](https://github.com/ckeditor/ckeditor5-upload/commit/938f0f7))


## [11.0.2](https://github.com/ckeditor/ckeditor5-upload/compare/v11.0.1...v11.0.2) (2019-06-05)

### Other changes

* Updated translations. ([73c6761](https://github.com/ckeditor/ckeditor5-upload/commit/73c6761))


## [11.0.1](https://github.com/ckeditor/ckeditor5-upload/compare/v11.0.0...v11.0.1) (2019-04-10)

### Other changes

* Updated translations. ([eac33b1](https://github.com/ckeditor/ckeditor5-upload/commit/eac33b1))


## [11.0.0](https://github.com/ckeditor/ckeditor5-upload/compare/v10.0.4...v11.0.0) (2019-02-28)

### Bug fixes

* `FileLoader` now accepts `Promise` instead of a `File` instance. Closes [#87](https://github.com/ckeditor/ckeditor5-upload/issues/87). ([62a8c69](https://github.com/ckeditor/ckeditor5-upload/commit/62a8c69))

### Other changes

* Add catch block for failed file promise in `FileRepository`. ([a2de5d5](https://github.com/ckeditor/ckeditor5-upload/commit/a2de5d5))
* Updated translations. ([6aaad73](https://github.com/ckeditor/ckeditor5-upload/commit/6aaad73)) ([b0469a8](https://github.com/ckeditor/ckeditor5-upload/commit/b0469a8)) ([f6e27cb](https://github.com/ckeditor/ckeditor5-upload/commit/f6e27cb))

### BREAKING CHANGES

* Upgraded minimal versions of Node to `8.0.0` and npm to `5.7.1`. See: [ckeditor/ckeditor5#1507](https://github.com/ckeditor/ckeditor5/issues/1507). ([612ea3c](https://github.com/ckeditor/ckeditor5-cloud-services/commit/612ea3c))
* The `FileLoader.file` property was changed to a getter which returns a native `Promise` instance instead of a `File` instance. The returned promise resolves to a `File` instance.


## [10.0.4](https://github.com/ckeditor/ckeditor5-upload/compare/v10.0.3...v10.0.4) (2018-12-05)

### Other changes

* Updated translations. ([489b6fa](https://github.com/ckeditor/ckeditor5-upload/commit/489b6fa)) ([f435630](https://github.com/ckeditor/ckeditor5-upload/commit/f435630))


## [10.0.3](https://github.com/ckeditor/ckeditor5-upload/compare/v10.0.2...v10.0.3) (2018-10-08)

### Other changes

* Updated translations. ([871eb44](https://github.com/ckeditor/ckeditor5-upload/commit/871eb44))


## [10.0.2](https://github.com/ckeditor/ckeditor5-upload/compare/v10.0.1...v10.0.2) (2018-07-18)

### Other changes

* Updated translations. ([ce32eb2](https://github.com/ckeditor/ckeditor5-upload/commit/ce32eb2), [9adb325](https://github.com/ckeditor/ckeditor5-upload/commit/9adb325))


## [10.0.1](https://github.com/ckeditor/ckeditor5-upload/compare/v10.0.0...v10.0.1) (2018-06-21)

### Other changes

* Updated translations.


## [10.0.0](https://github.com/ckeditor/ckeditor5-upload/compare/v1.0.0-beta.4...v10.0.0) (2018-04-25)

### Other changes

* Changed the license to GPL2+ only. See [ckeditor/ckeditor5#991](https://github.com/ckeditor/ckeditor5/issues/991). ([8293240](https://github.com/ckeditor/ckeditor5-upload/commit/8293240))

### BREAKING CHANGES

* The license under which CKEditor 5 is released has been changed from a triple GPL, LGPL and MPL license to a GPL2+ only. See [ckeditor/ckeditor5#991](https://github.com/ckeditor/ckeditor5/issues/991) for more information.


## [1.0.0-beta.4](https://github.com/ckeditor/ckeditor5-upload/compare/v1.0.0-beta.2...v1.0.0-beta.4) (2018-04-19)

Internal changes only (updated dependencies, documentation, etc.).


## [1.0.0-beta.2](https://github.com/ckeditor/ckeditor5-upload/compare/v1.0.0-beta.1...v1.0.0-beta.2) (2018-04-10)

Internal changes only (updated dependencies, documentation, etc.).


## [1.0.0-beta.1](https://github.com/ckeditor/ckeditor5-upload/compare/v1.0.0-alpha.2...v1.0.0-beta.1) (2018-03-15)

### Bug fixes

* Fixed incorrect `ImageUploadButton` and `ImageUploadCommand` binding. Closes [#77](https://github.com/ckeditor/ckeditor5-upload/issues/77). Closes https://github.com/ckeditor/ckeditor5-ui/issues/357. ([d231ea6](https://github.com/ckeditor/ckeditor5-upload/commit/d231ea6))

### Other changes

* Migrated package styles to PostCSS. Moved visual styles to `@ckeditor/ckeditor5-theme-lark` (see [ckeditor/ckeditor5-ui#144](https://github.com/ckeditor/ckeditor5-ui/issues/144)). ([faf6100](https://github.com/ckeditor/ckeditor5-upload/commit/faf6100))
* Moved the image upload plugins to the `@ckeditor/ckeditor5-image` package. Minor cleanup in the API. Closes [#22](https://github.com/ckeditor/ckeditor5-upload/issues/22). ([55697a9](https://github.com/ckeditor/ckeditor5-upload/commit/55697a9))
* Use post-fixer API. ([08e9d09](https://github.com/ckeditor/ckeditor5-upload/commit/08e9d09))

### BREAKING CHANGES

* Renamed `Adapter` to `UploadAdapter`.
* Removed `ImageUpload` plugin. It can be no found in ckeditor5-image repository.
* Removed `ImageUploadEngine` plugin. It can be no found in ckeditor5-image repository.
* Removed `ImageUploadProgress` plugin. It can be no found in ckeditor5-image repository.
* Removed `ImageUploadButton` plugin. It can be no found in ckeditor5-image repository.
* Renamed `FileRepository#createAdapter()` to `FileRepository#createUploadAdapter()`.
* Renamed `filerepository-no-adapter` error to `filerepository-no-upload-adapter`.


## [1.0.0-alpha.2](https://github.com/ckeditor/ckeditor5-upload/compare/v1.0.0-alpha.1...v1.0.0-alpha.2) (2017-11-14)

### Bug fixes

* Destroying `FileDialogButtonView` should not throw an error. Closes [#66](https://github.com/ckeditor/ckeditor5-upload/issues/66). ([2d4ba62](https://github.com/ckeditor/ckeditor5-upload/commit/2d4ba62))
* Images pasted with additional HTML content will not be handled by the upload plugin which prevents data pasted from MS Word to be treated as an image. Closes [#68](https://github.com/ckeditor/ckeditor5-upload/issues/68). ([8d0644a](https://github.com/ckeditor/ckeditor5-upload/commit/8d0644a))

### Other changes

* Updated translations. ([93e9643](https://github.com/ckeditor/ckeditor5-upload/commit/93e9643))
* Aligned UI library usage to the [changes in the UI framework](https://github.com/ckeditor/ckeditor5-ui/pull/332).

### BREAKING CHANGES

* The `FileDialogButtonView` is not a `ButtonView` instance anymore but a wrapper instead. The button of the component is available under the `#buttonView` property.


## [1.0.0-alpha.1](https://github.com/ckeditor/ckeditor5-upload/compare/v0.2.0...v1.0.0-alpha.1) (2017-10-03)

### Bug fixes

* Image placeholder is now correctly displayed on Firefox and Edge. Closes [#56](https://github.com/ckeditor/ckeditor5-upload/issues/56). ([785e88b](https://github.com/ckeditor/ckeditor5-upload/commit/785e88b))
* Upload command should not crash when upload adapter is not specified (instead, FileRepository logs an error). Closes [#59](https://github.com/ckeditor/ckeditor5-upload/issues/59). ([14b738b](https://github.com/ckeditor/ckeditor5-upload/commit/14b738b))

### Other changes

* `FileRepository` will automatically warn when it's initialized but no upload adapter was enabled. Closes [#58](https://github.com/ckeditor/ckeditor5-upload/issues/58). ([29aa315](https://github.com/ckeditor/ckeditor5-upload/commit/29aa315))
* Placeholder image will now look better on wider editors. Closes [#63](https://github.com/ckeditor/ckeditor5-upload/issues/63). ([edb5e81](https://github.com/ckeditor/ckeditor5-upload/commit/edb5e81))


## [0.2.0](https://github.com/ckeditor/ckeditor5-upload/compare/v0.1.0...v0.2.0) (2017-09-03)

### Bug fixes

* [Safari, Edge] The image upload (button) feature will not throw an error anymore when trying to access picked files. The feature should not use `for...of` loop on native `FileList` because Safari and Edge do not support `Symbol.iterator` for it yet. Closes [#35](https://github.com/ckeditor/ckeditor5-upload/issues/35). ([f4efd9b](https://github.com/ckeditor/ckeditor5-upload/commit/f4efd9b))
* An image dropped on another image will not redirect the browser to the file's path. Closes [#32](https://github.com/ckeditor/ckeditor5-upload/issues/32). ([4f533be](https://github.com/ckeditor/ckeditor5-upload/commit/4f533be))
* Bound `ImageUploadButton#isEnabled` to `ImageUploadCommand#isEnabled`. Closes [#43](https://github.com/ckeditor/ckeditor5-upload/issues/43). ([ba6de66](https://github.com/ckeditor/ckeditor5-upload/commit/ba6de66))
* Fixed two issues related to dropping images. First, when dropping a file into an empty paragraph, that paragraph should be replaced with that image. Second, drop position should be read correctly when the editor is focused upon drop. Closes [#42](https://github.com/ckeditor/ckeditor5-upload/issues/42). Closes [#29](https://github.com/ckeditor/ckeditor5-upload/issues/29). ([fec452d](https://github.com/ckeditor/ckeditor5-upload/commit/fec452d))
* Image will be inserted after the block if the selection is placed at the block's end. Closes [#7](https://github.com/ckeditor/ckeditor5-upload/issues/7). ([70742f9](https://github.com/ckeditor/ckeditor5-upload/commit/70742f9))
* When image upload is aborted, now the "image placeholder" element is permanently removed so it is not reinserted on undo. Closes [#38](https://github.com/ckeditor/ckeditor5-upload/issues/38). ([aff6382](https://github.com/ckeditor/ckeditor5-upload/commit/aff6382))

### Features

* Responsive images support in image upload. Closes [#34](https://github.com/ckeditor/ckeditor5-upload/issues/34). ([9a022a2](https://github.com/ckeditor/ckeditor5-upload/commit/9a022a2))
* The `ImageUploadCommand` now accepts `insertAt` position which allows customizing where the image will be inserted. Closes [#45](https://github.com/ckeditor/ckeditor5-upload/issues/45). ([b90c8d7](https://github.com/ckeditor/ckeditor5-upload/commit/b90c8d7))

### Other changes

* Aborting upload when image is removed and removing image on upload error. Closes [#2](https://github.com/ckeditor/ckeditor5-upload/issues/2). ([c3bbb57](https://github.com/ckeditor/ckeditor5-upload/commit/c3bbb57))
* Aligned the implementation to the new Command API (see https://github.com/ckeditor/ckeditor5-core/issues/88). ([3d97b81](https://github.com/ckeditor/ckeditor5-upload/commit/3d97b81))
* Changed from original to default image. Closes [#49](https://github.com/ckeditor/ckeditor5-upload/issues/49). ([d8d61f3](https://github.com/ckeditor/ckeditor5-upload/commit/d8d61f3))
* Cleaned up SVG icons. ([ab81012](https://github.com/ckeditor/ckeditor5-upload/commit/ab81012))
* Optional notification title when upload fails. Closes [#30](https://github.com/ckeditor/ckeditor5-upload/issues/30). ([1a6306c](https://github.com/ckeditor/ckeditor5-upload/commit/1a6306c))

### BREAKING CHANGES

* `UploadImageCommand` doesn't optimize the drop position itself anymore. Instead, a separate `findOptimalInsertionPosition()` function was introduced.
* `UploadImageCommand` doesn't verify the type of file anymore. This needs to be done by the caller.
* The command API has been changed.


## 0.1.0 (2017-05-07)

### Features

* Initial implementation. Closes [#1](https://github.com/ckeditor/ckeditor5-upload/issues/1).
