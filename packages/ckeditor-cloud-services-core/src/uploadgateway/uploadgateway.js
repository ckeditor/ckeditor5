/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

import FileUploader from './fileuploader';

/**
 * UploadGateway abstracts file uploads to CKEditor Cloud Services.
 */
export default class UploadGateway {
	/**
	 * Creates `UploadGateway` instance.
	 *
	 * @param {String} token Token used for authentication.
	 * @param {String} apiAddress API address.
	 */
	constructor( token, apiAddress ) {
		if ( !token ) {
			throw new Error( 'Token must be provided' );
		}

		if ( !apiAddress ) {
			throw new Error( 'Api address must be provided' );
		}

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
	 * Creates a {@link FileUploader} instance that wraps file upload process.
	 * The file is being sent at a time when the method {@link FileUploader#then then} is called
	 * or when {@link FileUploader#send send} method is called.
	 *
	 *     new UploadGateway( 'JSON_WEB_TOKEN_FROM_SERVER', 'https://example.org' )
	 *        .upload( 'FILE' )
	 *        .onProgress( ( data ) => console.log( data ) )
	 *        .send()
	 *        .then( ( response ) => console.log( response ) );
	 *
	 *     // OR
	 *
	 *     new UploadGateway( 'JSON_WEB_TOKEN_FROM_SERVER', 'https://example.org' )
	 *         .upload( 'FILE' )
	 *         .onProgress( ( data ) => console.log( data ) )
	 *         .send()
	 *         .then( ( response ) => console.log( response ) );
	 *
	 * @param {Blob/String} fileOrData A blob object or a data string encoded with Base64.
	 * @returns {FileUploader} Returns `FileUploader` instance.
	 */
	upload( fileOrData ) {
		return new FileUploader( fileOrData, this._token, this._apiAddress );
	}
}

