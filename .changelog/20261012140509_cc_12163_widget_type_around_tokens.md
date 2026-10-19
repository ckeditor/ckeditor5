---
type: Fix
scope:
  - ckeditor5-widget
closes:
  - https://github.com/ckeditor/ckeditor5-commercial/issues/12163
---

The buttons for inserting a paragraph next to a widget now use a dedicated theme token for their icon color in the blurred-editor state, so customizing the widget outline color no longer unintentionally recolors them.
