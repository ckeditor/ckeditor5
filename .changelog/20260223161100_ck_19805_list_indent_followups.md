---
type: Feature
scope:
  - ckeditor5-indent
closes:
  - https://github.com/ckeditor/ckeditor5/issues/19490
---

Added list indentation integration to the `IndentBlock` feature (enabled by default).

New commands support block-level indentation for whole lists (`indentBlockList`/`outdentBlockList`) and for individual list items (`indentBlockListItem`/`outdentBlockListItem`). Indentation can be rendered using either `margin-left`/`margin-right` styles (offset-based) or CSS classes (class-based).
