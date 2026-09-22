---
type: Fix
scope:
  - ckeditor5-image
---

The image balloons (the text alternative form and the custom resize input) are now anchored to the nearest edge of the image instead of its center when centering the balloon would not fit. Previously, a balloon on a left- or right-aligned image could drift toward the middle of the editing area; it now stays next to the image.
