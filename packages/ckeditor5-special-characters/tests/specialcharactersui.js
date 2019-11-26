/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* global document */

import SpecialCharacters from '../src/specialcharacters';
import SpecialCharactersMathematical from '../src/specialcharactersmathematical';
import SpecialCharactersArrows from '../src/specialcharactersarrows';
import SpecialCharactersUI from '../src/specialcharactersui';
import SpecialCharactersNavigationView from '../src/ui/specialcharactersnavigationview';
import CharacterGridView from '../src/ui/charactergridview';
import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor';
import specialCharactersIcon from '../theme/icons/specialcharacters.svg';
import EventInfo from '@ckeditor/ckeditor5-utils/src/eventinfo';

describe( 'SpecialCharactersUI', () => {
	let editor, command, element;

	beforeEach( () => {
		element = document.createElement( 'div' );
		document.body.appendChild( element );

		return ClassicTestEditor
			.create( element, {
				plugins: [
					SpecialCharacters,
					SpecialCharactersMathematical,
					SpecialCharactersArrows,
					SpecialCharactersUI
				]
			} )
			.then( newEditor => {
				editor = newEditor;
				command = editor.commands.get( 'specialCharacters' );
			} );
	} );

	afterEach( () => {
		element.remove();

		return editor.destroy();
	} );

	it( 'should be named', () => {
		expect( SpecialCharactersUI.pluginName ).to.equal( 'SpecialCharactersUI' );
	} );

	describe( '"specialCharacters" dropdown', () => {
		let dropdown;

		beforeEach( () => {
			dropdown = editor.ui.componentFactory.create( 'specialCharacters' );
		} );

		afterEach( () => {
			dropdown.destroy();
		} );

		it( 'has a navigation view', () => {
			expect( dropdown.panelView.children.first ).to.be.instanceOf( SpecialCharactersNavigationView );
		} );

		it( 'has a grid view', () => {
			expect( dropdown.panelView.children.last ).to.be.instanceOf( CharacterGridView );
		} );

		describe( '#buttonView', () => {
			it( 'should get basic properties', () => {
				expect( dropdown.buttonView.label ).to.equal( 'Special characters' );
				expect( dropdown.buttonView.icon ).to.equal( specialCharactersIcon );
				expect( dropdown.buttonView.tooltip ).to.be.true;
			} );

			it( 'should bind #isEnabled to the command', () => {
				expect( dropdown.isEnabled ).to.be.true;

				command.isEnabled = false;
				expect( dropdown.isEnabled ).to.be.false;
			} );
		} );

		it( 'executes a command and focuses the editing view', () => {
			const grid = dropdown.panelView.children.last;
			const executeSpy = sinon.stub( editor, 'execute' );
			const focusSpy = sinon.stub( editor.editing.view, 'focus' );

			grid.tiles.get( 2 ).fire( 'execute' );

			sinon.assert.calledOnce( executeSpy );
			sinon.assert.calledOnce( focusSpy );
			sinon.assert.calledWithExactly( executeSpy.firstCall, 'specialCharacters', {
				item: 'Less-than or equal to'
			} );
		} );

		describe( 'grid view', () => {
			let grid;

			beforeEach( () => {
				grid = dropdown.panelView.children.last;
			} );

			it( 'delegates #execute to the dropdown', () => {
				const spy = sinon.spy();

				dropdown.on( 'execute', spy );
				grid.fire( 'execute', { name: 'foo' } );

				sinon.assert.calledOnce( spy );
			} );

			it( 'has default contents', () => {
				expect( grid.tiles ).to.have.length.greaterThan( 10 );
			} );

			it( 'is updated when navigation view fires #execute', () => {
				const navigation = dropdown.panelView.children.first;

				expect( grid.tiles.get( 0 ).label ).to.equal( '<' );
				navigation.groupDropdownView.fire( new EventInfo( { label: 'Arrows' }, 'execute' ) );

				expect( grid.tiles.get( 0 ).label ).to.equal( '⇐' );
			} );
		} );
	} );
} );
