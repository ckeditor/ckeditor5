/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module typing/input
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import InputCommand from './inputcommand';
import InsertTextCommand from './inserttextcommand';
import env from '@ckeditor/ckeditor5-utils/src/env';

import injectBeforeInputTypingHandling from './utils/input/injectbeforeinputtypinghandling';
import injectLegacyUnsafeKeystrokesHandling from './utils/input/injectlegacyunsafekeystrokeshandling';
import injectLegacyTypingMutationsHandling from './utils/input/injectlegacytypingmutationshandling';

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
	constructor( editor ) {
		super( editor );

		// TODO The configuration below should be defined using editor.config.define() once it's fixed.

		/**
		 * An internal reference to the `InputCommand` instance.
		 *
		 * @private
		 * @type {module:typing/inputcommand~InputCommand}
		 */
		this._inputCommand = new InputCommand( editor, editor.config.get( 'typing.undoStep' ) || 20 );

		/**
		 * An internal reference to the `InsertTextCommand` instance.
		 *
		 * @private
		 * @type {module:typing/inserttextcommand~InsertTextCommand}
		 */
		this._insertTextCommand = new InsertTextCommand( editor, editor.config.get( 'typing.undoStep' ) || 20 );
	}

	/**
	 * @inheritDoc
	 */
	init() {
		const editor = this.editor;
		const view = editor.editing.view;
		const viewDocument = view.document;

		editor.commands.add( 'input', this._inputCommand );
		editor.commands.add( 'insertText', this._insertTextCommand );

		// Use the beforeinput DOM event to handle input when supported by the browser.
		if ( env.features.isInputEventsLevel1Supported ) {
			injectBeforeInputTypingHandling( view );
		}
		// Fall back to the MutationObserver if beforeinput is not supported by the browser.
		else {
			injectLegacyUnsafeKeystrokesHandling( editor );
			injectLegacyTypingMutationsHandling( editor );
		}

		viewDocument.on( 'insertText', ( evt, data ) => {
			const { text, selection: viewSelection, resultRange: viewResultRange } = data;
			const insertTextEventData = { text };

			// If view selection was specified, translate it to model selection.
			if ( viewSelection ) {
				const modelRanges = [ ...viewSelection.getRanges() ].map( viewRange => {
					return editor.editing.mapper.toModelRange( viewRange );
				} );

				insertTextEventData.selection = editor.model.createSelection( modelRanges );
			}
			// If view selection was not specified, pass the current model selection on.
			else {
				insertTextEventData.selection = editor.model.createSelection( editor.model.document.selection );
			}

			if ( viewResultRange ) {
				insertTextEventData.resultRange = editor.editing.mapper.toModelRange( viewResultRange );
			}

			editor.execute( 'insertText', insertTextEventData );
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
	 * and {@link module:typing/inserttextcommand~InsertTextCommand 'insertText'} commands as typing changes coming from
	 * user input are inserted to the document using these commands.
	 *
	 * @param {module:engine/model/batch~Batch} batch A batch to check.
	 * @returns {Boolean}
	 */
	isInput( batch ) {
		return this._inputCommand._batches.has( batch ) || this._insertTextCommand._batches.has( batch );
	}
}

/**
 * Event fired when the user types text, for instance presses <kbd>A</kbd> or <kbd>?</kbd> in the
 * editing view document.
 *
 * **Note**: This event will **not** fire for keystrokes such as <kbd>Delete</kbd> or <kbd>Enter</kbd>.
 * They have dedicated events, see {@link module:engine/view/document~Document#event:delete} and
 * {@link module:engine/view/document~Document#event:enter} to learn more.
 *
 * **Note**: This event is fired by the {@link module:typing/input~Input input feature}.
 *
 * @event module:engine/view/document~Document#event:insertText
 * @param {module:engine/view/observer/domeventdata~DomEventData} data
 * @param {String} data.text The text to be inserted.
 * @param {module:engine/view/selection~Selection} [data.selection] The selection into which the text should be inserted.
 * If not specified, the insertion should occur at the current view selection.
 * @param {module:engine/view/range~Range} [data.resultRange] The range that view selection should be set to after insertion.
 */
