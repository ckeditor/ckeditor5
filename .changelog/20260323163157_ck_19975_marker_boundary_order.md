---
type: Fix
scope:
  - ckeditor5-engine
closes:
  - 19975
---

Fixed the editing downcast order of adjacent marker UI boundaries so marker ends and starts are rendered consistently with the model and data output.

The editing pipeline now produces a deterministic marker order and preserves the expected boundary order when adjacent markers are added together or when the second adjacent marker is added later.
