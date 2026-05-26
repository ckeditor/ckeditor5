---
type: Other
scope:
  - ckeditor5-image
closes:
  - https://github.com/ckeditor/ckeditor5/issues/20047
---

Inline images are no longer allowed in roots (or other limit elements) that do not accept block content, such as `$inlineRoot` and any plugin-registered custom inline-only root. The rule is structural rather than name-based, so it also applies to custom limit element types contributed by integrators. This is a temporary guard until image type conversion (block to inline and back) can react to the surrounding context.
