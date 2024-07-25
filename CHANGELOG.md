Changelog
=========

## [42.0.2](https://github.com/ckeditor/ckeditor5/compare/v42.0.1...v42.0.2) (July 25, 2024)

We are happy to announce the release of CKEditor 5 v42.0.2.

### Release highlights

This is a patch release that includes the following bug fixes for new installation methods introduced in v42.0.0:

* Fixed type definitions for the imports used in the [optimized build](https://ckeditor.com/docs/ckeditor5/latest/getting-started/setup/optimizing-build-size.html) (see [#16684](https://github.com/ckeditor/ckeditor5/issues/16684)).
* Fixed minor issues with the `ckeditor5-editor.css`, `ckeditor5-content.css`, and other [optimized style sheets](https://ckeditor.com/docs/ckeditor5/latest/getting-started/setup/css.html#optimizing-the-size-of-style-sheets) (see [#16703](https://github.com/ckeditor/ckeditor5/issues/16703)).
* Fixed issues with installing and loading the CKEditor 5 packages using Yarn PnP (see [#16646](https://github.com/ckeditor/ckeditor5/issues/16646)).
* Fixed issues with loading CSS and translation files with older bundlers, such as Vite 2 and Vite 3 (see [#16638](https://github.com/ckeditor/ckeditor5/issues/16638)).

Additionally, we fixed some performance issues in the track changes plugin. The editing experience was heavily affected if there were many (hundreds or more) suggestions in the document. This was a regression introduced in v41.0.0.

### Bug fixes

* **[ckeditor5](https://www.npmjs.com/package/ckeditor5)**: Changed the path to the types in the `package.json`. See [#16684](https://github.com/ckeditor/ckeditor5/issues/16684). ([commit](https://github.com/ckeditor/ckeditor5/commit/9993a2edb5b614be0471970cf7ba034fc52682a0))
* **[ckeditor5](https://www.npmjs.com/package/ckeditor5)**: Updated the `exports` field in `package.json` to fix issues with loading CSS and translations in older bundlers. See [#16638](https://github.com/ckeditor/ckeditor5/issues/16638). ([commit](https://github.com/ckeditor/ckeditor5/commit/84660803ae3273d75afea09ffe57237d2612c3f9))
* **[ckeditor5-premium-features](https://www.npmjs.com/package/@ckeditor/ckeditor5-ckeditor5-premium-features)**: Changed the path to the types in the `package.json`.
* **[ckeditor5-premium-features](https://www.npmjs.com/package/@ckeditor/ckeditor5-ckeditor5-premium-features)**: Updated the `exports` field in `package.json` to fix issues with loading CSS and translations in older bundlers.
* Added dependencies used in the new `dist` folder as production `dependencies` instead of `devDependencies`. Related to [#16646](https://github.com/ckeditor/ckeditor5/issues/16646). ([commit](https://github.com/ckeditor/ckeditor5/commit/9993a2edb5b614be0471970cf7ba034fc52682a0))

### Other changes

* **[track-changes](https://www.npmjs.com/package/@ckeditor/ckeditor5-track-changes)**: Performance fixes for scenarios where hundreds of suggestions exist in the document.

### Released packages

Check out the [Versioning policy](https://ckeditor.com/docs/ckeditor5/latest/framework/guides/support/versioning-policy.html) guide for more information.

<details>
<summary>Released packages (summary)</summary>

Other releases:

* [@ckeditor/ckeditor5-adapter-ckfinder](https://www.npmjs.com/package/@ckeditor/ckeditor5-adapter-ckfinder/v/42.0.2): v42.0.1 => v42.0.2
* [@ckeditor/ckeditor5-ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai/v/42.0.2): v42.0.1 => v42.0.2
* [@ckeditor/ckeditor5-alignment](https://www.npmjs.com/package/@ckeditor/ckeditor5-alignment/v/42.0.2): v42.0.1 => v42.0.2
* [@ckeditor/ckeditor5-autoformat](https://www.npmjs.com/package/@ckeditor/ckeditor5-autoformat/v/42.0.2): v42.0.1 => v42.0.2
* [@ckeditor/ckeditor5-autosave](https://www.npmjs.com/package/@ckeditor/ckeditor5-autosave/v/42.0.2): v42.0.1 => v42.0.2
* [@ckeditor/ckeditor5-basic-styles](https://www.npmjs.com/package/@ckeditor/ckeditor5-basic-styles/v/42.0.2): v42.0.1 => v42.0.2
* [@ckeditor/ckeditor5-block-quote](https://www.npmjs.com/package/@ckeditor/ckeditor5-block-quote/v/42.0.2): v42.0.1 => v42.0.2
* [@ckeditor/ckeditor5-build-balloon](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-balloon/v/42.0.2): v42.0.1 => v42.0.2
* [@ckeditor/ckeditor5-build-balloon-block](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-balloon-block/v/42.0.2): v42.0.1 => v42.0.2
* [@ckeditor/ckeditor5-build-classic](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-classic/v/42.0.2): v42.0.1 => v42.0.2
* [@ckeditor/ckeditor5-build-decoupled-document](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-decoupled-document/v/42.0.2): v42.0.1 => v42.0.2
* [@ckeditor/ckeditor5-build-inline](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-inline/v/42.0.2): v42.0.1 => v42.0.2
* [@ckeditor/ckeditor5-build-multi-root](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-multi-root/v/42.0.2): v42.0.1 => v42.0.2
* [@ckeditor/ckeditor5-case-change](https://www.npmjs.com/package/@ckeditor/ckeditor5-case-change/v/42.0.2): v42.0.1 => v42.0.2
* [@ckeditor/ckeditor5-ckbox](https://www.npmjs.com/package/@ckeditor/ckeditor5-ckbox/v/42.0.2): v42.0.1 => v42.0.2
* [@ckeditor/ckeditor5-ckfinder](https://www.npmjs.com/package/@ckeditor/ckeditor5-ckfinder/v/42.0.2): v42.0.1 => v42.0.2
* [@ckeditor/ckeditor5-clipboard](https://www.npmjs.com/package/@ckeditor/ckeditor5-clipboard/v/42.0.2): v42.0.1 => v42.0.2
* [@ckeditor/ckeditor5-cloud-services](https://www.npmjs.com/package/@ckeditor/ckeditor5-cloud-services/v/42.0.2): v42.0.1 => v42.0.2
* [@ckeditor/ckeditor5-code-block](https://www.npmjs.com/package/@ckeditor/ckeditor5-code-block/v/42.0.2): v42.0.1 => v42.0.2
* [@ckeditor/ckeditor5-collaboration-core](https://www.npmjs.com/package/@ckeditor/ckeditor5-collaboration-core/v/42.0.2): v42.0.1 => v42.0.2
* [@ckeditor/ckeditor5-comments](https://www.npmjs.com/package/@ckeditor/ckeditor5-comments/v/42.0.2): v42.0.1 => v42.0.2
* [@ckeditor/ckeditor5-core](https://www.npmjs.com/package/@ckeditor/ckeditor5-core/v/42.0.2): v42.0.1 => v42.0.2
* [@ckeditor/ckeditor5-document-outline](https://www.npmjs.com/package/@ckeditor/ckeditor5-document-outline/v/42.0.2): v42.0.1 => v42.0.2
* [@ckeditor/ckeditor5-easy-image](https://www.npmjs.com/package/@ckeditor/ckeditor5-easy-image/v/42.0.2): v42.0.1 => v42.0.2
* [@ckeditor/ckeditor5-editor-balloon](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-balloon/v/42.0.2): v42.0.1 => v42.0.2
* [@ckeditor/ckeditor5-editor-classic](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-classic/v/42.0.2): v42.0.1 => v42.0.2
* [@ckeditor/ckeditor5-editor-decoupled](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-decoupled/v/42.0.2): v42.0.1 => v42.0.2
* [@ckeditor/ckeditor5-editor-inline](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-inline/v/42.0.2): v42.0.1 => v42.0.2
* [@ckeditor/ckeditor5-editor-multi-root](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-multi-root/v/42.0.2): v42.0.1 => v42.0.2
* [@ckeditor/ckeditor5-engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine/v/42.0.2): v42.0.1 => v42.0.2
* [@ckeditor/ckeditor5-enter](https://www.npmjs.com/package/@ckeditor/ckeditor5-enter/v/42.0.2): v42.0.1 => v42.0.2
* [@ckeditor/ckeditor5-essentials](https://www.npmjs.com/package/@ckeditor/ckeditor5-essentials/v/42.0.2): v42.0.1 => v42.0.2
* [@ckeditor/ckeditor5-export-pdf](https://www.npmjs.com/package/@ckeditor/ckeditor5-export-pdf/v/42.0.2): v42.0.1 => v42.0.2
* [@ckeditor/ckeditor5-export-word](https://www.npmjs.com/package/@ckeditor/ckeditor5-export-word/v/42.0.2): v42.0.1 => v42.0.2
* [@ckeditor/ckeditor5-find-and-replace](https://www.npmjs.com/package/@ckeditor/ckeditor5-find-and-replace/v/42.0.2): v42.0.1 => v42.0.2
* [@ckeditor/ckeditor5-font](https://www.npmjs.com/package/@ckeditor/ckeditor5-font/v/42.0.2): v42.0.1 => v42.0.2
* [@ckeditor/ckeditor5-format-painter](https://www.npmjs.com/package/@ckeditor/ckeditor5-format-painter/v/42.0.2): v42.0.1 => v42.0.2
* [@ckeditor/ckeditor5-heading](https://www.npmjs.com/package/@ckeditor/ckeditor5-heading/v/42.0.2): v42.0.1 => v42.0.2
* [@ckeditor/ckeditor5-highlight](https://www.npmjs.com/package/@ckeditor/ckeditor5-highlight/v/42.0.2): v42.0.1 => v42.0.2
* [@ckeditor/ckeditor5-horizontal-line](https://www.npmjs.com/package/@ckeditor/ckeditor5-horizontal-line/v/42.0.2): v42.0.1 => v42.0.2
* [@ckeditor/ckeditor5-html-embed](https://www.npmjs.com/package/@ckeditor/ckeditor5-html-embed/v/42.0.2): v42.0.1 => v42.0.2
* [@ckeditor/ckeditor5-html-support](https://www.npmjs.com/package/@ckeditor/ckeditor5-html-support/v/42.0.2): v42.0.1 => v42.0.2
* [@ckeditor/ckeditor5-image](https://www.npmjs.com/package/@ckeditor/ckeditor5-image/v/42.0.2): v42.0.1 => v42.0.2
* [@ckeditor/ckeditor5-import-word](https://www.npmjs.com/package/@ckeditor/ckeditor5-import-word/v/42.0.2): v42.0.1 => v42.0.2
* [@ckeditor/ckeditor5-indent](https://www.npmjs.com/package/@ckeditor/ckeditor5-indent/v/42.0.2): v42.0.1 => v42.0.2
* [@ckeditor/ckeditor5-language](https://www.npmjs.com/package/@ckeditor/ckeditor5-language/v/42.0.2): v42.0.1 => v42.0.2
* [@ckeditor/ckeditor5-link](https://www.npmjs.com/package/@ckeditor/ckeditor5-link/v/42.0.2): v42.0.1 => v42.0.2
* [@ckeditor/ckeditor5-list](https://www.npmjs.com/package/@ckeditor/ckeditor5-list/v/42.0.2): v42.0.1 => v42.0.2
* [@ckeditor/ckeditor5-list-multi-level](https://www.npmjs.com/package/@ckeditor/ckeditor5-list-multi-level/v/42.0.2): v42.0.1 => v42.0.2
* [@ckeditor/ckeditor5-markdown-gfm](https://www.npmjs.com/package/@ckeditor/ckeditor5-markdown-gfm/v/42.0.2): v42.0.1 => v42.0.2
* [@ckeditor/ckeditor5-media-embed](https://www.npmjs.com/package/@ckeditor/ckeditor5-media-embed/v/42.0.2): v42.0.1 => v42.0.2
* [@ckeditor/ckeditor5-mention](https://www.npmjs.com/package/@ckeditor/ckeditor5-mention/v/42.0.2): v42.0.1 => v42.0.2
* [@ckeditor/ckeditor5-minimap](https://www.npmjs.com/package/@ckeditor/ckeditor5-minimap/v/42.0.2): v42.0.1 => v42.0.2
* [@ckeditor/ckeditor5-operations-compressor](https://www.npmjs.com/package/@ckeditor/ckeditor5-operations-compressor/v/42.0.2): v42.0.1 => v42.0.2
* [@ckeditor/ckeditor5-page-break](https://www.npmjs.com/package/@ckeditor/ckeditor5-page-break/v/42.0.2): v42.0.1 => v42.0.2
* [@ckeditor/ckeditor5-pagination](https://www.npmjs.com/package/@ckeditor/ckeditor5-pagination/v/42.0.2): v42.0.1 => v42.0.2
* [@ckeditor/ckeditor5-paragraph](https://www.npmjs.com/package/@ckeditor/ckeditor5-paragraph/v/42.0.2): v42.0.1 => v42.0.2
* [@ckeditor/ckeditor5-paste-from-office](https://www.npmjs.com/package/@ckeditor/ckeditor5-paste-from-office/v/42.0.2): v42.0.1 => v42.0.2
* [@ckeditor/ckeditor5-paste-from-office-enhanced](https://www.npmjs.com/package/@ckeditor/ckeditor5-paste-from-office-enhanced/v/42.0.2): v42.0.1 => v42.0.2
* [@ckeditor/ckeditor5-real-time-collaboration](https://www.npmjs.com/package/@ckeditor/ckeditor5-real-time-collaboration/v/42.0.2): v42.0.1 => v42.0.2
* [@ckeditor/ckeditor5-remove-format](https://www.npmjs.com/package/@ckeditor/ckeditor5-remove-format/v/42.0.2): v42.0.1 => v42.0.2
* [@ckeditor/ckeditor5-restricted-editing](https://www.npmjs.com/package/@ckeditor/ckeditor5-restricted-editing/v/42.0.2): v42.0.1 => v42.0.2
* [@ckeditor/ckeditor5-revision-history](https://www.npmjs.com/package/@ckeditor/ckeditor5-revision-history/v/42.0.2): v42.0.1 => v42.0.2
* [@ckeditor/ckeditor5-select-all](https://www.npmjs.com/package/@ckeditor/ckeditor5-select-all/v/42.0.2): v42.0.1 => v42.0.2
* [@ckeditor/ckeditor5-show-blocks](https://www.npmjs.com/package/@ckeditor/ckeditor5-show-blocks/v/42.0.2): v42.0.1 => v42.0.2
* [@ckeditor/ckeditor5-slash-command](https://www.npmjs.com/package/@ckeditor/ckeditor5-slash-command/v/42.0.2): v42.0.1 => v42.0.2
* [@ckeditor/ckeditor5-source-editing](https://www.npmjs.com/package/@ckeditor/ckeditor5-source-editing/v/42.0.2): v42.0.1 => v42.0.2
* [@ckeditor/ckeditor5-special-characters](https://www.npmjs.com/package/@ckeditor/ckeditor5-special-characters/v/42.0.2): v42.0.1 => v42.0.2
* [@ckeditor/ckeditor5-style](https://www.npmjs.com/package/@ckeditor/ckeditor5-style/v/42.0.2): v42.0.1 => v42.0.2
* [@ckeditor/ckeditor5-table](https://www.npmjs.com/package/@ckeditor/ckeditor5-table/v/42.0.2): v42.0.1 => v42.0.2
* [@ckeditor/ckeditor5-template](https://www.npmjs.com/package/@ckeditor/ckeditor5-template/v/42.0.2): v42.0.1 => v42.0.2
* [@ckeditor/ckeditor5-theme-lark](https://www.npmjs.com/package/@ckeditor/ckeditor5-theme-lark/v/42.0.2): v42.0.1 => v42.0.2
* [@ckeditor/ckeditor5-track-changes](https://www.npmjs.com/package/@ckeditor/ckeditor5-track-changes/v/42.0.2): v42.0.1 => v42.0.2
* [@ckeditor/ckeditor5-typing](https://www.npmjs.com/package/@ckeditor/ckeditor5-typing/v/42.0.2): v42.0.1 => v42.0.2
* [@ckeditor/ckeditor5-ui](https://www.npmjs.com/package/@ckeditor/ckeditor5-ui/v/42.0.2): v42.0.1 => v42.0.2
* [@ckeditor/ckeditor5-undo](https://www.npmjs.com/package/@ckeditor/ckeditor5-undo/v/42.0.2): v42.0.1 => v42.0.2
* [@ckeditor/ckeditor5-upload](https://www.npmjs.com/package/@ckeditor/ckeditor5-upload/v/42.0.2): v42.0.1 => v42.0.2
* [@ckeditor/ckeditor5-utils](https://www.npmjs.com/package/@ckeditor/ckeditor5-utils/v/42.0.2): v42.0.1 => v42.0.2
* [@ckeditor/ckeditor5-watchdog](https://www.npmjs.com/package/@ckeditor/ckeditor5-watchdog/v/42.0.2): v42.0.1 => v42.0.2
* [@ckeditor/ckeditor5-widget](https://www.npmjs.com/package/@ckeditor/ckeditor5-widget/v/42.0.2): v42.0.1 => v42.0.2
* [@ckeditor/ckeditor5-word-count](https://www.npmjs.com/package/@ckeditor/ckeditor5-word-count/v/42.0.2): v42.0.1 => v42.0.2
* [ckeditor5-collaboration](https://www.npmjs.com/package/ckeditor5-collaboration/v/42.0.2): v42.0.1 => v42.0.2
* [ckeditor5-premium-features](https://www.npmjs.com/package/ckeditor5-premium-features/v/42.0.2): v42.0.1 => v42.0.2
</details>


## [42.0.1](https://github.com/ckeditor/ckeditor5/compare/v42.0.0...v42.0.1) (July 11, 2024)

We are happy to announce the release of CKEditor 5 v42.0.1.

### Release highlights

This is a patch release that fixes issues with `ckeditor5-editor.css` and other editor-only stylesheets that contained extra newline characters causing incorrect syntax reported in [ckeditor/ckeditor5#16670](https://github.com/ckeditor/ckeditor5/issues/16670).

Additionally, if you maintain custom CKEditor 5 plugins and [migrated them to the new package generator](https://ckeditor.com/docs/ckeditor5/latest/updating/nim-migration/custom-plugins.html), you should update [`@ckeditor/ckeditor5-dev-build-tools`](https://www.npmjs.com/package/@ckeditor/ckeditor5-dev-build-tools) to the latest version to avoid this problem in your plugin.


### Released packages

Check out the [Versioning policy](https://ckeditor.com/docs/ckeditor5/latest/framework/guides/support/versioning-policy.html) guide for more information.

<details>
<summary>Released packages (summary)</summary>

Other releases:

* [@ckeditor/ckeditor5-adapter-ckfinder](https://www.npmjs.com/package/@ckeditor/ckeditor5-adapter-ckfinder/v/42.0.1): v42.0.0 => v42.0.1
* [@ckeditor/ckeditor5-ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai/v/42.0.1): v42.0.0 => v42.0.1
* [@ckeditor/ckeditor5-alignment](https://www.npmjs.com/package/@ckeditor/ckeditor5-alignment/v/42.0.1): v42.0.0 => v42.0.1
* [@ckeditor/ckeditor5-autoformat](https://www.npmjs.com/package/@ckeditor/ckeditor5-autoformat/v/42.0.1): v42.0.0 => v42.0.1
* [@ckeditor/ckeditor5-autosave](https://www.npmjs.com/package/@ckeditor/ckeditor5-autosave/v/42.0.1): v42.0.0 => v42.0.1
* [@ckeditor/ckeditor5-basic-styles](https://www.npmjs.com/package/@ckeditor/ckeditor5-basic-styles/v/42.0.1): v42.0.0 => v42.0.1
* [@ckeditor/ckeditor5-block-quote](https://www.npmjs.com/package/@ckeditor/ckeditor5-block-quote/v/42.0.1): v42.0.0 => v42.0.1
* [@ckeditor/ckeditor5-build-balloon](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-balloon/v/42.0.1): v42.0.0 => v42.0.1
* [@ckeditor/ckeditor5-build-balloon-block](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-balloon-block/v/42.0.1): v42.0.0 => v42.0.1
* [@ckeditor/ckeditor5-build-classic](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-classic/v/42.0.1): v42.0.0 => v42.0.1
* [@ckeditor/ckeditor5-build-decoupled-document](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-decoupled-document/v/42.0.1): v42.0.0 => v42.0.1
* [@ckeditor/ckeditor5-build-inline](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-inline/v/42.0.1): v42.0.0 => v42.0.1
* [@ckeditor/ckeditor5-build-multi-root](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-multi-root/v/42.0.1): v42.0.0 => v42.0.1
* [@ckeditor/ckeditor5-case-change](https://www.npmjs.com/package/@ckeditor/ckeditor5-case-change/v/42.0.1): v42.0.0 => v42.0.1
* [@ckeditor/ckeditor5-ckbox](https://www.npmjs.com/package/@ckeditor/ckeditor5-ckbox/v/42.0.1): v42.0.0 => v42.0.1
* [@ckeditor/ckeditor5-ckfinder](https://www.npmjs.com/package/@ckeditor/ckeditor5-ckfinder/v/42.0.1): v42.0.0 => v42.0.1
* [@ckeditor/ckeditor5-clipboard](https://www.npmjs.com/package/@ckeditor/ckeditor5-clipboard/v/42.0.1): v42.0.0 => v42.0.1
* [@ckeditor/ckeditor5-cloud-services](https://www.npmjs.com/package/@ckeditor/ckeditor5-cloud-services/v/42.0.1): v42.0.0 => v42.0.1
* [@ckeditor/ckeditor5-code-block](https://www.npmjs.com/package/@ckeditor/ckeditor5-code-block/v/42.0.1): v42.0.0 => v42.0.1
* [@ckeditor/ckeditor5-collaboration-core](https://www.npmjs.com/package/@ckeditor/ckeditor5-collaboration-core/v/42.0.1): v42.0.0 => v42.0.1
* [@ckeditor/ckeditor5-comments](https://www.npmjs.com/package/@ckeditor/ckeditor5-comments/v/42.0.1): v42.0.0 => v42.0.1
* [@ckeditor/ckeditor5-core](https://www.npmjs.com/package/@ckeditor/ckeditor5-core/v/42.0.1): v42.0.0 => v42.0.1
* [@ckeditor/ckeditor5-document-outline](https://www.npmjs.com/package/@ckeditor/ckeditor5-document-outline/v/42.0.1): v42.0.0 => v42.0.1
* [@ckeditor/ckeditor5-easy-image](https://www.npmjs.com/package/@ckeditor/ckeditor5-easy-image/v/42.0.1): v42.0.0 => v42.0.1
* [@ckeditor/ckeditor5-editor-balloon](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-balloon/v/42.0.1): v42.0.0 => v42.0.1
* [@ckeditor/ckeditor5-editor-classic](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-classic/v/42.0.1): v42.0.0 => v42.0.1
* [@ckeditor/ckeditor5-editor-decoupled](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-decoupled/v/42.0.1): v42.0.0 => v42.0.1
* [@ckeditor/ckeditor5-editor-inline](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-inline/v/42.0.1): v42.0.0 => v42.0.1
* [@ckeditor/ckeditor5-editor-multi-root](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-multi-root/v/42.0.1): v42.0.0 => v42.0.1
* [@ckeditor/ckeditor5-engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine/v/42.0.1): v42.0.0 => v42.0.1
* [@ckeditor/ckeditor5-enter](https://www.npmjs.com/package/@ckeditor/ckeditor5-enter/v/42.0.1): v42.0.0 => v42.0.1
* [@ckeditor/ckeditor5-essentials](https://www.npmjs.com/package/@ckeditor/ckeditor5-essentials/v/42.0.1): v42.0.0 => v42.0.1
* [@ckeditor/ckeditor5-export-pdf](https://www.npmjs.com/package/@ckeditor/ckeditor5-export-pdf/v/42.0.1): v42.0.0 => v42.0.1
* [@ckeditor/ckeditor5-export-word](https://www.npmjs.com/package/@ckeditor/ckeditor5-export-word/v/42.0.1): v42.0.0 => v42.0.1
* [@ckeditor/ckeditor5-find-and-replace](https://www.npmjs.com/package/@ckeditor/ckeditor5-find-and-replace/v/42.0.1): v42.0.0 => v42.0.1
* [@ckeditor/ckeditor5-font](https://www.npmjs.com/package/@ckeditor/ckeditor5-font/v/42.0.1): v42.0.0 => v42.0.1
* [@ckeditor/ckeditor5-format-painter](https://www.npmjs.com/package/@ckeditor/ckeditor5-format-painter/v/42.0.1): v42.0.0 => v42.0.1
* [@ckeditor/ckeditor5-heading](https://www.npmjs.com/package/@ckeditor/ckeditor5-heading/v/42.0.1): v42.0.0 => v42.0.1
* [@ckeditor/ckeditor5-highlight](https://www.npmjs.com/package/@ckeditor/ckeditor5-highlight/v/42.0.1): v42.0.0 => v42.0.1
* [@ckeditor/ckeditor5-horizontal-line](https://www.npmjs.com/package/@ckeditor/ckeditor5-horizontal-line/v/42.0.1): v42.0.0 => v42.0.1
* [@ckeditor/ckeditor5-html-embed](https://www.npmjs.com/package/@ckeditor/ckeditor5-html-embed/v/42.0.1): v42.0.0 => v42.0.1
* [@ckeditor/ckeditor5-html-support](https://www.npmjs.com/package/@ckeditor/ckeditor5-html-support/v/42.0.1): v42.0.0 => v42.0.1
* [@ckeditor/ckeditor5-image](https://www.npmjs.com/package/@ckeditor/ckeditor5-image/v/42.0.1): v42.0.0 => v42.0.1
* [@ckeditor/ckeditor5-import-word](https://www.npmjs.com/package/@ckeditor/ckeditor5-import-word/v/42.0.1): v42.0.0 => v42.0.1
* [@ckeditor/ckeditor5-indent](https://www.npmjs.com/package/@ckeditor/ckeditor5-indent/v/42.0.1): v42.0.0 => v42.0.1
* [@ckeditor/ckeditor5-language](https://www.npmjs.com/package/@ckeditor/ckeditor5-language/v/42.0.1): v42.0.0 => v42.0.1
* [@ckeditor/ckeditor5-link](https://www.npmjs.com/package/@ckeditor/ckeditor5-link/v/42.0.1): v42.0.0 => v42.0.1
* [@ckeditor/ckeditor5-list](https://www.npmjs.com/package/@ckeditor/ckeditor5-list/v/42.0.1): v42.0.0 => v42.0.1
* [@ckeditor/ckeditor5-list-multi-level](https://www.npmjs.com/package/@ckeditor/ckeditor5-list-multi-level/v/42.0.1): v42.0.0 => v42.0.1
* [@ckeditor/ckeditor5-markdown-gfm](https://www.npmjs.com/package/@ckeditor/ckeditor5-markdown-gfm/v/42.0.1): v42.0.0 => v42.0.1
* [@ckeditor/ckeditor5-media-embed](https://www.npmjs.com/package/@ckeditor/ckeditor5-media-embed/v/42.0.1): v42.0.0 => v42.0.1
* [@ckeditor/ckeditor5-mention](https://www.npmjs.com/package/@ckeditor/ckeditor5-mention/v/42.0.1): v42.0.0 => v42.0.1
* [@ckeditor/ckeditor5-minimap](https://www.npmjs.com/package/@ckeditor/ckeditor5-minimap/v/42.0.1): v42.0.0 => v42.0.1
* [@ckeditor/ckeditor5-operations-compressor](https://www.npmjs.com/package/@ckeditor/ckeditor5-operations-compressor/v/42.0.1): v42.0.0 => v42.0.1
* [@ckeditor/ckeditor5-page-break](https://www.npmjs.com/package/@ckeditor/ckeditor5-page-break/v/42.0.1): v42.0.0 => v42.0.1
* [@ckeditor/ckeditor5-pagination](https://www.npmjs.com/package/@ckeditor/ckeditor5-pagination/v/42.0.1): v42.0.0 => v42.0.1
* [@ckeditor/ckeditor5-paragraph](https://www.npmjs.com/package/@ckeditor/ckeditor5-paragraph/v/42.0.1): v42.0.0 => v42.0.1
* [@ckeditor/ckeditor5-paste-from-office](https://www.npmjs.com/package/@ckeditor/ckeditor5-paste-from-office/v/42.0.1): v42.0.0 => v42.0.1
* [@ckeditor/ckeditor5-paste-from-office-enhanced](https://www.npmjs.com/package/@ckeditor/ckeditor5-paste-from-office-enhanced/v/42.0.1): v42.0.0 => v42.0.1
* [@ckeditor/ckeditor5-real-time-collaboration](https://www.npmjs.com/package/@ckeditor/ckeditor5-real-time-collaboration/v/42.0.1): v42.0.0 => v42.0.1
* [@ckeditor/ckeditor5-remove-format](https://www.npmjs.com/package/@ckeditor/ckeditor5-remove-format/v/42.0.1): v42.0.0 => v42.0.1
* [@ckeditor/ckeditor5-restricted-editing](https://www.npmjs.com/package/@ckeditor/ckeditor5-restricted-editing/v/42.0.1): v42.0.0 => v42.0.1
* [@ckeditor/ckeditor5-revision-history](https://www.npmjs.com/package/@ckeditor/ckeditor5-revision-history/v/42.0.1): v42.0.0 => v42.0.1
* [@ckeditor/ckeditor5-select-all](https://www.npmjs.com/package/@ckeditor/ckeditor5-select-all/v/42.0.1): v42.0.0 => v42.0.1
* [@ckeditor/ckeditor5-show-blocks](https://www.npmjs.com/package/@ckeditor/ckeditor5-show-blocks/v/42.0.1): v42.0.0 => v42.0.1
* [@ckeditor/ckeditor5-slash-command](https://www.npmjs.com/package/@ckeditor/ckeditor5-slash-command/v/42.0.1): v42.0.0 => v42.0.1
* [@ckeditor/ckeditor5-source-editing](https://www.npmjs.com/package/@ckeditor/ckeditor5-source-editing/v/42.0.1): v42.0.0 => v42.0.1
* [@ckeditor/ckeditor5-special-characters](https://www.npmjs.com/package/@ckeditor/ckeditor5-special-characters/v/42.0.1): v42.0.0 => v42.0.1
* [@ckeditor/ckeditor5-style](https://www.npmjs.com/package/@ckeditor/ckeditor5-style/v/42.0.1): v42.0.0 => v42.0.1
* [@ckeditor/ckeditor5-table](https://www.npmjs.com/package/@ckeditor/ckeditor5-table/v/42.0.1): v42.0.0 => v42.0.1
* [@ckeditor/ckeditor5-template](https://www.npmjs.com/package/@ckeditor/ckeditor5-template/v/42.0.1): v42.0.0 => v42.0.1
* [@ckeditor/ckeditor5-theme-lark](https://www.npmjs.com/package/@ckeditor/ckeditor5-theme-lark/v/42.0.1): v42.0.0 => v42.0.1
* [@ckeditor/ckeditor5-track-changes](https://www.npmjs.com/package/@ckeditor/ckeditor5-track-changes/v/42.0.1): v42.0.0 => v42.0.1
* [@ckeditor/ckeditor5-typing](https://www.npmjs.com/package/@ckeditor/ckeditor5-typing/v/42.0.1): v42.0.0 => v42.0.1
* [@ckeditor/ckeditor5-ui](https://www.npmjs.com/package/@ckeditor/ckeditor5-ui/v/42.0.1): v42.0.0 => v42.0.1
* [@ckeditor/ckeditor5-undo](https://www.npmjs.com/package/@ckeditor/ckeditor5-undo/v/42.0.1): v42.0.0 => v42.0.1
* [@ckeditor/ckeditor5-upload](https://www.npmjs.com/package/@ckeditor/ckeditor5-upload/v/42.0.1): v42.0.0 => v42.0.1
* [@ckeditor/ckeditor5-utils](https://www.npmjs.com/package/@ckeditor/ckeditor5-utils/v/42.0.1): v42.0.0 => v42.0.1
* [@ckeditor/ckeditor5-watchdog](https://www.npmjs.com/package/@ckeditor/ckeditor5-watchdog/v/42.0.1): v42.0.0 => v42.0.1
* [@ckeditor/ckeditor5-widget](https://www.npmjs.com/package/@ckeditor/ckeditor5-widget/v/42.0.1): v42.0.0 => v42.0.1
* [@ckeditor/ckeditor5-word-count](https://www.npmjs.com/package/@ckeditor/ckeditor5-word-count/v/42.0.1): v42.0.0 => v42.0.1
* [ckeditor5-collaboration](https://www.npmjs.com/package/ckeditor5-collaboration/v/42.0.1): v42.0.0 => v42.0.1
* [ckeditor5-premium-features](https://www.npmjs.com/package/ckeditor5-premium-features/v/42.0.1): v42.0.0 => v42.0.1
</details>


## [42.0.0](https://github.com/ckeditor/ckeditor5/compare/v41.4.2...v42.0.0) (June 26, 2024)

We are happy to announce the release of CKEditor 5 v42.0.0

### Release highlights

#### New installation methods

We are excited to announce the latest release of CKEditor 5, bringing major improvements to simplify the installation and setup process. After extensive research and gathering feedback, we have improved the setup methods to enhance the developer experience and align with modern standards.

The most prominent changes:

* All plugins and core features are now available from the unified [`ckeditor5`](https://www.npmjs.com/package/ckeditor5) and [`ckeditor5-premium-features`](https://www.npmjs.com/package/ckeditor5-premium-features) packages, reducing dependency management complexity.
* Our packages became bundler-agnostic. You can use whatever bundler you want (such as Vite or esbuild), to integrate CKEditor 5.
* CSS files are now distributed separately from JavaScript, allowing for parallel downloading, easier customization, and improved performance.
* All the new distribution methods (available via npm, CDN, and ZIP downloads) allow dynamic plugin registration making it easy to add or remove plugins dynamically.

The old installation methods are still supported, but we put them on the deprecation path. Read more about this in our [migration guides](https://ckeditor.com/docs/ckeditor5/latest/updating/nim-migration/migration-to-new-installation-methods.html).

#### New Builder

Along with the new release, we present you the brand new [CKEditor 5 Builder](https://ckeditor.com/ckeditor-5/builder/).

The new Builder allows you to start with one of the predefined presets, customize it by adding and removing features, and observe the changes live in an editor preview (and play with the editor!). Once you are happy with your custom setup, you get ready-to-use code snippets for React, Angular, Vue, and VanillaJS setups for both npm and CDN distributions.

#### Updated documentation

We rewrote large parts of the documentation to complete the picture and ensure consistency across the ecosystem. The entire Getting started section was redesigned to focus on the new installation methods and to better guide the integrator through the ecosystem.

If you need clarification or a more in-depth explanation, please let us know.

#### Migration paths

Finally, detailed [migration guides](https://ckeditor.com/docs/ckeditor5/latest/updating/nim-migration/migration-to-new-installation-methods.html) can be found in our documentation. These guides provide step-by-step instructions and examples to help you seamlessly transition to the new installation methods:

* [Predefined builds migration guide](https://ckeditor.com/docs/ckeditor5/latest/updating/nim-migration/predefined-builds.html).
* [Custom builds migration guide](https://ckeditor.com/docs/ckeditor5/latest/updating/nim-migration/customized-builds.html).
* [DLLs migration guide](https://ckeditor.com/docs/ckeditor5/latest/updating/nim-migration/dll-builds.html).
* [Migration guide for custom plugins published as libraries](https://ckeditor.com/docs/ckeditor5/latest/updating/nim-migration/custom-plugins.html).

We value your input, so please share your experiences, ask questions, and provide feedback to help us refine these changes. Join us in this exciting new chapter for CKEditor 5 and let’s make the developer experience as smooth and enjoyable as possible.

#### Removal of superbuild and predefined builds from the CDN

We have stopped publishing the superbuild and predefined builds to our CDN. Predefined builds can still be accessed as an npm package. If you want to keep using our CDN with new versions of the editor, we recommend [migrating to the new installation methods](https://ckeditor.com/docs/ckeditor5/latest/updating/nim-migration/migration-to-new-installation-methods.html#browser-builds).

#### Other updates

We are excited to announce a major update to our premium **Export to Word** feature, delivering significantly improved quality with multiple enhancements and bug fixes. This release also brings a substantial reduction in the conversion time. Export to Word v2 is an opt-in feature right now, and to use it you need to slightly change the editor’s configuration. Detailed information can be found [in the documentation](https://ckeditor.com/docs/ckeditor5/latest/features/converters/export-word.html#export-to-word-v2).

### MINOR BREAKING CHANGES [ℹ️](https://ckeditor.com/docs/ckeditor5/latest/framework/guides/support/versioning-policy.html#major-and-minor-breaking-changes)

* **[image](https://www.npmjs.com/package/@ckeditor/ckeditor5-image)**: The `Insert image via URL` UI component form has been moved to a modal dialog instead of being available directly in the insert image dropdown.
* **[image](https://www.npmjs.com/package/@ckeditor/ckeditor5-image)**: Increased specificity of the `.image-style-block-align-[right/left]`, `.image-style-align-[right/left]`, and `.image-style-side` CSS classes by adding the `.image` class. See [#16317](https://github.com/ckeditor/ckeditor5/issues/16317).
* **[media-embed](https://www.npmjs.com/package/@ckeditor/ckeditor5-media-embed)**: The media embed feature now uses a modal dialog (instead of a toolbar dropdown) for inserting media.
* **[pagination](https://www.npmjs.com/package/@ckeditor/ckeditor5-pagination)**: If you have custom CSS styles that override the default styling of the `Pagination` elements, they might stop working after this change. The reason is that a stricter CSS selector with `ck-pagination-loaded` is now used to hide or show these elements.

### Features

* **[engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine)**: `Schema` now supports disallowing items. Introduced the `SchemaItemDefinition#disallowIn`, `SchemaItemDefinition#disallowChildren` and `SchemaItemDefinition#disallowAttributes` properties. Closes [#15835](https://github.com/ckeditor/ckeditor5/issues/15835). ([commit](https://github.com/ckeditor/ckeditor5/commit/abcd7aa0dc5e8d90952f5bf6aa6a576c8250ad8c))
* **[engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine)**: Introduced the `DiffItemInsert#action`, `DiffItemInsert#before` and `DiffItemRemove#action` properties which give more information about the change that happened in the model. Refer to the API documentation to learn more. Closes [#15800](https://github.com/ckeditor/ckeditor5/issues/15800). ([commit](https://github.com/ckeditor/ckeditor5/commit/f5dfe9b47a2ad647a296e981924d23b03f36c2c9))
* **[export-word](https://www.npmjs.com/package/@ckeditor/ckeditor5-export-word)**: Added support for Export to Word API v2.
* **[image](https://www.npmjs.com/package/@ckeditor/ckeditor5-image)**: Added menu bar integration for the insert image component. The `menuBar:insertImage` component is by default added to the "Insert" menu and replaces current buttons related to image insertion. Closes [#16445](https://github.com/ckeditor/ckeditor5/issues/16445). ([commit](https://github.com/ckeditor/ckeditor5/commit/25e13f851bcd2905e415f4fe925ee1863017a1ae))
* **[list-multi-level](https://www.npmjs.com/package/@ckeditor/ckeditor5-list-multi-level)**: Added the menu bar integration for multi-level lists. The `menuBar:multiLevelList` component is by default added in the "Format" menu.
* **[media-embed](https://www.npmjs.com/package/@ckeditor/ckeditor5-media-embed)**: Added menu bar integration to media embed. The "Media" button is now available in the "Insert" menu. ([commit](https://github.com/ckeditor/ckeditor5/commit/092b20d6c189d0a810cd3388ce060eeb4f84813d))
* **[watchdog](https://www.npmjs.com/package/@ckeditor/ckeditor5-watchdog)**: Export the `EditorCreatorFunction` and `WatchdogConfig` types from the main index file. ([commit](https://github.com/ckeditor/ckeditor5/commit/54637c750f6a3156e78145d82064d637ffa30b60))

### Bug fixes

* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai)**: The `h1` tags will no longer be normalized to `h2` tags in the AI Assistant response if the editor has `h1` tags enabled in its content.
* **[ckbox](https://www.npmjs.com/package/@ckeditor/ckeditor5-ckbox)**: The image toolbar stays attached to the image after closing CKBox. Closes [#16153](https://github.com/ckeditor/ckeditor5/issues/16153). ([commit](https://github.com/ckeditor/ckeditor5/commit/3790aa2b37ef83b9cc4cb5838093feaebd608d00))
* **[ckeditor5-premium-features](https://www.npmjs.com/package/ckeditor5-premium-features)**: Use the new `@ckeditor/ckeditor-cloud-services-collaboration` build targeting `es2022` when creating a browser build of `ckeditor5-premium-features`.
* **[comments](https://www.npmjs.com/package/@ckeditor/ckeditor5-comments)**: Prevent crashes in narrow and wide sidebars when the `EditorAnnotations` plugin is not loaded.
* **[engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine)**: Preserve repeated spaces in text that is contained within an element that renders (repeated) white space. Closes [#16124](https://github.com/ckeditor/ckeditor5/issues/16124). ([commit](https://github.com/ckeditor/ckeditor5/commit/8a392f14bbb6d10db78b5092c2903bd398757d45))
* **[export-word](https://www.npmjs.com/package/@ckeditor/ckeditor5-export-word)**: Collaboration features should work with Export Word v2 API.
* **[image](https://www.npmjs.com/package/@ckeditor/ckeditor5-image)**: Buttons inside the `insertImage` dropdown will no longer have an unnecessary tooltip. ([commit](https://github.com/ckeditor/ckeditor5/commit/25e13f851bcd2905e415f4fe925ee1863017a1ae))
* **[image](https://www.npmjs.com/package/@ckeditor/ckeditor5-image)**: Increased specificity of the `.image-style-block-align-[right/left]`, `.image-style-align-[right/left]`, and `.image-style-side` CSS classes by adding the `.image` class. Closes [#16317](https://github.com/ckeditor/ckeditor5/issues/16317). ([commit](https://github.com/ckeditor/ckeditor5/commit/3f8edcef22a5dc518f8fcbe67159e2180e58aae7))
* **[link](https://www.npmjs.com/package/@ckeditor/ckeditor5-link)**: Set `inputmode=url` to a link balloon form input. Closes [#16389](https://github.com/ckeditor/ckeditor5/issues/16389). ([commit](https://github.com/ckeditor/ckeditor5/commit/4751854ab6c0bc23a906a7918501bf203f3aa5fe))
* **[list-multi-level](https://www.npmjs.com/package/@ckeditor/ckeditor5-list-multi-level)**: The toolbar button should be `on` when the multi-level list is selected. This refers to the single button, not the split button. See [#16345](https://github.com/ckeditor/ckeditor5/issues/16345).
* **[pagination](https://www.npmjs.com/package/@ckeditor/ckeditor5-pagination)**: The `PageBreak` and `Pagination` plugin styles no longer conflict. Closes [#16506](https://github.com/ckeditor/ckeditor5/issues/16506).
* **[real-time-collaboration](https://www.npmjs.com/package/@ckeditor/ckeditor5-real-time-collaboration)**: Long user names should render correctly in the collapsed presence list when the `config.presenceList.onClick` configuration is set.
* **[track-changes](https://www.npmjs.com/package/@ckeditor/ckeditor5-track-changes)**: Fixed the `commentsrepository-duplicated-comment-thread-id` error thrown after calling `TrackChangesData#getDataWithAcceptedSuggestions()` and `TrackChangesData#getDataWithDiscardedSuggestions()`.
* **[track-changes](https://www.npmjs.com/package/@ckeditor/ckeditor5-track-changes)**: Fixed the editor crash in a scenario involving real-time collaboration and undo, when a suggestion was created twice on the same row.
* **[ui](https://www.npmjs.com/package/@ckeditor/ckeditor5-ui)**: Fixed incorrect position of the block toolbar tooltip handle. Closes [#16365](https://github.com/ckeditor/ckeditor5/issues/16365). ([commit](https://github.com/ckeditor/ckeditor5/commit/182e24eb888cb273f87cb420d69e1f0b81e1d47a))
* **[ui](https://www.npmjs.com/package/@ckeditor/ckeditor5-ui)**: Prevented an editor error in a situation where tooltip was unpinned after it was already removed. This happened when the "Unlink" button was pressed while the tooltip was shown. ([commit](https://github.com/ckeditor/ckeditor5/commit/4090042508c86b665ac1bb60981c3d4bd4578042))
* **[ui](https://www.npmjs.com/package/@ckeditor/ckeditor5-ui)**: The `TooltipManager` tooltips should immediately show up when triggered by user focus for better responsiveness and accessibility. ([commit](https://github.com/ckeditor/ckeditor5/commit/9a6b96b9c35864433929e13e8ae7ecfb8ee70f2e))
* Add `declare` to dynamically populated class fields. Closes [#16386](https://github.com/ckeditor/ckeditor5/issues/16386). ([commit](https://github.com/ckeditor/ckeditor5/commit/2e9b16d45e19bdf9fd15554809232edadbb2d7af))

### Other changes

* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai)**: Slightly improved the quality of the AI Assistant responses when the editor selection is empty.
* **[ckeditor5](https://www.npmjs.com/package/ckeditor5)**: Moved the `@ckeditor/ckeditor5-build-*` packages to `devDependencies` to reduce the installation size of the `ckeditor5` package. Related to [#16360](https://github.com/ckeditor/ckeditor5/issues/16360). ([commit](https://github.com/ckeditor/ckeditor5/commit/590ba44214a390dfc49d10d6a8abef3fbf2c7acf))
* **[ckeditor5](https://www.npmjs.com/package/ckeditor5)**: Renamed `index.js` to `ckeditor5.js` in the new installation method builds. ([commit](https://github.com/ckeditor/ckeditor5/commit/0554a0bb01cb557baab92236651e9354c1a91a5e))
* **[ckeditor5](https://www.npmjs.com/package/ckeditor5)**: Added the `main`, `module`, `types` and `exports` fields to the `package.json` file. Closes [#16257](https://github.com/ckeditor/ckeditor5/issues/16257). ([commit](https://github.com/ckeditor/ckeditor5/commit/67117fb95b943518519e6c7b13c777add920d1ea))
* **[ckeditor5](https://www.npmjs.com/package/ckeditor5)**: Renamed files in the browser build to `ckeditor5`. ([commit](https://github.com/ckeditor/ckeditor5/commit/dc4e183c8d2afef0f8cf6ec403b21e697ebc3496))
* **[ckeditor5-premium-features](https://www.npmjs.com/package/ckeditor5-ckeditor5-premium-features)**: Renamed the `index.js` file to `ckeditor5-premium-features.js` in new installation method builds.
* **[core](https://www.npmjs.com/package/@ckeditor/ckeditor5-core)**: The `EditorWatchdog`, `ContextWatchdog`, and `Context` classes are now exposed as static fields of the `Editor` class. Closes [#13852](https://github.com/ckeditor/ckeditor5/issues/13852). ([commit](https://github.com/ckeditor/ckeditor5/commit/fc93d0ff39e83b201748436d58008b08f69e15f2))
* **[engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine)**: Export `XmlDataProcessor` from the main index. ([commit](https://github.com/ckeditor/ckeditor5/commit/316da187581a3523cbd4c4edd511041f1469006f))
* **[engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine)**: Export the `ViewDocumentBlurEvent` and `ViewDocumentFocusEvent` types from the main index. ([commit](https://github.com/ckeditor/ckeditor5/commit/140be5e8cb3a3ea415045f566445e74d96811592))
* **[image](https://www.npmjs.com/package/@ckeditor/ckeditor5-image)**: The following new components are now available: the `insertImageViaUrl` toolbar button and the `menuBar:insertImageViaUrl` menu bar button. ([commit](https://github.com/ckeditor/ckeditor5/commit/25e13f851bcd2905e415f4fe925ee1863017a1ae))
* **[image](https://www.npmjs.com/package/@ckeditor/ckeditor5-image)**: The `Insert image via URL` form has been moved to a modal dialog instead of being available directly in the insert image dropdown. ([commit](https://github.com/ckeditor/ckeditor5/commit/25e13f851bcd2905e415f4fe925ee1863017a1ae))
* **[markdown-gfm](https://www.npmjs.com/package/@ckeditor/ckeditor5-markdown-gfm)**: Rewrote `html2markdown` and `markdown2html` to classes to improve tree-shaking. Related to [#16292](https://github.com/ckeditor/ckeditor5/issues/16292). ([commit](https://github.com/ckeditor/ckeditor5/commit/990afc76d8c4a47af4ba8143ab6653e5bd04702b))
* **[markdown-gfm](https://www.npmjs.com/package/@ckeditor/ckeditor5-markdown-gfm)**: Upgraded `turndown` to version `7.2.0`. Closes [#16371](https://github.com/ckeditor/ckeditor5/issues/16371). ([commit](https://github.com/ckeditor/ckeditor5/commit/990afc76d8c4a47af4ba8143ab6653e5bd04702b))
* **[media-embed](https://www.npmjs.com/package/@ckeditor/ckeditor5-media-embed)**: The media embed feature now uses a modal dialog (instead of toolbar dropdown) for inserting media. ([commit](https://github.com/ckeditor/ckeditor5/commit/092b20d6c189d0a810cd3388ce060eeb4f84813d))
* **[operations-compressor](https://www.npmjs.com/package/@ckeditor/ckeditor5-operations-compressor)**: Improved the build size by making the `compiledmessages.js` file tree-shakeable.
* **[theme-lark](https://www.npmjs.com/package/@ckeditor/ckeditor5-theme-lark)**: Added a separator (border) between the menu bar and the toolbar for the classic editor. ([commit](https://github.com/ckeditor/ckeditor5/commit/a0e25f2aa14d6230d92e3bb92d11490a81204833))
* **[theme-lark](https://www.npmjs.com/package/@ckeditor/ckeditor5-theme-lark)**: Toolbar separators are now shorter. ([commit](https://github.com/ckeditor/ckeditor5/commit/a0e25f2aa14d6230d92e3bb92d11490a81204833))
* **[track-changes](https://www.npmjs.com/package/@ckeditor/ckeditor5-track-changes)**: Removed the deprecated `TrackChangesEditing#_descriptionFactory` property. Use `descriptionFactory` instead. The old property was deprecated in the `v41.4.0` release.
* **[widget](https://www.npmjs.com/package/@ckeditor/ckeditor5-widget)**: Added information to the accessibility help dialog about a keyboard shortcut that moves focus from a nested editable back to the widget. ([commit](https://github.com/ckeditor/ckeditor5/commit/8193f02bf8122684fa0580582b3436894fc88e0f))
* Improved tree-shaking by prefixing mixin calls with a `/* #__PURE__ */` magic comment. See [#16292](https://github.com/ckeditor/ckeditor5/issues/16292). ([commit](https://github.com/ckeditor/ckeditor5/commit/7f9500237d2d136517eaa8e1abfd62ec324b36fb))
* Updated translations. ([commit](https://github.com/ckeditor/ckeditor5/commit/8f65f1fa0c8100f34f18d356782e72b165281b9e), [commit](https://github.com/ckeditor/ckeditor5/commit/a1cc340acb6c4a46c8cd0d5268f465530a3a05c9), [commit](https://github.com/ckeditor/ckeditor5/commit/20ca7eed02fcf08c7dee6e72cc3e4ab222844d99))

### Released packages

Check out the [Versioning policy](https://ckeditor.com/docs/ckeditor5/latest/framework/guides/support/versioning-policy.html) guide for more information.

<details>
<summary>Released packages (summary)</summary>

Minor releases (contain minor breaking changes):

* [@ckeditor/ckeditor5-pagination](https://www.npmjs.com/package/@ckeditor/ckeditor5-pagination/v/42.0.0): v41.4.2 => v42.0.0

Releases containing new features:

* [@ckeditor/ckeditor5-list](https://www.npmjs.com/package/@ckeditor/ckeditor5-list/v/42.0.0): v41.4.2 => v42.0.0

Other releases:

* [@ckeditor/ckeditor5-adapter-ckfinder](https://www.npmjs.com/package/@ckeditor/ckeditor5-adapter-ckfinder/v/42.0.0): v41.4.2 => v42.0.0
* [@ckeditor/ckeditor5-ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai/v/42.0.0): v41.4.2 => v42.0.0
* [@ckeditor/ckeditor5-alignment](https://www.npmjs.com/package/@ckeditor/ckeditor5-alignment/v/42.0.0): v41.4.2 => v42.0.0
* [@ckeditor/ckeditor5-autoformat](https://www.npmjs.com/package/@ckeditor/ckeditor5-autoformat/v/42.0.0): v41.4.2 => v42.0.0
* [@ckeditor/ckeditor5-autosave](https://www.npmjs.com/package/@ckeditor/ckeditor5-autosave/v/42.0.0): v41.4.2 => v42.0.0
* [@ckeditor/ckeditor5-basic-styles](https://www.npmjs.com/package/@ckeditor/ckeditor5-basic-styles/v/42.0.0): v41.4.2 => v42.0.0
* [@ckeditor/ckeditor5-block-quote](https://www.npmjs.com/package/@ckeditor/ckeditor5-block-quote/v/42.0.0): v41.4.2 => v42.0.0
* [@ckeditor/ckeditor5-build-balloon](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-balloon/v/42.0.0): v41.4.2 => v42.0.0
* [@ckeditor/ckeditor5-build-balloon-block](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-balloon-block/v/42.0.0): v41.4.2 => v42.0.0
* [@ckeditor/ckeditor5-build-classic](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-classic/v/42.0.0): v41.4.2 => v42.0.0
* [@ckeditor/ckeditor5-build-decoupled-document](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-decoupled-document/v/42.0.0): v41.4.2 => v42.0.0
* [@ckeditor/ckeditor5-build-inline](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-inline/v/42.0.0): v41.4.2 => v42.0.0
* [@ckeditor/ckeditor5-build-multi-root](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-multi-root/v/42.0.0): v41.4.2 => v42.0.0
* [@ckeditor/ckeditor5-case-change](https://www.npmjs.com/package/@ckeditor/ckeditor5-case-change/v/42.0.0): v41.4.2 => v42.0.0
* [@ckeditor/ckeditor5-ckbox](https://www.npmjs.com/package/@ckeditor/ckeditor5-ckbox/v/42.0.0): v41.4.2 => v42.0.0
* [@ckeditor/ckeditor5-ckfinder](https://www.npmjs.com/package/@ckeditor/ckeditor5-ckfinder/v/42.0.0): v41.4.2 => v42.0.0
* [@ckeditor/ckeditor5-clipboard](https://www.npmjs.com/package/@ckeditor/ckeditor5-clipboard/v/42.0.0): v41.4.2 => v42.0.0
* [@ckeditor/ckeditor5-cloud-services](https://www.npmjs.com/package/@ckeditor/ckeditor5-cloud-services/v/42.0.0): v41.4.2 => v42.0.0
* [@ckeditor/ckeditor5-code-block](https://www.npmjs.com/package/@ckeditor/ckeditor5-code-block/v/42.0.0): v41.4.2 => v42.0.0
* [@ckeditor/ckeditor5-collaboration-core](https://www.npmjs.com/package/@ckeditor/ckeditor5-collaboration-core/v/42.0.0): v41.4.2 => v42.0.0
* [@ckeditor/ckeditor5-comments](https://www.npmjs.com/package/@ckeditor/ckeditor5-comments/v/42.0.0): v41.4.2 => v42.0.0
* [@ckeditor/ckeditor5-core](https://www.npmjs.com/package/@ckeditor/ckeditor5-core/v/42.0.0): v41.4.2 => v42.0.0
* [@ckeditor/ckeditor5-document-outline](https://www.npmjs.com/package/@ckeditor/ckeditor5-document-outline/v/42.0.0): v41.4.2 => v42.0.0
* [@ckeditor/ckeditor5-easy-image](https://www.npmjs.com/package/@ckeditor/ckeditor5-easy-image/v/42.0.0): v41.4.2 => v42.0.0
* [@ckeditor/ckeditor5-editor-balloon](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-balloon/v/42.0.0): v41.4.2 => v42.0.0
* [@ckeditor/ckeditor5-editor-classic](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-classic/v/42.0.0): v41.4.2 => v42.0.0
* [@ckeditor/ckeditor5-editor-decoupled](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-decoupled/v/42.0.0): v41.4.2 => v42.0.0
* [@ckeditor/ckeditor5-editor-inline](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-inline/v/42.0.0): v41.4.2 => v42.0.0
* [@ckeditor/ckeditor5-editor-multi-root](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-multi-root/v/42.0.0): v41.4.2 => v42.0.0
* [@ckeditor/ckeditor5-engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine/v/42.0.0): v41.4.2 => v42.0.0
* [@ckeditor/ckeditor5-enter](https://www.npmjs.com/package/@ckeditor/ckeditor5-enter/v/42.0.0): v41.4.2 => v42.0.0
* [@ckeditor/ckeditor5-essentials](https://www.npmjs.com/package/@ckeditor/ckeditor5-essentials/v/42.0.0): v41.4.2 => v42.0.0
* [@ckeditor/ckeditor5-export-pdf](https://www.npmjs.com/package/@ckeditor/ckeditor5-export-pdf/v/42.0.0): v41.4.2 => v42.0.0
* [@ckeditor/ckeditor5-export-word](https://www.npmjs.com/package/@ckeditor/ckeditor5-export-word/v/42.0.0): v41.4.2 => v42.0.0
* [@ckeditor/ckeditor5-find-and-replace](https://www.npmjs.com/package/@ckeditor/ckeditor5-find-and-replace/v/42.0.0): v41.4.2 => v42.0.0
* [@ckeditor/ckeditor5-font](https://www.npmjs.com/package/@ckeditor/ckeditor5-font/v/42.0.0): v41.4.2 => v42.0.0
* [@ckeditor/ckeditor5-format-painter](https://www.npmjs.com/package/@ckeditor/ckeditor5-format-painter/v/42.0.0): v41.4.2 => v42.0.0
* [@ckeditor/ckeditor5-heading](https://www.npmjs.com/package/@ckeditor/ckeditor5-heading/v/42.0.0): v41.4.2 => v42.0.0
* [@ckeditor/ckeditor5-highlight](https://www.npmjs.com/package/@ckeditor/ckeditor5-highlight/v/42.0.0): v41.4.2 => v42.0.0
* [@ckeditor/ckeditor5-horizontal-line](https://www.npmjs.com/package/@ckeditor/ckeditor5-horizontal-line/v/42.0.0): v41.4.2 => v42.0.0
* [@ckeditor/ckeditor5-html-embed](https://www.npmjs.com/package/@ckeditor/ckeditor5-html-embed/v/42.0.0): v41.4.2 => v42.0.0
* [@ckeditor/ckeditor5-html-support](https://www.npmjs.com/package/@ckeditor/ckeditor5-html-support/v/42.0.0): v41.4.2 => v42.0.0
* [@ckeditor/ckeditor5-image](https://www.npmjs.com/package/@ckeditor/ckeditor5-image/v/42.0.0): v41.4.2 => v42.0.0
* [@ckeditor/ckeditor5-import-word](https://www.npmjs.com/package/@ckeditor/ckeditor5-import-word/v/42.0.0): v41.4.2 => v42.0.0
* [@ckeditor/ckeditor5-indent](https://www.npmjs.com/package/@ckeditor/ckeditor5-indent/v/42.0.0): v41.4.2 => v42.0.0
* [@ckeditor/ckeditor5-language](https://www.npmjs.com/package/@ckeditor/ckeditor5-language/v/42.0.0): v41.4.2 => v42.0.0
* [@ckeditor/ckeditor5-link](https://www.npmjs.com/package/@ckeditor/ckeditor5-link/v/42.0.0): v41.4.2 => v42.0.0
* [@ckeditor/ckeditor5-list-multi-level](https://www.npmjs.com/package/@ckeditor/ckeditor5-list-multi-level/v/42.0.0): v41.4.2 => v42.0.0
* [@ckeditor/ckeditor5-markdown-gfm](https://www.npmjs.com/package/@ckeditor/ckeditor5-markdown-gfm/v/42.0.0): v41.4.2 => v42.0.0
* [@ckeditor/ckeditor5-media-embed](https://www.npmjs.com/package/@ckeditor/ckeditor5-media-embed/v/42.0.0): v41.4.2 => v42.0.0
* [@ckeditor/ckeditor5-mention](https://www.npmjs.com/package/@ckeditor/ckeditor5-mention/v/42.0.0): v41.4.2 => v42.0.0
* [@ckeditor/ckeditor5-minimap](https://www.npmjs.com/package/@ckeditor/ckeditor5-minimap/v/42.0.0): v41.4.2 => v42.0.0
* [@ckeditor/ckeditor5-operations-compressor](https://www.npmjs.com/package/@ckeditor/ckeditor5-operations-compressor/v/42.0.0): v41.4.2 => v42.0.0
* [@ckeditor/ckeditor5-page-break](https://www.npmjs.com/package/@ckeditor/ckeditor5-page-break/v/42.0.0): v41.4.2 => v42.0.0
* [@ckeditor/ckeditor5-paragraph](https://www.npmjs.com/package/@ckeditor/ckeditor5-paragraph/v/42.0.0): v41.4.2 => v42.0.0
* [@ckeditor/ckeditor5-paste-from-office](https://www.npmjs.com/package/@ckeditor/ckeditor5-paste-from-office/v/42.0.0): v41.4.2 => v42.0.0
* [@ckeditor/ckeditor5-paste-from-office-enhanced](https://www.npmjs.com/package/@ckeditor/ckeditor5-paste-from-office-enhanced/v/42.0.0): v41.4.2 => v42.0.0
* [@ckeditor/ckeditor5-real-time-collaboration](https://www.npmjs.com/package/@ckeditor/ckeditor5-real-time-collaboration/v/42.0.0): v41.4.2 => v42.0.0
* [@ckeditor/ckeditor5-remove-format](https://www.npmjs.com/package/@ckeditor/ckeditor5-remove-format/v/42.0.0): v41.4.2 => v42.0.0
* [@ckeditor/ckeditor5-restricted-editing](https://www.npmjs.com/package/@ckeditor/ckeditor5-restricted-editing/v/42.0.0): v41.4.2 => v42.0.0
* [@ckeditor/ckeditor5-revision-history](https://www.npmjs.com/package/@ckeditor/ckeditor5-revision-history/v/42.0.0): v41.4.2 => v42.0.0
* [@ckeditor/ckeditor5-select-all](https://www.npmjs.com/package/@ckeditor/ckeditor5-select-all/v/42.0.0): v41.4.2 => v42.0.0
* [@ckeditor/ckeditor5-show-blocks](https://www.npmjs.com/package/@ckeditor/ckeditor5-show-blocks/v/42.0.0): v41.4.2 => v42.0.0
* [@ckeditor/ckeditor5-slash-command](https://www.npmjs.com/package/@ckeditor/ckeditor5-slash-command/v/42.0.0): v41.4.2 => v42.0.0
* [@ckeditor/ckeditor5-source-editing](https://www.npmjs.com/package/@ckeditor/ckeditor5-source-editing/v/42.0.0): v41.4.2 => v42.0.0
* [@ckeditor/ckeditor5-special-characters](https://www.npmjs.com/package/@ckeditor/ckeditor5-special-characters/v/42.0.0): v41.4.2 => v42.0.0
* [@ckeditor/ckeditor5-style](https://www.npmjs.com/package/@ckeditor/ckeditor5-style/v/42.0.0): v41.4.2 => v42.0.0
* [@ckeditor/ckeditor5-table](https://www.npmjs.com/package/@ckeditor/ckeditor5-table/v/42.0.0): v41.4.2 => v42.0.0
* [@ckeditor/ckeditor5-template](https://www.npmjs.com/package/@ckeditor/ckeditor5-template/v/42.0.0): v41.4.2 => v42.0.0
* [@ckeditor/ckeditor5-theme-lark](https://www.npmjs.com/package/@ckeditor/ckeditor5-theme-lark/v/42.0.0): v41.4.2 => v42.0.0
* [@ckeditor/ckeditor5-track-changes](https://www.npmjs.com/package/@ckeditor/ckeditor5-track-changes/v/42.0.0): v41.4.2 => v42.0.0
* [@ckeditor/ckeditor5-typing](https://www.npmjs.com/package/@ckeditor/ckeditor5-typing/v/42.0.0): v41.4.2 => v42.0.0
* [@ckeditor/ckeditor5-ui](https://www.npmjs.com/package/@ckeditor/ckeditor5-ui/v/42.0.0): v41.4.2 => v42.0.0
* [@ckeditor/ckeditor5-undo](https://www.npmjs.com/package/@ckeditor/ckeditor5-undo/v/42.0.0): v41.4.2 => v42.0.0
* [@ckeditor/ckeditor5-upload](https://www.npmjs.com/package/@ckeditor/ckeditor5-upload/v/42.0.0): v41.4.2 => v42.0.0
* [@ckeditor/ckeditor5-utils](https://www.npmjs.com/package/@ckeditor/ckeditor5-utils/v/42.0.0): v41.4.2 => v42.0.0
* [@ckeditor/ckeditor5-watchdog](https://www.npmjs.com/package/@ckeditor/ckeditor5-watchdog/v/42.0.0): v41.4.2 => v42.0.0
* [@ckeditor/ckeditor5-widget](https://www.npmjs.com/package/@ckeditor/ckeditor5-widget/v/42.0.0): v41.4.2 => v42.0.0
* [@ckeditor/ckeditor5-word-count](https://www.npmjs.com/package/@ckeditor/ckeditor5-word-count/v/42.0.0): v41.4.2 => v42.0.0
* [ckeditor5-collaboration](https://www.npmjs.com/package/ckeditor5-collaboration/v/42.0.0): v41.4.2 => v42.0.0
* [ckeditor5-premium-features](https://www.npmjs.com/package/ckeditor5-premium-features/v/42.0.0): v41.4.2 => v42.0.0
</details>


## [41.4.2](https://github.com/ckeditor/ckeditor5/compare/v41.4.1...v41.4.2) (May 17, 2024)

We are excited to announce the release of CKEditor 5 v41.4.2. This patch release addresses an important issue and ensures compatibility with the Jest environment.

### Bug fixes

* **[utils](https://www.npmjs.com/package/@ckeditor/ckeditor5-utils)**: Prevented error thrown when editor files are imported in an environment without the `window` global object. Closes [#16368](https://github.com/ckeditor/ckeditor5/issues/16368). ([commit](https://github.com/ckeditor/ckeditor5/commit/0b70608f91c63a21a551de57e6ef002d6a96c8c7))

### Released packages

Check out the [Versioning policy](https://ckeditor.com/docs/ckeditor5/latest/framework/guides/support/versioning-policy.html) guide for more information.

<details>
<summary>Released packages (summary)</summary>

Other releases:

* [@ckeditor/ckeditor5-adapter-ckfinder](https://www.npmjs.com/package/@ckeditor/ckeditor5-adapter-ckfinder/v/41.4.2): v41.4.1 => v41.4.2
* [@ckeditor/ckeditor5-ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai/v/41.4.2): v41.4.1 => v41.4.2
* [@ckeditor/ckeditor5-alignment](https://www.npmjs.com/package/@ckeditor/ckeditor5-alignment/v/41.4.2): v41.4.1 => v41.4.2
* [@ckeditor/ckeditor5-autoformat](https://www.npmjs.com/package/@ckeditor/ckeditor5-autoformat/v/41.4.2): v41.4.1 => v41.4.2
* [@ckeditor/ckeditor5-autosave](https://www.npmjs.com/package/@ckeditor/ckeditor5-autosave/v/41.4.2): v41.4.1 => v41.4.2
* [@ckeditor/ckeditor5-basic-styles](https://www.npmjs.com/package/@ckeditor/ckeditor5-basic-styles/v/41.4.2): v41.4.1 => v41.4.2
* [@ckeditor/ckeditor5-block-quote](https://www.npmjs.com/package/@ckeditor/ckeditor5-block-quote/v/41.4.2): v41.4.1 => v41.4.2
* [@ckeditor/ckeditor5-build-balloon](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-balloon/v/41.4.2): v41.4.1 => v41.4.2
* [@ckeditor/ckeditor5-build-balloon-block](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-balloon-block/v/41.4.2): v41.4.1 => v41.4.2
* [@ckeditor/ckeditor5-build-classic](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-classic/v/41.4.2): v41.4.1 => v41.4.2
* [@ckeditor/ckeditor5-build-decoupled-document](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-decoupled-document/v/41.4.2): v41.4.1 => v41.4.2
* [@ckeditor/ckeditor5-build-inline](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-inline/v/41.4.2): v41.4.1 => v41.4.2
* [@ckeditor/ckeditor5-build-multi-root](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-multi-root/v/41.4.2): v41.4.1 => v41.4.2
* [@ckeditor/ckeditor5-case-change](https://www.npmjs.com/package/@ckeditor/ckeditor5-case-change/v/41.4.2): v41.4.1 => v41.4.2
* [@ckeditor/ckeditor5-ckbox](https://www.npmjs.com/package/@ckeditor/ckeditor5-ckbox/v/41.4.2): v41.4.1 => v41.4.2
* [@ckeditor/ckeditor5-ckfinder](https://www.npmjs.com/package/@ckeditor/ckeditor5-ckfinder/v/41.4.2): v41.4.1 => v41.4.2
* [@ckeditor/ckeditor5-clipboard](https://www.npmjs.com/package/@ckeditor/ckeditor5-clipboard/v/41.4.2): v41.4.1 => v41.4.2
* [@ckeditor/ckeditor5-cloud-services](https://www.npmjs.com/package/@ckeditor/ckeditor5-cloud-services/v/41.4.2): v41.4.1 => v41.4.2
* [@ckeditor/ckeditor5-code-block](https://www.npmjs.com/package/@ckeditor/ckeditor5-code-block/v/41.4.2): v41.4.1 => v41.4.2
* [@ckeditor/ckeditor5-collaboration-core](https://www.npmjs.com/package/@ckeditor/ckeditor5-collaboration-core/v/41.4.2): v41.4.1 => v41.4.2
* [@ckeditor/ckeditor5-comments](https://www.npmjs.com/package/@ckeditor/ckeditor5-comments/v/41.4.2): v41.4.1 => v41.4.2
* [@ckeditor/ckeditor5-core](https://www.npmjs.com/package/@ckeditor/ckeditor5-core/v/41.4.2): v41.4.1 => v41.4.2
* [@ckeditor/ckeditor5-document-outline](https://www.npmjs.com/package/@ckeditor/ckeditor5-document-outline/v/41.4.2): v41.4.1 => v41.4.2
* [@ckeditor/ckeditor5-easy-image](https://www.npmjs.com/package/@ckeditor/ckeditor5-easy-image/v/41.4.2): v41.4.1 => v41.4.2
* [@ckeditor/ckeditor5-editor-balloon](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-balloon/v/41.4.2): v41.4.1 => v41.4.2
* [@ckeditor/ckeditor5-editor-classic](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-classic/v/41.4.2): v41.4.1 => v41.4.2
* [@ckeditor/ckeditor5-editor-decoupled](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-decoupled/v/41.4.2): v41.4.1 => v41.4.2
* [@ckeditor/ckeditor5-editor-inline](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-inline/v/41.4.2): v41.4.1 => v41.4.2
* [@ckeditor/ckeditor5-editor-multi-root](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-multi-root/v/41.4.2): v41.4.1 => v41.4.2
* [@ckeditor/ckeditor5-engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine/v/41.4.2): v41.4.1 => v41.4.2
* [@ckeditor/ckeditor5-enter](https://www.npmjs.com/package/@ckeditor/ckeditor5-enter/v/41.4.2): v41.4.1 => v41.4.2
* [@ckeditor/ckeditor5-essentials](https://www.npmjs.com/package/@ckeditor/ckeditor5-essentials/v/41.4.2): v41.4.1 => v41.4.2
* [@ckeditor/ckeditor5-export-pdf](https://www.npmjs.com/package/@ckeditor/ckeditor5-export-pdf/v/41.4.2): v41.4.1 => v41.4.2
* [@ckeditor/ckeditor5-export-word](https://www.npmjs.com/package/@ckeditor/ckeditor5-export-word/v/41.4.2): v41.4.1 => v41.4.2
* [@ckeditor/ckeditor5-find-and-replace](https://www.npmjs.com/package/@ckeditor/ckeditor5-find-and-replace/v/41.4.2): v41.4.1 => v41.4.2
* [@ckeditor/ckeditor5-font](https://www.npmjs.com/package/@ckeditor/ckeditor5-font/v/41.4.2): v41.4.1 => v41.4.2
* [@ckeditor/ckeditor5-format-painter](https://www.npmjs.com/package/@ckeditor/ckeditor5-format-painter/v/41.4.2): v41.4.1 => v41.4.2
* [@ckeditor/ckeditor5-heading](https://www.npmjs.com/package/@ckeditor/ckeditor5-heading/v/41.4.2): v41.4.1 => v41.4.2
* [@ckeditor/ckeditor5-highlight](https://www.npmjs.com/package/@ckeditor/ckeditor5-highlight/v/41.4.2): v41.4.1 => v41.4.2
* [@ckeditor/ckeditor5-horizontal-line](https://www.npmjs.com/package/@ckeditor/ckeditor5-horizontal-line/v/41.4.2): v41.4.1 => v41.4.2
* [@ckeditor/ckeditor5-html-embed](https://www.npmjs.com/package/@ckeditor/ckeditor5-html-embed/v/41.4.2): v41.4.1 => v41.4.2
* [@ckeditor/ckeditor5-html-support](https://www.npmjs.com/package/@ckeditor/ckeditor5-html-support/v/41.4.2): v41.4.1 => v41.4.2
* [@ckeditor/ckeditor5-image](https://www.npmjs.com/package/@ckeditor/ckeditor5-image/v/41.4.2): v41.4.1 => v41.4.2
* [@ckeditor/ckeditor5-import-word](https://www.npmjs.com/package/@ckeditor/ckeditor5-import-word/v/41.4.2): v41.4.1 => v41.4.2
* [@ckeditor/ckeditor5-indent](https://www.npmjs.com/package/@ckeditor/ckeditor5-indent/v/41.4.2): v41.4.1 => v41.4.2
* [@ckeditor/ckeditor5-language](https://www.npmjs.com/package/@ckeditor/ckeditor5-language/v/41.4.2): v41.4.1 => v41.4.2
* [@ckeditor/ckeditor5-link](https://www.npmjs.com/package/@ckeditor/ckeditor5-link/v/41.4.2): v41.4.1 => v41.4.2
* [@ckeditor/ckeditor5-list](https://www.npmjs.com/package/@ckeditor/ckeditor5-list/v/41.4.2): v41.4.1 => v41.4.2
* [@ckeditor/ckeditor5-list-multi-level](https://www.npmjs.com/package/@ckeditor/ckeditor5-list-multi-level/v/41.4.2): v41.4.1 => v41.4.2
* [@ckeditor/ckeditor5-markdown-gfm](https://www.npmjs.com/package/@ckeditor/ckeditor5-markdown-gfm/v/41.4.2): v41.4.1 => v41.4.2
* [@ckeditor/ckeditor5-media-embed](https://www.npmjs.com/package/@ckeditor/ckeditor5-media-embed/v/41.4.2): v41.4.1 => v41.4.2
* [@ckeditor/ckeditor5-mention](https://www.npmjs.com/package/@ckeditor/ckeditor5-mention/v/41.4.2): v41.4.1 => v41.4.2
* [@ckeditor/ckeditor5-minimap](https://www.npmjs.com/package/@ckeditor/ckeditor5-minimap/v/41.4.2): v41.4.1 => v41.4.2
* [@ckeditor/ckeditor5-operations-compressor](https://www.npmjs.com/package/@ckeditor/ckeditor5-operations-compressor/v/41.4.2): v41.4.1 => v41.4.2
* [@ckeditor/ckeditor5-page-break](https://www.npmjs.com/package/@ckeditor/ckeditor5-page-break/v/41.4.2): v41.4.1 => v41.4.2
* [@ckeditor/ckeditor5-pagination](https://www.npmjs.com/package/@ckeditor/ckeditor5-pagination/v/41.4.2): v41.4.1 => v41.4.2
* [@ckeditor/ckeditor5-paragraph](https://www.npmjs.com/package/@ckeditor/ckeditor5-paragraph/v/41.4.2): v41.4.1 => v41.4.2
* [@ckeditor/ckeditor5-paste-from-office](https://www.npmjs.com/package/@ckeditor/ckeditor5-paste-from-office/v/41.4.2): v41.4.1 => v41.4.2
* [@ckeditor/ckeditor5-paste-from-office-enhanced](https://www.npmjs.com/package/@ckeditor/ckeditor5-paste-from-office-enhanced/v/41.4.2): v41.4.1 => v41.4.2
* [@ckeditor/ckeditor5-real-time-collaboration](https://www.npmjs.com/package/@ckeditor/ckeditor5-real-time-collaboration/v/41.4.2): v41.4.1 => v41.4.2
* [@ckeditor/ckeditor5-remove-format](https://www.npmjs.com/package/@ckeditor/ckeditor5-remove-format/v/41.4.2): v41.4.1 => v41.4.2
* [@ckeditor/ckeditor5-restricted-editing](https://www.npmjs.com/package/@ckeditor/ckeditor5-restricted-editing/v/41.4.2): v41.4.1 => v41.4.2
* [@ckeditor/ckeditor5-revision-history](https://www.npmjs.com/package/@ckeditor/ckeditor5-revision-history/v/41.4.2): v41.4.1 => v41.4.2
* [@ckeditor/ckeditor5-select-all](https://www.npmjs.com/package/@ckeditor/ckeditor5-select-all/v/41.4.2): v41.4.1 => v41.4.2
* [@ckeditor/ckeditor5-show-blocks](https://www.npmjs.com/package/@ckeditor/ckeditor5-show-blocks/v/41.4.2): v41.4.1 => v41.4.2
* [@ckeditor/ckeditor5-slash-command](https://www.npmjs.com/package/@ckeditor/ckeditor5-slash-command/v/41.4.2): v41.4.1 => v41.4.2
* [@ckeditor/ckeditor5-source-editing](https://www.npmjs.com/package/@ckeditor/ckeditor5-source-editing/v/41.4.2): v41.4.1 => v41.4.2
* [@ckeditor/ckeditor5-special-characters](https://www.npmjs.com/package/@ckeditor/ckeditor5-special-characters/v/41.4.2): v41.4.1 => v41.4.2
* [@ckeditor/ckeditor5-style](https://www.npmjs.com/package/@ckeditor/ckeditor5-style/v/41.4.2): v41.4.1 => v41.4.2
* [@ckeditor/ckeditor5-table](https://www.npmjs.com/package/@ckeditor/ckeditor5-table/v/41.4.2): v41.4.1 => v41.4.2
* [@ckeditor/ckeditor5-template](https://www.npmjs.com/package/@ckeditor/ckeditor5-template/v/41.4.2): v41.4.1 => v41.4.2
* [@ckeditor/ckeditor5-theme-lark](https://www.npmjs.com/package/@ckeditor/ckeditor5-theme-lark/v/41.4.2): v41.4.1 => v41.4.2
* [@ckeditor/ckeditor5-track-changes](https://www.npmjs.com/package/@ckeditor/ckeditor5-track-changes/v/41.4.2): v41.4.1 => v41.4.2
* [@ckeditor/ckeditor5-typing](https://www.npmjs.com/package/@ckeditor/ckeditor5-typing/v/41.4.2): v41.4.1 => v41.4.2
* [@ckeditor/ckeditor5-ui](https://www.npmjs.com/package/@ckeditor/ckeditor5-ui/v/41.4.2): v41.4.1 => v41.4.2
* [@ckeditor/ckeditor5-undo](https://www.npmjs.com/package/@ckeditor/ckeditor5-undo/v/41.4.2): v41.4.1 => v41.4.2
* [@ckeditor/ckeditor5-upload](https://www.npmjs.com/package/@ckeditor/ckeditor5-upload/v/41.4.2): v41.4.1 => v41.4.2
* [@ckeditor/ckeditor5-utils](https://www.npmjs.com/package/@ckeditor/ckeditor5-utils/v/41.4.2): v41.4.1 => v41.4.2
* [@ckeditor/ckeditor5-watchdog](https://www.npmjs.com/package/@ckeditor/ckeditor5-watchdog/v/41.4.2): v41.4.1 => v41.4.2
* [@ckeditor/ckeditor5-widget](https://www.npmjs.com/package/@ckeditor/ckeditor5-widget/v/41.4.2): v41.4.1 => v41.4.2
* [@ckeditor/ckeditor5-word-count](https://www.npmjs.com/package/@ckeditor/ckeditor5-word-count/v/41.4.2): v41.4.1 => v41.4.2
* [ckeditor5-collaboration](https://www.npmjs.com/package/ckeditor5-collaboration/v/41.4.2): v41.4.1 => v41.4.2
* [ckeditor5-premium-features](https://www.npmjs.com/package/ckeditor5-premium-features/v/41.4.2): v41.4.1 => v41.4.2
</details>


## [41.4.1](https://github.com/ckeditor/ckeditor5/compare/v41.4.0...v41.4.1) (May 16, 2024)

> [!NOTE]
> This release (v41.4.1) addresses a critical issue found in v41.4.0. Below is the changelog, which includes the changes originally introduced in v41.4.0

We are happy to announce the release of CKEditor 5 v41.4.1.

### Release highlights

We have enhanced CKEditor 5 to improve accessibility and user experience further. Screen reader announcements have been expanded to include code blocks, images, and lists, enhancing navigability for visually impaired users. Additionally, the editor now better adheres to accessibility standards by respecting user preferences for reduced motion, and we have improved handling of color settings in high contrast modes.

We have also added [menu bar](https://ckeditor.com/docs/ckeditor5/latest/features/toolbar/menubar.html) support for the multi-root editor.

### MINOR BREAKING CHANGES [ℹ️](https://ckeditor.com/docs/ckeditor5/latest/framework/guides/support/versioning-policy.html#major-and-minor-breaking-changes)

* **[ui](https://www.npmjs.com/package/@ckeditor/ckeditor5-ui)**: The region name argument of the `AriaLiveAnnouncer#announce()`  method has been dropped. Please check out the latest API documentation for more information.
* The `ckeditor5` package now lists all other official open-source `@ckeditor/ckeditor5-*` packages as dependencies. This is a preparatory step for the upcoming [new installation methods](https://github.com/ckeditor/ckeditor5/issues/15502). These changes will transform the `ckeditor5` package into an aggregate for all official packages, simplifying module imports.

### Features

* **[code-block](https://www.npmjs.com/package/@ckeditor/ckeditor5-code-block)**: Introduced screen reader announcements for entering or exiting code blocks in the editor content. Closes [#16053](https://github.com/ckeditor/ckeditor5/issues/16053). ([commit](https://github.com/ckeditor/ckeditor5/commit/c451c9ec247e73fe5d67c45265e4daf510717f05))
* **[editor-multi-root](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-multi-root)**: Added the menu bar support for multi-root editor. ([commit](https://github.com/ckeditor/ckeditor5/commit/627f842b7997fde21973afa5b196293b685c9b90))
* **[format-painter](https://www.npmjs.com/package/@ckeditor/ckeditor5-format-painter)**: Introduced the keyboard shortcuts for copying formatting in the document editor (<kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>C</kbd>) and paste (<kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>V</kbd>). Added the ability to cancel copying formatting using the <kbd>Esc</kbd> key.
* **[image](https://www.npmjs.com/package/@ckeditor/ckeditor5-image)**: Introduced screen reader announcements for various actions and events in the editor. ([commit](https://github.com/ckeditor/ckeditor5/commit/c451c9ec247e73fe5d67c45265e4daf510717f05))
* **[image](https://www.npmjs.com/package/@ckeditor/ckeditor5-image)**: Added the custom image width input option to the image toolbar as an alternative to drag-and-drop resizing. ([commit](https://github.com/ckeditor/ckeditor5/commit/7c0d75218b6d54b8673a57e075dfe6468429bd9e))
* **[link](https://www.npmjs.com/package/@ckeditor/ckeditor5-link)**: An error message should appear in the link editing form when submitting an empty link. ([commit](https://github.com/ckeditor/ckeditor5/commit/caea11e431fc56f911f4cf4ad4f73bc74d36a8b9))
* **[list](https://www.npmjs.com/package/@ckeditor/ckeditor5-list)**: Introduced screen reader announcements for various actions and events in the editor. ([commit](https://github.com/ckeditor/ckeditor5/commit/c451c9ec247e73fe5d67c45265e4daf510717f05))
* **[media-embed](https://www.npmjs.com/package/@ckeditor/ckeditor5-media-embed)**: An error message should appear when submitting an empty URL in the media embed form. ([commit](https://github.com/ckeditor/ckeditor5/commit/caea11e431fc56f911f4cf4ad4f73bc74d36a8b9))
* **[ui](https://www.npmjs.com/package/@ckeditor/ckeditor5-ui)**: Implemented the `ck-media-forced-colors` and `ck-media-default-colors` mixins for detecting forced colors (for example high contrast mode on Windows). See [#14907](https://github.com/ckeditor/ckeditor5/issues/14907). ([commit](https://github.com/ckeditor/ckeditor5/commit/15cbe77848f720061d8a286f5496e2e1aac27c78))
* **[ui](https://www.npmjs.com/package/@ckeditor/ckeditor5-ui)**: Introduced screen reader announcements for various actions and events in the editor. ([commit](https://github.com/ckeditor/ckeditor5/commit/c451c9ec247e73fe5d67c45265e4daf510717f05))
* **[utils](https://www.npmjs.com/package/@ckeditor/ckeditor5-utils)**: Implemented the `env#isMediaForcedColors` property for forced colors detection (for example high contrast mode on Windows). See [#14907](https://github.com/ckeditor/ckeditor5/issues/14907). ([commit](https://github.com/ckeditor/ckeditor5/commit/15cbe77848f720061d8a286f5496e2e1aac27c78))
* **[utils](https://www.npmjs.com/package/@ckeditor/ckeditor5-utils)**: Implemented the `env#isMotionReduced` property to discover reduced motion preferences. ([commit](https://github.com/ckeditor/ckeditor5/commit/67d2d60762ca1334beda744ce8f0fd28812ce1f1))
* Editor UI should now respect the user's preferences for reduced motion (WCAG 2.1, Success Criterion 2.3.3). ([commit](https://github.com/ckeditor/ckeditor5/commit/67d2d60762ca1334beda744ce8f0fd28812ce1f1))
* Added bundles for new installation methods. See [#15502](https://github.com/ckeditor/ckeditor5/issues/15502). ([commit](https://github.com/ckeditor/ckeditor5/commit/663b16e68c1db445ac19ccf9f36c5d005bf82ac3))
* Introduced accessible screen reader announcements for various actions and events in the editor, including text case change, AI Assistant interactions, template list filtering, and document exports to Word and PDF.

### Bug fixes

* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai)**: Improved accessibility of the UI by setting correct ARIA roles on menus and lists.
* **[autoformat](https://www.npmjs.com/package/@ckeditor/ckeditor5-autoformat)**: Pressing the <kbd>Backspace</kbd> key after autoformat should retain the typed content after undoing the block format change. Closes [#16240](https://github.com/ckeditor/ckeditor5/issues/16240). ([commit](https://github.com/ckeditor/ckeditor5/commit/d45d3e03b2cc2c88d3178b6a8fe8a001a130c4ee))
* **[collaboration-core](https://www.npmjs.com/package/@ckeditor/ckeditor5-collaboration-core)**: Fixed editor crashing due to a missing plugin when the revision history was opened. This happened in some integrations that use custom plugins and specific code minifiers.
* **[comments](https://www.npmjs.com/package/@ckeditor/ckeditor5-comments)**: The container element for comments received the `.ck-content` CSS class to have consistent styles in both edit and preview modes.
* **[comments](https://www.npmjs.com/package/@ckeditor/ckeditor5-comments)**: Restoring revision with comment threads that were removed should no longer crash the editor in the asynchronous load and save integration type.
* **[engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine)**: The HTML `<template>` elements are now properly handled in downcast and upcast conversion. ([commit](https://github.com/ckeditor/ckeditor5/commit/ecaeaa970b4878b5a4ff8cd535f38dec7d80ccbe))
* **[engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine)**: An inline filler should be rendered after the `<br>` element just before a block filler so that scrolling to selection could properly find the client rect. Closes [#14028](https://github.com/ckeditor/ckeditor5/issues/14028). ([commit](https://github.com/ckeditor/ckeditor5/commit/5c0cd22c7030eda3bee2e95464c7082e45cf955a))
* **[export-pdf](https://www.npmjs.com/package/@ckeditor/ckeditor5-export-pdf)**: Improved accessibility of the feature button while an action is performed in the background and the UI is marked as busy.
* **[export-word](https://www.npmjs.com/package/@ckeditor/ckeditor5-export-word)**: Improved accessibility of the feature button while an action is performed in the background and the UI is marked as busy.
* **[format-painter](https://www.npmjs.com/package/@ckeditor/ckeditor5-format-painter)**: Improved accessibility of the UI by setting correct ARIA roles on menus and lists.
* **[image](https://www.npmjs.com/package/@ckeditor/ckeditor5-image)**: An image should not jump upon resizing in a container with padding. Closes [#14698](https://github.com/ckeditor/ckeditor5/issues/14698). ([commit](https://github.com/ckeditor/ckeditor5/commit/ffe310e80f34d7a8675f55ac0d8c63a1fc79c679))
* **[import-word](https://www.npmjs.com/package/@ckeditor/ckeditor5-import-word)**: Improved accessibility of the feature button while an action is performed in the background and the UI is marked as busy.
* **[List](https://www.npmjs.com/package/@ckeditor/ckeditor5-List)**: Order of the `List` and `ListProperties` plugins should not affect the appearance of the icon in the toolbar. Closes [#16192](https://github.com/ckeditor/ckeditor5/issues/16192). ([commit](https://github.com/ckeditor/ckeditor5/commit/f3288742a9218dade0df11e0ba5caa20e4e3e10b))
* **[minimap](https://www.npmjs.com/package/@ckeditor/ckeditor5-minimap)**: The minimap `<iframe>` element should not be unnecessarily exposed to assistive technologies. ([commit](https://github.com/ckeditor/ckeditor5/commit/04a8c63bdad639792727275a0e30832869c7067f))
* **[pagination](https://www.npmjs.com/package/@ckeditor/ckeditor5-pagination)**: The pagination pages container should not get focused during the <kbd>Tab</kbd> key navigation across the website.
* **[restricted-editing](https://www.npmjs.com/package/@ckeditor/ckeditor5-restricted-editing)**: Improved accessibility of the restricted editing dropdown by setting the correct ARIA role on the toolbar menu. ([commit](https://github.com/ckeditor/ckeditor5/commit/04a8c63bdad639792727275a0e30832869c7067f))
* **[restricted-editing](https://www.npmjs.com/package/@ckeditor/ckeditor5-restricted-editing)**: Fixed removing an inline image inside an editable region. Closes [#16218](https://github.com/ckeditor/ckeditor5/issues/16218). ([commit](https://github.com/ckeditor/ckeditor5/commit/6a83afa33426adad638f4ca093fc9555827186e7))
* **[restricted-editing](https://www.npmjs.com/package/@ckeditor/ckeditor5-restricted-editing)**: In the restricted-editing mode, it should be possible to escape from a table by pressing the <kbd>Tab</kbd> key. Closes [#15506](https://github.com/ckeditor/ckeditor5/issues/15506). ([commit](https://github.com/ckeditor/ckeditor5/commit/2a462be508e4044c9547a00b65b6abd08f03b22f))
* **[revision-history](https://www.npmjs.com/package/@ckeditor/ckeditor5-revision-history)**: Improved accessibility of the UI by setting correct ARIA roles on menus and lists.
* **[revision-history](https://www.npmjs.com/package/@ckeditor/ckeditor5-revision-history)**: Opening the revision history viewer will close any open dialog or modal in the editor.
* **[template](https://www.npmjs.com/package/@ckeditor/ckeditor5-template)**: Improved accessibility of the UI by setting correct ARIA roles on menus and lists.
* **[theme-lark](https://www.npmjs.com/package/@ckeditor/ckeditor5-theme-lark)**: The caret should be visible in a placeholder while in forced colors mode (for example high contrast mode on Windows). Improved the look of the placeholders in the forced colors mode. Closes [#14907](https://github.com/ckeditor/ckeditor5/issues/14907). ([commit](https://github.com/ckeditor/ckeditor5/commit/15cbe77848f720061d8a286f5496e2e1aac27c78))
* **[theme-lark](https://www.npmjs.com/package/@ckeditor/ckeditor5-theme-lark)**: The color grid component should render as a grid of labels in the forced colors mode (for example high contrast mode on Windows). Closes [#14907](https://github.com/ckeditor/ckeditor5/issues/14907). ([commit](https://github.com/ckeditor/ckeditor5/commit/15cbe77848f720061d8a286f5496e2e1aac27c78))
* **[track-changes](https://www.npmjs.com/package/@ckeditor/ckeditor5-track-changes)**: Improved accessibility of the UI by setting correct ARIA roles on menus and lists.
* **[track-changes](https://www.npmjs.com/package/@ckeditor/ckeditor5-track-changes)**: The `ignoreResolvedComments` flag will now be correctly handled by the `TrackChangesData#getDataWithAcceptedSuggestions` and `TrackChangesData#getDataWithDiscardedSuggestions` methods.
* **[track-changes](https://www.npmjs.com/package/@ckeditor/ckeditor5-track-changes)**: Suggestion to change list style to default when using legacy lists plugin will no longer cause the editor to throw an error.
* **[ui](https://www.npmjs.com/package/@ckeditor/ckeditor5-ui)**: The color picker should not allow for saving incorrect HEX color values. Added an error message when the color is invalid. ([commit](https://github.com/ckeditor/ckeditor5/commit/caea11e431fc56f911f4cf4ad4f73bc74d36a8b9))
* **[ui](https://www.npmjs.com/package/@ckeditor/ckeditor5-ui)**: Prevented the editor error in a situation when a tooltip was unpinned after it was already removed. This happened when "Unlink" button was pressed while the tooltip was shown. ([commit](https://github.com/ckeditor/ckeditor5/commit/4090042508c86b665ac1bb60981c3d4bd4578042))
* **[utils](https://www.npmjs.com/package/@ckeditor/ckeditor5-utils)**: Allow the `Translations.getPluralForm` type to be `null`. ([commit](https://github.com/ckeditor/ckeditor5/commit/663b16e68c1db445ac19ccf9f36c5d005bf82ac3))
* **[widget](https://www.npmjs.com/package/@ckeditor/ckeditor5-widget)**: An image should not jump upon resizing in a container with padding. Closes [#14698](https://github.com/ckeditor/ckeditor5/issues/14698). ([commit](https://github.com/ckeditor/ckeditor5/commit/ffe310e80f34d7a8675f55ac0d8c63a1fc79c679))
* Change various exports of types and interfaces to type-only exports. ([commit](https://github.com/ckeditor/ckeditor5/commit/663b16e68c1db445ac19ccf9f36c5d005bf82ac3))

### Other changes

* **[comments](https://www.npmjs.com/package/@ckeditor/ckeditor5-comments)**: Comment markers without matching comment thread data will now be removed from the content. Previously, in such cases, an error was thrown in the asynchronous load and save integration type.
* **[engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine)**: Export the `_getModelData`, `_setModelData`, `_parseModel`, `_stringifyModel`, `_getViewData`, `_setViewData`, `_parseView`, and `_stringifyView` helpers. ([commit](https://github.com/ckeditor/ckeditor5/commit/99f82ab5200d80079ccc5313112f73aa4646b1fc))
* **[html-support](https://www.npmjs.com/package/@ckeditor/ckeditor5-html-support)**: The General HTML Support list integration will create proper model structure on upcast and not fire a redundant post-fixer during editor initialization. Closes [#16227](https://github.com/ckeditor/ckeditor5/issues/16227). ([commit](https://github.com/ckeditor/ckeditor5/commit/12d0e5d4b7e013f5222afe28dd260b78219616b2))
* **[track-changes](https://www.npmjs.com/package/@ckeditor/ckeditor5-track-changes)**: `TrackChangesEditing#_descriptionFactory` is now public and renamed to `descriptionFactory`. The old `_descriptionFactory` property was kept as a deprecated alias and will be removed in next major release.
* **[ui](https://www.npmjs.com/package/@ckeditor/ckeditor5-ui)**: Refactored the `AriaLiveAnnouncer` utility to use the `aria-relevant` attribute and make concurrent announcements queued by screen readers. ([commit](https://github.com/ckeditor/ckeditor5/commit/c451c9ec247e73fe5d67c45265e4daf510717f05))
* Updated translations. ([commit](https://github.com/ckeditor/ckeditor5/commit/815d20baa325d9880730017d495d2083579f6b5f), [commit](https://github.com/ckeditor/ckeditor5/commit/b6ef1bda6ba53e276ffe28058456bc72cf6b1231), [commit](https://github.com/ckeditor/ckeditor5/commit/f8b6c2d0c7da37b9aed02f7c8765be68c15f148d))

### Released packages

Check out the [Versioning policy](https://ckeditor.com/docs/ckeditor5/latest/framework/guides/support/versioning-policy.html) guide for more information.

<details>
<summary>Released packages (summary)</summary>

Other releases:

* [@ckeditor/ckeditor5-adapter-ckfinder](https://www.npmjs.com/package/@ckeditor/ckeditor5-adapter-ckfinder/v/41.4.1): v41.4.0 => v41.4.1
* [@ckeditor/ckeditor5-ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai/v/41.4.1): v41.4.0 => v41.4.1
* [@ckeditor/ckeditor5-alignment](https://www.npmjs.com/package/@ckeditor/ckeditor5-alignment/v/41.4.1): v41.4.0 => v41.4.1
* [@ckeditor/ckeditor5-autoformat](https://www.npmjs.com/package/@ckeditor/ckeditor5-autoformat/v/41.4.1): v41.4.0 => v41.4.1
* [@ckeditor/ckeditor5-autosave](https://www.npmjs.com/package/@ckeditor/ckeditor5-autosave/v/41.4.1): v41.4.0 => v41.4.1
* [@ckeditor/ckeditor5-basic-styles](https://www.npmjs.com/package/@ckeditor/ckeditor5-basic-styles/v/41.4.1): v41.4.0 => v41.4.1
* [@ckeditor/ckeditor5-block-quote](https://www.npmjs.com/package/@ckeditor/ckeditor5-block-quote/v/41.4.1): v41.4.0 => v41.4.1
* [@ckeditor/ckeditor5-build-balloon](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-balloon/v/41.4.1): v41.4.0 => v41.4.1
* [@ckeditor/ckeditor5-build-balloon-block](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-balloon-block/v/41.4.1): v41.4.0 => v41.4.1
* [@ckeditor/ckeditor5-build-classic](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-classic/v/41.4.1): v41.4.0 => v41.4.1
* [@ckeditor/ckeditor5-build-decoupled-document](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-decoupled-document/v/41.4.1): v41.4.0 => v41.4.1
* [@ckeditor/ckeditor5-build-inline](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-inline/v/41.4.1): v41.4.0 => v41.4.1
* [@ckeditor/ckeditor5-build-multi-root](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-multi-root/v/41.4.1): v41.4.0 => v41.4.1
* [@ckeditor/ckeditor5-case-change](https://www.npmjs.com/package/@ckeditor/ckeditor5-case-change/v/41.4.1): v41.4.0 => v41.4.1
* [@ckeditor/ckeditor5-ckbox](https://www.npmjs.com/package/@ckeditor/ckeditor5-ckbox/v/41.4.1): v41.4.0 => v41.4.1
* [@ckeditor/ckeditor5-ckfinder](https://www.npmjs.com/package/@ckeditor/ckeditor5-ckfinder/v/41.4.1): v41.4.0 => v41.4.1
* [@ckeditor/ckeditor5-clipboard](https://www.npmjs.com/package/@ckeditor/ckeditor5-clipboard/v/41.4.1): v41.4.0 => v41.4.1
* [@ckeditor/ckeditor5-cloud-services](https://www.npmjs.com/package/@ckeditor/ckeditor5-cloud-services/v/41.4.1): v41.4.0 => v41.4.1
* [@ckeditor/ckeditor5-code-block](https://www.npmjs.com/package/@ckeditor/ckeditor5-code-block/v/41.4.1): v41.4.0 => v41.4.1
* [@ckeditor/ckeditor5-collaboration-core](https://www.npmjs.com/package/@ckeditor/ckeditor5-collaboration-core/v/41.4.1): v41.4.0 => v41.4.1
* [@ckeditor/ckeditor5-comments](https://www.npmjs.com/package/@ckeditor/ckeditor5-comments/v/41.4.1): v41.4.0 => v41.4.1
* [@ckeditor/ckeditor5-core](https://www.npmjs.com/package/@ckeditor/ckeditor5-core/v/41.4.1): v41.4.0 => v41.4.1
* [@ckeditor/ckeditor5-document-outline](https://www.npmjs.com/package/@ckeditor/ckeditor5-document-outline/v/41.4.1): v41.4.0 => v41.4.1
* [@ckeditor/ckeditor5-easy-image](https://www.npmjs.com/package/@ckeditor/ckeditor5-easy-image/v/41.4.1): v41.4.0 => v41.4.1
* [@ckeditor/ckeditor5-editor-balloon](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-balloon/v/41.4.1): v41.4.0 => v41.4.1
* [@ckeditor/ckeditor5-editor-classic](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-classic/v/41.4.1): v41.4.0 => v41.4.1
* [@ckeditor/ckeditor5-editor-decoupled](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-decoupled/v/41.4.1): v41.4.0 => v41.4.1
* [@ckeditor/ckeditor5-editor-inline](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-inline/v/41.4.1): v41.4.0 => v41.4.1
* [@ckeditor/ckeditor5-editor-multi-root](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-multi-root/v/41.4.1): v41.4.0 => v41.4.1
* [@ckeditor/ckeditor5-engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine/v/41.4.1): v41.4.0 => v41.4.1
* [@ckeditor/ckeditor5-enter](https://www.npmjs.com/package/@ckeditor/ckeditor5-enter/v/41.4.1): v41.4.0 => v41.4.1
* [@ckeditor/ckeditor5-essentials](https://www.npmjs.com/package/@ckeditor/ckeditor5-essentials/v/41.4.1): v41.4.0 => v41.4.1
* [@ckeditor/ckeditor5-export-pdf](https://www.npmjs.com/package/@ckeditor/ckeditor5-export-pdf/v/41.4.1): v41.4.0 => v41.4.1
* [@ckeditor/ckeditor5-export-word](https://www.npmjs.com/package/@ckeditor/ckeditor5-export-word/v/41.4.1): v41.4.0 => v41.4.1
* [@ckeditor/ckeditor5-find-and-replace](https://www.npmjs.com/package/@ckeditor/ckeditor5-find-and-replace/v/41.4.1): v41.4.0 => v41.4.1
* [@ckeditor/ckeditor5-font](https://www.npmjs.com/package/@ckeditor/ckeditor5-font/v/41.4.1): v41.4.0 => v41.4.1
* [@ckeditor/ckeditor5-format-painter](https://www.npmjs.com/package/@ckeditor/ckeditor5-format-painter/v/41.4.1): v41.4.0 => v41.4.1
* [@ckeditor/ckeditor5-heading](https://www.npmjs.com/package/@ckeditor/ckeditor5-heading/v/41.4.1): v41.4.0 => v41.4.1
* [@ckeditor/ckeditor5-highlight](https://www.npmjs.com/package/@ckeditor/ckeditor5-highlight/v/41.4.1): v41.4.0 => v41.4.1
* [@ckeditor/ckeditor5-horizontal-line](https://www.npmjs.com/package/@ckeditor/ckeditor5-horizontal-line/v/41.4.1): v41.4.0 => v41.4.1
* [@ckeditor/ckeditor5-html-embed](https://www.npmjs.com/package/@ckeditor/ckeditor5-html-embed/v/41.4.1): v41.4.0 => v41.4.1
* [@ckeditor/ckeditor5-html-support](https://www.npmjs.com/package/@ckeditor/ckeditor5-html-support/v/41.4.1): v41.4.0 => v41.4.1
* [@ckeditor/ckeditor5-image](https://www.npmjs.com/package/@ckeditor/ckeditor5-image/v/41.4.1): v41.4.0 => v41.4.1
* [@ckeditor/ckeditor5-import-word](https://www.npmjs.com/package/@ckeditor/ckeditor5-import-word/v/41.4.1): v41.4.0 => v41.4.1
* [@ckeditor/ckeditor5-indent](https://www.npmjs.com/package/@ckeditor/ckeditor5-indent/v/41.4.1): v41.4.0 => v41.4.1
* [@ckeditor/ckeditor5-language](https://www.npmjs.com/package/@ckeditor/ckeditor5-language/v/41.4.1): v41.4.0 => v41.4.1
* [@ckeditor/ckeditor5-link](https://www.npmjs.com/package/@ckeditor/ckeditor5-link/v/41.4.1): v41.4.0 => v41.4.1
* [@ckeditor/ckeditor5-list](https://www.npmjs.com/package/@ckeditor/ckeditor5-list/v/41.4.1): v41.4.0 => v41.4.1
* [@ckeditor/ckeditor5-list-multi-level](https://www.npmjs.com/package/@ckeditor/ckeditor5-list-multi-level/v/41.4.1): v41.4.0 => v41.4.1
* [@ckeditor/ckeditor5-markdown-gfm](https://www.npmjs.com/package/@ckeditor/ckeditor5-markdown-gfm/v/41.4.1): v41.4.0 => v41.4.1
* [@ckeditor/ckeditor5-media-embed](https://www.npmjs.com/package/@ckeditor/ckeditor5-media-embed/v/41.4.1): v41.4.0 => v41.4.1
* [@ckeditor/ckeditor5-mention](https://www.npmjs.com/package/@ckeditor/ckeditor5-mention/v/41.4.1): v41.4.0 => v41.4.1
* [@ckeditor/ckeditor5-minimap](https://www.npmjs.com/package/@ckeditor/ckeditor5-minimap/v/41.4.1): v41.4.0 => v41.4.1
* [@ckeditor/ckeditor5-operations-compressor](https://www.npmjs.com/package/@ckeditor/ckeditor5-operations-compressor/v/41.4.1): v41.4.0 => v41.4.1
* [@ckeditor/ckeditor5-page-break](https://www.npmjs.com/package/@ckeditor/ckeditor5-page-break/v/41.4.1): v41.4.0 => v41.4.1
* [@ckeditor/ckeditor5-pagination](https://www.npmjs.com/package/@ckeditor/ckeditor5-pagination/v/41.4.1): v41.4.0 => v41.4.1
* [@ckeditor/ckeditor5-paragraph](https://www.npmjs.com/package/@ckeditor/ckeditor5-paragraph/v/41.4.1): v41.4.0 => v41.4.1
* [@ckeditor/ckeditor5-paste-from-office](https://www.npmjs.com/package/@ckeditor/ckeditor5-paste-from-office/v/41.4.1): v41.4.0 => v41.4.1
* [@ckeditor/ckeditor5-paste-from-office-enhanced](https://www.npmjs.com/package/@ckeditor/ckeditor5-paste-from-office-enhanced/v/41.4.1): v41.4.0 => v41.4.1
* [@ckeditor/ckeditor5-real-time-collaboration](https://www.npmjs.com/package/@ckeditor/ckeditor5-real-time-collaboration/v/41.4.1): v41.4.0 => v41.4.1
* [@ckeditor/ckeditor5-remove-format](https://www.npmjs.com/package/@ckeditor/ckeditor5-remove-format/v/41.4.1): v41.4.0 => v41.4.1
* [@ckeditor/ckeditor5-restricted-editing](https://www.npmjs.com/package/@ckeditor/ckeditor5-restricted-editing/v/41.4.1): v41.4.0 => v41.4.1
* [@ckeditor/ckeditor5-revision-history](https://www.npmjs.com/package/@ckeditor/ckeditor5-revision-history/v/41.4.1): v41.4.0 => v41.4.1
* [@ckeditor/ckeditor5-select-all](https://www.npmjs.com/package/@ckeditor/ckeditor5-select-all/v/41.4.1): v41.4.0 => v41.4.1
* [@ckeditor/ckeditor5-show-blocks](https://www.npmjs.com/package/@ckeditor/ckeditor5-show-blocks/v/41.4.1): v41.4.0 => v41.4.1
* [@ckeditor/ckeditor5-slash-command](https://www.npmjs.com/package/@ckeditor/ckeditor5-slash-command/v/41.4.1): v41.4.0 => v41.4.1
* [@ckeditor/ckeditor5-source-editing](https://www.npmjs.com/package/@ckeditor/ckeditor5-source-editing/v/41.4.1): v41.4.0 => v41.4.1
* [@ckeditor/ckeditor5-special-characters](https://www.npmjs.com/package/@ckeditor/ckeditor5-special-characters/v/41.4.1): v41.4.0 => v41.4.1
* [@ckeditor/ckeditor5-style](https://www.npmjs.com/package/@ckeditor/ckeditor5-style/v/41.4.1): v41.4.0 => v41.4.1
* [@ckeditor/ckeditor5-table](https://www.npmjs.com/package/@ckeditor/ckeditor5-table/v/41.4.1): v41.4.0 => v41.4.1
* [@ckeditor/ckeditor5-template](https://www.npmjs.com/package/@ckeditor/ckeditor5-template/v/41.4.1): v41.4.0 => v41.4.1
* [@ckeditor/ckeditor5-theme-lark](https://www.npmjs.com/package/@ckeditor/ckeditor5-theme-lark/v/41.4.1): v41.4.0 => v41.4.1
* [@ckeditor/ckeditor5-track-changes](https://www.npmjs.com/package/@ckeditor/ckeditor5-track-changes/v/41.4.1): v41.4.0 => v41.4.1
* [@ckeditor/ckeditor5-typing](https://www.npmjs.com/package/@ckeditor/ckeditor5-typing/v/41.4.1): v41.4.0 => v41.4.1
* [@ckeditor/ckeditor5-ui](https://www.npmjs.com/package/@ckeditor/ckeditor5-ui/v/41.4.1): v41.4.0 => v41.4.1
* [@ckeditor/ckeditor5-undo](https://www.npmjs.com/package/@ckeditor/ckeditor5-undo/v/41.4.1): v41.4.0 => v41.4.1
* [@ckeditor/ckeditor5-upload](https://www.npmjs.com/package/@ckeditor/ckeditor5-upload/v/41.4.1): v41.4.0 => v41.4.1
* [@ckeditor/ckeditor5-utils](https://www.npmjs.com/package/@ckeditor/ckeditor5-utils/v/41.4.1): v41.4.0 => v41.4.1
* [@ckeditor/ckeditor5-watchdog](https://www.npmjs.com/package/@ckeditor/ckeditor5-watchdog/v/41.4.1): v41.4.0 => v41.4.1
* [@ckeditor/ckeditor5-widget](https://www.npmjs.com/package/@ckeditor/ckeditor5-widget/v/41.4.1): v41.4.0 => v41.4.1
* [@ckeditor/ckeditor5-word-count](https://www.npmjs.com/package/@ckeditor/ckeditor5-word-count/v/41.4.1): v41.4.0 => v41.4.1
* [ckeditor5-collaboration](https://www.npmjs.com/package/ckeditor5-collaboration/v/41.4.1): v41.4.0 => v41.4.1
* [ckeditor5-premium-features](https://www.npmjs.com/package/ckeditor5-premium-features/v/41.4.1): v41.4.0 => v41.4.1
</details>

---

To see all releases, visit the [release page](https://github.com/ckeditor/ckeditor5/releases).
