/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* globals window, setTimeout */

import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor';
import CloudServicesUploadAdapter from '../src/cloudservicesuploadadapter';
import FileRepository from '@ckeditor/ckeditor5-upload/src/filerepository';
import CloudServices from '@ckeditor/ckeditor5-cloudservices/src/cloudservices';

import UploadGatewayMock from './_utils/uploadgatewaymock';
import { createNativeFileMock } from '@ckeditor/ckeditor5-upload/tests/_utils/mocks';
import TokenMock from '@ckeditor/ckeditor5-cloudservices/tests/_utils/tokenmock';

// Store original uploader.
const CSUploader = CloudServicesUploadAdapter._UploadGateway;
const Token = CloudServices.Token;

describe( 'CloudServicesUploadAdapter', () => {
	let div;

	before( () => {
		CloudServices.Token = TokenMock;
		CloudServicesUploadAdapter._UploadGateway = UploadGatewayMock;
	} );

	after( () => {
		CloudServices.Token = Token;
		CloudServicesUploadAdapter._UploadGateway = CSUploader;
	} );

	beforeEach( () => {
		div = window.document.createElement( 'div' );
		window.document.body.appendChild( div );
	} );

	afterEach( () => {
		window.document.body.removeChild( div );
	} );

	describe( 'init()', () => {
		it( 'should set loader', () => {
			UploadGatewayMock.lastToken = undefined;
			TokenMock.initialToken = 'token';

			return ClassicTestEditor
				.create( div, {
					plugins: [ CloudServicesUploadAdapter ],
					cloudServices: {
						tokenUrl: 'abc',
						uploadUrl: 'http://upload.mock.url/'
					}
				} )
				.then( editor => {
					expect( UploadGatewayMock.lastUploadUrl ).to.equal( 'http://upload.mock.url/' );

					return editor.destroy();
				} );
		} );

		it( 'should set the default uploadUrl', () => {
			const expectedDefaultUrl = 'https://files.cke-cs.com/upload/';

			return ClassicTestEditor
				.create( div, {
					plugins: [ CloudServicesUploadAdapter ],
					cloudServices: {
						tokenUrl: 'abc'
					}
				} )
				.then( editor => {
					expect( UploadGatewayMock.lastUploadUrl ).to.equal( expectedDefaultUrl );

					return editor.destroy();
				} );
		} );
	} );

	describe( 'Adapter', () => {
		let editor, fileRepository, upload;

		beforeEach( () => {
			return ClassicTestEditor.create( div, {
				plugins: [ CloudServicesUploadAdapter ],
				cloudServices: {
					tokenUrl: 'abc',
					uploadUrl: 'http://upload.mock.url/'
				}
			} ).then( _editor => {
				editor = _editor;
				fileRepository = editor.plugins.get( FileRepository );
				upload = editor.plugins.get( CloudServicesUploadAdapter );
			} );
		} );

		afterEach( () => {
			return editor.destroy();
		} );

		describe( 'upload()', () => {
			it( 'should mock upload', done => {
				const loader = fileRepository.createLoader( createNativeFileMock() );

				loader.upload()
					.then( response => {
						expect( response.default ).to.equal( 'http://image.mock.url/' );
						done();
					} )
					.catch( err => done( err ) );

				// Wait for the promise from the mock.getUploader()
				setTimeout( () => {
					upload._uploadGateway.resolveLastUpload();
				} );
			} );

			it( 'should update the progress', () => {
				const loader = fileRepository.createLoader( createNativeFileMock() );
				loader.upload();

				upload._uploadGateway.lastFileUploader.fire( 'progress', { uploaded: 50, total: 100 } );

				// expect( loader.uploaded ).to.equal( 50 );
				expect( loader.uploadTotal ).to.equal( 100 );
			} );
		} );

		describe( 'abort()', () => {
			it( 'should call abort on the CSS uploader', () => {
				const loader = fileRepository.createLoader( createNativeFileMock() );

				loader.upload();

				loader.abort();

				expect( upload._uploadGateway.lastFileUploader.aborted ).to.be.true;
			} );
		} );
	} );
} );
