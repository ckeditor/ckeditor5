---
type: Major breaking change
scope:
  - ckeditor5
  - ckeditor5-ui
closes:
  - https://github.com/ckeditor/ckeditor5/issues/19910
---

The UI theme is now built on a three-layer system of CSS custom properties, replacing the previous flat set of theme variables with more granular, predictable customization points.

The layers are:

1. Foundation primitives, such as the spacing, radius, and color scales.
2. Semantic design roles shared across components, such as control padding and surface radius.
3. Per-component override points, such as the button or dialog tokens.

Custom themes that override the previous variables keep working, because the theme still reads each legacy name before the new one. Reading a legacy name in your own CSS, for example `var(--ck-spacing-small)`, now needs the opt-in aliases from the [migration guide](https://ckeditor.com/docs/ckeditor5/latest/updating/migration-to-refreshed-theme.html#reading-old-token-names). A few legacy names were removed outright. Overriding a new foundation or semantic token on a narrower selector does not cascade into the component layer, because those layers resolve on `:root`, so scoped overrides should target the component token closest to the property. See the [theme token naming](https://ckeditor.com/docs/ckeditor5/latest/framework/theme-token-naming.html) guide for the layer model and the recommended override points.
