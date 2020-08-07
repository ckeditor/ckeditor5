/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
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
		const editingView = editor.editing.view;

		// TODO The above default configuration value should be defined using editor.config.define() once it's fixed.
		const inputCommand = new InputCommand( editor, editor.config.get( 'typing.undoStep' ) || 20 );

		editor.commands.add( 'input', inputCommand );

		// injectUnsafeKeystrokesHandling( editor );
		// injectTypingMutationsHandling( editor );

		// TODO: Events to consider
		//
		// * insertCompositionText -> ?
		// * deleteCompositionText -> ?
		// * insertFromPaste -> that would go as insertContent()?
		// *
		editingView.document.on( 'beforeinput', ( evt, data ) => {
			const domEvent = data.domEvent;
			const { inputType } = domEvent;

			if ( !inputType.startsWith( 'insert' ) ) {
				return;
			}

			// For some input types the data is in domEvent.data. For some in the data transfer.
			const textData = domEvent.data || domEvent.dataTransfer && domEvent.dataTransfer.getData( 'text/plain' );
			const targetRanges = Array.from( domEvent.getTargetRanges() );
			const targetRange = targetRanges[ 0 ];
			let wasHandled;

			if ( inputType === 'insertText' ) {
				// This one is used by Chrome when typing accented letter (Mac).
				// This one is used by Safari when applying spell check (Mac).
				if ( !targetRange.collapsed ) {
					inputIntoTargetRange();
					wasHandled = true;
				}
				// This one is a regular typing.
				else {
					editor.execute( 'input', {
						text: textData
					} );

					wasHandled = true;
				}
			}
			// This one is used by Safari when typing accented letter (Mac).
			// This one is used by Chrome when applying spell check suggestion (Mac).
			else if ( inputType === 'insertReplacementText' ) {
				inputIntoTargetRange();
				wasHandled = true;
			}

			function inputIntoTargetRange() {
				// !!! TODO !!!
				// This is totally broken when a widget is selected because the target range
				// is anchored in the fake selection handler and the mapping does not make sense.
				const viewRange = editingView.domConverter.domRangeToView( targetRange );
				const modelRange = editor.editing.mapper.toModelRange( viewRange );

				editor.execute( 'input', {
					text: textData,
					range: modelRange
				} );
			}

			if ( wasHandled ) {
				evt.stop();

				// Without it, typing accented characters on Chrome does not work – the second beforeInput event
				// comes with a collapsed targetRange (should be expanded instead).
				data.preventDefault();
			}

			console.groupEnd();
		} );
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
