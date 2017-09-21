/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

import FileUploader from '../../src/uploadgateway/fileuploader';
import UploadGateway from '../../src/uploadgateway/uploadgateway';

describe( 'UploadGateway', () => {
	describe( 'constructor()', () => {
		it( 'should throw error when no token provided', () => {
			expect( () => new UploadGateway( undefined, 'test' ) ).to.throw( 'Token must be provided' );
		} );

		it( 'should throw error when no apiAddress provided', () => {
			expect( () => new UploadGateway( 'token' ) ).to.throw( 'Api address must be provided' );
		} );
	} );

	describe( 'upload()', () => {
		it( 'should return `FileUploader` instance', () => {
			const uploader = new UploadGateway( 'token', 'test' );

			expect( uploader.upload( 'file' ) ).to.be.instanceOf( FileUploader );
		} );
	} );
} );
