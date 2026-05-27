---
type: Feature
scope:
  - ckeditor5-editor-multi-root
closes:
  - https://github.com/ckeditor/ckeditor5/issues/20047
---

The `MultiRootEditor#createEditable()` method now accepts an existing `HTMLElement` (or a `ViewRootElementDefinition`) so that dynamically added roots can be attached to a caller-owned DOM element instead of always rendering a fresh one. Element shape supplied at root configuration time is persisted on the model root and replicated through real-time collaboration.
