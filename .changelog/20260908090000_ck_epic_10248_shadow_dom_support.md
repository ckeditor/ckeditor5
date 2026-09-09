---
type: Feature
scope:
  - ckeditor5
closes:
  - https://github.com/ckeditor/ckeditor5/issues/3891
---

The editor can now be created inside a shadow root, open or closed: selection, focus, positioning, scrolling, drag and drop, and the floating user interface all work there. The premium features work in a shadow root as well.

Because a shadow root is a separate styling boundary, the editor stylesheets have to be loaded into every root that holds editor user interface, and CSS variables have to be overridden on the shadow host rather than on `:root`. See the ["Styles inside a shadow DOM"](https://ckeditor.com/docs/ckeditor5/latest/getting-started/setup/css.html#styles-inside-a-shadow-dom) section of the CSS guide.
