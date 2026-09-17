---
type: Fix
scope:
  - ckeditor5-utils
closes:
  - https://github.com/ckeditor/ckeditor5/issues/20237
communityCredits:
  - ld3nl
---

Fixed an initialization failure in Safari 27 on Intel Macs by working around a regression in the browser’s implementation of `String#substr()`.

Affected Safari builds return the entire string instead of an empty string when `String#substr()` is called with a negative length. For event names without a namespace separator, this caused an event node to reference itself as a child, leading to infinite recursion and a stack overflow when collecting callbacks. The editor no longer relies on `String#substr()` for this operation.
