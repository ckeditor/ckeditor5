/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import Range from '../engine/model/range.js';
import TextProxy from '../engine/model/textproxy.js';

export default class AutoformatEngine {
	/**
	 * Creates listener triggered on `change` event in document. Calls callback when inserted text matches regular expression.
	 *
	 * @param {core.editor.Editor} editor Editor instance.
	 * @param {Regex} pattern Regular expression to exec on just inserted text.
	 * @param {Function|String} callbackOrCommand Callback to execute or command to run when text is matched.
	 * In case of providing callback it receives following parameters:
	 * * {engine.model.Batch} batch Newly created batch for autoformat changes.
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

			editor.document.enqueueChanges( function() {
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
