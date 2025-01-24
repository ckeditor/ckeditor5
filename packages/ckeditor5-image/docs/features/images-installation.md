---
category: features-images
menu-title: Installation
meta-title: Installation and configuration of the image features | CKEditor 5 Documentation
meta-description: Learn how to install and configure various image-related CKEdiotr 5 plugins.
order: 15
modified_at: 2021-06-17
---

# Installation

<info-box info>
	⚠️ **New import paths**

	Starting with {@link updating/update-to-42 version 42.0.0}, we changed the format of import paths. This guide uses the new, shorter format. Refer to the {@link getting-started/legacy-getting-started/legacy-imports Packages in the legacy setup} guide if you use an older version of CKEditor&nbsp;5.
</info-box>

After {@link getting-started/integrations-cdn/quick-start installing the editor},  add the {@link features/images-overview#image-features subfeatures that you need} to your plugin list and to the editor toolbar:

<code-switcher>
```js
import {
	ClassicEditor,
	Image,
	ImageCaption,
	ImageResize,
	ImageStyle,
	ImageToolbar,
	LinkImage
} from 'ckeditor5';

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		licenseKey: '<YOUR_LICENSE_KEY>', // Or 'GPL'.
		plugins: [ Image, ImageToolbar, ImageCaption, ImageStyle, ImageResize, LinkImage ],
		toolbar: [ 'insertImage', /* ... */ ],
		image: {
			// Configuration.
		}
	} )
	.then( /* ... */ )
	.catch( /* ... */ );
```
</code-switcher>

## Configuring the toolbar dropdown

The Image feature comes with the unified image insert dropdown component {@icon @ckeditor/ckeditor5-icons/theme/icons/image-upload.svg Image insert}. It automatically collects installed image insert methods. For example, if you install the `ImageUpload` plugin, the corresponding button will automatically appear in the dropdown. You only need to add a button to the toolbar:

```js
ClassicEditor
	.create( document.querySelector( '#editor' ), {
		// ... Other configuration options ...
		toolbar: [ 'insertImage', /* ... */ ]
	} )
	.then( /* ... */ )
	.catch( /* ... */ );
```

The feature is pre-configured to include the following image insertion methods:

* `upload` - Upload image from computer. It uses the configured image upload adapter. {@icon @ckeditor/ckeditor5-icons/theme/icons/image-upload.svg Image upload}
* `assetManager` - Opens the installed asset manager (for example the CKBox). {@icon @ckeditor/ckeditor5-icons/theme/icons/image-asset-manager.svg Asset manager}
* `url` - Allows inserting an image by directly specifying its URL. Integration provided by `ImageInsertViaUrl` feature. {@icon @ckeditor/ckeditor5-icons/theme/icons/image-url.svg Insert via URL}

Note that the insert methods mentioned above will only be added if you install dedicated features. However, not all features are required. If only one is available, it will be indicated by the toolbar dropdown icon.

If you need to limit the methods included in the dropdown (apart from not installing a specific feature) or change their order you can use the `image.insert.integration` configuration option:

```js
ClassicEditor
	.create( document.querySelector( '#editor' ), {
		// ... Other configuration options ...
		image: {
			insert: {
				// This is the default configuration, you do not need to provide
				// this configuration key if the list content and order reflects your needs.
				integrations: [ 'upload', 'assetManager', 'url' ]
			}
		}
	} )
	.then( /* ... */ )
	.catch( /* ... */ );
```

## Configuring the contextual image toolbar

You also need to configure the desired contextual image toolbar items. Notice the {@link getting-started/setup/toolbar#separating-toolbar-items separators} used to organize the toolbar.

```js

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		// ... Other configuration options ...
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
				// If this setting is omitted, the editor defaults to 'block'.
				// See explanation below.
				type: 'auto'
			}
		}
	} )
	.then( /* ... */ )
	.catch( /* ... */ );
```

## Inline and block images

Inline images can be inserted in the middle of a paragraph or a link just like regular text. Block images, on the other hand, can be inserted only between other blocks like paragraphs, tables, or media. Being larger and existing as standalone content, block images can also have individual captions. Other than that, both types of images can be resized, linked, etc.

By default, the {@link module:image/image~Image} plugin supports both inline and block images, working as a glue for the {@link module:image/imageinline~ImageInline} and {@link module:image/imageblock~ImageBlock} plugins.

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

By default, if the `image.insert.type` configuration is not specified, all images inserted into the content will be treated as block images. This means that inserting an image inside a paragraph (or other content blocks) will create a new block for the image immediately below or above the current paragraph or block. After insertion, you can transform the block image into an inline image using the {@link features/images-overview#image-contextual-toolbar contextual toolbar}.

If you wish to modify this behavior, the `type` setting in the editor configuration can be used:

```js
ClassicEditor
	.create( element, {
		image: {
			insert: {
				type: 'auto'
			}
		}
	} );
```

The `type` setting accepts the following three values:

* `'auto'`: The editor determines the image type based on the cursor's position. For example, if you insert an image in the middle of a paragraph, it will be inserted as inline. If you insert it at the end or beginning of a paragraph, it becomes a block image.
* `'block'`: Always insert images as block elements, placing them below or above the current paragraph or block.
* `'inline'`: Always insert images as inline elements within the current paragraph or block.

If the `type` setting is omitted from the configuration, the behavior defaults to inserting images as a block.

**Important**: If only one type of image plugin is enabled (for example, `ImageInline` is enabled but `ImageBlock` is not), the `image.insert.type` configuration will be effectively ignored and the supported image type will be used.

## Contribute

The source code of the feature is available on GitHub at [https://github.com/ckeditor/ckeditor5/tree/master/packages/ckeditor5-image](https://github.com/ckeditor/ckeditor5/tree/master/packages/ckeditor5-image).
