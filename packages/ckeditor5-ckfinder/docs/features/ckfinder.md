---
category: features
menu-title: CKFinder
---

{@snippet features/build-ckfinder-source}

# CKFinder integration

This feature allows you to easily insert images as well as links to files into the editor content. It is a bridge between the CKEditor 5 WYSIWYG editor and the [CKFinder](https://ckeditor.com/ckfinder) file manager and uploader.

<info-box>
	Check out the {@link features/image-upload general image upload guide} to learn about other ways to upload images into CKEditor 5.
</info-box>

This feature can be used in the editor in two different ways:

* [**As a server-side connector only**](#configuring-the-image-upload-only): In this scenario, images which are dropped or pasted into the editor are uploaded to a CKFinder server-side connector running on your server.
* [**As a server and client-side file manager integration**](#configuring-the-full-integration) **(recommended)**: Images dropped and pasted directly into the editor are uploaded to the server (just like in the first option).

	But there are more cool features available, for instance:

	* **uploading** using the full user interface,
	* **browsing** previously uploaded images,
	* **editing** images (cropping, resizing, etc.),
	* **organizing** or deleting images.

	Use the [demo](#demo) to try the file manager integration with CKEditor 5 now.

	Check out the [CKFinder project website](https://ckeditor.com/ckeditor-4/ckfinder/) to learn more about features you can use in your project.

## Demo

### Full integration

This demo shows the [full integration](#configuring-the-full-integration) with the CKFinder file manager:

* You can also paste the image directly into the editor content and it will be automatically uploaded to the server.
* You can use the "Insert image or file" button in the toolbar to insert an image or a link to any other file.

{@snippet features/ckfinder}

### Image upload only

**TODO**: Demo of CKE5 with imageUpload button.

## Installation

<info-box info>
	This feature is enabled by default in all builds. The installation instructions are for developers interested in building their own, custom editor.
</info-box>

To add this feature to your editor, install the [`@ckeditor/ckeditor5-ckfinder`](https://www.npmjs.com/package/@ckeditor/ckeditor5-ckfinder) package:

```bash
npm install --save @ckeditor/ckeditor5-ckfinder
```

Then add {@link module:ckfinder/ckfinder~CKFinder} to your plugin list and [configure](#configuration) the feature (when necessary), for instance:

```js
import CKFinder from '@ckeditor/ckeditor5-ckfinder/src/ckfinder';

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		plugins: [ CKFinder, ... ],
		toolbar: [ 'ckfinder', ... ]
		ckfinder: {
			// Feature configuration.
		}
	} )
	.then( ... )
	.catch( ... );
```

**TODO**: Mention that CKFinder must be loaded too if you're using the full integration.

## Configuration

The feature can be configured using the {@link module:ckfinder/ckfinder~CKFinderConfig `config.ckfinder`} object.

### Configuring the image upload only

This feature can upload images automatically to the server (e.g. when the image is dropped into the content) thanks to the {@link module:adapter-ckfinder/uploadadapter~CKFinderUploadAdapter CKFinder upload adapter}. All it requires is the correct {@link module:ckfinder/ckfinder~CKFinderConfig#uploadUrl `config.ckfinder.uploadUrl`} path.

Assuming that the CKFinder server-side connector is {@link @ckfinder ckfinder3-php/quickstart.html#quickstart_installation_folders installed} (available) under `https://example.com/ckfinder/`, use the following {@link @ckfinder ckfinder3-php/commands.html#command_quick_upload quick upload} command URL to enable the image upload:

```js
import CKFinder from '@ckeditor/ckeditor5-ckfinder/src/ckfinder';

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		plugins: [ CKFinder, ... ],
		ckfinder: {
			// Upload the images to the server using the CKFinder's QuickUpload command.
			uploadUrl: 'https://example.com/ckfinder/core/connector/php/connector.php?command=QuickUpload&type=Images&responseType=json'
		}
	} )
	.then( ... )
	.catch( ... );
```

Drop an image into the content — it should be uploaded automatically to the server using the CKFinder connector.

### Configuring the full integration

The file manager configuration can be passed through the {@link module:ckfinder/ckfinder~CKFinderConfig#options `config.ckfinder.options`} object. Check the {@link @ckfinder ckfinder3/#!/api/CKFinder.Config file manager documentation} for the complete list of options.

<info-box>
	By default, the editor language is automatically passed to the file manager — the file manager "inherits" the language of the editor. This behavior can be changed by setting the `ckfinder.options.language` configuration option.
</info-box>

<info-box>
	**TODO** To enable the automatic image upload to the server, follow the [instructions in the previous section](#configuring-the-image-upload-only).
</info-box>

To display the toolbar button that opens the CKFinder file manager UI allowing users to choose files on the server, make sure `'ckfinder'` is present in your {@link module:core/editor/editorconfig~EditorConfig#toolbar `config.toolbar`}.

Additionally, you can specify {@link @ckfinder ckfinder3/#!/api/CKFinder.Config-cfg-resourceType `config.ckfinder.options.resourceTypes`} to tell the file manager that only the specified resource type (in this case: the images) can be browsed when the user uses the button:

```js
import CKFinder from '@ckeditor/ckeditor5-ckfinder/src/ckfinder';

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		plugins: [ CKFinder, ... ],

		// Enable the CKFinder button in the toolbar.
		toolbar: [ 'ckfinder', ... ]

		ckfinder: {
			// Narrow the list of files that can be browsed.
			options: {
				resourceType: 'Images'
			},

			// Upload the images to the server using the CKFinder's QuickUpload command.
			// See the "Configuring the image upload only" section.
			uploadUrl: 'https://example.com/ckfinder/core/connector/php/connector.php?command=QuickUpload&type=Images&responseType=json'
		}
	} )
	.then( ... )
	.catch( ... );
```

{@snippet features/ckfinder-options}

#### Configuring the opener

You can change the way the CKFinder file manager opens using the {@link module:ckfinder/ckfinder~CKFinderConfig#openerMethod `config.ckfinder.openerMethod`} option.

By default, the manager opens as a modal. To open it in a new "pop-up" window, set the configuration value to `popup`:

```js
import CKFinder from '@ckeditor/ckeditor5-ckfinder/src/ckfinder';

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		plugins: [ CKFinder, ... ],
		toolbar: [ 'ckfinder', ... ]
		ckfinder: {
			// Open the file manager in the popup window.
			openerMethod: 'popup'
		}
	} )
	.then( ... )
	.catch( ... );
```

## Common API

The {@link module:ckfinder/ckfinder~CKFinder} plugin registers:

* the `'ckfinder'` UI button component,
* the `'ckfinder'` command implemented by the {@link module:ckfinder/ckfindercommand~CKFinderCommand}.

	You can open a CKFinder by executing the following code:

	```js
	editor.execute( 'ckfinder' );
	```

Additionally, in the "image upload only" integration, you can use the following button and command registered by the {@link module:image/imageupload~ImageUpload} plugin:

* the `'imageUpload'` UI button component,
* the `'imageUpload'` command implemented by the {@link module:image/imageupload/imageuploadcommand~ImageUploadCommand}.

## Contribute

The source code of the feature is available on GitHub in https://github.com/ckeditor/ckeditor5-ckfinder.
