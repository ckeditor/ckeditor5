---
type: Fix
scope:
  - ckeditor5-link
closes:
  - 18013
---

Going back from the link form or the link properties view to the link toolbar, also by submitting the form, now moves the focus back to the toolbar button that had focus before. Previously, the focus went to the editing area, so keyboard users had to focus the toolbar again.
