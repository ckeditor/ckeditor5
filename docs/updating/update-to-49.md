---
category: update-guides
meta-title: Update to version 49.x | CKEditor 5 Documentation
menu-title: Update to v49.x
order: 50
modified_at: 2026-10-01
---

# Update to CKEditor&nbsp;5 v49.x

<info-box tip>
	**Let an AI coding agent do the update for you.** The official `ckeditor-update` skill walks your agent through every update guide between your version and the target one and applies the changes to your code. Install the CKEditor&nbsp;5 skills:

	```bash
	npx skills add ckeditor/skills
	```

	Then ask your agent, for example: _"Update CKEditor&nbsp;5 to the latest version"_ or name the version you want. Review the changes before you commit them. See the {@link getting-started/ai-coding-agents Using CKEditor&nbsp;5 with AI coding agents} guide for setup options and supported agents.
</info-box>

## Update to CKEditor&nbsp;5 v49.0.0

### Refreshed theme and design tokens

Version 49 ships a refreshed default editor theme built on a reorganized set of design tokens (CSS variables). The default look changed, and many token names were renamed or restructured. Overriding the old names continues to work through backward-compatible fallbacks, but reading old names or depending on specific old values may need adjustments.

If you customized the editor's appearance, start with the {@link updating/migration-to-refreshed-theme Migrating to the refreshed theme} guide, which covers what changed, the backward-compatibility mechanisms, and how to restore the previous look. To work with the new tokens, see the {@link framework/theme-customization Theme customization} and {@link framework/theme-token-naming Theme token naming} guides.

### The Watchdog is removed

The Watchdog is gone in v49. That removes the `@ckeditor/ckeditor5-watchdog` package, the `EditorWatchdog` and `ContextWatchdog` classes, and the static fields that exposed them on every editor class. Nothing restarts a crashed editor anymore, and no editor content is saved or restored for you. To learn why we removed it, see the [announcement on GitHub](https://github.com/ckeditor/ckeditor5/issues/20230).

In its place, `onEditorError()` reports the errors that escape a running editor, together with the editor or context they were attributed to, and your application decides what happens next. The {@link getting-started/setup/error-handling error handling} guide covers the options; the {@link updating/migration-from-watchdog migrating from the Watchdog} guide covers the move in plain JavaScript and in each of the framework integrations.

<info-box warning>
	This changes the default behavior for everyone using the React, Vue, or Angular integrations, not only for those who configured a watchdog. All three attached one on your behalf. An editor that used to be rebuilt after a crash now stays as it is, with its content and undo history intact. They also now require CKEditor&nbsp;5 in version 49 or higher.
</info-box>

`ActionsRecorder` was not removed with the package. It moved to `@ckeditor/ckeditor5-core`, so change the specifier if you imported it from the Watchdog package. Importing it from `ckeditor5` keeps working unchanged.

### Running the editor inside a shadow DOM

CKEditor&nbsp;5 can now run inside an open shadow root. Selection, focus, positioning, scrolling, drag and drop, and the floating user interface all work there, and so do the premium features. Closed shadow roots are not supported.

#### Setting up the editor in a shadow root

A shadow root is a separate styling boundary, so two things do not happen by themselves:

* The editor style sheets have to be loaded into every tree that holds the editor user interface: the shadow root the editor lives in, and the tree its floating user interface mounts in.
* CSS variables have to be overridden on every shadow host that holds the editor user interface, including the host of the overlay container, instead of on `:root`. The editor style sheets now declare their variables on both `:root` and `:host`, so they resolve in both places. If your custom style sheet declares variables of its own, declare them on both selectors as well.

By default, balloons, dialogs, and tooltips mount in the tree the editing root lives in. Inside a shadow root, the shadow host or one of its ancestors may then clip or misplace them, for example when it has `overflow: hidden` or `position: relative`. That is why an editor in a shadow root logs the `ui-overlay-container-not-configured` warning. The new {@link module:core/editor/editorconfig~UiConfig#overlayContainer `config.ui.overlayContainer`} option lets you mount them elsewhere, and setting it silences the warning. We recommend a dedicated shadow root at the end of `<body>`, with the editor style sheets adopted into it. The {@link getting-started/setup/shadow-dom#where-the-floating-user-interface-mounts Where the floating user interface mounts} section of the Shadow DOM guide shows how to set it up.

Some features with a floating user interface of their own accept a container option as well: {@link module:comments/config~AnnotationsSidebarConfig#overlayContainer `config.sidebar.overlayContainer`}, {@link module:real-time-collaboration/config~RtcPresenceListConfig#overlayContainer `config.presenceList.overlayContainer`}, and {@link module:ai/aiconfig~AIConfig#overlayContainer `config.ai.overlayContainer`}. When they are not set, these features use `config.ui.overlayContainer`. In a setup with a {@link module:core/context~Context `Context`}, the sidebar and the presence list read these options from the context configuration, so set `config.ui.overlayContainer` there as well.

The {@link getting-started/setup/shadow-dom Shadow DOM} guide covers the setup in detail. Each framework integration guide has a section on using the editor inside a shadow root:

* From npm: {@link getting-started/integrations/react-default-npm#using-inside-a-shadow-root React}, {@link getting-started/integrations/vue-default-npm#using-inside-a-shadow-root Vue}, and {@link getting-started/integrations/angular#using-inside-a-shadow-root Angular}.
* From CDN: {@link getting-started/integrations-cdn/react-default-cdn#using-inside-a-shadow-root React}, {@link getting-started/integrations-cdn/vue-default-cdn#using-inside-a-shadow-root Vue}, and {@link getting-started/integrations-cdn/angular#using-inside-a-shadow-root Angular}.

#### Changes that affect every editor

Some changes apply even if you do not use a shadow root:

* **The body collection is attached later, and once per mount target.** There is one `.ck-body-wrapper` element per mount target now, not one per page. Editors in the light DOM without an overlay container still share the one in `<body>`, but an editor in a shadow root, or one with `config.ui.overlayContainer` set, uses a wrapper in that root or container. The wrapper is not in the DOM until the editing root is connected to the document. Instead of `document.querySelector( '.ck-body-wrapper' )`, read {@link module:ui/editorui/bodycollection~BodyCollection#bodyCollectionContainer `editor.ui.view.body.bodyCollectionContainer`}. It is the editor's own `.ck-body` element inside the wrapper, and it is available as soon as the editor is created.
* **Page-level rules moved out of the theme style sheets.** The editor now adopts the rules behind the `ck-fullscreen-scroll-locked` and `ck-dialog-scroll-locked` classes into the document at runtime. They come later in the cascade than the theme style sheets, so overriding them may need higher specificity.
* **The fullscreen mode has a new default container.** When {@link module:fullscreen/fullscreenconfig~FullscreenConfig#container `config.fullscreen.container`} is not set, the fullscreen mode mounts in `config.ui.overlayContainer`, then in the shadow root the editor lives in, and only then in `<body>`. The option no longer has a default value, so `editor.config.get( 'fullscreen.container' )` returns `undefined` when you do not set it. When `config.fullscreen.container` points at an element of your layout, the fullscreen mode fills that element instead of covering the viewport. Its wrapper then gets the new `ck-fullscreen__main-wrapper_custom-container` class, which custom CSS may need to target.

#### Writing features that work in a shadow root

Native DOM APIs such as `document.activeElement`, `window.getSelection()`, and `Node#contains()` give wrong answers inside a shadow root, and nothing throws. Custom plugins that use them should switch to the shadow-aware helpers exported from the `ckeditor5` package. The {@link framework/deep-dive/shadow-dom#the-shadow-aware-helpers Shadow-aware helpers} section of the deep dive guide explains what each one replaces and when to use it:

* Focus, selection, and hit-testing: `getActiveElement()`, `getSelection()`, `containsNode()`, and `getElementFromPoint()`.
* Walking up the tree: `getParentNode()` and `getParentElement()` for structure, `getLayoutParentNode()` and `getLayoutParentElement()` for geometry.
* Shadow roots: `getShadowRoots()`, `isShadowRoot()`, `isShadowHostOf()`, `ShadowRootRegistry`, and `listenToShadowRoots()`.
* Floating user interface and styles: `getOverlayMountRoot()`, `OverlayHost`, and `adoptGlobalStyleSheet()`.

The {@link framework/deep-dive/shadow-dom#porting-an-existing-feature Porting an existing feature} section of the deep dive guide walks you through updating an existing feature, including the ESLint rules that find the code to change.

### Changes to using CKEditor AI features in the custom UI mode

If you display the {@link features/ckeditor-ai-overview CKEditor&nbsp;AI} user interface in the {@link module:ai/aiconfig~AIContainerCustom `'custom'`} container type, the floating user interface of the AI features — their balloons, dialogs, and dropdowns — is no longer mounted in `document.body` by each AI feature separately. It is mounted in the DOM tree the AI user interface lives in, and in this type only your integration knows which tree that is, so set `AITabs#container` to the container you placed the AI user interface in.

Left unset, the floating user interface falls back to `document.body`, which may leave it unstyled if the AI user interface runs inside a shadow root. When `config.ui.overlayContainer` is set, the floating user interface mounts in it instead, whatever `AITabs#container` holds.

```js-diff
 .then( editor => {
 	const tabsPlugin = editor.plugins.get( 'AITabs' );

 	for ( const id of tabsPlugin.view.getTabIds() ) {
 		const tab = tabsPlugin.view.getTab( id );

 		// Display tab button and panel in a custom container.
 		myButtonsContainer.appendChild( tab.button.element );
 		myPanelContainer.appendChild( tab.panel.element );
 	}

+	// Tells the AI features which DOM tree their floating UI belongs in.
+	tabsPlugin.container = myPanelContainer;
 } );
```

Alternatively, point the new {@link module:ai/aiconfig~AIConfig#overlayContainer `config.ai.overlayContainer`} option at a container of your own. It takes precedence over the container above, and it is the better choice when the container you placed the AI user interface in is positioned, scrollable, or clipping — a floating UI placed inside such a container drifts away from what it is pinned to as the page scrolls:

```js
ClassicEditor
	.create( {
		attachTo: document.querySelector( '#editor' ),

		ai: {
			container: { type: 'custom' },

			// A container of your own, at the end of `<body>`, with nothing above it to clip or shift it.
			overlayContainer: document.querySelector( '#ai-overlay-container' )
		}
	} );
```

See the {@link features/ckeditor-ai-integration#overlay-ui-container overlay UI container} section of the integration guide for details, including what to point it at when the AI user interface runs inside a shadow root.

### Major breaking changes in this release

* **[ckeditor5](https://www.npmjs.com/package/ckeditor5), [core](https://www.npmjs.com/package/@ckeditor/ckeditor5-core), [utils](https://www.npmjs.com/package/@ckeditor/ckeditor5-utils)**: The `@ckeditor/ckeditor5-watchdog` package was removed, and with it the automatic restart of a crashed editor. An editor that crashes now stays as it is, with its content and its undo history, instead of being rebuilt from the data it had before.
  * The `EditorWatchdog` and `ContextWatchdog` classes are gone, as are the `Watchdog` base class and the `WatchdogConfig` type. They are no longer re-exported from `ckeditor5`.
  * The `Editor.EditorWatchdog` and `Editor.ContextWatchdog` static fields were removed from every editor class.
  * Use `onEditorError()` to observe errors instead. It reports the error together with the editor or context it came from and returns a function that unregisters the callback. The same function is reachable as `Editor.onEditorError()` and `Context.onEditorError()`.
  * If you used `ContextWatchdog` to share a context between editors, create the `Context` yourself and pass it in the editor configuration. You now have to destroy the context yourself, which `ContextWatchdog` used to do for you.

  See [The Watchdog is removed](#the-watchdog-is-removed).
* **[core](https://www.npmjs.com/package/@ckeditor/ckeditor5-core)**: `ActionsRecorder` moved from `@ckeditor/ckeditor5-watchdog` to `@ckeditor/ckeditor5-core`. The `ActionsRecorderConfig`, `ActionsRecorderEntry`, `ActionsRecorderEntryEditorSnapshot`, `ActionsRecorderErrorCallback`, `ActionsRecorderFilterCallback`, and `ActionsRecorderMaxEntriesCallback` types moved with it, as did the `config.actionsRecorder` declaration. Code importing from `ckeditor5` needs no change. Code importing from `@ckeditor/ckeditor5-watchdog` has to import from `@ckeditor/ckeditor5-core` instead.
* **[ui](https://www.npmjs.com/package/@ckeditor/ckeditor5-ui)**: The `TooltipManager` constructor is private now. As before, there is one shared instance per page. Replace `new TooltipManager( editor )` with `TooltipManager.for( locale )`, and `tooltipManager.destroy( editor )` with `tooltipManager.release()`. Call `release()` once for every `for()` call: the instance counts its holders and is destroyed when the last one releases it. The manager is no longer tied to editors. Each editor registers its own body collection with `TooltipManager#registerBodyCollection()`, and UI that renders in a body collection of its own, outside an editor, has to do the same to display tooltips. Such UI unregisters its collection with `TooltipManager#unregisterBodyCollection()` when it is destroyed. Code that only reads `editor.ui.tooltipManager` needs no change.
* **[ui](https://www.npmjs.com/package/@ckeditor/ckeditor5-ui)**: The `BodyCollection#detachFromDom()` method is renamed to `BodyCollection#destroy()`. It still destroys the views and removes their container from the DOM. Replace `detachFromDom()` calls with `destroy()`. If your code called `detachFromDom()` and then `destroy()`, keep only `destroy()`. To remove the container from the DOM without destroying the views, so that you can attach it again later, use the new `BodyCollection#unmountFromDom()` method.

### Minor breaking changes in this release

* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai)**: `AITabs#container` is an observable property of the `HTMLElement | ShadowRoot | null` type now. With the `'overlay'` container type, it holds a shadow root when the editor lives in one. Update code that expects an `HTMLElement` there. See [Changes to using CKEditor AI features in the custom UI mode](#changes-to-using-ckeditor-ai-features-in-the-custom-ui-mode).
* **[engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine)**: The `ViewRenderer#domDocuments` property is removed. There is no public replacement.
* **[ui](https://www.npmjs.com/package/@ckeditor/ckeditor5-ui)**: The `clickOutsideHandler()` function no longer accepts the `listenerOptions` option. Remove it from the call. The function sets the priority and capture mode of its listeners itself.
* **[uploadcare](https://www.npmjs.com/package/@ckeditor/ckeditor5-uploadcare)**: The `uc-config` and `uc-upload-ctx-provider` elements are added to the editor body collection instead of `document.body`. Use `UploadcareEditing#configElement` and `UploadcareEditing#ctxElement` instead of looking them up in the document.
* **[utils](https://www.npmjs.com/package/@ckeditor/ckeditor5-utils)**: The `getCommonAncestor()` DOM utility is removed. Walk the ancestors of both nodes with `getParentNode()` and compare the chains. For the editor tree, use the `getCommonAncestor()` methods of the model and view.
* **[utils](https://www.npmjs.com/package/@ckeditor/ckeditor5-utils)**: The `getPositionedAncestor()` function returns `null` for an element that is not connected to a document. Previously, it only required the element to have a parent. It also behaves differently in these cases:
  * It returns `<body>` when a style such as `position: relative` or `transform` makes the body the containing block. Previously, it returned `null` for the main document's `<body>` in every case.
  * For an element inside an iframe, it returns `null` instead of the iframe's static `<body>`, as it already did in the main document.
  * For an element assigned to a `<slot>`, it looks for the positioned ancestor in the shadow tree that renders the element.
