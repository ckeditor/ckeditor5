---
category: update-guides
meta-title: Update to version 44.x | CKEditor 5 Documentation
menu-title: Update to v44.x
order: 80
modified_at: 2024-11-28
---

# Update to CKEditor&nbsp;5 v44.x

<info-box>
	When updating your CKEditor&nbsp;5 installation, ensure **all the packages are the same version** to avoid errors.

	You may try removing the `package-lock.json` or `yarn.lock` files (if applicable) and reinstalling all packages before rebuilding the editor. For best results, make sure you use the most recent package versions.
</info-box>

## Update to CKEditor&nbsp;5 v44.0.0

_Released on December 2, 2024._

For the entire list of changes introduced in version 44.0.0, see the [release notes for CKEditor&nbsp;5 v44.0.0](https://github.com/ckeditor/ckeditor5/releases/tag/v44.0.0).

Below are the most important changes that require your attention when upgrading to CKEditor&nbsp;5 v44.0.0.

### Required license key configuration

Version 44.0.0 introduced a change in the license configuration. The `config.licenseKey` is now a required property in the editor configuration. Whether you are using CKEditor&nbsp;5 commercially or under open-source terms, you will need to specify this property in your configuration.

* **Commercial licenses**: For current users with a commercial license, you must retrieve your license key from the [Customer Portal](https://portal.ckeditor.com/) and add it to your editor configuration. [Format of the key has changed](#new-license-key-format) in this release.
* **Open-Source installations**: If you are self-hosting CKEditor&nbsp;5 under the GPL terms, you will need to set `config.licenseKey` to `'GPL'` in your configuration.
* **Cloud CDN setups**: If you are using cloud-distributed CKEditor&nbsp;5 delivered via our CDN, you need a license key. You can create a [free account](https://portal.ckeditor.com/checkout?plan=free). All accounts are granted a 14-day trial for Premium Features (no credit card required).

```js
ClassicEditor
    .create( document.querySelector( '#editor' ), {
        licenseKey: '<YOUR_LICENSE_KEY>' // Or 'GPL'.

		// ... Other configuration options ...

    } )
	.then( /* ... */ )
    .catch( /* ... */ );
```

Read more in our guides about {@link getting-started/licensing/license-key-and-activation license keys} and {@link getting-started/licensing/usage-based-billing usage-based billing}.

### New license key format

A new license key format has been introduced. Previous license keys **will no longer work** after updating the editor to version 44.0.0 and above.

Acquiring new keys:

1. **Access the Customer Portal**: Log in to the [Customer Portal](https://portal.ckeditor.com/) to obtain your new license key.
2. **Update configuration**: Replace the old license key in your editor configuration with the new key.

For more information or assistance, please refer to our {@link getting-started/licensing/license-key-and-activation documentation} or [contact our support team](https://ckeditor.com/contact/).

### Self-service plans and new Customer Portal

The new self-service plans make accessing CKEditor Premium Features easier than ever. You can now choose the plan that best suits your needs and get started quickly with commitment-free trials.

Plans are managed through a new, dedicated [Customer Portal](https://portal.ckeditor.com/), where you can access license keys, track usage, manage billing, and submit support requests-all from one place.

Learn more about the [different plans available](https://ckeditor.com/pricing/) or start your [14-day free trial](https://portal.ckeditor.com/checkout?plan=free).
