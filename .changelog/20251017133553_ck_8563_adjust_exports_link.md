---
type: Fix
scope:
  - ckeditor5-link
---

Removed unnecessary public export: `ensureSafeUrl`.

This utility was only provided as an internal export (prefixed with `_`), which indicates it is not part of the public API. Removing the duplicate public export cleans up the API and reduces the risk of relying on implementation details.
