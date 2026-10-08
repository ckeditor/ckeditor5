---
category: framework-deep-dive-ui
meta-title: Theme customization | CKEditor 5 Framework Documentation
meta-description: Learn how to customize CKEditor 5 themes, including styling components and applying custom CSS for a unique editor look.
order: 10
modified_at: 2026-10-05
---

# Theme customization

You can customize the CKEditor&nbsp;5 UI theme by overriding its CSS variables (custom properties) to change colors, spacing, fonts, and more. The demo below shows the default theme restyled as a dark theme using this approach.

<div class="u-flex-horizontal u-gap-5">
	<ck:checkbox id="theme-mode-light" type="radio" name="theme-mode" value="light" label="Light" />
	<ck:checkbox id="theme-mode-dark" type="radio" name="theme-mode" value="dark" label="Dark" checked />
</div>

{@snippet examples/default-theme}

## Working with the token layers

The UI theme is organized into three layers - foundation, semantic, and component - defined and named as described in the {@link framework/theme-token-naming Theme token naming} guide. Each layer references the one below, so a value set once in the foundation flows up through the semantic roles into the components that use it.

Pick a layer by your task:

* **Customizing the look (integrators)** &ndash; override an existing token, choosing the layer by how far the change should reach: *foundation* for a global shift (palette, density, shape scale), *semantic* for one design role across many components (every surface, every focus ring), or *component* for a single component.
* **Building a plugin or component (plugin authors)** &ndash; define your component's own tokens in the component layer and resolve them from **semantic** tokens rather than raw values, so the component tracks the theme and exposes clean override points.

When you add tokens for your own component, name them component-first and resolve them from semantic tokens:

```css
.ck-my-widget {
	--ck-my-widget-background: var(--ck-color-surface-container);
	--ck-my-widget-border-radius: var(--ck-border-radius-control);

	background: var(--ck-my-widget-background);
	border-radius: var(--ck-my-widget-border-radius);
}
```

### Global vs scoped overrides

Overriding a token on `:root` changes its value everywhere. Both new and legacy names work at this level, and you can mix layers in one place:

```css
:root {
	/* Foundation - changes radius everywhere. */
	--ck-radius-base: 5px;

	/* Legacy name - also works globally via backward-compatible fallbacks. */
	--ck-border-radius: 5px;

	/* Component - changes only button padding. */
	--ck-button-padding: 5px;
}
```

To restyle a single element or region, scope the override to a selector - but **always override the component token there**, never a foundation or semantic name:

```css
/* ✓ Component token on the scoped element - takes effect. */
.my-small-button { --ck-button-padding: 2px; }

/* ✗ No effect - the semantic and foundation chain already resolved on :root. */
.my-small-button { --ck-spacing-control-padding-block: 2px; }
```

All tokens are defined and resolved on `:root`, so a scoped override of a lower-layer token does not re-flow up through the chain. The closer a token sits to the property it controls, the better it works when scoped - which makes component tokens the safe choice for per-element tweaks. Legacy token names are an exception: the theme reads them at each point of use, so a legacy override also works when scoped - the {@link updating/migration-to-refreshed-theme migration guide} covers the few re-themed tokens that stay `:root`-only.

### Best practices

* Override the **closest** token to what you want to change; drop to a lower layer only when the change should reach further.
* Point your own component tokens at **semantic** tokens, not raw values, so they track the theme.
* Avoid hardcoding raw colors or sizes in component CSS - you lose theme-ability.
* Avoid overriding a foundation or semantic token in a scoped selector expecting it to cascade; use the component token instead.
* For new customizations, prefer the current token names. Legacy names still work as override fallbacks, but they are not the target.

## Example: a dark theme

Assuming you finished our {@link getting-started/integrations-cdn/quick-start quick start} guide and have a running CKEditor&nbsp;5 instance, you can customize the UI theme through CSS variables. The file containing custom variables can be named `custom.css` and it will look as below:

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
	--ck-spacing-base: 0.65em;
	--ck-radius-base: 6px;

	--ck-color-base-background: var(--app-surface-1);
	--ck-color-base-border: var(--app-surface-3);
	--ck-color-base-text: var(--app-text-1);
	--ck-color-base-action: var(--app-brand);
	--ck-color-base-error: hsl(10, 90%, 62%);
	--ck-focus-border-color: hsl(var(--app-focus-hsl));

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
	--ck-color-interactive-focus-shadow: hsla(208, 90%, 62%, .4);
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
	--ck-input-disabled-background-color: hsl(255, 4%, 21%);
	--ck-toolbar-border-radius: var(--ck-border-radius-surface);
	--ck-dialog-border-radius: var(--ck-border-radius-surface);
	--ck-dialog-background-color: var(--app-surface-1);
	--ck-dialog-drop-shadow: 0 10px 24px 2px hsla(0, 0%, 0%, .35);
}

/* Optional: feature-specific content tokens (outside @ckeditor/ckeditor5-ui theme layers). */
:root {
	/* Editable (and published) content text - light on the dark background. */
	--ck-content-font-color: var(--app-text-1);

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

Depending on your setup method, you can either import a style sheet into your JavaScript file:

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

Or import it with the `<link>` element in the CDN setup:

```html
<link rel="stylesheet" href="path/to/custom.css" type="text/css">
```
