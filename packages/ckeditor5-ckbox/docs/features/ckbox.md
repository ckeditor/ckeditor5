---
category: features-image-upload
menu-title: CKBox file manager
modified_at: 2022-06-20
order: 30
---

{@snippet features/build-ckbox-source}

# CKBox file manager

This CKBox integration feature allows you to effortlessly and intuitively insert images as well as links to other files into the rich-text editor content. <!-- TODO: need to be linked once the product page is ready-->CKBox is a file manager and a file uploader that acts as a convenient interface for the cloud storage service. The CKBox feature provides a simple integration with this service for the CKEditor 5 WYSIWYG editor.

<info-box info>
	CKBox is a commercial solution. Please [contact us](https://ckeditor.com/contact/) if you would like to purchase a license. Let us know if you have any feedback or questions!

	This feature is enabled by default in all {@link installation/advanced/predefined-builds predefined builds} for convenience, but the editor will still work properly without activating it.
</info-box>

## Demo

Use the Open file manager toolbar button {@icon @ckeditor/ckeditor5-ckbox/theme/icons/browse-files.svg Open file manager} to invoke the CKBox dialog window. After the dialog is opened, find an interesting image and click on the Choose button. The selected image should be inserted into the editor content. You can choose more than one file at once.

Non-embeddable files (e.g. PDF files) will be inserted into editor content as links. To test it, open the CKBox dialog again and choose any PDF file. It should be inserted as a link in the editor content. After clicking this link, it is automatically downloaded.

The CKBox feature also supports uploading images. Drag any image into the editor content and it will be uploaded into the CKBox cloud storage. The uploaded file is then automatically inserted in the editor content. If you want to upload a non-image file type (such as a PDF or a text file) to the cloud storage, just open the CKBox dialog and use the Upload button.

{@snippet features/ckbox}

## Installation

<info-box info>
	This feature is enabled by default in all predefined builds. The installation instructions are for developers interested in building their own, custom WYSIWYG editor.
</info-box>

To use this feature in your application, you must first load the CKBox library and then enable CKBox integration in your rich-text editor instance.

The easiest way to load the CKBox library is to include the `<script>` tag loading the `ckbox.js` file first:

```html
<script src="https://cdn.ckbox.io/CKBox/0.0.3/ckbox.js"></script>
```

Then, install the [`@ckeditor/ckeditor5-ckbox`](https://www.npmjs.com/package/@ckeditor/ckeditor5-ckbox) package:

```bash
npm install --save @ckeditor/ckeditor5-ckbox
```

The CKBox feature requires one of the following plugins to be loaded to work correctly:

* {@link module:image/imageblock~ImageBlock the `ImageBlock` feature},
* {@link module:image/imageinline~ImageInline the `ImageInline` feature},
* {@link module:image/image~Image the `Image` feature} (a glue plugin that loads both the `ImageBlock` and `ImageInline` features).

If you do not have any of them in your editor, install one and add it to your plugin list.

Finally, add {@link module:ckbox/ckbox~CKBox} to your plugin list and [configure](#configuration) the feature as needed. An example configuration may look like this:

```js
import CKBox from '@ckeditor/ckeditor5-ckbox/src/ckbox';

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		plugins: [ CKBox, ... ],
		toolbar: [ 'ckbox', ... ], // Depending on your preference.
		ckbox: {
			// Feature configuration.
		}
	} )
	.then( ... )
	.catch( ... );
```

## Configuration

The feature can be configured via the {@link module:ckbox/ckbox~CKBoxConfig `config.ckbox`} object.

### Defining upload categories

By default, CKBox feature maps the uploaded image type to the category configured on the cloud service. You can override this behavior and provide your own mappings via the {@link module:ckbox/ckbox~CKBoxConfig#defaultUploadCategories `config.ckbox.defaultUploadCategories`} configuration option. It is an object, where the keys define categories and their values are the types of images that will be uploaded to these categories. The categories might be referenced either by their name or by their ID. Referencing by ID is future-proof, because it will not require configuration changes when a category name is changed.

```js
import CKBox from '@ckeditor/ckeditor5-ckbox/src/ckbox';

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		plugins: [ CKBox, ... ],
		toolbar: [ 'ckbox', ... ],
		ckbox: {
			defaultUploadCategories: {
				Bitmaps: [ 'bmp' ],
				Pictures: [ 'jpg', 'jpeg' ],
				Scans: [ 'png', 'tiff' ],
				// The category below is referenced by its ID.
				'fdf2a647-b67f-4a6c-b692-5ba1dc1ed87b': [ 'gif' ]
			}
		}
	} )
	.then( ... )
	.catch( ... );
```

Please keep in mind that if you define your own upload category mappings, only these will be taken into account while finding the appropriate category for the uploaded image type as the cloud service configuration will be overridden. Category mappings configured on the server will not be searched in that case. The image will not be uploaded (and inserted) into the editor in the following cases:

* If you have defined your own category mappings in `defaultUploadCategories`:
   * the category for the uploaded image type is not defined there,
   * the category does not exist on the server,
   * the category exists on the server, but it does not allow the uploaded image type.
* If you have not defined your own category mappings in `defaultUploadCategories`:
   * there is no category mapping for the uploaded image on the server.

### Adding the ID for inserted assets

After choosing an asset from the CKBox dialog, it is inserted into the editor content with a unique `data-ckbox-resource-id` attribute. If you want to disable it and do not want to add this attribute, set the {@link module:ckbox/ckbox~CKBoxConfig#ignoreDataId `config.ckbox.ignoreDataId`} option to `true`:

```js
import CKBox from '@ckeditor/ckeditor5-ckbox/src/ckbox';

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		plugins: [ CKBox, ... ],
		toolbar: [ 'ckbox', ... ],
		ckbox: {
			ignoreDataId: true
		}
	} )
	.then( ... )
	.catch( ... );
```

### Providing the token URL

The CKBox feature requires the token endpoint URL configured in the {@link module:ckbox/ckbox~CKBoxConfig#tokenUrl `config.ckbox.tokenUrl`} key. If not explicitly provided, the token URL from {@link module:cloud-services/cloudservices~CloudServicesConfig#tokenUrl `config.cloudServices.tokenUrl`} is used instead. If both are provided, the token URL defined in `config.ckbox.tokenUrl` takes precedence over the `config.cloudServices.tokenUrl`.

```js
import CKBox from '@ckeditor/ckeditor5-ckbox/src/ckbox';

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		plugins: [ CKBox, ... ],
		toolbar: [ 'ckbox', ... ],
		ckbox: {
			tokenUrl: 'https://example.com/cs-token-endpoint'
		}
	} )
	.then( ... )
	.catch( ... );
```

### Configuring the API service origin

If the cloud service is hosted in your own environment you should configure the base URL of the API service via the {@link module:ckbox/ckbox~CKBoxConfig#serviceOrigin `config.ckbox.serviceOrigin`} option:

```js
import CKBox from '@ckeditor/ckeditor5-ckbox/src/ckbox';

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		plugins: [ CKBox, ... ],
		toolbar: [ 'ckbox', ... ],
		ckbox: {
			serviceOrigin: 'https://example.com/'
		}
	} )
	.then( ... )
	.catch( ... );
```

## Common API

The {@link module:ckbox/ckbox~CKBox} plugin registers:

* The `'ckbox'` UI button component.
* The `'ckbox'` command implemented by the {@link module:ckbox/ckboxcommand~CKBoxCommand}.

	You can open CKBox by executing the following code:

	```js
	editor.execute( 'ckbox' );
	```

<info-box>
	We recommend using the official {@link framework/guides/development-tools#ckeditor-5-inspector CKEditor 5 inspector} for development and debugging. It will give you tons of useful information about the state of the editor such as internal data structures, selection, commands, and many more.
</info-box>

## What's next?

Be sure to check out the comprehensive {@link features/image-upload Image upload overview} guide to learn more about different ways of uploading images in CKEditor 5.

See the {@link features/images-overview image feature} guide to find out more about handling images in CKEditor 5 in general.

## Contribute

The source code of the feature is available on GitHub in https://github.com/ckeditor/ckeditor5/tree/master/packages/ckeditor5-ckbox.

