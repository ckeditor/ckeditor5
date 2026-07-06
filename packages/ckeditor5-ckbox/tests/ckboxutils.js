/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Paragraph } from '@ckeditor/ckeditor5-paragraph';
import { LinkEditing, LinkImageEditing } from '@ckeditor/ckeditor5-link';
import {
	PictureEditing,
	ImageUploadEditing,
	ImageUploadProgress,
	ImageBlockEditing,
	ImageInlineEditing,
	ImageCaptionEditing,
	Image
} from '@ckeditor/ckeditor5-image';
import { CloudServices, Token } from '@ckeditor/ckeditor5-cloud-services';
import { VirtualTestEditor } from '@ckeditor/ckeditor5-core/tests/_utils/virtualtesteditor.js';
import { createFakeXHRServer } from '@ckeditor/ckeditor5-core/tests/_utils/fakexhrserver.js';
import { CloudServicesCoreMock } from './_utils/cloudservicescoremock.js';

import { CKBoxEditing } from '../src/ckboxediting.js';
import { CKBoxUploadAdapter } from '../src/ckboxuploadadapter.js';
import { TokenMock } from '@ckeditor/ckeditor5-cloud-services/tests/_utils/tokenmock.js';
import { CKBoxUtils } from '../src/ckboxutils.js';
import { ClassicTestEditor } from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor.js';

const CKBOX_API_URL = 'https://upload.example.com';

describe( 'CKBoxUtils', () => {
	let editor, ckboxUtils, originalCKBox;
	const token = createToken( { auth: { ckbox: { workspaces: [ 'workspace1' ] } } } );

	let fetchStub;

	beforeEach( async () => {
		TokenMock.initialToken = token;
		fetchStub = vi.spyOn( window, 'fetch' ).mockResolvedValue();

		// `CKBoxEditing#init()` fires an unawaited upload permission request. Stub the network layer out so
		// the request does not end up as an unhandled rejection that fails the Vitest run. Tests exercising
		// HTTP requests replace `window.XMLHttpRequest` with a fake server, so they are not affected.
		vi.spyOn( window.XMLHttpRequest.prototype, 'send' ).mockImplementation( () => {} );

		originalCKBox = window.CKBox;
		window.CKBox = {};

		editor = await createTestEditor( {
			ckbox: {
				tokenUrl: 'http://cs.example.com',
				serviceOrigin: CKBOX_API_URL
			}
		} );

		ckboxUtils = editor.plugins.get( CKBoxUtils );
	} );

	afterEach( async () => {
		window.CKBox = originalCKBox;

		await editor.destroy();
	} );

	it( 'should have proper name', () => {
		expect( CKBoxUtils.pluginName ).toEqual( 'CKBoxUtils' );
	} );

	it( 'should have `isOfficialPlugin` static flag set to `true`', () => {
		expect( CKBoxUtils.isOfficialPlugin ).toBe( true );
	} );

	it( 'should have `isPremiumPlugin` static flag set to `false`', () => {
		expect( CKBoxUtils.isPremiumPlugin ).toBe( false );
	} );

	it( 'should be loaded', () => {
		expect( ckboxUtils ).toBeInstanceOf( CKBoxUtils );
	} );

	describe( 'getToken()', () => {
		it( 'should return an instance of token', async () => {
			expect( await ckboxUtils.getToken() ).toBeInstanceOf( Token );
		} );
	} );

	describe( '_authorizePrivateCategoriesAccess', () => {
		it( 'should be called when retrieving a token', async () => {
			await editor.destroy();

			const authorizeSpy = vi.spyOn( CKBoxUtils.prototype, '_authorizePrivateCategoriesAccess' );

			editor = await createTestEditor( {
				ckbox: {
					tokenUrl: 'http://cs.example.com',
					serviceOrigin: CKBOX_API_URL
				}
			} );

			expect( authorizeSpy ).toHaveBeenCalledTimes( 1 );
			expect( authorizeSpy.mock.calls[ 0 ][ 0 ] ).toEqual( token );

			authorizeSpy.mockRestore();
		} );

		it( 'should make a fetch request with correct headers', async () => {
			fetchStub.mockClear();

			await ckboxUtils._authorizePrivateCategoriesAccess( 'test-token' );

			expect( fetchStub ).toHaveBeenCalledTimes( 1 );

			const url = fetchStub.mock.calls[ 0 ][ 0 ];
			const options = fetchStub.mock.calls[ 0 ][ 1 ];

			expect( url ).toEqual( `${ CKBOX_API_URL }/categories/authorizePrivateAccess` );
			expect( options.method ).toEqual( 'POST' );
			expect( options.credentials ).toEqual( 'include' );
			expect( options.mode ).toEqual( 'no-cors' );
		} );

		it( 'should make a fetch request with proper form data', async () => {
			const testToken = 'example-token';

			fetchStub.mockRestore();
			fetchStub = vi.spyOn( window, 'fetch' ).mockImplementation( ( url, options ) => {
				const formData = options.body;

				expect( formData ).toBeInstanceOf( FormData );
				expect( formData.get( 'token' ) ).toEqual( testToken );

				return Promise.resolve();
			} );

			await ckboxUtils._authorizePrivateCategoriesAccess( testToken );

			expect( fetchStub ).toHaveBeenCalledTimes( 1 );
			expect( fetchStub.mock.calls[ 0 ][ 0 ] ).toEqual( `${ CKBOX_API_URL }/categories/authorizePrivateAccess` );
		} );
	} );

	describe( 'init()', () => {
		it( 'should not block initialization of plugin while fetching token', async () => {
			const defer = createDefer();
			const slowToken = createToken( { auth: { ckbox: { workspaces: [ 'workspace1' ] } } } );

			await editor.destroy();

			vi.spyOn( CloudServices.prototype, 'registerTokenUrl' ).mockImplementation( async () => {
				await defer.promise;
				return slowToken;
			} );

			editor = await VirtualTestEditor.create( {
				plugins: [
					ImageBlockEditing,
					ImageInlineEditing,
					ImageCaptionEditing,
					LinkEditing,
					LinkImageEditing,
					PictureEditing,
					ImageUploadEditing,
					ImageUploadProgress,
					CloudServices,
					CKBoxUploadAdapter,
					CKBoxEditing
				],
				substitutePlugins: [
					CloudServicesCoreMock
				],
				ckbox: {
					tokenUrl: 'http://cs.example.com',
					serviceOrigin: CKBOX_API_URL
				}
			} );

			ckboxUtils = editor.plugins.get( CKBoxUtils );
			expect( ckboxUtils.getToken() ).toBeInstanceOf( Promise );

			defer.resolve();
			expect( await ckboxUtils.getToken() ).toEqual( slowToken );
		} );
	} );

	describe( 'fetching token', () => {
		it( 'should create an instance of Token class which is ready to use (specified ckbox.tokenUrl)', async () => {
			const resolvedToken = await ckboxUtils.getToken();

			expect( resolvedToken ).toBeInstanceOf( Token );
			expect( resolvedToken.value ).toEqual( token );
			expect( editor.plugins.get( 'CloudServicesCore' ).tokenUrl ).toEqual( 'http://cs.example.com' );
		} );

		it( 'should not create a new token if already created (specified cloudServices.tokenUrl)', async () => {
			const editorElement = document.createElement( 'div' );
			document.body.appendChild( editorElement );

			const editor = await ClassicTestEditor
				.create( editorElement, {
					plugins: [
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
					},
					ckbox: {
						serviceOrigin: CKBOX_API_URL
					}
				} );

			const ckboxUtils = editor.plugins.get( CKBoxUtils );
			const resolvedToken = await ckboxUtils.getToken();

			expect( resolvedToken ).toBeInstanceOf( Token );
			expect( resolvedToken.value ).toEqual( token );
			expect( editor.plugins.get( 'CloudServicesCore' ).tokenUrl ).toEqual( 'http://cs.example.com' );

			editorElement.remove();
			return editor.destroy();
		} );

		it( 'should create a new token when passed "ckbox.tokenUrl" and "cloudServices.tokenUrl" values are different', async () => {
			const editorElement = document.createElement( 'div' );
			document.body.appendChild( editorElement );

			const editor = await ClassicTestEditor
				.create( editorElement, {
					plugins: [
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
					},
					ckbox: {
						tokenUrl: 'http://ckbox.example.com',
						serviceOrigin: CKBOX_API_URL
					}
				} );

			const ckboxUtils = editor.plugins.get( CKBoxUtils );
			const resolvedToken = await ckboxUtils.getToken();

			expect( resolvedToken ).toBeInstanceOf( Token );
			expect( resolvedToken.value ).toEqual( token );
			expect( editor.plugins.get( 'CloudServicesCore' ).tokenUrl ).toEqual( 'http://ckbox.example.com' );

			editorElement.remove();
			return editor.destroy();
		} );

		it( 'should not create a new token when passed "ckbox.tokenUrl" and "cloudServices.tokenUrl" values are equal', async () => {
			const editorElement = document.createElement( 'div' );
			document.body.appendChild( editorElement );

			const editor = await ClassicTestEditor
				.create( editorElement, {
					plugins: [
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
						tokenUrl: 'http://example.com'
					},
					ckbox: {
						tokenUrl: 'http://example.com',
						serviceOrigin: CKBOX_API_URL
					}
				} );

			const ckboxUtils = editor.plugins.get( CKBoxUtils );
			const resolvedToken = await ckboxUtils.getToken();

			expect( resolvedToken ).toBeInstanceOf( Token );
			expect( resolvedToken.value ).toEqual( token );
			expect( editor.plugins.get( 'CloudServicesCore' ).tokenUrl ).toEqual( 'http://example.com' );

			editorElement.remove();
			return editor.destroy();
		} );
	} );

	describe( 'config', () => {
		it( 'should set default values', async () => {
			const editor = await createTestEditor( {
				language: 'pl',
				cloudServices: {
					tokenUrl: 'http://cs.example.com'
				}
			} );

			expect( editor.config.get( 'ckbox' ) ).toEqual( {
				serviceOrigin: 'https://api.ckbox.io',
				defaultUploadCategories: null,
				ignoreDataId: false,
				language: 'pl',
				theme: 'lark',
				tokenUrl: 'http://cs.example.com'
			} );

			await editor.destroy();
		} );

		it( 'should set default values if CKBox lib is missing but `config.ckbox` is set', async () => {
			delete window.CKBox;

			const editor = await createTestEditor( {
				ckbox: {
					tokenUrl: 'http://cs.example.com'
				}
			} );

			expect( editor.config.get( 'ckbox' ) ).toEqual( {
				serviceOrigin: 'https://api.ckbox.io',
				defaultUploadCategories: null,
				ignoreDataId: false,
				language: 'en',
				theme: 'lark',
				tokenUrl: 'http://cs.example.com'
			} );

			await editor.destroy();
		} );

		it( 'should not set default values if CKBox lib and `config.ckbox` are missing', async () => {
			delete window.CKBox;

			const editor = await createTestEditor( {
				cloudServices: {
					tokenUrl: 'http://cs.example.com'
				}
			} );

			expect( editor.config.get( 'ckbox' ) ).toBeUndefined();

			await editor.destroy();
		} );

		it( 'should prefer own language configuration over the one from the editor locale', async () => {
			const editor = await createTestEditor( {
				language: 'pl',
				cloudServices: {
					tokenUrl: 'http://cs.example.com'
				},
				ckbox: {
					language: 'de'
				}
			} );

			expect( editor.config.get( 'ckbox' ).language ).toEqual( 'de' );

			await editor.destroy();
		} );

		it( 'should prefer own "tokenUrl" configuration over the one from the "cloudServices"', async () => {
			const editor = await createTestEditor( {
				language: 'pl',
				cloudServices: {
					tokenUrl: 'http://cs.example.com'
				},
				ckbox: {
					tokenUrl: 'bar'
				}
			} );

			expect( editor.config.get( 'ckbox' ).tokenUrl ).toEqual( 'bar' );

			await editor.destroy();
		} );

		it( 'should set "theme" value based on `config.ckbox.theme`', async () => {
			const editor = await createTestEditor( {
				ckbox: {
					theme: 'newTheme',
					tokenUrl: 'http://cs.example.com'
				}
			} );

			expect( editor.config.get( 'ckbox' ).theme ).toEqual( 'newTheme' );

			await editor.destroy();
		} );

		it( 'should throw if the "tokenUrl" is not provided', async () => {
			await createTestEditor()
				.then(
					() => {
						throw new Error( 'Expected to be rejected' );
					},
					error => {
						expect( error.message ).toMatch( /ckbox-plugin-missing-token-url/ );
					}
				);
		} );

		it( 'should log an error if there is no image feature loaded in the editor', async () => {
			const consoleErrorStub = vi.spyOn( console, 'error' ).mockImplementation( () => {} );

			const editor = await createTestEditor( {
				plugins: [
					Paragraph,
					ImageCaptionEditing,
					LinkEditing,
					LinkImageEditing,
					PictureEditing,
					ImageUploadEditing,
					ImageUploadProgress,
					CloudServices,
					CKBoxUploadAdapter,
					CKBoxEditing
				],
				ckbox: {
					tokenUrl: 'http://cs.example.com'
				}
			} );

			expect( consoleErrorStub ).toHaveBeenCalledTimes( 1 );
			expect( consoleErrorStub.mock.calls[ 0 ][ 0 ] ).toEqual( 'ckbox-plugin-image-feature-missing' );
			expect( consoleErrorStub.mock.calls[ 0 ][ 1 ] ).toEqual( editor );

			await editor.destroy();
		} );
	} );

	describe( 'getCategoryIdForFile', () => {
		const file = { name: 'image.jpg' };
		const url = 'https://example.com/image';
		const options = { signal: new AbortController().signal };

		beforeEach( () => {
			fetchStub.mockReset();
			fetchStub.mockResolvedValue( new Response( null, { headers: { 'content-type': 'image/jpeg' } } ) );
		} );

		it( 'should pass abort signal to other calls (file)', async () => {
			const getCategoriesStub = vi.spyOn( ckboxUtils, '_getAvailableCategories' ).mockResolvedValue( [
				{ name: 'category 1', id: 'id-category-1', extensions: [ 'png' ] },
				{ name: 'category 2', id: 'id-category-2', extensions: [ 'webp', 'jpg' ] },
				{ name: 'category 3', id: 'id-category-3', extensions: [ 'gif', 'jpg' ] }
			] );

			await ckboxUtils.getCategoryIdForFile( file, options );

			expect( getCategoriesStub.mock.calls[ 0 ][ 0 ].signal ).toEqual( options.signal );
		} );

		it( 'should pass abort signal to other calls (url)', async () => {
			const getCategoriesStub = vi.spyOn( ckboxUtils, '_getAvailableCategories' ).mockResolvedValue( [
				{ name: 'category 1', id: 'id-category-1', extensions: [ 'png' ] },
				{ name: 'category 2', id: 'id-category-2', extensions: [ 'webp', 'jpg' ] },
				{ name: 'category 3', id: 'id-category-3', extensions: [ 'gif', 'jpg' ] }
			] );

			await ckboxUtils.getCategoryIdForFile( url, options );

			expect( getCategoriesStub.mock.calls[ 0 ][ 0 ].signal ).toEqual( options.signal );
			expect( fetchStub.mock.calls[ 0 ][ 1 ].signal ).toEqual( options.signal );
		} );

		it( 'should return the first category if many of them accepts a jpg file', async () => {
			vi.spyOn( ckboxUtils, '_getAvailableCategories' ).mockResolvedValue( [
				{ name: 'category 1', id: 'id-category-1', extensions: [ 'png' ] },
				{ name: 'category 2', id: 'id-category-2', extensions: [ 'webp', 'jpg' ] },
				{ name: 'category 3', id: 'id-category-3', extensions: [ 'gif', 'jpg' ] }
			] );

			const fileResult = await ckboxUtils.getCategoryIdForFile( file, options );
			const urlResult = await ckboxUtils.getCategoryIdForFile( url, options );

			expect( fileResult ).toEqual( 'id-category-2' );
			expect( urlResult ).toEqual( 'id-category-2' );
		} );

		it( 'should return the first category if many of them accepts a jpg file (uppercase file extension)', async () => {
			vi.spyOn( ckboxUtils, '_getAvailableCategories' ).mockResolvedValue( [
				{ name: 'category 1', id: 'id-category-1', extensions: [ 'png' ] },
				{ name: 'category 2', id: 'id-category-2', extensions: [ 'webp', 'jpg' ] },
				{ name: 'category 3', id: 'id-category-3', extensions: [ 'gif', 'jpg' ] }
			] );
			const fileResult = await ckboxUtils.getCategoryIdForFile( { name: 'image.JPG' }, options );

			expect( fileResult ).toEqual( 'id-category-2' );
		} );

		it( 'should return the first category if many of them accepts a JPG file', async () => {
			vi.spyOn( ckboxUtils, '_getAvailableCategories' ).mockResolvedValue( [
				{ name: 'category 1', id: 'id-category-1', extensions: [ 'PNG' ] },
				{ name: 'category 2', id: 'id-category-2', extensions: [ 'WEBP', 'JPG' ] },
				{ name: 'category 3', id: 'id-category-3', extensions: [ 'GIF', 'JPG' ] }
			] );

			const fileResult = await ckboxUtils.getCategoryIdForFile( file, options );
			const urlResult = await ckboxUtils.getCategoryIdForFile( url, options );

			expect( fileResult ).toEqual( 'id-category-2' );
			expect( urlResult ).toEqual( 'id-category-2' );
		} );

		it( 'should return the first category that allows uploading the file if provided configuration is empty', async () => {
			vi.spyOn( ckboxUtils, '_getAvailableCategories' ).mockResolvedValue( [
				{ name: 'category 1', id: 'id-category-1', extensions: [ 'png', 'jpg' ] },
				{ name: 'category 2', id: 'id-category-2', extensions: [ 'webp' ] },
				{ name: 'category 3', id: 'id-category-3', extensions: [ 'gif' ] }
			] );

			// An integrator does not define supported extensions.
			editor.config.set( 'ckbox.defaultUploadCategories', {
				'id-category-1': []
			} );

			const fileResult = await ckboxUtils.getCategoryIdForFile( file, options );
			const urlResult = await ckboxUtils.getCategoryIdForFile( url, options );

			expect( fileResult ).toEqual( 'id-category-1' );
			expect( urlResult ).toEqual( 'id-category-1' );
		} );

		it( 'should return the first category matching with the configuration (category specified as a name)', async () => {
			vi.spyOn( ckboxUtils, '_getAvailableCategories' ).mockResolvedValue( [
				{ name: 'Covers', id: 'id-category-1', extensions: [ 'png' ] },
				{ name: 'Albums', id: 'id-category-2', extensions: [ 'webp', 'jpg' ] },
				{ name: 'Albums (to print)', id: 'id-category-3', extensions: [ 'gif', 'jpg' ] }
			] );

			editor.config.set( 'ckbox.defaultUploadCategories', {
				'Albums (to print)': [ 'gif', 'jpg' ]
			} );

			const fileResult = await ckboxUtils.getCategoryIdForFile( file, options );
			const urlResult = await ckboxUtils.getCategoryIdForFile( url, options );

			expect( fileResult ).toEqual( 'id-category-3' );
			expect( urlResult ).toEqual( 'id-category-3' );
		} );

		it( 'should return the first category matching with the configuration (category specified as ID)', async () => {
			vi.spyOn( ckboxUtils, '_getAvailableCategories' ).mockResolvedValue( [
				{ name: 'Covers', id: 'id-category-1', extensions: [ 'png' ] },
				{ name: 'Albums', id: 'id-category-2', extensions: [ 'webp', 'jpg' ] },
				{ name: 'Albums (to print)', id: 'id-category-3', extensions: [ 'gif', 'jpg' ] }
			] );

			editor.config.set( 'ckbox.defaultUploadCategories', {
				'id-category-3': [ 'gif', 'jpg' ]
			} );

			const fileResult = await ckboxUtils.getCategoryIdForFile( file, options );
			const urlResult = await ckboxUtils.getCategoryIdForFile( url, options );

			expect( fileResult ).toEqual( 'id-category-3' );
			expect( urlResult ).toEqual( 'id-category-3' );
		} );

		it( 'should return the first category matching with the configuration (uppercase file extension)', async () => {
			vi.spyOn( ckboxUtils, '_getAvailableCategories' ).mockResolvedValue( [
				{ name: 'Covers', id: 'id-category-1', extensions: [ 'png' ] },
				{ name: 'Albums', id: 'id-category-2', extensions: [ 'webp', 'jpg' ] },
				{ name: 'Albums (to print)', id: 'id-category-3', extensions: [ 'gif', 'jpg' ] }
			] );

			editor.config.set( 'ckbox.defaultUploadCategories', {
				'id-category-3': [ 'gif', 'jpg' ]
			} );

			const fileResult = await ckboxUtils.getCategoryIdForFile( { name: 'image.JPG' }, options );

			expect( fileResult ).toEqual( 'id-category-3' );
		} );

		it( 'should return the first category matching with the configuration (uppercase configuration)', async () => {
			vi.spyOn( ckboxUtils, '_getAvailableCategories' ).mockResolvedValue( [
				{ name: 'Covers', id: 'id-category-1', extensions: [ 'png' ] },
				{ name: 'Albums', id: 'id-category-2', extensions: [ 'webp', 'jpg' ] },
				{ name: 'Albums (to print)', id: 'id-category-3', extensions: [ 'gif', 'jpg' ] }
			] );

			editor.config.set( 'ckbox.defaultUploadCategories', {
				'id-category-3': [ 'GIF', 'JPG' ]
			} );

			const fileResult = await ckboxUtils.getCategoryIdForFile( file, options );
			const urlResult = await ckboxUtils.getCategoryIdForFile( url, options );

			expect( fileResult ).toEqual( 'id-category-3' );
			expect( urlResult ).toEqual( 'id-category-3' );
		} );

		it( 'should return the first allowed category for a file not covered by the plugin configuration', async () => {
			vi.spyOn( ckboxUtils, '_getAvailableCategories' ).mockResolvedValue( [
				{ name: 'Covers', id: 'id-category-1', extensions: [ 'png' ] },
				{ name: 'Albums', id: 'id-category-2', extensions: [ 'webp', 'jpg' ] },
				{ name: 'Albums (to print)', id: 'id-category-3', extensions: [ 'gif', 'jpg' ] }
			] );

			editor.config.set( 'ckbox.defaultUploadCategories', {
				'Albums (to print)': [ 'bmp' ]
			} );

			const fileResult = await ckboxUtils.getCategoryIdForFile( file, options );
			const urlResult = await ckboxUtils.getCategoryIdForFile( url, options );

			expect( fileResult ).toEqual( 'id-category-2' );
			expect( urlResult ).toEqual( 'id-category-2' );
		} );

		it( 'should fail when no category accepts a jpg file', async () => {
			vi.spyOn( ckboxUtils, '_getAvailableCategories' ).mockResolvedValue( [
				{ name: 'category 1', extensions: [ 'png' ] },
				{ name: 'category 2', extensions: [ 'webp' ] },
				{ name: 'category 3', extensions: [ 'gif' ] }
			] );

			const fileResult = await ckboxUtils.getCategoryIdForFile( file, options ).then(
				() => { throw new Error( 'Expected to be rejected.' ); },
				err => err
			);
			const urlResult = await ckboxUtils.getCategoryIdForFile( url, options ).then(
				() => { throw new Error( 'Expected to be rejected.' ); },
				err => err
			);

			expect( fileResult ).toEqual( 'Cannot determine a category for the uploaded file.' );
			expect( urlResult ).toEqual( 'Cannot determine a category for the uploaded file.' );
		} );

		it( 'should fail when cannot load categories', async () => {
			vi.spyOn( ckboxUtils, '_getAvailableCategories' ).mockResolvedValue( undefined );

			const fileResult = await ckboxUtils.getCategoryIdForFile( file, options ).then(
				() => { throw new Error( 'Expected to be rejected.' ); },
				err => err
			);
			const urlResult = await ckboxUtils.getCategoryIdForFile( url, options ).then(
				() => { throw new Error( 'Expected to be rejected.' ); },
				err => err
			);

			expect( fileResult ).toEqual( 'Cannot determine a category for the uploaded file.' );
			expect( urlResult ).toEqual( 'Cannot determine a category for the uploaded file.' );
		} );
	} );

	describe( '_getAvailableCategories', () => {
		let fakeXHRServer;
		const options = { signal: new AbortController().signal };

		beforeEach( () => {
			fakeXHRServer = createFakeXHRServer();
		} );

		afterEach( () => {
			fakeXHRServer.restore();
		} );

		// See: https://github.com/ckeditor/ckeditor5/issues/16040
		it( 'should not use `Number#toString()` method due to minification issues on some bundlers', async () => {
			const categories = createCategories( 10 );
			const toStringSpy = vi.spyOn( Number.prototype, 'toString' );

			fakeXHRServer.respondWith( 'GET', CKBOX_API_URL + '/categories?limit=50&offset=0&workspaceId=workspace1', [
				200,
				{ 'Content-Type': 'application/json' },
				JSON.stringify( {
					items: categories, offset: 0, limit: 50, totalCount: 10
				} )
			] );

			await ckboxUtils._getAvailableCategories( options );

			expect( toStringSpy ).not.toHaveBeenCalled();
		} );

		it( 'should return categories in one call', async () => {
			const categories = createCategories( 10 );

			fakeXHRServer.respondWith( 'GET', CKBOX_API_URL + '/categories?limit=50&offset=0&workspaceId=workspace1', [
				200,
				{ 'Content-Type': 'application/json' },
				JSON.stringify( {
					items: categories, offset: 0, limit: 50, totalCount: 10
				} )
			] );

			const result = await ckboxUtils._getAvailableCategories( options );

			expect( result ).toEqual( categories );
		} );

		it( 'should return categories in three calls', async () => {
			const categories = createCategories( 120 );

			fakeXHRServer.respondWith( 'GET', CKBOX_API_URL + '/categories?limit=50&offset=0&workspaceId=workspace1', [
				200,
				{ 'Content-Type': 'application/json' },
				JSON.stringify( {
					items: categories.slice( 0, 50 ), offset: 0, limit: 50, totalCount: 120
				} )
			] );

			fakeXHRServer.respondWith( 'GET', CKBOX_API_URL + '/categories?limit=50&offset=50&workspaceId=workspace1', [
				200,
				{ 'Content-Type': 'application/json' },
				JSON.stringify( {
					items: categories.slice( 50, 100 ), offset: 50, limit: 50, totalCount: 120
				} )
			] );

			fakeXHRServer.respondWith( 'GET', CKBOX_API_URL + '/categories?limit=50&offset=100&workspaceId=workspace1', [
				200,
				{ 'Content-Type': 'application/json' },
				JSON.stringify( {
					items: categories.slice( 100 ), offset: 100, limit: 50, totalCount: 120
				} )
			] );

			const result = await ckboxUtils._getAvailableCategories( options );

			expect( result ).toEqual( categories );
		} );

		it( 'should return undefined if first request fails', async () => {
			const consoleStub = vi.spyOn( console, 'error' ).mockImplementation( () => {} );

			fakeXHRServer.respondWith( 'GET', CKBOX_API_URL + '/categories?limit=50&offset=0&workspaceId=workspace1', xhr => xhr.error() );

			const result = await ckboxUtils._getAvailableCategories( options );

			expect( result ).toBeUndefined();
			expect( consoleStub.mock.calls[ 0 ][ 0 ] ).toMatch( /^ckbox-fetch-category-http-error/ );
		} );

		it( 'should return undefined if third request fails', async () => {
			const consoleStub = vi.spyOn( console, 'error' ).mockImplementation( () => {} );

			const categories = createCategories( 120 );

			fakeXHRServer.respondWith( 'GET', CKBOX_API_URL + '/categories?limit=50&offset=0&workspaceId=workspace1', [
				200,
				{ 'Content-Type': 'application/json' },
				JSON.stringify( {
					items: categories.slice( 0, 50 ), offset: 0, limit: 50, totalCount: 120
				} )
			] );

			fakeXHRServer.respondWith( 'GET', CKBOX_API_URL + '/categories?limit=50&offset=50&workspaceId=workspace1', [
				200,
				{ 'Content-Type': 'application/json' },
				JSON.stringify( {
					items: categories.slice( 50, 100 ), offset: 50, limit: 50, totalCount: 120
				} )
			] );

			fakeXHRServer.respondWith(
				'GET', CKBOX_API_URL + '/categories?limit=50&offset=100&workspaceId=workspace1', xhr => xhr.error()
			);

			const result = await ckboxUtils._getAvailableCategories( options );

			expect( result ).toBeUndefined();
			expect( consoleStub.mock.calls[ 0 ][ 0 ] ).toMatch( /^ckbox-fetch-category-http-error/ );
		} );

		function createCategories( count ) {
			const result = [];
			let i = 0;

			while ( count > 0 ) {
				result.push( {
					name: 'Category ' + i,
					id: 'id-category-' + i,
					extensions: [ 'png' ]
				} );

				i++;
				count--;
			}

			return result;
		}
	} );
} );

function createTestEditor( config = {} ) {
	return VirtualTestEditor.create( {
		plugins: [
			Paragraph,
			ImageBlockEditing,
			ImageInlineEditing,
			ImageCaptionEditing,
			LinkEditing,
			LinkImageEditing,
			PictureEditing,
			ImageUploadEditing,
			ImageUploadProgress,
			CloudServices,
			CKBoxUploadAdapter,
			CKBoxEditing
		],
		substitutePlugins: [
			CloudServicesCoreMock
		],
		...config
	} );
}

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

function createDefer() {
	const deferred = {
		resolve: ( ) => {},
		promise: Promise.resolve( null )
	};

	deferred.promise = new Promise( resolve => {
		deferred.resolve = resolve;
	} );

	return deferred;
}
