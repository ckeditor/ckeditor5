/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals window, setTimeout */

import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor';

import EasyImage from '../src/easyimage';
import CloudServicesUploadAdapter from '../src/cloudservicesuploadadapter';
import Image from '@ckeditor/ckeditor5-image/src/image';
import ImageUpload from '@ckeditor/ckeditor5-image/src/imageupload';
import Clipboard from '@ckeditor/ckeditor5-clipboard/src/clipboard';

import UploadGatewayMock from './_utils/uploadgatewaymock';
import { createNativeFileMock } from '@ckeditor/ckeditor5-upload/tests/_utils/mocks';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';

import CloudServices from '@ckeditor/ckeditor5-cloud-services/src/cloudservices';
import TokenMock from '@ckeditor/ckeditor5-cloud-services/tests/_utils/tokenmock';

const Token = CloudServices.Token;

describe( 'EasyImage', () => {
	before( () => {
		CloudServices.Token = TokenMock;
	} );

	after( () => {
		CloudServices.Token = Token;
	} );

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
				plugins: [ Clipboard, EasyImage ],
				cloudServices: {
					tokenUrl: 'abc',
					uploadUrl: 'def'
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
		let div;

		before( () => {
			// Mock uploader.
			CloudServicesUploadAdapter._UploadGateway = UploadGatewayMock;
			sinon.stub( window, 'FileReader' ).callsFake( () => {
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
		} );

		beforeEach( () => {
			div = window.document.createElement( 'div' );
			window.document.body.appendChild( div );
		} );

		afterEach( () => {
			window.document.body.removeChild( div );
			sinon.restore();
		} );

		it( 'should enable easy image uploading', () => {
			return ClassicTestEditor
				.create( div, {
					plugins: [
						Clipboard, Paragraph, EasyImage
					],
					cloudServices: {
						tokenUrl: 'abc',
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

						editor.model.document.on( 'change', () => {
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
