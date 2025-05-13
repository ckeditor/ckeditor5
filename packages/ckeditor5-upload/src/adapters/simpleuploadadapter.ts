/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module upload/adapters/simpleuploadadapter
 */

import { Plugin } from '@ckeditor/ckeditor5-core';
import FileRepository, { type UploadResponse, type FileLoader, type UploadAdapter } from '../filerepository.js';
import type { SimpleUploadConfig } from '../uploadconfig.js';
import { logWarning } from '@ckeditor/ckeditor5-utils';

/**
 * The Simple upload adapter allows uploading images to an application running on your server using
 * the [`XMLHttpRequest`](https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest) API with a
 * minimal {@link module:upload/uploadconfig~SimpleUploadConfig editor configuration}.
 *
 * ```ts
 * ClassicEditor
 * 	.create( document.querySelector( '#editor' ), {
 * 		simpleUpload: {
 * 			uploadUrl: 'http://example.com',
 * 			headers: {
 * 				...
 * 			}
 * 		}
 * 	} )
 * 	.then( ... )
 * 	.catch( ... );
 * ```
 *
 * See the {@glink features/images/image-upload/simple-upload-adapter "Simple upload adapter"} guide to learn how to
 * learn more about the feature (configuration, server–side requirements, etc.).
 *
 * Check out the {@glink features/images/image-upload/image-upload comprehensive "Image upload overview"} to learn about
 * other ways to upload images into CKEditor 5.
 */
export default class SimpleUploadAdapter extends Plugin {
	/**
	 * @inheritDoc
	 */
	public static get requires() {
		return [ FileRepository ] as const;
	}

	/**
	 * @inheritDoc
	 */
	public static get pluginName() {
		return 'SimpleUploadAdapter' as const;
	}

	/**
	 * @inheritDoc
	 */
	public static override get isOfficialPlugin(): true {
		return true;
	}

	/**
	 * @inheritDoc
	 */
	public init(): void {
		const options = this.editor.config.get( 'simpleUpload' );

		if ( !options ) {
			return;
		}

		if ( !options.uploadUrl ) {
			/**
			 * The {@link module:upload/uploadconfig~SimpleUploadConfig#uploadUrl `config.simpleUpload.uploadUrl`}
			 * configuration required by the {@link module:upload/adapters/simpleuploadadapter~SimpleUploadAdapter `SimpleUploadAdapter`}
			 * is missing. Make sure the correct URL is specified for the image upload to work properly.
			 *
			 * @error simple-upload-adapter-missing-uploadurl
			 */
			logWarning( 'simple-upload-adapter-missing-uploadurl' );

			return;
		}

		this.editor.plugins.get( FileRepository ).createUploadAdapter = loader => {
			return new Adapter( loader, options );
		};
	}
}

/**
 * Upload adapter.
 */
class Adapter implements UploadAdapter {
	/**
	 * FileLoader instance to use during the upload.
	 */
	public loader: FileLoader;

	/**
	 * The configuration of the adapter.
	 */
	public options: SimpleUploadConfig;

	private xhr?: XMLHttpRequest;

	/**
	 * Creates a new adapter instance.
	 */
	constructor( loader: FileLoader, options: SimpleUploadConfig ) {
		this.loader = loader;
		this.options = options;
	}

	/**
	 * Starts the upload process.
	 *
	 * @see module:upload/filerepository~UploadAdapter#upload
	 */
	public upload(): Promise<UploadResponse> {
		return this.loader.file
			.then( file => new Promise( ( resolve, reject ) => {
				this._initRequest();
				this._initListeners( resolve, reject, file! );
				this._sendRequest( file! );
			} ) );
	}

	/**
	 * Aborts the upload process.
	 *
	 * @see module:upload/filerepository~UploadAdapter#abort
	 */
	public abort(): void {
		if ( this.xhr ) {
			this.xhr.abort();
		}
	}

	/**
	 * Initializes the `XMLHttpRequest` object using the URL specified as
	 * {@link module:upload/uploadconfig~SimpleUploadConfig#uploadUrl `simpleUpload.uploadUrl`} in the editor's
	 * configuration.
	 */
	private _initRequest(): void {
		const xhr = this.xhr = new XMLHttpRequest();

		xhr.open( 'POST', this.options.uploadUrl, true );
		xhr.responseType = 'json';
	}

	/**
	 * Initializes XMLHttpRequest listeners
	 *
	 * @param resolve Callback function to be called when the request is successful.
	 * @param reject Callback function to be called when the request cannot be completed.
	 * @param file Native File object.
	 */
	private _initListeners(
		resolve: ( result: UploadResponse ) => void,
		reject: ( message?: string ) => void,
		file: File
	): void {
		const xhr = this.xhr!;
		const loader = this.loader;
		const genericErrorText = `Couldn't upload file: ${ file.name }.`;

		xhr.addEventListener( 'error', () => reject( genericErrorText ) );
		xhr.addEventListener( 'abort', () => reject() );
		xhr.addEventListener( 'load', () => {
			const response = xhr.response;

			if ( !response || response.error ) {
				return reject( response && response.error && response.error.message ? response.error.message : genericErrorText );
			}

			const urls = response.url ? { default: response.url } : response.urls;

			// Resolve with the normalized `urls` property and pass the rest of the response
			// to allow customizing the behavior of features relying on the upload adapters.
			resolve( {
				...response,
				urls
			} );
		} );

		// Upload progress when it is supported.
		/* istanbul ignore else -- @preserve */
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
	 * @param file File instance to be uploaded.
	 */
	private _sendRequest( file: File ): void {
		// Set headers if specified.
		let headers = this.options.headers || {};

		if ( typeof headers === 'function' ) {
			headers = headers( file );
		}

		// Use the withCredentials flag if specified.
		const withCredentials = this.options.withCredentials || false;

		for ( const headerName of Object.keys( headers ) ) {
			this.xhr!.setRequestHeader( headerName, headers[ headerName ] );
		}

		this.xhr!.withCredentials = withCredentials;

		// Prepare the form data.
		const data = new FormData();

		data.append( 'upload', file );

		// Send the request.
		this.xhr!.send( data );
	}
}
