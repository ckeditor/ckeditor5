---
type: Fix
scope:
  - ckeditor5-ui
---

Border colors of inputs, dropdown panels, balloon panels, toolbars, and autocomplete results set on a narrower selector than `:root` now apply again, under both the legacy and the new token names. Their border shorthand tokens can still be overridden, but they no longer hold a value you can read. To use these borders in your own CSS, read their border color tokens instead.
