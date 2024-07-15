---
category: setup
order: 80
meta-title: License key and activation | CKEditor 5 Documentation
menu-title: License key and activation
---

# License key and activation

This article explains how to activate a commercial license of CKEditor&nbsp;5 and the following CKEditor premium features:

* Asynchronous collaboration features, including:
	* {@link features/track-changes Track changes}
	* {@link features/comments Comments}
	* {@link features/revision-history Revision history}
* {@link features/pagination Pagination}
* {@link features/ai-assistant-overview AI Assistant}
* {@link features/multi-level-lists Multi-level list}
* The Productivity Pack that includes:
	* {@link features/case-change Case change}
	* {@link features/document-outline Document outline}
	* {@link features/format-painter Format painter}
	* {@link features/paste-from-office-enhanced Paste from Office enhanced}
	* {@link features/slash-commands Slash commands}
	* {@link features/table-of-contents Table of contents}
	* {@link features/template Templates}

Other premium features such as {@link features/real-time-collaboration real-time collaboration}, {@link features/export-word export to Word}, {@link features/export-pdf export to PDF}, or {@link features/import-word import from Word} are authenticated on the server side. Please refer to respective feature guides for installation details.

<info-box>
	CKEditor&nbsp;5 (without premium features listed above) can be used without activation as {@link support/license-and-legal open source software under the GPL license}. It will then {@link getting-started/setup/managing-ckeditor-logo display a small "Powered by CKEditor" logo} in the editor area.
</info-box>

## Obtaining a license

To activate CKEditor&nbsp;5 and the premium features listed above, you will need either an active commercial license or a trial license.

### Purchasing a commercial license

If you wish to purchase a commercial CKEditor&nbsp;5 license or a license to one of the premium features, [contact us](https://ckeditor.com/contact/?sales=true#contact-form) to receive an offer tailored to your needs.

### Subscribing to the CKEditor Premium Features free trial

If you wish to test our offer, you can create an account by [signing up for CKEditor Premium Features 30-day free trial](https://orders.ckeditor.com/trial/premium-features). After signing up, you will receive access to the customer dashboard (CKEditor Ecosystem dashboard).

The trial is commitment-free, and there is no need to provide credit card details to start it. The Premium Features free trial allows you to test all paid CKEditor Ecosystem products at no cost.

If you are using the trial, refer to the [CKEditor&nbsp;5 Premium Features free trial documentation](https://ckeditor.com/docs/trial/latest/guides/overview.html) to learn how to access the relevant license key and activate the premium features.

## Obtaining a license key

Follow this guide to get the license key necessary to activate your purchased premium features or to white-label CKEditor&nbsp;5 (remove the "Powered by CKEditor" logo).

### Log in to the CKEditor Ecosystem dashboard

Log in to the [CKEditor Ecosystem dashboard](https://dashboard.ckeditor.com). If this is the first time you do it, you will receive a confirmation email and will be asked to create a password for your account. Keep it safe.

### Access the account dashboard

After logging in, click "CKEditor" under the "Your products" header on the left. You will see the overview of the subscription parameters together with the management area below.

{@img assets/img/ckeditor-dashboard.png 920 Your CKEditor subscriptions in the customer dashboard.}

### Copy the license key

After clicking "Manage," you can access the license key needed to run the editor and the premium features. Note that the same license key will be valid for both the Productivity Pack and other standalone features, as well as CKEditor&nbsp;5 itself.

{@img assets/img/ckeditor-key.png 822 Premium features license key in the management console.}

There are two license keys available:
1. The old key for versions older than 38.0.0.
2. The new key for versions 38.0.0 and later.

The new key available is the new format license key that is **only** valid for versions 38.0.0 or later. The old key will work with all CKEditor&nbsp;5 versions up to the version to be released in May 2024 (when we consider removing support for these keys) as long as the key is not expired.

<info-box>
	Please note that the Premium Features Free Trial dashboard only provides one license key. This key is meant to work with the most recent version of CKEditor&nbsp;5.
</info-box>

## Activating the product

You need to add the license key to your CKEditor&nbsp;5 configuration. It is enough to add the license key once for the standalone features listed in this guide, no matter which and how many premium features you intend to use.

```js
ClassicEditor
	.create( document.querySelector( '#editor' ), {
		// Load the plugin.
		plugins: [ /* ... */ ],

		// Provide the licence key.
		licenseKey: '<YOUR_LICENSE_KEY>',

		// Display the feature UI element in the toolbar.
		toolbar: [ /* ... */ ],
	} )
	.then( /* ... */ )
	.catch( /* ... */ );
```

To use premium features, you need to add the relevant plugins to your CKEditor&nbsp;5. You can use the [CKEditor&nbsp;5 Builder](https://ckeditor.com/ckeditor-5/builder?redirect=docs) to generate a CKEditor&nbsp;5 preset with the plugins enabled.

Alternatively, refer to the installation sections in the plugin documentation to do it on your own. You can read more about {@link getting-started/setup/configuration installing plugins} and {@link getting-started/setup/toolbar toolbar configuration} in dedicated guides.
