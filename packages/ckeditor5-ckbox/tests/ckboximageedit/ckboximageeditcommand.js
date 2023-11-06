/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* global window, btoa, setTimeout */

import { global } from '@ckeditor/ckeditor5-utils';
import { Command } from 'ckeditor5/src/core';
import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor';
import { Paragraph } from '@ckeditor/ckeditor5-paragraph';
import { Heading } from '@ckeditor/ckeditor5-heading';
import { Essentials } from '@ckeditor/ckeditor5-essentials';
import { Image } from '@ckeditor/ckeditor5-image';
import CloudServices from '@ckeditor/ckeditor5-cloud-services/src/cloudservices';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils';
import { setData as setModelData, getData as getModelData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';
import TokenMock from '@ckeditor/ckeditor5-cloud-services/tests/_utils/tokenmock';
import CloudServicesCoreMock from '../_utils/cloudservicescoremock';

import CKBoxImageEditCommand from '../../src/ckboximageedit/ckboximageeditcommand';
import { blurHashToDataUrl } from '../../src/utils';

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
				Essentials
			],
			ckbox: {
				tokenUrl: 'foo'
			},
			substitutePlugins: [
				CloudServicesCoreMock
			]
		} );

		command = new CKBoxImageEditCommand( editor );
		command.isEnabled = true;
		editor.commands.add( 'ckboxImageEdit', command );
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
		it( 'should fire "ckboxImageEditor:open" event after command execution', () => {
			const spy = sinon.spy();

			command.on( 'ckboxImageEditor:open', spy );
			command.execute();

			expect( spy.callCount ).to.equal( 1 );
		} );

		it( 'should fire "ckboxImageEditor:open" event as many times as command executions', () => {
			const spy = sinon.spy();

			command.on( 'ckboxImageEditor:open', spy );

			for ( let i = 1; i <= 5; i++ ) {
				command.execute();
			}

			expect( spy.callCount ).to.equal( 1 );
		} );
	} );

	describe( 'events', () => {
		describe( 'opening dialog ("ckboxImageEditor:open")', () => {
			beforeEach( () => {
				sinon.useFakeTimers( { now: Date.now() } );
			} );

			afterEach( () => {
				sinon.restore();
			} );

			it( 'should create a wrapper if it is not yet created and mount it in the document body', () => {
				command.execute();

				const wrapper = command._wrapper;

				expect( wrapper.nodeName ).to.equal( 'DIV' );
				expect( wrapper.className ).to.equal( 'ck ckbox-wrapper' );
			} );

			it( 'should create and mount a wrapper only once', () => {
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

			it( 'should open the CKBox Image Editor dialog instance only once', () => {
				command.execute();
				command.execute();
				command.execute();

				expect( window.CKBox.mountImageEditor.callCount ).to.equal( 1 );
			} );

			it( 'should prepare options for the CKBox Image Editing dialog instance', () => {
				const options = command._prepareOptions();

				expect( options ).to.have.property( 'tokenUrl', 'foo' );
				expect( options.imageEditing.allowOverwrite ).to.be.false;
				expect( options.onSave ).to.be.a( 'function' );
				expect( options.onClose ).to.be.a( 'function' );
			} );
		} );

		describe( 'closing dialog ("ckboxImageEditor:close")', () => {
			let onClose;

			beforeEach( () => {
				onClose = command._prepareOptions().onClose;
			} );

			it( 'should fire "ckboxImageEditor:close" event after closing the CKBox Image Editor dialog', () => {
				const spy = sinon.spy();

				command.on( 'ckboxImageEditor:close', spy );
				onClose();

				expect( spy.callCount ).to.equal( 1 );
			} );

			it( 'should remove the wrapper after closing the CKBox Image Editor dialog', () => {
				command.execute();

				expect( command._wrapper ).not.to.equal( null );

				const spy = sinon.spy( command._wrapper, 'remove' );

				onClose();

				expect( spy.callCount ).to.equal( 1 );
				expect( command._wrapper ).to.equal( null );
			} );

			it( 'should focus view after closing the CKBox Image Editor dialog', () => {
				const focusSpy = testUtils.sinon.spy( editor.editing.view, 'focus' );

				const openSpy = sinon.spy();
				const closeSpy = sinon.spy();

				command.on( 'ckboxImageEditor:open', openSpy );
				command.execute();

				command.on( 'ckboxImageEditor:close', closeSpy );
				onClose();

				expect( openSpy.callCount ).to.equal( 1 );
				expect( closeSpy.callCount ).to.equal( 1 );

				sinon.assert.calledOnce( focusSpy );
			} );
		} );

		describe( 'saving edited asset', () => {
			let onSave;

			beforeEach( () => {
				onSave = command._prepareOptions().onSave;
			} );

			it( 'should fire "ckboxImageEditor:save" and "ckboxImageEditor:processed" ' +
				'event after hit "Save" button in the CKBox Image Editor dialog', async () => {
				const spySave = sinon.spy();
				const spyProcessed = sinon.spy();

				setModelData( model, '[<imageBlock ' +
						'alt="alt text" ckboxImageId="example-id" height="50" src="/assets/sample.png" width="50">' +
					'</imageBlock>]' );

				const [ assetProcessedPromise, resolveAssetProcessed ] = createPromise();

				sinon.stub( command, '_waitForAssetProcessed' ).returns( assetProcessedPromise );

				command.on( 'ckboxImageEditor:save', spySave );
				command.on( 'ckboxImageEditor:processed', spyProcessed );

				onSave( dataMock );

				expect( spySave.callCount ).to.equal( 1 );

				await wait( 0 );

				expect( spyProcessed.callCount ).to.equal( 0 );

				resolveAssetProcessed();

				await wait( 0 );

				expect( spyProcessed.callCount ).to.equal( 1 );
			} );

			it( 'should not replace image with saved one before it is processed', () => {
				const modelData =
					'[<imageBlock ' +
						'alt="alt text" ckboxImageId="example-id" height="50" src="/assets/sample.png" width="50">' +
					'</imageBlock>]';

				setModelData( model, modelData );

				command.fire( 'ckboxImageEditor:save', dataMock );

				expect( getModelData( model ) ).to.equal( modelData );
			} );

			it( 'should replace image with saved one after it is processed', () => {
				setModelData( model, '[<imageBlock ' +
						'alt="alt text" ckboxImageId="example-id" height="50" src="/assets/sample.png" width="50">' +
					'</imageBlock>]' );

				command.fire( 'ckboxImageEditor:processed', dataMock );

				expect( getModelData( model ) ).to.equal(
					'[<imageBlock ' +
						'alt="" ' +
						'ckboxImageId="image-id1" ' +
						'height="100" ' +
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

				command.fire( 'ckboxImageEditor:processed', dataWithBlurHashMock );

				expect( getModelData( model ) ).to.equal(
					'[<imageBlock ' +
						'alt="" ' +
						'ckboxImageId="image-id1" ' +
						'height="100" ' +
						'placeholder="' + placeholder + '" ' +
						'src="https://example.com/workspace1/assets/image-id1/images/100.png" ' +
						'width="100">' +
					'</imageBlock>]'
				);
			} );
		} );
	} );
} );

function wait( time ) {
	return new Promise( resolve => {
		setTimeout( resolve, time );
	} );
}

function createPromise() {
	let resolve;

	const promise = new Promise( res => {
		resolve = res;
	} );

	return [ promise, resolve ];
}
