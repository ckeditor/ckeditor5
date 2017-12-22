/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* global document */

import FontFamilyEditing from '../../src/fontfamily/fontfamilyediting';
import FontFamilyUI from '../../src/fontfamily/fontfamilyui';

import fontFamilyIcon from '@ckeditor/ckeditor5-core/theme/icons/low-vision.svg';

import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils';

testUtils.createSinonSandbox();

describe( 'FontFamilyUI', () => {
	let editor, command, element;

	beforeEach( () => {
		element = document.createElement( 'div' );
		document.body.appendChild( element );

		return ClassicTestEditor
			.create( element, {
				plugins: [ FontFamilyEditing, FontFamilyUI ]
			} )
			.then( newEditor => {
				editor = newEditor;
			} );
	} );

	afterEach( () => {
		element.remove();

		return editor.destroy();
	} );

	describe( 'fontFamily Dropdown', () => {
		let dropdown;

		beforeEach( () => {
			command = editor.commands.get( 'fontFamily' );
			dropdown = editor.ui.componentFactory.create( 'fontFamily' );
		} );

		it( 'button has the base properties', () => {
			const button = dropdown.buttonView;

			expect( button ).to.have.property( 'tooltip', 'Font Family' );
			expect( button ).to.have.property( 'icon', fontFamilyIcon );
			expect( button ).to.have.property( 'withText', false );
		} );

		it( 'should add custom CSS class to dropdown', () => {
			const dropdown = editor.ui.componentFactory.create( 'fontFamily' );

			dropdown.render();

			expect( dropdown.element.classList.contains( 'ck-font-family-dropdown' ) ).to.be.true;
		} );

		it( 'should focus view after command execution', () => {
			const focusSpy = testUtils.sinon.spy( editor.editing.view, 'focus' );
			const dropdown = editor.ui.componentFactory.create( 'fontFamily' );

			dropdown.commandName = 'fontFamily';
			dropdown.fire( 'execute' );

			sinon.assert.calledOnce( focusSpy );
		} );

		describe( 'model to command binding', () => {
			it( 'isEnabled', () => {
				command.isEnabled = false;

				expect( dropdown.buttonView.isEnabled ).to.be.false;

				command.isEnabled = true;
				expect( dropdown.buttonView.isEnabled ).to.be.true;
			} );
		} );
	} );
} );
