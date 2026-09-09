---
type: Minor breaking change
scope:
  - ckeditor5-ui
  - ckeditor5-fullscreen
see:
  - https://github.com/ckeditor/ckeditor5/issues/3891
---

Every editor stylesheet now declares its CSS variables on both `:root` and `:host`, so overriding a variable on `:root` no longer affects an editor inside a shadow root. Override it on the shadow host element instead, and declare the variables of a custom stylesheet on both selectors. See the ["Styles inside a shadow DOM"](https://ckeditor.com/docs/ckeditor5/latest/getting-started/setup/css.html#styles-inside-a-shadow-dom) section of the CSS guide.

The few rules that have to reach the light DOM are no longer shipped in the theme stylesheets. They are technical classes such as `ck-fullscreen-scroll-locked`, which locks the page scroll, and they are adopted into the document at runtime instead, so overriding one of them may need higher specificity than before.
