/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import { global } from '@ckeditor/ckeditor5-utils';
import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor';
import { ButtonView } from '@ckeditor/ckeditor5-ui';

import CKBoxImageEditEditing from '../../src/ckboximageedit/ckboximageeditediting';
import CKBoxImageEditUI from '../../src/ckboximageedit/ckboximageeditui';

describe( 'CKBoxImageEditUI', () => {
	let editor, element, button;

	beforeEach( () => {
		element = global.document.createElement( 'div' );
		global.document.body.appendChild( element );

		return ClassicTestEditor
			.create( element, {
				plugins: [ CKBoxImageEditEditing, CKBoxImageEditUI ]
			} )
			.then( newEditor => {
				editor = newEditor;
				button = editor.ui.componentFactory.create( 'ckboxImageEdit' );
			} );
	} );

	afterEach( () => {
		element.remove();

		return editor.destroy();
	} );

	it( 'should be correctly named', () => {
		expect( CKBoxImageEditUI.pluginName ).to.equal( 'CKBoxImageEditUI' );
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
			expect( button.isEnabled ).to.be.true;

			editor.commands.get( 'ckboxImageEdit' ).isEnabled = false;

			expect( button.isEnabled ).to.be.false;
		} );

		it( 'should have #isOn bound to the command value', () => {
			editor.commands.get( 'ckboxImageEdit' ).value = false;

			expect( button.isOn ).to.be.false;

			editor.commands.get( 'ckboxImageEdit' ).value = true;

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
