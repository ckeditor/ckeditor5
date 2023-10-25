---
category: features-images
menu-title: Installation
meta-title: Installation and configuration of the image features | CKEditor 5 Documentation
meta-description: Learn how to install and configure various image-related CKEdiotr 5 plugins.
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

Next, add the {@link features/images-overview#image-features plugins that you need} to your plugin list. You also need to set the desired image toolbar items. Notice the {@link features/toolbar#separating-toolbar-items separators} used to organize the toolbar.

```js
import { Image, ImageCaption, ImageResize, ImageStyle, ImageToolbar } from '@ckeditor/ckeditor5-image';
import { LinkImage } from '@ckeditor/ckeditor5-link';

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
			],
			insert: { 
				type: 'auto'
			}
			// If this setting is omitted, the editor defaults to `block`. See explanation below.
		},
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

By default, all images inserted into the content are treated as block images. It means, that inserting an image inside a paragraph (or inside other content blocks) will split the paragraph and add a new block for the image. Once inserted, the image can be turned into an inline image with the use of the {@link features/images-overview#image-contextual-toolbar contextual toolbar}.

To change this default behavior, you can use the `type` setting in the editor configuration:

```js
ClassicEditor.create( element, {
	image: {
		insert: {
			type: 'auto'
		}
	}
} );
```

There are three possible options: `auto`, `block`, and `inline`. The `auto` option uses the default setting, while the other two force the use of the selected image type at insert. If this setting is omitted in the configuration, the editor defaults to `block`.

## Contribute

The source code of the feature is available on GitHub at [https://github.com/ckeditor/ckeditor5/tree/master/packages/ckeditor5-image](https://github.com/ckeditor/ckeditor5/tree/master/packages/ckeditor5-image).
