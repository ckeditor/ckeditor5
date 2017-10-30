/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* global document */

import Alignment from '../src/alignment';
import AlignmentEditing from '../src/alignmentediting';
import AlignmentUI from '../src/alignmentui';

import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor';

describe( 'Alignment', () => {
	let editor, command, element;

	beforeEach( () => {
		element = document.createElement( 'div' );
		document.body.appendChild( element );

		return ClassicTestEditor
			.create( element, {
				plugins: [ Alignment ]
			} )
			.then( newEditor => {
				editor = newEditor;
				command = editor.commands.get( 'alignLeft' );
			} );
	} );

	afterEach( () => {
		element.remove();

		return editor.destroy();
	} );

	it( 'requires AlignmentEditing and AlignmentUI', () => {
		expect( Alignment.requires ).to.deep.equal( [ AlignmentEditing, AlignmentUI ] );
	} );

	describe( 'alignLeft button', () => {
		it( 'has the base properties', () => {
			const button = editor.ui.componentFactory.create( 'alignLeft' );

			expect( button ).to.have.property( 'label', 'Left' );
			expect( button ).to.have.property( 'icon' );
			expect( button ).to.have.property( 'tooltip', true );
		} );

		it( 'has isOn bound to command\'s value', () => {
			const button = editor.ui.componentFactory.create( 'alignLeft' );

			command.value = false;
			expect( button ).to.have.property( 'isOn', false );

			command.value = true;
			expect( button ).to.have.property( 'isOn', true );
		} );

		it( 'has isEnabled bound to command\'s isEnabled', () => {
			const button = editor.ui.componentFactory.create( 'alignLeft' );

			command.isEnabled = true;
			expect( button ).to.have.property( 'isEnabled', true );

			command.isEnabled = false;
			expect( button ).to.have.property( 'isEnabled', false );
		} );

		it( 'executes command when it\'s executed', () => {
			const button = editor.ui.componentFactory.create( 'alignLeft' );

			const spy = sinon.stub( editor, 'execute' );

			button.fire( 'execute' );

			expect( spy.calledOnce ).to.be.true;
			expect( spy.args[ 0 ][ 0 ] ).to.equal( 'alignLeft' );
		} );
	} );
} );
