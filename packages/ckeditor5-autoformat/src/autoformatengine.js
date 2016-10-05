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
	 * @param {Regex} regex Regular expression to exec on just inserted text.
	 * @param {Function} callback Callback to execute when text is matched.
	 */
	constructor ( editor, regex, callbackOrCommand ) {
		let callback;

		if ( typeof callbackOrCommand === 'function' ) {
			callback = callbackOrCommand;
		} else {
			const command = callbackOrCommand;

			callback = ( batch, matched, range ) => {
				batch.remove( range );
				editor.execute( command, {
					batch: batch
				} );
			};
		}

		editor.document.on( 'change', ( event, type, changes, batch ) => {
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

				let result = regex.exec( text );

				if ( !result ) {
					return;
				}

				const matched = result;

				let lastPath = _getLastPathPart( currentValue.nextPosition.path );
				let liveStartPosition = LivePosition.createFromParentAndOffset( currentValue.item.parent, lastPath + result.index );

				editor.document.enqueueChanges( () => {
					const range = Range.createFromPositionAndShift( liveStartPosition, matched[ 0 ].length );

					callback( batch, matched, range  );
				} );
			}
		} );
	}
}

function _getLastPathPart( path ) {
	return path[ path.length - 1 ];
}
