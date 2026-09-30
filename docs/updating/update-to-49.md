---
category: update-guides
meta-title: Update to version 49.x | CKEditor 5 Documentation
menu-title: Update to v49.x
order: 75
modified_at: 2026-09-15
---

# Update to CKEditor&nbsp;5 v49.x

## Update to CKEditor&nbsp;5 v49.0.0

### The Watchdog is removed

The Watchdog is gone in v49. That removes the `@ckeditor/ckeditor5-watchdog` package, the `EditorWatchdog` and `ContextWatchdog` classes, and the static fields that exposed them on every editor class. Nothing restarts a crashed editor anymore, and no editor content is saved or restored for you.

In its place, `onEditorError()` reports the errors that escape a running editor, together with the editor or context they were attributed to, and your application decides what happens next. The {@link getting-started/setup/error-handling error handling} guide covers the options; the {@link updating/migration-from-watchdog migrating from the Watchdog} guide covers the move in plain JavaScript and in each of the framework integrations.

<info-box warning>
	This changes the default behavior for everyone using the React, Vue, or Angular integrations, not only for those who configured a watchdog. All three attached one on your behalf. An editor that used to be rebuilt after a crash now stays as it is, with its content and undo history intact. They also now require CKEditor&nbsp;5 in version 49 or higher.
</info-box>

`ActionsRecorder` was not removed with the package. It moved to `@ckeditor/ckeditor5-core`, so change the specifier if you imported it from the Watchdog package. Importing it from `ckeditor5` keeps working unchanged.

### Changes to using CKEditor AI features in the custom UI mode

If you display the {@link features/ckeditor-ai-overview CKEditor&nbsp;AI} user interface in the {@link module:ai/aiconfig~AIContainerCustom `'custom'`} container type, the floating user interface of the AI features — their balloons, dialogs, and dropdowns — is no longer mounted in `document.body` by each AI feature separately. It is mounted in the DOM tree the AI user interface lives in, and in this type only your integration knows which tree that is, so set `AITabs#container` to the container you placed the AI user interface in.

Left unset, the floating user interface falls back to `document.body`, which may leave it unstyled if the AI user interface runs inside a shadow root.

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
