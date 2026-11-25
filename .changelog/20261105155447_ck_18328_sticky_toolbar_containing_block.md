---
type: Fix
scope:
  - ckeditor5-ui
closes:
  - https://github.com/ckeditor/ckeditor5/issues/18328
---

The sticky toolbar is now positioned correctly when an ancestor of the editor becomes the containing block of fixed elements, for example, because it has a CSS transform, a filter, layout containment, or a `will-change` declaration. Before, the toolbar was placed at the wrong offset and scrolled away with the content in such a layout.
