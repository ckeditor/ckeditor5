---
category: features-images
menu-title: Installation
order: 15
modified_at: 2021-06-17
---

The vast majority of image-related features {@link features/images-overview#image-features are available} in all {@link installation/getting-started/predefined-builds predefined builds} and require no additional installation. If you want to change the default configuration or create a {@link installation/getting-started/quick-start-other#building-the-editor-from-source custom editor build}, you can enable image-related features by installing the [`@ckeditor/ckeditor5-image`](https://www.npmjs.com/package/@ckeditor/ckeditor5-image) package:

```plaintext
npm install --save @ckeditor/ckeditor5-image
```

<info-box info>
	You may want to install the [`@ckeditor/ckeditor5-link`](https://www.npmjs.com/package/@ckeditor/ckeditor5-link) package if you want to use the {@link features/images-linking `LinkImage`} plugin in your editor.
</info-box>

Next add the {@link features/images-overview#image-features plugins that you need} to your plugin list. You also need to set the desired image toolbar items. Notice the {@link features/toolbar#separating-toolbar-items separators} used to organize the toolbar.

```js
import Image from '@ckeditor/ckeditor5-image/src/image';
import ImageToolbar from '@ckeditor/ckeditor5-image/src/imagetoolbar';
import ImageCaption from '@ckeditor/ckeditor5-image/src/imagecaption';
import ImageStyle from '@ckeditor/ckeditor5-image/src/imagestyle';
import ImageResize from '@ckeditor/ckeditor5-image/src/imageresize';
import LinkImage from '@ckeditor/ckeditor5-link/src/linkimage';

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		plugins: [ Image, ImageToolbar, ImageCaption, ImageStyle, ImageResize, LinkImage ],
		image: {
			toolbar: [
				'imageStyle:block',
				'imageStyle:side',
				'|',
				'toggleImageCaption',
				'imageTextAlternative',
				'|',
				'linkImage'
			]
		}
	} )
	.then( /* ... */ )
	.catch( /* ... */ );
```

<info-box info>
	Read more about {@link installation/plugins/installing-plugins installing plugins}.
</info-box>

## Inline and block images

Inline images can be inserted in the middle of a paragraph or a link just like regular text. Block images, on the other hand, can be inserted only between other blocks like paragraphs, tables, or media. Being larger and existing as standalone content, block images can also have individual captions. Other than that, both types of images can be resized, linked, etc.

By default, the {@link module:image/image~Image} plugin available in all {@link installation/getting-started/predefined-builds ready-to-use editor builds} provides support for both inline and block images, working as a glue for {@link module:image/imageinline~ImageInline} and {@link module:image/imageblock~ImageBlock} plugins:

<figure class="table">
	<table style="text-align: center">
		<thead>
			<tr>
				<th rowspan="2" style="vertical-align: middle">Loaded plugin</th>
				<th colspan="2">Available features</th>
			</tr>
			<tr>
				<th>Block images (with captions)</th>
				<th>Inline images</th>
			</tr>
		</thead>
		<tbody>
			<tr>
				<th><code>Image</code> (default)</th>
				<td>✅&nbsp; yes</td>
				<td>✅&nbsp; yes</td>
			</tr>
			<tr>
				<th><code>ImageBlock</code></th>
				<td>✅&nbsp; yes</td>
				<td>❌&nbsp; no</td>
			</tr>
			<tr>
				<th><code>ImageInline</code></th>
				<td>❌&nbsp; no</td>
				<td>✅&nbsp; yes</td>
			</tr>
		</tbody>
	</table>
</figure>

<info-box info>
	Up to CKEditor 5 v[27.1.0], only **block** images were supported. The support for **inline** images started in v[28.0.0] in all editor builds loading the `Image` plugin.

	If your integration depends on a ready–to–use editor build and you want to take advantage of updated CKEditor 5 but **without the support for inline images** (e.g. to maintain content compatibility), check out the {@link updating/update-to-29 official migration guide} that will help you configure the editor.
</info-box>

## Contribute

The source code of the feature is available on GitHub at [https://github.com/ckeditor/ckeditor5/tree/master/packages/ckeditor5-image](https://github.com/ckeditor/ckeditor5/tree/master/packages/ckeditor5-image).
