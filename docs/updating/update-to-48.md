---
category: update-guides
meta-title: Update to version 48.x | CKEditor 5 Documentation
menu-title: Update to v48.x
order: 76
modified_at: 2026-03-23
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
