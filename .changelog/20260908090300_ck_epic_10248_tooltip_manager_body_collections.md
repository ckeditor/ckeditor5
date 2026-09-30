---
type: Feature
scope:
  - ckeditor5-ui
see:
  - https://github.com/ckeditor/ckeditor5/issues/3891
---

The body collection into which the shared tooltip balloon is placed can be chosen now, through the new `TooltipManager#registerBodyCollection( bodyCollection, options )` and `TooltipManager#unregisterBodyCollection( bodyCollection )` methods. A component that renders tooltip-bearing user interface outside an editor can therefore display tooltips inside its own DOM tree, including a shadow root, even when there is no editor on the page.
