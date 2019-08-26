Changelog
=========

## [12.4.0](https://github.com/ckeditor/ckeditor5-build-balloon-block/compare/v12.3.1...v12.4.0) (2019-08-26)

This release brings a huge set of new features: [image resizing](https://ckeditor.com/ckeditor5/build/docs/ckeditor5/latest/features/image.html#resizing-images), [to-do lists](https://ckeditor.com/ckeditor5/build/docs/ckeditor5/latest/features/todo-lists.html), [support for RTL languages](https://ckeditor.com/ckeditor5/build/docs/ckeditor5/latest/features/ui-language.html), [simple upload adapter](https://ckeditor.com/ckeditor5/build/docs/ckeditor5/latest/features/image-upload/simple-upload-adapter.html), [support for pasting from Google Docs](https://ckeditor.com/ckeditor5/build/docs/ckeditor5/latest/features/paste-from-office/paste-from-google-docs.html), [mathematic formulas](https://ckeditor.com/ckeditor5/build/docs/ckeditor5/latest/features/mathtype.html), and [spelling and grammar checking](https://ckeditor.com/ckeditor5/build/docs/ckeditor5/latest/features/spell-checker.html). In addition to that, as always, it contains many improvements and bug fixes.

### Dependencies

Major releases (contain breaking changes):

* [@ckeditor/ckeditor5-engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine): v13.2.1 => [v14.0.0](https://github.com/ckeditor/ckeditor5-engine/releases/tag/v14.0.0)
* [@ckeditor/ckeditor5-image](https://www.npmjs.com/package/@ckeditor/ckeditor5-image): v13.1.2 => [v14.0.0](https://github.com/ckeditor/ckeditor5-image/releases/tag/v14.0.0)
* [@ckeditor/ckeditor5-table](https://www.npmjs.com/package/@ckeditor/ckeditor5-table): v13.0.2 => [v14.0.0](https://github.com/ckeditor/ckeditor5-table/releases/tag/v14.0.0)
* [@ckeditor/ckeditor5-ui](https://www.npmjs.com/package/@ckeditor/ckeditor5-ui): v13.0.2 => [v14.0.0](https://github.com/ckeditor/ckeditor5-ui/releases/tag/v14.0.0)
* [@ckeditor/ckeditor5-upload](https://www.npmjs.com/package/@ckeditor/ckeditor5-upload): v11.1.1 => [v12.0.0](https://github.com/ckeditor/ckeditor5-upload/releases/tag/v12.0.0)
* [@ckeditor/ckeditor5-utils](https://www.npmjs.com/package/@ckeditor/ckeditor5-utils): v13.0.1 => [v14.0.0](https://github.com/ckeditor/ckeditor5-utils/releases/tag/v14.0.0)

Minor releases:

* [@ckeditor/ckeditor5-core](https://www.npmjs.com/package/@ckeditor/ckeditor5-core): v12.2.1 => [v12.3.0](https://github.com/ckeditor/ckeditor5-core/releases/tag/v12.3.0)
* [@ckeditor/ckeditor5-enter](https://www.npmjs.com/package/@ckeditor/ckeditor5-enter): v11.0.4 => [v11.1.0](https://github.com/ckeditor/ckeditor5-enter/releases/tag/v11.1.0)
* [@ckeditor/ckeditor5-list](https://www.npmjs.com/package/@ckeditor/ckeditor5-list): v12.0.4 => [v12.1.0](https://github.com/ckeditor/ckeditor5-list/releases/tag/v12.1.0)
* [@ckeditor/ckeditor5-paste-from-office](https://www.npmjs.com/package/@ckeditor/ckeditor5-paste-from-office): v11.0.4 => [v11.1.0](https://github.com/ckeditor/ckeditor5-paste-from-office/releases/tag/v11.1.0)
* [@ckeditor/ckeditor5-theme-lark](https://www.npmjs.com/package/@ckeditor/ckeditor5-theme-lark): v14.1.1 => [v14.2.0](https://github.com/ckeditor/ckeditor5-theme-lark/releases/tag/v14.2.0)
* [@ckeditor/ckeditor5-typing](https://www.npmjs.com/package/@ckeditor/ckeditor5-typing): v12.1.1 => [v12.2.0](https://github.com/ckeditor/ckeditor5-typing/releases/tag/v12.2.0)
* [@ckeditor/ckeditor5-widget](https://www.npmjs.com/package/@ckeditor/ckeditor5-widget): v11.0.4 => [v11.1.0](https://github.com/ckeditor/ckeditor5-widget/releases/tag/v11.1.0)

Patch releases (bug fixes, internal changes):

* [@ckeditor/ckeditor5-adapter-ckfinder](https://www.npmjs.com/package/@ckeditor/ckeditor5-adapter-ckfinder): v11.0.4 => [v11.0.5](https://github.com/ckeditor/ckeditor5-adapter-ckfinder/releases/tag/v11.0.5)
* [@ckeditor/ckeditor5-autoformat](https://www.npmjs.com/package/@ckeditor/ckeditor5-autoformat): v11.0.4 => [v11.0.5](https://github.com/ckeditor/ckeditor5-autoformat/releases/tag/v11.0.5)
* [@ckeditor/ckeditor5-basic-styles](https://www.npmjs.com/package/@ckeditor/ckeditor5-basic-styles): v11.1.3 => [v11.1.4](https://github.com/ckeditor/ckeditor5-basic-styles/releases/tag/v11.1.4)
* [@ckeditor/ckeditor5-block-quote](https://www.npmjs.com/package/@ckeditor/ckeditor5-block-quote): v11.1.2 => [v11.1.3](https://github.com/ckeditor/ckeditor5-block-quote/releases/tag/v11.1.3)
* [@ckeditor/ckeditor5-ckfinder](https://www.npmjs.com/package/@ckeditor/ckeditor5-ckfinder): v11.0.4 => [v11.0.5](https://github.com/ckeditor/ckeditor5-ckfinder/releases/tag/v11.0.5)
* [@ckeditor/ckeditor5-clipboard](https://www.npmjs.com/package/@ckeditor/ckeditor5-clipboard): v12.0.1 => [v12.0.2](https://github.com/ckeditor/ckeditor5-clipboard/releases/tag/v12.0.2)
* [@ckeditor/ckeditor5-cloud-services](https://www.npmjs.com/package/@ckeditor/ckeditor5-cloud-services): v11.0.4 => [v11.0.5](https://github.com/ckeditor/ckeditor5-cloud-services/releases/tag/v11.0.5)
* [@ckeditor/ckeditor5-easy-image](https://www.npmjs.com/package/@ckeditor/ckeditor5-easy-image): v11.0.4 => [v11.0.5](https://github.com/ckeditor/ckeditor5-easy-image/releases/tag/v11.0.5)
* [@ckeditor/ckeditor5-editor-balloon](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-balloon): v12.2.1 => [v12.2.2](https://github.com/ckeditor/ckeditor5-editor-balloon/releases/tag/v12.2.2)
* [@ckeditor/ckeditor5-essentials](https://www.npmjs.com/package/@ckeditor/ckeditor5-essentials): v11.0.4 => [v11.0.5](https://github.com/ckeditor/ckeditor5-essentials/releases/tag/v11.0.5)
* [@ckeditor/ckeditor5-heading](https://www.npmjs.com/package/@ckeditor/ckeditor5-heading): v11.0.4 => [v11.0.5](https://github.com/ckeditor/ckeditor5-heading/releases/tag/v11.0.5)
* [@ckeditor/ckeditor5-link](https://www.npmjs.com/package/@ckeditor/ckeditor5-link): v11.1.1 => [v11.1.2](https://github.com/ckeditor/ckeditor5-link/releases/tag/v11.1.2)
* [@ckeditor/ckeditor5-media-embed](https://www.npmjs.com/package/@ckeditor/ckeditor5-media-embed): v11.1.3 => [v11.1.4](https://github.com/ckeditor/ckeditor5-media-embed/releases/tag/v11.1.4)
* [@ckeditor/ckeditor5-paragraph](https://www.npmjs.com/package/@ckeditor/ckeditor5-paragraph): v11.0.4 => [v11.0.5](https://github.com/ckeditor/ckeditor5-paragraph/releases/tag/v11.0.5)
* [@ckeditor/ckeditor5-undo](https://www.npmjs.com/package/@ckeditor/ckeditor5-undo): v11.0.4 => [v11.0.5](https://github.com/ckeditor/ckeditor5-undo/releases/tag/v11.0.5)

### Other changes

* Bumped style-loader to v1.0.0. Aligned the webpack config to the new loader API. See [ckeditor/ckeditor5#1945](https://github.com/ckeditor/ckeditor5/issues/1945). ([46c9514](https://github.com/ckeditor/ckeditor5-build-balloon-block/commit/46c9514))
* The issue tracker for this package was moved to https://github.com/ckeditor/ckeditor5/issues. See [ckeditor/ckeditor5#1988](https://github.com/ckeditor/ckeditor5/issues/1988). ([7b8f1bc](https://github.com/ckeditor/ckeditor5-build-balloon-block/commit/7b8f1bc))


## [12.3.1](https://github.com/ckeditor/ckeditor5-build-balloon-block/compare/v12.3.0...v12.3.1) (2019-07-10)

We are happy to report the release of CKEditor 5 v12.3.0 (and v12.3.1 with a small fix). This release introduces several new features ([word count](https://ckeditor.com/docs/ckeditor5/latest/features/word-count.html), [automatic text transformations](https://ckeditor.com/docs/ckeditor5/latest/features/text-transformation.html), [ability to control link attributes such as `target`](https://ckeditor.com/docs/ckeditor5/latest/features/link.html#custom-link-attributes-decorators) and [block indentation](https://ckeditor.com/docs/ckeditor5/latest/features/indent.html)). It also brings improvements to existing features (e.g. the ["document colors" section](https://ckeditor.com/docs/ckeditor5/latest/features/font.html#documents-colors) in the font color picker dropdowns) and many bug fixes.

### Dependencies

Patch releases (bug fixes, internal changes):

* [@ckeditor/ckeditor5-adapter-ckfinder](https://www.npmjs.com/package/@ckeditor/ckeditor5-adapter-ckfinder): v11.0.3 => [v11.0.4](https://github.com/ckeditor/ckeditor5-adapter-ckfinder/releases/tag/v11.0.4)
* [@ckeditor/ckeditor5-autoformat](https://www.npmjs.com/package/@ckeditor/ckeditor5-autoformat): v11.0.3 => [v11.0.4](https://github.com/ckeditor/ckeditor5-autoformat/releases/tag/v11.0.4)
* [@ckeditor/ckeditor5-basic-styles](https://www.npmjs.com/package/@ckeditor/ckeditor5-basic-styles): v11.1.2 => [v11.1.3](https://github.com/ckeditor/ckeditor5-basic-styles/releases/tag/v11.1.3)
* [@ckeditor/ckeditor5-block-quote](https://www.npmjs.com/package/@ckeditor/ckeditor5-block-quote): v11.1.1 => [v11.1.2](https://github.com/ckeditor/ckeditor5-block-quote/releases/tag/v11.1.2)
* [@ckeditor/ckeditor5-ckfinder](https://www.npmjs.com/package/@ckeditor/ckeditor5-ckfinder): v11.0.3 => [v11.0.4](https://github.com/ckeditor/ckeditor5-ckfinder/releases/tag/v11.0.4)
* [@ckeditor/ckeditor5-clipboard](https://www.npmjs.com/package/@ckeditor/ckeditor5-clipboard): v12.0.0 => [v12.0.1](https://github.com/ckeditor/ckeditor5-clipboard/releases/tag/v12.0.1)
* [@ckeditor/ckeditor5-cloud-services](https://www.npmjs.com/package/@ckeditor/ckeditor5-cloud-services): v11.0.3 => [v11.0.4](https://github.com/ckeditor/ckeditor5-cloud-services/releases/tag/v11.0.4)
* [@ckeditor/ckeditor5-core](https://www.npmjs.com/package/@ckeditor/ckeditor5-core): v12.2.0 => [v12.2.1](https://github.com/ckeditor/ckeditor5-core/releases/tag/v12.2.1)
* [@ckeditor/ckeditor5-easy-image](https://www.npmjs.com/package/@ckeditor/ckeditor5-easy-image): v11.0.3 => [v11.0.4](https://github.com/ckeditor/ckeditor5-easy-image/releases/tag/v11.0.4)
* [@ckeditor/ckeditor5-editor-balloon](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-balloon): v12.2.0 => [v12.2.1](https://github.com/ckeditor/ckeditor5-editor-balloon/releases/tag/v12.2.1)
* [@ckeditor/ckeditor5-engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine): v13.2.0 => [v13.2.1](https://github.com/ckeditor/ckeditor5-engine/releases/tag/v13.2.1)
* [@ckeditor/ckeditor5-enter](https://www.npmjs.com/package/@ckeditor/ckeditor5-enter): v11.0.3 => [v11.0.4](https://github.com/ckeditor/ckeditor5-enter/releases/tag/v11.0.4)
* [@ckeditor/ckeditor5-essentials](https://www.npmjs.com/package/@ckeditor/ckeditor5-essentials): v11.0.3 => [v11.0.4](https://github.com/ckeditor/ckeditor5-essentials/releases/tag/v11.0.4)
* [@ckeditor/ckeditor5-heading](https://www.npmjs.com/package/@ckeditor/ckeditor5-heading): v11.0.3 => [v11.0.4](https://github.com/ckeditor/ckeditor5-heading/releases/tag/v11.0.4)
* [@ckeditor/ckeditor5-image](https://www.npmjs.com/package/@ckeditor/ckeditor5-image): v13.1.1 => [v13.1.2](https://github.com/ckeditor/ckeditor5-image/releases/tag/v13.1.2)
* [@ckeditor/ckeditor5-link](https://www.npmjs.com/package/@ckeditor/ckeditor5-link): v11.1.0 => [v11.1.1](https://github.com/ckeditor/ckeditor5-link/releases/tag/v11.1.1)
* [@ckeditor/ckeditor5-list](https://www.npmjs.com/package/@ckeditor/ckeditor5-list): v12.0.3 => [v12.0.4](https://github.com/ckeditor/ckeditor5-list/releases/tag/v12.0.4)
* [@ckeditor/ckeditor5-media-embed](https://www.npmjs.com/package/@ckeditor/ckeditor5-media-embed): v11.1.2 => [v11.1.3](https://github.com/ckeditor/ckeditor5-media-embed/releases/tag/v11.1.3)
* [@ckeditor/ckeditor5-paragraph](https://www.npmjs.com/package/@ckeditor/ckeditor5-paragraph): v11.0.3 => [v11.0.4](https://github.com/ckeditor/ckeditor5-paragraph/releases/tag/v11.0.4)
* [@ckeditor/ckeditor5-paste-from-office](https://www.npmjs.com/package/@ckeditor/ckeditor5-paste-from-office): v11.0.3 => [v11.0.4](https://github.com/ckeditor/ckeditor5-paste-from-office/releases/tag/v11.0.4)
* [@ckeditor/ckeditor5-table](https://www.npmjs.com/package/@ckeditor/ckeditor5-table): v13.0.1 => [v13.0.2](https://github.com/ckeditor/ckeditor5-table/releases/tag/v13.0.2)
* [@ckeditor/ckeditor5-theme-lark](https://www.npmjs.com/package/@ckeditor/ckeditor5-theme-lark): v14.1.0 => [v14.1.1](https://github.com/ckeditor/ckeditor5-theme-lark/releases/tag/v14.1.1)
* [@ckeditor/ckeditor5-typing](https://www.npmjs.com/package/@ckeditor/ckeditor5-typing): v12.1.0 => [v12.1.1](https://github.com/ckeditor/ckeditor5-typing/releases/tag/v12.1.1)
* [@ckeditor/ckeditor5-ui](https://www.npmjs.com/package/@ckeditor/ckeditor5-ui): v13.0.1 => [v13.0.2](https://github.com/ckeditor/ckeditor5-ui/releases/tag/v13.0.2)
* [@ckeditor/ckeditor5-undo](https://www.npmjs.com/package/@ckeditor/ckeditor5-undo): v11.0.3 => [v11.0.4](https://github.com/ckeditor/ckeditor5-undo/releases/tag/v11.0.4)
* [@ckeditor/ckeditor5-upload](https://www.npmjs.com/package/@ckeditor/ckeditor5-upload): v11.1.0 => [v11.1.1](https://github.com/ckeditor/ckeditor5-upload/releases/tag/v11.1.1)
* [@ckeditor/ckeditor5-utils](https://www.npmjs.com/package/@ckeditor/ckeditor5-utils): v13.0.0 => [v13.0.1](https://github.com/ckeditor/ckeditor5-utils/releases/tag/v13.0.1)
* [@ckeditor/ckeditor5-widget](https://www.npmjs.com/package/@ckeditor/ckeditor5-widget): v11.0.3 => [v11.0.4](https://github.com/ckeditor/ckeditor5-widget/releases/tag/v11.0.4)


## [12.3.0](https://github.com/ckeditor/ckeditor5-build-balloon-block/compare/v12.2.0...v12.3.0) (2019-07-04)

### Dependencies

Major releases (contain breaking changes):

* [@ckeditor/ckeditor5-clipboard](https://www.npmjs.com/package/@ckeditor/ckeditor5-clipboard): v11.0.2 => [v12.0.0](https://github.com/ckeditor/ckeditor5-clipboard/releases/tag/v12.0.0)
* [@ckeditor/ckeditor5-utils](https://www.npmjs.com/package/@ckeditor/ckeditor5-utils): v12.1.1 => [v13.0.0](https://github.com/ckeditor/ckeditor5-utils/releases/tag/v13.0.0)

Minor releases:

* [@ckeditor/ckeditor5-core](https://www.npmjs.com/package/@ckeditor/ckeditor5-core): v12.1.1 => [v12.2.0](https://github.com/ckeditor/ckeditor5-core/releases/tag/v12.2.0)
* [@ckeditor/ckeditor5-editor-balloon](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-balloon): v12.1.1 => [v12.2.0](https://github.com/ckeditor/ckeditor5-editor-balloon/releases/tag/v12.2.0)
* [@ckeditor/ckeditor5-engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine): v13.1.1 => [v13.2.0](https://github.com/ckeditor/ckeditor5-engine/releases/tag/v13.2.0)
* [@ckeditor/ckeditor5-link](https://www.npmjs.com/package/@ckeditor/ckeditor5-link): v11.0.2 => [v11.1.0](https://github.com/ckeditor/ckeditor5-link/releases/tag/v11.1.0)
* [@ckeditor/ckeditor5-theme-lark](https://www.npmjs.com/package/@ckeditor/ckeditor5-theme-lark): v14.0.0 => [v14.1.0](https://github.com/ckeditor/ckeditor5-theme-lark/releases/tag/v14.1.0)
* [@ckeditor/ckeditor5-typing](https://www.npmjs.com/package/@ckeditor/ckeditor5-typing): v12.0.2 => [v12.1.0](https://github.com/ckeditor/ckeditor5-typing/releases/tag/v12.1.0)
* [@ckeditor/ckeditor5-upload](https://www.npmjs.com/package/@ckeditor/ckeditor5-upload): v11.0.2 => [v11.1.0](https://github.com/ckeditor/ckeditor5-upload/releases/tag/v11.1.0)

Patch releases (bug fixes, internal changes):

* [@ckeditor/ckeditor5-adapter-ckfinder](https://www.npmjs.com/package/@ckeditor/ckeditor5-adapter-ckfinder): v11.0.2 => [v11.0.3](https://github.com/ckeditor/ckeditor5-adapter-ckfinder/releases/tag/v11.0.3)
* [@ckeditor/ckeditor5-autoformat](https://www.npmjs.com/package/@ckeditor/ckeditor5-autoformat): v11.0.2 => [v11.0.3](https://github.com/ckeditor/ckeditor5-autoformat/releases/tag/v11.0.3)
* [@ckeditor/ckeditor5-basic-styles](https://www.npmjs.com/package/@ckeditor/ckeditor5-basic-styles): v11.1.1 => [v11.1.2](https://github.com/ckeditor/ckeditor5-basic-styles/releases/tag/v11.1.2)
* [@ckeditor/ckeditor5-block-quote](https://www.npmjs.com/package/@ckeditor/ckeditor5-block-quote): v11.1.0 => [v11.1.1](https://github.com/ckeditor/ckeditor5-block-quote/releases/tag/v11.1.1)
* [@ckeditor/ckeditor5-ckfinder](https://www.npmjs.com/package/@ckeditor/ckeditor5-ckfinder): v11.0.2 => [v11.0.3](https://github.com/ckeditor/ckeditor5-ckfinder/releases/tag/v11.0.3)
* [@ckeditor/ckeditor5-cloud-services](https://www.npmjs.com/package/@ckeditor/ckeditor5-cloud-services): v11.0.2 => [v11.0.3](https://github.com/ckeditor/ckeditor5-cloud-services/releases/tag/v11.0.3)
* [@ckeditor/ckeditor5-easy-image](https://www.npmjs.com/package/@ckeditor/ckeditor5-easy-image): v11.0.2 => [v11.0.3](https://github.com/ckeditor/ckeditor5-easy-image/releases/tag/v11.0.3)
* [@ckeditor/ckeditor5-enter](https://www.npmjs.com/package/@ckeditor/ckeditor5-enter): v11.0.2 => [v11.0.3](https://github.com/ckeditor/ckeditor5-enter/releases/tag/v11.0.3)
* [@ckeditor/ckeditor5-essentials](https://www.npmjs.com/package/@ckeditor/ckeditor5-essentials): v11.0.2 => [v11.0.3](https://github.com/ckeditor/ckeditor5-essentials/releases/tag/v11.0.3)
* [@ckeditor/ckeditor5-heading](https://www.npmjs.com/package/@ckeditor/ckeditor5-heading): v11.0.2 => [v11.0.3](https://github.com/ckeditor/ckeditor5-heading/releases/tag/v11.0.3)
* [@ckeditor/ckeditor5-image](https://www.npmjs.com/package/@ckeditor/ckeditor5-image): v13.1.0 => [v13.1.1](https://github.com/ckeditor/ckeditor5-image/releases/tag/v13.1.1)
* [@ckeditor/ckeditor5-list](https://www.npmjs.com/package/@ckeditor/ckeditor5-list): v12.0.2 => [v12.0.3](https://github.com/ckeditor/ckeditor5-list/releases/tag/v12.0.3)
* [@ckeditor/ckeditor5-media-embed](https://www.npmjs.com/package/@ckeditor/ckeditor5-media-embed): v11.1.1 => [v11.1.2](https://github.com/ckeditor/ckeditor5-media-embed/releases/tag/v11.1.2)
* [@ckeditor/ckeditor5-paragraph](https://www.npmjs.com/package/@ckeditor/ckeditor5-paragraph): v11.0.2 => [v11.0.3](https://github.com/ckeditor/ckeditor5-paragraph/releases/tag/v11.0.3)
* [@ckeditor/ckeditor5-paste-from-office](https://www.npmjs.com/package/@ckeditor/ckeditor5-paste-from-office): v11.0.2 => [v11.0.3](https://github.com/ckeditor/ckeditor5-paste-from-office/releases/tag/v11.0.3)
* [@ckeditor/ckeditor5-table](https://www.npmjs.com/package/@ckeditor/ckeditor5-table): v13.0.0 => [v13.0.1](https://github.com/ckeditor/ckeditor5-table/releases/tag/v13.0.1)
* [@ckeditor/ckeditor5-ui](https://www.npmjs.com/package/@ckeditor/ckeditor5-ui): v13.0.0 => [v13.0.1](https://github.com/ckeditor/ckeditor5-ui/releases/tag/v13.0.1)
* [@ckeditor/ckeditor5-undo](https://www.npmjs.com/package/@ckeditor/ckeditor5-undo): v11.0.2 => [v11.0.3](https://github.com/ckeditor/ckeditor5-undo/releases/tag/v11.0.3)
* [@ckeditor/ckeditor5-widget](https://www.npmjs.com/package/@ckeditor/ckeditor5-widget): v11.0.2 => [v11.0.3](https://github.com/ckeditor/ckeditor5-widget/releases/tag/v11.0.3)

### Other changes

* Moved "Undo" and "Redo" buttons from selection toolbar to block toolbar. Thanks to that, users are able to undo the last step if the editor is empty. Closes [ckeditor/ckeditor5#1543](https://github.com/ckeditor/ckeditor5/issues/1543). ([e25c2b8](https://github.com/ckeditor/ckeditor5-build-balloon-block/commit/e25c2b8))


## [12.2.0](https://github.com/ckeditor/ckeditor5-build-balloon-block/compare/v12.1.0...v12.2.0) (2019-06-05)

We are happy to report the release of CKEditor 5 v12.2.0. This is a minor release with many bug fixes and a new UI feature which allows to navigating between multiple balloons.

**Note:** The `config.table.toolbar` property that had been deprecated last year has now been completely removed. Use [`config.table.contentToolbar`](https://ckeditor.com/docs/ckeditor5/latest/api/module_table_table-TableConfig.html#member-contentToolbar) instead.

### Dependencies

Major releases (contain breaking changes):

* [@ckeditor/ckeditor5-table](https://www.npmjs.com/package/@ckeditor/ckeditor5-table): v12.0.1 => [v13.0.0](https://github.com/ckeditor/ckeditor5-table/releases/tag/v13.0.0)
* [@ckeditor/ckeditor5-theme-lark](https://www.npmjs.com/package/@ckeditor/ckeditor5-theme-lark): v13.0.1 => [v14.0.0](https://github.com/ckeditor/ckeditor5-theme-lark/releases/tag/v14.0.0)
* [@ckeditor/ckeditor5-ui](https://www.npmjs.com/package/@ckeditor/ckeditor5-ui): v12.1.0 => [v13.0.0](https://github.com/ckeditor/ckeditor5-ui/releases/tag/v13.0.0)

Minor releases:

* [@ckeditor/ckeditor5-block-quote](https://www.npmjs.com/package/@ckeditor/ckeditor5-block-quote): v11.0.1 => [v11.1.0](https://github.com/ckeditor/ckeditor5-block-quote/releases/tag/v11.1.0)
* [@ckeditor/ckeditor5-image](https://www.npmjs.com/package/@ckeditor/ckeditor5-image): v13.0.1 => [v13.1.0](https://github.com/ckeditor/ckeditor5-image/releases/tag/v13.1.0)

Patch releases (bug fixes, internal changes):

* [@ckeditor/ckeditor5-adapter-ckfinder](https://www.npmjs.com/package/@ckeditor/ckeditor5-adapter-ckfinder): v11.0.1 => [v11.0.2](https://github.com/ckeditor/ckeditor5-adapter-ckfinder/releases/tag/v11.0.2)
* [@ckeditor/ckeditor5-autoformat](https://www.npmjs.com/package/@ckeditor/ckeditor5-autoformat): v11.0.1 => [v11.0.2](https://github.com/ckeditor/ckeditor5-autoformat/releases/tag/v11.0.2)
* [@ckeditor/ckeditor5-basic-styles](https://www.npmjs.com/package/@ckeditor/ckeditor5-basic-styles): v11.1.0 => [v11.1.1](https://github.com/ckeditor/ckeditor5-basic-styles/releases/tag/v11.1.1)
* [@ckeditor/ckeditor5-ckfinder](https://www.npmjs.com/package/@ckeditor/ckeditor5-ckfinder): v11.0.1 => [v11.0.2](https://github.com/ckeditor/ckeditor5-ckfinder/releases/tag/v11.0.2)
* [@ckeditor/ckeditor5-clipboard](https://www.npmjs.com/package/@ckeditor/ckeditor5-clipboard): v11.0.1 => [v11.0.2](https://github.com/ckeditor/ckeditor5-clipboard/releases/tag/v11.0.2)
* [@ckeditor/ckeditor5-cloud-services](https://www.npmjs.com/package/@ckeditor/ckeditor5-cloud-services): v11.0.1 => [v11.0.2](https://github.com/ckeditor/ckeditor5-cloud-services/releases/tag/v11.0.2)
* [@ckeditor/ckeditor5-core](https://www.npmjs.com/package/@ckeditor/ckeditor5-core): v12.1.0 => [v12.1.1](https://github.com/ckeditor/ckeditor5-core/releases/tag/v12.1.1)
* [@ckeditor/ckeditor5-easy-image](https://www.npmjs.com/package/@ckeditor/ckeditor5-easy-image): v11.0.1 => [v11.0.2](https://github.com/ckeditor/ckeditor5-easy-image/releases/tag/v11.0.2)
* [@ckeditor/ckeditor5-editor-balloon](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-balloon): v12.1.0 => [v12.1.1](https://github.com/ckeditor/ckeditor5-editor-balloon/releases/tag/v12.1.1)
* [@ckeditor/ckeditor5-engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine): v13.1.0 => [v13.1.1](https://github.com/ckeditor/ckeditor5-engine/releases/tag/v13.1.1)
* [@ckeditor/ckeditor5-enter](https://www.npmjs.com/package/@ckeditor/ckeditor5-enter): v11.0.1 => [v11.0.2](https://github.com/ckeditor/ckeditor5-enter/releases/tag/v11.0.2)
* [@ckeditor/ckeditor5-essentials](https://www.npmjs.com/package/@ckeditor/ckeditor5-essentials): v11.0.1 => [v11.0.2](https://github.com/ckeditor/ckeditor5-essentials/releases/tag/v11.0.2)
* [@ckeditor/ckeditor5-heading](https://www.npmjs.com/package/@ckeditor/ckeditor5-heading): v11.0.1 => [v11.0.2](https://github.com/ckeditor/ckeditor5-heading/releases/tag/v11.0.2)
* [@ckeditor/ckeditor5-link](https://www.npmjs.com/package/@ckeditor/ckeditor5-link): v11.0.1 => [v11.0.2](https://github.com/ckeditor/ckeditor5-link/releases/tag/v11.0.2)
* [@ckeditor/ckeditor5-list](https://www.npmjs.com/package/@ckeditor/ckeditor5-list): v12.0.1 => [v12.0.2](https://github.com/ckeditor/ckeditor5-list/releases/tag/v12.0.2)
* [@ckeditor/ckeditor5-media-embed](https://www.npmjs.com/package/@ckeditor/ckeditor5-media-embed): v11.1.0 => [v11.1.1](https://github.com/ckeditor/ckeditor5-media-embed/releases/tag/v11.1.1)
* [@ckeditor/ckeditor5-paragraph](https://www.npmjs.com/package/@ckeditor/ckeditor5-paragraph): v11.0.1 => [v11.0.2](https://github.com/ckeditor/ckeditor5-paragraph/releases/tag/v11.0.2)
* [@ckeditor/ckeditor5-paste-from-office](https://www.npmjs.com/package/@ckeditor/ckeditor5-paste-from-office): v11.0.1 => [v11.0.2](https://github.com/ckeditor/ckeditor5-paste-from-office/releases/tag/v11.0.2)
* [@ckeditor/ckeditor5-typing](https://www.npmjs.com/package/@ckeditor/ckeditor5-typing): v12.0.1 => [v12.0.2](https://github.com/ckeditor/ckeditor5-typing/releases/tag/v12.0.2)
* [@ckeditor/ckeditor5-undo](https://www.npmjs.com/package/@ckeditor/ckeditor5-undo): v11.0.1 => [v11.0.2](https://github.com/ckeditor/ckeditor5-undo/releases/tag/v11.0.2)
* [@ckeditor/ckeditor5-upload](https://www.npmjs.com/package/@ckeditor/ckeditor5-upload): v11.0.1 => [v11.0.2](https://github.com/ckeditor/ckeditor5-upload/releases/tag/v11.0.2)
* [@ckeditor/ckeditor5-utils](https://www.npmjs.com/package/@ckeditor/ckeditor5-utils): v12.1.0 => [v12.1.1](https://github.com/ckeditor/ckeditor5-utils/releases/tag/v12.1.1)
* [@ckeditor/ckeditor5-widget](https://www.npmjs.com/package/@ckeditor/ckeditor5-widget): v11.0.1 => [v11.0.2](https://github.com/ckeditor/ckeditor5-widget/releases/tag/v11.0.2)


## [12.1.0](https://github.com/ckeditor/ckeditor5-build-balloon-block/compare/v12.0.0...v12.1.0) (2019-04-10)

We are happy to report the release of CKEditor 5 v12.1.0. This release introduces 3 new features ([mentions](https://ckeditor.com/docs/ckeditor5/latest/features/mentions.html), [font color and background color](https://ckeditor.com/docs/ckeditor5/latest/features/font.html) and [remove format](https://ckeditor.com/docs/ckeditor5/latest/features/remove-format.html)).

Check out the linked guides for information how to install and configure those features in your editor.

### Dependencies

Minor releases:

* [@ckeditor/ckeditor5-basic-styles](https://www.npmjs.com/package/@ckeditor/ckeditor5-basic-styles): v11.0.0 => [v11.1.0](https://github.com/ckeditor/ckeditor5-basic-styles/releases/tag/v11.1.0)
* [@ckeditor/ckeditor5-core](https://www.npmjs.com/package/@ckeditor/ckeditor5-core): v12.0.0 => [v12.1.0](https://github.com/ckeditor/ckeditor5-core/releases/tag/v12.1.0)
* [@ckeditor/ckeditor5-editor-balloon](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-balloon): v12.0.0 => [v12.1.0](https://github.com/ckeditor/ckeditor5-editor-balloon/releases/tag/v12.1.0)
* [@ckeditor/ckeditor5-engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine): v13.0.0 => [v13.1.0](https://github.com/ckeditor/ckeditor5-engine/releases/tag/v13.1.0)
* [@ckeditor/ckeditor5-media-embed](https://www.npmjs.com/package/@ckeditor/ckeditor5-media-embed): v11.0.0 => [v11.1.0](https://github.com/ckeditor/ckeditor5-media-embed/releases/tag/v11.1.0)
* [@ckeditor/ckeditor5-ui](https://www.npmjs.com/package/@ckeditor/ckeditor5-ui): v12.0.0 => [v12.1.0](https://github.com/ckeditor/ckeditor5-ui/releases/tag/v12.1.0)
* [@ckeditor/ckeditor5-utils](https://www.npmjs.com/package/@ckeditor/ckeditor5-utils): v12.0.0 => [v12.1.0](https://github.com/ckeditor/ckeditor5-utils/releases/tag/v12.1.0)

Patch releases (bug fixes, internal changes):

* [@ckeditor/ckeditor5-adapter-ckfinder](https://www.npmjs.com/package/@ckeditor/ckeditor5-adapter-ckfinder): v11.0.0 => [v11.0.1](https://github.com/ckeditor/ckeditor5-adapter-ckfinder/releases/tag/v11.0.1)
* [@ckeditor/ckeditor5-autoformat](https://www.npmjs.com/package/@ckeditor/ckeditor5-autoformat): v11.0.0 => [v11.0.1](https://github.com/ckeditor/ckeditor5-autoformat/releases/tag/v11.0.1)
* [@ckeditor/ckeditor5-block-quote](https://www.npmjs.com/package/@ckeditor/ckeditor5-block-quote): v11.0.0 => [v11.0.1](https://github.com/ckeditor/ckeditor5-block-quote/releases/tag/v11.0.1)
* [@ckeditor/ckeditor5-ckfinder](https://www.npmjs.com/package/@ckeditor/ckeditor5-ckfinder): v11.0.0 => [v11.0.1](https://github.com/ckeditor/ckeditor5-ckfinder/releases/tag/v11.0.1)
* [@ckeditor/ckeditor5-clipboard](https://www.npmjs.com/package/@ckeditor/ckeditor5-clipboard): v11.0.0 => [v11.0.1](https://github.com/ckeditor/ckeditor5-clipboard/releases/tag/v11.0.1)
* [@ckeditor/ckeditor5-cloud-services](https://www.npmjs.com/package/@ckeditor/ckeditor5-cloud-services): v11.0.0 => [v11.0.1](https://github.com/ckeditor/ckeditor5-cloud-services/releases/tag/v11.0.1)
* [@ckeditor/ckeditor5-easy-image](https://www.npmjs.com/package/@ckeditor/ckeditor5-easy-image): v11.0.0 => [v11.0.1](https://github.com/ckeditor/ckeditor5-easy-image/releases/tag/v11.0.1)
* [@ckeditor/ckeditor5-enter](https://www.npmjs.com/package/@ckeditor/ckeditor5-enter): v11.0.0 => [v11.0.1](https://github.com/ckeditor/ckeditor5-enter/releases/tag/v11.0.1)
* [@ckeditor/ckeditor5-essentials](https://www.npmjs.com/package/@ckeditor/ckeditor5-essentials): v11.0.0 => [v11.0.1](https://github.com/ckeditor/ckeditor5-essentials/releases/tag/v11.0.1)
* [@ckeditor/ckeditor5-heading](https://www.npmjs.com/package/@ckeditor/ckeditor5-heading): v11.0.0 => [v11.0.1](https://github.com/ckeditor/ckeditor5-heading/releases/tag/v11.0.1)
* [@ckeditor/ckeditor5-image](https://www.npmjs.com/package/@ckeditor/ckeditor5-image): v13.0.0 => [v13.0.1](https://github.com/ckeditor/ckeditor5-image/releases/tag/v13.0.1)
* [@ckeditor/ckeditor5-link](https://www.npmjs.com/package/@ckeditor/ckeditor5-link): v11.0.0 => [v11.0.1](https://github.com/ckeditor/ckeditor5-link/releases/tag/v11.0.1)
* [@ckeditor/ckeditor5-list](https://www.npmjs.com/package/@ckeditor/ckeditor5-list): v12.0.0 => [v12.0.1](https://github.com/ckeditor/ckeditor5-list/releases/tag/v12.0.1)
* [@ckeditor/ckeditor5-paragraph](https://www.npmjs.com/package/@ckeditor/ckeditor5-paragraph): v11.0.0 => [v11.0.1](https://github.com/ckeditor/ckeditor5-paragraph/releases/tag/v11.0.1)
* [@ckeditor/ckeditor5-paste-from-office](https://www.npmjs.com/package/@ckeditor/ckeditor5-paste-from-office): v11.0.0 => [v11.0.1](https://github.com/ckeditor/ckeditor5-paste-from-office/releases/tag/v11.0.1)
* [@ckeditor/ckeditor5-table](https://www.npmjs.com/package/@ckeditor/ckeditor5-table): v12.0.0 => [v12.0.1](https://github.com/ckeditor/ckeditor5-table/releases/tag/v12.0.1)
* [@ckeditor/ckeditor5-theme-lark](https://www.npmjs.com/package/@ckeditor/ckeditor5-theme-lark): v13.0.0 => [v13.0.1](https://github.com/ckeditor/ckeditor5-theme-lark/releases/tag/v13.0.1)
* [@ckeditor/ckeditor5-typing](https://www.npmjs.com/package/@ckeditor/ckeditor5-typing): v12.0.0 => [v12.0.1](https://github.com/ckeditor/ckeditor5-typing/releases/tag/v12.0.1)
* [@ckeditor/ckeditor5-undo](https://www.npmjs.com/package/@ckeditor/ckeditor5-undo): v11.0.0 => [v11.0.1](https://github.com/ckeditor/ckeditor5-undo/releases/tag/v11.0.1)
* [@ckeditor/ckeditor5-upload](https://www.npmjs.com/package/@ckeditor/ckeditor5-upload): v11.0.0 => [v11.0.1](https://github.com/ckeditor/ckeditor5-upload/releases/tag/v11.0.1)
* [@ckeditor/ckeditor5-widget](https://www.npmjs.com/package/@ckeditor/ckeditor5-widget): v11.0.0 => [v11.0.1](https://github.com/ckeditor/ckeditor5-widget/releases/tag/v11.0.1)


## [12.0.0](https://github.com/ckeditor/ckeditor5-build-balloon-block/compare/v0.0.1...v12.0.0) (2019-02-28)

Initial implementation.
