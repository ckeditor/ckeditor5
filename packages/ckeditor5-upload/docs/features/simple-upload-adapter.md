---
category: features-image-upload
menu-title: Simple upload adapter
order: 50
---

# Simple upload adapter

The Simple upload adapter allows uploading images to an application running on your server using the [`XMLHttpRequest`](https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest) API and minimal [editor configuration](#configuration).

See the ["Server–side configuration"](#server-side-configuration) section to learn about the requirements your server–side application must meet to support this upload adapter.

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
			// Feature configuration.
		}
	} )
	.then( ... )
	.catch( ... );
```

<info-box info>
	Read more about {@link builds/guides/integration/installing-plugins installing plugins}.
</info-box>

## Configuration

The client–side of this feature is configurable using the {@link module:upload/adapters/simpleuploadadapter~SimpleUploadConfig `config.simpleUpload`} object.

 ```js
import SimpleUploadAdapter from '@ckeditor/ckeditor5-upload/src/simpleuploadadapter';

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		plugins: [ SimpleUploadAdapter, ... ],
		toolbar: [ ... ],
		simpleUpload: {
			// The URL the images are uploaded to.
			uploadUrl: 'http://example.com',

			// Headers sent along with the XMLHttpRequest to the upload server.
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

To use this upload adapter, you must provide a server–side application that will handle the uploads and communicate with the editor, as described in the following sections.

### Communication protocol

When the image upload process is initiated, the adapter sends a [`POST`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods/POST) request under {@link module:upload/adapters/simpleuploadadapter~SimpleUploadConfig#uploadUrl `config.simpleUpload.uploadUrl`}.

You can sent additional headers along with the `XMLHttpRequest` to the upload server, e.g. to authenticate the user, using the {@link module:upload/adapters/simpleuploadadapter~SimpleUploadConfig#uploadUrl `config.simpleUpload.headers`} object.

The [`responseType`](https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/responseType) of the request is always `json`. See the ["Successful upload"](#successful-upload) and ["Error handling"](#error-handling) sections to learn more.

### Successful upload

If the upload is successful, the server should return an object containing the `url` property which points out to the uploaded image on the server:

```json
{
	"url": "https://example.com/images/foo.jpg"
}
```

That image URL is essential because it will be used:

* to display the image during the editing (as seen by the user in the editor),
* in the editor content {@link builds/guides/integration/saving-data saved to the databse}.

### Error handling

If something went wrong, the server must return an object that containing the `error` property. This will terminate the upload in the editor, e.g. allowing the user to select another image if the previous one was too big or did not meet some other validation criteria.

If the `error` object contains a `message`, it will be passed to the {@link module:ui/notification/notification~Notification#showWarning editor notification system} and displayed to the user. For the convenience of the users, use clear and possibly specific error messages.

```json
{
	"error": {
		"message": "The image upload failed because the image was too big (max 1.5MB)."
	}
}
```

If the `message` property is missing in the `error` object, the {@link module:ui/notification/notification~Notification#showWarning editor notification system} will display the default "Couldn't upload file: `[filename]`." message.

### Upload progress

<info-box>
	The upload progress feature is optional but highly recommended for the best experience of the editor users.
</info-box>

The adapter supports [file upload progress](https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/progress_event) using `total` and `loaded` properties of the `progress` event fired periodically by the server during the upload.

* `total` — represents the number of total bytes to upload; for instance, an image of 1KB should have `total` of 1000 (bytes).
* `progress` — represents the number of bytes already uploaded; for instance, if 250 bytes were uploaded of the 1000 (total), the editor will display a 25% upload progress to the user.

<info-box>
	The `progress` event fired by the server must have the [`lengthComputable`](https://developer.mozilla.org/en-US/docs/Web/API/ProgressEvent/lengthComputable) property set `true` for the editor to support the image upload progress.
</info-box>

## What's next?

Check out the comprehensive {@link features/image-upload Image upload overview} to learn more about different ways of uploading images in CKEditor 5.

See the {@link features/image Image feature} guide to find out more about handling images in CKEditor 5.

## Contribute

The source code of the feature is available on GitHub in https://github.com/ckeditor/ckeditor5-upload.
