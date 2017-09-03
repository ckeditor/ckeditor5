Changelog
=========

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
