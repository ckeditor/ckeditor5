---
type: Minor breaking change
scope:
  - ckeditor5-utils
see:
  - https://github.com/ckeditor/ckeditor5/issues/3891
---

The `getPositionedAncestor()` DOM utility function now returns `null` for an element that is not connected to a document, where it previously required only that the element had a parent.

It also behaves differently in these cases:

* It returns `<body>` when a style such as `position: relative` or `transform` makes the body the containing block. Previously, it returned `null` for the main document's `<body>` in every case.
* For an element inside an iframe, it returns `null` instead of the iframe's static `<body>`, as it already did in the main document.
* For an element assigned to a `<slot>`, it looks for the positioned ancestor in the shadow tree that renders the element.
