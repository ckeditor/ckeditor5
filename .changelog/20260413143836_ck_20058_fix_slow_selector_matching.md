---
type: Fix
scope:
  - ckeditor5-show-blocks
  - ckeditor5-table
closes:
  - https://github.com/ckeditor/ckeditor5/issues/20058
---

Improved the performance of the show blocks and table selection styles by rewriting selectors to avoid expensive `:is(...)` output after CSS nesting compilation.
