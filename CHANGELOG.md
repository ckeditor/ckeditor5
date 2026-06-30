Changelog
=========

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


## [48.1.0](https://github.com/ckeditor/ckeditor5/compare/v48.0.1...v48.1.0) (May 13, 2026)

We are happy to announce the release of CKEditor 5 v48.1.0.

### Release highlights

This release improves AI Chat formatting and rendering, introduces experimental AI support for multi-root and multiple editor setups, and strengthens compatibility with structured content pasted from Office and exported for email.

#### ⭐ AI Chat: better formatting and rendering

[AI Chat](https://ckeditor.com/docs/ckeditor5/latest/features/ai/ckeditor-ai-chat.html) now handles raw, unformatted content more reliably. Asking AI Chat to format a pasted transcript, add headings, or convert content into a list produces cleaner and more predictable results.

The AI Chat feed also renders generated content differently. Proposed changes now appear in full when they are ready, while plain assistant text continues to stream at a faster pace.

#### ⭐ Experimental: AI in multi-root and multiple editor setups

AI features now [support multi-root editors and multiple editor instances](https://ckeditor.com/docs/ckeditor5/latest/features/ai/ckeditor-ai-multi-root-multi-editor-support.html) that share a [`Context`](https://ckeditor.com/docs/ckeditor5/latest/api/module_core_context-Context.html). This helps integrations that use several editor areas on one page, such as a title, body, sidebar, or document sections split into independent roots.

With this release:

* AI Review and AI Translate run across all roots in a multi-root editor and across all editors that share a `Context`. Changes are applied to the related root or editor.
* AI Chat uses content from the focused root or editor, applies suggestions to the related destination, and keeps separate conversation history for each editor in a `Context`.

This feature is experimental and ready for testing in multi-root and multiple editor integrations.

#### Other improvements and fixes

This release also includes several improvements for content editing, Office content compatibility, and email output:

* Marker boundary elements registered with `markerToElement()` now render in the same order as in the model when two markers meet at the same position. This affects features that rely on markers, including comments, suggestions, mentions, find and replace, and restricted editing.
* Inline formatting such as bold, italic, font size, font family, font color, and background color is now retained after pressing Shift+Enter twice or after deleting all text inside a block and continuing to type.
* [Source Editing](https://ckeditor.com/docs/ckeditor5/latest/features/source-editing/source-editing.html) now supports native undo and redo keystrokes in the source editing textarea.
* The editor now handles [alignment attributes](https://ckeditor.com/docs/ckeditor5/latest/features/tables/tables.html#table-alignment) on `<td>` elements that wrap nested tables or images. This improves compatibility with content from Outlook and other sources that use `td[align]` for block layout.
* Tables now preserve their alignment and inline styles after the [email export transformation](https://ckeditor.com/docs/ckeditor5/latest/features/email-editing/email.html#email-specific-style-transformations), improving rendering in Outlook, Gmail, and other major email clients.

### MINOR BREAKING CHANGES [ℹ️](https://ckeditor.com/docs/ckeditor5/latest/updating/versioning-policy.html#major-and-minor-breaking-changes)

* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai)**: AI Chat feed items are now aligned to the bottom of the feed by default. To restore the previous top-aligned behavior, add the following CSS to your integration:

  ```css
  .ck.ck-ai-chat__feed__items {
      margin-top: 0;
  }
  ```
* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai)**: AI Chat suggestions proposed by the agent are now displayed in full when ready. Previously, they streamed word by word.

### Features

* **[core](https://www.npmjs.com/package/@ckeditor/ckeditor5-core), [editor-balloon](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-balloon), [editor-classic](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-classic), [editor-decoupled](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-decoupled), [editor-inline](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-inline), [editor-multi-root](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-multi-root), [engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine)**: Introduced `config.root.modelElement` for single-root editors and `config.roots.<name>.modelElement` for multi-root editors, allowing integrators to configure the model root element type. Added the `$inlineRoot` generic schema item for use with the new editor configuration. Closes [#20029](https://github.com/ckeditor/ckeditor5/issues/20029).
* **[core](https://www.npmjs.com/package/@ckeditor/ckeditor5-core), [editor-balloon](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-balloon), [editor-classic](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-classic), [editor-decoupled](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-decoupled), [editor-inline](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-inline)**: Enabled the `modelAttributes` root configuration option for all single-root editors.
* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai)**: Added the opt-in `config.ai.container.collapsible` configuration option. When enabled, clicking the active tab button toggles the `.ck-ai-tabs_collapsed` CSS class on the `.ck-ai-tabs` element. The option defaults to `false`.
* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai)**: The `AIChatController#startConversation()` method now accepts an optional `modelId` parameter to select a specific model for the new conversation. Custom Quick Actions of type `chat` with a `model` property will now use it when starting a chat conversation.
* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai)**: [AI Review](https://ckeditor.com/docs/ckeditor5/latest/features/ai/ckeditor-ai-review.html) and [AI Translate](https://ckeditor.com/docs/ckeditor5/latest/features/ai/ckeditor-ai-translate.html) now support [multi-root editors](https://ckeditor.com/docs/ckeditor5/latest/getting-started/setup/editor-types.html#multi-root-editor) and multi-editor-instance [contexts](https://ckeditor.com/docs/ckeditor5/latest/api/module_core_context-Context.html).
* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai)**: [AI Chat and AI Chat History](https://ckeditor.com/docs/ckeditor5/latest/features/ai/ckeditor-ai-chat.html) now support [multi-root editors](https://ckeditor.com/docs/ckeditor5/latest/getting-started/setup/editor-types.html#multi-root-editor) and multi-editor-instance [contexts](https://ckeditor.com/docs/ckeditor5/latest/api/module_core_context-Context.html).
* **[document-outline](https://www.npmjs.com/package/@ckeditor/ckeditor5-document-outline)**: Added the `tableOfContents.headings` option that lets integrators choose which heading levels appear in the Table of Contents widget independently from the Document Outline sidebar.
* **[email](https://www.npmjs.com/package/@ckeditor/ckeditor5-email)**: Added support for restoring the `align` attribute on table cells during email transformations when all child elements of a cell share the same alignment. This produces more compact HTML and improves compatibility with legacy email clients. See [ckeditor/ckeditor5#19883](https://github.com/ckeditor/ckeditor5/issues/19883).
* **[export-inline-styles](https://www.npmjs.com/package/@ckeditor/ckeditor5-export-inline-styles)**: Added the `runAfterDocumentTransformation` and `runAfterChildrenTransformation` callbacks. They allow integrations to defer transforming selected elements until their children or the full document has been processed and their styles inlined.
* **[format-painter](https://www.npmjs.com/package/@ckeditor/ckeditor5-format-painter)**: Added an ARIA live announcement when the user cancels format painting by pressing the Escape key.

### Bug fixes

* **[code-block](https://www.npmjs.com/package/@ckeditor/ckeditor5-code-block), [emoji](https://www.npmjs.com/package/@ckeditor/ckeditor5-emoji), [mention](https://www.npmjs.com/package/@ckeditor/ckeditor5-mention)**: Mention autocompletion (and features built on top of it, such as slash commands and emoji) no longer triggers inside code blocks. Closes [#19146](https://github.com/ckeditor/ckeditor5/issues/19146).
* **[engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine), [enter](https://www.npmjs.com/package/@ckeditor/ckeditor5-enter)**: Fixed document selection attribute inheritance around `<softBreak>` so returning the caret after a soft break restores formatting. Closes [#19853](https://github.com/ckeditor/ckeditor5/issues/19853).

  When selection attributes are recalculated across `<softBreak>`, only attributes marked with `copyOnEnter` are inherited. Other inline non-object elements still act as hard boundaries.
* **[engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine), [enter](https://www.npmjs.com/package/@ckeditor/ckeditor5-enter)**: Inline formatting attributes (such as bold or link) are no longer split by a soft break (`<br>`). The `<br>` element now inherits applicable text attributes so that attribute elements in the view can wrap around it without being broken into separate segments. Closes [#1068](https://github.com/ckeditor/ckeditor5/issues/1068).
* **[show-blocks](https://www.npmjs.com/package/@ckeditor/ckeditor5-show-blocks), [table](https://www.npmjs.com/package/@ckeditor/ckeditor5-table)**: Improved the performance of show blocks and table selection styles in large documents. Closes [#20058](https://github.com/ckeditor/ckeditor5/issues/20058).
* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai)**: Fixed a bug where the AI Quick Actions balloon selection marker was incorrectly included in the AI Chat context.
* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai)**: Custom Quick Actions of type `action` without a `model` property now fall back to the default model from the `ai.models.defaultModelId` configuration or the first available model. Previously, they failed with a `400` backend error.
* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai)**: Fixed formatting of larger unformatted content in AI Chat.
* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai)**: Fixed flickering and stuttering in the AI Chat sidebar.
* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai)**: AI Review no longer throws an error when running review commands if the editor content contains a multiline code block.
* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai)**: Fixed a bug where custom MCP tool context item chips displayed a UUID instead of the human-readable label after reloading a conversation from history. The label is now preserved during serialization so it survives the server round-trip.
* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai)**: Undoing AI changes after starting a new chat no longer throws an error.
* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai)**: Moved the "New Chat" button from the empty tab view to the AI Chat History tab header.
* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai)**: Added a dedicated "Maximize" button to resize AI Translate and AI Review tabs.
* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai)**: AI Chat commands (Explain, Summarize, Highlight key points) no longer prevent the AI from performing document edits in follow-up messages.
* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai)**: Improved AI Quick Actions accessibility by disabling the dropdown and menu bar in AI Review. Closes [ckeditor/ckeditor5#8932](https://github.com/ckeditor/ckeditor5/issues/8932).
* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai)**: Fixed AI Chat feed items not sticking to the bottom of the feed when the AI Chat shortcuts feature was not loaded.
* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai)**: Fixed editing chat names in AI Chat History. The input state is now restored after canceling, and failed save attempts no longer update the local chat name.
* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai)**: Fixed a crash when the AI proposes unwrapping content (e.g., removing blockquotes while keeping their inner content).
* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai)**: Removed hover states from non-interactive tiles in AI Chat. Only actionable tiles now show hover feedback.
* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai)**: Updated suggestion styling in AI Chat. The suggestion box now has a distinctive border, and its header no longer has a shadow.
* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai)**: AI Review and AI Translate results are now shown from the beginning on subsequent runs. Previously, the scroll position was preserved.
* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai)**: Fixed AI Chat responses that ignored parts of content proposed by the AI model, for example when removing a paragraph instead of wrapping it in a block quote.
* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai)**: AI components now fall back to default styles when the `container.type: 'custom'` configuration option is used.
* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai)**: Wide content, such as tables, inside AI suggestions no longer overflows its container. The container is now horizontally scrollable.
* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai)**: Fixed a stray ellipsis (`…`) artifact that remained painted next to the rename input when editing a long chat name in the AI Chat history.
* **[comments](https://www.npmjs.com/package/@ckeditor/ckeditor5-comments)**: Fixed annotation ordering when creating a comment while the target text is scrolled out of view. Previously, the sidebar could break, and other annotations could flicker due to stale position data used for ordering.
* **[comments](https://www.npmjs.com/package/@ckeditor/ckeditor5-comments)**: Fixed a regression where the editor lost focus after resolving a comment thread from the narrow sidebar.
* **[comments](https://www.npmjs.com/package/@ckeditor/ckeditor5-comments)**: Pressing Tab to confirm a mention suggestion in a comment editor no longer shifts focus to the Submit/Reply button.
* **[editor-classic](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-classic)**: The classic editor no longer throws an unclear error when initialized with a source element that is not attached to the DOM. A dedicated `editor-source-element-not-attached` error is thrown instead. Closes [#20017](https://github.com/ckeditor/ckeditor5/issues/20017).
* **[email](https://www.npmjs.com/package/@ckeditor/ckeditor5-email)**: Preserved nested table alignment when exporting with inline styles.
* **[email](https://www.npmjs.com/package/@ckeditor/ckeditor5-email)**: Fixed table alignment handling for tables with and without text wrapping. This applies when the `table.tableLayout.stripFigureFromContentTable` option is set to `false` and the `PlainTableOutput` plugin is not included. Tables now keep their alignment, dimensions, and styling.
* **[email](https://www.npmjs.com/package/@ckeditor/ckeditor5-email)**: Fixed `figcaption` width and overflow issues in exported table figures. When exporting a table wrapped in a `figure`, its `figcaption` no longer receives an incorrect width and stays within the bounds of the exported element. Captions with `caption-side: top` are now positioned immediately before the table.
* **[emoji](https://www.npmjs.com/package/@ckeditor/ckeditor5-emoji)**: The emoji panel now renders on narrow screens. Closes [#18552](https://github.com/ckeditor/ckeditor5/issues/18552).
* **[engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine)**: Fixed the editing downcast order of adjacent marker UI boundaries so marker ends and starts are rendered consistently with the model and data output. Closes [#19975](https://github.com/ckeditor/ckeditor5/issues/19975).

  The editing pipeline now produces a deterministic marker order and preserves the expected boundary order when adjacent markers are added together or when the second adjacent marker is added later.
* **[engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine)**: Preserved formatting, such as bold or italic, after deleting content that empties a block so that typing continues with the same formatting. Closes [#10517](https://github.com/ckeditor/ckeditor5/issues/10517), [#19777](https://github.com/ckeditor/ckeditor5/issues/19777).
* **[fullscreen](https://www.npmjs.com/package/@ckeditor/ckeditor5-fullscreen)**: Fixed errors that could appear when maximizing the AI panel after leaving fullscreen mode. Closes [#20129](https://github.com/ckeditor/ckeditor5/issues/20129).
* **[horizontal-line](https://www.npmjs.com/package/@ckeditor/ckeditor5-horizontal-line)**: Horizontal lines (`<hr>`) placed next to each other no longer collapse their margins in the rendered output.
* **[html-support](https://www.npmjs.com/package/@ckeditor/ckeditor5-html-support)**: The definition list (`dl`) no longer breaks the structure of the list when it is placed within a list item. Closes [#20067](https://github.com/ckeditor/ckeditor5/issues/20067).
* **[list-multi-level](https://www.npmjs.com/package/@ckeditor/ckeditor5-list-multi-level)**: Fixed a stale multi-level list marker appearing on a block widget (e.g., a table) after a paragraph was inserted before it as the first block of the same list item.
* **[paste-from-office](https://www.npmjs.com/package/@ckeditor/ckeditor5-paste-from-office)**: Fixed incorrect structure of nested lists pasted from Word when plain paragraphs appear between nested list items. Closes [ckeditor/ckeditor5#19127](https://github.com/ckeditor/ckeditor5/issues/19127).

  Previously, all paragraphs were placed after the nested list items instead of between them. The fix also ensures that interrupted nested ordered lists continue numbering across the paragraph breaks.
* **[paste-from-office](https://www.npmjs.com/package/@ckeditor/ckeditor5-paste-from-office)**: Pasting content from Word no longer inserts unwanted visible bookmarks into the editor. Closes [#18846](https://github.com/ckeditor/ckeditor5/issues/18846).
* **[paste-from-office-enhanced](https://www.npmjs.com/package/@ckeditor/ckeditor5-paste-from-office-enhanced)**: When pasting from Excel, cells with patterned backgrounds now keep their colors.
* **[paste-from-office-enhanced](https://www.npmjs.com/package/@ckeditor/ckeditor5-paste-from-office-enhanced)**: When pasting bulleted lists from Word, the correct bullet style (disc, circle, square) is now preserved instead of defaulting to disc.
* **[real-time-collaboration](https://www.npmjs.com/package/@ckeditor/ckeditor5-real-time-collaboration)**: Fixed an error thrown when `editor.destroy()` was called right after `saveRevision()` in a real-time collaboration session.
* **[revision-history](https://www.npmjs.com/package/@ckeditor/ckeditor5-revision-history)**: Fixed revision history sidebar grouping for revisions from the same time period, such as the same year.
* **[slash-command](https://www.npmjs.com/package/@ckeditor/ckeditor5-slash-command)**: Slash commands no longer trigger inside code blocks, because code blocks are designed to contain plain, unformatted code where autocompletion is not applicable. Closes [ckeditor/ckeditor5#19146](https://github.com/ckeditor/ckeditor5/issues/19146).
* **[slash-command](https://www.npmjs.com/package/@ckeditor/ckeditor5-slash-command)**: Fixed translation of list item titles ("Bulleted List", "Numbered List", "To-do List") in the slash command panel by aligning translation keys with those defined in the list package.
* **[source-editing](https://www.npmjs.com/package/@ckeditor/ckeditor5-source-editing)**: Native undo/redo keystrokes now work in the source editing textarea. Closes [#13700](https://github.com/ckeditor/ckeditor5/issues/13700).
* **[table](https://www.npmjs.com/package/@ckeditor/ckeditor5-table)**: Improved how table cell alignment is loaded into the editor. Previously, applying alignment to a cell could force text alignment on all nested elements inside it. Now, alignment is applied to the direct contents of the cell without breaking the layout of deeper nested content. Closes [#19883](https://github.com/ckeditor/ckeditor5/issues/19883).
* **[ui](https://www.npmjs.com/package/@ckeditor/ckeditor5-ui)**: The menu bar no longer stays open after clicking the "Fullscreen mode" menu item when entering fullscreen mode. Closes [#20056](https://github.com/ckeditor/ckeditor5/issues/20056).
* **[uploadcare](https://www.npmjs.com/package/@ckeditor/ckeditor5-uploadcare)**: Fixed a build error affecting some TypeScript projects using Uploadcare integration. Closes [ckeditor/ckeditor5#19692](https://github.com/ckeditor/ckeditor5/issues/19692).
* **[uploadcare](https://www.npmjs.com/package/@ckeditor/ckeditor5-uploadcare)**: Uploadcare-uploaded images no longer render blurry when their natural width falls between the responsive `<source srcset>` breakpoints. The generated srcset now always includes a variant at the original (or cropped) image width as its largest entry, so the browser can serve a 1:1 pixel match instead of upscaling a smaller variant.

### Other changes

* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai)**: Updated the message displayed in AI Chat when you click the "Stop generating" button after sending a prompt.
* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai)**: Improved content streaming performance and rendering in AI Chat and AI Quick Actions.

  * AI Chat now displays individual suggestions only when they are ready and shows a skeleton loader while waiting for the next suggestion.
  * AI Chat and AI Quick Actions now use smooth scrolling.
  * AI Chat and AI Quick Actions now stream word-by-word responses faster.
* **[core](https://www.npmjs.com/package/@ckeditor/ckeditor5-core)**: Added the `RootConfig#description` configuration property. It lets integrations identify editor roots when using multiple editor instances on one page or a multi-root editor. Closes [#20119](https://github.com/ckeditor/ckeditor5/issues/20119).
* **[engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine)**: Added the `ViewDocument#getRoots()` method, a convenience accessor returning all view roots as an array (analogous to `ModelDocument#getRoots()`). Closes [#20097](https://github.com/ckeditor/ckeditor5/issues/20097).
* **[list](https://www.npmjs.com/package/@ckeditor/ckeditor5-list)**: Prevent list attributes from being applied to text nodes and inline objects during content insertion, which could crash the editor when a permissive `Schema#addAttributeCheck()` is used. Closes [#19994](https://github.com/ckeditor/ckeditor5/issues/19994).
* **[track-changes](https://www.npmjs.com/package/@ckeditor/ckeditor5-track-changes)**: Improved Track Changes performance for lists. Previously, the browser could freeze when many list suggestions were added to the document at once.

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

---

To see all releases, visit the [release page](https://github.com/ckeditor/ckeditor5/releases).
