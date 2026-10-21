---
type: Feature
scope:
  - ckeditor5-utils
  - ckeditor5-ui
---

Introduced helpers for listening to DOM events on both the document and the shadow roots a node lives in. Events that are not composed, such as `scroll`, never cross a shadow boundary, so a listener on `document` alone misses them.

* The new `listenToEventRoots()` helper listens to the document and to every shadow root tracked by a `ShadowRootRegistry`, and follows the registry as these roots come and go.
* The new `DomTargetsListener` class listens to a set of DOM event targets that can be updated with its `refresh()` method. Together with the new `getEventRoots()` helper, it covers particular elements, such as the positioning target of a balloon.
* `ShadowRootRegistry` now also reports the documents of its registered nodes through `getEventRoots()` and fires the `changeEventRoots` event when they change.

The balloon panel, sticky panel, tooltip manager, and block toolbar now use these helpers instead of their own listener syncing code.
