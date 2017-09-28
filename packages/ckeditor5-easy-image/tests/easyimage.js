/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* globals window, setTimeout */

import EasyImage from '../src/easyimage';
import CloudServicesUploadAdapter from '../src/cloudservicesuploadadapter';
import Image from '@ckeditor/ckeditor5-image/src/image';
import ImageUpload from '@ckeditor/ckeditor5-upload/src/imageupload';
import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor';
import UploadGatewayMock from './_utils/uploadgatewaymock';
import { createNativeFileMock } from '@ckeditor/ckeditor5-upload/tests/_utils/mocks';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';

describe( 'EasyImage', () => {
	it( 'should require other plugins', () => {
		const plugins = EasyImage.requires;

		expect( plugins ).to.include( CloudServicesUploadAdapter );
		expect( plugins ).to.include( Image );
		expect( plugins ).to.include( ImageUpload );
	} );

	it( 'should be able to initialize editor with itself', () => {
		const div = window.document.createElement( 'div' );
		window.document.body.appendChild( div );

		return ClassicTestEditor
			.create( div, {
				plugins: [ EasyImage ],
				cloudServices: {
					token: 'foo'
				}
			} )
			.then( editor => {
				const easyImage = editor.plugins.get( EasyImage );
				expect( easyImage ).to.be.an.instanceOf( EasyImage );

				window.document.body.removeChild( div );

				return editor.destroy();
			} );
	} );

	describe( 'integration tests', () => {
		const CSUploader = CloudServicesUploadAdapter._UploadGateway;
		const sandbox = sinon.sandbox.create();
		let div;

		before( () => {
			// Mock uploader.
			CloudServicesUploadAdapter._UploadGateway = UploadGatewayMock;
			sandbox.stub( window, 'FileReader' ).callsFake( () => {
				const reader = {
					readAsDataURL: () => {
						reader.result = 'http://some-fake-url.jpg';
						reader.onload();
					}
				};

				return reader;
			} );
		} );

		after( () => {
			// Restore original uploader.
			CloudServicesUploadAdapter._UploadGateway = CSUploader;
			sandbox.restore();
		} );

		beforeEach( () => {
			div = window.document.createElement( 'div' );
			window.document.body.appendChild( div );
		} );

		afterEach( () => {
			window.document.body.removeChild( div );
		} );

		it( 'should enable easy image uploading', () => {
			return ClassicTestEditor
				.create( div, {
					plugins: [
						Paragraph, EasyImage
					],
					cloudServices: {
						token: 'abc',
						uploadUrl: 'http://upload.mock.url/'
					}
				} )
				.then( editor => {
					const notification = editor.plugins.get( 'Notification' );
					const upload = editor.plugins.get( CloudServicesUploadAdapter );

					return new Promise( ( resolve, reject ) => {
						notification.on( 'show:warning', ( evt, data ) => {
							reject( new Error( data.title ) );
						} );

						editor.document.on( 'change', () => {
							// Check whether the image is uploaded and the image's src is replaced correctly.
							if ( editor.getData() === '<figure class="image"><img src="http://image.mock.url/"></figure>' ) {
								editor.destroy().then( resolve );
							}
						} );

						editor.execute( 'imageUpload', { file: createNativeFileMock() } );

						setTimeout( () => {
							upload._uploadGateway.resolveLastUpload();
						} );
					} );
				} );
		} );
	} );
} );
