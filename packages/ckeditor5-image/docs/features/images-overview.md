---
category: features-images
menu-title: Overview
order: 10
modified_at: 2021-06-17
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

The [`@ckeditor/ckeditor5-image`](https://www.npmjs.com/package/@ckeditor/ckeditor5-image) package contains multiple plugins that implement various image-related features. The {@link module:image/image~Image `Image`} plugin is at the core of the ecosystem. Available in all {@link builds/guides/overview ready-to-use editor builds}, it provides the basic support for block and inline images. There are many other features that extend the editor capabilities:

* The [contextual toolbar](#image-contextual-toolbar) available on mouse click gives access to image features.
* {@link features/images-captions Image captions} allow adding descriptive text under the image.
* The {@link features/images-styles image styles} help control the placement, size and other characteristics with predefined styles.
* The {@link features/images-text-alternative text alternative} tag aids accessability and SEO, provides additional image description and supports better navigation.
* {@link features/images-resizing Image resizing} lets the user control the dimensions of images in the content.
* {@link features/images-linking Linking images} makes it possible to use them as URL anchors.
* A selection of {@link features/image-upload image upload methods} allows for the most convenient way of adding images. These include support for {@link features/images-inserting#inserting-images-via-pasting-url-into-editor inserting an image via URL} and even {@link features/images-inserting#inserting-images-via-source-url via pasting a URL into the editor} along with custom integrations.
<!-- * [TODO] let's check if the list is complete -->

The availability of these plugins varies in different {@link builds/guides/overview ready-to-use editor builds} but the most important ones are present in all builds as presented in the table below:

<figure class="table">
	<table style="text-align: center">
		<thead>
			<tr>
				<th rowspan="2" colspan="2" style="vertical-align: middle">Image feature (plugin)</th>
				<th colspan="5">Ready–to–use editor build</th>
			</tr>
			<tr>
				<th>{@link builds/guides/overview#classic-editor Classic}</th>
				<th>{@link builds/guides/overview#inline-editor Inline}</th>
				<th>{@link builds/guides/overview#balloon-editor Balloon}</th>
				<th>{@link builds/guides/overview#balloon-block-editor Balloon block}</th>
				<th>{@link builds/guides/overview#document-editor Document}</th>
			</tr>
		</thead>
		<tbody>
			<tr>
				<th rowspan="2" style="vertical-align: middle">{@link module:image/image~Image}</th>
				<th>{@link module:image/imageblock~ImageBlock}</th>
				<td>✅&nbsp; yes</td>
				<td>✅&nbsp; yes</td>
				<td>✅&nbsp; yes</td>
				<td>✅&nbsp; yes</td>
				<td>✅&nbsp; yes</td>
			</tr>
			<tr>
				<th>{@link module:image/imageinline~ImageInline}</th>
				<td>✅&nbsp; yes</td>
				<td>✅&nbsp; yes</td>
				<td>✅&nbsp; yes</td>
				<td>✅&nbsp; yes</td>
				<td>✅&nbsp; yes</td>
			</tr>
			<tr>
				<th colspan="2">{@link module:image/imagetoolbar~ImageToolbar}</th>
				<td>✅&nbsp; yes</td>
				<td>✅&nbsp; yes</td>
				<td>✅&nbsp; yes</td>
				<td>✅&nbsp; yes</td>
				<td>✅&nbsp; yes</td>
			</tr>
			<tr>
				<th colspan="2">{@link module:image/imagecaption~ImageCaption}</th>
				<td>✅&nbsp; yes</td>
				<td>✅&nbsp; yes</td>
				<td>✅&nbsp; yes</td>
				<td>✅&nbsp; yes</td>
				<td>✅&nbsp; yes</td>
			</tr>
			<tr>
				<th colspan="2">{@link module:image/imagestyle~ImageStyle}</th>
				<td>✅&nbsp; yes</td>
				<td>✅&nbsp; yes</td>
				<td>✅&nbsp; yes</td>
				<td>✅&nbsp; yes</td>
				<td>✅&nbsp; yes</td>
			</tr>
			<tr>
				<th colspan="2">{@link module:image/imagetextalternative~ImageTextAlternative}</th>
				<td>✅&nbsp; yes</td>
				<td>✅&nbsp; yes</td>
				<td>✅&nbsp; yes</td>
				<td>✅&nbsp; yes</td>
				<td>✅&nbsp; yes</td>
			</tr>
			<tr>
				<th colspan="2">{@link module:image/imageupload~ImageUpload}</th>
				<td>✅&nbsp; yes</td>
				<td>✅&nbsp; yes</td>
				<td>✅&nbsp; yes</td>
				<td>✅&nbsp; yes</td>
				<td>✅&nbsp; yes</td>
			</tr>
			<tr>
				<th colspan="2">{@link module:image/imageresize~ImageResize}</th>
				<td>❌&nbsp; no</td>
				<td>❌&nbsp; no</td>
				<td>❌&nbsp; no</td>
				<td>❌&nbsp; no</td>
				<td>✅&nbsp; yes</td>
			</tr>
			<tr>
				<th colspan="2">{@link module:link/linkimage~LinkImage}</th>
				<td>❌&nbsp; no</td>
				<td>❌&nbsp; no</td>
				<td>❌&nbsp; no</td>
				<td>❌&nbsp; no</td>
				<td>❌&nbsp; no</td>
			</tr>
			<tr>
				<th colspan="2">{@link module:image/imageinsert~ImageInsert}</th>
				<td>❌&nbsp; no</td>
				<td>❌&nbsp; no</td>
				<td>❌&nbsp; no</td>
				<td>❌&nbsp; no</td>
				<td>❌&nbsp; no</td>
			</tr>
			<tr>
				<th colspan="2">{@link module:image/autoimage~AutoImage}</th>
				<td>❌&nbsp; no</td>
				<td>❌&nbsp; no</td>
				<td>❌&nbsp; no</td>
				<td>❌&nbsp; no</td>
				<td>❌&nbsp; no</td>
			</tr>
		</tbody>
	</table>
</figure>

<info-box>
	You can add more image features to your editor using the [online builder](https://ckeditor.com/ckeditor-5/online-builder/) or {@link features/images-installation manually by customizing your editor build}.
</info-box>

## Image contextual toolbar

The {@link module:image/imagetoolbar~ImageToolbar} plugin available in all editor builds introduces a contextual toolbar for images. The toolbar appears when an image is selected and can be configured to contain any buttons you want. Usually, these will be image-related options such as the {@link features/images-text-alternative text alternative} button, the {@link features/images-captions image caption} button, and {@link features/images-styles image styles} buttons. Shown below is an example contextual toolbar as observed in the demo above with a large set of buttons.

{@img assets/img/toolbar-items.png 749 An extended contextual toolbar.}

The image toolbar is configurable using the {@link module:image/image~ImageConfig#styles `config.image.toolbar`} property. For instance, to display the caption toggle and text alternative buttons, use the following configuration:

```js
ClassicEditor
	.create( document.querySelector( '#editor' ), {
		image: {
			toolbar: [ 'toggleImageCaption', 'imageTextAlternative' ]
		}
	} )
```
Refer to the {@link features/images-installation image installation} guide for more details on configuring the features available in the toolbar and to the {@link builds/guides/migration/migration-to-29#image-toolbar toolbar section} of the Migration to v29.x guide, as important changes were introduced in that version. You can also check the {@link features/toolbar editor toolbar} guide.

See the common API of image-related features such as {@link module:image/imagestyle~ImageStyle}, {@link module:image/imageresize~ImageResize}, and {@link module:link/linkimage~LinkImage} to learn more about available image toolbar buttons.

## Responsive images

Support for responsive images in CKEditor 5 is brought by the {@link features/easy-image Easy Image} feature without any additional configuration. Refer to the {@link features/easy-image#responsive-images Easy Image integration} guide to learn how to use the feature in your project.

## Contribute

The source code of the feature is available on GitHub in https://github.com/ckeditor/ckeditor5/tree/master/packages/ckeditor5-image.
