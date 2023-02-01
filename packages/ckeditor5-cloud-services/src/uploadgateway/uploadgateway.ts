/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module cloud-services/uploadgateway/uploadgateway
 */

import FileUploader from './fileuploader';
import type { InitializedToken } from '../token/token';
import { CKEditorError } from 'ckeditor5/src/utils';

/**
 * UploadGateway abstracts file uploads to CKEditor Cloud Services.
 */
export default class UploadGateway {
	/**
	 * CKEditor Cloud Services access token.
	 */
	private readonly _token: InitializedToken;

	/**
	 * CKEditor Cloud Services API address.
	 */
	private readonly _apiAddress: string;

	/**
	 * Creates `UploadGateway` instance.
	 *
	 * @param token Token used for authentication.
	 * @param apiAddress API address.
	 */
	constructor( token: InitializedToken, apiAddress: string ) {
		if ( !token ) {
			/**
			 * Token must be provided.
			 *
			 * @error uploadgateway-missing-token
			 */
			throw new CKEditorError( 'uploadgateway-missing-token', null );
		}

		if ( !apiAddress ) {
			/**
			 * Api address must be provided.
			 *
			 * @error uploadgateway-missing-api-address
			 */
			throw new CKEditorError( 'uploadgateway-missing-api-address', null );
		}

		this._token = token;
		this._apiAddress = apiAddress;
	}

	/**
	 * Creates a {@link module:cloud-services/uploadgateway/fileuploader~FileUploader} instance that wraps
	 * file upload process. The file is being sent at a time when the
	 * {@link module:cloud-services/uploadgateway/fileuploader~FileUploader#send} method is called.
	 *
	 * ```ts
	 * const token = await Token.create( 'https://token-endpoint' );
	 * new UploadGateway( token, 'https://example.org' )
	 * 	.upload( 'FILE' )
	 * 	.onProgress( ( data ) => console.log( data ) )
	 * 	.send()
	 * 	.then( ( response ) => console.log( response ) );
	 * ```
	 *
	 * @param {Blob|String} fileOrData A blob object or a data string encoded with Base64.
	 * @returns {module:cloud-services/uploadgateway/fileuploader~FileUploader} Returns `FileUploader` instance.
	 */
	public upload( fileOrData: string | Blob ): FileUploader {
		return new FileUploader( fileOrData, this._token, this._apiAddress );
	}
}
