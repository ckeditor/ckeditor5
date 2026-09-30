---
type: Minor breaking change
scope:
  - ckeditor5-utils
see:
  - https://github.com/ckeditor/ckeditor5/issues/3891
---

The `getCommonAncestor()` DOM utility function has been removed from the `ckeditor5-utils` package. It walked `parentNode` chains, which stop at a shadow boundary, so it could not answer correctly for nodes inside a shadow root. To find the lowest common ancestor of two DOM nodes, walk their ancestors with `getParentNode()` and compare the chains, or use the model and view `getCommonAncestor()` methods when working with the editor tree.
