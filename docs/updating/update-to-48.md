---
category: update-guides
meta-title: Update to version 48.x | CKEditor 5 Documentation
menu-title: Update to v48.x
order: 76
modified_at: 2026-03-03
---

# Update to CKEditor&nbsp;5 v48.x

<info-box>
	When updating your CKEditor&nbsp;5 installation, ensure **all the packages are the same version** to avoid errors.

	You may try removing the `package-lock.json` or `yarn.lock` files (if applicable) and reinstalling all packages before rebuilding the editor. For optimal results, ensure you use the most recent package versions.
</info-box>

## Update to CKEditor&nbsp;5 v48.0.0

Released on XXXXXXXXX, 2026. ([See full release notes](https://github.com/ckeditor/ckeditor5/releases/tag/v48.0.0))

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

As part of the preparation for a planned migration to native CSS nesting at the beginning of 2027, we updated the generated CSS output to behave more like native CSS nesting. We are not switching to native CSS nesting yet, but some compiled selectors are now stronger than in earlier releases. We are making this change now to reduce the number of changes needed later.

This mainly affects nested rules written under a list of selectors. In some cases, the final selector may now be stronger than before. Because of this, some custom CSS overrides that worked in earlier versions may no longer apply without changes.

Most integrations should not be affected. However, if you override CKEditor&nbsp;5 styles with your own CSS, check whether any of your overrides stopped working after the update.

If needed, fix your custom styles by making your override selector more specific or by loading your CSS later so it takes precedence.

The following simplified example shows the kind of difference you may notice:

```css
/* Before */
.ck.ck-button, a.ck.ck-button {
	&.ck-button_with-text {}
}

/* After */
:is(.ck.ck-button, a.ck.ck-button).ck-button_with-text {}
```

These selectors look similar, but the second one can have a stronger effect in the cascade, which may change which rule wins.

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

### Removal of `enum` as Uploadcare source type

The use of TypeScript `enums` as part of the public CKEditor 5 Uploadcare API has been removed. To simplify usage, _union of strings_ is now used instead.

If you have used the `UploadcareSource` enum, replace it with the corresponding string value. You can see available values in the {@link module:uploadcare/uploadcareconfig~UploadcareSource `UploadcareSource`} documentation. If you have used the `UploadcareSourceValue` type, use `UploadcareSource` instead.

### Package generator modernization and simpler project output

We used the sunsetting of old installation methods as an opportunity to significantly modernize `ckeditor5-package-generator` in its new major `v6` release and simplify the projects it creates.

The generated package setup moved from webpack to Vite 8 and Vitest (powered by Rolldown), which improves developer experience and performance.

The updated generator output is also easier to work with day to day, both when developing your package and when preparing it for publishing. We recommend migrating existing custom package projects to the new generator output to align with the current CKEditor&nbsp;5 tooling direction.

For migration details and updated usage instructions, see the {@link framework/development-tools/package-generator/using-package-generator Package generator guide}.
