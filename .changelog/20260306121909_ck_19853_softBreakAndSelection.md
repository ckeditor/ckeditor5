---
type: Fix
scope:
  - ckeditor5-engine
  - ckeditor5-enter
closes:
  - 19853
---

Improved document selection attribute inheritance around `<softBreak>` so returning the caret after a soft break restores expected formatting.

When selection attributes are recalculated across `<softBreak>`, only attributes marked with `copyOnEnter` are inherited. Other inline non-object elements still act as hard boundaries.
