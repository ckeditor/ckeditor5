---
category: features-file-management
menu-title: CKFinder
meta-title: CKFinder file manager | CKEditor 5 Documentation
meta-description: Learn all about using the CKFinder file manager and service with CKEditor 5
order: 20
badges: [ premium ]
---

{@snippet features/build-ckfinder-source}

# CKFinder file manager

The CKFinder feature lets you insert images and links to files into your content. CKFinder is a powerful file manager with various image editing and image upload options.

<info-box info>
	This is a premium feature and you need a license for it on top of your CKEditor&nbsp;5 commercial license. [Contact us](https://ckeditor.com/contact/?sales=true#contact-form) to receive an offer tailored to your needs.

	You can also sign up for the [CKEditor Premium Features 30-day free trial](https://orders.ckeditor.com/trial/premium-features) to test the feature.

	This feature is enabled by default in all [predefined builds](https://ckeditor.com/docs/ckeditor5/latest/installation/getting-started/predefined-builds.html) for convenience, but the editor will still work properly without activating it.
</info-box>

## Demos

### Image upload only

This demo shows the integration where the file manager's server connector handles [image upload](#configuring-the-image-upload-only) only:

* Paste an image directly into the editor, and it will be automatically uploaded using the server-side connector.
* Use the insert image button {@icon @ckeditor/ckeditor5-core/theme/icons/image.svg Image} in the toolbar to insert an image.

{@snippet features/ckfinder-upload-only}

### Full integration

This demo shows the [full integration](#configuring-the-full-integration) with the CKFinder file uploader:

* Paste an image directly into the editor, and it will be automatically uploaded using the server-side connector.
* Use the insert image or file button {@icon @ckeditor/ckeditor5-ckfinder/theme/icons/browse-files.svg Browse files} in the toolbar to open the CKFinder file manager and insert an image or a link to any other file.

{@snippet features/ckfinder}

<info-box info>
	These demos only presents a limited set of features. Visit the {@link examples/builds/full-featured-editor feature-rich editor example} to see more in action.
</info-box>

## Additional feature information

The CKFinder integration feature is a bridge between the CKEditor&nbsp;5 WYSIWYG editor and the [CKFinder](https://ckeditor.com/ckfinder) file manager and uploader. CKFinder is a commercial application that was designed with CKEditor compatibility in mind. It is currently available as version 3.x for PHP, ASP.NET, and Java and version 2.x for ASP and ColdFusion.

This feature can be used in the rich-text editor in two different ways:

* [**As a server-side connector only**](#configuring-the-image-upload-only) ([demo](#image-upload-only)). In this scenario, images dropped or pasted into the editor are uploaded to the CKFinder server-side connector running on your server.
* [**As a server and client-side file manager integration**](#configuring-the-full-integration) ([demo](#full-integration)). Images dropped or pasted directly into the editor are uploaded to the server (just like in the first option).

	But there are more cool features available, for instance:

	* **Uploading** using the full user interface
	* Uploading **multiple files** at once
	* **Browsing** previously uploaded images
	* **Editing** images (cropping, resizing, etc.)
	* **Organizing** or deleting images

	Check out the [CKFinder file manager website](https://ckeditor.com/ckfinder/) to learn more about the features you can use in your project.

## Configuration

The feature is configurable by using the {@link module:ckfinder/ckfinderconfig~CKFinderConfig `config.ckfinder`} object.

### Configuring the image upload only

This feature can upload images automatically to the server (e.g. when the image is dropped into the content) thanks to the {@link module:adapter-ckfinder/uploadadapter~CKFinderUploadAdapter CKFinder upload adapter}. All it requires is the correct {@link module:ckfinder/ckfinderconfig~CKFinderConfig#uploadUrl `config.ckfinder.uploadUrl`} path.

Assuming that the [CKFinder PHP server-side connector is installed](https://ckeditor.com/docs/ckfinder/ckfinder3-php/quickstart.html#quickstart_installation_folders) (available) under `https://example.com/ckfinder/`, use the following [quick upload](https://ckeditor.com/docs/ckfinder/ckfinder3-php/commands.html#command_quick_upload) command URL to enable the image upload:

```js
import { CKFinder } from '@ckeditor/ckeditor5-ckfinder';

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		plugins: [ CKFinder, /* ... */ ],

		// Enable the insert image button in the toolbar.
		toolbar: [ 'uploadImage', /* ... */ ],

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

To use both the image upload functionality and the file manager user interface in your application, you must first load the CKFinder JavaScript library and then enable CKFinder integration in your rich-text editor instance.

The easiest way to load the CKFinder library is to include the `<script>` tag loading the `ckfinder.js` file first:

```html
<script src="https://example.com/ckfinder/ckfinder.js"></script>
```

Then:

* Make sure that the {@link module:ckfinder/ckfinder~CKFinder CKFinder plugin} for CKEditor&nbsp;5 is enabled. See the [Installation](#installation) section.
* In order to enable the automatic file upload to the server when an image is pasted or dropped into the editor content, remember to set the correct {@link module:ckfinder/ckfinderconfig~CKFinderConfig#uploadUrl `config.ckfinder.uploadUrl`} path.
* In order to display the toolbar button that opens the CKFinder file manager UI allowing the users to choose the files on the server, make sure that `'ckfinder'` is present in your {@link module:core/editor/editorconfig~EditorConfig#toolbar `config.toolbar`}.
* Additionally, you can use {@link module:ckfinder/ckfinderconfig~CKFinderConfig#options `config.ckfinder.options`} to define [CKFinder's options](https://ckeditor.com/docs/ckfinder/ckfinder3/#!/api/CKFinder.Config). For example:
	* You can define [`options.resourceType`](https://ckeditor.com/docs/ckfinder/ckfinder3/#!/api/CKFinder.Config-cfg-resourceType) to tell CKFinder the specified resource type can be browsed when the user clicks the button.
	* You can define [`options.language`](https://ckeditor.com/docs/ckfinder/ckfinder3/#!/api/CKFinder.Config-cfg-language) to set the UI language of CKFinder. By default, it will be set to the UI language of the editor.

```js
import { CKFinder } from '@ckeditor/ckeditor5-ckfinder';

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		plugins: [ CKFinder, /* ... */ ],

		// Enable the CKFinder button in the toolbar.
		toolbar: [ 'ckfinder', /* ... */ ]

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

By default, the file manager opens as a modal. To open it in a new "pop-up" window, set the configuration value to `popup`:

```js
import { CKFinder } from '@ckeditor/ckeditor5-ckfinder';

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		plugins: [ CKFinder, /* ... */ ],
		toolbar: [ 'ckfinder', /* ... */ ]
		ckfinder: {
			// Open the file manager in the pop-up window.
			openerMethod: 'popup'
		}
	} )
	.then( /* ... */ )
	.catch( /* ... */ );
```

### Configuring allowed file types

The allowed file types that can be uploaded should be configured in two places:

* On the client side, in CKEditor&nbsp;5, restricting image upload through the CKEditor&nbsp;5 UI and commands
* On the server side, in CKFinder, restricting the file formats that are accepted in CKFinder

#### Client-side configuration

Use the {@link module:image/imageconfig~ImageUploadConfig#types `image.upload.types`} configuration option to define the allowed image MIME types that can be uploaded to CKEditor&nbsp;5.

By default, users are allowed to upload `jpeg`, `png`, `gif`, `bmp`, `webp`, and `tiff` files, but you can customize this behavior to accept, for example, SVG files.

#### Server-side configuration

Use the `allowedExtensions` configuration option to define the file extension allowed to be uploaded with CKFinder for a particular resource type. Refer to the [relevant server-side connector documentation](https://ckeditor.com/docs/ckfinder/latest/) to learn more.

## Installation

<info-box info>
	This feature is enabled by default in all {@link installation/getting-started/predefined-builds predefined builds}. The installation instructions are for developers interested in building their own, custom WYSIWYG editor.
</info-box>

To add this feature to your editor, install the [`@ckeditor/ckeditor5-ckfinder`](https://www.npmjs.com/package/@ckeditor/ckeditor5-ckfinder) package:

```bash
npm install --save @ckeditor/ckeditor5-ckfinder
```

Then add {@link module:ckfinder/ckfinder~CKFinder} to your plugin list and [configure](#configuration) the feature (when necessary). For instance:

```js
import { CKFinder } from '@ckeditor/ckeditor5-ckfinder';

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		plugins: [ CKFinder, /* ... */ ],
		toolbar: [ 'ckfinder', 'uploadImage', /* ... */ ], // Depending on your preference.
		ckfinder: {
			// Feature configuration.
			// ...
		}
	} )
	.then( /* ... */ )
	.catch( /* ... */ );
```

## Common API

The {@link module:ckfinder/ckfinder~CKFinder} plugin registers:

* The `'ckfinder'` UI button component
* The `'ckfinder'` command implemented by the {@link module:ckfinder/ckfindercommand~CKFinderCommand}

	You can open CKFinder by executing the following code:

	```js
	editor.execute( 'ckfinder' );
	```

Additionally, in the "image upload only" integration, you can use the following button and command registered by the {@link module:image/imageupload~ImageUpload} plugin:

* The `'uploadImage'` UI button component
* The `'uploadImage'` command implemented by the {@link module:image/imageupload/uploadimagecommand~UploadImageCommand}

<info-box>
	We recommend using the official {@link framework/development-tools/inspector CKEditor&nbsp;5 inspector} for development and debugging. It will give you tons of useful information about the state of the editor such as internal data structures, selection, commands, and many more.
</info-box>

## What's next?

Check out the comprehensive {@link features/image-upload Image upload overview} to learn more about different ways of uploading images in CKEditor&nbsp;5.

See the {@link features/images-overview image feature guide} to find out more about handling images in CKEditor&nbsp;5.

## Contribute

The source code of the feature is available on GitHub at [https://github.com/ckeditor/ckeditor5/tree/master/packages/ckeditor5-ckfinder](https://github.com/ckeditor/ckeditor5/tree/master/packages/ckeditor5-ckfinder).
