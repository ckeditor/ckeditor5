/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module list/list
 */

import Plugin from 'ckeditor5-core/src/plugin';
import ListEngine from './listengine';
import ButtonView from 'ckeditor5-ui/src/button/buttonview';
import { parseKeystroke } from 'ckeditor5-utils/src/keyboard';

/**
 * The lists feature. It introduces the `numberedList` and `bulletedList` buttons which
 * allows to convert paragraphs to/from list items and indent/outdent them.
 *
 * See also {@link module:list/listengine~ListEngine}.
 *
 * @extends module:core/plugin~Plugin
 */
export default class List extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get requires() {
		return [ ListEngine ];
	}

	/**
	 * @inheritDoc
	 */
	init() {
		// Create two buttons and link them with numberedList and bulletedList commands.
		const t = this.editor.t;
		this._addButton( 'numberedList', t( 'Numbered List' ) );
		this._addButton( 'bulletedList', t( 'Bulleted List' ) );

		// Overwrite default enter key behavior.
		// If enter key is pressed with selection collapsed in empty list item, outdent it instead of breaking it.
		this.listenTo( this.editor.editing.view, 'enter', ( evt, data ) => {
			const doc = this.editor.document;
			const positionParent = doc.selection.getLastPosition().parent;

			if ( doc.selection.isCollapsed && positionParent.name == 'listItem' && positionParent.isEmpty ) {
				this.editor.execute( 'outdentList' );

				data.preventDefault();
				evt.stop();
			}
		} );

		// Add tab key support.
		// When in list item, pressing tab should indent list item, if possible.
		// Pressing shift + tab shout outdent list item.
		this.listenTo( this.editor.editing.view, 'keydown', ( evt, data ) => {
			let commandName = null;

			if ( data.keystroke == parseKeystroke( 'tab' ) ) {
				commandName = 'indentList';
			} else if ( data.keystroke == parseKeystroke( 'Shift+tab' ) ) {
				commandName = 'outdentList';
			}

			if ( commandName ) {
				const command = this.editor.commands.get( commandName );

				if ( command.isEnabled ) {
					this.editor.execute( commandName );

					data.preventDefault();
					evt.stop();
				}
			}
		} );
	}

	/**
	 * Helper method for initializing a button and linking it with an appropriate command.
	 *
	 * @private
	 * @param {String} commandName Name of the command.
	 * @param {Object} label Button label.
	 */
	_addButton( commandName, label ) {
		const editor = this.editor;
		const command = editor.commands.get( commandName );

		editor.ui.componentFactory.add( commandName, ( locale ) => {
			const buttonView = new ButtonView( locale );

			buttonView.set( {
				label: label,
				icon: commandName.toLowerCase()
			} );

			// Bind button model to command.
			buttonView.bind( 'isOn', 'isEnabled' ).to( command, 'value', 'isEnabled' );

			// Execute command.
			this.listenTo( buttonView, 'execute', () => editor.execute( commandName ) );

			return buttonView;
		} );
	}
}
