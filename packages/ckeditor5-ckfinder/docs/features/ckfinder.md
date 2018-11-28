---
category: features
---

{@snippet features/build-ckfinder-source}

# CKFinder integration

This {@link module:ckfinder/ckfinder~CKFinder feature} allows you to easily insert images as well as links to files into the editor content. It is a bridge between the CKEditor 5 WYSIWYG editor and the [CKFinder](https://ckeditor.com/ckfinder) file manager and uploader.

## Demo

You can use the "Insert image or file" button in the toolbar to insert an image or a link to any other file. You can also paste the image directly into the editor content and it will be automatically [uploaded](#configuring-image-upload) to the server.

{@snippet features/ckfinder}

## Installation

<info-box info>
	This feature is enabled by default in all builds. The installation instructions are for developers interested in building their own, custom editor.
</info-box>

To add this feature to your editor, install the [`@ckeditor/ckeditor5-ckfinder`](https://www.npmjs.com/package/@ckeditor/ckeditor5-ckfinder) package:

```bash
npm install --save @ckeditor/ckeditor5-ckfinder
```

Then add `CKFinder` to your plugin list and [configure](#configuration) the feature (when necessary):

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

## Configuration

The feature can be configured using the {@link module:ckfinder/ckfinder~CKFinderConfig `config.ckfinder`} object.

The file manager configuration can be passed through the {@link module:ckfinder/ckfinder~CKFinderConfig#options `config.ckfinder.options`} object. Check the {@link @ckfinder ckfinder3/#!/api/CKFinder.Config file manager documentation} for the complete list of options.

For instance, the following code will configure the file manager to browse only the specified resource type (in this case: the images):

```js
import CKFinder from '@ckeditor/ckeditor5-ckfinder/src/ckfinder';

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		plugins: [ CKFinder, ... ],
		toolbar: [ 'ckfinder', ... ]
		ckfinder: {
			options: {
				resourceType: 'Images'
			}
		}
	} )
	.then( ... )
	.catch( ... );
```

{@snippet features/ckfinder-options}

<info-box>
	By default, the editor language is automatically passed to the file manager — the file manager "inherits" the language of the editor. This behavior can be changed by setting the `ckfinder.options.language` configuration option.
</info-box>

### Configuring image upload

This feature allows you to not only browse images, but also upload them automatically to the server (e.g. when the image is dropped into the content) thanks to the {@link module:adapter-ckfinder/uploadadapter~CKFinderUploadAdapter CKFinder upload adapter}. All it requires is the correct {@link module:adapter-ckfinder/uploadadapter~CKFinderAdapterConfig#uploadUrl `config.ckfinder.uploadUrl`} path.

Assuming that the CKFinder file manager is {@link @ckfinder ckfinder3-php/quickstart.html#quickstart_installation_folders installed} (accessible) under `https://example.com/ckfinder/`, use the following {@link @ckfinder ckfinder3-php/commands.html#command_quick_upload quick upload} command URL to enable the image upload:

```js
import CKFinder from '@ckeditor/ckeditor5-ckfinder/src/ckfinder';

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		plugins: [ CKFinder, ... ],
		toolbar: [ 'ckfinder', ... ]
		ckfinder: {
			// Upload the images to the server using the CKFinder's QuickUpload command.
			uploadUrl: 'https://example.com/ckfinder/core/connector/php/connector.php?command=QuickUpload&type=Images&responseType=json'
		}
	} )
	.then( ... )
	.catch( ... );
```

### Configuring the opener

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

## Contribute

The source code of the feature is available on GitHub in https://github.com/ckeditor/ckeditor5-ckfinder.
