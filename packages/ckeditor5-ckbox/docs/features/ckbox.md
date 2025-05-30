---
category: features-file-management
menu-title: CKBox
meta-title: CKBox file manager | CKEditor 5 Documentation
meta-description: Learn all about using the CKBox file manager and service with CKEditor 5
modified_at: 2022-06-20
order: 10
badges: [ premium ]
---

# CKBox file manager

CKBox is a dedicated asset manager supporting file and image upload. The CKBox feature lets you easily upload various files and insert images and links to other files into your content. It also offers image conversion and optimization capabilities and provides a {@link features/images-responsive responsive images mechanism} for CKEditor&nbsp;5.

<info-box>
	Unlock this feature with selected CKEditor Plans. [Sign up for a free trial](https://portal.ckeditor.com/checkout?plan=free), or [select the Plan](https://ckeditor.com/pricing/) that provides access to all the premium features you need.
</info-box>

## How CKBox enhances CKEditor&nbsp;5

As a full-fledged file manager, CKBox also replaces the basic CKEditor&nbsp;5 image upload feature. It provides image and file upload and management capabilities:

* Enables drag & drop uploads of images and other files.
* Transforms the _Image_ toolbar button, allowing the user to quickly upload and insert an image without opening the CKBox UI.
* Adds a separate dedicated toolbar button to open the CKBox UI to manage and reuse uploaded files.
* Provides [basic editing capabilities](https://ckeditor.com/docs/ckbox/latest/features/images/editing/editing.html), like crop, resize, rotate, and flip right from the {@link features/images-overview#image-contextual-toolbar image contextual toolbar} for images served by CKBox.
* Supports workspaces that allow separating assets for different users.

With CKBox you no longer need to write server-side code to upload and scale images or manage uploaded files.

To find out more about CKBox, the brand-new file manager and image editor, visit the [CKBox website](https://ckeditor.com/ckbox/) and read the dedicated [CKBox documentation page](https://ckeditor.com/docs/ckbox/latest/guides/index.html).

## Demo

To upload a file using CKBox, use the open file manager toolbar button {@icon @ckeditor/ckeditor5-icons/theme/icons/browse-files.svg Open file manager}. You can choose more than one file at a time. Use the edit image button {@icon @ckeditor/ckeditor5-icons/theme/icons/ckbox-image-edit.svg} from either the main toolbar or the image contextual toolbar to edit the selected image.

Note that the image toolbar button {@icon @ckeditor/ckeditor5-icons/theme/icons/image-upload.svg Image upload} will now also upload images right into the CKBox file manager and you can {@link features/drag-drop drag and drop} them, too. You can then access the files from the management panel.

{@snippet features/ckbox}

<info-box info>
	This demo presents a limited set of features. Visit the {@link examples/builds/full-featured-editor feature-rich editor example} to see more in action.
</info-box>

Image files are inserted into the content as images that you can drag around and resize. Non-embeddable files (like PDF files) are inserted as links.

You can also upload images by dragging them into your content. After you drag an image into the editor, it gets uploaded into the CKBox cloud storage and inserted into the content.

## Installation

<info-box info>
	⚠️ **New import paths**

	Starting with {@link updating/update-to-42 version 42.0.0}, we changed the format of import paths. This guide uses the new, shorter format. Refer to the {@link getting-started/legacy-getting-started/legacy-imports Packages in the legacy setup} guide if you use an older version of CKEditor&nbsp;5.
</info-box>

To use this feature in your application, you must first load the CKBox library and then enable CKBox integration in your rich-text editor instance.

The easiest way to load the CKBox library is to include the `<script>` tag loading the `ckbox.js` file first:

```html
<script src="https://cdn.ckbox.io/ckbox/2.4.0/ckbox.js"></script>
```

Please note, that while using the `latest` call instead of a version number is available, it is not advised. The latest version may bring breaking changes that will stall your CKBox integration.

The CKBox feature requires one of the following plugins to be loaded to work correctly:

* {@link module:image/imageblock~ImageBlock The `ImageBlock` feature}
* {@link module:image/imageinline~ImageInline The `ImageInline` feature}
* {@link module:image/image~Image The `Image` feature} (a glue plugin that loads both the `ImageBlock` and `ImageInline` features)

If you do not have any of these plugins in your editor, install one and add it to your plugin list.

Please also remember, that the CKBox plugin requires the following dependency plugins to work properly: `PictureEditing`, `ImageUpload`, and `CloudServices`.

You must include the `CKBoxImageEdit` plugin if you want to use CKBox image editing capabilities from within CKEditor&nbsp;5.

Finally, add {@link module:ckbox/ckbox~CKBox} to your plugin list and toolbar, and [configure](#configuration) the feature as needed. An example configuration may look like this:

<code-switcher>
```js
import { ClassicEditor, Image, ImageUpload, PictureEditing, CKBox, CKBoxImageEdit, CloudServices } from 'ckeditor5';

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		licenseKey: '<YOUR_LICENSE_KEY>',
		plugins: [ Image, PictureEditing, ImageUpload, CloudServices, CKBox, CKBoxImageEdit, /* ... */ ],
		toolbar: [ 'ckbox', 'ckboxImageEdit', /* ... */ ], // Depending on your preference.
		ckbox: {
			// Configuration.
		}
	} )
	.then( /* ... */ )
	.catch( /* ... */ );
```
</code-switcher>

Further in the document, the dependency plugins will be omitted in code listings for clarity.

### Adding the image editing button to the image toolbar

To invoke the CKBox image editor straight from the image contextual toolbar (available at right-click in an image), it needs to be added to the toolbar configuration.

{@img assets/img/toolbar-items.png 402 An extended contextual toolbar.}

The snippet below shows an example image contextual toolbar configuration.

```js
ClassicEditor
	.create( document.querySelector( '#editor' ), {
		// ... Other configuration options ...
		image: {
			toolbar: [ 'toggleImageCaption', 'imageTextAlternative', 'ckboxImageEdit' ]
		}
	} )
	.then( /* ... */ )
	.catch( /* ... */ );
```

## Configuration

The feature can be configured via the {@link module:ckbox/ckboxconfig~CKBoxConfig `config.ckbox`} object.

### Before you start

<info-box>
	This is a premium feature. [Contact us](https://ckeditor.com/contact/?sales=true#contact-form) to receive an offer tailored to your needs.

	You can also sign up for the [CKEditor Premium Features 14-day free trial](https://portal.ckeditor.com/checkout?plan=free) to test the feature.

	If you already have a valid license, please log into your [user dashboard](https://dashboard.ckeditor.com/) to access the feature settings.
</info-box>

After you purchase a license, log into the CKEditor Ecosystem customer dashboard to create access credentials, as explained in the [CKBox configuration guide](https://ckeditor.com/docs/ckbox/latest/guides/configuration/authentication.html).

### Defining upload categories

By default, the CKBox feature maps the uploaded image type to the category configured on the cloud service. You can override this behavior and provide your own mappings via the {@link module:ckbox/ckboxconfig~CKBoxConfig#defaultUploadCategories `config.ckbox.defaultUploadCategories`} configuration option. It is an object, where the keys define categories and their values are the types of images that will be uploaded to these categories. The categories might be referenced either by their name or by their ID. Referencing by ID is future-proof because it will not require configuration changes when a category name changes.

```js
ClassicEditor
	.create( document.querySelector( '#editor' ), {
		// ... Other configuration options ...
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

If you define your own upload category mappings for a particular image type, only your first found category will be taken into account while finding the appropriate category for the uploaded image. Category mappings configured on the server will not be searched in that case. The image will not be uploaded (and hence inserted into the editor) in the following cases:

* If you have defined your own category mapping in `defaultUploadCategories` for the uploaded image type:
   * The category does not exist on the server.
   * The category exists on the server, but the server configuration does not allow the uploaded image type.
* If you have not defined your own category mapping in `defaultUploadCategories` for the uploaded image type:
   * There is no category mapping for the uploaded image type on the server.

### Defining default upload workspace

The [CKBox workspaces](https://ckeditor.com/docs/ckbox/latest/features/file-management/workspaces.html) provide a convenient solution for achieving data isolation and user separation within CKBox. With workspaces, you can easily create separate storage and data spaces, giving you precise control over assigning specific users, user groups, or tenants to each workspace.

If the user is assigned to more than one workspace, by default all the files uploaded directly from CKEditor are located in the first workspace in the list of workspaces allowed in the user's JWT token. This corresponds to uploads through drag and drop into the editor area, pasting images from the clipboard, or images uploaded using the Image {@icon @ckeditor/ckeditor5-icons/theme/icons/image-upload.svg Image} feature. If you would like to define a specific workspace for files uploaded this way, you can define its ID in the `defaultUploadWorkspaceId` option. After that, all the files uploaded directly from CKEditor will be placed in the specified workspace.

```js
ClassicEditor
	.create( document.querySelector( '#editor' ), {
		// ... Other configuration options ...
		ckbox: {
			tokenUrl: 'https://your.token.url',
			// Sample workspace referenced by its ID.
			defaultUploadWorkspaceId: [ 'pHUSQFj_QIvc' ]
		}
	} )
	.then( /* ... */ )
	.catch( /* ... */ );
```

You can obtain the list of available workspaces using the [Workspaces REST API](https://ckeditor.com/docs/ckbox/latest/features/file-management/workspaces.html#managing-workspaces-with-the-rest-api).

### Adding the ID for inserted assets

After choosing an asset from the CKBox dialog, it is inserted into the editor content with a unique `data-ckbox-resource-id` attribute. If you want to disable it and do not want to add this attribute, set the {@link module:ckbox/ckboxconfig~CKBoxConfig#ignoreDataId `config.ckbox.ignoreDataId`} option to `true`:

```js
ClassicEditor
	.create( document.querySelector( '#editor' ), {
		// ... Other configuration options ...
		ckbox: {
			ignoreDataId: true
		}
	} )
	.then( /* ... */ )
	.catch( /* ... */ );
```

### Changing the language

By default, the CKBox dialog takes the current language from the editor. If you want to use a different language, you can set the language code in the {@link module:ckbox/ckboxconfig~CKBoxConfig#language `config.ckbox.language`} option:

```js
ClassicEditor
	.create( document.querySelector( '#editor' ), {
		// ... Other configuration options ...
		ckbox: {
			language: 'es'
		}
	} )
	.then( /* ... */ )
	.catch( /* ... */ );
```

Also, make sure to include the translation file after loading the CKBox library:

```html
<script src="https://cdn.ckbox.io/ckbox/2.4.0/ckbox.js"></script>
<script src="https://cdn.ckbox.io/ckbox/2.4.0/translations/es.js"></script>
```

### Providing the token URL

The CKBox feature requires the token endpoint URL configured in the {@link module:ckbox/ckboxconfig~CKBoxConfig#tokenUrl `config.ckbox.tokenUrl`} key. If not explicitly provided, the token URL from {@link module:cloud-services/cloudservicesconfig~CloudServicesConfig#tokenUrl `config.cloudServices.tokenUrl`} is used instead. If both are provided, the token URL defined in `config.ckbox.tokenUrl` takes precedence over the `config.cloudServices.tokenUrl`.

```js
ClassicEditor
	.create( document.querySelector( '#editor' ), {
		// ... Other configuration options ...
		ckbox: {
			tokenUrl: 'https://example.com/cs-token-endpoint'
		}
	} )
	.then( /* ... */ )
	.catch( /* ... */ );
```

### Configuring the API service

If you host the cloud service in your environment, you should configure the base URL of the API service via the {@link module:ckbox/ckboxconfig~CKBoxConfig#serviceOrigin `config.ckbox.serviceOrigin`} option:

```js
ClassicEditor
	.create( document.querySelector( '#editor' ), {
		// ... Other configuration options ...
		ckbox: {
			serviceOrigin: 'https://example.com/'
		}
	} )
	.then( /* ... */ )
	.catch( /* ... */ );
```

### Editing external images

If you want to allow CKBox to edit external images, not hosted by the file manager (for example, pasted via URL) you need to whitelist the URLs of the images. You can do this using the {@link module:ckbox/ckboxconfig~CKBoxConfig#allowExternalImagesEditing `config.ckbox.allowExternalImagesEditing`} option:

```js
ClassicEditor
	.create( document.querySelector( '#editor' ), {
		// ... Other configuration options ...
		ckbox: {
			allowExternalImagesEditing: [ 'origin', /^cksource.com/ ]
		}
	} )
	.then( /* ... */ )
	.catch( /* ... */ );
```

The image is editable if this option is:

* a regular expression and it matches the image URL, or
* a custom function that returns true for the image URL, or
* `origin` literal and the image URL is from the same origin, or
* an array of the above and the image URL matches one of the array elements.

<info-box warning>
	Make sure that the domains you whitelist have <acronym title="Cross-origin resource sharing">CORS</acronym> enabled, allowing to fetch the images from that domain. If you whitelist a domain without proper CORS configuration, you will get errors from the editor.
</info-box>

## Common API

The {@link module:ckbox/ckbox~CKBox} plugin registers:

* The `'ckbox'` UI button component for CKBox asset manager.
* The `'ckbox'` command implemented by the {@link module:ckbox/ckboxcommand~CKBoxCommand}.

You can open CKBox by executing the following code:

```js
editor.execute( 'ckbox' );
```

If you want to use the CKBox editing capabilities straight from the editor, the plugin will also register the following:

* The `'ckboxImageEdit'` UI button component for the CKBox image editor.
* The `'ckboxImageEdit'` command implemented by the {@link module:ckbox/ckboximageedit~CKBoxImageEdit}.

<info-box>
	We recommend using the official {@link framework/development-tools/inspector CKEditor&nbsp;5 inspector} for development and debugging. It will give you tons of useful information about the state of the editor such as internal data structures, selection, commands, and many more.
</info-box>

## What's next

Be sure to check out the comprehensive {@link features/image-upload Image upload overview} guide to learn more about different ways of uploading images in CKEditor&nbsp;5.

See the {@link features/images-overview image feature} guide to find out more about handling images in CKEditor&nbsp;5 in general.

<info-box warning>
	Need more functionality? [Take a survey and help us develop CKBox to suit your needs better!](https://www.surveymonkey.com/r/MG97W8S)
</info-box>

## Contribute

The source code of the feature is available on GitHub at [https://github.com/ckeditor/ckeditor5/tree/master/packages/ckeditor5-ckbox](https://github.com/ckeditor/ckeditor5/tree/master/packages/ckeditor5-ckbox).
