Changelog
=========

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


## [45.2.0](https://github.com/ckeditor/ckeditor5/compare/v45.1.0...v45.2.0) (June 4, 2025)

We are happy to announce the release of CKEditor 5 v45.2.0.

### Release highlights

CKEditor 5 v45.2.0 offers the following improvements and bug fixes.

* We fixed the copy-paste scenario in the read-only mode.
* Tables pasted from Office, especially with borderless layouts, should preserve styling in the editor similar to the ones in the source file.
* Improved the adoption of the fullscreen feature on smaller screens and includes subtle visual tweaks.

### MINOR BREAKING CHANGES [ℹ️](https://ckeditor.com/docs/ckeditor5/latest/framework/guides/support/versioning-policy.html#major-and-minor-breaking-changes)

* **[source-editing](https://www.npmjs.com/package/@ckeditor/ckeditor5-source-editing)**: The `formatHtml()` helper function is extracted to the `@ckeditor/ckeditor5-utils` package. See [#18480](https://github.com/ckeditor/ckeditor5/issues/18480).

### Features

* **[fullscreen](https://www.npmjs.com/package/@ckeditor/ckeditor5-fullscreen)**: Empty sidebars will no longer lock empty space around the editable in fullscreen mode. Closes [#18474](https://github.com/ckeditor/ckeditor5/issues/18474). ([commit](https://github.com/ckeditor/ckeditor5/commit/9db81ae27a16562b7b67e41cb177d1d9c755c6b7))

### Bug fixes

* **[engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine)**: The editor should not crash while using Mac text replacement in the Track changes mode. ([commit](https://github.com/ckeditor/ckeditor5/commit/42ea203c753519cb2b80d41b78e55f08f7700a31))
* **[engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine)**: Copying content in read-only mode should use the current document selection. Closes [#18514](https://github.com/ckeditor/ckeditor5/issues/18514). ([commit](https://github.com/ckeditor/ckeditor5/commit/39c7c09cc0adf20110cce5da79ed62aa0a4e2d7c))
* **[engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine)**: The editor should not crash after clearing content with a widget selected. Closes [#18123](https://github.com/ckeditor/ckeditor5/issues/18123), [#18458](https://github.com/ckeditor/ckeditor5/issues/18458). ([commit](https://github.com/ckeditor/ckeditor5/commit/deb0921414531002f176614c6693cead37c9c10d))
* **[pagination](https://www.npmjs.com/package/@ckeditor/ckeditor5-pagination)**: Chrome no longer incorrectly pushes content to the next page when rendering documents consisting mainly of paragraphs with soft line breaks. Closes [#7316](https://github.com/cksource/ckeditor5-commercial/issues/7316).
* **[paste-from-office](https://www.npmjs.com/package/@ckeditor/ckeditor5-paste-from-office)**: Unset table borders no longer fall back to default table styles. Closes [#16931](https://github.com/ckeditor/ckeditor5/issues/16931), [#10655](https://github.com/ckeditor/ckeditor5/issues/10655), [#18540](https://github.com/ckeditor/ckeditor5/issues/18540). ([commit](https://github.com/ckeditor/ckeditor5/commit/c378aefd8c6fb6462a2d36383fec9a718fd9d696))
* **[real-time-collaboration](https://www.npmjs.com/package/@ckeditor/ckeditor5-real-time-collaboration)**: Fixed a crash that occurred when a user selected table cells containing only non-textual elements, such as images.
* **[revision-history](https://www.npmjs.com/package/@ckeditor/ckeditor5-revision-history)**: Fixed a crash in the revision history viewer that occurred when navigating revision changes, if the previewed revision was restored by one user but included suggestions originally made by other users.
* **[source-editing](https://www.npmjs.com/package/@ckeditor/ckeditor5-source-editing)**: Single line pre-block should not cause loss of indentation on later lines in source mode. Closes [#18360](https://github.com/ckeditor/ckeditor5/issues/18360). ([commit](https://github.com/ckeditor/ckeditor5/commit/1f52f5309200b170c6d2df981c5903c41735e0da))
* **[source-editing](https://www.npmjs.com/package/@ckeditor/ckeditor5-source-editing)**: Empty lines in code blocks should not be removed in source editing mode. See [#18480](https://github.com/ckeditor/ckeditor5/issues/18480). ([commit](https://github.com/ckeditor/ckeditor5/commit/1f52f5309200b170c6d2df981c5903c41735e0da))
* **[source-editing-enhanced](https://www.npmjs.com/package/@ckeditor/ckeditor5-source-editing-enhanced)**: Single line pre-block should not cause loss of indentation on later lines in source mode. Closes [#18360](https://github.com/ckeditor/ckeditor5/issues/18360). ([commit](https://github.com/ckeditor/ckeditor5/commit/1f52f5309200b170c6d2df981c5903c41735e0da))
* **[source-editing-enhanced](https://www.npmjs.com/package/@ckeditor/ckeditor5-source-editing-enhanced)**: Empty lines in code blocks should not be removed in source editing mode. See [#18480](https://github.com/ckeditor/ckeditor5/issues/18480). ([commit](https://github.com/ckeditor/ckeditor5/commit/1f52f5309200b170c6d2df981c5903c41735e0da))
* **[table](https://www.npmjs.com/package/@ckeditor/ckeditor5-table)**: Should apply the proper `[width]` attribute when it is used both on `<table>` and `<figure>` elements. Closes [#18469](https://github.com/ckeditor/ckeditor5/issues/18469). ([commit](https://github.com/ckeditor/ckeditor5/commit/fb4d3a88734112584442748185956a29053b48c0))
* **[track-changes](https://www.npmjs.com/package/@ckeditor/ckeditor5-track-changes)**: Fixed crashes that could occur in real-time collaboration when a user splits suggestions rapidly in a short time frame.

### Other changes

* **[paste-from-office](https://www.npmjs.com/package/@ckeditor/ckeditor5-paste-from-office)**: Normalized pasted table length units (dimensions and border widths). ([commit](https://github.com/ckeditor/ckeditor5/commit/c378aefd8c6fb6462a2d36383fec9a718fd9d696))
* The development environment requires Node v22 due to migrating to the latest ESLint (v9) version. See [#18475](https://github.com/ckeditor/ckeditor5/issues/18475). ([commit](https://github.com/ckeditor/ckeditor5/commit/9a2ee77b3048bc94857b9ce8da14650e1cfd580f))

### Released packages

Check out the [Versioning policy](https://ckeditor.com/docs/ckeditor5/latest/framework/guides/support/versioning-policy.html) guide for more information.

<details>
<summary>Released packages (summary)</summary>

Minor releases (contain minor breaking changes):

* [@ckeditor/ckeditor5-source-editing](https://www.npmjs.com/package/@ckeditor/ckeditor5-source-editing/v/45.2.0): v45.1.0 => v45.2.0

Releases containing new features:

* [@ckeditor/ckeditor5-fullscreen](https://www.npmjs.com/package/@ckeditor/ckeditor5-fullscreen/v/45.2.0): v45.1.0 => v45.2.0

Other releases:

* [@ckeditor/ckeditor5-adapter-ckfinder](https://www.npmjs.com/package/@ckeditor/ckeditor5-adapter-ckfinder/v/45.2.0): v45.1.0 => v45.2.0
* [@ckeditor/ckeditor5-ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai/v/45.2.0): v45.1.0 => v45.2.0
* [@ckeditor/ckeditor5-alignment](https://www.npmjs.com/package/@ckeditor/ckeditor5-alignment/v/45.2.0): v45.1.0 => v45.2.0
* [@ckeditor/ckeditor5-autoformat](https://www.npmjs.com/package/@ckeditor/ckeditor5-autoformat/v/45.2.0): v45.1.0 => v45.2.0
* [@ckeditor/ckeditor5-autosave](https://www.npmjs.com/package/@ckeditor/ckeditor5-autosave/v/45.2.0): v45.1.0 => v45.2.0
* [@ckeditor/ckeditor5-basic-styles](https://www.npmjs.com/package/@ckeditor/ckeditor5-basic-styles/v/45.2.0): v45.1.0 => v45.2.0
* [@ckeditor/ckeditor5-block-quote](https://www.npmjs.com/package/@ckeditor/ckeditor5-block-quote/v/45.2.0): v45.1.0 => v45.2.0
* [@ckeditor/ckeditor5-bookmark](https://www.npmjs.com/package/@ckeditor/ckeditor5-bookmark/v/45.2.0): v45.1.0 => v45.2.0
* [@ckeditor/ckeditor5-case-change](https://www.npmjs.com/package/@ckeditor/ckeditor5-case-change/v/45.2.0): v45.1.0 => v45.2.0
* [@ckeditor/ckeditor5-ckbox](https://www.npmjs.com/package/@ckeditor/ckeditor5-ckbox/v/45.2.0): v45.1.0 => v45.2.0
* [@ckeditor/ckeditor5-ckfinder](https://www.npmjs.com/package/@ckeditor/ckeditor5-ckfinder/v/45.2.0): v45.1.0 => v45.2.0
* [@ckeditor/ckeditor5-clipboard](https://www.npmjs.com/package/@ckeditor/ckeditor5-clipboard/v/45.2.0): v45.1.0 => v45.2.0
* [@ckeditor/ckeditor5-cloud-services](https://www.npmjs.com/package/@ckeditor/ckeditor5-cloud-services/v/45.2.0): v45.1.0 => v45.2.0
* [@ckeditor/ckeditor5-code-block](https://www.npmjs.com/package/@ckeditor/ckeditor5-code-block/v/45.2.0): v45.1.0 => v45.2.0
* [@ckeditor/ckeditor5-collaboration-core](https://www.npmjs.com/package/@ckeditor/ckeditor5-collaboration-core/v/45.2.0): v45.1.0 => v45.2.0
* [@ckeditor/ckeditor5-comments](https://www.npmjs.com/package/@ckeditor/ckeditor5-comments/v/45.2.0): v45.1.0 => v45.2.0
* [@ckeditor/ckeditor5-core](https://www.npmjs.com/package/@ckeditor/ckeditor5-core/v/45.2.0): v45.1.0 => v45.2.0
* [@ckeditor/ckeditor5-document-outline](https://www.npmjs.com/package/@ckeditor/ckeditor5-document-outline/v/45.2.0): v45.1.0 => v45.2.0
* [@ckeditor/ckeditor5-easy-image](https://www.npmjs.com/package/@ckeditor/ckeditor5-easy-image/v/45.2.0): v45.1.0 => v45.2.0
* [@ckeditor/ckeditor5-editor-balloon](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-balloon/v/45.2.0): v45.1.0 => v45.2.0
* [@ckeditor/ckeditor5-editor-classic](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-classic/v/45.2.0): v45.1.0 => v45.2.0
* [@ckeditor/ckeditor5-editor-decoupled](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-decoupled/v/45.2.0): v45.1.0 => v45.2.0
* [@ckeditor/ckeditor5-editor-inline](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-inline/v/45.2.0): v45.1.0 => v45.2.0
* [@ckeditor/ckeditor5-editor-multi-root](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-multi-root/v/45.2.0): v45.1.0 => v45.2.0
* [@ckeditor/ckeditor5-email](https://www.npmjs.com/package/@ckeditor/ckeditor5-email/v/45.2.0): v45.1.0 => v45.2.0
* [@ckeditor/ckeditor5-emoji](https://www.npmjs.com/package/@ckeditor/ckeditor5-emoji/v/45.2.0): v45.1.0 => v45.2.0
* [@ckeditor/ckeditor5-engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine/v/45.2.0): v45.1.0 => v45.2.0
* [@ckeditor/ckeditor5-enter](https://www.npmjs.com/package/@ckeditor/ckeditor5-enter/v/45.2.0): v45.1.0 => v45.2.0
* [@ckeditor/ckeditor5-essentials](https://www.npmjs.com/package/@ckeditor/ckeditor5-essentials/v/45.2.0): v45.1.0 => v45.2.0
* [@ckeditor/ckeditor5-export-inline-styles](https://www.npmjs.com/package/@ckeditor/ckeditor5-export-inline-styles/v/45.2.0): v45.1.0 => v45.2.0
* [@ckeditor/ckeditor5-export-pdf](https://www.npmjs.com/package/@ckeditor/ckeditor5-export-pdf/v/45.2.0): v45.1.0 => v45.2.0
* [@ckeditor/ckeditor5-export-word](https://www.npmjs.com/package/@ckeditor/ckeditor5-export-word/v/45.2.0): v45.1.0 => v45.2.0
* [@ckeditor/ckeditor5-find-and-replace](https://www.npmjs.com/package/@ckeditor/ckeditor5-find-and-replace/v/45.2.0): v45.1.0 => v45.2.0
* [@ckeditor/ckeditor5-font](https://www.npmjs.com/package/@ckeditor/ckeditor5-font/v/45.2.0): v45.1.0 => v45.2.0
* [@ckeditor/ckeditor5-format-painter](https://www.npmjs.com/package/@ckeditor/ckeditor5-format-painter/v/45.2.0): v45.1.0 => v45.2.0
* [@ckeditor/ckeditor5-heading](https://www.npmjs.com/package/@ckeditor/ckeditor5-heading/v/45.2.0): v45.1.0 => v45.2.0
* [@ckeditor/ckeditor5-highlight](https://www.npmjs.com/package/@ckeditor/ckeditor5-highlight/v/45.2.0): v45.1.0 => v45.2.0
* [@ckeditor/ckeditor5-horizontal-line](https://www.npmjs.com/package/@ckeditor/ckeditor5-horizontal-line/v/45.2.0): v45.1.0 => v45.2.0
* [@ckeditor/ckeditor5-html-embed](https://www.npmjs.com/package/@ckeditor/ckeditor5-html-embed/v/45.2.0): v45.1.0 => v45.2.0
* [@ckeditor/ckeditor5-html-support](https://www.npmjs.com/package/@ckeditor/ckeditor5-html-support/v/45.2.0): v45.1.0 => v45.2.0
* [@ckeditor/ckeditor5-icons](https://www.npmjs.com/package/@ckeditor/ckeditor5-icons/v/45.2.0): v45.1.0 => v45.2.0
* [@ckeditor/ckeditor5-image](https://www.npmjs.com/package/@ckeditor/ckeditor5-image/v/45.2.0): v45.1.0 => v45.2.0
* [@ckeditor/ckeditor5-import-word](https://www.npmjs.com/package/@ckeditor/ckeditor5-import-word/v/45.2.0): v45.1.0 => v45.2.0
* [@ckeditor/ckeditor5-indent](https://www.npmjs.com/package/@ckeditor/ckeditor5-indent/v/45.2.0): v45.1.0 => v45.2.0
* [@ckeditor/ckeditor5-language](https://www.npmjs.com/package/@ckeditor/ckeditor5-language/v/45.2.0): v45.1.0 => v45.2.0
* [@ckeditor/ckeditor5-link](https://www.npmjs.com/package/@ckeditor/ckeditor5-link/v/45.2.0): v45.1.0 => v45.2.0
* [@ckeditor/ckeditor5-list](https://www.npmjs.com/package/@ckeditor/ckeditor5-list/v/45.2.0): v45.1.0 => v45.2.0
* [@ckeditor/ckeditor5-list-multi-level](https://www.npmjs.com/package/@ckeditor/ckeditor5-list-multi-level/v/45.2.0): v45.1.0 => v45.2.0
* [@ckeditor/ckeditor5-markdown-gfm](https://www.npmjs.com/package/@ckeditor/ckeditor5-markdown-gfm/v/45.2.0): v45.1.0 => v45.2.0
* [@ckeditor/ckeditor5-media-embed](https://www.npmjs.com/package/@ckeditor/ckeditor5-media-embed/v/45.2.0): v45.1.0 => v45.2.0
* [@ckeditor/ckeditor5-mention](https://www.npmjs.com/package/@ckeditor/ckeditor5-mention/v/45.2.0): v45.1.0 => v45.2.0
* [@ckeditor/ckeditor5-merge-fields](https://www.npmjs.com/package/@ckeditor/ckeditor5-merge-fields/v/45.2.0): v45.1.0 => v45.2.0
* [@ckeditor/ckeditor5-minimap](https://www.npmjs.com/package/@ckeditor/ckeditor5-minimap/v/45.2.0): v45.1.0 => v45.2.0
* [@ckeditor/ckeditor5-operations-compressor](https://www.npmjs.com/package/@ckeditor/ckeditor5-operations-compressor/v/45.2.0): v45.1.0 => v45.2.0
* [@ckeditor/ckeditor5-page-break](https://www.npmjs.com/package/@ckeditor/ckeditor5-page-break/v/45.2.0): v45.1.0 => v45.2.0
* [@ckeditor/ckeditor5-pagination](https://www.npmjs.com/package/@ckeditor/ckeditor5-pagination/v/45.2.0): v45.1.0 => v45.2.0
* [@ckeditor/ckeditor5-paragraph](https://www.npmjs.com/package/@ckeditor/ckeditor5-paragraph/v/45.2.0): v45.1.0 => v45.2.0
* [@ckeditor/ckeditor5-paste-from-office](https://www.npmjs.com/package/@ckeditor/ckeditor5-paste-from-office/v/45.2.0): v45.1.0 => v45.2.0
* [@ckeditor/ckeditor5-paste-from-office-enhanced](https://www.npmjs.com/package/@ckeditor/ckeditor5-paste-from-office-enhanced/v/45.2.0): v45.1.0 => v45.2.0
* [@ckeditor/ckeditor5-real-time-collaboration](https://www.npmjs.com/package/@ckeditor/ckeditor5-real-time-collaboration/v/45.2.0): v45.1.0 => v45.2.0
* [@ckeditor/ckeditor5-remove-format](https://www.npmjs.com/package/@ckeditor/ckeditor5-remove-format/v/45.2.0): v45.1.0 => v45.2.0
* [@ckeditor/ckeditor5-restricted-editing](https://www.npmjs.com/package/@ckeditor/ckeditor5-restricted-editing/v/45.2.0): v45.1.0 => v45.2.0
* [@ckeditor/ckeditor5-revision-history](https://www.npmjs.com/package/@ckeditor/ckeditor5-revision-history/v/45.2.0): v45.1.0 => v45.2.0
* [@ckeditor/ckeditor5-select-all](https://www.npmjs.com/package/@ckeditor/ckeditor5-select-all/v/45.2.0): v45.1.0 => v45.2.0
* [@ckeditor/ckeditor5-show-blocks](https://www.npmjs.com/package/@ckeditor/ckeditor5-show-blocks/v/45.2.0): v45.1.0 => v45.2.0
* [@ckeditor/ckeditor5-slash-command](https://www.npmjs.com/package/@ckeditor/ckeditor5-slash-command/v/45.2.0): v45.1.0 => v45.2.0
* [@ckeditor/ckeditor5-source-editing-enhanced](https://www.npmjs.com/package/@ckeditor/ckeditor5-source-editing-enhanced/v/45.2.0): v45.1.0 => v45.2.0
* [@ckeditor/ckeditor5-special-characters](https://www.npmjs.com/package/@ckeditor/ckeditor5-special-characters/v/45.2.0): v45.1.0 => v45.2.0
* [@ckeditor/ckeditor5-style](https://www.npmjs.com/package/@ckeditor/ckeditor5-style/v/45.2.0): v45.1.0 => v45.2.0
* [@ckeditor/ckeditor5-table](https://www.npmjs.com/package/@ckeditor/ckeditor5-table/v/45.2.0): v45.1.0 => v45.2.0
* [@ckeditor/ckeditor5-template](https://www.npmjs.com/package/@ckeditor/ckeditor5-template/v/45.2.0): v45.1.0 => v45.2.0
* [@ckeditor/ckeditor5-theme-lark](https://www.npmjs.com/package/@ckeditor/ckeditor5-theme-lark/v/45.2.0): v45.1.0 => v45.2.0
* [@ckeditor/ckeditor5-track-changes](https://www.npmjs.com/package/@ckeditor/ckeditor5-track-changes/v/45.2.0): v45.1.0 => v45.2.0
* [@ckeditor/ckeditor5-typing](https://www.npmjs.com/package/@ckeditor/ckeditor5-typing/v/45.2.0): v45.1.0 => v45.2.0
* [@ckeditor/ckeditor5-ui](https://www.npmjs.com/package/@ckeditor/ckeditor5-ui/v/45.2.0): v45.1.0 => v45.2.0
* [@ckeditor/ckeditor5-undo](https://www.npmjs.com/package/@ckeditor/ckeditor5-undo/v/45.2.0): v45.1.0 => v45.2.0
* [@ckeditor/ckeditor5-upload](https://www.npmjs.com/package/@ckeditor/ckeditor5-upload/v/45.2.0): v45.1.0 => v45.2.0
* [@ckeditor/ckeditor5-uploadcare](https://www.npmjs.com/package/@ckeditor/ckeditor5-uploadcare/v/45.2.0): v45.1.0 => v45.2.0
* [@ckeditor/ckeditor5-utils](https://www.npmjs.com/package/@ckeditor/ckeditor5-utils/v/45.2.0): v45.1.0 => v45.2.0
* [@ckeditor/ckeditor5-watchdog](https://www.npmjs.com/package/@ckeditor/ckeditor5-watchdog/v/45.2.0): v45.1.0 => v45.2.0
* [@ckeditor/ckeditor5-widget](https://www.npmjs.com/package/@ckeditor/ckeditor5-widget/v/45.2.0): v45.1.0 => v45.2.0
* [@ckeditor/ckeditor5-word-count](https://www.npmjs.com/package/@ckeditor/ckeditor5-word-count/v/45.2.0): v45.1.0 => v45.2.0
* [ckeditor5-collaboration](https://www.npmjs.com/package/ckeditor5-collaboration/v/45.2.0): v45.1.0 => v45.2.0
* [ckeditor5-premium-features](https://www.npmjs.com/package/ckeditor5-premium-features/v/45.2.0): v45.1.0 => v45.2.0
</details>


## [45.1.0](https://github.com/ckeditor/ckeditor5/compare/v45.0.0...v45.1.0) (May 14, 2025)

We are happy to announce the release of CKEditor 5 v45.1.0.

### Release highlights

#### Typing Improvements

The typing behavior has been improved for plain text typing. This adjustment allows the web browser to handle text insertion before the editor processes it, enhancing typing reliability across various scenarios, especially on Safari and iOS devices. Issues related to track changes, autocorrect, automatic text replacement, and other input methods have been addressed.

#### Track Changes Enhancements

A new method to start a "tracking session" has been introduced, preventing automatic merging of adjacent suggestions. This allows for more precise control over individual changes, catering to workflows that require selective acceptance of edits.

#### Miscellaneous improvements

* Sticky toolbars and balloons are now better aligned with the visual viewport on iOS and Safari, ensuring correct positioning when zooming.
* The fullscreen plugin has been improved to maintain scroll position when exiting fullscreen, avoiding unexpected jumps on smooth-scrolling pages. Layout consistency has been refined by adjusting margins and editable width. Errors related to the Content minimap plugin in fullscreen mode have also been resolved.
* Introduced a fix which ensures that the `data-author-id` and `data-suggestion` attributes are preserved in non-block suggestions when retrieving data with `showSuggestionHighlights: true`.
* We improved the algorithm for images detection in the Paste from Office feature, in scenarios of mixed local and online images from Microsoft Word. Paste no longer causes some images not to appear.

### MINOR BREAKING CHANGES [ℹ️](https://ckeditor.com/docs/ckeditor5/latest/framework/guides/support/versioning-policy.html#major-and-minor-breaking-changes)

* The default behavior of the `beforeinput` DOM events is no longer prevented in plain text typing scenarios. Now, the engine waits for DOM mutations and applies changes to the model afterward. This should not affect most integrations however, it may affect custom modifications to text insertion into the editor.

### Features

* **[ckeditor5-code-block](https://www.npmjs.com/package/@ckeditor/ckeditor5-ckeditor5-code-block)**: The `Go`/`Golang` programming language was added to the `@ckeditor/ckeditor5-code-block` package. Closes [#18403](https://github.com/ckeditor/ckeditor5/issues/18403). ([commit](https://github.com/ckeditor/ckeditor5/commit/c8d1d5090641f83df71ccdade204a90363532d3a))

  Thanks to [@abdorrahmani](https://github.com/abdorrahmani)!
* **[clipboard](https://www.npmjs.com/package/@ckeditor/ckeditor5-clipboard)**: Exported the `ClipboardObserver` class from the package. Closes [#18385](https://github.com/ckeditor/ckeditor5/issues/18385). ([commit](https://github.com/ckeditor/ckeditor5/commit/711b611b32b7e3a0d556158613c5f7552edf3785))
* **[track-changes](https://www.npmjs.com/package/@ckeditor/ckeditor5-track-changes)**: Added a method for starting a new tracking session in track changes.
* **[utils](https://www.npmjs.com/package/@ckeditor/ckeditor5-utils)**: Recognize Urdu as an RTL language. Closes [#16900](https://github.com/ckeditor/ckeditor5/issues/16900). ([commit](https://github.com/ckeditor/ckeditor5/commit/69b959d63ff9656e3039fd40a9d8d3b669c5b46d))

  Thanks to [@smtaha512](https://github.com/smtaha512)!

### Bug fixes

* **[comments](https://www.npmjs.com/package/@ckeditor/ckeditor5-comments)**: Fixed a crash happening for some asynchronous collaboration integrations, when the `TrackChangesData` plugin was used while there was a resolved comment thread in the document's initial data.
* **[email](https://www.npmjs.com/package/@ckeditor/ckeditor5-email)**: Fixed incorrect documentation links in the email configuration helper.
* **[fullscreen](https://www.npmjs.com/package/@ckeditor/ckeditor5-fullscreen)**: Minor styling improvements. Closes [#18470](https://github.com/ckeditor/ckeditor5/issues/18470). ([commit](https://github.com/ckeditor/ckeditor5/commit/021e0e01acfd5f4aae2ca81afa33d4562780c8f0))
* **[fullscreen](https://www.npmjs.com/package/@ckeditor/ckeditor5-fullscreen)**: Changed the method use to recognize the editor type in fullscreen. Closes [#18395](https://github.com/ckeditor/ckeditor5/issues/18395). ([commit](https://github.com/ckeditor/ckeditor5/commit/71660caa05777121cd456f23ac1187fe609a934c))
* **[fullscreen](https://www.npmjs.com/package/@ckeditor/ckeditor5-fullscreen)**: Fixed restoring scroll position after leaving fullscreen mode for containers with `scroll-behavior: smooth`. Closes [#18378](https://github.com/ckeditor/ckeditor5/issues/18378). ([commit](https://github.com/ckeditor/ckeditor5/commit/6924bea187886abaffac37a98cff35b1f58ff5c1))
* **[html-support](https://www.npmjs.com/package/@ckeditor/ckeditor5-html-support)**: Removing formatting from empty HTML no longer crashes the editor. Closes [#18089](https://github.com/ckeditor/ckeditor5/issues/18089). ([commit](https://github.com/ckeditor/ckeditor5/commit/6390434b1b4672f6da414f382bd02e42ac832b83))
* **[html-support](https://www.npmjs.com/package/@ckeditor/ckeditor5-html-support)**: Pasting an empty HTML element no longer crashes the editor. Closes [#18100](https://github.com/ckeditor/ckeditor5/issues/18100). ([commit](https://github.com/ckeditor/ckeditor5/commit/6390434b1b4672f6da414f382bd02e42ac832b83))
* **[image](https://www.npmjs.com/package/@ckeditor/ckeditor5-image)**: Consume the `.image_resize` class and the `[aspect-ratio]` style during the upcast of the images. Closes [#18287](https://github.com/ckeditor/ckeditor5/issues/18287). ([commit](https://github.com/ckeditor/ckeditor5/commit/361134da02ea753bca3d5ef3d916582485cfcb52))
* **[link](https://www.npmjs.com/package/@ckeditor/ckeditor5-link)**: Fixed a bug where the editor would crash or do nothing when pressing the enter key in newline-suppressed scenarios (such as limit elements). Closes [#15862](https://github.com/ckeditor/ckeditor5/issues/15862). ([commit](https://github.com/ckeditor/ckeditor5/commit/44264dd9fad31888bec8c6a48b5ddd9cdd07e881))

  Thanks [@jonscheiding](https://github.com/jonscheiding)!
* **[minimap](https://www.npmjs.com/package/@ckeditor/ckeditor5-minimap)**: The plugin no longer throws errors when entering the fullscreen mode. Closes [#18472](https://github.com/ckeditor/ckeditor5/issues/18472). ([commit](https://github.com/ckeditor/ckeditor5/commit/4c3e42a216afeeb61eacaa71ad1f8aa2d9697d7c))
* **[paste-from-office](https://www.npmjs.com/package/@ckeditor/ckeditor5-paste-from-office)**: Mixed local and online images from Microsoft Word paste no longer cause some images to disappear. Closes [#18180](https://github.com/ckeditor/ckeditor5/issues/18180). ([commit](https://github.com/ckeditor/ckeditor5/commit/6252bc6b3cfc6ef0671e7a65565cd00fd1e2d94c))
* **[source-editing-enhanced](https://www.npmjs.com/package/@ckeditor/ckeditor5-source-editing-enhanced)**: When the Enhanced Source Editing dialog is open, all editor commands are now disabled to prevent accidental content edits and unintended UI interactions.
* **[table](https://www.npmjs.com/package/@ckeditor/ckeditor5-table)**: Table selector regarding margins should not override the style created during integrations. Closes [#18428](https://github.com/ckeditor/ckeditor5/issues/18428). ([commit](https://github.com/ckeditor/ckeditor5/commit/dedbc4b3b69c70ecd34664161f8dc838c2fb04b9))
* **[track-changes](https://www.npmjs.com/package/@ckeditor/ckeditor5-track-changes)**: Fixed insertion suggestion not restored on undo after it was rejected. This affected specific suggestions which included pressing the enter key. Closes [#18449](https://github.com/ckeditor/ckeditor5/issues/18449). ([commit](https://github.com/ckeditor/ckeditor5/commit/97b504905aa29e3ab2cca11602ab71ef8f8ccb63))
* **[track-changes](https://www.npmjs.com/package/@ckeditor/ckeditor5-track-changes)**: Fixed a crash happening for some asynchronous collaboration integrations, when `TrackChangesData` plugin was used while there was a resolved comment thread in the document's initial data.
* **[track-changes](https://www.npmjs.com/package/@ckeditor/ckeditor5-track-changes)**: An empty element was incorrectly left when an insertion suggestion that ended on "enter key press" was discarded. Also fixed the same error in a case where a similar deletion suggestion was accepted. Related to https://github.com/ckeditor/ckeditor5/issues/18448.
* **[track-changes](https://www.npmjs.com/package/@ckeditor/ckeditor5-track-changes)**: Added missing `[data-suggestion]` and `[data-author-id]` attributes to all suggestion types in editing and data pipelines.
* **[typing](https://www.npmjs.com/package/@ckeditor/ckeditor5-typing)**: Typing in track changes mode no longer reverses typed letters in Safari. ([commit](https://github.com/ckeditor/ckeditor5/commit/45a8182b9f216fcc905daad1ad2c3cf46ab33d2d))
* **[typing](https://www.npmjs.com/package/@ckeditor/ckeditor5-typing)**: The Mac VoiceOver now reads typed characters when typing. Closes [#15436](https://github.com/ckeditor/ckeditor5/issues/15436). ([commit](https://github.com/ckeditor/ckeditor5/commit/45a8182b9f216fcc905daad1ad2c3cf46ab33d2d))
* **[typing](https://www.npmjs.com/package/@ckeditor/ckeditor5-typing)**: Mac text replacement shortcuts will now correctly replace text in Safari. Closes [#13428](https://github.com/ckeditor/ckeditor5/issues/13428). ([commit](https://github.com/ckeditor/ckeditor5/commit/45a8182b9f216fcc905daad1ad2c3cf46ab33d2d))
* **[typing](https://www.npmjs.com/package/@ckeditor/ckeditor5-typing)**: The list items and headings at the beginning of the editable area can be changed to a plain paragraph on backspace keypress. Closes [#18356](https://github.com/ckeditor/ckeditor5/issues/18356). ([commit](https://github.com/ckeditor/ckeditor5/commit/6a1dae99b11f1386bc718027eba55f1f6acc3483))
* **[ui](https://www.npmjs.com/package/@ckeditor/ckeditor5-ui)**: Ensure the table properties form is fully visible within the viewport. Closes [#16133](https://github.com/ckeditor/ckeditor5/issues/16133). ([commit](https://github.com/ckeditor/ckeditor5/commit/80856dac483ab49a06362ad8ff70703350a50500))
* **[ui](https://www.npmjs.com/package/@ckeditor/ckeditor5-ui)**: Optimized performance of dropdowns when opening with many items. Closes [#18094](https://github.com/ckeditor/ckeditor5/issues/18094). ([commit](https://github.com/ckeditor/ckeditor5/commit/06345033ac054968c9b1e0da52134d5692af8157))
* The sticky toolbar and inline editor toolbar should maintain their visual position relative to the editing area, no matter the visual viewport scale or scroll in Safari on desktop and mobile devices. The contextual balloon position should be aware of the part of the top viewport offset visible in the visual viewport on Safari on desktop and mobile. Closes [#7718](https://github.com/ckeditor/ckeditor5/issues/7718). ([commit](https://github.com/ckeditor/ckeditor5/commit/3b538345dcf80502bdde524cc762c0670e4b9d60))

### Other changes

* **[core](https://www.npmjs.com/package/@ckeditor/ckeditor5-core)**: Non-production license notifications should only be displayed once per page load. Closes [#18179](https://github.com/ckeditor/ckeditor5/issues/18179). ([commit](https://github.com/ckeditor/ckeditor5/commit/922fb1c7c48463134a8359ce9709b0ee0ca552c3))
* **[engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine)**: Introduced the `doNotFixSelection` option for `model.deleteContent()` which can be used to force making deletion exactly on the provided selection. Closes [#18448](https://github.com/ckeditor/ckeditor5/issues/18448). ([commit](https://github.com/ckeditor/ckeditor5/commit/b80b369ef320b094343b41250fe9df25dac4682a))
* **[track-changes](https://www.npmjs.com/package/@ckeditor/ckeditor5-track-changes)**: Fixed an incorrect French translation in the Track changes feature.
* **[typing](https://www.npmjs.com/package/@ckeditor/ckeditor5-typing)**: Improved typing performance in large documents. ([commit](https://github.com/ckeditor/ckeditor5/commit/45a8182b9f216fcc905daad1ad2c3cf46ab33d2d))

### Released packages

Check out the [Versioning policy](https://ckeditor.com/docs/ckeditor5/latest/framework/guides/support/versioning-policy.html) guide for more information.

<details>
<summary>Released packages (summary)</summary>

Releases containing new features:

* [@ckeditor/ckeditor5-clipboard](https://www.npmjs.com/package/@ckeditor/ckeditor5-clipboard/v/45.1.0): v45.0.0 => v45.1.0
* [@ckeditor/ckeditor5-code-block](https://www.npmjs.com/package/@ckeditor/ckeditor5-code-block/v/45.1.0): v45.0.0 => v45.1.0
* [@ckeditor/ckeditor5-utils](https://www.npmjs.com/package/@ckeditor/ckeditor5-utils/v/45.1.0): v45.0.0 => v45.1.0

Other releases:

* [@ckeditor/ckeditor5-adapter-ckfinder](https://www.npmjs.com/package/@ckeditor/ckeditor5-adapter-ckfinder/v/45.1.0): v45.0.0 => v45.1.0
* [@ckeditor/ckeditor5-ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai/v/45.1.0): v45.0.0 => v45.1.0
* [@ckeditor/ckeditor5-alignment](https://www.npmjs.com/package/@ckeditor/ckeditor5-alignment/v/45.1.0): v45.0.0 => v45.1.0
* [@ckeditor/ckeditor5-autoformat](https://www.npmjs.com/package/@ckeditor/ckeditor5-autoformat/v/45.1.0): v45.0.0 => v45.1.0
* [@ckeditor/ckeditor5-autosave](https://www.npmjs.com/package/@ckeditor/ckeditor5-autosave/v/45.1.0): v45.0.0 => v45.1.0
* [@ckeditor/ckeditor5-basic-styles](https://www.npmjs.com/package/@ckeditor/ckeditor5-basic-styles/v/45.1.0): v45.0.0 => v45.1.0
* [@ckeditor/ckeditor5-block-quote](https://www.npmjs.com/package/@ckeditor/ckeditor5-block-quote/v/45.1.0): v45.0.0 => v45.1.0
* [@ckeditor/ckeditor5-bookmark](https://www.npmjs.com/package/@ckeditor/ckeditor5-bookmark/v/45.1.0): v45.0.0 => v45.1.0
* [@ckeditor/ckeditor5-case-change](https://www.npmjs.com/package/@ckeditor/ckeditor5-case-change/v/45.1.0): v45.0.0 => v45.1.0
* [@ckeditor/ckeditor5-ckbox](https://www.npmjs.com/package/@ckeditor/ckeditor5-ckbox/v/45.1.0): v45.0.0 => v45.1.0
* [@ckeditor/ckeditor5-ckfinder](https://www.npmjs.com/package/@ckeditor/ckeditor5-ckfinder/v/45.1.0): v45.0.0 => v45.1.0
* [@ckeditor/ckeditor5-cloud-services](https://www.npmjs.com/package/@ckeditor/ckeditor5-cloud-services/v/45.1.0): v45.0.0 => v45.1.0
* [@ckeditor/ckeditor5-collaboration-core](https://www.npmjs.com/package/@ckeditor/ckeditor5-collaboration-core/v/45.1.0): v45.0.0 => v45.1.0
* [@ckeditor/ckeditor5-comments](https://www.npmjs.com/package/@ckeditor/ckeditor5-comments/v/45.1.0): v45.0.0 => v45.1.0
* [@ckeditor/ckeditor5-core](https://www.npmjs.com/package/@ckeditor/ckeditor5-core/v/45.1.0): v45.0.0 => v45.1.0
* [@ckeditor/ckeditor5-document-outline](https://www.npmjs.com/package/@ckeditor/ckeditor5-document-outline/v/45.1.0): v45.0.0 => v45.1.0
* [@ckeditor/ckeditor5-easy-image](https://www.npmjs.com/package/@ckeditor/ckeditor5-easy-image/v/45.1.0): v45.0.0 => v45.1.0
* [@ckeditor/ckeditor5-editor-balloon](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-balloon/v/45.1.0): v45.0.0 => v45.1.0
* [@ckeditor/ckeditor5-editor-classic](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-classic/v/45.1.0): v45.0.0 => v45.1.0
* [@ckeditor/ckeditor5-editor-decoupled](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-decoupled/v/45.1.0): v45.0.0 => v45.1.0
* [@ckeditor/ckeditor5-editor-inline](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-inline/v/45.1.0): v45.0.0 => v45.1.0
* [@ckeditor/ckeditor5-editor-multi-root](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-multi-root/v/45.1.0): v45.0.0 => v45.1.0
* [@ckeditor/ckeditor5-email](https://www.npmjs.com/package/@ckeditor/ckeditor5-email/v/45.1.0): v45.0.0 => v45.1.0
* [@ckeditor/ckeditor5-emoji](https://www.npmjs.com/package/@ckeditor/ckeditor5-emoji/v/45.1.0): v45.0.0 => v45.1.0
* [@ckeditor/ckeditor5-engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine/v/45.1.0): v45.0.0 => v45.1.0
* [@ckeditor/ckeditor5-enter](https://www.npmjs.com/package/@ckeditor/ckeditor5-enter/v/45.1.0): v45.0.0 => v45.1.0
* [@ckeditor/ckeditor5-essentials](https://www.npmjs.com/package/@ckeditor/ckeditor5-essentials/v/45.1.0): v45.0.0 => v45.1.0
* [@ckeditor/ckeditor5-export-inline-styles](https://www.npmjs.com/package/@ckeditor/ckeditor5-export-inline-styles/v/45.1.0): v45.0.0 => v45.1.0
* [@ckeditor/ckeditor5-export-pdf](https://www.npmjs.com/package/@ckeditor/ckeditor5-export-pdf/v/45.1.0): v45.0.0 => v45.1.0
* [@ckeditor/ckeditor5-export-word](https://www.npmjs.com/package/@ckeditor/ckeditor5-export-word/v/45.1.0): v45.0.0 => v45.1.0
* [@ckeditor/ckeditor5-find-and-replace](https://www.npmjs.com/package/@ckeditor/ckeditor5-find-and-replace/v/45.1.0): v45.0.0 => v45.1.0
* [@ckeditor/ckeditor5-font](https://www.npmjs.com/package/@ckeditor/ckeditor5-font/v/45.1.0): v45.0.0 => v45.1.0
* [@ckeditor/ckeditor5-format-painter](https://www.npmjs.com/package/@ckeditor/ckeditor5-format-painter/v/45.1.0): v45.0.0 => v45.1.0
* [@ckeditor/ckeditor5-fullscreen](https://www.npmjs.com/package/@ckeditor/ckeditor5-fullscreen/v/45.1.0): v45.0.0 => v45.1.0
* [@ckeditor/ckeditor5-heading](https://www.npmjs.com/package/@ckeditor/ckeditor5-heading/v/45.1.0): v45.0.0 => v45.1.0
* [@ckeditor/ckeditor5-highlight](https://www.npmjs.com/package/@ckeditor/ckeditor5-highlight/v/45.1.0): v45.0.0 => v45.1.0
* [@ckeditor/ckeditor5-horizontal-line](https://www.npmjs.com/package/@ckeditor/ckeditor5-horizontal-line/v/45.1.0): v45.0.0 => v45.1.0
* [@ckeditor/ckeditor5-html-embed](https://www.npmjs.com/package/@ckeditor/ckeditor5-html-embed/v/45.1.0): v45.0.0 => v45.1.0
* [@ckeditor/ckeditor5-html-support](https://www.npmjs.com/package/@ckeditor/ckeditor5-html-support/v/45.1.0): v45.0.0 => v45.1.0
* [@ckeditor/ckeditor5-icons](https://www.npmjs.com/package/@ckeditor/ckeditor5-icons/v/45.1.0): v45.0.0 => v45.1.0
* [@ckeditor/ckeditor5-image](https://www.npmjs.com/package/@ckeditor/ckeditor5-image/v/45.1.0): v45.0.0 => v45.1.0
* [@ckeditor/ckeditor5-import-word](https://www.npmjs.com/package/@ckeditor/ckeditor5-import-word/v/45.1.0): v45.0.0 => v45.1.0
* [@ckeditor/ckeditor5-indent](https://www.npmjs.com/package/@ckeditor/ckeditor5-indent/v/45.1.0): v45.0.0 => v45.1.0
* [@ckeditor/ckeditor5-language](https://www.npmjs.com/package/@ckeditor/ckeditor5-language/v/45.1.0): v45.0.0 => v45.1.0
* [@ckeditor/ckeditor5-link](https://www.npmjs.com/package/@ckeditor/ckeditor5-link/v/45.1.0): v45.0.0 => v45.1.0
* [@ckeditor/ckeditor5-list](https://www.npmjs.com/package/@ckeditor/ckeditor5-list/v/45.1.0): v45.0.0 => v45.1.0
* [@ckeditor/ckeditor5-list-multi-level](https://www.npmjs.com/package/@ckeditor/ckeditor5-list-multi-level/v/45.1.0): v45.0.0 => v45.1.0
* [@ckeditor/ckeditor5-markdown-gfm](https://www.npmjs.com/package/@ckeditor/ckeditor5-markdown-gfm/v/45.1.0): v45.0.0 => v45.1.0
* [@ckeditor/ckeditor5-media-embed](https://www.npmjs.com/package/@ckeditor/ckeditor5-media-embed/v/45.1.0): v45.0.0 => v45.1.0
* [@ckeditor/ckeditor5-mention](https://www.npmjs.com/package/@ckeditor/ckeditor5-mention/v/45.1.0): v45.0.0 => v45.1.0
* [@ckeditor/ckeditor5-merge-fields](https://www.npmjs.com/package/@ckeditor/ckeditor5-merge-fields/v/45.1.0): v45.0.0 => v45.1.0
* [@ckeditor/ckeditor5-minimap](https://www.npmjs.com/package/@ckeditor/ckeditor5-minimap/v/45.1.0): v45.0.0 => v45.1.0
* [@ckeditor/ckeditor5-operations-compressor](https://www.npmjs.com/package/@ckeditor/ckeditor5-operations-compressor/v/45.1.0): v45.0.0 => v45.1.0
* [@ckeditor/ckeditor5-page-break](https://www.npmjs.com/package/@ckeditor/ckeditor5-page-break/v/45.1.0): v45.0.0 => v45.1.0
* [@ckeditor/ckeditor5-pagination](https://www.npmjs.com/package/@ckeditor/ckeditor5-pagination/v/45.1.0): v45.0.0 => v45.1.0
* [@ckeditor/ckeditor5-paragraph](https://www.npmjs.com/package/@ckeditor/ckeditor5-paragraph/v/45.1.0): v45.0.0 => v45.1.0
* [@ckeditor/ckeditor5-paste-from-office](https://www.npmjs.com/package/@ckeditor/ckeditor5-paste-from-office/v/45.1.0): v45.0.0 => v45.1.0
* [@ckeditor/ckeditor5-paste-from-office-enhanced](https://www.npmjs.com/package/@ckeditor/ckeditor5-paste-from-office-enhanced/v/45.1.0): v45.0.0 => v45.1.0
* [@ckeditor/ckeditor5-real-time-collaboration](https://www.npmjs.com/package/@ckeditor/ckeditor5-real-time-collaboration/v/45.1.0): v45.0.0 => v45.1.0
* [@ckeditor/ckeditor5-remove-format](https://www.npmjs.com/package/@ckeditor/ckeditor5-remove-format/v/45.1.0): v45.0.0 => v45.1.0
* [@ckeditor/ckeditor5-restricted-editing](https://www.npmjs.com/package/@ckeditor/ckeditor5-restricted-editing/v/45.1.0): v45.0.0 => v45.1.0
* [@ckeditor/ckeditor5-revision-history](https://www.npmjs.com/package/@ckeditor/ckeditor5-revision-history/v/45.1.0): v45.0.0 => v45.1.0
* [@ckeditor/ckeditor5-select-all](https://www.npmjs.com/package/@ckeditor/ckeditor5-select-all/v/45.1.0): v45.0.0 => v45.1.0
* [@ckeditor/ckeditor5-show-blocks](https://www.npmjs.com/package/@ckeditor/ckeditor5-show-blocks/v/45.1.0): v45.0.0 => v45.1.0
* [@ckeditor/ckeditor5-slash-command](https://www.npmjs.com/package/@ckeditor/ckeditor5-slash-command/v/45.1.0): v45.0.0 => v45.1.0
* [@ckeditor/ckeditor5-source-editing](https://www.npmjs.com/package/@ckeditor/ckeditor5-source-editing/v/45.1.0): v45.0.0 => v45.1.0
* [@ckeditor/ckeditor5-source-editing-enhanced](https://www.npmjs.com/package/@ckeditor/ckeditor5-source-editing-enhanced/v/45.1.0): v45.0.0 => v45.1.0
* [@ckeditor/ckeditor5-special-characters](https://www.npmjs.com/package/@ckeditor/ckeditor5-special-characters/v/45.1.0): v45.0.0 => v45.1.0
* [@ckeditor/ckeditor5-style](https://www.npmjs.com/package/@ckeditor/ckeditor5-style/v/45.1.0): v45.0.0 => v45.1.0
* [@ckeditor/ckeditor5-table](https://www.npmjs.com/package/@ckeditor/ckeditor5-table/v/45.1.0): v45.0.0 => v45.1.0
* [@ckeditor/ckeditor5-template](https://www.npmjs.com/package/@ckeditor/ckeditor5-template/v/45.1.0): v45.0.0 => v45.1.0
* [@ckeditor/ckeditor5-theme-lark](https://www.npmjs.com/package/@ckeditor/ckeditor5-theme-lark/v/45.1.0): v45.0.0 => v45.1.0
* [@ckeditor/ckeditor5-track-changes](https://www.npmjs.com/package/@ckeditor/ckeditor5-track-changes/v/45.1.0): v45.0.0 => v45.1.0
* [@ckeditor/ckeditor5-typing](https://www.npmjs.com/package/@ckeditor/ckeditor5-typing/v/45.1.0): v45.0.0 => v45.1.0
* [@ckeditor/ckeditor5-ui](https://www.npmjs.com/package/@ckeditor/ckeditor5-ui/v/45.1.0): v45.0.0 => v45.1.0
* [@ckeditor/ckeditor5-undo](https://www.npmjs.com/package/@ckeditor/ckeditor5-undo/v/45.1.0): v45.0.0 => v45.1.0
* [@ckeditor/ckeditor5-upload](https://www.npmjs.com/package/@ckeditor/ckeditor5-upload/v/45.1.0): v45.0.0 => v45.1.0
* [@ckeditor/ckeditor5-uploadcare](https://www.npmjs.com/package/@ckeditor/ckeditor5-uploadcare/v/45.1.0): v45.0.0 => v45.1.0
* [@ckeditor/ckeditor5-watchdog](https://www.npmjs.com/package/@ckeditor/ckeditor5-watchdog/v/45.1.0): v45.0.0 => v45.1.0
* [@ckeditor/ckeditor5-widget](https://www.npmjs.com/package/@ckeditor/ckeditor5-widget/v/45.1.0): v45.0.0 => v45.1.0
* [@ckeditor/ckeditor5-word-count](https://www.npmjs.com/package/@ckeditor/ckeditor5-word-count/v/45.1.0): v45.0.0 => v45.1.0
* [ckeditor5-collaboration](https://www.npmjs.com/package/ckeditor5-collaboration/v/45.1.0): v45.0.0 => v45.1.0
* [ckeditor5-premium-features](https://www.npmjs.com/package/ckeditor5-premium-features/v/45.1.0): v45.0.0 => v45.1.0
</details>


## [45.0.0](https://github.com/ckeditor/ckeditor5/compare/v44.3.0...v45.0.0) (April 7, 2025)

The CKEditor 5 v45.0.0 release brings powerful new features and improvements, making content creation smoother and more versatile. From enhanced email editing to a refined linking experience and a brand-new full-screen mode, this update is packed with valuable upgrades.

### Release highlights

#### Email editing enhancements

We are making it easier to create and edit emails directly in CKEditor 5 with several enhancements. This release introduces the following new features:

* [**Export with Inline Styles**](https://ckeditor.com/docs/ckeditor5/latest/features/export-with-inline-styles.html) (⭐) provides the ability to export email content with automatically inlined styles, ensuring compatibility and proper rendering across different email clients.
* [**Email Configuration Helper**](https://ckeditor.com/docs/ckeditor5/latest/features/email-editing/email-configuration-helper.html) (⭐) is a new configuration helper plugin that provides guidance for integrators to correctly set up an email-friendly editor while avoiding common pitfalls.
* [**Layout tables:**](https://ckeditor.com/docs/ckeditor5/latest/features/tables/layout-tables.html) are a new type of tables that has been introduced to simplify the creation of structured email designs, offering better control over layout, alignment and spacing.

Apart from these new features, this update also brings various fixes and improvements related to table behavior, enhanced HTML support, and better handling of complex email structures. These refinements help ensure a more seamless email editing experience, reducing inconsistencies and improving compatibility with external email clients.

#### The fullscreen feature

A long-requested feature has finally arrived with the [introduction of full-screen editing](https://ckeditor.com/docs/ckeditor5/latest/features/fullscreen.html) for the classic and decoupled editor types. This new mode provides a focused writing experience by making the editor the centerpiece of the screen. The expanded screen space allows for better visibility of content in sidebars such as comments, suggestions, and document outlines, enhancing your overall workflow.

#### Improved linking experience

Linking in CKEditor 5 has been significantly [upgraded with a redesigned user interface](https://ckeditor.com/docs/ckeditor5/latest/features/link.html), making adding and editing links more intuitive. We added the possibility to add and edit the display text of a link. Users can now easily link to bookmarks within the document and select links from predefined lists (defined by the developer). These improvements make inserting and managing links faster and more flexible than ever before.

During this initiative, we also aligned visual and technical components of the editor. Each balloon got a header with the tile, we also unified the toolbar behavior and keystrokes of Link and Bookmarks with other widget’s toolbars like image and tables.

> [!NOTE]
> The UI got updated in several places: main view, link properties (decorators), and also its technical implementation changed. Make sure to give special attention to the update if you did any customizations to the link interface.

#### New installation methods improvements: icons replacement

We are continuing to strengthen the new installation methods while phasing out older solutions. We added one of the key components you asked for: replacing our icons with your custom ones. It is now possible to replace the icons via the [package’s override mechanism](https://ckeditor.com/docs/ckeditor5/latest/getting-started/setup/customizing-icons.html).

> [!NOTE]
> To achieve a proper solution for icons replacement for the npm builds, we needed to introduce a breaking change. If you used our icons for any purposes, make sure to update their paths.

#### ⚠️ Deprecations in old installation methods: stage 1 completed

We are progressing with deprecation according to [our sunset plan](https://github.com/ckeditor/ckeditor5/issues/17779). From this release, predefined builds’ packages, such as `@ckeditor/ckeditor-build-classic`, are now officially deprecated.

We also dropped support for Webpack 4 in both the **old and new** installation methods. All packages and CDN from this version are now distributed with ES2022 as the target ECMAScript version, providing better compatibility with modern JavaScript features and improved performance.

By the end of 2025, custom builds that rely on webpack and DLL builds will also be deprecated. Refer to [our documentation and migration guides](https://ckeditor.com/docs/ckeditor5/latest/updating/nim-migration/migration-to-new-installation-methods.html) to ensure a smooth transition.

We are committed to making CKEditor 5 even better. Stay tuned for more improvements in upcoming releases! If you have any feedback, let us know — we are always listening.

Please refer to the [update guide](https://ckeditor.com/docs/ckeditor5/latest/updating/guides/update-to-45.html) to learn more about these changes.

Happy editing!

### MAJOR BREAKING CHANGES [ℹ️](https://ckeditor.com/docs/ckeditor5/latest/framework/guides/support/versioning-policy.html#major-and-minor-breaking-changes)

* **[bookmark](https://www.npmjs.com/package/@ckeditor/ckeditor5-bookmark)**: The `BookmarkUI#actionsView` is no longer available. The bookmark feature is now using the `WidgetToolbarRepository` instead.
* **[build-*](https://www.npmjs.com/search?q=keywords%3Ackeditor5-build%20maintainer%3Ackeditor)**: CKEditor 5 predefined builds are no longer available.
* **[link](https://www.npmjs.com/package/@ckeditor/ckeditor5-link)**: The `LinkUI#actionsView` is no longer available. The bookmark feature now uses the `LinkUI#toolbarView` (an instance of the `ToolbarView` class) instead of the custom `LinkActionsView`.

### MINOR BREAKING CHANGES [ℹ️](https://ckeditor.com/docs/ckeditor5/latest/framework/guides/support/versioning-policy.html#major-and-minor-breaking-changes)

* **[link](https://www.npmjs.com/package/@ckeditor/ckeditor5-link)**: The `createBookmarkCallbacks()` helper is now replaced by the `isScrollableToTarget()` and `scrollToTarget()` helpers.
* **[table](https://www.npmjs.com/package/@ckeditor/ckeditor5-table)**: The `FormRowView` class was moved to the `@ckeditor/ckeditor5-ui` package.
* **[table](https://www.npmjs.com/package/@ckeditor/ckeditor5-table)**: The `form.css` component was moved to the `@ckeditor/ckeditor5-theme-lark` package.
* All CKEditor 5 icons are now available in the `@ckeditor/ckeditor5-icons` package.

### DISTRIBUTION CHANGES

* All packages and CDN source code now target ES2022 as the ECMAScript version.

### Features

* **[email](https://www.npmjs.com/package/@ckeditor/ckeditor5-email)**: Introduced a new package to validate the editor configuration for email compatibility. It helps prevent misconfigurations by enforcing best practices and future-proof rules. Added utilities for post-processing CSS, improving support across various email clients by adjusting styles for better rendering consistency.
* **[export-inline-styles](https://www.npmjs.com/package/@ckeditor/ckeditor5-export-inline-styles)**: Added a new package for exporting content with inline styles. Ensures CSS classes (`[class]`) and IDs (`[id]`) are inlined within elements, improving compatibility with email clients that strip external styles. It helps maintain consistent formatting across different email clients, reducing rendering issues.
* **[fullscreen](https://www.npmjs.com/package/@ckeditor/ckeditor5-fullscreen)**: Introduced the fullscreen mode feature. Closes [#18026](https://github.com/ckeditor/ckeditor5/issues/18026). ([commit](https://github.com/ckeditor/ckeditor5/commit/f50514bc8fbeb6761348792911eab03983d8086c))
* **[html-support](https://www.npmjs.com/package/@ckeditor/ckeditor5-html-support)**: Introduced the ability to render the`<style>` elements from the `<head>` section of editor data content using the `FullPage` plugin. See [#13482](https://github.com/ckeditor/ckeditor5/issues/13482). ([commit](https://github.com/ckeditor/ckeditor5/commit/51ee6463cb292e31f5783ca5207feec2b3a557a6))
* **[revision-history](https://www.npmjs.com/package/@ckeditor/ckeditor5-revision-history)**: Added a new property `RevisionHistory#isRevisionViewerOpen` that indicates whether the revision history is opened or not.
* **[source-editing-enhanced](https://www.npmjs.com/package/@ckeditor/ckeditor5-source-editing-enhanced)**: The [one-dark](https://www.npmjs.com/package/@codemirror/theme-one-dark) theme is now built-in and available via `config.sourceEditingEnhanced.theme` by passing the `'dark'` value. This change enables the use of the dark theme with the CDN installation method, which does not support external `CodeMirror` dependencies. Additionally, if you previously used the `oneDark` extension directly, you can now switch to `theme: 'dark'` for built-in support.
* **[table](https://www.npmjs.com/package/@ckeditor/ckeditor5-table)**: Introduced the layout tables feature to enable constructing grids with tables, for example for email editing. These tables are designed for layout purposes, and include the `role="presentation"` parameter for accessibility. Users can insert layout tables via the editor toolbar and switch between content and layout tables. The editing view now closely matches the rendered output. Closes [#18132](https://github.com/ckeditor/ckeditor5/issues/18132). ([commit](https://github.com/ckeditor/ckeditor5/commit/51ee6463cb292e31f5783ca5207feec2b3a557a6))
* **[table](https://www.npmjs.com/package/@ckeditor/ckeditor5-table)**: Added the ability to toggle between content tables and layout tables. Users can switch table types using a split button in the table properties UI. While captions and `<th>` elements may be lost, table structure remains intact. Closes [#18131](https://github.com/ckeditor/ckeditor5/issues/18131). ([commit](https://github.com/ckeditor/ckeditor5/commit/51ee6463cb292e31f5783ca5207feec2b3a557a6))
* **[table](https://www.npmjs.com/package/@ckeditor/ckeditor5-table)**: Dragging and dropping a table into another table no longer merges them. Instead, the dropped table is placed as a whole inside the target cell. Pasting tables remains unchanged. Closes [#18126](https://github.com/ckeditor/ckeditor5/issues/18126). ([commit](https://github.com/ckeditor/ckeditor5/commit/51ee6463cb292e31f5783ca5207feec2b3a557a6))
* **[template](https://www.npmjs.com/package/@ckeditor/ckeditor5-template)**: Inserting a template containing a table into another table no longer merges them. Instead, the template is placed as a whole inside the target cell. See [#18126](https://github.com/ckeditor/ckeditor5/issues/18126).
* **[theme-lark](https://www.npmjs.com/package/@ckeditor/ckeditor5-theme-lark)**: Introduced the `form.css` component . ([commit](https://github.com/ckeditor/ckeditor5/commit/bca09868577c34b8b1ee8d579dded0e21b5e506e))
* **[ui](https://www.npmjs.com/package/@ckeditor/ckeditor5-ui)**: Added the `MenuBarView#disable()` and `MenuBarView#enable()` methods. They disable/enable all top-level menus in menu bar. Closes [#17940](https://github.com/ckeditor/ckeditor5/issues/17940). ([commit](https://github.com/ckeditor/ckeditor5/commit/f50514bc8fbeb6761348792911eab03983d8086c))
* **[ui](https://www.npmjs.com/package/@ckeditor/ckeditor5-ui)**: Added the `ToolbarView#switchBehavior()` method to switch toolbar behavior after the editor has been initialized. Closes [#18159](https://github.com/ckeditor/ckeditor5/issues/18159). ([commit](https://github.com/ckeditor/ckeditor5/commit/f50514bc8fbeb6761348792911eab03983d8086c))
* **[ui](https://www.npmjs.com/package/@ckeditor/ckeditor5-ui)**: Introduced the `FormRowView` class. ([commit](https://github.com/ckeditor/ckeditor5/commit/bca09868577c34b8b1ee8d579dded0e21b5e506e))
* Moved all icons to the `@ckeditor/ckeditor5-icons` package. Related to [#16546](https://github.com/ckeditor/ckeditor5/issues/16546). ([commit](https://github.com/ckeditor/ckeditor5/commit/bca09868577c34b8b1ee8d579dded0e21b5e506e))
* Added the `@ckeditor/ckeditor5-icons` package to the core DLL package. ([commit](https://github.com/ckeditor/ckeditor5/commit/bca09868577c34b8b1ee8d579dded0e21b5e506e))

### Bug fixes

* **[ckbox](https://www.npmjs.com/package/@ckeditor/ckeditor5-ckbox)**: Resolved an issue where images from private categories were not appearing in the selector. Closes [#18044](https://github.com/ckeditor/ckeditor5/issues/18044). ([commit](https://github.com/ckeditor/ckeditor5/commit/d7760d30194aef8e7af871e671ba2bc222ec3a24))
* **[emoji](https://www.npmjs.com/package/@ckeditor/ckeditor5-emoji)**: Fixed the emoji panel not being visible while used in comments archive. Closes [#17964](https://github.com/ckeditor/ckeditor5/issues/17964). ([commit](https://github.com/ckeditor/ckeditor5/commit/ce9030014a6fcdde2c35e46f05f1e3d44655ae5a))
* **[engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine)**: The selection should not move to another table row while switching heading rows. Closes [#17962](https://github.com/ckeditor/ckeditor5/issues/17962). ([commit](https://github.com/ckeditor/ckeditor5/commit/81dd6e85e42861e0e58180734174752a092e5b5a))
* **[heading](https://www.npmjs.com/package/@ckeditor/ckeditor5-heading)**: Added the missing `converterPriority` type definition to `HeadingOption` interface. Closes [#18182](https://github.com/ckeditor/ckeditor5/issues/18182). ([commit](https://github.com/ckeditor/ckeditor5/commit/de9e0520e3d756ae3d3acf60d7abf8d9e4c997a9))
* **[html-support](https://www.npmjs.com/package/@ckeditor/ckeditor5-html-support)**: The floated tables are now loaded and showed as expected in the editor's view. Closes [#18203](https://github.com/ckeditor/ckeditor5/issues/18203). ([commit](https://github.com/ckeditor/ckeditor5/commit/227ae01e6a4a2f92a3230a66a2fde511b60b8ed1))
* **[link](https://www.npmjs.com/package/@ckeditor/ckeditor5-link)**: The `Autolink` feature will now correctly autolink `http://localhost` and `http://localhost:port`. Closes [#18185](https://github.com/ckeditor/ckeditor5/issues/18185). ([commit](https://github.com/ckeditor/ckeditor5/commit/aeb5747166f666fcd4acbe286bd923df89769825))
* **[mention](https://www.npmjs.com/package/@ckeditor/ckeditor5-mention)**: Fixed the mention panel not being visible while used in comments archive. Closes [#17964](https://github.com/ckeditor/ckeditor5/issues/17964). ([commit](https://github.com/ckeditor/ckeditor5/commit/ce9030014a6fcdde2c35e46f05f1e3d44655ae5a))
* **[revision-history](https://www.npmjs.com/package/@ckeditor/ckeditor5-revision-history)**: Revisions will now correctly retain data for HTML embed widget, as well as `<script>` and `<style>` tags enabled by the General HTML Support feature. Before, when revision was saved, these elements were saved empty, and this lead to data loss when such revision was restored. Note, that this will not fix revisions that are already affected by this error.
* **[revision-history](https://www.npmjs.com/package/@ckeditor/ckeditor5-revision-history)**: Fixed a crash when viewing a revision which had an HTML comment node in its data (reproducible with General HTML Support plugin).
* **[revision-history](https://www.npmjs.com/package/@ckeditor/ckeditor5-revision-history)**: Fixed handling `UIElement`s and `RawElement`s by revision history (may concern third-party custom plugins).
* **[revision-history](https://www.npmjs.com/package/@ckeditor/ckeditor5-revision-history)**: Fixed a crash when viewing a revision which had a collapsed marker in its data (may concern third-party custom plugins).
* **[table](https://www.npmjs.com/package/@ckeditor/ckeditor5-table)**: Removed `[role="textbox"]` from the `<td>/`<th>` editables. Windows Narrator no longer reads table dimensions as 0 by 0. Closes [#16923](https://github.com/ckeditor/ckeditor5/issues/16923). ([commit](https://github.com/ckeditor/ckeditor5/commit/656d749880020f02a4b6c05571ce3a48038acc70))
* **[track-changes](https://www.npmjs.com/package/@ckeditor/ckeditor5-track-changes)**: The editor no longer crashes during initialization when the `ShiftEnter` plugin is removed.
* **[ui](https://www.npmjs.com/package/@ckeditor/ckeditor5-ui)**: Do not open disabled menu bar menu items on arrow down press. Closes [#17915](https://github.com/ckeditor/ckeditor5/issues/17915). ([commit](https://github.com/ckeditor/ckeditor5/commit/f50514bc8fbeb6761348792911eab03983d8086c))
* **[ui](https://www.npmjs.com/package/@ckeditor/ckeditor5-ui)**: The `ButtonView#icon` property can now be set/reset after the button's first render. ([commit](https://github.com/ckeditor/ckeditor5/commit/bca09868577c34b8b1ee8d579dded0e21b5e506e))
* **[table](https://www.npmjs.com/package/@ckeditor/ckeditor5-table)**: Widgets UI elements should be visible when they are inside tables. Closes [#18268](https://github.com/ckeditor/ckeditor5/issues/18268).
* **[table](https://www.npmjs.com/package/@ckeditor/ckeditor5-table)**: Nested tables outline should not be cut of at the bottom during hovering. Closes [#18262](https://github.com/ckeditor/ckeditor5/issues/18262).
* **[link](https://www.npmjs.com/package/@ckeditor/ckeditor5-link)**: Link balloon no longer disappears when scrolling the page slightly on iOS. Closes [#18022](https://github.com/ckeditor/ckeditor5/issues/18022).

### Other changes

* **[bookmark](https://www.npmjs.com/package/@ckeditor/ckeditor5-bookmark)**: The Bookmark feature now uses the `WidgetToolbarRepository` instead of a custom `ActionsView` to display the bookmark toolbar in the contextual balloon. The new toolbar uses components registered in the `ComponentFactory`. ([commit](https://github.com/ckeditor/ckeditor5/commit/bca09868577c34b8b1ee8d579dded0e21b5e506e))
* **[bookmark](https://www.npmjs.com/package/@ckeditor/ckeditor5-bookmark)**: Form styles and structure are now unified with use of `ck-form` and `ck-form__row`. ([commit](https://github.com/ckeditor/ckeditor5/commit/bca09868577c34b8b1ee8d579dded0e21b5e506e))
* **[collaboration-core](https://www.npmjs.com/package/@ckeditor/ckeditor5-collaboration-core)**: Translations are now supported in the date formatter used by comments and suggestions, allowing for localizing dates.
* **[engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine)**: Added the read-only `DomConverter#domDocument` property. Closes [#18146](https://github.com/ckeditor/ckeditor5/issues/18146). ([commit](https://github.com/ckeditor/ckeditor5/commit/83c9a956ad2736aace2d969dc07bea266541de9c))
* **[image](https://www.npmjs.com/package/@ckeditor/ckeditor5-image)**: Image and custom resize form styles and structure now unified with use of `ck-form` and `ck-form__row`. ([commit](https://github.com/ckeditor/ckeditor5/commit/bca09868577c34b8b1ee8d579dded0e21b5e506e))
* **[link](https://www.npmjs.com/package/@ckeditor/ckeditor5-link)**: The link feature now uses the `ToolbarView` instead of a custom `LinkActionsView` to display the link toolbar in the contextual balloon. The new toolbar uses components registered in the `ComponentFactory`. ([commit](https://github.com/ckeditor/ckeditor5/commit/bca09868577c34b8b1ee8d579dded0e21b5e506e))
* **[link](https://www.npmjs.com/package/@ckeditor/ckeditor5-link)**: Form styles and structure are now unified with use of `ck-form` and `ck-form__row`. ([commit](https://github.com/ckeditor/ckeditor5/commit/bca09868577c34b8b1ee8d579dded0e21b5e506e))
* **[real-time-collaboration](https://www.npmjs.com/package/@ckeditor/ckeditor5-real-time-collaboration)**: Added a more modern look to the presence list collapsed view (used when many users are connected to the document).
* **[revision-history](https://www.npmjs.com/package/@ckeditor/ckeditor5-revision-history)**: The document outline will now be hidden when the revision history is opened.
* **[source-editing](https://www.npmjs.com/package/@ckeditor/ckeditor5-source-editing)**: Document outline and annotations will now be hidden when editor is in source editing mode. Closes [#17978](https://github.com/ckeditor/ckeditor5/issues/17978). ([commit](https://github.com/ckeditor/ckeditor5/commit/f50514bc8fbeb6761348792911eab03983d8086c))
* **[table](https://www.npmjs.com/package/@ckeditor/ckeditor5-table)**: Extracted the `form.css` to `@ckeditor/ckeditor5-theme-lark` package. ([commit](https://github.com/ckeditor/ckeditor5/commit/bca09868577c34b8b1ee8d579dded0e21b5e506e))
* **[table](https://www.npmjs.com/package/@ckeditor/ckeditor5-table)**: Extracted the `FormRowView` to `@ckeditor/ckeditor5-ui` package. ([commit](https://github.com/ckeditor/ckeditor5/commit/bca09868577c34b8b1ee8d579dded0e21b5e506e))
* **[ui](https://www.npmjs.com/package/@ckeditor/ckeditor5-ui)**: The `IconView` now throws a meaningful error if the provided icon content is not a valid SVG. ([commit](https://github.com/ckeditor/ckeditor5/commit/bca09868577c34b8b1ee8d579dded0e21b5e506e))
* **[widget](https://www.npmjs.com/package/@ckeditor/ckeditor5-widget)**: The `WidgetToolbarRepository#register()` now accepts a customized list of desired balloon positions. ([commit](https://github.com/ckeditor/ckeditor5/commit/bca09868577c34b8b1ee8d579dded0e21b5e506e))
* Added the `Belarusian` language translations for CKEditor 5. Huge thanks to [@karavanjo](https://github.com/karavanjo). ([commit](https://github.com/ckeditor/ckeditor5/commit/49f5b1b08a66e3c68fea10ac84d3e5000ed8d479))
* Upgraded the minimal version of Node.js to 20.0.0 due to the end of LTS. ([commit](https://github.com/ckeditor/ckeditor5/commit/b47ca1e4fb7b014c1d52bc458d1dda9649e210fa))
* Updated TypeScript `target` to `es2022`. Closes [#17886](https://github.com/ckeditor/ckeditor5/issues/17886). ([commit](https://github.com/ckeditor/ckeditor5/commit/bca09868577c34b8b1ee8d579dded0e21b5e506e))
* Replaced `lodash-es` with `es-toolkit`. See [#16395](https://github.com/ckeditor/ckeditor5/issues/16395). ([commit](https://github.com/ckeditor/ckeditor5/commit/bca09868577c34b8b1ee8d579dded0e21b5e506e))
* The `@ckeditor/ckeditor5-build-*` packages are no longer maintained. ([commit](https://github.com/ckeditor/ckeditor5/commit/bca09868577c34b8b1ee8d579dded0e21b5e506e))

### Released packages

Check out the [Versioning policy](https://ckeditor.com/docs/ckeditor5/latest/framework/guides/support/versioning-policy.html) guide for more information.

<details>
<summary>Released packages (summary)</summary>

New packages:

* [@ckeditor/ckeditor5-email](https://www.npmjs.com/package/@ckeditor/ckeditor5-email/v/45.0.0): v45.0.0
* [@ckeditor/ckeditor5-export-inline-styles](https://www.npmjs.com/package/@ckeditor/ckeditor5-export-inline-styles/v/45.0.0): v45.0.0
* [@ckeditor/ckeditor5-fullscreen](https://www.npmjs.com/package/@ckeditor/ckeditor5-fullscreen/v/45.0.0): v45.0.0
* [@ckeditor/ckeditor5-icons](https://www.npmjs.com/package/@ckeditor/ckeditor5-icons/v/45.0.0): v45.0.0

Major releases (contain major breaking changes):

* [@ckeditor/ckeditor5-bookmark](https://www.npmjs.com/package/@ckeditor/ckeditor5-bookmark/v/45.0.0): v44.3.0 => v45.0.0
* [@ckeditor/ckeditor5-link](https://www.npmjs.com/package/@ckeditor/ckeditor5-link/v/45.0.0): v44.3.0 => v45.0.0
* [@ckeditor/ckeditor5-table](https://www.npmjs.com/package/@ckeditor/ckeditor5-table/v/45.0.0): v44.3.0 => v45.0.0

Releases containing new features:

* [@ckeditor/ckeditor5-adapter-ckfinder](https://www.npmjs.com/package/@ckeditor/ckeditor5-adapter-ckfinder/v/45.0.0): v44.3.0 => v45.0.0
* [@ckeditor/ckeditor5-alignment](https://www.npmjs.com/package/@ckeditor/ckeditor5-alignment/v/45.0.0): v44.3.0 => v45.0.0
* [@ckeditor/ckeditor5-autoformat](https://www.npmjs.com/package/@ckeditor/ckeditor5-autoformat/v/45.0.0): v44.3.0 => v45.0.0
* [@ckeditor/ckeditor5-autosave](https://www.npmjs.com/package/@ckeditor/ckeditor5-autosave/v/45.0.0): v44.3.0 => v45.0.0
* [@ckeditor/ckeditor5-basic-styles](https://www.npmjs.com/package/@ckeditor/ckeditor5-basic-styles/v/45.0.0): v44.3.0 => v45.0.0
* [@ckeditor/ckeditor5-block-quote](https://www.npmjs.com/package/@ckeditor/ckeditor5-block-quote/v/45.0.0): v44.3.0 => v45.0.0
* [@ckeditor/ckeditor5-ckbox](https://www.npmjs.com/package/@ckeditor/ckeditor5-ckbox/v/45.0.0): v44.3.0 => v45.0.0
* [@ckeditor/ckeditor5-ckfinder](https://www.npmjs.com/package/@ckeditor/ckeditor5-ckfinder/v/45.0.0): v44.3.0 => v45.0.0
* [@ckeditor/ckeditor5-clipboard](https://www.npmjs.com/package/@ckeditor/ckeditor5-clipboard/v/45.0.0): v44.3.0 => v45.0.0
* [@ckeditor/ckeditor5-cloud-services](https://www.npmjs.com/package/@ckeditor/ckeditor5-cloud-services/v/45.0.0): v44.3.0 => v45.0.0
* [@ckeditor/ckeditor5-code-block](https://www.npmjs.com/package/@ckeditor/ckeditor5-code-block/v/45.0.0): v44.3.0 => v45.0.0
* [@ckeditor/ckeditor5-core](https://www.npmjs.com/package/@ckeditor/ckeditor5-core/v/45.0.0): v44.3.0 => v45.0.0
* [@ckeditor/ckeditor5-easy-image](https://www.npmjs.com/package/@ckeditor/ckeditor5-easy-image/v/45.0.0): v44.3.0 => v45.0.0
* [@ckeditor/ckeditor5-editor-balloon](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-balloon/v/45.0.0): v44.3.0 => v45.0.0
* [@ckeditor/ckeditor5-editor-classic](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-classic/v/45.0.0): v44.3.0 => v45.0.0
* [@ckeditor/ckeditor5-editor-decoupled](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-decoupled/v/45.0.0): v44.3.0 => v45.0.0
* [@ckeditor/ckeditor5-editor-inline](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-inline/v/45.0.0): v44.3.0 => v45.0.0
* [@ckeditor/ckeditor5-editor-multi-root](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-multi-root/v/45.0.0): v44.3.0 => v45.0.0
* [@ckeditor/ckeditor5-emoji](https://www.npmjs.com/package/@ckeditor/ckeditor5-emoji/v/45.0.0): v44.3.0 => v45.0.0
* [@ckeditor/ckeditor5-engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine/v/45.0.0): v44.3.0 => v45.0.0
* [@ckeditor/ckeditor5-enter](https://www.npmjs.com/package/@ckeditor/ckeditor5-enter/v/45.0.0): v44.3.0 => v45.0.0
* [@ckeditor/ckeditor5-essentials](https://www.npmjs.com/package/@ckeditor/ckeditor5-essentials/v/45.0.0): v44.3.0 => v45.0.0
* [@ckeditor/ckeditor5-find-and-replace](https://www.npmjs.com/package/@ckeditor/ckeditor5-find-and-replace/v/45.0.0): v44.3.0 => v45.0.0
* [@ckeditor/ckeditor5-font](https://www.npmjs.com/package/@ckeditor/ckeditor5-font/v/45.0.0): v44.3.0 => v45.0.0
* [@ckeditor/ckeditor5-heading](https://www.npmjs.com/package/@ckeditor/ckeditor5-heading/v/45.0.0): v44.3.0 => v45.0.0
* [@ckeditor/ckeditor5-highlight](https://www.npmjs.com/package/@ckeditor/ckeditor5-highlight/v/45.0.0): v44.3.0 => v45.0.0
* [@ckeditor/ckeditor5-horizontal-line](https://www.npmjs.com/package/@ckeditor/ckeditor5-horizontal-line/v/45.0.0): v44.3.0 => v45.0.0
* [@ckeditor/ckeditor5-html-embed](https://www.npmjs.com/package/@ckeditor/ckeditor5-html-embed/v/45.0.0): v44.3.0 => v45.0.0
* [@ckeditor/ckeditor5-html-support](https://www.npmjs.com/package/@ckeditor/ckeditor5-html-support/v/45.0.0): v44.3.0 => v45.0.0
* [@ckeditor/ckeditor5-image](https://www.npmjs.com/package/@ckeditor/ckeditor5-image/v/45.0.0): v44.3.0 => v45.0.0
* [@ckeditor/ckeditor5-indent](https://www.npmjs.com/package/@ckeditor/ckeditor5-indent/v/45.0.0): v44.3.0 => v45.0.0
* [@ckeditor/ckeditor5-language](https://www.npmjs.com/package/@ckeditor/ckeditor5-language/v/45.0.0): v44.3.0 => v45.0.0
* [@ckeditor/ckeditor5-list](https://www.npmjs.com/package/@ckeditor/ckeditor5-list/v/45.0.0): v44.3.0 => v45.0.0
* [@ckeditor/ckeditor5-markdown-gfm](https://www.npmjs.com/package/@ckeditor/ckeditor5-markdown-gfm/v/45.0.0): v44.3.0 => v45.0.0
* [@ckeditor/ckeditor5-media-embed](https://www.npmjs.com/package/@ckeditor/ckeditor5-media-embed/v/45.0.0): v44.3.0 => v45.0.0
* [@ckeditor/ckeditor5-mention](https://www.npmjs.com/package/@ckeditor/ckeditor5-mention/v/45.0.0): v44.3.0 => v45.0.0
* [@ckeditor/ckeditor5-minimap](https://www.npmjs.com/package/@ckeditor/ckeditor5-minimap/v/45.0.0): v44.3.0 => v45.0.0
* [@ckeditor/ckeditor5-page-break](https://www.npmjs.com/package/@ckeditor/ckeditor5-page-break/v/45.0.0): v44.3.0 => v45.0.0
* [@ckeditor/ckeditor5-paragraph](https://www.npmjs.com/package/@ckeditor/ckeditor5-paragraph/v/45.0.0): v44.3.0 => v45.0.0
* [@ckeditor/ckeditor5-paste-from-office](https://www.npmjs.com/package/@ckeditor/ckeditor5-paste-from-office/v/45.0.0): v44.3.0 => v45.0.0
* [@ckeditor/ckeditor5-remove-format](https://www.npmjs.com/package/@ckeditor/ckeditor5-remove-format/v/45.0.0): v44.3.0 => v45.0.0
* [@ckeditor/ckeditor5-restricted-editing](https://www.npmjs.com/package/@ckeditor/ckeditor5-restricted-editing/v/45.0.0): v44.3.0 => v45.0.0
* [@ckeditor/ckeditor5-select-all](https://www.npmjs.com/package/@ckeditor/ckeditor5-select-all/v/45.0.0): v44.3.0 => v45.0.0
* [@ckeditor/ckeditor5-show-blocks](https://www.npmjs.com/package/@ckeditor/ckeditor5-show-blocks/v/45.0.0): v44.3.0 => v45.0.0
* [@ckeditor/ckeditor5-source-editing](https://www.npmjs.com/package/@ckeditor/ckeditor5-source-editing/v/45.0.0): v44.3.0 => v45.0.0
* [@ckeditor/ckeditor5-special-characters](https://www.npmjs.com/package/@ckeditor/ckeditor5-special-characters/v/45.0.0): v44.3.0 => v45.0.0
* [@ckeditor/ckeditor5-style](https://www.npmjs.com/package/@ckeditor/ckeditor5-style/v/45.0.0): v44.3.0 => v45.0.0
* [@ckeditor/ckeditor5-theme-lark](https://www.npmjs.com/package/@ckeditor/ckeditor5-theme-lark/v/45.0.0): v44.3.0 => v45.0.0
* [@ckeditor/ckeditor5-typing](https://www.npmjs.com/package/@ckeditor/ckeditor5-typing/v/45.0.0): v44.3.0 => v45.0.0
* [@ckeditor/ckeditor5-ui](https://www.npmjs.com/package/@ckeditor/ckeditor5-ui/v/45.0.0): v44.3.0 => v45.0.0
* [@ckeditor/ckeditor5-undo](https://www.npmjs.com/package/@ckeditor/ckeditor5-undo/v/45.0.0): v44.3.0 => v45.0.0
* [@ckeditor/ckeditor5-upload](https://www.npmjs.com/package/@ckeditor/ckeditor5-upload/v/45.0.0): v44.3.0 => v45.0.0
* [@ckeditor/ckeditor5-utils](https://www.npmjs.com/package/@ckeditor/ckeditor5-utils/v/45.0.0): v44.3.0 => v45.0.0
* [@ckeditor/ckeditor5-watchdog](https://www.npmjs.com/package/@ckeditor/ckeditor5-watchdog/v/45.0.0): v44.3.0 => v45.0.0
* [@ckeditor/ckeditor5-widget](https://www.npmjs.com/package/@ckeditor/ckeditor5-widget/v/45.0.0): v44.3.0 => v45.0.0
* [@ckeditor/ckeditor5-word-count](https://www.npmjs.com/package/@ckeditor/ckeditor5-word-count/v/45.0.0): v44.3.0 => v45.0.0

Other releases:

* [@ckeditor/ckeditor5-ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai/v/45.0.0): v44.3.0 => v45.0.0
* [@ckeditor/ckeditor5-case-change](https://www.npmjs.com/package/@ckeditor/ckeditor5-case-change/v/45.0.0): v44.3.0 => v45.0.0
* [@ckeditor/ckeditor5-collaboration-core](https://www.npmjs.com/package/@ckeditor/ckeditor5-collaboration-core/v/45.0.0): v44.3.0 => v45.0.0
* [@ckeditor/ckeditor5-comments](https://www.npmjs.com/package/@ckeditor/ckeditor5-comments/v/45.0.0): v44.3.0 => v45.0.0
* [@ckeditor/ckeditor5-document-outline](https://www.npmjs.com/package/@ckeditor/ckeditor5-document-outline/v/45.0.0): v44.3.0 => v45.0.0
* [@ckeditor/ckeditor5-export-pdf](https://www.npmjs.com/package/@ckeditor/ckeditor5-export-pdf/v/45.0.0): v44.3.0 => v45.0.0
* [@ckeditor/ckeditor5-export-word](https://www.npmjs.com/package/@ckeditor/ckeditor5-export-word/v/45.0.0): v44.3.0 => v45.0.0
* [@ckeditor/ckeditor5-format-painter](https://www.npmjs.com/package/@ckeditor/ckeditor5-format-painter/v/45.0.0): v44.3.0 => v45.0.0
* [@ckeditor/ckeditor5-import-word](https://www.npmjs.com/package/@ckeditor/ckeditor5-import-word/v/45.0.0): v44.3.0 => v45.0.0
* [@ckeditor/ckeditor5-list-multi-level](https://www.npmjs.com/package/@ckeditor/ckeditor5-list-multi-level/v/45.0.0): v44.3.0 => v45.0.0
* [@ckeditor/ckeditor5-merge-fields](https://www.npmjs.com/package/@ckeditor/ckeditor5-merge-fields/v/45.0.0): v44.3.0 => v45.0.0
* [@ckeditor/ckeditor5-operations-compressor](https://www.npmjs.com/package/@ckeditor/ckeditor5-operations-compressor/v/45.0.0): v44.3.0 => v45.0.0
* [@ckeditor/ckeditor5-pagination](https://www.npmjs.com/package/@ckeditor/ckeditor5-pagination/v/45.0.0): v44.3.0 => v45.0.0
* [@ckeditor/ckeditor5-paste-from-office-enhanced](https://www.npmjs.com/package/@ckeditor/ckeditor5-paste-from-office-enhanced/v/45.0.0): v44.3.0 => v45.0.0
* [@ckeditor/ckeditor5-real-time-collaboration](https://www.npmjs.com/package/@ckeditor/ckeditor5-real-time-collaboration/v/45.0.0): v44.3.0 => v45.0.0
* [@ckeditor/ckeditor5-revision-history](https://www.npmjs.com/package/@ckeditor/ckeditor5-revision-history/v/45.0.0): v44.3.0 => v45.0.0
* [@ckeditor/ckeditor5-slash-command](https://www.npmjs.com/package/@ckeditor/ckeditor5-slash-command/v/45.0.0): v44.3.0 => v45.0.0
* [@ckeditor/ckeditor5-source-editing-enhanced](https://www.npmjs.com/package/@ckeditor/ckeditor5-source-editing-enhanced/v/45.0.0): v44.3.0 => v45.0.0
* [@ckeditor/ckeditor5-template](https://www.npmjs.com/package/@ckeditor/ckeditor5-template/v/45.0.0): v44.3.0 => v45.0.0
* [@ckeditor/ckeditor5-track-changes](https://www.npmjs.com/package/@ckeditor/ckeditor5-track-changes/v/45.0.0): v44.3.0 => v45.0.0
* [@ckeditor/ckeditor5-uploadcare](https://www.npmjs.com/package/@ckeditor/ckeditor5-uploadcare/v/45.0.0): v44.3.0 => v45.0.0
* [ckeditor5-collaboration](https://www.npmjs.com/package/ckeditor5-collaboration/v/45.0.0): v44.3.0 => v45.0.0
* [ckeditor5-premium-features](https://www.npmjs.com/package/ckeditor5-premium-features/v/45.0.0): v44.3.0 => v45.0.0
</details>


## [44.3.0](https://github.com/ckeditor/ckeditor5/compare/v44.2.1...v44.3.0) (March 5, 2025)

We are happy to announce the release of CKEditor 5 v44.3.0.

### Release Highlights

This release brings a couple of minor improvements and bug fixes:

* **Link Decorators:** We fixed the behavior of the multiple manual link decorators that set the `rel` attribute. The fix happened so deep in the engine that we improved the overall performance of the editor slightly as well.
* **Added a new `EmptyBlock` plugin:** From now on, new plugin prevents adding `&nbsp;` to the output data of blocks, works similarly to the [`fillEmptyBlocks`](https://ckeditor.com/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-fillEmptyBlocks) configuration in CKEditor 4.
* **Support for the `<hr>` element in the [General HTML Support](https://ckeditor.com/docs/ckeditor5/latest/features/html/general-html-support.html) plugin enhanced:** attributes of the `<hr>` element are now properly preserved if configuration allows it.
* **Emoji:** We enhanced emoji support for better compatibility with users' older devices.

For more details, see the changelog below.

### MINOR BREAKING CHANGES [ℹ️](https://ckeditor.com/docs/ckeditor5/latest/framework/guides/support/versioning-policy.html#major-and-minor-breaking-changes)

* **[engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine)**: The `ViewConsumable.consumablesFromElement()` is removed and replaced with the `view.Element#_getConsumables()` internal method. You should use `ViewConsumable.createFrom()` to create consumables if needed.
* **[engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine)**: The `ViewElementConsumables` now accepts and outputs only normalized data. The `ViewConsumable` still accepts normalized or non-normalized input.
* **[engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine)**: The `Matcher#match()` and `Matcher#matchAll()` output is now normalized. The `MatchResult#match` now contains normalized data compatible with changes in the `ViewConsumable`.

### Features

* **[engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine)**: Export the `SchemaContext` class from package. Closes [#18003](https://github.com/ckeditor/ckeditor5/issues/18003). ([commit](https://github.com/ckeditor/ckeditor5/commit/4d64fda926e490151ef84eb8dc1c6d86d8eb69ad))
* **[html-support](https://www.npmjs.com/package/@ckeditor/ckeditor5-html-support)**: Added support for the `<hr>` element. Closes [#12973](https://github.com/ckeditor/ckeditor5/issues/12973). ([commit](https://github.com/ckeditor/ckeditor5/commit/d6e50d1317d9290fe14fd8a63ff024888f7a84ee))
* **[html-support](https://www.npmjs.com/package/@ckeditor/ckeditor5-html-support)**: Add the `EmptyBlock` plugin that prevents adding `&nbsp;` to output data. ([commit](https://github.com/ckeditor/ckeditor5/commit/602d4e1fcbe78ce9fd2fa02435995346aaea70eb))

### Bug fixes

* **[collaboration-core](https://www.npmjs.com/package/@ckeditor/ckeditor5-collaboration-core)**: User initials will now be generated based on the words that start with letters, ensuring that only valid alphabetic characters are used in the initials.
* **[comments](https://www.npmjs.com/package/@ckeditor/ckeditor5-comments)**: Annotations will no longer be lost during real-time collaboration when a user removes and immediately reverts (undo) content containing comment markers.
* **[comments](https://www.npmjs.com/package/@ckeditor/ckeditor5-comments)**: The editor will no longer crash when one user removes content containing a comment that another user is editing.
* **[engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine)**: The link `[rel]` attribute will now allow mixing manual link decorators for the same attribute, as it will be now handled as a token list. Closes [#13985](https://github.com/ckeditor/ckeditor5/issues/13985), Closes [#6436](https://github.com/ckeditor/ckeditor5/issues/6436). ([commit](https://github.com/ckeditor/ckeditor5/commit/3107be3d8485898621796b1e85d18472a8d64bb3))
* **[mention](https://www.npmjs.com/package/@ckeditor/ckeditor5-mention)**: Mention should not be wrapped with an additional `<span>` when GHS is enabled. Closes [#15329](https://github.com/ckeditor/ckeditor5/issues/15329). ([commit](https://github.com/ckeditor/ckeditor5/commit/3107be3d8485898621796b1e85d18472a8d64bb3))
* **[ui](https://www.npmjs.com/package/@ckeditor/ckeditor5-ui)**: Fixed an issue where the first selected color was applied instead of the second selected color when using the font color picker for the first time after loading the page. Closes [#17069](https://github.com/ckeditor/ckeditor5/issues/17069). ([commit](https://github.com/ckeditor/ckeditor5/commit/a0b28c0dcd0d324ea33ee6fd55989fa95a079437))
* **[typing](https://www.npmjs.com/package/@ckeditor/ckeditor5-typing)**: Removing a nested editable does not remove an entire widget when the selection is placed at the beginning of that element. ([commit](https://github.com/ckeditor/ckeditor5/commit/1ef174c225aa9564472053713fe0933c49b35441))

### Other changes

* **[clipboard](https://www.npmjs.com/package/@ckeditor/ckeditor5-clipboard)**: Export the `viewToPlainText()` function. Closes [#17950](https://github.com/ckeditor/ckeditor5/issues/17950). ([commit](https://github.com/ckeditor/ckeditor5/commit/5616486488353c9f872b3a5e52d4cd4af2de08fc))
* **[collaboration-core](https://www.npmjs.com/package/@ckeditor/ckeditor5-collaboration-core)**: Introduced a new configuration option: `config.users.getInitialsCallback`. It allows providing a custom callback function for user initials generation.
* **[emoji](https://www.npmjs.com/package/@ckeditor/ckeditor5-emoji)**: Improved emoji support by expanding the range of versions compatible with users' devices. Closes [#18014](https://github.com/ckeditor/ckeditor5/issues/18014). ([commit](https://github.com/ckeditor/ckeditor5/commit/73193609a468a256e3b7bf300311ba94dad74cb0))
* **[emoji](https://www.npmjs.com/package/@ckeditor/ckeditor5-emoji)**: Icons representing categories in the grid come from the same Unicode version to avoid rendering the non-supported ones. ([commit](https://github.com/ckeditor/ckeditor5/commit/73193609a468a256e3b7bf300311ba94dad74cb0))
* **[emoji](https://www.npmjs.com/package/@ckeditor/ckeditor5-emoji)**: Introduced the `emoji.useCustomFont` option to disable the filtering mechanism. Closes [#18029](https://github.com/ckeditor/ckeditor5/issues/18029). ([commit](https://github.com/ckeditor/ckeditor5/commit/1bff10827168e85766835ad9e5776929ddd4ce08))
* **[engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine)**: The whitespaces around a block filler (`&nbsp;`) are ignored while loading editor data. ([commit](https://github.com/ckeditor/ckeditor5/commit/602d4e1fcbe78ce9fd2fa02435995346aaea70eb))

### Released packages

Check out the [Versioning policy](https://ckeditor.com/docs/ckeditor5/latest/framework/guides/support/versioning-policy.html) guide for more information.

<details>
<summary>Released packages (summary)</summary>

Minor releases (contain minor breaking changes):

* [@ckeditor/ckeditor5-engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine/v/44.3.0): v44.2.1 => v44.3.0

Releases containing new features:

* [@ckeditor/ckeditor5-html-support](https://www.npmjs.com/package/@ckeditor/ckeditor5-html-support/v/44.3.0): v44.2.1 => v44.3.0
* [@ckeditor/ckeditor5-list](https://www.npmjs.com/package/@ckeditor/ckeditor5-list/v/44.3.0): v44.2.1 => v44.3.0
* [@ckeditor/ckeditor5-table](https://www.npmjs.com/package/@ckeditor/ckeditor5-table/v/44.3.0): v44.2.1 => v44.3.0

Other releases:

* [@ckeditor/ckeditor5-adapter-ckfinder](https://www.npmjs.com/package/@ckeditor/ckeditor5-adapter-ckfinder/v/44.3.0): v44.2.1 => v44.3.0
* [@ckeditor/ckeditor5-ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai/v/44.3.0): v44.2.1 => v44.3.0
* [@ckeditor/ckeditor5-alignment](https://www.npmjs.com/package/@ckeditor/ckeditor5-alignment/v/44.3.0): v44.2.1 => v44.3.0
* [@ckeditor/ckeditor5-autoformat](https://www.npmjs.com/package/@ckeditor/ckeditor5-autoformat/v/44.3.0): v44.2.1 => v44.3.0
* [@ckeditor/ckeditor5-autosave](https://www.npmjs.com/package/@ckeditor/ckeditor5-autosave/v/44.3.0): v44.2.1 => v44.3.0
* [@ckeditor/ckeditor5-basic-styles](https://www.npmjs.com/package/@ckeditor/ckeditor5-basic-styles/v/44.3.0): v44.2.1 => v44.3.0
* [@ckeditor/ckeditor5-block-quote](https://www.npmjs.com/package/@ckeditor/ckeditor5-block-quote/v/44.3.0): v44.2.1 => v44.3.0
* [@ckeditor/ckeditor5-bookmark](https://www.npmjs.com/package/@ckeditor/ckeditor5-bookmark/v/44.3.0): v44.2.1 => v44.3.0
* [@ckeditor/ckeditor5-build-balloon](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-balloon/v/44.3.0): v44.2.1 => v44.3.0
* [@ckeditor/ckeditor5-build-balloon-block](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-balloon-block/v/44.3.0): v44.2.1 => v44.3.0
* [@ckeditor/ckeditor5-build-classic](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-classic/v/44.3.0): v44.2.1 => v44.3.0
* [@ckeditor/ckeditor5-build-decoupled-document](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-decoupled-document/v/44.3.0): v44.2.1 => v44.3.0
* [@ckeditor/ckeditor5-build-inline](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-inline/v/44.3.0): v44.2.1 => v44.3.0
* [@ckeditor/ckeditor5-build-multi-root](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-multi-root/v/44.3.0): v44.2.1 => v44.3.0
* [@ckeditor/ckeditor5-case-change](https://www.npmjs.com/package/@ckeditor/ckeditor5-case-change/v/44.3.0): v44.2.1 => v44.3.0
* [@ckeditor/ckeditor5-ckbox](https://www.npmjs.com/package/@ckeditor/ckeditor5-ckbox/v/44.3.0): v44.2.1 => v44.3.0
* [@ckeditor/ckeditor5-ckfinder](https://www.npmjs.com/package/@ckeditor/ckeditor5-ckfinder/v/44.3.0): v44.2.1 => v44.3.0
* [@ckeditor/ckeditor5-clipboard](https://www.npmjs.com/package/@ckeditor/ckeditor5-clipboard/v/44.3.0): v44.2.1 => v44.3.0
* [@ckeditor/ckeditor5-cloud-services](https://www.npmjs.com/package/@ckeditor/ckeditor5-cloud-services/v/44.3.0): v44.2.1 => v44.3.0
* [@ckeditor/ckeditor5-code-block](https://www.npmjs.com/package/@ckeditor/ckeditor5-code-block/v/44.3.0): v44.2.1 => v44.3.0
* [@ckeditor/ckeditor5-collaboration-core](https://www.npmjs.com/package/@ckeditor/ckeditor5-collaboration-core/v/44.3.0): v44.2.1 => v44.3.0
* [@ckeditor/ckeditor5-comments](https://www.npmjs.com/package/@ckeditor/ckeditor5-comments/v/44.3.0): v44.2.1 => v44.3.0
* [@ckeditor/ckeditor5-core](https://www.npmjs.com/package/@ckeditor/ckeditor5-core/v/44.3.0): v44.2.1 => v44.3.0
* [@ckeditor/ckeditor5-document-outline](https://www.npmjs.com/package/@ckeditor/ckeditor5-document-outline/v/44.3.0): v44.2.1 => v44.3.0
* [@ckeditor/ckeditor5-easy-image](https://www.npmjs.com/package/@ckeditor/ckeditor5-easy-image/v/44.3.0): v44.2.1 => v44.3.0
* [@ckeditor/ckeditor5-editor-balloon](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-balloon/v/44.3.0): v44.2.1 => v44.3.0
* [@ckeditor/ckeditor5-editor-classic](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-classic/v/44.3.0): v44.2.1 => v44.3.0
* [@ckeditor/ckeditor5-editor-decoupled](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-decoupled/v/44.3.0): v44.2.1 => v44.3.0
* [@ckeditor/ckeditor5-editor-inline](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-inline/v/44.3.0): v44.2.1 => v44.3.0
* [@ckeditor/ckeditor5-editor-multi-root](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-multi-root/v/44.3.0): v44.2.1 => v44.3.0
* [@ckeditor/ckeditor5-emoji](https://www.npmjs.com/package/@ckeditor/ckeditor5-emoji/v/44.3.0): v44.2.1 => v44.3.0
* [@ckeditor/ckeditor5-enter](https://www.npmjs.com/package/@ckeditor/ckeditor5-enter/v/44.3.0): v44.2.1 => v44.3.0
* [@ckeditor/ckeditor5-essentials](https://www.npmjs.com/package/@ckeditor/ckeditor5-essentials/v/44.3.0): v44.2.1 => v44.3.0
* [@ckeditor/ckeditor5-export-pdf](https://www.npmjs.com/package/@ckeditor/ckeditor5-export-pdf/v/44.3.0): v44.2.1 => v44.3.0
* [@ckeditor/ckeditor5-export-word](https://www.npmjs.com/package/@ckeditor/ckeditor5-export-word/v/44.3.0): v44.2.1 => v44.3.0
* [@ckeditor/ckeditor5-find-and-replace](https://www.npmjs.com/package/@ckeditor/ckeditor5-find-and-replace/v/44.3.0): v44.2.1 => v44.3.0
* [@ckeditor/ckeditor5-font](https://www.npmjs.com/package/@ckeditor/ckeditor5-font/v/44.3.0): v44.2.1 => v44.3.0
* [@ckeditor/ckeditor5-format-painter](https://www.npmjs.com/package/@ckeditor/ckeditor5-format-painter/v/44.3.0): v44.2.1 => v44.3.0
* [@ckeditor/ckeditor5-heading](https://www.npmjs.com/package/@ckeditor/ckeditor5-heading/v/44.3.0): v44.2.1 => v44.3.0
* [@ckeditor/ckeditor5-highlight](https://www.npmjs.com/package/@ckeditor/ckeditor5-highlight/v/44.3.0): v44.2.1 => v44.3.0
* [@ckeditor/ckeditor5-horizontal-line](https://www.npmjs.com/package/@ckeditor/ckeditor5-horizontal-line/v/44.3.0): v44.2.1 => v44.3.0
* [@ckeditor/ckeditor5-html-embed](https://www.npmjs.com/package/@ckeditor/ckeditor5-html-embed/v/44.3.0): v44.2.1 => v44.3.0
* [@ckeditor/ckeditor5-image](https://www.npmjs.com/package/@ckeditor/ckeditor5-image/v/44.3.0): v44.2.1 => v44.3.0
* [@ckeditor/ckeditor5-import-word](https://www.npmjs.com/package/@ckeditor/ckeditor5-import-word/v/44.3.0): v44.2.1 => v44.3.0
* [@ckeditor/ckeditor5-indent](https://www.npmjs.com/package/@ckeditor/ckeditor5-indent/v/44.3.0): v44.2.1 => v44.3.0
* [@ckeditor/ckeditor5-language](https://www.npmjs.com/package/@ckeditor/ckeditor5-language/v/44.3.0): v44.2.1 => v44.3.0
* [@ckeditor/ckeditor5-link](https://www.npmjs.com/package/@ckeditor/ckeditor5-link/v/44.3.0): v44.2.1 => v44.3.0
* [@ckeditor/ckeditor5-list-multi-level](https://www.npmjs.com/package/@ckeditor/ckeditor5-list-multi-level/v/44.3.0): v44.2.1 => v44.3.0
* [@ckeditor/ckeditor5-markdown-gfm](https://www.npmjs.com/package/@ckeditor/ckeditor5-markdown-gfm/v/44.3.0): v44.2.1 => v44.3.0
* [@ckeditor/ckeditor5-media-embed](https://www.npmjs.com/package/@ckeditor/ckeditor5-media-embed/v/44.3.0): v44.2.1 => v44.3.0
* [@ckeditor/ckeditor5-mention](https://www.npmjs.com/package/@ckeditor/ckeditor5-mention/v/44.3.0): v44.2.1 => v44.3.0
* [@ckeditor/ckeditor5-merge-fields](https://www.npmjs.com/package/@ckeditor/ckeditor5-merge-fields/v/44.3.0): v44.2.1 => v44.3.0
* [@ckeditor/ckeditor5-minimap](https://www.npmjs.com/package/@ckeditor/ckeditor5-minimap/v/44.3.0): v44.2.1 => v44.3.0
* [@ckeditor/ckeditor5-operations-compressor](https://www.npmjs.com/package/@ckeditor/ckeditor5-operations-compressor/v/44.3.0): v44.2.1 => v44.3.0
* [@ckeditor/ckeditor5-page-break](https://www.npmjs.com/package/@ckeditor/ckeditor5-page-break/v/44.3.0): v44.2.1 => v44.3.0
* [@ckeditor/ckeditor5-pagination](https://www.npmjs.com/package/@ckeditor/ckeditor5-pagination/v/44.3.0): v44.2.1 => v44.3.0
* [@ckeditor/ckeditor5-paragraph](https://www.npmjs.com/package/@ckeditor/ckeditor5-paragraph/v/44.3.0): v44.2.1 => v44.3.0
* [@ckeditor/ckeditor5-paste-from-office](https://www.npmjs.com/package/@ckeditor/ckeditor5-paste-from-office/v/44.3.0): v44.2.1 => v44.3.0
* [@ckeditor/ckeditor5-paste-from-office-enhanced](https://www.npmjs.com/package/@ckeditor/ckeditor5-paste-from-office-enhanced/v/44.3.0): v44.2.1 => v44.3.0
* [@ckeditor/ckeditor5-real-time-collaboration](https://www.npmjs.com/package/@ckeditor/ckeditor5-real-time-collaboration/v/44.3.0): v44.2.1 => v44.3.0
* [@ckeditor/ckeditor5-remove-format](https://www.npmjs.com/package/@ckeditor/ckeditor5-remove-format/v/44.3.0): v44.2.1 => v44.3.0
* [@ckeditor/ckeditor5-restricted-editing](https://www.npmjs.com/package/@ckeditor/ckeditor5-restricted-editing/v/44.3.0): v44.2.1 => v44.3.0
* [@ckeditor/ckeditor5-revision-history](https://www.npmjs.com/package/@ckeditor/ckeditor5-revision-history/v/44.3.0): v44.2.1 => v44.3.0
* [@ckeditor/ckeditor5-select-all](https://www.npmjs.com/package/@ckeditor/ckeditor5-select-all/v/44.3.0): v44.2.1 => v44.3.0
* [@ckeditor/ckeditor5-show-blocks](https://www.npmjs.com/package/@ckeditor/ckeditor5-show-blocks/v/44.3.0): v44.2.1 => v44.3.0
* [@ckeditor/ckeditor5-slash-command](https://www.npmjs.com/package/@ckeditor/ckeditor5-slash-command/v/44.3.0): v44.2.1 => v44.3.0
* [@ckeditor/ckeditor5-source-editing](https://www.npmjs.com/package/@ckeditor/ckeditor5-source-editing/v/44.3.0): v44.2.1 => v44.3.0
* [@ckeditor/ckeditor5-source-editing-enhanced](https://www.npmjs.com/package/@ckeditor/ckeditor5-source-editing-enhanced/v/44.3.0): v44.2.1 => v44.3.0
* [@ckeditor/ckeditor5-special-characters](https://www.npmjs.com/package/@ckeditor/ckeditor5-special-characters/v/44.3.0): v44.2.1 => v44.3.0
* [@ckeditor/ckeditor5-style](https://www.npmjs.com/package/@ckeditor/ckeditor5-style/v/44.3.0): v44.2.1 => v44.3.0
* [@ckeditor/ckeditor5-template](https://www.npmjs.com/package/@ckeditor/ckeditor5-template/v/44.3.0): v44.2.1 => v44.3.0
* [@ckeditor/ckeditor5-theme-lark](https://www.npmjs.com/package/@ckeditor/ckeditor5-theme-lark/v/44.3.0): v44.2.1 => v44.3.0
* [@ckeditor/ckeditor5-track-changes](https://www.npmjs.com/package/@ckeditor/ckeditor5-track-changes/v/44.3.0): v44.2.1 => v44.3.0
* [@ckeditor/ckeditor5-typing](https://www.npmjs.com/package/@ckeditor/ckeditor5-typing/v/44.3.0): v44.2.1 => v44.3.0
* [@ckeditor/ckeditor5-ui](https://www.npmjs.com/package/@ckeditor/ckeditor5-ui/v/44.3.0): v44.2.1 => v44.3.0
* [@ckeditor/ckeditor5-undo](https://www.npmjs.com/package/@ckeditor/ckeditor5-undo/v/44.3.0): v44.2.1 => v44.3.0
* [@ckeditor/ckeditor5-upload](https://www.npmjs.com/package/@ckeditor/ckeditor5-upload/v/44.3.0): v44.2.1 => v44.3.0
* [@ckeditor/ckeditor5-uploadcare](https://www.npmjs.com/package/@ckeditor/ckeditor5-uploadcare/v/44.3.0): v44.2.1 => v44.3.0
* [@ckeditor/ckeditor5-utils](https://www.npmjs.com/package/@ckeditor/ckeditor5-utils/v/44.3.0): v44.2.1 => v44.3.0
* [@ckeditor/ckeditor5-watchdog](https://www.npmjs.com/package/@ckeditor/ckeditor5-watchdog/v/44.3.0): v44.2.1 => v44.3.0
* [@ckeditor/ckeditor5-widget](https://www.npmjs.com/package/@ckeditor/ckeditor5-widget/v/44.3.0): v44.2.1 => v44.3.0
* [@ckeditor/ckeditor5-word-count](https://www.npmjs.com/package/@ckeditor/ckeditor5-word-count/v/44.3.0): v44.2.1 => v44.3.0
* [ckeditor5-collaboration](https://www.npmjs.com/package/ckeditor5-collaboration/v/44.3.0): v44.2.1 => v44.3.0
* [ckeditor5-premium-features](https://www.npmjs.com/package/ckeditor5-premium-features/v/44.3.0): v44.2.1 => v44.3.0
</details>

---

To see all releases, visit the [release page](https://github.com/ckeditor/ckeditor5/releases).
