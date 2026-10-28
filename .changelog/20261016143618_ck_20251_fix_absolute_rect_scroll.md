---
type: Fix
scope:
  - ckeditor5-utils
closes:
  - https://github.com/ckeditor/ckeditor5/issues/20251
---

Balloons, such as tooltips, the link balloon, or the mention list, are no longer displaced by the page scroll when the `<body>` element or the overlay container is positioned. The `Rect#toAbsoluteRect()` method no longer counts the page scroll twice when the element has a positioned ancestor.
