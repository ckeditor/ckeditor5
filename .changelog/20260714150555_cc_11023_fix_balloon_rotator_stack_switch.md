---
type: Fix
scope:
  - ckeditor5-ui
closes:
  - https://github.com/ckeditor/ckeditor5-commercial/issues/11023
---

Fixed the contextual balloon closing unexpectedly when using its "Previous" and "Next" navigation buttons. Clicking these buttons no longer moves focus out of the editor, so focus-sensitive views such as the balloon toolbar stay visible.
