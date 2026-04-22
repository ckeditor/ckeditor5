---
type: Fix
scope:
  - ckeditor5-engine
  - ckeditor5-enter
closes:
  - https://github.com/ckeditor/ckeditor5/issues/1068
---

Inline formatting attributes (such as bold or link) are no longer split by a soft break (`<br>`). The `<br>` element now inherits applicable text attributes so that attribute elements in the view can wrap around it without being broken into separate segments.
