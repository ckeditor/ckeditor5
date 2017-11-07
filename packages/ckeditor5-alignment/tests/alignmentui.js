/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* global document */

import AlignmentEditing from '../src/alignmentediting';
import AlignmentUI from '../src/alignmentui';

import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor';

describe( 'Alignment', () => {
	let editor, command, element, button;

	beforeEach( () => {
		element = document.createElement( 'div' );
		document.body.appendChild( element );

		return ClassicTestEditor
			.create( element, {
				plugins: [ AlignmentEditing, AlignmentUI ]
			} )
			.then( newEditor => {
				editor = newEditor;
			} );
	} );

	afterEach( () => {
		element.remove();

		return editor.destroy();
	} );

	it( 'requires AlignmentEditing', () => {
		expect( AlignmentUI.requires ).to.deep.equal( [ AlignmentEditing ] );
	} );

	describe( 'localizedStylesTitles()', () => {
		it( 'should return localized titles of styles', () => {
			const editorMock = { t: str => str };

			const plugin = new AlignmentUI( editorMock );

			expect( plugin.localizedStylesTitles ).to.deep.equal( {
				'left': 'Align left',
				'right': 'Align right',
				'center': 'Align center',
				'justify': 'Justify'
			} );
		} );
	} );

	describe( 'alignLeft button', () => {
		beforeEach( () => {
			command = editor.commands.get( 'alignLeft' );
			button = editor.ui.componentFactory.create( 'alignLeft' );
		} );

		it( 'has the base properties', () => {
			expect( button ).to.have.property( 'label', 'Align left' );
			expect( button ).to.have.property( 'icon' );
			expect( button ).to.have.property( 'tooltip', true );
		} );

		it( 'has isOn bound to command\'s value', () => {
			command.value = false;
			expect( button ).to.have.property( 'isOn', false );

			command.value = true;
			expect( button ).to.have.property( 'isOn', true );
		} );

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
			expect( spy.args[ 0 ][ 0 ] ).to.equal( 'alignLeft' );
		} );
	} );

	describe( 'alignRight button', () => {
		beforeEach( () => {
			command = editor.commands.get( 'alignRight' );
			button = editor.ui.componentFactory.create( 'alignRight' );
		} );

		it( 'has the base properties', () => {
			expect( button ).to.have.property( 'label', 'Align right' );
			expect( button ).to.have.property( 'icon' );
			expect( button ).to.have.property( 'tooltip', true );
		} );

		it( 'has isOn bound to command\'s value', () => {
			command.value = false;
			expect( button ).to.have.property( 'isOn', false );

			command.value = true;
			expect( button ).to.have.property( 'isOn', true );
		} );

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
			expect( spy.args[ 0 ][ 0 ] ).to.equal( 'alignRight' );
		} );
	} );

	describe( 'alignCenter button', () => {
		beforeEach( () => {
			command = editor.commands.get( 'alignCenter' );
			button = editor.ui.componentFactory.create( 'alignCenter' );
		} );

		it( 'has the base properties', () => {
			expect( button ).to.have.property( 'label', 'Align center' );
			expect( button ).to.have.property( 'icon' );
			expect( button ).to.have.property( 'tooltip', true );
		} );

		it( 'has isOn bound to command\'s value', () => {
			command.value = false;
			expect( button ).to.have.property( 'isOn', false );

			command.value = true;
			expect( button ).to.have.property( 'isOn', true );
		} );

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
			expect( spy.args[ 0 ][ 0 ] ).to.equal( 'alignCenter' );
		} );
	} );

	describe( 'alignJustify button', () => {
		beforeEach( () => {
			command = editor.commands.get( 'alignJustify' );
			button = editor.ui.componentFactory.create( 'alignJustify' );
		} );

		it( 'has the base properties', () => {
			expect( button ).to.have.property( 'label', 'Justify' );
			expect( button ).to.have.property( 'icon' );
			expect( button ).to.have.property( 'tooltip', true );
		} );

		it( 'has isOn bound to command\'s value', () => {
			command.value = false;
			expect( button ).to.have.property( 'isOn', false );

			command.value = true;
			expect( button ).to.have.property( 'isOn', true );
		} );

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
			expect( spy.args[ 0 ][ 0 ] ).to.equal( 'alignJustify' );
		} );
	} );
} );
