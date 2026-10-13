---
type: Fix
scope:
  - ckeditor5-ui
---

Fixed menu bar items sticking out of their menu panels on narrow viewports, such as most mobile phones. The larger default font size of the refreshed theme made the minimum width of the items exceed the maximum width of the panel.

The `--ck-menu-bar-menu-item-min-width` CSS variable now sets the minimum width of the whole menu panel and is capped by its maximum width. You can customize the maximum width with the new `--ck-menu-bar-panel-max-width` CSS variable (`75vw` by default).
