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

## Update to CKEditor&nbsp;5 v 44.3.0

Released on March 5, 2025. ([See full release notes](https://github.com/ckeditor/ckeditor5/releases/tag/v44.3.0))

### Fixed link decorators

We fixed the behavior of the multiple manual link decorators that set the `rel` attribute. The fix happened so deep in the engine that we improved the overall performance of the editor slightly as well.

### New `EmptyBlock` plugin

Starting this release, a new {@link module:html-support/emptyblock~EmptyBlock} plugin prevents adding `&nbsp;` to the output data of blocks, and works similarly to the [`fillEmptyBlocks`](https://ckeditor.com/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-fillEmptyBlocks) configuration in CKEditor 4.

### Enhanced support for the `<hr>` element

We have enhanced support for the `<hr>` element in the [General HTML Support](https://ckeditor.com/docs/ckeditor5/latest/features/html/general-html-support.html) plugin. Now, the attributes of the `<hr>` element are properly preserved if configuration allows it.

## Enhanced emoji support

We enhanced emoji support for better compatibility with users' devices.

### Minor breaking changes in this release

* **[engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine)**: The `ViewConsumable.consumablesFromElement()` is removed and replaced with the `view.Element#_getConsumables()` internal method. You should use `ViewConsumable.createFrom()` to create consumables if needed.
* **[engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine)**: The `ViewElementConsumables` now accepts and outputs only normalized data. The `ViewConsumable` still accepts normalized or non-normalized input.
* **[engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine)**: The `Matcher#match()` and `Matcher#matchAll()` output is now normalized. The `MatchResult#match` now contains normalized data compatible with changes in the `ViewConsumable`.

## Update to CKEditor&nbsp;5 v 44.2.1

Released on February 20, 2025. ([See full release notes](https://github.com/ckeditor/ckeditor5/releases/tag/v44.2.1))

### Vulnerability removed

During a recent internal audit, we identified a cross-site scripting (XSS) vulnerability in the CKEditor 5 real-time collaboration package ([`CVE-2025-25299`](https://github.com/ckeditor/ckeditor5/security/advisories/GHSA-j3mm-wmfm-mwvh)). This vulnerability can lead to unauthorized JavaScript code execution and affects user markers, which represent users' positions within the document.

This vulnerability affects only installations with [real-time collaborative editing](https://ckeditor.com/docs/ckeditor5/latest/features/collaboration/real-time-collaboration/real-time-collaboration.html) enabled.

You can read more details in the relevant [security advisory](https://github.com/ckeditor/ckeditor5/security/advisories/GHSA-j3mm-wmfm-mwvh) and [contact us](mailto:security@cksource.com) if you have more questions.

## Update to CKEditor&nbsp;5 v 44.2.0

Released on February 12, 2025. ([See full release notes](https://github.com/ckeditor/ckeditor5/releases/tag/v44.2.0))

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

### Minor breaking changes in this release

* **[engine](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine)**: `Mapper#registerViewToModelLength()` is now deprecated and will be removed in one of the upcoming releases. This method is useful only in obscure and complex converters, where model element, or a group of model elements, are represented differently in the view. We believe that every feature using a custom view-to-model length callback can be rewritten in a way that this mechanism is no longer necessary. Note: if this method is used, the caching mechanism for `Mapper` will be turned off which may degrade performance when handling big documents. Note: this method is used by the deprecated legacy lists feature. As a result, you will not experience the performance improvements if you are still using the deprecated legacy lists feature.
* **[image](https://www.npmjs.com/package/@ckeditor/ckeditor5-image)**: Starting this release, images that have `[height]` and `[width]` attributes set will automatically receive the `[loading="lazy"]` attribute in the editing area. This happens only for the content loaded into the editor, the data output produced by the editor remains the same. The reason for this change is to improve user experience in documents that may contain hundreds of images.
* **[list](https://www.npmjs.com/package/@ckeditor/ckeditor5-list)**: The `lower-alpha` and `upper-alpha` list styles are now upcasted to `lower-latin` and `upper-latin` styles.
* **[merge-fields](https://www.npmjs.com/package/@ckeditor/ckeditor5-merge-fields)**: The `MergeFieldsEditing#getLabel()` method will now return `null` instead of the merge field id if the merge field definition was not found or it did not contain the `label` property.
* **[basic-styles](https://www.npmjs.com/package/@ckeditor/ckeditor5-basic-styles)**: Elements which contains the `[style]` attribute with `word-wrap: break-word` will not be converted to `<code>`. See [#17789](https://github.com/ckeditor/ckeditor5/issues/17789).

## Update to CKEditor&nbsp;5 v44.1.0

Released on December 16, 2024 ([See full release notes](https://github.com/ckeditor/ckeditor5/releases/tag/v44.1.0)).

### Minor breaking changes in this release

* **[utils](https://www.npmjs.com/package/@ckeditor/ckeditor5-utils)**: `spliceArray` now modifies the target array and does not accept a fourth (`count`) argument.

## Update to CKEditor&nbsp;5 v44.0.0

Released on December 2, 2024 ([See full release notes](https://github.com/ckeditor/ckeditor5/releases/tag/v44.0.0)).

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

### Major breaking changes in this release

* `config.licenseKey` is now a required property in the editor configuration. Use `'GPL'` for installations under the GPL terms. See [#17317](https://github.com/ckeditor/ckeditor5/issues/17317).
