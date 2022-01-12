/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* eslint-env browser */

import FileUploader from '../../src/uploadgateway/fileuploader';
import UploadGateway from '../../src/uploadgateway/uploadgateway';
import Token from '../../src/token/token';
import { expectToThrowCKEditorError } from '@ckeditor/ckeditor5-utils/tests/_utils/utils';

describe( 'UploadGateway', () => {
	const tokenInitValue = `header.${ btoa( JSON.stringify( { exp: Date.now() + 3600000 } ) ) }.signature`;
	const token = new Token( 'url', { initValue: tokenInitValue, autoRefresh: false } );

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
