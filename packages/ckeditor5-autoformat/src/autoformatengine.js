/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import TreeWalker from '../engine/model/treewalker.js';
import Position from '../engine/model/position.js';
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

			for ( let value of changes.range.getItems( { singleCharacters: true } ) ) {
				const walker = new TreeWalker( {
					direction: 'backward',
					startPosition: Position.createAfter( value )
				} );
				const currentValue = walker.next().value;
				const text = currentValue.item.data;

				if ( !text ) {
					return;
				}

				const match = pattern.exec( text );

				if ( !match ) {
					return;
				}

				// Get range of recently added text.
				let lastPath = _getLastPathPart( currentValue.nextPosition.path );
				let liveStartPosition = LivePosition.createFromParentAndOffset( currentValue.item.parent, lastPath + match.index );

				editor.document.enqueueChanges( function() {
					const range = Range.createFromPositionAndShift( liveStartPosition, match[ 0 ].length );
					const element = currentValue.item;

					// Create new batch to separate typing batch from the Autoformat changes.
					const batch = editor.document.batch();

					callback( { batch, match, range, element } );
				} );
			}
		} );
	}
}

function _getLastPathPart( path ) {
	return path[ path.length - 1 ];
}
