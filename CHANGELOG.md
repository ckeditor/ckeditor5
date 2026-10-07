Changelog
=========

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

---

To see all releases, visit the [release page](https://github.com/ckeditor/ckeditor5/releases).
