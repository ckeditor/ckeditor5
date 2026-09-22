---
type: Minor breaking change
scope:
  - ckeditor5-mention
---

The mention suggestion list now matches the toolbar dropdown lists (for example, the headings dropdown): its items are rendered as list item buttons, and the item selected while navigating the list with the keyboard is indicated with a focus-style ring instead of the "on" background.

If you customized the mention list appearance, note two CSS hook changes: the selected item is no longer marked with the `ck-on` class (it now uses the `ck-mentions__item_focused` class on the list item), and every item, including custom-rendered ones, now carries the `ck-list-item-button` class.
