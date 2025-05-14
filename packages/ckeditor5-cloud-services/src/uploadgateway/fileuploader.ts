/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module cloud-services/uploadgateway/fileuploader
 */

import type { UploadResponse } from 'ckeditor5/src/upload.js';
import { EmitterMixin, CKEditorError } from 'ckeditor5/src/utils.js';
import type { InitializedToken } from '../token/token.js';

const BASE64_HEADER_REG_EXP = /^data:(\S*?);base64,/;

/**
 * FileUploader class used to upload single file.
 */
export default class FileUploader extends /* #__PURE__ */ EmitterMixin() {
	/**
	 * A file that is being uploaded.
	 */
	public readonly file: Blob;

	public xhr?: XMLHttpRequest;

	/**
	 * CKEditor Cloud Services access token.
	 */
	private readonly _token: InitializedToken;

	/**
	 * CKEditor Cloud Services API address.
	 */
	private readonly _apiAddress: string;

	/**
	 * Creates `FileUploader` instance.
	 *
	 * @param fileOrData A blob object or a data string encoded with Base64.
	 * @param token Token used for authentication.
	 * @param apiAddress API address.
	 */
	constructor(
		fileOrData: string | Blob,
		token: InitializedToken,
		apiAddress: string
	) {
		super();

		if ( !fileOrData ) {
			/**
			 * File must be provided as the first argument.
			 *
			 * @error fileuploader-missing-file
			 */
			throw new CKEditorError( 'fileuploader-missing-file', null );
		}

		if ( !token ) {
			/**
			 * Token must be provided as the second argument.
			 *
			 * @error fileuploader-missing-token
			 */
			throw new CKEditorError( 'fileuploader-missing-token', null );
		}

		if ( !apiAddress ) {
			/**
			 * Api address must be provided as the third argument.
			 *
			 * @error fileuploader-missing-api-address
			 */
			throw new CKEditorError( 'fileuploader-missing-api-address', null );
		}

		this.file = _isBase64( fileOrData ) ? _base64ToBlob( fileOrData ) : fileOrData;

		this._token = token;
		this._apiAddress = apiAddress;
	}

	/**
	 * Registers callback on `progress` event.
	 */
	public onProgress( callback: ( status: { total: number; uploaded: number } ) => void ): this {
		this.on<FileUploaderProgressErrorEvent>( 'progress', ( event, data ) => callback( data ) );

		return this;
	}

	/**
	 * Registers callback on `error` event. Event is called once when error occurs.
	 */
	public onError( callback: ( error: string ) => void ): this {
		this.once<FileUploaderErrorEvent>( 'error', ( event, data ) => callback( data ) );

		return this;
	}

	/**
	 * Aborts upload process.
	 */
	public abort(): void {
		this.xhr!.abort();
	}

	/**
	 * Sends XHR request to API.
	 */
	public send(): Promise<UploadResponse> {
		this._prepareRequest();
		this._attachXHRListeners();

		return this._sendRequest();
	}

	/**
	 * Prepares XHR request.
	 */
	private _prepareRequest() {
		const xhr = new XMLHttpRequest();

		xhr.open( 'POST', this._apiAddress );
		xhr.setRequestHeader( 'Authorization', this._token.value );
		xhr.responseType = 'json';

		this.xhr = xhr;
	}

	/**
	 * Attaches listeners to the XHR.
	 */
	private _attachXHRListeners() {
		const xhr = this.xhr!;

		const onError = ( message: string ) => {
			return () => this.fire<FileUploaderErrorEvent>( 'error', message );
		};

		xhr.addEventListener( 'error', onError( 'Network Error' ) );
		xhr.addEventListener( 'abort', onError( 'Abort' ) );

		/* istanbul ignore else -- @preserve */
		if ( xhr.upload ) {
			xhr.upload.addEventListener( 'progress', event => {
				if ( event.lengthComputable ) {
					this.fire<FileUploaderProgressErrorEvent>( 'progress', {
						total: event.total,
						uploaded: event.loaded
					} );
				}
			} );
		}

		xhr.addEventListener( 'load', () => {
			const statusCode = xhr.status;
			const xhrResponse = xhr.response;

			if ( statusCode < 200 || statusCode > 299 ) {
				return this.fire<FileUploaderErrorEvent>( 'error', xhrResponse.message || xhrResponse.error );
			}
		} );
	}

	/**
	 * Sends XHR request.
	 */
	private _sendRequest() {
		const formData = new FormData();
		const xhr = this.xhr!;

		formData.append( 'file', this.file );

		return new Promise<UploadResponse>( ( resolve, reject ) => {
			xhr.addEventListener( 'load', () => {
				const statusCode = xhr.status;
				const xhrResponse = xhr.response;

				if ( statusCode < 200 || statusCode > 299 ) {
					if ( xhrResponse.message ) {
						/**
						 * Uploading file failed.
						 *
						 * @error fileuploader-uploading-data-failed
						 */
						return reject( new CKEditorError(
							'fileuploader-uploading-data-failed',
							this,
							{ message: xhrResponse.message }
						) );
					}

					return reject( xhrResponse.error );
				}

				return resolve( xhrResponse );
			} );

			xhr.addEventListener( 'error', () => reject( new Error( 'Network Error' ) ) );
			xhr.addEventListener( 'abort', () => reject( new Error( 'Abort' ) ) );

			xhr.send( formData );
		} );
	}
}

/**
 * Fired when error occurs.
 *
 * @eventName ~FileUploader#error
 * @param error Error message
 */
export type FileUploaderErrorEvent = {
	name: 'error';
	args: [ error: string ];
};

/**
 * Fired on upload progress.
 *
 * @eventName ~FileUploader#progress
 * @param status Total and uploaded status
 */
export type FileUploaderProgressErrorEvent = {
	name: 'progress';
	args: [ status: { total: number; uploaded: number } ];
};

/**
 * Transforms Base64 string data into file.
 *
 * @param base64 String data.
 */
function _base64ToBlob( base64: string, sliceSize = 512 ) {
	try {
		const contentType = base64.match( BASE64_HEADER_REG_EXP )![ 1 ];
		const base64Data = atob( base64.replace( BASE64_HEADER_REG_EXP, '' ) );

		const byteArrays: Array<Uint8Array> = [];

		for ( let offset = 0; offset < base64Data.length; offset += sliceSize ) {
			const slice = base64Data.slice( offset, offset + sliceSize );
			const byteNumbers = new Array<number>( slice.length );

			for ( let i = 0; i < slice.length; i++ ) {
				byteNumbers[ i ] = slice.charCodeAt( i );
			}

			byteArrays.push( new Uint8Array( byteNumbers ) );
		}

		return new Blob( byteArrays, { type: contentType } );
	} catch {
		/**
		 * Problem with decoding Base64 image data.
		 *
		 * @error fileuploader-decoding-image-data-error
		 */
		throw new CKEditorError( 'fileuploader-decoding-image-data-error', null );
	}
}

/**
 * Checks that string is Base64.
 */
function _isBase64( string: string | Blob ): string is string {
	if ( typeof string !== 'string' ) {
		return false;
	}

	return !!string.match( BASE64_HEADER_REG_EXP )?.length;
}
