---
type: Major breaking change
scope:
  - ckeditor5-ui
see:
  - https://github.com/ckeditor/ckeditor5/issues/3891
---

The `BodyCollection#detachFromDom()` method has been renamed to `BodyCollection#destroy()`. Its behavior is unchanged: it destroys the collection's views and removes their container from the DOM. The new name makes clear that this is a permanent teardown, distinct from the new and reversible `BodyCollection#unmountFromDom()` method. Replace every `detachFromDom()` call with `destroy()`.
