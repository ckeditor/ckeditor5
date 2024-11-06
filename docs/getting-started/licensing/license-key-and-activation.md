---
category: licensing
order: 20
meta-title: License key and activation | CKEditor 5 Documentation
meta-description: Managing your license keys and activating the editor.
menu-title: License key and activation
modified_at: 2024-10-28
---

# License key and activation

This article explains how to activate a commercial license for CKEditor&nbsp;5 and the CKEditor premium features.

There are two types of premiums: standalone features and services. Standalone ones require a simple license key and include:

* Asynchronous collaboration features, including:
	* {@link features/track-changes Track changes}
	* {@link features/comments Comments}
	* {@link features/revision-history Revision history}
* {@link features/ai-assistant-overview AI Assistant}
* {@link features/case-change Case change}
* {@link features/document-outline Document outline}
* {@link features/format-painter Format painter}
* {@link features/multi-level-lists Multi-level list}
* {@link features/pagination Pagination}
* {@link features/paste-from-office-enhanced Paste from Office enhanced}
* {@link features/slash-commands Slash commands}
* {@link features/table-of-contents Table of contents}
* {@link features/template Templates}

Other premium features such as {@link features/real-time-collaboration real-time collaboration}, {@link features/export-word export to Word}, {@link features/export-pdf export to PDF}, or {@link features/import-word import from Word} are authenticated on the server side.

<info-box>
	CKEditor&nbsp;5 (without premium features listed above) can be used without activation as {@link getting-started/licensing/license-and-legal open source software under the GPL license}. It will then {@link getting-started/licensing/managing-ckeditor-logo display a small "Powered by CKEditor" logo} in the editor area.

	For commercial purposes, there are {@link getting-started/licensing/license-and-legal trial, development and production license keys} are available.
</info-box>

## Obtaining a license

To activate CKEditor&nbsp;5 and the premium features listed above, you will need either an active commercial license or a trial license.

### Purchasing a commercial license

If you wish to purchase a commercial CKEditor 5 license, use our [pricing page](https://ckeditor.com/pricing/). You can choose from predefined plans that will allow you to use the editor immediately or you can contact our sales team if you have some specific needs.

### Subscribing to the CKEditor Premium Features free trial

If you wish to test our offer, you can create an account by [signing up for CKEditor Premium Features 14-day free trial](https://portal.ckeditor.com/signup). After signing up, you will receive access to the Customer Portal.

The trial is commitment-free, and you do not need to provide credit card details to start it. The Premium Features free trial allows you to test all paid CKEditor Ecosystem products at no cost.

### Using the GPL license key

CKEditor&nbsp;5 (without the premium features listed above) can be used in an open-source, GPL-compliant setup with:

* a [free account using the Cloud distribution](https://arc.net/l/quote/jyhmkuob). You will be granted a license key and free editor loads.
* without account setup as open-source software under the GPL license. Use the `'GPL'` value in the `licenseKey` field in your configuration.

In both cases, the editor will {@link getting-started/licensing/managing-ckeditor-logo display a small “Powered by CKEditor” logo} in the editor area.

If you are running an Open Source project under an OSS license incompatible with GPL, please [contact us](https://ckeditor.com/contact/). We will be happy to [support your project with a free CKEditor 5 license](https://ckeditor.com/wysiwyg-editor-open-source/).

For commercial purposes, {@link getting-started/licensing/license-and-legal trial, development, and production license keys} are available.

## License key usage

Follow this guide to get the license key necessary to create an account and use premium features.

### Create an account

Create an account by [signing up for the CKEditor Premium Features free trial](https://portal.ckeditor.com/checkout?plan=free). After signing up, you will receive access to the customer dashboard (CKEditor Ecosystem dashboard). During the process, you will see a list of features available from the 14-day free trial. You may check the ones you are the most interested in. However, this will not affect the trial package &ndash; all of them will be available.

### Log in to the Customer Portal

Log in to the [CKEditor Ecosystem dashboard](https://dashboard.ckeditor.com/). During the first login, you will receive a confirmation email with a link to create a password for your account.

Keep the password safe, as this trial account will be converted into a commercial account if you decide to buy the license after the trial period is over.

### Access the dashboard

Once logged in, you will have access to all the products available. Please note, that there are two types of premium features: standalone plugins and services. You can access the license keys via the "License keys" and "Cloud environments" sections, respectively.

{@img assets/img/ckeditor-free-dashboard.png 1109 Free trials dashboard.}

The "License keys" section provides authorization for standalone features. You can copy the desired key and paste it in your editor configuration, [as shown further in this guide](#using-the-license-key).

{@img assets/img/ckeditor-free-dashboard-keys.png 990 License keys.}

For services such as document converters, you will need different kinds of authorization. For details on how to apply those credentials, please refer to respective feature guides. Or find out installation details available in the {@link @cs guides/overview Cloud Services section} of the documentation.

To use the access credentials for services, you first need to choose the environment. You may need to create one if there is none.

{@img assets/img/ckeditor-free-dashboard-environments.png 990 Environments section.}

A token URL and other authentication methods will be assigned to this specific environment. This way you can use separate instances of the editor.

{@img assets/img/ckeditor-free-dashbboard-access-credentials.png 990 Access credentials.}

## License key types

### Trial license key

This key grants access to **all features**. It is valid for **14 days**. It does not consume editor loads, but editor is limited functionally (for example: session time, number of changes). It is **perfect for evaluating the platform** and all its features. It can be used only for evaluation purposes.

* **Features**: Grants access to all features and add-ons.
* **Duration**: Valid for 14 days (until 12th May 2024).
* **Functionality**: The editor is limited functionally, such as session time and the number of changes allowed.
* **Intended Use**: Ideal for evaluating the platform and all its features.
* **Usage Limitation**: Can only be used for evaluation purposes and not for production.
* **Editor Loads**: Does not consume editor loads.

You can sign up for the [CKEditor Premium Features 14-day free trial](https://portal.ckeditor.com/checkout?plan=free) to test the editor.

### Development license key

This key grants access to your subscription features. It does not consume editor loads, but editor is limited functionally (for example session time, number of changes, development domains). It is **perfect for development environments** (local work, CI, E2E tests). It must not be used for production environments.

* **Features**: Grants access to subscription features.
* **Functionality**:
	* Similar to the trial license, the editor is limited functionally, including session time and the number of changes allowed.
	* Additionally, there are limitations on development domains. The editor can be used in the following domains: `localhost`, `*.test`, `*.localhost`, `*.local`, and IP addresses: `127.0.0.1`,  `192.168.*.*`, `10.*.*.*`, `172.*.*.*` .
	* The editor will show a banner informing it was launched for development purposes.
* **Intended Use**: Designed for development environments such as local work, continuous integration (CI), and end-to-end (E2E) tests.
* **Usage Limitation**: Must not be used for production environments.
* **Editor Loads**: Does not consume editor loads.

[Contact us](https://ckeditor.com/contact/?sales=true#contact-form) for more details

### Production license key

This key grants access to your subscription features without imposing any limitations. It **consumes editor loads** (after the 14 days trial period ends).

* **Features**: Grants access to subscription features.
* **Functionality**: The editor functions without any restrictions.
* **Intended Use**: Meant for production environments where the software is actively used by end-users.
* **Usage Limitation**: None specified.
* **Editor Loads**: Consumes editor loads, especially after the 14-day trial period ends.

## Using the license key

You need to add the license key to your CKEditor&nbsp;5 configuration. It is enough to add the license key once for the standalone features listed in this guide, no matter which and how many premium features you intend to use. Refer to respective feature guides to learn how to configure services, such as document converters and CKBox.

```js
ClassicEditor
	.create( document.querySelector( '#editor' ), {
		// Load the plugins.
		plugins: [ /* ... */ ],

		// Provide the licence key.
		licenseKey: '<YOUR_LICENSE_KEY>', // Or 'GPL'.

		// Display the feature UI element in the toolbar.
		toolbar: [ /* ... */ ],
	} )
	.then( /* ... */ )
	.catch( /* ... */ );
```

To use premium features, you need to add the relevant plugins to your CKEditor&nbsp;5. You can use the [CKEditor&nbsp;5 Builder](https://ckeditor.com/ckeditor-5/builder/?redirect=docs) to generate a CKEditor&nbsp;5 preset with the plugins enabled.

Alternatively, refer to the installation sections in the plugin documentation to do it on your own. You can read more about {@link getting-started/setup/configuration installing plugins} and {@link getting-started/setup/toolbar toolbar configuration} in dedicated guides.
