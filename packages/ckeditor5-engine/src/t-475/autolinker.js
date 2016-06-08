/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

import Feature from '../feature.js';
import TreeWalker from '../engine/model/treewalker.js';
import Position from '../engine/model/position.js';
import Range from '../engine/model/range.js';
import LivePosition from '../engine/model/liveposition.js';

const urlRegex = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/;

/**
 * Auto linking PoC.
 *
 * @extends ckeditor5.Feature
 */
export default class AutoLinker extends Feature {
	/**
	 * @inheritdoc
	 */
	init() {
		this.editor.document.on( 'change', ( event, type, changes, batch ) => {
			if ( type != 'insert' ) {
				return;
			}

			for ( let value of changes.range.getItems( { singleCharacters: true } ) ) {
				const walker = new TreeWalker( {
					direction: 'BACKWARD',
					startPosition: Position.createAfter( value )
				} );

				const currentValue = walker.next().value;
				const text = currentValue.item.text;

				if ( !text ) {
					return;
				}

				let matchedUrl = urlRegex.exec( text );

				if ( !matchedUrl ) {
					return;
				}

				const doc = this.editor.document;
				const url = matchedUrl[ 0 ];
				const offset = _getLastPathPart( currentValue.nextPosition.path ) + matchedUrl.index;
				const livePos = LivePosition.createFromParentAndOffset( currentValue.item.commonParent, offset  );

				doc.enqueueChanges( () => {
					const urlRange = Range.createFromPositionAndShift( livePos, url.length );
					batch.setAttr( 'link', url, urlRange );
				} );
			}
		} );
	}
}

function _getLastPathPart( path ) {
	return path[ path.length - 1 ];
}

