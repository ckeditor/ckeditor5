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

## Update to CKEditor&nbsp;5 v 44.2.0

_Released on February 12, 2025._

### Enhanced Source Code Editing

Introducing new premium feature with current release: the {@link features/source-editing-enhanced enhanced source code editing}. It displays the source code in a dialog and is compatible with all editor types. It also offers syntax highlighting, code completion, code folding, and other advanced functionalities. Additionally, it supports both HTML and Markdown formats.

### Uploadcare and image optimizer

We have integrated the [Uploadcare](https://uploadcare.com/) image manager service, offering our users yet another way to upload and edit images in their cloud environment. You can upload files from various sources, including local devices, social media, or online drives ensuring rapid uploads. The integration takes care of efficient media delivery with responsive images mechanism, making sure your users will save bandwidth and have faster website loading. You can also optimize images with the built-in image editor which offers a range of features, such as cropping, rotating, flipping, photo filters and more. All this can be done directly from the editor. {@link features/uploadcare Try it out}!

### Image Merge Fields

The {@link features/merge-fields#template-editing image merge fields} are a new type of merge fields, dedicated for image placeholders. They maintain all standard image interactions, like styling, resizing or captions (in which you can use merge fields too!) At the same time, they keep all merge fields functionalities, like data previews or document export integration. In the document data, image merge fields are represented like other images, however their `src` attribute is set to a respective merge field, for example, `src="{{CompanyLogo}}"`, making them easy to post-process!

### Track Changes Preview

We have added the {@link features/track-changes-preview track changes preview mode} that displays a document with all suggestions accepted. Accessible from the track changes dropdown, this modal preview helps check the final content without extensive markers.

### Emoji support

With the new {@link features/emoji feature} you can insert emojis effortlessly in the editor by typing `:` or through a user-friendly emoji picker. This feature enhances the richness of your content by allowing quick access to a wide range of emojis.

### Performance improvements

Here comes the final batch of the planned performance improvements in the editor loading speed area, that we worked on through a couple of past releases.

* A new caching mechanism in `Mapper` now handles model-to-view mappings, substantially improving performance for loading and saving data.
* Images with specified height and width automatically use `[loading="lazy"]` in the editing area, optimizing the loading time ([read more on MDN](https://developer.mozilla.org/en-US/docs/Web/Performance/Lazy_loading#images_and_iframes)). This attribute is only applied during editing to enhance the loading efficiency of images, and it does not reflect in the final data output.

We are greatly satisfied with the improved editor loading times. At the same time, we acknowledge some other problematic areas, and we will keep delivering more performance-related improvements in the future.

## Update to CKEditor&nbsp;5 v44.0.0

_Released on December 2, 2024._

For the entire list of changes introduced in version 44.0.0, see the [release notes for CKEditor&nbsp;5 v44.0.0](https://github.com/ckeditor/ckeditor5/releases/tag/v44.0.0).

Below are the most important changes that require your attention when upgrading to CKEditor&nbsp;5 v44.0.0.

### Required license key configuration

Version 44.0.0 introduced a change in the license configuration. The `config.licenseKey` is now a required property in the editor configuration. Whether you are using CKEditor&nbsp;5 commercially or under open-source terms, you will need to specify this property in your configuration.

```js
ClassicEditor
	.create( document.querySelector( '#editor' ), {
		licenseKey: '<YOUR_LICENSE_KEY>' // Or 'GPL'.

		// ... Other configuration options ...

	} )
	.then( /* ... */ )
	.catch( /* ... */ );
```

* **Commercial licenses**: When upgrading to version 44.0.0 or later, users with a commercial license must update their license key to the [new format](#new-license-key-format). To update your license key, log in to the [Customer Portal](https://portal.ckeditor.com/) and copy the key associated with your subscription into your editor's configuration.
* **Open-source installations**:
	* **Self-hosted (npm/ZIP) installations**: If you are self-hosting CKEditor&nbsp;5 under the {@link getting-started/licensing/license-and-legal GPL 2+ terms} or as a part of our [Open Source support project](https://ckeditor.com/wysiwyg-editor-open-source/), you need to set `config.licenseKey` to `'GPL'` in your configuration.
	* **Cloud (CDN) installations**: For cloud-distributed CKEditor 5 served via [our CDN](https://cdn.ckeditor.com), you must obtain a license key from the Customer Portal. Create a [free account](https://portal.ckeditor.com/checkout?plan=free) and add the provided license key to your editor configuration.

		During the 14-day trial (automatically activated upon sign-up), you can explore all Premium Features. After the trial ends, usage metering and editor load limits specific to your chosen plan will apply. Learn more about [available plans](https://ckeditor.com/pricing/) and {@link getting-started/licensing/usage-based-billing usage-based billing}.

Read more in our guides about {@link getting-started/licensing/license-key-and-activation license keys} and {@link getting-started/licensing/usage-based-billing usage-based billing}.

### New license key format

A new license key format has been introduced. Previous license keys **will no longer work** after updating the editor to version 44.0.0 and above.

We also changed the way the development license key works. To prevent it from accidental usage on production it is limited only to development domains, shows informational label, and has operational limit. {@link getting-started/licensing/license-key-and-activation#development-license-key Read more about the details}.

Acquiring new keys:

1. **Access the Customer Portal**: Log in to the [Customer Portal](https://portal.ckeditor.com/) to obtain your new license key.
2. **Update configuration**: Replace the old license key in your editor configuration with the new key.

For more information or assistance, please refer to our {@link getting-started/licensing/license-key-and-activation documentation} or [contact our support team](https://ckeditor.com/contact/).

### Self-service plans and new Customer Portal

The new self-service plans make accessing CKEditor Premium Features easier than ever. You can now choose the plan that best suits your needs and get started quickly with commitment-free trials.

Plans are managed through a new, dedicated [Customer Portal](https://portal.ckeditor.com/), where you can access license keys, track usage, manage billing, and submit support requests-all from one place.

Learn more about the [different plans available](https://ckeditor.com/pricing/) or start your [14-day free trial](https://portal.ckeditor.com/checkout?plan=free).
