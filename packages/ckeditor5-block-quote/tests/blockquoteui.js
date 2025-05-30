/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import BlockQuoteEditing from '../src/blockquoteediting.js';
import BlockQuoteUI from '../src/blockquoteui.js';

import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor.js';

describe( 'BlockQuoteUI', () => {
	let editor, command, element, button;

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

	it( 'should have `isOfficialPlugin` static flag set to `true`', () => {
		expect( BlockQuoteUI.isOfficialPlugin ).to.be.true;
	} );

	it( 'should have `isPremiumPlugin` static flag set to `false`', () => {
		expect( BlockQuoteUI.isPremiumPlugin ).to.be.false;
	} );

	describe( 'toolbar block quote button', () => {
		beforeEach( () => {
			button = editor.ui.componentFactory.create( 'blockQuote' );
		} );

		it( 'has the base properties', () => {
			expect( button ).to.have.property( 'label', 'Block quote' );
			expect( button ).to.have.property( 'icon' );
			expect( button ).to.have.property( 'tooltip', true );
			expect( button ).to.have.property( 'isToggleable', true );
		} );

		it( 'has isOn bound to command\'s value', () => {
			command.value = false;
			expect( button ).to.have.property( 'isOn', false );

			command.value = true;
			expect( button ).to.have.property( 'isOn', true );
		} );

		testButton();
	} );

	describe( 'menu bar block quote button', () => {
		beforeEach( () => {
			button = editor.ui.componentFactory.create( 'menuBar:blockQuote' );
		} );

		it( 'has the base properties', () => {
			expect( button ).to.have.property( 'label', 'Block quote' );
			expect( button ).to.have.property( 'icon' );
			expect( button ).to.have.property( 'isToggleable', true );
		} );

		testButton();
	} );

	function testButton() {
		it( 'has isEnabled bound to command\'s isEnabled', () => {
			command.isEnabled = true;
			expect( button ).to.have.property( 'isEnabled', true );

			command.isEnabled = false;
			expect( button ).to.have.property( 'isEnabled', false );
		} );

		it( 'executes command when it\'s executed', () => {
			const spy = sinon.stub( editor, 'execute' );

			button.fire( 'execute' );

			expect( spy.calledOnce ).to.be.true;
			expect( spy.args[ 0 ][ 0 ] ).to.equal( 'blockQuote' );
		} );
	}
} );
