---
type: Other
scope:
  - ckeditor5-basic-styles
  - ckeditor5-engine
closes: https://github.com/ckeditor/ckeditor5/issues/18430
see:
  - https://github.com/ckeditor/ckeditor5/issues/19664
---

Fixed a discrepancy where applying a text attribute (e.g. bold) to a selection that included empty paragraphs did not set stored selection attributes on those paragraphs.
