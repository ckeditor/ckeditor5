---
type: Feature
scope:
  - ckeditor5-list
  - ckeditor5-style
---

List item markers can now reflect the styles of the block that starts the list item, such as a heading or a block with a style from the style feature. Enable it with the new `list.enableListItemMarkerFromBlock` configuration option (disabled by default). The `<li>` element of such a list item then gets the `ck-list-marker-from-block` class in the editing view and in the editor data, and the marker is rendered by the block. The new `ListItemHeadingIntegration` plugin, loaded by `ListFormatting`, covers headings.

Other features can make the marker follow their blocks with the new `ListFormatting#registerMarkerFromBlockCheck()` method. Features that render their own list markers can opt out by listening to the decorated `ListFormatting#isMarkerFromBlock()` method.
