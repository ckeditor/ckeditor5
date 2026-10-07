---
category: update-guides
meta-title: Migration to refreshed theme | CKEditor 5 Documentation
meta-description: Learn what changed in the refreshed CKEditor 5 theme and design tokens, how your token overrides keep working, and how to restore the previous look.
menu-title: Migration to refreshed theme
order: 52
modified_at: 2026-10-02
---

# Migrating to the refreshed theme

Two things changed at once, and it helps to keep them separate:

1. **A new token architecture** &ndash; the `--ck-*` CSS custom properties were reorganized into three tiers (foundation → semantic → component). This reorganization is value-neutral: on its own it changes no pixels.
2. **A refreshed default theme** &ndash; new color, spacing, radius, elevation, and font values layered on that architecture, for a more modern default look.

Most "will my customization break?" questions are about #1 (names/overrides). Most "why does it look different?" questions are about #2 (values). We call those out separately throughout.

There is also one structural change that affects where you override tokens: every token is now declared on `:root, :host` (not just `:root`), so the theme resolves inside a shadow root too. See [Shadow DOM](#shadow-dom).

## Do I need to do anything?

It depends on how your integration uses and customizes the editor. Find the rows that describe your setup in the table below and follow the linked sections. If several rows apply, go through each of them.

| If you…                                                  | You need to…                                                                                | Section                                                               |
|----------------------------------------------------------|---------------------------------------------------------------------------------------------|-----------------------------------------------------------------------|
| Use the default theme, no customization                  | Nothing &ndash; enjoy the new look.                                                         | -                                                                     |
| Override `--ck-*` tokens to re-skin the editor           | Mostly nothing &ndash; your overrides still work. Re-check only a short list of exceptions. | [The two compatibility mechanisms](#the-two-compatibility-mechanisms) |
| Read `--ck-*` tokens in your own CSS                     | Add one opt-in stylesheet so the old names resolve.                                         | [Reading old token names](#reading-old-token-names)                   |
| Prefer the previous look                                 | Revert it with the legacy theme preset.                                                     | [Keeping the old look](#keeping-the-old-look)                         |
| Customize with plain CSS (`.ck-*` selectors, not tokens) | Your rules still match; re-check them against the new default values.                       | [Your existing custom styles](#your-existing-custom-styles)           |
| Mount the editor in a shadow root                        | Override on the shadow host, not `:root`.                                                   | [Shadow DOM](#shadow-dom)                                             |
| Render or publish `.ck-content`                          | Some content colors changed; apply rollback snippets if needed.                             | [Published content](#published-content)                               |

## The two compatibility mechanisms

Old token names keep working through two independent mechanisms. Which one applies depends on whether you override a token (set its value) or read it (use it in your own CSS).

### Overriding old token names

If you set a legacy token name to re-skin the editor, it still works. No changes needed.

```css
/* The way you re-skinned the editor on the old theme - still works as-is. */
:root {
  --ck-color-toolbar-background: #1e1e1e;
  --ck-color-button-on-background: #0a84ff;
}
```

Under the hood, each place the theme uses a token reads the old name first, then falls back to the new one:

```css
/* Inside the theme (you don't write this - it's why your override wins): */
property: var(--ck-old-token, var(--ck-new-token));
```

Because the old name is read at each point of use, an override works on any selector, not only `:root` &ndash; set it on a wrapper (for example `.ck-sidebar`) and it applies to the editor UI inside. A few re-themed tokens are the exception; see [Overriding on a narrower selector](#overriding-on-a-narrower-selector).

<info-box warning>
	Without `!important`, your override must load after the editor CSS (same `:root` specificity &ndash; last one wins).
</info-box>

Prefer the new names going forward. The legacy names are a compatibility layer, not a permanent API &ndash; in new or updated overrides, use the new names ([Token name reference](#token-name-reference)). See [Your existing custom styles](#your-existing-custom-styles).

### Reading old token names

If your own CSS reads a legacy token name, add the opt-in aliases below to your own styles so those names resolve.

```css
.my-widget { padding: var(--ck-spacing-small); }   /* your CSS reads an old name */
```

Copy the aliases block below into your stylesheet. Without them, `var(--ck-spacing-small)` resolves to nothing; with them, to the new value (`--ck-spacing-sm`).

**When to use it:** only to read old names in your CSS.
**When not to:** it does not help with overriding &ndash; that already works without it ([Overriding old token names](#overriding-old-token-names)). If you do not read old names, pasting it just adds unused definitions.

**Mind the order &ndash; it can undo your own overrides.** The aliases (re)declare the old names on `:root`. If they come after a place where you override an old name, they reset it back to the new value and your override is lost:

```css
:root { --ck-spacing-small: 20px; }   /* your override… */
/* …then the aliases below re-declare --ck-spacing-small → your 20px is gone */
```

Save the aliases block below as your own file and load it between the editor CSS and your overrides &ndash; then reads resolve and your overrides keep winning:

```html
<link rel="stylesheet" href=".../ckeditor5.css">	<!-- 1. editor -->
<link rel="stylesheet" href="legacy-aliases.css">	<!-- 2. the aliases snippet, saved as your own file -->
<link rel="stylesheet" href="my-overrides.css">		<!-- 3. your overrides -->
```

<details>
<summary><b>Opt-in legacy aliases</b> &ndash; copy this into your stylesheet</summary>

```css
/*
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/*
 * Opt-in backward-compatible aliases for legacy color and foundation token names.
 *
 * Paste these aliases ONLY if your own styles READ old `--ck-color-*` or foundation
 * token names (spacing, font size, shadow, focus, opacity). You do NOT need them to
 * OVERRIDE old names — overriding keeps working through the default theme bridges.
 *
 * It intentionally covers only tokens that are safe to alias globally. A few
 * internal tokens that components re-theme (for example button-state and balloon
 * panel colors, or font-size-normal, border-radius, inner-shadow) are override-only
 * and are not listed here; read their new names directly instead. The z-index
 * aliases stay in the default theme because of the fullscreen layering.
 */
:root,
:host {
	/* -- Buttons ------------------------------------------------------------------------------- */

	--ck-color-button-default-disabled-background: var(--ck-button-default-disabled-background-color);
	--ck-color-button-action-text: var(--ck-button-action-text-color);
	--ck-color-button-save: var(--ck-button-save-color);
	--ck-color-button-cancel: var(--ck-button-cancel-color);

	--ck-color-switch-button-off-hover-background: var(--ck-switch-button-off-hover-background-color);
	--ck-color-switch-button-on-background: var(--ck-switch-button-on-background-color);
	--ck-color-switch-button-on-hover-background: var(--ck-switch-button-on-hover-background-color);
	--ck-color-switch-button-inner-background: var(--ck-switch-button-inner-background-color);

	/* -- Dropdown ------------------------------------------------------------------------------ */

	--ck-color-dropdown-panel-background: var(--ck-dropdown-panel-background-color);
	--ck-color-dropdown-panel-border: var(--ck-dropdown-panel-border-color);

	/* -- Dialog -------------------------------------------------------------------------------- */

	--ck-color-dialog-background: var(--ck-dialog-background-color);

	/* -- Input --------------------------------------------------------------------------------- */

	--ck-color-input-background: var(--ck-input-background-color);
	--ck-color-input-border: var(--ck-input-border-color);
	--ck-color-input-error-border: var(--ck-input-error-border-color);
	--ck-color-input-text: var(--ck-input-text-color);
	--ck-color-input-disabled-background: var(--ck-input-disabled-background-color);
	--ck-color-input-disabled-border: var(--ck-input-disabled-border-color);
	--ck-color-input-disabled-text: var(--ck-input-disabled-text-color);

	/* -- List ---------------------------------------------------------------------------------- */

	--ck-color-list-background: var(--ck-list-background-color);
	--ck-color-list-button-on-background: var(--ck-list-button-on-background-color);
	--ck-color-list-button-on-text: var(--ck-list-button-on-text-color);

	/* -- Toolbar ------------------------------------------------------------------------------- */

	--ck-color-toolbar-background: var(--ck-toolbar-background-color);
	--ck-color-toolbar-border: var(--ck-toolbar-border-color);

	/* -- Tooltip ------------------------------------------------------------------------------- */

	--ck-color-tooltip-background: var(--ck-tooltip-background-color);
	--ck-color-tooltip-text: var(--ck-tooltip-text-color);

	/* -- Foundation: spacing ------------------------------------------------------------------- */

	--ck-spacing-extra-tiny: var(--ck-spacing-2xs);
	--ck-spacing-tiny: var(--ck-spacing-xs);
	--ck-spacing-small: var(--ck-spacing-sm);
	--ck-spacing-medium-small: var(--ck-spacing-md);
	--ck-spacing-medium: var(--ck-spacing-base);
	--ck-spacing-standard: var(--ck-spacing-base);
	--ck-spacing-large: var(--ck-spacing-lg);
	--ck-spacing-extra-large: var(--ck-spacing-xl);

	/* -- Foundation: font size ----------------------------------------------------------------- */

	--ck-font-size-tiny: var(--ck-font-size-xs);
	--ck-font-size-small: var(--ck-font-size-sm);
	--ck-font-size-big: var(--ck-font-size-xl);
	--ck-font-size-large: var(--ck-font-size-2xl);

	/* -- Foundation: size ---------------------------------------------------------------------- */

	/* Only the AI package re-defines the new name in its own scope, and it reads the new name, so
	   aliasing the old name globally is safe (no re-themed non-AI surface reads the old name). */
	--ck-ui-component-min-height: var(--ck-size-min-height);

	/* -- Foundation: font, shadow, focus, opacity ---------------------------------------------- */

	--ck-font-face: var(--ck-font-family);
	--ck-drop-shadow: var(--ck-shadow-md);
	--ck-drop-shadow-active: var(--ck-shadow-lg);
	--ck-focus-outer-shadow-geometry: var(--ck-focus-shadow-geometry);
	--ck-focus-outer-shadow: var(--ck-focus-shadow);
	--ck-focus-disabled-outer-shadow: var(--ck-focus-shadow-disabled);
	--ck-focus-error-outer-shadow: var(--ck-focus-shadow-error);
	--ck-disabled-opacity: var(--ck-opacity-disabled);
}
```

</details>

It covers only the safe tokens on purpose. A few override-only tokens are deliberately left out (read their new name &ndash; see [Override-only tokens](#override-only-tokens)). Do not hand-roll a "resolve everything" alias file that declares those names too &ndash; it re-breaks per-component theming (tooltips, some buttons, fullscreen).

### Override-only tokens

A handful of tokens that components re-theme internally keep working as overrides, but are not in the opt-in legacy aliases, so reading them resolves to nothing. Read their new name instead.

```css
:root { --ck-color-button-on-background: lime; }              /* ✅ override still re-skins */
.mine { background: var(--ck-color-button-on-background); }   /* ❌ empty (override-only) */
.mine { background: var(--ck-button-on-background-color); }   /* ✅ read the new name */
```

Override-only tokens (set works, read does not &ndash; read the new name):

| Family                                   | Old names (override-only)                                                                                                                                                                                                                                |
|------------------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Buttons &ndash; default/on/action states | `--ck-color-button-default-background` · `-hover-` · `-active-`; `--ck-color-button-on-background` · `-hover-` · `-active-` · `-disabled-` · `--ck-color-button-on-color`; `--ck-color-button-action-background` · `-hover-` · `-active-` · `-disabled-` |
| Switch / list                            | `--ck-color-switch-button-off-background`, `--ck-color-list-button-hover-background`                                                                                                                                                                     |
| Balloon panel                            | `--ck-color-panel-background`, `--ck-color-panel-border`                                                                                                                                                                                                 |
| Foundation                               | `--ck-font-size-normal`, `--ck-border-radius`, `--ck-inner-shadow`, `--ck-ui-component-min-height`                                                                                                                                                       |

### Z-index layers

The old z-index names keep working both ways. The default theme still declares them, so you can read them without the opt-in aliases. The editor also reads them first, so overriding them still works.

One thing changed: the panel layer no longer derives from `--ck-z-default`. In the previous theme, overriding `--ck-z-default` also moved panels, such as menus and the sticky toolbar, by the same amount. Now it moves only the base layer. To shift the whole stack at once, override `--ck-z-base`:

```css
:root { --ck-z-panel: 5000; }	/* ✅ moves the panel layer */
:root { --ck-z-default: 100; }	/* moves only the base layer now */
:root { --ck-z-base: 100; }		/* ✅ moves the whole stack, as --ck-z-default used to */
```

### Overriding on a narrower selector

Because each usage reads the old name first, a legacy override works on any selector, not only `:root` &ndash; set it on a wrapper and it applies to the editor UI inside:

```css
.my-sidebar { --ck-color-comment-separator: #64ca6d; }   /* applies within .my-sidebar */
```

A few tokens only honor a `:root` override, because a component re-defines the new token in its own scope, so a scoped override of the old name cannot reach it: the button state colors (the [override-only table](#override-only-tokens) above), the thread header colors, the `--ck-ui-component-min-height` control size (re-defined by anchor buttons, the form header, and the fullscreen sidebar), and the suggestion deletion / insertion / widget-deletion markers (re-skinned by AI review and revision preview). Override these on `:root`, or use the new name at the scope.

A few legacy names have no bridge at all, because their style was redesigned &ndash; use the new mechanism instead:

| Legacy name                 | What to do now                                                                     |
|-----------------------------|------------------------------------------------------------------------------------|
| `--ck-tooltip-text-padding` | The tooltip padding was restructured &ndash; use `--ck-tooltip-multiline-padding`. |

### Rounding the editor's outer shell

The editor's outer frame &ndash; the toolbar area and the editing area that together form the editor box &ndash; now rounds from a single token, `--ck-editor-outer-radius`. The frame and sticky-panel radii derive from it inside the `.ck-rounded-corners` scope that every editor UI carries. That scope re-defines these tokens on the element itself, so a `:root` override of any of them is shadowed and does nothing, including an override of `--ck-editor-outer-radius`. Set `--ck-editor-outer-radius` on `.ck-rounded-corners` instead, and load your CSS after the editor CSS:

```css
:root { --ck-editor-outer-radius: 12px; }				/* ❌ no effect - shadowed on .ck-rounded-corners */
:root { --ck-editor-frame-border-radius: 12px; }		/* ❌ no effect - same reason */
.ck-rounded-corners { --ck-editor-outer-radius: 12px; }	/* ✅ rounds the whole editor shell */
```

The legacy `--ck-rounded-corners-radius` hook still works and takes precedence over the default, so an integration that already set it keeps working; otherwise the default comes from `--ck-border-radius` through `--ck-radius-corners`.

The editor top no longer reads `--ck-sticky-panel-uniform-border-radius`. That token still controls non-editor sticky panels, but the editor chrome follows `--ck-editor-outer-radius`. The sticky toolbar is flat (square top) by default; opt into a radius for the stuck state with `--ck-editor-sticky-panel-outer-radius`.

Only the editor's own top-level editing roots round this way. Secondary editables that share the `.ck-editor__editable` class &ndash; comment inputs, the AI and revision-history sub-editors, and nested editables such as image captions and table cells &ndash; are intentionally left unrounded.

## Keeping the old look

The two compatibility mechanisms preserve your overrides and old names. They do not turn the new default look back into the old one &ndash; the refreshed theme ships new values. To get the old look, apply the legacy theme preset &ndash; a snapshot of the previous token values, included below as copy-paste blocks. It is a different artifact from the opt-in aliases above.

|               | legacy aliases ([opt-in snippet](#reading-old-token-names)) | `ckeditor5-legacy-theme-preset.css` (this section) |
|---------------|-------------------------------------------------------------|----------------------------------------------------|
| Purpose       | old names resolve (read-BC)                                 | old values (the old look)                          |
| Visual effect | none                                                        | reverts to the previous appearance                 |

### Revert to the old look

Load the legacy theme preset after the editor styles &ndash; it is a snapshot of the previous token values:

```html
<link rel="stylesheet" href=".../ckeditor5.css">		<!-- 1. editor -->
<link rel="stylesheet" href="legacy-theme-preset.css">	<!-- 2. old look, AFTER the editor -->
```

If you do not have the file yet, copy it from the blocks below. The preset is split by package &ndash; the UI core first, then one block per feature &ndash; so if you do not use a feature, delete its block. The commercial block requires the UI core block: paste the UI core first, then append the commercial one.

<details>
<summary><b>Legacy theme preset &ndash; UI core and open-source features</b> (required)</summary>

```css
/*
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/*
 * CKEditor 5 legacy theme preset.
 * Paste into your integration to keep the old look after upgrading.
 */

/* ============================== ckeditor5-ui ============================== */
:root,
:host {
	/* Foundation / Colors */
	--ck-color-base-background: hsl(0 0% 100%);
	--ck-color-base-foreground: hsl(0 0% 98%);
	--ck-color-base-border: hsl(220 6% 81%);
	--ck-color-base-border-light: hsl(0 0% 87%);
	--ck-color-base-text: hsl(0 0% 20%);
	--ck-color-base-text-light: hsl(0 0% 46%);
	--ck-color-base-hover: hsl(0 0% 94.1%);
	--ck-color-base-active: hsl(218.1 100% 58%);
	--ck-color-base-active-focus: hsl(218.2 100% 52.5%);
	--ck-color-base-selected: hsl(212 100% 97.1%);
	--ck-color-base-selected-hover: hsl(211.7 100% 92.9%);
	--ck-color-base-focus: hsl(209 92% 70%);
	--ck-color-base-focus-shadow: hsl(212.4 89.3% 89%);
	--ck-color-base-focus-shadow-faded: hsl(209 90% 72% / .3);
	--ck-color-base-action: hsl(104 50.2% 42.5%);
	--ck-color-base-action-hover: hsl(104 53.2% 40.2%);
	--ck-color-base-action-disabled: hsl(104 44% 58%);
	--ck-color-base-error: hsl(15 100% 43%);
	--ck-color-base-error-shadow: hsl(9 100% 56% / .3);
	--ck-color-base-warning: hsl(15 100% 43%);
	--ck-color-base-success: hsl(120 100% 27%);
	--ck-color-base-highlight: hsl(60 100% 50%);
	--ck-color-base-attention: hsl(43 100% 62%);
	--ck-color-shadow-drop: hsl(0 0% 0% / 0.15);
	--ck-color-shadow-drop-active: hsl(0 0% 0% / 0.2);
	--ck-color-shadow-inner: hsl(0 0% 0% / 0.1);

	--ck-color-base-diff-insertion: 128 71% 40%;
	--ck-color-base-diff-deletion: 345 71% 40%;
	--ck-color-base-diff-format: 191 60% 75%;

	/* Foundation / Border & Radius */
	--ck-radius-xs: 1px;
	--ck-radius-sm: 2px;
	--ck-radius-base: 2px;
	--ck-radius-md: 4px;
	--ck-radius-lg: 6px;
	--ck-radius-xl: 8px;
	--ck-radius-full: 50%;
	--ck-radius-corners: 0;
	--ck-border-width-thin: 1px;
	--ck-border-width-thick: 2px;

	/* Foundation / Spacing */
	--ck-spacing-unit: 0.6em;
	--ck-spacing-xl: calc(var(--ck-spacing-unit) * 2);
	--ck-spacing-lg: calc(var(--ck-spacing-unit) * 1.5);
	--ck-spacing-base: calc(var(--ck-spacing-unit) * 0.8);   /* old md, 0.48em */
	--ck-spacing-md: calc(var(--ck-spacing-unit) * 0.667);   /* old ms, 0.4em */
	--ck-spacing-ms: var(--ck-spacing-md);                   /* retired, bridged to md */
	--ck-spacing-sm: calc(var(--ck-spacing-unit) * 0.5);
	--ck-spacing-xs: calc(var(--ck-spacing-unit) * 0.3);
	--ck-spacing-2xs: calc(var(--ck-spacing-unit) * 0.16);
	--ck-spacing-standard: var(--ck-spacing-unit);

	/* Foundation / Shadow */
	--ck-inset-shadow-sm: 2px 2px 3px var(--ck-color-shadow-inner) inset;
	--ck-shadow-md: 0 1px 2px 1px var(--ck-color-shadow-drop);
	--ck-shadow-lg: 0 3px 6px 1px var(--ck-color-shadow-drop-active);

	/* Foundation / Width */
	--ck-width-xs: calc(var(--ck-font-size-base) * 15);
	--ck-width-sm: calc(var(--ck-font-size-base) * 20);
	--ck-width-md: calc(var(--ck-font-size-base) * 25);
	--ck-width-lg: calc(var(--ck-font-size-base) * 30);
	--ck-width-xl: calc(var(--ck-font-size-base) * 35);
	--ck-width-2xl: calc(var(--ck-font-size-base) * 40);

	/* Foundation / Typography */
	--ck-font-family: Helvetica, Arial, Tahoma, Verdana, Sans-Serif;
	--ck-font-size-base: 13px;
	--ck-line-height-base: 1.84615;
	--ck-font-size-xs: 0.7em;
	--ck-font-size-sm: 0.75em;
	--ck-font-size-md: 0.85em;
	--ck-font-size-lg: 1.15em;
	--ck-font-size-xl: 1.4em;
	--ck-font-size-2xl: 1.8em;
	--ck-font-size-normal: var(--ck-font-size-base);
	--ck-font-weight-normal: 400;
	--ck-font-weight-medium: 500;
	--ck-font-weight-semibold: 600;
	--ck-font-weight-bold: 700;

	/* Foundation / Focus */
	--ck-focus-border-color: var(--ck-color-focus-border);
	--ck-focus-shadow-geometry: 0 0 0 3px;
	--ck-focus-ring: 1px solid var(--ck-color-focus-border);
	--ck-focus-shadow: var(--ck-focus-outer-shadow-geometry, var(--ck-focus-shadow-geometry)) var(--ck-color-focus-outer-shadow);
	--ck-focus-shadow-disabled: var(--ck-focus-outer-shadow-geometry, var(--ck-focus-shadow-geometry)) var(--ck-color-focus-disabled-shadow);
	--ck-focus-shadow-error: var(--ck-focus-outer-shadow-geometry, var(--ck-focus-shadow-geometry)) var(--ck-color-focus-error-shadow);
	--ck-outline-fake-caret: solid 1px hsl(0 0% 100% / .5);

	/* Foundation / Other */
	--ck-opacity-disabled: .5;
	--ck-size-min-height: 2.3em;

	/* Foundation / Motion */
	--ck-duration-fast: .1s;
	--ck-duration-base: .2s;
	--ck-duration-slow: .3s;
	--ck-duration-slower: .4s;
	--ck-ease-standard: ease;
	--ck-ease-interactive: ease-in-out;
	--ck-ease-emphasized: cubic-bezier(0, 0, 0.24, 0.95);
	--ck-animation-duration-fast: var(--ck-duration-fast);
	--ck-animation-duration-base: var(--ck-duration-base);
	--ck-animation-duration-slow: var(--ck-duration-slow);
	--ck-animation-duration-emphasis: 1.5s;
	--ck-animation-duration-reduced: 0s;
	--ck-animation-ease-standard: var(--ck-ease-standard);
	--ck-animation-ease-interactive: var(--ck-ease-interactive);
	--ck-animation-ease-linear: linear;
	--ck-animation-fill-both: both;
	--ck-animation-repeat-infinite: infinite;
	--ck-animation-none: var(--ck-transition-none);
	--ck-transition-none: none;

	/* Foundation / Layers */
	--ck-z-base: 1;
	--ck-z-overlay: calc( var(--ck-z-base) + 999 );
	--ck-z-modal: 9999;

	/* Semantic / Colors / Surface */
	--ck-color-surface-canvas: var(--ck-color-base-background);
	--ck-color-surface-control: var(--ck-color-surface-canvas);
	--ck-color-surface-container: var(--ck-color-surface-canvas);
	--ck-color-surface-inverse: var(--ck-color-base-text);
	--ck-color-border-control: var(--ck-color-base-border);
	--ck-color-border-container: var(--ck-color-base-border);
	--ck-color-divider: var(--ck-color-base-border);

	/* Semantic / Colors / Text */
	--ck-color-text: var(--ck-color-text-primary);
	--ck-color-text-primary: var(--ck-color-base-text);
	--ck-color-text-secondary: var(--ck-color-base-text-light);
	--ck-color-text-disabled: var(--ck-color-text-secondary);
	--ck-color-text-inverse: var(--ck-color-base-background);
	--ck-color-text-error: var(--ck-color-feedback-error);

	/* Semantic / Colors / Feedback */
	--ck-color-feedback-error: var(--ck-color-base-error);
	--ck-color-feedback-warning: var(--ck-color-base-warning);
	--ck-color-feedback-success: var(--ck-color-base-success);
	--ck-color-feedback-highlight: var(--ck-color-base-highlight);

	/* Semantic / Colors / Interactive */
	--ck-color-interactive-hover-surface: var(--ck-color-base-hover);
	--ck-color-interactive-active-surface: var(--ck-color-base-hover);
	--ck-color-interactive-selected-surface: var(--ck-color-base-selected);
	--ck-color-interactive-selected-surface-hover: var(--ck-color-base-selected-hover);
	--ck-color-interactive-selected-text: var(--ck-color-base-active);
	--ck-color-interactive-primary-surface: var(--ck-color-base-action);
	--ck-color-interactive-primary-surface-hover: var(--ck-color-base-action-hover);
	--ck-color-interactive-primary-surface-disabled: var(--ck-color-base-action-disabled);
	--ck-color-interactive-primary-text: var(--ck-color-text-inverse);
	--ck-color-interactive-focus-border-coordinates: 218, 81.8%, 56.9%;
	--ck-color-interactive-focus-border: hsl(var(--ck-color-focus-border-coordinates, var(--ck-color-interactive-focus-border-coordinates)));
	--ck-color-interactive-focus-shadow: var(--ck-color-base-focus-shadow);
	--ck-color-interactive-focus-disabled-shadow: var(--ck-color-base-focus-shadow-faded);
	--ck-color-interactive-focus-error-shadow: var(--ck-color-base-error-shadow);

	/* Semantic / Interactive Focus */
	--ck-interactive-focus-ring: var(--ck-focus-ring);
	--ck-interactive-focus-border-color: var(--ck-focus-border-color);
	--ck-interactive-focus-shadow: var(--ck-focus-outer-shadow, var(--ck-focus-shadow));
	--ck-interactive-focus-disabled-shadow: var(--ck-focus-disabled-outer-shadow, var(--ck-focus-shadow-disabled));
	--ck-interactive-focus-error-shadow: var(--ck-focus-error-outer-shadow, var(--ck-focus-shadow-error));

	/* Semantic / Shape & Border */
	--ck-border-width-control: var(--ck-border-width-thin);
	--ck-border-width-surface: var(--ck-border-width-thin);
	--ck-border-width-divider: var(--ck-border-width-thin);
	--ck-border-width-emphasis: var(--ck-border-width-thick);
	--ck-border-control: var(--ck-border-width-control) solid var(--ck-color-border-control);
	--ck-border-surface: var(--ck-border-width-surface) solid var(--ck-color-border-container);
	--ck-border-divider: var(--ck-border-width-divider) solid var(--ck-color-divider);
	--ck-border-radius-control: var(--ck-border-radius, var(--ck-radius-base));
	--ck-border-radius-surface: var(--ck-border-radius, var(--ck-radius-base));
	--ck-border-radius-uniform: initial;
	--ck-border-radius-surface-attached: var(--ck-border-radius-surface);
	--ck-border-radius-surface-attached-top: 0 0 var(--ck-border-radius-surface-attached) var(--ck-border-radius-surface-attached);
	--ck-border-radius-surface-attached-bottom: var(--ck-border-radius-surface-attached) var(--ck-border-radius-surface-attached) 0 0;
	--ck-border-radius-surface-cut-top-left: 0 var(--ck-border-radius-surface-attached) var(--ck-border-radius-surface-attached) var(--ck-border-radius-surface-attached);
	--ck-border-radius-surface-cut-top-right: var(--ck-border-radius-surface-attached) 0 var(--ck-border-radius-surface-attached) var(--ck-border-radius-surface-attached);
	--ck-border-radius-surface-cut-bottom-right: var(--ck-border-radius-surface-attached) var(--ck-border-radius-surface-attached) 0 var(--ck-border-radius-surface-attached);
	--ck-border-radius-surface-cut-bottom-left: var(--ck-border-radius-surface-attached) var(--ck-border-radius-surface-attached) var(--ck-border-radius-surface-attached) 0;

	/* Semantic / Spacing */
	--ck-spacing-control-padding-block: var(--ck-spacing-tiny, var(--ck-spacing-xs));
	--ck-spacing-control-padding-inline: var(--ck-spacing-standard, var(--ck-spacing-base));
	--ck-spacing-control-padding-inline-compact: var(--ck-spacing-small, var(--ck-spacing-sm));
	--ck-spacing-control-padding-inline-start-compact: var(--ck-spacing-tiny, var(--ck-spacing-xs));
	--ck-spacing-control-padding-block-compact: var(--ck-spacing-extra-tiny, var(--ck-spacing-2xs));
	--ck-spacing-control-icon-gap: var(--ck-spacing-medium, var(--ck-spacing-md));
	--ck-spacing-padding-compact: var(--ck-spacing-small, var(--ck-spacing-sm));
	--ck-spacing-padding-snug: var(--ck-spacing-medium-small, var(--ck-spacing-ms));
	--ck-spacing-padding: var(--ck-spacing-medium, var(--ck-spacing-md));
	--ck-spacing-padding-comfortable: var(--ck-spacing-large, var(--ck-spacing-lg));
	--ck-spacing-padding-spacious: var(--ck-spacing-xl);
	--ck-spacing-gap-compact: var(--ck-spacing-small, var(--ck-spacing-sm));
	--ck-spacing-gap-snug: var(--ck-spacing-medium-small, var(--ck-spacing-ms));
	--ck-spacing-gap: var(--ck-spacing-medium, var(--ck-spacing-md));
	--ck-spacing-gap-comfortable: var(--ck-spacing-large, var(--ck-spacing-lg));
	--ck-spacing-gap-spacious: var(--ck-spacing-xl);

	/* Semantic / Typography */
	--ck-font-weight-ui-default: var(--ck-font-weight-normal);
	--ck-font-weight-ui-strong: var(--ck-font-weight-semibold);
	--ck-font-weight-ui-heading: var(--ck-font-weight-bold);
	--ck-font-weight-ui-label: var(--ck-font-weight-bold);
	--ck-font-weight-ui-emphasis: var(--ck-font-weight-bold);
	--ck-font-weight-ui-muted: var(--ck-font-weight-normal);
	--ck-font-weight-ui-inherit: inherit;
	--ck-font-size-control: inherit;
	--ck-toolbar-text-font-size: var(--ck-font-size-base);
	--ck-menubar-text-font-size: var(--ck-font-size-base);

	/* Semantic / Layout */
	--ck-size-control-min-height: var(--ck-ui-component-min-height, var(--ck-size-min-height));

	/* Semantic / Width */
	--ck-width-balloon-form: min(var(--ck-width-md), 90vw);
	--ck-width-dialog: min(var(--ck-width-md), 90vw);
	--ck-width-dialog-lg: min(var(--ck-width-xl), 90vw);

	/* Semantic / Shadow */
	--ck-shadow-surface-floating: var(--ck-drop-shadow, var(--ck-shadow-md));

	/* Semantic / Motion */
	--ck-transition-duration-control-fast: var(--ck-duration-fast);
	--ck-transition-duration-control: var(--ck-duration-base);
	--ck-transition-duration-control-emphasized: var(--ck-duration-slow);
	--ck-transition-duration-surface: var(--ck-duration-slower);
	--ck-transition-timing-function-control: var(--ck-ease-interactive);
	--ck-transition-timing-function-control-emphasized: var(--ck-ease-emphasized);
	--ck-transition-timing-function-surface: var(--ck-ease-standard);
	--ck-transition-control: box-shadow var(--ck-transition-duration-control) var(--ck-transition-timing-function-control),
		border var(--ck-transition-duration-control) var(--ck-transition-timing-function-control);
	--ck-transition-control-fast: box-shadow var(--ck-transition-duration-control-fast) var(--ck-transition-timing-function-control),
		border var(--ck-transition-duration-control-fast) var(--ck-transition-timing-function-control);
	--ck-animation-duration-feedback: var(--ck-animation-duration-slow);
	--ck-animation-duration-surface-entrance: var(--ck-animation-duration-slow);
	--ck-animation-duration-progress: var(--ck-animation-duration-emphasis);
	--ck-animation-duration-progress-reduced: var(--ck-animation-duration-reduced);
	--ck-animation-timing-function-feedback: var(--ck-animation-ease-standard);
	--ck-animation-timing-function-progress: var(--ck-animation-ease-linear);
	--ck-animation-fill-mode-feedback: var(--ck-animation-fill-both);

	/* Semantic / Layer */
	--ck-layer-base: var(--ck-z-default, var(--ck-z-base));
	--ck-layer-control-raised: calc(var(--ck-layer-base) + 1);
	--ck-layer-panel: var(--ck-z-panel, var(--ck-z-overlay));
	--ck-layer-panel-above: calc(var(--ck-layer-panel) + 1);
	--ck-layer-panel-below: calc(var(--ck-layer-panel) - 1);
	--ck-layer-dialog: var(--ck-z-dialog, var(--ck-z-modal));
	--ck-layer-tooltip: calc(var(--ck-layer-dialog) + 100);
	--ck-layer-balloon-arrow-back: calc(var(--ck-layer-base) - 3);
	--ck-layer-balloon-arrow-front: calc(var(--ck-layer-balloon-arrow-back) + 1);

	/* Component / Button */
	--ck-button-padding: var(--ck-spacing-control-padding-block);
	--ck-button-with-text-padding: var(--ck-spacing-tiny, var(--ck-spacing-xs)) var(--ck-spacing-standard, var(--ck-spacing-base));
	--ck-button-standard-min-width: var(--ck-size-control-min-height);
	--ck-button-font-size: inherit;
	--ck-button-border-radius: var(--ck-border-radius-control);
	--ck-button-border: var(--ck-border-width-control) solid transparent;
	--ck-button-default-background-color: transparent;
	--ck-button-default-hover-background-color: var(--ck-color-interactive-hover-surface);
	--ck-button-default-active-background-color: var(--ck-color-interactive-active-surface);
	--ck-button-default-disabled-background-color: transparent;
	--ck-button-on-background-color: var(--ck-color-interactive-selected-surface);
	--ck-button-on-hover-background-color: var(--ck-color-interactive-selected-surface-hover);
	--ck-button-on-active-background-color: var(--ck-color-interactive-selected-surface-hover);
	--ck-button-on-disabled-background-color: hsl(211 15% 95%);
	--ck-button-on-text-color: var(--ck-color-interactive-selected-text);
	--ck-button-action-background-color: var(--ck-color-interactive-primary-surface);
	--ck-button-action-hover-background-color: var(--ck-color-interactive-primary-surface-hover);
	--ck-button-action-active-background-color: var(--ck-color-interactive-primary-surface-hover);
	--ck-button-action-disabled-background-color: hsl(104 44% 58%);
	--ck-button-action-text-color: var(--ck-color-interactive-primary-text);
	--ck-button-save-color: var(--ck-color-feedback-success);
	--ck-button-cancel-color: var(--ck-color-feedback-warning);
	--ck-button-focus-border-color: var(--ck-interactive-focus-border-color);
	--ck-button-opacity-disabled: var(--ck-disabled-opacity, var(--ck-opacity-disabled));
	--ck-button-action-opacity-disabled: var(--ck-disabled-opacity, var(--ck-opacity-disabled));
	--ck-button-icon-gap: var(--ck-spacing-control-icon-gap);

	--ck-button-background: var(--ck-button-default-background-color);

	/* Component / Input */
	--ck-input-width: 18em;
	--ck-input-padding: var(--ck-spacing-control-padding-block-compact) var(--ck-spacing-medium, var(--ck-spacing-base)); /* old: extra-tiny medium = 0.096em 0.48em */
	--ck-input-font-size: var(--ck-font-size-control);
	--ck-input-border-radius: var(--ck-border-radius-control);
	--ck-input-border: var(--ck-border-width-control) solid var(--ck-input-border-color);
	--ck-input-background-color: var(--ck-color-surface-control);
	--ck-input-border-color: var(--ck-color-border-control);
	--ck-input-error-border-color: var(--ck-color-feedback-error);
	--ck-input-text-color: var(--ck-color-text-primary);
	--ck-input-disabled-background-color: hsl(0 0% 95%);
	--ck-input-disabled-border-color: var(--ck-color-border-control);
	--ck-input-disabled-text-color: var(--ck-color-text-disabled);
	--ck-input-focus-border-color: var(--ck-interactive-focus-border-color);
	--ck-input-text-width: var(--ck-input-width);

	/* Component / Toolbar */
	--ck-toolbar-item-gap-inline: var(--ck-spacing-gap-compact);
	--ck-toolbar-padding: 0 var(--ck-spacing-padding-compact); /* old: 0 var(--ck-spacing-small) = 0.3em */
	--ck-toolbar-dropdown-vertical-padding: 0;
	--ck-toolbar-border-radius: var(--ck-border-radius-surface);
	--ck-toolbar-vertical-button-border-radius: 0;
	--ck-toolbar-background-color: var(--ck-color-surface-container);
	--ck-toolbar-border-color: var(--ck-color-border-container);
	--ck-toolbar-border: var(--ck-border-width-surface) solid var(--ck-toolbar-border-color);

	/* Component / Block Toolbar */
	--ck-block-toolbar-button-size: var(--ck-font-size-normal, var(--ck-font-size-base));

	/* Component / Dropdown */
	--ck-dropdown-arrow-size: calc(0.5 * var(--ck-icon-size));
	--ck-dropdown-panel-padding: 0;
	--ck-dropdown-panel-border-radius: var(--ck-border-radius-surface-attached);
	--ck-dropdown-panel-uniform-border-radius: var(--ck-border-radius-uniform);
	--ck-dropdown-panel-uniform-button-border-radius: var(--ck-border-radius-uniform);
	--ck-dropdown-panel-background-color: var(--ck-color-surface-container);
	--ck-dropdown-panel-border-color: var(--ck-color-border-container);
	--ck-dropdown-list-background-color: transparent;
	--ck-dropdown-panel-border: var(--ck-border-width-surface) solid var(--ck-dropdown-panel-border-color);

	/* Component / List */
	--ck-list-item-min-width: 15em;
	--ck-list-padding: var(--ck-spacing-padding-compact) 0;
	--ck-list-item-outer-padding: 0;
	--ck-list-separator-inline-margin: 0;
	--ck-list-border-radius: var(--ck-border-radius-surface);
	--ck-list-background-color: var(--ck-color-surface-control);
	--ck-list-divider-color: var(--ck-color-divider);
	--ck-list-button-hover-background-color: var(--ck-button-default-hover-background-color);
	--ck-list-button-on-background-color: var(--ck-button-on-text-color);
	--ck-list-button-on-text-color: var(--ck-color-text-inverse);
	--ck-list-group-label-font-size: 11px;
	--ck-list-styles-list-padding: var(--ck-spacing-padding-comfortable);

	/* Component / List Item Button */
	--ck-list-item-button-padding: var(--ck-spacing-control-padding-block) calc(2 * var(--ck-spacing-control-padding-inline));
	--ck-list-item-button-border-radius: 0;

	/* Component / List Dropdown */
	--ck-list-dropdown-uniform-border-radius: var(--ck-border-radius-uniform);
	--ck-list-dropdown-button-border-radius: initial;

	/* Component / Dropdown Menu Panel */
	--ck-dropdown-menu-panel-max-height: 314px;
	--ck-dropdown-menu-panel-border-radius: var(--ck-border-radius-surface-attached);
	--ck-dropdown-menu-panel-uniform-border-radius: var(--ck-border-radius-uniform);

	/* Component / Dropdown Menu List Item */
	--ck-dropdown-menu-menu-item-min-width: 18em;
	--ck-dropdown-menu-list-item-spinner-size: 20px;
	--ck-dropdown-menu-button-border-radius: 0;

	/* Component / Menu Bar */
	--ck-menu-bar-padding: var(--ck-spacing-padding-compact);
	--ck-menu-bar-gap: var(--ck-spacing-gap-compact);

	/* Component / Menu Bar Button */
	--ck-menu-bar-button-border-radius: 0;

	/* Component / Menu Bar Panel */
	--ck-menu-bar-panel-border-radius: var(--ck-border-radius-surface-attached);
	--ck-menu-bar-panel-uniform-border-radius: var(--ck-border-radius-uniform);
	--ck-menu-bar-item-focus-border-color: var(--ck-interactive-focus-border-color);

	/* Component / Menu Bar List Item */
	--ck-menu-bar-list-item-button-border-radius: 0;

	/* Component / Dialog */
	--ck-dialog-max-height: 90vh;
	--ck-dialog-max-width: 100vw;
	--ck-dialog-border-radius: var(--ck-border-radius-surface);
	--ck-dialog-border: var(--ck-border-width-surface) solid var(--ck-color-border-container);
	--ck-dialog-shadow: var(--ck-shadow-surface-floating);
	--ck-dialog-background-color: var(--ck-color-surface-container);
	--ck-dialog-overlay-background-color: hsl(0 0% 0% / .5);
	--ck-dialog-header-padding: var(--ck-form-header-padding);
	--ck-dialog-content-padding: var(--ck-spacing-padding-comfortable);
	--ck-dialog-actions-padding: var(--ck-spacing-padding-comfortable);
	--ck-dialog-actions-gap: var(--ck-spacing-gap-comfortable);

	/* Component / Balloon Panel */
	--ck-balloon-panel-border-radius: var(--ck-border-radius-surface);
	--ck-balloon-panel-border: var(--ck-border-width-surface) solid var(--ck-balloon-panel-border-color);
	--ck-balloon-panel-background-color: var(--ck-color-surface-container);
	--ck-balloon-panel-border-color: var(--ck-color-border-container);
	--ck-balloon-panel-arrow-display: block;

	/* Component / Sticky Panel */
	--ck-sticky-panel-uniform-border-radius: var(--ck-border-radius-uniform);

	/* Component / Tooltip */
	--ck-tooltip-max-width: 200px;
	--ck-tooltip-padding: var(--ck-spacing-padding-compact) var(--ck-spacing-padding); /* ~4px/6px, closer to old (was 0 vertical) */
	--ck-tooltip-multiline-padding: 0 4px;
	--ck-tooltip-border: 0px solid transparent;
	--ck-tooltip-border-radius: var(--ck-balloon-panel-border-radius);
	--ck-tooltip-background-color: var(--ck-color-surface-inverse);
	--ck-tooltip-text-color: var(--ck-color-text-inverse);
	--ck-tooltip-text-font-size: .9em;

	/* Component / Switch Button */
	--ck-switch-button-toggle-border-radius: var(--ck-border-radius-control);
	--ck-switch-button-toggle-inner-border-radius: calc(.5 * var(--ck-switch-button-toggle-border-radius));
	--ck-switch-button-off-background-color: hsl(0 0% 57.6%);
	--ck-switch-button-off-hover-background-color: hsl(0 0% 49%);
	--ck-switch-button-on-background-color: var(--ck-button-action-background-color);
	--ck-switch-button-on-hover-background-color: var(--ck-color-interactive-primary-surface-hover);
	--ck-switch-button-inner-background-color: var(--ck-color-surface-canvas);

	/* Component / Form Header */
	--ck-form-header-height: 3.384em;
	--ck-form-header-padding-block: var(--ck-spacing-padding-compact);
	--ck-form-header-padding: var(--ck-form-header-padding-block) var(--ck-spacing-padding-comfortable);
	--ck-form-header-with-back-button-padding-inline-start: initial;
	--ck-form-header-label-font-size: var(--ck-font-size-lg);

	/* Component / Form */
	--ck-form-default-width: 340px;
	--ck-form-padding: 0 0 var(--ck-spacing-padding-comfortable);
	--ck-form-content-padding-bottom: 0;

	/* Component / Form Row */
	--ck-form-row-padding: var(--ck-spacing-standard, var(--ck-spacing-base)) var(--ck-spacing-padding-comfortable) 0; /* old: standard large 0 = 0.6em 0.9em 0 */
	--ck-form-row-edge-padding-top: var(--ck-spacing-padding-comfortable);
	--ck-form-row-edge-padding-bottom: var(--ck-spacing-padding-comfortable);
	--ck-form-row-edge-gap-top: var(--ck-spacing-gap-comfortable);
	--ck-form-row-edge-gap-bottom: var(--ck-spacing-gap-comfortable);
	--ck-form-row-label-font-size: inherit;

	/* Component / Labeled Field */
	--ck-labeled-field-label-background-color: var(--ck-color-surface-control);
	--ck-labeled-field-label-start-gap: var(--ck-spacing-control-icon-gap);
	--ck-labeled-field-label-font-size: var(--ck-font-size-base); /* old: label had no font-size (inherited base = 13px); md would be ~11px */

	/* Component / Editor UI */
	--ck-editor-editable-padding: 0 var(--ck-spacing-standard, var(--ck-spacing-base)); /* old: 0 var(--ck-spacing-standard) = 0.6em */
	--ck-editor-outer-radius: 0; /* The single token for the editor's outer-shell radius; the frame and sticky-panel radii derive from it. */
	--ck-editor-sticky-panel-outer-radius: 0;
	--ck-editor-frame-border-radius: 0;
	--ck-editor-sticky-panel-border-radius: 0;
	--ck-editor-frame-border: var(--ck-border-width-surface) solid var(--ck-editor-frame-border-color);
	--ck-editor-frame-border-color: var(--ck-color-border-container);
	--ck-editor-editable-focus-border-color: var(--ck-interactive-focus-border-color);

	/* Component / Color Selector */
	--ck-color-selector-padding: 0;
	--ck-color-selector-uniform-border-radius: var(--ck-border-radius-uniform);
	--ck-color-selector-color-picker-border-top: var(--ck-border-divider);
	--ck-color-selector-grids-fragment-padding: 0;
	--ck-color-selector-color-picker-padding: 8px;
	--ck-color-selector-action-bar-padding: 0 8px 8px;

	/* Component / Color Grid */
	--ck-color-grid-tile-size: 24px;
	--ck-color-grid-gap: 5px;
	--ck-color-grid-margin: 0;
	--ck-color-grid-padding: 8px;
	--ck-color-grid-tile-border-radius: 0;
	--ck-color-grid-tile-hover-transform: none;
	--ck-color-grid-tile-hover-layer: auto;

	/* Component / Search */
	--ck-search-results-info-padding: var(--ck-spacing-gap) var(--ck-spacing-padding-comfortable);
	--ck-search-results-info-primary-font-size: inherit;
	--ck-search-results-info-secondary-font-size: inherit;

	/* Component / Icon */
	--ck-icon-size: calc(var(--ck-line-height-base) * 1em);
	--ck-icon-font-size: .8333350694em;

	/* Component / Spinner */
	--ck-toolbar-spinner-size: 18px;

	/* Component / Collapsible */
	--ck-collapsible-padding: var(--ck-spacing-padding);
	--ck-collapsible-children-padding: var(--ck-spacing-padding-comfortable) 0 0;
	--ck-collapsible-button-font-weight: var(--ck-font-weight-ui-strong);
	--ck-collapsible-button-border-radius: var(--ck-border-radius-control);

	/* Component / Autocomplete */
	--ck-autocomplete-results-max-height: 200px;
	--ck-autocomplete-results-border-radius: var(--ck-border-radius-surface-attached);
	--ck-autocomplete-results-uniform-border-radius: var(--ck-border-radius-uniform);
	--ck-autocomplete-results-border: var(--ck-border-width-surface) solid var(--ck-dropdown-panel-border-color);
	--ck-autocomplete-results-background-color: var(--ck-color-surface-container);

	/* Component / Responsive Form */
	--ck-responsive-form-padding: var(--ck-spacing-padding-comfortable);
	--ck-responsive-form-divider-border: var(--ck-border-divider);

	/* Component / Powered By */
	--ck-powered-by-font-size: calc(var(--ck-font-size-base) * 7.5 / 13);
	--ck-powered-by-line-height: calc(var(--ck-font-size-base) * 10 / 13);
	--ck-powered-by-letter-spacing: calc(var(--ck-font-size-base) * -0.2 / 13);
	--ck-powered-by-icon-width: calc(var(--ck-font-size-base) * var(--ck-powered-by-svg-width) / 13);
	--ck-powered-by-icon-height: calc(var(--ck-font-size-base) * var(--ck-powered-by-svg-height) / 13);
	--ck-powered-by-label-font-weight: bold;

	/* Component / Evaluation Badge */
	--ck-evaluation-badge-label-font-weight: bold;

	/* Features / Accessibility Help */
	--ck-accessibility-help-dialog-max-height: 400px;
	--ck-accessibility-help-dialog-max-width: 600px;
	--ck-accessibility-help-dialog-item-divider-width: 1px;

	--ck-tab-button-active-icon-color: var(--ck-color-base-active);
}

.ck.ck-menu-bar__menu.ck-menu-bar__menu_top-level > .ck-menu-bar__menu__button {
	padding: var(--ck-spacing-small, var(--ck-spacing-sm)) var(--ck-spacing-control-icon-gap);
}

.ck {
	/* eslint-disable-next-line css/use-baseline */
	scrollbar-color: auto;
}

.ck.ck-toolbar .ck-button__label {
	line-height: calc(var(--ck-line-height-base) * var(--ck-font-size-base));
}

.ck.ck-button.ck-button_outline {
	--ck-button-outline-color: var(--ck-color-base-active);
}

.ck.ck-form__header > .ck.ck-button {
	--ck-size-control-min-height: var(--ck-ui-component-min-height, var(--ck-size-min-height));
}

.ck.ck-labeled-field-view > .ck.ck-labeled-field-view__input-wrapper > .ck-dropdown > .ck.ck-button {
	padding: var(--ck-button-with-text-padding);
}

:is(.ck.ck-button, :where(a).ck.ck-button).ck-button_surface {
	--ck-button-surface-border-color: var(--ck-color-interactive-selected-text);
}

.ck.ck-accessibility-help-dialog .ck-accessibility-help-dialog__content {
	margin: 0;
	border: 1px solid transparent;
	border-radius: 0;
}

/* ============================== ckeditor5-block-quote ============================== */
.ck-content blockquote {
	border-left: solid 5px hsl(0 0% 80%);
}

.ck-content[dir="rtl"] blockquote {
	border-right: solid 5px hsl(0 0% 80%);
}

/* ============================== ckeditor5-bookmark ============================== */
:root,
:host {
	--ck-bookmark-form-width: var(--ck-width-balloon-form);
}

/* ============================== ckeditor5-code-block ============================== */
.ck-content pre {
	background: hsl(0 0% 78% / 0.3);
	border: 1px solid hsl(0 0% 77%);
}

/* ============================== ckeditor5-emoji ============================== */
:root,
:host {
	--ck-emoji-grid-tile-size: 27px;
	--ck-emoji-grid-margin: var(--ck-spacing-standard, var(--ck-spacing-base)) var(--ck-spacing-padding-comfortable); /* old: standard large = 0.6em 0.9em */
	--ck-emoji-grid-gap: var(--ck-spacing-gap-compact) var(--ck-spacing-gap-compact);
	--ck-emoji-categories-list-margin: 0 var(--ck-spacing-padding-comfortable);
}

/* ============================== ckeditor5-find-and-replace ============================== */
:root,
:host {
	--ck-find-and-replace-form-width: var(--ck-width-dialog);
	--ck-find-and-replace-form-replace-field-padding-top: var(--ck-spacing-standard, var(--ck-spacing-base));
	--ck-find-and-replace-form-inputs-padding: var(--ck-dialog-actions-padding);
	--ck-find-and-replace-form-actions-padding: var(--ck-dialog-actions-padding);
}

.ck.ck-find-and-replace-form .ck-find-and-replace-form__actions > .ck-button-find .ck-button__label {
	padding-left: var(--ck-spacing-large, var(--ck-spacing-lg));
	padding-right: var(--ck-spacing-large, var(--ck-spacing-lg));
}

.ck.ck-toolbar .ck.ck-list__item > .ck.ck-button .ck-button__label {
	line-height: calc(var(--ck-line-height-base) * var(--ck-font-size-base));
}

/* ============================== ckeditor5-fullscreen ============================== */
:root,
:host {
	--ck-fullscreen-editable-shadow: var(--ck-shadow-md);
	--ck-fullscreen-left-sidebar-avatar-size: 28px;
	--ck-fullscreen-editable-border-radius: 2px;
	--ck-fullscreen-left-sidebar-toggle-button-hover-background: var(--ck-color-interactive-hover-surface);
}

/* ============================== ckeditor5-horizontal-line ============================== */
.ck-content hr {
	background: hsl(0 0% 87%);
}

/* ============================== ckeditor5-html-embed ============================== */
:root,
:host {
	--ck-html-embed-background: var(--ck-color-base-foreground);
	--ck-html-embed-button-hover-background: var(--ck-color-interactive-hover-surface);
	--ck-widget-label-border-radius: 0;
}

/* ============================== ckeditor5-image ============================== */
:root,
:host {
	/* Image insert. */
	--ck-image-insert-insert-by-url-width: 250px;
	--ck-image-insert-form-padding: var(--ck-list-padding);
	--ck-image-insert-form-button-gap: 0;

	/* Image. */
	--ck-text-alternative-form-width: var(--ck-width-balloon-form);
	--ck-image-custom-resize-form-width: var(--ck-width-balloon-form);
}

/* ============================== ckeditor5-link ============================== */
:root,
:host {
	--ck-link-panel-width: var(--ck-width-balloon-form);
	--ck-link-providers-width: var(--ck-width-balloon-form);
	--ck-link-provider-list-padding-bottom: 0;
	--ck-link-properties-width: var(--ck-width-balloon-form);
}

/* ============================== ckeditor5-media-embed ============================== */
:root,
:host {
	--ck-media-form-width: var(--ck-width-dialog);
}

/* ============================== ckeditor5-mention ============================== */
.ck.ck-mentions > .ck-list__item.ck-mentions__item_focused > .ck-button {
	background: var(--ck-list-button-on-background-color);
	border-color: transparent;
	box-shadow: none;
}

.ck.ck-mentions > .ck.ck-list__item.ck-mentions__item_focused > .ck.ck-button .ck-button__label {
	color: var(--ck-list-button-on-text-color);
}

/* ============================== ckeditor5-table ============================== */
:root,
:host {
	/* Insert table. */
	--ck-insert-table-dropdown-padding: 10px;
	--ck-insert-table-dropdown-box-width: 12px;
	--ck-insert-table-dropdown-box-height: 11px;
	--ck-insert-table-dropdown-box-margin: 1px;
	--ck-insert-table-dropdown-box-border-radius: var(--ck-radius-xs);
	--ck-insert-table-dropdown-label-font-size: inherit;
	--ck-insert-table-dropdown-label-padding: 0;

	/* Table properties. */
	--ck-table-properties-width: var(--ck-width-balloon-form);
	--ck-table-cell-properties-width: var(--ck-width-balloon-form);
	--ck-table-form-default-input-width: 80px;  /* scoped default (not :root) */
	--ck-table-form-dimensions-input-width: calc(var(--ck-table-form-default-input-width) * 2 + var(--ck-spacing-large, var(--ck-spacing-lg)));  /* scoped default (not :root) */
	--ck-table-properties-error-arrow-size: 6px;
	--ck-table-properties-min-error-width: 150px;
}

.ck.ck-table-cell-properties-form .ck-form__row.ck-table-cell-properties-form__alignment-row .ck.ck-toolbar:first-of-type {
	flex-grow: 0.57;
}

.ck.ck-table-cell-properties-form .ck-form__row.ck-table-cell-properties-form__alignment-row .ck.ck-toolbar:last-of-type {
	flex-grow: 1;
}

.ck.ck-table-form .ck-form__row.ck-table-form__border-row .ck-table-form__border-style,
.ck.ck-table-form .ck-form__row.ck-table-form__border-row .ck-table-form__border-width {
	flex: 0 0 auto;
	width: var(--ck-table-form-default-input-width);
	min-width: var(--ck-table-form-default-input-width);
	max-width: var(--ck-table-form-default-input-width);
}

.ck.ck-table-form .ck-form__row.ck-table-form__border-row .ck-table-form__border-color {
	flex: 1 1 auto;
	width: auto;
	min-width: 0;
	max-width: none;
}

.ck.ck-table-form .ck-form__row.ck-table-form__dimensions-row {
	--ck-table-form-dimensions-input-width: calc(var(--ck-table-form-default-input-width) * 2 + var(--ck-spacing-large, var(--ck-spacing-lg)));
}

.ck.ck-table-form .ck-form__row.ck-table-form__dimensions-row .ck-table-form__dimensions-row__width,
.ck.ck-table-form .ck-form__row.ck-table-form__dimensions-row .ck-table-form__dimensions-row__height {
	flex: 0 0 auto;
	width: var(--ck-table-form-default-input-width);
	min-width: var(--ck-table-form-default-input-width);
	max-width: var(--ck-table-form-default-input-width);
}

.ck.ck-table-form .ck-form__row.ck-table-form__dimensions-row .ck-table-form__dimension-operator {
	margin: 0 var(--ck-spacing-small, var(--ck-spacing-sm));
}

.ck.ck-table-form .ck-form__row.ck-table-form__background-row {
	width: auto;
	min-width: 0;
	max-width: none;
}

.ck.ck-table-cell-properties-form .ck-form__row.ck-table-form__cell-type-row {
	--ck-table-form-cell-type-width: calc(var(--ck-table-form-default-input-width) * 2 + var(--ck-spacing-large, var(--ck-spacing-lg)));

	width: var(--ck-table-form-cell-type-width);
	min-width: var(--ck-table-form-cell-type-width);
	max-width: var(--ck-table-form-cell-type-width);
}

.ck.ck-table-cell-properties-form .ck-form__row.ck-table-cell-properties-form__padding-row {
	width: 25%;
	min-width: 0;
	max-width: none;
}

.ck.ck-table-cell-properties-form .ck-form__row.ck-table-cell-properties-form__alignment-row .ck.ck-toolbar.ck-table-cell-properties-form__horizontal-alignment-toolbar {
	--ck-table-cell-properties-horizontal-alignment-width: calc(var(--ck-table-form-default-input-width) * 2 + var(--ck-spacing-large, var(--ck-spacing-lg)));

	width: var(--ck-table-cell-properties-horizontal-alignment-width);
	min-width: var(--ck-table-cell-properties-horizontal-alignment-width);
	max-width: var(--ck-table-cell-properties-horizontal-alignment-width);
}

/* ============================== ckeditor5-word-count ============================== */
:root,
:host {
	--ck-word-count-font-size: inherit;
}
```

</details>

<details>
<summary><b>Legacy theme preset &ndash; commercial features</b> (optional; append after the UI core above)</summary>

```css
/*
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/* ============================== ckeditor5-ai ============================== */
:root,
:host {
	--ck-ai-accent-700-color: var(--ck-color-base-active);
	--ck-ai-accent-800-color: var(--ck-color-base-active-focus);
	--ck-ai-tile-active-border-color: hsla(from var(--ck-ai-accent-700-color) h s l / var(--ck-ai-alpha-5));
	--ck-ai-tile-active-shadow-color: hsla(from var(--ck-ai-accent-700-color) h s l / 0.15);
	--ck-ai-chat-content-link-color: var(--ck-ai-accent-700-color);
	--ck-ai-suggestion-content-part-toolbar-button-active-text-color: var(--ck-ai-accent-700-color);
	--ck-ai-suggestion-content-part-toolbar-button-hover-text-color: var(--ck-ai-accent-700-color);

	--ck-ai-border-radius: calc(var(--ck-border-radius, var(--ck-radius-base)) * 2);
	--ck-ai-actions-toolbar-button-default-hover-background-color: var(--ck-ai-neutral-100-color);
	--ck-ai-quick-actions-button-text-color: var(--ck-ai-accent-700-color);
	--ck-ai-quick-actions-button-hover-background-color: var(--ck-ai-accent-50-color);
	--ck-ai-quick-actions-list-max-height: 300px;
	--ck-ai-chat-context-chip-padding: var(--ck-spacing-small, var(--ck-spacing-sm)) var(--ck-spacing-medium-small, var(--ck-spacing-ms));
	--ck-ai-chat-context-chip-label-font-size: 0.9em;
	--ck-ai-chat-context-chip-icon-font-size: 1em;
	--ck-ai-chat-prompt-input-font-size: 1em;
	--ck-ai-chat-prompt-input-line-height: 1.4em;
	--ck-ai-chat-prompt-input-padding-vertical: 5px;
	--ck-ai-chat-prompt-input-padding-inline-start: var(--ck-spacing-control-padding-inline-compact);
	--ck-ai-chat-prompt-input-padding-inline-end: 2.6em;
	--ck-ai-chat-content-font-size: 13px;
	--ck-ai-chat-content-line-height: 1.385;
	--ck-ai-disclaimer-font-size: 0.75em;
	--ck-ai-chat-controls-button-min-height: 1.88em;
	--ck-ai-chat-prompt-submit-button-font-size: 1em;
	--ck-ai-chat-model-selection-panel-max-width: 426px;
	--ck-ai-chat-model-selection-item-name-font-size: inherit;
	--ck-ai-chat-model-selection-item-description-font-size: inherit;
	--ck-ai-chat-model-selection-item-capability-icon-size: inherit;
	--ck-ai-chat-history-section-title-font-size: 0.85em;
	--ck-ai-chat-history-section-title-padding: 0.48em 0.9em 0 0.9em;
	--ck-ai-chat-history-item-title-font-size: var(--ck-font-size-base);
	--ck-ai-chat-history-item-date-font-size: inherit;
	--ck-ai-chat-loader-text-font-size: inherit;
	--ck-ai-chat-loader-text-font-weight: 500;
	--ck-ai-chat-loader-text-font-color: inherit;
	--ck-ai-dots-loader-background-color: var(--ck-color-base-foreground);
	--ck-ai-dots-loader-dot-color: var(--ck-color-border-control);
	--ck-ai-dots-loader-dot-active-color: var(--ck-color-text-secondary);
	--ck-ai-chat-suggestion-container-header-font-size: .9em;
	--ck-ai-suggestion-content-part-radius: var(--ck-radius-base);
	--ck-ai-suggestion-content-part-title-label-font-size: var(--ck-font-size-md);
	--ck-ai-suggestion-content-part-title-color: var(--ck-ai-neutral-600-color);
	--ck-ai-suggestion-content-part-accent-color: var(--ck-ai-accent-700-color);
	--ck-ai-suggestion-content-part-active-border-color: hsla(from var(--ck-ai-accent-700-color) h s l / var(--ck-ai-alpha-5));
	--ck-ai-suggestion-content-part-hover-shadow-color: var(--ck-ai-shadow-color);
	--ck-ai-button-stop-generating-font-size: inherit;
	--ck-ai-review-check-list-item-title-text-font-size: var(--ck-font-size-base);
	--ck-ai-review-check-list-item-description-font-size: inherit;
	--ck-ai-review-check-list-item-radius: var(--ck-radius-base);
	--ck-ai-review-check-list-item-padding: var(--ck-spacing-large, var(--ck-spacing-lg));
	--ck-ai-review-check-list-item-active-shadow: 0 0 3px 1.5px var(--ck-color-ai-accent-400, var(--ck-ai-tile-active-shadow-color));
	--ck-ai-translate-check-list-header-font-size: inherit;
	--ck-ai-translate-check-list-header-title-font-size: 1.153em;
	--ck-ai-review-navigation-panel-inset: var(--ck-spacing-lg);
	--ck-ai-review-navigation-panel-header-background: var(--ck-color-base-foreground);
}

.ck.ck-ai-disclaimer {
	background-color: var(--ck-ai-neutral-50-color);
}

.ck.ck-ai-chat > .ck-ai-disclaimer {
	border-top: var(--ck-border-width-divider) solid var(--ck-ai-disclaimer-border-color);
	margin-block-start: 0;
}

.ck.ck-ai-chat > .ck-ai-disclaimer::before {
	display: none;
}

.ck-ai-chat-controls-button > .ck-icon {
	--ck-icon-size: 16px;
}

:is(.ck.ck-balloon-panel, .ck.ck-ai-chat) .ck-ai-chat-context-chip {
	min-height: 0;
}

:is(.ck.ck-balloon-panel, .ck.ck-ai-chat) .ck-ai-chat-context-chip > .ck-ai-chat-context-chip__label {
	line-height: 1.25;
}

/* ============================== ckeditor5-collaboration-core ============================== */
:root,
:host {
	/* Annotations. */
	--ck-annotation-icon-color: var(--ck-color-annotation-icon, hsl(0 0% 50%));
	--ck-annotation-info-color: var(--ck-color-annotation-info, hsl(0 0% 46%));
	--ck-annotation-info-name-color: var(--ck-annotation-info-color);
	--ck-annotation-info-time-color: var(--ck-annotation-info-color);
	--ck-annotation-button-size: 0.85em;
	--ck-annotation-dropdown-button-size: 0.85em;
	--ck-annotation-wrapper-background-color: var(--ck-color-annotation-wrapper-background, hsl(0 0% 100%));
	--ck-annotation-wrapper-shadow: var(--ck-color-annotation-wrapper-drop-shadow, 0 1px 1px 1px hsl(0 0% 90%));
	--ck-annotation-counter-icon-size: 16px;
	--ck-annotation-counter-number-size: 10px;
	--ck-annotation-counter-comment-color: var(--ck-color-annotation-counter-comment, hsl(55 98% 48%));
	--ck-annotation-counter-suggestion-insertion-color: var(--ck-color-annotation-counter-suggestion-insertion, hsl(128 62% 60%));
	--ck-annotation-counter-suggestion-deletion-color: var(--ck-color-annotation-counter-suggestion-deletion, hsl(345 62% 60%));
	--ck-annotation-counter-suggestion-format-color: var(--ck-color-annotation-counter-suggestion-format, hsl(191 62% 60%));
	--ck-inline-annotation-container-width: 300px;
	--ck-inline-annotation-container-max-height: 400px;
	--ck-annotation-padding: var(--ck-spacing-standard, var(--ck-spacing-base)) var(--ck-spacing-standard, var(--ck-spacing-base)); /* old: var(--ck-spacing-standard) = 0.6em */
	--ck-annotation-main-border-radius: var(--ck-border-radius-surface);
	--ck-annotation-button-border-radius: var(--ck-border-radius-control);
	--ck-annotation-wrapper-border-radius: var(--ck-border-radius-surface);
	--ck-annotation-content-wrapper-padding-inline-end: 0;

	/* Users. */
	--ck-user-avatar-size: 40px;
	--ck-user-avatar-background-color: var(--ck-user-avatar-background, hsl(210 52% 44%));
	--ck-user-me-avatar-background-color: var(--ck-user-avatar-me-background, hsl(294 93% 35%));
	--ck-user-avatar-text-color: var(--ck-user-avatar-color, hsl(0 0% 100%));
	--ck-user-me-border-color: hsl(0 0% 100%);
	--ck-user-name-font-size: var(--ck-font-size-base);
	--ck-presence-list-dropdown-background-color: hsl(0 0% 100%);
	--ck-presence-list-dropdown-border-color: hsl(0 0% 92%);
	--ck-presence-list-hover-background-color: transparent;
	--ck-presence-list-dropdown-list-min-width: 180px;
	--ck-presence-list-padding: 1px 1px 1px 2px;
	--ck-presence-list-border-radius: var(--ck-rounded-corners-radius, var(--ck-radius-corners));
	--ck-presence-list-list-item-padding: 1px;
	--ck-presence-list-marker-length: 100%;
	--ck-presence-list-marker-thickness: 3px;
	--ck-presence-list-marker-gap: 5px;
	--ck-presence-list-marker-border-radius: 4px;
	--ck-presence-list-dropdown-avatar-size: var(--ck-user-avatar-size);
	--ck-presence-list-dropdown-list-item-padding: var(--ck-spacing-standard, var(--ck-spacing-base));
	--ck-presence-list-dropdown-list-item-gap: var(--ck-spacing-standard, var(--ck-spacing-base));
	--ck-presence-list-dropdown-list-item-border-radius: 0;
	--ck-presence-list-dropdown-user-name-font-size: inherit;
	--ck-presence-list-focus-border-radius: var(--ck-rounded-corners-radius, var(--ck-radius-corners));
}

/* Presence list. */
.ck.ck-presence-list__list-item {
	margin-left: var(--ck-spacing-medium, var(--ck-spacing-base));

	& .ck-user {
		margin: 2px;
	}
}

.ck.ck-presence-list--collapsed .ck.ck-presence-list__list-item {
	& .ck-user {
		margin-inline: 0;
	}

	& .ck.ck-presence-list__users-counter {
		margin-inline: 2px;
	}
}

.ck.ck-presence-list__users-counter {
	margin-top: 4px;
}

.ck.ck-presence-list__balloon {
	border: 0;

	& .ck.ck-presence-list__dropdown-list-item {
		margin: 0;
		padding: var(--ck-presence-list-dropdown-list-item-padding);

		& .ck-user {
			margin: 2px;
		}
	}

	& .ck.ck-presence-list__dropdown-list .ck.ck-presence-list__marker {
		position: absolute;
		left: 0;
		height: 100%;
	}
}

.ck .ck-annotation__actions {
	transition: opacity var(--ck-transition-duration-control) ease;
	opacity: 0.5;

	gap: 0;

	@media (prefers-reduced-motion: reduce) {
		transition: none;
	}
}

/* ============================== ckeditor5-comments ============================== */
:root,
:host {
	/* Comments. */
	--ck-comment-background-color: var(--ck-color-comment-background, hsl(210 52% 97%));
	--ck-comment-input-background-color: var(--ck-color-comment-input-background, var(--ck-comment-background-color));
	--ck-comment-remove-background-color: var(--ck-color-comment-remove-background, var(--ck-color-light-red));
	--ck-comment-separator-color: var(--ck-color-comment-separator, hsl(210 52% 87%));
	--ck-comment-count-color: var(--ck-color-comment-count, hsl(210 52% 57%));
	--ck-comment-box-border-color: var(--ck-color-comment-box-border, hsl(55 98% 48%));
	--ck-comment-marker-color: var(--ck-color-comment-marker, hsl(55 98% 83%));
	--ck-comment-marker-active-color: var(--ck-color-comment-marker-active, hsl(55 98% 68%));
	--ck-comment-content-font-family: var(--ck-font-face, var(--ck-font-family));
	--ck-comment-content-font-size: var(--ck-font-size-base);
	--ck-comment-content-font-color: var(--ck-color-base-text);
	--ck-comment-thread-line-size: 4px;
	--ck-comment-border-radius: var(--ck-border-radius-surface);
	--ck-comment-input-padding: var(--ck-spacing-control-padding-inline); /* old: .ck-comment__input-container padding: var(--ck-spacing-standard) = 0.6em all sides */
	--ck-comments-archive-width: 400px;
	--ck-comments-archive-info-font-size: var(--ck-font-size-base);

	/* Comment threads. */
	--ck-comment-thread-background-color: transparent;
	--ck-comment-thread-comments-background-color: var(--ck-color-surface-container);
	--ck-thread-header-background-color: var(--ck-color-thread-header-background, hsl(54 88% 93%));
	--ck-thread-header-active-background-color: var(--ck-color-thread-header-active-background, hsl(52 100% 83%));
	--ck-thread-header-button-hover-background: var(--ck-color-interactive-hover-surface);
	--ck-thread-remove-background-color: var(--ck-color-thread-remove-background, var(--ck-comment-remove-background-color));
	--ck-thread-unlinked-background-color: var(--ck-color-unlinked-background, hsl(0 0% 96%));
	--ck-thread-unlinked-active-background-color: var(--ck-color-unlinked-active-background, hsl(0 0% 92%));
	--ck-thread-header-padding: var(--ck-spacing-standard, var(--ck-spacing-base)); /* old: var(--ck-spacing-standard) = 0.6em */
	--ck-thread-border-radius: var(--ck-radius-corners, var(--ck-border-radius-surface));
	--ck-thread-comments-border-radius: var(--ck-border-radius-surface);
	--ck-thread-input-border-radius: var(--ck-border-radius-control);
}

.ck.ck-annotation-wrapper--active,
.ck.ck-annotation-wrapper:hover {
	& .ck-annotation__actions .ck-comment--resolve {
		color: var(--ck-button-save-color);
	}

	& .ck-suggestion--accept:not(.ck-disabled) {
		color: var(--ck-button-save-color);
	}

	& .ck-suggestion--discard:not(.ck-disabled) {
		color: var(--ck-button-cancel-color);
	}
}

.ck .ck-comment__input-container {
	background: var(--ck-comment-input-background-color);
}

/* ============================== ckeditor5-pagination ============================== */
:root,
:host {
	--ck-pagination-divider-color: hsl(0 0% 67%);
	--ck-pagination-label-background-color: hsl(0 0% 77%);
	--ck-pagination-label-padding: var(--ck-spacing-xs) var(--ck-spacing-base);
	--ck-pagination-label-border-radius: 0;
	--ck-page-navigator-font-size: inherit;
}

/* ============================== ckeditor5-revision-history ============================== */
:root,
:host {
	--ck-revision-history-revision-background-color: var(--ck-color-base-background);
	--ck-revision-history-revision-border-color: hsl(213deg 20% 35%);
	--ck-revision-history-revision-padding: var(--ck-revision-history-revision-padding-block) var(--ck-revision-history-revision-padding-inline);
	--ck-revision-history-revision-padding-block: var(--ck-spacing-large, var(--ck-spacing-lg));
	--ck-revision-history-revision-padding-inline: calc(2 * var(--ck-spacing-standard, var(--ck-spacing-base)));
	--ck-revision-history-revision-selected-border-color: transparent;
	--ck-revision-history-revision-highlighted-border-color: transparent;
	--ck-revision-history-revision-author-text-color: inherit;
	--ck-revision-history-revision-date-text-color: inherit;
	--ck-revision-history-revision-radius: var(--ck-border-radius-surface);
	--ck-revision-history-revision-active-radius: 0 var(--ck-border-radius-surface) var(--ck-border-radius-surface) 0;
	--ck-revision-history-revision-shadow: var(--ck-revision-history-revision-box-shadow, 0);
	--ck-revision-history-revision-transition: var(
		--ck-revision-history-revision-transitions,
		background var(--ck-duration-fast) ease-in, border var(--ck-duration-fast) ease-in
	);
	--ck-revision-history-revision-author-icon-offset: 20px;
	--ck-revision-history-revision-selected-text-color: var(--ck-color-base-background);
	--ck-revision-history-revision-selected-input-text-color: var(--ck-revision-history-revision-selected-text-color);
	--ck-revision-history-revision-selected-input-empty-text-color: var(--ck-revision-history-revision-selected-input-text-color-empty, var(--ck-color-base-background));
	--ck-revision-history-revision-selected-author-text-color: var(--ck-revision-history-revision-selected-text-color);
	--ck-revision-history-revision-author-font-size: var(--ck-font-size-normal, var(--ck-font-size-md));
	--ck-revision-history-changes-navigation-font-size: inherit;
	--ck-revision-history-revision-selected-date-text-color: var(--ck-revision-history-revision-selected-text-color);
	--ck-revision-history-revision-selected-background-color: var(--ck-color-base-active);
	--ck-revision-history-revision-highlighted-background-color: hsl(208deg 100% 94%);
	--ck-revision-history-revision-highlighted-hover-background-color: var(--ck-revision-history-revision-highlighted-background-color-hover, hsl(208deg 100% 90%));
	--ck-revision-history-revision-delete-confirmation-background-color: var(--ck-revision-history-revision-delete-confirmation-background, hsl(0deg 100% 90%));
	--ck-revision-history-revision-delete-confirmation-active-button-background-color: var(--ck-revision-history-revision-delete-confirmation-active-button-background, hsl(0deg 100% 85%));
	--ck-revision-history-sidebar-period-background-color: var(--ck-revision-history-sidebar-period-background, hsl(14deg 100% 57%));
	--ck-revision-history-sidebar-timeline-padding: var(--ck-spacing-padding-comfortable);
	--ck-revision-history-sidebar-revision-vertical-spacing: calc(2 * var(--ck-spacing-standard, var(--ck-spacing-base)));
	--ck-revision-history-loading-overlay-visible-background-color: var(--ck-revision-history-loading-overlay-visible-background, hsl(0 0% 100% / 1));
	--ck-revision-history-loading-overlay-spinner-size: 60px;
	--ck-revision-history-loading-overlay-spinner-rotation-duration: 1s;
	--ck-revision-history-loading-overlay-transition-duration: var(--ck-duration-base);
	--ck-revision-history-loading-overlay-transition-delay: 0s;
}

.ck.ck-button.ck-revision-history-ui__back-to-editing {
	background: var(--ck-color-base-active);

	&:hover:not(.ck-disabled) {
		background: var(--ck-color-base-active-focus);
	}
}

/* ============================== ckeditor5-slash-command ============================== */
:root,
:host {
	--ck-slash-command-button-width: 250px;
	--ck-slash-command-description-width: 200px;
	--ck-slash-command-button-radius: var(--ck-list-dropdown-button-border-radius, 0);
}

.ck.ck-mentions > .ck-list__item.ck-mentions__item_focused > .ck-button .ck-slash-command-button__description {
	color: var(--ck-list-button-on-text-color);
}

/* ============================== ckeditor5-source-editing-enhanced ============================== */
:root,
:host {
	--ck-source-editing-enhanced-height: calc(
		var(--ck-dialog-max-height)            /* ─▶   Total max height of the dialog     */
		- var(--ck-form-header-height)         /* ─▶   Height of the dialog header        */
		- 2 * var(--ck-spacing-large, var(--ck-spacing-lg))          /* ─┐                                       */
		- var(--ck-ui-component-min-height, var(--ck-size-min-height))    /*  ├─▶ Height of the dialog actions bar   */
		- 2 * var(--ck-spacing-tiny, var(--ck-spacing-xs))           /* ─┘                                       */
		- 2 * var(--ck-dialog-content-padding)           /* ─▶   Padding of the dialog content           */
	);
	--ck-source-editing-enhanced-width: min(80vw, 1200px);
	--ck-source-editing-enhanced-font-size: var(--ck-font-size-base);
	--ck-source-editing-area-font-size: var(--ck-font-size-normal, var(--ck-font-size-base));
	--ck-source-editing-area-border-radius: var(--ck-rounded-corners-radius, var(--ck-radius-corners));
}

.ck.ck-code-editor {
	padding: 0;
}

.ck.ck-code-editor .cm-editor.cm-focused {
	outline: var(--ck-focus-ring);
	border-color: var(--ck-color-border-control);
	box-shadow: none;
}

/* ============================== ckeditor5-template ============================== */
:root,
:host {
	--ck-template-dropdown-view-width: 345px;
	--ck-template-dropdown-view-height: 300px;
	--ck-template-icon-size: 45px;
	--ck-template-list-border-radius: 0;
	--ck-template-list-padding: var(--ck-spacing-large, var(--ck-spacing-lg));
	--ck-template-list-gap: var(--ck-spacing-large, var(--ck-spacing-lg));
	--ck-template-search-field-padding: var(--ck-spacing-padding-comfortable);
	--ck-template-list-item-title-font-size: var(--ck-font-size-base);
}

/* ============================== ckeditor5-track-changes ============================== */
:root,
:host {
	--ck-track-changes-preview-margin: 0;
	--ck-track-changes-preview-padding: var(--ck-spacing-padding-comfortable);
	--ck-track-changes-preview-border: 0;
	--ck-track-changes-preview-border-radius: 0;

	/* Suggestions. */
	--ck-annotation-type-border-width: 3px;
	--ck-suggestion-box-insertion-border-color: var(--ck-color-suggestion-box-insertion-border, hsl(128 62% 60%));
	--ck-suggestion-box-deletion-border-color: var(--ck-color-suggestion-box-deletion-border, hsl(345 62% 60%));
	--ck-suggestion-box-format-border-color: var(--ck-color-suggestion-box-format-border, hsl(191 62% 60%));
	--ck-suggestion-ai-accent-color: var(--ck-color-suggestion-ai-accent, hsl(263 59% 52%));
	--ck-suggestion-ai-accent-background-color: var(--ck-color-suggestion-ai-accent-background, hsl(262 100% 96%));
	--ck-suggestion-ai-author-icon-size: 18px;
	--ck-suggestion-wrapper-border-radius: var(--ck-rounded-corners-radius, var(--ck-radius-corners));
	--ck-suggestion-marker-insertion-border-color: var(--ck-color-suggestion-marker-insertion-border, hsl(128 71% 40% / .35));
	--ck-suggestion-marker-insertion-active-border-color: var(--ck-color-suggestion-marker-insertion-border-active, hsl(128 71% 25% / .5));
	--ck-suggestion-marker-insertion-background-color: var(--ck-color-suggestion-marker-insertion-background, hsl(128 71% 65% / .35));
	--ck-suggestion-marker-insertion-active-background-color: var(--ck-color-suggestion-marker-insertion-background-active, hsl(128 71% 50% / .5));
	--ck-suggestion-marker-deletion-border-color: var(--ck-color-suggestion-marker-deletion-border, hsl(345 71% 40% / .35));
	--ck-suggestion-marker-deletion-active-border-color: var(--ck-color-suggestion-marker-deletion-border-active, hsl(345 71% 25% / .5));
	--ck-suggestion-marker-deletion-background-color: var(--ck-color-suggestion-marker-deletion-background, hsl(345 71% 65% / .35));
	--ck-suggestion-marker-deletion-active-background-color: var(--ck-color-suggestion-marker-deletion-background-active, hsl(345 71% 50% / .5));
	--ck-suggestion-marker-deletion-stroke-color: var(--ck-color-suggestion-marker-deletion-stroke, hsl(345 71% 20% / .5));
	--ck-suggestion-marker-format-border-color: var(--ck-color-suggestion-marker-format-border, hsl(191 60% 75% / 1));
	--ck-suggestion-marker-format-active-border-color: var(--ck-color-suggestion-marker-format-border-active, hsl(191 60% 60% / 1));
	--ck-suggestion-widget-insertion-background-color: var(--ck-color-suggestion-widget-insertion-background, hsl(128 71% 65% / .05));
	--ck-suggestion-widget-insertion-active-background-color: var(--ck-color-suggestion-widget-insertion-background-active, hsl(128 71% 50% / .07));
	--ck-suggestion-widget-deletion-background-color: var(--ck-color-suggestion-widget-deletion-background, hsl(345 71% 65% / .05));
	--ck-suggestion-widget-deletion-active-background-color: var(--ck-color-suggestion-widget-deletion-background-active, hsl(345 71% 45% / .07));
	--ck-suggestion-widget-format-background-color: var(--ck-color-suggestion-widget-format-background, hsl(191 90% 40% / .09));
	--ck-suggestion-widget-format-active-background-color: var(--ck-color-suggestion-widget-format-background-active, hsl(191 90% 40% / .16));
}

.ck.ck-ai-tabs,
.ck-ai_review-navigation-panel .ck-ai_review-navigation-panel__header,
.ck-ai_review-navigation-panel .ck-ai_review-navigation-panel__body {
	--ck-font-size-md: 1em;
	--ck-font-size-sm: 0.95em;
	--ck-button-small-font-size: 0.95em;
}

.ck-ai-header > .ck-icon {
	--ck-icon-font-size: .833335em;
	--ck-icon-size: calc(var(--ck-line-height-base) * 1em);
}

.ck-suggestion__actions .ck.ck-button.ck-button_small,
.ck-annotation__actions .ck.ck-button.ck-button_small {
	--ck-icon-size: calc(var(--ck-line-height-base) * 1em);
}
```

</details>

### Keep your custom design on top of the preset

Layer your customization on top of the preset. Two patterns, which compose:

```html
<link rel="stylesheet" href=".../ckeditor5.css">						<!-- editor -->
<link rel="stylesheet" href=".../ckeditor5-legacy-theme-preset.css">	<!-- old base -->
<link rel="stylesheet" href="my-brand.css">								<!-- your overrides, last -->
```

```css
/* my-brand.css */

/* 1) Raw selector / higher specificity - wins by the cascade over the preset's token-driven styles. */
.ck.ck-toolbar { background: var(--my-brand); border-radius: 0; }

/* 2) Overriding old token names - wins through the bridges (loaded after the preset). */
:root { --ck-color-button-on-background: #0a84ff; }
```

## Your existing custom styles

Whatever you used to customize the editor &ndash; raw `.ck-*` selectors, token overrides, higher-specificity rules, or a mix &ndash; it keeps working. But applying is not the same as fitting: the new theme ships different default values (colors, spacing, radius). Overrides whose values were chosen to harmonize with the old defaults still take effect, but may no longer match the surrounding new values &ndash; e.g. a border color picked to contrast the old toolbar background now sits next to a different one, so the contrast you tuned for is off.

The recommended approach has two steps:

1. **First, see the editor on the new theme with no changes.** The refreshed defaults may already do what some of your overrides did &ndash; you may be able to drop a few.
2. **To keep your look, start from the old baseline:** load the legacy theme preset, then your custom CSS on top &ndash; see [Keep your custom design on top of the preset](#keep-your-custom-design-on-top-of-the-preset).

Your customizations resolve this way: raw selectors win by the cascade (markup and class names are unchanged, so they still match), token overrides win through the bridges ([The two compatibility mechanisms](#the-two-compatibility-mechanisms)), and a mix composes by those rules &ndash; for same-specificity token overrides, load your CSS after the editor CSS. (`!important` also forces an override regardless of load order, but reach for it only when you cannot control the order &ndash; it is harder to override afterwards and tends to escalate.)

```css
/* A typical mixed stylesheet - all of this still applies. */
.ck.ck-toolbar { border-bottom: 2px solid var(--brand); }	/* raw selector → cascade */
:root { --ck-color-button-on-background: var(--brand); }	/* old token → bridge */
```

## Shadow DOM

Every token is now declared on `:root, :host`, so the theme resolves inside a shadow root. If your editor is mounted in a shadow root, a `:root` override has no effect on it. The tokens still inherit into the shadow root, but the editor declares them again on `:host`, and that declaration wins. Override the tokens on the shadow host element instead, for example with a class that you put on it. A rule in the main document that matches the host is enough:

```css
/* Light DOM */  :root                  { --ck-color-toolbar-background: #1e1e1e; }
/* Shadow DOM */ .my-editor-shadow-host { --ck-color-toolbar-background: #1e1e1e; }
```

See {@link getting-started/setup/shadow-dom#overriding-css-variables Overriding CSS variables} in the Shadow DOM guide for details.

## Published content

The refreshed theme also changed a few content colors &ndash; block quotes, code blocks, horizontal lines, and comment/suggestion markers. Because `.ck-content` styles apply to already-published documents, your existing content now renders with the new colors.

If you want the previous content appearance, add the snippets below. Each one re-sets a property back to its old value.

If you already use the legacy theme preset, these same content rollbacks are included in it ([Keeping the old look](#keeping-the-old-look)) &ndash; it carries `.ck-content` rules, not just editor-UI tokens. In that case your content is already restored and you can skip the snippets below. Use them standalone when you render published `.ck-content` without the editor (so you do not pull in the whole editor theme).

<info-box warning>
	Load order &ndash; add these after the editor's content styles (`ckeditor5-content.css`, plus `ckeditor5-premium-features-content.css` for the markers). They have the same specificity as the editor's own rules, so the last one loaded wins; placed before the editor styles they have no effect.
</info-box>

* **Block quotes** &ndash; restore the previous values:

	```css
	.ck-content blockquote { border-left: solid 5px hsl(0, 0%, 80%); }
	.ck-content[dir="rtl"] blockquote { border-right: solid 5px hsl(0, 0%, 80%); }
	```

* **Code blocks** &ndash; restore the previous value:

	```css
	.ck-content pre { background: hsla(0, 0%, 78%, 0.3); border: 1px solid hsl(0, 0%, 77%); }
	```

* **Horizontal line** &ndash; restore the previous value:

	```css
	.ck-content hr { background: hsl(0, 0%, 87%); }
	```

* **Comment & suggestion markers** (track changes / comments) &ndash; restore the previous values. The format and widget markers kept their colors, so they need no rollback:

	```css
	:root,
	:host {
		--ck-comment-marker-color: var(--ck-color-comment-marker, hsl(55 98% 83%));
		--ck-comment-marker-active-color: var(--ck-color-comment-marker-active, hsl(55 98% 68%));

		--ck-suggestion-marker-insertion-border-color: var(--ck-color-suggestion-marker-insertion-border, hsl(128 71% 40% / .35));
		--ck-suggestion-marker-insertion-active-border-color: var(--ck-color-suggestion-marker-insertion-border-active, hsl(128 71% 25% / .5));
		--ck-suggestion-marker-insertion-background-color: var(--ck-color-suggestion-marker-insertion-background, hsl(128 71% 65% / .35));
		--ck-suggestion-marker-insertion-active-background-color: var(--ck-color-suggestion-marker-insertion-background-active, hsl(128 71% 50% / .5));

		--ck-suggestion-marker-deletion-border-color: var(--ck-color-suggestion-marker-deletion-border, hsl(345 71% 40% / .35));
		--ck-suggestion-marker-deletion-active-border-color: var(--ck-color-suggestion-marker-deletion-border-active, hsl(345 71% 25% / .5));
		--ck-suggestion-marker-deletion-background-color: var(--ck-color-suggestion-marker-deletion-background, hsl(345 71% 65% / .35));
		--ck-suggestion-marker-deletion-active-background-color: var(--ck-color-suggestion-marker-deletion-background-active, hsl(345 71% 50% / .5));
		--ck-suggestion-marker-deletion-stroke-color: var(--ck-color-suggestion-marker-deletion-stroke, hsl(345 71% 20% / .5));
	}
	```

	Each value keeps the legacy name as the first choice, so a legacy marker override you already have still wins. See {@link features/track-changes#markers-styling Markers styling} for the full list of suggestion marker properties.

## Token name reference

This section maps each legacy name to its new name. You rarely need it, because overriding old names keeps working ([Overriding old token names](#overriding-old-token-names)). It matters when you want to adopt the new names or to read a token in your own CSS. The foundation tokens are listed in full below, and the color tokens follow one pattern (see [Component colors](#component-colors)).

Reading an old name works with the [opt-in aliases snippet](#reading-old-token-names), except for the override-only names listed in [Override-only tokens](#override-only-tokens). Reading those resolves to nothing, so read the new name instead. The old z-index names keep their read aliases in the default theme, so they need no snippet (see [Z-index layers](#z-index-layers)).

### Foundation

| Old                                                                  | New                                                          |
|----------------------------------------------------------------------|--------------------------------------------------------------|
| `--ck-spacing-extra-tiny`                                            | `--ck-spacing-2xs`                                           |
| `--ck-spacing-tiny`                                                  | `--ck-spacing-xs`                                            |
| `--ck-spacing-small`                                                 | `--ck-spacing-sm`                                            |
| `--ck-spacing-medium-small`                                          | `--ck-spacing-md`                                            |
| `--ck-spacing-medium`                                                | `--ck-spacing-base`                                          |
| `--ck-spacing-standard`                                              | `--ck-spacing-base`                                          |
| `--ck-spacing-large`                                                 | `--ck-spacing-lg`                                            |
| `--ck-spacing-extra-large`                                           | `--ck-spacing-xl`                                            |
| `--ck-font-size-tiny` / `-small` / `-normal` / `-big` / `-large`     | `--ck-font-size-xs` / `-sm` / `-base` / `-xl` / `-2xl`       |
| `--ck-font-face`                                                     | `--ck-font-family`                                           |
| `--ck-border-radius`                                                 | `--ck-radius-base`                                           |
| `--ck-drop-shadow` / `-active`                                       | `--ck-shadow-md` / `-lg`                                     |
| `--ck-inner-shadow`                                                  | `--ck-inset-shadow-sm`                                       |
| `--ck-focus-outer-shadow` (+ `-geometry` / `-disabled-` / `-error-`) | `--ck-focus-shadow` (+ `-geometry` / `-disabled` / `-error`) |
| `--ck-disabled-opacity`                                              | `--ck-opacity-disabled`                                      |
| `--ck-ui-component-min-height`                                       | `--ck-size-min-height`                                       |
| `--ck-z-default` / `-panel` / `-dialog`                              | `--ck-z-base` / `-overlay` / `-modal`                        |

To scale all editor spacing at once, override `--ck-spacing-unit`. It is still the anchor of the spacing scale, both in the refreshed theme and in the legacy theme preset.

### Component colors

Color tokens moved from `--ck-color-{component}-{…}` to component-first `--ck-{component}-{…}-color`, e.g.:

```text
--ck-color-button-default-background	→	--ck-button-default-background-color
--ck-color-button-on-color				→	--ck-button-on-text-color
--ck-color-dialog-background			→	--ck-dialog-background-color
```

41 such mappings follow that mechanical pattern.

<details>
<summary>Full list &ndash; all 41 component color renames</summary>

| Old                                             | New                                             |
|-------------------------------------------------|-------------------------------------------------|
| `--ck-color-button-default-background`          | `--ck-button-default-background-color`          |
| `--ck-color-button-default-hover-background`    | `--ck-button-default-hover-background-color`    |
| `--ck-color-button-default-active-background`   | `--ck-button-default-active-background-color`   |
| `--ck-color-button-default-disabled-background` | `--ck-button-default-disabled-background-color` |
| `--ck-color-button-on-background`               | `--ck-button-on-background-color`               |
| `--ck-color-button-on-hover-background`         | `--ck-button-on-hover-background-color`         |
| `--ck-color-button-on-active-background`        | `--ck-button-on-active-background-color`        |
| `--ck-color-button-on-disabled-background`      | `--ck-button-on-disabled-background-color`      |
| `--ck-color-button-on-color`                    | `--ck-button-on-text-color`                     |
| `--ck-color-button-action-background`           | `--ck-button-action-background-color`           |
| `--ck-color-button-action-hover-background`     | `--ck-button-action-hover-background-color`     |
| `--ck-color-button-action-active-background`    | `--ck-button-action-active-background-color`    |
| `--ck-color-button-action-disabled-background`  | `--ck-button-action-disabled-background-color`  |
| `--ck-color-button-action-text`                 | `--ck-button-action-text-color`                 |
| `--ck-color-button-save`                        | `--ck-button-save-color`                        |
| `--ck-color-button-cancel`                      | `--ck-button-cancel-color`                      |
| `--ck-color-switch-button-off-background`       | `--ck-switch-button-off-background-color`       |
| `--ck-color-switch-button-off-hover-background` | `--ck-switch-button-off-hover-background-color` |
| `--ck-color-switch-button-on-background`        | `--ck-switch-button-on-background-color`        |
| `--ck-color-switch-button-on-hover-background`  | `--ck-switch-button-on-hover-background-color`  |
| `--ck-color-switch-button-inner-background`     | `--ck-switch-button-inner-background-color`     |
| `--ck-color-dropdown-panel-background`          | `--ck-dropdown-panel-background-color`          |
| `--ck-color-dropdown-panel-border`              | `--ck-dropdown-panel-border-color`              |
| `--ck-color-dialog-background`                  | `--ck-dialog-background-color`                  |
| `--ck-color-input-background`                   | `--ck-input-background-color`                   |
| `--ck-color-input-border`                       | `--ck-input-border-color`                       |
| `--ck-color-input-error-border`                 | `--ck-input-error-border-color`                 |
| `--ck-color-input-text`                         | `--ck-input-text-color`                         |
| `--ck-color-input-disabled-background`          | `--ck-input-disabled-background-color`          |
| `--ck-color-input-disabled-border`              | `--ck-input-disabled-border-color`              |
| `--ck-color-input-disabled-text`                | `--ck-input-disabled-text-color`                |
| `--ck-color-list-background`                    | `--ck-list-background-color`                    |
| `--ck-color-list-button-hover-background`       | `--ck-list-button-hover-background-color`       |
| `--ck-color-list-button-on-background`          | `--ck-list-button-on-background-color`          |
| `--ck-color-list-button-on-text`                | `--ck-list-button-on-text-color`                |
| `--ck-color-panel-background`                   | `--ck-balloon-panel-background-color`           |
| `--ck-color-panel-border`                       | `--ck-balloon-panel-border-color`               |
| `--ck-color-toolbar-background`                 | `--ck-toolbar-background-color`                 |
| `--ck-color-toolbar-border`                     | `--ck-toolbar-border-color`                     |
| `--ck-color-tooltip-background`                 | `--ck-tooltip-background-color`                 |
| `--ck-color-tooltip-text`                       | `--ck-tooltip-text-color`                       |

</details>

### AI package (domain-first → component-first)

The AI package's color tokens were renamed the same way, from `--ck-color-ai-{…}` to component-first `--ck-ai-{…}-color`:

```text
--ck-color-ai-chat-text			→	--ck-ai-chat-text-color
--ck-color-ai-review-text		→	--ck-ai-review-text-color
--ck-color-ai-warning-border	→	--ck-ai-warning-border-color
```

142 such mappings follow that mechanical pattern.

<details>
<summary>Full list - AI package color token renames (142)</summary>

| Old | New |
|---|---|
| `--ck-color-ai-actions-search-result-highlight-text` | `--ck-ai-actions-search-result-highlight-text-color` |
| `--ck-color-ai-actions-toolbar-button-default-hover-background` | `--ck-ai-actions-toolbar-button-default-hover-background-color` |
| `--ck-color-ai-balloon-disclaimer-text` | `--ck-ai-balloon-disclaimer-text-color` |
| `--ck-color-ai-balloon-fake-selection-background` | `--ck-ai-balloon-fake-selection-background-color` |
| `--ck-color-ai-balloon-fake-selection-outline` | `--ck-ai-balloon-fake-selection-outline-color` |
| `--ck-color-ai-button-primary-background` | `--ck-ai-button-primary-background-color` |
| `--ck-color-ai-button-primary-background-active` | `--ck-ai-button-primary-active-background-color` |
| `--ck-color-ai-button-primary-background-hover` | `--ck-ai-button-primary-hover-background-color` |
| `--ck-color-ai-button-primary-text` | `--ck-ai-button-primary-text-color` |
| `--ck-color-ai-button-secondary-background` | `--ck-ai-button-secondary-background-color` |
| `--ck-color-ai-button-secondary-background-active` | `--ck-ai-button-secondary-active-background-color` |
| `--ck-color-ai-button-secondary-background-hover` | `--ck-ai-button-secondary-hover-background-color` |
| `--ck-color-ai-button-secondary-background-hover-active` | `--ck-ai-button-secondary-hover-active-background-color` |
| `--ck-color-ai-button-secondary-border` | `--ck-ai-button-secondary-border-color` |
| `--ck-color-ai-button-secondary-text` | `--ck-ai-button-secondary-text-color` |
| `--ck-color-ai-button-tertiary-background` | `--ck-ai-button-tertiary-background-color` |
| `--ck-color-ai-button-tertiary-background-active` | `--ck-ai-button-tertiary-active-background-color` |
| `--ck-color-ai-button-tertiary-background-hover` | `--ck-ai-button-tertiary-hover-background-color` |
| `--ck-color-ai-button-tertiary-background-hover-active` | `--ck-ai-button-tertiary-hover-active-background-color` |
| `--ck-color-ai-button-tertiary-text` | `--ck-ai-button-tertiary-text-color` |
| `--ck-color-ai-button-tertiary-text-active` | `--ck-ai-button-tertiary-active-text-color` |
| `--ck-color-ai-button-tertiary-text-hover` | `--ck-ai-button-tertiary-hover-text-color` |
| `--ck-color-ai-button-tertiary-text-hover-active` | `--ck-ai-button-tertiary-hover-active-text-color` |
| `--ck-color-ai-chat-border-main` | `--ck-ai-chat-main-border-color` |
| `--ck-color-ai-chat-content-blockquote-border` | `--ck-ai-chat-content-blockquote-border-color` |
| `--ck-color-ai-chat-content-code-background` | `--ck-ai-chat-content-code-background-color` |
| `--ck-color-ai-chat-content-hr-background` | `--ck-ai-chat-content-hr-background-color` |
| `--ck-color-ai-chat-content-link` | `--ck-ai-chat-content-link-color` |
| `--ck-color-ai-chat-content-link-selected-background` | `--ck-ai-chat-content-link-selected-background-color` |
| `--ck-color-ai-chat-content-pre-background` | `--ck-ai-chat-content-pre-background-color` |
| `--ck-color-ai-chat-content-pre-text` | `--ck-ai-chat-content-pre-text-color` |
| `--ck-color-ai-chat-content-table-border` | `--ck-ai-chat-content-table-border-color` |
| `--ck-color-ai-chat-content-table-th-background` | `--ck-ai-chat-content-table-th-background-color` |
| `--ck-color-ai-chat-content-text` | `--ck-ai-chat-content-text-color` |
| `--ck-color-ai-chat-context-balloon-resource-item-in-context` | `--ck-ai-chat-context-balloon-resource-item-in-context-color` |
| `--ck-color-ai-chat-feed-interaction-header-capabilities-text` | `--ck-ai-chat-feed-interaction-header-capabilities-text-color` |
| `--ck-color-ai-chat-feed-item-background` | `--ck-ai-chat-feed-item-background-color` |
| `--ck-color-ai-chat-feed-item-background-secondary` | `--ck-ai-chat-feed-item-secondary-background-color` |
| `--ck-color-ai-chat-feed-web-sources-header-icon` | `--ck-ai-chat-feed-web-sources-header-icon-color` |
| `--ck-color-ai-chat-feed-web-sources-header-text` | `--ck-ai-chat-feed-web-sources-header-text-color` |
| `--ck-color-ai-chat-flash` | `--ck-ai-chat-flash-color` |
| `--ck-color-ai-chat-flash-text` | `--ck-ai-chat-flash-text-color` |
| `--ck-color-ai-chat-icon` | `--ck-ai-chat-icon-color` |
| `--ck-color-ai-chat-model-unavailable-message-background` | `--ck-ai-chat-model-unavailable-message-background-color` |
| `--ck-color-ai-chat-model-unavailable-message-border` | `--ck-ai-chat-model-unavailable-message-border-color` |
| `--ck-color-ai-chat-primary-button-background` | `--ck-ai-chat-primary-button-background-color` |
| `--ck-color-ai-chat-primary-button-text` | `--ck-ai-chat-primary-button-text-color` |
| `--ck-color-ai-chat-prompt-input-animation-background` | `--ck-ai-chat-prompt-input-animation-background-color` |
| `--ck-color-ai-chat-shortcuts-shortcut-border` | `--ck-ai-chat-shortcuts-shortcut-border-color` |
| `--ck-color-ai-chat-shortcuts-shortcut-icon` | `--ck-ai-chat-shortcuts-shortcut-icon-color` |
| `--ck-color-ai-chat-shortcuts-shortcut-icon-hover-background` | `--ck-ai-chat-shortcuts-shortcut-icon-hover-background-color` |
| `--ck-color-ai-chat-suggestion-container-content-part-active-outline` | `--ck-ai-chat-suggestion-container-content-part-active-outline-color` |
| `--ck-color-ai-chat-suggestion-container-content-part-active-shadow` | `--ck-ai-chat-suggestion-container-content-part-active-shadow-color` |
| `--ck-color-ai-chat-suggestion-container-content-part-title` | `--ck-ai-chat-suggestion-container-content-part-title-color` |
| `--ck-color-ai-chat-suggestion-container-header-shadow` | `--ck-ai-chat-suggestion-container-header-shadow-color` |
| `--ck-color-ai-chat-suggestion-icon-default` | `--ck-ai-chat-suggestion-icon-default-color` |
| `--ck-color-ai-chat-text` | `--ck-ai-chat-text-color` |
| `--ck-color-ai-chat-user-context-background` | `--ck-ai-chat-user-context-background-color` |
| `--ck-color-ai-chat-web-source-tooltip-title` | `--ck-ai-chat-web-source-tooltip-title-color` |
| `--ck-color-ai-chat-web-source-tooltip-url` | `--ck-ai-chat-web-source-tooltip-url-color` |
| `--ck-color-ai-core-skeleton-gradient-edge` | `--ck-ai-core-skeleton-gradient-edge-color` |
| `--ck-color-ai-core-skeleton-gradient-mid` | `--ck-ai-core-skeleton-gradient-mid-color` |
| `--ck-color-ai-core-spinner-gradient-end` | `--ck-ai-core-spinner-gradient-end-color` |
| `--ck-color-ai-core-spinner-gradient-start` | `--ck-ai-core-spinner-gradient-start-color` |
| `--ck-color-ai-deletion-background` | `--ck-ai-deletion-background-color` |
| `--ck-color-ai-deletion-bg-active` | `--ck-ai-deletion-active-background-color` |
| `--ck-color-ai-deletion-border` | `--ck-ai-deletion-border-color` |
| `--ck-color-ai-deletion-border-active` | `--ck-ai-deletion-active-border-color` |
| `--ck-color-ai-deletion-stroke` | `--ck-ai-deletion-stroke-color` |
| `--ck-color-ai-disclaimer-text` | `--ck-ai-disclaimer-text-color` |
| `--ck-color-ai-error-background` | `--ck-ai-error-background-color` |
| `--ck-color-ai-error-border` | `--ck-ai-error-border-color` |
| `--ck-color-ai-gray-100` | `--ck-ai-neutral-100-color` |
| `--ck-color-ai-gray-600` | `--ck-ai-neutral-600-color` |
| `--ck-color-ai-header-icon` | `--ck-ai-header-icon-color` |
| `--ck-color-ai-inactive-deletion-background` | `--ck-ai-inactive-deletion-background-color` |
| `--ck-color-ai-inactive-deletion-border` | `--ck-ai-inactive-deletion-border-color` |
| `--ck-color-ai-inactive-deletion-stroke` | `--ck-ai-inactive-deletion-stroke-color` |
| `--ck-color-ai-inactive-insertion-background` | `--ck-ai-inactive-insertion-background-color` |
| `--ck-color-ai-inactive-insertion-background-active` | `--ck-ai-inactive-insertion-active-background-color` |
| `--ck-color-ai-inactive-insertion-border` | `--ck-ai-inactive-insertion-border-color` |
| `--ck-color-ai-inactive-insertion-border-active` | `--ck-ai-inactive-insertion-active-border-color` |
| `--ck-color-ai-insertion-background` | `--ck-ai-insertion-background-color` |
| `--ck-color-ai-insertion-background-active` | `--ck-ai-insertion-active-background-color` |
| `--ck-color-ai-insertion-border` | `--ck-ai-insertion-border-color` |
| `--ck-color-ai-insertion-border-active` | `--ck-ai-insertion-active-border-color` |
| `--ck-color-ai-notification-error-background` | `--ck-ai-notification-error-background-color` |
| `--ck-color-ai-notification-error-border` | `--ck-ai-notification-error-border-color` |
| `--ck-color-ai-notification-text` | `--ck-ai-notification-text-color` |
| `--ck-color-ai-notification-warning-background` | `--ck-ai-notification-warning-background-color` |
| `--ck-color-ai-notification-warning-border` | `--ck-ai-notification-warning-border-color` |
| `--ck-color-ai-prompt-glow` | `--ck-ai-prompt-glow-color` |
| `--ck-color-ai-quick-actions-button-hover-background` | `--ck-ai-quick-actions-button-hover-background-color` |
| `--ck-color-ai-quick-actions-button-text` | `--ck-ai-quick-actions-button-text-color` |
| `--ck-color-ai-quick-actions-list-item-group-row` | `--ck-ai-quick-actions-list-item-group-row-color` |
| `--ck-color-ai-review-border-button` | `--ck-ai-review-button-border-color` |
| `--ck-color-ai-review-check-list-item-active-border` | `--ck-ai-review-check-list-item-active-border-color` |
| `--ck-color-ai-review-check-list-item-border` | `--ck-ai-review-check-list-item-border-color` |
| `--ck-color-ai-review-check-list-item-description` | `--ck-ai-review-check-list-item-description-color` |
| `--ck-color-ai-review-check-list-item-hover-border` | `--ck-ai-review-check-list-item-hover-border-color` |
| `--ck-color-ai-review-check-list-item-hover-icon` | `--ck-ai-review-check-list-item-hover-icon-color` |
| `--ck-color-ai-review-check-list-item-selected-border` | `--ck-ai-review-check-list-item-selected-border-color` |
| `--ck-color-ai-review-check-list-item-title` | `--ck-ai-review-check-list-item-title-color` |
| `--ck-color-ai-review-check-list-item-title-icon` | `--ck-ai-review-check-list-item-title-icon-color` |
| `--ck-color-ai-review-check-list-parameterized-dropdown-button-border` | `--ck-ai-review-check-list-parameterized-dropdown-button-border-color` |
| `--ck-color-ai-review-check-run-result-status-button-background` | `--ck-ai-review-check-run-result-status-button-background-color` |
| `--ck-color-ai-review-check-run-result-status-button-error-background` | `--ck-ai-review-check-run-result-status-button-error-background-color` |
| `--ck-color-ai-review-check-run-result-status-button-error-text` | `--ck-ai-review-check-run-result-status-button-error-text-color` |
| `--ck-color-ai-review-check-run-result-status-button-success-background` | `--ck-ai-review-check-run-result-status-button-success-background-color` |
| `--ck-color-ai-review-check-run-result-status-button-success-text` | `--ck-ai-review-check-run-result-status-button-success-text-color` |
| `--ck-color-ai-review-check-run-result-status-button-text` | `--ck-ai-review-check-run-result-status-button-text-color` |
| `--ck-color-ai-review-progress-bar-fill` | `--ck-ai-review-progress-bar-fill-color` |
| `--ck-color-ai-review-progress-bar-label` | `--ck-ai-review-progress-bar-label-color` |
| `--ck-color-ai-review-progress-bar-track` | `--ck-ai-review-progress-bar-track-color` |
| `--ck-color-ai-review-suggestion` | `--ck-ai-review-suggestion-color` |
| `--ck-color-ai-review-text` | `--ck-ai-review-text-color` |
| `--ck-color-ai-selection` | `--ck-ai-selection-color` |
| `--ck-color-ai-shadow` | `--ck-ai-shadow-color` |
| `--ck-color-ai-skeleton-base` | `--ck-ai-skeleton-base-color` |
| `--ck-color-ai-skeleton-flash` | `--ck-ai-skeleton-flash-color` |
| `--ck-color-ai-suggestion-content-part-toolbar-button-background-active` | `--ck-ai-suggestion-content-part-toolbar-button-active-background-color` |
| `--ck-color-ai-suggestion-content-part-toolbar-button-background-hover` | `--ck-ai-suggestion-content-part-toolbar-button-hover-background-color` |
| `--ck-color-ai-suggestion-content-part-toolbar-button-text-active` | `--ck-ai-suggestion-content-part-toolbar-button-active-text-color` |
| `--ck-color-ai-suggestion-content-part-toolbar-button-text-hover` | `--ck-ai-suggestion-content-part-toolbar-button-hover-text-color` |
| `--ck-color-ai-suggestion-inactive-background` | `--ck-ai-suggestion-inactive-background-color` |
| `--ck-color-ai-suggestion-inactive-background-active` | `--ck-ai-suggestion-inactive-active-background-color` |
| `--ck-color-ai-suggestion-inactive-border` | `--ck-ai-suggestion-inactive-border-color` |
| `--ck-color-ai-suggestion-inactive-border-active` | `--ck-ai-suggestion-inactive-active-border-color` |
| `--ck-color-ai-suggestion-marker-deletion-background` | `--ck-ai-suggestion-marker-deletion-background-color` |
| `--ck-color-ai-suggestion-marker-deletion-background-active` | `--ck-ai-suggestion-marker-deletion-active-background-color` |
| `--ck-color-ai-suggestion-marker-deletion-border` | `--ck-ai-suggestion-marker-deletion-border-color` |
| `--ck-color-ai-suggestion-marker-deletion-border-active` | `--ck-ai-suggestion-marker-deletion-active-border-color` |
| `--ck-color-ai-suggestion-marker-deletion-stroke` | `--ck-ai-suggestion-marker-deletion-stroke-color` |
| `--ck-color-ai-suggestion-marker-insertion-background` | `--ck-ai-suggestion-marker-insertion-background-color` |
| `--ck-color-ai-suggestion-marker-insertion-background-active` | `--ck-ai-suggestion-marker-insertion-active-background-color` |
| `--ck-color-ai-suggestion-marker-insertion-border` | `--ck-ai-suggestion-marker-insertion-border-color` |
| `--ck-color-ai-suggestion-marker-insertion-border-active` | `--ck-ai-suggestion-marker-insertion-active-border-color` |
| `--ck-color-ai-tab-surface-active` | `--ck-ai-tab-active-surface-color` |
| `--ck-color-ai-translate-check-list-header-title` | `--ck-ai-translate-check-list-header-title-color` |
| `--ck-color-ai-warning` | `--ck-ai-warning-color` |
| `--ck-color-ai-warning-background` | `--ck-ai-warning-background-color` |
| `--ck-color-ai-warning-border` | `--ck-ai-warning-border-color` |

</details>

### Consolidated

The old track changes and suggestion colors (`--ck-color-suggestion-marker-*`, `-widget-*`, and `-box-*`) were consolidated into the shared `--ck-color-diff-*` semantic layer. It covers deletion, insertion, and format changes for backgrounds, borders, strokes, widgets, and boxes. Overriding the old names still works ([Overriding old token names](#overriding-old-token-names)). You can also recolor at two levels: the shared `--ck-color-diff-*` tokens change all diffs at once, and the per-surface `--ck-suggestion-marker-*-color`, `-box-*`, and `-widget-*` tokens change one surface:

```css
/* Recolor all insertions at once via the shared diff layer. */
:root { --ck-color-diff-insertion-border: hsl(157 80% 34% / 50%); }
```

See {@link features/track-changes#markers-styling Markers styling} in the track changes guide.

## Reference links

* {@link framework/theme-token-naming Theme token naming guide} &ndash; the three-tier model and where to override.
* {@link framework/theme-customization Theme customization guide} &ndash; how to override tokens and apply custom CSS.
