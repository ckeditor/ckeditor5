/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module list/listui
 */

import numberedListIcon from '../theme/icons/numberedlist.svg';
import bulletedListIcon from '../theme/icons/bulletedlist.svg';

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview';

/**
 * The list UI feature. It introduces the `'numberedList'` and `'bulletedList'` buttons that
 * allow to convert paragraphs to and from list items and indent or outdent them.
 *
 * @extends module:core/plugin~Plugin
 */
export default class ListUI extends Plugin {
	/**
	 * @inheritDoc
	 */
	init() {
		// Create two buttons and link them with numberedList and bulletedList commands.
		const t = this.editor.t;
		this._addButton( 'numberedList', t( 'Numbered List' ), numberedListIcon );
		this._addButton( 'bulletedList', t( 'Bulleted List' ), bulletedListIcon );
	}

	/**
	 * Helper method for initializing a button and linking it with an appropriate command.
	 *
	 * @private
	 * @param {String} commandName The name of the command.
	 * @param {Object} label The button label.
	 * @param {String} icon The source of the icon.
	 */
	_addButton( commandName, label, icon ) {
		const editor = this.editor;

		editor.ui.componentFactory.add( commandName, locale => {
			const command = editor.commands.get( commandName );

			const buttonView = new ButtonView( locale );

			buttonView.set( {
				label,
				icon,
				tooltip: true
			} );

			// Bind button model to command.
			buttonView.bind( 'isOn', 'isEnabled' ).to( command, 'value', 'isEnabled' );

			// Execute command.
			this.listenTo( buttonView, 'execute', () => editor.execute( commandName ) );

			return buttonView;
		} );
	}
}
