/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* global window, btoa */

import { global } from '@ckeditor/ckeditor5-utils';
import { Command } from 'ckeditor5/src/core';
import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor';
import { Paragraph } from '@ckeditor/ckeditor5-paragraph';
import { Heading } from '@ckeditor/ckeditor5-heading';
import { Essentials } from '@ckeditor/ckeditor5-essentials';
import CloudServices from '@ckeditor/ckeditor5-cloud-services/src/cloudservices';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils';
import TokenMock from '@ckeditor/ckeditor5-cloud-services/tests/_utils/tokenmock';
import CloudServicesCoreMock from '../_utils/cloudservicescoremock';

import CKBoxImageEditCommand from '../../src/ckboximageedit/ckboximageeditcommand';

describe( 'CKBoxImageEditCommand', () => {
	testUtils.createSinonSandbox();

	let editor, domElement, command;

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

		describe( 'saving asset ("ckboxImageEditor:save")', () => {
			let onSave;

			beforeEach( () => {
				onSave = command._prepareOptions().onSave;
			} );

			it( 'should fire "ckboxImageEditor:save" event after closing the CKBox Image Editor dialog', () => {
				const spy = sinon.spy();

				command.on( 'ckboxImageEditor:save', spy );
				onSave();

				expect( spy.callCount ).to.equal( 1 );
			} );
		} );
	} );
} );
