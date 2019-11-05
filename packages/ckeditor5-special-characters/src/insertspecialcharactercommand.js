/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module special-characters/insertspecialcharactercommand
 */

import Command from '@ckeditor/ckeditor5-core/src/command';

/**
 * @extends module:core/command~Command
 */
export default class InsertSpecialCharacterCommand extends Command {
	/**
	 * Creates an instance of the command.
	 *
	 * @param {module:core/editor/editor~Editor} editor
	 */
	constructor( editor ) {
		super( editor );

		/**
		 * @readonly
		 * @private
		 * @member {module:typing/inputcommand~InputCommand} #_inputCommand
		 */
		this._inputCommand = editor.commands.get( 'input' );
	}

	/**
	 * @inheritDoc
	 */
	refresh() {
		this.isEnabled = this._inputCommand.isEnabled;
	}

	/**
	 * @param {Object} options
	 * @param {String} options.item A title of the special character that should be added to the editor.
	 */
	execute( options ) {
		const editor = this.editor;
		const item = options.item;

		if ( !item ) {
			return;
		}

		const character = editor.plugins.get( 'SpecialCharacters' ).getCharacter( item );

		if ( !character ) {
			return;
		}

		this._inputCommand.execute( { text: character } );
	}
}
