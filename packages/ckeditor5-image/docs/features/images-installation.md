---
category: features-images
menu-title: Installation
order: 100
---

## Installation

To add image features to your rich-text editor, install the [`@ckeditor/ckeditor5-image`](https://www.npmjs.com/package/@ckeditor/ckeditor5-image) package:

```plaintext
npm install --save @ckeditor/ckeditor5-image @ckeditor/ckeditor5-link
```

Next add the plugins that you need to your plugin list. You also need to set the desired image toolbar items.

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
				'imageStyle:full',
				'imageStyle:side',
				'|',
				'toggleImageCaption',
				'imageTextAlternative',
				'|',
				'linkImage'
			]
		}
	} )
	.then( ... )
	.catch( ... );
```


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

<info-box info>
	Read more about {@link builds/guides/integration/installing-plugins installing plugins}.
</info-box>

## Contribute

The source code of the feature is available on GitHub in https://github.com/ckeditor/ckeditor5/tree/master/packages/ckeditor5-image.
