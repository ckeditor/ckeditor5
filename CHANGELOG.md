Changelog
=========

## [47.3.0](https://github.com/ckeditor/ckeditor5/compare/v47.2.0...v47.3.0) (December 3, 2025)

We are happy to announce the release of CKEditor 5 v47.3.0.

### Release highlights

This release introduces a minor stability update, featuring focused fixes and improvements, as well as experimental features.

#### CKEditor AI improvements and bug fixes

Finding a specific AI Quick Action in a long list with multiple groups can be difficult. To improve this, we are adding a filter input that lets users search for quick actions directly within the dropdown.

Visibility of the input can be easily configured using the `config.ai.quickActions.isSearchEnabled` configuration option.

This release also brings several minor but significant enhancements and fixes:

* Track Changes markers not related to AI suggestions are now displayed in gray in the AI balloon text preview, consistent with the behavior of AI chat.
* When retrying a specific AI Review, we are now ensuring the latest version of the document is used.
* We also improved error handling across CKEditor AI, making it easier to debug backend-related issues by including more detailed error messages.

#### New experimental options

We keep our [LTS version](https://ckeditor.com/docs/ckeditor5/latest/getting-started/setup/using-lts-edition.html#compatibility-matrix) promise: no breaking changes until the Active LTS moves to Maintenance LTS phase (April 2026). It also means that introducing larger features can be challenging if someone is waiting for specific improvements.

To address this, we are introducing **experimental flags** and **experimental plugins**. These options allow you to preview and test upcoming changes.

* **New table alignment options**

	Enable `config.experimentalFlags.useExtendedTableBlockAlignment` and load the experimental UI plugins `TablePropertiesUIExperimental` and `TableCellPropertiesUIExperimental` for upcoming improvements to table block alignment. New options allow setting left and right table block alignment without text wrapping and resolve issues such as [#3225](https://github.com/ckeditor/ckeditor5/issues/3225). We also improved table properties and cell properties balloon interfaces. This change will be the default in version 48.0.0.

* **Improved table border normalization**

	Setting `config.experimentalFlags.upcastTableBorderZeroAttributes` enables support for the normalization of HTML tables that use `border="0"`. This change will be the default in version 48.0.0.
		
* **Better deep schema validation**

	After enabling the `config.experimentalFlags.modelInsertContentDeepSchemaVerification` flag, the editor performs deep schema verification during `model.insertContent()` operations. This ensures that the inserted content fully follows the editor’s schema, even in complex or nested structures. This change will be the default in version 48.0.0.

Read more about these experimental features [in the documentation](https://ckeditor.com/docs/ckeditor5/latest/updating/guides/update-to-47.html#new-experimental-options).

### Features

* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai)**: The AI balloon contents is always scrolled to the bottom, so the most recent content is always visible to the user.
* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai)**: AI Quick Actions are now searchable in the dropdown. Search input can be hidden using the `config.ai.quickActions.isSearchEnabled` configuration option.
* **[restricted-editing](https://www.npmjs.com/package/@ckeditor/ckeditor5-restricted-editing)**: Introducing an automatic command (`restrictedEditingExceptionAuto`) and dedicated toolbar button (`restrictedEditingException:auto`) for creating restricted editing exceptions (both block and inline). Closes [#19353](https://github.com/ckeditor/ckeditor5/issues/19353).

### Bug fixes

* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai)**: AI Review now uses the latest editor content when the review check was retried (via "Try again" button).

  This improvement fixes the issue when cached content was send on retry and any new changes, applied review suggestions or changes made by other users in real-time collaboration, were not sent and accounted by AI when generating new results.
* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai)**: AI Review no longer results in an error when the AI service returns an unexpected response (multiple elements when one is expected).
* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai)**: Track Changes markers not related to AI suggestions are now displayed in gray in AI balloon text preview, consistent with AI chat behavior.
* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai)**: The translate check in AI Review now correctly translates the image `alt` attribute text.
* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai)**: The caption of images (`<figcaption>` element) is now correctly processed by AI Review checks instead of being ignored.
* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai)**: Errors caused by AI feature during initialization no longer crash the editor.
* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai)**: The AI feature keeps the correct UI state after a runtime error occurs.
* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai)**: The AI Review "Custom command" is hidden if the model list cannot be obtained.
* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai)**: Error messages in AI Chat History are now displayed correctly. Previously, errors caused the history view to appear empty instead of showing the error message.
* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai)**: AI suggestions balloon content no longer stick out of the balloon on very small screens.
* **[ckbox](https://www.npmjs.com/package/@ckeditor/ckeditor5-ckbox)**: Fixed CKBox Image Editor not respecting the language configuration option. Closes [#19338](https://github.com/ckeditor/ckeditor5/issues/19338).
* **[comments](https://www.npmjs.com/package/@ckeditor/ckeditor5-comments)**: Fixed an issue where the comment toolbar button remained enabled even when the command to create a new comment thread was disabled (e.g., in read-only mode).
* **[comments](https://www.npmjs.com/package/@ckeditor/ckeditor5-comments)**: Disabled revision history toolbar and menu bar buttons in comments-only mode to prevent users from using revision history features.
* **[footnotes](https://www.npmjs.com/package/@ckeditor/ckeditor5-footnotes)**: Fixed an issue where cutting and pasting an empty footnotes list in the middle of a paragraph would incorrectly split the paragraph.
* **[footnotes](https://www.npmjs.com/package/@ckeditor/ckeditor5-footnotes)**: Fixed an issue where the content of pasted footnotes was lost when the `multiBlock` configuration option was disabled.
* **[footnotes](https://www.npmjs.com/package/@ckeditor/ckeditor5-footnotes)**: Fixed incorrect start number shown in footnotes UI when loading a document with existing footnotes.
* **[footnotes](https://www.npmjs.com/package/@ckeditor/ckeditor5-footnotes)**: Footnote lists styled with `alpha-lower` and `alpha-upper` are now correctly highlighted in the footnotes UI.
* **[line-height](https://www.npmjs.com/package/@ckeditor/ckeditor5-line-height)**: When line height is applied to a to-do list item, the checkbox is now vertically centered correctly.
* **[pagination](https://www.npmjs.com/package/@ckeditor/ckeditor5-pagination)**: Improved calculation of page breaks when long tables are present in the content.
* **[revision-history](https://www.npmjs.com/package/@ckeditor/ckeditor5-revision-history)**: Fixed an issue where revision history buttons remained incorrectly enabled in read-only mode in the menubar.
* **[table](https://www.npmjs.com/package/@ckeditor/ckeditor5-table)**: Fixed an issue where tables with merged cells (`[rowspan]`) in header columns were not handled correctly. Closes [#14826](https://github.com/ckeditor/ckeditor5/issues/14826).

  Thanks to [@bendemboski](https://github.com/bendemboski).

### Other changes

* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai)**: Review suggestions can now be previewed by hovering over changes in the content, significantly enhancing the review process.
* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai)**: Stopping generation in AI chat now clears the selection from the pending context.
* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai)**: Custom AI quick actions referencing unavailable models are now disabled.

  They are displayed as grayed out, and an error is logged to the console during the editor initialization to help integrators detect and fix the issue before it impacts end-users.
* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai)**: Removed misleading console warnings that appeared during AI response streaming.
* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai)**: Error messages concerning the AI feature logged in the browser console now contain the details provided by the backend service.
* **[engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine)**: Introduced the `experimentalFlags` configuration option that allows enabling or disabling specific experimental behaviors in CKEditor 5. Closes [#19217](https://github.com/ckeditor/ckeditor5/issues/19217).

  Added a new experimental flag: `modelInsertContentDeepSchemaVerification`. When enabled, the editor performs a deep schema verification
  during `model.insertContent()` operations, ensuring that inserted content fully complies with the editor’s schema even in complex
  or nested contexts.
* **[list](https://www.npmjs.com/package/@ckeditor/ckeditor5-list)**: Added support for passing `consume` parameter to `ListEditing#registerDowncastStrategy` method which allows to control whether the downcasted element should be consumed or not. It also disables consume checks for the downcasted element to allow defining side effects without consuming the model attribute.
* **[table](https://www.npmjs.com/package/@ckeditor/ckeditor5-table)**: Added experimental support for importing HTML tables with the `[border="0"]` attribute. Tables with this attribute are now automatically converted to borderless tables in the editor by applying `border-style: none` to both table and table cell elements. Closes [#19038](https://github.com/ckeditor/ckeditor5/issues/19038).

  This change needs to be enabled by setting `experimentalFlags.upcastTableBorderZeroAttributes` to `true`. In the next major release, this flag will be removed and the upcast will be performed by default.
* The development environment for CKEditor 5 now requires Node v24.11.

### Released packages

Check out the [Versioning policy](https://ckeditor.com/docs/ckeditor5/latest/framework/guides/support/versioning-policy.html) guide for more information.

<details>
<summary>Released packages (summary)</summary>

Releases containing new features:

* [@ckeditor/ckeditor5-ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai/v/47.3.0): v47.2.0 => v47.3.0
* [@ckeditor/ckeditor5-restricted-editing](https://www.npmjs.com/package/@ckeditor/ckeditor5-restricted-editing/v/47.3.0): v47.2.0 => v47.3.0

Other releases:

* [@ckeditor/ckeditor5-adapter-ckfinder](https://www.npmjs.com/package/@ckeditor/ckeditor5-adapter-ckfinder/v/47.3.0): v47.2.0 => v47.3.0
* [@ckeditor/ckeditor5-alignment](https://www.npmjs.com/package/@ckeditor/ckeditor5-alignment/v/47.3.0): v47.2.0 => v47.3.0
* [@ckeditor/ckeditor5-autoformat](https://www.npmjs.com/package/@ckeditor/ckeditor5-autoformat/v/47.3.0): v47.2.0 => v47.3.0
* [@ckeditor/ckeditor5-autosave](https://www.npmjs.com/package/@ckeditor/ckeditor5-autosave/v/47.3.0): v47.2.0 => v47.3.0
* [@ckeditor/ckeditor5-basic-styles](https://www.npmjs.com/package/@ckeditor/ckeditor5-basic-styles/v/47.3.0): v47.2.0 => v47.3.0
* [@ckeditor/ckeditor5-block-quote](https://www.npmjs.com/package/@ckeditor/ckeditor5-block-quote/v/47.3.0): v47.2.0 => v47.3.0
* [@ckeditor/ckeditor5-bookmark](https://www.npmjs.com/package/@ckeditor/ckeditor5-bookmark/v/47.3.0): v47.2.0 => v47.3.0
* [@ckeditor/ckeditor5-case-change](https://www.npmjs.com/package/@ckeditor/ckeditor5-case-change/v/47.3.0): v47.2.0 => v47.3.0
* [@ckeditor/ckeditor5-ckbox](https://www.npmjs.com/package/@ckeditor/ckeditor5-ckbox/v/47.3.0): v47.2.0 => v47.3.0
* [@ckeditor/ckeditor5-ckfinder](https://www.npmjs.com/package/@ckeditor/ckeditor5-ckfinder/v/47.3.0): v47.2.0 => v47.3.0
* [@ckeditor/ckeditor5-clipboard](https://www.npmjs.com/package/@ckeditor/ckeditor5-clipboard/v/47.3.0): v47.2.0 => v47.3.0
* [@ckeditor/ckeditor5-cloud-services](https://www.npmjs.com/package/@ckeditor/ckeditor5-cloud-services/v/47.3.0): v47.2.0 => v47.3.0
* [@ckeditor/ckeditor5-code-block](https://www.npmjs.com/package/@ckeditor/ckeditor5-code-block/v/47.3.0): v47.2.0 => v47.3.0
* [@ckeditor/ckeditor5-collaboration-core](https://www.npmjs.com/package/@ckeditor/ckeditor5-collaboration-core/v/47.3.0): v47.2.0 => v47.3.0
* [@ckeditor/ckeditor5-comments](https://www.npmjs.com/package/@ckeditor/ckeditor5-comments/v/47.3.0): v47.2.0 => v47.3.0
* [@ckeditor/ckeditor5-core](https://www.npmjs.com/package/@ckeditor/ckeditor5-core/v/47.3.0): v47.2.0 => v47.3.0
* [@ckeditor/ckeditor5-document-outline](https://www.npmjs.com/package/@ckeditor/ckeditor5-document-outline/v/47.3.0): v47.2.0 => v47.3.0
* [@ckeditor/ckeditor5-easy-image](https://www.npmjs.com/package/@ckeditor/ckeditor5-easy-image/v/47.3.0): v47.2.0 => v47.3.0
* [@ckeditor/ckeditor5-editor-balloon](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-balloon/v/47.3.0): v47.2.0 => v47.3.0
* [@ckeditor/ckeditor5-editor-classic](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-classic/v/47.3.0): v47.2.0 => v47.3.0
* [@ckeditor/ckeditor5-editor-decoupled](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-decoupled/v/47.3.0): v47.2.0 => v47.3.0
* [@ckeditor/ckeditor5-editor-inline](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-inline/v/47.3.0): v47.2.0 => v47.3.0
* [@ckeditor/ckeditor5-editor-multi-root](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-multi-root/v/47.3.0): v47.2.0 => v47.3.0
* [@ckeditor/ckeditor5-email](https://www.npmjs.com/package/@ckeditor/ckeditor5-email/v/47.3.0): v47.2.0 => v47.3.0
* [@ckeditor/ckeditor5-emoji](https://www.npmjs.com/package/@ckeditor/ckeditor5-emoji/v/47.3.0): v47.2.0 => v47.3.0
* [@ckeditor/ckeditor5-engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine/v/47.3.0): v47.2.0 => v47.3.0
* [@ckeditor/ckeditor5-enter](https://www.npmjs.com/package/@ckeditor/ckeditor5-enter/v/47.3.0): v47.2.0 => v47.3.0
* [@ckeditor/ckeditor5-essentials](https://www.npmjs.com/package/@ckeditor/ckeditor5-essentials/v/47.3.0): v47.2.0 => v47.3.0
* [@ckeditor/ckeditor5-export-inline-styles](https://www.npmjs.com/package/@ckeditor/ckeditor5-export-inline-styles/v/47.3.0): v47.2.0 => v47.3.0
* [@ckeditor/ckeditor5-export-pdf](https://www.npmjs.com/package/@ckeditor/ckeditor5-export-pdf/v/47.3.0): v47.2.0 => v47.3.0
* [@ckeditor/ckeditor5-export-word](https://www.npmjs.com/package/@ckeditor/ckeditor5-export-word/v/47.3.0): v47.2.0 => v47.3.0
* [@ckeditor/ckeditor5-find-and-replace](https://www.npmjs.com/package/@ckeditor/ckeditor5-find-and-replace/v/47.3.0): v47.2.0 => v47.3.0
* [@ckeditor/ckeditor5-font](https://www.npmjs.com/package/@ckeditor/ckeditor5-font/v/47.3.0): v47.2.0 => v47.3.0
* [@ckeditor/ckeditor5-footnotes](https://www.npmjs.com/package/@ckeditor/ckeditor5-footnotes/v/47.3.0): v47.2.0 => v47.3.0
* [@ckeditor/ckeditor5-format-painter](https://www.npmjs.com/package/@ckeditor/ckeditor5-format-painter/v/47.3.0): v47.2.0 => v47.3.0
* [@ckeditor/ckeditor5-fullscreen](https://www.npmjs.com/package/@ckeditor/ckeditor5-fullscreen/v/47.3.0): v47.2.0 => v47.3.0
* [@ckeditor/ckeditor5-heading](https://www.npmjs.com/package/@ckeditor/ckeditor5-heading/v/47.3.0): v47.2.0 => v47.3.0
* [@ckeditor/ckeditor5-highlight](https://www.npmjs.com/package/@ckeditor/ckeditor5-highlight/v/47.3.0): v47.2.0 => v47.3.0
* [@ckeditor/ckeditor5-horizontal-line](https://www.npmjs.com/package/@ckeditor/ckeditor5-horizontal-line/v/47.3.0): v47.2.0 => v47.3.0
* [@ckeditor/ckeditor5-html-embed](https://www.npmjs.com/package/@ckeditor/ckeditor5-html-embed/v/47.3.0): v47.2.0 => v47.3.0
* [@ckeditor/ckeditor5-html-support](https://www.npmjs.com/package/@ckeditor/ckeditor5-html-support/v/47.3.0): v47.2.0 => v47.3.0
* [@ckeditor/ckeditor5-icons](https://www.npmjs.com/package/@ckeditor/ckeditor5-icons/v/47.3.0): v47.2.0 => v47.3.0
* [@ckeditor/ckeditor5-image](https://www.npmjs.com/package/@ckeditor/ckeditor5-image/v/47.3.0): v47.2.0 => v47.3.0
* [@ckeditor/ckeditor5-import-word](https://www.npmjs.com/package/@ckeditor/ckeditor5-import-word/v/47.3.0): v47.2.0 => v47.3.0
* [@ckeditor/ckeditor5-indent](https://www.npmjs.com/package/@ckeditor/ckeditor5-indent/v/47.3.0): v47.2.0 => v47.3.0
* [@ckeditor/ckeditor5-language](https://www.npmjs.com/package/@ckeditor/ckeditor5-language/v/47.3.0): v47.2.0 => v47.3.0
* [@ckeditor/ckeditor5-line-height](https://www.npmjs.com/package/@ckeditor/ckeditor5-line-height/v/47.3.0): v47.2.0 => v47.3.0
* [@ckeditor/ckeditor5-link](https://www.npmjs.com/package/@ckeditor/ckeditor5-link/v/47.3.0): v47.2.0 => v47.3.0
* [@ckeditor/ckeditor5-list](https://www.npmjs.com/package/@ckeditor/ckeditor5-list/v/47.3.0): v47.2.0 => v47.3.0
* [@ckeditor/ckeditor5-list-multi-level](https://www.npmjs.com/package/@ckeditor/ckeditor5-list-multi-level/v/47.3.0): v47.2.0 => v47.3.0
* [@ckeditor/ckeditor5-markdown-gfm](https://www.npmjs.com/package/@ckeditor/ckeditor5-markdown-gfm/v/47.3.0): v47.2.0 => v47.3.0
* [@ckeditor/ckeditor5-media-embed](https://www.npmjs.com/package/@ckeditor/ckeditor5-media-embed/v/47.3.0): v47.2.0 => v47.3.0
* [@ckeditor/ckeditor5-mention](https://www.npmjs.com/package/@ckeditor/ckeditor5-mention/v/47.3.0): v47.2.0 => v47.3.0
* [@ckeditor/ckeditor5-merge-fields](https://www.npmjs.com/package/@ckeditor/ckeditor5-merge-fields/v/47.3.0): v47.2.0 => v47.3.0
* [@ckeditor/ckeditor5-minimap](https://www.npmjs.com/package/@ckeditor/ckeditor5-minimap/v/47.3.0): v47.2.0 => v47.3.0
* [@ckeditor/ckeditor5-operations-compressor](https://www.npmjs.com/package/@ckeditor/ckeditor5-operations-compressor/v/47.3.0): v47.2.0 => v47.3.0
* [@ckeditor/ckeditor5-page-break](https://www.npmjs.com/package/@ckeditor/ckeditor5-page-break/v/47.3.0): v47.2.0 => v47.3.0
* [@ckeditor/ckeditor5-pagination](https://www.npmjs.com/package/@ckeditor/ckeditor5-pagination/v/47.3.0): v47.2.0 => v47.3.0
* [@ckeditor/ckeditor5-paragraph](https://www.npmjs.com/package/@ckeditor/ckeditor5-paragraph/v/47.3.0): v47.2.0 => v47.3.0
* [@ckeditor/ckeditor5-paste-from-office](https://www.npmjs.com/package/@ckeditor/ckeditor5-paste-from-office/v/47.3.0): v47.2.0 => v47.3.0
* [@ckeditor/ckeditor5-paste-from-office-enhanced](https://www.npmjs.com/package/@ckeditor/ckeditor5-paste-from-office-enhanced/v/47.3.0): v47.2.0 => v47.3.0
* [@ckeditor/ckeditor5-real-time-collaboration](https://www.npmjs.com/package/@ckeditor/ckeditor5-real-time-collaboration/v/47.3.0): v47.2.0 => v47.3.0
* [@ckeditor/ckeditor5-remove-format](https://www.npmjs.com/package/@ckeditor/ckeditor5-remove-format/v/47.3.0): v47.2.0 => v47.3.0
* [@ckeditor/ckeditor5-revision-history](https://www.npmjs.com/package/@ckeditor/ckeditor5-revision-history/v/47.3.0): v47.2.0 => v47.3.0
* [@ckeditor/ckeditor5-select-all](https://www.npmjs.com/package/@ckeditor/ckeditor5-select-all/v/47.3.0): v47.2.0 => v47.3.0
* [@ckeditor/ckeditor5-show-blocks](https://www.npmjs.com/package/@ckeditor/ckeditor5-show-blocks/v/47.3.0): v47.2.0 => v47.3.0
* [@ckeditor/ckeditor5-slash-command](https://www.npmjs.com/package/@ckeditor/ckeditor5-slash-command/v/47.3.0): v47.2.0 => v47.3.0
* [@ckeditor/ckeditor5-source-editing](https://www.npmjs.com/package/@ckeditor/ckeditor5-source-editing/v/47.3.0): v47.2.0 => v47.3.0
* [@ckeditor/ckeditor5-source-editing-enhanced](https://www.npmjs.com/package/@ckeditor/ckeditor5-source-editing-enhanced/v/47.3.0): v47.2.0 => v47.3.0
* [@ckeditor/ckeditor5-special-characters](https://www.npmjs.com/package/@ckeditor/ckeditor5-special-characters/v/47.3.0): v47.2.0 => v47.3.0
* [@ckeditor/ckeditor5-style](https://www.npmjs.com/package/@ckeditor/ckeditor5-style/v/47.3.0): v47.2.0 => v47.3.0
* [@ckeditor/ckeditor5-table](https://www.npmjs.com/package/@ckeditor/ckeditor5-table/v/47.3.0): v47.2.0 => v47.3.0
* [@ckeditor/ckeditor5-template](https://www.npmjs.com/package/@ckeditor/ckeditor5-template/v/47.3.0): v47.2.0 => v47.3.0
* [@ckeditor/ckeditor5-theme-lark](https://www.npmjs.com/package/@ckeditor/ckeditor5-theme-lark/v/47.3.0): v47.2.0 => v47.3.0
* [@ckeditor/ckeditor5-track-changes](https://www.npmjs.com/package/@ckeditor/ckeditor5-track-changes/v/47.3.0): v47.2.0 => v47.3.0
* [@ckeditor/ckeditor5-typing](https://www.npmjs.com/package/@ckeditor/ckeditor5-typing/v/47.3.0): v47.2.0 => v47.3.0
* [@ckeditor/ckeditor5-ui](https://www.npmjs.com/package/@ckeditor/ckeditor5-ui/v/47.3.0): v47.2.0 => v47.3.0
* [@ckeditor/ckeditor5-undo](https://www.npmjs.com/package/@ckeditor/ckeditor5-undo/v/47.3.0): v47.2.0 => v47.3.0
* [@ckeditor/ckeditor5-upload](https://www.npmjs.com/package/@ckeditor/ckeditor5-upload/v/47.3.0): v47.2.0 => v47.3.0
* [@ckeditor/ckeditor5-uploadcare](https://www.npmjs.com/package/@ckeditor/ckeditor5-uploadcare/v/47.3.0): v47.2.0 => v47.3.0
* [@ckeditor/ckeditor5-utils](https://www.npmjs.com/package/@ckeditor/ckeditor5-utils/v/47.3.0): v47.2.0 => v47.3.0
* [@ckeditor/ckeditor5-watchdog](https://www.npmjs.com/package/@ckeditor/ckeditor5-watchdog/v/47.3.0): v47.2.0 => v47.3.0
* [@ckeditor/ckeditor5-widget](https://www.npmjs.com/package/@ckeditor/ckeditor5-widget/v/47.3.0): v47.2.0 => v47.3.0
* [@ckeditor/ckeditor5-word-count](https://www.npmjs.com/package/@ckeditor/ckeditor5-word-count/v/47.3.0): v47.2.0 => v47.3.0
* [ckeditor5](https://www.npmjs.com/package/ckeditor5/v/47.3.0): v47.2.0 => v47.3.0
* [ckeditor5-collaboration](https://www.npmjs.com/package/ckeditor5-collaboration/v/47.3.0): v47.2.0 => v47.3.0
* [ckeditor5-premium-features](https://www.npmjs.com/package/ckeditor5-premium-features/v/47.3.0): v47.2.0 => v47.3.0
</details>


## [47.2.0](https://github.com/ckeditor/ckeditor5/compare/v47.1.0...v47.2.0) (November 5, 2025)

### Release highlights

#### CKEditor AI

We are introducing [**CKEditor AI**](https://ckeditor.com/docs/ckeditor5/latest/features/ai/ckeditor-ai-overview.html), a powerful writing assistant that brings AI-powered content creation directly into CKEditor 5. It helps users create, review, and refine content without switching between tools, making the editing experience faster and more productive.

CKEditor AI includes three core capabilities:

* **AI Chat**: a conversational AI assistant for multi-turn interactions that supports context setting and model selection. All conversations are tracked in a persistent chat history, and suggestions are reviewable before being applied.
* **AI Quick Actions**: one-click transformations for selected text, including rewriting, simplifying, expanding, summarizing, or adjusting tone. Changes appear inline with preview capabilities.
* **AI Review**: automatic quality assurance that checks grammar, tone, clarity, and style across the document. Suggested changes are presented in a visual review interface where users can accept or reject individual edits or apply all approved suggestions in bulk.

Power users can select their preferred model during sessions (GPT-5, Claude 3.5, Gemini 2.5, and more), while integrators maintain control over access rules and usage tiers.

Built as a plugin for CKEditor 5, it integrates quickly into existing applications with minimal configuration, and all AI interactions are fully observable via audit logs and optional APIs.

CKEditor AI is available as a premium add-on to all paid CKEditor 5 plans with a transparent subscription-plus-usage pricing model. A 14-day trial is available with access to all premium features.

#### Footnotes (⭐)

A brand-new [**Footnotes**](https://ckeditor.com/docs/ckeditor5/latest/features/footnotes.html) feature is here! It lets users insert and manage footnotes directly in their content, keeping references organized and readable. Footnotes stay linked to their source text and update automatically when edited, ideal for academic, legal, or technical writing. You can also **customize the numbering**, including the starting number and numbering style, to match your document’s formatting needs.

#### Restricted editing for blocks (⭐)

[Restricted editing](https://ckeditor.com/docs/ckeditor5/latest/features/restricted-editing.html) now supports **block-level restrictions**, not just inline ones. This makes it easier to protect the entire content while still allowing controlled edits where required. A common use case is unlocking for editing template sections like paragraphs, tables, or structured document parts, and protecting the rest of the content.

#### Old installation methods sunset timelines

We are extending the sunset period for old installation methods ([#17779](https://github.com/ckeditor/ckeditor5/issues/17779)) to the **end of Q1 2026**. It is a good moment to consider switching to the [LTS edition](https://ckeditor5.github.io/docs/nightly/ckeditor5/latest/getting-started/setup/using-lts-edition.html) for long-term stability and an additional 3 years of support for the old installation methods.

#### Other improvements and fixes

This release also brings several smaller but important enhancements and fixes:

* **View engine stability:** Fixed a bug where placeholders could remain visible after view changes, such as moving or replacing elements.
* **Downcast reliability:** The [`elementToStructure`](https://ckeditor.com/docs/ckeditor5/latest/api/module_engine_conversion_downcasthelpers-DowncastHelpers.html#function-elementToStructure) helper now handles nested structures and list elements more consistently, ensuring correct reconversion and structure maintenance.

### Features

* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai)**: Added a new configuration option, `config.ai.chat.context.searchInputVisibleFrom`, to manage the visibility of the search input in the AI Chat context panel.
* **[footnotes](https://www.npmjs.com/package/@ckeditor/ckeditor5-footnotes)**: Added a new package `@ckeditor/ckeditor5-footnotes` that provides the footnotes feature. This feature allows users to add and manage footnotes in their documents, enhancing the document's readability and providing additional context where necessary.
* **[fullscreen](https://www.npmjs.com/package/@ckeditor/ckeditor5-fullscreen)**: Enabled CKEditor AI support in Fullscreen mode, allowing users to access AI tools while editing in fullscreen. Closes [#19234](https://github.com/ckeditor/ckeditor5/issues/19234).
* **[fullscreen](https://www.npmjs.com/package/@ckeditor/ckeditor5-fullscreen)**: Sidebars in the fullscreen mode will now automatically collapsed and expanded depending on the available space in the viewport. Closes [#19294](https://github.com/ckeditor/ckeditor5/issues/19294).
* **[restricted-editing](https://www.npmjs.com/package/@ckeditor/ckeditor5-restricted-editing)**: Introduced block editable areas in restricted editing. Closes [#9071](https://github.com/ckeditor/ckeditor5/issues/9071), [#5953](https://github.com/ckeditor/ckeditor5/issues/5953).

### Bug fixes

* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai)**: If the content you were working on in `AI Balloon` gets removed (for example, by another user), a proper message will appear with the information and prevent further actions that could lead to errors.
* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai)**: Conversations loaded from AI Chat History are now correctly scrolled to the last message.
* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai)**: Fixed visual inconsistencies of hover state in AI Chat.
* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai)**: Fixed visual inconsistencies in AI Chat context section.
* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai)**: Fixed AI Chat resize button `hover` and `active` visual states.
* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai)**: Fixed various visual issues across the AI feature.
* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai)**: Fixed an issue where using DLLs for the `AI` package together with the `TrackChanges` plugin could fail due to a `DocumentCompare` plugin conflict.
* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai)**: Removed doubled border at the bottom of review mode suggestions list.
* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai)**: The styles in the AI feature operate independently from one another.
* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai)**: Prevent editor crash on exiting pending AI review check.
* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai)**: Configuration option `ai.availableReplyActions` will now also impact visibility of buttons displayed next to "Change X" header, which are displayed in AI Chat feed when AI returns multiple changes.
* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai)**: Fixed handling inline objects (such as inline images) by AI Review. Inline objects were incorrectly presented in the AI Review sidebar, and often were removed from the editor content upon accepting a change next to it.
* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai)**: When a user applied and then undone an AI-proposed change, which has affected existing markers, these markers were incorrectly removed instead of being restored.
* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai)**: Improved AI Review content processing mechanism preventing some errors originating from unexpected LLM responses.
* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai)**: Improved the positioning of the model selection dropdown in the AI Chat feature to ensure it remains visible when space is limited.
* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai)**: Navigation across changes proposed in AI Chat should not break if unsupported changes (which cannot be displayed) were returned by the agent.
* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai)**: Fixed crash happening when an AI-proposed change, that included an existing suggestion, was itself inserted as a suggestion.
* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai)**: The CKEditor AI balloon displaying content changes should remain within the viewport boundaries when used with long content selections in the editor.
* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai)**: The AI balloon with suggested content changes should always position itself next to the relevant piece of content in the editor during navigation across multiple changes.
* **[clipboard](https://www.npmjs.com/package/@ckeditor/ckeditor5-clipboard)**: The drop marker is now shown only when the target range is editable. Dropping content into non-editable is now prevented. Closes [#19028](https://github.com/ckeditor/ckeditor5/issues/19028).
* **[engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine)**: The `elementToStructure` downcast helper created elements should work more reliably in various edge cases: Closes [#16055](https://github.com/ckeditor/ckeditor5/issues/16055), [#15919](https://github.com/ckeditor/ckeditor5/issues/15919), [#11739](https://github.com/ckeditor/ckeditor5/issues/11739), [#19209](https://github.com/ckeditor/ckeditor5/issues/19209).

  * It should properly detect required reconversion on all nesting levels.
  * It should use proper position inside slot to maintain proper view structure.
  * It should refresh child elements when they got renamed, for example paragraph to heading.
  * It should work correctly with lists inside.
  * It should create proper structure with list inside.
* **[engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine)**: The `model.insertContent()` and `model.insertObject()` should verify the whole `Schema` context before checking auto-paragraphing. Closes [#19210](https://github.com/ckeditor/ckeditor5/issues/19210).
* **[engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine)**: Fixed a bug where placeholders could become stuck and remain visible on elements when the view changed. Closes [#14354](https://github.com/ckeditor/ckeditor5/issues/14354), [#18149](https://github.com/ckeditor/ckeditor5/issues/18149).

  This resolves two scenarios:

  * Dropping an image into the editor before an element with a placeholder (the placeholder could remain on the original element).
  * Moving the element that hosts the placeholder to a different place in the view tree (the placeholder could stay attached to the old node).
* **[icons](https://www.npmjs.com/package/@ckeditor/ckeditor5-icons)**: Removed obsolete `clip-path` attributes from various SVG icons (`IconAIHistory`, `IconShowChangesOff`, `IconShowChangesOn`, `IconUploadcareImageUpload`) that cause rendering issues in some corner cases. Closes [#19291](https://github.com/ckeditor/ckeditor5/issues/19291).
* **[pagination](https://www.npmjs.com/package/@ckeditor/ckeditor5-pagination)**: Fixed an issue where the pagination feature incorrectly displayed redundant page break indicators in editing mode when a page break was inserted between two tables.
* **[paste-from-office](https://www.npmjs.com/package/@ckeditor/ckeditor5-paste-from-office)**: No longer treat elements with `mso-list:none` as list items.
* **[restricted-editing](https://www.npmjs.com/package/@ckeditor/ckeditor5-restricted-editing)**: Empty editable regions created with Restricted Editing should not get dropped when reloading the editor's data. Closes [#16376](https://github.com/ckeditor/ckeditor5/issues/16376).
* **[restricted-editing](https://www.npmjs.com/package/@ckeditor/ckeditor5-restricted-editing)**: Backspace should remove content in restricted editing mode when the entire section is selected. Closes [#18892](https://github.com/ckeditor/ckeditor5/issues/18892).
* **[table](https://www.npmjs.com/package/@ckeditor/ckeditor5-table)**: The editor should not crash when trying to load data with a table inside an image caption. Closes [#19211](https://github.com/ckeditor/ckeditor5/issues/19211).
* **[table](https://www.npmjs.com/package/@ckeditor/ckeditor5-table)**: The `TableConfig` type is no longer exported as internal.
* **[widget](https://www.npmjs.com/package/@ckeditor/ckeditor5-widget)**: Fixed changing (expanding and shrinking) the selection with the keyboard while widgets are involved. Closes [#19212](https://github.com/ckeditor/ckeditor5/issues/19212).

### Other changes

* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai), [track-changes](https://www.npmjs.com/package/@ckeditor/ckeditor5-track-changes)**: CKEditor AI no longer requires the Track Changes feature, and can be used without it. In such setup, CKEditor AI will not be able to insert AI-proposed changes as suggestions and all related buttons will be hidden.
* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai)**: Renamed the automatically selected AI model to "Auto" (previously "Agent"). Allowed for using `'auto'` in `config.ai.chat.models.defaultModelId` and `config.ai.chat.models.displayedModels` configurations to make integration easier.
* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai)**: Improved real-time collaboration support in AI Review. Changes adjacent or within review suggestions in the editor content, made by remote users, will correctly invalidate/restore review suggestions.
* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai)**: Added missing `AISuggestionActionName` export, which is used in the CKEditor AI feature configuration.
* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai)**: AI Review suggestions now remain visible after being accepted or rejected, also can be marked as outdated if they are affected by RTC changes.
* **[clipboard](https://www.npmjs.com/package/@ckeditor/ckeditor5-clipboard)**: Loosened rules for drop target position lookup so it is possible to drop in-text when there is anything droppable into in-text context.
* **[icons](https://www.npmjs.com/package/@ckeditor/ckeditor5-icons)**: Added `IconDocumentOutlineToggle` icon.
* **[icons](https://www.npmjs.com/package/@ckeditor/ckeditor5-icons)**: Introducing an icon that represents an outdated state. Closes [#19282](https://github.com/ckeditor/ckeditor5/issues/19282).
* **[paste-from-office](https://www.npmjs.com/package/@ckeditor/ckeditor5-paste-from-office)**: Added normalization of footnotes while pasting content from Word.
* **[table](https://www.npmjs.com/package/@ckeditor/ckeditor5-table)**: Fixed incorrect Japanese translations for table layout feature. Closes [#19255](https://github.com/ckeditor/ckeditor5/issues/19255).

  Thanks to [@ponyoxa](https://github.com/ponyoxa).
* **[uploadcare](https://www.npmjs.com/package/@ckeditor/ckeditor5-uploadcare)**: Added a configuration option `config.uploadcare.locale` that allows providing custom translations for Uploadcare components or using predefined CDN URLs for other languages, enabling full localization beyond the default English version.
* **[utils](https://www.npmjs.com/package/@ckeditor/ckeditor5-utils)**: Exposed a utility function `getConstrainedViewportRect()`, which returns the bounds of the visible viewport. Closes [#19222](https://github.com/ckeditor/ckeditor5/issues/19222).
* **[widget](https://www.npmjs.com/package/@ckeditor/ckeditor5-widget)**: The <kbd>Esc</kbd> key handling in widgets is registered in the editable element context. This allows easier customization of handlers for <kbd>Esc</kbd> keypress inside widgets and nested editable elements.
* Updated translations.

### Released packages

Check out the [Versioning policy](https://ckeditor.com/docs/ckeditor5/latest/framework/guides/support/versioning-policy.html) guide for more information.

<details>
<summary>Released packages (summary)</summary>

New packages:

* [@ckeditor/ckeditor5-footnotes](https://www.npmjs.com/package/@ckeditor/ckeditor5-footnotes/v/47.2.0): v47.2.0

Minor releases (contain minor breaking changes):

* [@ckeditor/ckeditor5-ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai/v/47.2.0): v47.1.0 => v47.2.0

Releases containing new features:

* [@ckeditor/ckeditor5-fullscreen](https://www.npmjs.com/package/@ckeditor/ckeditor5-fullscreen/v/47.2.0): v47.1.0 => v47.2.0
* [@ckeditor/ckeditor5-restricted-editing](https://www.npmjs.com/package/@ckeditor/ckeditor5-restricted-editing/v/47.2.0): v47.1.0 => v47.2.0

Other releases:

* [@ckeditor/ckeditor5-adapter-ckfinder](https://www.npmjs.com/package/@ckeditor/ckeditor5-adapter-ckfinder/v/47.2.0): v47.1.0 => v47.2.0
* [@ckeditor/ckeditor5-alignment](https://www.npmjs.com/package/@ckeditor/ckeditor5-alignment/v/47.2.0): v47.1.0 => v47.2.0
* [@ckeditor/ckeditor5-autoformat](https://www.npmjs.com/package/@ckeditor/ckeditor5-autoformat/v/47.2.0): v47.1.0 => v47.2.0
* [@ckeditor/ckeditor5-autosave](https://www.npmjs.com/package/@ckeditor/ckeditor5-autosave/v/47.2.0): v47.1.0 => v47.2.0
* [@ckeditor/ckeditor5-basic-styles](https://www.npmjs.com/package/@ckeditor/ckeditor5-basic-styles/v/47.2.0): v47.1.0 => v47.2.0
* [@ckeditor/ckeditor5-block-quote](https://www.npmjs.com/package/@ckeditor/ckeditor5-block-quote/v/47.2.0): v47.1.0 => v47.2.0
* [@ckeditor/ckeditor5-bookmark](https://www.npmjs.com/package/@ckeditor/ckeditor5-bookmark/v/47.2.0): v47.1.0 => v47.2.0
* [@ckeditor/ckeditor5-case-change](https://www.npmjs.com/package/@ckeditor/ckeditor5-case-change/v/47.2.0): v47.1.0 => v47.2.0
* [@ckeditor/ckeditor5-ckbox](https://www.npmjs.com/package/@ckeditor/ckeditor5-ckbox/v/47.2.0): v47.1.0 => v47.2.0
* [@ckeditor/ckeditor5-ckfinder](https://www.npmjs.com/package/@ckeditor/ckeditor5-ckfinder/v/47.2.0): v47.1.0 => v47.2.0
* [@ckeditor/ckeditor5-clipboard](https://www.npmjs.com/package/@ckeditor/ckeditor5-clipboard/v/47.2.0): v47.1.0 => v47.2.0
* [@ckeditor/ckeditor5-cloud-services](https://www.npmjs.com/package/@ckeditor/ckeditor5-cloud-services/v/47.2.0): v47.1.0 => v47.2.0
* [@ckeditor/ckeditor5-code-block](https://www.npmjs.com/package/@ckeditor/ckeditor5-code-block/v/47.2.0): v47.1.0 => v47.2.0
* [@ckeditor/ckeditor5-collaboration-core](https://www.npmjs.com/package/@ckeditor/ckeditor5-collaboration-core/v/47.2.0): v47.1.0 => v47.2.0
* [@ckeditor/ckeditor5-comments](https://www.npmjs.com/package/@ckeditor/ckeditor5-comments/v/47.2.0): v47.1.0 => v47.2.0
* [@ckeditor/ckeditor5-core](https://www.npmjs.com/package/@ckeditor/ckeditor5-core/v/47.2.0): v47.1.0 => v47.2.0
* [@ckeditor/ckeditor5-document-outline](https://www.npmjs.com/package/@ckeditor/ckeditor5-document-outline/v/47.2.0): v47.1.0 => v47.2.0
* [@ckeditor/ckeditor5-easy-image](https://www.npmjs.com/package/@ckeditor/ckeditor5-easy-image/v/47.2.0): v47.1.0 => v47.2.0
* [@ckeditor/ckeditor5-editor-balloon](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-balloon/v/47.2.0): v47.1.0 => v47.2.0
* [@ckeditor/ckeditor5-editor-classic](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-classic/v/47.2.0): v47.1.0 => v47.2.0
* [@ckeditor/ckeditor5-editor-decoupled](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-decoupled/v/47.2.0): v47.1.0 => v47.2.0
* [@ckeditor/ckeditor5-editor-inline](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-inline/v/47.2.0): v47.1.0 => v47.2.0
* [@ckeditor/ckeditor5-editor-multi-root](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-multi-root/v/47.2.0): v47.1.0 => v47.2.0
* [@ckeditor/ckeditor5-email](https://www.npmjs.com/package/@ckeditor/ckeditor5-email/v/47.2.0): v47.1.0 => v47.2.0
* [@ckeditor/ckeditor5-emoji](https://www.npmjs.com/package/@ckeditor/ckeditor5-emoji/v/47.2.0): v47.1.0 => v47.2.0
* [@ckeditor/ckeditor5-engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine/v/47.2.0): v47.1.0 => v47.2.0
* [@ckeditor/ckeditor5-enter](https://www.npmjs.com/package/@ckeditor/ckeditor5-enter/v/47.2.0): v47.1.0 => v47.2.0
* [@ckeditor/ckeditor5-essentials](https://www.npmjs.com/package/@ckeditor/ckeditor5-essentials/v/47.2.0): v47.1.0 => v47.2.0
* [@ckeditor/ckeditor5-export-inline-styles](https://www.npmjs.com/package/@ckeditor/ckeditor5-export-inline-styles/v/47.2.0): v47.1.0 => v47.2.0
* [@ckeditor/ckeditor5-export-pdf](https://www.npmjs.com/package/@ckeditor/ckeditor5-export-pdf/v/47.2.0): v47.1.0 => v47.2.0
* [@ckeditor/ckeditor5-export-word](https://www.npmjs.com/package/@ckeditor/ckeditor5-export-word/v/47.2.0): v47.1.0 => v47.2.0
* [@ckeditor/ckeditor5-find-and-replace](https://www.npmjs.com/package/@ckeditor/ckeditor5-find-and-replace/v/47.2.0): v47.1.0 => v47.2.0
* [@ckeditor/ckeditor5-font](https://www.npmjs.com/package/@ckeditor/ckeditor5-font/v/47.2.0): v47.1.0 => v47.2.0
* [@ckeditor/ckeditor5-format-painter](https://www.npmjs.com/package/@ckeditor/ckeditor5-format-painter/v/47.2.0): v47.1.0 => v47.2.0
* [@ckeditor/ckeditor5-heading](https://www.npmjs.com/package/@ckeditor/ckeditor5-heading/v/47.2.0): v47.1.0 => v47.2.0
* [@ckeditor/ckeditor5-highlight](https://www.npmjs.com/package/@ckeditor/ckeditor5-highlight/v/47.2.0): v47.1.0 => v47.2.0
* [@ckeditor/ckeditor5-horizontal-line](https://www.npmjs.com/package/@ckeditor/ckeditor5-horizontal-line/v/47.2.0): v47.1.0 => v47.2.0
* [@ckeditor/ckeditor5-html-embed](https://www.npmjs.com/package/@ckeditor/ckeditor5-html-embed/v/47.2.0): v47.1.0 => v47.2.0
* [@ckeditor/ckeditor5-html-support](https://www.npmjs.com/package/@ckeditor/ckeditor5-html-support/v/47.2.0): v47.1.0 => v47.2.0
* [@ckeditor/ckeditor5-icons](https://www.npmjs.com/package/@ckeditor/ckeditor5-icons/v/47.2.0): v47.1.0 => v47.2.0
* [@ckeditor/ckeditor5-image](https://www.npmjs.com/package/@ckeditor/ckeditor5-image/v/47.2.0): v47.1.0 => v47.2.0
* [@ckeditor/ckeditor5-import-word](https://www.npmjs.com/package/@ckeditor/ckeditor5-import-word/v/47.2.0): v47.1.0 => v47.2.0
* [@ckeditor/ckeditor5-indent](https://www.npmjs.com/package/@ckeditor/ckeditor5-indent/v/47.2.0): v47.1.0 => v47.2.0
* [@ckeditor/ckeditor5-language](https://www.npmjs.com/package/@ckeditor/ckeditor5-language/v/47.2.0): v47.1.0 => v47.2.0
* [@ckeditor/ckeditor5-line-height](https://www.npmjs.com/package/@ckeditor/ckeditor5-line-height/v/47.2.0): v47.1.0 => v47.2.0
* [@ckeditor/ckeditor5-link](https://www.npmjs.com/package/@ckeditor/ckeditor5-link/v/47.2.0): v47.1.0 => v47.2.0
* [@ckeditor/ckeditor5-list](https://www.npmjs.com/package/@ckeditor/ckeditor5-list/v/47.2.0): v47.1.0 => v47.2.0
* [@ckeditor/ckeditor5-list-multi-level](https://www.npmjs.com/package/@ckeditor/ckeditor5-list-multi-level/v/47.2.0): v47.1.0 => v47.2.0
* [@ckeditor/ckeditor5-markdown-gfm](https://www.npmjs.com/package/@ckeditor/ckeditor5-markdown-gfm/v/47.2.0): v47.1.0 => v47.2.0
* [@ckeditor/ckeditor5-media-embed](https://www.npmjs.com/package/@ckeditor/ckeditor5-media-embed/v/47.2.0): v47.1.0 => v47.2.0
* [@ckeditor/ckeditor5-mention](https://www.npmjs.com/package/@ckeditor/ckeditor5-mention/v/47.2.0): v47.1.0 => v47.2.0
* [@ckeditor/ckeditor5-merge-fields](https://www.npmjs.com/package/@ckeditor/ckeditor5-merge-fields/v/47.2.0): v47.1.0 => v47.2.0
* [@ckeditor/ckeditor5-minimap](https://www.npmjs.com/package/@ckeditor/ckeditor5-minimap/v/47.2.0): v47.1.0 => v47.2.0
* [@ckeditor/ckeditor5-operations-compressor](https://www.npmjs.com/package/@ckeditor/ckeditor5-operations-compressor/v/47.2.0): v47.1.0 => v47.2.0
* [@ckeditor/ckeditor5-page-break](https://www.npmjs.com/package/@ckeditor/ckeditor5-page-break/v/47.2.0): v47.1.0 => v47.2.0
* [@ckeditor/ckeditor5-pagination](https://www.npmjs.com/package/@ckeditor/ckeditor5-pagination/v/47.2.0): v47.1.0 => v47.2.0
* [@ckeditor/ckeditor5-paragraph](https://www.npmjs.com/package/@ckeditor/ckeditor5-paragraph/v/47.2.0): v47.1.0 => v47.2.0
* [@ckeditor/ckeditor5-paste-from-office](https://www.npmjs.com/package/@ckeditor/ckeditor5-paste-from-office/v/47.2.0): v47.1.0 => v47.2.0
* [@ckeditor/ckeditor5-paste-from-office-enhanced](https://www.npmjs.com/package/@ckeditor/ckeditor5-paste-from-office-enhanced/v/47.2.0): v47.1.0 => v47.2.0
* [@ckeditor/ckeditor5-real-time-collaboration](https://www.npmjs.com/package/@ckeditor/ckeditor5-real-time-collaboration/v/47.2.0): v47.1.0 => v47.2.0
* [@ckeditor/ckeditor5-remove-format](https://www.npmjs.com/package/@ckeditor/ckeditor5-remove-format/v/47.2.0): v47.1.0 => v47.2.0
* [@ckeditor/ckeditor5-revision-history](https://www.npmjs.com/package/@ckeditor/ckeditor5-revision-history/v/47.2.0): v47.1.0 => v47.2.0
* [@ckeditor/ckeditor5-select-all](https://www.npmjs.com/package/@ckeditor/ckeditor5-select-all/v/47.2.0): v47.1.0 => v47.2.0
* [@ckeditor/ckeditor5-show-blocks](https://www.npmjs.com/package/@ckeditor/ckeditor5-show-blocks/v/47.2.0): v47.1.0 => v47.2.0
* [@ckeditor/ckeditor5-slash-command](https://www.npmjs.com/package/@ckeditor/ckeditor5-slash-command/v/47.2.0): v47.1.0 => v47.2.0
* [@ckeditor/ckeditor5-source-editing](https://www.npmjs.com/package/@ckeditor/ckeditor5-source-editing/v/47.2.0): v47.1.0 => v47.2.0
* [@ckeditor/ckeditor5-source-editing-enhanced](https://www.npmjs.com/package/@ckeditor/ckeditor5-source-editing-enhanced/v/47.2.0): v47.1.0 => v47.2.0
* [@ckeditor/ckeditor5-special-characters](https://www.npmjs.com/package/@ckeditor/ckeditor5-special-characters/v/47.2.0): v47.1.0 => v47.2.0
* [@ckeditor/ckeditor5-style](https://www.npmjs.com/package/@ckeditor/ckeditor5-style/v/47.2.0): v47.1.0 => v47.2.0
* [@ckeditor/ckeditor5-table](https://www.npmjs.com/package/@ckeditor/ckeditor5-table/v/47.2.0): v47.1.0 => v47.2.0
* [@ckeditor/ckeditor5-template](https://www.npmjs.com/package/@ckeditor/ckeditor5-template/v/47.2.0): v47.1.0 => v47.2.0
* [@ckeditor/ckeditor5-theme-lark](https://www.npmjs.com/package/@ckeditor/ckeditor5-theme-lark/v/47.2.0): v47.1.0 => v47.2.0
* [@ckeditor/ckeditor5-track-changes](https://www.npmjs.com/package/@ckeditor/ckeditor5-track-changes/v/47.2.0): v47.1.0 => v47.2.0
* [@ckeditor/ckeditor5-typing](https://www.npmjs.com/package/@ckeditor/ckeditor5-typing/v/47.2.0): v47.1.0 => v47.2.0
* [@ckeditor/ckeditor5-ui](https://www.npmjs.com/package/@ckeditor/ckeditor5-ui/v/47.2.0): v47.1.0 => v47.2.0
* [@ckeditor/ckeditor5-undo](https://www.npmjs.com/package/@ckeditor/ckeditor5-undo/v/47.2.0): v47.1.0 => v47.2.0
* [@ckeditor/ckeditor5-upload](https://www.npmjs.com/package/@ckeditor/ckeditor5-upload/v/47.2.0): v47.1.0 => v47.2.0
* [@ckeditor/ckeditor5-uploadcare](https://www.npmjs.com/package/@ckeditor/ckeditor5-uploadcare/v/47.2.0): v47.1.0 => v47.2.0
* [@ckeditor/ckeditor5-utils](https://www.npmjs.com/package/@ckeditor/ckeditor5-utils/v/47.2.0): v47.1.0 => v47.2.0
* [@ckeditor/ckeditor5-watchdog](https://www.npmjs.com/package/@ckeditor/ckeditor5-watchdog/v/47.2.0): v47.1.0 => v47.2.0
* [@ckeditor/ckeditor5-widget](https://www.npmjs.com/package/@ckeditor/ckeditor5-widget/v/47.2.0): v47.1.0 => v47.2.0
* [@ckeditor/ckeditor5-word-count](https://www.npmjs.com/package/@ckeditor/ckeditor5-word-count/v/47.2.0): v47.1.0 => v47.2.0
* [ckeditor5](https://www.npmjs.com/package/ckeditor5/v/47.2.0): v47.1.0 => v47.2.0
* [ckeditor5-collaboration](https://www.npmjs.com/package/ckeditor5-collaboration/v/47.2.0): v47.1.0 => v47.2.0
* [ckeditor5-premium-features](https://www.npmjs.com/package/ckeditor5-premium-features/v/47.2.0): v47.1.0 => v47.2.0
</details>


## [47.1.0](https://github.com/ckeditor/ckeditor5/compare/v47.0.0...v47.1.0) (October 16, 2025)

We are happy to announce the release of CKEditor 5 v47.1.0.

### Release highlights

This release introduces a minor stability update, featuring focused fixes and UX improvements.

### MINOR BREAKING CHANGES [ℹ️](https://ckeditor.com/docs/ckeditor5/latest/framework/guides/support/versioning-policy.html#major-and-minor-breaking-changes)

* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai)**: Simplified CSS for the CKEditor AI integration in a sidebar mode (`config.ai.container.type: 'sidebar'`) by removing default layout constraints:

  * Removed the default `min-height` from `.ck-ai-chat`,
  * Removed the default `height` from `.ck-tabs`,
  * Removed the default `width` from `.ck-ai-tabs`.

  Also, the `--ck-tabs-panels-container-width` custom property has been removed from the codebase.

> [!NOTE]
> Breaking changes in CKEditor AI are permitted during the Active phase of an LTS release. [Learn more why](https://ckeditor.com/docs/ckeditor5/latest/getting-started/setup/using-lts-edition.html#features-excluded-from-the-no-breaking-changes-guarantee-v47x).

### Features

* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai)**: Added the `config.ai.container.visibleByDefault` configuration option to allow for hiding the AI component on the editor initialization.

### Bug fixes

* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai)**: Fixed TypeScript errors when using the `AIChat` plugin caused by incompatible `constructor()` signatures.
* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai)**: The editor no longer throws an error when accepting or rejecting proposed changes in review mode for "Adjust length" and "Adjust tone and style" checks.
* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai)**: Fixed an issue where balloons were displayed under the AI container in the overlay mode.
* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai)**: "Chat commands" from AI Quick Actions could not be correctly used if the selection was collapsed (nothing was selected). Now, a collapsed selection is correctly expanded to the entire element, which includes the selection.
* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai)**: AI Quick Action buttons added to the editor toolbar and to the balloon toolbar will no longer gain focus on hover, which had led to incorrect UI behavior.
* **[link](https://www.npmjs.com/package/@ckeditor/ckeditor5-link)**: Changing the link's "displayed text" using the link contextual balloon resulted in incorrect changes if track changes were turned on. Closes [#19193](https://github.com/ckeditor/ckeditor5/issues/19193).
* **[pagination](https://www.npmjs.com/package/@ckeditor/ckeditor5-pagination)**: Images placed in tables should not affect the pagination calculations.
* **[revision-history](https://www.npmjs.com/package/@ckeditor/ckeditor5-revision-history)**: Revision history was showing incorrect revision data in a scenario where, for the same current revision, a user made a deletion before another user's deletion, in the same element.

### Other changes

* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai)**: Improved performance of the AI Chat prompt input field, which was lagging while typing if the AI Chat feed contained a very long conversation.
* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai)**: Made the `config.ai.chat.models` configuration property optional because a default configuration is always provided by the plugin anyway.
* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai)**: Enabled keyboard navigation within the custom command form in AI Review.
* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai)**: Added validation to the AI Review custom command form to disallow sending an empty prompt.
* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai)**: Changes proposed by AI, which cannot be applied anymore due to other changes that happened in the document, will now be marked as outdated instead of throwing an error when interacted with.
* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai)**: Improved the title for AI Review parameterized and custom checks, so it is clear what parameters were used to run the review.
* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai)**: AI Chat will now display a message if the requested model is no longer available. This may happen, for example, when a conversation is loaded from the history.
* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai)**: `AIQuickActions` now adds `AIActions` plugin as its dependency. This is to ensure that the AI Quick Actions dropdown is populated by the default set of actions, without the need to add `AIActions` plugin manually.

### Released packages

Check out the [Versioning policy](https://ckeditor.com/docs/ckeditor5/latest/framework/guides/support/versioning-policy.html) guide for more information.

<details>
<summary>Released packages (summary)</summary>

Minor releases (contain minor breaking changes):

* [@ckeditor/ckeditor5-ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai/v/47.1.0): v47.0.0 => v47.1.0

Other releases:

* [@ckeditor/ckeditor5-adapter-ckfinder](https://www.npmjs.com/package/@ckeditor/ckeditor5-adapter-ckfinder/v/47.1.0): v47.0.0 => v47.1.0
* [@ckeditor/ckeditor5-alignment](https://www.npmjs.com/package/@ckeditor/ckeditor5-alignment/v/47.1.0): v47.0.0 => v47.1.0
* [@ckeditor/ckeditor5-autoformat](https://www.npmjs.com/package/@ckeditor/ckeditor5-autoformat/v/47.1.0): v47.0.0 => v47.1.0
* [@ckeditor/ckeditor5-autosave](https://www.npmjs.com/package/@ckeditor/ckeditor5-autosave/v/47.1.0): v47.0.0 => v47.1.0
* [@ckeditor/ckeditor5-basic-styles](https://www.npmjs.com/package/@ckeditor/ckeditor5-basic-styles/v/47.1.0): v47.0.0 => v47.1.0
* [@ckeditor/ckeditor5-block-quote](https://www.npmjs.com/package/@ckeditor/ckeditor5-block-quote/v/47.1.0): v47.0.0 => v47.1.0
* [@ckeditor/ckeditor5-bookmark](https://www.npmjs.com/package/@ckeditor/ckeditor5-bookmark/v/47.1.0): v47.0.0 => v47.1.0
* [@ckeditor/ckeditor5-case-change](https://www.npmjs.com/package/@ckeditor/ckeditor5-case-change/v/47.1.0): v47.0.0 => v47.1.0
* [@ckeditor/ckeditor5-ckbox](https://www.npmjs.com/package/@ckeditor/ckeditor5-ckbox/v/47.1.0): v47.0.0 => v47.1.0
* [@ckeditor/ckeditor5-ckfinder](https://www.npmjs.com/package/@ckeditor/ckeditor5-ckfinder/v/47.1.0): v47.0.0 => v47.1.0
* [@ckeditor/ckeditor5-clipboard](https://www.npmjs.com/package/@ckeditor/ckeditor5-clipboard/v/47.1.0): v47.0.0 => v47.1.0
* [@ckeditor/ckeditor5-cloud-services](https://www.npmjs.com/package/@ckeditor/ckeditor5-cloud-services/v/47.1.0): v47.0.0 => v47.1.0
* [@ckeditor/ckeditor5-code-block](https://www.npmjs.com/package/@ckeditor/ckeditor5-code-block/v/47.1.0): v47.0.0 => v47.1.0
* [@ckeditor/ckeditor5-collaboration-core](https://www.npmjs.com/package/@ckeditor/ckeditor5-collaboration-core/v/47.1.0): v47.0.0 => v47.1.0
* [@ckeditor/ckeditor5-comments](https://www.npmjs.com/package/@ckeditor/ckeditor5-comments/v/47.1.0): v47.0.0 => v47.1.0
* [@ckeditor/ckeditor5-core](https://www.npmjs.com/package/@ckeditor/ckeditor5-core/v/47.1.0): v47.0.0 => v47.1.0
* [@ckeditor/ckeditor5-document-outline](https://www.npmjs.com/package/@ckeditor/ckeditor5-document-outline/v/47.1.0): v47.0.0 => v47.1.0
* [@ckeditor/ckeditor5-easy-image](https://www.npmjs.com/package/@ckeditor/ckeditor5-easy-image/v/47.1.0): v47.0.0 => v47.1.0
* [@ckeditor/ckeditor5-editor-balloon](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-balloon/v/47.1.0): v47.0.0 => v47.1.0
* [@ckeditor/ckeditor5-editor-classic](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-classic/v/47.1.0): v47.0.0 => v47.1.0
* [@ckeditor/ckeditor5-editor-decoupled](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-decoupled/v/47.1.0): v47.0.0 => v47.1.0
* [@ckeditor/ckeditor5-editor-inline](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-inline/v/47.1.0): v47.0.0 => v47.1.0
* [@ckeditor/ckeditor5-editor-multi-root](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-multi-root/v/47.1.0): v47.0.0 => v47.1.0
* [@ckeditor/ckeditor5-email](https://www.npmjs.com/package/@ckeditor/ckeditor5-email/v/47.1.0): v47.0.0 => v47.1.0
* [@ckeditor/ckeditor5-emoji](https://www.npmjs.com/package/@ckeditor/ckeditor5-emoji/v/47.1.0): v47.0.0 => v47.1.0
* [@ckeditor/ckeditor5-engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine/v/47.1.0): v47.0.0 => v47.1.0
* [@ckeditor/ckeditor5-enter](https://www.npmjs.com/package/@ckeditor/ckeditor5-enter/v/47.1.0): v47.0.0 => v47.1.0
* [@ckeditor/ckeditor5-essentials](https://www.npmjs.com/package/@ckeditor/ckeditor5-essentials/v/47.1.0): v47.0.0 => v47.1.0
* [@ckeditor/ckeditor5-export-inline-styles](https://www.npmjs.com/package/@ckeditor/ckeditor5-export-inline-styles/v/47.1.0): v47.0.0 => v47.1.0
* [@ckeditor/ckeditor5-export-pdf](https://www.npmjs.com/package/@ckeditor/ckeditor5-export-pdf/v/47.1.0): v47.0.0 => v47.1.0
* [@ckeditor/ckeditor5-export-word](https://www.npmjs.com/package/@ckeditor/ckeditor5-export-word/v/47.1.0): v47.0.0 => v47.1.0
* [@ckeditor/ckeditor5-find-and-replace](https://www.npmjs.com/package/@ckeditor/ckeditor5-find-and-replace/v/47.1.0): v47.0.0 => v47.1.0
* [@ckeditor/ckeditor5-font](https://www.npmjs.com/package/@ckeditor/ckeditor5-font/v/47.1.0): v47.0.0 => v47.1.0
* [@ckeditor/ckeditor5-format-painter](https://www.npmjs.com/package/@ckeditor/ckeditor5-format-painter/v/47.1.0): v47.0.0 => v47.1.0
* [@ckeditor/ckeditor5-fullscreen](https://www.npmjs.com/package/@ckeditor/ckeditor5-fullscreen/v/47.1.0): v47.0.0 => v47.1.0
* [@ckeditor/ckeditor5-heading](https://www.npmjs.com/package/@ckeditor/ckeditor5-heading/v/47.1.0): v47.0.0 => v47.1.0
* [@ckeditor/ckeditor5-highlight](https://www.npmjs.com/package/@ckeditor/ckeditor5-highlight/v/47.1.0): v47.0.0 => v47.1.0
* [@ckeditor/ckeditor5-horizontal-line](https://www.npmjs.com/package/@ckeditor/ckeditor5-horizontal-line/v/47.1.0): v47.0.0 => v47.1.0
* [@ckeditor/ckeditor5-html-embed](https://www.npmjs.com/package/@ckeditor/ckeditor5-html-embed/v/47.1.0): v47.0.0 => v47.1.0
* [@ckeditor/ckeditor5-html-support](https://www.npmjs.com/package/@ckeditor/ckeditor5-html-support/v/47.1.0): v47.0.0 => v47.1.0
* [@ckeditor/ckeditor5-icons](https://www.npmjs.com/package/@ckeditor/ckeditor5-icons/v/47.1.0): v47.0.0 => v47.1.0
* [@ckeditor/ckeditor5-image](https://www.npmjs.com/package/@ckeditor/ckeditor5-image/v/47.1.0): v47.0.0 => v47.1.0
* [@ckeditor/ckeditor5-import-word](https://www.npmjs.com/package/@ckeditor/ckeditor5-import-word/v/47.1.0): v47.0.0 => v47.1.0
* [@ckeditor/ckeditor5-indent](https://www.npmjs.com/package/@ckeditor/ckeditor5-indent/v/47.1.0): v47.0.0 => v47.1.0
* [@ckeditor/ckeditor5-language](https://www.npmjs.com/package/@ckeditor/ckeditor5-language/v/47.1.0): v47.0.0 => v47.1.0
* [@ckeditor/ckeditor5-line-height](https://www.npmjs.com/package/@ckeditor/ckeditor5-line-height/v/47.1.0): v47.0.0 => v47.1.0
* [@ckeditor/ckeditor5-link](https://www.npmjs.com/package/@ckeditor/ckeditor5-link/v/47.1.0): v47.0.0 => v47.1.0
* [@ckeditor/ckeditor5-list](https://www.npmjs.com/package/@ckeditor/ckeditor5-list/v/47.1.0): v47.0.0 => v47.1.0
* [@ckeditor/ckeditor5-list-multi-level](https://www.npmjs.com/package/@ckeditor/ckeditor5-list-multi-level/v/47.1.0): v47.0.0 => v47.1.0
* [@ckeditor/ckeditor5-markdown-gfm](https://www.npmjs.com/package/@ckeditor/ckeditor5-markdown-gfm/v/47.1.0): v47.0.0 => v47.1.0
* [@ckeditor/ckeditor5-media-embed](https://www.npmjs.com/package/@ckeditor/ckeditor5-media-embed/v/47.1.0): v47.0.0 => v47.1.0
* [@ckeditor/ckeditor5-mention](https://www.npmjs.com/package/@ckeditor/ckeditor5-mention/v/47.1.0): v47.0.0 => v47.1.0
* [@ckeditor/ckeditor5-merge-fields](https://www.npmjs.com/package/@ckeditor/ckeditor5-merge-fields/v/47.1.0): v47.0.0 => v47.1.0
* [@ckeditor/ckeditor5-minimap](https://www.npmjs.com/package/@ckeditor/ckeditor5-minimap/v/47.1.0): v47.0.0 => v47.1.0
* [@ckeditor/ckeditor5-operations-compressor](https://www.npmjs.com/package/@ckeditor/ckeditor5-operations-compressor/v/47.1.0): v47.0.0 => v47.1.0
* [@ckeditor/ckeditor5-page-break](https://www.npmjs.com/package/@ckeditor/ckeditor5-page-break/v/47.1.0): v47.0.0 => v47.1.0
* [@ckeditor/ckeditor5-pagination](https://www.npmjs.com/package/@ckeditor/ckeditor5-pagination/v/47.1.0): v47.0.0 => v47.1.0
* [@ckeditor/ckeditor5-paragraph](https://www.npmjs.com/package/@ckeditor/ckeditor5-paragraph/v/47.1.0): v47.0.0 => v47.1.0
* [@ckeditor/ckeditor5-paste-from-office](https://www.npmjs.com/package/@ckeditor/ckeditor5-paste-from-office/v/47.1.0): v47.0.0 => v47.1.0
* [@ckeditor/ckeditor5-paste-from-office-enhanced](https://www.npmjs.com/package/@ckeditor/ckeditor5-paste-from-office-enhanced/v/47.1.0): v47.0.0 => v47.1.0
* [@ckeditor/ckeditor5-real-time-collaboration](https://www.npmjs.com/package/@ckeditor/ckeditor5-real-time-collaboration/v/47.1.0): v47.0.0 => v47.1.0
* [@ckeditor/ckeditor5-remove-format](https://www.npmjs.com/package/@ckeditor/ckeditor5-remove-format/v/47.1.0): v47.0.0 => v47.1.0
* [@ckeditor/ckeditor5-restricted-editing](https://www.npmjs.com/package/@ckeditor/ckeditor5-restricted-editing/v/47.1.0): v47.0.0 => v47.1.0
* [@ckeditor/ckeditor5-revision-history](https://www.npmjs.com/package/@ckeditor/ckeditor5-revision-history/v/47.1.0): v47.0.0 => v47.1.0
* [@ckeditor/ckeditor5-select-all](https://www.npmjs.com/package/@ckeditor/ckeditor5-select-all/v/47.1.0): v47.0.0 => v47.1.0
* [@ckeditor/ckeditor5-show-blocks](https://www.npmjs.com/package/@ckeditor/ckeditor5-show-blocks/v/47.1.0): v47.0.0 => v47.1.0
* [@ckeditor/ckeditor5-slash-command](https://www.npmjs.com/package/@ckeditor/ckeditor5-slash-command/v/47.1.0): v47.0.0 => v47.1.0
* [@ckeditor/ckeditor5-source-editing](https://www.npmjs.com/package/@ckeditor/ckeditor5-source-editing/v/47.1.0): v47.0.0 => v47.1.0
* [@ckeditor/ckeditor5-source-editing-enhanced](https://www.npmjs.com/package/@ckeditor/ckeditor5-source-editing-enhanced/v/47.1.0): v47.0.0 => v47.1.0
* [@ckeditor/ckeditor5-special-characters](https://www.npmjs.com/package/@ckeditor/ckeditor5-special-characters/v/47.1.0): v47.0.0 => v47.1.0
* [@ckeditor/ckeditor5-style](https://www.npmjs.com/package/@ckeditor/ckeditor5-style/v/47.1.0): v47.0.0 => v47.1.0
* [@ckeditor/ckeditor5-table](https://www.npmjs.com/package/@ckeditor/ckeditor5-table/v/47.1.0): v47.0.0 => v47.1.0
* [@ckeditor/ckeditor5-template](https://www.npmjs.com/package/@ckeditor/ckeditor5-template/v/47.1.0): v47.0.0 => v47.1.0
* [@ckeditor/ckeditor5-theme-lark](https://www.npmjs.com/package/@ckeditor/ckeditor5-theme-lark/v/47.1.0): v47.0.0 => v47.1.0
* [@ckeditor/ckeditor5-track-changes](https://www.npmjs.com/package/@ckeditor/ckeditor5-track-changes/v/47.1.0): v47.0.0 => v47.1.0
* [@ckeditor/ckeditor5-typing](https://www.npmjs.com/package/@ckeditor/ckeditor5-typing/v/47.1.0): v47.0.0 => v47.1.0
* [@ckeditor/ckeditor5-ui](https://www.npmjs.com/package/@ckeditor/ckeditor5-ui/v/47.1.0): v47.0.0 => v47.1.0
* [@ckeditor/ckeditor5-undo](https://www.npmjs.com/package/@ckeditor/ckeditor5-undo/v/47.1.0): v47.0.0 => v47.1.0
* [@ckeditor/ckeditor5-upload](https://www.npmjs.com/package/@ckeditor/ckeditor5-upload/v/47.1.0): v47.0.0 => v47.1.0
* [@ckeditor/ckeditor5-uploadcare](https://www.npmjs.com/package/@ckeditor/ckeditor5-uploadcare/v/47.1.0): v47.0.0 => v47.1.0
* [@ckeditor/ckeditor5-utils](https://www.npmjs.com/package/@ckeditor/ckeditor5-utils/v/47.1.0): v47.0.0 => v47.1.0
* [@ckeditor/ckeditor5-watchdog](https://www.npmjs.com/package/@ckeditor/ckeditor5-watchdog/v/47.1.0): v47.0.0 => v47.1.0
* [@ckeditor/ckeditor5-widget](https://www.npmjs.com/package/@ckeditor/ckeditor5-widget/v/47.1.0): v47.0.0 => v47.1.0
* [@ckeditor/ckeditor5-word-count](https://www.npmjs.com/package/@ckeditor/ckeditor5-word-count/v/47.1.0): v47.0.0 => v47.1.0
* [ckeditor5](https://www.npmjs.com/package/ckeditor5/v/47.1.0): v47.0.0 => v47.1.0
* [ckeditor5-collaboration](https://www.npmjs.com/package/ckeditor5-collaboration/v/47.1.0): v47.0.0 => v47.1.0
* [ckeditor5-premium-features](https://www.npmjs.com/package/ckeditor5-premium-features/v/47.1.0): v47.0.0 => v47.1.0
</details>


## [47.0.0](https://github.com/ckeditor/ckeditor5/compare/v46.1.1...v47.0.0) (October 1, 2025)

We are happy to announce the release of CKEditor 5 v47.0.0.

### Release highlights

#### CKEditor AI (early access)

We are introducing [**CKEditor AI**](https://ckeditor.com/docs/ckeditor5/latest/features/ai/ckeditor-ai-overview.html), a set of versatile AI-powered features that integrate directly into CKEditor 5. It brings generation, summarization, correction, contextual chat help, reviews, and many other capabilities, right into the editor. With **CKEditor AI**, users will no longer need to switch between the editor and AI tools.

Three features are available in this early access phase:

* **Chat:** a conversational AI for dynamic, multi-turn interactions that support various context sources, model selection, which can perform changes directly on the document.
* **Quick actions:** one-click transformations and instant insights for selected text.
* **Review:** automatic checks for grammar, tone, correctness, style, and more, with UX optimized for performing full-document review.

Each feature is powered by our state-of-the-art AI service, available in the Cloud today and coming soon for on-premises deployments. This makes CKEditor AI a true plug-and-play solution that works out of the box, eliminating the need for months of custom development.

CKEditor AI is available as part of our **free trial** in early access.

#### Long-term Support (⭐)

We are introducing the **CKEditor 5 LTS (Long-term Support) Edition**, giving teams up to 3 years of stability with guaranteed updates.

The first LTS release is **v47.0.0** (October 2025). It will receive **6 months of active development** with new features and fixes, then **2.5 years of maintenance** with security and critical compatibility updates.

For **v47.x**, the Maintenance phase starts in **April 2026**. From then, the next versions in the v47.x line will be available only under a **commercial LTS Edition license**. Therefore, starting in April, integrators without an LTS license should migrate to v48.x (the next regular release).

If you need long-term stability, [contact sales](https://ckeditor.com/contact-sales/) or read more about [CKEditor 5 LTS Edition](https://ckeditor.com/docs/ckeditor5/latest/getting-started/setup/using-lts-edition.html).

#### Other improvements and fixes

This release also brings several smaller but important enhancements and fixes:

* **Widgets:** the default `Tab`/`Shift+Tab` navigation now works better inside nested editables, improving usability. This change is also reflected in the editor’s current widgets (like tables), leading to more intuitive keyboard navigation.
* **UI:** dialogs in custom features can now be positioned programmatically with more flexible options (`Dialog#show()`).
* **Comments:** confirmation views for deleting comments and threads now use simplified CSS selectors (`.ck-confirm-view`). You may need to adjust custom styles accordingly.

Please refer to the [update guide](https://ckeditor.com/docs/ckeditor5/latest/updating/guides/update-to-47.html) to learn more about these changes.

### MAJOR BREAKING CHANGES [ℹ️](https://ckeditor.com/docs/ckeditor5/latest/framework/guides/support/versioning-policy.html#major-and-minor-breaking-changes)

* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai)**: Due to the release of the new AI feature, the `ai.*` configuration structure has changed. Until now, the configuration object was used for the former `AIAssistant` feature. Now, this configuration space is used for all AI related features. Configuration for the `AIAssistant` was moved. The changes are:
  * `ai.aiAssistant` -> `ai.assistant`,
  * `ai.useTheme` -> `ai.assistant.useTheme`,
  * `ai.aws` -> `ai.assistant.adapter.aws`,
  * `ai.openAI` -> `ai.assistant.adapter.openAI`.

### MINOR BREAKING CHANGES [ℹ️](https://ckeditor.com/docs/ckeditor5/latest/framework/guides/support/versioning-policy.html#major-and-minor-breaking-changes)

* **[table](https://www.npmjs.com/package/@ckeditor/ckeditor5-table), [widget](https://www.npmjs.com/package/@ckeditor/ckeditor5-widget)**: The Widget feature implements the default handling for `Tab`/`Shift+Tab` to navigate nested editable elements in the editor content. Closes [#19083](https://github.com/ckeditor/ckeditor5/issues/19083). The listeners are registered on the `low` priority bubbling event in the context of widgets and editable elements. Please verify if your custom `Tab`/`Shift+Tab` handling does not collide with the default one.
* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai)**: The internal structure of the package has changed. Importing `AIAssistant` from the source should be done via `@ckeditor/ckeditor5-ai/src/aiassistant/aiassistant.js` path instead of the previous `@ckeditor/ckeditor5-ai/src/aiassistant.js`.
* **[comments](https://www.npmjs.com/package/@ckeditor/ckeditor5-comments)**: Changed the CSS selectors used to style the confirmation view displayed when attempting to remove a comment or an entire comment thread. For now, CSS classes will be more generic, for example: `.ck-confirm-view` instead of `.ck-thread__remove-confirm`. If you override styles for these components, you will need to update the selectors.
* **[undo](https://www.npmjs.com/package/@ckeditor/ckeditor5-undo)**: The `UndoCommandRevertEvent` type was renamed to `UndoRedoBaseCommandRevertEvent` and moved to the `basecommand.ts` file. Adjust your code if you have used this type in your custom integration. See [#19168](https://github.com/ckeditor/ckeditor5/issues/19168).
* Updated to TypeScript 5.3.

### Features

* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai)**: Introduced **CKEditor AI**, a brand-new set of versatile AI-powered features, including: chat, quick actions, and document review capabilities.
* **[ui](https://www.npmjs.com/package/@ckeditor/ckeditor5-ui)**: The `position` parameter in [`Dialog#show()`](https://ckeditor.com/docs/ckeditor5/latest/api/module_ui_dialog_dialog-Dialog.html#function-show) now can be a function that takes `dialogRect` and `domRootRect` parameters and should return an object with `top` and `left` properties or `null`. It can be used to specify a custom positioning for the dialog. Closes [#19167](https://github.com/ckeditor/ckeditor5/issues/19167).

### Bug fixes

* **[engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine)**: The [`markerToHighlight()`](https://ckeditor.com/docs/ckeditor5/latest/api/module_engine_conversion_downcasthelpers-DowncastHelpers.html#function-markerToHighlight) converter did not clone the `view` configuration if passed as plain object leading to incorrect behavior. This affects only custom plugins that used this converter in the described way. Closes [#19105](https://github.com/ckeditor/ckeditor5/issues/19105).
* **[engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine)**: The [bubbling events](https://ckeditor.com/docs/ckeditor5/latest/framework/deep-dive/event-system.html#listening-to-bubbling-events) now trigger event callbacks according to the registered priorities even if multiple custom contexts are provided. See [#19083](https://github.com/ckeditor/ckeditor5/issues/19083).
* **[export-inline-styles](https://www.npmjs.com/package/@ckeditor/ckeditor5-export-inline-styles)**: Fix specificity calculation to handle `:where()` selectors correctly.
* **[link](https://www.npmjs.com/package/@ckeditor/ckeditor5-link)**: The link manual decorators are no longer lost when caption is added to an image. Closes [#19024](https://github.com/ckeditor/ckeditor5/issues/19024).
* **[pagination](https://www.npmjs.com/package/@ckeditor/ckeditor5-pagination)**: Pagination lines should calculate properly for pages with larger horizontal margins.
* **[revision-history](https://www.npmjs.com/package/@ckeditor/ckeditor5-revision-history)**: Fixed a crash which happened under specific circumstances when a revision was created when document was exported using the Cloud Services REST API (`GET /documents/` endpoint).

  Although the fix was necessary in Revision History feature code, it was only reproducible in scenarios involving using the mentioned export endpoint.

### Other changes

* **[comments](https://www.npmjs.com/package/@ckeditor/ckeditor5-comments)**: Corrected types for the `resolvedBy` parameter in `CommentThread#resolve`. It was previously typed as `undefined | null`, and is now properly typed as `undefined | string`.
* **[undo](https://www.npmjs.com/package/@ckeditor/ckeditor5-undo)**: `RedoCommand` will now fire `'revert'` event when executed, similarly to `UndoCommand`. Type `UndoCommandRevertEvent` was renamed to `UndoRedoBaseCommandRevertEvent` and moved to `basecommand.ts` file. Closes [#19168](https://github.com/ckeditor/ckeditor5/issues/19168).

### Released packages

Check out the [Versioning policy](https://ckeditor.com/docs/ckeditor5/latest/framework/guides/support/versioning-policy.html) guide for more information.

<details>
<summary>Released packages (summary)</summary>

Major releases (contain major breaking changes):

* [@ckeditor/ckeditor5-ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai/v/47.0.0): v46.1.1 => v47.0.0

Minor releases (contain minor breaking changes):

* [@ckeditor/ckeditor5-table](https://www.npmjs.com/package/@ckeditor/ckeditor5-table/v/47.0.0): v46.1.1 => v47.0.0
* [@ckeditor/ckeditor5-widget](https://www.npmjs.com/package/@ckeditor/ckeditor5-widget/v/47.0.0): v46.1.1 => v47.0.0
* [@ckeditor/ckeditor5-comments](https://www.npmjs.com/package/@ckeditor/ckeditor5-comments/v/47.0.0): v46.1.1 => v47.0.0
* [@ckeditor/ckeditor5-undo](https://www.npmjs.com/package/@ckeditor/ckeditor5-undo/v/47.0.0): v46.1.1 => v47.0.0

Releases containing new features:

* [@ckeditor/ckeditor5-ui](https://www.npmjs.com/package/@ckeditor/ckeditor5-ui/v/47.0.0): v46.1.1 => v47.0.0

Other releases:

* [@ckeditor/ckeditor5-adapter-ckfinder](https://www.npmjs.com/package/@ckeditor/ckeditor5-adapter-ckfinder/v/47.0.0): v46.1.1 => v47.0.0
* [@ckeditor/ckeditor5-alignment](https://www.npmjs.com/package/@ckeditor/ckeditor5-alignment/v/47.0.0): v46.1.1 => v47.0.0
* [@ckeditor/ckeditor5-autoformat](https://www.npmjs.com/package/@ckeditor/ckeditor5-autoformat/v/47.0.0): v46.1.1 => v47.0.0
* [@ckeditor/ckeditor5-autosave](https://www.npmjs.com/package/@ckeditor/ckeditor5-autosave/v/47.0.0): v46.1.1 => v47.0.0
* [@ckeditor/ckeditor5-basic-styles](https://www.npmjs.com/package/@ckeditor/ckeditor5-basic-styles/v/47.0.0): v46.1.1 => v47.0.0
* [@ckeditor/ckeditor5-block-quote](https://www.npmjs.com/package/@ckeditor/ckeditor5-block-quote/v/47.0.0): v46.1.1 => v47.0.0
* [@ckeditor/ckeditor5-bookmark](https://www.npmjs.com/package/@ckeditor/ckeditor5-bookmark/v/47.0.0): v46.1.1 => v47.0.0
* [@ckeditor/ckeditor5-case-change](https://www.npmjs.com/package/@ckeditor/ckeditor5-case-change/v/47.0.0): v46.1.1 => v47.0.0
* [@ckeditor/ckeditor5-ckbox](https://www.npmjs.com/package/@ckeditor/ckeditor5-ckbox/v/47.0.0): v46.1.1 => v47.0.0
* [@ckeditor/ckeditor5-ckfinder](https://www.npmjs.com/package/@ckeditor/ckeditor5-ckfinder/v/47.0.0): v46.1.1 => v47.0.0
* [@ckeditor/ckeditor5-clipboard](https://www.npmjs.com/package/@ckeditor/ckeditor5-clipboard/v/47.0.0): v46.1.1 => v47.0.0
* [@ckeditor/ckeditor5-cloud-services](https://www.npmjs.com/package/@ckeditor/ckeditor5-cloud-services/v/47.0.0): v46.1.1 => v47.0.0
* [@ckeditor/ckeditor5-code-block](https://www.npmjs.com/package/@ckeditor/ckeditor5-code-block/v/47.0.0): v46.1.1 => v47.0.0
* [@ckeditor/ckeditor5-collaboration-core](https://www.npmjs.com/package/@ckeditor/ckeditor5-collaboration-core/v/47.0.0): v46.1.1 => v47.0.0
* [@ckeditor/ckeditor5-core](https://www.npmjs.com/package/@ckeditor/ckeditor5-core/v/47.0.0): v46.1.1 => v47.0.0
* [@ckeditor/ckeditor5-document-outline](https://www.npmjs.com/package/@ckeditor/ckeditor5-document-outline/v/47.0.0): v46.1.1 => v47.0.0
* [@ckeditor/ckeditor5-easy-image](https://www.npmjs.com/package/@ckeditor/ckeditor5-easy-image/v/47.0.0): v46.1.1 => v47.0.0
* [@ckeditor/ckeditor5-editor-balloon](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-balloon/v/47.0.0): v46.1.1 => v47.0.0
* [@ckeditor/ckeditor5-editor-classic](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-classic/v/47.0.0): v46.1.1 => v47.0.0
* [@ckeditor/ckeditor5-editor-decoupled](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-decoupled/v/47.0.0): v46.1.1 => v47.0.0
* [@ckeditor/ckeditor5-editor-inline](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-inline/v/47.0.0): v46.1.1 => v47.0.0
* [@ckeditor/ckeditor5-editor-multi-root](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-multi-root/v/47.0.0): v46.1.1 => v47.0.0
* [@ckeditor/ckeditor5-email](https://www.npmjs.com/package/@ckeditor/ckeditor5-email/v/47.0.0): v46.1.1 => v47.0.0
* [@ckeditor/ckeditor5-emoji](https://www.npmjs.com/package/@ckeditor/ckeditor5-emoji/v/47.0.0): v46.1.1 => v47.0.0
* [@ckeditor/ckeditor5-engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine/v/47.0.0): v46.1.1 => v47.0.0
* [@ckeditor/ckeditor5-enter](https://www.npmjs.com/package/@ckeditor/ckeditor5-enter/v/47.0.0): v46.1.1 => v47.0.0
* [@ckeditor/ckeditor5-essentials](https://www.npmjs.com/package/@ckeditor/ckeditor5-essentials/v/47.0.0): v46.1.1 => v47.0.0
* [@ckeditor/ckeditor5-export-inline-styles](https://www.npmjs.com/package/@ckeditor/ckeditor5-export-inline-styles/v/47.0.0): v46.1.1 => v47.0.0
* [@ckeditor/ckeditor5-export-pdf](https://www.npmjs.com/package/@ckeditor/ckeditor5-export-pdf/v/47.0.0): v46.1.1 => v47.0.0
* [@ckeditor/ckeditor5-export-word](https://www.npmjs.com/package/@ckeditor/ckeditor5-export-word/v/47.0.0): v46.1.1 => v47.0.0
* [@ckeditor/ckeditor5-find-and-replace](https://www.npmjs.com/package/@ckeditor/ckeditor5-find-and-replace/v/47.0.0): v46.1.1 => v47.0.0
* [@ckeditor/ckeditor5-font](https://www.npmjs.com/package/@ckeditor/ckeditor5-font/v/47.0.0): v46.1.1 => v47.0.0
* [@ckeditor/ckeditor5-format-painter](https://www.npmjs.com/package/@ckeditor/ckeditor5-format-painter/v/47.0.0): v46.1.1 => v47.0.0
* [@ckeditor/ckeditor5-fullscreen](https://www.npmjs.com/package/@ckeditor/ckeditor5-fullscreen/v/47.0.0): v46.1.1 => v47.0.0
* [@ckeditor/ckeditor5-heading](https://www.npmjs.com/package/@ckeditor/ckeditor5-heading/v/47.0.0): v46.1.1 => v47.0.0
* [@ckeditor/ckeditor5-highlight](https://www.npmjs.com/package/@ckeditor/ckeditor5-highlight/v/47.0.0): v46.1.1 => v47.0.0
* [@ckeditor/ckeditor5-horizontal-line](https://www.npmjs.com/package/@ckeditor/ckeditor5-horizontal-line/v/47.0.0): v46.1.1 => v47.0.0
* [@ckeditor/ckeditor5-html-embed](https://www.npmjs.com/package/@ckeditor/ckeditor5-html-embed/v/47.0.0): v46.1.1 => v47.0.0
* [@ckeditor/ckeditor5-html-support](https://www.npmjs.com/package/@ckeditor/ckeditor5-html-support/v/47.0.0): v46.1.1 => v47.0.0
* [@ckeditor/ckeditor5-icons](https://www.npmjs.com/package/@ckeditor/ckeditor5-icons/v/47.0.0): v46.1.1 => v47.0.0
* [@ckeditor/ckeditor5-image](https://www.npmjs.com/package/@ckeditor/ckeditor5-image/v/47.0.0): v46.1.1 => v47.0.0
* [@ckeditor/ckeditor5-import-word](https://www.npmjs.com/package/@ckeditor/ckeditor5-import-word/v/47.0.0): v46.1.1 => v47.0.0
* [@ckeditor/ckeditor5-indent](https://www.npmjs.com/package/@ckeditor/ckeditor5-indent/v/47.0.0): v46.1.1 => v47.0.0
* [@ckeditor/ckeditor5-language](https://www.npmjs.com/package/@ckeditor/ckeditor5-language/v/47.0.0): v46.1.1 => v47.0.0
* [@ckeditor/ckeditor5-line-height](https://www.npmjs.com/package/@ckeditor/ckeditor5-line-height/v/47.0.0): v46.1.1 => v47.0.0
* [@ckeditor/ckeditor5-link](https://www.npmjs.com/package/@ckeditor/ckeditor5-link/v/47.0.0): v46.1.1 => v47.0.0
* [@ckeditor/ckeditor5-list](https://www.npmjs.com/package/@ckeditor/ckeditor5-list/v/47.0.0): v46.1.1 => v47.0.0
* [@ckeditor/ckeditor5-list-multi-level](https://www.npmjs.com/package/@ckeditor/ckeditor5-list-multi-level/v/47.0.0): v46.1.1 => v47.0.0
* [@ckeditor/ckeditor5-markdown-gfm](https://www.npmjs.com/package/@ckeditor/ckeditor5-markdown-gfm/v/47.0.0): v46.1.1 => v47.0.0
* [@ckeditor/ckeditor5-media-embed](https://www.npmjs.com/package/@ckeditor/ckeditor5-media-embed/v/47.0.0): v46.1.1 => v47.0.0
* [@ckeditor/ckeditor5-mention](https://www.npmjs.com/package/@ckeditor/ckeditor5-mention/v/47.0.0): v46.1.1 => v47.0.0
* [@ckeditor/ckeditor5-merge-fields](https://www.npmjs.com/package/@ckeditor/ckeditor5-merge-fields/v/47.0.0): v46.1.1 => v47.0.0
* [@ckeditor/ckeditor5-minimap](https://www.npmjs.com/package/@ckeditor/ckeditor5-minimap/v/47.0.0): v46.1.1 => v47.0.0
* [@ckeditor/ckeditor5-operations-compressor](https://www.npmjs.com/package/@ckeditor/ckeditor5-operations-compressor/v/47.0.0): v46.1.1 => v47.0.0
* [@ckeditor/ckeditor5-page-break](https://www.npmjs.com/package/@ckeditor/ckeditor5-page-break/v/47.0.0): v46.1.1 => v47.0.0
* [@ckeditor/ckeditor5-pagination](https://www.npmjs.com/package/@ckeditor/ckeditor5-pagination/v/47.0.0): v46.1.1 => v47.0.0
* [@ckeditor/ckeditor5-paragraph](https://www.npmjs.com/package/@ckeditor/ckeditor5-paragraph/v/47.0.0): v46.1.1 => v47.0.0
* [@ckeditor/ckeditor5-paste-from-office](https://www.npmjs.com/package/@ckeditor/ckeditor5-paste-from-office/v/47.0.0): v46.1.1 => v47.0.0
* [@ckeditor/ckeditor5-paste-from-office-enhanced](https://www.npmjs.com/package/@ckeditor/ckeditor5-paste-from-office-enhanced/v/47.0.0): v46.1.1 => v47.0.0
* [@ckeditor/ckeditor5-real-time-collaboration](https://www.npmjs.com/package/@ckeditor/ckeditor5-real-time-collaboration/v/47.0.0): v46.1.1 => v47.0.0
* [@ckeditor/ckeditor5-remove-format](https://www.npmjs.com/package/@ckeditor/ckeditor5-remove-format/v/47.0.0): v46.1.1 => v47.0.0
* [@ckeditor/ckeditor5-restricted-editing](https://www.npmjs.com/package/@ckeditor/ckeditor5-restricted-editing/v/47.0.0): v46.1.1 => v47.0.0
* [@ckeditor/ckeditor5-revision-history](https://www.npmjs.com/package/@ckeditor/ckeditor5-revision-history/v/47.0.0): v46.1.1 => v47.0.0
* [@ckeditor/ckeditor5-select-all](https://www.npmjs.com/package/@ckeditor/ckeditor5-select-all/v/47.0.0): v46.1.1 => v47.0.0
* [@ckeditor/ckeditor5-show-blocks](https://www.npmjs.com/package/@ckeditor/ckeditor5-show-blocks/v/47.0.0): v46.1.1 => v47.0.0
* [@ckeditor/ckeditor5-slash-command](https://www.npmjs.com/package/@ckeditor/ckeditor5-slash-command/v/47.0.0): v46.1.1 => v47.0.0
* [@ckeditor/ckeditor5-source-editing](https://www.npmjs.com/package/@ckeditor/ckeditor5-source-editing/v/47.0.0): v46.1.1 => v47.0.0
* [@ckeditor/ckeditor5-source-editing-enhanced](https://www.npmjs.com/package/@ckeditor/ckeditor5-source-editing-enhanced/v/47.0.0): v46.1.1 => v47.0.0
* [@ckeditor/ckeditor5-special-characters](https://www.npmjs.com/package/@ckeditor/ckeditor5-special-characters/v/47.0.0): v46.1.1 => v47.0.0
* [@ckeditor/ckeditor5-style](https://www.npmjs.com/package/@ckeditor/ckeditor5-style/v/47.0.0): v46.1.1 => v47.0.0
* [@ckeditor/ckeditor5-template](https://www.npmjs.com/package/@ckeditor/ckeditor5-template/v/47.0.0): v46.1.1 => v47.0.0
* [@ckeditor/ckeditor5-theme-lark](https://www.npmjs.com/package/@ckeditor/ckeditor5-theme-lark/v/47.0.0): v46.1.1 => v47.0.0
* [@ckeditor/ckeditor5-track-changes](https://www.npmjs.com/package/@ckeditor/ckeditor5-track-changes/v/47.0.0): v46.1.1 => v47.0.0
* [@ckeditor/ckeditor5-typing](https://www.npmjs.com/package/@ckeditor/ckeditor5-typing/v/47.0.0): v46.1.1 => v47.0.0
* [@ckeditor/ckeditor5-upload](https://www.npmjs.com/package/@ckeditor/ckeditor5-upload/v/47.0.0): v46.1.1 => v47.0.0
* [@ckeditor/ckeditor5-uploadcare](https://www.npmjs.com/package/@ckeditor/ckeditor5-uploadcare/v/47.0.0): v46.1.1 => v47.0.0
* [@ckeditor/ckeditor5-utils](https://www.npmjs.com/package/@ckeditor/ckeditor5-utils/v/47.0.0): v46.1.1 => v47.0.0
* [@ckeditor/ckeditor5-watchdog](https://www.npmjs.com/package/@ckeditor/ckeditor5-watchdog/v/47.0.0): v46.1.1 => v47.0.0
* [@ckeditor/ckeditor5-word-count](https://www.npmjs.com/package/@ckeditor/ckeditor5-word-count/v/47.0.0): v46.1.1 => v47.0.0
* [ckeditor5](https://www.npmjs.com/package/ckeditor5/v/47.0.0): v46.1.1 => v47.0.0
* [ckeditor5-collaboration](https://www.npmjs.com/package/ckeditor5-collaboration/v/47.0.0): v46.1.1 => v47.0.0
* [ckeditor5-premium-features](https://www.npmjs.com/package/ckeditor5-premium-features/v/47.0.0): v46.1.1 => v47.0.0
</details>


## [46.1.1](https://github.com/ckeditor/ckeditor5/compare/v46.1.0...v46.1.1) (September 15, 2025)

We are happy to announce the release of CKEditor 5 v46.1.1.

### Release highlights

This is an internal release focused on improving our development infrastructure and the release process. These changes have no impact on integrators but represent significant improvements to our development workflow.

#### Development environment modernization

We have migrated our package management from Yarn Classic to pnpm, delivering substantial benefits:

* Faster installations through efficient linking mechanisms,
* Improved dependency management with stricter resolution and better peer dependency handling,
* Better disk efficiency by eliminating duplicate packages across projects.

We have also introduced dependency locking mechanisms that provide greater stability and predictability in our build process, ensuring consistent environments across development setups and CI/CD pipelines.

#### What this means for you

As an integrator, you will not notice any changes in functionality or API. This release maintains full backward compatibility while laying the foundation for more efficient development cycles and faster future releases.

If you fork the repository and develop using source code, you will need to update your development setup according to our [development environment guide](https://ckeditor.com/docs/ckeditor5/latest/framework/contributing/development-environment.html).

### Released packages

Check out the [Versioning policy](https://ckeditor.com/docs/ckeditor5/latest/framework/guides/support/versioning-policy.html) guide for more information.

<details>
<summary>Released packages (summary)</summary>

Minor releases (contain minor breaking changes):

* [@ckeditor/ckeditor5-real-time-collaboration](https://www.npmjs.com/package/@ckeditor/ckeditor5-real-time-collaboration/v/46.1.1): v46.1.0 => v46.1.1

Releases containing new features:

* [@ckeditor/ckeditor5-table](https://www.npmjs.com/package/@ckeditor/ckeditor5-table/v/46.1.1): v46.1.0 => v46.1.1

Other releases:

* [@ckeditor/ckeditor5-adapter-ckfinder](https://www.npmjs.com/package/@ckeditor/ckeditor5-adapter-ckfinder/v/46.1.1): v46.1.0 => v46.1.1
* [@ckeditor/ckeditor5-ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai/v/46.1.1): v46.1.0 => v46.1.1
* [@ckeditor/ckeditor5-alignment](https://www.npmjs.com/package/@ckeditor/ckeditor5-alignment/v/46.1.1): v46.1.0 => v46.1.1
* [@ckeditor/ckeditor5-autoformat](https://www.npmjs.com/package/@ckeditor/ckeditor5-autoformat/v/46.1.1): v46.1.0 => v46.1.1
* [@ckeditor/ckeditor5-autosave](https://www.npmjs.com/package/@ckeditor/ckeditor5-autosave/v/46.1.1): v46.1.0 => v46.1.1
* [@ckeditor/ckeditor5-basic-styles](https://www.npmjs.com/package/@ckeditor/ckeditor5-basic-styles/v/46.1.1): v46.1.0 => v46.1.1
* [@ckeditor/ckeditor5-block-quote](https://www.npmjs.com/package/@ckeditor/ckeditor5-block-quote/v/46.1.1): v46.1.0 => v46.1.1
* [@ckeditor/ckeditor5-bookmark](https://www.npmjs.com/package/@ckeditor/ckeditor5-bookmark/v/46.1.1): v46.1.0 => v46.1.1
* [@ckeditor/ckeditor5-case-change](https://www.npmjs.com/package/@ckeditor/ckeditor5-case-change/v/46.1.1): v46.1.0 => v46.1.1
* [@ckeditor/ckeditor5-ckbox](https://www.npmjs.com/package/@ckeditor/ckeditor5-ckbox/v/46.1.1): v46.1.0 => v46.1.1
* [@ckeditor/ckeditor5-ckfinder](https://www.npmjs.com/package/@ckeditor/ckeditor5-ckfinder/v/46.1.1): v46.1.0 => v46.1.1
* [@ckeditor/ckeditor5-clipboard](https://www.npmjs.com/package/@ckeditor/ckeditor5-clipboard/v/46.1.1): v46.1.0 => v46.1.1
* [@ckeditor/ckeditor5-cloud-services](https://www.npmjs.com/package/@ckeditor/ckeditor5-cloud-services/v/46.1.1): v46.1.0 => v46.1.1
* [@ckeditor/ckeditor5-code-block](https://www.npmjs.com/package/@ckeditor/ckeditor5-code-block/v/46.1.1): v46.1.0 => v46.1.1
* [@ckeditor/ckeditor5-collaboration-core](https://www.npmjs.com/package/@ckeditor/ckeditor5-collaboration-core/v/46.1.1): v46.1.0 => v46.1.1
* [@ckeditor/ckeditor5-comments](https://www.npmjs.com/package/@ckeditor/ckeditor5-comments/v/46.1.1): v46.1.0 => v46.1.1
* [@ckeditor/ckeditor5-core](https://www.npmjs.com/package/@ckeditor/ckeditor5-core/v/46.1.1): v46.1.0 => v46.1.1
* [@ckeditor/ckeditor5-document-outline](https://www.npmjs.com/package/@ckeditor/ckeditor5-document-outline/v/46.1.1): v46.1.0 => v46.1.1
* [@ckeditor/ckeditor5-easy-image](https://www.npmjs.com/package/@ckeditor/ckeditor5-easy-image/v/46.1.1): v46.1.0 => v46.1.1
* [@ckeditor/ckeditor5-editor-balloon](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-balloon/v/46.1.1): v46.1.0 => v46.1.1
* [@ckeditor/ckeditor5-editor-classic](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-classic/v/46.1.1): v46.1.0 => v46.1.1
* [@ckeditor/ckeditor5-editor-decoupled](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-decoupled/v/46.1.1): v46.1.0 => v46.1.1
* [@ckeditor/ckeditor5-editor-inline](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-inline/v/46.1.1): v46.1.0 => v46.1.1
* [@ckeditor/ckeditor5-editor-multi-root](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-multi-root/v/46.1.1): v46.1.0 => v46.1.1
* [@ckeditor/ckeditor5-email](https://www.npmjs.com/package/@ckeditor/ckeditor5-email/v/46.1.1): v46.1.0 => v46.1.1
* [@ckeditor/ckeditor5-emoji](https://www.npmjs.com/package/@ckeditor/ckeditor5-emoji/v/46.1.1): v46.1.0 => v46.1.1
* [@ckeditor/ckeditor5-engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine/v/46.1.1): v46.1.0 => v46.1.1
* [@ckeditor/ckeditor5-enter](https://www.npmjs.com/package/@ckeditor/ckeditor5-enter/v/46.1.1): v46.1.0 => v46.1.1
* [@ckeditor/ckeditor5-essentials](https://www.npmjs.com/package/@ckeditor/ckeditor5-essentials/v/46.1.1): v46.1.0 => v46.1.1
* [@ckeditor/ckeditor5-export-inline-styles](https://www.npmjs.com/package/@ckeditor/ckeditor5-export-inline-styles/v/46.1.1): v46.1.0 => v46.1.1
* [@ckeditor/ckeditor5-export-pdf](https://www.npmjs.com/package/@ckeditor/ckeditor5-export-pdf/v/46.1.1): v46.1.0 => v46.1.1
* [@ckeditor/ckeditor5-export-word](https://www.npmjs.com/package/@ckeditor/ckeditor5-export-word/v/46.1.1): v46.1.0 => v46.1.1
* [@ckeditor/ckeditor5-find-and-replace](https://www.npmjs.com/package/@ckeditor/ckeditor5-find-and-replace/v/46.1.1): v46.1.0 => v46.1.1
* [@ckeditor/ckeditor5-font](https://www.npmjs.com/package/@ckeditor/ckeditor5-font/v/46.1.1): v46.1.0 => v46.1.1
* [@ckeditor/ckeditor5-format-painter](https://www.npmjs.com/package/@ckeditor/ckeditor5-format-painter/v/46.1.1): v46.1.0 => v46.1.1
* [@ckeditor/ckeditor5-fullscreen](https://www.npmjs.com/package/@ckeditor/ckeditor5-fullscreen/v/46.1.1): v46.1.0 => v46.1.1
* [@ckeditor/ckeditor5-heading](https://www.npmjs.com/package/@ckeditor/ckeditor5-heading/v/46.1.1): v46.1.0 => v46.1.1
* [@ckeditor/ckeditor5-highlight](https://www.npmjs.com/package/@ckeditor/ckeditor5-highlight/v/46.1.1): v46.1.0 => v46.1.1
* [@ckeditor/ckeditor5-horizontal-line](https://www.npmjs.com/package/@ckeditor/ckeditor5-horizontal-line/v/46.1.1): v46.1.0 => v46.1.1
* [@ckeditor/ckeditor5-html-embed](https://www.npmjs.com/package/@ckeditor/ckeditor5-html-embed/v/46.1.1): v46.1.0 => v46.1.1
* [@ckeditor/ckeditor5-html-support](https://www.npmjs.com/package/@ckeditor/ckeditor5-html-support/v/46.1.1): v46.1.0 => v46.1.1
* [@ckeditor/ckeditor5-icons](https://www.npmjs.com/package/@ckeditor/ckeditor5-icons/v/46.1.1): v46.1.0 => v46.1.1
* [@ckeditor/ckeditor5-image](https://www.npmjs.com/package/@ckeditor/ckeditor5-image/v/46.1.1): v46.1.0 => v46.1.1
* [@ckeditor/ckeditor5-import-word](https://www.npmjs.com/package/@ckeditor/ckeditor5-import-word/v/46.1.1): v46.1.0 => v46.1.1
* [@ckeditor/ckeditor5-indent](https://www.npmjs.com/package/@ckeditor/ckeditor5-indent/v/46.1.1): v46.1.0 => v46.1.1
* [@ckeditor/ckeditor5-language](https://www.npmjs.com/package/@ckeditor/ckeditor5-language/v/46.1.1): v46.1.0 => v46.1.1
* [@ckeditor/ckeditor5-line-height](https://www.npmjs.com/package/@ckeditor/ckeditor5-line-height/v/46.1.1): v46.1.0 => v46.1.1
* [@ckeditor/ckeditor5-link](https://www.npmjs.com/package/@ckeditor/ckeditor5-link/v/46.1.1): v46.1.0 => v46.1.1
* [@ckeditor/ckeditor5-list](https://www.npmjs.com/package/@ckeditor/ckeditor5-list/v/46.1.1): v46.1.0 => v46.1.1
* [@ckeditor/ckeditor5-list-multi-level](https://www.npmjs.com/package/@ckeditor/ckeditor5-list-multi-level/v/46.1.1): v46.1.0 => v46.1.1
* [@ckeditor/ckeditor5-markdown-gfm](https://www.npmjs.com/package/@ckeditor/ckeditor5-markdown-gfm/v/46.1.1): v46.1.0 => v46.1.1
* [@ckeditor/ckeditor5-media-embed](https://www.npmjs.com/package/@ckeditor/ckeditor5-media-embed/v/46.1.1): v46.1.0 => v46.1.1
* [@ckeditor/ckeditor5-mention](https://www.npmjs.com/package/@ckeditor/ckeditor5-mention/v/46.1.1): v46.1.0 => v46.1.1
* [@ckeditor/ckeditor5-merge-fields](https://www.npmjs.com/package/@ckeditor/ckeditor5-merge-fields/v/46.1.1): v46.1.0 => v46.1.1
* [@ckeditor/ckeditor5-minimap](https://www.npmjs.com/package/@ckeditor/ckeditor5-minimap/v/46.1.1): v46.1.0 => v46.1.1
* [@ckeditor/ckeditor5-operations-compressor](https://www.npmjs.com/package/@ckeditor/ckeditor5-operations-compressor/v/46.1.1): v46.1.0 => v46.1.1
* [@ckeditor/ckeditor5-page-break](https://www.npmjs.com/package/@ckeditor/ckeditor5-page-break/v/46.1.1): v46.1.0 => v46.1.1
* [@ckeditor/ckeditor5-pagination](https://www.npmjs.com/package/@ckeditor/ckeditor5-pagination/v/46.1.1): v46.1.0 => v46.1.1
* [@ckeditor/ckeditor5-paragraph](https://www.npmjs.com/package/@ckeditor/ckeditor5-paragraph/v/46.1.1): v46.1.0 => v46.1.1
* [@ckeditor/ckeditor5-paste-from-office](https://www.npmjs.com/package/@ckeditor/ckeditor5-paste-from-office/v/46.1.1): v46.1.0 => v46.1.1
* [@ckeditor/ckeditor5-paste-from-office-enhanced](https://www.npmjs.com/package/@ckeditor/ckeditor5-paste-from-office-enhanced/v/46.1.1): v46.1.0 => v46.1.1
* [@ckeditor/ckeditor5-remove-format](https://www.npmjs.com/package/@ckeditor/ckeditor5-remove-format/v/46.1.1): v46.1.0 => v46.1.1
* [@ckeditor/ckeditor5-restricted-editing](https://www.npmjs.com/package/@ckeditor/ckeditor5-restricted-editing/v/46.1.1): v46.1.0 => v46.1.1
* [@ckeditor/ckeditor5-revision-history](https://www.npmjs.com/package/@ckeditor/ckeditor5-revision-history/v/46.1.1): v46.1.0 => v46.1.1
* [@ckeditor/ckeditor5-select-all](https://www.npmjs.com/package/@ckeditor/ckeditor5-select-all/v/46.1.1): v46.1.0 => v46.1.1
* [@ckeditor/ckeditor5-show-blocks](https://www.npmjs.com/package/@ckeditor/ckeditor5-show-blocks/v/46.1.1): v46.1.0 => v46.1.1
* [@ckeditor/ckeditor5-slash-command](https://www.npmjs.com/package/@ckeditor/ckeditor5-slash-command/v/46.1.1): v46.1.0 => v46.1.1
* [@ckeditor/ckeditor5-source-editing](https://www.npmjs.com/package/@ckeditor/ckeditor5-source-editing/v/46.1.1): v46.1.0 => v46.1.1
* [@ckeditor/ckeditor5-source-editing-enhanced](https://www.npmjs.com/package/@ckeditor/ckeditor5-source-editing-enhanced/v/46.1.1): v46.1.0 => v46.1.1
* [@ckeditor/ckeditor5-special-characters](https://www.npmjs.com/package/@ckeditor/ckeditor5-special-characters/v/46.1.1): v46.1.0 => v46.1.1
* [@ckeditor/ckeditor5-style](https://www.npmjs.com/package/@ckeditor/ckeditor5-style/v/46.1.1): v46.1.0 => v46.1.1
* [@ckeditor/ckeditor5-template](https://www.npmjs.com/package/@ckeditor/ckeditor5-template/v/46.1.1): v46.1.0 => v46.1.1
* [@ckeditor/ckeditor5-theme-lark](https://www.npmjs.com/package/@ckeditor/ckeditor5-theme-lark/v/46.1.1): v46.1.0 => v46.1.1
* [@ckeditor/ckeditor5-track-changes](https://www.npmjs.com/package/@ckeditor/ckeditor5-track-changes/v/46.1.1): v46.1.0 => v46.1.1
* [@ckeditor/ckeditor5-typing](https://www.npmjs.com/package/@ckeditor/ckeditor5-typing/v/46.1.1): v46.1.0 => v46.1.1
* [@ckeditor/ckeditor5-ui](https://www.npmjs.com/package/@ckeditor/ckeditor5-ui/v/46.1.1): v46.1.0 => v46.1.1
* [@ckeditor/ckeditor5-undo](https://www.npmjs.com/package/@ckeditor/ckeditor5-undo/v/46.1.1): v46.1.0 => v46.1.1
* [@ckeditor/ckeditor5-upload](https://www.npmjs.com/package/@ckeditor/ckeditor5-upload/v/46.1.1): v46.1.0 => v46.1.1
* [@ckeditor/ckeditor5-uploadcare](https://www.npmjs.com/package/@ckeditor/ckeditor5-uploadcare/v/46.1.1): v46.1.0 => v46.1.1
* [@ckeditor/ckeditor5-utils](https://www.npmjs.com/package/@ckeditor/ckeditor5-utils/v/46.1.1): v46.1.0 => v46.1.1
* [@ckeditor/ckeditor5-watchdog](https://www.npmjs.com/package/@ckeditor/ckeditor5-watchdog/v/46.1.1): v46.1.0 => v46.1.1
* [@ckeditor/ckeditor5-widget](https://www.npmjs.com/package/@ckeditor/ckeditor5-widget/v/46.1.1): v46.1.0 => v46.1.1
* [@ckeditor/ckeditor5-word-count](https://www.npmjs.com/package/@ckeditor/ckeditor5-word-count/v/46.1.1): v46.1.0 => v46.1.1
* [ckeditor5](https://www.npmjs.com/package/ckeditor5/v/46.1.1): v46.1.0 => v46.1.1
* [ckeditor5-collaboration](https://www.npmjs.com/package/ckeditor5-collaboration/v/46.1.1): v46.1.0 => v46.1.1
* [ckeditor5-premium-features](https://www.npmjs.com/package/ckeditor5-premium-features/v/46.1.1): v46.1.0 => v46.1.1
</details>

---

To see all releases, visit the [release page](https://github.com/ckeditor/ckeditor5/releases).
