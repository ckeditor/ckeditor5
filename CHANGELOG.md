Changelog
=========

## [49.1.0](https://github.com/ckeditor/ckeditor5/compare/v49.0.1...v49.1.0) (November 4, 2026)

We are happy to announce the release of CKEditor 5 v49.1.0.

### Release highlights

#### ⭐ Editing Toolkit

We are releasing [**Editing Toolkit**](https://ckeditor.com/docs/ckeditor5/latest/features/editing-toolkit/editing-toolkit-overview.html), a new group of features for developers building their own editing workflows.

Editing Toolkit grew out of our work on [CKEditor AI](https://ckeditor.com/docs/ckeditor5/latest/features/ai/ckeditor-ai-overview.html), an AI feature set for customers who want a plug-and-play solution for AI workflows. Turn it on, and you have an editor with AI features that keep humans in the loop.

But some teams want to build their own workflows rather than use ready-made AI features. Editing Toolkit gives them APIs to work with content in the editor. It consists of two parts:

* [**Compare**](https://ckeditor.com/docs/ckeditor5/latest/features/editing-toolkit/compare/editing-toolkit-comparing-documents.html): an editor API that lets you compare two versions of HTML content, then apply or suggest individual changes. You can also preview the changes before they land in the content.
* [**Coauthor**](https://ckeditor.com/docs/ckeditor5/latest/features/editing-toolkit/editing-toolkit-coauthor.html): think of it as MCP for CKEditor. It lets server-side agents draft content, suggest edits, or leave comments in the editor: [through ChatGPT or Claude](https://ckeditor.com/docs/ckeditor5/latest/features/editing-toolkit/use-cases/editing-toolkit-agent-apps.html), or as [background jobs](https://ckeditor.com/docs/ckeditor5/latest/features/editing-toolkit/use-cases/editing-toolkit-backend-agents.html). Coauthor is currently in early access, and if you would like to test it, [let us know](https://ckeditor.com/contact/).

Editing Toolkit is not limited to AI workflows. You can also use it in [strictly deterministic flows](https://ckeditor.com/docs/ckeditor5/latest/features/editing-toolkit/use-cases/editing-toolkit-deterministic-scripts.html) like manipulating content with code or comparing it with externally generated HTML, for example, HTML converted from an updated Word file.

#### Refreshed theme: restored variables and more design tokens

v49.0.0 silently ignored a few legacy CSS variables, although the [migration guide](https://ckeditor.com/docs/ckeditor5/latest/updating/guides/migration-to-refreshed-theme.html) said they still worked. `--ck-color-focus-border`, `--ck-drop-shadow`, and `--ck-color-annotation-wrapper-drop-shadow` now work again. If you customized focus borders or the shadows of dropdowns, balloons, menus, or comment and suggestion cards, your overrides take effect again with no changes on your side.

Many parts of the UI that used hard-coded values are now design tokens ([#20255](https://github.com/ckeditor/ckeditor5/issues/20255), [#20257](https://github.com/ckeditor/ckeditor5/issues/20257), [#20259](https://github.com/ckeditor/ckeditor5/issues/20259)). They include:

* button label and icon colors in the resting, hover, and active states,
* toolbar button borders and radius,
* form and dialog headers,
* the insert table grid,
* find and replace results.

New semantic roles cover subtle surfaces and borders, the dialog overlay, disabled inputs, placeholder text, and feedback backgrounds. Every new token defaults to the value used today, so the default theme looks the same. Buttons and inputs also use `--ck-font-family` everywhere now, including regions excluded from the UI reset ([#20258](https://github.com/ckeditor/ckeditor5/issues/20258)).

Smaller fixes to the refreshed theme: menu bar items no longer stick out of their panels on mobile phones, and the bookmark URL preview is no longer oversized. See the [theme customization guide](https://ckeditor.com/docs/ckeditor5/latest/framework/deep-dive/ui/theme-customization.html) for the full list of tokens.

#### Shadow DOM support for more features

The [CKBox](https://ckeditor.com/docs/ckeditor5/latest/features/file-management/ckbox.html) file manager and image editor, the "Edit source" dialog of enhanced source editing, and footnotes now work correctly when the editor renders in a shadow root.

Plugin authors get new helpers for events that do not cross a shadow boundary, such as `scroll`. `listenToEventRoots()` listens on the document and on every shadow root the editor lives in, and it follows those roots as they are added and removed. `DomTargetsListener` listens on a set of targets that you can refresh, for example the positioning target of a balloon. The editor's balloons, sticky toolbar, tooltips, and block toolbar use these helpers too. See the [Shadow DOM deep dive](https://ckeditor.com/docs/ckeditor5/latest/framework/deep-dive/shadow-dom.html).

#### More reliable balloons and toolbars

* Balloons such as tooltips, the link balloon, and the mention list appear in the right place on scrolled pages again when `<body>` or the overlay container is positioned. This was a regression in v49.0.0 ([#20251](https://github.com/ckeditor/ckeditor5/issues/20251)).
* The page no longer jumps back when you slowly scroll a classic editor out of view while a link or bookmark balloon is open.
* Picking a bookmark in the link form opened from the main toolbar no longer puts the balloon toolbar on top of the form.

#### Content and email fixes

* Browsers have started to parse `<?target data?>` markup as processing instruction nodes instead of comments, which made the editor throw an error while loading or pasting such content. The editor now ignores these nodes, the same way it ignores comments. Data processors have a new `skipProcessingInstructions` flag for integrations that need to keep them.
* Email integrations now convert `hsl()` and `hsla()` colors to `rgb()` and `rgba()` on export, because many email clients, including Outlook, do not support HSL. The new `transformEmailStylesColors()` transformation does this. It also means the default font and table color palettes no longer trigger color warnings in the email configuration logger.
* On iOS, you can now paste links copied with the "Copy" option of the Safari share sheet ([#2074](https://github.com/ckeditor/ckeditor5/issues/2074)). Thanks to [@dtdesign](https://github.com/dtdesign)!

### MINOR BREAKING CHANGES [ℹ️](https://ckeditor.com/docs/ckeditor5/latest/framework/guides/support/versioning-policy.html#major-and-minor-breaking-changes)

* **[collaboration-core](https://www.npmjs.com/package/@ckeditor/ckeditor5-collaboration-core), [comments](https://www.npmjs.com/package/@ckeditor/ckeditor5-comments)**: Focused comments and suggestions are now marked with a focus ring instead of a background color. The `--ck-comment-focus-background-color` and `--ck-suggestion-box-focus-background-color` CSS variables have been removed. To style the focus ring, use the new `--ck-comment-focus-border-color`, `--ck-comment-focus-shadow`, `--ck-suggestion-box-focus-border-color`, and `--ck-suggestion-box-focus-shadow` CSS variables.
* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai)**: The `AIEditorConfig` type describing the editor configuration snapshot has been renamed to `AIEditorConfigSnapshot`. The `AIEditorConfig` name now refers to the new plugin that produces the snapshot and registers custom features. If you used the `AIEditorConfig` type (for example, to type `DocumentCompareSnapshot#editorConfig` or `AIEditingDocumentData#editorConfig`), replace it with `AIEditorConfigSnapshot`.
* **[comments](https://www.npmjs.com/package/@ckeditor/ckeditor5-comments)**: The default `CommentThreadView` no longer renders the comment thread header, and the `BaseCommentThreadView#commentThreadHeaderView` property is deprecated. Customizations of the header, such as buttons added to it or styles for the `.ck-thread__header` and `.ck-context` CSS classes, no longer apply. The reopen button is now available in the first comment as `CommentThreadView#reopenButton`. If you need the header, add `commentThreadHeaderView` to the template of your custom comment thread view.
* **[comments](https://www.npmjs.com/package/@ckeditor/ckeditor5-comments)**: The `--ck-comment-input-padding` CSS variable now sets only the padding of the comment field container, not the padding inside the comment field. If you used it to change the padding inside the comment field, use the new `--ck-comment-input-field-padding` CSS variable instead.
* **[revision-history](https://www.npmjs.com/package/@ckeditor/ckeditor5-revision-history)**: Some Revision History CSS variables now style different parts of the refreshed sidebar:

  * `--ck-revision-history-sidebar-revision-vertical-spacing` sets only the spacing between revisions. Use the new `--ck-revision-history-sidebar-time-period-vertical-spacing` for the spacing between the time period groups.
  * `--ck-revision-history-revision-border-color` sets the whole card border. `--ck-revision-history-revision-selected-border-color` and `--ck-revision-history-revision-highlighted-border-color` set the vertical line that marks the selected and the compared revisions.
  * The time period labels no longer use the inverse text color. If you changed their background with `--ck-revision-history-sidebar-period-background-color`, set their text color with the new `--ck-revision-history-sidebar-period-text-color`.
  * `--ck-revision-history-revision-highlighted-hover-background-color` no longer has an effect, because the actions button of a compared revision uses the default button hover background.
* **[utils](https://www.npmjs.com/package/@ckeditor/ckeditor5-utils)**: The DOM event passed to the `listenToShadowRoots()` callback is now typed after the `event` option, the same way as in `DomEmitter#listenTo()`, instead of `any`. A TypeScript callback that declares a narrower DOM event type than the one of the event it listens to no longer compiles. Declare the matching DOM event type, or narrow it inside the callback.

### Features

* **[document-outline](https://www.npmjs.com/package/@ckeditor/ckeditor5-document-outline), [footnotes](https://www.npmjs.com/package/@ckeditor/ckeditor5-footnotes), [merge-fields](https://www.npmjs.com/package/@ckeditor/ckeditor5-merge-fields), [pagination](https://www.npmjs.com/package/@ckeditor/ckeditor5-pagination), [real-time-collaboration](https://www.npmjs.com/package/@ckeditor/ckeditor5-real-time-collaboration), [revision-history](https://www.npmjs.com/package/@ckeditor/ckeditor5-revision-history), [slash-command](https://www.npmjs.com/package/@ckeditor/ckeditor5-slash-command), [source-editing-enhanced](https://www.npmjs.com/package/@ckeditor/ckeditor5-source-editing-enhanced), [template](https://www.npmjs.com/package/@ckeditor/ckeditor5-template), [uploadcare](https://www.npmjs.com/package/@ckeditor/ckeditor5-uploadcare)**: The document outline, table of contents, footnotes, revision history, merge fields, Uploadcare, pagination, presence list, templates, and slash command features expose new CSS custom properties for their colors, sizes, and spacing, and several of their defaults now follow the semantic theme roles. Every new property defaults to the current value, so the default theme renders unchanged.

  * Document outline: the active item follows the semantic accent text color (`--ck-color-text-accent`), and the hover text color has a new name (`--ck-document-outline-item-hover-text-color`). The legacy `--ck-document-outline-item-hover-state-color` keeps working.
  * Table of contents and footnotes: the widget label text color (`--ck-table-of-contents-label-text-color`, `--ck-footnotes-widget-label-text-color`). The label backgrounds follow the semantic secondary text color, and the table of contents background follows the subtle surface (`--ck-color-surface-subtle`).
  * Revision history: the selected revision border follows the semantic accent border color (`--ck-color-border-accent`), and the actions button of the selected revision has its own text color at rest and on hover (`--ck-revision-history-revision-selected-actions-text-color`, `--ck-revision-history-revision-selected-actions-hover-text-color`).
  * Merge fields: component-first names for the colors (`--ck-merge-fields-outline-color`, `--ck-merge-fields-value-outline-color`, `--ck-merge-fields-with-warning-outline-color`, `--ck-merge-fields-block-outline-color`, `--ck-merge-fields-affix-text-color`, `--ck-merge-fields-form-error-background-color`), the label and preview badge backgrounds (`--ck-merge-fields-label-background-color`, `--ck-merge-fields-preview-badge-background-color`), and the affix font (`--ck-merge-fields-affix-font-family`). The legacy `--ck-color-merge-fields-*` names keep working.
  * Uploadcare: the widget font size, font family, radius, padding, text and border colors (`--ck-uploadcare-font-size`, `--ck-uploadcare-font-family`, `--ck-uploadcare-border-radius`, `--ck-uploadcare-padding`, `--ck-uploadcare-text-color`, `--ck-uploadcare-secondary-text-color`, `--ck-uploadcare-muted-text-color`, `--ck-uploadcare-border-color`), and suffix-convention names for the form colors (`--ck-uploadcare-form-image-background-color`, `--ck-uploadcare-form-error-icon-color`, `--ck-uploadcare-form-skeleton-background-color`). The legacy `--ck-uploadcare-color-*` names keep working. The widget font now follows the editor UI font (`--ck-font-family`), so overriding the editor font also changes the Uploadcare widget.
  * Pagination: the page number label text color (`--ck-pagination-label-text-color`).
  * Presence list: the avatar border and users counter colors (`--ck-presence-list-avatar-border-color`, `--ck-presence-list-counter-border-color`, `--ck-presence-list-counter-background-color`, `--ck-presence-list-counter-text-color`) can now be set on `:root` (or `:host` in a shadow root). The avatar border follows the subtle surface. These properties are now override points only: because the counter colors depend on the avatar color of each user, their defaults are applied where they are used, so reading them with `var()` in your own CSS returns nothing unless you set them.
  * Templates: the description text color (`--ck-template-description-text-color`). The template title and description now follow the button text color.
  * Slash command: the icon chip text color, background, and radius (`--ck-slash-command-icon-text-color`, `--ck-slash-command-icon-background-color`, `--ck-slash-command-icon-border-radius`).
* **[basic-styles](https://www.npmjs.com/package/@ckeditor/ckeditor5-basic-styles), [block-quote](https://www.npmjs.com/package/@ckeditor/ckeditor5-block-quote), [code-block](https://www.npmjs.com/package/@ckeditor/ckeditor5-code-block), [horizontal-line](https://www.npmjs.com/package/@ckeditor/ckeditor5-horizontal-line), [image](https://www.npmjs.com/package/@ckeditor/ckeditor5-image), [list](https://www.npmjs.com/package/@ckeditor/ckeditor5-list), [mention](https://www.npmjs.com/package/@ckeditor/ckeditor5-mention), [page-break](https://www.npmjs.com/package/@ckeditor/ckeditor5-page-break), [table](https://www.npmjs.com/package/@ckeditor/ckeditor5-table)**: The block quote border, code block, inline code, horizontal line, page break, table borders and header, and to-do list checkmarks in the content expose `--ck-content-*` CSS custom properties, so the content rendered inside `.ck-content` can be restyled on `:root` (or `:host` in a shadow root) without overriding element rules. Every new property defaults to the current value, so the default theme renders unchanged. The table caption, image caption, and mention color properties were renamed to follow the current naming convention (for example `--ck-content-table-caption-background-color`), and the former `--ck-content-color-*` names keep working as fallbacks on `:root` (or `:host` in a shadow root) and in scoped selectors. Closes [#20253](https://github.com/ckeditor/ckeditor5/issues/20253).
* **[ckbox](https://www.npmjs.com/package/@ckeditor/ckeditor5-ckbox), [fullscreen](https://www.npmjs.com/package/@ckeditor/ckeditor5-fullscreen), [html-embed](https://www.npmjs.com/package/@ckeditor/ckeditor5-html-embed), [html-support](https://www.npmjs.com/package/@ckeditor/ckeditor5-html-support), [media-embed](https://www.npmjs.com/package/@ckeditor/ckeditor5-media-embed), [style](https://www.npmjs.com/package/@ckeditor/ckeditor5-style), [ui](https://www.npmjs.com/package/@ckeditor/ckeditor5-ui), [widget](https://www.npmjs.com/package/@ckeditor/ckeditor5-widget)**: New semantic color roles cover design intents that had no shared token, so they can be restyled once on `:root` (or `:host` in a shadow root) instead of per component. The components that read the new roles keep their current colors, so the default theme renders unchanged. Closes [#20259](https://github.com/ckeditor/ckeditor5/issues/20259).

  * `--ck-color-surface-subtle`: a muted panel or placeholder surface. The fullscreen layout, HTML embed, HTML object embed, media embed placeholder, and the disabled style in the style grid now read it instead of the foundation `--ck-color-base-foreground`.
  * `--ck-color-border-subtle`: a light border. The blurred widget outline now reads it.
  * `--ck-color-surface-overlay`: the scrim behind modal dialogs, read by `--ck-dialog-overlay-background-color`.
  * `--ck-color-surface-skeleton` and `--ck-color-surface-skeleton-highlight`: the loading shimmer, read by the CKBox image processing placeholder.
  * `--ck-color-interactive-disabled-surface`: the background of a disabled input.
  * `--ck-color-text-placeholder`: the editing area placeholder text, read through `--ck-color-engine-placeholder-text`.
  * `--ck-color-feedback-error-surface`, `--ck-color-feedback-success-surface`, and `--ck-color-feedback-warning-surface`: light, translucent backgrounds for messages and fields in a feedback state, available for custom components (no built-in component reads them yet).

  The focus border color (`--ck-focus-border-color`) now derives from `--ck-color-base-focus`, so changing the foundation focus color also moves the focus border. The labeled field and labeled input error text now read `--ck-color-text-error`. Both resolve to the same values as before.
* **[code-block](https://www.npmjs.com/package/@ckeditor/ckeditor5-code-block), [find-and-replace](https://www.npmjs.com/package/@ckeditor/ckeditor5-find-and-replace), [heading](https://www.npmjs.com/package/@ckeditor/ckeditor5-heading), [style](https://www.npmjs.com/package/@ckeditor/ckeditor5-style), [table](https://www.npmjs.com/package/@ckeditor/ckeditor5-table), [ui](https://www.npmjs.com/package/@ckeditor/ckeditor5-ui)**: Toolbars, form and dialog headers, dropdowns, split buttons, lists, tab buttons, the insert table grid, the heading dropdown, find and replace, code blocks, and the style grid expose new CSS custom properties that can be restyled on `:root` (or `:host` in a shadow root). Every new property defaults to the current value, so the default theme renders unchanged. Closes [#20257](https://github.com/ckeditor/ckeditor5/issues/20257).

  * Toolbar: the border and radius of the toolbar's own buttons in every toolbar (`--ck-toolbar-button-border`, `--ck-toolbar-button-border-radius`), including compact toolbars, toolbars in dropdown panels, and open dropdown and split buttons in toolbars, and the separator width (`--ck-toolbar-separator-width`). The button tokens do not reach lists in dropdown panels.
  * Form header and dialog header: the background and the text color of the label, the header icon, and the header buttons, such as the dialog close button (`--ck-form-header-background`, `--ck-form-header-text-color`, `--ck-dialog-header-background`).
  * Dropdown: the gap between the label and the arrow (`--ck-dropdown-arrow-gap`). The open dropdown button radius (`--ck-dropdown-panel-uniform-button-border-radius`) now defaults to `--ck-button-border-radius`.
  * Split button and list: the separator width and height (`--ck-split-button-separator-width`, `--ck-list-separator-height`).
  * List item button: the text color and hover background of a toggleable item in the "on" state (`--ck-list-item-button-on-text-color`, `--ck-list-item-button-on-hover-background`).
  * Tab button: the focus border color and the label color of the active tab (`--ck-tab-button-focus-border-color`, `--ck-tab-button-active-text-color`).
  * Insert table grid: the cell border, and the background and border of selected cells and of the cell under the pointer (`--ck-insert-table-dropdown-box-border-color`, `--ck-insert-table-dropdown-box-on-background`, `--ck-insert-table-dropdown-box-on-border-color`, `--ck-insert-table-dropdown-box-hover-background`, `--ck-insert-table-dropdown-box-hover-border-color`).
  * Heading dropdown: the label width and the list item minimum width (`--ck-heading-dropdown-label-width`, `--ck-heading-dropdown-list-item-min-width`).
  * Find and replace: the result and selected result background and text color (`--ck-find-result-background`, `--ck-find-result-text-color`, `--ck-find-result-selected-background`, `--ck-find-result-selected-text-color`). The legacy `--ck-color-find-result-selected` keeps working.
  * Code block: the language label background and text color (`--ck-code-block-label-background`, `--ck-code-block-label-text-color`). The legacy `--ck-color-code-block-label-background` keeps working.
  * Style grid: the border of the selected style and of the selected style under the pointer (`--ck-style-panel-button-on-border-color`, `--ck-style-panel-button-on-hover-border-color`).
* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai), [collaboration-core](https://www.npmjs.com/package/@ckeditor/ckeditor5-collaboration-core), [comments](https://www.npmjs.com/package/@ckeditor/ckeditor5-comments), [real-time-collaboration](https://www.npmjs.com/package/@ckeditor/ckeditor5-real-time-collaboration)**: The user marker tooltip text color and the background around the comment reply field are now themable through `--ck-user-marker-tooltip-text-color` and `--ck-comment-input-container-background-color`, and the border of format suggestions in the sidebar follows the semantic `--ck-color-border-accent` role. The AI tabs overlay follows the dialog layer (`--ck-layer-dialog`), so it stays right below dialogs when that layer changes.
* **[collaboration-core](https://www.npmjs.com/package/@ckeditor/ckeditor5-collaboration-core), [comments](https://www.npmjs.com/package/@ckeditor/ckeditor5-comments), [revision-history](https://www.npmjs.com/package/@ckeditor/ckeditor5-revision-history)**: The suggestion and comment markers, the annotation type bar, pills, user avatars, and the confirmation view expose new CSS custom properties for their line width and style, colors, and sizes. Every new property defaults to the current value, so the default theme renders unchanged.

  * Suggestion markers: the line width (`--ck-suggestion-marker-border-width`, also used by the added and removed roots in the revision viewer), the line style per change type (`--ck-suggestion-marker-insertion-border-style`, `--ck-suggestion-marker-deletion-border-style`, `--ck-suggestion-marker-format-border-style`), the deletion strikethrough thickness (`--ck-suggestion-marker-deletion-stroke-thickness`), and the gap color next to the block format bar (`--ck-suggestion-marker-format-gap-color`, `--ck-suggestion-marker-format-code-gap-color`).
  * Comment markers: the line width and style (`--ck-comment-marker-border-width`, `--ck-comment-marker-border-style`), and the border color of text and widget markers and of the active marker (`--ck-comment-marker-border-color`, `--ck-comment-marker-active-border-color`). The active border color falls back to the resting one on text markers.
  * Annotation type bar: the line style (`--ck-annotation-type-border-style`).
  * Color swatch in suggestion descriptions: the size and ring color (`--ck-suggestion-color-swatch-size`, `--ck-suggestion-color-swatch-border-color`).
  * Pill: the text color (`--ck-pill-text-color`). The legacy `--ck-pill-color` keeps working. The resting pill background now reads the base hover color directly, so overriding the semantic `--ck-color-interactive-hover-surface` no longer recolors pills. To restyle them, use `--ck-pill-background`.
  * User avatar: the background behind avatar images (`--ck-user-avatar-image-background-color`).
  * Confirmation view: the background (`--ck-confirm-view-background-color`). The legacy `--ck-color-light-red` keeps working.
* **[style](https://www.npmjs.com/package/@ckeditor/ckeditor5-style), [table](https://www.npmjs.com/package/@ckeditor/ckeditor5-table), [ui](https://www.npmjs.com/package/@ckeditor/ckeditor5-ui)**: Two new semantic color roles cover accent-colored parts drawn on the canvas: `--ck-color-text-accent` for text and icons, and `--ck-color-border-accent` for borders and thin lines. They are separate from `--ck-color-interactive-primary-surface`, which is a fill. A dark theme can now give these parts a lighter accent that reads well on a dark canvas, while the filled action buttons keep the primary surface color. Both roles default to `--ck-color-base-active`, so the default theme renders unchanged. Closes [#20261](https://github.com/ckeditor/ckeditor5/issues/20261).

  The outline button label and border (`--ck-button-outline-color`) and the active tab icon and indicator bar (`--ck-tab-button-active-icon-color`) now read `--ck-color-text-accent`. The border of a toggled-on surface button (`--ck-button-surface-border-color`), the border of the selected style in the style panel, and the hovered table column resizer read `--ck-color-border-accent`. `--ck-color-interactive-selected-text` now follows `--ck-color-text-accent` by default.
* **[ui](https://www.npmjs.com/package/@ckeditor/ckeditor5-ui), [utils](https://www.npmjs.com/package/@ckeditor/ckeditor5-utils)**: Introduced helpers for listening to DOM events on both the document and the shadow roots a node lives in. Events that are not composed, such as `scroll`, never cross a shadow boundary, so a listener on `document` alone misses them.

  * The new `listenToEventRoots()` helper listens to the document and to every shadow root tracked by a `ShadowRootRegistry`, and follows the registry as these roots come and go.
  * The new `DomTargetsListener` class listens to a set of DOM event targets that can be updated with its `refresh()` method. Together with the new `getEventRoots()` helper, it covers particular elements, such as the positioning target of a balloon.
  * `ShadowRootRegistry` now also reports the documents of its registered nodes through `getEventRoots()` and fires the `changeEventRoots` event when they change.

  The balloon panel, sticky panel, tooltip manager, and block toolbar now use these helpers instead of their own listener syncing code.
* **[collaboration-core](https://www.npmjs.com/package/@ckeditor/ckeditor5-collaboration-core), [comments](https://www.npmjs.com/package/@ckeditor/ckeditor5-comments)**: The comments and annotations UI now follows the shared theme tokens, and its buttons, avatars, cards, focus shadows, commented excerpt, and narrow sidebar counter expose new CSS custom properties. Every new property defaults to the current value, so the default theme renders unchanged, with one exception: while its menu is open, the comment options button now shows the regular "on" button colors, like other toggled buttons in the editor.

  * Buttons in annotations and below the comment field now follow the shared button tokens, for example `--ck-button-default-text-color` and its hover state, and `--ck-button-action-text-color` for the Reply button. The legacy `--ck-annotation-icon-color` keeps setting the default color of the buttons in annotations (not the buttons below the comment field or in the comment menu), and it wins over `--ck-button-default-text-color` there.
  * Annotation avatars: the size (`--ck-annotation-user-avatar-size`).
  * Annotation card: the border (`--ck-annotation-wrapper-border`), and the border and shadow of the active card (`--ck-annotation-wrapper-active-border`, `--ck-annotation-wrapper-active-shadow`). The active card border falls back to the resting one. The card background now defaults to the semantic container surface.
  * Comment threads and suggestions: the focus shadow (`--ck-thread-focus-shadow`, `--ck-suggestion-wrapper-focus-shadow`).
  * Commented excerpt: the text color (`--ck-comment-context-text-color`).
  * Narrow sidebar counter: the badge text color (`--ck-annotation-counter-badge-text-color`).
  * The documented `--ck-comment-count-color` CSS custom property now takes effect.
* **[editor-classic](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-classic), [ui](https://www.npmjs.com/package/@ckeditor/ckeditor5-ui)**: The background of the editing area can be themed on `:root` (or `:host` in a shadow root) with the new `--ck-editor-editable-background` CSS custom property. It reaches the main editing roots of every editor type, not nested editables or secondary editors, and is read through the `background` shorthand, so it also accepts gradients and images.
* **[table](https://www.npmjs.com/package/@ckeditor/ckeditor5-table), [ui](https://www.npmjs.com/package/@ckeditor/ckeditor5-ui)**: The resting shadow of the classic editor toolbar area, the shadow of the selected insert table grid cell under the pointer, and the inner start border width of the split button arrow can be themed on `:root` (or `:host` in a shadow root) with the new `--ck-sticky-panel-content-shadow`, `--ck-insert-table-dropdown-box-hover-shadow`, and `--ck-split-button-arrow-border-inline-start-width` CSS custom properties. Every new property defaults to the current look.
* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai)**: Custom editor plugins can now be registered with the AI agent using the new `AIEditorConfig` plugin (`AIEditorConfig#add()` method), so that the agent can produce and preserve their content.
* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai)**: Introduced the Editing Toolkit: APIs and standalone UI components to compare two versions of a document, present them through an interactive UI, and apply the differences to the editor directly or as Track Changes suggestions.
* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai)**: AI Chat now scrolls the feed to the next pending change after a proposed change is accepted, suggested, or rejected.
* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai)**: The editor configuration that AI features send to the AI service now reports whether the restricted editing mode is enabled, along with the commands allowed in it.
* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai)**: After deciding on a change in AI Chat, the preview balloon automatically shows the next pending one or closes if all changes have already been decided on.
* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai)**: The AI features now follow the semantic theme roles, so a theme that restyles the editor through `:root` tokens (for example the primary, selected, and feedback colors, the text and border roles, and the subtle surface) also restyles the AI UI. The AI toggle and the Quick Actions toolbar buttons also follow the shared button state tokens (`--ck-button-on-background-color`, `--ck-button-on-hover-background-color`, `--ck-button-on-active-background-color`, `--ck-button-on-disabled-background-color`, `--ck-button-on-text-color`, `--ck-button-default-hover-background-color`). The default theme renders unchanged.

  The AI tabs panel background (`--ck-tabs-panels-container-background`) now accepts gradients. New override points: the capability icon background in the AI chat feed (`--ck-ai-chat-feed-interaction-header-capabilities-icon-background-color`), the AI chat disclaimer divider color (`--ck-ai-chat-disclaimer-divider-color`), and the inset of the add context button (`--ck-ai-chat-context-controls-add-context-button-inset-block-end`). The active AI tab background (`--ck-ai-tab-active-surface-color`) now takes effect. The AI borders and dividers follow the border width roles (`--ck-border-width-surface`, `--ck-border-width-divider`), and the dimmed content of resolved suggestions has its own opacity (`--ck-ai-suggestion-resolved-opacity`).
* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai)**: AI Review now shows a summary of the accepted and dismissed changes once the last change is decided, and scrolls the list back to the top to show it.
* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai)**: The AI features have their own theme tokens for more interactive states. The default look stays the same. New tokens:

  * Chat history items: `--ck-ai-chat-history-item-hover-background-color`, `--ck-ai-chat-history-item-active-background-color`, `--ck-ai-chat-history-item-edit-background-color`.
  * AI Review check tiles: `--ck-ai-review-check-list-item-hover-shadow`, `--ck-ai-review-check-list-item-selected-shadow`, `--ck-ai-review-check-list-item-selected-icon-color`.
  * AI Translate results: `--ck-ai-translate-check-run-result-hover-shadow`, `--ck-ai-translate-check-run-result-active-border-color`, `--ck-ai-translate-check-run-result-active-shadow`.
  * Web source chips: `--ck-ai-chat-web-source-hover-background-color`, `--ck-ai-chat-web-source-focus-shadow`.
  * Chat shortcuts: `--ck-ai-chat-shortcuts-shortcut-icon-hover-color`, `--ck-ai-chat-shortcuts-shortcut-active-background-color`.
  * Maximized AI tabs resize button: `--ck-ai-tabs-resize-button-on-background-color`.

  The AI Review tile shadow now follows `--ck-shadow-surface-raised`, and the chat prompt highlight ends on the input focus style.
* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai)**: After making a decision about a proposed change in AI Chat and the Editing Toolkit, or about a change in AI Review, the decided change now shows the "Accepted" or "Rejected" label for a moment before the view moves on to the next one. You can change how long this pause lasts, or turn it off with `0`, with the `config.ai.review.autoAdvanceDelay` and `config.ai.chat.autoAdvanceDelay` configuration options and the `autoAdvanceDelay` option of the Editing Toolkit `createController()` method.
* **[ckbox](https://www.npmjs.com/package/@ckeditor/ckeditor5-ckbox)**: The CKBox file manager and image editor dialogs now work when the editor is rendered in a Shadow DOM.
* **[comments](https://www.npmjs.com/package/@ckeditor/ckeditor5-comments)**: You can now set the text color of annotation content, for example suggestion descriptions, using the new `--ck-annotation-content-font-color` CSS custom property. By default, it follows the `--ck-comment-content-font-color` value.
* **[email](https://www.npmjs.com/package/@ckeditor/ckeditor5-email)**: Introduced the `transformEmailStylesColors()` transformation that converts `hsl()` and `hsla()` colors to `rgb()` and `rgba()` in the exported email content, as many email clients (for example, Outlook) do not support the HSL notation.

  Since `hsl()` colors are now safe to use in emails, the email configuration logger no longer reports the `email-configuration-unsupported-color-value` and `email-configuration-unsupported-color-format` warnings for `hsl()` colors and the `hsl` color picker format, including the default font and table color palettes. These warnings are still reported for `hsla()` colors.
* **[emoji](https://www.npmjs.com/package/@ckeditor/ckeditor5-emoji)**: Introduced the `config.emoji.definitions` option that allows passing the emoji database directly to the editor instead of downloading it from a URL. See [ckeditor/ckeditor5#18116](https://github.com/ckeditor/ckeditor5/issues/18116).

  Use it to bundle the database with your application, for example, when the Content Security Policy of the page does not allow downloading it. When the option is set, the `config.emoji.definitionsUrl` and `config.emoji.version` options are ignored. The `EmojiCdnResource` type was renamed to `EmojiDefinition`. The old name is still available but deprecated.
* **[ui](https://www.npmjs.com/package/@ckeditor/ckeditor5-ui)**: Dialogs can now use the new `--ck-width-dialog-xs`, `--ck-width-dialog-sm`, and `--ck-width-dialog-xl` CSS variables, which set their width to the `xs`, `sm`, and `2xl` steps of the width scale and cap it at `90vw`.
* **[ui](https://www.npmjs.com/package/@ckeditor/ckeditor5-ui)**: The spread of the focus shadow can now be changed with the new `--ck-focus-shadow-spread` CSS variable, which `--ck-focus-shadow-geometry` is built from.
* **[ui](https://www.npmjs.com/package/@ckeditor/ckeditor5-ui)**: The input field now has a small variant that you can enable with the `ck-input_small` CSS class. You can customize its size with the new `--ck-input-min-height-small` and `--ck-input-padding-small` CSS variables.
* **[ui](https://www.npmjs.com/package/@ckeditor/ckeditor5-ui)**: Buttons, list item buttons, split buttons, tab buttons, and the menu bar expose their interactive states (hover, active, open, and toggled on) as CSS custom properties that can be restyled on `:root` (or `:host` in a shadow root) without class-level overrides. Every new property defaults to the current value, so the default theme renders unchanged. Closes [#20255](https://github.com/ckeditor/ckeditor5/issues/20255).

  * Button: the resting, hover, and active label and icon color (`--ck-button-default-text-color`, `--ck-button-default-hover-text-color`, `--ck-button-default-active-text-color`; hover and active fall back to the resting color), and the border split into `--ck-button-border-width`, `--ck-button-border-style`, and `--ck-button-border-color`.
  * Surface and outline button variants: the `--ck-button-surface-*` and `--ck-button-outline-*` tokens are declared on `:root` instead of on the variant button, plus the new `--ck-button-outline-border-color`.
  * List item button: the resting and hover label color (`--ck-list-item-button-text-color`, `--ck-list-item-button-hover-text-color`) and the background of an open item, for example an open menu (`--ck-list-item-button-open-background`).
  * Split button: the hover background and border color, the focus border color, and the arrow border width (`--ck-split-button-hover-background`, `--ck-split-button-hover-border-color`, `--ck-split-button-focus-border-color`, `--ck-split-button-arrow-border-block-width`).
  * Tab button: the hover background of an inactive tab (`--ck-tab-button-hover-background`).
  * Menu bar: the background (`--ck-menu-bar-background`).
* **[ui](https://www.npmjs.com/package/@ckeditor/ckeditor5-ui)**: A new `--ck-shadow-surface-raised` semantic role covers the shadow of in-flow surfaces that lift on hover, such as cards. It defaults to `--ck-shadow-lg`, so the default theme renders unchanged.
* **[ui](https://www.npmjs.com/package/@ckeditor/ckeditor5-ui)**: Open list item buttons, for example open menus in the menu bar and in dropdown menus, can be fully themed from `:root` with the new `--ck-list-item-button-open-hover-background` and `--ck-list-item-button-open-text-color` CSS custom properties, next to `--ck-list-item-button-open-background`. The open hover background falls back to the open background, so two properties style the open state with and without the pointer.

### Bug fixes

* **[editor-classic](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-classic), [fullscreen](https://www.npmjs.com/package/@ckeditor/ckeditor5-fullscreen), [link](https://www.npmjs.com/package/@ckeditor/ckeditor5-link), [special-characters](https://www.npmjs.com/package/@ckeditor/ckeditor5-special-characters), [style](https://www.npmjs.com/package/@ckeditor/ckeditor5-style), [table](https://www.npmjs.com/package/@ckeditor/ckeditor5-table), [ui](https://www.npmjs.com/package/@ckeditor/ckeditor5-ui)**: Theme token overrides now reach a few UI parts that ignored them:

  * The classic editor editing area border and the fullscreen page follow `--ck-editor-frame-border-color` and `--ck-editor-editable-background`. A theme that sets `--ck-color-border-container` or `--ck-color-surface-canvas` to a custom value also changes them.
  * The style grid buttons follow `--ck-color-surface-canvas` on hover and press, and their backgrounds can be set with `--ck-style-panel-button-hover-background`, `--ck-style-panel-button-active-background`, and `--ck-style-panel-button-disabled-background`.
  * The table properties error balloon follows the error and inverse text roles: `--ck-table-properties-error-background` and `--ck-table-properties-error-text-color`.
  * Declared tokens with the current defaults for colors that had only a raw fallback: the color grid check icon (`--ck-color-grid-check-icon-color`), the blurred editing area selection (`--ck-editor-editable-blurred-selection-background`), the accessibility help dialog (`--ck-accessibility-help-dialog-code-background-color`, `--ck-accessibility-help-dialog-kbd-shadow-color`, and `--ck-accessibility-help-dialog-border-color`, which falls back to `--ck-color-divider`), and the linked image badge (`--ck-link-image-indicator-background-color`).
* **[engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine), [html-support](https://www.npmjs.com/package/@ckeditor/ckeditor5-html-support), [paste-from-office](https://www.npmjs.com/package/@ckeditor/ckeditor5-paste-from-office), [utils](https://www.npmjs.com/package/@ckeditor/ckeditor5-utils)**: Processing instructions in the input data no longer cause an error during conversion.

  Browsers have started parsing `<?target data?>` markup in HTML into processing instruction nodes rather than comments. Such nodes are now ignored by default, consistently with how comments have always been handled. Data processors expose a new `skipProcessingInstructions` flag for integrations that need to preserve them.
* **[ckbox](https://www.npmjs.com/package/@ckeditor/ckeditor5-ckbox), [emoji](https://www.npmjs.com/package/@ckeditor/ckeditor5-emoji), [mention](https://www.npmjs.com/package/@ckeditor/ckeditor5-mention), [ui](https://www.npmjs.com/package/@ckeditor/ckeditor5-ui)**: Dialogs, and the mention list, the emoji picker, and CKBox shown above them, now follow the `--ck-layer-dialog` CSS custom property instead of reading the legacy `--ck-z-dialog` directly, so raising the dialog layer moves them together. Set `--ck-z-dialog` or `--ck-layer-dialog` on `:root` (or `:host` in a shadow root), or override `--ck-layer-dialog` on a narrower selector: a scoped override of the legacy `--ck-z-dialog` no longer applies. The selected item in lists now reads the `--ck-color-interactive-primary-surface` fill role instead of a text role. It looks the same in the default theme, but now follows the primary color (`--ck-color-base-action`) rather than the accent text color, so lightening `--ck-color-text-accent` for contrast no longer lightens its background.
* **[revision-history](https://www.npmjs.com/package/@ckeditor/ckeditor5-revision-history), [source-editing-enhanced](https://www.npmjs.com/package/@ckeditor/ckeditor5-source-editing-enhanced), [uploadcare](https://www.npmjs.com/package/@ckeditor/ckeditor5-uploadcare)**: The revision history sidebar header lines up with the editor toolbar again, and the Uploadcare buttons have the same height as the other editor buttons. They, and the enhanced source editing dialog, now read the editor control height (`--ck-size-control-min-height`) instead of a legacy size that no longer matched it.
* **[bookmark](https://www.npmjs.com/package/@ckeditor/ckeditor5-bookmark), [html-support](https://www.npmjs.com/package/@ckeditor/ckeditor5-html-support), [ui](https://www.npmjs.com/package/@ckeditor/ckeditor5-ui)**: The `--ck-font-weight-ui-default` CSS custom property now sets the font weight of regular UI text. The UI reset, the bookmark toolbar preview, and the General HTML Support object widget label read it instead of a hardcoded `normal` weight.
* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai), [comments](https://www.npmjs.com/package/@ckeditor/ckeditor5-comments)**: Restored support for the legacy `--ck-color-annotation-wrapper-drop-shadow` CSS variable. Comment and suggestion cards use it for their shadow again. Focused inline comment threads use `--ck-drop-shadow` for their shadow again.

  The `--ck-tabs-border-radius` CSS variable of the AI tabs now also works when set on a parent element.
* **[source-editing](https://www.npmjs.com/package/@ckeditor/ckeditor5-source-editing), [ui](https://www.npmjs.com/package/@ckeditor/ckeditor5-ui)**: Restored support for the legacy `--ck-color-focus-border` and `--ck-drop-shadow` CSS variables. Buttons, inputs, the editing area, and menu bar items use `--ck-color-focus-border` for their focus border again. Dropdowns, balloons, and menus use `--ck-drop-shadow` for their shadow again.

  Overriding `--ck-interactive-focus-ring` now also changes the focus border of the source editing area. The pulse around the buttons that insert a paragraph next to a widget now matches the refreshed focus color.
* **[collaboration-core](https://www.npmjs.com/package/@ckeditor/ckeditor5-collaboration-core), [track-changes](https://www.npmjs.com/package/@ckeditor/ckeditor5-track-changes)**: The "AI-generated" pill in the suggestion annotations now has more space above it.
* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai), [revision-history](https://www.npmjs.com/package/@ckeditor/ckeditor5-revision-history)**: The AI review check list item descriptions and the revision change author follow the `--ck-font-weight-ui-default` CSS custom property instead of a hardcoded regular weight.
* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai)**: The AI Review navigation panel is now hidden when the change it shows becomes outdated, for example, after another user removes the content the change was suggested for.
* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai)**: The review results navigation bar's width is now aligned with the width of the text inside the editor.
* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai)**: The AI Translate languages list now leaves space below the last language, matching the AI Review list.
* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai)**: Fixed several styling issues in the AI UI:

  * The AI Quick Actions search field no longer overflows its panel with a larger control font size.
  * The AI error notification dismiss button and the AI Review info button have the intended small size again.
  * The add context button in the AI chat prompt is aligned with the input at any control height.
  * The toolbar buttons of an AI suggestion show their pressed state, and disabled toolbar buttons no longer get the hover color.
  * The error message in the AI balloon follows the theme radius instead of a fixed 4px.
* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai)**: Items in the AI Quick Actions dropdown and its sub-menus now show the focus ring when focused with the keyboard.
* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai)**: The icons of the AI header buttons follow `--ck-form-header-text-color` when it is set on `:root`, so they match the header label. `--ck-ai-header-icon-color` still overrides them.
* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai)**: The buttons at the bottom of the AI Chat and AI Quick Actions balloons no longer stick out of the balloon when the editor is narrow. When the buttons do not fit, you can scroll them horizontally instead.
* **[bookmark](https://www.npmjs.com/package/@ckeditor/ckeditor5-bookmark)**: The URL preview in the bookmark toolbar is no longer oversized. It now uses the regular UI control font size instead of inheriting the larger page font size.
* **[clipboard](https://www.npmjs.com/package/@ckeditor/ckeditor5-clipboard)**: Links copied using the "Copy" option in the iOS Safari share sheet can now be pasted into the editor. When the clipboard provides neither HTML nor plain text, the editor now uses the `text/uri-list` data and inserts the links as plain text. Closes [#2074](https://github.com/ckeditor/ckeditor5/issues/2074).

  Thanks to [@dtdesign](https://github.com/dtdesign).
* **[collaboration-core](https://www.npmjs.com/package/@ckeditor/ckeditor5-collaboration-core)**: When the annotation type bar is turned on (`--ck-annotation-type-border-width`), the thread header (in thread views that render it) now shows the insertion, deletion, or format color of a suggestion, like the rest of the thread, instead of the comment color. The bar of a block format suggestion now shows when the collaboration content styles are loaded without the editor UI styles.
* **[comments](https://www.npmjs.com/package/@ckeditor/ckeditor5-comments)**: The commented text quoted in the first comment of a comment thread now fills the available width of the annotations sidebar and stays on a single line in narrow sidebars.
* **[comments](https://www.npmjs.com/package/@ckeditor/ckeditor5-comments)**: The initials in the default avatars of comments, suggestions, and the comment reply field now fit inside the avatar, including wide initials such as "WW".
* **[comments](https://www.npmjs.com/package/@ckeditor/ckeditor5-comments)**: Replies and the reply field in suggestions displayed inline or in the narrow sidebar now look the same as in comment threads.
* **[emoji](https://www.npmjs.com/package/@ckeditor/ckeditor5-emoji)**: Selecting an emoji category that does not contain any emoji in the emoji picker no longer throws an error. The picker now displays a message that the category is empty.
* **[export-inline-styles](https://www.npmjs.com/package/@ckeditor/ckeditor5-export-inline-styles)**: Exporting content with inline styles no longer loses parts of the `border` shorthand defined with CSS variables, for example, the border style of table cells from the default content styles. CSS variables are now resolved before shorthand properties are processed.
* **[find-and-replace](https://www.npmjs.com/package/@ckeditor/ckeditor5-find-and-replace)**: The results counter in the find and replace form no longer covers the end of the search text, and it uses the search field font size instead of the larger base UI font size. The counter font size can be themed on `:root` (or `:host` in a shadow root) with the new `--ck-find-and-replace-form-results-counter-font-size` CSS custom property.
* **[footnotes](https://www.npmjs.com/package/@ckeditor/ckeditor5-footnotes)**: Footnote content no longer wraps below the backlink when the editor is rendered inside a shadow root or on a page without a global `box-sizing: border-box` reset.
* **[link](https://www.npmjs.com/package/@ckeditor/ckeditor5-link)**: Choosing a link from a links provider list in the link form (for example, a bookmark) or going back from that list no longer displays the balloon toolbar on top of the link form. The link form with the chosen link filled in is now displayed as expected.
* **[real-time-collaboration](https://www.npmjs.com/package/@ckeditor/ckeditor5-real-time-collaboration)**: Fixed handling of revision updates made by other users while the revision history is loading.

  Such updates could previously throw an error, be dropped, duplicate a revision, or leave it without its authors. They are now applied once the initial revisions and the users they reference are loaded.
* **[real-time-collaboration](https://www.npmjs.com/package/@ckeditor/ckeditor5-real-time-collaboration)**: Comment changes made by other users while comments are loading are no longer lost.

  New comment threads, replies, and other comment changes received while the initial comments were loading (also after a reconnection) could previously be dropped or throw an error. They are now applied once the initial comments and the users they reference are loaded.
* **[real-time-collaboration](https://www.npmjs.com/package/@ckeditor/ckeditor5-real-time-collaboration)**: Suggestion attribute changes made by other users while suggestions are loading are no longer lost. They are now applied once the initial suggestions are loaded.
* **[revision-history](https://www.npmjs.com/package/@ckeditor/ckeditor5-revision-history)**: The Revision History sidebar now follows the direction of the editor UI language, including right-to-left languages.
* **[source-editing-enhanced](https://www.npmjs.com/package/@ckeditor/ckeditor5-source-editing-enhanced)**: The code editor in the "Edit source" dialog now receives its styles when the editor UI is rendered inside a shadow root (for example, when `config.ui.overlayContainer` points to a shadow root). Previously, the code editor styles were added to the main document instead, which left the code editor unstyled.
* **[template](https://www.npmjs.com/package/@ckeditor/ckeditor5-template)**: Template list buttons keep their rounded corners when `--ck-border-radius-uniform` is set to `initial`, and no longer follow a custom uniform radius. Their radius is controlled by the new `--ck-template-list-item-border-radius` CSS custom property, which defaults to `--ck-border-radius-surface`.
* **[ui](https://www.npmjs.com/package/@ckeditor/ckeditor5-ui)**: Fixed menu bar items sticking out of their menu panels on narrow viewports, such as most mobile phones. The larger default font size of the refreshed theme made the minimum width of the items exceed the maximum width of the panel.

  The `--ck-menu-bar-menu-item-min-width` CSS variable now sets the minimum width of the whole menu panel and is capped by its maximum width. You can customize the maximum width with the new `--ck-menu-bar-panel-max-width` CSS variable (`75vw` by default).
* **[ui](https://www.npmjs.com/package/@ckeditor/ckeditor5-ui)**: The page no longer scrolls back when slowly scrolling the classic editor out of the viewport while a contextual balloon, such as the link or bookmark balloon, is open. The sticky toolbar now returns to its regular position before notifying about the change of its sticky state.
* **[ui](https://www.npmjs.com/package/@ckeditor/ckeditor5-ui)**: Pressing <kbd>Esc</kbd> while a tooltip of the focused toolbar button is visible now moves the focus back to the editing area with a single key press. Previously, the first press only hid the tooltip. Tooltips displayed on mouse hover can still be dismissed with <kbd>Esc</kbd> without triggering other actions. Closes [#18333](https://github.com/ckeditor/ckeditor5/issues/18333).

  Thanks to [@minwookshin](https://github.com/minwookshin).
* **[ui](https://www.npmjs.com/package/@ckeditor/ckeditor5-ui)**: UI buttons and inputs now use the editor UI font (`--ck-font-family`) everywhere. Before, controls rendered outside the reset styles, for example inside regions excluded from the UI reset, fell back to the browser's default font, so a theme could not change their font through tokens. Closes [#20258](https://github.com/ckeditor/ckeditor5/issues/20258).
* **[ui](https://www.npmjs.com/package/@ckeditor/ckeditor5-ui)**: Border colors of inputs, dropdown panels, balloon panels, toolbars, and autocomplete results set on a narrower selector than `:root` now apply again, under both the legacy and the new token names. Their border shorthand tokens can still be overridden, but they no longer hold a value you can read. To use these borders in your own CSS, read their border color tokens instead.
* **[ui](https://www.npmjs.com/package/@ckeditor/ckeditor5-ui)**: Dropdown panels, dropdown menu panels, autocomplete results, the color selector, and list dropdown items now follow `--ck-border-radius-surface` set on `:root` (or `:host`), because `--ck-border-radius-uniform` derives from it. Override `--ck-border-radius-uniform` to set them apart.
* **[utils](https://www.npmjs.com/package/@ckeditor/ckeditor5-utils)**: Balloons, such as tooltips, the link balloon, or the mention list, are no longer displaced by the page scroll when the `<body>` element or the overlay container is positioned. The `Rect#toAbsoluteRect()` method no longer counts the page scroll twice when the element has a positioned ancestor. Closes [#20251](https://github.com/ckeditor/ckeditor5/issues/20251).
* **[utils](https://www.npmjs.com/package/@ckeditor/ckeditor5-utils)**: The `collectStylesheets()` helper no longer fails when collecting the editor content styles with the `EDITOR_STYLES` token in Safari after a modal dialog has been opened in the editor.

  Safari lists style sheets created by scripts, such as the one that blocks page scrolling while a modal dialog is open, in `document.styleSheets`. These style sheets are not attached to any element and caused an error. They are now skipped.
* **[widget](https://www.npmjs.com/package/@ckeditor/ckeditor5-widget)**: The buttons for inserting a paragraph next to a widget now use a dedicated theme token for their icon color in the blurred-editor state, so customizing the widget outline color no longer unintentionally recolors them.

### Other changes

* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai), [comments](https://www.npmjs.com/package/@ckeditor/ckeditor5-comments)**: The comment field, comment editing field, and chat renaming field in AI Chat History now have visible borders and display a focus ring when focused. The buttons below the comment field are smaller.
* **[comments](https://www.npmjs.com/package/@ckeditor/ckeditor5-comments)**: Comment threads in the comments archive now match the refreshed look of comment annotations, with the commented content quoted in the first comment instead of a thread header.
* **[real-time-collaboration](https://www.npmjs.com/package/@ckeditor/ckeditor5-real-time-collaboration)**: Real-time collaboration editors now start faster.

  The initial comments, suggestions and revisions are now fetched in parallel during the editor initialization, followed by a single request for the users they reference, instead of one feature after another.
* **[revision-history](https://www.npmjs.com/package/@ckeditor/ckeditor5-revision-history)**: Revision History sidebar cards now match the refreshed editor UI. Revision names are edited in a bordered field with "Save" and "Cancel" buttons instead of saving on focus loss, and "Name this revision" is now the first revision action and no longer changes the revision displayed in the viewer.
* **[typing](https://www.npmjs.com/package/@ckeditor/ckeditor5-typing)**: The `delete` event fired when pressing <kbd>Backspace</kbd> at the beginning of an editing root or a nested editable now has the view document as its source instead of the global DOM document.
* **[uploadcare](https://www.npmjs.com/package/@ckeditor/ckeditor5-uploadcare)**: The loading shimmer of an image being processed in Uploadcare image editing now reads the semantic `--ck-color-surface-skeleton` and `--ck-color-surface-skeleton-highlight` colors, which resolve to the same values as before. Restyling the skeleton surface once on `:root` (or `:host` in a shadow root) now also reaches it. See [ckeditor/ckeditor5#20259](https://github.com/ckeditor/ckeditor5/issues/20259).
* The development environment for CKEditor 5 now requires Node v26.10.

### Released packages

Check out the [Versioning policy](https://ckeditor.com/docs/ckeditor5/latest/framework/guides/support/versioning-policy.html) guide for more information.

<details>
<summary>Released packages (summary)</summary>

Minor releases (contain minor breaking changes):

* [@ckeditor/ckeditor5-collaboration-core](https://www.npmjs.com/package/@ckeditor/ckeditor5-collaboration-core/v/49.1.0): v49.0.1 => v49.1.0
* [@ckeditor/ckeditor5-comments](https://www.npmjs.com/package/@ckeditor/ckeditor5-comments/v/49.1.0): v49.0.1 => v49.1.0
* [@ckeditor/ckeditor5-ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai/v/49.1.0): v49.0.1 => v49.1.0
* [@ckeditor/ckeditor5-revision-history](https://www.npmjs.com/package/@ckeditor/ckeditor5-revision-history/v/49.1.0): v49.0.1 => v49.1.0
* [@ckeditor/ckeditor5-utils](https://www.npmjs.com/package/@ckeditor/ckeditor5-utils/v/49.1.0): v49.0.1 => v49.1.0

Releases containing new features:

* [@ckeditor/ckeditor5-document-outline](https://www.npmjs.com/package/@ckeditor/ckeditor5-document-outline/v/49.1.0): v49.0.1 => v49.1.0
* [@ckeditor/ckeditor5-footnotes](https://www.npmjs.com/package/@ckeditor/ckeditor5-footnotes/v/49.1.0): v49.0.1 => v49.1.0
* [@ckeditor/ckeditor5-merge-fields](https://www.npmjs.com/package/@ckeditor/ckeditor5-merge-fields/v/49.1.0): v49.0.1 => v49.1.0
* [@ckeditor/ckeditor5-pagination](https://www.npmjs.com/package/@ckeditor/ckeditor5-pagination/v/49.1.0): v49.0.1 => v49.1.0
* [@ckeditor/ckeditor5-real-time-collaboration](https://www.npmjs.com/package/@ckeditor/ckeditor5-real-time-collaboration/v/49.1.0): v49.0.1 => v49.1.0
* [@ckeditor/ckeditor5-slash-command](https://www.npmjs.com/package/@ckeditor/ckeditor5-slash-command/v/49.1.0): v49.0.1 => v49.1.0
* [@ckeditor/ckeditor5-source-editing-enhanced](https://www.npmjs.com/package/@ckeditor/ckeditor5-source-editing-enhanced/v/49.1.0): v49.0.1 => v49.1.0
* [@ckeditor/ckeditor5-template](https://www.npmjs.com/package/@ckeditor/ckeditor5-template/v/49.1.0): v49.0.1 => v49.1.0
* [@ckeditor/ckeditor5-uploadcare](https://www.npmjs.com/package/@ckeditor/ckeditor5-uploadcare/v/49.1.0): v49.0.1 => v49.1.0
* [@ckeditor/ckeditor5-basic-styles](https://www.npmjs.com/package/@ckeditor/ckeditor5-basic-styles/v/49.1.0): v49.0.1 => v49.1.0
* [@ckeditor/ckeditor5-block-quote](https://www.npmjs.com/package/@ckeditor/ckeditor5-block-quote/v/49.1.0): v49.0.1 => v49.1.0
* [@ckeditor/ckeditor5-code-block](https://www.npmjs.com/package/@ckeditor/ckeditor5-code-block/v/49.1.0): v49.0.1 => v49.1.0
* [@ckeditor/ckeditor5-horizontal-line](https://www.npmjs.com/package/@ckeditor/ckeditor5-horizontal-line/v/49.1.0): v49.0.1 => v49.1.0
* [@ckeditor/ckeditor5-image](https://www.npmjs.com/package/@ckeditor/ckeditor5-image/v/49.1.0): v49.0.1 => v49.1.0
* [@ckeditor/ckeditor5-list](https://www.npmjs.com/package/@ckeditor/ckeditor5-list/v/49.1.0): v49.0.1 => v49.1.0
* [@ckeditor/ckeditor5-mention](https://www.npmjs.com/package/@ckeditor/ckeditor5-mention/v/49.1.0): v49.0.1 => v49.1.0
* [@ckeditor/ckeditor5-page-break](https://www.npmjs.com/package/@ckeditor/ckeditor5-page-break/v/49.1.0): v49.0.1 => v49.1.0
* [@ckeditor/ckeditor5-table](https://www.npmjs.com/package/@ckeditor/ckeditor5-table/v/49.1.0): v49.0.1 => v49.1.0
* [@ckeditor/ckeditor5-ckbox](https://www.npmjs.com/package/@ckeditor/ckeditor5-ckbox/v/49.1.0): v49.0.1 => v49.1.0
* [@ckeditor/ckeditor5-fullscreen](https://www.npmjs.com/package/@ckeditor/ckeditor5-fullscreen/v/49.1.0): v49.0.1 => v49.1.0
* [@ckeditor/ckeditor5-html-embed](https://www.npmjs.com/package/@ckeditor/ckeditor5-html-embed/v/49.1.0): v49.0.1 => v49.1.0
* [@ckeditor/ckeditor5-html-support](https://www.npmjs.com/package/@ckeditor/ckeditor5-html-support/v/49.1.0): v49.0.1 => v49.1.0
* [@ckeditor/ckeditor5-media-embed](https://www.npmjs.com/package/@ckeditor/ckeditor5-media-embed/v/49.1.0): v49.0.1 => v49.1.0
* [@ckeditor/ckeditor5-style](https://www.npmjs.com/package/@ckeditor/ckeditor5-style/v/49.1.0): v49.0.1 => v49.1.0
* [@ckeditor/ckeditor5-ui](https://www.npmjs.com/package/@ckeditor/ckeditor5-ui/v/49.1.0): v49.0.1 => v49.1.0
* [@ckeditor/ckeditor5-widget](https://www.npmjs.com/package/@ckeditor/ckeditor5-widget/v/49.1.0): v49.0.1 => v49.1.0
* [@ckeditor/ckeditor5-find-and-replace](https://www.npmjs.com/package/@ckeditor/ckeditor5-find-and-replace/v/49.1.0): v49.0.1 => v49.1.0
* [@ckeditor/ckeditor5-heading](https://www.npmjs.com/package/@ckeditor/ckeditor5-heading/v/49.1.0): v49.0.1 => v49.1.0
* [@ckeditor/ckeditor5-editor-classic](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-classic/v/49.1.0): v49.0.1 => v49.1.0
* [@ckeditor/ckeditor5-email](https://www.npmjs.com/package/@ckeditor/ckeditor5-email/v/49.1.0): v49.0.1 => v49.1.0
* [@ckeditor/ckeditor5-emoji](https://www.npmjs.com/package/@ckeditor/ckeditor5-emoji/v/49.1.0): v49.0.1 => v49.1.0

Other releases:

* [@ckeditor/ckeditor5-adapter-ckfinder](https://www.npmjs.com/package/@ckeditor/ckeditor5-adapter-ckfinder/v/49.1.0): v49.0.1 => v49.1.0
* [@ckeditor/ckeditor5-alignment](https://www.npmjs.com/package/@ckeditor/ckeditor5-alignment/v/49.1.0): v49.0.1 => v49.1.0
* [@ckeditor/ckeditor5-autoformat](https://www.npmjs.com/package/@ckeditor/ckeditor5-autoformat/v/49.1.0): v49.0.1 => v49.1.0
* [@ckeditor/ckeditor5-autosave](https://www.npmjs.com/package/@ckeditor/ckeditor5-autosave/v/49.1.0): v49.0.1 => v49.1.0
* [@ckeditor/ckeditor5-bookmark](https://www.npmjs.com/package/@ckeditor/ckeditor5-bookmark/v/49.1.0): v49.0.1 => v49.1.0
* [@ckeditor/ckeditor5-case-change](https://www.npmjs.com/package/@ckeditor/ckeditor5-case-change/v/49.1.0): v49.0.1 => v49.1.0
* [@ckeditor/ckeditor5-ckfinder](https://www.npmjs.com/package/@ckeditor/ckeditor5-ckfinder/v/49.1.0): v49.0.1 => v49.1.0
* [@ckeditor/ckeditor5-clipboard](https://www.npmjs.com/package/@ckeditor/ckeditor5-clipboard/v/49.1.0): v49.0.1 => v49.1.0
* [@ckeditor/ckeditor5-cloud-services](https://www.npmjs.com/package/@ckeditor/ckeditor5-cloud-services/v/49.1.0): v49.0.1 => v49.1.0
* [@ckeditor/ckeditor5-core](https://www.npmjs.com/package/@ckeditor/ckeditor5-core/v/49.1.0): v49.0.1 => v49.1.0
* [@ckeditor/ckeditor5-easy-image](https://www.npmjs.com/package/@ckeditor/ckeditor5-easy-image/v/49.1.0): v49.0.1 => v49.1.0
* [@ckeditor/ckeditor5-editor-balloon](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-balloon/v/49.1.0): v49.0.1 => v49.1.0
* [@ckeditor/ckeditor5-editor-decoupled](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-decoupled/v/49.1.0): v49.0.1 => v49.1.0
* [@ckeditor/ckeditor5-editor-inline](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-inline/v/49.1.0): v49.0.1 => v49.1.0
* [@ckeditor/ckeditor5-editor-multi-root](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-multi-root/v/49.1.0): v49.0.1 => v49.1.0
* [@ckeditor/ckeditor5-engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine/v/49.1.0): v49.0.1 => v49.1.0
* [@ckeditor/ckeditor5-enter](https://www.npmjs.com/package/@ckeditor/ckeditor5-enter/v/49.1.0): v49.0.1 => v49.1.0
* [@ckeditor/ckeditor5-essentials](https://www.npmjs.com/package/@ckeditor/ckeditor5-essentials/v/49.1.0): v49.0.1 => v49.1.0
* [@ckeditor/ckeditor5-export-inline-styles](https://www.npmjs.com/package/@ckeditor/ckeditor5-export-inline-styles/v/49.1.0): v49.0.1 => v49.1.0
* [@ckeditor/ckeditor5-export-pdf](https://www.npmjs.com/package/@ckeditor/ckeditor5-export-pdf/v/49.1.0): v49.0.1 => v49.1.0
* [@ckeditor/ckeditor5-export-word](https://www.npmjs.com/package/@ckeditor/ckeditor5-export-word/v/49.1.0): v49.0.1 => v49.1.0
* [@ckeditor/ckeditor5-font](https://www.npmjs.com/package/@ckeditor/ckeditor5-font/v/49.1.0): v49.0.1 => v49.1.0
* [@ckeditor/ckeditor5-format-painter](https://www.npmjs.com/package/@ckeditor/ckeditor5-format-painter/v/49.1.0): v49.0.1 => v49.1.0
* [@ckeditor/ckeditor5-highlight](https://www.npmjs.com/package/@ckeditor/ckeditor5-highlight/v/49.1.0): v49.0.1 => v49.1.0
* [@ckeditor/ckeditor5-icons](https://www.npmjs.com/package/@ckeditor/ckeditor5-icons/v/49.1.0): v49.0.1 => v49.1.0
* [@ckeditor/ckeditor5-import-word](https://www.npmjs.com/package/@ckeditor/ckeditor5-import-word/v/49.1.0): v49.0.1 => v49.1.0
* [@ckeditor/ckeditor5-indent](https://www.npmjs.com/package/@ckeditor/ckeditor5-indent/v/49.1.0): v49.0.1 => v49.1.0
* [@ckeditor/ckeditor5-language](https://www.npmjs.com/package/@ckeditor/ckeditor5-language/v/49.1.0): v49.0.1 => v49.1.0
* [@ckeditor/ckeditor5-line-height](https://www.npmjs.com/package/@ckeditor/ckeditor5-line-height/v/49.1.0): v49.0.1 => v49.1.0
* [@ckeditor/ckeditor5-link](https://www.npmjs.com/package/@ckeditor/ckeditor5-link/v/49.1.0): v49.0.1 => v49.1.0
* [@ckeditor/ckeditor5-list-multi-level](https://www.npmjs.com/package/@ckeditor/ckeditor5-list-multi-level/v/49.1.0): v49.0.1 => v49.1.0
* [@ckeditor/ckeditor5-markdown-gfm](https://www.npmjs.com/package/@ckeditor/ckeditor5-markdown-gfm/v/49.1.0): v49.0.1 => v49.1.0
* [@ckeditor/ckeditor5-minimap](https://www.npmjs.com/package/@ckeditor/ckeditor5-minimap/v/49.1.0): v49.0.1 => v49.1.0
* [@ckeditor/ckeditor5-operations-compressor](https://www.npmjs.com/package/@ckeditor/ckeditor5-operations-compressor/v/49.1.0): v49.0.1 => v49.1.0
* [@ckeditor/ckeditor5-paragraph](https://www.npmjs.com/package/@ckeditor/ckeditor5-paragraph/v/49.1.0): v49.0.1 => v49.1.0
* [@ckeditor/ckeditor5-paste-from-office](https://www.npmjs.com/package/@ckeditor/ckeditor5-paste-from-office/v/49.1.0): v49.0.1 => v49.1.0
* [@ckeditor/ckeditor5-paste-from-office-enhanced](https://www.npmjs.com/package/@ckeditor/ckeditor5-paste-from-office-enhanced/v/49.1.0): v49.0.1 => v49.1.0
* [@ckeditor/ckeditor5-remove-format](https://www.npmjs.com/package/@ckeditor/ckeditor5-remove-format/v/49.1.0): v49.0.1 => v49.1.0
* [@ckeditor/ckeditor5-restricted-editing](https://www.npmjs.com/package/@ckeditor/ckeditor5-restricted-editing/v/49.1.0): v49.0.1 => v49.1.0
* [@ckeditor/ckeditor5-select-all](https://www.npmjs.com/package/@ckeditor/ckeditor5-select-all/v/49.1.0): v49.0.1 => v49.1.0
* [@ckeditor/ckeditor5-show-blocks](https://www.npmjs.com/package/@ckeditor/ckeditor5-show-blocks/v/49.1.0): v49.0.1 => v49.1.0
* [@ckeditor/ckeditor5-source-editing](https://www.npmjs.com/package/@ckeditor/ckeditor5-source-editing/v/49.1.0): v49.0.1 => v49.1.0
* [@ckeditor/ckeditor5-special-characters](https://www.npmjs.com/package/@ckeditor/ckeditor5-special-characters/v/49.1.0): v49.0.1 => v49.1.0
* [@ckeditor/ckeditor5-track-changes](https://www.npmjs.com/package/@ckeditor/ckeditor5-track-changes/v/49.1.0): v49.0.1 => v49.1.0
* [@ckeditor/ckeditor5-typing](https://www.npmjs.com/package/@ckeditor/ckeditor5-typing/v/49.1.0): v49.0.1 => v49.1.0
* [@ckeditor/ckeditor5-undo](https://www.npmjs.com/package/@ckeditor/ckeditor5-undo/v/49.1.0): v49.0.1 => v49.1.0
* [@ckeditor/ckeditor5-upload](https://www.npmjs.com/package/@ckeditor/ckeditor5-upload/v/49.1.0): v49.0.1 => v49.1.0
* [@ckeditor/ckeditor5-word-count](https://www.npmjs.com/package/@ckeditor/ckeditor5-word-count/v/49.1.0): v49.0.1 => v49.1.0
* [ckeditor5](https://www.npmjs.com/package/ckeditor5/v/49.1.0): v49.0.1 => v49.1.0
* [ckeditor5-premium-features](https://www.npmjs.com/package/ckeditor5-premium-features/v/49.1.0): v49.0.1 => v49.1.0
</details>


## [49.0.1](https://github.com/ckeditor/ckeditor5/compare/v49.0.0...v49.0.1) (October 27, 2026)

CKEditor 5 v49.0.1 is now available.

### Release highlights

This release addresses three cross-site scripting (XSS) vulnerabilities, two in the Track Changes plugin and one in CKEditor AI. Under specific conditions, described below, each of them could lead to unauthorized JavaScript code execution.

The first vulnerability ([`GHSA-2x29-fwvw-5g7x`](https://github.com/ckeditor/ckeditor5/security/advisories/GHSA-2x29-fwvw-5g7x)) can be triggered by inserting a specially crafted suggestion into the editor. It affects only installations where [Track Changes](https://ckeditor.com/docs/ckeditor5/latest/features/collaboration/track-changes/track-changes.html) is enabled together with a feature that allows assigning a color or background color to an element, such as the Font Color or Font Background Color plugins.

The second vulnerability ([`GHSA-xh7q-269v-94j2`](https://github.com/ckeditor/ckeditor5/security/advisories/GHSA-xh7q-269v-94j2)) affects the "Preview final content" feature of Track Changes and can be triggered when the final content preview is displayed. It applies only to installations that use a plugin allowing unsafe markup in the editor data output, such as General HTML Support with a non-default configuration or HTML Embed.

The third vulnerability ([`GHSA-vjh8-qw64-q282`](https://github.com/ckeditor/ckeditor5/security/advisories/GHSA-vjh8-qw64-q282)) can be triggered by inserting a specially crafted message into the CKEditor AI chat. It affects only installations where [CKEditor AI](https://ckeditor.com/docs/ckeditor5/latest/features/ai/ckeditor-ai-overview.html) is enabled, and exploitation requires tricking the model into returning specific output, for example through prompt injection.

You can read more details in the relevant security advisories and [contact us](mailto:security@cksource.com) if you have more questions.

We would like to thank Won Yong Jeon for reporting these vulnerabilities.

### Other changes

* **[track-changes](https://www.npmjs.com/package/@ckeditor/ckeditor5-track-changes)**: The final content preview now renders the content using the editing pipeline instead of the data pipeline, so the preview looks and behaves like the content in the read-only editor.

### Released packages

Check out the [Versioning policy](https://ckeditor.com/docs/ckeditor5/latest/framework/guides/support/versioning-policy.html) guide for more information.

<details>
<summary>Released packages (summary)</summary>

Other releases:

* [@ckeditor/ckeditor5-adapter-ckfinder](https://www.npmjs.com/package/@ckeditor/ckeditor5-adapter-ckfinder/v/49.0.1): v49.0.0 => v49.0.1
* [@ckeditor/ckeditor5-ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai/v/49.0.1): v49.0.0 => v49.0.1
* [@ckeditor/ckeditor5-alignment](https://www.npmjs.com/package/@ckeditor/ckeditor5-alignment/v/49.0.1): v49.0.0 => v49.0.1
* [@ckeditor/ckeditor5-autoformat](https://www.npmjs.com/package/@ckeditor/ckeditor5-autoformat/v/49.0.1): v49.0.0 => v49.0.1
* [@ckeditor/ckeditor5-autosave](https://www.npmjs.com/package/@ckeditor/ckeditor5-autosave/v/49.0.1): v49.0.0 => v49.0.1
* [@ckeditor/ckeditor5-basic-styles](https://www.npmjs.com/package/@ckeditor/ckeditor5-basic-styles/v/49.0.1): v49.0.0 => v49.0.1
* [@ckeditor/ckeditor5-block-quote](https://www.npmjs.com/package/@ckeditor/ckeditor5-block-quote/v/49.0.1): v49.0.0 => v49.0.1
* [@ckeditor/ckeditor5-bookmark](https://www.npmjs.com/package/@ckeditor/ckeditor5-bookmark/v/49.0.1): v49.0.0 => v49.0.1
* [@ckeditor/ckeditor5-case-change](https://www.npmjs.com/package/@ckeditor/ckeditor5-case-change/v/49.0.1): v49.0.0 => v49.0.1
* [@ckeditor/ckeditor5-ckbox](https://www.npmjs.com/package/@ckeditor/ckeditor5-ckbox/v/49.0.1): v49.0.0 => v49.0.1
* [@ckeditor/ckeditor5-ckfinder](https://www.npmjs.com/package/@ckeditor/ckeditor5-ckfinder/v/49.0.1): v49.0.0 => v49.0.1
* [@ckeditor/ckeditor5-clipboard](https://www.npmjs.com/package/@ckeditor/ckeditor5-clipboard/v/49.0.1): v49.0.0 => v49.0.1
* [@ckeditor/ckeditor5-cloud-services](https://www.npmjs.com/package/@ckeditor/ckeditor5-cloud-services/v/49.0.1): v49.0.0 => v49.0.1
* [@ckeditor/ckeditor5-code-block](https://www.npmjs.com/package/@ckeditor/ckeditor5-code-block/v/49.0.1): v49.0.0 => v49.0.1
* [@ckeditor/ckeditor5-collaboration-core](https://www.npmjs.com/package/@ckeditor/ckeditor5-collaboration-core/v/49.0.1): v49.0.0 => v49.0.1
* [@ckeditor/ckeditor5-comments](https://www.npmjs.com/package/@ckeditor/ckeditor5-comments/v/49.0.1): v49.0.0 => v49.0.1
* [@ckeditor/ckeditor5-core](https://www.npmjs.com/package/@ckeditor/ckeditor5-core/v/49.0.1): v49.0.0 => v49.0.1
* [@ckeditor/ckeditor5-document-outline](https://www.npmjs.com/package/@ckeditor/ckeditor5-document-outline/v/49.0.1): v49.0.0 => v49.0.1
* [@ckeditor/ckeditor5-easy-image](https://www.npmjs.com/package/@ckeditor/ckeditor5-easy-image/v/49.0.1): v49.0.0 => v49.0.1
* [@ckeditor/ckeditor5-editor-balloon](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-balloon/v/49.0.1): v49.0.0 => v49.0.1
* [@ckeditor/ckeditor5-editor-classic](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-classic/v/49.0.1): v49.0.0 => v49.0.1
* [@ckeditor/ckeditor5-editor-decoupled](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-decoupled/v/49.0.1): v49.0.0 => v49.0.1
* [@ckeditor/ckeditor5-editor-inline](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-inline/v/49.0.1): v49.0.0 => v49.0.1
* [@ckeditor/ckeditor5-editor-multi-root](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-multi-root/v/49.0.1): v49.0.0 => v49.0.1
* [@ckeditor/ckeditor5-email](https://www.npmjs.com/package/@ckeditor/ckeditor5-email/v/49.0.1): v49.0.0 => v49.0.1
* [@ckeditor/ckeditor5-emoji](https://www.npmjs.com/package/@ckeditor/ckeditor5-emoji/v/49.0.1): v49.0.0 => v49.0.1
* [@ckeditor/ckeditor5-engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine/v/49.0.1): v49.0.0 => v49.0.1
* [@ckeditor/ckeditor5-enter](https://www.npmjs.com/package/@ckeditor/ckeditor5-enter/v/49.0.1): v49.0.0 => v49.0.1
* [@ckeditor/ckeditor5-essentials](https://www.npmjs.com/package/@ckeditor/ckeditor5-essentials/v/49.0.1): v49.0.0 => v49.0.1
* [@ckeditor/ckeditor5-export-inline-styles](https://www.npmjs.com/package/@ckeditor/ckeditor5-export-inline-styles/v/49.0.1): v49.0.0 => v49.0.1
* [@ckeditor/ckeditor5-export-pdf](https://www.npmjs.com/package/@ckeditor/ckeditor5-export-pdf/v/49.0.1): v49.0.0 => v49.0.1
* [@ckeditor/ckeditor5-export-word](https://www.npmjs.com/package/@ckeditor/ckeditor5-export-word/v/49.0.1): v49.0.0 => v49.0.1
* [@ckeditor/ckeditor5-find-and-replace](https://www.npmjs.com/package/@ckeditor/ckeditor5-find-and-replace/v/49.0.1): v49.0.0 => v49.0.1
* [@ckeditor/ckeditor5-font](https://www.npmjs.com/package/@ckeditor/ckeditor5-font/v/49.0.1): v49.0.0 => v49.0.1
* [@ckeditor/ckeditor5-footnotes](https://www.npmjs.com/package/@ckeditor/ckeditor5-footnotes/v/49.0.1): v49.0.0 => v49.0.1
* [@ckeditor/ckeditor5-format-painter](https://www.npmjs.com/package/@ckeditor/ckeditor5-format-painter/v/49.0.1): v49.0.0 => v49.0.1
* [@ckeditor/ckeditor5-fullscreen](https://www.npmjs.com/package/@ckeditor/ckeditor5-fullscreen/v/49.0.1): v49.0.0 => v49.0.1
* [@ckeditor/ckeditor5-heading](https://www.npmjs.com/package/@ckeditor/ckeditor5-heading/v/49.0.1): v49.0.0 => v49.0.1
* [@ckeditor/ckeditor5-highlight](https://www.npmjs.com/package/@ckeditor/ckeditor5-highlight/v/49.0.1): v49.0.0 => v49.0.1
* [@ckeditor/ckeditor5-horizontal-line](https://www.npmjs.com/package/@ckeditor/ckeditor5-horizontal-line/v/49.0.1): v49.0.0 => v49.0.1
* [@ckeditor/ckeditor5-html-embed](https://www.npmjs.com/package/@ckeditor/ckeditor5-html-embed/v/49.0.1): v49.0.0 => v49.0.1
* [@ckeditor/ckeditor5-html-support](https://www.npmjs.com/package/@ckeditor/ckeditor5-html-support/v/49.0.1): v49.0.0 => v49.0.1
* [@ckeditor/ckeditor5-icons](https://www.npmjs.com/package/@ckeditor/ckeditor5-icons/v/49.0.1): v49.0.0 => v49.0.1
* [@ckeditor/ckeditor5-image](https://www.npmjs.com/package/@ckeditor/ckeditor5-image/v/49.0.1): v49.0.0 => v49.0.1
* [@ckeditor/ckeditor5-import-word](https://www.npmjs.com/package/@ckeditor/ckeditor5-import-word/v/49.0.1): v49.0.0 => v49.0.1
* [@ckeditor/ckeditor5-indent](https://www.npmjs.com/package/@ckeditor/ckeditor5-indent/v/49.0.1): v49.0.0 => v49.0.1
* [@ckeditor/ckeditor5-language](https://www.npmjs.com/package/@ckeditor/ckeditor5-language/v/49.0.1): v49.0.0 => v49.0.1
* [@ckeditor/ckeditor5-line-height](https://www.npmjs.com/package/@ckeditor/ckeditor5-line-height/v/49.0.1): v49.0.0 => v49.0.1
* [@ckeditor/ckeditor5-link](https://www.npmjs.com/package/@ckeditor/ckeditor5-link/v/49.0.1): v49.0.0 => v49.0.1
* [@ckeditor/ckeditor5-list](https://www.npmjs.com/package/@ckeditor/ckeditor5-list/v/49.0.1): v49.0.0 => v49.0.1
* [@ckeditor/ckeditor5-list-multi-level](https://www.npmjs.com/package/@ckeditor/ckeditor5-list-multi-level/v/49.0.1): v49.0.0 => v49.0.1
* [@ckeditor/ckeditor5-markdown-gfm](https://www.npmjs.com/package/@ckeditor/ckeditor5-markdown-gfm/v/49.0.1): v49.0.0 => v49.0.1
* [@ckeditor/ckeditor5-media-embed](https://www.npmjs.com/package/@ckeditor/ckeditor5-media-embed/v/49.0.1): v49.0.0 => v49.0.1
* [@ckeditor/ckeditor5-mention](https://www.npmjs.com/package/@ckeditor/ckeditor5-mention/v/49.0.1): v49.0.0 => v49.0.1
* [@ckeditor/ckeditor5-merge-fields](https://www.npmjs.com/package/@ckeditor/ckeditor5-merge-fields/v/49.0.1): v49.0.0 => v49.0.1
* [@ckeditor/ckeditor5-minimap](https://www.npmjs.com/package/@ckeditor/ckeditor5-minimap/v/49.0.1): v49.0.0 => v49.0.1
* [@ckeditor/ckeditor5-operations-compressor](https://www.npmjs.com/package/@ckeditor/ckeditor5-operations-compressor/v/49.0.1): v49.0.0 => v49.0.1
* [@ckeditor/ckeditor5-page-break](https://www.npmjs.com/package/@ckeditor/ckeditor5-page-break/v/49.0.1): v49.0.0 => v49.0.1
* [@ckeditor/ckeditor5-pagination](https://www.npmjs.com/package/@ckeditor/ckeditor5-pagination/v/49.0.1): v49.0.0 => v49.0.1
* [@ckeditor/ckeditor5-paragraph](https://www.npmjs.com/package/@ckeditor/ckeditor5-paragraph/v/49.0.1): v49.0.0 => v49.0.1
* [@ckeditor/ckeditor5-paste-from-office](https://www.npmjs.com/package/@ckeditor/ckeditor5-paste-from-office/v/49.0.1): v49.0.0 => v49.0.1
* [@ckeditor/ckeditor5-paste-from-office-enhanced](https://www.npmjs.com/package/@ckeditor/ckeditor5-paste-from-office-enhanced/v/49.0.1): v49.0.0 => v49.0.1
* [@ckeditor/ckeditor5-real-time-collaboration](https://www.npmjs.com/package/@ckeditor/ckeditor5-real-time-collaboration/v/49.0.1): v49.0.0 => v49.0.1
* [@ckeditor/ckeditor5-remove-format](https://www.npmjs.com/package/@ckeditor/ckeditor5-remove-format/v/49.0.1): v49.0.0 => v49.0.1
* [@ckeditor/ckeditor5-restricted-editing](https://www.npmjs.com/package/@ckeditor/ckeditor5-restricted-editing/v/49.0.1): v49.0.0 => v49.0.1
* [@ckeditor/ckeditor5-revision-history](https://www.npmjs.com/package/@ckeditor/ckeditor5-revision-history/v/49.0.1): v49.0.0 => v49.0.1
* [@ckeditor/ckeditor5-select-all](https://www.npmjs.com/package/@ckeditor/ckeditor5-select-all/v/49.0.1): v49.0.0 => v49.0.1
* [@ckeditor/ckeditor5-show-blocks](https://www.npmjs.com/package/@ckeditor/ckeditor5-show-blocks/v/49.0.1): v49.0.0 => v49.0.1
* [@ckeditor/ckeditor5-slash-command](https://www.npmjs.com/package/@ckeditor/ckeditor5-slash-command/v/49.0.1): v49.0.0 => v49.0.1
* [@ckeditor/ckeditor5-source-editing](https://www.npmjs.com/package/@ckeditor/ckeditor5-source-editing/v/49.0.1): v49.0.0 => v49.0.1
* [@ckeditor/ckeditor5-source-editing-enhanced](https://www.npmjs.com/package/@ckeditor/ckeditor5-source-editing-enhanced/v/49.0.1): v49.0.0 => v49.0.1
* [@ckeditor/ckeditor5-special-characters](https://www.npmjs.com/package/@ckeditor/ckeditor5-special-characters/v/49.0.1): v49.0.0 => v49.0.1
* [@ckeditor/ckeditor5-style](https://www.npmjs.com/package/@ckeditor/ckeditor5-style/v/49.0.1): v49.0.0 => v49.0.1
* [@ckeditor/ckeditor5-table](https://www.npmjs.com/package/@ckeditor/ckeditor5-table/v/49.0.1): v49.0.0 => v49.0.1
* [@ckeditor/ckeditor5-template](https://www.npmjs.com/package/@ckeditor/ckeditor5-template/v/49.0.1): v49.0.0 => v49.0.1
* [@ckeditor/ckeditor5-track-changes](https://www.npmjs.com/package/@ckeditor/ckeditor5-track-changes/v/49.0.1): v49.0.0 => v49.0.1
* [@ckeditor/ckeditor5-typing](https://www.npmjs.com/package/@ckeditor/ckeditor5-typing/v/49.0.1): v49.0.0 => v49.0.1
* [@ckeditor/ckeditor5-ui](https://www.npmjs.com/package/@ckeditor/ckeditor5-ui/v/49.0.1): v49.0.0 => v49.0.1
* [@ckeditor/ckeditor5-undo](https://www.npmjs.com/package/@ckeditor/ckeditor5-undo/v/49.0.1): v49.0.0 => v49.0.1
* [@ckeditor/ckeditor5-upload](https://www.npmjs.com/package/@ckeditor/ckeditor5-upload/v/49.0.1): v49.0.0 => v49.0.1
* [@ckeditor/ckeditor5-uploadcare](https://www.npmjs.com/package/@ckeditor/ckeditor5-uploadcare/v/49.0.1): v49.0.0 => v49.0.1
* [@ckeditor/ckeditor5-utils](https://www.npmjs.com/package/@ckeditor/ckeditor5-utils/v/49.0.1): v49.0.0 => v49.0.1
* [@ckeditor/ckeditor5-widget](https://www.npmjs.com/package/@ckeditor/ckeditor5-widget/v/49.0.1): v49.0.0 => v49.0.1
* [@ckeditor/ckeditor5-word-count](https://www.npmjs.com/package/@ckeditor/ckeditor5-word-count/v/49.0.1): v49.0.0 => v49.0.1
* [ckeditor5](https://www.npmjs.com/package/ckeditor5/v/49.0.1): v49.0.0 => v49.0.1
* [ckeditor5-premium-features](https://www.npmjs.com/package/ckeditor5-premium-features/v/49.0.1): v49.0.0 => v49.0.1
</details>


## [49.0.0](https://github.com/ckeditor/ckeditor5/compare/v48.5.2...v49.0.0) (October 8, 2026)

We are happy to announce the release of CKEditor 5 v49.0.0.

### Release highlights

CKEditor 5 v49.0.0 is a major release. It adds shadow DOM support, a refreshed default theme built on design tokens, Trusted Types support, and a redesigned AI Review. It also removes the Watchdog. Before you upgrade, read the [v49.0.0 update guide](https://ckeditor.com/docs/ckeditor5/latest/updating/guides/update-to-49.html), which also covers the move to ES2023 and native CSS nesting in the distributed stylesheets.

#### Shadow DOM support

CKEditor 5 can now run inside an open shadow root. Selection, focus, scrolling, drag and drop, and the floating UI (balloons, tooltips, dialogs, and menus) all work there. So do the premium features, including [Comments](https://ckeditor.com/docs/ckeditor5/latest/features/collaboration/comments/comments.html), [Track Changes](https://ckeditor.com/docs/ckeditor5/latest/features/collaboration/track-changes/track-changes.html), [Real-time Collaboration](https://ckeditor.com/docs/ckeditor5/latest/features/collaboration/real-time-collaboration/real-time-collaboration.html), and [CKEditor AI](https://ckeditor.com/docs/ckeditor5/latest/features/ai/ckeditor-ai-overview.html). Web components, micro-frontends, and design systems built on shadow DOM can now embed the editor without workarounds. Closed shadow roots are not supported.

A shadow root is a separate styling boundary, so load the editor stylesheets into it and override CSS variables on `:host` instead of `:root`. The new `config.ui.overlayContainer` option sets where the floating UI renders. It also helps outside shadow DOM, for example when the editor sits in a container with `overflow: hidden`. The shadow-aware DOM helpers that the editor uses internally are now public API, so feature and plugin authors can make their own code work in shadow roots. See the [Shadow DOM integration guide](https://ckeditor.com/docs/ckeditor5/latest/getting-started/setup/shadow-dom.html) and, for feature authors, the [Shadow DOM deep dive](https://ckeditor.com/docs/ckeditor5/latest/framework/deep-dive/shadow-dom.html).

#### Refreshed default theme

The editor ships with a new default theme ([#20235](https://github.com/ckeditor/ckeditor5/issues/20235)). The refresh covers the whole UI, from the toolbar, dropdowns, balloons, dialogs, and forms to the premium features and CKEditor AI. Because it is built on design tokens, matching the editor to your product means overriding a few tokens, and those overrides keep working across editor updates.

The refresh also changes content styles, so published documents look slightly different. [Block quotes](https://ckeditor.com/docs/ckeditor5/latest/features/block-quote.html), [code blocks](https://ckeditor.com/docs/ckeditor5/latest/features/code-blocks.html), and [horizontal lines](https://ckeditor.com/docs/ckeditor5/latest/features/horizontal-line.html) use lighter colors, and comment and suggestion markers use new ones.

The new look applies automatically when you upgrade. To keep the previous look, load the [legacy theme preset](https://ckeditor.com/docs/ckeditor5/latest/updating/guides/migration-to-refreshed-theme.html#keeping-the-old-look) after the editor styles and use the [content styles rollback snippets](https://ckeditor.com/docs/ckeditor5/latest/updating/guides/migration-to-refreshed-theme.html#published-content) for published content.

#### Design tokens for theme customization

The theme now uses three layers of design tokens instead of a flat set of CSS variables ([#19910](https://github.com/ckeditor/ckeditor5/issues/19910)): foundation scales (spacing, radius, color, typography), semantic roles shared across components, and per-component tokens. Override a few foundation tokens to align the editor with your design system, one semantic token to restyle a whole class of controls, or a component token such as `--ck-button-border-radius` to change one component without side effects.

Overrides of legacy variable names keep working. CSS that reads legacy names, such as `var(--ck-spacing-small)`, needs the [opt-in aliases](https://ckeditor.com/docs/ckeditor5/latest/updating/guides/migration-to-refreshed-theme.html#reading-old-token-names). Scoped overrides of foundation tokens no longer reach components, so override the component token for per-element changes. See the [theme token naming guide](https://ckeditor.com/docs/ckeditor5/latest/framework/deep-dive/ui/theme-token-naming.html), the [theme customization guide](https://ckeditor.com/docs/ckeditor5/latest/framework/deep-dive/ui/theme-customization.html), and the [refreshed theme and design tokens section of the update guide](https://ckeditor.com/docs/ckeditor5/latest/updating/guides/update-to-49.html#refreshed-theme-and-design-tokens).

#### ⭐ Redesigned AI Review and more unified AI experience

[AI Review](https://ckeditor.com/docs/ckeditor5/latest/features/ai/ckeditor-ai-review.html) has a new design and a Suggest action, which adds an AI change as a [Track Changes](https://ckeditor.com/docs/ckeditor5/latest/features/collaboration/track-changes/track-changes.html) suggestion instead of applying it directly. While you work through the changes, a balloon in the content follows the current one and a progress bar shows how many are left. AI Review, [AI Quick Actions](https://ckeditor.com/docs/ckeditor5/latest/features/ai/ckeditor-ai-actions.html), and Proposed Changes in [AI Chat](https://ckeditor.com/docs/ckeditor5/latest/features/ai/ckeditor-ai-chat.html) now share the same cards and controls, so actions sit in similar places in all three.

The whole AI interface, including AI Chat, AI Review, Quick Actions, and [AI Translate](https://ckeditor.com/docs/ckeditor5/latest/features/ai/ckeditor-ai-translate.html), now uses the refreshed theme and responds to the same token overrides as the rest of the editor. If you customized the AI interface, update your overrides, because legacy AI token names have no fallback. See the [AI package section of the theme migration guide](https://ckeditor.com/docs/ckeditor5/latest/updating/guides/migration-to-refreshed-theme.html#ai-package-domain-first-component-first) for the name mappings.

#### Trusted Types support

CKEditor 5 now works in applications that enforce [Trusted Types](https://developer.mozilla.org/en-US/docs/Web/API/Trusted_Types_API) with the `require-trusted-types-for 'script'` Content Security Policy directive ([#10845](https://github.com/ckeditor/ckeditor5/issues/10845)). Before, the browser blocked the HTML strings the editor inserts into the page, so the editor could not run at all. Every place where the editor inserts HTML, including in premium features, now goes through a Trusted Types policy named `ckeditor5`.

**The policy does not sanitize content, so validating the data you load into the editor remains your responsibility.** See the [Trusted Types section of the CSP guide](https://ckeditor.com/docs/ckeditor5/latest/getting-started/setup/csp.html#trusted-types) and the [API docs for `trustedHtml()`](https://ckeditor.com/docs/ckeditor5/latest/api/module_utils_dom_trustedtypes.html#function-trustedHtml).

#### Error handling without the Watchdog

The Watchdog has been removed (along with the `@ckeditor/ckeditor5-watchdog` package), so CKEditor 5 no longer restarts the editor after an unhandled error. The editor keeps running with its content and undo history, but its state may be inconsistent, so your application decides what to do next: reload the editor, notify the user, or report the error. Register a callback with the new `onEditorError()` function to learn about errors and which editor or context caused them.

See the [Error handling](https://ckeditor.com/docs/ckeditor5/latest/getting-started/setup/error-handling.html) guide and the [Migrating from the Watchdog](https://ckeditor.com/docs/ckeditor5/latest/updating/guides/migration-from-watchdog.html) guide for integration and migration instructions.

### MAJOR BREAKING CHANGES [ℹ️](https://ckeditor.com/docs/ckeditor5/latest/framework/guides/support/versioning-policy.html#major-and-minor-breaking-changes)

* **[ckeditor5](https://www.npmjs.com/package/ckeditor5), [core](https://www.npmjs.com/package/@ckeditor/ckeditor5-core), [utils](https://www.npmjs.com/package/@ckeditor/ckeditor5-utils)**: Removed the `@ckeditor/ckeditor5-watchdog` package and automatic editor restarts after a crash. The editor now retains its content and undo history instead of being recreated from previously saved data.

  * Removed the `EditorWatchdog`, `ContextWatchdog`, and `Watchdog` classes and the `WatchdogConfig` type, including their exports from `ckeditor5`.
  * Removed the `Editor.EditorWatchdog` and `Editor.ContextWatchdog` static fields from every editor class.
  * Moved `ActionsRecorder` to `@ckeditor/ckeditor5-core` without changing its behavior.

  Use `onEditorError()` to observe errors and identify the editor or context that caused them. It returns a function that unregisters the callback and is also available as `Editor.onEditorError()` and `Context.onEditorError()` for framework integrations.

  ```js
  import { onEditorError } from 'ckeditor5';

  const off = onEditorError( ( { error, source } ) => {
  	console.error( 'An error escaped', source, error );
  } );
  ```

  If you used `ContextWatchdog` to share a context between editors, create the `Context`, pass it in the editor configuration, and destroy it when it is no longer needed.

  ```js
  const context = await Context.create( contextConfig );

  const editor = await ClassicEditor.create( { context, /* ... */ } );
  ```

  Integrations that relied on automatic restarts must now handle errors, for example by reloading the editor, notifying the user, or reporting the error to a tracking service.
* Introduced three layers of CSS custom properties for theme customization, replacing the previous flat set of variables. Closes [#19910](https://github.com/ckeditor/ckeditor5/issues/19910).

  The layers are:

  1. Foundation primitives, such as the spacing, radius, and color scales.
  2. Semantic design roles shared across components, such as control padding and surface radius.
  3. Per-component override points, such as the button or dialog tokens.

  Overrides of legacy variables remain supported, except for removed variables, but reading legacy names in custom CSS, such as `var(--ck-spacing-small)`, requires the opt-in aliases from the [migration guide](https://ckeditor.com/docs/ckeditor5/latest/updating/guides/migration-to-refreshed-theme.html#reading-old-token-names). Scoped overrides of new foundation or semantic tokens do not affect component tokens, so use component tokens for per-element customization. See the [theme token naming](https://ckeditor.com/docs/ckeditor5/latest/framework/deep-dive/ui/theme-token-naming.html) guide for the layers and recommended override points.
* Introduced a refreshed default theme based on the new design tokens. The new appearance applies to all integrations using the default theme. Closes [#20235](https://github.com/ckeditor/ckeditor5/issues/20235).

  To retain the previous appearance, copy the legacy theme preset from the [migration guide](https://ckeditor.com/docs/ckeditor5/latest/updating/guides/migration-to-refreshed-theme.html#keeping-the-old-look) into a stylesheet and load it after the editor styles.

  The refreshed `.ck-content` styles also affect published documents, including comment and suggestion markers, block quotes, code blocks, and horizontal lines. Use the [rollback snippets](https://ckeditor.com/docs/ckeditor5/latest/updating/guides/migration-to-refreshed-theme.html#published-content) to restore the previous content colors.

  Custom themes can continue to override legacy token names, but CSS that reads those names requires opt-in aliases. See the [migration guide](https://ckeditor.com/docs/ckeditor5/latest/updating/guides/migration-to-refreshed-theme.html) for details and exceptions.
* **[core](https://www.npmjs.com/package/@ckeditor/ckeditor5-core)**: Moved `ActionsRecorder` from the removed `@ckeditor/ckeditor5-watchdog` package to `@ckeditor/ckeditor5-core`.

  Imports from `ckeditor5` are unchanged, but direct imports from `@ckeditor/ckeditor5-watchdog` must be updated:

  ```js
  // Before.
  import { ActionsRecorder } from '@ckeditor/ckeditor5-watchdog';

  // After.
  import { ActionsRecorder } from '@ckeditor/ckeditor5-core';
  ```

  The `ActionsRecorderConfig`, `ActionsRecorderEntry`, `ActionsRecorderEntryEditorSnapshot`, `ActionsRecorderErrorCallback`, `ActionsRecorderFilterCallback`, and `ActionsRecorderMaxEntriesCallback` types also moved, and `config.actionsRecorder` retains its typing.
* **[ui](https://www.npmjs.com/package/@ckeditor/ckeditor5-ui)**: Replaced `new TooltipManager( editor )` with `TooltipManager.for( locale )` and made the constructor private. Call `release()` instead of `destroy( editor )` when each caller no longer needs the shared instance. All editors still share one instance per page through `editor.ui.tooltipManager`, using the `Locale` of the first caller. See [#3891](https://github.com/ckeditor/ckeditor5/issues/3891).
* **[ui](https://www.npmjs.com/package/@ckeditor/ckeditor5-ui)**: Renamed `BodyCollection#detachFromDom()` to `BodyCollection#destroy()`, which still destroys the collection's views and removes their container from the DOM. Replace `detachFromDom()` calls with `destroy()`, or use the new `BodyCollection#unmountFromDom()` method to detach the collection without destroying it. See [#3891](https://github.com/ckeditor/ckeditor5/issues/3891).
* Changed the target for all packages and CDN builds from ES2022 to **ES2023**.
* Introduced native CSS nesting in distributed stylesheets in place of flattened selectors. Tools that post-process CKEditor 5 CSS must support nesting or use a nesting transform.

### MINOR BREAKING CHANGES [ℹ️](https://ckeditor.com/docs/ckeditor5/latest/framework/guides/support/versioning-policy.html#major-and-minor-breaking-changes)

* **[font](https://www.npmjs.com/package/@ckeditor/ckeditor5-font), [table](https://www.npmjs.com/package/@ckeditor/ckeditor5-table), [ui](https://www.npmjs.com/package/@ckeditor/ckeditor5-ui)**: Introduced a shared default palette of 120 Material colors for the font and table color features without changing existing document colors. Configure the color options explicitly to retain the previous palettes.

  The default color grid now has 12 columns instead of 5, also changing the default value of `fontColor.documentColors`, and the new `colorGridColumns` option controls the grid width in the table and table cell properties balloons.
* **[block-quote](https://www.npmjs.com/package/@ckeditor/ckeditor5-block-quote), [code-block](https://www.npmjs.com/package/@ckeditor/ckeditor5-code-block)**: Changed the border and background colors of block quotes and code blocks to lighter shades, including in published content. To restore the previous colors, see the [content styles rollback snippets](https://ckeditor.com/docs/ckeditor5/latest/updating/guides/migration-to-refreshed-theme.html#published-content) in the migration guide. See [#19910](https://github.com/ckeditor/ckeditor5/issues/19910).
* **[export-pdf](https://www.npmjs.com/package/@ckeditor/ckeditor5-export-pdf), [export-word](https://www.npmjs.com/package/@ckeditor/ckeditor5-export-word)**: Changed `converterOptions.extra_http_headers` to accept an array of `{ domain, headers }` entries instead of an object keyed by domain.

  ```js
  // Before.
  converterOptions: {
  	extra_http_headers: {
  		'https://medias.example.org/': { authorization: 'Bearer xxx' }
  	}
  }

  // After.
  converterOptions: {
  	extra_http_headers: [
  		{ domain: 'https://medias.example.org/', headers: { authorization: 'Bearer xxx' } }
  	]
  }
  ```

  This affects only integrations that pass converter options directly to the `exportPdf` or `exportWord` command, as the object form did not work in the editor configuration.
* **[comments](https://www.npmjs.com/package/@ckeditor/ckeditor5-comments), [track-changes](https://www.npmjs.com/package/@ckeditor/ckeditor5-track-changes)**: Changed the default colors of comment highlights and suggestion insertion and deletion markers to match the refreshed theme, including in published `.ck-content`. To restore the previous appearance, override the `--ck-comment-marker-*` and `--ck-suggestion-marker-*` custom properties as shown in the [content styles rollback snippets](https://ckeditor.com/docs/ckeditor5/latest/updating/guides/migration-to-refreshed-theme.html#published-content).
* **[fullscreen](https://www.npmjs.com/package/@ckeditor/ckeditor5-fullscreen), [ui](https://www.npmjs.com/package/@ckeditor/ckeditor5-ui)**: Added CSS variable declarations on `:host` alongside `:root` in editor stylesheets, so overrides on `:root` do not affect editors inside shadow roots. Override variables on the shadow host and declare custom stylesheet variables on both selectors, as described in the ["Overriding CSS variables"](https://ckeditor.com/docs/ckeditor5/latest/getting-started/setup/shadow-dom.html#overriding-css-variables) section of the shadow DOM guide. See [#3891](https://github.com/ckeditor/ckeditor5/issues/3891).

  Styles that affect the light DOM, such as `ck-fullscreen-scroll-locked` for locking page scrolling, are now applied at runtime instead of through theme stylesheets, so custom overrides may require higher specificity.
* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai)**: Changed `AITabs#container` from a plain `HTMLElement | null` property to an observable `HTMLElement | ShadowRoot | null` property to support shadow roots.

  See the documentation for details on running CKEditor AI features inside shadow roots.
* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai)**: Removed the `config.ai.assistant.useTheme` option. The AI Assistant now always uses the `ck-ai-assistant-ui_theme` CSS class, which follows the editor theme instead of applying a violet tint. To restore the tint or apply custom colors, see the "Using custom colors for the UI" section of the AI Assistant integration guide.
* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai)**: Removed the unused `--ck-ai-review-suggestion-active-color` CSS custom property (formerly `--ck-color-ai-review-suggestion-active`) without a replacement. Remove or replace references to it in custom styles.
* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai)**: Removed the third `editor` parameter from `AIGateway#mergeChangesIntoContent()`.
* **[engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine)**: Removed `ViewRenderer#domDocuments` without a public replacement, as editing roots can now be inside shadow roots. See [#3891](https://github.com/ckeditor/ckeditor5/issues/3891).
* **[fullscreen](https://www.npmjs.com/package/@ckeditor/ckeditor5-fullscreen)**: Changed the default fullscreen container from `<body>` to `config.ui.overlayContainer`, the editor's shadow root, or `<body>`, in that order of precedence. An explicit `config.fullscreen.container` value still takes precedence. See [#3891](https://github.com/ckeditor/ckeditor5/issues/3891).

  When the option is not set, `editor.config.get( 'fullscreen.container' )` now returns `undefined` instead of the `<body>` element.

  The fullscreen wrapper now uses the `ck-fullscreen__main-wrapper_custom-container` class when it fills an integrator-provided container, which may require updating custom CSS.
* **[horizontal-line](https://www.npmjs.com/package/@ckeditor/ckeditor5-horizontal-line)**: Changed the background color of horizontal lines to a lighter shade, including in published content. To restore the previous color, see the [content styles rollback snippets](https://ckeditor.com/docs/ckeditor5/latest/updating/guides/migration-to-refreshed-theme.html#published-content) in the migration guide. See [#19910](https://github.com/ckeditor/ckeditor5/issues/19910).
* **[mention](https://www.npmjs.com/package/@ckeditor/ckeditor5-mention)**: Updated the mention suggestion list to match toolbar dropdown lists, with list item buttons and a focus ring instead of a background highlight for the item selected with the keyboard.

  Update custom styles to use `ck-mentions__item_focused` on the list item instead of `ck-on` for the selected item. Every item, including custom-rendered items, now also uses the `ck-list-item-button` class.
* **[merge-fields](https://www.npmjs.com/package/@ckeditor/ckeditor5-merge-fields)**: Updated the merge field suggestion list markup to match the refreshed theme. Custom styles targeting the previous markup may need to be updated. See [ckeditor/ckeditor5#20235](https://github.com/ckeditor/ckeditor5/issues/20235).
* **[ui](https://www.npmjs.com/package/@ckeditor/ckeditor5-ui)**: Changed the editor's body collection (balloons, dialogs, and tooltips) to attach to the DOM only after the editing root is connected to the document. Each mount target now has its own `.ck-body-wrapper`, including shadow roots and configured `config.ui.overlayContainer` containers, instead of sharing one wrapper across the page. See [#3891](https://github.com/ckeditor/ckeditor5/issues/3891).

  For editors created on detached elements, `.ck-body-wrapper` is no longer in the DOM immediately after `Editor.create()` resolves. Use `editor.ui.view.body.bodyCollectionContainer` instead of `document.querySelector( '.ck-body-wrapper' )` to access the container before it is attached.
* **[ui](https://www.npmjs.com/package/@ckeditor/ckeditor5-ui)**: Removed the `listenerOptions` option from `clickOutsideHandler()`, so listener priority and capture mode can no longer be configured. Remove this option from calls to the function. See [#3891](https://github.com/ckeditor/ckeditor5/issues/3891).
* **[uploadcare](https://www.npmjs.com/package/@ckeditor/ckeditor5-uploadcare)**: Changed the Uploadcare `uc-config` and `uc-upload-ctx-provider` web components to render in the editor's floating UI container instead of `document.body`, enabling shadow DOM support. Continue to access them through `UploadcareEditing#configElement` and `UploadcareEditing#ctxElement`.
* **[utils](https://www.npmjs.com/package/@ckeditor/ckeditor5-utils)**: Removed the `getCommonAncestor()` DOM utility from `ckeditor5-utils`, as it did not support traversal across shadow boundaries. To find the lowest common ancestor of two DOM nodes, traverse their ancestors with `getParentNode()` and compare the chains, or use the model and view `getCommonAncestor()` methods when working with the editor tree. See [#3891](https://github.com/ckeditor/ckeditor5/issues/3891).
* **[utils](https://www.npmjs.com/package/@ckeditor/ckeditor5-utils)**: Changed `getPositionedAncestor()` to return `null` for elements not connected to a document. Previously, it only required the element to have a parent. See [#3891](https://github.com/ckeditor/ckeditor5/issues/3891).

  It also handles these cases differently:

  * It now returns `<body>` when styles such as `position: relative` or `transform` make it the containing block. Previously, it always returned `null` for the main document's `<body>`.
  * It now returns `null` instead of a statically positioned `<body>` for elements inside an iframe, matching its behavior in the main document.
  * It now searches the shadow tree for the positioned ancestor of an element assigned to a `<slot>`.

### Features

* **[core](https://www.npmjs.com/package/@ckeditor/ckeditor5-core), [fullscreen](https://www.npmjs.com/package/@ckeditor/ckeditor5-fullscreen), [ui](https://www.npmjs.com/package/@ckeditor/ckeditor5-ui)**: Introduced `config.ui.overlayContainer` to specify an element or shadow root for the editor's floating UI, including balloons, dialogs, and tooltips. Load the editor stylesheets into the target container as described in the ["Where the floating user interface mounts"](https://ckeditor.com/docs/ckeditor5/latest/getting-started/setup/shadow-dom.html#where-the-floating-user-interface-mounts) section of the shadow DOM guide. See [#3891](https://github.com/ckeditor/ckeditor5/issues/3891), [#5319](https://github.com/ckeditor/ckeditor5/issues/5319).

  The `config.fullscreen.container` option now also accepts a shadow root.
* **[ui](https://www.npmjs.com/package/@ckeditor/ckeditor5-ui), [utils](https://www.npmjs.com/package/@ckeditor/ckeditor5-utils)**: Introduced public APIs for shadow DOM integrations: `ShadowRootRegistry`, `OverlayHost`, `ShadowSelection`, `getSelection()`, `EditorUI#shadowRootRegistry`, and the `BodyCollection` mounting API. The `getSelection()` utility returns a `ShadowSelection` instance, and `BodyCollection#attachToDom()` now accepts an element or a shadow root. See [#3891](https://github.com/ckeditor/ckeditor5/issues/3891).

  Shadow-aware DOM helpers include `getParentNode()`, `containsNode()`, `getActiveElement()`, and `getElementFromPoint()`, with the full list available in the `ckeditor5-utils` API documentation.
* **[comments](https://www.npmjs.com/package/@ckeditor/ckeditor5-comments), [real-time-collaboration](https://www.npmjs.com/package/@ckeditor/ckeditor5-real-time-collaboration)**: Introduced `config.sidebar.overlayContainer` and `config.presenceList.overlayContainer` to specify an element or shadow root for the narrow sidebar annotation balloon and presence list dropdown, respectively. Use these options when a feature runs inside a shadow root or its container clips the floating UI. Otherwise, the features use `config.ui.overlayContainer` when configured.
* **[ckeditor5](https://www.npmjs.com/package/ckeditor5)**: Added support for creating editors inside open shadow roots, including selection, focus, positioning, scrolling, drag and drop, floating UI, and premium features. Closed shadow roots are not supported. Closes [#3891](https://github.com/ckeditor/ckeditor5/issues/3891).

  Load editor stylesheets into each shadow root containing editor UI and override CSS variables on the shadow host instead of `:root`, as described in the [shadow DOM guide](https://ckeditor.com/docs/ckeditor5/latest/getting-started/setup/shadow-dom.html).
* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai)**: Adjusted the content width in AI Quick Actions and AI Chat dialogs to match the text width of the editing area. The dialog width and height can now be customized with CSS custom properties.
* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai)**: Added a progress bar to the AI Review panel header showing how many suggestions have been reviewed out of the total.
* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai)**: Grouped AI Review sidebar checks into those that run immediately on click and those that open a collapsible options panel before running.
* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai)**: Added a confirmation prompt when leaving AI Review or AI Translate with unresolved suggestions to prevent accidental loss of the session.
* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai)**: Added support for inserting AI Review changes as Track Changes suggestions instead of applying them directly.

  When the `TrackChanges` plugin is loaded in every editor in the context, the change balloon and results list include a "Suggest" button that creates suggestions marked as AI-generated and replaces "Accept" if Track Changes mode is enabled in any editor. "Accept all" and "Reject all" remain available in the "Complete" dropdown, with "Accept all" creating suggestions in editors with Track Changes mode enabled and applying changes directly in the others.
* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai)**: Added a loading skeleton to AI Chat and AI Review during initialization, replacing the empty panel.
* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai)**: Added information for the AI agent about the document root's host element, whether the root accepts only inline content, and whether the editor supports soft breaks (Shift+Enter).
* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai)**: Replaced the separate "Accept all" and "Exit review" buttons in AI Review with a single "Complete" dropdown, which also introduces a new "Reject all" bulk action. The dropdown is available both in the sidebar header and directly from the suggestion balloon shown in the editor content.
* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai)**: Introduced `config.ai.overlayContainer` to specify an element or shadow root for AI balloons, dialogs, and dropdowns, as well as the AI interface when using the `'overlay'` container type.

  Set this option when the AI interface runs inside a shadow root or its container clips or repositions floating elements. If it is not set, `config.ui.overlayContainer` is used when configured.
* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai)**: Added a full comparison of inserted and removed text for the selected AI Review change, even when "Show changes" is disabled.

  Inserted text appears next to struck-through removed text, while other changes remain highlighted.
* **[core](https://www.npmjs.com/package/@ckeditor/ckeditor5-core)**: Introduced `onEditorError()` to observe unhandled editor errors and identify their source editor or context, replacing the removed Watchdog. It returns a function that unregisters the callback. It does not restart editors, save or restore data, or prevent errors from reaching the console.
* **[ui](https://www.npmjs.com/package/@ckeditor/ckeditor5-ui)**: Added `TooltipManager#registerBodyCollection( bodyCollection, options )` and `TooltipManager#unregisterBodyCollection( bodyCollection )` to choose the body collection for the shared tooltip balloon. Components outside the editor can now display tooltips in their own DOM tree, including shadow roots, even without an editor on the page. See [#3891](https://github.com/ckeditor/ckeditor5/issues/3891).
* **[ui](https://www.npmjs.com/package/@ckeditor/ckeditor5-ui)**: Introduced reusable UI components for building tabbed interfaces. See [#20235](https://github.com/ckeditor/ckeditor5/issues/20235).
* **[ui](https://www.npmjs.com/package/@ckeditor/ckeditor5-ui)**: Added the `DropdownView#panelPositionLimiter` property to constrain automatic dropdown positioning to the visible bounds of a specified element.
* **[utils](https://www.npmjs.com/package/@ckeditor/ckeditor5-utils)**: Introduced the `isOffline` utility to check whether the browser is in offline mode.
* Added support for applications that enforce Trusted Types with the `require-trusted-types-for 'script'` Content Security Policy directive. Closes [#10845](https://github.com/ckeditor/ckeditor5/issues/10845).

### Bug fixes

* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai)**: Fixed an issue where AI Chat shortcuts remained in the chat feed after a shortcut was used or a message was sent.
* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai)**: Fixed inconsistent change numbers between the AI Chat suggestion preview and the chat feed.
* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai)**: Fixed an issue where AI Translate and AI Review failed when a block element ended with a soft break.
* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai)**: Fixed the AI model selector to show only recommended models when `ai.models.displayedModels` contains only empty values, such as `[ '' ]`. Previously, this configuration displayed all available models.
* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai)**: Fixed failures to merge or apply changes through `AIReviewGateway#runReview()`, `AIReviewGateway#runCustomReview()`, and `AITranslateGateway#runTranslate()` when content contained nested block structures, such as tables or images with captions.
* **[ckbox](https://www.npmjs.com/package/@ckeditor/ckeditor5-ckbox)**: Fixed misleading file category or server error messages shown when the internet connection was lost. Users now receive a connection error message.
* **[comments](https://www.npmjs.com/package/@ckeditor/ckeditor5-comments)**: Fixed annotation activation when clicking content covered by both a comment and a suggestion. The annotation higher in the sidebar now becomes active, keeping the other annotations in view.
* **[export-inline-styles](https://www.npmjs.com/package/@ckeditor/ckeditor5-export-inline-styles)**: Fixed handling of nested CSS rules in the `stylesheets` and `inlineCss` configuration. Declarations after a nested rule now apply to the parent selector instead of being dropped, and `&` resolves against each selector in the parent list. Previously, parent selector lists could cause styles to apply to the wrong elements.
* **[image](https://www.npmjs.com/package/@ckeditor/ckeditor5-image)**: Fixed the positioning of the text alternative and custom resize balloons to anchor them to the nearest image edge when a centered balloon does not fit. Previously, balloons for left- or right-aligned images could move toward the middle of the editing area instead of staying next to the image.
* **[pagination](https://www.npmjs.com/package/@ckeditor/ckeditor5-pagination)**: Fixed misalignment between the page break line and its label when scrolling in fullscreen mode.
* **[track-changes](https://www.npmjs.com/package/@ckeditor/ckeditor5-track-changes)**: Fixed an error in the track changes preview and `TrackChangesData` in the classic editor when the element passed to `config.attachTo` or as the first argument of `ClassicEditor.create()` contained suggestions in its HTML.
* **[utils](https://www.npmjs.com/package/@ckeditor/ckeditor5-utils)**: Fixed an editor crash when passing an empty `translations` configuration entry. Closes [#20226](https://github.com/ckeditor/ckeditor5/issues/20226).
* **[widget](https://www.npmjs.com/package/@ckeditor/ckeditor5-widget)**: Fixed an issue where clicking beside a block widget that was the only child of a block quote did not change the selection. The click now selects the widget.

### Other changes

* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai), [comments](https://www.npmjs.com/package/@ckeditor/ckeditor5-comments), [uploadcare](https://www.npmjs.com/package/@ckeditor/ckeditor5-uploadcare)**: Removed header icons from the AI Assistant, comments archive, and Uploadcare dialogs to match the refreshed theme.
* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai)**: Added the editor version to the configuration sent to the AI backend to support compatibility with older editor versions.
* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai)**: Changed AI balloons, dialogs, and dropdowns to render in the AI interface's DOM tree instead of `document.body` to support shadow roots.

  When `config.ai.container.type` is `'custom'`, set `AITabs#container` to the AI interface's host element or use `config.ai.overlayContainer`, which takes precedence. Otherwise, the floating UI falls back to `document.body` and may appear unstyled inside shadow roots. The `'sidebar'` and `'overlay'` container types are unaffected.

  See the documentation for details on running CKEditor AI features inside shadow roots.
* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai)**: Removed normalization of AI-generated content through the editor data pipeline before the AI Review and AI Translate programmatic gateways merge it.
* **[emoji](https://www.npmjs.com/package/@ckeditor/ckeditor5-emoji)**: Shortened the emoji search input label from "Find an emoji (min. 2 characters)" to "Find an emoji". A message shown while typing still indicates the minimum character requirement. See [#19910](https://github.com/ckeditor/ckeditor5/issues/19910).
* **[emoji](https://www.npmjs.com/package/@ckeditor/ckeditor5-emoji)**: Updated emoji category buttons to match the tabs in the refreshed theme. See [#20235](https://github.com/ckeditor/ckeditor5/issues/20235).
* **[footnotes](https://www.npmjs.com/package/@ckeditor/ckeditor5-footnotes)**: Updated the focus highlight of footnote editing fields and aligned footnote text with its number. See [ckeditor/ckeditor5#20235](https://github.com/ckeditor/ckeditor5/issues/20235).
* **[source-editing-enhanced](https://www.npmjs.com/package/@ckeditor/ckeditor5-source-editing-enhanced)**: Updated the source code editing area's focus highlight and rounded corners to match other text fields. See [ckeditor/ckeditor5#20235](https://github.com/ckeditor/ckeditor5/issues/20235).
* **[table](https://www.npmjs.com/package/@ckeditor/ckeditor5-table)**: Aligned controls in equal-width columns in the table and table cell properties forms to match the refreshed theme. See [#20235](https://github.com/ckeditor/ckeditor5/issues/20235).
* **[ui](https://www.npmjs.com/package/@ckeditor/ckeditor5-ui)**: Removed the header icon from the accessibility help dialog. See [#19910](https://github.com/ckeditor/ckeditor5/issues/19910).
* **[ui](https://www.npmjs.com/package/@ckeditor/ckeditor5-ui)**: Changed editor UI scrollbar colors to match the theme instead of using browser defaults. See [#20235](https://github.com/ckeditor/ckeditor5/issues/20235).
* **[utils](https://www.npmjs.com/package/@ckeditor/ckeditor5-utils)**: Added support for resolving points inside shadow roots with `getRangeFromMouseEvent()` in Chrome and Edge 128 and later, Firefox 150 and later, and Safari 26.2 and later. Older browsers still return a range beside the shadow host because they do not support the `shadowRoots` option of `Document#caretPositionFromPoint()`. See [#3891](https://github.com/ckeditor/ckeditor5/issues/3891).
* **[widget](https://www.npmjs.com/package/@ckeditor/ckeditor5-widget)**: Removed the glossy highlight from buttons for inserting a paragraph next to a widget to match the refreshed theme. See [#20235](https://github.com/ckeditor/ckeditor5/issues/20235).

### Released packages

Check out the [Versioning policy](https://ckeditor.com/docs/ckeditor5/latest/framework/guides/support/versioning-policy.html) guide for more information.

<details>
<summary>Released packages (summary)</summary>

Major releases (contain major breaking changes):

* [ckeditor5](https://www.npmjs.com/package/ckeditor5/v/49.0.0): v48.5.2 => v49.0.0
* [@ckeditor/ckeditor5-core](https://www.npmjs.com/package/@ckeditor/ckeditor5-core/v/49.0.0): v48.5.2 => v49.0.0
* [@ckeditor/ckeditor5-utils](https://www.npmjs.com/package/@ckeditor/ckeditor5-utils/v/49.0.0): v48.5.2 => v49.0.0
* [@ckeditor/ckeditor5-ui](https://www.npmjs.com/package/@ckeditor/ckeditor5-ui/v/49.0.0): v48.5.2 => v49.0.0

Minor releases (contain minor breaking changes):

* [@ckeditor/ckeditor5-font](https://www.npmjs.com/package/@ckeditor/ckeditor5-font/v/49.0.0): v48.5.2 => v49.0.0
* [@ckeditor/ckeditor5-table](https://www.npmjs.com/package/@ckeditor/ckeditor5-table/v/49.0.0): v48.5.2 => v49.0.0
* [@ckeditor/ckeditor5-block-quote](https://www.npmjs.com/package/@ckeditor/ckeditor5-block-quote/v/49.0.0): v48.5.2 => v49.0.0
* [@ckeditor/ckeditor5-code-block](https://www.npmjs.com/package/@ckeditor/ckeditor5-code-block/v/49.0.0): v48.5.2 => v49.0.0
* [@ckeditor/ckeditor5-export-pdf](https://www.npmjs.com/package/@ckeditor/ckeditor5-export-pdf/v/49.0.0): v48.5.2 => v49.0.0
* [@ckeditor/ckeditor5-export-word](https://www.npmjs.com/package/@ckeditor/ckeditor5-export-word/v/49.0.0): v48.5.2 => v49.0.0
* [@ckeditor/ckeditor5-comments](https://www.npmjs.com/package/@ckeditor/ckeditor5-comments/v/49.0.0): v48.5.2 => v49.0.0
* [@ckeditor/ckeditor5-track-changes](https://www.npmjs.com/package/@ckeditor/ckeditor5-track-changes/v/49.0.0): v48.5.2 => v49.0.0
* [@ckeditor/ckeditor5-fullscreen](https://www.npmjs.com/package/@ckeditor/ckeditor5-fullscreen/v/49.0.0): v48.5.2 => v49.0.0
* [@ckeditor/ckeditor5-ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai/v/49.0.0): v48.5.2 => v49.0.0
* [@ckeditor/ckeditor5-engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine/v/49.0.0): v48.5.2 => v49.0.0
* [@ckeditor/ckeditor5-horizontal-line](https://www.npmjs.com/package/@ckeditor/ckeditor5-horizontal-line/v/49.0.0): v48.5.2 => v49.0.0
* [@ckeditor/ckeditor5-mention](https://www.npmjs.com/package/@ckeditor/ckeditor5-mention/v/49.0.0): v48.5.2 => v49.0.0
* [@ckeditor/ckeditor5-merge-fields](https://www.npmjs.com/package/@ckeditor/ckeditor5-merge-fields/v/49.0.0): v48.5.2 => v49.0.0
* [@ckeditor/ckeditor5-uploadcare](https://www.npmjs.com/package/@ckeditor/ckeditor5-uploadcare/v/49.0.0): v48.5.2 => v49.0.0

Releases containing new features:

* [@ckeditor/ckeditor5-real-time-collaboration](https://www.npmjs.com/package/@ckeditor/ckeditor5-real-time-collaboration/v/49.0.0): v48.5.2 => v49.0.0

Other releases:

* [@ckeditor/ckeditor5-adapter-ckfinder](https://www.npmjs.com/package/@ckeditor/ckeditor5-adapter-ckfinder/v/49.0.0): v48.5.2 => v49.0.0
* [@ckeditor/ckeditor5-alignment](https://www.npmjs.com/package/@ckeditor/ckeditor5-alignment/v/49.0.0): v48.5.2 => v49.0.0
* [@ckeditor/ckeditor5-autoformat](https://www.npmjs.com/package/@ckeditor/ckeditor5-autoformat/v/49.0.0): v48.5.2 => v49.0.0
* [@ckeditor/ckeditor5-autosave](https://www.npmjs.com/package/@ckeditor/ckeditor5-autosave/v/49.0.0): v48.5.2 => v49.0.0
* [@ckeditor/ckeditor5-basic-styles](https://www.npmjs.com/package/@ckeditor/ckeditor5-basic-styles/v/49.0.0): v48.5.2 => v49.0.0
* [@ckeditor/ckeditor5-bookmark](https://www.npmjs.com/package/@ckeditor/ckeditor5-bookmark/v/49.0.0): v48.5.2 => v49.0.0
* [@ckeditor/ckeditor5-case-change](https://www.npmjs.com/package/@ckeditor/ckeditor5-case-change/v/49.0.0): v48.5.2 => v49.0.0
* [@ckeditor/ckeditor5-ckbox](https://www.npmjs.com/package/@ckeditor/ckeditor5-ckbox/v/49.0.0): v48.5.2 => v49.0.0
* [@ckeditor/ckeditor5-ckfinder](https://www.npmjs.com/package/@ckeditor/ckeditor5-ckfinder/v/49.0.0): v48.5.2 => v49.0.0
* [@ckeditor/ckeditor5-clipboard](https://www.npmjs.com/package/@ckeditor/ckeditor5-clipboard/v/49.0.0): v48.5.2 => v49.0.0
* [@ckeditor/ckeditor5-cloud-services](https://www.npmjs.com/package/@ckeditor/ckeditor5-cloud-services/v/49.0.0): v48.5.2 => v49.0.0
* [@ckeditor/ckeditor5-collaboration-core](https://www.npmjs.com/package/@ckeditor/ckeditor5-collaboration-core/v/49.0.0): v48.5.2 => v49.0.0
* [@ckeditor/ckeditor5-document-outline](https://www.npmjs.com/package/@ckeditor/ckeditor5-document-outline/v/49.0.0): v48.5.2 => v49.0.0
* [@ckeditor/ckeditor5-easy-image](https://www.npmjs.com/package/@ckeditor/ckeditor5-easy-image/v/49.0.0): v48.5.2 => v49.0.0
* [@ckeditor/ckeditor5-editor-balloon](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-balloon/v/49.0.0): v48.5.2 => v49.0.0
* [@ckeditor/ckeditor5-editor-classic](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-classic/v/49.0.0): v48.5.2 => v49.0.0
* [@ckeditor/ckeditor5-editor-decoupled](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-decoupled/v/49.0.0): v48.5.2 => v49.0.0
* [@ckeditor/ckeditor5-editor-inline](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-inline/v/49.0.0): v48.5.2 => v49.0.0
* [@ckeditor/ckeditor5-editor-multi-root](https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-multi-root/v/49.0.0): v48.5.2 => v49.0.0
* [@ckeditor/ckeditor5-email](https://www.npmjs.com/package/@ckeditor/ckeditor5-email/v/49.0.0): v48.5.2 => v49.0.0
* [@ckeditor/ckeditor5-emoji](https://www.npmjs.com/package/@ckeditor/ckeditor5-emoji/v/49.0.0): v48.5.2 => v49.0.0
* [@ckeditor/ckeditor5-enter](https://www.npmjs.com/package/@ckeditor/ckeditor5-enter/v/49.0.0): v48.5.2 => v49.0.0
* [@ckeditor/ckeditor5-essentials](https://www.npmjs.com/package/@ckeditor/ckeditor5-essentials/v/49.0.0): v48.5.2 => v49.0.0
* [@ckeditor/ckeditor5-export-inline-styles](https://www.npmjs.com/package/@ckeditor/ckeditor5-export-inline-styles/v/49.0.0): v48.5.2 => v49.0.0
* [@ckeditor/ckeditor5-find-and-replace](https://www.npmjs.com/package/@ckeditor/ckeditor5-find-and-replace/v/49.0.0): v48.5.2 => v49.0.0
* [@ckeditor/ckeditor5-footnotes](https://www.npmjs.com/package/@ckeditor/ckeditor5-footnotes/v/49.0.0): v48.5.2 => v49.0.0
* [@ckeditor/ckeditor5-format-painter](https://www.npmjs.com/package/@ckeditor/ckeditor5-format-painter/v/49.0.0): v48.5.2 => v49.0.0
* [@ckeditor/ckeditor5-heading](https://www.npmjs.com/package/@ckeditor/ckeditor5-heading/v/49.0.0): v48.5.2 => v49.0.0
* [@ckeditor/ckeditor5-highlight](https://www.npmjs.com/package/@ckeditor/ckeditor5-highlight/v/49.0.0): v48.5.2 => v49.0.0
* [@ckeditor/ckeditor5-html-embed](https://www.npmjs.com/package/@ckeditor/ckeditor5-html-embed/v/49.0.0): v48.5.2 => v49.0.0
* [@ckeditor/ckeditor5-html-support](https://www.npmjs.com/package/@ckeditor/ckeditor5-html-support/v/49.0.0): v48.5.2 => v49.0.0
* [@ckeditor/ckeditor5-icons](https://www.npmjs.com/package/@ckeditor/ckeditor5-icons/v/49.0.0): v48.5.2 => v49.0.0
* [@ckeditor/ckeditor5-image](https://www.npmjs.com/package/@ckeditor/ckeditor5-image/v/49.0.0): v48.5.2 => v49.0.0
* [@ckeditor/ckeditor5-import-word](https://www.npmjs.com/package/@ckeditor/ckeditor5-import-word/v/49.0.0): v48.5.2 => v49.0.0
* [@ckeditor/ckeditor5-indent](https://www.npmjs.com/package/@ckeditor/ckeditor5-indent/v/49.0.0): v48.5.2 => v49.0.0
* [@ckeditor/ckeditor5-language](https://www.npmjs.com/package/@ckeditor/ckeditor5-language/v/49.0.0): v48.5.2 => v49.0.0
* [@ckeditor/ckeditor5-line-height](https://www.npmjs.com/package/@ckeditor/ckeditor5-line-height/v/49.0.0): v48.5.2 => v49.0.0
* [@ckeditor/ckeditor5-link](https://www.npmjs.com/package/@ckeditor/ckeditor5-link/v/49.0.0): v48.5.2 => v49.0.0
* [@ckeditor/ckeditor5-list](https://www.npmjs.com/package/@ckeditor/ckeditor5-list/v/49.0.0): v48.5.2 => v49.0.0
* [@ckeditor/ckeditor5-list-multi-level](https://www.npmjs.com/package/@ckeditor/ckeditor5-list-multi-level/v/49.0.0): v48.5.2 => v49.0.0
* [@ckeditor/ckeditor5-markdown-gfm](https://www.npmjs.com/package/@ckeditor/ckeditor5-markdown-gfm/v/49.0.0): v48.5.2 => v49.0.0
* [@ckeditor/ckeditor5-media-embed](https://www.npmjs.com/package/@ckeditor/ckeditor5-media-embed/v/49.0.0): v48.5.2 => v49.0.0
* [@ckeditor/ckeditor5-minimap](https://www.npmjs.com/package/@ckeditor/ckeditor5-minimap/v/49.0.0): v48.5.2 => v49.0.0
* [@ckeditor/ckeditor5-operations-compressor](https://www.npmjs.com/package/@ckeditor/ckeditor5-operations-compressor/v/49.0.0): v48.5.2 => v49.0.0
* [@ckeditor/ckeditor5-page-break](https://www.npmjs.com/package/@ckeditor/ckeditor5-page-break/v/49.0.0): v48.5.2 => v49.0.0
* [@ckeditor/ckeditor5-pagination](https://www.npmjs.com/package/@ckeditor/ckeditor5-pagination/v/49.0.0): v48.5.2 => v49.0.0
* [@ckeditor/ckeditor5-paragraph](https://www.npmjs.com/package/@ckeditor/ckeditor5-paragraph/v/49.0.0): v48.5.2 => v49.0.0
* [@ckeditor/ckeditor5-paste-from-office](https://www.npmjs.com/package/@ckeditor/ckeditor5-paste-from-office/v/49.0.0): v48.5.2 => v49.0.0
* [@ckeditor/ckeditor5-paste-from-office-enhanced](https://www.npmjs.com/package/@ckeditor/ckeditor5-paste-from-office-enhanced/v/49.0.0): v48.5.2 => v49.0.0
* [@ckeditor/ckeditor5-remove-format](https://www.npmjs.com/package/@ckeditor/ckeditor5-remove-format/v/49.0.0): v48.5.2 => v49.0.0
* [@ckeditor/ckeditor5-restricted-editing](https://www.npmjs.com/package/@ckeditor/ckeditor5-restricted-editing/v/49.0.0): v48.5.2 => v49.0.0
* [@ckeditor/ckeditor5-revision-history](https://www.npmjs.com/package/@ckeditor/ckeditor5-revision-history/v/49.0.0): v48.5.2 => v49.0.0
* [@ckeditor/ckeditor5-select-all](https://www.npmjs.com/package/@ckeditor/ckeditor5-select-all/v/49.0.0): v48.5.2 => v49.0.0
* [@ckeditor/ckeditor5-show-blocks](https://www.npmjs.com/package/@ckeditor/ckeditor5-show-blocks/v/49.0.0): v48.5.2 => v49.0.0
* [@ckeditor/ckeditor5-slash-command](https://www.npmjs.com/package/@ckeditor/ckeditor5-slash-command/v/49.0.0): v48.5.2 => v49.0.0
* [@ckeditor/ckeditor5-source-editing](https://www.npmjs.com/package/@ckeditor/ckeditor5-source-editing/v/49.0.0): v48.5.2 => v49.0.0
* [@ckeditor/ckeditor5-source-editing-enhanced](https://www.npmjs.com/package/@ckeditor/ckeditor5-source-editing-enhanced/v/49.0.0): v48.5.2 => v49.0.0
* [@ckeditor/ckeditor5-special-characters](https://www.npmjs.com/package/@ckeditor/ckeditor5-special-characters/v/49.0.0): v48.5.2 => v49.0.0
* [@ckeditor/ckeditor5-style](https://www.npmjs.com/package/@ckeditor/ckeditor5-style/v/49.0.0): v48.5.2 => v49.0.0
* [@ckeditor/ckeditor5-template](https://www.npmjs.com/package/@ckeditor/ckeditor5-template/v/49.0.0): v48.5.2 => v49.0.0
* [@ckeditor/ckeditor5-typing](https://www.npmjs.com/package/@ckeditor/ckeditor5-typing/v/49.0.0): v48.5.2 => v49.0.0
* [@ckeditor/ckeditor5-undo](https://www.npmjs.com/package/@ckeditor/ckeditor5-undo/v/49.0.0): v48.5.2 => v49.0.0
* [@ckeditor/ckeditor5-upload](https://www.npmjs.com/package/@ckeditor/ckeditor5-upload/v/49.0.0): v48.5.2 => v49.0.0
* [@ckeditor/ckeditor5-widget](https://www.npmjs.com/package/@ckeditor/ckeditor5-widget/v/49.0.0): v48.5.2 => v49.0.0
* [@ckeditor/ckeditor5-word-count](https://www.npmjs.com/package/@ckeditor/ckeditor5-word-count/v/49.0.0): v48.5.2 => v49.0.0
* [ckeditor5-premium-features](https://www.npmjs.com/package/ckeditor5-premium-features/v/49.0.0): v48.5.2 => v49.0.0
</details>


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

---

To see all releases, visit the [release page](https://github.com/ckeditor/ckeditor5/releases).
