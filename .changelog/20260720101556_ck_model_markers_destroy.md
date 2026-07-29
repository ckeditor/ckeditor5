---
type: Fix
scope:
  - ckeditor5-engine
---

The editor now releases document markers when the model is destroyed, preventing a memory leak when an editor instance is kept referenced after being destroyed.
