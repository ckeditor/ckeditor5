---
type: Minor breaking change
scope:
  - ckeditor5-utils
see:
  - https://github.com/ckeditor/ckeditor5/issues/3891
---

The `getPositionedAncestor()` DOM utility function now returns `null` for an element that is not connected to a document, where it previously required only that the element had a parent.
