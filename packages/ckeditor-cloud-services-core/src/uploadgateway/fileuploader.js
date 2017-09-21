/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* eslint-env browser */

'use strict';

import mix from '@ckeditor/ckeditor5-utils/src/mix';
import EmitterMixin from '@ckeditor/ckeditor5-utils/src/emittermixin';

const BASE64_HEADER_REG_EXP = /^data:(\S*?);base64,/;

/**
 * FileUploader class used to upload single file.
 */
class FileUploader {
	/**
	 * Creates `FileUploader` instance.
	 *
	 * @param {Blob|String} fileOrData A blob object or a data string encoded with Base64.
	 * @param {String} token Token used for authentication.
	 * @param {String} apiAddress API address.
	 */
	constructor( fileOrData, token, apiAddress ) {
		if ( !fileOrData ) {
			throw new Error( 'File must be provided' );
		}

		if ( !token ) {
			throw new Error( 'Token must be provided' );
		}

		if ( !apiAddress ) {
			throw new Error( 'Api address must be provided' );
		}

		/**
		 * A file that is being uploaded.
		 *
		 * @type {Blob}
		 */
		this.file = _isBase64( fileOrData ) ? _base64ToBlob( fileOrData ) : fileOrData;

		/**
		 * CKEditor Cloud Services access token.
		 *
		 * @type {String}
		 * @private
		 */
		this._token = token;

		/**
		 * CKEditor Cloud Services API address.
		 *
		 * @type {String}
		 * @private
		 */
		this._apiAddress = apiAddress;
	}

	/**
	 * Registers callback on `progress` event.
	 *
	 * @chainable
	 * @param {Function} callback
	 * @returns {FileUploader}
	 */
	onProgress( callback ) {
		this.on( 'progress', ( event, data ) => callback( data ) );

		return this;
	}

	/**
	 * Registers callback on `error` event. Event is called once when error occurs.
	 *
	 * @chainable
	 * @param {Function} callback
	 * @returns {FileUploader}
	 */
	onError( callback ) {
		this.once( 'error', ( event, data ) => callback( data ) );

		return this;
	}

	/**
	 * Aborts upload process.
	 */
	abort() {
		this.xhr.abort();
	}

	/**
	 * Sends XHR request to API.
	 *
	 * @chainable
	 * @returns {Promise.<Object>}
	 */
	send() {
		this._prepareRequest();
		this._attachXHRListeners();

		return this._sendRequest();
	}

	/**
	 * Prepares XHR request.
	 *
	 * @private
	 */
	_prepareRequest() {
		const xhr = new XMLHttpRequest();

		xhr.open( 'POST', this._apiAddress );
		xhr.setRequestHeader( 'Authorization', this._token );
		xhr.responseType = 'json';

		this.xhr = xhr;
	}

	/**
	 * Attaches listeners to the XHR.
	 *
	 * @private
	 */
	_attachXHRListeners() {
		const that = this;
		const xhr = this.xhr;

		xhr.addEventListener( 'error', onError( 'Network Error' ) );
		xhr.addEventListener( 'abort', onError( 'Abort' ) );

		/* istanbul ignore else */
		if ( xhr.upload ) {
			xhr.upload.addEventListener( 'progress', event => {
				if ( event.lengthComputable ) {
					this.fire( 'progress', {
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
				return this.fire( 'error', xhrResponse.message || xhrResponse.error );
			}
		} );

		function onError( message ) {
			return () => that.fire( 'error', message );
		}
	}

	/**
	 * Sends XHR request.
	 *
	 * @private
	 */
	_sendRequest() {
		const formData = new FormData();
		const xhr = this.xhr;

		formData.append( 'file', this.file );

		return new Promise( ( resolve, reject ) => {
			xhr.addEventListener( 'load', () => {
				const statusCode = xhr.status;
				const xhrResponse = xhr.response;

				if ( statusCode < 200 || statusCode > 299 ) {
					return reject( xhrResponse.message || xhrResponse.error );
				}

				return resolve( xhrResponse );
			} );

			xhr.addEventListener( 'error', () => reject( 'Network Error' ) );
			xhr.addEventListener( 'abort', () => reject( 'Abort' ) );

			xhr.send( formData );
		} );
	}

	/**
	 * Fired when error occurs.
	 *
	 * @event error
	 * @param {String} error Error message
	 */

	/**
	 * Fired on upload progress.
	 *
	 * @event progress
	 * @param {Object} status Total and uploaded status
	 */
}

mix( FileUploader, EmitterMixin );

/**
 * Transforms Base64 string data into file.
 *
 * @param {String} base64 String data.
 * @param {Number} [sliceSize=512]
 * @returns {Blob}
 * @private
 */
function _base64ToBlob( base64, sliceSize = 512 ) {
	try {
		const contentType = base64.match( BASE64_HEADER_REG_EXP )[ 1 ];
		const base64Data = atob( base64.replace( BASE64_HEADER_REG_EXP, '' ) );

		const byteArrays = [];

		for ( let offset = 0; offset < base64Data.length; offset += sliceSize ) {
			const slice = base64Data.slice( offset, offset + sliceSize );
			const byteNumbers = new Array( slice.length );

			for ( let i = 0; i < slice.length; i++ ) {
				byteNumbers[ i ] = slice.charCodeAt( i );
			}

			byteArrays.push( new Uint8Array( byteNumbers ) );
		}

		return new Blob( byteArrays, { type: contentType } );
	} catch ( error ) {
		throw new Error( 'Problem with decoding Base64 image data.' );
	}
}

/**
 * Checks that string is Base64.
 *
 * @param {String} string
 * @returns {Boolean}
 * @private
 */
function _isBase64( string ) {
	if ( typeof string !== 'string' ) {
		return false;
	}

	const match = string.match( BASE64_HEADER_REG_EXP );
	return !!( match && match.length );
}

export default FileUploader;
