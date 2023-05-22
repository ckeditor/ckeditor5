---
category: licensing
order: 30
meta-description: Managing the "Powered by CKEditor" logo
---

# Managing the "Powered by CKEditor" logo

## Why the "Powered by CKEditor" logo?

Starting from version v38.0.0 onwards, all **open source** installations of CKEditor 5 display a small “Powered by CKEditor” logo in the bottom-right corner of the editing area. The label links directly to the [CKEditor website](https://ckeditor.com/). The new branding approach is designed to make sure the entire community knows who is powering and modernizing their rich text editor. You can [read more about it](https://github.com/ckeditor/ckeditor5/issues/14082) on GitHub.

{@img assets/img/powered-by-ckeditor.png Placement of the "Powered by CKEditor" logo within the editor}

This logo is only visible when the editor is focused and only in the editable. The editor needs to have a minimum size of 350px x 50px to display the logo. It will be shown in all editor types.

The logo **will not be displayed for customers with commercial licenses**, but please read on as certain actions need to be taken to white-label your CKEditor 5 installation. You can [reach out to our Technical Support team](https://ckeditor.com/contact/) if you have any questions.

## How to remove the "Powered by CKEditor" logo?

To remove the logo, you need to obtain a commercial license and then configure the {@link module:core/editor/editorconfig~EditorConfig#licenseKey `config.licenseKey`} setting.

Refer to the {@link support/license-key-and-activation License key and activation} guide for details on where to find the license key and how to use it in your configuration.

## How to configure the layout of the "Powered by CKEditor" logo?

For open source, free users, the "Powered by CKEditor" logo will always be displayed. There is, however, some degree of control over it.

Complete configuration reference is available in the {@link module:core/editor/editorconfig~EditorConfig#ui API documentation}. In short, you can configure the following properties:

* The **position** relative to the editor’s bottom edge. The default is over the edge. The logo can also be displayed inside the container.
* The logo **offset** toward the configured editable's corner.
* The **alignment**: left or right side of the editable area.

To change the default position and display the logo inside the container, use this configuration option:

```js
config.ui.poweredBy.position: 'inside'
```

To customize the logo offset, use the following settings:

```js
config.ui.poweredBy.verticalOffset: 10,
config.ui.poweredBy.horizontalOffset: 10
```

The value of the offset is set in pixels.

To change the alignment:

```js
config.ui.poweredBy.side: 'left'
```

The default option is `right`.

You can also customize the text displayed on the logo's label:

```js
config.ui.poweredBy.label: 'Created with'
```

All the above changes should be done in the {@link module:core/editor/editorconfig~EditorConfig editor configuration} file.

A set of ready-made CSS variables is available. You can use it to customize the style of the "Powered by CKEditor" logo.

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

### Customization example

Below you will find an example of how the "Powered by CKEditor" logo can be customized in CSS:

```css
/*
 * Customized values.
 */
:root {
	--ck-powered-by-line-height: 10px;
	--ck-powered-by-padding-vertical: 8px;
	--ck-powered-by-padding-horizontal: 12px;
	--ck-powered-by-text-color: hsl(133, 100%, 31%);
	--ck-powered-by-border-radius: 20px 0 0 0;
	--ck-powered-by-background: linear-gradient(57deg, hsla(181, 70%, 45%, 0) 0%, hsl(41, 98%, 58%) 100%);
	--ck-powered-by-border-color: hsl(0, 0%, 45%) transparent transparent hsl(0, 0%, 45%) ;
}
```

Here is an example of the editor's configuration:

```js
ClassicEditor
	.create( document.querySelector( '#editor' ), {
		/* ... */
		ui: {
			poweredBy: {
				position: 'inside'
			}
		}
	} )
	.then( /* ... */ )
	.catch( /* ... */ );
```

The final effect:
{@img assets/img/powered-by-ckeditor-customized.png Placement of the customized "Powered by CKEditor" logo within the editor}
