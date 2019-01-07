---
menu-title: CSS Frameworks
category: builds-integration-frameworks
order: 50
---

# Compatibility with CSS Frameworks

Some of popular CSS Frameworks uses stronger [CSS Specificity](https://developer.mozilla.org/en-US/docs/Web/CSS/Specificity) of their components that's why sometimes it can overrides CKEditor 5 elements like floating balloons (e.g. URL input).

## Compatibility with Bootstrap

In order to display CKEditor 5 inside [Bootstrap](https://getbootstrap.com/) modals you need to proceed as follows:

* Configure the `z-index` of CKEditor 5 floating balloons so they are displayed above the Bootstrap overlay.
* Configure Bootstrap to not steal focus from rich text editor fields.

The above can be ensured by adding this CSS:

```css
/* We need to handle floating elements inside modals to display them above Bootstrap components. */
:root {
	--ck-z-default: 100;
	--ck-z-modal: calc( var(--ck-z-default) + 999 );
}
```

And passing the [`focus: false`](https://getbootstrap.com/docs/4.1/components/modal/#options) option to Bootstrap's `modal()` function:

```js
$( '#modal-container' ).modal( {
	focus: false
} );
```

Check out the demo on https://codepen.io/ckeditor/pen/vzvgOe.

## Compatibility with Foundation

Currently, except `z-index` issue with [Reveal component](https://foundation.zurb.com/sites/docs/reveal.html) there are no obstacles to use CKEditor 5 with [Foundation](https://foundation.zurb.com/sites.html).

```css
/* We need to handle floating elements inside modals to display them above Foundation components. */
:root {
	--ck-z-default: 100;
	--ck-z-modal: calc( var(--ck-z-default) + 999 );
}
```

Check out the demo on https://codepen.io/ckeditor/pen/VqXYQq.

## Compatibility with Materialize

If you want to play CKEditor 5 with [Materialize.css](https://materializecss.com/) modals then like in Bootstrap case you need to handle `z-index` issues. Additionally, at this moment we have found one issue related to the `.ck-input` appearance where Materialize overrides it.

Configuring modals, you need to handle stealing focus issue and pass [`dismissible: false`](https://materializecss.com/modals.html#options) option.

```js
M.Modal.init( modal, { dismissible: false } );

// or jQuery way
$( '#modal-container' ).modal( {
	dismissible: false
} );
```

```css
/* We need to handle floating elements inside modals to display them above Materialize components. */
:root {
	--ck-z-default: 100;
	--ck-z-modal: calc( var(--ck-z-default) + 999 );
}

/* We need to overwrite default input design in materialize.css.
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

Check out the demo on https://codepen.io/ckeditor/pen/gZebwy.
