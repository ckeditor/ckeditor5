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
import CharacterGridView from './ui/charactergridview';
import SpecialCharactersNavigationView from './ui/specialcharactersnavigationview';
import Typing from '@ckeditor/ckeditor5-typing/src/typing';

/**
 * The special characters UI plugin.
 *
 * Introduces the `'specialCharacters'` dropdown.
 *
 * @extends module:core/plugin~Plugin
 */
export default class SpecialCharactersUI extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get pluginName() {
		return 'SpecialCharactersUI';
	}

	/**
	 * @inheritDoc
	 */
	static get requires() {
		return [ Typing ];
	}

	/**
	 * @inheritDoc
	 */
	init() {
		const editor = this.editor;
		const t = editor.t;

		const inputCommand = editor.commands.get( 'input' );
		const specialCharsPlugin = editor.plugins.get( 'SpecialCharacters' );

		// Add the `specialCharacters` dropdown button to feature components.
		editor.ui.componentFactory.add( 'specialCharacters', locale => {
			const dropdownView = createDropdown( locale );
			const navigationView = new SpecialCharactersNavigationView( locale, specialCharsPlugin.getGroups() );
			const gridView = new CharacterGridView( this.locale, {
				columns: 10
			} );

			gridView.delegate( 'execute' ).to( dropdownView );

			// Set the initial content of the special characters grid.
			this._updateGrid( specialCharsPlugin, navigationView.currentGroupName, gridView );

			// Update the grid of special characters when a user changed the character group.
			navigationView.on( 'execute', () => {
				this._updateGrid( specialCharsPlugin, navigationView.currentGroupName, gridView );
			} );

			dropdownView.buttonView.set( {
				label: t( 'Special characters' ),
				icon: specialCharactersIcon,
				tooltip: true
			} );

			dropdownView.bind( 'isEnabled' ).to( inputCommand );

			// Insert a special character when a tile was clicked.
			dropdownView.on( 'execute', ( evt, data ) => {
				editor.execute( 'input', { text: data.character } );
				editor.editing.view.focus();
			} );

			dropdownView.panelView.children.add( navigationView );
			dropdownView.panelView.children.add( gridView );

			return dropdownView;
		} );
	}

	/**
	 * Updates the symbol grid depending on the currently selected character group.
	 *
	 * @private
	 * @param {module:special-characters/specialcharacters~SpecialCharacters} specialCharsPlugin
	 * @param {String} currentGroupName
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

