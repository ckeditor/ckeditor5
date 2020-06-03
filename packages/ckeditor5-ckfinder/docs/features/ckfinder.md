---
category: features-image-upload
menu-title: CKFinder file manager
order: 30
---

{@snippet features/build-ckfinder-source}

# CKFinder file manager integration

This feature allows you to insert images as well as links to files into the rich-text editor content. It is a bridge between the CKEditor 5 WYSIWYG editor and the [CKFinder](https://ckeditor.com/ckfinder) file manager and uploader.

<info-box>
	Check out the comprehensive {@link features/image-upload Image upload overview} to learn about other ways to upload images into CKEditor 5.
</info-box>

This feature can be used in the rich-text editor in two different ways:

* [**As a server-side connector only**](#configuring-the-image-upload-only) ([demo](#image-upload-only)). In this scenario, images which are dropped or pasted into the editor are uploaded to the CKFinder server-side connector running on your server.
* [**As a server and client-side file manager integration**](#configuring-the-full-integration) ([demo](#full-integration)). Images dropped and pasted directly into the editor are uploaded to the server (just like in the first option).

	But there are more cool features available, for instance:

	* **uploading** using the full user interface,
	* uploading **multiple files** at once,
	* **browsing** previously uploaded images,
	* **editing** images (cropping, resizing, etc.),
	* **organizing** or deleting images.

	Check out the [CKFinder file manager website](https://ckeditor.com/ckfinder/) to learn more about the features you can use in your project.

<info-box info>
	This feature is enabled by default in all builds.
</info-box>

## Demo

### Image upload only

This demo shows the integration where the file manager's server connector handles [the image upload](#configuring-the-full-integration) only:

* Paste the image directly into the rich-text editor content and it will be automatically uploaded using the server-side connector.
* Use the "Insert image" button in the toolbar to insert an image.

{@snippet features/ckfinder-upload-only}

### Full integration

This demo shows the [full integration](#configuring-the-full-integration) with the CKFinder file uploader:

* Paste the image directly into the rich-text editor content and it will be automatically uploaded using the server-side connector.
* Use the "Insert image or file" button in the toolbar to open the CKFinder file manager and insert an image or a link to any other file.

{@snippet features/ckfinder}


## Configuration

The feature is configurable by using the {@link module:ckfinder/ckfinder~CKFinderConfig `config.ckfinder`} object.

### Configuring the image upload only

This feature can upload images automatically to the server (e.g. when the image is dropped into the content) thanks to the {@link module:adapter-ckfinder/uploadadapter~CKFinderUploadAdapter CKFinder upload adapter}. All it requires is the correct {@link module:ckfinder/ckfinder~CKFinderConfig#uploadUrl `config.ckfinder.uploadUrl`} path.

Assuming that the [CKFinder PHP server-side connector is installed](https://ckeditor.com/docs/ckfinder/ckfinder3-php/quickstart.html#quickstart_installation_folders) (available) under `https://example.com/ckfinder/`, use the following [quick upload](https://ckeditor.com/docs/ckfinder/ckfinder3-php/commands.html#command_quick_upload) command URL to enable the image upload:

```js
import CKFinder from '@ckeditor/ckeditor5-ckfinder/src/ckfinder';

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		plugins: [ CKFinder, ... ],

		// Enable the "Insert image" button in the toolbar.
		toolbar: [ 'imageUpload', ... ],

		ckfinder: {
			// Upload the images to the server using the CKFinder QuickUpload command.
			uploadUrl: 'https://example.com/ckfinder/core/connector/php/connector.php?command=QuickUpload&type=Images&responseType=json'
		}
	} )
	.then( ... )
	.catch( ... );
```

See the **[demo of the image upload only](#image-upload-only)**.

### Configuring the full integration

To use both the image upload functionality and the file manager user interface in your application, you must first load the CKFinder JavaScript library and then enable CKFinder integration in your rich-text editor instance.

The easiest way to load the CKFinder library is to include the `<script>` tag loading the `ckfinder.js` file first:

```html
<script src="https://ckeditor.com/apps/ckfinder/3.5.0/ckfinder.js"></script>
```

Then:

* Make sure that the {@link module:ckfinder/ckfinder~CKFinder CKFinder plugin} for CKEditor 5 is enabled. See the [Installation](#installation) section.
* In order to enable the automatic file upload to the server when an image is pasted or dropped into the editor content, remember to set the correct {@link module:ckfinder/ckfinder~CKFinderConfig#uploadUrl `config.ckfinder.uploadUrl`} path.
* In order to display the toolbar button that opens the CKFinder file manager UI allowing the users to choose the files on the server, make sure that `'ckfinder'` is present in your {@link module:core/editor/editorconfig~EditorConfig#toolbar `config.toolbar`}.
* Additionally, you can use {@link module:ckfinder/ckfinder~CKFinderConfig#options `config.ckfinder.options`} to define [CKFinder's options](https://ckeditor.com/docs/ckfinder/ckfinder3/#!/api/CKFinder.Config). For example:
	* You can define [`options.resourceType`](https://ckeditor.com/docs/ckfinder/ckfinder3/#!/api/CKFinder.Config-cfg-resourceType) to tell CKFinder the specified resource type can be browsed when the user clicks the button.
	* You can define [`options.language`](https://ckeditor.com/docs/ckfinder/ckfinder3/#!/api/CKFinder.Config-cfg-language) to set the UI language of CKFinder. By default it will be set to the UI language of the editor.

```js
import CKFinder from '@ckeditor/ckeditor5-ckfinder/src/ckfinder';

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		plugins: [ CKFinder, ... ],

		// Enable the CKFinder button in the toolbar.
		toolbar: [ 'ckfinder', ... ]

		ckfinder: {
			// Upload the images to the server using the CKFinder QuickUpload command.
			uploadUrl: 'https://example.com/ckfinder/core/connector/php/connector.php?command=QuickUpload&type=Images&responseType=json',

			// Define the CKFinder configuration (if necessary).
			options: {
				resourceType: 'Images'
			}
		}
	} )
	.then( ... )
	.catch( ... );
```

See the **[demo of the full integration](#full-integration)**.

#### Configuring the opener

You can change the way CKFinder opens using the {@link module:ckfinder/ckfinder~CKFinderConfig#openerMethod `config.ckfinder.openerMethod`} option.

By default, the file manager opens as a modal. To open it in a new "pop-up" window, set the configuration value to `popup`:

```js
import CKFinder from '@ckeditor/ckeditor5-ckfinder/src/ckfinder';

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		plugins: [ CKFinder, ... ],
		toolbar: [ 'ckfinder', ... ]
		ckfinder: {
			// Open the file manager in the pop-up window.
			openerMethod: 'popup'
		}
	} )
	.then( ... )
	.catch( ... );
```

### Configuring allowed file types

The allowed file types that can be uploaded should actually be configured in two places:

* On the client side, in CKEditor 5, restricting image upload through the CKEditor 5 UI and commands.
* On the server side, in CKFinder, restricting the file formats that are accepted in CKFinder.

#### Client-side configuration

Use the {@link module:image/imageupload~ImageUploadConfig#types `image.upload.types`} configuration option to define the allowed image MIME types that can be uploaded to CKEditor 5.

By default, users are allowed to upload `jpeg`, `png`, `gif`, `bmp`, `webp` and `tiff` files, but you can customize this behavior to accept, for example, SVG files.

#### Server-side configuration

Use the `allowedExtensions` configuration option to define the file extension allowed to be uploaded with CKFinder for a particular resource type. Refer to the [relevant server-side connector documentation](https://ckeditor.com/docs/ckfinder/latest/) to learn more.

## Installation

<info-box info>
	This feature is enabled by default in all builds. The installation instructions are for developers interested in building their own, custom WYSIWYG editor.
</info-box>

To add this feature to your editor, install the [`@ckeditor/ckeditor5-ckfinder`](https://www.npmjs.com/package/@ckeditor/ckeditor5-ckfinder) package:

```bash
npm install --save @ckeditor/ckeditor5-ckfinder
```

Then add {@link module:ckfinder/ckfinder~CKFinder} to your plugin list and [configure](#configuration) the feature (when necessary). For instance:

```js
import CKFinder from '@ckeditor/ckeditor5-ckfinder/src/ckfinder';

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		plugins: [ CKFinder, ... ],
		toolbar: [ 'ckfinder', 'imageUpload' ... ], // Depending on your preference.
		ckfinder: {
			// Feature configuration.
		}
	} )
	.then( ... )
	.catch( ... );
```

## Common API

The {@link module:ckfinder/ckfinder~CKFinder} plugin registers:

* The `'ckfinder'` UI button component.
* The `'ckfinder'` command implemented by the {@link module:ckfinder/ckfindercommand~CKFinderCommand}.

	You can open CKFinder by executing the following code:

	```js
	editor.execute( 'ckfinder' );
	```

Additionally, in the "image upload only" integration, you can use the following button and command registered by the {@link module:image/imageupload~ImageUpload} plugin:

* The `'imageUpload'` UI button component.
* The `'imageUpload'` command implemented by the {@link module:image/imageupload/imageuploadcommand~ImageUploadCommand}.

<info-box>
	We recommend using the official {@link framework/guides/development-tools#ckeditor-5-inspector CKEditor 5 inspector} for development and debugging. It will give you tons of useful information about the state of the editor such as internal data structures, selection, commands, and many more.
</info-box>

## What's next?

Check out the comprehensive {@link features/image-upload Image upload overview} to learn more about different ways of uploading images in CKEditor 5.

See the {@link features/image Image feature} guide to find out more about handling images in CKEditor 5.

## Contribute

The source code of the feature is available on GitHub in https://github.com/ckeditor/ckeditor5/tree/master/packages/ckeditor5-ckfinder.

