---
category: builds-integration-frameworks
order: 10
menu-title: Overview
---

# Integrating CKEditor 5 with JavaScript frameworks

## Is CKEditor 5 compatible with framework XYZ?

Yes. CKEditor 5 is compatible with every JavaScript framework that we have heard of so far. CKEditor 5 is a JavaScript rich text editing component (a pretty complex one but still) and it does not require any uncommon techniques or technologies to be used. Therefore, unless the framework that you use has very not typical limitations, CKEditor 5 is compatible with it.

> How do I use CKEditor 5 with my framework?

While CKEditor 5 is compatible with your framework and initializing it requires a single method call, integrating CKEditor 5 with your framework may require using an existing or writing a new adapter (integration layer) that will communicate your framework with CKEditor 5.

When checking how to integrate CKEditor 5 with your framework you can follow these steps:

1. **Check whether an [official integration](#official-wysiwyg-editor-integrations) exists.**

	There are three official integrations so far: for {@link builds/guides/frameworks/react React}, {@link builds/guides/frameworks/angular Angular}, and for {@link builds/guides/frameworks/vuejs Vue.js}.
2. **If not, search for community-driven integrations.** Most of them are available on [npm](https://www.npmjs.com/).
3. **If none exists, integrate CKEditor 5 with your framework by yourself.**

	CKEditor 5 offers {@link builds/guides/overview ready-to-use builds} that expose a {@link builds/guides/integration/basic-api rich JavaScript API} which you can use to {@link builds/guides/integration/basic-api#creating-an-editor create editors} and {@link builds/guides/integration/basic-api#interacting-with-the-editor control them}.

## Official WYSIWYG editor integrations

There are three official integrations so far:

* {@link builds/guides/frameworks/angular CKEditor 5 rich-text editor for Angular}
* {@link builds/guides/frameworks/react CKEditor 5 rich-text editor for React}
* {@link builds/guides/frameworks/vuejs CKEditor 5 rich-text editor for Vue.js}

Refer to their documentation to learn how to use them.

We plan to provide more integrations with time. We would like to [hear your ideas](https://github.com/ckeditor/ckeditor5/issues/1002) what we should work on next.

## Compatibility with Electron

Starting from version 11.0.0 CKEditor 5 is compatible with Electron. Using CKEditor 5 in Electron applications does not require any additional steps.

Check out a [sweet screencast of CKEditor 5 with real-time collaborative editing in Electron](https://twitter.com/ckeditor/status/1016627687568363520).

## Compatibility with Ionic and Cordova

CKEditor 5 is compatible with [Ionic framework](https://ionicframework.com/) and [Cordova](https://cordova.apache.org/). However, by default Ionic disables `user-select`, which [blocks typing via the virtual keyboard](https://github.com/ckeditor/ckeditor5/issues/701). It is required to set this property to `text` on the CKEditor component. Just update your stylesheet with the following code:

```css
ckeditor {
	-webkit-user-select: text;
	user-select: text
}
```
