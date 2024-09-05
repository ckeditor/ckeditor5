/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import { global } from '@ckeditor/ckeditor5-utils';
import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor.js';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph.js';
import CloudServices from '@ckeditor/ckeditor5-cloud-services/src/cloudservices.js';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils.js';
import { Image, ImageUploadEditing, ImageUploadProgress } from '@ckeditor/ckeditor5-image';
import { setData as setModelData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model.js';
import { ButtonView } from '@ckeditor/ckeditor5-ui';

import UploadcareImageEditEditing from '../../src/uploadcareimageedit/uploadcareimageeditediting.js';
import UploadcareImageEditUI from '../../src/uploadcareimageedit/uploadcareimageeditui.js';

describe( 'UploadcareImageEditUI', () => {
	testUtils.createSinonSandbox();

	let editor, model, element, button, command;

	beforeEach( () => {
		element = global.document.createElement( 'div' );
		global.document.body.appendChild( element );

		return ClassicTestEditor
			.create( element, {
				plugins: [
					UploadcareImageEditEditing,
					UploadcareImageEditUI,
					Image,
					ImageUploadEditing,
					ImageUploadProgress,
					Paragraph,
					CloudServices
				],
				uploadcare: {
					pubKey: 'KEY'
				}
			} )
			.then( newEditor => {
				editor = newEditor;
				model = editor.model;
				button = editor.ui.componentFactory.create( 'uploadcareImageEdit' );
				command = editor.commands.get( 'uploadcareImageEdit' );
			} );
	} );

	afterEach( () => {
		element.remove();

		if ( global.document.querySelector( '.ck.uploadcare-wrapper' ) ) {
			global.document.querySelector( '.ck.uploadcare-wrapper' ).remove();
		}

		return editor.destroy();
	} );

	it( 'should be correctly named', () => {
		expect( UploadcareImageEditUI.pluginName ).to.equal( 'UploadcareImageEditUI' );
	} );

	describe( 'the "editImage" button', () => {
		it( 'should be an instance of ButtonView', () => {
			expect( button ).to.be.instanceOf( ButtonView );
		} );

		it( 'should have a label', () => {
			expect( button.label ).to.equal( 'Edit image' );
		} );

		it( 'should have an icon', () => {
			expect( button.icon ).to.match( /^<svg/ );
		} );

		it( 'should have a tooltip', () => {
			expect( button.tooltip ).to.be.true;
		} );

		it( 'should have #isEnabled bound to the command isEnabled', () => {
			expect( button.isEnabled ).to.be.false;

			editor.commands.get( 'uploadcareImageEdit' ).isEnabled = true;

			expect( button.isEnabled ).to.be.true;

			setModelData( model, '[<paragraph>Foo</paragraph>]' );

			expect( button.isEnabled ).to.be.false;

			setModelData( model, '[<imageBlock alt="alt text" uploadcareImageId="example-id" src="/assets/sample.png"></imageBlock>]' );

			expect( button.isEnabled ).to.be.true;
		} );

		it( 'should have #isOn bound to the command isEnabled', () => {
			editor.commands.get( 'uploadcareImageEdit' ).isEnabled = false;

			expect( button.isOn ).to.be.false;

			editor.commands.get( 'uploadcareImageEdit' ).isEnabled = true;

			setModelData( model, '[<paragraph>Foo</paragraph>]' );

			expect( button.isOn ).to.be.false;

			setModelData( model, '[<imageBlock alt="alt text" uploadcareImageId="example-id" src="/assets/sample.png"></imageBlock>]' );

			command.execute();

			expect( button.isOn ).to.be.true;
		} );

		it( 'should execute the "uploadcareImageEdit" command and focus the editing view', () => {
			sinon.spy( editor, 'execute' );
			sinon.spy( editor.editing.view, 'focus' );

			button.fire( 'execute' );

			sinon.assert.calledOnce( editor.execute );
			sinon.assert.calledWithExactly( editor.execute, 'uploadcareImageEdit' );
			sinon.assert.calledOnce( editor.editing.view.focus );
		} );
	} );
} );
