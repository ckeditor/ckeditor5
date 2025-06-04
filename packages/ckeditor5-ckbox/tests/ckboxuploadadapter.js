/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor.js';
import Clipboard from '@ckeditor/ckeditor5-clipboard/src/clipboard.js';
import CloudServices from '@ckeditor/ckeditor5-cloud-services/src/cloudservices.js';
import Image from '@ckeditor/ckeditor5-image/src/image.js';
import ImageUploadEditing from '@ckeditor/ckeditor5-image/src/imageupload/imageuploadediting.js';
import ImageUploadProgress from '@ckeditor/ckeditor5-image/src/imageupload/imageuploadprogress.js';
import PictureEditing from '@ckeditor/ckeditor5-image/src/pictureediting.js';
import LinkEditing from '@ckeditor/ckeditor5-link/src/linkediting.js';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph.js';
import FileRepository from '@ckeditor/ckeditor5-upload/src/filerepository.js';
import Plugin from '@ckeditor/ckeditor5-core/src/plugin.js';
import CKBoxEditing from '../src/ckboxediting.js';
import CKBoxUploadAdapter from '../src/ckboxuploadadapter.js';

import { createNativeFileMock, NativeFileReaderMock, UploadAdapterMock } from '@ckeditor/ckeditor5-upload/tests/_utils/mocks.js';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils.js';
import TokenMock from '@ckeditor/ckeditor5-cloud-services/tests/_utils/tokenmock.js';

import CloudServicesCoreMock from './_utils/cloudservicescoremock.js';

import { getData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model.js';
import CKBoxUtils from '../src/ckboxutils.js';

const BASE64_SAMPLE = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=';
const CKBOX_API_URL = 'https://upload.example.com';

describe( 'CKBoxUploadAdapter', () => {
	let editor, fileRepository, editorElement;

	const jwtToken = createToken( { auth: { ckbox: { workspaces: [ 'workspace1' ] } } } );

	testUtils.createSinonSandbox();

	beforeEach( () => {
		editorElement = document.createElement( 'div' );
		document.body.appendChild( editorElement );

		TokenMock.initialToken = jwtToken;

		sinon.stub( CKBoxUtils.prototype, '_authorizePrivateCategoriesAccess' ).resolves();

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
		expect( CKBoxUploadAdapter.pluginName ).to.equal( 'CKBoxUploadAdapter' );
	} );

	it( 'should have `isOfficialPlugin` static flag set to `true`', () => {
		expect( CKBoxUploadAdapter.isOfficialPlugin ).to.be.true;
	} );

	it( 'should have `isPremiumPlugin` static flag set to `false`', () => {
		expect( CKBoxUploadAdapter.isPremiumPlugin ).to.be.false;
	} );

	it( 'should require its dependencies', () => {
		expect( CKBoxUploadAdapter.requires ).to.deep.equal( [
			'ImageUploadEditing', 'ImageUploadProgress', FileRepository, CKBoxEditing
		] );
	} );

	it( 'should be loaded', () => {
		expect( editor.plugins.get( CKBoxUploadAdapter ) ).to.be.instanceOf( CKBoxUploadAdapter );
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

			expect( fileRepositoryPlugin.createUploadAdapter ).to.equal( uploadAdapterCreator );

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

			expect( fileRepositoryPlugin.createUploadAdapter ).to.be.a( 'function' );
			expect( fileRepositoryPlugin.createUploadAdapter ).not.to.equal( uploadAdapterCreator );

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

			expect( fileRepositoryPlugin.createUploadAdapter ).to.be.a( 'function' );
			expect( fileRepositoryPlugin.createUploadAdapter ).not.to.equal( uploadAdapterCreator );

			window.CKBox = originalCKBox;
			editorElement.remove();
			return editor.destroy();
		} );
	} );

	describe( 'Adapter', () => {
		let adapter, file, loader, sinonXHR, ckboxUtils;

		beforeEach( () => {
			file = createNativeFileMock();
			file.name = 'image.jpg';

			loader = fileRepository.createLoader( file );
			adapter = editor.plugins.get( FileRepository ).createUploadAdapter( loader );
			ckboxUtils = editor.plugins.get( CKBoxUtils );

			sinonXHR = testUtils.sinon.useFakeServer();
			sinonXHR.autoRespond = true;
		} );

		afterEach( () => {
			sinonXHR.restore();
		} );

		it( 'crateAdapter method should be registered and have upload and abort methods', () => {
			expect( adapter ).to.not.be.undefined;
			expect( adapter.upload ).to.be.a( 'function' );
			expect( adapter.abort ).to.be.a( 'function' );
		} );

		it( 'should abort the upload if cannot determine a category due to network error', () => {
			sinon.stub( console, 'error' );

			sinonXHR.respondWith( 'GET', CKBOX_API_URL + '/categories?limit=50&offset=0&workspaceId=workspace1', xhr => {
				expect( xhr.requestHeaders ).to.be.an( 'object' );
				expect( xhr.requestHeaders ).to.contain.property( 'Authorization', jwtToken );
				expect( xhr.requestHeaders ).to.contain.property( 'CKBox-Version', 'CKEditor 5' );

				return xhr.error();
			} );

			return adapter.upload()
				.then( () => {
					throw new Error( 'Expected to be rejected.' );
				}, error => {
					expect( console.error.callCount ).to.equal( 1 );
					expect( console.error.firstCall.args[ 0 ] ).to.match( /^ckbox-fetch-category-http-error/ );

					expect( error ).to.equal( 'Cannot determine a category for the uploaded file.' );
				} );
		} );

		it( 'should abort the upload if fetching available categories ended with the authorization error', () => {
			sinon.stub( console, 'error' );

			sinonXHR.respondWith( 'GET', CKBOX_API_URL + '/categories?limit=50&offset=0&workspaceId=workspace1', [
				401,
				{ 'Content-Type': 'application/json' },
				JSON.stringify( { message: 'Invalid token.', statusCode: 401 } )
			] );

			return adapter.upload()
				.then( () => {
					throw new Error( 'Expected to be rejected.' );
				}, error => {
					expect( console.error.callCount ).to.equal( 1 );
					expect( console.error.firstCall.args[ 0 ] ).to.match( /^ckbox-fetch-category-http-error/ );

					expect( sinonXHR.requests[ 0 ].requestHeaders ).to.be.an( 'object' );
					expect( sinonXHR.requests[ 0 ].requestHeaders ).to.contain.property( 'Authorization', jwtToken );
					expect( sinonXHR.requests[ 0 ].requestHeaders ).to.contain.property( 'CKBox-Version', 'CKEditor 5' );
					expect( error ).to.equal( 'Cannot determine a category for the uploaded file.' );
				} );
		} );

		it( 'should abort the upload if a list of available categories is empty', () => {
			sinonXHR.respondWith( 'GET', CKBOX_API_URL + '/categories?limit=50&offset=0&workspaceId=workspace1', [
				200,
				{ 'Content-Type': 'application/json' },
				JSON.stringify( { items: [], offset: 0, limit: 50, totalCount: 0 } )
			] );

			return adapter.upload()
				.then( () => {
					throw new Error( 'Expected to be rejected.' );
				}, err => {
					expect( sinonXHR.requests[ 0 ].requestHeaders ).to.be.an( 'object' );
					expect( sinonXHR.requests[ 0 ].requestHeaders ).to.contain.property( 'Authorization', jwtToken );
					expect( sinonXHR.requests[ 0 ].requestHeaders ).to.contain.property( 'CKBox-Version', 'CKEditor 5' );
					expect( err ).to.equal( 'Cannot determine a category for the uploaded file.' );
				} );
		} );

		it( 'should abort the upload if any category does not accept a jpg file', () => {
			sinonXHR.respondWith( 'GET', CKBOX_API_URL + '/categories?limit=50&offset=0&workspaceId=workspace1', [
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
					expect( err ).to.equal( 'Cannot determine a category for the uploaded file.' );
				} );
		} );

		it( 'should abort the upload if the provided configuration uses a non-existing category', () => {
			sinonXHR.respondWith( 'GET', CKBOX_API_URL + '/categories?limit=50&offset=0&workspaceId=workspace1', [
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
					expect( err ).to.equal( 'Cannot determine a category for the uploaded file.' );
				} );
		} );

		it( 'should fetch all categories if API limits their results', () => {
			sinonXHR.respondWith( 'GET', CKBOX_API_URL + '/categories?limit=50&offset=0&workspaceId=workspace1', [
				200,
				{ 'Content-Type': 'application/json' },
				JSON.stringify( {
					items: [], offset: 0, limit: 50, totalCount: 101
				} )
			] );
			sinonXHR.respondWith( 'GET', CKBOX_API_URL + '/categories?limit=50&offset=50&workspaceId=workspace1', [
				200, { 'Content-Type': 'application/json' },
				JSON.stringify( {
					items: [], offset: 50, limit: 50, totalCount: 101
				} )
			] );
			sinonXHR.respondWith( 'GET', CKBOX_API_URL + '/categories?limit=50&offset=100&workspaceId=workspace1', [
				200,
				{ 'Content-Type': 'application/json' },
				JSON.stringify( {
					items: [], offset: 100, limit: 50, totalCount: 101
				} )
			] );

			return adapter.upload()
				.catch( () => {
					expect( sinonXHR.requests ).to.lengthOf( 3 );
					expect( sinonXHR.requests[ 0 ].requestHeaders ).to.be.an( 'object' );
					expect( sinonXHR.requests[ 0 ].requestHeaders ).to.contain.property( 'Authorization', jwtToken );
					expect( sinonXHR.requests[ 0 ].requestHeaders ).to.contain.property( 'CKBox-Version', 'CKEditor 5' );
					expect( sinonXHR.requests[ 1 ].requestHeaders ).to.be.an( 'object' );
					expect( sinonXHR.requests[ 1 ].requestHeaders ).to.contain.property( 'Authorization', jwtToken );
					expect( sinonXHR.requests[ 1 ].requestHeaders ).to.contain.property( 'CKBox-Version', 'CKEditor 5' );
					expect( sinonXHR.requests[ 2 ].requestHeaders ).to.be.an( 'object' );
					expect( sinonXHR.requests[ 2 ].requestHeaders ).to.contain.property( 'Authorization', jwtToken );
					expect( sinonXHR.requests[ 2 ].requestHeaders ).to.contain.property( 'CKBox-Version', 'CKEditor 5' );
				} );
		} );

		it( 'should abort if the provided configuration is not in sync with server', () => {
			sinonXHR.respondWith( 'GET', CKBOX_API_URL + '/categories?limit=50&offset=0&workspaceId=workspace1', [
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

			sinonXHR.respondWith( 'POST', CKBOX_API_URL + '/assets&workspaceId=workspace1', [
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

			sinon.stub( console, 'warn' );

			return adapter.upload()
				.then( () => {
					throw new Error( 'Expected to be rejected.' );
				}, err => {
					expect( err ).to.equal( 'Cannot upload file: image.jpg.' );
				} );
		} );

		it( 'should abort the upload if server results with an error while sending an image', () => {
			sinonXHR.respondWith( 'GET', CKBOX_API_URL + '/categories?limit=50&offset=0&workspaceId=workspace1', [
				200,
				{ 'Content-Type': 'application/json' },
				JSON.stringify( {
					items: [
						{ name: 'category 1', id: 'id-category-1', extensions: [ 'webp', 'jpg' ] }
					], offset: 0, limit: 50, totalCount: 1
				} )
			] );

			sinonXHR.respondWith( 'POST', CKBOX_API_URL + '/assets?workspaceId=workspace1', [
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
					expect( err ).to.equal( 'Cannot upload file: image.jpg.' );
				} );
		} );

		it( 'should take the first category if many of them accepts a jpg file', () => {
			sinonXHR.respondWith( 'GET', CKBOX_API_URL + '/categories?limit=50&offset=0&workspaceId=workspace1', [
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

			sinonXHR.respondWith( 'POST', CKBOX_API_URL + '/assets?workspaceId=workspace1', [
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
					expect( data ).to.contain.property( 'ckboxImageId', 'image-1' );
					expect( data ).to.contain.property(
						'default',
						'https://ckbox.cloud/workspace1/assets/image-1/images/100.jpeg'
					);

					const uploadRequest = sinonXHR.requests[ 1 ];
					expect( uploadRequest.requestBody.get( 'categoryId' ) ).to.equal( 'id-category-2' );
					expect( uploadRequest.requestBody.has( 'file' ) ).to.equal( true );
				} );
		} );

		it( 'should take the first category if many of them accepts a jpg file (uppercase file extension)', () => {
			file.name = 'image.JPG';

			sinonXHR.respondWith( 'GET', CKBOX_API_URL + '/categories?limit=50&offset=0&workspaceId=workspace1', [
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

			sinonXHR.respondWith( 'POST', CKBOX_API_URL + '/assets?workspaceId=workspace1', [
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
					expect( data ).to.contain.property( 'ckboxImageId', 'image-1' );
					expect( data ).to.contain.property(
						'default',
						'https://ckbox.cloud/workspace1/assets/image-1/images/100.jpeg'
					);

					const uploadRequest = sinonXHR.requests[ 1 ];
					expect( uploadRequest.requestBody.get( 'categoryId' ) ).to.equal( 'id-category-2' );
					expect( uploadRequest.requestBody.has( 'file' ) ).to.equal( true );
				} );
		} );

		it( 'should take the first category if many of them accepts a JPG file', () => {
			sinonXHR.respondWith( 'GET', CKBOX_API_URL + '/categories?limit=50&offset=0&workspaceId=workspace1', [
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

			sinonXHR.respondWith( 'POST', CKBOX_API_URL + '/assets?workspaceId=workspace1', [
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
					expect( data ).to.contain.property( 'ckboxImageId', 'image-1' );
					expect( data ).to.contain.property(
						'default',
						'https://ckbox.cloud/workspace1/assets/image-1/images/100.jpeg'
					);

					const uploadRequest = sinonXHR.requests[ 1 ];
					expect( uploadRequest.requestBody.get( 'categoryId' ) ).to.equal( 'id-category-2' );
					expect( uploadRequest.requestBody.has( 'file' ) ).to.equal( true );
				} );
		} );

		it( 'should take the first category that allows uploading the file if provided configuration is empty', () => {
			sinonXHR.respondWith( 'GET', CKBOX_API_URL + '/categories?limit=50&offset=0&workspaceId=workspace1', [
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

			sinonXHR.respondWith( 'POST', CKBOX_API_URL + '/assets?workspaceId=workspace1', [
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
					expect( data ).to.contain.property( 'ckboxImageId', 'image-1' );
					expect( data ).to.contain.property(
						'default',
						'https://ckbox.cloud/workspace1/assets/image-1/images/300.jpeg'
					);

					const uploadRequest = sinonXHR.requests[ 1 ];
					expect( uploadRequest.requestBody.get( 'categoryId' ) ).to.equal( 'id-category-1' );
					expect( uploadRequest.requestBody.has( 'file' ) ).to.equal( true );
				} );
		} );

		it( 'should take the first category matching with the configuration (category specified as a name)', () => {
			sinonXHR.respondWith( 'GET', CKBOX_API_URL + '/categories?limit=50&offset=0&workspaceId=workspace1', [
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

			sinonXHR.respondWith( 'POST', CKBOX_API_URL + '/assets?workspaceId=workspace1', [
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
					expect( data ).to.contain.property( 'ckboxImageId', 'image-1' );
					expect( data ).to.contain.property(
						'default',
						'https://ckbox.cloud/workspace1/assets/image-1/images/300.jpeg'
					);

					const uploadRequest = sinonXHR.requests[ 1 ];
					expect( uploadRequest.requestBody.get( 'categoryId' ) ).to.equal( 'id-category-3' );
					expect( uploadRequest.requestBody.has( 'file' ) ).to.equal( true );
				} );
		} );

		it( 'should take the first category matching with the configuration (category specified as ID)', () => {
			sinonXHR.respondWith( 'GET', CKBOX_API_URL + '/categories?limit=50&offset=0&workspaceId=workspace1', [
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

			sinonXHR.respondWith( 'POST', CKBOX_API_URL + '/assets?workspaceId=workspace1', [
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
					expect( data ).to.contain.property( 'ckboxImageId', 'image-1' );
					expect( data ).to.contain.property(
						'default',
						'https://ckbox.cloud/workspace1/assets/image-1/images/300.jpeg'
					);

					const uploadRequest = sinonXHR.requests[ 1 ];
					expect( uploadRequest.requestBody.get( 'categoryId' ) ).to.equal( 'id-category-3' );
					expect( uploadRequest.requestBody.has( 'file' ) ).to.equal( true );
				} );
		} );

		it( 'should take the first category matching with the configuration (uppercase file extension)', () => {
			file.name = 'image.JPG';

			sinonXHR.respondWith( 'GET', CKBOX_API_URL + '/categories?limit=50&offset=0&workspaceId=workspace1', [
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

			sinonXHR.respondWith( 'POST', CKBOX_API_URL + '/assets?workspaceId=workspace1', [
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
					expect( data ).to.contain.property( 'ckboxImageId', 'image-1' );
					expect( data ).to.contain.property(
						'default',
						'https://ckbox.cloud/workspace1/assets/image-1/images/300.jpeg'
					);

					const uploadRequest = sinonXHR.requests[ 1 ];
					expect( uploadRequest.requestBody.get( 'categoryId' ) ).to.equal( 'id-category-3' );
					expect( uploadRequest.requestBody.has( 'file' ) ).to.equal( true );
				} );
		} );

		it( 'should take the first category matching with the configuration (uppercase configuration)', () => {
			sinonXHR.respondWith( 'GET', CKBOX_API_URL + '/categories?limit=50&offset=0&workspaceId=workspace1', [
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

			sinonXHR.respondWith( 'POST', CKBOX_API_URL + '/assets?workspaceId=workspace1', [
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
					expect( data ).to.contain.property( 'ckboxImageId', 'image-1' );
					expect( data ).to.contain.property(
						'default',
						'https://ckbox.cloud/workspace1/assets/image-1/images/300.jpeg'
					);

					const uploadRequest = sinonXHR.requests[ 1 ];
					expect( uploadRequest.requestBody.get( 'categoryId' ) ).to.equal( 'id-category-3' );
					expect( uploadRequest.requestBody.has( 'file' ) ).to.equal( true );
				} );
		} );

		it( 'should take the first allowed category for a file not covered by the plugin configuration', () => {
			sinonXHR.respondWith( 'GET', CKBOX_API_URL + '/categories?limit=50&offset=0&workspaceId=workspace1', [
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

			sinonXHR.respondWith( 'POST', CKBOX_API_URL + '/assets?workspaceId=workspace1', [
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
					expect( data ).to.contain.property( 'ckboxImageId', 'image-1' );
					expect( data ).to.contain.property(
						'default',
						'https://ckbox.cloud/workspace1/assets/image-1/images/300.jpeg'
					);

					const uploadRequest = sinonXHR.requests[ 1 ];
					expect( uploadRequest.requestBody.get( 'categoryId' ) ).to.equal( 'id-category-2' );
					expect( uploadRequest.requestBody.has( 'file' ) ).to.equal( true );
				} );
		} );

		it( 'should resolve an object contains responsive URLs', () => {
			sinonXHR.respondWith( 'GET', CKBOX_API_URL + '/categories?limit=50&offset=0&workspaceId=workspace1', [
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

			sinonXHR.respondWith( 'POST', CKBOX_API_URL + '/assets?workspaceId=workspace1', [
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
					expect( data ).to.contain.property( 'sources' );
					expect( data.sources ).to.be.an( 'array' );
					expect( data.sources ).to.deep.equal( [
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
			sinonXHR.respondWith( 'GET', CKBOX_API_URL + '/categories?limit=50&offset=0&workspaceId=workspace1', [
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
					expect( adapter.controller.signal.aborted ).to.equal( true );
				} );

			loader.file.then( () => {
				adapter.abort();
			} );

			return promise;
		} );

		it( 'should throw an error on abort (while uploading)', () => {
			sinon.stub( ckboxUtils, 'getCategoryIdForFile' ).resolves( 'id-category-2' );

			sinonXHR.respondWith( 'POST', CKBOX_API_URL + '/assets?workspaceId=workspace1', xhr => {
				adapter.abort();

				xhr.error();
			} );

			return adapter.upload()
				.then( () => {
					throw new Error( 'Promise should throw.' );
				} )
				.catch( () => {
					expect( adapter.controller.signal.aborted ).to.equal( true );
				} );
		} );

		it( 'should throw an error on generic request error (while uploading)', () => {
			sinon.stub( console, 'error' );
			sinon.stub( ckboxUtils, 'getCategoryIdForFile' ).resolves( 'id-category-2' );

			sinonXHR.respondWith( 'POST', CKBOX_API_URL + '/assets?workspaceId=workspace1', xhr => {
				xhr.error();
			} );

			return adapter.upload()
				.then( () => {
					throw new Error( 'Promise should throw.' );
				} )
				.catch( msg => {
					expect( msg ).to.equal( 'Cannot upload file: image.jpg.' );
				} );
		} );

		it( 'abort should not throw before upload', () => {
			expect( () => {
				adapter.abort();
			} ).to.not.throw();
		} );

		it( 'should update progress', () => {
			sinon.stub( ckboxUtils, 'getCategoryIdForFile' ).resolves( 'id-category-2' );

			sinonXHR.respondWith( 'POST', CKBOX_API_URL + '/assets?workspaceId=workspace1', xhr => {
				xhr.uploadProgress( { loaded: 4, total: 10 } );

				expect( loader.uploadTotal ).to.equal( 10 );
				expect( loader.uploaded ).to.equal( 4 );

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

						sinonXHR.respondWith( 'GET', /\/categories/, [
							200,
							{ 'Content-Type': 'application/json' },
							JSON.stringify( {
								items: [
									{ name: 'Albums', id: 'id-category-1', extensions: [ 'jpg' ] }
								], offset: 0, limit: 50, totalCount: 1
							} )
						] );

						sinonXHR.respondWith( 'POST', /\/assets/, [
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
								const categoriesRequest = sinonXHR.requests[ 0 ];
								const uploadRequest = sinonXHR.requests[ 1 ];

								expect( categoriesRequest.url ).to.equal(
									CKBOX_API_URL + '/categories?limit=50&offset=0&workspaceId=' + workspaceId );
								expect( uploadRequest.url ).to.equal(
									CKBOX_API_URL + '/assets?workspaceId=' + workspaceId );
							} );
					} );
				}
			} );

			describe( 'defaultUploadWorkspaceId is defined', () => {
				it( 'should use the default workspace', async () => {
					TokenMock.initialToken = createToken( { auth: { ckbox: { workspaces: [ 'workspace1', 'workspace2' ] } } } );
					( await ckboxUtils._token ).refreshToken();

					sinonXHR.respondWith( 'GET', /\/categories/, [
						200,
						{ 'Content-Type': 'application/json' },
						JSON.stringify( {
							items: [
								{ name: 'Albums', id: 'id-category-1', extensions: [ 'jpg' ] }
							], offset: 0, limit: 50, totalCount: 1
						} )
					] );

					sinonXHR.respondWith( 'POST', /\/assets/, [
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
							const categoriesRequest = sinonXHR.requests[ 0 ];
							const uploadRequest = sinonXHR.requests[ 1 ];

							expect( categoriesRequest.url ).to.equal(
								CKBOX_API_URL + '/categories?limit=50&offset=0&workspaceId=workspace2' );
							expect( uploadRequest.url ).to.equal(
								CKBOX_API_URL + '/assets?workspaceId=workspace2' );
						} );
				} );

				it( 'should use the default workspace when the user is superadmin', async () => {
					TokenMock.initialToken = createToken( { auth: { ckbox: { role: 'superadmin' } } } );
					( await ckboxUtils._token ).refreshToken();

					sinonXHR.respondWith( 'GET', /\/categories/, [
						200,
						{ 'Content-Type': 'application/json' },
						JSON.stringify( {
							items: [
								{ name: 'Albums', id: 'id-category-1', extensions: [ 'jpg' ] }
							], offset: 0, limit: 50, totalCount: 1
						} )
					] );

					sinonXHR.respondWith( 'POST', /\/assets/, [
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
							const categoriesRequest = sinonXHR.requests[ 0 ];
							const uploadRequest = sinonXHR.requests[ 1 ];

							expect( categoriesRequest.url ).to.equal(
								CKBOX_API_URL + '/categories?limit=50&offset=0&workspaceId=workspace1' );
							expect( uploadRequest.url ).to.equal(
								CKBOX_API_URL + '/assets?workspaceId=workspace1' );
						} );
				} );

				it( 'should throw an error when default workspace is not listed in the token', async () => {
					sinon.stub( console, 'error' );

					TokenMock.initialToken = createToken( { auth: { ckbox: { workspaces: [ 'workspace1', 'workspace2' ] } } } );
					( await ckboxUtils._token ).refreshToken();

					sinonXHR.respondWith( 'GET', /\/categories/, [
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
							expect( console.error.callCount ).to.equal( 1 );
							expect( console.error.firstCall.args[ 0 ] ).to.match( /^ckbox-access-default-workspace-error/ );
							expect( err ).to.equal( 'Cannot access default workspace.' );
						} );
				} );
			} );
		} );
	} );

	describe( 'adding the "ckboxImageId" attribute to the uploaded asset', () => {
		let nativeReaderMock, loader, adapterMock;

		const imgPath = '/assets/sample.png';
		const file = createNativeFileMock();
		file.name = 'image.jpg';

		it( 'should add the "ckboxImageId" attribute to the uploaded image by default', async () => {
			sinon.stub( window, 'FileReader' ).callsFake( () => {
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
					expect( getData( editor.model ) ).to.equal(
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

			sinon.stub( window, 'FileReader' ).callsFake( () => {
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
					expect( getData( editor.model ) ).to.equal(
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
