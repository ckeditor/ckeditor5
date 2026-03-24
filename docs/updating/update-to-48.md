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

Use **root-scoped options** instead:

```js
ClassicEditor.create( element, {
	root: {
		initialData: '<p>Hello world!</p>',
		placeholder: 'Type here...',
		label: 'Main content'
	}
} );
```

For **multi-root** setups, use:

```js
MultiRootEditor.create( sourceElements, {
	roots: {
		main: {
			initialData: '<p>Main content</p>',
			placeholder: 'Type here...',
			label: 'Main content',
			modelAttributes: { order: 10 },
			lazyLoad: false
		}
	}
} );
```

Additional migrations:

* `config.rootsAttributes` -> `config.roots.<rootName>.modelAttributes`
* `config.lazyRoots` -> `config.roots.<rootName>.lazyLoad`

The `config.roots.<rootName>.lazyLoad` property is also deprecated and will be removed in future versions.

If your integration reads configuration values directly, update access paths as well:

* `config.get( 'initialData' )` -> `config.get( 'roots.main.initialData' )`
* `config.get( 'placeholder' )` -> `config.get( 'roots.main.placeholder' )`
* `config.get( 'label' )` -> `config.get( 'roots.main.label' )`

For root attributes configuration, update shape:

```js
// ❌ Before:
rootsAttributes: {
	main: { order: 10 }
}

// ✅ After:
roots: {
	main: {
		modelAttributes: { order: 10 }
	}
}
```

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

The AI part of the configuration have been reworked to present consistent options along all the features.

#### AI Chat Shortcuts

In the {@link features/ckeditor-ai-chat#chat-shortcuts Chat&nbsp;Shortcuts} feature, the `check` property in the shortcut definition, see {@link module:ai/aichat/aichat~AIChatConfig#shortcuts `config.ai.chat.shortcuts`} configuration, has been renamed to `commandId`.

If you have any shortcuts defined, the `check` property needs to be updated as shown below.

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

In the {@link features/ckeditor-ai-actions Quick&nbsp;Actions} feature, the `type` value for {@link module:ai/aiquickactions/aiquickactions~AIQuickActionsConfig#extraCommands `config.ai.quickActions.extraCommands`} have been changed from uppercase to lowercase. Instead of using `CHAT` or `ACTION`, `chat` and `action` needs to be used as value now.

Additionally, the `label` property have been introduced in place of `displayedPrompt` property in {@link module:ai/aiquickactions/aiquickactions~AIQuickActionsConfig#extraCommands `config.ai.quickActions.extraCommands`} configuration. The `displayedProperty` is now required only for commands with type `'chat'`.

If you are using `extraCommands` with any command with type `'action'`, it now should have `label` property instead of `displayedPrompt` one.

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

#### Use of `string` values instead of `enums`

The use of TypeScript `enums` as part of the public CKEditor 5 AI API has been removed. To simplify usage, _union of strings_ is now used instead.

If you have used any of `AIContextItemType`, `AIContextTextResourceType`, `AIChatShortcutType` enums, it should be replaced with the specific string value. Please, refer to docs of {@link module:ai/aicore/model/aicontext~AIContextItemType `AIContextItemType`}, {@link module:ai/aicore/model/aicontext~AIContextTextResourceType `AIContextTextResourceType`} and {@link module:ai/aichatshortcuts/aichatshortcuts~AIChatShortcutType `AIChatShortcutType`}.
Additionally, `AIChatShortcutTypeValue` have been removed as `AIChatShortcutType` fulfills its function now.

### Removal of `enum` as Uploadcare source type

The use of TypeScript `enums` as part of the public CKEditor 5 Uploadcare API has been removed. To simplify usage, _union of strings_ is now used instead.

If you have used `UploadcareSource` enum, it should be replaced with the specific string value. You can see available value in the {@link module:uploadcare/uploadcareconfig~UploadcareSource `UploadcareSource`} documentation. If you have used `UploadcareSourceValue` type, `UploadcareSource` should be now used instead.
