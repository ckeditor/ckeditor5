Changelog
=========

## [15.0.0](https://github.com/ckeditor/ckeditor5/compare/v12.4.0...v15.0.0) (2019-10-23)

We are happy to announce the release of CKEditor 5 v15.0.0. This editor version introduces support for inserting [horizontal lines](https://ckeditor.com/docs/ckeditor5/latest/features/horizontal-line.html), [page breaks](https://ckeditor.com/docs/ckeditor5/latest/features/page-break.html) and [SVG images](https://ckeditor.com/docs/ckeditor5/latest/api/module_image_imageupload-ImageUploadConfig.html#member-types) into the WYSIWYG editor. It also allows you to define the [document title section](https://ckeditor.com/docs/ckeditor5/latest/features/title.html) thanks to the new title plugin. The editor toolbar is now responsive which improves the UX, especially for mobile devices.

Regarding the build itself, we added the [indentation](https://ckeditor.com/docs/ckeditor5/latest/features/indent.html) button to the build's default setup. See [ckeditor/ckeditor5#1844](https://github.com/ckeditor/ckeditor5/issues/1844).

From other news, we changed the versioning policy. Now, all packages will have the same major version, hence, we needed to release this one as v15.0.0 (we skipped versions 13.0.0 and 14.0.0). Read more about the [new versioning policy](https://ckeditor.com/docs/ckeditor5/latest/framework/guides/support/versioning-policy.html).

Blog post coming soon...

### Dependencies

New packages:

* [@ckeditor/ckeditor5-horizontal-line](https://www.npmjs.com/package/@ckeditor/ckeditor5-horizontal-line): [v15.0.0](https://github.com/ckeditor/ckeditor5-horizontal-line/releases/tag/v15.0.0)
* [@ckeditor/ckeditor5-page-break](https://www.npmjs.com/package/@ckeditor/ckeditor5-page-break): [v15.0.0](https://github.com/ckeditor/ckeditor5-page-break/releases/tag/v15.0.0)

Major releases (contain major breaking changes):

* [@ckeditor/ckeditor5-engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine): v14.0.0 => [v15.0.0](https://github.com/ckeditor/ckeditor5-engine/releases/tag/v15.0.0)
* [@ckeditor/ckeditor5-image](https://www.npmjs.com/package/@ckeditor/ckeditor5-image): v14.0.0 => [v15.0.0](https://github.com/ckeditor/ckeditor5-image/releases/tag/v15.0.0)
* [@ckeditor/ckeditor5-list](https://www.npmjs.com/package/@ckeditor/ckeditor5-list): v12.1.0 => [v15.0.0](https://github.com/ckeditor/ckeditor5-list/releases/tag/v15.0.0)
* [@ckeditor/ckeditor5-ui](https://www.npmjs.com/package/@ckeditor/ckeditor5-ui): v14.0.0 => [v15.0.0](https://github.com/ckeditor/ckeditor5-ui/releases/tag/v15.0.0)
* [@ckeditor/ckeditor5-widget](https://www.npmjs.com/package/@ckeditor/ckeditor5-widget): v11.1.0 => [v15.0.0](https://github.com/ckeditor/ckeditor5-widget/releases/tag/v15.0.0)

Major releases (dependencies of those packages have breaking changes):

* [@ckeditor/ckeditor-cloud-services-core](https://www.npmjs.com/package/@ckeditor/ckeditor-cloud-services-core): v3.0.1 => [v15.0.0](https://github.com/ckeditor/ckeditor-cloud-services-core/releases/tag/v15.0.0)
* [@ckeditor/ckeditor5-adapter-ckfinder](https://www.npmjs.com/package/@ckeditor/ckeditor5-adapter-ckfinder): v11.0.5 => [v15.0.0](https://github.com/ckeditor/ckeditor5-adapter-ckfinder/releases/tag/v15.0.0)
* [@ckeditor/ckeditor5-alignment](https://www.npmjs.com/package/@ckeditor/ckeditor5-alignment): v11.2.0 => [v15.0.0](https://github.com/ckeditor/ckeditor5-alignment/releases/tag/v15.0.0)
* [@ckeditor/ckeditor5-autoformat](https://www.npmjs.com/package/@ckeditor/ckeditor5-autoformat): v11.0.5 => [v15.0.0](https://github.com/ckeditor/ckeditor5-autoformat/releases/tag/v15.0.0)
* [@ckeditor/ckeditor5-autosave](https://www.npmjs.com/package/@ckeditor/ckeditor5-autosave): v11.0.5 => [v15.0.0](https://github.com/ckeditor/ckeditor5-autosave/releases/tag/v15.0.0)
* [@ckeditor/ckeditor5-basic-styles](https://www.npmjs.com/package/@ckeditor/ckeditor5-basic-styles): v11.1.4 => [v15.0.0](https://github.com/ckeditor/ckeditor5-basic-styles/releases/tag/v15.0.0)
* [@ckeditor/ckeditor5-block-quote](https://www.npmjs.com/package/@ckeditor/ckeditor5-block-quote): v11.1.3 => [v15.0.0](https://github.com/ckeditor/ckeditor5-block-quote/releases/tag/v15.0.0)
* [@ckeditor/ckeditor5-build-balloon](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-balloon): v12.4.0 => [v15.0.0](https://github.com/ckeditor/ckeditor5-build-balloon/releases/tag/v15.0.0)
* [@ckeditor/ckeditor5-build-balloon-block](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-balloon-block): v12.4.0 => [v15.0.0](https://github.com/ckeditor/ckeditor5-build-balloon-block/releases/tag/v15.0.0)
* [@ckeditor/ckeditor5-build-classic](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-classic): v12.4.0 => [v15.0.0](https://github.com/ckeditor/ckeditor5-build-classic/releases/tag/v15.0.0)
* [@ckeditor/ckeditor5-build-decoupled-document](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-decoupled-document): v12.4.0 => [v15.0.0](https://github.com/ckeditor/ckeditor5-build-decoupled-document/releases/tag/v15.0.0)
* [@ckeditor/ckeditor5-build-inline](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-inline): v12.4.0 => [v15.0.0](https://github.com/ckeditor/ckeditor5-build-inline/releases/tag/v15.0.0)
* [@ckeditor/ckeditor5-ckfinder](https://www.npmjs.com/package/@ckeditor/ckeditor5-ckfinder): v11.0.5 => [v15.0.0](https://github.com/ckeditor/ckeditor5-ckfinder/releases/tag/v15.0.0)
* [@ckeditor/ckeditor5-clipboard](https://www.npmjs.com/package/@ckeditor/ckeditor5-clipboard): v12.0.2 => [v15.0.0](https://github.com/ckeditor/ckeditor5-clipboard/releases/tag/v15.0.0)
* [@ckeditor/ckeditor5-cloud-services](https://www.npmjs.com/package/@ckeditor/ckeditor5-cloud-services): v11.0.5 => [v15.0.0](https://github.com/ckeditor/ckeditor5-cloud-services/releases/tag/v15.0.0)
* [@ckeditor/ckeditor5-core](https://www.npmjs.com/package/@ckeditor/ckeditor5-core): v12.3.0 => [v15.0.0](https://github.com/ckeditor/ckeditor5-core/releases/tag/v15.0.0)
* [@ckeditor/ckeditor5-easy-image](https://www.npmjs.com/package/@ckeditor/ckeditor5-easy-image): v11.0.5 => [v15.0.0](https://github.com/ckeditor/ckeditor5-easy-image/releases/tag/v15.0.0)
* [@ckeditor/ckeditor5-editor-balloon](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-balloon): v12.2.2 => [v15.0.0](https://github.com/ckeditor/ckeditor5-editor-balloon/releases/tag/v15.0.0)
* [@ckeditor/ckeditor5-editor-classic](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-classic): v12.1.4 => [v15.0.0](https://github.com/ckeditor/ckeditor5-editor-classic/releases/tag/v15.0.0)
* [@ckeditor/ckeditor5-editor-decoupled](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-decoupled): v12.2.2 => [v15.0.0](https://github.com/ckeditor/ckeditor5-editor-decoupled/releases/tag/v15.0.0)
* [@ckeditor/ckeditor5-editor-inline](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-inline): v12.3.0 => [v15.0.0](https://github.com/ckeditor/ckeditor5-editor-inline/releases/tag/v15.0.0)
* [@ckeditor/ckeditor5-enter](https://www.npmjs.com/package/@ckeditor/ckeditor5-enter): v11.1.0 => [v15.0.0](https://github.com/ckeditor/ckeditor5-enter/releases/tag/v15.0.0)
* [@ckeditor/ckeditor5-essentials](https://www.npmjs.com/package/@ckeditor/ckeditor5-essentials): v11.0.5 => [v15.0.0](https://github.com/ckeditor/ckeditor5-essentials/releases/tag/v15.0.0)
* [@ckeditor/ckeditor5-font](https://www.npmjs.com/package/@ckeditor/ckeditor5-font): v11.2.2 => [v15.0.0](https://github.com/ckeditor/ckeditor5-font/releases/tag/v15.0.0)
* [@ckeditor/ckeditor5-heading](https://www.npmjs.com/package/@ckeditor/ckeditor5-heading): v11.0.5 => [v15.0.0](https://github.com/ckeditor/ckeditor5-heading/releases/tag/v15.0.0)
* [@ckeditor/ckeditor5-highlight](https://www.npmjs.com/package/@ckeditor/ckeditor5-highlight): v11.0.5 => [v15.0.0](https://github.com/ckeditor/ckeditor5-highlight/releases/tag/v15.0.0)
* [@ckeditor/ckeditor5-indent](https://www.npmjs.com/package/@ckeditor/ckeditor5-indent): v10.1.0 => [v15.0.0](https://github.com/ckeditor/ckeditor5-indent/releases/tag/v15.0.0)
* [@ckeditor/ckeditor5-link](https://www.npmjs.com/package/@ckeditor/ckeditor5-link): v11.1.2 => [v15.0.0](https://github.com/ckeditor/ckeditor5-link/releases/tag/v15.0.0)
* [@ckeditor/ckeditor5-markdown-gfm](https://www.npmjs.com/package/@ckeditor/ckeditor5-markdown-gfm): v11.0.5 => [v15.0.0](https://github.com/ckeditor/ckeditor5-markdown-gfm/releases/tag/v15.0.0)
* [@ckeditor/ckeditor5-media-embed](https://www.npmjs.com/package/@ckeditor/ckeditor5-media-embed): v11.1.4 => [v15.0.0](https://github.com/ckeditor/ckeditor5-media-embed/releases/tag/v15.0.0)
* [@ckeditor/ckeditor5-mention](https://www.npmjs.com/package/@ckeditor/ckeditor5-mention): v13.0.0 => [v15.0.0](https://github.com/ckeditor/ckeditor5-mention/releases/tag/v15.0.0)
* [@ckeditor/ckeditor5-paragraph](https://www.npmjs.com/package/@ckeditor/ckeditor5-paragraph): v11.0.5 => [v15.0.0](https://github.com/ckeditor/ckeditor5-paragraph/releases/tag/v15.0.0)
* [@ckeditor/ckeditor5-paste-from-office](https://www.npmjs.com/package/@ckeditor/ckeditor5-paste-from-office): v11.1.0 => [v15.0.0](https://github.com/ckeditor/ckeditor5-paste-from-office/releases/tag/v15.0.0)
* [@ckeditor/ckeditor5-remove-format](https://www.npmjs.com/package/@ckeditor/ckeditor5-remove-format): v10.0.4 => [v15.0.0](https://github.com/ckeditor/ckeditor5-remove-format/releases/tag/v15.0.0)
* [@ckeditor/ckeditor5-table](https://www.npmjs.com/package/@ckeditor/ckeditor5-table): v14.0.0 => [v15.0.0](https://github.com/ckeditor/ckeditor5-table/releases/tag/v15.0.0)
* [@ckeditor/ckeditor5-theme-lark](https://www.npmjs.com/package/@ckeditor/ckeditor5-theme-lark): v14.2.0 => [v15.0.0](https://github.com/ckeditor/ckeditor5-theme-lark/releases/tag/v15.0.0)
* [@ckeditor/ckeditor5-typing](https://www.npmjs.com/package/@ckeditor/ckeditor5-typing): v12.2.0 => [v15.0.0](https://github.com/ckeditor/ckeditor5-typing/releases/tag/v15.0.0)
* [@ckeditor/ckeditor5-undo](https://www.npmjs.com/package/@ckeditor/ckeditor5-undo): v11.0.5 => [v15.0.0](https://github.com/ckeditor/ckeditor5-undo/releases/tag/v15.0.0)
* [@ckeditor/ckeditor5-upload](https://www.npmjs.com/package/@ckeditor/ckeditor5-upload): v12.0.0 => [v15.0.0](https://github.com/ckeditor/ckeditor5-upload/releases/tag/v15.0.0)
* [@ckeditor/ckeditor5-utils](https://www.npmjs.com/package/@ckeditor/ckeditor5-utils): v14.0.0 => [v15.0.0](https://github.com/ckeditor/ckeditor5-utils/releases/tag/v15.0.0)
* [@ckeditor/ckeditor5-watchdog](https://www.npmjs.com/package/@ckeditor/ckeditor5-watchdog): v11.0.0 => [v15.0.0](https://github.com/ckeditor/ckeditor5-watchdog/releases/tag/v15.0.0)
* [@ckeditor/ckeditor5-word-count](https://www.npmjs.com/package/@ckeditor/ckeditor5-word-count): v10.0.2 => [v15.0.0](https://github.com/ckeditor/ckeditor5-word-count/releases/tag/v15.0.0)


## [12.4.0](https://github.com/ckeditor/ckeditor5/compare/v12.3.1...v12.4.0) (2019-08-26)

This release brings a huge set of new features: [image resizing](https://ckeditor.com/ckeditor5/build/docs/ckeditor5/latest/features/image.html#resizing-images), [to-do lists](https://ckeditor.com/ckeditor5/build/docs/ckeditor5/latest/features/todo-lists.html), [support for RTL languages](https://ckeditor.com/ckeditor5/build/docs/ckeditor5/latest/features/ui-language.html), [simple upload adapter](https://ckeditor.com/ckeditor5/build/docs/ckeditor5/latest/features/image-upload/simple-upload-adapter.html), [support for pasting from Google Docs](https://ckeditor.com/ckeditor5/build/docs/ckeditor5/latest/features/paste-from-office/paste-from-google-docs.html), [mathematic formulas](https://ckeditor.com/ckeditor5/build/docs/ckeditor5/latest/features/mathtype.html), and [spelling and grammar checking](https://ckeditor.com/ckeditor5/build/docs/ckeditor5/latest/features/spell-checker.html). In addition to that, as always, it contains many improvements and bug fixes.

Read more in the blog post: https://ckeditor.com/blog/CKEditor-5-v12.4.0-with-image-resizing-to-do-lists-RTL-language-support-and-more/

### Dependencies

Major releases (contain breaking changes):

* [@ckeditor/ckeditor5-engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine): v13.2.1 => [v14.0.0](https://github.com/ckeditor/ckeditor5-engine/releases/tag/v14.0.0)
* [@ckeditor/ckeditor5-image](https://www.npmjs.com/package/@ckeditor/ckeditor5-image): v13.1.2 => [v14.0.0](https://github.com/ckeditor/ckeditor5-image/releases/tag/v14.0.0)
* [@ckeditor/ckeditor5-mention](https://www.npmjs.com/package/@ckeditor/ckeditor5-mention): v12.0.1 => [v13.0.0](https://github.com/ckeditor/ckeditor5-mention/releases/tag/v13.0.0)
* [@ckeditor/ckeditor5-table](https://www.npmjs.com/package/@ckeditor/ckeditor5-table): v13.0.2 => [v14.0.0](https://github.com/ckeditor/ckeditor5-table/releases/tag/v14.0.0)
* [@ckeditor/ckeditor5-ui](https://www.npmjs.com/package/@ckeditor/ckeditor5-ui): v13.0.2 => [v14.0.0](https://github.com/ckeditor/ckeditor5-ui/releases/tag/v14.0.0)
* [@ckeditor/ckeditor5-upload](https://www.npmjs.com/package/@ckeditor/ckeditor5-upload): v11.1.1 => [v12.0.0](https://github.com/ckeditor/ckeditor5-upload/releases/tag/v12.0.0)
* [@ckeditor/ckeditor5-utils](https://www.npmjs.com/package/@ckeditor/ckeditor5-utils): v13.0.1 => [v14.0.0](https://github.com/ckeditor/ckeditor5-utils/releases/tag/v14.0.0)
* [@ckeditor/ckeditor5-watchdog](https://www.npmjs.com/package/@ckeditor/ckeditor5-watchdog): v10.0.1 => [v11.0.0](https://github.com/ckeditor/ckeditor5-watchdog/releases/tag/v11.0.0)

Minor releases:

* [@ckeditor/ckeditor5-alignment](https://www.npmjs.com/package/@ckeditor/ckeditor5-alignment): v11.1.3 => [v11.2.0](https://github.com/ckeditor/ckeditor5-alignment/releases/tag/v11.2.0)
* [@ckeditor/ckeditor5-build-balloon](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-balloon): v12.3.1 => [v12.4.0](https://github.com/ckeditor/ckeditor5-build-balloon/releases/tag/v12.4.0)
* [@ckeditor/ckeditor5-build-balloon-block](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-balloon-block): v12.3.1 => [v12.4.0](https://github.com/ckeditor/ckeditor5-build-balloon-block/releases/tag/v12.4.0)
* [@ckeditor/ckeditor5-build-classic](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-classic): v12.3.1 => [v12.4.0](https://github.com/ckeditor/ckeditor5-build-classic/releases/tag/v12.4.0)
* [@ckeditor/ckeditor5-build-decoupled-document](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-decoupled-document): v12.3.1 => [v12.4.0](https://github.com/ckeditor/ckeditor5-build-decoupled-document/releases/tag/v12.4.0)
* [@ckeditor/ckeditor5-build-inline](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-inline): v12.3.1 => [v12.4.0](https://github.com/ckeditor/ckeditor5-build-inline/releases/tag/v12.4.0)
* [@ckeditor/ckeditor5-core](https://www.npmjs.com/package/@ckeditor/ckeditor5-core): v12.2.1 => [v12.3.0](https://github.com/ckeditor/ckeditor5-core/releases/tag/v12.3.0)
* [@ckeditor/ckeditor5-editor-inline](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-inline): v12.2.1 => [v12.3.0](https://github.com/ckeditor/ckeditor5-editor-inline/releases/tag/v12.3.0)
* [@ckeditor/ckeditor5-enter](https://www.npmjs.com/package/@ckeditor/ckeditor5-enter): v11.0.4 => [v11.1.0](https://github.com/ckeditor/ckeditor5-enter/releases/tag/v11.1.0)
* [@ckeditor/ckeditor5-indent](https://www.npmjs.com/package/@ckeditor/ckeditor5-indent): v10.0.1 => [v10.1.0](https://github.com/ckeditor/ckeditor5-indent/releases/tag/v10.1.0)
* [@ckeditor/ckeditor5-list](https://www.npmjs.com/package/@ckeditor/ckeditor5-list): v12.0.4 => [v12.1.0](https://github.com/ckeditor/ckeditor5-list/releases/tag/v12.1.0)
* [@ckeditor/ckeditor5-paste-from-office](https://www.npmjs.com/package/@ckeditor/ckeditor5-paste-from-office): v11.0.4 => [v11.1.0](https://github.com/ckeditor/ckeditor5-paste-from-office/releases/tag/v11.1.0)
* [@ckeditor/ckeditor5-theme-lark](https://www.npmjs.com/package/@ckeditor/ckeditor5-theme-lark): v14.1.1 => [v14.2.0](https://github.com/ckeditor/ckeditor5-theme-lark/releases/tag/v14.2.0)
* [@ckeditor/ckeditor5-typing](https://www.npmjs.com/package/@ckeditor/ckeditor5-typing): v12.1.1 => [v12.2.0](https://github.com/ckeditor/ckeditor5-typing/releases/tag/v12.2.0)
* [@ckeditor/ckeditor5-widget](https://www.npmjs.com/package/@ckeditor/ckeditor5-widget): v11.0.4 => [v11.1.0](https://github.com/ckeditor/ckeditor5-widget/releases/tag/v11.1.0)

Patch releases (bug fixes, internal changes):

* [@ckeditor/ckeditor5-adapter-ckfinder](https://www.npmjs.com/package/@ckeditor/ckeditor5-adapter-ckfinder): v11.0.4 => [v11.0.5](https://github.com/ckeditor/ckeditor5-adapter-ckfinder/releases/tag/v11.0.5)
* [@ckeditor/ckeditor5-autoformat](https://www.npmjs.com/package/@ckeditor/ckeditor5-autoformat): v11.0.4 => [v11.0.5](https://github.com/ckeditor/ckeditor5-autoformat/releases/tag/v11.0.5)
* [@ckeditor/ckeditor5-autosave](https://www.npmjs.com/package/@ckeditor/ckeditor5-autosave): v11.0.4 => [v11.0.5](https://github.com/ckeditor/ckeditor5-autosave/releases/tag/v11.0.5)
* [@ckeditor/ckeditor5-basic-styles](https://www.npmjs.com/package/@ckeditor/ckeditor5-basic-styles): v11.1.3 => [v11.1.4](https://github.com/ckeditor/ckeditor5-basic-styles/releases/tag/v11.1.4)
* [@ckeditor/ckeditor5-block-quote](https://www.npmjs.com/package/@ckeditor/ckeditor5-block-quote): v11.1.2 => [v11.1.3](https://github.com/ckeditor/ckeditor5-block-quote/releases/tag/v11.1.3)
* [@ckeditor/ckeditor5-ckfinder](https://www.npmjs.com/package/@ckeditor/ckeditor5-ckfinder): v11.0.4 => [v11.0.5](https://github.com/ckeditor/ckeditor5-ckfinder/releases/tag/v11.0.5)
* [@ckeditor/ckeditor5-clipboard](https://www.npmjs.com/package/@ckeditor/ckeditor5-clipboard): v12.0.1 => [v12.0.2](https://github.com/ckeditor/ckeditor5-clipboard/releases/tag/v12.0.2)
* [@ckeditor/ckeditor5-cloud-services](https://www.npmjs.com/package/@ckeditor/ckeditor5-cloud-services): v11.0.4 => [v11.0.5](https://github.com/ckeditor/ckeditor5-cloud-services/releases/tag/v11.0.5)
* [@ckeditor/ckeditor5-easy-image](https://www.npmjs.com/package/@ckeditor/ckeditor5-easy-image): v11.0.4 => [v11.0.5](https://github.com/ckeditor/ckeditor5-easy-image/releases/tag/v11.0.5)
* [@ckeditor/ckeditor5-editor-balloon](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-balloon): v12.2.1 => [v12.2.2](https://github.com/ckeditor/ckeditor5-editor-balloon/releases/tag/v12.2.2)
* [@ckeditor/ckeditor5-editor-classic](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-classic): v12.1.3 => [v12.1.4](https://github.com/ckeditor/ckeditor5-editor-classic/releases/tag/v12.1.4)
* [@ckeditor/ckeditor5-editor-decoupled](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-decoupled): v12.2.1 => [v12.2.2](https://github.com/ckeditor/ckeditor5-editor-decoupled/releases/tag/v12.2.2)
* [@ckeditor/ckeditor5-essentials](https://www.npmjs.com/package/@ckeditor/ckeditor5-essentials): v11.0.4 => [v11.0.5](https://github.com/ckeditor/ckeditor5-essentials/releases/tag/v11.0.5)
* [@ckeditor/ckeditor5-font](https://www.npmjs.com/package/@ckeditor/ckeditor5-font): v11.2.1 => [v11.2.2](https://github.com/ckeditor/ckeditor5-font/releases/tag/v11.2.2)
* [@ckeditor/ckeditor5-heading](https://www.npmjs.com/package/@ckeditor/ckeditor5-heading): v11.0.4 => [v11.0.5](https://github.com/ckeditor/ckeditor5-heading/releases/tag/v11.0.5)
* [@ckeditor/ckeditor5-highlight](https://www.npmjs.com/package/@ckeditor/ckeditor5-highlight): v11.0.4 => [v11.0.5](https://github.com/ckeditor/ckeditor5-highlight/releases/tag/v11.0.5)
* [@ckeditor/ckeditor5-link](https://www.npmjs.com/package/@ckeditor/ckeditor5-link): v11.1.1 => [v11.1.2](https://github.com/ckeditor/ckeditor5-link/releases/tag/v11.1.2)
* [@ckeditor/ckeditor5-markdown-gfm](https://www.npmjs.com/package/@ckeditor/ckeditor5-markdown-gfm): v11.0.4 => [v11.0.5](https://github.com/ckeditor/ckeditor5-markdown-gfm/releases/tag/v11.0.5)
* [@ckeditor/ckeditor5-media-embed](https://www.npmjs.com/package/@ckeditor/ckeditor5-media-embed): v11.1.3 => [v11.1.4](https://github.com/ckeditor/ckeditor5-media-embed/releases/tag/v11.1.4)
* [@ckeditor/ckeditor5-paragraph](https://www.npmjs.com/package/@ckeditor/ckeditor5-paragraph): v11.0.4 => [v11.0.5](https://github.com/ckeditor/ckeditor5-paragraph/releases/tag/v11.0.5)
* [@ckeditor/ckeditor5-remove-format](https://www.npmjs.com/package/@ckeditor/ckeditor5-remove-format): v10.0.3 => [v10.0.4](https://github.com/ckeditor/ckeditor5-remove-format/releases/tag/v10.0.4)
* [@ckeditor/ckeditor5-undo](https://www.npmjs.com/package/@ckeditor/ckeditor5-undo): v11.0.4 => [v11.0.5](https://github.com/ckeditor/ckeditor5-undo/releases/tag/v11.0.5)
* [@ckeditor/ckeditor5-word-count](https://www.npmjs.com/package/@ckeditor/ckeditor5-word-count): v10.0.1 => [v10.0.2](https://github.com/ckeditor/ckeditor5-word-count/releases/tag/v10.0.2)


## [12.3.1](https://github.com/ckeditor/ckeditor5/compare/v12.3.0...v12.3.1) (2019-07-10)

We are happy to report the release of CKEditor 5 v12.3.0 (and v12.3.1 with a [small fix](https://github.com/ckeditor/ckeditor5-typing/pull/209)). This release introduces several new features ([word count](https://ckeditor.com/docs/ckeditor5/latest/features/word-count.html), [automatic text transformations](https://ckeditor.com/docs/ckeditor5/latest/features/text-transformation.html), [ability to control link attributes such as `target`](https://ckeditor.com/docs/ckeditor5/latest/features/link.html#custom-link-attributes-decorators) and [block indentation](https://ckeditor.com/docs/ckeditor5/latest/features/indent.html)). It also brings improvements to existing features (e.g. the ["document colors" section](https://ckeditor.com/docs/ckeditor5/latest/features/font.html#documents-colors) in the font color picker dropdowns) and many bug fixes.

Read more in the blog post: https://ckeditor.com/blog/CKEditor-5-v12.3.0-with-word-count-autocorrect-link-attributes-and-new-upload-adapter-released/

### Dependencies

Patch releases (bug fixes, internal changes):

* [@ckeditor/ckeditor5-adapter-ckfinder](https://www.npmjs.com/package/@ckeditor/ckeditor5-adapter-ckfinder): v11.0.3 => [v11.0.4](https://github.com/ckeditor/ckeditor5-adapter-ckfinder/releases/tag/v11.0.4)
* [@ckeditor/ckeditor5-alignment](https://www.npmjs.com/package/@ckeditor/ckeditor5-alignment): v11.1.2 => [v11.1.3](https://github.com/ckeditor/ckeditor5-alignment/releases/tag/v11.1.3)
* [@ckeditor/ckeditor5-autoformat](https://www.npmjs.com/package/@ckeditor/ckeditor5-autoformat): v11.0.3 => [v11.0.4](https://github.com/ckeditor/ckeditor5-autoformat/releases/tag/v11.0.4)
* [@ckeditor/ckeditor5-autosave](https://www.npmjs.com/package/@ckeditor/ckeditor5-autosave): v11.0.3 => [v11.0.4](https://github.com/ckeditor/ckeditor5-autosave/releases/tag/v11.0.4)
* [@ckeditor/ckeditor5-basic-styles](https://www.npmjs.com/package/@ckeditor/ckeditor5-basic-styles): v11.1.2 => [v11.1.3](https://github.com/ckeditor/ckeditor5-basic-styles/releases/tag/v11.1.3)
* [@ckeditor/ckeditor5-block-quote](https://www.npmjs.com/package/@ckeditor/ckeditor5-block-quote): v11.1.1 => [v11.1.2](https://github.com/ckeditor/ckeditor5-block-quote/releases/tag/v11.1.2)
* [@ckeditor/ckeditor5-build-balloon](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-balloon): v12.3.0 => [v12.3.1](https://github.com/ckeditor/ckeditor5-build-balloon/releases/tag/v12.3.1)
* [@ckeditor/ckeditor5-build-balloon-block](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-balloon-block): v12.3.0 => [v12.3.1](https://github.com/ckeditor/ckeditor5-build-balloon-block/releases/tag/v12.3.1)
* [@ckeditor/ckeditor5-build-classic](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-classic): v12.3.0 => [v12.3.1](https://github.com/ckeditor/ckeditor5-build-classic/releases/tag/v12.3.1)
* [@ckeditor/ckeditor5-build-decoupled-document](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-decoupled-document): v12.3.0 => [v12.3.1](https://github.com/ckeditor/ckeditor5-build-decoupled-document/releases/tag/v12.3.1)
* [@ckeditor/ckeditor5-build-inline](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-inline): v12.3.0 => [v12.3.1](https://github.com/ckeditor/ckeditor5-build-inline/releases/tag/v12.3.1)
* [@ckeditor/ckeditor5-ckfinder](https://www.npmjs.com/package/@ckeditor/ckeditor5-ckfinder): v11.0.3 => [v11.0.4](https://github.com/ckeditor/ckeditor5-ckfinder/releases/tag/v11.0.4)
* [@ckeditor/ckeditor5-clipboard](https://www.npmjs.com/package/@ckeditor/ckeditor5-clipboard): v12.0.0 => [v12.0.1](https://github.com/ckeditor/ckeditor5-clipboard/releases/tag/v12.0.1)
* [@ckeditor/ckeditor5-cloud-services](https://www.npmjs.com/package/@ckeditor/ckeditor5-cloud-services): v11.0.3 => [v11.0.4](https://github.com/ckeditor/ckeditor5-cloud-services/releases/tag/v11.0.4)
* [@ckeditor/ckeditor5-core](https://www.npmjs.com/package/@ckeditor/ckeditor5-core): v12.2.0 => [v12.2.1](https://github.com/ckeditor/ckeditor5-core/releases/tag/v12.2.1)
* [@ckeditor/ckeditor5-easy-image](https://www.npmjs.com/package/@ckeditor/ckeditor5-easy-image): v11.0.3 => [v11.0.4](https://github.com/ckeditor/ckeditor5-easy-image/releases/tag/v11.0.4)
* [@ckeditor/ckeditor5-editor-balloon](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-balloon): v12.2.0 => [v12.2.1](https://github.com/ckeditor/ckeditor5-editor-balloon/releases/tag/v12.2.1)
* [@ckeditor/ckeditor5-editor-classic](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-classic): v12.1.2 => [v12.1.3](https://github.com/ckeditor/ckeditor5-editor-classic/releases/tag/v12.1.3)
* [@ckeditor/ckeditor5-editor-decoupled](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-decoupled): v12.2.0 => [v12.2.1](https://github.com/ckeditor/ckeditor5-editor-decoupled/releases/tag/v12.2.1)
* [@ckeditor/ckeditor5-editor-inline](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-inline): v12.2.0 => [v12.2.1](https://github.com/ckeditor/ckeditor5-editor-inline/releases/tag/v12.2.1)
* [@ckeditor/ckeditor5-engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine): v13.2.0 => [v13.2.1](https://github.com/ckeditor/ckeditor5-engine/releases/tag/v13.2.1)
* [@ckeditor/ckeditor5-enter](https://www.npmjs.com/package/@ckeditor/ckeditor5-enter): v11.0.3 => [v11.0.4](https://github.com/ckeditor/ckeditor5-enter/releases/tag/v11.0.4)
* [@ckeditor/ckeditor5-essentials](https://www.npmjs.com/package/@ckeditor/ckeditor5-essentials): v11.0.3 => [v11.0.4](https://github.com/ckeditor/ckeditor5-essentials/releases/tag/v11.0.4)
* [@ckeditor/ckeditor5-font](https://www.npmjs.com/package/@ckeditor/ckeditor5-font): v11.2.0 => [v11.2.1](https://github.com/ckeditor/ckeditor5-font/releases/tag/v11.2.1)
* [@ckeditor/ckeditor5-heading](https://www.npmjs.com/package/@ckeditor/ckeditor5-heading): v11.0.3 => [v11.0.4](https://github.com/ckeditor/ckeditor5-heading/releases/tag/v11.0.4)
* [@ckeditor/ckeditor5-highlight](https://www.npmjs.com/package/@ckeditor/ckeditor5-highlight): v11.0.3 => [v11.0.4](https://github.com/ckeditor/ckeditor5-highlight/releases/tag/v11.0.4)
* [@ckeditor/ckeditor5-image](https://www.npmjs.com/package/@ckeditor/ckeditor5-image): v13.1.1 => [v13.1.2](https://github.com/ckeditor/ckeditor5-image/releases/tag/v13.1.2)
* [@ckeditor/ckeditor5-indent](https://www.npmjs.com/package/@ckeditor/ckeditor5-indent): v10.0.0 => [v10.0.1](https://github.com/ckeditor/ckeditor5-indent/releases/tag/v10.0.1)
* [@ckeditor/ckeditor5-link](https://www.npmjs.com/package/@ckeditor/ckeditor5-link): v11.1.0 => [v11.1.1](https://github.com/ckeditor/ckeditor5-link/releases/tag/v11.1.1)
* [@ckeditor/ckeditor5-list](https://www.npmjs.com/package/@ckeditor/ckeditor5-list): v12.0.3 => [v12.0.4](https://github.com/ckeditor/ckeditor5-list/releases/tag/v12.0.4)
* [@ckeditor/ckeditor5-markdown-gfm](https://www.npmjs.com/package/@ckeditor/ckeditor5-markdown-gfm): v11.0.3 => [v11.0.4](https://github.com/ckeditor/ckeditor5-markdown-gfm/releases/tag/v11.0.4)
* [@ckeditor/ckeditor5-media-embed](https://www.npmjs.com/package/@ckeditor/ckeditor5-media-embed): v11.1.2 => [v11.1.3](https://github.com/ckeditor/ckeditor5-media-embed/releases/tag/v11.1.3)
* [@ckeditor/ckeditor5-mention](https://www.npmjs.com/package/@ckeditor/ckeditor5-mention): v12.0.0 => [v12.0.1](https://github.com/ckeditor/ckeditor5-mention/releases/tag/v12.0.1)
* [@ckeditor/ckeditor5-paragraph](https://www.npmjs.com/package/@ckeditor/ckeditor5-paragraph): v11.0.3 => [v11.0.4](https://github.com/ckeditor/ckeditor5-paragraph/releases/tag/v11.0.4)
* [@ckeditor/ckeditor5-paste-from-office](https://www.npmjs.com/package/@ckeditor/ckeditor5-paste-from-office): v11.0.3 => [v11.0.4](https://github.com/ckeditor/ckeditor5-paste-from-office/releases/tag/v11.0.4)
* [@ckeditor/ckeditor5-remove-format](https://www.npmjs.com/package/@ckeditor/ckeditor5-remove-format): v10.0.2 => [v10.0.3](https://github.com/ckeditor/ckeditor5-remove-format/releases/tag/v10.0.3)
* [@ckeditor/ckeditor5-table](https://www.npmjs.com/package/@ckeditor/ckeditor5-table): v13.0.1 => [v13.0.2](https://github.com/ckeditor/ckeditor5-table/releases/tag/v13.0.2)
* [@ckeditor/ckeditor5-theme-lark](https://www.npmjs.com/package/@ckeditor/ckeditor5-theme-lark): v14.1.0 => [v14.1.1](https://github.com/ckeditor/ckeditor5-theme-lark/releases/tag/v14.1.1)
* [@ckeditor/ckeditor5-typing](https://www.npmjs.com/package/@ckeditor/ckeditor5-typing): v12.1.0 => [v12.1.1](https://github.com/ckeditor/ckeditor5-typing/releases/tag/v12.1.1)
* [@ckeditor/ckeditor5-ui](https://www.npmjs.com/package/@ckeditor/ckeditor5-ui): v13.0.1 => [v13.0.2](https://github.com/ckeditor/ckeditor5-ui/releases/tag/v13.0.2)
* [@ckeditor/ckeditor5-undo](https://www.npmjs.com/package/@ckeditor/ckeditor5-undo): v11.0.3 => [v11.0.4](https://github.com/ckeditor/ckeditor5-undo/releases/tag/v11.0.4)
* [@ckeditor/ckeditor5-upload](https://www.npmjs.com/package/@ckeditor/ckeditor5-upload): v11.1.0 => [v11.1.1](https://github.com/ckeditor/ckeditor5-upload/releases/tag/v11.1.1)
* [@ckeditor/ckeditor5-utils](https://www.npmjs.com/package/@ckeditor/ckeditor5-utils): v13.0.0 => [v13.0.1](https://github.com/ckeditor/ckeditor5-utils/releases/tag/v13.0.1)
* [@ckeditor/ckeditor5-watchdog](https://www.npmjs.com/package/@ckeditor/ckeditor5-watchdog): v10.0.0 => [v10.0.1](https://github.com/ckeditor/ckeditor5-watchdog/releases/tag/v10.0.1)
* [@ckeditor/ckeditor5-widget](https://www.npmjs.com/package/@ckeditor/ckeditor5-widget): v11.0.3 => [v11.0.4](https://github.com/ckeditor/ckeditor5-widget/releases/tag/v11.0.4)
* [@ckeditor/ckeditor5-word-count](https://www.npmjs.com/package/@ckeditor/ckeditor5-word-count): v10.0.0 => [v10.0.1](https://github.com/ckeditor/ckeditor5-word-count/releases/tag/v10.0.1)


## [12.3.0](https://github.com/ckeditor/ckeditor5/compare/v12.2.0...v12.3.0) (2019-07-04)

### Dependencies

New packages:

* [@ckeditor/ckeditor5-indent](https://www.npmjs.com/package/@ckeditor/ckeditor5-indent): [v10.0.0](https://github.com/ckeditor/ckeditor5-indent/releases/tag/v10.0.0)
* [@ckeditor/ckeditor5-watchdog](https://www.npmjs.com/package/@ckeditor/ckeditor5-watchdog): [v10.0.0](https://github.com/ckeditor/ckeditor5-watchdog/releases/tag/v10.0.0)
* [@ckeditor/ckeditor5-word-count](https://www.npmjs.com/package/@ckeditor/ckeditor5-word-count): [v10.0.0](https://github.com/ckeditor/ckeditor5-word-count/releases/tag/v10.0.0)

Major releases (contain breaking changes):

* [@ckeditor/ckeditor5-clipboard](https://www.npmjs.com/package/@ckeditor/ckeditor5-clipboard): v11.0.2 => [v12.0.0](https://github.com/ckeditor/ckeditor5-clipboard/releases/tag/v12.0.0)
* [@ckeditor/ckeditor5-mention](https://www.npmjs.com/package/@ckeditor/ckeditor5-mention): v11.0.0 => [v12.0.0](https://github.com/ckeditor/ckeditor5-mention/releases/tag/v12.0.0)
* [@ckeditor/ckeditor5-utils](https://www.npmjs.com/package/@ckeditor/ckeditor5-utils): v12.1.1 => [v13.0.0](https://github.com/ckeditor/ckeditor5-utils/releases/tag/v13.0.0)

Minor releases:

* [@ckeditor/ckeditor5-build-balloon](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-balloon): v12.2.0 => [v12.3.0](https://github.com/ckeditor/ckeditor5-build-balloon/releases/tag/v12.3.0)
* [@ckeditor/ckeditor5-build-balloon-block](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-balloon-block): v12.2.0 => [v12.3.0](https://github.com/ckeditor/ckeditor5-build-balloon-block/releases/tag/v12.3.0)
* [@ckeditor/ckeditor5-build-classic](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-classic): v12.2.0 => [v12.3.0](https://github.com/ckeditor/ckeditor5-build-classic/releases/tag/v12.3.0)
* [@ckeditor/ckeditor5-build-decoupled-document](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-decoupled-document): v12.2.0 => [v12.3.0](https://github.com/ckeditor/ckeditor5-build-decoupled-document/releases/tag/v12.3.0)
* [@ckeditor/ckeditor5-build-inline](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-inline): v12.2.0 => [v12.3.0](https://github.com/ckeditor/ckeditor5-build-inline/releases/tag/v12.3.0)
* [@ckeditor/ckeditor5-core](https://www.npmjs.com/package/@ckeditor/ckeditor5-core): v12.1.1 => [v12.2.0](https://github.com/ckeditor/ckeditor5-core/releases/tag/v12.2.0)
* [@ckeditor/ckeditor5-editor-balloon](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-balloon): v12.1.1 => [v12.2.0](https://github.com/ckeditor/ckeditor5-editor-balloon/releases/tag/v12.2.0)
* [@ckeditor/ckeditor5-editor-decoupled](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-decoupled): v12.1.1 => [v12.2.0](https://github.com/ckeditor/ckeditor5-editor-decoupled/releases/tag/v12.2.0)
* [@ckeditor/ckeditor5-editor-inline](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-inline): v12.1.1 => [v12.2.0](https://github.com/ckeditor/ckeditor5-editor-inline/releases/tag/v12.2.0)
* [@ckeditor/ckeditor5-engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine): v13.1.1 => [v13.2.0](https://github.com/ckeditor/ckeditor5-engine/releases/tag/v13.2.0)
* [@ckeditor/ckeditor5-link](https://www.npmjs.com/package/@ckeditor/ckeditor5-link): v11.0.2 => [v11.1.0](https://github.com/ckeditor/ckeditor5-link/releases/tag/v11.1.0)
* [@ckeditor/ckeditor5-theme-lark](https://www.npmjs.com/package/@ckeditor/ckeditor5-theme-lark): v14.0.0 => [v14.1.0](https://github.com/ckeditor/ckeditor5-theme-lark/releases/tag/v14.1.0)
* [@ckeditor/ckeditor5-typing](https://www.npmjs.com/package/@ckeditor/ckeditor5-typing): v12.0.2 => [v12.1.0](https://github.com/ckeditor/ckeditor5-typing/releases/tag/v12.1.0)
* [@ckeditor/ckeditor5-upload](https://www.npmjs.com/package/@ckeditor/ckeditor5-upload): v11.0.2 => [v11.1.0](https://github.com/ckeditor/ckeditor5-upload/releases/tag/v11.1.0)

Patch releases (bug fixes, internal changes):

* [@ckeditor/ckeditor5-adapter-ckfinder](https://www.npmjs.com/package/@ckeditor/ckeditor5-adapter-ckfinder): v11.0.2 => [v11.0.3](https://github.com/ckeditor/ckeditor5-adapter-ckfinder/releases/tag/v11.0.3)
* [@ckeditor/ckeditor5-alignment](https://www.npmjs.com/package/@ckeditor/ckeditor5-alignment): v11.1.1 => [v11.1.2](https://github.com/ckeditor/ckeditor5-alignment/releases/tag/v11.1.2)
* [@ckeditor/ckeditor5-autoformat](https://www.npmjs.com/package/@ckeditor/ckeditor5-autoformat): v11.0.2 => [v11.0.3](https://github.com/ckeditor/ckeditor5-autoformat/releases/tag/v11.0.3)
* [@ckeditor/ckeditor5-autosave](https://www.npmjs.com/package/@ckeditor/ckeditor5-autosave): v11.0.2 => [v11.0.3](https://github.com/ckeditor/ckeditor5-autosave/releases/tag/v11.0.3)
* [@ckeditor/ckeditor5-basic-styles](https://www.npmjs.com/package/@ckeditor/ckeditor5-basic-styles): v11.1.1 => [v11.1.2](https://github.com/ckeditor/ckeditor5-basic-styles/releases/tag/v11.1.2)
* [@ckeditor/ckeditor5-block-quote](https://www.npmjs.com/package/@ckeditor/ckeditor5-block-quote): v11.1.0 => [v11.1.1](https://github.com/ckeditor/ckeditor5-block-quote/releases/tag/v11.1.1)
* [@ckeditor/ckeditor5-ckfinder](https://www.npmjs.com/package/@ckeditor/ckeditor5-ckfinder): v11.0.2 => [v11.0.3](https://github.com/ckeditor/ckeditor5-ckfinder/releases/tag/v11.0.3)
* [@ckeditor/ckeditor5-cloud-services](https://www.npmjs.com/package/@ckeditor/ckeditor5-cloud-services): v11.0.2 => [v11.0.3](https://github.com/ckeditor/ckeditor5-cloud-services/releases/tag/v11.0.3)
* [@ckeditor/ckeditor5-easy-image](https://www.npmjs.com/package/@ckeditor/ckeditor5-easy-image): v11.0.2 => [v11.0.3](https://github.com/ckeditor/ckeditor5-easy-image/releases/tag/v11.0.3)
* [@ckeditor/ckeditor5-editor-classic](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-classic): v12.1.1 => [v12.1.2](https://github.com/ckeditor/ckeditor5-editor-classic/releases/tag/v12.1.2)
* [@ckeditor/ckeditor5-enter](https://www.npmjs.com/package/@ckeditor/ckeditor5-enter): v11.0.2 => [v11.0.3](https://github.com/ckeditor/ckeditor5-enter/releases/tag/v11.0.3)
* [@ckeditor/ckeditor5-essentials](https://www.npmjs.com/package/@ckeditor/ckeditor5-essentials): v11.0.2 => [v11.0.3](https://github.com/ckeditor/ckeditor5-essentials/releases/tag/v11.0.3)
* [@ckeditor/ckeditor5-font](https://www.npmjs.com/package/@ckeditor/ckeditor5-font): v11.1.1 => [v11.1.2](https://github.com/ckeditor/ckeditor5-font/releases/tag/v11.1.2)
* [@ckeditor/ckeditor5-heading](https://www.npmjs.com/package/@ckeditor/ckeditor5-heading): v11.0.2 => [v11.0.3](https://github.com/ckeditor/ckeditor5-heading/releases/tag/v11.0.3)
* [@ckeditor/ckeditor5-highlight](https://www.npmjs.com/package/@ckeditor/ckeditor5-highlight): v11.0.2 => [v11.0.3](https://github.com/ckeditor/ckeditor5-highlight/releases/tag/v11.0.3)
* [@ckeditor/ckeditor5-image](https://www.npmjs.com/package/@ckeditor/ckeditor5-image): v13.1.0 => [v13.1.1](https://github.com/ckeditor/ckeditor5-image/releases/tag/v13.1.1)
* [@ckeditor/ckeditor5-list](https://www.npmjs.com/package/@ckeditor/ckeditor5-list): v12.0.2 => [v12.0.3](https://github.com/ckeditor/ckeditor5-list/releases/tag/v12.0.3)
* [@ckeditor/ckeditor5-markdown-gfm](https://www.npmjs.com/package/@ckeditor/ckeditor5-markdown-gfm): v11.0.2 => [v11.0.3](https://github.com/ckeditor/ckeditor5-markdown-gfm/releases/tag/v11.0.3)
* [@ckeditor/ckeditor5-media-embed](https://www.npmjs.com/package/@ckeditor/ckeditor5-media-embed): v11.1.1 => [v11.1.2](https://github.com/ckeditor/ckeditor5-media-embed/releases/tag/v11.1.2)
* [@ckeditor/ckeditor5-paragraph](https://www.npmjs.com/package/@ckeditor/ckeditor5-paragraph): v11.0.2 => [v11.0.3](https://github.com/ckeditor/ckeditor5-paragraph/releases/tag/v11.0.3)
* [@ckeditor/ckeditor5-paste-from-office](https://www.npmjs.com/package/@ckeditor/ckeditor5-paste-from-office): v11.0.2 => [v11.0.3](https://github.com/ckeditor/ckeditor5-paste-from-office/releases/tag/v11.0.3)
* [@ckeditor/ckeditor5-remove-format](https://www.npmjs.com/package/@ckeditor/ckeditor5-remove-format): v10.0.1 => [v10.0.2](https://github.com/ckeditor/ckeditor5-remove-format/releases/tag/v10.0.2)
* [@ckeditor/ckeditor5-table](https://www.npmjs.com/package/@ckeditor/ckeditor5-table): v13.0.0 => [v13.0.1](https://github.com/ckeditor/ckeditor5-table/releases/tag/v13.0.1)
* [@ckeditor/ckeditor5-ui](https://www.npmjs.com/package/@ckeditor/ckeditor5-ui): v13.0.0 => [v13.0.1](https://github.com/ckeditor/ckeditor5-ui/releases/tag/v13.0.1)
* [@ckeditor/ckeditor5-undo](https://www.npmjs.com/package/@ckeditor/ckeditor5-undo): v11.0.2 => [v11.0.3](https://github.com/ckeditor/ckeditor5-undo/releases/tag/v11.0.3)
* [@ckeditor/ckeditor5-widget](https://www.npmjs.com/package/@ckeditor/ckeditor5-widget): v11.0.2 => [v11.0.3](https://github.com/ckeditor/ckeditor5-widget/releases/tag/v11.0.3)


## [12.2.0](https://github.com/ckeditor/ckeditor5/compare/v12.1.0...v12.2.0) (2019-06-05)

We are happy to report the release of CKEditor 5 v12.2.0. This is a minor release with many bug fixes and a new UI feature which allows to navigating between multiple balloons.

**Note:** The `config.table.toolbar` property that had been deprecated last year has now been completely removed. Use [`config.table.contentToolbar`](https://ckeditor.com/docs/ckeditor5/latest/api/module_table_table-TableConfig.html#member-contentToolbar) instead.

Read more in the blog post: https://ckeditor.com/blog/CKEditor-5-v12.2.0-with-mobile-friendly-comments-mode/

### Dependencies

Major releases (contain breaking changes):

* [@ckeditor/ckeditor5-mention](https://www.npmjs.com/package/@ckeditor/ckeditor5-mention): v10.0.0 => [v11.0.0](https://github.com/ckeditor/ckeditor5-mention/releases/tag/v11.0.0)
* [@ckeditor/ckeditor5-table](https://www.npmjs.com/package/@ckeditor/ckeditor5-table): v12.0.1 => [v13.0.0](https://github.com/ckeditor/ckeditor5-table/releases/tag/v13.0.0)
* [@ckeditor/ckeditor5-theme-lark](https://www.npmjs.com/package/@ckeditor/ckeditor5-theme-lark): v13.0.1 => [v14.0.0](https://github.com/ckeditor/ckeditor5-theme-lark/releases/tag/v14.0.0)
* [@ckeditor/ckeditor5-ui](https://www.npmjs.com/package/@ckeditor/ckeditor5-ui): v12.1.0 => [v13.0.0](https://github.com/ckeditor/ckeditor5-ui/releases/tag/v13.0.0)

Minor releases:

* [@ckeditor/ckeditor5-block-quote](https://www.npmjs.com/package/@ckeditor/ckeditor5-block-quote): v11.0.1 => [v11.1.0](https://github.com/ckeditor/ckeditor5-block-quote/releases/tag/v11.1.0)
* [@ckeditor/ckeditor5-build-balloon](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-balloon): v12.1.0 => [v12.2.0](https://github.com/ckeditor/ckeditor5-build-balloon/releases/tag/v12.2.0)
* [@ckeditor/ckeditor5-build-balloon-block](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-balloon-block): v12.1.0 => [v12.2.0](https://github.com/ckeditor/ckeditor5-build-balloon-block/releases/tag/v12.2.0)
* [@ckeditor/ckeditor5-build-classic](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-classic): v12.1.0 => [v12.2.0](https://github.com/ckeditor/ckeditor5-build-classic/releases/tag/v12.2.0)
* [@ckeditor/ckeditor5-build-decoupled-document](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-decoupled-document): v12.1.0 => [v12.2.0](https://github.com/ckeditor/ckeditor5-build-decoupled-document/releases/tag/v12.2.0)
* [@ckeditor/ckeditor5-build-inline](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-inline): v12.1.0 => [v12.2.0](https://github.com/ckeditor/ckeditor5-build-inline/releases/tag/v12.2.0)
* [@ckeditor/ckeditor5-image](https://www.npmjs.com/package/@ckeditor/ckeditor5-image): v13.0.1 => [v13.1.0](https://github.com/ckeditor/ckeditor5-image/releases/tag/v13.1.0)

Patch releases (bug fixes, internal changes):

* [@ckeditor/ckeditor5-adapter-ckfinder](https://www.npmjs.com/package/@ckeditor/ckeditor5-adapter-ckfinder): v11.0.1 => [v11.0.2](https://github.com/ckeditor/ckeditor5-adapter-ckfinder/releases/tag/v11.0.2)
* [@ckeditor/ckeditor5-alignment](https://www.npmjs.com/package/@ckeditor/ckeditor5-alignment): v11.1.0 => [v11.1.1](https://github.com/ckeditor/ckeditor5-alignment/releases/tag/v11.1.1)
* [@ckeditor/ckeditor5-autoformat](https://www.npmjs.com/package/@ckeditor/ckeditor5-autoformat): v11.0.1 => [v11.0.2](https://github.com/ckeditor/ckeditor5-autoformat/releases/tag/v11.0.2)
* [@ckeditor/ckeditor5-autosave](https://www.npmjs.com/package/@ckeditor/ckeditor5-autosave): v11.0.1 => [v11.0.2](https://github.com/ckeditor/ckeditor5-autosave/releases/tag/v11.0.2)
* [@ckeditor/ckeditor5-basic-styles](https://www.npmjs.com/package/@ckeditor/ckeditor5-basic-styles): v11.1.0 => [v11.1.1](https://github.com/ckeditor/ckeditor5-basic-styles/releases/tag/v11.1.1)
* [@ckeditor/ckeditor5-ckfinder](https://www.npmjs.com/package/@ckeditor/ckeditor5-ckfinder): v11.0.1 => [v11.0.2](https://github.com/ckeditor/ckeditor5-ckfinder/releases/tag/v11.0.2)
* [@ckeditor/ckeditor5-clipboard](https://www.npmjs.com/package/@ckeditor/ckeditor5-clipboard): v11.0.1 => [v11.0.2](https://github.com/ckeditor/ckeditor5-clipboard/releases/tag/v11.0.2)
* [@ckeditor/ckeditor5-cloud-services](https://www.npmjs.com/package/@ckeditor/ckeditor5-cloud-services): v11.0.1 => [v11.0.2](https://github.com/ckeditor/ckeditor5-cloud-services/releases/tag/v11.0.2)
* [@ckeditor/ckeditor5-core](https://www.npmjs.com/package/@ckeditor/ckeditor5-core): v12.1.0 => [v12.1.1](https://github.com/ckeditor/ckeditor5-core/releases/tag/v12.1.1)
* [@ckeditor/ckeditor5-easy-image](https://www.npmjs.com/package/@ckeditor/ckeditor5-easy-image): v11.0.1 => [v11.0.2](https://github.com/ckeditor/ckeditor5-easy-image/releases/tag/v11.0.2)
* [@ckeditor/ckeditor5-editor-balloon](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-balloon): v12.1.0 => [v12.1.1](https://github.com/ckeditor/ckeditor5-editor-balloon/releases/tag/v12.1.1)
* [@ckeditor/ckeditor5-editor-classic](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-classic): v12.1.0 => [v12.1.1](https://github.com/ckeditor/ckeditor5-editor-classic/releases/tag/v12.1.1)
* [@ckeditor/ckeditor5-editor-decoupled](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-decoupled): v12.1.0 => [v12.1.1](https://github.com/ckeditor/ckeditor5-editor-decoupled/releases/tag/v12.1.1)
* [@ckeditor/ckeditor5-editor-inline](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-inline): v12.1.0 => [v12.1.1](https://github.com/ckeditor/ckeditor5-editor-inline/releases/tag/v12.1.1)
* [@ckeditor/ckeditor5-engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine): v13.1.0 => [v13.1.1](https://github.com/ckeditor/ckeditor5-engine/releases/tag/v13.1.1)
* [@ckeditor/ckeditor5-enter](https://www.npmjs.com/package/@ckeditor/ckeditor5-enter): v11.0.1 => [v11.0.2](https://github.com/ckeditor/ckeditor5-enter/releases/tag/v11.0.2)
* [@ckeditor/ckeditor5-essentials](https://www.npmjs.com/package/@ckeditor/ckeditor5-essentials): v11.0.1 => [v11.0.2](https://github.com/ckeditor/ckeditor5-essentials/releases/tag/v11.0.2)
* [@ckeditor/ckeditor5-font](https://www.npmjs.com/package/@ckeditor/ckeditor5-font): v11.1.0 => [v11.1.1](https://github.com/ckeditor/ckeditor5-font/releases/tag/v11.1.1)
* [@ckeditor/ckeditor5-heading](https://www.npmjs.com/package/@ckeditor/ckeditor5-heading): v11.0.1 => [v11.0.2](https://github.com/ckeditor/ckeditor5-heading/releases/tag/v11.0.2)
* [@ckeditor/ckeditor5-highlight](https://www.npmjs.com/package/@ckeditor/ckeditor5-highlight): v11.0.1 => [v11.0.2](https://github.com/ckeditor/ckeditor5-highlight/releases/tag/v11.0.2)
* [@ckeditor/ckeditor5-link](https://www.npmjs.com/package/@ckeditor/ckeditor5-link): v11.0.1 => [v11.0.2](https://github.com/ckeditor/ckeditor5-link/releases/tag/v11.0.2)
* [@ckeditor/ckeditor5-list](https://www.npmjs.com/package/@ckeditor/ckeditor5-list): v12.0.1 => [v12.0.2](https://github.com/ckeditor/ckeditor5-list/releases/tag/v12.0.2)
* [@ckeditor/ckeditor5-markdown-gfm](https://www.npmjs.com/package/@ckeditor/ckeditor5-markdown-gfm): v11.0.1 => [v11.0.2](https://github.com/ckeditor/ckeditor5-markdown-gfm/releases/tag/v11.0.2)
* [@ckeditor/ckeditor5-media-embed](https://www.npmjs.com/package/@ckeditor/ckeditor5-media-embed): v11.1.0 => [v11.1.1](https://github.com/ckeditor/ckeditor5-media-embed/releases/tag/v11.1.1)
* [@ckeditor/ckeditor5-paragraph](https://www.npmjs.com/package/@ckeditor/ckeditor5-paragraph): v11.0.1 => [v11.0.2](https://github.com/ckeditor/ckeditor5-paragraph/releases/tag/v11.0.2)
* [@ckeditor/ckeditor5-paste-from-office](https://www.npmjs.com/package/@ckeditor/ckeditor5-paste-from-office): v11.0.1 => [v11.0.2](https://github.com/ckeditor/ckeditor5-paste-from-office/releases/tag/v11.0.2)
* [@ckeditor/ckeditor5-remove-format](https://www.npmjs.com/package/@ckeditor/ckeditor5-remove-format): v10.0.0 => [v10.0.1](https://github.com/ckeditor/ckeditor5-remove-format/releases/tag/v10.0.1)
* [@ckeditor/ckeditor5-typing](https://www.npmjs.com/package/@ckeditor/ckeditor5-typing): v12.0.1 => [v12.0.2](https://github.com/ckeditor/ckeditor5-typing/releases/tag/v12.0.2)
* [@ckeditor/ckeditor5-undo](https://www.npmjs.com/package/@ckeditor/ckeditor5-undo): v11.0.1 => [v11.0.2](https://github.com/ckeditor/ckeditor5-undo/releases/tag/v11.0.2)
* [@ckeditor/ckeditor5-upload](https://www.npmjs.com/package/@ckeditor/ckeditor5-upload): v11.0.1 => [v11.0.2](https://github.com/ckeditor/ckeditor5-upload/releases/tag/v11.0.2)
* [@ckeditor/ckeditor5-utils](https://www.npmjs.com/package/@ckeditor/ckeditor5-utils): v12.1.0 => [v12.1.1](https://github.com/ckeditor/ckeditor5-utils/releases/tag/v12.1.1)
* [@ckeditor/ckeditor5-widget](https://www.npmjs.com/package/@ckeditor/ckeditor5-widget): v11.0.1 => [v11.0.2](https://github.com/ckeditor/ckeditor5-widget/releases/tag/v11.0.2)


## [12.1.0](https://github.com/ckeditor/ckeditor5/compare/v12.0.0...v12.1.0) (2019-04-10)

We are happy to report the release of CKEditor 5 v12.1.0. This release introduces 3 new features ([mentions](https://ckeditor.com/docs/ckeditor5/latest/features/mentions.html), [font color and background color](https://ckeditor.com/docs/ckeditor5/latest/features/font.html) and [remove format](https://ckeditor.com/docs/ckeditor5/latest/features/remove-format.html)).

Read more in the blog post: https://ckeditor.com/blog/CKEditor-5-v12.1.0-with-mentions-font-color-and-remove-formatting-released/

### Dependencies

New packages:

* [@ckeditor/ckeditor5-mention](https://www.npmjs.com/package/@ckeditor/ckeditor5-mention): [v10.0.0](https://github.com/ckeditor/ckeditor5-mention/releases/tag/v10.0.0)
* [@ckeditor/ckeditor5-remove-format](https://www.npmjs.com/package/@ckeditor/ckeditor5-remove-format): [v10.0.0](https://github.com/ckeditor/ckeditor5-remove-format/releases/tag/v10.0.0)

Minor releases:

* [@ckeditor/ckeditor5-alignment](https://www.npmjs.com/package/@ckeditor/ckeditor5-alignment): v11.0.0 => [v11.1.0](https://github.com/ckeditor/ckeditor5-alignment/releases/tag/v11.1.0)
* [@ckeditor/ckeditor5-basic-styles](https://www.npmjs.com/package/@ckeditor/ckeditor5-basic-styles): v11.0.0 => [v11.1.0](https://github.com/ckeditor/ckeditor5-basic-styles/releases/tag/v11.1.0)
* [@ckeditor/ckeditor5-build-balloon](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-balloon): v12.0.0 => [v12.1.0](https://github.com/ckeditor/ckeditor5-build-balloon/releases/tag/v12.1.0)
* [@ckeditor/ckeditor5-build-balloon-block](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-balloon-block): v12.0.0 => [v12.1.0](https://github.com/ckeditor/ckeditor5-build-balloon-block/releases/tag/v12.1.0)
* [@ckeditor/ckeditor5-build-classic](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-classic): v12.0.0 => [v12.1.0](https://github.com/ckeditor/ckeditor5-build-classic/releases/tag/v12.1.0)
* [@ckeditor/ckeditor5-build-decoupled-document](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-decoupled-document): v12.0.0 => [v12.1.0](https://github.com/ckeditor/ckeditor5-build-decoupled-document/releases/tag/v12.1.0)
* [@ckeditor/ckeditor5-build-inline](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-inline): v12.0.0 => [v12.1.0](https://github.com/ckeditor/ckeditor5-build-inline/releases/tag/v12.1.0)
* [@ckeditor/ckeditor5-core](https://www.npmjs.com/package/@ckeditor/ckeditor5-core): v12.0.0 => [v12.1.0](https://github.com/ckeditor/ckeditor5-core/releases/tag/v12.1.0)
* [@ckeditor/ckeditor5-editor-balloon](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-balloon): v12.0.0 => [v12.1.0](https://github.com/ckeditor/ckeditor5-editor-balloon/releases/tag/v12.1.0)
* [@ckeditor/ckeditor5-editor-classic](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-classic): v12.0.0 => [v12.1.0](https://github.com/ckeditor/ckeditor5-editor-classic/releases/tag/v12.1.0)
* [@ckeditor/ckeditor5-editor-decoupled](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-decoupled): v12.0.0 => [v12.1.0](https://github.com/ckeditor/ckeditor5-editor-decoupled/releases/tag/v12.1.0)
* [@ckeditor/ckeditor5-editor-inline](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-inline): v12.0.0 => [v12.1.0](https://github.com/ckeditor/ckeditor5-editor-inline/releases/tag/v12.1.0)
* [@ckeditor/ckeditor5-engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine): v13.0.0 => [v13.1.0](https://github.com/ckeditor/ckeditor5-engine/releases/tag/v13.1.0)
* [@ckeditor/ckeditor5-font](https://www.npmjs.com/package/@ckeditor/ckeditor5-font): v11.0.0 => [v11.1.0](https://github.com/ckeditor/ckeditor5-font/releases/tag/v11.1.0)
* [@ckeditor/ckeditor5-media-embed](https://www.npmjs.com/package/@ckeditor/ckeditor5-media-embed): v11.0.0 => [v11.1.0](https://github.com/ckeditor/ckeditor5-media-embed/releases/tag/v11.1.0)
* [@ckeditor/ckeditor5-ui](https://www.npmjs.com/package/@ckeditor/ckeditor5-ui): v12.0.0 => [v12.1.0](https://github.com/ckeditor/ckeditor5-ui/releases/tag/v12.1.0)
* [@ckeditor/ckeditor5-utils](https://www.npmjs.com/package/@ckeditor/ckeditor5-utils): v12.0.0 => [v12.1.0](https://github.com/ckeditor/ckeditor5-utils/releases/tag/v12.1.0)

Patch releases (bug fixes, internal changes):

* [@ckeditor/ckeditor5-adapter-ckfinder](https://www.npmjs.com/package/@ckeditor/ckeditor5-adapter-ckfinder): v11.0.0 => [v11.0.1](https://github.com/ckeditor/ckeditor5-adapter-ckfinder/releases/tag/v11.0.1)
* [@ckeditor/ckeditor5-autoformat](https://www.npmjs.com/package/@ckeditor/ckeditor5-autoformat): v11.0.0 => [v11.0.1](https://github.com/ckeditor/ckeditor5-autoformat/releases/tag/v11.0.1)
* [@ckeditor/ckeditor5-autosave](https://www.npmjs.com/package/@ckeditor/ckeditor5-autosave): v11.0.0 => [v11.0.1](https://github.com/ckeditor/ckeditor5-autosave/releases/tag/v11.0.1)
* [@ckeditor/ckeditor5-block-quote](https://www.npmjs.com/package/@ckeditor/ckeditor5-block-quote): v11.0.0 => [v11.0.1](https://github.com/ckeditor/ckeditor5-block-quote/releases/tag/v11.0.1)
* [@ckeditor/ckeditor5-ckfinder](https://www.npmjs.com/package/@ckeditor/ckeditor5-ckfinder): v11.0.0 => [v11.0.1](https://github.com/ckeditor/ckeditor5-ckfinder/releases/tag/v11.0.1)
* [@ckeditor/ckeditor5-clipboard](https://www.npmjs.com/package/@ckeditor/ckeditor5-clipboard): v11.0.0 => [v11.0.1](https://github.com/ckeditor/ckeditor5-clipboard/releases/tag/v11.0.1)
* [@ckeditor/ckeditor5-cloud-services](https://www.npmjs.com/package/@ckeditor/ckeditor5-cloud-services): v11.0.0 => [v11.0.1](https://github.com/ckeditor/ckeditor5-cloud-services/releases/tag/v11.0.1)
* [@ckeditor/ckeditor5-easy-image](https://www.npmjs.com/package/@ckeditor/ckeditor5-easy-image): v11.0.0 => [v11.0.1](https://github.com/ckeditor/ckeditor5-easy-image/releases/tag/v11.0.1)
* [@ckeditor/ckeditor5-enter](https://www.npmjs.com/package/@ckeditor/ckeditor5-enter): v11.0.0 => [v11.0.1](https://github.com/ckeditor/ckeditor5-enter/releases/tag/v11.0.1)
* [@ckeditor/ckeditor5-essentials](https://www.npmjs.com/package/@ckeditor/ckeditor5-essentials): v11.0.0 => [v11.0.1](https://github.com/ckeditor/ckeditor5-essentials/releases/tag/v11.0.1)
* [@ckeditor/ckeditor5-heading](https://www.npmjs.com/package/@ckeditor/ckeditor5-heading): v11.0.0 => [v11.0.1](https://github.com/ckeditor/ckeditor5-heading/releases/tag/v11.0.1)
* [@ckeditor/ckeditor5-highlight](https://www.npmjs.com/package/@ckeditor/ckeditor5-highlight): v11.0.0 => [v11.0.1](https://github.com/ckeditor/ckeditor5-highlight/releases/tag/v11.0.1)
* [@ckeditor/ckeditor5-image](https://www.npmjs.com/package/@ckeditor/ckeditor5-image): v13.0.0 => [v13.0.1](https://github.com/ckeditor/ckeditor5-image/releases/tag/v13.0.1)
* [@ckeditor/ckeditor5-link](https://www.npmjs.com/package/@ckeditor/ckeditor5-link): v11.0.0 => [v11.0.1](https://github.com/ckeditor/ckeditor5-link/releases/tag/v11.0.1)
* [@ckeditor/ckeditor5-list](https://www.npmjs.com/package/@ckeditor/ckeditor5-list): v12.0.0 => [v12.0.1](https://github.com/ckeditor/ckeditor5-list/releases/tag/v12.0.1)
* [@ckeditor/ckeditor5-markdown-gfm](https://www.npmjs.com/package/@ckeditor/ckeditor5-markdown-gfm): v11.0.0 => [v11.0.1](https://github.com/ckeditor/ckeditor5-markdown-gfm/releases/tag/v11.0.1)
* [@ckeditor/ckeditor5-paragraph](https://www.npmjs.com/package/@ckeditor/ckeditor5-paragraph): v11.0.0 => [v11.0.1](https://github.com/ckeditor/ckeditor5-paragraph/releases/tag/v11.0.1)
* [@ckeditor/ckeditor5-paste-from-office](https://www.npmjs.com/package/@ckeditor/ckeditor5-paste-from-office): v11.0.0 => [v11.0.1](https://github.com/ckeditor/ckeditor5-paste-from-office/releases/tag/v11.0.1)
* [@ckeditor/ckeditor5-table](https://www.npmjs.com/package/@ckeditor/ckeditor5-table): v12.0.0 => [v12.0.1](https://github.com/ckeditor/ckeditor5-table/releases/tag/v12.0.1)
* [@ckeditor/ckeditor5-theme-lark](https://www.npmjs.com/package/@ckeditor/ckeditor5-theme-lark): v13.0.0 => [v13.0.1](https://github.com/ckeditor/ckeditor5-theme-lark/releases/tag/v13.0.1)
* [@ckeditor/ckeditor5-typing](https://www.npmjs.com/package/@ckeditor/ckeditor5-typing): v12.0.0 => [v12.0.1](https://github.com/ckeditor/ckeditor5-typing/releases/tag/v12.0.1)
* [@ckeditor/ckeditor5-undo](https://www.npmjs.com/package/@ckeditor/ckeditor5-undo): v11.0.0 => [v11.0.1](https://github.com/ckeditor/ckeditor5-undo/releases/tag/v11.0.1)
* [@ckeditor/ckeditor5-upload](https://www.npmjs.com/package/@ckeditor/ckeditor5-upload): v11.0.0 => [v11.0.1](https://github.com/ckeditor/ckeditor5-upload/releases/tag/v11.0.1)
* [@ckeditor/ckeditor5-widget](https://www.npmjs.com/package/@ckeditor/ckeditor5-widget): v11.0.0 => [v11.0.1](https://github.com/ckeditor/ckeditor5-widget/releases/tag/v11.0.1)


## [12.0.0](https://github.com/ckeditor/ckeditor5/compare/v11.2.0...v12.0.0) (2019-02-28)

We are happy to report the release of CKEditor 5 v12.0.0. This release introduces a new editor (called "[Balloon block editor](https://ckeditor.com/docs/ckeditor5/latest/examples/builds/balloon-block-editor.html)"), the [editor content placeholder](https://ckeditor.com/docs/ckeditor5/latest/features/editor-placeholder.html) and support for inline widgets (watch [this PR](https://github.com/ckeditor/ckeditor5/pull/1587) for updates). In addition to that we enabled media embeds and images in tables and resolved the issue where `editor.getData()` returned `<p>&nbsp;</p>` for empty content (now it returns an empty string in this case).

Besides new features, this release contains many improvements to stability, [performance](https://github.com/ckeditor/ckeditor5-utils/issues/269) and API. The last group of changes contain many breaking ones. Make sure to read the notes below.

Read more in the blog post: https://ckeditor.com/blog/CKEditor-5-v12.0.0-with-inline-widgets-and-distraction-free-editor-released/

**Important information for integration developers:** The `editor.getData()` method will return an empty string if the editor is empty (instead of returning `<p>&nbsp;</p>`). Also, if you relied on `editor.ui.view.editable`, you will now need to use `editor.ui.getEditableElement()` instead. You may also want to read the below sections and the [Migration guide](https://github.com/ckeditor/ckeditor5/issues/1582) to learn more.

**Important information for plugin developers:** The most important change that will affect your plugins is the removal of the `upcast-converters.js` and `downcast-converters.js` modules. You can now find those methods directly on the object returned by [`editor.conversion.for()`](https://ckeditor.com/docs/ckeditor5/latest/api/module_engine_conversion_conversion-Conversion.html#function-for). Other than that, see the changes described in the next section, the [engine's changelog](https://github.com/ckeditor/ckeditor5-engine/releases/tag/v13.0.0) and read the [Migration guide](https://github.com/ckeditor/ckeditor5/issues/1582) for the details.

**Important information for custom editor developers:** We cleaned up the base editor interfaces and classes (`EditorWithUI`, `EditorUI`, `EditorUIView`, `EditableUIView`) and straightened responsibilities between the UI and the engine (the engine is now the one responsible for managing editable element classes). These changes means that your custom editor implementations will need to be updated. Read more in the [Migration guide](https://github.com/ckeditor/ckeditor5/issues/1582).

### Dependencies

New packages:

* [@ckeditor/ckeditor5-build-balloon-block](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-balloon-block): [v12.0.0](https://github.com/ckeditor/ckeditor5-build-balloon-block/releases/tag/v12.0.0)

Major releases (contain breaking changes):

* [@ckeditor/ckeditor5-adapter-ckfinder](https://www.npmjs.com/package/@ckeditor/ckeditor5-adapter-ckfinder): v10.0.4 => [v11.0.0](https://github.com/ckeditor/ckeditor5-adapter-ckfinder/releases/tag/v11.0.0)
* [@ckeditor/ckeditor5-alignment](https://www.npmjs.com/package/@ckeditor/ckeditor5-alignment): v10.0.4 => [v11.0.0](https://github.com/ckeditor/ckeditor5-alignment/releases/tag/v11.0.0)
* [@ckeditor/ckeditor5-autoformat](https://www.npmjs.com/package/@ckeditor/ckeditor5-autoformat): v10.0.4 => [v11.0.0](https://github.com/ckeditor/ckeditor5-autoformat/releases/tag/v11.0.0)
* [@ckeditor/ckeditor5-autosave](https://www.npmjs.com/package/@ckeditor/ckeditor5-autosave): v10.0.2 => [v11.0.0](https://github.com/ckeditor/ckeditor5-autosave/releases/tag/v11.0.0)
* [@ckeditor/ckeditor5-basic-styles](https://www.npmjs.com/package/@ckeditor/ckeditor5-basic-styles): v10.1.0 => [v11.0.0](https://github.com/ckeditor/ckeditor5-basic-styles/releases/tag/v11.0.0)
* [@ckeditor/ckeditor5-block-quote](https://www.npmjs.com/package/@ckeditor/ckeditor5-block-quote): v10.1.1 => [v11.0.0](https://github.com/ckeditor/ckeditor5-block-quote/releases/tag/v11.0.0)
* [@ckeditor/ckeditor5-build-balloon](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-balloon): v11.2.0 => [v12.0.0](https://github.com/ckeditor/ckeditor5-build-balloon/releases/tag/v12.0.0)
* [@ckeditor/ckeditor5-build-classic](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-classic): v11.2.0 => [v12.0.0](https://github.com/ckeditor/ckeditor5-build-classic/releases/tag/v12.0.0)
* [@ckeditor/ckeditor5-build-decoupled-document](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-decoupled-document): v11.2.0 => [v12.0.0](https://github.com/ckeditor/ckeditor5-build-decoupled-document/releases/tag/v12.0.0)
* [@ckeditor/ckeditor5-build-inline](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-inline): v11.2.0 => [v12.0.0](https://github.com/ckeditor/ckeditor5-build-inline/releases/tag/v12.0.0)
* [@ckeditor/ckeditor5-ckfinder](https://www.npmjs.com/package/@ckeditor/ckeditor5-ckfinder): v10.0.0 => [v11.0.0](https://github.com/ckeditor/ckeditor5-ckfinder/releases/tag/v11.0.0)
* [@ckeditor/ckeditor5-clipboard](https://www.npmjs.com/package/@ckeditor/ckeditor5-clipboard): v10.0.4 => [v11.0.0](https://github.com/ckeditor/ckeditor5-clipboard/releases/tag/v11.0.0)
* [@ckeditor/ckeditor5-cloud-services](https://www.npmjs.com/package/@ckeditor/ckeditor5-cloud-services): v10.1.1 => [v11.0.0](https://github.com/ckeditor/ckeditor5-cloud-services/releases/tag/v11.0.0)
* [@ckeditor/ckeditor5-core](https://www.npmjs.com/package/@ckeditor/ckeditor5-core): v11.1.0 => [v12.0.0](https://github.com/ckeditor/ckeditor5-core/releases/tag/v12.0.0)
* [@ckeditor/ckeditor5-easy-image](https://www.npmjs.com/package/@ckeditor/ckeditor5-easy-image): v10.0.4 => [v11.0.0](https://github.com/ckeditor/ckeditor5-easy-image/releases/tag/v11.0.0)
* [@ckeditor/ckeditor5-editor-balloon](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-balloon): v11.0.2 => [v12.0.0](https://github.com/ckeditor/ckeditor5-editor-balloon/releases/tag/v12.0.0)
* [@ckeditor/ckeditor5-editor-classic](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-classic): v11.0.2 => [v12.0.0](https://github.com/ckeditor/ckeditor5-editor-classic/releases/tag/v12.0.0)
* [@ckeditor/ckeditor5-editor-decoupled](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-decoupled): v11.0.2 => [v12.0.0](https://github.com/ckeditor/ckeditor5-editor-decoupled/releases/tag/v12.0.0)
* [@ckeditor/ckeditor5-editor-inline](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-inline): v11.0.2 => [v12.0.0](https://github.com/ckeditor/ckeditor5-editor-inline/releases/tag/v12.0.0)
* [@ckeditor/ckeditor5-engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine): v12.0.0 => [v13.0.0](https://github.com/ckeditor/ckeditor5-engine/releases/tag/v13.0.0)
* [@ckeditor/ckeditor5-enter](https://www.npmjs.com/package/@ckeditor/ckeditor5-enter): v10.1.3 => [v11.0.0](https://github.com/ckeditor/ckeditor5-enter/releases/tag/v11.0.0)
* [@ckeditor/ckeditor5-essentials](https://www.npmjs.com/package/@ckeditor/ckeditor5-essentials): v10.1.3 => [v11.0.0](https://github.com/ckeditor/ckeditor5-essentials/releases/tag/v11.0.0)
* [@ckeditor/ckeditor5-font](https://www.npmjs.com/package/@ckeditor/ckeditor5-font): v10.0.4 => [v11.0.0](https://github.com/ckeditor/ckeditor5-font/releases/tag/v11.0.0)
* [@ckeditor/ckeditor5-heading](https://www.npmjs.com/package/@ckeditor/ckeditor5-heading): v10.1.1 => [v11.0.0](https://github.com/ckeditor/ckeditor5-heading/releases/tag/v11.0.0)
* [@ckeditor/ckeditor5-highlight](https://www.npmjs.com/package/@ckeditor/ckeditor5-highlight): v10.0.4 => [v11.0.0](https://github.com/ckeditor/ckeditor5-highlight/releases/tag/v11.0.0)
* [@ckeditor/ckeditor5-image](https://www.npmjs.com/package/@ckeditor/ckeditor5-image): v12.0.0 => [v13.0.0](https://github.com/ckeditor/ckeditor5-image/releases/tag/v13.0.0)
* [@ckeditor/ckeditor5-link](https://www.npmjs.com/package/@ckeditor/ckeditor5-link): v10.1.0 => [v11.0.0](https://github.com/ckeditor/ckeditor5-link/releases/tag/v11.0.0)
* [@ckeditor/ckeditor5-list](https://www.npmjs.com/package/@ckeditor/ckeditor5-list): v11.0.3 => [v12.0.0](https://github.com/ckeditor/ckeditor5-list/releases/tag/v12.0.0)
* [@ckeditor/ckeditor5-markdown-gfm](https://www.npmjs.com/package/@ckeditor/ckeditor5-markdown-gfm): v10.0.4 => [v11.0.0](https://github.com/ckeditor/ckeditor5-markdown-gfm/releases/tag/v11.0.0)
* [@ckeditor/ckeditor5-media-embed](https://www.npmjs.com/package/@ckeditor/ckeditor5-media-embed): v10.1.0 => [v11.0.0](https://github.com/ckeditor/ckeditor5-media-embed/releases/tag/v11.0.0)
* [@ckeditor/ckeditor5-paragraph](https://www.npmjs.com/package/@ckeditor/ckeditor5-paragraph): v10.0.4 => [v11.0.0](https://github.com/ckeditor/ckeditor5-paragraph/releases/tag/v11.0.0)
* [@ckeditor/ckeditor5-paste-from-office](https://www.npmjs.com/package/@ckeditor/ckeditor5-paste-from-office): v10.0.0 => [v11.0.0](https://github.com/ckeditor/ckeditor5-paste-from-office/releases/tag/v11.0.0)
* [@ckeditor/ckeditor5-table](https://www.npmjs.com/package/@ckeditor/ckeditor5-table): v11.0.1 => [v12.0.0](https://github.com/ckeditor/ckeditor5-table/releases/tag/v12.0.0)
* [@ckeditor/ckeditor5-theme-lark](https://www.npmjs.com/package/@ckeditor/ckeditor5-theme-lark): v12.0.0 => [v13.0.0](https://github.com/ckeditor/ckeditor5-theme-lark/releases/tag/v13.0.0)
* [@ckeditor/ckeditor5-typing](https://www.npmjs.com/package/@ckeditor/ckeditor5-typing): v11.0.2 => [v12.0.0](https://github.com/ckeditor/ckeditor5-typing/releases/tag/v12.0.0)
* [@ckeditor/ckeditor5-ui](https://www.npmjs.com/package/@ckeditor/ckeditor5-ui): v11.2.0 => [v12.0.0](https://github.com/ckeditor/ckeditor5-ui/releases/tag/v12.0.0)
* [@ckeditor/ckeditor5-undo](https://www.npmjs.com/package/@ckeditor/ckeditor5-undo): v10.0.4 => [v11.0.0](https://github.com/ckeditor/ckeditor5-undo/releases/tag/v11.0.0)
* [@ckeditor/ckeditor5-upload](https://www.npmjs.com/package/@ckeditor/ckeditor5-upload): v10.0.4 => [v11.0.0](https://github.com/ckeditor/ckeditor5-upload/releases/tag/v11.0.0)
* [@ckeditor/ckeditor5-utils](https://www.npmjs.com/package/@ckeditor/ckeditor5-utils): v11.1.0 => [v12.0.0](https://github.com/ckeditor/ckeditor5-utils/releases/tag/v12.0.0)
* [@ckeditor/ckeditor5-widget](https://www.npmjs.com/package/@ckeditor/ckeditor5-widget): v10.3.1 => [v11.0.0](https://github.com/ckeditor/ckeditor5-widget/releases/tag/v11.0.0)

### BREAKING CHANGES

* Upgraded minimal versions of Node to `8.0.0` and npm to `5.7.1`. See: [ckeditor/ckeditor5#1507](https://github.com/ckeditor/ckeditor5/issues/1507). ([612ea3c](https://github.com/ckeditor/ckeditor5-cloud-services/commit/612ea3c))


## [11.2.0](https://github.com/ckeditor/ckeditor5/compare/v11.1.1...v11.2.0) (2018-12-05)

We are happy to report the release of CKEditor 5 v11.2.0. This editor version brings the long-awaited [support for paste from Office](https://ckeditor.com/docs/ckeditor5/latest/features/paste-from-word.html) (e.g. from Microsoft Word), [integration with CKFinder file manager](https://ckeditor.com/docs/ckeditor5/latest/features/ckfinder.html), improved [image upload documentation](https://ckeditor.com/docs/ckeditor5/latest/features/image-upload.html), improved [editor UI on mobile devices](https://github.com/ckeditor/ckeditor5/issues/416#issuecomment-430246472), as well as many smaller features and improvements.

Read more in the blog post: https://ckeditor.com/blog/CKEditor-5-v11.2.0-with-paste-from-Word-and-file-manager-support-released/

**Important information for plugin developers:** We would like to let you know about imporant breaking changes in the `@ckeditor/ckeditor5-engine` package. Read more about them in the [`@ckeditor/ckeditor5-engine@v12.0.0` release notes](https://github.com/ckeditor/ckeditor5-engine/releases/tag/v12.0.0).

### Dependencies

New packages:

* [@ckeditor/ckeditor5-ckfinder](https://www.npmjs.com/package/@ckeditor/ckeditor5-ckfinder): [v10.0.0](https://github.com/ckeditor/ckeditor5-ckfinder/releases/tag/v10.0.0)
* [@ckeditor/ckeditor5-paste-from-office](https://www.npmjs.com/package/@ckeditor/ckeditor5-paste-from-office): [v10.0.0](https://github.com/ckeditor/ckeditor5-paste-from-office/releases/tag/v10.0.0)

Major releases (contain breaking changes):

* [@ckeditor/ckeditor5-engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine): v11.0.0 => [v12.0.0](https://github.com/ckeditor/ckeditor5-engine/releases/tag/v12.0.0)
* [@ckeditor/ckeditor5-image](https://www.npmjs.com/package/@ckeditor/ckeditor5-image): v11.0.0 => [v12.0.0](https://github.com/ckeditor/ckeditor5-image/releases/tag/v12.0.0)
* [@ckeditor/ckeditor5-theme-lark](https://www.npmjs.com/package/@ckeditor/ckeditor5-theme-lark): v11.1.0 => [v12.0.0](https://github.com/ckeditor/ckeditor5-theme-lark/releases/tag/v12.0.0)

Minor releases:

* [@ckeditor/ckeditor5-basic-styles](https://www.npmjs.com/package/@ckeditor/ckeditor5-basic-styles): v10.0.3 => [v10.1.0](https://github.com/ckeditor/ckeditor5-basic-styles/releases/tag/v10.1.0)
* [@ckeditor/ckeditor5-build-balloon](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-balloon): v11.1.1 => [v11.2.0](https://github.com/ckeditor/ckeditor5-build-balloon/releases/tag/v11.2.0)
* [@ckeditor/ckeditor5-build-classic](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-classic): v11.1.1 => [v11.2.0](https://github.com/ckeditor/ckeditor5-build-classic/releases/tag/v11.2.0)
* [@ckeditor/ckeditor5-build-decoupled-document](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-decoupled-document): v11.1.1 => [v11.2.0](https://github.com/ckeditor/ckeditor5-build-decoupled-document/releases/tag/v11.2.0)
* [@ckeditor/ckeditor5-build-inline](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-inline): v11.1.1 => [v11.2.0](https://github.com/ckeditor/ckeditor5-build-inline/releases/tag/v11.2.0)
* [@ckeditor/ckeditor5-core](https://www.npmjs.com/package/@ckeditor/ckeditor5-core): v11.0.1 => [v11.1.0](https://github.com/ckeditor/ckeditor5-core/releases/tag/v11.1.0)
* [@ckeditor/ckeditor5-link](https://www.npmjs.com/package/@ckeditor/ckeditor5-link): v10.0.4 => [v10.1.0](https://github.com/ckeditor/ckeditor5-link/releases/tag/v10.1.0)
* [@ckeditor/ckeditor5-media-embed](https://www.npmjs.com/package/@ckeditor/ckeditor5-media-embed): v10.0.0 => [v10.1.0](https://github.com/ckeditor/ckeditor5-media-embed/releases/tag/v10.1.0)
* [@ckeditor/ckeditor5-ui](https://www.npmjs.com/package/@ckeditor/ckeditor5-ui): v11.1.0 => [v11.2.0](https://github.com/ckeditor/ckeditor5-ui/releases/tag/v11.2.0)
* [@ckeditor/ckeditor5-utils](https://www.npmjs.com/package/@ckeditor/ckeditor5-utils): v11.0.0 => [v11.1.0](https://github.com/ckeditor/ckeditor5-utils/releases/tag/v11.1.0)

Patch releases (bug fixes, internal changes):

* [@ckeditor/ckeditor5-adapter-ckfinder](https://www.npmjs.com/package/@ckeditor/ckeditor5-adapter-ckfinder): v10.0.3 => [v10.0.4](https://github.com/ckeditor/ckeditor5-adapter-ckfinder/releases/tag/v10.0.4)
* [@ckeditor/ckeditor5-alignment](https://www.npmjs.com/package/@ckeditor/ckeditor5-alignment): v10.0.3 => [v10.0.4](https://github.com/ckeditor/ckeditor5-alignment/releases/tag/v10.0.4)
* [@ckeditor/ckeditor5-autoformat](https://www.npmjs.com/package/@ckeditor/ckeditor5-autoformat): v10.0.3 => [v10.0.4](https://github.com/ckeditor/ckeditor5-autoformat/releases/tag/v10.0.4)
* [@ckeditor/ckeditor5-autosave](https://www.npmjs.com/package/@ckeditor/ckeditor5-autosave): v10.0.1 => [v10.0.2](https://github.com/ckeditor/ckeditor5-autosave/releases/tag/v10.0.2)
* [@ckeditor/ckeditor5-block-quote](https://www.npmjs.com/package/@ckeditor/ckeditor5-block-quote): v10.1.0 => [v10.1.1](https://github.com/ckeditor/ckeditor5-block-quote/releases/tag/v10.1.1)
* [@ckeditor/ckeditor5-clipboard](https://www.npmjs.com/package/@ckeditor/ckeditor5-clipboard): v10.0.3 => [v10.0.4](https://github.com/ckeditor/ckeditor5-clipboard/releases/tag/v10.0.4)
* [@ckeditor/ckeditor5-cloud-services](https://www.npmjs.com/package/@ckeditor/ckeditor5-cloud-services): v10.1.0 => [v10.1.1](https://github.com/ckeditor/ckeditor5-cloud-services/releases/tag/v10.1.1)
* [@ckeditor/ckeditor5-easy-image](https://www.npmjs.com/package/@ckeditor/ckeditor5-easy-image): v10.0.3 => [v10.0.4](https://github.com/ckeditor/ckeditor5-easy-image/releases/tag/v10.0.4)
* [@ckeditor/ckeditor5-editor-balloon](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-balloon): v11.0.1 => [v11.0.2](https://github.com/ckeditor/ckeditor5-editor-balloon/releases/tag/v11.0.2)
* [@ckeditor/ckeditor5-editor-classic](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-classic): v11.0.1 => [v11.0.2](https://github.com/ckeditor/ckeditor5-editor-classic/releases/tag/v11.0.2)
* [@ckeditor/ckeditor5-editor-decoupled](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-decoupled): v11.0.1 => [v11.0.2](https://github.com/ckeditor/ckeditor5-editor-decoupled/releases/tag/v11.0.2)
* [@ckeditor/ckeditor5-editor-inline](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-inline): v11.0.1 => [v11.0.2](https://github.com/ckeditor/ckeditor5-editor-inline/releases/tag/v11.0.2)
* [@ckeditor/ckeditor5-enter](https://www.npmjs.com/package/@ckeditor/ckeditor5-enter): v10.1.2 => [v10.1.3](https://github.com/ckeditor/ckeditor5-enter/releases/tag/v10.1.3)
* [@ckeditor/ckeditor5-essentials](https://www.npmjs.com/package/@ckeditor/ckeditor5-essentials): v10.1.2 => [v10.1.3](https://github.com/ckeditor/ckeditor5-essentials/releases/tag/v10.1.3)
* [@ckeditor/ckeditor5-font](https://www.npmjs.com/package/@ckeditor/ckeditor5-font): v10.0.3 => [v10.0.4](https://github.com/ckeditor/ckeditor5-font/releases/tag/v10.0.4)
* [@ckeditor/ckeditor5-heading](https://www.npmjs.com/package/@ckeditor/ckeditor5-heading): v10.1.0 => [v10.1.1](https://github.com/ckeditor/ckeditor5-heading/releases/tag/v10.1.1)
* [@ckeditor/ckeditor5-highlight](https://www.npmjs.com/package/@ckeditor/ckeditor5-highlight): v10.0.3 => [v10.0.4](https://github.com/ckeditor/ckeditor5-highlight/releases/tag/v10.0.4)
* [@ckeditor/ckeditor5-list](https://www.npmjs.com/package/@ckeditor/ckeditor5-list): v11.0.2 => [v11.0.3](https://github.com/ckeditor/ckeditor5-list/releases/tag/v11.0.3)
* [@ckeditor/ckeditor5-markdown-gfm](https://www.npmjs.com/package/@ckeditor/ckeditor5-markdown-gfm): v10.0.3 => [v10.0.4](https://github.com/ckeditor/ckeditor5-markdown-gfm/releases/tag/v10.0.4)
* [@ckeditor/ckeditor5-paragraph](https://www.npmjs.com/package/@ckeditor/ckeditor5-paragraph): v10.0.3 => [v10.0.4](https://github.com/ckeditor/ckeditor5-paragraph/releases/tag/v10.0.4)
* [@ckeditor/ckeditor5-table](https://www.npmjs.com/package/@ckeditor/ckeditor5-table): v11.0.0 => [v11.0.1](https://github.com/ckeditor/ckeditor5-table/releases/tag/v11.0.1)
* [@ckeditor/ckeditor5-typing](https://www.npmjs.com/package/@ckeditor/ckeditor5-typing): v11.0.1 => [v11.0.2](https://github.com/ckeditor/ckeditor5-typing/releases/tag/v11.0.2)
* [@ckeditor/ckeditor5-undo](https://www.npmjs.com/package/@ckeditor/ckeditor5-undo): v10.0.3 => [v10.0.4](https://github.com/ckeditor/ckeditor5-undo/releases/tag/v10.0.4)
* [@ckeditor/ckeditor5-upload](https://www.npmjs.com/package/@ckeditor/ckeditor5-upload): v10.0.3 => [v10.0.4](https://github.com/ckeditor/ckeditor5-upload/releases/tag/v10.0.4)
* [@ckeditor/ckeditor5-widget](https://www.npmjs.com/package/@ckeditor/ckeditor5-widget): v10.3.0 => [v10.3.1](https://github.com/ckeditor/ckeditor5-widget/releases/tag/v10.3.1)


## [11.1.1](https://github.com/ckeditor/ckeditor5/compare/v11.1.0...v11.1.1) (2018-10-11)

This releases fixes the README of the below listed 4 builds on npm.

### Dependencies

Patch releases (bug fixes, internal changes):

* [@ckeditor/ckeditor5-build-balloon](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-balloon): v11.1.0 => [v11.1.1](https://github.com/ckeditor/ckeditor5-build-balloon/releases/tag/v11.1.1)
* [@ckeditor/ckeditor5-build-classic](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-classic): v11.1.0 => [v11.1.1](https://github.com/ckeditor/ckeditor5-build-classic/releases/tag/v11.1.1)
* [@ckeditor/ckeditor5-build-decoupled-document](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-decoupled-document): v11.1.0 => [v11.1.1](https://github.com/ckeditor/ckeditor5-build-decoupled-document/releases/tag/v11.1.1)
* [@ckeditor/ckeditor5-build-inline](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-inline): v11.1.0 => [v11.1.1](https://github.com/ckeditor/ckeditor5-build-inline/releases/tag/v11.1.1)


## [11.1.0](https://github.com/ckeditor/ckeditor5/compare/v11.0.1...v11.1.0) (2018-10-08)

We are happy to report the release of CKEditor 5 v11.1.0. This editor version brings the long-awaited [media embed](https://ckeditor.com/docs/ckeditor5/latest/features/media-embed.html) feature, [support for block content in tables](https://ckeditor.com/docs/ckeditor5/latest/features/table.html#block-vs-inline-content-in-table-cells), tables available in real-time collaboration, as well as many smaller features and improvements.

Read more in the blog post: https://ckeditor.com/blog/CKEditor-5-v11.1.0-released/

### Dependencies

New packages:

* [@ckeditor/ckeditor5-media-embed](https://www.npmjs.com/package/@ckeditor/ckeditor5-media-embed): [v10.0.0](https://github.com/ckeditor/ckeditor5-media-embed/releases/tag/v10.0.0)

Major releases (contain breaking changes):

* [@ckeditor/ckeditor5-engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine): v10.2.0 => [v11.0.0](https://github.com/ckeditor/ckeditor5-engine/releases/tag/v11.0.0)
* [@ckeditor/ckeditor5-image](https://www.npmjs.com/package/@ckeditor/ckeditor5-image): v10.2.0 => [v11.0.0](https://github.com/ckeditor/ckeditor5-image/releases/tag/v11.0.0)
* [@ckeditor/ckeditor5-table](https://www.npmjs.com/package/@ckeditor/ckeditor5-table): v10.1.0 => [v11.0.0](https://github.com/ckeditor/ckeditor5-table/releases/tag/v11.0.0)

Minor releases:

* [@ckeditor/ckeditor5-build-balloon](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-balloon): v11.0.1 => [v11.1.0](https://github.com/ckeditor/ckeditor5-build-balloon/releases/tag/v11.1.0)
* [@ckeditor/ckeditor5-build-classic](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-classic): v11.0.1 => [v11.1.0](https://github.com/ckeditor/ckeditor5-build-classic/releases/tag/v11.1.0)
* [@ckeditor/ckeditor5-build-decoupled-document](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-decoupled-document): v11.0.1 => [v11.1.0](https://github.com/ckeditor/ckeditor5-build-decoupled-document/releases/tag/v11.1.0)
* [@ckeditor/ckeditor5-build-inline](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-inline): v11.0.1 => [v11.1.0](https://github.com/ckeditor/ckeditor5-build-inline/releases/tag/v11.1.0)
* [@ckeditor/ckeditor5-cloud-services](https://www.npmjs.com/package/@ckeditor/ckeditor5-cloud-services): v10.0.2 => [v10.1.0](https://github.com/ckeditor/ckeditor5-cloud-services/releases/tag/v10.1.0)
* [@ckeditor/ckeditor5-theme-lark](https://www.npmjs.com/package/@ckeditor/ckeditor5-theme-lark): v11.0.0 => [v11.1.0](https://github.com/ckeditor/ckeditor5-theme-lark/releases/tag/v11.1.0)
* [@ckeditor/ckeditor5-ui](https://www.npmjs.com/package/@ckeditor/ckeditor5-ui): v11.0.0 => [v11.1.0](https://github.com/ckeditor/ckeditor5-ui/releases/tag/v11.1.0)
* [@ckeditor/ckeditor5-widget](https://www.npmjs.com/package/@ckeditor/ckeditor5-widget): v10.2.0 => [v10.3.0](https://github.com/ckeditor/ckeditor5-widget/releases/tag/v10.3.0)

Patch releases (bug fixes, internal changes):

* [@ckeditor/ckeditor5-adapter-ckfinder](https://www.npmjs.com/package/@ckeditor/ckeditor5-adapter-ckfinder): v10.0.2 => [v10.0.3](https://github.com/ckeditor/ckeditor5-adapter-ckfinder/releases/tag/v10.0.3)
* [@ckeditor/ckeditor5-alignment](https://www.npmjs.com/package/@ckeditor/ckeditor5-alignment): v10.0.2 => [v10.0.3](https://github.com/ckeditor/ckeditor5-alignment/releases/tag/v10.0.3)
* [@ckeditor/ckeditor5-autoformat](https://www.npmjs.com/package/@ckeditor/ckeditor5-autoformat): v10.0.2 => [v10.0.3](https://github.com/ckeditor/ckeditor5-autoformat/releases/tag/v10.0.3)
* [@ckeditor/ckeditor5-autosave](https://www.npmjs.com/package/@ckeditor/ckeditor5-autosave): v10.0.0 => [v10.0.1](https://github.com/ckeditor/ckeditor5-autosave/releases/tag/v10.0.1)
* [@ckeditor/ckeditor5-basic-styles](https://www.npmjs.com/package/@ckeditor/ckeditor5-basic-styles): v10.0.2 => [v10.0.3](https://github.com/ckeditor/ckeditor5-basic-styles/releases/tag/v10.0.3)
* [@ckeditor/ckeditor5-block-quote](https://www.npmjs.com/package/@ckeditor/ckeditor5-block-quote): v10.0.2 => [v10.0.3](https://github.com/ckeditor/ckeditor5-block-quote/releases/tag/v10.0.3)
* [@ckeditor/ckeditor5-clipboard](https://www.npmjs.com/package/@ckeditor/ckeditor5-clipboard): v10.0.2 => [v10.0.3](https://github.com/ckeditor/ckeditor5-clipboard/releases/tag/v10.0.3)
* [@ckeditor/ckeditor5-core](https://www.npmjs.com/package/@ckeditor/ckeditor5-core): v11.0.0 => [v11.0.1](https://github.com/ckeditor/ckeditor5-core/releases/tag/v11.0.1)
* [@ckeditor/ckeditor5-easy-image](https://www.npmjs.com/package/@ckeditor/ckeditor5-easy-image): v10.0.2 => [v10.0.3](https://github.com/ckeditor/ckeditor5-easy-image/releases/tag/v10.0.3)
* [@ckeditor/ckeditor5-editor-balloon](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-balloon): v11.0.0 => [v11.0.1](https://github.com/ckeditor/ckeditor5-editor-balloon/releases/tag/v11.0.1)
* [@ckeditor/ckeditor5-editor-classic](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-classic): v11.0.0 => [v11.0.1](https://github.com/ckeditor/ckeditor5-editor-classic/releases/tag/v11.0.1)
* [@ckeditor/ckeditor5-editor-decoupled](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-decoupled): v11.0.0 => [v11.0.1](https://github.com/ckeditor/ckeditor5-editor-decoupled/releases/tag/v11.0.1)
* [@ckeditor/ckeditor5-editor-inline](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-inline): v11.0.0 => [v11.0.1](https://github.com/ckeditor/ckeditor5-editor-inline/releases/tag/v11.0.1)
* [@ckeditor/ckeditor5-enter](https://www.npmjs.com/package/@ckeditor/ckeditor5-enter): v10.1.1 => [v10.1.2](https://github.com/ckeditor/ckeditor5-enter/releases/tag/v10.1.2)
* [@ckeditor/ckeditor5-essentials](https://www.npmjs.com/package/@ckeditor/ckeditor5-essentials): v10.1.1 => [v10.1.2](https://github.com/ckeditor/ckeditor5-essentials/releases/tag/v10.1.2)
* [@ckeditor/ckeditor5-font](https://www.npmjs.com/package/@ckeditor/ckeditor5-font): v10.0.2 => [v10.0.3](https://github.com/ckeditor/ckeditor5-font/releases/tag/v10.0.3)
* [@ckeditor/ckeditor5-heading](https://www.npmjs.com/package/@ckeditor/ckeditor5-heading): v10.0.2 => [v10.0.3](https://github.com/ckeditor/ckeditor5-heading/releases/tag/v10.0.3)
* [@ckeditor/ckeditor5-highlight](https://www.npmjs.com/package/@ckeditor/ckeditor5-highlight): v10.0.2 => [v10.0.3](https://github.com/ckeditor/ckeditor5-highlight/releases/tag/v10.0.3)
* [@ckeditor/ckeditor5-link](https://www.npmjs.com/package/@ckeditor/ckeditor5-link): v10.0.3 => [v10.0.4](https://github.com/ckeditor/ckeditor5-link/releases/tag/v10.0.4)
* [@ckeditor/ckeditor5-list](https://www.npmjs.com/package/@ckeditor/ckeditor5-list): v11.0.1 => [v11.0.2](https://github.com/ckeditor/ckeditor5-list/releases/tag/v11.0.2)
* [@ckeditor/ckeditor5-markdown-gfm](https://www.npmjs.com/package/@ckeditor/ckeditor5-markdown-gfm): v10.0.2 => [v10.0.3](https://github.com/ckeditor/ckeditor5-markdown-gfm/releases/tag/v10.0.3)
* [@ckeditor/ckeditor5-paragraph](https://www.npmjs.com/package/@ckeditor/ckeditor5-paragraph): v10.0.2 => [v10.0.3](https://github.com/ckeditor/ckeditor5-paragraph/releases/tag/v10.0.3)
* [@ckeditor/ckeditor5-typing](https://www.npmjs.com/package/@ckeditor/ckeditor5-typing): v11.0.0 => [v11.0.1](https://github.com/ckeditor/ckeditor5-typing/releases/tag/v11.0.1)
* [@ckeditor/ckeditor5-undo](https://www.npmjs.com/package/@ckeditor/ckeditor5-undo): v10.0.2 => [v10.0.3](https://github.com/ckeditor/ckeditor5-undo/releases/tag/v10.0.3)
* [@ckeditor/ckeditor5-upload](https://www.npmjs.com/package/@ckeditor/ckeditor5-upload): v10.0.2 => [v10.0.3](https://github.com/ckeditor/ckeditor5-upload/releases/tag/v10.0.3)
* [@ckeditor/ckeditor5-utils](https://www.npmjs.com/package/@ckeditor/ckeditor5-utils): v10.2.1 => [v10.2.2](https://github.com/ckeditor/ckeditor5-utils/releases/tag/v10.2.2)


## [11.0.1](https://github.com/ckeditor/ckeditor5/compare/v11.0.0...v11.0.1) (2018-07-18)

Internal changes only (updated dependencies, documentation, etc.).


## [11.0.0](https://github.com/ckeditor/ckeditor5/compare/v10.1.0...v11.0.0) (2018-07-18)

### Release notes

This is a major releases that introduces two new plugins ([autosave](https://ckeditor.com/docs/ckeditor5/latest/builds/guides/integration/saving-data.html) and [block toolbar](https://ckeditor.com/docs/ckeditor5/latest/features/blocktoolbar.html)), many smaller features, dozens of bug fixes and a couple of infrastructure changes (an upgrade to `webpack@4` and simplified structure of build repositories). Additionally, the `Editor#element` property was renamed to `Editor#sourceElement` and the `Editor#updateElement()` method was renamed to `Editor#updateSourceElement()`.

If you maintain a [custom build of CKEditor 5](https://ckeditor.com/docs/ckeditor5/latest/builds/guides/development/custom-builds.html) or [integrate CKEditor 5 from source](https://ckeditor.com/docs/ckeditor5/latest/builds/guides/integration/advanced-setup.html#scenario-2-building-from-source), we recommend reading the [migration guide](https://github.com/ckeditor/ckeditor5/issues/1136).

Blog post is coming soon...

### Dependencies

New packages:

* [@ckeditor/ckeditor5-autosave](https://www.npmjs.com/package/@ckeditor/ckeditor5-autosave): [v10.0.0](https://github.com/ckeditor/ckeditor5-autosave/releases/tag/v10.0.0)

Major releases (contain breaking changes):

* [@ckeditor/ckeditor5-build-balloon](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-balloon): v10.1.0 => [v11.0.0](https://github.com/ckeditor/ckeditor5-build-balloon/releases/tag/v11.0.0)
* [@ckeditor/ckeditor5-build-classic](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-classic): v10.1.0 => [v11.0.0](https://github.com/ckeditor/ckeditor5-build-classic/releases/tag/v11.0.0)
* [@ckeditor/ckeditor5-build-decoupled-document](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-decoupled-document): v10.1.0 => [v11.0.0](https://github.com/ckeditor/ckeditor5-build-decoupled-document/releases/tag/v11.0.0)
* [@ckeditor/ckeditor5-build-inline](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-inline): v10.1.0 => [v11.0.0](https://github.com/ckeditor/ckeditor5-build-inline/releases/tag/v11.0.0)
* [@ckeditor/ckeditor5-core](https://www.npmjs.com/package/@ckeditor/ckeditor5-core): v10.1.0 => [v11.0.0](https://github.com/ckeditor/ckeditor5-core/releases/tag/v11.0.0)
* [@ckeditor/ckeditor5-editor-balloon](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-balloon): v10.0.1 => [v11.0.0](https://github.com/ckeditor/ckeditor5-editor-balloon/releases/tag/v11.0.0)
* [@ckeditor/ckeditor5-editor-classic](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-classic): v10.0.1 => [v11.0.0](https://github.com/ckeditor/ckeditor5-editor-classic/releases/tag/v11.0.0)
* [@ckeditor/ckeditor5-editor-decoupled](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-decoupled): v10.0.2 => [v11.0.0](https://github.com/ckeditor/ckeditor5-editor-decoupled/releases/tag/v11.0.0)
* [@ckeditor/ckeditor5-editor-inline](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-inline): v10.0.1 => [v11.0.0](https://github.com/ckeditor/ckeditor5-editor-inline/releases/tag/v11.0.0)
* [@ckeditor/ckeditor5-theme-lark](https://www.npmjs.com/package/@ckeditor/ckeditor5-theme-lark): v10.1.0 => [v11.0.0](https://github.com/ckeditor/ckeditor5-theme-lark/releases/tag/v11.0.0)
* [@ckeditor/ckeditor5-typing](https://www.npmjs.com/package/@ckeditor/ckeditor5-typing): v10.0.1 => [v11.0.0](https://github.com/ckeditor/ckeditor5-typing/releases/tag/v11.0.0)
* [@ckeditor/ckeditor5-ui](https://www.npmjs.com/package/@ckeditor/ckeditor5-ui): v10.1.0 => [v11.0.0](https://github.com/ckeditor/ckeditor5-ui/releases/tag/v11.0.0)

Minor releases:

* [@ckeditor/ckeditor5-engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine): v10.1.0 => [v10.2.0](https://github.com/ckeditor/ckeditor5-engine/releases/tag/v10.2.0)
* [@ckeditor/ckeditor5-image](https://www.npmjs.com/package/@ckeditor/ckeditor5-image): v10.1.0 => [v10.2.0](https://github.com/ckeditor/ckeditor5-image/releases/tag/v10.2.0)
* [@ckeditor/ckeditor5-table](https://www.npmjs.com/package/@ckeditor/ckeditor5-table): v10.0.0 => [v10.1.0](https://github.com/ckeditor/ckeditor5-table/releases/tag/v10.1.0)
* [@ckeditor/ckeditor5-utils](https://www.npmjs.com/package/@ckeditor/ckeditor5-utils): v10.1.0 => [v10.2.0](https://github.com/ckeditor/ckeditor5-utils/releases/tag/v10.2.0)
* [@ckeditor/ckeditor5-widget](https://www.npmjs.com/package/@ckeditor/ckeditor5-widget): v10.1.0 => [v10.2.0](https://github.com/ckeditor/ckeditor5-widget/releases/tag/v10.2.0)

Patch releases (bug fixes, internal changes):

* [@ckeditor/ckeditor5-adapter-ckfinder](https://www.npmjs.com/package/@ckeditor/ckeditor5-adapter-ckfinder): v10.0.1 => [v10.0.2](https://github.com/ckeditor/ckeditor5-adapter-ckfinder/releases/tag/v10.0.2)
* [@ckeditor/ckeditor5-alignment](https://www.npmjs.com/package/@ckeditor/ckeditor5-alignment): v10.0.1 => [v10.0.2](https://github.com/ckeditor/ckeditor5-alignment/releases/tag/v10.0.2)
* [@ckeditor/ckeditor5-autoformat](https://www.npmjs.com/package/@ckeditor/ckeditor5-autoformat): v10.0.1 => [v10.0.2](https://github.com/ckeditor/ckeditor5-autoformat/releases/tag/v10.0.2)
* [@ckeditor/ckeditor5-basic-styles](https://www.npmjs.com/package/@ckeditor/ckeditor5-basic-styles): v10.0.1 => [v10.0.2](https://github.com/ckeditor/ckeditor5-basic-styles/releases/tag/v10.0.2)
* [@ckeditor/ckeditor5-block-quote](https://www.npmjs.com/package/@ckeditor/ckeditor5-block-quote): v10.0.1 => [v10.0.2](https://github.com/ckeditor/ckeditor5-block-quote/releases/tag/v10.0.2)
* [@ckeditor/ckeditor5-clipboard](https://www.npmjs.com/package/@ckeditor/ckeditor5-clipboard): v10.0.1 => [v10.0.2](https://github.com/ckeditor/ckeditor5-clipboard/releases/tag/v10.0.2)
* [@ckeditor/ckeditor5-cloud-services](https://www.npmjs.com/package/@ckeditor/ckeditor5-cloud-services): v10.0.1 => [v10.0.2](https://github.com/ckeditor/ckeditor5-cloud-services/releases/tag/v10.0.2)
* [@ckeditor/ckeditor5-easy-image](https://www.npmjs.com/package/@ckeditor/ckeditor5-easy-image): v10.0.1 => [v10.0.2](https://github.com/ckeditor/ckeditor5-easy-image/releases/tag/v10.0.2)
* [@ckeditor/ckeditor5-enter](https://www.npmjs.com/package/@ckeditor/ckeditor5-enter): v10.1.0 => [v10.1.1](https://github.com/ckeditor/ckeditor5-enter/releases/tag/v10.1.1)
* [@ckeditor/ckeditor5-essentials](https://www.npmjs.com/package/@ckeditor/ckeditor5-essentials): v10.1.0 => [v10.1.1](https://github.com/ckeditor/ckeditor5-essentials/releases/tag/v10.1.1)
* [@ckeditor/ckeditor5-font](https://www.npmjs.com/package/@ckeditor/ckeditor5-font): v10.0.1 => [v10.0.2](https://github.com/ckeditor/ckeditor5-font/releases/tag/v10.0.2)
* [@ckeditor/ckeditor5-heading](https://www.npmjs.com/package/@ckeditor/ckeditor5-heading): v10.0.1 => [v10.0.2](https://github.com/ckeditor/ckeditor5-heading/releases/tag/v10.0.2)
* [@ckeditor/ckeditor5-highlight](https://www.npmjs.com/package/@ckeditor/ckeditor5-highlight): v10.0.1 => [v10.0.2](https://github.com/ckeditor/ckeditor5-highlight/releases/tag/v10.0.2)
* [@ckeditor/ckeditor5-link](https://www.npmjs.com/package/@ckeditor/ckeditor5-link): v10.0.2 => [v10.0.3](https://github.com/ckeditor/ckeditor5-link/releases/tag/v10.0.3)
* [@ckeditor/ckeditor5-list](https://www.npmjs.com/package/@ckeditor/ckeditor5-list): v11.0.0 => [v11.0.1](https://github.com/ckeditor/ckeditor5-list/releases/tag/v11.0.1)
* [@ckeditor/ckeditor5-markdown-gfm](https://www.npmjs.com/package/@ckeditor/ckeditor5-markdown-gfm): v10.0.1 => [v10.0.2](https://github.com/ckeditor/ckeditor5-markdown-gfm/releases/tag/v10.0.2)
* [@ckeditor/ckeditor5-paragraph](https://www.npmjs.com/package/@ckeditor/ckeditor5-paragraph): v10.0.1 => [v10.0.2](https://github.com/ckeditor/ckeditor5-paragraph/releases/tag/v10.0.2)
* [@ckeditor/ckeditor5-undo](https://www.npmjs.com/package/@ckeditor/ckeditor5-undo): v10.0.1 => [v10.0.2](https://github.com/ckeditor/ckeditor5-undo/releases/tag/v10.0.2)
* [@ckeditor/ckeditor5-upload](https://www.npmjs.com/package/@ckeditor/ckeditor5-upload): v10.0.1 => [v10.0.2](https://github.com/ckeditor/ckeditor5-upload/releases/tag/v10.0.2)

### Features

Besides new features introduced by the dependencies, this version also introduces the following features:

* Introduced the [`@ckeditor/ckeditor5-autosave`](https://www.npmjs.com/package/@ckeditor/ckeditor5-autosave) package. ([bac9671](https://github.com/ckeditor/ckeditor5/commit/bac9671))

### Other changes

* Updated `webpack` to version 4. ([7390460](https://github.com/ckeditor/ckeditor5/commit/7390460))

### BREAKING CHANGES

If you maintain a custom build or integrate CKEditor 5 from source, we recommend reading the [migration guide](https://github.com/ckeditor/ckeditor5/issues/1136). Closes [ckeditor/ckeditor5#1038](https://github.com/ckeditor/ckeditor5/issues/1038).

* CKEditor 5 environment was updated to use `webpack@4`. `webpack@4` introduced major changes in its configuration and plugin system. CKEditor 5 tools and build configuration were updated to work with `webpack@4` and will not work with `webpack@3`.
* The structure of build repositories was changed. The `build-config.js` files were removed and the build configuration is now kept only in the `src/ckeditor.js` files.


## [10.1.0](https://github.com/ckeditor/ckeditor5/compare/v10.0.1...v10.1.0) (2018-06-21)

This is a minor release that introduces many bug fixes and new features. Most notable ones are the table plugin and support for inserting soft breaks with <kbd>Shift</kbd>+<kbd>Enter</kbd>.

You can read more in the [blog post](https://ckeditor.com/blog/CKEditor-5-v10.1.0-released/).

### Dependencies

New packages:

* [@ckeditor/ckeditor5-table](https://www.npmjs.com/package/@ckeditor/ckeditor5-table): [v10.0.0](https://github.com/ckeditor/ckeditor5-table/releases/tag/v10.0.0)

Major releases (contain breaking changes):

* [@ckeditor/ckeditor5-list](https://www.npmjs.com/package/@ckeditor/ckeditor5-list): v10.0.0 => [v11.0.0](https://github.com/ckeditor/ckeditor5-list/releases/tag/v11.0.0)

Minor releases:

* [@ckeditor/ckeditor5-build-balloon](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-balloon): v10.0.1 => [v10.1.0](https://github.com/ckeditor/ckeditor5-build-balloon/releases/tag/v10.1.0)
* [@ckeditor/ckeditor5-build-classic](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-classic): v10.0.1 => [v10.1.0](https://github.com/ckeditor/ckeditor5-build-classic/releases/tag/v10.1.0)
* [@ckeditor/ckeditor5-build-decoupled-document](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-decoupled-document): v10.0.1 => [v10.1.0](https://github.com/ckeditor/ckeditor5-build-decoupled-document/releases/tag/v10.1.0)
* [@ckeditor/ckeditor5-build-inline](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-inline): v10.0.1 => [v10.1.0](https://github.com/ckeditor/ckeditor5-build-inline/releases/tag/v10.1.0)
* [@ckeditor/ckeditor5-core](https://www.npmjs.com/package/@ckeditor/ckeditor5-core): v10.0.0 => [v10.1.0](https://github.com/ckeditor/ckeditor5-core/releases/tag/v10.1.0)
* [@ckeditor/ckeditor5-engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine): v10.0.0 => [v10.1.0](https://github.com/ckeditor/ckeditor5-engine/releases/tag/v10.1.0)
* [@ckeditor/ckeditor5-enter](https://www.npmjs.com/package/@ckeditor/ckeditor5-enter): v10.0.0 => [v10.1.0](https://github.com/ckeditor/ckeditor5-enter/releases/tag/v10.1.0)
* [@ckeditor/ckeditor5-essentials](https://www.npmjs.com/package/@ckeditor/ckeditor5-essentials): v10.0.0 => [v10.1.0](https://github.com/ckeditor/ckeditor5-essentials/releases/tag/v10.1.0)
* [@ckeditor/ckeditor5-image](https://www.npmjs.com/package/@ckeditor/ckeditor5-image): v10.0.0 => [v10.1.0](https://github.com/ckeditor/ckeditor5-image/releases/tag/v10.1.0)
* [@ckeditor/ckeditor5-theme-lark](https://www.npmjs.com/package/@ckeditor/ckeditor5-theme-lark): v10.0.0 => [v10.1.0](https://github.com/ckeditor/ckeditor5-theme-lark/releases/tag/v10.1.0)
* [@ckeditor/ckeditor5-ui](https://www.npmjs.com/package/@ckeditor/ckeditor5-ui): v10.0.0 => [v10.1.0](https://github.com/ckeditor/ckeditor5-ui/releases/tag/v10.1.0)
* [@ckeditor/ckeditor5-upload](https://www.npmjs.com/package/@ckeditor/ckeditor5-upload): v10.0.0 => [v10.1.0](https://github.com/ckeditor/ckeditor5-upload/releases/tag/v10.1.0)
* [@ckeditor/ckeditor5-utils](https://www.npmjs.com/package/@ckeditor/ckeditor5-utils): v10.0.0 => [v10.1.0](https://github.com/ckeditor/ckeditor5-utils/releases/tag/v10.1.0)
* [@ckeditor/ckeditor5-widget](https://www.npmjs.com/package/@ckeditor/ckeditor5-widget): v10.0.0 => [v10.1.0](https://github.com/ckeditor/ckeditor5-widget/releases/tag/v10.1.0)

Patch releases (bug fixes, internal changes):

* [@ckeditor/ckeditor5-adapter-ckfinder](https://www.npmjs.com/package/@ckeditor/ckeditor5-adapter-ckfinder): v10.0.0 => [v10.0.1](https://github.com/ckeditor/ckeditor5-adapter-ckfinder/releases/tag/v10.0.1)
* [@ckeditor/ckeditor5-alignment](https://www.npmjs.com/package/@ckeditor/ckeditor5-alignment): v10.0.0 => [v10.0.1](https://github.com/ckeditor/ckeditor5-alignment/releases/tag/v10.0.1)
* [@ckeditor/ckeditor5-autoformat](https://www.npmjs.com/package/@ckeditor/ckeditor5-autoformat): v10.0.0 => [v10.0.1](https://github.com/ckeditor/ckeditor5-autoformat/releases/tag/v10.0.1)
* [@ckeditor/ckeditor5-basic-styles](https://www.npmjs.com/package/@ckeditor/ckeditor5-basic-styles): v10.0.0 => [v10.0.1](https://github.com/ckeditor/ckeditor5-basic-styles/releases/tag/v10.0.1)
* [@ckeditor/ckeditor5-block-quote](https://www.npmjs.com/package/@ckeditor/ckeditor5-block-quote): v10.0.0 => [v10.0.1](https://github.com/ckeditor/ckeditor5-block-quote/releases/tag/v10.0.1)
* [@ckeditor/ckeditor5-clipboard](https://www.npmjs.com/package/@ckeditor/ckeditor5-clipboard): v10.0.0 => [v10.0.1](https://github.com/ckeditor/ckeditor5-clipboard/releases/tag/v10.0.1)
* [@ckeditor/ckeditor5-cloud-services](https://www.npmjs.com/package/@ckeditor/ckeditor5-cloud-services): v10.0.0 => [v10.0.1](https://github.com/ckeditor/ckeditor5-cloud-services/releases/tag/v10.0.1)
* [@ckeditor/ckeditor5-easy-image](https://www.npmjs.com/package/@ckeditor/ckeditor5-easy-image): v10.0.0 => [v10.0.1](https://github.com/ckeditor/ckeditor5-easy-image/releases/tag/v10.0.1)
* [@ckeditor/ckeditor5-editor-balloon](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-balloon): v10.0.0 => [v10.0.1](https://github.com/ckeditor/ckeditor5-editor-balloon/releases/tag/v10.0.1)
* [@ckeditor/ckeditor5-editor-classic](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-classic): v10.0.0 => [v10.0.1](https://github.com/ckeditor/ckeditor5-editor-classic/releases/tag/v10.0.1)
* [@ckeditor/ckeditor5-editor-decoupled](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-decoupled): v10.0.1 => [v10.0.2](https://github.com/ckeditor/ckeditor5-editor-decoupled/releases/tag/v10.0.2)
* [@ckeditor/ckeditor5-editor-inline](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-inline): v10.0.0 => [v10.0.1](https://github.com/ckeditor/ckeditor5-editor-inline/releases/tag/v10.0.1)
* [@ckeditor/ckeditor5-font](https://www.npmjs.com/package/@ckeditor/ckeditor5-font): v10.0.0 => [v10.0.1](https://github.com/ckeditor/ckeditor5-font/releases/tag/v10.0.1)
* [@ckeditor/ckeditor5-heading](https://www.npmjs.com/package/@ckeditor/ckeditor5-heading): v10.0.0 => [v10.0.1](https://github.com/ckeditor/ckeditor5-heading/releases/tag/v10.0.1)
* [@ckeditor/ckeditor5-highlight](https://www.npmjs.com/package/@ckeditor/ckeditor5-highlight): v10.0.0 => [v10.0.1](https://github.com/ckeditor/ckeditor5-highlight/releases/tag/v10.0.1)
* [@ckeditor/ckeditor5-link](https://www.npmjs.com/package/@ckeditor/ckeditor5-link): v10.0.1 => [v10.0.2](https://github.com/ckeditor/ckeditor5-link/releases/tag/v10.0.2)
* [@ckeditor/ckeditor5-markdown-gfm](https://www.npmjs.com/package/@ckeditor/ckeditor5-markdown-gfm): v10.0.0 => [v10.0.1](https://github.com/ckeditor/ckeditor5-markdown-gfm/releases/tag/v10.0.1)
* [@ckeditor/ckeditor5-paragraph](https://www.npmjs.com/package/@ckeditor/ckeditor5-paragraph): v10.0.0 => [v10.0.1](https://github.com/ckeditor/ckeditor5-paragraph/releases/tag/v10.0.1)
* [@ckeditor/ckeditor5-typing](https://www.npmjs.com/package/@ckeditor/ckeditor5-typing): v10.0.0 => [v10.0.1](https://github.com/ckeditor/ckeditor5-typing/releases/tag/v10.0.1)
* [@ckeditor/ckeditor5-undo](https://www.npmjs.com/package/@ckeditor/ckeditor5-undo): v10.0.0 => [v10.0.1](https://github.com/ckeditor/ckeditor5-undo/releases/tag/v10.0.1)

### Features

Besides new features introduced by the dependencies, this version also introduces the following features:

* Introduced the `@ckeditor/ckeditor5-table` package. ([e4b9a72](https://github.com/ckeditor/ckeditor5/commit/e4b9a72))

### Bug fixes

Besides changes in the dependencies, this version also contains the following bug fixes:

* The editor buttons in the document editor guide should not wrap to the next line. Closes [#1077](https://github.com/ckeditor/ckeditor5/issues/1077). ([61c6ad6](https://github.com/ckeditor/ckeditor5/commit/61c6ad6))
* The table dropdown in the document editor snippet should not be cut off. Closes [#1069](https://github.com/ckeditor/ckeditor5/issues/1069). ([bed8e70](https://github.com/ckeditor/ckeditor5/commit/bed8e70))


## [10.0.1](https://github.com/ckeditor/ckeditor5/compare/v10.0.0...v10.0.1) (2018-05-22)

## Release notes

We would like to announce the release of CKEditor 5 v10.0.1 that contains a security fix for the [Link package](http://npmjs.com/package/@ckeditor/ckeditor5-link), so an upgrade is highly recommended for all CKEditor 5 installations that include it. Additionally, this release fixes an issue with the decoupled editor that blocked enabling real-time collaboration in this editor.

You can read more in the [blog post](https://ckeditor.com/blog/CKEditor-5-v10.0.1-released/).

### Dependencies

Patch releases (bug fixes, internal changes):

* [@ckeditor/ckeditor5-build-balloon](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-balloon): v10.0.0 => [v10.0.1](https://github.com/ckeditor/ckeditor5-build-balloon/releases/tag/v10.0.1)
* [@ckeditor/ckeditor5-build-classic](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-classic): v10.0.0 => [v10.0.1](https://github.com/ckeditor/ckeditor5-build-classic/releases/tag/v10.0.1)
* [@ckeditor/ckeditor5-build-decoupled-document](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-decoupled-document): v10.0.0 => [v10.0.1](https://github.com/ckeditor/ckeditor5-build-decoupled-document/releases/tag/v10.0.1)
* [@ckeditor/ckeditor5-build-inline](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-inline): v10.0.0 => [v10.0.1](https://github.com/ckeditor/ckeditor5-build-inline/releases/tag/v10.0.1)
* [@ckeditor/ckeditor5-editor-decoupled](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-decoupled): v10.0.0 => [v10.0.1](https://github.com/ckeditor/ckeditor5-editor-decoupled/releases/tag/v10.0.1)
* [@ckeditor/ckeditor5-link](https://www.npmjs.com/package/@ckeditor/ckeditor5-link): v10.0.0 => [v10.0.1](https://github.com/ckeditor/ckeditor5-link/releases/tag/v10.0.1)


## [10.0.0](https://github.com/ckeditor/ckeditor5/compare/v1.0.0-beta.4...v10.0.0) (2018-04-25)

### Release notes

The first stable release of CKEditor 5 🎉🎉🎉

You can read a summary blog post here: https://ckeditor.com/blog/CKEditor-5-v10.0.0-the-future-of-rich-text-editing-looks-stable/.

PS. We decided to skip version numbers lower than v5.0.0 to avoid collisions with [CKEditor 3-4](http://github.com/ckeditor/ckeditor-dev).

### BREAKING CHANGES

* The license under which CKEditor 5 is released has been changed from a triple GPL, LGPL and MPL license to a GPL2+ only. See [ckeditor/ckeditor5#991](https://github.com/ckeditor/ckeditor5/issues/991) for more information.

### Dependencies

Major releases (contain breaking changes):

* [@ckeditor/ckeditor5-adapter-ckfinder](https://www.npmjs.com/package/@ckeditor/ckeditor5-adapter-ckfinder): v1.0.0-beta.4 => [v10.0.0](https://github.com/ckeditor/ckeditor5-adapter-ckfinder/releases/tag/v10.0.0)
* [@ckeditor/ckeditor5-alignment](https://www.npmjs.com/package/@ckeditor/ckeditor5-alignment): v1.0.0-beta.4 => [v10.0.0](https://github.com/ckeditor/ckeditor5-alignment/releases/tag/v10.0.0)
* [@ckeditor/ckeditor5-autoformat](https://www.npmjs.com/package/@ckeditor/ckeditor5-autoformat): v1.0.0-beta.4 => [v10.0.0](https://github.com/ckeditor/ckeditor5-autoformat/releases/tag/v10.0.0)
* [@ckeditor/ckeditor5-basic-styles](https://www.npmjs.com/package/@ckeditor/ckeditor5-basic-styles): v1.0.0-beta.4 => [v10.0.0](https://github.com/ckeditor/ckeditor5-basic-styles/releases/tag/v10.0.0)
* [@ckeditor/ckeditor5-block-quote](https://www.npmjs.com/package/@ckeditor/ckeditor5-block-quote): v1.0.0-beta.4 => [v10.0.0](https://github.com/ckeditor/ckeditor5-block-quote/releases/tag/v10.0.0)
* [@ckeditor/ckeditor5-build-balloon](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-balloon): v1.0.0-beta.4 => [v10.0.0](https://github.com/ckeditor/ckeditor5-build-balloon/releases/tag/v10.0.0)
* [@ckeditor/ckeditor5-build-classic](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-classic): v1.0.0-beta.4 => [v10.0.0](https://github.com/ckeditor/ckeditor5-build-classic/releases/tag/v10.0.0)
* [@ckeditor/ckeditor5-build-decoupled-document](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-decoupled-document): v1.0.0-beta.4 => [v10.0.0](https://github.com/ckeditor/ckeditor5-build-decoupled-document/releases/tag/v10.0.0)
* [@ckeditor/ckeditor5-build-inline](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-inline): v1.0.0-beta.4 => [v10.0.0](https://github.com/ckeditor/ckeditor5-build-inline/releases/tag/v10.0.0)
* [@ckeditor/ckeditor5-clipboard](https://www.npmjs.com/package/@ckeditor/ckeditor5-clipboard): v1.0.0-beta.4 => [v10.0.0](https://github.com/ckeditor/ckeditor5-clipboard/releases/tag/v10.0.0)
* [@ckeditor/ckeditor5-cloud-services](https://www.npmjs.com/package/@ckeditor/ckeditor5-cloud-services): v1.0.0-beta.4 => [v10.0.0](https://github.com/ckeditor/ckeditor5-cloud-services/releases/tag/v10.0.0)
* [@ckeditor/ckeditor5-core](https://www.npmjs.com/package/@ckeditor/ckeditor5-core): v1.0.0-beta.4 => [v10.0.0](https://github.com/ckeditor/ckeditor5-core/releases/tag/v10.0.0)
* [@ckeditor/ckeditor5-easy-image](https://www.npmjs.com/package/@ckeditor/ckeditor5-easy-image): v1.0.0-beta.4 => [v10.0.0](https://github.com/ckeditor/ckeditor5-easy-image/releases/tag/v10.0.0)
* [@ckeditor/ckeditor5-editor-balloon](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-balloon): v1.0.0-beta.4 => [v10.0.0](https://github.com/ckeditor/ckeditor5-editor-balloon/releases/tag/v10.0.0)
* [@ckeditor/ckeditor5-editor-classic](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-classic): v1.0.0-beta.4 => [v10.0.0](https://github.com/ckeditor/ckeditor5-editor-classic/releases/tag/v10.0.0)
* [@ckeditor/ckeditor5-editor-decoupled](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-decoupled): v1.0.0-beta.4 => [v10.0.0](https://github.com/ckeditor/ckeditor5-editor-decoupled/releases/tag/v10.0.0)
* [@ckeditor/ckeditor5-editor-inline](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-inline): v1.0.0-beta.4 => [v10.0.0](https://github.com/ckeditor/ckeditor5-editor-inline/releases/tag/v10.0.0)
* [@ckeditor/ckeditor5-engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine): v1.0.0-beta.4 => [v10.0.0](https://github.com/ckeditor/ckeditor5-engine/releases/tag/v10.0.0)
* [@ckeditor/ckeditor5-enter](https://www.npmjs.com/package/@ckeditor/ckeditor5-enter): v1.0.0-beta.4 => [v10.0.0](https://github.com/ckeditor/ckeditor5-enter/releases/tag/v10.0.0)
* [@ckeditor/ckeditor5-essentials](https://www.npmjs.com/package/@ckeditor/ckeditor5-essentials): v1.0.0-beta.4 => [v10.0.0](https://github.com/ckeditor/ckeditor5-essentials/releases/tag/v10.0.0)
* [@ckeditor/ckeditor5-font](https://www.npmjs.com/package/@ckeditor/ckeditor5-font): v1.0.0-beta.4 => [v10.0.0](https://github.com/ckeditor/ckeditor5-font/releases/tag/v10.0.0)
* [@ckeditor/ckeditor5-heading](https://www.npmjs.com/package/@ckeditor/ckeditor5-heading): v1.0.0-beta.4 => [v10.0.0](https://github.com/ckeditor/ckeditor5-heading/releases/tag/v10.0.0)
* [@ckeditor/ckeditor5-highlight](https://www.npmjs.com/package/@ckeditor/ckeditor5-highlight): v1.0.0-beta.4 => [v10.0.0](https://github.com/ckeditor/ckeditor5-highlight/releases/tag/v10.0.0)
* [@ckeditor/ckeditor5-image](https://www.npmjs.com/package/@ckeditor/ckeditor5-image): v1.0.0-beta.4 => [v10.0.0](https://github.com/ckeditor/ckeditor5-image/releases/tag/v10.0.0)
* [@ckeditor/ckeditor5-link](https://www.npmjs.com/package/@ckeditor/ckeditor5-link): v1.0.0-beta.4 => [v10.0.0](https://github.com/ckeditor/ckeditor5-link/releases/tag/v10.0.0)
* [@ckeditor/ckeditor5-list](https://www.npmjs.com/package/@ckeditor/ckeditor5-list): v1.0.0-beta.4 => [v10.0.0](https://github.com/ckeditor/ckeditor5-list/releases/tag/v10.0.0)
* [@ckeditor/ckeditor5-markdown-gfm](https://www.npmjs.com/package/@ckeditor/ckeditor5-markdown-gfm): v1.0.0-beta.4 => [v10.0.0](https://github.com/ckeditor/ckeditor5-markdown-gfm/releases/tag/v10.0.0)
* [@ckeditor/ckeditor5-paragraph](https://www.npmjs.com/package/@ckeditor/ckeditor5-paragraph): v1.0.0-beta.4 => [v10.0.0](https://github.com/ckeditor/ckeditor5-paragraph/releases/tag/v10.0.0)
* [@ckeditor/ckeditor5-theme-lark](https://www.npmjs.com/package/@ckeditor/ckeditor5-theme-lark): v1.0.0-beta.4 => [v10.0.0](https://github.com/ckeditor/ckeditor5-theme-lark/releases/tag/v10.0.0)
* [@ckeditor/ckeditor5-typing](https://www.npmjs.com/package/@ckeditor/ckeditor5-typing): v1.0.0-beta.4 => [v10.0.0](https://github.com/ckeditor/ckeditor5-typing/releases/tag/v10.0.0)
* [@ckeditor/ckeditor5-ui](https://www.npmjs.com/package/@ckeditor/ckeditor5-ui): v1.0.0-beta.4 => [v10.0.0](https://github.com/ckeditor/ckeditor5-ui/releases/tag/v10.0.0)
* [@ckeditor/ckeditor5-undo](https://www.npmjs.com/package/@ckeditor/ckeditor5-undo): v1.0.0-beta.4 => [v10.0.0](https://github.com/ckeditor/ckeditor5-undo/releases/tag/v10.0.0)
* [@ckeditor/ckeditor5-upload](https://www.npmjs.com/package/@ckeditor/ckeditor5-upload): v1.0.0-beta.4 => [v10.0.0](https://github.com/ckeditor/ckeditor5-upload/releases/tag/v10.0.0)
* [@ckeditor/ckeditor5-utils](https://www.npmjs.com/package/@ckeditor/ckeditor5-utils): v1.0.0-beta.4 => [v10.0.0](https://github.com/ckeditor/ckeditor5-utils/releases/tag/v10.0.0)
* [@ckeditor/ckeditor5-widget](https://www.npmjs.com/package/@ckeditor/ckeditor5-widget): v1.0.0-beta.4 => [v10.0.0](https://github.com/ckeditor/ckeditor5-widget/releases/tag/v10.0.0)


## [1.0.0-beta.4](https://github.com/ckeditor/ckeditor5/compare/v1.0.0-beta.2...v1.0.0-beta.4) (2018-04-19)

### Release notes

This is a minor release that mainly focuses on stabilizing the [two-step caret movement around links](https://ckeditor.com/docs/ckeditor5/latest/builds/guides/whats-new.html#caret-movement-around-links).

A breaking change was introduced in the [document editor build](https://ckeditor.com/docs/ckeditor5/latest/builds/guides/overview.html#document-editor) – refer to its [changelog](https://github.com/ckeditor/ckeditor5-build-decoupled-document/releases/tag/v1.0.0-beta.4) for more information.

Finally, two new plugins were introduced – [`ParagraphButtonUI`](https://ckeditor.com/docs/ckeditor5/latest/api/module_paragraph_paragraphbuttonui-ParagraphButtonUI.html) and [`HeadingButtonsUI`](https://ckeditor.com/docs/ckeditor5/latest/api/module_heading_headingbuttonsui-HeadingButtonsUI.html) which make it possible to replace the `headings` dropdown with separate buttons for each heading level.

PS. The `1.0.0-beta.3` version number was skipped in order to align the project version number which diverged from builds version numbers

### Dependencies

Major releases (contain breaking changes):

* [@ckeditor/ckeditor5-adapter-ckfinder](https://www.npmjs.com/package/@ckeditor/ckeditor5-adapter-ckfinder): v1.0.0-beta.2 => [v1.0.0-beta.4](https://github.com/ckeditor/ckeditor5-adapter-ckfinder/releases/tag/v1.0.0-beta.4)
* [@ckeditor/ckeditor5-alignment](https://www.npmjs.com/package/@ckeditor/ckeditor5-alignment): v1.0.0-beta.2 => [v1.0.0-beta.4](https://github.com/ckeditor/ckeditor5-alignment/releases/tag/v1.0.0-beta.4)
* [@ckeditor/ckeditor5-autoformat](https://www.npmjs.com/package/@ckeditor/ckeditor5-autoformat): v1.0.0-beta.2 => [v1.0.0-beta.4](https://github.com/ckeditor/ckeditor5-autoformat/releases/tag/v1.0.0-beta.4)
* [@ckeditor/ckeditor5-basic-styles](https://www.npmjs.com/package/@ckeditor/ckeditor5-basic-styles): v1.0.0-beta.2 => [v1.0.0-beta.4](https://github.com/ckeditor/ckeditor5-basic-styles/releases/tag/v1.0.0-beta.4)
* [@ckeditor/ckeditor5-block-quote](https://www.npmjs.com/package/@ckeditor/ckeditor5-block-quote): v1.0.0-beta.2 => [v1.0.0-beta.4](https://github.com/ckeditor/ckeditor5-block-quote/releases/tag/v1.0.0-beta.4)
* [@ckeditor/ckeditor5-build-balloon](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-balloon): v1.0.0-beta.3 => [v1.0.0-beta.4](https://github.com/ckeditor/ckeditor5-build-balloon/releases/tag/v1.0.0-beta.4)
* [@ckeditor/ckeditor5-build-classic](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-classic): v1.0.0-beta.3 => [v1.0.0-beta.4](https://github.com/ckeditor/ckeditor5-build-classic/releases/tag/v1.0.0-beta.4)
* [@ckeditor/ckeditor5-build-decoupled-document](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-decoupled-document): v1.0.0-beta.3 => [v1.0.0-beta.4](https://github.com/ckeditor/ckeditor5-build-decoupled-document/releases/tag/v1.0.0-beta.4)
* [@ckeditor/ckeditor5-build-inline](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-inline): v1.0.0-beta.3 => [v1.0.0-beta.4](https://github.com/ckeditor/ckeditor5-build-inline/releases/tag/v1.0.0-beta.4)
* [@ckeditor/ckeditor5-clipboard](https://www.npmjs.com/package/@ckeditor/ckeditor5-clipboard): v1.0.0-beta.2 => [v1.0.0-beta.4](https://github.com/ckeditor/ckeditor5-clipboard/releases/tag/v1.0.0-beta.4)
* [@ckeditor/ckeditor5-cloud-services](https://www.npmjs.com/package/@ckeditor/ckeditor5-cloud-services): v1.0.0-beta.2 => [v1.0.0-beta.4](https://github.com/ckeditor/ckeditor5-cloud-services/releases/tag/v1.0.0-beta.4)
* [@ckeditor/ckeditor5-core](https://www.npmjs.com/package/@ckeditor/ckeditor5-core): v1.0.0-beta.2 => [v1.0.0-beta.4](https://github.com/ckeditor/ckeditor5-core/releases/tag/v1.0.0-beta.4)
* [@ckeditor/ckeditor5-easy-image](https://www.npmjs.com/package/@ckeditor/ckeditor5-easy-image): v1.0.0-beta.2 => [v1.0.0-beta.4](https://github.com/ckeditor/ckeditor5-easy-image/releases/tag/v1.0.0-beta.4)
* [@ckeditor/ckeditor5-editor-balloon](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-balloon): v1.0.0-beta.2 => [v1.0.0-beta.4](https://github.com/ckeditor/ckeditor5-editor-balloon/releases/tag/v1.0.0-beta.4)
* [@ckeditor/ckeditor5-editor-classic](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-classic): v1.0.0-beta.2 => [v1.0.0-beta.4](https://github.com/ckeditor/ckeditor5-editor-classic/releases/tag/v1.0.0-beta.4)
* [@ckeditor/ckeditor5-editor-decoupled](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-decoupled): v1.0.0-beta.2 => [v1.0.0-beta.4](https://github.com/ckeditor/ckeditor5-editor-decoupled/releases/tag/v1.0.0-beta.4)
* [@ckeditor/ckeditor5-editor-inline](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-inline): v1.0.0-beta.2 => [v1.0.0-beta.4](https://github.com/ckeditor/ckeditor5-editor-inline/releases/tag/v1.0.0-beta.4)
* [@ckeditor/ckeditor5-engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine): v1.0.0-beta.2 => [v1.0.0-beta.4](https://github.com/ckeditor/ckeditor5-engine/releases/tag/v1.0.0-beta.4)
* [@ckeditor/ckeditor5-enter](https://www.npmjs.com/package/@ckeditor/ckeditor5-enter): v1.0.0-beta.2 => [v1.0.0-beta.4](https://github.com/ckeditor/ckeditor5-enter/releases/tag/v1.0.0-beta.4)
* [@ckeditor/ckeditor5-essentials](https://www.npmjs.com/package/@ckeditor/ckeditor5-essentials): v1.0.0-beta.2 => [v1.0.0-beta.4](https://github.com/ckeditor/ckeditor5-essentials/releases/tag/v1.0.0-beta.4)
* [@ckeditor/ckeditor5-font](https://www.npmjs.com/package/@ckeditor/ckeditor5-font): v1.0.0-beta.2 => [v1.0.0-beta.4](https://github.com/ckeditor/ckeditor5-font/releases/tag/v1.0.0-beta.4)
* [@ckeditor/ckeditor5-heading](https://www.npmjs.com/package/@ckeditor/ckeditor5-heading): v1.0.0-beta.2 => [v1.0.0-beta.4](https://github.com/ckeditor/ckeditor5-heading/releases/tag/v1.0.0-beta.4)
* [@ckeditor/ckeditor5-highlight](https://www.npmjs.com/package/@ckeditor/ckeditor5-highlight): v1.0.0-beta.2 => [v1.0.0-beta.4](https://github.com/ckeditor/ckeditor5-highlight/releases/tag/v1.0.0-beta.4)
* [@ckeditor/ckeditor5-image](https://www.npmjs.com/package/@ckeditor/ckeditor5-image): v1.0.0-beta.2 => [v1.0.0-beta.4](https://github.com/ckeditor/ckeditor5-image/releases/tag/v1.0.0-beta.4)
* [@ckeditor/ckeditor5-link](https://www.npmjs.com/package/@ckeditor/ckeditor5-link): v1.0.0-beta.2 => [v1.0.0-beta.4](https://github.com/ckeditor/ckeditor5-link/releases/tag/v1.0.0-beta.4)
* [@ckeditor/ckeditor5-list](https://www.npmjs.com/package/@ckeditor/ckeditor5-list): v1.0.0-beta.2 => [v1.0.0-beta.4](https://github.com/ckeditor/ckeditor5-list/releases/tag/v1.0.0-beta.4)
* [@ckeditor/ckeditor5-markdown-gfm](https://www.npmjs.com/package/@ckeditor/ckeditor5-markdown-gfm): v1.0.0-beta.2 => [v1.0.0-beta.4](https://github.com/ckeditor/ckeditor5-markdown-gfm/releases/tag/v1.0.0-beta.4)
* [@ckeditor/ckeditor5-paragraph](https://www.npmjs.com/package/@ckeditor/ckeditor5-paragraph): v1.0.0-beta.2 => [v1.0.0-beta.4](https://github.com/ckeditor/ckeditor5-paragraph/releases/tag/v1.0.0-beta.4)
* [@ckeditor/ckeditor5-theme-lark](https://www.npmjs.com/package/@ckeditor/ckeditor5-theme-lark): v1.0.0-beta.2 => [v1.0.0-beta.4](https://github.com/ckeditor/ckeditor5-theme-lark/releases/tag/v1.0.0-beta.4)
* [@ckeditor/ckeditor5-typing](https://www.npmjs.com/package/@ckeditor/ckeditor5-typing): v1.0.0-beta.2 => [v1.0.0-beta.4](https://github.com/ckeditor/ckeditor5-typing/releases/tag/v1.0.0-beta.4)
* [@ckeditor/ckeditor5-ui](https://www.npmjs.com/package/@ckeditor/ckeditor5-ui): v1.0.0-beta.2 => [v1.0.0-beta.4](https://github.com/ckeditor/ckeditor5-ui/releases/tag/v1.0.0-beta.4)
* [@ckeditor/ckeditor5-undo](https://www.npmjs.com/package/@ckeditor/ckeditor5-undo): v1.0.0-beta.2 => [v1.0.0-beta.4](https://github.com/ckeditor/ckeditor5-undo/releases/tag/v1.0.0-beta.4)
* [@ckeditor/ckeditor5-upload](https://www.npmjs.com/package/@ckeditor/ckeditor5-upload): v1.0.0-beta.2 => [v1.0.0-beta.4](https://github.com/ckeditor/ckeditor5-upload/releases/tag/v1.0.0-beta.4)
* [@ckeditor/ckeditor5-utils](https://www.npmjs.com/package/@ckeditor/ckeditor5-utils): v1.0.0-beta.2 => [v1.0.0-beta.4](https://github.com/ckeditor/ckeditor5-utils/releases/tag/v1.0.0-beta.4)
* [@ckeditor/ckeditor5-widget](https://www.npmjs.com/package/@ckeditor/ckeditor5-widget): v1.0.0-beta.2 => [v1.0.0-beta.4](https://github.com/ckeditor/ckeditor5-widget/releases/tag/v1.0.0-beta.4)


## [1.0.0-beta.2](https://github.com/ckeditor/ckeditor5/compare/v1.0.0-beta.1...v1.0.0-beta.2) (2018-04-10)

### Dependencies

Major releases (contain breaking changes):

* [@ckeditor/ckeditor5-adapter-ckfinder](https://www.npmjs.com/package/@ckeditor/ckeditor5-adapter-ckfinder): v1.0.0-beta.1 => [v1.0.0-beta.2](https://github.com/ckeditor/ckeditor5-adapter-ckfinder/releases/tag/v1.0.0-beta.2)
* [@ckeditor/ckeditor5-alignment](https://www.npmjs.com/package/@ckeditor/ckeditor5-alignment): v1.0.0-beta.1 => [v1.0.0-beta.2](https://github.com/ckeditor/ckeditor5-alignment/releases/tag/v1.0.0-beta.2)
* [@ckeditor/ckeditor5-autoformat](https://www.npmjs.com/package/@ckeditor/ckeditor5-autoformat): v1.0.0-beta.1 => [v1.0.0-beta.2](https://github.com/ckeditor/ckeditor5-autoformat/releases/tag/v1.0.0-beta.2)
* [@ckeditor/ckeditor5-basic-styles](https://www.npmjs.com/package/@ckeditor/ckeditor5-basic-styles): v1.0.0-beta.1 => [v1.0.0-beta.2](https://github.com/ckeditor/ckeditor5-basic-styles/releases/tag/v1.0.0-beta.2)
* [@ckeditor/ckeditor5-block-quote](https://www.npmjs.com/package/@ckeditor/ckeditor5-block-quote): v1.0.0-beta.1 => [v1.0.0-beta.2](https://github.com/ckeditor/ckeditor5-block-quote/releases/tag/v1.0.0-beta.2)
* [@ckeditor/ckeditor5-build-balloon](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-balloon): v1.0.0-beta.1 => [v1.0.0-beta.3](https://github.com/ckeditor/ckeditor5-build-balloon/releases/tag/v1.0.0-beta.3)
* [@ckeditor/ckeditor5-build-classic](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-classic): v1.0.0-beta.1 => [v1.0.0-beta.3](https://github.com/ckeditor/ckeditor5-build-classic/releases/tag/v1.0.0-beta.3)
* [@ckeditor/ckeditor5-build-decoupled-document](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-decoupled-document): v1.0.0-beta.1 => [v1.0.0-beta.3](https://github.com/ckeditor/ckeditor5-build-decoupled-document/releases/tag/v1.0.0-beta.3)
* [@ckeditor/ckeditor5-build-inline](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-inline): v1.0.0-beta.1 => [v1.0.0-beta.3](https://github.com/ckeditor/ckeditor5-build-inline/releases/tag/v1.0.0-beta.3)
* [@ckeditor/ckeditor5-clipboard](https://www.npmjs.com/package/@ckeditor/ckeditor5-clipboard): v1.0.0-beta.1 => [v1.0.0-beta.2](https://github.com/ckeditor/ckeditor5-clipboard/releases/tag/v1.0.0-beta.2)
* [@ckeditor/ckeditor5-cloud-services](https://www.npmjs.com/package/@ckeditor/ckeditor5-cloud-services): v1.0.0-beta.1 => [v1.0.0-beta.2](https://github.com/ckeditor/ckeditor5-cloud-services/releases/tag/v1.0.0-beta.2)
* [@ckeditor/ckeditor5-core](https://www.npmjs.com/package/@ckeditor/ckeditor5-core): v1.0.0-beta.1 => [v1.0.0-beta.2](https://github.com/ckeditor/ckeditor5-core/releases/tag/v1.0.0-beta.2)
* [@ckeditor/ckeditor5-easy-image](https://www.npmjs.com/package/@ckeditor/ckeditor5-easy-image): v1.0.0-beta.1 => [v1.0.0-beta.2](https://github.com/ckeditor/ckeditor5-easy-image/releases/tag/v1.0.0-beta.2)
* [@ckeditor/ckeditor5-editor-balloon](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-balloon): v1.0.0-beta.1 => [v1.0.0-beta.2](https://github.com/ckeditor/ckeditor5-editor-balloon/releases/tag/v1.0.0-beta.2)
* [@ckeditor/ckeditor5-editor-classic](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-classic): v1.0.0-beta.1 => [v1.0.0-beta.2](https://github.com/ckeditor/ckeditor5-editor-classic/releases/tag/v1.0.0-beta.2)
* [@ckeditor/ckeditor5-editor-decoupled](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-decoupled): v1.0.0-beta.1 => [v1.0.0-beta.2](https://github.com/ckeditor/ckeditor5-editor-decoupled/releases/tag/v1.0.0-beta.2)
* [@ckeditor/ckeditor5-editor-inline](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-inline): v1.0.0-beta.1 => [v1.0.0-beta.2](https://github.com/ckeditor/ckeditor5-editor-inline/releases/tag/v1.0.0-beta.2)
* [@ckeditor/ckeditor5-engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine): v1.0.0-beta.1 => [v1.0.0-beta.2](https://github.com/ckeditor/ckeditor5-engine/releases/tag/v1.0.0-beta.2)
* [@ckeditor/ckeditor5-enter](https://www.npmjs.com/package/@ckeditor/ckeditor5-enter): v1.0.0-beta.1 => [v1.0.0-beta.2](https://github.com/ckeditor/ckeditor5-enter/releases/tag/v1.0.0-beta.2)
* [@ckeditor/ckeditor5-essentials](https://www.npmjs.com/package/@ckeditor/ckeditor5-essentials): v1.0.0-beta.1 => [v1.0.0-beta.2](https://github.com/ckeditor/ckeditor5-essentials/releases/tag/v1.0.0-beta.2)
* [@ckeditor/ckeditor5-font](https://www.npmjs.com/package/@ckeditor/ckeditor5-font): v1.0.0-beta.1 => [v1.0.0-beta.2](https://github.com/ckeditor/ckeditor5-font/releases/tag/v1.0.0-beta.2)
* [@ckeditor/ckeditor5-heading](https://www.npmjs.com/package/@ckeditor/ckeditor5-heading): v1.0.0-beta.1 => [v1.0.0-beta.2](https://github.com/ckeditor/ckeditor5-heading/releases/tag/v1.0.0-beta.2)
* [@ckeditor/ckeditor5-highlight](https://www.npmjs.com/package/@ckeditor/ckeditor5-highlight): v1.0.0-beta.1 => [v1.0.0-beta.2](https://github.com/ckeditor/ckeditor5-highlight/releases/tag/v1.0.0-beta.2)
* [@ckeditor/ckeditor5-image](https://www.npmjs.com/package/@ckeditor/ckeditor5-image): v1.0.0-beta.1 => [v1.0.0-beta.2](https://github.com/ckeditor/ckeditor5-image/releases/tag/v1.0.0-beta.2)
* [@ckeditor/ckeditor5-link](https://www.npmjs.com/package/@ckeditor/ckeditor5-link): v1.0.0-beta.1 => [v1.0.0-beta.2](https://github.com/ckeditor/ckeditor5-link/releases/tag/v1.0.0-beta.2)
* [@ckeditor/ckeditor5-list](https://www.npmjs.com/package/@ckeditor/ckeditor5-list): v1.0.0-beta.1 => [v1.0.0-beta.2](https://github.com/ckeditor/ckeditor5-list/releases/tag/v1.0.0-beta.2)
* [@ckeditor/ckeditor5-markdown-gfm](https://www.npmjs.com/package/@ckeditor/ckeditor5-markdown-gfm): v1.0.0-beta.1 => [v1.0.0-beta.2](https://github.com/ckeditor/ckeditor5-markdown-gfm/releases/tag/v1.0.0-beta.2)
* [@ckeditor/ckeditor5-paragraph](https://www.npmjs.com/package/@ckeditor/ckeditor5-paragraph): v1.0.0-beta.1 => [v1.0.0-beta.2](https://github.com/ckeditor/ckeditor5-paragraph/releases/tag/v1.0.0-beta.2)
* [@ckeditor/ckeditor5-theme-lark](https://www.npmjs.com/package/@ckeditor/ckeditor5-theme-lark): v1.0.0-beta.1 => [v1.0.0-beta.2](https://github.com/ckeditor/ckeditor5-theme-lark/releases/tag/v1.0.0-beta.2)
* [@ckeditor/ckeditor5-typing](https://www.npmjs.com/package/@ckeditor/ckeditor5-typing): v1.0.0-beta.1 => [v1.0.0-beta.2](https://github.com/ckeditor/ckeditor5-typing/releases/tag/v1.0.0-beta.2)
* [@ckeditor/ckeditor5-ui](https://www.npmjs.com/package/@ckeditor/ckeditor5-ui): v1.0.0-beta.1 => [v1.0.0-beta.2](https://github.com/ckeditor/ckeditor5-ui/releases/tag/v1.0.0-beta.2)
* [@ckeditor/ckeditor5-undo](https://www.npmjs.com/package/@ckeditor/ckeditor5-undo): v1.0.0-beta.1 => [v1.0.0-beta.2](https://github.com/ckeditor/ckeditor5-undo/releases/tag/v1.0.0-beta.2)
* [@ckeditor/ckeditor5-upload](https://www.npmjs.com/package/@ckeditor/ckeditor5-upload): v1.0.0-beta.1 => [v1.0.0-beta.2](https://github.com/ckeditor/ckeditor5-upload/releases/tag/v1.0.0-beta.2)
* [@ckeditor/ckeditor5-utils](https://www.npmjs.com/package/@ckeditor/ckeditor5-utils): v1.0.0-beta.1 => [v1.0.0-beta.2](https://github.com/ckeditor/ckeditor5-utils/releases/tag/v1.0.0-beta.2)
* [@ckeditor/ckeditor5-widget](https://www.npmjs.com/package/@ckeditor/ckeditor5-widget): v1.0.0-beta.1 => [v1.0.0-beta.2](https://github.com/ckeditor/ckeditor5-widget/releases/tag/v1.0.0-beta.2)

### Other changes

* `@ckeditor/ckeditor5-cloudservices` was renamed to `@ckeditor/ckeditor5-cloud-services` and `@ckeditor/ckeditor-cloudservices-core` to `@ckeditor/ckeditor-cloud-services-core`. ([65380a0](https://github.com/ckeditor/ckeditor5/commit/65380a0))


## [1.0.0-beta.1](https://github.com/ckeditor/ckeditor5/compare/v1.0.0-alpha.2...v1.0.0-beta.1) (2018-03-15)

### Dependencies

New packages:

* [@ckeditor/ckeditor5-alignment](https://www.npmjs.com/package/@ckeditor/ckeditor5-alignment): [v1.0.0-beta.1](https://github.com/ckeditor/ckeditor5-alignment/releases/tag/v1.0.0-beta.1)
* [@ckeditor/ckeditor5-build-decoupled-document](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-decoupled-document): [v1.0.0-beta.1](https://github.com/ckeditor/ckeditor5-build-decoupled-document/releases/tag/v1.0.0-beta.1)
* [@ckeditor/ckeditor5-editor-decoupled](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-decoupled): [v1.0.0-beta.1](https://github.com/ckeditor/ckeditor5-editor-decoupled/releases/tag/v1.0.0-beta.1)
* [@ckeditor/ckeditor5-font](https://www.npmjs.com/package/@ckeditor/ckeditor5-font): [v1.0.0-beta.1](https://github.com/ckeditor/ckeditor5-font/releases/tag/v1.0.0-beta.1)
* [@ckeditor/ckeditor5-highlight](https://www.npmjs.com/package/@ckeditor/ckeditor5-highlight): [v1.0.0-beta.1](https://github.com/ckeditor/ckeditor5-highlight/releases/tag/v1.0.0-beta.1)

Major releases (contain breaking changes):

* [@ckeditor/ckeditor5-adapter-ckfinder](https://www.npmjs.com/package/@ckeditor/ckeditor5-adapter-ckfinder): v1.0.0-alpha.2 => [v1.0.0-beta.1](https://github.com/ckeditor/ckeditor5-adapter-ckfinder/releases/tag/v1.0.0-beta.1)
* [@ckeditor/ckeditor5-autoformat](https://www.npmjs.com/package/@ckeditor/ckeditor5-autoformat): v1.0.0-alpha.2 => [v1.0.0-beta.1](https://github.com/ckeditor/ckeditor5-autoformat/releases/tag/v1.0.0-beta.1)
* [@ckeditor/ckeditor5-basic-styles](https://www.npmjs.com/package/@ckeditor/ckeditor5-basic-styles): v1.0.0-alpha.2 => [v1.0.0-beta.1](https://github.com/ckeditor/ckeditor5-basic-styles/releases/tag/v1.0.0-beta.1)
* [@ckeditor/ckeditor5-block-quote](https://www.npmjs.com/package/@ckeditor/ckeditor5-block-quote): v1.0.0-alpha.2 => [v1.0.0-beta.1](https://github.com/ckeditor/ckeditor5-block-quote/releases/tag/v1.0.0-beta.1)
* [@ckeditor/ckeditor5-build-balloon](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-balloon): v1.0.0-alpha.2 => [v1.0.0-beta.1](https://github.com/ckeditor/ckeditor5-build-balloon/releases/tag/v1.0.0-beta.1)
* [@ckeditor/ckeditor5-build-classic](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-classic): v1.0.0-alpha.2 => [v1.0.0-beta.1](https://github.com/ckeditor/ckeditor5-build-classic/releases/tag/v1.0.0-beta.1)
* [@ckeditor/ckeditor5-build-inline](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-inline): v1.0.0-alpha.2 => [v1.0.0-beta.1](https://github.com/ckeditor/ckeditor5-build-inline/releases/tag/v1.0.0-beta.1)
* [@ckeditor/ckeditor5-clipboard](https://www.npmjs.com/package/@ckeditor/ckeditor5-clipboard): v1.0.0-alpha.2 => [v1.0.0-beta.1](https://github.com/ckeditor/ckeditor5-clipboard/releases/tag/v1.0.0-beta.1)
* [@ckeditor/ckeditor5-cloudservices](https://www.npmjs.com/package/@ckeditor/ckeditor5-cloudservices): v1.0.0-alpha.1 => [v1.0.0-beta.1](https://github.com/ckeditor/ckeditor5-cloudservices/releases/tag/v1.0.0-beta.1)
* [@ckeditor/ckeditor5-core](https://www.npmjs.com/package/@ckeditor/ckeditor5-core): v1.0.0-alpha.2 => [v1.0.0-beta.1](https://github.com/ckeditor/ckeditor5-core/releases/tag/v1.0.0-beta.1)
* [@ckeditor/ckeditor5-easy-image](https://www.npmjs.com/package/@ckeditor/ckeditor5-easy-image): v1.0.0-alpha.2 => [v1.0.0-beta.1](https://github.com/ckeditor/ckeditor5-easy-image/releases/tag/v1.0.0-beta.1)
* [@ckeditor/ckeditor5-editor-balloon](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-balloon): v1.0.0-alpha.2 => [v1.0.0-beta.1](https://github.com/ckeditor/ckeditor5-editor-balloon/releases/tag/v1.0.0-beta.1)
* [@ckeditor/ckeditor5-editor-classic](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-classic): v1.0.0-alpha.2 => [v1.0.0-beta.1](https://github.com/ckeditor/ckeditor5-editor-classic/releases/tag/v1.0.0-beta.1)
* [@ckeditor/ckeditor5-editor-inline](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-inline): v1.0.0-alpha.2 => [v1.0.0-beta.1](https://github.com/ckeditor/ckeditor5-editor-inline/releases/tag/v1.0.0-beta.1)
* [@ckeditor/ckeditor5-engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine): v1.0.0-alpha.2 => [v1.0.0-beta.1](https://github.com/ckeditor/ckeditor5-engine/releases/tag/v1.0.0-beta.1)
* [@ckeditor/ckeditor5-enter](https://www.npmjs.com/package/@ckeditor/ckeditor5-enter): v1.0.0-alpha.2 => [v1.0.0-beta.1](https://github.com/ckeditor/ckeditor5-enter/releases/tag/v1.0.0-beta.1)
* [@ckeditor/ckeditor5-essentials](https://www.npmjs.com/package/@ckeditor/ckeditor5-essentials): v1.0.0-alpha.2 => [v1.0.0-beta.1](https://github.com/ckeditor/ckeditor5-essentials/releases/tag/v1.0.0-beta.1)
* [@ckeditor/ckeditor5-heading](https://www.npmjs.com/package/@ckeditor/ckeditor5-heading): v1.0.0-alpha.2 => [v1.0.0-beta.1](https://github.com/ckeditor/ckeditor5-heading/releases/tag/v1.0.0-beta.1)
* [@ckeditor/ckeditor5-image](https://www.npmjs.com/package/@ckeditor/ckeditor5-image): v1.0.0-alpha.2 => [v1.0.0-beta.1](https://github.com/ckeditor/ckeditor5-image/releases/tag/v1.0.0-beta.1)
* [@ckeditor/ckeditor5-link](https://www.npmjs.com/package/@ckeditor/ckeditor5-link): v1.0.0-alpha.2 => [v1.0.0-beta.1](https://github.com/ckeditor/ckeditor5-link/releases/tag/v1.0.0-beta.1)
* [@ckeditor/ckeditor5-list](https://www.npmjs.com/package/@ckeditor/ckeditor5-list): v1.0.0-alpha.2 => [v1.0.0-beta.1](https://github.com/ckeditor/ckeditor5-list/releases/tag/v1.0.0-beta.1)
* [@ckeditor/ckeditor5-markdown-gfm](https://www.npmjs.com/package/@ckeditor/ckeditor5-markdown-gfm): v1.0.0-alpha.2 => [v1.0.0-beta.1](https://github.com/ckeditor/ckeditor5-markdown-gfm/releases/tag/v1.0.0-beta.1)
* [@ckeditor/ckeditor5-paragraph](https://www.npmjs.com/package/@ckeditor/ckeditor5-paragraph): v1.0.0-alpha.2 => [v1.0.0-beta.1](https://github.com/ckeditor/ckeditor5-paragraph/releases/tag/v1.0.0-beta.1)
* [@ckeditor/ckeditor5-theme-lark](https://www.npmjs.com/package/@ckeditor/ckeditor5-theme-lark): v1.0.0-alpha.2 => [v1.0.0-beta.1](https://github.com/ckeditor/ckeditor5-theme-lark/releases/tag/v1.0.0-beta.1)
* [@ckeditor/ckeditor5-typing](https://www.npmjs.com/package/@ckeditor/ckeditor5-typing): v1.0.0-alpha.2 => [v1.0.0-beta.1](https://github.com/ckeditor/ckeditor5-typing/releases/tag/v1.0.0-beta.1)
* [@ckeditor/ckeditor5-ui](https://www.npmjs.com/package/@ckeditor/ckeditor5-ui): v1.0.0-alpha.2 => [v1.0.0-beta.1](https://github.com/ckeditor/ckeditor5-ui/releases/tag/v1.0.0-beta.1)
* [@ckeditor/ckeditor5-undo](https://www.npmjs.com/package/@ckeditor/ckeditor5-undo): v1.0.0-alpha.2 => [v1.0.0-beta.1](https://github.com/ckeditor/ckeditor5-undo/releases/tag/v1.0.0-beta.1)
* [@ckeditor/ckeditor5-upload](https://www.npmjs.com/package/@ckeditor/ckeditor5-upload): v1.0.0-alpha.2 => [v1.0.0-beta.1](https://github.com/ckeditor/ckeditor5-upload/releases/tag/v1.0.0-beta.1)
* [@ckeditor/ckeditor5-utils](https://www.npmjs.com/package/@ckeditor/ckeditor5-utils): v1.0.0-alpha.2 => [v1.0.0-beta.1](https://github.com/ckeditor/ckeditor5-utils/releases/tag/v1.0.0-beta.1)
* [@ckeditor/ckeditor5-widget](https://www.npmjs.com/package/@ckeditor/ckeditor5-widget): v1.0.0-alpha.2 => [v1.0.0-beta.1](https://github.com/ckeditor/ckeditor5-widget/releases/tag/v1.0.0-beta.1)


## [1.0.0-alpha.2](https://github.com/ckeditor/ckeditor5.git/compare/v1.0.0-alpha.1...v1.0.0-alpha.2) (2017-11-14)

### Dependencies

New packages:

* [@ckeditor/ckeditor5-cloudservices](https://www.npmjs.com/package/@ckeditor/ckeditor5-cloudservices): [v1.0.0-alpha.1](https://github.com/ckeditor/ckeditor5-cloudservices/releases/tag/v1.0.0-alpha.1)

Major releases (contain breaking changes):

* [@ckeditor/ckeditor5-adapter-ckfinder](https://www.npmjs.com/package/@ckeditor/ckeditor5-adapter-ckfinder): v1.0.0-alpha.1 => [v1.0.0-alpha.2](https://github.com/ckeditor/ckeditor5-adapter-ckfinder/releases/tag/v1.0.0-alpha.2)
* [@ckeditor/ckeditor5-autoformat](https://www.npmjs.com/package/@ckeditor/ckeditor5-autoformat): v1.0.0-alpha.1 => [v1.0.0-alpha.2](https://github.com/ckeditor/ckeditor5-autoformat/releases/tag/v1.0.0-alpha.2)
* [@ckeditor/ckeditor5-basic-styles](https://www.npmjs.com/package/@ckeditor/ckeditor5-basic-styles): v1.0.0-alpha.1 => [v1.0.0-alpha.2](https://github.com/ckeditor/ckeditor5-basic-styles/releases/tag/v1.0.0-alpha.2)
* [@ckeditor/ckeditor5-block-quote](https://www.npmjs.com/package/@ckeditor/ckeditor5-block-quote): v1.0.0-alpha.1 => [v1.0.0-alpha.2](https://github.com/ckeditor/ckeditor5-block-quote/releases/tag/v1.0.0-alpha.2)
* [@ckeditor/ckeditor5-build-balloon](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-balloon): v1.0.0-alpha.1 => [v1.0.0-alpha.2](https://github.com/ckeditor/ckeditor5-build-balloon/releases/tag/v1.0.0-alpha.2)
* [@ckeditor/ckeditor5-build-classic](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-classic): v1.0.0-alpha.1 => [v1.0.0-alpha.2](https://github.com/ckeditor/ckeditor5-build-classic/releases/tag/v1.0.0-alpha.2)
* [@ckeditor/ckeditor5-build-inline](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-inline): v1.0.0-alpha.1 => [v1.0.0-alpha.2](https://github.com/ckeditor/ckeditor5-build-inline/releases/tag/v1.0.0-alpha.2)
* [@ckeditor/ckeditor5-clipboard](https://www.npmjs.com/package/@ckeditor/ckeditor5-clipboard): v1.0.0-alpha.1 => [v1.0.0-alpha.2](https://github.com/ckeditor/ckeditor5-clipboard/releases/tag/v1.0.0-alpha.2)
* [@ckeditor/ckeditor5-core](https://www.npmjs.com/package/@ckeditor/ckeditor5-core): v1.0.0-alpha.1 => [v1.0.0-alpha.2](https://github.com/ckeditor/ckeditor5-core/releases/tag/v1.0.0-alpha.2)
* [@ckeditor/ckeditor5-easy-image](https://www.npmjs.com/package/@ckeditor/ckeditor5-easy-image): v1.0.0-alpha.1 => [v1.0.0-alpha.2](https://github.com/ckeditor/ckeditor5-easy-image/releases/tag/v1.0.0-alpha.2)
* [@ckeditor/ckeditor5-editor-balloon](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-balloon): v1.0.0-alpha.1 => [v1.0.0-alpha.2](https://github.com/ckeditor/ckeditor5-editor-balloon/releases/tag/v1.0.0-alpha.2)
* [@ckeditor/ckeditor5-editor-classic](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-classic): v1.0.0-alpha.1 => [v1.0.0-alpha.2](https://github.com/ckeditor/ckeditor5-editor-classic/releases/tag/v1.0.0-alpha.2)
* [@ckeditor/ckeditor5-editor-inline](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-inline): v1.0.0-alpha.1 => [v1.0.0-alpha.2](https://github.com/ckeditor/ckeditor5-editor-inline/releases/tag/v1.0.0-alpha.2)
* [@ckeditor/ckeditor5-engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine): v1.0.0-alpha.1 => [v1.0.0-alpha.2](https://github.com/ckeditor/ckeditor5-engine/releases/tag/v1.0.0-alpha.2)
* [@ckeditor/ckeditor5-enter](https://www.npmjs.com/package/@ckeditor/ckeditor5-enter): v1.0.0-alpha.1 => [v1.0.0-alpha.2](https://github.com/ckeditor/ckeditor5-enter/releases/tag/v1.0.0-alpha.2)
* [@ckeditor/ckeditor5-essentials](https://www.npmjs.com/package/@ckeditor/ckeditor5-essentials): v1.0.0-alpha.1 => [v1.0.0-alpha.2](https://github.com/ckeditor/ckeditor5-essentials/releases/tag/v1.0.0-alpha.2)
* [@ckeditor/ckeditor5-heading](https://www.npmjs.com/package/@ckeditor/ckeditor5-heading): v1.0.0-alpha.1 => [v1.0.0-alpha.2](https://github.com/ckeditor/ckeditor5-heading/releases/tag/v1.0.0-alpha.2)
* [@ckeditor/ckeditor5-image](https://www.npmjs.com/package/@ckeditor/ckeditor5-image): v1.0.0-alpha.1 => [v1.0.0-alpha.2](https://github.com/ckeditor/ckeditor5-image/releases/tag/v1.0.0-alpha.2)
* [@ckeditor/ckeditor5-link](https://www.npmjs.com/package/@ckeditor/ckeditor5-link): v1.0.0-alpha.1 => [v1.0.0-alpha.2](https://github.com/ckeditor/ckeditor5-link/releases/tag/v1.0.0-alpha.2)
* [@ckeditor/ckeditor5-list](https://www.npmjs.com/package/@ckeditor/ckeditor5-list): v1.0.0-alpha.1 => [v1.0.0-alpha.2](https://github.com/ckeditor/ckeditor5-list/releases/tag/v1.0.0-alpha.2)
* [@ckeditor/ckeditor5-markdown-gfm](https://www.npmjs.com/package/@ckeditor/ckeditor5-markdown-gfm): v1.0.0-alpha.1 => [v1.0.0-alpha.2](https://github.com/ckeditor/ckeditor5-markdown-gfm/releases/tag/v1.0.0-alpha.2)
* [@ckeditor/ckeditor5-paragraph](https://www.npmjs.com/package/@ckeditor/ckeditor5-paragraph): v1.0.0-alpha.1 => [v1.0.0-alpha.2](https://github.com/ckeditor/ckeditor5-paragraph/releases/tag/v1.0.0-alpha.2)
* [@ckeditor/ckeditor5-theme-lark](https://www.npmjs.com/package/@ckeditor/ckeditor5-theme-lark): v1.0.0-alpha.1 => [v1.0.0-alpha.2](https://github.com/ckeditor/ckeditor5-theme-lark/releases/tag/v1.0.0-alpha.2)
* [@ckeditor/ckeditor5-typing](https://www.npmjs.com/package/@ckeditor/ckeditor5-typing): v1.0.0-alpha.1 => [v1.0.0-alpha.2](https://github.com/ckeditor/ckeditor5-typing/releases/tag/v1.0.0-alpha.2)
* [@ckeditor/ckeditor5-ui](https://www.npmjs.com/package/@ckeditor/ckeditor5-ui): v1.0.0-alpha.1 => [v1.0.0-alpha.2](https://github.com/ckeditor/ckeditor5-ui/releases/tag/v1.0.0-alpha.2)
* [@ckeditor/ckeditor5-undo](https://www.npmjs.com/package/@ckeditor/ckeditor5-undo): v1.0.0-alpha.1 => [v1.0.0-alpha.2](https://github.com/ckeditor/ckeditor5-undo/releases/tag/v1.0.0-alpha.2)
* [@ckeditor/ckeditor5-upload](https://www.npmjs.com/package/@ckeditor/ckeditor5-upload): v1.0.0-alpha.1 => [v1.0.0-alpha.2](https://github.com/ckeditor/ckeditor5-upload/releases/tag/v1.0.0-alpha.2)
* [@ckeditor/ckeditor5-utils](https://www.npmjs.com/package/@ckeditor/ckeditor5-utils): v1.0.0-alpha.1 => [v1.0.0-alpha.2](https://github.com/ckeditor/ckeditor5-utils/releases/tag/v1.0.0-alpha.2)
* [@ckeditor/ckeditor5-widget](https://www.npmjs.com/package/@ckeditor/ckeditor5-widget): v1.0.0-alpha.1 => [v1.0.0-alpha.2](https://github.com/ckeditor/ckeditor5-widget/releases/tag/v1.0.0-alpha.2)

### Bug fixes

Besides changes in the dependencies, this version also contains the following bug fixes:

* Brought back `@ckeditor/ckeditor5-editor-classic` which got mistakenly removed from the main `package.json` just before the release. Closes [#585](https://github.com/ckeditor/ckeditor5/issues/585). ([c2d246b](https://github.com/ckeditor/ckeditor5/commit/c2d246b))


## [1.0.0-alpha.1](https://github.com/ckeditor/ckeditor5/compare/v0.11.0...v1.0.0-alpha.1) (2017-10-03)

New packages:

* [@ckeditor/ckeditor5-easy-image](https://www.npmjs.com/package/@ckeditor/ckeditor5-easy-image): [v1.0.0-alpha.1](https://github.com/ckeditor/ckeditor5-easy-image/releases/tag/v1.0.0-alpha.1)

Major releases (possible breaking changes):

* [@ckeditor/ckeditor5-adapter-ckfinder](https://www.npmjs.com/package/@ckeditor/ckeditor5-adapter-ckfinder): v0.1.1 => [v1.0.0-alpha.1](https://github.com/ckeditor/ckeditor5-adapter-ckfinder/releases/tag/v1.0.0-alpha.1)
* [@ckeditor/ckeditor5-autoformat](https://www.npmjs.com/package/@ckeditor/ckeditor5-autoformat): v0.1.0 => [v1.0.0-alpha.1](https://github.com/ckeditor/ckeditor5-autoformat/releases/tag/v1.0.0-alpha.1)
* [@ckeditor/ckeditor5-basic-styles](https://www.npmjs.com/package/@ckeditor/ckeditor5-basic-styles): v0.9.0 => [v1.0.0-alpha.1](https://github.com/ckeditor/ckeditor5-basic-styles/releases/tag/v1.0.0-alpha.1)
* [@ckeditor/ckeditor5-block-quote](https://www.npmjs.com/package/@ckeditor/ckeditor5-block-quote): v0.2.0 => [v1.0.0-alpha.1](https://github.com/ckeditor/ckeditor5-block-quote/releases/tag/v1.0.0-alpha.1)
* [@ckeditor/ckeditor5-build-balloon](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-balloon): v0.1.0 => [v1.0.0-alpha.1](https://github.com/ckeditor/ckeditor5-build-balloon/releases/tag/v1.0.0-alpha.1)
* [@ckeditor/ckeditor5-build-classic](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-classic): v0.3.0 => [v1.0.0-alpha.1](https://github.com/ckeditor/ckeditor5-build-classic/releases/tag/v1.0.0-alpha.1)
* [@ckeditor/ckeditor5-build-inline](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-inline): v0.1.0 => [v1.0.0-alpha.1](https://github.com/ckeditor/ckeditor5-build-inline/releases/tag/v1.0.0-alpha.1)
* [@ckeditor/ckeditor5-clipboard](https://www.npmjs.com/package/@ckeditor/ckeditor5-clipboard): v0.7.0 => [v1.0.0-alpha.1](https://github.com/ckeditor/ckeditor5-clipboard/releases/tag/v1.0.0-alpha.1)
* [@ckeditor/ckeditor5-core](https://www.npmjs.com/package/@ckeditor/ckeditor5-core): v0.9.0 => [v1.0.0-alpha.1](https://github.com/ckeditor/ckeditor5-core/releases/tag/v1.0.0-alpha.1)
* [@ckeditor/ckeditor5-editor-balloon](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-balloon): v0.1.0 => [v1.0.0-alpha.1](https://github.com/ckeditor/ckeditor5-editor-balloon/releases/tag/v1.0.0-alpha.1)
* [@ckeditor/ckeditor5-editor-classic](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-classic): v0.8.0 => [v1.0.0-alpha.1](https://github.com/ckeditor/ckeditor5-editor-classic/releases/tag/v1.0.0-alpha.1)
* [@ckeditor/ckeditor5-editor-inline](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-inline): v0.2.0 => [v1.0.0-alpha.1](https://github.com/ckeditor/ckeditor5-editor-inline/releases/tag/v1.0.0-alpha.1)
* [@ckeditor/ckeditor5-engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine): v0.11.0 => [v1.0.0-alpha.1](https://github.com/ckeditor/ckeditor5-engine/releases/tag/v1.0.0-alpha.1)
* [@ckeditor/ckeditor5-enter](https://www.npmjs.com/package/@ckeditor/ckeditor5-enter): v0.10.0 => [v1.0.0-alpha.1](https://github.com/ckeditor/ckeditor5-enter/releases/tag/v1.0.0-alpha.1)
* [@ckeditor/ckeditor5-essentials](https://www.npmjs.com/package/@ckeditor/ckeditor5-essentials): v0.3.0 => [v1.0.0-alpha.1](https://github.com/ckeditor/ckeditor5-essentials/releases/tag/v1.0.0-alpha.1)
* [@ckeditor/ckeditor5-heading](https://www.npmjs.com/package/@ckeditor/ckeditor5-heading): v0.10.0 => [v1.0.0-alpha.1](https://github.com/ckeditor/ckeditor5-heading/releases/tag/v1.0.0-alpha.1)
* [@ckeditor/ckeditor5-image](https://www.npmjs.com/package/@ckeditor/ckeditor5-image): v0.7.0 => [v1.0.0-alpha.1](https://github.com/ckeditor/ckeditor5-image/releases/tag/v1.0.0-alpha.1)
* [@ckeditor/ckeditor5-link](https://www.npmjs.com/package/@ckeditor/ckeditor5-link): v0.8.0 => [v1.0.0-alpha.1](https://github.com/ckeditor/ckeditor5-link/releases/tag/v1.0.0-alpha.1)
* [@ckeditor/ckeditor5-list](https://www.npmjs.com/package/@ckeditor/ckeditor5-list): v0.7.0 => [v1.0.0-alpha.1](https://github.com/ckeditor/ckeditor5-list/releases/tag/v1.0.0-alpha.1)
* [@ckeditor/ckeditor5-markdown-gfm](https://www.npmjs.com/package/@ckeditor/ckeditor5-markdown-gfm): v0.4.4 => [v1.0.0-alpha.1](https://github.com/ckeditor/ckeditor5-markdown-gfm/releases/tag/v1.0.0-alpha.1)
* [@ckeditor/ckeditor5-paragraph](https://www.npmjs.com/package/@ckeditor/ckeditor5-paragraph): v0.9.0 => [v1.0.0-alpha.1](https://github.com/ckeditor/ckeditor5-paragraph/releases/tag/v1.0.0-alpha.1)
* [@ckeditor/ckeditor5-theme-lark](https://www.npmjs.com/package/@ckeditor/ckeditor5-theme-lark): v0.9.0 => [v1.0.0-alpha.1](https://github.com/ckeditor/ckeditor5-theme-lark/releases/tag/v1.0.0-alpha.1)
* [@ckeditor/ckeditor5-typing](https://www.npmjs.com/package/@ckeditor/ckeditor5-typing): v0.10.0 => [v1.0.0-alpha.1](https://github.com/ckeditor/ckeditor5-typing/releases/tag/v1.0.0-alpha.1)
* [@ckeditor/ckeditor5-ui](https://www.npmjs.com/package/@ckeditor/ckeditor5-ui): v0.10.0 => [v1.0.0-alpha.1](https://github.com/ckeditor/ckeditor5-ui/releases/tag/v1.0.0-alpha.1)
* [@ckeditor/ckeditor5-undo](https://www.npmjs.com/package/@ckeditor/ckeditor5-undo): v0.9.0 => [v1.0.0-alpha.1](https://github.com/ckeditor/ckeditor5-undo/releases/tag/v1.0.0-alpha.1)
* [@ckeditor/ckeditor5-upload](https://www.npmjs.com/package/@ckeditor/ckeditor5-upload): v0.2.0 => [v1.0.0-alpha.1](https://github.com/ckeditor/ckeditor5-upload/releases/tag/v1.0.0-alpha.1)
* [@ckeditor/ckeditor5-utils](https://www.npmjs.com/package/@ckeditor/ckeditor5-utils): v0.10.0 => [v1.0.0-alpha.1](https://github.com/ckeditor/ckeditor5-utils/releases/tag/v1.0.0-alpha.1)
* [@ckeditor/ckeditor5-widget](https://www.npmjs.com/package/@ckeditor/ckeditor5-widget): v0.2.0 => [v1.0.0-alpha.1](https://github.com/ckeditor/ckeditor5-widget/releases/tag/v1.0.0-alpha.1)

BREAKING CHANGES:

Besides breaking changes introduced in the dependencies, the following breaking changes were introduced:

* The `@ckeditor/ckeditor5-build-balloon-toolbar` package was renamed to `@ckeditor/ckeditor5-build-balloon`.
* The `@ckeditor/ckeditor5-editor-balloon-toolbar` package was renamed to `@ckeditor/ckeditor5-editor-balloon`.
* The `@ckeditor/ckeditor5-presets` package was renamed to `@ckeditor/ckeditor5-essentials` and the `Article` preset plugin was made a development util. See [ckeditor/ckeditor5-essentials#1](https://github.com/ckeditor/ckeditor5-presets/issues/1).


## [0.11.0](https://github.com/ckeditor/ckeditor5/compare/v0.10.0...v0.11.0) (2017-09-03)

New packages:

* [@ckeditor/ckeditor5-build-balloon-toolbar](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-balloon-toolbar): [v0.1.0](https://github.com/ckeditor/ckeditor5-build-balloon-toolbar/releases/tag/v0.1.0)
* [@ckeditor/ckeditor5-build-inline](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-inline): [v0.1.0](https://github.com/ckeditor/ckeditor5-build-inline/releases/tag/v0.1.0)
* [@ckeditor/ckeditor5-editor-balloon-toolbar](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-balloon-toolbar): [v0.1.0](https://github.com/ckeditor/ckeditor5-editor-balloon-toolbar/releases/tag/v0.1.0)

Minor releases (possible breaking changes):

* [@ckeditor/ckeditor5-autoformat](https://www.npmjs.com/package/@ckeditor/ckeditor5-autoformat): v0.5.1 => [v0.6.0](https://github.com/ckeditor/ckeditor5-autoformat/releases/tag/v0.6.0)
* [@ckeditor/ckeditor5-basic-styles](https://www.npmjs.com/package/@ckeditor/ckeditor5-basic-styles): v0.8.1 => [v0.9.0](https://github.com/ckeditor/ckeditor5-basic-styles/releases/tag/v0.9.0)
* [@ckeditor/ckeditor5-block-quote](https://www.npmjs.com/package/@ckeditor/ckeditor5-block-quote): v0.1.1 => [v0.2.0](https://github.com/ckeditor/ckeditor5-block-quote/releases/tag/v0.2.0)
* [@ckeditor/ckeditor5-build-classic](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-classic): v0.2.0 => [v0.3.0](https://github.com/ckeditor/ckeditor5-build-classic/releases/tag/v0.3.0)
* [@ckeditor/ckeditor5-clipboard](https://www.npmjs.com/package/@ckeditor/ckeditor5-clipboard): v0.6.0 => [v0.7.0](https://github.com/ckeditor/ckeditor5-clipboard/releases/tag/v0.7.0)
* [@ckeditor/ckeditor5-core](https://www.npmjs.com/package/@ckeditor/ckeditor5-core): v0.8.1 => [v0.9.0](https://github.com/ckeditor/ckeditor5-core/releases/tag/v0.9.0)
* [@ckeditor/ckeditor5-editor-classic](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-classic): v0.7.3 => [v0.8.0](https://github.com/ckeditor/ckeditor5-editor-classic/releases/tag/v0.8.0)
* [@ckeditor/ckeditor5-editor-inline](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-inline): v0.1.1 => [v0.2.0](https://github.com/ckeditor/ckeditor5-editor-inline/releases/tag/v0.2.0)
* [@ckeditor/ckeditor5-engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine): v0.10.0 => [v0.11.0](https://github.com/ckeditor/ckeditor5-engine/releases/tag/v0.11.0)
* [@ckeditor/ckeditor5-enter](https://www.npmjs.com/package/@ckeditor/ckeditor5-enter): v0.9.1 => [v0.10.0](https://github.com/ckeditor/ckeditor5-enter/releases/tag/v0.10.0)
* [@ckeditor/ckeditor5-heading](https://www.npmjs.com/package/@ckeditor/ckeditor5-heading): v0.9.1 => [v0.10.0](https://github.com/ckeditor/ckeditor5-heading/releases/tag/v0.10.0)
* [@ckeditor/ckeditor5-image](https://www.npmjs.com/package/@ckeditor/ckeditor5-image): v0.6.0 => [v0.7.0](https://github.com/ckeditor/ckeditor5-image/releases/tag/v0.7.0)
* [@ckeditor/ckeditor5-link](https://www.npmjs.com/package/@ckeditor/ckeditor5-link): v0.7.0 => [v0.8.0](https://github.com/ckeditor/ckeditor5-link/releases/tag/v0.8.0)
* [@ckeditor/ckeditor5-list](https://www.npmjs.com/package/@ckeditor/ckeditor5-list): v0.6.1 => [v0.7.0](https://github.com/ckeditor/ckeditor5-list/releases/tag/v0.7.0)
* [@ckeditor/ckeditor5-paragraph](https://www.npmjs.com/package/@ckeditor/ckeditor5-paragraph): v0.8.0 => [v0.9.0](https://github.com/ckeditor/ckeditor5-paragraph/releases/tag/v0.9.0)
* [@ckeditor/ckeditor5-presets](https://www.npmjs.com/package/@ckeditor/ckeditor5-presets): v0.2.2 => [v0.3.0](https://github.com/ckeditor/ckeditor5-presets/releases/tag/v0.3.0)
* [@ckeditor/ckeditor5-theme-lark](https://www.npmjs.com/package/@ckeditor/ckeditor5-theme-lark): v0.8.0 => [v0.9.0](https://github.com/ckeditor/ckeditor5-theme-lark/releases/tag/v0.9.0)
* [@ckeditor/ckeditor5-typing](https://www.npmjs.com/package/@ckeditor/ckeditor5-typing): v0.9.1 => [v0.10.0](https://github.com/ckeditor/ckeditor5-typing/releases/tag/v0.10.0)
* [@ckeditor/ckeditor5-ui](https://www.npmjs.com/package/@ckeditor/ckeditor5-ui): v0.9.0 => [v0.10.0](https://github.com/ckeditor/ckeditor5-ui/releases/tag/v0.10.0)
* [@ckeditor/ckeditor5-undo](https://www.npmjs.com/package/@ckeditor/ckeditor5-undo): v0.8.1 => [v0.9.0](https://github.com/ckeditor/ckeditor5-undo/releases/tag/v0.9.0)
* [@ckeditor/ckeditor5-upload](https://www.npmjs.com/package/@ckeditor/ckeditor5-upload): v0.1.0 => [v0.2.0](https://github.com/ckeditor/ckeditor5-upload/releases/tag/v0.2.0)
* [@ckeditor/ckeditor5-utils](https://www.npmjs.com/package/@ckeditor/ckeditor5-utils): v0.9.1 => [v0.10.0](https://github.com/ckeditor/ckeditor5-utils/releases/tag/v0.10.0)
* [@ckeditor/ckeditor5-widget](https://www.npmjs.com/package/@ckeditor/ckeditor5-widget): v0.1.1 => [v0.2.0](https://github.com/ckeditor/ckeditor5-widget/releases/tag/v0.2.0)

Patch releases (bug fixes, internal changes):

* [@ckeditor/ckeditor5-adapter-ckfinder](https://www.npmjs.com/package/@ckeditor/ckeditor5-adapter-ckfinder): v0.1.0 => [v0.1.1](https://github.com/ckeditor/ckeditor5-adapter-ckfinder/releases/tag/v0.1.1)
* [@ckeditor/ckeditor5-markdown-gfm](https://www.npmjs.com/package/@ckeditor/ckeditor5-markdown-gfm): v0.4.3 => [v0.4.4](https://github.com/ckeditor/ckeditor5-markdown-gfm/releases/tag/v0.4.4)


## [0.10.0](https://github.com/ckeditor/ckeditor5/compare/v0.9.0...v0.10.0) (2017-05-07)

New packages:

* [@ckeditor/ckeditor5-upload](https://www.npmjs.com/package/@ckeditor/ckeditor5-upload): [v0.1.0](https://github.com/ckeditor/ckeditor5-upload/releases/tag/v0.1.0)

Minor releases (possible breaking changes):

* [@ckeditor/ckeditor5-build-classic](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-classic): v0.1.1 => [v0.2.0](https://github.com/ckeditor/ckeditor5-build-classic/releases/tag/v0.2.0)
* [@ckeditor/ckeditor5-clipboard](https://www.npmjs.com/package/@ckeditor/ckeditor5-clipboard): v0.5.0 => [v0.6.0](https://github.com/ckeditor/ckeditor5-clipboard/releases/tag/v0.6.0)
* [@ckeditor/ckeditor5-engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine): v0.9.0 => [v0.10.0](https://github.com/ckeditor/ckeditor5-engine/releases/tag/v0.10.0)
* [@ckeditor/ckeditor5-image](https://www.npmjs.com/package/@ckeditor/ckeditor5-image): v0.5.0 => [v0.6.0](https://github.com/ckeditor/ckeditor5-image/releases/tag/v0.6.0)
* [@ckeditor/ckeditor5-link](https://www.npmjs.com/package/@ckeditor/ckeditor5-link): v0.6.0 => [v0.7.0](https://github.com/ckeditor/ckeditor5-link/releases/tag/v0.7.0)
* [@ckeditor/ckeditor5-paragraph](https://www.npmjs.com/package/@ckeditor/ckeditor5-paragraph): v0.7.0 => [v0.8.0](https://github.com/ckeditor/ckeditor5-paragraph/releases/tag/v0.8.0)
* [@ckeditor/ckeditor5-theme-lark](https://www.npmjs.com/package/@ckeditor/ckeditor5-theme-lark): v0.7.0 => [v0.8.0](https://github.com/ckeditor/ckeditor5-theme-lark/releases/tag/v0.8.0)
* [@ckeditor/ckeditor5-ui](https://www.npmjs.com/package/@ckeditor/ckeditor5-ui): v0.8.0 => [v0.9.0](https://github.com/ckeditor/ckeditor5-ui/releases/tag/v0.9.0)

Patch releases (bug fixes, internal changes):

* [@ckeditor/ckeditor5-autoformat](https://www.npmjs.com/package/@ckeditor/ckeditor5-autoformat): v0.5.0 => [v0.5.1](https://github.com/ckeditor/ckeditor5-autoformat/releases/tag/v0.5.1)
* [@ckeditor/ckeditor5-basic-styles](https://www.npmjs.com/package/@ckeditor/ckeditor5-basic-styles): v0.8.0 => [v0.8.1](https://github.com/ckeditor/ckeditor5-basic-styles/releases/tag/v0.8.1)
* [@ckeditor/ckeditor5-block-quote](https://www.npmjs.com/package/@ckeditor/ckeditor5-block-quote): v0.1.0 => [v0.1.1](https://github.com/ckeditor/ckeditor5-block-quote/releases/tag/v0.1.1)
* [@ckeditor/ckeditor5-core](https://www.npmjs.com/package/@ckeditor/ckeditor5-core): v0.8.0 => [v0.8.1](https://github.com/ckeditor/ckeditor5-core/releases/tag/v0.8.1)
* [@ckeditor/ckeditor5-editor-classic](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-classic): v0.7.2 => [v0.7.3](https://github.com/ckeditor/ckeditor5-editor-classic/releases/tag/v0.7.3)
* [@ckeditor/ckeditor5-editor-inline](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-inline): v0.1.0 => [v0.1.1](https://github.com/ckeditor/ckeditor5-editor-inline/releases/tag/v0.1.1)
* [@ckeditor/ckeditor5-enter](https://www.npmjs.com/package/@ckeditor/ckeditor5-enter): v0.9.0 => [v0.9.1](https://github.com/ckeditor/ckeditor5-enter/releases/tag/v0.9.1)
* [@ckeditor/ckeditor5-heading](https://www.npmjs.com/package/@ckeditor/ckeditor5-heading): v0.9.0 => [v0.9.1](https://github.com/ckeditor/ckeditor5-heading/releases/tag/v0.9.1)
* [@ckeditor/ckeditor5-list](https://www.npmjs.com/package/@ckeditor/ckeditor5-list): v0.6.0 => [v0.6.1](https://github.com/ckeditor/ckeditor5-list/releases/tag/v0.6.1)
* [@ckeditor/ckeditor5-markdown-gfm](https://www.npmjs.com/package/@ckeditor/ckeditor5-markdown-gfm): v0.4.2 => [v0.4.3](https://github.com/ckeditor/ckeditor5-markdown-gfm/releases/tag/v0.4.3)
* [@ckeditor/ckeditor5-presets](https://www.npmjs.com/package/@ckeditor/ckeditor5-presets): v0.2.1 => [v0.2.2](https://github.com/ckeditor/ckeditor5-presets/releases/tag/v0.2.2)
* [@ckeditor/ckeditor5-typing](https://www.npmjs.com/package/@ckeditor/ckeditor5-typing): v0.9.0 => [v0.9.1](https://github.com/ckeditor/ckeditor5-typing/releases/tag/v0.9.1)
* [@ckeditor/ckeditor5-undo](https://www.npmjs.com/package/@ckeditor/ckeditor5-undo): v0.8.0 => [v0.8.1](https://github.com/ckeditor/ckeditor5-undo/releases/tag/v0.8.1)
* [@ckeditor/ckeditor5-utils](https://www.npmjs.com/package/@ckeditor/ckeditor5-utils): v0.9.0 => [v0.9.1](https://github.com/ckeditor/ckeditor5-utils/releases/tag/v0.9.1)
* [@ckeditor/ckeditor5-widget](https://www.npmjs.com/package/@ckeditor/ckeditor5-widget): v0.1.0 => [v0.1.1](https://github.com/ckeditor/ckeditor5-widget/releases/tag/v0.1.1)


## [0.9.0](https://github.com/ckeditor/ckeditor5/compare/v0.8.0...v0.9.0) (2017-04-05)

New packages:

* [@ckeditor/ckeditor5-block-quote](https://www.npmjs.com/package/@ckeditor/ckeditor5-block-quote): [v0.1.0](https://github.com/ckeditor/ckeditor5-block-quote/releases/tag/v0.1.0)
* [@ckeditor/ckeditor5-build-classic](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-classic): [v0.1.0](https://github.com/ckeditor/ckeditor5-build-classic/releases/tag/v0.1.0)
* [@ckeditor/ckeditor5-editor-inline](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-inline): [v0.1.0](https://github.com/ckeditor/ckeditor5-editor-inline/releases/tag/v0.1.0)
* [@ckeditor/ckeditor5-widget](https://www.npmjs.com/package/@ckeditor/ckeditor5-widget): [v0.1.0](https://github.com/ckeditor/ckeditor5-widget/releases/tag/v0.1.0)

Minor releases (possible breaking changes):

* [@ckeditor/ckeditor5-autoformat](https://www.npmjs.com/package/@ckeditor/ckeditor5-autoformat): v0.4.1 => [v0.5.0](https://github.com/ckeditor/ckeditor5-autoformat/releases/tag/v0.5.0)
* [@ckeditor/ckeditor5-basic-styles](https://www.npmjs.com/package/@ckeditor/ckeditor5-basic-styles): v0.7.1 => [v0.8.0](https://github.com/ckeditor/ckeditor5-basic-styles/releases/tag/v0.8.0)
* [@ckeditor/ckeditor5-clipboard](https://www.npmjs.com/package/@ckeditor/ckeditor5-clipboard): v0.4.1 => [v0.5.0](https://github.com/ckeditor/ckeditor5-clipboard/releases/tag/v0.5.0)
* [@ckeditor/ckeditor5-core](https://www.npmjs.com/package/@ckeditor/ckeditor5-core): v0.7.0 => [v0.8.0](https://github.com/ckeditor/ckeditor5-core/releases/tag/v0.8.0)
* [@ckeditor/ckeditor5-engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine): v0.8.0 => [v0.9.0](https://github.com/ckeditor/ckeditor5-engine/releases/tag/v0.9.0)
* [@ckeditor/ckeditor5-enter](https://www.npmjs.com/package/@ckeditor/ckeditor5-enter): v0.8.0 => [v0.9.0](https://github.com/ckeditor/ckeditor5-enter/releases/tag/v0.9.0)
* [@ckeditor/ckeditor5-heading](https://www.npmjs.com/package/@ckeditor/ckeditor5-heading): v0.8.0 => [v0.9.0](https://github.com/ckeditor/ckeditor5-heading/releases/tag/v0.9.0)
* [@ckeditor/ckeditor5-image](https://www.npmjs.com/package/@ckeditor/ckeditor5-image): v0.4.0 => [v0.5.0](https://github.com/ckeditor/ckeditor5-image/releases/tag/v0.5.0)
* [@ckeditor/ckeditor5-link](https://www.npmjs.com/package/@ckeditor/ckeditor5-link): v0.5.1 => [v0.6.0](https://github.com/ckeditor/ckeditor5-link/releases/tag/v0.6.0)
* [@ckeditor/ckeditor5-list](https://www.npmjs.com/package/@ckeditor/ckeditor5-list): v0.5.1 => [v0.6.0](https://github.com/ckeditor/ckeditor5-list/releases/tag/v0.6.0)
* [@ckeditor/ckeditor5-paragraph](https://www.npmjs.com/package/@ckeditor/ckeditor5-paragraph): v0.6.1 => [v0.7.0](https://github.com/ckeditor/ckeditor5-paragraph/releases/tag/v0.7.0)
* [@ckeditor/ckeditor5-presets](https://www.npmjs.com/package/@ckeditor/ckeditor5-presets): v0.1.1 => [v0.2.0](https://github.com/ckeditor/ckeditor5-presets/releases/tag/v0.2.0)
* [@ckeditor/ckeditor5-theme-lark](https://www.npmjs.com/package/@ckeditor/ckeditor5-theme-lark): v0.6.1 => [v0.7.0](https://github.com/ckeditor/ckeditor5-theme-lark/releases/tag/v0.7.0)
* [@ckeditor/ckeditor5-typing](https://www.npmjs.com/package/@ckeditor/ckeditor5-typing): v0.8.0 => [v0.9.0](https://github.com/ckeditor/ckeditor5-typing/releases/tag/v0.9.0)
* [@ckeditor/ckeditor5-ui](https://www.npmjs.com/package/@ckeditor/ckeditor5-ui): v0.7.1 => [v0.8.0](https://github.com/ckeditor/ckeditor5-ui/releases/tag/v0.8.0)
* [@ckeditor/ckeditor5-undo](https://www.npmjs.com/package/@ckeditor/ckeditor5-undo): v0.7.1 => [v0.8.0](https://github.com/ckeditor/ckeditor5-undo/releases/tag/v0.8.0)
* [@ckeditor/ckeditor5-utils](https://www.npmjs.com/package/@ckeditor/ckeditor5-utils): v0.8.0 => [v0.9.0](https://github.com/ckeditor/ckeditor5-utils/releases/tag/v0.9.0)

Patch releases (bug fixes, internal changes):

* [@ckeditor/ckeditor5-editor-classic](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-classic): v0.7.1 => [v0.7.2](https://github.com/ckeditor/ckeditor5-editor-classic/releases/tag/v0.7.2)
* [@ckeditor/ckeditor5-markdown-gfm](https://www.npmjs.com/package/@ckeditor/ckeditor5-markdown-gfm): v0.4.1 => [v0.4.2](https://github.com/ckeditor/ckeditor5-markdown-gfm/releases/tag/v0.4.2)


## [0.8.0](https://github.com/ckeditor/ckeditor5/compare/v0.7.0...v0.8.0) (2017-03-06)

New packages:

* [@ckeditor/ckeditor5-presets](https://www.npmjs.com/package/@ckeditor/ckeditor5-presets): [v0.1.1](https://github.com/ckeditor/ckeditor5-presets/releases/tag/v0.1.1)

Minor releases (possible breaking changes):

* [@ckeditor/ckeditor5-core](https://www.npmjs.com/package/@ckeditor/ckeditor5-core): v0.6.0 => [v0.7.0](https://github.com/ckeditor/ckeditor5-core/releases/tag/v0.7.0)
* [@ckeditor/ckeditor5-engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine): v0.7.0 => [v0.8.0](https://github.com/ckeditor/ckeditor5-engine/releases/tag/v0.8.0)
* [@ckeditor/ckeditor5-enter](https://www.npmjs.com/package/@ckeditor/ckeditor5-enter): v0.7.0 => [v0.8.0](https://github.com/ckeditor/ckeditor5-enter/releases/tag/v0.8.0)
* [@ckeditor/ckeditor5-heading](https://www.npmjs.com/package/@ckeditor/ckeditor5-heading): v0.7.0 => [v0.8.0](https://github.com/ckeditor/ckeditor5-heading/releases/tag/v0.8.0)
* [@ckeditor/ckeditor5-image](https://www.npmjs.com/package/@ckeditor/ckeditor5-image): v0.3.0 => [v0.4.0](https://github.com/ckeditor/ckeditor5-image/releases/tag/v0.4.0)
* [@ckeditor/ckeditor5-typing](https://www.npmjs.com/package/@ckeditor/ckeditor5-typing): v0.7.0 => [v0.8.0](https://github.com/ckeditor/ckeditor5-typing/releases/tag/v0.8.0)
* [@ckeditor/ckeditor5-utils](https://www.npmjs.com/package/@ckeditor/ckeditor5-utils): v0.7.0 => [v0.8.0](https://github.com/ckeditor/ckeditor5-utils/releases/tag/v0.8.0)

Patch releases (bug fixes, internal changes):

* [@ckeditor/ckeditor5-autoformat](https://www.npmjs.com/package/@ckeditor/ckeditor5-autoformat): v0.4.0 => [v0.4.1](https://github.com/ckeditor/ckeditor5-autoformat/releases/tag/v0.4.1)
* [@ckeditor/ckeditor5-basic-styles](https://www.npmjs.com/package/@ckeditor/ckeditor5-basic-styles): v0.7.0 => [v0.7.1](https://github.com/ckeditor/ckeditor5-basic-styles/releases/tag/v0.7.1)
* [@ckeditor/ckeditor5-clipboard](https://www.npmjs.com/package/@ckeditor/ckeditor5-clipboard): v0.4.0 => [v0.4.1](https://github.com/ckeditor/ckeditor5-clipboard/releases/tag/v0.4.1)
* [@ckeditor/ckeditor5-editor-classic](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-classic): v0.7.0 => [v0.7.1](https://github.com/ckeditor/ckeditor5-editor-classic/releases/tag/v0.7.1)
* [@ckeditor/ckeditor5-link](https://www.npmjs.com/package/@ckeditor/ckeditor5-link): v0.5.0 => [v0.5.1](https://github.com/ckeditor/ckeditor5-link/releases/tag/v0.5.1)
* [@ckeditor/ckeditor5-list](https://www.npmjs.com/package/@ckeditor/ckeditor5-list): v0.5.0 => [v0.5.1](https://github.com/ckeditor/ckeditor5-list/releases/tag/v0.5.1)
* [@ckeditor/ckeditor5-markdown-gfm](https://www.npmjs.com/package/@ckeditor/ckeditor5-markdown-gfm): v0.4.0 => [v0.4.1](https://github.com/ckeditor/ckeditor5-markdown-gfm/releases/tag/v0.4.1)
* [@ckeditor/ckeditor5-paragraph](https://www.npmjs.com/package/@ckeditor/ckeditor5-paragraph): v0.6.0 => [v0.6.1](https://github.com/ckeditor/ckeditor5-paragraph/releases/tag/v0.6.1)
* [@ckeditor/ckeditor5-theme-lark](https://www.npmjs.com/package/@ckeditor/ckeditor5-theme-lark): v0.6.0 => [v0.6.1](https://github.com/ckeditor/ckeditor5-theme-lark/releases/tag/v0.6.1)
* [@ckeditor/ckeditor5-ui](https://www.npmjs.com/package/@ckeditor/ckeditor5-ui): v0.7.0 => [v0.7.1](https://github.com/ckeditor/ckeditor5-ui/releases/tag/v0.7.1)
* [@ckeditor/ckeditor5-undo](https://www.npmjs.com/package/@ckeditor/ckeditor5-undo): v0.7.0 => [v0.7.1](https://github.com/ckeditor/ckeditor5-undo/releases/tag/v0.7.1)
