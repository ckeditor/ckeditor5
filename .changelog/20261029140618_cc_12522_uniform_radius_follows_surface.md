---
type: Fix
scope:
  - ckeditor5-ui
---

Dropdown panels, dropdown menu panels, autocomplete results, the color selector, and list dropdown items now follow `--ck-border-radius-surface` set on `:root` (or `:host`), because `--ck-border-radius-uniform` derives from it. Override `--ck-border-radius-uniform` to set them apart.
