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

We are absolutely committed to keeping CKEditor free and open source and plan to maintain it for many years to come. But all that comes at a cost. Currently, we hire well over 20 full-time employees who contribute to CKEditor every day. We ere also 8 years into the development of the project (and 20 years if you count all CKEditor versions).

This change **does not affect customers with commercial licenses**, but please read on as certain actions need to be taken. You can reach out to our Technical Support team, using [this form](https://ckeditor.com/contact/), if you have any questions.

## How to remove the "Powered by CKEditor" logo?

In order to remove the logo, you need a commercial license for CKEditor 5. If you need one, please [contact us](https://ckeditor.com/) for a tailored offer. If you already have one, please read on.

### Stand-alone features

If you already have a commercial license for one of the **stand-alone features**, you need to configure the `config.licenseKey` setting properly.

This concerns users holding licences for the following standalone options:
* Non real-time collaboration features, including:
	* {@link features/track-changes Track changes}
	* {@link features/comments Comments}
	* {@link features/revision-history Revision history}
* {@link features/pagination Pagination}
* The productivity pack including:
	* {@link features/template Content templates}
	* {@link features/document-outline Document outline}
	* {@link features/format-painter Format painter}
	* {@link features/slash-commands Slash commands}
	* {@link features/table-of-contents Table of contents}

<info-box warning>
	Licensed users will now have **two** license keys available in their CKEditor Environment Dashboard.
</info-box>

The old lincense key works for all version of CKEditor 5 older than v38.0.0. These versions do not display the "Powered by CKEditor" footer logo, so there is **no need** to introduce any changes unless you update the editor. The key will be valid until expired according to due agreement.

The new key available is the new format license key that is **only** valid for versons 38.0.0 or newer. It needs to replace the current key set up in the editor configuration if it is updated to v38.0.0 or newer.

Please refer to the the {@link support/obtaining-license-key Activating your product} guide in the support section for details on where to find the authentication data and how to configure this setting properly.

### SaaS features

Features and services secured on the server side **do not need any additional actions**, the change will be held automatically. This concerns the following features:
* Real time collaboration
* Real time comments
* Real time revision history
* Real time track changes
* Export to PDF
* Export to Word
* Import from Word

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
