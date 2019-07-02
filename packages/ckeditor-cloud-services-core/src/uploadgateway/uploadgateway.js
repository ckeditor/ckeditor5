/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

import FileUploader from './fileuploader';
import CKEditorError from '@ckeditor/ckeditor5-utils/src/ckeditorerror';

/**
 * UploadGateway abstracts file uploads to CKEditor Cloud Services.
 */
export default class UploadGateway {
	/**
	 * Creates `UploadGateway` instance.
	 *
	 * @param {Token} token Token used for authentication.
	 * @param {String} apiAddress API address.
	 */
	constructor( token, apiAddress ) {
		if ( !token ) {
			/**
			 * Token must be provided.
			 *
			 * @error uploadgateway-missing-token
			 */
			throw new CKEditorError( 'uploadgateway-missing-token: Token must be provided.', null );
		}

		if ( !apiAddress ) {
			/**
			 * Api address must be provided.
			 *
			 * @error uploadgateway-missing-api-address
			 */
			throw new CKEditorError( 'uploadgateway-missing-api-address: Api address must be provided.', null );
		}

		/**
		 * CKEditor Cloud Services access token.
		 *
		 * @type {Token}
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
	 *     const token = await Token.create( 'https://token-endpoint' );
	 *     new UploadGateway( token, 'https://example.org' )
	 *        .upload( 'FILE' )
	 *        .onProgress( ( data ) => console.log( data ) )
	 *        .send()
	 *        .then( ( response ) => console.log( response ) );
	 *
	 *     // OR
	 *
	 *     const token = await Token.create( 'https://token-endpoint' );
	 *     new UploadGateway( token, 'https://example.org' )
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

