/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import TreeWalker from '../engine/model/treewalker.js';
import Position from '../engine/model/position.js';

export default class AutoformatEngine {
	/**
	 * Creates listener triggered on `change` event in document. Calls callback when inserted text matches regular expression.
	 *
	 * @param {core.editor.Editor} editor Editor instance.
	 * @param {Regex} regex Regular expression to exec on just inserted text.
	 * @param {Function} callback Callback to execute when text is matched.
	 */
	constructor ( editor, regex, callback ) {
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

				editor.document.enqueueChanges( () => {
					callback( batch, matched  );
				} );
			}
		} );
	}
}
