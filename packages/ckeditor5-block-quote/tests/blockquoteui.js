/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* global document */

import BlockQuoteEditing from '../src/blockquoteediting';
import BlockQuoteUI from '../src/blockquoteui';

import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor';

describe( 'BlockQuoteUI', () => {
	let editor, command, element;

	beforeEach( () => {
		element = document.createElement( 'div' );
		document.body.appendChild( element );

		return ClassicTestEditor
			.create( element, {
				plugins: [ BlockQuoteEditing, BlockQuoteUI ]
			} )
			.then( newEditor => {
				editor = newEditor;
				command = editor.commands.get( 'blockQuote' );
			} );
	} );

	afterEach( () => {
		element.remove();

		return editor.destroy();
	} );

	describe( 'blockQuote button', () => {
		it( 'has the base properties', () => {
			const button = editor.ui.componentFactory.create( 'blockQuote' );

			expect( button ).to.have.property( 'label', 'Block quote' );
			expect( button ).to.have.property( 'icon' );
			expect( button ).to.have.property( 'tooltip', true );
			expect( button ).to.have.property( 'isToggleable', true );
		} );

		it( 'has isOn bound to command\'s value', () => {
			const button = editor.ui.componentFactory.create( 'blockQuote' );

			command.value = false;
			expect( button ).to.have.property( 'isOn', false );

			command.value = true;
			expect( button ).to.have.property( 'isOn', true );
		} );

		it( 'has isEnabled bound to command\'s isEnabled', () => {
			const button = editor.ui.componentFactory.create( 'blockQuote' );

			command.isEnabled = true;
			expect( button ).to.have.property( 'isEnabled', true );

			command.isEnabled = false;
			expect( button ).to.have.property( 'isEnabled', false );
		} );

		it( 'executes command when it\'s executed', () => {
			const button = editor.ui.componentFactory.create( 'blockQuote' );

			const spy = sinon.stub( editor, 'execute' );

			button.fire( 'execute' );

			expect( spy.calledOnce ).to.be.true;
			expect( spy.args[ 0 ][ 0 ] ).to.equal( 'blockQuote' );
		} );
	} );
} );
