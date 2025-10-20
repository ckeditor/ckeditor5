---
type: Fix
scope:
  - ckeditor5-engine
---

Removed unnecessary public exports: `autoParagraphEmptyRoots`, `isParagraphable`, `wrapInParagraph`.

These utilities were only provided as internal exports (prefixed with `_`), which indicates they are not part of the public API. Removing the duplicate public exports cleans up the API and reduces the risk of relying on implementation details.
