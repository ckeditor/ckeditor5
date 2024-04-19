---
category: integrations
meta-title: Integrating CKEditor 5 with other frameworks | CKEditor 5 documentation
order: 100
menu-title: Other
---

# Integrating CKEditor&nbsp;5 with other frameworks

## Compatibility with Electron

CKEditor&nbsp;5 is compatible with Electron. Using CKEditor&nbsp;5 in Electron applications does not require any additional steps.

Check out a [sweet screencast of CKEditor&nbsp;5 with real-time collaborative editing in Electron](https://twitter.com/ckeditor/status/1016627687568363520).

## Compatibility with Ionic and Cordova

CKEditor&nbsp;5 is compatible with the [Ionic framework](https://ionicframework.com/) and [Cordova](https://cordova.apache.org/). However, by default, Ionic disables `user-select`, which [blocks typing via the virtual keyboard](https://github.com/ckeditor/ckeditor5/issues/701). You should set this property to `text` on the CKEditor component. Update your style sheet with the following code:

```css
ckeditor {
	-webkit-user-select: text;
	user-select: text
}
```
