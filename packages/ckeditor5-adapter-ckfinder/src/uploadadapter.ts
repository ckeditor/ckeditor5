/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals XMLHttpRequest, FormData */

/**
 * @module adapter-ckfinder/uploadadapter
 */

import { Plugin } from 'ckeditor5/src/core';
import {
	FileRepository,
	type UploadAdapter as UploadAdapterInterface,
	type FileLoader,
	type UploadResponse
} from 'ckeditor5/src/upload';
import type { LocaleTranslate } from 'ckeditor5/src/utils';

import { getCsrfToken } from './utils';

/**
 * A plugin that enables file uploads in CKEditor 5 using the CKFinder server–side connector.
 *
 * See the {@glink features/file-management/ckfinder "CKFinder file manager integration"} guide to learn how to configure
 * and use this feature as well as find out more about the full integration with the file manager
 * provided by the {@link module:ckfinder/ckfinder~CKFinder} plugin.
 *
 * Check out the {@glink features/images/image-upload/image-upload comprehensive "Image upload overview"} guide to learn
 * about other ways to upload images into CKEditor 5.
 */
export default class CKFinderUploadAdapter extends Plugin {
	/**
	 * @inheritDoc
	 */
	public static get requires() {
		return [ FileRepository ] as const;
	}

	/**
	 * @inheritDoc
	 */
	public static get pluginName(): 'CKFinderUploadAdapter' {
		return 'CKFinderUploadAdapter';
	}

	/**
	 * @inheritDoc
	 */
	public init(): void {
		const url = this.editor.config.get( 'ckfinder.uploadUrl' )! as string;

		if ( !url ) {
			return;
		}

		// Register CKFinderAdapter
		this.editor.plugins.get( FileRepository ).createUploadAdapter = loader => new UploadAdapter( loader, url, this.editor.t );
	}
}

/**
 * Upload adapter for CKFinder.
 */
class UploadAdapter implements UploadAdapterInterface {
	/**
	 * FileLoader instance to use during the upload.
	 */
	public loader: FileLoader;

	/**
	 * Upload URL.
	 */
	public url: string;

	/**
	 * Locale translation method.
	 */
	public t: LocaleTranslate;

	private xhr?: XMLHttpRequest;

	/**
	 * Creates a new adapter instance.
	 */
	constructor( loader: FileLoader, url: string, t: LocaleTranslate ) {
		this.loader = loader;
		this.url = url;
		this.t = t;
	}

	/**
	 * Starts the upload process.
	 *
	 * @see module:upload/filerepository~UploadAdapter#upload
	 */
	public upload() {
		return this.loader.file.then( file => {
			return new Promise<UploadResponse>( ( resolve, reject ) => {
				this._initRequest();
				this._initListeners( resolve, reject, file! );
				this._sendRequest( file! );
			} );
		} );
	}

	/**
	 * Aborts the upload process.
	 *
	 * @see module:upload/filerepository~UploadAdapter#abort
	 */
	public abort() {
		if ( this.xhr ) {
			this.xhr.abort();
		}
	}

	/**
	 * Initializes the XMLHttpRequest object.
	 */
	private _initRequest() {
		const xhr = this.xhr = new XMLHttpRequest();

		xhr.open( 'POST', this.url, true );
		xhr.responseType = 'json';
	}

	/**
	 * Initializes XMLHttpRequest listeners.
	 *
	 * @param resolve Callback function to be called when the request is successful.
	 * @param reject Callback function to be called when the request cannot be completed.
	 * @param file File instance to be uploaded.
	 */
	private _initListeners(
		resolve: ( value: UploadResponse ) => void,
		reject: ( reason?: unknown ) => void,
		file: File
	) {
		const xhr = this.xhr!;
		const loader = this.loader;
		const t = this.t;
		const genericError = t( 'Cannot upload file:' ) + ` ${ file.name }.`;

		xhr.addEventListener( 'error', () => reject( genericError ) );
		xhr.addEventListener( 'abort', () => reject() );
		xhr.addEventListener( 'load', () => {
			const response = xhr.response;

			if ( !response || !response.uploaded ) {
				return reject( response && response.error && response.error.message ? response.error.message : genericError );
			}

			resolve( {
				default: response.url
			} );
		} );

		// Upload progress when it's supported.
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
	 * @param file File instance to be uploaded.
	 */
	private _sendRequest( file: File ) {
		// Prepare form data.
		const data = new FormData();
		data.append( 'upload', file );
		data.append( 'ckCsrfToken', getCsrfToken() );

		// Send request.
		this.xhr!.send( data );
	}
}
