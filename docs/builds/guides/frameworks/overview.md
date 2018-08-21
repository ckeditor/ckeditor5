---
category: builds-integration-frameworks
order: 10
menu-title: Overview
---

# Integrating CKEditor 5 with JavaScript frameworks

## Is CKEditor 5 compatible with framework XYZ?

Yes. CKEditor 5 is compatible with every JavaScript framework that we have heard of so far. CKEditor 5 is a JavaScript component (a pretty complex one but still) and does not require any uncommon techniques or technologies to be used. Threfore, unless the framework that you use has very untypical limitations, CKEditor 5 is compatible with it.

> How do I use CKEditor 5 with my framework?

While CKEditor 5 is compatible with your framework and initializing CKEditor 5 requires a single method call, integrating it with your framework may require using an existing or writing a new adapter (integration layer) that will communicate your framework with CKEditor 5.

When checking how to integrate CKEditor 5 with your framework you can follow these steps:

1. **Check whether an [official integration](#official-integrations) exists.**

	There are two official integrations so far – for {@link builds/guides/frameworks/react React} and for {@link builds/guides/frameworks/angular Angular 2+}.
2. **If not, search for community-driven integrations.** Most of them are available on [npm](https://www.npmjs.com/).
3. **If none exists, integrate CKEditor 5 with your framework yourself.**

	CKEditor 5 exposes a {@link builds/guides/integration/basic-api rich JavaScript API} which you can use to {@link builds/guides/integration/basic-api#creating-an-editor create} and {@link builds/guides/integration/basic-api#interacting-with-the-editor control it}.

## Official integrations

There are two official integrations so far:

* {@link builds/guides/frameworks/react CKEditor 5 component for React}
* {@link builds/guides/frameworks/angular CKEditor 5 component for Angular 2+}

Refer to their documentation to learn how to use them.

## Compatibility with Electron

Starting from version 11.0.0 CKEditor 5 is compatible with Electron. Using CKEditor 5 in Electron applications do not require any additional steps.

Check out a [sweet screencast of CKEditor 5 with real-time collaboration in Electron](https://twitter.com/ckeditor/status/1016627687568363520).

## Compatibility with Bootstrap

In order to display CKEditor 5 inside [Bootstrap](https://getbootstrap.com/) modals you need to configure two things:

* The `z-index` of CKEditor 5's floating balloons so they are displayed above the Bootstrap's overlay.
* Configure Bootstrap to not steal focus from CKEditor 5 fields.

The above can be ensured by adding this CSS:

```css
/*
	We need to add this CSS custom property to the body instead of :root,
	because of CSS specificity.
*/
body {
	--ck-z-default: 100;
	--ck-z-modal: calc( var(--ck-z-default) + 999 );
}

/*
	Override Bootstrap's CSS.
	Note: this won't be necessary once the following issue is fixed and released:
	https://github.com/ckeditor/ckeditor5-theme-lark/issues/189
*/
.ck.ck-button {
	-webkit-appearance: none;
}
```

And passing the `focus: false` option to Boostrap's `modal()` function:

```js
$( '#modal-container' ).modal( {
	focus: false
} );
```

Check out the demo on https://codepen.io/k0n0pka/pen/yqBXOz.
