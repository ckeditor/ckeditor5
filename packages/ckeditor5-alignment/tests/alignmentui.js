/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* global document */

import AlignmentEditing from '../src/alignmentediting';
import AlignmentUI from '../src/alignmentui';

import alignLeftIcon from '../theme/icons/align-left.svg';

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

	describe( 'alignmentDropdown', () => {
		let dropdown;

		beforeEach( () => {
			command = editor.commands.get( 'alignLeft' );
			dropdown = editor.ui.componentFactory.create( 'alignmentDropdown' );
		} );

		it( 'button has the base properties', () => {
			const button = dropdown.buttonView;

			expect( button ).to.have.property( 'label', 'Text alignment' );
			expect( button ).to.have.property( 'icon' );
			expect( button ).to.have.property( 'tooltip', true );
			expect( button ).to.have.property( 'withText', false );
		} );

		it( '#toolbarView has the base properties', () => {
			const toolbarView = dropdown.toolbarView;

			expect( toolbarView ).to.have.property( 'className', 'ck-editor-toolbar' );
			expect( toolbarView ).to.have.property( 'isVertical', true );
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
			beforeEach( () => {
				element = document.createElement( 'div' );
				document.body.appendChild( element );

				return ClassicTestEditor
					.create( element, {
						plugins: [ AlignmentEditing, AlignmentUI ],
						alignment: { styles: [ 'center', 'justify' ] }
					} )
					.then( newEditor => {
						editor = newEditor;

						dropdown = editor.ui.componentFactory.create( 'alignmentDropdown' );
						command = editor.commands.get( 'alignCenter' );
						button = editor.ui.componentFactory.create( 'alignCenter' );
					} );
			} );

			it( 'should hold only defined buttons', () => {
				const items = [ ...dropdown.toolbarView.items ].map( item => item.label );

				expect( items ).to.have.length( 2 );

				expect( items.includes( 'Align center' ) ).to.be.true;
				expect( items.includes( 'Justify' ) ).to.be.true;
			} );

			it( 'should have default icon set', () => {
				expect( dropdown.buttonView.icon ).to.equal( alignLeftIcon );
			} );

			it( 'should change icon to active alignment', () => {
				command.value = true;

				expect( dropdown.buttonView.icon ).to.equal( button.icon );
			} );
		} );
	} );
} );
