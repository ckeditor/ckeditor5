---
category: framework-deep-dive-ui
meta-title: Theme token naming | CKEditor 5 Framework Documentation
meta-description: Learn how to name and describe foundation, semantic, and component CSS variables in the CKEditor 5 UI theme and apply the conventions consistently.
order: 20
modified_at: 2026-11-09
---

# Theme token naming

This guide defines the naming conventions for the CSS variables (design tokens) in the `@ckeditor/ckeditor5-ui` theme files, and how to describe them. Following them keeps tokens easy to scan and consistent across files, straightforward to map to design tools such as Figma, and easy for integrators to override.

## Layer model

The theme is organized into three layers, and every token belongs to exactly one of them. Each layer references the one below it, so a value defined once in the foundation flows up through the semantic roles into the components that use it.

| Layer      | Purpose                                                   | Where                                                                   |
|------------|-----------------------------------------------------------|-------------------------------------------------------------------------|
| Foundation | Low-level primitives (scale, base colors, base geometry). | `theme/globals/_*.css`, `theme/globals/colors/_foundation.css`          |
| Semantic   | Design-intent roles shared across components.             | `theme/globals/_semantic-*.css`, `theme/globals/colors/_semantic-*.css` |
| Component  | Component-specific API and variants.                      | `theme/components/**/**.css`                                            |

Legacy compatibility is the one exception: old token names keep working as *override* fallbacks woven directly into the component and foundation files that use them. The name without a default value comes first. When the theme no longer declares the old name, it is read first: `var(--ck-old, var(--ck-new))`. When the old name keeps its default value, the new name has no value (it is declared `initial` or not declared at all) and is read first: `var(--ck-new, var(--ck-old))`.

## Naming formats

Each layer has its own naming format that reflects its role: primitives are named by their scale, semantic tokens by their design intent, and component tokens by the component they belong to.

### Foundation

Foundation tokens are named after a primitive domain and a value on its scale, following the `--ck-{domain}-{property?}-{scale}` pattern. For example:

* `--ck-spacing-sm`
* `--ck-font-size-base`
* `--ck-font-weight-bold`
* `--ck-color-base-border`
* `--ck-color-base-hover`
* `--ck-color-base-success`
* `--ck-radius-base`, `--ck-radius-corners`
* `--ck-shadow-md`
* `--ck-z-overlay`
* `--ck-duration-fast`
* `--ck-ease-standard`

Keep foundation names short and generic, and never include a component name in them.

### Semantic

Semantic tokens describe a design intent and role rather than any specific component. Use one of these patterns:

* `--ck-{domain}-{role}-{property}`
* `--ck-{domain}-{role}-{state}-{property}`
* `--ck-{role}-{state}-{property}` (when the domain is obvious from the property, such as `focus` or `layer`)

For example:

* `--ck-color-interactive-hover-surface`
* `--ck-color-text-primary`
* `--ck-interactive-focus-ring`
* `--ck-interactive-focus-error-shadow`
* `--ck-spacing-control-padding-inline`
* `--ck-border-radius-uniform`
* `--ck-border-radius-surface-cut-top-left`
* `--ck-layer-panel-above`

Semantic color roles follow the `--ck-color-{group}-{role}-{part?}-{state-or-modifier?}` pattern, where the group is `surface`, `border`, `text`, `interactive`, `feedback`, or `diff`. The group already tells what the color is for, so a name can end with the role itself. In the `interactive`, `feedback`, and `diff` groups, a part such as `surface`, `background`, or `border` names what the color paints, and a state or a strength modifier can follow it. `--ck-color-divider` is a standalone role without a group. For example:

* `--ck-color-surface-subtle`
* `--ck-color-text-accent`
* `--ck-color-border-accent`
* `--ck-color-interactive-hover-surface-strong`
* `--ck-color-interactive-primary-surface-muted`
* `--ck-color-feedback-error-surface`
* `--ck-color-diff-insertion-border-active`

### Component

Component tokens are named component-first, following the `--ck-{component}-{part?}-{variant?}-{state?}-{property}` pattern. For example:

* `--ck-button-focus-border-color`
* `--ck-button-default-hover-background-color`
* `--ck-input-border-color`
* `--ck-dropdown-panel-uniform-border-radius`
* `--ck-form-header-label-font-size`

The variant, such as `default`, `action`, or `outline` for buttons, comes before the state. States can stack, with the persistent state first, as in `--ck-button-on-hover-background-color` or `--ck-list-item-button-on-hover-background`.

As a rule of thumb, if a token is used in only one component, its name must start with that component.

## Vocabulary rules

Beyond the per-layer formats, a few shared vocabulary rules keep names predictable across the whole theme.

### States

Use these state keywords: `hover`, `active`, `focus`, `disabled`, `error`, `selected`, `readonly`, `on`, `off`, and `open`. Use `on` for an item that is toggled on (for example a checked option) and `open` for an item whose menu or panel is open, as in `--ck-list-item-button-on-text-color` and `--ck-list-item-button-open-text-color`. A feature can also use a state that mirrors a state class or a state of its own, such as `blurred` for `.ck-blurred`, `checked` for a checked to-do item, or `resolved` for a resolved suggestion.

Semantic roles can take a modifier that tunes the strength of the role: `subtle`, `strong`, `muted`, or `highlight`, as in `--ck-color-interactive-primary-surface-muted` or `--ck-color-interactive-hover-surface-strong`.

### Property suffixes

End a new token with the CSS property it feeds:

* `-background` for a token used in the `background` shorthand. It can hold a gradient, as in `--ck-menu-bar-background`.
* `-background-color` for a token used in `background-color`, which accepts a color only, as in `--ck-content-image-caption-background-color`.
* `-text-color` for the `color` property, as in `--ck-input-text-color`.
* `-border-color`, `-border-radius`, `-shadow`, `-font-size`, and so on for the other properties.

### Geometry variants

Prefer descriptive corner names, such as `top-left`, `top-right`, `bottom-left`, and `bottom-right`. Short forms like `ne` or `sw` are allowed only when they mirror existing class or state naming in the selectors.

### Typography

For typography, use `font-weight` rather than a shorthand like `weight`, reach for the semantic typography role tokens (`--ck-font-weight-ui-*`), and add component proxies for local override points.

### The `content` namespace

Avoid `content` as a namespace in UI theme tokens, because `.ck-content` already represents editable content styling in other packages. Use `text` for textual semantics instead, as in `--ck-color-text-*`.

The `--ck-content-*` prefix is reserved for content styles, the tokens that style the editable and published content. They follow the `--ck-content-{feature}-{part?}-{state?}-{property}` pattern, as in `--ck-content-block-quote-border-color`, `--ck-content-code-block-background`, or `--ck-content-todo-list-checkmark-checked-background`.

### Naming order

Start a component token with the component it belongs to and end it with the property. Names in this order read consistently, and all tokens of one component sort next to each other. Do not start a component token with its domain, such as `color`, and do not mix the order. Foundation tokens and most semantic tokens are the exception: they start with their domain on purpose (`--ck-color-base-*`, `--ck-color-surface-*`, `--ck-spacing-control-*`), because they do not belong to a component. Semantic tokens whose domain is obvious from the property start with their role instead, as in `--ck-interactive-focus-*` (see [Semantic](#semantic)).

✅ Start with the component or role and end with the property, as in these names:

* `--ck-dropdown-panel-border-color`
* `--ck-labeled-field-label-background-color`
* `--ck-interactive-focus-disabled-shadow`

❌ Avoid the same names with the domain first or in a mixed order:

* `--ck-color-dropdown-panel-border`
* `--ck-color-labeled-field-label-background`
* mixed ordering like `--ck-focus-shadow-disabled-interactive`

### Internal helpers

Names that start with `--_ck-` (with an underscore) are internal helpers, not tokens. The theme uses them to pass values between components without shadowing the public tokens, for example `--_ck-button-context-border`, which the toolbar sets on its own buttons. Do not set or read them in your theme. They are not part of the public API and may change or be removed in any release.

## Describing tokens

A token declaration can carry a description of what the token is for. Tools, such as a generated token reference, read these descriptions, so they follow a fixed format.

### Doc comments and notes

The description is a doc comment, `/** … */`, placed right above the declaration. A plain comment, `/* … */`, is a note for maintainers, and tools never read it.

| Comment                              | Use it for                                                                                    | Read by tools |
|--------------------------------------|-----------------------------------------------------------------------------------------------|---------------|
| `/** … */` above the declaration     | The description: what the token is for, how to use it, and its constraints.                   | Yes           |
| `/* … */` anywhere                   | Notes for maintainers, such as backward compatibility or why a value is hardcoded.            | No            |
| `/* … */` after a value, on one line | The computed value, as in `/* 8px */`.                                                        | No            |

```css
:root,
:host {
	/**
	 * Default focus shadow across the UI.
	 */
	/* Backward compatibility: reads the legacy `--ck-focus-outer-shadow-geometry` first if overridden, and the legacy
	   `--ck-color-focus-outer-shadow` color, so overrides of either still change the shadow. */
	--ck-focus-shadow: var(--ck-focus-outer-shadow-geometry, var(--ck-focus-shadow-geometry)) var(--ck-color-focus-outer-shadow);
}
```

Write every doc comment in the multi-line form used for API comments in the source code, even when the description is a single sentence. One form for all descriptions keeps the files consistent, a description can grow without being reformatted, and tags such as `@pair` (see [Contrast pairs](#contrast-pairs)) and `@deprecated` (see [Deprecated tokens](#deprecated-tokens)) fit on lines of their own. A tag takes the name of a token, not a sentence, and its line does not end with a dot.

### What a description says

A description holds only what the CSS cannot show:

* The first sentence is the role of the token. Tools show it as the summary.
* The next sentences are usage rules, for example "Use it for placeholders, not for disabled controls."
* The last sentences are constraints, for example "Read through the `background` shorthand, so a gradient works."

Do not repeat what tools can compute from the CSS: the default value, the `var()` chain in either direction, or the components that read the token. These facts change with the code, and a comment that repeats them goes out of date. This also rules out sentences that restate the chain without naming tokens, such as "Setting it also changes the error text." A usage rule can still name the token to set instead: `--ck-color-border-accent` tells integrators to set `--ck-color-text-accent` to change the accent text and lines together. When a token has no parent or a surprising one, explain why in a note, not what it derives from.

Every description says what the token is for, not what its value looks like. Foundation tokens name their default role across the UI, for example "Default border color across the UI." Name a component only when the token exists for it, for example `--ck-color-shadow-inner`, the color of the hover ring on the switch button toggle. Semantic and component tokens are more specific: they can say where not to use them, and their examples, introduced with "such as", show the scope of the role. Give a few typical examples, not every reader, so that the description stays true when a component changes.

### Scales

A foundation scale, such as the spacing or font size steps, is described once, in the doc comment of its file. The steps of the scale do not need descriptions of their own, because their names and values already show what they are. A token that stands out from the scale gets its own doc comment:

```css
/**
 * The spacing scale of the editor UI. Set `--ck-spacing-base` on `:root` to resize every step.
 * To change the spacing of one group of elements, such as controls, override its semantic spacing role,
 * such as `--ck-spacing-control-padding-inline`, instead.
 */
:root,
:host {
	--ck-spacing-base: var(--ck-spacing-unit, 8px); /* 8px */
	--ck-spacing-xs: calc(0.25 * var(--ck-spacing-base)); /* 2px */
	--ck-spacing-sm: calc(0.5 * var(--ck-spacing-base)); /* 4px */
	--ck-spacing-md: calc(0.75 * var(--ck-spacing-base)); /* 6px */

	/**
	 * An alias of `--ck-spacing-md`.
	 * @deprecated --ck-spacing-md
	 */
	--ck-spacing-ms: var(--ck-spacing-medium-small, var(--ck-spacing-md)); /* 6px */
}
```

Semantic and component tokens each have a role of their own, so each of them gets its own doc comment.

### Contrast pairs

Use the `@pair` tag to name the content drawn on a background, such as text or icons. Changing one without checking the other can break the contrast, so tools can tell integrators to set both and check the contrast of each pair.

```css
/**
 * The fill of primary controls.
 * Keep it saturated enough for the text on it to stay readable.
 * @pair --ck-color-interactive-primary-text
 * @pair --ck-color-text-inverse
 */
--ck-color-interactive-primary-surface: var(--ck-color-base-action);
```

* Do not use `@pair` for other relations, such as a border around a surface. Describe them in a sentence.
* Put the tag on the background token only. Tools show the pair on both tokens, so the content token does not get a tag back.
* A background can have more than one `@pair` tag.
* Name all content meant to be drawn on the background, even if only some packages draw it.
* A parent is not a pair. A token that follows another token does not get `@pair` for it.

### Deprecated tokens

Use the `@deprecated` tag, followed by the name of the replacement, for a token kept for compatibility that new code should not use, as `--ck-spacing-ms` in the [Scales](#scales) example. The tag does not mean that the token will be removed. Tools can mark the token and point to its replacement.

The first sentence of the description says what the token is, for example an alias of another token.

### Where tools look for descriptions

* The description of a token is the nearest doc comment before its declaration. Only plain comments and whitespace can be between them. Anything else, such as a selector or another declaration, breaks the link.
* Tools read descriptions only from the declarations in `:root, :host`. A token redeclared in a narrower rule does not carry one. A token declared only in a narrower rule, such as one that a component sets for each of its states, is outside this convention.
* Never put a description inside a value. Comments inside a value, for example in `calc()`, are kept in the built style sheets.
* A doc comment right above the first `:root, :host` rule of a file describes the file. A doc comment above any other rule, including a later `:root, :host` rule, describes that rule, not a token.

## Overriding tokens

Naming is only half the story. For how to pick a layer and override tokens in practice - global versus scoped overrides and the per-element caveats - see the {@link framework/theme-customization Theme customization} guide.

## Quick example

A single value flows through all three layers: the raw number lives in the foundation, the shared design role in the semantic layer, and the per-component override point in the component layer.

```css
:root,
:host {
	/* Foundation - the raw value and a scale step derived from it. */
	--ck-radius-base: 8px;
	--ck-radius-md: calc(var(--ck-radius-base) / 2);

	/* Semantic - the shared design role. */
	--ck-border-radius-control: var(--ck-radius-md);

	/* Component - the per-component override points. */
	--ck-input-border-radius: var(--ck-border-radius-control);
	--ck-button-border-radius: var(--ck-border-radius-control);
}
```

To resize the whole radius scale, override the foundation token (`--ck-radius-base`). To round controls such as buttons and inputs, override the semantic token once (`--ck-border-radius-control`). To change only inputs, override the component token (`--ck-input-border-radius`).
