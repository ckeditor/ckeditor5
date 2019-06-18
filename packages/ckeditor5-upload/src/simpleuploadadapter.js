/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module upload/simpleuploadadapter
 */

/* globals XMLHttpRequest, FormData */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import FileRepository from './filerepository';
import log from '@ckeditor/ckeditor5-utils/src/log';

/**
 * A plugin that enables file uploads in CKEditor 5 using the external side-server connection.
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
			 * Configuration passed to the editor is missing a URL specified as `simpleUpload.uploadUrl` which is required because,
			 * under the specified URL, all images will be uploaded.
			 *
			 * @error simple-upload-adapter
			 */
			log.warn( 'simple-upload-adapter-missing-uploadUrl: Missing "uploadUrl" in the "simpleUpload" editor configuration.' );

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
	 * @param {module:upload/simpleuploadadapter~SimpleUploadConfig} options
	 * @param {String} options.uploadUrl A URL where the image will be sent.
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
		 * @member {module:upload/simpleuploadadapter~SimpleUploadConfig} #options
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
	 * Initializes the XMLHttpRequest object using the URL passed to the constructor.
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

			// We assume the XHR server's "response" object will come with
			// an "error" which has its own "message" that can be passed to reject()
			// in the upload promise.
			//
			// Your integration may handle upload errors in a different way so make sure
			// it is done properly. The reject() function must be called when the upload fails.
			if ( !response || response.error ) {
				return reject( response && response.error && response.error.message ? response.error.message : genericErrorText );
			}

			// If the upload is successful, resolve the upload promise with an object containing
			// at least the "default" URL, pointing to the image on the server.
			// This URL will be used to display the image in the content.
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
 * The configuration of the {@link module:upload/simpleuploadadapter~SimpleUploadAdapter simple upload adapter}.
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
 * The configuration of the {@link module:upload/simpleuploadadapter~SimpleUploadAdapter simple upload adapter}.
 *
 * Read more in {@link module:upload/simpleuploadadapter~SimpleUploadConfig}.
 *
 * @member {module:upload/simpleuploadadapter~SimpleUploadConfig} module:core/editor/editorconfig~EditorConfig#simpleUpload
 */

/**
 * The path (URL) to the server which handles the file upload. When specified, enables the automatic
 * upload of resources such as images inserted into the content.
 *
 * @member {String} module:upload/simpleuploadadapter~SimpleUploadConfig#uploadUrl
 */

/**
 * An object that defines additional headers for request that is being sent during the upload. This is the right place to
 * implement security mechanisms like authentication and CSRF protection.
 *
 *		ClassicEditor
 *			.create( editorElement, {
 *				simpleUpload: {
 *					headers: {
 *					    'X-CSRF-TOKEN': 'CSFR-Token',
 *					    Authorization: 'Bearer <JSON Web Token>'
 *					}
 *				}
 *			} );
 *			.then( ... )
 *			.catch( ... );
 *
 * @member {Object.<String, String>} module:upload/simpleuploadadapter~SimpleUploadConfig#headers
 */
