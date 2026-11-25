---
type: Fix
scope:
  - ckeditor5-image
closes:
  - https://github.com/ckeditor/ckeditor5/issues/20256
communityCredits:
  - VladyslavLevoshko
---

Keyboard navigation in the insert image dropdown now uses the <kbd>↑</kbd> and <kbd>↓</kbd> keys instead of <kbd>Tab</kbd>, like in other list-like dropdowns. If the dropdown contains a view other than a button, for example, a text field added by a custom integration, <kbd>Tab</kbd> is still used, so the arrow keys can move the caret in that field.
