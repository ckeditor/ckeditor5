/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

import FileUploader from '../../src/uploadgateway/fileuploader';
import UploadGateway from '../../src/uploadgateway/uploadgateway';
import Token from '../../src/token/token';
import CKEditorError from '@ckeditor/ckeditor5-utils/src/ckeditorerror';

describe( 'UploadGateway', () => {
	const token = new Token( 'url', { initValue: 'token', autoRefresh: false } );

	describe( 'constructor()', () => {
		it( 'should throw error when no token provided', () => {
			expect( () => new UploadGateway( undefined, 'test' ) ).to.throw( CKEditorError, 'uploadgateway-missing-token' );
		} );

		it( 'should throw error when no apiAddress provided', () => {
			expect( () => new UploadGateway( token ) ).to.throw( CKEditorError, 'uploadgateway-missing-api-address' );
		} );
	} );

	describe( 'upload()', () => {
		it( 'should return `FileUploader` instance', () => {
			const uploader = new UploadGateway( token, 'test' );

			expect( uploader.upload( 'file' ) ).to.be.instanceOf( FileUploader );
		} );
	} );
} );
