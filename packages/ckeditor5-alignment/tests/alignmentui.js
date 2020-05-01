/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* global document */

import AlignmentEditing from '../src/alignmentediting';
import AlignmentUI from '../src/alignmentui';

import alignLeftIcon from '@ckeditor/ckeditor5-core/theme/icons/align-left.svg';
import alignRightIcon from '@ckeditor/ckeditor5-core/theme/icons/align-right.svg';

import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor';

describe( 'Alignment UI', () => {
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

	describe( 'localizedOptionTitles()', () => {
		it( 'should return localized titles of options', () => {
			const editorMock = { t: str => str };

			const plugin = new AlignmentUI( editorMock );

			expect( plugin.localizedOptionTitles ).to.deep.equal( {
				'left': 'Align left',
				'right': 'Align right',
				'center': 'Align center',
				'justify': 'Justify'
			} );
		} );
	} );

	describe( 'alignment:left button', () => {
		beforeEach( () => {
			command = editor.commands.get( 'alignment' );
			button = editor.ui.componentFactory.create( 'alignment:left' );
		} );

		it( 'has the base properties', () => {
			expect( button ).to.have.property( 'label', 'Align left' );
			expect( button ).to.have.property( 'icon' );
			expect( button ).to.have.property( 'tooltip', true );
			expect( button ).to.have.property( 'isToggleable', true );
		} );

		it( 'has isOn bound to command\'s value', () => {
			command.value = false;
			expect( button ).to.have.property( 'isOn', false );

			command.value = 'left';
			expect( button ).to.have.property( 'isOn', true );

			command.value = 'justify';
			expect( button ).to.have.property( 'isOn', false );
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
			expect( spy.args[ 0 ][ 0 ] ).to.equal( 'alignment' );
			expect( spy.args[ 0 ][ 1 ] ).to.deep.equal( { value: 'left' } );
		} );
	} );

	describe( 'alignment:right button', () => {
		beforeEach( () => {
			command = editor.commands.get( 'alignment' );
			button = editor.ui.componentFactory.create( 'alignment:right' );
		} );

		it( 'has the base properties', () => {
			expect( button ).to.have.property( 'label', 'Align right' );
			expect( button ).to.have.property( 'icon' );
			expect( button ).to.have.property( 'tooltip', true );
		} );

		it( 'has isOn bound to command\'s value', () => {
			command.value = false;
			expect( button ).to.have.property( 'isOn', false );

			command.value = 'right';
			expect( button ).to.have.property( 'isOn', true );

			command.value = 'justify';
			expect( button ).to.have.property( 'isOn', false );
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
			expect( spy.args[ 0 ][ 0 ] ).to.equal( 'alignment' );
			expect( spy.args[ 0 ][ 1 ] ).to.deep.equal( { value: 'right' } );
		} );
	} );

	describe( 'alignment:center button', () => {
		beforeEach( () => {
			command = editor.commands.get( 'alignment' );
			button = editor.ui.componentFactory.create( 'alignment:center' );
		} );

		it( 'has the base properties', () => {
			expect( button ).to.have.property( 'label', 'Align center' );
			expect( button ).to.have.property( 'icon' );
			expect( button ).to.have.property( 'tooltip', true );
		} );

		it( 'has isOn bound to command\'s value', () => {
			command.value = false;
			expect( button ).to.have.property( 'isOn', false );

			command.value = 'center';
			expect( button ).to.have.property( 'isOn', true );

			command.value = 'justify';
			expect( button ).to.have.property( 'isOn', false );
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
			expect( spy.args[ 0 ][ 0 ] ).to.equal( 'alignment' );
			expect( spy.args[ 0 ][ 1 ] ).to.deep.equal( { value: 'center' } );
		} );
	} );

	describe( 'alignment:justify button', () => {
		beforeEach( () => {
			command = editor.commands.get( 'alignment' );
			button = editor.ui.componentFactory.create( 'alignment:justify' );
		} );

		it( 'has the base properties', () => {
			expect( button ).to.have.property( 'label', 'Justify' );
			expect( button ).to.have.property( 'icon' );
			expect( button ).to.have.property( 'tooltip', true );
		} );

		it( 'has isOn bound to command\'s value', () => {
			command.value = false;
			expect( button ).to.have.property( 'isOn', false );

			command.value = 'justify';
			expect( button ).to.have.property( 'isOn', true );

			command.value = 'center';
			expect( button ).to.have.property( 'isOn', false );
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
			expect( spy.args[ 0 ][ 0 ] ).to.equal( 'alignment' );
			expect( spy.args[ 0 ][ 1 ] ).to.deep.equal( { value: 'justify' } );
		} );
	} );

	describe( 'alignment', () => {
		let dropdown;

		beforeEach( () => {
			command = editor.commands.get( 'alignment' );
			dropdown = editor.ui.componentFactory.create( 'alignment' );
		} );

		it( '#buttonView has the base properties', () => {
			const button = dropdown.buttonView;

			expect( button ).to.have.property( 'label', 'Text alignment' );
			expect( button ).to.have.property( 'icon' );
			expect( button ).to.have.property( 'tooltip', true );
		} );

		it( 'should add custom CSS class to dropdown', () => {
			dropdown.render();

			expect( dropdown.element.classList.contains( 'ck-alignment-dropdown' ) ).to.be.true;
		} );

		it( '#toolbarView has the basic properties', () => {
			const toolbarView = dropdown.toolbarView;

			expect( toolbarView ).to.have.property( 'isVertical', true );
			expect( toolbarView ).to.have.property( 'ariaLabel', 'Text alignment toolbar' );
		} );

		it( 'should hold defined buttons', () => {
			const items = [ ...dropdown.toolbarView.items ].map( item => item.label );

			expect( items ).to.have.length( 4 );

			expect( items.includes( 'Align left' ) ).to.be.true;
			expect( items.includes( 'Align right' ) ).to.be.true;
			expect( items.includes( 'Align center' ) ).to.be.true;
			expect( items.includes( 'Justify' ) ).to.be.true;
		} );

		describe( 'config', () => {
			beforeEach( async () => {
				// Clean up the editor created in main test suite hook.
				await editor.destroy();

				return ClassicTestEditor
					.create( element, {
						plugins: [ AlignmentEditing, AlignmentUI ],
						alignment: { options: [ 'center', 'justify' ] }
					} )
					.then( newEditor => {
						editor = newEditor;

						dropdown = editor.ui.componentFactory.create( 'alignment' );
						command = editor.commands.get( 'alignment' );
						button = editor.ui.componentFactory.create( 'alignment:center' );
					} );
			} );

			it( 'should hold only defined buttons', () => {
				const items = [ ...dropdown.toolbarView.items ].map( item => item.label );

				expect( items ).to.have.length( 2 );

				expect( items.includes( 'Align center' ) ).to.be.true;
				expect( items.includes( 'Justify' ) ).to.be.true;
			} );

			it( 'should have default icon set (LTR content)', () => {
				expect( dropdown.buttonView.icon ).to.equal( alignLeftIcon );
			} );

			it( 'should have default icon set (RTL content)', async () => {
				// Clean up the editor created in main test suite hook.
				await editor.destroy();

				return ClassicTestEditor
					.create( element, {
						language: {
							content: 'ar'
						},
						plugins: [ AlignmentEditing, AlignmentUI ],
						alignment: { options: [ 'center', 'justify' ] }
					} )
					.then( newEditor => {
						dropdown = newEditor.ui.componentFactory.create( 'alignment' );

						expect( dropdown.buttonView.icon ).to.equal( alignRightIcon );

						return newEditor.destroy();
					} );
			} );

			it( 'should change icon to active alignment', () => {
				command.value = 'center';

				expect( dropdown.buttonView.icon ).to.equal( button.icon );
			} );
		} );
	} );
} );
