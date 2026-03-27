---
type: Minor breaking change
scope:
  - ckeditor5-engine
see:
  - https://github.com/ckeditor/ckeditor5/issues/19217
---

Deep schema verification during `model.insertContent()` is now enabled by default. It's no longer behind an experimental flag.

Previously, this behavior required opting in via `config.experimentalFlags.modelInsertContentDeepSchemaVerification: true`. Now it is always active, ensuring that all elements and attributes in inserted content follow the schema - including deeply nested structures.

If needed, you can temporarily opt out by setting `config.experimentalFlags.modelInsertContentDeepSchemaVerification: false`. Note that this option is **deprecated** and will be removed in a future release.
