---
type: Minor breaking change
scope:
  - ckeditor5-engine
see:
  - https://github.com/ckeditor/ckeditor5/issues/3891
---

The `ViewRenderer#domDocuments` property has been removed. A set of documents can no longer describe where an editor renders, because an editing root may live in a shadow root instead. The renderer tracks the editing root elements themselves now, in a private property, and there is no public replacement.
