/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module upload/adapters/simpleuploadadapter
 */

/* globals XMLHttpRequest, FormData */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import FileRepository from '../filerepository';
import log from '@ckeditor/ckeditor5-utils/src/log';

/**
 * The plugin that allows uploading images to the server using the
 * [`XMLHttpRequest`](https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest) API and very little configuration.
 *
 *		ClassicEditor
 *			.create( document.querySelector( '#editor' ), {
 *				simpleUpload: {
 *					uploadUrl: 'http://example.com',
 *					headers: {
 *					    ...
 *					}
 *				}
 *			} )
 *			.then( ... )
 *			.catch( ... );
 *
 * See the {@glink features/image-upload/simple-upload-adapter Simple upload adapter} guide to learn how to configure this feature.
 *
 * The plugin assumes that every response that will came from the XHR server will be a JSON.
 *
 * Note: During the upload process, the plugin will send a POST request under the URL specified as
 * {@link module:upload/adapters/simpleuploadadapter~SimpleUploadConfig#uploadUrl `simpleUpload.uploadUrl`}
 * in the editor's configuration.
 *
 * If the upload is successful, the XHR server should return an object that contains the `url` property which
 * points out to the uploaded image:
 *
 *		{
 *			"url": "https://example.com/images/foo.jpg"
 *		}
 *
 * If something went wrong, the XHR server must return an object that contains the `error` property which has its own `message`
 * that will be passed to the {@link module:ui/notification/notification~Notification#showWarning `Notification#showWarning`} method.
 *
 *		{
 *			"error": {
 *				"message": "The XHR server cannot handle the request."
 *			}
 *		}
 *
 * If the `message` property is missing in the `error` object,
 * the {@link module:ui/notification/notification~Notification#showWarning `Notification#showWarning`} method will receive
 * the default message: `Couldn't upload file: [filename].`
 *
 * Note: The plugin supports [`XHR.upload.progress`](https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/upload)
 * via `evt.total` and `evt.loaded`.
 *
 * Check out the {@glink features/image-upload/image-upload comprehensive "Image upload overview"} to learn about
 * other ways to upload images into CKEditor 5.
 *
 * @extends module:core/plugin~Plugin
 */
export default class SimpleUploadAdapter extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get requires() {
		return [ FileRepository ];
	}

	/**
	 * @inheritDoc
	 */
	static get pluginName() {
		return 'SimpleUploadAdapter';
	}

	/**
	 * @inheritDoc
	 */
	init() {
		const options = this.editor.config.get( 'simpleUpload' );

		if ( !options ) {
			return;
		}

		if ( !options.uploadUrl ) {
			/**
			 * The {@link module:upload/adapters/simpleuploadadapter~SimpleUploadConfig#uploadUrl `config.simpleUpload.uploadUrl`}
			 * configuration required by the {@link module:upload/adapters/simpleuploadadapter~SimpleUploadAdapter `SimpleUploadAdapter`}
			 * is missing. Make sure the correct URL is specified for the image upload to work properly.
			 *
			 * @error simple-upload-adapter-missing-uploadUrl
			 */
			log.warn(
				'simple-upload-adapter-missing-uploadUrl: Missing the "uploadUrl" property in the "simpleUpload" editor configuration.'
			);

			return;
		}

		this.editor.plugins.get( FileRepository ).createUploadAdapter = loader => {
			return new Adapter( loader, options );
		};
	}
}

/**
 * Upload adapter.
 *
 * @private
 * @implements module:upload/filerepository~UploadAdapter
 */
class Adapter {
	/**
	 * Creates a new adapter instance.
	 *
	 * @param {module:upload/filerepository~FileLoader} loader
	 * @param {module:upload/adapters/simpleuploadadapter~SimpleUploadConfig} options
	 */
	constructor( loader, options ) {
		/**
		 * FileLoader instance to use during the upload.
		 *
		 * @member {module:upload/filerepository~FileLoader} #loader
		 */
		this.loader = loader;

		/**
		 * The configuration of the adapter.
		 *
		 * @member {module:upload/adapters/simpleuploadadapter~SimpleUploadConfig} #options
		 */
		this.options = options;
	}

	/**
	 * Starts the upload process.
	 *
	 * @see module:upload/filerepository~UploadAdapter#upload
	 * @returns {Promise}
	 */
	upload() {
		return this.loader.file
			.then( file => new Promise( ( resolve, reject ) => {
				this._initRequest();
				this._initListeners( resolve, reject, file );
				this._sendRequest( file );
			} ) );
	}

	/**
	 * Aborts the upload process.
	 *
	 * @see module:upload/filerepository~UploadAdapter#abort
	 * @returns {Promise}
	 */
	abort() {
		if ( this.xhr ) {
			this.xhr.abort();
		}
	}

	/**
	 * Initializes the `XMLHttpRequest` object using the URL specified as
	 * {@link module:upload/adapters/simpleuploadadapter~SimpleUploadConfig#uploadUrl `simpleUpload.uploadUrl`} in the editor's
	 * configuration.
	 *
	 * @private
	 */
	_initRequest() {
		const xhr = this.xhr = new XMLHttpRequest();

		xhr.open( 'POST', this.options.uploadUrl, true );
		xhr.responseType = 'json';
	}

	/**
	 * Initializes XMLHttpRequest listeners
	 *
	 * @private
	 * @param {Function} resolve Callback function to be called when the request is successful.
	 * @param {Function} reject Callback function to be called when the request cannot be completed.
	 * @param {File} file Native File object.
	 */
	_initListeners( resolve, reject, file ) {
		const xhr = this.xhr;
		const loader = this.loader;
		const genericErrorText = `Couldn't upload file: ${ file.name }.`;

		xhr.addEventListener( 'error', () => reject( genericErrorText ) );
		xhr.addEventListener( 'abort', () => reject() );
		xhr.addEventListener( 'load', () => {
			const response = xhr.response;

			if ( !response || response.error ) {
				return reject( response && response.error && response.error.message ? response.error.message : genericErrorText );
			}

			resolve( {
				default: response.url
			} );
		} );

		// Upload progress when it is supported.
		/* istanbul ignore else */
		if ( xhr.upload ) {
			xhr.upload.addEventListener( 'progress', evt => {
				if ( evt.lengthComputable ) {
					loader.uploadTotal = evt.total;
					loader.uploaded = evt.loaded;
				}
			} );
		}
	}

	/**
	 * Prepares the data and sends the request.
	 *
	 * @private
	 * @param {File} file File instance to be uploaded.
	 */
	_sendRequest( file ) {
		// Set headers if specified.
		const headers = this.options.headers || {};

		for ( const headerName of Object.keys( headers ) ) {
			this.xhr.setRequestHeader( headerName, headers[ headerName ] );
		}

		// Prepare the form data.
		const data = new FormData();

		data.append( 'upload', file );

		// Send the request.
		this.xhr.send( data );
	}
}

/**
 * The configuration of the {@link module:upload/adapters/simpleuploadadapter~SimpleUploadAdapter simple upload adapter}.
 *
 *		ClassicEditor
 *			.create( editorElement, {
 *				simpleUpload: {
 *					uploadUrl: '',
 *					headers: {
 *					    ...
 *					}
 *				}
 *			} );
 *			.then( ... )
 *			.catch( ... );
 *
 * See {@link module:core/editor/editorconfig~EditorConfig all editor configuration options}.
 *
 * @interface SimpleUploadConfig
 */

/**
 * The configuration of the {@link module:upload/adapters/simpleuploadadapter~SimpleUploadAdapter simple upload adapter}.
 *
 * Read more in {@link module:upload/adapters/simpleuploadadapter~SimpleUploadConfig}.
 *
 * @member {module:upload/adapters/simpleuploadadapter~SimpleUploadConfig} module:core/editor/editorconfig~EditorConfig#simpleUpload
 */

/**
 * The path (URL) to the server which handles the file upload. When specified, enables the automatic
 * upload of resources such as images inserted into the content.
 *
 * @member {String} module:upload/adapters/simpleuploadadapter~SimpleUploadConfig#uploadUrl
 */

/**
 * An object that defines additional [headers](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers) for request
 * that is being sent during the upload. This is the right place to implement security mechanisms like authentication and CSRF protection.
 *
 *		ClassicEditor
 *			.create( editorElement, {
 *				simpleUpload: {
 *					headers: {
 *					    'X-CSRF-TOKEN': 'CSRF-Token',
 *					    Authorization: 'Bearer <JSON Web Token>'
 *					}
 *				}
 *			} );
 *			.then( ... )
 *			.catch( ... );
 *
 * @member {Object.<String, String>} module:upload/adapters/simpleuploadadapter~SimpleUploadConfig#headers
 */
