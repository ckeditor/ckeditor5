---
type: Fix
scope:
  - ckeditor5-ui
closes:
  - https://github.com/ckeditor/ckeditor5-commercial/issues/10971
---

Fixed the `'auto'` panel position of `DropdownView` so it no longer picks a position that fits the browser viewport but is clipped by, or forces extra scrolling in, a scrollable ancestor.

`DropdownView` now accepts an optional `panelPositionLimiter` property (an element or a callback returning one). When set, the `'auto'` position calculation takes the limiter's visible bounds into account in addition to the viewport. The dropdown button's rounded corners were also fixed to follow the panel side when it opens above the button.
