---
category: licensing
order: 30
meta-title: CKEditor 5 support documentation
meta-description: Learn how to get help and support and how to provide feedback.
---

# Managing the "Powered by CKEditor" logo

## Why the "Powered by CKEditor" logo?

Starting from version v38.0.0 onwards, all **open source installations** of CKEditor 5 (free users) carry a small “Powered by CKEditor” logo in the bottom right corner of the editing area. The label links directly to the [CKEditor website](https://ckeditor.com/) and while it may be a little frustrating to some, this new branding approach is designed to make sure the entire community knows who is powering and modernizing their rich text editor.

{@img assets/img/powered-by-ckeditor.png Placement of the "Powered by CKEditor" logo within the editor}

We are absolutely committed to keeping CKEditor free and open source and plan to maintain it for many years to come. But all that comes at a cost. Currently, we hire well over 20 full-time employees who contribute to CKEditor every day. We are also 8 years into the development of the project (and 20 years if you count all CKEditor versions).

This change **does not affect customers with commercial licenses**, but please read on as certain actions need to be taken. You can reach out to our Technical Support team, using [this form](https://ckeditor.com/contact/), if you have any questions.

## How to remove the "Powered by CKEditor" logo?

In order to remove the logo, you need to configure the `config.licenseKey` setting properly. You will find the new license key in the [CKEditor 5 Ecosystem dashboard](https://dashboard.ckeditor.com/login).

<info-box warning>
	Licensed users will now have **two** license keys available in their CKEditor Environment Dashboard.
</info-box>

The old license key works for all versions of CKEditor 5 older than v38.0.0. These versions do not display the "Powered by CKEditor" footer logo, so there is **no need** to introduce any changes unless you update the editor. The key will be valid until expired according to due agreement.

The new key available is the new format license key that is **only** valid for versons 38.0.0 or newer.

Please refer to the the {@link support/obtaining-license-key Activating your product} guide in the support section for details on where to find the authentication data.

## How to configure the layout of the "Powered by CKEditor" logo?

For open source, free users, the "Powered by CKEditor" logo will always be displayed. There is, however, some degree of control over the watermark.

The following properties can be configured:

* position (the default is inside the container; it can be also displayed over the edge)
* logo offset
* alignment: left or right

To change the default position and display it over the edge use this configuration option:
```json
config.ui.poweredBy.position: "border"
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

All aboves changes should be done in the {@link module:core/editor/editorconfig~EditorConfig editor config} file.

There a set of ready-made CSS variables available dedicated to customize the style of the "Powered by CKEditor" logo.

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

Below you will find and example how the "Powered by CKEditor" logo can be customized:

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
config.ui.poweredBy.position: "border"
```

Final effect:
{@img assets/img/powered-by-ckeditor-customized.png Placement of the customized "Powered by CKEditor" logo within the editor}
