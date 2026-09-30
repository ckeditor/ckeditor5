---
type: Minor breaking change
scope:
  - ckeditor5-ui
  - ckeditor5-font
  - ckeditor5-table
---

The font and table color features now share one default palette of 120 Material shades. Existing documents are unaffected, as the palettes only decide what the user can pick. Pass the color options explicitly to keep the previous set.

The default color grid is now 12 columns wide instead of 5, which also shifts the default of `fontColor.documentColors`. The table and table cell properties balloons accept a new `colorGridColumns` option for that width.
