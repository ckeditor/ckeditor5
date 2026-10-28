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

The block quote border, code block, inline code, horizontal line, page break, table borders and header, and to-do list checkmarks in the content expose `--ck-content-*` CSS custom properties, so the content rendered inside `.ck-content` can be restyled on `:root` (or `:host` in a shadow root) without overriding element rules. Every new property defaults to the current value, so the default theme renders unchanged. The table caption, image caption, and mention color properties were renamed to follow the current naming convention (for example `--ck-content-table-caption-background-color`), and the former `--ck-content-color-*` names keep working as fallbacks on `:root` (or `:host` in a shadow root) and in scoped selectors.
