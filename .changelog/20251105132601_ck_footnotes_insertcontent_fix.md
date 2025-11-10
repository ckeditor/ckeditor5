---
type: Other 
scope:
  - ckeditor5-engine
closes:
  - https://github.com/ckeditor/ckeditor5/issues/19217
---

Introduced the `experimentalFlags` configuration option that allows enabling or disabling specific experimental behaviors in CKEditor 5.

Added a new experimental flag: `modelInsertContentDeepSchemaVerification`. When enabled, the editor performs a deep schema verification 
during `model.insertContent()` operations, ensuring that inserted content fully complies with the editor’s schema even in complex 
or nested contexts.
