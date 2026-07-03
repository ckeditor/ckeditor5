/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { global } from '@ckeditor/ckeditor5-utils';
import { Command, PendingActions } from '@ckeditor/ckeditor5-core';
import { ClassicTestEditor } from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor.js';
import { Paragraph } from '@ckeditor/ckeditor5-paragraph';
import { Heading } from '@ckeditor/ckeditor5-heading';
import { Essentials } from '@ckeditor/ckeditor5-essentials';
import { Image, PictureEditing, ImageUploadEditing, ImageUploadProgress } from '@ckeditor/ckeditor5-image';
import { CloudServices } from '@ckeditor/ckeditor5-cloud-services';
import { LinkEditing } from '@ckeditor/ckeditor5-link';
import { _setModelData, _getModelData, _getViewData } from '@ckeditor/ckeditor5-engine';
import { Notification } from '@ckeditor/ckeditor5-ui';
import { TokenMock } from '@ckeditor/ckeditor5-cloud-services/tests/_utils/tokenmock.js';
import { isEqual as isEqualMock } from 'es-toolkit/compat';

vi.mock( 'es-toolkit/compat', async importOriginal => {
	const actual = await importOriginal();
	const isEqualFn = vi.fn( actual.isEqual );
	// Expose the original so tests can restore behavior after `mockReturnValue` overrides.
	isEqualFn.__originalIsEqual = actual.isEqual;
	return {
		...actual,
		isEqual: isEqualFn
	};
} );
import { CloudServicesCoreMock } from '../_utils/cloudservicescoremock.js';
import { CKBoxEditing } from '../../src/ckboxediting.js';
import { CKBoxImageEditEditing } from '../../src/ckboximageedit/ckboximageeditediting.js';

import { blurHashToDataUrl } from '../../src/utils.js';
import { CKBoxUtils } from '../../src/ckboxutils.js';

const CKBOX_API_URL = 'https://upload.example.com';

describe( 'CKBoxImageEditCommand', () => {
	let editor, domElement, command, model, dataMock, dataWithBlurHashMock;

	beforeEach( async () => {
		TokenMock.initialToken = [
			// Header.
			'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9',
			// Payload.
			btoa( JSON.stringify( { auth: { ckbox: { workspaces: [ 'workspace1' ] } } } ) ),
			// Signature.
			'signature'
		].join( '.' );

		// `CKBoxEditing#init()` fires an unawaited upload permission request. Stub the network layer out so
		// the request does not end up as an unhandled rejection that fails the Vitest run. Tests exercising
		// HTTP requests replace `window.XMLHttpRequest` with a fake server, so they are not affected.
		vi.spyOn( window.XMLHttpRequest.prototype, 'send' ).mockImplementation( () => {} );
		vi.spyOn( CKBoxUtils.prototype, '_authorizePrivateCategoriesAccess' ).mockResolvedValue();

		domElement = global.document.createElement( 'div' );
		global.document.body.appendChild( domElement );

		window.CKBox = {
			mountImageEditor: vi.fn()
		};

		editor = await ClassicTestEditor.create( domElement, {
			plugins: [
				Paragraph,
				Heading,
				Image,
				CloudServices,
				Essentials,
				LinkEditing,
				PictureEditing,
				ImageUploadEditing,
				ImageUploadProgress,
				CKBoxEditing,
				CKBoxImageEditEditing
			],
			ckbox: {
				serviceOrigin: CKBOX_API_URL,
				tokenUrl: 'foo',
				allowExternalImagesEditing: () => true
			},
			substitutePlugins: [
				CloudServicesCoreMock
			]
		} );

		command = editor.commands.get( 'ckboxImageEdit' );
		command.isEnabled = true;
		model = editor.model;

		dataMock = {
			data: {
				id: 'image-id1',
				extension: 'png',
				metadata: {
					width: 100,
					height: 100
				},
				name: 'image1',
				imageUrls: {
					100: 'https://example.com/workspace1/assets/image-id1/images/100.webp',
					default: 'https://example.com/workspace1/assets/image-id1/images/100.png'
				},
				url: 'https://example.com/workspace1/assets/image-id1/file'
			}
		};

		dataWithBlurHashMock = {
			data: {
				id: 'image-id1',
				extension: 'png',
				metadata: {
					width: 100,
					height: 100,
					blurHash: 'KTF55N=ZR4PXSirp5ZOZW9'
				},
				name: 'image1',
				imageUrls: {
					100: 'https://example.com/workspace1/assets/image-id1/images/100.webp',
					default: 'https://example.com/workspace1/assets/image-id1/images/100.png'
				},
				url: 'https://example.com/workspace1/assets/image-id1/file'
			}
		};
	} );

	afterEach( async () => {
		window.CKBox = null;
		domElement.remove();

		if ( global.document.querySelector( '.ck.ckbox-wrapper' ) ) {
			global.document.querySelector( '.ck.ckbox-wrapper' ).remove();
		}

		await editor.destroy();

		vi.restoreAllMocks();
		// Restore the real isEqual implementation (mock is preserved by `vi.mock`).
		vi.mocked( isEqualMock ).mockImplementation( isEqualMock.__originalIsEqual );
		vi.mocked( isEqualMock ).mockClear();
	} );

	describe( 'constructor', () => {
		it( 'should be a command instance', () => {
			expect( command ).toBeInstanceOf( Command );
		} );

		it( 'should set "#value" property to false', () => {
			expect( command.value ).toBe( false );
		} );
	} );

	describe( 'execute', () => {
		it( 'should open CKBox image editor', async () => {
			_setModelData( model, '[<imageBlock alt="alt text" ckboxImageId="example-id" src="/sample.png"></imageBlock>]' );
			command.execute();

			await tick();

			expect( window.CKBox.mountImageEditor ).toHaveBeenCalledTimes( 1 );
			expect( window.CKBox.mountImageEditor.mock.calls[ 0 ][ 1 ] ).toHaveProperty( 'assetId', 'example-id' );
		} );

		describe( 'mount image editor options', () => {
			let mountImageEditor;

			beforeEach( () => {
				_setModelData( model, '[<imageBlock alt="alt text" ckboxImageId="example-id" src="/sample.png"></imageBlock>]' );

				mountImageEditor = window.CKBox.mountImageEditor;
			} );

			it( 'should forward ckbox language configuration to mountImageEditor', async () => {
				editor.config.set( 'ckbox.language', 'fr' );
				command.execute();

				await tick();

				expect( mountImageEditor ).toHaveBeenCalledTimes( 1 );
				expect( mountImageEditor.mock.calls[ 0 ][ 1 ] ).toHaveProperty( 'language', 'fr' );
			} );

			it( 'should forward tokenUrl configuration to mountImageEditor', async () => {
				editor.config.set( 'ckbox.tokenUrl', 'https://example.com/token' );
				command.execute();

				await tick();

				expect( mountImageEditor ).toHaveBeenCalledTimes( 1 );
				expect( mountImageEditor.mock.calls[ 0 ][ 1 ] ).toHaveProperty( 'tokenUrl', 'https://example.com/token' );
			} );

			it( 'should forward serviceOrigin configuration to mountImageEditor', async () => {
				editor.config.set( 'ckbox.serviceOrigin', 'https://example.com' );
				command.execute();

				await tick();

				expect( mountImageEditor ).toHaveBeenCalledTimes( 1 );
				expect( mountImageEditor.mock.calls[ 0 ][ 1 ] ).toHaveProperty( 'serviceOrigin', 'https://example.com' );
			} );
		} );

		function tick() {
			return new Promise( resolve => setTimeout( resolve, 0 ) );
		}
	} );

	describe( 'save edited image logic', () => {
		describe( 'opening dialog', () => {
			beforeEach( () => {
				vi.useFakeTimers( { now: Date.now() } );
			} );

			afterEach( async () => {
				// Flush any pending debounced/abortable promises started by `command.execute()` calls
				// in this block so their rejections settle while the editor is still alive.
				// Otherwise they surface as unhandled rejections during later tests and pollute
				// the global `console.error` spy in browser mode.
				await vi.runAllTimersAsync();
				vi.useRealTimers();
			} );

			it( 'should create a wrapper if it is not yet created and mount it in the document body', () => {
				_setModelData( model, '[<imageBlock alt="alt text" ckboxImageId="example-id" src="/sample.png"></imageBlock>]' );
				command.execute();

				const wrapper = command._wrapper;

				expect( wrapper.nodeName ).toEqual( 'DIV' );
				expect( wrapper.className ).toEqual( 'ck ckbox-wrapper' );
			} );

			it( 'should create and mount a wrapper only once', () => {
				_setModelData( model, '[<imageBlock alt="alt text" ckboxImageId="example-id" src="/sample.png"></imageBlock>]' );
				command.execute();

				const wrapper1 = command._wrapper;

				command.execute();

				const wrapper2 = command._wrapper;

				command.execute();

				const wrapper3 = command._wrapper;

				expect( wrapper1 ).toEqual( wrapper2 );
				expect( wrapper2 ).toEqual( wrapper3 );
			} );

			it( 'should not create a wrapper if the command is disabled', () => {
				command.isEnabled = false;
				command.execute();

				expect( command._wrapper ).toEqual( null );
			} );

			it( 'should not create a wrapper if the wrapper is already created', () => {
				const wrapper = global.document.createElement( 'p' );

				command._wrapper = wrapper;
				command.execute();

				expect( command._wrapper ).toEqual( wrapper );
			} );

			it( 'should open the CKBox Image Editor dialog instance only once', async () => {
				_setModelData( model, '[<imageBlock alt="alt text" ckboxImageId="example-id" src="/sample.png"></imageBlock>]' );

				command.execute();
				command.execute();
				command.execute();

				await vi.advanceTimersByTimeAsync( 0 );

				expect( window.CKBox.mountImageEditor ).toHaveBeenCalledTimes( 1 );
			} );

			it( 'should prepare options for the CKBox Image Editing dialog instance (ckbox image)', async () => {
				const ckboxImageId = 'example-id';

				_setModelData( model,
					`[<imageBlock alt="alt text" ckboxImageId="${ ckboxImageId }" src="/sample.png"></imageBlock>]`
				);

				const imageElement = editor.model.document.selection.getSelectedElement();

				const options = await command._prepareOptions( {
					element: imageElement,
					controller: new AbortController()
				} );

				expect( options ).toHaveProperty( 'assetId', ckboxImageId );
				expect( options ).toHaveProperty( 'serviceOrigin', CKBOX_API_URL );
				expect( options ).toHaveProperty( 'tokenUrl', 'foo' );
				expect( options.imageEditing.allowOverwrite ).toBe( false );
				expect( options.onSave ).toBeTypeOf( 'function' );
				expect( options.onClose ).toBeTypeOf( 'function' );
			} );

			it( 'should prepare options for the CKBox Image Editing dialog instance (external image)', async () => {
				const imageUrl = 'https://example.com/assets/sample.png';
				const categoryId = 'id-category-1';

				vi.spyOn( editor.plugins.get( 'CKBoxUtils' ), 'getCategoryIdForFile' ).mockResolvedValue( categoryId );

				_setModelData( model,
					`[<imageBlock alt="alt text" src="${ imageUrl }"></imageBlock>]`
				);

				const imageElement = editor.model.document.selection.getSelectedElement();

				const options = await command._prepareOptions( {
					element: imageElement,
					controller: new AbortController()
				} );

				expect( options ).not.toHaveProperty( 'assetId' );
				expect( options ).toHaveProperty( 'imageUrl', imageUrl );
				expect( options ).toHaveProperty( 'uploadCategoryId', categoryId );
				expect( options ).toHaveProperty( 'tokenUrl', 'foo' );
				expect( options.imageEditing.allowOverwrite ).toBe( false );
				expect( options.onSave ).toBeTypeOf( 'function' );
				expect( options.onClose ).toBeTypeOf( 'function' );
			} );

			it( 'should prepare options for the CKBox Image Editing dialog instance (external image with relative URL)', async () => {
				const imageUrl = 'assets/sample.png';
				const categoryId = 'id-category-1';
				const origin = window.location.origin;

				vi.spyOn( editor.plugins.get( 'CKBoxUtils' ), 'getCategoryIdForFile' ).mockResolvedValue( categoryId );

				_setModelData( model,
					`[<imageBlock alt="alt text" src="${ imageUrl }"></imageBlock>]`
				);

				const imageElement = editor.model.document.selection.getSelectedElement();

				const options = await command._prepareOptions( {
					element: imageElement,
					controller: new AbortController()
				} );

				expect( options ).not.toHaveProperty( 'assetId' );
				expect( options ).toHaveProperty( 'imageUrl', `${ origin }/${ imageUrl }` );
				expect( options ).toHaveProperty( 'uploadCategoryId', categoryId );
				expect( options ).toHaveProperty( 'tokenUrl', 'foo' );
				expect( options.imageEditing.allowOverwrite ).toBe( false );
				expect( options.onSave ).toBeTypeOf( 'function' );
				expect( options.onClose ).toBeTypeOf( 'function' );
			} );

			it( 'should handle error when preparing options', async () => {
				const notification = editor.plugins.get( Notification );
				const notificationStub = vi.spyOn( notification, 'showWarning' ).mockImplementation( () => {} );
				const consoleStub = vi.spyOn( console, 'error' ).mockImplementation( () => {} );
				const reason = 'getCategoryIdForFile behavied very badly.';

				vi.spyOn( editor.plugins.get( 'CKBoxUtils' ), 'getCategoryIdForFile' ).mockReturnValue( Promise.reject( reason ) );

				_setModelData( model,
					'[<imageBlock alt="alt text" src="https://example.com/assets/sample.png"></imageBlock>]'
				);

				command.execute();

				await vi.advanceTimersByTimeAsync( 0 );

				// Ignore Vitest browser-mode forwarding of cross-file unhandled rejections,
				// which surface as PromiseRejectionEvent objects on the shared `console.error`.
				const productionCalls = consoleStub.mock.calls.filter(
					call => !( call[ 0 ] instanceof PromiseRejectionEvent )
				);

				expect( command._wrapper ).toBeNull();
				expect( productionCalls ).toHaveLength( 1 );
				expect( productionCalls[ 0 ][ 0 ] ).toEqual( reason );
				expect( notificationStub ).toHaveBeenCalledTimes( 1 );
			} );
		} );

		describe( 'closing dialog', () => {
			it( 'should remove the wrapper after closing the CKBox Image Editor dialog', async () => {
				const ckboxImageId = 'example-id';

				_setModelData( model,
					`[<imageBlock alt="alt text" ckboxImageId="${ ckboxImageId }" src="/sample.png"></imageBlock>]`
				);

				const imageElement = editor.model.document.selection.getSelectedElement();

				const options = await command._prepareOptions( {
					element: imageElement,
					controller: new AbortController()
				} );

				command.execute();

				expect( command._wrapper ).not.toEqual( null );

				const spy = vi.spyOn( command._wrapper, 'remove' );

				options.onClose();

				expect( spy ).toHaveBeenCalledTimes( 1 );
				expect( command._wrapper ).toEqual( null );
			} );

			it( 'should focus view after closing the CKBox Image Editor dialog', async () => {
				const ckboxImageId = 'example-id';

				_setModelData( model,
					`[<imageBlock alt="alt text" ckboxImageId="${ ckboxImageId }" src="/sample.png"></imageBlock>]`
				);

				const imageElement = editor.model.document.selection.getSelectedElement();

				const options = await command._prepareOptions( {
					element: imageElement,
					ckboxImageId,
					controller: new AbortController()
				} );

				const focusSpy = vi.spyOn( editor.editing.view, 'focus' );

				command.execute();

				options.onClose();

				expect( focusSpy ).toHaveBeenCalledTimes( 1 );
			} );

			it( 'should refresh the command after closing the CKBox Image Editor dialog', async () => {
				const ckboxImageId = 'example-id';

				_setModelData( model,
					`[<imageBlock alt="alt text" ckboxImageId="${ ckboxImageId }" src="/sample.png"></imageBlock>]`
				);

				const imageElement = editor.model.document.selection.getSelectedElement();

				const options = await command._prepareOptions( {
					element: imageElement,
					ckboxImageId,
					controller: new AbortController()
				} );

				const refreshSpy = vi.spyOn( command, 'refresh' );

				expect( command.value ).toBe( false );

				command.execute();
				expect( command.value ).toBe( true );

				options.onClose();
				expect( command.value ).toBe( false );
				expect( refreshSpy ).toHaveBeenCalledTimes( 1 );
			} );

			it( 'should update ui after closing the CKBox Image Editor dialog', async () => {
				const ckboxImageId = 'example-id';
				vi.useFakeTimers();

				_setModelData( model,
					`[<imageBlock alt="alt text" ckboxImageId="${ ckboxImageId }" src="/sample.png"></imageBlock>]`
				);

				const imageElement = editor.model.document.selection.getSelectedElement();

				const options = await command._prepareOptions( {
					element: imageElement,
					ckboxImageId,
					controller: new AbortController()
				} );

				const updateUISpy = vi.spyOn( editor.ui, 'update' );

				expect( command.value ).toBe( false );

				command.execute();
				expect( command.value ).toBe( true );

				options.onClose();

				await vi.advanceTimersByTimeAsync( 10 );

				expect( command.value ).toBe( false );
				expect( updateUISpy ).toHaveBeenCalledTimes( 1 );
				vi.useRealTimers();
			} );

			it( 'should clear timer on editor destroy', async () => {
				const ckboxImageId = 'example-id';

				_setModelData( model,
					`[<imageBlock alt="alt text" ckboxImageId="${ ckboxImageId }" src="/sample.png"></imageBlock>]`
				);

				const imageElement = editor.model.document.selection.getSelectedElement();

				const options = await command._prepareOptions( {
					element: imageElement,
					ckboxImageId,
					controller: new AbortController()
				} );

				const clearTimeoutSpy = vi.spyOn( command._updateUiDelayed, 'cancel' );

				editor.fire( 'ready' );

				expect( command.value ).toBe( false );

				command.execute();

				options.onClose();

				command.destroy();
				expect( clearTimeoutSpy ).toHaveBeenCalledTimes( 2 );

				expect( command.value ).toBe( false );
			} );
		} );

		describe( 'saving edited asset', () => {
			let options, fakeXHRServer, jwtToken;

			beforeEach( async () => {
				const ckboxImageId = 'example-id';

				_setModelData( model,
					`[<imageBlock alt="alt text" height="50" ckboxImageId="${ ckboxImageId }"\
					src="/sample.png" width="50"></imageBlock>]`
				);

				const imageElement = editor.model.document.selection.getSelectedElement();

				jwtToken = createToken( { auth: { ckbox: { workspaces: [ 'workspace1' ] } } } );
				options = await command._prepareOptions( {
					element: imageElement,
					ckboxImageId,
					controller: new AbortController()
				} );
				fakeXHRServer = createFakeXHRServer();
			} );

			afterEach( () => {
				fakeXHRServer.restore();
				vi.useRealTimers();
			} );

			it( 'should poll data for edited image and if success status, save it', async () => {
				vi.useFakeTimers();

				fakeXHRServer.respondWith( 'GET', CKBOX_API_URL + '/assets/image-id1', xhr => {
					return xhr.error();
				} );

				command.on( 'ckboxImageEditor:processed', () => {
					expect( _getModelData( model ) ).toEqual(
						'[<imageBlock alt="" ckboxImageId="image-id1" height="100" sources="[object Object]"' +
							' src="https://example.com/workspace1/assets/image-id1/images/100.png" width="100">' +
						'</imageBlock>]'
					);
				} );

				options.onSave( dataMock );

				await vi.advanceTimersByTimeAsync( 1500 );
			} );

			it( 'should abort when image was removed while processing on server', async () => {
				vi.useFakeTimers();

				fakeXHRServer.respondWith( 'GET', CKBOX_API_URL + '/assets/image-id1', [
					200,
					{ 'Content-Type': 'application/json' },
					JSON.stringify( {
						metadata: {
							metadataProcessingStatus: 'queued'
						}
					} )
				] );

				options.onSave( dataMock );

				await vi.advanceTimersByTimeAsync( 100 );

				const selection = model.document.selection;

				model.deleteContent( selection );

				fakeXHRServer.respondWith( 'GET', CKBOX_API_URL + '/assets/image-id1', [
					200,
					{ 'Content-Type': 'application/json' },
					JSON.stringify( {
						metadata: {
							metadataProcessingStatus: 'success'
						}
					} )
				] );

				await vi.advanceTimersByTimeAsync( 1000 );

				expect( _getModelData( model ) ).toEqual( '<paragraph>[]</paragraph>' );
			} );

			it( 'should display notification in case fail', async () => {
				const notification = editor.plugins.get( Notification );
				vi.useFakeTimers();
				const spy = vi.spyOn( notification, 'showWarning' ).mockImplementation( () => {} );

				fakeXHRServer.respondWith( 'GET', CKBOX_API_URL + '/assets/image-id1', [
					500,
					{ 'Content-Type': 'application/json' },
					JSON.stringify( {
						metadata: {
							metadataProcessingStatus: 'queued'
						}
					} )
				] );

				options.onSave( dataMock );

				await vi.advanceTimersByTimeAsync( 20000 );

				expect( spy ).toHaveBeenCalledTimes( 1 );
			} );

			it( 'should log error in case runtime error in asynchronous code', async () => {
				const notification = editor.plugins.get( Notification );
				vi.useFakeTimers();
				const spy = vi.spyOn( notification, 'showWarning' ).mockImplementation( () => {} );
				const consoleStub = vi.spyOn( console, 'error' ).mockImplementation( () => {} );

				vi.spyOn( command, '_getAssetStatusFromServer' ).mockImplementation( () => {
					throw new Error( 'unhandled' );
				} );

				options.onSave( dataMock );

				await vi.advanceTimersByTimeAsync( 20000 );

				// Ignore Vitest browser-mode forwarding of cross-file unhandled rejections,
				// which surface as `PromiseRejectionEvent` objects on the shared `console.error`.
				const productionCalls = consoleStub.mock.calls.filter(
					call => !( call[ 0 ] instanceof PromiseRejectionEvent )
				);

				expect( spy ).not.toHaveBeenCalled();
				expect( productionCalls ).toHaveLength( 1 );
			} );

			it( 'should disable command for images being processed', async () => {
				vi.useFakeTimers();

				vi.mocked( isEqualMock ).mockReturnValue( true );

				fakeXHRServer.respondWith( 'GET', CKBOX_API_URL + '/assets/image-id1', [
					500,
					{ 'Content-Type': 'application/json' },
					JSON.stringify( {
						metadata: {
							metadataProcessingStatus: 'queued'
						}
					} )
				] );

				expect( command.isEnabled ).toBe( true );

				options.onSave( dataMock );

				await vi.advanceTimersByTimeAsync( 10 );

				expect( command.isEnabled ).toBe( false );
			} );

			it( 'should abort on CKBoxImageEditCommand destroy', async () => {
				vi.useFakeTimers();
				const spy = vi.spyOn( editor.editing, 'reconvertItem' );

				fakeXHRServer.respondWith( 'GET', CKBOX_API_URL + '/assets/image-id1', [
					500,
					{ 'Content-Type': 'application/json' },
					JSON.stringify( {
						metadata: {
							metadataProcessingStatus: 'queued'
						}
					} )
				] );

				options.onSave( dataMock );

				await vi.advanceTimersByTimeAsync( 10 );

				command.destroy();

				await vi.advanceTimersByTimeAsync( 10 );

				expect( spy ).toHaveBeenCalledTimes( 1 );
			} );

			it( 'should not display notification error on editor destroy', async () => {
				const notification = editor.plugins.get( Notification );
				vi.useFakeTimers();
				const spy = vi.spyOn( notification, 'showWarning' );

				fakeXHRServer.respondWith( 'GET', CKBOX_API_URL + '/assets/image-id1', [
					500,
					{ 'Content-Type': 'application/json' },
					JSON.stringify( {
						metadata: {
							metadataProcessingStatus: 'queued'
						}
					} )
				] );

				options.onSave( dataMock );

				await vi.advanceTimersByTimeAsync( 10 );

				command.destroy();

				await vi.advanceTimersByTimeAsync( 10 );

				expect( spy ).not.toHaveBeenCalled();
			} );

			it( 'should display notification error if server fail or didnt respond', async () => {
				const notification = editor.plugins.get( Notification );
				vi.useFakeTimers();
				const spy = vi.spyOn( notification, 'showWarning' ).mockImplementation( () => {} );

				fakeXHRServer.respondWith( 'GET', CKBOX_API_URL + '/assets/image-id1', xhr => {
					return xhr.error();
				} );

				options.onSave( dataMock );

				await vi.advanceTimersByTimeAsync( 20000 );

				expect( spy ).toHaveBeenCalledTimes( 1 );
			} );

			it( 'should reconvert image if server respond with "error" status', async () => {
				vi.useFakeTimers();
				const spy = vi.spyOn( editor.editing, 'reconvertItem' );
				const notification = editor.plugins.get( Notification );

				vi.spyOn( notification, 'showWarning' ).mockImplementation( () => {} );

				fakeXHRServer.respondWith( 'GET', CKBOX_API_URL + '/assets/image-id1', [
					500,
					{ 'Content-Type': 'application/json' },
					JSON.stringify( {
						metadata: {
							metadataProcessingStatus: 'error'
						}
					} )
				] );

				options.onSave( dataMock );

				await vi.advanceTimersByTimeAsync( 20000 );

				expect( spy ).toHaveBeenCalledTimes( 1 );
			} );

			it( 'should stop polling if limit was reached', async () => {
				vi.useFakeTimers();

				fakeXHRServer.respondWith( 'GET', CKBOX_API_URL + '/assets/image-id1', [
					200,
					{ 'Content-Type': 'application/json' },
					JSON.stringify( {
						metadata: {
							metadataProcessingStatus: 'queued'
						}
					} )
				] );

				options.onSave( dataMock );

				await vi.advanceTimersByTimeAsync( 15000 );

				expect( fakeXHRServer.requests ).toHaveLength( 4 );
			} );

			it( 'should add a pending action after a change and remove after server response', async () => {
				const pendingActions = editor.plugins.get( PendingActions );

				vi.useFakeTimers();

				const dataMock2 = {
					data: {
						id: 'image-id2',
						extension: 'png',
						metadata: {
							width: 100,
							height: 100
						},
						name: 'image2',
						imageUrls: {
							100: 'https://example.com/workspace1/assets/image-id2/images/100.webp',
							default: 'https://example.com/workspace1/assets/image-id2/images/100.png'
						},
						url: 'https://example.com/workspace1/assets/image-id2/file'
					}
				};

				expect( pendingActions._actions.length ).toEqual( 0 );

				fakeXHRServer.respondWith( 'GET', CKBOX_API_URL + '/assets/image-id1', [
					200,
					{ 'Content-Type': 'application/json' },
					JSON.stringify( {
						metadata: {
							metadataProcessingStatus: 'queued'
						}
					} )
				] );

				options.onSave( dataMock );

				expect( pendingActions.hasAny ).toBe( true );
				expect( pendingActions._actions.length ).toEqual( 1 );
				expect( pendingActions.first.message ).toEqual( 'Processing the edited image.' );

				await vi.advanceTimersByTimeAsync( 1000 );

				options.onSave( dataMock2 );

				expect( pendingActions.hasAny ).toBe( true );
				expect( pendingActions._actions.length ).toEqual( 2 );
				expect( pendingActions.first.message ).toEqual( 'Processing the edited image.' );
				expect( pendingActions._actions.get( 1 ).message ).toEqual( 'Processing the edited image.' );

				fakeXHRServer.respondWith( 'GET', CKBOX_API_URL + '/assets/image-id1', [
					200,
					{ 'Content-Type': 'application/json' },
					JSON.stringify( {
						metadata: {
							metadataProcessingStatus: 'success'
						},
						imageUrls: {
							100: 'https://example.com/workspace1/assets/image-id2/images/100.webp',
							default: 'https://example.com/workspace1/assets/image-id2/images/100.png'
						}
					} )
				] );

				await vi.advanceTimersByTimeAsync( 10000 );

				expect( pendingActions.hasAny ).toBe( false );
				expect( pendingActions._actions.length ).toEqual( 0 );
			} );

			it( 'should reject if fetching asset\'s status ended with the authorization error', () => {
				fakeXHRServer.respondWith( 'GET', CKBOX_API_URL + '/assets/image-id1', [
					401,
					{ 'Content-Type': 'application/json' },
					JSON.stringify( { message: 'Invalid token.', statusCode: 401 } )
				] );

				return command._getAssetStatusFromServer( dataMock )
					.then( res => {
						expect( res.message ).toEqual( 'Invalid token.' );
						throw new Error( 'Expected to be rejected.' );
					}, () => {
						expect( fakeXHRServer.requests[ 0 ].requestHeaders ).toBeInstanceOf( Object );
						expect( fakeXHRServer.requests[ 0 ].requestHeaders ).toHaveProperty( 'Authorization', jwtToken );
						expect( fakeXHRServer.requests[ 0 ].requestHeaders ).toHaveProperty( 'CKBox-Version', 'CKEditor 5' );
					} );
			} );

			it( 'should keep caption after image replace', () => {
				editor.model.schema.register( 'caption', {
					allowIn: 'imageBlock',
					allowContentOf: '$block',
					isLimit: true
				} );

				editor.conversion.elementToElement( {
					view: 'caption',
					model: 'caption'
				} );

				_setModelData( model, '[<imageBlock ' +
						'alt="alt text" ckboxImageId="example-id" height="50" src="/sample.png" width="50">' +
							'<caption>' +
								'caption' +
							'</caption>' +
					'</imageBlock>]' );

				const imageElement = editor.model.document.selection.getSelectedElement();

				command._replaceImage( imageElement, dataMock );

				expect( _getModelData( model ) ).toEqual(
					'[<imageBlock ' +
						'alt="alt text" ' +
						'ckboxImageId="image-id1" ' +
						'height="100" ' +
						'sources="[object Object]" ' +
						'src="https://example.com/workspace1/assets/image-id1/images/100.png" ' +
						'width="100">' +
							'<caption>' +
								'caption' +
							'</caption>' +
					'</imageBlock>]'
				);
			} );

			it( 'should not replace image with saved one before it is processed', () => {
				const modelData =
					'[<imageBlock ' +
						'alt="alt text" ckboxImageId="example-id" height="50" src="/sample.png" ' +
						'tempServerAssetId="image-id1" width="50">' +
					'</imageBlock>]';

				_setModelData( model, modelData );

				command.execute();

				expect( _getModelData( model ) ).toEqual( modelData );
			} );

			it( 'should replace inline image with saved one after it is processed', () => {
				_setModelData( model, '<paragraph>[<imageInline ' +
						'alt="alt text" ckboxImageId="example-id" height="50" src="/sample.png" width="50">' +
					'</imageInline>]</paragraph>' );

				const imageElement = editor.model.document.selection.getSelectedElement();

				command._replaceImage( imageElement, dataMock );

				expect( _getModelData( model ) ).toEqual(
					'<paragraph>[<imageInline ' +
						'alt="alt text" ' +
						'ckboxImageId="image-id1" ' +
						'height="100" ' +
						'sources="[object Object]" ' +
						'src="https://example.com/workspace1/assets/image-id1/images/100.png" ' +
						'width="100">' +
					'</imageInline>]</paragraph>'
				);
			} );

			it( 'should replace image with saved one after it is processed', () => {
				_setModelData( model, '[<imageBlock ' +
						'alt="alt text" ckboxImageId="example-id" height="50" src="/sample.png" width="50">' +
					'</imageBlock>]' );

				const imageElement = editor.model.document.selection.getSelectedElement();

				command._replaceImage( imageElement, dataMock );

				expect( _getModelData( model ) ).toEqual(
					'[<imageBlock ' +
						'alt="alt text" ' +
						'ckboxImageId="image-id1" ' +
						'height="100" ' +
						'sources="[object Object]" ' +
						'src="https://example.com/workspace1/assets/image-id1/images/100.png" ' +
						'width="100">' +
					'</imageBlock>]'
				);
			} );

			it( 'should not be alt attribute if there is no one in the original image', () => {
				_setModelData( model, '[<imageBlock ' +
						'ckboxImageId="example-id" height="50" src="/sample.png" width="50">' +
					'</imageBlock>]' );

				const imageElement = editor.model.document.selection.getSelectedElement();

				command._replaceImage( imageElement, dataMock );

				expect( _getModelData( model ) ).toEqual(
					'[<imageBlock ' +
						'ckboxImageId="image-id1" ' +
						'height="100" ' +
						'sources="[object Object]" ' +
						'src="https://example.com/workspace1/assets/image-id1/images/100.png" ' +
						'width="100">' +
					'</imageBlock>]'
				);
			} );

			it( 'should replace image with saved one (with blurHash placeholder) after it is processed', () => {
				const placeholder = blurHashToDataUrl( dataWithBlurHashMock.data.metadata.blurHash );

				_setModelData( model, '[<imageBlock ' +
						'alt="alt text" ckboxImageId="example-id" height="50" src="/sample.png" width="50">' +
					'</imageBlock>]' );

				const imageElement = editor.model.document.selection.getSelectedElement();

				command._replaceImage( imageElement, dataWithBlurHashMock );

				expect( _getModelData( model ) ).toEqual(
					'[<imageBlock ' +
						'alt="alt text" ' +
						'ckboxImageId="image-id1" ' +
						'height="100" ' +
						'placeholder="' + placeholder + '" ' +
						'sources="[object Object]" ' +
						'src="https://example.com/workspace1/assets/image-id1/images/100.png" ' +
						'width="100">' +
					'</imageBlock>]'
				);
			} );

			it( 'should change <img> size attributes and add `image-processing` CSS class ' +
				'while waiting for the processed image', async () => {
				expect( _getViewData( editor.editing.view, { withoutSelection: true } ) ).toEqual(
					'<figure class="ck-widget ck-widget_selected image" contenteditable="false" data-ckbox-resource-id="example-id">' +
						'<img alt="alt text" height="50" loading="lazy" src="/sample.png" style="aspect-ratio:50/50" width="50">' +
						'</img>' +
						'<div class="ck ck-reset_all ck-widget__type-around"></div>' +
					'</figure>'
				);

				options.onSave( dataMock );

				expect( _getViewData( editor.editing.view, { withoutSelection: true } ) ).toEqual(
					'<figure class="ck-widget ck-widget_selected image image-processing" ' +
						'contenteditable="false" data-ckbox-resource-id="example-id">' +
						'<img alt="alt text" height="100" loading="lazy" src="/sample.png" ' +
							'style="height:100px;width:100px" width="100">' +
						'</img>' +
						'<div class="ck ck-reset_all ck-widget__type-around"></div>' +
					'</figure>'
				);
			} );
		} );
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

// Minimal fake XHR server used in this file:
// - `respondWith( method, url, [ status, headers, body ] )` — register a deferred response.
// - `respondWith( method, url, xhr => { ... } )` — register a callback response.
//   The callback receives the request and may call `xhr.error()`.
// - `requests` — array of issued requests (tracked from `open()`).
// - `restore()` — revert the `XMLHttpRequest` global.
//
// Responses fire on the next macrotask (via `setTimeout( 0 )`) so the requesting
// code can finish attaching its listeners first. The latest matching `respondWith`
// entry wins, so callers can override earlier ones mid-test.
function createFakeXHRServer() {
	const responses = [];
	const requests = [];
	const OriginalXMLHttpRequest = window.XMLHttpRequest;

	class FakeXMLHttpRequest {
		constructor() {
			this.listeners = new Map();
			this.requestHeaders = {};
			this.upload = {
				addEventListener: () => {},
				removeEventListener: () => {}
			};
			this.status = 0;
			this.response = null;
			this.responseText = '';
			this.responseType = '';
			this.aborted = false;
			this._sent = false;
		}

		open( method, url ) {
			this.method = method;
			this.url = url;

			if ( !requests.includes( this ) ) {
				requests.push( this );
			}
		}

		setRequestHeader( name, value ) {
			this.requestHeaders[ name ] = value;
		}

		addEventListener( event, callback ) {
			const callbacks = this.listeners.get( event ) || [];
			callbacks.push( callback );
			this.listeners.set( event, callbacks );
		}

		removeEventListener( event, callback ) {
			const callbacks = this.listeners.get( event ) || [];
			const index = callbacks.indexOf( callback );

			if ( index !== -1 ) {
				callbacks.splice( index, 1 );
			}
		}

		abort() {
			this.aborted = true;
			this._dispatchEvent( 'abort' );
		}

		send() {
			this._sent = true;
			this._dispatchEvent( 'loadstart' );

			// Defer the response so the requesting code can finish attaching its listeners first.
			window.setTimeout( () => {
				if ( this.aborted ) {
					return;
				}

				// Find the latest matching response (so callers can override earlier ones).
				let match;
				for ( let i = responses.length - 1; i >= 0; i-- ) {
					const entry = responses[ i ];
					if ( entry.method === this.method && entry.url === this.url ) {
						match = entry;
						break;
					}
				}

				if ( !match ) {
					this.status = 404;
					this._dispatchEvent( 'load' );
					this._dispatchEvent( 'loadend' );
					return;
				}

				if ( typeof match.response === 'function' ) {
					match.response( this );
					return;
				}

				const [ status, headers, body ] = match.response;

				this.status = status;
				this.responseHeaders = headers;
				this.responseText = body;
				this.response = this.responseType === 'json' ? JSON.parse( body ) : body;

				this._dispatchEvent( 'load' );
				this._dispatchEvent( 'loadend' );
			}, 10 );
		}

		error() {
			this._dispatchEvent( 'error' );
			this._dispatchEvent( 'loadend' );
		}

		_dispatchEvent( event, data ) {
			for ( const callback of this.listeners.get( event ) || [] ) {
				callback( data );
			}
		}
	}

	window.XMLHttpRequest = FakeXMLHttpRequest;

	return {
		requests,
		respondWith( method, url, response ) {
			responses.push( { method, url, response } );
		},
		restore() {
			window.XMLHttpRequest = OriginalXMLHttpRequest;
		}
	};
}
