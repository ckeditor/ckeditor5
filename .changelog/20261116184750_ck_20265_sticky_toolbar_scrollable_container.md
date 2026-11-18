---
type: Fix
scope:
  - ckeditor5-editor-classic
  - ckeditor5-engine
  - ckeditor5-utils
closes:
  - https://github.com/ckeditor/ckeditor5/issues/20265
---

The sticky toolbar of the classic editor no longer covers the selection when the editor is placed in a scrollable container and the toolbar sticks to the top of that container. Before, the container was scrolled so that the selection ended up behind the toolbar. Integrations with their own sticky UI can use the new `getAncestorScrollPadding` option of the `EditingView#scrollToTheSelection` event data for the same purpose.
