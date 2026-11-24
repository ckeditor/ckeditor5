---
category: framework-deep-dive-ui
meta-title: Theme token reference | CKEditor 5 Framework Documentation
meta-description: Browse the foundation and semantic CSS variables of the CKEditor 5 UI theme with their roles, values, token chains, and contrast pairs.
order: 25
modified_at: 2026-11-24
---

# Theme token reference

This page lists the foundation tokens and the semantic tokens of the CKEditor&nbsp;5 UI theme. These are the CSS variables that you override most often:

* **Foundation tokens** are the raw values of the theme: the color palette, such as `--ck-color-base-action`, and the scales, such as the spacing steps `--ck-spacing-sm` and `--ck-spacing-md`. Override them for a broad change, such as a new brand color or a denser UI.
* **Semantic tokens** name a design role shared by many components, such as the background of a panel or the focus ring of a control. Override them to change one role across the whole UI, or to fine-tune the result of a broad change.

The {@link framework/theme-customization Theme customization} guide explains how to choose a layer and where to set an override.

The list is generated from the theme source files at every documentation build, so it always matches the theme of this version. The component tokens are not on this page.

## How to read the list

Each row shows the name of a token, the first sentence of its description, and its value in the default theme, with a preview. The details of a row hold the rest of the description, the default value as the theme declares it, the value that it resolves to, the tokens that it follows and that follow it, and the contrast pairs.

The steps of a scale, such as `--ck-spacing-sm`, have no description of their own. The description of their file, above their rows, explains the whole scale and, when the scale has one, the token that resizes it, such as `--ck-spacing-base`.

On the page, the filter above the list matches the names, the descriptions, and the values. A row must contain every word that you type, so `surface overlay` finds the tokens that mention both words.

### Token chains

Most tokens read the value of another token. The details show this chain in both directions:

* **Follows** names the tokens that the token reads. A legacy name or a deprecated alias in between is skipped, so the list names the token to override.
* **Followed by** names the tokens on this page whose default declaration on `:root` reads the token, directly or through other tokens. They change when you override the token on `:root`. An override on a narrower selector does not change them, because the theme resolves them on `:root`. The {@link framework/theme-customization#global-vs-scoped-overrides Theme customization} guide explains global and scoped overrides.

Check **Followed by** when you plan a broad change. One brand color is often spread over several foundation colors. For example, `--ck-color-base-action` colors the primary buttons, `--ck-color-base-active` colors the accent text and the text of the toggled-on buttons, and `--ck-color-base-focus` colors the focus rings. Override all of them, together with their variants, such as `--ck-color-base-action-hover`. Some semantic colors do not follow any foundation color, so a new brand color does not change them. For example, the pulsing glow of the buttons that insert a paragraph next to a widget comes from `--ck-color-interactive-focus-border-coordinates`, which holds the default focus color as fixed values. Override such tokens too.

A scale can follow another scale. The widths of panels, such as `--ck-width-md`, grow with the font size, so **Followed by** of `--ck-font-size-base` lists them too, and a new font size also resizes the panels. The focus tokens of the foundation, such as `--ck-focus-shadow`, read semantic tokens, such as `--ck-color-interactive-focus-shadow`, so their **Follows** points to the semantic layer.

**Followed by** lists only the tokens on this page, and it traces only their declarations on `:root`. The components and other tokens of the theme can read a token as well, so a token without **Followed by** is not necessarily unused. A token that the theme declares again under another selector can depend on more tokens there. For example, `--ck-radius-corners` reads `--ck-radius-base` inside `.ck-rounded-corners`, so a new base radius changes it too, although **Followed by** of `--ck-radius-base` does not list it. Its description explains this.

### Contrast pairs

A contrast pair names the content drawn on a background token, such as text or icons. If you change a background, check the contrast of each of its pairs too. The theme marks a pair on the background token only, as described in the {@link framework/theme-token-naming#contrast-pairs Contrast pairs} section of the Theme token naming guide. This page shows it on both tokens: the background lists its pairs under **Contrast pairs**, and the content token lists its backgrounds under **Used on**.

The page computes the contrast ratio of every pair in the default theme. A translucent background is first composited over the canvas color, `--ck-color-surface-canvas`. The ratios are rounded down, so the page never shows a ratio higher than it is.

A pair does not tell what its content is, such as text, an icon, or a decoration, so the page shows the ratio without a verdict. Compare it with the minimum for the content. The Web Content Accessibility Guidelines require 4.5:1 for normal text and 3:1 for large text in [Contrast (Minimum)](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html), and 3:1 for icons, borders, and other parts of the UI that you need to see to use it in [Non-text Contrast](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html).

If the page cannot read a color of a pair, for example a color that is not `hsl()`, it shows **contrast not computed** instead of the ratio.

### Deprecated tokens

A token marked as deprecated is kept for compatibility, as described in the {@link framework/theme-token-naming#deprecated-tokens Deprecated tokens} section of the Theme token naming guide. The theme still declares it, but new code and new overrides should use the token named in its details under **Use instead**. Being deprecated does not mean that the token will be removed.

{@exec ../scripts/docs/theme-tokens/build-theme-token-reference.cjs}
