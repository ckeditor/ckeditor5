Changelog
=========

## [48.1.0](https://github.com/ckeditor/ckeditor5/compare/v48.0.1...v48.1.0) (May 13, 2026)

### MINOR BREAKING CHANGES [ℹ️](https://ckeditor.com/docs/ckeditor5/latest/framework/guides/support/versioning-policy.html#major-and-minor-breaking-changes)

* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai)**: The AI Chat feed items are now aligned to the bottom of the feed by default. If you want to revert to the previous top-aligned behavior, add the following CSS to your integration:

  ```css
  .ck.ck-ai-chat__feed__items {
      margin-top: 0;
  }
  ```
* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai)**: To reduce the visual strain on the user, suggestions proposed by the agent in the AI Chat feed are now always displayed in full when ready (previously streamed word-by-word).

### Features

* **[core](https://www.npmjs.com/package/@ckeditor/ckeditor5-core), [editor-balloon](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-balloon), [editor-classic](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-classic), [editor-decoupled](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-decoupled), [editor-inline](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-inline), [editor-multi-root](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-multi-root), [engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine)**: Introduced `config.root.modelElement` for single-root editors and `config.roots.<name>.modelElement` for the multi-root editor, allowing customization of the model root element type via editor configuration. Also introduced the `$inlineRoot` generic schema item to be used with the new editor option. Closes [#20029](https://github.com/ckeditor/ckeditor5/issues/20029).
* **[core](https://www.npmjs.com/package/@ckeditor/ckeditor5-core), [editor-balloon](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-balloon), [editor-classic](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-classic), [editor-decoupled](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-decoupled), [editor-inline](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-inline)**: Enabled the `modelAttributes` root configuration option for all single-root editors.
* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai)**: Added the opt-in `config.ai.container.collapsible` configuration option (defaults to `false`). When enabled, clicking the active tab button toggles the `.ck-ai-tabs_collapsed` CSS class on the `.ck-ai-tabs` element. Default collapsed-state styling is provided for all container modes, and integrators can further customize or override it based on the CSS class.
* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai)**: The `AIChatController#startConversation()` method now accepts an optional `modelId` parameter to select a specific model for the new conversation. Custom Quick Actions of type `chat` with a `model` property will now use it when starting a chat conversation.
* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai)**: [AI Review](https://ckeditor.com/docs/ckeditor5/latest/features/ai/ckeditor-ai-review.html) and [AI Translate](https://ckeditor.com/docs/ckeditor5/latest/features/ai/ckeditor-ai-translate.html) now support [multi-root editors](https://ckeditor.com/docs/ckeditor5/latest/getting-started/setup/editor-types.html#multi-root-editor) and multi-editor-instance [contexts](https://ckeditor.com/docs/ckeditor5/latest/api/module_core_context-Context.html).
* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai)**: [AI Chat and AI Chat History](https://ckeditor.com/docs/ckeditor5/latest/features/ai/ckeditor-ai-chat.html) now support [multi-root editors](https://ckeditor.com/docs/ckeditor5/latest/getting-started/setup/editor-types.html#multi-root-editor) and multi-editor-instance [contexts](https://ckeditor.com/docs/ckeditor5/latest/api/module_core_context-Context.html).
* **[document-outline](https://www.npmjs.com/package/@ckeditor/ckeditor5-document-outline)**: Added a new `tableOfContents.headings` option that lets you choose which heading levels appear in the Table of Contents widget, independently from the Document Outline sidebar.
* **[email](https://www.npmjs.com/package/@ckeditor/ckeditor5-email)**: Added support for restoring the `align` attribute on table cells during email transformations. This applies when all child elements of a given cell share the same alignment. As a result, the emitted HTML is more compact and ensures better compatibility with legacy email clients. See [ckeditor/ckeditor5#19883](https://github.com/ckeditor/ckeditor5/issues/19883).
* **[export-inline-styles](https://www.npmjs.com/package/@ckeditor/ckeditor5-export-inline-styles)**: Added `runAfterDocumentTransformation` and `runAfterChildrenTransformation` callbacks to the transformation flow. This allows deferring the transformation of specific elements until all of their children, or the entire document, have been fully processed and their styles inlined.
* **[format-painter](https://www.npmjs.com/package/@ckeditor/ckeditor5-format-painter)**: Added an ARIA live announcement when the user cancels format painting by pressing the Escape key.

### Bug fixes

* **[code-block](https://www.npmjs.com/package/@ckeditor/ckeditor5-code-block), [emoji](https://www.npmjs.com/package/@ckeditor/ckeditor5-emoji), [mention](https://www.npmjs.com/package/@ckeditor/ckeditor5-mention)**: Mention autocompletion (and features built on top of it, such as slash commands and emoji) no longer triggers inside code blocks. Closes [#19146](https://github.com/ckeditor/ckeditor5/issues/19146).
* **[engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine), [enter](https://www.npmjs.com/package/@ckeditor/ckeditor5-enter)**: Improved document selection attribute inheritance around `<softBreak>` so returning the caret after a soft break restores expected formatting. Closes [#19853](https://github.com/ckeditor/ckeditor5/issues/19853).

  When selection attributes are recalculated across `<softBreak>`, only attributes marked with `copyOnEnter` are inherited. Other inline non-object elements still act as hard boundaries.
* **[engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine), [enter](https://www.npmjs.com/package/@ckeditor/ckeditor5-enter)**: Inline formatting attributes (such as bold or link) are no longer split by a soft break (`<br>`). The `<br>` element now inherits applicable text attributes so that attribute elements in the view can wrap around it without being broken into separate segments. Closes [#1068](https://github.com/ckeditor/ckeditor5/issues/1068).
* **[show-blocks](https://www.npmjs.com/package/@ckeditor/ckeditor5-show-blocks), [table](https://www.npmjs.com/package/@ckeditor/ckeditor5-table)**: Improved the performance of the show blocks and table selection styles by rewriting selectors to avoid expensive `:is(...)` output after CSS nesting compilation. Closes [#20058](https://github.com/ckeditor/ckeditor5/issues/20058).
* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai)**: Fixed a bug where the AI Quick Actions balloon selection marker was incorrectly included in the AI Chat context.
* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai)**: Custom Quick Actions of type `action` without a `model` property now correctly fall back to the default model (from `ai.models.defaultModelId` configuration or the first available model) instead of failing with a 400 error from the backend.
* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai)**: Introduced multiple fixes to enable scenarios where the user asks the AI to format a bigger piece of unformatted content.
* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai)**: Fixed some instances of flickering and stuttering in AI Chat sidebar.
* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai)**: AI Review no longer throws an error on running review commands if editor content contains multiline code block.
* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai)**: Fixed a bug where custom MCP tool context item chips displayed a UUID instead of the human-readable label after reloading a conversation from history. The label is now preserved during serialization so it survives the server round-trip.
* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai)**: Undoing AI changes after starting a new chat no longer throws an error.
* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai)**: Improved AI Chat History UI by moving the "New Chat" button from the empty tab view to the tab header.
* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai)**: Allowed resizing (maximizing) AI Translate and AI Review tabs via dedicated "Maximize" button.
* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai)**: AI Chat commands (Explain, Summarize, Highlight key points) no longer prevent the AI from performing document edits in follow-up messages.
* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai)**: Improved AI Quick Actions accessibility by disabling dropdown and menu bar in AI Review. Closes [ckeditor/ckeditor5#8932](https://github.com/ckeditor/ckeditor5/issues/8932).
* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai)**: Fixed AI Chat feed items not sticking to the bottom of the feed when the AI Chat shortcuts feature was not loaded.
* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai)**: Fixed issues with editing chat names in AI Chat History, including stale input state after canceling and incorrect local updates when saving failed.
* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai)**: Fixed a crash when the AI proposes unwrapping content (e.g., removing blockquotes while keeping their inner content).
* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai)**: Removed misleading hover states from non-interactive tiles in AI Chat. Now, only actionable tiles show hover feedback, improving clarity.
* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai)**: Tailored UI styling of suggestions inside AI Chat. The suggestion box received a distinctive border and shadow was removed from the suggestion box header.
* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai)**: The AI Review and AI Translation results are always shown from the beginning on subsequent runs. Before, scroll position was kept, leading to confusing UX.
* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai)**: AI Chat in some scenarios ignored parts of the content proposed by AI model leading to confusing responses (e.g. proposed paragraph removal instead of wrapping it into a block quote).
* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai)**: AI components will be correctly styled and will fall back to default styles when `container.type: 'custom'` configuration option is used.
* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai)**: Wide content (e.g. tables) inside AI suggestions will no longer overflow boundaries of its container which is now horizontally scrollable.
* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai)**: Fixed a stray ellipsis (`…`) artifact that remained painted next to the rename input when editing a long chat name in the AI Chat history.
* **[comments](https://www.npmjs.com/package/@ckeditor/ckeditor5-comments)**: Fixed annotation ordering when creating a comment while the target text is scrolled out of view. Previously, the sidebar could break and other annotations could flicker due to stale position data used for ordering.
* **[comments](https://www.npmjs.com/package/@ckeditor/ckeditor5-comments)**: Fixed a regression where the editor lost focus after resolving a comment thread from the narrow sidebar.
* **[comments](https://www.npmjs.com/package/@ckeditor/ckeditor5-comments)**: Pressing Tab to confirm a mention suggestion in a comment editor no longer shifts focus to the Submit/Reply button.
* **[editor-classic](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-classic)**: The classic editor no longer throws an unclear error when initialized with a source element that is not attached to the DOM. A dedicated `editor-source-element-not-attached` error is thrown instead. Closes [#20017](https://github.com/ckeditor/ckeditor5/issues/20017).
* **[email](https://www.npmjs.com/package/@ckeditor/ckeditor5-email)**: Preserve alignment of nested tables when exporting with inline styles.
* **[email](https://www.npmjs.com/package/@ckeditor/ckeditor5-email)**: Fixed table alignment handling for tables with and without text wrapping. This applies when the `table.tableLayout.stripFigureFromContentTable` option is set to `false` and the `PlainTableOutput` plugin is not included. Tables will now be correctly aligned, and their dimensions and styling will no longer be broken.
* **[email](https://www.npmjs.com/package/@ckeditor/ckeditor5-email)**: Fixed `figcaption` width and overflow issues in exported table figures. When exporting a table wrapped in a `figure`, its `figcaption` no longer receives an incorrect width and will correctly stay within the bounds of the exported element without overflowing. Furthermore, captions with `caption-side: top` are now properly positioned immediately before the table.
* **[emoji](https://www.npmjs.com/package/@ckeditor/ckeditor5-emoji)**: The emoji panel now renders correctly on narrow screens. Closes [#18552](https://github.com/ckeditor/ckeditor5/issues/18552).
* **[engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine)**: Fixed the editing downcast order of adjacent marker UI boundaries so marker ends and starts are rendered consistently with the model and data output. Closes [#19975](https://github.com/ckeditor/ckeditor5/issues/19975).

  The editing pipeline now produces a deterministic marker order and preserves the expected boundary order when adjacent markers are added together or when the second adjacent marker is added later.
* **[engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine)**: Should preserve formatting (for example, bold or italic) after deleting content that empties a block so that typing continues with the same formatting. Closes [#10517](https://github.com/ckeditor/ckeditor5/issues/10517), [#19777](https://github.com/ckeditor/ckeditor5/issues/19777).
* **[fullscreen](https://www.npmjs.com/package/@ckeditor/ckeditor5-fullscreen)**: Fixed errors that could appear when maximizing the AI panel after leaving fullscreen mode. Closes [#20129](https://github.com/ckeditor/ckeditor5/issues/20129).
* **[horizontal-line](https://www.npmjs.com/package/@ckeditor/ckeditor5-horizontal-line)**: Horizontal lines (`<hr>`) placed next to each other no longer collapse their margins in the rendered output.
* **[html-support](https://www.npmjs.com/package/@ckeditor/ckeditor5-html-support)**: The definition list (`dl`) no longer breaks the structure of the list when it is placed within a list item. Closes [#20067](https://github.com/ckeditor/ckeditor5/issues/20067).
* **[list-multi-level](https://www.npmjs.com/package/@ckeditor/ckeditor5-list-multi-level)**: Fixed a stale multi-level list marker appearing on a block widget (e.g., a table) after a paragraph was inserted before it as the first block of the same list item.
* **[paste-from-office](https://www.npmjs.com/package/@ckeditor/ckeditor5-paste-from-office)**: Fixed incorrect structure of nested lists pasted from Word when plain paragraphs appear between nested list items. Closes [ckeditor/ckeditor5#19127](https://github.com/ckeditor/ckeditor5/issues/19127).

  Previously, all paragraphs were placed after the nested list items instead of between them. The fix also ensures that interrupted nested ordered lists continue numbering correctly across the paragraph breaks.
* **[paste-from-office](https://www.npmjs.com/package/@ckeditor/ckeditor5-paste-from-office)**: Pasting content from Word no longer inserts unwanted visible bookmarks into the editor. Closes [#18846](https://github.com/ckeditor/ckeditor5/issues/18846).
* **[paste-from-office-enhanced](https://www.npmjs.com/package/@ckeditor/ckeditor5-paste-from-office-enhanced)**: When pasting from Excel, cells with patterned backgrounds now keep their colors.
* **[paste-from-office-enhanced](https://www.npmjs.com/package/@ckeditor/ckeditor5-paste-from-office-enhanced)**: When pasting bulleted lists from Word, the correct bullet style (disc, circle, square) is now preserved instead of defaulting to disc.
* **[real-time-collaboration](https://www.npmjs.com/package/@ckeditor/ckeditor5-real-time-collaboration)**: Fixed an error thrown when `editor.destroy()` was called right after `saveRevision()` in a real-time collaboration session.
* **[revision-history](https://www.npmjs.com/package/@ckeditor/ckeditor5-revision-history)**: Fixed revision history sidebar not grouping revisions from the same time period (e.g. the same year).
* **[slash-command](https://www.npmjs.com/package/@ckeditor/ckeditor5-slash-command)**: Slash commands no longer trigger inside code blocks, because code blocks are designed to contain plain, unformatted code where autocompletion is not applicable. Closes [ckeditor/ckeditor5#19146](https://github.com/ckeditor/ckeditor5/issues/19146).
* **[slash-command](https://www.npmjs.com/package/@ckeditor/ckeditor5-slash-command)**: Fixed translation of list item titles ("Bulleted List", "Numbered List", "To-do List") in the slash command panel by aligning translation keys with those defined in the list package.
* **[source-editing](https://www.npmjs.com/package/@ckeditor/ckeditor5-source-editing)**: Native undo/redo keystrokes now work correctly in the source editing textarea. Closes [#13700](https://github.com/ckeditor/ckeditor5/issues/13700).
* **[table](https://www.npmjs.com/package/@ckeditor/ckeditor5-table)**: Improved how table cell alignment is loaded into the editor. Previously, applying alignment to a cell could incorrectly force text alignment on all nested elements inside it. Now, alignment is smartly applied to the direct contents of the cell. Whether an element uses block alignment or text alignment, it will be positioned appropriately without breaking the layout of deeper nested content. Closes [#19883](https://github.com/ckeditor/ckeditor5/issues/19883).
* **[ui](https://www.npmjs.com/package/@ckeditor/ckeditor5-ui)**: The menu bar no longer stays open after clicking the "Fullscreen mode" menu item when entering fullscreen mode. Closes [#20056](https://github.com/ckeditor/ckeditor5/issues/20056).
* **[uploadcare](https://www.npmjs.com/package/@ckeditor/ckeditor5-uploadcare)**: Fixed a build error affecting some TypeScript projects using Uploadcare integration. Closes [ckeditor/ckeditor5#19692](https://github.com/ckeditor/ckeditor5/issues/19692).
* **[uploadcare](https://www.npmjs.com/package/@ckeditor/ckeditor5-uploadcare)**: Uploadcare-uploaded images no longer render blurry when their natural width falls between the responsive `<source srcset>` breakpoints. The generated srcset now always includes a variant at the original (or cropped) image width as its largest entry, so the browser can serve a 1:1 pixel match instead of upscaling a smaller variant.

### Other changes

* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai)**: Updated the message displayed in AI Chat when you click the "Stop generating" button after sending a prompt.
* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai)**: Improved content streaming performance and visual quality in AI Chat and AI Quick Actions.

  * In AI Chat, the individual suggestions are now only displayed when ready with skeleton loader appearing when the waiting for the next suggestion.
  * Added smooth scrolling to the AI Chat and AI Quick Actions UI for enhanced user experience.
  * Improvements to the word-by-word streaming speed in AI Chat and AI Quick Actions.
* **[core](https://www.npmjs.com/package/@ckeditor/ckeditor5-core)**: Added the `RootConfig#description` configuration property. It can be used to differentiate the editors and/or editor roots when there are multiple editor instances on the website or multiroot editor is used. Closes [#20119](https://github.com/ckeditor/ckeditor5/issues/20119).
* **[engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine)**: Added the `ViewDocument#getRoots()` method, a convenience accessor returning all view roots as an array (analogous to `ModelDocument#getRoots()`). Closes [#20097](https://github.com/ckeditor/ckeditor5/issues/20097).
* **[list](https://www.npmjs.com/package/@ckeditor/ckeditor5-list)**: Prevent list attributes from being applied to text nodes and inline objects during content insertion, which could crash the editor when a permissive `Schema#addAttributeCheck()` is used. Closes [#19994](https://github.com/ckeditor/ckeditor5/issues/19994).
* **[track-changes](https://www.npmjs.com/package/@ckeditor/ckeditor5-track-changes)**: Introduced performance optimization in Track Changes feature for Lists integration. Before, the browser might freeze when many list suggestions were added to the document at once.

### Released packages

Check out the [Versioning policy](https://ckeditor.com/docs/ckeditor5/latest/framework/guides/support/versioning-policy.html) guide for more information.

<details>
<summary>Released packages (summary)</summary>

Minor releases (contain minor breaking changes):

* [@ckeditor/ckeditor5-ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai/v/48.1.0): v48.0.1 => v48.1.0

Releases containing new features:

* [@ckeditor/ckeditor5-core](https://www.npmjs.com/package/@ckeditor/ckeditor5-core/v/48.1.0): v48.0.1 => v48.1.0
* [@ckeditor/ckeditor5-editor-balloon](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-balloon/v/48.1.0): v48.0.1 => v48.1.0
* [@ckeditor/ckeditor5-editor-classic](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-classic/v/48.1.0): v48.0.1 => v48.1.0
* [@ckeditor/ckeditor5-editor-decoupled](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-decoupled/v/48.1.0): v48.0.1 => v48.1.0
* [@ckeditor/ckeditor5-editor-inline](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-inline/v/48.1.0): v48.0.1 => v48.1.0
* [@ckeditor/ckeditor5-editor-multi-root](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-multi-root/v/48.1.0): v48.0.1 => v48.1.0
* [@ckeditor/ckeditor5-engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine/v/48.1.0): v48.0.1 => v48.1.0
* [@ckeditor/ckeditor5-document-outline](https://www.npmjs.com/package/@ckeditor/ckeditor5-document-outline/v/48.1.0): v48.0.1 => v48.1.0
* [@ckeditor/ckeditor5-email](https://www.npmjs.com/package/@ckeditor/ckeditor5-email/v/48.1.0): v48.0.1 => v48.1.0
* [@ckeditor/ckeditor5-export-inline-styles](https://www.npmjs.com/package/@ckeditor/ckeditor5-export-inline-styles/v/48.1.0): v48.0.1 => v48.1.0
* [@ckeditor/ckeditor5-format-painter](https://www.npmjs.com/package/@ckeditor/ckeditor5-format-painter/v/48.1.0): v48.0.1 => v48.1.0

Other releases:

* [@ckeditor/ckeditor5-adapter-ckfinder](https://www.npmjs.com/package/@ckeditor/ckeditor5-adapter-ckfinder/v/48.1.0): v48.0.1 => v48.1.0
* [@ckeditor/ckeditor5-alignment](https://www.npmjs.com/package/@ckeditor/ckeditor5-alignment/v/48.1.0): v48.0.1 => v48.1.0
* [@ckeditor/ckeditor5-autoformat](https://www.npmjs.com/package/@ckeditor/ckeditor5-autoformat/v/48.1.0): v48.0.1 => v48.1.0
* [@ckeditor/ckeditor5-autosave](https://www.npmjs.com/package/@ckeditor/ckeditor5-autosave/v/48.1.0): v48.0.1 => v48.1.0
* [@ckeditor/ckeditor5-basic-styles](https://www.npmjs.com/package/@ckeditor/ckeditor5-basic-styles/v/48.1.0): v48.0.1 => v48.1.0
* [@ckeditor/ckeditor5-block-quote](https://www.npmjs.com/package/@ckeditor/ckeditor5-block-quote/v/48.1.0): v48.0.1 => v48.1.0
* [@ckeditor/ckeditor5-bookmark](https://www.npmjs.com/package/@ckeditor/ckeditor5-bookmark/v/48.1.0): v48.0.1 => v48.1.0
* [@ckeditor/ckeditor5-case-change](https://www.npmjs.com/package/@ckeditor/ckeditor5-case-change/v/48.1.0): v48.0.1 => v48.1.0
* [@ckeditor/ckeditor5-ckbox](https://www.npmjs.com/package/@ckeditor/ckeditor5-ckbox/v/48.1.0): v48.0.1 => v48.1.0
* [@ckeditor/ckeditor5-ckfinder](https://www.npmjs.com/package/@ckeditor/ckeditor5-ckfinder/v/48.1.0): v48.0.1 => v48.1.0
* [@ckeditor/ckeditor5-clipboard](https://www.npmjs.com/package/@ckeditor/ckeditor5-clipboard/v/48.1.0): v48.0.1 => v48.1.0
* [@ckeditor/ckeditor5-cloud-services](https://www.npmjs.com/package/@ckeditor/ckeditor5-cloud-services/v/48.1.0): v48.0.1 => v48.1.0
* [@ckeditor/ckeditor5-code-block](https://www.npmjs.com/package/@ckeditor/ckeditor5-code-block/v/48.1.0): v48.0.1 => v48.1.0
* [@ckeditor/ckeditor5-collaboration-core](https://www.npmjs.com/package/@ckeditor/ckeditor5-collaboration-core/v/48.1.0): v48.0.1 => v48.1.0
* [@ckeditor/ckeditor5-comments](https://www.npmjs.com/package/@ckeditor/ckeditor5-comments/v/48.1.0): v48.0.1 => v48.1.0
* [@ckeditor/ckeditor5-easy-image](https://www.npmjs.com/package/@ckeditor/ckeditor5-easy-image/v/48.1.0): v48.0.1 => v48.1.0
* [@ckeditor/ckeditor5-emoji](https://www.npmjs.com/package/@ckeditor/ckeditor5-emoji/v/48.1.0): v48.0.1 => v48.1.0
* [@ckeditor/ckeditor5-enter](https://www.npmjs.com/package/@ckeditor/ckeditor5-enter/v/48.1.0): v48.0.1 => v48.1.0
* [@ckeditor/ckeditor5-essentials](https://www.npmjs.com/package/@ckeditor/ckeditor5-essentials/v/48.1.0): v48.0.1 => v48.1.0
* [@ckeditor/ckeditor5-export-pdf](https://www.npmjs.com/package/@ckeditor/ckeditor5-export-pdf/v/48.1.0): v48.0.1 => v48.1.0
* [@ckeditor/ckeditor5-export-word](https://www.npmjs.com/package/@ckeditor/ckeditor5-export-word/v/48.1.0): v48.0.1 => v48.1.0
* [@ckeditor/ckeditor5-find-and-replace](https://www.npmjs.com/package/@ckeditor/ckeditor5-find-and-replace/v/48.1.0): v48.0.1 => v48.1.0
* [@ckeditor/ckeditor5-font](https://www.npmjs.com/package/@ckeditor/ckeditor5-font/v/48.1.0): v48.0.1 => v48.1.0
* [@ckeditor/ckeditor5-footnotes](https://www.npmjs.com/package/@ckeditor/ckeditor5-footnotes/v/48.1.0): v48.0.1 => v48.1.0
* [@ckeditor/ckeditor5-fullscreen](https://www.npmjs.com/package/@ckeditor/ckeditor5-fullscreen/v/48.1.0): v48.0.1 => v48.1.0
* [@ckeditor/ckeditor5-heading](https://www.npmjs.com/package/@ckeditor/ckeditor5-heading/v/48.1.0): v48.0.1 => v48.1.0
* [@ckeditor/ckeditor5-highlight](https://www.npmjs.com/package/@ckeditor/ckeditor5-highlight/v/48.1.0): v48.0.1 => v48.1.0
* [@ckeditor/ckeditor5-horizontal-line](https://www.npmjs.com/package/@ckeditor/ckeditor5-horizontal-line/v/48.1.0): v48.0.1 => v48.1.0
* [@ckeditor/ckeditor5-html-embed](https://www.npmjs.com/package/@ckeditor/ckeditor5-html-embed/v/48.1.0): v48.0.1 => v48.1.0
* [@ckeditor/ckeditor5-html-support](https://www.npmjs.com/package/@ckeditor/ckeditor5-html-support/v/48.1.0): v48.0.1 => v48.1.0
* [@ckeditor/ckeditor5-icons](https://www.npmjs.com/package/@ckeditor/ckeditor5-icons/v/48.1.0): v48.0.1 => v48.1.0
* [@ckeditor/ckeditor5-image](https://www.npmjs.com/package/@ckeditor/ckeditor5-image/v/48.1.0): v48.0.1 => v48.1.0
* [@ckeditor/ckeditor5-import-word](https://www.npmjs.com/package/@ckeditor/ckeditor5-import-word/v/48.1.0): v48.0.1 => v48.1.0
* [@ckeditor/ckeditor5-indent](https://www.npmjs.com/package/@ckeditor/ckeditor5-indent/v/48.1.0): v48.0.1 => v48.1.0
* [@ckeditor/ckeditor5-language](https://www.npmjs.com/package/@ckeditor/ckeditor5-language/v/48.1.0): v48.0.1 => v48.1.0
* [@ckeditor/ckeditor5-line-height](https://www.npmjs.com/package/@ckeditor/ckeditor5-line-height/v/48.1.0): v48.0.1 => v48.1.0
* [@ckeditor/ckeditor5-link](https://www.npmjs.com/package/@ckeditor/ckeditor5-link/v/48.1.0): v48.0.1 => v48.1.0
* [@ckeditor/ckeditor5-list](https://www.npmjs.com/package/@ckeditor/ckeditor5-list/v/48.1.0): v48.0.1 => v48.1.0
* [@ckeditor/ckeditor5-list-multi-level](https://www.npmjs.com/package/@ckeditor/ckeditor5-list-multi-level/v/48.1.0): v48.0.1 => v48.1.0
* [@ckeditor/ckeditor5-markdown-gfm](https://www.npmjs.com/package/@ckeditor/ckeditor5-markdown-gfm/v/48.1.0): v48.0.1 => v48.1.0
* [@ckeditor/ckeditor5-media-embed](https://www.npmjs.com/package/@ckeditor/ckeditor5-media-embed/v/48.1.0): v48.0.1 => v48.1.0
* [@ckeditor/ckeditor5-mention](https://www.npmjs.com/package/@ckeditor/ckeditor5-mention/v/48.1.0): v48.0.1 => v48.1.0
* [@ckeditor/ckeditor5-merge-fields](https://www.npmjs.com/package/@ckeditor/ckeditor5-merge-fields/v/48.1.0): v48.0.1 => v48.1.0
* [@ckeditor/ckeditor5-minimap](https://www.npmjs.com/package/@ckeditor/ckeditor5-minimap/v/48.1.0): v48.0.1 => v48.1.0
* [@ckeditor/ckeditor5-operations-compressor](https://www.npmjs.com/package/@ckeditor/ckeditor5-operations-compressor/v/48.1.0): v48.0.1 => v48.1.0
* [@ckeditor/ckeditor5-page-break](https://www.npmjs.com/package/@ckeditor/ckeditor5-page-break/v/48.1.0): v48.0.1 => v48.1.0
* [@ckeditor/ckeditor5-pagination](https://www.npmjs.com/package/@ckeditor/ckeditor5-pagination/v/48.1.0): v48.0.1 => v48.1.0
* [@ckeditor/ckeditor5-paragraph](https://www.npmjs.com/package/@ckeditor/ckeditor5-paragraph/v/48.1.0): v48.0.1 => v48.1.0
* [@ckeditor/ckeditor5-paste-from-office](https://www.npmjs.com/package/@ckeditor/ckeditor5-paste-from-office/v/48.1.0): v48.0.1 => v48.1.0
* [@ckeditor/ckeditor5-paste-from-office-enhanced](https://www.npmjs.com/package/@ckeditor/ckeditor5-paste-from-office-enhanced/v/48.1.0): v48.0.1 => v48.1.0
* [@ckeditor/ckeditor5-real-time-collaboration](https://www.npmjs.com/package/@ckeditor/ckeditor5-real-time-collaboration/v/48.1.0): v48.0.1 => v48.1.0
* [@ckeditor/ckeditor5-remove-format](https://www.npmjs.com/package/@ckeditor/ckeditor5-remove-format/v/48.1.0): v48.0.1 => v48.1.0
* [@ckeditor/ckeditor5-restricted-editing](https://www.npmjs.com/package/@ckeditor/ckeditor5-restricted-editing/v/48.1.0): v48.0.1 => v48.1.0
* [@ckeditor/ckeditor5-revision-history](https://www.npmjs.com/package/@ckeditor/ckeditor5-revision-history/v/48.1.0): v48.0.1 => v48.1.0
* [@ckeditor/ckeditor5-select-all](https://www.npmjs.com/package/@ckeditor/ckeditor5-select-all/v/48.1.0): v48.0.1 => v48.1.0
* [@ckeditor/ckeditor5-show-blocks](https://www.npmjs.com/package/@ckeditor/ckeditor5-show-blocks/v/48.1.0): v48.0.1 => v48.1.0
* [@ckeditor/ckeditor5-slash-command](https://www.npmjs.com/package/@ckeditor/ckeditor5-slash-command/v/48.1.0): v48.0.1 => v48.1.0
* [@ckeditor/ckeditor5-source-editing](https://www.npmjs.com/package/@ckeditor/ckeditor5-source-editing/v/48.1.0): v48.0.1 => v48.1.0
* [@ckeditor/ckeditor5-source-editing-enhanced](https://www.npmjs.com/package/@ckeditor/ckeditor5-source-editing-enhanced/v/48.1.0): v48.0.1 => v48.1.0
* [@ckeditor/ckeditor5-special-characters](https://www.npmjs.com/package/@ckeditor/ckeditor5-special-characters/v/48.1.0): v48.0.1 => v48.1.0
* [@ckeditor/ckeditor5-style](https://www.npmjs.com/package/@ckeditor/ckeditor5-style/v/48.1.0): v48.0.1 => v48.1.0
* [@ckeditor/ckeditor5-table](https://www.npmjs.com/package/@ckeditor/ckeditor5-table/v/48.1.0): v48.0.1 => v48.1.0
* [@ckeditor/ckeditor5-template](https://www.npmjs.com/package/@ckeditor/ckeditor5-template/v/48.1.0): v48.0.1 => v48.1.0
* [@ckeditor/ckeditor5-track-changes](https://www.npmjs.com/package/@ckeditor/ckeditor5-track-changes/v/48.1.0): v48.0.1 => v48.1.0
* [@ckeditor/ckeditor5-typing](https://www.npmjs.com/package/@ckeditor/ckeditor5-typing/v/48.1.0): v48.0.1 => v48.1.0
* [@ckeditor/ckeditor5-ui](https://www.npmjs.com/package/@ckeditor/ckeditor5-ui/v/48.1.0): v48.0.1 => v48.1.0
* [@ckeditor/ckeditor5-undo](https://www.npmjs.com/package/@ckeditor/ckeditor5-undo/v/48.1.0): v48.0.1 => v48.1.0
* [@ckeditor/ckeditor5-upload](https://www.npmjs.com/package/@ckeditor/ckeditor5-upload/v/48.1.0): v48.0.1 => v48.1.0
* [@ckeditor/ckeditor5-uploadcare](https://www.npmjs.com/package/@ckeditor/ckeditor5-uploadcare/v/48.1.0): v48.0.1 => v48.1.0
* [@ckeditor/ckeditor5-utils](https://www.npmjs.com/package/@ckeditor/ckeditor5-utils/v/48.1.0): v48.0.1 => v48.1.0
* [@ckeditor/ckeditor5-watchdog](https://www.npmjs.com/package/@ckeditor/ckeditor5-watchdog/v/48.1.0): v48.0.1 => v48.1.0
* [@ckeditor/ckeditor5-widget](https://www.npmjs.com/package/@ckeditor/ckeditor5-widget/v/48.1.0): v48.0.1 => v48.1.0
* [@ckeditor/ckeditor5-word-count](https://www.npmjs.com/package/@ckeditor/ckeditor5-word-count/v/48.1.0): v48.0.1 => v48.1.0
* [ckeditor5](https://www.npmjs.com/package/ckeditor5/v/48.1.0): v48.0.1 => v48.1.0
* [ckeditor5-premium-features](https://www.npmjs.com/package/ckeditor5-premium-features/v/48.1.0): v48.0.1 => v48.1.0
</details>


## [48.0.1](https://github.com/ckeditor/ckeditor5/compare/v48.0.0...v48.0.1) (April 22, 2026)

We are happy to announce the release of CKEditor 5 v48.0.1.

### Release highlights

The release addresses a vulnerability identified in the [`protobuf.js`](https://www.npmjs.com/package/protobufjs) package ([`CVE-2026-41242`](https://github.com/protobufjs/protobuf.js/security/advisories/GHSA-xq3m-2v4x-88gg)), used within our [**`@ckeditor/ckeditor5-operations-compressor`**](https://www.npmjs.com/package/@ckeditor/ckeditor5-operations-compressor) package for real-time collaboration.

Our analysis confirms that **this vulnerability does not affect CKEditor 5**, as all protobuf definitions are static and pre-compiled at build time, and are never parsed or compiled from untrusted input at runtime - which is the condition required to exploit this issue.

This release primarily aims to ensure that our customers using real-time collaboration features do not encounter unnecessary security alerts from their scanning tools. We are committed to maintaining the highest security standards, and this update reflects our ongoing efforts to safeguard user environments proactively.

### Released packages

Check out the [Versioning policy](https://ckeditor.com/docs/ckeditor5/latest/framework/guides/support/versioning-policy.html) guide for more information.

<details>
<summary>Released packages (summary)</summary>

Other releases:

* [@ckeditor/ckeditor5-adapter-ckfinder](https://www.npmjs.com/package/@ckeditor/ckeditor5-adapter-ckfinder/v/48.0.1): v48.0.0 => v48.0.1
* [@ckeditor/ckeditor5-ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai/v/48.0.1): v48.0.0 => v48.0.1
* [@ckeditor/ckeditor5-alignment](https://www.npmjs.com/package/@ckeditor/ckeditor5-alignment/v/48.0.1): v48.0.0 => v48.0.1
* [@ckeditor/ckeditor5-autoformat](https://www.npmjs.com/package/@ckeditor/ckeditor5-autoformat/v/48.0.1): v48.0.0 => v48.0.1
* [@ckeditor/ckeditor5-autosave](https://www.npmjs.com/package/@ckeditor/ckeditor5-autosave/v/48.0.1): v48.0.0 => v48.0.1
* [@ckeditor/ckeditor5-basic-styles](https://www.npmjs.com/package/@ckeditor/ckeditor5-basic-styles/v/48.0.1): v48.0.0 => v48.0.1
* [@ckeditor/ckeditor5-block-quote](https://www.npmjs.com/package/@ckeditor/ckeditor5-block-quote/v/48.0.1): v48.0.0 => v48.0.1
* [@ckeditor/ckeditor5-bookmark](https://www.npmjs.com/package/@ckeditor/ckeditor5-bookmark/v/48.0.1): v48.0.0 => v48.0.1
* [@ckeditor/ckeditor5-case-change](https://www.npmjs.com/package/@ckeditor/ckeditor5-case-change/v/48.0.1): v48.0.0 => v48.0.1
* [@ckeditor/ckeditor5-ckbox](https://www.npmjs.com/package/@ckeditor/ckeditor5-ckbox/v/48.0.1): v48.0.0 => v48.0.1
* [@ckeditor/ckeditor5-ckfinder](https://www.npmjs.com/package/@ckeditor/ckeditor5-ckfinder/v/48.0.1): v48.0.0 => v48.0.1
* [@ckeditor/ckeditor5-clipboard](https://www.npmjs.com/package/@ckeditor/ckeditor5-clipboard/v/48.0.1): v48.0.0 => v48.0.1
* [@ckeditor/ckeditor5-cloud-services](https://www.npmjs.com/package/@ckeditor/ckeditor5-cloud-services/v/48.0.1): v48.0.0 => v48.0.1
* [@ckeditor/ckeditor5-code-block](https://www.npmjs.com/package/@ckeditor/ckeditor5-code-block/v/48.0.1): v48.0.0 => v48.0.1
* [@ckeditor/ckeditor5-collaboration-core](https://www.npmjs.com/package/@ckeditor/ckeditor5-collaboration-core/v/48.0.1): v48.0.0 => v48.0.1
* [@ckeditor/ckeditor5-comments](https://www.npmjs.com/package/@ckeditor/ckeditor5-comments/v/48.0.1): v48.0.0 => v48.0.1
* [@ckeditor/ckeditor5-core](https://www.npmjs.com/package/@ckeditor/ckeditor5-core/v/48.0.1): v48.0.0 => v48.0.1
* [@ckeditor/ckeditor5-document-outline](https://www.npmjs.com/package/@ckeditor/ckeditor5-document-outline/v/48.0.1): v48.0.0 => v48.0.1
* [@ckeditor/ckeditor5-easy-image](https://www.npmjs.com/package/@ckeditor/ckeditor5-easy-image/v/48.0.1): v48.0.0 => v48.0.1
* [@ckeditor/ckeditor5-editor-balloon](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-balloon/v/48.0.1): v48.0.0 => v48.0.1
* [@ckeditor/ckeditor5-editor-classic](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-classic/v/48.0.1): v48.0.0 => v48.0.1
* [@ckeditor/ckeditor5-editor-decoupled](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-decoupled/v/48.0.1): v48.0.0 => v48.0.1
* [@ckeditor/ckeditor5-editor-inline](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-inline/v/48.0.1): v48.0.0 => v48.0.1
* [@ckeditor/ckeditor5-editor-multi-root](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-multi-root/v/48.0.1): v48.0.0 => v48.0.1
* [@ckeditor/ckeditor5-email](https://www.npmjs.com/package/@ckeditor/ckeditor5-email/v/48.0.1): v48.0.0 => v48.0.1
* [@ckeditor/ckeditor5-emoji](https://www.npmjs.com/package/@ckeditor/ckeditor5-emoji/v/48.0.1): v48.0.0 => v48.0.1
* [@ckeditor/ckeditor5-engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine/v/48.0.1): v48.0.0 => v48.0.1
* [@ckeditor/ckeditor5-enter](https://www.npmjs.com/package/@ckeditor/ckeditor5-enter/v/48.0.1): v48.0.0 => v48.0.1
* [@ckeditor/ckeditor5-essentials](https://www.npmjs.com/package/@ckeditor/ckeditor5-essentials/v/48.0.1): v48.0.0 => v48.0.1
* [@ckeditor/ckeditor5-export-inline-styles](https://www.npmjs.com/package/@ckeditor/ckeditor5-export-inline-styles/v/48.0.1): v48.0.0 => v48.0.1
* [@ckeditor/ckeditor5-export-pdf](https://www.npmjs.com/package/@ckeditor/ckeditor5-export-pdf/v/48.0.1): v48.0.0 => v48.0.1
* [@ckeditor/ckeditor5-export-word](https://www.npmjs.com/package/@ckeditor/ckeditor5-export-word/v/48.0.1): v48.0.0 => v48.0.1
* [@ckeditor/ckeditor5-find-and-replace](https://www.npmjs.com/package/@ckeditor/ckeditor5-find-and-replace/v/48.0.1): v48.0.0 => v48.0.1
* [@ckeditor/ckeditor5-font](https://www.npmjs.com/package/@ckeditor/ckeditor5-font/v/48.0.1): v48.0.0 => v48.0.1
* [@ckeditor/ckeditor5-footnotes](https://www.npmjs.com/package/@ckeditor/ckeditor5-footnotes/v/48.0.1): v48.0.0 => v48.0.1
* [@ckeditor/ckeditor5-format-painter](https://www.npmjs.com/package/@ckeditor/ckeditor5-format-painter/v/48.0.1): v48.0.0 => v48.0.1
* [@ckeditor/ckeditor5-fullscreen](https://www.npmjs.com/package/@ckeditor/ckeditor5-fullscreen/v/48.0.1): v48.0.0 => v48.0.1
* [@ckeditor/ckeditor5-heading](https://www.npmjs.com/package/@ckeditor/ckeditor5-heading/v/48.0.1): v48.0.0 => v48.0.1
* [@ckeditor/ckeditor5-highlight](https://www.npmjs.com/package/@ckeditor/ckeditor5-highlight/v/48.0.1): v48.0.0 => v48.0.1
* [@ckeditor/ckeditor5-horizontal-line](https://www.npmjs.com/package/@ckeditor/ckeditor5-horizontal-line/v/48.0.1): v48.0.0 => v48.0.1
* [@ckeditor/ckeditor5-html-embed](https://www.npmjs.com/package/@ckeditor/ckeditor5-html-embed/v/48.0.1): v48.0.0 => v48.0.1
* [@ckeditor/ckeditor5-html-support](https://www.npmjs.com/package/@ckeditor/ckeditor5-html-support/v/48.0.1): v48.0.0 => v48.0.1
* [@ckeditor/ckeditor5-icons](https://www.npmjs.com/package/@ckeditor/ckeditor5-icons/v/48.0.1): v48.0.0 => v48.0.1
* [@ckeditor/ckeditor5-image](https://www.npmjs.com/package/@ckeditor/ckeditor5-image/v/48.0.1): v48.0.0 => v48.0.1
* [@ckeditor/ckeditor5-import-word](https://www.npmjs.com/package/@ckeditor/ckeditor5-import-word/v/48.0.1): v48.0.0 => v48.0.1
* [@ckeditor/ckeditor5-indent](https://www.npmjs.com/package/@ckeditor/ckeditor5-indent/v/48.0.1): v48.0.0 => v48.0.1
* [@ckeditor/ckeditor5-language](https://www.npmjs.com/package/@ckeditor/ckeditor5-language/v/48.0.1): v48.0.0 => v48.0.1
* [@ckeditor/ckeditor5-line-height](https://www.npmjs.com/package/@ckeditor/ckeditor5-line-height/v/48.0.1): v48.0.0 => v48.0.1
* [@ckeditor/ckeditor5-link](https://www.npmjs.com/package/@ckeditor/ckeditor5-link/v/48.0.1): v48.0.0 => v48.0.1
* [@ckeditor/ckeditor5-list](https://www.npmjs.com/package/@ckeditor/ckeditor5-list/v/48.0.1): v48.0.0 => v48.0.1
* [@ckeditor/ckeditor5-list-multi-level](https://www.npmjs.com/package/@ckeditor/ckeditor5-list-multi-level/v/48.0.1): v48.0.0 => v48.0.1
* [@ckeditor/ckeditor5-markdown-gfm](https://www.npmjs.com/package/@ckeditor/ckeditor5-markdown-gfm/v/48.0.1): v48.0.0 => v48.0.1
* [@ckeditor/ckeditor5-media-embed](https://www.npmjs.com/package/@ckeditor/ckeditor5-media-embed/v/48.0.1): v48.0.0 => v48.0.1
* [@ckeditor/ckeditor5-mention](https://www.npmjs.com/package/@ckeditor/ckeditor5-mention/v/48.0.1): v48.0.0 => v48.0.1
* [@ckeditor/ckeditor5-merge-fields](https://www.npmjs.com/package/@ckeditor/ckeditor5-merge-fields/v/48.0.1): v48.0.0 => v48.0.1
* [@ckeditor/ckeditor5-minimap](https://www.npmjs.com/package/@ckeditor/ckeditor5-minimap/v/48.0.1): v48.0.0 => v48.0.1
* [@ckeditor/ckeditor5-operations-compressor](https://www.npmjs.com/package/@ckeditor/ckeditor5-operations-compressor/v/48.0.1): v48.0.0 => v48.0.1
* [@ckeditor/ckeditor5-page-break](https://www.npmjs.com/package/@ckeditor/ckeditor5-page-break/v/48.0.1): v48.0.0 => v48.0.1
* [@ckeditor/ckeditor5-pagination](https://www.npmjs.com/package/@ckeditor/ckeditor5-pagination/v/48.0.1): v48.0.0 => v48.0.1
* [@ckeditor/ckeditor5-paragraph](https://www.npmjs.com/package/@ckeditor/ckeditor5-paragraph/v/48.0.1): v48.0.0 => v48.0.1
* [@ckeditor/ckeditor5-paste-from-office](https://www.npmjs.com/package/@ckeditor/ckeditor5-paste-from-office/v/48.0.1): v48.0.0 => v48.0.1
* [@ckeditor/ckeditor5-paste-from-office-enhanced](https://www.npmjs.com/package/@ckeditor/ckeditor5-paste-from-office-enhanced/v/48.0.1): v48.0.0 => v48.0.1
* [@ckeditor/ckeditor5-real-time-collaboration](https://www.npmjs.com/package/@ckeditor/ckeditor5-real-time-collaboration/v/48.0.1): v48.0.0 => v48.0.1
* [@ckeditor/ckeditor5-remove-format](https://www.npmjs.com/package/@ckeditor/ckeditor5-remove-format/v/48.0.1): v48.0.0 => v48.0.1
* [@ckeditor/ckeditor5-restricted-editing](https://www.npmjs.com/package/@ckeditor/ckeditor5-restricted-editing/v/48.0.1): v48.0.0 => v48.0.1
* [@ckeditor/ckeditor5-revision-history](https://www.npmjs.com/package/@ckeditor/ckeditor5-revision-history/v/48.0.1): v48.0.0 => v48.0.1
* [@ckeditor/ckeditor5-select-all](https://www.npmjs.com/package/@ckeditor/ckeditor5-select-all/v/48.0.1): v48.0.0 => v48.0.1
* [@ckeditor/ckeditor5-show-blocks](https://www.npmjs.com/package/@ckeditor/ckeditor5-show-blocks/v/48.0.1): v48.0.0 => v48.0.1
* [@ckeditor/ckeditor5-slash-command](https://www.npmjs.com/package/@ckeditor/ckeditor5-slash-command/v/48.0.1): v48.0.0 => v48.0.1
* [@ckeditor/ckeditor5-source-editing](https://www.npmjs.com/package/@ckeditor/ckeditor5-source-editing/v/48.0.1): v48.0.0 => v48.0.1
* [@ckeditor/ckeditor5-source-editing-enhanced](https://www.npmjs.com/package/@ckeditor/ckeditor5-source-editing-enhanced/v/48.0.1): v48.0.0 => v48.0.1
* [@ckeditor/ckeditor5-special-characters](https://www.npmjs.com/package/@ckeditor/ckeditor5-special-characters/v/48.0.1): v48.0.0 => v48.0.1
* [@ckeditor/ckeditor5-style](https://www.npmjs.com/package/@ckeditor/ckeditor5-style/v/48.0.1): v48.0.0 => v48.0.1
* [@ckeditor/ckeditor5-table](https://www.npmjs.com/package/@ckeditor/ckeditor5-table/v/48.0.1): v48.0.0 => v48.0.1
* [@ckeditor/ckeditor5-template](https://www.npmjs.com/package/@ckeditor/ckeditor5-template/v/48.0.1): v48.0.0 => v48.0.1
* [@ckeditor/ckeditor5-track-changes](https://www.npmjs.com/package/@ckeditor/ckeditor5-track-changes/v/48.0.1): v48.0.0 => v48.0.1
* [@ckeditor/ckeditor5-typing](https://www.npmjs.com/package/@ckeditor/ckeditor5-typing/v/48.0.1): v48.0.0 => v48.0.1
* [@ckeditor/ckeditor5-ui](https://www.npmjs.com/package/@ckeditor/ckeditor5-ui/v/48.0.1): v48.0.0 => v48.0.1
* [@ckeditor/ckeditor5-undo](https://www.npmjs.com/package/@ckeditor/ckeditor5-undo/v/48.0.1): v48.0.0 => v48.0.1
* [@ckeditor/ckeditor5-upload](https://www.npmjs.com/package/@ckeditor/ckeditor5-upload/v/48.0.1): v48.0.0 => v48.0.1
* [@ckeditor/ckeditor5-uploadcare](https://www.npmjs.com/package/@ckeditor/ckeditor5-uploadcare/v/48.0.1): v48.0.0 => v48.0.1
* [@ckeditor/ckeditor5-utils](https://www.npmjs.com/package/@ckeditor/ckeditor5-utils/v/48.0.1): v48.0.0 => v48.0.1
* [@ckeditor/ckeditor5-watchdog](https://www.npmjs.com/package/@ckeditor/ckeditor5-watchdog/v/48.0.1): v48.0.0 => v48.0.1
* [@ckeditor/ckeditor5-widget](https://www.npmjs.com/package/@ckeditor/ckeditor5-widget/v/48.0.1): v48.0.0 => v48.0.1
* [@ckeditor/ckeditor5-word-count](https://www.npmjs.com/package/@ckeditor/ckeditor5-word-count/v/48.0.1): v48.0.0 => v48.0.1
* [ckeditor5](https://www.npmjs.com/package/ckeditor5/v/48.0.1): v48.0.0 => v48.0.1
* [ckeditor5-premium-features](https://www.npmjs.com/package/ckeditor5-premium-features/v/48.0.1): v48.0.0 => v48.0.1
</details>


## [48.0.0](https://github.com/ckeditor/ckeditor5/compare/v47.6.1...v48.0.0) (March 31, 2026)

We are happy to announce the release of CKEditor 5 v48.0.0.

> [!NOTE]
> CKEditor 5 v47 remains the LTS release. If you are an LTS customer, stay on this version. The next releases in the v47.x line will be published for LTS customers only.

### Release highlights

This major release improves CKEditor AI and tables, completes the sunset of old installation methods, changes the default `Export to PDF` converter API version, and introduces a unified structure for root-related configuration.

#### Old installation methods sunset

With this release, we have officially completed the transition to our modern installation methods — a milestone we are excited to reach! 🎉

First [introduced in CKEditor 5 v42.0.0 in June 2024](https://ckeditor.com/blog/ckeditor-42-0-0-release-highlights/), these new methods were designed to simplify the developer workflow, reduce configuration overhead, and unlock faster, more consistent updates. With the old methods now fully retired, we can focus all our energy on delivering new features, improving performance, and moving the platform forward.

If your project still relies on old installation methods, migrate to the [new installation methods](https://ckeditor.com/docs/ckeditor5/latest/updating/nim-migration/migration-to-new-installation-methods.html) to continue updating to this and later versions of CKEditor 5.

If migrating in the near term is not feasible, you can extend support for legacy installation methods with [CKEditor 5 Long Term Support (LTS)](https://ckeditor.com/ckeditor-5-lts/).

#### ⭐ CKEditor AI improvements

The styling of suggestion previews in [AI Chat](https://ckeditor.com/docs/ckeditor5/latest/features/ai/ckeditor-ai-chat.html), [AI Review](https://ckeditor.com/docs/ckeditor5/latest/features/ai/ckeditor-ai-review.html), [AI Quick Actions](https://ckeditor.com/docs/ckeditor5/latest/features/ai/ckeditor-ai-actions.html), and [AI Translate](https://ckeditor.com/docs/ckeditor5/latest/features/ai/ckeditor-ai-translate.html) now more closely matches the content in the editing area, providing a more consistent visual experience. Initialization has also been optimized by caching model requests, reducing redundant network calls.

Colors used across the AI package are now available through a shared CSS variable palette, making AI components easier to customize. A new [programmatic API guide](https://ckeditor.com/docs/ckeditor5/latest/features/ai/ckeditor-ai-programmatic.html) also describes how to interact with AI features from code.

#### Table improvements

We are introducing table alignment, giving users and integrators much more control over how tables are positioned relative to surrounding content. Tables can now be aligned left, or right with proper text wrapping — a feature well-known from CKEditor 4 that many users have been requesting.

[Table alignment](https://ckeditor.com/docs/ckeditor5/latest/features/tables/tables.html#table-alignment) now uses CSS margin-based positioning by default, producing cleaner output. With a configuration option, teams which are migrating from CKEditor 4 can switch the output back to inlinse styles if needed.

We are also introducing the [ability to switch table cell types](https://ckeditor.com/docs/ckeditor5/latest/features/tables/tables.html#table-cell-type) between header (`<th>`) and data (`<td>`) in the Cell Properties panel. 

Additionally header cells can be associated with related row or column with the [`scope` attribute](https://ckeditor.com/docs/ckeditor5/latest/features/tables/tables.html#table-cell-scope) using the “Row header” or “Column header” options. These options help screen readers understand the table structure.

The editor now recognizes legacy HTML table attributes during upcasting, preserving styling from older HTML content and improving compatibility with CKEditor 4.

* The `<table border="N">` attribute is now converted to `tableBorderWidth`.
* The `<table cellpadding="N">` attribute is now converted to `tableCellPadding`.

Several default table behaviors have also been updated:

* Conversion of `border="0"` to borderless tables is now enabled by default.
* Table alignment is now output as CSS classes by default. Using inline styles is still possible with the `useInlineStyles` option.
* Support for the `scope` attribute in table header cells is now enabled by default.
* Added support for table footers, thanks to a community contribution from [@star-szr](https://github.com/star-szr).

#### Export to PDF default version change

The Export to PDF feature now defaults to version 2 of the converter API, so you will enjoy a range of [powerful enhancements](https://ckeditor.com/docs/ckeditor5/latest/features/converters/export-pdf.html#html-to-pdf-converter-features) right out of the box — including advanced header and footer configurations, flexible page sizing, PDF metadata editing, owner password protection, and digital signature support.

Since the new version may produce slightly different output than version 1, we recommend reviewing the new [default configuration](https://ckeditor.com/docs/ckeditor5/latest/features/converters/export-pdf.html#default-configuration).

If you need to keep the previous behavior, simply set the `version` property in the `exportPdf` configuration object. See the [feature documentation](https://ckeditor.com/docs/ckeditor5/latest/features/converters/export-pdf.html#configuration) for full details on both API versions.

#### Unified root configuration structure

Editor configuration options related to roots, such as `initialData`, `placeholder`, and `label`, are now grouped under `config.root` for single-root editors and `config.roots` for multi-root editors. This provides a more consistent structure for configuring editor roots.

The previous top-level configuration options remain functional but are now deprecated. See the [update guide](https://ckeditor.com/docs/ckeditor5/latest/updating/guides/update-to-48.html#root-configuration-migration-and-deprecated-top-level-options) for migration details.

Please refer to the [update guide](https://ckeditor.com/docs/ckeditor5/latest/updating/guides/update-to-48.html) to learn more about these changes.

### MAJOR BREAKING CHANGES [ℹ️](https://ckeditor.com/docs/ckeditor5/latest/framework/guides/support/versioning-policy.html#major-and-minor-breaking-changes)

* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai), [uploadcare](https://www.npmjs.com/package/@ckeditor/ckeditor5-uploadcare)**: Simplified AI and Uploadcare configuration structures by replacing enums with plain string values. Refer to the official updating guide for [AI](https://ckeditor.com/docs/ckeditor5/latest/updating/guides/update-to-48.html#use-of-string-values-instead-of-enums) and [Uploadcare](https://ckeditor.com/docs/ckeditor5/latest/updating/guides/update-to-48.html#removal-of-enum-as-uploadcare-source-type).
* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai)**: Renamed the `check` property to `commandId` in the `ai.chat.shortcuts` configuration. Refer to the [official updating guide](https://ckeditor.com/docs/ckeditor5/latest/updating/guides/update-to-48.html#ai-chat-shortcuts).
* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai)**: Introduced the `label` property in place of `displayedPrompt` in the `ai.quickActions.extraCommands` configuration. The `displayedPrompt` property is now required only for extra commands with type `'chat'`. Refer to the [official updating guide](https://ckeditor.com/docs/ckeditor5/latest/updating/guides/update-to-48.html#ai-quick-actions).
* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai)**: Changed the `type` property values in the `ai.quickActions.extraCommands` configuration from uppercase to lowercase. Refer to the [official updating guide](https://ckeditor.com/docs/ckeditor5/latest/updating/guides/update-to-48.html#ai-quick-actions).
* **[editor-multi-root](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-multi-root)**: The `config.rootsAttributes` and `config.lazyRoots` multi-root editor config options have been removed. See [#19885](https://github.com/ckeditor/ckeditor5/issues/19885).

  The `config.roots` option should be used instead to define the editor roots and their attributes.

  The `config.roots.<rootName>.modelAttributes` property should be used to define the attributes of a root, while
  the `config.roots.<rootName>.lazyLoad` property should be used to define whether a root should be lazy loaded or not.

  Note that `config.roots.<rootName>.lazyLoad` property is now deprecated and will be removed in the future.
* **[table](https://www.npmjs.com/package/@ckeditor/ckeditor5-table)**: Table alignment is now output as CSS classes instead of inline styles by default. See [#3225](https://github.com/ckeditor/ckeditor5/issues/3225).

  It can be reverted to the previous behaviour by setting the `useInlineStyles` configuration option to `true`.
* **[table](https://www.npmjs.com/package/@ckeditor/ckeditor5-table)**: Changed the default value of `table.tableLayout.stripFigureFromContentTable` from `true` to `false`. See [#19771](https://github.com/ckeditor/ckeditor5/issues/19771).

  As a result, the `<figure>` wrapper is now preserved on content tables by default when the layout tables feature is enabled.
* CKEditor 5 DLL builds are no longer available due to the deprecation of legacy installation methods. See the [migration path](https://ckeditor.com/docs/ckeditor5/latest/updating/nim-migration/dll-builds.html). See [#17779](https://github.com/ckeditor/ckeditor5/issues/17779).
* CKEditor 5 packages no longer ship the `src/`, `theme/` and `lang/` directories on npm due to the deprecation of legacy installation methods. See the [migration path](https://ckeditor.com/docs/ckeditor5/latest/updating/nim-migration/customized-builds.html). See [#17779](https://github.com/ckeditor/ckeditor5/issues/17779).
* All styles previously shipped in `@ckeditor/ckeditor5-theme-lark` have been redistributed to the appropriate packages, which now provide those CSS assets directly.

### MINOR BREAKING CHANGES [ℹ️](https://ckeditor.com/docs/ckeditor5/latest/framework/guides/support/versioning-policy.html#major-and-minor-breaking-changes)

* **[core](https://www.npmjs.com/package/@ckeditor/ckeditor5-core), [editor-balloon](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-balloon), [editor-classic](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-classic), [editor-decoupled](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-decoupled), [editor-inline](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-inline), [editor-multi-root](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-multi-root)**: The editor no longer updates `config.initialData` during startup. Use `config.roots.main.initialData` for single-root editors and `config.roots.<rootName>.initialData` for multi-root editors. See [#19885](https://github.com/ckeditor/ckeditor5/issues/19885).
* **[core](https://www.npmjs.com/package/@ckeditor/ckeditor5-core), [editor-balloon](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-balloon), [editor-classic](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-classic), [editor-decoupled](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-decoupled), [editor-inline](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-inline), [editor-multi-root](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-multi-root), [watchdog](https://www.npmjs.com/package/@ckeditor/ckeditor5-watchdog)**: Added support for creating editors and watchdogs using configuration only, without passing a source element or initial data as the first argument. Passing a source element or initial data as the first argument is now deprecated but still supported. Use `config.attachTo` for `ClassicEditor`, `config.root.element` for single-root editors, and `config.roots.<rootName>.element` for `MultiRootEditor`. See [#19887](https://github.com/ckeditor/ckeditor5/issues/19887).
* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai)**: Moved the public API from `AIChat` to `AIChatController`. This affects integrations that use the `AIChat` API.
* **[core](https://www.npmjs.com/package/@ckeditor/ckeditor5-core)**: The default word breaking behavior in the content area has been updated to prevent unwanted breaks in tables. If you customized the `--ck-content-word-break` CSS variable in your integration, migrate to the new `--ck-content-overflow-wrap` variable to retain the same effect. See [#19986](https://github.com/ckeditor/ckeditor5/issues/19986).
* **[engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine)**: Deep schema verification during `model.insertContent()` is now enabled by default. It is no longer behind an experimental flag. See [#19217](https://github.com/ckeditor/ckeditor5/issues/19217).

  Previously, this behavior required opting in via `config.experimentalFlags.modelInsertContentDeepSchemaVerification: true`. Now it is always active, ensuring that all elements and attributes in inserted content follow the schema - including deeply nested structures.

  If needed, you can temporarily opt out by setting `config.experimentalFlags.modelInsertContentDeepSchemaVerification: false`. Note that this option is **deprecated** and will be removed in a future release.
* **[export-pdf](https://www.npmjs.com/package/@ckeditor/ckeditor5-export-pdf)**: `Export to PDF` now uses version `2` of the converter API by default. This may produce slightly different output, so update any converter options to match the new API. To keep version `1`, set the `version` property in the `exportPdf` configuration object.
* **[import-word](https://www.npmjs.com/package/@ckeditor/ckeditor5-import-word)**: The `ImportWordEditing#getToken()` method is now asynchronous and returns a promise.
* **[mention](https://www.npmjs.com/package/@ckeditor/ckeditor5-mention)**: Mention elements in the data output now include the `data-mention-uid` attribute. This affects only integrations that define custom mention downcast converters. If you defined one, update it to include `data-mention-uid` in the output and omit it during clipboard operations; see the [update guide](https://ckeditor.com/docs/ckeditor5/latest/updating/guides/update-to-48.html#mention-feature-now-persists-uid-as-data-mention-uid-in-the-data-output).
* **[table](https://www.npmjs.com/package/@ckeditor/ckeditor5-table)**: The improved handling of table heading rows is now enabled by default. Rows are no longer incorrectly marked or moved as header rows when earlier rows are not header rows. See [#19431](https://github.com/ckeditor/ckeditor5/issues/19431).
* **[table](https://www.npmjs.com/package/@ckeditor/ckeditor5-table)**: Added new block-level left and right alignment options. The editor also recognizes equivalent inline margin styles and converts them to these alignment types. See [#3225](https://github.com/ckeditor/ckeditor5/issues/3225).
* **[table](https://www.npmjs.com/package/@ckeditor/ckeditor5-table)**: The `shallow` option used with `TableUtils#setHeadingRows` and `TableUtils#setHeadingColumns` has been renamed to `updateCellType`. See [#19431](https://github.com/ckeditor/ckeditor5/issues/19431).
* **[table](https://www.npmjs.com/package/@ckeditor/ckeditor5-table)**: Added support for importing HTML tables with the legacy `border="0"` attribute as borderless tables. Closes [#19038](https://github.com/ckeditor/ckeditor5/issues/19038).
* **[table](https://www.npmjs.com/package/@ckeditor/ckeditor5-table)**: The experimental handling of the legacy `border="0"` HTML attribute is now enabled by default. If you had `config.experimentalFlags.upcastTableBorderZeroAttributes` in your configuration, remove it because the flag is no longer recognized. See [#19038](https://github.com/ckeditor/ckeditor5/issues/19038).
* **[track-changes](https://www.npmjs.com/package/@ckeditor/ckeditor5-track-changes)**: Moved `TrackChangesEditing#registerBlockAttribute()` and `TrackChangesEditing#registerInlineAttribute()` to the `SuggestionConversion` plugin in the `ckeditor5-collaboration-core` package.

  The purpose and behavior of these methods remains the same.
* **[track-changes](https://www.npmjs.com/package/@ckeditor/ckeditor5-track-changes)**: Suggestion marker DOM elements now use the `data-suggestion` attribute consistently.

  This may affect custom code or CSS that relies on `data-suggestion-id`.
* **[ui](https://www.npmjs.com/package/@ckeditor/ckeditor5-ui)**: The scope of the `.ck-reset_all-excluded` class has been expanded to also include the container wearing that class (e.g. to limit inheritance of font properties).

  Because of this, elements of the CKEditor user interface excluded from the CSS reset by the usage of the `.ck-reset_all-excluded` class may be prone to unexpected styling. Please make sure to verify the visual styling of such UI elements after updating to this version.
* Updated to TypeScript `5.5.4`.

### Features

* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai)**: `AIChatController` plugin now fires `replyCreated` and `interactionCreated` events when a new `AIReply` or `AIChatInteraction` is created.
* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai)**: Added the `ai.chat.context.alwaysAddSelection` configuration option. When enabled, the document selection is added to the AI Chat context automatically. This option is disabled by default.
* **[export-pdf](https://www.npmjs.com/package/@ckeditor/ckeditor5-export-pdf)**: `Export to PDF` now uses version `2` of the converter API by default. To keep version `1`, set the `version` property in the `exportPdf` configuration object.
* **[footnotes](https://www.npmjs.com/package/@ckeditor/ckeditor5-footnotes)**: Added support for configuring the items available in the footnotes list styles dropdown. Pass the `listStyles` array in the configuration to choose which list styles are shown.
* **[footnotes](https://www.npmjs.com/package/@ckeditor/ckeditor5-footnotes)**: Added support for the `arabic-indic` list style in footnotes. It is not shown in the dropdown by default, but it can be added to the list of available styles using the `listStyles` configuration option.
* **[remove-format](https://www.npmjs.com/package/@ckeditor/ckeditor5-remove-format)**: The remove format feature now clears inherited formatting from empty paragraphs and other block elements. Closes [#19851](https://github.com/ckeditor/ckeditor5/issues/19851).
* **[table](https://www.npmjs.com/package/@ckeditor/ckeditor5-table)**: Introduced support for changing table cell types between `data` and `header`. Closes [#16730](https://github.com/ckeditor/ckeditor5/issues/16730).
* **[table](https://www.npmjs.com/package/@ckeditor/ckeditor5-table)**: Introduced support for the `scope` attribute in table header cells to improve semantic markup and screen reader accessibility. This feature is enabled by default and can be disabled by setting `config.table.tableCellProperties.scopedHeaders` to `false`. Closes [#3175](https://github.com/ckeditor/ckeditor5/issues/3175).
* **[table](https://www.npmjs.com/package/@ckeditor/ckeditor5-table)**: Added support for table footers. You can now specify the number of footer rows in a table. The table row context menu has been updated with a new `Footer row` toggle to control this setting. Closes [#12952](https://github.com/ckeditor/ckeditor5/issues/12952).

  This feature is disabled by default and can be enabled by setting `config.table.enableFooters` to `true`.

  Thanks to [@star-szr](https://github.com/star-szr).
* **[table](https://www.npmjs.com/package/@ckeditor/ckeditor5-table)**: Preserved table borders from legacy HTML content. Closes [#19633](https://github.com/ckeditor/ckeditor5/issues/19633).

  When loading HTML content that uses the deprecated `border` attribute on tables, the editor now keeps the original border width instead of ignoring it.
* **[table](https://www.npmjs.com/package/@ckeditor/ckeditor5-table)**: Preserved table cell padding from legacy HTML content. Closes [#19634](https://github.com/ckeditor/ckeditor5/issues/19634).

  When loading HTML content that uses the deprecated `cellpadding` attribute on tables, the editor now keeps the original cell padding instead of ignoring it.

### Bug fixes

* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai)**: Fixed an issue where new lines were ignored in the user message displayed in the AI Chat feed.
* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai)**: Reset the "Show changes" button state after the balloon for an AI Quick Action is displayed.
* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai)**: Fixed the incorrect order of user messages and AI agent responses in the AI Chat feed when loading a conversation from history.
* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai)**: Fixed an error thrown when the user stopped an ongoing AI Chat interaction and the remaining replies were not flushed to the UI.
* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai)**: Fixed a console error that could occur when AI Quick Actions were closed during response streaming.
* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai)**: Fixed an error thrown by CKEditor AI features when processing content that contains mentions. See [#20010](https://github.com/ckeditor/ckeditor5/issues/20010).
* **[comments](https://www.npmjs.com/package/@ckeditor/ckeditor5-comments)**: Fixed inline annotations so they stay attached to the target element when it scrolls inside its parent container.
* **[code-block](https://www.npmjs.com/package/@ckeditor/ckeditor5-code-block)**: Fixed inconsistent vertical spacing around code blocks in the content area. Code blocks now use explicit vertical margins that match other block widgets. Closes [#19982](https://github.com/ckeditor/ckeditor5/issues/19982).
* **[core](https://www.npmjs.com/package/@ckeditor/ckeditor5-core)**: Fixed excessive word breaking in tables rendered in the content area. Words will now only break when they genuinely overflow their container, preventing awkward splits in narrow table columns. Closes [#19986](https://github.com/ckeditor/ckeditor5/issues/19986).
* **[engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine)**: Removed the unintended public exports `autoParagraphEmptyRoots`, `isParagraphable`, and `wrapInParagraph`.

  These utilities were not part of the supported public API.
* **[engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine)**: Gradients in background styles are no longer ignored and are properly normalized. Closes [#19787](https://github.com/ckeditor/ckeditor5/issues/19787).
* **[engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine)**: Fixed background normalization so it no longer drops layers from the `background` CSS shorthand. Multi-layer backgrounds are now parsed and serialized correctly. See [#19787](https://github.com/ckeditor/ckeditor5/issues/19787).
* **[footnotes](https://www.npmjs.com/package/@ckeditor/ckeditor5-footnotes)**: Fixed the footnotes configuration typings to use `defaultListStyle` instead of `defaultStyle`.
* **[import-word](https://www.npmjs.com/package/@ckeditor/ckeditor5-import-word)**: Improved the initialization time of the `ImportWordEditing` plugin. Token retrieval now runs in the background, so it does not block editor startup.
* **[link](https://www.npmjs.com/package/@ckeditor/ckeditor5-link)**: Removed the unintended public export `ensureSafeUrl`.

  This utility was not part of the supported public API.
* **[real-time-collaboration](https://www.npmjs.com/package/@ckeditor/ckeditor5-real-time-collaboration)**: Fixed the inconsistent font family in collaboration user markers.
* **[show-blocks](https://www.npmjs.com/package/@ckeditor/ckeditor5-show-blocks)**: Fixed the `Show blocks` feature so block labels render in all editor types when the `dir` attribute is present either on the editable element itself or on its ancestor wrapper. Closes [#19866](https://github.com/ckeditor/ckeditor5/issues/19866).
* **[track-changes](https://www.npmjs.com/package/@ckeditor/ckeditor5-track-changes)**: Fixed suggestion marker DOM elements that used `data-suggestion-id` instead of `data-suggestion`.
* **[ui](https://www.npmjs.com/package/@ckeditor/ckeditor5-ui)**: Updated the CSS reset rules so `.ck-reset_all-excluded` also applies to the container that uses this class. Closes [#19967](https://github.com/ckeditor/ckeditor5/issues/19967).

  This change reduces the impact of the CKEditor's `.ck-reset_all` class in DOM elements that are explicitly excluded from the reset by the `.ck-reset_all-excluded` class.
* **[ui](https://www.npmjs.com/package/@ckeditor/ckeditor5-ui)**: Disabling a menu bar menu now also closes it if it was open, preventing an open panel from remaining in a non-interactive state. Closes [#18214](https://github.com/ckeditor/ckeditor5/issues/18214).

### Other changes

* **[core](https://www.npmjs.com/package/@ckeditor/ckeditor5-core), [editor-balloon](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-balloon), [editor-classic](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-classic), [editor-decoupled](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-decoupled), [editor-inline](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-inline), [editor-multi-root](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-multi-root), [watchdog](https://www.npmjs.com/package/@ckeditor/ckeditor5-watchdog)**: Reorganized root-related editor configuration under `config.root` for single-root editors and `config.roots` for multi-root editors. Closes [#19885](https://github.com/ckeditor/ckeditor5/issues/19885).

  The `config.initialData`, `config.placeholder`, and `config.label` options are deprecated in favor of `config.root.initialData`, `config.root.placeholder`, and `config.root.label`.
  In multi-root editors, define these options per root using `config.roots.<rootName>.initialData`, `config.roots.<rootName>.placeholder`, and `config.roots.<rootName>.label`.
* **[paste-from-office](https://www.npmjs.com/package/@ckeditor/ckeditor5-paste-from-office), [table](https://www.npmjs.com/package/@ckeditor/ckeditor5-table)**: Introduced new table block alignments, `blockLeft` and `blockRight`, allowing tables to be aligned to the left or right without text wrapping. The table properties balloon now includes two new buttons to easily apply these alignments. Closes [#3225](https://github.com/ckeditor/ckeditor5/issues/3225), [#6174](https://github.com/ckeditor/ckeditor5/issues/6174), [#8412](https://github.com/ckeditor/ckeditor5/issues/8412), [#8752](https://github.com/ckeditor/ckeditor5/issues/8752), [#9982](https://github.com/ckeditor/ckeditor5/issues/9982), [#10867](https://github.com/ckeditor/ckeditor5/issues/10867), [#14921](https://github.com/ckeditor/ckeditor5/issues/14921), [#17932](https://github.com/ckeditor/ckeditor5/issues/17932), [#19337](https://github.com/ckeditor/ckeditor5/issues/19337).

  Added additional spacing between a table and the surrounding text when wrapping is enabled. This prevents issues such as list markers overlapping with the table when placed next to each other.

  Added support for pasting to and from MS Word for all table alignment types: `left`, `right`, `center`, `blockLeft`, and `blockRight`.
* **[collaboration-core](https://www.npmjs.com/package/@ckeditor/ckeditor5-collaboration-core), [track-changes](https://www.npmjs.com/package/@ckeditor/ckeditor5-track-changes)**: Moved `TrackChangesEditing#registerBlockAttribute()` and `TrackChangesEditing#registerInlineAttribute()` to the `SuggestionConversion` plugin in the `ckeditor5-collaboration-core` package.
* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai)**: `AIChatController` is now a public class. Moved public API from `AIChat` to `AIChatController` to avoid duplication.
* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai)**: Decreased the line height in the AI Chat prompt input field to match feed messages.
* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai)**: `AIChat#addSelectionToChatContext()` now returns `void` instead of `Promise`.
* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai)**: Suggestion previews in AI features now follow the styling of the content in the editing area more closely.
* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai)**: Optimized AI features initialization by caching model requests, reducing redundant network calls and improving load performance.
* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai)**: Improved handling of agent responses in the Markdown format.
* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai)**: Marked selected AI programmatic APIs as experimental. These APIs are production-ready but may change in minor releases without the standard deprecation policy.
* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai)**: Added a shared CSS variable palette for colors used across the `ckeditor5-ai` package.

  This makes AI components easier to customize.
* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai)**: Removed the built-in Amazon Bedrock integration in the legacy AI Assistant. The `AWSTextAdapter` class remains available but now throws an error when used, and this change does not affect CKEditor AI. If you rely on this integration, contact [support](https://support.ckeditor.com).
* **[ckbox](https://www.npmjs.com/package/@ckeditor/ckeditor5-ckbox)**: Fixed an issue where the CKBox dialog was not visible in fullscreen mode. Closes [#19290](https://github.com/ckeditor/ckeditor5/issues/19290).
* **[engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine)**: `Model#hasContent()` can now check `ModelSelection` and `ModelDocumentSelection` instances. See [#19847](https://github.com/ckeditor/ckeditor5/issues/19847).
* **[markdown-gfm](https://www.npmjs.com/package/@ckeditor/ckeditor5-markdown-gfm)**: Enhanced `MarkdownGfmMdToHtml` to support custom plugins and to export the default plugin chain used by the Markdown parser.
* **[utils](https://www.npmjs.com/package/@ckeditor/ckeditor5-utils)**: Introduced `Rect.getDomElementRects()` method that conveniently retrieves all `Rects` of a DOM element while preserving their source for further processing (e.g. `Rect#getVisible()`).
* Replaced string-based soft requirements with plugin constructors across selected packages to improve developer experience and align plugin dependency handling across repositories. This update also adjusts package metadata and dependencies to match the new constructor-based requirements. See [#17779](https://github.com/ckeditor/ckeditor5/issues/17779). Closes [#19747](https://github.com/ckeditor/ckeditor5/issues/19747).

  The following dependencies no longer rely on soft requirements:

  * `ckeditor5-ai`: `CloudServices`.
  * `ckeditor5-ckbox`: `LinkEditing`, `PictureEditing`, `ImageUtils`, `ImageEditing`, `ImageUploadEditing`, `ImageUploadProgress`, `CloudServices`.
  * `ckeditor5-ckfinder`: `Link`, `LinkEditing`, `CKFinderUploadAdapter`.
  * `ckeditor5-easy-image`: `CloudServices`, `ImageUpload`.
  * `ckeditor5-emoji`: `Mention`.
  * `ckeditor5-export-pdf`: `CloudServices`.
  * `ckeditor5-export-word`: `CloudServices`.
  * `ckeditor5-heading`: `Paragraph`.
  * `ckeditor5-import-word`: `CloudServices`.
  * `ckeditor5-link`: `ImageEditing`, `ImageUtils`, `ImageBlockEditing`.
  * `ckeditor5-list-multi-level`: `ListEditing`.
  * `ckeditor5-merge-fields`: `ImageUtils`, `ImageEditing`, `Mention`.
  * `ckeditor5-paste-from-office-enhanced`: `PasteFromOffice`.
  * `ckeditor5-real-time-collaboration`: `Comments`, `CommentsRepository`, `CloudServices`, `RevisionHistory`, `TrackChanges`, `TrackChangesEditing`.
  * `ckeditor5-revision-history`: `Users`.
  * `ckeditor5-slash-command`: `Mention`.
  * `ckeditor5-style`: `GeneralHtmlSupport`.
  * `ckeditor5-track-changes`: `Comments`, `CommentsRepository`, `Annotations`, `EditorAnnotations`.
  * `ckeditor5-typing`: `Delete`, `Input`.
  * `ckeditor5-uploadcare`: `PictureEditing`, `ImageUploadEditing`, `ImageUploadProgress`, `ImageEditing`, `ImageUtils`.
* Updated `es-toolkit` to `v1.45.1`.
* Updated translations.

### Released packages

Check out the [Versioning policy](https://ckeditor.com/docs/ckeditor5/latest/framework/guides/support/versioning-policy.html) guide for more information.

<details>
<summary>Released packages (summary)</summary>

Major releases (contain major breaking changes):

* [@ckeditor/ckeditor5-ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai/v/48.0.0): v47.6.1 => v48.0.0
* [@ckeditor/ckeditor5-uploadcare](https://www.npmjs.com/package/@ckeditor/ckeditor5-uploadcare/v/48.0.0): v47.6.1 => v48.0.0
* [@ckeditor/ckeditor5-editor-multi-root](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-multi-root/v/48.0.0): v47.6.1 => v48.0.0
* [@ckeditor/ckeditor5-table](https://www.npmjs.com/package/@ckeditor/ckeditor5-table/v/48.0.0): v47.6.1 => v48.0.0

Minor releases (contain minor breaking changes):

* [@ckeditor/ckeditor5-core](https://www.npmjs.com/package/@ckeditor/ckeditor5-core/v/48.0.0): v47.6.1 => v48.0.0
* [@ckeditor/ckeditor5-editor-balloon](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-balloon/v/48.0.0): v47.6.1 => v48.0.0
* [@ckeditor/ckeditor5-editor-classic](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-classic/v/48.0.0): v47.6.1 => v48.0.0
* [@ckeditor/ckeditor5-editor-decoupled](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-decoupled/v/48.0.0): v47.6.1 => v48.0.0
* [@ckeditor/ckeditor5-editor-inline](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-inline/v/48.0.0): v47.6.1 => v48.0.0
* [@ckeditor/ckeditor5-engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine/v/48.0.0): v47.6.1 => v48.0.0
* [@ckeditor/ckeditor5-export-pdf](https://www.npmjs.com/package/@ckeditor/ckeditor5-export-pdf/v/48.0.0): v47.6.1 => v48.0.0
* [@ckeditor/ckeditor5-import-word](https://www.npmjs.com/package/@ckeditor/ckeditor5-import-word/v/48.0.0): v47.6.1 => v48.0.0
* [@ckeditor/ckeditor5-track-changes](https://www.npmjs.com/package/@ckeditor/ckeditor5-track-changes/v/48.0.0): v47.6.1 => v48.0.0
* [@ckeditor/ckeditor5-ui](https://www.npmjs.com/package/@ckeditor/ckeditor5-ui/v/48.0.0): v47.6.1 => v48.0.0

Releases containing new features:

* [@ckeditor/ckeditor5-footnotes](https://www.npmjs.com/package/@ckeditor/ckeditor5-footnotes/v/48.0.0): v47.6.1 => v48.0.0
* [@ckeditor/ckeditor5-remove-format](https://www.npmjs.com/package/@ckeditor/ckeditor5-remove-format/v/48.0.0): v47.6.1 => v48.0.0

Other releases:

* [@ckeditor/ckeditor5-adapter-ckfinder](https://www.npmjs.com/package/@ckeditor/ckeditor5-adapter-ckfinder/v/48.0.0): v47.6.1 => v48.0.0
* [@ckeditor/ckeditor5-alignment](https://www.npmjs.com/package/@ckeditor/ckeditor5-alignment/v/48.0.0): v47.6.1 => v48.0.0
* [@ckeditor/ckeditor5-autoformat](https://www.npmjs.com/package/@ckeditor/ckeditor5-autoformat/v/48.0.0): v47.6.1 => v48.0.0
* [@ckeditor/ckeditor5-autosave](https://www.npmjs.com/package/@ckeditor/ckeditor5-autosave/v/48.0.0): v47.6.1 => v48.0.0
* [@ckeditor/ckeditor5-basic-styles](https://www.npmjs.com/package/@ckeditor/ckeditor5-basic-styles/v/48.0.0): v47.6.1 => v48.0.0
* [@ckeditor/ckeditor5-block-quote](https://www.npmjs.com/package/@ckeditor/ckeditor5-block-quote/v/48.0.0): v47.6.1 => v48.0.0
* [@ckeditor/ckeditor5-bookmark](https://www.npmjs.com/package/@ckeditor/ckeditor5-bookmark/v/48.0.0): v47.6.1 => v48.0.0
* [@ckeditor/ckeditor5-case-change](https://www.npmjs.com/package/@ckeditor/ckeditor5-case-change/v/48.0.0): v47.6.1 => v48.0.0
* [@ckeditor/ckeditor5-ckbox](https://www.npmjs.com/package/@ckeditor/ckeditor5-ckbox/v/48.0.0): v47.6.1 => v48.0.0
* [@ckeditor/ckeditor5-ckfinder](https://www.npmjs.com/package/@ckeditor/ckeditor5-ckfinder/v/48.0.0): v47.6.1 => v48.0.0
* [@ckeditor/ckeditor5-clipboard](https://www.npmjs.com/package/@ckeditor/ckeditor5-clipboard/v/48.0.0): v47.6.1 => v48.0.0
* [@ckeditor/ckeditor5-cloud-services](https://www.npmjs.com/package/@ckeditor/ckeditor5-cloud-services/v/48.0.0): v47.6.1 => v48.0.0
* [@ckeditor/ckeditor5-code-block](https://www.npmjs.com/package/@ckeditor/ckeditor5-code-block/v/48.0.0): v47.6.1 => v48.0.0
* [@ckeditor/ckeditor5-collaboration-core](https://www.npmjs.com/package/@ckeditor/ckeditor5-collaboration-core/v/48.0.0): v47.6.1 => v48.0.0
* [@ckeditor/ckeditor5-comments](https://www.npmjs.com/package/@ckeditor/ckeditor5-comments/v/48.0.0): v47.6.1 => v48.0.0
* [@ckeditor/ckeditor5-document-outline](https://www.npmjs.com/package/@ckeditor/ckeditor5-document-outline/v/48.0.0): v47.6.1 => v48.0.0
* [@ckeditor/ckeditor5-easy-image](https://www.npmjs.com/package/@ckeditor/ckeditor5-easy-image/v/48.0.0): v47.6.1 => v48.0.0
* [@ckeditor/ckeditor5-email](https://www.npmjs.com/package/@ckeditor/ckeditor5-email/v/48.0.0): v47.6.1 => v48.0.0
* [@ckeditor/ckeditor5-emoji](https://www.npmjs.com/package/@ckeditor/ckeditor5-emoji/v/48.0.0): v47.6.1 => v48.0.0
* [@ckeditor/ckeditor5-enter](https://www.npmjs.com/package/@ckeditor/ckeditor5-enter/v/48.0.0): v47.6.1 => v48.0.0
* [@ckeditor/ckeditor5-essentials](https://www.npmjs.com/package/@ckeditor/ckeditor5-essentials/v/48.0.0): v47.6.1 => v48.0.0
* [@ckeditor/ckeditor5-export-inline-styles](https://www.npmjs.com/package/@ckeditor/ckeditor5-export-inline-styles/v/48.0.0): v47.6.1 => v48.0.0
* [@ckeditor/ckeditor5-export-word](https://www.npmjs.com/package/@ckeditor/ckeditor5-export-word/v/48.0.0): v47.6.1 => v48.0.0
* [@ckeditor/ckeditor5-find-and-replace](https://www.npmjs.com/package/@ckeditor/ckeditor5-find-and-replace/v/48.0.0): v47.6.1 => v48.0.0
* [@ckeditor/ckeditor5-font](https://www.npmjs.com/package/@ckeditor/ckeditor5-font/v/48.0.0): v47.6.1 => v48.0.0
* [@ckeditor/ckeditor5-format-painter](https://www.npmjs.com/package/@ckeditor/ckeditor5-format-painter/v/48.0.0): v47.6.1 => v48.0.0
* [@ckeditor/ckeditor5-fullscreen](https://www.npmjs.com/package/@ckeditor/ckeditor5-fullscreen/v/48.0.0): v47.6.1 => v48.0.0
* [@ckeditor/ckeditor5-heading](https://www.npmjs.com/package/@ckeditor/ckeditor5-heading/v/48.0.0): v47.6.1 => v48.0.0
* [@ckeditor/ckeditor5-highlight](https://www.npmjs.com/package/@ckeditor/ckeditor5-highlight/v/48.0.0): v47.6.1 => v48.0.0
* [@ckeditor/ckeditor5-horizontal-line](https://www.npmjs.com/package/@ckeditor/ckeditor5-horizontal-line/v/48.0.0): v47.6.1 => v48.0.0
* [@ckeditor/ckeditor5-html-embed](https://www.npmjs.com/package/@ckeditor/ckeditor5-html-embed/v/48.0.0): v47.6.1 => v48.0.0
* [@ckeditor/ckeditor5-html-support](https://www.npmjs.com/package/@ckeditor/ckeditor5-html-support/v/48.0.0): v47.6.1 => v48.0.0
* [@ckeditor/ckeditor5-icons](https://www.npmjs.com/package/@ckeditor/ckeditor5-icons/v/48.0.0): v47.6.1 => v48.0.0
* [@ckeditor/ckeditor5-image](https://www.npmjs.com/package/@ckeditor/ckeditor5-image/v/48.0.0): v47.6.1 => v48.0.0
* [@ckeditor/ckeditor5-indent](https://www.npmjs.com/package/@ckeditor/ckeditor5-indent/v/48.0.0): v47.6.1 => v48.0.0
* [@ckeditor/ckeditor5-language](https://www.npmjs.com/package/@ckeditor/ckeditor5-language/v/48.0.0): v47.6.1 => v48.0.0
* [@ckeditor/ckeditor5-line-height](https://www.npmjs.com/package/@ckeditor/ckeditor5-line-height/v/48.0.0): v47.6.1 => v48.0.0
* [@ckeditor/ckeditor5-link](https://www.npmjs.com/package/@ckeditor/ckeditor5-link/v/48.0.0): v47.6.1 => v48.0.0
* [@ckeditor/ckeditor5-list](https://www.npmjs.com/package/@ckeditor/ckeditor5-list/v/48.0.0): v47.6.1 => v48.0.0
* [@ckeditor/ckeditor5-list-multi-level](https://www.npmjs.com/package/@ckeditor/ckeditor5-list-multi-level/v/48.0.0): v47.6.1 => v48.0.0
* [@ckeditor/ckeditor5-markdown-gfm](https://www.npmjs.com/package/@ckeditor/ckeditor5-markdown-gfm/v/48.0.0): v47.6.1 => v48.0.0
* [@ckeditor/ckeditor5-media-embed](https://www.npmjs.com/package/@ckeditor/ckeditor5-media-embed/v/48.0.0): v47.6.1 => v48.0.0
* [@ckeditor/ckeditor5-mention](https://www.npmjs.com/package/@ckeditor/ckeditor5-mention/v/48.0.0): v47.6.1 => v48.0.0
* [@ckeditor/ckeditor5-merge-fields](https://www.npmjs.com/package/@ckeditor/ckeditor5-merge-fields/v/48.0.0): v47.6.1 => v48.0.0
* [@ckeditor/ckeditor5-minimap](https://www.npmjs.com/package/@ckeditor/ckeditor5-minimap/v/48.0.0): v47.6.1 => v48.0.0
* [@ckeditor/ckeditor5-operations-compressor](https://www.npmjs.com/package/@ckeditor/ckeditor5-operations-compressor/v/48.0.0): v47.6.1 => v48.0.0
* [@ckeditor/ckeditor5-page-break](https://www.npmjs.com/package/@ckeditor/ckeditor5-page-break/v/48.0.0): v47.6.1 => v48.0.0
* [@ckeditor/ckeditor5-pagination](https://www.npmjs.com/package/@ckeditor/ckeditor5-pagination/v/48.0.0): v47.6.1 => v48.0.0
* [@ckeditor/ckeditor5-paragraph](https://www.npmjs.com/package/@ckeditor/ckeditor5-paragraph/v/48.0.0): v47.6.1 => v48.0.0
* [@ckeditor/ckeditor5-paste-from-office](https://www.npmjs.com/package/@ckeditor/ckeditor5-paste-from-office/v/48.0.0): v47.6.1 => v48.0.0
* [@ckeditor/ckeditor5-paste-from-office-enhanced](https://www.npmjs.com/package/@ckeditor/ckeditor5-paste-from-office-enhanced/v/48.0.0): v47.6.1 => v48.0.0
* [@ckeditor/ckeditor5-real-time-collaboration](https://www.npmjs.com/package/@ckeditor/ckeditor5-real-time-collaboration/v/48.0.0): v47.6.1 => v48.0.0
* [@ckeditor/ckeditor5-restricted-editing](https://www.npmjs.com/package/@ckeditor/ckeditor5-restricted-editing/v/48.0.0): v47.6.1 => v48.0.0
* [@ckeditor/ckeditor5-revision-history](https://www.npmjs.com/package/@ckeditor/ckeditor5-revision-history/v/48.0.0): v47.6.1 => v48.0.0
* [@ckeditor/ckeditor5-select-all](https://www.npmjs.com/package/@ckeditor/ckeditor5-select-all/v/48.0.0): v47.6.1 => v48.0.0
* [@ckeditor/ckeditor5-show-blocks](https://www.npmjs.com/package/@ckeditor/ckeditor5-show-blocks/v/48.0.0): v47.6.1 => v48.0.0
* [@ckeditor/ckeditor5-slash-command](https://www.npmjs.com/package/@ckeditor/ckeditor5-slash-command/v/48.0.0): v47.6.1 => v48.0.0
* [@ckeditor/ckeditor5-source-editing](https://www.npmjs.com/package/@ckeditor/ckeditor5-source-editing/v/48.0.0): v47.6.1 => v48.0.0
* [@ckeditor/ckeditor5-source-editing-enhanced](https://www.npmjs.com/package/@ckeditor/ckeditor5-source-editing-enhanced/v/48.0.0): v47.6.1 => v48.0.0
* [@ckeditor/ckeditor5-special-characters](https://www.npmjs.com/package/@ckeditor/ckeditor5-special-characters/v/48.0.0): v47.6.1 => v48.0.0
* [@ckeditor/ckeditor5-style](https://www.npmjs.com/package/@ckeditor/ckeditor5-style/v/48.0.0): v47.6.1 => v48.0.0
* [@ckeditor/ckeditor5-template](https://www.npmjs.com/package/@ckeditor/ckeditor5-template/v/48.0.0): v47.6.1 => v48.0.0
* [@ckeditor/ckeditor5-typing](https://www.npmjs.com/package/@ckeditor/ckeditor5-typing/v/48.0.0): v47.6.1 => v48.0.0
* [@ckeditor/ckeditor5-undo](https://www.npmjs.com/package/@ckeditor/ckeditor5-undo/v/48.0.0): v47.6.1 => v48.0.0
* [@ckeditor/ckeditor5-upload](https://www.npmjs.com/package/@ckeditor/ckeditor5-upload/v/48.0.0): v47.6.1 => v48.0.0
* [@ckeditor/ckeditor5-utils](https://www.npmjs.com/package/@ckeditor/ckeditor5-utils/v/48.0.0): v47.6.1 => v48.0.0
* [@ckeditor/ckeditor5-watchdog](https://www.npmjs.com/package/@ckeditor/ckeditor5-watchdog/v/48.0.0): v47.6.1 => v48.0.0
* [@ckeditor/ckeditor5-widget](https://www.npmjs.com/package/@ckeditor/ckeditor5-widget/v/48.0.0): v47.6.1 => v48.0.0
* [@ckeditor/ckeditor5-word-count](https://www.npmjs.com/package/@ckeditor/ckeditor5-word-count/v/48.0.0): v47.6.1 => v48.0.0
* [ckeditor5](https://www.npmjs.com/package/ckeditor5/v/48.0.0): v47.6.1 => v48.0.0
* [ckeditor5-premium-features](https://www.npmjs.com/package/ckeditor5-premium-features/v/48.0.0): v47.6.1 => v48.0.0
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
