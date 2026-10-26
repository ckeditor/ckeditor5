---
type: Feature
scope:
  - ckeditor5-block-quote
  - ckeditor5-code-block
  - ckeditor5-basic-styles
  - ckeditor5-horizontal-line
  - ckeditor5-page-break
  - ckeditor5-table
  - ckeditor5-list
  - ckeditor5-image
  - ckeditor5-mention
closes:
  - 20253
---

Exposed content styles as design tokens, so document content rendered inside `.ck-content` can be recolored from `:root` or `:host` without overriding element rules. Added `--ck-content-*` tokens for the block quote border, code block, inline code, horizontal line, page break, table borders and header, and to-do list checkmarks, each defaulting to its current value so the default theme renders unchanged. Renamed the table caption, image caption, and mention color tokens to the current naming convention (for example `--ck-content-table-caption-background-color`), keeping the former `--ck-content-color-*` names as fallbacks so existing overrides continue to work on `:root` or `:host` and in scoped selectors.
