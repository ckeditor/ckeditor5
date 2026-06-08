---
category: update-guides
meta-title: Update to version 48.x | CKEditor 5 Documentation
menu-title: Update to v48.x
order: 76
modified_at: 2026-06-05
---

# Update to CKEditor&nbsp;5 v48.x

<info-box>
	When updating your CKEditor&nbsp;5 installation, ensure **all the packages are the same version** to avoid errors.

	You may try removing the `package-lock.json` or `yarn.lock` files (if applicable) and reinstalling all packages before rebuilding the editor. For optimal results, ensure you use the most recent package versions.
</info-box>

## Update to CKEditor&nbsp;5 v48.2.0

Released on 2 June, 2026. ([See full release notes](https://github.com/ckeditor/ckeditor5/releases/tag/v48.2.0))

This release introduces media embed resize and styling, editor roots on paragraph-like elements, skip-level lists, General HTML Support integration with CKEditor AI, and paste and drag-and-drop support in AI Chat.

### Media embed improvements (⭐)

The {@link features/media-embed Media embed} feature now supports resizing via drag handles and alignment with optional text wrapping, letting embedded videos and other media be positioned left, right, or center with surrounding content flowing around them. Style options are available through the new `config.mediaEmbed.styles.options` configuration and inline split-button toolbar entries. See the {@link features/media-embed-resize Media embed resize} and {@link features/media-embed-styles Media embed styles} guides for details.

### Media embed markup changes

As part of the new media embed resize and styling features, the built-in media providers now output a modernized iframe. Previously, each provider used a `padding-bottom` hack on the wrapper `<div>` to maintain the aspect ratio, with the iframe absolutely positioned inside it. The iframe now carries explicit `width` and `height` attributes that act as its intrinsic size (a useful layout hint in containers such as table cells), and relies on the CSS `aspect-ratio` property for responsive sizing. The surrounding `<div>` wrapper is preserved for backward compatibility:

```html
<!-- Before -->
<div style="position: relative; padding-bottom: 56.2493%; height: 0;">
	<iframe src="..." style="position: absolute; width: 100%; height: 100%; top: 0; left: 0;"></iframe>
</div>

<!-- After -->
<div>
	<iframe src="..." width="1280" height="720" style="width: 100%; height: auto; aspect-ratio: 16 / 9; border: 0; display: block;"></iframe>
</div>
```

Because the wrapper `<div>` is still present, custom CSS and queries that target it continue to work, so no changes are required in most cases. However:

* If your custom styles **relied on the previous inline styles** (the wrapper `padding-bottom` aspect-ratio hack or the absolutely positioned iframe), review them against the new `aspect-ratio`-based markup.
* If you registered **custom media providers** through `config.mediaEmbed.providers` or `config.mediaEmbed.extraProviders`, your existing `html` output keeps working, but we recommend switching to the `aspect-ratio` approach so resizing and styling behave correctly.

### Editor roots on paragraph-like elements (⭐)

Editor roots can now be attached to, or created as, any block-level element other than the default container. The `config.root.element` and `config.roots.<name>.element` options now accept a tag-name string (such as `'h1'`) or a {@link module:core/editor/editorconfig~ViewRootElementDefinition `ViewRootElementDefinition`} object defining the tag name, CSS classes, inline styles, and attributes. The `<textarea>` and `<input>` elements are not supported. {@link module:editor-multi-root/multirooteditor~MultiRootEditor#createEditable `MultiRootEditor#createEditable()`} also accepts a `ViewRootElementDefinition`, and root element definitions are replicated through real-time collaboration. No migration steps are required.

### Skip-level lists

The {@link features/lists-editing#skip-level-lists list feature} now supports skip-level nesting via the new `list.enableSkipLevelLists` configuration option. List items can be indented by more than one level at a time, preserving the structure of documents imported or pasted from Word and other HTML sources that use non-sequential indentation levels.

### General HTML Support in CKEditor AI (⭐)

{@link features/ckeditor-ai-overview CKEditor AI} now works in editors configured with {@link features/general-html-support General HTML Support}. AI Chat, AI Quick Actions, and AI Review can apply and suggest changes on content that uses additional GHS-allowed elements and attributes.

### Paste and drag and drop in AI Chat

The {@link features/ckeditor-ai-chat AI Chat} input now supports pasting and drag and drop. Pasting a bare URL adds it to the conversation context as a link pill, pasting long text attaches it as a `.txt` file, and pasting or dropping images and other supported files adds them as context pills, with a dedicated icon for images.

### Other AI improvements

* **Multi-root and multi-editor support.** The {@link features/ckeditor-ai-multi-root-multi-editor-support multi-root and multiple editor support} introduced as experimental in v48.1.0 is now generally available and supports adding or removing editor instances at runtime.
* **Default typography for AI Chat responses.** Built-in styles for body text, headings, lists, code, tables, block quotations, and horizontal rules improve readability of generated content.
* **Resilient streaming.** Streaming replies in AI Chat continue on the server when the page is closed or reloaded and reconnect when the conversation is reopened. Stop generating still cancels the reply.
* **Programmatic AI Review API.** A new programmatic API for the `AIReview` plugin is documented under {@link features/ckeditor-ai-programmatic Using CKEditor AI programmatically}.

### Other improvements and fixes

* Track Changes integrates with General HTML Support and with media embed resize and style operations: GHS-driven element, class, and inline-style changes are now recorded as suggestions instead of being applied silently.
* Numbered list autoformat now accepts any starting number — typing `5. ` (or any number followed by `.` or `)` and a space) creates a numbered list. When `list.properties.startIndex` is enabled, the list starts at the typed number.
* Tables with resized columns now keep their column widths when exported as email.
* Spotify track embeds use a fixed `80px` height; album and artist embeds keep their responsive aspect ratio.
* Inline images are no longer allowed in inline-only roots such as `$inlineRoot` and custom inline-only roots.

### Minor breaking changes in this release

* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai)**: Changed CKEditor AI APIs used by custom workflows. See the API documentation for details.
  * Removed methods: `AIChatContext#updateCurrentDocument()` (use `AIChatContext#updateCurrentDocuments()`), `AIEditing#sessionId` (use `AIEditing#getSessionId( editor )`), `AIChatContext#getSourceByDataId()`, `AIChatContext#getDocumentContextSliceByDataId()`.
  * Removed properties: `AIReply#documentId`, `AIReply#newNodeAnchorIds`, `AIReply#dataIdDocumentSources`.
  * Modified method signatures: `AIReply#appendContent( content )`, `AIEditing#modelToDataWithIds( modelFragment )`, `AIChatController#addSelectionToChatContext()`, `AIEditing#getSelectionText()`.
  * Modified property types: `AIReply#content`, `AIReply#parsedContent`, `AIReply#parsedMergedContent`, `AIReply#documentContextContent`.

## Update to CKEditor&nbsp;5 v48.1.1

Released on 18 May, 2026. ([See full release notes](https://github.com/ckeditor/ckeditor5/releases/tag/v48.1.1))

### Dependency security update for real-time collaboration

This release addresses vulnerabilities reported in the [`protobufjs`](https://www.npmjs.com/package/protobufjs) package, which is used inside [`@ckeditor/ckeditor5-operations-compressor`](https://www.npmjs.com/package/@ckeditor/ckeditor5-operations-compressor) for real-time collaboration. Our security analysis confirmed that these vulnerabilities **do not affect** CKEditor&nbsp;5. The bump is published so that integrations using real-time collaboration no longer see noise from third-party security scanners.

This release also includes two small fixes: the AI Review tooltip now appears when hovering over review suggestions, and the spacing of the footnotes list divider is corrected.

## Update to CKEditor&nbsp;5 v48.1.0

Released on 13 May, 2026. ([See full release notes](https://github.com/ckeditor/ckeditor5/releases/tag/v48.1.0))

This release improves AI Chat formatting and rendering, introduces experimental AI support for multi-root and multiple editor setups, and strengthens compatibility with structured content pasted from Office and exported for email.

### AI Chat: better formatting and rendering (⭐)

{@link features/ckeditor-ai-chat AI Chat} now handles raw, unformatted content more reliably. Asking AI Chat to format a pasted transcript, add headings, or convert content into a list produces cleaner and more predictable results.

The AI Chat feed also renders generated content differently. Proposed changes now appear in full when they are ready, while plain assistant text continues to stream at a faster pace.

### Experimental: AI in multi-root and multiple editor setups (⭐)

AI features now {@link features/ckeditor-ai-multi-root-multi-editor-support support multi-root editors and multiple editor instances} that share a {@link module:core/context~Context `Context`}. This helps integrations that use several editor areas on one page, such as a title, body, sidebar, or document sections split into independent roots.

With this release:

* AI Review and AI Translate run across all roots in a multi-root editor and across all editors that share a `Context`. Changes are applied to the related root or editor.
* AI Chat uses content from the focused root or editor, applies suggestions to the related destination, and keeps separate conversation history for each editor in a `Context`.

This feature is experimental and ready for testing in multi-root and multiple editor integrations.

### AI Chat feed items align to the bottom by default

The AI Chat feed items are now aligned to the bottom of the feed by default. This keeps the most recent messages in view as the conversation grows, in line with common chat interface conventions.

If you want to revert to the previous top-aligned behavior, add the following CSS to your integration:

```css
.ck.ck-ai-chat__feed__items {
	margin-top: 0;
}
```

### Other improvements and fixes

This release also includes several improvements for content editing, Office content compatibility, and email output:

* Marker boundary elements registered with `markerToElement()` now render in the same order as in the model when two markers meet at the same position. This affects features that rely on markers, including comments, suggestions, mentions, find and replace, and restricted editing.
* Inline formatting such as bold, italic, font size, font family, font color, and background color is now retained after pressing <kbd>Shift</kbd>+<kbd>Enter</kbd> twice or after deleting all text inside a block and continuing to type.
* {@link features/source-editing Source editing} now supports native undo and redo keystrokes in the source editing textarea.
* The editor now handles {@link features/tables#table-alignment alignment attributes} on `<td>` elements that wrap nested tables or images. This improves compatibility with content from Outlook and other sources that use `td[align]` for block layout.
* Tables now preserve their alignment and inline styles after the {@link features/email#email-specific-style-transformations email export transformation}, improving rendering in Outlook, Gmail, and other major email clients.

### Minor breaking changes in this release

* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai)**: The AI Chat feed items are now aligned to the bottom of the feed by default. To revert to the previous top-aligned behavior, override the relevant CSS in your integration.
* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai)**: To reduce visual strain on the user, suggestions proposed by the agent in the AI Chat feed are now always displayed in full when ready (previously streamed word-by-word).

## Update to CKEditor&nbsp;5 v48.0.0

Released on 31 March, 2026. ([See full release notes](https://github.com/ckeditor/ckeditor5/releases/tag/v48.0.0))

### Sunset of old installation methods (OIM)

Starting with v48.0.0, the old installation methods are officially sunset. The related setup guides were removed from regular documentation sections. The legacy setup guides remain available in the CKEditor&nbsp;5 LTS documentation for users who stay on the LTS line. The migration documentation remains available in the "Updating" category:

* {@link updating/nim-migration/migration-to-new-installation-methods Migration to new installation methods overview}
* {@link updating/nim-migration/predefined-builds Migrating from predefined builds}
* {@link updating/nim-migration/customized-builds Migrating from customized builds}
* {@link updating/nim-migration/dll-builds Migrating from DLL builds}
* {@link updating/nim-migration/online-builder Migrating from legacy Online Builder}

### Root configuration migration and deprecated top-level options

The root configuration has been normalized under `config.root` (single-root editors) and `config.roots` (multi-root editors).

The following top-level options are **deprecated**:

* `config.initialData`
* `config.placeholder`
* `config.label`

Additionally, the `sourceElementOrData` parameter (previously passed as the first argument to `Editor.create()`, `Watchdog.create()`, etc.) is deprecated. In v48, pass the DOM element in the configuration object using the editor-type-specific key: `attachTo` for `ClassicEditor`, `root.element` for single-root non-classic editors, and `roots.<name>.element` for `MultiRootEditor`.

For `ClassicEditor`, use `attachTo` only. Passing a DOM element to `root.element` is not supported and triggers a warning, because classic replaces the `attachTo` element with the full editor UI and creates the editable internally. Other editor types use `root.element` or `roots.<name>.element` directly as editable areas.

#### Migration examples

The examples below show how to migrate initialization for each editor type.

For `ClassicEditor`:

```js-diff
- ClassicEditor.create( document.querySelector( '#editor' ), {
- 	initialData: '<p>Hello world!</p>',
- 	placeholder: 'Type here...',
- 	label: 'Main content'
- } );
+ ClassicEditor.create( {
+ 	attachTo: document.querySelector( '#editor' ),
+ 	root: {
+ 		initialData: '<p>Hello world!</p>',
+ 		placeholder: 'Type here...',
+ 		label: 'Main content'
+ 	}
+ } );
```

For non-classic single-root editors (for example `InlineEditor`, `BalloonEditor`, or `DecoupledEditor`), pass the DOM element through `root.element`:

```js-diff
- InlineEditor.create( document.querySelector( '#editor' ), {
- 	initialData: '<p>Hello world!</p>',
- 	placeholder: 'Type here...'
- } );
+ InlineEditor.create( {
+ 	root: {
+ 		element: document.querySelector( '#editor' ),
+ 		initialData: '<p>Hello world!</p>',
+ 		placeholder: 'Type here...'
+ 	},
+ } );
```

In multi-root editors, move source elements and root-specific properties into the `roots` object:

```js-diff
- MultiRootEditor.create( {
- 	header: document.querySelector( '#header' ),
- 	content: document.querySelector( '#content' )
- }, {
- 	initialData: {
- 		header: '<h2>Header data</h2>',
- 		content: '<p>Content data</p>'
- 	},
- 	placeholder: {
- 		header: 'Header',
- 		content: 'Type here...'
- 	}
- } );
+ MultiRootEditor.create( {
+ 	roots: {
+ 		header: {
+ 			element: document.querySelector( '#header' ),
+ 			initialData: '<h2>Header data</h2>',
+ 			placeholder: 'Header'
+ 		},
+ 		content: {
+ 			element: document.querySelector( '#content' ),
+ 			initialData: '<p>Content data</p>',
+ 			placeholder: 'Type here...'
+ 		}
+ 	}
+ } );
```

Besides editor initialization changes, update related root configuration paths as well:

* `config.rootsAttributes` -> `config.roots.<rootName>.modelAttributes`
* `config.lazyRoots` -> `config.roots.<rootName>.lazyLoad`

The `lazyLoad` property is also **deprecated** and will be removed in future versions.

If your integration reads configuration values directly, update access paths as well:

* `config.get( 'initialData' )` -> `config.get( 'roots.main.initialData' )`
* `config.get( 'placeholder' )` -> `config.get( 'roots.main.placeholder' )`
* `config.get( 'label' )` -> `config.get( 'roots.main.label' )`

#### Dynamic root management

The legacy signatures of `MultiRootEditor#addRoot()` and `MultiRootEditor#createEditable()` are deprecated and will be removed in a future release. They are replaced with new signatures that align with the way the editor root configuration is specified in `config.roots`.

For `addRoot()`, the `data` and `attributes` options have been renamed to `initialData` and `modelAttributes`, and the new signature also accepts `placeholder` and `label`:

```js-diff
 editor.addRoot( 'myRoot', {
-	data: '<p>Initial root data.</p>',
-	attributes: { order: 1 },
+	initialData: '<p>Initial root data.</p>',
+	modelAttributes: { order: 1 },
+	placeholder: 'Type here...',
+	label: 'My root',
 	isUndoable: true
 } );
```

For `createEditable()`, pass an options object instead of positional `placeholder` and `label` arguments:

```js-diff
- const domElement = editor.createEditable( root, 'Type here...', 'My root' );
+ const domElement = editor.createEditable( root, {
+	placeholder: 'Type here...',
+	label: 'My root'
+ } );
```

### Table experimental features are now default

In CKEditor 5 v47, we introduced experimental flags for extended table block alignment, improved table border normalization, and table cell type support. Starting with v48, these features are fully stable and enabled by default.

You no longer need to use the `experimentalFlags.useExtendedTableBlockAlignment`, `experimentalFlags.upcastTableBorderZeroAttributes`, and `experimentalFlags.tableCellTypeSupport` configuration options.

Additionally, if you were using the experimental UI plugins (`TablePropertiesUIExperimental` and `TableCellPropertiesUIExperimental`), you should remove them and revert to using the standard `TableProperties` and `TableCellProperties` plugins.

```js-diff
 ClassicEditor
	.create( {
		attachTo: document.querySelector( '#editor' ),
		plugins: [
			Table,
-			TablePropertiesEditing,
-			TablePropertiesUIExperimental,
-			TableCellPropertiesEditing,
-			TableCellPropertiesUIExperimental,
+			TableProperties,
+			TableCellProperties,
			// Other plugins.
			// ...
		],
-		experimentalFlags: {
-			useExtendedTableBlockAlignment: true,
-			upcastTableBorderZeroAttributes: true,
-			tableCellTypeSupport: true
-		}
 	} )
 	.then( /* ... */ )
 	.catch( /* ... */ );
```

### Export to PDF v2 is now the default

Starting with v48, Export to PDF uses version 2 of the HTML to PDF converter API by default. Version 1 is deprecated and available only for backward compatibility.

```js
// Before (legacy V1 setup)
exportPdf: {
	version: 1,
	converterUrl: 'https://pdf-converter.cke-cs.com/v1/convert',
	converterOptions: {
		format: 'A4',
		margin_top: '20mm'
	}
}

// Now (v48 default)
exportPdf: {
	// No `version` needed (V2 is default).
	converterUrl: 'https://pdf-converter.cke-cs.com/v2/convert/html-pdf',
	converterOptions: {
		document: {
			size: 'A4',
			margins: { top: '20mm' }
		}
	}
}
```

This snippet highlights only selected changes. The V1 to V2 migration includes additional differences in available options and payload structure.

If your integration still relies on V1 configuration, migrate to V2. For migration steps and option mapping, see the [migration guide from V1 to V2](https://pdf-converter.cke-cs.com/v2/convert/docs#section/Export-to-PDF-(v2)/Migration-guide-from-v1-to-v2) and the {@link features/export-pdf Export to PDF feature guide}.

### CSS nesting output now follows native specificity more closely

As part of the preparation for a planned migration to native CSS nesting at the beginning of 2027, we updated the generated CSS output to behave more like native CSS nesting. We are not switching to native CSS nesting yet, but some compiled selectors may now have higher specificity than in earlier releases. We are making this change now to reduce the number of changes needed later.

This mainly affects nested rules written under a list of selectors. In some cases, the final selector may now be more specific than before. Because of this, some custom CSS overrides that worked in earlier versions may no longer apply without changes.

Most integrations should not be affected. However, if you override CKEditor&nbsp;5 styles with your own CSS, check whether any of your overrides stopped working after the update.

If needed, fix your custom styles by making your override selector more specific or by loading your CSS later so it takes precedence.

The following simplified example shows the kind of difference you may notice:

```css
/* Source code */
.ck.ck-button, a.ck.ck-button {
	&.ck-button_with-text {}
}

/* Before */
.ck.ck-button.ck-button_with-text, a.ck.ck-button.ck-button_with-text {}

/* After */
:is(.ck.ck-button, a.ck.ck-button).ck-button_with-text {}
```

The "Before" and "After" selectors look similar, but the second may have higher specificity because `:is()` adopts the specificity of the most specific selector in its list, which can change which rule wins in the cascade.

If you do not override the editor styles, no action is required.

### Deprecation of the `@ckeditor/ckeditor5-theme-lark` package

The `@ckeditor/ckeditor5-theme-lark` package has been deprecated. The styles from this package have been moved to respective feature packages. All generic styles that affect the editor's UI more broadly have been moved to the `@ckeditor/ckeditor5-ui` package.

If you import styles from the aggregate stylesheets, such as `ckeditor5/ckeditor5.css` and `ckeditor5-premium-features/ckeditor5-premium-features.css`, you don't need to change anything.

However, if you followed the {@link getting-started/setup/optimizing-build-size Optimizing build size} guide and imported styles from individual packages, you need to update your imports:

1. Remove the import from the `@ckeditor/ckeditor5-theme-lark` package:

	 ```js
	 // Remove this import.
	 import '@ckeditor/ckeditor5-theme-lark/dist/index.css';
	 ```

2. Move the import from the `@ckeditor/ckeditor5-ui` package to the top of your style imports:

	 ```js
	 // Move this import to the top of your styles imports.
	 import '@ckeditor/ckeditor5-ui/dist/index.css';
	 ```

### Mention feature now persists `uid` as `data-mention-uid` in the data output

The mention feature now outputs a `data-mention-uid` attribute on mention elements in the editor output. This ensures that the same HTML always produces the same editor internal data model.

If you use the default mention converters, no changes are required.

If you defined **custom downcast converters** for mentions (as described in the {@link features/mentions#customizing-the-output customizing the output} guide), update them to include `data-mention-uid` in the output and omit it during clipboard operations:

```js
// ❌ Before:
editor.conversion.for( 'downcast' ).attributeToElement( {
	model: 'mention',
	view: ( modelAttributeValue, { writer } ) => {
		if ( !modelAttributeValue ) {
			return;
		}

		return writer.createAttributeElement( 'a', {
			class: 'mention',
			'data-mention': modelAttributeValue.id,
			'href': modelAttributeValue.link
		}, {
			// Make mention attribute to be wrapped by other attribute elements.
			priority: 20,
			// Prevent merging mentions together in clipboard (when `data-mention-uid` is not available).
			id: modelAttributeValue.uid
		} );
	},
	converterPriority: 'high'
} );

// ✅ After:
editor.conversion.for( 'downcast' ).attributeToElement( {
	model: 'mention',
	view: ( modelAttributeValue, { writer, options } ) => {
		if ( !modelAttributeValue ) {
			return;
		}

		return writer.createAttributeElement( 'a', {
			class: 'mention',
			'data-mention': modelAttributeValue.id,
			'href': modelAttributeValue.link,
			// Omit `data-mention-uid` in clipboard (copy/cut) to prevent UIDs duplication.
			...( !options.isClipboardPipeline && { 'data-mention-uid': modelAttributeValue.uid } )
		}, {
			// Make mention attribute to be wrapped by other attribute elements.
			priority: 20,
			// Prevent merging mentions together in clipboard (when `data-mention-uid` is not available).
			id: modelAttributeValue.uid
		} );
	},
	converterPriority: 'high'
} );
```

### Collaboration user colors now use CSS-variable-based styling

The collaboration user coloring implementation has been refactored to use runtime CSS variables instead of using a mixin.

If you use only the default user colors, no changes are required. However, if you specified custom user colors, you can migrate by following these three steps:

1. Remove the `@ckeditor/ckeditor5-collaboration-core/theme/usercolormixin.css` import.
2. Replace `@mixin userColor` definitions with `--ck-user-colors--*` and `--ck-user-colors--*-alpha` CSS variables.

	The old and new approaches look like this:

	```css
	/* Before */
	@import "@ckeditor/ckeditor5-collaboration-core/theme/usercolormixin.css";

	@mixin userColor hsla(31, 90%, 43%, 1), hsla(31, 90%, 43%, 0.15), 8;
	@mixin userColor hsla(61, 90%, 43%, 1), hsla(61, 90%, 43%, 0.15), 9;
	```

	```css
	/* After */
	:root {
		--ck-user-colors--8: hsla(31, 90%, 43%, 1);
		--ck-user-colors--8-alpha: hsla(31, 90%, 43%, 0.15);

		--ck-user-colors--9: hsla(61, 90%, 43%, 1);
		--ck-user-colors--9-alpha: hsla(61, 90%, 43%, 0.15);
	}
	```

3. Keep the `config.users.colorsCount` option aligned with the total number of defined colors. For the example above (`0-9`), set:

	```js
	users: {
		colorsCount: 10
	}
	```

### Alignment of AI features configuration options

The AI part of the configuration has been reworked to provide consistent options across all the features.

#### AI Chat Shortcuts

In the {@link features/ckeditor-ai-chat#chat-shortcuts Chat&nbsp;Shortcuts} feature, the `check` property in the shortcut definition (see {@link module:ai/aichat/aichat~AIChatConfig#shortcuts `config.ai.chat.shortcuts`} configuration) has been renamed to `commandId`.

If you have any shortcuts defined, update the `check` property as shown below.

Before:

```js
{
	id: 'check-correctness',
	label: 'Proofread this document',
	type: 'review',
	check: 'correctness'
}
```

After:

```js
{
	id: 'check-correctness',
	label: 'Proofread this document',
	type: 'review',
	commandId: 'correctness'
}
```

#### AI Quick Actions

In the {@link features/ckeditor-ai-actions Quick&nbsp;Actions} feature, the `type` value for {@link module:ai/aiquickactions/aiquickactions~AIQuickActionsConfig#extraCommands `config.ai.quickActions.extraCommands`} has been changed from uppercase to lowercase. Instead of using `'CHAT'` or `'ACTION'`, use `'chat'` and `'action'` now.

Additionally, the `label` property has been introduced in place of the `displayedPrompt` property in the {@link module:ai/aiquickactions/aiquickactions~AIQuickActionsConfig#extraCommands `config.ai.quickActions.extraCommands`} configuration. The `displayedPrompt` is now required only for commands with type `'chat'`.

If you are using `extraCommands` with any command of type `'action'`, it should now have the `label` property instead of `displayedPrompt`.

Before:

```js
{
	id: 'add-quote-from-famous-person',
	displayedPrompt: 'Add a quote from a famous person',
	prompt: 'Add a quote from a known person, which would make sense in the context of the selected text.',
	type: 'action'
}
```

After:

```js
{
	id: 'add-quote-from-famous-person',
	label: 'Add a quote from a famous person',
	prompt: 'Add a quote from a known person, which would make sense in the context of the selected text.',
	type: 'action'
}
```

If you are using any `extraCommands` with type `'chat'`, it requires both `label` and `displayedPrompt` properties.

Before:

```js
{
	id: 'summarize-in-bullet-points',
	displayedPrompt: 'Summarize in 5 bullet points',
	prompt: 'Summarize the selected text in 5 bullet points.',
	type: 'chat'
}
```

After:

```js
{
	id: 'summarize-in-bullet-points',
	label: 'Summarize',
	displayedPrompt: 'Summarize in 5 bullet points',
	prompt: 'Summarize the selected text in 5 bullet points.',
	type: 'chat'
}
```

#### AI UI styling variables no longer affecting the UI

AI UI styling has been aligned with the editor-wide styling system, and selected AI-specific CSS variables no longer affect the UI.

The AI UI now uses the font family defined by `--ck-font-face`. Because of this, the following variables **no longer change AI UI font styling**:

* `--ck-ai-balloon-font-family`
* `--ck-ai-chat-font-family`
* `--ck-ai-web-source-tooltip-font-family`
* `--ck-ai-review-font-family`

Additionally, AI buttons now use generic classes (`ck-ai-button-primary`, `ck-ai-button-secondary`, and `ck-ai-button-tertiary`), so the variables below **no longer affect the UI**:

* `--ck-ai-border-color-button`
* `--ck-ai-chat-feed-item-color-actions-button-hover`
* `--ck-ai-chat-feed-item-color-show-changes-toggle-active-background`
* `--ck-ai-chat-feed-item-color-show-changes-toggle-hover-background`
* `--ck-ai-chat-feed-item-color-show-changes-toggle-hover-color`
* `--ck-ai-chat-feed-item-color-show-changes-toggle-on-background`
* `--ck-ai-chat-feed-item-color-show-changes-toggle-on-color`
* `--ck-ai-chat-feed-item-color-text`
* `--ck-ai-chat-feed-loader-icon-color`
* `--ck-ai-chat-suggestion-border-hover-color`
* `--ck-ai-header-border-color-button`
* `--ck-ai-header-color-text`
* `--ck-ai-loader-icon-color`
* `--ck-ai-loader-icon-dot-color`
* `--ck-ai-review-check-list-model-dropdown-active-color`
* `--ck-ai-review-check-list-model-dropdown-hover-background-color`

#### Use of `string` values instead of `enums`

The use of TypeScript `enums` as part of the public CKEditor 5 AI API has been removed. To simplify usage, _union of strings_ is now used instead.

If you have used any of the `AIContextItemType`, `AIContextTextResourceType`, or `AIChatShortcutType` enums, replace them with the corresponding string values. Please refer to the documentation of {@link module:ai/aicore/model/aicontext~AIContextItemType `AIContextItemType`}, {@link module:ai/aicore/model/aicontext~AIContextTextResourceType `AIContextTextResourceType`}, and {@link module:ai/aichatshortcuts/aichatshortcuts~AIChatShortcutType `AIChatShortcutType`}.
Additionally, `AIChatShortcutTypeValue` has been removed as `AIChatShortcutType` now serves the same purpose.

### AI feature UI: button CSS classes and color variables

AI toolbars, panels, and related UI were refactored: controls now share button classes, and colors are driven from a single palette plus feature-level `--ck-color-ai-*` tokens. If you override AI styles in your integration, use the information below to update custom CSS.

#### Default AI color palette

The package ships a root palette. Feature styles reference these values directly or through semantic `--ck-color-ai-*` aliases. Override the palette for broad theming; use feature tokens when you need a narrower change.

Palette entries use **relative color** syntax (`hsla(from var(--ck-color-ai-…) …)`), so changing a main color like `--ck-color-ai-accent-700` automatically adjusts the relative colors.

```css
:root {
	/* Alpha values */
	--ck-color-ai-alpha-1: 0.1;
	--ck-color-ai-alpha-2: 0.2;
	--ck-color-ai-alpha-3: 0.3;
	--ck-color-ai-alpha-4: 0.4;
	--ck-color-ai-alpha-5: 0.5;
	--ck-color-ai-alpha-6: 0.6;
	--ck-color-ai-alpha-7: 0.7;
	--ck-color-ai-alpha-8: 0.8;
	--ck-color-ai-alpha-9: 0.9;

	/* Neutrals */
	--ck-color-ai-black: hsl(0, 0%, 0%);
	--ck-color-ai-gray-900: hsl(0, 0%, 20%);
	--ck-color-ai-gray-900-a5: hsla(from var(--ck-color-ai-gray-900) h s l / var(--ck-color-ai-alpha-5));
	--ck-color-ai-gray-600: hsl(0, 0%, 44%);
	--ck-color-ai-gray-600-a5: hsla(from var(--ck-color-ai-gray-600) h s l / var(--ck-color-ai-alpha-5));
	--ck-color-ai-gray-300: hsl(216, 5%, 81%);
	--ck-color-ai-gray-100: hsl(0, 0%, 94%);
	--ck-color-ai-gray-50: hsl(0, 0%, 96%);
	--ck-color-ai-gray-25: hsl(0, 0%, 98%);
	--ck-color-ai-white: hsl(0, 0%, 100%);
	--ck-color-ai-white-50: hsla(from var(--ck-color-ai-white) h s l / var(--ck-color-ai-alpha-5));

	/* Accent (purple / violet); higher step = darker */
	--ck-color-ai-accent-700: hsl(263, 59%, 52%);
	--ck-color-ai-accent-700-a1: hsla(from var(--ck-color-ai-accent-700) h s l / var(--ck-color-ai-alpha-1));
	--ck-color-ai-accent-700-a2: hsla(from var(--ck-color-ai-accent-700) h s l / var(--ck-color-ai-alpha-2));
	--ck-color-ai-accent-700-a3: hsla(from var(--ck-color-ai-accent-700) h s l / var(--ck-color-ai-alpha-3));
	--ck-color-ai-accent-700-a5: hsla(from var(--ck-color-ai-accent-700) h s l / var(--ck-color-ai-alpha-5));
	--ck-color-ai-accent-800: hsl(263, 59%, 40%);
	--ck-color-ai-accent-800-a8: hsla(from var(--ck-color-ai-accent-800) h s l / var(--ck-color-ai-alpha-8));
	--ck-color-ai-accent-400: hsl(262, 64%, 78%);
	--ck-color-ai-accent-400-a5: hsla(from var(--ck-color-ai-accent-400) h s l / var(--ck-color-ai-alpha-5));
	--ck-color-ai-accent-100: hsl(261, 100%, 93%);
	--ck-color-ai-accent-50: hsl(262, 100%, 96%);

	/* Shadows */
	--ck-color-ai-shadow: hsla(from var(--ck-color-ai-black) h s l / var(--ck-color-ai-alpha-1));

	/* Insertion (green) / suggestion markers */
	--ck-color-ai-insertion-border: hsla(128, 71%, 40%, 0.35);
	--ck-color-ai-insertion-background: hsla(128, 71%, 65%, 0.35);
	--ck-color-ai-insertion-border-active: hsla(128, 71%, 25%, 0.5);
	--ck-color-ai-insertion-background-active: hsla(128, 71%, 50%, 0.5);

	/* Deletion (red) / suggestion markers */
	--ck-color-ai-deletion-border: hsla(345, 71%, 40%, 0.35);
	--ck-color-ai-deletion-background: hsla(345, 71%, 65%, 0.35);
	--ck-color-ai-deletion-stroke: hsla(345, 71%, 20%, 0.5);
	--ck-color-ai-deletion-border-active: hsla(345, 71%, 25%, 0.5);
	--ck-color-ai-deletion-bg-active: hsla(345, 71%, 50%, 0.5);

	/* Inactive suggestion */
	--ck-color-ai-inactive-insertion-border: hsla(128, 1%, 73%, 0.35);
	--ck-color-ai-inactive-insertion-background: hsla(128, 6%, 93%, 0.35);
	--ck-color-ai-inactive-deletion-border: hsla(345, 1%, 74%, 0.35);
	--ck-color-ai-inactive-deletion-background: hsla(345, 11%, 95%, 0.35);
	--ck-color-ai-inactive-deletion-stroke: hsla(0, 1%, 62%, 0.35);

	/* Notification */
	--ck-color-ai-error-background: hsl(15, 100%, 97%);
	--ck-color-ai-error-border: hsl(14, 100%, 68%);
	--ck-color-ai-warning-background: hsl(37, 100%, 96.5%);
	--ck-color-ai-warning-border: hsl(36, 100%, 68%);

	/* Prompt animation */
	--ck-color-ai-prompt-glow: hsl(55, 100%, 95%);
}
```

#### Shared AI button classes

Primary, secondary, and tertiary actions use the same classes everywhere:

* `ck-ai-button-primary`
* `ck-ai-button-secondary`
* `ck-ai-button-tertiary`

Several older variables only fed one-off button styling; those hooks are **superseded** by the classes and theme rules. See the details below.

#### CSS custom property migration

The **Change type** column uses:

* **Superseded** &ndash; no replacement variable; the shared button classes are used instead.
* **Renamed** &ndash; override the new `--ck-color-ai-*` (or underlying palette) token.
* **Restructured** &ndash; the property now composes palette variables; prefer the listed replacements (composite variables such as `--ck-ai-skeleton-item-background` or `--ck-ai-spinner-background` still exist if you override the entire value).

| Old | Change type | New |
| --- | --- | --- |
| `--ck-ai-border-color-button` | Superseded | &mdash; |
| `--ck-ai-chat-feed-item-color-actions-button-hover` | Superseded | &mdash; |
| `--ck-ai-chat-feed-item-color-show-changes-toggle-active-background` | Superseded | &mdash; |
| `--ck-ai-chat-feed-item-color-show-changes-toggle-hover-background` | Superseded | &mdash; |
| `--ck-ai-chat-feed-item-color-show-changes-toggle-hover-color` | Superseded | &mdash; |
| `--ck-ai-chat-feed-item-color-show-changes-toggle-on-background` | Superseded | &mdash; |
| `--ck-ai-chat-feed-item-color-show-changes-toggle-on-color` | Superseded | &mdash; |
| `--ck-ai-chat-feed-item-color-text` | Superseded | &mdash; |
| `--ck-ai-chat-feed-loader-icon-color` | Superseded | &mdash; |
| `--ck-ai-chat-suggestion-border-hover-color` | Superseded | &mdash; |
| `--ck-ai-header-border-color-button` | Superseded | &mdash; |
| `--ck-ai-header-color-text` | Superseded | &mdash; |
| `--ck-ai-loader-icon-color` | Superseded | &mdash; |
| `--ck-ai-loader-icon-dot-color` | Superseded | &mdash; |
| `--ck-ai-review-check-list-model-dropdown-active-color` | Superseded | &mdash; |
| `--ck-ai-review-check-list-model-dropdown-hover-background-color` | Superseded | &mdash; |
| `--ck-ai-actions-balloon-disclaimer-text-color` | Renamed | `--ck-color-ai-actions-balloon-disclaimer-text` |
| `--ck-ai-background-color-action-button` | Renamed | `--ck-color-ai-chat-primary-button-background` |
| `--ck-ai-border-color-main` | Renamed | `--ck-color-ai-chat-border-main` |
| `--ck-ai-button-primary-active-background-color` | Renamed | `--ck-color-ai-button-primary-background-active` |
| `--ck-ai-button-primary-background-color` | Renamed | `--ck-color-ai-button-primary-background` |
| `--ck-ai-button-primary-color` | Renamed | `--ck-color-ai-button-primary-text` |
| `--ck-ai-button-primary-disabled-background-color` | Renamed | `--ck-color-ai-button-primary-background-disabled` |
| `--ck-ai-button-primary-disabled-color` | Renamed | `--ck-color-ai-button-primary-text-disabled` |
| `--ck-ai-button-primary-hover-background-color` | Renamed | `--ck-color-ai-button-primary-background-hover` |
| `--ck-ai-button-secondary-active-background-color` | Renamed | `--ck-color-ai-button-secondary-background-active` |
| `--ck-ai-button-secondary-background-color` | Renamed | `--ck-color-ai-button-secondary-background` |
| `--ck-ai-button-secondary-border-color` | Renamed | `--ck-color-ai-button-secondary-border` |
| `--ck-ai-button-secondary-color` | Renamed | `--ck-color-ai-button-secondary-text` |
| `--ck-ai-button-secondary-disabled-background-color` | Renamed | `--ck-color-ai-button-secondary-background-disabled` |
| `--ck-ai-button-secondary-disabled-border-color` | Renamed | `--ck-color-ai-button-secondary-border-disabled` |
| `--ck-ai-button-secondary-disabled-color` | Renamed | `--ck-color-ai-button-secondary-text-disabled` |
| `--ck-ai-button-secondary-hover-background-color` | Renamed | `--ck-color-ai-button-secondary-background-hover` |
| `--ck-ai-button-tertiary-active-background-color` | Renamed | `--ck-color-ai-button-tertiary-background-active` |
| `--ck-ai-button-tertiary-active-color` | Renamed | `--ck-color-ai-button-tertiary-text-active` |
| `--ck-ai-button-tertiary-background-color` | Renamed | `--ck-color-ai-button-tertiary-background` |
| `--ck-ai-button-tertiary-color` | Renamed | `--ck-color-ai-button-tertiary-text` |
| `--ck-ai-button-tertiary-disabled-background-color` | Renamed | `--ck-color-ai-button-tertiary-background-disabled` |
| `--ck-ai-button-tertiary-disabled-color` | Renamed | `--ck-color-ai-button-tertiary-text-disabled` |
| `--ck-ai-button-tertiary-hover-active-background-color` | Renamed | `--ck-color-ai-button-tertiary-background-hover-active` |
| `--ck-ai-button-tertiary-hover-active-color` | Renamed | `--ck-color-ai-button-tertiary-text-hover-active` |
| `--ck-ai-button-tertiary-hover-background-color` | Renamed | `--ck-color-ai-button-tertiary-background-hover` |
| `--ck-ai-button-tertiary-hover-color` | Renamed | `--ck-color-ai-button-tertiary-text-hover` |
| `--ck-ai-chat-button-active-background-color` | Renamed | `--ck-color-ai-chat-button-active-background` |
| `--ck-ai-chat-button-active-color` | Renamed | `--ck-color-ai-chat-button-active` |
| `--ck-ai-chat-button-hover-color` | Renamed | `--ck-color-ai-chat-button-hover` |
| `--ck-ai-chat-color-icon` | Renamed | `--ck-color-ai-chat-icon` |
| `--ck-ai-chat-color-text` | Renamed | `--ck-color-ai-chat-text` |
| `--ck-ai-chat-controls-loader-color` | Renamed | `--ck-color-ai-chat-controls-loader` |
| `--ck-ai-chat-controls-loader-icon-color` | Renamed | `--ck-color-ai-chat-controls-loader-icon` |
| `--ck-ai-chat-controls-loader-icon-dot-active-color` | Renamed | `--ck-color-ai-chat-controls-loader-icon-dot-active` |
| `--ck-ai-chat-controls-loader-icon-dot-color` | Renamed | `--ck-color-ai-chat-controls-loader-icon-dot` |
| `--ck-ai-chat-feed-interaction-header-capabilities-color-text` | Renamed | `--ck-color-ai-chat-feed-interaction-header-capabilities-text` |
| `--ck-ai-chat-feed-item-color-background` | Renamed | `--ck-color-ai-chat-feed-item-background` |
| `--ck-ai-chat-feed-item-color-background-secondary` | Renamed | `--ck-color-ai-chat-feed-item-background-secondary` |
| `--ck-ai-chat-flash-color` | Renamed | `--ck-color-ai-chat-flash` |
| `--ck-ai-chat-flash-color-text` | Renamed | `--ck-color-ai-chat-flash-text` |
| `--ck-ai-chat-suggestion-icon-default-color` | Renamed | `--ck-color-ai-chat-suggestion-icon-default` |
| `--ck-ai-chat-user-context-background` | Renamed | `--ck-color-ai-chat-user-context-background` |
| `--ck-ai-disclaimer-background-color` | Renamed | `--ck-color-ai-disclaimer-background` |
| `--ck-ai-disclaimer-border-color` | Renamed | `--ck-color-ai-disclaimer-border` |
| `--ck-ai-disclaimer-text-color` | Renamed | `--ck-color-ai-disclaimer-text` |
| `--ck-ai-font-color-action-button` | Renamed | `--ck-color-ai-chat-primary-button-text` |
| `--ck-ai-header-color-icon` | Renamed | `--ck-color-ai-header-icon` |
| `--ck-ai-notification-color-text` | Renamed | `--ck-color-ai-notification-text` |
| `--ck-ai-notification-error-color-background` | Renamed | `--ck-color-ai-notification-error-background` |
| `--ck-ai-notification-error-color-border` | Renamed | `--ck-color-ai-notification-error-border` |
| `--ck-ai-notification-warning-color-background` | Renamed | `--ck-color-ai-notification-warning-background` |
| `--ck-ai-notification-warning-color-border` | Renamed | `--ck-color-ai-notification-warning-border` |
| `--ck-ai-quick-actions-button-background-color` | Renamed | `--ck-color-ai-quick-actions-button-background` |
| `--ck-ai-quick-actions-button-color` | Renamed | `--ck-color-ai-quick-actions-button` |
| `--ck-ai-quick-actions-list-item-group-row-color` | Renamed | `--ck-color-ai-quick-actions-list-item-group-row` |
| `--ck-ai-review-border-color-button` | Renamed | `--ck-color-ai-review-border-button` |
| `--ck-ai-review-check-list-item-active-border-color` | Renamed | `--ck-color-ai-review-check-list-item-active-border` |
| `--ck-ai-review-check-list-item-description-color` | Renamed | `--ck-color-ai-review-check-list-item-description` |
| `--ck-ai-review-check-list-item-hover-border-color` | Renamed | `--ck-color-ai-review-check-list-item-hover-border` |
| `--ck-ai-review-check-list-item-title-color` | Renamed | `--ck-color-ai-review-check-list-item-title` |
| `--ck-ai-review-check-list-item-title-icon-color` | Renamed | `--ck-color-ai-review-check-list-item-title-icon` |
| `--ck-ai-review-color-icon` | Renamed | `--ck-color-ai-review-icon` |
| `--ck-ai-review-color-text` | Renamed | `--ck-color-ai-review-text` |
| `--ck-ai-suggestion-inactive-color-background` | Renamed | `--ck-color-ai-suggestion-inactive-background` |
| `--ck-ai-suggestion-inactive-color-border` | Renamed | `--ck-color-ai-suggestion-inactive-border` |
| `--ck-ai-suggestion-marker-deletion-background-color` | Renamed | `--ck-color-ai-suggestion-marker-deletion-background` |
| `--ck-ai-suggestion-marker-deletion-background-color-active` | Renamed | `--ck-color-ai-suggestion-marker-deletion-background-active` |
| `--ck-ai-suggestion-marker-deletion-border-color` | Renamed | `--ck-color-ai-suggestion-marker-deletion-border` |
| `--ck-ai-suggestion-marker-deletion-border-color-active` | Renamed | `--ck-color-ai-suggestion-marker-deletion-border-active` |
| `--ck-ai-suggestion-marker-deletion-stroke-color` | Renamed | `--ck-color-ai-suggestion-marker-deletion-stroke` |
| `--ck-ai-suggestion-marker-insertion-background-color` | Renamed | `--ck-color-ai-suggestion-marker-insertion-background` |
| `--ck-ai-suggestion-marker-insertion-background-color-active` | Renamed | `--ck-color-ai-suggestion-marker-insertion-background-active` |
| `--ck-ai-suggestion-marker-insertion-border-color` | Renamed | `--ck-color-ai-suggestion-marker-insertion-border` |
| `--ck-ai-suggestion-marker-insertion-border-color-active` | Renamed | `--ck-color-ai-suggestion-marker-insertion-border-active` |
| `--ck-ai-web-source-tooltip-title-color` | Renamed | `--ck-color-ai-chat-web-source-tooltip-title` |
| `--ck-ai-web-source-tooltip-url-color` | Renamed | `--ck-color-ai-chat-web-source-tooltip-url` |
| `--ck-ai-chat-shortcuts-prompt-input-animation-border` | Restructured | `--ck-color-ai-chat-shortcuts-prompt-animation-border` |
| `--ck-ai-chat-shortcuts-prompt-input-animation-box-shadow` | Restructured | `--ck-color-ai-chat-shortcuts-prompt-animation-glow-ring` |
| `--ck-ai-skeleton-item-background` | Restructured | `--ck-color-ai-core-skeleton-gradient-edge`, `--ck-color-ai-core-skeleton-gradient-mid` |
| `--ck-ai-spinner-background` | Restructured | `--ck-color-ai-core-spinner-gradient-start`, `--ck-color-ai-core-spinner-gradient-end` |
| `--ck-ai-spinner-mask` | Restructured | `--ck-color-ai-core-spinner-mask-edge` |

For **Restructured** rows, prefer tuning the listed `--ck-color-ai-*` variables (or the root palette above) so derived UI stays coherent.

### Removal of `enum` as Uploadcare source type

The use of TypeScript `enums` as part of the public CKEditor 5 Uploadcare API has been removed. To simplify usage, _union of strings_ is now used instead.

If you have used the `UploadcareSource` enum, replace it with the corresponding string value. You can see available values in the {@link module:uploadcare/uploadcareconfig~UploadcareSource `UploadcareSource`} documentation. If you have used the `UploadcareSourceValue` type, use `UploadcareSource` instead.

### Package generator modernization and simpler project output

We used the sunsetting of old installation methods as an opportunity to significantly modernize `ckeditor5-package-generator` in its new major `v6` release and simplify the projects it creates.

The generated package setup moved from webpack to Vite 8 and Vitest (powered by Rolldown), which improves developer experience and performance.

The updated generator output is also easier to work with day to day, both when developing your package and when preparing it for publishing. We recommend migrating existing custom package projects to the new generator output to align with the current CKEditor&nbsp;5 tooling direction.

For migration details and updated usage instructions, see the {@link framework/development-tools/package-generator/using-package-generator Package generator guide}.
