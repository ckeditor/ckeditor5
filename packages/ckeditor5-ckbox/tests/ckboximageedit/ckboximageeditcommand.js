/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { global } from '@ckeditor/ckeditor5-utils';
import { Command } from 'ckeditor5/src/core.js';
import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor.js';
import { Paragraph } from '@ckeditor/ckeditor5-paragraph';
import { Heading } from '@ckeditor/ckeditor5-heading';
import { Essentials } from '@ckeditor/ckeditor5-essentials';
import { Image } from '@ckeditor/ckeditor5-image';
import PendingActions from '@ckeditor/ckeditor5-core/src/pendingactions.js';
import CloudServices from '@ckeditor/ckeditor5-cloud-services/src/cloudservices.js';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils.js';
import LinkEditing from '@ckeditor/ckeditor5-link/src/linkediting.js';
import PictureEditing from '@ckeditor/ckeditor5-image/src/pictureediting.js';
import ImageUploadEditing from '@ckeditor/ckeditor5-image/src/imageupload/imageuploadediting.js';
import ImageUploadProgress from '@ckeditor/ckeditor5-image/src/imageupload/imageuploadprogress.js';
import { setData as setModelData, getData as getModelData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model.js';
import { getData as getViewData } from '@ckeditor/ckeditor5-engine/src/dev-utils/view.js';
import { Notification } from 'ckeditor5/src/ui.js';
import TokenMock from '@ckeditor/ckeditor5-cloud-services/tests/_utils/tokenmock.js';
import * as _ from 'es-toolkit/compat';
import CloudServicesCoreMock from '../_utils/cloudservicescoremock.js';
import CKBoxEditing from '../../src/ckboxediting.js';
import CKBoxImageEditEditing from '../../src/ckboximageedit/ckboximageeditediting.js';

import { blurHashToDataUrl } from '../../src/utils.js';
import CKBoxUtils from '../../src/ckboxutils.js';

const CKBOX_API_URL = 'https://upload.example.com';

describe( 'CKBoxImageEditCommand', () => {
	testUtils.createSinonSandbox();

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

		sinon.stub( CKBoxUtils.prototype, '_authorizePrivateCategoriesAccess' ).resolves();

		domElement = global.document.createElement( 'div' );
		global.document.body.appendChild( domElement );

		window.CKBox = {
			mountImageEditor: sinon.stub()
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
	} );

	describe( 'constructor', () => {
		it( 'should be a command instance', () => {
			expect( command ).to.be.instanceOf( Command );
		} );

		it( 'should set "#value" property to false', () => {
			expect( command.value ).to.be.false;
		} );
	} );

	describe( 'execute', () => {
		it( 'should open CKBox image editor', async () => {
			setModelData( model, '[<imageBlock alt="alt text" ckboxImageId="example-id" src="/assets/sample.png"></imageBlock>]' );
			command.execute();

			await new Promise( resolve => setTimeout( resolve, 0 ) );

			expect( window.CKBox.mountImageEditor.callCount ).to.equal( 1 );
			expect( window.CKBox.mountImageEditor.firstCall.args[ 1 ] ).to.have.property( 'assetId' ).that.equals( 'example-id' );
		} );
	} );

	describe( 'save edited image logic', () => {
		describe( 'opening dialog', () => {
			let clock;

			beforeEach( () => {
				clock = sinon.useFakeTimers( { now: Date.now() } );
			} );

			afterEach( () => {
				sinon.restore();
			} );

			it( 'should create a wrapper if it is not yet created and mount it in the document body', () => {
				setModelData( model, '[<imageBlock alt="alt text" ckboxImageId="example-id" src="/assets/sample.png"></imageBlock>]' );
				command.execute();

				const wrapper = command._wrapper;

				expect( wrapper.nodeName ).to.equal( 'DIV' );
				expect( wrapper.className ).to.equal( 'ck ckbox-wrapper' );
			} );

			it( 'should create and mount a wrapper only once', () => {
				setModelData( model, '[<imageBlock alt="alt text" ckboxImageId="example-id" src="/assets/sample.png"></imageBlock>]' );
				command.execute();

				const wrapper1 = command._wrapper;

				command.execute();

				const wrapper2 = command._wrapper;

				command.execute();

				const wrapper3 = command._wrapper;

				expect( wrapper1 ).to.equal( wrapper2 );
				expect( wrapper2 ).to.equal( wrapper3 );
			} );

			it( 'should not create a wrapper if the command is disabled', () => {
				command.isEnabled = false;
				command.execute();

				expect( command._wrapper ).to.equal( null );
			} );

			it( 'should not create a wrapper if the wrapper is already created', () => {
				const wrapper = global.document.createElement( 'p' );

				command._wrapper = wrapper;
				command.execute();

				expect( command._wrapper ).to.equal( wrapper );
			} );

			it( 'should open the CKBox Image Editor dialog instance only once', async () => {
				setModelData( model, '[<imageBlock alt="alt text" ckboxImageId="example-id" src="/assets/sample.png"></imageBlock>]' );

				command.execute();
				command.execute();
				command.execute();

				await clock.tickAsync( 0 );

				expect( window.CKBox.mountImageEditor.callCount ).to.equal( 1 );
			} );

			it( 'should prepare options for the CKBox Image Editing dialog instance (ckbox image)', async () => {
				const ckboxImageId = 'example-id';

				setModelData( model,
					`[<imageBlock alt="alt text" ckboxImageId="${ ckboxImageId }" src="/assets/sample.png"></imageBlock>]`
				);

				const imageElement = editor.model.document.selection.getSelectedElement();

				const options = await command._prepareOptions( {
					element: imageElement,
					controller: new AbortController()
				} );

				expect( options ).to.have.property( 'assetId', ckboxImageId );
				expect( options ).to.have.property( 'serviceOrigin', CKBOX_API_URL );
				expect( options ).to.have.property( 'tokenUrl', 'foo' );
				expect( options.imageEditing.allowOverwrite ).to.be.false;
				expect( options.onSave ).to.be.a( 'function' );
				expect( options.onClose ).to.be.a( 'function' );
			} );

			it( 'should prepare options for the CKBox Image Editing dialog instance (external image)', async () => {
				const imageUrl = 'https://example.com/assets/sample.png';
				const categoryId = 'id-category-1';

				sinon.stub( editor.plugins.get( 'CKBoxUtils' ), 'getCategoryIdForFile' ).resolves( categoryId );

				setModelData( model,
					`[<imageBlock alt="alt text" src="${ imageUrl }"></imageBlock>]`
				);

				const imageElement = editor.model.document.selection.getSelectedElement();

				const options = await command._prepareOptions( {
					element: imageElement,
					controller: new AbortController()
				} );

				expect( options ).to.not.have.property( 'assetId' );
				expect( options ).to.have.property( 'imageUrl', imageUrl );
				expect( options ).to.have.property( 'uploadCategoryId', categoryId );
				expect( options ).to.have.property( 'tokenUrl', 'foo' );
				expect( options.imageEditing.allowOverwrite ).to.be.false;
				expect( options.onSave ).to.be.a( 'function' );
				expect( options.onClose ).to.be.a( 'function' );
			} );

			it( 'should prepare options for the CKBox Image Editing dialog instance (external image with relative URL)', async () => {
				const imageUrl = 'sample.png';
				const categoryId = 'id-category-1';
				const origin = window.location.origin;

				sinon.stub( editor.plugins.get( 'CKBoxUtils' ), 'getCategoryIdForFile' ).resolves( categoryId );

				setModelData( model,
					`[<imageBlock alt="alt text" src="${ imageUrl }"></imageBlock>]`
				);

				const imageElement = editor.model.document.selection.getSelectedElement();

				const options = await command._prepareOptions( {
					element: imageElement,
					controller: new AbortController()
				} );

				expect( options ).to.not.have.property( 'assetId' );
				expect( options ).to.have.property( 'imageUrl', `${ origin }/${ imageUrl }` );
				expect( options ).to.have.property( 'uploadCategoryId', categoryId );
				expect( options ).to.have.property( 'tokenUrl', 'foo' );
				expect( options.imageEditing.allowOverwrite ).to.be.false;
				expect( options.onSave ).to.be.a( 'function' );
				expect( options.onClose ).to.be.a( 'function' );
			} );

			it( 'should handle error when preparing options', async () => {
				const notification = editor.plugins.get( Notification );
				const notificationStub = sinon.stub( notification, 'showWarning' );
				const consoleStub = sinon.stub( console, 'error' );
				const reason = 'getCategoryIdForFile behavied very badly.';

				sinon.stub( editor.plugins.get( 'CKBoxUtils' ), 'getCategoryIdForFile' ).returns( Promise.reject( reason ) );

				setModelData( model,
					'[<imageBlock alt="alt text" src="https://example.com/assets/sample.png"></imageBlock>]'
				);

				command.execute();

				await clock.tickAsync( 0 );

				expect( command._wrapper ).to.be.null;
				expect( consoleStub.calledOnceWith( reason ) ).to.be.true;
				expect( notificationStub.calledOnce ).to.be.true;
			} );
		} );

		describe( 'closing dialog', () => {
			it( 'should remove the wrapper after closing the CKBox Image Editor dialog', async () => {
				const ckboxImageId = 'example-id';

				setModelData( model,
					`[<imageBlock alt="alt text" ckboxImageId="${ ckboxImageId }" src="/assets/sample.png"></imageBlock>]`
				);

				const imageElement = editor.model.document.selection.getSelectedElement();

				const options = await command._prepareOptions( {
					element: imageElement,
					controller: new AbortController()
				} );

				command.execute();

				expect( command._wrapper ).not.to.equal( null );

				const spy = sinon.spy( command._wrapper, 'remove' );

				options.onClose();

				expect( spy.callCount ).to.equal( 1 );
				expect( command._wrapper ).to.equal( null );
			} );

			it( 'should focus view after closing the CKBox Image Editor dialog', async () => {
				const ckboxImageId = 'example-id';

				setModelData( model,
					`[<imageBlock alt="alt text" ckboxImageId="${ ckboxImageId }" src="/assets/sample.png"></imageBlock>]`
				);

				const imageElement = editor.model.document.selection.getSelectedElement();

				const options = await command._prepareOptions( {
					element: imageElement,
					ckboxImageId,
					controller: new AbortController()
				} );

				const focusSpy = testUtils.sinon.spy( editor.editing.view, 'focus' );

				command.execute();

				options.onClose();

				sinon.assert.calledOnce( focusSpy );
			} );

			it( 'should refresh the command after closing the CKBox Image Editor dialog', async () => {
				const ckboxImageId = 'example-id';

				setModelData( model,
					`[<imageBlock alt="alt text" ckboxImageId="${ ckboxImageId }" src="/assets/sample.png"></imageBlock>]`
				);

				const imageElement = editor.model.document.selection.getSelectedElement();

				const options = await command._prepareOptions( {
					element: imageElement,
					ckboxImageId,
					controller: new AbortController()
				} );

				const refreshSpy = testUtils.sinon.spy( command, 'refresh' );

				expect( command.value ).to.be.false;

				command.execute();
				expect( command.value ).to.be.true;

				options.onClose();
				expect( command.value ).to.be.false;
				sinon.assert.calledOnce( refreshSpy );
			} );

			it( 'should update ui after closing the CKBox Image Editor dialog', async () => {
				const ckboxImageId = 'example-id';
				const clock = sinon.useFakeTimers();

				setModelData( model,
					`[<imageBlock alt="alt text" ckboxImageId="${ ckboxImageId }" src="/assets/sample.png"></imageBlock>]`
				);

				const imageElement = editor.model.document.selection.getSelectedElement();

				const options = await command._prepareOptions( {
					element: imageElement,
					ckboxImageId,
					controller: new AbortController()
				} );

				const updateUISpy = testUtils.sinon.spy( editor.ui, 'update' );

				expect( command.value ).to.be.false;

				command.execute();
				expect( command.value ).to.be.true;

				options.onClose();

				await clock.tickAsync( 10 );

				expect( command.value ).to.be.false;
				sinon.assert.calledOnce( updateUISpy );
				clock.restore();
			} );

			it( 'should clear timer on editor destroy', async () => {
				const ckboxImageId = 'example-id';

				setModelData( model,
					`[<imageBlock alt="alt text" ckboxImageId="${ ckboxImageId }" src="/assets/sample.png"></imageBlock>]`
				);

				const imageElement = editor.model.document.selection.getSelectedElement();

				const options = await command._prepareOptions( {
					element: imageElement,
					ckboxImageId,
					controller: new AbortController()
				} );

				const clearTimeoutSpy = sinon.spy( command._updateUiDelayed, 'cancel' );

				editor.fire( 'ready' );

				expect( command.value ).to.be.false;

				command.execute();

				options.onClose();

				command.destroy();
				sinon.assert.calledTwice( clearTimeoutSpy );

				expect( command.value ).to.be.false;
			} );
		} );

		describe( 'saving edited asset', () => {
			let options, sinonXHR, jwtToken, clock;

			beforeEach( async () => {
				const ckboxImageId = 'example-id';

				setModelData( model,
					`[<imageBlock alt="alt text" height="50" ckboxImageId="${ ckboxImageId }"\
					src="/assets/sample.png" width="50"></imageBlock>]`
				);

				const imageElement = editor.model.document.selection.getSelectedElement();

				jwtToken = createToken( { auth: { ckbox: { workspaces: [ 'workspace1' ] } } } );
				options = await command._prepareOptions( {
					element: imageElement,
					ckboxImageId,
					controller: new AbortController()
				} );
				sinonXHR = testUtils.sinon.useFakeServer();
				sinonXHR.autoRespond = true;
			} );

			afterEach( () => {
				sinonXHR.restore();

				if ( clock ) {
					clock.restore();
				}
			} );

			it( 'should poll data for edited image and if success status, save it', async () => {
				clock = sinon.useFakeTimers();

				sinonXHR.respondWith( 'GET', CKBOX_API_URL + '/assets/image-id1', xhr => {
					return xhr.error();
				} );

				command.on( 'ckboxImageEditor:processed', () => {
					expect( getModelData( model ) ).to.equal(
						'[<imageBlock alt="" ckboxImageId="image-id1" height="100" sources="[object Object]"' +
							' src="https://example.com/workspace1/assets/image-id1/images/100.png" width="100">' +
						'</imageBlock>]'
					);
				} );

				options.onSave( dataMock );

				await clock.tickAsync( 1500 );
			} );

			it( 'should abort when image was removed while processing on server', async () => {
				const clock = sinon.useFakeTimers();

				sinonXHR.respondWith( 'GET', CKBOX_API_URL + '/assets/image-id1', [
					200,
					{ 'Content-Type': 'application/json' },
					JSON.stringify( {
						metadata: {
							metadataProcessingStatus: 'queued'
						}
					} )
				] );

				options.onSave( dataMock );

				await clock.tickAsync( 100 );

				const selection = model.document.selection;

				model.deleteContent( selection );

				sinonXHR.respondWith( 'GET', CKBOX_API_URL + '/assets/image-id1', [
					200,
					{ 'Content-Type': 'application/json' },
					JSON.stringify( {
						metadata: {
							metadataProcessingStatus: 'success'
						}
					} )
				] );

				await clock.tickAsync( 1000 );

				expect( getModelData( model ) ).to.equal( '<paragraph>[]</paragraph>' );
			} );

			it( 'should display notification in case fail', async () => {
				const notification = editor.plugins.get( Notification );
				const clock = sinon.useFakeTimers();
				const spy = sinon.stub( notification, 'showWarning' );

				sinonXHR.respondWith( 'GET', CKBOX_API_URL + '/assets/image-id1', [
					500,
					{ 'Content-Type': 'application/json' },
					JSON.stringify( {
						metadata: {
							metadataProcessingStatus: 'queued'
						}
					} )
				] );

				options.onSave( dataMock );

				await clock.tickAsync( 20000 );

				sinon.assert.calledOnce( spy );
			} );

			it( 'should log error in case runtime error in asynchronous code', async () => {
				const notification = editor.plugins.get( Notification );
				const clock = sinon.useFakeTimers();
				const spy = sinon.stub( notification, 'showWarning' );
				const consoleStub = sinon.stub( console, 'error' );

				sinon.stub( command, '_getAssetStatusFromServer' ).callsFake( () => {
					throw new Error( 'unhandled' );
				} );

				options.onSave( dataMock );

				await clock.tickAsync( 20000 );

				sinon.assert.notCalled( spy );
				sinon.assert.calledOnce( consoleStub );
			} );

			it( 'should disable command for images being processed', async () => {
				const clock = sinon.useFakeTimers();

				sinon.stub( _, 'isEqual' ).returns( true );

				sinonXHR.respondWith( 'GET', CKBOX_API_URL + '/assets/image-id1', [
					500,
					{ 'Content-Type': 'application/json' },
					JSON.stringify( {
						metadata: {
							metadataProcessingStatus: 'queued'
						}
					} )
				] );

				expect( command.isEnabled ).to.be.true;

				options.onSave( dataMock );

				await clock.tickAsync( 10 );

				expect( command.isEnabled ).to.be.false;
			} );

			it( 'should abort on CKBoxImageEditCommand destroy', async () => {
				const clock = sinon.useFakeTimers();
				const spy = sinon.spy( editor.editing, 'reconvertItem' );

				sinonXHR.respondWith( 'GET', CKBOX_API_URL + '/assets/image-id1', [
					500,
					{ 'Content-Type': 'application/json' },
					JSON.stringify( {
						metadata: {
							metadataProcessingStatus: 'queued'
						}
					} )
				] );

				options.onSave( dataMock );

				await clock.tickAsync( 10 );

				command.destroy();

				await clock.tickAsync( 10 );

				sinon.assert.calledOnce( spy );
			} );

			it( 'should not display notification error on editor destroy', async () => {
				const notification = editor.plugins.get( Notification );
				const clock = sinon.useFakeTimers();
				const spy = sinon.spy( notification, 'showWarning' );

				sinonXHR.respondWith( 'GET', CKBOX_API_URL + '/assets/image-id1', [
					500,
					{ 'Content-Type': 'application/json' },
					JSON.stringify( {
						metadata: {
							metadataProcessingStatus: 'queued'
						}
					} )
				] );

				options.onSave( dataMock );

				await clock.tickAsync( 10 );

				command.destroy();

				await clock.tickAsync( 10 );

				sinon.assert.notCalled( spy );
			} );

			it( 'should display notification error if server fail or didnt respond', async () => {
				const notification = editor.plugins.get( Notification );
				const clock = sinon.useFakeTimers();
				const spy = sinon.stub( notification, 'showWarning' );

				sinonXHR.respondWith( 'GET', CKBOX_API_URL + '/assets/image-id1', xhr => {
					return xhr.error();
				} );

				options.onSave( dataMock );

				await clock.tickAsync( 20000 );

				sinon.assert.calledOnce( spy );
			} );

			it( 'should reconvert image if server respond with "error" status', async () => {
				const clock = sinon.useFakeTimers();
				const spy = sinon.spy( editor.editing, 'reconvertItem' );
				const notification = editor.plugins.get( Notification );

				sinon.stub( notification, 'showWarning' );

				sinonXHR.respondWith( 'GET', CKBOX_API_URL + '/assets/image-id1', [
					500,
					{ 'Content-Type': 'application/json' },
					JSON.stringify( {
						metadata: {
							metadataProcessingStatus: 'error'
						}
					} )
				] );

				options.onSave( dataMock );

				await clock.tickAsync( 20000 );

				sinon.assert.calledOnce( spy );
			} );

			it( 'should stop polling if limit was reached', async () => {
				clock = sinon.useFakeTimers();

				const respondSpy = sinon.spy( sinonXHR, 'respond' );

				sinonXHR.respondWith( 'GET', CKBOX_API_URL + '/assets/image-id1', [
					200,
					{ 'Content-Type': 'application/json' },
					JSON.stringify( {
						metadata: {
							metadataProcessingStatus: 'queued'
						}
					} )
				] );

				options.onSave( dataMock );

				await clock.tickAsync( 15000 );

				sinon.assert.callCount( respondSpy, 4 );
			} );

			it( 'should add a pending action after a change and remove after server response', async () => {
				const pendingActions = editor.plugins.get( PendingActions );

				clock = sinon.useFakeTimers();

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

				expect( pendingActions._actions.length ).to.equal( 0 );

				sinonXHR.respondWith( 'GET', CKBOX_API_URL + '/assets/image-id1', [
					200,
					{ 'Content-Type': 'application/json' },
					JSON.stringify( {
						metadata: {
							metadataProcessingStatus: 'queued'
						}
					} )
				] );

				options.onSave( dataMock );

				expect( pendingActions.hasAny ).to.be.true;
				expect( pendingActions._actions.length ).to.equal( 1 );
				expect( pendingActions.first.message ).to.equal( 'Processing the edited image.' );

				await clock.tickAsync( 1000 );

				options.onSave( dataMock2 );

				expect( pendingActions.hasAny ).to.be.true;
				expect( pendingActions._actions.length ).to.equal( 2 );
				expect( pendingActions.first.message ).to.equal( 'Processing the edited image.' );
				expect( pendingActions._actions.get( 1 ).message ).to.equal( 'Processing the edited image.' );

				sinonXHR.respondWith( 'GET', CKBOX_API_URL + '/assets/image-id1', [
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

				await clock.tickAsync( 10000 );

				expect( pendingActions.hasAny ).to.be.false;
				expect( pendingActions._actions.length ).to.equal( 0 );
			} );

			it( 'should reject if fetching asset\'s status ended with the authorization error', () => {
				sinonXHR.respondWith( 'GET', CKBOX_API_URL + '/assets/image-id1', [
					401,
					{ 'Content-Type': 'application/json' },
					JSON.stringify( { message: 'Invalid token.', statusCode: 401 } )
				] );

				return command._getAssetStatusFromServer( dataMock )
					.then( res => {
						expect( res.message ).to.equal( 'Invalid token.' );
						throw new Error( 'Expected to be rejected.' );
					}, () => {
						expect( sinonXHR.requests[ 0 ].requestHeaders ).to.be.an( 'object' );
						expect( sinonXHR.requests[ 0 ].requestHeaders ).to.contain.property( 'Authorization', jwtToken );
						expect( sinonXHR.requests[ 0 ].requestHeaders ).to.contain.property( 'CKBox-Version', 'CKEditor 5' );
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

				setModelData( model, '[<imageBlock ' +
						'alt="alt text" ckboxImageId="example-id" height="50" src="/assets/sample.png" width="50">' +
							'<caption>' +
								'caption' +
							'</caption>' +
					'</imageBlock>]' );

				const imageElement = editor.model.document.selection.getSelectedElement();

				command._replaceImage( imageElement, dataMock );

				expect( getModelData( model ) ).to.equal(
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
						'alt="alt text" ckboxImageId="example-id" height="50" src="/assets/sample.png" ' +
						'tempServerAssetId="image-id1" width="50">' +
					'</imageBlock>]';

				setModelData( model, modelData );

				command.execute();

				expect( getModelData( model ) ).to.equal( modelData );
			} );

			it( 'should replace inline image with saved one after it is processed', () => {
				setModelData( model, '<paragraph>[<imageInline ' +
						'alt="alt text" ckboxImageId="example-id" height="50" src="/assets/sample.png" width="50">' +
					'</imageInline>]</paragraph>' );

				const imageElement = editor.model.document.selection.getSelectedElement();

				command._replaceImage( imageElement, dataMock );

				expect( getModelData( model ) ).to.equal(
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
				setModelData( model, '[<imageBlock ' +
						'alt="alt text" ckboxImageId="example-id" height="50" src="/assets/sample.png" width="50">' +
					'</imageBlock>]' );

				const imageElement = editor.model.document.selection.getSelectedElement();

				command._replaceImage( imageElement, dataMock );

				expect( getModelData( model ) ).to.equal(
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
				setModelData( model, '[<imageBlock ' +
						'ckboxImageId="example-id" height="50" src="/assets/sample.png" width="50">' +
					'</imageBlock>]' );

				const imageElement = editor.model.document.selection.getSelectedElement();

				command._replaceImage( imageElement, dataMock );

				expect( getModelData( model ) ).to.equal(
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

				setModelData( model, '[<imageBlock ' +
						'alt="alt text" ckboxImageId="example-id" height="50" src="/assets/sample.png" width="50">' +
					'</imageBlock>]' );

				const imageElement = editor.model.document.selection.getSelectedElement();

				command._replaceImage( imageElement, dataWithBlurHashMock );

				expect( getModelData( model ) ).to.equal(
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
				expect( getViewData( editor.editing.view, { withoutSelection: true } ) ).to.equal(
					'<figure class="ck-widget ck-widget_selected image" contenteditable="false" data-ckbox-resource-id="example-id">' +
						'<img alt="alt text" height="50" loading="lazy" src="/assets/sample.png" style="aspect-ratio:50/50" width="50">' +
						'</img>' +
						'<div class="ck ck-reset_all ck-widget__type-around"></div>' +
					'</figure>'
				);

				options.onSave( dataMock );

				expect( getViewData( editor.editing.view, { withoutSelection: true } ) ).to.equal(
					'<figure class="ck-widget ck-widget_selected image image-processing" ' +
						'contenteditable="false" data-ckbox-resource-id="example-id">' +
						'<img alt="alt text" height="100" loading="lazy" src="/assets/sample.png" ' +
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
