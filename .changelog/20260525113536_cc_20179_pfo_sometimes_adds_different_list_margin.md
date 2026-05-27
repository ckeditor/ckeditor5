---
type: Fix

scope:
  - ckeditor5-paste-from-office

closes:
  - https://github.com/ckeditor/ckeditor5/issues/20179
---

Lists pasted from Microsoft Word now keep consistent left indentation.

It is no longer possible for top-level items that shared the same indentation in the original document to end up visually misaligned in the editor when the list is interrupted by another list or by an empty paragraph. It should now also be possible to paste a nested list item directly after its parent without it being flattened to the top indentation level.
