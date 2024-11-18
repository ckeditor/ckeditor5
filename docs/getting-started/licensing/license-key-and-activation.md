---
category: licensing
order: 10
meta-title: License key and activation | CKEditor 5 Documentation
meta-description: Managing your license keys and activating the editor.
menu-title: License key and activation
modified_at: 2024-10-28
---

# License key and activation

This article explains how to obtain a commercial license for CKEditor&nbsp;5 and the CKEditor premium features.

<info-box>
	CKEditor&nbsp;5 without premium features can be used as {@link getting-started/licensing/license-and-legal open source software under the GPL}. It will then {@link getting-started/licensing/managing-ckeditor-logo display a small "Powered by CKEditor" logo} in the editor area.

	If you are not meeting the criteria of the GPL, you need to obtain a commercial one.
</info-box>

## Obtaining a license

### Purchasing a commercial license

If you wish to purchase a commercial CKEditor 5 license there are two options to do that.

1. Use our [pricing page](https://ckeditor.com/pricing/). You can choose from predefined plans that will allow you to use the editor with our Cloud CDN.
2. [Contact our sales team](https://ckeditor.com/contact/) if you have some specific needs, and you want to use the self-hosted editor.

### Choosing a distribution method

When you choose the editor license you need to decide how the editor will be distributed, via cloud or self-hosted. Key differences are:

- **Cloud-hosted**: Served via our CDN, globally distributed access, no hosting setup required. Subject to {@link getting-started/licensing/usage-based-billing usage-based billing}.
- **Self-hosted**: Setup with npm or ZIP download, offers more flexibility in hosting. This type requires contact with our sales team and a custom plan.

### Subscribing to the CKEditor Premium Features free trial

If you wish to test our offer, you can create an account by [signing up for CKEditor Premium Features 14-day free trial](https://portal.ckeditor.com/checkout?plan=free). After signing up, you will receive access to the Customer Portal.

The trial is commitment-free, and you do not need to provide credit card details to start it. The Premium Features free trial allows you to test all paid features and products at no cost.

Trial allows testing both self-hosted and cloud distributions. When the trial finishes, you have to use the distribution according to your plan details.

### Using the GPL key

CKEditor&nbsp;5 (without the premium features listed above) can be used in an open-source, GPL-compliant setup with:

* a [free account using the Cloud distribution](https://ckeditor.com/pricing). You will be granted a license key and free editor loads.
* without account setup as open-source software under the GPL. Use the `'GPL'` value in the `licenseKey` field in your configuration.

In both cases, the editor will {@link getting-started/licensing/managing-ckeditor-logo display a small “Powered by CKEditor” logo} in the editor area.

If you are running an Open Source project under an OSS license incompatible with GPL, please [contact us](https://ckeditor.com/contact/). We will be happy to [support your project with a free CKEditor 5 license](https://ckeditor.com/wysiwyg-editor-open-source/).

For commercial purposes, {@link getting-started/licensing/license-and-legal trial, development, and production license keys} are available.

## License key set up

Follow this guide to get the license key necessary to create an account and use premium features.

### Create an account

Create an account either by:

1. [Signing up for the CKEditor Free plan](https://portal.ckeditor.com/checkout?plan=free).
2. Or by choosing [a specific paid plan](https://ckeditor.com/pricing) according to your needs.

Both options are granted a 14-day trial to test all premium features.

After signing up, you will receive access to the Customer Portal.

### Log in to the Customer Portal

Log in to the [Customer Portal](https://portal.ckeditor.com/). During the first login, you will receive a confirmation email with a link to create a password for your account.

Keep the password safe, as this trial account will be converted into a commercial account if you decide to buy the license after the trial period is over.

### Access the portal

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
* **Duration**: Valid for 14 days.
* **Functionality**: The editor is limited functionally, such as session time and the number of changes allowed.
* **Intended use**: Ideal for evaluating the platform and all its features.
* **Usage limitation**: Can only be used for evaluation purposes and not for production.
* **Editor loads**: Does not consume editor loads.

You can sign up for the [CKEditor Premium Features 14-day free trial](https://portal.ckeditor.com/checkout?plan=free) to test the editor.

### Development license key

This key grants access to your subscription features. It does not consume editor loads, but editor is limited functionally (for example session time, number of changes, development domains). It is **perfect for development environments** (local work, CI, E2E tests). It must not be used for production environments.

* **Features**: Grants access to subscription features.
* **Functionality**:
	* Similar to the trial license, the editor is limited functionally, including session time and the number of changes allowed.
	* Additionally, there are limitations on development domains. The editor can be used in the following domains: `localhost`, `*.test`, `*.localhost`, `*.local`, and IP addresses: `127.0.0.1`, `192.168.*.*`, `10.*.*.*`, `172.*.*.*`.
	* The editor will show a banner informing it was launched for development purposes.
* **Intended use**: Designed for development environments such as local work, continuous integration (CI), and end-to-end (E2E) tests.
* **Usage limitation**: Must not be used for production environments.
* **Editor loads**: Does not consume editor loads.

### Production license key

This key grants access to your subscription features without imposing any limitations. It **consumes editor loads** (after the 14 days trial period ends).

* **Features**: Grants access to subscription features.
* **Functionality**: The editor functions without any restrictions.
* **Intended use**: Meant for production environments where the software is actively used by end-users.
* **Usage limitation**: None specified.
* **Editor loads**: Consumes editor loads.

### Evaluation license key

This license key is a temporary, evaluation-only key generated by our team to support short-term testing and demonstration purposes. It is intended for use in events, sample code, or brief evaluations, allowing limited access to essential platform features.

* **Features**: Grants access to open-source features only.
* **Duration**: Typically valid for 24 hours to accommodate short-term needs.
* **Functionality**: The editor is limited functionally, such as session time and the number of changes allowed.
* **Intended use**: Ideal for quick evaluations, demos, or inclusion in code samples.
* **Usage limitation**: Issued solely for evaluation purposes by our team; not authorized for production use.
* **Editor loads**: This license does not consume editor loads, ensuring it’s lightweight for temporary testing.

## Using the license key

You need to add the license key to your CKEditor&nbsp;5 configuration. It is enough to add the license key once for the standalone features listed in this guide, no matter which and how many premium features you intend to use. Refer to respective feature guides to learn how to configure services, such as document converters and CKBox.

```js
ClassicEditor
	.create( document.querySelector( '#editor' ), {
		// Provide the licence key.
		licenseKey: '<YOUR_LICENSE_KEY>', // Or 'GPL'.

		// Load the plugins.
		plugins: [ /* ... */ ],


		// Display the feature UI element in the toolbar.
		toolbar: [ /* ... */ ],
	} )
	.then( /* ... */ )
	.catch( /* ... */ );
```

To use premium features, you need to add the relevant plugins to your CKEditor&nbsp;5. You can use the [CKEditor&nbsp;5 Builder](https://ckeditor.com/ckeditor-5/builder/?redirect=docs) to generate a CKEditor&nbsp;5 preset with the plugins enabled.

Alternatively, refer to the installation sections in the plugin documentation to do it on your own. You can read more about {@link getting-started/setup/configuration installing plugins} and {@link getting-started/setup/toolbar toolbar configuration} in dedicated guides.

## License key regeneration

License keys may be regenerated, and you will always be informed when this occurs. Regeneration may happen under the following circumstances:

* **Upon request**: You can request a license key regeneration.
* **Feature updates**: Keys will be regenerated if new features are added to your subscription, either through a plan upgrade or additions to your current plan.

Your current license keys will remain functional even after regeneration, ensuring you have sufficient time to migrate to the updated keys without disruption.

