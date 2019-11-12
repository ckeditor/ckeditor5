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
import SelectView from '@ckeditor/ckeditor5-ui/src/selectview/selectview';

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

		const command = new InsertSpecialCharacterCommand( editor );
		editor.commands.add( 'specialCharacters', command );

		// Add the `specialCharacters` dropdown button to feature components.
		editor.ui.componentFactory.add( 'specialCharacters', locale => {
			// Prepare all special characters groups for displaying in the select view.
			const specialCharactersGroups = [ ...specialCharacterPlugin.getGroups() ]
				.map( groupName => ( { label: groupName, value: groupName } ) );

			const dropdownView = createDropdown( locale );
			const selectView = new SelectView( locale, specialCharactersGroups );

			dropdownView.buttonView.set( {
				label: t( 'Special characters' ),
				icon: specialCharactersIcon,
				tooltip: true
			} );

			dropdownView.bind( 'isEnabled' ).to( command );
			dropdownView.panelView.children.add( selectView );

			// When a special character was clicked, insert it to the editor.
			dropdownView.on( 'execute', ( evt, data ) => {
				console.log( 'Clicked.', data );

				// command.execute( { item: data } );
			} );

			dropdownView.on( 'change:isOpen', ( evt, name, isVisible ) => {
				if ( !isVisible ) {
					return;
				}

				// Draw special characters tiles when the dropdown is opened.
				printCharacters( selectView );
			} );

			// Draw special characters when a user changed a category.
			selectView.on( 'input', () => {
				printCharacters( selectView );
			} );

			return dropdownView;
		} );

		function printCharacters( selectView ) {
			const groupName = selectView.element.value;
			const characters = specialCharacterPlugin.getCharactersForGroup( groupName );

			console.log( { groupName, characters } );
			console.log( 'Draw!' );
		}
	}
}

