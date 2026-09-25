---
type: Fix
scope:
    - ckeditor5-ui
---

Tooltips now work for editor user interfaces rendered in iframe and other non-global documents. The shared tooltip manager listens to every document registered by an editor body collection and renders the tooltip in the matching document.
