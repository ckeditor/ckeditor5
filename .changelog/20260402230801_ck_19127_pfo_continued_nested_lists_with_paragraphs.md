---
type: Fix

scope:
  - ckeditor5-paste-from-office

closes:
  - ckeditor/ckeditor5#19127
---

Fixed incorrect structure of nested lists pasted from Word when plain paragraphs appear between nested list items.

Previously, all paragraphs were placed after the nested list items instead of between them. The fix also ensures that interrupted nested ordered lists continue numbering correctly across the paragraph breaks.
