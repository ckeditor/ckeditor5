Changelog
=========

## [46.0.3](https://github.com/ckeditor/ckeditor5/compare/v46.0.2...v46.0.3) (September 3, 2025)

A Cross-Site Scripting (XSS) vulnerability has been discovered in the CKEditor 5 clipboard package (`CVE-2025-58064`). This vulnerability could be triggered by a specific user action, leading to unauthorized JavaScript code execution, if the attacker managed to insert malicious content into the editor, which might happen with a very specific editor configuration.

This vulnerability affects **only** installations where the editor configuration meets one of the following criteria:

* [HTML embed plugin](https://ckeditor.com/docs/ckeditor5/latest/features/html/html-embed.html) is enabled
* Custom plugin introducing an editable element which implements view [RawElement](https://ckeditor.com/docs/ckeditor5/latest/api/module_engine_view_rawelement-ViewRawElement.html) is enabled

You can read more details in the relevant [security advisory](https://github.com/ckeditor/ckeditor5/security/advisories/GHSA-x9gp-vjh6-3wv6) and [contact us](https://ckeditor.com/contact/) if you have more questions.

### Released packages

Check out the [Versioning policy](https://ckeditor.com/docs/ckeditor5/latest/framework/guides/support/versioning-policy.html) guide for more information.

<details>
<summary>Released packages (summary)</summary>

Other releases:

* [@ckeditor/ckeditor5-adapter-ckfinder](https://www.npmjs.com/package/@ckeditor/ckeditor5-adapter-ckfinder/v/46.0.3): v46.0.2 => v46.0.3
* [@ckeditor/ckeditor5-ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai/v/46.0.3): v46.0.2 => v46.0.3
* [@ckeditor/ckeditor5-alignment](https://www.npmjs.com/package/@ckeditor/ckeditor5-alignment/v/46.0.3): v46.0.2 => v46.0.3
* [@ckeditor/ckeditor5-autoformat](https://www.npmjs.com/package/@ckeditor/ckeditor5-autoformat/v/46.0.3): v46.0.2 => v46.0.3
* [@ckeditor/ckeditor5-autosave](https://www.npmjs.com/package/@ckeditor/ckeditor5-autosave/v/46.0.3): v46.0.2 => v46.0.3
* [@ckeditor/ckeditor5-basic-styles](https://www.npmjs.com/package/@ckeditor/ckeditor5-basic-styles/v/46.0.3): v46.0.2 => v46.0.3
* [@ckeditor/ckeditor5-block-quote](https://www.npmjs.com/package/@ckeditor/ckeditor5-block-quote/v/46.0.3): v46.0.2 => v46.0.3
* [@ckeditor/ckeditor5-bookmark](https://www.npmjs.com/package/@ckeditor/ckeditor5-bookmark/v/46.0.3): v46.0.2 => v46.0.3
* [@ckeditor/ckeditor5-case-change](https://www.npmjs.com/package/@ckeditor/ckeditor5-case-change/v/46.0.3): v46.0.2 => v46.0.3
* [@ckeditor/ckeditor5-ckbox](https://www.npmjs.com/package/@ckeditor/ckeditor5-ckbox/v/46.0.3): v46.0.2 => v46.0.3
* [@ckeditor/ckeditor5-ckfinder](https://www.npmjs.com/package/@ckeditor/ckeditor5-ckfinder/v/46.0.3): v46.0.2 => v46.0.3
* [@ckeditor/ckeditor5-clipboard](https://www.npmjs.com/package/@ckeditor/ckeditor5-clipboard/v/46.0.3): v46.0.2 => v46.0.3
* [@ckeditor/ckeditor5-cloud-services](https://www.npmjs.com/package/@ckeditor/ckeditor5-cloud-services/v/46.0.3): v46.0.2 => v46.0.3
* [@ckeditor/ckeditor5-code-block](https://www.npmjs.com/package/@ckeditor/ckeditor5-code-block/v/46.0.3): v46.0.2 => v46.0.3
* [@ckeditor/ckeditor5-collaboration-core](https://www.npmjs.com/package/@ckeditor/ckeditor5-collaboration-core/v/46.0.3): v46.0.2 => v46.0.3
* [@ckeditor/ckeditor5-comments](https://www.npmjs.com/package/@ckeditor/ckeditor5-comments/v/46.0.3): v46.0.2 => v46.0.3
* [@ckeditor/ckeditor5-core](https://www.npmjs.com/package/@ckeditor/ckeditor5-core/v/46.0.3): v46.0.2 => v46.0.3
* [@ckeditor/ckeditor5-document-outline](https://www.npmjs.com/package/@ckeditor/ckeditor5-document-outline/v/46.0.3): v46.0.2 => v46.0.3
* [@ckeditor/ckeditor5-easy-image](https://www.npmjs.com/package/@ckeditor/ckeditor5-easy-image/v/46.0.3): v46.0.2 => v46.0.3
* [@ckeditor/ckeditor5-editor-balloon](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-balloon/v/46.0.3): v46.0.2 => v46.0.3
* [@ckeditor/ckeditor5-editor-classic](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-classic/v/46.0.3): v46.0.2 => v46.0.3
* [@ckeditor/ckeditor5-editor-decoupled](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-decoupled/v/46.0.3): v46.0.2 => v46.0.3
* [@ckeditor/ckeditor5-editor-inline](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-inline/v/46.0.3): v46.0.2 => v46.0.3
* [@ckeditor/ckeditor5-editor-multi-root](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-multi-root/v/46.0.3): v46.0.2 => v46.0.3
* [@ckeditor/ckeditor5-email](https://www.npmjs.com/package/@ckeditor/ckeditor5-email/v/46.0.3): v46.0.2 => v46.0.3
* [@ckeditor/ckeditor5-emoji](https://www.npmjs.com/package/@ckeditor/ckeditor5-emoji/v/46.0.3): v46.0.2 => v46.0.3
* [@ckeditor/ckeditor5-engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine/v/46.0.3): v46.0.2 => v46.0.3
* [@ckeditor/ckeditor5-enter](https://www.npmjs.com/package/@ckeditor/ckeditor5-enter/v/46.0.3): v46.0.2 => v46.0.3
* [@ckeditor/ckeditor5-essentials](https://www.npmjs.com/package/@ckeditor/ckeditor5-essentials/v/46.0.3): v46.0.2 => v46.0.3
* [@ckeditor/ckeditor5-export-inline-styles](https://www.npmjs.com/package/@ckeditor/ckeditor5-export-inline-styles/v/46.0.3): v46.0.2 => v46.0.3
* [@ckeditor/ckeditor5-export-pdf](https://www.npmjs.com/package/@ckeditor/ckeditor5-export-pdf/v/46.0.3): v46.0.2 => v46.0.3
* [@ckeditor/ckeditor5-export-word](https://www.npmjs.com/package/@ckeditor/ckeditor5-export-word/v/46.0.3): v46.0.2 => v46.0.3
* [@ckeditor/ckeditor5-find-and-replace](https://www.npmjs.com/package/@ckeditor/ckeditor5-find-and-replace/v/46.0.3): v46.0.2 => v46.0.3
* [@ckeditor/ckeditor5-font](https://www.npmjs.com/package/@ckeditor/ckeditor5-font/v/46.0.3): v46.0.2 => v46.0.3
* [@ckeditor/ckeditor5-format-painter](https://www.npmjs.com/package/@ckeditor/ckeditor5-format-painter/v/46.0.3): v46.0.2 => v46.0.3
* [@ckeditor/ckeditor5-fullscreen](https://www.npmjs.com/package/@ckeditor/ckeditor5-fullscreen/v/46.0.3): v46.0.2 => v46.0.3
* [@ckeditor/ckeditor5-heading](https://www.npmjs.com/package/@ckeditor/ckeditor5-heading/v/46.0.3): v46.0.2 => v46.0.3
* [@ckeditor/ckeditor5-highlight](https://www.npmjs.com/package/@ckeditor/ckeditor5-highlight/v/46.0.3): v46.0.2 => v46.0.3
* [@ckeditor/ckeditor5-horizontal-line](https://www.npmjs.com/package/@ckeditor/ckeditor5-horizontal-line/v/46.0.3): v46.0.2 => v46.0.3
* [@ckeditor/ckeditor5-html-embed](https://www.npmjs.com/package/@ckeditor/ckeditor5-html-embed/v/46.0.3): v46.0.2 => v46.0.3
* [@ckeditor/ckeditor5-html-support](https://www.npmjs.com/package/@ckeditor/ckeditor5-html-support/v/46.0.3): v46.0.2 => v46.0.3
* [@ckeditor/ckeditor5-icons](https://www.npmjs.com/package/@ckeditor/ckeditor5-icons/v/46.0.3): v46.0.2 => v46.0.3
* [@ckeditor/ckeditor5-image](https://www.npmjs.com/package/@ckeditor/ckeditor5-image/v/46.0.3): v46.0.2 => v46.0.3
* [@ckeditor/ckeditor5-import-word](https://www.npmjs.com/package/@ckeditor/ckeditor5-import-word/v/46.0.3): v46.0.2 => v46.0.3
* [@ckeditor/ckeditor5-indent](https://www.npmjs.com/package/@ckeditor/ckeditor5-indent/v/46.0.3): v46.0.2 => v46.0.3
* [@ckeditor/ckeditor5-language](https://www.npmjs.com/package/@ckeditor/ckeditor5-language/v/46.0.3): v46.0.2 => v46.0.3
* [@ckeditor/ckeditor5-line-height](https://www.npmjs.com/package/@ckeditor/ckeditor5-line-height/v/46.0.3): v46.0.2 => v46.0.3
* [@ckeditor/ckeditor5-link](https://www.npmjs.com/package/@ckeditor/ckeditor5-link/v/46.0.3): v46.0.2 => v46.0.3
* [@ckeditor/ckeditor5-list](https://www.npmjs.com/package/@ckeditor/ckeditor5-list/v/46.0.3): v46.0.2 => v46.0.3
* [@ckeditor/ckeditor5-list-multi-level](https://www.npmjs.com/package/@ckeditor/ckeditor5-list-multi-level/v/46.0.3): v46.0.2 => v46.0.3
* [@ckeditor/ckeditor5-markdown-gfm](https://www.npmjs.com/package/@ckeditor/ckeditor5-markdown-gfm/v/46.0.3): v46.0.2 => v46.0.3
* [@ckeditor/ckeditor5-media-embed](https://www.npmjs.com/package/@ckeditor/ckeditor5-media-embed/v/46.0.3): v46.0.2 => v46.0.3
* [@ckeditor/ckeditor5-mention](https://www.npmjs.com/package/@ckeditor/ckeditor5-mention/v/46.0.3): v46.0.2 => v46.0.3
* [@ckeditor/ckeditor5-merge-fields](https://www.npmjs.com/package/@ckeditor/ckeditor5-merge-fields/v/46.0.3): v46.0.2 => v46.0.3
* [@ckeditor/ckeditor5-minimap](https://www.npmjs.com/package/@ckeditor/ckeditor5-minimap/v/46.0.3): v46.0.2 => v46.0.3
* [@ckeditor/ckeditor5-operations-compressor](https://www.npmjs.com/package/@ckeditor/ckeditor5-operations-compressor/v/46.0.3): v46.0.2 => v46.0.3
* [@ckeditor/ckeditor5-page-break](https://www.npmjs.com/package/@ckeditor/ckeditor5-page-break/v/46.0.3): v46.0.2 => v46.0.3
* [@ckeditor/ckeditor5-pagination](https://www.npmjs.com/package/@ckeditor/ckeditor5-pagination/v/46.0.3): v46.0.2 => v46.0.3
* [@ckeditor/ckeditor5-paragraph](https://www.npmjs.com/package/@ckeditor/ckeditor5-paragraph/v/46.0.3): v46.0.2 => v46.0.3
* [@ckeditor/ckeditor5-paste-from-office](https://www.npmjs.com/package/@ckeditor/ckeditor5-paste-from-office/v/46.0.3): v46.0.2 => v46.0.3
* [@ckeditor/ckeditor5-paste-from-office-enhanced](https://www.npmjs.com/package/@ckeditor/ckeditor5-paste-from-office-enhanced/v/46.0.3): v46.0.2 => v46.0.3
* [@ckeditor/ckeditor5-real-time-collaboration](https://www.npmjs.com/package/@ckeditor/ckeditor5-real-time-collaboration/v/46.0.3): v46.0.2 => v46.0.3
* [@ckeditor/ckeditor5-remove-format](https://www.npmjs.com/package/@ckeditor/ckeditor5-remove-format/v/46.0.3): v46.0.2 => v46.0.3
* [@ckeditor/ckeditor5-restricted-editing](https://www.npmjs.com/package/@ckeditor/ckeditor5-restricted-editing/v/46.0.3): v46.0.2 => v46.0.3
* [@ckeditor/ckeditor5-revision-history](https://www.npmjs.com/package/@ckeditor/ckeditor5-revision-history/v/46.0.3): v46.0.2 => v46.0.3
* [@ckeditor/ckeditor5-select-all](https://www.npmjs.com/package/@ckeditor/ckeditor5-select-all/v/46.0.3): v46.0.2 => v46.0.3
* [@ckeditor/ckeditor5-show-blocks](https://www.npmjs.com/package/@ckeditor/ckeditor5-show-blocks/v/46.0.3): v46.0.2 => v46.0.3
* [@ckeditor/ckeditor5-slash-command](https://www.npmjs.com/package/@ckeditor/ckeditor5-slash-command/v/46.0.3): v46.0.2 => v46.0.3
* [@ckeditor/ckeditor5-source-editing](https://www.npmjs.com/package/@ckeditor/ckeditor5-source-editing/v/46.0.3): v46.0.2 => v46.0.3
* [@ckeditor/ckeditor5-source-editing-enhanced](https://www.npmjs.com/package/@ckeditor/ckeditor5-source-editing-enhanced/v/46.0.3): v46.0.2 => v46.0.3
* [@ckeditor/ckeditor5-special-characters](https://www.npmjs.com/package/@ckeditor/ckeditor5-special-characters/v/46.0.3): v46.0.2 => v46.0.3
* [@ckeditor/ckeditor5-style](https://www.npmjs.com/package/@ckeditor/ckeditor5-style/v/46.0.3): v46.0.2 => v46.0.3
* [@ckeditor/ckeditor5-table](https://www.npmjs.com/package/@ckeditor/ckeditor5-table/v/46.0.3): v46.0.2 => v46.0.3
* [@ckeditor/ckeditor5-template](https://www.npmjs.com/package/@ckeditor/ckeditor5-template/v/46.0.3): v46.0.2 => v46.0.3
* [@ckeditor/ckeditor5-theme-lark](https://www.npmjs.com/package/@ckeditor/ckeditor5-theme-lark/v/46.0.3): v46.0.2 => v46.0.3
* [@ckeditor/ckeditor5-track-changes](https://www.npmjs.com/package/@ckeditor/ckeditor5-track-changes/v/46.0.3): v46.0.2 => v46.0.3
* [@ckeditor/ckeditor5-typing](https://www.npmjs.com/package/@ckeditor/ckeditor5-typing/v/46.0.3): v46.0.2 => v46.0.3
* [@ckeditor/ckeditor5-ui](https://www.npmjs.com/package/@ckeditor/ckeditor5-ui/v/46.0.3): v46.0.2 => v46.0.3
* [@ckeditor/ckeditor5-undo](https://www.npmjs.com/package/@ckeditor/ckeditor5-undo/v/46.0.3): v46.0.2 => v46.0.3
* [@ckeditor/ckeditor5-upload](https://www.npmjs.com/package/@ckeditor/ckeditor5-upload/v/46.0.3): v46.0.2 => v46.0.3
* [@ckeditor/ckeditor5-uploadcare](https://www.npmjs.com/package/@ckeditor/ckeditor5-uploadcare/v/46.0.3): v46.0.2 => v46.0.3
* [@ckeditor/ckeditor5-utils](https://www.npmjs.com/package/@ckeditor/ckeditor5-utils/v/46.0.3): v46.0.2 => v46.0.3
* [@ckeditor/ckeditor5-watchdog](https://www.npmjs.com/package/@ckeditor/ckeditor5-watchdog/v/46.0.3): v46.0.2 => v46.0.3
* [@ckeditor/ckeditor5-widget](https://www.npmjs.com/package/@ckeditor/ckeditor5-widget/v/46.0.3): v46.0.2 => v46.0.3
* [@ckeditor/ckeditor5-word-count](https://www.npmjs.com/package/@ckeditor/ckeditor5-word-count/v/46.0.3): v46.0.2 => v46.0.3
* [ckeditor5](https://www.npmjs.com/package/ckeditor5/v/46.0.3): v46.0.2 => v46.0.3
* [ckeditor5-collaboration](https://www.npmjs.com/package/ckeditor5-collaboration/v/46.0.3): v46.0.2 => v46.0.3
* [ckeditor5-premium-features](https://www.npmjs.com/package/ckeditor5-premium-features/v/46.0.3): v46.0.2 => v46.0.3
</details>


## [46.0.2](https://github.com/ckeditor/ckeditor5/compare/v46.0.1...v46.0.2) (August 19, 2025)

We are happy to announce the release of CKEditor 5 v46.0.2.

### Release highlights

This hotfix release resolves an issue where archived comment threads could incorrectly appear in the sidebar, ensuring they remain properly contained in the comments archive.

### Bug fixes

* **[comments](https://www.npmjs.com/package/@ckeditor/ckeditor5-comments)**: The `Annotation#isVisible` property of archived comment thread annotations can no longer be modified. This prevents archived comment threads from being incorrectly displayed in the sidebar and ensures they remain properly contained within the archive.

### Released packages

Check out the [Versioning policy](https://ckeditor.com/docs/ckeditor5/latest/framework/guides/support/versioning-policy.html) guide for more information.

<details>
<summary>Released packages (summary)</summary>

Other releases:

* [@ckeditor/ckeditor5-adapter-ckfinder](https://www.npmjs.com/package/@ckeditor/ckeditor5-adapter-ckfinder/v/46.0.2): v46.0.1 => v46.0.2
* [@ckeditor/ckeditor5-ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai/v/46.0.2): v46.0.1 => v46.0.2
* [@ckeditor/ckeditor5-alignment](https://www.npmjs.com/package/@ckeditor/ckeditor5-alignment/v/46.0.2): v46.0.1 => v46.0.2
* [@ckeditor/ckeditor5-autoformat](https://www.npmjs.com/package/@ckeditor/ckeditor5-autoformat/v/46.0.2): v46.0.1 => v46.0.2
* [@ckeditor/ckeditor5-autosave](https://www.npmjs.com/package/@ckeditor/ckeditor5-autosave/v/46.0.2): v46.0.1 => v46.0.2
* [@ckeditor/ckeditor5-basic-styles](https://www.npmjs.com/package/@ckeditor/ckeditor5-basic-styles/v/46.0.2): v46.0.1 => v46.0.2
* [@ckeditor/ckeditor5-block-quote](https://www.npmjs.com/package/@ckeditor/ckeditor5-block-quote/v/46.0.2): v46.0.1 => v46.0.2
* [@ckeditor/ckeditor5-bookmark](https://www.npmjs.com/package/@ckeditor/ckeditor5-bookmark/v/46.0.2): v46.0.1 => v46.0.2
* [@ckeditor/ckeditor5-case-change](https://www.npmjs.com/package/@ckeditor/ckeditor5-case-change/v/46.0.2): v46.0.1 => v46.0.2
* [@ckeditor/ckeditor5-ckbox](https://www.npmjs.com/package/@ckeditor/ckeditor5-ckbox/v/46.0.2): v46.0.1 => v46.0.2
* [@ckeditor/ckeditor5-ckfinder](https://www.npmjs.com/package/@ckeditor/ckeditor5-ckfinder/v/46.0.2): v46.0.1 => v46.0.2
* [@ckeditor/ckeditor5-clipboard](https://www.npmjs.com/package/@ckeditor/ckeditor5-clipboard/v/46.0.2): v46.0.1 => v46.0.2
* [@ckeditor/ckeditor5-cloud-services](https://www.npmjs.com/package/@ckeditor/ckeditor5-cloud-services/v/46.0.2): v46.0.1 => v46.0.2
* [@ckeditor/ckeditor5-code-block](https://www.npmjs.com/package/@ckeditor/ckeditor5-code-block/v/46.0.2): v46.0.1 => v46.0.2
* [@ckeditor/ckeditor5-collaboration-core](https://www.npmjs.com/package/@ckeditor/ckeditor5-collaboration-core/v/46.0.2): v46.0.1 => v46.0.2
* [@ckeditor/ckeditor5-comments](https://www.npmjs.com/package/@ckeditor/ckeditor5-comments/v/46.0.2): v46.0.1 => v46.0.2
* [@ckeditor/ckeditor5-core](https://www.npmjs.com/package/@ckeditor/ckeditor5-core/v/46.0.2): v46.0.1 => v46.0.2
* [@ckeditor/ckeditor5-document-outline](https://www.npmjs.com/package/@ckeditor/ckeditor5-document-outline/v/46.0.2): v46.0.1 => v46.0.2
* [@ckeditor/ckeditor5-easy-image](https://www.npmjs.com/package/@ckeditor/ckeditor5-easy-image/v/46.0.2): v46.0.1 => v46.0.2
* [@ckeditor/ckeditor5-editor-balloon](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-balloon/v/46.0.2): v46.0.1 => v46.0.2
* [@ckeditor/ckeditor5-editor-classic](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-classic/v/46.0.2): v46.0.1 => v46.0.2
* [@ckeditor/ckeditor5-editor-decoupled](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-decoupled/v/46.0.2): v46.0.1 => v46.0.2
* [@ckeditor/ckeditor5-editor-inline](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-inline/v/46.0.2): v46.0.1 => v46.0.2
* [@ckeditor/ckeditor5-editor-multi-root](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-multi-root/v/46.0.2): v46.0.1 => v46.0.2
* [@ckeditor/ckeditor5-email](https://www.npmjs.com/package/@ckeditor/ckeditor5-email/v/46.0.2): v46.0.1 => v46.0.2
* [@ckeditor/ckeditor5-emoji](https://www.npmjs.com/package/@ckeditor/ckeditor5-emoji/v/46.0.2): v46.0.1 => v46.0.2
* [@ckeditor/ckeditor5-engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine/v/46.0.2): v46.0.1 => v46.0.2
* [@ckeditor/ckeditor5-enter](https://www.npmjs.com/package/@ckeditor/ckeditor5-enter/v/46.0.2): v46.0.1 => v46.0.2
* [@ckeditor/ckeditor5-essentials](https://www.npmjs.com/package/@ckeditor/ckeditor5-essentials/v/46.0.2): v46.0.1 => v46.0.2
* [@ckeditor/ckeditor5-export-inline-styles](https://www.npmjs.com/package/@ckeditor/ckeditor5-export-inline-styles/v/46.0.2): v46.0.1 => v46.0.2
* [@ckeditor/ckeditor5-export-pdf](https://www.npmjs.com/package/@ckeditor/ckeditor5-export-pdf/v/46.0.2): v46.0.1 => v46.0.2
* [@ckeditor/ckeditor5-export-word](https://www.npmjs.com/package/@ckeditor/ckeditor5-export-word/v/46.0.2): v46.0.1 => v46.0.2
* [@ckeditor/ckeditor5-find-and-replace](https://www.npmjs.com/package/@ckeditor/ckeditor5-find-and-replace/v/46.0.2): v46.0.1 => v46.0.2
* [@ckeditor/ckeditor5-font](https://www.npmjs.com/package/@ckeditor/ckeditor5-font/v/46.0.2): v46.0.1 => v46.0.2
* [@ckeditor/ckeditor5-format-painter](https://www.npmjs.com/package/@ckeditor/ckeditor5-format-painter/v/46.0.2): v46.0.1 => v46.0.2
* [@ckeditor/ckeditor5-fullscreen](https://www.npmjs.com/package/@ckeditor/ckeditor5-fullscreen/v/46.0.2): v46.0.1 => v46.0.2
* [@ckeditor/ckeditor5-heading](https://www.npmjs.com/package/@ckeditor/ckeditor5-heading/v/46.0.2): v46.0.1 => v46.0.2
* [@ckeditor/ckeditor5-highlight](https://www.npmjs.com/package/@ckeditor/ckeditor5-highlight/v/46.0.2): v46.0.1 => v46.0.2
* [@ckeditor/ckeditor5-horizontal-line](https://www.npmjs.com/package/@ckeditor/ckeditor5-horizontal-line/v/46.0.2): v46.0.1 => v46.0.2
* [@ckeditor/ckeditor5-html-embed](https://www.npmjs.com/package/@ckeditor/ckeditor5-html-embed/v/46.0.2): v46.0.1 => v46.0.2
* [@ckeditor/ckeditor5-html-support](https://www.npmjs.com/package/@ckeditor/ckeditor5-html-support/v/46.0.2): v46.0.1 => v46.0.2
* [@ckeditor/ckeditor5-icons](https://www.npmjs.com/package/@ckeditor/ckeditor5-icons/v/46.0.2): v46.0.1 => v46.0.2
* [@ckeditor/ckeditor5-image](https://www.npmjs.com/package/@ckeditor/ckeditor5-image/v/46.0.2): v46.0.1 => v46.0.2
* [@ckeditor/ckeditor5-import-word](https://www.npmjs.com/package/@ckeditor/ckeditor5-import-word/v/46.0.2): v46.0.1 => v46.0.2
* [@ckeditor/ckeditor5-indent](https://www.npmjs.com/package/@ckeditor/ckeditor5-indent/v/46.0.2): v46.0.1 => v46.0.2
* [@ckeditor/ckeditor5-language](https://www.npmjs.com/package/@ckeditor/ckeditor5-language/v/46.0.2): v46.0.1 => v46.0.2
* [@ckeditor/ckeditor5-line-height](https://www.npmjs.com/package/@ckeditor/ckeditor5-line-height/v/46.0.2): v46.0.1 => v46.0.2
* [@ckeditor/ckeditor5-link](https://www.npmjs.com/package/@ckeditor/ckeditor5-link/v/46.0.2): v46.0.1 => v46.0.2
* [@ckeditor/ckeditor5-list](https://www.npmjs.com/package/@ckeditor/ckeditor5-list/v/46.0.2): v46.0.1 => v46.0.2
* [@ckeditor/ckeditor5-list-multi-level](https://www.npmjs.com/package/@ckeditor/ckeditor5-list-multi-level/v/46.0.2): v46.0.1 => v46.0.2
* [@ckeditor/ckeditor5-markdown-gfm](https://www.npmjs.com/package/@ckeditor/ckeditor5-markdown-gfm/v/46.0.2): v46.0.1 => v46.0.2
* [@ckeditor/ckeditor5-media-embed](https://www.npmjs.com/package/@ckeditor/ckeditor5-media-embed/v/46.0.2): v46.0.1 => v46.0.2
* [@ckeditor/ckeditor5-mention](https://www.npmjs.com/package/@ckeditor/ckeditor5-mention/v/46.0.2): v46.0.1 => v46.0.2
* [@ckeditor/ckeditor5-merge-fields](https://www.npmjs.com/package/@ckeditor/ckeditor5-merge-fields/v/46.0.2): v46.0.1 => v46.0.2
* [@ckeditor/ckeditor5-minimap](https://www.npmjs.com/package/@ckeditor/ckeditor5-minimap/v/46.0.2): v46.0.1 => v46.0.2
* [@ckeditor/ckeditor5-operations-compressor](https://www.npmjs.com/package/@ckeditor/ckeditor5-operations-compressor/v/46.0.2): v46.0.1 => v46.0.2
* [@ckeditor/ckeditor5-page-break](https://www.npmjs.com/package/@ckeditor/ckeditor5-page-break/v/46.0.2): v46.0.1 => v46.0.2
* [@ckeditor/ckeditor5-pagination](https://www.npmjs.com/package/@ckeditor/ckeditor5-pagination/v/46.0.2): v46.0.1 => v46.0.2
* [@ckeditor/ckeditor5-paragraph](https://www.npmjs.com/package/@ckeditor/ckeditor5-paragraph/v/46.0.2): v46.0.1 => v46.0.2
* [@ckeditor/ckeditor5-paste-from-office](https://www.npmjs.com/package/@ckeditor/ckeditor5-paste-from-office/v/46.0.2): v46.0.1 => v46.0.2
* [@ckeditor/ckeditor5-paste-from-office-enhanced](https://www.npmjs.com/package/@ckeditor/ckeditor5-paste-from-office-enhanced/v/46.0.2): v46.0.1 => v46.0.2
* [@ckeditor/ckeditor5-real-time-collaboration](https://www.npmjs.com/package/@ckeditor/ckeditor5-real-time-collaboration/v/46.0.2): v46.0.1 => v46.0.2
* [@ckeditor/ckeditor5-remove-format](https://www.npmjs.com/package/@ckeditor/ckeditor5-remove-format/v/46.0.2): v46.0.1 => v46.0.2
* [@ckeditor/ckeditor5-restricted-editing](https://www.npmjs.com/package/@ckeditor/ckeditor5-restricted-editing/v/46.0.2): v46.0.1 => v46.0.2
* [@ckeditor/ckeditor5-revision-history](https://www.npmjs.com/package/@ckeditor/ckeditor5-revision-history/v/46.0.2): v46.0.1 => v46.0.2
* [@ckeditor/ckeditor5-select-all](https://www.npmjs.com/package/@ckeditor/ckeditor5-select-all/v/46.0.2): v46.0.1 => v46.0.2
* [@ckeditor/ckeditor5-show-blocks](https://www.npmjs.com/package/@ckeditor/ckeditor5-show-blocks/v/46.0.2): v46.0.1 => v46.0.2
* [@ckeditor/ckeditor5-slash-command](https://www.npmjs.com/package/@ckeditor/ckeditor5-slash-command/v/46.0.2): v46.0.1 => v46.0.2
* [@ckeditor/ckeditor5-source-editing](https://www.npmjs.com/package/@ckeditor/ckeditor5-source-editing/v/46.0.2): v46.0.1 => v46.0.2
* [@ckeditor/ckeditor5-source-editing-enhanced](https://www.npmjs.com/package/@ckeditor/ckeditor5-source-editing-enhanced/v/46.0.2): v46.0.1 => v46.0.2
* [@ckeditor/ckeditor5-special-characters](https://www.npmjs.com/package/@ckeditor/ckeditor5-special-characters/v/46.0.2): v46.0.1 => v46.0.2
* [@ckeditor/ckeditor5-style](https://www.npmjs.com/package/@ckeditor/ckeditor5-style/v/46.0.2): v46.0.1 => v46.0.2
* [@ckeditor/ckeditor5-table](https://www.npmjs.com/package/@ckeditor/ckeditor5-table/v/46.0.2): v46.0.1 => v46.0.2
* [@ckeditor/ckeditor5-template](https://www.npmjs.com/package/@ckeditor/ckeditor5-template/v/46.0.2): v46.0.1 => v46.0.2
* [@ckeditor/ckeditor5-theme-lark](https://www.npmjs.com/package/@ckeditor/ckeditor5-theme-lark/v/46.0.2): v46.0.1 => v46.0.2
* [@ckeditor/ckeditor5-track-changes](https://www.npmjs.com/package/@ckeditor/ckeditor5-track-changes/v/46.0.2): v46.0.1 => v46.0.2
* [@ckeditor/ckeditor5-typing](https://www.npmjs.com/package/@ckeditor/ckeditor5-typing/v/46.0.2): v46.0.1 => v46.0.2
* [@ckeditor/ckeditor5-ui](https://www.npmjs.com/package/@ckeditor/ckeditor5-ui/v/46.0.2): v46.0.1 => v46.0.2
* [@ckeditor/ckeditor5-undo](https://www.npmjs.com/package/@ckeditor/ckeditor5-undo/v/46.0.2): v46.0.1 => v46.0.2
* [@ckeditor/ckeditor5-upload](https://www.npmjs.com/package/@ckeditor/ckeditor5-upload/v/46.0.2): v46.0.1 => v46.0.2
* [@ckeditor/ckeditor5-uploadcare](https://www.npmjs.com/package/@ckeditor/ckeditor5-uploadcare/v/46.0.2): v46.0.1 => v46.0.2
* [@ckeditor/ckeditor5-utils](https://www.npmjs.com/package/@ckeditor/ckeditor5-utils/v/46.0.2): v46.0.1 => v46.0.2
* [@ckeditor/ckeditor5-watchdog](https://www.npmjs.com/package/@ckeditor/ckeditor5-watchdog/v/46.0.2): v46.0.1 => v46.0.2
* [@ckeditor/ckeditor5-widget](https://www.npmjs.com/package/@ckeditor/ckeditor5-widget/v/46.0.2): v46.0.1 => v46.0.2
* [@ckeditor/ckeditor5-word-count](https://www.npmjs.com/package/@ckeditor/ckeditor5-word-count/v/46.0.2): v46.0.1 => v46.0.2
* [ckeditor5](https://www.npmjs.com/package/ckeditor5/v/46.0.2): v46.0.1 => v46.0.2
* [ckeditor5-collaboration](https://www.npmjs.com/package/ckeditor5-collaboration/v/46.0.2): v46.0.1 => v46.0.2
* [ckeditor5-premium-features](https://www.npmjs.com/package/ckeditor5-premium-features/v/46.0.2): v46.0.1 => v46.0.2
</details>


## [46.0.1](https://github.com/ckeditor/ckeditor5/compare/v46.0.0...v46.0.1) (August 11, 2025)

We are happy to announce the release of CKEditor 5 v46.0.1.

### Release highlights

#### Complete documentation redesign is here

We have prepared a new theme for our documentation to enhance its quality. The new look improves readability and addresses several accessibility issues for a better experience. The redesigned navigation bar gives more useful access to various sections of the documentation, making it easier to reference guides for all our products. Improved table of contents makes browsing and finding guides easier, paired with updated search functionality. Check out the new experience yourself!

#### The pagination plugin just got better

This release introduces a significant pagination update, along with numerous fixes. Page breaks are now calculated taking into account the content styles, bookmark markers, and with better tolerance calculation. Pagination now also finds the correct breakpoint for large tables of contents and images taller than the page.

#### Table handling with pagination and export to PDF

The pagination and export to PDF features now better support tables containing one or more paragraphs. Cell margins are now correctly applied in exported tables, which improves the precision of pagination rendering.

### Bug fixes

* **[export-word](https://www.npmjs.com/package/@ckeditor/ckeditor5-export-word), [list-multi-level](https://www.npmjs.com/package/@ckeditor/ckeditor5-list-multi-level), [real-time-collaboration](https://www.npmjs.com/package/@ckeditor/ckeditor5-real-time-collaboration), [revision-history](https://www.npmjs.com/package/@ckeditor/ckeditor5-revision-history), [track-changes](https://www.npmjs.com/package/@ckeditor/ckeditor5-track-changes)**: Fixed a bug that caused TypeScript to report compilation errors in `.d.ts` files (e.g. `Module has no exported member`) when adding the `ckeditor5-premium-features` dependency to a project that installs CKEditor 5. The issue was caused by TypeScript compilation problems in the `ckeditor5-premium-features` package and affected users who didn't have `"skipLibCheck": true` set in their `tsconfig.json`.
* **[export-pdf](https://www.npmjs.com/package/@ckeditor/ckeditor5-export-pdf), [pagination](https://www.npmjs.com/package/@ckeditor/ckeditor5-pagination)**: The pagination and export to PDF features now better support tables containing one or more paragraphs. Cell margins are now correctly applied in exported tables, which improves the precision of pagination rendering.
* **[comments](https://www.npmjs.com/package/@ckeditor/ckeditor5-comments), [track-changes](https://www.npmjs.com/package/@ckeditor/ckeditor5-track-changes)**: Annotations will now be hidden in the sidebar when the target element is not a valid DOM element, preventing sidebar flickering and the appearance of orphaned annotations.
* **[comments](https://www.npmjs.com/package/@ckeditor/ckeditor5-comments)**: Resolved comment thread highlight will now be properly removed from the editing area when the comments archive is closed while the editor is in read-only mode.
* **[comments](https://www.npmjs.com/package/@ckeditor/ckeditor5-comments)**: Fixed `CommentsEditing` being exported as type instead of value.
* **[html-support](https://www.npmjs.com/package/@ckeditor/ckeditor5-html-support)**: Fixed following plugins being exported as types instead of values: `CodeBlockElementSupport`, `CustomElementSupport`, `ListElementSupport`, `DualContentModelElementSupport`, `HeadingElementSupport`, `ImageElementSupport`, `MediaEmbedElementSupport`, `ScriptElementSupport`, `StyleElementSupport`, `TableElementSupport`, `HorizontalLineElementSupport`. Closes [#18855](https://github.com/ckeditor/ckeditor5/issues/18855).
* **[list](https://www.npmjs.com/package/@ckeditor/ckeditor5-list)**: Fix the vertical spacing of a single paragraph in the list item with a nested list. Closes [#18831](https://github.com/ckeditor/ckeditor5/issues/18831).
* **[pagination](https://www.npmjs.com/package/@ckeditor/ckeditor5-pagination)**: Pagination correctly handles content styles like `.ck-content > :first-child`.
* **[pagination](https://www.npmjs.com/package/@ckeditor/ckeditor5-pagination)**: Pagination lines do not change position depending on user selection.
* **[pagination](https://www.npmjs.com/package/@ckeditor/ckeditor5-pagination)**: Pagination correctly finds page breaks on a large table of contents.
* **[pagination](https://www.npmjs.com/package/@ckeditor/ckeditor5-pagination)**: The pagination line is correctly positioned when there is a bookmark element at the start of the block.
* **[pagination](https://www.npmjs.com/package/@ckeditor/ckeditor5-pagination)**: Pagination can find page breaks on images taller than a page height.
* **[paste-from-office](https://www.npmjs.com/package/@ckeditor/ckeditor5-paste-from-office)**: Clean the `width: 0` attribute when tables are pasted from Word.
* **[revision-history](https://www.npmjs.com/package/@ckeditor/ckeditor5-revision-history)**: Fixed `RevisionViewerIntegration` being exported as type instead of value.
* **[table](https://www.npmjs.com/package/@ckeditor/ckeditor5-table)**: Tables should not be stretched to full page width when printed.
* **[table](https://www.npmjs.com/package/@ckeditor/ckeditor5-table)**: The table caption should not be scrambled when the document is printed. Closes [#18903](https://github.com/ckeditor/ckeditor5/issues/18903).
* **[track-changes](https://www.npmjs.com/package/@ckeditor/ckeditor5-track-changes)**: Fixed multiple cases where suggestion markers were created on incorrect ranges, causing sidebar flickering.
* **[track-changes](https://www.npmjs.com/package/@ckeditor/ckeditor5-track-changes)**: Fixed `TrackChangesUI` missing an export.
* **[utils](https://www.npmjs.com/package/@ckeditor/ckeditor5-utils)**: Fixed the `Identifier 'global' has already been declared.` error being thrown in some environments due to the global variable name in the `@ckeditor/ckeditor5-utils` package. Closes [#18856](https://github.com/ckeditor/ckeditor5/issues/18856).

### Other changes

* **[collaboration-core](https://www.npmjs.com/package/@ckeditor/ckeditor5-collaboration-core)**: Make `CollaborationUserColor#id` a public readonly property.
* **[emoji](https://www.npmjs.com/package/@ckeditor/ckeditor5-emoji)**: Improve the initialization performance of the Emoji feature by optimizing the `EmojiUtils#isEmojiSupported()` method. Closes [#18822](https://github.com/ckeditor/ckeditor5/issues/18822).
* **[export-pdf](https://www.npmjs.com/package/@ckeditor/ckeditor5-export-pdf)**: Added width constraint for content exported to PDF.
* **[image](https://www.npmjs.com/package/@ckeditor/ckeditor5-image)**: Image caption should be printed on the same page as the image.
* **[pagination](https://www.npmjs.com/package/@ckeditor/ckeditor5-pagination)**: Pagination uses `0.5mm` tolerance while calculating line breaks.

### Released packages

Check out the [Versioning policy](https://ckeditor.com/docs/ckeditor5/latest/framework/guides/support/versioning-policy.html) guide for more information.

<details>
<summary>Released packages (summary)</summary>

Other releases:

* [@ckeditor/ckeditor5-adapter-ckfinder](https://www.npmjs.com/package/@ckeditor/ckeditor5-adapter-ckfinder/v/46.0.1): v46.0.0 => v46.0.1
* [@ckeditor/ckeditor5-ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai/v/46.0.1): v46.0.0 => v46.0.1
* [@ckeditor/ckeditor5-alignment](https://www.npmjs.com/package/@ckeditor/ckeditor5-alignment/v/46.0.1): v46.0.0 => v46.0.1
* [@ckeditor/ckeditor5-autoformat](https://www.npmjs.com/package/@ckeditor/ckeditor5-autoformat/v/46.0.1): v46.0.0 => v46.0.1
* [@ckeditor/ckeditor5-autosave](https://www.npmjs.com/package/@ckeditor/ckeditor5-autosave/v/46.0.1): v46.0.0 => v46.0.1
* [@ckeditor/ckeditor5-basic-styles](https://www.npmjs.com/package/@ckeditor/ckeditor5-basic-styles/v/46.0.1): v46.0.0 => v46.0.1
* [@ckeditor/ckeditor5-block-quote](https://www.npmjs.com/package/@ckeditor/ckeditor5-block-quote/v/46.0.1): v46.0.0 => v46.0.1
* [@ckeditor/ckeditor5-bookmark](https://www.npmjs.com/package/@ckeditor/ckeditor5-bookmark/v/46.0.1): v46.0.0 => v46.0.1
* [@ckeditor/ckeditor5-case-change](https://www.npmjs.com/package/@ckeditor/ckeditor5-case-change/v/46.0.1): v46.0.0 => v46.0.1
* [@ckeditor/ckeditor5-ckbox](https://www.npmjs.com/package/@ckeditor/ckeditor5-ckbox/v/46.0.1): v46.0.0 => v46.0.1
* [@ckeditor/ckeditor5-ckfinder](https://www.npmjs.com/package/@ckeditor/ckeditor5-ckfinder/v/46.0.1): v46.0.0 => v46.0.1
* [@ckeditor/ckeditor5-clipboard](https://www.npmjs.com/package/@ckeditor/ckeditor5-clipboard/v/46.0.1): v46.0.0 => v46.0.1
* [@ckeditor/ckeditor5-cloud-services](https://www.npmjs.com/package/@ckeditor/ckeditor5-cloud-services/v/46.0.1): v46.0.0 => v46.0.1
* [@ckeditor/ckeditor5-code-block](https://www.npmjs.com/package/@ckeditor/ckeditor5-code-block/v/46.0.1): v46.0.0 => v46.0.1
* [@ckeditor/ckeditor5-collaboration-core](https://www.npmjs.com/package/@ckeditor/ckeditor5-collaboration-core/v/46.0.1): v46.0.0 => v46.0.1
* [@ckeditor/ckeditor5-comments](https://www.npmjs.com/package/@ckeditor/ckeditor5-comments/v/46.0.1): v46.0.0 => v46.0.1
* [@ckeditor/ckeditor5-core](https://www.npmjs.com/package/@ckeditor/ckeditor5-core/v/46.0.1): v46.0.0 => v46.0.1
* [@ckeditor/ckeditor5-document-outline](https://www.npmjs.com/package/@ckeditor/ckeditor5-document-outline/v/46.0.1): v46.0.0 => v46.0.1
* [@ckeditor/ckeditor5-easy-image](https://www.npmjs.com/package/@ckeditor/ckeditor5-easy-image/v/46.0.1): v46.0.0 => v46.0.1
* [@ckeditor/ckeditor5-editor-balloon](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-balloon/v/46.0.1): v46.0.0 => v46.0.1
* [@ckeditor/ckeditor5-editor-classic](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-classic/v/46.0.1): v46.0.0 => v46.0.1
* [@ckeditor/ckeditor5-editor-decoupled](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-decoupled/v/46.0.1): v46.0.0 => v46.0.1
* [@ckeditor/ckeditor5-editor-inline](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-inline/v/46.0.1): v46.0.0 => v46.0.1
* [@ckeditor/ckeditor5-editor-multi-root](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-multi-root/v/46.0.1): v46.0.0 => v46.0.1
* [@ckeditor/ckeditor5-email](https://www.npmjs.com/package/@ckeditor/ckeditor5-email/v/46.0.1): v46.0.0 => v46.0.1
* [@ckeditor/ckeditor5-emoji](https://www.npmjs.com/package/@ckeditor/ckeditor5-emoji/v/46.0.1): v46.0.0 => v46.0.1
* [@ckeditor/ckeditor5-engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine/v/46.0.1): v46.0.0 => v46.0.1
* [@ckeditor/ckeditor5-enter](https://www.npmjs.com/package/@ckeditor/ckeditor5-enter/v/46.0.1): v46.0.0 => v46.0.1
* [@ckeditor/ckeditor5-essentials](https://www.npmjs.com/package/@ckeditor/ckeditor5-essentials/v/46.0.1): v46.0.0 => v46.0.1
* [@ckeditor/ckeditor5-export-inline-styles](https://www.npmjs.com/package/@ckeditor/ckeditor5-export-inline-styles/v/46.0.1): v46.0.0 => v46.0.1
* [@ckeditor/ckeditor5-export-pdf](https://www.npmjs.com/package/@ckeditor/ckeditor5-export-pdf/v/46.0.1): v46.0.0 => v46.0.1
* [@ckeditor/ckeditor5-export-word](https://www.npmjs.com/package/@ckeditor/ckeditor5-export-word/v/46.0.1): v46.0.0 => v46.0.1
* [@ckeditor/ckeditor5-find-and-replace](https://www.npmjs.com/package/@ckeditor/ckeditor5-find-and-replace/v/46.0.1): v46.0.0 => v46.0.1
* [@ckeditor/ckeditor5-font](https://www.npmjs.com/package/@ckeditor/ckeditor5-font/v/46.0.1): v46.0.0 => v46.0.1
* [@ckeditor/ckeditor5-format-painter](https://www.npmjs.com/package/@ckeditor/ckeditor5-format-painter/v/46.0.1): v46.0.0 => v46.0.1
* [@ckeditor/ckeditor5-fullscreen](https://www.npmjs.com/package/@ckeditor/ckeditor5-fullscreen/v/46.0.1): v46.0.0 => v46.0.1
* [@ckeditor/ckeditor5-heading](https://www.npmjs.com/package/@ckeditor/ckeditor5-heading/v/46.0.1): v46.0.0 => v46.0.1
* [@ckeditor/ckeditor5-highlight](https://www.npmjs.com/package/@ckeditor/ckeditor5-highlight/v/46.0.1): v46.0.0 => v46.0.1
* [@ckeditor/ckeditor5-horizontal-line](https://www.npmjs.com/package/@ckeditor/ckeditor5-horizontal-line/v/46.0.1): v46.0.0 => v46.0.1
* [@ckeditor/ckeditor5-html-embed](https://www.npmjs.com/package/@ckeditor/ckeditor5-html-embed/v/46.0.1): v46.0.0 => v46.0.1
* [@ckeditor/ckeditor5-html-support](https://www.npmjs.com/package/@ckeditor/ckeditor5-html-support/v/46.0.1): v46.0.0 => v46.0.1
* [@ckeditor/ckeditor5-icons](https://www.npmjs.com/package/@ckeditor/ckeditor5-icons/v/46.0.1): v46.0.0 => v46.0.1
* [@ckeditor/ckeditor5-image](https://www.npmjs.com/package/@ckeditor/ckeditor5-image/v/46.0.1): v46.0.0 => v46.0.1
* [@ckeditor/ckeditor5-import-word](https://www.npmjs.com/package/@ckeditor/ckeditor5-import-word/v/46.0.1): v46.0.0 => v46.0.1
* [@ckeditor/ckeditor5-indent](https://www.npmjs.com/package/@ckeditor/ckeditor5-indent/v/46.0.1): v46.0.0 => v46.0.1
* [@ckeditor/ckeditor5-language](https://www.npmjs.com/package/@ckeditor/ckeditor5-language/v/46.0.1): v46.0.0 => v46.0.1
* [@ckeditor/ckeditor5-line-height](https://www.npmjs.com/package/@ckeditor/ckeditor5-line-height/v/46.0.1): v46.0.0 => v46.0.1
* [@ckeditor/ckeditor5-link](https://www.npmjs.com/package/@ckeditor/ckeditor5-link/v/46.0.1): v46.0.0 => v46.0.1
* [@ckeditor/ckeditor5-list](https://www.npmjs.com/package/@ckeditor/ckeditor5-list/v/46.0.1): v46.0.0 => v46.0.1
* [@ckeditor/ckeditor5-list-multi-level](https://www.npmjs.com/package/@ckeditor/ckeditor5-list-multi-level/v/46.0.1): v46.0.0 => v46.0.1
* [@ckeditor/ckeditor5-markdown-gfm](https://www.npmjs.com/package/@ckeditor/ckeditor5-markdown-gfm/v/46.0.1): v46.0.0 => v46.0.1
* [@ckeditor/ckeditor5-media-embed](https://www.npmjs.com/package/@ckeditor/ckeditor5-media-embed/v/46.0.1): v46.0.0 => v46.0.1
* [@ckeditor/ckeditor5-mention](https://www.npmjs.com/package/@ckeditor/ckeditor5-mention/v/46.0.1): v46.0.0 => v46.0.1
* [@ckeditor/ckeditor5-merge-fields](https://www.npmjs.com/package/@ckeditor/ckeditor5-merge-fields/v/46.0.1): v46.0.0 => v46.0.1
* [@ckeditor/ckeditor5-minimap](https://www.npmjs.com/package/@ckeditor/ckeditor5-minimap/v/46.0.1): v46.0.0 => v46.0.1
* [@ckeditor/ckeditor5-operations-compressor](https://www.npmjs.com/package/@ckeditor/ckeditor5-operations-compressor/v/46.0.1): v46.0.0 => v46.0.1
* [@ckeditor/ckeditor5-page-break](https://www.npmjs.com/package/@ckeditor/ckeditor5-page-break/v/46.0.1): v46.0.0 => v46.0.1
* [@ckeditor/ckeditor5-pagination](https://www.npmjs.com/package/@ckeditor/ckeditor5-pagination/v/46.0.1): v46.0.0 => v46.0.1
* [@ckeditor/ckeditor5-paragraph](https://www.npmjs.com/package/@ckeditor/ckeditor5-paragraph/v/46.0.1): v46.0.0 => v46.0.1
* [@ckeditor/ckeditor5-paste-from-office](https://www.npmjs.com/package/@ckeditor/ckeditor5-paste-from-office/v/46.0.1): v46.0.0 => v46.0.1
* [@ckeditor/ckeditor5-paste-from-office-enhanced](https://www.npmjs.com/package/@ckeditor/ckeditor5-paste-from-office-enhanced/v/46.0.1): v46.0.0 => v46.0.1
* [@ckeditor/ckeditor5-real-time-collaboration](https://www.npmjs.com/package/@ckeditor/ckeditor5-real-time-collaboration/v/46.0.1): v46.0.0 => v46.0.1
* [@ckeditor/ckeditor5-remove-format](https://www.npmjs.com/package/@ckeditor/ckeditor5-remove-format/v/46.0.1): v46.0.0 => v46.0.1
* [@ckeditor/ckeditor5-restricted-editing](https://www.npmjs.com/package/@ckeditor/ckeditor5-restricted-editing/v/46.0.1): v46.0.0 => v46.0.1
* [@ckeditor/ckeditor5-revision-history](https://www.npmjs.com/package/@ckeditor/ckeditor5-revision-history/v/46.0.1): v46.0.0 => v46.0.1
* [@ckeditor/ckeditor5-select-all](https://www.npmjs.com/package/@ckeditor/ckeditor5-select-all/v/46.0.1): v46.0.0 => v46.0.1
* [@ckeditor/ckeditor5-show-blocks](https://www.npmjs.com/package/@ckeditor/ckeditor5-show-blocks/v/46.0.1): v46.0.0 => v46.0.1
* [@ckeditor/ckeditor5-slash-command](https://www.npmjs.com/package/@ckeditor/ckeditor5-slash-command/v/46.0.1): v46.0.0 => v46.0.1
* [@ckeditor/ckeditor5-source-editing](https://www.npmjs.com/package/@ckeditor/ckeditor5-source-editing/v/46.0.1): v46.0.0 => v46.0.1
* [@ckeditor/ckeditor5-source-editing-enhanced](https://www.npmjs.com/package/@ckeditor/ckeditor5-source-editing-enhanced/v/46.0.1): v46.0.0 => v46.0.1
* [@ckeditor/ckeditor5-special-characters](https://www.npmjs.com/package/@ckeditor/ckeditor5-special-characters/v/46.0.1): v46.0.0 => v46.0.1
* [@ckeditor/ckeditor5-style](https://www.npmjs.com/package/@ckeditor/ckeditor5-style/v/46.0.1): v46.0.0 => v46.0.1
* [@ckeditor/ckeditor5-table](https://www.npmjs.com/package/@ckeditor/ckeditor5-table/v/46.0.1): v46.0.0 => v46.0.1
* [@ckeditor/ckeditor5-template](https://www.npmjs.com/package/@ckeditor/ckeditor5-template/v/46.0.1): v46.0.0 => v46.0.1
* [@ckeditor/ckeditor5-theme-lark](https://www.npmjs.com/package/@ckeditor/ckeditor5-theme-lark/v/46.0.1): v46.0.0 => v46.0.1
* [@ckeditor/ckeditor5-track-changes](https://www.npmjs.com/package/@ckeditor/ckeditor5-track-changes/v/46.0.1): v46.0.0 => v46.0.1
* [@ckeditor/ckeditor5-typing](https://www.npmjs.com/package/@ckeditor/ckeditor5-typing/v/46.0.1): v46.0.0 => v46.0.1
* [@ckeditor/ckeditor5-ui](https://www.npmjs.com/package/@ckeditor/ckeditor5-ui/v/46.0.1): v46.0.0 => v46.0.1
* [@ckeditor/ckeditor5-undo](https://www.npmjs.com/package/@ckeditor/ckeditor5-undo/v/46.0.1): v46.0.0 => v46.0.1
* [@ckeditor/ckeditor5-upload](https://www.npmjs.com/package/@ckeditor/ckeditor5-upload/v/46.0.1): v46.0.0 => v46.0.1
* [@ckeditor/ckeditor5-uploadcare](https://www.npmjs.com/package/@ckeditor/ckeditor5-uploadcare/v/46.0.1): v46.0.0 => v46.0.1
* [@ckeditor/ckeditor5-utils](https://www.npmjs.com/package/@ckeditor/ckeditor5-utils/v/46.0.1): v46.0.0 => v46.0.1
* [@ckeditor/ckeditor5-watchdog](https://www.npmjs.com/package/@ckeditor/ckeditor5-watchdog/v/46.0.1): v46.0.0 => v46.0.1
* [@ckeditor/ckeditor5-widget](https://www.npmjs.com/package/@ckeditor/ckeditor5-widget/v/46.0.1): v46.0.0 => v46.0.1
* [@ckeditor/ckeditor5-word-count](https://www.npmjs.com/package/@ckeditor/ckeditor5-word-count/v/46.0.1): v46.0.0 => v46.0.1
* [ckeditor5](https://www.npmjs.com/package/ckeditor5/v/46.0.1): v46.0.0 => v46.0.1
* [ckeditor5-collaboration](https://www.npmjs.com/package/ckeditor5-collaboration/v/46.0.1): v46.0.0 => v46.0.1
* [ckeditor5-premium-features](https://www.npmjs.com/package/ckeditor5-premium-features/v/46.0.1): v46.0.0 => v46.0.1
</details>


## [46.0.0](https://github.com/ckeditor/ckeditor5/compare/v45.2.1...v46.0.0) (July 9, 2025)

We are happy to announce the release of CKEditor 5 v46.0.0.

### Release highlights

> [!IMPORTANT]
> This is a **major release** with significant amount of changes that may affect your CKEditor&nbsp;5 integration. We strongly encourage you to read the entire [update guide](https://ckeditor.com/docs/ckeditor5/latest/updating/guides/update-to-46.html) to understand all the changes.
> Pay special attention to:
> * [Unified exports and renames in the editor API](https://ckeditor.com/docs/ckeditor5/latest/updating/guides/update-to-46.html#unified-exports-and-renames-in-the-editor-api): Many import/export names have changed
> * [Introduction of the default content styles](https://ckeditor.com/docs/ckeditor5/latest/updating/guides/update-to-46.html#introduction-of-the-default-content-styles): New default styling that may affect your content appearance
> These changes are designed to improve the long-term stability and maintainability of CKEditor&nbsp;5, but they require careful attention during the upgrade process.

#### Line Height (⭐)

The new [Line Height](https://ckeditor.com/docs/ckeditor5/latest/features/line-height.html) feature allows you to adjust the vertical spacing between lines of text, improving readability and visual harmony in your documents. This premium feature lets you set consistent line spacing across paragraphs and text blocks to enhance document accessibility and maintain visual hierarchy in your content.

#### Remove Format improvements

Unneeded styles on block elements, such as tables and images, and General HTML Support nodes and attributes are finally eliminated when you hit the [remove format](https://ckeditor.com/docs/ckeditor5/latest/features/remove-format.html) button. The feature now cleans what it should, leaving the document structure untouched.

#### List markers styling

Working with styled [lists](https://ckeditor.com/docs/ckeditor5/latest/features/lists/lists.html#list-styles) becomes more intuitive as list markers (bullets and numbers) now automatically inherit text styling properties such as font size adjustments, text color changes, and font weight modifications (bold, italic).

This improvement makes it easier to create visually consistent and professional-looking lists without additional configuration. This improvement also supports [Multi-level lists](https://ckeditor.com/docs/ckeditor5/latest/features/lists/multi-level-lists.html).

**Important!** This behavior is enabled by default, which means you may experience content change when you load the content to the editor 's new version (for the better in our opinion). But if this is not something you expect, you can [opt out](https://ckeditor.com/docs/ckeditor5/latest/features/lists/lists.html#disabling-marker-formatting).

#### Markdown processor dependency refresh

The [Markdown](https://ckeditor.com/docs/ckeditor5/latest/features/markdown.html) feature dependencies have been modernized with a switch to the `unified` ecosystem, replacing the previous `marked` / `turndown` implementation. This change brings more consistent and symmetrical HTML ↔ Markdown conversion. By adopting `remark` and `rehype` from the same family of tools, we have created a more reliable and maintainable implementation that will better serve your document processing needs.

#### Manual token refreshing

We have added the `config.cloudServices.autoRefresh` configuration property to disable the automatic token refresh mechanism. When it 's set to `false`, the token must be refreshed manually. This property opens up the ability to implement custom token handling if a certain use case requires this.

#### Comment threads improvements

##### New thread command changes
We have also introduced improvements to the `addCommandThread` command, which now supports creating comment threads on specified ranges. Additionally, it allows for creating a comment thread with an initial comment with the provided comment content.

**Minor breaking change**
The `AddCommandThreadCommand#isEnabled` property is no longer `false` when the current document selection is empty, as the command now allows for creating comment threads on custom ranges. If you previously used this property (for example, to provide a custom UI element), you should now use the observable `AddCommentThreadCommand#hasContent` property instead.

##### Comments and suggestions annotations
We have introduced dedicated methods for an easier way to get specific annotations related to a comment or a suggestion and vice versa.

#### Unified exports and renames in the editor API

After the big New Installation Method release (v42.0.0+), some developers upgrading from v41-x to v42-x were greeted by the `does not provide an export named ...` error. We addressed issues immediately as they were reported, but we knew it required a deeper are more comprehensive approach long-term.

With this release, we introduced a new, clear set of rules about internal imports, and also added re-exports if they were missing, changed the names of items to be more descriptive and avoid collisions, took care of internal methods that were already exported but not tagged, and cleaned up `@deprecated` code that was stale for some time.

If your build throws errors after the update, search and replace the old names with the new ones from the [update guide](https://ckeditor.com/docs/ckeditor5/latest/updating/nim-migration/migrating-imports.html). **We have not changed the behavior of these APIs, just the names**.

Last but not least, this release put us on the clean and straight path towards the [deprecation of old installation methods](https://github.com/ckeditor/ckeditor5/issues/17779). Please let us know if you have any questions on GitHub or support channels.

#### Opinionated default content styles and CSS renames

To improve the out-of-the-box experience and accessibility, we are introducing opinionated defaults for content styling. From this version, we ship a small defaults layer applied to `.ck-content`.  These content styles are easily replaceable via CSS variable override. You may have already styled those things with more specific selectors.

While working on this initiative, we decided to standardize the CSS naming, too. All older variables that applied to the content styles now share the consistent `--ck-content-*` prefix. Read about the details in the [update guide](https://ckeditor.com/docs/ckeditor5/latest/updating/guides/update-to-46.html#content-area-css-variables-renamed-to-ck-content-prefix).

### MAJOR BREAKING CHANGES [ℹ️](https://ckeditor.com/docs/ckeditor5/latest/framework/guides/support/versioning-policy.html#major-and-minor-breaking-changes)

* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai)**: The AI Assistant now uses the more advanced `gpt-4o` model by default, replacing the previous `gpt-3.5-turbo`. This update improves response quality and overall capabilities. Additionally, the default limit set by `max_tokens` parameter has been removed, allowing for better and more detailed responses. If you relied on the previous default settings and wish to continue using them, be sure to explicitly define the editor configuration entry `ai.openAi.requestParameters` to `{ model: 'gpt-3.5-turbo', max_tokens: 2000, stream: true }`.
* **[document-outline](https://www.npmjs.com/package/@ckeditor/ckeditor5-document-outline)**: Content area CSS variables have been renamed to use the --ck-content-* prefix for better consistency in the Table of Contents feature. This requires action if you have overridden the variables. See the update guide for details.
* **[list](https://www.npmjs.com/package/@ckeditor/ckeditor5-list)**: Removed vertical spacing in list items by resetting margins for `<p>` elements that are the child of a `<li>` element.
* **[table](https://www.npmjs.com/package/@ckeditor/ckeditor5-table)**: Removed vertical spacing in table cells by collapsing margins of <p> elements that are the only child of a `<td>` or `<th>` element.
* The editor now enforces default browser styles for text content in both the editing view and rendered output. This change may affect existing styling and layout, so any custom CSS overrides should be reviewed. See [#18710](https://github.com/ckeditor/ckeditor5/issues/18710) for details. The following CSS variables and their default values are now applied:
  * `--ck-content-font-family`: `Helvetica, Arial, Tahoma, Verdana, sans-serif`
  * `--ck-content-font-size`: `medium`
  * `--ck-content-font-color`: `#000` (_HEX instead of `hsl()` to ensure compatibility with email clients_)
  * `--ck-content-line-height`: `1.5`
  * `--ck-content-word-break`: `break-word`
* The default styles for comment annotations have changed to provide better consistency with the editor UI. A new set of CSS variables is now used to control the appearance of the comment content and input fields. These changes may affect the current appearance of comments in your integration, so please review them after updating. The following CSS variables are now applied:
  * `--ck-comment-content-font-family`
  * `--ck-comment-content-font-size`
  * `--ck-comment-content-font-color` (default changed from `hsl(0, 0%, 0%)` to `hsl(0, 0%, 20%)`)

  These variables default to values derived from the editor 's UI styles, and they may differ from your current settings. Customize these variables as needed to match your desired appearance.
* Content area CSS variables have been renamed to use the `--ck-content-*` prefix for better consistency in the Highlight, Image, List, and Table features. This requires action if you have overridden the variables. See the update guide for details.
* Table-related CSS variables with improper `*-selector-*` naming have been renamed to use `*-table-*` for better clarity. This requires action if you have overridden the variables. See the update guide for details.

### MINOR BREAKING CHANGES [ℹ️](https://ckeditor.com/docs/ckeditor5/latest/framework/guides/support/versioning-policy.html#major-and-minor-breaking-changes)

* **[comments](https://www.npmjs.com/package/@ckeditor/ckeditor5-comments)**: The `AddCommandThreadCommand#isEnabled` property is no longer `false` when the current document selection is empty, as the command now allows for creating comment threads on custom ranges. If you previously used this property (for example, to provide a custom UI element), you should now use the observable `AddCommentThreadCommand#hasContent` property instead.
* **[core](https://www.npmjs.com/package/@ckeditor/ckeditor5-core)**: Removed the deprecated `DataApiMixin` function and `DataApi` interface. Their functionality is the part of the Editor class.
* **[engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine)**: Removed `Batch#type` deprecated property.
* **[list](https://www.npmjs.com/package/@ckeditor/ckeditor5-list)**: Removed `DocumentList`, `DocumentListProperties` and `TodoDocumentList` plugins. They were aliases for plugins `List`, `ListProperties` and `DocumentList` respectively.
* **[markdown-gfm](https://www.npmjs.com/package/@ckeditor/ckeditor5-markdown-gfm)**: Migrated from `marked` and `turndown` to `remark` and `rehype` for improved extensibility and alignment with the modern Markdown ecosystem.
* **[markdown-gfm](https://www.npmjs.com/package/@ckeditor/ckeditor5-markdown-gfm)**: Enabled the autolinking feature in Markdown when loading Markdown content into the editor.
* **[ui](https://www.npmjs.com/package/@ckeditor/ckeditor5-ui)**: Removed the deprecated `buttonView` property from buttons created with `FileDialogViewMixin`. Use the button object itself.
* **[utils](https://www.npmjs.com/package/@ckeditor/ckeditor5-utils)**: Removed the deprecated `mix` function.
* **[utils](https://www.npmjs.com/package/@ckeditor/ckeditor5-utils)**: Removed the deprecated `Locale#language` property. Use `Locale#uiLanguage` instead.

### Features

* **[cloud-services](https://www.npmjs.com/package/@ckeditor/ckeditor5-cloud-services)**: Added the `config.cloudServices.autoRefresh` configuration property that allows disabling the automatic token refresh mechanism. When set to `false`, the token must be refreshed manually, enabling custom token handling. ([commit](https://github.com/ckeditor/ckeditor5/commit/c28f7b427c339b1313d97aabcc25a51b860008cf))
* **[comments](https://www.npmjs.com/package/@ckeditor/ckeditor5-comments)**: Extended the `options` argument passed to the `AddCommentThreadCommand#execute()` method. The command now supports creating comment threads on specified ranges. Additionally, it allows for creating a comment thread with an initial comment, using the provided comment content.
* **[html-support](https://www.npmjs.com/package/@ckeditor/ckeditor5-html-support)**: Added the integration with the remove format command for block elements. Closes [#13983](https://github.com/ckeditor/ckeditor5/issues/13983). ([commit](https://github.com/ckeditor/ckeditor5/commit/1b75f6260560c7709d794c47597749e16aed43e4))
* **[image](https://www.npmjs.com/package/@ckeditor/ckeditor5-image)**: Image style and resized size can now be removed by the remove format command. See [#13983](https://github.com/ckeditor/ckeditor5/issues/13983). ([commit](https://github.com/ckeditor/ckeditor5/commit/1b75f6260560c7709d794c47597749e16aed43e4))
* **[line-height](https://www.npmjs.com/package/@ckeditor/ckeditor5-line-height)**: Introduced the Line height feature that lets you adjust the vertical spacing between lines of text. Closes [ckeditor/ckeditor5#11360](https://github.com/ckeditor/ckeditor5/issues/11360).
* **[list](https://www.npmjs.com/package/@ckeditor/ckeditor5-list)**: Introduced list item marker formatting for consistently styled content (supports `Bold`, `Italic`, `Font Size`, `Font Family`, and `Font Color`). Closes [#18537](https://github.com/ckeditor/ckeditor5/issues/18537). ([commit](https://github.com/ckeditor/ckeditor5/commit/19976dcdeba71cb7bbf4ad045ec760516d2ce0c9))
* **[list-multi-level](https://www.npmjs.com/package/@ckeditor/ckeditor5-list-multi-level)**: Introduced list item marker formatting for consistently styled content (supports `Bold`, `Italic`, `Font Size`, `Font Family`, and `Font Color`).
* **[table](https://www.npmjs.com/package/@ckeditor/ckeditor5-table)**: Table properties and cell properties can now be removed by the remove format command. See [#13983](https://github.com/ckeditor/ckeditor5/issues/13983). ([commit](https://github.com/ckeditor/ckeditor5/commit/1b75f6260560c7709d794c47597749e16aed43e4))

### Bug fixes

* **[autoformat](https://www.npmjs.com/package/@ckeditor/ckeditor5-autoformat)**: Block autoformat should restore the allowed selection attributes. Closes [#17365](https://github.com/ckeditor/ckeditor5/issues/17365). ([commit](https://github.com/ckeditor/ckeditor5/commit/e14fa5b63e45d16cc4301df64add0f879daa5d15))
* **[clipboard](https://www.npmjs.com/package/@ckeditor/ckeditor5-clipboard)**: Added `z-index` to the clipboard drop target line. Closes [#18380](https://github.com/ckeditor/ckeditor5/issues/18380). ([commit](https://github.com/ckeditor/ckeditor5/commit/9607385f2ded5b6d6fd32ea090fb720973fee6cd))
* **[code-block](https://www.npmjs.com/package/@ckeditor/ckeditor5-code-block)**: The feature-related HTML classes should not leak to the General HTML Support feature. See [#13983](https://github.com/ckeditor/ckeditor5/issues/13983). ([commit](https://github.com/ckeditor/ckeditor5/commit/1b75f6260560c7709d794c47597749e16aed43e4))
* **[comments](https://www.npmjs.com/package/@ckeditor/ckeditor5-comments)**: Activating a comment marker nested inside another marker will no longer result in an error.
* **[engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine)**: `StylesMap` should properly remove styles while accessing them by `border-left` property. See [#13983](https://github.com/ckeditor/ckeditor5/issues/13983). ([commit](https://github.com/ckeditor/ckeditor5/commit/1b75f6260560c7709d794c47597749e16aed43e4))
* **[font](https://www.npmjs.com/package/@ckeditor/ckeditor5-font)**: The font dropdown correctly reflects the applied font, even if the `font-style` CSS property includes excessive spaces. Closes [#18558](https://github.com/ckeditor/ckeditor5/issues/18558). ([commit](https://github.com/ckeditor/ckeditor5/commit/55e88ac3ef7c77d2a39c939f8dae2e48dea9cc9f))
* **[html-support](https://www.npmjs.com/package/@ckeditor/ckeditor5-html-support)**: The custom link styling is now removed with the remove format command. Closes [#15318](https://github.com/ckeditor/ckeditor5/issues/15318). ([commit](https://github.com/ckeditor/ckeditor5/commit/1b75f6260560c7709d794c47597749e16aed43e4))
* **[list](https://www.npmjs.com/package/@ckeditor/ckeditor5-list)**: No longer merge separate lists pasted from Microsoft Office into a single list. Closes [#18015](https://github.com/ckeditor/ckeditor5/issues/18015). ([commit](https://github.com/ckeditor/ckeditor5/commit/aa8ad88e118ca398a5ec1ef451ac27fef080f857))
* **[list](https://www.npmjs.com/package/@ckeditor/ckeditor5-list)**: Improved rendering of the <p> element when it is an only child of a list item (`<li>`) or a table cell (`<td>` or `<th>`). Closes [#17440](https://github.com/ckeditor/ckeditor5/issues/17440). ([commit](https://github.com/ckeditor/ckeditor5/commit/efe75aa68bcabf143d88594ea41b93570182fafe))
* **[list](https://www.npmjs.com/package/@ckeditor/ckeditor5-list)**: Improved the paragraphs' spacing in lists and tables. Closes: [#11347](https://github.com/ckeditor/ckeditor5/issues/11347). ([commit](https://github.com/ckeditor/ckeditor5/commit/efe75aa68bcabf143d88594ea41b93570182fafe))
* **[merge-fields](https://www.npmjs.com/package/@ckeditor/ckeditor5-merge-fields)**: The Merge Fields feature no longer throws an error when processing image elements without the `[src]` attribute in specific cases.
* **[page-break](https://www.npmjs.com/package/@ckeditor/ckeditor5-page-break)**: The feature-related HTML classes should not leak to the General HTML Support feature. See [#13983](https://github.com/ckeditor/ckeditor5/issues/13983). ([commit](https://github.com/ckeditor/ckeditor5/commit/1b75f6260560c7709d794c47597749e16aed43e4))
* **[table](https://www.npmjs.com/package/@ckeditor/ckeditor5-table)**: Improved rendering of the <p> element when it is an only child of a list item (`<li>`) or a table cell (`<td>` or `<th>`). Closes [#17440](https://github.com/ckeditor/ckeditor5/issues/17440). ([commit](https://github.com/ckeditor/ckeditor5/commit/efe75aa68bcabf143d88594ea41b93570182fafe))
* **[table](https://www.npmjs.com/package/@ckeditor/ckeditor5-table)**: Improved the paragraphs' spacing in lists and tables. Closes: [#11347](https://github.com/ckeditor/ckeditor5/issues/11347). ([commit](https://github.com/ckeditor/ckeditor5/commit/efe75aa68bcabf143d88594ea41b93570182fafe))
* **[track-changes](https://www.npmjs.com/package/@ckeditor/ckeditor5-track-changes)**: Fixed an error thrown when the `discardAllSuggestions` command or `TrackChangesData` plugin were used, if there was an element with split suggestion, and the second part of the element had an attribute or rename suggestion.
* **[undo](https://www.npmjs.com/package/@ckeditor/ckeditor5-undo)**: The Undo feature incorrectly restored content in scenario when a block quote (or other similar container) was unwrapped, then its former first or last element were merged, and then undo was used to restore block quote. Closes [#18740](https://github.com/ckeditor/ckeditor5/issues/18740), [#18415](https://github.com/ckeditor/ckeditor5/issues/18415). ([commit](https://github.com/ckeditor/ckeditor5/commit/08dbddcc4d93865321a8ec8169035665f1e3319d))

### Other changes

* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai)**: Improve tree-shaking of external dependencies by marking the package as `side-effect-free`.
* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai)**: The default config for the AI Assistant has changed. The feature now uses `gpt-4o` model by default and does not set `max_tokens` parameter.
* **[comments](https://www.npmjs.com/package/@ckeditor/ckeditor5-comments)**: The `AddCommandThreadCommand#isEnabled` property is no longer `false` when the current document selection is empty, as the command now allows for creating comment threads on custom ranges.
* **[comments](https://www.npmjs.com/package/@ckeditor/ckeditor5-comments)**: Added a public API to get an annotation for a comment thread using `CommentsRepository#getAnnotationForCommentThread()` and to get a comment thread for an annotation using `CommentsRepository#getCommentThreadForAnnotation()`.
* **[comments](https://www.npmjs.com/package/@ckeditor/ckeditor5-comments)**: Implemented `--ck-comment-content-font-family`, `--ck-comment-content-font-size` and `--ck-comment-content-font-color` CSS variables to standardize font family, size and color styling in comments content. These variables apply to both the submitted comment content and the comment input field.
* **[core](https://www.npmjs.com/package/@ckeditor/ckeditor5-core)**: Implemented the --ck-content-font-family, --ck-content-font-size and --ck-content-font-color CSS variables to standardize font family, size, and color styling in CKEditor 5 content. Closes [#18710](https://github.com/ckeditor/ckeditor5/issues/18710). ([commit](https://github.com/ckeditor/ckeditor5/commit/a75cda96d490269e0f3ecd28b47b2c25c6520cc2))
* **[core](https://www.npmjs.com/package/@ckeditor/ckeditor5-core)**: Implemented the `--ck-content-line-height` CSS variable to standardize `line-height` styling in CKEditor 5 content. See [#18710](https://github.com/ckeditor/ckeditor5/issues/18710). ([commit](https://github.com/ckeditor/ckeditor5/commit/a556e557ec083399dd15505817dfa0248ba53268))
* **[document-outline](https://www.npmjs.com/package/@ckeditor/ckeditor5-document-outline)**: Align Table of Contents content area CSS variables to the `--ck-content-*` prefix.
* **[engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine)**: The `atributeToAtribute()` and `elementToAtribute()` upcast helpers should not consume anything if a conversion callback returns `undefined` value. See [#18575](https://github.com/ckeditor/ckeditor5/issues/18575). ([commit](https://github.com/ckeditor/ckeditor5/commit/3a614a7733951313adaa509b476a3ca8444725b2))
* **[highlight](https://www.npmjs.com/package/@ckeditor/ckeditor5-highlight)**: Align content area CSS variables to the `--ck-content-*` prefix. Closes [#18735](https://github.com/ckeditor/ckeditor5/issues/18735). ([commit](https://github.com/ckeditor/ckeditor5/commit/3d636336e6f387a7f6bd27432a98ffbad106dbee))
* **[image](https://www.npmjs.com/package/@ckeditor/ckeditor5-image)**: Align content area CSS variables to the `--ck-content-*` prefix. Closes [#18735](https://github.com/ckeditor/ckeditor5/issues/18735). ([commit](https://github.com/ckeditor/ckeditor5/commit/3d636336e6f387a7f6bd27432a98ffbad106dbee))
* **[list](https://www.npmjs.com/package/@ckeditor/ckeditor5-list)**: Align content area CSS variables to the `--ck-content-*` prefix. Closes [#18735](https://github.com/ckeditor/ckeditor5/issues/18735). ([commit](https://github.com/ckeditor/ckeditor5/commit/3d636336e6f387a7f6bd27432a98ffbad106dbee))
* **[list](https://www.npmjs.com/package/@ckeditor/ckeditor5-list)**: The `[data-list-item-id]` attribute is now added on `<li>` elements in editor data to improve integration between lists feature and other editor features. Closes [#18407](https://github.com/ckeditor/ckeditor5/issues/18407). ([commit](https://github.com/ckeditor/ckeditor5/commit/215408765402783451982c8cb9f6290818fc4b67))
* **[markdown-gfm](https://www.npmjs.com/package/@ckeditor/ckeditor5-markdown-gfm)**: Migrate to `remark` / `rehype` packages. Closes [#18684](https://github.com/ckeditor/ckeditor5/issues/18684). ([commit](https://github.com/ckeditor/ckeditor5/commit/e4bed9deee589e8ba2332d6afb533ac58024d860))
* **[table](https://www.npmjs.com/package/@ckeditor/ckeditor5-table)**: Align content area CSS variables to the `--ck-content-*` prefix. Closes [#18735](https://github.com/ckeditor/ckeditor5/issues/18735). ([commit](https://github.com/ckeditor/ckeditor5/commit/3d636336e6f387a7f6bd27432a98ffbad106dbee))
* **[table](https://www.npmjs.com/package/@ckeditor/ckeditor5-table)**: Fix the table's CSS variables, which had -selector- string in their name. ([commit](https://github.com/ckeditor/ckeditor5/commit/3d636336e6f387a7f6bd27432a98ffbad106dbee))
* **[table](https://www.npmjs.com/package/@ckeditor/ckeditor5-table)**: The legacy HTML table attributes are now normalized to editor features (`width`, `height`, `bgcolor`). Closes [#18575](https://github.com/ckeditor/ckeditor5/issues/18575). ([commit](https://github.com/ckeditor/ckeditor5/commit/3a614a7733951313adaa509b476a3ca8444725b2))
* **[theme](https://www.npmjs.com/package/@ckeditor/ckeditor5-theme)**: Align content area CSS variables to the `--ck-content-*` prefix. Closes [#18735](https://github.com/ckeditor/ckeditor5/issues/18735). ([commit](https://github.com/ckeditor/ckeditor5/commit/3d636336e6f387a7f6bd27432a98ffbad106dbee))
* **[track-changes](https://www.npmjs.com/package/@ckeditor/ckeditor5-track-changes)**: The `TrackChangesEditing#recordAttributeChanges()` method has been made public to support custom integrations that require direct attribute modifications via the writer. Previously, attribute suggestions could only be generated through command execution, limiting flexibility for script-based scenarios.
* **[track-changes](https://www.npmjs.com/package/@ckeditor/ckeditor5-track-changes)**: Added a public API to get an annotation for a suggestion using `TrackChangesUI#getAnnotationForSuggestion()` and to get a suggestion for an annotation using `TrackChangesUI#getSuggestionForAnnotation()`.
* **[ui](https://www.npmjs.com/package/@ckeditor/ckeditor5-ui)**: `CssTransitionDisablerMixin` should allow late initialization. Closes [#18626](https://github.com/ckeditor/ckeditor5/issues/18626). ([commit](https://github.com/ckeditor/ckeditor5/commit/9524c3da5bab62042afec2bf1324570d733b729f))
* **[utils](https://www.npmjs.com/package/@ckeditor/ckeditor5-utils)**: The error re-throw mechanism should not provide an invalid documentation link. Closes [#18176](https://github.com/ckeditor/ckeditor5/issues/18176). ([commit](https://github.com/ckeditor/ckeditor5/commit/7e1acf9a03f6a95208fddfbf94cb3c2b9cd94fc9))
* Commands are now exported as a value instead of a type. Closes [#18588](https://github.com/ckeditor/ckeditor5/issues/18588). ([commit](https://github.com/ckeditor/ckeditor5/commit/e4b4be56f4e9650f28957efb80454f8f27e2e539))
* Updated several dependencies used in CKEditor 5 packages:
  - **[ui](https://www.npmjs.com/package/@ckeditor/ckeditor5-ui)**: `color-convert`, `color-parse`
  - **[uploadcare](https://www.npmjs.com/package/@ckeditor/ckeditor5-uploadcare)**: `@uploadcare/file-uploader`, `@uploadcare/upload-client`
  - **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai)**: `@aws-sdk/client-bedrock-runtime`
  - **[source-editing-enhanced](https://www.npmjs.com/package/@ckeditor/ckeditor5-source-editing-enhanced)**: `@codemirror/commands`
  - Multiple packages: `es-toolkit`, `luxon`.

### Released packages

Check out the [Versioning policy](https://ckeditor.com/docs/ckeditor5/latest/framework/guides/support/versioning-policy.html) guide for more information.

<details>
<summary>Released packages (summary)</summary>

New packages:

* [@ckeditor/ckeditor5-line-height](https://www.npmjs.com/package/@ckeditor/ckeditor5-line-height/v/46.0.0): v46.0.0

Major releases (contain major breaking changes):

* [@ckeditor/ckeditor5-ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai/v/46.0.0): v45.2.1 => v46.0.0
* [@ckeditor/ckeditor5-list](https://www.npmjs.com/package/@ckeditor/ckeditor5-list/v/46.0.0): v45.2.1 => v46.0.0
* [@ckeditor/ckeditor5-table](https://www.npmjs.com/package/@ckeditor/ckeditor5-table/v/46.0.0): v45.2.1 => v46.0.0

Minor releases (contain minor breaking changes):

* [@ckeditor/ckeditor5-comments](https://www.npmjs.com/package/@ckeditor/ckeditor5-comments/v/46.0.0): v45.2.1 => v46.0.0
* [@ckeditor/ckeditor5-markdown-gfm](https://www.npmjs.com/package/@ckeditor/ckeditor5-markdown-gfm/v/46.0.0): v45.2.1 => v46.0.0

Releases containing new features:

* [@ckeditor/ckeditor5-autoformat](https://www.npmjs.com/package/@ckeditor/ckeditor5-autoformat/v/46.0.0): v45.2.1 => v46.0.0
* [@ckeditor/ckeditor5-cloud-services](https://www.npmjs.com/package/@ckeditor/ckeditor5-cloud-services/v/46.0.0): v45.2.1 => v46.0.0
* [@ckeditor/ckeditor5-code-block](https://www.npmjs.com/package/@ckeditor/ckeditor5-code-block/v/46.0.0): v45.2.1 => v46.0.0
* [@ckeditor/ckeditor5-engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine/v/46.0.0): v45.2.1 => v46.0.0
* [@ckeditor/ckeditor5-font](https://www.npmjs.com/package/@ckeditor/ckeditor5-font/v/46.0.0): v45.2.1 => v46.0.0
* [@ckeditor/ckeditor5-html-support](https://www.npmjs.com/package/@ckeditor/ckeditor5-html-support/v/46.0.0): v45.2.1 => v46.0.0
* [@ckeditor/ckeditor5-image](https://www.npmjs.com/package/@ckeditor/ckeditor5-image/v/46.0.0): v45.2.1 => v46.0.0
* [@ckeditor/ckeditor5-page-break](https://www.npmjs.com/package/@ckeditor/ckeditor5-page-break/v/46.0.0): v45.2.1 => v46.0.0
* [@ckeditor/ckeditor5-paste-from-office](https://www.npmjs.com/package/@ckeditor/ckeditor5-paste-from-office/v/46.0.0): v45.2.1 => v46.0.0
* [@ckeditor/ckeditor5-remove-format](https://www.npmjs.com/package/@ckeditor/ckeditor5-remove-format/v/46.0.0): v45.2.1 => v46.0.0
* [@ckeditor/ckeditor5-source-editing](https://www.npmjs.com/package/@ckeditor/ckeditor5-source-editing/v/46.0.0): v45.2.1 => v46.0.0
* [@ckeditor/ckeditor5-upload](https://www.npmjs.com/package/@ckeditor/ckeditor5-upload/v/46.0.0): v45.2.1 => v46.0.0

Other releases:

* [@ckeditor/ckeditor5-adapter-ckfinder](https://www.npmjs.com/package/@ckeditor/ckeditor5-adapter-ckfinder/v/46.0.0): v45.2.1 => v46.0.0
* [@ckeditor/ckeditor5-alignment](https://www.npmjs.com/package/@ckeditor/ckeditor5-alignment/v/46.0.0): v45.2.1 => v46.0.0
* [@ckeditor/ckeditor5-autosave](https://www.npmjs.com/package/@ckeditor/ckeditor5-autosave/v/46.0.0): v45.2.1 => v46.0.0
* [@ckeditor/ckeditor5-basic-styles](https://www.npmjs.com/package/@ckeditor/ckeditor5-basic-styles/v/46.0.0): v45.2.1 => v46.0.0
* [@ckeditor/ckeditor5-block-quote](https://www.npmjs.com/package/@ckeditor/ckeditor5-block-quote/v/46.0.0): v45.2.1 => v46.0.0
* [@ckeditor/ckeditor5-bookmark](https://www.npmjs.com/package/@ckeditor/ckeditor5-bookmark/v/46.0.0): v45.2.1 => v46.0.0
* [@ckeditor/ckeditor5-case-change](https://www.npmjs.com/package/@ckeditor/ckeditor5-case-change/v/46.0.0): v45.2.1 => v46.0.0
* [@ckeditor/ckeditor5-ckbox](https://www.npmjs.com/package/@ckeditor/ckeditor5-ckbox/v/46.0.0): v45.2.1 => v46.0.0
* [@ckeditor/ckeditor5-ckfinder](https://www.npmjs.com/package/@ckeditor/ckeditor5-ckfinder/v/46.0.0): v45.2.1 => v46.0.0
* [@ckeditor/ckeditor5-clipboard](https://www.npmjs.com/package/@ckeditor/ckeditor5-clipboard/v/46.0.0): v45.2.1 => v46.0.0
* [@ckeditor/ckeditor5-collaboration-core](https://www.npmjs.com/package/@ckeditor/ckeditor5-collaboration-core/v/46.0.0): v45.2.1 => v46.0.0
* [@ckeditor/ckeditor5-core](https://www.npmjs.com/package/@ckeditor/ckeditor5-core/v/46.0.0): v45.2.1 => v46.0.0
* [@ckeditor/ckeditor5-document-outline](https://www.npmjs.com/package/@ckeditor/ckeditor5-document-outline/v/46.0.0): v45.2.1 => v46.0.0
* [@ckeditor/ckeditor5-easy-image](https://www.npmjs.com/package/@ckeditor/ckeditor5-easy-image/v/46.0.0): v45.2.1 => v46.0.0
* [@ckeditor/ckeditor5-editor-balloon](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-balloon/v/46.0.0): v45.2.1 => v46.0.0
* [@ckeditor/ckeditor5-editor-classic](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-classic/v/46.0.0): v45.2.1 => v46.0.0
* [@ckeditor/ckeditor5-editor-decoupled](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-decoupled/v/46.0.0): v45.2.1 => v46.0.0
* [@ckeditor/ckeditor5-editor-inline](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-inline/v/46.0.0): v45.2.1 => v46.0.0
* [@ckeditor/ckeditor5-editor-multi-root](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-multi-root/v/46.0.0): v45.2.1 => v46.0.0
* [@ckeditor/ckeditor5-email](https://www.npmjs.com/package/@ckeditor/ckeditor5-email/v/46.0.0): v45.2.1 => v46.0.0
* [@ckeditor/ckeditor5-emoji](https://www.npmjs.com/package/@ckeditor/ckeditor5-emoji/v/46.0.0): v45.2.1 => v46.0.0
* [@ckeditor/ckeditor5-enter](https://www.npmjs.com/package/@ckeditor/ckeditor5-enter/v/46.0.0): v45.2.1 => v46.0.0
* [@ckeditor/ckeditor5-essentials](https://www.npmjs.com/package/@ckeditor/ckeditor5-essentials/v/46.0.0): v45.2.1 => v46.0.0
* [@ckeditor/ckeditor5-export-inline-styles](https://www.npmjs.com/package/@ckeditor/ckeditor5-export-inline-styles/v/46.0.0): v45.2.1 => v46.0.0
* [@ckeditor/ckeditor5-export-pdf](https://www.npmjs.com/package/@ckeditor/ckeditor5-export-pdf/v/46.0.0): v45.2.1 => v46.0.0
* [@ckeditor/ckeditor5-export-word](https://www.npmjs.com/package/@ckeditor/ckeditor5-export-word/v/46.0.0): v45.2.1 => v46.0.0
* [@ckeditor/ckeditor5-find-and-replace](https://www.npmjs.com/package/@ckeditor/ckeditor5-find-and-replace/v/46.0.0): v45.2.1 => v46.0.0
* [@ckeditor/ckeditor5-format-painter](https://www.npmjs.com/package/@ckeditor/ckeditor5-format-painter/v/46.0.0): v45.2.1 => v46.0.0
* [@ckeditor/ckeditor5-fullscreen](https://www.npmjs.com/package/@ckeditor/ckeditor5-fullscreen/v/46.0.0): v45.2.1 => v46.0.0
* [@ckeditor/ckeditor5-heading](https://www.npmjs.com/package/@ckeditor/ckeditor5-heading/v/46.0.0): v45.2.1 => v46.0.0
* [@ckeditor/ckeditor5-highlight](https://www.npmjs.com/package/@ckeditor/ckeditor5-highlight/v/46.0.0): v45.2.1 => v46.0.0
* [@ckeditor/ckeditor5-horizontal-line](https://www.npmjs.com/package/@ckeditor/ckeditor5-horizontal-line/v/46.0.0): v45.2.1 => v46.0.0
* [@ckeditor/ckeditor5-html-embed](https://www.npmjs.com/package/@ckeditor/ckeditor5-html-embed/v/46.0.0): v45.2.1 => v46.0.0
* [@ckeditor/ckeditor5-icons](https://www.npmjs.com/package/@ckeditor/ckeditor5-icons/v/46.0.0): v45.2.1 => v46.0.0
* [@ckeditor/ckeditor5-import-word](https://www.npmjs.com/package/@ckeditor/ckeditor5-import-word/v/46.0.0): v45.2.1 => v46.0.0
* [@ckeditor/ckeditor5-indent](https://www.npmjs.com/package/@ckeditor/ckeditor5-indent/v/46.0.0): v45.2.1 => v46.0.0
* [@ckeditor/ckeditor5-language](https://www.npmjs.com/package/@ckeditor/ckeditor5-language/v/46.0.0): v45.2.1 => v46.0.0
* [@ckeditor/ckeditor5-link](https://www.npmjs.com/package/@ckeditor/ckeditor5-link/v/46.0.0): v45.2.1 => v46.0.0
* [@ckeditor/ckeditor5-list-multi-level](https://www.npmjs.com/package/@ckeditor/ckeditor5-list-multi-level/v/46.0.0): v45.2.1 => v46.0.0
* [@ckeditor/ckeditor5-media-embed](https://www.npmjs.com/package/@ckeditor/ckeditor5-media-embed/v/46.0.0): v45.2.1 => v46.0.0
* [@ckeditor/ckeditor5-mention](https://www.npmjs.com/package/@ckeditor/ckeditor5-mention/v/46.0.0): v45.2.1 => v46.0.0
* [@ckeditor/ckeditor5-merge-fields](https://www.npmjs.com/package/@ckeditor/ckeditor5-merge-fields/v/46.0.0): v45.2.1 => v46.0.0
* [@ckeditor/ckeditor5-minimap](https://www.npmjs.com/package/@ckeditor/ckeditor5-minimap/v/46.0.0): v45.2.1 => v46.0.0
* [@ckeditor/ckeditor5-operations-compressor](https://www.npmjs.com/package/@ckeditor/ckeditor5-operations-compressor/v/46.0.0): v45.2.1 => v46.0.0
* [@ckeditor/ckeditor5-pagination](https://www.npmjs.com/package/@ckeditor/ckeditor5-pagination/v/46.0.0): v45.2.1 => v46.0.0
* [@ckeditor/ckeditor5-paragraph](https://www.npmjs.com/package/@ckeditor/ckeditor5-paragraph/v/46.0.0): v45.2.1 => v46.0.0
* [@ckeditor/ckeditor5-paste-from-office-enhanced](https://www.npmjs.com/package/@ckeditor/ckeditor5-paste-from-office-enhanced/v/46.0.0): v45.2.1 => v46.0.0
* [@ckeditor/ckeditor5-real-time-collaboration](https://www.npmjs.com/package/@ckeditor/ckeditor5-real-time-collaboration/v/46.0.0): v45.2.1 => v46.0.0
* [@ckeditor/ckeditor5-restricted-editing](https://www.npmjs.com/package/@ckeditor/ckeditor5-restricted-editing/v/46.0.0): v45.2.1 => v46.0.0
* [@ckeditor/ckeditor5-revision-history](https://www.npmjs.com/package/@ckeditor/ckeditor5-revision-history/v/46.0.0): v45.2.1 => v46.0.0
* [@ckeditor/ckeditor5-select-all](https://www.npmjs.com/package/@ckeditor/ckeditor5-select-all/v/46.0.0): v45.2.1 => v46.0.0
* [@ckeditor/ckeditor5-show-blocks](https://www.npmjs.com/package/@ckeditor/ckeditor5-show-blocks/v/46.0.0): v45.2.1 => v46.0.0
* [@ckeditor/ckeditor5-slash-command](https://www.npmjs.com/package/@ckeditor/ckeditor5-slash-command/v/46.0.0): v45.2.1 => v46.0.0
* [@ckeditor/ckeditor5-source-editing-enhanced](https://www.npmjs.com/package/@ckeditor/ckeditor5-source-editing-enhanced/v/46.0.0): v45.2.1 => v46.0.0
* [@ckeditor/ckeditor5-special-characters](https://www.npmjs.com/package/@ckeditor/ckeditor5-special-characters/v/46.0.0): v45.2.1 => v46.0.0
* [@ckeditor/ckeditor5-style](https://www.npmjs.com/package/@ckeditor/ckeditor5-style/v/46.0.0): v45.2.1 => v46.0.0
* [@ckeditor/ckeditor5-template](https://www.npmjs.com/package/@ckeditor/ckeditor5-template/v/46.0.0): v45.2.1 => v46.0.0
* [@ckeditor/ckeditor5-theme-lark](https://www.npmjs.com/package/@ckeditor/ckeditor5-theme-lark/v/46.0.0): v45.2.1 => v46.0.0
* [@ckeditor/ckeditor5-track-changes](https://www.npmjs.com/package/@ckeditor/ckeditor5-track-changes/v/46.0.0): v45.2.1 => v46.0.0
* [@ckeditor/ckeditor5-typing](https://www.npmjs.com/package/@ckeditor/ckeditor5-typing/v/46.0.0): v45.2.1 => v46.0.0
* [@ckeditor/ckeditor5-ui](https://www.npmjs.com/package/@ckeditor/ckeditor5-ui/v/46.0.0): v45.2.1 => v46.0.0
* [@ckeditor/ckeditor5-undo](https://www.npmjs.com/package/@ckeditor/ckeditor5-undo/v/46.0.0): v45.2.1 => v46.0.0
* [@ckeditor/ckeditor5-uploadcare](https://www.npmjs.com/package/@ckeditor/ckeditor5-uploadcare/v/46.0.0): v45.2.1 => v46.0.0
* [@ckeditor/ckeditor5-utils](https://www.npmjs.com/package/@ckeditor/ckeditor5-utils/v/46.0.0): v45.2.1 => v46.0.0
* [@ckeditor/ckeditor5-watchdog](https://www.npmjs.com/package/@ckeditor/ckeditor5-watchdog/v/46.0.0): v45.2.1 => v46.0.0
* [@ckeditor/ckeditor5-widget](https://www.npmjs.com/package/@ckeditor/ckeditor5-widget/v/46.0.0): v45.2.1 => v46.0.0
* [@ckeditor/ckeditor5-word-count](https://www.npmjs.com/package/@ckeditor/ckeditor5-word-count/v/46.0.0): v45.2.1 => v46.0.0
* [ckeditor5-collaboration](https://www.npmjs.com/package/ckeditor5-collaboration/v/46.0.0): v45.2.1 => v46.0.0
* [ckeditor5-premium-features](https://www.npmjs.com/package/ckeditor5-premium-features/v/46.0.0): v45.2.1 => v46.0.0
</details>


## [45.2.1](https://github.com/ckeditor/ckeditor5/compare/v45.2.0...v45.2.1) (June 24, 2025)

We are happy to announce the release of CKEditor 5 v45.2.1.

### Release highlights

This hotfix release brings fixes for certain regressions in the field of text selection (with balloon toolbars enabled), multi-level lists, and pagination.

### Bug fixes

* **[engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine)**: Fixed editor crash that happened in a specific scenario, when editing heavily formatted text, text with multiple comments, or text with comments and formatting. Closes [#18727](https://github.com/ckeditor/ckeditor5/issues/18727). ([commit](https://github.com/ckeditor/ckeditor5/commit/bcb74fe09917f9a5738ad22798c40801e18965ba))
* **[engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine)**: Fixed incorrect cache invalidation in `Mapper`, which could lead to crashes when editing heavily formatted content or when using complex features like multi-level lists. Closes [#18678](https://github.com/ckeditor/ckeditor5/issues/18678). ([commit](https://github.com/ckeditor/ckeditor5/commit/170a9ed1565bebacf490adf8ca47b2cd5ae8c5f9))
* **[engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine)**: Fixed editor crash that happened when typing over a table content with the balloon toolbar enabled. Closes [#18648](https://github.com/ckeditor/ckeditor5/issues/18648). ([commit](https://github.com/ckeditor/ckeditor5/commit/613e8e81131925f664c1d4741522dc19856df3ba))
* **[list-multi-level](https://www.npmjs.com/package/@ckeditor/ckeditor5-list-multi-level)**: Fixed editor crash that happened when editing deeply nested multi-level lists. Closes [#18678](https://github.com/ckeditor/ckeditor5/issues/18678). ([commit](https://github.com/ckeditor/ckeditor5/commit/170a9ed1565bebacf490adf8ca47b2cd5ae8c5f9))
* **[table](https://www.npmjs.com/package/@ckeditor/ckeditor5-table)**: Improved calculation of pagination page-breaks on documents with long tables. Closes [#18600](https://github.com/ckeditor/ckeditor5/issues/18600). ([commit](https://github.com/ckeditor/ckeditor5/commit/2b73ed881e12502f6700fba1bfb89dbc950543ed))
* **[typing](https://www.npmjs.com/package/@ckeditor/ckeditor5-typing)**: Typing over multiple selected blocks next to a code block or a block quote should not crash the editor. Closes [#18722](https://github.com/ckeditor/ckeditor5/issues/18722). ([commit](https://github.com/ckeditor/ckeditor5/commit/51eaabcdbf1392c29cd8a9d34f65845bf6c8749d))

### Released packages

Check out the [Versioning policy](https://ckeditor.com/docs/ckeditor5/latest/framework/guides/support/versioning-policy.html) guide for more information.

<details>
<summary>Released packages (summary)</summary>

Other releases:

* [@ckeditor/ckeditor5-adapter-ckfinder](https://www.npmjs.com/package/@ckeditor/ckeditor5-adapter-ckfinder/v/45.2.1): v45.2.0 => v45.2.1
* [@ckeditor/ckeditor5-ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai/v/45.2.1): v45.2.0 => v45.2.1
* [@ckeditor/ckeditor5-alignment](https://www.npmjs.com/package/@ckeditor/ckeditor5-alignment/v/45.2.1): v45.2.0 => v45.2.1
* [@ckeditor/ckeditor5-autoformat](https://www.npmjs.com/package/@ckeditor/ckeditor5-autoformat/v/45.2.1): v45.2.0 => v45.2.1
* [@ckeditor/ckeditor5-autosave](https://www.npmjs.com/package/@ckeditor/ckeditor5-autosave/v/45.2.1): v45.2.0 => v45.2.1
* [@ckeditor/ckeditor5-basic-styles](https://www.npmjs.com/package/@ckeditor/ckeditor5-basic-styles/v/45.2.1): v45.2.0 => v45.2.1
* [@ckeditor/ckeditor5-block-quote](https://www.npmjs.com/package/@ckeditor/ckeditor5-block-quote/v/45.2.1): v45.2.0 => v45.2.1
* [@ckeditor/ckeditor5-bookmark](https://www.npmjs.com/package/@ckeditor/ckeditor5-bookmark/v/45.2.1): v45.2.0 => v45.2.1
* [@ckeditor/ckeditor5-case-change](https://www.npmjs.com/package/@ckeditor/ckeditor5-case-change/v/45.2.1): v45.2.0 => v45.2.1
* [@ckeditor/ckeditor5-ckbox](https://www.npmjs.com/package/@ckeditor/ckeditor5-ckbox/v/45.2.1): v45.2.0 => v45.2.1
* [@ckeditor/ckeditor5-ckfinder](https://www.npmjs.com/package/@ckeditor/ckeditor5-ckfinder/v/45.2.1): v45.2.0 => v45.2.1
* [@ckeditor/ckeditor5-clipboard](https://www.npmjs.com/package/@ckeditor/ckeditor5-clipboard/v/45.2.1): v45.2.0 => v45.2.1
* [@ckeditor/ckeditor5-cloud-services](https://www.npmjs.com/package/@ckeditor/ckeditor5-cloud-services/v/45.2.1): v45.2.0 => v45.2.1
* [@ckeditor/ckeditor5-code-block](https://www.npmjs.com/package/@ckeditor/ckeditor5-code-block/v/45.2.1): v45.2.0 => v45.2.1
* [@ckeditor/ckeditor5-collaboration-core](https://www.npmjs.com/package/@ckeditor/ckeditor5-collaboration-core/v/45.2.1): v45.2.0 => v45.2.1
* [@ckeditor/ckeditor5-comments](https://www.npmjs.com/package/@ckeditor/ckeditor5-comments/v/45.2.1): v45.2.0 => v45.2.1
* [@ckeditor/ckeditor5-core](https://www.npmjs.com/package/@ckeditor/ckeditor5-core/v/45.2.1): v45.2.0 => v45.2.1
* [@ckeditor/ckeditor5-document-outline](https://www.npmjs.com/package/@ckeditor/ckeditor5-document-outline/v/45.2.1): v45.2.0 => v45.2.1
* [@ckeditor/ckeditor5-easy-image](https://www.npmjs.com/package/@ckeditor/ckeditor5-easy-image/v/45.2.1): v45.2.0 => v45.2.1
* [@ckeditor/ckeditor5-editor-balloon](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-balloon/v/45.2.1): v45.2.0 => v45.2.1
* [@ckeditor/ckeditor5-editor-classic](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-classic/v/45.2.1): v45.2.0 => v45.2.1
* [@ckeditor/ckeditor5-editor-decoupled](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-decoupled/v/45.2.1): v45.2.0 => v45.2.1
* [@ckeditor/ckeditor5-editor-inline](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-inline/v/45.2.1): v45.2.0 => v45.2.1
* [@ckeditor/ckeditor5-editor-multi-root](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-multi-root/v/45.2.1): v45.2.0 => v45.2.1
* [@ckeditor/ckeditor5-email](https://www.npmjs.com/package/@ckeditor/ckeditor5-email/v/45.2.1): v45.2.0 => v45.2.1
* [@ckeditor/ckeditor5-emoji](https://www.npmjs.com/package/@ckeditor/ckeditor5-emoji/v/45.2.1): v45.2.0 => v45.2.1
* [@ckeditor/ckeditor5-engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine/v/45.2.1): v45.2.0 => v45.2.1
* [@ckeditor/ckeditor5-enter](https://www.npmjs.com/package/@ckeditor/ckeditor5-enter/v/45.2.1): v45.2.0 => v45.2.1
* [@ckeditor/ckeditor5-essentials](https://www.npmjs.com/package/@ckeditor/ckeditor5-essentials/v/45.2.1): v45.2.0 => v45.2.1
* [@ckeditor/ckeditor5-export-inline-styles](https://www.npmjs.com/package/@ckeditor/ckeditor5-export-inline-styles/v/45.2.1): v45.2.0 => v45.2.1
* [@ckeditor/ckeditor5-export-pdf](https://www.npmjs.com/package/@ckeditor/ckeditor5-export-pdf/v/45.2.1): v45.2.0 => v45.2.1
* [@ckeditor/ckeditor5-export-word](https://www.npmjs.com/package/@ckeditor/ckeditor5-export-word/v/45.2.1): v45.2.0 => v45.2.1
* [@ckeditor/ckeditor5-find-and-replace](https://www.npmjs.com/package/@ckeditor/ckeditor5-find-and-replace/v/45.2.1): v45.2.0 => v45.2.1
* [@ckeditor/ckeditor5-font](https://www.npmjs.com/package/@ckeditor/ckeditor5-font/v/45.2.1): v45.2.0 => v45.2.1
* [@ckeditor/ckeditor5-format-painter](https://www.npmjs.com/package/@ckeditor/ckeditor5-format-painter/v/45.2.1): v45.2.0 => v45.2.1
* [@ckeditor/ckeditor5-fullscreen](https://www.npmjs.com/package/@ckeditor/ckeditor5-fullscreen/v/45.2.1): v45.2.0 => v45.2.1
* [@ckeditor/ckeditor5-heading](https://www.npmjs.com/package/@ckeditor/ckeditor5-heading/v/45.2.1): v45.2.0 => v45.2.1
* [@ckeditor/ckeditor5-highlight](https://www.npmjs.com/package/@ckeditor/ckeditor5-highlight/v/45.2.1): v45.2.0 => v45.2.1
* [@ckeditor/ckeditor5-horizontal-line](https://www.npmjs.com/package/@ckeditor/ckeditor5-horizontal-line/v/45.2.1): v45.2.0 => v45.2.1
* [@ckeditor/ckeditor5-html-embed](https://www.npmjs.com/package/@ckeditor/ckeditor5-html-embed/v/45.2.1): v45.2.0 => v45.2.1
* [@ckeditor/ckeditor5-html-support](https://www.npmjs.com/package/@ckeditor/ckeditor5-html-support/v/45.2.1): v45.2.0 => v45.2.1
* [@ckeditor/ckeditor5-icons](https://www.npmjs.com/package/@ckeditor/ckeditor5-icons/v/45.2.1): v45.2.0 => v45.2.1
* [@ckeditor/ckeditor5-image](https://www.npmjs.com/package/@ckeditor/ckeditor5-image/v/45.2.1): v45.2.0 => v45.2.1
* [@ckeditor/ckeditor5-import-word](https://www.npmjs.com/package/@ckeditor/ckeditor5-import-word/v/45.2.1): v45.2.0 => v45.2.1
* [@ckeditor/ckeditor5-indent](https://www.npmjs.com/package/@ckeditor/ckeditor5-indent/v/45.2.1): v45.2.0 => v45.2.1
* [@ckeditor/ckeditor5-language](https://www.npmjs.com/package/@ckeditor/ckeditor5-language/v/45.2.1): v45.2.0 => v45.2.1
* [@ckeditor/ckeditor5-link](https://www.npmjs.com/package/@ckeditor/ckeditor5-link/v/45.2.1): v45.2.0 => v45.2.1
* [@ckeditor/ckeditor5-list](https://www.npmjs.com/package/@ckeditor/ckeditor5-list/v/45.2.1): v45.2.0 => v45.2.1
* [@ckeditor/ckeditor5-list-multi-level](https://www.npmjs.com/package/@ckeditor/ckeditor5-list-multi-level/v/45.2.1): v45.2.0 => v45.2.1
* [@ckeditor/ckeditor5-markdown-gfm](https://www.npmjs.com/package/@ckeditor/ckeditor5-markdown-gfm/v/45.2.1): v45.2.0 => v45.2.1
* [@ckeditor/ckeditor5-media-embed](https://www.npmjs.com/package/@ckeditor/ckeditor5-media-embed/v/45.2.1): v45.2.0 => v45.2.1
* [@ckeditor/ckeditor5-mention](https://www.npmjs.com/package/@ckeditor/ckeditor5-mention/v/45.2.1): v45.2.0 => v45.2.1
* [@ckeditor/ckeditor5-merge-fields](https://www.npmjs.com/package/@ckeditor/ckeditor5-merge-fields/v/45.2.1): v45.2.0 => v45.2.1
* [@ckeditor/ckeditor5-minimap](https://www.npmjs.com/package/@ckeditor/ckeditor5-minimap/v/45.2.1): v45.2.0 => v45.2.1
* [@ckeditor/ckeditor5-operations-compressor](https://www.npmjs.com/package/@ckeditor/ckeditor5-operations-compressor/v/45.2.1): v45.2.0 => v45.2.1
* [@ckeditor/ckeditor5-page-break](https://www.npmjs.com/package/@ckeditor/ckeditor5-page-break/v/45.2.1): v45.2.0 => v45.2.1
* [@ckeditor/ckeditor5-pagination](https://www.npmjs.com/package/@ckeditor/ckeditor5-pagination/v/45.2.1): v45.2.0 => v45.2.1
* [@ckeditor/ckeditor5-paragraph](https://www.npmjs.com/package/@ckeditor/ckeditor5-paragraph/v/45.2.1): v45.2.0 => v45.2.1
* [@ckeditor/ckeditor5-paste-from-office](https://www.npmjs.com/package/@ckeditor/ckeditor5-paste-from-office/v/45.2.1): v45.2.0 => v45.2.1
* [@ckeditor/ckeditor5-paste-from-office-enhanced](https://www.npmjs.com/package/@ckeditor/ckeditor5-paste-from-office-enhanced/v/45.2.1): v45.2.0 => v45.2.1
* [@ckeditor/ckeditor5-real-time-collaboration](https://www.npmjs.com/package/@ckeditor/ckeditor5-real-time-collaboration/v/45.2.1): v45.2.0 => v45.2.1
* [@ckeditor/ckeditor5-remove-format](https://www.npmjs.com/package/@ckeditor/ckeditor5-remove-format/v/45.2.1): v45.2.0 => v45.2.1
* [@ckeditor/ckeditor5-restricted-editing](https://www.npmjs.com/package/@ckeditor/ckeditor5-restricted-editing/v/45.2.1): v45.2.0 => v45.2.1
* [@ckeditor/ckeditor5-revision-history](https://www.npmjs.com/package/@ckeditor/ckeditor5-revision-history/v/45.2.1): v45.2.0 => v45.2.1
* [@ckeditor/ckeditor5-select-all](https://www.npmjs.com/package/@ckeditor/ckeditor5-select-all/v/45.2.1): v45.2.0 => v45.2.1
* [@ckeditor/ckeditor5-show-blocks](https://www.npmjs.com/package/@ckeditor/ckeditor5-show-blocks/v/45.2.1): v45.2.0 => v45.2.1
* [@ckeditor/ckeditor5-slash-command](https://www.npmjs.com/package/@ckeditor/ckeditor5-slash-command/v/45.2.1): v45.2.0 => v45.2.1
* [@ckeditor/ckeditor5-source-editing](https://www.npmjs.com/package/@ckeditor/ckeditor5-source-editing/v/45.2.1): v45.2.0 => v45.2.1
* [@ckeditor/ckeditor5-source-editing-enhanced](https://www.npmjs.com/package/@ckeditor/ckeditor5-source-editing-enhanced/v/45.2.1): v45.2.0 => v45.2.1
* [@ckeditor/ckeditor5-special-characters](https://www.npmjs.com/package/@ckeditor/ckeditor5-special-characters/v/45.2.1): v45.2.0 => v45.2.1
* [@ckeditor/ckeditor5-style](https://www.npmjs.com/package/@ckeditor/ckeditor5-style/v/45.2.1): v45.2.0 => v45.2.1
* [@ckeditor/ckeditor5-table](https://www.npmjs.com/package/@ckeditor/ckeditor5-table/v/45.2.1): v45.2.0 => v45.2.1
* [@ckeditor/ckeditor5-template](https://www.npmjs.com/package/@ckeditor/ckeditor5-template/v/45.2.1): v45.2.0 => v45.2.1
* [@ckeditor/ckeditor5-theme-lark](https://www.npmjs.com/package/@ckeditor/ckeditor5-theme-lark/v/45.2.1): v45.2.0 => v45.2.1
* [@ckeditor/ckeditor5-track-changes](https://www.npmjs.com/package/@ckeditor/ckeditor5-track-changes/v/45.2.1): v45.2.0 => v45.2.1
* [@ckeditor/ckeditor5-typing](https://www.npmjs.com/package/@ckeditor/ckeditor5-typing/v/45.2.1): v45.2.0 => v45.2.1
* [@ckeditor/ckeditor5-ui](https://www.npmjs.com/package/@ckeditor/ckeditor5-ui/v/45.2.1): v45.2.0 => v45.2.1
* [@ckeditor/ckeditor5-undo](https://www.npmjs.com/package/@ckeditor/ckeditor5-undo/v/45.2.1): v45.2.0 => v45.2.1
* [@ckeditor/ckeditor5-upload](https://www.npmjs.com/package/@ckeditor/ckeditor5-upload/v/45.2.1): v45.2.0 => v45.2.1
* [@ckeditor/ckeditor5-uploadcare](https://www.npmjs.com/package/@ckeditor/ckeditor5-uploadcare/v/45.2.1): v45.2.0 => v45.2.1
* [@ckeditor/ckeditor5-utils](https://www.npmjs.com/package/@ckeditor/ckeditor5-utils/v/45.2.1): v45.2.0 => v45.2.1
* [@ckeditor/ckeditor5-watchdog](https://www.npmjs.com/package/@ckeditor/ckeditor5-watchdog/v/45.2.1): v45.2.0 => v45.2.1
* [@ckeditor/ckeditor5-widget](https://www.npmjs.com/package/@ckeditor/ckeditor5-widget/v/45.2.1): v45.2.0 => v45.2.1
* [@ckeditor/ckeditor5-word-count](https://www.npmjs.com/package/@ckeditor/ckeditor5-word-count/v/45.2.1): v45.2.0 => v45.2.1
* [ckeditor5-collaboration](https://www.npmjs.com/package/ckeditor5-collaboration/v/45.2.1): v45.2.0 => v45.2.1
* [ckeditor5-premium-features](https://www.npmjs.com/package/ckeditor5-premium-features/v/45.2.1): v45.2.0 => v45.2.1
</details>

---

To see all releases, visit the [release page](https://github.com/ckeditor/ckeditor5/releases).
