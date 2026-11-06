---
type: Fix
scope:
  - ckeditor5-clipboard
---

The drag and drop target line is now shown in the right place when the editor's overlay layer is placed in a positioned or scrolled container, for example, when the editor is in a scrollable shadow tree. Before, the line was moved by the container's offset and moved twice as far as the content when the container was scrolled.
