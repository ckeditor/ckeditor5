---
category: licensing
order: 50
menu-title: Whitelabelling the editor
meta-title: Whitelabelling CKEditor 5 | CKEditor 5 Documentation
meta-description: Managing the "Powered by CKEditor" logo.
---

# Whitelabelling CKEditor&nbsp;5

## Why the "Powered by CKEditor" logo?

Starting from version [v38.0.0](https://github.com/ckeditor/ckeditor5/releases/tag/v38.0.0), all **open-source** installations of CKEditor&nbsp;5 display a small “Powered by CKEditor” logo in the bottom-right corner of the editing area. The label links directly to the [CKEditor website](https://ckeditor.com/). The new branding approach is designed to make sure the entire community knows who is powering and modernizing their rich text editor.

{@img assets/img/powered-by-ckeditor.png Placement of the "Powered by CKEditor" logo within the editor}

This logo is only visible when the editor is focused and only in the editable. The editor needs to have a minimum size of 350px x 50px to display the logo. It will be shown in all editor types. You can observe this behavior in practice in the demo editors further in this guide.

The logo **will not be displayed for customers with commercial licenses**, but please read on as certain actions need to be taken to white-label your CKEditor&nbsp;5 installation. You can [reach out to our Technical Support team](https://ckeditor.com/contact/) if you have any questions.

However, even as a paid customer, you can [keep the logo](#how-to-keep-the-powered-by-ckeditor-logo) if you wish.

## How to remove the "Powered by CKEditor" logo?

To remove the logo, you can obtain a commercial license and then configure the {@link module:core/editor/editorconfig~EditorConfig#licenseKey `config.licenseKey`} setting.

Refer to the {@link getting-started/licensing/license-key-and-activation License key and activation} guide for details on where to find the license key and how to use it in your configuration.

## How to keep the "Powered by CKEditor" logo?

If you wish to keep the "Powered by CKEditor" logo in your editor even if you are a paid customer (numerous reasons can play a factor here), you can do it easily. Just set the following option to `true` (by default it is set to `false`) and enjoy the branding!

```js
config.ui.poweredBy.forceVisible: true
```

## How to configure the layout of the "Powered by CKEditor" logo?

For free, open-source users, the "Powered by CKEditor" logo will always be displayed when the editor is in focus. You can, however, adjust some aspects of it to suit your editor integration better.

### Layout customization

You can configure the following properties of the logo:

* The **position** relative to the editor’s bottom edge. The default is over the edge. The logo can also be displayed inside the container.
* The logo **offset** relative to the configured editable element's corner.
* The **alignment**: left or right side of the editable area.
* The **label** text, displayed before the CKEditor logo.

The complete reference is available in the {@link module:core/editor/editorconfig~EditorConfig#ui API documentation}.

The example below shows how the logo can be adjusted using the available editor configuration. Focus the editor to display the customized logo.

{@snippet support/managing-ckeditor-logo-position}

And this is the configuration code necessary:

```js
ClassicEditor
	.create( document.querySelector( '#editor' ), {
		/* ... */
		ui: {
			poweredBy: {
				position: 'inside',
				side: 'left',
				label: 'This is'
			}
		}
	} )
	.then( /* ... */ )
	.catch( /* ... */ );
```

### Styling customization

A set of ready-made CSS variables is available for integrators. You can use it to customize the style of the "Powered by CKEditor" logo.

```css
/*
 * Default values.
 */
:root {
	--ck-powered-by-line-height: 10px;
	--ck-powered-by-padding-vertical: 2px;
	--ck-powered-by-padding-horizontal: 4px;
	--ck-powered-by-text-color: hsl(0, 0%, 31%);
	--ck-powered-by-border-radius: 100px;
	--ck-powered-by-background: hsl(0, 0%, 100%);
	--ck-powered-by-border-color: var(--ck-color-focus-border);
}
```

If you need, you can dive even deeper to make it coherent with your product. For instance, this is how the logo can be modified to fit the "dark mode" theme.

{@snippet support/managing-ckeditor-logo-styling}

It was achieved with just a few style rules:

```css
	/* "Powered by CKEditor" logo customization. */
	.ck.ck-balloon-panel.ck-powered-by-balloon {
		/* You can use your own variables here as well. */
		--ck-powered-by-background: hsl(270, 1%, 29%);
		--ck-powered-by-border-color: hsl(270, 1%, 29%);
	}

	.ck.ck-balloon-panel.ck-powered-by-balloon .ck.ck-powered-by .ck-powered-by__label {
		text-transform: none;
		font-family: var(--main-font-family);
		padding-left: 2px;
		color: var(--main-text-color);
	}

	.ck.ck-balloon-panel.ck-powered-by-balloon .ck.ck-powered-by .ck-icon {
		filter: brightness(10);
	}
```

Refer to the {@link framework/theme-customization Theme customization} guide to learn how to adjust the editor theme.
