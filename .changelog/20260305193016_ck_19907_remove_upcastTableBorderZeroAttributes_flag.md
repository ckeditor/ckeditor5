---
type: Minor breaking change
scope:
  - ckeditor5-table
see:
  - https://github.com/ckeditor/ckeditor5/issues/19038
---

Tables with the legacy `border="0"` HTML attribute are now normalized on upcast — the attribute is converted to an explicit `0px` border width.

If you had `config.experimentalFlags.upcastTableBorderZeroAttributes` set in your configuration, remove it — the flag is no longer recognized.
