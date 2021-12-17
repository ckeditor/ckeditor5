/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module list/documentlist/utils/listwalker
 */

import { first } from 'ckeditor5/src/utils';

export default class ListWalker {
	constructor( startElement, options ) {
		this._startElement = startElement;
		this._startItemId = startElement.getAttribute( 'listItemId' );
		this._startIndent = startElement.getAttribute( 'listIndent' );

		this._isForward = options.direction == 'forward';
		this._includeSelf = !!options.includeSelf;
		this._sameItem = !!options.sameItem;
		this._sameIndent = !!options.sameIndent;
		this._smallerIndent = !!options.smallerIndent;
		this._biggerIndent = !!options.biggerIndent;
	}

	static first( startElement, options ) {
		return first( new this( startElement, options )[ Symbol.iterator ]() );
	}

	* [ Symbol.iterator ]() {
		const nestedItems = [];

		for ( const node of iterateSiblingListBlocks( this._getStartNode(), this._isForward ) ) {
			const indent = node.getAttribute( 'listIndent' );

			// Leaving a nested list.
			if ( indent < this._startIndent ) {
				// Abort searching blocks.
				if ( !this._smallerIndent ) {
					break;
				}
			}
			// Entering a nested list.
			else if ( indent > this._startIndent ) {
				// Ignore nested blocks.
				if ( !this._biggerIndent ) {
					continue;
				}

				// Collect nested blocks to verify if they are really nested, or it's a different item.
				if ( !this._isForward ) {
					nestedItems.push( node );

					continue;
				}
			}
			// Same indent level item.
			else /* if ( indent == this._startIndent ) */ {
				// Ignore same indent block.
				if ( !this._sameIndent ) {
					if ( this._smallerIndent ) {
						continue;
					} else if ( this._biggerIndent ) {
						break;
					}
				}

				// Abort if item has a different ID.
				if ( this._sameItem && node.getAttribute( 'listItemId' ) != this._startItemId ) {
					break;
				}
			}

			// There is another block for the same list item so the nested items were in the same list item.
			if ( nestedItems.length ) {
				yield* nestedItems;
				nestedItems.length = 0;
			}

			yield node;
		}
	}

	_getStartNode() {
		if ( this._includeSelf ) {
			return this._startElement;
		}

		return this._isForward ?
			this._startElement.nextSibling :
			this._startElement.previousSibling;
	}
}

function* iterateSiblingListBlocks( node, isForward ) {
	while ( node && node.hasAttribute( 'listItemId' ) ) {
		yield node;

		node = isForward ? node.nextSibling : node.previousSibling;
	}
}
