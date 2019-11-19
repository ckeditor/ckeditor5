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
import SpecialCharactersTableView from './ui/specialcharacterstableview';
import SpecialCharactersSelectView from './ui/specialcharactersselectview';

/**
 * The special characters UI plugin.
 *
 * @extends module:core/plugin~Plugin
 */
export default class SpecialCharactersUI extends Plugin {
	init() {
		const editor = this.editor;
		const t = editor.t;
		const specialCharacterPlugin = editor.plugins.get( 'SpecialCharacters' );
		const label = t( 'Special characters' );

		const command = new InsertSpecialCharacterCommand( editor );
		editor.commands.add( 'specialCharacters', command );

		// Add the `specialCharacters` dropdown button to feature components.
		editor.ui.componentFactory.add( 'specialCharacters', locale => {
			// Prepare the dropdown element.
			const dropdownView = createDropdown( locale );

			dropdownView.buttonView.set( {
				label,
				icon: specialCharactersIcon,
				tooltip: true
			} );

			dropdownView.bind( 'isEnabled' ).to( command );

			const specialCharactersSelectView = new SpecialCharactersSelectView( locale, {
				labelText: label,
				selectOptions: getSelectViewOptions()
			} );

			const symbolTableView = new SpecialCharactersTableView( locale, {
				columns: 10 // TODO: Read from config.
			} );

			symbolTableView.delegate( 'execute' ).to( dropdownView, 'execute' );

			// Insert a special character when a tile was clicked.
			dropdownView.on( 'execute', ( evt, data ) => {
				command.execute( { item: data.title } );
			} );

			// Draw special characters tiles when the dropdown is open.
			dropdownView.on( 'change:isOpen', ( evt, name, isVisible ) => {
				if ( !isVisible ) {
					return;
				}

				printCharacters( specialCharactersSelectView, symbolTableView.symbolGridView );
			} );

			// Draw special characters tiles for specified category (when a user has changed it).
			specialCharactersSelectView.on( 'input', () => {
				printCharacters( specialCharactersSelectView, symbolTableView.symbolGridView );
			} );

			dropdownView.panelView.children.add( specialCharactersSelectView );
			dropdownView.panelView.children.add( symbolTableView );

			return dropdownView;
		} );

		function printCharacters( selectView, gridView ) {
			// TODO: Keyboard navigation.
			gridView.items.clear();

			const groupName = selectView.value;
			const characterTitles = specialCharacterPlugin.getCharactersForGroup( groupName );

			for ( const title of characterTitles ) {
				const character = specialCharacterPlugin.getCharacter( title );

				gridView.items.add( gridView.createSymbolTile( character, title ) );
			}
		}

		function getSelectViewOptions() {
			return [ ...specialCharacterPlugin.getGroups() ]
				.map( groupName => ( { label: groupName, value: groupName } ) );
		}
	}
}

