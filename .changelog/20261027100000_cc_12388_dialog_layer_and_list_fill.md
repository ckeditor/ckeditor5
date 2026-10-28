---
type: Fix
scope:
  - ckeditor5-ui
  - ckeditor5-mention
  - ckeditor5-emoji
  - ckeditor5-ckbox
---

Dialogs, and the mention list, the emoji picker, and CKBox shown above them, now follow the `--ck-layer-dialog` CSS custom property instead of reading the legacy `--ck-z-dialog` directly, so raising the dialog layer moves them together. Set `--ck-z-dialog` or `--ck-layer-dialog` on `:root` (or `:host` in a shadow root), or override `--ck-layer-dialog` on a narrower selector: a scoped override of the legacy `--ck-z-dialog` no longer applies. The selected item in lists now reads the `--ck-color-interactive-primary-surface` fill role instead of a text role. It looks the same in the default theme, but now follows the primary color (`--ck-color-base-action`) rather than the accent text color, so lightening `--ck-color-text-accent` for contrast no longer lightens its background.
