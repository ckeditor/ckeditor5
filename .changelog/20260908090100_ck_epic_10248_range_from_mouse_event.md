---
type: Other
scope:
  - ckeditor5-utils
see:
  - https://github.com/ckeditor/ckeditor5/issues/3891
---

The `getRangeFromMouseEvent()` utility function now resolves a point inside a shadow root, instead of returning a range beside the shadow host. It relies on the `shadowRoots` option of `Document#caretPositionFromPoint()`, which is honored by Chrome and Edge 128 and later, Firefox 150 and later, and Safari 26.2 and later. On older engines the range still lands beside the host.
