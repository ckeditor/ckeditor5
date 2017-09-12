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
 * The block autoformatting engine. It allows to format various block patterns. For example,
 * it can be configured to turn a paragraph starting with `*` and followed by a space into a list item.
 *
 * The autoformatting operation is integrated with the undo manager,
 * so the autoformatting step can be undone if the user's intention was not to format the text.
 *
 * See the constructors documentation to learn how to create custom inline autoformatters. You can also use
 * the {@link module:autoformat/autoformat~Autoformat} feature which enables a set of default autoformatters
 * (lists, headings, bold and italic).
 */
export default class BlockAutoformatEngine {
	/**
	 * Creates a listener triggered on `change` event in the document.
	 * Calls the callback when inserted text matches the regular expression or the command name
	 * if provided instead of the callback.
	 *
	 * Examples of usage:
	 *
	 * To convert a paragraph to heading 1 when `- ` is typed, using just the commmand name:
	 *
	 *		new BlockAutoformatEngine( editor, /^\- $/, 'heading1' );
	 *
	 * To convert a paragraph to heading 1 when `- ` is typed, using just the callback:
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
	 * @param {module:core/editor/editor~Editor} editor The editor instance.
	 * @param {RegExp} pattern The regular expression to execute on just inserted text.
	 * @param {Function|String} callbackOrCommand The callback to execute or the command to run when the text is matched.
	 * In case of providing the callback, it receives the following parameters:
	 * * {module:engine/model/batch~Batch} batch Newly created batch for autoformat changes.
	 * * {Object} match RegExp.exec() result of matching the pattern to inserted text.
	 */
	constructor( editor, pattern, callbackOrCommand ) {
		let callback;

		if ( typeof callbackOrCommand == 'function' ) {
			callback = callbackOrCommand;
		} else {
			// We assume that the actual command name was provided.
			const command = callbackOrCommand;

			callback = context => {
				const { batch } = context;

				// Create new batch for removal and command execution.
				editor.execute( command, { batch } );
			};
		}

		editor.document.on( 'change', ( event, type, changes, batch ) => {
			if ( batch.type == 'transparent' ) {
				return;
			}

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
				const fixBatch = editor.document.batch();

				// Matched range.
				const range = Range.createFromParentsAndOffsets( textNode.parent, 0, textNode.parent, match[ 0 ].length );

				// Remove matched text.
				fixBatch.remove( range );

				callback( { fixBatch, match } );
			} );
		} );
	}
}
