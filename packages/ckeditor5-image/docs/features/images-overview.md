---
category: features-images
menu-title: Overview
order: 10
---

# Images in CKEditor 5 (overview)

CKEditor 5 comes with various tools to work with images. The editor allows inserting (uploading), resizing, styling, captioning and linking images. All these features work both with block, inline, and responsive images out-of-the-box.

To see the all image features in action, check out the [**demo**](#demo) below. To learn more about individual plugins (sub-features) in the image ecosystem, see the [**Image features**](#image-features) section.

## Demo

[TODO] A full-featured demo of images (block + inline + style + link + resize). The tour balloon should point to the image upload button in the toolbar. The upload button should either be the first one (separator follows), or very close to the beginning.

{@snippet features/build-image-source}

## Image features

The [`@ckeditor/ckeditor5-image`](https://www.npmjs.com/package/@ckeditor/ckeditor5-image) package contains multiple plugins that implement various image-related features. The {@link module:image/image~Image `Image`} plugin is at the core of the ecosystem. Available in all {@link builds/guides/overview ready-to-use editor builds}, it provides the basic support for block and inline images. There are many other plugins that extend the editor capabilities:

* {@link module:image/imagetoolbar~ImageToolbar} adds the image feature's [contextual toolbar](#image-contextual-toolbar).
* {@link module:image/imagecaption~ImageCaption} adds support for [captions](#image-captions).
* {@link module:image/imagestyle~ImageStyle} adds support for [image styles](#image-styles).
* {@link module:image/imagetextalternative~ImageTextAlternative} adds support for adding text alternative.
* {@link module:image/imageupload~ImageUpload} adds support for {@link features/image-upload uploading dropped or pasted images}.
* {@link module:image/imageinsert~ImageInsert} adds support for [inserting images via URL](#inserting-images-via-source-url) and other custom integrations.
* {@link module:image/autoimage~AutoImage} adds support for [inserting images via pasting a URL into the editor](#inserting-images-via-pasting-url-into-editor).
* {@link module:image/imageresize~ImageResize} adds support for [resizing images](#resizing-images).
* {@link module:link/linkimage~LinkImage} adds support for [linking images](#linking-images) (provided by the [`@ckeditor/ckeditor5-link`](https://www.npmjs.com/package/@ckeditor/ckeditor5-link) package).
* [TODO] let's check if the list is complete

The availability of these plugins varies in different {@link builds/guides/overview ready-to-use editor builds} but the most important ones are present in all builds as presented in the table below:

<figure class="table">
	<table style="text-align: center">
		<thead>
			<tr>
				<th rowspan="2" colspan="2" style="vertical-align: middle">Image feature (plugin)</th>
				<th colspan="5">Ready–to–use editor build</th>
			</tr>
			<tr>
				<th>Classic</th>
				<th>Inline</th>
				<th>Balloon</th>
				<th>Balloon block</th>
				<th>Document</th>
			</tr>
		</thead>
		<tbody>
			<tr>
				<th rowspan="2" style="vertical-align: middle"><code>Image</code></th>
				<th><code>ImageBlock</code></th>
				<td>✅ yes</td>
				<td>✅ yes</td>
				<td>✅ yes</td>
				<td>✅ yes</td>
				<td>✅ yes</td>
			</tr>
			<tr>
				<th><code>ImageInline</code></th>
				<td>✅ yes</td>
				<td>✅ yes</td>
				<td>✅ yes</td>
				<td>✅ yes</td>
				<td>✅ yes</td>
			</tr>
			<tr>
				<th colspan="2"><code>ImageToolbar</code></th>
				<td>✅ yes</td>
				<td>✅ yes</td>
				<td>✅ yes</td>
				<td>✅ yes</td>
				<td>✅ yes</td>
			</tr>
			<tr>
				<th colspan="2"><code>ImageCaption</code></th>
				<td>✅ yes</td>
				<td>✅ yes</td>
				<td>✅ yes</td>
				<td>✅ yes</td>
				<td>✅ yes</td>
			</tr>
			<tr>
				<th colspan="2"><code>ImageStyle</code></th>
				<td>✅ yes</td>
				<td>✅ yes</td>
				<td>✅ yes</td>
				<td>✅ yes</td>
				<td>✅ yes</td>
			</tr>
			<tr>
				<th colspan="2"><code>ImageTextAlternative</code></th>
				<td>✅ yes</td>
				<td>✅ yes</td>
				<td>✅ yes</td>
				<td>✅ yes</td>
				<td>✅ yes</td>
			</tr>
			<tr>
				<th colspan="2"><code>ImageUpload</code></th>
				<td>✅ yes</td>
				<td>✅ yes</td>
				<td>✅ yes</td>
				<td>✅ yes</td>
				<td>✅ yes</td>
			</tr>
			<tr>
				<th colspan="2"><code>ImageResize</code></th>
				<td>❌ no</td>
				<td>❌ no</td>
				<td>❌ no</td>
				<td>❌ no</td>
				<td>✅ yes</td>
			</tr>
			<tr>
				<th colspan="2"><code>ImageInsert</code></th>
				<td>❌ no</td>
				<td>❌ no</td>
				<td>❌ no</td>
				<td>❌ no</td>
				<td>❌ no</td>
			</tr>
			<tr>
				<th colspan="2"><code>AutoImage</code></th>
				<td>❌ no</td>
				<td>❌ no</td>
				<td>❌ no</td>
				<td>❌ no</td>
				<td>❌ no</td>
			</tr>
			<tr>
				<th colspan="2"><code>LinkImage</code></th>
				<td>❌ no</td>
				<td>❌ no</td>
				<td>❌ no</td>
				<td>❌ no</td>
				<td>❌ no</td>
			</tr>
		</tbody>
	</table>
</figure>

<info-box>
	You can add more image features to your editor using the [online builder](https://ckeditor.com/ckeditor-5/online-builder/) or {@link TODO-installation manually by customizing your editor build}.
</info-box>

## Image contextual toolbar

The {@link module:image/imagetoolbar~ImageToolbar} plugin available in all editor builds introduces a contextual toolbar for images. The toolbar appears when an image is selected and can be configured to contain any buttons you want. Usually, these will be image-related options such as the text alternative button, the {@link TODO image caption button}, and {@link TODO image styles buttons}.

[TODO] do we need a demo here? I don't think so, it's showcased in the previous demo 👆. I think it's only worth mentioning it's there.

The image toolbar is configurable using the {@link module:image/image~ImageConfig#styles `config.image.toolbar`} property. For instance, to display the caption toggle and text alternative buttons, use the following configuration:

```js
ClassicEditor
	.create( document.querySelector( '#editor' ), {
		image: {
			toolbar: [ 'toggleImageCaption', 'imageTextAlternative' ]
		}
	} )
```

See the common API of image-related features such as {@link TODO-common-api image style}, {@link TODO-common-api image resize}, and {@link TODO-common-api link image} to learn more about available image toolbar buttons.

## Contribute

The source code of the feature is available on GitHub in https://github.com/ckeditor/ckeditor5/tree/master/packages/ckeditor5-image.
