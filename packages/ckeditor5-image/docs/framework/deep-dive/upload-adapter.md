---
category: framework-deep-dive
menu-title: Custom upload adapter
meta-title: Custom image upload adapter | CKEditor 5 Framework Documentation
classes: custom-adapter
---

# Custom image upload adapter

In this guide, you will learn the basic concepts of the file upload architecture in CKEditor&nbsp;5 WYSIWYG editor which will help you implement your custom upload adapter.

While this guide is mainly focused on image upload (the most common kind of upload), the presented concepts and the API allow development of all sorts of file upload adapters for different file types like PDF files, movies, etc.

<info-box>
	If you do not feel like getting through this guide but you want a simple upload adapter that works, check out the {@link features/simple-upload-adapter Simple upload adapter} plugin we implemented for you.
</info-box>

<info-box>
	Check out the comprehensive {@link features/image-upload Image upload overview} to learn about other ways to upload images into CKEditor&nbsp;5.
</info-box>

## Glossary of terms

Before you start, make sure all terms used in this guide are clear.

<table>
	<thead>
		<tr>
			<th>Term</th>
			<th>Description</th>
		</tr>
	</thead>
	<tbody>
		<tr>
			<td>Upload adapter</td>
			<td>
				<p>A piece of code (a class) that handles the image upload from the moment it is requested by the user (for example, when the file is dropped into the content) to the moment the server returns a response to the requested upload. A bridge between the feature and the server.</p>
				<p>Upload adapters are used by other plugins like {@link module:image/imageupload~ImageUpload image upload} to connect to the server and fetch the response. For every user action (for example, when a file is dropped into the content), a new upload adapter instance is created.</p>
				<p>CKEditor&nbsp;5 comes with some {@link features/image-upload#official-upload-adapters official upload adapters} but you can also <a href="#implementing-a-custom-upload-adapter">implement your own adapters</a>.</p>
				<p>See the <a href="#how-does-the-image-upload-work">"How does the image upload work?"</a> section to learn more.</p>
			</td>
		</tr>
		<tr>
			<td>{@link module:upload/filerepository~UploadAdapter `UploadAdapter`} interface</td>
			<td>
				<p>An interface defining the minimal API required to create an upload adapter. In other words, it tells you what methods your upload adapter class must have to work.</p>
				<p>See <a href="#the-anatomy-of-the-adapter">"The anatomy of the adapter"</a> section to learn more.</p>
			</td>
		</tr>
		<tr>
			<td>{@link module:upload/filerepository~FileRepository File repository} plugin</td>
			<td>
				<p>A central point for managing file upload in CKEditor&nbsp;5. It glues upload adapters and features using them:</p>
				<ul>
					<li>Upload adapters are enabled in the editor by defining the {@link module:upload/filerepository~FileRepository#createUploadAdapter `FileRepository.createUploadAdapter()`} factory method.</li>
					<li>Features like {@link module:image/imageupload~ImageUpload image upload} use the <code>FileRepository</code> API to create a new upload adapter instance each time an upload is requested by the user.</li>
				</ul>
			</td>
		</tr>
		<tr>
			<td>{@link module:image/imageupload~ImageUpload Image upload} plugin</td>
			<td>
				<p>A top-level plugin that responds to actions of the users (for example, when a file is dropped into the content) by uploading files to the server and updating the edited content once the upload finishes. This particular plugin handles user actions related to uploading images.</p>
				<p>It uses the <code>FileRepository</code> API to spawn upload adapter instances, triggers the image upload (<code>UploadAdapter.upload()</code>), and uses the data returned by the adapter's upload promise to update the image in the editor content.</p>
				<p>See the <a href="#how-does-the-image-upload-work">"How does the image upload work?"</a> section to learn more.</p>
			</td>
		</tr>
	</tbody>
</table>

## How does the image upload work?

Before you can create your custom upload adapter, you should learn about the image upload process in CKEditor&nbsp;5. The whole process consists of the following steps:

1. First, an image (or images) needs to get into the rich-text editor content. There are many ways to do that, for instance:

	* pasting an image from the clipboard,
	* dragging a file from the file system,
	* selecting an image through a file system dialog.

	The images are intercepted by the {@link module:image/imageupload~ImageUpload image upload} plugin.
2. For every image, the image upload plugin {@link module:upload/filerepository~FileRepository#createLoader creates an instance of a file loader}.

	* The role of the **file loader** is to read the file from the disk and upload it to the server by using the upload adapter.
	* The role of the **upload adapter** is, therefore, to securely send the file to the server and pass the response from the server (for example, the URL to the saved file) back to the file loader (or handle an error, if there was one).

3. While the images are being uploaded, the image upload plugin:

	* Creates placeholders for these images.
	* Inserts them into the editor.
	* Displays the progress bar for each of them.
	* When an image is deleted from the editor content before the upload finishes, it aborts the upload process.

4. Once the file is uploaded, the upload adapter notifies the editor about this fact by resolving its `Promise`. It passes the URL (or URLs in case of responsive images) to the image upload plugin which replaces the `src` and `srcset` attributes of the image placeholder in the editor content.

This is just an overview of the image upload process. Actually, the whole thing is more complicated. For instance, images can be copied and pasted within the WYSIWYG editor (while the upload takes place) and all potential upload errors must be handled, too. The good news is these tasks are handled transparently by the {@link module:image/imageupload~ImageUpload image upload} plugin so you do not have to worry about them.

To sum up, for the image upload to work in the rich-text editor, two conditions must be true:

* **The {@link module:image/imageupload~ImageUpload image upload} plugin must be enabled** in the editor.
* **The upload adapter needs to be defined**. This can be done by using (enabling *and* configuring):

	* {@link features/image-upload#official-upload-adapters One of the existing upload adapters}.
	* [Your custom upload adapter](#implementing-a-custom-upload-adapter) and handling uploaded files on your server backend.

## The anatomy of the adapter

A custom upload adapter allows you to take **full control** over the process of sending the files to the server as well as passing the response from the server back to the rich-text editor.

Any upload adapter, whether an image upload adapter or a generic file upload adapter, must implement the {@link module:upload/filerepository~UploadAdapter `UploadAdapter` interface} to work, that is, it must bring its own `upload()` and `abort()` methods.

* The {@link module:upload/filerepository~UploadAdapter#upload `upload()`} method must return a promise:
	* **resolved** by a successful upload with an object containing information about the uploaded file (see the section about [responsive images](#responsive-images-and-srcset-attribute) to learn more),
	* **rejected** because of an error, in which case nothing is inserted into the content.
* The {@link module:upload/filerepository~UploadAdapter#abort `abort()`} method must allow the editor to stop the upload process. It is necessary, for instance, when the image was removed from the content by the user before the upload finished or the editor instance was {@link module:core/editor/editor~Editor#destroy destroyed}.

In its simplest form, a custom adapter implementing the `UploadAdapter` interface will look as follows. Note that `server.upload()`, `server.onUploadProgress()` and `server.abortUpload()` should be replaced by specific implementations (dedicated for your application) and only demonstrate the minimal communication necessary for the upload to work:

```js
class MyUploadAdapter {
	constructor( loader ) {
		// The file loader instance to use during the upload.
		this.loader = loader;
	}

	// Starts the upload process.
	upload() {
		// Update the loader's progress.
		server.onUploadProgress( data => {
			loader.uploadTotal = data.total;
			loader.uploaded = data.uploaded;
		} );

		// Return a promise that will be resolved when the file is uploaded.
		return loader.file
			.then( file => server.upload( file ) );
	}

	// Aborts the upload process.
	abort() {
		// Reject the promise returned from the upload() method.
		server.abortUpload();
	}
}
```

Define the {@link module:upload/filerepository~FileRepository#createUploadAdapter `FileRepository.createUploadAdapter()`} factory method which uses the `MyUploadAdapter` class to enable the upload adapter in the editor:

```js
editor.plugins.get( 'FileRepository' ).createUploadAdapter = ( loader ) => {
	return new MyUploadAdapter( loader );
};
```

## Implementing a custom upload adapter

In this section, you are going to implement and enable a custom upload adapter. The adapter will use the native [`XMLHttpRequest`](https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest) to send files returned by the loader to a pre–configured URL on the server, handling the `error`, `abort`, `load`, and `progress` events fired by the request.

<info-box>
	If you do not feel like getting through this guide but you want a simple `XMLHttpRequest`–based upload adapter that works, check out the {@link features/simple-upload-adapter Simple upload adapter} plugin we implemented for you. It comes with pretty much the same functionality. Just install it, configure it, and you are ready to go.
</info-box>

<info-box>
	If the {@link features/simple-upload-adapter Simple upload adapter} is not enough for you and you want a custom upload adapter developed on top this guide, go straight to the [full source code](#the-complete-implementation) and start experimenting.
</info-box>

<info-box>
	This is just an example implementation and `XMLHttpRequest` might not necessarily be the best solution for your application.

	Use the provided code snippets as an inspiration for your own custom upload adapter &ndash; it is up to you to choose the technologies and APIs to use. For instance, you may want to check out the native [`fetch()` API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch) that works with `Promises` out of the box.
</info-box>

To start off, define the `MyUploadAdapter` class with its constructor.

```js
class MyUploadAdapter {
	constructor( loader ) {
		// The file loader instance to use during the upload. It sounds scary but do not
		// worry — the loader will be passed into the adapter later on in this guide.
		this.loader = loader;
	}

	// More methods.
	// ...
}
```

Implement the minimal `UploadAdapter` adapter interface as explained in ["The anatomy of the adapter"](#the-anatomy-of-the-adapter) section. The details of the implementation are explained in the following chapters of this guide.

```js
class MyUploadAdapter {
	// The constructor method.
	// ...

	// Starts the upload process.
	upload() {
		return this.loader.file
			.then( file => new Promise( ( resolve, reject ) => {
				this._initRequest();
				this._initListeners( resolve, reject, file );
				this._sendRequest( file );
			} ) );
	}

	// Aborts the upload process.
	abort() {
		if ( this.xhr ) {
			this.xhr.abort();
		}
	}

	// More methods.
	// ...
}
```

### Using `XMLHttpRequest` in an adapter

Let's see what the `_initRequest()` method looks like in your custom upload adapter. It should prepare the `XMLHttpRequest` object before it can be used to upload an image.

<info-box>
	For the sake of keeping the code simple, in this example implementation no particular security mechanism is used that would prevent your application and services from being abused.

	We **strongly recommend** using both authentication and [<abbr title="Cross-site request forgery">CSRF</abbr> protection](https://owasp.org/www-community/attacks/csrf) mechanisms (i.e. CSRF tokens) in your application. For instance, they can be implemented as [`XMLHttpRequest`](https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/setRequestHeader) headers.
</info-box>

```js
class MyUploadAdapter {
	// More methods.
	// ...

	// Initializes the XMLHttpRequest object using the URL passed to the constructor.
	_initRequest() {
		const xhr = this.xhr = new XMLHttpRequest();

		// Note that your request may look different. It is up to you and your editor
		// integration to choose the right communication channel. This example uses
		// a POST request with JSON as a data structure but your configuration
		// could be different.
		xhr.open( 'POST', 'http://example.com/image/upload/path', true );
		xhr.responseType = 'json';
	}
}
```

Now focus on the `_initListeners()` method which attaches the `error`, `abort`, `load`, and `progress` event listeners to the `XMLHttpRequest` object created in the last step.

A successful image upload will finish when the upload promise is resolved upon the `load` event fired by the `XMLHttpRequest` request. The promise must be resolved with an object containing information about the image. See the documentation of the {@link module:upload/filerepository~UploadAdapter#upload `upload()`} method to learn more.

```js
class MyUploadAdapter {
	// More methods.
	// ...

	// Initializes XMLHttpRequest listeners.
	_initListeners( resolve, reject, file ) {
		const xhr = this.xhr;
		const loader = this.loader;
		const genericErrorText = `Couldn't upload file: ${ file.name }.`;

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

		// Upload progress when it is supported. The file loader has the #uploadTotal and #uploaded
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

Finally, the `_sendRequest()` method sends the `XMLHttpRequest`. In this example, the [`FormData`](https://developer.mozilla.org/en-US/docs/Web/API/FormData) interface is used to pass the file provided by the {@link module:upload/filerepository~FileRepository#createLoader file loader}.

<info-box>
	Both the data format and actual data passed to `XMLHttpRequest.send()` in this example implementation are arbitrary. Your implementation could be different and it will depend on the backend of your application and interfaces it provides.
</info-box>

```js
class MyUploadAdapter {
	// More methods.
	// ...

	// Prepares the data and sends the request.
	_sendRequest( file ) {
		// Prepare the form data.
		const data = new FormData();

		data.append( 'upload', file );

		// Important note: This is the right place to implement security mechanisms
		// like authentication and CSRF protection. For instance, you can use
		// XMLHttpRequest.setRequestHeader() to set the request headers containing
		// the CSRF token generated earlier by your application.

		// Send the request.
		this.xhr.send( data );
	}
}
```

### Responsive images and `srcset` attribute

If the upload is successful, a `Promise` returned by the {@link module:upload/filerepository~UploadAdapter#upload `MyUploadAdapter.upload()`} method can resolve with more than just a `default` path to the uploaded image. See the implementation of `MyUploadAdapter._initListeners()`. This usually looks like this:

```js
{
	default: 'http://example.com/images/image–default-size.png'
}
```

Other image sizes can also be provided in the response, allowing [responsive images](https://developer.mozilla.org/en-US/docs/Learn/HTML/Multimedia_and_embedding/Responsive_images) in the editor. The response containing more than just one image size could look like this:

```js
{
	default: 'http://example.com/images/image–default-size.png',
	'160': 'http://example.com/images/image–size-160.image.png',
	'500': 'http://example.com/images/image–size-500.image.png',
	'1000': 'http://example.com/images/image–size-1000.image.png',
	'1052': 'http://example.com/images/image–default-size.png'
}
```

<info-box>
	When returning multiple images, the widest returned one should be the default one. It is essential to correctly set the `width` attribute of the image in the rich-text editor content.
</info-box>

The {@link module:image/imageupload~ImageUpload image upload} plugin is capable of handling multiple image sizes returned by the upload adapter. It will automatically add the URLs to other images sizes to the `srcset` attribute of the image in the content.

Knowing that, you can implement the `XMLHttpRequest#load` listener that resolves the upload promise in the [previous section](#using-xmlhttprequest-in-an-adapter) so that it passes the entire `urls` property of the server response to the image upload plugin:

```js
// The rest of the MyUploadAdapter class definition.
// ...

xhr.addEventListener( 'load', () => {
	const response = xhr.response;

	// Response handling.
	// ...

	// response.urls = {
	// 	default: 'http://example.com/images/image–default-size.png',
	// 	'160': '...',
	// 	'500': '...',
	// 	More response urls.
	//  ...
	// 	'1052': 'http://example.com/images/image–default-size.png'
	// }
	resolve( response.urls );
} );

// The rest of the MyUploadAdapter class definition.
// ...
```

### Passing additional data to the response

There is a chance you might need to pass some data from the server to provide additional data to some features. To do that, you need to wrap all URLs in the `urls` property and pass additional data in the top level of the object.

For image uploading, you can later retrieve the data in the {@link module:image/imageupload/imageuploadediting~ImageUploadEditing#event:uploadComplete `uploadComplete`} event. This allows setting new attributes and overriding the existing ones on the model image based on the data just after the image is uploaded.

```js
{
	urls: {
		default: 'http://example.com/images/image–default-size.png',
		// Optional different sizes of images.
	},
	customProperty: 'foo'
}
```

### Activating a custom upload adapter

Having implemented the adapter, you must figure out how to enable it in the WYSIWYG editor. The good news is that it is pretty easy, and you do not need to {@link getting-started/legacy-getting-started/quick-start-other#building-the-editor-from-source rebuild the editor} to do that!

You are going to extend the basic implementation presented in ["The anatomy of the adapter"](#the-anatomy-of-the-adapter) section of this guide so your custom adapter becomes an editor plugin. To do that, create a simple standalone plugin (`MyCustomUploadAdapterPlugin`) that will {@link module:upload/filerepository~FileRepository#createLoader create an instance of the file loader} and glue it with your custom `MyUploadAdapter`.

<code-switcher>
```js
import { ClassicEditor, Essentials, Paragraph, Image, ImageUpload } from 'ckeditor5';

class MyUploadAdapter {
	// MyUploadAdapter class definition.
	// ...
}

function MyCustomUploadAdapterPlugin( editor ) {
	editor.plugins.get( 'FileRepository' ).createUploadAdapter = ( loader ) => {
		// Configure the URL to the upload script in your backend here!
		return new MyUploadAdapter( loader );
	};
}
```
</code-switcher>

Enable the `MyCustomUploadAdapterPlugin` in the editor by using the {@link module:core/editor/editorconfig~EditorConfig#extraPlugins `config.extraPlugins`} option:

```js
ClassicEditor
	.create( document.querySelector( '#editor' ), {
		plugins: [ MyCustomUploadAdapterPlugin, Essentials, Paragraph, Image, ImageUpload, /* ... */ ],
		// More configuration options.
		// ...
	} )
	.catch( error => {
		console.log( error );
	} );
```

Run the editor and see if your implementation works. Drop an image into the WYSIWYG editor content and it should be uploaded to the server thanks to the `MyUploadAdapter`.

### The complete implementation

Here is what the complete implementation of an `XMLHttpRequest`–based upload adapter looks like. You can use this code as a foundation to build custom upload adapters for your applications.

<code-switcher>
```js
import { ClassicEditor, Essentials, Paragraph, Image, ImageUpload } from 'ckeditor5';

class MyUploadAdapter {
	constructor( loader ) {
		// The file loader instance to use during the upload.
		this.loader = loader;
	}

	// Starts the upload process.
	upload() {
		return this.loader.file
			.then( file => new Promise( ( resolve, reject ) => {
				this._initRequest();
				this._initListeners( resolve, reject, file );
				this._sendRequest( file );
			} ) );
	}

	// Aborts the upload process.
	abort() {
		if ( this.xhr ) {
			this.xhr.abort();
		}
	}

	// Initializes the XMLHttpRequest object using the URL passed to the constructor.
	_initRequest() {
		const xhr = this.xhr = new XMLHttpRequest();

		// Note that your request may look different. It is up to you and your editor
		// integration to choose the right communication channel. This example uses
		// a POST request with JSON as a data structure but your configuration
		// could be different.
		xhr.open( 'POST', 'http://example.com/image/upload/path', true );
		xhr.responseType = 'json';
	}

	// Initializes XMLHttpRequest listeners.
	_initListeners( resolve, reject, file ) {
		const xhr = this.xhr;
		const loader = this.loader;
		const genericErrorText = `Couldn't upload file: ${ file.name }.`;

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

		// Upload progress when it is supported. The file loader has the #uploadTotal and #uploaded
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

	// Prepares the data and sends the request.
	_sendRequest( file ) {
		// Prepare the form data.
		const data = new FormData();

		data.append( 'upload', file );

		// Important note: This is the right place to implement security mechanisms
		// like authentication and CSRF protection. For instance, you can use
		// XMLHttpRequest.setRequestHeader() to set the request headers containing
		// the CSRF token generated earlier by your application.

		// Send the request.
		this.xhr.send( data );
	}
}

function MyCustomUploadAdapterPlugin( editor ) {
	editor.plugins.get( 'FileRepository' ).createUploadAdapter = ( loader ) => {
		// Configure the URL to the upload script in your back-end here!
		return new MyUploadAdapter( loader );
	};
}

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		plugins: [ MyCustomUploadAdapterPlugin, Essentials, Paragraph, Image, ImageUpload, /* ... */ ],

		// More configuration options.
		// ...
	} )
	.catch( error => {
		console.log( error );
	} );
```
</code-switcher>

## What's next

Check out the comprehensive {@link features/image-upload image upload overview} guide to learn more about different ways of uploading images in CKEditor&nbsp;5. See the {@link features/images-overview image feature} guide to find out more about handling images in CKEditor&nbsp;5.

<style>
.custom-adapter td:first-child {
	white-space: nowrap;
}
</style>
