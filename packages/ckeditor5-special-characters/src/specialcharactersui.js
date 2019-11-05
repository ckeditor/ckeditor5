/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module special-characters/specialcharactersui
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview';
import specialCharactersIcon from '../theme/icons/specialcharacters.svg';

/**
 * The special characters UI plugin.
 *
 * @extends module:core/plugin~Plugin
 */
export default class SpecialCharactersUI extends Plugin {
	init() {
		const editor = this.editor;
		const t = editor.t;

		// Add the `specialCharacters` button to feature components.
		editor.ui.componentFactory.add( 'specialCharacters', locale => {
			const command = editor.commands.get( 'specialCharacters' );
			const view = new ButtonView( locale );

			view.set( {
				label: t( 'Special characters' ),
				icon: specialCharactersIcon,
				tooltip: true
			} );

			view.bind( 'isEnabled' ).to( command, 'isEnabled' );

			return view;
		} );
	}
}
