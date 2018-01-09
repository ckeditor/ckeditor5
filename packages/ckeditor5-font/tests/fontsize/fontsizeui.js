/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* global document */

import FontSizeEditing from '../../src/fontsize/fontsizeediting';
import FontSizeUI from '../../src/fontsize/fontsizeui';

import fontSizeIcon from '../../theme/icons/font-size.svg';

import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils';

testUtils.createSinonSandbox();

describe( 'FontSizeUI', () => {
	let editor, command, element;

	beforeEach( () => {
		element = document.createElement( 'div' );
		document.body.appendChild( element );

		return ClassicTestEditor
			.create( element, {
				plugins: [ FontSizeEditing, FontSizeUI ]
			} )
			.then( newEditor => {
				editor = newEditor;
			} );
	} );

	afterEach( () => {
		element.remove();

		return editor.destroy();
	} );

	describe( 'fontSize Dropdown', () => {
		let dropdown;

		beforeEach( () => {
			command = editor.commands.get( 'fontSize' );
			dropdown = editor.ui.componentFactory.create( 'fontSize' );
		} );

		it( 'button has the base properties', () => {
			const button = dropdown.buttonView;

			expect( button ).to.have.property( 'tooltip', 'Font Size' );
			expect( button ).to.have.property( 'icon', fontSizeIcon );
			expect( button ).to.have.property( 'withText', false );
		} );

		it( 'should add custom CSS class to dropdown', () => {
			const dropdown = editor.ui.componentFactory.create( 'fontSize' );

			dropdown.render();

			expect( dropdown.element.classList.contains( 'ck-font-size-dropdown' ) ).to.be.true;
		} );

		it( 'should focus view after command execution', () => {
			const focusSpy = testUtils.sinon.spy( editor.editing.view, 'focus' );
			const dropdown = editor.ui.componentFactory.create( 'fontSize' );

			dropdown.commandName = 'fontSize';
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
