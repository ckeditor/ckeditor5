Changelog
=========

## [48.5.2](https://github.com/ckeditor/ckeditor5/compare/v48.5.1...v48.5.2) (September 22, 2026)

We are excited to announce the release of CKEditor 5 v48.5.2.

### Bug fixes

* **[utils](https://www.npmjs.com/package/@ckeditor/ckeditor5-utils)**: The `EmitterMixinConstructor`, `ObservableMixinConstructor` and `DomEmitterMixinConstructor` types no longer resolve to `undefined` in projects that compile with the `strictNullChecks` option disabled. Closes [#20238](https://github.com/ckeditor/ckeditor5/issues/20238).

  Thanks to [@ld3nl](https://github.com/ld3nl).
* **[utils](https://www.npmjs.com/package/@ckeditor/ckeditor5-utils)**: Fixed an initialization failure in Safari 27 on Intel Macs by working around a regression in the browser’s implementation of `String#substr()`. Closes [#20237](https://github.com/ckeditor/ckeditor5/issues/20237).

  Affected Safari builds return the entire string instead of an empty string when `String#substr()` is called with a negative length. For event names without a namespace separator, this caused an event node to reference itself as a child, leading to infinite recursion and a stack overflow when collecting callbacks. The editor no longer relies on `String#substr()` for this operation.

  Thanks to [@ld3nl](https://github.com/ld3nl).

### Released packages

Check out the [Versioning policy](https://ckeditor.com/docs/ckeditor5/latest/framework/guides/support/versioning-policy.html) guide for more information.

<details>
<summary>Released packages (summary)</summary>

Other releases:

* [@ckeditor/ckeditor5-adapter-ckfinder](https://www.npmjs.com/package/@ckeditor/ckeditor5-adapter-ckfinder/v/48.5.2): v48.5.1 => v48.5.2
* [@ckeditor/ckeditor5-ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai/v/48.5.2): v48.5.1 => v48.5.2
* [@ckeditor/ckeditor5-alignment](https://www.npmjs.com/package/@ckeditor/ckeditor5-alignment/v/48.5.2): v48.5.1 => v48.5.2
* [@ckeditor/ckeditor5-autoformat](https://www.npmjs.com/package/@ckeditor/ckeditor5-autoformat/v/48.5.2): v48.5.1 => v48.5.2
* [@ckeditor/ckeditor5-autosave](https://www.npmjs.com/package/@ckeditor/ckeditor5-autosave/v/48.5.2): v48.5.1 => v48.5.2
* [@ckeditor/ckeditor5-basic-styles](https://www.npmjs.com/package/@ckeditor/ckeditor5-basic-styles/v/48.5.2): v48.5.1 => v48.5.2
* [@ckeditor/ckeditor5-block-quote](https://www.npmjs.com/package/@ckeditor/ckeditor5-block-quote/v/48.5.2): v48.5.1 => v48.5.2
* [@ckeditor/ckeditor5-bookmark](https://www.npmjs.com/package/@ckeditor/ckeditor5-bookmark/v/48.5.2): v48.5.1 => v48.5.2
* [@ckeditor/ckeditor5-case-change](https://www.npmjs.com/package/@ckeditor/ckeditor5-case-change/v/48.5.2): v48.5.1 => v48.5.2
* [@ckeditor/ckeditor5-ckbox](https://www.npmjs.com/package/@ckeditor/ckeditor5-ckbox/v/48.5.2): v48.5.1 => v48.5.2
* [@ckeditor/ckeditor5-ckfinder](https://www.npmjs.com/package/@ckeditor/ckeditor5-ckfinder/v/48.5.2): v48.5.1 => v48.5.2
* [@ckeditor/ckeditor5-clipboard](https://www.npmjs.com/package/@ckeditor/ckeditor5-clipboard/v/48.5.2): v48.5.1 => v48.5.2
* [@ckeditor/ckeditor5-cloud-services](https://www.npmjs.com/package/@ckeditor/ckeditor5-cloud-services/v/48.5.2): v48.5.1 => v48.5.2
* [@ckeditor/ckeditor5-code-block](https://www.npmjs.com/package/@ckeditor/ckeditor5-code-block/v/48.5.2): v48.5.1 => v48.5.2
* [@ckeditor/ckeditor5-collaboration-core](https://www.npmjs.com/package/@ckeditor/ckeditor5-collaboration-core/v/48.5.2): v48.5.1 => v48.5.2
* [@ckeditor/ckeditor5-comments](https://www.npmjs.com/package/@ckeditor/ckeditor5-comments/v/48.5.2): v48.5.1 => v48.5.2
* [@ckeditor/ckeditor5-core](https://www.npmjs.com/package/@ckeditor/ckeditor5-core/v/48.5.2): v48.5.1 => v48.5.2
* [@ckeditor/ckeditor5-document-outline](https://www.npmjs.com/package/@ckeditor/ckeditor5-document-outline/v/48.5.2): v48.5.1 => v48.5.2
* [@ckeditor/ckeditor5-easy-image](https://www.npmjs.com/package/@ckeditor/ckeditor5-easy-image/v/48.5.2): v48.5.1 => v48.5.2
* [@ckeditor/ckeditor5-editor-balloon](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-balloon/v/48.5.2): v48.5.1 => v48.5.2
* [@ckeditor/ckeditor5-editor-classic](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-classic/v/48.5.2): v48.5.1 => v48.5.2
* [@ckeditor/ckeditor5-editor-decoupled](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-decoupled/v/48.5.2): v48.5.1 => v48.5.2
* [@ckeditor/ckeditor5-editor-inline](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-inline/v/48.5.2): v48.5.1 => v48.5.2
* [@ckeditor/ckeditor5-editor-multi-root](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-multi-root/v/48.5.2): v48.5.1 => v48.5.2
* [@ckeditor/ckeditor5-email](https://www.npmjs.com/package/@ckeditor/ckeditor5-email/v/48.5.2): v48.5.1 => v48.5.2
* [@ckeditor/ckeditor5-emoji](https://www.npmjs.com/package/@ckeditor/ckeditor5-emoji/v/48.5.2): v48.5.1 => v48.5.2
* [@ckeditor/ckeditor5-engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine/v/48.5.2): v48.5.1 => v48.5.2
* [@ckeditor/ckeditor5-enter](https://www.npmjs.com/package/@ckeditor/ckeditor5-enter/v/48.5.2): v48.5.1 => v48.5.2
* [@ckeditor/ckeditor5-essentials](https://www.npmjs.com/package/@ckeditor/ckeditor5-essentials/v/48.5.2): v48.5.1 => v48.5.2
* [@ckeditor/ckeditor5-export-inline-styles](https://www.npmjs.com/package/@ckeditor/ckeditor5-export-inline-styles/v/48.5.2): v48.5.1 => v48.5.2
* [@ckeditor/ckeditor5-export-pdf](https://www.npmjs.com/package/@ckeditor/ckeditor5-export-pdf/v/48.5.2): v48.5.1 => v48.5.2
* [@ckeditor/ckeditor5-export-word](https://www.npmjs.com/package/@ckeditor/ckeditor5-export-word/v/48.5.2): v48.5.1 => v48.5.2
* [@ckeditor/ckeditor5-find-and-replace](https://www.npmjs.com/package/@ckeditor/ckeditor5-find-and-replace/v/48.5.2): v48.5.1 => v48.5.2
* [@ckeditor/ckeditor5-font](https://www.npmjs.com/package/@ckeditor/ckeditor5-font/v/48.5.2): v48.5.1 => v48.5.2
* [@ckeditor/ckeditor5-footnotes](https://www.npmjs.com/package/@ckeditor/ckeditor5-footnotes/v/48.5.2): v48.5.1 => v48.5.2
* [@ckeditor/ckeditor5-format-painter](https://www.npmjs.com/package/@ckeditor/ckeditor5-format-painter/v/48.5.2): v48.5.1 => v48.5.2
* [@ckeditor/ckeditor5-fullscreen](https://www.npmjs.com/package/@ckeditor/ckeditor5-fullscreen/v/48.5.2): v48.5.1 => v48.5.2
* [@ckeditor/ckeditor5-heading](https://www.npmjs.com/package/@ckeditor/ckeditor5-heading/v/48.5.2): v48.5.1 => v48.5.2
* [@ckeditor/ckeditor5-highlight](https://www.npmjs.com/package/@ckeditor/ckeditor5-highlight/v/48.5.2): v48.5.1 => v48.5.2
* [@ckeditor/ckeditor5-horizontal-line](https://www.npmjs.com/package/@ckeditor/ckeditor5-horizontal-line/v/48.5.2): v48.5.1 => v48.5.2
* [@ckeditor/ckeditor5-html-embed](https://www.npmjs.com/package/@ckeditor/ckeditor5-html-embed/v/48.5.2): v48.5.1 => v48.5.2
* [@ckeditor/ckeditor5-html-support](https://www.npmjs.com/package/@ckeditor/ckeditor5-html-support/v/48.5.2): v48.5.1 => v48.5.2
* [@ckeditor/ckeditor5-icons](https://www.npmjs.com/package/@ckeditor/ckeditor5-icons/v/48.5.2): v48.5.1 => v48.5.2
* [@ckeditor/ckeditor5-image](https://www.npmjs.com/package/@ckeditor/ckeditor5-image/v/48.5.2): v48.5.1 => v48.5.2
* [@ckeditor/ckeditor5-import-word](https://www.npmjs.com/package/@ckeditor/ckeditor5-import-word/v/48.5.2): v48.5.1 => v48.5.2
* [@ckeditor/ckeditor5-indent](https://www.npmjs.com/package/@ckeditor/ckeditor5-indent/v/48.5.2): v48.5.1 => v48.5.2
* [@ckeditor/ckeditor5-language](https://www.npmjs.com/package/@ckeditor/ckeditor5-language/v/48.5.2): v48.5.1 => v48.5.2
* [@ckeditor/ckeditor5-line-height](https://www.npmjs.com/package/@ckeditor/ckeditor5-line-height/v/48.5.2): v48.5.1 => v48.5.2
* [@ckeditor/ckeditor5-link](https://www.npmjs.com/package/@ckeditor/ckeditor5-link/v/48.5.2): v48.5.1 => v48.5.2
* [@ckeditor/ckeditor5-list](https://www.npmjs.com/package/@ckeditor/ckeditor5-list/v/48.5.2): v48.5.1 => v48.5.2
* [@ckeditor/ckeditor5-list-multi-level](https://www.npmjs.com/package/@ckeditor/ckeditor5-list-multi-level/v/48.5.2): v48.5.1 => v48.5.2
* [@ckeditor/ckeditor5-markdown-gfm](https://www.npmjs.com/package/@ckeditor/ckeditor5-markdown-gfm/v/48.5.2): v48.5.1 => v48.5.2
* [@ckeditor/ckeditor5-media-embed](https://www.npmjs.com/package/@ckeditor/ckeditor5-media-embed/v/48.5.2): v48.5.1 => v48.5.2
* [@ckeditor/ckeditor5-mention](https://www.npmjs.com/package/@ckeditor/ckeditor5-mention/v/48.5.2): v48.5.1 => v48.5.2
* [@ckeditor/ckeditor5-merge-fields](https://www.npmjs.com/package/@ckeditor/ckeditor5-merge-fields/v/48.5.2): v48.5.1 => v48.5.2
* [@ckeditor/ckeditor5-minimap](https://www.npmjs.com/package/@ckeditor/ckeditor5-minimap/v/48.5.2): v48.5.1 => v48.5.2
* [@ckeditor/ckeditor5-operations-compressor](https://www.npmjs.com/package/@ckeditor/ckeditor5-operations-compressor/v/48.5.2): v48.5.1 => v48.5.2
* [@ckeditor/ckeditor5-page-break](https://www.npmjs.com/package/@ckeditor/ckeditor5-page-break/v/48.5.2): v48.5.1 => v48.5.2
* [@ckeditor/ckeditor5-pagination](https://www.npmjs.com/package/@ckeditor/ckeditor5-pagination/v/48.5.2): v48.5.1 => v48.5.2
* [@ckeditor/ckeditor5-paragraph](https://www.npmjs.com/package/@ckeditor/ckeditor5-paragraph/v/48.5.2): v48.5.1 => v48.5.2
* [@ckeditor/ckeditor5-paste-from-office](https://www.npmjs.com/package/@ckeditor/ckeditor5-paste-from-office/v/48.5.2): v48.5.1 => v48.5.2
* [@ckeditor/ckeditor5-paste-from-office-enhanced](https://www.npmjs.com/package/@ckeditor/ckeditor5-paste-from-office-enhanced/v/48.5.2): v48.5.1 => v48.5.2
* [@ckeditor/ckeditor5-real-time-collaboration](https://www.npmjs.com/package/@ckeditor/ckeditor5-real-time-collaboration/v/48.5.2): v48.5.1 => v48.5.2
* [@ckeditor/ckeditor5-remove-format](https://www.npmjs.com/package/@ckeditor/ckeditor5-remove-format/v/48.5.2): v48.5.1 => v48.5.2
* [@ckeditor/ckeditor5-restricted-editing](https://www.npmjs.com/package/@ckeditor/ckeditor5-restricted-editing/v/48.5.2): v48.5.1 => v48.5.2
* [@ckeditor/ckeditor5-revision-history](https://www.npmjs.com/package/@ckeditor/ckeditor5-revision-history/v/48.5.2): v48.5.1 => v48.5.2
* [@ckeditor/ckeditor5-select-all](https://www.npmjs.com/package/@ckeditor/ckeditor5-select-all/v/48.5.2): v48.5.1 => v48.5.2
* [@ckeditor/ckeditor5-show-blocks](https://www.npmjs.com/package/@ckeditor/ckeditor5-show-blocks/v/48.5.2): v48.5.1 => v48.5.2
* [@ckeditor/ckeditor5-slash-command](https://www.npmjs.com/package/@ckeditor/ckeditor5-slash-command/v/48.5.2): v48.5.1 => v48.5.2
* [@ckeditor/ckeditor5-source-editing](https://www.npmjs.com/package/@ckeditor/ckeditor5-source-editing/v/48.5.2): v48.5.1 => v48.5.2
* [@ckeditor/ckeditor5-source-editing-enhanced](https://www.npmjs.com/package/@ckeditor/ckeditor5-source-editing-enhanced/v/48.5.2): v48.5.1 => v48.5.2
* [@ckeditor/ckeditor5-special-characters](https://www.npmjs.com/package/@ckeditor/ckeditor5-special-characters/v/48.5.2): v48.5.1 => v48.5.2
* [@ckeditor/ckeditor5-style](https://www.npmjs.com/package/@ckeditor/ckeditor5-style/v/48.5.2): v48.5.1 => v48.5.2
* [@ckeditor/ckeditor5-table](https://www.npmjs.com/package/@ckeditor/ckeditor5-table/v/48.5.2): v48.5.1 => v48.5.2
* [@ckeditor/ckeditor5-template](https://www.npmjs.com/package/@ckeditor/ckeditor5-template/v/48.5.2): v48.5.1 => v48.5.2
* [@ckeditor/ckeditor5-track-changes](https://www.npmjs.com/package/@ckeditor/ckeditor5-track-changes/v/48.5.2): v48.5.1 => v48.5.2
* [@ckeditor/ckeditor5-typing](https://www.npmjs.com/package/@ckeditor/ckeditor5-typing/v/48.5.2): v48.5.1 => v48.5.2
* [@ckeditor/ckeditor5-ui](https://www.npmjs.com/package/@ckeditor/ckeditor5-ui/v/48.5.2): v48.5.1 => v48.5.2
* [@ckeditor/ckeditor5-undo](https://www.npmjs.com/package/@ckeditor/ckeditor5-undo/v/48.5.2): v48.5.1 => v48.5.2
* [@ckeditor/ckeditor5-upload](https://www.npmjs.com/package/@ckeditor/ckeditor5-upload/v/48.5.2): v48.5.1 => v48.5.2
* [@ckeditor/ckeditor5-uploadcare](https://www.npmjs.com/package/@ckeditor/ckeditor5-uploadcare/v/48.5.2): v48.5.1 => v48.5.2
* [@ckeditor/ckeditor5-utils](https://www.npmjs.com/package/@ckeditor/ckeditor5-utils/v/48.5.2): v48.5.1 => v48.5.2
* [@ckeditor/ckeditor5-watchdog](https://www.npmjs.com/package/@ckeditor/ckeditor5-watchdog/v/48.5.2): v48.5.1 => v48.5.2
* [@ckeditor/ckeditor5-widget](https://www.npmjs.com/package/@ckeditor/ckeditor5-widget/v/48.5.2): v48.5.1 => v48.5.2
* [@ckeditor/ckeditor5-word-count](https://www.npmjs.com/package/@ckeditor/ckeditor5-word-count/v/48.5.2): v48.5.1 => v48.5.2
* [ckeditor5](https://www.npmjs.com/package/ckeditor5/v/48.5.2): v48.5.1 => v48.5.2
* [ckeditor5-premium-features](https://www.npmjs.com/package/ckeditor5-premium-features/v/48.5.2): v48.5.1 => v48.5.2
</details>


## [48.5.1](https://github.com/ckeditor/ckeditor5/compare/v48.5.0...v48.5.1) (September 16, 2026)

CKEditor 5 v48.5.1 is now available.

### Release highlights

This release addresses two cross-site scripting (XSS) vulnerabilities in the CKEditor 5 engine.

The first vulnerability ([`GHSA-rh54-vffm-5fvp`](https://github.com/ckeditor/ckeditor5/security/advisories/GHSA-rh54-vffm-5fvp)) is caused by a prototype pollution issue in the `es-toolkit` library used in the CKEditor 5 codebase. This vulnerability could lead to unauthorized JavaScript code execution when the editor processes incoming `style` attribute values. The underlying issue has been patched by the library maintainers, and the fix has been incorporated into CKEditor 5.

The second vulnerability ([`GHSA-v6mg-96c6-gmpq`](https://github.com/ckeditor/ckeditor5/security/advisories/GHSA-v6mg-96c6-gmpq)) affects only installations where [General HTML Support](https://ckeditor.com/docs/ckeditor5/latest/features/html/general-html-support.html) is enabled with a specific configuration that allows inserting objects. This vulnerability could lead to unauthorized JavaScript code execution in a browser context isolated from the origin of the application embedding the editor.

You can read more details in the relevant security advisories and [contact us](mailto:security@cksource.com) if you have more questions.

**Note:** Publication of the official CVE records for these issues is pending. Due to a significant increase in CVE publication requests across the industry, GitHub has indicated that the process may take approximately five weeks.

### Bug fixes

* **[engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine)**: Improved `data:` URI filtering in the editing view by allowing only binary image, audio and video MIME types. This change addresses [`GHSA-v6mg-96c6-gmpq`](https://github.com/ckeditor/ckeditor5/security/advisories/GHSA-v6mg-96c6-gmpq).

### Other changes

* Updated the `es-toolkit` dependency from v1.45.1 to v1.52.0 to address the prototype pollution vulnerability described in [`GHSA-rh54-vffm-5fvp`](https://github.com/ckeditor/ckeditor5/security/advisories/GHSA-rh54-vffm-5fvp).

### Released packages

Check out the [Versioning policy](https://ckeditor.com/docs/ckeditor5/latest/framework/guides/support/versioning-policy.html) guide for more information.

<details>
<summary>Released packages (summary)</summary>

Other releases:

* [@ckeditor/ckeditor5-adapter-ckfinder](https://www.npmjs.com/package/@ckeditor/ckeditor5-adapter-ckfinder/v/48.5.1): v48.5.0 => v48.5.1
* [@ckeditor/ckeditor5-ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai/v/48.5.1): v48.5.0 => v48.5.1
* [@ckeditor/ckeditor5-alignment](https://www.npmjs.com/package/@ckeditor/ckeditor5-alignment/v/48.5.1): v48.5.0 => v48.5.1
* [@ckeditor/ckeditor5-autoformat](https://www.npmjs.com/package/@ckeditor/ckeditor5-autoformat/v/48.5.1): v48.5.0 => v48.5.1
* [@ckeditor/ckeditor5-autosave](https://www.npmjs.com/package/@ckeditor/ckeditor5-autosave/v/48.5.1): v48.5.0 => v48.5.1
* [@ckeditor/ckeditor5-basic-styles](https://www.npmjs.com/package/@ckeditor/ckeditor5-basic-styles/v/48.5.1): v48.5.0 => v48.5.1
* [@ckeditor/ckeditor5-block-quote](https://www.npmjs.com/package/@ckeditor/ckeditor5-block-quote/v/48.5.1): v48.5.0 => v48.5.1
* [@ckeditor/ckeditor5-bookmark](https://www.npmjs.com/package/@ckeditor/ckeditor5-bookmark/v/48.5.1): v48.5.0 => v48.5.1
* [@ckeditor/ckeditor5-case-change](https://www.npmjs.com/package/@ckeditor/ckeditor5-case-change/v/48.5.1): v48.5.0 => v48.5.1
* [@ckeditor/ckeditor5-ckbox](https://www.npmjs.com/package/@ckeditor/ckeditor5-ckbox/v/48.5.1): v48.5.0 => v48.5.1
* [@ckeditor/ckeditor5-ckfinder](https://www.npmjs.com/package/@ckeditor/ckeditor5-ckfinder/v/48.5.1): v48.5.0 => v48.5.1
* [@ckeditor/ckeditor5-clipboard](https://www.npmjs.com/package/@ckeditor/ckeditor5-clipboard/v/48.5.1): v48.5.0 => v48.5.1
* [@ckeditor/ckeditor5-cloud-services](https://www.npmjs.com/package/@ckeditor/ckeditor5-cloud-services/v/48.5.1): v48.5.0 => v48.5.1
* [@ckeditor/ckeditor5-code-block](https://www.npmjs.com/package/@ckeditor/ckeditor5-code-block/v/48.5.1): v48.5.0 => v48.5.1
* [@ckeditor/ckeditor5-collaboration-core](https://www.npmjs.com/package/@ckeditor/ckeditor5-collaboration-core/v/48.5.1): v48.5.0 => v48.5.1
* [@ckeditor/ckeditor5-comments](https://www.npmjs.com/package/@ckeditor/ckeditor5-comments/v/48.5.1): v48.5.0 => v48.5.1
* [@ckeditor/ckeditor5-core](https://www.npmjs.com/package/@ckeditor/ckeditor5-core/v/48.5.1): v48.5.0 => v48.5.1
* [@ckeditor/ckeditor5-document-outline](https://www.npmjs.com/package/@ckeditor/ckeditor5-document-outline/v/48.5.1): v48.5.0 => v48.5.1
* [@ckeditor/ckeditor5-easy-image](https://www.npmjs.com/package/@ckeditor/ckeditor5-easy-image/v/48.5.1): v48.5.0 => v48.5.1
* [@ckeditor/ckeditor5-editor-balloon](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-balloon/v/48.5.1): v48.5.0 => v48.5.1
* [@ckeditor/ckeditor5-editor-classic](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-classic/v/48.5.1): v48.5.0 => v48.5.1
* [@ckeditor/ckeditor5-editor-decoupled](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-decoupled/v/48.5.1): v48.5.0 => v48.5.1
* [@ckeditor/ckeditor5-editor-inline](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-inline/v/48.5.1): v48.5.0 => v48.5.1
* [@ckeditor/ckeditor5-editor-multi-root](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-multi-root/v/48.5.1): v48.5.0 => v48.5.1
* [@ckeditor/ckeditor5-email](https://www.npmjs.com/package/@ckeditor/ckeditor5-email/v/48.5.1): v48.5.0 => v48.5.1
* [@ckeditor/ckeditor5-emoji](https://www.npmjs.com/package/@ckeditor/ckeditor5-emoji/v/48.5.1): v48.5.0 => v48.5.1
* [@ckeditor/ckeditor5-engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine/v/48.5.1): v48.5.0 => v48.5.1
* [@ckeditor/ckeditor5-enter](https://www.npmjs.com/package/@ckeditor/ckeditor5-enter/v/48.5.1): v48.5.0 => v48.5.1
* [@ckeditor/ckeditor5-essentials](https://www.npmjs.com/package/@ckeditor/ckeditor5-essentials/v/48.5.1): v48.5.0 => v48.5.1
* [@ckeditor/ckeditor5-export-inline-styles](https://www.npmjs.com/package/@ckeditor/ckeditor5-export-inline-styles/v/48.5.1): v48.5.0 => v48.5.1
* [@ckeditor/ckeditor5-export-pdf](https://www.npmjs.com/package/@ckeditor/ckeditor5-export-pdf/v/48.5.1): v48.5.0 => v48.5.1
* [@ckeditor/ckeditor5-export-word](https://www.npmjs.com/package/@ckeditor/ckeditor5-export-word/v/48.5.1): v48.5.0 => v48.5.1
* [@ckeditor/ckeditor5-find-and-replace](https://www.npmjs.com/package/@ckeditor/ckeditor5-find-and-replace/v/48.5.1): v48.5.0 => v48.5.1
* [@ckeditor/ckeditor5-font](https://www.npmjs.com/package/@ckeditor/ckeditor5-font/v/48.5.1): v48.5.0 => v48.5.1
* [@ckeditor/ckeditor5-footnotes](https://www.npmjs.com/package/@ckeditor/ckeditor5-footnotes/v/48.5.1): v48.5.0 => v48.5.1
* [@ckeditor/ckeditor5-format-painter](https://www.npmjs.com/package/@ckeditor/ckeditor5-format-painter/v/48.5.1): v48.5.0 => v48.5.1
* [@ckeditor/ckeditor5-fullscreen](https://www.npmjs.com/package/@ckeditor/ckeditor5-fullscreen/v/48.5.1): v48.5.0 => v48.5.1
* [@ckeditor/ckeditor5-heading](https://www.npmjs.com/package/@ckeditor/ckeditor5-heading/v/48.5.1): v48.5.0 => v48.5.1
* [@ckeditor/ckeditor5-highlight](https://www.npmjs.com/package/@ckeditor/ckeditor5-highlight/v/48.5.1): v48.5.0 => v48.5.1
* [@ckeditor/ckeditor5-horizontal-line](https://www.npmjs.com/package/@ckeditor/ckeditor5-horizontal-line/v/48.5.1): v48.5.0 => v48.5.1
* [@ckeditor/ckeditor5-html-embed](https://www.npmjs.com/package/@ckeditor/ckeditor5-html-embed/v/48.5.1): v48.5.0 => v48.5.1
* [@ckeditor/ckeditor5-html-support](https://www.npmjs.com/package/@ckeditor/ckeditor5-html-support/v/48.5.1): v48.5.0 => v48.5.1
* [@ckeditor/ckeditor5-icons](https://www.npmjs.com/package/@ckeditor/ckeditor5-icons/v/48.5.1): v48.5.0 => v48.5.1
* [@ckeditor/ckeditor5-image](https://www.npmjs.com/package/@ckeditor/ckeditor5-image/v/48.5.1): v48.5.0 => v48.5.1
* [@ckeditor/ckeditor5-import-word](https://www.npmjs.com/package/@ckeditor/ckeditor5-import-word/v/48.5.1): v48.5.0 => v48.5.1
* [@ckeditor/ckeditor5-indent](https://www.npmjs.com/package/@ckeditor/ckeditor5-indent/v/48.5.1): v48.5.0 => v48.5.1
* [@ckeditor/ckeditor5-language](https://www.npmjs.com/package/@ckeditor/ckeditor5-language/v/48.5.1): v48.5.0 => v48.5.1
* [@ckeditor/ckeditor5-line-height](https://www.npmjs.com/package/@ckeditor/ckeditor5-line-height/v/48.5.1): v48.5.0 => v48.5.1
* [@ckeditor/ckeditor5-link](https://www.npmjs.com/package/@ckeditor/ckeditor5-link/v/48.5.1): v48.5.0 => v48.5.1
* [@ckeditor/ckeditor5-list](https://www.npmjs.com/package/@ckeditor/ckeditor5-list/v/48.5.1): v48.5.0 => v48.5.1
* [@ckeditor/ckeditor5-list-multi-level](https://www.npmjs.com/package/@ckeditor/ckeditor5-list-multi-level/v/48.5.1): v48.5.0 => v48.5.1
* [@ckeditor/ckeditor5-markdown-gfm](https://www.npmjs.com/package/@ckeditor/ckeditor5-markdown-gfm/v/48.5.1): v48.5.0 => v48.5.1
* [@ckeditor/ckeditor5-media-embed](https://www.npmjs.com/package/@ckeditor/ckeditor5-media-embed/v/48.5.1): v48.5.0 => v48.5.1
* [@ckeditor/ckeditor5-mention](https://www.npmjs.com/package/@ckeditor/ckeditor5-mention/v/48.5.1): v48.5.0 => v48.5.1
* [@ckeditor/ckeditor5-merge-fields](https://www.npmjs.com/package/@ckeditor/ckeditor5-merge-fields/v/48.5.1): v48.5.0 => v48.5.1
* [@ckeditor/ckeditor5-minimap](https://www.npmjs.com/package/@ckeditor/ckeditor5-minimap/v/48.5.1): v48.5.0 => v48.5.1
* [@ckeditor/ckeditor5-operations-compressor](https://www.npmjs.com/package/@ckeditor/ckeditor5-operations-compressor/v/48.5.1): v48.5.0 => v48.5.1
* [@ckeditor/ckeditor5-page-break](https://www.npmjs.com/package/@ckeditor/ckeditor5-page-break/v/48.5.1): v48.5.0 => v48.5.1
* [@ckeditor/ckeditor5-pagination](https://www.npmjs.com/package/@ckeditor/ckeditor5-pagination/v/48.5.1): v48.5.0 => v48.5.1
* [@ckeditor/ckeditor5-paragraph](https://www.npmjs.com/package/@ckeditor/ckeditor5-paragraph/v/48.5.1): v48.5.0 => v48.5.1
* [@ckeditor/ckeditor5-paste-from-office](https://www.npmjs.com/package/@ckeditor/ckeditor5-paste-from-office/v/48.5.1): v48.5.0 => v48.5.1
* [@ckeditor/ckeditor5-paste-from-office-enhanced](https://www.npmjs.com/package/@ckeditor/ckeditor5-paste-from-office-enhanced/v/48.5.1): v48.5.0 => v48.5.1
* [@ckeditor/ckeditor5-real-time-collaboration](https://www.npmjs.com/package/@ckeditor/ckeditor5-real-time-collaboration/v/48.5.1): v48.5.0 => v48.5.1
* [@ckeditor/ckeditor5-remove-format](https://www.npmjs.com/package/@ckeditor/ckeditor5-remove-format/v/48.5.1): v48.5.0 => v48.5.1
* [@ckeditor/ckeditor5-restricted-editing](https://www.npmjs.com/package/@ckeditor/ckeditor5-restricted-editing/v/48.5.1): v48.5.0 => v48.5.1
* [@ckeditor/ckeditor5-revision-history](https://www.npmjs.com/package/@ckeditor/ckeditor5-revision-history/v/48.5.1): v48.5.0 => v48.5.1
* [@ckeditor/ckeditor5-select-all](https://www.npmjs.com/package/@ckeditor/ckeditor5-select-all/v/48.5.1): v48.5.0 => v48.5.1
* [@ckeditor/ckeditor5-show-blocks](https://www.npmjs.com/package/@ckeditor/ckeditor5-show-blocks/v/48.5.1): v48.5.0 => v48.5.1
* [@ckeditor/ckeditor5-slash-command](https://www.npmjs.com/package/@ckeditor/ckeditor5-slash-command/v/48.5.1): v48.5.0 => v48.5.1
* [@ckeditor/ckeditor5-source-editing](https://www.npmjs.com/package/@ckeditor/ckeditor5-source-editing/v/48.5.1): v48.5.0 => v48.5.1
* [@ckeditor/ckeditor5-source-editing-enhanced](https://www.npmjs.com/package/@ckeditor/ckeditor5-source-editing-enhanced/v/48.5.1): v48.5.0 => v48.5.1
* [@ckeditor/ckeditor5-special-characters](https://www.npmjs.com/package/@ckeditor/ckeditor5-special-characters/v/48.5.1): v48.5.0 => v48.5.1
* [@ckeditor/ckeditor5-style](https://www.npmjs.com/package/@ckeditor/ckeditor5-style/v/48.5.1): v48.5.0 => v48.5.1
* [@ckeditor/ckeditor5-table](https://www.npmjs.com/package/@ckeditor/ckeditor5-table/v/48.5.1): v48.5.0 => v48.5.1
* [@ckeditor/ckeditor5-template](https://www.npmjs.com/package/@ckeditor/ckeditor5-template/v/48.5.1): v48.5.0 => v48.5.1
* [@ckeditor/ckeditor5-track-changes](https://www.npmjs.com/package/@ckeditor/ckeditor5-track-changes/v/48.5.1): v48.5.0 => v48.5.1
* [@ckeditor/ckeditor5-typing](https://www.npmjs.com/package/@ckeditor/ckeditor5-typing/v/48.5.1): v48.5.0 => v48.5.1
* [@ckeditor/ckeditor5-ui](https://www.npmjs.com/package/@ckeditor/ckeditor5-ui/v/48.5.1): v48.5.0 => v48.5.1
* [@ckeditor/ckeditor5-undo](https://www.npmjs.com/package/@ckeditor/ckeditor5-undo/v/48.5.1): v48.5.0 => v48.5.1
* [@ckeditor/ckeditor5-upload](https://www.npmjs.com/package/@ckeditor/ckeditor5-upload/v/48.5.1): v48.5.0 => v48.5.1
* [@ckeditor/ckeditor5-uploadcare](https://www.npmjs.com/package/@ckeditor/ckeditor5-uploadcare/v/48.5.1): v48.5.0 => v48.5.1
* [@ckeditor/ckeditor5-utils](https://www.npmjs.com/package/@ckeditor/ckeditor5-utils/v/48.5.1): v48.5.0 => v48.5.1
* [@ckeditor/ckeditor5-watchdog](https://www.npmjs.com/package/@ckeditor/ckeditor5-watchdog/v/48.5.1): v48.5.0 => v48.5.1
* [@ckeditor/ckeditor5-widget](https://www.npmjs.com/package/@ckeditor/ckeditor5-widget/v/48.5.1): v48.5.0 => v48.5.1
* [@ckeditor/ckeditor5-word-count](https://www.npmjs.com/package/@ckeditor/ckeditor5-word-count/v/48.5.1): v48.5.0 => v48.5.1
* [ckeditor5](https://www.npmjs.com/package/ckeditor5/v/48.5.1): v48.5.0 => v48.5.1
* [ckeditor5-premium-features](https://www.npmjs.com/package/ckeditor5-premium-features/v/48.5.1): v48.5.0 => v48.5.1
</details>


## [48.5.0](https://github.com/ckeditor/ckeditor5/compare/v48.4.0...v48.5.0) (September 2, 2026)

We are happy to announce the release of CKEditor 5 v48.5.0.

### Release highlights

#### ⭐ AI Chat: better HTML awareness and context handling

[AI Chat](https://ckeditor.com/docs/ckeditor5/latest/features/ai/ckeditor-ai-chat.html) now better understands the [General HTML Support](https://ckeditor.com/docs/ckeditor5/latest/features/html/general-html-support.html) configuration. The editor shares which additional HTML elements, classes, styles, and attributes are allowed in the content, so the AI produces replies that respect your content rules. Read more about how the AI adapts to your setup in the [feature understanding guide](https://ckeditor.com/docs/ckeditor5/latest/features/ai/ckeditor-ai-feature-understanding.html).

We also made the [Context Library](https://ckeditor.com/docs/ckeditor5/latest/features/ai/ckeditor-ai-context-library.html) available directly to users in the chat. Enable the new `config.ai.chat.context.contextLibrary` option to add the library to the "Add context" menu of AI Chat, where users attach a context to the conversation like any other resource. The list shows only the contexts the user token grants access to, and once the first message is sent, the context stays attached for the whole conversation. Learn more about [offering contexts in the AI Chat picker](https://ckeditor.com/docs/ckeditor5/latest/features/ai/ckeditor-ai-context-library.html#offering-contexts-in-the-ai-chat-picker).

#### ⭐ AI-assisted suggestions marked in Revision History

[AI-generated suggestions](https://ckeditor.com/docs/ckeditor5/latest/features/ai/ckeditor-ai-generated-suggestions.html) can already advertise their origin while they are open in the document. With this release, the same information can be surfaced in [Revision History](https://ckeditor.com/docs/ckeditor5/latest/features/collaboration/revision-history/revision-history.html): revisions that include suggestions created with AI features can be visually marked as AI-assisted. Reviewers can tell at a glance which saved revisions involved AI, even after the suggestions were accepted.

The feature is opt-in and disabled by default. Enable it with the new `config.revisionHistory.showAISource` option. See the [documentation](https://ckeditor.com/docs/ckeditor5/latest/features/ai/ckeditor-ai-generated-suggestions.html#marking-ai-changes-in-revision-history) for details.

#### Table improvements

We are making table column resizing more predictable. Columns no longer shrink by a few pixels when resizing starts while the editor content has a vertical scrollbar, and resizing the last column of a nested table by a resizer placed in a header cell no longer stretches that table to the full width of its parent table.

We also improved how table wrapper classes interact with the General HTML Support feature: the `content-table` and `layout-table` classes set on the `<figure>` element wrapping a content table are no longer preserved as arbitrary classes, keeping the output markup clean.

### Features

* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai)**: Introduced the `DocumentCompare` API, which captures a snapshot of the document, compares it with a processed version, and applies the resulting difference to the editor directly or as Track Changes suggestions.
* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai)**: Improved the AI agent's understanding of the General HTML Support configuration. The agent now recognizes which additional HTML elements, classes, styles, and attributes are allowed in the content.
* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai)**: Changed AI Chat context items to match the behavior of file and link attachments. A context item can no longer be removed after the first message is sent, and its badge appears only next to that message.
* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai)**: Added a dedicated API method for attaching a Context Library item to the AI Chat context.
* **[revision-history](https://www.npmjs.com/package/@ckeditor/ckeditor5-revision-history)**: Added the `config.revisionHistory.showAISource` option for visually marking revisions that include changes created with AI features as AI-assisted, both in the revisions list and when comparing revisions.
* **[revision-history](https://www.npmjs.com/package/@ckeditor/ckeditor5-revision-history)**: Introduced the `revisionHistory.showCommentHighlights` configuration option for highlighting comment markers saved in revisions. This option is disabled by default.

  This option never highlights markers for removed or resolved comment threads because Revision History does not restore these comments automatically.

### Bug fixes

* **[collaboration-core](https://www.npmjs.com/package/@ckeditor/ckeditor5-collaboration-core), [comments](https://www.npmjs.com/package/@ckeditor/ckeditor5-comments), [track-changes](https://www.npmjs.com/package/@ckeditor/ckeditor5-track-changes)**: Fixed relative date labels such as "Today" and "Yesterday" to use calendar days instead of elapsed hours. An item created on the previous day is now labeled "Yesterday" regardless of how many hours have passed.
* **[collaboration-core](https://www.npmjs.com/package/@ckeditor/ckeditor5-collaboration-core), [revision-history](https://www.npmjs.com/package/@ckeditor/ckeditor5-revision-history), [track-changes](https://www.npmjs.com/package/@ckeditor/ckeditor5-track-changes)**: Fixed errors that occurred when opening the revision history viewer or using Track Changes data in integrations where AI features were registered on a context instead of an editor.
* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai)**: Improved error reports from AI features by including details from the point of failure. Previously, error tracking services did not receive these details.
* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai)**: Fixed an issue where AI Chat displayed outdated suggested changes while streaming a reply.
* **[collaboration-core](https://www.npmjs.com/package/@ckeditor/ckeditor5-collaboration-core)**: Fixed an issue where `DocumentCompare` produced inaccurate results when General HTML Support was configured to allow the `data-id` attribute.
* **[revision-history](https://www.npmjs.com/package/@ckeditor/ckeditor5-revision-history)**: Fixed an issue where `RevisionTracker#saveRevision()` modified the revision data object passed to it. Previously, reusing this object in multiple calls caused subsequent revisions to reuse the first revision's identifier.
* **[revision-history](https://www.npmjs.com/package/@ckeditor/ckeditor5-revision-history)**: Fixed an issue where the revision viewer failed to open when the AI chat history feature was enabled.
* **[table](https://www.npmjs.com/package/@ckeditor/ckeditor5-table)**: Fixed an issue where table columns shrank by a few pixels when resizing started while the editor content had a vertical scrollbar. Closes [#20117](https://github.com/ckeditor/ckeditor5/issues/20117).
* **[table](https://www.npmjs.com/package/@ckeditor/ckeditor5-table)**: Fixed an issue where resizing the last column of a nested table using a resizer in a header cell stretched that table to the full width of its parent table.
* **[table](https://www.npmjs.com/package/@ckeditor/ckeditor5-table)**: Fixed an issue where General HTML Support preserved the `content-table` and `layout-table` classes set on the `<figure>` element wrapping a content table as arbitrary classes.

### Other changes

* **[comments](https://www.npmjs.com/package/@ckeditor/ckeditor5-comments)**: Changed annotation activation for overlapping comments and suggestions to target the annotation displayed higher in the sidebar while keeping the other annotation accessible.

### Released packages

Check out the [Versioning policy](https://ckeditor.com/docs/ckeditor5/latest/framework/guides/support/versioning-policy.html) guide for more information.

<details>
<summary>Released packages (summary)</summary>

Releases containing new features:

* [@ckeditor/ckeditor5-ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai/v/48.5.0): v48.4.0 => v48.5.0
* [@ckeditor/ckeditor5-revision-history](https://www.npmjs.com/package/@ckeditor/ckeditor5-revision-history/v/48.5.0): v48.4.0 => v48.5.0

Other releases:

* [@ckeditor/ckeditor5-adapter-ckfinder](https://www.npmjs.com/package/@ckeditor/ckeditor5-adapter-ckfinder/v/48.5.0): v48.4.0 => v48.5.0
* [@ckeditor/ckeditor5-alignment](https://www.npmjs.com/package/@ckeditor/ckeditor5-alignment/v/48.5.0): v48.4.0 => v48.5.0
* [@ckeditor/ckeditor5-autoformat](https://www.npmjs.com/package/@ckeditor/ckeditor5-autoformat/v/48.5.0): v48.4.0 => v48.5.0
* [@ckeditor/ckeditor5-autosave](https://www.npmjs.com/package/@ckeditor/ckeditor5-autosave/v/48.5.0): v48.4.0 => v48.5.0
* [@ckeditor/ckeditor5-basic-styles](https://www.npmjs.com/package/@ckeditor/ckeditor5-basic-styles/v/48.5.0): v48.4.0 => v48.5.0
* [@ckeditor/ckeditor5-block-quote](https://www.npmjs.com/package/@ckeditor/ckeditor5-block-quote/v/48.5.0): v48.4.0 => v48.5.0
* [@ckeditor/ckeditor5-bookmark](https://www.npmjs.com/package/@ckeditor/ckeditor5-bookmark/v/48.5.0): v48.4.0 => v48.5.0
* [@ckeditor/ckeditor5-case-change](https://www.npmjs.com/package/@ckeditor/ckeditor5-case-change/v/48.5.0): v48.4.0 => v48.5.0
* [@ckeditor/ckeditor5-ckbox](https://www.npmjs.com/package/@ckeditor/ckeditor5-ckbox/v/48.5.0): v48.4.0 => v48.5.0
* [@ckeditor/ckeditor5-ckfinder](https://www.npmjs.com/package/@ckeditor/ckeditor5-ckfinder/v/48.5.0): v48.4.0 => v48.5.0
* [@ckeditor/ckeditor5-clipboard](https://www.npmjs.com/package/@ckeditor/ckeditor5-clipboard/v/48.5.0): v48.4.0 => v48.5.0
* [@ckeditor/ckeditor5-cloud-services](https://www.npmjs.com/package/@ckeditor/ckeditor5-cloud-services/v/48.5.0): v48.4.0 => v48.5.0
* [@ckeditor/ckeditor5-code-block](https://www.npmjs.com/package/@ckeditor/ckeditor5-code-block/v/48.5.0): v48.4.0 => v48.5.0
* [@ckeditor/ckeditor5-collaboration-core](https://www.npmjs.com/package/@ckeditor/ckeditor5-collaboration-core/v/48.5.0): v48.4.0 => v48.5.0
* [@ckeditor/ckeditor5-comments](https://www.npmjs.com/package/@ckeditor/ckeditor5-comments/v/48.5.0): v48.4.0 => v48.5.0
* [@ckeditor/ckeditor5-core](https://www.npmjs.com/package/@ckeditor/ckeditor5-core/v/48.5.0): v48.4.0 => v48.5.0
* [@ckeditor/ckeditor5-document-outline](https://www.npmjs.com/package/@ckeditor/ckeditor5-document-outline/v/48.5.0): v48.4.0 => v48.5.0
* [@ckeditor/ckeditor5-easy-image](https://www.npmjs.com/package/@ckeditor/ckeditor5-easy-image/v/48.5.0): v48.4.0 => v48.5.0
* [@ckeditor/ckeditor5-editor-balloon](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-balloon/v/48.5.0): v48.4.0 => v48.5.0
* [@ckeditor/ckeditor5-editor-classic](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-classic/v/48.5.0): v48.4.0 => v48.5.0
* [@ckeditor/ckeditor5-editor-decoupled](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-decoupled/v/48.5.0): v48.4.0 => v48.5.0
* [@ckeditor/ckeditor5-editor-inline](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-inline/v/48.5.0): v48.4.0 => v48.5.0
* [@ckeditor/ckeditor5-editor-multi-root](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-multi-root/v/48.5.0): v48.4.0 => v48.5.0
* [@ckeditor/ckeditor5-email](https://www.npmjs.com/package/@ckeditor/ckeditor5-email/v/48.5.0): v48.4.0 => v48.5.0
* [@ckeditor/ckeditor5-emoji](https://www.npmjs.com/package/@ckeditor/ckeditor5-emoji/v/48.5.0): v48.4.0 => v48.5.0
* [@ckeditor/ckeditor5-engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine/v/48.5.0): v48.4.0 => v48.5.0
* [@ckeditor/ckeditor5-enter](https://www.npmjs.com/package/@ckeditor/ckeditor5-enter/v/48.5.0): v48.4.0 => v48.5.0
* [@ckeditor/ckeditor5-essentials](https://www.npmjs.com/package/@ckeditor/ckeditor5-essentials/v/48.5.0): v48.4.0 => v48.5.0
* [@ckeditor/ckeditor5-export-inline-styles](https://www.npmjs.com/package/@ckeditor/ckeditor5-export-inline-styles/v/48.5.0): v48.4.0 => v48.5.0
* [@ckeditor/ckeditor5-export-pdf](https://www.npmjs.com/package/@ckeditor/ckeditor5-export-pdf/v/48.5.0): v48.4.0 => v48.5.0
* [@ckeditor/ckeditor5-export-word](https://www.npmjs.com/package/@ckeditor/ckeditor5-export-word/v/48.5.0): v48.4.0 => v48.5.0
* [@ckeditor/ckeditor5-find-and-replace](https://www.npmjs.com/package/@ckeditor/ckeditor5-find-and-replace/v/48.5.0): v48.4.0 => v48.5.0
* [@ckeditor/ckeditor5-font](https://www.npmjs.com/package/@ckeditor/ckeditor5-font/v/48.5.0): v48.4.0 => v48.5.0
* [@ckeditor/ckeditor5-footnotes](https://www.npmjs.com/package/@ckeditor/ckeditor5-footnotes/v/48.5.0): v48.4.0 => v48.5.0
* [@ckeditor/ckeditor5-format-painter](https://www.npmjs.com/package/@ckeditor/ckeditor5-format-painter/v/48.5.0): v48.4.0 => v48.5.0
* [@ckeditor/ckeditor5-fullscreen](https://www.npmjs.com/package/@ckeditor/ckeditor5-fullscreen/v/48.5.0): v48.4.0 => v48.5.0
* [@ckeditor/ckeditor5-heading](https://www.npmjs.com/package/@ckeditor/ckeditor5-heading/v/48.5.0): v48.4.0 => v48.5.0
* [@ckeditor/ckeditor5-highlight](https://www.npmjs.com/package/@ckeditor/ckeditor5-highlight/v/48.5.0): v48.4.0 => v48.5.0
* [@ckeditor/ckeditor5-horizontal-line](https://www.npmjs.com/package/@ckeditor/ckeditor5-horizontal-line/v/48.5.0): v48.4.0 => v48.5.0
* [@ckeditor/ckeditor5-html-embed](https://www.npmjs.com/package/@ckeditor/ckeditor5-html-embed/v/48.5.0): v48.4.0 => v48.5.0
* [@ckeditor/ckeditor5-html-support](https://www.npmjs.com/package/@ckeditor/ckeditor5-html-support/v/48.5.0): v48.4.0 => v48.5.0
* [@ckeditor/ckeditor5-icons](https://www.npmjs.com/package/@ckeditor/ckeditor5-icons/v/48.5.0): v48.4.0 => v48.5.0
* [@ckeditor/ckeditor5-image](https://www.npmjs.com/package/@ckeditor/ckeditor5-image/v/48.5.0): v48.4.0 => v48.5.0
* [@ckeditor/ckeditor5-import-word](https://www.npmjs.com/package/@ckeditor/ckeditor5-import-word/v/48.5.0): v48.4.0 => v48.5.0
* [@ckeditor/ckeditor5-indent](https://www.npmjs.com/package/@ckeditor/ckeditor5-indent/v/48.5.0): v48.4.0 => v48.5.0
* [@ckeditor/ckeditor5-language](https://www.npmjs.com/package/@ckeditor/ckeditor5-language/v/48.5.0): v48.4.0 => v48.5.0
* [@ckeditor/ckeditor5-line-height](https://www.npmjs.com/package/@ckeditor/ckeditor5-line-height/v/48.5.0): v48.4.0 => v48.5.0
* [@ckeditor/ckeditor5-link](https://www.npmjs.com/package/@ckeditor/ckeditor5-link/v/48.5.0): v48.4.0 => v48.5.0
* [@ckeditor/ckeditor5-list](https://www.npmjs.com/package/@ckeditor/ckeditor5-list/v/48.5.0): v48.4.0 => v48.5.0
* [@ckeditor/ckeditor5-list-multi-level](https://www.npmjs.com/package/@ckeditor/ckeditor5-list-multi-level/v/48.5.0): v48.4.0 => v48.5.0
* [@ckeditor/ckeditor5-markdown-gfm](https://www.npmjs.com/package/@ckeditor/ckeditor5-markdown-gfm/v/48.5.0): v48.4.0 => v48.5.0
* [@ckeditor/ckeditor5-media-embed](https://www.npmjs.com/package/@ckeditor/ckeditor5-media-embed/v/48.5.0): v48.4.0 => v48.5.0
* [@ckeditor/ckeditor5-mention](https://www.npmjs.com/package/@ckeditor/ckeditor5-mention/v/48.5.0): v48.4.0 => v48.5.0
* [@ckeditor/ckeditor5-merge-fields](https://www.npmjs.com/package/@ckeditor/ckeditor5-merge-fields/v/48.5.0): v48.4.0 => v48.5.0
* [@ckeditor/ckeditor5-minimap](https://www.npmjs.com/package/@ckeditor/ckeditor5-minimap/v/48.5.0): v48.4.0 => v48.5.0
* [@ckeditor/ckeditor5-operations-compressor](https://www.npmjs.com/package/@ckeditor/ckeditor5-operations-compressor/v/48.5.0): v48.4.0 => v48.5.0
* [@ckeditor/ckeditor5-page-break](https://www.npmjs.com/package/@ckeditor/ckeditor5-page-break/v/48.5.0): v48.4.0 => v48.5.0
* [@ckeditor/ckeditor5-pagination](https://www.npmjs.com/package/@ckeditor/ckeditor5-pagination/v/48.5.0): v48.4.0 => v48.5.0
* [@ckeditor/ckeditor5-paragraph](https://www.npmjs.com/package/@ckeditor/ckeditor5-paragraph/v/48.5.0): v48.4.0 => v48.5.0
* [@ckeditor/ckeditor5-paste-from-office](https://www.npmjs.com/package/@ckeditor/ckeditor5-paste-from-office/v/48.5.0): v48.4.0 => v48.5.0
* [@ckeditor/ckeditor5-paste-from-office-enhanced](https://www.npmjs.com/package/@ckeditor/ckeditor5-paste-from-office-enhanced/v/48.5.0): v48.4.0 => v48.5.0
* [@ckeditor/ckeditor5-real-time-collaboration](https://www.npmjs.com/package/@ckeditor/ckeditor5-real-time-collaboration/v/48.5.0): v48.4.0 => v48.5.0
* [@ckeditor/ckeditor5-remove-format](https://www.npmjs.com/package/@ckeditor/ckeditor5-remove-format/v/48.5.0): v48.4.0 => v48.5.0
* [@ckeditor/ckeditor5-restricted-editing](https://www.npmjs.com/package/@ckeditor/ckeditor5-restricted-editing/v/48.5.0): v48.4.0 => v48.5.0
* [@ckeditor/ckeditor5-select-all](https://www.npmjs.com/package/@ckeditor/ckeditor5-select-all/v/48.5.0): v48.4.0 => v48.5.0
* [@ckeditor/ckeditor5-show-blocks](https://www.npmjs.com/package/@ckeditor/ckeditor5-show-blocks/v/48.5.0): v48.4.0 => v48.5.0
* [@ckeditor/ckeditor5-slash-command](https://www.npmjs.com/package/@ckeditor/ckeditor5-slash-command/v/48.5.0): v48.4.0 => v48.5.0
* [@ckeditor/ckeditor5-source-editing](https://www.npmjs.com/package/@ckeditor/ckeditor5-source-editing/v/48.5.0): v48.4.0 => v48.5.0
* [@ckeditor/ckeditor5-source-editing-enhanced](https://www.npmjs.com/package/@ckeditor/ckeditor5-source-editing-enhanced/v/48.5.0): v48.4.0 => v48.5.0
* [@ckeditor/ckeditor5-special-characters](https://www.npmjs.com/package/@ckeditor/ckeditor5-special-characters/v/48.5.0): v48.4.0 => v48.5.0
* [@ckeditor/ckeditor5-style](https://www.npmjs.com/package/@ckeditor/ckeditor5-style/v/48.5.0): v48.4.0 => v48.5.0
* [@ckeditor/ckeditor5-table](https://www.npmjs.com/package/@ckeditor/ckeditor5-table/v/48.5.0): v48.4.0 => v48.5.0
* [@ckeditor/ckeditor5-template](https://www.npmjs.com/package/@ckeditor/ckeditor5-template/v/48.5.0): v48.4.0 => v48.5.0
* [@ckeditor/ckeditor5-track-changes](https://www.npmjs.com/package/@ckeditor/ckeditor5-track-changes/v/48.5.0): v48.4.0 => v48.5.0
* [@ckeditor/ckeditor5-typing](https://www.npmjs.com/package/@ckeditor/ckeditor5-typing/v/48.5.0): v48.4.0 => v48.5.0
* [@ckeditor/ckeditor5-ui](https://www.npmjs.com/package/@ckeditor/ckeditor5-ui/v/48.5.0): v48.4.0 => v48.5.0
* [@ckeditor/ckeditor5-undo](https://www.npmjs.com/package/@ckeditor/ckeditor5-undo/v/48.5.0): v48.4.0 => v48.5.0
* [@ckeditor/ckeditor5-upload](https://www.npmjs.com/package/@ckeditor/ckeditor5-upload/v/48.5.0): v48.4.0 => v48.5.0
* [@ckeditor/ckeditor5-uploadcare](https://www.npmjs.com/package/@ckeditor/ckeditor5-uploadcare/v/48.5.0): v48.4.0 => v48.5.0
* [@ckeditor/ckeditor5-utils](https://www.npmjs.com/package/@ckeditor/ckeditor5-utils/v/48.5.0): v48.4.0 => v48.5.0
* [@ckeditor/ckeditor5-watchdog](https://www.npmjs.com/package/@ckeditor/ckeditor5-watchdog/v/48.5.0): v48.4.0 => v48.5.0
* [@ckeditor/ckeditor5-widget](https://www.npmjs.com/package/@ckeditor/ckeditor5-widget/v/48.5.0): v48.4.0 => v48.5.0
* [@ckeditor/ckeditor5-word-count](https://www.npmjs.com/package/@ckeditor/ckeditor5-word-count/v/48.5.0): v48.4.0 => v48.5.0
* [ckeditor5](https://www.npmjs.com/package/ckeditor5/v/48.5.0): v48.4.0 => v48.5.0
* [ckeditor5-premium-features](https://www.npmjs.com/package/ckeditor5-premium-features/v/48.5.0): v48.4.0 => v48.5.0
</details>


## [48.4.0](https://github.com/ckeditor/ckeditor5/compare/v48.3.1...v48.4.0) (August 5, 2026)

We are happy to announce the release of CKEditor 5 v48.4.0.

### Release highlights

#### ⭐ AI Context Library

The new [Context Library](https://ckeditor.com/docs/ckeditor5/latest/features/ai/ckeditor-ai-context-library.html) grounds CKEditor AI in your organization's knowledge instead of generic instructions. A **context** is a named container managed on the AI service that holds reusable prompts and reference files, such as a style guide, a glossary, or compliance rules. Once attached, every [AI Chat](https://ckeditor.com/docs/ckeditor5/latest/features/ai/ckeditor-ai-chat.html) conversation, [Quick Action](https://ckeditor.com/docs/ckeditor5/latest/features/ai/ckeditor-ai-actions.html), [Review](https://ckeditor.com/docs/ckeditor5/latest/features/ai/ckeditor-ai-review.html), and [Translate](https://ckeditor.com/docs/ckeditor5/latest/features/ai/ckeditor-ai-translate.html) run follows them.

Contexts can be applied environment-wide by an administrator, per editor instance via the new `config.ai.defaultContext` option, or per call in programmatic flows, and they stay invisible to the end user. Learn more in the [documentation](https://ckeditor.com/docs/ckeditor5/latest/features/ai/ckeditor-ai-context-library.html).

#### ⭐ Editor feature understanding and configuration awareness

CKEditor AI now knows your editor better. [AI Chat](https://ckeditor.com/docs/ckeditor5/latest/features/ai/ckeditor-ai-chat.html) requests include a compact snapshot of the loaded features and their configuration, so the responses stay within what your editor supports and respect your configured values, like the allowed heading levels, font sizes, or color palettes. The result: AI changes that apply cleanly to your exact setup.

Feature understanding works out of the box, with no configuration required, and this is only the first iteration. Support for custom plugins, dynamic data features, and working with comments and suggestions is planned. See the [documentation](https://ckeditor.com/docs/ckeditor5/latest/features/ai/ckeditor-ai-feature-understanding.html) for details.

#### ⭐ AI image understanding

CKEditor AI now analyzes images embedded in the document, so it can describe them, generate captions, or take their contents into account when editing the surrounding text. It works in AI Chat and document processing. Learn more in the [image analysis](https://ckeditor.com/docs/ckeditor5/latest/features/ai/ckeditor-ai-integration.html#image-analysis) section of the integration guide.

#### ⭐ Track Changes: clipboard mode

The new `config.trackChanges.clipboardMode` option controls how [Track Changes](https://ckeditor.com/docs/ckeditor5/latest/features/collaboration/track-changes/track-changes.html) suggestions behave when content is copied or cut. The default `'keep'` places the selected content on the clipboard as-is, while `'accept'` resolves the suggestions in the copy, so the clipboard holds the final text, as if the suggestions were already accepted. The source document stays untouched, which makes this especially useful when pasting content outside the editor.

#### Table improvements

This release brings a set of upgrades to the [Tables](https://ckeditor.com/docs/ckeditor5/latest/features/tables/tables.html) feature, focused on everyday editing:

* **Split multiple cells at once**: select several cells and split them all horizontally or vertically in one go, instead of repeating the action cell by cell.
* **Horizontal scrolling for wide tables**: tables wider than the editor now scroll horizontally instead of overflowing or squeezing the page layout, thanks to the new `TableScroll` plugin.
* **Pixel-based column widths**: the [Column resize](https://ckeditor.com/docs/ckeditor5/latest/features/tables/tables-resize.html) feature now supports widths in pixels, following the table width unit, and an exact column width can be set through the cell width field. Widths set via the resize handle and the properties form now stay in sync.

#### Formatting preserved around block widgets

Inserting a block widget, such as an image or a table, no longer drops the active text formatting. The editor now carries selection attributes like bold, italic, or font styles over the widget, so typing after it (or inside a newly inserted table) picks up right where you left off.

#### Other improvements and fixes

* Added support for inline roots across the AI features, including [AI Chat](https://ckeditor.com/docs/ckeditor5/latest/features/ai/ckeditor-ai-chat.html), [Quick Actions](https://ckeditor.com/docs/ckeditor5/latest/features/ai/ckeditor-ai-actions.html), [Review](https://ckeditor.com/docs/ckeditor5/latest/features/ai/ckeditor-ai-review.html), and [Translate](https://ckeditor.com/docs/ckeditor5/latest/features/ai/ckeditor-ai-translate.html).
* [Programmatic AI actions](https://ckeditor.com/docs/ckeditor5/latest/features/ai/ckeditor-ai-programmatic.html) now support multi-root editors and multi-editor `Context` setups, and `processDocument()` accepts new `capabilities` options that enable reasoning and web search.
* In multi-editor setups, AI Chat now re-uploads only the documents that changed, instead of every document on any change.
* The AI suggestion status indicators (Accepted, Rejected, Outdated) have a refreshed look, and the Outdated indicator now shows a reason-specific tooltip explaining why the suggestion became stale.
* AI interactions that modify content are now disabled when the target editor is read-only. In setups with multiple editors this is decided per editor, so interactions targeting editable editors stay available.
* Inline root corrections across features: [Find and replace](https://ckeditor.com/docs/ckeditor5/latest/features/find-and-replace.html) now finds matches inside inline roots, while [Show blocks](https://ckeditor.com/docs/ckeditor5/latest/features/show-blocks.html) and [Footnotes](https://ckeditor.com/docs/ckeditor5/latest/features/footnotes.html) no longer incorrectly work with them.
* [Link](https://ckeditor.com/docs/ckeditor5/latest/features/link.html) improvements: decorators can now be configured while creating a link, before it is inserted, and the "Link properties" button is no longer disabled for empty links when `config.link.allowCreatingEmptyLinks` is enabled.

### MINOR BREAKING CHANGES [ℹ️](https://ckeditor.com/docs/ckeditor5/latest/framework/guides/support/versioning-policy.html#major-and-minor-breaking-changes)

* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai)**: Added support for multi-root editors and multi-editor `Context` setups to the AI Translate API (`AITranslateGateway`).
* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai)**: Added support for multi-root editors and multi-editor `Context` setups to the AI Review API (`AIReviewGateway`).
* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai)**: Added support for multi-root editors and multi-editor `Context` setups to `AIDocumentProcessingGateway#processDocument()`. Replaced the `root` option with `roots` and changed the return type from `AIDocumentProcessingRunResult` to `AIRunResult<AIDocumentProcessingRunResult>`.

### Features

* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai), [collaboration-core](https://www.npmjs.com/package/@ckeditor/ckeditor5-collaboration-core)**: Added an optional `root` option to the Document Processing API's `processDocument()` method, allowing integrators to target a specific root in multi-root editors and multi-editor `Context` setups.
* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai)**: Updated the appearance of the AI suggestion status indicators (Accepted, Rejected, and Outdated). Added a reason-specific tooltip to the Outdated indicator that explains why the suggestion became outdated.
* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai)**: Added optional `capabilities` to the AI Document Processing API's `processDocument()` options, allowing callers to enable reasoning and web search for AI requests.
* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai)**: Added a snapshot of the editor's loaded features and their configuration to AI Chat requests, allowing the agent to tailor its responses to the editor's capabilities.
* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai)**: Added support for inline roots across the AI features, including AI Chat, Quick Actions, Review, and Translate.
* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai)**: Disabled content-modifying AI interactions, such as applying or inserting a suggestion, when the target editor is read-only. In setups with multiple editors, interactions targeting editable editors remain available.
* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai)**: Added a new configuration option, `config.ai.extraHttpHeaders`, allowing the AI service to analyze document images hosted behind authentication, for example from a private CDN.
* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai)**: Introduced the `ai.defaultContext` configuration option, allowing integrators to attach administrator-managed contexts from the Context Library, such as reusable prompts and reference files, to AI requests without exposing them in the user interface. This configuration is supported across all AI features, including AI Chat, AI Quick Actions, AI Review Mode, and AI Translate.
* **[link](https://www.npmjs.com/package/@ckeditor/ckeditor5-link)**: Added support for configuring link decorators while creating a link, before inserting it into the document. Closes [#20201](https://github.com/ckeditor/ckeditor5/issues/20201).
* **[table](https://www.npmjs.com/package/@ckeditor/ckeditor5-table)**: Added horizontal scrolling for tables wider than the editor, preventing them from overflowing or squeezing the page layout. This behavior is provided by the new `TableScroll` plugin.
* **[table](https://www.npmjs.com/package/@ckeditor/ckeditor5-table)**: Preserved active text formatting, such as bold, italic, and font color, when inserting a table. Typing in any cell of the new table now continues the formatting used before the table. Closes [#17152](https://github.com/ckeditor/ckeditor5/issues/17152).
* **[table](https://www.npmjs.com/package/@ckeditor/ckeditor5-table)**: Added support for column widths in pixels to the table column resize feature when the table uses pixel widths. The cell width field can now set an exact width for an entire column in a resized table. Closes [#14236](https://github.com/ckeditor/ckeditor5/issues/14236).
* **[table](https://www.npmjs.com/package/@ckeditor/ckeditor5-table)**: Added support for splitting multiple table cells at once. Selecting several cells and choosing "Split cell vertically" or "Split cell horizontally" now splits each selected cell in one operation.
* **[track-changes](https://www.npmjs.com/package/@ckeditor/ckeditor5-track-changes)**: Added the `trackChanges.clipboardMode` configuration option to control whether suggestions are preserved or accepted when content is copied or cut. The source document remains unchanged.

  The default `'keep'` mode places the selected content on the clipboard with its suggestions, while `'accept'` places the final content as if the suggestions were accepted.
* **[widget](https://www.npmjs.com/package/@ckeditor/ckeditor5-widget)**: Preserved active text formatting when inserting a new paragraph after a block widget. The editor now copies selection attributes, such as bold, italic, and font styles, from the text preceding the widget. Closes [#17152](https://github.com/ckeditor/ckeditor5/issues/17152).

### Bug fixes

* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai)**: Fixed an editor crash that occurred when applying an AI Chat change in specific multi-level list scenarios.
* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai)**: Preserved comments and suggestions when applying an AI change to the surrounding content.
* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai)**: Disabled dragging and dropping files or URLs into the AI Chat panel while an AI response is being generated. Previously, dropped resources were uploaded and then discarded when the response finished or was interrupted.
* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai)**: Disabled the "Ask AI" quick action button while an AI Chat response is being processed, preventing a new chat interaction from starting before the current one finishes.
* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai)**: Fixed an editor crash that occurred for some AI Chat queries when General HTML Support was enabled and the content included an `<h1>` element.
* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai)**: Updated the AI Chat feed to scroll to every new error message.
* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai)**: Disabled AI Chat quick actions while a conversation is loading from history or a reply is streaming. Previously, they could be triggered before the chat was ready.
* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai)**: Fixed an issue where the AI Chat feed sometimes appeared stuck after submitting a message while a large document was loaded.
* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai)**: Fixed the AI Chat submit button remaining disabled after starting a new chat while a file or URL was still uploading in a previous conversation. Starting a new conversation now resets the upload progress state.
* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai)**: Fixed the `formatBlock` suggestion marker being cut off in AI suggestion previews, including the AI Chat feed.
* **[engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine)**: Fixed a memory leak that occurred when an editor instance remained referenced after being destroyed.
* **[find-and-replace](https://www.npmjs.com/package/@ckeditor/ckeditor5-find-and-replace)**: Fixed an issue where Find and Replace did not find matches inside inline roots.
* **[find-and-replace](https://www.npmjs.com/package/@ckeditor/ckeditor5-find-and-replace)**: Fixed a memory leak that could degrade editor performance during long editing sessions after replacing all occurrences of a search phrase.
* **[footnotes](https://www.npmjs.com/package/@ckeditor/ckeditor5-footnotes)**: Prevented footnotes from being inserted into inline roots. Footnotes within inline roots now use the first non-inline root for the footnote definitions container instead of omitting it.
* **[fullscreen](https://www.npmjs.com/package/@ckeditor/ckeditor5-fullscreen)**: Prevented contextual balloons from overlapping the main editor toolbar in fullscreen mode when scrolling through elements taller than the visible editor area, such as large tables. Closes [#20194](https://github.com/ckeditor/ckeditor5/issues/20194).
* **[link](https://www.npmjs.com/package/@ckeditor/ckeditor5-link)**: Fixed the "Link properties" button being disabled for links with an empty URL, even when `config.link.allowCreatingEmptyLinks` was enabled.
* **[mention](https://www.npmjs.com/package/@ckeditor/ckeditor5-mention)**: Prevented the mention suggestions panel from overflowing the viewport on narrow screens. When the caret is close to the screen edge, the panel now shifts horizontally to keep the entire list visible. Closes [#20182](https://github.com/ckeditor/ckeditor5/issues/20182).

  Thanks to [@ELHart05](https://github.com/ELHart05).
* **[show-blocks](https://www.npmjs.com/package/@ckeditor/ckeditor5-show-blocks)**: Prevented Show Blocks from applying to inline roots. The toolbar button is now disabled when the editor has no block roots.
* **[style](https://www.npmjs.com/package/@ckeditor/ckeditor5-style)**: Prevented style previews from overflowing their buttons in the Styles dropdown. Closes [#20200](https://github.com/ckeditor/ckeditor5/issues/20200).
* **[table](https://www.npmjs.com/package/@ckeditor/ckeditor5-table)**: Fixed a crash (`conversion-slot-filter-incomplete` error) that occurred when loading or pasting content containing multiple `<table>` elements wrapped in a single aligning `<div>`. Closes [#20209](https://github.com/ckeditor/ckeditor5/issues/20209).
* **[ui](https://www.npmjs.com/package/@ckeditor/ckeditor5-ui)**: Fixed the contextual balloon closing unexpectedly when using its "Previous" and "Next" navigation buttons. Clicking these buttons no longer moves focus out of the editor, so focus-sensitive views such as the balloon toolbar stay visible.

### Other changes

* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai)**: Exposed structured backend error data from AI gateway connectors, such as an `issues` list describing fields that failed validation, under `result.error.data.backendData`.
* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai)**: Updated AI Chat in multi-editor setups to re-upload only changed documents. Previously, changing one document re-uploaded documents from all editors.
* **[document-outline](https://www.npmjs.com/package/@ckeditor/ckeditor5-document-outline)**: Added support for recognizing all heading elements (`<h1>` through `<h6>`) in Document Outline and Table of Contents, regardless of whether Heading or General HTML Support handles them. These elements now receive an `id` attribute in the document data and a `headingId` attribute in the model.
* Separated editor UI styles from content styles. No visual or functional changes are expected, but integrations with heavily customized styling should verify their appearance after updating.

### Released packages

Check out the [Versioning policy](https://ckeditor.com/docs/ckeditor5/latest/framework/guides/support/versioning-policy.html) guide for more information.

<details>
<summary>Released packages (summary)</summary>

Minor releases (contain minor breaking changes):

* [@ckeditor/ckeditor5-ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai/v/48.4.0): v48.3.1 => v48.4.0

Releases containing new features:

* [@ckeditor/ckeditor5-collaboration-core](https://www.npmjs.com/package/@ckeditor/ckeditor5-collaboration-core/v/48.4.0): v48.3.1 => v48.4.0
* [@ckeditor/ckeditor5-link](https://www.npmjs.com/package/@ckeditor/ckeditor5-link/v/48.4.0): v48.3.1 => v48.4.0
* [@ckeditor/ckeditor5-table](https://www.npmjs.com/package/@ckeditor/ckeditor5-table/v/48.4.0): v48.3.1 => v48.4.0
* [@ckeditor/ckeditor5-track-changes](https://www.npmjs.com/package/@ckeditor/ckeditor5-track-changes/v/48.4.0): v48.3.1 => v48.4.0
* [@ckeditor/ckeditor5-widget](https://www.npmjs.com/package/@ckeditor/ckeditor5-widget/v/48.4.0): v48.3.1 => v48.4.0

Other releases:

* [@ckeditor/ckeditor5-adapter-ckfinder](https://www.npmjs.com/package/@ckeditor/ckeditor5-adapter-ckfinder/v/48.4.0): v48.3.1 => v48.4.0
* [@ckeditor/ckeditor5-alignment](https://www.npmjs.com/package/@ckeditor/ckeditor5-alignment/v/48.4.0): v48.3.1 => v48.4.0
* [@ckeditor/ckeditor5-autoformat](https://www.npmjs.com/package/@ckeditor/ckeditor5-autoformat/v/48.4.0): v48.3.1 => v48.4.0
* [@ckeditor/ckeditor5-autosave](https://www.npmjs.com/package/@ckeditor/ckeditor5-autosave/v/48.4.0): v48.3.1 => v48.4.0
* [@ckeditor/ckeditor5-basic-styles](https://www.npmjs.com/package/@ckeditor/ckeditor5-basic-styles/v/48.4.0): v48.3.1 => v48.4.0
* [@ckeditor/ckeditor5-block-quote](https://www.npmjs.com/package/@ckeditor/ckeditor5-block-quote/v/48.4.0): v48.3.1 => v48.4.0
* [@ckeditor/ckeditor5-bookmark](https://www.npmjs.com/package/@ckeditor/ckeditor5-bookmark/v/48.4.0): v48.3.1 => v48.4.0
* [@ckeditor/ckeditor5-case-change](https://www.npmjs.com/package/@ckeditor/ckeditor5-case-change/v/48.4.0): v48.3.1 => v48.4.0
* [@ckeditor/ckeditor5-ckbox](https://www.npmjs.com/package/@ckeditor/ckeditor5-ckbox/v/48.4.0): v48.3.1 => v48.4.0
* [@ckeditor/ckeditor5-ckfinder](https://www.npmjs.com/package/@ckeditor/ckeditor5-ckfinder/v/48.4.0): v48.3.1 => v48.4.0
* [@ckeditor/ckeditor5-clipboard](https://www.npmjs.com/package/@ckeditor/ckeditor5-clipboard/v/48.4.0): v48.3.1 => v48.4.0
* [@ckeditor/ckeditor5-cloud-services](https://www.npmjs.com/package/@ckeditor/ckeditor5-cloud-services/v/48.4.0): v48.3.1 => v48.4.0
* [@ckeditor/ckeditor5-code-block](https://www.npmjs.com/package/@ckeditor/ckeditor5-code-block/v/48.4.0): v48.3.1 => v48.4.0
* [@ckeditor/ckeditor5-comments](https://www.npmjs.com/package/@ckeditor/ckeditor5-comments/v/48.4.0): v48.3.1 => v48.4.0
* [@ckeditor/ckeditor5-core](https://www.npmjs.com/package/@ckeditor/ckeditor5-core/v/48.4.0): v48.3.1 => v48.4.0
* [@ckeditor/ckeditor5-document-outline](https://www.npmjs.com/package/@ckeditor/ckeditor5-document-outline/v/48.4.0): v48.3.1 => v48.4.0
* [@ckeditor/ckeditor5-easy-image](https://www.npmjs.com/package/@ckeditor/ckeditor5-easy-image/v/48.4.0): v48.3.1 => v48.4.0
* [@ckeditor/ckeditor5-editor-balloon](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-balloon/v/48.4.0): v48.3.1 => v48.4.0
* [@ckeditor/ckeditor5-editor-classic](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-classic/v/48.4.0): v48.3.1 => v48.4.0
* [@ckeditor/ckeditor5-editor-decoupled](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-decoupled/v/48.4.0): v48.3.1 => v48.4.0
* [@ckeditor/ckeditor5-editor-inline](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-inline/v/48.4.0): v48.3.1 => v48.4.0
* [@ckeditor/ckeditor5-editor-multi-root](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-multi-root/v/48.4.0): v48.3.1 => v48.4.0
* [@ckeditor/ckeditor5-email](https://www.npmjs.com/package/@ckeditor/ckeditor5-email/v/48.4.0): v48.3.1 => v48.4.0
* [@ckeditor/ckeditor5-emoji](https://www.npmjs.com/package/@ckeditor/ckeditor5-emoji/v/48.4.0): v48.3.1 => v48.4.0
* [@ckeditor/ckeditor5-engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine/v/48.4.0): v48.3.1 => v48.4.0
* [@ckeditor/ckeditor5-enter](https://www.npmjs.com/package/@ckeditor/ckeditor5-enter/v/48.4.0): v48.3.1 => v48.4.0
* [@ckeditor/ckeditor5-essentials](https://www.npmjs.com/package/@ckeditor/ckeditor5-essentials/v/48.4.0): v48.3.1 => v48.4.0
* [@ckeditor/ckeditor5-export-inline-styles](https://www.npmjs.com/package/@ckeditor/ckeditor5-export-inline-styles/v/48.4.0): v48.3.1 => v48.4.0
* [@ckeditor/ckeditor5-export-pdf](https://www.npmjs.com/package/@ckeditor/ckeditor5-export-pdf/v/48.4.0): v48.3.1 => v48.4.0
* [@ckeditor/ckeditor5-export-word](https://www.npmjs.com/package/@ckeditor/ckeditor5-export-word/v/48.4.0): v48.3.1 => v48.4.0
* [@ckeditor/ckeditor5-find-and-replace](https://www.npmjs.com/package/@ckeditor/ckeditor5-find-and-replace/v/48.4.0): v48.3.1 => v48.4.0
* [@ckeditor/ckeditor5-font](https://www.npmjs.com/package/@ckeditor/ckeditor5-font/v/48.4.0): v48.3.1 => v48.4.0
* [@ckeditor/ckeditor5-footnotes](https://www.npmjs.com/package/@ckeditor/ckeditor5-footnotes/v/48.4.0): v48.3.1 => v48.4.0
* [@ckeditor/ckeditor5-format-painter](https://www.npmjs.com/package/@ckeditor/ckeditor5-format-painter/v/48.4.0): v48.3.1 => v48.4.0
* [@ckeditor/ckeditor5-fullscreen](https://www.npmjs.com/package/@ckeditor/ckeditor5-fullscreen/v/48.4.0): v48.3.1 => v48.4.0
* [@ckeditor/ckeditor5-heading](https://www.npmjs.com/package/@ckeditor/ckeditor5-heading/v/48.4.0): v48.3.1 => v48.4.0
* [@ckeditor/ckeditor5-highlight](https://www.npmjs.com/package/@ckeditor/ckeditor5-highlight/v/48.4.0): v48.3.1 => v48.4.0
* [@ckeditor/ckeditor5-horizontal-line](https://www.npmjs.com/package/@ckeditor/ckeditor5-horizontal-line/v/48.4.0): v48.3.1 => v48.4.0
* [@ckeditor/ckeditor5-html-embed](https://www.npmjs.com/package/@ckeditor/ckeditor5-html-embed/v/48.4.0): v48.3.1 => v48.4.0
* [@ckeditor/ckeditor5-html-support](https://www.npmjs.com/package/@ckeditor/ckeditor5-html-support/v/48.4.0): v48.3.1 => v48.4.0
* [@ckeditor/ckeditor5-icons](https://www.npmjs.com/package/@ckeditor/ckeditor5-icons/v/48.4.0): v48.3.1 => v48.4.0
* [@ckeditor/ckeditor5-image](https://www.npmjs.com/package/@ckeditor/ckeditor5-image/v/48.4.0): v48.3.1 => v48.4.0
* [@ckeditor/ckeditor5-import-word](https://www.npmjs.com/package/@ckeditor/ckeditor5-import-word/v/48.4.0): v48.3.1 => v48.4.0
* [@ckeditor/ckeditor5-indent](https://www.npmjs.com/package/@ckeditor/ckeditor5-indent/v/48.4.0): v48.3.1 => v48.4.0
* [@ckeditor/ckeditor5-language](https://www.npmjs.com/package/@ckeditor/ckeditor5-language/v/48.4.0): v48.3.1 => v48.4.0
* [@ckeditor/ckeditor5-line-height](https://www.npmjs.com/package/@ckeditor/ckeditor5-line-height/v/48.4.0): v48.3.1 => v48.4.0
* [@ckeditor/ckeditor5-list](https://www.npmjs.com/package/@ckeditor/ckeditor5-list/v/48.4.0): v48.3.1 => v48.4.0
* [@ckeditor/ckeditor5-list-multi-level](https://www.npmjs.com/package/@ckeditor/ckeditor5-list-multi-level/v/48.4.0): v48.3.1 => v48.4.0
* [@ckeditor/ckeditor5-markdown-gfm](https://www.npmjs.com/package/@ckeditor/ckeditor5-markdown-gfm/v/48.4.0): v48.3.1 => v48.4.0
* [@ckeditor/ckeditor5-media-embed](https://www.npmjs.com/package/@ckeditor/ckeditor5-media-embed/v/48.4.0): v48.3.1 => v48.4.0
* [@ckeditor/ckeditor5-mention](https://www.npmjs.com/package/@ckeditor/ckeditor5-mention/v/48.4.0): v48.3.1 => v48.4.0
* [@ckeditor/ckeditor5-merge-fields](https://www.npmjs.com/package/@ckeditor/ckeditor5-merge-fields/v/48.4.0): v48.3.1 => v48.4.0
* [@ckeditor/ckeditor5-minimap](https://www.npmjs.com/package/@ckeditor/ckeditor5-minimap/v/48.4.0): v48.3.1 => v48.4.0
* [@ckeditor/ckeditor5-operations-compressor](https://www.npmjs.com/package/@ckeditor/ckeditor5-operations-compressor/v/48.4.0): v48.3.1 => v48.4.0
* [@ckeditor/ckeditor5-page-break](https://www.npmjs.com/package/@ckeditor/ckeditor5-page-break/v/48.4.0): v48.3.1 => v48.4.0
* [@ckeditor/ckeditor5-pagination](https://www.npmjs.com/package/@ckeditor/ckeditor5-pagination/v/48.4.0): v48.3.1 => v48.4.0
* [@ckeditor/ckeditor5-paragraph](https://www.npmjs.com/package/@ckeditor/ckeditor5-paragraph/v/48.4.0): v48.3.1 => v48.4.0
* [@ckeditor/ckeditor5-paste-from-office](https://www.npmjs.com/package/@ckeditor/ckeditor5-paste-from-office/v/48.4.0): v48.3.1 => v48.4.0
* [@ckeditor/ckeditor5-paste-from-office-enhanced](https://www.npmjs.com/package/@ckeditor/ckeditor5-paste-from-office-enhanced/v/48.4.0): v48.3.1 => v48.4.0
* [@ckeditor/ckeditor5-real-time-collaboration](https://www.npmjs.com/package/@ckeditor/ckeditor5-real-time-collaboration/v/48.4.0): v48.3.1 => v48.4.0
* [@ckeditor/ckeditor5-remove-format](https://www.npmjs.com/package/@ckeditor/ckeditor5-remove-format/v/48.4.0): v48.3.1 => v48.4.0
* [@ckeditor/ckeditor5-restricted-editing](https://www.npmjs.com/package/@ckeditor/ckeditor5-restricted-editing/v/48.4.0): v48.3.1 => v48.4.0
* [@ckeditor/ckeditor5-revision-history](https://www.npmjs.com/package/@ckeditor/ckeditor5-revision-history/v/48.4.0): v48.3.1 => v48.4.0
* [@ckeditor/ckeditor5-select-all](https://www.npmjs.com/package/@ckeditor/ckeditor5-select-all/v/48.4.0): v48.3.1 => v48.4.0
* [@ckeditor/ckeditor5-show-blocks](https://www.npmjs.com/package/@ckeditor/ckeditor5-show-blocks/v/48.4.0): v48.3.1 => v48.4.0
* [@ckeditor/ckeditor5-slash-command](https://www.npmjs.com/package/@ckeditor/ckeditor5-slash-command/v/48.4.0): v48.3.1 => v48.4.0
* [@ckeditor/ckeditor5-source-editing](https://www.npmjs.com/package/@ckeditor/ckeditor5-source-editing/v/48.4.0): v48.3.1 => v48.4.0
* [@ckeditor/ckeditor5-source-editing-enhanced](https://www.npmjs.com/package/@ckeditor/ckeditor5-source-editing-enhanced/v/48.4.0): v48.3.1 => v48.4.0
* [@ckeditor/ckeditor5-special-characters](https://www.npmjs.com/package/@ckeditor/ckeditor5-special-characters/v/48.4.0): v48.3.1 => v48.4.0
* [@ckeditor/ckeditor5-style](https://www.npmjs.com/package/@ckeditor/ckeditor5-style/v/48.4.0): v48.3.1 => v48.4.0
* [@ckeditor/ckeditor5-template](https://www.npmjs.com/package/@ckeditor/ckeditor5-template/v/48.4.0): v48.3.1 => v48.4.0
* [@ckeditor/ckeditor5-typing](https://www.npmjs.com/package/@ckeditor/ckeditor5-typing/v/48.4.0): v48.3.1 => v48.4.0
* [@ckeditor/ckeditor5-ui](https://www.npmjs.com/package/@ckeditor/ckeditor5-ui/v/48.4.0): v48.3.1 => v48.4.0
* [@ckeditor/ckeditor5-undo](https://www.npmjs.com/package/@ckeditor/ckeditor5-undo/v/48.4.0): v48.3.1 => v48.4.0
* [@ckeditor/ckeditor5-upload](https://www.npmjs.com/package/@ckeditor/ckeditor5-upload/v/48.4.0): v48.3.1 => v48.4.0
* [@ckeditor/ckeditor5-uploadcare](https://www.npmjs.com/package/@ckeditor/ckeditor5-uploadcare/v/48.4.0): v48.3.1 => v48.4.0
* [@ckeditor/ckeditor5-utils](https://www.npmjs.com/package/@ckeditor/ckeditor5-utils/v/48.4.0): v48.3.1 => v48.4.0
* [@ckeditor/ckeditor5-watchdog](https://www.npmjs.com/package/@ckeditor/ckeditor5-watchdog/v/48.4.0): v48.3.1 => v48.4.0
* [@ckeditor/ckeditor5-word-count](https://www.npmjs.com/package/@ckeditor/ckeditor5-word-count/v/48.4.0): v48.3.1 => v48.4.0
* [ckeditor5](https://www.npmjs.com/package/ckeditor5/v/48.4.0): v48.3.1 => v48.4.0
* [ckeditor5-premium-features](https://www.npmjs.com/package/ckeditor5-premium-features/v/48.4.0): v48.3.1 => v48.4.0
</details>


## [48.3.1](https://github.com/ckeditor/ckeditor5/compare/v48.3.0...v48.3.1) (July 14, 2026)

We are happy to announce the release of CKEditor 5 v48.3.1.

### Release highlights

The release addresses vulnerabilities identified in the [`protobuf.js`](https://www.npmjs.com/package/protobufjs) package, used within our [**`@ckeditor/ckeditor5-operations-compressor`**](https://www.npmjs.com/package/@ckeditor/ckeditor5-operations-compressor) package for real-time collaboration.

Our analysis confirms that vulnerabilities **do not affect** CKEditor 5.

This release primarily aims to ensure that our customers using real-time collaboration features do not encounter unnecessary security alerts from their scanning tools. We are committed to maintaining the highest security standards, and this update reflects our ongoing efforts to safeguard user environments proactively.

### Released packages

Check out the [Versioning policy](https://ckeditor.com/docs/ckeditor5/latest/framework/guides/support/versioning-policy.html) guide for more information.

<details>
<summary>Released packages (summary)</summary>

Other releases:

* [@ckeditor/ckeditor5-adapter-ckfinder](https://www.npmjs.com/package/@ckeditor/ckeditor5-adapter-ckfinder/v/48.3.1): v48.3.0 => v48.3.1
* [@ckeditor/ckeditor5-ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai/v/48.3.1): v48.3.0 => v48.3.1
* [@ckeditor/ckeditor5-alignment](https://www.npmjs.com/package/@ckeditor/ckeditor5-alignment/v/48.3.1): v48.3.0 => v48.3.1
* [@ckeditor/ckeditor5-autoformat](https://www.npmjs.com/package/@ckeditor/ckeditor5-autoformat/v/48.3.1): v48.3.0 => v48.3.1
* [@ckeditor/ckeditor5-autosave](https://www.npmjs.com/package/@ckeditor/ckeditor5-autosave/v/48.3.1): v48.3.0 => v48.3.1
* [@ckeditor/ckeditor5-basic-styles](https://www.npmjs.com/package/@ckeditor/ckeditor5-basic-styles/v/48.3.1): v48.3.0 => v48.3.1
* [@ckeditor/ckeditor5-block-quote](https://www.npmjs.com/package/@ckeditor/ckeditor5-block-quote/v/48.3.1): v48.3.0 => v48.3.1
* [@ckeditor/ckeditor5-bookmark](https://www.npmjs.com/package/@ckeditor/ckeditor5-bookmark/v/48.3.1): v48.3.0 => v48.3.1
* [@ckeditor/ckeditor5-case-change](https://www.npmjs.com/package/@ckeditor/ckeditor5-case-change/v/48.3.1): v48.3.0 => v48.3.1
* [@ckeditor/ckeditor5-ckbox](https://www.npmjs.com/package/@ckeditor/ckeditor5-ckbox/v/48.3.1): v48.3.0 => v48.3.1
* [@ckeditor/ckeditor5-ckfinder](https://www.npmjs.com/package/@ckeditor/ckeditor5-ckfinder/v/48.3.1): v48.3.0 => v48.3.1
* [@ckeditor/ckeditor5-clipboard](https://www.npmjs.com/package/@ckeditor/ckeditor5-clipboard/v/48.3.1): v48.3.0 => v48.3.1
* [@ckeditor/ckeditor5-cloud-services](https://www.npmjs.com/package/@ckeditor/ckeditor5-cloud-services/v/48.3.1): v48.3.0 => v48.3.1
* [@ckeditor/ckeditor5-code-block](https://www.npmjs.com/package/@ckeditor/ckeditor5-code-block/v/48.3.1): v48.3.0 => v48.3.1
* [@ckeditor/ckeditor5-collaboration-core](https://www.npmjs.com/package/@ckeditor/ckeditor5-collaboration-core/v/48.3.1): v48.3.0 => v48.3.1
* [@ckeditor/ckeditor5-comments](https://www.npmjs.com/package/@ckeditor/ckeditor5-comments/v/48.3.1): v48.3.0 => v48.3.1
* [@ckeditor/ckeditor5-core](https://www.npmjs.com/package/@ckeditor/ckeditor5-core/v/48.3.1): v48.3.0 => v48.3.1
* [@ckeditor/ckeditor5-document-outline](https://www.npmjs.com/package/@ckeditor/ckeditor5-document-outline/v/48.3.1): v48.3.0 => v48.3.1
* [@ckeditor/ckeditor5-easy-image](https://www.npmjs.com/package/@ckeditor/ckeditor5-easy-image/v/48.3.1): v48.3.0 => v48.3.1
* [@ckeditor/ckeditor5-editor-balloon](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-balloon/v/48.3.1): v48.3.0 => v48.3.1
* [@ckeditor/ckeditor5-editor-classic](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-classic/v/48.3.1): v48.3.0 => v48.3.1
* [@ckeditor/ckeditor5-editor-decoupled](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-decoupled/v/48.3.1): v48.3.0 => v48.3.1
* [@ckeditor/ckeditor5-editor-inline](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-inline/v/48.3.1): v48.3.0 => v48.3.1
* [@ckeditor/ckeditor5-editor-multi-root](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-multi-root/v/48.3.1): v48.3.0 => v48.3.1
* [@ckeditor/ckeditor5-email](https://www.npmjs.com/package/@ckeditor/ckeditor5-email/v/48.3.1): v48.3.0 => v48.3.1
* [@ckeditor/ckeditor5-emoji](https://www.npmjs.com/package/@ckeditor/ckeditor5-emoji/v/48.3.1): v48.3.0 => v48.3.1
* [@ckeditor/ckeditor5-engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine/v/48.3.1): v48.3.0 => v48.3.1
* [@ckeditor/ckeditor5-enter](https://www.npmjs.com/package/@ckeditor/ckeditor5-enter/v/48.3.1): v48.3.0 => v48.3.1
* [@ckeditor/ckeditor5-essentials](https://www.npmjs.com/package/@ckeditor/ckeditor5-essentials/v/48.3.1): v48.3.0 => v48.3.1
* [@ckeditor/ckeditor5-export-inline-styles](https://www.npmjs.com/package/@ckeditor/ckeditor5-export-inline-styles/v/48.3.1): v48.3.0 => v48.3.1
* [@ckeditor/ckeditor5-export-pdf](https://www.npmjs.com/package/@ckeditor/ckeditor5-export-pdf/v/48.3.1): v48.3.0 => v48.3.1
* [@ckeditor/ckeditor5-export-word](https://www.npmjs.com/package/@ckeditor/ckeditor5-export-word/v/48.3.1): v48.3.0 => v48.3.1
* [@ckeditor/ckeditor5-find-and-replace](https://www.npmjs.com/package/@ckeditor/ckeditor5-find-and-replace/v/48.3.1): v48.3.0 => v48.3.1
* [@ckeditor/ckeditor5-font](https://www.npmjs.com/package/@ckeditor/ckeditor5-font/v/48.3.1): v48.3.0 => v48.3.1
* [@ckeditor/ckeditor5-footnotes](https://www.npmjs.com/package/@ckeditor/ckeditor5-footnotes/v/48.3.1): v48.3.0 => v48.3.1
* [@ckeditor/ckeditor5-format-painter](https://www.npmjs.com/package/@ckeditor/ckeditor5-format-painter/v/48.3.1): v48.3.0 => v48.3.1
* [@ckeditor/ckeditor5-fullscreen](https://www.npmjs.com/package/@ckeditor/ckeditor5-fullscreen/v/48.3.1): v48.3.0 => v48.3.1
* [@ckeditor/ckeditor5-heading](https://www.npmjs.com/package/@ckeditor/ckeditor5-heading/v/48.3.1): v48.3.0 => v48.3.1
* [@ckeditor/ckeditor5-highlight](https://www.npmjs.com/package/@ckeditor/ckeditor5-highlight/v/48.3.1): v48.3.0 => v48.3.1
* [@ckeditor/ckeditor5-horizontal-line](https://www.npmjs.com/package/@ckeditor/ckeditor5-horizontal-line/v/48.3.1): v48.3.0 => v48.3.1
* [@ckeditor/ckeditor5-html-embed](https://www.npmjs.com/package/@ckeditor/ckeditor5-html-embed/v/48.3.1): v48.3.0 => v48.3.1
* [@ckeditor/ckeditor5-html-support](https://www.npmjs.com/package/@ckeditor/ckeditor5-html-support/v/48.3.1): v48.3.0 => v48.3.1
* [@ckeditor/ckeditor5-icons](https://www.npmjs.com/package/@ckeditor/ckeditor5-icons/v/48.3.1): v48.3.0 => v48.3.1
* [@ckeditor/ckeditor5-image](https://www.npmjs.com/package/@ckeditor/ckeditor5-image/v/48.3.1): v48.3.0 => v48.3.1
* [@ckeditor/ckeditor5-import-word](https://www.npmjs.com/package/@ckeditor/ckeditor5-import-word/v/48.3.1): v48.3.0 => v48.3.1
* [@ckeditor/ckeditor5-indent](https://www.npmjs.com/package/@ckeditor/ckeditor5-indent/v/48.3.1): v48.3.0 => v48.3.1
* [@ckeditor/ckeditor5-language](https://www.npmjs.com/package/@ckeditor/ckeditor5-language/v/48.3.1): v48.3.0 => v48.3.1
* [@ckeditor/ckeditor5-line-height](https://www.npmjs.com/package/@ckeditor/ckeditor5-line-height/v/48.3.1): v48.3.0 => v48.3.1
* [@ckeditor/ckeditor5-link](https://www.npmjs.com/package/@ckeditor/ckeditor5-link/v/48.3.1): v48.3.0 => v48.3.1
* [@ckeditor/ckeditor5-list](https://www.npmjs.com/package/@ckeditor/ckeditor5-list/v/48.3.1): v48.3.0 => v48.3.1
* [@ckeditor/ckeditor5-list-multi-level](https://www.npmjs.com/package/@ckeditor/ckeditor5-list-multi-level/v/48.3.1): v48.3.0 => v48.3.1
* [@ckeditor/ckeditor5-markdown-gfm](https://www.npmjs.com/package/@ckeditor/ckeditor5-markdown-gfm/v/48.3.1): v48.3.0 => v48.3.1
* [@ckeditor/ckeditor5-media-embed](https://www.npmjs.com/package/@ckeditor/ckeditor5-media-embed/v/48.3.1): v48.3.0 => v48.3.1
* [@ckeditor/ckeditor5-mention](https://www.npmjs.com/package/@ckeditor/ckeditor5-mention/v/48.3.1): v48.3.0 => v48.3.1
* [@ckeditor/ckeditor5-merge-fields](https://www.npmjs.com/package/@ckeditor/ckeditor5-merge-fields/v/48.3.1): v48.3.0 => v48.3.1
* [@ckeditor/ckeditor5-minimap](https://www.npmjs.com/package/@ckeditor/ckeditor5-minimap/v/48.3.1): v48.3.0 => v48.3.1
* [@ckeditor/ckeditor5-operations-compressor](https://www.npmjs.com/package/@ckeditor/ckeditor5-operations-compressor/v/48.3.1): v48.3.0 => v48.3.1
* [@ckeditor/ckeditor5-page-break](https://www.npmjs.com/package/@ckeditor/ckeditor5-page-break/v/48.3.1): v48.3.0 => v48.3.1
* [@ckeditor/ckeditor5-pagination](https://www.npmjs.com/package/@ckeditor/ckeditor5-pagination/v/48.3.1): v48.3.0 => v48.3.1
* [@ckeditor/ckeditor5-paragraph](https://www.npmjs.com/package/@ckeditor/ckeditor5-paragraph/v/48.3.1): v48.3.0 => v48.3.1
* [@ckeditor/ckeditor5-paste-from-office](https://www.npmjs.com/package/@ckeditor/ckeditor5-paste-from-office/v/48.3.1): v48.3.0 => v48.3.1
* [@ckeditor/ckeditor5-paste-from-office-enhanced](https://www.npmjs.com/package/@ckeditor/ckeditor5-paste-from-office-enhanced/v/48.3.1): v48.3.0 => v48.3.1
* [@ckeditor/ckeditor5-real-time-collaboration](https://www.npmjs.com/package/@ckeditor/ckeditor5-real-time-collaboration/v/48.3.1): v48.3.0 => v48.3.1
* [@ckeditor/ckeditor5-remove-format](https://www.npmjs.com/package/@ckeditor/ckeditor5-remove-format/v/48.3.1): v48.3.0 => v48.3.1
* [@ckeditor/ckeditor5-restricted-editing](https://www.npmjs.com/package/@ckeditor/ckeditor5-restricted-editing/v/48.3.1): v48.3.0 => v48.3.1
* [@ckeditor/ckeditor5-revision-history](https://www.npmjs.com/package/@ckeditor/ckeditor5-revision-history/v/48.3.1): v48.3.0 => v48.3.1
* [@ckeditor/ckeditor5-select-all](https://www.npmjs.com/package/@ckeditor/ckeditor5-select-all/v/48.3.1): v48.3.0 => v48.3.1
* [@ckeditor/ckeditor5-show-blocks](https://www.npmjs.com/package/@ckeditor/ckeditor5-show-blocks/v/48.3.1): v48.3.0 => v48.3.1
* [@ckeditor/ckeditor5-slash-command](https://www.npmjs.com/package/@ckeditor/ckeditor5-slash-command/v/48.3.1): v48.3.0 => v48.3.1
* [@ckeditor/ckeditor5-source-editing](https://www.npmjs.com/package/@ckeditor/ckeditor5-source-editing/v/48.3.1): v48.3.0 => v48.3.1
* [@ckeditor/ckeditor5-source-editing-enhanced](https://www.npmjs.com/package/@ckeditor/ckeditor5-source-editing-enhanced/v/48.3.1): v48.3.0 => v48.3.1
* [@ckeditor/ckeditor5-special-characters](https://www.npmjs.com/package/@ckeditor/ckeditor5-special-characters/v/48.3.1): v48.3.0 => v48.3.1
* [@ckeditor/ckeditor5-style](https://www.npmjs.com/package/@ckeditor/ckeditor5-style/v/48.3.1): v48.3.0 => v48.3.1
* [@ckeditor/ckeditor5-table](https://www.npmjs.com/package/@ckeditor/ckeditor5-table/v/48.3.1): v48.3.0 => v48.3.1
* [@ckeditor/ckeditor5-template](https://www.npmjs.com/package/@ckeditor/ckeditor5-template/v/48.3.1): v48.3.0 => v48.3.1
* [@ckeditor/ckeditor5-track-changes](https://www.npmjs.com/package/@ckeditor/ckeditor5-track-changes/v/48.3.1): v48.3.0 => v48.3.1
* [@ckeditor/ckeditor5-typing](https://www.npmjs.com/package/@ckeditor/ckeditor5-typing/v/48.3.1): v48.3.0 => v48.3.1
* [@ckeditor/ckeditor5-ui](https://www.npmjs.com/package/@ckeditor/ckeditor5-ui/v/48.3.1): v48.3.0 => v48.3.1
* [@ckeditor/ckeditor5-undo](https://www.npmjs.com/package/@ckeditor/ckeditor5-undo/v/48.3.1): v48.3.0 => v48.3.1
* [@ckeditor/ckeditor5-upload](https://www.npmjs.com/package/@ckeditor/ckeditor5-upload/v/48.3.1): v48.3.0 => v48.3.1
* [@ckeditor/ckeditor5-uploadcare](https://www.npmjs.com/package/@ckeditor/ckeditor5-uploadcare/v/48.3.1): v48.3.0 => v48.3.1
* [@ckeditor/ckeditor5-utils](https://www.npmjs.com/package/@ckeditor/ckeditor5-utils/v/48.3.1): v48.3.0 => v48.3.1
* [@ckeditor/ckeditor5-watchdog](https://www.npmjs.com/package/@ckeditor/ckeditor5-watchdog/v/48.3.1): v48.3.0 => v48.3.1
* [@ckeditor/ckeditor5-widget](https://www.npmjs.com/package/@ckeditor/ckeditor5-widget/v/48.3.1): v48.3.0 => v48.3.1
* [@ckeditor/ckeditor5-word-count](https://www.npmjs.com/package/@ckeditor/ckeditor5-word-count/v/48.3.1): v48.3.0 => v48.3.1
* [ckeditor5](https://www.npmjs.com/package/ckeditor5/v/48.3.1): v48.3.0 => v48.3.1
* [ckeditor5-premium-features](https://www.npmjs.com/package/ckeditor5-premium-features/v/48.3.1): v48.3.0 => v48.3.1
</details>

---

To see all releases, visit the [release page](https://github.com/ckeditor/ckeditor5/releases).
