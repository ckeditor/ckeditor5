---
type: Feature
scope:
  - ckeditor5-media-embed
closes:
  - https://github.com/ckeditor/ckeditor5/issues/6593
---

Introduced the media embed resize feature that allows users to resize embedded media via drag handles.

Provider iframes are now generated with `aspect-ratio` CSS instead of a `padding-bottom` wrapper, and providers can opt out of resizing via the new `isResizable` option.
