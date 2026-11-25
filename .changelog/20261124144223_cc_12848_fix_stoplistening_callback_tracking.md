---
type: Fix
scope:
  - ckeditor5-utils
---

`Emitter#stopListening()` and `Emitter#off()` called with a callback no longer keep a reference to that callback when other callbacks remain registered for the same event or when the callback was registered more than once. Previously, the callback stayed in memory until the listener stopped listening to the whole event, and a later `stopListening()` call for the whole event or emitter could also remove the same callback if another listener registered it in the meantime.
