/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module list/list
 */

import ListEngine from './listengine';

import numberedListIcon from '../theme/icons/numberedlist.svg';
import bulletedListIcon from '../theme/icons/bulletedlist.svg';

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview';

/**
 * The list feature. It introduces the `numberedList` and `bulletedList` buttons that
 * allow to convert paragraphs to and from list items and indent or outdent them.
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
	static get pluginName() {
		return 'List';
	}

	/**
	 * @inheritDoc
	 */
	init() {
		// Create two buttons and link them with numberedList and bulletedList commands.
		const t = this.editor.t;
		this._addButton( 'numberedList', t( 'Numbered List' ), numberedListIcon );
		this._addButton( 'bulletedList', t( 'Bulleted List' ), bulletedListIcon );

		// Overwrite default Enter key behavior.
		// If Enter key is pressed with selection collapsed in empty list item, outdent it instead of breaking it.
		this.listenTo( this.editor.editing.view, 'enter', ( evt, data ) => {
			const doc = this.editor.document;
			const positionParent = doc.selection.getLastPosition().parent;

			if ( doc.selection.isCollapsed && positionParent.name == 'listItem' && positionParent.isEmpty ) {
				this.editor.execute( 'outdentList' );

				data.preventDefault();
				evt.stop();
			}
		} );

		const getCommandExecuter = commandName => {
			return ( data, cancel ) => {
				const command = this.editor.commands.get( commandName );

				if ( command.isEnabled ) {
					this.editor.execute( commandName );
					cancel();
				}
			};
		};

		this.editor.keystrokes.set( 'Tab', getCommandExecuter( 'indentList' ) );
		this.editor.keystrokes.set( 'Shift+Tab', getCommandExecuter( 'outdentList' ) );
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
		const command = editor.commands.get( commandName );

		editor.ui.componentFactory.add( commandName, locale => {
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
