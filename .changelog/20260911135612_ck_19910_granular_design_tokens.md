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

Custom themes that read the previous variables keep working, as the legacy names are preserved as backward-compatible aliases. The breaking surface is narrower: some legacy hooks were removed outright, and overriding a foundation or legacy variable no longer necessarily cascades through the semantic and component layers, so scoped overrides should target the component token closest to the property. See the theme token naming guide in the CKEditor&nbsp;5 documentation for the layer model and the recommended override points.
