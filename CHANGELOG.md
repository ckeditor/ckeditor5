Changelog
=========

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


## [48.3.0](https://github.com/ckeditor/ckeditor5/compare/v48.2.0...v48.3.0) (July 1, 2026)

We are happy to announce the release of CKEditor 5 v48.3.0.

### Release highlights

#### ⭐ Programmatic API for CKEditor AI

Until now, using CKEditor AI meant mainly going through its built-in UI. This release extends the programmatic APIs and opens the door to more custom AI workflows. Integrators can trigger AI from their buttons, process documents automatically in the background, or run AI server-side with no editor interface at all using the [Server-side Editor API](https://ckeditor.com/docs/ckeditor5/latest/features/ai/ckeditor-ai-programmatic.html#server-side-editor-api).

* [**AI Document Processing**](https://ckeditor.com/docs/ckeditor5/latest/features/ai/ckeditor-ai-programmatic.html#document-processing): Run any custom, document-level prompt entirely from code with no UI involved, for automated jobs like summarizing, reformatting, or enriching content in the background.
* [**AI Review**](https://ckeditor.com/docs/ckeditor5/latest/features/ai/ckeditor-ai-programmatic.html#review): Trigger built-in or custom review commands, such as proofreading, clarity, or tone, from code so you can build automated quality gates into your editing workflow.
* [**AI Translate**](https://ckeditor.com/docs/ckeditor5/latest/features/ai/ckeditor-ai-programmatic.html#translate): Translate a document into a target language on demand, with or without the translation UI.

See the [Using CKEditor AI programmatically](https://ckeditor.com/docs/ckeditor5/latest/features/ai/ckeditor-ai-programmatic.html) guide for details.

#### ⭐ AI-generated suggestions in track changes

When AI and people edit the same document, reviewers need to know who proposed what. AI suggestions can now be visually marked as AI-generated, so teams can give machine-proposed changes the right level of scrutiny, keep a clear audit trail of where content came from, and meet editorial or governance policies that require disclosing AI involvement.

The feature is opt-in, and you can choose between a pill view or AI author view. Read more in the [Marking AI-generated suggestions](https://ckeditor.com/docs/ckeditor5/latest/features/ai/ckeditor-ai-generated-suggestions.html) guide.

#### ⭐ Multi-root and multiple editors support for CKEditor AI is now stable

Editors that split content into separate areas, such as email layouts, structured documents, or CMS templates with distinct regions, can now use CKEditor AI with full production confidence.

We promoted [multi-root and multi-instance support](https://ckeditor.com/docs/ckeditor5/latest/features/ai/ckeditor-ai-multi-root-multi-editor-support.html) to stable so AI Chat and Review consistently read context from and act on the correct region. Adding or removing editor instances at runtime, including the empty "no editors" state, is handled robustly, keeping every AI request scoped to the root the user is working in.

#### Other improvements and fixes

* **[Images in inline roots](https://ckeditor.com/docs/ckeditor5/latest/getting-started/setup/root-types.html#inline-root).** Images are now supported in inline roots. A block image that cannot be placed at a given position, for example when pasting, dropping, or loading data into an inline root, now degrades to an inline image instead of being dropped. The image type, caption, and style controls adapt to what the position allows.
* **[Keyboard-accessible media embed resizing](https://ckeditor.com/docs/ckeditor5/latest/features/media-embed/media-embed-resize.html).** Media embeds now include a keyboard-accessible resize UI: a toolbar dropdown and standalone buttons for predefined sizes, plus a balloon-hosted input for custom widths.
* **[AI Chat](https://ckeditor.com/docs/ckeditor5/latest/features/ai/ckeditor-ai-chat.html) and [AI Review](https://ckeditor.com/docs/ckeditor5/latest/features/ai/ckeditor-ai-review.html) fixes.** This release resolves a range of AI Chat and Review issues affecting both reliability and presentation, including suggestions that did not appear or apply, crashes on certain historical or marker-heavy content, and rendering glitches in Safari. Preview content is now selectable for direct copying, long text and URLs wrap cleanly in the feed, and several commands are translated in non-English interfaces.
* **[Paste from Office](https://ckeditor.com/docs/ckeditor5/latest/features/pasting/paste-from-office.html) and Excel Online.** Word footnotes are no longer malformed when the [Footnotes](https://ckeditor.com/docs/ckeditor5/latest/features/footnotes.html) plugin is enabled, pasting a list followed by a paragraph aligned to an earlier list's margin no longer throws an error, and ranges pasted from Excel Online no longer insert the clipboard's CSS `<style>` block as visible text.
* **[Footnotes](https://ckeditor.com/docs/ckeditor5/latest/features/footnotes.html).** Fixed the first footnote reference disappearing with a starting value of `0` under numbering styles that do not support it, and aligned references with the list when using roman numbering at counter values of 4000 or above.
* **[Emoji](https://ckeditor.com/docs/ckeditor5/latest/features/emoji.html).** The plugin no longer blocks editor startup, resulting in noticeably faster load times, and multiple editors sharing the same `definitionsUrl` with different `useCustomFont` settings no longer interfere with each other's emoji data.
* **Accessibility.** [Comment thread](https://ckeditor.com/docs/ckeditor5/latest/features/collaboration/comments/comments.html) accessible names now include the first comment's text and announce reply counts, and AI-proposed [track changes](https://ckeditor.com/docs/ckeditor5/latest/features/collaboration/track-changes/track-changes.html) suggestions now state their AI origin in their accessible name.
* **[Type around buttons](https://ckeditor.com/docs/ckeditor5/latest/framework/deep-dive/ui/widget-internals.html#type-around-widget-ui) on touch devices.** Tapping the buttons that insert a paragraph above or below a selected widget now works on Android and iOS. Previously, these taps did not insert a paragraph. Thanks to [@ELHart05](https://github.com/ELHart05) for contributing this fix.

### MINOR BREAKING CHANGES [ℹ️](https://ckeditor.com/docs/ckeditor5/latest/framework/guides/support/versioning-policy.html#major-and-minor-breaking-changes)

* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai)**: Changed the signature of `AIGateway.apply()`. `applyMethod` is now a property of the second argument (an options object) instead of a positional string: replace `apply( result, 'suggest' )` with `apply( result, { applyMethod: 'suggest' } )`.
* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai)**: Tightened the return types of several AI Chat and AI Review getters and methods to `ReadonlyArray` / `ReadonlyMap`. They now return copies of the original collections to prevent accidental mutation of internal state.

  Updated methods are: `AIChatContext#getPendingContextItems()`, `AIChatContext#getSentContextItems()`, `AIReviewRunResult#affectedBlocks` and `AIGateway#mergeChangesIntoContent()`.
* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai)**: Fixed a CSS specificity conflict that made the AI Chat balloon width depend on stylesheet import order. The AI Chat balloon now sizes to its content without conflicting with default dialog styles.
* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai)**: Changed the CSS selector used to set the AI Chat balloon width from `.ck-ai-chat-balloon` to `.ck-ai-chat-balloon-main`. Custom styles that set the AI Chat balloon width by targeting `.ck-ai-chat-balloon` may no longer take effect and should target `.ck-ai-chat-balloon-main` instead.

### Features

* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai), [track-changes](https://www.npmjs.com/package/@ckeditor/ckeditor5-track-changes)**: Suggestions created using AI features can now be visually marked as AI-generated to be distinguished from manual edits. See `config.trackChanges.showAISource` and `config.trackChanges.aiAuthor`.
* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai)**: Introduced a programmatic API for AI Document Processing. See the [Using CKEditor AI programmatically](https://ckeditor.com/docs/ckeditor5/latest/features/ai/ckeditor-ai-programmatic.html#document-processing) documentation for details.
* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai)**: All AI features now report their errors through a single pipeline. Applications can monitor AI failures across chat, chat history, actions, and review, and forward them to their own error-tracking tools.
* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai)**: Introduced a programmatic API for the AI Translate plugin. See the [Using CKEditor AI programmatically](https://ckeditor.com/docs/ckeditor5/latest/features/ai/ckeditor-ai-programmatic.html#translate) documentation for details.
* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai)**: Introduced a headless programmatic API for the AI Translate plugin. See the [Using CKEditor AI programmatically](https://ckeditor.com/docs/ckeditor5/latest/features/ai/ckeditor-ai-programmatic.html#translate) documentation for details.
* **[collaboration-core](https://www.npmjs.com/package/@ckeditor/ckeditor5-collaboration-core)**: Added the `PillView` UI component, which displays a pill with an icon, label, and tooltip. See the API documentation for details.
* **[image](https://www.npmjs.com/package/@ckeditor/ckeditor5-image)**: Images are now supported in inline roots. A block image that cannot be placed at a given location (for example, when pasting, dropping, or loading data into an inline root) now degrades to an inline image instead of being dropped. The image type change, caption, and style controls now adapt to the allowed conversion and become unavailable when that conversion is not allowed at the current position.
* **[media-embed](https://www.npmjs.com/package/@ckeditor/ckeditor5-media-embed)**: Introduced a keyboard-accessible resize UI for media embeds: a toolbar dropdown or standalone buttons for predefined sizes and a balloon-hosted input for custom widths.

### Bug fixes

* **[collaboration-core](https://www.npmjs.com/package/@ckeditor/ckeditor5-collaboration-core), [track-changes](https://www.npmjs.com/package/@ckeditor/ckeditor5-track-changes)**: Fixed a redundant keyboard tab stop on the "AI-generated" pill shown for AI suggestions. The AI origin it signals visually is conveyed to assistive technologies through the suggestion's accessible name.
* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai)**: Pasting spreadsheet or word-processor content into the AI Chat prompt input now keeps the cell text instead of attaching the accompanying preview image.
* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai)**: Fixed an issue where AI-suggested insertions generated by AI Chat were not displayed in the chat feed and were not applied to the content in some scenarios.
* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai)**: Made AI-generated content displayed in the AI Quick Actions balloon and the AI Chat suggestion preview selectable for direct copying.
* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai)**: Roots added at runtime with `MultiRootEditor#addRoot()` were sent to the AI service without a title or description, which could cause area-scoped AI Chat requests to target the wrong root.

  Now the AI features read each editor root's title and description from the root's attributes if available, and fall back to the editor configuration otherwise.
* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai)**: Improved the HTML output of the AI Quick Actions suggestion preview. Completed previews no longer contain temporary streaming elements.
* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai)**: The tooltip displayed when hovering over an AI Chat context chip now wraps long URLs.
* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai)**: Long text and URLs displayed in the AI Chat feed now wrap and no longer overflow the message container.
* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai)**: Fixed an AI Chat crash when loading a historical conversation containing changes for an editor that was never created in the current session.
* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai)**: The conversation title animation is no longer played when opening a chat from history. The animation is now shown only when the AI generates a title for the first time.
* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai)**: The mini toolbar in the AI Actions dialog no longer overlaps the vertical scrollbar.
* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai)**: The AI Review programmatic API no longer switches the editor to the review tab when a review run fails validation (for example, an unknown command or a missing model). A failed call now leaves the previously active tab in place.
* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai)**: Fixed an editor crash that occurred when AI Chat processed responses for document content that included comment or suggestion markers. This was most often reproducible with the General HTML Support plugin enabled.
* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai)**: The balloons in the AI Chat context chips row are now rendered above the AI overlay backdrop instead of behind it.
* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai)**: Fixed an issue where toggling AI Review or AI Translate tabs would reset their state.
* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai)**: Switching tabs while the AI plugin is toggled no longer duplicates views.
* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai)**: The AI Review mode "Adjust length" and "Adjust tone and style" commands, along with their dropdown options, are now translated when a UI language other than English is used.
* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai)**: AI Chat and Review suggestions now render in Safari when the AI panel is toggled while the request is being processed or after quickly switching between AI panels.
* **[collaboration-core](https://www.npmjs.com/package/@ckeditor/ckeditor5-collaboration-core)**: Removed the misplaced `affectsData` property from the `CollaborationOperation` interface. The property is specific to `MarkerOperation`. Cast to `MarkerCollaborationOperation` to access it.
* **[comments](https://www.npmjs.com/package/@ckeditor/ckeditor5-comments)**: The accessible name of a comment thread now includes the text of its first comment. Single-reply threads now announce the reply count instead of repeating the author name.
* **[core](https://www.npmjs.com/package/@ckeditor/ckeditor5-core)**: Replaced a cryptic `multi-root-editor-root-initial-data-mismatch` error thrown when `config.roots` is an object with a custom prototype or a class instance. The editor now throws a dedicated `editor-create-roots-not-plain-object` error with a clear message.
* **[core](https://www.npmjs.com/package/@ckeditor/ckeditor5-core)**: An invalid tag name passed to `config.root.element` or `config.roots.<rootName>.element` now throws a clear `CKEditorError` with code `editor-wrong-element-name` instead of a cryptic `InvalidCharacterError` from the browser renderer.
* **[emoji](https://www.npmjs.com/package/@ckeditor/ckeditor5-emoji)**: Reduced editor startup time by preventing the emoji plugin from blocking editor initialization.
* **[emoji](https://www.npmjs.com/package/@ckeditor/ckeditor5-emoji)**: Fixed an issue where multiple editor instances on the same page could interfere with each other's emoji data when they shared the same `definitionsUrl` but used different `useCustomFont` settings. Depending on which editor initialized first, some editors could display a restricted emoji list when a full one was expected, or the other way around.
* **[engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine)**: Fixed incorrect ordering of `markerToElement` boundary elements when multiple markers share the same end position. The closing elements are now inserted in reverse opening order to preserve nesting in the output. Closes [#20173](https://github.com/ckeditor/ckeditor5/issues/20173).
* **[footnotes](https://www.npmjs.com/package/@ckeditor/ckeditor5-footnotes)**: Fixed the first footnote reference disappearing when the footnote list's starting value is set to `0` and the active numbering style, for example `lower-alpha` or `lower-roman`, does not support that value.
* **[footnotes](https://www.npmjs.com/package/@ckeditor/ckeditor5-footnotes)**: Fixed a mismatch between footnote references and the footnote list when using `lower-roman` or `upper-roman` numbering with counter values of 4000 or above. Both now consistently fall back to decimal numbering, as required by the CSS counter style specification.
* **[paste-from-office](https://www.npmjs.com/package/@ckeditor/ckeditor5-paste-from-office)**: Pasting content from MS Office with footnotes no longer results in malformed footnotes when the `Footnotes` plugin is enabled.
* **[paste-from-office](https://www.npmjs.com/package/@ckeditor/ckeditor5-paste-from-office)**: Pasting content from MS Office no longer throws an error when a list is followed by a paragraph aligned to the margin of an earlier list.
* **[paste-from-office](https://www.npmjs.com/package/@ckeditor/ckeditor5-paste-from-office)**: Pasting content from Excel Online no longer inserts the clipboard's CSS `<style>` block as visible text. Closes [#20188](https://github.com/ckeditor/ckeditor5/issues/20188).
* **[real-time-collaboration](https://www.npmjs.com/package/@ckeditor/ckeditor5-real-time-collaboration)**: In multi-editor setups using a `Context` mechanism, an individual document can now be flushed on the server without affecting other editors. Previously, all editors within the `Context` instance turned read-only. Now only the editor connected to the flushed document becomes disconnected, while the remaining editors stay connected and editable.
* **[table](https://www.npmjs.com/package/@ckeditor/ckeditor5-table)**: Upcasting table content with scoped header cells into a context that does not allow tables, for example an inline editor root, no longer throws an error.
* **[track-changes](https://www.npmjs.com/package/@ckeditor/ckeditor5-track-changes)**: When a track changes suggestion comes from AI, its accessible name now states that it was proposed by AI.
* **[widget](https://www.npmjs.com/package/@ckeditor/ckeditor5-widget)**: The widget type around buttons now insert a paragraph when tapped on touch devices. Previously, taps on the buttons were ignored on Android and iOS, and only selected the widget. Closes [#20103](https://github.com/ckeditor/ckeditor5/issues/20103).

  Thanks to [@ELHart05](https://github.com/ELHart05).

### Other changes

* **[core](https://www.npmjs.com/package/@ckeditor/ckeditor5-core)**: Values provided via the `root.description` and `root.title` configuration options are now stored in the model as the `$description` and `$title` attributes of the `$root` element and persist through collaboration sessions. See [#10327](https://github.com/ckeditor/ckeditor5/issues/10327), [#10285](https://github.com/ckeditor/ckeditor5/issues/10285), [#10333](https://github.com/ckeditor/ckeditor5/issues/10333).
* **[track-changes](https://www.npmjs.com/package/@ckeditor/ckeditor5-track-changes)**: Marked `Suggestion#isExternal` as read-only, matching `Comment#isExternal`. Changing this property should not have been possible and could lead to errors.
* **[ui](https://www.npmjs.com/package/@ckeditor/ckeditor5-ui)**: The custom `position` callback in `DialogDefinition` now receives both the visible DOM root `Rect` and the general DOM root `Rect`, making it possible to position the dialog even when the DOM root element is off the screen or cropped by an overflowing ancestor. Added the `getRootName()` option to `DialogDefinition` to control which DOM root the dialog is positioned relative to, improving positioning in multi-root editor setups.

### Released packages

Check out the [Versioning policy](https://ckeditor.com/docs/ckeditor5/latest/framework/guides/support/versioning-policy.html) guide for more information.

<details>
<summary>Released packages (summary)</summary>

Minor releases (contain minor breaking changes):

* [@ckeditor/ckeditor5-ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai/v/48.3.0): v48.2.0 => v48.3.0

Releases containing new features:

* [@ckeditor/ckeditor5-track-changes](https://www.npmjs.com/package/@ckeditor/ckeditor5-track-changes/v/48.3.0): v48.2.0 => v48.3.0
* [@ckeditor/ckeditor5-collaboration-core](https://www.npmjs.com/package/@ckeditor/ckeditor5-collaboration-core/v/48.3.0): v48.2.0 => v48.3.0
* [@ckeditor/ckeditor5-image](https://www.npmjs.com/package/@ckeditor/ckeditor5-image/v/48.3.0): v48.2.0 => v48.3.0
* [@ckeditor/ckeditor5-media-embed](https://www.npmjs.com/package/@ckeditor/ckeditor5-media-embed/v/48.3.0): v48.2.0 => v48.3.0

Other releases:

* [@ckeditor/ckeditor5-adapter-ckfinder](https://www.npmjs.com/package/@ckeditor/ckeditor5-adapter-ckfinder/v/48.3.0): v48.2.0 => v48.3.0
* [@ckeditor/ckeditor5-alignment](https://www.npmjs.com/package/@ckeditor/ckeditor5-alignment/v/48.3.0): v48.2.0 => v48.3.0
* [@ckeditor/ckeditor5-autoformat](https://www.npmjs.com/package/@ckeditor/ckeditor5-autoformat/v/48.3.0): v48.2.0 => v48.3.0
* [@ckeditor/ckeditor5-autosave](https://www.npmjs.com/package/@ckeditor/ckeditor5-autosave/v/48.3.0): v48.2.0 => v48.3.0
* [@ckeditor/ckeditor5-basic-styles](https://www.npmjs.com/package/@ckeditor/ckeditor5-basic-styles/v/48.3.0): v48.2.0 => v48.3.0
* [@ckeditor/ckeditor5-block-quote](https://www.npmjs.com/package/@ckeditor/ckeditor5-block-quote/v/48.3.0): v48.2.0 => v48.3.0
* [@ckeditor/ckeditor5-bookmark](https://www.npmjs.com/package/@ckeditor/ckeditor5-bookmark/v/48.3.0): v48.2.0 => v48.3.0
* [@ckeditor/ckeditor5-case-change](https://www.npmjs.com/package/@ckeditor/ckeditor5-case-change/v/48.3.0): v48.2.0 => v48.3.0
* [@ckeditor/ckeditor5-ckbox](https://www.npmjs.com/package/@ckeditor/ckeditor5-ckbox/v/48.3.0): v48.2.0 => v48.3.0
* [@ckeditor/ckeditor5-ckfinder](https://www.npmjs.com/package/@ckeditor/ckeditor5-ckfinder/v/48.3.0): v48.2.0 => v48.3.0
* [@ckeditor/ckeditor5-clipboard](https://www.npmjs.com/package/@ckeditor/ckeditor5-clipboard/v/48.3.0): v48.2.0 => v48.3.0
* [@ckeditor/ckeditor5-cloud-services](https://www.npmjs.com/package/@ckeditor/ckeditor5-cloud-services/v/48.3.0): v48.2.0 => v48.3.0
* [@ckeditor/ckeditor5-code-block](https://www.npmjs.com/package/@ckeditor/ckeditor5-code-block/v/48.3.0): v48.2.0 => v48.3.0
* [@ckeditor/ckeditor5-comments](https://www.npmjs.com/package/@ckeditor/ckeditor5-comments/v/48.3.0): v48.2.0 => v48.3.0
* [@ckeditor/ckeditor5-core](https://www.npmjs.com/package/@ckeditor/ckeditor5-core/v/48.3.0): v48.2.0 => v48.3.0
* [@ckeditor/ckeditor5-document-outline](https://www.npmjs.com/package/@ckeditor/ckeditor5-document-outline/v/48.3.0): v48.2.0 => v48.3.0
* [@ckeditor/ckeditor5-easy-image](https://www.npmjs.com/package/@ckeditor/ckeditor5-easy-image/v/48.3.0): v48.2.0 => v48.3.0
* [@ckeditor/ckeditor5-editor-balloon](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-balloon/v/48.3.0): v48.2.0 => v48.3.0
* [@ckeditor/ckeditor5-editor-classic](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-classic/v/48.3.0): v48.2.0 => v48.3.0
* [@ckeditor/ckeditor5-editor-decoupled](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-decoupled/v/48.3.0): v48.2.0 => v48.3.0
* [@ckeditor/ckeditor5-editor-inline](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-inline/v/48.3.0): v48.2.0 => v48.3.0
* [@ckeditor/ckeditor5-editor-multi-root](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-multi-root/v/48.3.0): v48.2.0 => v48.3.0
* [@ckeditor/ckeditor5-email](https://www.npmjs.com/package/@ckeditor/ckeditor5-email/v/48.3.0): v48.2.0 => v48.3.0
* [@ckeditor/ckeditor5-emoji](https://www.npmjs.com/package/@ckeditor/ckeditor5-emoji/v/48.3.0): v48.2.0 => v48.3.0
* [@ckeditor/ckeditor5-engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine/v/48.3.0): v48.2.0 => v48.3.0
* [@ckeditor/ckeditor5-enter](https://www.npmjs.com/package/@ckeditor/ckeditor5-enter/v/48.3.0): v48.2.0 => v48.3.0
* [@ckeditor/ckeditor5-essentials](https://www.npmjs.com/package/@ckeditor/ckeditor5-essentials/v/48.3.0): v48.2.0 => v48.3.0
* [@ckeditor/ckeditor5-export-inline-styles](https://www.npmjs.com/package/@ckeditor/ckeditor5-export-inline-styles/v/48.3.0): v48.2.0 => v48.3.0
* [@ckeditor/ckeditor5-export-pdf](https://www.npmjs.com/package/@ckeditor/ckeditor5-export-pdf/v/48.3.0): v48.2.0 => v48.3.0
* [@ckeditor/ckeditor5-export-word](https://www.npmjs.com/package/@ckeditor/ckeditor5-export-word/v/48.3.0): v48.2.0 => v48.3.0
* [@ckeditor/ckeditor5-find-and-replace](https://www.npmjs.com/package/@ckeditor/ckeditor5-find-and-replace/v/48.3.0): v48.2.0 => v48.3.0
* [@ckeditor/ckeditor5-font](https://www.npmjs.com/package/@ckeditor/ckeditor5-font/v/48.3.0): v48.2.0 => v48.3.0
* [@ckeditor/ckeditor5-footnotes](https://www.npmjs.com/package/@ckeditor/ckeditor5-footnotes/v/48.3.0): v48.2.0 => v48.3.0
* [@ckeditor/ckeditor5-format-painter](https://www.npmjs.com/package/@ckeditor/ckeditor5-format-painter/v/48.3.0): v48.2.0 => v48.3.0
* [@ckeditor/ckeditor5-fullscreen](https://www.npmjs.com/package/@ckeditor/ckeditor5-fullscreen/v/48.3.0): v48.2.0 => v48.3.0
* [@ckeditor/ckeditor5-heading](https://www.npmjs.com/package/@ckeditor/ckeditor5-heading/v/48.3.0): v48.2.0 => v48.3.0
* [@ckeditor/ckeditor5-highlight](https://www.npmjs.com/package/@ckeditor/ckeditor5-highlight/v/48.3.0): v48.2.0 => v48.3.0
* [@ckeditor/ckeditor5-horizontal-line](https://www.npmjs.com/package/@ckeditor/ckeditor5-horizontal-line/v/48.3.0): v48.2.0 => v48.3.0
* [@ckeditor/ckeditor5-html-embed](https://www.npmjs.com/package/@ckeditor/ckeditor5-html-embed/v/48.3.0): v48.2.0 => v48.3.0
* [@ckeditor/ckeditor5-html-support](https://www.npmjs.com/package/@ckeditor/ckeditor5-html-support/v/48.3.0): v48.2.0 => v48.3.0
* [@ckeditor/ckeditor5-icons](https://www.npmjs.com/package/@ckeditor/ckeditor5-icons/v/48.3.0): v48.2.0 => v48.3.0
* [@ckeditor/ckeditor5-import-word](https://www.npmjs.com/package/@ckeditor/ckeditor5-import-word/v/48.3.0): v48.2.0 => v48.3.0
* [@ckeditor/ckeditor5-indent](https://www.npmjs.com/package/@ckeditor/ckeditor5-indent/v/48.3.0): v48.2.0 => v48.3.0
* [@ckeditor/ckeditor5-language](https://www.npmjs.com/package/@ckeditor/ckeditor5-language/v/48.3.0): v48.2.0 => v48.3.0
* [@ckeditor/ckeditor5-line-height](https://www.npmjs.com/package/@ckeditor/ckeditor5-line-height/v/48.3.0): v48.2.0 => v48.3.0
* [@ckeditor/ckeditor5-link](https://www.npmjs.com/package/@ckeditor/ckeditor5-link/v/48.3.0): v48.2.0 => v48.3.0
* [@ckeditor/ckeditor5-list](https://www.npmjs.com/package/@ckeditor/ckeditor5-list/v/48.3.0): v48.2.0 => v48.3.0
* [@ckeditor/ckeditor5-list-multi-level](https://www.npmjs.com/package/@ckeditor/ckeditor5-list-multi-level/v/48.3.0): v48.2.0 => v48.3.0
* [@ckeditor/ckeditor5-markdown-gfm](https://www.npmjs.com/package/@ckeditor/ckeditor5-markdown-gfm/v/48.3.0): v48.2.0 => v48.3.0
* [@ckeditor/ckeditor5-mention](https://www.npmjs.com/package/@ckeditor/ckeditor5-mention/v/48.3.0): v48.2.0 => v48.3.0
* [@ckeditor/ckeditor5-merge-fields](https://www.npmjs.com/package/@ckeditor/ckeditor5-merge-fields/v/48.3.0): v48.2.0 => v48.3.0
* [@ckeditor/ckeditor5-minimap](https://www.npmjs.com/package/@ckeditor/ckeditor5-minimap/v/48.3.0): v48.2.0 => v48.3.0
* [@ckeditor/ckeditor5-operations-compressor](https://www.npmjs.com/package/@ckeditor/ckeditor5-operations-compressor/v/48.3.0): v48.2.0 => v48.3.0
* [@ckeditor/ckeditor5-page-break](https://www.npmjs.com/package/@ckeditor/ckeditor5-page-break/v/48.3.0): v48.2.0 => v48.3.0
* [@ckeditor/ckeditor5-pagination](https://www.npmjs.com/package/@ckeditor/ckeditor5-pagination/v/48.3.0): v48.2.0 => v48.3.0
* [@ckeditor/ckeditor5-paragraph](https://www.npmjs.com/package/@ckeditor/ckeditor5-paragraph/v/48.3.0): v48.2.0 => v48.3.0
* [@ckeditor/ckeditor5-paste-from-office](https://www.npmjs.com/package/@ckeditor/ckeditor5-paste-from-office/v/48.3.0): v48.2.0 => v48.3.0
* [@ckeditor/ckeditor5-paste-from-office-enhanced](https://www.npmjs.com/package/@ckeditor/ckeditor5-paste-from-office-enhanced/v/48.3.0): v48.2.0 => v48.3.0
* [@ckeditor/ckeditor5-real-time-collaboration](https://www.npmjs.com/package/@ckeditor/ckeditor5-real-time-collaboration/v/48.3.0): v48.2.0 => v48.3.0
* [@ckeditor/ckeditor5-remove-format](https://www.npmjs.com/package/@ckeditor/ckeditor5-remove-format/v/48.3.0): v48.2.0 => v48.3.0
* [@ckeditor/ckeditor5-restricted-editing](https://www.npmjs.com/package/@ckeditor/ckeditor5-restricted-editing/v/48.3.0): v48.2.0 => v48.3.0
* [@ckeditor/ckeditor5-revision-history](https://www.npmjs.com/package/@ckeditor/ckeditor5-revision-history/v/48.3.0): v48.2.0 => v48.3.0
* [@ckeditor/ckeditor5-select-all](https://www.npmjs.com/package/@ckeditor/ckeditor5-select-all/v/48.3.0): v48.2.0 => v48.3.0
* [@ckeditor/ckeditor5-show-blocks](https://www.npmjs.com/package/@ckeditor/ckeditor5-show-blocks/v/48.3.0): v48.2.0 => v48.3.0
* [@ckeditor/ckeditor5-slash-command](https://www.npmjs.com/package/@ckeditor/ckeditor5-slash-command/v/48.3.0): v48.2.0 => v48.3.0
* [@ckeditor/ckeditor5-source-editing](https://www.npmjs.com/package/@ckeditor/ckeditor5-source-editing/v/48.3.0): v48.2.0 => v48.3.0
* [@ckeditor/ckeditor5-source-editing-enhanced](https://www.npmjs.com/package/@ckeditor/ckeditor5-source-editing-enhanced/v/48.3.0): v48.2.0 => v48.3.0
* [@ckeditor/ckeditor5-special-characters](https://www.npmjs.com/package/@ckeditor/ckeditor5-special-characters/v/48.3.0): v48.2.0 => v48.3.0
* [@ckeditor/ckeditor5-style](https://www.npmjs.com/package/@ckeditor/ckeditor5-style/v/48.3.0): v48.2.0 => v48.3.0
* [@ckeditor/ckeditor5-table](https://www.npmjs.com/package/@ckeditor/ckeditor5-table/v/48.3.0): v48.2.0 => v48.3.0
* [@ckeditor/ckeditor5-template](https://www.npmjs.com/package/@ckeditor/ckeditor5-template/v/48.3.0): v48.2.0 => v48.3.0
* [@ckeditor/ckeditor5-typing](https://www.npmjs.com/package/@ckeditor/ckeditor5-typing/v/48.3.0): v48.2.0 => v48.3.0
* [@ckeditor/ckeditor5-ui](https://www.npmjs.com/package/@ckeditor/ckeditor5-ui/v/48.3.0): v48.2.0 => v48.3.0
* [@ckeditor/ckeditor5-undo](https://www.npmjs.com/package/@ckeditor/ckeditor5-undo/v/48.3.0): v48.2.0 => v48.3.0
* [@ckeditor/ckeditor5-upload](https://www.npmjs.com/package/@ckeditor/ckeditor5-upload/v/48.3.0): v48.2.0 => v48.3.0
* [@ckeditor/ckeditor5-uploadcare](https://www.npmjs.com/package/@ckeditor/ckeditor5-uploadcare/v/48.3.0): v48.2.0 => v48.3.0
* [@ckeditor/ckeditor5-utils](https://www.npmjs.com/package/@ckeditor/ckeditor5-utils/v/48.3.0): v48.2.0 => v48.3.0
* [@ckeditor/ckeditor5-watchdog](https://www.npmjs.com/package/@ckeditor/ckeditor5-watchdog/v/48.3.0): v48.2.0 => v48.3.0
* [@ckeditor/ckeditor5-widget](https://www.npmjs.com/package/@ckeditor/ckeditor5-widget/v/48.3.0): v48.2.0 => v48.3.0
* [@ckeditor/ckeditor5-word-count](https://www.npmjs.com/package/@ckeditor/ckeditor5-word-count/v/48.3.0): v48.2.0 => v48.3.0
* [ckeditor5](https://www.npmjs.com/package/ckeditor5/v/48.3.0): v48.2.0 => v48.3.0
* [ckeditor5-premium-features](https://www.npmjs.com/package/ckeditor5-premium-features/v/48.3.0): v48.2.0 => v48.3.0
</details>


## [48.2.0](https://github.com/ckeditor/ckeditor5/compare/v48.1.1...v48.2.0) (June 2, 2026)

We are happy to announce the release of CKEditor 5 v48.2.0.

### Release highlights

#### Media embed improvements

The [Media embed](https://ckeditor.com/docs/ckeditor5/latest/features/media-embed/media-embed.html) feature now supports [resizing](https://ckeditor.com/docs/ckeditor5/latest/features/media-embed/media-embed-resize.html) with drag handles and [styling](https://ckeditor.com/docs/ckeditor5/latest/features/media-embed/media-embed-styles.html), including alignment with optional text wrapping. Embedded videos and other media can be aligned left, right, or centered, with surrounding content flowing around them.

#### Editor roots on paragraph-like elements

Editor roots can now be attached to or created as block-level elements other than the default container, including headings, paragraphs, and custom block elements with their own classes, styles, and attributes. This helps integrate CKEditor 5 with CMSes and other systems that edit individual content fields rather than a single wrapper.

#### Skip-level lists

The [list feature](https://ckeditor.com/docs/ckeditor5/latest/features/lists/lists.html) now supports [skip-level lists](https://ckeditor.com/docs/ckeditor5/latest/features/lists/lists-editing.html#skip-level-lists). List items can be nested at non-sequential indentation levels, for example a third-level item placed directly under a first-level one, preserving the structure of documents imported or pasted from Word and HTML sources.

#### General HTML Support in CKEditor AI

[CKEditor AI](https://ckeditor.com/docs/ckeditor5/latest/features/ai/ckeditor-ai-overview.html) now works in editors configured with [General HTML Support](https://ckeditor.com/docs/ckeditor5/latest/features/html/general-html-support.html). AI Chat, AI Quick Actions, and AI Review can apply and suggest changes on content that uses additional elements and attributes.

#### Paste and drag and drop in AI Chat

The [AI Chat](https://ckeditor.com/docs/ckeditor5/latest/features/ai/ckeditor-ai-chat.html) input now supports pasting and drag and drop. Screenshots from the clipboard and other images are added as context attachments, URLs are detected and displayed as link pills, and long pasted text is attached as a text file.

#### Other AI improvements

* [**Multi-root and multi-editor support**](https://ckeditor.com/docs/ckeditor5/latest/features/ai/ckeditor-ai-multi-root-multi-editor-support.html). AI Chat and AI Review now support multi-root and multi-editor integrations, including adding or removing editor instances at runtime.
* **Default typography improvements for AI Chat responses.** AI Chat now includes built-in styles for common content types, improving the readability of generated output.
* **Resilient streaming.** Streaming replies in AI Chat are no longer cancelled when the page is closed or reloaded. The reply keeps streaming on the server and reconnects when the conversation is reopened.

### MINOR BREAKING CHANGES [ℹ️](https://ckeditor.com/docs/ckeditor5/latest/framework/guides/support/versioning-policy.html#major-and-minor-breaking-changes)

* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai)**: Changed CKEditor AI APIs used by custom workflows. Review the following changes and see the API documentation for details.

  * Removed methods:
    * `AIChatContext#updateCurrentDocument()` (use `AIChatContext#updateCurrentDocuments()` instead).
    * `AIEditing#sessionId` (use `AIEditing#getSessionId( editor )` instead).
    * `AIChatContext#getSourceByDataId()`
    * `AIChatContext#getDocumentContextSliceByDataId()`

  * Removed properties:
    * `AIReply#documentId`
    * `AIReply#newNodeAnchorIds`
    * `AIReply#dataIdDocumentSources`

  * Modified method signature:
    * `AIReply#appendContent( content )`
    * `AIEditing#modelToDataWithIds( modelFragment )`
    * `AIChatController#addSelectionToChatContext()`
    * `AIEditing#getSelectionText()`

  * Modified property type:
    * `AIReply#content`
    * `AIReply#parsedContent`
    * `AIReply#parsedMergedContent`
    * `AIReply#documentContextContent`

### Features

* **[core](https://www.npmjs.com/package/@ckeditor/ckeditor5-core), [editor-balloon](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-balloon), [editor-classic](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-classic), [editor-decoupled](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-decoupled), [editor-inline](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-inline), [editor-multi-root](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-multi-root), [ui](https://www.npmjs.com/package/@ckeditor/ckeditor5-ui)**: Added support for describing editable root elements through `config.root.element` and `config.roots.<rootName>.element` without supplying an existing DOM node. The configuration now accepts a tag-name string, such as `'h1'`, or a `ViewRootElementDefinition` object that defines the tag name, CSS classes, inline styles, and attributes. The `<textarea>` and `<input>` elements are not supported because they cannot host rich-text editables. Closes [#20047](https://github.com/ckeditor/ckeditor5/issues/20047).
* **[collaboration-core](https://www.npmjs.com/package/@ckeditor/ckeditor5-collaboration-core), [track-changes](https://www.npmjs.com/package/@ckeditor/ckeditor5-track-changes)**: Track Changes now integrates with the General HTML Support feature. GHS-produced elements and attributes are now tracked as suggestions instead of being applied silently to the document content.

  Changing GHS-produced HTML attributes, classes, or inline styles creates attribute suggestions. Suggestion descriptions now list inline styles by name and value, such as `Set format: border-color (green)`, and group class or HTML-attribute changes under concise labels, such as `Set format: style, metadata`. Insertion and deletion suggestions for GHS-driven elements, such as `<section>`, `<iframe>`, and `<article>`, now use HTML element names.
* **[collaboration-core](https://www.npmjs.com/package/@ckeditor/ckeditor5-collaboration-core), [track-changes](https://www.npmjs.com/package/@ckeditor/ckeditor5-track-changes)**: Track Changes now records suggestions for media embed resize and style changes.
* **[autoformat](https://www.npmjs.com/package/@ckeditor/ckeditor5-autoformat), [list](https://www.npmjs.com/package/@ckeditor/ckeditor5-list)**: Numbered list autoformat now accepts any starting number. Typing any number followed by `.` or `)` and a space (e.g. `5. `) creates a numbered list. When the `list.properties.startIndex` option is enabled, the list starts at the typed number.
* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai)**: Introduced General HTML Support integration with CKEditor 5 AI. AI Chat, AI Quick Actions, and AI Review can now process content that uses additional HTML elements and attributes.
* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai)**: Introduced a programmatic API for the `AIReview` plugin. See details in the [Using CKEditor AI programmatically](https://ckeditor.com/docs/ckeditor5/latest/features/ai/ckeditor-ai-programmatic.html#review) documentation.
* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai)**: Introduced paste support in the AI Chat input.

  Pasting a single bare URL adds it to the conversation context as a link pill. Pasting plain text above a configurable threshold attaches it as a `.txt` file. Pasting an image or any supported file attaches it to the conversation context as a file pill, with image pills using a dedicated icon.
* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai)**: Introduced drag-and-drop support to the AI Chat input.

  Files dropped onto the prompt input area are added to the chat context as pills. URLs and text dropped from the browser are also added to the conversation context as corresponding pills. The AI Chat input panel now shows a visual hint during the drag.
* **[editor-multi-root](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-multi-root)**: The `MultiRootEditor#createEditable()` method now accepts an existing `HTMLElement` or a `ViewRootElementDefinition`, so dynamically added roots can be attached to caller-owned DOM elements. Element definitions supplied at root configuration time are also replicated through real-time collaboration. Closes [#20047](https://github.com/ckeditor/ckeditor5/issues/20047).
* **[email](https://www.npmjs.com/package/@ckeditor/ckeditor5-email)**: Tables with resized columns now keep their column widths when exported as email. Previously, they fell back to auto-distributed sizing in Outlook and other email clients.
* **[list](https://www.npmjs.com/package/@ckeditor/ckeditor5-list)**: Added support for skip-level lists. List items can now be indented by more than one level at a time by enabling the `list.enableSkipLevelLists` configuration option. Closes [#12563](https://github.com/ckeditor/ckeditor5/issues/12563).
* **[media-embed](https://www.npmjs.com/package/@ckeditor/ckeditor5-media-embed)**: Introduced the media embed resize feature that allows users to resize embedded media via drag handles. Closes [#6593](https://github.com/ckeditor/ckeditor5/issues/6593).

  Embedded media now uses the `aspect-ratio` CSS property instead of a `padding-bottom` wrapper.
* **[media-embed](https://www.npmjs.com/package/@ckeditor/ckeditor5-media-embed)**: Introduced the media embed alignment feature, with optional text wrapping. Closes [#2781](https://github.com/ckeditor/ckeditor5/issues/2781).
* **[media-embed](https://www.npmjs.com/package/@ckeditor/ckeditor5-media-embed)**: Added `config.mediaEmbed.styles.options` for picking a subset of the built-in media embed styles, overriding their fields, or registering custom ones. The `config.mediaEmbed.toolbar` now also accepts inline split-button dropdown definitions. Closes [#20131](https://github.com/ckeditor/ckeditor5/issues/20131).

### Bug fixes

* **[clipboard](https://www.npmjs.com/package/@ckeditor/ckeditor5-clipboard), [paste-from-office](https://www.npmjs.com/package/@ckeditor/ckeditor5-paste-from-office)**: Fixed `ClipboardPipeline` and `PasteFromOffice` to allow common HTML string normalization before conversion to the view. Closes [#17309](https://github.com/ckeditor/ckeditor5/issues/17309).
* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai)**: Fixed an issue where AI Chat temporarily displayed wrap and unwrap proposed changes as removals before converting them to formatting changes.
* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai)**: The editor no longer crashes when users interact with double-unwrap proposed changes, such as changes in nested block quotes or custom widgets.
* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai)**: AI Chat Shortcuts buttons are now disabled while a context item is being uploaded, preventing the shortcut from executing until the context is ready.
* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai)**: Fixed the `model-nodelist-offset-out-of-bounds` error thrown by AI Quick Actions when the selection started at the end of the previous block, for example when selecting a full paragraph that begins after the trailing boundary of the block above it.
* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai)**: The preview balloon now scrolls back to the top when switching between AI Chat suggestions.
* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai)**: AI plugins no longer block editor initialization with HTTP requests. Model fetching, conversation creation, and review checks loading now run in the background while the editor becomes interactive immediately.
* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai)**: Fixed a visible scrollbar appearing in AI suggestion boxes caused by suggestion marker borders being clipped by the container overflow.
* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai)**: Improved AI Chat stability in multi-editor setups.

  AI Chat no longer crashes when users interact with suggestions or replies from destroyed editors or removed roots. The "Current document" chat context option now reflects the presence of editor instances, and Track Changes suggestion actions now behave consistently across multiple editors.
* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai)**: Fixed an issue where the HTML Embed widget could be duplicated after content was processed by AI features.
* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai)**: The AI Review "review completed" header title now truncates with an ellipsis when it overflows the available space in the check results view, matching the behavior of the empty-results completed view.
* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai)**: Preserved whitespace and newlines inside preformatted blocks in AI Chat replies.
* **[document-outline](https://www.npmjs.com/package/@ckeditor/ckeditor5-document-outline)**: Fixed `headingId` attribute handling for custom heading elements configured with non-standard model names, such as `heading2`, or object-based view definitions, such as `view: { name: 'h2', classes: 'fancy' }`. Previously, such configurations could result in errors during `editor.data.parse(...)` processing.
* **[footnotes](https://www.npmjs.com/package/@ckeditor/ckeditor5-footnotes)**: Fixed incorrect spacing of the footnotes list divider.
* **[heading](https://www.npmjs.com/package/@ckeditor/ckeditor5-heading)**: The Title feature now handles editor configurations where some or all roots use a custom `modelElement`. Roots that do not accept the `title` element are skipped at runtime, and the feature logs a single warning when no root supports the title structure. Closes [#20026](https://github.com/ckeditor/ckeditor5/issues/20026).
* **[html-support](https://www.npmjs.com/package/@ckeditor/ckeditor5-html-support)**: The General HTML Support schema for the `hgroup` element now works in editor configurations using a custom root `modelElement`. Closes [#20026](https://github.com/ckeditor/ckeditor5/issues/20026).
* **[html-support](https://www.npmjs.com/package/@ckeditor/ckeditor5-html-support)**: The HTML comments feature no longer assumes the root model element is `$root`. Comments are now preserved in editor configurations using a custom root `modelElement`. Closes [#20026](https://github.com/ckeditor/ckeditor5/issues/20026).
* **[link](https://www.npmjs.com/package/@ckeditor/ckeditor5-link)**: The link preview button now displays the no URL label for links with an empty `href`. Closes [#20136](https://github.com/ckeditor/ckeditor5/issues/20136).
* **[link](https://www.npmjs.com/package/@ckeditor/ckeditor5-link)**: Fixed an issue where the link edit form back button was hidden when editing a link with an empty URL via the balloon toolbar. See [#20136](https://github.com/ckeditor/ckeditor5/issues/20136).
* **[link](https://www.npmjs.com/package/@ckeditor/ckeditor5-link)**: Fixed text centering in the link preview button. See [#20136](https://github.com/ckeditor/ckeditor5/issues/20136).
* **[media-embed](https://www.npmjs.com/package/@ckeditor/ckeditor5-media-embed)**: Spotify track embeds now use a fixed height instead of a fluid aspect ratio to prevent incorrect resizing.

  Spotify track embeds now render at a fixed `80px` height, matching the compact single-row player. Album and artist embeds are unaffected and continue to use a responsive aspect ratio.
* **[pagination](https://www.npmjs.com/package/@ckeditor/ckeditor5-pagination)**: The pagination page navigator no longer changes its width based on the document's page count, so the toolbar's "show more items" button stays visible when long documents are loaded.
* **[paste-from-office](https://www.npmjs.com/package/@ckeditor/ckeditor5-paste-from-office)**: Fixed an issue where list items pasted from Word with three or more nesting levels could appear too far to the right when ancestor items had explicit paragraph indentation. Their position now matches Word's visual layout regardless of nesting depth.
* **[paste-from-office](https://www.npmjs.com/package/@ckeditor/ckeditor5-paste-from-office)**: Lists pasted from Microsoft Word now keep consistent left indentation. Closes [#20179](https://github.com/ckeditor/ckeditor5/issues/20179).

  Top-level list items that shared the same indentation in the original document no longer become visually misaligned in the editor when the list is interrupted by another list or by an empty paragraph. Nested list items pasted directly after their parent now keep their nesting level.

### Other changes

* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai)**: AI Chat messages now use larger body text, a clearer heading hierarchy, more spacing between list items, and distinct styling for code, tables, block quotations, and horizontal rules.
* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai)**: Streaming replies in AI Chat are no longer cancelled when the page is closed or reloaded. The reply keeps streaming on the server, and returning to the conversation reconnects to it and displays the remaining content. The reply is cancelled only when the Stop generating button is used.
* **[image](https://www.npmjs.com/package/@ckeditor/ckeditor5-image)**: Inline images are no longer allowed in roots or other limit elements that do not accept block content, such as `$inlineRoot` and custom inline-only roots. This also applies to custom limit element types contributed by integrators. Closes [#20047](https://github.com/ckeditor/ckeditor5/issues/20047).
* **[ui](https://www.npmjs.com/package/@ckeditor/ckeditor5-ui)**: The `HighlightedTextView` component now processes text containing HTML-special characters, such as `&`, `<`, and `>`.

### Released packages

Check out the [Versioning policy](https://ckeditor.com/docs/ckeditor5/latest/framework/guides/support/versioning-policy.html) guide for more information.

<details>
<summary>Released packages (summary)</summary>

Minor releases (contain minor breaking changes):

* [@ckeditor/ckeditor5-ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai/v/48.2.0): v48.1.1 => v48.2.0

Releases containing new features:

* [@ckeditor/ckeditor5-core](https://www.npmjs.com/package/@ckeditor/ckeditor5-core/v/48.2.0): v48.1.1 => v48.2.0
* [@ckeditor/ckeditor5-editor-balloon](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-balloon/v/48.2.0): v48.1.1 => v48.2.0
* [@ckeditor/ckeditor5-editor-classic](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-classic/v/48.2.0): v48.1.1 => v48.2.0
* [@ckeditor/ckeditor5-editor-decoupled](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-decoupled/v/48.2.0): v48.1.1 => v48.2.0
* [@ckeditor/ckeditor5-editor-inline](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-inline/v/48.2.0): v48.1.1 => v48.2.0
* [@ckeditor/ckeditor5-editor-multi-root](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-multi-root/v/48.2.0): v48.1.1 => v48.2.0
* [@ckeditor/ckeditor5-ui](https://www.npmjs.com/package/@ckeditor/ckeditor5-ui/v/48.2.0): v48.1.1 => v48.2.0
* [@ckeditor/ckeditor5-collaboration-core](https://www.npmjs.com/package/@ckeditor/ckeditor5-collaboration-core/v/48.2.0): v48.1.1 => v48.2.0
* [@ckeditor/ckeditor5-track-changes](https://www.npmjs.com/package/@ckeditor/ckeditor5-track-changes/v/48.2.0): v48.1.1 => v48.2.0
* [@ckeditor/ckeditor5-autoformat](https://www.npmjs.com/package/@ckeditor/ckeditor5-autoformat/v/48.2.0): v48.1.1 => v48.2.0
* [@ckeditor/ckeditor5-list](https://www.npmjs.com/package/@ckeditor/ckeditor5-list/v/48.2.0): v48.1.1 => v48.2.0
* [@ckeditor/ckeditor5-email](https://www.npmjs.com/package/@ckeditor/ckeditor5-email/v/48.2.0): v48.1.1 => v48.2.0
* [@ckeditor/ckeditor5-media-embed](https://www.npmjs.com/package/@ckeditor/ckeditor5-media-embed/v/48.2.0): v48.1.1 => v48.2.0

Other releases:

* [@ckeditor/ckeditor5-adapter-ckfinder](https://www.npmjs.com/package/@ckeditor/ckeditor5-adapter-ckfinder/v/48.2.0): v48.1.1 => v48.2.0
* [@ckeditor/ckeditor5-alignment](https://www.npmjs.com/package/@ckeditor/ckeditor5-alignment/v/48.2.0): v48.1.1 => v48.2.0
* [@ckeditor/ckeditor5-autosave](https://www.npmjs.com/package/@ckeditor/ckeditor5-autosave/v/48.2.0): v48.1.1 => v48.2.0
* [@ckeditor/ckeditor5-basic-styles](https://www.npmjs.com/package/@ckeditor/ckeditor5-basic-styles/v/48.2.0): v48.1.1 => v48.2.0
* [@ckeditor/ckeditor5-block-quote](https://www.npmjs.com/package/@ckeditor/ckeditor5-block-quote/v/48.2.0): v48.1.1 => v48.2.0
* [@ckeditor/ckeditor5-bookmark](https://www.npmjs.com/package/@ckeditor/ckeditor5-bookmark/v/48.2.0): v48.1.1 => v48.2.0
* [@ckeditor/ckeditor5-case-change](https://www.npmjs.com/package/@ckeditor/ckeditor5-case-change/v/48.2.0): v48.1.1 => v48.2.0
* [@ckeditor/ckeditor5-ckbox](https://www.npmjs.com/package/@ckeditor/ckeditor5-ckbox/v/48.2.0): v48.1.1 => v48.2.0
* [@ckeditor/ckeditor5-ckfinder](https://www.npmjs.com/package/@ckeditor/ckeditor5-ckfinder/v/48.2.0): v48.1.1 => v48.2.0
* [@ckeditor/ckeditor5-clipboard](https://www.npmjs.com/package/@ckeditor/ckeditor5-clipboard/v/48.2.0): v48.1.1 => v48.2.0
* [@ckeditor/ckeditor5-cloud-services](https://www.npmjs.com/package/@ckeditor/ckeditor5-cloud-services/v/48.2.0): v48.1.1 => v48.2.0
* [@ckeditor/ckeditor5-code-block](https://www.npmjs.com/package/@ckeditor/ckeditor5-code-block/v/48.2.0): v48.1.1 => v48.2.0
* [@ckeditor/ckeditor5-comments](https://www.npmjs.com/package/@ckeditor/ckeditor5-comments/v/48.2.0): v48.1.1 => v48.2.0
* [@ckeditor/ckeditor5-document-outline](https://www.npmjs.com/package/@ckeditor/ckeditor5-document-outline/v/48.2.0): v48.1.1 => v48.2.0
* [@ckeditor/ckeditor5-easy-image](https://www.npmjs.com/package/@ckeditor/ckeditor5-easy-image/v/48.2.0): v48.1.1 => v48.2.0
* [@ckeditor/ckeditor5-emoji](https://www.npmjs.com/package/@ckeditor/ckeditor5-emoji/v/48.2.0): v48.1.1 => v48.2.0
* [@ckeditor/ckeditor5-engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine/v/48.2.0): v48.1.1 => v48.2.0
* [@ckeditor/ckeditor5-enter](https://www.npmjs.com/package/@ckeditor/ckeditor5-enter/v/48.2.0): v48.1.1 => v48.2.0
* [@ckeditor/ckeditor5-essentials](https://www.npmjs.com/package/@ckeditor/ckeditor5-essentials/v/48.2.0): v48.1.1 => v48.2.0
* [@ckeditor/ckeditor5-export-inline-styles](https://www.npmjs.com/package/@ckeditor/ckeditor5-export-inline-styles/v/48.2.0): v48.1.1 => v48.2.0
* [@ckeditor/ckeditor5-export-pdf](https://www.npmjs.com/package/@ckeditor/ckeditor5-export-pdf/v/48.2.0): v48.1.1 => v48.2.0
* [@ckeditor/ckeditor5-export-word](https://www.npmjs.com/package/@ckeditor/ckeditor5-export-word/v/48.2.0): v48.1.1 => v48.2.0
* [@ckeditor/ckeditor5-find-and-replace](https://www.npmjs.com/package/@ckeditor/ckeditor5-find-and-replace/v/48.2.0): v48.1.1 => v48.2.0
* [@ckeditor/ckeditor5-font](https://www.npmjs.com/package/@ckeditor/ckeditor5-font/v/48.2.0): v48.1.1 => v48.2.0
* [@ckeditor/ckeditor5-footnotes](https://www.npmjs.com/package/@ckeditor/ckeditor5-footnotes/v/48.2.0): v48.1.1 => v48.2.0
* [@ckeditor/ckeditor5-format-painter](https://www.npmjs.com/package/@ckeditor/ckeditor5-format-painter/v/48.2.0): v48.1.1 => v48.2.0
* [@ckeditor/ckeditor5-fullscreen](https://www.npmjs.com/package/@ckeditor/ckeditor5-fullscreen/v/48.2.0): v48.1.1 => v48.2.0
* [@ckeditor/ckeditor5-heading](https://www.npmjs.com/package/@ckeditor/ckeditor5-heading/v/48.2.0): v48.1.1 => v48.2.0
* [@ckeditor/ckeditor5-highlight](https://www.npmjs.com/package/@ckeditor/ckeditor5-highlight/v/48.2.0): v48.1.1 => v48.2.0
* [@ckeditor/ckeditor5-horizontal-line](https://www.npmjs.com/package/@ckeditor/ckeditor5-horizontal-line/v/48.2.0): v48.1.1 => v48.2.0
* [@ckeditor/ckeditor5-html-embed](https://www.npmjs.com/package/@ckeditor/ckeditor5-html-embed/v/48.2.0): v48.1.1 => v48.2.0
* [@ckeditor/ckeditor5-html-support](https://www.npmjs.com/package/@ckeditor/ckeditor5-html-support/v/48.2.0): v48.1.1 => v48.2.0
* [@ckeditor/ckeditor5-icons](https://www.npmjs.com/package/@ckeditor/ckeditor5-icons/v/48.2.0): v48.1.1 => v48.2.0
* [@ckeditor/ckeditor5-image](https://www.npmjs.com/package/@ckeditor/ckeditor5-image/v/48.2.0): v48.1.1 => v48.2.0
* [@ckeditor/ckeditor5-import-word](https://www.npmjs.com/package/@ckeditor/ckeditor5-import-word/v/48.2.0): v48.1.1 => v48.2.0
* [@ckeditor/ckeditor5-indent](https://www.npmjs.com/package/@ckeditor/ckeditor5-indent/v/48.2.0): v48.1.1 => v48.2.0
* [@ckeditor/ckeditor5-language](https://www.npmjs.com/package/@ckeditor/ckeditor5-language/v/48.2.0): v48.1.1 => v48.2.0
* [@ckeditor/ckeditor5-line-height](https://www.npmjs.com/package/@ckeditor/ckeditor5-line-height/v/48.2.0): v48.1.1 => v48.2.0
* [@ckeditor/ckeditor5-link](https://www.npmjs.com/package/@ckeditor/ckeditor5-link/v/48.2.0): v48.1.1 => v48.2.0
* [@ckeditor/ckeditor5-list-multi-level](https://www.npmjs.com/package/@ckeditor/ckeditor5-list-multi-level/v/48.2.0): v48.1.1 => v48.2.0
* [@ckeditor/ckeditor5-markdown-gfm](https://www.npmjs.com/package/@ckeditor/ckeditor5-markdown-gfm/v/48.2.0): v48.1.1 => v48.2.0
* [@ckeditor/ckeditor5-mention](https://www.npmjs.com/package/@ckeditor/ckeditor5-mention/v/48.2.0): v48.1.1 => v48.2.0
* [@ckeditor/ckeditor5-merge-fields](https://www.npmjs.com/package/@ckeditor/ckeditor5-merge-fields/v/48.2.0): v48.1.1 => v48.2.0
* [@ckeditor/ckeditor5-minimap](https://www.npmjs.com/package/@ckeditor/ckeditor5-minimap/v/48.2.0): v48.1.1 => v48.2.0
* [@ckeditor/ckeditor5-operations-compressor](https://www.npmjs.com/package/@ckeditor/ckeditor5-operations-compressor/v/48.2.0): v48.1.1 => v48.2.0
* [@ckeditor/ckeditor5-page-break](https://www.npmjs.com/package/@ckeditor/ckeditor5-page-break/v/48.2.0): v48.1.1 => v48.2.0
* [@ckeditor/ckeditor5-pagination](https://www.npmjs.com/package/@ckeditor/ckeditor5-pagination/v/48.2.0): v48.1.1 => v48.2.0
* [@ckeditor/ckeditor5-paragraph](https://www.npmjs.com/package/@ckeditor/ckeditor5-paragraph/v/48.2.0): v48.1.1 => v48.2.0
* [@ckeditor/ckeditor5-paste-from-office](https://www.npmjs.com/package/@ckeditor/ckeditor5-paste-from-office/v/48.2.0): v48.1.1 => v48.2.0
* [@ckeditor/ckeditor5-paste-from-office-enhanced](https://www.npmjs.com/package/@ckeditor/ckeditor5-paste-from-office-enhanced/v/48.2.0): v48.1.1 => v48.2.0
* [@ckeditor/ckeditor5-real-time-collaboration](https://www.npmjs.com/package/@ckeditor/ckeditor5-real-time-collaboration/v/48.2.0): v48.1.1 => v48.2.0
* [@ckeditor/ckeditor5-remove-format](https://www.npmjs.com/package/@ckeditor/ckeditor5-remove-format/v/48.2.0): v48.1.1 => v48.2.0
* [@ckeditor/ckeditor5-restricted-editing](https://www.npmjs.com/package/@ckeditor/ckeditor5-restricted-editing/v/48.2.0): v48.1.1 => v48.2.0
* [@ckeditor/ckeditor5-revision-history](https://www.npmjs.com/package/@ckeditor/ckeditor5-revision-history/v/48.2.0): v48.1.1 => v48.2.0
* [@ckeditor/ckeditor5-select-all](https://www.npmjs.com/package/@ckeditor/ckeditor5-select-all/v/48.2.0): v48.1.1 => v48.2.0
* [@ckeditor/ckeditor5-show-blocks](https://www.npmjs.com/package/@ckeditor/ckeditor5-show-blocks/v/48.2.0): v48.1.1 => v48.2.0
* [@ckeditor/ckeditor5-slash-command](https://www.npmjs.com/package/@ckeditor/ckeditor5-slash-command/v/48.2.0): v48.1.1 => v48.2.0
* [@ckeditor/ckeditor5-source-editing](https://www.npmjs.com/package/@ckeditor/ckeditor5-source-editing/v/48.2.0): v48.1.1 => v48.2.0
* [@ckeditor/ckeditor5-source-editing-enhanced](https://www.npmjs.com/package/@ckeditor/ckeditor5-source-editing-enhanced/v/48.2.0): v48.1.1 => v48.2.0
* [@ckeditor/ckeditor5-special-characters](https://www.npmjs.com/package/@ckeditor/ckeditor5-special-characters/v/48.2.0): v48.1.1 => v48.2.0
* [@ckeditor/ckeditor5-style](https://www.npmjs.com/package/@ckeditor/ckeditor5-style/v/48.2.0): v48.1.1 => v48.2.0
* [@ckeditor/ckeditor5-table](https://www.npmjs.com/package/@ckeditor/ckeditor5-table/v/48.2.0): v48.1.1 => v48.2.0
* [@ckeditor/ckeditor5-template](https://www.npmjs.com/package/@ckeditor/ckeditor5-template/v/48.2.0): v48.1.1 => v48.2.0
* [@ckeditor/ckeditor5-typing](https://www.npmjs.com/package/@ckeditor/ckeditor5-typing/v/48.2.0): v48.1.1 => v48.2.0
* [@ckeditor/ckeditor5-undo](https://www.npmjs.com/package/@ckeditor/ckeditor5-undo/v/48.2.0): v48.1.1 => v48.2.0
* [@ckeditor/ckeditor5-upload](https://www.npmjs.com/package/@ckeditor/ckeditor5-upload/v/48.2.0): v48.1.1 => v48.2.0
* [@ckeditor/ckeditor5-uploadcare](https://www.npmjs.com/package/@ckeditor/ckeditor5-uploadcare/v/48.2.0): v48.1.1 => v48.2.0
* [@ckeditor/ckeditor5-utils](https://www.npmjs.com/package/@ckeditor/ckeditor5-utils/v/48.2.0): v48.1.1 => v48.2.0
* [@ckeditor/ckeditor5-watchdog](https://www.npmjs.com/package/@ckeditor/ckeditor5-watchdog/v/48.2.0): v48.1.1 => v48.2.0
* [@ckeditor/ckeditor5-widget](https://www.npmjs.com/package/@ckeditor/ckeditor5-widget/v/48.2.0): v48.1.1 => v48.2.0
* [@ckeditor/ckeditor5-word-count](https://www.npmjs.com/package/@ckeditor/ckeditor5-word-count/v/48.2.0): v48.1.1 => v48.2.0
* [ckeditor5](https://www.npmjs.com/package/ckeditor5/v/48.2.0): v48.1.1 => v48.2.0
* [ckeditor5-premium-features](https://www.npmjs.com/package/ckeditor5-premium-features/v/48.2.0): v48.1.1 => v48.2.0
</details>


## [48.1.1](https://github.com/ckeditor/ckeditor5/compare/v48.1.0...v48.1.1) (May 18, 2026)

We are happy to announce the release of CKEditor 5 v48.1.1.

### Release highlights

The release addresses vulnerabilities identified in the [`protobuf.js`](https://www.npmjs.com/package/protobufjs) package, used within our [**`@ckeditor/ckeditor5-operations-compressor`**](https://www.npmjs.com/package/@ckeditor/ckeditor5-operations-compressor) package for real-time collaboration.

Our analysis confirms that vulnerabilities **do not affect** CKEditor 5.

This release primarily aims to ensure that our customers using real-time collaboration features do not encounter unnecessary security alerts from their scanning tools. We are committed to maintaining the highest security standards, and this update reflects our ongoing efforts to safeguard user environments proactively.

### Bug fixes

* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai)**: Fixed an issue where the AI Review tooltip was not appearing when hovering over review suggestions.
* **[footnotes](https://www.npmjs.com/package/@ckeditor/ckeditor5-footnotes)**: Fix incorrect spacing of footnotes list divider.

### Released packages

Check out the [Versioning policy](https://ckeditor.com/docs/ckeditor5/latest/framework/guides/support/versioning-policy.html) guide for more information.

<details>
<summary>Released packages (summary)</summary>

Other releases:

* [@ckeditor/ckeditor5-adapter-ckfinder](https://www.npmjs.com/package/@ckeditor/ckeditor5-adapter-ckfinder/v/48.1.1): v48.1.0 => v48.1.1
* [@ckeditor/ckeditor5-ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai/v/48.1.1): v48.1.0 => v48.1.1
* [@ckeditor/ckeditor5-alignment](https://www.npmjs.com/package/@ckeditor/ckeditor5-alignment/v/48.1.1): v48.1.0 => v48.1.1
* [@ckeditor/ckeditor5-autoformat](https://www.npmjs.com/package/@ckeditor/ckeditor5-autoformat/v/48.1.1): v48.1.0 => v48.1.1
* [@ckeditor/ckeditor5-autosave](https://www.npmjs.com/package/@ckeditor/ckeditor5-autosave/v/48.1.1): v48.1.0 => v48.1.1
* [@ckeditor/ckeditor5-basic-styles](https://www.npmjs.com/package/@ckeditor/ckeditor5-basic-styles/v/48.1.1): v48.1.0 => v48.1.1
* [@ckeditor/ckeditor5-block-quote](https://www.npmjs.com/package/@ckeditor/ckeditor5-block-quote/v/48.1.1): v48.1.0 => v48.1.1
* [@ckeditor/ckeditor5-bookmark](https://www.npmjs.com/package/@ckeditor/ckeditor5-bookmark/v/48.1.1): v48.1.0 => v48.1.1
* [@ckeditor/ckeditor5-case-change](https://www.npmjs.com/package/@ckeditor/ckeditor5-case-change/v/48.1.1): v48.1.0 => v48.1.1
* [@ckeditor/ckeditor5-ckbox](https://www.npmjs.com/package/@ckeditor/ckeditor5-ckbox/v/48.1.1): v48.1.0 => v48.1.1
* [@ckeditor/ckeditor5-ckfinder](https://www.npmjs.com/package/@ckeditor/ckeditor5-ckfinder/v/48.1.1): v48.1.0 => v48.1.1
* [@ckeditor/ckeditor5-clipboard](https://www.npmjs.com/package/@ckeditor/ckeditor5-clipboard/v/48.1.1): v48.1.0 => v48.1.1
* [@ckeditor/ckeditor5-cloud-services](https://www.npmjs.com/package/@ckeditor/ckeditor5-cloud-services/v/48.1.1): v48.1.0 => v48.1.1
* [@ckeditor/ckeditor5-code-block](https://www.npmjs.com/package/@ckeditor/ckeditor5-code-block/v/48.1.1): v48.1.0 => v48.1.1
* [@ckeditor/ckeditor5-collaboration-core](https://www.npmjs.com/package/@ckeditor/ckeditor5-collaboration-core/v/48.1.1): v48.1.0 => v48.1.1
* [@ckeditor/ckeditor5-comments](https://www.npmjs.com/package/@ckeditor/ckeditor5-comments/v/48.1.1): v48.1.0 => v48.1.1
* [@ckeditor/ckeditor5-core](https://www.npmjs.com/package/@ckeditor/ckeditor5-core/v/48.1.1): v48.1.0 => v48.1.1
* [@ckeditor/ckeditor5-document-outline](https://www.npmjs.com/package/@ckeditor/ckeditor5-document-outline/v/48.1.1): v48.1.0 => v48.1.1
* [@ckeditor/ckeditor5-easy-image](https://www.npmjs.com/package/@ckeditor/ckeditor5-easy-image/v/48.1.1): v48.1.0 => v48.1.1
* [@ckeditor/ckeditor5-editor-balloon](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-balloon/v/48.1.1): v48.1.0 => v48.1.1
* [@ckeditor/ckeditor5-editor-classic](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-classic/v/48.1.1): v48.1.0 => v48.1.1
* [@ckeditor/ckeditor5-editor-decoupled](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-decoupled/v/48.1.1): v48.1.0 => v48.1.1
* [@ckeditor/ckeditor5-editor-inline](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-inline/v/48.1.1): v48.1.0 => v48.1.1
* [@ckeditor/ckeditor5-editor-multi-root](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-multi-root/v/48.1.1): v48.1.0 => v48.1.1
* [@ckeditor/ckeditor5-email](https://www.npmjs.com/package/@ckeditor/ckeditor5-email/v/48.1.1): v48.1.0 => v48.1.1
* [@ckeditor/ckeditor5-emoji](https://www.npmjs.com/package/@ckeditor/ckeditor5-emoji/v/48.1.1): v48.1.0 => v48.1.1
* [@ckeditor/ckeditor5-engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine/v/48.1.1): v48.1.0 => v48.1.1
* [@ckeditor/ckeditor5-enter](https://www.npmjs.com/package/@ckeditor/ckeditor5-enter/v/48.1.1): v48.1.0 => v48.1.1
* [@ckeditor/ckeditor5-essentials](https://www.npmjs.com/package/@ckeditor/ckeditor5-essentials/v/48.1.1): v48.1.0 => v48.1.1
* [@ckeditor/ckeditor5-export-inline-styles](https://www.npmjs.com/package/@ckeditor/ckeditor5-export-inline-styles/v/48.1.1): v48.1.0 => v48.1.1
* [@ckeditor/ckeditor5-export-pdf](https://www.npmjs.com/package/@ckeditor/ckeditor5-export-pdf/v/48.1.1): v48.1.0 => v48.1.1
* [@ckeditor/ckeditor5-export-word](https://www.npmjs.com/package/@ckeditor/ckeditor5-export-word/v/48.1.1): v48.1.0 => v48.1.1
* [@ckeditor/ckeditor5-find-and-replace](https://www.npmjs.com/package/@ckeditor/ckeditor5-find-and-replace/v/48.1.1): v48.1.0 => v48.1.1
* [@ckeditor/ckeditor5-font](https://www.npmjs.com/package/@ckeditor/ckeditor5-font/v/48.1.1): v48.1.0 => v48.1.1
* [@ckeditor/ckeditor5-footnotes](https://www.npmjs.com/package/@ckeditor/ckeditor5-footnotes/v/48.1.1): v48.1.0 => v48.1.1
* [@ckeditor/ckeditor5-format-painter](https://www.npmjs.com/package/@ckeditor/ckeditor5-format-painter/v/48.1.1): v48.1.0 => v48.1.1
* [@ckeditor/ckeditor5-fullscreen](https://www.npmjs.com/package/@ckeditor/ckeditor5-fullscreen/v/48.1.1): v48.1.0 => v48.1.1
* [@ckeditor/ckeditor5-heading](https://www.npmjs.com/package/@ckeditor/ckeditor5-heading/v/48.1.1): v48.1.0 => v48.1.1
* [@ckeditor/ckeditor5-highlight](https://www.npmjs.com/package/@ckeditor/ckeditor5-highlight/v/48.1.1): v48.1.0 => v48.1.1
* [@ckeditor/ckeditor5-horizontal-line](https://www.npmjs.com/package/@ckeditor/ckeditor5-horizontal-line/v/48.1.1): v48.1.0 => v48.1.1
* [@ckeditor/ckeditor5-html-embed](https://www.npmjs.com/package/@ckeditor/ckeditor5-html-embed/v/48.1.1): v48.1.0 => v48.1.1
* [@ckeditor/ckeditor5-html-support](https://www.npmjs.com/package/@ckeditor/ckeditor5-html-support/v/48.1.1): v48.1.0 => v48.1.1
* [@ckeditor/ckeditor5-icons](https://www.npmjs.com/package/@ckeditor/ckeditor5-icons/v/48.1.1): v48.1.0 => v48.1.1
* [@ckeditor/ckeditor5-image](https://www.npmjs.com/package/@ckeditor/ckeditor5-image/v/48.1.1): v48.1.0 => v48.1.1
* [@ckeditor/ckeditor5-import-word](https://www.npmjs.com/package/@ckeditor/ckeditor5-import-word/v/48.1.1): v48.1.0 => v48.1.1
* [@ckeditor/ckeditor5-indent](https://www.npmjs.com/package/@ckeditor/ckeditor5-indent/v/48.1.1): v48.1.0 => v48.1.1
* [@ckeditor/ckeditor5-language](https://www.npmjs.com/package/@ckeditor/ckeditor5-language/v/48.1.1): v48.1.0 => v48.1.1
* [@ckeditor/ckeditor5-line-height](https://www.npmjs.com/package/@ckeditor/ckeditor5-line-height/v/48.1.1): v48.1.0 => v48.1.1
* [@ckeditor/ckeditor5-link](https://www.npmjs.com/package/@ckeditor/ckeditor5-link/v/48.1.1): v48.1.0 => v48.1.1
* [@ckeditor/ckeditor5-list](https://www.npmjs.com/package/@ckeditor/ckeditor5-list/v/48.1.1): v48.1.0 => v48.1.1
* [@ckeditor/ckeditor5-list-multi-level](https://www.npmjs.com/package/@ckeditor/ckeditor5-list-multi-level/v/48.1.1): v48.1.0 => v48.1.1
* [@ckeditor/ckeditor5-markdown-gfm](https://www.npmjs.com/package/@ckeditor/ckeditor5-markdown-gfm/v/48.1.1): v48.1.0 => v48.1.1
* [@ckeditor/ckeditor5-media-embed](https://www.npmjs.com/package/@ckeditor/ckeditor5-media-embed/v/48.1.1): v48.1.0 => v48.1.1
* [@ckeditor/ckeditor5-mention](https://www.npmjs.com/package/@ckeditor/ckeditor5-mention/v/48.1.1): v48.1.0 => v48.1.1
* [@ckeditor/ckeditor5-merge-fields](https://www.npmjs.com/package/@ckeditor/ckeditor5-merge-fields/v/48.1.1): v48.1.0 => v48.1.1
* [@ckeditor/ckeditor5-minimap](https://www.npmjs.com/package/@ckeditor/ckeditor5-minimap/v/48.1.1): v48.1.0 => v48.1.1
* [@ckeditor/ckeditor5-operations-compressor](https://www.npmjs.com/package/@ckeditor/ckeditor5-operations-compressor/v/48.1.1): v48.1.0 => v48.1.1
* [@ckeditor/ckeditor5-page-break](https://www.npmjs.com/package/@ckeditor/ckeditor5-page-break/v/48.1.1): v48.1.0 => v48.1.1
* [@ckeditor/ckeditor5-pagination](https://www.npmjs.com/package/@ckeditor/ckeditor5-pagination/v/48.1.1): v48.1.0 => v48.1.1
* [@ckeditor/ckeditor5-paragraph](https://www.npmjs.com/package/@ckeditor/ckeditor5-paragraph/v/48.1.1): v48.1.0 => v48.1.1
* [@ckeditor/ckeditor5-paste-from-office](https://www.npmjs.com/package/@ckeditor/ckeditor5-paste-from-office/v/48.1.1): v48.1.0 => v48.1.1
* [@ckeditor/ckeditor5-paste-from-office-enhanced](https://www.npmjs.com/package/@ckeditor/ckeditor5-paste-from-office-enhanced/v/48.1.1): v48.1.0 => v48.1.1
* [@ckeditor/ckeditor5-real-time-collaboration](https://www.npmjs.com/package/@ckeditor/ckeditor5-real-time-collaboration/v/48.1.1): v48.1.0 => v48.1.1
* [@ckeditor/ckeditor5-remove-format](https://www.npmjs.com/package/@ckeditor/ckeditor5-remove-format/v/48.1.1): v48.1.0 => v48.1.1
* [@ckeditor/ckeditor5-restricted-editing](https://www.npmjs.com/package/@ckeditor/ckeditor5-restricted-editing/v/48.1.1): v48.1.0 => v48.1.1
* [@ckeditor/ckeditor5-revision-history](https://www.npmjs.com/package/@ckeditor/ckeditor5-revision-history/v/48.1.1): v48.1.0 => v48.1.1
* [@ckeditor/ckeditor5-select-all](https://www.npmjs.com/package/@ckeditor/ckeditor5-select-all/v/48.1.1): v48.1.0 => v48.1.1
* [@ckeditor/ckeditor5-show-blocks](https://www.npmjs.com/package/@ckeditor/ckeditor5-show-blocks/v/48.1.1): v48.1.0 => v48.1.1
* [@ckeditor/ckeditor5-slash-command](https://www.npmjs.com/package/@ckeditor/ckeditor5-slash-command/v/48.1.1): v48.1.0 => v48.1.1
* [@ckeditor/ckeditor5-source-editing](https://www.npmjs.com/package/@ckeditor/ckeditor5-source-editing/v/48.1.1): v48.1.0 => v48.1.1
* [@ckeditor/ckeditor5-source-editing-enhanced](https://www.npmjs.com/package/@ckeditor/ckeditor5-source-editing-enhanced/v/48.1.1): v48.1.0 => v48.1.1
* [@ckeditor/ckeditor5-special-characters](https://www.npmjs.com/package/@ckeditor/ckeditor5-special-characters/v/48.1.1): v48.1.0 => v48.1.1
* [@ckeditor/ckeditor5-style](https://www.npmjs.com/package/@ckeditor/ckeditor5-style/v/48.1.1): v48.1.0 => v48.1.1
* [@ckeditor/ckeditor5-table](https://www.npmjs.com/package/@ckeditor/ckeditor5-table/v/48.1.1): v48.1.0 => v48.1.1
* [@ckeditor/ckeditor5-template](https://www.npmjs.com/package/@ckeditor/ckeditor5-template/v/48.1.1): v48.1.0 => v48.1.1
* [@ckeditor/ckeditor5-track-changes](https://www.npmjs.com/package/@ckeditor/ckeditor5-track-changes/v/48.1.1): v48.1.0 => v48.1.1
* [@ckeditor/ckeditor5-typing](https://www.npmjs.com/package/@ckeditor/ckeditor5-typing/v/48.1.1): v48.1.0 => v48.1.1
* [@ckeditor/ckeditor5-ui](https://www.npmjs.com/package/@ckeditor/ckeditor5-ui/v/48.1.1): v48.1.0 => v48.1.1
* [@ckeditor/ckeditor5-undo](https://www.npmjs.com/package/@ckeditor/ckeditor5-undo/v/48.1.1): v48.1.0 => v48.1.1
* [@ckeditor/ckeditor5-upload](https://www.npmjs.com/package/@ckeditor/ckeditor5-upload/v/48.1.1): v48.1.0 => v48.1.1
* [@ckeditor/ckeditor5-uploadcare](https://www.npmjs.com/package/@ckeditor/ckeditor5-uploadcare/v/48.1.1): v48.1.0 => v48.1.1
* [@ckeditor/ckeditor5-utils](https://www.npmjs.com/package/@ckeditor/ckeditor5-utils/v/48.1.1): v48.1.0 => v48.1.1
* [@ckeditor/ckeditor5-watchdog](https://www.npmjs.com/package/@ckeditor/ckeditor5-watchdog/v/48.1.1): v48.1.0 => v48.1.1
* [@ckeditor/ckeditor5-widget](https://www.npmjs.com/package/@ckeditor/ckeditor5-widget/v/48.1.1): v48.1.0 => v48.1.1
* [@ckeditor/ckeditor5-word-count](https://www.npmjs.com/package/@ckeditor/ckeditor5-word-count/v/48.1.1): v48.1.0 => v48.1.1
* [ckeditor5](https://www.npmjs.com/package/ckeditor5/v/48.1.1): v48.1.0 => v48.1.1
* [ckeditor5-premium-features](https://www.npmjs.com/package/ckeditor5-premium-features/v/48.1.1): v48.1.0 => v48.1.1
</details>

---

To see all releases, visit the [release page](https://github.com/ckeditor/ckeditor5/releases).
