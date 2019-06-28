---
category: features-image-upload
menu-title: Simple upload adapter
order: 50
---

# Simple upload adapter

The Simple upload adapter allows uploading images to the server using the [`XMLHttpRequest`](https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest) API and very little configuration.

 ```js
ClassicEditor
	.create( document.querySelector( '#editor' ), {
		simpleUpload: {
			uploadUrl: 'http://example.com',
			headers: {
				...
			}
		}
	} )
	.then( ... )
	.catch( ... );
```

<info-box>
	Check out the comprehensive {@link features/image-upload Image upload overview} to learn about other ways to upload images into CKEditor 5.
</info-box>

## Installation

<info-box info>
	The [`@ckeditor/ckeditor5-upload`](https://www.npmjs.com/package/@ckeditor/ckeditor5-upload) package is available by default in all builds. The installation instructions are for developers interested in building their own, custom WYSIWYG editor.
</info-box>

To add this feature to your editor install the [`@ckeditor/ckeditor5-upload`](https://www.npmjs.com/package/@ckeditor/ckeditor5-upload) package:

 ```bash
npm install --save @ckeditor/ckeditor5-upload
```

Then add the {@link module:upload/adapters/simpleuploadadapter~SimpleUploadAdapter SimpleUploadAdapter} to your plugin list and [configure](#configuration) the feature. For instance:

 ```js
import SimpleUploadAdapter from '@ckeditor/ckeditor5-upload/src/simpleuploadadapter';

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		plugins: [ SimpleUploadAdapter, ... ],
		toolbar: [ ... ],
		simpleUpload: {
			uploadUrl: '' // <-- This value must be specified.
		}
	} )
	.then( ... )
	.catch( ... );
```

<info-box info>
	Read more about {@link builds/guides/integration/installing-plugins installing plugins}.
</info-box>

## Configuration

The feature is configurable by using the {@link module:upload/adapters/simpleuploadadapter~SimpleUploadConfig `config.simpleUpload`} object.

 ```js
import SimpleUploadAdapter from '@ckeditor/ckeditor5-upload/src/simpleuploadadapter';

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		plugins: [ SimpleUploadAdapter, ... ],
		toolbar: [ ... ],
		simpleUpload: {
			uploadUrl: 'http://example.com',
			headers: {
				'X-CSRF-TOKEN': 'CSFR-Token',
				Authorization: 'Bearer <JSON Web Token>'
			}
		}
	} )
	.then( ... )
	.catch( ... );
```

## Server-side configuration

The plugin assumes that every response that will came from the XHR server will be a JSON.

<info-box info>
	During the upload process, the plugin will send a POST request under the URL specified as {@link module:upload/adapters/simpleuploadadapter~SimpleUploadConfig#uploadUrl `simpleUpload.uploadUrl`} in the editor's configuration.
</info-box>

### Successful upload

If the upload is successful, XHR server should return an object that contains the `url` property which points out to the uploaded image:

```json
{
	"url": "https://example.com/images/foo.jpg"
}
``` 

### Error handling

If something went wrong, the XHR server must return an object that contains the `error` property which has its own `message` that will be passed to the {@link module:ui/notification/notification~Notification#showWarning `Notification#showWarning`} method.

```json
{
	"error": {
		"message": "The XHR server cannot handle the request."
	}
}
```

If the `message` property is missing in the `error` object, the {@link module:ui/notification/notification~Notification#showWarning `Notification#showWarning`} will receive the default message: `Couldn't upload file: [filename].`

### Upload progress

The plugin supports [`XHR.upload.progress`](https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/upload) via `evt.total` and `evt.loaded`.

## What's next?

Check out the comprehensive {@link features/image-upload Image upload overview} to learn more about different ways of uploading images in CKEditor 5.

See the {@link features/image Image feature} guide to find out more about handling images in CKEditor 5.

## Contribute

The source code of the feature is available on GitHub in https://github.com/ckeditor/ckeditor5-upload.
