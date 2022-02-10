/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module list/documentlist/utils/listwalker
 */

import { first } from 'ckeditor5/src/utils';

/**
 * Document list blocks iterator.
 */
export default class ListWalker {
	/**
	 * Creates a document list iterator.
	 *
	 * @param {module:engine/model/element~Element} startElement The start list item block element.
	 * @param {Object} options
	 * @param {'forward'|'backward'} [options.direction='backward'] The iterating direction.
	 * @param {Boolean} [options.includeSelf=false] Whether start block should be included in the result (if it's matching other criteria).
	 * @param {Boolean} [options.sameItemId=false] Whether should return only blocks with the same `listItemId` attribute
	 * as the start element.
	 * @param {Boolean} [options.sameItemType=false] Whether should return only blocks wit the same `listType` attribute.
	 * @param {Boolean} [options.sameIndent=false] Whether blocks with the same indent level as the start block should be included
	 * in the result.
	 * @param {Boolean} [options.lowerIndent=false] Whether blocks with a lower indent level than the start block should be included
	 * in the result.
	 * @param {Boolean} [options.higherIndent=false] Whether blocks with a higher indent level than the start block should be included
	 * in the result.
	 */
	constructor( startElement, options ) {
		/**
		 * The start list item block element.
		 *
		 * @private
		 * @type {module:engine/model/element~Element}
		 */
		this._startElement = startElement;

		/**
		 * The reference indent. Initialized by the indent of the start block.
		 *
		 * @private
		 * @type {Number}
		 */
		this._referenceIndent = startElement.getAttribute( 'listIndent' );

		/**
		 * The `listItemId` of the start block.
		 *
		 * @private
		 * @type {String}
		 */
		this._startItemId = startElement.getAttribute( 'listItemId' );

		/**
		 * The `listType` of the start block.
		 *
		 * @private
		 * @type {String}
		 */
		this._startItemType = startElement.getAttribute( 'listType' );

		/**
		 * The iterating direction.
		 *
		 * @private
		 * @type {Boolean}
		 */
		this._isForward = options.direction == 'forward';

		/**
		 * Whether should return only blocks with the same `listItemId` attribute as the start element.
		 *
		 * @private
		 * @type {Boolean}
		 */
		this._includeSelf = !!options.includeSelf;

		/**
		 * Whether only blocks with the `listItemId` attribute same as the start element should be included.
		 *
		 * @private
		 * @type {Boolean}
		 */
		this._sameItemId = !!options.sameItemId;

		/**
		 * Whether should return only blocks wit the same `listType` attribute.
		 *
		 * @private
		 * @type {Boolean}
		 */
		this._sameItemType = !!options.sameItemType;

		/**
		 * Whether blocks with the same indent level as the start block should be included in the result.
		 *
		 * @private
		 * @type {Boolean}
		 */
		this._sameIndent = !!options.sameIndent;

		/**
		 * Whether blocks with a lower indent level than the start block should be included in the result.
		 *
		 * @private
		 * @type {Boolean}
		 */
		this._lowerIndent = !!options.lowerIndent;

		/**
		 * Whether blocks with a higher indent level than the start block should be included in the result.
		 *
		 * @private
		 * @type {Boolean}
		 */
		this._higherIndent = !!options.higherIndent;
	}

	/**
	 * Performs only first step of iteration and returns the result.
	 *
	 * @param {module:engine/model/element~Element} startElement The start list item block element.
	 * @param {Object} options
	 * @param {'forward'|'backward'} [options.direction='backward'] The iterating direction.
	 * @param {Boolean} [options.includeSelf=false] Whether start block should be included in the result (if it's matching other criteria).
	 * @param {Boolean} [options.sameItemId=false] Whether should return only blocks with the same `listItemId` attribute
	 * as the start element.
	 * @param {Boolean} [options.sameItemType=false] Whether should return only blocks wit the same `listType` attribute.
	 * @param {Boolean} [options.sameIndent=false] Whether blocks with the same indent level as the start block should be included
	 * in the result.
	 * @param {Boolean} [options.lowerIndent=false] Whether blocks with a lower indent level than the start block should be included
	 * in the result.
	 * @param {Boolean} [options.higherIndent=false] Whether blocks with a higher indent level than the start block should be included
	 * in the result.
	 * @returns {module:engine/model/element~Element|null}
	 */
	static first( startElement, options ) {
		const walker = new this( startElement, options );
		const iterator = walker[ Symbol.iterator ]();

		return first( iterator );
	}

	/**
	 * Iterable interface.
	 *
	 * @returns {Iterable.<module:engine/model/element~Element>}
	 */
	* [ Symbol.iterator ]() {
		const nestedItems = [];

		for ( const { node } of iterateSiblingListBlocks( this._getStartNode(), this._isForward ? 'forward' : 'backward' ) ) {
			const indent = node.getAttribute( 'listIndent' );

			// Leaving a nested list.
			if ( indent < this._referenceIndent ) {
				// Abort searching blocks.
				if ( !this._lowerIndent ) {
					break;
				}

				// While searching for lower indents, update the reference indent to find another parent in the next step.
				this._referenceIndent = indent;
			}
			// Entering a nested list.
			else if ( indent > this._referenceIndent ) {
				// Ignore nested blocks.
				if ( !this._higherIndent ) {
					continue;
				}

				// Collect nested blocks to verify if they are really nested, or it's a different item.
				if ( !this._isForward ) {
					nestedItems.push( node );

					continue;
				}
			}
			// Same indent level block.
			else {
				// Ignore same indent block.
				if ( !this._sameIndent ) {
					// While looking for nested blocks, stop iterating while encountering first same indent block.
					if ( this._higherIndent ) {
						// No more nested blocks so yield nested items.
						if ( nestedItems.length ) {
							yield* nestedItems;
							nestedItems.length = 0;
						}

						break;
					}

					continue;
				}

				// Abort if item has a different ID.
				if ( this._sameItemId && node.getAttribute( 'listItemId' ) != this._startItemId ) {
					break;
				}

				// Abort if item has a different type.
				if ( this._sameItemType && node.getAttribute( 'listType' ) != this._startItemType ) {
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

	/**
	 * Returns the model element to start iterating.
	 *
	 * @private
	 * @returns {module:engine/model/element~Element}
	 */
	_getStartNode() {
		if ( this._includeSelf ) {
			return this._startElement;
		}

		return this._isForward ?
			this._startElement.nextSibling :
			this._startElement.previousSibling;
	}
}

/**
 * Iterates sibling list blocks starting from the given node.
 *
 * @protected
 * @param {module:engine/model/node~Node} node The model node.
 * @param {'backward'|'forward'} direction Iteration direction.
 * @returns {Iterable.<Object>} The object with `node` and `previous` {@link module:engine/model/element~Element blocks}.
 */
export function* iterateSiblingListBlocks( node, direction ) {
	const isForward = direction == 'forward';
	let previous = null;

	while ( node && node.hasAttribute( 'listItemId' ) ) {
		yield { node, previous };

		previous = node;
		node = isForward ? node.nextSibling : node.previousSibling;
	}
}
