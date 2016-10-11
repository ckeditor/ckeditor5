/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import Range from '../engine/model/range.js';
import LivePosition from '../engine/model/liveposition.js';

export default class AutoformatEngine {
	/**
	 * Creates listener triggered on `change` event in document. Calls callback when inserted text matches regular expression.
	 *
	 * @param {core.editor.Editor} editor Editor instance.
	 * @param {Regex} pattern Regular expression to exec on just inserted text.
	 * @param {Function|String} callbackOrCommand Callback to execute or command to run when text is matched.
	 */
	constructor( editor, pattern, callbackOrCommand ) {
		let callback;

		if ( typeof callbackOrCommand == 'function' ) {
			callback = callbackOrCommand;
		} else {
			// We assume that the actual command name was provided.
			const command = callbackOrCommand;

			callback = ( context ) => {
				const { batch, range } = context;

				// Remove matched pattern by default
				batch.remove( range );

				// Create new batch for removal and command execution.
				editor.execute( command, batch );
			};
		}

		editor.document.on( 'change', ( event, type, changes ) => {
			if ( type != 'insert' ) {
				return;
			}

			for ( let value of changes.range.getItems() ) {
				if ( !value.textNode ) {
					return;
				}

				const element = value.textNode;
				const text = element.data;

				if ( element.parent.name !== 'paragraph' || !text ) {
					return;
				}

				const match = pattern.exec( text );

				if ( !match ) {
					return;
				}

				// Get range of recently added text.
				editor.document.enqueueChanges( function() {
					const startPosition = LivePosition.createFromParentAndOffset( element.parent, element.startOffset );
					const range = Range.createFromPositionAndShift( startPosition, match[ 0 ].length );

					// Create new batch to separate typing batch from the Autoformat changes.
					const batch = editor.document.batch();

					callback( { batch, match, range, element } );
				} );
			}
		} );
	}
}
