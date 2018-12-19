---
category: framework-deep-dive
menu-title: Custom upload adapter
---

# Custom image upload adapter

<info-box>
	Check out the comprehensive {@link features/image-upload Image upload overview} to learn about other ways to upload images into CKEditor 5.
</info-box>

## How does the image upload work?

Before you can implement your own custom upload adapter, you should learn about the image upload process in CKEditor 5. The whole process boils down to the following steps:

1. First, an image (or images) need to get into the rich-text editor content. There are many ways to do that, for instance:

	* pasting an image from clipboard,
	* dragging a file from the file system,
	* selecting an image through a file system dialog.

	The images are intercepted by the {@link module:image/imageupload~ImageUpload image upload} plugin (which is enabled in all official {@link builds/guides/overview editor builds}).
2. For every image, the image upload plugin {@link module:upload/filerepository~FileRepository#createLoader creates an instance of a file loader}.

	* The role of the **file loader** is to read the file from the disk and upload it to the server by using the upload adapter.
	* The role of the **upload adapter** is, therefore, to securely send the file to the server and pass the response from the server (e.g. the URL to the saved file) back to the file loader (or handle an error, if there was one).

3. While the images are being uploaded, the image upload plugin:

	* Creates placeholders of these images.
	* Inserts them into the editor.
	* Displays the progress bar for each of them.
	* When an image is deleted from the editor content before the upload finishes, it aborts the upload process.

4. Once the file is uploaded, the upload adapter notifies the editor about this fact by resolving its `Promise`. It passes the URL (or URLs in case of responsive images) to the image upload plugin which replaces the `src` and `srcset` attributes of the image placeholder in the editor content.

This is just an overview of the image upload process. The truth is, the whole thing is more complicated. For instance, images can be copied and pasted within the WYSIWYG editor (while the upload takes place) and all potential upload errors must be handled, too. The good news is these tasks are handled transparently by the {@link module:image/imageupload~ImageUpload image upload} plugin so you do not have to worry about them.

To sum up, for the image upload to work in the rich-text editor, two conditions must be true:

* **The {@link module:image/imageupload~ImageUpload image upload} plugin must be enabled** in the editor. It is enabled by default in all official {@link builds/guides/overview builds}, but if you are {@link builds/guides/development/custom-builds customizing} CKEditor 5, do not forget to include it.
* **The upload adapter needs to be defined**. This can be done by using (enabling *and* configuring):

	* {@link features/image-upload#official-upload-adapters One of the existing upload adapters}.
	* [Your custom upload adapter](#implementing-a-custom-upload-adapter) and handling uploaded files on your server back–end.

## Implementing a custom upload adapter

In this guide you are going to implement and enable a custom upload adapter that will allow you to take the **full control** over the process of sending the files to the server as well as passing the response from the server (e.g. the URL to the saved file) back to the rich-text editor.

### The anatomy of the adapter

Define the `MyUploadAdapter` class and fill its internals step–by–step. The adapter will use the native `XMLHttpRequest` to send files returned by the loader to a pre–configured URL on the server, handling `error`, `abort`, `load`, and `progress` events fired by the request.

```js
class MyUploadAdapter {
	constructor( loader, url ) {
		// The FileLoader instance to use during the upload. It sounds scary but do not
		// worry — the loader will be passed into the adapter later on in this guide.
		this.loader = loader;

		// The upload URL in your server back-end. This is the address the XMLHttpRequest
		// will send the image data to.
		this.url = url;
	}

	// ...
}
```

Your custom upload adapter must implement the {@link module:upload/filerepository~UploadAdapter `UploadAdapter` interface} in order to work, i.e. it must bring its own `upload()` and `abort()` methods.

* The {@link module:upload/filerepository~UploadAdapter#upload `upload()`} method must return a promise:
	* resolved by a successful image upload (with an object containing information about the uploaded file),
	* rejected because of an error, in which case no image is inserted into the content.
* The {@link module:upload/filerepository~UploadAdapter#abort `abort()`} method must allow the editor to abort the upload process. It is necessary, for instance, when the image was removed from the content by the user before the upload finished.

```js
class MyUploadAdapter {
	constructor( loader, url ) {
		// ...
	}

	// Starts the upload process.
	upload() {
		return new Promise( ( resolve, reject ) => {
			this._initRequest();
			this._initListeners( resolve, reject );
			this._sendRequest();
		} );
	}

	// Aborts the upload process.
	abort() {
		if ( this.xhr ) {
			this.xhr.abort();
		}
	}

	// ...
}
```

### Using `XMLHttpRequest` in an adapter

Let's see what the `_initRequest()` method looks like in your custom upload adapter. It should prepare the `XMLHttpRequest` object before it can be used to upload an image.

```js
class MyUploadAdapter {
	constructor( loader, url ) {
		// ...
	}

	upload() {
		// ...
	}

	abort() {
		// ...
	}

	// Initializes the XMLHttpRequest object using the URL passed to the constructor.
	_initRequest() {
		const xhr = this.xhr = new XMLHttpRequest();

		// Note that your request may look different. It is up to you and your editor
		// integration to choose the right communication channel. This example uses
		// the POST request with JSON as a data structure but your configuration
		// could be different.
		xhr.open( 'POST', this.url, true );
		xhr.responseType = 'json';
	}
}
```

Now let's focus on the `_initListeners()` method which attaches the `error`, `abort`, `load`, and `progress` event listeners to the `XMLHttpRequest` object created in the last step.

A successful image upload will finish when the upload promise is resolved upon the `load` event fired by the `XMLHttpRequest` request. The promise must be resolved with an object containing information about the image. See the documentation of the {@link module:upload/filerepository~UploadAdapter#upload `upload()`} method to learn more.

```js
class MyUploadAdapter {
	constructor( loader, url ) {
		// ...
	}

	upload() {
		// ...
	}

	abort() {
		// ...
	}

	_initRequest() {
		// ...
	}

	// Initializes XMLHttpRequest listeners.
	_initListeners( resolve, reject ) {
		const xhr = this.xhr;
		const loader = this.loader;
		const genericErrorText = 'Couldn\'t upload file:' + ` ${ loader.file.name }.`;

		xhr.addEventListener( 'error', () => reject( genericErrorText ) );
		xhr.addEventListener( 'abort', () => reject() );
		xhr.addEventListener( 'load', () => {
			const response = xhr.response;

			// This example assumes the XHR server's "response" object will come with
			// an "error" which has its own "message" that can be passed to reject()
			// in the upload promise.
			//
			// Your integration may handle upload errors in a different way so make sure
			// it is done properly. The reject() function must be called when the upload fails.
			if ( !response || response.error ) {
				return reject( response && response.error ? response.error.message : genericErrorText );
			}

			// If the upload is successful, resolve the upload promise with an object containing
			// at least the "default" URL, pointing to the image on the server.
			// This URL will be used to display the image in the content. Learn more in the
			// UploadAdapter#upload documentation.
			resolve( {
				default: response.url
			} );
		} );

		// Upload progress when it is supported. The FileLoader has the #uploadTotal and #uploaded
		// properties which are used e.g. to display the upload progress bar in the editor
		// user interface.
		if ( xhr.upload ) {
			xhr.upload.addEventListener( 'progress', evt => {
				if ( evt.lengthComputable ) {
					loader.uploadTotal = evt.total;
					loader.uploaded = evt.loaded;
				}
			} );
		}
	}
}
```

Last but not least, the `_sendRequest()` method sends the `XMLHttpRequest`. In this example, the [`FormData`](https://developer.mozilla.org/en-US/docs/Web/API/FormData) interface is used to pass the file provided by the {@link module:upload/filerepository~FileRepository#createLoader file loader}.

```js
class MyUploadAdapter {
	constructor( loader, url ) {
		// ...
	}

	upload() {
		// ...
	}

	abort() {
		// ...
	}

	_initRequest() {
		// ...
	}

	_initListeners( resolve, reject ) {
		// ...
	}

	// Prepares the data and sends the request.
	_sendRequest() {
		// Prepare the form data.
		const data = new FormData();
		data.append( 'upload', this.loader.file );

		// Send the request.
		this.xhr.send( data );
	}
}
```

### Activating a custom upload adapter

Having implemented the adapter, you must figure out how to enable it in the editor. The good news is that it is pretty easy, and you do not need to {@link builds/guides/development/custom-builds rebuild the editor} to do that!

Crate a simple standalone plugin (`MyCustomUploadAdapterPlugin`) that will {@link module:upload/filerepository~FileRepository#createLoader create an instance of the file loader} and glue it with your custom `MyUploadAdapter`.

```js
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';

class MyUploadAdapter {
	constructor( loader, url ) {
		// ...
	}

	// ...
}

function MyCustomUploadAdapterPlugin( editor ) {
	editor.plugins.get( 'FileRepository' ).createUploadAdapter = ( loader ) => {
		// Configure the URL to the upload script in your back-end here!
		return new MyUploadAdapter( loader, 'http://example.com/image/upload/path' );
	};
}
```

Enable the `MyCustomUploadAdapterPlugin` in the editor by using the {@link module:core/editor/editorconfig~EditorConfig#extraPlugins `config.extraPlugins`} option:

```js
ClassicEditor
	.create( document.querySelector( '#editor' ), {
		extraPlugins: [ MyCustomUploadAdapterPlugin ],

		// ...
	} )
	.catch( error => {
		console.log( error );
	} );
```

Run the editor and see if your implementation works. Drop an image into the WYSIWYG editor content and it should be uploaded to the server thanks to the `MyUploadAdapter`.

## What's next?

Check out the comprehensive {@link features/image-upload Image upload overview} to learn more about different ways of uploading images in CKEditor 5. See the {@link features/image Image feature} guide to find out more about handling images in CKEditor 5.

