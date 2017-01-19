/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module autoformat/blockautoformatengine
 */

import Range from '@ckeditor/ckeditor5-engine/src/model/range';
import TextProxy from '@ckeditor/ckeditor5-engine/src/model/textproxy';

/**
 * The block autoformatting engine. Allows to format various block patterns. For example,
 * it can be configured to make a paragraph starting with "* " a list item.
 *
 * The autoformatting operation is integrated with the undo manager,
 * so the autoformatting step can be undone, if the user's intention wasn't to format the text.
 *
 * See the constructors documentation to learn how to create custom inline autoformatters. You can also use
 * the {@link module:autoformat/autoformat~Autoformat} feature which enables a set of default autoformatters
 * (lists, headings, bold and italic).
 */
export default class BlockAutoformatEngine {
	/**
	 * Creates listener triggered on `change` event in document.
	 * Calls callback when inserted text matches regular expression or command name
	 * if provided instead of callback.
	 *
	 * Examples of usage:
	 *
	 * To convert paragraph to heading1 when `- ` is typed, using just commmand name:
	 *
	 *		new BlockAutoformatEngine( editor, /^\- $/, 'heading1' );
	 *
	 * To convert paragraph to heading1 when `- ` is typed, using just callback:
	 *
	 *		new BlockAutoformatEngine( editor, /^\- $/, ( context ) => {
	 *			const { batch, match } = context;
	 *			const headingLevel = match[ 1 ].length;
	 *
	 *			editor.execute( 'heading', {
	 *				batch,
	 *				formatId: `heading${ headingLevel }`
	 *			} );
	 * 		} );
	 *
	 * @param {module:core/editor/editor~Editor} editor Editor instance.
	 * @param {RegExp} pattern Regular expression to exec on just inserted text.
	 * @param {Function|String} callbackOrCommand Callback to execute or command to run when text is matched.
	 * In case of providing callback it receives following parameters:
	 * * {module:engine/model/batch~Batch} batch Newly created batch for autoformat changes.
	 * * {Object} match RegExp.exec() result of matching pattern to inserted text.
	 */
	constructor( editor, pattern, callbackOrCommand ) {
		let callback;

		if ( typeof callbackOrCommand == 'function' ) {
			callback = callbackOrCommand;
		} else {
			// We assume that the actual command name was provided.
			const command = callbackOrCommand;

			callback = ( context ) => {
				const { batch } = context;

				// Create new batch for removal and command execution.
				editor.execute( command, { batch } );
			};
		}

		editor.document.on( 'change', ( event, type, changes ) => {
			if ( type != 'insert' ) {
				return;
			}

			// Take the first element. Typing shouldn't add more than one element at once.
			// And if it is not typing (e.g. paste), Autoformat should not be fired.
			const value = changes.range.getItems().next().value;

			if ( !( value instanceof TextProxy ) ) {
				return;
			}

			const textNode = value.textNode;
			const text = textNode.data;

			// Run matching only on non-empty paragraphs.
			if ( textNode.parent.name !== 'paragraph' || !text ) {
				return;
			}

			const match = pattern.exec( text );

			if ( !match ) {
				return;
			}

			editor.document.enqueueChanges( () => {
				// Create new batch to separate typing batch from the Autoformat changes.
				const batch = editor.document.batch();

				// Matched range.
				const range = Range.createFromParentsAndOffsets( textNode.parent, 0, textNode.parent, match[ 0 ].length );

				// Remove matched text.
				batch.remove( range );

				callback( { batch, match } );
			} );
		} );
	}
}
