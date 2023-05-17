---
category: licensing
order: 30
meta-description: Managing the "Powered by CKEditor" logo
---

# Managing the "Powered by CKEditor" logo

## Why the "Powered by CKEditor" logo?

Starting from version v38.0.0 onwards, all **open source installations** of CKEditor 5 (free users) carry a small “Powered by CKEditor” logo in the bottom right corner of the editing area. The label links directly to the [CKEditor website](https://ckeditor.com/). The new branding approach is designed to make sure the entire community knows who is powering and modernizing their rich text editor. You can [read more about it](https://github.com/ckeditor/ckeditor5/issues/14082) on GitHub.

{@img assets/img/powered-by-ckeditor.png Placement of the "Powered by CKEditor" logo within the editor}

The logo **will not be visible to customers with commercial licenses**, but please read on as certain actions need to be taken to white-label your CKEditor 5 installation. You can reach out to our Technical Support team, using [this form](https://ckeditor.com/contact/), if you have any questions.

## How to remove the "Powered by CKEditor" logo?

In order to remove the logo, you need to obtain a commercial license and then configure the {@link module:core/editor/editorconfig~EditorConfig#licenseKey `config.licenseKey`} setting properly.

Please refer to the {@link support/obtaining-license-key Activating your product} guide for details on where to find the license key and how to use the key in your configuration.

## How to configure the layout of the "Powered by CKEditor" logo?

For open-source, free users, the "Powered by CKEditor" logo will always be displayed. There is, however, some degree of control over the watermark.

The following properties can be configured:

* position (the default is over the edge; it can be also displayed inside the container)
* logo offset towards the configured editable's corner
* alignment: left or right

To change the default position and display it inside the container use this configuration option:
```json
config.ui.poweredBy.position: "inside"
```

To customize the logo offset use following settings:

```json
config.ui.poweredBy.verticalOffset: 10,
config.ui.poweredBy.horizontalOffset: 10
```

where value is set in pixels.

To change the alignment:

```json
config.ui.poweredBy.side: "left"
```

The default option is `right`.

All above changes should be done in the {@link module:core/editor/editorconfig~EditorConfig editor config} file.

There is a set of ready-made CSS variables available dedicated to customizing the style of the "Powered by CKEditor" logo.

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

Below you will find an example on how the "Powered by CKEditor" logo can be customized:

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

body {
	background-color: hsl(0, 0%, 45%);
}
```

And

```json
config.ui.poweredBy.position: "inside"
```

The final effect:
{@img assets/img/powered-by-ckeditor-customized.png Placement of the customized "Powered by CKEditor" logo within the editor}
