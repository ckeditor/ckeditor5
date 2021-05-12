---
category: features-images
menu-title: Overview
order: 10
---
{@snippet features/build-image-source}

# Images in CKEditor 5 (overview)

CKEditor 5 comes with various tools to work with images. The editor allows inserting (uploading), resizing, styling, captioning and linking images. All these features work both with block, inline, and responsive images out-of-the-box.

To see the all image features in action, check out the [**demo**](#demo) below. To learn more about individual plugins (sub-features) in the image ecosystem, see the [**Image features**](#image-features) section.

## Demo

{@snippet features/image-full}

## Base image feature

The base image feature does not support any user interface for inserting or managing images. Its sole purpose is to lay ground for other plugins (listed below) to build the target user experience. This pattern (composition of atomic features) is common for CKEditor 5 and allows the developers to build their own customized experience by implementing specific subfeatures differently.

## Image features

The [`@ckeditor/ckeditor5-image`](https://www.npmjs.com/package/@ckeditor/ckeditor5-image) package contains multiple plugins that implement various image-related features. The {@link module:image/image~Image `Image`} plugin is at the core of the ecosystem. Available in all {@link builds/guides/overview ready-to-use editor builds}, it provides the basic support for block and inline images. There are many other plugins that extend the editor capabilities:

* {@link module:image/imagetoolbar~ImageToolbar} adds the image feature's [contextual toolbar](#image-contextual-toolbar).
* {@link module:image/imagecaption~ImageCaption} adds support for {@link features/images-captions image captions}.
* {@link module:image/imagestyle~ImageStyle} adds support for {@link features/images-styles image styles}.
* {@link module:image/imagetextalternative~ImageTextAlternative} adds support for adding text alternative.
* {@link module:image/imageresize~ImageResize} adds support for {@link features/images-resizing resizing images}.
* {@link module:link/linkimage~LinkImage} adds support for {@link features/images-linking linking images} (provided by the [`@ckeditor/ckeditor5-link`](https://www.npmjs.com/package/@ckeditor/ckeditor5-link) package).
* {@link module:image/imageupload~ImageUpload} adds support for {@link features/image-upload uploading dropped or pasted images}.
* {@link module:image/imageinsert~ImageInsert} adds support for {@link features/images-inserting#inserting-images-via-source-url inserting image via pasting URL into the editor} and other custom integrations.
* {@link module:image/autoimage~AutoImage} adds support for {@link features/images-inserting#inserting-images-via-pasting-url-into-editor inserting image via URL}.
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

## Responsive images

Support for responsive images in CKEditor 5 is brought by the {@link features/easy-image Easy Image} feature without any additional configuration. Refer to the {@link features/easy-image#responsive-images Easy Image integration} guide to learn how to use the feature in your project.

## Contribute

The source code of the feature is available on GitHub in https://github.com/ckeditor/ckeditor5/tree/master/packages/ckeditor5-image.
