---
category: support
order: 15
menu-title: Obtaining the license key
---

# Activating your product

This article aims to get you up and running with CKEditor 5 and the CKEditor premium features activation. 

The following user guide deals with activation of CKEditor 5 and the following premium features: 
* Non real-time collaboration features, including:
	* Track changes
	* Comments
	* Revision history
* Pagination
* The productivity pack including:
	* Document outline
	* Document templates
	* Format painter
	* Slash commands
	* Table of contents

For activation instructions for premium features such as export to Word, export to PDF, import from Word please refer to respective guides.

## Obtaining a license

To active CKEditor 5 and the selected premium features you will need either a commercial CKEditor 5 and selected premium features license, or a trial license.

### Purchasing a comercial license

If you wish to purchase a CKEditor 5 commercial license or a license to one of the premium features, please [contact us](https://ckeditor.com/contact/?sales=true#contact-form) to receive an offer tailored to your needs.

### Subscribing to the CKEditor Premium Features free trial

If you wish to test our opffer, you can create an account by [signing up for CKEditor Premium Features free trial](https://orders.ckeditor.com/trial/premium-features). After signing up, you will receive access to the customer dashboard (CKEditor Ecosystem dashboard).

The trial is commitment-free and there is no need to provide creadit card details in order to start it. The Premium Features Free Trial lets you test all premium features, including the ones listed above, the converter services and the CKBox file manager as well.

## Obtaining a license key

Follow this guide to get the license key necessary to activate your premium features.

### Log in to the CKEditor Ecosystem dashboard

Log in to the [CKEditor Ecosystem dashboard](https://dashboard.ckeditor.com). You will receive a confirmation email and will be asked to create a password for your account. Keep it safe.

### Access the account dashboard

After logging in, click "CKEditor" under the "Your products" header on the left. You will see the subscription parameters overview together with the management area below.

{@img assets/img/premium-features-trial-bundle.png 1060 Your CKEditor trials view in the customer dashboard.}

### Copy the license key

Once you enter the management console, you have access to the license key needed to run the features. Note that the same license key will be valid for both the productivity pack and other standalone features.

{@img assets/img/standalone.png 953 Productivity pack license key in the management console.}

### Activate the product

To install the plugins into your WYSIWYG editor, use the [online builder](https://ckeditor.com/ckeditor-5/online-builder/) to generate a custom CKEditor 5 build with the plugin enabled. Alternatively, refer to the installation sections in the plugins documentation to do it on your own. You can read more about {@link installation/plugins/installing-plugins installing plugins} and {@link features/toolbar toolbar configuration} in dedicated guides.

You need to add the license key to your CKEditor 5 configuration. It is enough to add the license key once for the stand-alone features listed in this guide, no matter which and how many premium features you intend to use. 

```js
ClassicEditor
	.create( document.querySelector( '#editor' ), {
		// Load the plugin.
		plugins: [ /* ... */ ],

		// Provide activation key
		licenseKey: 'your-license-key',

		// Display the feature UI element in the toolbar.
		toolbar: [ /* ... */ ],
	} )
	.then( /* ... */ )
	.catch( /* ... */ );
```
