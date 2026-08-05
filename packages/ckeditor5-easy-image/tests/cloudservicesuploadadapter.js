/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ClassicTestEditor } from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor.js';
import { CloudServicesUploadAdapter } from '../src/cloudservicesuploadadapter.js';
import { FileRepository } from '@ckeditor/ckeditor5-upload';
import { CloudServices, CloudServicesCore } from '@ckeditor/ckeditor5-cloud-services';

import { UploadGatewayMock } from './_utils/uploadgatewaymock.js';
import { createNativeFileMock } from '@ckeditor/ckeditor5-upload/tests/_utils/mocks.js';
import { TokenMock } from '@ckeditor/ckeditor5-cloud-services/tests/_utils/tokenmock.js';
import { mockCreateToken } from '@ckeditor/ckeditor5-cloud-services/tests/_utils/mockcloudservicescoretoken.js';

describe( 'CloudServicesUploadAdapter', () => {
	let div;

	beforeEach( () => {
		// EasyImage requires the `CloudServicesCore` plugin as a dependency.
		// In order to mock the `Token` and `UploadGateway` classes, we stub the factory methods of the `CloudServicesCore` plugin.
		mockCreateToken();
		vi.spyOn( CloudServicesCore.prototype, 'createUploadGateway' )
			.mockImplementation( ( token, apiAddress ) => new UploadGatewayMock( token, apiAddress ) );

		div = window.document.createElement( 'div' );
		window.document.body.appendChild( div );
	} );

	afterEach( () => {
		window.document.body.removeChild( div );
	} );

	it( 'should have `isOfficialPlugin` static flag set to `true`', () => {
		expect( CloudServicesUploadAdapter.isOfficialPlugin ).toBe( true );
	} );

	it( 'should have `isPremiumPlugin` static flag set to `false`', () => {
		expect( CloudServicesUploadAdapter.isPremiumPlugin ).toBe( false );
	} );

	describe( 'init()', () => {
		it( 'should set loader', () => {
			UploadGatewayMock.lastToken = undefined;
			TokenMock.initialToken = 'token';

			return ClassicTestEditor
				.create( div, {
					plugins: [ CloudServices, CloudServicesUploadAdapter ],
					cloudServices: {
						tokenUrl: 'abc',
						uploadUrl: 'http://upload.mock.url/'
					}
				} )
				.then( editor => {
					expect( UploadGatewayMock.lastUploadUrl ).toBe( 'http://upload.mock.url/' );

					return editor.destroy();
				} );
		} );

		it( 'should not set loader if there is no token', () => {
			UploadGatewayMock.lastToken = undefined;

			return ClassicTestEditor
				.create( div, {
					plugins: [ CloudServices, CloudServicesUploadAdapter ]
				} )
				.then( editor => {
					expect( UploadGatewayMock.lastToken ).toBeUndefined();

					return editor.destroy();
				} );
		} );
	} );

	describe( 'Adapter', () => {
		let editor, fileRepository, upload;

		beforeEach( () => {
			return ClassicTestEditor.create( div, {
				plugins: [ CloudServices, CloudServicesUploadAdapter ],
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
			it( 'should mock upload', () => {
				return new Promise( ( resolve, reject ) => {
					const loader = fileRepository.createLoader( createNativeFileMock() );

					loader.upload()
						.then( response => {
							expect( response.default ).toBe( 'http://image.mock.url/' );
							resolve();
						} )
						.catch( err => reject( err ) );

					// Wait for the promise from the mock.getUploader().
					setTimeout( () => {
						upload._uploadGateway.resolveLastUpload();
					} );
				} );
			} );

			it( 'should update the progress', () => {
				return new Promise( resolve => {
					const loader = fileRepository.createLoader( createNativeFileMock() );
					loader.upload();

					// Wait for the `loader.file` promise.
					setTimeout( () => {
						upload._uploadGateway.lastFileUploader.fire( 'progress', { uploaded: 50, total: 100 } );

						expect( loader.uploaded ).toBe( 50 );
						expect( loader.uploadTotal ).toBe( 100 );

						resolve();
					} );
				} );
			} );
		} );

		describe( 'abort()', () => {
			it( 'should not call abort on the non-existing CSS uploader (`loader.file` not resolved)', () => {
				const loader = fileRepository.createLoader( createNativeFileMock() );

				expect( () => {
					loader.upload().catch( () => {} );
					loader.abort();
				} ).not.toThrow();

				expect( upload._uploadGateway.lastFileUploader ).toBeUndefined();
			} );

			it( 'should call abort on the CSS uploader (`loader.file` resolved)', () => {
				return new Promise( resolve => {
					const loader = fileRepository.createLoader( createNativeFileMock() );

					loader.upload().catch( () => {} );

					// Wait for the `loader.file` promise.
					setTimeout( () => {
						loader.abort();

						expect( upload._uploadGateway.lastFileUploader.aborted ).toBe( true );

						resolve();
					} );
				} );
			} );
		} );
	} );
} );
