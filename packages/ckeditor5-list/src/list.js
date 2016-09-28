/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import Feature from '../core/feature.js';
import ListEngine from './listengine.js';
import ButtonController from '../ui/button/button.js';
import ButtonView from '../ui/button/buttonview.js';
import Model from '../ui/model.js';
import { parseKeystroke } from '../utils/keyboard.js';

/**
 * The list feature. It introduces the numbered and bulleted list buttons and the command that allows
 * to convert paragraphs to/from list items and indent/outdent them.
 *
 * @memberOf list
 * @extends core.Feature
 */
export default class List extends Feature {
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
		this._setButton( 'numberedList', 'numberedlist', t( 'Numbered List' ) );
		this._setButton( 'bulletedList', 'bulletedlist', t( 'Bulleted List' ) );

		const doc = this.editor.document;
		const selection = doc.selection;

		// Overwrite default enter key behavior.
		// If enter key is pressed with selection collapsed in empty list item, outdent it instead of breaking it.
		this.listenTo( this.editor.editing.view, 'enter', ( evt, data ) => {
			const positionParent = selection.getLastPosition().parent;

			if ( selection.isCollapsed && positionParent.name == 'listItem' && positionParent.isEmpty ) {
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
	 * Helper method for initializing a button and linking it with appropriate command.
	 *
	 * @private
	 * @param {String} commandName Name of the command.
	 * @param {String} iconName Name of the icon resource.
	 * @param {Object} label Button label.
	 */
	_setButton( commandName, iconName, label ) {
		const editor = this.editor;
		const command = editor.commands.get( commandName );

		// Create button model.
		const buttonModel = new Model( {
			isEnabled: true,
			isOn: false,
			label: label,
			icon: iconName
		} );

		// Bind button model to command.
		buttonModel.bind( 'isOn', 'isEnabled' ).to( command, 'value', 'isEnabled' );

		// Execute command.
		this.listenTo( buttonModel, 'execute', () => editor.execute( commandName ) );

		// Add button to feature components.
		editor.ui.featureComponents.add( commandName, ButtonController, ButtonView, buttonModel );
	}
}
