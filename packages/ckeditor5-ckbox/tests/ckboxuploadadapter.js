/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import { ClassicTestEditor } from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor.js';
import { Clipboard } from '@ckeditor/ckeditor5-clipboard';
import { CloudServices } from '@ckeditor/ckeditor5-cloud-services';
import { Image, ImageUploadEditing, ImageUploadProgress, PictureEditing } from '@ckeditor/ckeditor5-image';
import { LinkEditing } from '@ckeditor/ckeditor5-link';
import { Paragraph } from '@ckeditor/ckeditor5-paragraph';
import { FileRepository } from '@ckeditor/ckeditor5-upload';
import { Plugin } from '@ckeditor/ckeditor5-core';
import { CKBoxEditing } from '../src/ckboxediting.js';
import { CKBoxUploadAdapter } from '../src/ckboxuploadadapter.js';

import { createNativeFileMock, NativeFileReaderMock, UploadAdapterMock } from '@ckeditor/ckeditor5-upload/tests/_utils/mocks.js';
import { createFakeXHRServer } from '@ckeditor/ckeditor5-core/tests/_utils/fakexhrserver.js';
import { TokenMock } from '@ckeditor/ckeditor5-cloud-services/tests/_utils/tokenmock.js';

import { CloudServicesCoreMock } from './_utils/cloudservicescoremock.js';

import { _getModelData } from '@ckeditor/ckeditor5-engine';
import { CKBoxUtils } from '../src/ckboxutils.js';

const BASE64_SAMPLE = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=';
const CKBOX_API_URL = 'https://upload.example.com';

describe( 'CKBoxUploadAdapter', () => {
	let editor, fileRepository, editorElement;

	const jwtToken = createToken( { auth: { ckbox: { workspaces: [ 'workspace1' ] } } } );

	beforeEach( () => {
		editorElement = document.createElement( 'div' );
		document.body.appendChild( editorElement );

		TokenMock.initialToken = jwtToken;

		// `CKBoxEditing#init()` fires an unawaited upload permission request. Stub the network layer out so
		// the request does not end up as an unhandled rejection that fails the Vitest run. Tests exercising
		// uploads replace `window.XMLHttpRequest` with a fake server, so they are not affected.
		vi.spyOn( window.XMLHttpRequest.prototype, 'send' ).mockImplementation( () => {} );
		vi.spyOn( CKBoxUtils.prototype, '_authorizePrivateCategoriesAccess' ).mockResolvedValue();

		return ClassicTestEditor
			.create( editorElement, {
				plugins: [
					Clipboard,
					Paragraph,
					LinkEditing,
					Image,
					PictureEditing,
					ImageUploadEditing,
					ImageUploadProgress,
					CloudServices,
					CKBoxEditing,
					CKBoxUploadAdapter
				],
				substitutePlugins: [
					CloudServicesCoreMock
				],
				ckbox: {
					serviceOrigin: CKBOX_API_URL,
					tokenUrl: 'http://example.com'
				}
			} )
			.then( newEditor => {
				editor = newEditor;
				fileRepository = editor.plugins.get( FileRepository );
			} );
	} );

	afterEach( () => {
		if ( editorElement ) {
			editorElement.remove();
		}

		if ( editor ) {
			return editor.destroy();
		}
	} );

	it( 'should be named', () => {
		expect( CKBoxUploadAdapter.pluginName ).toBe( 'CKBoxUploadAdapter' );
	} );

	it( 'should have `isOfficialPlugin` static flag set to `true`', () => {
		expect( CKBoxUploadAdapter.isOfficialPlugin ).toBe( true );
	} );

	it( 'should have `isPremiumPlugin` static flag set to `false`', () => {
		expect( CKBoxUploadAdapter.isPremiumPlugin ).toBe( false );
	} );

	it( 'should require its dependencies', () => {
		expect( CKBoxUploadAdapter.requires ).toEqual( [
			ImageUploadEditing, ImageUploadProgress, FileRepository, CKBoxEditing
		] );
	} );

	it( 'should be loaded', () => {
		expect( editor.plugins.get( CKBoxUploadAdapter ) ).toBeInstanceOf( CKBoxUploadAdapter );
	} );

	describe( 'initialization', () => {
		function uploadAdapterCreator() {}

		class OtherUploadAdapter extends Plugin {
			static get requires() {
				return [ FileRepository ];
			}

			async init() {
				this.editor.plugins.get( FileRepository ).createUploadAdapter = uploadAdapterCreator;
			}
		}

		it( 'should not overwrite existing upload adapter if CKBox lib and `config.ckbox` are missing', async () => {
			const editorElement = document.createElement( 'div' );
			document.body.appendChild( editorElement );

			const editor = await ClassicTestEditor
				.create( editorElement, {
					plugins: [
						OtherUploadAdapter,
						LinkEditing,
						Image,
						PictureEditing,
						ImageUploadEditing,
						ImageUploadProgress,
						CloudServices,
						CKBoxEditing,
						CKBoxUploadAdapter
					],
					substitutePlugins: [
						CloudServicesCoreMock
					]
				} );

			const fileRepositoryPlugin = editor.plugins.get( FileRepository );

			expect( fileRepositoryPlugin.createUploadAdapter ).toBe( uploadAdapterCreator );

			editorElement.remove();
			return editor.destroy();
		} );

		it( 'should overwrite existing upload adapter if `config.ckbox` is set', async () => {
			const editorElement = document.createElement( 'div' );
			document.body.appendChild( editorElement );

			const editor = await ClassicTestEditor
				.create( editorElement, {
					plugins: [
						OtherUploadAdapter,
						LinkEditing,
						Image,
						PictureEditing,
						ImageUploadEditing,
						ImageUploadProgress,
						CloudServices,
						CKBoxEditing,
						CKBoxUploadAdapter
					],
					substitutePlugins: [
						CloudServicesCoreMock
					],
					ckbox: {
						tokenUrl: 'http://example.com'
					}
				} );

			const fileRepositoryPlugin = editor.plugins.get( FileRepository );

			expect( fileRepositoryPlugin.createUploadAdapter ).toBeInstanceOf( Function );
			expect( fileRepositoryPlugin.createUploadAdapter ).not.toBe( uploadAdapterCreator );

			editorElement.remove();
			return editor.destroy();
		} );

		it( 'should overwrite existing adapter if CKBox lib is loaded and tokenUrl is taken from cloudServices.tokenUrl', async () => {
			const originalCKBox = window.CKBox;
			window.CKBox = {};

			const editorElement = document.createElement( 'div' );
			document.body.appendChild( editorElement );

			const editor = await ClassicTestEditor
				.create( editorElement, {
					plugins: [
						OtherUploadAdapter,
						LinkEditing,
						Image,
						PictureEditing,
						ImageUploadEditing,
						ImageUploadProgress,
						CloudServices,
						CKBoxEditing,
						CKBoxUploadAdapter
					],
					substitutePlugins: [
						CloudServicesCoreMock
					],
					cloudServices: {
						tokenUrl: 'http://cs.example.com'
					}
				} );

			const fileRepositoryPlugin = editor.plugins.get( FileRepository );

			expect( fileRepositoryPlugin.createUploadAdapter ).toBeInstanceOf( Function );
			expect( fileRepositoryPlugin.createUploadAdapter ).not.toBe( uploadAdapterCreator );

			window.CKBox = originalCKBox;
			editorElement.remove();
			return editor.destroy();
		} );
	} );

	describe( 'Adapter', () => {
		let adapter, file, loader, fakeXHRServer, ckboxUtils;

		beforeEach( () => {
			file = createNativeFileMock();
			file.name = 'image.jpg';

			loader = fileRepository.createLoader( file );
			adapter = editor.plugins.get( FileRepository ).createUploadAdapter( loader );
			ckboxUtils = editor.plugins.get( CKBoxUtils );

			fakeXHRServer = createFakeXHRServer();
		} );

		afterEach( () => {
			fakeXHRServer.restore();
		} );

		it( 'crateAdapter method should be registered and have upload and abort methods', () => {
			expect( adapter ).not.toBeUndefined();
			expect( adapter.upload ).toBeInstanceOf( Function );
			expect( adapter.abort ).toBeInstanceOf( Function );
		} );

		it( 'should abort the upload if cannot determine a category due to network error', () => {
			vi.spyOn( console, 'error' ).mockImplementation( () => {} );

			fakeXHRServer.respondWith( 'GET', CKBOX_API_URL + '/categories?limit=50&offset=0&workspaceId=workspace1', xhr => {
				expect( xhr.requestHeaders ).toBeInstanceOf( Object );
				expect( xhr.requestHeaders ).toHaveProperty( 'Authorization', jwtToken );
				expect( xhr.requestHeaders ).toHaveProperty( 'CKBox-Version', 'CKEditor 5' );

				return xhr.error();
			} );

			return adapter.upload()
				.then( () => {
					throw new Error( 'Expected to be rejected.' );
				}, error => {
					expect( console.error ).toHaveBeenCalledTimes( 1 );
					expect( console.error.mock.calls[ 0 ][ 0 ] ).toMatch( /^ckbox-fetch-category-http-error/ );

					expect( error ).toBe( 'Cannot determine a category for the uploaded file.' );
				} );
		} );

		it( 'should abort the upload if fetching available categories ended with the authorization error', () => {
			vi.spyOn( console, 'error' ).mockImplementation( () => {} );

			fakeXHRServer.respondWith( 'GET', CKBOX_API_URL + '/categories?limit=50&offset=0&workspaceId=workspace1', [
				401,
				{ 'Content-Type': 'application/json' },
				JSON.stringify( { message: 'Invalid token.', statusCode: 401 } )
			] );

			return adapter.upload()
				.then( () => {
					throw new Error( 'Expected to be rejected.' );
				}, error => {
					expect( console.error ).toHaveBeenCalledTimes( 1 );
					expect( console.error.mock.calls[ 0 ][ 0 ] ).toMatch( /^ckbox-fetch-category-http-error/ );

					expect( fakeXHRServer.requests[ 0 ].requestHeaders ).toBeInstanceOf( Object );
					expect( fakeXHRServer.requests[ 0 ].requestHeaders ).toHaveProperty( 'Authorization', jwtToken );
					expect( fakeXHRServer.requests[ 0 ].requestHeaders ).toHaveProperty( 'CKBox-Version', 'CKEditor 5' );
					expect( error ).toBe( 'Cannot determine a category for the uploaded file.' );
				} );
		} );

		it( 'should abort the upload if a list of available categories is empty', () => {
			fakeXHRServer.respondWith( 'GET', CKBOX_API_URL + '/categories?limit=50&offset=0&workspaceId=workspace1', [
				200,
				{ 'Content-Type': 'application/json' },
				JSON.stringify( { items: [], offset: 0, limit: 50, totalCount: 0 } )
			] );

			return adapter.upload()
				.then( () => {
					throw new Error( 'Expected to be rejected.' );
				}, err => {
					expect( fakeXHRServer.requests[ 0 ].requestHeaders ).toBeInstanceOf( Object );
					expect( fakeXHRServer.requests[ 0 ].requestHeaders ).toHaveProperty( 'Authorization', jwtToken );
					expect( fakeXHRServer.requests[ 0 ].requestHeaders ).toHaveProperty( 'CKBox-Version', 'CKEditor 5' );
					expect( err ).toBe( 'Cannot determine a category for the uploaded file.' );
				} );
		} );

		it( 'should abort the upload if any category does not accept a jpg file', () => {
			fakeXHRServer.respondWith( 'GET', CKBOX_API_URL + '/categories?limit=50&offset=0&workspaceId=workspace1', [
				200,
				{ 'Content-Type': 'application/json' },
				JSON.stringify( {
					items: [
						{ name: 'category 1', extensions: [ 'png' ] },
						{ name: 'category 2', extensions: [ 'webp' ] },
						{ name: 'category 3', extensions: [ 'gif' ] }
					], offset: 0, limit: 50, totalCount: 3
				} )
			] );

			return adapter.upload()
				.then( () => {
					throw new Error( 'Expected to be rejected.' );
				}, err => {
					expect( err ).toBe( 'Cannot determine a category for the uploaded file.' );
				} );
		} );

		it( 'should abort the upload if the provided configuration uses a non-existing category', () => {
			fakeXHRServer.respondWith( 'GET', CKBOX_API_URL + '/categories?limit=50&offset=0&workspaceId=workspace1', [
				200,
				{ 'Content-Type': 'application/json' },
				JSON.stringify( {
					items: [
						{ name: 'category 1', id: 'id-category-1', extensions: [ 'png', 'jpg' ] },
						{ name: 'category 2', id: 'id-category-2', extensions: [ 'webp' ] },
						{ name: 'category 3', id: 'id-category-3', extensions: [ 'gif' ] }
					], offset: 0, limit: 50, totalCount: 3
				} )
			] );

			// An integrator uses a category that does not exist.
			editor.config.set( 'ckbox.defaultUploadCategories', {
				'Category that does not exist': [ 'jpg' ]
			} );

			return adapter.upload()
				.then( () => {
					throw new Error( 'Expected to be rejected.' );
				}, err => {
					expect( err ).toBe( 'Cannot determine a category for the uploaded file.' );
				} );
		} );

		it( 'should fetch all categories if API limits their results', () => {
			fakeXHRServer.respondWith( 'GET', CKBOX_API_URL + '/categories?limit=50&offset=0&workspaceId=workspace1', [
				200,
				{ 'Content-Type': 'application/json' },
				JSON.stringify( {
					items: [], offset: 0, limit: 50, totalCount: 101
				} )
			] );
			fakeXHRServer.respondWith( 'GET', CKBOX_API_URL + '/categories?limit=50&offset=50&workspaceId=workspace1', [
				200, { 'Content-Type': 'application/json' },
				JSON.stringify( {
					items: [], offset: 50, limit: 50, totalCount: 101
				} )
			] );
			fakeXHRServer.respondWith( 'GET', CKBOX_API_URL + '/categories?limit=50&offset=100&workspaceId=workspace1', [
				200,
				{ 'Content-Type': 'application/json' },
				JSON.stringify( {
					items: [], offset: 100, limit: 50, totalCount: 101
				} )
			] );

			return adapter.upload()
				.catch( () => {
					expect( fakeXHRServer.requests ).toHaveLength( 3 );
					expect( fakeXHRServer.requests[ 0 ].requestHeaders ).toBeInstanceOf( Object );
					expect( fakeXHRServer.requests[ 0 ].requestHeaders ).toHaveProperty( 'Authorization', jwtToken );
					expect( fakeXHRServer.requests[ 0 ].requestHeaders ).toHaveProperty( 'CKBox-Version', 'CKEditor 5' );
					expect( fakeXHRServer.requests[ 1 ].requestHeaders ).toBeInstanceOf( Object );
					expect( fakeXHRServer.requests[ 1 ].requestHeaders ).toHaveProperty( 'Authorization', jwtToken );
					expect( fakeXHRServer.requests[ 1 ].requestHeaders ).toHaveProperty( 'CKBox-Version', 'CKEditor 5' );
					expect( fakeXHRServer.requests[ 2 ].requestHeaders ).toBeInstanceOf( Object );
					expect( fakeXHRServer.requests[ 2 ].requestHeaders ).toHaveProperty( 'Authorization', jwtToken );
					expect( fakeXHRServer.requests[ 2 ].requestHeaders ).toHaveProperty( 'CKBox-Version', 'CKEditor 5' );
				} );
		} );

		it( 'should abort if the provided configuration is not in sync with server', () => {
			fakeXHRServer.respondWith( 'GET', CKBOX_API_URL + '/categories?limit=50&offset=0&workspaceId=workspace1', [
				200,
				{ 'Content-Type': 'application/json' },
				JSON.stringify( {
					items: [
						{ name: 'category 1', id: 'id-category-1', extensions: [ 'png' ] },
						{ name: 'category 2', id: 'id-category-2', extensions: [ 'webp', 'jpg' ] },
						{ name: 'category 3', id: 'id-category-3', extensions: [ 'gif' ] } // Does not accept "jpg".
					], offset: 0, limit: 50, totalCount: 3
				} )
			] );

			fakeXHRServer.respondWith( 'POST', CKBOX_API_URL + '/assets&workspaceId=workspace1', [
				400,
				{ 'Content-Type': 'application/json' },
				JSON.stringify( {
					message: 'Extension is not allowed in this category.',
					traceId: '3532cade-4ce5-40ae-a48f-7558ab64e19f',
					statusCode: 400
				} )
			] );

			// An integrator didn't align the CKBox configuration with the categories.
			editor.config.set( 'ckbox.defaultUploadCategories', {
				'id-category-3': [ 'gif', 'jpg' ]
			} );

			vi.spyOn( console, 'warn' ).mockImplementation( () => {} );

			return adapter.upload()
				.then( () => {
					throw new Error( 'Expected to be rejected.' );
				}, err => {
					expect( err ).toBe( 'Cannot upload file: image.jpg.' );
				} );
		} );

		it( 'should abort the upload if server results with an error while sending an image', () => {
			fakeXHRServer.respondWith( 'GET', CKBOX_API_URL + '/categories?limit=50&offset=0&workspaceId=workspace1', [
				200,
				{ 'Content-Type': 'application/json' },
				JSON.stringify( {
					items: [
						{ name: 'category 1', id: 'id-category-1', extensions: [ 'webp', 'jpg' ] }
					], offset: 0, limit: 50, totalCount: 1
				} )
			] );

			fakeXHRServer.respondWith( 'POST', CKBOX_API_URL + '/assets?workspaceId=workspace1', [
				401,
				{ 'Content-Type': 'application/json' },
				JSON.stringify( {
					message: 'Invalid token.',
					statusCode: 401
				} )
			] );

			return adapter.upload()
				.then( () => {
					throw new Error( 'Expected to be rejected.' );
				}, err => {
					expect( err ).toBe( 'Cannot upload file: image.jpg.' );
				} );
		} );

		it( 'should take the first category if many of them accepts a jpg file', () => {
			fakeXHRServer.respondWith( 'GET', CKBOX_API_URL + '/categories?limit=50&offset=0&workspaceId=workspace1', [
				200,
				{ 'Content-Type': 'application/json' },
				JSON.stringify( {
					items: [
						{ name: 'category 1', id: 'id-category-1', extensions: [ 'png' ] },
						{ name: 'category 2', id: 'id-category-2', extensions: [ 'webp', 'jpg' ] },
						{ name: 'category 3', id: 'id-category-3', extensions: [ 'gif', 'jpg' ] }
					], offset: 0, limit: 50, totalCount: 3
				} )
			] );

			fakeXHRServer.respondWith( 'POST', CKBOX_API_URL + '/assets?workspaceId=workspace1', [
				201,
				{ 'Content-Type': 'application/json' },
				JSON.stringify( {
					id: 'image-1',
					imageUrls: {
						100: 'https://ckbox.cloud/workspace1/assets/image-1/images/100.webp',
						default: 'https://ckbox.cloud/workspace1/assets/image-1/images/100.jpeg'
					}
				} )
			] );

			return adapter.upload()
				.then( data => {
					expect( data ).toHaveProperty( 'ckboxImageId', 'image-1' );
					expect( data ).toHaveProperty(
						'default',
						'https://ckbox.cloud/workspace1/assets/image-1/images/100.jpeg'
					);

					const uploadRequest = fakeXHRServer.requests[ 1 ];
					expect( uploadRequest.requestBody.get( 'categoryId' ) ).toBe( 'id-category-2' );
					expect( uploadRequest.requestBody.has( 'file' ) ).toBe( true );
				} );
		} );

		it( 'should take the first category if many of them accepts a jpg file (uppercase file extension)', () => {
			file.name = 'image.JPG';

			fakeXHRServer.respondWith( 'GET', CKBOX_API_URL + '/categories?limit=50&offset=0&workspaceId=workspace1', [
				200,
				{ 'Content-Type': 'application/json' },
				JSON.stringify( {
					items: [
						{ name: 'category 1', id: 'id-category-1', extensions: [ 'png' ] },
						{ name: 'category 2', id: 'id-category-2', extensions: [ 'webp', 'jpg' ] },
						{ name: 'category 3', id: 'id-category-3', extensions: [ 'gif', 'jpg' ] }
					], offset: 0, limit: 50, totalCount: 3
				} )
			] );

			fakeXHRServer.respondWith( 'POST', CKBOX_API_URL + '/assets?workspaceId=workspace1', [
				201,
				{ 'Content-Type': 'application/json' },
				JSON.stringify( {
					id: 'image-1',
					imageUrls: {
						100: 'https://ckbox.cloud/workspace1/assets/image-1/images/100.webp',
						default: 'https://ckbox.cloud/workspace1/assets/image-1/images/100.jpeg'
					}
				} )
			] );

			return adapter.upload()
				.then( data => {
					expect( data ).toHaveProperty( 'ckboxImageId', 'image-1' );
					expect( data ).toHaveProperty(
						'default',
						'https://ckbox.cloud/workspace1/assets/image-1/images/100.jpeg'
					);

					const uploadRequest = fakeXHRServer.requests[ 1 ];
					expect( uploadRequest.requestBody.get( 'categoryId' ) ).toBe( 'id-category-2' );
					expect( uploadRequest.requestBody.has( 'file' ) ).toBe( true );
				} );
		} );

		it( 'should take the first category if many of them accepts a JPG file', () => {
			fakeXHRServer.respondWith( 'GET', CKBOX_API_URL + '/categories?limit=50&offset=0&workspaceId=workspace1', [
				200,
				{ 'Content-Type': 'application/json' },
				JSON.stringify( {
					items: [
						{ name: 'category 1', id: 'id-category-1', extensions: [ 'PNG' ] },
						{ name: 'category 2', id: 'id-category-2', extensions: [ 'WEBP', 'JPG' ] },
						{ name: 'category 3', id: 'id-category-3', extensions: [ 'GIF', 'JPG' ] }
					], offset: 0, limit: 50, totalCount: 3
				} )
			] );

			fakeXHRServer.respondWith( 'POST', CKBOX_API_URL + '/assets?workspaceId=workspace1', [
				201,
				{ 'Content-Type': 'application/json' },
				JSON.stringify( {
					id: 'image-1',
					imageUrls: {
						100: 'https://ckbox.cloud/workspace1/assets/image-1/images/100.webp',
						default: 'https://ckbox.cloud/workspace1/assets/image-1/images/100.jpeg'
					}
				} )
			] );

			return adapter.upload()
				.then( data => {
					expect( data ).toHaveProperty( 'ckboxImageId', 'image-1' );
					expect( data ).toHaveProperty(
						'default',
						'https://ckbox.cloud/workspace1/assets/image-1/images/100.jpeg'
					);

					const uploadRequest = fakeXHRServer.requests[ 1 ];
					expect( uploadRequest.requestBody.get( 'categoryId' ) ).toBe( 'id-category-2' );
					expect( uploadRequest.requestBody.has( 'file' ) ).toBe( true );
				} );
		} );

		it( 'should take the first category that allows uploading the file if provided configuration is empty', () => {
			fakeXHRServer.respondWith( 'GET', CKBOX_API_URL + '/categories?limit=50&offset=0&workspaceId=workspace1', [
				200,
				{ 'Content-Type': 'application/json' },
				JSON.stringify( {
					items: [
						{ name: 'category 1', id: 'id-category-1', extensions: [ 'png', 'jpg' ] },
						{ name: 'category 2', id: 'id-category-2', extensions: [ 'webp' ] },
						{ name: 'category 3', id: 'id-category-3', extensions: [ 'gif' ] }
					], offset: 0, limit: 50, totalCount: 3
				} )
			] );

			fakeXHRServer.respondWith( 'POST', CKBOX_API_URL + '/assets?workspaceId=workspace1', [
				201,
				{ 'Content-Type': 'application/json' },
				JSON.stringify( {
					id: 'image-1',
					imageUrls: {
						100: 'https://ckbox.cloud/workspace1/assets/image-1/images/300.webp',
						default: 'https://ckbox.cloud/workspace1/assets/image-1/images/300.jpeg'
					}
				} )
			] );

			// An integrator does not define supported extensions.
			editor.config.set( 'ckbox.defaultUploadCategories', {
				'id-category-1': []
			} );

			return adapter.upload()
				.then( data => {
					expect( data ).toHaveProperty( 'ckboxImageId', 'image-1' );
					expect( data ).toHaveProperty(
						'default',
						'https://ckbox.cloud/workspace1/assets/image-1/images/300.jpeg'
					);

					const uploadRequest = fakeXHRServer.requests[ 1 ];
					expect( uploadRequest.requestBody.get( 'categoryId' ) ).toBe( 'id-category-1' );
					expect( uploadRequest.requestBody.has( 'file' ) ).toBe( true );
				} );
		} );

		it( 'should take the first category matching with the configuration (category specified as a name)', () => {
			fakeXHRServer.respondWith( 'GET', CKBOX_API_URL + '/categories?limit=50&offset=0&workspaceId=workspace1', [
				200,
				{ 'Content-Type': 'application/json' },
				JSON.stringify( {
					items: [
						{ name: 'Covers', id: 'id-category-1', extensions: [ 'png' ] },
						{ name: 'Albums', id: 'id-category-2', extensions: [ 'webp', 'jpg' ] },
						{ name: 'Albums (to print)', id: 'id-category-3', extensions: [ 'gif', 'jpg' ] }
					], offset: 0, limit: 50, totalCount: 3
				} )
			] );

			fakeXHRServer.respondWith( 'POST', CKBOX_API_URL + '/assets?workspaceId=workspace1', [
				201,
				{ 'Content-Type': 'application/json' },
				JSON.stringify( {
					id: 'image-1',
					imageUrls: {
						100: 'https://ckbox.cloud/workspace1/assets/image-1/images/300.webp',
						default: 'https://ckbox.cloud/workspace1/assets/image-1/images/300.jpeg'
					}
				} )
			] );

			editor.config.set( 'ckbox.defaultUploadCategories', {
				'Albums (to print)': [ 'gif', 'jpg' ]
			} );

			return adapter.upload()
				.then( data => {
					expect( data ).toHaveProperty( 'ckboxImageId', 'image-1' );
					expect( data ).toHaveProperty(
						'default',
						'https://ckbox.cloud/workspace1/assets/image-1/images/300.jpeg'
					);

					const uploadRequest = fakeXHRServer.requests[ 1 ];
					expect( uploadRequest.requestBody.get( 'categoryId' ) ).toBe( 'id-category-3' );
					expect( uploadRequest.requestBody.has( 'file' ) ).toBe( true );
				} );
		} );

		it( 'should take the first category matching with the configuration (category specified as ID)', () => {
			fakeXHRServer.respondWith( 'GET', CKBOX_API_URL + '/categories?limit=50&offset=0&workspaceId=workspace1', [
				200,
				{ 'Content-Type': 'application/json' },
				JSON.stringify( {
					items: [
						{ name: 'Covers', id: 'id-category-1', extensions: [ 'png' ] },
						{ name: 'Albums', id: 'id-category-2', extensions: [ 'webp', 'jpg' ] },
						{ name: 'Albums (to print)', id: 'id-category-3', extensions: [ 'gif', 'jpg' ] }
					], offset: 0, limit: 50, totalCount: 3
				} )
			] );

			fakeXHRServer.respondWith( 'POST', CKBOX_API_URL + '/assets?workspaceId=workspace1', [
				201,
				{ 'Content-Type': 'application/json' },
				JSON.stringify( {
					id: 'image-1',
					imageUrls: {
						300: 'https://ckbox.cloud/workspace1/assets/image-1/images/300.webp',
						default: 'https://ckbox.cloud/workspace1/assets/image-1/images/300.jpeg'
					}
				} )
			] );

			editor.config.set( 'ckbox.defaultUploadCategories', {
				'id-category-3': [ 'gif', 'jpg' ]
			} );

			return adapter.upload()
				.then( data => {
					expect( data ).toHaveProperty( 'ckboxImageId', 'image-1' );
					expect( data ).toHaveProperty(
						'default',
						'https://ckbox.cloud/workspace1/assets/image-1/images/300.jpeg'
					);

					const uploadRequest = fakeXHRServer.requests[ 1 ];
					expect( uploadRequest.requestBody.get( 'categoryId' ) ).toBe( 'id-category-3' );
					expect( uploadRequest.requestBody.has( 'file' ) ).toBe( true );
				} );
		} );

		it( 'should take the first category matching with the configuration (uppercase file extension)', () => {
			file.name = 'image.JPG';

			fakeXHRServer.respondWith( 'GET', CKBOX_API_URL + '/categories?limit=50&offset=0&workspaceId=workspace1', [
				200,
				{ 'Content-Type': 'application/json' },
				JSON.stringify( {
					items: [
						{ name: 'Covers', id: 'id-category-1', extensions: [ 'png' ] },
						{ name: 'Albums', id: 'id-category-2', extensions: [ 'webp', 'jpg' ] },
						{ name: 'Albums (to print)', id: 'id-category-3', extensions: [ 'gif', 'jpg' ] }
					], offset: 0, limit: 50, totalCount: 3
				} )
			] );

			fakeXHRServer.respondWith( 'POST', CKBOX_API_URL + '/assets?workspaceId=workspace1', [
				201,
				{ 'Content-Type': 'application/json' },
				JSON.stringify( {
					id: 'image-1',
					imageUrls: {
						300: 'https://ckbox.cloud/workspace1/assets/image-1/images/300.webp',
						default: 'https://ckbox.cloud/workspace1/assets/image-1/images/300.jpeg'
					}
				} )
			] );

			editor.config.set( 'ckbox.defaultUploadCategories', {
				'id-category-3': [ 'gif', 'jpg' ]
			} );

			return adapter.upload()
				.then( data => {
					expect( data ).toHaveProperty( 'ckboxImageId', 'image-1' );
					expect( data ).toHaveProperty(
						'default',
						'https://ckbox.cloud/workspace1/assets/image-1/images/300.jpeg'
					);

					const uploadRequest = fakeXHRServer.requests[ 1 ];
					expect( uploadRequest.requestBody.get( 'categoryId' ) ).toBe( 'id-category-3' );
					expect( uploadRequest.requestBody.has( 'file' ) ).toBe( true );
				} );
		} );

		it( 'should take the first category matching with the configuration (uppercase configuration)', () => {
			fakeXHRServer.respondWith( 'GET', CKBOX_API_URL + '/categories?limit=50&offset=0&workspaceId=workspace1', [
				200,
				{ 'Content-Type': 'application/json' },
				JSON.stringify( {
					items: [
						{ name: 'Covers', id: 'id-category-1', extensions: [ 'png' ] },
						{ name: 'Albums', id: 'id-category-2', extensions: [ 'webp', 'jpg' ] },
						{ name: 'Albums (to print)', id: 'id-category-3', extensions: [ 'gif', 'jpg' ] }
					], offset: 0, limit: 50, totalCount: 3
				} )
			] );

			fakeXHRServer.respondWith( 'POST', CKBOX_API_URL + '/assets?workspaceId=workspace1', [
				201,
				{ 'Content-Type': 'application/json' },
				JSON.stringify( {
					id: 'image-1',
					imageUrls: {
						300: 'https://ckbox.cloud/workspace1/assets/image-1/images/300.webp',
						default: 'https://ckbox.cloud/workspace1/assets/image-1/images/300.jpeg'
					}
				} )
			] );

			editor.config.set( 'ckbox.defaultUploadCategories', {
				'id-category-3': [ 'GIF', 'JPG' ]
			} );

			return adapter.upload()
				.then( data => {
					expect( data ).toHaveProperty( 'ckboxImageId', 'image-1' );
					expect( data ).toHaveProperty(
						'default',
						'https://ckbox.cloud/workspace1/assets/image-1/images/300.jpeg'
					);

					const uploadRequest = fakeXHRServer.requests[ 1 ];
					expect( uploadRequest.requestBody.get( 'categoryId' ) ).toBe( 'id-category-3' );
					expect( uploadRequest.requestBody.has( 'file' ) ).toBe( true );
				} );
		} );

		it( 'should take the first allowed category for a file not covered by the plugin configuration', () => {
			fakeXHRServer.respondWith( 'GET', CKBOX_API_URL + '/categories?limit=50&offset=0&workspaceId=workspace1', [
				200,
				{ 'Content-Type': 'application/json' },
				JSON.stringify( {
					items: [
						{ name: 'Covers', id: 'id-category-1', extensions: [ 'png' ] },
						{ name: 'Albums', id: 'id-category-2', extensions: [ 'webp', 'jpg' ] },
						{ name: 'Albums (to print)', id: 'id-category-3', extensions: [ 'gif', 'jpg' ] }
					], offset: 0, limit: 50, totalCount: 3
				} )
			] );

			fakeXHRServer.respondWith( 'POST', CKBOX_API_URL + '/assets?workspaceId=workspace1', [
				201,
				{ 'Content-Type': 'application/json' },
				JSON.stringify( {
					id: 'image-1',
					imageUrls: {
						300: 'https://ckbox.cloud/workspace1/assets/image-1/images/300.webp',
						default: 'https://ckbox.cloud/workspace1/assets/image-1/images/300.jpeg'
					}
				} )
			] );

			editor.config.set( 'ckbox.defaultUploadCategories', {
				'Albums (to print)': [ 'bmp' ]
			} );

			return adapter.upload()
				.then( data => {
					expect( data ).toHaveProperty( 'ckboxImageId', 'image-1' );
					expect( data ).toHaveProperty(
						'default',
						'https://ckbox.cloud/workspace1/assets/image-1/images/300.jpeg'
					);

					const uploadRequest = fakeXHRServer.requests[ 1 ];
					expect( uploadRequest.requestBody.get( 'categoryId' ) ).toBe( 'id-category-2' );
					expect( uploadRequest.requestBody.has( 'file' ) ).toBe( true );
				} );
		} );

		it( 'should resolve an object contains responsive URLs', () => {
			fakeXHRServer.respondWith( 'GET', CKBOX_API_URL + '/categories?limit=50&offset=0&workspaceId=workspace1', [
				200,
				{ 'Content-Type': 'application/json' },
				JSON.stringify( {
					items: [
						{ name: 'category 1', id: 'id-category-1', extensions: [ 'png' ] },
						{ name: 'category 2', id: 'id-category-2', extensions: [ 'webp', 'jpg' ] },
						{ name: 'category 3', id: 'id-category-3', extensions: [ 'gif', 'jpg' ] }
					], offset: 0, limit: 50, totalCount: 3
				} )
			] );

			fakeXHRServer.respondWith( 'POST', CKBOX_API_URL + '/assets?workspaceId=workspace1', [
				201,
				{ 'Content-Type': 'application/json' },
				JSON.stringify( {
					id: 'image-1',
					imageUrls: {
						500: 'https://ckbox.cloud/workspace1/assets/image-1/images/500.webp',
						1000: 'https://ckbox.cloud/workspace1/assets/image-1/images/1000.webp',
						1500: 'https://ckbox.cloud/workspace1/assets/image-1/images/1500.webp',
						2000: 'https://ckbox.cloud/workspace1/assets/image-1/images/2000.webp',
						2500: 'https://ckbox.cloud/workspace1/assets/image-1/images/2500.webp',
						3000: 'https://example.com/workspace1/assets/image-1/images/3000.webp',
						3500: 'https://ckbox.cloud/workspace1/assets/image-1/images/3500.webp',
						4000: 'https://ckbox.cloud/workspace1/assets/image-1/images/4000.webp',
						default: 'https://ckbox.cloud/workspace1/assets/image-1/images/4000.jpeg'
					}
				} )
			] );

			return adapter.upload()
				.then( data => {
					expect( data ).toHaveProperty( 'sources' );
					expect( data.sources ).toBeInstanceOf( Array );
					expect( data.sources ).toEqual( [
						{
							srcset: 'https://ckbox.cloud/workspace1/assets/image-1/images/500.webp 500w,' +
								'https://ckbox.cloud/workspace1/assets/image-1/images/1000.webp 1000w,' +
								'https://ckbox.cloud/workspace1/assets/image-1/images/1500.webp 1500w,' +
								'https://ckbox.cloud/workspace1/assets/image-1/images/2000.webp 2000w,' +
								'https://ckbox.cloud/workspace1/assets/image-1/images/2500.webp 2500w,' +
								'https://example.com/workspace1/assets/image-1/images/3000.webp 3000w,' +
								'https://ckbox.cloud/workspace1/assets/image-1/images/3500.webp 3500w,' +
								'https://ckbox.cloud/workspace1/assets/image-1/images/4000.webp 4000w',
							sizes: '(max-width: 4000px) 100vw, 4000px',
							type: 'image/webp'
						}
					] );
				} );
		} );

		it( 'should throw an error on abort (while fetching categories)', () => {
			fakeXHRServer.respondWith( 'GET', CKBOX_API_URL + '/categories?limit=50&offset=0&workspaceId=workspace1', [
				200,
				{ 'Content-Type': 'application/json' },
				JSON.stringify( {
					items: [
						{ name: 'category 1', id: 'id-category-1', extensions: [ 'png' ] },
						{ name: 'category 2', id: 'id-category-2', extensions: [ 'webp', 'jpg' ] },
						{ name: 'category 3', id: 'id-category-3', extensions: [ 'gif', 'jpg' ] }
					], offset: 0, limit: 50, totalCount: 3
				} )
			] );

			const promise = adapter.upload()
				.then( () => {
					throw new Error( 'Promise should throw.' );
				} )
				.catch( () => {
					expect( adapter.controller.signal.aborted ).toBe( true );
				} );

			loader.file.then( () => {
				adapter.abort();
			} );

			return promise;
		} );

		it( 'should throw an error on abort (while uploading)', () => {
			vi.spyOn( ckboxUtils, 'getCategoryIdForFile' ).mockResolvedValue( 'id-category-2' );

			fakeXHRServer.respondWith( 'POST', CKBOX_API_URL + '/assets?workspaceId=workspace1', xhr => {
				adapter.abort();

				xhr.error();
			} );

			return adapter.upload()
				.then( () => {
					throw new Error( 'Promise should throw.' );
				} )
				.catch( () => {
					expect( adapter.controller.signal.aborted ).toBe( true );
				} );
		} );

		it( 'should throw an error on generic request error (while uploading)', () => {
			vi.spyOn( console, 'error' ).mockImplementation( () => {} );
			vi.spyOn( ckboxUtils, 'getCategoryIdForFile' ).mockResolvedValue( 'id-category-2' );

			fakeXHRServer.respondWith( 'POST', CKBOX_API_URL + '/assets?workspaceId=workspace1', xhr => {
				xhr.error();
			} );

			return adapter.upload()
				.then( () => {
					throw new Error( 'Promise should throw.' );
				} )
				.catch( msg => {
					expect( msg ).toBe( 'Cannot upload file: image.jpg.' );
				} );
		} );

		it( 'abort should not throw before upload', () => {
			expect( () => {
				adapter.abort();
			} ).not.toThrow();
		} );

		it( 'should update progress', () => {
			vi.spyOn( ckboxUtils, 'getCategoryIdForFile' ).mockResolvedValue( 'id-category-2' );

			fakeXHRServer.respondWith( 'POST', CKBOX_API_URL + '/assets?workspaceId=workspace1', xhr => {
				xhr.uploadProgress( { loaded: 4, total: 10 } );

				expect( loader.uploadTotal ).toBe( 10 );
				expect( loader.uploaded ).toBe( 4 );

				return xhr.respond(
					201,
					{ 'Content-Type': 'application/json' },
					JSON.stringify( {
						id: 'image-1',
						imageUrls: {
							100: 'https://ckbox.cloud/workspace1/assets/image-1/images/100.webp',
							default: 'https://ckbox.cloud/workspace1/assets/image-1/images/100.jpeg'
						}
					} )
				);
			} );

			return adapter.upload();
		} );

		describe( 'choosing workspaceId', () => {
			describe( 'defaultUploadWorkspaceId is not defined', () => {
				const testData = [ {
					testName: 'should use the only workspace',
					workspaceId: 'the-only-workspace',
					tokenClaims: { auth: { ckbox: { workspaces: [ 'the-only-workspace' ] } } }
				}, {
					testName: 'should use the first workspace',
					workspaceId: '1st-workspace',
					tokenClaims: { auth: { ckbox: { workspaces: [ '1st-workspace', '2nd-workspace' ] } } }
				}, {
					testName: 'should use the environmentId when no workspaces in the token',
					workspaceId: 'environment',
					tokenClaims: { aud: 'environment' }
				} ];

				for ( const { testName, workspaceId, tokenClaims } of testData ) {
					it( testName, async () => {
						TokenMock.initialToken = createToken( tokenClaims );
						( await ckboxUtils._token ).refreshToken();

						fakeXHRServer.respondWith( 'GET', /\/categories/, [
							200,
							{ 'Content-Type': 'application/json' },
							JSON.stringify( {
								items: [
									{ name: 'Albums', id: 'id-category-1', extensions: [ 'jpg' ] }
								], offset: 0, limit: 50, totalCount: 1
							} )
						] );

						fakeXHRServer.respondWith( 'POST', /\/assets/, [
							201,
							{ 'Content-Type': 'application/json' },
							JSON.stringify( {
								id: 'image-1',
								imageUrls: {
									100: 'https://ckbox.cloud/workspace1/assets/image-1/images/100.webp',
									default: 'https://ckbox.cloud/workspace1/assets/image-1/images/100.jpeg'
								}
							} )
						] );

						return adapter.upload()
							.then( () => {
								const categoriesRequest = fakeXHRServer.requests[ 0 ];
								const uploadRequest = fakeXHRServer.requests[ 1 ];

								expect( categoriesRequest.url ).toBe(
									CKBOX_API_URL + '/categories?limit=50&offset=0&workspaceId=' + workspaceId );
								expect( uploadRequest.url ).toBe(
									CKBOX_API_URL + '/assets?workspaceId=' + workspaceId );
							} );
					} );
				}
			} );

			describe( 'defaultUploadWorkspaceId is defined', () => {
				it( 'should use the default workspace', async () => {
					TokenMock.initialToken = createToken( { auth: { ckbox: { workspaces: [ 'workspace1', 'workspace2' ] } } } );
					( await ckboxUtils._token ).refreshToken();

					fakeXHRServer.respondWith( 'GET', /\/categories/, [
						200,
						{ 'Content-Type': 'application/json' },
						JSON.stringify( {
							items: [
								{ name: 'Albums', id: 'id-category-1', extensions: [ 'jpg' ] }
							], offset: 0, limit: 50, totalCount: 1
						} )
					] );

					fakeXHRServer.respondWith( 'POST', /\/assets/, [
						201,
						{ 'Content-Type': 'application/json' },
						JSON.stringify( {
							id: 'image-1',
							imageUrls: {
								100: 'https://ckbox.cloud/workspace1/assets/image-1/images/100.webp',
								default: 'https://ckbox.cloud/workspace1/assets/image-1/images/100.jpeg'
							}
						} )
					] );

					editor.config.set( 'ckbox.defaultUploadWorkspaceId', 'workspace2' );

					return adapter.upload()
						.then( () => {
							const categoriesRequest = fakeXHRServer.requests[ 0 ];
							const uploadRequest = fakeXHRServer.requests[ 1 ];

							expect( categoriesRequest.url ).toBe(
								CKBOX_API_URL + '/categories?limit=50&offset=0&workspaceId=workspace2' );
							expect( uploadRequest.url ).toBe(
								CKBOX_API_URL + '/assets?workspaceId=workspace2' );
						} );
				} );

				it( 'should use the default workspace when the user is superadmin', async () => {
					TokenMock.initialToken = createToken( { auth: { ckbox: { role: 'superadmin' } } } );
					( await ckboxUtils._token ).refreshToken();

					fakeXHRServer.respondWith( 'GET', /\/categories/, [
						200,
						{ 'Content-Type': 'application/json' },
						JSON.stringify( {
							items: [
								{ name: 'Albums', id: 'id-category-1', extensions: [ 'jpg' ] }
							], offset: 0, limit: 50, totalCount: 1
						} )
					] );

					fakeXHRServer.respondWith( 'POST', /\/assets/, [
						201,
						{ 'Content-Type': 'application/json' },
						JSON.stringify( {
							id: 'image-1',
							imageUrls: {
								100: 'https://ckbox.cloud/workspace1/assets/image-1/images/100.webp',
								default: 'https://ckbox.cloud/workspace1/assets/image-1/images/100.jpeg'
							}
						} )
					] );

					editor.config.set( 'ckbox.defaultUploadWorkspaceId', 'workspace1' );

					return adapter.upload()
						.then( () => {
							const categoriesRequest = fakeXHRServer.requests[ 0 ];
							const uploadRequest = fakeXHRServer.requests[ 1 ];

							expect( categoriesRequest.url ).toBe(
								CKBOX_API_URL + '/categories?limit=50&offset=0&workspaceId=workspace1' );
							expect( uploadRequest.url ).toBe(
								CKBOX_API_URL + '/assets?workspaceId=workspace1' );
						} );
				} );

				it( 'should throw an error when default workspace is not listed in the token', async () => {
					vi.spyOn( console, 'error' ).mockImplementation( () => {} );

					TokenMock.initialToken = createToken( { auth: { ckbox: { workspaces: [ 'workspace1', 'workspace2' ] } } } );
					( await ckboxUtils._token ).refreshToken();

					fakeXHRServer.respondWith( 'GET', /\/categories/, [
						200,
						{ 'Content-Type': 'application/json' },
						JSON.stringify( {
							items: [
								{ name: 'Albums', id: 'id-category-1', extensions: [ 'jpg' ] }
							], offset: 0, limit: 50, totalCount: 1
						} )
					] );

					editor.config.set( 'ckbox.defaultUploadWorkspaceId', 'workspace3' );

					return adapter.upload()
						.then( () => {
							throw new Error( 'Expected to be rejected.' );
						}, err => {
							expect( console.error ).toHaveBeenCalledTimes( 1 );
							expect( console.error.mock.calls[ 0 ][ 0 ] ).toMatch( /^ckbox-access-default-workspace-error/ );
							expect( err ).toBe( 'Cannot access default workspace.' );
						} );
				} );
			} );
		} );
	} );

	describe( 'adding the "ckboxImageId" attribute to the uploaded asset', () => {
		let nativeReaderMock, loader, adapterMock;

		const imgPath = '/sample.png';
		const file = createNativeFileMock();
		file.name = 'image.jpg';

		it( 'should add the "ckboxImageId" attribute to the uploaded image by default', async () => {
			vi.stubGlobal( 'FileReader', function() {
				nativeReaderMock = new NativeFileReaderMock();

				return nativeReaderMock;
			} );

			fileRepository.createUploadAdapter = newLoader => {
				loader = newLoader;
				adapterMock = new UploadAdapterMock( loader );

				return adapterMock;
			};

			editor.execute( 'uploadImage', { file } );

			loader.file.then( () => nativeReaderMock.mockSuccess( BASE64_SAMPLE ) );

			await new Promise( resolve => {
				editor.model.document.once( 'change', () => {
					loader.file.then( () => adapterMock.mockSuccess( {
						default: imgPath,
						ckboxImageId: 'id'
					} ) );

					resolve();
				} );
			} );

			await new Promise( resolve => {
				editor.model.document.once( 'change', () => {
					expect( _getModelData( editor.model ) ).toBe(
						`[<imageBlock ckboxImageId="id" src="${ imgPath }" uploadId="${ loader.id }" uploadStatus="complete">` +
						'</imageBlock>]'
					);

					resolve();
				} );
			} );

			loader.file.then( () => nativeReaderMock.mockSuccess( BASE64_SAMPLE ) );
		} );

		it( 'should not add the "ckboxImageId" attribute to the uploaded image if disabled in a configuration', async () => {
			const editorElement = document.createElement( 'div' );
			document.body.appendChild( editorElement );

			const editor = await ClassicTestEditor
				.create( editorElement, {
					plugins: [
						Clipboard,
						Paragraph,
						LinkEditing,
						Image,
						PictureEditing,
						ImageUploadEditing,
						ImageUploadProgress,
						CloudServices,
						CKBoxEditing,
						CKBoxUploadAdapter
					],
					substitutePlugins: [
						CloudServicesCoreMock
					],
					ckbox: {
						tokenUrl: 'http://example.com',
						ignoreDataId: true
					}
				} );

			vi.stubGlobal( 'FileReader', function() {
				nativeReaderMock = new NativeFileReaderMock();

				return nativeReaderMock;
			} );

			fileRepository = editor.plugins.get( FileRepository );
			fileRepository.createUploadAdapter = newLoader => {
				loader = newLoader;
				adapterMock = new UploadAdapterMock( loader );

				return adapterMock;
			};

			editor.execute( 'uploadImage', { file } );

			loader.file.then( () => nativeReaderMock.mockSuccess( BASE64_SAMPLE ) );

			await new Promise( resolve => {
				editor.model.document.once( 'change', () => {
					loader.file.then( () => adapterMock.mockSuccess( {
						default: imgPath,
						ckboxImageId: 'image-1'
					} ) );

					resolve();
				} );
			} );

			await new Promise( resolve => {
				editor.model.document.once( 'change', () => {
					expect( _getModelData( editor.model ) ).toBe(
						`[<imageBlock src="${ imgPath }" uploadId="${ loader.id }" uploadStatus="complete"></imageBlock>]`
					);

					resolve();
				} );
			} );

			await editor.destroy();
			editorElement.remove();
		} );
	} );

	function createToken( tokenClaims ) {
		return [
			// Header.
			'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9',
			// Payload.
			btoa( JSON.stringify( tokenClaims ) ),
			// Signature.
			'signature'
		].join( '.' );
	}
} );
