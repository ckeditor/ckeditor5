---
type: Other
scope:
  - ckeditor5-utils
---

Balloons, tooltips, and the block toolbar button are now placed next to what they point at when the editor or its overlay container (`config.ui.overlayContainer`) is slotted into a `position: fixed` element of a shadow tree, such as a modal `<dialog>`, a popover, or a fixed panel of a web component, also when a `display: contents` element sits between the slot and that element.
