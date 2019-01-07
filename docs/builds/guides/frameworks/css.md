---
menu-title: CSS Frameworks
category: builds-integration-frameworks
order: 50
---

# Compatibility with CSS Frameworks

CKEditor 5 is compatible with most of the popular CSS frameworks. However, to properly integrate with some of them, additional tweaks may be necessary. This is mostly due to the fact that:
* CSS frameworks often use higher [CSS Specificity](https://developer.mozilla.org/en-US/docs/Web/CSS/Specificity) in their style sheets and override default editor styles, distorting the user interface,
* modal components of various UI frameworks use high `z-index` values in their styles and render over (cover) the UI of CKEditor 5,
* framework modals use aggressive focus management policy which breaks the input fields in the editor (e.g. link input).

In this guide, you will learn how to address those integration issues and use the CKEditor 5 WYSIWYG editor with the most popular front–end frameworks.

## Compatibility with Bootstrap

We noticed that [Bootstrap](https://getbootstrap.com) modals cover the UI of the editor and break the input fields. Knowing that you will need to take the following steps to get CKEditor 5 working in the Bootstrap environment:

* configure the `z-index` of the floating editor UI (e.g. balloons) so it is displayed over the Bootstrap overlay,
* configure Bootstrap so it stops "stealing" the focus from the rich text editor input fields.

To address the first issue, add the following styles to your application:

```css
/*
 * Configure the z-index of the editor's UI, so when inside a Bootstrap
 * modal, it will be rendered over the modal.
 */
:root {
	--ck-z-default: 100;
	--ck-z-modal: calc( var(--ck-z-default) + 999 );
}
```

Pass the [`focus: false`](https://getbootstrap.com/docs/4.1/components/modal/#options) option to Bootstrap's `modal()` function to fix the second issue:

```js
$( '#modal-container' ).modal( {
	focus: false
} );
```

[Check out the demo](https://codepen.io/ckeditor/pen/vzvgOe).

## Compatibility with Foundation

CKEditor 5 requires some minor adjustments to the `z-index` of the UI to work property with [Foundation](https://foundation.zurb.com/sites.html) (also with [Reveal](https://foundation.zurb.com/sites/docs/reveal.html) modal).

```css
/*
 * Configure the z-index of the editor's UI, so when inside a Reveal modal,
 * it will be rendered over the modal.
 */
:root {
	--ck-z-default: 100;
	--ck-z-modal: calc( var(--ck-z-default) + 999 );
}
```

[Check out the demo](https://codepen.io/ckeditor/pen/VqXYQq).

## Compatibility with Materialize

If you want to use CKEditor 5 with [Materialize.css](https://materializecss.com/) you will need to take the following steps:

* configure the base `z-index` of the floating editor UI so it is displayed over the Materialize modals,
* bring back the default `.ck-input` class appearance (because Materialize overrides it with higher specificity),
* configure modals so they stop "stealing" the focus from the rich text editor input fields.

Use the following CSS to address the issues with the `z-index` and selector specificity:

```css
/*
 * Configure the z-index of the editor's UI, so when inside a Materialize modal,
 * it will be rendered over the modal.
 */
:root {
	--ck-z-default: 100;
	--ck-z-modal: calc( var(--ck-z-default) + 999 );
}

/*
 * Bring back the default CKEditor 5 input appearance by overriding high–specificity styles
 * brought by materialize.css.
 *
 * See: https://github.com/Dogfalo/materialize/blob/v1-dev/sass/components/forms/_input-fields.scss#L10-L40
 */
.ck input.ck-input.ck-input-text {
	box-shadow: var(--ck-inner-shadow),0 0;
	background: var(--ck-color-input-background);
	border: 1px solid var(--ck-color-input-border);
	padding: var(--ck-spacing-extra-tiny) var(--ck-spacing-medium);
	transition-property: box-shadow,border;
	transition: .2s ease-in-out;

	height: inherit;
	width: inherit;
	font-size: inherit;
	margin: 0;
	box-sizing: border-box;
}

.ck input.ck-input.ck-input-text:focus {
	border: var(--ck-focus-ring);
	box-shadow: var(--ck-focus-outer-shadow),var(--ck-inner-shadow);
}
```

To change the behavior of the modals and prevent them from "stealing" the focus, use [`dismissible: false`](https://materializecss.com/modals.html#options) option.

```js
M.Modal.init( modal, { dismissible: false } );

// Or "jQuery way".
$( '#modal-container' ).modal( {
	dismissible: false
} );
```

[Check out the demo](https://codepen.io/ckeditor/pen/gZebwy).

## Compatibility with Semantic-UI

CKEditor 5 works properly with [Semantic-UI](https://semantic-ui.com/) after a small CSS tweak. To use the {@link builds/guides/overview#balloon-editor balloon editor} inside a modal, it is necessary to configure the `z-index` property of the floating editor UI to make it render over the modal:

```css
/*
 * Configure the z-index of the editor's UI, so when inside a Semantic-UI modal,
 * it will be rendered over the modal.
 */
:root {
	--ck-z-default: 100;
	--ck-z-modal: calc( var(--ck-z-default) + 999 );
}
```

[Check out the demo](https://codepen.io/ckeditor/pen/OrZBpV).
