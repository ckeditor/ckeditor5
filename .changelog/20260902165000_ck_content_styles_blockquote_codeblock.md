---
type: Minor breaking change
scope:
  - ckeditor5-block-quote
  - ckeditor5-code-block
see:
  - https://github.com/ckeditor/ckeditor5/issues/19910
---

Block quotes and code blocks now use lighter border and background colors. As these are content styles, the change also affects already-published content. To restore the previous colors, add this CSS after the editor content styles:

```css
.ck-content blockquote {
	border-left: solid 5px hsl(0, 0%, 80%);
}

.ck-content[dir="rtl"] blockquote {
	border-right: solid 5px hsl(0, 0%, 80%);
}

.ck-content pre {
	background: hsla(0, 0%, 78%, 0.3);
	border: 1px solid hsl(0, 0%, 77%);
}
```
