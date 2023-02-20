/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals console, window, setTimeout */

import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor';

import EasyImage from '../src/easyimage';
import CloudServicesUploadAdapter from '../src/cloudservicesuploadadapter';
import { Image, ImageUpload } from '@ckeditor/ckeditor5-image';
import Clipboard from '@ckeditor/ckeditor5-clipboard/src/clipboard';

import UploadGatewayMock from './_utils/uploadgatewaymock';
import { createNativeFileMock } from '@ckeditor/ckeditor5-upload/tests/_utils/mocks';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';

import CloudServices from '@ckeditor/ckeditor5-cloud-services/src/cloudservices';
import TokenMock from '@ckeditor/ckeditor5-cloud-services/tests/_utils/tokenmock';
import CloudServicesCore from '@ckeditor/ckeditor5-cloud-services/src/cloudservicescore';

import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils';

// EasyImage requires the `CloudServicesCore` plugin as a soft-requirement.
// In order to mock the `Token` class, we create a new class that extend the `CloudServicesCore` plugin
// and override the `#createToken()` method which creates an instance of the `Token` class.
class CloudServicesCoreMock extends CloudServicesCore {
	createToken( tokenUrlOrRefreshToken ) {
		return new TokenMock( tokenUrlOrRefreshToken );
	}

	createUploadGateway( token, apiAddress ) {
		return new UploadGatewayMock( token, apiAddress );
	}
}

describe( 'EasyImage', () => {
	testUtils.createSinonSandbox();

	it( 'should require other plugins', () => {
		expect( EasyImage.requires ).to.include( CloudServicesUploadAdapter );
	} );

	it( 'should require ImageUpload by name', () => {
		expect( EasyImage.requires ).to.include( 'ImageUpload' );
	} );

	it( 'should be able to initialize editor with itself', () => {
		const div = window.document.createElement( 'div' );
		window.document.body.appendChild( div );

		return ClassicTestEditor
			.create( div, {
				plugins: [ Clipboard, Image, ImageUpload, CloudServices, EasyImage ],
				substitutePlugins: [ CloudServicesCoreMock ],
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

	it( 'should warn if there is no image feature loaded in the editor', async () => {
		const stub = testUtils.sinon.stub( console, 'warn' );
		const div = window.document.createElement( 'div' );

		window.document.body.appendChild( div );

		const editor = await ClassicTestEditor.create( div, {
			plugins: [ Clipboard, ImageUpload, CloudServices, EasyImage ],
			substitutePlugins: [ CloudServicesCoreMock ],
			cloudServices: {
				tokenUrl: 'abc',
				uploadUrl: 'def'
			}
		} );

		sinon.assert.calledOnceWithExactly( stub, 'easy-image-image-feature-missing', editor, sinon.match.string );

		window.document.body.removeChild( div );

		await editor.destroy();
	} );

	describe( 'integration tests', () => {
		let div;

		before( () => {
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
					plugins: [ Clipboard, Image, ImageUpload, CloudServices, Paragraph, EasyImage ],
					substitutePlugins: [ CloudServicesCoreMock ],
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

						editor.execute( 'uploadImage', { file: createNativeFileMock() } );

						setTimeout( () => {
							upload._uploadGateway.resolveLastUpload();
						} );
					} );
				} );
		} );
	} );
} );
