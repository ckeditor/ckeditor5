---
type: Minor breaking change
scope:
  - ckeditor5-horizontal-line
see:
  - https://github.com/ckeditor/ckeditor5/issues/19910
---

Horizontal lines now use a lighter background color. As this is a content style, the change also affects already-published content. To restore the previous color, add this CSS after the editor content styles:

```css
.ck-content hr {
	background: hsl(0, 0%, 87%);
}
```
