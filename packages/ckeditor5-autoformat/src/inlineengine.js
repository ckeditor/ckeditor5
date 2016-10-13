/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import Range from '../engine/model/range.js';

export default class InlineEngine {
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

		let previousPosition;
		let previousChar;

		editor.document.on( 'change', ( event, type, changes ) => {
			if ( type != 'insert' ) {
				return;
			}

			// TODO: Consider storing whole range objects instead of just end-position.
			const currentPosition = changes.range.end;

			// Set previous position if it isn't set, or parents are different (selection was moved to different parent).
			if ( !previousPosition || previousPosition.parent !== currentPosition.parent ) {
				previousPosition = currentPosition;
				previousChar = changes.range.getItems().next().value.data;

				return;
			}

			// Ignore first character, wait for more.
			// TODO: This must be connected with pattern.
			if ( currentPosition.offset < 2 ) {
				return;
			}

			const isCharacterAfter = currentPosition.isAfter( previousPosition );
			let currentChar = changes.range.getItems().next().value.data;

			// FIXME: Hardcoded character for testing. This should be regex matching.
			if ( isCharacterAfter &&
				currentChar === '*' &&
				previousChar === currentChar
			) {
				// We shift because `previousPosition` is end-position, but we want start position.
				const range = new Range( previousPosition.getShiftedBy( -1 ), currentPosition );

				editor.document.enqueueChanges( () => {
					// Create new batch to separate typing batch from the Autoformat changes.
					const batch = editor.document.batch();

					callback( { batch, range } );
				} );
			}

			// Last stage, when going out of this listener is to update previous values.
			previousPosition = currentPosition;
			previousChar = changes.range.getItems().next().value.data;
		} );
	}
}
