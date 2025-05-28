/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { global } from '@ckeditor/ckeditor5-utils';
import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor.js';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph.js';
import CloudServices from '@ckeditor/ckeditor5-cloud-services/src/cloudservices.js';
import { LinkEditing } from '@ckeditor/ckeditor5-link';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils.js';
import { Image, ImageUploadEditing, ImageUploadProgress, PictureEditing } from '@ckeditor/ckeditor5-image';
import { setData as setModelData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model.js';
import { ButtonView } from '@ckeditor/ckeditor5-ui';
import TokenMock from '@ckeditor/ckeditor5-cloud-services/tests/_utils/tokenmock.js';
import CloudServicesCoreMock from '../_utils/cloudservicescoremock.js';

import CKBoxImageEditEditing from '../../src/ckboximageedit/ckboximageeditediting.js';
import CKBoxImageEditUI from '../../src/ckboximageedit/ckboximageeditui.js';

describe( 'CKBoxImageEditUI', () => {
	testUtils.createSinonSandbox();

	let editor, model, element, button, command;

	beforeEach( () => {
		TokenMock.initialToken = [
			// Header.
			'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9',
			// Payload.
			btoa( JSON.stringify( { auth: { ckbox: { workspaces: [ 'workspace1' ] } } } ) ),
			// Signature.
			'signature'
		].join( '.' );

		window.CKBox = {
			mountImageEditor: sinon.stub()
		};

		element = global.document.createElement( 'div' );
		global.document.body.appendChild( element );

		return ClassicTestEditor
			.create( element, {
				plugins: [
					CKBoxImageEditEditing,
					CKBoxImageEditUI,
					Image,
					ImageUploadEditing,
					ImageUploadProgress,
					Paragraph,
					PictureEditing,
					LinkEditing,
					CloudServices
				],
				ckbox: {
					tokenUrl: 'foo'
				},
				substitutePlugins: [
					CloudServicesCoreMock
				]
			} )
			.then( newEditor => {
				editor = newEditor;
				model = editor.model;
				button = editor.ui.componentFactory.create( 'ckboxImageEdit' );
				command = editor.commands.get( 'ckboxImageEdit' );
			} );
	} );

	afterEach( () => {
		element.remove();

		if ( global.document.querySelector( '.ck.ckbox-wrapper' ) ) {
			global.document.querySelector( '.ck.ckbox-wrapper' ).remove();
		}

		return editor.destroy();
	} );

	it( 'should be correctly named', () => {
		expect( CKBoxImageEditUI.pluginName ).to.equal( 'CKBoxImageEditUI' );
	} );

	it( 'should have `isOfficialPlugin` static flag set to `true`', () => {
		expect( CKBoxImageEditUI.isOfficialPlugin ).to.be.true;
	} );

	it( 'should have `isPremiumPlugin` static flag set to `false`', () => {
		expect( CKBoxImageEditUI.isPremiumPlugin ).to.be.false;
	} );

	describe( 'the "editImage" button', () => {
		it( 'should be an instance of ButtonView', () => {
			expect( button ).to.be.instanceOf( ButtonView );
		} );

		it( 'should have a label', () => {
			expect( button.label ).to.equal( 'Edit image' );
		} );

		it( 'should have a label binded to #isAccessAllowed', () => {
			const uploadImageCommand = editor.commands.get( 'uploadImage' );
			uploadImageCommand.set( 'isAccessAllowed', false );

			expect( button.label ).to.equal( 'You have no image editing permissions.' );
		} );

		it( 'should have an icon', () => {
			expect( button.icon ).to.match( /^<svg/ );
		} );

		it( 'should have a tooltip', () => {
			expect( button.tooltip ).to.be.true;
		} );

		it( 'should have #isEnabled bound to the command isEnabled', () => {
			expect( button.isEnabled ).to.be.false;

			editor.commands.get( 'ckboxImageEdit' ).isEnabled = false;

			expect( button.isEnabled ).to.be.false;

			setModelData( model, '[<paragraph>Foo</paragraph>]' );

			expect( button.isEnabled ).to.be.false;

			setModelData( model, '[<imageBlock alt="alt text" ckboxImageId="example-id" src="/assets/sample.png"></imageBlock>]' );

			expect( button.isEnabled ).to.be.true;
		} );

		it( 'should have #isOn bound to the command value', () => {
			editor.commands.get( 'ckboxImageEdit' ).value = false;

			expect( button.isOn ).to.be.false;

			editor.commands.get( 'ckboxImageEdit' ).value = true;

			setModelData( model, '[<paragraph>Foo</paragraph>]' );

			expect( button.isOn ).to.be.false;

			setModelData( model, '[<imageBlock alt="alt text" ckboxImageId="example-id" src="/assets/sample.png"></imageBlock>]' );

			command.execute();

			expect( button.isOn ).to.be.true;
		} );

		it( 'should execute the "ckboxImageEdit" command and focus the editing view', () => {
			sinon.spy( editor, 'execute' );
			sinon.spy( editor.editing.view, 'focus' );

			button.fire( 'execute' );

			sinon.assert.calledOnce( editor.execute );
			sinon.assert.calledWithExactly( editor.execute, 'ckboxImageEdit' );
			sinon.assert.calledOnce( editor.editing.view.focus );
		} );
	} );
} );
