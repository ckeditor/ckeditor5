---
type: Fix
scope:
  - ckeditor5-table
---

The `height` attribute of a table cell that also has the `height` style, for example in a table pasted from Microsoft Excel, is no longer kept by General HTML Support. Removing the cell height in the table cell properties now makes the cell lower.
