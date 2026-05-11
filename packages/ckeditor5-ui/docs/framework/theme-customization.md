---
category: framework-deep-dive-ui
meta-title: Theme customization | CKEditor 5 Framework Documentation
meta-description: Learn how to customize CKEditor 5 themes, including styling components and applying custom CSS for a unique editor look.
order: 10
---

# Theme customization

Below you can see a demo of an editor with the dark theme as a result of customizations described later in this guide:

**Mode:**

<div class="u-flex-horizontal u-gap-5">
	<ck:checkbox id="theme-mode-light" type="radio" name="theme-mode" value="light" label="Light" />
	<ck:checkbox id="theme-mode-dark" type="radio" name="theme-mode" value="dark" label="Dark" checked />
</div>

{@snippet examples/default-theme}

## Customization with CSS variables

Assuming you finished our {@link getting-started/integrations-cdn/quick-start quick start} guide, and you have a running CKEditor&nbsp;5 instance, you can customize the UI theme through CSS variables (custom properties).

The UI theme uses a 3-layer token model:

| Layer | Purpose | Typical usage |
| --- | --- | --- |
| Foundation | Low-level primitives (base colors, base radius, spacing scale). | Set global palette, density, and shape scale. |
| Semantic | Reusable UI roles (surface, border, interactive, text, layout). | Define design intent shared across many components. |
| Component | Tokens for a specific component contract. | Adjust one component without changing all others. |

A practical rule:
1. Start with semantic tokens.
2. Use component tokens for local exceptions.
3. Change foundation tokens when you want a global visual shift.

<info-box hint>
	Legacy compatibility aliases are still available, but for new customizations prefer semantic and component tokens.
</info-box>

The file containing custom variables can be named `custom.css` and it will look as below:

```css
:root {
	/* Optional app palette helpers (outside CKEditor token layers). */
	--app-surface-1: hsl(255, 3%, 18%);
	--app-surface-2: hsl(255, 4%, 16%);
	--app-surface-3: hsl(240, 4%, 24%);
	--app-text-1: hsl(0, 0%, 98%);
	--app-text-2: hsl(0, 0%, 78%);
	--app-focus-hsl: 208, 90%, 62%;
	--app-brand: hsl(168, 76%, 42%);
	--app-brand-hover: hsl(168, 76%, 38%);
	--app-brand-contrast: hsl(0, 0%, 100%);

	/* -----------------------------------------------------------------
	 * 1) FOUNDATION TOKENS
	 * ----------------------------------------------------------------- */
	--ck-font-size-base: 14px;
	--ck-spacing-unit: 0.65em;
	--ck-radius-base: 6px;

	--ck-color-base-background: var(--app-surface-1);
	--ck-color-base-border: var(--app-surface-3);
	--ck-color-base-text: var(--app-text-1);
	--ck-color-base-action: var(--app-brand);
	--ck-color-base-error: hsl(10, 90%, 62%);

	/* -----------------------------------------------------------------
	 * 2) SEMANTIC TOKENS
	 * ----------------------------------------------------------------- */
	--ck-color-surface-canvas: var(--app-surface-1);
	--ck-color-surface-control: var(--app-surface-1);
	--ck-color-surface-container: var(--app-surface-1);
	--ck-color-surface-inverse: hsl(252, 7%, 14%);

	--ck-color-border-control: var(--app-surface-3);
	--ck-color-border-container: var(--app-surface-3);
	--ck-color-divider: var(--app-surface-3);

	--ck-color-text-primary: var(--app-text-1);
	--ck-color-text-secondary: hsl(0, 0%, 86%);
	--ck-color-text-disabled: var(--app-text-2);
	--ck-color-text-inverse: var(--app-brand-contrast);

	--ck-color-interactive-focus-border-coordinates: var(--app-focus-hsl);
	--ck-color-interactive-focus-shadow: hsla(208, 90%, 62%, .28);
	--ck-color-interactive-hover-surface: var(--app-surface-2);
	--ck-color-interactive-active-surface: hsl(255, 4%, 14%);
	--ck-color-interactive-selected-surface: hsl(208, 40%, 20%);
	--ck-color-interactive-selected-surface-hover: hsl(208, 42%, 24%);
	--ck-color-interactive-selected-text: hsl(205, 100%, 74%);
	--ck-color-interactive-primary-surface: var(--app-brand);
	--ck-color-interactive-primary-surface-hover: var(--app-brand-hover);
	--ck-color-interactive-primary-text: var(--app-brand-contrast);

	--ck-border-radius-control: 6px;
	--ck-border-radius-surface: 8px;
	--ck-shadow-surface-floating: 0 6px 18px 2px hsla(0, 0%, 0%, .35);

	/* -----------------------------------------------------------------
	 * 3) COMPONENT TOKENS
	 * ----------------------------------------------------------------- */
	--ck-button-border-radius: var(--ck-border-radius-control);
	--ck-input-border-radius: var(--ck-border-radius-control);
	--ck-toolbar-border-radius: var(--ck-border-radius-surface);
	--ck-dialog-border-radius: var(--ck-border-radius-surface);
	--ck-dialog-background-color: var(--app-surface-1);
	--ck-dialog-drop-shadow: 0 10px 24px 2px hsla(0, 0%, 0%, .35);
}

/* Optional: feature-specific content tokens (outside @ckeditor/ckeditor5-ui theme layers). */
:root {
	--ck-content-color-image-caption-background: hsl(0, 0%, 97%);
	--ck-content-color-image-caption-text: hsl(0, 0%, 20%);
	--ck-color-widget-blurred-border: hsl(0, 0%, 87%);
	--ck-color-widget-hover-border: hsl(43, 100%, 68%);
	--ck-color-widget-editable-focus-background: hsl(0, 0%, 100%);
	--ck-color-link-default: hsl(190, 100%, 75%);
}

/* Improve displaying links. */
.ck.ck-editor__editable a {
    color: hsl(210, 100%, 63%);
}

/* Improve displaying code blocks. */
.ck-content pre {
    color: hsl(0, 0%, 91%);
    border-color: hsl(0, 0%, 77%);
}
```

Depending on your setup method, you can either import a style sheet into your `js` file:


```js
import { ClassicEditor } from 'ckeditor5';

import 'ckeditor5/ckeditor5.css';

// Override the default styles.
import 'custom.css';

ClassicEditor
	.create( /* ... */ )
	.then( editor => {
		console.log( editor );
	} )
	.catch( err => {
		console.error( err.stack );
	} );
```

Or import it via the `link` in `html` in the CDN setup:

```html
<link rel="stylesheet" href="path/to/custom.css" type="text/css">
```
