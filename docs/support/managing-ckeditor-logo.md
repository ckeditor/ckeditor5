---
category: licensing
order: 30
meta-description: Managing the "Powered by CKEditor" logo
---

# Managing the "Powered by CKEditor" logo

## Why the "Powered by CKEditor" logo?

Starting from version v38.0.0 onwards, all **open-source** installations of CKEditor 5 display a small “Powered by CKEditor” logo in the bottom-right corner of the editing area. The label links directly to the [CKEditor website](https://ckeditor.com/). The new branding approach is designed to make sure the entire community knows who is powering and modernizing their rich text editor.

{@img assets/img/powered-by-ckeditor.png Placement of the "Powered by CKEditor" logo within the editor}

This logo is only visible when the editor is focused and only in the editable. The editor needs to have a minimum size of 350px x 50px to display the logo. It will be shown in all editor types. You can observe this behavior in practice in the demo editors further in this guide.

The logo **will not be displayed for customers with commercial licenses**, but please read on as certain actions need to be taken to white-label your CKEditor 5 installation. You can [reach out to our Technical Support team](https://ckeditor.com/contact/) if you have any questions.

## How to remove the "Powered by CKEditor" logo?

To remove the logo, you need to obtain a commercial license and then configure the {@link module:core/editor/editorconfig~EditorConfig#licenseKey `config.licenseKey`} setting.

Refer to the {@link support/license-key-and-activation License key and activation} guide for details on where to find the license key and how to use it in your configuration.

## How to configure the "Powered by CKEditor" logo?

For free, open source users, the "Powered by CKEditor" logo will always be displayed when the editor is in focus. You can, however, adjust some aspects of it to suit your editor integration better.

### Layout customization

You can configure the following properties of the logo:

* The **position** relative to the editor’s bottom edge. The default is over the edge. The logo can also be displayed inside the container.
* The logo **offset** relative to the configured editable's corner.
* The **alignment**: left or right side of the editable area.
* The **label** text, displayed before the CKEditor logo.

The complete reference is available in the {@link module:core/editor/editorconfig~EditorConfig#ui API documentation}.

The example below shows how the logo can be adjusted using just the available editor configuration.

{@snippet build-classic-source}

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
	/* PoweredBy logo customization. */
	.ck.ck-balloon-panel.ck-powered-by-balloon {
		--ck-powered-by-background: hsl(270, 1%, 29%); /* You can use your own variable here as well. */
		--ck-powered-by-border-color: hsl(270, 1%, 29%); /* You can use your own variable here as well. */
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

<info-box>
	To see how to customize the editor theme, read a {@link framework/theme-customization dedicated guide}.
</info-box>
