/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module special-characters/specialcharactersui
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import { createDropdown } from '@ckeditor/ckeditor5-ui/src/dropdown/utils';
import specialCharactersIcon from '../theme/icons/specialcharacters.svg';
import InsertSpecialCharacterCommand from './insertspecialcharactercommand';
import CharacterGridView from './ui/charactergridview';
import SpecialCharactersNavigationView from './ui/specialcharactersnavigationview';

/**
 * The special characters UI plugin.
 *
 * @extends module:core/plugin~Plugin
 */
export default class SpecialCharactersUI extends Plugin {
	init() {
		const editor = this.editor;
		const t = editor.t;
		const specialCharsPlugin = editor.plugins.get( 'SpecialCharacters' );
		const command = new InsertSpecialCharacterCommand( editor );

		editor.commands.add( 'specialCharacters', command );

		// Add the `specialCharacters` dropdown button to feature components.
		editor.ui.componentFactory.add( 'specialCharacters', locale => {
			const dropdownView = createDropdown( locale );
			const navigationView = new SpecialCharactersNavigationView( locale, specialCharsPlugin.getGroups() );
			const symbolGridView = new CharacterGridView( this.locale, {
				columns: 10
			} );

			symbolGridView.delegate( 'execute' ).to( dropdownView );

			// Set the initial content of the special characters grid.
			this._updateGrid( specialCharsPlugin, navigationView.currentGroupName, symbolGridView );

			// Update the grid of special characters when a user changed the character group.
			navigationView.on( 'execute', () => {
				this._updateGrid( specialCharsPlugin, navigationView.currentGroupName, symbolGridView );
			} );

			dropdownView.buttonView.set( {
				label: t( 'Special characters' ),
				icon: specialCharactersIcon,
				tooltip: true
			} );

			dropdownView.bind( 'isEnabled' ).to( command );

			// Insert a special character when a tile was clicked.
			dropdownView.on( 'execute', ( evt, data ) => {
				editor.execute( 'specialCharacters', { item: data.name } );
				editor.editing.view.focus();
			} );

			dropdownView.panelView.children.add( navigationView );
			dropdownView.panelView.children.add( symbolGridView );

			return dropdownView;
		} );
	}

	/**
	 * Updates the symbol grid depending on the currently selected character group.
	 *
	 * @private
	 * @param {module:special-characters/specialcharacters~SpecialCharacters} specialCharsPlugin
	 * @param {module:special-characters/ui/specialcharactersnavigationview~SpecialCharactersNavigationView#currentGroupName}
	 * currentGroupName
	 * @param {module:special-characters/ui/charactergridview~CharacterGridView} gridView
	 */
	_updateGrid( specialCharsPlugin, currentGroupName, gridView ) {
		// Updating the grid starts with removing all tiles belonging to the old group.
		gridView.tiles.clear();

		const characterTitles = specialCharsPlugin.getCharactersForGroup( currentGroupName );

		for ( const title of characterTitles ) {
			const character = specialCharsPlugin.getCharacter( title );

			gridView.tiles.add( gridView.createTile( character, title ) );
		}
	}
}

