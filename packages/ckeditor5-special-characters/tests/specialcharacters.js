/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { IconSpecialCharacters } from 'ckeditor5/src/icons.js';
import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor.js';
import EventInfo from '@ckeditor/ckeditor5-utils/src/eventinfo.js';
import Typing from '@ckeditor/ckeditor5-typing/src/typing.js';
import SpecialCharacters from '../src/specialcharacters.js';
import SpecialCharactersMathematical from '../src/specialcharactersmathematical.js';
import SpecialCharactersArrows from '../src/specialcharactersarrows.js';
import CharacterGridView from '../src/ui/charactergridview.js';
import CharacterInfoView from '../src/ui/characterinfoview.js';
import { expectToThrowCKEditorError } from '@ckeditor/ckeditor5-utils/tests/_utils/utils.js';
import SpecialCharactersCategoriesView from '../src/ui/specialcharacterscategoriesview.js';
import { Dialog } from '@ckeditor/ckeditor5-ui';
import SpecialCharactersView from '../src/ui/specialcharactersview.js';

describe( 'SpecialCharacters', () => {
	let editor, element, command, plugin, button, dialog;

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
				command = editor.commands.get( 'insertText' );
				plugin = editor.plugins.get( SpecialCharacters );
				dialog = editor.plugins.get( 'Dialog' );
			} );
	} );

	afterEach( () => {
		element.remove();

		return editor.destroy();
	} );

	it( 'should require proper plugins', () => {
		expect( SpecialCharacters.requires ).to.deep.equal( [ Typing, Dialog ] );
	} );

	it( 'should be named', () => {
		expect( SpecialCharacters.pluginName ).to.equal( 'SpecialCharacters' );
	} );

	it( 'should have `isOfficialPlugin` static flag set to `true`', () => {
		expect( SpecialCharacters.isOfficialPlugin ).to.be.true;
	} );

	it( 'should have `isPremiumPlugin` static flag set to `false`', () => {
		expect( SpecialCharacters.isPremiumPlugin ).to.be.false;
	} );

	describe( 'toolbar button', () => {
		beforeEach( () => {
			button = editor.ui.componentFactory.create( 'specialCharacters' );
		} );

		it( 'should have a tooltip', () => {
			expect( button.tooltip ).to.be.true;
		} );

		testButton();
	} );

	describe( 'menu bar button', () => {
		beforeEach( () => {
			button = editor.ui.componentFactory.create( 'menuBar:specialCharacters' );
		} );

		testButton();
	} );

	function testButton() {
		it( 'should get basic properties', () => {
			expect( button.label ).to.equal( 'Special characters' );
			expect( button.icon ).to.equal( IconSpecialCharacters );
			expect( button.isToggleable ).to.be.true;
		} );

		it( 'should bind #isEnabled to the command', () => {
			expect( button.isEnabled ).to.be.true;

			command.isEnabled = false;
			expect( button.isEnabled ).to.be.false;
			command.isEnabled = true;
		} );

		it( 'should open special characters dialog when pressed', () => {
			button.fire( 'execute' );

			expect( dialog.id == 'specialCharacters' );
		} );

		it( 'should close dialog when pressed when dialog opened', () => {
			button.fire( 'execute' );
			button.fire( 'execute' );

			expect( dialog.id == null );
		} );
	}

	describe( 'dialog', () => {
		let button, dialogContent;

		beforeEach( () => {
			button = editor.ui.componentFactory.create( 'specialCharacters' );
			button.fire( 'execute' );
			dialogContent = dialog.view.contentView.children.first;
		} );

		afterEach( () => {
			button.destroy();
		} );

		it( 'has content of type SpecialCharactersView', () => {
			expect( dialogContent ).to.be.instanceOf( SpecialCharactersView );
		} );

		it( 'has a categories view', () => {
			expect( dialogContent.categoriesView ).to.be.instanceOf( SpecialCharactersCategoriesView );
		} );

		it( 'the categories dropdown contains the "All" special category', () => {
			const groupDropdownView = dialogContent.categoriesView._dropdownView.fieldView;

			groupDropdownView.isOpen = true;

			const listView = groupDropdownView.panelView.children.first;

			// "Mathematical" and "Arrows" are provided by other plugins. "All" is being added by SpecialCharacters itself.
			expect( listView.items.length ).to.equal( 3 );
			expect( listView.items.first.children.first.label ).to.equal( 'All' );
		} );

		it( 'has a grid view', () => {
			expect( dialogContent.gridView ).to.be.instanceOf( CharacterGridView );
		} );

		it( 'has a character info view', () => {
			expect( dialogContent.infoView ).to.be.instanceOf( CharacterInfoView );
		} );

		it( 'executes a command and doesn\'t focus the editor', () => {
			const grid = dialogContent.gridView;
			const executeSpy = sinon.stub( editor, 'execute' );
			const focusSpy = sinon.stub( editor.editing.view, 'focus' );

			grid.tiles.get( 2 ).fire( 'execute' );

			sinon.assert.calledOnce( executeSpy );
			sinon.assert.notCalled( focusSpy );
			sinon.assert.calledWithExactly( executeSpy.firstCall, 'insertText', {
				text: '≤'
			} );
		} );

		describe( 'grid view', () => {
			let grid;

			beforeEach( () => {
				grid = dialogContent.gridView;
			} );

			it( 'has default contents', () => {
				expect( grid.tiles ).to.have.length.greaterThan( 10 );
			} );

			it( 'is updated when categories view fires #execute', () => {
				const categoriesView = dialogContent.categoriesView;

				expect( grid.tiles.get( 0 ).label ).to.equal( '<' );
				categoriesView._dropdownView.fieldView.fire( new EventInfo( { name: 'Arrows' }, 'execute' ) );

				expect( grid.tiles.get( 0 ).label ).to.equal( '←' );
			} );
		} );

		describe( 'character info view', () => {
			let grid, characterInfo;

			beforeEach( () => {
				grid = dialogContent.gridView;
				characterInfo = dialogContent.infoView;
			} );

			it( 'is empty when the dropdown was shown', () => {
				// dropdown.fire( 'change:isOpen' );

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

			it( 'is updated when the tile fires #focus', () => {
				const tile = grid.tiles.get( 0 );

				tile.fire( 'focus' );

				expect( tile.label ).to.equal( '<' );
				expect( characterInfo.character ).to.equal( '<' );
				expect( characterInfo.name ).to.equal( 'Less-than sign' );
				expect( characterInfo.code ).to.equal( 'U+003c' );
			} );
		} );
	} );

	describe( 'addItems()', () => {
		it( 'adds special characters to the available symbols', () => {
			const startingGroupSize = plugin._groups.size;
			const startingCharacterSize = plugin._characters.size;

			plugin.addItems( 'Custom arrows', [
				{ title: 'custom arrow left', character: '←' },
				{ title: 'custom arrow right', character: '→' }
			] );

			expect( plugin._groups.size ).to.equal( startingGroupSize + 1 );
			expect( plugin._groups.has( 'Custom arrows' ) ).to.equal( true );

			expect( plugin._characters.size ).to.equal( startingCharacterSize + 2 );
			expect( plugin._characters.has( 'custom arrow left' ) ).to.equal( true );
			expect( plugin._characters.has( 'custom arrow right' ) ).to.equal( true );
		} );

		it( 'works with subsequent calls to the same group', () => {
			const startingGroupSize = plugin._groups.size;
			const startingCharacterSize = plugin._characters.size;

			plugin.addItems( 'Custom mathematical', [
				{
					title: 'dot',
					character: '.'
				}
			] );

			plugin.addItems( 'Custom mathematical', [
				{
					title: ',',
					character: 'comma'
				}
			] );

			const groups = Array.from( plugin.getGroups() );

			expect( groups ).to.contains( 'Custom mathematical' );
			expect( plugin._groups.size ).to.equal( startingGroupSize + 1 );
			expect( plugin._characters.size ).to.equal( startingCharacterSize + 2 );
		} );

		it( 'allows defining a displayed label different from a category name', () => {
			plugin.addItems( 'Symbols', [
				{ title: 'arrow left', character: '←' },
				{ title: 'arrow right', character: '→' }
			], { label: 'Custom arrows plugin' } );

			expect( plugin._groups.has( 'Symbols' ) ).to.equal( true );

			const arrowGroup = plugin._groups.get( 'Symbols' );

			expect( arrowGroup ).to.have.property( 'label', 'Custom arrows plugin' );
			expect( arrowGroup ).to.have.property( 'items' );
			expect( arrowGroup.items.size ).to.equal( 2 );
			expect( arrowGroup.items.has( 'arrow left' ) ).to.equal( true );
			expect( arrowGroup.items.has( 'arrow right' ) ).to.equal( true );
		} );

		it( 'does not accept "All" as a group name', () => {
			expectToThrowCKEditorError( () => {
				plugin.addItems( 'All', [] );
			}, /special-character-invalid-group-name/ );
		} );
	} );

	describe( 'getGroups()', () => {
		it( 'returns iterator of defined groups in the registration order by default', () => {
			const groups = Array.from( plugin.getGroups() );

			expect( groups ).to.deep.equal( [ 'Mathematical', 'Arrows' ] );
		} );

		it( 'returns iterator of defined groups in the order defined in the config', () => {
			editor.config.set( 'specialCharacters.order', [
				'Arrows',
				'Mathematical'
			] );

			const groups = Array.from( plugin.getGroups() );

			expect( groups ).to.deep.equal( [ 'Arrows', 'Mathematical' ] );
		} );

		it( 'returns iterator of all defined groups even if order doesn\'t contain some of them', () => {
			editor.config.set( 'specialCharacters.order', [
				'Arrows'
			] );

			const groups = Array.from( plugin.getGroups() );

			expect( groups ).to.deep.equal( [ 'Arrows', 'Mathematical' ] );
		} );

		it( 'throws an error if order contains invalid category', () => {
			editor.config.set( 'specialCharacters.order', [
				'Invalid category'
			] );

			expectToThrowCKEditorError(
				() => plugin.getGroups(),
				'special-character-invalid-order-group-name'
			);
		} );
	} );

	describe( 'getCharactersForGroup()', () => {
		it( 'returns a collection of defined special characters names', () => {
			const startingCharacterSize = plugin.getCharactersForGroup( 'Mathematical' ).size;
			plugin.addItems( 'Mathematical', [
				{ title: 'custom precedes', character: '≺' },
				{ title: 'custom succeeds', character: '≻' }
			] );

			const characters = plugin.getCharactersForGroup( 'Mathematical' );

			expect( characters.size ).to.equal( startingCharacterSize + 2 );
			expect( characters.has( 'custom precedes' ) ).to.equal( true );
			expect( characters.has( 'custom succeeds' ) ).to.equal( true );
		} );

		it( 'returns a collection of all special characters for "All" group', () => {
			const startingCharacterSize = plugin._characters.size;

			plugin.addItems( 'Custom arrows', [
				{ title: 'custom arrow left', character: '←' },
				{ title: 'custom arrow right', character: '→' }
			] );

			plugin.addItems( 'Custom mathematical', [
				{ title: 'custom precedes', character: '≺' },
				{ title: 'custom succeeds', character: '≻' }
			] );

			const characters = plugin.getCharactersForGroup( 'All' );

			expect( characters.size ).to.equal( startingCharacterSize + 4 );
			expect( characters.has( 'custom arrow left' ) ).to.equal( true );
			expect( characters.has( 'custom arrow right' ) ).to.equal( true );
			expect( characters.has( 'custom precedes' ) ).to.equal( true );
			expect( characters.has( 'custom succeeds' ) ).to.equal( true );
		} );

		it( 'returns undefined for non-existing group', () => {
			plugin.addItems( 'Custom mathematical', [
				{ title: 'precedes', character: '≺' },
				{ title: 'succeeds', character: '≻' }
			] );

			const characters = plugin.getCharactersForGroup( 'Foo' );

			expect( characters ).to.be.undefined;
		} );
	} );

	describe( 'getCharacter()', () => {
		it( 'returns a collection of defined special characters names', () => {
			plugin.addItems( 'Custom mathematical', [
				{ title: 'custom precedes', character: '≺' },
				{ title: 'custom succeeds', character: '≻' }
			] );

			expect( plugin.getCharacter( 'custom succeeds' ) ).to.equal( '≻' );
		} );

		it( 'returns undefined for non-existing character', () => {
			expect( plugin.getCharacter( 'custom succeeds' ) ).to.be.undefined;
		} );
	} );
} );
