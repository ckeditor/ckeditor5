/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals window, console, document, btoa */

import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor';
import Clipboard from '@ckeditor/ckeditor5-clipboard/src/clipboard';
import CloudServices from '@ckeditor/ckeditor5-cloud-services/src/cloudservices';
import Image from '@ckeditor/ckeditor5-image/src/image';
import ImageUploadEditing from '@ckeditor/ckeditor5-image/src/imageupload/imageuploadediting';
import ImageUploadProgress from '@ckeditor/ckeditor5-image/src/imageupload/imageuploadprogress';
import PictureEditing from '@ckeditor/ckeditor5-image/src/pictureediting';
import LinkEditing from '@ckeditor/ckeditor5-link/src/linkediting';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import FileRepository from '@ckeditor/ckeditor5-upload/src/filerepository';
import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import CKBoxEditing from '../src/ckboxediting';
import CKBoxUploadAdapter from '../src/ckboxuploadadapter';

import { createNativeFileMock, NativeFileReaderMock, UploadAdapterMock } from '@ckeditor/ckeditor5-upload/tests/_utils/mocks';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils';
import TokenMock from '@ckeditor/ckeditor5-cloud-services/tests/_utils/tokenmock';

import CloudServicesCoreMock from './_utils/cloudservicescoremock';

import { getData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';
import { IMAGE_SRC_FIXTURE } from '@ckeditor/ckeditor5-image/tests/imageresize/_utils/utils';

const BASE64_SAMPLE = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=';
const CKBOX_API_URL = 'https://upload.example.com';

describe( 'CKBoxUploadAdapter', () => {
	let editor, fileRepository, editorElement;

	const jwtToken = [
		// Header.
		'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9',
		// Payload.
		btoa( JSON.stringify( { aud: 'environment' } ) ),
		// Signature.
		'signature'
	].join( '.' );

	testUtils.createSinonSandbox();

	beforeEach( () => {
		editorElement = document.createElement( 'div' );
		document.body.appendChild( editorElement );

		TokenMock.initialToken = jwtToken;

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
		let adapter, loader, sinonXHR;

		beforeEach( () => {
			const file = createNativeFileMock();
			file.name = 'image.jpg';

			loader = fileRepository.createLoader( file );
			adapter = editor.plugins.get( FileRepository ).createUploadAdapter( loader );

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

			sinonXHR.respondWith( 'GET', CKBOX_API_URL + '/categories?limit=50&offset=0', xhr => {
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

			sinonXHR.respondWith( 'GET', CKBOX_API_URL + '/categories?limit=50&offset=0', [
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
			sinonXHR.respondWith( 'GET', CKBOX_API_URL + '/categories?limit=50&offset=0', [
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
			sinonXHR.respondWith( 'GET', CKBOX_API_URL + '/categories?limit=50&offset=0', [
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
			sinonXHR.respondWith( 'GET', CKBOX_API_URL + '/categories?limit=50&offset=0', [
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

			sinon.stub( adapter, '_getImageWidth' ).resolves( 300 );

			return adapter.upload()
				.then( () => {
					throw new Error( 'Expected to be rejected.' );
				}, err => {
					expect( err ).to.equal( 'Cannot determine a category for the uploaded file.' );
				} );
		} );

		it( 'should fetch all categories if API limits their results', () => {
			sinonXHR.respondWith( 'GET', CKBOX_API_URL + '/categories?limit=50&offset=0', [
				200,
				{ 'Content-Type': 'application/json' },
				JSON.stringify( {
					items: [], offset: 0, limit: 50, totalCount: 101
				} )
			] );
			sinonXHR.respondWith( 'GET', CKBOX_API_URL + '/categories?limit=50&offset=50', [
				200, { 'Content-Type': 'application/json' },
				JSON.stringify( {
					items: [], offset: 50, limit: 50, totalCount: 101
				} )
			] );
			sinonXHR.respondWith( 'GET', CKBOX_API_URL + '/categories?limit=50&offset=100', [
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
			sinonXHR.respondWith( 'GET', CKBOX_API_URL + '/categories?limit=50&offset=0', [
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

			sinonXHR.respondWith( 'POST', CKBOX_API_URL + '/assets', [
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

			sinon.stub( adapter, '_getImageWidth' ).resolves( 300 );
			sinon.stub( console, 'warn' );

			return adapter.upload()
				.then( () => {
					throw new Error( 'Expected to be rejected.' );
				}, err => {
					expect( err ).to.equal( 'Cannot upload file: image.jpg.' );
				} );
		} );

		it( 'should abort the upload if server results with an error while sending an image', () => {
			sinonXHR.respondWith( 'GET', CKBOX_API_URL + '/categories?limit=50&offset=0', [
				200,
				{ 'Content-Type': 'application/json' },
				JSON.stringify( {
					items: [
						{ name: 'category 1', id: 'id-category-1', extensions: [ 'webp', 'jpg' ] }
					], offset: 0, limit: 50, totalCount: 1
				} )
			] );

			sinonXHR.respondWith( 'POST', CKBOX_API_URL + '/assets', [
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
			sinonXHR.respondWith( 'GET', CKBOX_API_URL + '/categories?limit=50&offset=0', [
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

			sinonXHR.respondWith( 'POST', CKBOX_API_URL + '/assets', [
				201,
				{ 'Content-Type': 'application/json' },
				JSON.stringify( { id: 'image-1' } )
			] );

			// To cover the `Adapter#_getImageWidth()`.
			loader._reader._data = IMAGE_SRC_FIXTURE;

			return adapter.upload()
				.then( data => {
					expect( data ).to.contain.property( 'ckboxImageId', 'image-1' );
					expect( data ).to.contain.property(
						'default',
						'https://ckbox.cloud/environment/assets/image-1/images/100.jpeg'
					);

					const uploadRequest = sinonXHR.requests[ 1 ];
					expect( uploadRequest.requestBody.get( 'categoryId' ) ).to.equal( 'id-category-2' );
					expect( uploadRequest.requestBody.has( 'file' ) ).to.equal( true );
				} );
		} );

		it( 'should take the first category that allows uploading the file if provided configuration is empty', () => {
			sinonXHR.respondWith( 'GET', CKBOX_API_URL + '/categories?limit=50&offset=0', [
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

			sinonXHR.respondWith( 'POST', CKBOX_API_URL + '/assets', [
				201,
				{ 'Content-Type': 'application/json' },
				JSON.stringify( { id: 'image-1' } )
			] );

			// An integrator does not define supported extensions.
			editor.config.set( 'ckbox.defaultUploadCategories', {
				'id-category-1': []
			} );

			sinon.stub( adapter, '_getImageWidth' ).resolves( 300 );

			return adapter.upload()
				.then( data => {
					expect( data ).to.contain.property( 'ckboxImageId', 'image-1' );
					expect( data ).to.contain.property(
						'default',
						'https://ckbox.cloud/environment/assets/image-1/images/300.jpeg'
					);

					const uploadRequest = sinonXHR.requests[ 1 ];
					expect( uploadRequest.requestBody.get( 'categoryId' ) ).to.equal( 'id-category-1' );
					expect( uploadRequest.requestBody.has( 'file' ) ).to.equal( true );
				} );
		} );

		it( 'should take the first category matching with the configuration (category specified as a name)', () => {
			sinonXHR.respondWith( 'GET', CKBOX_API_URL + '/categories?limit=50&offset=0', [
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

			sinonXHR.respondWith( 'POST', CKBOX_API_URL + '/assets', [
				201,
				{ 'Content-Type': 'application/json' },
				JSON.stringify( { id: 'image-1' } )
			] );

			editor.config.set( 'ckbox.defaultUploadCategories', {
				'Albums (to print)': [ 'gif', 'jpg' ]
			} );

			sinon.stub( adapter, '_getImageWidth' ).resolves( 300 );

			return adapter.upload()
				.then( data => {
					expect( data ).to.contain.property( 'ckboxImageId', 'image-1' );
					expect( data ).to.contain.property(
						'default',
						'https://ckbox.cloud/environment/assets/image-1/images/300.jpeg'
					);

					const uploadRequest = sinonXHR.requests[ 1 ];
					expect( uploadRequest.requestBody.get( 'categoryId' ) ).to.equal( 'id-category-3' );
					expect( uploadRequest.requestBody.has( 'file' ) ).to.equal( true );
				} );
		} );

		it( 'should take the first category matching with the configuration (category specified as ID)', () => {
			sinonXHR.respondWith( 'GET', CKBOX_API_URL + '/categories?limit=50&offset=0', [
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

			sinonXHR.respondWith( 'POST', CKBOX_API_URL + '/assets', [
				201,
				{ 'Content-Type': 'application/json' },
				JSON.stringify( { id: 'image-1' } )
			] );

			editor.config.set( 'ckbox.defaultUploadCategories', {
				'id-category-3': [ 'gif', 'jpg' ]
			} );

			sinon.stub( adapter, '_getImageWidth' ).resolves( 300 );

			return adapter.upload()
				.then( data => {
					expect( data ).to.contain.property( 'ckboxImageId', 'image-1' );
					expect( data ).to.contain.property(
						'default',
						'https://ckbox.cloud/environment/assets/image-1/images/300.jpeg'
					);

					const uploadRequest = sinonXHR.requests[ 1 ];
					expect( uploadRequest.requestBody.get( 'categoryId' ) ).to.equal( 'id-category-3' );
					expect( uploadRequest.requestBody.has( 'file' ) ).to.equal( true );
				} );
		} );

		it( 'should take the first allowed category for a file not covered by the plugin configuration', () => {
			sinonXHR.respondWith( 'GET', CKBOX_API_URL + '/categories?limit=50&offset=0', [
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

			sinonXHR.respondWith( 'POST', CKBOX_API_URL + '/assets', [
				201,
				{ 'Content-Type': 'application/json' },
				JSON.stringify( { id: 'image-1' } )
			] );

			editor.config.set( 'ckbox.defaultUploadCategories', {
				'Albums (to print)': [ 'bmp' ]
			} );

			sinon.stub( adapter, '_getImageWidth' ).resolves( 300 );

			return adapter.upload()
				.then( data => {
					expect( data ).to.contain.property( 'ckboxImageId', 'image-1' );
					expect( data ).to.contain.property(
						'default',
						'https://ckbox.cloud/environment/assets/image-1/images/300.jpeg'
					);

					const uploadRequest = sinonXHR.requests[ 1 ];
					expect( uploadRequest.requestBody.get( 'categoryId' ) ).to.equal( 'id-category-2' );
					expect( uploadRequest.requestBody.has( 'file' ) ).to.equal( true );
				} );
		} );

		it( 'should resolve an object contains responsive URLs (breakpoint = 10% of the image width)', () => {
			sinonXHR.respondWith( 'GET', CKBOX_API_URL + '/categories?limit=50&offset=0', [
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

			sinonXHR.respondWith( 'POST', CKBOX_API_URL + '/assets', [
				201,
				{ 'Content-Type': 'application/json' },
				JSON.stringify( { id: 'image-1' } )
			] );

			sinon.stub( adapter, '_getImageWidth' ).resolves( 5000 );

			return adapter.upload()
				.then( data => {
					expect( data ).to.contain.property( 'sources' );
					expect( data.sources ).to.be.an( 'array' );
					expect( data.sources ).to.deep.equal( [
						{
							srcset: 'https://ckbox.cloud/environment/assets/image-1/images/500.webp 500w,' +
								'https://ckbox.cloud/environment/assets/image-1/images/1000.webp 1000w,' +
								'https://ckbox.cloud/environment/assets/image-1/images/1500.webp 1500w,' +
								'https://ckbox.cloud/environment/assets/image-1/images/2000.webp 2000w,' +
								'https://ckbox.cloud/environment/assets/image-1/images/2500.webp 2500w,' +
								'https://ckbox.cloud/environment/assets/image-1/images/3000.webp 3000w,' +
								'https://ckbox.cloud/environment/assets/image-1/images/3500.webp 3500w,' +
								'https://ckbox.cloud/environment/assets/image-1/images/4000.webp 4000w',
							sizes: '(max-width: 5000px) 100vw, 5000px',
							type: 'image/webp'
						}
					] );
				} );
		} );

		it( 'should resolve an object contains responsive URLs (breakpoint = 80px)', () => {
			sinonXHR.respondWith( 'GET', CKBOX_API_URL + '/categories?limit=50&offset=0', [
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

			sinonXHR.respondWith( 'POST', CKBOX_API_URL + '/assets', [
				201,
				{ 'Content-Type': 'application/json' },
				JSON.stringify( { id: 'image-1' } )
			] );

			sinon.stub( adapter, '_getImageWidth' ).resolves( 700 );

			return adapter.upload()
				.then( data => {
					expect( data ).to.contain.property( 'sources' );
					expect( data.sources ).to.be.an( 'array' );
					expect( data.sources ).to.deep.equal( [
						{
							srcset: 'https://ckbox.cloud/environment/assets/image-1/images/140.webp 140w,' +
								'https://ckbox.cloud/environment/assets/image-1/images/220.webp 220w,' +
								'https://ckbox.cloud/environment/assets/image-1/images/300.webp 300w,' +
								'https://ckbox.cloud/environment/assets/image-1/images/380.webp 380w,' +
								'https://ckbox.cloud/environment/assets/image-1/images/460.webp 460w,' +
								'https://ckbox.cloud/environment/assets/image-1/images/540.webp 540w,' +
								'https://ckbox.cloud/environment/assets/image-1/images/620.webp 620w,' +
								'https://ckbox.cloud/environment/assets/image-1/images/700.webp 700w',
							sizes: '(max-width: 700px) 100vw, 700px',
							type: 'image/webp'
						}
					] );
				} );
		} );

		it( 'should throw an error on abort (while fetching categories)', () => {
			sinonXHR.respondWith( 'GET', CKBOX_API_URL + '/categories?limit=50&offset=0', [
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
			sinon.stub( adapter, 'getCategoryIdForFile' ).resolves( 'id-category-2' );

			sinonXHR.respondWith( 'POST', CKBOX_API_URL + '/assets', xhr => {
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
			sinon.stub( adapter, 'getCategoryIdForFile' ).resolves( 'id-category-2' );

			sinonXHR.respondWith( 'POST', CKBOX_API_URL + '/assets', xhr => {
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
			sinon.stub( adapter, 'getCategoryIdForFile' ).resolves( 'id-category-2' );
			sinon.stub( adapter, '_getImageWidth' ).resolves( 700 );

			sinonXHR.respondWith( 'POST', CKBOX_API_URL + '/assets', xhr => {
				xhr.uploadProgress( { loaded: 4, total: 10 } );

				expect( loader.uploadTotal ).to.equal( 10 );
				expect( loader.uploaded ).to.equal( 4 );

				return xhr.respond(
					201,
					{ 'Content-Type': 'application/json' },
					JSON.stringify( { id: 'image-1' } )
				);
			} );

			return adapter.upload();
		} );

		it( 'should allow overriding the assets origin (`ckbox.assetsOrigin`)', () => {
			sinonXHR.respondWith( 'GET', CKBOX_API_URL + '/categories?limit=50&offset=0', [
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

			sinonXHR.respondWith( 'POST', CKBOX_API_URL + '/assets', [
				201,
				{ 'Content-Type': 'application/json' },
				JSON.stringify( { id: 'image-1' } )
			] );

			editor.config.set( 'ckbox.assetsOrigin', 'https://cloud.example.com' );
			const adapter = editor.plugins.get( FileRepository ).createUploadAdapter( loader );

			sinon.stub( adapter, '_getImageWidth' ).resolves( 5000 );

			return adapter.upload()
				.then( data => {
					expect( data ).to.contain.property( 'sources' );
					expect( data.sources ).to.be.an( 'array' );
					expect( data.sources ).to.deep.equal( [
						{
							srcset: 'https://cloud.example.com/environment/assets/image-1/images/500.webp 500w,' +
								'https://cloud.example.com/environment/assets/image-1/images/1000.webp 1000w,' +
								'https://cloud.example.com/environment/assets/image-1/images/1500.webp 1500w,' +
								'https://cloud.example.com/environment/assets/image-1/images/2000.webp 2000w,' +
								'https://cloud.example.com/environment/assets/image-1/images/2500.webp 2500w,' +
								'https://cloud.example.com/environment/assets/image-1/images/3000.webp 3000w,' +
								'https://cloud.example.com/environment/assets/image-1/images/3500.webp 3500w,' +
								'https://cloud.example.com/environment/assets/image-1/images/4000.webp 4000w',
							sizes: '(max-width: 5000px) 100vw, 5000px',
							type: 'image/webp'
						}
					] );
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
} );
