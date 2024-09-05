Changelog
=========

## [43.1.0](https://github.com/ckeditor/ckeditor5/compare/v43.0.0...v43.1.0) (September 5, 2024)

We are happy to announce the release of CKEditor 5 v43.1.0.

### Release highlights

This release includes important bug fixes and enhancements for the editor:

* **Block merge fields**: In contrast to regular, inline merge fields, the block merge fields are designed to represent complex, block-level structures, such as a dynamically generated table, a row of products, or a personalized call-to-action segment. Block merge fields are supposed to be replaced by arbitrary HTML data when the document template is post-processed or exported to a PDF or Word file.
* **Nested dropdown menus**: this release introduces a new UI component: nested dropdown menus. They can be used by feature developers to easily provide an advanced user interface where UI elements are organized into a nested menu structure.
* **Customizable accessible label**: You can now configure the label for the accessible editable area through the editor settings, ensuring it fits your system’s needs.
* **Improved table and cell border controls**: It is now easier to manage both table and cell borders. The table user interface now clearly indicates the default border settings, allowing you to set “no borders” (`None`) for tables and cells without any additional configuration.

  ⚠️ In some cases this update may lead to data changes in the tables’ HTML markup when the editor loads them. However, visually nothing will change, and the experience will be the same.

The full list of enhancements can be found below.

### MINOR BREAKING CHANGES [ℹ️](https://ckeditor.com/docs/ckeditor5/latest/framework/guides/support/versioning-policy.html#major-and-minor-breaking-changes)

* **Reverted `config.sanitizeHtml`.** In v43.0.0 we made a decision to move `config.htmlEmbed.sanitizeHtml` to a top-level property `config.sanitizeHtml`. However, we realized that it was a wrong decision to expose such a sensitive property in a top-level configuration property. Starting with v43.1.0 you should again use `config.htmlEmbed.sanitizeHtml` and/or `config.mergeFields.sanitizeHtml`. The editor will throw an error if `config.sanitizeHtml` is used. See the {@link  
updating/update-to-43#reverted-recently-introduced-configsanitizehtml migration guide} for additional context behind this decision.
* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai)**: The structure and presentation of the list of AI commands in the toolbar have changed (a flat filtered list is now a nested menu). Additionally, if your integration customizes this user interface, please ensure your integration code is up-to-date.
* **[ui](https://www.npmjs.com/package/@ckeditor/ckeditor5-ui)**: The default `[aria-label]` provided by `InlineEditableUIView` is now `'Rich Text Editor. Editing area: [root name]'` (previously: `'Editor editing area: [root name]'`). You can use the `options.label` constructor property to adjust the label.

### Features

* **[comments](https://www.npmjs.com/package/@ckeditor/ckeditor5-comments)**: Added `[data-author-id]` to suggestion and comment markers in editing for easier integration and styling.
* **[media-embed](https://www.npmjs.com/package/@ckeditor/ckeditor5-media-embed)**: Added support for new Twitter domain (`x.com`) and Instagram Reels. Closes [#16435](https://github.com/ckeditor/ckeditor5/issues/16435). ([commit](https://github.com/ckeditor/ckeditor5/commit/f1f049e525890ae256951ca36c296872b21277f4))
* **[merge-fields](https://www.npmjs.com/package/@ckeditor/ckeditor5-merge-fields)**: Introduced block merge fields. They are a new type of merge fields which are treated as block content in the editor editing area.
* **[track-changes](https://www.npmjs.com/package/@ckeditor/ckeditor5-track-changes)**: Added `[data-author-id]` to suggestion and comment markers in editing for easier integration and styling.
* **[ui](https://www.npmjs.com/package/@ckeditor/ckeditor5-ui)**: Introduced nested menu component for dropdowns. Closes [#6399](https://github.com/ckeditor/ckeditor5/issues/6399). ([commit](https://github.com/ckeditor/ckeditor5/commit/4a43c56a58b5e3d82555f7fac98e7e1c0fa8da89))
* **[ui](https://www.npmjs.com/package/@ckeditor/ckeditor5-ui)**: Added support for the balloon toolbar in the multi-root editor. Closes [#14803](https://github.com/ckeditor/ckeditor5/issues/14803). ([commit](https://github.com/ckeditor/ckeditor5/commit/70e3a0457e67250b2bacf21ebbb428912c986f0d))
* Allowed to configure the accessible editable area label via the `config.label` property. Closes [#15208](https://github.com/ckeditor/ckeditor5/issues/15208), [#11863](https://github.com/ckeditor/ckeditor5/issues/11863), [#9731](https://github.com/ckeditor/ckeditor5/issues/9731). ([commit](https://github.com/ckeditor/ckeditor5/commit/b50ddbbfbf0a697f450a040006d82374695165b9))

### Bug fixes

* **[cloud-services](https://www.npmjs.com/package/@ckeditor/ckeditor5-cloud-services)**: The refreshing mechanism (from the `Token` class) should retry after a failure to limit the chance of the user getting disconnected and data loss in real-time collaboration. ([commit](https://github.com/ckeditor/ckeditor5/commit/0154d4cfe6ee5dc54001dd30c12ab308d1ddcefc))
* **[comments](https://www.npmjs.com/package/@ckeditor/ckeditor5-comments)**: The `TrackChangesData#getDataWithAcceptedSuggestions()` method will no longer throw errors when there are suggestions containing multi-range comments in tables.
* **[document-outline](https://www.npmjs.com/package/@ckeditor/ckeditor5-document-outline)**: Editor no longer crashes during initialization when the `TableOfContents` and `ImageBlock` plugins are enabled. Closes [ckeditor/ckeditor5#16915](https://github.com/ckeditor/ckeditor5/issues/16915).
* **[editor-classic](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-classic)**: The widget toolbar no longer covers editor's sticky toolbar when scrolling. Closes [#15744](https://github.com/ckeditor/ckeditor5/issues/15744). ([commit](https://github.com/ckeditor/ckeditor5/commit/e58a5c6cd2670602b29390d949dcf82b96d855d0))
* **[editor-multi-root](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-multi-root)**: The selection is no longer lost while clicking an editable containing only one block element. Closes [#16806](https://github.com/ckeditor/ckeditor5/issues/16806). ([commit](https://github.com/ckeditor/ckeditor5/commit/06f8520d5059e934617163a2376ab2e45bdea452))
* **[engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine)**: Prevent from editor crashes when trying to style a long paragraph. Closes [#16819](https://github.com/ckeditor/ckeditor5/issues/16819). ([commit](https://github.com/ckeditor/ckeditor5/commit/248d64c61365354291c36f74169ff0ab74e28e4b))
* **[html-support](https://www.npmjs.com/package/@ckeditor/ckeditor5-html-support)**: The `<hgroup>` and `<summary>` elements should work with the source editing feature. Closes [#16947](https://github.com/ckeditor/ckeditor5/issues/16947). ([commit](https://github.com/ckeditor/ckeditor5/commit/e691409a1839ae58eb497c584ae80ab4878c580e))
* **[list](https://www.npmjs.com/package/@ckeditor/ckeditor5-list)**: A to-do list should preserve the state of the checked items on the data load. Closes [#15602](https://github.com/ckeditor/ckeditor5/issues/15602). ([commit](https://github.com/ckeditor/ckeditor5/commit/63165898fa414ba6b0b90af675de2cc8ad770470))
* **[table](https://www.npmjs.com/package/@ckeditor/ckeditor5-table)**: Changed default table and table cell properties to match the content styles. It fixes a problem with setting `[border=none]` on the table. Closes [#6841](https://github.com/ckeditor/ckeditor5/issues/6841). ([commit](https://github.com/ckeditor/ckeditor5/commit/dde1b50e21873d7a1df3cd769227fcdbc17531e4))
* **[table](https://www.npmjs.com/package/@ckeditor/ckeditor5-table)**: Larger tables are no longer truncated in print mode. Closes [#16856](https://github.com/ckeditor/ckeditor5/issues/16856). ([commit](https://github.com/ckeditor/ckeditor5/commit/c0a2a8cf685cd94105ce9123f34cb8ec9b1be68f))
* **[track-changes](https://www.npmjs.com/package/@ckeditor/ckeditor5-track-changes)**: The `TrackChangesData#getDataWithAcceptedSuggestions()` and `TrackChangesData#getDataWithDiscardedSuggestions()` methods will no longer throw errors when used in asynchronous load and save integration type.
* **[ui](https://www.npmjs.com/package/@ckeditor/ckeditor5-ui)**: Nested menus in the menu bar and dropdowns should not get their panels focused when the main button is clicked. Closes [#16857](https://github.com/ckeditor/ckeditor5/issues/16857). ([commit](https://github.com/ckeditor/ckeditor5/commit/2773c1c6ce832c8c56e1060f224077f585a3d871))
* **[ui](https://www.npmjs.com/package/@ckeditor/ckeditor5-ui)**: Restored the ability to pin balloons to text nodes in the DOM tree. Closes [#16958](https://github.com/ckeditor/ckeditor5/issues/16958) [#16889](https://github.com/ckeditor/ckeditor5/issues/16889). ([commit](https://github.com/ckeditor/ckeditor5/commit/2d7480274f9ad53791b1c57a46d43c86530b238d))
* **[ui](https://www.npmjs.com/package/@ckeditor/ckeditor5-ui)**: The focus outline should remain visible upon closing a menu bar using the <kbd>Esc</kbd> key during keyboard navigation. Closes [#16719](https://github.com/ckeditor/ckeditor5/issues/16719). ([commit](https://github.com/ckeditor/ckeditor5/commit/9edf0aa04b79c37626004436fc68a149fd95cf63))
* **[ui](https://www.npmjs.com/package/@ckeditor/ckeditor5-ui)**: Balloon Editor toolbar no longer sticks out of the limiter element while scrolling. Closes [#17002](https://github.com/ckeditor/ckeditor5/issues/17002). ([commit](https://github.com/ckeditor/ckeditor5/commit/bb149b0940bb165a9960b2cc20197ec7582bc208))

### Other changes

* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai)**: The AI Assistant pre-defined commands toolbar dropdown will now use a new nested menu component instead of the flat list component.
* **[comments](https://www.npmjs.com/package/@ckeditor/ckeditor5-comments)**: Moved <kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>E</kbd> and <kbd>Esc</kbd> key handling code from individual features to the `Annotations` plugin to simplify the logic.
* **[core](https://www.npmjs.com/package/@ckeditor/ckeditor5-core)**: Reverted recent change to move `config.htmlEmbed.sanitizeHtml` to a top-level config property (`config.sanitizeHtml`). `config.sanitizeHtml` is no longer available and using it will throw an error.
* **[html-embed](https://www.npmjs.com/package/@ckeditor/ckeditor5-html-embed)**: Reverted recent change to move `config.htmlEmbed.sanitizeHtml` to a top-level config property (`config.sanitizeHtml`). Starting from v43.1.0 `config.htmlEmbed.sanitizeHtml` is no longer deprecated.
* **[merge-fields](https://www.npmjs.com/package/@ckeditor/ckeditor5-merge-fields)**: Introduced `config.mergeFields.sanitizeHtml` config property. Use it instead of `config.sanitizeHtml`. `config.sanitizeHtml` is no longer available and using it will throw an error.
* **[track-changes](https://www.npmjs.com/package/@ckeditor/ckeditor5-track-changes)**: Moved <kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>E</kbd> and <kbd>Esc</kbd> key handling code from individual features to the `Annotations` plugin to simplify the logic.
* **[typing](https://www.npmjs.com/package/@ckeditor/ckeditor5-typing)**: The package exports now the `TextTransformationConfig` type. ([commit](https://github.com/ckeditor/ckeditor5/commit/0d8adcef6eaf79fd35cc2647159ceeedd9e1a0d8))
* Updated translations. ([commit](https://github.com/ckeditor/ckeditor5/commit/c394fd71229002ff813a16fdb78ec1e9ca6985da))

### Released packages

Check out the [Versioning policy](https://ckeditor.com/docs/ckeditor5/latest/framework/guides/support/versioning-policy.html) guide for more information.

<details>
<summary>Released packages (summary)</summary>

Minor releases (contain minor breaking changes):

* [@ckeditor/ckeditor5-ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai/v/43.1.0): v43.0.0 => v43.1.0
* [@ckeditor/ckeditor5-ui](https://www.npmjs.com/package/@ckeditor/ckeditor5-ui/v/43.1.0): v43.0.0 => v43.1.0

Releases containing new features:

* [@ckeditor/ckeditor5-core](https://www.npmjs.com/package/@ckeditor/ckeditor5-core/v/43.1.0): v43.0.0 => v43.1.0
* [@ckeditor/ckeditor5-editor-balloon](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-balloon/v/43.1.0): v43.0.0 => v43.1.0
* [@ckeditor/ckeditor5-editor-classic](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-classic/v/43.1.0): v43.0.0 => v43.1.0
* [@ckeditor/ckeditor5-editor-decoupled](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-decoupled/v/43.1.0): v43.0.0 => v43.1.0
* [@ckeditor/ckeditor5-editor-inline](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-inline/v/43.1.0): v43.0.0 => v43.1.0
* [@ckeditor/ckeditor5-editor-multi-root](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-multi-root/v/43.1.0): v43.0.0 => v43.1.0
* [@ckeditor/ckeditor5-engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine/v/43.1.0): v43.0.0 => v43.1.0
* [@ckeditor/ckeditor5-media-embed](https://www.npmjs.com/package/@ckeditor/ckeditor5-media-embed/v/43.1.0): v43.0.0 => v43.1.0
* [@ckeditor/ckeditor5-theme-lark](https://www.npmjs.com/package/@ckeditor/ckeditor5-theme-lark/v/43.1.0): v43.0.0 => v43.1.0
* [@ckeditor/ckeditor5-utils](https://www.npmjs.com/package/@ckeditor/ckeditor5-utils/v/43.1.0): v43.0.0 => v43.1.0

Other releases:

* [@ckeditor/ckeditor5-adapter-ckfinder](https://www.npmjs.com/package/@ckeditor/ckeditor5-adapter-ckfinder/v/43.1.0): v43.0.0 => v43.1.0
* [@ckeditor/ckeditor5-alignment](https://www.npmjs.com/package/@ckeditor/ckeditor5-alignment/v/43.1.0): v43.0.0 => v43.1.0
* [@ckeditor/ckeditor5-autoformat](https://www.npmjs.com/package/@ckeditor/ckeditor5-autoformat/v/43.1.0): v43.0.0 => v43.1.0
* [@ckeditor/ckeditor5-autosave](https://www.npmjs.com/package/@ckeditor/ckeditor5-autosave/v/43.1.0): v43.0.0 => v43.1.0
* [@ckeditor/ckeditor5-basic-styles](https://www.npmjs.com/package/@ckeditor/ckeditor5-basic-styles/v/43.1.0): v43.0.0 => v43.1.0
* [@ckeditor/ckeditor5-block-quote](https://www.npmjs.com/package/@ckeditor/ckeditor5-block-quote/v/43.1.0): v43.0.0 => v43.1.0
* [@ckeditor/ckeditor5-build-balloon](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-balloon/v/43.1.0): v43.0.0 => v43.1.0
* [@ckeditor/ckeditor5-build-balloon-block](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-balloon-block/v/43.1.0): v43.0.0 => v43.1.0
* [@ckeditor/ckeditor5-build-classic](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-classic/v/43.1.0): v43.0.0 => v43.1.0
* [@ckeditor/ckeditor5-build-decoupled-document](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-decoupled-document/v/43.1.0): v43.0.0 => v43.1.0
* [@ckeditor/ckeditor5-build-inline](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-inline/v/43.1.0): v43.0.0 => v43.1.0
* [@ckeditor/ckeditor5-build-multi-root](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-multi-root/v/43.1.0): v43.0.0 => v43.1.0
* [@ckeditor/ckeditor5-case-change](https://www.npmjs.com/package/@ckeditor/ckeditor5-case-change/v/43.1.0): v43.0.0 => v43.1.0
* [@ckeditor/ckeditor5-ckbox](https://www.npmjs.com/package/@ckeditor/ckeditor5-ckbox/v/43.1.0): v43.0.0 => v43.1.0
* [@ckeditor/ckeditor5-ckfinder](https://www.npmjs.com/package/@ckeditor/ckeditor5-ckfinder/v/43.1.0): v43.0.0 => v43.1.0
* [@ckeditor/ckeditor5-clipboard](https://www.npmjs.com/package/@ckeditor/ckeditor5-clipboard/v/43.1.0): v43.0.0 => v43.1.0
* [@ckeditor/ckeditor5-cloud-services](https://www.npmjs.com/package/@ckeditor/ckeditor5-cloud-services/v/43.1.0): v43.0.0 => v43.1.0
* [@ckeditor/ckeditor5-code-block](https://www.npmjs.com/package/@ckeditor/ckeditor5-code-block/v/43.1.0): v43.0.0 => v43.1.0
* [@ckeditor/ckeditor5-collaboration-core](https://www.npmjs.com/package/@ckeditor/ckeditor5-collaboration-core/v/43.1.0): v43.0.0 => v43.1.0
* [@ckeditor/ckeditor5-comments](https://www.npmjs.com/package/@ckeditor/ckeditor5-comments/v/43.1.0): v43.0.0 => v43.1.0
* [@ckeditor/ckeditor5-document-outline](https://www.npmjs.com/package/@ckeditor/ckeditor5-document-outline/v/43.1.0): v43.0.0 => v43.1.0
* [@ckeditor/ckeditor5-easy-image](https://www.npmjs.com/package/@ckeditor/ckeditor5-easy-image/v/43.1.0): v43.0.0 => v43.1.0
* [@ckeditor/ckeditor5-enter](https://www.npmjs.com/package/@ckeditor/ckeditor5-enter/v/43.1.0): v43.0.0 => v43.1.0
* [@ckeditor/ckeditor5-essentials](https://www.npmjs.com/package/@ckeditor/ckeditor5-essentials/v/43.1.0): v43.0.0 => v43.1.0
* [@ckeditor/ckeditor5-export-pdf](https://www.npmjs.com/package/@ckeditor/ckeditor5-export-pdf/v/43.1.0): v43.0.0 => v43.1.0
* [@ckeditor/ckeditor5-export-word](https://www.npmjs.com/package/@ckeditor/ckeditor5-export-word/v/43.1.0): v43.0.0 => v43.1.0
* [@ckeditor/ckeditor5-find-and-replace](https://www.npmjs.com/package/@ckeditor/ckeditor5-find-and-replace/v/43.1.0): v43.0.0 => v43.1.0
* [@ckeditor/ckeditor5-font](https://www.npmjs.com/package/@ckeditor/ckeditor5-font/v/43.1.0): v43.0.0 => v43.1.0
* [@ckeditor/ckeditor5-format-painter](https://www.npmjs.com/package/@ckeditor/ckeditor5-format-painter/v/43.1.0): v43.0.0 => v43.1.0
* [@ckeditor/ckeditor5-heading](https://www.npmjs.com/package/@ckeditor/ckeditor5-heading/v/43.1.0): v43.0.0 => v43.1.0
* [@ckeditor/ckeditor5-highlight](https://www.npmjs.com/package/@ckeditor/ckeditor5-highlight/v/43.1.0): v43.0.0 => v43.1.0
* [@ckeditor/ckeditor5-horizontal-line](https://www.npmjs.com/package/@ckeditor/ckeditor5-horizontal-line/v/43.1.0): v43.0.0 => v43.1.0
* [@ckeditor/ckeditor5-html-embed](https://www.npmjs.com/package/@ckeditor/ckeditor5-html-embed/v/43.1.0): v43.0.0 => v43.1.0
* [@ckeditor/ckeditor5-html-support](https://www.npmjs.com/package/@ckeditor/ckeditor5-html-support/v/43.1.0): v43.0.0 => v43.1.0
* [@ckeditor/ckeditor5-image](https://www.npmjs.com/package/@ckeditor/ckeditor5-image/v/43.1.0): v43.0.0 => v43.1.0
* [@ckeditor/ckeditor5-import-word](https://www.npmjs.com/package/@ckeditor/ckeditor5-import-word/v/43.1.0): v43.0.0 => v43.1.0
* [@ckeditor/ckeditor5-indent](https://www.npmjs.com/package/@ckeditor/ckeditor5-indent/v/43.1.0): v43.0.0 => v43.1.0
* [@ckeditor/ckeditor5-language](https://www.npmjs.com/package/@ckeditor/ckeditor5-language/v/43.1.0): v43.0.0 => v43.1.0
* [@ckeditor/ckeditor5-link](https://www.npmjs.com/package/@ckeditor/ckeditor5-link/v/43.1.0): v43.0.0 => v43.1.0
* [@ckeditor/ckeditor5-list](https://www.npmjs.com/package/@ckeditor/ckeditor5-list/v/43.1.0): v43.0.0 => v43.1.0
* [@ckeditor/ckeditor5-list-multi-level](https://www.npmjs.com/package/@ckeditor/ckeditor5-list-multi-level/v/43.1.0): v43.0.0 => v43.1.0
* [@ckeditor/ckeditor5-markdown-gfm](https://www.npmjs.com/package/@ckeditor/ckeditor5-markdown-gfm/v/43.1.0): v43.0.0 => v43.1.0
* [@ckeditor/ckeditor5-mention](https://www.npmjs.com/package/@ckeditor/ckeditor5-mention/v/43.1.0): v43.0.0 => v43.1.0
* [@ckeditor/ckeditor5-merge-fields](https://www.npmjs.com/package/@ckeditor/ckeditor5-merge-fields/v/43.1.0): v43.0.0 => v43.1.0
* [@ckeditor/ckeditor5-minimap](https://www.npmjs.com/package/@ckeditor/ckeditor5-minimap/v/43.1.0): v43.0.0 => v43.1.0
* [@ckeditor/ckeditor5-operations-compressor](https://www.npmjs.com/package/@ckeditor/ckeditor5-operations-compressor/v/43.1.0): v43.0.0 => v43.1.0
* [@ckeditor/ckeditor5-page-break](https://www.npmjs.com/package/@ckeditor/ckeditor5-page-break/v/43.1.0): v43.0.0 => v43.1.0
* [@ckeditor/ckeditor5-pagination](https://www.npmjs.com/package/@ckeditor/ckeditor5-pagination/v/43.1.0): v43.0.0 => v43.1.0
* [@ckeditor/ckeditor5-paragraph](https://www.npmjs.com/package/@ckeditor/ckeditor5-paragraph/v/43.1.0): v43.0.0 => v43.1.0
* [@ckeditor/ckeditor5-paste-from-office](https://www.npmjs.com/package/@ckeditor/ckeditor5-paste-from-office/v/43.1.0): v43.0.0 => v43.1.0
* [@ckeditor/ckeditor5-paste-from-office-enhanced](https://www.npmjs.com/package/@ckeditor/ckeditor5-paste-from-office-enhanced/v/43.1.0): v43.0.0 => v43.1.0
* [@ckeditor/ckeditor5-real-time-collaboration](https://www.npmjs.com/package/@ckeditor/ckeditor5-real-time-collaboration/v/43.1.0): v43.0.0 => v43.1.0
* [@ckeditor/ckeditor5-remove-format](https://www.npmjs.com/package/@ckeditor/ckeditor5-remove-format/v/43.1.0): v43.0.0 => v43.1.0
* [@ckeditor/ckeditor5-restricted-editing](https://www.npmjs.com/package/@ckeditor/ckeditor5-restricted-editing/v/43.1.0): v43.0.0 => v43.1.0
* [@ckeditor/ckeditor5-revision-history](https://www.npmjs.com/package/@ckeditor/ckeditor5-revision-history/v/43.1.0): v43.0.0 => v43.1.0
* [@ckeditor/ckeditor5-select-all](https://www.npmjs.com/package/@ckeditor/ckeditor5-select-all/v/43.1.0): v43.0.0 => v43.1.0
* [@ckeditor/ckeditor5-show-blocks](https://www.npmjs.com/package/@ckeditor/ckeditor5-show-blocks/v/43.1.0): v43.0.0 => v43.1.0
* [@ckeditor/ckeditor5-slash-command](https://www.npmjs.com/package/@ckeditor/ckeditor5-slash-command/v/43.1.0): v43.0.0 => v43.1.0
* [@ckeditor/ckeditor5-source-editing](https://www.npmjs.com/package/@ckeditor/ckeditor5-source-editing/v/43.1.0): v43.0.0 => v43.1.0
* [@ckeditor/ckeditor5-special-characters](https://www.npmjs.com/package/@ckeditor/ckeditor5-special-characters/v/43.1.0): v43.0.0 => v43.1.0
* [@ckeditor/ckeditor5-style](https://www.npmjs.com/package/@ckeditor/ckeditor5-style/v/43.1.0): v43.0.0 => v43.1.0
* [@ckeditor/ckeditor5-table](https://www.npmjs.com/package/@ckeditor/ckeditor5-table/v/43.1.0): v43.0.0 => v43.1.0
* [@ckeditor/ckeditor5-template](https://www.npmjs.com/package/@ckeditor/ckeditor5-template/v/43.1.0): v43.0.0 => v43.1.0
* [@ckeditor/ckeditor5-track-changes](https://www.npmjs.com/package/@ckeditor/ckeditor5-track-changes/v/43.1.0): v43.0.0 => v43.1.0
* [@ckeditor/ckeditor5-typing](https://www.npmjs.com/package/@ckeditor/ckeditor5-typing/v/43.1.0): v43.0.0 => v43.1.0
* [@ckeditor/ckeditor5-undo](https://www.npmjs.com/package/@ckeditor/ckeditor5-undo/v/43.1.0): v43.0.0 => v43.1.0
* [@ckeditor/ckeditor5-upload](https://www.npmjs.com/package/@ckeditor/ckeditor5-upload/v/43.1.0): v43.0.0 => v43.1.0
* [@ckeditor/ckeditor5-watchdog](https://www.npmjs.com/package/@ckeditor/ckeditor5-watchdog/v/43.1.0): v43.0.0 => v43.1.0
* [@ckeditor/ckeditor5-widget](https://www.npmjs.com/package/@ckeditor/ckeditor5-widget/v/43.1.0): v43.0.0 => v43.1.0
* [@ckeditor/ckeditor5-word-count](https://www.npmjs.com/package/@ckeditor/ckeditor5-word-count/v/43.1.0): v43.0.0 => v43.1.0
* [ckeditor5-collaboration](https://www.npmjs.com/package/ckeditor5-collaboration/v/43.1.0): v43.0.0 => v43.1.0
* [ckeditor5-premium-features](https://www.npmjs.com/package/ckeditor5-premium-features/v/43.1.0): v43.0.0 => v43.1.0
</details>


## [43.0.0](https://github.com/ckeditor/ckeditor5/compare/v42.0.2...v43.0.0) (August 7, 2024)

We are happy to announce the release of CKEditor 5 v43.0.0.

### Release highlights

#### Merge fields

The new [merge fields feature](https://ckeditor.com/docs/ckeditor5/latest/features/merge-fields.html) is a game-changer for creating document templates and other kinds of personalized or dynamic content. Thanks to this feature, you can insert placeholders into your content, indicating where actual values should go. These places are marked in the final content in a distinctive way, making it easy to later process the template and fill it with the actual values. The feature supports a preview mode too - you can define preview data sets, and see how the content will look like when real values are used directly in the editor. The plugin is highly customizable to fit various applications and scenarios. Finally, merge fields are fully integrated with our Export to Word, Export to PDF, and Import from Word features, both when they are used from the editor and via REST API.

We are extremely happy to share with you this highly demanded feature, and we cannot wait to listen to your feedback!

Make sure to visit our [builder](https://ckeditor.com/ckeditor-5/builder/) or [documentation](https://ckeditor.com/docs/ckeditor5/latest/features/merge-fields.html) to learn more about the feature.

#### Export to Word V2 as the default version

The V2 version of the [export to Word feature](https://ckeditor.com/docs/ckeditor5/latest/features/converters/export-word.html) introduced significant improvements, optimizations, and fixes. This update enhances the overall performance, making the export process faster and more reliable, especially for large documents. Key improvements include better handling of table borders, automatic detection of Word styles from CSS, and support for more text-related CSS properties, ensuring your documents maintain their intended formatting.

Starting this version, the V2 configuration becomes the default in the `ExportWord` plugin. Make sure to [migrate your configuration](https://ckeditor.com/docs/ckeditor5/latest/updating/guides/update-to-43.html#export-to-word-v2-becomes-the-default) if you are using it.

#### Improved sidebar accessibility and navigation

We have introduced multiple enhancements to make the sidebar more accessible. Among other improvements, you can now use the <kbd>Shift</kbd>+<kbd>Ctrl</kbd>+<kbd>E</kbd> keystroke to move focus from the editor marker to the active annotation. When your comment reply is ready, you can quickly submit it using the new <kbd>Ctrl</kbd>+<kbd>Enter</kbd> shortcut. Also, navigation from one annotation to another is now possible by using arrow keys.

The full lists of keyboard supported actions can be reviewed in our [Accessibility support guide](https://ckeditor.com/docs/ckeditor5/latest/features/accessibility.html#keystrokes-for-interacting-with-annotation-threads-eg-comments-track-changes-suggestions).

#### Important bug fixes and improvements

This release brings notable bug fixes and improvements to enhance your editing experience.

* Several improvements have been made to typing in the editor, especially for Android IME and Safari. On Android, issues like duplicated characters and reverse writing effects have been resolved. In Safari, the reverse typing effect after focus change has been fixed.
* A couple of UI improvements:
	* We replaced the visual indication of the selected option in dropdowns (blue background) with the checkbox marks to better indicate selected options, aligning visual cues across the toolbar and menu bar.
	* All editor types now support the menu bar.
	* Additionally, the special characters UI has been moved from a dropdown to a dialog. This unifies the action between the menu bar and toolbar, and also gives content creators quicker access to the always-on-top dialog.
* We have improved the drawing of page break line algorithm to address the pagination feature issues. We also improved the performance of the plugin.

#### React and Vue integrations updates

We have released new major versions of the React and Vue integrations. In both of them, we have migrated to JavaScript modules (ESM) and rewritten large parts of the codebases to support the latest versions of these frameworks and to follow the latest recommendations for writing the components.

We strongly recommend that you follow the release highlights to update to the latest versions:

* [Release highlights for React integration](https://github.com/ckeditor/ckeditor5-react/releases/tag/v9.0.0).
* [Release highlights for Vue integration](https://github.com/ckeditor/ckeditor5-vue/releases/tag/v7.0.0).

### MAJOR BREAKING CHANGES [ℹ️](https://ckeditor.com/docs/ckeditor5/latest/framework/guides/support/versioning-policy.html#major-and-minor-breaking-changes)

* **[ckeditor5](https://www.npmjs.com/package/ckeditor5)**: Global name for the `ckeditor5` package in the UMD builds has been changed to `CKEDITOR`.
* **[ckeditor5-premium-features](https://www.npmjs.com/package/@ckeditor/ckeditor5-ckeditor5-premium-features)**: Global name for the `ckeditor5-premium-features` package in the UMD builds has been changed to `CKEDITOR_PREMIUM_FEATURES`.
* **[export-word](https://www.npmjs.com/package/@ckeditor/ckeditor5-export-word)**: Export to Word V1 configuration format is deprecated, V2 is set as default. The `exportWord.converterOptions` configuration should be adjusted to new API. See the migration guide.
* **[export-word](https://www.npmjs.com/package/@ckeditor/ckeditor5-export-word)**: The `auto_pagination` configuration option in `exportWord.converterOptions` is set to `false` by default.

### MINOR BREAKING CHANGES [ℹ️](https://ckeditor.com/docs/ckeditor5/latest/framework/guides/support/versioning-policy.html#major-and-minor-breaking-changes)

* **[ckbox](https://www.npmjs.com/package/@ckeditor/ckeditor5-ckbox)**: The `CKBoxUtils#getWorkspaceId()` and `CKBoxUtils#getToken()` methods now return a promise instead of a resolved value.
* **[comments](https://www.npmjs.com/package/@ckeditor/ckeditor5-comments)**: `AnnotationView#focus()` will focus the first view in the `content` collection instead of the view DOM element.
* **[comments](https://www.npmjs.com/package/@ckeditor/ckeditor5-comments)**: `Sidebar#addAnnotation()` will expect the annotation view to meet the `FocusableView` interface (previously any UI `View`).
* **[engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine)**: `Schema` callbacks added through `addChildCheck()` will no longer add event listeners with `high` priority and will no longer stop `checkChild` event. Instead, these callbacks are now handled on `normal` priority, as a part of the default `checkChild()` call. This also means that listeners added to `checkChild` event on `high` priority will fire before any callbacks added by `checkChild()`. Earlier they would fire in registration order. This may impact you if you implemented custom schema callback using both `addChildCheck()` and direct listener to `checkChild` event. All above is also true for `addAttributeCheck()` and `checkAttribute` event and callbacks.
* **[html-embed](https://www.npmjs.com/package/@ckeditor/ckeditor5-html-embed)**: HTML Embed plugin configuration value `sanitizeHtml` was moved from the `htmlEmbed` space to top-level configuration space. `config.htmlEmbed.sanitizeHtml` is now deprecated. It will still be used if it set, however we recommend updating the configuration as this property may be removed in upcoming releases.
* **[real-time-collaboration](https://www.npmjs.com/package/@ckeditor/ckeditor5-real-time-collaboration)**: The size of avatars in the user presence list has been changed, which may affect integrations that depend on their dimensions. In addition, a focus border has been added to these avatars, which extends beyond the editor container. Please refer to the [styling guide](https://ckeditor.com/docs/ckeditor5/latest/features/collaboration/real-time-collaboration/users-in-real-time-collaboration.html#users-presence-list) to learn how to change the look of the list.
* **[real-time-collaboration](https://www.npmjs.com/package/@ckeditor/ckeditor5-real-time-collaboration)**: The collaboration user presence list dropdown now has a conditional `overflow: scroll` style (previously the style was permanent).
* **[special-characters](https://www.npmjs.com/package/@ckeditor/ckeditor5-special-characters)**: Special characters plugin now uses a dialog (instead of a toolbar dropdown).
* **[theme-lark](https://www.npmjs.com/package/@ckeditor/ckeditor5-theme-lark)**: The `--ck-list-button-padding` custom property has been removed from the codebase.
* **[track-changes](https://www.npmjs.com/package/@ckeditor/ckeditor5-track-changes)**: A substantial part of the `SuggestionThreadView` template was moved to a new view `SuggestionView`. It may affect you if you provided customization for suggestions annotations through an extended `SuggestionThreadView` or `BaseSuggestionThreadView` class. Please review updated API documentation for `SuggestionThreadView#getTemplate()` and `SuggestionView#getTemplate()`. You can extend `SuggestionView` the same way as `SuggestionThreadView` and `BaseSuggestionThreadView`, and provide the extended class through the newly added configuration property `TrackChangesConfig#SuggestionView`.
* **[ui](https://www.npmjs.com/package/@ckeditor/ckeditor5-ui)**: We changed styles for "active" items inside menu bar and dropdowns lists. Previously, an active (chosen, enabled, opened, etc.) item was highlighted with a blue background. Now, the active element has a checkmark icon on the left.

### Features

* **[ckbox](https://www.npmjs.com/package/@ckeditor/ckeditor5-ckbox)**: The image upload and edit buttons are now disabled if the user has no permission to upload an asset. ([commit](https://github.com/ckeditor/ckeditor5/commit/5182fdabf47a4db6b15ae80032a241024a50f6c5))
* **[ckbox](https://www.npmjs.com/package/@ckeditor/ckeditor5-ckbox)**: Added more configuration options passed down to the CKBox. Closes [#3695](https://github.com/ckeditor/ckeditor5/issues/3695). ([commit](https://github.com/ckeditor/ckeditor5/commit/6c0145a7ddfe80390b7b2c5a6ee548cd0ab55fa8))
* **[collaboration-core](https://www.npmjs.com/package/@ckeditor/ckeditor5-collaboration-core)**: Introduced the `AriaDescriptionView` class that brings `aria-describedby` functionality to any view.
* **[collaboration-core](https://www.npmjs.com/package/@ckeditor/ckeditor5-collaboration-core)**: Introduced the `LateFocusButtonView` and `LateFocusDropdownButtonView` classes that are specific buttons, for which `focus` event is fired after `mouseup` instead of `mousedown`. This delays all focus-related actions until the button action is performed.
* **[comments](https://www.npmjs.com/package/@ckeditor/ckeditor5-comments)**: Introduced keyboard navigation and screen reader support to the annotations sidebar.
* **[editor-balloon](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-balloon)**: Added support for the menu bar. Closes [#16571](https://github.com/ckeditor/ckeditor5/issues/16571). ([commit](https://github.com/ckeditor/ckeditor5/commit/5e4b36a8c6df1225c22014ebdc1466488c81250a))
* **[editor-inline](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-inline)**: Added support for the menu bar. Closes [#16571](https://github.com/ckeditor/ckeditor5/issues/16571). ([commit](https://github.com/ckeditor/ckeditor5/commit/5e4b36a8c6df1225c22014ebdc1466488c81250a))
* **[engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine)**: `Schema#addChildCheck()` and `Schema#addAttributeCheck()` can now register a callback for a specific item or attribute, which should improve performance when using custom callback checks. Callback checks should be added only for specific item or attribute if possible. See the API reference. Closes [#15834](https://github.com/ckeditor/ckeditor5/issues/15834). ([commit](https://github.com/ckeditor/ckeditor5/commit/c4878b7619751aa4bef64ca00d26d861b40e54f3))
* **[export-word](https://www.npmjs.com/package/@ckeditor/ckeditor5-export-word)**: Added `config.exportWord.converterOptions.language` configuration property to set the language of the exported Word document. The editor's content language will be used by default.
* **[heading](https://www.npmjs.com/package/@ckeditor/ckeditor5-heading)**: Simplify TypeScript types of the `Heading` plugin configuration. ([commit](https://github.com/ckeditor/ckeditor5/commit/ccc93c9159f1d968bb3c92c158a16613e851304a))
* **[image](https://www.npmjs.com/package/@ckeditor/ckeditor5-image)**: The image upload and edit buttons are disabled if the user has no permission to upload any asset. ([commit](https://github.com/ckeditor/ckeditor5/commit/5182fdabf47a4db6b15ae80032a241024a50f6c5))
* **[import-word](https://www.npmjs.com/package/@ckeditor/ckeditor5-import-word)**: The comments and suggestions imported from Word documents will preserve the original dates respecting the local timezone.
* **[List](https://www.npmjs.com/package/@ckeditor/ckeditor5-List)**: The list styles can be enabled for selected list types. Closes [#15554](https://github.com/ckeditor/ckeditor5/issues/15554). ([commit](https://github.com/ckeditor/ckeditor5/commit/248e072ab8040fc7dce0a0798bfdfbce30456fe6))
* **[merge-fields](https://www.npmjs.com/package/@ckeditor/ckeditor5-merge-fields)**: Introduced the merge fields feature.
* **[real-time-collaboration](https://www.npmjs.com/package/@ckeditor/ckeditor5-real-time-collaboration)**: Made the real-time collaboration user presence list accessible to screen reader users.
* **[special-characters](https://www.npmjs.com/package/@ckeditor/ckeditor5-special-characters)**: Added menu bar integration for special characters. New component `menuBar:specialCharacters` is now by default added in "Insert" menu. Closes [#16501](https://github.com/ckeditor/ckeditor5/issues/16501). ([commit](https://github.com/ckeditor/ckeditor5/commit/1145286e5aadd6d3d2f241800358204d577b4938))
* **[track-changes](https://www.npmjs.com/package/@ckeditor/ckeditor5-track-changes)**: Introduced keyboard navigation and screen reader support to the annotations sidebar.
* **[ui](https://www.npmjs.com/package/@ckeditor/ckeditor5-ui)**: Introduced keystroke handler options in `FocusCycler#constructor()` to allow for fine-tuning of the class behavior. ([commit](https://github.com/ckeditor/ckeditor5/commit/44fd2518fac530786345d0274b76c45927d6c6ba))
* **[ui](https://www.npmjs.com/package/@ckeditor/ckeditor5-ui)**: Implemented a new `FocusCycler#chain()` method to connect multiple focus cyclers and provide seamless keyboard navigation across complex user interfaces. ([commit](https://github.com/ckeditor/ckeditor5/commit/44fd2518fac530786345d0274b76c45927d6c6ba))
* **[ui](https://www.npmjs.com/package/@ckeditor/ckeditor5-ui)**: Redesigned "active state" style for menu bar dropdown items. Closes [#16572](https://github.com/ckeditor/ckeditor5/issues/16572). ([commit](https://github.com/ckeditor/ckeditor5/commit/ac3d173664343707d524d5ba3f7dce5a9d75e48e))
* **[utils](https://www.npmjs.com/package/@ckeditor/ckeditor5-utils)**: Introduced events filtering in `KeystrokeHandler#set()` to allow for fine-tuning of the helper's behavior. ([commit](https://github.com/ckeditor/ckeditor5/commit/44fd2518fac530786345d0274b76c45927d6c6ba))

### Bug fixes

* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai)**: Opening AI Assistant with a selection containing an empty line will no longer cause a crash.
* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai)**: AI Assistant will now correctly handle selected content containing empty lines.
* **[ckbox](https://www.npmjs.com/package/@ckeditor/ckeditor5-ckbox)**: Use a safer way to convert numbers to strings to avoid issues with some bundlers. Closes [#16040](https://github.com/ckeditor/ckeditor5/issues/16040). ([commit](https://github.com/ckeditor/ckeditor5/commit/bd13d8ff7fd766447bc83dfc6b813f9723060b27))
* **[comments](https://www.npmjs.com/package/@ckeditor/ckeditor5-comments)**: The user had to click the annotation button twice to execute an action as the first click focused the annotation and caused it to move away, which prevented the click.
* **[engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine)**: `Schema#checkChild()` will now correctly check custom callback checks for each item in the context. ([commit](https://github.com/ckeditor/ckeditor5/commit/c4878b7619751aa4bef64ca00d26d861b40e54f3))
* **[engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine)**: `insertcontent-invalid-insertion-position` exception is no longer thrown after pasting content containing `block element` + `non-paragraph` + `block element` elements. Closes [#16321](https://github.com/ckeditor/ckeditor5/issues/16321). ([commit](https://github.com/ckeditor/ckeditor5/commit/34cf600283c42d35cb609e503dc42a6e39e184ac))
* **[engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine)**: Predictive text should not get doubled while typing. Closes [#16106](https://github.com/ckeditor/ckeditor5/issues/16106). ([commit](https://github.com/ckeditor/ckeditor5/commit/e4317d0bd4a5471062597e380c99ff4b3d9d9bae))
* **[engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine)**: The reverse typing effect should not happen after the focus change. Closes [#14702](https://github.com/ckeditor/ckeditor5/issues/14702).Thanks, [@urbanspr1nter](https://github.com/urbanspr1nter)!. ([commit](https://github.com/ckeditor/ckeditor5/commit/e4317d0bd4a5471062597e380c99ff4b3d9d9bae))
* **[engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine)**: Typing on Android should avoid modifying DOM while composing. Closes [#13994](https://github.com/ckeditor/ckeditor5/issues/13994), [#14707](https://github.com/ckeditor/ckeditor5/issues/14707), [#13850](https://github.com/ckeditor/ckeditor5/issues/13850), [#13693](https://github.com/ckeditor/ckeditor5/issues/13693), [#14567](https://github.com/ckeditor/ckeditor5/issues/14567).    Closes: [#11569](https://github.com/ckeditor/ckeditor5/issues/11569). ([commit](https://github.com/ckeditor/ckeditor5/commit/e4317d0bd4a5471062597e380c99ff4b3d9d9bae))
* **[engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine)**: Formatting should not get lost on a text with a marker in a table cell during upcast. ([commit](https://github.com/ckeditor/ckeditor5/commit/a477c477d5158d0b24059c6e66b504d0b379641b))
* **[export-word](https://www.npmjs.com/package/@ckeditor/ckeditor5-export-word)**: The author name of suggestions from an imported Word document will be correctly persisted after exporting and importing this document again.
* **[find-and-replace](https://www.npmjs.com/package/@ckeditor/ckeditor5-find-and-replace)**: Allow to pass `searchTerm` when using `findCallback` in `find` command. ([commit](https://github.com/ckeditor/ckeditor5/commit/1cc66952db2abf89f1edf56a962b0ee4eaa926f7))
* **[link](https://www.npmjs.com/package/@ckeditor/ckeditor5-link)**: Creating a link in sentences containing an empty line will no longer cause a crash. Closes [#16660](https://github.com/ckeditor/ckeditor5/issues/16660). ([commit](https://github.com/ckeditor/ckeditor5/commit/d5af451a837520b88c979f3c92a7a3018106a7a4))
* **[list](https://www.npmjs.com/package/@ckeditor/ckeditor5-list)**: Text nodes directly inside `<ul>` or `<ol>` should not be removed while loading editor data. Closes [#16450](https://github.com/ckeditor/ckeditor5/issues/16450). ([commit](https://github.com/ckeditor/ckeditor5/commit/09b31af800b16c5dabee5beba2f8d07f0b9e7bc9))
* **[mention](https://www.npmjs.com/package/@ckeditor/ckeditor5-mention)**: Escape mentions markers when building regular expression to prevent crashes when markers like '\' are used. Closes [#16818](https://github.com/ckeditor/ckeditor5/issues/16818). ([commit](https://github.com/ckeditor/ckeditor5/commit/5221aca653e8c8c4b1e1ee9c61bc7d55ee3c085e))
* **[pagination](https://www.npmjs.com/package/@ckeditor/ckeditor5-pagination)**: No longer generate an extra empty page after placing a page break after an element with a margin.
* **[pagination](https://www.npmjs.com/package/@ckeditor/ckeditor5-pagination)**: Should not apply additional styles on `pageBreak` element.
* **[pagination](https://www.npmjs.com/package/@ckeditor/ckeditor5-pagination)**: The pagination feature no longer skips pages when handling large tables. Closes https://github.com/ckeditor/ckeditor5/issues/14426.
* **[pagination](https://www.npmjs.com/package/@ckeditor/ckeditor5-pagination)**: The pagination renders pages differently depending on user selection.
* **[real-time-collaboration](https://www.npmjs.com/package/@ckeditor/ckeditor5-real-time-collaboration)**: The deleted comment thread will no longer be brought back after restoring a revision in which it existed.
* **[table](https://www.npmjs.com/package/@ckeditor/ckeditor5-table)**: Horizontal split button no longer splits larger table cell spans into more than two parts. Closes [#14658](https://github.com/ckeditor/ckeditor5/issues/14658). ([commit](https://github.com/ckeditor/ckeditor5/commit/3c2375548844c0fd225edf4589596c60ed08c0fa))
* **[theme-lark](https://www.npmjs.com/package/@ckeditor/ckeditor5-theme-lark)**: Addressed a regression in the height of buttons displayed inside lists (such as buttons in annotation menus). ([commit](https://github.com/ckeditor/ckeditor5/commit/986a06440ad8ed89d597dbef98ffee4afdc50c2a))
* **[track-changes](https://www.npmjs.com/package/@ckeditor/ckeditor5-track-changes)**: The user had to click the annotation button twice to execute an action as the first click focused the annotation and caused it to move away, which prevented the click.
* **[track-changes](https://www.npmjs.com/package/@ckeditor/ckeditor5-track-changes)**: Fixed editor crash when accepting or discarding a replace suggestion with multiple parts including adding or merging a block element (paragraph, etc.).
* **[typing](https://www.npmjs.com/package/@ckeditor/ckeditor5-typing)**: Predictive text should not get doubled while typing. Closes [#16106](https://github.com/ckeditor/ckeditor5/issues/16106). ([commit](https://github.com/ckeditor/ckeditor5/commit/e4317d0bd4a5471062597e380c99ff4b3d9d9bae))
* **[typing](https://www.npmjs.com/package/@ckeditor/ckeditor5-typing)**: Typing on Android should avoid modifying DOM while composing. Closes [#13994](https://github.com/ckeditor/ckeditor5/issues/13994), [#14707](https://github.com/ckeditor/ckeditor5/issues/14707), [#13850](https://github.com/ckeditor/ckeditor5/issues/13850), [#13693](https://github.com/ckeditor/ckeditor5/issues/13693), [#14567](https://github.com/ckeditor/ckeditor5/issues/14567).    Closes: [#11569](https://github.com/ckeditor/ckeditor5/issues/11569). ([commit](https://github.com/ckeditor/ckeditor5/commit/e4317d0bd4a5471062597e380c99ff4b3d9d9bae))
* **[ui](https://www.npmjs.com/package/@ckeditor/ckeditor5-ui)**: Hide the pinned balloon panel view when the pin target is no longer visible. Closes [#16739](https://github.com/ckeditor/ckeditor5/issues/16739). ([commit](https://github.com/ckeditor/ckeditor5/commit/d12828e6f90490874e9e7ae7bb564f3326701b59))
* **[ui](https://www.npmjs.com/package/@ckeditor/ckeditor5-ui)**: Block toolbar button no longer remains fixed in the same position while scrolling the editable content. Closes [#5460](https://github.com/ckeditor/ckeditor5/issues/5460). ([commit](https://github.com/ckeditor/ckeditor5/commit/498f6f2c8b07b9c6823cf7fc9be09e94440a39c1))
* **[ui](https://www.npmjs.com/package/@ckeditor/ckeditor5-ui)**: The user should be able to move the focus back to where it came from upon `Esc` key press while navigating the menu bar. Closes [#16683](https://github.com/ckeditor/ckeditor5/issues/16683). ([commit](https://github.com/ckeditor/ckeditor5/commit/eff837a80257b57e08e8b65148902b567b808e49))
* **[ui](https://www.npmjs.com/package/@ckeditor/ckeditor5-ui)**: Add `/* #__PURE__ */` comments before mixin calls to properly tree-shake unused classes. Closes [#16651](https://github.com/ckeditor/ckeditor5/issues/16651). ([commit](https://github.com/ckeditor/ckeditor5/commit/b582a13c6556d3276cc5a2fe38d9ac32de1a6823))
* **[ui](https://www.npmjs.com/package/@ckeditor/ckeditor5-ui)**: Improve accessibility of toggleable menu bar items by marking them as `menucheckbox` aria roles. ([commit](https://github.com/ckeditor/ckeditor5/commit/ac3d173664343707d524d5ba3f7dce5a9d75e48e))
* **[ui](https://www.npmjs.com/package/@ckeditor/ckeditor5-ui)**: Fixed element tag name from `<label>` to `<span>` in the color picker component to improve the accessibility. ([commit](https://github.com/ckeditor/ckeditor5/commit/ac3d173664343707d524d5ba3f7dce5a9d75e48e))
* **[ui](https://www.npmjs.com/package/@ckeditor/ckeditor5-ui)**: Changed the place of restricted editing buttons in the menu bar to correct ones. Closes [#16609](https://github.com/ckeditor/ckeditor5/issues/16609). ([commit](https://github.com/ckeditor/ckeditor5/commit/b11f4f9a104cfc44da10e480d5c9e2bc7e3cd34b))
* **[UI](https://www.npmjs.com/package/@ckeditor/ckeditor5-UI)**: The aria-live views will no longer violate the a11y aXe rule: `landmarks should be unique`. Closes [#16544](https://github.com/ckeditor/ckeditor5/issues/16544). ([commit](https://github.com/ckeditor/ckeditor5/commit/50c09aab32c0ae7e50ca1d211d5d07021b329b15))

### Other changes

* **[autoformat](https://www.npmjs.com/package/@ckeditor/ckeditor5-autoformat)**: The `blockAutoformatEditing` and the `inlineAutoformatEditing` are now exported from the package index. Closes [#16815](https://github.com/ckeditor/ckeditor5/issues/16815). ([commit](https://github.com/ckeditor/ckeditor5/commit/2b9341bb7932aaf3c1e55132abe940130d569cf9))
* **[ckbox](https://www.npmjs.com/package/@ckeditor/ckeditor5-ckbox)**: The plugin no longer slows down the editor startup because it fetches the token in the background instead of during the editor’s initialization. Closes [#16760](https://github.com/ckeditor/ckeditor5/issues/16760). ([commit](https://github.com/ckeditor/ckeditor5/commit/e326f483fd0da1785a98b090aab4f74fce4fc0b9))
* **[ckeditor5](https://www.npmjs.com/package/ckeditor5)**: Global name for the `ckeditor5` package in the UMD builds have been changed to `CKEDITOR`. Closes [#16798](https://github.com/ckeditor/ckeditor5/issues/16798). ([commit](https://github.com/ckeditor/ckeditor5/commit/7a332eb7e58c0c4fad35744391f3ce9a7b6a481e))
* **[ckeditor5-premium-features](https://www.npmjs.com/package/@ckeditor/ckeditor5-ckeditor5-premium-features)**: Global name for the `ckeditor5-premium-features` package in the UMD builds have been changed to `CKEDITOR_PREMIUM_FEATURES`.
* **[engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine)**: Introduced `Schema#trimLast()`. ([commit](https://github.com/ckeditor/ckeditor5/commit/c4878b7619751aa4bef64ca00d26d861b40e54f3))
* **[engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine)**: The `Model#insertContent()` method should keep inline objects in the same auto paragraph as text nodes and other inline objects. See [#16321](https://github.com/ckeditor/ckeditor5/issues/16321). ([commit](https://github.com/ckeditor/ckeditor5/commit/34cf600283c42d35cb609e503dc42a6e39e184ac))
* **[engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine)**: The `Schema#checkMerge()` method should return `false` if one of the elements is a limit element. See [#16321](https://github.com/ckeditor/ckeditor5/issues/16321). ([commit](https://github.com/ckeditor/ckeditor5/commit/34cf600283c42d35cb609e503dc42a6e39e184ac))
* **[export-word](https://www.npmjs.com/package/@ckeditor/ckeditor5-export-word)**: Set export word v2 as default.
* **[html-embed](https://www.npmjs.com/package/@ckeditor/ckeditor5-html-embed)**: HTML Embed plugin configuration value `sanitizeHtml` was moved from the `htmlEmbed` space to top-level configuration space. `config.htmlEmbed.sanitizeHtml` is now deprecated.
* **[page-break](https://www.npmjs.com/package/@ckeditor/ckeditor5-page-break)**: No longer generate an extra empty page after placing a page break after an element with a margin. ([commit](https://github.com/ckeditor/ckeditor5/commit/28d0389424dcb74d1163741d33a379e26816fc4c))
* **[pagination](https://www.npmjs.com/package/@ckeditor/ckeditor5-pagination)**: Enhance the performance of rendering large documents when the pagination plugin is enabled.
* **[special-characters](https://www.npmjs.com/package/@ckeditor/ckeditor5-special-characters)**: Special characters plugin now uses a dialog (instead of a toolbar dropdown). ([commit](https://github.com/ckeditor/ckeditor5/commit/1145286e5aadd6d3d2f241800358204d577b4938))
* **[track-changes](https://www.npmjs.com/package/@ckeditor/ckeditor5-track-changes)**: Part of the `SuggestionThreadView` template was moved to a new view `SuggestionView`.
* **[track-changes](https://www.npmjs.com/package/@ckeditor/ckeditor5-track-changes)**: Configuration property `SuggestionView` was added to enable the `SuggestionView` class customization.
* **[track-changes](https://www.npmjs.com/package/@ckeditor/ckeditor5-track-changes)**: Made the track changes icon more in line with other icons in the icon set.
* **[ui](https://www.npmjs.com/package/@ckeditor/ckeditor5-ui)**: Added the `LabelWithHighlightView` and `ButtonLabelWithHighlightView` components to the UI library. ([commit](https://github.com/ckeditor/ckeditor5/commit/3351b363d96a5bb0c8a8f709d41ac0323353fe3c))
* **[ui](https://www.npmjs.com/package/@ckeditor/ckeditor5-ui)**: Added the `filterGroupAndItemNames()` helper to the UI library. ([commit](https://github.com/ckeditor/ckeditor5/commit/3351b363d96a5bb0c8a8f709d41ac0323353fe3c))
* **[ui](https://www.npmjs.com/package/@ckeditor/ckeditor5-ui)**: The `SearchTextView#reset()` method will also reset the scroll of its `filteredView` to the top. ([commit](https://github.com/ckeditor/ckeditor5/commit/3351b363d96a5bb0c8a8f709d41ac0323353fe3c))
* Updated translations. ([commit](https://github.com/ckeditor/ckeditor5/commit/48ea508d4c6593e91349941f2941a7c2f3dd6328), [commit](https://github.com/ckeditor/ckeditor5/commit/6bb2924bec789f9fcfba949d0a8eed4e19dade7b), [commit](https://github.com/ckeditor/ckeditor5/commit/7c467305674da47ac491261139711da148467bdb), [commit](https://github.com/ckeditor/ckeditor5/commit/354e9510809fa1a6cc54d6b3dd617e8005d046a7))

### Released packages

Check out the [Versioning policy](https://ckeditor.com/docs/ckeditor5/latest/framework/guides/support/versioning-policy.html) guide for more information.

<details>
<summary>Released packages (summary)</summary>

New packages:

* [@ckeditor/ckeditor5-merge-fields](https://www.npmjs.com/package/@ckeditor/ckeditor5-merge-fields/v/43.0.0): v43.0.0

Major releases (contain major breaking changes):

* [@ckeditor/ckeditor5-export-word](https://www.npmjs.com/package/@ckeditor/ckeditor5-export-word/v/43.0.0): v42.0.2 => v43.0.0
* [ckeditor5](https://www.npmjs.com/package/ckeditor5/v/43.0.0): v42.0.2 => v43.0.0
* [ckeditor5-premium-features](https://www.npmjs.com/package/ckeditor5-premium-features/v/43.0.0): v42.0.2 => v43.0.0

Minor releases (contain minor breaking changes):

* [@ckeditor/ckeditor5-ckbox](https://www.npmjs.com/package/@ckeditor/ckeditor5-ckbox/v/43.0.0): v42.0.2 => v43.0.0
* [@ckeditor/ckeditor5-comments](https://www.npmjs.com/package/@ckeditor/ckeditor5-comments/v/43.0.0): v42.0.2 => v43.0.0
* [@ckeditor/ckeditor5-real-time-collaboration](https://www.npmjs.com/package/@ckeditor/ckeditor5-real-time-collaboration/v/43.0.0): v42.0.2 => v43.0.0
* [@ckeditor/ckeditor5-special-characters](https://www.npmjs.com/package/@ckeditor/ckeditor5-special-characters/v/43.0.0): v42.0.2 => v43.0.0
* [@ckeditor/ckeditor5-ui](https://www.npmjs.com/package/@ckeditor/ckeditor5-ui/v/43.0.0): v42.0.2 => v43.0.0

Other releases:

* [@ckeditor/ckeditor5-adapter-ckfinder](https://www.npmjs.com/package/@ckeditor/ckeditor5-adapter-ckfinder/v/43.0.0): v42.0.2 => v43.0.0
* [@ckeditor/ckeditor5-ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai/v/43.0.0): v42.0.2 => v43.0.0
* [@ckeditor/ckeditor5-alignment](https://www.npmjs.com/package/@ckeditor/ckeditor5-alignment/v/43.0.0): v42.0.2 => v43.0.0
* [@ckeditor/ckeditor5-autoformat](https://www.npmjs.com/package/@ckeditor/ckeditor5-autoformat/v/43.0.0): v42.0.2 => v43.0.0
* [@ckeditor/ckeditor5-autosave](https://www.npmjs.com/package/@ckeditor/ckeditor5-autosave/v/43.0.0): v42.0.2 => v43.0.0
* [@ckeditor/ckeditor5-basic-styles](https://www.npmjs.com/package/@ckeditor/ckeditor5-basic-styles/v/43.0.0): v42.0.2 => v43.0.0
* [@ckeditor/ckeditor5-block-quote](https://www.npmjs.com/package/@ckeditor/ckeditor5-block-quote/v/43.0.0): v42.0.2 => v43.0.0
* [@ckeditor/ckeditor5-build-balloon](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-balloon/v/43.0.0): v42.0.2 => v43.0.0
* [@ckeditor/ckeditor5-build-balloon-block](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-balloon-block/v/43.0.0): v42.0.2 => v43.0.0
* [@ckeditor/ckeditor5-build-classic](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-classic/v/43.0.0): v42.0.2 => v43.0.0
* [@ckeditor/ckeditor5-build-decoupled-document](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-decoupled-document/v/43.0.0): v42.0.2 => v43.0.0
* [@ckeditor/ckeditor5-build-inline](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-inline/v/43.0.0): v42.0.2 => v43.0.0
* [@ckeditor/ckeditor5-build-multi-root](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-multi-root/v/43.0.0): v42.0.2 => v43.0.0
* [@ckeditor/ckeditor5-case-change](https://www.npmjs.com/package/@ckeditor/ckeditor5-case-change/v/43.0.0): v42.0.2 => v43.0.0
* [@ckeditor/ckeditor5-ckfinder](https://www.npmjs.com/package/@ckeditor/ckeditor5-ckfinder/v/43.0.0): v42.0.2 => v43.0.0
* [@ckeditor/ckeditor5-clipboard](https://www.npmjs.com/package/@ckeditor/ckeditor5-clipboard/v/43.0.0): v42.0.2 => v43.0.0
* [@ckeditor/ckeditor5-cloud-services](https://www.npmjs.com/package/@ckeditor/ckeditor5-cloud-services/v/43.0.0): v42.0.2 => v43.0.0
* [@ckeditor/ckeditor5-code-block](https://www.npmjs.com/package/@ckeditor/ckeditor5-code-block/v/43.0.0): v42.0.2 => v43.0.0
* [@ckeditor/ckeditor5-collaboration-core](https://www.npmjs.com/package/@ckeditor/ckeditor5-collaboration-core/v/43.0.0): v42.0.2 => v43.0.0
* [@ckeditor/ckeditor5-core](https://www.npmjs.com/package/@ckeditor/ckeditor5-core/v/43.0.0): v42.0.2 => v43.0.0
* [@ckeditor/ckeditor5-document-outline](https://www.npmjs.com/package/@ckeditor/ckeditor5-document-outline/v/43.0.0): v42.0.2 => v43.0.0
* [@ckeditor/ckeditor5-easy-image](https://www.npmjs.com/package/@ckeditor/ckeditor5-easy-image/v/43.0.0): v42.0.2 => v43.0.0
* [@ckeditor/ckeditor5-editor-balloon](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-balloon/v/43.0.0): v42.0.2 => v43.0.0
* [@ckeditor/ckeditor5-editor-classic](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-classic/v/43.0.0): v42.0.2 => v43.0.0
* [@ckeditor/ckeditor5-editor-decoupled](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-decoupled/v/43.0.0): v42.0.2 => v43.0.0
* [@ckeditor/ckeditor5-editor-inline](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-inline/v/43.0.0): v42.0.2 => v43.0.0
* [@ckeditor/ckeditor5-editor-multi-root](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-multi-root/v/43.0.0): v42.0.2 => v43.0.0
* [@ckeditor/ckeditor5-engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine/v/43.0.0): v42.0.2 => v43.0.0
* [@ckeditor/ckeditor5-enter](https://www.npmjs.com/package/@ckeditor/ckeditor5-enter/v/43.0.0): v42.0.2 => v43.0.0
* [@ckeditor/ckeditor5-essentials](https://www.npmjs.com/package/@ckeditor/ckeditor5-essentials/v/43.0.0): v42.0.2 => v43.0.0
* [@ckeditor/ckeditor5-export-pdf](https://www.npmjs.com/package/@ckeditor/ckeditor5-export-pdf/v/43.0.0): v42.0.2 => v43.0.0
* [@ckeditor/ckeditor5-find-and-replace](https://www.npmjs.com/package/@ckeditor/ckeditor5-find-and-replace/v/43.0.0): v42.0.2 => v43.0.0
* [@ckeditor/ckeditor5-font](https://www.npmjs.com/package/@ckeditor/ckeditor5-font/v/43.0.0): v42.0.2 => v43.0.0
* [@ckeditor/ckeditor5-format-painter](https://www.npmjs.com/package/@ckeditor/ckeditor5-format-painter/v/43.0.0): v42.0.2 => v43.0.0
* [@ckeditor/ckeditor5-heading](https://www.npmjs.com/package/@ckeditor/ckeditor5-heading/v/43.0.0): v42.0.2 => v43.0.0
* [@ckeditor/ckeditor5-highlight](https://www.npmjs.com/package/@ckeditor/ckeditor5-highlight/v/43.0.0): v42.0.2 => v43.0.0
* [@ckeditor/ckeditor5-horizontal-line](https://www.npmjs.com/package/@ckeditor/ckeditor5-horizontal-line/v/43.0.0): v42.0.2 => v43.0.0
* [@ckeditor/ckeditor5-html-embed](https://www.npmjs.com/package/@ckeditor/ckeditor5-html-embed/v/43.0.0): v42.0.2 => v43.0.0
* [@ckeditor/ckeditor5-html-support](https://www.npmjs.com/package/@ckeditor/ckeditor5-html-support/v/43.0.0): v42.0.2 => v43.0.0
* [@ckeditor/ckeditor5-image](https://www.npmjs.com/package/@ckeditor/ckeditor5-image/v/43.0.0): v42.0.2 => v43.0.0
* [@ckeditor/ckeditor5-import-word](https://www.npmjs.com/package/@ckeditor/ckeditor5-import-word/v/43.0.0): v42.0.2 => v43.0.0
* [@ckeditor/ckeditor5-indent](https://www.npmjs.com/package/@ckeditor/ckeditor5-indent/v/43.0.0): v42.0.2 => v43.0.0
* [@ckeditor/ckeditor5-language](https://www.npmjs.com/package/@ckeditor/ckeditor5-language/v/43.0.0): v42.0.2 => v43.0.0
* [@ckeditor/ckeditor5-link](https://www.npmjs.com/package/@ckeditor/ckeditor5-link/v/43.0.0): v42.0.2 => v43.0.0
* [@ckeditor/ckeditor5-list](https://www.npmjs.com/package/@ckeditor/ckeditor5-list/v/43.0.0): v42.0.2 => v43.0.0
* [@ckeditor/ckeditor5-list-multi-level](https://www.npmjs.com/package/@ckeditor/ckeditor5-list-multi-level/v/43.0.0): v42.0.2 => v43.0.0
* [@ckeditor/ckeditor5-markdown-gfm](https://www.npmjs.com/package/@ckeditor/ckeditor5-markdown-gfm/v/43.0.0): v42.0.2 => v43.0.0
* [@ckeditor/ckeditor5-media-embed](https://www.npmjs.com/package/@ckeditor/ckeditor5-media-embed/v/43.0.0): v42.0.2 => v43.0.0
* [@ckeditor/ckeditor5-mention](https://www.npmjs.com/package/@ckeditor/ckeditor5-mention/v/43.0.0): v42.0.2 => v43.0.0
* [@ckeditor/ckeditor5-minimap](https://www.npmjs.com/package/@ckeditor/ckeditor5-minimap/v/43.0.0): v42.0.2 => v43.0.0
* [@ckeditor/ckeditor5-operations-compressor](https://www.npmjs.com/package/@ckeditor/ckeditor5-operations-compressor/v/43.0.0): v42.0.2 => v43.0.0
* [@ckeditor/ckeditor5-page-break](https://www.npmjs.com/package/@ckeditor/ckeditor5-page-break/v/43.0.0): v42.0.2 => v43.0.0
* [@ckeditor/ckeditor5-pagination](https://www.npmjs.com/package/@ckeditor/ckeditor5-pagination/v/43.0.0): v42.0.2 => v43.0.0
* [@ckeditor/ckeditor5-paragraph](https://www.npmjs.com/package/@ckeditor/ckeditor5-paragraph/v/43.0.0): v42.0.2 => v43.0.0
* [@ckeditor/ckeditor5-paste-from-office](https://www.npmjs.com/package/@ckeditor/ckeditor5-paste-from-office/v/43.0.0): v42.0.2 => v43.0.0
* [@ckeditor/ckeditor5-paste-from-office-enhanced](https://www.npmjs.com/package/@ckeditor/ckeditor5-paste-from-office-enhanced/v/43.0.0): v42.0.2 => v43.0.0
* [@ckeditor/ckeditor5-remove-format](https://www.npmjs.com/package/@ckeditor/ckeditor5-remove-format/v/43.0.0): v42.0.2 => v43.0.0
* [@ckeditor/ckeditor5-restricted-editing](https://www.npmjs.com/package/@ckeditor/ckeditor5-restricted-editing/v/43.0.0): v42.0.2 => v43.0.0
* [@ckeditor/ckeditor5-revision-history](https://www.npmjs.com/package/@ckeditor/ckeditor5-revision-history/v/43.0.0): v42.0.2 => v43.0.0
* [@ckeditor/ckeditor5-select-all](https://www.npmjs.com/package/@ckeditor/ckeditor5-select-all/v/43.0.0): v42.0.2 => v43.0.0
* [@ckeditor/ckeditor5-show-blocks](https://www.npmjs.com/package/@ckeditor/ckeditor5-show-blocks/v/43.0.0): v42.0.2 => v43.0.0
* [@ckeditor/ckeditor5-slash-command](https://www.npmjs.com/package/@ckeditor/ckeditor5-slash-command/v/43.0.0): v42.0.2 => v43.0.0
* [@ckeditor/ckeditor5-source-editing](https://www.npmjs.com/package/@ckeditor/ckeditor5-source-editing/v/43.0.0): v42.0.2 => v43.0.0
* [@ckeditor/ckeditor5-style](https://www.npmjs.com/package/@ckeditor/ckeditor5-style/v/43.0.0): v42.0.2 => v43.0.0
* [@ckeditor/ckeditor5-table](https://www.npmjs.com/package/@ckeditor/ckeditor5-table/v/43.0.0): v42.0.2 => v43.0.0
* [@ckeditor/ckeditor5-template](https://www.npmjs.com/package/@ckeditor/ckeditor5-template/v/43.0.0): v42.0.2 => v43.0.0
* [@ckeditor/ckeditor5-theme-lark](https://www.npmjs.com/package/@ckeditor/ckeditor5-theme-lark/v/43.0.0): v42.0.2 => v43.0.0
* [@ckeditor/ckeditor5-track-changes](https://www.npmjs.com/package/@ckeditor/ckeditor5-track-changes/v/43.0.0): v42.0.2 => v43.0.0
* [@ckeditor/ckeditor5-typing](https://www.npmjs.com/package/@ckeditor/ckeditor5-typing/v/43.0.0): v42.0.2 => v43.0.0
* [@ckeditor/ckeditor5-undo](https://www.npmjs.com/package/@ckeditor/ckeditor5-undo/v/43.0.0): v42.0.2 => v43.0.0
* [@ckeditor/ckeditor5-upload](https://www.npmjs.com/package/@ckeditor/ckeditor5-upload/v/43.0.0): v42.0.2 => v43.0.0
* [@ckeditor/ckeditor5-utils](https://www.npmjs.com/package/@ckeditor/ckeditor5-utils/v/43.0.0): v42.0.2 => v43.0.0
* [@ckeditor/ckeditor5-watchdog](https://www.npmjs.com/package/@ckeditor/ckeditor5-watchdog/v/43.0.0): v42.0.2 => v43.0.0
* [@ckeditor/ckeditor5-widget](https://www.npmjs.com/package/@ckeditor/ckeditor5-widget/v/43.0.0): v42.0.2 => v43.0.0
* [@ckeditor/ckeditor5-word-count](https://www.npmjs.com/package/@ckeditor/ckeditor5-word-count/v/43.0.0): v42.0.2 => v43.0.0
* [ckeditor5-collaboration](https://www.npmjs.com/package/ckeditor5-collaboration/v/43.0.0): v42.0.2 => v43.0.0
</details>


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

---

To see all releases, visit the [release page](https://github.com/ckeditor/ckeditor5/releases).
