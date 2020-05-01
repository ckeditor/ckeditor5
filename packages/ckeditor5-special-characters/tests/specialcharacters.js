/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* global document */

import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor';
import EventInfo from '@ckeditor/ckeditor5-utils/src/eventinfo';
import Typing from '@ckeditor/ckeditor5-typing/src/typing';
import SpecialCharacters from '../src/specialcharacters';
import SpecialCharactersMathematical from '../src/specialcharactersmathematical';
import SpecialCharactersArrows from '../src/specialcharactersarrows';
import SpecialCharactersNavigationView from '../src/ui/specialcharactersnavigationview';
import CharacterGridView from '../src/ui/charactergridview';
import CharacterInfoView from '../src/ui/characterinfoview';
import specialCharactersIcon from '../theme/icons/specialcharacters.svg';
import { expectToThrowCKEditorError } from '@ckeditor/ckeditor5-utils/tests/_utils/utils';

describe( 'SpecialCharacters', () => {
	let plugin;

	beforeEach( () => {
		plugin = new SpecialCharacters( {} );
	} );

	it( 'should require proper plugins', () => {
		expect( SpecialCharacters.requires ).to.deep.equal( [ Typing ] );
	} );

	it( 'should be named', () => {
		expect( SpecialCharacters.pluginName ).to.equal( 'SpecialCharacters' );
	} );

	describe( 'init()', () => {
		let editor, command, element;

		beforeEach( () => {
			element = document.createElement( 'div' );
			document.body.appendChild( element );

			return ClassicTestEditor
				.create( element, {
					plugins: [
						SpecialCharacters,
						SpecialCharactersMathematical,
						SpecialCharactersArrows
					]
				} )
				.then( newEditor => {
					editor = newEditor;
					command = editor.commands.get( 'input' );
				} );
		} );

		afterEach( () => {
			element.remove();

			return editor.destroy();
		} );

		describe( '"specialCharacters" dropdown', () => {
			let dropdown;

			beforeEach( () => {
				dropdown = editor.ui.componentFactory.create( 'specialCharacters' );
				dropdown.isOpen = true; // Dropdown is lazy loaded, so needs to be open to be verified (#6175).
			} );

			afterEach( () => {
				dropdown.destroy();
			} );

			it( 'has a navigation view', () => {
				expect( dropdown.panelView.children.first ).to.be.instanceOf( SpecialCharactersNavigationView );
			} );

			it( 'a navigation contains the "All" special category', () => {
				const listView = dropdown.panelView.children.first.groupDropdownView.panelView.children.first;

				// "Mathematical" and "Arrows" are provided by other plugins. "All" is being added by SpecialCharacters itself.
				expect( listView.items.length ).to.equal( 3 );
				expect( listView.items.first.children.first.label ).to.equal( 'All' );
			} );

			it( 'has a grid view', () => {
				expect( dropdown.panelView.children.get( 1 ) ).to.be.instanceOf( CharacterGridView );
			} );

			it( 'has a character info view', () => {
				expect( dropdown.panelView.children.last ).to.be.instanceOf( CharacterInfoView );
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
					command.isEnabled = true;
				} );
			} );

			it( 'executes a command and focuses the editing view', () => {
				const grid = dropdown.panelView.children.get( 1 );
				const executeSpy = sinon.stub( editor, 'execute' );
				const focusSpy = sinon.stub( editor.editing.view, 'focus' );

				grid.tiles.get( 2 ).fire( 'execute' );

				sinon.assert.calledOnce( executeSpy );
				sinon.assert.calledOnce( focusSpy );
				sinon.assert.calledWithExactly( executeSpy.firstCall, 'input', {
					text: '≤'
				} );
			} );

			describe( 'grid view', () => {
				let grid;

				beforeEach( () => {
					grid = dropdown.panelView.children.get( 1 );
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

			describe( 'character info view', () => {
				let grid, characterInfo;

				beforeEach( () => {
					grid = dropdown.panelView.children.get( 1 );
					characterInfo = dropdown.panelView.children.last;
				} );

				it( 'is empty when the dropdown was shown', () => {
					dropdown.fire( 'change:isOpen' );

					expect( characterInfo.character ).to.equal( null );
					expect( characterInfo.name ).to.equal( null );
					expect( characterInfo.code ).to.equal( '' );
				} );

				it( 'is updated when the tile fires #mouseover', () => {
					const tile = grid.tiles.get( 0 );

					tile.fire( 'mouseover' );

					expect( tile.label ).to.equal( '<' );
					expect( characterInfo.character ).to.equal( '<' );
					expect( characterInfo.name ).to.equal( 'Less-than sign' );
					expect( characterInfo.code ).to.equal( 'U+003c' );
				} );
			} );

			it( 'is not fully initialized when not open', () => {
				// (#6175)
				const uninitializedDropdown = editor.ui.componentFactory.create( 'specialCharacters' );
				expect( uninitializedDropdown.panelView.children.length ).to.equal( 0 );
			} );
		} );
	} );

	describe( 'addItems()', () => {
		it( 'adds special characters to the available symbols', () => {
			plugin.addItems( 'Arrows', [
				{ title: 'arrow left', character: '←' },
				{ title: 'arrow right', character: '→' }
			] );

			expect( plugin._groups.size ).to.equal( 1 );
			expect( plugin._groups.has( 'Arrows' ) ).to.equal( true );

			expect( plugin._characters.size ).to.equal( 2 );
			expect( plugin._characters.has( 'arrow left' ) ).to.equal( true );
			expect( plugin._characters.has( 'arrow right' ) ).to.equal( true );
		} );

		it( 'works with subsequent calls to the same group', () => {
			plugin.addItems( 'Mathematical', [
				{
					title: 'dot',
					character: '.'
				}
			] );

			plugin.addItems( 'Mathematical', [
				{
					title: ',',
					character: 'comma'
				}
			] );

			const groups = [ ...plugin.getGroups() ];
			expect( groups ).to.deep.equal( [ 'Mathematical' ] );
		} );

		it( 'does not accept "All" as a group name', () => {
			expectToThrowCKEditorError( () => {
				plugin.addItems( 'All', [] );
			}, /special-character-invalid-group-name/ );
		} );
	} );

	describe( 'getGroups()', () => {
		it( 'returns iterator of defined groups', () => {
			plugin.addItems( 'Arrows', [
				{ title: 'arrow left', character: '←' }
			] );

			plugin.addItems( 'Mathematical', [
				{ title: 'precedes', character: '≺' },
				{ title: 'succeeds', character: '≻' }
			] );

			const groups = [ ...plugin.getGroups() ];
			expect( groups ).to.deep.equal( [ 'Arrows', 'Mathematical' ] );
		} );
	} );

	describe( 'getCharactersForGroup()', () => {
		it( 'returns a collection of defined special characters names', () => {
			plugin.addItems( 'Mathematical', [
				{ title: 'precedes', character: '≺' },
				{ title: 'succeeds', character: '≻' }
			] );

			const characters = plugin.getCharactersForGroup( 'Mathematical' );

			expect( characters.size ).to.equal( 2 );
			expect( characters.has( 'precedes' ) ).to.equal( true );
			expect( characters.has( 'succeeds' ) ).to.equal( true );
		} );

		it( 'returns a collection of all special characters for "All" group', () => {
			plugin.addItems( 'Arrows', [
				{ title: 'arrow left', character: '←' },
				{ title: 'arrow right', character: '→' }
			] );

			plugin.addItems( 'Mathematical', [
				{ title: 'precedes', character: '≺' },
				{ title: 'succeeds', character: '≻' }
			] );

			const characters = plugin.getCharactersForGroup( 'All' );

			expect( characters.size ).to.equal( 4 );
			expect( characters.has( 'arrow left' ) ).to.equal( true );
			expect( characters.has( 'arrow right' ) ).to.equal( true );
			expect( characters.has( 'precedes' ) ).to.equal( true );
			expect( characters.has( 'succeeds' ) ).to.equal( true );
		} );

		it( 'returns undefined for non-existing group', () => {
			plugin.addItems( 'Mathematical', [
				{ title: 'precedes', character: '≺' },
				{ title: 'succeeds', character: '≻' }
			] );

			const characters = plugin.getCharactersForGroup( 'Foo' );

			expect( characters ).to.be.undefined;
		} );
	} );

	describe( 'getCharacter()', () => {
		it( 'returns a collection of defined special characters names', () => {
			plugin.addItems( 'Mathematical', [
				{ title: 'precedes', character: '≺' },
				{ title: 'succeeds', character: '≻' }
			] );

			expect( plugin.getCharacter( 'succeeds' ) ).to.equal( '≻' );
		} );

		it( 'returns undefined for non-existing character', () => {
			expect( plugin.getCharacter( 'succeeds' ) ).to.be.undefined;
		} );
	} );
} );
