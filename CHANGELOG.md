Changelog
=========

## [47.7.2](https://github.com/ckeditor/ckeditor5/compare/v47.7.1...v47.7.2) (May 18, 2026)

We are happy to announce the release of CKEditor 5 v47.7.2.

> **ℹ️ Long Term Support Edition release:** This is a [CKEditor 5 Long Term Support (LTS) Edition](https://ckeditor.com/ckeditor-5-lts/) release, available only to LTS subscribers. It delivers security and critical maintenance fixes for the v47 line. [Visit documentation](https://ckeditor.com/docs/ckeditor5/latest/getting-started/setup/using-lts-edition.html) to learn more.

### Release highlights

The release addresses vulnerabilities identified in the [`protobuf.js`](https://www.npmjs.com/package/protobufjs) package, used within our [**`@ckeditor/ckeditor5-operations-compressor`**](https://www.npmjs.com/package/@ckeditor/ckeditor5-operations-compressor) package for real-time collaboration.

Our analysis confirms that vulnerabilities **do not affect** CKEditor 5.

This release primarily aims to ensure that our customers using real-time collaboration features do not encounter unnecessary security alerts from their scanning tools. We are committed to maintaining the highest security standards, and this update reflects our ongoing efforts to safeguard user environments proactively.

### Released packages

Check out the [Versioning policy](https://ckeditor.com/docs/ckeditor5/latest/framework/guides/support/versioning-policy.html) guide for more information.

<details>
<summary>Released packages (summary)</summary>

Other releases:

* [@ckeditor/ckeditor5-adapter-ckfinder](https://www.npmjs.com/package/@ckeditor/ckeditor5-adapter-ckfinder/v/47.7.2): v47.7.1 => v47.7.2
* [@ckeditor/ckeditor5-ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai/v/47.7.2): v47.7.1 => v47.7.2
* [@ckeditor/ckeditor5-alignment](https://www.npmjs.com/package/@ckeditor/ckeditor5-alignment/v/47.7.2): v47.7.1 => v47.7.2
* [@ckeditor/ckeditor5-autoformat](https://www.npmjs.com/package/@ckeditor/ckeditor5-autoformat/v/47.7.2): v47.7.1 => v47.7.2
* [@ckeditor/ckeditor5-autosave](https://www.npmjs.com/package/@ckeditor/ckeditor5-autosave/v/47.7.2): v47.7.1 => v47.7.2
* [@ckeditor/ckeditor5-basic-styles](https://www.npmjs.com/package/@ckeditor/ckeditor5-basic-styles/v/47.7.2): v47.7.1 => v47.7.2
* [@ckeditor/ckeditor5-block-quote](https://www.npmjs.com/package/@ckeditor/ckeditor5-block-quote/v/47.7.2): v47.7.1 => v47.7.2
* [@ckeditor/ckeditor5-bookmark](https://www.npmjs.com/package/@ckeditor/ckeditor5-bookmark/v/47.7.2): v47.7.1 => v47.7.2
* [@ckeditor/ckeditor5-case-change](https://www.npmjs.com/package/@ckeditor/ckeditor5-case-change/v/47.7.2): v47.7.1 => v47.7.2
* [@ckeditor/ckeditor5-ckbox](https://www.npmjs.com/package/@ckeditor/ckeditor5-ckbox/v/47.7.2): v47.7.1 => v47.7.2
* [@ckeditor/ckeditor5-ckfinder](https://www.npmjs.com/package/@ckeditor/ckeditor5-ckfinder/v/47.7.2): v47.7.1 => v47.7.2
* [@ckeditor/ckeditor5-clipboard](https://www.npmjs.com/package/@ckeditor/ckeditor5-clipboard/v/47.7.2): v47.7.1 => v47.7.2
* [@ckeditor/ckeditor5-cloud-services](https://www.npmjs.com/package/@ckeditor/ckeditor5-cloud-services/v/47.7.2): v47.7.1 => v47.7.2
* [@ckeditor/ckeditor5-code-block](https://www.npmjs.com/package/@ckeditor/ckeditor5-code-block/v/47.7.2): v47.7.1 => v47.7.2
* [@ckeditor/ckeditor5-collaboration-core](https://www.npmjs.com/package/@ckeditor/ckeditor5-collaboration-core/v/47.7.2): v47.7.1 => v47.7.2
* [@ckeditor/ckeditor5-comments](https://www.npmjs.com/package/@ckeditor/ckeditor5-comments/v/47.7.2): v47.7.1 => v47.7.2
* [@ckeditor/ckeditor5-core](https://www.npmjs.com/package/@ckeditor/ckeditor5-core/v/47.7.2): v47.7.1 => v47.7.2
* [@ckeditor/ckeditor5-document-outline](https://www.npmjs.com/package/@ckeditor/ckeditor5-document-outline/v/47.7.2): v47.7.1 => v47.7.2
* [@ckeditor/ckeditor5-easy-image](https://www.npmjs.com/package/@ckeditor/ckeditor5-easy-image/v/47.7.2): v47.7.1 => v47.7.2
* [@ckeditor/ckeditor5-editor-balloon](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-balloon/v/47.7.2): v47.7.1 => v47.7.2
* [@ckeditor/ckeditor5-editor-classic](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-classic/v/47.7.2): v47.7.1 => v47.7.2
* [@ckeditor/ckeditor5-editor-decoupled](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-decoupled/v/47.7.2): v47.7.1 => v47.7.2
* [@ckeditor/ckeditor5-editor-inline](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-inline/v/47.7.2): v47.7.1 => v47.7.2
* [@ckeditor/ckeditor5-editor-multi-root](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-multi-root/v/47.7.2): v47.7.1 => v47.7.2
* [@ckeditor/ckeditor5-email](https://www.npmjs.com/package/@ckeditor/ckeditor5-email/v/47.7.2): v47.7.1 => v47.7.2
* [@ckeditor/ckeditor5-emoji](https://www.npmjs.com/package/@ckeditor/ckeditor5-emoji/v/47.7.2): v47.7.1 => v47.7.2
* [@ckeditor/ckeditor5-engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine/v/47.7.2): v47.7.1 => v47.7.2
* [@ckeditor/ckeditor5-enter](https://www.npmjs.com/package/@ckeditor/ckeditor5-enter/v/47.7.2): v47.7.1 => v47.7.2
* [@ckeditor/ckeditor5-essentials](https://www.npmjs.com/package/@ckeditor/ckeditor5-essentials/v/47.7.2): v47.7.1 => v47.7.2
* [@ckeditor/ckeditor5-export-inline-styles](https://www.npmjs.com/package/@ckeditor/ckeditor5-export-inline-styles/v/47.7.2): v47.7.1 => v47.7.2
* [@ckeditor/ckeditor5-export-pdf](https://www.npmjs.com/package/@ckeditor/ckeditor5-export-pdf/v/47.7.2): v47.7.1 => v47.7.2
* [@ckeditor/ckeditor5-export-word](https://www.npmjs.com/package/@ckeditor/ckeditor5-export-word/v/47.7.2): v47.7.1 => v47.7.2
* [@ckeditor/ckeditor5-find-and-replace](https://www.npmjs.com/package/@ckeditor/ckeditor5-find-and-replace/v/47.7.2): v47.7.1 => v47.7.2
* [@ckeditor/ckeditor5-font](https://www.npmjs.com/package/@ckeditor/ckeditor5-font/v/47.7.2): v47.7.1 => v47.7.2
* [@ckeditor/ckeditor5-footnotes](https://www.npmjs.com/package/@ckeditor/ckeditor5-footnotes/v/47.7.2): v47.7.1 => v47.7.2
* [@ckeditor/ckeditor5-format-painter](https://www.npmjs.com/package/@ckeditor/ckeditor5-format-painter/v/47.7.2): v47.7.1 => v47.7.2
* [@ckeditor/ckeditor5-fullscreen](https://www.npmjs.com/package/@ckeditor/ckeditor5-fullscreen/v/47.7.2): v47.7.1 => v47.7.2
* [@ckeditor/ckeditor5-heading](https://www.npmjs.com/package/@ckeditor/ckeditor5-heading/v/47.7.2): v47.7.1 => v47.7.2
* [@ckeditor/ckeditor5-highlight](https://www.npmjs.com/package/@ckeditor/ckeditor5-highlight/v/47.7.2): v47.7.1 => v47.7.2
* [@ckeditor/ckeditor5-horizontal-line](https://www.npmjs.com/package/@ckeditor/ckeditor5-horizontal-line/v/47.7.2): v47.7.1 => v47.7.2
* [@ckeditor/ckeditor5-html-embed](https://www.npmjs.com/package/@ckeditor/ckeditor5-html-embed/v/47.7.2): v47.7.1 => v47.7.2
* [@ckeditor/ckeditor5-html-support](https://www.npmjs.com/package/@ckeditor/ckeditor5-html-support/v/47.7.2): v47.7.1 => v47.7.2
* [@ckeditor/ckeditor5-icons](https://www.npmjs.com/package/@ckeditor/ckeditor5-icons/v/47.7.2): v47.7.1 => v47.7.2
* [@ckeditor/ckeditor5-image](https://www.npmjs.com/package/@ckeditor/ckeditor5-image/v/47.7.2): v47.7.1 => v47.7.2
* [@ckeditor/ckeditor5-import-word](https://www.npmjs.com/package/@ckeditor/ckeditor5-import-word/v/47.7.2): v47.7.1 => v47.7.2
* [@ckeditor/ckeditor5-indent](https://www.npmjs.com/package/@ckeditor/ckeditor5-indent/v/47.7.2): v47.7.1 => v47.7.2
* [@ckeditor/ckeditor5-language](https://www.npmjs.com/package/@ckeditor/ckeditor5-language/v/47.7.2): v47.7.1 => v47.7.2
* [@ckeditor/ckeditor5-line-height](https://www.npmjs.com/package/@ckeditor/ckeditor5-line-height/v/47.7.2): v47.7.1 => v47.7.2
* [@ckeditor/ckeditor5-link](https://www.npmjs.com/package/@ckeditor/ckeditor5-link/v/47.7.2): v47.7.1 => v47.7.2
* [@ckeditor/ckeditor5-list](https://www.npmjs.com/package/@ckeditor/ckeditor5-list/v/47.7.2): v47.7.1 => v47.7.2
* [@ckeditor/ckeditor5-list-multi-level](https://www.npmjs.com/package/@ckeditor/ckeditor5-list-multi-level/v/47.7.2): v47.7.1 => v47.7.2
* [@ckeditor/ckeditor5-markdown-gfm](https://www.npmjs.com/package/@ckeditor/ckeditor5-markdown-gfm/v/47.7.2): v47.7.1 => v47.7.2
* [@ckeditor/ckeditor5-media-embed](https://www.npmjs.com/package/@ckeditor/ckeditor5-media-embed/v/47.7.2): v47.7.1 => v47.7.2
* [@ckeditor/ckeditor5-mention](https://www.npmjs.com/package/@ckeditor/ckeditor5-mention/v/47.7.2): v47.7.1 => v47.7.2
* [@ckeditor/ckeditor5-merge-fields](https://www.npmjs.com/package/@ckeditor/ckeditor5-merge-fields/v/47.7.2): v47.7.1 => v47.7.2
* [@ckeditor/ckeditor5-minimap](https://www.npmjs.com/package/@ckeditor/ckeditor5-minimap/v/47.7.2): v47.7.1 => v47.7.2
* [@ckeditor/ckeditor5-operations-compressor](https://www.npmjs.com/package/@ckeditor/ckeditor5-operations-compressor/v/47.7.2): v47.7.1 => v47.7.2
* [@ckeditor/ckeditor5-page-break](https://www.npmjs.com/package/@ckeditor/ckeditor5-page-break/v/47.7.2): v47.7.1 => v47.7.2
* [@ckeditor/ckeditor5-pagination](https://www.npmjs.com/package/@ckeditor/ckeditor5-pagination/v/47.7.2): v47.7.1 => v47.7.2
* [@ckeditor/ckeditor5-paragraph](https://www.npmjs.com/package/@ckeditor/ckeditor5-paragraph/v/47.7.2): v47.7.1 => v47.7.2
* [@ckeditor/ckeditor5-paste-from-office](https://www.npmjs.com/package/@ckeditor/ckeditor5-paste-from-office/v/47.7.2): v47.7.1 => v47.7.2
* [@ckeditor/ckeditor5-paste-from-office-enhanced](https://www.npmjs.com/package/@ckeditor/ckeditor5-paste-from-office-enhanced/v/47.7.2): v47.7.1 => v47.7.2
* [@ckeditor/ckeditor5-real-time-collaboration](https://www.npmjs.com/package/@ckeditor/ckeditor5-real-time-collaboration/v/47.7.2): v47.7.1 => v47.7.2
* [@ckeditor/ckeditor5-remove-format](https://www.npmjs.com/package/@ckeditor/ckeditor5-remove-format/v/47.7.2): v47.7.1 => v47.7.2
* [@ckeditor/ckeditor5-restricted-editing](https://www.npmjs.com/package/@ckeditor/ckeditor5-restricted-editing/v/47.7.2): v47.7.1 => v47.7.2
* [@ckeditor/ckeditor5-revision-history](https://www.npmjs.com/package/@ckeditor/ckeditor5-revision-history/v/47.7.2): v47.7.1 => v47.7.2
* [@ckeditor/ckeditor5-select-all](https://www.npmjs.com/package/@ckeditor/ckeditor5-select-all/v/47.7.2): v47.7.1 => v47.7.2
* [@ckeditor/ckeditor5-show-blocks](https://www.npmjs.com/package/@ckeditor/ckeditor5-show-blocks/v/47.7.2): v47.7.1 => v47.7.2
* [@ckeditor/ckeditor5-slash-command](https://www.npmjs.com/package/@ckeditor/ckeditor5-slash-command/v/47.7.2): v47.7.1 => v47.7.2
* [@ckeditor/ckeditor5-source-editing](https://www.npmjs.com/package/@ckeditor/ckeditor5-source-editing/v/47.7.2): v47.7.1 => v47.7.2
* [@ckeditor/ckeditor5-source-editing-enhanced](https://www.npmjs.com/package/@ckeditor/ckeditor5-source-editing-enhanced/v/47.7.2): v47.7.1 => v47.7.2
* [@ckeditor/ckeditor5-special-characters](https://www.npmjs.com/package/@ckeditor/ckeditor5-special-characters/v/47.7.2): v47.7.1 => v47.7.2
* [@ckeditor/ckeditor5-style](https://www.npmjs.com/package/@ckeditor/ckeditor5-style/v/47.7.2): v47.7.1 => v47.7.2
* [@ckeditor/ckeditor5-table](https://www.npmjs.com/package/@ckeditor/ckeditor5-table/v/47.7.2): v47.7.1 => v47.7.2
* [@ckeditor/ckeditor5-template](https://www.npmjs.com/package/@ckeditor/ckeditor5-template/v/47.7.2): v47.7.1 => v47.7.2
* [@ckeditor/ckeditor5-theme-lark](https://www.npmjs.com/package/@ckeditor/ckeditor5-theme-lark/v/47.7.2): v47.7.1 => v47.7.2
* [@ckeditor/ckeditor5-track-changes](https://www.npmjs.com/package/@ckeditor/ckeditor5-track-changes/v/47.7.2): v47.7.1 => v47.7.2
* [@ckeditor/ckeditor5-typing](https://www.npmjs.com/package/@ckeditor/ckeditor5-typing/v/47.7.2): v47.7.1 => v47.7.2
* [@ckeditor/ckeditor5-ui](https://www.npmjs.com/package/@ckeditor/ckeditor5-ui/v/47.7.2): v47.7.1 => v47.7.2
* [@ckeditor/ckeditor5-undo](https://www.npmjs.com/package/@ckeditor/ckeditor5-undo/v/47.7.2): v47.7.1 => v47.7.2
* [@ckeditor/ckeditor5-upload](https://www.npmjs.com/package/@ckeditor/ckeditor5-upload/v/47.7.2): v47.7.1 => v47.7.2
* [@ckeditor/ckeditor5-uploadcare](https://www.npmjs.com/package/@ckeditor/ckeditor5-uploadcare/v/47.7.2): v47.7.1 => v47.7.2
* [@ckeditor/ckeditor5-utils](https://www.npmjs.com/package/@ckeditor/ckeditor5-utils/v/47.7.2): v47.7.1 => v47.7.2
* [@ckeditor/ckeditor5-watchdog](https://www.npmjs.com/package/@ckeditor/ckeditor5-watchdog/v/47.7.2): v47.7.1 => v47.7.2
* [@ckeditor/ckeditor5-widget](https://www.npmjs.com/package/@ckeditor/ckeditor5-widget/v/47.7.2): v47.7.1 => v47.7.2
* [@ckeditor/ckeditor5-word-count](https://www.npmjs.com/package/@ckeditor/ckeditor5-word-count/v/47.7.2): v47.7.1 => v47.7.2
* [ckeditor5](https://www.npmjs.com/package/ckeditor5/v/47.7.2): v47.7.1 => v47.7.2
* [ckeditor5-collaboration](https://www.npmjs.com/package/ckeditor5-collaboration/v/47.7.2): v47.7.1 => v47.7.2
* [ckeditor5-premium-features](https://www.npmjs.com/package/ckeditor5-premium-features/v/47.7.2): v47.7.1 => v47.7.2
</details>


## [47.7.1](https://github.com/ckeditor/ckeditor5/compare/v47.7.0...v47.7.1) (April 23, 2026)

We are happy to announce the release of CKEditor 5 v47.7.1.

> **ℹ️ Long Term Support Edition release:** This is a [CKEditor 5 Long Term Support (LTS) Edition](https://ckeditor.com/ckeditor-5-lts/) release, available only to LTS subscribers. It delivers security and critical maintenance fixes for the v47 line. [Visit documentation](https://ckeditor.com/docs/ckeditor5/latest/getting-started/setup/using-lts-edition.html) to learn more.

### Release highlights

The release addresses a vulnerability identified in the [`protobuf.js`](https://www.npmjs.com/package/protobufjs) package ([`CVE-2026-41242`](https://github.com/protobufjs/protobuf.js/security/advisories/GHSA-xq3m-2v4x-88gg)), used within our [**`@ckeditor/ckeditor5-operations-compressor`**](https://www.npmjs.com/package/@ckeditor/ckeditor5-operations-compressor) package for real-time collaboration.

Our analysis confirms that **this vulnerability does not affect CKEditor 5**, as all protobuf definitions are static and pre-compiled at build time, and are never parsed or compiled from untrusted input at runtime - which is the condition required to exploit this issue.

This release primarily aims to ensure that our customers using real-time collaboration features do not encounter unnecessary security alerts from their scanning tools. We are committed to maintaining the highest security standards, and this update reflects our ongoing efforts to safeguard user environments proactively.

### Released packages

Check out the [Versioning policy](https://ckeditor.com/docs/ckeditor5/latest/framework/guides/support/versioning-policy.html) guide for more information.

<details>
<summary>Released packages (summary)</summary>

Other releases:

* [@ckeditor/ckeditor5-adapter-ckfinder](https://www.npmjs.com/package/@ckeditor/ckeditor5-adapter-ckfinder/v/47.7.1): v47.7.0 => v47.7.1
* [@ckeditor/ckeditor5-ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai/v/47.7.1): v47.7.0 => v47.7.1
* [@ckeditor/ckeditor5-alignment](https://www.npmjs.com/package/@ckeditor/ckeditor5-alignment/v/47.7.1): v47.7.0 => v47.7.1
* [@ckeditor/ckeditor5-autoformat](https://www.npmjs.com/package/@ckeditor/ckeditor5-autoformat/v/47.7.1): v47.7.0 => v47.7.1
* [@ckeditor/ckeditor5-autosave](https://www.npmjs.com/package/@ckeditor/ckeditor5-autosave/v/47.7.1): v47.7.0 => v47.7.1
* [@ckeditor/ckeditor5-basic-styles](https://www.npmjs.com/package/@ckeditor/ckeditor5-basic-styles/v/47.7.1): v47.7.0 => v47.7.1
* [@ckeditor/ckeditor5-block-quote](https://www.npmjs.com/package/@ckeditor/ckeditor5-block-quote/v/47.7.1): v47.7.0 => v47.7.1
* [@ckeditor/ckeditor5-bookmark](https://www.npmjs.com/package/@ckeditor/ckeditor5-bookmark/v/47.7.1): v47.7.0 => v47.7.1
* [@ckeditor/ckeditor5-case-change](https://www.npmjs.com/package/@ckeditor/ckeditor5-case-change/v/47.7.1): v47.7.0 => v47.7.1
* [@ckeditor/ckeditor5-ckbox](https://www.npmjs.com/package/@ckeditor/ckeditor5-ckbox/v/47.7.1): v47.7.0 => v47.7.1
* [@ckeditor/ckeditor5-ckfinder](https://www.npmjs.com/package/@ckeditor/ckeditor5-ckfinder/v/47.7.1): v47.7.0 => v47.7.1
* [@ckeditor/ckeditor5-clipboard](https://www.npmjs.com/package/@ckeditor/ckeditor5-clipboard/v/47.7.1): v47.7.0 => v47.7.1
* [@ckeditor/ckeditor5-cloud-services](https://www.npmjs.com/package/@ckeditor/ckeditor5-cloud-services/v/47.7.1): v47.7.0 => v47.7.1
* [@ckeditor/ckeditor5-code-block](https://www.npmjs.com/package/@ckeditor/ckeditor5-code-block/v/47.7.1): v47.7.0 => v47.7.1
* [@ckeditor/ckeditor5-collaboration-core](https://www.npmjs.com/package/@ckeditor/ckeditor5-collaboration-core/v/47.7.1): v47.7.0 => v47.7.1
* [@ckeditor/ckeditor5-comments](https://www.npmjs.com/package/@ckeditor/ckeditor5-comments/v/47.7.1): v47.7.0 => v47.7.1
* [@ckeditor/ckeditor5-core](https://www.npmjs.com/package/@ckeditor/ckeditor5-core/v/47.7.1): v47.7.0 => v47.7.1
* [@ckeditor/ckeditor5-document-outline](https://www.npmjs.com/package/@ckeditor/ckeditor5-document-outline/v/47.7.1): v47.7.0 => v47.7.1
* [@ckeditor/ckeditor5-easy-image](https://www.npmjs.com/package/@ckeditor/ckeditor5-easy-image/v/47.7.1): v47.7.0 => v47.7.1
* [@ckeditor/ckeditor5-editor-balloon](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-balloon/v/47.7.1): v47.7.0 => v47.7.1
* [@ckeditor/ckeditor5-editor-classic](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-classic/v/47.7.1): v47.7.0 => v47.7.1
* [@ckeditor/ckeditor5-editor-decoupled](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-decoupled/v/47.7.1): v47.7.0 => v47.7.1
* [@ckeditor/ckeditor5-editor-inline](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-inline/v/47.7.1): v47.7.0 => v47.7.1
* [@ckeditor/ckeditor5-editor-multi-root](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-multi-root/v/47.7.1): v47.7.0 => v47.7.1
* [@ckeditor/ckeditor5-email](https://www.npmjs.com/package/@ckeditor/ckeditor5-email/v/47.7.1): v47.7.0 => v47.7.1
* [@ckeditor/ckeditor5-emoji](https://www.npmjs.com/package/@ckeditor/ckeditor5-emoji/v/47.7.1): v47.7.0 => v47.7.1
* [@ckeditor/ckeditor5-engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine/v/47.7.1): v47.7.0 => v47.7.1
* [@ckeditor/ckeditor5-enter](https://www.npmjs.com/package/@ckeditor/ckeditor5-enter/v/47.7.1): v47.7.0 => v47.7.1
* [@ckeditor/ckeditor5-essentials](https://www.npmjs.com/package/@ckeditor/ckeditor5-essentials/v/47.7.1): v47.7.0 => v47.7.1
* [@ckeditor/ckeditor5-export-inline-styles](https://www.npmjs.com/package/@ckeditor/ckeditor5-export-inline-styles/v/47.7.1): v47.7.0 => v47.7.1
* [@ckeditor/ckeditor5-export-pdf](https://www.npmjs.com/package/@ckeditor/ckeditor5-export-pdf/v/47.7.1): v47.7.0 => v47.7.1
* [@ckeditor/ckeditor5-export-word](https://www.npmjs.com/package/@ckeditor/ckeditor5-export-word/v/47.7.1): v47.7.0 => v47.7.1
* [@ckeditor/ckeditor5-find-and-replace](https://www.npmjs.com/package/@ckeditor/ckeditor5-find-and-replace/v/47.7.1): v47.7.0 => v47.7.1
* [@ckeditor/ckeditor5-font](https://www.npmjs.com/package/@ckeditor/ckeditor5-font/v/47.7.1): v47.7.0 => v47.7.1
* [@ckeditor/ckeditor5-footnotes](https://www.npmjs.com/package/@ckeditor/ckeditor5-footnotes/v/47.7.1): v47.7.0 => v47.7.1
* [@ckeditor/ckeditor5-format-painter](https://www.npmjs.com/package/@ckeditor/ckeditor5-format-painter/v/47.7.1): v47.7.0 => v47.7.1
* [@ckeditor/ckeditor5-fullscreen](https://www.npmjs.com/package/@ckeditor/ckeditor5-fullscreen/v/47.7.1): v47.7.0 => v47.7.1
* [@ckeditor/ckeditor5-heading](https://www.npmjs.com/package/@ckeditor/ckeditor5-heading/v/47.7.1): v47.7.0 => v47.7.1
* [@ckeditor/ckeditor5-highlight](https://www.npmjs.com/package/@ckeditor/ckeditor5-highlight/v/47.7.1): v47.7.0 => v47.7.1
* [@ckeditor/ckeditor5-horizontal-line](https://www.npmjs.com/package/@ckeditor/ckeditor5-horizontal-line/v/47.7.1): v47.7.0 => v47.7.1
* [@ckeditor/ckeditor5-html-embed](https://www.npmjs.com/package/@ckeditor/ckeditor5-html-embed/v/47.7.1): v47.7.0 => v47.7.1
* [@ckeditor/ckeditor5-html-support](https://www.npmjs.com/package/@ckeditor/ckeditor5-html-support/v/47.7.1): v47.7.0 => v47.7.1
* [@ckeditor/ckeditor5-icons](https://www.npmjs.com/package/@ckeditor/ckeditor5-icons/v/47.7.1): v47.7.0 => v47.7.1
* [@ckeditor/ckeditor5-image](https://www.npmjs.com/package/@ckeditor/ckeditor5-image/v/47.7.1): v47.7.0 => v47.7.1
* [@ckeditor/ckeditor5-import-word](https://www.npmjs.com/package/@ckeditor/ckeditor5-import-word/v/47.7.1): v47.7.0 => v47.7.1
* [@ckeditor/ckeditor5-indent](https://www.npmjs.com/package/@ckeditor/ckeditor5-indent/v/47.7.1): v47.7.0 => v47.7.1
* [@ckeditor/ckeditor5-language](https://www.npmjs.com/package/@ckeditor/ckeditor5-language/v/47.7.1): v47.7.0 => v47.7.1
* [@ckeditor/ckeditor5-line-height](https://www.npmjs.com/package/@ckeditor/ckeditor5-line-height/v/47.7.1): v47.7.0 => v47.7.1
* [@ckeditor/ckeditor5-link](https://www.npmjs.com/package/@ckeditor/ckeditor5-link/v/47.7.1): v47.7.0 => v47.7.1
* [@ckeditor/ckeditor5-list](https://www.npmjs.com/package/@ckeditor/ckeditor5-list/v/47.7.1): v47.7.0 => v47.7.1
* [@ckeditor/ckeditor5-list-multi-level](https://www.npmjs.com/package/@ckeditor/ckeditor5-list-multi-level/v/47.7.1): v47.7.0 => v47.7.1
* [@ckeditor/ckeditor5-markdown-gfm](https://www.npmjs.com/package/@ckeditor/ckeditor5-markdown-gfm/v/47.7.1): v47.7.0 => v47.7.1
* [@ckeditor/ckeditor5-media-embed](https://www.npmjs.com/package/@ckeditor/ckeditor5-media-embed/v/47.7.1): v47.7.0 => v47.7.1
* [@ckeditor/ckeditor5-mention](https://www.npmjs.com/package/@ckeditor/ckeditor5-mention/v/47.7.1): v47.7.0 => v47.7.1
* [@ckeditor/ckeditor5-merge-fields](https://www.npmjs.com/package/@ckeditor/ckeditor5-merge-fields/v/47.7.1): v47.7.0 => v47.7.1
* [@ckeditor/ckeditor5-minimap](https://www.npmjs.com/package/@ckeditor/ckeditor5-minimap/v/47.7.1): v47.7.0 => v47.7.1
* [@ckeditor/ckeditor5-operations-compressor](https://www.npmjs.com/package/@ckeditor/ckeditor5-operations-compressor/v/47.7.1): v47.7.0 => v47.7.1
* [@ckeditor/ckeditor5-page-break](https://www.npmjs.com/package/@ckeditor/ckeditor5-page-break/v/47.7.1): v47.7.0 => v47.7.1
* [@ckeditor/ckeditor5-pagination](https://www.npmjs.com/package/@ckeditor/ckeditor5-pagination/v/47.7.1): v47.7.0 => v47.7.1
* [@ckeditor/ckeditor5-paragraph](https://www.npmjs.com/package/@ckeditor/ckeditor5-paragraph/v/47.7.1): v47.7.0 => v47.7.1
* [@ckeditor/ckeditor5-paste-from-office](https://www.npmjs.com/package/@ckeditor/ckeditor5-paste-from-office/v/47.7.1): v47.7.0 => v47.7.1
* [@ckeditor/ckeditor5-paste-from-office-enhanced](https://www.npmjs.com/package/@ckeditor/ckeditor5-paste-from-office-enhanced/v/47.7.1): v47.7.0 => v47.7.1
* [@ckeditor/ckeditor5-real-time-collaboration](https://www.npmjs.com/package/@ckeditor/ckeditor5-real-time-collaboration/v/47.7.1): v47.7.0 => v47.7.1
* [@ckeditor/ckeditor5-remove-format](https://www.npmjs.com/package/@ckeditor/ckeditor5-remove-format/v/47.7.1): v47.7.0 => v47.7.1
* [@ckeditor/ckeditor5-restricted-editing](https://www.npmjs.com/package/@ckeditor/ckeditor5-restricted-editing/v/47.7.1): v47.7.0 => v47.7.1
* [@ckeditor/ckeditor5-revision-history](https://www.npmjs.com/package/@ckeditor/ckeditor5-revision-history/v/47.7.1): v47.7.0 => v47.7.1
* [@ckeditor/ckeditor5-select-all](https://www.npmjs.com/package/@ckeditor/ckeditor5-select-all/v/47.7.1): v47.7.0 => v47.7.1
* [@ckeditor/ckeditor5-show-blocks](https://www.npmjs.com/package/@ckeditor/ckeditor5-show-blocks/v/47.7.1): v47.7.0 => v47.7.1
* [@ckeditor/ckeditor5-slash-command](https://www.npmjs.com/package/@ckeditor/ckeditor5-slash-command/v/47.7.1): v47.7.0 => v47.7.1
* [@ckeditor/ckeditor5-source-editing](https://www.npmjs.com/package/@ckeditor/ckeditor5-source-editing/v/47.7.1): v47.7.0 => v47.7.1
* [@ckeditor/ckeditor5-source-editing-enhanced](https://www.npmjs.com/package/@ckeditor/ckeditor5-source-editing-enhanced/v/47.7.1): v47.7.0 => v47.7.1
* [@ckeditor/ckeditor5-special-characters](https://www.npmjs.com/package/@ckeditor/ckeditor5-special-characters/v/47.7.1): v47.7.0 => v47.7.1
* [@ckeditor/ckeditor5-style](https://www.npmjs.com/package/@ckeditor/ckeditor5-style/v/47.7.1): v47.7.0 => v47.7.1
* [@ckeditor/ckeditor5-table](https://www.npmjs.com/package/@ckeditor/ckeditor5-table/v/47.7.1): v47.7.0 => v47.7.1
* [@ckeditor/ckeditor5-template](https://www.npmjs.com/package/@ckeditor/ckeditor5-template/v/47.7.1): v47.7.0 => v47.7.1
* [@ckeditor/ckeditor5-theme-lark](https://www.npmjs.com/package/@ckeditor/ckeditor5-theme-lark/v/47.7.1): v47.7.0 => v47.7.1
* [@ckeditor/ckeditor5-track-changes](https://www.npmjs.com/package/@ckeditor/ckeditor5-track-changes/v/47.7.1): v47.7.0 => v47.7.1
* [@ckeditor/ckeditor5-typing](https://www.npmjs.com/package/@ckeditor/ckeditor5-typing/v/47.7.1): v47.7.0 => v47.7.1
* [@ckeditor/ckeditor5-ui](https://www.npmjs.com/package/@ckeditor/ckeditor5-ui/v/47.7.1): v47.7.0 => v47.7.1
* [@ckeditor/ckeditor5-undo](https://www.npmjs.com/package/@ckeditor/ckeditor5-undo/v/47.7.1): v47.7.0 => v47.7.1
* [@ckeditor/ckeditor5-upload](https://www.npmjs.com/package/@ckeditor/ckeditor5-upload/v/47.7.1): v47.7.0 => v47.7.1
* [@ckeditor/ckeditor5-uploadcare](https://www.npmjs.com/package/@ckeditor/ckeditor5-uploadcare/v/47.7.1): v47.7.0 => v47.7.1
* [@ckeditor/ckeditor5-utils](https://www.npmjs.com/package/@ckeditor/ckeditor5-utils/v/47.7.1): v47.7.0 => v47.7.1
* [@ckeditor/ckeditor5-watchdog](https://www.npmjs.com/package/@ckeditor/ckeditor5-watchdog/v/47.7.1): v47.7.0 => v47.7.1
* [@ckeditor/ckeditor5-widget](https://www.npmjs.com/package/@ckeditor/ckeditor5-widget/v/47.7.1): v47.7.0 => v47.7.1
* [@ckeditor/ckeditor5-word-count](https://www.npmjs.com/package/@ckeditor/ckeditor5-word-count/v/47.7.1): v47.7.0 => v47.7.1
* [ckeditor5](https://www.npmjs.com/package/ckeditor5/v/47.7.1): v47.7.0 => v47.7.1
* [ckeditor5-collaboration](https://www.npmjs.com/package/ckeditor5-collaboration/v/47.7.1): v47.7.0 => v47.7.1
* [ckeditor5-premium-features](https://www.npmjs.com/package/ckeditor5-premium-features/v/47.7.1): v47.7.0 => v47.7.1
</details>


## [47.7.0](https://github.com/ckeditor/ckeditor5/compare/v47.6.2...v47.7.0) (April 16, 2026)

### Release highlights

**CKEditor 5 v47.7.0** is the first maintenance release in the **CKEditor 5 Long-term Support (LTS) Edition** line. The LTS Edition is a **paid add-on** to a CKEditor 5 license for teams that want to stay on one major version longer while continuing to receive security updates and selected compatibility fixes.

This release introduces **license verification** for the LTS Edition. If your license key does not include LTS access, the editor will **fail to load**. Aside from this license verification, no other changes were introduced in this release.

#### Which version should you use?

* If your license **includes LTS access**, upgrade to v47.7.0 and remain on the LTS line.
* If you want to stay on the **standard release line**, do not upgrade to v47.7.0 — stay on v47.6.2 or lower, or upgrade to v48.0.0 or later.

#### What is CKEditor 5 LTS Edition?

CKEditor 5 LTS Edition is designed for teams that prefer **long-term stability over frequent upgrades**. It lets you stay on a single major version for up to 3 years, while receiving security updates and compatibility fixes without breaking changes. Unlike the standard release line, which delivers several major releases each year, LTS focuses on **stability and predictable maintenance** rather than ongoing feature development.

To learn more, visit the [LTS documentation](https://ckeditor.com/docs/ckeditor5/latest/getting-started/setup/using-lts-edition.html).

#### How to obtain CKEditor 5 LTS Edition?

It is available as a paid add-on to your existing CKEditor 5 license. [Contact our sales team](https://ckeditor.com/contact-sales/) for pricing and a tailored plan.

### Released packages

Check out the [Versioning policy](https://ckeditor.com/docs/ckeditor5/latest/framework/guides/support/versioning-policy.html) guide for more information.

<details>
<summary>Released packages (summary)</summary>

Other releases:

* [@ckeditor/ckeditor5-adapter-ckfinder](https://www.npmjs.com/package/@ckeditor/ckeditor5-adapter-ckfinder/v/47.7.0): v47.6.2 => v47.7.0
* [@ckeditor/ckeditor5-ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai/v/47.7.0): v47.6.2 => v47.7.0
* [@ckeditor/ckeditor5-alignment](https://www.npmjs.com/package/@ckeditor/ckeditor5-alignment/v/47.7.0): v47.6.2 => v47.7.0
* [@ckeditor/ckeditor5-autoformat](https://www.npmjs.com/package/@ckeditor/ckeditor5-autoformat/v/47.7.0): v47.6.2 => v47.7.0
* [@ckeditor/ckeditor5-autosave](https://www.npmjs.com/package/@ckeditor/ckeditor5-autosave/v/47.7.0): v47.6.2 => v47.7.0
* [@ckeditor/ckeditor5-basic-styles](https://www.npmjs.com/package/@ckeditor/ckeditor5-basic-styles/v/47.7.0): v47.6.2 => v47.7.0
* [@ckeditor/ckeditor5-block-quote](https://www.npmjs.com/package/@ckeditor/ckeditor5-block-quote/v/47.7.0): v47.6.2 => v47.7.0
* [@ckeditor/ckeditor5-bookmark](https://www.npmjs.com/package/@ckeditor/ckeditor5-bookmark/v/47.7.0): v47.6.2 => v47.7.0
* [@ckeditor/ckeditor5-case-change](https://www.npmjs.com/package/@ckeditor/ckeditor5-case-change/v/47.7.0): v47.6.2 => v47.7.0
* [@ckeditor/ckeditor5-ckbox](https://www.npmjs.com/package/@ckeditor/ckeditor5-ckbox/v/47.7.0): v47.6.2 => v47.7.0
* [@ckeditor/ckeditor5-ckfinder](https://www.npmjs.com/package/@ckeditor/ckeditor5-ckfinder/v/47.7.0): v47.6.2 => v47.7.0
* [@ckeditor/ckeditor5-clipboard](https://www.npmjs.com/package/@ckeditor/ckeditor5-clipboard/v/47.7.0): v47.6.2 => v47.7.0
* [@ckeditor/ckeditor5-cloud-services](https://www.npmjs.com/package/@ckeditor/ckeditor5-cloud-services/v/47.7.0): v47.6.2 => v47.7.0
* [@ckeditor/ckeditor5-code-block](https://www.npmjs.com/package/@ckeditor/ckeditor5-code-block/v/47.7.0): v47.6.2 => v47.7.0
* [@ckeditor/ckeditor5-collaboration-core](https://www.npmjs.com/package/@ckeditor/ckeditor5-collaboration-core/v/47.7.0): v47.6.2 => v47.7.0
* [@ckeditor/ckeditor5-comments](https://www.npmjs.com/package/@ckeditor/ckeditor5-comments/v/47.7.0): v47.6.2 => v47.7.0
* [@ckeditor/ckeditor5-core](https://www.npmjs.com/package/@ckeditor/ckeditor5-core/v/47.7.0): v47.6.2 => v47.7.0
* [@ckeditor/ckeditor5-document-outline](https://www.npmjs.com/package/@ckeditor/ckeditor5-document-outline/v/47.7.0): v47.6.2 => v47.7.0
* [@ckeditor/ckeditor5-easy-image](https://www.npmjs.com/package/@ckeditor/ckeditor5-easy-image/v/47.7.0): v47.6.2 => v47.7.0
* [@ckeditor/ckeditor5-editor-balloon](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-balloon/v/47.7.0): v47.6.2 => v47.7.0
* [@ckeditor/ckeditor5-editor-classic](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-classic/v/47.7.0): v47.6.2 => v47.7.0
* [@ckeditor/ckeditor5-editor-decoupled](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-decoupled/v/47.7.0): v47.6.2 => v47.7.0
* [@ckeditor/ckeditor5-editor-inline](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-inline/v/47.7.0): v47.6.2 => v47.7.0
* [@ckeditor/ckeditor5-editor-multi-root](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-multi-root/v/47.7.0): v47.6.2 => v47.7.0
* [@ckeditor/ckeditor5-email](https://www.npmjs.com/package/@ckeditor/ckeditor5-email/v/47.7.0): v47.6.2 => v47.7.0
* [@ckeditor/ckeditor5-emoji](https://www.npmjs.com/package/@ckeditor/ckeditor5-emoji/v/47.7.0): v47.6.2 => v47.7.0
* [@ckeditor/ckeditor5-engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine/v/47.7.0): v47.6.2 => v47.7.0
* [@ckeditor/ckeditor5-enter](https://www.npmjs.com/package/@ckeditor/ckeditor5-enter/v/47.7.0): v47.6.2 => v47.7.0
* [@ckeditor/ckeditor5-essentials](https://www.npmjs.com/package/@ckeditor/ckeditor5-essentials/v/47.7.0): v47.6.2 => v47.7.0
* [@ckeditor/ckeditor5-export-inline-styles](https://www.npmjs.com/package/@ckeditor/ckeditor5-export-inline-styles/v/47.7.0): v47.6.2 => v47.7.0
* [@ckeditor/ckeditor5-export-pdf](https://www.npmjs.com/package/@ckeditor/ckeditor5-export-pdf/v/47.7.0): v47.6.2 => v47.7.0
* [@ckeditor/ckeditor5-export-word](https://www.npmjs.com/package/@ckeditor/ckeditor5-export-word/v/47.7.0): v47.6.2 => v47.7.0
* [@ckeditor/ckeditor5-find-and-replace](https://www.npmjs.com/package/@ckeditor/ckeditor5-find-and-replace/v/47.7.0): v47.6.2 => v47.7.0
* [@ckeditor/ckeditor5-font](https://www.npmjs.com/package/@ckeditor/ckeditor5-font/v/47.7.0): v47.6.2 => v47.7.0
* [@ckeditor/ckeditor5-footnotes](https://www.npmjs.com/package/@ckeditor/ckeditor5-footnotes/v/47.7.0): v47.6.2 => v47.7.0
* [@ckeditor/ckeditor5-format-painter](https://www.npmjs.com/package/@ckeditor/ckeditor5-format-painter/v/47.7.0): v47.6.2 => v47.7.0
* [@ckeditor/ckeditor5-fullscreen](https://www.npmjs.com/package/@ckeditor/ckeditor5-fullscreen/v/47.7.0): v47.6.2 => v47.7.0
* [@ckeditor/ckeditor5-heading](https://www.npmjs.com/package/@ckeditor/ckeditor5-heading/v/47.7.0): v47.6.2 => v47.7.0
* [@ckeditor/ckeditor5-highlight](https://www.npmjs.com/package/@ckeditor/ckeditor5-highlight/v/47.7.0): v47.6.2 => v47.7.0
* [@ckeditor/ckeditor5-horizontal-line](https://www.npmjs.com/package/@ckeditor/ckeditor5-horizontal-line/v/47.7.0): v47.6.2 => v47.7.0
* [@ckeditor/ckeditor5-html-embed](https://www.npmjs.com/package/@ckeditor/ckeditor5-html-embed/v/47.7.0): v47.6.2 => v47.7.0
* [@ckeditor/ckeditor5-html-support](https://www.npmjs.com/package/@ckeditor/ckeditor5-html-support/v/47.7.0): v47.6.2 => v47.7.0
* [@ckeditor/ckeditor5-icons](https://www.npmjs.com/package/@ckeditor/ckeditor5-icons/v/47.7.0): v47.6.2 => v47.7.0
* [@ckeditor/ckeditor5-image](https://www.npmjs.com/package/@ckeditor/ckeditor5-image/v/47.7.0): v47.6.2 => v47.7.0
* [@ckeditor/ckeditor5-import-word](https://www.npmjs.com/package/@ckeditor/ckeditor5-import-word/v/47.7.0): v47.6.2 => v47.7.0
* [@ckeditor/ckeditor5-indent](https://www.npmjs.com/package/@ckeditor/ckeditor5-indent/v/47.7.0): v47.6.2 => v47.7.0
* [@ckeditor/ckeditor5-language](https://www.npmjs.com/package/@ckeditor/ckeditor5-language/v/47.7.0): v47.6.2 => v47.7.0
* [@ckeditor/ckeditor5-line-height](https://www.npmjs.com/package/@ckeditor/ckeditor5-line-height/v/47.7.0): v47.6.2 => v47.7.0
* [@ckeditor/ckeditor5-link](https://www.npmjs.com/package/@ckeditor/ckeditor5-link/v/47.7.0): v47.6.2 => v47.7.0
* [@ckeditor/ckeditor5-list](https://www.npmjs.com/package/@ckeditor/ckeditor5-list/v/47.7.0): v47.6.2 => v47.7.0
* [@ckeditor/ckeditor5-list-multi-level](https://www.npmjs.com/package/@ckeditor/ckeditor5-list-multi-level/v/47.7.0): v47.6.2 => v47.7.0
* [@ckeditor/ckeditor5-markdown-gfm](https://www.npmjs.com/package/@ckeditor/ckeditor5-markdown-gfm/v/47.7.0): v47.6.2 => v47.7.0
* [@ckeditor/ckeditor5-media-embed](https://www.npmjs.com/package/@ckeditor/ckeditor5-media-embed/v/47.7.0): v47.6.2 => v47.7.0
* [@ckeditor/ckeditor5-mention](https://www.npmjs.com/package/@ckeditor/ckeditor5-mention/v/47.7.0): v47.6.2 => v47.7.0
* [@ckeditor/ckeditor5-merge-fields](https://www.npmjs.com/package/@ckeditor/ckeditor5-merge-fields/v/47.7.0): v47.6.2 => v47.7.0
* [@ckeditor/ckeditor5-minimap](https://www.npmjs.com/package/@ckeditor/ckeditor5-minimap/v/47.7.0): v47.6.2 => v47.7.0
* [@ckeditor/ckeditor5-operations-compressor](https://www.npmjs.com/package/@ckeditor/ckeditor5-operations-compressor/v/47.7.0): v47.6.2 => v47.7.0
* [@ckeditor/ckeditor5-page-break](https://www.npmjs.com/package/@ckeditor/ckeditor5-page-break/v/47.7.0): v47.6.2 => v47.7.0
* [@ckeditor/ckeditor5-pagination](https://www.npmjs.com/package/@ckeditor/ckeditor5-pagination/v/47.7.0): v47.6.2 => v47.7.0
* [@ckeditor/ckeditor5-paragraph](https://www.npmjs.com/package/@ckeditor/ckeditor5-paragraph/v/47.7.0): v47.6.2 => v47.7.0
* [@ckeditor/ckeditor5-paste-from-office](https://www.npmjs.com/package/@ckeditor/ckeditor5-paste-from-office/v/47.7.0): v47.6.2 => v47.7.0
* [@ckeditor/ckeditor5-paste-from-office-enhanced](https://www.npmjs.com/package/@ckeditor/ckeditor5-paste-from-office-enhanced/v/47.7.0): v47.6.2 => v47.7.0
* [@ckeditor/ckeditor5-real-time-collaboration](https://www.npmjs.com/package/@ckeditor/ckeditor5-real-time-collaboration/v/47.7.0): v47.6.2 => v47.7.0
* [@ckeditor/ckeditor5-remove-format](https://www.npmjs.com/package/@ckeditor/ckeditor5-remove-format/v/47.7.0): v47.6.2 => v47.7.0
* [@ckeditor/ckeditor5-restricted-editing](https://www.npmjs.com/package/@ckeditor/ckeditor5-restricted-editing/v/47.7.0): v47.6.2 => v47.7.0
* [@ckeditor/ckeditor5-revision-history](https://www.npmjs.com/package/@ckeditor/ckeditor5-revision-history/v/47.7.0): v47.6.2 => v47.7.0
* [@ckeditor/ckeditor5-select-all](https://www.npmjs.com/package/@ckeditor/ckeditor5-select-all/v/47.7.0): v47.6.2 => v47.7.0
* [@ckeditor/ckeditor5-show-blocks](https://www.npmjs.com/package/@ckeditor/ckeditor5-show-blocks/v/47.7.0): v47.6.2 => v47.7.0
* [@ckeditor/ckeditor5-slash-command](https://www.npmjs.com/package/@ckeditor/ckeditor5-slash-command/v/47.7.0): v47.6.2 => v47.7.0
* [@ckeditor/ckeditor5-source-editing](https://www.npmjs.com/package/@ckeditor/ckeditor5-source-editing/v/47.7.0): v47.6.2 => v47.7.0
* [@ckeditor/ckeditor5-source-editing-enhanced](https://www.npmjs.com/package/@ckeditor/ckeditor5-source-editing-enhanced/v/47.7.0): v47.6.2 => v47.7.0
* [@ckeditor/ckeditor5-special-characters](https://www.npmjs.com/package/@ckeditor/ckeditor5-special-characters/v/47.7.0): v47.6.2 => v47.7.0
* [@ckeditor/ckeditor5-style](https://www.npmjs.com/package/@ckeditor/ckeditor5-style/v/47.7.0): v47.6.2 => v47.7.0
* [@ckeditor/ckeditor5-table](https://www.npmjs.com/package/@ckeditor/ckeditor5-table/v/47.7.0): v47.6.2 => v47.7.0
* [@ckeditor/ckeditor5-template](https://www.npmjs.com/package/@ckeditor/ckeditor5-template/v/47.7.0): v47.6.2 => v47.7.0
* [@ckeditor/ckeditor5-theme-lark](https://www.npmjs.com/package/@ckeditor/ckeditor5-theme-lark/v/47.7.0): v47.6.2 => v47.7.0
* [@ckeditor/ckeditor5-track-changes](https://www.npmjs.com/package/@ckeditor/ckeditor5-track-changes/v/47.7.0): v47.6.2 => v47.7.0
* [@ckeditor/ckeditor5-typing](https://www.npmjs.com/package/@ckeditor/ckeditor5-typing/v/47.7.0): v47.6.2 => v47.7.0
* [@ckeditor/ckeditor5-ui](https://www.npmjs.com/package/@ckeditor/ckeditor5-ui/v/47.7.0): v47.6.2 => v47.7.0
* [@ckeditor/ckeditor5-undo](https://www.npmjs.com/package/@ckeditor/ckeditor5-undo/v/47.7.0): v47.6.2 => v47.7.0
* [@ckeditor/ckeditor5-upload](https://www.npmjs.com/package/@ckeditor/ckeditor5-upload/v/47.7.0): v47.6.2 => v47.7.0
* [@ckeditor/ckeditor5-uploadcare](https://www.npmjs.com/package/@ckeditor/ckeditor5-uploadcare/v/47.7.0): v47.6.2 => v47.7.0
* [@ckeditor/ckeditor5-utils](https://www.npmjs.com/package/@ckeditor/ckeditor5-utils/v/47.7.0): v47.6.2 => v47.7.0
* [@ckeditor/ckeditor5-watchdog](https://www.npmjs.com/package/@ckeditor/ckeditor5-watchdog/v/47.7.0): v47.6.2 => v47.7.0
* [@ckeditor/ckeditor5-widget](https://www.npmjs.com/package/@ckeditor/ckeditor5-widget/v/47.7.0): v47.6.2 => v47.7.0
* [@ckeditor/ckeditor5-word-count](https://www.npmjs.com/package/@ckeditor/ckeditor5-word-count/v/47.7.0): v47.6.2 => v47.7.0
* [ckeditor5](https://www.npmjs.com/package/ckeditor5/v/47.7.0): v47.6.2 => v47.7.0
* [ckeditor5-collaboration](https://www.npmjs.com/package/ckeditor5-collaboration/v/47.7.0): v47.6.2 => v47.7.0
* [ckeditor5-premium-features](https://www.npmjs.com/package/ckeditor5-premium-features/v/47.7.0): v47.6.2 => v47.7.0
</details>


## [47.6.2](https://github.com/ckeditor/ckeditor5/compare/v47.6.1...v47.6.2) (April 8, 2026)

We are releasing CKEditor 5 v47.6.2, a patch for the v47 line that removes the no-longer-functional Amazon Bedrock AI integration in the legacy AI Assistant plugin.

### Other changes

* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai)**: Removed the built-in Amazon Bedrock integration in the legacy AI Assistant. The `AWSTextAdapter` class remains available but now throws an error when used, and this change does not affect CKEditor AI. If you rely on this integration, contact [support](https://support.ckeditor.com).

### Released packages

Check out the [Versioning policy](https://ckeditor.com/docs/ckeditor5/latest/framework/guides/support/versioning-policy.html) guide for more information.

<details>
<summary>Released packages (summary)</summary>

Other releases:

* [@ckeditor/ckeditor5-adapter-ckfinder](https://www.npmjs.com/package/@ckeditor/ckeditor5-adapter-ckfinder/v/47.6.2): v47.6.1 => v47.6.2
* [@ckeditor/ckeditor5-ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai/v/47.6.2): v47.6.1 => v47.6.2
* [@ckeditor/ckeditor5-alignment](https://www.npmjs.com/package/@ckeditor/ckeditor5-alignment/v/47.6.2): v47.6.1 => v47.6.2
* [@ckeditor/ckeditor5-autoformat](https://www.npmjs.com/package/@ckeditor/ckeditor5-autoformat/v/47.6.2): v47.6.1 => v47.6.2
* [@ckeditor/ckeditor5-autosave](https://www.npmjs.com/package/@ckeditor/ckeditor5-autosave/v/47.6.2): v47.6.1 => v47.6.2
* [@ckeditor/ckeditor5-basic-styles](https://www.npmjs.com/package/@ckeditor/ckeditor5-basic-styles/v/47.6.2): v47.6.1 => v47.6.2
* [@ckeditor/ckeditor5-block-quote](https://www.npmjs.com/package/@ckeditor/ckeditor5-block-quote/v/47.6.2): v47.6.1 => v47.6.2
* [@ckeditor/ckeditor5-bookmark](https://www.npmjs.com/package/@ckeditor/ckeditor5-bookmark/v/47.6.2): v47.6.1 => v47.6.2
* [@ckeditor/ckeditor5-case-change](https://www.npmjs.com/package/@ckeditor/ckeditor5-case-change/v/47.6.2): v47.6.1 => v47.6.2
* [@ckeditor/ckeditor5-ckbox](https://www.npmjs.com/package/@ckeditor/ckeditor5-ckbox/v/47.6.2): v47.6.1 => v47.6.2
* [@ckeditor/ckeditor5-ckfinder](https://www.npmjs.com/package/@ckeditor/ckeditor5-ckfinder/v/47.6.2): v47.6.1 => v47.6.2
* [@ckeditor/ckeditor5-clipboard](https://www.npmjs.com/package/@ckeditor/ckeditor5-clipboard/v/47.6.2): v47.6.1 => v47.6.2
* [@ckeditor/ckeditor5-cloud-services](https://www.npmjs.com/package/@ckeditor/ckeditor5-cloud-services/v/47.6.2): v47.6.1 => v47.6.2
* [@ckeditor/ckeditor5-code-block](https://www.npmjs.com/package/@ckeditor/ckeditor5-code-block/v/47.6.2): v47.6.1 => v47.6.2
* [@ckeditor/ckeditor5-collaboration-core](https://www.npmjs.com/package/@ckeditor/ckeditor5-collaboration-core/v/47.6.2): v47.6.1 => v47.6.2
* [@ckeditor/ckeditor5-comments](https://www.npmjs.com/package/@ckeditor/ckeditor5-comments/v/47.6.2): v47.6.1 => v47.6.2
* [@ckeditor/ckeditor5-core](https://www.npmjs.com/package/@ckeditor/ckeditor5-core/v/47.6.2): v47.6.1 => v47.6.2
* [@ckeditor/ckeditor5-document-outline](https://www.npmjs.com/package/@ckeditor/ckeditor5-document-outline/v/47.6.2): v47.6.1 => v47.6.2
* [@ckeditor/ckeditor5-easy-image](https://www.npmjs.com/package/@ckeditor/ckeditor5-easy-image/v/47.6.2): v47.6.1 => v47.6.2
* [@ckeditor/ckeditor5-editor-balloon](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-balloon/v/47.6.2): v47.6.1 => v47.6.2
* [@ckeditor/ckeditor5-editor-classic](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-classic/v/47.6.2): v47.6.1 => v47.6.2
* [@ckeditor/ckeditor5-editor-decoupled](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-decoupled/v/47.6.2): v47.6.1 => v47.6.2
* [@ckeditor/ckeditor5-editor-inline](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-inline/v/47.6.2): v47.6.1 => v47.6.2
* [@ckeditor/ckeditor5-editor-multi-root](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-multi-root/v/47.6.2): v47.6.1 => v47.6.2
* [@ckeditor/ckeditor5-email](https://www.npmjs.com/package/@ckeditor/ckeditor5-email/v/47.6.2): v47.6.1 => v47.6.2
* [@ckeditor/ckeditor5-emoji](https://www.npmjs.com/package/@ckeditor/ckeditor5-emoji/v/47.6.2): v47.6.1 => v47.6.2
* [@ckeditor/ckeditor5-engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine/v/47.6.2): v47.6.1 => v47.6.2
* [@ckeditor/ckeditor5-enter](https://www.npmjs.com/package/@ckeditor/ckeditor5-enter/v/47.6.2): v47.6.1 => v47.6.2
* [@ckeditor/ckeditor5-essentials](https://www.npmjs.com/package/@ckeditor/ckeditor5-essentials/v/47.6.2): v47.6.1 => v47.6.2
* [@ckeditor/ckeditor5-export-inline-styles](https://www.npmjs.com/package/@ckeditor/ckeditor5-export-inline-styles/v/47.6.2): v47.6.1 => v47.6.2
* [@ckeditor/ckeditor5-export-pdf](https://www.npmjs.com/package/@ckeditor/ckeditor5-export-pdf/v/47.6.2): v47.6.1 => v47.6.2
* [@ckeditor/ckeditor5-export-word](https://www.npmjs.com/package/@ckeditor/ckeditor5-export-word/v/47.6.2): v47.6.1 => v47.6.2
* [@ckeditor/ckeditor5-find-and-replace](https://www.npmjs.com/package/@ckeditor/ckeditor5-find-and-replace/v/47.6.2): v47.6.1 => v47.6.2
* [@ckeditor/ckeditor5-font](https://www.npmjs.com/package/@ckeditor/ckeditor5-font/v/47.6.2): v47.6.1 => v47.6.2
* [@ckeditor/ckeditor5-footnotes](https://www.npmjs.com/package/@ckeditor/ckeditor5-footnotes/v/47.6.2): v47.6.1 => v47.6.2
* [@ckeditor/ckeditor5-format-painter](https://www.npmjs.com/package/@ckeditor/ckeditor5-format-painter/v/47.6.2): v47.6.1 => v47.6.2
* [@ckeditor/ckeditor5-fullscreen](https://www.npmjs.com/package/@ckeditor/ckeditor5-fullscreen/v/47.6.2): v47.6.1 => v47.6.2
* [@ckeditor/ckeditor5-heading](https://www.npmjs.com/package/@ckeditor/ckeditor5-heading/v/47.6.2): v47.6.1 => v47.6.2
* [@ckeditor/ckeditor5-highlight](https://www.npmjs.com/package/@ckeditor/ckeditor5-highlight/v/47.6.2): v47.6.1 => v47.6.2
* [@ckeditor/ckeditor5-horizontal-line](https://www.npmjs.com/package/@ckeditor/ckeditor5-horizontal-line/v/47.6.2): v47.6.1 => v47.6.2
* [@ckeditor/ckeditor5-html-embed](https://www.npmjs.com/package/@ckeditor/ckeditor5-html-embed/v/47.6.2): v47.6.1 => v47.6.2
* [@ckeditor/ckeditor5-html-support](https://www.npmjs.com/package/@ckeditor/ckeditor5-html-support/v/47.6.2): v47.6.1 => v47.6.2
* [@ckeditor/ckeditor5-icons](https://www.npmjs.com/package/@ckeditor/ckeditor5-icons/v/47.6.2): v47.6.1 => v47.6.2
* [@ckeditor/ckeditor5-image](https://www.npmjs.com/package/@ckeditor/ckeditor5-image/v/47.6.2): v47.6.1 => v47.6.2
* [@ckeditor/ckeditor5-import-word](https://www.npmjs.com/package/@ckeditor/ckeditor5-import-word/v/47.6.2): v47.6.1 => v47.6.2
* [@ckeditor/ckeditor5-indent](https://www.npmjs.com/package/@ckeditor/ckeditor5-indent/v/47.6.2): v47.6.1 => v47.6.2
* [@ckeditor/ckeditor5-language](https://www.npmjs.com/package/@ckeditor/ckeditor5-language/v/47.6.2): v47.6.1 => v47.6.2
* [@ckeditor/ckeditor5-line-height](https://www.npmjs.com/package/@ckeditor/ckeditor5-line-height/v/47.6.2): v47.6.1 => v47.6.2
* [@ckeditor/ckeditor5-link](https://www.npmjs.com/package/@ckeditor/ckeditor5-link/v/47.6.2): v47.6.1 => v47.6.2
* [@ckeditor/ckeditor5-list](https://www.npmjs.com/package/@ckeditor/ckeditor5-list/v/47.6.2): v47.6.1 => v47.6.2
* [@ckeditor/ckeditor5-list-multi-level](https://www.npmjs.com/package/@ckeditor/ckeditor5-list-multi-level/v/47.6.2): v47.6.1 => v47.6.2
* [@ckeditor/ckeditor5-markdown-gfm](https://www.npmjs.com/package/@ckeditor/ckeditor5-markdown-gfm/v/47.6.2): v47.6.1 => v47.6.2
* [@ckeditor/ckeditor5-media-embed](https://www.npmjs.com/package/@ckeditor/ckeditor5-media-embed/v/47.6.2): v47.6.1 => v47.6.2
* [@ckeditor/ckeditor5-mention](https://www.npmjs.com/package/@ckeditor/ckeditor5-mention/v/47.6.2): v47.6.1 => v47.6.2
* [@ckeditor/ckeditor5-merge-fields](https://www.npmjs.com/package/@ckeditor/ckeditor5-merge-fields/v/47.6.2): v47.6.1 => v47.6.2
* [@ckeditor/ckeditor5-minimap](https://www.npmjs.com/package/@ckeditor/ckeditor5-minimap/v/47.6.2): v47.6.1 => v47.6.2
* [@ckeditor/ckeditor5-operations-compressor](https://www.npmjs.com/package/@ckeditor/ckeditor5-operations-compressor/v/47.6.2): v47.6.1 => v47.6.2
* [@ckeditor/ckeditor5-page-break](https://www.npmjs.com/package/@ckeditor/ckeditor5-page-break/v/47.6.2): v47.6.1 => v47.6.2
* [@ckeditor/ckeditor5-pagination](https://www.npmjs.com/package/@ckeditor/ckeditor5-pagination/v/47.6.2): v47.6.1 => v47.6.2
* [@ckeditor/ckeditor5-paragraph](https://www.npmjs.com/package/@ckeditor/ckeditor5-paragraph/v/47.6.2): v47.6.1 => v47.6.2
* [@ckeditor/ckeditor5-paste-from-office](https://www.npmjs.com/package/@ckeditor/ckeditor5-paste-from-office/v/47.6.2): v47.6.1 => v47.6.2
* [@ckeditor/ckeditor5-paste-from-office-enhanced](https://www.npmjs.com/package/@ckeditor/ckeditor5-paste-from-office-enhanced/v/47.6.2): v47.6.1 => v47.6.2
* [@ckeditor/ckeditor5-real-time-collaboration](https://www.npmjs.com/package/@ckeditor/ckeditor5-real-time-collaboration/v/47.6.2): v47.6.1 => v47.6.2
* [@ckeditor/ckeditor5-remove-format](https://www.npmjs.com/package/@ckeditor/ckeditor5-remove-format/v/47.6.2): v47.6.1 => v47.6.2
* [@ckeditor/ckeditor5-restricted-editing](https://www.npmjs.com/package/@ckeditor/ckeditor5-restricted-editing/v/47.6.2): v47.6.1 => v47.6.2
* [@ckeditor/ckeditor5-revision-history](https://www.npmjs.com/package/@ckeditor/ckeditor5-revision-history/v/47.6.2): v47.6.1 => v47.6.2
* [@ckeditor/ckeditor5-select-all](https://www.npmjs.com/package/@ckeditor/ckeditor5-select-all/v/47.6.2): v47.6.1 => v47.6.2
* [@ckeditor/ckeditor5-show-blocks](https://www.npmjs.com/package/@ckeditor/ckeditor5-show-blocks/v/47.6.2): v47.6.1 => v47.6.2
* [@ckeditor/ckeditor5-slash-command](https://www.npmjs.com/package/@ckeditor/ckeditor5-slash-command/v/47.6.2): v47.6.1 => v47.6.2
* [@ckeditor/ckeditor5-source-editing](https://www.npmjs.com/package/@ckeditor/ckeditor5-source-editing/v/47.6.2): v47.6.1 => v47.6.2
* [@ckeditor/ckeditor5-source-editing-enhanced](https://www.npmjs.com/package/@ckeditor/ckeditor5-source-editing-enhanced/v/47.6.2): v47.6.1 => v47.6.2
* [@ckeditor/ckeditor5-special-characters](https://www.npmjs.com/package/@ckeditor/ckeditor5-special-characters/v/47.6.2): v47.6.1 => v47.6.2
* [@ckeditor/ckeditor5-style](https://www.npmjs.com/package/@ckeditor/ckeditor5-style/v/47.6.2): v47.6.1 => v47.6.2
* [@ckeditor/ckeditor5-table](https://www.npmjs.com/package/@ckeditor/ckeditor5-table/v/47.6.2): v47.6.1 => v47.6.2
* [@ckeditor/ckeditor5-template](https://www.npmjs.com/package/@ckeditor/ckeditor5-template/v/47.6.2): v47.6.1 => v47.6.2
* [@ckeditor/ckeditor5-theme-lark](https://www.npmjs.com/package/@ckeditor/ckeditor5-theme-lark/v/47.6.2): v47.6.1 => v47.6.2
* [@ckeditor/ckeditor5-track-changes](https://www.npmjs.com/package/@ckeditor/ckeditor5-track-changes/v/47.6.2): v47.6.1 => v47.6.2
* [@ckeditor/ckeditor5-typing](https://www.npmjs.com/package/@ckeditor/ckeditor5-typing/v/47.6.2): v47.6.1 => v47.6.2
* [@ckeditor/ckeditor5-ui](https://www.npmjs.com/package/@ckeditor/ckeditor5-ui/v/47.6.2): v47.6.1 => v47.6.2
* [@ckeditor/ckeditor5-undo](https://www.npmjs.com/package/@ckeditor/ckeditor5-undo/v/47.6.2): v47.6.1 => v47.6.2
* [@ckeditor/ckeditor5-upload](https://www.npmjs.com/package/@ckeditor/ckeditor5-upload/v/47.6.2): v47.6.1 => v47.6.2
* [@ckeditor/ckeditor5-uploadcare](https://www.npmjs.com/package/@ckeditor/ckeditor5-uploadcare/v/47.6.2): v47.6.1 => v47.6.2
* [@ckeditor/ckeditor5-utils](https://www.npmjs.com/package/@ckeditor/ckeditor5-utils/v/47.6.2): v47.6.1 => v47.6.2
* [@ckeditor/ckeditor5-watchdog](https://www.npmjs.com/package/@ckeditor/ckeditor5-watchdog/v/47.6.2): v47.6.1 => v47.6.2
* [@ckeditor/ckeditor5-widget](https://www.npmjs.com/package/@ckeditor/ckeditor5-widget/v/47.6.2): v47.6.1 => v47.6.2
* [@ckeditor/ckeditor5-word-count](https://www.npmjs.com/package/@ckeditor/ckeditor5-word-count/v/47.6.2): v47.6.1 => v47.6.2
* [ckeditor5](https://www.npmjs.com/package/ckeditor5/v/47.6.2): v47.6.1 => v47.6.2
* [ckeditor5-collaboration](https://www.npmjs.com/package/ckeditor5-collaboration/v/47.6.2): v47.6.1 => v47.6.2
* [ckeditor5-premium-features](https://www.npmjs.com/package/ckeditor5-premium-features/v/47.6.2): v47.6.1 => v47.6.2
</details>


## [47.6.1](https://github.com/ckeditor/ckeditor5/compare/v47.6.0...v47.6.1) (March 11, 2026)

We are releasing CKEditor 5 v47.6.1, a patch that fixed three regressions discovered after v47.6.0.

### Bug fixes

* **[engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine), [undo](https://www.npmjs.com/package/@ckeditor/ckeditor5-undo)**: Fixed undo marker restoration for markers spanning multiple paragraphs. Previously, comments and suggestions could be restored to incorrect ranges. Closes [#19916](https://github.com/ckeditor/ckeditor5/issues/19916).
* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai)**: Resolved an issue where AI Chat would crash when attempting to open a past conversation that was created by a model no longer available.
* **[widget](https://www.npmjs.com/package/@ckeditor/ckeditor5-widget)**: Fixed a regression where the caret (`|`) jumped over an empty paragraph when navigating with arrow keys near widgets. Closes [#19812](https://github.com/ckeditor/ckeditor5/issues/19812).

### Released packages

Check out the [Versioning policy](https://ckeditor.com/docs/ckeditor5/latest/framework/guides/support/versioning-policy.html) guide for more information.

<details>
<summary>Released packages (summary)</summary>

Other releases:

* [@ckeditor/ckeditor5-adapter-ckfinder](https://www.npmjs.com/package/@ckeditor/ckeditor5-adapter-ckfinder/v/47.6.1): v47.6.0 => v47.6.1
* [@ckeditor/ckeditor5-ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai/v/47.6.1): v47.6.0 => v47.6.1
* [@ckeditor/ckeditor5-alignment](https://www.npmjs.com/package/@ckeditor/ckeditor5-alignment/v/47.6.1): v47.6.0 => v47.6.1
* [@ckeditor/ckeditor5-autoformat](https://www.npmjs.com/package/@ckeditor/ckeditor5-autoformat/v/47.6.1): v47.6.0 => v47.6.1
* [@ckeditor/ckeditor5-autosave](https://www.npmjs.com/package/@ckeditor/ckeditor5-autosave/v/47.6.1): v47.6.0 => v47.6.1
* [@ckeditor/ckeditor5-basic-styles](https://www.npmjs.com/package/@ckeditor/ckeditor5-basic-styles/v/47.6.1): v47.6.0 => v47.6.1
* [@ckeditor/ckeditor5-block-quote](https://www.npmjs.com/package/@ckeditor/ckeditor5-block-quote/v/47.6.1): v47.6.0 => v47.6.1
* [@ckeditor/ckeditor5-bookmark](https://www.npmjs.com/package/@ckeditor/ckeditor5-bookmark/v/47.6.1): v47.6.0 => v47.6.1
* [@ckeditor/ckeditor5-case-change](https://www.npmjs.com/package/@ckeditor/ckeditor5-case-change/v/47.6.1): v47.6.0 => v47.6.1
* [@ckeditor/ckeditor5-ckbox](https://www.npmjs.com/package/@ckeditor/ckeditor5-ckbox/v/47.6.1): v47.6.0 => v47.6.1
* [@ckeditor/ckeditor5-ckfinder](https://www.npmjs.com/package/@ckeditor/ckeditor5-ckfinder/v/47.6.1): v47.6.0 => v47.6.1
* [@ckeditor/ckeditor5-clipboard](https://www.npmjs.com/package/@ckeditor/ckeditor5-clipboard/v/47.6.1): v47.6.0 => v47.6.1
* [@ckeditor/ckeditor5-cloud-services](https://www.npmjs.com/package/@ckeditor/ckeditor5-cloud-services/v/47.6.1): v47.6.0 => v47.6.1
* [@ckeditor/ckeditor5-code-block](https://www.npmjs.com/package/@ckeditor/ckeditor5-code-block/v/47.6.1): v47.6.0 => v47.6.1
* [@ckeditor/ckeditor5-collaboration-core](https://www.npmjs.com/package/@ckeditor/ckeditor5-collaboration-core/v/47.6.1): v47.6.0 => v47.6.1
* [@ckeditor/ckeditor5-comments](https://www.npmjs.com/package/@ckeditor/ckeditor5-comments/v/47.6.1): v47.6.0 => v47.6.1
* [@ckeditor/ckeditor5-core](https://www.npmjs.com/package/@ckeditor/ckeditor5-core/v/47.6.1): v47.6.0 => v47.6.1
* [@ckeditor/ckeditor5-document-outline](https://www.npmjs.com/package/@ckeditor/ckeditor5-document-outline/v/47.6.1): v47.6.0 => v47.6.1
* [@ckeditor/ckeditor5-easy-image](https://www.npmjs.com/package/@ckeditor/ckeditor5-easy-image/v/47.6.1): v47.6.0 => v47.6.1
* [@ckeditor/ckeditor5-editor-balloon](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-balloon/v/47.6.1): v47.6.0 => v47.6.1
* [@ckeditor/ckeditor5-editor-classic](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-classic/v/47.6.1): v47.6.0 => v47.6.1
* [@ckeditor/ckeditor5-editor-decoupled](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-decoupled/v/47.6.1): v47.6.0 => v47.6.1
* [@ckeditor/ckeditor5-editor-inline](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-inline/v/47.6.1): v47.6.0 => v47.6.1
* [@ckeditor/ckeditor5-editor-multi-root](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-multi-root/v/47.6.1): v47.6.0 => v47.6.1
* [@ckeditor/ckeditor5-email](https://www.npmjs.com/package/@ckeditor/ckeditor5-email/v/47.6.1): v47.6.0 => v47.6.1
* [@ckeditor/ckeditor5-emoji](https://www.npmjs.com/package/@ckeditor/ckeditor5-emoji/v/47.6.1): v47.6.0 => v47.6.1
* [@ckeditor/ckeditor5-engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine/v/47.6.1): v47.6.0 => v47.6.1
* [@ckeditor/ckeditor5-enter](https://www.npmjs.com/package/@ckeditor/ckeditor5-enter/v/47.6.1): v47.6.0 => v47.6.1
* [@ckeditor/ckeditor5-essentials](https://www.npmjs.com/package/@ckeditor/ckeditor5-essentials/v/47.6.1): v47.6.0 => v47.6.1
* [@ckeditor/ckeditor5-export-inline-styles](https://www.npmjs.com/package/@ckeditor/ckeditor5-export-inline-styles/v/47.6.1): v47.6.0 => v47.6.1
* [@ckeditor/ckeditor5-export-pdf](https://www.npmjs.com/package/@ckeditor/ckeditor5-export-pdf/v/47.6.1): v47.6.0 => v47.6.1
* [@ckeditor/ckeditor5-export-word](https://www.npmjs.com/package/@ckeditor/ckeditor5-export-word/v/47.6.1): v47.6.0 => v47.6.1
* [@ckeditor/ckeditor5-find-and-replace](https://www.npmjs.com/package/@ckeditor/ckeditor5-find-and-replace/v/47.6.1): v47.6.0 => v47.6.1
* [@ckeditor/ckeditor5-font](https://www.npmjs.com/package/@ckeditor/ckeditor5-font/v/47.6.1): v47.6.0 => v47.6.1
* [@ckeditor/ckeditor5-footnotes](https://www.npmjs.com/package/@ckeditor/ckeditor5-footnotes/v/47.6.1): v47.6.0 => v47.6.1
* [@ckeditor/ckeditor5-format-painter](https://www.npmjs.com/package/@ckeditor/ckeditor5-format-painter/v/47.6.1): v47.6.0 => v47.6.1
* [@ckeditor/ckeditor5-fullscreen](https://www.npmjs.com/package/@ckeditor/ckeditor5-fullscreen/v/47.6.1): v47.6.0 => v47.6.1
* [@ckeditor/ckeditor5-heading](https://www.npmjs.com/package/@ckeditor/ckeditor5-heading/v/47.6.1): v47.6.0 => v47.6.1
* [@ckeditor/ckeditor5-highlight](https://www.npmjs.com/package/@ckeditor/ckeditor5-highlight/v/47.6.1): v47.6.0 => v47.6.1
* [@ckeditor/ckeditor5-horizontal-line](https://www.npmjs.com/package/@ckeditor/ckeditor5-horizontal-line/v/47.6.1): v47.6.0 => v47.6.1
* [@ckeditor/ckeditor5-html-embed](https://www.npmjs.com/package/@ckeditor/ckeditor5-html-embed/v/47.6.1): v47.6.0 => v47.6.1
* [@ckeditor/ckeditor5-html-support](https://www.npmjs.com/package/@ckeditor/ckeditor5-html-support/v/47.6.1): v47.6.0 => v47.6.1
* [@ckeditor/ckeditor5-icons](https://www.npmjs.com/package/@ckeditor/ckeditor5-icons/v/47.6.1): v47.6.0 => v47.6.1
* [@ckeditor/ckeditor5-image](https://www.npmjs.com/package/@ckeditor/ckeditor5-image/v/47.6.1): v47.6.0 => v47.6.1
* [@ckeditor/ckeditor5-import-word](https://www.npmjs.com/package/@ckeditor/ckeditor5-import-word/v/47.6.1): v47.6.0 => v47.6.1
* [@ckeditor/ckeditor5-indent](https://www.npmjs.com/package/@ckeditor/ckeditor5-indent/v/47.6.1): v47.6.0 => v47.6.1
* [@ckeditor/ckeditor5-language](https://www.npmjs.com/package/@ckeditor/ckeditor5-language/v/47.6.1): v47.6.0 => v47.6.1
* [@ckeditor/ckeditor5-line-height](https://www.npmjs.com/package/@ckeditor/ckeditor5-line-height/v/47.6.1): v47.6.0 => v47.6.1
* [@ckeditor/ckeditor5-link](https://www.npmjs.com/package/@ckeditor/ckeditor5-link/v/47.6.1): v47.6.0 => v47.6.1
* [@ckeditor/ckeditor5-list](https://www.npmjs.com/package/@ckeditor/ckeditor5-list/v/47.6.1): v47.6.0 => v47.6.1
* [@ckeditor/ckeditor5-list-multi-level](https://www.npmjs.com/package/@ckeditor/ckeditor5-list-multi-level/v/47.6.1): v47.6.0 => v47.6.1
* [@ckeditor/ckeditor5-markdown-gfm](https://www.npmjs.com/package/@ckeditor/ckeditor5-markdown-gfm/v/47.6.1): v47.6.0 => v47.6.1
* [@ckeditor/ckeditor5-media-embed](https://www.npmjs.com/package/@ckeditor/ckeditor5-media-embed/v/47.6.1): v47.6.0 => v47.6.1
* [@ckeditor/ckeditor5-mention](https://www.npmjs.com/package/@ckeditor/ckeditor5-mention/v/47.6.1): v47.6.0 => v47.6.1
* [@ckeditor/ckeditor5-merge-fields](https://www.npmjs.com/package/@ckeditor/ckeditor5-merge-fields/v/47.6.1): v47.6.0 => v47.6.1
* [@ckeditor/ckeditor5-minimap](https://www.npmjs.com/package/@ckeditor/ckeditor5-minimap/v/47.6.1): v47.6.0 => v47.6.1
* [@ckeditor/ckeditor5-operations-compressor](https://www.npmjs.com/package/@ckeditor/ckeditor5-operations-compressor/v/47.6.1): v47.6.0 => v47.6.1
* [@ckeditor/ckeditor5-page-break](https://www.npmjs.com/package/@ckeditor/ckeditor5-page-break/v/47.6.1): v47.6.0 => v47.6.1
* [@ckeditor/ckeditor5-pagination](https://www.npmjs.com/package/@ckeditor/ckeditor5-pagination/v/47.6.1): v47.6.0 => v47.6.1
* [@ckeditor/ckeditor5-paragraph](https://www.npmjs.com/package/@ckeditor/ckeditor5-paragraph/v/47.6.1): v47.6.0 => v47.6.1
* [@ckeditor/ckeditor5-paste-from-office](https://www.npmjs.com/package/@ckeditor/ckeditor5-paste-from-office/v/47.6.1): v47.6.0 => v47.6.1
* [@ckeditor/ckeditor5-paste-from-office-enhanced](https://www.npmjs.com/package/@ckeditor/ckeditor5-paste-from-office-enhanced/v/47.6.1): v47.6.0 => v47.6.1
* [@ckeditor/ckeditor5-real-time-collaboration](https://www.npmjs.com/package/@ckeditor/ckeditor5-real-time-collaboration/v/47.6.1): v47.6.0 => v47.6.1
* [@ckeditor/ckeditor5-remove-format](https://www.npmjs.com/package/@ckeditor/ckeditor5-remove-format/v/47.6.1): v47.6.0 => v47.6.1
* [@ckeditor/ckeditor5-restricted-editing](https://www.npmjs.com/package/@ckeditor/ckeditor5-restricted-editing/v/47.6.1): v47.6.0 => v47.6.1
* [@ckeditor/ckeditor5-revision-history](https://www.npmjs.com/package/@ckeditor/ckeditor5-revision-history/v/47.6.1): v47.6.0 => v47.6.1
* [@ckeditor/ckeditor5-select-all](https://www.npmjs.com/package/@ckeditor/ckeditor5-select-all/v/47.6.1): v47.6.0 => v47.6.1
* [@ckeditor/ckeditor5-show-blocks](https://www.npmjs.com/package/@ckeditor/ckeditor5-show-blocks/v/47.6.1): v47.6.0 => v47.6.1
* [@ckeditor/ckeditor5-slash-command](https://www.npmjs.com/package/@ckeditor/ckeditor5-slash-command/v/47.6.1): v47.6.0 => v47.6.1
* [@ckeditor/ckeditor5-source-editing](https://www.npmjs.com/package/@ckeditor/ckeditor5-source-editing/v/47.6.1): v47.6.0 => v47.6.1
* [@ckeditor/ckeditor5-source-editing-enhanced](https://www.npmjs.com/package/@ckeditor/ckeditor5-source-editing-enhanced/v/47.6.1): v47.6.0 => v47.6.1
* [@ckeditor/ckeditor5-special-characters](https://www.npmjs.com/package/@ckeditor/ckeditor5-special-characters/v/47.6.1): v47.6.0 => v47.6.1
* [@ckeditor/ckeditor5-style](https://www.npmjs.com/package/@ckeditor/ckeditor5-style/v/47.6.1): v47.6.0 => v47.6.1
* [@ckeditor/ckeditor5-table](https://www.npmjs.com/package/@ckeditor/ckeditor5-table/v/47.6.1): v47.6.0 => v47.6.1
* [@ckeditor/ckeditor5-template](https://www.npmjs.com/package/@ckeditor/ckeditor5-template/v/47.6.1): v47.6.0 => v47.6.1
* [@ckeditor/ckeditor5-theme-lark](https://www.npmjs.com/package/@ckeditor/ckeditor5-theme-lark/v/47.6.1): v47.6.0 => v47.6.1
* [@ckeditor/ckeditor5-track-changes](https://www.npmjs.com/package/@ckeditor/ckeditor5-track-changes/v/47.6.1): v47.6.0 => v47.6.1
* [@ckeditor/ckeditor5-typing](https://www.npmjs.com/package/@ckeditor/ckeditor5-typing/v/47.6.1): v47.6.0 => v47.6.1
* [@ckeditor/ckeditor5-ui](https://www.npmjs.com/package/@ckeditor/ckeditor5-ui/v/47.6.1): v47.6.0 => v47.6.1
* [@ckeditor/ckeditor5-undo](https://www.npmjs.com/package/@ckeditor/ckeditor5-undo/v/47.6.1): v47.6.0 => v47.6.1
* [@ckeditor/ckeditor5-upload](https://www.npmjs.com/package/@ckeditor/ckeditor5-upload/v/47.6.1): v47.6.0 => v47.6.1
* [@ckeditor/ckeditor5-uploadcare](https://www.npmjs.com/package/@ckeditor/ckeditor5-uploadcare/v/47.6.1): v47.6.0 => v47.6.1
* [@ckeditor/ckeditor5-utils](https://www.npmjs.com/package/@ckeditor/ckeditor5-utils/v/47.6.1): v47.6.0 => v47.6.1
* [@ckeditor/ckeditor5-watchdog](https://www.npmjs.com/package/@ckeditor/ckeditor5-watchdog/v/47.6.1): v47.6.0 => v47.6.1
* [@ckeditor/ckeditor5-widget](https://www.npmjs.com/package/@ckeditor/ckeditor5-widget/v/47.6.1): v47.6.0 => v47.6.1
* [@ckeditor/ckeditor5-word-count](https://www.npmjs.com/package/@ckeditor/ckeditor5-word-count/v/47.6.1): v47.6.0 => v47.6.1
* [ckeditor5](https://www.npmjs.com/package/ckeditor5/v/47.6.1): v47.6.0 => v47.6.1
* [ckeditor5-collaboration](https://www.npmjs.com/package/ckeditor5-collaboration/v/47.6.1): v47.6.0 => v47.6.1
* [ckeditor5-premium-features](https://www.npmjs.com/package/ckeditor5-premium-features/v/47.6.1): v47.6.0 => v47.6.1
</details>

---

To see all releases, visit the [release page](https://github.com/ckeditor/ckeditor5/releases).
