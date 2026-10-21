---
type: Minor breaking change
scope:
  - ckeditor5-utils
---

The DOM event passed to the `listenToShadowRoots()` callback is now typed after the `event` option, the same way as in `DomEmitter#listenTo()`, instead of `any`. A TypeScript callback that declares a narrower DOM event type than the one of the event it listens to no longer compiles. Declare the matching DOM event type, or narrow it inside the callback.
