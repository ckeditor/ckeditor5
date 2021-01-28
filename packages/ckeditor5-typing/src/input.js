/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module typing/input
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import InputCommand from './inputcommand';

import injectUnsafeKeystrokesHandling from './utils/injectunsafekeystrokeshandling';
import injectTypingMutationsHandling from './utils/injecttypingmutationshandling';

/**
 * Handles text input coming from the keyboard or other input methods.
 *
 * @extends module:core/plugin~Plugin
 */
export default class Input extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get pluginName() {
		return 'Input';
	}

	/**
	 * @inheritDoc
	 */
	init() {
		const editor = this.editor;

		// TODO The above default configuration value should be defined using editor.config.define() once it's fixed.
		const inputCommand = new InputCommand( editor, editor.config.get( 'typing.undoStep' ) || 20 );

		editor.commands.add( 'input', inputCommand );

		injectUnsafeKeystrokesHandling( editor );
		injectTypingMutationsHandling( editor );
	}

	/**
	 * Checks batch if it is a result of user input - e.g. typing.
	 *
	 *		const input = editor.plugins.get( 'Input' );
	 *
	 *		editor.model.document.on( 'change:data', ( evt, batch ) => {
	 *			if ( input.isInput( batch ) ) {
	 *				console.log( 'The user typed something...' );
	 *			}
	 *		} );
	 *
	 * **Note:** This method checks if the batch was created using {@link module:typing/inputcommand~InputCommand 'input'}
	 * command as typing changes coming from user input are inserted to the document using that command.
	 *
	 * @param {module:engine/model/batch~Batch} batch A batch to check.
	 * @returns {Boolean}
	 */
	isInput( batch ) {
		const inputCommand = this.editor.commands.get( 'input' );

		return inputCommand._batches.has( batch );
	}
}
