---
category: features-images
menu-title: Overview
order: 10
---

# Images in CKEditor 5 (overview)

[TODO] As in "Image upload overview", a short note:
* What is image feature (features)?
* What types of images are supported?
* What it allows (inserting, resizing, styling, linking)?
* Where to go next (sub-features, installation)?

## Demo

[TODO] A full-featured demo of images (block + inline + style + link + resize).
{@snippet features/build-image-source}

## Image features

[TODO]

<figure class="table">
	<table>
		<thead>
			<tr>
				<th rowspan="2">Loaded plugin</th>
				<th colspan="2">Available features</th>
			</tr>
			<tr>
				<th>Block images (with captions)</th>
				<th>Inline images</th>
			</tr>
		</thead>
		<tbody>
			<tr>
				<th><code>Image</code></th>
				<td>✅ yes</td>
				<td>✅ yes</td>
			</tr>
			<tr>
				<th><code>ImageBlock</code></th>
				<td>✅ yes</td>
				<td>❌ no</td>
			</tr>
			<tr>
				<th><code>ImageInline</code></th>
				<td>❌ no</td>
				<td>✅ yes</td>
			</tr>
		</tbody>
	</table>
</figure>

The [`@ckeditor/ckeditor5-image`](https://www.npmjs.com/package/@ckeditor/ckeditor5-image) package contains multiple plugins that implement various image-related features:

* {@link module:image/image~Image} implements [basic support for images](#base-image-support).
* {@link module:image/imagetoolbar~ImageToolbar} adds the image feature's [contextual toolbar](#image-contextual-toolbar).
* {@link module:image/imagecaption~ImageCaption} adds support for [captions](#image-captions).
* {@link module:image/imagestyle~ImageStyle} adds support for [image styles](#image-styles).
* {@link module:image/imagetextalternative~ImageTextAlternative} adds support for adding text alternative.
* {@link module:image/imageupload~ImageUpload} adds support for {@link features/image-upload uploading dropped or pasted images}.
* {@link module:image/imageinsert~ImageInsert} adds support for [inserting images via URL](#inserting-images-via-source-url) and other custom integrations.
* {@link module:image/autoimage~AutoImage} adds support for [inserting images via pasting a URL into the editor](#inserting-images-via-pasting-url-into-editor).
* {@link module:image/imageresize~ImageResize} adds support for [resizing images](#resizing-images).
* {@link module:link/linkimage~LinkImage} adds support for [linking images](#linking-images).

<info-box info>
	All features listed above except image resizing and image linking are enabled by default in all CKEditor 5 WYSIWYG editor builds.

	Check the documentation of each subfeature to learn more about it.
</info-box>

## Image contextual toolbar

The {@link module:image/imagetoolbar~ImageToolbar} plugin introduces a contextual toolbar for images. The toolbar appears when an image is selected and can be configured to contain any buttons you want. Usually, these will be image-related options such as the text alternative button (a feature introduced by the base image plugin) and [image styles buttons](#image-styles).

See a demo of a WYSIWYG editor with the contextual toolbar enabled:

{@snippet features/image-toolbar}

The image toolbar is configured to contain the image text alternative button:

```js
ClassicEditor
	.create( document.querySelector( '#editor' ), {
		image: {
			toolbar: [ 'imageTextAlternative' ]
		}
	} )
```

## Contribute

The source code of the feature is available on GitHub in https://github.com/ckeditor/ckeditor5/tree/master/packages/ckeditor5-image.
