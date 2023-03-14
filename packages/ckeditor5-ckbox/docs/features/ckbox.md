---
category: features-file-management
menu-title: CKBox
modified_at: 2022-06-20
order: 10
badges: [ premium ]
---

{@snippet features/build-ckbox-source}

# CKBox

The CKBox feature lets you easily insert images and links to other files into your content.

<info-box>
	This is a premium feature and you need a subscription to use it. You can [purchase it here](https://ckeditor.com/pricing/) for your open-source CKEditor implementation. [Contact us](https://ckeditor.com/contact/?sales=true#contact-form) if:
	* CKEditor commercial license is needed for your application.
	* You need the **on-premises (self-hosted)** version of the service.
	* You have other licensing questions.

	You can also sign up for the [CKEditor Premium Features 30-day free trial](https://orders.ckeditor.com/trial/premium-features) to test the feature.

	This feature is enabled by default in all [predefined builds](https://ckeditor.com/docs/ckeditor5/latest/installation/getting-started/predefined-builds.html) for convenience, but the editor will still work properly without activating it.
</info-box>

## How CKBox enhances CKEditor 5

CKBox replaces the basic CKEditor 5 image upload feature. It provides the image and file upload and management capabilities:

* Enables drag & drop uploads of images and other files.
* Transforms the _Image_ toolbar button, allowing the user to quickly upload and insert an image without opening the CKBox UI.
* Adds a separate dedicated toolbar button to open the CKBox UI to manage and reause uploaded files.

With CKBox you no longer need to write server-side code to upload and scale images or manage uploaded files.

To find out more about CKBox, the brand-new file manager, visit the [CKBox website](https://ckeditor.com/ckbox/) and read the dedicated [CKBox documentation page](https://ckeditor.com/docs/ckbox/latest/guides/index.html).

## Demo

Use the open file manager toolbar button {@icon @ckeditor/ckeditor5-ckbox/theme/icons/browse-files.svg Open file manager} to open the CKBox dialog window. Then select an image and click the Choose button. The selected image will appear in the content. You can choose more than one file at a time. Play around, changing the alignment and size of the images. See more instructions below the demo.

Please observe that the usual image icon {@icon @ckeditor/ckeditor5-core/theme/icons/image.svg Insert image} will now also upload images into the CKBox file manager. They will be accesible from the management panel.

{@snippet features/ckbox}

<info-box info>
	This demo only presents a limited set of features. Visit the {@link examples/builds/full-featured-editor full-featured editor example} to see more in action.
</info-box>

Non-embeddable files (like PDFs) are inserted as links. To test it, open the CKBox dialog again and choose any PDF file. A link will appear in the content. After you click this link, the file will be automatically downloaded.

The CKBox feature also supports uploading images. Drag any image into the editor content and it will be uploaded into the CKBox cloud storage. The uploaded file will be then automatically inserted into the content. If you want to upload a non-image file type (such as a PDF or a text file) to the cloud storage, just open the CKBox dialog and use the Upload button.

## Installation

<info-box info>
	This feature is enabled by default in all {@link installation/getting-started/predefined-builds predefined builds}. The installation instructions are for developers interested in building their own, custom WYSIWYG editor.
</info-box>

To use this feature in your application, you must first load the CKBox library and then enable CKBox integration in your rich-text editor instance.

The easiest way to load the CKBox library is to include the `<script>` tag loading the `ckbox.js` file first:

```html
<script src="https://cdn.ckbox.io/ckbox/latest/ckbox.js"></script>
```

Then, install the [`@ckeditor/ckeditor5-ckbox`](https://www.npmjs.com/package/@ckeditor/ckeditor5-ckbox) package:

```bash
npm install --save @ckeditor/ckeditor5-ckbox
```

The CKBox feature requires one of the following plugins to be loaded to work correctly:

* {@link module:image/imageblock~ImageBlock The `ImageBlock` feature}
* {@link module:image/imageinline~ImageInline The `ImageInline` feature}
* {@link module:image/image~Image The `Image` feature} (a glue plugin that loads both the `ImageBlock` and `ImageInline` features)

If you do not have any of them in your editor, install one and add it to your plugin list.

Finally, add {@link module:ckbox/ckbox~CKBox} to your plugin list and [configure](#configuration) the feature as needed. An example configuration may look like this:

```js
import CKBox from '@ckeditor/ckeditor5-ckbox/src/ckbox';

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		plugins: [ CKBox, /* ... */ ],
		toolbar: [ 'ckbox', /* ... */ ], // Depending on your preference.
		ckbox: {
			// Feature configuration.
			// ...
		}
	} )
	.then( /* ... */ )
	.catch( /* ... */ );
```

## Configuration

The feature can be configured via the {@link module:ckbox/ckbox~CKBoxConfig `config.ckbox`} object.

### Before you start

<info-box>
	This is a premium feature. [Contact us](https://ckeditor.com/contact/?sales=true#contact-form) to receive an offer tailored to your needs. 

	You can also sign up for the [CKEditor Premium Features 30-day free trial](https://orders.ckeditor.com/trial/premium-features) to test the feature.

	If you already have a valid license, please log into your [user dashboard](https://dashboard.ckeditor.com/) to access the feature settings.
</info-box>

<info-box>
	There is a [free personal plan](https://ckeditor.com/pricing/#plan-ckbox). However, it still requires a sign-up.
</info-box>

After you purchase a license, log into the CKEditor Ecosystem customer dashboard to create access credentials, as explained in the {@link @ckbox guides/configuration/authentication CKBox configuration guide}.

### Defining upload categories

By default, the CKBox feature maps the uploaded image type to the category configured on the cloud service. You can override this behavior and provide your own mappings via the {@link module:ckbox/ckbox~CKBoxConfig#defaultUploadCategories `config.ckbox.defaultUploadCategories`} configuration option. It is an object, where the keys define categories and their values are the types of images that will be uploaded to these categories. The categories might be referenced either by their name or by their ID. Referencing by ID is future-proof because it will not require configuration changes when a category name changes.

```js
import CKBox from '@ckeditor/ckeditor5-ckbox/src/ckbox';

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		plugins: [ CKBox, /* ... */ ],
		toolbar: [ 'ckbox', /* ... */ ],
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
	.then( /* ... */ )
	.catch( /* ... */ );
```

Please keep in mind that if you define your own upload category mappings for a particular image type, only your first found category will be taken into account while finding the appropriate category for the uploaded image. Category mappings configured on the server will not be searched in that case. The image will not be uploaded (and hence inserted into the editor) in the following cases:

* If you have defined your own category mapping in `defaultUploadCategories` for the uploaded image type:
   * The category does not exist on the server.
   * The category exists on the server, but the server configuration does not allow the uploaded image type.
* If you have not defined your own category mapping in `defaultUploadCategories` for the uploaded image type:
   * There is no category mapping for the uploaded image type on the server.

### Adding the ID for inserted assets

After choosing an asset from the CKBox dialog, it is inserted into the editor content with a unique `data-ckbox-resource-id` attribute. If you want to disable it and do not want to add this attribute, set the {@link module:ckbox/ckbox~CKBoxConfig#ignoreDataId `config.ckbox.ignoreDataId`} option to `true`:

```js
import CKBox from '@ckeditor/ckeditor5-ckbox/src/ckbox';

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		plugins: [ CKBox, /* ... */ ],
		toolbar: [ 'ckbox', /* ... */ ],
		ckbox: {
			ignoreDataId: true
		}
	} )
	.then( /* ... */ )
	.catch( /* ... */ );
```

### Changing the language

By default, the CKBox dialog takes the current language from the editor. If you want to use a different language, you can set the language code in the {@link module:ckbox/ckbox~CKBoxConfig#language `config.ckbox.language`} option:

```js
import CKBox from '@ckeditor/ckeditor5-ckbox/src/ckbox';

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		plugins: [ CKBox, /* ... */ ],
		toolbar: [ 'ckbox', /* ... */ ],
		ckbox: {
			language: 'es'
		}
	} )
	.then( /* ... */ )
	.catch( /* ... */ );
```

Also, make sure to include the translation file after loading the CKBox library:

```html
<script src="https://cdn.ckbox.io/ckbox/latest/ckbox.js"></script>
<script src="https://cdn.ckbox.io/CKBox/1.2.1/translations/es.js"></script>
```

### Providing the token URL

The CKBox feature requires the token endpoint URL configured in the {@link module:ckbox/ckbox~CKBoxConfig#tokenUrl `config.ckbox.tokenUrl`} key. If not explicitly provided, the token URL from {@link module:cloud-services/cloudservices~CloudServicesConfig#tokenUrl `config.cloudServices.tokenUrl`} is used instead. If both are provided, the token URL defined in `config.ckbox.tokenUrl` takes precedence over the `config.cloudServices.tokenUrl`.

```js
import CKBox from '@ckeditor/ckeditor5-ckbox/src/ckbox';

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		plugins: [ CKBox, /* ... */ ],
		toolbar: [ 'ckbox', /* ... */ ],
		ckbox: {
			tokenUrl: 'https://example.com/cs-token-endpoint'
		}
	} )
	.then( /* ... */ )
	.catch( /* ... */ );
```

### Configuring the API service and assets origin

If the cloud service is hosted in your own environment, you should configure the base URL of the API service via the {@link module:ckbox/ckbox~CKBoxConfig#serviceOrigin `config.ckbox.serviceOrigin`} and {@link module:ckbox/ckbox~CKBoxConfig#assetsOrigin `config.ckbox.assetsOrigin`} options:

```js
import CKBox from '@ckeditor/ckeditor5-ckbox/src/ckbox';

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		plugins: [ CKBox, /* ... */ ],
		toolbar: [ 'ckbox', /* ... */ ],
		ckbox: {
			serviceOrigin: 'https://example.com/',
			assetsOrigin: 'https://cloud.example.com/',
		}
	} )
	.then( /* ... */ )
	.catch( /* ... */ );
```

## Common API

The {@link module:ckbox/ckbox~CKBox} plugin registers:

* The `'ckbox'` UI button component
* The `'ckbox'` command implemented by the {@link module:ckbox/ckboxcommand~CKBoxCommand}

	You can open CKBox by executing the following code:

	```js
	editor.execute( 'ckbox' );
	```

<info-box>
	We recommend using the official {@link framework/development-tools#ckeditor-5-inspector CKEditor 5 inspector} for development and debugging. It will give you tons of useful information about the state of the editor such as internal data structures, selection, commands, and many more.
</info-box>

## What's next?

Be sure to check out the comprehensive {@link features/image-upload Image upload overview} guide to learn more about different ways of uploading images in CKEditor 5.

See the {@link features/images-overview image feature} guide to find out more about handling images in CKEditor 5 in general.

## Contribute

The source code of the feature is available on GitHub at [https://github.com/ckeditor/ckeditor5/tree/master/packages/ckeditor5-ckbox](https://github.com/ckeditor/ckeditor5/tree/master/packages/ckeditor5-ckbox).
