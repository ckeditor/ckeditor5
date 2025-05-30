/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import FileUploader from '../../src/uploadgateway/fileuploader.js';
import UploadGateway from '../../src/uploadgateway/uploadgateway.js';
import Token from '../../src/token/token.js';
import { expectToThrowCKEditorError } from '@ckeditor/ckeditor5-utils/tests/_utils/utils.js';

describe( 'UploadGateway', () => {
	let token;

	beforeEach( () => {
		const tokenInitValue = `header.${ btoa( JSON.stringify( { exp: Date.now() + 3600000 } ) ) }.signature`;

		token = new Token( 'url', { initValue: tokenInitValue, autoRefresh: false } );
	} );

	afterEach( () => {
		token.destroy();
	} );

	describe( 'constructor()', () => {
		it( 'should throw error when no token provided', () => {
			expectToThrowCKEditorError( () => new UploadGateway( undefined, 'test' ), 'uploadgateway-missing-token' );
		} );

		it( 'should throw error when no apiAddress provided', () => {
			expectToThrowCKEditorError( () => new UploadGateway( token ), 'uploadgateway-missing-api-address' );
		} );
	} );

	describe( 'upload()', () => {
		it( 'should return `FileUploader` instance', () => {
			const uploader = new UploadGateway( token, 'test' );

			expect( uploader.upload( 'file' ) ).to.be.instanceOf( FileUploader );
		} );
	} );
} );
