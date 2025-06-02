---
category: features-file-management
menu-title: CKFinder
meta-title: CKFinder file manager | CKEditor 5 Documentation
meta-description: Learn all about using the CKFinder file manager and service with CKEditor 5
order: 20
badges: [ premium ]
---

# CKFinder file manager

{@snippet features/build-ckfinder-source}

The CKFinder feature lets you insert images and links to files into your content. CKFinder is a powerful file manager with various image editing and image upload options.

<info-box>
	Unlock this feature with selected CKEditor Plans. [Sign up for a free trial](https://portal.ckeditor.com/checkout?plan=free), or [select the Plan](https://ckeditor.com/pricing/) that provides access to all the premium features you need.
</info-box>

## Demos

### Image upload only

This demo shows the integration where the file manager's server connector handles [image upload](#configuring-the-image-upload-only) only:

* Paste an image directly into the editor. It will be automatically uploaded using the server-side connector.
* Use the insert image button {@icon @ckeditor/ckeditor5-icons/theme/icons/image-upload.svg Image} in the toolbar to insert an image.

{@snippet features/ckfinder-upload-only}

### Full integration

This demo shows the [full integration](#configuring-the-full-integration) with the CKFinder file uploader:

* Paste an image directly into the editor. It will be automatically uploaded using the server-side connector.
* Use the insert image or file button {@icon @ckeditor/ckeditor5-icons/theme/icons/browse-files.svg Browse files} in the toolbar to open the CKFinder file manager. Then insert an image or a link to any other file.

{@snippet features/ckfinder}

<info-box info>
	These demos present a limited set of features. Visit the {@link examples/builds/full-featured-editor feature-rich editor example} to see more in action.
</info-box>

## Additional feature information

The CKFinder integration feature is a bridge between the CKEditor&nbsp;5 WYSIWYG editor and the [CKFinder](https://ckeditor.com/ckfinder) file manager and uploader. CKFinder is a commercial application designed with CKEditor compatibility in mind. It is available as version 3.x for PHP, ASP.NET, and Java and version 2.x for ASP and ColdFusion.

You can use this feature in the rich-text editor in two different ways:

* [**As a server-side connector only**](#configuring-the-image-upload-only) ([demo](#image-upload-only)). In this scenario, images dropped or pasted into the editor are uploaded to the CKFinder server-side connector running on your server.
* [**As a server and client-side file manager integration**](#configuring-the-full-integration) ([demo](#full-integration)). Images dropped or pasted directly into the editor are uploaded to the server (just like in the first option).

	There are more cool features available, for instance:

	* **Uploading** using the full user interface.
	* Uploading **multiple files** at once.
	* **Browsing** previously uploaded images.
	* **Editing** images (cropping, resizing, etc.).
	* **Organizing** or deleting images.

	Check out the [CKFinder file manager website](https://ckeditor.com/ckfinder/) to learn more about the features you can use in your project.

## Installation

<info-box info>
	⚠️ **New import paths**

	Starting with {@link updating/update-to-42 version 42.0.0}, we changed the format of import paths. This guide uses the new, shorter format. Refer to the {@link getting-started/legacy-getting-started/legacy-imports Packages in the legacy setup} guide if you use an older version of CKEditor&nbsp;5.
</info-box>

After {@link getting-started/integrations-cdn/quick-start installing the editor}, add the feature to your plugin list and toolbar configuration:

<code-switcher>
```js
import { ClassicEditor, CKFinder, CKFinderUploadAdapter } from 'ckeditor5';

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		licenseKey: '<YOUR_LICENSE_KEY>',
		plugins: [ CKFinder, CKFinderUploadAdapter, /* ... */ ],
		toolbar: [ 'ckfinder', 'uploadImage', /* ... */ ], // Depending on your preference.
		ckfinder: {
			// Configuration.
		}
	} )
	.then( /* ... */ )
	.catch( /* ... */ );
```
</code-switcher>

## Configuration

The feature is configurable by using the {@link module:ckfinder/ckfinderconfig~CKFinderConfig `config.ckfinder`} object.

### Configuring the image upload only

This feature can upload images automatically to the server (for example, when the user drops an image into the content) thanks to the {@link module:adapter-ckfinder/uploadadapter~CKFinderUploadAdapter CKFinder upload adapter}. All it requires is the correct {@link module:ckfinder/ckfinderconfig~CKFinderConfig#uploadUrl `config.ckfinder.uploadUrl`} path.

Assuming that you [installed the CKFinder PHP server-side connector](https://ckeditor.com/docs/ckfinder/ckfinder3-php/quickstart.html#quickstart_installation_folders) (and it is available under `https://example.com/ckfinder/`), use the following [quick upload](https://ckeditor.com/docs/ckfinder/ckfinder3-php/commands.html#command_quick_upload) command URL to enable the image upload:

```js
ClassicEditor
	.create( document.querySelector( '#editor' ), {
		// ... Other configuration options ...
		ckfinder: {
			// Upload the images to the server using the CKFinder QuickUpload command.
			uploadUrl: 'https://example.com/ckfinder/core/connector/php/connector.php?command=QuickUpload&type=Images&responseType=json'
			}
		} )
	.then( /* ... */ )
	.catch( /* ... */ );
```

See the **[demo of the image upload only](#image-upload-only)**.

### Configuring the full integration

To use both the image upload functionality and the file manager user interface in your application, you must first load the CKFinder JavaScript library. Then enable the CKFinder integration in your rich-text editor instance.

The easiest way to load the CKFinder library is to include the `<script>` tag loading the `ckfinder.js` file first:

```html
<script src="https://example.com/ckfinder/ckfinder.js"></script>
```

Then:

* Make sure that the {@link module:ckfinder/ckfinder~CKFinder CKFinder plugin} for CKEditor&nbsp;5 is enabled. See the [Installation](#installation) section.
* To enable the automatic file upload to the server when an image is pasted or dropped into the editor content, set the correct {@link module:ckfinder/ckfinderconfig~CKFinderConfig#uploadUrl `config.ckfinder.uploadUrl`} path.
* To display the toolbar button that opens the CKFinder file manager UI allowing the users to choose the files on the server, make sure that `'ckfinder'` is present in your {@link module:core/editor/editorconfig~EditorConfig#toolbar `config.toolbar`}.
* Additionally, you can use {@link module:ckfinder/ckfinderconfig~CKFinderConfig#options `config.ckfinder.options`} to define [CKFinder's options](https://ckeditor.com/docs/ckfinder/ckfinder3/#!/api/CKFinder.Config). For example:
	* You can define [`options.resourceType`](https://ckeditor.com/docs/ckfinder/ckfinder3/#!/api/CKFinder.Config-cfg-resourceType) to tell CKFinder the specified resource type can be browsed when the user clicks the button.
	* You can define [`options.language`](https://ckeditor.com/docs/ckfinder/ckfinder3/#!/api/CKFinder.Config-cfg-language) to set the UI language of CKFinder. By default, it will be set to the UI language of the editor.

```js
ClassicEditor
	.create( document.querySelector( '#editor' ), {
		// ... Other configuration options ...
		ckfinder: {
			// Upload the images to the server using the CKFinder QuickUpload command.
			uploadUrl: 'https://example.com/ckfinder/core/connector/php/connector.php?command=QuickUpload&type=Images&responseType=json',

			// Define the CKFinder configuration (if necessary).
			options: {
				resourceType: 'Images'
			}
		}
	} )
	.then( /* ... */ )
	.catch( /* ... */ );
```

See the **[demo of the full integration](#full-integration)**.

#### Configuring the opener

You can change the way CKFinder opens using the {@link module:ckfinder/ckfinderconfig~CKFinderConfig#openerMethod `config.ckfinder.openerMethod`} option.

By default, the file manager opens as a modal. To open it in a new pop-up window, set the configuration value to `popup`:

```js
ClassicEditor
	.create( document.querySelector( '#editor' ), {
		// ... Other configuration options ...
		ckfinder: {
			// Open the file manager in the pop-up window.
			openerMethod: 'popup'
		}
	} )
	.then( /* ... */ )
	.catch( /* ... */ );
```

### Configuring allowed file types

You should configure the allowed file types that can be uploaded in two places:

* On the client side, in CKEditor&nbsp;5, restricting image upload through the CKEditor&nbsp;5 UI and commands
* On the server side, in CKFinder, restricting the file formats accepted in CKFinder

#### Client-side configuration

Use the {@link module:image/imageconfig~ImageUploadConfig#types `image.upload.types`} configuration option to define the allowed image MIME types that the users can upload to CKEditor&nbsp;5.

By default, users can upload `jpeg`, `png`, `gif`, `bmp`, `webp`, and `tiff` files, but you can customize this behavior to accept, for example, SVG files.

#### Server-side configuration

Use the `allowedExtensions` configuration option to define the file extension allowed to be uploaded with CKFinder for a particular resource type. Refer to the [relevant server-side connector documentation](https://ckeditor.com/docs/ckfinder/latest/) to learn more.

## Common API

The {@link module:ckfinder/ckfinder~CKFinder} plugin registers:

* The `'ckfinder'` UI button component.
* The `'ckfinder'` command implemented by the {@link module:ckfinder/ckfindercommand~CKFinderCommand}.

	You can open CKFinder by executing the following code:

	```js
	editor.execute( 'ckfinder' );
	```

Additionally, in the "image upload only" integration, you can use the following button and command registered by the {@link module:image/imageupload~ImageUpload} plugin:

* The `'uploadImage'` UI button component.
* The `'uploadImage'` command implemented by the {@link module:image/imageupload/uploadimagecommand~UploadImageCommand}.

<info-box>
	We recommend using the official {@link framework/development-tools/inspector CKEditor&nbsp;5 inspector} for development and debugging. It will give you tons of useful information about the state of the editor such as internal data structures, selection, commands, and many more.
</info-box>

## What's next

Check out the comprehensive {@link features/image-upload Image upload overview} to learn more about different ways of uploading images in CKEditor&nbsp;5.

See the {@link features/images-overview image feature guide} to find out more about handling images in CKEditor&nbsp;5.

## Contribute

The source code of the feature is available on GitHub at [https://github.com/ckeditor/ckeditor5/tree/master/packages/ckeditor5-ckfinder](https://github.com/ckeditor/ckeditor5/tree/master/packages/ckeditor5-ckfinder).
